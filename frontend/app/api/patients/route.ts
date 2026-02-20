import { NextResponse } from 'next/server';
import { loadNotes, Patient } from '@/lib/utils';

// Enable caching for this route
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    console.log('GET /api/patients called');
    const notes = loadNotes();
    console.log(`Loaded ${notes.length} notes`);
    
    if (notes.length === 0) {
      console.warn('No notes loaded, returning empty patients list');
      return NextResponse.json({ patients: [], count: 0 });
    }
    
    const patients: Record<string, Patient> = {};

    for (const note of notes) {
      const patientId = note.patient_id;
      
      // Log unique patient IDs we encounter
      if (!patients[patientId]) {
        console.log(`Found new patient: ${patientId} (name: ${note.patient_name || 'Unknown'})`);
        patients[patientId] = {
          patient_id: patientId,
          name: note.patient_name || 'Unknown',
          mrn: note.mrn || '',
          note_count: 0,
          roles: new Set<string>(),
          latest_note: null,
        };
      }

      patients[patientId].note_count += 1;
      if (note.author_role) {
        patients[patientId].roles.add(note.author_role);
      }

      // Track latest note
      if (!patients[patientId].latest_note) {
        patients[patientId].latest_note = note.timestamp || '';
      } else if (note.timestamp && note.timestamp > patients[patientId].latest_note!) {
        patients[patientId].latest_note = note.timestamp;
      }
    }

    // Convert sets to arrays for JSON serialization
    const result = Object.values(patients).map((patient) => ({
      patient_id: patient.patient_id,
      name: patient.name,
      mrn: patient.mrn,
      note_count: patient.note_count,
      roles: Array.from(patient.roles),
      latest_note: patient.latest_note || '',
    }));

    console.log(`Returning ${result.length} patients:`, result.map(p => `${p.patient_id} (${p.name})`));
    const response = NextResponse.json({ patients: result, count: result.length });
    // Add cache headers - patients data doesn't change often
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/patients:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
