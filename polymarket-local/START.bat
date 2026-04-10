@echo off
title Polymarket Local Lab
cd /d "%~dp0"

echo ============================================
echo   Polymarket Local Lab - Starting Server
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERROR: Node.js not found. Install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  npm install
  echo.
)

echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop.
echo.

rem Canada is NOT geoblocked by Polymarket — APIs work directly.
rem POLY_PROXY is optional but handy (simulate regions, route through VPN, etc.).
rem Uncomment to enable: set POLY_PROXY=socks5://127.0.0.1:1080

node server.js
pause
