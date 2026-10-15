(async function () {
  'use strict';
  const C = window.MidtermCore;
  const $ = id => document.getElementById(id);
  const KEY = 'csci2122-midterm-v1';
  const labels = { correct: 'Correct', incorrect: 'Review this', unanswered: 'Incomplete', pending: 'Self-check needed', needs: 'Needs review', partial: 'Partly understood', confident: 'Self-checked', untested: 'Not in this test' };
  let bank, session, saved;
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const clear = node => node.replaceChildren();
  const hex = value => '0x' + value.toString(16).toUpperCase();
  const qById = id => bank.questions.find(q => q.id === id);
  const gById = id => bank.groups.find(g => g.id === id);
  function show(id) {
    for (const section of ['setup', 'paper', 'results']) $(section).classList.toggle('hidden', section !== id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(session)); $('save-status').textContent = 'Saved on this browser.'; saved = C.restore(bank, JSON.stringify(session)); }
    catch (_) { $('save-status').textContent = 'Browser storage is unavailable. Keep this tab open to retain your answers.'; }
  }
  function paragraphs(node, texts) { for (const text of texts) node.append(el('p', text)); }
  function code(node, value) { const pre = el('pre', undefined, 'question-code'); pre.append(el('code', value)); node.append(pre); }
  function memory(node, q) {
    const m = q.initialMemory;
    const wrap = el('div', undefined, 'study-table-wrap');
    const table = el('table', undefined, 'study-table');
    table.append(el('caption', 'Initial memory · after line 3'));
    const head = el('thead'); const hr = el('tr');
    for (const title of ['Element', 'Address', 'Value']) { const th = el('th', title); th.scope = 'col'; hr.append(th); }
    head.append(hr); table.append(head);
    const body = el('tbody');
    m.values.forEach((v, i) => { const tr = el('tr'); for (const value of ['A[' + i + ']', hex(m.baseAddress + i * m.elementBytes), String(v)]) tr.append(el('td', value)); body.append(tr); });
    table.append(body); wrap.append(table); node.append(wrap);
    node.append(el('p', m.pointerName + ' is stored at ' + hex(m.pointerStorageAddress) + '. Its initial value is ' + hex(m.baseAddress + m.pointerIndex * m.elementBytes) + ', the address of A[' + m.pointerIndex + '].', 'memory-pointer'));
  }
  function material(node, q) {
    if (q.note) { const note = el('div', undefined, 'question-note'); note.append(el('strong', q.origin === 'original' ? 'Clarification for this original' : 'Assumptions')); note.append(el('p', q.note)); node.append(note); }
    if (q.code) code(node, q.code);
    if (q.statements) { const list = el('ul', undefined, 'statement-list'); q.statements.forEach(s => list.append(el('li', s))); node.append(list); }
    if (q.initialMemory) memory(node, q);
  }
  function sourceText(q) {
    return (q.origin === 'original' ? 'Original PDF question ' : 'New variant of PDF question ') + q.sourceQuestion + ' · page ' + q.sourcePage + ' · ' + q.id;
  }
  function renderNav() {
    const stats = C.summary(bank, session);
    $('paper-progress').textContent = stats.answered + ' of ' + stats.total + ' questions answered';
    $('submit-note').textContent = stats.answered === stats.total ? 'All questions have a response. Submit when you are ready to review.' : (stats.total - stats.answered) + ' incomplete. You can submit now or return to them first.';
    clear($('question-nav'));
    session.selected.forEach((s, i) => {
      const q = qById(s.id); const done = C.answered(q, session.answers[s.id]);
      const button = el('button', String(i + 1), done ? 'answered' : ''); button.type = 'button';
      button.setAttribute('aria-label', 'Question ' + (i + 1) + ': ' + gById(q.group).title + (done ? ', answered' : ', incomplete'));
      if (session.position === i) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => { session.position = i; save(); renderQuestion(true); });
      $('question-nav').append(button);
    });
  }
  function renderQuestion(focus = false) {
    const item = session.selected[session.position]; const q = qById(item.id);
    $('question-meta').textContent = 'Question ' + (session.position + 1) + ' of ' + session.selected.length + ' · ' + (q.type === 'mcq' ? 'Multiple choice' : q.type === 'trace' ? 'Memory trace · two parts' : 'C implementation');
    $('question-title').textContent = q.question;
    clear($('question-material')); material($('question-material'), q);
    $('question-material').append(el('p', sourceText(q), 'small muted'));
    const response = $('response'); clear(response);
    if (q.type === 'mcq') {
      const field = el('fieldset', undefined, 'mcq-options'); field.append(el('legend', 'Choose one answer'));
      item.order.forEach((originalIndex, displayIndex) => {
        const label = el('label', undefined, 'mcq-option'); const input = el('input');
        input.type = 'radio'; input.name = 'answer'; input.value = String(originalIndex); input.checked = session.answers[q.id] === originalIndex;
        input.addEventListener('change', () => { session.answers[q.id] = originalIndex; save(); renderNav(); });
        label.append(input, el('b', String.fromCharCode(65 + displayIndex)), el('span', q.options[originalIndex])); field.append(label);
      });
      response.append(field);
    } else {
      const parts = q.type === 'trace' ? q.parts.map(p => p.label) : ['Your C implementation'];
      parts.forEach((name, i) => {
        const label = el('label', name, 'written-label'); label.htmlFor = 'written-' + i;
        const input = el('textarea', undefined, 'written-response' + (q.type === 'code' ? ' code-response' : ''));
        input.id = 'written-' + i; input.spellcheck = false; input.setAttribute('autocapitalize', 'off');
        input.placeholder = q.type === 'trace' ? 'A = { … }; pointer holds 0x… and points to A[…]' : 'Write the function here. Model solutions appear after submission.';
        input.value = q.type === 'trace' ? (session.answers[q.id] || [])[i] || '' : session.answers[q.id] || '';
        input.addEventListener('input', () => {
          if (q.type === 'trace') { if (!Array.isArray(session.answers[q.id])) session.answers[q.id] = q.parts.map(() => ''); session.answers[q.id][i] = input.value; }
          else session.answers[q.id] = input.value;
          save(); renderNav();
        });
        response.append(label, input);
      });
      response.append(el('p', 'Your response is saved as text. After submission, use the model solution and criteria to assess it.', 'small muted'));
    }
    $('previous').disabled = session.position === 0;
    $('next').disabled = session.position === session.selected.length - 1;
    renderNav(); if (focus) $('question-title').focus();
  }
  function start(groups) {
    session = C.generate(bank, { source: $('source').value, groups: groups || ($('scope').value === 'focus' ? [$('focus-group').value] : undefined), previous: saved ? saved.selected.map(q => q.id) : [], shuffleChoices: $('shuffle').checked });
    $('paper-label').textContent = session.source === 'originals' ? 'Original sample questions' : 'Generated practice test';
    save(); show('paper'); renderQuestion(true);
  }
  function setup() {
    $('resume-area').classList.toggle('hidden', !saved);
    if (saved) { $('resume-copy').textContent = saved.submitted ? 'Your last submitted test and review are saved on this browser.' : 'You have a saved test in progress.'; $('resume').textContent = saved.submitted ? 'Open saved review' : 'Resume saved test'; }
    show('setup');
  }
  function badge(state) { return el('span', labels[state], 'review-status ' + state); }
  function renderSummary() {
    const stats = C.summary(bank, session); clear($('score-summary'));
    const grid = el('div', undefined, 'score-grid');
    if (stats.mcqTotal) { const block = el('div'); block.append(el('strong', stats.correct + ' / ' + stats.mcqTotal), el('span', 'multiple-choice answers correct')); grid.append(block); }
    if (stats.writtenTotal) { const block = el('div'); block.append(el('strong', stats.writtenReviewed + ' / ' + stats.writtenTotal), el('span', 'written responses self-reviewed')); grid.append(block); }
    $('score-summary').append(grid);
    $('review-weak').disabled = !stats.rows.some(r => !['correct', 'confident'].includes(r.status));
    const priority = { incorrect: 0, needs: 0, unanswered: 1, partial: 2, pending: 3, correct: 4, confident: 4, untested: 5 };
    const rows = bank.groups.map(group => ({ group, state: (stats.rows.find(r => r.group === group.id) || {}).status || 'untested' })).sort((a,b) => priority[a.state] - priority[b.state] || a.group.sourceQuestion - b.group.sourceQuestion);
    clear($('review-guide'));
    for (const { group, state } of rows) {
      const details = el('details', undefined, 'guide-item'); details.open = priority[state] < 4;
      const title = el('summary'); title.append(badge(state), document.createTextNode(group.sourceQuestion + '. ' + group.title)); details.append(title);
      const content = el('div'); content.append(el('p', group.competency));
      const ul = el('ul'); group.review.forEach(r => ul.append(el('li', r))); content.append(ul);
      const practice = el('button', 'Practice this question type →', 'secondary-button'); practice.type = 'button';
      practice.addEventListener('click', () => { $('source').value = 'variants'; start([group.id]); }); content.append(practice); details.append(content); $('review-guide').append(details);
    }
  }
  function renderResults() {
    show('results'); clear($('answer-review'));
    session.selected.forEach((item, i) => {
      const q = qById(item.id); const details = el('details', undefined, 'review-item');
      const title = el('summary'); const stateBadge = badge(C.status(q, session));
      title.append(stateBadge, document.createTextNode((i + 1) + '. ' + gById(q.group).title)); details.append(title);
      const content = el('div'); content.append(el('p', q.question, 'review-question')); material(content, q);
      if (q.type === 'mcq') {
        item.order.forEach((originalIndex, displayIndex) => {
          const selected = session.answers[q.id] === originalIndex; const right = q.correct === originalIndex;
          const row = el('div', String.fromCharCode(65 + displayIndex) + '. ' + q.options[originalIndex] + (right ? ' — Correct answer' : '') + (selected ? ' — Your answer' : ''), 'review-option' + (right ? ' correct' : selected ? ' wrong' : ''));
          content.append(row);
        });
        if (!C.answered(q, session.answers[q.id])) content.append(el('p', 'You left this question unanswered.', 'muted'));
        content.append(el('p', q.explanation));
      } else {
        content.append(el('h3', 'Your response'));
        if (q.type === 'trace') q.parts.forEach((part, j) => { content.append(el('strong', part.label)); code(content, (session.answers[q.id] || [])[j] || '(No response)'); });
        else code(content, session.answers[q.id] || '(No response)');
        const model = el('div', undefined, 'model-box'); model.append(el('h3', 'Model solution'));
        if (q.type === 'trace') q.parts.forEach(p => { model.append(el('strong', p.label), el('p', p.answer)); });
        else code(model, q.modelAnswer);
        model.append(el('p', q.explanation)); content.append(model);
        content.append(el('h3', 'Check your work'));
        const ul = el('ul', undefined, 'rubric-list');
        q.rubric.forEach((text, j) => {
          const li = el('li'); const label = el('label'); const check = el('input'); check.type = 'checkbox';
          check.checked = !!(session.checks && session.checks[q.id] && session.checks[q.id][j]);
          check.addEventListener('change', () => { session.checks = session.checks || {}; session.checks[q.id] = session.checks[q.id] || {}; session.checks[q.id][j] = check.checked; save(); });
          label.append(check, document.createTextNode(text)); li.append(label); ul.append(li);
        }); content.append(ul);
        const label = el('label', 'Your self-assessment', 'rating-label'); const select = el('select');
        for (const [value, text] of [['', 'Choose after comparing your response'], ['needs', 'Needs review'], ['partial', 'Partly understood'], ['confident', 'Meets the contract and boundary cases']]) { const option = el('option', text); option.value = value; select.append(option); }
        select.value = session.ratings[q.id] || ''; select.disabled = !C.answered(q, session.answers[q.id]);
        if (select.disabled) content.append(el('p', 'This response was incomplete, so it stays on your review list. Try a new variant after studying the solution.', 'small muted'));
        select.addEventListener('change', () => { session.ratings[q.id] = select.value; save(); const state = C.status(q, session); stateBadge.textContent = labels[state]; stateBadge.className = 'review-status ' + state; renderSummary(); });
        label.append(select); content.append(label);
      }
      content.append(el('p', sourceText(q), 'source-note')); details.append(content); $('answer-review').append(details);
    });
    renderSummary(); $('results-title').focus();
  }
  try {
    const response = await fetch('data/2122-midterm.json?v=1'); if (!response.ok) throw new Error('HTTP ' + response.status);
    bank = await response.json();
    if (bank.schemaVersion !== 1 || bank.groups.length !== 21 || bank.questions.length !== 231) throw new Error('Unexpected question-bank format');
    for (const group of bank.groups) {
      const option = el('option', group.sourceQuestion + '. ' + group.title); option.value = group.id; $('focus-group').append(option);
      const row = el('div', undefined, 'blueprint-item'); row.append(el('strong', group.sourceQuestion + '. ' + group.title), el('p', group.competency + ' · ' + (group.responseType === 'mcq' ? 'Choose one of four options.' : group.responseType === 'trace' ? 'Write two memory states.' : 'Write a C function.'))); $('blueprint').append(row);
    }
    paragraphs($('source-notes'), [bank.source.title + ' · ' + bank.source.filename, bank.source.note, 'All 21 originals are available alongside ten variants per question. Original formatting is normalized for the web; material typos and missing machine assumptions are explained on the affected questions.']);
    paragraphs($('source-notes'), bank.assumptions); paragraphs($('paper-assumptions'), bank.assumptions);
    try { saved = C.restore(bank, localStorage.getItem(KEY)); } catch (_) { saved = null; }
    $('load-status').classList.add('hidden'); setup();
    $('scope').addEventListener('change', () => $('focus-setting').classList.toggle('hidden', $('scope').value !== 'focus'));
    $('start').addEventListener('click', () => start());
    $('resume').addEventListener('click', () => { session = C.restore(bank, JSON.stringify(saved)); if (!session) return; $('paper-label').textContent = session.source === 'originals' ? 'Original sample questions' : 'Generated practice test'; if (session.submitted) renderResults(); else { show('paper'); renderQuestion(true); } });
    $('save-exit').addEventListener('click', () => { save(); setup(); });
    $('previous').addEventListener('click', () => { if (session.position > 0) { --session.position; save(); renderQuestion(true); } });
    $('next').addEventListener('click', () => { if (session.position < session.selected.length - 1) { ++session.position; save(); renderQuestion(true); } });
    $('submit').addEventListener('click', () => { session.submitted = true; save(); renderResults(); });
    $('new-test').addEventListener('click', setup);
    $('review-weak').addEventListener('click', () => { const groups = C.summary(bank, session).rows.filter(r => !['correct', 'confident'].includes(r.status)).map(r => r.group); if (groups.length) { $('source').value = 'variants'; start(groups); } });
  } catch (error) {
    $('load-status').textContent = 'The midterm bank could not be loaded. Please refresh this page. ' + error.message;
    $('load-status').setAttribute('role', 'alert');
  }
})();
