import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { loadNotes, getNotesHash } from '../../../../../lib/utils';
import { LLMDriftDetectionService } from '../../../../../lib/services/llm-drift-detection';

// Enable caching for this route
export const revalidate = 1800; // Revalidate every 30 minutes

// Simple in-memory cache for patient summaries (resets on each cold start)
const summaryCache: Record<string, { data: any; timestamp: number; notesHash: string }> = {};

async function generateReconciliationBrief(
  notes: any[],
  alerts: any[],
  patientId: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return 'Unable to generate summary: API key not configured';
  }

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const client = new OpenAI({ apiKey: cleanKey });

  // Prepare notes summary for brief generation
  const notesSummary = notes.map(note => ({
    role: note.author_role,
    timestamp: note.timestamp,
    text: note.note_text.substring(0, 200) + '...', // Truncate for brevity
  }));

  // Prepare alerts summary
  const alertsSummary: any[] = [];
  for (const alert of alerts) {
    alertsSummary.push({
      type: alert.alert_type,
      description: alert.description,
      roles: alert.roles_involved || [],
    });
  }

  const prompt = `You are generating a neutral, evidence-grounded reconciliation brief for clinical documentation review.

CRITICAL RULES:
1. Use ONLY the facts provided below
2. Do NOT infer, diagnose, or recommend
3. Use neutral, factual language
4. Explicitly state uncertainty when facts conflict
5. This is a communication artifact, NOT medical advice

Clinical Notes Summary:
${JSON.stringify(notesSummary, null, 2)}

Documentation Divergence Alerts:
${JSON.stringify(alertsSummary, null, 2)}

Generate a brief (2-3 sentences) that:
- Summarizes the documentation patterns observed
- Highlights any documented divergences
- Uses neutral language
- Cites specific observations without interpretation

Output format:
Brief: [your brief here]`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        {
          role: 'system',
          content:
            'You generate neutral, evidence-based summaries. No medical inference or recommendations.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    let brief = response.choices[0].message.content || '';
    if (brief.includes('Brief:')) {
      brief = brief.split('Brief:')[1].trim();
    }

    return brief;
  } catch (error: any) {
    const errorMsg = error.message || '';
    if (errorMsg.includes('API key') || errorMsg.toLowerCase().includes('authentication')) {
      return 'Unable to generate summary: OpenAI API key not configured. Please add your API key to .env.local file.';
    }
    return `Error generating summary: ${errorMsg}`;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    
    // Check if notes have changed
    const currentNotesHash = getNotesHash();
    
    // Check cache first
    const cached = summaryCache[patientId];
    if (cached && Date.now() - cached.timestamp < 1800000 && cached.notesHash === currentNotesHash) {
      // 30 minutes AND notes haven't changed
      console.log(`Returning cached patient summary for ${patientId} (notes unchanged)`);
      const response = NextResponse.json(cached.data);
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Notes-Hash', currentNotesHash);
      return response;
    }
    
    if (cached && cached.notesHash !== currentNotesHash) {
      console.log(`Notes changed for patient ${patientId}, regenerating summary...`);
    }
    
    const notes = loadNotes();
    const patientNotes = notes.filter((n) => n.patient_id === patientId);

    if (patientNotes.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    try {
      // Get alerts using LLM-based service
      console.log(`Detecting drift for patient ${patientId} using LLM...`);
      const driftService = new LLMDriftDetectionService();
      const alerts = await driftService.detectDrift(patientNotes);

      // Generate brief
      const brief = await generateReconciliationBrief(patientNotes, alerts, patientId);

      const result = {
        patient_id: patientId,
        name: patientNotes[0].patient_name || 'Unknown',
        note_count: patientNotes.length,
        alert_count: alerts.length,
        reconciliation_brief: brief,
        alerts: alerts,
      };
      
      // Cache the result with current notes hash
      summaryCache[patientId] = {
        data: result,
        timestamp: Date.now(),
        notesHash: currentNotesHash,
      };

      const response = NextResponse.json(result);
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Notes-Hash', currentNotesHash);
      return response;
    } catch (error: any) {
      console.error(`Error in get_patient_summary: ${error}`);
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error(`Error in get_patient_summary: ${error}`);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
