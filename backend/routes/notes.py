"""
Notes API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
import json
import os
from pathlib import Path

class NoteIdsRequest(BaseModel):
    note_ids: List[str]

router = APIRouter()

# Load synthetic notes
DATA_DIR = Path(__file__).parent.parent.parent / "data"
NOTES_FILE = DATA_DIR / "synthetic_notes.json"

def load_notes() -> List[Dict[str, Any]]:
    """Load notes from JSON file."""
    if not NOTES_FILE.exists():
        return []
    with open(NOTES_FILE, "r") as f:
        return json.load(f)

@router.get("")
@router.get("/")
async def get_all_notes():
    """Get all clinical notes."""
    notes = load_notes()
    return {"notes": notes, "count": len(notes)}

@router.get("/{note_id}")
async def get_note(note_id: str):
    """Get a specific note by ID."""
    notes = load_notes()
    note = next((n for n in notes if n.get("note_id") == note_id), None)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.get("/patient/{patient_id}")
async def get_notes_by_patient(patient_id: str):
    """Get all notes for a specific patient."""
    notes = load_notes()
    patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
    return {"notes": patient_notes, "count": len(patient_notes)}

@router.post("/by-ids")
async def get_notes_by_ids(request: NoteIdsRequest):
    """Get notes by their IDs (for alert citations)."""
    notes = load_notes()
    note_map = {note["note_id"]: note for note in notes}
    requested_notes = [note_map[nid] for nid in request.note_ids if nid in note_map]
    return {"notes": requested_notes, "count": len(requested_notes)}
