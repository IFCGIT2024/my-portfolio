const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
const bank=require('../data/control-inline.json').questions;
const steps=require('../data/lessons.json').lessons.flatMap(l=>l.steps);
const run=(code,f={})=>E.execute(code,{memory:{},...f});

test('all extension exercises execute, including extreme comparisons and counter halves',()=>{
 for(const q of bank.filter(q=>q.type==='code'))assert.equal(E.check(q,q.solutions[0]).ok,true,q.id);
});
test('SETcc defines only its destination byte and preserves comparison flags',()=>{
 const s=run('cmpq %rsi,%rdi; sete %al; setne %dl',{registers:{rdi:5,rsi:5,rax:'0x1122334455667788',rdx:0}});
 assert.equal(s.registers.get('rax'),0x1122334455667701n);assert.equal(s.registers.get('dl'),0);
 assert.equal(s.flags.ZF,true);
 const partial=run('cmpq %rsi,%rdi; setg %al; movzbl %al,%eax',{registers:{rdi:9,rsi:4}});
 assert.equal(partial.registers.get('rax'),1n);
});
test('SETcc cannot grade dirty upper bits as a normalized Boolean',()=>{
 const q=bank.find(q=>q.id==='x-greater-int');
 const dirty={...q,cases:q.cases.map(f=>({...f,registers:{...f.registers,rax:-1}}))};
 assert.equal(E.check(dirty,'cmpq %rsi,%rdi;setg %al;ret').ok,false);
 assert.equal(E.check(dirty,q.solutions[0]).ok,true);
});
test('SETcc memory writes exactly one byte and aliases map to canonical predicates',()=>{
 const q=bank.find(q=>q.id==='x-store-bool');
 assert.equal(E.check(q,q.solutions[0].replace('sete','setz')).ok,true);
 assert.equal(E.check(q,'cmpq %rsi,%rdi; movl $1,(%rdx); ret').ok,false);
 const s=run('cmpq $0,%rdi;setnz %al;movzbl %al,%eax',{registers:{rdi:4}});assert.equal(s.registers.get('rax'),1n);
});
test('extension reads the narrow source, preserves flags and applies destination write rules',()=>{
 const f={registers:{rax:'0x1122334455667788'},memory:{B:128},memoryWidth:1};
 let s=run('cmpb $0,B;movsbw B,%ax',f);assert.equal(s.registers.get('rax'),0x112233445566ff80n);assert.equal(s.flags.ZF,false);
 s=run('movsbl B,%eax',f);assert.equal(s.registers.get('rax'),0xffffff80n);assert.equal(s.registers.get('eax'),-128);
 s=run('movsbq B,%rax',f);assert.equal(s.registers.get('rax'),-128n);
 s=run('movzbq B,%rax',f);assert.equal(s.registers.get('rax'),128n);
 s=run('movl $0x80000000,%eax;movslq %eax,%rax');assert.equal(s.registers.get('rax'),-2147483648n);
});
test('invalid extension and SETcc forms fail before execution',()=>{
 for(const code of ['sete %eax','setg $1','movzbl $1,%eax','movsbl %al,B','movzbl %ax,%eax','movzlq %eax,%rax','movsbq %ah,%rax','movsx %al,%rax'])assert.throws(()=>E.parse(code),undefined,code);
 assert.throws(()=>run('sete %al'),/defined ZF/);
 assert.throws(()=>run('movzbq %al,%rax'),/uninitialized/);
});
test('the added flag examples establish the documented flags',()=>{
 let s=run('movq $127,%rax;addb $1,%al');assert.deepEqual(s.flags,{ZF:false,SF:true,CF:false,OF:true});
 s=run('movq $255,%rax;addb $1,%al');assert.deepEqual(s.flags,{ZF:true,SF:false,CF:true,OF:false});
 s=run('movq $127,%rax;addb $1,%al;setg %dl;sets %cl;movzbq %dl,%rdx;movzbq %cl,%rcx');
 assert.equal(s.registers.get('rdx'),1n);assert.equal(s.registers.get('rcx'),1n);
});
test('loop forms retain different initial-zero behavior and full-width popcount',()=>{
 const q=id=>bank.find(q=>q.id===id),one=id=>E.execute(q(id).solutions[0],q(id).cases[0]).registers.get('rax');
 assert.equal(one('x-do-width'),1n);assert.equal(one('x-guarded-visits'),0n);assert.equal(one('x-popcount'),0n);
 const p=q('x-popcount');assert.equal(E.execute(p.solutions[0],p.cases.at(-1)).registers.get('rax'),64n);
});
test('native inline examples are clearly separated from interpreter programs',()=>{
 const native=steps.filter(s=>s.worked.nativeC);assert.equal(native.length,10);
 for(const s of native){assert.equal(s.worked.assembly,'');assert.match(s.worked.goal,/__asm__/);}
 const ids=new Set(steps.map(s=>s.id));
 for(const id of ['register-names','address-data-width','frame-register-names','performance-meaning','zero-extension','set-result','population-count','inline-earlyclobber','counter-delta'])assert.ok(ids.has(id));
});
