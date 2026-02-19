"""
Notes API - Vercel serverless function
"""

import json
from utils import load_notes, json_response, error_response, parse_request_body

def handler(request):
    """Handle notes API requests."""
    method = request.get("httpMethod", request.get("method", "GET"))
    path = request.get("path", request.get("url", ""))
    path_params = request.get("pathParameters") or {}
    query_params = request.get("queryStringParameters") or {}
    
    # Handle CORS preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            },
            "body": ""
        }
    
    # Parse path to extract parameters
    path_parts = path.strip("/").split("/")
    
    # GET /api/notes - all notes
    if method == "GET" and len(path_parts) == 2 and path_parts[-1] == "notes":
        notes = load_notes()
        return json_response({"notes": notes, "count": len(notes)})
    
    # GET /api/notes/{note_id}
    if method == "GET" and len(path_parts) == 3 and path_parts[1] == "notes":
        note_id = path_parts[2]
        notes = load_notes()
        note = next((n for n in notes if n.get("note_id") == note_id), None)
        if not note:
            return error_response("Note not found", 404)
        return json_response(note)
    
    # GET /api/notes/patient/{patient_id}
    if method == "GET" and len(path_parts) == 4 and path_parts[1] == "notes" and path_parts[2] == "patient":
        patient_id = path_parts[3]
        notes = load_notes()
        patient_notes = [n for n in notes if n.get("patient_id") == patient_id]
        return json_response({"notes": patient_notes, "count": len(patient_notes)})
    
    # POST /api/notes/by-ids
    if method == "POST" and len(path_parts) == 3 and path_parts[1] == "notes" and path_parts[2] == "by-ids":
        body = parse_request_body(request)
        note_ids = body.get("note_ids", [])
        notes = load_notes()
        note_map = {note["note_id"]: note for note in notes}
        requested_notes = [note_map[nid] for nid in note_ids if nid in note_map]
        return json_response({"notes": requested_notes, "count": len(requested_notes)})
    
    return error_response("Not found", 404)
