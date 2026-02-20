'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '../../lib/api'

interface Patient {
  patient_id: string
  name: string
  mrn: string
  note_count: number
  roles: string[]
  latest_note: string
}

interface Alert {
  alert_id: string
  patient_id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface PatientAlertCounts {
  [patientId: string]: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [alertCounts, setAlertCounts] = useState<PatientAlertCounts>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to load from localStorage first
    const cachedPatients = localStorage.getItem('patients_cache');
    const cacheTimestamp = localStorage.getItem('patients_cache_timestamp');
    
    if (cachedPatients && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < 3600000) { // 1 hour
        console.log('Loading patients from localStorage cache');
        const data = JSON.parse(cachedPatients);
        setPatients(data.patients || []);
        setLoading(false);
        // Still fetch in background to update cache (without showing loading)
        fetchPatients(false); // Pass false to skip setting loading state
        fetchAlerts(); // Fetch alerts in background
        return;
      }
    }
    
    fetchPatients(true); // Pass true to show loading state
    fetchAlerts(); // Fetch alerts
  }, [])

  const fetchPatients = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Fetching patients from:', API_ENDPOINTS.patients)
      const res = await axios.get(API_ENDPOINTS.patients)
      console.log('Patients API response:', res.data)
      setPatients(res.data.patients || [])
      setError(null)
      
      // Cache in localStorage
      localStorage.setItem('patients_cache', JSON.stringify(res.data));
      localStorage.setItem('patients_cache_timestamp', Date.now().toString());
    } catch (err: any) {
      console.error('Error fetching patients:', err)
      console.error('Error response:', err.response?.data)
      // Only set error if we're showing loading (not a background refresh)
      if (showLoading) {
        setError(err.response?.data?.error || err.message || 'Failed to load patients')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  const fetchAlerts = async () => {
    try {
      // Try to load from localStorage first
      const cachedAlerts = localStorage.getItem('alerts_cache');
      const cacheTimestamp = localStorage.getItem('alerts_cache_timestamp');
      
      let alerts: Alert[] = [];
      
      if (cachedAlerts && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 1800000) { // 30 minutes
          console.log('Loading alerts from localStorage cache for patient counts');
          const data = JSON.parse(cachedAlerts);
          alerts = data.alerts || [];
        }
      }
      
      // If no cache or expired, fetch fresh
      if (alerts.length === 0) {
        const res = await fetch('/api/alerts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (res.ok) {
          const data = await res.json();
          alerts = data.alerts || [];
        }
      }
      
      // Count alerts by patient and severity
      const counts: PatientAlertCounts = {};
      alerts.forEach((alert: Alert) => {
        if (!counts[alert.patient_id]) {
          counts[alert.patient_id] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
        }
        counts[alert.patient_id].total++;
        if (alert.severity in counts[alert.patient_id]) {
          counts[alert.patient_id][alert.severity as keyof typeof counts[typeof alert.patient_id]]++;
        }
      });
      
      setAlertCounts(counts);
    } catch (err) {
      console.error('Error fetching alerts for patient counts:', err);
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
          <h2>All Patients</h2>
          
          {loading && <div className="loading">Loading patients...</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>MRN</th>
                  <th>Notes</th>
                  <th>Alerts</th>
                  <th>Roles</th>
                  <th>Latest Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const counts = alertCounts[patient.patient_id] || { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
                  return (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.mrn}</td>
                      <td>{patient.note_count}</td>
                      <td>
                        {counts.total > 0 ? (
                          <Link 
                            href={`/alerts?patient=${patient.patient_id}`}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: counts.critical > 0 ? '#d32f2f' : 
                                               counts.high > 0 ? '#f57c00' : 
                                               counts.medium > 0 ? '#1976d2' : '#757575',
                              color: '#ffffff',
                              cursor: 'pointer'
                            }}>
                              {counts.total}
                              {counts.critical > 0 && (
                                <span style={{ fontSize: '10px' }}>⚠</span>
                              )}
                            </span>
                            {counts.critical > 0 && (
                              <span style={{ fontSize: '11px', color: '#d32f2f', fontWeight: '600' }}>
                                {counts.critical}C
                              </span>
                            )}
                            {counts.high > 0 && (
                              <span style={{ fontSize: '11px', color: '#f57c00', fontWeight: '600' }}>
                                {counts.high}H
                              </span>
                            )}
                            {counts.medium > 0 && (
                              <span style={{ fontSize: '11px', color: '#1976d2' }}>
                                {counts.medium}M
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span style={{ color: '#9e9e9e', fontSize: '12px' }}>0</span>
                        )}
                      </td>
                      <td>
                        {patient.roles.map((role) => (
                          <span key={role} className={`role-badge ${role.toLowerCase()}`} style={{ marginRight: '4px' }}>
                            {role}
                          </span>
                        ))}
                      </td>
                      <td>{new Date(patient.latest_note).toLocaleString()}</td>
                      <td>
                        <Link href={`/patients/${patient.patient_id}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
