# Care Sync - Clinical Narrative Drift Detector

A hallucination-safe, enterprise-oriented AI system that detects clinical narrative drift across hospital roles (physicians, nurses, allied health). This demonstration uses synthetic data; the system is designed to integrate with hospital information systems like Oracle Health (Cerner), Epic, and other EHR platforms.

**📖 For detailed documentation, visit the [project website documentation page](https://your-vercel-url.vercel.app/docs)**

---

## What Inspired the Project

Through personal experience dealing with doctors, nurses, and specialists, I've witnessed a recurring problem: **all parties don't have the same information, aren't on the same page, or don't consult with each other before speaking with patients or their families.** This has led to miscommunication between staff members and confusion for patients and families.

My family members who work in healthcare have repeatedly expressed frustration with this issue - a problem that has persisted without a clear solution. In busy hospital environments, different clinicians document patient status at different times, and without a system to catch inconsistencies, critical information gaps can go unnoticed until they cause problems.

**Care Sync was built to solve this problem** by analyzing and alerting on notes as they come in, in real-time. The system automatically detects when different clinicians document conflicting information or when critical updates aren't acknowledged across the care team.

**Impact:** By providing real-time alerts and creating an audit trail of documentation inconsistencies, Care Sync helps reduce hospital mishaps, supports accountability, and can even help prevent malpractice by ensuring all care team members have access to the same information.

---

## The Idea

Care Sync is an AI-powered clinical decision support system that **analyzes and alerts on notes as they come in, in real-time**. The system:

1. **Real-Time Analysis:** Analyzes notes as they are entered into the EHR system, providing immediate alerts when contradictions are detected
2. **LLM-Based Detection:** Uses GPT-5.1 to extract clinical facts and detect contradictions across roles and time windows
3. **Prioritized Alerts:** Creates alerts (CRITICAL, HIGH, MEDIUM, LOW) based on clinical severity and potential safety impact
4. **Evidence Traceability:** Links each alert to verbatim source quotes from conflicting notes
5. **Audit Trail:** Documents all detected inconsistencies for accountability and quality improvement

**Important:** This system does _NOT_ perform diagnosis, prognosis, or treatment recommendations. It only flags documentation inconsistencies for clinical review.

---

## How I Built It

### Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Cerner-style UI  
**AI/ML:** OpenAI GPT-5.1, LLM-based drift detection, Clinical guardrails  
**Backend:** Next.js API Routes, Serverless functions, Vercel deployment  
**Architecture:** Multi-layer caching, change detection, EHR integration ready

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

**Real-World Integration:** For production deployment, clinical notes from EHR systems (Oracle Health/Cerner, Epic, etc.) can be extracted and converted to this JSON format. EHR systems typically provide HL7 FHIR resources, database queries, API endpoints, or HL7 v2 messages that can be mapped to this structure.

---

## Key Challenges & Solutions

- **False Positives:** Added clinical guardrails and post-processing filters to distinguish true contradictions from normal progression
- **Quote Accuracy:** Implemented strict validation ensuring verbatim quotes from source notes
- **Performance:** Multi-layer caching (localStorage + server-side) with change detection to minimize redundant API calls
- **Severity Classification:** Defined clear clinical criteria (e.g., CRITICAL requires objective instability like SpO\\(_2\\) < 88, HR > 120, SBP < 90)

---

## Impact Vision

- **Early Detection:** Identify documentation inconsistencies before they lead to adverse events
- **Care Coordination:** Help care teams reconcile conflicting documentation
- **Patient Safety:** Prevent discharge safety conflicts and unacknowledged deterioration
- **Accountability:** Create audit trails for quality improvement and risk management

---

## UN SDG Alignment

### 🎯 SDG 3: Good Health and Well-being

**Target 3.8:** Achieve universal health coverage, including financial risk protection, access to quality essential health-care services, and access to safe, effective, quality, and affordable essential medicines and vaccines for all.

**How Care Sync Contributes:**

- **Improves Quality of Care:** By detecting documentation inconsistencies, Care Sync helps ensure accurate communication between care providers, reducing medical errors and improving patient outcomes
- **Enhances Patient Safety:** Early detection of unacknowledged deterioration, discharge safety conflicts, and treatment plan misalignments prevents adverse events
- **Supports Healthcare Workers:** Reduces cognitive load on clinicians by automatically flagging potential issues, allowing them to focus on direct patient care
- **Promotes Health Equity:** By standardizing documentation review across all patients, Care Sync helps ensure consistent quality of care regardless of patient demographics or care team composition

**Additional Alignment:** Care Sync also supports **SDG 9 (Industry, Innovation, and Infrastructure)** by demonstrating how AI can be safely and effectively integrated into healthcare systems to improve infrastructure and service delivery.

---

## Built With

**Languages & Frameworks:** TypeScript, JavaScript, React, Next.js 14  
**APIs & Services:** OpenAI API (GPT-5.1), Vercel Serverless Functions  
**Deployment:** Vercel  
**Libraries:** Axios, OpenAI SDK

---

## Hackathon Context

Built for **IBM Z Sheridan – BYTE: Enterprise AI Hackathon** (TMU Tech Week 2026)

This project demonstrates enterprise-grade AI integration in healthcare, focusing on safety, traceability, and clinical utility.

**📖 View the full documentation with detailed sections on challenges, integration approaches, and technical architecture at the [project website](https://your-vercel-url.vercel.app/docs)**
