const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
const bank=require('../data/lecture10.json');
const run=(code,fixture={},options={})=>E.execute(code,{memory:{},...fixture},options);
const rax=(code,fixture)=>run(code,fixture).registers.get('rax');
test('all 122 Lecture 10 questions and their reference solutions validate',()=>{E.validateBank(bank);assert.equal(bank.questions.length,122);});
test('all course questions have explanations and map into the learning path',()=>{
 const lessons=require('../data/lessons.json').lessons;assert.equal(lessons.length,14);
 const mapped=new Set(lessons.flatMap(l=>l.steps.flatMap(s=>[...s.practice,...s.review])));
 for(const q of bank.questions){assert.ok(mapped.has(q.id),q.id);assert.ok(q.explanation);}
});
test('64-bit arithmetic is exact above Number safe range and wraps at 64 bits',()=>{
 assert.equal(rax('movq $9007199254740993,%rax\naddq $2,%rax'),9007199254740995n);
 const s=run('movq $-1,%rax\naddq $1,%rax');assert.equal(s.registers.get('rax'),0n);assert.equal(s.flags.CF,true);assert.equal(s.flags.OF,false);
 const t=run('movq $9223372036854775807,%rax\naddq $1,%rax');assert.equal(t.registers.get('rax'),-9223372036854775808n);assert.equal(t.flags.OF,true);
 assert.throws(()=>E.integer(9007199254740992),/strings/);
});
test('all register aliases share storage with correct partial write behavior',()=>{
 assert.equal(rax('movq $-1,%rax\nmovl $1,%eax'),1n);
 assert.equal(rax('movq $0x1122334455667788,%rax\nmovb $0xaa,%al\nmovw $0xbbcc,%ax\nmovb $0xdd,%ah'),0x112233445566ddccn);
 assert.equal(run('movq $-1,%r15\nmovl $7,%r15d').registers.get('r15'),7n);
 assert.throws(()=>run('movb $1,%al\nmovq %rax,%rdx'),/uninitialized/);
 assert.equal(run('movb $1,%al\nmovb %al,%dl').registers.get('dl'),1);
});
test('little endian memory supports overlapping byte/word/long/quad accesses',()=>{
 const s=run('movb $0xaa,A+1\nmovw A+2,%cx\nmovl A+4,%edx\nmovq A,%rax',{memoryWidth:8,memory:{A:'0x1122334455667788'}});
 assert.equal(s.registers.get('rax'),0x112233445566aa88n);assert.equal(s.registers.get('cx'),0x5566);assert.equal(s.registers.get('edx'),0x11223344);
});
test('LEA performs full-width wrapping math without a memory dereference',()=>{
 assert.equal(rax('leaq (%rdi,%rdi,8),%rax',{registers:{rdi:-3}}),-27n);
 assert.equal(rax('leaq -8(%rdi),%rax',{registers:{rdi:0}}),-8n);
 assert.equal(rax('leaq (%rdi,%rsi,4),%rax',{registers:{rdi:'9007199254740993',rsi:3}}),9007199254741005n);
});
test('64-bit shifts distinguish logical/arithmetic and mask counts',()=>{
 assert.equal(rax('movq $-1,%rax\nshrq $1,%rax'),9223372036854775807n);
 assert.equal(rax('movq $-7,%rax\nsarq $1,%rax'),-4n);
 assert.equal(rax('movq $1,%rax\nmovq $63,%rcx\nshlq %cl,%rax'),-9223372036854775808n);
 assert.equal(rax('movq $9,%rax\nshlq $64,%rax'),9n);
 assert.equal(run('movl $1,%eax\nshll $32,%eax').registers.get('eax'),1);
 assert.equal(rax('movq $1,%rax\nshlq %rax'),2n);
});
test('shift flags: zero preserves, count one defines OF, larger counts invalidate OF',()=>{
 const s=run('movq $1,%rax\ncmpq $1,%rax\nshlq $64,%rax');assert.equal(s.flags.ZF,true);
 const t=run('movq $0x8000000000000000,%rax\nshrq $1,%rax');assert.equal(t.flags.OF,true);assert.equal(t.flags.CF,false);
 assert.throws(()=>run('movq $1,%rax\nshlq $2,%rax\njo end\nend:'),/defined OF/);
});
test('push/pop stack is initialized, little endian, LIFO and balanced',()=>{
 const s=run('pushq $7\npushq $-3\npopq %rax\npopq %rdx');assert.equal(s.registers.get('rax'),-3n);assert.equal(s.registers.get('rdx'),7n);assert.equal(s.registers.get('rsp'),0x8000n);
 assert.throws(()=>run('popq %rax'),/underflow/);
 assert.throws(()=>run('loop: pushq $1\njmp loop'),/overflow/);
});
test('push RSP saves pre-decrement RSP and pop to RSP uses the popped value',()=>{
 const s=run('pushq %rsp\npopq %rax');assert.equal(s.registers.get('rax'),0x8000n);
 const t=run('pushq $0x7ff0\npopq %rsp');assert.equal(t.registers.get('rsp'),0x7ff0n);
});
test('pop memory through RSP computes destination after increment',()=>{
 const s=run('subq $16,%rsp\nmovq $42,(%rsp)\npopq (%rsp)\nmovq (%rsp),%rax\naddq $8,%rsp');assert.equal(s.registers.get('rax'),42n);
});
test('nested calls, ret and leave preserve actual stack return slots',()=>{
 const s=run('main: pushq %rbp\nmovq %rsp,%rbp\ncall helper\nleave\nret\nhelper: movq $7,%rax\nret',{function:true,entry:'main',registers:{rbp:0x6000},abi:true});assert.equal(s.registers.get('rax'),7n);assert.equal(s.registers.get('rbp'),0x6000n);assert.equal(s.registers.get('rsp'),0x8000n);
 assert.throws(()=>run('movq $7,%rax',{function:true}),/must return/);
 assert.throws(()=>run('pushq $9999\nret',{function:true}),/return address/);
 assert.throws(()=>run('call helper\nret\nhelper: ret',{function:true,abi:true}),/aligned/);
});
test('required operations and stack balance cannot be bypassed by correct outputs',()=>{
 const q=bank.questions.find(q=>q.id==='l10-pushpop');assert.equal(E.check(q,'movq %rdi,%rax\nmovq $99,%rdi').ok,false);
 assert.equal(E.check({...q,requirements:[]},'movq %rdi,%rax\nmovq $99,%rdi\npushq $1').ok,false);
});
test('invalid sizes, address forms, shift counts and REX/high-byte combinations fail',()=>{
 for(const p of ['movq %eax,%rax','movl %rax,%eax','pushl %eax','popq %eax','shlq %rcx,%rax','shlq $256,%rax','movq (%rdi,%esi,4),%rax','movq (%rdi,%rsp,4),%rax','leab (%rax),%al','imulb %al,%bl','movb %ah,%r8b','addq $0x100000000,%rax']) assert.throws(()=>E.parse(p),p);
});
test('64-bit TEST and NOT affect the correct width and flags',()=>{
 const s=run('movq $0x100000000,%rax\ntestq %rax,%rax\nnotq %rax');assert.equal(s.flags.ZF,false);assert.equal(s.registers.get('rax'),-4294967297n);
});
test('trace captures registers, flags, and stack states',()=>{
 const s=run('pushq $7\npopq %rax',{}, {trace:true});assert.equal(s.trace.length,2);assert.match(s.trace[1].stack[0],/0x7ff8: 0x7/);
});
test('function contracts reject unpreserved callee-saved registers and helpers',()=>{
 const q={cases:[{name:'callee',function:true,memory:{},expected:{registers:{rax:1}}}]};
 assert.equal(E.check(q,'movq $1,%rax\nmovq $0,%rbx\nret').ok,false);
 assert.throws(()=>run('pushq %rbx\ncall helper\npopq %rbx\nret\nhelper: movq $1,%rbx\nret',{function:true}),/Helper must preserve/);
 assert.throws(()=>run('call helper\njmp end\nhelper: nop\nend:'),/without ret/);
});
test('runtime errors retain a useful partial trace',()=>{
 try {run('movq $1,%rax\nmovq 0x9000,%rax',{}, {trace:true});assert.fail('Should reject missing memory');}catch(e){assert.equal(e.trace.length,2);assert.equal(e.trace[1].registers.rax,'1');}
});
test('zero-count 32-bit shifts zero-extend their register but preserve flags',()=>{
 for(const op of ['shl','sal','shr','sar']) for(const count of ['$0','$32','%cl']) {
  const s=run(`movq $-1,%rax\nmovl $32,%ecx\ncmpq $-1,%rax\n${op}l ${count},%eax`);
  assert.equal(s.registers.get('rax'),0xffffffffn,`${op} ${count}`);
  assert.deepEqual(s.flags,{ZF:true,SF:false,CF:false,OF:false});
 }
 assert.equal(rax('movq $-1,%rax\nshlq $0,%rax'),-1n);
 assert.equal(rax('movq $-1,%rax\nshlw $0,%ax'),-1n);
 assert.equal(rax('movq $-1,%rax\nshlb $0,%al'),-1n);
 const s=run('shll $32,A',{memoryWidth:8,memory:{A:'0x1122334455667788'}});
 assert.equal(s.writes.size,0,'A zero-count memory shift does not write any bytes');
});
test('sign-extended q immediates accept equivalent negative and full-width hex spellings',()=>{
 for(const op of ['and','or','xor','add','sub','cmp','test','imul']) {
  const a=run(`movq $123,%rax\n${op}q $-9,%rax`);
  const b=run(`movq $123,%rax\n${op}q $0xfffffffffffffff7,%rax`);
  assert.equal(a.registers.get('rax'),b.registers.get('rax'),op);assert.deepEqual(a.flags,b.flags,op);
 }
 assert.equal(rax('pushq $0xffffffffffffffff\npopq %rax'),-1n);
 for(const v of ['0x80000000','0xffffffff','0xffffffff7fffffff']) assert.throws(()=>E.parse(`andq $${v},%rax`),/sign-extended/);
 assert.equal(rax('movq $7,%rax\nsubq $0xffffffff80000000,%rax'),2147483655n);
});
test('unreachable required instructions do not satisfy a stack exercise',()=>{
 const q=bank.questions.find(q=>q.id==='l10-pushpop');
 const result=E.check(q,'movq %rdi,%rax\nmovq $99,%rdi\njmp done\npushq %rdi\npopq %rax\ndone:');
 assert.equal(result.ok,false);assert.match(result.message,/never executed/);
});
test('required shifts accept SAL and SHL as synonyms in either direction',()=>{
 const q={requirements:['shl'],cases:[{name:'x',memory:{},registers:{rax:1},expected:{registers:{rax:2}}}]};
 assert.equal(E.check(q,'salq $1,%rax').ok,true);
 assert.equal(E.check({...q,requirements:['sal']},'shlq $1,%rax').ok,true);
});
test('trace includes partial-register aliases and a separate completed final state',()=>{
 const s=run('movb $0xff,%al\nmovb %al,%dl',{}, {trace:true});
 assert.equal(s.trace[1].registers.al,'-1');assert.equal(s.trace[1].registerWidths.al,8);
 assert.equal(s.trace[1].registers.rax,undefined);
 assert.equal(s.finalTrace.phase,'after');assert.equal(s.finalTrace.registers.dl,'-1');
 const t=run('pushq $7\npopq %rax',{}, {trace:true});
 assert.equal(t.finalTrace.registers.rax,'7');assert.equal(t.finalTrace.registers.rsp,'32768');
 const long=run('movl $205,%ecx\nagain: decl %ecx\njne again',{}, {trace:true});
 assert.equal(long.trace.length,200);assert.equal(long.finalTrace.registers.ecx,'0');
});
test('a function falling off the end retains its trace for diagnosis',()=>{
 assert.throws(()=>run('movq $7,%rax',{function:true},{trace:true}),e=>e.trace.length===1&&/must return/.test(e.message));
});
