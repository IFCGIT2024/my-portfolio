/**
 * strategies.js — Signal Detection Engine
 *
 * Analyses normalised market objects and surfaces trading opportunities.
 *
 * Strategy overview:
 *
 *  1. ARBITRAGE
 *     Polymarket YES shares + NO shares should sum to exactly $1.00.
 *     When the sum drifts (e.g. YES=$0.60, NO=$0.38 → sum=$0.98):
 *       - Sum < $1.00 → both sides UNDERPRICED. Buying both guarantees
 *         a $1.00 payout no matter the outcome. Profit = $1.00 - sum.
 *       - Sum > $1.00 → both sides OVERPRICED. Requires short selling
 *         (paper mode only tracks long buys, so these are flagged only).
 *     Real-world note: gaps close fast due to bots. Even 1-2% is real edge.
 *
 *  2. HIGH CONVICTION
 *     Markets where one side is priced >80¢ (80% probability).
 *     The crowd is very confident — these resolve predictably.
 *     Lower reward but much higher win rate. Good for conservative sizing.
 *
 *  3. NEAR RESOLUTION
 *     Markets closing within 7 days. Less time for the price to move
 *     against you. Especially valuable when combined with high conviction.
 *
 *  4. BEST LIQUIDITY
 *     Highest pool liquidity = lowest slippage. Easiest markets to enter
 *     and exit without moving the price. Good for larger positions.
 *
 * All detectors return normalised market objects with extra scoring fields.
 * The scoreMarket() function gives every market a composite 0–100 score
 * plus a list of signal tags used in the market list sidebar.
 */

const Signals = (() => {

  /* ════════════════════════════════════════════════
     1. ARBITRAGE DETECTION
  ════════════════════════════════════════════════ */
  function findArbitrage(markets) {
    return markets
      .filter(m => m.yesPrice > 0.01 && m.noPrice > 0.01)  // both sides must have liquidity
      .map(m => ({
        ...m,
        arbPct:   +((1 - m.sum) * 100).toFixed(2),   // positive = underpriced, negative = overpriced
        arbValue: +Math.abs(1 - m.sum).toFixed(4),
      }))
      .filter(m => m.arbValue > 0.005)                // only gaps > 0.5%
      .sort((a, b) => b.arbValue - a.arbValue)
      .slice(0, 12);
  }

  /* ════════════════════════════════════════════════
     2. HIGH CONVICTION
  ════════════════════════════════════════════════ */
  function findHighConviction(markets) {
    return markets
      .filter(m => m.volume24hr > 500)                // must have some activity
      .map(m => {
        const confidence = Math.max(m.yesPrice, m.noPrice);
        const side       = m.yesPrice >= m.noPrice ? 'YES' : 'NO';
        const price      = m.yesPrice >= m.noPrice ? m.yesPrice : m.noPrice;
        const roi        = +((1 / price - 1) * 100).toFixed(1);  // % gain if correct
        return { ...m, confidence, side, price, roi };
      })
      .filter(m => m.confidence >= 0.80)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  /* ════════════════════════════════════════════════
     3. NEAR RESOLUTION
  ════════════════════════════════════════════════ */
  function findNearResolution(markets) {
    const now       = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    return markets
      .filter(m => {
        if (!m.endDate) return false;
        const end  = new Date(m.endDate).getTime();
        const diff = end - now;
        return diff > 0 && diff < sevenDays;
      })
      .map(m => {
        const daysLeft = +((new Date(m.endDate).getTime() - now) / 86_400_000).toFixed(1);
        return { ...m, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);
  }

  /* ════════════════════════════════════════════════
     4. BEST LIQUIDITY
  ════════════════════════════════════════════════ */
  function findBestLiquidity(markets) {
    return markets
      .filter(m => m.liquidity > 0)
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 10);
  }

  /* ════════════════════════════════════════════════
     COMPOSITE MARKET SCORE  (0 – 100)
     Used to add signal tags to the market list sidebar.
  ════════════════════════════════════════════════ */
  function scoreMarket(m) {
    let score = 0;
    const tags = [];

    /* Arbitrage signal — strongest edge */
    if (m.arbGap > 0.03) { score += 40; tags.push('ARB'); }
    else if (m.arbGap > 0.01) { score += 20; tags.push('ARB'); }

    /* Volume — indicates informed price */
    if (m.volume24hr >= 100_000) { score += 20; tags.push('HOT'); }
    else if (m.volume24hr >= 10_000) score += 10;

    /* Liquidity — easy entry/exit */
    if (m.liquidity >= 100_000) score += 15;
    else if (m.liquidity >= 20_000) score += 7;

    /* Near resolution */
    if (m.endDate) {
      const daysLeft = (new Date(m.endDate) - Date.now()) / 86_400_000;
      if (daysLeft > 0 && daysLeft <= 7) { score += 15; tags.push('SOON'); }
    }

    /* High conviction */
    const confidence = Math.max(m.yesPrice, m.noPrice);
    if (confidence >= 0.90) score += 10;
    else if (confidence >= 0.80) score += 5;

    return { score: Math.min(score, 100), tags };
  }

  /* ════════════════════════════════════════════════
     FULL ANALYSIS — called once per market refresh
  ════════════════════════════════════════════════ */
  function analyze(markets) {
    return {
      arbitrage:      findArbitrage(markets),
      highConviction: findHighConviction(markets),
      nearResolution: findNearResolution(markets),
      bestLiquidity:  findBestLiquidity(markets),
    };
  }

  return { analyze, scoreMarket, findArbitrage, findHighConviction, findNearResolution, findBestLiquidity };

})();
