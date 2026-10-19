/* Generated, finite-domain fundamentals. No network or question-bank dependency. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DrillCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const bin = (n, width = 8) => n.toString(2).padStart(width, '0');
  const hex = (n, width = 2) => n.toString(16).toUpperCase().padStart(width, '0');
  const signed = n => n < 128 ? n : n - 256;
  const byte = n => ((n % 256) + 256) % 256;
  const fmt = (n, base) => base === 'bin' ? bin(n) : base === 'hex' ? hex(n) : String(n);
  const shown = (n, base) => base === 'hex' ? '0x' + hex(n) : fmt(n, base);
  const baseName = { bin: 'binary', hex: 'hex', dec: 'decimal', text: 'answer' };
  const groups = [
    { id: 'bits', name: 'Bits & hex digits', detail: 'Place values, hex digits, upper four bits.' },
    { id: 'convert', name: 'Byte conversions', detail: 'Binary ↔ decimal ↔ hex. All 0–255.' },
    { id: 'signed', name: 'Two’s complement', detail: 'Every value −128–127, both directions.' },
    { id: 'bitwise', name: 'Bitwise & masks', detail: 'AND, OR, XOR, NOT, read/set/clear/toggle.' },
    { id: 'shift', name: 'Bit shifts', detail: 'Left, right, dropped bits, sign extension.' },
    { id: 'logic', name: 'Logic & syntax', detail: '&&, ||, !, truth values, operator names.' },
    { id: 'types', name: 'Types & chars', detail: 'Bytes, ranges, sizeof, ASCII, promotions.' },
    { id: 'pointers', name: 'Pointer basics', detail: '&x, *p, pointed-to values, small arrays.' }
  ];
  const topics = [];
  function add(id, group, name, size, make) { topics.push({ id, group, name, size, make }); }
  function number(prompt, value, format = 'dec', explanation = '', extra = {}) {
    return { prompt, value, format, answer: fmt(value, format), explanation, ...extra };
  }
  function choice(prompt, answer, options, explanation, extra = {}) {
    return { prompt, answer, format: 'text', options: [...new Set([answer, ...options])], explanation, ...extra };
  }
  function facts(id, group, name, rows) {
    add(id, group, name, rows.length, i => choice(...rows[i]));
  }
  const weights = n => [...bin(n)].map((b, i) => b === '1' ? 2 ** (7 - i) : 0).filter(Boolean).join(' + ') || '0';
  const conversionNote = n => `${bin(n)} = ${weights(n)} = ${n}. Hex: ${bin(n).slice(0, 4)} ${bin(n).slice(4)} → ${hex(n)[0]} ${hex(n)[1]}.`;
  add('place', 'bits', 'Bit index → place value', 8, i => number(`What is the decimal value of bit ${i} alone?`, 2 ** i, 'dec', `Bit ${i} has weight 2^${i} = ${2 ** i}. The rightmost bit is bit 0.`));
  add('read-bit', 'bits', 'Read one bit', 2048, i => { const n = i % 256, k = Math.floor(i / 256); return number(`In ${bin(n)}, what is bit ${k}?`, (n >> k) & 1, 'dec', `Count from bit 0 at the right. Bit ${k} is ${(n >> k) & 1}.`); });
  for (const [from, to] of [['hex', 'dec'], ['dec', 'hex'], ['hex', 'bin'], ['bin', 'hex'], ['bin', 'dec'], ['dec', 'bin']]) {
    add(`digit-${from}-${to}`, 'bits', `${baseName[from]} → ${baseName[to]} · 0–15`, 16, n => number(`${from === 'hex' ? 'Hex' : baseName[from]} ${from === 'bin' ? bin(n, 4) : from === 'hex' ? hex(n, 1) : n} → ${baseName[to]}?`, n, to, `${bin(n, 4)}₂ = ${n} decimal = ${hex(n, 1)} hex.`, { width: 4, answer: to === 'bin' ? bin(n, 4) : to === 'hex' ? hex(n, 1) : String(n) }));
  }
  for (const [from, to] of [['bin', 'dec'], ['dec', 'bin'], ['hex', 'dec'], ['dec', 'hex'], ['bin', 'hex'], ['hex', 'bin']]) {
    add(`upper-${from}-${to}`, 'bits', `Upper four bits · ${baseName[from]} → ${baseName[to]}`, 16, i => {
      const n = i * 16, grouped = `${bin(n).slice(0, 4)} 0000`;
      return number(`${from === 'bin' ? grouped : shown(n, from)} → ${baseName[to]}?`, n, to,
        `${grouped} = ${weights(n)} = ${n} decimal = 0x${hex(n)}.\nThe upper four weights are 128, 64, 32, 16. The lower four bits contribute 0.`,
        { assumption: 'Unsigned 8-bit byte · upper four bits only · lower four bits fixed at 0000', upperFour: true, answer: to === 'bin' ? grouped : fmt(n, to) });
    });
  }
  facts('bit-definitions', 'bits', 'Bit, byte, nibble definitions', [
    ['How many bits does one hex digit represent?', '4', ['2', '8', '16'], 'One hex digit selects one of 16 patterns; 2^4 = 16.'],
    ['What is a nibble?', '4 bits', ['1 bit', '8 bits', '16 bits'], 'A nibble is four bits: one hex digit.'],
    ['How many distinct patterns fit in 8 bits?', '256', ['128', '255', '8'], '2^8 = 256 patterns, including zero.'],
    ['Which bit is bit 0?', 'Rightmost bit', ['Leftmost bit', 'Second bit from the right', 'The sign bit'], 'Bit indexing starts at zero on the right.'],
    ['What does a bit hold?', '0 or 1', ['0 through 7', 'One decimal digit', 'One hex digit'], 'One bit has two possible states.'],
    ['Two hex digits represent how many bits?', '8', ['2', '4', '16'], 'Each digit represents four bits.']
  ]);
  for (const [from, to] of [['bin', 'dec'], ['dec', 'bin'], ['hex', 'dec'], ['dec', 'hex'], ['bin', 'hex'], ['hex', 'bin']]) {
    add(`${from}-${to}`, 'convert', `${baseName[from]} → ${baseName[to]} · byte`, 256, n => number(`${shown(n, from)} → ${baseName[to]}?`, n, to, conversionNote(n), { assumption: 'Unsigned byte · 0–255' }));
  }
  for (const to of ['bin', 'hex']) {
    add(`signed-${to}`, 'signed', `Signed decimal → ${baseName[to]}`, 256, i => {
      const n = i - 128, b = byte(n);
      return number(`${n} → 8-bit two’s-complement ${baseName[to]}?`, b, to, n < 0 ? `256 + (${n}) = ${b}. Store that pattern: ${bin(b)} = 0x${hex(b)}.` : `Nonnegative values use ordinary binary: ${bin(b)} = 0x${hex(b)}.`, { assumption: '8-bit two’s complement · −128–127' });
    });
  }
  for (const from of ['bin', 'hex']) {
    add(`${from}-signed`, 'signed', `${baseName[from]} → signed decimal`, 256, n => number(`${shown(n, from)} → signed decimal?`, signed(n), 'dec', n < 128 ? `The leading bit is 0: ${n}.` : `The leading bit is 1: unsigned value ${n} − 256 = ${signed(n)}.`, { assumption: 'Interpret these 8 bits as two’s complement.' }));
  }
  add('reinterpret-signed', 'signed', 'Unsigned value → signed interpretation', 256, n => number(`Unsigned ${n}: same 8 bits, signed value?`, signed(n), 'dec', n < 128 ? `The sign bit is 0, so the value stays ${n}.` : `${n} − 256 = ${signed(n)}.`, { assumption: 'Reinterpret the bit pattern as 8-bit two’s complement; this is not a C cast.' }));
  add('reinterpret-unsigned', 'signed', 'Signed value → unsigned interpretation', 256, i => { const n = i - 128; return number(`Signed ${n}: same 8 bits, unsigned value?`, byte(n), 'dec', n < 0 ? `${n} + 256 = ${byte(n)}.` : `The value stays ${n}.`, { assumption: '8-bit two’s-complement pattern' }); });
  add('twos-negate', 'signed', 'Flip bits + add 1', 256, n => number(`Take the two’s complement of ${bin(n)}.`, byte(-n), 'bin', `Flip: ${bin(255 - n)}. Add 1, keeping 8 bits: ${bin(byte(-n))}.${n === 128 ? ' −128 has no positive counterpart in signed 8-bit; the pattern stays 10000000.' : n === 0 ? ' Zero stays zero.' : ''}`, { assumption: '8-bit pattern operation · discard carry beyond bit 7' }));
  facts('signed-definitions', 'signed', 'Signed and two’s-complement definitions', [
    ['What is two’s complement?', 'A representation of signed integers', ['A binary-to-hex conversion', 'A second sign bit', 'The bitwise NOT operator'], 'In 8 bits, the top bit has weight −128 and the other bits have positive weights.'],
    ['To form the 8-bit pattern for −5 from +5, do what?', 'Invert all 8 bits, then add 1', ['Invert only the sign bit', 'Add 1, then invert', 'Invert all bits only'], '00000101 → 11111010 → 11111011.'],
    ['Range of an 8-bit two’s-complement integer?', '−128 to 127', ['−127 to 128', '0 to 255', '−128 to 128'], 'There are 128 negative values, zero, and 127 positive values.'],
    ['Range of an unsigned 8-bit integer?', '0 to 255', ['0 to 256', '−128 to 127', '1 to 256'], 'All eight bits contribute positive place values.'],
    ['Weight of the leftmost bit in 8-bit two’s complement?', '−128', ['128', '−127', '256'], 'Its signed weight is −2^7.'],
    ['How many representations of zero in two’s complement?', '1', ['2', '0', '256'], '00000000 is the only zero.'],
    ['Can +128 fit in signed 8-bit two’s complement?', 'No', ['Yes', 'Only in hex', 'Only in binary'], 'The maximum is +127. 10000000 means −128.']
  ]);
  const ops = { '&': (a, b) => a & b, '|': (a, b) => a | b, '^': (a, b) => a ^ b };
  const opNames = { '&': 'AND', '|': 'OR', '^': 'XOR' };
  const opRules = { '&': 'A result bit is 1 only when both input bits are 1.', '|': 'A result bit is 1 when either input bit is 1.', '^': 'A result bit is 1 when the input bits differ.' };
  for (const op of Object.keys(ops)) {
    add(`truth-${opNames[op].toLowerCase()}`, 'bitwise', `${opNames[op]} · single-bit truth table`, 4, i => { const a = i >> 1, b = i & 1; return number(`${a} ${op} ${b} = ?`, ops[op](a, b), 'dec', opRules[op]); });
    for (const output of ['bin', 'hex', 'dec']) {
      add(`${opNames[op].toLowerCase()}-${output}`, 'bitwise', `${opNames[op]} → ${baseName[output]}`, 65536, i => {
        const a = Math.floor(i / 256), b = i % 256, result = ops[op](a, b);
        const input = output === 'hex' ? 'bin' : 'hex';
        return number(`${shown(a, input)} ${op} ${shown(b, input)} → ${baseName[output]}?`, result, output, `${bin(a)}\n${op} ${bin(b)}\n= ${bin(result)} = 0x${hex(result)} = ${result}.\n${opRules[op]}`, { assumption: 'Bitwise operation · unsigned byte values' });
      });
    }
  }
  for (const output of ['bin', 'hex', 'dec']) {
    add(`not-${output}`, 'bitwise', `Flip all 8 bits → ${baseName[output]}`, 256, n => number(`Flip all 8 bits of ${output === 'bin' ? '0x' + hex(n) : bin(n)} → ${baseName[output]}?`, 255 - n, output, `${bin(n)} → ${bin(255 - n)}. Each 0 becomes 1; each 1 becomes 0.`, { assumption: '8-bit NOT only. In C, use (~x) & 0xFFu to keep the low 8 bits.' }));
  }
  // Keep only operand pairs for which AND, OR, XOR have distinct results.
  const inversePairs = [];
  for (let a = 0; a < 256; a++) for (let b = 0; b < 256; b++) if (new Set(Object.values(ops).map(fn => fn(a, b))).size === 3) inversePairs.push([a, b]);
  add('which-op', 'bitwise', 'Which operator gives this result?', inversePairs.length * 3, i => {
    const [a, b] = inversePairs[Math.floor(i / 3)], op = Object.keys(ops)[i % 3];
    return choice(`0x${hex(a)} ? 0x${hex(b)} = ${bin(ops[op](a, b))} (binary)`, op, ['&', '|', '^'], `${Object.keys(ops).map(o => `${o}: ${bin(ops[o](a, b))}`).join('\n')}\n${opRules[op]}`, { assumption: 'Choose the bitwise operator. Exactly one listed operator works.' });
  });
  for (const action of ['set', 'clear', 'toggle']) {
    add(`mask-${action}`, 'bitwise', `${action} one bit → binary`, 2048, i => {
      const n = i % 256, k = Math.floor(i / 256), m = 2 ** k;
      const result = action === 'set' ? n | m : action === 'clear' ? n & (255 ^ m) : n ^ m;
      const syntax = action === 'set' ? 'x |= 1u << k' : action === 'clear' ? 'x &= ~(1u << k)' : 'x ^= 1u << k';
      return number(`${action[0].toUpperCase() + action.slice(1)} bit ${k} of ${bin(n)}.`, result, 'bin', `${syntax}; with k = ${k}.\n${bin(n)} → ${bin(result)}. Other bits stay unchanged.`, { assumption: 'Bit 0 is rightmost · 8-bit result' });
    });
  }
  for (const direction of ['left', 'right']) for (const output of ['bin', 'hex', 'dec']) {
    add(`shift-${direction}-${output}`, 'shift', `8-bit ${direction} shift → ${baseName[output]}`, 2048, i => {
      const n = i % 256, k = Math.floor(i / 256), result = direction === 'left' ? byte(n * 2 ** k) : Math.floor(n / 2 ** k);
      return number(`${bin(n)} ${direction === 'left' ? '<<' : '>>'} ${k} → ${baseName[output]}?`, result, output, `${direction === 'left' ? `${n} × 2^${k} = ${n * 2 ** k}; keep the low 8 bits` : `Floor(${n} ÷ 2^${k}) = ${result}`}.\nResult: ${bin(result)} = 0x${hex(result)} = ${result}.`, { assumption: '8-bit logical shift · fill with 0 · discard bits leaving the byte' });
    });
  }
  add('shift-c', 'shift', 'C unsigned shift · no byte truncation', 4096, i => {
    const n = i % 256, k = Math.floor(i / 256) % 8, left = i < 2048, result = left ? n * 2 ** k : Math.floor(n / 2 ** k);
    return number(`${n}u ${left ? '<<' : '>>'} ${k} = ?`, result, 'dec', `${left ? `${n} × ${2 ** k}` : `Floor(${n} ÷ ${2 ** k})`} = ${result}. This is a 32-bit unsigned operation; do not truncate to 8 bits.`, { assumption: 'C17 · 32-bit unsigned int' });
  });
  add('shift-arithmetic', 'shift', 'Arithmetic right shift · sign extension', 2048, i => {
    const n = i % 256, k = Math.floor(i / 256), result = byte(Math.floor(signed(n) / 2 ** k));
    return number(`Arithmetic-right-shift ${bin(n)} by ${k}.`, result, 'bin', `Copy the sign bit (${n >> 7}) into the new left positions: ${bin(result)}. Signed value: ${signed(result)}.`, { assumption: '8-bit arithmetic shift model. Negative signed >> in C17 is implementation-defined.' });
  });
  facts('shift-definitions', 'shift', 'Shift definitions', [
    ['A logical right shift inserts what on the left?', '0 bits', ['1 bits', 'The sign bit', 'Random bits'], 'Logical shifts fill vacated positions with zero.'],
    ['A left shift by 1, with no bits lost, multiplies by…', '2', ['1', '4', '10'], 'Each bit moves to a place worth twice as much.'],
    ['An unsigned right shift by 1 computes…', 'Division by 2, rounded down', ['Division by 2, rounded up', 'Multiplication by 2', 'Always division by 2 exactly'], 'The dropped low bit removes any remainder.'],
    ['In C17, right-shifting a negative signed int is…', 'Implementation-defined', ['Always a logical shift', 'Always undefined', 'Always zero'], 'The implementation specifies the result; do not assume a universal sign-extending shift.'],
    ['For a 32-bit unsigned int x, is x << 32 valid?', 'No: undefined behavior', ['Yes: always 0', 'Yes: unchanged', 'Yes: 32'], 'The count must be less than the width of the promoted left operand.']
  ]);
  const logicalValues = [0, 1, 2, -1, 5, -7, 128, 255];
  for (const op of ['&&', '||']) add(`logical-${op === '&&' ? 'and' : 'or'}`, 'logic', `${op} · truth result`, 64, i => {
    const a = logicalValues[Math.floor(i / 8)], b = logicalValues[i % 8], result = Number(op === '&&' ? Boolean(a) && Boolean(b) : Boolean(a) || Boolean(b));
    return number(`${a} ${op} ${b} = ?`, result, 'dec', `Zero is false; every nonzero value is true. ${op} returns int 0 or 1. Here: ${result}.`, { assumption: 'C logical operation' });
  });
  add('logical-not', 'logic', '! · logical NOT', 256, i => { const n = i - 128; return number(`!(${n}) = ?`, Number(!n), 'dec', `! returns 1 only for zero. ${n} is ${n ? 'nonzero, so the result is 0' : 'zero, so the result is 1'}.`); });
  const operators = [['&', 'bitwise AND'], ['|', 'bitwise OR'], ['^', 'bitwise XOR'], ['~', 'bitwise NOT'], ['&&', 'logical AND'], ['||', 'logical OR'], ['!', 'logical NOT'], ['<<', 'left shift'], ['>>', 'right shift']];
  add('operator-symbol', 'logic', 'Operation name → C symbol', operators.length, i => choice(`C symbol for ${operators[i][1]}?`, operators[i][0], [operators[(i + 1) % 9][0], operators[(i + 4) % 9][0], operators[(i + 6) % 9][0]], `${operators[i][0]} is ${operators[i][1]}.`));
  add('operator-name', 'logic', 'C symbol → operation name', operators.length, i => choice(`What operation is ${operators[i][0]}?`, operators[i][1], [operators[(i + 1) % 9][1], operators[(i + 4) % 9][1], operators[(i + 6) % 9][1]], `${operators[i][0]} is ${operators[i][1]}.`));
  facts('logic-definitions', 'logic', 'Logical vs bitwise definitions', [
    ['In C, which integer values are true?', 'Every nonzero value', ['Only 1', 'Only positive values', 'Only odd values'], 'Zero is false; positive and negative nonzero values are true.'],
    ['Possible results of C && and ||?', '0 or 1', ['Any input value', 'Only 1', '−1 or 1'], 'They produce an int truth result.'],
    ['Which evaluates the right operand only if needed?', '&& and ||', ['& and |', '^ and ~', '<< and >>'], 'Logical AND and OR short-circuit.'],
    ['Which operates independently on each bit?', '&', ['&&', '!', '=='], '& is bitwise AND; && tests truth values.'],
    ['Which C expression clears bit k only?', 'x &= ~(1u << k)', ['x |= ~(1u << k)', 'x &= (1u << k)', 'x ^= (1u << k)'], 'The complemented mask has 0 at k and 1 everywhere else.'],
    ['Which C expression tests whether bit k is set?', '(x & (1u << k)) != 0', ['x | (1u << k)', 'x ^ (1u << k)', 'x && k'], 'AND isolates the target bit; != 0 converts the result to a truth value.']
  ]);
  const model = 'Use the practice type-size model in the reference below (8-bit bytes). These sizes are assumptions, not universal C guarantees.';
  const types = [['char', 1], ['signed char', 1], ['unsigned char', 1], ['short', 2], ['unsigned short', 2], ['int', 4], ['unsigned int', 4], ['long', 8], ['unsigned long', 8], ['long long', 8], ['float', 4], ['double', 8], ['int *', 8], ['char *', 8]];
  for (const unit of ['bytes', 'bits']) add(`type-${unit}`, 'types', `Type size → ${unit} · stated model`, types.length, i => number(`Size of ${types[i][0]} in ${unit}?`, types[i][1] * (unit === 'bits' ? 8 : 1), 'dec', `${types[i][0]} occupies ${types[i][1]} byte(s) × 8 = ${types[i][1] * 8} bits in this model.`, { assumption: model }));
  add('bytes-bits', 'types', 'Bytes → bits', 16, i => number(`${i + 1} byte(s) → bits?`, (i + 1) * 8, 'dec', `${i + 1} × 8 = ${(i + 1) * 8}.`, { assumption: '8 bits per byte' }));
  add('bits-bytes', 'types', 'Bits → bytes', 16, i => number(`${(i + 1) * 8} bits → bytes?`, i + 1, 'dec', `${(i + 1) * 8} ÷ 8 = ${i + 1}.`, { assumption: '8 bits per byte' }));
  add('ranges', 'types', 'Integer range endpoints', 16, i => {
    const width = [4, 8, 16, 32][Math.floor(i / 4)], kind = i % 4;
    const value = [0, 2 ** width - 1, -(2 ** (width - 1)), 2 ** (width - 1) - 1][kind];
    return number(`${kind % 2 ? 'Maximum' : 'Minimum'} ${kind < 2 ? 'unsigned' : 'two’s-complement signed'} ${width}-bit value?`, value, 'dec', `${kind < 2 ? `Unsigned: 0 through 2^${width} − 1` : `Signed: −2^${width - 1} through 2^${width - 1} − 1`}.`, { assumption: 'Integer value bits · no padding' });
  });
  add('sizeof-array', 'types', 'sizeof small arrays', 16, i => number(`int a[${i + 1}];\nWhat is sizeof(a) in bytes?`, (i + 1) * 4, 'dec', `${i + 1} elements × 4 bytes = ${(i + 1) * 4} bytes.`, { assumption: 'sizeof(int) = 4 bytes' }));
  const ascii = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'];
  for (const output of ['dec', 'hex']) add(`ascii-${output}`, 'types', `ASCII character → ${baseName[output]}`, ascii.length, i => number(`ASCII '${ascii[i]}' → ${baseName[output]} code?`, ascii[i].charCodeAt(0), output, `'${ascii[i]}' = ${ascii[i].charCodeAt(0)} = 0x${hex(ascii[i].charCodeAt(0))}.`, { assumption: 'ASCII encoding' }));
  for (const input of ['dec', 'hex']) add(`${input}-ascii`, 'types', `ASCII ${baseName[input]} → character`, ascii.length, i => ({ prompt: `ASCII ${shown(ascii[i].charCodeAt(0), input)} → character?`, answer: ascii[i], format: 'char', explanation: `${shown(ascii[i].charCodeAt(0), input)} represents '${ascii[i]}'. Letter case matters.`, assumption: 'ASCII · letters and digits only' }));
  add('unsigned-char', 'types', 'Convert to unsigned char', 512, i => { const n = i - 128; return number(`(unsigned char)(${n}) → decimal?`, byte(n), 'dec', `Reduce modulo 256: ${n} → ${byte(n)}.`, { assumption: '8-bit unsigned char' }); });
  facts('type-definitions', 'types', 'C type and sizeof definitions', [
    ['What does sizeof return?', 'A size in bytes', ['A size in bits', 'An address', 'The stored value'], 'The result has type size_t and counts C bytes.'],
    ['What is sizeof(char) in C?', '1', ['Always 8', 'Always 4', 'Depends on pointer size'], 'It is exactly one C byte. CHAR_BIT tells you how many bits that byte contains.'],
    ['Is a C byte guaranteed to have exactly 8 bits?', 'No; CHAR_BIT is at least 8', ['Yes, on every C implementation', 'No; always 16', 'Only for unsigned char'], 'This drill uses 8-bit bytes explicitly; C itself permits wider bytes.'],
    ['Is plain char always signed?', 'No; it is implementation-defined', ['Yes', 'No; always unsigned', 'It changes with the stored number'], 'Use signed char or unsigned char to specify the signedness.'],
    ['Is sizeof(int) always 4 in C?', 'No', ['Yes', 'Only for negative ints', 'Only for unsigned ints'], 'Actual type sizes depend on the implementation. This drill states a model when needed.'],
    ['What does the u in 1u specify?', 'An unsigned integer constant', ['One byte', 'A pointer', 'A Unicode character'], '1u has type unsigned int.'],
    ['Type of the ordinary C character constant \'A\'?', 'int', ['char', 'char *', 'float'], 'In C, an ordinary character constant has type int.'],
    ['8-bit unsigned char c; 32-bit int. Type of c + 1?', 'int', ['unsigned char', 'char', 'unsigned long'], 'All unsigned-char values fit in int, so c is promoted to int before addition.'],
    ['For int *p, sizeof(p) measures…', 'The pointer itself', ['The pointed-to int', 'The entire array', 'The value stored in the int'], 'Use sizeof(*p) for the pointed-to type’s size.'],
    ['What does the terminating \\0 in a C string store?', 'A zero-valued character', ['The printable digit 0', 'A null pointer', 'Two characters'], 'The terminator is one char with value zero.'],
    ['With ASCII, what does char c = \'7\'; store?', 'The character code 55', ['The integer value 7', 'The address 7', 'The value 0x7'], 'ASCII digit characters have codes 48 through 57.'],
    ['With 8-bit unsigned char c = 255, what is c + 1? (32-bit int)', '256', ['0', '−1', 'Undefined behavior'], 'c is promoted to int. The addition produces int 256; no byte conversion is requested.']
  ]);
  add('pointer-read', 'pointers', 'Read *p', 256, i => { const n = i - 128; return number(`int x = ${n};\nint *p = &x;\nWhat is *p?`, n, 'dec', `p stores the address of x. *p reads x, whose value is ${n}.`); });
  add('pointer-write', 'pointers', 'Write through *p', 256, i => { const n = i - 128; return number(`int x = 0; int *p = &x;\n*p = ${n};\nWhat is x?`, n, 'dec', `*p names x, so assigning through p changes x to ${n}.`); });
  add('pointer-array', 'pointers', 'Read one array element through p', 1024, i => {
    const n = i % 256, k = Math.floor(i / 256), values = [n, byte(n + 17), byte(n + 33), byte(n + 61)];
    return number(`int a[] = {${values.join(', ')}};\nint *p = a;\nWhat is *(p + ${k})?`, values[k], 'dec', `*(p + ${k}) is a[${k}] = ${values[k]}. Pointer steps count elements.`);
  });
  facts('pointer-definitions', 'pointers', 'Pointer symbols and meanings', [
    ['int *p = &x; What does p point to?', 'x', ['p itself', 'The value 0', 'The type int'], '&x gives x’s address; p stores that address.'],
    ['In an expression, what does &x mean?', 'Address of x', ['Value at address x', 'Multiply x', 'Declare x'], 'Unary & is the address-of operator.'],
    ['In an expression, what does *p mean?', 'The object p points to', ['The address of p', 'The size of p', 'Declare a pointer'], 'Unary * dereferences a pointer.'],
    ['In int *p;, what is p?', 'A pointer to int', ['An int value', 'An array of ints', 'A pointer to a pointer'], 'Here * is part of the pointer declaration.'],
    ['Within an int array, p + 1 advances by…', 'One int element', ['Always one byte', 'One bit', 'One pointer-sized block'], 'Pointer arithmetic uses the size of the pointed-to type.'],
    ['int x; int *p = &x; Which equals p?', '&x', ['x', '&p', 'sizeof(x)'], 'p contains x’s address.'],
    ['Is dereferencing a null pointer valid C?', 'No: undefined behavior', ['Yes: it reads 0', 'Yes: it reads NULL', 'Only for char pointers'], 'A null pointer does not point to an object you can access.'],
    ['int *p = &x; What does &p mean?', 'Address of the pointer variable p', ['Address stored in p', 'Value of x', 'Size of p'], 'p is a variable too. &p is its own address.']
  ]);

  const byId = Object.fromEntries(topics.map(t => [t.id, t]));
  function question(topicId, index) {
    const t = byId[topicId];
    if (!t || !Number.isInteger(index) || index < 0 || index >= t.size) throw new Error('Invalid question key');
    return { ...t.make(index), id: `${topicId}:${index}`, topic: topicId, index };
  }
  function parse(q, raw) {
    let s = String(raw).trim();
    if (q.format === 'text') return s;
    if (q.format === 'char') return /^'.'$/.test(s) ? s.slice(1, -1) : s;
    // Permit human-friendly digit grouping, but never silently parse partial input.
    s = s.replace(/[ _]/g, '');
    if (q.format === 'bin') return /^(?:0b)?[01]+$/i.test(s) ? parseInt(s.replace(/^0b/i, ''), 2) : null;
    if (q.format === 'hex') return /^(?:0x)?[0-9a-f]+$/i.test(s) ? parseInt(s.replace(/^0x/i, ''), 16) : null;
    return /^[+-]?\d+$/.test(s) && Number.isSafeInteger(Number(s)) ? Number(s) : null;
  }
  const correct = (q, raw) => { const parsed = parse(q, raw); return parsed !== null && parsed === (q.value === undefined ? q.answer : q.value); };
  function shuffle(items, random = Math.random) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function choices(q, random = Math.random) {
    if (q.options) return shuffle(q.options, random);
    if (q.format === 'char') return shuffle([q.answer, ...ascii.filter(c => c !== q.answer).slice(q.index % 30, q.index % 30 + 3)], random);
    const max = q.format === 'bin' || q.format === 'hex' ? 2 ** (q.width || 8) - 1 : Infinity;
    const step = q.upperFour ? 16 : 1;
    const candidates = [q.value, q.value + step, q.value - step, q.value ^ step, q.value ^ 128, 0, step, 2 * step, 3 * step];
    const values = [...new Set(candidates)].filter(n => Number.isInteger(n) && (q.upperFour ? n >= 0 && n <= 240 && n % 16 === 0 : q.format === 'dec' || (n >= 0 && n <= max))).slice(0, 4);
    return shuffle(values.map(n => q.format === 'bin' ? bin(n, q.width || 8) : q.format === 'hex' ? hex(n, q.width === 4 ? 1 : 2) : String(n)), random);
  }
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  // Affine permutations walk an entire domain without repeats, using constant storage.
  function draw(state, topicId, order = 'shuffled', random = Math.random) {
    const size = byId[topicId].size;
    let deck = state[topicId];
    if (!deck || deck.pos >= size) {
      let step = order === 'ordered' ? 1 : 1 + Math.floor(random() * Math.max(1, size - 1));
      while (gcd(step, size) !== 1) step = step % size + 1;
      deck = state[topicId] = { pos: 0, start: order === 'ordered' ? 0 : Math.floor(random() * size), step, cycle: (deck?.cycle || 0) + 1 };
    }
    const index = (deck.start + deck.step * deck.pos) % size;
    deck.pos++;
    return question(topicId, index);
  }
  return { groups, topics, byId, question, parse, correct, choices, shuffle, draw, bin, hex, signed, byte };
});
