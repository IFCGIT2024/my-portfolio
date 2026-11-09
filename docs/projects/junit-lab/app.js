(function () {
  'use strict';
  const $=s=>document.querySelector(s), C=window.TestingCore, key='java-testing-lab-v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state=C.emptyState(), lessons=[], questions=[], query='', current='home', saveTimer, available=true;
  const view=$('#view');
  function warning(){available=false;$('#storage-status').hidden=false;$('#storage-status').textContent='This browser cannot save progress. Keep this tab open, or export your progress from Sources & saved progress.';}
  let stored=null;
  try{stored=localStorage.getItem(key);}catch(_){warning();}
  if(stored)try{state=C.normalizeState(JSON.parse(stored));}catch(_){$('#storage-status').hidden=false;$('#storage-status').textContent='The saved progress could not be read. The course has started with a fresh record; you can restore a valid export from Sources & saved progress.';}
  function save(){if(available)try{localStorage.setItem(key,JSON.stringify(state));}catch(_){warning();}}
  function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,250);}
  const route=()=>location.hash.slice(1)||'home';
  const heading=(tag,title,description)=>`<header class="page-heading"><p class="eyebrow">${esc(tag)}</p><h1 id="page-title" tabindex="-1">${esc(title)}</h1><p class="page-description">${esc(description)}</p></header>`;
  function groups(){const list=[];lessons.forEach(l=>{let g=list.find(g=>g.name===l.module);if(!g)list.push(g={name:l.module,lessons:[]});g.lessons.push(l);});return list;}
  function closeMenu(focus=false){document.body.classList.remove('sidebar-open');$('#sidebar-backdrop').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');if(focus)$('#menu-toggle').focus();}
  function outline(){
    const active=route(), groupsList=groups();
    $('#course-outline').innerHTML=groupsList.map((g,i)=>{
      const items=g.lessons.filter(l=>!query||`${l.id} ${l.title} ${l.summary} ${l.goals.join(' ')} ${l.module}`.toLowerCase().includes(query));
      if(!items.length)return '';
      const open=query||items.some(l=>active===`lesson-${l.id}`)||active==='home'&&i===0;
      return `<details class="chapter" ${open?'open':''}><summary><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span>${esc(g.name)}</span></summary><div class="chapter-lessons">${items.map(l=>`<a class="lesson-link" href="#lesson-${l.id}" ${active===`lesson-${l.id}`?'aria-current="page"':''}><span class="lesson-number">${l.id}</span><span>${esc(l.title)}</span>${state.read[l.id]?'<span class="read-mark" aria-label="Marked read">✓</span>':''}</a>`).join('')}</div></details>`;
    }).join('');
    $('#search-empty').hidden=!!$('#course-outline').children.length;
    document.querySelectorAll('.start-link a,.tool-links a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    updateProgress();
  }
  function updateProgress(){
    const read=lessons.filter(l=>state.read[l.id]).length;
    $('#reading-count').textContent=`${read} of ${lessons.length} read`;
    $('#reading-percent').textContent=`${Math.round(100*read/Math.max(1,lessons.length))}%`;
    $('#reading-progress').max=lessons.length;$('#reading-progress').value=read;
    const independent=questions.filter(q=>q.type!=='write'&&state.questions[q.id]?.independent).length;
    const written=questions.filter(q=>q.type==='write'&&state.questions[q.id]?.selfChecked).length;
    $('#practice-count').textContent=`${independent} ${independent===1?'check':'checks'} solved without help · ${written} written ${written===1?'answer':'answers'} self-reviewed`;
  }
  function home(){
    const next=lessons.find(l=>!state.read[l.id])||lessons[0];
    return heading('A COMPLETE LEARNING PATH · CSCI 2134','Know what to test. Know how to write it.','Read unfamiliar Java, choose a useful case, write a valid JUnit test, and explain exactly what went wrong.')+
    `<section class="home-lead"><p>A good test starts before the assertion. You need to understand the input types, the method’s promise, and the difference between the result you expect and the result the code actually produces. Build those decisions one at a time.</p><a class="primary-link" href="#lesson-${next.id}">${Object.values(state.read).some(Boolean)?'Continue learning':'Start from the beginning'} <span aria-hidden="true">→</span></a><a class="secondary-link" href="#outcomes">See the skills you are building</a></section>
    <div class="learning-sequence" aria-label="The testing workflow"><div><span>01</span><strong>Read the contract</strong><p>Types, rules, and promises.</p></div><div><span>02</span><strong>Choose the case</strong><p>An input with a reason.</p></div><div><span>03</span><strong>Predict the result</strong><p>Before reading the output.</p></div><div><span>04</span><strong>Write the test</strong><p>Valid Java and assertions.</p></div><div><span>05</span><strong>Explain the evidence</strong><p>What passes, fails, or breaks.</p></div></div>
    <section class="study-method"><h2>Three questions to keep separate</h2><div class="decision-strip"><div><strong>Will it compile?</strong><p>Does each argument match the declared type? Does the test method have valid Java syntax?</p></div><div><strong>What does the contract say?</strong><p>Is this a normal input, a documented error, or an input whose behaviour is not specified?</p></div><div><strong>What should I observe?</strong><p>A returned value, changed state, object identity, or a particular exception?</p></div></div></section>
    <section class="study-method"><h2>Learn one idea, then use it</h2><ol><li>Work through one small explanation and its matching exercise at a time.</li><li>Check your understanding with short questions and feedback about every option.</li><li>Write or repair code yourself. Compare it with a model answer and a concrete checklist.</li><li>Explain the idea in your own words, then revisit it in a mixed set.</li></ol><p class="small">Choice questions are checked automatically. Written code and explanations use model answers and self-review; Java runs in the downloadable practice project.</p></section>
    <section aria-labelledby="curriculum-title"><h2 id="curriculum-title">Your learning path</h2><p class="section-intro">${lessons.length} lessons · ${questions.length} small steps with practice</p>${groups().map((g,i)=>`<section class="curriculum-module"><header><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(g.name)}</h3></header><div class="curriculum-lessons">${g.lessons.map(l=>`<a href="#lesson-${l.id}"><span>${l.id}</span>${esc(l.title)}</a>`).join('')}</div></section>`).join('')}</section>
    <section class="lesson-bridge"><h2>Already know part of this?</h2><p>Use the <a href="#reference">syntax reference</a>, practise specific mistakes in the <a href="#workbench">workshop</a>, or try a <a href="#exam">mixed practice test</a>. The full sequence remains available whenever a question exposes a missing prerequisite.</p></section>`;
  }
  function draft(id,label,starter=''){return `<label class="draft-label" for="draft-${esc(id)}">${label}</label><textarea id="draft-${esc(id)}" data-draft="${esc(id)}" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Write your attempt before opening the answer…">${esc(state.drafts[id]??starter)}</textarea>`;}
  function exercise(q,mode='lesson',number=null){
    const exam=mode==='exam', submitted=exam&&state.exam.submitted;
    const a=exam?(state.exam.answers[q.id]||{}):(state.questions[q.id]||{});
    const id=(exam?'exam-':'')+q.id, checked=exam?submitted:a.checked;
    const selected=Array.isArray(a.selected)?a.selected:[];
    const label=number===null?q.title:`Question ${number}`;
    return `<article class="exercise" data-question="${esc(q.id)}" data-mode="${mode}" id="q-${id}"><p class="eyebrow">${exam?(q.type==='write'?'WRITE & EXPLAIN':'CHOOSE & JUSTIFY'):(q.type==='write'?(q.responseKind==='explanation'?'YOUR TURN':'WRITE, REPAIR OR EXPLAIN'):q.type==='multi'?'SELECT EVERY CORRECT ANSWER':'CHOOSE ONE ANSWER')}</p><h3>${esc(label)}</h3><div class="exercise-prompt">${q.prompt}</div>
      ${q.type==='write'?(exam?`<label class="draft-label" for="draft-${id}">Your answer</label><textarea id="draft-${id}" data-exam-draft="${q.id}" spellcheck="false" ${submitted?'readonly':''}>${esc(a.text??q.starter??'')}</textarea>`:draft(q.id,'Your attempt · saved in this browser',q.starter)):`<fieldset class="choices"><legend class="sr-only">${esc(label)}: ${q.type==='multi'?'select all correct answers':'choose one answer'}</legend>${q.options.map((o,i)=>`<label class="choice"><input type="${q.type==='multi'?'checkbox':'radio'}" name="answer-${id}" value="${i}" ${selected.includes(i)?'checked':''} ${submitted?'disabled':''}><span>${esc(o.text)}</span></label>`).join('')}</fieldset>`}
      <div class="feedback" role="status" aria-live="polite" ${checked?'':'hidden'}>${checked?feedback(q,a,exam):''}</div>
      ${exam&&!submitted?'':`<div class="exercise-actions">${q.type!=='write'&&!exam?'<button class="primary check-answer">Check answer</button>':''}${!exam?'<button class="show-hint">Show hint</button>':''}${q.type==='write'||!exam?`<button class="show-solution">${q.type==='write'?'Compare with model & criteria':'Show explanation'}</button>`:''}</div><div class="hint" hidden></div><div class="answer solution" hidden>${solution(q,id,exam)}</div>`}
      ${!exam?`<p class="small attempt-status">${statusText(q,a)}</p>`:''}
      ${exam&&submitted?`<p class="small">Review: <a href="#lesson-${q.lessonId}">${esc(q.lessonTitle)}</a></p>`:''}
    </article>`;
  }
  function statusText(q,a){if(q.type==='write')return a.selfChecked?'Self-reviewed against the criteria. This is your assessment.':q.responseKind==='explanation'?'Write your answer, then compare it with the model.':'Written practice · compare your answer, then self-review. Java is not compiled in this text box.';if(a.pending)return 'Selection changed. Check this answer to record the latest result.';if(a.checked&&!a.correct)return 'Latest attempt needs another try. Use the feedback to revise your choice.';if(a.correct&&a.lastIndependent)return 'Solved without opening a hint or explanation.';if(a.correct)return 'Correct after review. Try a new problem to check transfer.';if(a.helpUsed)return 'Help opened · this attempt counts as reviewed.';return 'Not checked yet.';}
  function feedback(q,a,exam=false){
    if(q.type==='write')return '<p>Use the model and criteria to review this written answer. It is not included in the automatic score.</p>';
    const selected=a.selected||[], good=C.grade(q,selected);
    return `<p><strong>${good?'Correct.':'Not yet.'}</strong> ${good?'Check that your reasoning matches the explanation.':'Compare what each option would actually do.'}</p><ul class="option-feedback">${q.options.map((o,i)=>`<li><strong>${o.correct?'Correct option':selected.includes(i)?'Selected, but incorrect':'Other option'}:</strong> <code>${esc(o.text)}</code><p>${esc(o.feedback)}</p></li>`).join('')}</ul><div>${q.solution}</div>`;
  }
  function solution(q,id,exam=false){return `<h4>One valid answer and why it works</h4>${q.solution}${q.rubric?.length?`<h4>Check your answer against these criteria</h4><ul class="rubric">${q.rubric.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`:''}${q.type==='write'?`<label class="self-check"><input type="checkbox" data-selfcheck="${q.id}" ${exam?'data-exam="true"':''} ${(exam?state.exam.answers[q.id]?.selfChecked:state.questions[q.id]?.selfChecked)?'checked':''}> I compared my attempt with every criterion and can explain it.</label>`:''}`;}
  function flowLesson(l,i){
    const next=lessons[i+1];
    return heading(`${l.module} · Lesson ${l.id}`,l.title,l.summary)+
      `<p class="small flow-overview"><a href="#home">← Course overview</a></p>
      <section class="flow-course" aria-label="One concept at a time">
        <p id="flow-position" class="flow-position" role="status" aria-live="polite"></p>
        <div id="flow-panels">${l.flow.map((stage,index)=>{
          const question=l.practice.find(q=>q.id===stage.questionId);
          if(!question)throw new Error(`Lesson ${l.id} refers to an unavailable practice question.`);
          return `<section class="flow-stage" data-flow-stage="${index}" aria-labelledby="flow-title-${index}" ${index?'hidden':''}>
            <h2 id="flow-title-${index}" class="flow-stage-title" tabindex="-1">${esc(stage.title)}</h2>
            <div class="flow-explanation">${stage.html}</div>
            ${exercise({...question,lessonId:l.id})}
          </section>`;
        }).join('')}
          <section id="flow-finish" class="flow-finish" aria-labelledby="flow-finish-title" hidden>
            <h2 id="flow-finish-title" class="flow-stage-title" tabindex="-1">End of this lesson</h2>
            <p>${esc(l.bridge)}</p>
            ${(l.sourceIds||[]).length?`<details class="flow-references"><summary>References for this lesson</summary><p>${l.sourceIds.map(id=>window.TestingPages.sourceLink(id)).join(' · ')}</p></details>`:''}
            <label class="flow-reading"><input id="mark-read" type="checkbox" ${state.read[l.id]?'checked':''}> I have read this lesson</label>
            <p><a class="primary-link" href="${next?'#lesson-'+next.id:'#exam'}">${next?'Next lesson':'Mixed practice'} <span aria-hidden="true">→</span></a></p>
          </section>
        </div>
        <nav class="flow-controls" aria-label="Concept navigation">
          <button id="flow-back" aria-controls="flow-panels" disabled>← Back</button>
          <button id="flow-continue" class="primary" aria-controls="flow-panels">Continue →</button>
        </nav>
      </section>`;
  }
  function lesson(l){return flowLesson(l,lessons.indexOf(l));}
  function bindExercises(){
    view.querySelectorAll('[data-question]').forEach(card=>{
      const q=questions.find(q=>q.id===card.dataset.question), exam=card.dataset.mode==='exam';
      const attempt=()=>exam?(state.exam.answers[q.id]??={}):(state.questions[q.id]??={});
      const update=()=>{const status=card.querySelector('.attempt-status');if(status)status.textContent=statusText(q,attempt());updateProgress();save();};
      card.querySelectorAll('.choices input').forEach(el=>el.addEventListener('change',()=>{
        const a=attempt();a.selected=[...card.querySelectorAll('.choices input:checked')].map(e=>Number(e.value));
        if(!exam){a.checked=false;a.correct=false;a.lastIndependent=false;a.pending=true;card.querySelector('.feedback').hidden=true;update();}
        save();
      }));
      card.querySelector('[data-exam-draft]')?.addEventListener('input',e=>{attempt().text=e.target.value;queueSave();});
      card.querySelector('.check-answer')?.addEventListener('click',()=>{
        const a=attempt(), fb=card.querySelector('.feedback');
        if(!a.selected?.length){fb.innerHTML='<p>Choose an answer first.</p>';fb.hidden=false;return;}
        const good=C.grade(q,a.selected);a.checked=true;a.correct=good;a.pending=false;a.attempts=(a.attempts||0)+1;a.lastIndependent=good&&!a.helpUsed;
        if(a.lastIndependent)a.independent=true;
        // Explanations are visible after checking; later attempts are reviewed.
        fb.innerHTML=feedback(q,a);fb.hidden=false;a.helpUsed=true;
        update();decorate(card);
      });
      card.querySelector('.show-hint')?.addEventListener('click',e=>{
        const box=card.querySelector('.hint');box.textContent=q.hint;box.hidden=!box.hidden;
        e.target.textContent=box.hidden?'Show hint':'Hide hint';attempt().helpUsed=true;update();
      });
      card.querySelector('.show-solution')?.addEventListener('click',e=>{
        const box=card.querySelector('.solution');box.hidden=!box.hidden;e.target.textContent=box.hidden?(q.type==='write'?'Compare with model & criteria':'Show explanation'):'Hide model answer';
        attempt().helpUsed=true;update();
      });
      card.querySelector('[data-selfcheck]')?.addEventListener('change',e=>{attempt().selfChecked=e.target.checked;update();});
    });
  }
  function bindFlowLesson(l){
    let stage=Math.min(state.flowSteps[l.id]||0,l.flow.length);
    const panels=[...view.querySelectorAll('[data-flow-stage]')], finish=$('#flow-finish');
    const back=$('#flow-back'), next=$('#flow-continue'), position=$('#flow-position');
    const update=(focus=false)=>{
      const done=stage===panels.length;
      panels.forEach((panel,index)=>panel.hidden=index!==stage);
      finish.hidden=!done;
      back.disabled=stage===0;next.hidden=done;
      next.textContent=stage===panels.length-1?'Finish lesson →':'Continue →';
      position.textContent=done?'End of lesson':`Step ${stage+1} of ${panels.length}`;
      if(focus){
        state.flowSteps[l.id]=stage;save();
        const panel=done?finish:panels[stage];
        panel.querySelector('.flow-stage-title').focus({preventScroll:true});
        panel.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
    };
    back.onclick=()=>{if(stage>0){stage--;update(true);}};
    next.onclick=()=>{if(stage<panels.length){stage++;update(true);}};
    update();
  }
  function bindLesson(l){
    $('#mark-read')?.addEventListener('change',e=>{state.read[l.id]=e.target.checked;save();outline();});
    bindFlowLesson(l);
  }
  function practice(){
    return heading('CHOOSE A SKILL · REVISIT A MISTAKE','Practice with a purpose','While learning, choose the lesson you have reached. All lessons draws from the entire course; use it when you are ready to combine skills.')+
      `<div class="practice-controls"><label>Lesson<select id="practice-lesson"><option value="all">All lessons</option>${lessons.map(l=>`<option value="${l.id}">${l.id} · ${esc(l.title)}</option>`).join('')}</select></label><label>Focus<select id="practice-filter"><option value="all">All tasks</option><option value="missed">Missed or reviewed checks</option><option value="new">Not attempted</option><option value="write">Write & repair code</option><option value="objective">Choice checks</option></select></label><button id="practice-shuffle">Shuffle this set</button></div><p id="practice-position" class="small" aria-live="polite"></p><div id="practice-task"></div><div class="lesson-pager"><button id="practice-prev">← Previous task</button><button id="practice-next">Next task →</button></div><p class="small">For a test without lesson cues or immediate feedback, use <a href="#exam">mixed practice</a>.</p>`;
  }
  function bindPractice(){
    let list=[],pos=0;
    function draw(){
      $('#practice-position').textContent=list.length?`Task ${pos+1} of ${list.length} · Lesson ${list[pos].lessonId}`:'No tasks match this filter. Choose another focus or lesson.';
      $('#practice-task').innerHTML=list.length?exercise(list[pos],'practice'):'';
      $('#practice-prev').disabled=pos===0;$('#practice-next').disabled=pos>=list.length-1;
      bindExercises();bindDrafts();decorate($('#practice-task'));
    }
    function filter(){
      const lessonId=$('#practice-lesson').value, focus=$('#practice-filter').value;
      list=questions.filter(q=>{
        if(lessonId!=='all'&&q.lessonId!==lessonId)return false;
        const s=C.classifyQuestion(state.questions[q.id]);
        if(focus==='missed')return q.type!=='write'&&['missed','reviewed','pending'].includes(s);
        if(focus==='new')return s==='new'&&!state.drafts[q.id];
        if(focus==='write')return q.type==='write';if(focus==='objective')return q.type!=='write';return true;
      });pos=0;draw();
    }
    $('#practice-lesson').onchange=filter;$('#practice-filter').onchange=filter;
    $('#practice-shuffle').onclick=()=>{list=list.map(q=>({q,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.q);pos=0;draw();};
    $('#practice-prev').onclick=()=>{if(pos>0)pos--;draw();};$('#practice-next').onclick=()=>{if(pos<list.length-1)pos++;draw();};filter();
  }
  function exam(){
    let html=heading('TRANSFER · CHOOSE THE TECHNIQUE YOURSELF','Mixed practice test','Twelve tasks: six checked questions and six written answers. Feedback appears only after you submit.');
    if(!state.exam)return html+`<section class="home-lead"><p>This set draws from all 30 lessons. Use it after completing the sequence, or deliberately to check which topics need review. For practice at your current stage, <a href="#practice">choose one lesson in practice mode</a>.</p><p>Use unfamiliar prompts to decide which technique applies. Read the types and contract first, then choose cases and write or diagnose tests. The written part includes model answers and a criterion checklist after submission.</p><p>Lesson titles, hints, and solutions are hidden during the attempt. Your work is saved in this browser. You can still consult other course pages if you choose; this is practice, not a locked examination.</p><button id="start-exam" class="primary">Start a mixed set</button></section>`;
    const items=state.exam.ids.map(id=>questions.find(q=>q.id===id)).filter(Boolean), submitted=state.exam.submitted;
    if(submitted){
      const objective=items.filter(q=>q.type!=='write'), score=objective.filter(q=>C.grade(q,state.exam.answers[q.id]?.selected||[])).length;
      const self=items.filter(q=>q.type==='write'&&state.exam.answers[q.id]?.selfChecked).length;
      const needs=items.filter(q=>q.type!=='write'&&!C.grade(q,state.exam.answers[q.id]?.selected||[]));
      html+=`<section class="exam-summary" role="status"><p class="eyebrow">ATTEMPT COMPLETE</p><h2>${score} / ${objective.length} checked answers correct</h2><p id="exam-written-count">${self} of ${items.length-objective.length} written answers self-reviewed. Written work is not automatically scored.</p>${needs.length?`<p>Revisit ${[...new Set(needs.map(q=>q.lessonId))].map(id=>`<a href="#lesson-${id}">lesson ${id}</a>`).join(', ')}; then try a new case.</p>`:'<p>Your checked answers were correct. Use the written criteria to inspect whether you can construct and justify an answer independently.</p>'}</section>`;
    }else html+='<p class="notice">Complete all twelve tasks, then submit to reveal feedback. Blank responses are allowed and remain visible in the review.</p>';
    html+=items.map((q,i)=>exercise(q,'exam',i+1)).join('');
    html+=submitted?'<button id="new-exam" class="primary">Start another mixed set</button><p class="small">Starting another set replaces this practice attempt. Export your progress first if you want to retain it.</p>':'<button id="submit-exam" class="primary">Submit & review this attempt</button>';
    return html;
  }
  function bindExam(){
    const start=()=>{state.exam={ids:C.chooseExam(questions),answers:{},submitted:false,started:new Date().toISOString()};save();render(false);};
    $('#start-exam')?.addEventListener('click',start);$('#new-exam')?.addEventListener('click',start);
    $('#submit-exam')?.addEventListener('click',()=>{state.exam.submitted=true;save();render();});
    view.querySelectorAll('[data-selfcheck][data-exam]').forEach(el=>el.addEventListener('change',()=>{
      const written=state.exam.ids.map(id=>questions.find(q=>q.id===id)).filter(q=>q?.type==='write');
      $('#exam-written-count').textContent=`${written.filter(q=>state.exam.answers[q.id]?.selfChecked).length} of ${written.length} written answers self-reviewed. Written work is not automatically scored.`;
    }));
  }
  function download(name,text,type='application/json'){
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function bindSettings(){
    $('#export-progress').onclick=()=>download('java-testing-progress.json',JSON.stringify({app:'java-testing-lab',...state},null,2));
    $('#import-progress').onchange=async e=>{
      const file=e.target.files[0];if(!file)return;
      try{const v=JSON.parse(await file.text());if(v.app!=='java-testing-lab'||v.version!==1)throw Error('Choose a Java Testing Lab progress export.');state=C.applyLessonRevisions(C.normalizeState(v),lessons);validateExam();save();outline();$('#settings-status').textContent='Your saved progress and written drafts have been restored.';}
      catch(err){$('#settings-status').textContent='Could not import: '+err.message;}
    };
    $('#reset-request').onclick=()=>{$('#reset-panel').hidden=false;$('#reset-cancel').focus();};
    $('#reset-cancel').onclick=()=>{$('#reset-panel').hidden=true;$('#reset-request').focus();};
    $('#reset-confirm').onclick=()=>{state=C.applyLessonRevisions(C.emptyState(),lessons);save();outline();$('#reset-panel').hidden=true;$('#settings-status').textContent='Only Java Testing Lab progress and drafts were cleared.';$('#reset-request').focus();};
  }
  function bindDrafts(){view.querySelectorAll('[data-draft]').forEach(el=>{
    if(el.dataset.bound)return;el.dataset.bound='true';
    el.addEventListener('input',()=>{
      state.drafts[el.dataset.draft]=el.value;const a=state.questions[el.dataset.draft];
      if(a){a.selfChecked=false;const card=el.closest('[data-question]');if(card){const box=card.querySelector('[data-selfcheck]');if(box)box.checked=false;const q=questions.find(q=>q.id===el.dataset.draft),status=card.querySelector('.attempt-status');if(q&&status)status.textContent=statusText(q,a);}}
      updateProgress();queueSave();
    });
  });}
  function validateExam(){if(state.exam&&(state.exam.ids.length!==12||!state.exam.ids.every(id=>questions.some(q=>q.id===id))))state.exam=null;}
  function decorate(container=view){
    container.querySelectorAll('table').forEach(table=>{if(table.parentElement.classList.contains('table-scroll'))return;const wrap=document.createElement('div');wrap.className='table-scroll';table.before(wrap);wrap.append(table);});
    container.querySelectorAll('pre code').forEach(code=>{
      if(code.dataset.highlighted)return;code.dataset.highlighted='true';
      const text=code.textContent,regex=/\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:public|private|protected|static|final|class|interface|abstract|extends|implements|import|package|void|int|long|double|float|boolean|char|byte|short|if|else|for|while|do|return|throw|throws|try|catch|finally|new|null|true|false|assert|break|continue)\b|\b\d+(?:\.\d+)?\b/g;
      let out='',last=0;for(const m of text.matchAll(regex)){out+=esc(text.slice(last,m.index));const token=m[0],cls=token.startsWith('//')||token.startsWith('/*')?'comment':token.startsWith('"')||token.startsWith("'")?'string':/^\d/.test(token)?'number':'keyword';out+=`<span class="syntax-${cls}">${esc(token)}</span>`;last=m.index+token.length;}code.innerHTML=out+esc(text.slice(last));
    });
  }
  function render(focus=true){
    clearTimeout(saveTimer);save();current=route();const l=lessons.find(l=>current===`lesson-${l.id}`);
    if(l){view.innerHTML=lesson(l);bindLesson(l);}
    else if(current==='home'){view.innerHTML=home();}
    else if(current==='outcomes'){view.innerHTML=window.TestingPages.outcomes(heading);}
    else if(current==='reference'){view.innerHTML=window.TestingPages.reference(heading);}
    else if(current==='project'){view.innerHTML=window.TestingPages.project(heading);}
    else if(current==='sources'){view.innerHTML=window.TestingPages.sources(heading);bindSettings();}
    else if(current==='practice'){view.innerHTML=practice();bindPractice();}
    else if(current==='exam'){view.innerHTML=exam();}
    else if(current==='workbench'){view.innerHTML=heading('REPEAT THE PATTERN · SEE THE PATH','Syntax & coverage workshop','Practise the small decisions that make a complete test compile and check the right behaviour.')+'<div id="workbench"></div>';window.TestingWorkbench.mount($('#workbench'),{state,save,esc,download});}
    else{view.innerHTML=heading('PAGE NOT FOUND','Choose a lesson to continue','That lesson link is not part of this course.')+'<p><a href="#home">Open the course overview →</a></p>';}
    outline();bindDrafts();if(current!=='practice')bindExercises();if(current==='exam')bindExam();decorate();
    view.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
    closeMenu();document.title=(l?l.title:$('#page-title')?.textContent||'Learn to test')+' · Java Testing Lab';
    if(focus){window.scrollTo({top:0,behavior:'instant'});$('#page-title')?.focus({preventScroll:true});}
  }
  $('#menu-toggle').onclick=()=>{if(document.body.classList.contains('sidebar-open'))closeMenu(true);else{document.body.classList.add('sidebar-open');$('#sidebar-backdrop').hidden=false;$('#menu-toggle').setAttribute('aria-expanded','true');$('#menu-close').focus();}};
  $('#menu-close').onclick=()=>closeMenu(true);$('#sidebar-backdrop').onclick=()=>closeMenu(true);
  $('.skip-link').onclick=e=>{e.preventDefault();$('#main-content').focus();window.scrollTo({top:0,behavior:'instant'});};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('sidebar-open'))closeMenu(true);});
  $('#lesson-search').oninput=e=>{query=e.target.value.trim().toLowerCase();outline();};
  window.addEventListener('hashchange',()=>{if(lessons.length)render();});window.addEventListener('pagehide',save);
  Promise.all(['01-10','11-20','21-30'].map(async part=>{const response=await fetch(`data/lessons-${part}.json?v=20261109-coherence`);if(!response.ok)throw Error(`Lesson file could not be loaded (${response.status}).`);return response.json();})).then(parts=>{
    lessons=parts.flat().sort((a,b)=>a.id.localeCompare(b.id));
    questions=lessons.flatMap(l=>l.practice.map(q=>({...q,lessonId:l.id,lessonTitle:l.title})));
    C.applyLessonRevisions(state,lessons);validateExam();save();
    $('#load-status').hidden=true;$('#lesson-search').disabled=false;render(false);
  }).catch(err=>{$('#load-status').textContent='The course could not load. Refresh this page to try again. '+err.message;});
})();
