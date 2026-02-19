"""
Minimal FastAPI app for Vercel detection
This file exists only to satisfy Vercel's FastAPI detection.
Our actual API uses serverless functions in api/*.py files.
"""

try:
    from fastapi import FastAPI
    app = FastAPI(title="Care Sync API")
    
    @app.get("/")
    def root():
        return {"message": "This is a placeholder. Use /api/* endpoints for serverless functions."}
except ImportError:
    # FastAPI not installed - create a dummy app object
    class DummyApp:
        pass
    app = DummyApp()
