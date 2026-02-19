"""
Alerts API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from pathlib import Path
from services.fact_extraction import FactExtractionService
from services.drift_detection import DriftDetectionService

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent.parent / "data"
NOTES_FILE = DATA_DIR / "synthetic_notes.json"

def load_notes() -> List[Dict[str, Any]]:
    """Load notes from JSON file."""
    if not NOTES_FILE.exists():
        return []
    with open(NOTES_FILE, "r") as f:
        return json.load(f)

# Simple in-memory cache for alerts (resets on server restart)
_alerts_cache = None
_cache_timestamp = None

@router.get("")
@router.get("/")
async def get_all_alerts():
    """Get all drift alerts."""
    global _alerts_cache, _cache_timestamp
    
    notes = load_notes()
    
    if not notes:
        return {"alerts": [], "count": 0}
    
    # Return cached result if available (cache for 5 minutes)
    import time
    if _alerts_cache is not None and _cache_timestamp is not None:
        if time.time() - _cache_timestamp < 300:  # 5 minutes
            print("Returning cached alerts")
            return _alerts_cache
    
    try:
        # Extract facts from all notes
        # This may take time if calling OpenAI API
        print(f"Extracting facts from {len(notes)} notes...")
        fact_service = FactExtractionService()
        extracted_facts = fact_service.extract_facts_batch(notes)
        print(f"Facts extracted, detecting drift...")
        
        # Detect drift
        drift_service = DriftDetectionService()
        alerts = drift_service.detect_drift(notes, extracted_facts)
        print(f"Drift detection complete: {len(alerts)} alerts found")
        
        result = {"alerts": alerts, "count": len(alerts)}
        
        # Cache the result
        _alerts_cache = result
        _cache_timestamp = time.time()
        
        return result
    except ValueError as e:
        # If API key is invalid, return empty alerts with a message
        if "OPENAI_API_KEY" in str(e):
            print(f"API key error: {e}")
            return {
                "alerts": [],
                "count": 0,
                "warning": "OpenAI API key not configured. Please add your API key to .env.local file."
            }
        raise
    except Exception as e:
        # Log the error and return empty alerts
        print(f"Error in get_all_alerts: {e}")
        import traceback
        traceback.print_exc()
        return {
            "alerts": [],
            "count": 0,
            "error": str(e)
        }

@router.get("/patient/{patient_id}")
async def get_alerts_by_patient(patient_id: str):
    """Get alerts for a specific patient."""
    notes = load_notes()
    patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
    
    if not patient_notes:
        return {"alerts": [], "count": 0}
    
    try:
        # Extract facts
        fact_service = FactExtractionService()
        extracted_facts = fact_service.extract_facts_batch(patient_notes)
        
        # Detect drift
        drift_service = DriftDetectionService()
        alerts = drift_service.detect_drift(patient_notes, extracted_facts)
        
        return {"alerts": alerts, "count": len(alerts)}
    except ValueError as e:
        if "OPENAI_API_KEY" in str(e):
            return {
                "alerts": [],
                "count": 0,
                "warning": "OpenAI API key not configured."
            }
        raise
    except Exception as e:
        print(f"Error in get_alerts_by_patient: {e}")
        return {
            "alerts": [],
            "count": 0,
            "error": str(e)
        }

@router.get("/{alert_id}")
async def get_alert(alert_id: str):
    """Get a specific alert by ID."""
    notes = load_notes()
    
    fact_service = FactExtractionService()
    extracted_facts = fact_service.extract_facts_batch(notes)
    
    drift_service = DriftDetectionService()
    alerts = drift_service.detect_drift(notes, extracted_facts)
    
    alert = next((a for a in alerts if a.get("alert_id") == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert
