(function () {
  'use strict';

  // â”€â”€ Detect which type of viewpoint page we're on â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Extract PID from map hash (existing behaviour) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Parse "$769,900" or "769900" â†’ number â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function parsePrice(str) {
    if (!str) return null;
    const n = parseInt(String(str).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  // â”€â”€ Read window.vp from MAIN world via interceptor.js postMessage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Request cached map/click data from interceptor (cutsheet pages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // The cutsheet page auto-fires GET /api/v2/map/click on load; interceptor caches it.
  // We poll up to ~5s in case the XHR hasn't finished yet when button is clicked.
  function getClickData(maxWaitMs) {
    maxWaitMs = maxWaitMs || 5000;
    return new Promise((resolve) => {
      let elapsed = 0;
      function attempt() {
        window.postMessage({ __vpRequestClickData: true }, '*');
        const timer = setTimeout(() => {
          // no response within 300ms â€” give up and resolve null
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

  // â”€â”€ Fetch property record from API (map + property pages) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Inject the floating button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function injectButton(onClick) {
    if (document.getElementById('vp-analyzer-btn')) return null;
    const btn = document.createElement('button');
    btn.id = 'vp-analyzer-btn';
    btn.innerText = 'ðŸ“Š Add to Analyzer';
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

  // â”€â”€ Build payload for cut sheet page (uses cached map/click data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Build payload for property/map page (uses property/property API) â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Handle button click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleClick(btn, payloadFn) {
    return async function () {
      const orig = btn.innerText;
      btn.innerText = 'â³ Fetching...';
      btn.disabled  = true;
      try {
        const payload = await payloadFn();
        if (!payload) throw new Error('No data found');
        chrome.runtime.sendMessage({ type: 'OPEN_ANALYZER', payload });
        btn.innerText = 'âœ… Opened!';
        setTimeout(() => { btn.innerText = orig; btn.disabled = false; }, 3000);
      } catch (e) {
        btn.innerText = 'âŒ Error â€” try again';
        btn.disabled  = false;
        setTimeout(() => { btn.innerText = orig; }, 2500);
      }
    };
  }

  // â”€â”€ Entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Map page: wait for property selection then inject â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
