/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 */

// Get API URL from environment variable or use default
// For Vercel serverless, use relative URLs (same origin)
// This works both locally (with vercel dev) and in production
const getApiUrl = () => {
  // Use relative URLs for Vercel serverless functions
  // vercel dev serves both frontend and API on the same origin
  if (typeof window !== 'undefined') {
    // Browser: use relative URL (same origin)
    return ''
  }
  // Server-side: use relative URL or fallback
  return process.env.NEXT_PUBLIC_API_URL || ''
}

export const API_URL = getApiUrl()

// Log API URL in development
if (typeof window !== 'undefined') {
  console.log('🔧 API_URL configured as:', API_URL)
  console.log('🔧 NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL)
}

// Helper function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking backend health at:', `${API_URL}/api/health`)
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    })
    console.log('🔍 Health check response status:', response.status, response.statusText)
    const data = await response.json()
    console.log('🔍 Health check response data:', data)
    return response.ok
  } catch (error: any) {
    console.error('❌ Backend health check failed:', error)
    console.error('❌ Error type:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ API_URL:', API_URL)
    if (error.cause) {
      console.error('❌ Error cause:', error.cause)
    }
    return false
  }
}

// API endpoint helpers
export const API_ENDPOINTS = {
  health: `${API_URL}/api/health`,
  patients: `${API_URL}/api/patients`,
  patient: (id: string) => `${API_URL}/api/patients/${id}`,
  notes: `${API_URL}/api/notes`,
  note: (id: string) => `${API_URL}/api/notes/${id}`,
  patientNotes: (patientId: string) => `${API_URL}/api/notes/patient/${patientId}`,
  alerts: `${API_URL}/api/alerts`,
  patientAlerts: (patientId: string) => `${API_URL}/api/alerts/patient/${patientId}`,
  patientSummary: (patientId: string) => `${API_URL}/api/summaries/patient/${patientId}`,
}
