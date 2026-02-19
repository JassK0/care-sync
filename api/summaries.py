"""
Summaries API - Vercel serverless function
"""

import json
import sys
import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Add api directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils import load_notes, json_response, error_response
from services.fact_extraction import FactExtractionService
from services.drift_detection import DriftDetectionService

# Load environment variables
possible_paths = [
    Path(__file__).parent.parent / ".env.local",
    Path(__file__).parent / ".env.local",
    Path.cwd() / ".env.local",
]

env_loaded = False
for env_path in possible_paths:
    if env_path.exists():
        try:
            load_dotenv(env_path, override=True)
            env_loaded = True
            break
        except Exception:
            continue

if not env_loaded:
    load_dotenv()

def generate_reconciliation_brief(extracted_facts, alerts, patient_id):
    """Generate a neutral, evidence-grounded reconciliation brief."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "Unable to generate summary: API key not configured"
    
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
        if "Brief:" in brief:
            brief = brief.split("Brief:")[-1].strip()
        
        return brief
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower():
            return "Unable to generate summary: OpenAI API key not configured. Please add your API key to .env.local file."
        return f"Error generating summary: {error_msg}"

def handler(request):
    """Handle summaries API requests."""
    method = request.get("httpMethod", request.get("method", "GET"))
    path = request.get("path", request.get("url", ""))
    path_params = request.get("pathParameters") or {}
    
    # Handle CORS preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            },
            "body": ""
        }
    
    # Parse path to extract parameters
    path_parts = path.strip("/").split("/")
    
    # GET /api/summaries/patient/{patient_id}
    if method == "GET" and len(path_parts) == 4 and path_parts[1] == "summaries" and path_parts[2] == "patient":
        patient_id = path_parts[3]
        notes = load_notes()
        patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
        
        if not patient_notes:
            return error_response("Patient not found", 404)
        
        try:
            # Extract facts
            fact_service = FactExtractionService()
            extracted_facts = fact_service.extract_facts_batch(patient_notes)
            
            # Get alerts
            drift_service = DriftDetectionService()
            alerts = drift_service.detect_drift(patient_notes, extracted_facts)
            
            # Generate brief
            brief = generate_reconciliation_brief(extracted_facts, alerts, patient_id)
            
            return json_response({
                "patient_id": patient_id,
                "name": patient_notes[0].get("patient_name", "Unknown"),
                "note_count": len(patient_notes),
                "alert_count": len(alerts),
                "reconciliation_brief": brief,
                "extracted_facts": extracted_facts,
                "alerts": alerts
            })
        except Exception as e:
            print(f"Error in get_patient_summary: {e}")
            import traceback
            traceback.print_exc()
            return error_response(str(e), 500)
    
    return error_response("Not found", 404)
