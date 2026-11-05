#!/bin/bash
# Start script for React Frontend
cd "$(dirname "$0")"

echo "Starting C-Verse React Frontend on http://localhost:5175..."
npm run dev -- --port 5175
