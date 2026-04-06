'use strict';

let allRequests = [];
let selectedIdx = null;
let filterText  = 'viewpoint.ca/api';

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

// ── Poll for new requests every 800ms ─────────────────────────────────────────

function poll() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    chrome.runtime.sendMessage(
      { type: 'GET_REQUESTS', tabId: tabs[0].id },
      resp => {
        if (chrome.runtime.lastError) return;
        if (!resp) return;
        allRequests = resp.requests || [];
        render();
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
