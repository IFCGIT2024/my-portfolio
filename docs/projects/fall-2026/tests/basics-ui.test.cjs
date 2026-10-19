// Runs the actual controller without external packages. Layout QA is separate.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../basics-core.js');
const root = path.resolve(__dirname, '..');
class Element {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.events = {}; this.attributes = {}; this.value = ''; this.textContent = ''; this.className = ''; this.hidden = false; this.disabled = false;
    this.classList = {add: c => { this.className += ' ' + c; }};
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  addEventListener(name, fn) { (this.events[name] ??= []).push(fn); }
  setAttribute(k, v) { this.attributes[k] = v; }
  removeAttribute(k) { delete this.attributes[k]; }
  focus() { this.focused = true; }
  fire(name, details = {}) { if (!this.disabled) for (const fn of this.events[name] || []) fn({target: this, preventDefault() {}, ...details}); }
}
function load({saved = null, progress = null, blocked = false} = {}) {
  const html = fs.readFileSync(path.join(root, 'basics.html'), 'utf8');
  const elements = Object.fromEntries([...html.matchAll(/<([a-z-]+)[^>]*\bid="([^"]+)"/g)].map(m => [m[2], new Element(m[1])]));
  const document = new Element('document'); document.getElementById = id => { assert(elements[id], id); return elements[id]; };
  document.createElement = tag => new Element(tag);
  let current; let savedOutput; let savedProgress; let seed = 8;
  const rng = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const api = {...C, createGenerator: snapshot => {
    const generator = C.createGenerator(snapshot, rng);
    return {...generator, next: settings => { current = generator.next(settings); return current; }};
  }};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'basics.js'), 'utf8'), {
    window: {BasicsCore: api}, document,
    localStorage: {getItem(k) {if (blocked) throw Error('disabled'); return k.includes('progress') ? progress : saved;}, setItem(k, v) {if (blocked) throw Error('disabled'); if (k.includes('progress')) savedProgress = v; else savedOutput = v;}}
  });
  const answer = (value = current.answer) => {
    if (current.format === 'choice') elements.choices.children[current.choices.indexOf(value)].fire('click');
    else { elements.answer.value = value; elements['answer-form'].fire('submit'); }
  };
  return {e: elements, document, answer, q: () => current, stored: () => savedOutput, progress: () => savedProgress};
}
test('immediate default drill, valid and invalid answers, reveal, no duplicate scoring, and Enter submission', () => {
  const {e, answer, q} = load();
  assert.equal(e.topic.value, 'conversions'); assert.equal(e.skill.value, 'bin-dec'); assert.equal(e.width.value, '8');
  assert.equal(q().format, 'decimal'); assert(!e.drill.hidden); assert(e.summary.hidden); assert(e.answer.focused);
  answer('nonsense'); assert.equal(e.score.textContent, '0 / 0'); assert(e['input-error'].textContent);
  answer(); assert.equal(e.score.textContent, '1 / 1'); assert(e.answer.disabled); assert(!e.feedback.hidden);
  // Repeated clicks on a now-disabled control must not add another point.
  e.check.fire('click'); assert.equal(e.score.textContent, '1 / 1');
  e.next.fire('click'); assert.equal(e.answer.value, ''); assert(e.feedback.hidden);
  e.reveal.fire('click'); assert.equal(e.score.textContent, '1 / 2'); assert.equal(e.review.textContent, 'Review missed (1)');
  e.next.fire('click'); assert.equal(e.streak.textContent, '0');
});
test('ten-question rounds finish, keep misses, review until correct, then generate a fresh round', () => {
  const {e, q, answer} = load(); e.length.value = '10'; e.length.fire('change');
  let missed;
  for (let i = 0; i < 10; i++) {
    if (i === 2) { missed = q(); answer(String(Number(q().answer) + 1)); } else answer();
    e.next.fire('click');
  }
  assert(e.drill.hidden); assert(!e.summary.hidden); assert.equal(e['summary-title'].textContent, '9 of 10 correct.');
  e['summary-review'].fire('click'); assert.equal(e.prompt.textContent, missed.prompt); assert.equal(e.value.textContent, missed.display);
  e.answer.value = String(Number(missed.answer) + 2); e['answer-form'].fire('submit'); e.next.fire('click');
  assert.equal(e.value.textContent, missed.display); assert(e.summary.hidden);
  e.answer.value = missed.answer; e['answer-form'].fire('submit'); e.next.fire('click');
  assert.equal(e['summary-title'].textContent, 'Missed questions cleared.'); assert(e['summary-review'].disabled);
  e.again.fire('click'); assert(!e.drill.hidden); assert.equal(e.score.textContent, '0 / 0'); assert(e.review.disabled);
});
test('every topic/focus renders and checks; keyboard choices work; width and preferences persist', () => {
  const {e, document, q, answer, stored} = load();
  for (const topic of C.TOPICS) {
    e.topic.value = topic.id; e.topic.fire('change');
    for (const [skill] of topic.skills) {
      e.skill.value = skill; e.skill.fire('change');
      assert.equal(q().topic, topic.id); assert.equal(q().skill, skill);
      assert.equal(e['answer-form'].hidden, q().format === 'choice');
      if (q().format === 'choice') document.fire('keydown', {key: String(q().choices.indexOf(q().answer) + 1)});
      else answer();
      assert.equal(e.score.textContent, '1 / 1');
    }
  }
  e.topic.value = 'conversions'; e.topic.fire('change'); e.skill.value = 'bin-dec'; e.skill.fire('change');
  e.width.value = '16'; e.width.fire('change'); assert.equal(q().width, 16);
  const restored = load({saved: stored()}); assert.equal(restored.e.width.value, '16'); assert.equal(restored.e.topic.value, 'conversions');
  e.topic.value = 'mixed'; e.topic.fire('change'); assert(e.skill.disabled); answer();
  assert.equal(e.score.textContent, '1 / 1');
});

test('value passes and missed questions survive reload; representation and long-round controls work', () => {
  const run = load();
  assert.equal(run.q().coverage.shown, 1);
  run.e.reveal.fire('click');
  const again = load({saved: run.stored(), progress: run.progress()});
  assert.equal(again.q().coverage.shown, 2); assert.equal(again.e.review.textContent, 'Review missed (1)');
  again.e.topic.value = 'bitwise'; again.e.topic.fire('change');
  again.e.skill.value = 'and'; again.e.skill.fire('change');
  again.e['input-base'].value = 'hex'; again.e['input-base'].fire('change');
  again.e['output-base'].value = 'decimal'; again.e['output-base'].fire('change');
  assert.match(again.e.value.textContent, /0x/); assert.equal(again.q().format, 'decimal');
  again.e.length.value = '100'; again.e.length.fire('change');
  assert.match(again.e['question-count'].textContent, /of 100/);
  again.answer(); assert.equal(again.e.score.textContent, '1 / 1');
});
test('unavailable/corrupt storage cannot block practice, and navigation preserves existing quizzes', () => {
  for (const setup of [{blocked: true}, {saved: '{broken'}, {saved: JSON.stringify({topic: 'oops', skill: 'bad', width: 999, length: -2})}]) {
    const {e, answer} = load(setup); answer(); assert.equal(e.score.textContent, '1 / 1');
    if (setup.blocked) assert.match(e['storage-note'].textContent, /could not be saved/);
  }
  for (const name of ['index.html', 'quiz.html', 'midterm.html']) assert.match(fs.readFileSync(path.join(root, name), 'utf8'), /href="basics.html"/);
  const html = fs.readFileSync(path.join(root, 'basics.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]); assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)) {
    if (!match[1].startsWith('https:')) assert(fs.existsSync(path.join(root, match[1])), match[1]);
  }
});
