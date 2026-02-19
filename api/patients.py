"""
Patients API - Vercel serverless function
"""

from utils import load_notes, json_response, error_response

def handler(request):
    """Handle patients API requests."""
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
    
    # GET /api/patients - all patients
    if method == "GET" and len(path_parts) == 2 and path_parts[-1] == "patients":
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
        
        return json_response({"patients": result, "count": len(result)})
    
    # GET /api/patients/{patient_id}
    if method == "GET" and len(path_parts) == 3 and path_parts[1] == "patients":
        patient_id = path_parts[2]
        notes = load_notes()
        patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
        
        if not patient_notes:
            return error_response("Patient not found", 404)
        
        # Get patient info from first note
        first_note = patient_notes[0]
        return json_response({
            "patient_id": patient_id,
            "name": first_note.get("patient_name", "Unknown"),
            "mrn": first_note.get("mrn", ""),
            "note_count": len(patient_notes),
            "notes": patient_notes
        })
    
    return error_response("Not found", 404)
