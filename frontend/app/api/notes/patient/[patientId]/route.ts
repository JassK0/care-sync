import { NextResponse } from 'next/server';
import { loadNotes } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId;
    const notes = loadNotes();
    const patientNotes = notes.filter((n) => n.patient_id === patientId);

    return NextResponse.json({ notes: patientNotes, count: patientNotes.length });
  } catch (error: any) {
    console.error('Error in GET /api/notes/patient/[patientId]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
