"""
Health check endpoint for Vercel serverless function
"""

import sys
import os
import json
import traceback
from pathlib import Path

# Add api directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from utils import json_response
except ImportError:
    # Fallback if import fails
    def json_response(data, status_code=200):
        return {
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(data)
        }

def handler(request):
    """Health check handler"""
    try:
        return json_response({
            "status": "healthy",
            "service": "care-sync-backend"
        })
    except Exception as e:
        error_info = {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(error_info)
        }
