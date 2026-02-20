# Care Sync - 3 Minute Video Script

**Total Time: ~3 minutes (450-500 words)**

---

## [0:00-0:30] Introduction & Problem (30 seconds)

**Visual: Show dashboard or title screen**

"Hi, I'm [Your Name], and I'm presenting Care Sync - a clinical narrative drift detector that helps prevent miscommunication in hospitals.

Have you ever been in a hospital where different doctors and nurses gave you conflicting information? This happens because care teams don't always have the same information or consult with each other before speaking with patients.

My family members who work in healthcare have repeatedly expressed frustration with this issue - a problem that has persisted without a clear solution. These communication gaps can lead to hospital mishaps, medical errors, and even malpractice cases.

**Care Sync solves this problem** by analyzing clinical notes in real-time and alerting care teams when there are contradictions or inconsistencies in documentation."

---

## [0:30-1:15] The Solution & How It Works (45 seconds)

**Visual: Show alerts page, demonstrate an alert**

"Care Sync is an AI-powered clinical decision support system that analyzes notes as they come in, in real-time.

Here's how it works: The system uses GPT-5.1 to analyze clinical notes from different healthcare roles - physicians, nurses, respiratory therapists, and more. It detects when different clinicians document conflicting information about patient status, treatment plans, or discharge readiness.

When a contradiction is found, Care Sync generates prioritized alerts - CRITICAL, HIGH, MEDIUM, or LOW - based on clinical severity. Each alert includes verbatim source quotes from the conflicting notes, ensuring traceability and clinical defensibility.

For example, if a physician documents that a patient is ready for discharge, but a nurse documents that the patient is on high-flow oxygen with desaturations, Care Sync will flag this as a CRITICAL discharge safety conflict."

---

## [1:15-2:15] Live Demo (60 seconds)

**Visual: Navigate through the site, show key features**

"Let me show you the system in action.

[**Show Patients Page**] Here's the patients page, showing all patients with their alert counts. You can see at a glance which patients have active alerts.

[**Click on a patient with alerts**] When I click on a patient, I can see their detailed timeline and all alerts associated with them.

[**Show Alerts Page**] The alerts page shows all clinical decision support alerts across all patients. Each alert displays:
- The alert type and severity
- Patient information
- Clinical evidence with verbatim quotes from source notes
- The roles involved
- A time window showing when the contradiction occurred

[**Click to expand a note**] You can expand any source note to see the full documentation, providing complete transparency.

[**Show filtered view**] You can also filter alerts by patient to focus on specific cases."

---

## [2:15-2:45] Technical Highlights (30 seconds)

**Visual: Show code snippets or architecture diagram if available, otherwise show documentation page**

"Care Sync is built with modern, enterprise-grade technology:
- Next.js 14 and TypeScript for the frontend
- OpenAI GPT-5.1 for LLM-based drift detection
- Vercel serverless functions for scalable deployment
- Multi-layer caching to minimize redundant API calls

The system is designed to integrate with hospital EHR systems like Oracle Health Cerner, Epic, and others. For this demonstration, we're using synthetic clinical data, but in production, Care Sync would connect directly to hospital systems to analyze real-time documentation."

---

## [2:45-3:00] Impact & Closing (15 seconds)

**Visual: Show impact vision or UN SDG section**

"Care Sync helps reduce hospital mishaps, supports accountability, and can help prevent malpractice by ensuring all care team members have access to the same information.

This project aligns with UN Sustainable Development Goal 3 - Good Health and Well-being - by improving quality of care and enhancing patient safety.

Thank you for watching! You can view the live demo and detailed documentation at [your website URL]. Built for the IBM Z Sheridan BYTE Enterprise AI Hackathon."

---

## Production Notes

### Visual Flow Suggestions:
1. **0:00-0:30**: Start with dashboard/title screen
2. **0:30-1:15**: Show alerts page with example alerts
3. **1:15-2:15**: Live navigation through the site
   - Patients page → Patient detail → Alerts page → Expand notes
4. **2:15-2:45**: Show documentation page or architecture
5. **2:45-3:00**: End with impact/SDG section or dashboard

### Speaking Tips:
- Speak clearly and at a moderate pace (~150 words per minute)
- Pause briefly when showing new screens
- Use your cursor to highlight important elements
- Practice the navigation flow beforehand
- Keep energy up throughout

### Key Points to Emphasize:
- ✅ Real-time analysis
- ✅ Prevents miscommunication
- ✅ Clinical evidence with verbatim quotes
- ✅ Prioritized alerts (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ EHR integration ready
- ✅ Patient safety impact

### Optional Additions (if time permits):
- Show the notes page to demonstrate the data structure
- Show how alerts are filtered by severity
- Mention the caching and performance optimizations
