import { NextResponse } from 'next/server';
import { loadNotes, getNotesHash } from '@/lib/utils';
import { LLMDriftDetectionService } from '@/lib/services/llm-drift-detection';

// Enable caching for this route
export const revalidate = 1800; // Revalidate every 30 minutes

// Simple in-memory cache for alerts (resets on each cold start)
let alertsCache: any = null;
let cacheTimestamp: number | null = null;
let cachedNotesHash: string | null = null;

export async function GET() {
  try {
    // Check if notes have changed
    const currentNotesHash = getNotesHash();
    
    const notes = loadNotes();

    if (notes.length === 0) {
      return NextResponse.json({ alerts: [], count: 0 });
    }

    // Return cached result if available AND notes haven't changed
    if (alertsCache !== null && cacheTimestamp !== null && cachedNotesHash !== null) {
      const cacheAge = Date.now() - cacheTimestamp;
      const notesChanged = currentNotesHash !== cachedNotesHash;
      
      if (cacheAge < 1800000 && !notesChanged) {
        // 30 minutes AND notes haven't changed
        console.log(`Returning cached alerts (age: ${Math.round(cacheAge / 1000)}s, notes unchanged)`);
        const response = NextResponse.json(alertsCache);
        // Add cache headers to prevent re-fetching
        response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
        response.headers.set('X-Cache', 'HIT');
        response.headers.set('X-Notes-Hash', currentNotesHash);
        return response;
      } else if (notesChanged) {
        console.log('Notes file changed, regenerating alerts...');
      } else {
        console.log('Cache expired, regenerating...');
      }
    }

    try {
      // Use LLM to detect drift directly from notes
      console.log(`Analyzing ${notes.length} notes with LLM for drift detection...`);
      const driftService = new LLMDriftDetectionService();
      const alerts = await driftService.detectDrift(notes);
      
      console.log(`LLM drift detection complete: ${alerts.length} alerts found`);
      
      // Add patient names to alerts
      const patientNameMap: Record<string, string> = {};
      notes.forEach(note => {
        if (note.patient_id && note.patient_name && !patientNameMap[note.patient_id]) {
          patientNameMap[note.patient_id] = note.patient_name;
        }
      });
      
      const alertsWithNames = alerts.map(alert => ({
        ...alert,
        patient_name: patientNameMap[alert.patient_id] || 'Unknown'
      }));

      const result = { alerts: alertsWithNames, count: alertsWithNames.length };

      // Cache the result with current notes hash
      alertsCache = result;
      cacheTimestamp = Date.now();
      cachedNotesHash = currentNotesHash;

      const response = NextResponse.json(result);
      // Add cache headers
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Notes-Hash', currentNotesHash);
      return response;
    } catch (error: any) {
      // If API key is invalid, return empty alerts with a message
      if (error.message && error.message.includes('OPENAI_API_KEY')) {
        console.error(`API key error: ${error.message}`);
        return NextResponse.json({
          alerts: [],
          count: 0,
          warning:
            'OpenAI API key not configured. Please add your API key to .env.local file.',
        });
      }
      // Log full error for debugging
      console.error('Error in alerts API:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  } catch (error: any) {
    // Log the error and return empty alerts
    console.error(`Error in get_all_alerts: ${error}`);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json({
      alerts: [],
      count: 0,
      error: error.message || 'Unknown error',
    });
  }
}
