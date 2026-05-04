(function () {
  'use strict';

  // -- Detect page type --
  function getPageType() {
    var p = location.pathname;
    if (p.startsWith('/cutsheet/')) return 'cutsheet';
    if (p.startsWith('/property/')) return 'property';
    return 'map';
  }

  // /property/00160705/1/slug  or  /cutsheet/202604725/1/slug
  function getUrlSegments() {
    var parts = location.pathname.split('/').filter(Boolean);
    return { id: parts[1] || null, classId: parts[2] || '1' };
  }

  // -- PID from map hash --
  function getPidFromMap() {
    var el = document.querySelector('[id^="map#"]');
    if (el) {
      try {
        var data = JSON.parse(atob(el.id.slice(4)));
        var pid = data.overview && data.overview.property && data.overview.property.pid;
        if (pid) return { pid: pid, classId: (data.overview.property.class_id || '1') };
      } catch (e) {}
    }
    var hash = location.hash.slice(1);
    if (hash) {
      try {
        var data2 = JSON.parse(atob(hash));
        var pid2 = data2.overview && data2.overview.property && data2.overview.property.pid;
        if (pid2) return { pid: pid2, classId: (data2.overview.property.class_id || '1') };
      } catch (e) {}
    }
    return null;
  }

  // -- Parse price string to int --
  function parsePrice(str) {
    if (!str) return null;
    var n = parseInt(String(str).replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? null : n;
  }

  // -- Get vp nonces from MAIN world via interceptor --
  function getVpApi() {
    return new Promise(function (resolve) {
      function onMsg(e) {
        if (!e.data || e.data.__vpApiResponse !== true) return;
        window.removeEventListener('message', onMsg);
        resolve({ nonces: e.data.nonces, ver: e.data.ver });
      }
      window.addEventListener('message', onMsg);
      window.postMessage({ __vpRequestApi: true }, '*');
      setTimeout(function () { window.removeEventListener('message', onMsg); resolve(null); }, 2000);
    });
  }

  // -- Get cached map/click data from interceptor (only available if map fired it) --
  function getClickData() {
    return new Promise(function (resolve) {
      var elapsed = 0;
      function attempt() {
        window.postMessage({ __vpRequestClickData: true }, '*');
        var timer = setTimeout(function () {
          window.removeEventListener('message', onMsg);
          if (elapsed < 4000) { elapsed += 500; setTimeout(attempt, 500); }
          else resolve(null);
        }, 400);
        function onMsg(e) {
          if (!e.data || e.data.__vpClickDataResponse !== true) return;
          clearTimeout(timer);
          window.removeEventListener('message', onMsg);
          if (e.data.data) resolve(e.data.data);
          else if (elapsed < 4000) { elapsed += 500; setTimeout(attempt, 500); }
          else resolve(null);
        }
        window.addEventListener('message', onMsg);
      }
      attempt();
    });
  }

  // -- Fetch property record from API --
  async function fetchPropertyRecord(pid, classId) {
    var vpApi = await getVpApi();
    var ver   = (vpApi && vpApi.ver) || '23235';
    var nonce = vpApi && vpApi.nonces && vpApi.nonces[2];
    if (!nonce) return null;
    try {
      var body = 'identifiers[0][pid]=' + pid + '&identifiers[0][class_id]=' + classId + '&CLIENT_VER=' + ver + '&nonce=' + nonce;
      var r = await fetch('/api/v2/property/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body,
      });
      if (!r.ok) return null;
      var d = await r.json();
      return (d.properties && d.properties[0]) || null;
    } catch (e) { return null; }
  }

  // -- Scrape the cutsheet DOM for listing data --
  function scrapeCutsheetDom() {
    var getText = function (sel) {
      var el = document.querySelector(sel);
      return el ? (el.innerText || el.textContent || '').trim() : '';
    };

    // Address: page title before the dash
    var titleAddr = document.title.split(/\s*[-|]\s*/)[0].trim();

    // Price: look for elements containing a $ amount
    var priceEl = document.querySelector('[class*="price"]');
    var priceText = priceEl ? priceEl.innerText : '';
    // Also try meta og:description or a broader search
    if (!priceText) {
      document.querySelectorAll('*').forEach(function (el) {
        if (!priceText && el.childElementCount === 0 && /\$[\d,]+/.test(el.innerText || '')) {
          priceText = el.innerText;
        }
      });
    }
    var price = parsePrice(priceText);

    // Beds / baths / sqft from common listing detail patterns
    var beds = null, baths = null, sqft = null;
    document.querySelectorAll('[class*="bed"], [class*="bath"], [class*="sqft"], [class*="area"], [class*="detail"]').forEach(function (el) {
      var t = (el.innerText || '').toLowerCase();
      if (!beds  && /(\d+)\s*(bed|br)/.test(t))  beds  = parseInt(t.match(/(\d+)\s*(bed|br)/)[1]);
      if (!baths && /(\d+\.?\d*)\s*bath/.test(t)) baths = parseFloat(t.match(/(\d+\.?\d*)\s*bath/)[1]);
      if (!sqft  && /([\d,]+)\s*(sq|sqft|sq\.?\s*ft)/.test(t)) sqft = parsePrice(t.match(/([\d,]+)\s*(sq|sqft|sq\.?\s*ft)/)[1]);
    });

    // Also scan all text for sqft pattern
    if (!sqft) {
      var bodyText = document.body.innerText;
      var sqftMatch = bodyText.match(/([\d,]+)\s*sq[\s.]*ft/i);
      if (sqftMatch) sqft = parsePrice(sqftMatch[1]);
    }

    return { address: titleAddr, price: price, beds: beds, baths: baths, sqft: sqft };
  }

  // -- Build payload for cutsheet page --
  async function buildCutsheetPayload() {
    // Try interceptor cache first (available when ?map=1 triggers map/click)
    var clickData = await getClickData();

    if (clickData && clickData.property) {
      var prop    = clickData.property;
      var listing = (clickData.listings && clickData.listings[0]) || {};
      var assessment  = parseFloat(prop.assessment) || null;
      var listPrice   = parsePrice(listing.list_price);
      var purchasePrice = listPrice || assessment || null;
      var annualTaxes   = assessment ? Math.round(assessment * 0.01134) : null;
      var sqft = parseInt(listing.tla) || parseInt(listing.mla) || parseInt(prop.area) || null;
      var beds = parseInt(listing.nbeds) || null;
      var baths = (parseInt(listing.nfullbaths) || 0) + (parseInt(listing.nhalfbaths) || 0) * 0.5 || null;
      return {
        dealName: prop.address || listing.address || '',
        purchasePrice: purchasePrice,
        arv: assessment || purchasePrice,
        annualTaxes: annualTaxes,
        sqft: sqft, beds: beds, baths: baths,
        pid: prop.pid || '',
        listingId: listing.listing_id || getUrlSegments().id,
      };
    }

    // Fallback: scrape DOM + try to get assessment from property API using PID in page
    var dom = scrapeCutsheetDom();

    // Try to find PID embedded in the page (Angular state / script tags)
    var pid = null;
    document.querySelectorAll('script:not([src])').forEach(function (s) {
      if (!pid) {
        var m = s.textContent.match(/"pid"\s*:\s*"([0-9]+)"/);
        if (m) pid = m[1];
      }
    });
    // Also try the URL slug — not reliable but worth checking
    if (!pid) {
      var seg = getUrlSegments();
      // listing_id is seg.id for cutsheet, not pid — so skip
    }

    var assessment = null, annualTaxes = null;
    if (pid) {
      var rec = await fetchPropertyRecord(pid, '1');
      if (rec) {
        assessment = parseFloat(rec.assessment) || null;
        annualTaxes = assessment ? Math.round(assessment * 0.01134) : null;
        if (!dom.sqft && rec.area) dom.sqft = rec.area;
      }
    }

    if (!dom.address && !dom.price && !assessment) return null;

    return {
      dealName: dom.address || '',
      purchasePrice: dom.price || assessment || null,
      arv: assessment || dom.price || null,
      annualTaxes: annualTaxes,
      sqft: dom.sqft, beds: dom.beds, baths: dom.baths,
      pid: pid || '',
      listingId: getUrlSegments().id,
    };
  }

  // -- Build payload for property detail page --
  async function buildPropertyPayload(pid, classId) {
    var rec = await fetchPropertyRecord(pid, classId);
    if (!rec) return null;
    var assessment  = parseFloat(rec.assessment) || null;
    var annualTaxes = assessment ? Math.round(assessment * 0.01134) : null;
    return {
      dealName: rec.address || '',
      purchasePrice: assessment || null,
      arv: assessment || null,
      annualTaxes: annualTaxes,
      sqft: rec.area || null,
      beds: null, baths: null,
      pid: pid, listingId: null,
    };
  }

  // -- Inject button --
  function injectButton() {
    if (document.getElementById('vp-analyzer-btn')) return null;
    var btn = document.createElement('button');
    btn.id = 'vp-analyzer-btn';
    btn.innerText = '[+] Add to Analyzer';
    btn.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:2147483647',
      'background:#10b981', 'color:#fff', 'border:none', 'border-radius:8px',
      'padding:12px 20px', 'font-size:15px', 'font-weight:600',
      'cursor:pointer', 'box-shadow:0 4px 16px rgba(0,0,0,0.35)',
      'font-family:sans-serif', 'line-height:1',
    ].join(';');
    btn.addEventListener('mouseenter', function () { btn.style.background = '#059669'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = '#10b981'; });
    document.body.appendChild(btn);
    return btn;
  }

  // -- Wire button for a given payload builder --
  function wireButton(btn, payloadFn) {
    btn.addEventListener('click', async function () {
      var orig = btn.innerText;
      btn.innerText = 'Fetching...';
      btn.disabled = true;
      try {
        var payload = await payloadFn();
        if (!payload) throw new Error('No data');
        chrome.runtime.sendMessage({ type: 'OPEN_ANALYZER', payload: payload });
        btn.innerText = 'Opened!';
        setTimeout(function () { btn.innerText = orig; btn.disabled = false; }, 3000);
      } catch (e) {
        btn.innerText = 'Error - try again';
        btn.disabled = false;
        setTimeout(function () { btn.innerText = orig; }, 2500);
      }
    });
  }

  // -- Entry point --
  function runOnPage() {
    var type = getPageType();

    if (type === 'cutsheet') {
      var btn = injectButton();
      if (btn) wireButton(btn, buildCutsheetPayload);

    } else if (type === 'property') {
      var seg = getUrlSegments();
      if (!seg.id) return;
      var btn2 = injectButton();
      if (btn2) wireButton(btn2, function () { return buildPropertyPayload(seg.id, seg.classId); });

    } else {
      waitForMapAndRun();
    }
  }

  // -- Map page: wait for property selection --
  function mainMap() {
    var pidInfo = getPidFromMap();
    if (!pidInfo) return;
    var btn = injectButton();
    if (btn) wireButton(btn, function () { return buildPropertyPayload(pidInfo.pid, pidInfo.classId); });
  }

  function waitForMapAndRun() {
    if (getPidFromMap()) { mainMap(); return; }
    var obs = new MutationObserver(function () {
      if (getPidFromMap()) { obs.disconnect(); mainMap(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { if (getPidFromMap()) { obs.disconnect(); mainMap(); } }, 2000);
  }

  window.addEventListener('hashchange', function () {
    if (getPageType() !== 'map') return;
    var existing = document.getElementById('vp-analyzer-btn');
    if (existing) existing.remove();
    waitForMapAndRun();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOnPage);
  } else {
    runOnPage();
  }

})();