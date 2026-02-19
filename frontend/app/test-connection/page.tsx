'use client'

import { useEffect, useState } from 'react'
import { API_URL, API_ENDPOINTS, checkBackendHealth } from '@/lib/api'
import axios from 'axios'

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Testing...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    const results: any = {
      apiUrl: API_URL,
      endpoints: API_ENDPOINTS,
    }

    // Test 1: Health check
    try {
      const healthCheck = await checkBackendHealth()
      results.healthCheck = healthCheck ? '✓ Passed' : '✗ Failed'
    } catch (e: any) {
      results.healthCheck = `✗ Error: ${e.message}`
    }

    // Test 2: Direct fetch
    try {
      const response = await fetch(`${API_URL}/api/health`)
      results.directFetch = {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      }
    } catch (e: any) {
      results.directFetch = { error: e.message }
    }

    // Test 3: Axios request
    try {
      const response = await axios.get(`${API_URL}/api/health`, { timeout: 5000 })
      results.axiosRequest = {
        status: response.status,
        data: response.data,
      }
    } catch (e: any) {
      results.axiosRequest = { error: e.message, code: e.code }
    }

    // Test 4: CORS preflight (if applicable)
    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'OPTIONS',
      })
      results.corsPreflight = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (e: any) {
      results.corsPreflight = { error: e.message }
    }

    setDetails(results)
    setStatus('Complete')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Connection Test</h1>
      <p>Status: {status}</p>
      
      {details && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Results</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
