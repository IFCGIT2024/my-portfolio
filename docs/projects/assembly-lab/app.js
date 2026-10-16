/* Static browser application; banks are data, never executable JavaScript. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'mizel:assembly-lab:progress:v1';
  const engine = window.AssemblyEngine;
  let lessons=[], diagrams={}, lessonId='00-foundations', stepId='state', practiceScope='step', trace=[];
  const chapterQuestions=new Map();
  let bank = [], mode = 'code', topic = 'all', currentId = null, completedView = false;
  let saved = {records:{}, last:{}, steps:{}, readSteps:{}, mode:'code'};
  const fingerprints = new Map();
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function label(text) { return text.split('-').map(v=>v.charAt(0).toUpperCase()+v.slice(1)).join(' '); }
  function fingerprint(q) {
    // Reordering banks preserves progress; editing a question invalidates its old result.
    let h = 2166136261;
    for (const char of JSON.stringify(q)) { h ^= char.charCodeAt(0); h = Math.imul(h,16777619); }
    return (h>>>0).toString(16);
  }
  function record(q) {
    const r = saved.records[q.id];
    if (r && r.fingerprint===fingerprints.get(q.id)) return r;
    return saved.records[q.id] = {fingerprint:fingerprints.get(q.id), attempts:0, passed:false, revealed:false, draft:'', selected:null};
  }
  function persist() {
    saved.courseVersion=2;saved.lesson=lessonId;saved.scope=practiceScope;
    saved.steps??={};saved.readSteps??={};if(currentStep())saved.steps[lessonId]=stepId;
    saved.mode = mode; saved.last[mode] = currentId;
    try { localStorage.setItem(KEY,JSON.stringify(saved)); }
    catch { $('storage-status').hidden=false; $('storage-status').textContent='Browser storage is unavailable or full. You can keep practicing, but progress may not survive a refresh.'; }
  }
  function restore() {
    try {
      const raw=localStorage.getItem(KEY);
      if (!raw) return;
      const data=JSON.parse(raw);
      if (!data || typeof data.records!=='object' || !data.records || Array.isArray(data.records)) throw Error('Invalid progress');
      saved.records={}; saved.last={};
      for (const q of bank) {
        const r=data.records[q.id];
        if (!r || r.fingerprint!==fingerprints.get(q.id)) continue;
        saved.records[q.id]={fingerprint:r.fingerprint,attempts:Number.isSafeInteger(r.attempts)&&r.attempts>=0?r.attempts:0,passed:r.passed===true,revealed:r.revealed===true,draft:typeof r.draft==='string'?r.draft.slice(0,50000):'',selected:Number.isInteger(r.selected)&&r.selected>=0&&r.selected<(q.options?.length||0)?r.selected:null,answered:r.answered===true};
      }
      for (const type of ['code','mcq']) if (bank.some(q=>q.type===type && q.id===data.last?.[type])) saved.last[type]=data.last[type];
      if (['code','mcq'].includes(data.mode)) mode=data.mode;
      // Keep old answers/drafts, but introduce the new beginner path at its beginning.
      if(data.courseVersion===2) {
        if(['all','original',...lessons.map(l=>l.id)].includes(data.lesson)) lessonId=data.lesson;
        saved.steps={};saved.readSteps={};
        for(const l of lessons) {
          if(l.steps.some(s=>s.id===data.steps?.[l.id]))saved.steps[l.id]=data.steps[l.id];
          for(const step of l.steps)if(data.readSteps?.[step.id]===true)saved.readSteps[step.id]=true;
        }
        stepId=saved.steps[lessonId]||currentLesson()?.steps[0]?.id||null;
        if(['step','chapter'].includes(data.scope))practiceScope=data.scope;
      }
    } catch {
      $('storage-status').hidden=false;
      $('storage-status').textContent='Saved progress could not be read. This session starts with a clean progress record.';
    }
  }
  function currentLesson(){return lessons.find(l=>l.id===lessonId);}
  function currentStep(){return currentLesson()?.steps.find(s=>s.id===stepId);}
  function stepQuestions(){const s=currentStep();return s?[...new Set([...s.practice,...s.review])]:[];}
  function inLesson(q) {return lessonId==='all'||(lessonId==='original'?!q.lesson:chapterQuestions.get(lessonId)?.has(q.id));}
  function inScope(q){return inLesson(q)&&(practiceScope!=='step'||!currentStep()||stepQuestions().includes(q.id));}
  function scopedQuestions(){return practiceScope==='step'&&currentStep()?stepQuestions().map(id=>bank.find(q=>q.id===id)):bank.filter(inLesson);}
  function filtered() {return scopedQuestions().filter(q=>q.type===mode&&(topic==='all'||q.category===topic));}
  function current() { return bank.find(q=>q.id===currentId); }
  function counters(list) {
    const records=list.map(record);
    return {solved:records.filter(r=>r.passed&&!r.revealed).length,reviewed:records.filter(r=>r.revealed).length,attempts:records.reduce((sum,r)=>sum+r.attempts,0),untouched:records.filter(r=>!r.attempts&&!r.revealed).length};
  }
  function updateStats() {
    const list=filtered(), count=counters(list);
    $('stats').textContent=`${count.solved} solved independently · ${count.reviewed} reviewed · ${count.attempts} attempts`;
    $('progress').max=list.length||1; $('progress').value=count.solved;
    renderCourseProgress();
    $('progress-text').textContent=list.length?`Question ${list.findIndex(q=>q.id===currentId)+1} of ${list.length}`:'No questions in this mode';
    $('question-select').replaceChildren(...list.map((q,i)=>{
      const r=record(q), option=node('option',`${i+1}. ${q.title}${r.passed&&!r.revealed?' ✓':r.revealed?' · reviewed':''}`);
      option.value=q.id; option.selected=q.id===currentId; return option;
    }));
  }
  function updateFilters() {
    $('practice-scope').disabled=!currentStep();$('practice-scope').value=currentStep()?practiceScope:'chapter';
    $('topic-label').hidden=practiceScope==='step'&&!!currentStep();
    $('practice-context').textContent=currentStep()?(practiceScope==='step'?`Practice this concept: ${currentStep().title}. Earlier review questions are included after the focused tasks.`:`Chapter review: ${currentLesson().title}. This includes all concepts in the chapter.`):'Browse the full selected practice bank.';
    const categories=[...new Set(bank.filter(q=>inScope(q)&&q.type===mode).map(q=>q.category))];
    if(!categories.includes(topic)) topic='all';
    $('topic').replaceChildren(...['all',...categories].map(category=>{
      const option=node('option',category==='all'?'All topics':label(category)); option.value=category; return option;
    })); $('topic').value=topic;
    $('code-total').textContent=bank.filter(q=>inScope(q)&&q.type==='code').length;
    $('mcq-total').textContent=bank.filter(q=>inScope(q)&&q.type==='mcq').length;
    for(const type of ['code','mcq']) {$(type+'-mode').setAttribute('aria-pressed',String(type===mode));$(type+'-mode').disabled=!bank.some(q=>inScope(q)&&q.type===type);}
  }
  function renderCases(q) {
    $('case-summary').textContent=`Starting state & ${q.cases.length} test cases`;
    $('cases').replaceChildren();
    for (const fixture of q.cases) {
      const block=node('div',undefined,'case'); block.append(node('h4',fixture.name));
      block.append(node('p',`${fixture.function?'Function: finish with ret. Entry: '+(fixture.entry||'first instruction')+'.':'Snippet: finish at the end.'} Memory cells: ${fixture.memoryWidth||4} bytes unless overridden.`));
      const advanced=node('details');advanced.append(node('summary','Stack and register-preservation details'));
      advanced.append(node('p',`${fixture.function?'RSP starts at 0x7ff8 with a return address. Preserve RBX, RBP, R12–R15; the checker supplies initial values.':'RSP starts at 0x8000.'} Balance the stack before finishing.${fixture.abi?' Check 16-byte alignment before calls.':''}${fixture.preserveRegisters?.length?' Also preserve: '+fixture.preserveRegisters.join(', ')+'.':''}`));block.append(advanced);
      if(fixture.memoryWidths) block.append(node('p','Cell width overrides: '+JSON.stringify(fixture.memoryWidths)));
      const table=node('table'), head=node('thead'), tr=node('tr');
      for(const title of ['Memory','Starts as','Required result']) {const th=node('th',title);th.scope='col';tr.append(th);} head.append(tr);table.append(head);
      const body=node('tbody');
      for(const [key,value] of Object.entries(fixture.memory)) {
        const row=node('tr');
        const expected=fixture.expected.memory||{};
        row.append(node('td',key),node('td',value===null?'Uninitialized':value),node('td',Object.hasOwn(expected,key)?expected[key]:'Preserve'));
        body.append(row);
      }
      table.append(body);block.append(table);
      const pairs=obj=>Object.entries(obj||{}).map(([key,value])=>`${key} = ${value}`).join(' · ');
      if(fixture.registers) block.append(node('p','Given registers: '+pairs(fixture.registers)));
      if(fixture.symbols) block.append(node('p','Addresses: '+Object.entries(fixture.symbols).map(([k,v])=>`${k} = 0x${engine.integer(v).toString(16)}`).join(' · ')));
      if(fixture.expected.registers) block.append(node('p','Required registers: '+pairs(fixture.expected.registers)));
      $('cases').append(block);
    }
  }
  function feedback(message, type='info') {
    $('feedback').className='feedback '+type; $('feedback').replaceChildren(node('p',message)); $('feedback').hidden=false;
  }
  function renderOptions(q,r) {
    $('options').replaceChildren(...q.options.map((text,i)=>{
      const option=node('label',undefined,'option'), input=document.createElement('input');
      input.type='radio';input.name='answer';input.value=i;input.checked=r.selected===i;input.disabled=r.answered===true;
      input.addEventListener('change',()=>{r.selected=i;persist();});
      option.append(input,node('span',text));
      if(r.answered && i===q.correctAnswer) option.classList.add('correct');
      if(r.answered && r.selected===i && i!==q.correctAnswer) option.classList.add('wrong');
      return option;
    }));
  }
  function render() {
    completedView=false; $('summary').hidden=true;
    const list=filtered();
    if(!list.some(q=>q.id===currentId)) currentId=list[0]?.id||null;
    const q=current();
    $('trace-panel').hidden=true;
    $('exercise').hidden=!q;
    updateStats();
    if(!q) return;
    const r=record(q);
    $('question-meta').textContent=currentStep()?(currentStep().review.includes(q.id)?'Review an earlier idea':'Practice the current idea'):label(q.category);
    $('question-title').textContent=q.title;
    $('code-exercise').hidden=mode!=='code'; $('mcq-exercise').hidden=mode!=='mcq';
    for(const id of ['feedback','hint','solution']) $(id).hidden=true;
    $('trace-button').hidden=mode!=='code';
    $('hint-button').hidden=mode!=='code'; $('solution-button').hidden=mode!=='code';
    $('check').disabled=false; $('check').textContent='Check answer';
    $('previous').disabled=list[0].id===q.id;
    $('next').textContent=list.at(-1).id===q.id?'View summary →':'Next →';
    if(mode==='code') {
      $('data-model').textContent=q.dataModel||'Legacy 32-bit model: signed integers and pointer slots are 4 bytes';
      $('solution-explanation').textContent=q.explanation||'Follow each instruction from the supplied inputs to the required outputs. Temporary registers can differ from this example.';
      $('c-code').textContent=q.cCode; $('assembly-input').value=r.draft;
      $('hint').textContent=q.hint; $('solution-code').textContent=q.solutions[0];
      const outputs=[...new Set(q.cases.flatMap(c=>[...Object.keys(c.expected.memory||{}),...Object.keys(c.expected.registers||{}).map(k=>'%'+k)]))];
      $('output-contract').textContent=`Required outputs: ${outputs.join(', ')}. Each case starts fresh; other input memory must keep its initial value.${q.requirements?.length ? " Practice requirement: use "+q.requirements.join(", ")+"." : ""}`;
      renderCases(q);
      if(r.passed) feedback(r.revealed?'Previously passed after reviewing the solution. You can keep practicing.':'Previously solved independently. You can try another implementation.','success');
      else if(r.revealed) feedback('You reviewed the solution for this question. Try reconstructing it from memory.');
    } else {
      $('mcq-prompt').textContent=q.question;
      renderOptions(q,r);
      if(r.answered) {
        feedback((r.selected===q.correctAnswer?'Correct. ':'Review this concept. ')+q.explanation,r.selected===q.correctAnswer?'success':'info');
        $('check').textContent='Try again';
      }
    }
    persist();
  }
  function checkAnswer() {
    if(completedView) return;
    const q=current(); if(!q) return;
    const r=record(q);
    if(mode==='code') {
      r.draft=$('assembly-input').value;
      if(!r.draft.trim()) {feedback('Enter your assembly code before checking.');return;}
      r.attempts++;
      const result=engine.check(q,r.draft);
      feedback(result.message,result.ok?'success':'error');
      if(result.ok) r.passed=true;
      else {
        const first=result.results?.find(v=>!v.ok);
        if(first) {
          const list=node('ul');list.append(node('li',first.name));
          if(first.error) list.append(node('li',first.error));
          for(const d of first.differences||[]) list.append(node('li',`${d.location}: expected ${d.expected}, got ${d.actual}.`));
          $('feedback').append(list);
        }
      }
    } else {
      if(r.answered) {r.answered=false;r.selected=null;render();return;}
      if(r.selected===null) {feedback('Choose an answer before checking.');return;}
      r.attempts++;r.answered=true;
      const correct=r.selected===q.correctAnswer;
      if(correct) r.passed=true;
      // Once an explanation is displayed, subsequent attempts are review.
      if(!correct && !r.passed) r.revealed=true;
      feedback((correct?'Correct. ':'Not quite. ')+q.explanation,correct?'success':'error');
      renderOptions(q,r);$('check').textContent='Try again';
    }
    persist();updateStats();
  }
  function summary() {
    completedView=true; $('exercise').hidden=true; $('summary').hidden=false;
    const list=filtered(), count=counters(list);
    $('summary-text').textContent=`${count.solved} of ${list.length} solved independently, ${count.reviewed} reviewed, ${count.untouched} not yet attempted. ${count.attempts} total attempts.`;
    $('progress-text').textContent='End of set';
    $('continue-concept').hidden=practiceScope!=='step'||!currentStep();
    const other=mode==='code'?'mcq':'code';
    if(practiceScope==='step'&&currentStep()&&scopedQuestions().some(q=>q.type===other)) $('summary-text').textContent+=` This concept also has ${other==='code'?'code translation':'concept'} practice; use the mode buttons to try it.`;
  }
  function move(delta) {
    const list=filtered(), index=list.findIndex(q=>q.id===currentId)+delta;
    if(index>=list.length) {summary();return;}
    if(index>=0) {currentId=list[index].id;render();}
  }
  function changeMode(next) { saved.last[mode]=currentId;mode=next;topic='all';currentId=saved.last[mode];
    if(!bank.some(q=>inScope(q)&&q.type===mode)) mode=bank.find(inScope)?.type||'code';
    renderLesson();updateFilters();render(); }
  async function fetchJSON(url) {
    const response=await fetch(url,{cache:'no-cache'});
    if(!response.ok) throw Error(`Could not load ${url} (HTTP ${response.status}).`);
    return response.json();
  }
  async function start() {
    if(!engine) throw Error('The assembly checker did not load. Refresh to retry.');
    const manifest=await fetchJSON('data/manifest.json');
    if(manifest.schemaVersion!==1 || !Array.isArray(manifest.banks) || !manifest.banks.length || manifest.banks.some(path=>typeof path!=='string'||!/^[a-z0-9-]+\.json$/.test(path))) throw Error('Invalid question-bank manifest.');
    const banks=await Promise.all(manifest.banks.map(path=>fetchJSON('data/'+path)));
    for(const b of banks) engine.validateBank(b);
    const combined=engine.validateBank({schemaVersion:1,questions:banks.flatMap(b=>b.questions)});
    bank=combined.questions;
    const [course,figures]=await Promise.all([fetchJSON('data/lessons.json'),fetchJSON('data/diagrams.json')]);
    if(course.schemaVersion!==2)throw Error('The course files are from different versions. Refresh to load the update.');
    lessons=course.lessons;diagrams=figures;
    for(const l of lessons)chapterQuestions.set(l.id,new Set(l.steps.flatMap(s=>[...s.practice,...s.review])));
    for(const q of bank) fingerprints.set(q.id,fingerprint(q));
    restore();
    currentId=saved.last[mode];
    if(!bank.some(q=>inScope(q)&&q.type===mode)) mode=bank.find(inScope)?.type||'code';
    renderLesson();updateFilters();render();
    $('load-status').hidden=true;$('app').hidden=false;
  }
  function renderCourseProgress() {
    if(!lessons.length) return;
    const ids=new Set([...chapterQuestions.values()].flatMap(set=>[...set]));
    const list=bank.filter(q=>ids.has(q.id)),count=counters(list),steps=lessons.flatMap(l=>l.steps);
    const read=steps.filter(s=>saved.readSteps?.[s.id]).length;
    $('course-progress').textContent=`${lessons.length} chapters · ${steps.length} small concepts · ${read} marked read · ${count.solved} practice questions solved independently. Reading progress and demonstrated understanding are separate.`;
  }
  function setPractice(id) {
    const q=bank.find(q=>q.id===id);if(!q)return;
    practiceScope='step';topic='all';mode=q.type;currentId=id;
    updateFilters();render();$('exercise').scrollIntoView?.({behavior:'smooth',block:'start'});$('exercise').focus({preventScroll:true});
  }
  function renderLesson() {
    $('lesson-select').replaceChildren(...[...lessons.map((l,i)=>({id:l.id,title:`${i+1}. ${l.title}`})),{id:'original',title:'Original practice — 32-bit refresher'},{id:'all',title:'All practice — the complete bank'}].map(l=>{const o=node('option',l.title);o.value=l.id;o.selected=l.id===lessonId;return o;}));
    const area=$('lesson-content');area.replaceChildren();
    const l=currentLesson(),index=lessons.indexOf(l);
    $('lesson-prev').disabled=index<=0;$('lesson-next').disabled=index<0||index===lessons.length-1;
    if(!l) {area.append(node('p','Choose a chapter above to learn one concept at a time. The full practice banks remain available here.'));return;}
    const step=currentStep();if(!step)return;
    const at=l.steps.indexOf(step);
    area.append(node('h3',l.title),node('p',l.goal,'chapter-goal'));
    const nav=node('div',undefined,'concept-toolbar'),labelEl=node('label','Concept '),select=node('select');select.id='concept-select';
    for(const [i,s] of l.steps.entries()){const o=node('option',`${i+1}. ${s.title}${saved.readSteps?.[s.id]?' · read':''}`);o.value=s.id;o.selected=s.id===stepId;select.append(o);}
    select.addEventListener('change',()=>chooseStep(select.value));labelEl.append(select);nav.append(labelEl);area.append(nav);
    const card=node('article',undefined,'concept-card');card.id='concept-card';card.tabIndex=-1;
    card.append(node('p',`Concept ${at+1} of ${l.steps.length} · one new idea`,'eyebrow'),node('h4',step.title),node('p',step.goal,'concept-goal'));
    if(step.requires.length) {
      const prior=lessons.flatMap(l=>l.steps).find(s=>s.id===step.requires[0]);
      const recap=node('p','Builds on: ','recap'),back=node('button',prior.title,'text-button');
      back.addEventListener('click',()=>jumpToStep(prior.id));recap.append(back);card.append(recap);
    } else card.append(node('p','Start here. You do not need previous assembly knowledge or a separate set of notes.','recap'));
    for(const paragraph of step.paragraphs)card.append(node('p',paragraph));
    if(step.diagram) {
      const d=diagrams[step.diagram],figure=node('figure',undefined,'lesson-diagram'),img=document.createElement('img');
      img.src=d.src;img.alt=d.alt;img.decoding='async';figure.append(img,node('figcaption',d.caption));card.append(figure);
    }
    const worked=node('section',undefined,'worked-example');worked.append(node('h5','See one complete example'));
    if(step.worked.nativeC) worked.append(node('p','Native C example: compile with GCC. The practice below checks your understanding of the interface; this browser does not compile inline assembly.','small'));
    const columns=node('div',undefined,step.worked.assembly?'code-panels':'example-goal');
    const goal=node('div',undefined,'panel');goal.append(node('h6','Goal / starting information'));const pre=node('pre');pre.append(node('code',step.worked.goal));goal.append(pre);columns.append(goal);
    if(step.worked.assembly){const asm=node('div',undefined,'panel');asm.append(node('h6','Assembly'));const code=node('pre');code.append(node('code',step.worked.assembly));asm.append(code);columns.append(asm);}
    worked.append(columns);const reasoning=node('ol');for(const line of step.worked.reasoning)reasoning.append(node('li',line));worked.append(reasoning);card.append(worked);
    const teach=node('section',undefined,'teach-back');teach.append(node('h5','Explain it in your own words'),node('p',step.teachBack.prompt));
    const answer=node('details');answer.append(node('summary','Compare with an explanation'),node('p',step.teachBack.answer));teach.append(answer);card.append(teach);
    const practice=node('section',undefined,'step-practice');practice.append(node('h5','Try it yourself'));
    for(const [ids,review] of [[step.practice,false],[step.review,true]]) {
      if(review&&ids.length)practice.append(node('p','Bring back an earlier idea','small'));
      const links=node('div',undefined,'practice-links');
      for(const id of ids){const q=bank.find(q=>q.id===id),button=node('button',`${q.type==='code'?'Code':'Concept'}: ${q.title}`);button.addEventListener('click',()=>setPractice(id));links.append(button);}practice.append(links);
    }
    card.append(practice);
    const actions=node('div',undefined,'concept-actions'),prev=node('button','← Previous concept');prev.id='concept-prev';prev.disabled=index===0&&at===0;prev.addEventListener('click',()=>moveConcept(-1));
    const next=node('button',saved.readSteps?.[stepId]?'Next concept →':'Mark read and continue →','primary');next.id='concept-next';
    if(index===lessons.length-1&&at===l.steps.length-1)next.textContent=saved.readSteps?.[stepId]?'Marked read':'Mark this concept read';
    next.addEventListener('click',()=>{saved.readSteps??={};saved.readSteps[stepId]=true;persist();if(!moveConcept(1)){renderLesson();renderCourseProgress();}});
    actions.append(prev,next);card.append(actions,node('p','Marking a concept read does not mark its questions solved. Try the focused tasks and earlier review before moving on.','small'));area.append(card);
  }
  function chooseStep(id) {
    if(!currentLesson()?.steps.some(s=>s.id===id))return;
    stepId=id;practiceScope='step';topic='all';
    const first=bank.find(q=>q.id===currentStep().practice[0]);mode=first.type;currentId=first.id;
    renderLesson();updateFilters();render();
  }
  function jumpToStep(id) {
    const l=lessons.find(l=>l.steps.some(s=>s.id===id));if(!l)return;
    lessonId=l.id;chooseStep(id);$('concept-card').scrollIntoView?.({behavior:'smooth',block:'start'});$('concept-card').focus({preventScroll:true});
  }
  function moveConcept(delta) {
    const steps=lessons.flatMap(l=>l.steps),at=steps.findIndex(s=>s.id===stepId),next=steps[at+delta];
    if(!next)return false;jumpToStep(next.id);return true;
  }
  function chooseLesson(id) {
    lessonId=id;topic='all';currentId=null;
    const l=currentLesson();stepId=l?(saved.steps?.[id]||l.steps[0].id):null;
    if(l){chooseStep(stepId);return;}
    if(!bank.some(q=>inScope(q)&&q.type===mode))mode=bank.find(inScope)?.type||'code';
    renderLesson();updateFilters();render();
  }
  function showTraceStep() {
    const t=trace[Number($('trace-step').value)];
    if(!t){$('trace-state').textContent='No trace available.';return;}
    const registers=Object.entries(t.registers).map(([k,v])=>{const n=BigInt(v),bits=t.registerWidths?.[k]||64;return `%${k.padEnd(4)} ${v}   (0x${BigInt.asUintN(bits,n).toString(16).padStart(bits/4,'0')}; ${bits} bits)`;});
    const heading=t.phase==='after'?`Final state after ${t.step} instructions`:`Before step ${t.step} · line ${t.line} · ${t.instruction}`;
    $('trace-state').textContent=`${heading}\n\nRegisters (signed decimal and hexadecimal)\n${registers.join('\n')}\n\nFlags: ${Object.entries(t.flags).map(([k,v])=>k+'='+v).join(' · ')||'undefined'}\n\nStack from RSP\n${t.stack.join('\n')||'(empty)'}\n\nQuestion memory\n${Object.entries(t.memory||{}).map(([k,v])=>k+' = '+v).join('\n')||'(none)'}`;
  }
  function runTrace() {
    const q=current();if(!q||q.type!=='code')return;
    const fixture=q.cases[Number($('trace-case').value)||0];
    try {const state=engine.execute($('assembly-input').value,fixture,{trace:true});trace=[...state.trace,state.finalTrace];$('trace-status').textContent=`Executed ${state.steps} instructions. Showing ${state.trace.length} pre-instruction states${state.steps>state.trace.length?' (first 200 only)':''} plus the final state. Use Check answer to grade all cases.`;}
    catch(e){trace=e.trace||[];$('trace-status').textContent=e.message+' Fix the error and rerun; any captured steps are shown below.';}
    $('trace-step').max=Math.max(0,trace.length-1);$('trace-step').value=0;$('trace-final').disabled=trace.at(-1)?.phase!=='after';showTraceStep();
  }
  $('lesson-select').addEventListener('change',()=>chooseLesson($('lesson-select').value));
  for(const [id,delta] of [['lesson-prev',-1],['lesson-next',1]]) $(id).addEventListener('click',()=>{const index=lessons.findIndex(l=>l.id===lessonId);if(lessons[index+delta])chooseLesson(lessons[index+delta].id);});
  $('practice-scope').addEventListener('change',()=>{practiceScope=$('practice-scope').value;topic='all';currentId=null;if(!bank.some(q=>inScope(q)&&q.type===mode))mode=bank.find(inScope)?.type||'mcq';updateFilters();render();});
  $('continue-concept').addEventListener('click',()=>moveConcept(1));
  $('trace-button').addEventListener('click',()=>{const q=current();if(!q||q.type!=='code')return;$('trace-panel').hidden=false;$('trace-case').replaceChildren(...q.cases.map((c,i)=>{const o=node('option',c.name);o.value=i;return o;}));runTrace();});
  $('trace-run').addEventListener('click',runTrace);$('trace-step').addEventListener('input',showTraceStep);
  $('trace-final').addEventListener('click',()=>{$('trace-step').value=trace.length-1;showTraceStep();});
  $('code-mode').addEventListener('click',()=>changeMode('code'));
  $('mcq-mode').addEventListener('click',()=>changeMode('mcq'));
  $('topic').addEventListener('change',()=>{topic=$('topic').value;currentId=null;render();});
  $('question-select').addEventListener('change',()=>{currentId=$('question-select').value;render();});
  $('check').addEventListener('click',checkAnswer);
  $('assembly-input').addEventListener('input',()=>{const q=current();if(q&&q.type==='code'){record(q).draft=$('assembly-input').value;persist();}});
  $('assembly-input').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();checkAnswer();}});
  $('hint-button').addEventListener('click',()=>{$('hint').hidden=!$('hint').hidden;});
  $('solution-button').addEventListener('click',()=>{const q=current();if(!q)return;const r=record(q);if(!r.passed)r.revealed=true;$('solution').hidden=false;persist();updateStats();});
  $('previous').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));
  $('return-to-questions').addEventListener('click',()=>{currentId=filtered()[0]?.id;render();});
  $('reset').addEventListener('click',()=>{if(confirm("Reset this lab's saved drafts, attempts, and results? Other portfolio tools are unaffected.")){saved={records:{},last:{},steps:{},readSteps:{},mode};currentId=null;renderLesson();render();}});
  $('import-bank').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>1000000) throw Error('Use a JSON bank smaller than 1 MB.');
      const incoming=engine.validateBank(JSON.parse(await file.text()));
      const combined=engine.validateBank({schemaVersion:1,questions:[...bank,...incoming.questions]});
      bank=combined.questions;for(const q of incoming.questions)fingerprints.set(q.id,fingerprint(q));
      lessonId='all';topic='all';mode=incoming.questions[0].type;currentId=incoming.questions[0].id;
      $('import-status').textContent=`Added ${incoming.questions.length} questions for this session. The first imported question is open under All practice.`;
      renderLesson();updateFilters();render();
    } catch(e){$('import-status').textContent='Bank not added: '+e.message;}
    event.target.value='';
  });
  start().catch(error=>{
    $('load-status').replaceChildren(node('strong','The lab could not start. '),node('span',error.message+' '));
    if(location.protocol==='file:') $('load-status').append(node('p','Open the published website, or preview this folder with a local static-file server. Browsers block JSON fetches from file:// URLs.'));
    const retry=node('button','Retry');retry.addEventListener('click',()=>location.reload());$('load-status').append(retry);
  });
})();
