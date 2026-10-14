/* Static browser application; banks are data, never executable JavaScript. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'mizel:assembly-lab:progress:v1';
  const engine = window.AssemblyEngine;
  let lessons=[], lessonId='01-machine', trace=[];
  let bank = [], mode = 'code', topic = 'all', currentId = null, completedView = false;
  let saved = {records:{}, last:{}, mode:'code'};
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
    saved.lesson=lessonId; saved.mode = mode; saved.last[mode] = currentId;
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
      if(['all','original',...lessons.map(l=>l.id)].includes(data.lesson)) lessonId=data.lesson;
    } catch {
      $('storage-status').hidden=false;
      $('storage-status').textContent='Saved progress could not be read. This session starts with a clean progress record.';
    }
  }
  function inLesson(q) {return lessonId==='all'||(lessonId==='original'?!q.lesson:q.lesson===lessonId);}
  function filtered() { return bank.filter(q=>inLesson(q) && q.type===mode && (topic==='all'||q.category===topic)); }
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
    const categories=[...new Set(bank.filter(q=>inLesson(q)&&q.type===mode).map(q=>q.category))];
    if(!categories.includes(topic)) topic='all';
    $('topic').replaceChildren(...['all',...categories].map(category=>{
      const option=node('option',category==='all'?'All topics':label(category)); option.value=category; return option;
    })); $('topic').value=topic;
    $('code-total').textContent=bank.filter(q=>inLesson(q)&&q.type==='code').length;
    $('mcq-total').textContent=bank.filter(q=>inLesson(q)&&q.type==='mcq').length;
    for(const type of ['code','mcq']) {$(type+'-mode').setAttribute('aria-pressed',String(type===mode));$(type+'-mode').disabled=!bank.some(q=>inLesson(q)&&q.type===type);}
  }
  function renderCases(q) {
    $('case-summary').textContent=`Starting state & ${q.cases.length} test cases`;
    $('cases').replaceChildren();
    for (const fixture of q.cases) {
      const block=node('div',undefined,'case'); block.append(node('h4',fixture.name));
      block.append(node('p',`${fixture.function?'Function: return with ret. Entry '+(fixture.entry||'first instruction')+'. RSP starts at 0x7ff8.':'Snippet: finish at the end. RSP starts at 0x8000.'} ${fixture.function?'The checker supplies callee-saved register sentinels and verifies RBX, RBP, R12–R15 are restored. ':''}Memory cells: ${fixture.memoryWidth||4} bytes unless overridden.${fixture.abi?' Check 16-byte alignment before calls.':''}${fixture.preserveRegisters?.length?' Preserve: '+fixture.preserveRegisters.join(', ')+'.':''}`));
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
    $('question-meta').textContent=`${label(q.category)} / ${q.id}`;
    $('question-title').textContent=q.title;
    $('code-exercise').hidden=mode!=='code'; $('mcq-exercise').hidden=mode!=='mcq';
    for(const id of ['feedback','hint','solution']) $(id).hidden=true;
    $('trace-button').hidden=mode!=='code';
    $('hint-button').hidden=mode!=='code'; $('solution-button').hidden=mode!=='code';
    $('check').disabled=false; $('check').textContent='Check answer';
    $('previous').disabled=list[0].id===q.id;
    $('next').textContent=list.at(-1).id===q.id?'View summary →':'Next →';
    if(mode==='code') {
      $('data-model').textContent=q.dataModel||'signed 32-bit integers';
      $('solution-explanation').textContent=q.explanation||'Follow each instruction from the supplied inputs to the required outputs. Temporary registers can differ from this example.';
      $('c-code').textContent=q.cCode; $('assembly-input').value=r.draft;
      $('hint').textContent=q.hint; $('solution-code').textContent=q.solutions[0];
      const outputs=[...new Set(q.cases.flatMap(c=>[...Object.keys(c.expected.memory||{}),...Object.keys(c.expected.registers||{}).map(k=>'%'+k)]))];
      $('output-contract').textContent=`Required outputs: ${outputs.join(', ')}. Each case starts fresh; other input memory must keep its initial value. Stack must be balanced.${q.requirements?.length ? " Practice requirement: use "+q.requirements.join(", ")+"." : ""}`;
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
  }
  function move(delta) {
    const list=filtered(), index=list.findIndex(q=>q.id===currentId)+delta;
    if(index>=list.length) {summary();return;}
    if(index>=0) {currentId=list[index].id;render();}
  }
  function changeMode(next) { saved.last[mode]=currentId;mode=next;topic='all';currentId=saved.last[mode];
    if(!bank.some(q=>inLesson(q)&&q.type===mode)) mode=bank.find(inLesson)?.type||'code';
    renderLesson();updateFilters();render(); }
  async function fetchJSON(url) {
    const response=await fetch(url);
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
    const course=await fetchJSON('data/lessons.json'); lessons=course.lessons;
    for(const q of bank) fingerprints.set(q.id,fingerprint(q));
    restore();
    currentId=saved.last[mode];
    if(!bank.some(q=>inLesson(q)&&q.type===mode)) mode=bank.find(inLesson)?.type||'code';
    renderLesson();updateFilters();render();
    $('load-status').hidden=true;$('app').hidden=false;
  }
  function renderCourseProgress() {
    if(!lessons.length) return;
    const list=bank.filter(q=>q.lesson), count=counters(list);
    $('course-progress').textContent=`12 lessons · ${list.length} new exercises · ${count.solved} solved independently · ${count.reviewed} reviewed. Start with the introduction, try the worked example, then practice both modes.`;
  }
  function renderLesson() {
    $('lesson-select').replaceChildren(...[...lessons.map((l,i)=>({id:l.id,title:`${i+1}. ${l.title}`})),{id:'original',title:'Original practice — all preserved exercises'},{id:'all',title:'All practice — course and original'}].map(l=>{const o=node('option',l.title);o.value=l.id;o.selected=l.id===lessonId;return o;}));
    const area=$('lesson-content');area.replaceChildren();
    const l=lessons.find(l=>l.id===lessonId),index=lessons.indexOf(l);
    $('lesson-prev').disabled=index<=0;$('lesson-next').disabled=index<0||index===lessons.length-1;
    if(!l) {area.append(node('p','Choose a guided lesson above for introductions and worked examples, or use the filters below to practice the full question banks.'));return;}
    area.append(node('p',`Lecture pages: ${l.pages}`,'eyebrow'),node('h3',l.title));
    const goals=node('ul');for(const goal of l.goals)goals.append(node('li',goal));area.append(goals);
    const intro=node('details');intro.open=true;intro.append(node('summary','Introduction — read this first'));
    for(const paragraph of l.paragraphs)intro.append(node('p',paragraph));area.append(intro);
    const example=node('details');example.append(node('summary','Worked C → assembly example'));
    const columns=node('div',undefined,'code-panels');
    for(const [heading,text] of [['C / goal',l.exampleC],['Assembly',l.exampleAssembly]]) {const panel=node('div',undefined,'panel');panel.append(node('h4',heading));const pre=node('pre');pre.append(node('code',text));panel.append(pre);columns.append(panel);}
    example.append(columns,node('p',l.walkthrough),node('p','Watch for: '+l.pitfall,'hint'));area.append(example);
  }
  function chooseLesson(id) {
    lessonId=id;topic='all';currentId=null;
    if(!bank.some(q=>inLesson(q)&&q.type===mode)) mode=bank.find(inLesson)?.type||'code';
    renderLesson();updateFilters();render();
  }
  function showTraceStep() {
    const t=trace[Number($('trace-step').value)];
    if(!t){$('trace-state').textContent='No trace available.';return;}
    const registers=Object.entries(t.registers).map(([k,v])=>{const n=BigInt(v);return `%${k.padEnd(3)}  ${v}   (0x${BigInt.asUintN(64,n).toString(16).padStart(16,'0')})`;});
    $('trace-state').textContent=`Step ${t.step} · line ${t.line} · ${t.instruction}\n\nRegisters before instruction\n${registers.join('\n')}\n\nFlags: ${Object.entries(t.flags).map(([k,v])=>k+'='+v).join(' · ')||'undefined'}\n\nStack from RSP\n${t.stack.join('\n')||'(empty)'}\n\nQuestion memory\n${Object.entries(t.memory||{}).map(([k,v])=>k+' = '+v).join('\n')||'(none)'}`;
  }
  function runTrace() {
    const q=current();if(!q||q.type!=='code')return;
    const fixture=q.cases[Number($('trace-case').value)||0];
    try {const state=engine.execute($('assembly-input').value,fixture,{trace:true});trace=state.trace;$('trace-status').textContent=`Executed ${state.steps} instructions. Showing ${trace.length} pre-instruction states. Use Check answer to grade all cases.`;}
    catch(e){trace=e.trace||[];$('trace-status').textContent=e.message+' Fix the error and rerun; any captured steps are shown below.';}
    $('trace-step').max=Math.max(0,trace.length-1);$('trace-step').value=0;showTraceStep();
  }
  $('lesson-select').addEventListener('change',()=>chooseLesson($('lesson-select').value));
  for(const [id,delta] of [['lesson-prev',-1],['lesson-next',1]]) $(id).addEventListener('click',()=>{const index=lessons.findIndex(l=>l.id===lessonId);if(lessons[index+delta])chooseLesson(lessons[index+delta].id);});
  $('trace-button').addEventListener('click',()=>{const q=current();if(!q||q.type!=='code')return;$('trace-panel').hidden=false;$('trace-case').replaceChildren(...q.cases.map((c,i)=>{const o=node('option',c.name);o.value=i;return o;}));runTrace();});
  $('trace-run').addEventListener('click',runTrace);$('trace-step').addEventListener('input',showTraceStep);
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
  $('reset').addEventListener('click',()=>{if(confirm("Reset this lab's saved drafts, attempts, and results? Other portfolio tools are unaffected.")){saved={records:{},last:{},mode};currentId=null;render();}});
  $('import-bank').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>1000000) throw Error('Use a JSON bank smaller than 1 MB.');
      const incoming=engine.validateBank(JSON.parse(await file.text()));
      const combined=engine.validateBank({schemaVersion:1,questions:[...bank,...incoming.questions]});
      bank=combined.questions;for(const q of incoming.questions)fingerprints.set(q.id,fingerprint(q));
      $('import-status').textContent=`Added ${incoming.questions.length} questions for this session. Choose their topic or use Jump to.`;
      updateFilters();render();
    } catch(e){$('import-status').textContent='Bank not added: '+e.message;}
    event.target.value='';
  });
  start().catch(error=>{
    $('load-status').replaceChildren(node('strong','The lab could not start. '),node('span',error.message+' '));
    if(location.protocol==='file:') $('load-status').append(node('p','Open the published website, or preview this folder with a local static-file server. Browsers block JSON fetches from file:// URLs.'));
    const retry=node('button','Retry');retry.addEventListener('click',()=>location.reload());$('load-status').append(retry);
  });
})();
