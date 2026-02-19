'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '@/lib/api'

interface Note {
  note_id: string
  timestamp: string
  author_role: string
  author_name: string
  note_text: string
}

interface Summary {
  patient_id: string
  name: string
  note_count: number
  alert_count: number
  reconciliation_brief: string
  extracted_facts: any[]
  alerts: any[]
}

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const [summary, setSummary] = useState<Summary | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'alerts'>('summary')

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      const [summaryRes, notesRes] = await Promise.all([
        axios.get(API_ENDPOINTS.patientSummary(patientId)),
        axios.get(API_ENDPOINTS.patientNotes(patientId))
      ])
      setSummary(summaryRes.data)
      setNotes(notesRes.data.notes || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load patient data')
    } finally {
      setLoading(false)
    }
  }

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
          </nav>
        </div>
      </div>

      <div className="container">
        {loading && <div className="loading">Loading patient data...</div>}
        {error && <div className="error">Error: {error}</div>}

        {summary && !loading && (
          <>
            <div className="card">
              <h2>{summary.name} - {summary.patient_id}</h2>
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                <div>
                  <strong>Notes:</strong> {summary.note_count}
                </div>
                <div>
                  <strong>Alerts:</strong> {summary.alert_count}
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
                >
                  Notes ({notes.length})
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`btn ${activeTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '4px 4px 0 0', border: 'none' }}
                >
                  Alerts ({summary.alerts.length})
                </button>
              </div>

              {activeTab === 'summary' && (
                <div>
                  <h3 style={{ marginBottom: '16px' }}>Reconciliation Brief</h3>
                  <p style={{ lineHeight: '1.8', marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    {summary.reconciliation_brief}
                  </p>

                  <h3 style={{ marginBottom: '16px' }}>Extracted Facts</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {summary.extracted_facts.map((factData, idx) => (
                      <div key={idx} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>Note {factData.note_id}:</strong>
                        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                          {factData.facts.map((fact: any, fIdx: number) => (
                            <li key={fIdx} style={{ marginBottom: '4px' }}>
                              <strong>{fact.type}:</strong> {fact.value} - {fact.details}
                              {fact.source_quote && (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                                  "{fact.source_quote}"
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="timeline">
                  {notes.map((note) => (
                    <div key={note.note_id} className="timeline-item">
                      <div className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <span className={`role-badge ${note.author_role.toLowerCase()}`}>
                              {note.author_role}
                            </span>
                            <span style={{ marginLeft: '12px', color: '#666' }}>
                              {note.author_name}
                            </span>
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            {new Date(note.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.note_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  {summary.alerts.length === 0 ? (
                    <p>No alerts for this patient.</p>
                  ) : (
                    summary.alerts.map((alert) => (
                      <div key={alert.alert_id} className={`alert-card ${alert.severity}`} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3>{alert.alert_type.replace(/_/g, ' ').toUpperCase()}</h3>
                          <span className={`badge badge-${alert.severity}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p style={{ marginBottom: '12px' }}>{alert.description}</p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <div><strong>Roles:</strong> {alert.roles_involved.join(', ')}</div>
                          <div><strong>Time Window:</strong> {alert.time_window}</div>
                          <div><strong>Source Notes:</strong> {alert.source_note_ids.join(', ')}</div>
                        </div>
                        {alert.conflicting_facts && alert.conflicting_facts.length > 0 && (
                          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                            <strong>Conflicting Facts:</strong>
                            {alert.conflicting_facts.map((cf: any, idx: number) => (
                              <div key={idx} style={{ marginTop: '8px' }}>
                                <span className={`role-badge ${cf.role.toLowerCase()}`}>{cf.role}</span>
                                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                                  {cf.fact.value}: {cf.fact.details}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
