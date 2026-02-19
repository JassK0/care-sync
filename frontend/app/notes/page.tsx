'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '@/lib/api'

interface Note {
  note_id: string
  patient_id: string
  patient_name: string
  timestamp: string
  author_role: string
  author_name: string
  note_text: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const res = await axios.get(API_ENDPOINTS.notes)
      setNotes(res.data.notes || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load notes')
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
        <div className="card">
          <h2>All Clinical Notes</h2>
          
          {loading && <div className="loading">Loading notes...</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && (
            <div className="timeline">
              {notes.map((note) => (
                <div key={note.note_id} className="timeline-item">
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <Link href={`/patients/${note.patient_id}`} style={{ fontWeight: '600', color: '#667eea' }}>
                          {note.patient_name} ({note.patient_id})
                        </Link>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className={`role-badge ${note.author_role.toLowerCase()}`}>
                          {note.author_role}
                        </span>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          {note.author_name}
                        </span>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.note_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
