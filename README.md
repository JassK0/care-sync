# Care Sync - Clinical Narrative Drift Detector

A hallucination-safe, enterprise-oriented AI system that detects clinical narrative drift across hospital roles (physicians, nurses, allied health). This demonstration uses synthetic data; the system is designed to integrate with hospital information systems like Oracle Health (Cerner), Epic, and other EHR platforms.

## What Inspired the Project

Through personal experience dealing with doctors, nurses, and specialists, I've witnessed a recurring problem: **all parties don't have the same information, aren't on the same page, or don't consult with each other before speaking with patients or their families.** This has led to miscommunication between staff members and confusion for patients and families.

My family members who work in healthcare have repeatedly expressed frustration with this issue - a problem that has persisted without a clear solution. In busy hospital environments, different clinicians document patient status at different times, and without a system to catch inconsistencies, critical information gaps can go unnoticed until they cause problems.

### The Real-World Impact:

- Patients and families receive conflicting information from different providers
- Care teams make decisions without full context from all team members
- Critical patient status changes go unacknowledged between shifts
- These communication gaps can contribute to hospital mishaps and medical errors

**Care Sync was built to solve this problem** by analyzing and alerting on notes as they come in, in real-time. The system automatically detects when different clinicians document conflicting information or when critical updates aren't acknowledged across the care team.

**Beyond Communication:** By providing real-time alerts and creating an audit trail of documentation inconsistencies, Care Sync helps reduce hospital mishaps, supports accountability, and can even help prevent malpractice by ensuring all care team members have access to the same information and are aware of contradictions before they impact patient care.

## The Idea

Care Sync is an AI-powered clinical decision support system that **analyzes and alerts on notes as they come in, in real-time**. The system processes time-stamped clinical notes from multiple healthcare roles to detect documentation drift and contradictions as they occur. The system:

1. **Real-Time Analysis:** Analyzes notes as they are entered into the EHR system, providing immediate alerts when contradictions are detected
2. **Extracts Clinical Facts:** Uses LLM-based extraction to identify key clinical facts (vital signs, symptoms, treatment plans, oxygen requirements, stability assessments) from each note
3. **Detects Contradictions:** Analyzes notes across roles and time windows to identify mutually incompatible claims about patient status or care plans
4. **Generates Alerts:** Creates prioritized alerts (CRITICAL, HIGH, MEDIUM, LOW) based on clinical severity and potential safety impact
5. **Provides Evidence:** Links each alert to verbatim source quotes from the conflicting notes, ensuring traceability and clinical defensibility
6. **Creates Audit Trail:** Documents all detected inconsistencies, helping hold staff accountable and providing a record for quality improvement and risk management

**Important:** This system does NOT perform diagnosis, prognosis, or treatment recommendations. It only flags documentation inconsistencies for clinical review.

## How I Built It

Care Sync was built using a modern, scalable architecture:

### Frontend
- Next.js 14
- React 18
- TypeScript
- Cerner-style UI

### AI/ML
- OpenAI GPT-5.1
- LLM-based drift detection
- Structured fact extraction
- Clinical guardrails

### Backend
- Next.js API Routes
- Serverless functions
- Vercel deployment
- In-memory caching

### Data
- Synthetic clinical notes (demo)
- Multi-role documentation
- Time-stamped entries
- Designed for EHR integration

### Dataset Structure

**Demonstration Dataset:** This project uses a synthetic dataset structured as JSON with the following format:

```json
{
  "patients": [
    {
      "patient_id": "DX-401",
      "patient_name": "Marcus Lee",
      "mrn": "MRN-904112",
      "admission_date": "2026-02-22",
      "diagnosis": "...",
      "notes": [
        {
          "note_id": "DX-401-n-001",
          "timestamp": "2026-02-22T06:18:00",
          "author_role": "ED_MD",
          "note_text": "ED Provider Note: ..."
        }
      ]
    }
  ]
}
```

Each note includes:
- **note_id:** Unique identifier for the note
- **timestamp:** ISO 8601 timestamp of when the note was created
- **author_role:** Clinical role (ED_MD, RN, HOSPITALIST_MD, RT, SURGERY_RESIDENT_MD, etc.)
- **note_text:** Full text content of the clinical note

**Real-World Integration:** For production deployment, clinical notes from EHR systems (Oracle Health/Cerner, Epic, etc.) can be extracted and converted to this JSON format. EHR systems typically provide:
- HL7 FHIR resources (DocumentReference, Observation) that can be mapped to note structure
- Database queries to extract notes with metadata (author, timestamp, patient ID)
- API endpoints that return structured note data
- HL7 v2 ADT/ORU messages that can be parsed and transformed

The system is designed to accept this standardized JSON format, making it EHR-agnostic as long as notes can be converted to the required structure with the essential fields (note_id, timestamp, author_role, note_text, patient_id).

### Architecture Features

The architecture is designed for enterprise deployment with:
- **LLM-based analysis:** Uses GPT-5.1 to analyze notes and detect contradictions with clinical guardrails
- **Post-processing filters:** Validates alerts, ensures quote accuracy, and suppresses false positives
- **Caching layer:** Client-side (localStorage) and server-side caching to minimize redundant API calls
- **Change detection:** Only re-analyzes when notes actually change
- **EHR Integration Ready:** Designed to integrate with hospital information systems (Oracle Health/Cerner, Epic, Allscripts, etc.) via HL7 FHIR, API connections, or database interfaces

### LLM Constraints & Hallucination Prevention

#### Prompt Engineering & Clinical Guardrails

The LLM prompt includes strict clinical guardrails to prevent false positives and ensure clinically meaningful alerts:

- **Explicit exclusion rules:** Do NOT flag normal progression over time (e.g., room air in ED → oxygen later is progression, not drift)
- **Non-exclusive plan handling:** Do NOT flag routine care plans (NPO, IVF, antibiotics, monitoring) as contradictions unless they conflict with discharge plans or improvement claims
- **Contradiction definition:** Requires mutually incompatible claims about CURRENT state/plan, not just different wording
- **Prefer fewer, higher-quality alerts:** If uncertain, output fewer alerts rather than risk false positives
- **Structured alert types:** Only allows specific, predefined alert types (plan_communication_drift, discharge_safety_conflict, unacknowledged_deterioration, etc.)

#### Structured Output & Note ID Validation

To prevent hallucination of note IDs and ensure accuracy:

- **Real note IDs in prompt:** Notes are formatted with actual note IDs in brackets (e.g., "Note 1 [DX-401-n-001]") so the LLM can cite exact identifiers
- **JSON response format:** Uses `response_format: { type: 'json_object' }` to enforce structured output
- **Note ID correction:** Post-processing automatically corrects common LLM mistakes (e.g., "CX-401-n-003" → "DX-401-n-003") by extracting the correct patient ID prefix from actual data
- **Strict parsing:** Only accepts `{ "alerts": [...] }` format; treats other formats as failure

#### Quote Validation & Source Verification

Every alert includes verbatim source quotes that are validated for accuracy:

- **Verbatim quote requirement:** The prompt explicitly requires verbatim substrings from note text, not paraphrasing
- **Automatic quote validation:** Post-processing checks if each `source_quote` is a verbatim substring of the actual note text
- **Quote correction:** If a quote doesn't match, the system attempts to find the actual sentence in the note and replace it automatically
- **Quality gate:** If the LLM cannot quote exact text for each side of a conflict, the alert is not created

#### Post-Processing Filters

Multiple layers of post-processing filters suppress false positives:

- **Non-exclusive plan filter:** Suppresses alerts where routine plans (NPO, IVF, monitor) conflict with patient status unless there's also a discharge plan, improvement claim, or vital instability
- **Discharge safety gate:** Only emits "discharge_safety_conflict" alerts when there's an explicit discharge/readiness claim in source quotes
- **NPO conflict filter:** Suppresses NPO conflicts unless there's an explicit opposing diet order or eating statement
- **False positive detection:** Suppresses alerts when later notes quantitatively confirm earlier qualitative improvement (e.g., "pain improved" → "pain 2/10" is consistent, not contradictory)
- **Vital sign drift window:** Enforces 4-hour default window for vital sign comparisons (6-hour max with continuous monitoring context)
- **Severity validation:** Adjusts alert severity based on objective clinical criteria (e.g., CRITICAL requires objective instability like SpO2 < 88, HR > 120, SBP < 90)

**Result:** These multi-layer constraints ensure that Care Sync generates only clinically meaningful, evidence-based alerts with verifiable source quotes, preventing hallucination and false positives while maintaining high sensitivity for true safety-relevant contradictions.

## What I Learned

Through building Care Sync, I learned:

1. **LLM Prompt Engineering:** Designing effective prompts with clinical guardrails is crucial for reducing false positives and ensuring clinically meaningful alerts
2. **Clinical Context Matters:** Simple text comparison isn't enough - understanding clinical meaning (e.g., "pain improved" vs "pain 2/10" is consistent, not contradictory) requires domain knowledge
3. **Post-Processing is Essential:** LLM outputs need validation, quote verification, and filtering to ensure accuracy and prevent hallucination
4. **Performance Optimization:** Caching, change detection, and efficient API usage are critical for real-world deployment
5. **User Experience:** Clinical decision support tools need clear visual hierarchy, evidence traceability, and actionable alerts
6. **Safety First:** In healthcare AI, preventing harm through false positives is as important as detecting true issues

## Challenges Faced

### Reducing False Positives

**Challenge:** Initial LLM prompts flagged too many false positives (e.g., "pain improved" vs "pain 2/10" was flagged as contradictory).

**Solution:** Added clinical guardrails to the prompt, post-processing filters to detect confirming patterns, and explicit rules about what constitutes a true contradiction vs. normal progression.

### Quote Accuracy

**Challenge:** LLM sometimes paraphrased or combined text from multiple sentences instead of using verbatim quotes.

**Solution:** Added strict quote validation that checks if source quotes are verbatim substrings of note text, with automatic correction when possible.

### Performance & Caching

**Challenge:** LLM API calls are slow and expensive, and the system was re-analyzing on every page refresh.

**Solution:** Implemented multi-layer caching (localStorage, server-side in-memory cache) and change detection to only re-analyze when notes actually change.

### Clinical Severity Classification

**Challenge:** Determining appropriate severity levels (CRITICAL, HIGH, MEDIUM, LOW) based on clinical impact.

**Solution:** Defined clear severity rules (e.g., CRITICAL requires objective instability like SpO2 < 88, HR > 120, SBP < 90) and implemented post-processing to adjust severity based on clinical criteria.

## Integration & Use Cases

**Primary Use Case:** Care Sync is designed to integrate with hospital information systems (HIS) and electronic health records (EHR) to provide real-time clinical decision support.

### Target Hospital Systems

- **Oracle Health (Cerner):** Integration via Cerner PowerChart APIs, Millennium database, or HL7 interfaces
- **Epic:** Integration via Epic MyChart APIs, FHIR R4, or Interconnect
- **Allscripts:** Integration via Allscripts Developer Program APIs
- **Other EHRs:** HL7 FHIR, HL7 v2, or database-level integration depending on system capabilities

### Integration Approach

- Real-time note ingestion from EHR systems as clinicians document
- Automatic drift detection and alert generation
- Alerts displayed in clinical workflows (within EHR, as notifications, or in dedicated dashboard)
- Audit trail and reconciliation support for care teams

**Note:** This demonstration uses synthetic data to showcase functionality. In production, Care Sync would connect directly to hospital EHR systems to analyze real-time clinical documentation.

## Impact Vision

Care Sync aims to improve patient safety and care coordination by:

### Early Detection
Identify documentation inconsistencies before they lead to adverse events or miscommunication

### Care Coordination
Help care teams reconcile conflicting documentation and align on patient status and care plans

### Patient Safety
Prevent discharge safety conflicts, unacknowledged deterioration, and treatment plan misalignments

### Clinical Efficiency
Reduce time spent manually reviewing notes for inconsistencies and focus on patient care

**Long-term Vision:** Care Sync represents a step toward AI-assisted clinical decision support that enhances rather than replaces clinical judgment, helping healthcare teams provide safer, more coordinated care.

**Accountability & Risk Reduction:** By creating an audit trail of documentation inconsistencies and alerting care teams in real-time, Care Sync helps:
- Reduce hospital mishaps by catching communication gaps before they impact patient care
- Support accountability by documenting when and how care teams reconcile contradictions
- Help prevent malpractice by ensuring all team members have access to the same information
- Improve patient and family communication by ensuring consistent messaging across all providers

## UN SDG Alignment

### 🎯 SDG 3: Good Health and Well-being

**Target 3.8:** Achieve universal health coverage, including financial risk protection, access to quality essential health-care services, and access to safe, effective, quality, and affordable essential medicines and vaccines for all.

**How Care Sync Contributes:**

- **Improves Quality of Care:** By detecting documentation inconsistencies, Care Sync helps ensure accurate communication between care providers, reducing medical errors and improving patient outcomes
- **Enhances Patient Safety:** Early detection of unacknowledged deterioration, discharge safety conflicts, and treatment plan misalignments prevents adverse events
- **Supports Healthcare Workers:** Reduces cognitive load on clinicians by automatically flagging potential issues, allowing them to focus on direct patient care
- **Promotes Health Equity:** By standardizing documentation review across all patients, Care Sync helps ensure consistent quality of care regardless of patient demographics or care team composition

**Additional Alignment:** Care Sync also supports **SDG 9 (Industry, Innovation, and Infrastructure)** by demonstrating how AI can be safely and effectively integrated into healthcare systems to improve infrastructure and service delivery.

## Built With

### Languages & Frameworks
TypeScript, JavaScript, React, Next.js 14

### APIs & Services
OpenAI API (GPT-5.1), Vercel Serverless Functions

### Deployment
Vercel

### Libraries
Axios, OpenAI SDK

## Quick Start

1. Install dependencies: `cd frontend && npm install`
2. Create `.env.local` in the `frontend` directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Run the development server: `cd frontend && npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/care-sync
  /frontend         # Next.js frontend
    /app            # Next.js app directory
    /lib            # Utilities and services
    /data           # Synthetic clinical notes
  README.md
```

## Hackathon Context

Built for **IBM Z Sheridan – BYTE: Enterprise AI Hackathon** (TMU Tech Week 2026)

This project demonstrates enterprise-grade AI integration in healthcare, focusing on safety, traceability, and clinical utility.
