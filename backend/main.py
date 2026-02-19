"""
Care Sync Backend - FastAPI Application
Clinical Narrative Drift Detector
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local early, before importing routes
# Try multiple paths to find .env.local
possible_paths = [
    Path(__file__).parent.parent / ".env.local",  # From backend/
    Path(__file__).parent / ".env.local",  # From backend/ (if running from here)
    Path.cwd() / ".env.local",  # Current working directory
    Path.cwd().parent / ".env.local",  # Parent of current directory
]

env_loaded = False
for env_path in possible_paths:
    if env_path.exists():
        try:
            load_dotenv(env_path, override=True)
            env_loaded = True
            print(f"✓ Loaded .env.local from: {env_path}")
            break
        except Exception as e:
            print(f"Warning: Could not load .env.local from {env_path}: {e}")
            continue

# Also try loading regular .env as fallback
if not env_loaded:
    load_dotenv()

from routes import notes, patients, alerts, summaries
from routes import quick_stats

app = FastAPI(
    title="Care Sync API",
    description="Clinical Narrative Drift Detector - Enterprise AI Hackathon MVP",
    version="1.0.0",
    redirect_slashes=False  # Disable automatic trailing slash redirects
)

# CORS middleware - MUST be added before routes
# Use wildcard for development to avoid CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,  # Set to False when using wildcard
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Additional middleware to ensure CORS headers on ALL responses (including errors)
@app.middleware("http")
async def add_cors_headers_middleware(request: Request, call_next):
    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS":
        response = JSONResponse(content={})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "3600"
        return response
    
    try:
        response = await call_next(request)
    except Exception as e:
        # Even on errors, add CORS headers
        response = JSONResponse(
            content={"error": str(e)},
            status_code=500
        )
    
    # Ensure CORS headers are always present
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Include routers
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(summaries.router, prefix="/api/summaries", tags=["summaries"])
app.include_router(quick_stats.router, prefix="/api/quick-stats", tags=["quick-stats"])

@app.get("/")
async def root():
    return {
        "message": "Care Sync API - Clinical Narrative Drift Detector",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "care-sync-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
