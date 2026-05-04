/**
 * backtest.js — BTC Signal Backtester
 *
 * Answers: "Which of our indicator signals actually predicted BTC 5-min direction correctly?"
 *
 * Methodology:
 *   1. Fetch historical BTC/USDT 1-minute candles from Binance (free, no auth)
 *   2. Slide a 60-candle window across the history
 *   3. At each position: compute RSI, Momentum, MACD, VolSpike, Composite score
 *   4. Define outcome: did BTC close HIGHER 5 candles later? (= YES market resolves UP)
 *   5. Score every signal: accuracy, win rate, edge vs 50/50
 *   6. Break down by score range, time of day, regime (trending vs choppy)
 *   7. Output JSON + CSV + console report
 *
 * Usage:
 *   node backtest.js                         # 7 days of 1m data (~10k candles)
 *   node backtest.js --days 30               # 30 days
 *   node backtest.js --days 60 --interval 5m # 5-min candles, 60 days
 *   node backtest.js --forward 5             # 5-candle forward window (default)
 *   node backtest.js --forward 1             # predict next 1 candle
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

let fetch;
try { fetch = require('node-fetch'); } catch(e) { fetch = globalThis.fetch; }

// ─── CLI args ───
const ARGS       = process.argv.slice(2);
const argVal     = (flag, def) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : def; };
const DAYS       = parseInt(argVal('--days',    '7'));
const INTERVAL   = argVal('--interval', '1m');
const FORWARD    = parseInt(argVal('--forward', '5'));   // candles ahead = "5-min market"
const SCORE_THRESHOLD = parseInt(argVal('--threshold', '60'));

// ─── Binance ───
const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines';
const MAX_PER_REQ    = 1000; // Binance limit per request

// ─── Output ───
const DATA_DIR = path.join(__dirname, 'data', 'backtest');

// ════════════════════════════════════════════════════════════════════════════
// DATA FETCH
// ════════════════════════════════════════════════════════════════════════════

function get(url) {
  if (fetch) {
    return fetch(url, { headers: { 'Accept': 'application/json' } }).then(r => r.json());
  }
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

async function fetchCandles(interval, days) {
  const intervalMs = {
    '1m': 60_000, '3m': 180_000, '5m': 300_000,
    '15m': 900_000, '30m': 1_800_000, '1h': 3_600_000,
  };
  const ms      = intervalMs[interval] || 60_000;
  const total   = Math.floor((days * 24 * 60 * 60 * 1000) / ms);
  const batches = Math.ceil(total / MAX_PER_REQ);
  let   endTime = Date.now();
  let   all     = [];

  log(`Fetching ${total} ${interval} candles over ${days} days (${batches} requests)...`, 'info');

  for (let i = 0; i < batches; i++) {
    const url = `${BINANCE_KLINES}?symbol=BTCUSDT&interval=${interval}&limit=${MAX_PER_REQ}&endTime=${endTime}`;
    process.stdout.write(`  Batch ${i + 1}/${batches}... `);
    try {
      const rows = await get(url);
      if (!Array.isArray(rows) || rows.length === 0) break;
      // Parse OHLCV
      const candles = rows.map(r => ({
        t: r[0],      // open time ms
        o: parseFloat(r[1]),
        h: parseFloat(r[2]),
        l: parseFloat(r[3]),
        c: parseFloat(r[4]),
        v: parseFloat(r[5]),
        trades: parseInt(r[8]),
      }));
      all = candles.concat(all); // prepend (we're going backwards)
      endTime = rows[0][0] - 1;  // next batch ends before this one started
      process.stdout.write(`got ${rows.length} candles\n`);
      // Small delay to be polite
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      process.stdout.write(`ERROR: ${e.message}\n`);
      break;
    }
  }

  // Sort ascending by time and deduplicate
  all.sort((a, b) => a.t - b.t);
  const deduped = [];
  let lastT = -1;
  for (const c of all) {
    if (c.t !== lastT) { deduped.push(c); lastT = c.t; }
  }
  log(`Total candles after dedup: ${deduped.length}`, 'ok');
  return deduped;
}

// ════════════════════════════════════════════════════════════════════════════
// INDICATOR ENGINE (mirrors btc-algo.js — pure Node, no DOM)
// ════════════════════════════════════════════════════════════════════════════

function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

function calcRSI(candles, period = 14) {
  if (candles.length < period + 1) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const closes = candles.slice(-(period + 1)).map(c => c.c);
  let gains = 0, losses = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  if (losses === 0) return { value: 100, signal: 'UP', pct: 1 };
  const rs  = (gains / period) / (losses / period);
  const rsi = 100 - (100 / (1 + rs));
  return {
    value: Math.round(rsi * 10) / 10,
    signal: rsi > 60 ? 'UP' : rsi < 40 ? 'DOWN' : 'NEUTRAL',
    pct: rsi / 100,
  };
}

function calcMomentum(candles, period = 5) {
  if (candles.length < period + 1) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const current = candles[candles.length - 1].c;
  const past    = candles[candles.length - 1 - period].c;
  const pct     = ((current - past) / past) * 100;
  return {
    value: Math.round(pct * 1000) / 1000,
    signal: pct > 0.2 ? 'UP' : pct < -0.2 ? 'DOWN' : 'NEUTRAL',
    pct: Math.min(1, Math.max(0, (pct + 1) / 2)),
  };
}

function calcMACD(candles, fast = 12, slow = 26, sig = 9) {
  if (candles.length < slow + sig) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const closes    = candles.map(c => c.c);
  const emaFast   = ema(closes, fast);
  const emaSlow   = ema(closes, slow);
  if (!emaFast || !emaSlow) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const macdLine  = emaFast - emaSlow;
  // Signal line = EMA of MACD values (simplified: use last N closes for approximation)
  const macdValues = [];
  const k = 2 / (fast + 1), ks = 2 / (slow + 1);
  let ef = closes.slice(0, fast).reduce((a, b) => a + b) / fast;
  let es = closes.slice(0, slow).reduce((a, b) => a + b) / slow;
  for (let i = Math.max(fast, slow); i < closes.length; i++) {
    ef = closes[i] * k  + ef * (1 - k);
    es = closes[i] * ks + es * (1 - ks);
    macdValues.push(ef - es);
  }
  if (macdValues.length < sig) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const sigLine = macdValues.slice(-sig).reduce((a, b) => a + b) / sig;
  const hist    = macdLine - sigLine;
  return {
    value: Math.round(hist * 100000) / 100000,
    signal: hist > 0 ? 'UP' : hist < 0 ? 'DOWN' : 'NEUTRAL',
    pct: hist > 0 ? Math.min(1, 0.5 + Math.abs(hist) * 1000) : Math.max(0, 0.5 - Math.abs(hist) * 1000),
  };
}

function calcVolSpike(candles, period = 20) {
  if (candles.length < period + 1) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
  const recent = candles[candles.length - 1];
  const avgVol = candles.slice(-(period + 1), -1).reduce((s, c) => s + c.v, 0) / period;
  const ratio  = avgVol > 0 ? recent.v / avgVol : 1;
  const priceUp = recent.c >= recent.o;
  return {
    value: Math.round(ratio * 100) / 100,
    signal: ratio > 1.5 ? (priceUp ? 'UP' : 'DOWN') : 'NEUTRAL',
    pct: Math.min(1, ratio / 3),
  };
}

const WEIGHTS = { rsi: 0.30, momentum: 0.35, macd: 0.25, vol: 0.10 };

function composite(candles) {
  const rsi      = calcRSI(candles);
  const momentum = calcMomentum(candles);
  const macd     = calcMACD(candles);
  const vol      = calcVolSpike(candles);

  let totalW = 0, weighted = 0;
  function add(ind, w) {
    if (ind.value !== null) { weighted += ind.pct * w; totalW += w; }
  }
  add(rsi, WEIGHTS.rsi); add(momentum, WEIGHTS.momentum);
  add(macd, WEIGHTS.macd); add(vol, WEIGHTS.vol);

  if (totalW === 0) return { score: 50, action: null, rsi, momentum, macd, vol };
  const score  = Math.round((weighted / totalW) * 100);
  const action = score >= SCORE_THRESHOLD ? 'UP' : score <= (100 - SCORE_THRESHOLD) ? 'DOWN' : null;

  return { score, action, rsi, momentum, macd, vol };
}

// ════════════════════════════════════════════════════════════════════════════
// BACKTESTER
// ════════════════════════════════════════════════════════════════════════════

function backtest(candles, forward = FORWARD) {
  const MIN_WINDOW = 60; // need at least 60 candles for indicators
  const rows = [];

  log(`Running backtest: ${candles.length} candles, forward=${forward} candles...`, 'info');

  for (let i = MIN_WINDOW; i < candles.length - forward; i++) {
    const window  = candles.slice(i - MIN_WINDOW, i + 1); // 61 candles ending at i
    const current = candles[i];
    const future  = candles[i + forward];
    const outcome = future.c > current.c ? 'UP' : future.c < current.c ? 'DOWN' : 'FLAT';
    const pctMove = ((future.c - current.c) / current.c) * 100;

    const comp = composite(window);

    // Time context
    const dt   = new Date(current.t);
    const hour = dt.getUTCHours();

    // Volatility context: std dev of last 20 close-to-close changes
    const closes = window.slice(-21).map(c => c.c);
    const changes = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i] * 100);
    const mean   = changes.reduce((a, b) => a + b, 0) / changes.length;
    const stdDev = Math.sqrt(changes.map(x => (x - mean) ** 2).reduce((a, b) => a + b) / changes.length);
    const regime = stdDev > 0.15 ? 'volatile' : stdDev < 0.05 ? 'quiet' : 'normal';

    rows.push({
      ts:          current.t,
      datetime:    dt.toISOString(),
      hour,
      btcPrice:    current.c,
      pctMove:     Math.round(pctMove * 10000) / 10000,
      outcome,

      // Composite
      score:       comp.score,
      action:      comp.action,
      compCorrect: comp.action === outcome ? 1 : (comp.action === null ? null : 0),

      // Individual signals
      rsiVal:      comp.rsi.value,
      rsiSignal:   comp.rsi.signal,
      rsiCorrect:  comp.rsi.signal !== 'NEUTRAL' ? (comp.rsi.signal === outcome ? 1 : 0) : null,

      momVal:      comp.momentum.value,
      momSignal:   comp.momentum.signal,
      momCorrect:  comp.momentum.signal !== 'NEUTRAL' ? (comp.momentum.signal === outcome ? 1 : 0) : null,

      macdVal:     comp.macd.value,
      macdSignal:  comp.macd.signal,
      macdCorrect: comp.macd.signal !== 'NEUTRAL' ? (comp.macd.signal === outcome ? 1 : 0) : null,

      volVal:      comp.vol.value,
      volSignal:   comp.vol.signal,
      volCorrect:  comp.vol.signal !== 'NEUTRAL' ? (comp.vol.signal === outcome ? 1 : 0) : null,

      regime,
      stdDev:      Math.round(stdDev * 10000) / 10000,
    });
  }

  return rows;
}

// ════════════════════════════════════════════════════════════════════════════
// ANALYSIS & STATS
// ════════════════════════════════════════════════════════════════════════════

function stats(rows) {
  const total = rows.length;
  const outcomes = { UP: 0, DOWN: 0, FLAT: 0 };
  rows.forEach(r => outcomes[r.outcome]++);

  // ── Per-signal stats ──
  function signalStats(rows, signalKey, correctKey) {
    const active = rows.filter(r => r[signalKey] !== 'NEUTRAL' && r[correctKey] !== null);
    if (!active.length) return null;
    const up      = active.filter(r => r[signalKey] === 'UP');
    const dn      = active.filter(r => r[signalKey] === 'DOWN');
    const correct = active.filter(r => r[correctKey] === 1);
    const upWins  = up.filter(r => r[correctKey] === 1).length;
    const dnWins  = dn.filter(r => r[correctKey] === 1).length;
    return {
      total:      active.length,
      signalRate: pct(active.length, total),         // how often it fires
      accuracy:   pct(correct.length, active.length), // when it fires, is it right?
      upCalls:    up.length,
      upAccuracy: pct(upWins, up.length),
      dnCalls:    dn.length,
      dnAccuracy: pct(dnWins, dn.length),
      edge:       pct(correct.length, active.length) - 50, // % above coin flip
    };
  }

  // ── Composite score range breakdown ──
  function scoreRangeStats(rows) {
    const ranges = [
      { label: '0-30  (STRONG DOWN)',  min: 0,  max: 30  },
      { label: '31-40 (DOWN)',         min: 31, max: 40  },
      { label: '41-59 (NEUTRAL)',      min: 41, max: 59  },
      { label: '60-69 (UP)',           min: 60, max: 69  },
      { label: '70-100 (STRONG UP)',   min: 70, max: 100 },
    ];
    return ranges.map(range => {
      const bucket = rows.filter(r => r.score >= range.min && r.score <= range.max);
      if (!bucket.length) return { ...range, count: 0, accuracy: null, upPct: null };
      const upOutcome = bucket.filter(r => r.outcome === 'UP').length;
      const predicted = bucket.filter(r => r.action !== null);
      const correct   = predicted.filter(r => r.compCorrect === 1);
      return {
        label:    range.label,
        count:    bucket.length,
        freq:     pct(bucket.length, total),
        upPct:    pct(upOutcome, bucket.length),    // base rate of UP outcomes in range
        accuracy: predicted.length ? pct(correct.length, predicted.length) : null,
        edge:     predicted.length ? pct(correct.length, predicted.length) - 50 : null,
        avgMove:  avg(bucket.map(r => r.pctMove)),
      };
    });
  }

  // ── Hour of day breakdown ──
  function hourlyStats(rows) {
    const byHour = {};
    rows.forEach(r => {
      if (!byHour[r.hour]) byHour[r.hour] = [];
      byHour[r.hour].push(r);
    });
    return Object.entries(byHour).map(([h, hrs]) => {
      const active = hrs.filter(r => r.compCorrect !== null);
      const correct = active.filter(r => r.compCorrect === 1);
      return {
        hour:     parseInt(h),
        label:    `${String(h).padStart(2,'0')}:00 UTC`,
        count:    hrs.length,
        accuracy: active.length ? pct(correct.length, active.length) : null,
        avgScore: avg(hrs.map(r => r.score)),
        upRate:   pct(hrs.filter(r => r.outcome === 'UP').length, hrs.length),
      };
    }).sort((a, b) => a.hour - b.hour);
  }

  // ── Regime breakdown ──
  function regimeStats(rows) {
    return ['quiet', 'normal', 'volatile'].map(regime => {
      const bucket = rows.filter(r => r.regime === regime);
      const active = bucket.filter(r => r.compCorrect !== null);
      const correct = active.filter(r => r.compCorrect === 1);
      return {
        regime,
        count:    bucket.length,
        accuracy: active.length ? pct(correct.length, active.length) : null,
        edge:     active.length ? pct(correct.length, active.length) - 50 : null,
        avgMove:  avg(bucket.map(r => Math.abs(r.pctMove))),
      };
    });
  }

  // ── Top signal combinations ──
  // When MULTIPLE signals agree, does that improve accuracy?
  function combinationStats(rows) {
    const combos = [2, 3, 4].map(minAgree => {
      const signals = ['rsiSignal', 'momSignal', 'macdSignal', 'volSignal'];
      const active = rows.filter(r => {
        if (!r.action) return false;
        const agree = signals.filter(s => r[s] === r.action).length;
        return agree >= minAgree;
      });
      const correct = active.filter(r => r.compCorrect === 1);
      return {
        label:    `${minAgree}+ indicators agree`,
        count:    active.length,
        freq:     pct(active.length, total),
        accuracy: active.length ? pct(correct.length, active.length) : null,
        edge:     active.length ? pct(correct.length, active.length) - 50 : null,
      };
    });
    return combos;
  }

  // ── Simple linear regression: score vs outcome ──
  // Does higher score reliably → higher prob of UP?
  function scoreRegression(rows) {
    // Group into score buckets of width 5
    const buckets = {};
    for (let s = 0; s <= 100; s += 5) buckets[s] = [];
    rows.forEach(r => {
      const b = Math.floor(r.score / 5) * 5;
      buckets[b].push(r);
    });
    return Object.entries(buckets)
      .filter(([, v]) => v.length >= 5)
      .map(([scoreMin, bucket]) => ({
        scoreMin:  parseInt(scoreMin),
        count:     bucket.length,
        upRate:    pct(bucket.filter(r => r.outcome === 'UP').length, bucket.length),
        avgMove:   avg(bucket.map(r => r.pctMove)),
      }));
  }

  return {
    total,
    outcomes,
    baseUpRate: pct(outcomes.UP, total),
    period: {
      from: rows[0]?.datetime,
      to:   rows[rows.length - 1]?.datetime,
    },
    composite: signalStats(rows, 'action', 'compCorrect'),
    signals: {
      rsi:      signalStats(rows, 'rsiSignal',  'rsiCorrect'),
      momentum: signalStats(rows, 'momSignal',  'momCorrect'),
      macd:     signalStats(rows, 'macdSignal', 'macdCorrect'),
      vol:      signalStats(rows, 'volSignal',  'volCorrect'),
    },
    scoreRanges:  scoreRangeStats(rows),
    hourly:       hourlyStats(rows),
    regimes:      regimeStats(rows),
    combinations: combinationStats(rows),
    regression:   scoreRegression(rows),
    threshold: SCORE_THRESHOLD,
    forward:   FORWARD,
  };
}

function avg(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

function pct(n, d) {
  if (!d) return null;
  return Math.round((n / d) * 10000) / 100; // returns 0-100
}

// ════════════════════════════════════════════════════════════════════════════
// CONSOLE REPORT
// ════════════════════════════════════════════════════════════════════════════

function printReport(s, rows) {
  const c = { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', b: '\x1b[36m', w: '\x1b[1m', x: '\x1b[0m' };
  const color = (v, good = 55) => v >= good ? c.g + v + c.x : v >= 50 ? c.y + v + c.x : c.r + v + c.x;

  console.log(`\n${c.w}${'═'.repeat(62)}${c.x}`);
  console.log(`${c.w}  BACKTEST REPORT — BTC/USDT ${INTERVAL} candles, forward=${FORWARD}${c.x}`);
  console.log(`  Period: ${s.period.from?.slice(0,10)} → ${s.period.to?.slice(0,10)}`);
  console.log(`  Candles: ${s.total.toLocaleString()} samples | BASE UP rate: ${s.baseUpRate}%`);
  console.log(`${'─'.repeat(62)}`);

  // Per-signal table
  console.log(`\n${c.w}SIGNAL ACCURACY (when signal fires → was it correct?)${c.x}`);
  console.log(`${'─'.repeat(62)}`);
  console.log(`  ${'Signal'.padEnd(12)} ${'Fires%'.padStart(7)} ${'Accuracy%'.padStart(10)} ${'Edge'.padStart(6)} ${'UP%'.padStart(6)} ${'DN%'.padStart(6)}`);
  console.log(`  ${'─'.repeat(58)}`);

  const sigs = [
    ['Composite', s.composite],
    ['RSI',       s.signals.rsi],
    ['Momentum',  s.signals.momentum],
    ['MACD',      s.signals.macd],
    ['Vol Spike', s.signals.vol],
  ];
  sigs.forEach(([name, sig]) => {
    if (!sig) { console.log(`  ${name.padEnd(12)} no data`); return; }
    const acc  = sig.accuracy?.toFixed(1) || '--';
    const edge = sig.edge !== null ? (sig.edge > 0 ? '+' : '') + sig.edge.toFixed(1) : '--';
    const edgeColor = sig.edge > 5 ? c.g : sig.edge > 0 ? c.y : c.r;
    console.log(`  ${name.padEnd(12)} ${(sig.signalRate?.toFixed(1) || '--').padStart(7)}% ${color(sig.accuracy, 54).toString().padStart(10)} ${(edgeColor + edge + c.x).padStart(6)} ${(sig.upAccuracy?.toFixed(1) || '--').padStart(6)}% ${(sig.dnAccuracy?.toFixed(1) || '--').padStart(6)}%`);
  });

  // Score range table
  console.log(`\n${c.w}SCORE RANGE vs OUTCOME${c.x}`);
  console.log(`${'─'.repeat(62)}`);
  console.log(`  ${'Score Range'.padEnd(23)} ${'n'.padStart(5)} ${'UP base'.padStart(8)} ${'Accuracy'.padStart(9)} ${'Edge'.padStart(6)}`);
  console.log(`  ${'─'.repeat(55)}`);
  s.scoreRanges.forEach(r => {
    const acc  = r.accuracy !== null ? r.accuracy.toFixed(1) + '%' : '  n/a ';
    const edge = r.edge !== null ? (r.edge > 0 ? '+' : '') + r.edge.toFixed(1) + '%' : '  n/a';
    const edgeColor = r.edge > 5 ? c.g : r.edge > 0 ? c.y : r.edge < 0 ? c.r : c.x;
    console.log(`  ${r.label.padEnd(23)} ${String(r.count).padStart(5)}  ${(r.upPct?.toFixed(1) || '--').padStart(6)}%  ${acc.padStart(8)} ${edgeColor}${edge.padStart(6)}${c.x}`);
  });

  // Combinations
  console.log(`\n${c.w}SIGNAL COMBINATIONS (consensus improves accuracy?)${c.x}`);
  console.log(`${'─'.repeat(62)}`);
  s.combinations.forEach(c2 => {
    const acc  = c2.accuracy?.toFixed(1) || '--';
    const edge = c2.edge !== null ? (c2.edge > 0 ? '+' : '') + c2.edge.toFixed(1) : '--';
    const col  = c2.edge > 5 ? c.g : c2.edge > 0 ? c.y : c.r;
    console.log(`  ${c2.label.padEnd(28)} n=${String(c2.count).padEnd(5)} acc=${acc.padStart(5)}%  edge=${col}${edge}%${c.x}`);
  });

  // Regimes
  console.log(`\n${c.w}MARKET REGIME BREAKDOWN${c.x}`);
  console.log(`${'─'.repeat(62)}`);
  s.regimes.forEach(r => {
    const acc  = r.accuracy?.toFixed(1) || '--';
    const edge = r.edge !== null ? (r.edge > 0 ? '+' : '') + r.edge.toFixed(1) : '--';
    const col  = r.edge > 5 ? c.g : r.edge > 0 ? c.y : c.r;
    console.log(`  ${r.regime.padEnd(10)}  n=${String(r.count).padEnd(6)} acc=${acc}%  edge=${col}${edge}%${c.x}  avg|move|=${r.avgMove?.toFixed(4)}%`);
  });

  // Best hours
  const bestHours = s.hourly.filter(h => h.accuracy !== null).sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0)).slice(0, 5);
  console.log(`\n${c.w}TOP 5 HOURS (UTC) BY COMPOSITE ACCURACY${c.x}`);
  console.log(`${'─'.repeat(62)}`);
  bestHours.forEach(h => {
    const acc = h.accuracy?.toFixed(1) || '--';
    console.log(`  ${h.label}  n=${String(h.count).padEnd(5)}  acc=${acc}%  upRate=${h.upRate?.toFixed(1)}%  avgScore=${h.avgScore?.toFixed(1)}`);
  });

  console.log(`\n${c.w}${'═'.repeat(62)}${c.x}\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// OUTPUT FILES
// ════════════════════════════════════════════════════════════════════════════

function saveResults(stats, rows) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const ts  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = path.join(DATA_DIR, `${ts}_fwd${FORWARD}`);

  // Full stats JSON
  fs.writeFileSync(base + '_stats.json', JSON.stringify(stats, null, 2), 'utf8');
  log(`Stats saved: ${base}_stats.json`, 'ok');

  // Per-row CSV (every backtest point)
  const csvHeaders = Object.keys(rows[0]).join(',');
  const csvRows    = rows.map(r => Object.values(r).map(v => {
    const s = String(v ?? '');
    return s.includes(',') ? `"${s}"` : s;
  }).join(','));
  fs.writeFileSync(base + '_rows.csv', [csvHeaders, ...csvRows].join('\n'), 'utf8');
  log(`Row data saved: ${base}_rows.csv  (${rows.length} rows — open in Excel)`, 'ok');

  // Score regression CSV — cleanest for charting
  const regHeaders = 'scoreMin,count,upRate,avgMove';
  const regRows    = stats.regression.map(r => `${r.scoreMin},${r.count},${r.upRate},${r.avgMove}`);
  fs.writeFileSync(base + '_regression.csv', [regHeaders, ...regRows].join('\n'), 'utf8');
  log(`Regression data: ${base}_regression.csv`, 'ok');

  return base;
}

// ════════════════════════════════════════════════════════════════════════════
// LOGGING
// ════════════════════════════════════════════════════════════════════════════

const C = { ok:'\x1b[32m', warn:'\x1b[33m', error:'\x1b[31m', info:'\x1b[36m', reset:'\x1b[0m' };
function log(msg, level = 'info') {
  const t = new Date().toLocaleTimeString('en-CA', { hour12: false });
  console.log(`${C[level] || C.info}[${t}]${C.reset} ${msg}`);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\x1b[1m\x1b[36m');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  BTC Signal Backtester                             ║');
  console.log(`║  ${DAYS} days of ${INTERVAL} candles | forward=${FORWARD} | threshold=${SCORE_THRESHOLD}      ║`);
  console.log('╚════════════════════════════════════════════════════╝\x1b[0m\n');

  const candles = await fetchCandles(INTERVAL, DAYS);
  if (candles.length < 100) {
    log('Not enough candles returned. Check network.', 'error');
    process.exit(1);
  }

  const rows   = backtest(candles, FORWARD);
  const result = stats(rows);

  printReport(result, rows);
  const base = saveResults(result, rows);

  log('Done! Open _rows.csv in Excel or use _stats.json for further analysis.', 'ok');
  log(`Results in: ${DATA_DIR}`, 'ok');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
