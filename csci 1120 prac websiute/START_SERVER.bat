@echo off
cd /d "%~dp0"
echo Starting Quiz Server...
echo.

REM ── Try Node.js first (uses server.js which auto-opens the browser) ──
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Found Node.js. Starting server...
    node server.js
    goto :end
)

REM ── Fallback: Python 3 ──
where python3 >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Found Python3. Starting server...
    start "Quiz Server" cmd /k python3 -m http.server 8000
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    goto :end
)

REM ── Fallback: Python (Windows Store / older installs name it python) ──
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Found Python. Starting server...
    start "Quiz Server" cmd /k python -m http.server 8000
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    goto :end
)

echo ERROR: Neither Node.js nor Python was found.
echo Please install Node.js from https://nodejs.org/ and try again.
pause

:end
