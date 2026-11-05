#!/bin/bash
# Start script for FastAPI Backend
cd "$(dirname "$0")"

# Activate Python Virtual Environment
source ./venv/bin/activate

echo "Starting C-Verse FastAPI Backend server on http://localhost:8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
