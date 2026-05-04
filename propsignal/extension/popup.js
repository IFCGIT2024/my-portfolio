'use strict';

let allRequests   = [];
let selectedIdx   = null;
let filterText    = 'viewpoint.ca/api';
let selectedEpKey = null;

// ── Endpoint analysis ─────────────────────────────────────────────────────────

/**
 * Replace all-digit path segments (PID, class_id, etc.) with {n}
 * and strip query strings to produce a stable pattern key.
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('viewpoint.ca')) return null;
    const pattern = u.pathname.split('/').map(seg =>
      /^\d+$/.test(seg) ? '{n}' : seg
    ).join('/');
    return u.origin + pattern;
  } catch {
    return null;
  }
}

/** Return top-level keys of first non-null JSON response, up to 10 */
function topKeys(requests) {
  for (const r of requests) {
    if (r.responseParsed && typeof r.responseParsed === 'object') {
      const keys = Object.keys(r.responseParsed);
      return keys.slice(0, 10).join(', ') + (keys.length > 10 ? ', …' : '');
    }
  }
  return '—';
}

function buildEndpointMap() {
  const map = new Map(); // pattern → { method, pattern, hits: [], example }
  for (const r of allRequests) {
    const pattern = normalizeUrl(r.url);
    if (!pattern) continue;
    const key = `${r.method} ${pattern}`;
    if (!map.has(key)) map.set(key, { method: r.method, pattern, hits: [], example: r });
    map.get(key).hits.push(r);
  }
  return map;
}

function renderEndpoints() {
  const epList = document.getElementById('ep-list');
  const epCount = document.getElementById('epCountLabel');
  const map = buildEndpointMap();
  epCount.textContent = `${map.size} endpoint${map.size !== 1 ? 's' : ''}`;

  if (!map.size) {
    epList.innerHTML = `<div class="empty"><div class="empty-icon">🗺️</div><div>No Viewpoint API calls captured yet.<br><span style="font-size:11px;color:#374151">Browse viewpoint.ca with a property open.</span></div></div>`;
    return;
  }

  epList.innerHTML = [...map.entries()].map(([key, ep]) => {
    const { host, path } = urlParts(ep.pattern);
    const fields = topKeys(ep.hits);
    const isActive = selectedEpKey === key;
    return `
      <div class="ep-row${isActive ? ' active' : ''}" data-key="${escHtml(key)}">
        <div class="ep-pattern"><span class="ep-host">${host}</span>${path}</div>
        <div class="ep-meta">
          <span class="ep-method">${ep.method}</span>
          <span class="ep-count">${ep.hits.length}×</span>
          <span class="ep-fields">keys: ${escHtml(fields)}</span>
        </div>
      </div>`;
  }).join('');

  epList.querySelectorAll('.ep-row').forEach(row => {
    row.addEventListener('click', () => {
      selectedEpKey = row.dataset.key;
      const ep = map.get(selectedEpKey);
      renderEpDetail(ep);
      renderEndpoints();
    });
  });
}

function renderEpDetail(ep) {
  const panel = document.getElementById('ep-detail');
  panel.classList.add('open');

  const example = ep.example;
  // Build cURL from the real example URL
  const curlHeaders = example.requestBody
    ? `-H "Content-Type: application/json" -d '${example.requestBody.replace(/'/g, "'\\''")}'`
    : '';
  const curl = `curl -X ${example.method} \\\n  "${example.url}" \\\n  -H "Accept: application/json" ${curlHeaders}`.trim();

  const responsePreview = example.responseParsed
    ? `<pre>${colorJson(example.responseParsed)}</pre>`
    : `<pre>${escHtml((example.responseText || '').slice(0, 1000))}</pre>`;

  panel.innerHTML = `
    <div class="ep-detail-title">API Endpoint Pattern</div>
    <div class="detail-url">${escHtml(ep.pattern)}</div>
    <div class="detail-meta">
      <div class="meta-item">Method: <span>${ep.method}</span></div>
      <div class="meta-item">Seen: <span>${ep.hits.length}×</span></div>
      <div class="meta-item">Status: <span>${example.status}</span></div>
    </div>
    <div class="section-label">Example URL (real)</div>
    <div class="detail-url" style="color:#fde68a;margin-bottom:8px">${escHtml(example.url)}</div>
    <div class="section-label">cURL</div>
    <div class="ep-curl">${escHtml(curl)}</div>
    <div class="ep-actions">
      <button class="ep-copy-btn" id="copyCurlBtn">Copy cURL</button>
      <button class="ep-copy-btn" id="copyUrlBtn" style="background:#065f46;color:#6ee7b7">Copy URL</button>
    </div>
    <div class="section-label">Response keys</div>
    <div style="font-size:11px;color:#86efac;margin-bottom:8px">${escHtml(topKeys(ep.hits))}</div>
    <div class="section-label">Example Response</div>
    ${responsePreview}
  `;

  document.getElementById('copyCurlBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(curl).then(() => {
      const btn = document.getElementById('copyCurlBtn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy cURL', 1500);
    });
  });
  document.getElementById('copyUrlBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(example.url).then(() => {
      const btn = document.getElementById('copyUrlBtn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy URL', 1500);
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function urlParts(url) {
  try {
    const u = new URL(url);
    return { host: u.host, path: u.pathname + u.search };
  } catch {
    return { host: '', path: url };
  }
}

function colorJson(obj) {
  const str = JSON.stringify(obj, null, 2);
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*([eE][+-]?\d+)?)/g,
    match => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="json-key">${match}</span>`;
        return `<span class="json-str">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
      if (/null/.test(match))       return `<span class="json-null">${match}</span>`;
      return `<span class="json-num">${match}</span>`;
    }
  );
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const list = document.getElementById('list');
  const countLabel = document.getElementById('countLabel');

  const filtered = allRequests.filter(r =>
    !filterText || r.url.toLowerCase().includes(filterText.toLowerCase())
  );

  countLabel.textContent = `${filtered.length} request${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">📡</div><div>${allRequests.length ? 'No matches for that filter.' : 'Browse a page to capture requests.'}</div></div>`;
    return;
  }

  list.innerHTML = filtered.map((r, i) => {
    const { host, path } = urlParts(r.url);
    const statusClass = r.status >= 200 && r.status < 300 ? 'status-ok' : 'status-err';
    const badgeClass  = r.type === 'XHR' ? 'badge-xhr' : 'badge-fetch';
    return `
      <div class="req-row${selectedIdx === i ? ' active' : ''}" data-idx="${i}">
        <span class="badge ${badgeClass}">${r.type}</span>
        <span class="req-method">${r.method}</span>
        <span class="${statusClass}">${r.status || '—'}</span>
        <span class="req-url"><span style="color:#6b7280">${host}</span><span class="url-path">${path}</span></span>
        <span class="req-time">${r.duration}ms</span>
      </div>`;
  }).join('');

  list.querySelectorAll('.req-row').forEach(row => {
    row.addEventListener('click', () => {
      selectedIdx = parseInt(row.dataset.idx);
      renderDetail(filtered[selectedIdx]);
      render();
    });
  });
}

function renderDetail(r) {
  const detail = document.getElementById('detail');
  detail.classList.add('open');

  const body = r.responseParsed
    ? `<pre>${colorJson(r.responseParsed)}</pre>`
    : `<pre>${escHtml(r.responseText || '(empty)')}</pre>`;

  const reqBody = r.requestBody
    ? `<div class="section-label">Request Body</div><pre>${escHtml(r.requestBody)}</pre>`
    : '';

  detail.innerHTML = `
    <div class="detail-title">${r.type} — ${r.method} <span style="color:#4ade80">${r.status}</span></div>
    <div class="detail-url">${escHtml(r.url)}</div>
    <div class="detail-meta">
      <div class="meta-item">Duration: <span>${r.duration}ms</span></div>
      <div class="meta-item">Time: <span>${r.timestamp.slice(11, 19)}</span></div>
      <div class="meta-item">Format: <span>${r.responseParsed ? 'JSON ✓' : 'Text'}</span></div>
    </div>
    ${reqBody}
    <div class="section-label">Response</div>
    ${body}
  `;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Tab switching ─────────────────────────────────────────────────────────────

let activeTab = 'requests';

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${activeTab}`));
    if (activeTab === 'endpoints') renderEndpoints();
    else if (activeTab === 'map') { /* nothing to render */ }
    else render();
  });
});

document.getElementById('openVpMapBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.viewpoint.ca/map', active: true });
});


// ── Poll for new requests every 800ms ─────────────────────────────────────────

function poll() {
  if (!chrome || !chrome.tabs) return; // guard: not available in sub-frame contexts
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.runtime.sendMessage(
      { type: 'GET_REQUESTS', tabId: tabs[0].id },
      resp => {
        if (chrome.runtime.lastError) return;
        if (!resp) return;
        allRequests = resp.requests || [];
        if (activeTab === 'endpoints') renderEndpoints();
        else render();
      }
    );
  });
}

setInterval(poll, 800);
poll();

// ── Controls ──────────────────────────────────────────────────────────────────

document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.runtime.sendMessage({ type: 'CLEAR_REQUESTS', tabId: tabs[0].id }, () => {
      allRequests = [];
      selectedIdx = null;
      document.getElementById('detail').classList.remove('open');
      render();
    });
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const filtered = allRequests.filter(r =>
    !filterText || r.url.toLowerCase().includes(filterText.toLowerCase())
  );
  // If on endpoints tab, export the endpoint map instead
  if (activeTab === 'endpoints') {
    const map = buildEndpointMap();
    const out = [...map.entries()].map(([key, ep]) => ({
      pattern: ep.pattern,
      method: ep.method,
      count: ep.hits.length,
      responseKeys: topKeys(ep.hits),
      exampleUrl: ep.example.url,
    }));
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `vp-endpoints-${new Date().toISOString().slice(0,19).replace(/[T:]/g,'-')}.json`;
    a.click(); URL.revokeObjectURL(url);
    return;
  }
  const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const ts   = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  a.href     = url;
  a.download = `vp-requests-${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const filtered = allRequests.filter(r =>
    !filterText || r.url.toLowerCase().includes(filterText.toLowerCase())
  );
  navigator.clipboard.writeText(JSON.stringify(filtered, null, 2))
    .then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy JSON', 1500);
    });
});

document.getElementById('filterInput').addEventListener('input', e => {
  filterText = e.target.value;
  selectedIdx = null;
  document.getElementById('detail').classList.remove('open');
  render();
});

// ── Bulk Export UI ────────────────────────────────────────────────────────────

let _bulkRows = [];

function bulkLog(msg, type = 'inf') {
  const log = document.getElementById('bulkLog');
  const line = document.createElement('div');
  line.className = `log-${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function bulkSetProgress(done, total, msg) {
  const bar    = document.getElementById('bulkProgressBar');
  const status = document.getElementById('bulkStatus');
  status.textContent = msg;
  bar.style.width = total > 0 ? `${Math.round((done / total) * 100)}%` : '0%';
  // Always log so user can see what's happening
  const type = (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail'))
    ? 'err'
    : (done === total && total > 0) ? 'ok' : 'inf';
  bulkLog(msg, type);
}

// Rate slider
document.getElementById('rateSlider').addEventListener('input', e => {
  const ms = parseInt(e.target.value);
  document.getElementById('rateLabel').textContent = (ms / 1000).toFixed(1) + ' s';
  if (typeof window !== 'undefined') window._bulkRateMs = ms;
});

// Grid step input — update estimate label and window._bulkGridStep
function updateGridEstimate() {
  const stepM = parseInt(document.getElementById('gridStep').value) || 40;
  window._bulkGridStep = stepM;
  const swLat = parseFloat(document.getElementById('bSwLat').value);
  const swLng = parseFloat(document.getElementById('bSwLng').value);
  const neLat = parseFloat(document.getElementById('bNeLat').value);
  const neLng = parseFloat(document.getElementById('bNeLng').value);
  if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) return;
  const n = estimateGridCount({ swLat, swLng, neLat, neLng }, stepM);
  const secs = Math.round(n * ((window._bulkRateMs || 1200) / 1000));
  const mins = Math.round(secs / 60);
  document.getElementById('gridEstimate').textContent =
    `~${n.toLocaleString()} requests · ~${mins} min`;
}
document.getElementById('gridStep').addEventListener('input', updateGridEstimate);
['bSwLat','bSwLng','bNeLat','bNeLng'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateGridEstimate)
);
updateGridEstimate(); // run once on load

// "Use captured bounds" link — read last boundsinfo request from intercepted calls
document.getElementById('useCapturedBounds').addEventListener('click', () => {
  const boundsReq = [...allRequests].reverse().find(r =>
    r.url && r.url.includes('/api/v2/map/boundsinfo')
  );
  if (!boundsReq) { alert('No boundsinfo request captured yet. Browse viewpoint.ca first.'); return; }
  try {
    const u = new URL(boundsReq.url);
    document.getElementById('bSwLat').value = u.searchParams.get('sw_lat') || '';
    document.getElementById('bSwLng').value = u.searchParams.get('sw_lng') || '';
    document.getElementById('bNeLat').value = u.searchParams.get('ne_lat') || '';
    document.getElementById('bNeLng').value = u.searchParams.get('ne_lng') || '';
    bulkLog('Bounds loaded from captured boundsinfo request.', 'ok');
  } catch (e) {
    alert('Could not parse bounds from captured request.');
  }
});

document.getElementById('bulkStartBtn').addEventListener('click', async () => {
  if (isExportRunning()) return;

  const swLat = parseFloat(document.getElementById('bSwLat').value);
  const swLng = parseFloat(document.getElementById('bSwLng').value);
  const neLat = parseFloat(document.getElementById('bNeLat').value);
  const neLng = parseFloat(document.getElementById('bNeLng').value);

  if ([swLat, swLng, neLat, neLng].some(isNaN)) {
    alert('Please enter valid lat/lng bounds.');
    return;
  }

  // Apply current rate setting
  if (typeof window._bulkRateMs === 'number') {
    // bulk-export.js reads this via module-level override on next call
  }

  _bulkRows = [];
  document.getElementById('bulkLog').innerHTML = '';
  document.getElementById('bulkProgressBar').style.width = '0%';
  document.getElementById('bulkStartBtn').disabled = true;
  document.getElementById('bulkStopBtn').style.display = 'inline-block';
  document.getElementById('bulkSaveBtn').style.display = 'none';

  // Extract any property coords already captured from manual browsing
  const capturedCoords = [];
  const seenPids = new Set();
  for (const r of allRequests) {
    if (!r.url || !r.url.includes('/api/v2/map/click')) continue;
    const prop = r.responseParsed && r.responseParsed.property;
    if (!prop || !prop.lat || !prop.lng) continue;
    const key = prop.pid ? String(prop.pid) : `${prop.lat},${prop.lng}`;
    if (!seenPids.has(key)) {
      seenPids.add(key);
      capturedCoords.push({ lat: prop.lat, lng: prop.lng, pid: prop.pid, address: prop.address });
    }
  }
  window._vpCapturedCoords = capturedCoords;
  if (capturedCoords.length) bulkLog(`${capturedCoords.length} pre-captured properties will be skipped in grid.`, 'ok');

  // Seed nonce from most recent captured Viewpoint API response
  const seedNonce = (() => {
    for (let i = allRequests.length - 1; i >= 0; i--) {
      const r = allRequests[i];
      if (r.url && r.url.includes('viewpoint.ca/api') && r.responseParsed && r.responseParsed.nonce) {
        return r.responseParsed.nonce;
      }
    }
    return null;
  })();
  if (seedNonce) {
    window._vpSeedNonce = seedNonce;
    bulkLog(`Nonce seeded from captured requests.`, 'ok');
  } else {
    bulkLog(`No captured nonce found — will fetch from VP tab.`, 'inf');
  }

  bulkLog('Starting grid sweep...', 'inf');

  try {
    _bulkRows = await runBulkExport(
      { swLat, swLng, neLat, neLng },
      bulkSetProgress
    );
  } catch (err) {
    bulkLog(`Fatal error: ${err.message}`, 'err');
    bulkSetProgress(0, 0, `Error: ${err.message}`);
  }

  document.getElementById('bulkStartBtn').disabled = false;
  document.getElementById('bulkStopBtn').style.display = 'none';
  if (_bulkRows.length) {
    document.getElementById('bulkSaveBtn').style.display = 'inline-block';
    bulkLog(`${_bulkRows.length} rows ready. Click Save CSV.`, 'ok');
  }
});

document.getElementById('bulkStopBtn').addEventListener('click', () => {
  abortExport();
  bulkLog('Stop requested…', 'err');
});

document.getElementById('bulkSaveBtn').addEventListener('click', () => {
  if (!_bulkRows.length) return;
  const csv  = toCSV(_bulkRows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `viewpoint-export-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

