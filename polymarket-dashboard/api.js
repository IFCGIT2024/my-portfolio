/**
 * api.js — Polymarket Data Layer
 *
 * Wraps two public APIs:
 *   1. Gamma API  (gamma-api.polymarket.com) — market listings, prices, volume
 *      → Works from the browser with no auth. This is your primary data source.
 *
 *   2. CLOB API   (clob.polymarket.com) — order books, midpoints, spreads
 *      → May be blocked by browser CORS policy (server-side calls work fine).
 *      → Errors are caught silently so the dashboard still loads from Gamma.
 *
 * For automated trading you would run a Node.js or Python backend that calls
 * CLOB directly (no CORS restriction) and streams data to this frontend.
 */

const PolyAPI = (() => {

  const GAMMA = 'https://gamma-api.polymarket.com';
  const CLOB  = 'https://clob.polymarket.com';

  // Polymarket blocks direct browser requests from US IPs (CORS geoblock).
  // Route through a public CORS proxy so the request originates server-side.
  const PROXY = 'https://corsproxy.io/?url=';

  /* ── Simple TTL cache so repeated renders don't spam the API ── */
  const _cache = {};
  const CACHE_TTL_MS = 60_000; // 1 minute

  function _cached(key, fetchFn) {
    const now = Date.now();
    if (_cache[key] && (now - _cache[key].ts) < CACHE_TTL_MS) {
      return Promise.resolve(_cache[key].data);
    }
    return fetchFn().then(data => {
      _cache[key] = { data, ts: now };
      return data;
    });
  }

  /* ── Core fetch helper ── */
  function _get(url) {
    const proxied = PROXY + encodeURIComponent(url);
    return fetch(proxied, { headers: { Accept: 'application/json' } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} from ${url}`);
        return r.json();
      });
  }

  /* ── Raw fetch for the Data Lab (returns status + body) ── */
  function rawFetch(url) {
    const proxied = PROXY + encodeURIComponent(url);
    return fetch(proxied, { headers: { Accept: 'application/json' } })
      .then(async r => {
        let data;
        try { data = await r.json(); } catch(e) { data = { error: 'non-JSON response' }; }
        return { status: r.status, ok: r.ok, url, data };
      });
  }

  /* ════════════════════════════════════════════════
     GAMMA API — Market Listings
  ════════════════════════════════════════════════ */

  /**
   * Fetch active markets.
   * @param {object} opts
   * @param {number} opts.limit   - How many markets (default 20)
   * @param {string} opts.order   - Sort field: volume24hr | volume | liquidity | endDate
   * @param {number} opts.offset  - Pagination offset
   */
  function getMarkets({ limit = 20, order = 'volume24hr', offset = 0 } = {}) {
    const url = `${GAMMA}/markets?active=true&closed=false&limit=${limit}&offset=${offset}&order=${order}&ascending=false`;
    return _cached(`markets:${limit}:${order}:${offset}`, () => _get(url));
  }

  /** Fetch a single market by conditionId */
  function getMarket(conditionId) {
    return _get(`${GAMMA}/markets/${conditionId}`);
  }

  /* ════════════════════════════════════════════════
     CLOB API — Order Book & Price Data
     (may be CORS-blocked in browser — errors caught)
  ════════════════════════════════════════════════ */

  /**
   * Get the order book (bids & asks) for a token.
   * tokenId = clobTokenIds[0] for YES, [1] for NO
   */
  function getOrderBook(tokenId) {
    return _get(`${CLOB}/books?token_id=${tokenId}`).catch(() => null);
  }

  /** Get the midpoint price for a token */
  function getMidpoint(tokenId) {
    return _get(`${CLOB}/midpoint?token_id=${tokenId}`).catch(() => null);
  }

  /** Get the bid-ask spread for a token */
  function getSpread(tokenId) {
    return _get(`${CLOB}/spread?token_id=${tokenId}`).catch(() => null);
  }

  /* ════════════════════════════════════════════════
     DATA NORMALISER
     Converts raw Gamma API market objects into a
     clean, predictable shape used everywhere else.
  ════════════════════════════════════════════════ */

  /**
   * @param {object} raw - Raw market object from Gamma API
   * @returns {object}   - Normalised market object
   *
   * Key fields on the result:
   *   id          — same as conditionId (unique key)
   *   question    — the market question string
   *   yesPrice    — float 0-1 (current YES probability / price)
   *   noPrice     — float 0-1 (current NO  probability / price)
   *   sum         — yesPrice + noPrice (should be ~1.00)
   *   arbGap      — |1 - sum| — how far from $1.00 the market is
   *   volume24hr  — 24-hour trading volume in USDC
   *   volume      — all-time trading volume in USDC
   *   liquidity   — available pool liquidity in USDC
   *   endDate     — ISO datetime string when market resolves (or null)
   *   yesTokenId  — CLOB token ID for YES shares (for order book queries)
   *   noTokenId   — CLOB token ID for NO  shares
   */
  function normalizeMarket(raw) {
    let outcomes = [], prices = [], clobIds = [];
    try { outcomes = JSON.parse(raw.outcomes     || '[]'); } catch(e) {}
    try { prices   = JSON.parse(raw.outcomePrices || '[]'); } catch(e) {}
    try { clobIds  = JSON.parse(raw.clobTokenIds  || '[]'); } catch(e) {}

    const yesPrice = parseFloat(prices[0]) || 0;
    const noPrice  = parseFloat(prices[1]) || 0;
    const sum      = yesPrice + noPrice;

    return {
      id:          raw.conditionId || raw.id || '',
      conditionId: raw.conditionId || '',
      question:    raw.question    || 'Unknown market',
      slug:        raw.slug        || '',
      description: raw.description || '',
      outcomes,
      yesPrice,
      noPrice,
      sum,
      arbGap:      Math.abs(1 - sum),
      arbType:     sum < 1 ? 'UNDERPRICED' : 'OVERPRICED',
      volume:      parseFloat(raw.volume)     || 0,
      volume24hr:  parseFloat(raw.volume24hr) || 0,
      liquidity:   parseFloat(raw.liquidity)  || 0,
      endDate:     raw.endDate || null,
      active:      !!raw.active,
      closed:      !!raw.closed,
      yesTokenId:  clobIds[0] || null,
      noTokenId:   clobIds[1] || null,
    };
  }

  /* Public interface */
  return {
    GAMMA,
    CLOB,
    getMarkets,
    getMarket,
    getOrderBook,
    getMidpoint,
    getSpread,
    normalizeMarket,
    rawFetch,
  };

})();
