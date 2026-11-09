(function (root) {
  'use strict';
  const emptyState = () => ({version:1, read:{}, ready:{}, drafts:{}, questions:{}, syntax:{}, report:{}, exam:null});
  function normalizeState(value) {
    const state = emptyState();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return state;
    const object=x=>x && typeof x==='object'&&!Array.isArray(x);
    const safeKey=x=>!['__proto__','constructor','prototype'].includes(x);
    for (const key of ['read','ready','drafts','report']) if(object(value[key])) {
      for(const [id,entry] of Object.entries(value[key])) if(safeKey(id)) {
        if(['read','ready'].includes(key)&&typeof entry==='boolean')state[key][id]=entry;
        if(['drafts','report'].includes(key)&&typeof entry==='string')state[key][id]=entry;
      }
    }
    function attempt(entry){
      if(!object(entry))return {};
      const result={};
      for(const key of ['checked','correct','helpUsed','independent','lastIndependent','pending','reviewed','selfChecked','solved'])if(typeof entry[key]==='boolean')result[key]=entry[key];
      if(Array.isArray(entry.selected))result.selected=[...new Set(entry.selected.filter(n=>Number.isInteger(n)&&n>=0))];
      if(typeof entry.text==='string')result.text=entry.text;
      if(Number.isInteger(entry.attempts)&&entry.attempts>=0)result.attempts=entry.attempts;
      if(Array.isArray(entry.values))result.values=entry.values.map(v=>typeof v==='string'?v:'');
      return result;
    }
    for(const key of ['questions','syntax'])if(object(value[key]))for(const [id,entry] of Object.entries(value[key]))if(safeKey(id))state[key][id]=attempt(entry);
    if (object(value.exam) && Array.isArray(value.exam.ids) && object(value.exam.answers)) {
      const ids=[...new Set(value.exam.ids.filter(id=>typeof id==='string'&&safeKey(id)))];
      const answers={};for(const id of ids)answers[id]=attempt(value.exam.answers[id]);
      state.exam={ids,answers,submitted:value.exam.submitted===true,started:typeof value.exam.started==='string'?value.exam.started:''};
    }
    return state;
  }
  function grade(question, selected) {
    if (!['choice','multi'].includes(question.type)) return null;
    if(!Array.isArray(selected)||selected.some(n=>!Number.isInteger(n)||n<0||n>=question.options.length))return false;
    const expected = question.options.flatMap((option,index) => option.correct ? [index] : []);
    const chosen = [...new Set(selected.map(Number))].sort((a,b)=>a-b);
    return chosen.length === expected.length && chosen.every((n,i)=>n===expected[i]);
  }
  function classifyQuestion(attempt) {
    if (!attempt) return 'new';
    if (attempt.pending) return 'pending';
    if (attempt.checked && !attempt.correct) return 'missed';
    if (attempt.correct && attempt.lastIndependent) return 'independent';
    if (attempt.correct || attempt.selfChecked) return 'reviewed';
    if (attempt.checked) return 'missed';
    if (attempt.helpUsed) return 'reviewed';
    return 'new';
  }
  function coverageTrace(name, count) {
    const a = name !== null;
    const b = a ? name.length !== 0 : null;
    const c = b === true ? count > 0 : null;
    return {a,b,c,result:a && b === true && c === true};
  }
  const coverageCases = [
    {id:'null',label:'null, 1',name:null,count:1},
    {id:'empty',label:'"", 1',name:'',count:1},
    {id:'zero',label:'"Tea", 0',name:'Tea',count:0},
    {id:'valid',label:'"Tea", 1',name:'Tea',count:1},
    {id:'negative',label:'"Tea", -1',name:'Tea',count:-1},
    {id:'another',label:'"Coffee", 5',name:'Coffee',count:5}
  ];
  function coverage(selected) {
    const decisions=new Set(), conditions=new Set();
    const rows=coverageCases.filter(c=>selected.includes(c.id)).map(c=>{
      const trace=coverageTrace(c.name,c.count);
      decisions.add(trace.result);
      for(const name of ['a','b','c']) if(trace[name]!==null) conditions.add(name+':'+trace[name]);
      return {...c,...trace};
    });
    return {rows,decisionCount:decisions.size,conditionCount:conditions.size};
  }
  function chooseExam(questions, random=Math.random) {
    const shuffle=a=>a.map(x=>({x,r:random()})).sort((a,b)=>a.r-b.r).map(x=>x.x);
    const objective=shuffle(questions.filter(q=>q.type!=='write'));
    const written=shuffle(questions.filter(q=>q.type==='write'));
    // Spread tasks across the course, then fill any vacancies.
    function pick(pool,n) {
      const picked=[], seen=new Set();
      for(const q of pool) if(!seen.has(q.lessonId)){picked.push(q);seen.add(q.lessonId);if(picked.length===n)return picked;}
      for(const q of pool) if(!picked.includes(q)){picked.push(q);if(picked.length===n)break;}
      return picked;
    }
    return shuffle([...pick(objective,6),...pick(written,6)]).map(q=>q.id);
  }
  const api={emptyState,normalizeState,grade,classifyQuestion,coverageTrace,coverageCases,coverage,chooseExam};
  root.TestingCore=api;
  if(typeof module==='object' && module.exports) module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
