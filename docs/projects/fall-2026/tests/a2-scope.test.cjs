const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../data/2122-a2-recall.json');

const forbiddenContext = /\b(?:assignment\s*(?:two|2)|problem\s*(?:one|two|1|2)|pdf|walkthrough|marsdec\w*)\b/i;
const combined = q => [q.prompt, q.code || ''].join('\n');
const byId = id => {
  const q = bank.questions.find(item => item.id === id);
  assert.ok(q, 'Missing expected practice skill: ' + id);
  return q;
};

test('student-facing questions and references do not require assignment or protocol documents', () => {
  for (const value of [bank.title, bank.description, ...bank.assumptions]) {
    assert.doesNotMatch(value, forbiddenContext, 'Bank description/assumptions');
  }
  for (const question of bank.questions) {
    for (const key of ['prompt', 'code', 'hint', 'answer', 'explanation', 'source']) {
      assert.doesNotMatch(question[key] || '', forbiddenContext, question.id + ': ' + key);
    }
    for (const point of question.rubric || []) {
      assert.doesNotMatch(point, forbiddenContext, question.id + ': rubric');
    }
  }
  for (const topic of bank.topics) {
    for (const value of [topic.title, topic.description, ...topic.notes]) {
      assert.doesNotMatch(value, forbiddenContext, topic.id);
    }
  }
  for (const source of bank.sources) {
    // A C standard reference may be a PDF URL; the complaint concerns required
    // assignment documents, not the format of an optional language reference.
    const prose = (source.title + ' ' + source.detail).replace(/https?:\/\/\S+/g, '');
    assert.doesNotMatch(prose, forbiddenContext);
  }
});

test('standalone bit-location prompts define ordering or provide the actual expression', () => {
  for (const question of bank.questions.filter(q => q.topic === 'positions')) {
    const context = combined(question);
    if (['A2-POSITIONS-09', 'A2-POSITIONS-10'].includes(question.id)) {
      // Counting valid positions depends on the origin, not within-byte order.
      assert.match(context, /zero|position\s+0|starting\s+at\s+0/i, question.id + ': origin');
      continue;
    }
    // Either the prompt states the numbering convention, or its displayed C
    // expression determines extraction unambiguously without a prior page.
    assert.ok(/MSB|LSB|most.significant|least.significant/i.test(context) ||
      /data\s*\[.*(?:>>|<<)/s.test(context), question.id + ': missing bit order');
  }
  for (const id of ['A2-MASKS-03', 'A2-MASKS-05', 'A2-MASKS-07', 'A2-MASKS-09']) {
    assert.match(combined(byId(id)), /LSB|least.significant/i, id + ': mask numbering');
  }
});

test('whole-method helper dependencies have an explicit callable contract', () => {
  for (const id of ['A2-METHODS-01', 'A2-METHODS-02', 'A2-METHODS-03', 'A2-METHODS-04']) {
    assert.match(combined(byId(id)), /MSB|most.significant/i, id + ': stream order');
  }
  for (const id of ['A2-METHODS-03', 'A2-METHODS-04', 'A2-METHODS-07']) {
    const context = combined(byId(id));
    assert.match(context, /(?:unsigned\s+int|int)\s+(?:getBit|getBits|decodeSigned)\s*\(/,
      id + ': available helper signature');
  }
  for (const q of bank.questions.filter(item => item.stage === 4)) {
    assert.equal(q.type, 'self', q.id + ': alternative correct C must use rubric grading');
    assert.ok(q.rubric && q.rubric.length >= 3, q.id + ': incomplete rubric');
  }
});
