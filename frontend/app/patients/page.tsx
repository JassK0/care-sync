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
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await axios.get(API_ENDPOINTS.patients)
      setPatients(res.data.patients || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load patients')
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
