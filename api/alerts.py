"""
Alerts API - Vercel serverless function
"""

import json
import time
import sys
import os
from pathlib import Path

# Add api directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils import load_notes, json_response, error_response
from services.fact_extraction import FactExtractionService
from services.drift_detection import DriftDetectionService

# Simple in-memory cache for alerts (resets on each cold start)
_alerts_cache = None
_cache_timestamp = None

def handler(request):
    """Handle alerts API requests."""
    global _alerts_cache, _cache_timestamp
    
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
    
    # GET /api/alerts - all alerts
    if method == "GET" and len(path_parts) == 2 and path_parts[-1] == "alerts":
        notes = load_notes()
        
        if not notes:
            return json_response({"alerts": [], "count": 0})
        
        # Return cached result if available (cache for 5 minutes)
        if _alerts_cache is not None and _cache_timestamp is not None:
            if time.time() - _cache_timestamp < 300:  # 5 minutes
                print("Returning cached alerts")
                return json_response(_alerts_cache)
        
        try:
            # Extract facts from all notes
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
            
            return json_response(result)
        except ValueError as e:
            # If API key is invalid, return empty alerts with a message
            if "OPENAI_API_KEY" in str(e):
                print(f"API key error: {e}")
                return json_response({
                    "alerts": [],
                    "count": 0,
                    "warning": "OpenAI API key not configured. Please add your API key to .env.local file."
                })
            raise
        except Exception as e:
            # Log the error and return empty alerts
            print(f"Error in get_all_alerts: {e}")
            import traceback
            traceback.print_exc()
            return json_response({
                "alerts": [],
                "count": 0,
                "error": str(e)
            })
    
    # GET /api/alerts/patient/{patient_id}
    if method == "GET" and len(path_parts) == 4 and path_parts[1] == "alerts" and path_parts[2] == "patient":
        patient_id = path_parts[3]
        notes = load_notes()
        patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
        
        if not patient_notes:
            return json_response({"alerts": [], "count": 0})
        
        try:
            # Extract facts
            fact_service = FactExtractionService()
            extracted_facts = fact_service.extract_facts_batch(patient_notes)
            
            # Detect drift
            drift_service = DriftDetectionService()
            alerts = drift_service.detect_drift(patient_notes, extracted_facts)
            
            return json_response({"alerts": alerts, "count": len(alerts)})
        except ValueError as e:
            if "OPENAI_API_KEY" in str(e):
                return json_response({
                    "alerts": [],
                    "count": 0,
                    "warning": "OpenAI API key not configured."
                })
            raise
        except Exception as e:
            print(f"Error in get_alerts_by_patient: {e}")
            return json_response({
                "alerts": [],
                "count": 0,
                "error": str(e)
            })
    
    return error_response("Not found", 404)
