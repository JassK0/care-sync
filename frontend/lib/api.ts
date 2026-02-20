/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 * All API routes are now Next.js API routes in /api
 */

// Always use relative URLs - Next.js API routes are on same origin
export const API_URL = '';

// Helper function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-cache',
    });
    const data = await response.json();
    return response.ok;
  } catch (error: any) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

// API endpoint helpers
export const API_ENDPOINTS = {
  health: '/api/health',
  patients: '/api/patients',
  patient: (id: string) => `/api/patients/${id}`,
  notes: '/api/notes',
  note: (id: string) => `/api/notes/${id}`,
  patientNotes: (patientId: string) => `/api/notes/patient/${patientId}`,
  alerts: '/api/alerts',
  patientAlerts: (patientId: string) => `/api/alerts/patient/${patientId}`,
  patientSummary: (patientId: string) => `/api/summaries/patient/${patientId}`,
};
