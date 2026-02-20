import { NextResponse } from 'next/server';
import { loadNotes, getNotesHash } from '@/lib/utils';
import { LLMDriftDetectionService } from '@/lib/services/llm-drift-detection';

// Simple in-memory cache for patient alerts (resets on each cold start)
const patientAlertsCache: Record<string, { data: any; timestamp: number; notesHash: string }> = {};

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    
    // Check if notes have changed
    const currentNotesHash = getNotesHash();
    
    // Check cache first
    const cached = patientAlertsCache[patientId];
    if (cached && Date.now() - cached.timestamp < 1800000 && cached.notesHash === currentNotesHash) {
      // 30 minutes AND notes haven't changed
      console.log(`Returning cached patient alerts for ${patientId} (notes unchanged)`);
      const response = NextResponse.json(cached.data);
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
      response.headers.set('X-Cache', 'HIT');
      response.headers.set('X-Notes-Hash', currentNotesHash);
      return response;
    }
    
    if (cached && cached.notesHash !== currentNotesHash) {
      console.log(`Notes changed for patient ${patientId}, regenerating alerts...`);
    }
    
    const notes = loadNotes();
    const patientNotes = notes.filter((n) => n.patient_id === patientId);

    if (patientNotes.length === 0) {
      return NextResponse.json({ alerts: [], count: 0 });
    }

    try {
      // Detect drift using LLM
      const driftService = new LLMDriftDetectionService();
      const alerts = await driftService.detectDrift(patientNotes);

      const result = { alerts, count: alerts.length };
      
      // Cache the result with current notes hash
      patientAlertsCache[patientId] = {
        data: result,
        timestamp: Date.now(),
        notesHash: currentNotesHash,
      };

      const response = NextResponse.json(result);
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Notes-Hash', currentNotesHash);
      return response;
    } catch (error: any) {
      if (error.message && error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json({
          alerts: [],
          count: 0,
          warning: 'OpenAI API key not configured.',
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error(`Error in get_alerts_by_patient: ${error}`);
    return NextResponse.json({
      alerts: [],
      count: 0,
      error: error.message || 'Unknown error',
    });
  }
}
