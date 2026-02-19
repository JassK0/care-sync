#!/bin/bash
# Helper script to kill processes using port 8000

echo "Checking for processes on port 8000..."
PIDS=$(lsof -ti:8000)

if [ -z "$PIDS" ]; then
    echo "✓ Port 8000 is free"
else
    echo "Found processes: $PIDS"
    echo "Killing processes..."
    kill -9 $PIDS 2>/dev/null
    sleep 1
    if lsof -ti:8000 > /dev/null 2>&1; then
        echo "⚠ Some processes may still be running"
    else
        echo "✓ Port 8000 is now free"
    fi
fi
