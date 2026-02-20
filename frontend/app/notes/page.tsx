'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '../../lib/api'

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
    // Try to load from localStorage first
    const cachedNotes = localStorage.getItem('notes_cache');
    const cacheTimestamp = localStorage.getItem('notes_cache_timestamp');
    
    if (cachedNotes && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < 3600000) { // 1 hour
        console.log('Loading notes from localStorage cache');
        const data = JSON.parse(cachedNotes);
        setNotes(data.notes || []);
        setLoading(false);
        // Still fetch in background to update cache (without showing loading)
        fetchNotes(false); // Pass false to skip setting loading state
        return;
      }
    }
    
    fetchNotes(true); // Pass true to show loading state
  }, [])

  const fetchNotes = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Fetching notes from:', API_ENDPOINTS.notes)
      const res = await axios.get(API_ENDPOINTS.notes)
      console.log('Notes API response:', res.data)
      setNotes(res.data.notes || [])
      setError(null)
      
      // Cache in localStorage
      localStorage.setItem('notes_cache', JSON.stringify(res.data));
      localStorage.setItem('notes_cache_timestamp', Date.now().toString());
    } catch (err: any) {
      console.error('Error fetching notes:', err)
      console.error('Error response:', err.response?.data)
      // Only set error if we're showing loading (not a background refresh)
      if (showLoading) {
        setError(err.response?.data?.error || err.message || 'Failed to load notes')
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
                        <span className={`role-badge ${note.author_role.toLowerCase().replace(/_/g, '')}`}>
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
