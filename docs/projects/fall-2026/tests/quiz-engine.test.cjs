// Dependency-free DOM harness for the actual shared quiz engine.
// Run: node --test docs/projects/fall-2026/tests/quiz-engine.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'quiz.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'quiz.js'), 'utf8');
const a1 = JSON.parse(fs.readFileSync(path.join(root, 'data/2122-a1.json')));
const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
class Element {
  constructor(id='') {
    this.id = id; this.textContent = ''; this.children = []; this.events = {};
    this.dataset = {}; this.style = {}; this.attributes = {}; this.checked = false;
    this.disabled = false; this.value = ''; this._html = ''; this.className = '';
    this.classList = {
      contains: c => this.className.split(/\s+/).includes(c),
      add: c => { if (!this.classList.contains(c)) this.className += ' '+c; },
      remove: c => { this.className = this.className.split(/\s+/).filter(x=>x!==c).join(' '); },
      toggle: (c, force) => {
        const on = force === undefined ? !this.classList.contains(c) : force;
        on ? this.classList.add(c) : this.classList.remove(c); return on;
      }
    };
  }
  get innerHTML() { return this._html; }
  set innerHTML(value) {
    this._html = value; this.children = [];
    if (this.id === 'section-options') {
      for (const match of value.matchAll(/<input[^>]*value="([^"]*)"[^>]*>/g)) {
        const e = new Element(); e.value = decode(match[1]); e.checked = /\bchecked\b/.test(match[0]); this.children.push(e);
      }
    }
    if (this.id === 'question-count') this.value = value.match(/value="([^"]+)"/)?.[1] || '';
  }
  addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
  fire(name) { if (!(name === 'click' && this.disabled)) for (const fn of this.events[name] || []) fn(); }
  appendChild(e) { this.children.push(e); }
  setAttribute(k,v) { this.attributes[k] = v; }
  removeAttribute(k) { delete this.attributes[k]; }
  querySelector(selector) { if (selector === 'summary') return this.summary ||= new Element(); throw Error(selector); }
}
async function load(query, failFetch=false) {
  const els = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element(m[1])]));
  els['practice-order'].value = 'study';
  const links = ['general','a1'].map(v => {const e=new Element();e.dataset.quiz=v;return e;});
  const select = selector => {
    if (selector === '#course-quizzes a') return links;
    if (selector === '#section-options input') return els['section-options'].children;
    if (selector === '#section-options input:checked') return els['section-options'].children.filter(e=>e.checked);
    if (selector.startsWith('.answer-button')) return els['answer-options'].children.filter(e=>e.classList.contains('answer-button') && (!selector.endsWith('.selected') || e.classList.contains('selected')));
    if (selector === '.multi-check-button') return els['answer-options'].children.filter(e=>e.classList.contains('multi-check-button'));
    throw Error('Unhandled selector: '+selector);
  };
  let seed = 42;
  const math = Object.create(Math); math.random = () => ((seed = (1664525*seed+1013904223)>>>0) / 2**32);
  vm.runInNewContext(script, {
    window:{location:{search:query}}, URLSearchParams, Math:math,
    document:{getElementById:id=>{assert.ok(els[id],id);return els[id];}, createElement:()=>new Element(),
              querySelectorAll:select, querySelector:s=>select(s)[0] || null},
    fetch: async url => ({ok:!failFetch,status:failFetch?503:200,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))})
  });
  for (let i=0;i<15;i++) await Promise.resolve();
  return els;
}
const buttons = e => e['answer-options'].children.filter(x=>x.classList.contains('answer-button'));
const current = e => a1.questions.find(q=>e['progress-text'].textContent.endsWith(q.id));

for (const shuffle of [false,true]) test(`all 160 A1 answers score correctly; shuffle=${shuffle}`, async()=>{
  const e=await load('?course=2122&quiz=a1');
  assert.equal(e['section-options'].children.length,16);
  assert.match(e['course-description'].textContent,/160 questions/);
  e['question-count'].value='160';e['shuffle-options'].checked=shuffle;e['start-button'].fire('click');
  for (const q of a1.questions) {
    assert.equal(current(e).id,q.id);
    if(q.code) {assert.ok(!e['question-support'].classList.contains('hidden'));assert.ok(e['question-support'].innerHTML.includes('question-code'));}
    else assert.ok(e['question-support'].classList.contains('hidden'));
    buttons(e).find(b=>Number(b.dataset.originalIndex)===q.correct).fire('click');
    assert.ok(e['feedback'].classList.contains('correct'));
    assert.ok(buttons(e).every(b=>b.disabled));
    e['next-button'].fire('click');
  }
  assert.equal(e['score-percent'].textContent,'100%');
  assert.ok(!e['results'].classList.contains('hidden'));
  e['retry-button'].fire('click');assert.ok(!e['setup'].classList.contains('hidden'));
});
test('wrong answers, shuffled feedback, escaping, filtering, and random review',async()=>{
  const e=await load('?course=2122&quiz=a1');
  e['toggle-all'].fire('click');e['start-button'].fire('click');
  assert.match(e['setup-message'].textContent,/Select at least one topic/);
  e['section-options'].children[3].checked=true;e['section-options'].fire('change');
  assert.equal(e['question-count'].value,'10');
  e['practice-order'].value='random';e['start-button'].fire('click');
  const seen=[];
  for(let i=0;i<10;i++) {
    const q=current(e);seen.push(q.id);assert.ok(q.section.startsWith('04'));
    const wrong=(q.correct+1)%4;
    buttons(e).find(b=>Number(b.dataset.originalIndex)===wrong).fire('click');
    assert.ok(e['feedback'].classList.contains('wrong'));
    if(q.optionFeedback) assert.ok(e['feedback'].innerHTML.includes('option-detail'));
    assert.ok(!e['question-support'].innerHTML.includes('<<'));
    e['next-button'].fire('click');
  }
  assert.equal(new Set(seen).size,10);
  assert.notDeepEqual(seen,[...seen].sort());
  assert.equal(e['score-percent'].textContent,'0%');
});
test('other course routes, 2115 presets and table support, and load errors',async()=>{
  for(const course of ['2115','2122','2134','2141']) {
    const e=await load('?course='+course);assert.ok(!e['setup'].classList.contains('hidden'),course);
    assert.ok(e['practice-order-setting'].classList.contains('hidden'));
    e['start-button'].fire('click');assert.ok(buttons(e).length>=4,course);
    if(course==='2115') {
      e['select-2115-core'].fire('click');
      assert.ok(e['section-options'].children.filter(x=>x.checked).every(x=>x.value.startsWith('Core')));
      e['select-2115-assignment'].fire('click');
      assert.ok(e['section-options'].children.filter(x=>x.checked).every(x=>x.value.startsWith('Assignment')));
    }
  }
  for(const query of ['?course=bad','?course=2134&quiz=a1']) {
    const e=await load(query);assert.ok(!e['error'].classList.contains('hidden'));
  }
  const e=await load('?course=2122&quiz=a1',true);assert.match(e['error-message'].textContent,/503/);
});
