/* A deliberately bounded IA-32 teaching interpreter. No eval, native code, or network. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AssemblyEngine = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const REGISTERS = new Set(['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp', 'esp']);
  const SYMBOL = /^[A-Za-z_.$][\w.$]*$/;
  const NUMBER = /^[+-]?(?:0x[\da-f]+|0b[01]+|\d+)$/i;
  const ALIASES = {jz:'je', jnz:'jne', jnle:'jg', jnl:'jge', jnge:'jl', jng:'jle', jc:'jb', jnae:'jb', jnc:'jae', jnb:'jae', jna:'jbe', jnbe:'ja'};
  const ARITY = {mov:[2], lea:[2], add:[2], sub:[2], imul:[2,3], cmp:[2], test:[2], and:[2], or:[2], xor:[2], neg:[1], inc:[1], dec:[1], not:[1], nop:[0], jmp:[1], je:[1], jne:[1], jg:[1], jge:[1], jl:[1], jle:[1], js:[1], jns:[1], jo:[1], jno:[1], ja:[1], jae:[1], jb:[1], jbe:[1]};
  class AssemblyError extends Error {
    constructor(message, line) { super(line ? `Line ${line}: ${message}` : message); this.name = 'AssemblyError'; this.line = line; }
  }
  const fail = (message, line) => { throw new AssemblyError(message, line); };
  function integer(text) {
    const s = String(text).trim();
    if (!NUMBER.test(s)) fail(`Invalid integer "${s}".`);
    const sign = s[0] === '-' ? -1 : 1;
    const value = sign * Number(s.replace(/^[+-]/, ''));
    if (!Number.isSafeInteger(value) || value < -2147483648 || value > 4294967295) fail(`Integer "${s}" is outside the 32-bit range.`);
    return value;
  }
  function register(text) {
    const name = text.replace(/^%/, '').toLowerCase();
    if (!REGISTERS.has(name)) fail(`Unsupported register "${text}". Use a 32-bit register such as %eax.`);
    return name;
  }
  function expression(text) {
    if (NUMBER.test(text)) return {value:integer(text)};
    const m = text.match(/^([A-Za-z_.$][\w.$]*)(?:([+-])((?:0x[\da-f]+|0b[01]+|\d+)))?$/i);
    if (!m) fail(`Invalid address or constant "${text}".`);
    return {symbol:m[1], offset:m[2] ? integer(m[2] + m[3]) : 0};
  }
  function splitOperands(text) {
    if (!text.trim()) return [];
    let depth = 0, start = 0;
    const parts = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '(') depth++;
      if (text[i] === ')') depth--;
      if (depth < 0 || depth > 1) fail('Unbalanced or nested address parentheses.');
      if (text[i] === ',' && depth === 0) { parts.push(text.slice(start,i).trim()); start = i+1; }
    }
    if (depth) fail('Unclosed address parenthesis.');
    parts.push(text.slice(start).trim());
    if (parts.some(p => !p)) fail('An operand is missing.');
    return parts;
  }
  function operand(raw) {
    const text = raw.replace(/\s+/g, '');
    if (text.startsWith('$')) return {kind:'imm', expr:expression(text.slice(1)), text};
    if (text.startsWith('%')) return {kind:'reg', name:register(text), text};
    if (!text.includes('(')) return {kind:'mem', expr:expression(text), text};
    const m = text.match(/^([^()]*)\(([^()]*)\)$/);
    if (!m) fail(`Invalid memory operand "${raw}".`);
    // GNU as accepts (symbol) as well as symbol.
    if (!m[1] && SYMBOL.test(m[2])) return {kind:'mem', expr:expression(m[2]), text};
    const fields = m[2].split(',');
    if (fields.length > 3 || (!fields[0] && !fields[1])) fail(`Invalid address "${raw}".`);
    const regField = s => { if (!s.startsWith('%')) fail('Address registers need a % prefix.'); return register(s); };
    const base = fields[0] ? regField(fields[0]) : null;
    const index = fields[1] ? regField(fields[1]) : null;
    if (index === 'esp') fail('%esp cannot be an index register.');
    const scale = fields[2] ? integer(fields[2]) : 1;
    if (![1,2,4,8].includes(scale) || (fields.length === 3 && !index)) fail('An index scale must be 1, 2, 4, or 8 and needs an index register.');
    return {kind:'mem', expr:expression(m[1] || '0'), base, index, scale, text};
  }
  function validateInstruction(op, args) {
    if (!ARITY[op].includes(args.length)) fail(`${op} expects ${ARITY[op].join(' or ')} operand(s), received ${args.length}.`);
    if (op.startsWith('j') || op === 'nop') return;
    const dest = args[args.length-1];
    if (dest.kind === 'imm') fail('An immediate value cannot be a destination.');
    if (args.filter(a => a.kind === 'mem').length > 1) fail('Memory-to-memory instructions are not supported by these x86 forms. Use a register between memory locations.');
    if (op === 'lea' && (args[0].kind !== 'mem' || dest.kind !== 'reg')) fail('lea requires an address and a register destination.');
    if (op === 'imul' && (dest.kind !== 'reg' || (args.length === 3 && (args[0].kind !== 'imm' || args[1].kind === 'imm')))) fail('Use imul source, register or imul $constant, source, register.');
    if (op === 'test' && args[0].kind === 'mem' && dest.kind === 'reg') fail('For test with memory, use test register, memory (or load memory into a register).');
  }
  function parse(code) {
    if (typeof code !== 'string' || code.length > 50000) fail('Enter a program of at most 50,000 characters.');
    const instructions = [], labels = new Map();
    const lines = code.split(/\r?\n/);
    if (lines.length > 1000) fail('Programs are limited to 1,000 lines.');
    lines.forEach((source, i) => {
      const line = i+1;
      // AT&T/GAS: # comments; // also accepted. Semicolon separates instructions.
      const clean = source.replace(/#.*$|\/\/.*$/g, '');
      for (let part of clean.split(';')) {
        part = part.trim(); if (!part) continue;
        try {
          let match;
          while ((match = part.match(/^([A-Za-z_.$][\w.$]*):\s*/))) {
            if (labels.has(match[1])) fail(`Duplicate label "${match[1]}".`);
            labels.set(match[1], instructions.length);
            part = part.slice(match[0].length);
          }
          if (!part) continue;
          const m = part.match(/^(\S+)(?:\s+(.*))?$/);
          let op = m[1].toLowerCase();
          if (!Object.hasOwn(ARITY, op) && !Object.hasOwn(ALIASES, op)) {
            const sized = op.match(/^(mov|lea|add|sub|imul|cmp|test|and|or|xor|neg|inc|dec|not)([lbwq])$/);
            if (sized && sized[2] !== 'l') fail(`"${op}" is not a 32-bit instruction. This lab supports the l suffix or no suffix; b/w/q are different sizes.`);
            if (sized) op = sized[1];
          }
          op = ALIASES[op] || op;
          if (!Object.hasOwn(ARITY, op)) fail(`Unsupported instruction "${m[1]}". See the syntax reference.`);
          const raw = splitOperands(m[2] || '');
          const args = op.startsWith('j') ? raw.map(label => { if (!SYMBOL.test(label)) fail('Jumps require a named label.'); return label; }) : raw.map(operand);
          validateInstruction(op, args);
          instructions.push({op, args, line, source:part});
          if (instructions.length > 1000) fail('Programs are limited to 1,000 instructions.');
        } catch (e) { throw new AssemblyError(e.message, line); }
      }
    });
    if (!instructions.length) fail('Enter at least one instruction.');
    for (const ins of instructions) if (ins.op.startsWith('j') && !labels.has(ins.args[0])) fail(`Unknown label "${ins.args[0]}".`, ins.line);
    return {instructions, labels};
  }
  function makeState(fixture) {
    const symbols = new Map(), registers = new Map(), bytes = new Map();
    for (const [name, value] of Object.entries(fixture.symbols || {})) {
      if (!SYMBOL.test(name)) fail(`Invalid fixture symbol ${name}.`);
      symbols.set(name, integer(value) >>> 0);
    }
    const occupied = new Set();
    for (const address of symbols.values()) for (let i=0;i<4;i++) occupied.add((address+i)>>>0);
    for (const key of Object.keys(fixture.memory || {})) {
      const expr=expression(key);
      if ('value' in expr || symbols.has(expr.symbol)) {
        const at='value' in expr?expr.value:symbols.get(expr.symbol)+expr.offset;
        for(let i=0;i<4;i++) occupied.add((at+i)>>>0);
      }
    }
    let nextAddress = 0x1000;
    for (const key of Object.keys(fixture.memory || {})) {
      const expr = expression(key);
      if (expr.symbol && !symbols.has(expr.symbol)) {
        const offsets=Object.keys(fixture.memory).map(expression).filter(e=>e.symbol===expr.symbol).map(e=>e.offset);
        while (offsets.some(offset=>[0,1,2,3].some(i=>occupied.has((nextAddress+offset+i)>>>0)))) nextAddress+=4;
        symbols.set(expr.symbol, nextAddress);
        for (const offset of offsets) for(let i=0;i<4;i++) occupied.add((nextAddress+offset+i)>>>0);
        nextAddress+=4;
      }
    }
    const state = {symbols, registers, bytes, flags:{}, writes:new Set(), steps:0, trace:[]};
    for (const [key, value] of Object.entries(fixture.memory || {})) {
      const address = resolve(expression(key), state) >>> 0;
      const number = value === null ? null : integer(value) >>> 0;
      for (let i=0;i<4;i++) {
        const at = (address+i)>>>0, byte = number === null ? null : (number >>> (i*8)) & 255;
        if (bytes.has(at) && bytes.get(at) !== byte) fail(`Conflicting initial memory at ${key}.`);
        bytes.set(at, byte);
      }
    }
    for (const [name, value] of Object.entries(fixture.registers || {})) registers.set(register(name), integer(value) | 0);
    return state;
  }
  function resolve(expr, state) {
    if ('value' in expr) return expr.value;
    if (!state.symbols.has(expr.symbol)) fail(`Unknown memory symbol "${expr.symbol}" (names are case-sensitive).`);
    return (state.symbols.get(expr.symbol) + expr.offset) >>> 0;
  }
  function readRegister(name, state) {
    if (!state.registers.has(name)) fail(`%${name} is uninitialized. Load a value before using it.`);
    return state.registers.get(name);
  }
  function address(arg, state) {
    let result = resolve(arg.expr, state);
    if (arg.base) result += readRegister(arg.base, state) >>> 0;
    if (arg.index) result += (readRegister(arg.index, state) >>> 0) * arg.scale;
    return result >>> 0;
  }
  function readMemory(at, state) {
    let result = 0;
    for (let i=0;i<4;i++) {
      const key=(at+i)>>>0;
      if (!state.bytes.has(key)) fail(`Address 0x${key.toString(16)} is outside the question's memory.`);
      const byte=state.bytes.get(key);
      if (byte === null) fail(`Memory at 0x${key.toString(16)} is uninitialized.`);
      result |= byte << (i*8);
    }
    return result | 0;
  }
  function read(arg, state) {
    if (arg.kind === 'imm') return resolve(arg.expr, state) | 0;
    if (arg.kind === 'reg') return readRegister(arg.name, state);
    return readMemory(address(arg, state), state);
  }
  function write(arg, value, state) {
    if (arg.kind === 'reg') { state.registers.set(arg.name, value | 0); return; }
    const at=address(arg,state);
    for (let i=0;i<4;i++) if (!state.bytes.has((at+i)>>>0)) fail(`Cannot write outside the question's memory (0x${at.toString(16)}).`);
    for (let i=0;i<4;i++) { const key=(at+i)>>>0; state.bytes.set(key,(value >>> (i*8)) & 255); state.writes.add(key); }
  }
  function arithmetic(a, b, subtract, state) {
    const result=(subtract ? a-b : a+b) | 0;
    state.flags={ZF:result===0, SF:result<0,
      CF:subtract ? (a>>>0)<(b>>>0) : (a>>>0)+(b>>>0)>4294967295,
      OF:subtract ? ((a^b)&(a^result))<0 : ((~(a^b))&(a^result))<0};
    return result;
  }
  function condition(op, flags) {
    const f = key => { if (typeof flags[key] !== 'boolean') fail(`${op} needs a defined ${key} flag. Use cmp/test or an appropriate arithmetic instruction first.`); return flags[key]; };
    // Read every required flag, even if a JavaScript boolean shortcut would skip it.
    if (op === 'je') return f('ZF'); if (op === 'jne') return !f('ZF');
    if (op === 'js') return f('SF'); if (op === 'jns') return !f('SF');
    if (op === 'jo') return f('OF'); if (op === 'jno') return !f('OF');
    if (op === 'jb') return f('CF'); if (op === 'jae') return !f('CF');
    if (op === 'ja' || op === 'jbe') { const cf=f('CF'), zf=f('ZF'); return op==='ja' ? !cf&&!zf : cf||zf; }
    const sf=f('SF'), of=f('OF');
    if (op === 'jl') return sf!==of; if (op === 'jge') return sf===of;
    const zf=f('ZF'); return op==='jg' ? !zf && sf===of : zf || sf!==of;
  }
  function execute(program, fixture, options={}) {
    if (typeof program === 'string') program=parse(program);
    const state=makeState(fixture), maxSteps=Math.min(options.maxSteps || 10000, 20000);
    let pc=0;
    while (pc < program.instructions.length) {
      const ins=program.instructions[pc], {op,args}=ins;
      try {
        if (++state.steps > maxSteps) fail(`Stopped after ${maxSteps} instructions. Check the loop condition and update.`);
        if (options.trace && state.trace.length < 200) state.trace.push({step:state.steps,line:ins.line,instruction:ins.source});
        if (op.startsWith('j')) { pc=(op==='jmp' || condition(op,state.flags)) ? program.labels.get(args[0]) : pc+1; continue; }
        const dest=args[args.length-1];
        let result;
        switch(op) {
          case 'nop': break;
          case 'mov': write(dest,read(args[0],state),state); break;
          case 'lea': write(dest,address(args[0],state),state); break;
          case 'add': case 'sub': case 'cmp':
            result=arithmetic(read(dest,state),read(args[0],state),op!=='add',state);
            if (op!=='cmp') write(dest,result,state); break;
          case 'inc': case 'dec': {
            const cf=state.flags.CF;
            result=arithmetic(read(dest,state),1,op==='dec',state); state.flags.CF=cf;
            write(dest,result,state); break;
          }
          case 'neg': result=arithmetic(0,read(dest,state),true,state); write(dest,result,state); break;
          case 'not': write(dest,~read(dest,state),state); break;
          case 'imul': {
            const a=read(args[0],state), b=read(args[1],state);
            const product=BigInt(a)*BigInt(b), overflow=product>2147483647n || product< -2147483648n;
            state.flags={OF:overflow,CF:overflow};
            write(dest,Number(BigInt.asIntN(32,product)),state); break;
          }
          case 'xor': case 'and': case 'or': case 'test': {
            const zero=op==='xor' && args[0].kind==='reg' && dest.kind==='reg' && args[0].name===dest.name;
            const a=zero?0:read(dest,state), b=zero?0:read(args[0],state);
            result=op==='xor'?a^b:op==='or'?a|b:a&b;
            state.flags={ZF:result===0,SF:result<0,OF:false,CF:false};
            if(op!=='test') write(dest,result,state); break;
          }
        }
        pc++;
      } catch(e) { throw new AssemblyError(e.message,ins.line); }
    }
    return state;
  }
  function inspect(state, expected) {
    const differences=[];
    for (const [key,value] of Object.entries(expected.memory || {})) {
      let actual;
      try { actual=readMemory(resolve(expression(key),state)>>>0,state); } catch { actual='uninitialized'; }
      if(actual!==(integer(value)|0)) differences.push({location:key,expected:integer(value)|0,actual});
    }
    for (const [key,value] of Object.entries(expected.registers || {})) {
      const actual=state.registers.get(register(key));
      if(actual!==(integer(value)|0)) differences.push({location:'%'+register(key),expected:integer(value)|0,actual:actual??'uninitialized'});
    }
    return differences;
  }
  function check(question, code) {
    let program;
    try { program=parse(code); } catch(e) { return {ok:false,message:e.message}; }
    const results=[];
    for (const fixture of question.cases) {
      try {
        const state=execute(program,fixture);
        const differences=inspect(state,fixture.expected);
        // Memory that is not an output must be preserved. Temporary registers are free.
        const initial=makeState(fixture), allowed=new Set();
        for(const key of Object.keys(fixture.expected.memory || {})) {
          const at=resolve(expression(key),state)>>>0;
          for(let i=0;i<4;i++) allowed.add((at+i)>>>0);
        }
        for(const [at,value] of initial.bytes) if(!allowed.has(at) && state.bytes.get(at)!==value) {
          differences.push({location:'0x'+at.toString(16),expected:'unchanged memory',actual:'modified'}); break;
        }
        results.push({name:fixture.name,ok:!differences.length,differences,steps:state.steps});
      } catch(e) { results.push({name:fixture.name,ok:false,error:e.message}); }
    }
    const ok=results.every(r=>r.ok);
    return {ok,results,message:ok?`Passed all ${results.length} test cases. Required outputs and preserved memory match.`:`Passed ${results.filter(r=>r.ok).length} of ${results.length} test cases. Review the first failing case below.`};
  }
  function validateBank(bank) {
    if(!bank || bank.schemaVersion!==1 || !Array.isArray(bank.questions) || !bank.questions.length) fail('A bank needs schemaVersion: 1 and a non-empty questions array.');
    const ids=new Set();
    for(const q of bank.questions) {
      if(!q || typeof q.id!=='string' || !/^[a-z0-9-]+$/.test(q.id) || ids.has(q.id)) fail('Question IDs must be unique lowercase slugs.');
      ids.add(q.id);
      for(const key of ['category','title']) if(typeof q[key]!=='string' || !q[key].trim()) fail(`${q.id}: ${key} is required.`);
      if(q.type==='mcq') {
        if(typeof q.question!=='string' || !Array.isArray(q.options) || q.options.length<2 || q.options.some(v=>typeof v!=='string') || !Number.isInteger(q.correctAnswer) || q.correctAnswer<0 || q.correctAnswer>=q.options.length || typeof q.explanation!=='string') fail(`${q.id}: invalid multiple-choice question.`);
      } else if(q.type==='code') {
        if(typeof q.cCode!=='string' || typeof q.hint!=='string' || !Array.isArray(q.solutions) || !q.solutions.length || q.solutions.some(s=>typeof s!=='string') || !Array.isArray(q.cases) || !q.cases.length || q.cases.length>100) fail(`${q.id}: code questions need C code, hints, solutions, and 1–100 cases.`);
        for(const c of q.cases) {
          if(typeof c.name!=='string' || !c.memory || !c.expected || !(Object.keys(c.expected.memory||{}).length+Object.keys(c.expected.registers||{}).length)) fail(`${q.id}: each case needs memory and explicit expected outputs.`);
          const state=makeState(c);
          for(const [key,value] of Object.entries(c.expected.memory||{})) {
            integer(value); const at=resolve(expression(key),state)>>>0;
            for(let i=0;i<4;i++) if(!state.bytes.has((at+i)>>>0)) fail(`${q.id}: output ${key} is not allocated.`);
          }
          for(const [key,value] of Object.entries(c.expected.registers||{})) {register(key);integer(value);}
        }
        for(const solution of q.solutions) {
          const result=check(q,solution);
          if(!result.ok) fail(`${q.id}: a reference solution fails its cases: ${JSON.stringify(result)}.`);
        }
      } else fail(`${q.id}: type must be code or mcq.`);
    }
    return bank;
  }
  return {parse,execute,check,validateBank,integer,AssemblyError};
});
