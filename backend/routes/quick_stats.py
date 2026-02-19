"""
Quick Stats API - Fast endpoint that doesn't require AI processing
"""

from fastapi import APIRouter
from typing import List, Dict, Any
from pathlib import Path
import json

router = APIRouter()

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
async def get_quick_stats():
    """Get quick stats without AI processing."""
    notes = load_notes()
    
    # Count unique patients
    patients = set()
    for note in notes:
        patients.add(note.get("patient_id", "unknown"))
    
    return {
        "patients": len(patients),
        "notes": len(notes),
        "alerts": "loading"  # Alerts require AI processing
    }
