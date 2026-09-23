const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../engine.js');
const translation=require('../data/translation.json');
const concepts=require('../data/concepts.json');
const question=id=>translation.questions.find(q=>q.id===`code-${String(id).padStart(2,'0')}`);
function result(code,memory={},registers={},symbols={}) {return E.execute(code,{memory,registers,symbols});}
test('every published question validates against independent expected outputs',()=>{
  E.validateBank(translation);E.validateBank(concepts);E.validateBank(require('../data/example.json'));
  assert.equal(translation.questions.reduce((n,q)=>n+q.cases.length,0),102);
});
test('register choice, reordering, and direct memory arithmetic are accepted',()=>{
  assert.equal(E.check(question(1),'mov B, %esi\nmov A, %edi\nadd %esi, %edi\nmov %edi, A').ok,true);
  assert.equal(E.check(question(1),'mov B, %esi\nadd %esi, A').ok,true);
});
test('correct constants for only the example fail other cases',()=>{
  const check=E.check(question(1),'movl $8, A');assert.equal(check.ok,false);
  assert.equal(check.results[0].ok,true);assert.equal(check.results[1].ok,false);
});
test('missing output stores, wrong destination, and aliasing scratch registers fail',()=>{
  for(const code of ['mov A, %eax\nadd B, %eax','mov A, %eax\nadd B, %eax\nmov %eax, B','mov A, %eax\nmov B, %eax\nadd %eax, %eax\nmov %eax, A']) assert.equal(E.check(question(1),code).ok,false);
});
test('both conditional paths execute, and a wrong condition is rejected',()=>{
  assert.equal(E.check(question(8),'cmpl $0, A\njz no\naddl $2, B\njmp end\nno: subl $1, B\nend:').ok,true);
  assert.equal(E.check(question(8),'cmpl $0, A\njnz no\naddl $2, B\njmp end\nno: subl $1, B\nend:').ok,false);
});
test('zero-iteration loop and single-iteration loop work',()=>{
  assert.equal(E.check(question(18),question(18).solutions[0]).ok,true);
  assert.equal(E.check(question(18),'loop: incl B\ndecl A\ncmpl $0, A\njg loop').ok,false);
});
test('parser keeps indexed addresses as a single operand',()=>{
  const parsed=E.parse('move: movl 8(%edx, %ecx, 4), %eax # comment');
  assert.equal(parsed.instructions[0].args.length,2);
  assert.equal(parsed.instructions[0].args[0].scale,4);
  assert.equal(parsed.labels.get('move'),0);
  assert.equal(E.check(question(35),'movl (%edx,%ecx,4), %edi\nmovl %edi, A').ok,true);
});
test('address aliases share actual bytes',()=>{
  const s=result('movl $9, (%edx)\nmovl A, %eax',{A:2},{edx:4096},{A:4096});
  assert.equal(s.registers.get('eax'),9);
});
test('lea computes an address and does not load memory',()=>{
  const s=result('leal 4(%edx,%ecx,4), %eax',{},{edx:4096,ecx:2});assert.equal(s.registers.get('eax'),4108);
  assert.equal(E.check(question(36),'movl arr+4, %eax\nmovl %eax, ptr').ok,false);
  assert.equal(E.check(question(36),'movl $arr+4, %edi\nmovl %edi, ptr').ok,true);
});
test('negative stack offsets and hexadecimal offsets work',()=>{
  assert.equal(E.check(question(27),'movl -0x4(%ebp), %edi\nmovl %edi, A').ok,true);
});
test('automatic memory layout reserves array cells',()=>{
  const s=result('movl arr+4, %eax\nmovl %eax, A',{arr:3,'arr+4':9,A:null});
  assert.equal(s.registers.get('eax'),9);assert.notEqual(s.symbols.get('A'),s.symbols.get('arr')+4);
});
test('byte-addressed overlapping 32-bit loads use little endian',()=>{
  const s=result('movl A+1, %eax',{A:0x44332211,'A+4':0x88776655});assert.equal(s.registers.get('eax'),0x55443322);
});
test('decimal, hex, and binary immediates, comments, inline labels, and separators work',()=>{
  const s=result('start: MOVL $0x10, %EAX; add $0b10, %eax // two more\n subl $-2, %eax');assert.equal(s.registers.get('eax'),20);
});
test('label and symbol case is preserved',()=>{
  assert.throws(()=>E.parse('jmp done\nDone: nop'),/Unknown label/);
  assert.throws(()=>result('movl a, %eax',{A:1}),/Unknown memory symbol/);
});
test('valid aliases jump to a terminal label',()=>{
  const s=result('mov $2,%eax\ncmp $1,%eax\njnle End\nmov $0,%eax\nEnd:');assert.equal(s.registers.get('eax'),2);
});
test('unknown labels are rejected even in unreachable code',()=>assert.throws(()=>E.parse('jmp done\njmp missing\ndone:'),/Unknown label/));
test('duplicate labels rejected',()=>assert.throws(()=>E.parse('x: nop\nx: nop'),/Duplicate label/));
test('unbalanced operands rejected with source line numbers',()=>assert.throws(()=>E.parse('\nmovl 4(%eax,%ecx,4, %ebx'),/Line 2: Unclosed/));
test('wrong operand arity rejected',()=>{
  for(const p of ['movl $1','nop %eax','jmp','movl $1,,%eax']) assert.throws(()=>E.parse(p));
});
test('illegal operand forms and sizes rejected',()=>{
  for(const p of ['movl A,B','movl %eax,$5','imull $2,A','leal $5,%eax','leal A,B','movb $1,%eax','movw $1,%eax','movq $1,%rax','movl $1,%ax','movl (%edx,%esp,4),%eax','movl (%edx,%ecx,3),%eax','movl (%edx,,4),%eax','testl A,%eax']) assert.throws(()=>E.parse(p),p);
});
test('no arbitrary C, directives, or unknown opcode fallback',()=>{
  for(const p of ['.text','alert(1)','eval $1,%eax','call printf','movl $2xyz,%eax']) assert.throws(()=>E.parse(p));
});
test('uninitialized registers and memory fail explicitly',()=>{
  assert.throws(()=>result('addl $1,%eax'),/uninitialized/);
  assert.throws(()=>result('movl A,%eax',{A:null}),/uninitialized/);
});
test('unallocated memory fails reads and writes',()=>{
  assert.throws(()=>result('movl 0x9999,%eax'),/outside/);
  assert.throws(()=>result('movl $1,0x9999'),/outside/);
});
test('untouched input memory is part of the contract',()=>{
  const q=question(1);const code=q.solutions[0]+'\nmovl $99,B';
  assert.equal(E.check(q,code).ok,false);
});
test('infinite loops stop with an actionable error',()=>{
  assert.throws(()=>E.execute('loop: jmp loop',{memory:{}},{maxSteps:20}),/Stopped after 20/);
});
test('32-bit arithmetic wraps and signed overflow flags are set',()=>{
  const s=result('movl $2147483647,%eax\naddl $1,%eax');
  assert.equal(s.registers.get('eax'),-2147483648);assert.equal(s.flags.OF,true);assert.equal(s.flags.SF,true);assert.equal(s.flags.CF,false);
});
test('signed comparison accounts for overflow rather than using SF alone',()=>{
  const s=result('movl $2147483647,%eax\ncmpl $-1,%eax\njg correct\nmovl $0,%eax\njmp done\ncorrect: movl $1,%eax\ndone:');assert.equal(s.registers.get('eax'),1);
  const t=result('movl $2147483647,%eax\ncmpl $-1,%eax\njs negative\nmovl $0,%eax\njmp done\nnegative: movl $1,%eax\ndone:');assert.equal(t.registers.get('eax'),1);
});
test('unsigned carry and signed greater give different results',()=>{
  const s=result('movl $-1,%eax\ncmp $1,%eax\nja high\nmovl $0,%eax\njmp done\nhigh: movl $1,%eax\ndone:');assert.equal(s.registers.get('eax'),1);
});
test('arithmetic updates branch flags; mov and lea preserve them',()=>{
  const s=result('movl $1,%eax\ncmpl $0,%eax\nsubl $1,%eax\nmovl $4,%ebx\nleal 4(%ebx),%edi\nje zero\nmovl $9,%eax\nzero:');assert.equal(s.registers.get('eax'),0);
});
test('inc and dec preserve carry',()=>{
  const s=result('movl $0,%eax\nsubl $1,%eax\nincl %eax\ndecl %eax');assert.equal(s.flags.CF,true);
});
test('test flags do not change operands',()=>{
  const s=result('movl $4,%eax\ntestl $4,%eax');assert.equal(s.registers.get('eax'),4);assert.equal(s.flags.ZF,false);assert.equal(s.flags.CF,false);
});
test('xor zero idiom may initialize a register',()=>assert.equal(result('xorl %eax,%eax').registers.get('eax'),0));
test('two and three operand imul keep correct low bits',()=>{
  assert.equal(result('movl $-3,%eax\nimull $5,%eax').registers.get('eax'),-15);
  assert.equal(result('movl $-3,%eax\nimull $5,%eax,%edx').registers.get('edx'),-15);
  const s=result('movl $2147483647,%eax\nimull $2147483647,%eax');assert.equal(s.registers.get('eax'),1);assert.equal(s.flags.OF,true);
});
test('branching on undefined flags fails instead of guessing',()=>{
  assert.throws(()=>result('je done\ndone:'),/defined ZF/);
  assert.throws(()=>result('movl $2,%eax\nimull $2,%eax\nje done\ndone:'),/defined ZF/);
});
test('bank rejects duplicate IDs and incorrect reference solutions',()=>{
  assert.throws(()=>E.validateBank({schemaVersion:1,questions:[question(1),question(1)]}),/unique/);
  assert.throws(()=>E.validateBank({schemaVersion:1,questions:[{...question(1),solutions:['movl $8,A']}]}),/reference solution fails/);
});
test('bank rejects missing outputs, unallocated outputs, and invalid MCQ answer indexes',()=>{
  const q=structuredClone(question(1));q.cases[0].expected={};
  assert.throws(()=>E.validateBank({schemaVersion:1,questions:[q]}),/explicit expected/);
  q.cases[0].expected={memory:{no_such_variable:1}};
  assert.throws(()=>E.validateBank({schemaVersion:1,questions:[q]}));
  assert.throws(()=>E.validateBank({schemaVersion:1,questions:[{...concepts.questions[0],correctAnswer:10}]}),/invalid multiple-choice/);
});
test('all asset and manifest paths resolve locally',()=>{
  const base=path.join(__dirname,'..'), html=fs.readFileSync(path.join(base,'index.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if(/^https?:/.test(match[1])) continue;
    assert.ok(fs.existsSync(path.resolve(base,match[1])),match[1]);
  }
  for(const f of require('../data/manifest.json').banks)assert.ok(fs.existsSync(path.join(base,'data',f)));
});
