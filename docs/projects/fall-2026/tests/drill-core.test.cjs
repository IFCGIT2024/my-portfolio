const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../drill-core.js');
const bits = n => Array.from({ length: 8 }, (_, i) => Math.floor(n / 2 ** (7 - i)) % 2).join('');
const value = str => [...str].reduce((sum, bit) => sum * 2 + Number(bit), 0);
const signedValue = str => [...str].reduce((sum, bit, i) => sum + Number(bit) * (i === 0 ? -128 : 2 ** (7 - i)), 0);
test('every unsigned byte converts in all six directions, and all 256 signed values round-trip', () => {
  for (let n = 0; n < 256; n++) {
    for (const from of ['bin', 'hex', 'dec']) for (const to of ['bin', 'hex', 'dec']) if (from !== to) {
      const q = C.question(`${from}-${to}`, n);
      assert.equal(q.value, n); assert(C.correct(q, q.answer));
      assert.equal(to === 'bin' ? value(q.answer) : parseInt(q.answer, to === 'hex' ? 16 : 10), n);
    }
    const s = signedValue(bits(n));
    for (const from of ['bin', 'hex']) assert.equal(C.question(`${from}-signed`, n).value, s);
    assert.equal(C.question('signed-bin', s + 128).answer, bits(n));
    assert.equal(parseInt(C.question('signed-hex', s + 128).answer, 16), n);
    assert.equal(C.question('reinterpret-signed', n).value, s);
    assert.equal(C.question('reinterpret-unsigned', s + 128).value, n);
    assert.equal((value(C.question('twos-negate', n).answer) + n) % 256, 0);
  }
  assert.equal(C.question('bin-signed', 255).answer, '-1');
  assert.equal(C.question('bin-signed', 127).answer, '127');
  assert.equal(C.question('bin-signed', 128).answer, '-128');
});
test('all byte-pair bitwise answers agree with independent bit truth tables', () => {
  const tables = { and: [0, 0, 0, 1], or: [0, 1, 1, 1], xor: [0, 1, 1, 0] };
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) for (const [op, table] of Object.entries(tables)) {
    const expectedBits = [...bits(a)].map((bit, i) => table[Number(bit) * 2 + Number(bits(b)[i])]).join('');
    for (const format of ['bin', 'hex', 'dec']) {
      const q = C.question(`${op}-${format}`, a * 256 + b);
      assert.equal(q.value, value(expectedBits));
      assert(C.correct(q, q.answer));
    }
  }
});
test('inverse-operation questions always have exactly one correct operation', () => {
  const t = C.byId['which-op'];
  for (let i = 0; i < t.size; i++) {
    const q = C.question(t.id, i), match = q.prompt.match(/0x([A-F0-9]+) \? 0x([A-F0-9]+) = ([01]+)/);
    const a = parseInt(match[1], 16), b = parseInt(match[2], 16), expected = value(match[3]);
    const matches = [['&', a & b], ['|', a | b], ['^', a ^ b]].filter(([, v]) => v === expected);
    assert.equal(matches.length, 1); assert.equal(q.answer, matches[0][0]);
  }
});
test('every shift matches string-level bit movement, including zero and seven positions', () => {
  for (let n = 0; n < 256; n++) for (let k = 0; k < 8; k++) {
    const input = bits(n), left = (input + '0'.repeat(k)).slice(-8), right = ('0'.repeat(k) + input).slice(0, 8);
    const arithmetic = (input[0].repeat(k) + input).slice(0, 8);
    for (const output of ['bin', 'hex', 'dec']) {
      assert.equal(C.question(`shift-left-${output}`, k * 256 + n).value, value(left));
      assert.equal(C.question(`shift-right-${output}`, k * 256 + n).value, value(right));
    }
    assert.equal(C.question('shift-arithmetic', k * 256 + n).answer, arithmetic);
    assert.equal(C.question('shift-c', k * 256 + n).value, n * 2 ** k);
    assert.equal(C.question('shift-c', 2048 + k * 256 + n).value, Math.floor(n / 2 ** k));
  }
  assert.equal(C.question('shift-left-dec', 256 + 128).value, 0);
  assert.equal(C.question('shift-c', 256 + 128).value, 256);
});
test('set, clear and toggle preserve every other bit; NOT flips every bit', () => {
  for (let n = 0; n < 256; n++) {
    assert.equal(C.question('not-bin', n).answer, [...bits(n)].map(b => b === '0' ? '1' : '0').join(''));
    for (let k = 0; k < 8; k++) for (const action of ['set', 'clear', 'toggle']) {
      const expected = [...bits(n)]; expected[7 - k] = action === 'set' ? '1' : action === 'clear' ? '0' : expected[7 - k] === '1' ? '0' : '1';
      assert.equal(C.question(`mask-${action}`, k * 256 + n).answer, expected.join(''));
      assert.equal(C.question('read-bit', k * 256 + n).answer, bits(n)[7 - k]);
    }
  }
});
test('complete-pass decks cover every value once, including resumed decks', () => {
  for (const order of ['ordered', 'shuffled']) for (const t of C.topics) {
    let decks = {}, seen = new Set();
    for (let i = 0; i < t.size; i++) {
      const q = C.draw(decks, t.id, order, () => .4321);
      assert(!seen.has(q.index), `${t.id} repeated ${q.index}`); seen.add(q.index);
      if (order === 'ordered') assert.equal(q.index, i);
      if (i === 5) decks = JSON.parse(JSON.stringify(decks));
    }
    assert.equal(seen.size, t.size);
    C.draw(decks, t.id, order, () => .789); assert.equal(decks[t.id].cycle, 2);
  }
});
test('answer parser accepts formatting, rejects partial/malformed answers, and preserves ASCII case', () => {
  const b = C.question('dec-bin', 255), h = C.question('dec-hex', 255), d = C.question('bin-signed', 255);
  for (const input of ['1111 1111', '0b11111111', '00011111111', '1111_1111']) assert(C.correct(b, input));
  for (const input of ['ff', '0xFF', '00ff', ' F F ']) assert(C.correct(h, input));
  for (const input of ['', '0b', '12', '11111111xyz', '-1']) assert(!C.correct(b, input));
  for (const input of ['-1', ' -01 ']) assert(C.correct(d, input));
  for (const input of ['-1.0', '-1x', '0xFF', '255', '']) assert(!C.correct(d, input));
  const a = C.question('hex-ascii', 10);
  assert(C.correct(a, 'A')); assert(C.correct(a, "'A'")); assert(!C.correct(a, 'a'));
});
test('all question types have usable prompts, explanations and unique choices with one correct answer', () => {
  assert.equal(new Set(C.topics.map(t => t.id)).size, C.topics.length);
  for (const t of C.topics) for (const i of new Set([0, 1, Math.floor(t.size / 2), t.size - 1])) {
    const q = C.question(t.id, i), choices = C.choices(q);
    assert(q.prompt && q.explanation && q.answer !== undefined);
    assert(C.correct(q, q.answer), `${q.id}: canonical answer rejected`);
    assert(choices.length >= 3 && choices.length <= 4, q.id);
    assert.equal(new Set(choices).size, choices.length, q.id);
    assert.equal(choices.filter(a => C.correct(q, a)).length, 1, q.id);
  }
});
