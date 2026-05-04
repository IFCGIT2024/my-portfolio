/**
 * trader.js — Paper Trading Engine
 *
 * Simulates a $10,000 USDC account.
 * All state is persisted to localStorage so it survives page reloads.
 *
 * How Polymarket pricing works (built into this engine):
 *   - Shares are priced $0.00 – $1.00 (they ARE the probability)
 *   - Buying 100 YES shares at $0.65 costs $65.00 USDC
 *   - If the market resolves YES: each share pays $1.00 → receive $100.00 (+$35 profit)
 *   - If the market resolves NO:  shares expire worthless → lose $65.00
 *   - Therefore: ROI = (1 - price) / price if correct, or -100% if wrong
 *
 * In paper mode "selling" means closing at the current market price
 * (not waiting for resolution). This is how real CLOB trading works too.
 */

class PaperTrader {

  constructor() {
    this.STORAGE_KEY    = 'polymarket_paper_v1';
    this.INITIAL_BALANCE = 10_000;
    this.state = this._load();
  }

  /* ── Persistence ── */
  _load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) { /* corrupted storage — start fresh */ }
    return this._freshState();
  }

  _save() {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state)); }
    catch(e) { console.warn('localStorage write failed:', e); }
  }

  _freshState() {
    return {
      balance:        this.INITIAL_BALANCE,
      positions:      [],   // see buy() for shape
      history:        [],   // see closePosition() for shape
      nextPositionId: 1,
    };
  }

  /* ── Reset ── */
  reset() {
    this.state = this._freshState();
    this._save();
  }

  /* ── Getters ── */
  getBalance()   { return this.state.balance; }
  getPositions() { return [...this.state.positions]; }
  getHistory()   { return [...this.state.history]; }

  /* ════════════════════════════════════════════════
     BUY — open a new paper position
  ════════════════════════════════════════════════

   @param {object} market  - normalised market object from api.js
   @param {string} side    - 'YES' or 'NO'
   @param {number} shares  - integer number of shares to buy
   @returns {{ success: boolean, cost?: number, price?: number, error?: string }}
  */
  buy(market, side, shares) {
    /* Input validation */
    if (!['YES', 'NO'].includes(side)) {
      return { success: false, error: 'Side must be YES or NO' };
    }
    shares = Math.floor(shares);
    if (!shares || shares <= 0 || shares > 500_000) {
      return { success: false, error: 'Share count must be between 1 and 500,000' };
    }

    const price = side === 'YES' ? market.yesPrice : market.noPrice;
    if (price <= 0 || price >= 1) {
      return { success: false, error: `Invalid market price: $${price}` };
    }

    const cost = +(price * shares).toFixed(4);
    if (cost > this.state.balance) {
      return {
        success: false,
        error: `Insufficient balance. Cost: $${cost.toFixed(2)}, Available: $${this.state.balance.toFixed(2)}`,
      };
    }

    /* Execute */
    this.state.balance = +(this.state.balance - cost).toFixed(4);
    this.state.positions.push({
      id:          this.state.nextPositionId++,
      question:    market.question,
      side,
      shares,
      buyPrice:    price,
      costBasis:   cost,
      marketId:    market.conditionId,
      yesTokenId:  market.yesTokenId,
      noTokenId:   market.noTokenId,
      openedAt:    Date.now(),
    });
    this._save();
    return { success: true, cost, price, shares };
  }

  /* ════════════════════════════════════════════════
     CLOSE POSITION — sell at current market price
  ════════════════════════════════════════════════

   @param {number} positionId  - position.id
   @param {object} currentMarket - normalised market with live prices
   @returns {{ success: boolean, pnl?: number, proceeds?: number, error?: string }}
  */
  closePosition(positionId, currentMarket) {
    const idx = this.state.positions.findIndex(p => p.id === positionId);
    if (idx === -1) return { success: false, error: 'Position not found' };

    const pos          = this.state.positions[idx];
    const currentPrice = pos.side === 'YES' ? currentMarket.yesPrice : currentMarket.noPrice;
    const proceeds     = +(currentPrice * pos.shares).toFixed(4);
    const pnl          = +(proceeds - pos.costBasis).toFixed(4);

    this.state.balance = +(this.state.balance + proceeds).toFixed(4);
    this.state.positions.splice(idx, 1);

    this.state.history.unshift({
      question:    pos.question,
      side:        pos.side,
      shares:      pos.shares,
      buyPrice:    pos.buyPrice,
      sellPrice:   currentPrice,
      costBasis:   pos.costBasis,
      proceeds,
      pnl,
      openedAt:    pos.openedAt,
      closedAt:    Date.now(),
    });

    this._save();
    return { success: true, pnl, proceeds, currentPrice };
  }

  /* ════════════════════════════════════════════════
     PORTFOLIO METRICS
     Pass in the current allMarkets array so we can
     mark positions to market (current price).
  ════════════════════════════════════════════════ */

  /**
   * @param {object[]} markets - array of normalised markets
   * @returns {object} - portfolio summary
   */
  getPortfolioMetrics(markets) {
    /* Build a lookup by conditionId */
    const marketMap = {};
    markets.forEach(m => { marketMap[m.conditionId] = m; });

    let investedValue = 0;
    let currentValue  = 0;

    this.state.positions.forEach(pos => {
      const market = marketMap[pos.marketId];
      investedValue += pos.costBasis;
      if (market) {
        const cp = pos.side === 'YES' ? market.yesPrice : market.noPrice;
        currentValue += +(cp * pos.shares).toFixed(4);
      } else {
        /* Market not in current list — assume no change */
        currentValue += pos.costBasis;
      }
    });

    const unrealizedPnL  = +(currentValue  - investedValue).toFixed(2);
    const realizedPnL    = +this.state.history.reduce((s, h) => s + h.pnl, 0).toFixed(2);
    const totalPnL       = +(unrealizedPnL + realizedPnL).toFixed(2);
    const portfolioValue = +(this.state.balance + currentValue).toFixed(2);

    const closes = this.state.history.length;
    const wins   = this.state.history.filter(h => h.pnl > 0).length;
    const winRate = closes > 0 ? `${Math.round((wins / closes) * 100)}%` : '—';

    return {
      balance:        +this.state.balance.toFixed(2),
      investedValue:  +investedValue.toFixed(2),
      currentValue:   +currentValue.toFixed(2),
      unrealizedPnL,
      realizedPnL,
      totalPnL,
      portfolioValue,
      winRate,
      openCount:      this.state.positions.length,
      closedCount:    closes,
    };
  }

}

/* Singleton — one account shared across the whole app */
const Trader = new PaperTrader();
