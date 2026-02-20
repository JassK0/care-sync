'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '../../../lib/api'

// Format time window for display
const formatTimeWindow = (timeWindow: string): string => {
  // Check if it's in the format "From ISO_DATE to ISO_DATE" or "From ISO_DATE to ISO_DATE"
  const fromToMatch = timeWindow.match(/From\s+([^\s]+(?:\s+[^\s]+)*?)\s+to\s+([^\s]+(?:\s+[^\s]+)*)/i);
  if (fromToMatch) {
    try {
      const startDateStr = fromToMatch[1].trim();
      const endDateStr = fromToMatch[2].trim();
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return timeWindow;
      }
      
      // Format dates nicely - show date and time
      const formatDate = (date: Date) => {
        const dateStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return `${dateStr} at ${timeStr}`;
      };
      
      // Calculate duration
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffMinutes = diffMs / (1000 * 60);
      
      let duration = '';
      if (diffHours >= 1) {
        const hours = Math.floor(diffHours);
        const minutes = Math.round((diffHours - hours) * 60);
        duration = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      } else {
        duration = `${Math.round(diffMinutes)}m`;
      }
      
      return `${formatDate(startDate)} to ${formatDate(endDate)} (${duration})`;
    } catch (e) {
      // If parsing fails, return as is
      return timeWindow;
    }
  }
  
  // If it's already a duration string like "2.5 hours", just return it
  return timeWindow;
}

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
  alerts: any[]
}

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  const [summary, setSummary] = useState<Summary | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [notesMap, setNotesMap] = useState<Record<string, Note>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'alerts'>('summary')

  useEffect(() => {
    if (patientId) {
      // Try to load from localStorage first
      const cacheKey = `patient_${patientId}_cache`;
      const cacheTimestampKey = `patient_${patientId}_cache_timestamp`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(cacheTimestampKey);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 1800000) { // 30 minutes
          console.log('Loading patient data from localStorage cache');
          const data = JSON.parse(cachedData);
          setSummary(data.summary);
          setNotes(data.notes || []);
          
          // Build notes map for alerts
          const notesDict: Record<string, Note> = {}
          data.notes?.forEach((note: Note) => {
            notesDict[note.note_id] = note
          })
          setNotesMap(notesDict)
          
          setLoading(false);
          // Still fetch in background to update cache (without showing loading)
          fetchPatientData(false);
          return;
        }
      }
      
      fetchPatientData(true);
    }
  }, [patientId])

  const fetchPatientData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const [summaryRes, notesRes] = await Promise.all([
        axios.get(API_ENDPOINTS.patientSummary(patientId)),
        axios.get(API_ENDPOINTS.patientNotes(patientId))
      ])
      setSummary(summaryRes.data)
      setNotes(notesRes.data.notes || [])
      
      // Build notes map for alerts
      const notesDict: Record<string, Note> = {}
      notesRes.data.notes?.forEach((note: Note) => {
        notesDict[note.note_id] = note
      })
      setNotesMap(notesDict)
      
      setError(null)
      
      // Cache in localStorage
      const cacheKey = `patient_${patientId}_cache`;
      const cacheTimestampKey = `patient_${patientId}_cache_timestamp`;
      localStorage.setItem(cacheKey, JSON.stringify({
        summary: summaryRes.data,
        notes: notesRes.data.notes || []
      }));
      localStorage.setItem(cacheTimestampKey, Date.now().toString());
    } catch (err: any) {
      // Only set error if we're showing loading (not a background refresh)
      if (showLoading) {
        setError(err.message || 'Failed to load patient data')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
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
            <Link href="/docs">Documentation</Link>
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
                  <p style={{ lineHeight: '1.8', marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '15px' }}>
                    {summary.reconciliation_brief}
                  </p>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="timeline">
                  {notes.map((note) => (
                    <div key={note.note_id} className="timeline-item">
                      <div className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <span className={`role-badge ${note.author_role.toLowerCase().replace(/_/g, '')}`}>
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
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                      <p style={{ fontSize: '16px' }}>No clinical alerts detected for this patient.</p>
                    </div>
                  ) : (
                    summary.alerts.map((alert: any) => {
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
                        <div key={alert.alert_id} className={`alert-card ${alert.severity}`}>
                          {/* Alert Header */}
                          <div className="alert-header">
                            <div style={{ flex: 1 }}>
                              <h3 className="alert-title">
                                {alert.alert_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </h3>
                              <p className="alert-subtitle">
                                <span style={{ color: '#0066cc', fontWeight: '500' }}>
                                  {summary.name} ({alert.patient_id})
                                </span>
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
                                <span className="alert-metadata-value">{formatTimeWindow(alert.time_window)}</span>
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
                      )
                    })
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
