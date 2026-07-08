/* Admin panel — quote inbox + light content editor */
(() => {
  'use strict';

  const state = {
    token: sessionStorage.getItem('stb_token') || '',
    tokenExp: Number(sessionStorage.getItem('stb_exp') || 0),
    view: 'quotes',       // 'quotes' | 'edit'
    quotes: [],
    activeQuote: null,
    content: null,
    dirty: false,
    status: '',
    statusKind: '',
  };

  const $ = (s, r = document) => r.querySelector(s);

  function escapeHTML(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const escapeAttr = escapeHTML;

  function setStatus(msg, kind) {
    state.status = msg || '';
    state.statusKind = kind || '';
    const el = $('#adminStatus');
    if (el) {
      el.className = 'admin-status' + (state.statusKind ? ' is-' + state.statusKind : '');
      el.textContent = state.status;
    }
  }

  async function api(path, options) {
    const opts = options || {};
    const headers = Object.assign({}, opts.headers || {});
    if (opts.method && opts.method !== 'GET' && !(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    const res = await fetch(path, Object.assign({}, opts, { headers }));
    if (res.status === 401) {
      clearSession();
      render();
      throw new Error('Session expired. Please sign in again.');
    }
    if (!res.ok) {
      let msg = 'Request failed';
      try { const j = await res.json(); msg = j.error || msg; } catch (_) {}
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function clearSession() {
    state.token = ''; state.tokenExp = 0;
    sessionStorage.removeItem('stb_token');
    sessionStorage.removeItem('stb_exp');
    state.quotes = []; state.activeQuote = null; state.content = null;
  }

  async function login(pw) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success || !j.token) {
      throw new Error(j.error || 'Sign-in failed');
    }
    state.token = j.token;
    state.tokenExp = j.expiresAt || 0;
    sessionStorage.setItem('stb_token', state.token);
    sessionStorage.setItem('stb_exp', String(state.tokenExp));
  }

  function isSignedIn() {
    return !!state.token && Date.now() < state.tokenExp;
  }

  // ---------- Data loaders ----------
  async function loadQuotes() {
    const j = await api('/api/quotes');
    state.quotes = j.quotes || [];
  }
  async function loadContent() {
    state.content = await api('/api/content');
  }

  // ---------- Render ----------
  function render() {
    const root = $('#admin');
    if (!root) return;
    if (!isSignedIn()) { root.innerHTML = renderLogin(); wireLogin(); return; }
    root.innerHTML = renderShell();
    wireShell();
    if (state.view === 'quotes') renderQuotes();
    else if (state.view === 'edit') renderEdit();
  }

  function renderLogin() {
    return `
      <div class="login-screen">
        <div class="login-card">
          <p class="eyebrow">Simply the Best</p>
          <h1>Admin</h1>
          <p style="color:var(--c-ink-soft)">Enter the admin password to view quote requests and edit site copy.</p>
          <form id="loginForm" class="form" style="margin-top:1.25rem">
            <div class="field">
              <label for="pw">Password</label>
              <input type="password" id="pw" name="password" autocomplete="current-password" required />
            </div>
            <div class="form__footer">
              <div id="loginStatus" class="form__status"></div>
              <button type="submit" class="btn">Sign in</button>
            </div>
          </form>
        </div>
      </div>`;
  }

  function wireLogin() {
    const form = $('#loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = $('#loginStatus');
      const pw = $('#pw').value;
      status.className = 'form__status';
      status.textContent = 'Signing in…';
      try {
        await login(pw);
        state.view = 'quotes';
        render();
      } catch (err) {
        status.className = 'form__status is-error';
        status.textContent = err.message;
      }
    });
  }

  function renderShell() {
    return `
      <div class="admin-shell">
        <aside class="admin-side">
          <h1>STB Admin</h1>
          <nav>
            <button data-view="quotes" class="${state.view === 'quotes' ? 'is-active' : ''}">Quote requests</button>
            <button data-view="edit"   class="${state.view === 'edit'   ? 'is-active' : ''}">Site content</button>
            <a href="/" target="_blank" rel="noopener">View site ↗</a>
          </nav>
          <div class="admin-side__foot">
            <div>Signed in</div>
            <button class="logout btn-sm" id="logoutBtn">Sign out</button>
          </div>
        </aside>
        <main class="admin-main">
          <div class="admin-topbar">
            <h2 id="adminTitle">${state.view === 'quotes' ? 'Quote requests' : 'Site content'}</h2>
            <div id="adminStatus" class="admin-status ${state.statusKind ? 'is-' + state.statusKind : ''}">${escapeHTML(state.status || '')}</div>
          </div>
          <div id="adminBody"></div>
        </main>
      </div>`;
  }

  function wireShell() {
    document.querySelectorAll('[data-view]').forEach(b => {
      b.addEventListener('click', () => {
        state.view = b.dataset.view;
        state.activeQuote = null;
        render();
      });
    });
    const out = $('#logoutBtn');
    if (out) out.addEventListener('click', () => { clearSession(); render(); });
  }

  // ---------- Quotes view ----------
  async function renderQuotes() {
    const host = $('#adminBody');
    host.innerHTML = '<div class="admin-card">Loading…</div>';
    try {
      await loadQuotes();
    } catch (err) {
      host.innerHTML = `<div class="admin-card"><p>${escapeHTML(err.message)}</p></div>`;
      return;
    }
    const list = state.quotes;
    if (!list.length) {
      host.innerHTML = `<div class="admin-card"><p style="color:var(--c-ink-soft)">No quote requests yet. When someone submits the form, it will appear here.</p></div>`;
      return;
    }
    const counts = {
      new: list.filter(q => q.status === 'new').length,
      read: list.filter(q => q.status === 'read').length,
      archived: list.filter(q => q.status === 'archived').length,
    };
    host.innerHTML = `
      <div class="admin-card" style="display:flex;gap:1.25rem;flex-wrap:wrap;">
        <span><strong>${counts.new}</strong> new</span>
        <span><strong>${counts.read}</strong> read</span>
        <span><strong>${counts.archived}</strong> archived</span>
        <span style="margin-left:auto;color:var(--c-mute)">${list.length} total</span>
      </div>
      <div id="quoteList" class="admin-list">
        ${list.map(quoteRow).join('')}
      </div>
      <div id="quoteDetail" style="margin-top:1.5rem"></div>`;

    document.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.open;
        const q = state.quotes.find(x => x.id === id);
        if (!q) return;
        state.activeQuote = q;
        if (q.status === 'new') {
          try { await api('/api/quotes/' + id, { method: 'PATCH', body: JSON.stringify({ status: 'read' }) }); q.status = 'read'; } catch (_) {}
        }
        renderQuoteDetail(q);
        renderQuoteRowsUpdate();
      });
    });
  }

  function renderQuoteRowsUpdate() {
    const host = $('#quoteList');
    if (!host) return;
    host.innerHTML = state.quotes.map(quoteRow).join('');
    document.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.open;
        const q = state.quotes.find(x => x.id === id);
        if (!q) return;
        state.activeQuote = q;
        renderQuoteDetail(q);
      });
    });
  }

  function quoteRow(q) {
    const p = q.payload || {};
    const badgeCls = q.status === 'new' ? 'quote-row__badge--new' : q.status === 'archived' ? 'quote-row__badge--archived' : 'quote-row__badge--read';
    const rowCls = q.status === 'new' ? 'quote-row is-new' : 'quote-row';
    const when = new Date(q.receivedAt).toLocaleString();
    return `
      <div class="${rowCls}" data-open="${escapeAttr(q.id)}">
        <span class="quote-row__badge ${badgeCls}">${escapeHTML(q.status)}</span>
        <div>
          <div class="quote-row__name">${escapeHTML(p.name || '(no name)')} <span style="color:var(--c-mute);font-weight:400"> · ${escapeHTML(p.email || '')}</span></div>
          <div class="quote-row__meta">${escapeHTML(p.startDate || '?')} → ${escapeHTML(p.endDate || '?')} · ${escapeHTML(p.petCount || '')} · ${escapeHTML(when)}</div>
        </div>
        <div class="quote-row__meta" style="text-align:right">${escapeHTML(p.travelPurpose || '')}</div>
      </div>`;
  }

  function renderQuoteDetail(q) {
    const host = $('#quoteDetail');
    const p = q.payload || {};
    host.innerHTML = `
      <div class="quote-detail">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
          <div>
            <h3 style="margin:0">${escapeHTML(p.name || '(no name)')}</h3>
            <div style="color:var(--c-mute);font-size:0.9rem">Received ${escapeHTML(new Date(q.receivedAt).toLocaleString())}</div>
          </div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
            <button class="btn-sm" data-status="read">Mark read</button>
            <button class="btn-sm" data-status="archived">Archive</button>
            <a class="btn-sm btn-sm--primary" href="mailto:${escapeAttr(p.email)}?subject=${encodeURIComponent('Your quote request')}">Reply by email</a>
            <button class="btn-sm btn-sm--danger" data-delete="${escapeAttr(q.id)}">Delete</button>
          </div>
        </div>
        <div class="quote-detail__grid">
          <div class="quote-detail__label">Email</div><div class="quote-detail__value"><a href="mailto:${escapeAttr(p.email)}">${escapeHTML(p.email)}</a></div>
          <div class="quote-detail__label">Phone</div><div class="quote-detail__value">${escapeHTML(p.phone || '—')}</div>
          <div class="quote-detail__label">Preferred contact</div><div class="quote-detail__value">${escapeHTML(p.contactPreference || '—')}</div>
          <div class="quote-detail__label">Dates</div><div class="quote-detail__value">${escapeHTML(p.startDate || '?')} → ${escapeHTML(p.endDate || '?')}</div>
          <div class="quote-detail__label">Pets</div><div class="quote-detail__value">${escapeHTML(p.petCount || '—')}</div>
          <div class="quote-detail__label">About the pets</div><div class="quote-detail__value">${escapeHTML(p.petTypes || '—')}</div>
          <div class="quote-detail__label">Address</div><div class="quote-detail__value">${escapeHTML(p.address || '—')}</div>
          <div class="quote-detail__label">Travel purpose</div><div class="quote-detail__value">${escapeHTML(p.travelPurpose || '—')}</div>
          <div class="quote-detail__label">Add-ons</div><div class="quote-detail__value">${(p.addons && p.addons.length) ? p.addons.map(escapeHTML).join(', ') : '—'}</div>
          <div class="quote-detail__label">Notes</div><div class="quote-detail__value"><div class="quote-detail__notes">${escapeHTML(p.notes || '(no notes)')}</div></div>
        </div>
      </div>`;

    document.querySelectorAll('[data-status]').forEach(b => {
      b.addEventListener('click', async () => {
        const status = b.dataset.status;
        try {
          await api('/api/quotes/' + q.id, { method: 'PATCH', body: JSON.stringify({ status }) });
          q.status = status;
          renderQuoteRowsUpdate();
          setStatus('Marked ' + status, 'ok');
        } catch (err) { setStatus(err.message, 'error'); }
      });
    });
    document.querySelectorAll('[data-delete]').forEach(b => {
      b.addEventListener('click', async () => {
        if (!confirm('Permanently delete this quote request?')) return;
        try {
          await api('/api/quotes/' + q.id, { method: 'DELETE' });
          state.quotes = state.quotes.filter(x => x.id !== q.id);
          state.activeQuote = null;
          renderQuoteRowsUpdate();
          $('#quoteDetail').innerHTML = '';
          setStatus('Deleted', 'ok');
        } catch (err) { setStatus(err.message, 'error'); }
      });
    });
  }

  // ---------- Content editor ----------
  const EDITABLE = [
    { path: ['site', 'name'],                          label: 'Site name' },
    { path: ['site', 'tagline'],                       label: 'Tagline (short)' },
    { path: ['site', 'email'],                         label: 'Contact email' },
    { path: ['site', 'phone'],                         label: 'Contact phone' },
    { path: ['site', 'hours'],                         label: 'Business hours' },
    { path: ['site', 'serviceArea'],                   label: 'Service area' },
    { path: ['site', 'instagram'],                     label: 'Instagram URL' },
    { path: ['site', 'facebook'],                      label: 'Facebook URL' },
    { path: ['pages', 'home', 'hero', 'title'],        label: 'Home — hero headline' },
    { path: ['pages', 'home', 'hero', 'subtitle'],     label: 'Home — hero subtitle', multiline: true },
    { path: ['pages', 'home', 'intro', 'heading'],     label: 'Home — intro heading' },
    { path: ['pages', 'home', 'intro', 'body'],        label: 'Home — intro body', multiline: true },
    { path: ['pages', 'home', 'cta', 'heading'],       label: 'Home — bottom CTA heading' },
    { path: ['pages', 'home', 'cta', 'body'],          label: 'Home — bottom CTA body', multiline: true },
    { path: ['pages', 'about', 'hero', 'title'],       label: 'About — headline' },
    { path: ['pages', 'about', 'hero', 'subtitle'],    label: 'About — subtitle', multiline: true },
    { path: ['pages', 'pricing', 'base', 'priceLine'], label: 'Pricing — base rate line' },
    { path: ['pages', 'pricing', 'base', 'body'],      label: 'Pricing — base rate description', multiline: true },
    { path: ['pages', 'pricing', 'note'],              label: 'Pricing — footnote', multiline: true },
    { path: ['pages', 'requestQuote', 'hero', 'title'], label: 'Quote page — headline' },
    { path: ['pages', 'requestQuote', 'hero', 'subtitle'], label: 'Quote page — subtitle', multiline: true },
    { path: ['pages', 'requestQuote', 'successHeading'], label: 'Quote — success heading' },
    { path: ['pages', 'requestQuote', 'successBody'],  label: 'Quote — success body', multiline: true },
    { path: ['pages', 'contact', 'details', 'email'],  label: 'Contact page — email' },
    { path: ['pages', 'contact', 'details', 'phone'],  label: 'Contact page — phone' },
    { path: ['pages', 'contact', 'details', 'hours'],  label: 'Contact page — hours' },
  ];

  function getPath(obj, path) {
    let cur = obj;
    for (const k of path) { if (cur == null) return ''; cur = cur[k]; }
    return cur == null ? '' : cur;
  }
  function setPath(obj, path, value) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const k = path[i];
      if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
      cur = cur[k];
    }
    cur[path[path.length - 1]] = value;
  }

  async function renderEdit() {
    const host = $('#adminBody');
    host.innerHTML = '<div class="admin-card">Loading…</div>';
    try {
      await loadContent();
    } catch (err) {
      host.innerHTML = `<div class="admin-card"><p>${escapeHTML(err.message)}</p></div>`;
      return;
    }
    host.innerHTML = `
      <div class="admin-card">
        <p style="margin:0;color:var(--c-ink-soft)">Edit the most-changed pieces of copy. Deeper structural edits (services list, pricing tables, FAQ, testimonials) live in <code>data/siteContent.json</code> — safest to update the JSON directly for those and reload.</p>
      </div>
      <div class="admin-card">
        ${EDITABLE.map((f, i) => {
          const val = getPath(state.content, f.path);
          const id = 'f-' + i;
          return `
            <div class="editor-field">
              <label for="${id}">${escapeHTML(f.label)}</label>
              ${f.multiline
                ? `<textarea id="${id}" data-i="${i}">${escapeHTML(val)}</textarea>`
                : `<input id="${id}" data-i="${i}" type="text" value="${escapeAttr(val)}" />`}
            </div>`;
        }).join('')}
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.5rem">
          <button class="btn-sm" id="revertBtn">Discard</button>
          <button class="btn-sm btn-sm--primary" id="saveBtn">Save changes</button>
        </div>
      </div>`;

    host.querySelectorAll('[data-i]').forEach(el => {
      el.addEventListener('input', () => {
        const idx = Number(el.dataset.i);
        setPath(state.content, EDITABLE[idx].path, el.value);
        state.dirty = true;
        setStatus('Unsaved changes', '');
      });
    });
    $('#revertBtn').addEventListener('click', async () => {
      if (state.dirty && !confirm('Discard your unsaved edits?')) return;
      await renderEdit();
      setStatus('Reloaded', 'ok');
    });
    $('#saveBtn').addEventListener('click', async () => {
      setStatus('Saving…', '');
      try {
        await api('/api/content', { method: 'POST', body: JSON.stringify(state.content) });
        state.dirty = false;
        setStatus('Saved', 'ok');
      } catch (err) {
        setStatus(err.message, 'error');
      }
    });
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', render);
})();
