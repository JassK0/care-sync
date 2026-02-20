import { NextResponse } from 'next/server';
import { loadNotes } from '@/lib/utils';

// Enable caching for this route
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    console.log('GET /api/notes called');
    const notes = loadNotes();
    console.log(`Loaded ${notes.length} notes`);
    const response = NextResponse.json({ notes, count: notes.length });
    // Add cache headers - notes data doesn't change often
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (error: any) {
    console.error('Error in GET /api/notes:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const noteIds = body.note_ids || [];

    const notes = loadNotes();
    const noteMap: Record<string, any> = {};
    for (const note of notes) {
      noteMap[note.note_id] = note;
    }

    const requestedNotes = noteIds.filter((id: string) => id in noteMap).map((id: string) => noteMap[id]);

    return NextResponse.json({ notes: requestedNotes, count: requestedNotes.length });
  } catch (error: any) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
