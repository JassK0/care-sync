"""
Utility functions for Vercel serverless functions
"""

import json
from pathlib import Path
from typing import Dict, Any, List

def get_data_path():
    """Get path to data directory."""
    # In Vercel, files are relative to the project root
    return Path(__file__).parent.parent / "data"

def load_notes() -> List[Dict[str, Any]]:
    """Load notes from JSON file and flatten the structure."""
    notes_file = get_data_path() / "synthetic_notes.json"
    if not notes_file.exists():
        return []
    with open(notes_file, "r") as f:
        data = json.load(f)
    
    # Handle nested structure: { "patients": [ { "patient_id": "...", "notes": [...] } ] }
    if isinstance(data, dict) and "patients" in data:
        flattened_notes = []
        for patient in data.get("patients", []):
            patient_id = patient.get("patient_id", "")
            patient_name = patient.get("patient_name", "")
            mrn = patient.get("mrn", "")
            
            # Add patient info to each note
            for note in patient.get("notes", []):
                note["patient_id"] = patient_id
                note["patient_name"] = patient_name
                note["mrn"] = mrn
                flattened_notes.append(note)
        return flattened_notes
    
    # Handle flat structure: [ { "note_id": "...", ... } ]
    if isinstance(data, list):
        return data
    
    # Fallback: return empty list
    return []

def json_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """Create a JSON response for Vercel."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
        "body": json.dumps(data)
    }

def error_response(message: str, status_code: int = 500) -> Dict[str, Any]:
    """Create an error response."""
    return json_response({"error": message}, status_code)

def parse_request_body(request) -> Dict[str, Any]:
    """Parse request body from Vercel request."""
    body = request.get("body", "")
    if isinstance(body, str):
        if body:
            try:
                return json.loads(body)
            except:
                return {}
        return {}
    return body if isinstance(body, dict) else {}
