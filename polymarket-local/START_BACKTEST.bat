@echo off
title BTC Signal Backtester
color 0B
echo.
echo  ============================================================
echo   BTC Signal Backtester
echo  ============================================================
echo.
echo  OPTIONS (just edit the variables below or pass as args):
echo    --days N         How many days of history (default: 7)
echo    --forward N      Candles ahead to predict (default: 5 = 5-min)
echo    --threshold N    Score needed to call a trade (default: 60)
echo    --interval Xm    Candle size: 1m 3m 5m (default: 1m)
echo.
echo  EXAMPLES:
echo    node backtest.js
echo    node backtest.js --days 30
echo    node backtest.js --days 60 --forward 5 --threshold 62
echo    node backtest.js --days 7 --interval 5m --forward 1
echo.
echo  Output saved to: polymarket-local\data\backtest\
echo  Open backtest-report.html in browser to view results visually.
echo.

cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  npm install
  echo.
)

:: Default: 7 days, 1m candles, predict 5 candles ahead
node backtest.js --days 7 --forward 5 --threshold 60 %*

echo.
echo  Done! Open backtest-report.html and load the _stats.json file.
echo.
pause
