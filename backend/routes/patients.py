"""
Patients API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from pathlib import Path

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
async def get_all_patients():
    """Get all unique patients."""
    notes = load_notes()
    patients = {}
    
    for note in notes:
        patient_id = note.get("patient_id", "unknown")
        if patient_id not in patients:
            patients[patient_id] = {
                "patient_id": patient_id,
                "name": note.get("patient_name", "Unknown"),
                "mrn": note.get("mrn", ""),
                "note_count": 0,
                "roles": set(),
                "latest_note": None
            }
        
        patients[patient_id]["note_count"] += 1
        patients[patient_id]["roles"].add(note.get("author_role", ""))
        
        # Track latest note
        if not patients[patient_id]["latest_note"]:
            patients[patient_id]["latest_note"] = note.get("timestamp", "")
        elif note.get("timestamp", "") > patients[patient_id]["latest_note"]:
            patients[patient_id]["latest_note"] = note.get("timestamp", "")
    
    # Convert sets to lists for JSON serialization
    result = []
    for patient_id, data in patients.items():
        result.append({
            "patient_id": patient_id,
            "name": data["name"],
            "mrn": data["mrn"],
            "note_count": data["note_count"],
            "roles": list(data["roles"]),
            "latest_note": data["latest_note"]
        })
    
    return {"patients": result, "count": len(result)}

@router.get("/{patient_id}")
async def get_patient(patient_id: str):
    """Get patient details."""
    notes = load_notes()
    patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
    
    if not patient_notes:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get patient info from first note
    first_note = patient_notes[0]
    return {
        "patient_id": patient_id,
        "name": first_note.get("patient_name", "Unknown"),
        "mrn": first_note.get("mrn", ""),
        "note_count": len(patient_notes),
        "notes": patient_notes
    }
