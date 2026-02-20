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

For example, let's look at patient Marcus Lee. The hospitalist documented that the patient is 'on 2L NC, SpO2 95%' and plans for 'discharge tomorrow.' However, the respiratory therapist and nurse documented that the patient is actually on 4L NC with exertional desaturations to 86-87% and cannot tolerate weaning. Care Sync flags this as a HIGH severity alert for unacknowledged deterioration and oxygen support drift."

---

## [1:15-2:15] Live Demo (60 seconds)

**Visual: Navigate through the site, show key features**

"Let me show you the system in action.

[**Show Patients Page**] Here's the patients page showing our three patients. You can see Marcus Lee has 2 alerts, Hannah Kim has 2 alerts, and Priya Nair has 0 alerts - meaning all documentation is consistent for her case.

[**Click on Marcus Lee (DX-401)**] Let me click on Marcus Lee. Here we can see his oxygen support drift alert. The hospitalist documented 'on 2L NC, SpO2 95%' while the nurse and respiratory therapist documented '4L NC' with exertional desaturations. This is flagged as HIGH severity.

[**Show Alerts Page**] Now let's look at the alerts page. Here we see all alerts across patients. For Hannah Kim, we have a plan communication drift alert - the patient believed she was going to surgery this morning based on what the ED doctor told her, but the surgery consult clearly states 'no OR today.' This is a HIGH severity alert because it affects patient expectations and care coordination.

[**Click to expand a note**] I can expand any source note to see the full documentation. Here's the RN note that captured the patient's confusion about the surgery plan.

[**Show filtered view**] I can also filter alerts by patient. Let me filter to show only Marcus Lee's alerts to focus on his case."

---

## [2:15-2:45] Technical Highlights (30 seconds)

**Visual: Show documentation page or dashboard**

"Care Sync is built with modern, enterprise-grade technology:
- Next.js 14 and TypeScript for the frontend
- OpenAI GPT-5.1 for LLM-based drift detection
- Vercel serverless functions for scalable deployment
- Multi-layer caching to minimize redundant API calls

The system analyzes our three demonstration patients - Marcus Lee with pneumonia, Priya Nair with pyelonephritis, and Hannah Kim with a small bowel obstruction. For this demonstration, we're using synthetic clinical data that mimics real hospital documentation patterns. In production, Care Sync would connect directly to hospital EHR systems like Oracle Health Cerner, Epic, and others to analyze real-time documentation."

---

## [2:45-3:00] Impact & Closing (15 seconds)

**Visual: Show impact vision or UN SDG section**

"Care Sync helps reduce hospital mishaps, supports accountability, and can help prevent malpractice by ensuring all care team members have access to the same information.

This project aligns with UN Sustainable Development Goal 3 - Good Health and Well-being - by improving quality of care and enhancing patient safety.

Thank you for watching! You can view the live demo and detailed documentation at [your website URL]. Built for the IBM Z Sheridan BYTE Enterprise AI Hackathon."

---

## Production Notes

### Visual Flow Suggestions:
1. **0:00-0:30**: Start with dashboard showing 3 patients, 4 total alerts
2. **0:30-1:15**: Show alerts page - highlight Marcus Lee's oxygen support drift alert
3. **1:15-2:15**: Live navigation through the site
   - Patients page (show Marcus Lee with 2 alerts, Hannah Kim with 2 alerts, Priya Nair with 0)
   - Click Marcus Lee (DX-401) → Show his oxygen support drift alert
   - Go to Alerts page → Show Hannah Kim's plan communication drift alert
   - Expand a source note to show full documentation
   - Filter alerts by patient
4. **2:15-2:45**: Show documentation page or dashboard stats
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

### Specific Examples to Highlight:
- **Marcus Lee (DX-401)**: Oxygen support drift - MD says 2L NC vs RN/RT document 4L NC with desaturations
- **Hannah Kim (DX-403)**: Plan communication drift - Patient believes surgery this morning vs surgery consult says no OR today
- **Priya Nair (DX-402)**: 0 alerts - demonstrates system correctly identifies when documentation is consistent

### Optional Additions (if time permits):
- Show the notes page to demonstrate the data structure
- Show how alerts are filtered by severity
- Mention the caching and performance optimizations
- Show Hannah Kim's symptom progression conflict alert (worsening pain vs MD says improved)