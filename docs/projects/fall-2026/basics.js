(() => {
  'use strict';
  const C = window.BasicsCore;
  const $ = id => document.getElementById(id);
  const key = 'csci2122-basics-settings-v1';
  const progressKey = 'csci2122-basics-progress-v1';
  const state = { q: null, locked: false, answered: 0, correct: 0, streak: 0,
    missed: new Map(), reviewQueue: [], reviewing: false, recent: [], settings: null };
  function option(value, label) {
    const el = document.createElement('option'); el.value = value; el.textContent = label; return el;
  }
  $('topic').append(...C.TOPICS.map(t => option(t.id, t.label)), option('mixed', 'Mix all basics'));
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch (_) { /* Storage is optional. */ }
  let progress = null;
  try { progress = JSON.parse(localStorage.getItem(progressKey)); } catch (_) { /* Storage is optional. */ }
  const generator = C.createGenerator(progress?.decks);
  if (Array.isArray(progress?.missed)) for (const q of progress.missed) {
    try {
      if (q && typeof q.id === 'string' && [4, 8, 16].includes(q.width) && C.TOPICS.some(t => t.id === q.topic) && ['prompt', 'display', 'context', 'explanation', 'hint', 'answer'].every(k => typeof q[k] === 'string') && C.grade(q, q.answer).correct) state.missed.set(q.id, q);
    } catch (_) { /* Ignore unusable saved questions. */ }
  }
  $('topic').value = C.TOPICS.some(t => t.id === saved?.topic) || saved?.topic === 'mixed' ? saved.topic : 'conversions';
  $('width').value = [4, 8, 16].includes(Number(saved?.width)) ? String(saved.width) : '8';
  $('length').value = [0, 10, 25, 100, 256].includes(Number(saved?.length)) ? String(saved.length) : '0';
  for (const [id, name] of [['input-base', 'inputBase'], ['output-base', 'outputBase']]) $(id).value = ['binary', 'hex', 'decimal', 'mixed'].includes(saved?.[name]) ? saved[name] : 'binary';
  function skills(preferred = 'mixed') {
    const topic = C.TOPICS.find(t => t.id === $('topic').value);
    $('skill').replaceChildren(option('mixed', topic ? 'Mix this topic' : 'All question types'));
    if (topic) $('skill').append(...topic.skills.map(([id, label]) => option(id, label)));
    $('skill').value = topic?.skills.some(([id]) => id === preferred) ? preferred : 'mixed';
    $('skill').disabled = !topic;
    $('width').disabled = ['logical', 'chars', 'pointers'].includes($('topic').value);
  }
  skills(saved?.skill || 'bin-dec');
  function saveSettings() {
    state.settings = {topic: $('topic').value, skill: $('skill').value, width: Number($('width').value), length: Number($('length').value), inputBase: $('input-base').value, outputBase: $('output-base').value};
    try { localStorage.setItem(key, JSON.stringify(state.settings)); $('storage-note').textContent = 'Settings saved in this browser.'; }
    catch (_) { $('storage-note').textContent = 'Settings could not be saved; practice still works.'; }
  }
  function saveProgress() {
    try { localStorage.setItem(progressKey, JSON.stringify({decks: generator.snapshot(), missed: [...state.missed.values()]})); $('storage-note').textContent = 'Settings, value passes & missed questions saved here.'; }
    catch (_) { $('storage-note').textContent = 'Progress could not be saved; practice still works.'; }
  }
  function stats() {
    $('score').textContent = `${state.correct} / ${state.answered}`;
    $('accuracy').textContent = state.answered ? `${Math.round(100 * state.correct / state.answered)}%` : '—';
    $('streak').textContent = String(state.streak);
    $('review').textContent = state.reviewing ? 'Return to fresh questions' : `Review missed (${state.missed.size})`;
    $('review').disabled = !state.reviewing && state.missed.size === 0;
    $('summary-review').disabled = state.missed.size === 0;
  }
  function freshQuestion() {
    const q = generator.next(state.settings);
    saveProgress();
    return q;
  }
  function render(q) {
    state.q = q; state.locked = false;
    $('summary').hidden = true; $('drill').hidden = false;
    $('question-count').textContent = state.reviewing ? `Missed review · ${state.missed.size} remaining` : `Question ${state.answered + 1}${state.settings.length ? ` of ${state.settings.length}` : ' · endless practice'}`;
    $('topic-label').textContent = q.topicLabel;
    $('coverage').hidden = state.reviewing || !q.coverage;
    $('coverage').textContent = q.coverage ? `Value pass ${q.coverage.pass} · ${q.coverage.shown} / ${q.coverage.total} shown · every value once per pass` : '';
    $('prompt').textContent = q.prompt; $('assumption').textContent = q.context;
    $('value').textContent = q.display; $('value').hidden = !q.display;
    $('feedback').hidden = true; $('feedback').replaceChildren();
    $('hint').hidden = true; $('hint').textContent = q.hint;
    $('support-actions').hidden = false; $('next').hidden = true;
    $('input-error').textContent = ''; $('answer').removeAttribute('aria-invalid');
    $('answer').value = ''; $('answer').disabled = false; $('check').disabled = false;
    $('answer-form').hidden = q.format === 'choice'; $('choices').hidden = q.format !== 'choice';
    $('choices').replaceChildren();
    if (q.format === 'choice') {
      q.choices.forEach((answer, i) => {
        const button = document.createElement('button'); button.type = 'button';
        button.className = 'drill-choice'; button.textContent = `${i + 1}. ${answer}`;
        button.addEventListener('click', () => submit(answer)); $('choices').append(button);
      });
      $('keyboard-note').textContent = 'Choose an answer, or press 1–4'; $('prompt').focus();
    } else {
      $('answer-label').textContent = `Your answer in ${q.format === 'hex' ? 'hexadecimal' : q.format}`;
      $('answer').placeholder = q.format === 'binary' ? 'e.g. 0000 0101' : q.format === 'hex' ? 'e.g. 0x05' : 'Type a number';
      // Text keyboard preserves access to a minus sign, hex letters, and optional prefixes.
      $('answer').setAttribute('inputmode', 'text');
      $('format-help').textContent = q.format === 'binary' ? `Up to ${q.width} bits of value; spaces, 0b and leading zeros are accepted.` : q.format === 'hex' ? '0x is optional; upper/lowercase, spaces and leading zeros are accepted.' : 'Enter a whole decimal number; include a minus sign for negative values.';
      $('keyboard-note').textContent = 'Enter to check'; $('answer').focus();
    }
    stats();
  }
  function formattedAnswer(q) {
    return q.format === 'binary' ? q.answer.match(/.{1,4}/g).join(' ') : q.answer;
  }
  function submit(raw, reveal = false) {
    if (state.locked) return;
    const q = state.q;
    const result = reveal ? {valid: true, correct: false} : C.grade(q, raw);
    if (!result.valid) {
      $('input-error').textContent = q.format === 'binary' ? `Use only 0 and 1 (optional 0b); the value must fit in ${q.width} bits.` : q.format === 'hex' ? `Use hex digits 0–9 and A–F (optional 0x); the value must fit in ${q.width} bits.` : 'Enter a whole decimal number, such as 12 or −5.';
      $('answer').setAttribute('aria-invalid', 'true'); $('answer').focus(); return;
    }
    state.locked = true; state.answered++;
    if (result.correct) { state.correct++; state.streak++; state.missed.delete(q.id); }
    else { state.streak = 0; state.missed.set(q.id, q); }
    if (state.reviewing && !result.correct) state.reviewQueue.push(q.id);
    saveProgress();
    $('input-error').textContent = ''; $('answer').removeAttribute('aria-invalid');
    $('answer').disabled = true; $('check').disabled = true; $('support-actions').hidden = true;
    [...$('choices').children].forEach((button, i) => {
      button.disabled = true;
      if (q.choices[i] === q.answer) { button.classList.add('correct'); button.textContent += ' ✓ Correct'; }
      else if (q.choices[i] === raw) { button.classList.add('wrong'); button.textContent += ' — Your answer'; }
    });
    const title = document.createElement('strong');
    title.textContent = result.correct ? 'Correct.' : reveal ? `Answer: ${formattedAnswer(q)}` : `Answer: ${formattedAnswer(q)}`;
    const explanation = document.createElement('p'); explanation.textContent = q.explanation;
    $('feedback').className = `drill-feedback ${result.correct ? 'correct' : reveal ? 'revealed' : 'wrong'}`;
    $('feedback').replaceChildren(title, explanation);
    if (!result.correct) {
      const note = document.createElement('p'); note.textContent = reveal ? 'Added to missed review. A revealed answer earns no point.' : 'Added to missed review. You’ll get another chance to practise it.';
      $('feedback').append(note);
    }
    $('feedback').hidden = false; $('next').hidden = false;
    $('next').textContent = state.reviewing && state.missed.size === 0 ? 'Finish review →' : !state.reviewing && state.settings.length && state.answered >= state.settings.length ? 'See results →' : 'Next question →';
    $('keyboard-note').textContent = 'Enter for the next question'; stats(); $('next').focus();
  }
  function summary() {
    $('drill').hidden = true; $('summary').hidden = false;
    $('summary-title').textContent = state.reviewing ? 'Missed questions cleared.' : `${state.correct} of ${state.answered} correct.`;
    $('summary-copy').textContent = state.reviewing ? `You answered every question in this review correctly before finishing. ${state.correct} correct in ${state.answered} attempts.` : `${Math.round(100 * state.correct / state.answered)}% accuracy. ${state.missed.size ? `${state.missed.size} question${state.missed.size === 1 ? '' : 's'} waiting in missed review.` : 'Keep the repetition going with another fresh round.'}`;
    $('again').focus(); stats();
  }
  function next() {
    if (!state.locked) return;
    if (state.reviewing) {
      while (state.reviewQueue.length) {
        const q = state.missed.get(state.reviewQueue.shift());
        if (q) { render(q); return; }
      }
      summary(); return;
    }
    if (state.settings.length && state.answered >= state.settings.length) { summary(); return; }
    render(freshQuestion());
  }
  function start(reviewing = false) {
    state.reviewing = reviewing; state.answered = 0; state.correct = 0; state.streak = 0;
    saveSettings();
    if (reviewing) {
      state.reviewQueue = [...state.missed.keys()];
      const q = state.missed.get(state.reviewQueue.shift());
      if (q) render(q); else { state.reviewing = false; render(freshQuestion()); }
    } else render(freshQuestion());
  }
  $('answer-form').addEventListener('submit', event => { event.preventDefault(); if (state.locked) next(); else submit($('answer').value); });
  $('next').addEventListener('click', next);
  $('reveal').addEventListener('click', () => submit('', true));
  $('hint-button').addEventListener('click', () => { $('hint').hidden = !$('hint').hidden; });
  $('review').addEventListener('click', () => start(!state.reviewing));
  $('summary-review').addEventListener('click', () => start(true));
  $('fresh').addEventListener('click', () => start());
  $('again').addEventListener('click', () => start());
  $('topic').addEventListener('change', () => { skills(); start(); });
  for (const id of ['skill', 'width', 'length', 'input-base', 'output-base']) $(id).addEventListener('change', () => start());
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || $('drill').hidden) return;
    const target = event.target?.tagName;
    if (['SELECT', 'INPUT', 'TEXTAREA', 'SUMMARY', 'A'].includes(target)) return;
    if (!state.locked && state.q.format === 'choice' && /^[1-4]$/.test(event.key)) {
      event.preventDefault(); submit(state.q.choices[Number(event.key) - 1]);
    }
  });
  start();
})();
