const { test } = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../data/2122-midterm.json');
const C = require('../midterm-core.js');
const byId = id => bank.questions.find(q => q.id === id);
function rng(seed) { return () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2**32); }

test('full tests cover all 21 groups, with the exact sample-paper formats', () => {
  for (let seed=0; seed<300; ++seed) {
    const s = C.generate(bank, {}, rng(seed));
    assert.deepEqual(s.selected.map(x => byId(x.id).group), bank.groups.map(g=>g.id));
    assert.deepEqual(s.selected.map(x => byId(x.id).type), [...Array(18).fill('mcq'), 'trace', 'code', 'code']);
    assert(s.selected.every(x => byId(x.id).origin === 'variant'));
    for (const item of s.selected.slice(0,18)) assert.deepEqual(item.order.slice().sort(), [0,1,2,3]);
  }
});
test('original-paper mode preserves all originals and the PDF option ordering', () => {
  const s=C.generate(bank,{source:'originals'},rng(20));
  assert(s.selected.every(x=>x.id.endsWith('-O')));
  s.selected.slice(0,18).forEach(x=>assert.deepEqual(x.order,[0,1,2,3]));
});
test('new tests avoid the preceding choice in every group; mixed includes originals', () => {
  const a=C.generate(bank,{},rng(5));
  const b=C.generate(bank,{previous:a.selected.map(x=>x.id)},rng(5));
  assert(b.selected.every((x,i)=>x.id!==a.selected[i].id));
  const mixed=C.generate(bank,{source:'mixed'},()=>0);
  assert(mixed.selected.every(x=>x.id.endsWith('-O')));
});
test('targeted tests select exactly the requested groups in sample order', () => {
  const s=C.generate(bank,{groups:['M20','M03','M19']},rng(7));
  assert.deepEqual(s.selected.map(x=>byId(x.id).group),['M03','M19','M20']);
  assert.throws(()=>C.generate(bank,{groups:[]}));
});
test('every answer maps correctly after shuffling; blanks are not correct', () => {
  const s=C.generate(bank,{},rng(5));
  assert.equal(C.summary(bank,s).correct,0);
  for (const item of s.selected) {
    const q=byId(item.id);
    if(q.type==='mcq') {
      for(const index of item.order) {
        s.answers[q.id]=index;
        assert.equal(C.status(q,s),index===q.correct?'correct':'incorrect');
      }
      s.answers[q.id]=q.correct;
    }
  }
  assert.equal(C.summary(bank,s).correct,18);
  assert.equal(C.summary(bank,s).writtenReviewed,0);
});
test('written answers need a complete response and an explicit self-rating', () => {
  const s=C.generate(bank,{source:'originals'});
  const trace=byId('M19-O'), code=byId('M20-O');
  s.answers[trace.id]=['first part','']; s.ratings[trace.id]='confident';
  assert.equal(C.status(trace,s),'unanswered');
  s.answers[trace.id][1]='second part'; delete s.ratings[trace.id];
  assert.equal(C.status(trace,s),'pending');
  s.answers[code.id]='function text';
  assert.equal(C.status(code,s),'pending');
  s.ratings[code.id]='partial';
  assert.equal(C.status(code,s),'partial');
  assert.equal(C.summary(bank,s).writtenReviewed,1);
});
test('saved tests round-trip, while malformed or stale storage is rejected', () => {
  const s=C.generate(bank,{},rng(9));
  assert.deepEqual(C.restore(bank,JSON.stringify(s)),s);
  for (const raw of [null,'null','{}','no json']) assert.equal(C.restore(bank,raw),null);
  const invalid=structuredClone(s);invalid.selected[0].order=[0,0,2,3];
  assert.equal(C.restore(bank,JSON.stringify(invalid)),null);
  invalid.selected[0]=invalid.selected[1];
  assert.equal(C.restore(bank,JSON.stringify(invalid)),null);
});
