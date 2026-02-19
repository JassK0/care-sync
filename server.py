"""
Local development server for Care Sync
Runs FastAPI backend that wraps serverless function handlers
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import json
from pathlib import Path

# Add api directory to path
sys.path.insert(0, str(Path(__file__).parent / "api"))

app = FastAPI(title="Care Sync API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import serverless function handlers
from api.health import handler as health_handler
from api.patients import handler as patients_handler
from api.notes import handler as notes_handler
from api.alerts import handler as alerts_handler
from api.summaries import handler as summaries_handler

def call_handler(handler_func, request: Request, path_params: dict = None):
    """Call a serverless function handler with FastAPI request"""
    # Convert FastAPI request to Vercel format
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = request.json()
        except:
            body = {}
    
    vercel_request = {
        "httpMethod": request.method,
        "method": request.method,
        "path": str(request.url.path),
        "url": str(request.url.path),
        "body": body or {},
        "pathParameters": path_params or {},
    }
    
    response = handler_func(vercel_request)
    
    # Convert Vercel response to FastAPI response
    if isinstance(response, dict) and "statusCode" in response:
        content = response.get("body", "{}")
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                content = {"error": "Invalid JSON response"}
        return JSONResponse(
            content=content,
            status_code=response.get("statusCode", 200),
            headers=response.get("headers", {})
        )
    return response

@app.get("/api/health")
async def health(request: Request):
    return call_handler(health_handler, request)

@app.get("/api/patients")
async def get_patients(request: Request):
    return call_handler(patients_handler, request)

@app.get("/api/patients/{patient_id}")
async def get_patient(request: Request, patient_id: str):
    return call_handler(patients_handler, request, {"patient_id": patient_id})

@app.get("/api/notes")
async def get_notes(request: Request):
    return call_handler(notes_handler, request)

@app.get("/api/notes/{note_id}")
async def get_note(request: Request, note_id: str):
    return call_handler(notes_handler, request, {"note_id": note_id})

@app.get("/api/alerts")
async def get_alerts(request: Request):
    return call_handler(alerts_handler, request)

@app.get("/api/alerts/patient/{patient_id}")
async def get_patient_alerts(request: Request, patient_id: str):
    return call_handler(alerts_handler, request, {"patient_id": patient_id})

@app.get("/api/summaries/patient/{patient_id}")
async def get_patient_summary(request: Request, patient_id: str):
    return call_handler(summaries_handler, request, {"patient_id": patient_id})

@app.get("/")
def root():
    return {"status": "Care Sync API", "message": "Use /api/* endpoints"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
