const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
const lessons=require('../data/lessons.json').lessons;
const bank=require('../data/lecture10.json').questions;
for(const lesson of lessons) for(const step of lesson.steps) if(step.worked.assembly) test(`${step.id}: worked example matches its stated result`,()=>{
 const result=E.check({cases:[step.worked.fixture]},step.worked.assembly);
 assert.equal(result.ok,true,JSON.stringify(result));
});
test('lecture swap prediction answers match the actual intermediate states',()=>{
 const state=E.execute('movq (%rdi),%rax\nmovq (%rsi),%rdx\nmovq %rdx,(%rdi)\nmovq %rax,(%rsi)',{
  registers:{rdi:0x120,rsi:0x100},symbols:{X:0x120,Y:0x100},memoryWidth:8,memory:{X:123,Y:456}
 },{trace:true});
 assert.equal(state.trace[1].registers.rax,'123');
 assert.equal(state.trace[2].registers.rdx,'456');
 assert.equal(state.finalTrace.registers.rdi,'288');
 assert.equal(state.finalTrace.registers.rsi,'256');
 const check=E.check({cases:[{name:'swap',registers:{rdi:0x120,rsi:0x100},symbols:{X:0x120,Y:0x100},memoryWidth:8,memory:{X:123,Y:456},expected:{memory:{X:456,Y:456},registers:{rax:123}}}]},'movq (%rdi),%rax\nmovq (%rsi),%rdx\nmovq %rdx,(%rdi)');
 assert.equal(check.ok,true);
});
test('slide address and LEA/MOV predictions agree with execution',()=>{
 const addresses=E.execute('leaq 8(%rdx),%rax\nleaq (%rdx,%rcx),%rbx\nleaq (%rdx,%rcx,4),%rdi\nleaq 0x80(,%rdx,2),%rsi',{registers:{rdx:0xf000,rcx:0x100},memory:{}});
 for(const [reg,value] of Object.entries({rax:0xf008n,rbx:0xf100n,rdi:0xf400n,rsi:0x1e080n})) assert.equal(addresses.registers.get(reg),value);
 const state=E.execute('leaq (%rdx,%rcx,4),%rax\nmovq (%rdx,%rcx,4),%rbx\nleaq (%rdx),%rdi\nmovq (%rdx),%rsi',{registers:{rdx:0x100,rcx:4},symbols:{a:0x100},memoryWidth:8,memory:{a:1,'a+16':8}});
 for(const [reg,value] of Object.entries({rax:0x110n,rbx:8n,rdi:0x100n,rsi:1n})) assert.equal(state.registers.get(reg),value);
});
test('nested-call exercise rejects omission of its explicit RDI clobber',()=>{
 const q=bank.find(q=>q.id==='l10-nested');
 assert.equal(E.check(q,q.solutions[0].replace('movq $0,%rdi\n','')).ok,false);
});
