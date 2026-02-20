'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { API_URL } from '../../lib/api'

interface Alert {
  alert_id: string
  alert_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  patient_id: string
  patient_name?: string
  roles_involved: string[]
  conflicting_facts: any[]
  conflicting_fact_types?: string[]
  time_window: string
  source_note_ids: string[]
  description: string
  timestamp: string
  clinical_score?: number
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
  const searchParams = useSearchParams()
  const filterPatientId = searchParams.get('patient')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filterPatientName, setFilterPatientName] = useState<string | null>(null)
  const [notesMap, setNotesMap] = useState<Record<string, Note>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to load from localStorage first
    const cachedAlerts = localStorage.getItem('alerts_cache');
    const cacheTimestamp = localStorage.getItem('alerts_cache_timestamp');
    
    if (cachedAlerts && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < 1800000) { // 30 minutes
        console.log('Loading alerts from localStorage cache');
        const data = JSON.parse(cachedAlerts);
        let cachedAlertsData = data.alerts || [];
        
        // Apply patient filter if present
        if (filterPatientId) {
          cachedAlertsData = cachedAlertsData.filter((alert: Alert) => alert.patient_id === filterPatientId);
          
          // Get patient name from first alert if available
          if (cachedAlertsData.length > 0 && cachedAlertsData[0].patient_name) {
            setFilterPatientName(cachedAlertsData[0].patient_name)
          } else {
            // Try to fetch patient name from API
            fetchPatientName(filterPatientId)
          }
        } else {
          setFilterPatientName(null)
        }
        
        setAlerts(cachedAlertsData);
        setLoading(false);
        // Fetch notes for cached alerts
        fetchNotesForAlerts(cachedAlertsData);
        // Still fetch in background to update cache (without showing loading)
        fetchAlerts(false); // Pass false to skip setting loading state
        return;
      }
    }
    
    fetchAlerts(true); // Pass true to show loading state
  }, [filterPatientId])

  const fetchPatientName = async (patientId: string) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.patient?.name) {
          setFilterPatientName(data.patient.name)
        }
      }
    } catch (err) {
      console.error('Error fetching patient name:', err)
    }
  }

  const fetchNotesForAlerts = async (alertsData: Alert[]) => {
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
        console.log(`Fetching ${allNoteIds.size} notes:`, Array.from(allNoteIds))
        const notesRes = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note_ids: Array.from(allNoteIds) })
        })
        
        if (notesRes.ok) {
          const notesData = await notesRes.json()
          console.log(`Received ${notesData.notes?.length || 0} notes from API`)
          const notesDict: Record<string, Note> = {}
          notesData.notes?.forEach((note: Note) => {
            notesDict[note.note_id] = note
          })
          console.log(`Notes map contains ${Object.keys(notesDict).length} notes`)
          setNotesMap(notesDict)
        } else {
          console.error('Failed to fetch notes:', notesRes.status, notesRes.statusText)
          const errorText = await notesRes.text()
          console.error('Error response:', errorText)
        }
      } catch (notesErr) {
        console.error('Error fetching notes:', notesErr)
      }
    } else {
      console.log('No note IDs found in alerts')
    }
  }

  const fetchAlerts = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Loading alerts from: /api/alerts')
      
      const res = await fetch('/api/alerts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 1800 }, // Cache for 30 minutes
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log('Alerts API response:', data)
      let alertsData = data.alerts || []
      
      // Filter by patient if query parameter is present
      if (filterPatientId) {
        alertsData = alertsData.filter((alert: Alert) => alert.patient_id === filterPatientId)
        console.log(`Filtered to ${alertsData.length} alerts for patient ${filterPatientId}`)
        
        // Get patient name from first alert if available
        if (alertsData.length > 0 && alertsData[0].patient_name) {
          setFilterPatientName(alertsData[0].patient_name)
        } else {
          // Try to fetch patient name from API
          fetchPatientName(filterPatientId)
        }
      } else {
        setFilterPatientName(null)
      }
      
      console.log(`Found ${alertsData.length} alerts`)
      setAlerts(alertsData)
      
      // Cache in localStorage
      localStorage.setItem('alerts_cache', JSON.stringify(data));
      localStorage.setItem('alerts_cache_timestamp', Date.now().toString());
      
      // Fetch notes for the alerts
      fetchNotesForAlerts(alertsData)
      
      if (data.warning) {
        console.warn('⚠️', data.warning)
        setError(data.warning)
      } else if (data.error) {
        console.error('❌ API Error:', data.error)
        setError(data.error)
      } else {
        setError(null)
      }
    } catch (err: any) {
      console.error('Error loading alerts:', err)
      // Only set error if we're showing loading (not a background refresh)
      if (showLoading) {
        setError(err.message || 'Failed to load alerts')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const getSeverityCounts = () => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    alerts.forEach(alert => {
      if (alert.severity in counts) {
        counts[alert.severity as keyof typeof counts]++
      }
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
            <Link href="/docs">Documentation</Link>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Alerts</h3>
            <div className="value">{alerts.length}</div>
          </div>
          <div className="stat-card critical">
            <h3>Critical</h3>
            <div className="value">{severityCounts.critical}</div>
          </div>
          <div className="stat-card high">
            <h3>High Priority</h3>
            <div className="value">{severityCounts.high}</div>
          </div>
          <div className="stat-card medium">
            <h3>Medium Priority</h3>
            <div className="value">{severityCounts.medium}</div>
          </div>
          <div className="stat-card low">
            <h3>Low Priority</h3>
            <div className="value">{severityCounts.low}</div>
          </div>
        </div>

          <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#212121' }}>
                Clinical Decision Support Alerts
                {filterPatientId && (
                  <span style={{ fontSize: '16px', fontWeight: '400', color: '#757575', marginLeft: '12px' }}>
                    (Filtered: {filterPatientName ? `${filterPatientName} (${filterPatientId})` : filterPatientId})
                  </span>
                )}
              </h2>
              {filterPatientId && (
                <Link 
                  href="/alerts" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#0066cc', 
                    textDecoration: 'none',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}
                >
                  ← Clear filter
                </Link>
              )}
            </div>
            <div style={{ fontSize: '14px', color: '#757575' }}>
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} detected
            </div>
          </div>
          
          {loading && (
            <div className="loading" style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
              <div style={{ fontSize: '16px' }}>Loading clinical alerts...</div>
            </div>
          )}
          {error && (
            <div className="error" style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '16px', 
              borderRadius: '4px', 
              margin: '16px 0',
              border: '1px solid #ffcdd2'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {alerts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                  <p style={{ fontSize: '16px' }}>No clinical alerts detected at this time.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.alert_id} className={`alert-card ${alert.severity}`}>
                    {/* Alert Header */}
                    <div className="alert-header">
                      <div style={{ flex: 1 }}>
                        <h3 className="alert-title">
                          {alert.alert_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <p className="alert-subtitle">
                          <Link href={`/patients/${alert.patient_id}`} style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}>
                            {alert.patient_name ? `${alert.patient_name} (${alert.patient_id})` : `Patient ID: ${alert.patient_id}`}
                          </Link>
                          {' • '}
                          <span>Detected: {new Date(alert.timestamp).toLocaleString()}</span>
                        </p>
                      </div>
                      <span className={`alert-severity-badge ${alert.severity}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Alert Body */}
                    <div className="alert-body">
                      <p className="alert-description">{alert.description}</p>
                      
                      {/* Metadata Grid */}
                      <div className="alert-metadata">
                        <div className="alert-metadata-item">
                          <span className="alert-metadata-label">Clinical Score</span>
                          <span className="alert-metadata-value">
                            {alert.clinical_score !== undefined ? alert.clinical_score : 'N/A'}
                          </span>
                        </div>
                        <div className="alert-metadata-item">
                          <span className="alert-metadata-label">Time Window</span>
                          <span className="alert-metadata-value">{alert.time_window}</span>
                        </div>
                        <div className="alert-metadata-item">
                          <span className="alert-metadata-label">Roles Involved</span>
                          <div className="alert-metadata-value">
                            <div className="role-display">
                              {alert.roles_involved.map((role: string, idx: number) => {
                                const roleLower = role.toLowerCase().replace(/_/g, '');
                                return (
                                  <span key={idx} className={`role-badge ${roleLower}`}>
                                    {role}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="alert-metadata-item">
                          <span className="alert-metadata-label">Fact Types</span>
                          <span className="alert-metadata-value">
                            {alert.conflicting_fact_types?.join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Conflicting Facts Section */}
                      {alert.conflicting_facts && alert.conflicting_facts.length > 0 && (
                        <div className="alert-section">
                          <h4 className="alert-section-title">Clinical Evidence</h4>
                          {alert.conflicting_facts.map((cf: any, idx: number) => (
                            <div key={idx} className="conflicting-fact-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <span className={`role-badge ${cf.role.toLowerCase().replace(/_/g, '')}`}>
                                  {cf.role}
                                </span>
                                <span style={{ fontSize: '11px', color: '#757575', fontFamily: 'monospace' }}>
                                  {cf.note_id}
                                </span>
                                <span style={{ fontSize: '11px', color: '#757575' }}>
                                  {new Date(cf.note_timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                                <div>
                                  <strong style={{ color: '#424242' }}>Type:</strong>{' '}
                                  <span style={{ color: '#616161' }}>{cf.fact.type?.replace(/_/g, ' ') || 'N/A'}</span>
                                </div>
                                <div>
                                  <strong style={{ color: '#424242' }}>Value:</strong>{' '}
                                  <span style={{ color: '#212121', fontWeight: '500' }}>{cf.fact.value || 'N/A'}</span>
                                </div>
                                {cf.fact.details && (
                                  <div>
                                    <strong style={{ color: '#424242' }}>Details:</strong>{' '}
                                    <span style={{ color: '#616161' }}>{cf.fact.details}</span>
                                  </div>
                                )}
                                {cf.fact.source_quote && (
                                  <div style={{ 
                                    marginTop: '8px', 
                                    padding: '10px', 
                                    backgroundColor: '#f5f5f5', 
                                    borderRadius: '4px',
                                    borderLeft: '3px solid #0066cc',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    color: '#424242',
                                    lineHeight: '1.5'
                                  }}>
                                    <strong style={{ display: 'block', marginBottom: '4px', fontStyle: 'normal', color: '#212121' }}>
                                      Source Quote:
                                    </strong>
                                    "{cf.fact.source_quote}"
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Source Notes Section */}
                      <div className="alert-section" style={{ marginTop: '16px' }}>
                        <h4 className="alert-section-title">
                          Source Documentation ({alert.source_note_ids.length})
                        </h4>
                        {alert.source_note_ids.map((noteId: string, idx: number) => {
                          const note = notesMap[noteId]
                          const isExpanded = expandedNotes.has(noteId)
                          
                          return (
                            <div key={noteId} className="source-note-item">
                              <div className="source-note-header">
                                <div className="source-note-info">
                                  <span className={`role-badge ${(note?.author_role || 'unknown').toLowerCase().replace(/_/g, '')}`}>
                                    {note?.author_role || 'Unknown'}
                                  </span>
                                  <span style={{ fontWeight: '600', color: '#212121', fontFamily: 'monospace', fontSize: '12px' }}>
                                    {noteId}
                                  </span>
                                  {note && (
                                    <>
                                      <span style={{ fontSize: '12px', color: '#757575' }}>
                                        {note.author_name}
                                      </span>
                                      <span style={{ fontSize: '12px', color: '#757575' }}>
                                        {new Date(note.timestamp).toLocaleString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {note && (
                                  <button
                                    onClick={() => toggleNoteExpansion(noteId)}
                                    className="btn-view-note"
                                  >
                                    {isExpanded ? '▼ Hide Note' : '▶ View Note'}
                                  </button>
                                )}
                              </div>
                              
                              {note && isExpanded && (
                                <div className="source-note-text">
                                  {note.note_text}
                                </div>
                              )}
                              
                              {!note && (
                                <div style={{ fontSize: '12px', color: '#9e9e9e', fontStyle: 'italic' }}>
                                  Note not available in database
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
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
