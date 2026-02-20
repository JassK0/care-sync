'use client'

import Link from 'next/link'

export default function DocsPage() {
  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1>Care Sync - Clinical Narrative Drift Detector</h1>
          <nav className="nav">
            <Link href="/">Dashboard</Link>
            <Link href="/patients">Patients</Link>
            <Link href="/notes">Notes</Link>
            <Link href="/alerts">Alerts</Link>
            <Link href="/docs">Documentation</Link>
          </nav>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#0066cc', 
            marginBottom: '8px',
            borderBottom: '3px solid #0066cc',
            paddingBottom: '12px'
          }}>
            Project Documentation
          </h1>
        <p style={{ fontSize: '16px', color: '#616161', marginBottom: '24px' }}>
          A hallucination-safe, enterprise-oriented AI system that detects clinical narrative drift across hospital roles (physicians, nurses, allied health). This demonstration uses synthetic data; the system is designed to integrate with hospital information systems like Oracle Health (Cerner), Epic, and other EHR platforms.
        </p>
      </div>

      {/* What Inspired the Project */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          What Inspired the Project
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            Through personal experience dealing with doctors, nurses, and specialists, I've witnessed a recurring problem: <strong>all parties don't have the same information, aren't on the same page, or don't consult with each other before speaking with patients or their families.</strong> This has led to miscommunication between staff members and confusion for patients and families.
          </p>
          <p style={{ marginBottom: '16px' }}>
            My family members who work in healthcare have repeatedly expressed frustration with this issue - a problem that has persisted without a clear solution. In busy hospital environments, different clinicians document patient status at different times, and without a system to catch inconsistencies, critical information gaps can go unnoticed until they cause problems.
          </p>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fff3e0', 
            borderLeft: '4px solid #ff9800',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <p style={{ marginBottom: '12px', fontWeight: '600', color: '#e65100' }}>
              The Real-World Impact:
            </p>
            <ul style={{ marginLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>Patients and families receive conflicting information from different providers</li>
              <li style={{ marginBottom: '8px' }}>Care teams make decisions without full context from all team members</li>
              <li style={{ marginBottom: '8px' }}>Critical patient status changes go unacknowledged between shifts</li>
              <li style={{ marginBottom: '8px' }}>These communication gaps can contribute to hospital mishaps and medical errors</li>
            </ul>
          </div>
          <p style={{ marginBottom: '16px' }}>
            <strong>Care Sync was built to solve this problem</strong> by analyzing and alerting on notes as they come in, in real-time. The system automatically detects when different clinicians document conflicting information or when critical updates aren't acknowledged across the care team.
          </p>
          <p style={{ 
            padding: '16px', 
            backgroundColor: '#e8f5e9', 
            borderLeft: '4px solid #4caf50',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Beyond Communication:</strong> By providing real-time alerts and creating an audit trail of documentation inconsistencies, Care Sync helps reduce hospital mishaps, supports accountability, and can even help prevent malpractice by ensuring all care team members have access to the same information and are aware of contradictions before they impact patient care.
          </p>
        </div>
      </div>

      {/* The Idea */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          The Idea
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            Care Sync is an AI-powered clinical decision support system that <strong>analyzes and alerts on notes as they come in, in real-time</strong>. The system processes time-stamped clinical notes from multiple healthcare roles to detect documentation drift and contradictions as they occur. The system:
          </p>
          <ol style={{ marginLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Real-Time Analysis:</strong> Analyzes notes as they are entered into the EHR system, providing immediate alerts when contradictions are detected
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Extracts Clinical Facts:</strong> Uses LLM-based extraction to identify key clinical facts (vital signs, symptoms, treatment plans, oxygen requirements, stability assessments) from each note
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Detects Contradictions:</strong> Analyzes notes across roles and time windows to identify mutually incompatible claims about patient status or care plans
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Generates Alerts:</strong> Creates prioritized alerts (CRITICAL, HIGH, MEDIUM, LOW) based on clinical severity and potential safety impact
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Provides Evidence:</strong> Links each alert to verbatim source quotes from the conflicting notes, ensuring traceability and clinical defensibility
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Creates Audit Trail:</strong> Documents all detected inconsistencies, helping hold staff accountable and providing a record for quality improvement and risk management
            </li>
          </ol>
          <p style={{ 
            padding: '12px 16px', 
            backgroundColor: '#e3f2fd', 
            borderLeft: '4px solid #1976d2',
            borderRadius: '4px',
            marginTop: '16px'
          }}>
            <strong>Important:</strong> This system does NOT perform diagnosis, prognosis, or treatment recommendations. It only flags documentation inconsistencies for clinical review.
          </p>
        </div>
      </div>

      {/* How I Built It */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          How I Built It
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            Care Sync was built using a modern, scalable architecture:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>Frontend</h3>
              <ul style={{ fontSize: '14px', marginLeft: '16px' }}>
                <li>Next.js 14</li>
                <li>React 18</li>
                <li>TypeScript</li>
                <li>Cerner-style UI</li>
              </ul>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>AI/ML</h3>
              <ul style={{ fontSize: '14px', marginLeft: '16px' }}>
                <li>OpenAI GPT-5.1</li>
                <li>LLM-based drift detection</li>
                <li>Structured fact extraction</li>
                <li>Clinical guardrails</li>
              </ul>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>Backend</h3>
              <ul style={{ fontSize: '14px', marginLeft: '16px' }}>
                <li>Next.js API Routes</li>
                <li>Serverless functions</li>
                <li>Vercel deployment</li>
                <li>In-memory caching</li>
              </ul>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>Data</h3>
              <ul style={{ fontSize: '14px', marginLeft: '16px' }}>
                <li>Synthetic clinical notes (demo)</li>
                <li>Multi-role documentation</li>
                <li>Time-stamped entries</li>
                <li>Designed for EHR integration</li>
              </ul>
            </div>
          </div>
          
          {/* Dataset Explanation */}
          <div style={{ 
            marginTop: '24px',
            padding: '20px', 
            backgroundColor: '#f0f7ff', 
            borderLeft: '4px solid #0066cc',
            borderRadius: '4px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#0066cc' }}>
              Dataset Structure
            </h3>
            <p style={{ marginBottom: '12px', fontSize: '14px' }}>
              <strong>Demonstration Dataset:</strong> This project uses a synthetic dataset structured as JSON with the following format:
            </p>
            <pre style={{ 
              backgroundColor: '#ffffff', 
              padding: '12px', 
              borderRadius: '4px', 
              fontSize: '12px', 
              overflowX: 'auto',
              border: '1px solid #e0e0e0',
              marginBottom: '12px'
            }}>{`{
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
}`}</pre>
            <p style={{ marginBottom: '12px', fontSize: '14px' }}>
              Each note includes:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '12px', fontSize: '14px' }}>
              <li><strong>note_id:</strong> Unique identifier for the note</li>
              <li><strong>timestamp:</strong> ISO 8601 timestamp of when the note was created</li>
              <li><strong>author_role:</strong> Clinical role (ED_MD, RN, HOSPITALIST_MD, RT, SURGERY_RESIDENT_MD, etc.)</li>
              <li><strong>note_text:</strong> Full text content of the clinical note</li>
            </ul>
            <p style={{ 
              marginTop: '16px',
              padding: '12px 16px', 
              backgroundColor: '#e8f5e9', 
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <strong>Real-World Integration:</strong> For production deployment, clinical notes from EHR systems (Oracle Health/Cerner, Epic, etc.) can be extracted and converted to this JSON format. EHR systems typically provide:
            </p>
            <ul style={{ marginLeft: '24px', marginTop: '8px', fontSize: '14px' }}>
              <li>HL7 FHIR resources (DocumentReference, Observation) that can be mapped to note structure</li>
              <li>Database queries to extract notes with metadata (author, timestamp, patient ID)</li>
              <li>API endpoints that return structured note data</li>
              <li>HL7 v2 ADT/ORU messages that can be parsed and transformed</li>
            </ul>
            <p style={{ marginTop: '12px', fontSize: '14px' }}>
              The system is designed to accept this standardized JSON format, making it EHR-agnostic as long as notes can be converted to the required structure with the essential fields (note_id, timestamp, author_role, note_text, patient_id).
            </p>
          </div>
          
          <p style={{ marginTop: '16px' }}>
            The architecture is designed for enterprise deployment with:
          </p>
          <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
            <li style={{ marginBottom: '8px' }}><strong>LLM-based analysis:</strong> Uses GPT-5.1 to analyze notes and detect contradictions with clinical guardrails</li>
            <li style={{ marginBottom: '8px' }}><strong>Post-processing filters:</strong> Validates alerts, ensures quote accuracy, and suppresses false positives</li>
            <li style={{ marginBottom: '8px' }}><strong>Caching layer:</strong> Client-side (localStorage) and server-side caching to minimize redundant API calls</li>
            <li style={{ marginBottom: '8px' }}><strong>Change detection:</strong> Only re-analyzes when notes actually change</li>
            <li style={{ marginBottom: '8px' }}><strong>EHR Integration Ready:</strong> Designed to integrate with hospital information systems (Oracle Health/Cerner, Epic, Allscripts, etc.) via HL7 FHIR, API connections, or database interfaces</li>
          </ul>
        </div>
      </div>

      {/* What I Learned */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          What I Learned
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            Through building Care Sync, I learned:
          </p>
          <ol style={{ marginLeft: '24px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>LLM Prompt Engineering:</strong> Designing effective prompts with clinical guardrails is crucial for reducing false positives and ensuring clinically meaningful alerts
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Clinical Context Matters:</strong> Simple text comparison isn't enough - understanding clinical meaning (e.g., "pain improved" vs "pain 2/10" is consistent, not contradictory) requires domain knowledge
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Post-Processing is Essential:</strong> LLM outputs need validation, quote verification, and filtering to ensure accuracy and prevent hallucination
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Performance Optimization:</strong> Caching, change detection, and efficient API usage are critical for real-world deployment
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>User Experience:</strong> Clinical decision support tools need clear visual hierarchy, evidence traceability, and actionable alerts
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Safety First:</strong> In healthcare AI, preventing harm through false positives is as important as detecting true issues
            </li>
          </ol>
        </div>
      </div>

      {/* Challenges Faced */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          Challenges Faced
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f44336', marginBottom: '8px' }}>
              Reducing False Positives
            </h3>
            <p style={{ marginBottom: '8px' }}>
              <strong>Challenge:</strong> Initial LLM prompts flagged too many false positives (e.g., "pain improved" vs "pain 2/10" was flagged as contradictory).
            </p>
            <p style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e8f5e9', 
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px'
            }}>
              <strong>Solution:</strong> Added clinical guardrails to the prompt, post-processing filters to detect confirming patterns, and explicit rules about what constitutes a true contradiction vs. normal progression.
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f44336', marginBottom: '8px' }}>
              Quote Accuracy
            </h3>
            <p style={{ marginBottom: '8px' }}>
              <strong>Challenge:</strong> LLM sometimes paraphrased or combined text from multiple sentences instead of using verbatim quotes.
            </p>
            <p style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e8f5e9', 
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px'
            }}>
              <strong>Solution:</strong> Added strict quote validation that checks if source quotes are verbatim substrings of note text, with automatic correction when possible.
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f44336', marginBottom: '8px' }}>
              Performance & Caching
            </h3>
            <p style={{ marginBottom: '8px' }}>
              <strong>Challenge:</strong> LLM API calls are slow and expensive, and the system was re-analyzing on every page refresh.
            </p>
            <p style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e8f5e9', 
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px'
            }}>
              <strong>Solution:</strong> Implemented multi-layer caching (localStorage, server-side in-memory cache) and change detection to only re-analyze when notes actually change.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f44336', marginBottom: '8px' }}>
              Clinical Severity Classification
            </h3>
            <p style={{ marginBottom: '8px' }}>
              <strong>Challenge:</strong> Determining appropriate severity levels (CRITICAL, HIGH, MEDIUM, LOW) based on clinical impact.
            </p>
            <p style={{ 
              padding: '12px 16px', 
              backgroundColor: '#e8f5e9', 
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px'
            }}>
              <strong>Solution:</strong> Defined clear severity rules (e.g., CRITICAL requires objective instability like SpO2 &lt; 88, HR &gt; 120, SBP &lt; 90) and implemented post-processing to adjust severity based on clinical criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Integration & Use Cases */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          Integration & Use Cases
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>Primary Use Case:</strong> Care Sync is designed to integrate with hospital information systems (HIS) and electronic health records (EHR) to provide real-time clinical decision support.
          </p>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#e3f2fd', 
            borderLeft: '4px solid #1976d2',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1976d2' }}>
              Target Hospital Systems
            </h3>
            <ul style={{ marginLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}><strong>Oracle Health (Cerner):</strong> Integration via Cerner PowerChart APIs, Millennium database, or HL7 interfaces</li>
              <li style={{ marginBottom: '8px' }}><strong>Epic:</strong> Integration via Epic MyChart APIs, FHIR R4, or Interconnect</li>
              <li style={{ marginBottom: '8px' }}><strong>Allscripts:</strong> Integration via Allscripts Developer Program APIs</li>
              <li style={{ marginBottom: '8px' }}><strong>Other EHRs:</strong> HL7 FHIR, HL7 v2, or database-level integration depending on system capabilities</li>
            </ul>
          </div>
          <p style={{ marginBottom: '16px' }}>
            <strong>Integration Approach:</strong>
          </p>
          <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Real-time note ingestion from EHR systems as clinicians document</li>
            <li style={{ marginBottom: '8px' }}>Automatic drift detection and alert generation</li>
            <li style={{ marginBottom: '8px' }}>Alerts displayed in clinical workflows (within EHR, as notifications, or in dedicated dashboard)</li>
            <li style={{ marginBottom: '8px' }}>Audit trail and reconciliation support for care teams</li>
          </ul>
          <p style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fff3e0', 
            borderLeft: '4px solid #ff9800',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Note:</strong> This demonstration uses synthetic data to showcase functionality. In production, Care Sync would connect directly to hospital EHR systems to analyze real-time clinical documentation.
          </p>
        </div>
      </div>

      {/* Impact Vision */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          Impact Vision
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p style={{ marginBottom: '16px' }}>
            Care Sync aims to improve patient safety and care coordination by:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fff3e0', 
              borderRadius: '4px',
              border: '1px solid #ff9800'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#e65100' }}>
                Early Detection
              </h3>
              <p style={{ fontSize: '14px' }}>
                Identify documentation inconsistencies before they lead to adverse events or miscommunication
              </p>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              border: '1px solid #2196f3'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1976d2' }}>
                Care Coordination
              </h3>
              <p style={{ fontSize: '14px' }}>
                Help care teams reconcile conflicting documentation and align on patient status and care plans
              </p>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f3e5f5', 
              borderRadius: '4px',
              border: '1px solid #9c27b0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#7b1fa2' }}>
                Patient Safety
              </h3>
              <p style={{ fontSize: '14px' }}>
                Prevent discharge safety conflicts, unacknowledged deterioration, and treatment plan misalignments
              </p>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '4px',
              border: '1px solid #4caf50'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#388e3c' }}>
                Clinical Efficiency
              </h3>
              <p style={{ fontSize: '14px' }}>
                Reduce time spent manually reviewing notes for inconsistencies and focus on patient care
              </p>
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#e1f5fe', 
            borderLeft: '4px solid #0277bd',
            borderRadius: '4px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>Long-term Vision:</strong> Care Sync represents a step toward AI-assisted clinical decision support that enhances rather than replaces clinical judgment, helping healthcare teams provide safer, more coordinated care.
            </p>
            <p style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #b3e5fc' }}>
              <strong>Accountability & Risk Reduction:</strong> By creating an audit trail of documentation inconsistencies and alerting care teams in real-time, Care Sync helps:
            </p>
            <ul style={{ marginLeft: '24px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Reduce hospital mishaps by catching communication gaps before they impact patient care</li>
              <li style={{ marginBottom: '6px' }}>Support accountability by documenting when and how care teams reconcile contradictions</li>
              <li style={{ marginBottom: '6px' }}>Help prevent malpractice by ensuring all team members have access to the same information</li>
              <li style={{ marginBottom: '6px' }}>Improve patient and family communication by ensuring consistent messaging across all providers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* UN SDG Alignment */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          UN SDG Alignment
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '4px',
            border: '2px solid #4caf50',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2e7d32', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🎯</span> SDG 3: Good Health and Well-being
            </h3>
            <p style={{ marginBottom: '12px' }}>
              <strong>Target 3.8:</strong> Achieve universal health coverage, including financial risk protection, access to quality essential health-care services, and access to safe, effective, quality, and affordable essential medicines and vaccines for all.
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>How Care Sync Contributes:</strong>
            </p>
            <ul style={{ marginLeft: '24px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Improves Quality of Care:</strong> By detecting documentation inconsistencies, Care Sync helps ensure accurate communication between care providers, reducing medical errors and improving patient outcomes
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Enhances Patient Safety:</strong> Early detection of unacknowledged deterioration, discharge safety conflicts, and treatment plan misalignments prevents adverse events
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Supports Healthcare Workers:</strong> Reduces cognitive load on clinicians by automatically flagging potential issues, allowing them to focus on direct patient care
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Promotes Health Equity:</strong> By standardizing documentation review across all patients, Care Sync helps ensure consistent quality of care regardless of patient demographics or care team composition
              </li>
            </ul>
          </div>
          <p style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fff3e0', 
            borderLeft: '4px solid #ff9800',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Additional Alignment:</strong> Care Sync also supports <strong>SDG 9 (Industry, Innovation, and Infrastructure)</strong> by demonstrating how AI can be safely and effectively integrated into healthcare systems to improve infrastructure and service delivery.
          </p>
        </div>
      </div>

      {/* Built With */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          Built With
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>
              Languages & Frameworks
            </h3>
            <p>TypeScript, JavaScript, React, Next.js 14</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>
              APIs & Services
            </h3>
            <p>OpenAI API (GPT-5.1), Vercel Serverless Functions</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>
              Deployment
            </h3>
            <p>Vercel</p>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#0066cc' }}>
              Libraries
            </h3>
            <p>Axios, OpenAI SDK</p>
          </div>
        </div>
      </div>

      {/* Hackathon Context */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#212121', 
          marginBottom: '16px',
          borderLeft: '4px solid #0066cc',
          paddingLeft: '12px'
        }}>
          Hackathon Context
        </h2>
        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#424242' }}>
          <p>
            Built for <strong>IBM Z Sheridan – BYTE: Enterprise AI Hackathon</strong> (TMU Tech Week 2026)
          </p>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#757575' }}>
            This project demonstrates enterprise-grade AI integration in healthcare, focusing on safety, traceability, and clinical utility.
          </p>
        </div>
      </div>

      </div>
    </div>
  )
}
