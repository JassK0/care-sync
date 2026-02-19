"""
Health check endpoint for Vercel serverless function
"""

from utils import json_response

def handler(request):
    """Health check handler"""
    return json_response({
        "status": "healthy",
        "service": "care-sync-backend"
    })
