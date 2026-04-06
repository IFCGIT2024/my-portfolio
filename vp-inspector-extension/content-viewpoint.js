(function () {
  'use strict';

  // ── Detect which type of viewpoint page we're on ─────────────────────────────
  // Returns: 'map' | 'property' | 'cutsheet'
  function getPageType() {
    const p = location.pathname;
    if (p.startsWith('/cutsheet/')) return 'cutsheet';
    if (p.startsWith('/property/')) return 'property';
    return 'map';
  }

  // Segments: /property/00160705/1/slug  or  /cutsheet/202604725/1/slug
  function getUrlSegments() {
    const parts = location.pathname.split('/').filter(Boolean);
    // parts[0] = 'property' or 'cutsheet'
    // parts[1] = pid or listing_id
    // parts[2] = class_id
    return { id: parts[1] || null, classId: parts[2] || '1' };
  }

  // ── Extract PID from map hash (existing behaviour) ───────────────────────────
  function getPidFromMap() {
    const el = document.querySelector('[id^="map#"]');
    if (el) {
      try {
        const data = JSON.parse(atob(el.id.slice(4)));
        const pid = data.overview?.property?.pid;
        if (pid) return { pid, classId: data.overview?.property?.class_id || '1' };
      } catch (e) { /* fall through */ }
    }
    const hash = location.hash.slice(1);
    if (hash) {
      try {
        const data = JSON.parse(atob(hash));
        const pid = data.overview?.property?.pid;
        if (pid) return { pid, classId: data.overview?.property?.class_id || '1' };
      } catch (e) {}
    }
    return null;
  }

  // ── Parse "$769,900" or "769900" → number ───────────────────────────────────
  function parsePrice(str) {
    if (!str) return null;
    const n = parseInt(String(str).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  // ── Read window.vp from MAIN world via interceptor.js postMessage ─────────────
  function getVpApi() {
    return new Promise((resolve) => {
      function onMsg(e) {
        if (!e.data || e.data.__vpApiResponse !== true) return;
        window.removeEventListener('message', onMsg);
        resolve({ nonces: e.data.nonces, ver: e.data.ver });
      }
      window.addEventListener('message', onMsg);
      window.postMessage({ __vpRequestApi: true }, '*');
      setTimeout(() => { window.removeEventListener('message', onMsg); resolve(null); }, 2000);
    });
  }

  // ── Request cached map/click data from interceptor (cutsheet pages) ──────────
  // The cutsheet page auto-fires GET /api/v2/map/click on load; interceptor caches it.
  // We poll up to ~5s in case the XHR hasn't finished yet when button is clicked.
  function getClickData(maxWaitMs) {
    maxWaitMs = maxWaitMs || 5000;
    return new Promise((resolve) => {
      let elapsed = 0;
      function attempt() {
        window.postMessage({ __vpRequestClickData: true }, '*');
        const timer = setTimeout(() => {
          // no response within 300ms — give up and resolve null
          window.removeEventListener('message', onMsg);
          resolve(null);
        }, 300);
        function onMsg(e) {
          if (!e.data || e.data.__vpClickDataResponse !== true) return;
          clearTimeout(timer);
          window.removeEventListener('message', onMsg);
          if (e.data.data) {
            resolve(e.data.data); // got it
          } else if (elapsed < maxWaitMs) {
            elapsed += 400;
            setTimeout(attempt, 400); // retry
          } else {
            resolve(null); // timeout
          }
        }
        window.addEventListener('message', onMsg);
      }
      attempt();
    });
  }

  // ── Fetch property record from API (map + property pages) ───────────────────
  async function fetchPropertyRecord(pid, classId) {
    const vpApi = await getVpApi();
    const ver   = vpApi?.ver || '23235';
    const nonce = vpApi?.nonces?.[2];
    if (!nonce) return null;
    try {
      const body = `identifiers[0][pid]=${pid}&identifiers[0][class_id]=${classId}&CLIENT_VER=${ver}&nonce=${nonce}`;
      const r    = await fetch('/api/v2/property/property', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!r.ok) return null;
      const d = await r.json();
      return d.properties?.[0] || null;
    } catch (e) { return null; }
  }

  // ── Inject the floating button ────────────────────────────────────────────────
  function injectButton(onClick) {
    if (document.getElementById('vp-analyzer-btn')) return null;
    const btn = document.createElement('button');
    btn.id = 'vp-analyzer-btn';
    btn.innerText = '📊 Add to Analyzer';
    btn.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:2147483647',
      'background:#10b981', 'color:#fff', 'border:none', 'border-radius:8px',
      'padding:12px 20px', 'font-size:15px', 'font-weight:600',
      'cursor:pointer', 'box-shadow:0 4px 16px rgba(0,0,0,0.35)',
      'font-family:sans-serif', 'line-height:1',
    ].join(';');
    btn.addEventListener('mouseenter', () => { btn.style.background = '#059669'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#10b981'; });
    btn.addEventListener('click', onClick);
    document.body.appendChild(btn);
    return btn;
  }

  // ── Build payload for cut sheet page (uses cached map/click data) ─────────────
  async function buildCutsheetPayload() {
    const clickData = await getClickData();
    if (!clickData) return null;

    const prop    = clickData.property || {};
    const listing = (clickData.listings || [])[0] || {};

    const assessment  = parseFloat(prop.assessment) || null;
    const listPrice   = parsePrice(listing.list_price);
    const purchasePrice = listPrice || assessment || null;
    const arv           = assessment || listPrice || null;
    const annualTaxes   = assessment ? Math.round(assessment * 0.01134) : null;
    const sqft          = parseInt(listing.tla) || parseInt(prop.area) || null;
    const beds          = parseInt(listing.nbeds) || null;
    const baths         = (parseInt(listing.nfullbaths) || 0) + (parseInt(listing.nhalfbaths) || 0) * 0.5 || null;
    const address       = prop.address || listing.address || '';
    const pid           = prop.pid || '';
    const listingId     = listing.listing_id || getUrlSegments().id;

    return { dealName: address, purchasePrice, arv, annualTaxes, sqft, beds, baths, pid, listingId };
  }

  // ── Build payload for property/map page (uses property/property API) ─────────
  async function buildPropertyPayload(pid, classId) {
    const propRecord = await fetchPropertyRecord(pid, classId);
    if (!propRecord) return null;

    const assessment  = parseFloat(propRecord.assessment) || null;
    const annualTaxes = assessment ? Math.round(assessment * 0.01134) : null;
    const address     = propRecord.address || '';
    const sqft        = propRecord.area    || null;

    return {
      dealName:      address,
      purchasePrice: assessment || null,
      arv:           assessment || null,
      annualTaxes,
      sqft,
      beds:          null,
      baths:         null,
      pid,
      listingId:     null,
    };
  }

  // ── Handle button click ───────────────────────────────────────────────────────
  function handleClick(btn, payloadFn) {
    return async function () {
      const orig = btn.innerText;
      btn.innerText = '⏳ Fetching...';
      btn.disabled  = true;
      try {
        const payload = await payloadFn();
        if (!payload) throw new Error('No data found');
        chrome.runtime.sendMessage({ type: 'OPEN_ANALYZER', payload });
        btn.innerText = '✅ Opened!';
        setTimeout(() => { btn.innerText = orig; btn.disabled = false; }, 3000);
      } catch (e) {
        btn.innerText = '❌ Error — try again';
        btn.disabled  = false;
        setTimeout(() => { btn.innerText = orig; }, 2500);
      }
    };
  }

  // ── Entry point ───────────────────────────────────────────────────────────────
  function runOnPage() {
    const type = getPageType();

    if (type === 'cutsheet') {
      // Cut sheet: always has a listing, show button immediately
      const btn = injectButton(() => {});
      if (!btn) return;
      btn.addEventListener('click', handleClick(btn, buildCutsheetPayload));

    } else if (type === 'property') {
      // Property detail page: PID is in URL
      const { id: pid, classId } = getUrlSegments();
      if (!pid) return;
      const btn = injectButton(() => {});
      if (!btn) return;
      btn.addEventListener('click', handleClick(btn, () => buildPropertyPayload(pid, classId)));

    } else {
      // Map page: wait for a property to be selected (existing behaviour)
      waitForMapAndRun();
    }
  }

  // ── Map page: wait for property selection then inject ────────────────────────
  async function mainMap() {
    const pidInfo = getPidFromMap();
    if (!pidInfo?.pid) return;

    const btn = injectButton(() => {});
    if (!btn) return;
    btn.addEventListener('click', handleClick(btn, () => buildPropertyPayload(pidInfo.pid, pidInfo.classId)));
  }

  function waitForMapAndRun() {
    if (getPidFromMap()) { mainMap(); return; }
    const obs = new MutationObserver(() => {
      if (getPidFromMap()) { obs.disconnect(); mainMap(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => { if (getPidFromMap()) { obs.disconnect(); mainMap(); } }, 2000);
  }

  // Re-run on hash change (map SPA navigation)
  window.addEventListener('hashchange', () => {
    if (getPageType() !== 'map') return;
    const existing = document.getElementById('vp-analyzer-btn');
    if (existing) existing.remove();
    waitForMapAndRun();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOnPage);
  } else {
    runOnPage();
  }

})();
    // Try DOM element first
    const el = document.querySelector('[id^="map#"]');
    if (el) {
      try {
        const data = JSON.parse(atob(el.id.slice(4)));
        // overview key only exists after clicking a specific property
        const pid = data.overview?.property?.pid;
        if (pid) return { pid, classId: data.overview?.property?.class_id || '1' };
      } catch (e) { /* fall through */ }
    }
    // Fallback: parse URL hash — only if overview is present
    const hash = location.hash.slice(1);
    if (hash) {
      try {
        const data = JSON.parse(atob(hash));
        const pid = data.overview?.property?.pid;
        if (pid) return { pid, classId: data.overview?.property?.class_id || '1' };
      } catch (e) { /* not base64 JSON */ }
    }
    return null;
  }

  // ── Extract listing_id from URL ──────────────────────────────────────────────
  function getListingId() {
    return location.pathname.match(/\/cutsheet\/(\d+)/)?.[1] || null;
  }

  // ── Extract address from URL path ────────────────────────────────────────────
  function getAddressFromUrl() {
    const match = location.pathname.match(/\/(?:cutsheet|property)\/[^/]+\/[^/]+\/([^/?]+)/);
    if (!match) return '';
    return match[1].replace(/-/g, ' ');
  }

  // ── Parse "$769,900" or "769900" → number ───────────────────────────────────
  function parsePrice(str) {
    if (!str) return null;
    const n = parseInt(String(str).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  // ── Wait for an Angular template to render ({{...}} disappears) ──────────────
  function waitForRender(selector, timeout = 12000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el && el.innerText && !el.innerText.includes('{{')) { resolve(el); return; }
        if (Date.now() - start > timeout) { resolve(null); return; }
        setTimeout(check, 250);
      };
      check();
    });
  }

  // ── Scrape rendered listing data from DOM ────────────────────────────────────
  async function scrapeListingData() {
    // Wait for price to render — it's the most important field
    await waitForRender('[class*="listing-price"], [class*="price"]');

    const getText = sel => document.querySelector(sel)?.innerText?.trim() || '';

    // Price: look for rendered price element
    const priceText = getText('[class*="listing-price"]') || getText('[class*="price"]');
    const price = parsePrice(priceText);

    // Beds / baths from detail block
    const bedsText  = getText('[class*="beds"]');
    const bathsText = getText('[class*="bath"]');
    const beds  = parseInt(bedsText)   || null;
    const baths = parseFloat(bathsText) || null;

    // Sqft — tla_fmt is usually "1,040 sq ft" somewhere in listing details
    const detailText = getText('[class*="listing-detail"]');
    const sqftMatch  = detailText.match(/([\d,]+)\s*sq/i);
    const sqft = sqftMatch ? parsePrice(sqftMatch[1]) : null;

    // Address from page title (e.g. "5551 Sullivan Street, Halifax - ViewPoint Realty")
    const titleAddr = document.title.split(/\s*[-|–]\s*/)[0].trim();
    const address   = titleAddr || getAddressFromUrl();

    return { address, price, beds, baths, sqft };
  }

  // ── Read window.vp from MAIN world via postMessage to interceptor.js ────────
  function getVpApi() {
    return new Promise((resolve) => {
      function onMsg(e) {
        if (!e.data || e.data.__vpApiResponse !== true) return;
        window.removeEventListener('message', onMsg);
        resolve({ nonces: e.data.nonces, ver: e.data.ver });
      }
      window.addEventListener('message', onMsg);
      window.postMessage({ __vpRequestApi: true }, '*');
      // Fallback timeout
      setTimeout(() => { window.removeEventListener('message', onMsg); resolve(null); }, 2000);
    });
  }

  // ── Fetch property record from API (works without login) ─────────────────────
  async function fetchPropertyRecord(pid, classId) {
    const vpApi = await getVpApi();
    const ver   = vpApi?.ver || '23235';
    const nonce = vpApi?.nonces?.[2];
    console.log('[VP] fetchPropertyRecord pid:', pid, 'nonce:', nonce, 'ver:', ver);
    if (!nonce) { console.log('[VP] No nonce from MAIN world, vpApi:', JSON.stringify(vpApi)); return null; }
    try {
      const body = `identifiers[0][pid]=${pid}&identifiers[0][class_id]=${classId}&CLIENT_VER=${ver}&nonce=${nonce}`;
      const r    = await fetch('/api/v2/property/property', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      console.log('[VP] property/property status:', r.status);
      if (!r.ok) return null;
      const d = await r.json();
      console.log('[VP] property/property response:', JSON.stringify(d).slice(0, 300));
      return d.properties?.[0] || null;
    } catch (e) { console.log('[VP] fetch error:', e); return null; }
  }

  // ── Build the analyzer URL with data as query params ─────────────────────────
  function buildAnalyzerUrl(payload) {
    const base = 'https://ifcgit2024.github.io/my-portfolio/real-estate-analyzer/index.html';
    const p = new URLSearchParams();
    if (payload.dealName)      p.set('dealName',      payload.dealName);
    if (payload.purchasePrice) p.set('purchasePrice', payload.purchasePrice);
    if (payload.arv)           p.set('arv',           payload.arv);
    if (payload.annualTaxes)   p.set('annualTaxes',   payload.annualTaxes);
    if (payload.beds)          p.set('_beds',         payload.beds);
    if (payload.baths)         p.set('_baths',        payload.baths);
    if (payload.sqft)          p.set('_sqft',         payload.sqft);
    p.set('_source', 'viewpoint');
    p.set('_pid',    payload.pid);
    if (payload.listingId) p.set('_listingId', payload.listingId);
    return `${base}?${p.toString()}`;
  }

  // ── Inject the floating button ────────────────────────────────────────────────
  function injectButton(onClick) {
    if (document.getElementById('vp-analyzer-btn')) return null;

    const btn = document.createElement('button');
    btn.id = 'vp-analyzer-btn';
    btn.innerText = '📊 Add to Analyzer';
    btn.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:2147483647',
      'background:#10b981', 'color:#fff', 'border:none', 'border-radius:8px',
      'padding:12px 20px', 'font-size:15px', 'font-weight:600',
      'cursor:pointer', 'box-shadow:0 4px 16px rgba(0,0,0,0.35)',
      'font-family:sans-serif', 'line-height:1',
    ].join(';');

    btn.addEventListener('mouseenter', () => { btn.style.background = '#059669'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#10b981'; });
    btn.addEventListener('click', onClick);
    document.body.appendChild(btn);
    return btn;
  }

  // ── Main ──────────────────────────────────────────────────────────────────────
  async function main() {
    const pidInfo   = getPidFromMap();
    const listingId = getListingId();
    if (!pidInfo?.pid) return; // no property selected yet

    const btn = injectButton(async () => {
      const orig = btn.innerText;
      btn.innerText = '⏳ Fetching...';
      btn.disabled  = true;

      try {
        const [domData, propRecord] = await Promise.all([
          scrapeListingData(),
          fetchPropertyRecord(pidInfo.pid, pidInfo.classId),
        ]);

        console.log('[VP] domData:', JSON.stringify(domData));
        console.log('[VP] propRecord:', JSON.stringify(propRecord)?.slice(0, 300));

        const assessment  = parseFloat(propRecord?.assessment) || null;
        const annualTaxes = assessment ? Math.round(assessment * 0.01134) : null;
        const arv         = assessment || domData.price || null;

        // Use API address if DOM title was just "Map"
        const address = (domData.address && domData.address !== 'Map')
          ? domData.address
          : (propRecord?.address || pidInfo.pid);

        // sqft from API response (area field), beds/baths from DOM if available
        const sqft = propRecord?.area || domData.sqft || null;

        // purchasePrice from DOM if rendered, otherwise fall back to assessment
        const purchasePrice = domData.price || assessment || null;

        const payload = {
          dealName:      address,
          purchasePrice: purchasePrice,
          arv,
          annualTaxes,
          beds:          domData.beds,
          baths:         domData.baths,
          sqft:          sqft,
          pid:           pidInfo.pid,
          listingId,
        };

        console.log('[VP] Sending payload to background:', JSON.stringify(payload));
        chrome.runtime.sendMessage({ type: 'OPEN_ANALYZER', payload });

        btn.innerText = '✅ Opened!';
        setTimeout(() => { btn.innerText = orig; btn.disabled = false; }, 3000);
      } catch (e) {
        btn.innerText = '❌ Error — try again';
        btn.disabled  = false;
        setTimeout(() => { btn.innerText = orig; }, 2500);
      }
    });
  }

  // Wait for map element to appear (loads after page init)
  function waitForMapAndRun() {
    if (getPidFromMap()) { main(); return; }
    const obs = new MutationObserver(() => {
      if (getPidFromMap()) { obs.disconnect(); main(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    // Also try after short delay in case mutation fires before observe
    setTimeout(() => { if (getPidFromMap()) { obs.disconnect(); main(); } }, 2000);
  }

  // Re-run when URL hash changes (user clicks different property on map)
  window.addEventListener('hashchange', () => {
    const existing = document.getElementById('vp-analyzer-btn');
    if (existing) existing.remove();
    waitForMapAndRun();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForMapAndRun);
  } else {
    waitForMapAndRun();
  }

})();
