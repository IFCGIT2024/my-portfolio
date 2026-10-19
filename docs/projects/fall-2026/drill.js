(() => {
  'use strict';
  const C = window.DrillCore, $ = id => document.getElementById(id);
  const KEY = 'csci2122-rapid-drill-v1';
  let db = { version: 1, totals: {}, misses: {}, session: null, auto: false };
  let group = 'bits', session = null, current = null, renderedChoices = [], timer = null, view = 'setup', storageOK = true;
  const element = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };
  const cancelTimer = () => { if (timer !== null) clearTimeout(timer); timer = null; };
  function save() {
    db.session = session;
    try { localStorage.setItem(KEY, JSON.stringify(db)); $('save-status').textContent = 'Progress saved on this browser.'; }
    catch (_) { storageOK = false; $('save-status').textContent = 'Browser storage is unavailable. You can practise, but progress will not survive a reload.'; }
  }
  function validKey(key) {
    const cut = key.lastIndexOf(':'), id = key.slice(0, cut), index = Number(key.slice(cut + 1));
    return C.byId[id] && Number.isInteger(index) && index >= 0 && index < C.byId[id].size;
  }
  const fromKey = key => { const cut = key.lastIndexOf(':'); return C.question(key.slice(0, cut), Number(key.slice(cut + 1))); };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.version === 1 && saved.totals && saved.misses) {
      db = saved;
      db.misses = Object.fromEntries(Object.entries(db.misses).filter(([key]) => validKey(key)));
      const s = db.session;
      if (s && Array.isArray(s.ids) && s.ids.length && s.ids.every(id => C.byId[id]) && s.decks && s.stats && Number.isInteger(s.done) && (!s.current || validKey(s.current))) session = s;
    }
  } catch (_) { $('save-status').textContent = 'Saved progress could not be read. A fresh drill is ready.'; }
  function show(name) {
    cancelTimer(); view = name;
    ['setup', 'practice', 'summary'].forEach(id => $(id).classList.toggle('hidden', name !== id));
  }
  function selectedTopics() { return group === 'all' ? C.topics : C.topics.filter(t => t.group === group); }
  function updateCoverage() {
    const id = $('skill').value, t = C.byId[id];
    $('length').options[$('length').options.length - 1].disabled = !t;
    if (!t && $('length').value === 'pass') $('length').value = '0';
    $('coverage-note').textContent = t ? `${t.size.toLocaleString()} distinct questions in this type. Each value or operand combination appears once per pass, then a new pass begins.` : 'Mixed practice rotates evenly through the selected types. Each type keeps its own complete pass; a single value will not repeat in that type until its pass is finished.';
  }
  function selectGroup(id, focus) {
    group = id;
    for (const button of $('group-list').children) button.setAttribute('aria-pressed', String(button.dataset.group === id));
    $('skill').replaceChildren();
    const mixed = element('option', id === 'all' ? 'Mix all question types' : 'Mix this stage'); mixed.value = 'mixed'; $('skill').append(mixed);
    for (const t of selectedTopics()) { const o = element('option', t.name); o.value = t.id; $('skill').append(o); }
    $('skill').value = focus || 'mixed'; updateCoverage();
  }
  for (const [i, g] of [...C.groups, { id: 'all', name: 'All foundations', detail: 'Mix every stage.' }].entries()) {
    const b = element('button', '', 'group-button'); b.type = 'button'; b.dataset.group = g.id;
    b.append(element('span', g.id === 'all' ? '∞' : String(i + 1).padStart(2, '0'), 'stage-number'), element('strong', g.name), element('span', g.detail));
    b.addEventListener('click', () => selectGroup(g.id)); $('group-list').append(b);
  }
  function rows(target, stats) {
    target.replaceChildren();
    for (const t of C.topics) {
      const s = stats[t.id]; if (!s || !s.attempts) continue;
      const row = element('div', '', 'stat-row'); row.append(element('span', t.name), element('strong', `${s.correct}/${s.attempts} · ${Math.round(s.correct / s.attempts * 100)}%`)); target.append(row);
    }
    if (!target.children.length) target.append(element('p', 'Your first rep starts the record.', 'muted'));
  }
  function setup() {
    show('setup');
    const count = Object.keys(db.misses).length;
    $('review-missed').textContent = `Review missed (${count})`; $('review-missed').disabled = !count;
    $('resume-area').classList.toggle('hidden', !session || session.finished);
    if (session && !session.finished) $('resume-copy').textContent = `${session.done} answered · ${session.label} · continue where you stopped.`;
    rows($('topic-stats'), db.totals);
  }
  function start(review = false) {
    cancelTimer();
    const focus = $('skill').value, ids = C.byId[focus] ? [focus] : selectedTopics().map(t => t.id);
    const queue = review ? Object.keys(db.misses) : [];
    if (review && !queue.length) return;
    session = {
      ids, decks: {}, bag: [], done: 0, correct: 0, streak: 0, best: 0, stats: {}, current: null, result: null,
      order: $('order').value, answerMode: $('answer-mode').value,
      limit: review ? queue.length : $('length').value === 'pass' ? C.byId[focus].size : Number($('length').value),
      label: review ? 'Missed-question review' : C.byId[focus]?.name || (group === 'all' ? 'All foundations' : C.groups.find(g => g.id === group).name),
      review, queue, finished: false
    };
    show('practice'); nextQuestion();
  }
  function nextQuestion() {
    cancelTimer();
    if (session.limit && session.done >= session.limit) return finish();
    if (session.review) {
      if (!session.queue.length) return finish();
      current = fromKey(session.queue.shift());
    } else {
      if (!session.bag.length) session.bag = session.order === 'ordered' ? [...session.ids] : C.shuffle(session.ids);
      current = C.draw(session.decks, session.bag.shift(), session.order);
    }
    session.current = current.id; session.result = null; session.choiceOrder = C.choices(current); session.input = '';
    save(); render();
  }
  function renderStats() {
    $('session-label').textContent = session.label;
    $('session-progress').textContent = `${session.done} answered${session.limit ? ` / ${session.limit}` : ' · endless practice'}`;
    $('correct-count').textContent = session.correct;
    $('accuracy').textContent = session.done ? `${Math.round(session.correct / session.done * 100)}%` : '—';
    $('streak').textContent = session.streak;
  }
  function render() {
    current = fromKey(session.current); renderStats();
    const q = current, t = C.byId[q.topic], useChoices = session.answerMode === 'choice' || q.format === 'text';
    $('question-topic').textContent = t.name;
    $('question-number').textContent = `Question ${session.done + (session.result ? 0 : 1)}`;
    $('assumption').textContent = q.assumption || 'One step · C fundamentals';
    $('prompt').textContent = q.prompt;
    $('typed-answer').classList.toggle('hidden', useChoices); $('choices').classList.toggle('hidden', !useChoices);
    $('check').classList.toggle('hidden', useChoices);
    $('answer').value = session.input || ''; $('answer').disabled = Boolean(session.result);
    $('check').disabled = Boolean(session.result); $('reveal').disabled = Boolean(session.result);
    $('input-error').textContent = ''; $('feedback').classList.add('hidden');
    $('next').classList.toggle('hidden', !session.result);
    $('answer-label').textContent = { bin: 'Answer in binary', hex: 'Answer in hex', dec: 'Answer in decimal', char: 'Answer with the character (case-sensitive)' }[q.format] || 'Your answer';
    $('input-help').textContent = { bin: 'Use 0s and 1s. Spaces, leading zeros and an optional 0b prefix are accepted.', hex: 'Hex digits 0–9 and A–F. Upper/lowercase, leading zeros and an optional 0x prefix are accepted.', dec: 'Use a decimal integer, including a minus sign if needed.', char: 'Type the character alone or in single quotes. Uppercase and lowercase are different.' }[q.format] || '';
    $('choices').replaceChildren(); renderedChoices = useChoices ? session.choiceOrder : [];
    for (const [i, answer] of renderedChoices.entries()) {
      const b = element('button', '', 'answer-button'); b.type = 'button'; b.disabled = Boolean(session.result);
      b.append(element('span', String(i + 1), 'option-letter'), element('span', answer));
      b.addEventListener('click', () => submit(answer)); $('choices').append(b);
    }
    const d = session.decks[q.topic];
    $('deck-progress').textContent = session.review ? `${session.queue.length} left after this question in this review.` : `Pass ${d.cycle} · ${d.pos.toLocaleString()} of ${t.size.toLocaleString()} distinct questions in this type.`;
    $('auto-next').checked = db.auto;
    if (session.result) feedback();
    else if (useChoices) $('prompt').focus();
    else $('answer').focus();
  }
  function submit(raw, reveal = false) {
    if (session.result) return;
    if (!reveal && (String(raw).trim() === '' || C.parse(current, raw) === null)) {
      $('input-error').textContent = 'Enter a valid answer in the requested format.'; $('answer').focus(); return;
    }
    const right = !reveal && C.correct(current, raw);
    session.input = reveal ? '' : raw;
    session.result = { right, reveal, raw: reveal ? '' : raw };
    session.done++; session.correct += Number(right); session.streak = right ? session.streak + 1 : 0; session.best = Math.max(session.best, session.streak);
    for (const stats of [session.stats, db.totals]) {
      const s = stats[current.topic] ||= { attempts: 0, correct: 0 }; s.attempts++; s.correct += Number(right);
    }
    if (right) delete db.misses[current.id]; else db.misses[current.id] = true;
    save(); render();
    if (right && db.auto) timer = setTimeout(() => { timer = null; if (view === 'practice') nextQuestion(); }, 1000);
  }
  function feedback() {
    const r = session.result;
    $('feedback').className = `feedback ${r.right ? 'correct' : 'wrong'}`;
    $('feedback-title').textContent = r.right ? 'Correct.' : r.reveal ? 'Answer revealed · saved for review.' : 'Not yet · saved for review.';
    $('answer-correct').textContent = `${current.format === 'hex' ? '0x' : ''}${current.answer}${current.format === 'bin' ? ' (binary)' : current.format === 'dec' ? ' (decimal)' : ''}`;
    $('explanation').textContent = `${!r.right && !r.reveal ? `You answered: ${r.raw}\n` : ''}${current.explanation}`;
    [...$('choices').children].forEach((b, i) => {
      if (C.correct(current, renderedChoices[i])) b.classList.add('correct');
      else if (renderedChoices[i] === r.raw) b.classList.add('wrong');
    });
    $('next').textContent = session.limit && session.done >= session.limit ? 'See results ↵' : 'Next question ↵';
    $('next').focus();
  }
  function finish() {
    session.finished = true; save(); show('summary');
    $('summary-copy').textContent = `${session.correct} correct out of ${session.done} answered${session.done ? ` (${Math.round(session.correct / session.done * 100)}%)` : ''}. Best streak: ${session.best}. ${Object.keys(db.misses).length} questions waiting for review.`;
    rows($('summary-stats'), session.stats);
    $('summary-review').disabled = !Object.keys(db.misses).length;
    $('summary-title').focus();
  }
  $('answer-form').addEventListener('submit', e => { e.preventDefault(); submit($('answer').value); });
  $('answer').addEventListener('input', () => { session.input = $('answer').value; save(); });
  $('reveal').addEventListener('click', () => submit('', true));
  $('next').addEventListener('click', nextQuestion);
  $('pause').addEventListener('click', () => { save(); setup(); });
  $('finish').addEventListener('click', finish);
  $('resume').addEventListener('click', () => { show('practice'); render(); });
  $('skill').addEventListener('change', updateCoverage);
  $('start').addEventListener('click', () => start());
  $('review-missed').addEventListener('click', () => start(true));
  $('summary-review').addEventListener('click', () => start(true));
  $('back').addEventListener('click', setup);
  $('again').addEventListener('click', () => {
    if (session.review) { if (Object.keys(db.misses).length) start(true); else setup(); return; }
    const previous = session;
    session = { ...previous, decks: {}, bag: [], done: 0, correct: 0, streak: 0, best: 0, stats: {}, current: null, result: null, finished: false };
    show('practice'); nextQuestion();
  });
  $('auto-next').addEventListener('change', () => { db.auto = $('auto-next').checked; cancelTimer(); save(); });
  $('start-small').addEventListener('click', () => { selectGroup('bits', 'digit-hex-dec'); $('length').value = '0'; start(); });
  $('start-upper').addEventListener('click', () => { selectGroup('bits', 'upper-bin-dec'); $('length').value = '0'; start(); });
  $('start-signed').addEventListener('click', () => { selectGroup('signed', 'signed-bin'); $('length').value = 'pass'; $('order').value = 'ordered'; start(); });
  $('start-mixed').addEventListener('click', () => { selectGroup('all'); $('length').value = '0'; start(); });
  document.addEventListener('keydown', e => {
    if (view !== 'practice' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target?.tagName;
    if (['SELECT', 'TEXTAREA'].includes(tag) || (tag === 'INPUT' && e.target !== $('answer'))) return;
    if (e.key === 'Enter' && session.result && (e.target === $('next') || e.target === $('answer') || e.target === $('prompt') || tag === 'BODY')) { e.preventDefault(); nextQuestion(); }
    else if (!session.result && renderedChoices.length && /^[1-4]$/.test(e.key) && renderedChoices[Number(e.key) - 1] !== undefined) { e.preventDefault(); submit(renderedChoices[Number(e.key) - 1]); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelTimer(); });
  for (let n = 0; n < 16; n++) $('hex-table').append(element('span', `${C.hex(n, 1)} = ${n}\n${C.bin(n, 4)}`));
  selectGroup('bits'); setup();
  if (storageOK && !$('save-status').textContent) $('save-status').textContent = 'Your progress stays on this browser. No account needed.';
})();
