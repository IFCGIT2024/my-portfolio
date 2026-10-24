const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../a2-recall-core.js');
const DAY = 86400000, now = new Date(2026,9,24,12).getTime();
function q(id,extra={}){return {id,topic:'bits',family:'index',stage:1,type:'number',prompt:'Index?',answer:'2',hint:'Divide.',explanation:'Byte index.',source:'A2',...extra};}
const bank={schemaVersion:1,topics:[{id:'bits',title:'Bits'}],questions:[q('a'),q('b'),q('syntax',{family:'call',stage:2,type:'exact',answer:'%x',accepted:['"%x"']}),q('method',{family:'method',stage:4,type:'self',answer:'unsigned f(void) { return 0; }',rubric:['Correct type.']})]};
const attempt=(db,id,extra={},time=now)=>C.recordAttempt(bank,db,{questionId:id,answer:'2',...extra},time);
test('bank validation detects unsafe identifiers and missing rubrics',()=>{
 assert.deepEqual(C.validateBank(bank),[]);
 assert.ok(C.validateBank({...bank,questions:[q('__proto__'),q('manual',{type:'self'})]}).length>=2);
});
test('numeric grading rejects malformed input without logging, accepts integer formatting',()=>{
 const db=C.createProgress();
 for(const s of ['','2x','2.0','0x2','Infinity','2 3'])assert.equal(C.grade(bank.questions[0],s).valid,false);
 assert.equal(C.grade(bank.questions[0],'+002').correct,true);
 assert.throws(()=>attempt(db,'a',{answer:'2x'}));assert.equal(C.counts(db).attempts,0);
 assert.equal(C.grade(bank.questions[0],'9'.repeat(500)).correct,false);
});
test('exact syntax preserves C case and interior whitespace; listed alternatives work',()=>{
 const q=bank.questions[2];assert.equal(C.grade(q,'%x').correct,true);assert.equal(C.grade(q,'"%x"').correct,true);assert.equal(C.grade(q,'%X').correct,false);
});
test('self assessment and hints never award automated independent evidence',()=>{
 const db=C.createProgress();
 assert.throws(()=>attempt(db,'method',{answer:'my code'}));
 assert.equal(attempt(db,'method',{answer:'my code',rating:'pass'}).outcome,'self-pass');
 assert.equal(attempt(db,'a',{hintUsed:true}).outcome,'assisted');
 assert.equal(attempt(db,'syntax',{answer:'%x',rating:'pass'}).outcome,'self-pass');
 assert.equal(attempt(db,'b',{answer:'',revealed:true}).outcome,'revealed');
 assert.equal(C.counts(db).independent,0);assert.equal(C.counts(db).selfChecked,2);
});
test('separate-day recall extends spacing; same-day repetition does not; a miss resets spacing',()=>{
 const db=C.createProgress();attempt(db,'a');assert.equal(db.reviews.index.intervalDays,1);
 attempt(db,'b',{},now+1000);assert.equal(db.reviews.index.intervalDays,1);assert.equal(C.counts(db).delayed,0);
 attempt(db,'b',{},now+DAY+1000);assert.equal(db.reviews.index.intervalDays,3);assert.equal(C.counts(db).delayed,1);
 attempt(db,'a',{answer:'4'},now+2*DAY);assert.equal(db.reviews.index.intervalDays,0);
 attempt(db,'b',{},now+2*DAY+1000);assert.equal(db.reviews.index.intervalDays,1);
});
test('due mode never substitutes fresh work, prefers a variant, and discharges family review',()=>{
 const db=C.createProgress(), opts={mode:'due',topic:'all',stage:4,length:10};
 assert.equal(C.selectSession(bank,db,opts,now).items.length,0);
 attempt(db,'a');assert.equal(C.selectSession(bank,db,opts,now).items.length,0);
 const s=C.selectSession(bank,db,opts,now+DAY,()=>0);
 assert.deepEqual(s.items,[{questionId:'b',reviewOf:'a'}]);
 attempt(db,'b',{reviewOf:'a'},now+DAY);
 assert.equal(C.selectSession(bank,db,opts,now+DAY).items.length,0);
});
test('cumulative sessions include the requested advanced level without duplicates',()=>{
 const s=C.selectSession(bank,C.createProgress(),{mode:'mixed',topic:'bits',stage:4,length:10},now,()=>0.5);
 assert.ok(s.items.some(i=>i.questionId==='method'));assert.equal(new Set(s.items.map(i=>i.questionId)).size,s.items.length);
 const basic=C.selectSession(bank,C.createProgress(),{stage:1},now);assert.ok(basic.items.every(i=>C.findQuestion(bank,i.questionId).stage===1));
});
test('round trip restores progress, committed draft, and feedback without recording twice',()=>{
 const db=C.createProgress();db.session=C.selectSession(bank,db,{stage:1},now,()=>0);
 db.session.draft='2';const result=attempt(db,db.session.items[0].questionId);db.session.feedback=result;db.session.results.push(result);db.session.ui={phase:'done'};
 const restored=C.restore(bank,C.serialize(db));assert.deepEqual(restored.records,db.records);assert.equal(restored.session.draft,'2');assert.equal(C.counts(restored).attempts,1);
 C.advanceSession(restored.session);assert.equal(restored.session.draft,'');assert.equal(restored.session.feedback,null);assert.equal(restored.session.ui,undefined);
});
test('imports reject malformed records and invalidate changed question content',()=>{
 const db=C.createProgress();attempt(db,'a');db.session=C.selectSession(bank,db,{stage:1},now);
 const broken=JSON.parse(C.serialize(db));broken.records.a.attempts=-1;assert.throws(()=>C.restore(bank,broken));
 assert.throws(()=>C.restore(bank,'not json'));assert.throws(()=>C.restore(bank,{version:42}));
 const changed={...bank,questions:bank.questions.map(x=>x.id==='a'?{...x,answer:'3'}:x)};
 const restored=C.restore(changed,C.serialize(db));assert.equal(restored.records.a,undefined);assert.equal(restored.reviews.index,undefined);assert.equal(restored.session,null);
});

test('midnight crossing is not delayed recall and malformed session state is dropped',()=>{
 const db=C.createProgress(),before=new Date(2026,9,24,23,59).getTime();
 attempt(db,'a',{},before);attempt(db,'b',{},before+120000);
 assert.equal(C.counts(db).delayed,0);assert.equal(db.reviews.index.intervalDays,1);
 db.session=C.selectSession(bank,db,{stage:1},now);db.session.ui={phase:'surprise'};
 const restored=C.restore(bank,C.serialize(db));assert.equal(restored.session,null);assert.equal(C.counts(restored).attempts,2);
});
