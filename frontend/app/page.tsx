'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/api'

interface Stats {
  patients: number
  notes: number
  alerts: number
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      console.log('🔧 Making requests to:', {
        patients: '/api/patients',
        notes: '/api/notes',
        alerts: '/api/alerts',
      })

      // Load stats quickly (patients and notes are fast) - don't wait for health check
      console.log('📊 Loading dashboard stats...')
      
      // Create abort controllers with timeout to prevent infinite hanging
      const patientsController = new AbortController()
      const notesController = new AbortController()
      const patientsTimeoutId = setTimeout(() => {
        console.warn('⚠️ Patients request timeout - aborting')
        patientsController.abort()
      }, 5000) // 5 second timeout
      const notesTimeoutId = setTimeout(() => {
        console.warn('⚠️ Notes request timeout - aborting')
        notesController.abort()
      }, 5000) // 5 second timeout
      
      // Use Promise.allSettled to not block on individual failures
      const [patientsRes, notesRes] = await Promise.allSettled([
        fetch('/api/patients', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: patientsController.signal,
        }).then(async r => {
          clearTimeout(patientsTimeoutId)
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
          return r.json()
        }).catch(err => {
          clearTimeout(patientsTimeoutId)
          if (err.name === 'AbortError') {
            throw new Error('Request timed out - backend may not be responding')
          }
          throw err
        }),
        fetch('/api/notes', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: notesController.signal,
        }).then(async r => {
          clearTimeout(notesTimeoutId)
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
          return r.json()
        }).catch(err => {
          clearTimeout(notesTimeoutId)
          if (err.name === 'AbortError') {
            throw new Error('Request timed out - backend may not be responding')
          }
          throw err
        }),
      ])
      
      // Extract results, handling both success and failure
      const patientsData = patientsRes.status === 'fulfilled' ? patientsRes.value : { count: 0 }
      const notesData = notesRes.status === 'fulfilled' ? notesRes.value : { count: 0 }
      
      // Check for connection errors
      const hasConnectionError = 
        (patientsRes.status === 'rejected' && 
         (patientsRes.reason?.message?.includes('timed out') || 
          patientsRes.reason?.message?.includes('Failed to fetch') ||
          patientsRes.reason?.name === 'AbortError')) ||
        (notesRes.status === 'rejected' && 
         (notesRes.reason?.message?.includes('timed out') || 
          notesRes.reason?.message?.includes('Failed to fetch') ||
          notesRes.reason?.name === 'AbortError'))
      
      if (patientsRes.status === 'rejected') {
        console.error('❌ Failed to load patients:', patientsRes.reason)
      }
      if (notesRes.status === 'rejected') {
        console.error('❌ Failed to load notes:', notesRes.reason)
      }
      
      if (hasConnectionError) {
        setError(`Cannot connect to backend at ${API_URL}. 

The backend may not be running. To start it:
1. Open a terminal
2. Run: npm run dev:backend
3. Wait for "Uvicorn running on http://0.0.0.0:8000"
4. Refresh this page`)
      }
      
      console.log('✅ Dashboard stats processed (some may have failed)')
      
      // Set initial stats with patients and notes - show dashboard immediately
      setStats({
        patients: patientsData.count || 0,
        notes: notesData.count || 0,
        alerts: 0 // Will update when alerts load
      })
      setLoading(false) // Stop loading spinner - show dashboard now (even if data is 0)
      
      // Load alerts separately (this may take time due to AI processing)
      // First time will be slow, but results are cached for 5 minutes
      setLoadingAlerts(true)
      console.log('🤖 Loading alerts (first load may take 30-60 seconds due to AI processing, subsequent loads are cached)...')
      try {
        const alertsController = new AbortController()
        const alertsTimeout = setTimeout(() => alertsController.abort(), 180000) // 3 minutes for AI (first time)
        
        const alertsRes = await fetch('/api/alerts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: alertsController.signal,
        }).then(async r => {
          clearTimeout(alertsTimeout)
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
          return r.json()
        }).catch(err => {
          clearTimeout(alertsTimeout)
          if (err.name === 'AbortError') {
            console.warn('⚠️ Alerts request timed out (AI processing may be slow)')
            return { alerts: [], count: 0, warning: 'Alerts processing timed out. This may take longer with OpenAI API calls.' }
          }
          throw err
        })
        
        // Update stats with alerts count
        setStats(prev => prev ? {
          ...prev,
          alerts: alertsRes.count || 0
        } : {
          patients: patientsData.count || 0,
          notes: notesData.count || 0,
          alerts: alertsRes.count || 0
        })
        
        if (alertsRes.warning) {
          console.warn('⚠️', alertsRes.warning)
        }
      } catch (alertsErr: any) {
        console.warn('⚠️ Could not load alerts:', alertsErr.message)
        // Don't fail the whole dashboard if alerts fail
        setStats(prev => prev ? {
          ...prev,
          alerts: 0
        } : {
          patients: patientsData.count || 0,
          notes: notesData.count || 0,
          alerts: 0
        })
      } finally {
        setLoadingAlerts(false)
      }

      // Stats are set above, this is just cleanup
    } catch (err: any) {
      console.error('❌ Error fetching stats:', err)
      console.error('❌ Error message:', err.message)
      console.error('❌ API URL:', API_URL)
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.name === 'TypeError') {
        setError(`Cannot connect to backend server at ${API_URL}. 

This usually means:
1. Backend is not running - check: curl http://localhost:8000/api/health
2. CORS issue - but backend should allow all origins
3. Firewall/network blocking - check browser console

Check browser DevTools Console and Network tabs for details.`)
      } else {
        setError(`Error: ${err.message || 'Failed to load dashboard'}. Check browser console for details.`)
      }
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
            <Link href="/docs">Documentation</Link>
          </nav>
        </div>
      </div>

      <div className="container">
        {loading && <div className="loading">Loading dashboard...</div>}
        
        {error && (
          <div className="error">
            <strong>Connection Error:</strong> {error}
            <div style={{ marginTop: '12px', fontSize: '14px' }}>
              <p><strong>To fix this:</strong></p>
              <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>Open browser DevTools (F12) and check the Console tab for detailed errors</li>
                <li>Check the Network tab to see if requests are being made</li>
                <li>Verify the API routes are working: <code>curl http://localhost:3001/api/health</code></li>
              </ol>
            </div>
          </div>
        )}

        {stats && !loading && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Patients</h3>
                <div className="value">{stats.patients}</div>
              </div>
              <div className="stat-card">
                <h3>Total Notes</h3>
                <div className="value">{stats.notes}</div>
              </div>
              <div className="stat-card">
                <h3>Active Alerts</h3>
                <div className="value">
                  {loadingAlerts ? (
                    <span style={{ fontSize: '14px', color: '#667eea' }}>Processing...</span>
                  ) : (
                    stats.alerts
                  )}
                </div>
                {loadingAlerts && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    AI processing in progress (first load: 30-60s, then cached)
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2>Welcome to Care Sync</h2>
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                Care Sync is an enterprise-oriented AI system that detects clinical narrative drift 
                across hospital roles (physicians, nurses, allied health). This demonstration uses synthetic data; designed to integrate with hospital systems like Oracle Health (Cerner), Epic, and other EHR platforms.
              </p>
              <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                The system extracts explicitly stated clinical facts from notes and detects 
                cross-role inconsistencies or missing acknowledgements, generating neutral, 
                evidence-grounded reconciliation briefs.
              </p>
              <div style={{ marginTop: '24px' }}>
                <Link href="/patients" className="btn btn-primary" style={{ marginRight: '12px' }}>
                  View Patients
                </Link>
                <Link href="/alerts" className="btn btn-secondary">
                  View Alerts
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
