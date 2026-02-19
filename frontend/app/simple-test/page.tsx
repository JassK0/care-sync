'use client'

import { useState } from 'react'

export default function SimpleTest() {
  const [result, setResult] = useState<string>('Click button to test')
  const [loading, setLoading] = useState(false)

  const testDirect = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      console.log('Testing direct fetch to http://localhost:8000/api/health')
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult(`✅ SUCCESS! Status: ${response.status}, Data: ${JSON.stringify(data)}`)
    } catch (error: any) {
      console.error('Error:', error)
      setResult(`❌ ERROR: ${error.message || error.toString()}`)
    } finally {
      setLoading(false)
    }
  }

  const testAxios = async () => {
    setLoading(true)
    setResult('Testing axios...')
    
    try {
      const axios = (await import('axios')).default
      console.log('Testing axios to http://localhost:8000/api/health')
      const response = await axios.get('http://localhost:8000/api/health', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Axios response:', response)
      setResult(`✅ SUCCESS! Status: ${response.status}, Data: ${JSON.stringify(response.data)}`)
    } catch (error: any) {
      console.error('Axios error:', error)
      setResult(`❌ ERROR: ${error.message || error.toString()}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Simple Connection Test</h1>
      <p>This page tests the connection without any complex logic.</p>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={testDirect}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Fetch (Direct)
        </button>
        <button 
          onClick={testAxios}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Axios
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '5px' }}>
        <strong>Result:</strong>
        <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>{result}</pre>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#e8f4f8', borderRadius: '5px', fontSize: '12px' }}>
        <strong>Instructions:</strong>
        <ol style={{ marginTop: '10px' }}>
          <li>Open browser DevTools (F12)</li>
          <li>Go to Console tab</li>
          <li>Click the test buttons above</li>
          <li>Check the console for detailed logs</li>
          <li>Check Network tab to see the actual request</li>
        </ol>
      </div>
    </div>
  )
}
