// Exercise the actual controller with a minimal DOM; no browser rendering claimed.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../drill-core.js');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'drill.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'drill.html'), 'utf8');
class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.children = []; this.events = {}; this.attributes = {}; this.dataset = {};
    this.textContent = ''; this.value = ''; this.className = ''; this.disabled = false; this.checked = false;
    this.classList = {
      contains: c => this.className.split(/\s+/).includes(c),
      add: c => { if (!this.classList.contains(c)) this.className += ' ' + c; },
      remove: c => { this.className = this.className.split(/\s+/).filter(x => x !== c).join(' '); },
      toggle: (c, on) => { on = on ?? !this.classList.contains(c); on ? this.classList.add(c) : this.classList.remove(c); }
    };
  }
  get options() { return this.children; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(k, v) { this.attributes[k] = v; }
  addEventListener(k, fn) { (this.events[k] ||= []).push(fn); }
  fire(k, event = {}) { if (!this.disabled) for (const fn of this.events[k] || []) fn({ preventDefault() {}, target: this, ...event }); }
  focus() { this.focused = true; }
}
function load(saved = null, blocked = false) {
  const e = Object.fromEntries([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"/g)].map(m => [m[2], new Element(m[1])]));
  e.length.children = Array.from({ length: 5 }, () => new Element('option'));
  e.length.value = '0'; e.order.value = 'shuffled'; e['answer-mode'].value = 'type';
  const document = new Element(); document.getElementById = id => { assert(e[id], id); return e[id]; }; document.createElement = tag => new Element(tag);
  const storage = { data: saved }, timers = new Map(); let clock = 0;
  const context = { window: { DrillCore: C }, document,
    localStorage: { getItem: () => { if (blocked) throw Error('blocked'); return storage.data; }, setItem: (_, v) => { if (blocked) throw Error('blocked'); storage.data = v; } },
    setTimeout: fn => { timers.set(++clock, fn); return clock; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(script, context);
  const state = () => JSON.parse(storage.data);
  const question = () => { const key = state().session.current, cut = key.lastIndexOf(':'); return C.question(key.slice(0, cut), +key.slice(cut + 1)); };
  const answer = raw => { e.answer.value = raw; e['answer-form'].fire('submit'); };
  return { e, state, storage, question, answer, document, timers };
}
test('signed full pass reaches all 256 values, grades once, and ends at results', () => {
  const app = load(); app.e['start-signed'].fire('click');
  const seen = new Set();
  for (let i = 0; i < 256; i++) {
    const q = app.question(); seen.add(q.index); assert.equal(q.index, i);
    app.answer(q.answer); app.answer(q.answer);
    assert.equal(app.state().session.done, i + 1);
    app.e.next.fire('click');
  }
  assert.equal(seen.size, 256);
  assert(app.state().session.finished);
  assert.match(app.e['summary-copy'].textContent, /256 correct out of 256/);
  assert(!app.e.summary.classList.contains('hidden'));
});
test('invalid inputs do not count; misses and reveals are reviewed, and correct review clears them', () => {
  const a = load(); a.e['start-small'].fire('click');
  a.answer(''); a.answer('ABC'); assert.equal(a.state().session.done, 0);
  a.answer('9999'); assert.equal(Object.keys(a.state().misses).length, 1);
  a.e.next.fire('click'); a.e.reveal.fire('click');
  assert.equal(Object.keys(a.state().misses).length, 2);
  a.e.finish.fire('click'); a.e['summary-review'].fire('click');
  a.answer(a.question().answer); a.e.next.fire('click');
  a.answer('9999'); a.e.next.fire('click');
  assert.equal(Object.keys(a.state().misses).length, 1);
  a.e['summary-review'].fire('click'); a.answer(a.question().answer); a.e.next.fire('click');
  assert.equal(Object.keys(a.state().misses).length, 0); assert(a.e['summary-review'].disabled);
});
test('save and reload preserve in-progress answers, feedback, counts and deck position', () => {
  let a = load(); a.e['start-signed'].fire('click');
  a.e.answer.value = '1000'; a.e.answer.fire('input'); a.e.pause.fire('click');
  a = load(a.storage.data); a.e.resume.fire('click');
  assert.equal(a.e.answer.value, '1000'); assert.equal(a.question().index, 0);
  a.answer('10000000');
  a = load(a.storage.data); a.e.resume.fire('click');
  assert.equal(a.e['feedback-title'].textContent, 'Correct.'); assert(a.e.check.disabled);
  a.e.next.fire('click'); assert.equal(a.question().index, 1); assert.equal(a.state().session.done, 1);
});
test('choices and keyboard shortcuts score correctly, and Enter advances once', () => {
  const a = load(); a.e['answer-mode'].value = 'choice'; a.e['start-small'].fire('click');
  const answerIndex = a.state().session.choiceOrder.findIndex(x => C.correct(a.question(), x));
  a.document.fire('keydown', { key: String(answerIndex + 1), target: a.e.prompt });
  assert.equal(a.state().session.correct, 1);
  a.document.fire('keydown', { key: 'Enter', target: a.e.next });
  assert.equal(a.state().session.done, 1); assert.equal(a.state().session.result, null);
  a.document.fire('keydown', { key: 'Enter', target: a.e.next, repeat: true });
  assert.equal(a.state().session.done, 1);
});
test('definitions always use choices and mixed practice visits every selected type evenly', () => {
  const a = load(); a.e['start-mixed'].fire('click'); const seen = new Set();
  for (let i = 0; i < C.topics.length; i++) {
    const q = a.question(); assert(!seen.has(q.topic)); seen.add(q.topic);
    if (q.format === 'text') { assert(!a.e.choices.classList.contains('hidden')); assert(a.e['typed-answer'].classList.contains('hidden')); }
    a.e.reveal.fire('click'); a.e.next.fire('click');
  }
  assert.equal(seen.size, C.topics.length);
});
test('auto-next stops on pause, tab hide, manual navigation, and incorrect answers', () => {
  const a = load(); a.e['start-small'].fire('click');
  a.e['auto-next'].checked = true; a.e['auto-next'].fire('change');
  a.answer(a.question().answer); assert.equal(a.timers.size, 1);
  a.e.pause.fire('click'); assert.equal(a.timers.size, 0);
  a.e.resume.fire('click'); a.e.next.fire('click'); a.answer('999'); assert.equal(a.timers.size, 0);
  a.e.next.fire('click'); a.answer(a.question().answer); assert.equal(a.timers.size, 1);
  a.document.hidden = true; a.document.fire('visibilitychange'); assert.equal(a.timers.size, 0);
  a.e.next.fire('click'); a.answer(a.question().answer); assert.equal(a.timers.size, 1);
  a.e.next.fire('click'); assert.equal(a.timers.size, 0);
});
test('blocked or broken storage still allows drills', () => {
  for (const a of [load(null, true), load('{invalid')]) {
    a.e['start-signed'].fire('click'); a.answer('10000000');
    assert.equal(a.e['feedback-title'].textContent, 'Correct.'); a.e.next.fire('click');
    assert.match(a.e.prompt.textContent, /-127/);
  }
});
test('finite sessions, repeat sessions and focused settings stay consistent', () => {
  const a = load(); a.e.skill.value = 'bin-hex';
  // Choose a type through its actual group control.
  a.e['group-list'].children.find(b => b.dataset.group === 'convert').fire('click');
  a.e.skill.value = 'bin-hex'; a.e.skill.fire('change'); a.e.length.value = '25'; a.e.start.fire('click');
  for (let i = 0; i < 25; i++) { assert.equal(a.question().topic, 'bin-hex'); a.answer(a.question().answer); a.e.next.fire('click'); }
  assert.match(a.e['summary-copy'].textContent, /25 correct out of 25/);
  a.e.again.fire('click'); assert.equal(a.state().session.limit, 25); assert.equal(a.question().topic, 'bin-hex');
});
