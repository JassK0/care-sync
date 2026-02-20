'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { API_ENDPOINTS } from '@/lib/api'

interface Patient {
  patient_id: string
  name: string
  mrn: string
  note_count: number
  roles: string[]
  latest_note: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
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
        return;
      }
    }
    
    fetchPatients(true); // Pass true to show loading state
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
                  <th>Roles</th>
                  <th>Latest Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td>{patient.patient_id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.mrn}</td>
                    <td>{patient.note_count}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
