// =====================================================
// DataGuard Academy — Module Registry & HTML Helpers
// =====================================================
window.MODULES = {};

// HTML escape for code block content
window._esc = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// Code block helper
window._cb = (lang, code) =>
  `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn">Copy</button></div><pre><code>${window._esc(code)}</code></pre></div>`;

// Callout helper
window._callout = (type, title, body) =>
  `<div class="callout callout-${type}"><div class="callout-title">${title}</div>${body}</div>`;

// Section navigation helper
window._nav = (prev, current, next) =>
  `<div class="section-nav">
    ${prev ? `<button class="btn btn-secondary" data-goto="${prev}">&#8592; Previous</button>` : '<span></span>'}
    <div style="display:flex;gap:10px;align-items:center;">
      <button class="btn btn-secondary btn-sm" data-complete="${current}">Mark Complete &#10003;</button>
      ${next ? `<button class="btn btn-primary" data-goto="${next}">Next Module &#8594;</button>` : '<span style="color:var(--accent);font-weight:700;">&#127881; Course Complete!</span>'}
    </div>
  </div>`;

// Quiz builder — accepts array of {q, options[], correct (index), explanation}
window._quiz = (questions) => questions.map((q, qi) =>
  `<div class="quiz-card" id="qq${qi}">
    <div class="quiz-q">Q${qi + 1}: ${q.q}</div>
    <div class="quiz-options">
      ${q.options.map((o, oi) => `<button class="quiz-option" data-correct="${oi === q.correct}">${o}</button>`).join('')}
    </div>
    <div class="quiz-feedback correct-fb">&#10003; Correct! ${q.explanation}</div>
    <div class="quiz-feedback wrong-fb">&#10007; Not quite. ${q.explanation}</div>
  </div>`
).join('');

// =====================================================
// MODULAR RENDERING SYSTEM
// Every module is built from _renderModule(cfg).
// Content is defined as arrays of section objects.
// =====================================================

// Table helper
window._table = (headers, rows) =>
  `<table class="data-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// Cards helper
window._cards = (items) =>
  `<div class="card-grid">${items.map(i=>`<div class="card">${i.icon?`<div class="card-icon">${i.icon}</div>`:''}<div class="card-title">${i.title}</div><div class="card-body">${i.body}</div></div>`).join('')}</div>`;

// Accordion helper — uses native <details>/<summary> for zero-JS expand/collapse
window._accordion = (items) =>
  items.map(i=>`<details class="accordion-item"><summary class="accordion-summary"><span class="acc-title">${i.title}</span><span class="acc-icon">&#9660;</span></summary><div class="accordion-body">${_sections(i.sections)}</div></details>`).join('');

// Universal section renderer — the engine that converts content objects to HTML
window._sections = (sections) => (sections||[]).map(s => {
  switch(s.type) {
    case 'h2':       return `<h2>${s.text}</h2>`;
    case 'h3':       return `<h3>${s.text}</h3>`;
    case 'h4':       return `<h4>${s.text}</h4>`;
    case 'p':        return `<p>${s.text}</p>`;
    case 'ul':       return `<ul>${(s.items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    case 'ol':       return `<ol>${(s.items||[]).map(i=>`<li>${i}</li>`).join('')}</ol>`;
    case 'callout':  return _callout(s.variant||'info', s.title, s.body);
    case 'code':     return `${s.title?`<h3>${s.title}</h3>`:''}${s.caption?`<p>${s.caption}</p>`:''}${_cb(s.lang,s.code)}`;
    case 'table':    return _table(s.headers, s.rows);
    case 'cards':    return _cards(s.items);
    case 'accordion':return _accordion(s.items);
    case 'quiz':     return _quiz(s.questions);
    case 'two-col':  return `<div class="two-col"><div>${_sections(s.left)}</div><div>${_sections(s.right)}</div></div>`;
    case 'html':     return s.content;
    default:         return '';
  }
}).join('');

// Module renderer — builds the full tabbed page from a config object.
// To add a new module: call _renderModule({id, badge, title, subtitle, meta, prev, next, tabs})
// Each tab has: {id, label, sections[]}
window._renderModule = (cfg) => {
  const tabs = cfg.tabs || [];
  const grp = cfg.id + '_t';
  return `
<div class="page-hero">
  <div class="module-badge">${cfg.badge}</div>
  <h1>${cfg.title}</h1>
  <p>${cfg.subtitle}</p>
  <div class="hero-meta">${(cfg.meta||[]).map(m=>`<div class="hero-meta-item">${m}</div>`).join('')}</div>
</div>
${tabs.length ? `<div class="tabs module-tabs">
  <div class="tab-headers">
    ${tabs.map((t,i)=>`<button class="tab-btn${i===0?' active':''}" data-tab-group="${grp}" data-tab="${grp}_${t.id}">${t.label}</button>`).join('')}
  </div>
  ${tabs.map((t,i)=>`<div class="tab-panel${i===0?' active':''}" data-tab-group="${grp}" data-tab="${grp}_${t.id}">${_sections(t.sections)}</div>`).join('')}
</div>` : ''}
${_nav(cfg.prev, cfg.id, cfg.next)}`;
};
