import OpenAI from 'openai';
import { Note } from '../utils';

export interface Alert {
  alert_id: string;
  alert_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  patient_id: string;
  roles_involved: string[];
  conflicting_facts: any[];
  conflicting_fact_types?: string[];
  time_window: string;
  source_note_ids: string[];
  description: string;
  timestamp: string;
  clinical_score?: number;
}

export class LLMDriftDetectionService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY not found in environment variables. Please add your API key to .env.local file.'
      );
    }
    this.client = new OpenAI({ apiKey: apiKey.trim() });
  }

  async detectDrift(notes: Note[]): Promise<Alert[]> {
    // Group notes by patient
    const notesByPatient: Record<string, Note[]> = {};
    notes.forEach(note => {
      if (!notesByPatient[note.patient_id]) {
        notesByPatient[note.patient_id] = [];
      }
      notesByPatient[note.patient_id].push(note);
    });

    const allAlerts: Alert[] = [];

    // Process each patient's notes
    for (const [patientId, patientNotes] of Object.entries(notesByPatient)) {
      // Sort notes by timestamp
      patientNotes.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      try {
        const alerts = await this.analyzePatientNotes(patientId, patientNotes);
        allAlerts.push(...alerts);
      } catch (error: any) {
        console.error(`Error analyzing patient ${patientId}:`, error);
        // Continue with other patients even if one fails
      }
    }

    return allAlerts;
  }

  private async analyzePatientNotes(patientId: string, notes: Note[]): Promise<Alert[]> {
    // Format notes for LLM with actual note IDs and ISO timestamps
    const notesText = notes.map((note, idx) => {
      const iso = new Date(note.timestamp).toISOString();
      return `Note ${idx + 1} [${note.note_id}] (${note.author_role}, ${iso}):
${note.note_text}`;
    }).join('\n\n');

    const prompt = `You are a hospital clinical documentation drift detector.
Your job is to detect TRUE communication drift or safety-relevant contradictions across notes.

IMPORTANT CLINICAL GUARDRAILS:
- Do NOT flag normal progression over time (e.g., RA in ED -> oxygen later).
- Do NOT flag non-exclusive routine plans as contradictions (NPO, IVF, antibiotics, monitoring, PRN meds).
- A "contradiction" requires mutually incompatible claims about CURRENT state/plan.
- "Worsening symptoms" alone is NOT a contradiction with NPO. It may indicate deterioration ONLY if an earlier clinician claimed improvement/stability/discharge readiness without acknowledging the later worsening.
- Prefer the smallest number of high-quality alerts. If uncertain, output fewer alerts.

ALERT TYPES (use only these unless absolutely necessary):
- plan_communication_drift: patient/team mismatch about plan (e.g., patient believes surgery this morning vs surgery consult says no OR today). HIGH severity when patient expectation conflicts with documented plan.
- discharge_safety_conflict: discharge/readiness stated while instability exists (O2 >= 4L, SpO2 < 88, hypotension, severe symptoms, etc).
- unacknowledged_deterioration: later note shows objective worsening (vitals/O2/severe symptoms) that is not reconciled by later provider notes that still describe stable/improving/discharge-ready. HIGH severity when MD frames "improving, discharge tomorrow" while RT/RN document exertional desaturation to 86–87% and inability to wean.
- oxygen_support_drift: conflicting oxygen support levels (e.g., MD documents "on 2L NC, SpO2 95%" while RN/RT document 4L NC and exertional desats). MEDIUM or HIGH severity depending on clinical impact.
- symptom_progression_conflict: symptom worsening (pain, nausea, distention) with objective signs (HR >= 110, distention) that contradicts earlier stable/improving narrative. MEDIUM severity when RN documents worsening pain 8/10 + HR 116 + increasing distention while MD shortly after says "pain improved" without acknowledging trajectory change.
- medication_plan_conflict: incompatible med orders/administration vs documented plan (e.g., "hold anticoag" vs "given dose").
- workup_plan_conflict: conflicting statements about whether key workup is needed/done (e.g., "CTA negative" vs "CTA pending").
- documentation_source_conflict: "per chart" vs bedside measurement causing state mismatch.

KEY DETECTION RULES:
1. OXYGEN SUPPORT DRIFT: Flag when different roles document different oxygen support levels (e.g., MD: 2L NC vs RN/RT: 4L NC) especially if exertional desaturations are documented. This is NOT normal progression if both claims are about CURRENT state.
2. UNACKNOWLEDGED DETERIORATION: Flag when RT/RN document exertional desaturation to 86–87% and inability to wean, while MD note frames "improving, discharge tomorrow" - this is HIGH severity unacknowledged deterioration.
3. PLAN COMMUNICATION DRIFT: Flag when RN documents patient believes surgery this morning while surgery consult says no OR today - this is HIGH severity plan communication drift.
4. SYMPTOM PROGRESSION CONFLICT: Flag when RN documents worsening pain 8/10 + HR 116 + increasing distention, while MD shortly after says "pain improved" and continues plan without acknowledging trajectory change - this is MEDIUM severity symptom progression conflict.

PATIENT NOTES:
${notesText}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object: { "alerts": [...] }.
Each alert must include:
- alert_id (unique)
- alert_type (one of the allowed types)
- severity: critical|high|medium|low
- patient_id: "${patientId}"
- roles_involved: string[]
- conflicting_facts: [{ role, fact: { type, value, details, source_quote }, note_id, note_timestamp }]
- conflicting_fact_types: string[]
- time_window: string
- source_note_ids: string[]
- description: string
- timestamp: ISO timestamp of most recent involved note
- clinical_score: 1-10

CITATION RULE (CRITICAL):
You MUST use the EXACT note_id shown in the note header. For example, if the note header says [DX-401-n-001], you MUST use "DX-401-n-001" exactly. Do NOT change the prefix (DX, CX, etc.) or invent note IDs. Copy the note_id EXACTLY as it appears in brackets [ ] in the note header.

QUALITY RULE:
If you cannot quote exact text for each side of a conflict, do not create the alert.

SPECIFIC ALERT PATTERNS TO DETECT:
1. OXYGEN SUPPORT DRIFT: When MD documents lower oxygen support (e.g., "on 2L NC, SpO2 95%") while RN/RT document higher support (e.g., "4L NC") with exertional desaturations, flag as oxygen_support_drift (MEDIUM or HIGH). This is NOT normal progression if both claims are about CURRENT state.

2. UNACKNOWLEDGED DETERIORATION: When RT/RN document exertional desaturation to 86–87% and inability to wean, while MD note frames "improving, discharge tomorrow" - flag as unacknowledged_deterioration (HIGH). This is a critical safety issue.

3. PLAN COMMUNICATION DRIFT: When RN documents patient believes surgery this morning while surgery consult says no OR today - flag as plan_communication_drift (HIGH). This indicates communication failure.

4. SYMPTOM PROGRESSION CONFLICT: When RN documents worsening pain 8/10 + HR 116 + increasing distention, while MD shortly after says "pain improved" without acknowledging trajectory change - flag as symptom_progression_conflict (MEDIUM). The objective signs (HR 116, distention) plus symptom worsening contradict the "improved" narrative.

IMPORTANT: Do NOT create alerts when:
- All notes are consistent and show improvement (e.g., improvement, vitals normalize, nursing aligns with plan) → 0 alerts
- Later notes provide quantitative confirmation of earlier qualitative improvement
- Normal progression over time (earlier lower support → later higher support is progression, not drift, unless both claim CURRENT state)

Example format:
{
  "alerts": [
    {
      "alert_id": "alert_${patientId}_CX-301-n-001_CX-301-n-002",
      "alert_type": "plan_communication_drift",
      "severity": "high",
      "patient_id": "${patientId}",
      "roles_involved": ["ED_MD", "RN"],
      "conflicting_facts": [
        {
          "role": "ED_MD",
          "fact": {
            "type": "treatment_plan",
            "value": "surgery today",
            "details": "ED documented possible surgery today",
            "source_quote": "consult surgery for possible cholecystectomy today"
          },
          "note_id": "USE_ACTUAL_NOTE_ID_FROM_HEADER_ABOVE",
          "note_timestamp": "2026-02-21T06:42:00.000Z"
        },
        {
          "role": "RN",
          "fact": {
            "type": "patient_communication",
            "value": "patient confused about surgery",
            "details": "Patient told surgery today but not happening",
            "source_quote": "Patient states, 'ED doctor said I'm going to surgery this morning'"
          },
          "note_id": "USE_ACTUAL_NOTE_ID_FROM_HEADER_ABOVE",
          "note_timestamp": "2026-02-21T09:10:00.000Z"
        }
      ],
      "conflicting_fact_types": ["treatment_plan", "patient_communication"],
      "time_window": "2.5 hours",
      "source_note_ids": ["USE_ACTUAL_NOTE_ID_FROM_HEADER_ABOVE", "USE_ACTUAL_NOTE_ID_FROM_HEADER_ABOVE"],
      "description": "ED documented possible surgery today, but patient reports confusion as surgery did not occur",
      "timestamp": "2026-02-21T09:10:00.000Z",
      "clinical_score": 7
    }
  ]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-5.1',
        messages: [
          {
            role: 'system',
            content: 'You are a clinical decision support system. Analyze patient notes and return only valid JSON. Return a JSON object with an "alerts" array. Be precise and only flag real contradictions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn(`No response from LLM for patient ${patientId}`);
        return [];
      }

      // Parse JSON response - expect { alerts: [...] } format
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        console.error(`Could not parse LLM response for patient ${patientId}:`, content);
        return [];
      }

      // Extract alerts array
      const alerts = Array.isArray(parsed?.alerts) ? parsed.alerts : [];
      
      if (alerts.length === 0) {
        return [];
      }

      // Post-filter: Remove bad alert classes
      const filteredAlerts = alerts.filter((alert: any) => {
        // Suppress "plan contradiction" when plan is non-exclusive
        if (alert.conflicting_fact_types && Array.isArray(alert.conflicting_fact_types)) {
          const hasTreatmentPlan = alert.conflicting_fact_types.includes('treatment_plan') || 
                                   alert.conflicting_fact_types.some((t: string) => t.toLowerCase().includes('plan'));
          const hasPatientStatus = alert.conflicting_fact_types.includes('patient_status') ||
                                  alert.conflicting_fact_types.some((t: string) => t.toLowerCase().includes('status') || 
                                                                   t.toLowerCase().includes('symptom'));
          
          if (hasTreatmentPlan && hasPatientStatus) {
            // Check if plan contains non-exclusive routine care
            const planValues = alert.conflicting_facts
              ?.filter((cf: any) => cf.fact?.type?.toLowerCase().includes('plan') || 
                               cf.fact?.value?.toLowerCase().includes('npo') ||
                               cf.fact?.value?.toLowerCase().includes('ivf') ||
                               cf.fact?.value?.toLowerCase().includes('monitor'))
              .map((cf: any) => (cf.fact?.value || '').toLowerCase())
              .join(' ') || '';
            
            const isNonExclusivePlan = /npo|ivf|monitor|prn|antibiotic|pain\s+control/.test(planValues);
            
            if (isNonExclusivePlan) {
              // Only keep if it also includes discharge plan, improvement claim, or vital instability
              const hasDischargePlan = alert.description?.toLowerCase().includes('discharge') ||
                                      alert.conflicting_facts?.some((cf: any) => 
                                        cf.fact?.value?.toLowerCase().includes('discharge'));
              const hasImprovementClaim = alert.conflicting_facts?.some((cf: any) =>
                                        /improving|stable|better|resolved/.test(cf.fact?.value?.toLowerCase() || ''));
              const hasVitalInstability = alert.conflicting_facts?.some((cf: any) =>
                                        /spo2\s*<|hr\s*>\s*110|hypotension|desat/.test(cf.fact?.value?.toLowerCase() || ''));
              
              if (!hasDischargePlan && !hasImprovementClaim && !hasVitalInstability) {
                console.log(`Filtering out non-exclusive plan alert: ${alert.alert_id}`);
                return false;
              }
            }
          }
        }
        
        return true;
      });

      // Extract patient ID prefix from actual notes (e.g., "DX" from "DX-401")
      const getPatientIdPrefix = (): string | null => {
        if (notes.length === 0) return null;
        const firstNoteId = notes[0].note_id;
        const match = firstNoteId.match(/^([A-Z]+)-\d+/);
        return match ? match[1] : null;
      };

      // Helper function to find correct note ID (fixes common LLM mistakes)
      const findCorrectNoteId = (wrongId: string): string | null => {
        // First try exact match
        if (notes.some(n => n.note_id === wrongId)) {
          return wrongId;
        }
        
        // Extract the pattern: PREFIX-PATIENT-NOTE
        const match = wrongId.match(/^([A-Z]+)-(\d+)-n-(\d+)$/);
        if (match) {
          const [, wrongPrefix, patientNum, noteNum] = match;
          
          // Get the correct prefix from actual notes
          const correctPrefix = getPatientIdPrefix();
          if (correctPrefix && wrongPrefix !== correctPrefix) {
            // Construct the correct note ID using the actual patient ID format
            const correctNoteId = `${correctPrefix}-${patientNum}-n-${noteNum}`;
            
            // Verify this note ID exists
            if (notes.some(n => n.note_id === correctNoteId)) {
              console.log(`Fixed note ID: ${wrongId} -> ${correctNoteId}`);
              return correctNoteId;
            }
          }
          
          // If prefix correction didn't work, try to find by patient number and note number
          const correctNote = notes.find(n => {
            const noteMatch = n.note_id.match(/^([A-Z]+)-(\d+)-n-(\d+)$/);
            if (noteMatch) {
              const [, , correctPatientNum, correctNoteNum] = noteMatch;
              return correctPatientNum === patientNum && correctNoteNum === noteNum;
            }
            return false;
          });
          
          if (correctNote) {
            console.log(`Fixed note ID: ${wrongId} -> ${correctNote.note_id}`);
            return correctNote.note_id;
          }
        }
        
        return null;
      };

      // Verify note IDs exist and fix timestamps
      const validatedAlerts = filteredAlerts.map((alert: any) => {
        // Verify and fix source_note_ids
        if (alert.source_note_ids && Array.isArray(alert.source_note_ids)) {
          alert.source_note_ids = alert.source_note_ids
            .map((id: string) => {
              const correctId = findCorrectNoteId(id);
              return correctId || id;
            })
            .filter((id: string) => {
              const exists = notes.some(n => n.note_id === id);
              if (!exists) {
                console.warn(`Alert ${alert.alert_id} references non-existent note_id: ${id}`);
              }
              return exists;
            });
        }

        // Fix conflicting_facts note_ids and timestamps
        if (alert.conflicting_facts && Array.isArray(alert.conflicting_facts)) {
          alert.conflicting_facts = alert.conflicting_facts.map((cf: any) => {
            if (cf.note_id) {
              const correctId = findCorrectNoteId(cf.note_id);
              if (correctId && correctId !== cf.note_id) {
                cf.note_id = correctId;
              }
              
              const note = notes.find(n => n.note_id === (correctId || cf.note_id));
              if (note) {
                cf.note_timestamp = note.timestamp;
              } else {
                console.warn(`Conflicting fact references non-existent note_id: ${cf.note_id}`);
              }
            }
            return cf;
          });
        }

        return alert;
      });

      return validatedAlerts;
    } catch (error: any) {
      console.error(`Error calling LLM for patient ${patientId}:`, error);
      return [];
    }
  }
}
