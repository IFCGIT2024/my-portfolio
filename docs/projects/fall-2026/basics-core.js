/* Small, explicit bit models. No eval, network requests, or generated C execution. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BasicsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TOPICS = [
    { id: 'conversions', label: 'Binary / hex / decimal', skills: [
      ['bin-dec', 'Binary → decimal'], ['dec-bin', 'Decimal → binary'],
      ['bin-hex', 'Binary → hex'], ['hex-bin', 'Hex → binary'],
      ['hex-dec', 'Hex → decimal'], ['dec-hex', 'Decimal → hex'],
      ['hex-digit-dec', 'One hex digit → decimal'], ['dec-hex-digit', 'Decimal → one hex digit']] },
    { id: 'twos', label: "Two’s complement", skills: [
      ['decode', 'Read signed bits'], ['encode', 'Write signed bits'],
      ['decode-hex', 'Read signed hex'], ['encode-hex', 'Signed decimal → hex'],
      ['negate', 'Flip bits, add one'], ['definitions', 'Definitions']] },
    { id: 'bits', label: 'Bits & bytes', skills: [
      ['weight', 'Bit positions & powers of 2'], ['units', 'Bits, bytes & hex digits'],
      ['patterns', 'How many patterns?'], ['definitions', 'Definitions']] },
    { id: 'types', label: 'Type sizes & ranges', skills: [
      ['bytes', 'Type size in bytes'], ['bits', 'Type size in bits'],
      ['range', 'Signed & unsigned limits'], ['definitions', 'C type facts']] },
    { id: 'bitwise', label: 'Bitwise operators', skills: [
      ['and', 'AND  &'], ['or', 'OR  |'], ['xor', 'XOR  ^'],
      ['not', 'NOT  ~'], ['identify', 'Which operator produced this?'], ['definitions', 'Operator rules']] },
    { id: 'logical', label: 'Logical operators', skills: [
      ['and', 'Logical AND  &&'], ['or', 'Logical OR  ||'], ['not', 'Logical NOT  !'],
      ['compare', 'Bitwise or logical?'], ['definitions', 'Truth & operator rules']] },
    { id: 'shifts', label: 'Shifting', skills: [
      ['left', 'Shift a bit pattern left'], ['right', 'Logical right shift'],
      ['arithmetic', 'Arithmetic right shift'], ['c-shift', 'Simple unsigned C shifts'],
      ['definitions', 'Shift rules']] },
    { id: 'masks', label: 'Read / set / clear / toggle', skills: [
      ['make', 'Make a one-bit mask'], ['read', 'Read one bit'], ['set', 'Set one bit'],
      ['clear', 'Clear one bit'], ['toggle', 'Toggle one bit'], ['definitions', 'Mask rules']] },
    { id: 'chars', label: 'Signed / unsigned / char', skills: [
      ['signed', 'Read a signed char'], ['unsigned', 'Read an unsigned char'],
      ['cast', 'Signed → unsigned char'], ['extend', 'Sign extension: 8 → 16 bits'],
      ['truncate', 'Keep the low byte'], ['definitions', 'Char & conversion facts']] },
    { id: 'pointers', label: 'Tiny pointer questions', skills: [
      ['read', 'What is *p?'], ['address', 'What does p point to?'],
      ['array', 'Read one array element'], ['write', 'Write through *p'], ['definitions', 'Pointer symbols']] }
  ];
  // An explicitly chosen practice machine, not a claim about all C implementations.
  const TYPES = [['char', 1], ['signed char', 1], ['unsigned char', 1],
    ['short', 2], ['unsigned short', 2], ['int', 4], ['unsigned int', 4],
    ['long', 8], ['unsigned long', 8], ['long long', 8],
    ['float', 4], ['double', 8], ['int *', 8], ['char *', 8]];
  const MODEL = 'Practice machine: 8-bit bytes; char 1, short 2, int 4, long / long long 8, float 4, double 8, object pointers 8 bytes.';
  const FACTS = {
    twos: [
      ['What is two’s complement?', 'A way to represent signed integers', ['A way to store only positive integers', 'Another name for hexadecimal', 'A method that gives zero two encodings'], 'It represents negative numbers, zero, and positive numbers at a chosen bit width.'],
      ['To form the negated bit pattern, what do you do?', 'Invert every bit, then add 1', ['Invert every bit only', 'Change only the leftmost bit', 'Reverse the order of the bits'], 'Keep the original width and discard any carry beyond it.'],
      ['In two’s complement, a leftmost bit of 1 means…', 'The signed value is negative', ['The value is always −1', 'The value is odd', 'The number is unsigned'], 'The most significant bit has a negative weight; all other bit weights are positive.'],
      ['How many zero encodings does two’s complement have?', 'One', ['Two', 'None', 'One per bit'], 'All zero bits encode zero. There is no separate negative zero.'],
      ['As 8-bit two’s complement, 01111111 is…', '127', ['−1', '−127', '128'], 'The sign bit is 0. The other seven 1 bits sum to 127. −1 is 11111111.'],
      ['Can the same bits mean different signed and unsigned values?', 'Yes; the interpretation matters', ['No; bits always have one numeric value', 'Only if the bits are reversed', 'Only in hexadecimal'], 'For example, eight 1 bits mean unsigned 255 or two’s-complement −1.']
    ],
    bits: [
      ['What is a bit?', 'One binary digit: 0 or 1', ['Four binary digits', 'Eight binary digits', 'One decimal digit'], 'Binary has two possible digits: 0 and 1.'],
      ['One hexadecimal digit represents how many bits?', '4', ['2', '8', '16'], 'Four bits have 16 patterns, matching hex digits 0–9 and A–F.'],
      ['Which bit is bit 0?', 'The rightmost bit', ['The leftmost bit', 'The first bit that equals 1', 'There is no bit 0'], 'Bit indices start at zero on the right. Its weight is 2^0 = 1.'],
      ['What is a nibble?', '4 bits', ['2 bits', '8 bits', '16 bits'], 'One nibble is one hex digit, or half of an 8-bit byte.'],
      ['What base is hexadecimal?', '16', ['2', '8', '10'], 'Its place values are powers of 16. Binary uses powers of 2.'],
      ['Do leading zero bits change an unsigned value?', 'No', ['Yes, they make it negative', 'Yes, they multiply it by 2', 'Yes, they add 1'], '00000101 and 101 both have unsigned value 5. Width can still matter for signed interpretation.']
    ],
    types: [
      ['What unit does sizeof return?', 'Bytes', ['Bits', 'Hex digits', 'Decimal digits'], 'Multiply sizeof by CHAR_BIT to get the size in bits.'],
      ['What is sizeof(char) in C?', '1 byte', ['Always 8 bytes', 'Always 4 bytes', 'It depends on the character stored'], 'C defines sizeof(char) as 1. The number of bits in a byte is CHAR_BIT; this drill assumes 8.'],
      ['Is int always 32 bits in C?', 'No; its size depends on the implementation', ['Yes, always', 'No; it is always 64 bits', 'Only when its value is negative'], 'Our practice machine uses 32-bit int. Use sizeof and CHAR_BIT on a real implementation.'],
      ['Does adding unsigned change the size of int?', 'No', ['Yes, it doubles the size', 'Yes, it removes a bit', 'Yes, it adds a byte'], 'int and unsigned int have the same storage size; their value ranges differ.'],
      ['Is plain char always signed in C?', 'No; the implementation chooses', ['Yes', 'No; it is always unsigned', 'It changes with the stored character'], 'Use signed char or unsigned char when signedness matters.'],
      ['What does the u in 1u mean?', 'The literal has unsigned int type', ['The literal uses one byte', 'The literal is unary', 'The literal equals 2'], '1u has value 1 and unsigned int type. It is useful when building unsigned masks.']
    ],
    bitwise: [
      ['For one bit, AND produces 1 when…', 'Both input bits are 1', ['Either input bit is 1', 'The input bits differ', 'Both input bits are 0'], 'AND uses the & operator and works independently at each position.'],
      ['For one bit, OR produces 1 when…', 'At least one input bit is 1', ['Exactly one input bit is 1', 'Both input bits are 0', 'The input bits differ only'], 'OR uses |. In particular, 1 | 1 is 1.'],
      ['For one bit, XOR produces 1 when…', 'The input bits differ', ['Both input bits are 1', 'The input bits match', 'At least one input bit is 1'], 'XOR uses ^. 1 ^ 1 and 0 ^ 0 are both 0.'],
      ['Which operator flips every bit?', '~', ['!', '&', '&&'], '~ is bitwise complement. ! instead tests whether a value is zero.']
    ],
    logical: [
      ['Which integer values are true in C conditions?', 'Every nonzero value', ['Only 1', 'Only positive values', 'Only odd values'], 'Zero is false. Positive and negative nonzero values are true.'],
      ['What values can &&, || and ! produce?', '0 or 1', ['Any integer', 'Only −1 or 1', 'Only the original operands'], 'C logical operators return an int: 0 for false or 1 for true.'],
      ['Which is logical AND?', '&&', ['&', '|', '^'], '&& tests truth values. & combines corresponding bits.'],
      ['Which is logical OR?', '||', ['|', '&', '~'], '|| tests whether at least one operand is nonzero.'],
      ['Which operators short-circuit in C?', '&& and ||', ['& and |', '^ and ~', '& and &&'], '&& skips the right operand when the left is false; || skips it when the left is true.']
    ],
    shifts: [
      ['A logical right shift fills new leftmost positions with…', '0', ['1', 'The sign bit', 'The dropped bits'], 'Bits move right and low bits fall off. Zeros enter from the left.'],
      ['An arithmetic right shift fills new leftmost positions with…', 'Copies of the original sign bit', ['Always 0', 'Always 1', 'The dropped bits'], 'This preserves the sign of a two’s-complement value.'],
      ['With no bits lost, shifting left by 1 does what?', 'Multiplies the unsigned value by 2', ['Divides it by 2', 'Adds 1', 'Multiplies it by 10'], 'Each bit moves to the next higher power-of-two position.'],
      ['Is a right shift of a negative signed integer fully specified in C17?', 'No; the result is implementation-defined', ['Yes; it always fills with zeros', 'Yes; it always fills with ones', 'Yes; it always produces zero'], 'Our arithmetic-right exercises explicitly specify sign filling as a bit-pattern operation.'],
      ['For 32-bit unsigned int, which shift count is invalid?', '32', ['0', '1', '31'], 'In C, the shift count must be nonnegative and less than the width of the promoted left operand.']
    ],
    chars: [
      ['Can an 8-bit unsigned char store −1 as a value?', 'No; its range is 0 to 255', ['Yes; its range is −128 to 127', 'Yes; it can store any integer', 'Only if its name is char'], 'Converting −1 to an 8-bit unsigned char produces 255, not a negative value.'],
      ['On this machine, what happens to an unsigned byte when widened?', 'New high bits are 0', ['New high bits are 1', 'The old bits are reversed', 'The value doubles'], 'Zero extension preserves the unsigned value.'],
      ['To widen a negative two’s-complement value, fill new high bits with…', '1', ['0', 'Alternating 0 and 1', 'The lowest bit'], 'Sign extension copies the sign bit, preserving the negative value.'],
      ['When keeping only the low 8 bits, which bits remain?', 'The rightmost 8 bits', ['The leftmost 8 bits', 'Every second bit', 'Only the sign bit'], 'Low means least significant: the bits on the right in the usual written form.'],
      ['For signed char c = 7, what type is c promoted to in c + 1 here?', 'int', ['signed char', 'unsigned char', 'double'], 'With 32-bit int and 8-bit char, int represents every char value, so the integer promotion is to int.']
    ],
    pointers: [
      ['In an expression, what does *p do when p is a valid pointer to an int?', 'Accesses the int that p points to', ['Returns the address of p itself', 'Multiplies p by 2', 'Declares another pointer'], '* dereferences a pointer. In a declaration such as int *p, it instead helps declare the pointer type.'],
      ['What does &x give you?', 'The address of x', ['The value stored in x', 'Twice the value of x', 'The number of bytes in x'], 'The unary address-of operator & produces a pointer to x.'],
      ['In int *p, what is the type of p?', 'Pointer to int', ['int', 'An array of int', 'Pointer to pointer to int'], 'p stores an address of an int. *p accesses that int once p points to a valid object.'],
      ['After int *p = &x, does *p mean x’s address or its stored value?', 'Its stored value', ['Its address', 'The address of p', 'Always zero'], 'p is the pointer; *p accesses the object x.'],
      ['Can a null pointer safely be dereferenced?', 'No', ['Yes; it reads zero', 'Yes; it reads the first array item', 'Only if the type is int'], 'Dereferencing a null pointer is undefined behavior.']
    ],
    masks: [
      ['For unsigned x, which sets bit k?', 'x |= (1u << k)', ['x &= (1u << k)', 'x ^= (1u << k)', 'x &= ~(1u << k)'], 'OR with 1 sets the selected bit; OR with 0 preserves every other bit. Assume 0 ≤ k < 32.'],
      ['For unsigned x, which clears bit k?', 'x &= ~(1u << k)', ['x |= ~(1u << k)', 'x ^= (1u << k)', 'x &= (1u << k)'], 'The complemented mask has 0 at k and 1 elsewhere. AND clears only k. Assume 0 ≤ k < 32.'],
      ['For unsigned x, which toggles bit k?', 'x ^= (1u << k)', ['x |= (1u << k)', 'x &= ~(1u << k)', 'x >>= k'], 'XOR with 1 flips the selected bit; XOR with 0 preserves all others. Assume 0 ≤ k < 32.'],
      ['For unsigned x, which reads bit k as 0 or 1?', '(x >> k) & 1u', ['x | (1u << k)', 'x ^ (1u << k)', 'x & ~(1u << k)'], 'Shift the selected bit into position 0, then keep only that bit. Assume 0 ≤ k < 32.']
    ]
  };
  const pick = (items, rng) => items[Math.floor(rng() * items.length)];
  const int = (max, rng) => Math.floor(rng() * max);
  const bits = (value, width) => Number(value).toString(2).padStart(width, '0');
  const hex = (value, width) => '0x' + Number(value).toString(16).toUpperCase().padStart(width / 4, '0');
  const group = (s) => s.match(/.{1,4}/g).join(' ');
  const signed = (value, width) => value >= 2 ** (width - 1) ? value - 2 ** width : value;
  function sample(width, rng) {
    const max = 2 ** width - 1;
    return rng() < 0.3 ? pick([0, 1, 2, 2 ** (width - 1) - 1, 2 ** (width - 1), max - 1, max], rng) : int(max + 1, rng);
  }
  function shuffle(values, rng) {
    const out = [...values];
    for (let i = out.length - 1; i > 0; --i) {
      const j = int(i + 1, rng); [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  function makeQuestion(settings = {}, rng = Math.random) {
    const topic = TOPICS.find(t => t.id === settings.topic) || pick(TOPICS, rng);
    const skill = topic.skills.some(([id]) => id === settings.skill) ? settings.skill : pick(topic.skills, rng)[0];
    const width = skill.includes('hex-digit') ? 4 : topic.id === 'chars' ? (skill === 'extend' ? 16 : 8) : [4, 8, 16].includes(Number(settings.width)) ? Number(settings.width) : 8;
    const q = { topic: topic.id, topicLabel: topic.label, skill, width, format: 'decimal',
      prompt: '', display: '', context: '', answer: '', explanation: '', hint: '', meta: {} };
    const max = 2 ** width - 1;
    const a = Number.isInteger(settings.value) && settings.value >= 0 && settings.value <= max ? settings.value : sample(width, rng);
    const b = sample(width, rng);
    const k = int(width, rng);
    const set = (prompt, display, answer, format, explanation, context, hint) => {
      Object.assign(q, { prompt, display, answer: String(answer), format, explanation, context, hint });
    };
    if (skill === 'definitions') {
      const [prompt, answer, wrong, explanation] = Number.isInteger(settings.factIndex) ? FACTS[topic.id][settings.factIndex % FACTS[topic.id].length] : pick(FACTS[topic.id], rng);
      set(prompt, '', answer, 'choice', explanation, 'Quick definition', 'Choose the rule that applies.');
      q.choices = shuffle([answer, ...wrong], rng);
    } else if (topic.id === 'conversions') {
      const [from, to] = skill === 'hex-digit-dec' ? ['hex', 'dec'] : skill === 'dec-hex-digit' ? ['dec', 'hex'] : skill.split('-');
      const repr = {bin: group(bits(a, width)), dec: String(a), hex: hex(a, width)};
      const names = {bin: 'binary', dec: 'decimal', hex: 'hexadecimal'};
      const terms = [...bits(a, width)].flatMap((bit, i) => bit === '1' ? [String(2 ** (width - i - 1))] : []);
      const hexPairs = [...hex(a, width).slice(2)].map(d => `${d} = ${bits(parseInt(d, 16), 4)}`).join('; ');
      set(`Convert ${names[from]} to ${names[to]}.`, repr[from],
        to === 'bin' ? bits(a, width) : to === 'hex' ? hex(a, width) : a,
        to === 'bin' ? 'binary' : to === 'hex' ? 'hex' : 'decimal',
        `${group(bits(a, width))}₂ = ${a}₁₀ = ${hex(a, width)}. ` +
          (from === 'hex' || to === 'hex' ? hexPairs + '.' : `${terms.length ? terms.join(' + ') : '0'} = ${a}.`),
        `${width}-bit unsigned value`, to === 'hex' || from === 'hex' ? 'One hex digit corresponds to four bits. Group from the right.' : 'From the right, bit weights are 1, 2, 4, 8, 16, 32, 64, 128…');
      q.meta = {a, from, to};
    } else if (topic.id === 'twos') {
      const value = signed(a, width);
      const base = 2 ** width;
      if (skill === 'decode' || skill === 'decode-hex') {
        set(skill === 'decode' ? 'Read these signed bits in decimal.' : 'Read this signed hex pattern in decimal.', skill === 'decode' ? group(bits(a, width)) : hex(a, width), value, 'decimal',
          a >= base / 2 ? `The sign bit is 1: read as unsigned ${a}, then subtract ${base}. ${a} − ${base} = ${value}.` : `The sign bit is 0: the value is ${a}, just as in unsigned binary.`,
          `${width}-bit two’s complement`, `If the leftmost bit is 1, subtract ${base} from the unsigned value.`);
      } else if (skill === 'encode' || skill === 'encode-hex') {
        set(`Write this signed value in ${skill === 'encode' ? 'binary' : 'hex'}.`, String(value), skill === 'encode' ? bits(a, width) : hex(a, width), skill === 'encode' ? 'binary' : 'hex',
          value < 0 ? `${base} + (${value}) = ${a}; write ${a} in ${width} bits: ${group(bits(a, width))}.` : `${value} is nonnegative, so write ordinary binary with a leading sign bit of 0: ${group(bits(a, width))}.`,
          `${width}-bit two’s complement`, 'For a negative value, write its positive magnitude, invert the bits, then add 1 within the chosen width.');
      } else {
        const result = (base - a) % base;
        set('Invert every bit, then add 1.', group(bits(a, width)), bits(result, width), 'binary',
          `Invert: ${group(bits(max - a, width))}. Add 1, keeping ${width} bits: ${group(bits(result, width))}.` +
          (a === base / 2 ? ` This minimum signed value keeps its own pattern; its positive counterpart is outside the ${width}-bit signed range.` : a === 0 ? ' Discard the final carry; zero stays zero.' : ` This encodes ${-value}.`),
          `${width}-bit pattern operation; discard the carry beyond ${width} bits`, 'Flip 0 ↔ 1 first. Then add 1 from the right.');
      }
      q.meta = {a, value};
    } else if (topic.id === 'bits') {
      if (skill === 'weight') {
        set(`What is the unsigned weight of bit ${k}?`, `2^${k}`, 2 ** k, 'decimal',
          `Bit ${k} has weight 2^${k} = ${2 ** k}. Bit 0 is the rightmost bit.`,
          'Bit indices start at 0', 'Start with 2^0 = 1; double for each position to the left.');
        q.meta = {k};
      } else if (skill === 'patterns') {
        const n = pick([1, 2, 3, 4, 5, 6, 7, 8], rng);
        set(`How many distinct patterns fit in ${n} bits?`, '', 2 ** n, 'decimal',
          `Each bit has 2 choices, so ${n} bits give 2^${n} = ${2 ** n} patterns. The largest unsigned value is one less: ${2 ** n - 1}.`,
          'Count all patterns, including all zeros', 'Number of patterns = 2^(number of bits).');
        q.meta = {n};
      } else {
        const n = pick([1, 2, 4, 8], rng);
        const variant = int(3, rng);
        const prompt = [`How many bits are in ${n} byte${n === 1 ? '' : 's'}?`, `How many bytes are in ${n * 8} bits?`, `How many hex digits represent ${n * 8} bits?`][variant];
        const ans = [n * 8, n, n * 2][variant];
        set(prompt, '', ans, 'decimal', 'One byte = 8 bits = 2 hex digits in this drill. ' + `${n} byte${n === 1 ? '' : 's'} = ${n * 8} bits = ${n * 2} hex digits.`,
          'Assume 8-bit bytes', 'One hex digit = 4 bits. One byte = 8 bits.');
        q.meta = {n, variant};
      }
    } else if (topic.id === 'types') {
      if (skill === 'range') {
        const variant = int(3, rng);
        const value = [max, -(2 ** (width - 1)), 2 ** (width - 1) - 1][variant];
        set([`Largest ${width}-bit unsigned value?`, `Smallest ${width}-bit signed value?`, `Largest ${width}-bit signed value?`][variant], '', value, 'decimal',
          `Unsigned: 0 to ${max}. Two’s complement: ${-(2 ** (width - 1))} to ${2 ** (width - 1) - 1}.`,
          `${width} value bits; signed values use two’s complement`, 'Unsigned maximum: 2^n − 1. Signed range: −2^(n−1) through 2^(n−1) − 1.');
        q.meta = {variant};
      } else {
        const [type, bytes] = pick(TYPES, rng);
        set(skill === 'bytes' ? 'How many bytes does this type occupy?' : 'How many bits does this type occupy?', type,
          skill === 'bytes' ? bytes : bytes * 8, 'decimal', `${type} occupies ${bytes} byte${bytes === 1 ? '' : 's'} = ${bytes * 8} bits on the practice machine.`,
          'Use the practice machine sizes (see Quick reference).', 'char 1, short 2, int / float 4, long / long long / double / object pointers 8 bytes.');
        q.meta = {type, bytes};
      }
    } else if (topic.id === 'bitwise' && skill === 'identify') {
      const x = a || 1;
      // Require both shared and different bits: AND, OR and XOR then have distinct results.
      const y = (x & b) !== 0 && x !== b ? b : x === 1 ? 3 : x ^ 1;
      const ops = [['& (AND)', x & y], ['| (OR)', x | y], ['^ (XOR)', x ^ y]];
      const [answer, result] = pick(ops, rng);
      set('Which bitwise operator fills the blank?', `${hex(x, width)}  ?  ${hex(y, width)}\n= ${group(bits(result, width))} (binary)`, answer, 'choice',
        `${group(bits(x, width))} ${answer[0]} ${group(bits(y, width))} = ${group(bits(result, width))}. AND keeps shared 1s; OR keeps any 1s; XOR keeps differing bits.`,
        `${width}-bit patterns; operands in hex, result in binary`, 'Convert each hex digit to four bits, then compare the positions.');
      q.choices = shuffle([...ops.map(([name]) => name), 'None of these three operators'], rng);
      q.meta = {x, y, result};
    } else if (topic.id === 'bitwise') {
      const op = {and: '&', or: '|', xor: '^', not: '~'}[skill];
      const answer = {and: a & b, or: a | b, xor: a ^ b, not: max - a}[skill];
      const rule = {and: 'AND: 1 only when both bits are 1.', or: 'OR: 1 when at least one bit is 1.', xor: 'XOR: 1 when the bits differ.', not: 'Complement: change every 0 to 1 and every 1 to 0.'}[skill];
      set('Give the resulting bit pattern.', skill === 'not' ? `~ ${group(bits(a, width))}` : `${group(bits(a, width))}\n${op} ${group(bits(b, width))}`,
        bits(answer, width), 'binary', `${rule} Result: ${group(bits(answer, width))}.`,
        `${width}-bit pattern operation${skill === 'not' ? '; flip only the displayed bits' : ''}`, rule);
      q.meta = {a, b, op};
    } else if (topic.id === 'logical') {
      const x = pick([0, 0, 1, 2, 3, 4, -1, -7], rng);
      const y = pick([0, 0, 1, 2, 3, 4, -1, -7], rng);
      if (skill === 'compare') {
        const x2 = pick([2, 4, 6, 8], rng); const y2 = pick([1, 2, 3, 5], rng);
        const op = pick(['&', '&&', '|', '||'], rng);
        const answer = {'&': x2 & y2, '&&': 1, '|': x2 | y2, '||': 1}[op];
        set('What is the decimal result?', `${x2} ${op} ${y2}`, answer, 'decimal',
          op.length === 2 ? 'Both operands are nonzero. This logical expression is true and returns 1.' : `${bits(x2, 4)} ${op} ${bits(y2, 4)} = ${bits(answer, 4)}, which is ${answer}. A single ${op} combines bits.`,
          'C integer expression', 'One & or | combines bits; two && or || test truth.');
        q.meta = {x: x2, y: y2, op};
      } else {
        const op = {and: '&&', or: '||', not: '!'}[skill];
        const answer = skill === 'and' ? Number(x !== 0 && y !== 0) : skill === 'or' ? Number(x !== 0 || y !== 0) : Number(x === 0);
        set('What is the result: 0 or 1?', skill === 'not' ? `!(${x})` : `(${x}) ${op} (${y})`, answer, 'decimal',
          `Zero is false; every nonzero value is true. ${skill === 'not' ? `${x} is ${x === 0 ? 'false' : 'true'}; ! reverses that truth value.` : `${x} is ${x === 0 ? 'false' : 'true'} and ${y} is ${y === 0 ? 'false' : 'true'}.`} Result: ${answer}.`,
          'C logical operator; result type is int', '&& needs both true. || needs either true. ! reverses truth.');
        q.meta = {x, y, op};
      }
    } else if (topic.id === 'shifts') {
      const count = 1 + int(Math.min(3, width - 1), rng);
      if (skill === 'c-shift') {
        const value = int(32, rng); const left = rng() < 0.5;
        const answer = left ? value * 2 ** count : Math.floor(value / 2 ** count);
        set('What is the decimal result?', `${value}u ${left ? '<<' : '>>'} ${count}`, answer, 'decimal',
          left ? `${value} × 2^${count} = ${answer}. No bits overflow the 32-bit unsigned int.` : `Divide ${value} by 2^${count}, discarding the remainder: ${answer}.`,
          'C: 32-bit unsigned int', 'Left shift multiplies by a power of 2 here. Unsigned right shift divides and drops the remainder.');
        q.meta = {a: value, count, left};
      } else {
        const answer = skill === 'left' ? (a * 2 ** count) % (max + 1) : skill === 'right' ? Math.floor(a / 2 ** count) : ((Math.floor(signed(a, width) / 2 ** count) % (max + 1)) + max + 1) % (max + 1);
        const action = {left: 'Shift left', right: 'Logical right shift', arithmetic: 'Arithmetic right shift'}[skill];
        const fill = skill === 'arithmetic' ? bits(a, width)[0] : '0';
        set(`${action} by ${count}. Give the bits.`, group(bits(a, width)), bits(answer, width), 'binary',
          `Move all bits ${count} place${count === 1 ? '' : 's'} ${skill === 'left' ? 'left' : 'right'}. Fill from the ${skill === 'left' ? 'right' : 'left'} with ${fill}; discard bits that fall off. Result: ${group(bits(answer, width))}.`,
          `Fixed ${width}-bit pattern; ${skill === 'arithmetic' ? 'copy the sign bit' : 'fill with zeros'}; discard shifted-out bits`,
          skill === 'arithmetic' ? 'Repeat the original leftmost bit as you move right.' : 'Move the bits, fill with zeros, and keep the same width.');
        q.meta = {a, count};
      }
    } else if (topic.id === 'chars') {
      const byte = a % 256;
      const value = signed(byte, 8);
      const context = 'C17 practice machine: 8-bit bytes, two’s-complement signed char, 32-bit int';
      if (skill === 'signed' || skill === 'unsigned') {
        const isSigned = skill === 'signed';
        set('What decimal value does this byte represent?', group(bits(byte, 8)), isSigned ? value : byte, 'decimal',
          `${group(bits(byte, 8))} means unsigned ${byte} or signed ${value}. ${isSigned && byte >= 128 ? `Subtract 256 from ${byte}.` : 'Use the stated signedness.'}`,
          `8-bit ${isSigned ? 'signed' : 'unsigned'} char${isSigned ? ' · two’s complement' : ''}`, isSigned ? 'If bit 7 is 1, subtract 256 from the unsigned value.' : 'Every bit has a positive weight: 128, 64, 32, 16, 8, 4, 2, 1.');
      } else if (skill === 'cast') {
        set('What decimal value is in u?', `signed char c = ${value};\nunsigned char u = c;`, byte, 'decimal',
          value < 0 ? `Conversion to unsigned char reduces modulo 256: ${value} + 256 = ${byte}.` : `${value} is already in range and stays ${byte}.`, context, 'An 8-bit unsigned char holds 0…255. Add 256 to a negative signed-char value.');
      } else if (skill === 'extend') {
        const result = value < 0 ? value + 65536 : value;
        set('Sign-extend this 8-bit pattern to 16 bits.', group(bits(byte, 8)), bits(result, 16), 'binary',
          `Copy the sign bit (${bits(byte, 8)[0]}) into the eight new positions: ${group(bits(result, 16))}. The signed value stays ${value}.`,
          'Two’s-complement bit patterns; answer in 16 bits', 'Repeat the original leftmost bit in every new high position.');
      } else {
        const full = int(256, rng) * 256 + byte;
        set('Keep the low 8 bits. What is the unsigned decimal value?', hex(full, 16), byte, 'decimal',
          `The last two hex digits are ${hex(byte, 8)}, which is ${byte}. The upper byte is discarded.`,
          '16-bit pattern → 8-bit unsigned value', 'Keep the last two hex digits, then convert them to decimal.');
        q.meta.full = full;
      }
      Object.assign(q.meta, {byte, value});
    } else if (topic.id === 'pointers') {
      const value = int(41, rng) - 20;
      const other = int(41, rng) - 20;
      const name = pick(['x', 'value', 'count', 'n'], rng);
      if (skill === 'read') {
        set('What value is *p?', `int ${name} = ${value};\nint *p = &${name};`, value, 'decimal', `p points to ${name}; *p reads the value ${value}.`, 'C; p points to a valid int', '* follows the stored pointer to the int.');
      } else if (skill === 'address') {
        set('Which object does p point to?', `int ${name} = ${value};\nint *p = &${name};`, name, 'choice', `&${name} is the address of ${name}. Assigning it to p makes p point to ${name}.`, 'C; identify the object, not a numeric address', '& means “address of” here.');
        q.choices = shuffle([name, 'p itself', 'An unnamed copy of the int', 'No object (null)'], rng);
      } else if (skill === 'write') {
        set(`What value is now in ${name}?`, `int ${name} = ${value};\nint *p = &${name};\n*p = ${other};`, other, 'decimal', `*p refers to ${name}, so writing through *p changes ${name} to ${other}.`, 'C; follow one pointer', 'Changing *p changes the object p points to.');
      } else {
        const array = [value, other, int(41, rng) - 20]; const index = int(3, rng);
        set('What value is *p?', `int a[] = {${array.join(', ')}};\nint *p = &a[${index}];`, array[index], 'decimal', `Array indices start at 0. p points to a[${index}], whose value is ${array[index]}.`, 'C; all pointers refer to valid array elements', 'Read the element with the indicated index; the first index is 0.');
        q.meta = {array, index};
      }
      Object.assign(q.meta, {value, other, name});
    } else if (topic.id === 'masks') {
      const mask = 2 ** k;
      const answer = {make: mask, read: Math.floor(a / mask) % 2, set: a | mask, clear: a & (max - mask), toggle: a ^ mask}[skill];
      const prompt = {make: `Write a mask with only bit ${k} set.`, read: `What is bit ${k}: 0 or 1?`, set: `Set bit ${k} to 1. Give the bits.`, clear: `Clear bit ${k} to 0. Give the bits.`, toggle: `Toggle bit ${k}. Give the bits.`}[skill];
      const rule = {make: `1u << ${k}`, read: `(x >> ${k}) & 1u`, set: `x | (1u << ${k})`, clear: `x & ~(1u << ${k})`, toggle: `x ^ (1u << ${k})`}[skill];
      set(prompt, skill === 'make' ? '' : group(bits(a, width)), skill === 'read' ? answer : bits(answer, width), skill === 'read' ? 'decimal' : 'binary',
        `Bit ${k} has weight ${mask}; its mask is ${group(bits(mask, width))}. Use ${rule}. Result: ${skill === 'read' ? answer : group(bits(answer, width))}.`,
        `${width}-bit pattern; bit 0 is on the right; preserve other bits`, 'Set: OR. Clear: AND with the inverted mask. Toggle: XOR. Count positions from 0 on the right.');
      q.meta = {a, k};
    }
    // A focused bit operation can be practised with any input/output base.
    if (['bitwise', 'shifts', 'masks'].includes(q.topic) && !['definitions', 'identify', 'c-shift'].includes(skill)) {
      const allowed = ['binary', 'hex', 'decimal'];
      const inputBase = settings.inputBase === 'mixed' ? pick(allowed, rng) : allowed.includes(settings.inputBase) ? settings.inputBase : 'binary';
      const outputBase = settings.outputBase === 'mixed' ? pick(allowed, rng) : allowed.includes(settings.outputBase) ? settings.outputBase : 'binary';
      const repr = value => inputBase === 'binary' ? group(bits(value, width)) : inputBase === 'hex' ? hex(value, width) : String(value);
      if (q.topic === 'bitwise') q.display = skill === 'not' ? `~ ${repr(a)}` : `${repr(a)}\n${q.meta.op} ${repr(b)}`;
      else if (skill !== 'make') q.display = repr(a);
      if (q.format === 'binary') {
        const value = Number.parseInt(q.answer, 2);
        q.answer = outputBase === 'binary' ? q.answer : outputBase === 'hex' ? hex(value, width) : String(value);
        q.format = outputBase;
        q.prompt = q.prompt.replace('Give the resulting bit pattern.', `Give the result in ${outputBase}.`).replace('Give the bits.', `Answer in ${outputBase}.`);
        if (skill === 'make') q.prompt += ` Answer in ${outputBase}.`;
      }
      q.context += ` · Input: ${inputBase}${inputBase === 'decimal' ? ' (unsigned pattern value)' : ''}`;
    }
    q.id = [q.topic, q.skill, width, q.prompt, q.display, q.format, q.answer].join('|');
    return q;
  }
  function parseAnswer(raw, format, width) {
    let s = String(raw).trim().replace(/−/g, '-');
    if (format === 'choice') return s;
    if (format === 'binary' || format === 'hex') s = s.replace(/[\s_]/g, '');
    if (format === 'binary') {
      s = s.replace(/^0b/i, '');
      if (!/^[01]+$/.test(s)) return null;
      s = BigInt('0b' + s);
      return s < 2n ** BigInt(width) ? s : null;
    }
    if (format === 'hex') {
      s = s.replace(/^0x/i, '');
      if (!/^[0-9a-f]+$/i.test(s)) return null;
      s = BigInt('0x' + s);
      return s < 2n ** BigInt(width) ? s : null;
    }
    if (!/^[+-]?\d+$/.test(s)) return null;
    return BigInt(s);
  }
  function grade(q, raw) {
    const actual = parseAnswer(raw, q.format, q.width);
    if (actual === null || (q.format === 'choice' && !q.choices.includes(actual))) return {valid: false, correct: false};
    return {valid: true, correct: actual === parseAnswer(q.answer, q.format, q.width)};
  }
  // Full-cycle permutations: odd strides visit every value modulo 2^width exactly once.
  // Tiny saved state allows 256-value byte passes without storing a question bank.
  function createGenerator(snapshot = {}, rng = Math.random) {
    const decks = {};
    for (const [key, d] of Object.entries(snapshot || {})) {
      if (d && [16, 256, 65536].includes(d.size) && Number.isInteger(d.cursor) && d.cursor >= 0 && d.cursor <= d.size && Number.isInteger(d.stride) && d.stride > 0 && d.stride < d.size && d.stride % 2 === 1 && Number.isInteger(d.offset) && d.offset >= 0 && d.offset < d.size && Number.isInteger(d.pass) && d.pass > 0) decks[key] = {...d};
    }
    const bags = {};
    function bag(key, items) {
      if (!bags[key]?.length) bags[key] = shuffle(items, rng);
      return bags[key].pop();
    }
    function next(settings) {
      const topic = TOPICS.find(t => t.id === settings.topic) || bag('topics', TOPICS);
      const skill = topic.skills.some(([id]) => id === settings.skill) ? settings.skill : bag(topic.id, topic.skills)[0];
      const opts = {...settings, topic: topic.id, skill};
      let coverage;
      if (['conversions', 'twos', 'chars'].includes(topic.id) && skill !== 'definitions') {
        const width = skill.includes('hex-digit') ? 4 : topic.id === 'chars' ? 8 : [4, 8, 16].includes(Number(settings.width)) ? Number(settings.width) : 8;
        const size = 2 ** width;
        const key = `${topic.id}:${skill}:${width}`;
        let d = decks[key];
        if (!d || d.cursor === size) {
          d = decks[key] = {size, cursor: 0, stride: 2 * int(size / 2, rng) + 1, offset: int(size, rng), pass: d ? d.pass + 1 : 1};
        }
        opts.value = (d.stride * d.cursor + d.offset) % size;
        d.cursor++;
        coverage = {shown: d.cursor, total: size, pass: d.pass};
      }
      if (skill === 'definitions') opts.factIndex = bag(`facts:${topic.id}`, FACTS[topic.id].map((_, i) => i));
      const q = makeQuestion(opts, rng);
      if (coverage) q.coverage = coverage;
      return q;
    }
    return {next, snapshot: () => JSON.parse(JSON.stringify(decks))};
  }
  return {TOPICS, TYPES, MODEL, FACTS, makeQuestion, createGenerator, grade, parseAnswer, bits, hex, signed};
});
