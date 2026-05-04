/**
 * server.js — Polymarket Local Lab Server
 *
 * What this does:
 *   1. Proxies Polymarket, Binance, and CLOB API calls server-side
 *      so there are no browser CORS restrictions.
 *   2. Serves the polymarket-dashboard/ frontend files as static content.
 *   3. Injects a <script> into index.html that tells the frontend to use
 *      /api/proxy instead of corsproxy.io — so zero changes needed in the
 *      dashboard source for local mode.
 *   4. Logs all proxied API calls to server-log.jsonl (one JSON line per call).
 *   5. Relays the Binance BTC/USDT WebSocket feed to connected browser clients
 *      via a local WebSocket server at ws://localhost:PORT/ws/btc
 *
 * Proxy support (optional):
 *   Canada is NOT geoblocked by Polymarket — APIs work directly from here.
 *   The POLY_PROXY env var is available as a useful tool regardless:
 *   it lets you route Polymarket requests through any SOCKS5/HTTP proxy, e.g.
 *   to simulate different regions, test resilience, or use a corporate proxy.
 *   Set POLY_PROXY=socks5://127.0.0.1:1080 to enable it.
 *   Binance has no region restrictions and always works directly.
 *
 * Usage:
 *   npm install
 *   node server.js
 *   Open http://localhost:3000
 */

'use strict';

const express  = require('express');
const fetch    = require('node-fetch');
const http     = require('http');
const WebSocket = require('ws');
const fs       = require('fs');
const path     = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const PORT         = process.env.PORT || 3000;
const DASHBOARD_DIR = path.resolve(__dirname, '../polymarket-dashboard');
const LOG_FILE     = path.join(__dirname, 'server-log.jsonl');

// Optional: route Polymarket requests through a local SOCKS5/HTTP proxy
// to bypass US geoblock. Set POLY_PROXY env var to your proxy address.
// e.g. POLY_PROXY=socks5://127.0.0.1:1080
let proxyAgent = null;
if (process.env.POLY_PROXY) {
  try {
    // Requires: npm install socks-proxy-agent
    const { SocksProxyAgent } = require('socks-proxy-agent');
    proxyAgent = new SocksProxyAgent(process.env.POLY_PROXY);
    console.log(`[PROXY] Polymarket requests routing through: ${process.env.POLY_PROXY}`);
  } catch (e) {
    console.warn('[PROXY] socks-proxy-agent not installed. npm install socks-proxy-agent to enable.');
  }
}

// Allowed API domains the proxy will forward to (security allowlist)
const ALLOWED_DOMAINS = [
  'gamma-api.polymarket.com',
  'clob.polymarket.com',
  'data-api.polymarket.com',
  'api.binance.com',
  'corsproxy.io',           // fallback passthrough
];

// ─── App setup ─────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Logging helper ────────────────────────────────────────────────────────
function logCall(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
  fs.appendFile(LOG_FILE, line, () => {}); // non-blocking
  const symbol = entry.ok ? '✓' : '✗';
  console.log(`[${entry.ts || new Date().toISOString().slice(11,19)}] ${symbol} ${entry.status || '???'} ${entry.url || ''}`);
}

// ─── API Proxy ─────────────────────────────────────────────────────────────
// GET /api/proxy?url=<encoded-target-url>
// Server fetches <target-url> with no CORS restrictions and returns the JSON.
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  // Validate against allowlist
  let parsedHost;
  try {
    parsedHost = new URL(targetUrl).hostname;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!ALLOWED_DOMAINS.some(d => parsedHost === d || parsedHost.endsWith('.' + d))) {
    return res.status(403).json({ error: `Domain not in allowlist: ${parsedHost}` });
  }

  const startMs = Date.now();
  try {
    const fetchOpts = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'polymarket-local-lab/1.0',
      },
      // Use proxy agent for Polymarket domains only (not Binance)
      ...(proxyAgent && parsedHost.endsWith('polymarket.com') ? { agent: proxyAgent } : {}),
    };

    const upstream = await fetch(targetUrl, fetchOpts);
    const elapsed  = Date.now() - startMs;

    let data;
    const ct = upstream.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await upstream.json();
    } else {
      const text = await upstream.text();
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
    }

    logCall({ url: targetUrl, status: upstream.status, ok: upstream.ok, ms: elapsed });

    res.status(upstream.status).json(data);
  } catch (err) {
    logCall({ url: targetUrl, status: 0, ok: false, error: err.message });
    res.status(502).json({ error: 'Proxy fetch failed', message: err.message });
  }
});

// ─── Log viewer endpoint ────────────────────────────────────────────────────
// GET /api/log?limit=50   — Returns last N log entries as JSON array
app.get('/api/log', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  if (!fs.existsSync(LOG_FILE)) return res.json([]);
  const lines = fs.readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .slice(-limit)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
  res.json(lines.reverse()); // most recent first
});

// ─── Server status endpoint ────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'local',
    proxy: process.env.POLY_PROXY || null,
    uptime: process.uptime(),
    started: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    btcWs: btcWsConnected,
    connectedClients: wss.clients.size,
  });
});

// ─── Static files (dashboard) ──────────────────────────────────────────────
// Intercept index.html to inject local-mode config before any other scripts.
app.get('/', (req, res) => serveIndexWithConfig(req, res));
app.get('/index.html', (req, res) => serveIndexWithConfig(req, res));

function serveIndexWithConfig(req, res) {
  const indexPath = path.join(DASHBOARD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Dashboard not found. Expected: ' + indexPath);
  }
  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject config snippet right after <head> — sets LOCAL_MODE so api.js uses
  // this server's /api/proxy instead of corsproxy.io
  const injection = `
  <script>
    /* Injected by polymarket-local server.js */
    window.POLY_LOCAL_MODE   = true;
    window.POLY_API_PROXY    = '/api/proxy?url=';
    window.POLY_LOCAL_WS     = 'ws://' + location.host + '/ws/btc';
    window.POLY_SERVER_LOG   = '/api/log';
    window.POLY_SERVER_STATUS = '/api/status';
    console.log('[LOCAL] Running in local server mode — API calls proxied through Node.js');
  </script>`;

  html = html.replace('<head>', '<head>' + injection);
  res.set('Content-Type', 'text/html').send(html);
}

// Serve all other dashboard assets (css, js, etc.) from DASHBOARD_DIR
app.use(express.static(DASHBOARD_DIR));

// Also serve the roadmap and local-only files from this folder
app.use('/local', express.static(__dirname));

// ─── Binance WebSocket Relay ───────────────────────────────────────────────
// Connects to Binance's BTC/USDT 1-minute kline stream and relays candle data
// to all connected browser clients at ws://localhost:PORT/ws/btc
const wss = new WebSocket.Server({ server, path: '/ws/btc' });

let btcWsConnected = false;
let binanceWs      = null;
let reconnectTimer = null;

function connectBinanceFeed() {
  if (binanceWs) { try { binanceWs.close(); } catch {} }

  const BINANCE_WS = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';
  console.log('[BTC-WS] Connecting to Binance feed...');

  binanceWs = new WebSocket(BINANCE_WS);

  binanceWs.on('open', () => {
    btcWsConnected = true;
    console.log('[BTC-WS] Connected to Binance BTC/USDT 1m kline feed');
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  });

  binanceWs.on('message', (raw) => {
    // Relay to all browser clients subscribed to /ws/btc
    if (wss.clients.size === 0) return;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw.toString(), () => {});
      }
    });
  });

  binanceWs.on('error', (err) => {
    btcWsConnected = false;
    console.warn('[BTC-WS] Error:', err.message);
  });

  binanceWs.on('close', () => {
    btcWsConnected = false;
    console.log('[BTC-WS] Disconnected. Reconnecting in 5s...');
    reconnectTimer = setTimeout(connectBinanceFeed, 5000);
  });
}

// Only connect the Binance feed if a browser client subscribes
wss.on('connection', (ws) => {
  console.log(`[WS] Browser client connected (total: ${wss.clients.size})`);
  if (!btcWsConnected) connectBinanceFeed();

  ws.on('close', () => {
    console.log(`[WS] Browser client disconnected (remaining: ${wss.clients.size})`);
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║    Polymarket Local Lab — Running         ║');
  console.log(`║    http://localhost:${PORT}                  ║`);
  console.log(`║    Serving: ${path.basename(DASHBOARD_DIR)}/           ║`);
  console.log('╚══════════════════════════════════════════╝');
  if (process.env.POLY_PROXY) {
    console.log(`[PROXY] Requests routed through: ${process.env.POLY_PROXY}`);
  } else {
    console.log('[INFO] No POLY_PROXY set — calling APIs directly (fine for Canada).');
    console.log('[INFO] Set POLY_PROXY=socks5://127.0.0.1:1080 to enable proxy routing.');
  }
  console.log(`[LOG] API call log: ${LOG_FILE}`);
  console.log('[LOG] Server log endpoint: http://localhost:' + PORT + '/api/log');
  console.log('[INFO] ROADMAP: http://localhost:' + PORT + '/local/ROADMAP.html');
});
