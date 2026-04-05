#!/bin/bash
# Mac launcher — double-click this file in Finder to start the quiz server.
# First time only: right-click → Open (to allow running), or run once in Terminal:
#   chmod +x START_SERVER.command

# Move to the folder this script lives in (works from Finder double-click)
cd "$(dirname "$0")"

echo "Starting Quiz Server..."
echo ""

# ── Try Node.js first (uses server.js, auto-opens browser) ──
if command -v node &>/dev/null; then
    echo "Found Node.js. Starting server..."
    node server.js
    exit 0
fi

# ── Fallback: Python 3 ──
if command -v python3 &>/dev/null; then
    echo "Found Python3. Starting server..."
    python3 -m http.server 8000 &
    sleep 2
    open http://localhost:8000
    echo "Server running at http://localhost:8000"
    echo "Press Ctrl+C to stop."
    wait
    exit 0
fi

echo "ERROR: Neither Node.js nor Python3 was found."
echo "Install Node.js from https://nodejs.org/ and try again."
read -p "Press Enter to exit..."
