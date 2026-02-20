import { NextResponse } from 'next/server';
import { loadNotes } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const noteId = params.id;
    const notes = loadNotes();
    const note = notes.find((n) => n.note_id === noteId);

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error: any) {
    console.error('Error in GET /api/notes/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
