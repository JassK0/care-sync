"""
Patient Summaries API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from pathlib import Path
from services.fact_extraction import FactExtractionService
from openai import OpenAI
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env.local from project root (parent directory)
# Try multiple paths to find .env.local
possible_paths = [
    Path(__file__).parent.parent.parent / ".env.local",  # From backend/routes/
    Path(__file__).parent.parent / ".env.local",  # From backend/
    Path.cwd() / ".env.local",  # Current working directory
    Path.cwd().parent / ".env.local",  # Parent of current directory
]

env_loaded = False
for env_path in possible_paths:
    if env_path.exists():
        try:
            # Use override=True to ensure .env.local values take precedence
            load_dotenv(env_path, override=True)
            env_loaded = True
            break
        except Exception:
            continue

# Also try loading regular .env as fallback (but don't override .env.local values)
if not env_loaded:
    load_dotenv()

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent.parent / "data"
NOTES_FILE = DATA_DIR / "synthetic_notes.json"

def load_notes() -> List[Dict[str, Any]]:
    """Load notes from JSON file."""
    if not NOTES_FILE.exists():
        return []
    with open(NOTES_FILE, "r") as f:
        return json.load(f)

def generate_reconciliation_brief(extracted_facts: List[Dict], alerts: List[Dict], patient_id: str) -> str:
    """
    Generate a neutral, evidence-grounded reconciliation brief.
    Uses GPT but ONLY to summarize extracted facts - no inference.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "Unable to generate summary: API key not configured"
    
    # Strip whitespace and remove quotes if present
    api_key = api_key.strip().strip('"').strip("'")
    
    client = OpenAI(api_key=api_key)
    
    # Prepare facts summary
    facts_summary = []
    for fact_data in extracted_facts:
        for fact in fact_data.get("facts", []):
            facts_summary.append({
                "type": fact.get("type"),
                "value": fact.get("value"),
                "details": fact.get("details"),
                "source": fact.get("source_quote", "")
            })
    
    # Prepare alerts summary
    alerts_summary = []
    for alert in alerts:
        alerts_summary.append({
            "type": alert.get("alert_type"),
            "description": alert.get("description"),
            "roles": alert.get("roles_involved", [])
        })
    
    prompt = f"""You are generating a neutral, evidence-grounded reconciliation brief for clinical documentation review.

CRITICAL RULES:
1. Use ONLY the facts provided below
2. Do NOT infer, diagnose, or recommend
3. Use neutral, factual language
4. Explicitly state uncertainty when facts conflict
5. This is a communication artifact, NOT medical advice

Extracted Facts:
{json.dumps(facts_summary, indent=2)}

Documentation Divergence Alerts:
{json.dumps(alerts_summary, indent=2)}

Generate a brief (2-3 sentences) that:
- Summarizes the documentation patterns observed
- Highlights any documented divergences
- Uses neutral language
- Cites specific observations without interpretation

Output format:
Brief: [your brief here]
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You generate neutral, evidence-based summaries. No medical inference or recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        brief = response.choices[0].message.content
        # Extract brief if it's in "Brief: ..." format
        if "Brief:" in brief:
            brief = brief.split("Brief:")[-1].strip()
        
        return brief
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower():
            return "Unable to generate summary: OpenAI API key not configured. Please add your API key to .env.local file."
        return f"Error generating summary: {error_msg}"

@router.get("/patient/{patient_id}")
async def get_patient_summary(patient_id: str):
    """Get summary for a specific patient."""
    notes = load_notes()
    patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
    
    if not patient_notes:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Extract facts
    fact_service = FactExtractionService()
    extracted_facts = fact_service.extract_facts_batch(patient_notes)
    
    # Get alerts
    from services.drift_detection import DriftDetectionService
    drift_service = DriftDetectionService()
    alerts = drift_service.detect_drift(patient_notes, extracted_facts)
    
    # Generate brief
    brief = generate_reconciliation_brief(extracted_facts, alerts, patient_id)
    
    return {
        "patient_id": patient_id,
        "name": patient_notes[0].get("patient_name", "Unknown"),
        "note_count": len(patient_notes),
        "alert_count": len(alerts),
        "reconciliation_brief": brief,
        "extracted_facts": extracted_facts,
        "alerts": alerts
    }
