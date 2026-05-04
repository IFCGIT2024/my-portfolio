/**
 * app.js — Dashboard Orchestrator
 *
 * Wires together api.js, trader.js, and strategies.js into the UI.
 * All DOM manipulation lives here.
 */

const App = (() => {

  /* ── State ── */
  let allMarkets     = [];
  let selectedMarket = null;
  let selectedSide   = 'YES';
  let refreshTimer   = null;

  /* ════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════ */
  function init() {
    setupTabs();
    setupEventListeners();
    loadMarkets();
    startAutoRefresh();
  }

  /* ════════════════════════════════════════════════
     TABS
  ════════════════════════════════════════════════ */
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');

        /* Refresh relevant panels when switching to them */
        if (btn.dataset.tab === 'portfolio')     updatePortfolioUI();
        if (btn.dataset.tab === 'opportunities') renderOpportunities();
      });
    });
  }

  /* ════════════════════════════════════════════════
     EVENT LISTENERS
  ════════════════════════════════════════════════ */
  function setupEventListeners() {
    /* Market controls */
    qs('#market-search').addEventListener('input', renderMarketList);
    qs('#market-sort').addEventListener('change', () => loadMarkets(true));
    qs('#market-limit').addEventListener('change', () => loadMarkets(true));
    qs('#btn-refresh').addEventListener('click', () => loadMarkets(true));
    qs('#btn-reset').addEventListener('click', handleReset);

    /* Trade modal */
    qs('#modal-close').addEventListener('click', closeModal);
    qs('#btn-cancel-trade').addEventListener('click', closeModal);
    qs('.modal-overlay').addEventListener('click', closeModal);
    qs('#btn-confirm-trade').addEventListener('click', executeTrade);
    qs('#trade-shares').addEventListener('input', updateTradePreview);
    qs('#side-yes').addEventListener('click', () => setSide('YES'));
    qs('#side-no').addEventListener('click', () => setSide('NO'));

    /* Data Lab */
    document.querySelectorAll('.btn-test').forEach(btn => {
      btn.addEventListener('click', () => runLabTest(btn.dataset.endpoint));
    });
  }

  /* ════════════════════════════════════════════════
     MARKET LOADING
  ════════════════════════════════════════════════ */
  async function loadMarkets(forceRefresh = false) {
    const limit = parseInt(qs('#market-limit').value) || 20;
    const order = qs('#market-sort').value;

    qs('#market-list').innerHTML = '<div class="loading-msg">⟳ Fetching live market data...</div>';

    try {
      const raw  = await PolyAPI.getMarkets({ limit, order });
      allMarkets = (Array.isArray(raw) ? raw : []).map(PolyAPI.normalizeMarket);

      renderMarketList();
      renderOpportunities();
      updateHeaderStats();
      qs('#last-update').textContent = `Updated ${new Date().toLocaleTimeString()}`;

      /* Re-render selected market detail with fresh prices */
      if (selectedMarket) {
        const fresh = allMarkets.find(m => m.id === selectedMarket.id);
        if (fresh) { selectedMarket = fresh; renderMarketDetail(fresh, null); }
      }
    } catch(err) {
      qs('#market-list').innerHTML =
        `<div class="error-msg">❌ Failed to load markets<br><small>${escHtml(err.message)}</small></div>`;
    }
  }

  /* ════════════════════════════════════════════════
     MARKET LIST (sidebar)
  ════════════════════════════════════════════════ */
  function renderMarketList() {
    const query    = qs('#market-search').value.toLowerCase().trim();
    const filtered = allMarkets.filter(m =>
      !query || m.question.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      qs('#market-list').innerHTML = '<div class="loading-msg">No markets match your search</div>';
      return;
    }

    qs('#market-list').innerHTML = filtered.map(m => {
      const { tags } = Signals.scoreMarket(m);
      const tagHTML  = tags.map(t => {
        const cls = t === 'ARB' ? 'sig-arb' : t === 'HOT' ? 'sig-hot' : 'sig-close';
        return `<span class="signal-tag ${cls}">${t}</span>`;
      }).join('');

      const isSelected = selectedMarket && selectedMarket.id === m.id;

      return `<div class="market-item ${isSelected ? 'selected' : ''}" data-id="${escHtml(m.id)}">
        <div class="market-question">${escHtml(m.question)}</div>
        <div class="market-metrics">
          <span class="price-tag-yes">YES ${cent(m.yesPrice)}¢</span>
          <span class="price-tag-no">NO ${cent(m.noPrice)}¢</span>
          <span class="vol-tag">${fmtCompact(m.volume24hr)}/24h</span>
          ${tagHTML}
        </div>
      </div>`;
    }).join('');

    document.querySelectorAll('.market-item').forEach(el => {
      el.addEventListener('click', () => {
        const market = allMarkets.find(m => m.id === el.dataset.id);
        if (market) selectMarket(market);
      });
    });
  }

  /* ════════════════════════════════════════════════
     MARKET SELECTION + DETAIL
  ════════════════════════════════════════════════ */
  async function selectMarket(market) {
    selectedMarket = market;
    renderMarketList();  // update sidebar selection highlight

    qs('#market-detail').innerHTML = '<div class="loading-msg">⟳ Loading market detail...</div>';

    /* Attempt CLOB order book (may be CORS-blocked) */
    let orderBook = null;
    if (market.yesTokenId) {
      orderBook = await PolyAPI.getOrderBook(market.yesTokenId);
    }

    renderMarketDetail(market, orderBook);
  }

  function renderMarketDetail(m, orderBook) {
    const endStr = m.endDate
      ? new Date(m.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unknown';

    /* Arbitrage alert */
    const arbHTML = m.arbGap > 0.005
      ? `<div class="arb-alert">
           ⚡ <strong>Arbitrage signal:</strong> YES (${cent(m.yesPrice)}¢) + NO (${cent(m.noPrice)}¢) = ${(m.sum * 100).toFixed(1)}¢
           &ensp;|&ensp; Gap: <strong>${(m.arbGap * 100).toFixed(1)}%</strong>
           &ensp;|&ensp; ${m.sum < 1
             ? `Both sides underpriced — buying BOTH guarantees $${(m.arbGap).toFixed(3)} profit per share pair`
             : 'Both sides overpriced — short selling edge (requires live account)'}
         </div>`
      : '';

    /* Order book */
    const obHTML = (orderBook && orderBook.bids && orderBook.asks)
      ? `<div class="section-title">Order Book — YES Token</div>
         <div class="orderbook">
           <div class="ob-side bids">
             <div class="ob-header"><span>Bid $</span><span>Size</span></div>
             ${orderBook.bids.slice(0, 6).map(b =>
               `<div class="ob-row"><span class="price">$${(+b.price).toFixed(3)}</span><span>${(+b.size).toFixed(0)}</span></div>`
             ).join('')}
           </div>
           <div class="ob-side asks">
             <div class="ob-header"><span>Ask $</span><span>Size</span></div>
             ${orderBook.asks.slice(0, 6).map(a =>
               `<div class="ob-row"><span class="price">$${(+a.price).toFixed(3)}</span><span>${(+a.size).toFixed(0)}</span></div>`
             ).join('')}
           </div>
         </div>`
      : `<div class="section-title">Order Book</div>
         <p class="ob-note">Order book unavailable from browser (CLOB CORS restriction).
         Select this market in the Data Lab tab to test the endpoint directly.
         A Node.js/Python backend can access CLOB freely.</p>`;

    /* Resolve date / days left */
    const daysLeft = m.endDate
      ? Math.max(0, (new Date(m.endDate) - Date.now()) / 86_400_000).toFixed(0)
      : '?';

    qs('#market-detail').innerHTML = `
      <div class="detail-question">${escHtml(m.question)}</div>
      <div class="detail-meta">
        <span>⏱ Resolves: ${endStr} (${daysLeft} days)</span>
        <span>📊 Vol 24h: ${fmtUSD(m.volume24hr)}</span>
        <span>📦 Total Vol: ${fmtUSD(m.volume)}</span>
        <span>💧 Liquidity: ${fmtUSD(m.liquidity)}</span>
      </div>

      ${arbHTML}

      <div class="price-display">
        <div class="price-box yes">
          <span class="price-label">YES</span>
          <span class="price-value">${cent(m.yesPrice)}¢</span>
          <span class="price-implied">${cent(m.yesPrice)}% implied probability</span>
          <span class="price-implied">Pays $1.00 if YES — ROI ${((1/m.yesPrice - 1)*100).toFixed(0)}%</span>
        </div>
        <div class="price-box no">
          <span class="price-label">NO</span>
          <span class="price-value">${cent(m.noPrice)}¢</span>
          <span class="price-implied">${cent(m.noPrice)}% implied probability</span>
          <span class="price-implied">Pays $1.00 if NO — ROI ${((1/m.noPrice - 1)*100).toFixed(0)}%</span>
        </div>
      </div>

      <div class="detail-stats">
        <div class="stat-box">
          <span class="stat-label">Price Sum</span>
          <span class="stat-value ${m.sum < 0.99 ? 'positive' : m.sum > 1.01 ? 'negative' : 'neutral'}">
            $${m.sum.toFixed(3)}
          </span>
        </div>
        <div class="stat-box">
          <span class="stat-label">YES Token ID</span>
          <span class="stat-value" style="font-size:10px;word-break:break-all;">
            ${m.yesTokenId ? m.yesTokenId.slice(0, 20) + '…' : 'N/A'}
          </span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Condition ID</span>
          <span class="stat-value" style="font-size:10px;word-break:break-all;">
            ${m.conditionId ? m.conditionId.slice(0, 20) + '…' : 'N/A'}
          </span>
        </div>
      </div>

      ${obHTML}

      <div class="section-title">Paper Trade</div>
      <div class="trade-actions">
        <button class="btn-buy-yes" data-side="YES">
          BUY YES @ ${cent(m.yesPrice)}¢ &nbsp;·&nbsp; max ROI ${((1/m.yesPrice - 1)*100).toFixed(0)}%
        </button>
        <button class="btn-buy-no" data-side="NO">
          BUY NO @ ${cent(m.noPrice)}¢ &nbsp;·&nbsp; max ROI ${((1/m.noPrice - 1)*100).toFixed(0)}%
        </button>
      </div>
    `;

    document.querySelectorAll('.btn-buy-yes, .btn-buy-no').forEach(btn => {
      btn.addEventListener('click', () => openTradeModal(m, btn.dataset.side));
    });
  }

  /* ════════════════════════════════════════════════
     OPPORTUNITIES TAB
  ════════════════════════════════════════════════ */
  function renderOpportunities() {
    if (allMarkets.length === 0) return;
    const signals = Signals.analyze(allMarkets);

    renderSignalList('arb-list', signals.arbitrage, m =>
      `YES <strong>${cent(m.yesPrice)}¢</strong> + NO <strong>${cent(m.noPrice)}¢</strong> = ${(m.sum*100).toFixed(1)}¢
       &nbsp;|&nbsp; Gap: <span class="score-high">${(m.arbGap*100).toFixed(1)}%</span>
       &nbsp;|&nbsp; ${m.sum < 1 ? 'UNDERPRICED — buy both' : 'OVERPRICED'}`
    );

    renderSignalList('momentum-list', signals.highConviction, m =>
      `<span class="${m.side === 'YES' ? 'score-high' : 'negative'}">${m.side}</span>
       @ <strong>${cent(m.price)}¢</strong> confidence
       &nbsp;|&nbsp; ROI if correct: <span class="score-high">+${m.roi}%</span>
       &nbsp;|&nbsp; Vol 24h: ${fmtCompact(m.volume24hr)}`
    );

    renderSignalList('resolution-list', signals.nearResolution, m =>
      `Closes in <span class="score-med"><strong>${m.daysLeft} days</strong></span>
       &nbsp;|&nbsp; YES: ${cent(m.yesPrice)}¢ / NO: ${cent(m.noPrice)}¢
       &nbsp;|&nbsp; Liq: ${fmtCompact(m.liquidity)}`
    );

    renderSignalList('liquidity-list', signals.bestLiquidity, m =>
      `Liquidity: <span class="score-high"><strong>${fmtUSD(m.liquidity)}</strong></span>
       &nbsp;|&nbsp; Vol 24h: ${fmtCompact(m.volume24hr)}
       &nbsp;|&nbsp; YES: ${cent(m.yesPrice)}¢`
    );
  }

  function renderSignalList(containerId, markets, metaFn) {
    const el = qs('#' + containerId);
    if (!markets || markets.length === 0) {
      el.innerHTML = '<div class="empty-msg">None detected in current market set</div>';
      return;
    }
    el.innerHTML = markets.map(m => `
      <div class="signal-card" data-id="${escHtml(m.id)}">
        <div class="s-question">${escHtml(m.question)}</div>
        <div class="s-meta">${metaFn(m)}</div>
      </div>
    `).join('');

    el.querySelectorAll('.signal-card').forEach(card => {
      card.addEventListener('click', () => {
        const market = allMarkets.find(m => m.id === card.dataset.id);
        if (market) {
          /* Switch to Markets tab and select the market */
          qs('[data-tab="markets"]').click();
          selectMarket(market);
        }
      });
    });
  }

  /* ════════════════════════════════════════════════
     PORTFOLIO TAB
  ════════════════════════════════════════════════ */
  function updatePortfolioUI() {
    const m = Trader.getPortfolioMetrics(allMarkets);

    /* Header */
    qs('#hdr-portfolio').textContent = fmtUSD(m.portfolioValue);
    qs('#hdr-balance').textContent   = fmtUSD(m.balance);
    setPnLEl('hdr-pnl', m.unrealizedPnL, 'stat-value');
    qs('#hdr-trades').textContent = m.closedCount;

    /* Portfolio tab cards */
    qs('#port-balance').textContent = fmtUSD(m.balance);
    qs('#port-invested').textContent = fmtUSD(m.investedValue);
    qs('#port-current').textContent  = fmtUSD(m.currentValue);
    setPnLEl('port-pnl', m.unrealizedPnL, 'card-value');
    setPnLEl('port-total-pnl', m.realizedPnL, 'card-value');
    qs('#port-winrate').textContent = m.winRate;

    renderPositions();
    renderHistory();
  }

  function setPnLEl(id, value, baseClass) {
    const el = qs('#' + id);
    el.textContent = (value >= 0 ? '+' : '') + fmtUSD(value);
    el.className   = `${baseClass} ${value >= 0 ? 'positive' : 'negative'}`;
  }

  function renderPositions() {
    const positions = Trader.getPositions();
    const marketMap = {};
    allMarkets.forEach(m => { marketMap[m.conditionId] = m; });

    if (positions.length === 0) {
      qs('#positions-list').innerHTML = '<div class="empty-msg">No open positions yet — go trade!</div>';
      return;
    }

    qs('#positions-list').innerHTML = positions.map(pos => {
      const market  = marketMap[pos.marketId];
      const cp      = market ? (pos.side === 'YES' ? market.yesPrice : market.noPrice) : pos.buyPrice;
      const curVal  = +(cp * pos.shares).toFixed(2);
      const pnl     = +(curVal - pos.costBasis).toFixed(2);
      const pnlPct  = pos.costBasis > 0 ? ((pnl / pos.costBasis) * 100).toFixed(1) : '0.0';
      const pnlCls  = pnl >= 0 ? 'pos-pnl-pos' : 'pos-pnl-neg';

      return `<div class="position-card">
        <div class="pos-question">${escHtml(pos.question)}</div>
        <div class="pos-meta">
          <span class="pos-side-${pos.side.toLowerCase()}">${pos.side}</span>
          <span>${pos.shares.toLocaleString()} shares</span>
          <span>Cost: ${fmtUSD(pos.costBasis)}</span>
          <span>Bought @ ${cent(pos.buyPrice)}¢</span>
          <span>Now @ ${cent(cp)}¢</span>
          <span class="${pnlCls}">${pnl >= 0 ? '+' : ''}${fmtUSD(pnl)} (${pnl >= 0 ? '+' : ''}${pnlPct}%)</span>
        </div>
        ${market
          ? `<button class="btn-close-pos" data-pos-id="${pos.id}">Close @ ${cent(cp)}¢</button>`
          : '<span class="hint" style="font-size:11px;">Market not loaded — refresh to close</span>'
        }
      </div>`;
    }).join('');

    document.querySelectorAll('.btn-close-pos').forEach(btn => {
      btn.addEventListener('click', () => {
        const posId  = parseInt(btn.dataset.posId);
        const pos    = positions.find(p => p.id === posId);
        const market = pos ? marketMap[pos.marketId] : null;
        if (!market) { alert('Refresh markets first to get current price.'); return; }

        const result = Trader.closePosition(posId, market);
        if (result.success) {
          const sign = result.pnl >= 0 ? '+' : '';
          alert(`Position closed.\nProceeds: ${fmtUSD(result.proceeds)}\nP&L: ${sign}${fmtUSD(result.pnl)}`);
          updatePortfolioUI();
          updateHeaderStats();
        }
      });
    });
  }

  function renderHistory() {
    const history = Trader.getHistory();
    if (history.length === 0) {
      qs('#history-list').innerHTML = '<div class="empty-msg">No closed trades yet</div>';
      return;
    }

    qs('#history-list').innerHTML = history.slice(0, 100).map(h => {
      const pnlCls = h.pnl >= 0 ? 'positive' : 'negative';
      const sign   = h.pnl >= 0 ? '+' : '';

      return `<div class="history-item">
        <div class="hist-left">
          <div class="hist-market">${escHtml(h.question)}</div>
          <div class="hist-detail">
            ${h.side} × ${h.shares.toLocaleString()} &nbsp;·&nbsp;
            Bought ${cent(h.buyPrice)}¢ → Sold ${cent(h.sellPrice)}¢
          </div>
        </div>
        <div class="hist-right">
          <div class="hist-pnl ${pnlCls}">${sign}${fmtUSD(h.pnl)}</div>
          <div class="hist-date">${new Date(h.closedAt).toLocaleDateString()}</div>
        </div>
      </div>`;
    }).join('');
  }

  /* ════════════════════════════════════════════════
     TRADE MODAL
  ════════════════════════════════════════════════ */
  function openTradeModal(market, side) {
    selectedMarket = market;
    selectedSide   = side || 'YES';

    qs('#modal-question').textContent = market.question;
    qs('#modal-yes-price').innerHTML  = `<span class="price-tag-yes">YES ${cent(market.yesPrice)}¢</span>`;
    qs('#modal-no-price').innerHTML   = `<span class="price-tag-no">NO ${cent(market.noPrice)}¢</span>`;
    qs('#trade-shares').value = '100';

    setSide(selectedSide);
    qs('#trade-modal').classList.remove('hidden');
  }

  function setSide(side) {
    selectedSide = side;
    qs('#side-yes').classList.toggle('active', side === 'YES');
    qs('#side-no').classList.toggle('active', side === 'NO');
    updateTradePreview();
  }

  function updateTradePreview() {
    if (!selectedMarket) return;
    const shares  = Math.floor(+qs('#trade-shares').value) || 0;
    const price   = selectedSide === 'YES' ? selectedMarket.yesPrice : selectedMarket.noPrice;
    const cost    = +(price * shares).toFixed(2);
    const payout  = shares;                          // $1 per share
    const profit  = +(payout - cost).toFixed(2);
    const roi     = cost > 0 ? ((profit / cost) * 100).toFixed(0) : '0';
    const balance = Trader.getBalance();

    qs('#prev-price').textContent   = `$${price.toFixed(4)}`;
    qs('#prev-cost').textContent    = fmtUSD(cost);
    qs('#prev-payout').textContent  = fmtUSD(payout);
    qs('#prev-profit').textContent  = `${fmtUSD(profit)} (${roi}% ROI)`;
    qs('#prev-balance').textContent = fmtUSD(balance);
    qs('#prev-cost').className      = cost > balance ? 'negative' : '';
  }

  function closeModal() {
    qs('#trade-modal').classList.add('hidden');
  }

  function executeTrade() {
    if (!selectedMarket) return;
    const shares = Math.floor(+qs('#trade-shares').value) || 0;
    const result = Trader.buy(selectedMarket, selectedSide, shares);

    if (!result.success) {
      alert(`Trade failed: ${result.error}`);
      return;
    }

    closeModal();
    updatePortfolioUI();
    updateHeaderStats();

    const roi = ((1 / result.price - 1) * 100).toFixed(0);
    alert(
      `✅ Paper trade executed!\n\n` +
      `${selectedSide} × ${shares.toLocaleString()} shares\n` +
      `Price: ${cent(result.price)}¢ per share\n` +
      `Cost: ${fmtUSD(result.cost)}\n` +
      `Max profit if correct: ${fmtUSD(result.shares - result.cost)} (+${roi}%)\n\n` +
      `Check the Portfolio tab to track this position.`
    );
  }

  function handleReset() {
    if (confirm(
      'Reset your paper trading account to $10,000?\n\nAll positions and trade history will be permanently deleted.'
    )) {
      Trader.reset();
      updatePortfolioUI();
      updateHeaderStats();
    }
  }

  /* ════════════════════════════════════════════════
     HEADER STATS
  ════════════════════════════════════════════════ */
  function updateHeaderStats() {
    const m = Trader.getPortfolioMetrics(allMarkets);
    qs('#hdr-portfolio').textContent = fmtUSD(m.portfolioValue);
    qs('#hdr-balance').textContent   = fmtUSD(m.balance);
    const pnlEl = qs('#hdr-pnl');
    pnlEl.textContent = (m.unrealizedPnL >= 0 ? '+' : '') + fmtUSD(m.unrealizedPnL);
    pnlEl.className   = `stat-value ${m.unrealizedPnL >= 0 ? 'positive' : 'negative'}`;
    qs('#hdr-trades').textContent = m.closedCount;
  }

  /* ════════════════════════════════════════════════
     DATA LAB
  ════════════════════════════════════════════════ */
  async function runLabTest(endpoint) {
    const metaEl = qs('#response-meta');
    const outEl  = qs('#raw-output');
    outEl.textContent = '⟳ Fetching…';
    metaEl.textContent = '';

    const tokenId = selectedMarket && selectedMarket.yesTokenId ? selectedMarket.yesTokenId : null;
    let url;

    switch (endpoint) {
      case 'markets-one':
        url = `${PolyAPI.GAMMA}/markets?active=true&closed=false&limit=1`;
        break;
      case 'markets-hot':
        url = `${PolyAPI.GAMMA}/markets?active=true&closed=false&limit=3&order=volume24hr&ascending=false`;
        break;
      case 'orderbook':
        if (!tokenId) { outEl.textContent = '// Select a market in the Markets tab first, then come back and test this endpoint.'; return; }
        url = `${PolyAPI.CLOB}/books?token_id=${tokenId}`;
        break;
      case 'midpoint':
        if (!tokenId) { outEl.textContent = '// Select a market in the Markets tab first.'; return; }
        url = `${PolyAPI.CLOB}/midpoint?token_id=${tokenId}`;
        break;
      case 'spread':
        if (!tokenId) { outEl.textContent = '// Select a market in the Markets tab first.'; return; }
        url = `${PolyAPI.CLOB}/spread?token_id=${tokenId}`;
        break;
      default:
        return;
    }

    try {
      const result = await PolyAPI.rawFetch(url);
      const ts = new Date().toLocaleTimeString();
      metaEl.textContent = `HTTP ${result.status} · ${url} · ${ts}`;

      /* Pretty-print with colours by manipulating the text */
      const pretty = JSON.stringify(result.data, null, 2);
      outEl.textContent = pretty;

    } catch(err) {
      outEl.textContent =
        `// Error: ${err.message}\n\n` +
        `// CLOB endpoints are often CORS-restricted when called from a browser.\n` +
        `// The Gamma API endpoints above work fine.\n` +
        `// For CLOB data in production: run a small Node.js proxy on your machine\n` +
        `// that fetches from CLOB and serves it locally — no CORS restriction server-side.`;
    }
  }

  /* ════════════════════════════════════════════════
     AUTO REFRESH
  ════════════════════════════════════════════════ */
  function startAutoRefresh() {
    refreshTimer = setInterval(() => {
      loadMarkets();
      updatePortfolioUI();
    }, 60_000);
  }

  /* ════════════════════════════════════════════════
     UTILITIES
  ════════════════════════════════════════════════ */
  function qs(selector) { return document.querySelector(selector); }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cent(price) {
    return (price * 100).toFixed(1);
  }

  function fmtUSD(n) {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    return sign + new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2
    }).format(abs);
  }

  function fmtCompact(n) {
    if (!n) return '$0';
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => App.init());
