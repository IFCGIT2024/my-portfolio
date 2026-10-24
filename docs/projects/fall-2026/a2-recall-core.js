/* Assignment 2 recall: deterministic grading, scheduling and portable progress. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.A2Recall = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000, MAX_ANSWER = 12000;
  const idOK = x => typeof x === 'string' && /^[a-z0-9][a-z0-9_-]{0,99}$/i.test(x) && !['constructor','prototype','__proto__'].includes(x);
  const finite = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  const outcomes = ['independent','assisted','self-pass','partial','miss','revealed'];
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
  const dayKey = time => { const d = new Date(time); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
  const clone = x => JSON.parse(JSON.stringify(x));
  function fingerprint(q) {
    let h = 2166136261;
    const s = JSON.stringify([q.topic,q.family,q.stage,q.type,q.prompt,q.code,q.answer,q.accepted,q.rubric,q.hint,q.explanation]);
    for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h,16777619); }
    return (h>>>0).toString(16);
  }
  function findQuestion(bank,id) { return bank.questions.find(q=>q.id===id) || null; }
  function validateBank(bank) {
    const errors=[];
    if (!bank || bank.schemaVersion!==1 || !Array.isArray(bank.topics) || !Array.isArray(bank.questions)) return ['Unsupported or incomplete question bank.'];
    const tids=new Set(), ids=new Set(), families=new Map();
    bank.topics.forEach(t=>{ if (!idOK(t.id)||tids.has(t.id)||typeof t.title!=='string') errors.push('Invalid or duplicate topic: '+t.id); tids.add(t.id); });
    bank.questions.forEach(q=>{
      if (!idOK(q.id)||ids.has(q.id)) errors.push('Invalid or duplicate question: '+q.id); ids.add(q.id);
      if (!tids.has(q.topic)||!idOK(q.family)||![1,2,3,4].includes(q.stage)||!['number','exact','self'].includes(q.type)) errors.push('Invalid classification: '+q.id);
      ['prompt','answer','hint','explanation','source'].forEach(k=>{ if(typeof q[k]!=='string'||!q[k].trim()) errors.push('Missing '+k+': '+q.id); });
      if(q.type==='self'&&(!Array.isArray(q.rubric)||!q.rubric.length)) errors.push('Missing rubric: '+q.id);
      if(q.type==='number'&&!/^[+-]?\d+$/.test(q.answer.trim())) errors.push('Noninteger model: '+q.id);
      if(q.accepted && (!Array.isArray(q.accepted)||q.accepted.some(a=>typeof a!=='string'))) errors.push('Invalid accepted forms: '+q.id);
      if(families.has(q.family)&&families.get(q.family)!==q.topic) errors.push('Family crosses topics: '+q.family);
      families.set(q.family,q.topic);
    });
    return errors;
  }
  function createProgress() { return {version:1,records:{},reviews:{},history:[],session:null,settings:{}}; }
  function settingsFor(bank,s={}) {
    return {topic:s.topic==='all'||bank.topics.some(t=>t.id===s.topic)?s.topic:'all',mode:['focus','mixed','due'].includes(s.mode)?s.mode:'focus',stage:[1,2,3,4].includes(Number(s.stage))?Number(s.stage):1,length:[10,20,40].includes(Number(s.length))?Number(s.length):10};
  }
  function grade(q,raw) {
    if(typeof raw!=='string'||raw.length>MAX_ANSWER) return {valid:false,correct:null,kind:q.type==='self'?'self':'auto',message:'Keep the answer within 12,000 characters.'};
    const answer=raw.trim();
    if(!answer) return {valid:false,correct:null,kind:q.type==='self'?'self':'auto',message:'Write an answer first, or choose Show answer.'};
    if(q.type==='self') return {valid:true,correct:null,kind:'self',message:'Compare your committed answer with each rubric point. Code is not compiled here.'};
    if(q.type==='number') {
      if(!/^[+-]?\d+$/.test(answer)) return {valid:false,correct:null,kind:'auto',message:'Enter one decimal integer, with an optional minus sign.'};
      return {valid:true,correct:BigInt(answer)===BigInt(q.answer.trim()),kind:'auto',message:''};
    }
    // Whitespace and case can change C syntax. Only explicitly listed forms match.
    return {valid:true,correct:[q.answer,...(q.accepted||[])].some(a=>answer===a.trim()),kind:'auto',message:''};
  }
  function shuffle(items,rng) {
    const a=items.slice(); for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;
  }
  function selectSession(bank,db,input,now=Date.now(),rng=Math.random) {
    const settings=settingsFor(bank,input), pool=bank.questions.filter(q=>(settings.topic==='all'||q.topic===settings.topic)&&q.stage<=settings.stage);
    let selected=[];
    if(settings.mode==='due') {
      const due=Object.entries(db.reviews).filter(([,r])=>r.dueAt<=now).sort((a,b)=>a[1].dueAt-b[1].dueAt);
      const used=new Set();
      for(const [family,r] of due){
        const candidates=pool.filter(q=>q.family===family&&!used.has(q.id));
        if(!candidates.length)continue;
        const alternatives=candidates.filter(q=>q.id!==r.lastQuestion);
        const q=shuffle(alternatives.length?alternatives:candidates,rng)[0];
        selected.push({questionId:q.id,reviewOf:r.lastQuestion});used.add(q.id);
        if(selected.length>=settings.length)break;
      }
    } else {
      // Reserve half the round for its highest available level; interleave earlier levels.
      const highest=Math.max(0,...pool.map(q=>q.stage));
      const high=shuffle(pool.filter(q=>q.stage===highest),rng), earlier=shuffle(pool.filter(q=>q.stage<highest),rng);
      const chosen=high.splice(0,Math.min(high.length,Math.ceil(settings.length/2)));
      chosen.push(...earlier.splice(0,settings.length-chosen.length));
      chosen.push(...high.splice(0,settings.length-chosen.length));
      if(settings.mode==='mixed') selected=shuffle(chosen,rng);
      else selected=chosen.sort((a,b)=>bank.topics.findIndex(t=>t.id===a.topic)-bank.topics.findIndex(t=>t.id===b.topic)||a.stage-b.stage);
      selected=selected.map(q=>({questionId:q.id,reviewOf:null}));
    }
    return {id:'round-'+now+'-'+Math.floor(rng()*1e9),settings,items:selected,bankFingerprints:Object.fromEntries(selected.map(i=>[i.questionId,fingerprint(findQuestion(bank,i.questionId))])),index:0,draft:'',confidence:'',hintUsed:false,revealed:false,feedback:null,results:[],startedAt:now};
  }
  function recordAttempt(bank,db,input,now=Date.now()) {
    const q=findQuestion(bank,input.questionId);if(!q)throw new Error('Unknown question.');
    const g=input.revealed?{valid:true,correct:null,kind:q.type==='self'?'self':'auto'}:grade(q,input.answer);
    if(!g.valid)throw new Error(g.message);
    const manual=['needs','partial','pass'].includes(input.rating);
    if(q.type==='self'&&!input.revealed&&!manual)throw new Error('Compare with the rubric before recording a self-check.');
    const kind=manual?'self':g.kind;
    const correct=manual?(input.rating==='pass'?true:input.rating==='needs'?false:null):g.correct;
    const outcome=input.revealed?'revealed':manual?(input.rating==='pass'?(input.hintUsed?'assisted':'self-pass'):input.rating==='partial'?'partial':'miss'):correct?(input.hintUsed?'assisted':'independent'):'miss';
    const date=dayKey(now), fp=fingerprint(q);
    let rec=db.records[q.id];
    if(!rec||rec.fingerprint!==fp)rec={fingerprint:fp,attempts:0,independentCount:0,selfCount:0,assistedCount:0,independentDays:[],selfDays:[],lastAt:now,lastOutcome:outcome};
    rec.attempts++;rec.lastAt=now;rec.lastOutcome=outcome;
    if(outcome==='independent'){rec.independentCount++;if(!rec.independentDays.includes(date))rec.independentDays.push(date);}
    if(outcome==='assisted')rec.assistedCount=(rec.assistedCount||0)+1;
    if(outcome==='self-pass'){rec.selfCount++;if(!rec.selfDays.includes(date))rec.selfDays.push(date);}
    db.records[q.id]=rec;
    let review=db.reviews[q.family]||{lastQuestion:q.id,fingerprint:fp,independentDays:[],independentTimes:[],selfDays:[],intervalDays:0,dueAt:now};
    review.independentTimes=review.independentTimes||[];
    if(outcome==='independent'&&(!review.independentTimes.length||now-review.independentTimes[review.independentTimes.length-1]>=DAY))review.independentTimes.push(now);
    // A family is one skill with different cues, so a variant discharges the same review.
    if(outcome==='independent'&&!review.independentDays.includes(date))review.independentDays.push(date);
    if(outcome==='self-pass'&&!review.selfDays.includes(date))review.selfDays.push(date);
    if(outcome==='independent'||outcome==='self-pass'){
      const intervals=[1,3,7,14];
      const prior=intervals.indexOf(review.intervalDays);
      const continues=review.lastOutcome===outcome&&prior>=0;
      review.intervalDays=continues?(now-review.lastAt<DAY?review.intervalDays:intervals[Math.min(3,prior+1)]):1;
      review.dueAt=now+review.intervalDays*DAY;
    }else{review.intervalDays=0;review.dueAt=now+10*60000;}
    review.lastQuestion=q.id;review.fingerprint=fp;review.lastOutcome=outcome;review.lastAt=now;db.reviews[q.family]=review;
    const feedback={independent:'Correct from memory.',assisted:'Correct with help; scheduled for another attempt.', 'self-pass':'Self-checked against the rubric; not automatically verified.',partial:'Partly recalled; scheduled for another attempt.',miss:'Needs practice; scheduled for another attempt.',revealed:'Answer revealed; scheduled for another attempt.'}[outcome];
    const result={questionId:q.id,reviewOf:input.reviewOf||null,outcome,correct,kind,dueAt:review.dueAt,feedback,at:now};
    db.history.push({...result,answer:String(input.answer||'').slice(0,MAX_ANSWER),confidence:['unsure','okay','sure'].includes(input.confidence)?input.confidence:'',hintUsed:!!input.hintUsed,revealed:!!input.revealed});
    if(db.history.length>5000)db.history.splice(0,db.history.length-5000);
    // Bound exports below the upload limit, even for long Unicode code drafts.
    let retainedSize=db.history.reduce((n,h)=>n+JSON.stringify(h).length,0);
    while(retainedSize>1000000&&db.history.length>1)retainedSize-=JSON.stringify(db.history.shift()).length;
    return result;
  }
  function advanceSession(s){s.index=Math.min(s.items.length,s.index+1);s.draft='';s.confidence='';s.hintUsed=false;s.revealed=false;s.feedback=null;delete s.ui;return s;}
  function topicStats(bank,db,now=Date.now()){
    return bank.topics.map(t=>{
      const qs=bank.questions.filter(q=>q.topic===t.id), families=new Set(qs.map(q=>q.family)), recs=qs.map(q=>db.records[q.id]).filter(Boolean), revs=[...families].map(f=>db.reviews[f]).filter(Boolean);
      return {id:t.id,title:t.title,total:qs.length,seen:recs.length,due:revs.filter(r=>r.dueAt<=now).length,independent:recs.filter(r=>r.independentCount>0).length,selfChecked:recs.filter(r=>r.selfCount>0).length,needsWork:recs.filter(r=>['assisted','partial','miss','revealed'].includes(r.lastOutcome)).length,delayed:revs.filter(r=>(r.independentTimes||[]).length>=2).length};
    });
  }
  function counts(db,now=Date.now()){
    const records=Object.values(db.records),reviews=Object.values(db.reviews);
    return {attempts:records.reduce((n,r)=>n+r.attempts,0),independent:records.reduce((n,r)=>n+r.independentCount,0),assisted:records.reduce((n,r)=>n+(r.assistedCount||0),0),selfChecked:records.reduce((n,r)=>n+r.selfCount,0),due:reviews.filter(r=>r.dueAt<=now).length,delayed:reviews.filter(r=>(r.independentTimes||[]).length>=2).length};
  }
  function serialize(db){return JSON.stringify(db);}
  function restore(bank,raw){
    if(typeof raw==='string'&&raw.length>12000000)throw new Error('Backup is too large.');
    let data;try{data=typeof raw==='string'?JSON.parse(raw):clone(raw);}catch(_){throw new Error('This is not a valid JSON backup.');}
    if(!data||data.version!==1||!data.records||typeof data.records!=='object'||Array.isArray(data.records)||!data.reviews||typeof data.reviews!=='object'||!Array.isArray(data.history))throw new Error('This is not an Assignment 2 recall backup.');
    const db=createProgress();
    const days=x=>Array.isArray(x)&&x.length<=10000&&x.every(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d));
    for(const q of bank.questions){
      if(!own(data.records,q.id))continue;
      const r=data.records[q.id];
      if(!r||r.fingerprint!==fingerprint(q))continue;
      if(![r.attempts,r.independentCount,r.selfCount].every(n=>Number.isSafeInteger(n)&&n>=0)||r.independentCount+r.selfCount>r.attempts||!finite(r.lastAt)||!outcomes.includes(r.lastOutcome)||!days(r.independentDays)||!days(r.selfDays))throw new Error('A progress record is invalid.');
      db.records[q.id]={fingerprint:r.fingerprint,attempts:r.attempts,independentCount:r.independentCount,selfCount:r.selfCount,assistedCount:Number.isSafeInteger(r.assistedCount)&&r.assistedCount>=0?r.assistedCount:0,independentDays:[...new Set(r.independentDays)],selfDays:[...new Set(r.selfDays)],lastAt:r.lastAt,lastOutcome:r.lastOutcome};
    }
    for(const family of new Set(bank.questions.map(q=>q.family))){
      if(!own(data.reviews,family))continue;
      const r=data.reviews[family],q=r&&findQuestion(bank,r.lastQuestion);
      if(!q||q.family!==family||r.fingerprint!==fingerprint(q))continue;
      if(!finite(r.dueAt)||!finite(r.lastAt)||!Array.isArray(r.independentTimes)||r.independentTimes.length>10000||!r.independentTimes.every((t,i,a)=>finite(t)&&(i===0||t-a[i-1]>=DAY))||!days(r.independentDays)||!days(r.selfDays)||![0,1,3,7,14].includes(r.intervalDays)||!outcomes.includes(r.lastOutcome))throw new Error('A review schedule is invalid.');
      db.reviews[family]={lastQuestion:q.id,fingerprint:r.fingerprint,independentDays:[...new Set(r.independentDays)],independentTimes:r.independentTimes.slice(),selfDays:[...new Set(r.selfDays)],intervalDays:r.intervalDays,dueAt:r.dueAt,lastOutcome:r.lastOutcome,lastAt:r.lastAt};
    }
    db.history=data.history.slice(-5000).filter(h=>h&&findQuestion(bank,h.questionId)&&own(db.records,h.questionId)&&outcomes.includes(h.outcome)&&finite(h.at)&&finite(h.dueAt)&&typeof h.answer==='string'&&h.answer.length<=MAX_ANSWER).map(h=>({questionId:h.questionId,reviewOf:findQuestion(bank,h.reviewOf)?h.reviewOf:null,outcome:h.outcome,correct:typeof h.correct==='boolean'?h.correct:null,kind:h.kind==='self'?'self':'auto',dueAt:h.dueAt,feedback:typeof h.feedback==='string'?h.feedback.slice(0,500):'',at:h.at,answer:h.answer,confidence:['unsure','okay','sure'].includes(h.confidence)?h.confidence:'',hintUsed:!!h.hintUsed,revealed:!!h.revealed}));
    db.settings=settingsFor(bank,data.settings||{});
    const s=data.session;
    const resultOK=r=>r&&findQuestion(bank,r.questionId)&&outcomes.includes(r.outcome)&&['auto','self'].includes(r.kind)&&[true,false,null].includes(r.correct)&&finite(r.at)&&finite(r.dueAt)&&typeof r.feedback==='string'&&r.feedback.length<=500;
    const safeResult=r=>({questionId:r.questionId,reviewOf:findQuestion(bank,r.reviewOf)?r.reviewOf:null,outcome:r.outcome,correct:r.correct,kind:r.kind,dueAt:r.dueAt,feedback:r.feedback,at:r.at});
    if(s&&Array.isArray(s.items)&&s.items.length>0&&s.items.length<=40&&s.items.every(i=>i&&findQuestion(bank,i.questionId)&&(!i.reviewOf||findQuestion(bank,i.reviewOf)))&&new Set(s.items.map(i=>i.questionId)).size===s.items.length&&Number.isInteger(s.index)&&s.index>=0&&s.index<=s.items.length&&typeof s.draft==='string'&&s.draft.length<=MAX_ANSWER&&Array.isArray(s.results)&&s.results.length<=s.items.length&&s.results.every((r,i)=>resultOK(r)&&r.questionId===s.items[i].questionId)){
      const active=s.index<s.items.length;
      const phase=s.ui?s.ui.phase:(s.feedback?'done':'answer');
      const ui=s.ui||{};
      const phaseOK=['answer','self','exact-pending','done'].includes(phase)&&['hintShown','referenceUsed','referenceOpen'].every(k=>ui[k]===undefined||typeof ui[k]==='boolean')&&(ui.rating===undefined||ui.rating===null||['needs','partial','pass'].includes(ui.rating));
      const feedbackOK=!s.feedback||(resultOK(s.feedback)&&s.results.length>0&&JSON.stringify(safeResult(s.feedback))===JSON.stringify(safeResult(s.results[s.results.length-1])));
      const activeOK=!active||(s.results.length===s.index+(s.feedback?1:0)&&((phase==='done')===!!s.feedback)&&(!s.feedback||s.feedback.questionId===s.items[s.index].questionId)&&(['self','exact-pending'].includes(phase)?grade(findQuestion(bank,s.items[s.index].questionId),s.draft).valid:true));
      const revisionOK=s.bankFingerprints&&s.items.every(i=>s.bankFingerprints[i.questionId]===fingerprint(findQuestion(bank,i.questionId)));
      if(phaseOK&&feedbackOK&&activeOK&&revisionOK){
        db.session={id:typeof s.id==='string'?s.id.slice(0,100):'restored',settings:settingsFor(bank,s.settings||{}),items:s.items.map(i=>({questionId:i.questionId,reviewOf:i.reviewOf||null})),bankFingerprints:Object.fromEntries(s.items.map(i=>[i.questionId,fingerprint(findQuestion(bank,i.questionId))])),index:s.index,draft:s.draft,confidence:['unsure','okay','sure'].includes(s.confidence)?s.confidence:'',hintUsed:!!s.hintUsed,revealed:!!s.revealed,feedback:s.feedback?safeResult(s.feedback):null,results:s.results.map(safeResult),startedAt:finite(s.startedAt)?s.startedAt:Date.now(),ui:{phase,hintShown:!!ui.hintShown,referenceUsed:!!ui.referenceUsed,referenceOpen:!!ui.referenceOpen,rating:ui.rating||null}};
        if(db.session.ui.hintShown||db.session.ui.referenceUsed)db.session.hintUsed=true;
      }
    }
    return db;
  }
  return {validateBank,createProgress,restore,serialize,selectSession,findQuestion,grade,recordAttempt,advanceSession,topicStats,counts,fingerprint};
});
