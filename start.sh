#!/bin/bash
# ==============================================================================
# C-Verse Courses Portal - One-Click Start Script
# Runs FastAPI Backend (Port 8000) and React Vite Frontend (Port 5175) locally
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "============================================================"
echo "           🚀 Starting C-Verse Courses Portal               "
echo "============================================================"

# Check if PostgreSQL is reachable
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not responding on localhost:5432."
    echo "   Please make sure your local PostgreSQL service is running."
    echo "   Command: sudo service postgresql start"
fi

# 1. Start Backend in background
echo "Starting Backend (FastAPI on http://localhost:8000)..."
cd "$BACKEND_DIR"
source ./venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Trap signals to shut down both processes cleanly on CTRL+C
cleanup() {
    echo ""
    echo "Shutting down C-Verse servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start Frontend in background
echo "Starting Frontend (React Vite on http://localhost:5175)..."
cd "$FRONTEND_DIR"
npm run dev -- --port 5175 &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo " 🎉 Both servers are running!"
echo "   - Frontend (React App)   : http://localhost:5175"
echo "   - Backend API (FastAPI)  : http://localhost:8000"
echo "   - Interactive API Docs   : http://localhost:8000/api/docs"
echo ""
echo " 🔑 Demonstration Accounts:"
echo "   - Instructor : instructor@cverse.com / password123"
echo "   - Student    : student@cverse.com    / password123"
echo "============================================================"
echo "Press [CTRL+C] at any time to stop both servers."
echo ""

# Wait for background jobs
wait
