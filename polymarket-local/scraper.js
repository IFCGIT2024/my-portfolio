/**
 * scraper.js — Polymarket BTC 5-Min Market Data Collector
 *
 * Runs continuously. Collects every piece of data Polymarket exposes about
 * BTC up/down 5-minute markets plus live BTC price from Binance.
 *
 * What it saves:
 *   data/markets/YYYY-MM-DD.ndjson   — market snapshots (every 30s)
 *   data/prices/YYYY-MM-DD.ndjson    — BTC price ticks from Binance (every ~5s via WS)
 *   data/books/YYYY-MM-DD.ndjson     — order book snapshots per active market (every 30s)
 *   data/summary.json                — live summary (overwritten every cycle)
 *
 * Format: NDJSON (newline-delimited JSON) — one JSON object per line.
 * Each file grows throughout the day. New file per day automatically.
 *
 * Usage:
 *   node scraper.js
 *   node scraper.js --no-books     (skip order book fetches, faster)
 *   node scraper.js --csv          (also write .csv alongside .ndjson for Excel)
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const { URL } = require('url');

// ── Try to import node-fetch; fall back to built-in https ──
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // Use native fetch (Node 18+)
  fetch = globalThis.fetch;
}

// Try to import ws for Binance WebSocket
let WebSocket;
try { WebSocket = require('ws'); } catch (e) { WebSocket = null; }

// ── Config ──
const MARKET_POLL_MS   = 30_000;   // poll Polymarket every 30s
const BOOK_POLL_MS     = 30_000;   // order book every 30s
const SUMMARY_MS       = 10_000;   // update summary.json every 10s
const DATA_DIR         = path.join(__dirname, 'data');
const ARGS             = process.argv.slice(2);
const NO_BOOKS         = ARGS.includes('--no-books');
const WRITE_CSV        = ARGS.includes('--csv');

// ── Polymarket endpoints ──
const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB  = 'https://clob.polymarket.com';

// ── Binance ──
const BINANCE_WS  = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';
const BINANCE_REST = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';
const BINANCE_KLINES = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=5';

// ════════════════════════════════════════════════════════════════════════════
// FILE HELPERS
// ════════════════════════════════════════════════════════════════════════════

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function ndjsonPath(category) {
  const dir = path.join(DATA_DIR, category);
  ensureDir(dir);
  return path.join(dir, `${today()}.ndjson`);
}

function appendRecord(category, record) {
  const filePath = ndjsonPath(category);
  const line = JSON.stringify({ _ts: new Date().toISOString(), ...record }) + '\n';
  fs.appendFileSync(filePath, line, 'utf8');

  if (WRITE_CSV) {
    appendCSV(category, record);
  }
}

function appendCSV(category, record) {
  const csvPath = ndjsonPath(category).replace('.ndjson', '.csv');
  const flat = flattenObj(record);
  const keys = Object.keys(flat);
  const allKeys = ['_ts', ...keys];

  // Write header if new file
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, allKeys.join(',') + '\n', 'utf8');
  }

  const vals = allKeys.map(k => {
    const v = k === '_ts' ? new Date().toISOString() : (flat[k] ?? '');
    return typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v;
  });
  fs.appendFileSync(csvPath, vals.join(',') + '\n', 'utf8');
}

function flattenObj(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const full = prefix ? `${prefix}_${k}` : k;
    if (obj[k] !== null && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObj(obj[k], full));
    } else {
      acc[full] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k];
    }
    return acc;
  }, {});
}

function writeSummary(data) {
  ensureDir(DATA_DIR);
  fs.writeFileSync(
    path.join(DATA_DIR, 'summary.json'),
    JSON.stringify(data, null, 2),
    'utf8'
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HTTP FETCH HELPER
// ════════════════════════════════════════════════════════════════════════════

function get(url, timeoutMs = 10_000) {
  if (fetch) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'polymarket-scraper/1.0' },
      signal: controller.signal,
    })
      .then(r => { clearTimeout(timer); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .catch(e => { clearTimeout(timer); throw e; });
  }

  // Fallback: raw https/http
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const timer  = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    lib.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'polymarket-scraper/1.0' },
    }, res => {
      clearTimeout(timer);
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Non-JSON response')); }
      });
    }).on('error', e => { clearTimeout(timer); reject(e); });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════════════════

const state = {
  btcPrice:        null,  // latest BTC/USDT price from Binance
  btcChange24h:    null,
  btcVolume24h:    null,
  btcHigh24h:      null,
  btcLow24h:       null,
  lastPriceTick:   null,

  markets:         [],    // latest BTC 5-min markets from Polymarket
  activeMarket:    null,  // soonest-closing active market
  marketCycles:    0,
  priceTicks:      0,
  bookFetches:     0,
  errors:          0,
  startTime:       Date.now(),
};

// ════════════════════════════════════════════════════════════════════════════
// BINANCE PRICE FEED
// ════════════════════════════════════════════════════════════════════════════

let binanceWs = null;

function startBinanceFeed() {
  if (!WebSocket) {
    log('ws module not found — polling Binance REST every 10s instead', 'warn');
    setInterval(pollBinanceREST, 10_000);
    pollBinanceREST();
    return;
  }

  function connect() {
    log('Connecting to Binance WebSocket...', 'info');
    binanceWs = new WebSocket(BINANCE_WS);

    binanceWs.on('open', () => {
      log('● Binance WS connected — receiving live BTC 1m klines', 'ok');
    });

    binanceWs.on('message', data => {
      try {
        const msg = JSON.parse(data.toString());
        const k   = msg.k;
        if (!k) return;

        const tick = {
          openTime:  k.t,
          closeTime: k.T,
          open:      parseFloat(k.o),
          high:      parseFloat(k.h),
          low:       parseFloat(k.l),
          close:     parseFloat(k.c),
          volume:    parseFloat(k.v),
          trades:    k.n,
          isClosed:  k.x,
        };

        state.btcPrice      = tick.close;
        state.lastPriceTick = tick;
        state.priceTicks++;

        // Save every tick (each WS message = latest partial or closed candle)
        appendRecord('prices', tick);

        // When candle closes, also save a summary row with market context
        if (k.x && state.activeMarket) {
          const mkt = state.activeMarket;
          appendRecord('candles-with-market', {
            ...tick,
            marketSlug:   mkt.slug,
            marketEndDate: mkt.endDate,
            secsToClose:  Math.floor((new Date(mkt.endDate) - Date.now()) / 1000),
            yesPrice:     mkt.bestBid,
            noPrice:      1 - mkt.bestBid,
            volume24hr:   mkt.volume24hr,
            liquidity:    mkt.liquidity,
          });
        }
      } catch (e) { /* ignore malformed */ }
    });

    binanceWs.on('error', err => {
      log('Binance WS error: ' + err.message, 'warn');
    });

    binanceWs.on('close', () => {
      log('Binance WS closed — reconnecting in 5s...', 'warn');
      setTimeout(connect, 5_000);
    });
  }

  connect();
}

async function pollBinanceREST() {
  try {
    const data = await get(BINANCE_REST);
    state.btcPrice     = parseFloat(data.lastPrice);
    state.btcChange24h = parseFloat(data.priceChangePercent);
    state.btcVolume24h = parseFloat(data.volume);
    state.btcHigh24h   = parseFloat(data.highPrice);
    state.btcLow24h    = parseFloat(data.lowPrice);

    appendRecord('prices', {
      close:       state.btcPrice,
      change24h:   state.btcChange24h,
      volume24h:   state.btcVolume24h,
      high24h:     state.btcHigh24h,
      low24h:      state.btcLow24h,
      source:      'rest',
    });
    state.priceTicks++;
  } catch (e) {
    log('Binance REST error: ' + e.message, 'warn');
    state.errors++;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// POLYMARKET MARKET SCRAPER
// ════════════════════════════════════════════════════════════════════════════

async function fetchMarkets() {
  try {
    // Get all BTC 5-min markets (active + recently ended)
    const url = `${GAMMA}/markets?search=btc-updown-5m&order=endDate&ascending=false&limit=50`;
    const list = await get(url);
    if (!Array.isArray(list)) throw new Error('Non-array response from Gamma');

    state.markets = list;
    state.marketCycles++;

    const now = Date.now();

    // Find soonest-closing active market
    const active = list
      .filter(m => m.active && !m.closed && m.endDate && new Date(m.endDate).getTime() > now)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

    state.activeMarket = active[0] ? enrichMarket(active[0]) : null;

    // Save a snapshot for EVERY market in the list
    for (const raw of list) {
      const m = enrichMarket(raw);
      appendRecord('markets', m);
    }

    log(
      `Markets: ${list.length} found | active: ${active.length} | ` +
      (state.activeMarket
        ? `next closes in ${Math.floor((new Date(state.activeMarket.endDate) - now) / 1000)}s @ YES=${(state.activeMarket.bestBid * 100).toFixed(1)}¢`
        : 'none active'),
      'ok'
    );

    return state.activeMarket;
  } catch (e) {
    log('Market fetch error: ' + e.message, 'error');
    state.errors++;
    return null;
  }
}

function enrichMarket(raw) {
  let outcomes = [], prices = [], clobIds = [];
  try { outcomes = JSON.parse(raw.outcomes      || '[]'); } catch(e) {}
  try { prices   = JSON.parse(raw.outcomePrices || '[]'); } catch(e) {}
  try { clobIds  = JSON.parse(raw.clobTokenIds  || '[]'); } catch(e) {}

  const bestBid = parseFloat(raw.bestBid)  || parseFloat(prices[0]) || 0.5;
  const bestAsk = parseFloat(raw.bestAsk)  || bestBid + 0.01;
  const now     = Date.now();
  const endMs   = raw.endDate ? new Date(raw.endDate).getTime() : 0;

  return {
    conditionId:      raw.conditionId || raw.id || '',
    slug:             raw.slug || '',
    question:         raw.question || '',
    endDate:          raw.endDate   || null,
    startDate:        raw.startDate || null,
    secsToClose:      endMs > now ? Math.floor((endMs - now) / 1000) : -1,
    active:           !!raw.active,
    closed:           !!raw.closed,

    // Prices — the most important fields
    bestBid,
    bestAsk,
    yesPrice:         parseFloat(prices[0]) || bestBid,
    noPrice:          parseFloat(prices[1]) || (1 - bestBid),
    spread:           parseFloat(raw.spread) || (bestAsk - bestBid),
    lastTradePrice:   parseFloat(raw.lastTradePrice) || bestBid,
    midpoint:         (bestBid + bestAsk) / 2,

    // Price changes
    change1h:  parseFloat(raw.oneHourPriceChange)  || 0,
    change1d:  parseFloat(raw.oneDayPriceChange)   || 0,
    change1wk: parseFloat(raw.oneWeekPriceChange)  || 0,

    // Volume & liquidity
    volume:     parseFloat(raw.volume)     || 0,
    volume24hr: parseFloat(raw.volume24hr) || 0,
    volume1wk:  parseFloat(raw.volume1wk)  || 0,
    liquidity:  parseFloat(raw.liquidity)  || 0,

    // Fees & rewards
    feesEnabled:    !!raw.feesEnabled,
    makerFee:       parseFloat(raw.makerBaseFee) || 0,
    takerFee:       parseFloat(raw.takerBaseFee) || 0,
    rewardsMinSize: parseFloat(raw.rewardsMinSize)   || null,
    rewardsMaxSpread: parseFloat(raw.rewardsMaxSpread) || null,

    // Token IDs for order book queries
    yesTokenId: clobIds[0] || null,
    noTokenId:  clobIds[1] || null,

    // Current BTC context
    btcPrice: state.btcPrice,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ORDER BOOK SCRAPER (CLOB API — direct, no CORS issue server-side)
// ════════════════════════════════════════════════════════════════════════════

async function fetchOrderBook(market) {
  if (!market || !market.yesTokenId || NO_BOOKS) return;

  try {
    const [yesBook, noBook] = await Promise.all([
      get(`${CLOB}/books?token_id=${market.yesTokenId}`).catch(() => null),
      market.noTokenId ? get(`${CLOB}/books?token_id=${market.noTokenId}`).catch(() => null) : null,
    ]);

    const record = {
      conditionId: market.conditionId,
      slug:        market.slug,
      secsToClose: market.secsToClose,
      btcPrice:    state.btcPrice,
      yes: yesBook ? {
        bids: (yesBook.bids || []).slice(0, 10).map(b => ({ price: parseFloat(b.price), size: parseFloat(b.size) })),
        asks: (yesBook.asks || []).slice(0, 10).map(a => ({ price: parseFloat(a.price), size: parseFloat(a.size) })),
        bestBid: yesBook.bids?.[0]  ? parseFloat(yesBook.bids[0].price)  : null,
        bestAsk: yesBook.asks?.[0]  ? parseFloat(yesBook.asks[0].price)  : null,
        bidDepth: (yesBook.bids || []).slice(0, 5).reduce((s, b) => s + parseFloat(b.size), 0),
        askDepth: (yesBook.asks || []).slice(0, 5).reduce((s, a) => s + parseFloat(a.size), 0),
      } : null,
      no: noBook ? {
        bids: (noBook.bids || []).slice(0, 10).map(b => ({ price: parseFloat(b.price), size: parseFloat(b.size) })),
        asks: (noBook.asks || []).slice(0, 10).map(a => ({ price: parseFloat(a.price), size: parseFloat(a.size) })),
        bestBid: noBook.bids?.[0]  ? parseFloat(noBook.bids[0].price)  : null,
        bestAsk: noBook.asks?.[0]  ? parseFloat(noBook.asks[0].price)  : null,
        bidDepth: (noBook.bids || []).slice(0, 5).reduce((s, b) => s + parseFloat(b.size), 0),
        askDepth: (noBook.asks || []).slice(0, 5).reduce((s, a) => s + parseFloat(a.size), 0),
      } : null,
    };

    appendRecord('books', record);
    state.bookFetches++;
    log(`Order book: YES bid=${record.yes?.bestBid?.toFixed(3) || 'n/a'} ask=${record.yes?.bestAsk?.toFixed(3) || 'n/a'} | bidDepth=${record.yes?.bidDepth?.toFixed(0) || 0} askDepth=${record.yes?.askDepth?.toFixed(0) || 0}`, 'book');
  } catch (e) {
    log('Order book error: ' + e.message, 'warn');
    state.errors++;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════

function updateSummary() {
  const uptimeSecs = Math.floor((Date.now() - state.startTime) / 1000);
  const activeM    = state.activeMarket;
  writeSummary({
    lastUpdated:     new Date().toISOString(),
    uptimeSecs,
    priceTicks:      state.priceTicks,
    marketCycles:    state.marketCycles,
    bookFetches:     state.bookFetches,
    errors:          state.errors,
    btcPrice:        state.btcPrice,
    btcChange24h:    state.btcChange24h,
    activeMarket: activeM ? {
      slug:       activeM.slug,
      endDate:    activeM.endDate,
      secsToClose: activeM.secsToClose,
      yesPrice:   activeM.bestBid,
      noPrice:    1 - activeM.bestBid,
      volume24hr: activeM.volume24hr,
      liquidity:  activeM.liquidity,
      spread:     activeM.spread,
    } : null,
    totalMarkets:    state.markets.length,
    dataDir:         DATA_DIR,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// LOGGING
// ════════════════════════════════════════════════════════════════════════════

const COLORS = {
  ok:   '\x1b[32m',   // green
  warn: '\x1b[33m',   // yellow
  error:'\x1b[31m',   // red
  info: '\x1b[36m',   // cyan
  book: '\x1b[35m',   // magenta
  reset:'\x1b[0m',
};

function log(msg, level = 'info') {
  const t   = new Date().toLocaleTimeString('en-CA', { hour12: false });
  const col = COLORS[level] || COLORS.info;
  console.log(`${col}[${t}]${COLORS.reset} ${msg}`);
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('\x1b[1m\x1b[36m');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Polymarket BTC Scraper — Data Collection Active   ║');
  console.log('╚════════════════════════════════════════════════════╝\x1b[0m');
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Market poll: every ${MARKET_POLL_MS / 1000}s | Books: ${NO_BOOKS ? 'OFF' : 'every ' + BOOK_POLL_MS / 1000 + 's'}`);
  console.log(`CSV output: ${WRITE_CSV ? 'ON' : 'OFF (use --csv to enable)'}`);
  console.log('');

  ensureDir(DATA_DIR);

  // Start Binance price feed (WS if available, else REST poll)
  startBinanceFeed();
  // Give Binance a moment to connect, then start Polymarket polling
  await new Promise(r => setTimeout(r, 2000));

  // First market fetch immediately
  const firstMarket = await fetchMarkets();
  if (firstMarket) fetchOrderBook(firstMarket);

  // Market poll loop
  setInterval(async () => {
    const market = await fetchMarkets();
    if (market && !NO_BOOKS) fetchOrderBook(market);
  }, MARKET_POLL_MS);

  // Summary update loop
  setInterval(updateSummary, SUMMARY_MS);
  updateSummary();

  // Status printout every 60s
  setInterval(() => {
    const uptime = Math.floor((Date.now() - state.startTime) / 1000);
    const mm = Math.floor(uptime / 60);
    const ss = uptime % 60;
    log(
      `─── Status: BTC $${state.btcPrice?.toLocaleString() || '?'} | ` +
      `${state.priceTicks} price ticks | ${state.marketCycles} market polls | ` +
      `${state.bookFetches} book snaps | ${state.errors} errors | uptime ${mm}m${ss}s`,
      'info'
    );
  }, 60_000);

  log('Scraper running. Press Ctrl+C to stop.', 'info');
  log('Files saved to: ' + DATA_DIR, 'info');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
