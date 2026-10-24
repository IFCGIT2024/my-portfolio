const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../syntax-core.js');
const bank=require('../data/2122-syntax.json');
const copy=x=>JSON.parse(JSON.stringify(x));
function rng(seed=123){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
const correct=db=>db.session.current.order.indexOf(core.find(bank,db.session.current.id).correct);
const answer=(db,kind='correct')=>core.submit(bank,db,kind==='reveal'?null:kind==='miss'?(correct(db)+1)%4:correct(db),1000);

test('bank has complete topic coverage, unique choices and no hidden assignment dependency',()=>{
 assert.deepEqual(core.validate(bank),[]);assert.equal(bank.questions.length,294);assert.equal(bank.topics.length,30);
 for(const t of bank.topics)assert(bank.questions.filter(q=>q.topic===t.id).length>=8,t.id);
 for(const q of bank.questions){
  assert(!/\b(assignment\s+(2|two|document|text)|pdf|provided document|see above)\b/i.test(q.prompt+' '+q.code),q.id);
  assert(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(q.options.join('')),q.id);
 }
 const invalid=copy(bank);invalid.questions[0].options[0]+='\u0001';assert(core.validate(invalid).length);
});

test('every answer is graded using the displayed shuffled order; all four positions occur',()=>{
 const positions=new Set(),random=rng();
 for(const q of bank.questions){
  const db=core.fresh(bank);core.start(bank,db,{topic:q.topic,pattern:q.id,length:'10'},1000,random);
  const index=correct(db);positions.add(index);assert.equal(answer(db),'correct',q.id);
  assert.equal(answer(db),null);assert.equal(db.records[q.id].attempts,1);
 }
 assert.equal(positions.size,4);
});

test('complete mixed pass covers all patterns exactly once and rotates all topics',()=>{
 const db=core.fresh(bank),random=rng(),seen=[];
 core.start(bank,db,{length:'pass'},1000,random);
 while(!db.session.done){seen.push(db.session.current.id);answer(db);core.next(bank,db,random);}
 assert.equal(seen.length,bank.questions.length);assert.equal(new Set(seen).size,bank.questions.length);
 assert.equal(new Set(seen.slice(0,30).map(id=>core.find(bank,id).topic)).size,30);
 assert.equal(db.session.correct,294);assert.equal(db.session.best,294);
});

test('round boundaries and restored progress retain the remainder of a pass',()=>{
 let db=core.fresh(bank);const random=rng(),seen=[];
 core.start(bank,db,{topic:'arrays',length:'10'},1000,random);
 while(!db.session.done){seen.push(db.session.current.id);answer(db);core.next(bank,db,random);}
 db=core.restore(bank,core.serialize(db));core.start(bank,db,{topic:'arrays',length:'pass'},2000,random);
 assert.equal(db.session.limit,2);
 while(!db.session.done){seen.push(db.session.current.id);answer(db);core.next(bank,db,random);}
 assert.equal(seen.length,12);assert.equal(new Set(seen).size,12);
});

test('endless topic mode repeats whole passes, avoids immediate boundary repeats and respects topic',()=>{
 const db=core.fresh(bank),random=rng(),seen=[];
 core.start(bank,db,{topic:'declarations',length:'endless'},1000,random);
 for(let i=0;i<30;i++){seen.push(db.session.current.id);answer(db);core.next(bank,db,random);}
 for(let i=0;i<3;i++)assert.equal(new Set(seen.slice(i*10,(i+1)*10)).size,10);
 assert.notEqual(seen[9],seen[10]);assert.notEqual(seen[19],seen[20]);assert(!db.session.done);
 assert(seen.every(id=>core.find(bank,id).topic==='declarations'));
});

test('one-pattern repetition keeps its identity while reshuffling choices',()=>{
 const db=core.fresh(bank),random=rng(),orders=new Set();
 core.start(bank,db,{topic:'scanf',pattern:'scanf-06',length:'10'},1000,random);
 while(!db.session.done){assert.equal(db.session.current.id,'scanf-06');orders.add(db.session.current.order.join());answer(db);core.next(bank,db,random);}
 assert(orders.size>1);assert.equal(core.stats(bank,db).find(t=>t.id==='scanf').seen,1);
 assert.equal(db.records['scanf-06'].correct,10);
});

test('misses, reminders and reveals never count as unassisted correct choices',()=>{
 const db=core.fresh(bank);core.start(bank,db,{pattern:'masks-01',length:'endless'});
 assert.equal(answer(db,'miss'),'miss');assert(db.records['masks-01'].missed);core.next(bank,db);
 core.assist(db);assert.equal(answer(db),'assisted');core.next(bank,db);
 assert.equal(answer(db,'reveal'),'revealed');core.next(bank,db);
 assert.equal(db.session.correct,0);assert.equal(db.session.streak,0);
 assert.equal(answer(db),'correct');assert(!db.records['masks-01'].missed);
 assert.deepEqual([db.records['masks-01'].attempts,db.records['masks-01'].correct,db.records['masks-01'].assisted,db.records['masks-01'].revealed,db.records['masks-01'].misses],[4,1,1,1,1]);
});

test('missed-only mode contains only weak patterns and finishes when cleared',()=>{
 const db=core.fresh(bank);for(const id of ['masks-01','scanf-01']){core.start(bank,db,{pattern:id});answer(db,'miss');}
 core.start(bank,db,{mode:'missed',length:'endless'});const seen=[];
 while(!db.session.done){seen.push(db.session.current.id);answer(db);core.next(bank,db);}
 assert.deepEqual(seen.sort(),['masks-01','scanf-01']);
 const before=core.serialize(db);assert.equal(core.start(bank,db,{mode:'missed'}),null);assert.equal(core.serialize(db),before);
});

test('pending question and feedback round-trip without changing choices or adding attempts',()=>{
 let db=core.fresh(bank);core.start(bank,db,{length:'10'},1000,rng());
 core.assist(db);let pending=copy(db.session.current);db=core.restore(bank,core.serialize(db));
 assert.deepEqual(db.session.current,pending);assert.equal(core.next(bank,db),null);
 answer(db);const answered=copy(db);db=core.restore(bank,core.serialize(db));assert.deepEqual(db,answered);
 assert.equal(answer(db),null);assert.equal(db.session.answered,1);
});

test('changed banks keep unchanged question records but discard stale sessions and decks',()=>{
 const db=core.fresh(bank);for(const id of ['masks-01','scanf-01']){core.start(bank,db,{pattern:id});answer(db);}
 const changed=copy(bank);changed.questions.find(q=>q.id==='masks-01').prompt+=' Updated.';
 const restored=core.restore(changed,core.serialize(db));
 assert(!restored.records['masks-01']);assert(restored.records['scanf-01']);assert.equal(restored.session,null);assert.deepEqual(restored.decks,{});
});

test('invalid imports cannot restore impossible scores or option maps',()=>{
 const db=core.fresh(bank);core.start(bank,db,{pattern:'masks-01'});answer(db);
 assert.throws(()=>core.restore(bank,'{broken'));assert.throws(()=>core.restore(bank,{version:2}));
 const badRecord=copy(db);badRecord.records['masks-01'].correct=9;assert.throws(()=>core.restore(bank,badRecord));
 const badChoices=copy(db);badChoices.session.current.order=[0,0,2,3];assert.equal(core.restore(bank,badChoices).session,null);
 const badOutcome=copy(db);badOutcome.session.current.outcome='miss';assert.equal(core.restore(bank,badOutcome).session,null);
 assert.throws(()=>core.restore(bank,{...db,decks:[]}));
});

test('invalid settings fall back safely and stopping a round does not invent an attempt',()=>{
 const db=core.fresh(bank);assert.equal(core.settings(bank,null).topic,'all');
 core.start(bank,db,{topic:'bad',pattern:'missing',length:'-3'});
 assert.equal(db.session.limit,25);assert.equal(core.submit(bank,db,9),null);
 core.finish(db);assert(db.session.done);assert.equal(db.session.answered,0);assert.deepEqual(db.records,{});
});
