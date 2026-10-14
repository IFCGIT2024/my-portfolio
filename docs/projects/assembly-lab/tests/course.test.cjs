const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const E=require('../engine.js');
const course=require('../data/lessons.json');
const figures=require('../data/diagrams.json');
const bank=require('../data/manifest.json').banks.flatMap(name=>require('../data/'+name).questions);
const steps=course.lessons.flatMap(l=>l.steps);

test('all banks validate together, including the new first-principles exercises',()=>{
 E.validateBank({schemaVersion:1,questions:bank});
 assert.equal(bank.length,218);
 assert.equal(bank.filter(q=>q.type==='code').length,88);
 assert.equal(bank.reduce((n,q)=>n+(q.cases?.length||0),0),273);
});
test('every concept has a complete learning cycle and only earlier prerequisites',()=>{
 assert.equal(steps.length,75);const seen=new Set();
 for(const step of steps){
  assert.ok(!seen.has(step.id));
  for(const prior of step.requires)assert.ok(seen.has(prior),`${step.id} requires future ${prior}`);
  assert.ok(step.goal&&step.paragraphs.length>=2&&step.worked.goal&&step.worked.reasoning.length>=2,step.id);
  assert.ok(step.teachBack.prompt&&step.teachBack.answer&&step.practice.length,step.id);
  seen.add(step.id);
 }
});
test('worked examples and reference solutions use only instructions already introduced',()=>{
 const known=new Set();
 for(const step of steps){
  for(const op of step.introducesInstructions)known.add(op);
  const solutions=[step.worked.assembly,...step.practice.concat(step.review).flatMap(id=>bank.find(q=>q.id===id).solutions||[])].filter(Boolean);
  for(const source of solutions)for(const instruction of E.parse(source).instructions)
   assert.ok(known.has(instruction.op),`${step.id} uses ${instruction.op} before introduction`);
 }
});
test('cumulative reviews revisit questions already introduced',()=>{
 const seen=new Set();
 for(const step of steps){
  for(const id of step.practice)assert.ok(bank.some(q=>q.id===id),`${step.id}: ${id}`);
  for(const id of step.review)assert.ok(seen.has(id),`${step.id} reviews a future question ${id}`);
  step.practice.forEach(id=>seen.add(id));
 }
});
test('student-facing explanations and questions require no slides or external PDF',()=>{
 const external=/\b(?:slides?|lecture|pdf)\b/i;
 for(const q of bank)for(const key of ['title','question','cCode','explanation','hint'])assert.ok(!external.test(q[key]||''),`${q.id}.${key}`);
 for(const step of steps){
  const text=[step.title,step.goal,...step.paragraphs,step.worked.goal,...step.worked.reasoning,step.teachBack.prompt,step.teachBack.answer].join(' ');
  assert.ok(!external.test(text),step.id);
 }
 const audit=bank.find(q=>q.id==='l10-slide33audit');
 assert.match(audit.question,/leaq 4\(%rdi,%rdi\),%rcx/,'Audit supplies the actual code being interpreted');
});
test('every diagram is local, accessible, and has a full text explanation',()=>{
 assert.equal(Object.keys(figures).length,35);
 for(const step of steps)if(step.diagram)assert.ok(figures[step.diagram],step.id);
 for(const f of Object.values(figures)){
  assert.ok(f.alt.length>40&&f.caption.length>40);
  const svg=fs.readFileSync(path.join(__dirname,'..',f.src),'utf8');
  assert.match(svg,/<title/);assert.match(svg,/<desc/);assert.match(svg,/viewBox=/);
  assert.doesNotMatch(svg,/<script|foreignObject|https?:\/\/(?!www.w3.org)/);
 }
});
test('only the isolated PUSH observation leaves the stack unbalanced',()=>{
 for(const step of steps)if(step.worked.fixture?.checkStack===false)assert.equal(step.id,'stack-push');
 for(const q of bank)for(const fixture of q.cases||[])assert.notEqual(fixture.checkStack,false,q.id);
});
