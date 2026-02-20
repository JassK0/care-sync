import { NextResponse } from 'next/server';
import { loadNotes } from '../../../../lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id;
    const notes = loadNotes();
    const patientNotes = notes.filter((n) => n.patient_id === patientId);

    if (patientNotes.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get patient info from first note
    const firstNote = patientNotes[0];
    return NextResponse.json({
      patient_id: patientId,
      name: firstNote.patient_name || 'Unknown',
      mrn: firstNote.mrn || '',
      note_count: patientNotes.length,
      notes: patientNotes,
    });
  } catch (error: any) {
    console.error('Error in GET /api/patients/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
