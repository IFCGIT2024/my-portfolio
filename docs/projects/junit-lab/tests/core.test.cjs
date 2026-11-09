const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const W=require('../workbench.js');
const fs=require('node:fs');
const path=require('node:path');
const lessons=['01-10','11-20','21-30'].flatMap(part=>JSON.parse(fs.readFileSync(path.join(__dirname,`../data/lessons-${part}.json`),'utf8')));
const questions=lessons.flatMap(l=>l.practice.map(q=>({...q,lessonId:l.id})));

test('every objective question accepts exactly its key and rejects omitted/extra answers',()=>{
  for(const q of questions.filter(q=>q.type!=='write')){
    const expected=q.options.flatMap((o,i)=>o.correct?[i]:[]);
    assert.ok(expected.length>0,q.id);
    if(q.type==='choice')assert.equal(expected.length,1,q.id);
    assert.equal(C.grade(q,expected),true,q.id);
    assert.equal(C.grade(q,[]),false,q.id);
    for(let i=0;i<q.options.length;i++){
      const changed=expected.includes(i)?expected.filter(x=>x!==i):[...expected,i];
      assert.equal(C.grade(q,changed),false,q.id);
    }
  }
});
test('written work never receives an automatic pass',()=>{
  for(const q of questions.filter(q=>q.type==='write'))assert.equal(C.grade(q,[]),null);
});
test('malformed progress cannot make grading throw',()=>{
  const state=C.normalizeState({questions:{x:{selected:'0',checked:true},y:null},drafts:{x:7},read:{x:'yes'},exam:{ids:['x','x',null],answers:{x:{selected:['0',0,-1,0]}}}});
  assert.equal(C.grade(questions[0],state.questions.x.selected),false);
  assert.deepEqual(state.drafts,{});assert.deepEqual(state.read,{});
  assert.deepEqual(state.exam.ids,['x']);assert.deepEqual(state.exam.answers.x.selected,[0]);
  assert.equal(C.grade(questions[0],[999]),false);
});
test('a later mistake remains visible after a historical success',()=>{
  assert.equal(C.classifyQuestion({independent:true,checked:true,correct:false}),'missed');
  assert.equal(C.classifyQuestion({independent:true,pending:true}),'pending');
  assert.equal(C.classifyQuestion({correct:true,lastIndependent:true}),'independent');
  assert.equal(C.classifyQuestion({correct:true,helpUsed:true}),'reviewed');
  assert.equal(C.classifyQuestion({selfChecked:true}),'reviewed');
});
test('short circuiting skips later operands',()=>{
  assert.deepEqual(C.coverageTrace(null,1),{a:false,b:null,c:null,result:false});
  assert.deepEqual(C.coverageTrace('',1),{a:true,b:false,c:null,result:false});
  assert.deepEqual(C.coverageTrace('Tea',0),{a:true,b:true,c:false,result:false});
  assert.deepEqual(C.coverageTrace('Tea',1),{a:true,b:true,c:true,result:true});
});
test('decision coverage is distinct from condition coverage and redundant cases add none',()=>{
  const small=C.coverage(['null','valid']);assert.equal(small.decisionCount,2);assert.equal(small.conditionCount,4);
  const full=C.coverage(['null','empty','zero','valid']);assert.equal(full.conditionCount,6);
  assert.equal(C.coverage(['null','empty','zero','valid','negative','another']).conditionCount,6);
  assert.equal(C.coverage([]).decisionCount,0);
});
test('mixed practice has six objective and six written tasks without duplicate questions or same-type lesson repetition',()=>{
  for(let i=0;i<30;i++){
    const ids=C.chooseExam(questions);assert.equal(ids.length,12);assert.equal(new Set(ids).size,12);
    const selected=ids.map(id=>questions.find(q=>q.id===id));
    const written=selected.filter(q=>q.type==='write'),objective=selected.filter(q=>q.type!=='write');
    assert.equal(written.length,6);assert.equal(objective.length,6);
    assert.equal(new Set(written.map(q=>q.lessonId)).size,6);assert.equal(new Set(objective.map(q=>q.lessonId)).size,6);
  }
});
test('all syntax model answers and alternatives pass their bounded check',()=>{
  for(const drill of W.drills){
    const slots=drill.parts.filter(p=>typeof p!=='string'),values=slots.map(s=>s.answers[0]);
    assert.ok(W.gradeDrill(drill,values).every(Boolean),drill.id);
    for(let i=0;i<slots.length;i++)for(const answer of slots[i].answers){const alt=[...values];alt[i]=answer;assert.ok(W.gradeDrill(drill,alt).every(Boolean));}
  }
});
test('syntax checking preserves tokens and literal contents',()=>{
  assert.deepEqual(W.gradeDrill(W.drills.find(d=>d.id==='return'),['v oid']),[false]);
  assert.deepEqual(W.gradeDrill(W.drills.find(d=>d.id==='void'),['" c "']),[false]);
  assert.deepEqual(W.gradeDrill(W.drills.find(d=>d.id==='biginteger'),['Big Integer.value Of(5)']),[false]);
  assert.deepEqual(W.gradeDrill(W.drills.find(d=>d.id==='throws'),['NumberFormatException.class','() - >']),[true,false]);
  assert.deepEqual(W.gradeDrill(W.drills.find(d=>d.id==='throws'),['NumberFormatException . class','( ) ->']),[true,true]);
});
test('course references and prerequisite graph resolve, with a written transfer task in every lesson',()=>{
  const ids=new Set(),qids=new Set();
  for(const l of lessons){
    assert.ok(!ids.has(l.id));for(const p of l.prerequisites)assert.ok(ids.has(p),`${l.id} prerequisite ${p}`);ids.add(l.id);
    assert.ok(l.worked.intro&&l.worked.steps.length>=3&&l.setup&&l.bridge);
    assert.ok(l.practice.filter(q=>q.type==='write').length>=2);
    for(const q of l.practice){assert.ok(!qids.has(q.id));qids.add(q.id);assert.ok(q.prompt&&q.hint&&q.solution);if(q.type==='write')assert.ok(q.rubric.length>=2);else for(const o of q.options)assert.ok(o.feedback);}
  }
  assert.equal(lessons.length,30);assert.equal(questions.length,124);
});
