/* A bounded x86 integer teaching interpreter; exact BigInt arithmetic, byte memory. No eval, native code, or network. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AssemblyEngine = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const REGS = new Map();
  const families = [['rax','eax','ax','al','ah'],['rbx','ebx','bx','bl','bh'],['rcx','ecx','cx','cl','ch'],['rdx','edx','dx','dl','dh'],['rsi','esi','si','sil'],['rdi','edi','di','dil'],['rbp','ebp','bp','bpl'],['rsp','esp','sp','spl']];
  for(let i=8;i<16;i++) families.push([`r${i}`,`r${i}d`,`r${i}w`,`r${i}b`]);
  for(const names of families) names.forEach((name,i)=>REGS.set(name,{root:names[0],bits:[64,32,16,8,8][i],shift:i===4?8:0}));
  const U=(v,b=64)=>BigInt.asUintN(b,BigInt(v));
  const S=(v,b=64)=>BigInt.asIntN(b,BigInt(v));
  const mask=b=>(1n<<BigInt(b))-1n;
  const printable=v=>typeof v==='bigint'?v.toString():v;
  const CALLEE_SAVED=['rbx','rbp','r12','r13','r14','r15'];
  const STACK_LOW=0x7000, STACK_TOP=0x8000, RETURN_SENTINEL=0xffffffffffffffffn;
  const SYMBOL = /^[A-Za-z_.$][\w.$]*$/;
  const NUMBER = /^[+-]?(?:0x[\da-f]+|0b[01]+|\d+)$/i;
  const ALIASES = {jz:'je', jnz:'jne', jnle:'jg', jnl:'jge', jnge:'jl', jng:'jle', jc:'jb', jnae:'jb', jnc:'jae', jnb:'jae', jna:'jbe', jnbe:'ja'};
  const ARITY = {mov:[2], lea:[2], add:[2], sub:[2], imul:[2,3], cmp:[2], test:[2], and:[2], or:[2], xor:[2], neg:[1], inc:[1], dec:[1], not:[1], shl:[1,2], sal:[1,2], shr:[1,2], sar:[1,2], push:[1], pop:[1], call:[1], ret:[0], leave:[0], nop:[0], jmp:[1], je:[1], jne:[1], jg:[1], jge:[1], jl:[1], jle:[1], js:[1], jns:[1], jo:[1], jno:[1], ja:[1], jae:[1], jb:[1], jbe:[1]};
  class AssemblyError extends Error {
    constructor(message, line) { super(line ? `Line ${line}: ${message}` : message); this.name = 'AssemblyError'; this.line = line; }
  }
  const fail = (message, line) => { throw new AssemblyError(message, line); };
  function integer(text) {
    if(typeof text==='number' && !Number.isSafeInteger(text)) fail('Large integers must be supplied as decimal or hex strings.');
    const str=String(text).trim();
    if(!NUMBER.test(str)) fail(`Invalid integer "${str}".`);
    const value=(str[0]==='-'?-1n:1n)*BigInt(str.replace(/^[+-]/,''));
    if(value< -(1n<<63n) || value>mask(64)) fail(`Integer "${str}" is outside the 64-bit range.`);
    return value;
  }
  function register(text) {
    const name=text.replace(/^%/,'').toLowerCase();
    if(!REGS.has(name)) fail(`Unsupported register "${text}".`);
    return name;
  }
  function expression(text) {
    if (NUMBER.test(text)) return {value:integer(text)};
    const m = text.match(/^([A-Za-z_.$][\w.$]*)(?:([+-])((?:0x[\da-f]+|0b[01]+|\d+)))?$/i);
    if (!m) fail(`Invalid address or constant "${text}".`);
    return {symbol:m[1], offset:m[2] ? integer(m[2] + m[3]) : 0n};
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
    if (index === 'esp' || index === 'rsp') fail('%esp/%rsp cannot be an index register.');
    for(const r of [base,index].filter(Boolean)) if(![32,64].includes(REGS.get(r).bits)) fail('Addresses require 32- or 64-bit registers.');
    if(base && index && REGS.get(base).bits!==REGS.get(index).bits) fail('Address register sizes must match.');
    const scale = fields[2] ? Number(integer(fields[2])) : 1;
    if (![1,2,4,8].includes(scale) || (fields.length === 3 && !index)) fail('An index scale must be 1, 2, 4, or 8 and needs an index register.');
    return {kind:'mem', expr:expression(m[1] || '0'), base, index, scale, text};
  }
  function validateInstruction(op, args) {
    if (!ARITY[op].includes(args.length)) fail(`${op} expects ${ARITY[op].join(' or ')} operand(s), received ${args.length}.`);
    if (op.startsWith('j') || ['call','ret','leave','nop'].includes(op)) return;
    if(op==='push') return;
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
          let op = m[1].toLowerCase(), bits=null;
          const sized=op.match(/^(mov|lea|add|sub|imul|cmp|test|and|or|xor|neg|inc|dec|not|shl|sal|shr|sar|push|pop)([lbwq])$/);
          if(sized) {op=sized[1];bits={b:8,w:16,l:32,q:64}[sized[2]];}
          if(op==='callq') op='call'; if(op==='retq') op='ret'; if(op==='leaveq') op='leave';
          op = ALIASES[op] || op;
          if (!Object.hasOwn(ARITY, op)) fail(`Unsupported instruction "${m[1]}". See the syntax reference.`);
          const raw = splitOperands(m[2] || '');
          const control=op.startsWith('j')||op==='call';
          let args = control ? raw.map(label => { if (!SYMBOL.test(label)) fail('Jumps/calls require a named label.'); return label; }) : raw.map(operand);
          validateInstruction(op, args);
          const shift=['shl','sal','shr','sar'].includes(op);
          if(shift && args.length===1) args=[operand('$1'),...args];
          const sizedArgs=shift?args.slice(1):args;
          bits=bits || (['push','pop'].includes(op)?64:REGS.get(sizedArgs.findLast(a=>a.kind==='reg')?.name)?.bits || 32);
          if(!control) for(const arg of sizedArgs) if(arg.kind==='reg' && REGS.get(arg.name).bits!==bits) fail(`Operand size mismatch: %${arg.name} is ${REGS.get(arg.name).bits}-bit, instruction is ${bits}-bit.`);
          if(['push','pop'].includes(op) && bits!==64) fail('This lab supports pushq/popq (64-bit stack) only.');
          if(op==='lea' && bits===8 || op==='imul' && bits===8) fail(`${op} has no byte-sized form.`);
          if(op==='imul' && args.length===2 && args[0].kind==='imm') {
            // GAS shorthand: imul $n, %reg is the three-operand form using %reg twice.
            args=[args[0],args[1],args[1]];
          }
          if(shift && !(args[0].kind==='imm' && 'value' in args[0].expr && args[0].expr.value>=0n && args[0].expr.value<=255n || args[0].kind==='reg' && args[0].name==='cl')) fail('Shift count must be $0..$255 or %cl.');
          if(!control) for(const arg of args) if(arg.kind==='imm' && 'value' in arg.expr) {
            const v=arg.expr.value;
            const width=shift?8:bits;
            if(v< -(1n<<BigInt(width-1)) || v>mask(width)) fail(`Immediate does not fit ${width} bits.`);
            if(bits===64 && !(op==='mov' && args.at(-1).kind==='reg') && !shift && U(v)!==U(S(v,32))) fail('This 64-bit form encodes a sign-extended 32-bit immediate. Load a large constant into a register first.');
          }
          // AH/BH/CH/DH cannot coexist with a REX encoding.
          const allRegs=args.flatMap(a=>a.kind==='reg'?[a.name]:[a.base,a.index].filter(Boolean));
          if(allRegs.some(r=>REGS.get(r).shift===8) && (bits===64 || allRegs.some(r=>/^r(?:[89]|1[0-5])/.test(r)||['sil','dil','bpl','spl'].includes(r)))) fail('High-byte registers cannot be used with a REX encoding.');
          instructions.push({op, args, bits, line, source:part});
          if (instructions.length > 1000) fail('Programs are limited to 1,000 instructions.');
        } catch (e) { throw new AssemblyError(e.message, line); }
      }
    });
    if (!instructions.length) fail('Enter at least one instruction.');
    for (const ins of instructions) if ((ins.op.startsWith('j') || ins.op==='call') && !labels.has(ins.args[0])) fail(`Unknown label "${ins.args[0]}".`, ins.line);
    return {instructions, labels};
  }
  function safeAddress(value) {
    const v=U(value);
    if(v>BigInt(Number.MAX_SAFE_INTEGER)) fail('Address is outside the lab’s safe address range.');
    return Number(v);
  }
  function cellSize(fixture,key) {
    const n=fixture.memoryWidths?.[key] || fixture.memoryWidth || 4;
    if(![1,2,4,8].includes(n)) fail('Memory cell size must be 1, 2, 4, or 8 bytes.');
    return n;
  }
  function makeState(fixture={}) {
    const state={symbols:new Map(),registers:new Map(),regValues:new Map(),regKnown:new Map(),bytes:new Map(),flags:{},writes:new Set(),executedOps:new Set(),steps:0,trace:[],function:fixture.function===true,returned:false};
    const {symbols,bytes}=state, occupied=new Set();
    for(const [name,value] of Object.entries(fixture.symbols||{})) {
      if(!SYMBOL.test(name)) fail(`Invalid fixture symbol ${name}.`);
      symbols.set(name,safeAddress(integer(value)));
    }
    const cells=Object.entries(fixture.memory||{}).map(([key,value])=>({key,value,expr:expression(key),size:cellSize(fixture,key)}));
    for(const c of cells) if('value' in c.expr || symbols.has(c.expr.symbol)) {
      const at=safeAddress(resolve(c.expr,state)); for(let i=0;i<c.size;i++) occupied.add(at+i);
    }
    let next=0x1000;
    for(const c of cells) if(c.expr.symbol && !symbols.has(c.expr.symbol)) {
      const group=cells.filter(v=>v.expr.symbol===c.expr.symbol);
      while(group.some(v=>Array.from({length:v.size},(_,i)=>next+Number(v.expr.offset)+i).some(a=>occupied.has(a)))) next+=8;
      symbols.set(c.expr.symbol,next);
      for(const v of group) for(let i=0;i<v.size;i++) occupied.add(next+Number(v.expr.offset)+i);
      next+=8;
    }
    for(const c of cells) {
      const at=safeAddress(resolve(c.expr,state));
      if(at<STACK_TOP+8 && at+c.size>STACK_LOW) fail('Fixture memory overlaps the reserved stack.');
      const value=c.value===null?null:U(integer(c.value),c.size*8);
      for(let i=0;i<c.size;i++) {
        const byte=value===null?null:Number((value>>BigInt(i*8))&255n);
        if(bytes.has(at+i)&&bytes.get(at+i)!==byte) fail(`Conflicting initial memory at ${c.key}.`);
        bytes.set(at+i,byte);
      }
    }
    for(let at=STACK_LOW;at<STACK_TOP;at++) bytes.set(at,null);
    writeRegister('rsp',BigInt(fixture.function?STACK_TOP-8:STACK_TOP),state);
    if(fixture.function) for(const [i,name] of CALLEE_SAVED.entries()) writeRegister(name,BigInt(0x6000+i*256),state);
    if(fixture.function) writeMemory(STACK_TOP-8,RETURN_SENTINEL,state,64);
    for(const [name,value] of Object.entries(fixture.registers||{})) writeRegister(register(name),integer(value),state);
    state.initialSP=readRegister('rsp',state);
    state.writes.clear();
    return state;
  }
  function resolve(expr,state) {
    if('value' in expr) return BigInt(expr.value);
    if(!state.symbols.has(expr.symbol)) fail(`Unknown memory symbol "${expr.symbol}" (names are case-sensitive).`);
    return BigInt(state.symbols.get(expr.symbol))+BigInt(expr.offset);
  }
  function readRegister(name,state) {
    const r=REGS.get(name), needed=mask(r.bits)<<BigInt(r.shift);
    if(((state.regKnown.get(r.root)||0n)&needed)!==needed) fail(`%${name} is uninitialized. Load a value before using it.`);
    return U((state.regValues.get(r.root)||0n)>>BigInt(r.shift),r.bits);
  }
  function writeRegister(name,value,state) {
    const r=REGS.get(name), shift=BigInt(r.shift), m=mask(r.bits)<<shift;
    let val=((state.regValues.get(r.root)||0n)&~m)|(U(value,r.bits)<<shift);
    let known=(state.regKnown.get(r.root)||0n)|m;
    if(r.bits===32) {val=U(value,32);known=mask(64);}
    state.regValues.set(r.root,val);state.regKnown.set(r.root,known);
    for(const [alias,a] of REGS) if(a.root===r.root && (known&(mask(a.bits)<<BigInt(a.shift)))===(mask(a.bits)<<BigInt(a.shift))) {
      const v=S(val>>BigInt(a.shift),a.bits);
      state.registers.set(alias,a.bits===64?v:Number(v));
    }
  }
  function address(arg,state,raw=false) {
    let result=resolve(arg.expr,state);
    if(arg.base) result+=readRegister(arg.base,state);
    if(arg.index) result+=readRegister(arg.index,state)*BigInt(arg.scale);
    if(REGS.get(arg.base||arg.index)?.bits===32) result=U(result,32);
    return raw?U(result):safeAddress(result);
  }
  function readMemory(at,state,bits=32) {
    let value=0n;
    for(let i=0;i<bits/8;i++) {
      if(!state.bytes.has(at+i)) fail(`Address 0x${(at+i).toString(16)} is outside the question's memory.`);
      const byte=state.bytes.get(at+i);
      if(byte===null) fail(`Memory at 0x${(at+i).toString(16)} is uninitialized.`);
      value|=BigInt(byte)<<BigInt(i*8);
    }
    return value;
  }
  function writeMemory(at,value,state,bits) {
    for(let i=0;i<bits/8;i++) if(!state.bytes.has(at+i)) fail(`Cannot write outside the question's memory (0x${at.toString(16)}).`);
    for(let i=0;i<bits/8;i++) {state.bytes.set(at+i,Number((U(value,bits)>>BigInt(i*8))&255n));state.writes.add(at+i);}
  }
  function read(arg,state,bits=32) {
    if(arg.kind==='imm') return U(resolve(arg.expr,state),bits);
    if(arg.kind==='reg') return readRegister(arg.name,state);
    return readMemory(address(arg,state),state,bits);
  }
  function write(arg,value,state,bits=32) {
    if(arg.kind==='reg') writeRegister(arg.name,value,state);
    else writeMemory(address(arg,state),value,state,bits);
  }
  function arithmetic(a,b,subtract,state,bits) {
    a=U(a,bits);b=U(b,bits);
    const exact=subtract?a-b:a+b, result=U(exact,bits);
    const signedExact=subtract?S(a,bits)-S(b,bits):S(a,bits)+S(b,bits);
    state.flags={ZF:result===0n,SF:S(result,bits)<0n,CF:subtract?a<b:exact>mask(bits),OF:S(signedExact,bits)!==signedExact};
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
  function execute(program,fixture={},options={}) {
    if(typeof program==='string') program=parse(program);
    const state=makeState(fixture), maxSteps=Math.min(options.maxSteps||10000,20000);
    // Show full registers plus the aliases actually used in the program. In
    // particular, AL remains visible when the rest of RAX is uninitialized.
    const traceRegisters=new Set(program.instructions.flatMap(ins=>ins.args.flatMap(arg=>arg.kind==='reg'?[arg.name]:[arg.base,arg.index].filter(Boolean))));
    const snapshot=details=>{
      const registers=[...state.registers].filter(([name])=>REGS.get(name).bits===64||traceRegisters.has(name));
      const sp=safeAddress(readRegister('rsp',state));
      return {...details,
        registers:Object.fromEntries(registers.map(([name,value])=>[name,value.toString()])),
        registerWidths:Object.fromEntries(registers.map(([name])=>[name,REGS.get(name).bits])),
        flags:{...state.flags},
        memory:Object.fromEntries(Object.keys(fixture.memory||{}).map(key=>{
          const bits=cellSize(fixture,key)*8;
          try {const value=readMemory(safeAddress(resolve(expression(key),state)),state,bits);return [key,`${S(value,bits)} (0x${value.toString(16)})`];}
          catch {return [key,'uninitialized'];}
        })),
        stack:Array.from({length:Math.min(8,Math.max(0,Math.ceil((STACK_TOP-sp)/8)))},(_,i)=>{
          const at=sp+i*8;
          try {return `0x${at.toString(16)}: 0x${readMemory(at,state,64).toString(16)}`;}
          catch {return `0x${at.toString(16)}: uninitialized`;}
        })};
    };
    const push=value=>{const sp=safeAddress(readRegister('rsp',state)-8n);if(sp<STACK_LOW||sp>STACK_TOP-8) fail('Stack overflow or invalid stack pointer.');writeMemory(sp,value,state,64);writeRegister('rsp',BigInt(sp),state);};
    const pop=()=>{const sp=safeAddress(readRegister('rsp',state));if(sp<STACK_LOW||sp>STACK_TOP-8) fail('Stack underflow or invalid stack pointer.');const v=readMemory(sp,state,64);writeRegister('rsp',BigInt(sp+8),state);return v;};
    const calls=[];
    let pc=fixture.entry?program.labels.get(fixture.entry):0;
    if(pc===undefined) fail(`Missing entry label ${fixture.entry}.`);
    while(pc<program.instructions.length) {
      const ins=program.instructions[pc],{op,args,bits}=ins;
      try {
        if(++state.steps>maxSteps) fail(`Stopped after ${maxSteps} instructions. Check the loop condition and update.`);
        if(options.trace && state.trace.length<200) state.trace.push(snapshot({step:state.steps,line:ins.line,instruction:ins.source,phase:'before'}));
        state.executedOps.add(op==='sal'?'shl':op);
        if(op.startsWith('j')) {pc=(op==='jmp'||condition(op,state.flags))?program.labels.get(args[0]):pc+1;continue;}
        if(op==='call') {if((fixture.abi||fixture.function) && readRegister('rsp',state)%16n!==0n) fail('System V call requires RSP aligned to 16 bytes.');calls.push({target:BigInt(pc+1),saved:CALLEE_SAVED.filter(n=>state.regKnown.has(n)).map(n=>[n,readRegister(n,state)])});push(BigInt(pc+1));pc=program.labels.get(args[0]);continue;}
        if(op==='ret') {const target=pop();
          if(calls.length) {const frame=calls.pop();if(target!==frame.target) fail('Return address does not match the active call. Check the stack.');if(fixture.function||fixture.abi) for(const [name,value] of frame.saved) if(readRegister(name,state)!==value) fail(`Helper must preserve %${name} across its call.`);}
          if(target===RETURN_SENTINEL && state.function) {state.returned=true;break;}if(target>BigInt(program.instructions.length)) fail('Invalid return address. Check balanced push/pop and stack locals.');pc=Number(target);continue;}
        const dest=args.at(-1), r=a=>read(a,state,bits), w=v=>write(dest,v,state,bits);
        let result;
        switch(op) {
          case 'nop':break;
          case 'push':push(r(args[0]));break;
          case 'pop': {const value=pop();w(value);break;}
          case 'leave':writeRegister('rsp',readRegister('rbp',state),state);writeRegister('rbp',pop(),state);break;
          case 'mov':w(r(args[0]));break;
          case 'lea':w(address(args[0],state,true));break;
          case 'add':case 'sub':case 'cmp':result=arithmetic(r(dest),r(args[0]),op!=='add',state,bits);if(op!=='cmp') w(result);break;
          case 'inc':case 'dec': {const cf=state.flags.CF;result=arithmetic(r(dest),1n,op==='dec',state,bits);state.flags.CF=cf;w(result);break;}
          case 'neg':w(arithmetic(0n,r(dest),true,state,bits));break;
          case 'not':w(~r(dest));break;
          case 'imul': {const product=S(r(args[0]),bits)*S(r(args[1]),bits),overflow=S(product,bits)!==product;state.flags={OF:overflow,CF:overflow};w(product);break;}
          case 'and':case 'or':case 'xor':case 'test': {
            const zero=op==='xor'&&args[0].kind==='reg'&&dest.kind==='reg'&&args[0].name===dest.name;
            const a=zero?0n:r(dest), b=zero?0n:r(args[0]);
            result=U(op==='xor'?a^b:op==='or'?a|b:a&b,bits);
            state.flags={ZF:result===0n,SF:S(result,bits)<0n,CF:false,OF:false};
            if(op!=='test') w(result);break;
          }
          case 'shl':case 'sal':case 'shr':case 'sar': {
            const count=Number(read(args[0],state,args[0].kind==='reg'?8:bits)&BigInt(bits===64?63:31));
            const a=r(dest);
            // Even an effective count of zero writes a 32-bit register result,
            // clearing its upper 32 bits. Flags and memory remain unchanged.
            if(!count) {if(bits===32 && dest.kind==='reg') w(a);break;}
            const n=BigInt(count),left=op==='shl'||op==='sal';
            result=U(left?a<<n:op==='shr'?a>>n:S(a,bits)>>n,bits);
            const cf=count<bits?Boolean(left?(a>>BigInt(bits-count))&1n:(a>>BigInt(count-1))&1n):op==='sar'?S(a,bits)<0n:undefined;
            state.flags={ZF:result===0n,SF:S(result,bits)<0n,CF:cf,OF:count===1?(left?(S(result,bits)<0n)!==cf:op==='shr'?S(a,bits)<0n:false):undefined};
            w(result);break;
          }
        }
        pc++;
      } catch(e) {const error=new AssemblyError(e.message,ins.line);error.trace=state.trace;throw error;}
    }
    const endError=message=>{const error=new AssemblyError(message);error.trace=state.trace;throw error;};
    if(calls.length) endError('Program ended inside a called function without ret.');
    if(state.function&&!state.returned) endError('Function must return with ret; falling off the end is not a return.');
    if(options.trace) state.finalTrace=snapshot({step:state.steps,instruction:'Program finished',phase:'after'});
    return state;
  }
  function inspect(state,expected,fixture) {
    const differences=[];
    for(const [key,value] of Object.entries(expected.memory||{})) {
      const bits=cellSize(fixture,key)*8;let actual;
      try{actual=readMemory(safeAddress(resolve(expression(key),state)),state,bits);}catch{actual='uninitialized';}
      if(actual!==U(integer(value),bits)) differences.push({location:key,expected:printable(S(integer(value),bits)),actual:typeof actual==='bigint'?S(actual,bits).toString():actual});
    }
    for(const [key,value] of Object.entries(expected.registers||{})) {
      const name=register(key),bits=REGS.get(name).bits;let actual;
      try{actual=readRegister(name,state);}catch{actual='uninitialized';}
      if(actual!==U(integer(value),bits)) differences.push({location:'%'+name,expected:printable(S(integer(value),bits)),actual:typeof actual==='bigint'?S(actual,bits).toString():actual});
    }
    return differences;
  }
  function check(question, code) {
    let program;
    try { program=parse(code); } catch(e) { return {ok:false,message:e.message}; }
    const required=question.requirements||[];
    for(const op of required) if(!program.instructions.some(i=>(i.op==='sal'?'shl':i.op)===(op==='sal'?'shl':op))) return {ok:false,message:`This exercise asks you to practice ${op}; include that instruction.`};
    const results=[], executedOps=new Set();
    for (const fixture of question.cases) {
      try {
        const state=execute(program,fixture);
        for(const op of state.executedOps) executedOps.add(op);
        const differences=inspect(state,fixture.expected,fixture);
        // Memory that is not an output must be preserved. Temporary registers are free.
        const initial=makeState(fixture), allowed=new Set();
        for(const key of Object.keys(fixture.expected.memory || {})) {
          const at=safeAddress(resolve(expression(key),state));
          for(let i=0;i<cellSize(fixture,key);i++) allowed.add(at+i);
        }
        for(const [at,value] of initial.bytes) if((at<STACK_LOW||at>=STACK_TOP) && !allowed.has(at) && state.bytes.get(at)!==value) {
          differences.push({location:'0x'+at.toString(16),expected:'unchanged memory',actual:'modified'}); break;
        }
        if(fixture.checkStack!==false && readRegister('rsp',state)!==initial.initialSP+(fixture.function?8n:0n)) differences.push({location:'%rsp',expected:'balanced stack',actual:'stack not restored'});
        for(const name of new Set([...(fixture.function?CALLEE_SAVED:[]),...(fixture.preserveRegisters||[])])) if(readRegister(register(name),state)!==readRegister(register(name),initial)) differences.push({location:'%'+name,expected:'preserved',actual:'changed'});
        results.push({name:fixture.name,ok:!differences.length,differences,steps:state.steps});
      } catch(e) { results.push({name:fixture.name,ok:false,error:e.message}); }
    }
    const missing=required.filter(op=>!executedOps.has(op==='sal'?'shl':op));
    if(results.every(r=>r.ok) && missing.length) return {ok:false,results,message:`The outputs match, but ${missing.join(', ')} never executed in any test case. This exercise requires practicing those instructions; unreachable code does not count.`};
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
            integer(value); const at=safeAddress(resolve(expression(key),state));
            for(let i=0;i<cellSize(c,key);i++) if(!state.bytes.has(at+i)) fail(`${q.id}: output ${key} is not allocated.`);
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
