@echo off
title Polymarket BTC Scraper
color 0A
echo.
echo  ============================================================
echo   Polymarket BTC 5-Min Market Scraper
echo  ============================================================
echo.
echo  Collecting: BTC price ticks, market snapshots, order books
echo  Saving to:  polymarket-local\data\
echo.
echo  Files saved per day:
echo    data\markets\YYYY-MM-DD.ndjson   (market state every 30s)
echo    data\prices\YYYY-MM-DD.ndjson    (BTC price ticks)
echo    data\books\YYYY-MM-DD.ndjson     (order book snapshots)
echo    data\candles-with-market\...     (closed candles + market context)
echo    data\summary.json                (live summary)
echo.
echo  Press Ctrl+C to stop.
echo.

cd /d "%~dp0"

:: Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  npm install
  echo.
)

:: Run the scraper
node scraper.js %*

pause
