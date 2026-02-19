'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

interface Alert {
  alert_id: string
  alert_type: string
  severity: string
  patient_id: string
  roles_involved: string[]
  conflicting_facts: any[]
  conflicting_fact_types?: string[]
  time_window: string
  source_note_ids: string[]
  description: string
  timestamp: string
}

interface Note {
  note_id: string
  patient_id: string
  patient_name: string
  author_role: string
  author_name: string
  timestamp: string
  note_text: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [notesMap, setNotesMap] = useState<Record<string, Note>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      console.log('Loading alerts from:', `${API_URL}/api/alerts/`)
      
      const res = await fetch(`${API_URL}/api/alerts/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      const alertsData = data.alerts || []
      setAlerts(alertsData)
      
      // Fetch all unique note IDs from alerts
      const allNoteIds = new Set<string>()
      alertsData.forEach((alert: Alert) => {
        alert.source_note_ids?.forEach(id => allNoteIds.add(id))
        alert.conflicting_facts?.forEach((cf: any) => {
          if (cf.note_id) allNoteIds.add(cf.note_id)
        })
      })
      
      // Fetch notes by IDs
      if (allNoteIds.size > 0) {
        try {
          const notesRes = await fetch(`${API_URL}/api/notes/by-ids`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({ note_ids: Array.from(allNoteIds) })
          })
          
          if (notesRes.ok) {
            const notesData = await notesRes.json()
            const notesDict: Record<string, Note> = {}
            notesData.notes?.forEach((note: Note) => {
              notesDict[note.note_id] = note
            })
            setNotesMap(notesDict)
          }
        } catch (notesErr) {
          console.warn('Could not fetch notes:', notesErr)
        }
      }
      
      if (data.warning) {
        console.warn('⚠️', data.warning)
        setError(data.warning)
      } else {
        setError(null)
      }
    } catch (err: any) {
      console.error('Error loading alerts:', err)
      setError(err.message || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 }
    alerts.forEach(alert => {
      counts[alert.severity as keyof typeof counts]++
    })
    return counts
  }

  const severityCounts = getSeverityCounts()
  
  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
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
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Alerts</h3>
            <div className="value">{alerts.length}</div>
          </div>
          <div className="stat-card">
            <h3>High Severity</h3>
            <div className="value" style={{ color: '#e74c3c' }}>{severityCounts.high}</div>
          </div>
          <div className="stat-card">
            <h3>Medium Severity</h3>
            <div className="value" style={{ color: '#f39c12' }}>{severityCounts.medium}</div>
          </div>
          <div className="stat-card">
            <h3>Low Severity</h3>
            <div className="value" style={{ color: '#3498db' }}>{severityCounts.low}</div>
          </div>
        </div>

        <div className="card">
          <h2>Drift Detection Alerts</h2>
          
          {loading && <div className="loading">Loading alerts...</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && (
            <>
              {alerts.length === 0 ? (
                <p>No alerts detected.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.alert_id} className={`alert-card ${alert.severity}`} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ marginBottom: '8px' }}>
                          {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <Link href={`/patients/${alert.patient_id}`} style={{ color: '#667eea', fontSize: '14px' }}>
                          Patient: {alert.patient_id}
                        </Link>
                      </div>
                      <span className={`badge badge-${alert.severity}`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>{alert.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                      <div>
                        <strong>Roles:</strong> {alert.roles_involved.join(', ')}
                      </div>
                      <div>
                        <strong>Conflicting Types:</strong> {alert.conflicting_fact_types?.join(', ') || 'N/A'}
                      </div>
                      <div>
                        <strong>Time Window:</strong> {alert.time_window}
                      </div>
                      <div>
                        <strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {alert.conflicting_facts && alert.conflicting_facts.length > 0 && (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', marginBottom: '12px' }}>Conflicting Facts:</strong>
                        {alert.conflicting_facts.map((cf: any, idx: number) => (
                          <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < alert.conflicting_facts.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span className={`role-badge ${cf.role.toLowerCase()}`}>
                                {cf.role}
                              </span>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                Note: {cf.note_id}
                              </span>
                            </div>
                            <div style={{ marginLeft: '8px' }}>
                              <div><strong>Type:</strong> {cf.fact.type}</div>
                              <div><strong>Value:</strong> {cf.fact.value}</div>
                              <div><strong>Details:</strong> {cf.fact.details}</div>
                              {cf.fact.source_quote && (
                                <div style={{ marginTop: '4px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                                  "{cf.fact.source_quote}"
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Source Notes Section */}
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '4px', border: '1px solid #667eea' }}>
                      <strong style={{ display: 'block', marginBottom: '12px', color: '#667eea' }}>
                        📋 Source Notes ({alert.source_note_ids.length}):
                      </strong>
                      {alert.source_note_ids.map((noteId: string, idx: number) => {
                        const note = notesMap[noteId]
                        const isExpanded = expandedNotes.has(noteId)
                        
                        return (
                          <div key={noteId} style={{ marginBottom: idx < alert.source_note_ids.length - 1 ? '16px' : '0', paddingBottom: idx < alert.source_note_ids.length - 1 ? '16px' : '0', borderBottom: idx < alert.source_note_ids.length - 1 ? '1px solid #d0d7ff' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span className={`role-badge ${note?.author_role.toLowerCase() || 'unknown'}`}>
                                  {note?.author_role || 'Unknown'}
                                </span>
                                <span style={{ fontWeight: '600', color: '#667eea' }}>
                                  {noteId}
                                </span>
                                {note && (
                                  <>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                      {note.author_name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                      {new Date(note.timestamp).toLocaleString()}
                                    </span>
                                  </>
                                )}
                              </div>
                              {note && (
                                <button
                                  onClick={() => toggleNoteExpansion(noteId)}
                                  style={{
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isExpanded ? '▼ Hide' : '▶ View'}
                                </button>
                              )}
                            </div>
                            
                            {note && isExpanded && (
                              <div style={{ 
                                marginTop: '12px', 
                                padding: '12px', 
                                backgroundColor: 'white', 
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap'
                              }}>
                                <strong style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                                  Full Note Text:
                                </strong>
                                {note.note_text}
                              </div>
                            )}
                            
                            {!note && (
                              <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                                Note not found in database
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
