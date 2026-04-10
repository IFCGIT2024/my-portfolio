/**
 * btc-algo.js — BTC 5-Minute Market Algo Trading Engine
 *
 * Modules:
 *   BinanceFeed        — WebSocket to Binance BTC/USDT 1m klines (+ REST fallback)
 *   IndicatorEngine    — RSI, Momentum, MACD, Volume Spike
 *   CompositeScorer    — Weighted signal → 0-100 score
 *   BTCMarketTracker   — Polls Gamma API for active btc-updown-5m markets
 *   MarketFlowAnalyzer — Volume rate, price drift, order book imbalance
 *   LiquidityRewards   — Scores/simulates maker rebate potential per market
 *   AutoTrader         — Checks each closed candle, fires paper trades
 *   ChartRenderer      — Canvas price chart with volume bars + MAs
 *   BTCAlgoUI          — Wires everything to DOM, manages tab lifecycle
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// 1. BINANCE FEED
// Connects to Binance WebSocket for live 1-min BTC/USDT klines.
// Falls back to REST polling if WS fails or when running on file://.
// Each candle: { t (open time ms), o, h, l, c, v (all floats), closed (bool) }
// ═══════════════════════════════════════════════════════════════════════════
const BinanceFeed = (() => {
  const WS_URL      = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';
  const REST_URL    = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60';
  const MAX_CANDLES = 60;

  let candles    = [];
  let ws         = null;
  let connected  = false;
  let restTimer  = null;
  let _onCandle  = null; // callback(candle, isClosed)
  let _onStatus  = null; // callback(msg, isOk)

  function parseKline(k) {
    return {
      t: k.t || parseInt(k[0]),
      o: parseFloat(k.o || k[1]),
      h: parseFloat(k.h || k[2]),
      l: parseFloat(k.l || k[3]),
      c: parseFloat(k.c || k[4]),
      v: parseFloat(k.v || k[5]),
      closed: k.x !== undefined ? k.x : true,
    };
  }

  function pushCandle(candle) {
    // Replace last candle if same open time and not yet closed; otherwise append
    if (candles.length > 0 && candles[candles.length - 1].t === candle.t) {
      candles[candles.length - 1] = candle;
    } else {
      candles.push(candle);
    }
    if (candles.length > MAX_CANDLES) candles = candles.slice(-MAX_CANDLES);
  }

  function connectWS() {
    // If local mode, use the server-relayed WebSocket instead
    const wsUrl = (window.POLY_LOCAL_WS) ? window.POLY_LOCAL_WS : WS_URL;

    if (_onStatus) _onStatus('Connecting to ' + (window.POLY_LOCAL_WS ? 'local relay' : 'Binance') + '...', false);

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      connected = true;
      if (_onStatus) _onStatus('● Live — Binance WS', true);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        const k = data.k || data; // local relay may send raw kline
        const candle = parseKline(k);
        pushCandle(candle);
        if (_onCandle) _onCandle(candle, candle.closed);
      } catch (e) { /* ignore malformed */ }
    };

    ws.onerror = () => {
      connected = false;
      if (_onStatus) _onStatus('WS error — switching to REST poll', false);
      fallbackToREST();
    };

    ws.onclose = () => {
      connected = false;
      if (_onStatus) _onStatus('WS closed — switching to REST poll', false);
      fallbackToREST();
    };
  }

  function fallbackToREST() {
    if (ws) { try { ws.close(); } catch {} ws = null; }
    if (restTimer) return; // already polling
    if (_onStatus) _onStatus('● REST polling (30s)', false);

    async function poll() {
      try {
        const res   = await fetch(REST_URL);
        const rows  = await res.json();
        if (!Array.isArray(rows)) return;
        const prev  = candles.length;
        rows.forEach(r => pushCandle(parseKline(r)));
        if (_onStatus) _onStatus('● REST polling (30s)', true);
        // Fire candle callback for the last (most recent) candle
        if (candles.length > 0 && _onCandle) {
          _onCandle(candles[candles.length - 1], true);
        }
      } catch (e) {
        if (_onStatus) _onStatus('● Binance fetch failed: ' + e.message, false);
      }
    }

    poll();
    restTimer = setInterval(poll, 30_000);
  }

  function start(onCandle, onStatus) {
    _onCandle = onCandle;
    _onStatus = onStatus;
    connectWS();
    // Bootstrap with REST to have candles immediately
    fetch(REST_URL)
      .then(r => r.json())
      .then(rows => {
        if (!Array.isArray(rows)) return;
        rows.forEach(r => pushCandle(parseKline(r)));
        if (candles.length > 0 && _onCandle) {
          _onCandle(candles[candles.length - 1], false);
        }
      })
      .catch(() => {});
  }

  function stop() {
    if (ws) { try { ws.close(); } catch {} ws = null; }
    if (restTimer) { clearInterval(restTimer); restTimer = null; }
  }

  return { start, stop, get candles() { return candles; }, get connected() { return connected; } };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 2. INDICATOR ENGINE
// Pure functions — take the candle array, return { value, signal, pct (0-1) }
// signal values: 'UP', 'DOWN', 'NEUTRAL'
// ═══════════════════════════════════════════════════════════════════════════
const IndicatorEngine = (() => {

  // ── EMA helper ──
  function ema(values, period) {
    if (values.length < period) return null;
    const k = 2 / (period + 1);
    let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
    return e;
  }

  // ── RSI (14) ──
  // Returns 0-100. >60=UP, <40=DOWN
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
    const signal = rsi > 60 ? 'UP' : rsi < 40 ? 'DOWN' : 'NEUTRAL';
    return { value: Math.round(rsi * 10) / 10, signal, pct: rsi / 100 };
  }

  // ── Momentum (5) ──
  // % change over last 5 candles. >+0.2%=UP, <-0.2%=DOWN
  function calcMomentum(candles, period = 5) {
    if (candles.length < period + 1) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
    const current  = candles[candles.length - 1].c;
    const past     = candles[candles.length - 1 - period].c;
    const pctChange = ((current - past) / past) * 100;
    const signal   = pctChange > 0.2 ? 'UP' : pctChange < -0.2 ? 'DOWN' : 'NEUTRAL';
    // Map pctChange to 0-1 using ±1% = extremes
    const pct = Math.min(1, Math.max(0, (pctChange + 1) / 2));
    return { value: Math.round(pctChange * 1000) / 1000, signal, pct };
  }

  // ── MACD (12, 26, 9) ──
  // Positive histogram = UP, negative = DOWN
  function calcMACD(candles, fast = 12, slow = 26, signal = 9) {
    if (candles.length < slow + signal) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
    const closes = candles.map(c => c.c);
    const emaFast = ema(closes, fast);
    const emaSlow = ema(closes, slow);
    if (emaFast === null || emaSlow === null) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
    const macdLine = emaFast - emaSlow;

    // Build MACD line history for signal EMA
    const macdHistory = [];
    for (let i = slow - 1; i < closes.length; i++) {
      const ef = ema(closes.slice(0, i + 1), fast);
      const es = ema(closes.slice(0, i + 1), slow);
      if (ef !== null && es !== null) macdHistory.push(ef - es);
    }

    const signalLine = ema(macdHistory, signal);
    if (signalLine === null) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
    const histogram = macdLine - signalLine;

    const sig = histogram > 0 ? 'UP' : histogram < 0 ? 'DOWN' : 'NEUTRAL';
    // Map histogram to 0-1 (clamp ±5 as extremes for BTC/USDT price scale)
    const pct = Math.min(1, Math.max(0, (histogram / 5 + 1) / 2));
    return { value: Math.round(histogram * 10000) / 10000, signal: sig, pct };
  }

  // ── Volume Spike ──
  // Current candle vol / 20-candle avg. >1.5 = spike. Direction from price change.
  function calcVolSpike(candles, lookback = 20) {
    if (candles.length < lookback + 1) return { value: null, signal: 'NEUTRAL', pct: 0.5 };
    const recent   = candles.slice(-lookback);
    const avgVol   = recent.reduce((s, c) => s + c.v, 0) / lookback;
    const curVol   = candles[candles.length - 1].v;
    const ratio    = avgVol > 0 ? curVol / avgVol : 1;
    const isSpike  = ratio > 1.5;
    const priceDir = candles[candles.length - 1].c >= candles[candles.length - 1].o;
    const signal   = isSpike ? (priceDir ? 'UP' : 'DOWN') : 'NEUTRAL';
    const pct      = Math.min(1, ratio / 3); // 3× average = 100%
    return { value: Math.round(ratio * 100) / 100, signal, pct };
  }

  return { calcRSI, calcMomentum, calcMACD, calcVolSpike };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 3. COMPOSITE SCORER
// Weights: RSI 30%, Momentum 35%, MACD 25%, Volume 10%
// Converts each indicator's 0-1 pct to a 0-100 score.
// Score >60 = BUY UP, <40 = BUY DOWN, 40-60 = NO TRADE
// ═══════════════════════════════════════════════════════════════════════════
const CompositeScorer = (() => {
  const WEIGHTS = { rsi: 0.30, momentum: 0.35, macd: 0.25, vol: 0.10 };

  function score(indicators) {
    const { rsi, momentum, macd, vol } = indicators;
    // Only include indicators with a valid value
    let totalWeight = 0;
    let weighted = 0;

    function add(ind, w) {
      if (ind.value !== null) {
        weighted    += ind.pct * w;
        totalWeight += w;
      }
    }
    add(rsi,      WEIGHTS.rsi);
    add(momentum, WEIGHTS.momentum);
    add(macd,     WEIGHTS.macd);
    add(vol,      WEIGHTS.vol);

    if (totalWeight === 0) return { score: 50, label: 'NEUTRAL', action: null, breakdown: [] };

    const raw    = (weighted / totalWeight) * 100;
    const s      = Math.round(raw);
    const label  = s >= 70 ? 'STRONG UP' : s >= 60 ? 'BUY UP' : s <= 30 ? 'STRONG DOWN' : s <= 40 ? 'BUY DOWN' : 'NEUTRAL';
    const action = s >= 60 ? 'UP' : s <= 40 ? 'DOWN' : null;

    // Count how many indicators agree with the dominant direction
    const allInds = [rsi, momentum, macd, vol].filter(i => i.value !== null);
    const upVotes = allInds.filter(i => i.signal === 'UP').length;
    const dnVotes = allInds.filter(i => i.signal === 'DOWN').length;

    const breakdown = [
      `RSI: ${rsi.value !== null ? rsi.value : 'N/A'} (${rsi.signal}) × 30%`,
      `Mom: ${momentum.value !== null ? '+' + momentum.value + '%' : 'N/A'} (${momentum.signal}) × 35%`,
      `MACD: ${macd.value !== null ? macd.value : 'N/A'} (${macd.signal}) × 25%`,
      `Vol: ${vol.value !== null ? vol.value + '×' : 'N/A'} (${vol.signal}) × 10%`,
    ];

    return { score: s, label, action, breakdown, upVotes, dnVotes, totalInds: allInds.length };
  }

  return { score };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 4. BTC MARKET TRACKER
// Polls Gamma API every 30s for active btc-updown-5m markets.
// Tracks price history, volume accumulation, upcoming markets.
// ═══════════════════════════════════════════════════════════════════════════
const BTCMarketTracker = (() => {
  const POLL_INTERVAL = 30_000;
  let markets      = [];  // all bt updown markets found
  let timer        = null;
  let _onChange    = null;
  let _onStatus    = null;
  let _priceHistory = {}; // conditionId → [{ts, yesPrice, noPrice, volume}]

  async function fetchMarkets() {
    try {
      // Search for BTC 5-min markets, get active + recently ended ones
      const url = 'https://gamma-api.polymarket.com/markets?search=btc-updown-5m&order=endDate&ascending=false&limit=20';
      const data = await PolyAPI.rawFetch(url);
      if (!data.ok) throw new Error('HTTP ' + data.status);
      const list = Array.isArray(data.data) ? data.data : [];

      // Parse and enrich each market
      markets = list.map(m => {
        const norm = PolyAPI.normalizeMarket(m);
        // Track price history per market
        const id = norm.conditionId || norm.id;
        if (!_priceHistory[id]) _priceHistory[id] = [];
        const history = _priceHistory[id];
        const last = history[history.length - 1];
        // Only push if price changed or first entry
        if (!last || last.yesPrice !== norm.bestBid || last.volume !== norm.volume24hr) {
          history.push({
            ts: Date.now(),
            yesPrice: norm.bestBid,
            noPrice: 1 - norm.bestBid,
            volume: norm.volume24hr || 0,
          });
          if (history.length > 120) _priceHistory[id] = history.slice(-120);
        }
        return { ...norm, priceHistory: _priceHistory[id] };
      });

      if (_onStatus) _onStatus('● ' + markets.length + ' BTC markets found', true);
      if (_onChange) _onChange(markets);
    } catch (e) {
      if (_onStatus) _onStatus('● Market fetch error: ' + e.message, false);
    }
  }

  function start(onChange, onStatus) {
    _onChange = onChange;
    _onStatus = onStatus;
    fetchMarkets();
    timer = setInterval(fetchMarkets, POLL_INTERVAL);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Get the currently active market (closes soonest in the future)
  function getActive() {
    const now = Date.now();
    const active = markets
      .filter(m => m.endDate && new Date(m.endDate).getTime() > now)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    return active[0] || null;
  }

  // Get upcoming markets (open within the next 10 minutes)
  function getUpcoming() {
    const now  = Date.now();
    const soon = now + 10 * 60 * 1000;
    return markets.filter(m => {
      const start = m.startDate ? new Date(m.startDate).getTime() : 0;
      return start > now && start < soon;
    });
  }

  // Compute crowd drift for a market — how far YES has moved since market opened
  function getCrowdDrift(market) {
    const history = market.priceHistory || [];
    if (history.length < 2) return null;
    const first = history[0].yesPrice || 0.5;
    const last  = history[history.length - 1].yesPrice || 0.5;
    return { drift: last - first, direction: last > first ? 'YES' : last < first ? 'NO' : 'FLAT' };
  }

  // Volume accumulation rate: USDC per minute flowing into this market
  function getVolumeRate(market) {
    const history = market.priceHistory || [];
    if (history.length < 2) return null;
    const first = history[0];
    const last  = history[history.length - 1];
    const mins  = (last.ts - first.ts) / 60_000;
    if (mins < 0.1) return null;
    return (last.volume - first.volume) / mins;
  }

  return { start, stop, getActive, getUpcoming, getCrowdDrift, getVolumeRate, get markets() { return markets; } };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 5. LIQUIDITY REWARDS CALCULATOR
// Implements the Polymarket quadratic scoring formula.
// S(v, s) = ((v - s) / v)^2 * b
// Qone, Qtwo, Qmin (two-sided scoring) per the docs.
// Shows how much a maker could earn by quoting a BTC 5-min market.
// ═══════════════════════════════════════════════════════════════════════════
const LiquidityRewards = (() => {

  // Score a single order's position
  // v = max spread (cents), s = actual spread from midpoint (cents), b = multiplier
  function scoreOrder(v, s, b = 1) {
    if (s >= v || s < 0) return 0;
    return Math.pow((v - s) / v, 2) * b;
  }

  // Score a full set of orders on one side of the market
  // orders: [{spreadCents, sizePct, isBid}] — sizePct = fraction of total position
  function scoreSide(orders, v) {
    return orders.reduce((sum, o) => sum + scoreOrder(v, o.spreadCents) * o.size, 0);
  }

  // Full two-sided scoring for a market maker position
  // Position: { bidsOnYes: [{spreadCents, size}], asksOnYes: [{spreadCents, size}], 
  //             bidsOnNo: [{spreadCents, size}], asksOnNo: [{spreadCents, size}] }
  // Returns { Qone, Qtwo, Qmin, analysis }
  function scorePosition(position, v, midpoint = 0.50) {
    const c = 3.0; // scaling factor (always 3.0 per docs)

    // Qone = bids on YES + asks on NO
    const Qone = scoreSide(position.bidsOnYes || [], v) + scoreSide(position.asksOnNo || [], v);

    // Qtwo = asks on YES + bids on NO
    const Qtwo = scoreSide(position.asksOnYes || [], v) + scoreSide(position.bidsOnNo || [], v);

    // Qmin based on midpoint range
    let Qmin;
    let singleSided = false;
    if (midpoint >= 0.10 && midpoint <= 0.90) {
      // Single-sided can still score at 1/c
      Qmin = Math.max(Math.min(Qone, Qtwo), Math.max(Qone / c, Qtwo / c));
    } else {
      // Must be double-sided near extremes
      Qmin = Math.min(Qone, Qtwo);
    }

    return { Qone, Qtwo, Qmin, isTwoSided: Qone > 0 && Qtwo > 0 };
  }

  // Estimate daily rebate for a position given market stats
  // marketShare: estimated fraction of total Qmin you represent (0-1)
  // dailyRewardPool: USDC reward pool for this market per day
  function estimateRebate(Qmin, estimatedMarketShare, dailyRewardPool) {
    return Qmin * estimatedMarketShare * dailyRewardPool;
  }

  // Generate a worked example for a BTC 5-min market
  // maxSpread: from market's max_incentive_spread field (default 3 cents for BTC)
  // midpoint: current market price (e.g. 0.50 = 50¢)
  function workedExample(maxSpread = 3, midpoint = 0.50) {
    const v = maxSpread;

    // Example position: tight two-sided quoting near the mid
    const position = {
      bidsOnYes: [
        { spreadCents: 0.5, size: 200 },   // 200 shares bid @ mid - 0.5¢
        { spreadCents: 1.0, size: 100 },   // 100 shares bid @ mid - 1¢
      ],
      asksOnYes: [
        { spreadCents: 0.5, size: 200 },   // 200 shares ask @ mid + 0.5¢
        { spreadCents: 1.0, size: 100 },   // 100 shares ask @ mid + 1¢
      ],
      bidsOnNo: [
        { spreadCents: 1.0, size: 100 },
      ],
      asksOnNo: [
        { spreadCents: 1.0, size: 100 },
      ],
    };

    const result = scorePosition(position, v, midpoint);

    // Individual order scores for display
    const orders = [
      { label: `200Q bid on YES @ ${midpoint - 0.005} (${0.5}¢ spread)`, s: 0.5, v, score: scoreOrder(v, 0.5) * 200 },
      { label: `100Q bid on YES @ ${midpoint - 0.01} (${1}¢ spread)`,   s: 1,   v, score: scoreOrder(v, 1)   * 100 },
      { label: `200Q ask on YES @ ${midpoint + 0.005} (${0.5}¢ spread)`,s: 0.5, v, score: scoreOrder(v, 0.5) * 200 },
      { label: `100Q ask on YES @ ${midpoint + 0.01} (${1}¢ spread)`,   s: 1,   v, score: scoreOrder(v, 1)   * 100 },
      { label: `100Q bid on NO  @ ${1 - midpoint - 0.01} (${1}¢ spread)`,s: 1,  v, score: scoreOrder(v, 1)   * 100 },
      { label: `100Q ask on NO  @ ${1 - midpoint + 0.01} (${1}¢ spread)`,s: 1,  v, score: scoreOrder(v, 1)   * 100 },
    ];

    // Maker rebate formula for each fill:
    // fee_equivalent = C × 0.072 × p × (1 - p)   (Crypto: feeRate=0.072)
    // rebate_pool = 20% of taker fees in this market
    // your rebate = (your_fee_eq / total_fee_eq) × rebate_pool
    const exampleFills = [
      { C: 200, p: midpoint, label: `200 YES filled @ ${midpoint}` },
      { C: 100, p: midpoint + 0.01, label: `100 YES filled @ ${(midpoint + 0.01).toFixed(2)}` },
    ];
    const feeRate = 0.072;
    const makerRebatePct = 0.20; // 20% of taker fees go to maker rebates for Crypto
    const fillAnalysis = exampleFills.map(f => {
      const feeEquiv = f.C * feeRate * f.p * (1 - f.p);
      return { ...f, feeEquiv: Math.round(feeEquiv * 10000) / 10000 };
    });

    return { position, result, orders, midpoint, v, fillAnalysis, feeRate, makerRebatePct };
  }

  return { scoreOrder, scoreSide, scorePosition, estimateRebate, workedExample };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 6. AUTO TRADER
// Runs on each closed candle. Checks score against threshold.
// Applies confidence filter. Fires Trader.buy() if conditions met.
// ═══════════════════════════════════════════════════════════════════════════
const AutoTrader = (() => {
  let enabled      = false;
  let _onDecision  = null; // callback(decision)

  function getSettings() {
    return {
      threshold:  parseInt(document.getElementById('set-buy-threshold')?.value || 60),
      shares:     parseInt(document.getElementById('set-shares')?.value || 50),
      maxPos:     parseInt(document.getElementById('set-max-pos')?.value || 3),
      confidence: document.getElementById('set-confidence')?.value || '2',
    };
  }

  function countOpenBTCPositions() {
    if (typeof Trader === 'undefined') return 0;
    const metrics = Trader.getPortfolioMetrics([]);
    return (metrics.positions || []).filter(p => 
      p.marketQuestion && p.marketQuestion.toLowerCase().includes('btc')
    ).length;
  }

  function check(composite, market) {
    const cfg = getSettings();
    const { score, action, upVotes, dnVotes, totalInds } = composite;

    if (!enabled) return { fired: false, reason: 'Auto-trade is OFF' };
    if (!action) return { fired: false, reason: `Score ${score} — neutral zone (40-60)` };
    if (!market) return { fired: false, reason: 'No active BTC market found' };

    // Confidence filter
    const agree = action === 'UP' ? upVotes : dnVotes;
    const minAgree = cfg.confidence === '3' ? 3 : cfg.confidence === '2' ? 2 : 1;
    if (agree < minAgree) {
      return { fired: false, reason: `Only ${agree}/${totalInds} indicators agree — need ${minAgree}` };
    }

    // Position limit
    const openBTC = countOpenBTCPositions();
    if (openBTC >= cfg.maxPos) {
      return { fired: false, reason: `At max ${cfg.maxPos} open BTC positions` };
    }

    // Score threshold
    if (score < cfg.threshold && action === 'UP')  return { fired: false, reason: `Score ${score} < threshold ${cfg.threshold}` };
    if ((100 - score) < cfg.threshold && action === 'DOWN') return { fired: false, reason: `Score ${score} — DOWN signal not strong enough` };

    // Edge calculation: indicator score vs market implied probability
    const marketProb   = action === 'UP' ? (market.bestBid || 0.5) : (1 - (market.bestBid || 0.5));
    const indicatorProb = score / 100;
    const edge = Math.round((indicatorProb - marketProb) * 100);

    if (edge < 5) {
      return { fired: false, reason: `Edge only ${edge}% — market already priced in (${(marketProb * 100).toFixed(0)}¢ vs our ${score})` };
    }

    // Fire the trade
    const side = action;
    const price = side === 'UP' ? (market.bestBid || 0.5) : (1 - (market.bestBid || 0.5));
    if (typeof Trader !== 'undefined') {
      Trader.buy(market, side === 'UP' ? 'YES' : 'NO', cfg.shares);
    }

    return {
      fired:  true,
      action: side,
      score,
      shares: cfg.shares,
      price:  price.toFixed(3),
      edge:   edge + '%',
      market: market.question || market.slug,
      reason: `BUY ${side} @ ${price.toFixed(3)} — score ${score}, edge +${edge}%, ${agree}/${totalInds} indicators agree`,
    };
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  return { check, toggle, get enabled() { return enabled; } };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 7. CHART RENDERER
// Draws price line + volume bars + 20 EMA on a <canvas>.
// Call render(candles) each time candle data updates.
// ═══════════════════════════════════════════════════════════════════════════
const ChartRenderer = (() => {
  const DISPLAY = 30; // candles shown

  function render(candles, canvasId = 'btc-chart') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W      = canvas.width;
    const H      = canvas.height;
    const VPAD   = 10;
    const VOL_H  = 30;
    const PRICE_H = H - VOL_H - VPAD;

    ctx.clearRect(0, 0, W, H);

    const data = candles.slice(-DISPLAY);
    if (data.length < 2) {
      ctx.fillStyle = '#8892a4';
      ctx.font = '12px Segoe UI';
      ctx.fillText('Waiting for candle data...', W / 2 - 70, H / 2);
      return;
    }

    const n         = data.length;
    const barW      = W / n;
    const prices    = data.map(c => c.c);
    const minP      = Math.min(...prices) * 0.9999;
    const maxP      = Math.max(...prices) * 1.0001;
    const priceRange = maxP - minP;

    const vols      = data.map(c => c.v);
    const maxVol    = Math.max(...vols, 1);

    function px(price) {
      return VPAD + PRICE_H - ((price - minP) / priceRange) * PRICE_H;
    }
    function vx(i) { return i * barW + barW * 0.1; }

    // ── Background grid ──
    ctx.strokeStyle = 'rgba(42,47,69,0.6)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(t => {
      const y = VPAD + PRICE_H * t;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    });

    // ── Volume bars ──
    data.forEach((c, i) => {
      const x     = vx(i);
      const bw    = barW * 0.8;
      const bh    = (c.v / maxVol) * VOL_H;
      const y     = H - bh;
      const isUp  = c.c >= c.o;
      ctx.fillStyle = isUp ? 'rgba(0,230,118,0.3)' : 'rgba(255,82,82,0.3)';
      ctx.fillRect(x, y, bw, bh);
    });

    // ── 20-EMA line ──
    if (data.length >= 20) {
      const closes = data.map(c => c.c);
      let emaLine  = [];
      let e        = closes.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
      const k      = 2 / 21;
      for (let i = 20; i < closes.length; i++) {
        e = closes[i] * k + e * (1 - k);
        emaLine.push({ x: vx(i) + barW * 0.4, y: px(e) });
      }
      if (emaLine.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,215,64,0.6)';
        ctx.lineWidth = 1;
        ctx.moveTo(emaLine[0].x, emaLine[0].y);
        emaLine.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    }

    // ── Price line ──
    const isOverallUp = data[data.length - 1].c >= data[0].c;
    ctx.beginPath();
    ctx.strokeStyle = isOverallUp ? '#00e676' : '#ff5252';
    ctx.lineWidth   = 2;
    data.forEach((c, i) => {
      const x = vx(i) + barW * 0.4;
      const y = px(c.c);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ── Price glow (last point) ──
    const lastX = vx(data.length - 1) + barW * 0.4;
    const lastY = px(data[data.length - 1].c);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = isOverallUp ? '#00e676' : '#ff5252';
    ctx.fill();

    // ── Current price label ──
    const lastPrice = data[data.length - 1].c;
    ctx.fillStyle = isOverallUp ? '#00e676' : '#ff5252';
    ctx.font      = 'bold 11px Consolas, monospace';
    ctx.fillText('$' + lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 4, lastY - 5 > 10 ? lastY - 5 : lastY + 14);
  }

  return { render };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 8. BTC ALGO UI
// Wires all modules to the DOM. Only runs when the BTC tab is visible.
// ═══════════════════════════════════════════════════════════════════════════
const BTCAlgoUI = (() => {

  let lastCandle   = null;
  let lastMarket   = null;
  let active       = false;

  // ── Helpers ──
  function el(id) { return document.getElementById(id); }

  function setStatus(id, msg, ok) {
    const e = el(id);
    if (!e) return;
    e.textContent = msg;
    e.style.color = ok ? 'var(--green)' : 'var(--text-dim)';
  }

  function log(msg, type = 'info') {
    const container = el('signal-log');
    if (!container) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry log-' + type;
    const time = new Date().toLocaleTimeString('en-CA', { hour12: false });
    entry.textContent = `[${time}] ${msg}`;
    container.prepend(entry);
    // Keep log to 100 entries
    while (container.children.length > 100) {
      container.removeChild(container.lastChild);
    }
  }

  // ── Indicator DOM update ──
  function updateIndicator(prefix, ind) {
    const valueEl  = el(prefix + '-value');
    const barEl    = el(prefix + '-bar');
    const signalEl = el(prefix + '-signal');
    if (!valueEl) return;

    if (ind.value === null) {
      valueEl.textContent  = 'Loading…';
      signalEl.textContent = '—';
      return;
    }

    // Format value by indicator type
    if (prefix === 'rsi')  valueEl.textContent = ind.value.toFixed(1);
    else if (prefix === 'mom') valueEl.textContent = (ind.value > 0 ? '+' : '') + ind.value.toFixed(3) + '%';
    else if (prefix === 'macd') valueEl.textContent = ind.value.toFixed(4);
    else if (prefix === 'vol')  valueEl.textContent = ind.value.toFixed(2) + '×';

    if (barEl) {
      barEl.style.width      = Math.round(ind.pct * 100) + '%';
      barEl.style.background = ind.signal === 'UP' ? 'var(--green)' : ind.signal === 'DOWN' ? 'var(--red)' : 'var(--accent)';
    }

    signalEl.textContent = ind.signal;
    signalEl.style.color = ind.signal === 'UP' ? 'var(--green)' : ind.signal === 'DOWN' ? 'var(--red)' : 'var(--text-dim)';
  }

  // ── Composite score DOM update ──
  function updateComposite(comp) {
    const scoreEl = el('comp-score');
    const labelEl = el('comp-label');
    const brkEl   = el('comp-breakdown');
    const gaugeEl = el('gauge-cursor');

    if (scoreEl) scoreEl.textContent = comp.score;
    if (labelEl) {
      labelEl.textContent = comp.label;
      labelEl.style.color = comp.score >= 60 ? 'var(--green)' : comp.score <= 40 ? 'var(--red)' : 'var(--text-dim)';
    }
    if (brkEl)   brkEl.innerHTML = comp.breakdown.join('<br>');
    if (gaugeEl) gaugeEl.style.left = comp.score + '%';
  }

  // ── Market card DOM update ──
  function updateMarketCard(market) {
    const body = el('btc-market-body');
    if (!body) return;

    if (!market) {
      body.innerHTML = '<div class="loading-msg">No active BTC 5-min market found. Searching...</div>';
      return;
    }

    const endDate   = market.endDate ? new Date(market.endDate) : null;
    const startDate = market.startDate ? new Date(market.startDate) : null;
    const now       = Date.now();
    const yes       = market.bestBid || 0.5;
    const no        = 1 - yes;

    // Crowd drift
    const drift = BTCMarketTracker.getCrowdDrift(market);
    const volRate = BTCMarketTracker.getVolumeRate(market);

    // Liquidity rewards worked example
    const mmData = market.min_incentive_size || market.minIncentiveSize || null;
    const mmSpread = market.max_incentive_spread || market.maxIncentiveSpread || 3;
    const example = LiquidityRewards.workedExample(mmSpread, yes);

    body.innerHTML = `
      <div class="mkt-row">
        <span class="mkt-label">Market</span>
        <span class="mkt-val mkt-question">${market.question || market.slug || '—'}</span>
      </div>
      <div class="mkt-prices">
        <div class="mkt-side mkt-yes">
          <div class="mkt-side-label">YES</div>
          <div class="mkt-side-price">${(yes * 100).toFixed(1)}¢</div>
          <div class="mkt-side-sub">implied ${(yes * 100).toFixed(0)}% prob</div>
        </div>
        <div class="mkt-vs">vs</div>
        <div class="mkt-side mkt-no">
          <div class="mkt-side-label">NO</div>
          <div class="mkt-side-price">${(no * 100).toFixed(1)}¢</div>
          <div class="mkt-side-sub">implied ${(no * 100).toFixed(0)}% prob</div>
        </div>
      </div>
      <div class="mkt-row">
        <span class="mkt-label">Volume</span>
        <span class="mkt-val">$${(market.volume24hr || 0).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</span>
      </div>
      <div class="mkt-row">
        <span class="mkt-label">Vol rate</span>
        <span class="mkt-val">${volRate !== null ? '$' + volRate.toFixed(2) + '/min' : 'calculating…'}</span>
      </div>
      <div class="mkt-row">
        <span class="mkt-label">Crowd drift</span>
        <span class="mkt-val" style="color:${drift?.direction === 'YES' ? 'var(--green)' : drift?.direction === 'NO' ? 'var(--red)' : 'var(--text-dim)'}">
          ${drift ? ((drift.drift > 0 ? '+' : '') + (drift.drift * 100).toFixed(2) + '¢ → ' + drift.direction) : 'not enough data'}
        </span>
      </div>
      <div class="mkt-row">
        <span class="mkt-label">Fees enabled</span>
        <span class="mkt-val">${market.feesEnabled ? '✓ Yes (Crypto 7.2%)' : '— No'}</span>
      </div>
      <div class="mkt-row">
        <span class="mkt-label">Maker fee</span>
        <span class="mkt-val" style="color:var(--green)">$0 — makers never pay fees</span>
      </div>

      <!-- ── Liquidity Rewards Box ── -->
      <div class="mm-rewards-box">
        <div class="mm-header">📊 Market Maker Rewards — Worked Example</div>
        <div class="mm-note">
          Max spread: <strong>${mmSpread}¢</strong> · 
          Min size: <strong>${mmData || 'n/a'} shares</strong> · 
          Midpoint: <strong>${(yes * 100).toFixed(1)}¢</strong>
        </div>
        <div class="mm-note" style="color:var(--text-dim);font-size:11px;margin-bottom:8px;">
          Formula: S(v,s) = ((v−s)/v)² × 1.0 · Two-sided quoting gets min(Qone, Qtwo) vs single-sided which gets ÷3
        </div>
        <table class="mm-table">
          <thead><tr><th>Order</th><th>Score S(v,s)</th><th>Qone contrib</th></tr></thead>
          <tbody>
            ${example.orders.map(o => `
              <tr>
                <td>${o.label}</td>
                <td>${scoreOrderDisplay(o.v, o.s)}</td>
                <td>${o.score.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="mm-totals">
          Qone = <strong>${example.result.Qone.toFixed(2)}</strong> · 
          Qtwo = <strong>${example.result.Qtwo.toFixed(2)}</strong> · 
          <span style="color:var(--green)">Qmin = <strong>${example.result.Qmin.toFixed(2)}</strong></span>
          ${example.result.isTwoSided ? '<span class="mm-badge">✓ Two-sided bonus</span>' : '<span class="mm-badge mm-single">Single-sided (÷3)</span>'}
        </div>
        <div class="mm-sub">
          <strong>If fills occur — Maker Rebate:</strong><br>
          ${example.fillAnalysis.map(f =>
            `${f.label}: fee_equiv = ${f.C} × 0.072 × ${f.p.toFixed(2)} × ${(1-f.p).toFixed(2)} = <strong>$${f.feeEquiv}</strong>`
          ).join('<br>')}
          <br><span style="color:var(--text-dim);font-size:11px;">
          Your daily rebate = (your fee_equiv / total market fee_equiv) × 20% of taker fees collected.
          Rebates paid daily in USDC to your wallet at midnight UTC.
          </span>
        </div>
      </div>
    `;
  }

  function scoreOrderDisplay(v, s) {
    if (s >= v) return '0 (outside spread)';
    const score = Math.pow((v - s) / v, 2);
    return `((${v}−${s})/${v})² = ${score.toFixed(3)}`;
  }

  // ── Countdown timer ──
  function updateCountdown(market) {
    const cd = el('btc-countdown');
    if (!cd || !market?.endDate) { if (cd) cd.textContent = '—'; return; }
    const secs = Math.floor((new Date(market.endDate) - Date.now()) / 1000);
    if (secs < 0) { cd.textContent = 'RESOLVED'; cd.style.color = 'var(--text-dim)'; return; }
    const m  = Math.floor(secs / 60);
    const s  = secs % 60;
    cd.textContent = `${m}:${s.toString().padStart(2, '0')} left`;
    cd.style.color = secs < 60 ? 'var(--red)' : secs < 120 ? 'var(--yellow)' : 'var(--green)';
  }

  // ── Main candle update handler ──
  function onCandle(candle, isClosed) {
    const candles = BinanceFeed.candles;
    if (!candles.length) return;

    // Update price display
    const priceEl    = el('btc-live-price');
    const changeEl   = el('btc-1m-change');
    if (priceEl) priceEl.textContent = '$' + candle.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (candles.length >= 2 && changeEl) {
      const prev   = candles[candles.length - 2].c;
      const delta  = candle.c - prev;
      const deltaPct = ((delta / prev) * 100).toFixed(3);
      changeEl.textContent = (delta >= 0 ? '+' : '') + deltaPct + '%';
      changeEl.style.color = delta >= 0 ? 'var(--green)' : 'var(--red)';
    }

    // Update candle count
    const countEl = el('btc-candle-count');
    if (countEl) countEl.textContent = candles.length + ' candles';

    // Compute indicators
    const rsi      = IndicatorEngine.calcRSI(candles);
    const momentum = IndicatorEngine.calcMomentum(candles);
    const macd     = IndicatorEngine.calcMACD(candles);
    const vol      = IndicatorEngine.calcVolSpike(candles);
    const comp     = CompositeScorer.score({ rsi, momentum, macd, vol });

    updateIndicator('rsi',  rsi);
    updateIndicator('mom',  momentum);
    updateIndicator('macd', macd);
    updateIndicator('vol',  vol);
    updateComposite(comp);

    // Render chart
    ChartRenderer.render(candles);

    // On closed candle — run auto-trader
    if (isClosed && lastMarket) {
      const logMsg = `Candle closed @ $${candle.c.toLocaleString()} — Score: ${comp.score} (${comp.label}) ${comp.upVotes}↑ ${comp.dnVotes}↓`;
      log(logMsg, comp.action ? (comp.action === 'UP' ? 'buy' : 'warn') : 'info');

      const decision = AutoTrader.check(comp, lastMarket);
      if (decision.fired) {
        log(`🔥 TRADE FIRED: ${decision.reason}`, 'buy');
        const actionEl = el('algo-last-action');
        if (actionEl) {
          actionEl.textContent = `Last trade: ${decision.action} @ ${decision.price} — score ${decision.score}, edge ${decision.edge}`;
          actionEl.style.color = 'var(--green)';
        }
      } else {
        if (comp.score !== 50) { // don't log every neutral
          log(`No trade — ${decision.reason}`, 'info');
        }
      }
    }

    lastCandle = candle;
    updateCountdown(lastMarket);
  }

  // ── Market update handler ──
  function onMarkets(markets) {
    const active = BTCMarketTracker.getActive();
    lastMarket = active;
    setStatus('btc-market-status', active ? `● ${active.slug || 'Market found'}` : '● No active market', !!active);
    updateMarketCard(active);
    updateCountdown(active);
  }

  // ── Auto-trade toggle ──
  function bindToggle() {
    const btn = el('btn-toggle-auto');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOn = AutoTrader.toggle();
      btn.textContent = `${isOn ? '⏹' : '▶'} Auto-Trade: ${isOn ? 'ON' : 'OFF'}`;
      btn.className   = isOn ? 'btn-auto-on' : 'btn-auto-off';
      log(`Auto-trade ${isOn ? 'ENABLED' : 'DISABLED'}`, isOn ? 'buy' : 'warn');
    });
  }

  // ── Clear log ──
  function bindClearLog() {
    const btn = el('btn-clear-log');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const container = el('signal-log');
      if (container) container.innerHTML = '<div class="log-entry log-info">Log cleared.</div>';
    });
  }

  // ── Countdown timer (1s interval) ──
  let countdownTimer = null;

  function start() {
    if (active) return;
    active = true;

    bindToggle();
    bindClearLog();

    BinanceFeed.start(
      onCandle,
      (msg, ok) => setStatus('btc-feed-status', msg, ok)
    );

    BTCMarketTracker.start(
      onMarkets,
      (msg, ok) => setStatus('btc-market-status', msg, ok)
    );

    countdownTimer = setInterval(() => updateCountdown(lastMarket), 1000);
    log('BTC Algo engine started. Waiting for candles...', 'info');
  }

  function stop() {
    if (!active) return;
    active = false;
    BinanceFeed.stop();
    BTCMarketTracker.stop();
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  }

  return { start, stop };
})();


// ═══════════════════════════════════════════════════════════════════════════
// 9. TAB LIFECYCLE HOOK
// Starts the engine when the BTC tab is shown, stops when hidden.
// Hooks into app.js tab switching via a MutationObserver.
// ═══════════════════════════════════════════════════════════════════════════
(function hookTabLifecycle() {
  const TAB_ID = 'tab-btc';
  let started  = false;

  function checkVisibility() {
    const tab = document.getElementById(TAB_ID);
    if (!tab) return;
    const isVisible = tab.classList.contains('active') || tab.style.display !== 'none';
    if (isVisible && !started) {
      started = true;
      BTCAlgoUI.start();
    } else if (!isVisible && started) {
      // Keep running in background — don't stop (so signals keep logging)
      // BTCAlgoUI.stop(); // uncomment to pause when tab is hidden
    }
  }

  // Watch for tab class/style changes
  const target = document.getElementById(TAB_ID);
  if (target) {
    new MutationObserver(checkVisibility).observe(target, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  // Also hook button click events as a fast path
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'btc') {
        setTimeout(checkVisibility, 50); // after app.js shows the tab
      }
    });
  });

  // Initial check (in case user opens page directly on BTC tab)
  document.addEventListener('DOMContentLoaded', checkVisibility);
  setTimeout(checkVisibility, 200);
})();
