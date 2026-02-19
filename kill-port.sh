#!/bin/bash
PORT=3000
PID=$(lsof -t -iTCP:$PORT -sTCP:LISTEN)

if [ -n "$PID" ]; then
  echo "Killing process on port $PORT (PID $PID)"
  kill -9 $PID
else
  echo "✓ Port $PORT is free"
fi
