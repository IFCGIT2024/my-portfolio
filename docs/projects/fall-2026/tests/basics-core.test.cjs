const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../basics-core.js');
function seeded(seed = 17) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function forced(topic, skill, a, b = 0, k = 0, width = 8, tail = 0) {
  const draws = [.9, a / 2 ** width, .9, b / 2 ** width, k / width];
  return C.makeQuestion({topic, skill, width}, () => draws.length ? draws.shift() : tail);
}
const bitArray = (n, width = 8) => Array.from({length: width}, (_, i) => Math.floor(n / 2 ** (width - i - 1)) % 2);
const asNumber = q => Number(C.parseAnswer(q.answer, q.format, q.width));

test('all byte values convert correctly in all six directions and signed interpretations', () => {
  for (let a = 0; a < 256; a++) {
    const bin = bitArray(a).join('');
    for (const [skill] of C.TOPICS[0].skills.filter(([id]) => !id.includes('digit'))) {
      const q = forced('conversions', skill, a);
      assert.equal(asNumber(q), a);
      if (q.format === 'binary') assert.equal(q.answer, bin);
      if (skill.startsWith('bin')) assert.equal(q.display.replace(/ /g, ''), bin);
      if (skill.startsWith('dec')) assert.equal(q.display, String(a));
      if (skill.startsWith('hex')) assert.equal(Number(q.display), a);
    }
    // Independent signed oracle: signed place weights, rather than subtracting 256.
    const arr = bitArray(a);
    const expected = -arr[0] * 128 + arr.slice(1).reduce((sum, bit, i) => sum + bit * 2 ** (6 - i), 0);
    const decoded = forced('twos', 'decode', a);
    assert.equal(Number(decoded.answer), expected);
    assert.equal(forced('twos', 'encode', a).display, String(expected));
    assert.equal(forced('twos', 'encode', a).answer, bin);
    const negated = forced('twos', 'negate', a);
    assert.equal((asNumber(negated) + a) % 256, 0);
  }
  assert.equal(forced('twos', 'decode', 127).answer, '127');
  assert.equal(forced('twos', 'decode', 128).answer, '-128');
  assert.equal(forced('twos', 'decode', 255).answer, '-1');
  assert.match(forced('twos', 'negate', 128).explanation, /outside/);
});

test('every pair of byte patterns agrees with independent bit-by-bit truth tables', () => {
  const truth = {and: ['0', '0', '0', '1'], or: ['0', '1', '1', '1'], xor: ['0', '1', '1', '0']};
  for (let a = 0; a < 256; a++) {
    const aa = bitArray(a);
    assert.equal(forced('bitwise', 'not', a).answer, aa.map(b => b ? '0' : '1').join(''));
    for (let b = 0; b < 256; b++) {
      const bb = bitArray(b);
      for (const op of ['and', 'or', 'xor']) {
        const q = forced('bitwise', op, a, b);
        assert.equal(q.answer, aa.map((bit, i) => truth[op][bit * 2 + bb[i]]).join(''));
      }
    }
  }
});

test('shifts and masks preserve the specified bit positions across all byte values', () => {
  for (let a = 0; a < 256; a++) {
    const arr = bitArray(a);
    for (let count = 1; count <= 3; count++) {
      for (const skill of ['left', 'right', 'arithmetic']) {
        const q = forced('shifts', skill, a, 0, 0, 8, (count - 1) / 3);
        const fill = skill === 'arithmetic' ? arr[0] : 0;
        const expected = skill === 'left' ? [...arr.slice(count), ...Array(count).fill(0)] : [...Array(count).fill(fill), ...arr.slice(0, 8 - count)];
        assert.equal(q.answer, expected.join(''));
      }
    }
    for (let k = 0; k < 8; k++) {
      assert.equal(forced('masks', 'read', a, 0, k).answer, String(arr[7 - k]));
      for (const skill of ['set', 'clear', 'toggle', 'make']) {
        const expected = skill === 'make' ? Array(8).fill(0) : [...arr];
        expected[7 - k] = skill === 'clear' ? 0 : skill === 'toggle' ? 1 - expected[7 - k] : 1;
        assert.equal(forced('masks', skill, a, 0, k).answer, expected.join(''));
      }
    }
  }
});

test('4/16-bit boundaries, units, type sizes, logic, ranges, and all generated question shapes', () => {
  const rng = seeded(); const seen = new Set();
  const expectedSizes = {'char': 1, 'signed char': 1, 'unsigned char': 1, short: 2, 'unsigned short': 2,
    int: 4, 'unsigned int': 4, long: 8, 'unsigned long': 8, 'long long': 8, float: 4, double: 8, 'int *': 8, 'char *': 8};
  for (const width of [4, 8, 16]) for (const t of C.TOPICS) for (const [skill] of t.skills) {
    for (let i = 0; i < 160; i++) {
      const q = C.makeQuestion({topic: t.id, skill, width}, rng);
      assert(q.prompt && q.context && q.explanation && q.hint);
      assert(C.grade(q, q.answer).correct);
      if (q.format === 'choice') {
        assert.equal(q.choices.length, 4); assert.equal(new Set(q.choices).size, 4);
        assert.equal(q.choices.filter(c => C.grade(q, c).correct).length, 1);
        continue;
      }
      const n = asNumber(q); const m = q.meta;
      if (q.format === 'binary') { assert.equal(q.answer.length, q.width); assert.match(q.answer, /^[01]+$/); }
      if (t.id === 'conversions') assert.equal(n, m.a);
      if (t.id === 'twos' && skill === 'decode') {
        const arr = bitArray(m.a, width);
        assert.equal(n, -arr[0] * 2 ** (width - 1) + arr.slice(1).reduce((sum, bit, j) => sum + bit * 2 ** (width - j - 2), 0));
      }
      if (t.id === 'types' && skill !== 'range') {
        seen.add(m.type); assert.equal(n, expectedSizes[m.type] * (skill === 'bits' ? 8 : 1));
      }
      if (t.id === 'types' && skill === 'range') assert.equal(n, [2 ** width - 1, -(2 ** width / 2), 2 ** width / 2 - 1][m.variant]);
      if (t.id === 'bits' && skill === 'weight') assert.equal(n, bitArray(2 ** m.k, width).reduce((sum, bit, j) => sum + bit * 2 ** (width - j - 1), 0));
      if (t.id === 'bits' && skill === 'patterns') assert.equal(n, Array(m.n).fill(2).reduce((x, y) => x * y, 1));
      if (t.id === 'bits' && skill === 'units') assert.equal(n, [m.n * 8, m.n, m.n * 2][m.variant]);
      if (t.id === 'logical') {
        const truth = x => x === 0 ? 0 : 1;
        const expected = {'&&': truth(m.x) * truth(m.y), '||': Math.min(1, truth(m.x) + truth(m.y)), '!': 1 - truth(m.x), '&': m.x & m.y, '|': m.x | m.y}[m.op];
        assert.equal(n, expected);
      }
      if (t.id === 'shifts' && skill === 'c-shift') assert.equal(n, m.left ? m.a * 2 ** m.count : Math.trunc(m.a / 2 ** m.count));
    }
  }
  assert.equal(seen.size, Object.keys(expectedSizes).length);
});

test('all 256 signed values and hex directions appear once per pass, including after resume', () => {
  for (const topic of ['conversions', 'twos', 'chars']) {
    const skills = C.TOPICS.find(t => t.id === topic).skills.filter(([id]) => id !== 'definitions');
    for (const [skill] of skills) {
      const size = skill.includes('hex-digit') ? 16 : 256;
      let generator = C.createGenerator({}, seeded());
      const seen = new Set();
      for (let i = 0; i < size; i++) {
        if (i === 7) generator = C.createGenerator(generator.snapshot(), seeded(35));
        const q = generator.next({topic, skill, width: 8});
        const value = q.meta.byte ?? q.meta.a;
        assert(!seen.has(value), `${topic}/${skill} duplicated ${value}`); seen.add(value);
        assert.equal(q.coverage.shown, i + 1); assert.equal(q.coverage.total, size); assert.equal(q.coverage.pass, 1);
        assert(C.grade(q, q.answer).correct);
      }
      assert.equal(seen.size, size); assert(seen.has(0)); assert(seen.has(size - 1));
      assert.equal(generator.next({topic, skill, width: 8}).coverage.pass, 2);
    }
  }
});

test('hex-to-bit operator inference is unambiguous; char and pointer exercises use valid values', () => {
  const rng = seeded();
  for (let i = 0; i < 1500; i++) {
    const q = C.makeQuestion({topic: 'bitwise', skill: 'identify', width: 8}, rng);
    const {x, y, result} = q.meta;
    const answers = [['& (AND)', x & y], ['| (OR)', x | y], ['^ (XOR)', x ^ y]].filter(([, v]) => v === result);
    assert.equal(answers.length, 1); assert.equal(q.answer, answers[0][0]);
  }
  for (let a = 0; a < 256; a++) for (const skill of ['signed', 'unsigned', 'cast', 'extend', 'truncate']) {
    const q = C.makeQuestion({topic: 'chars', skill, value: a}, rng);
    const expected = a < 128 ? a : a - 256;
    if (skill === 'signed') assert.equal(Number(q.answer), expected);
    else if (skill === 'extend') assert.equal(q.answer, String(Number(a >= 128)).repeat(8) + bitArray(a).join(''));
    else assert.equal(Number(q.answer), a);
  }
  for (const skill of ['read', 'address', 'array', 'write']) for (let i = 0; i < 100; i++) {
    const q = C.makeQuestion({topic: 'pointers', skill}, rng); const m = q.meta;
    assert.equal(q.answer, String(skill === 'read' ? m.value : skill === 'write' ? m.other : skill === 'address' ? m.name : m.array[m.index]));
  }
});

test('bitwise, shift, and mask drills support every input/output base pair', () => {
  for (const topic of ['bitwise', 'shifts', 'masks']) {
    for (const [skill] of C.TOPICS.find(t => t.id === topic).skills.filter(([id]) => !['definitions', 'identify', 'c-shift'].includes(id))) {
      for (const inputBase of ['binary', 'hex', 'decimal']) for (const outputBase of ['binary', 'hex', 'decimal']) {
        const settings = {topic, skill, width: 8};
        const original = C.makeQuestion(settings, seeded());
        const q = C.makeQuestion({...settings, inputBase, outputBase}, seeded());
        assert.equal(asNumber(q), asNumber(original)); assert(C.grade(q, q.answer).correct);
        if (skill !== 'read') assert.equal(q.format, outputBase);
        assert.match(q.context, new RegExp(`Input: ${inputBase}`));
      }
    }
  }
});

test('answer parsing accepts useful notation but rejects malformed and out-of-width values', () => {
  const q = forced('conversions', 'dec-bin', 255);
  for (const s of ['11111111', '0b1111 1111', '000011111111', '1111_1111']) assert(C.grade(q, s).correct);
  for (const s of ['', '12', '-1', '111111111', '255', '<script>', '0xFF', '0b']) assert.equal(C.grade(q, s).valid, false);
  assert.equal(C.grade(q, '1111111').correct, false);
  const h = forced('conversions', 'dec-hex', 175);
  for (const s of ['af', 'AF', '0xaf', '0X00AF', 'A F']) assert(C.grade(h, s).correct);
  for (const s of ['AG', '0x100', '-AF', 'afjunk']) assert.equal(C.grade(h, s).valid, false);
  const d = forced('twos', 'decode', 128);
  assert(C.grade(d, ' −128 ').correct);
  for (const s of ['-128.0', '-128e0', '-128abc', '0x80', '']) assert.equal(C.grade(d, s).valid, false);
  assert.equal(C.parseAnswer('18446744073709551615', 'decimal'), 18446744073709551615n);
});
