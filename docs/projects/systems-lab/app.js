'use strict';
(() => {
  const { chapters, lessons, skills, exam } = systemsCourse;
  const chapterGoals = [
    'Start with a value and follow a program one statement at a time. Later you will trace the same changes in memory and registers.',
    'Use addresses to explain which object changes. Then apply that reasoning to arrays, strings and repeated input.',
    'Read the bits at a stated width. Then decide which type C actually compares.',
    'Build a mask for one bit, then combine individual bits into signed records that cross byte boundaries.',
    'Use object lifetime to decide what survives a call. Apply that decision to linked nodes and their payloads.',
    'Split the program into source files and an interface. Follow an edit through compilation and linking.',
    'Retrieve the machine-level rules from Assembly Lab. Use the linked original lessons for any rule you want to practise again.',
    'Translate a C declaration into locations and loads. Check the bounds of the particular object being accessed.',
    'Turn your address sequence into fetched blocks, hits and misses. Use compatible units to compare performance.'
  ];
  const byId = new Map(lessons.map((lesson, i) => [lesson.id, i]));
  const key = 'csci2122.systems-lab.v1';
  const $ = id => document.getElementById(id);
  const app = $('app');
  let saved = {};
  let storageOK = true;
  try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch { storageOK = false; }
  function record(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  const state = {
    last: byId.has(saved.last) ? saved.last : lessons[0].id,
    attempts: record(saved.attempts), mastered: record(saved.mastered),
    notes: record(saved.notes), examAnswers: record(saved.examAnswers),
    submitted: saved.submitted === true
  };
  const html = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
  const portfolioBase = document.documentElement.dataset.portfolioBase || '../';
  const project = path => portfolioBase + path;
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageOK = false; }
    if (!storageOK) $('storage-status').textContent = 'Progress available for this session';
  }
  function route() {
    const [id, tab] = location.hash.slice(1).split('/');
    if (id === 'checklist' || id === 'exam') return { id, tab };
    return { id: byId.has(id) ? id : state.last, tab: tab === 'practice' ? 'practice' : 'lesson' };
  }
  function lessonLink(id, text, cls = '') {
    return '<a class="'+cls+'" href="#'+id+'">'+html(text)+'</a>';
  }
  function heading(kicker, title, description) {
    return '<header class="page-heading"><p class="eyebrow">'+html(kicker)+'</p><h1 tabindex="-1">'+html(title)+'</h1><p class="page-description">'+html(description)+'</p></header>';
  }
  function progress() {
    const count = lessons.filter(l => state.attempts[l.id] === l.answer).length;
    $('progress').max = lessons.length;
    $('progress').value = count;
    $('progress-text').textContent = count+' of '+lessons.length+' lesson checks correct';
  }
  function outline() {
    const term = $('search').value.trim().toLowerCase();
    const { id } = route();
    const active = lessons[byId.get(id)];
    const parts = chapters.map((title, n) => {
      const hits = lessons.filter(l => l.chapter===n && (title+' '+l.title+' '+l.source+' '+l.intro).toLowerCase().includes(term));
      if (!hits.length) return '';
      const isOpen = term || active?.chapter === n;
      return '<details class="chapter" '+(isOpen?'open':'')+'><summary><span class="chapter-number">'+String(n+1).padStart(2,'0')+'</span><span>'+html(title)+'</span></summary><div class="chapter-lessons">'+hits.map(l =>
        '<a class="lesson-link" href="#'+l.id+'" '+(l.id===id?'aria-current="page"':'')+'>'+html(l.title)+(state.attempts[l.id]===l.answer?'<span class="read-mark" aria-label="Check correct">✓</span>':'')+'</a>'
      ).join('')+'</div></details>';
    });
    $('outline').innerHTML = parts.join('') || '<p class="search-empty">No matching lessons.</p>';
    progress();
  }
  function menu(open) {
    document.body.classList.toggle('sidebar-open', open);
    $('backdrop').hidden = !open;
    $('menu-toggle').setAttribute('aria-expanded', String(open));
    if (open) $('search').focus();
  }
  $('menu-toggle').onclick = () => menu(true);
  $('menu-close').onclick = $('backdrop').onclick = () => { menu(false); $('menu-toggle').focus(); };
  $('sidebar').addEventListener('click', e => { if (e.target.closest('a')) menu(false); });
  $('search').addEventListener('input', outline);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      menu(false); $('menu-toggle').focus();
    }
  });
  matchMedia('(min-width: 821px)').addEventListener('change', e => { if (e.matches) menu(false); });
  $('skip').onclick = e => { e.preventDefault(); $('main-content').focus(); };
  function choices(name, question, options, selected, disabled=false) {
    return '<fieldset><legend>'+html(question)+'</legend>'+options.map((opt,i) =>
      '<label class="answer-choice"><input type="radio" name="'+name+'" value="'+i+'" '+(selected===i?'checked ':'')+(disabled?'disabled':'')+'><span>'+html(opt)+'</span></label>'
    ).join('')+'</fieldset>';
  }
  function lookupSkills(l) {
    // Introduce a combined recall task only after all its component lessons.
    return skills.map((s,i)=>({s,i})).filter(({s}) =>
      Math.max(...s.lessons.map(id=>byId.get(id)))===byId.get(l.id));
  }
  function assemblyLinks(l) {
    if (!l.assembly) return '';
    return '<details class="resources"><summary>Revisit this in Assembly Lab</summary><div class="resource-row">'+l.assembly.map(a =>
      '<a href="'+project('assembly-lab/index.html#lesson='+a.id)+'">'+html(a.title)+' ↗</a>').join('')+'</div></details>';
  }
  function recall(s,i) {
    return '<div class="recall"><p>'+html(s.prompt)+'</p><label for="note-'+i+'">Your explanation</label><textarea id="note-'+i+'" data-note="'+i+'" maxlength="5000" placeholder="Work it out from memory…">'+html(state.notes[i]||'')+'</textarea><details><summary>Compare your explanation</summary><p>'+html(s.model)+'</p></details></div>';
  }
  function renderLesson(l, tab) {
    const n=byId.get(l.id);
    const tabs='<nav class="heading-nav" aria-label="Lesson activity"><a href="#'+l.id+'" '+(tab==='lesson'?'aria-current="page"':'')+'>Lesson</a><a href="#'+l.id+'/practice" '+(tab==='practice'?'aria-current="page"':'')+'>Practice</a><span class="study-note">Step '+(n+1)+' of '+lessons.length+'</span></nav>';
    let content;
    if (tab==='lesson') {
      content='<details class="chapter-overview"><summary>How this chapter fits</summary><p>'+html(chapterGoals[l.chapter])+'</p></details><section class="worked-example"><h2>Worked example</h2><pre><code>'+html(l.example)+'</code></pre><ol>'+l.steps.map(s=>'<li>'+html(s)+'</li>').join('')+'</ol></section>'
        +experiment(l.id)+assemblyLinks(l)
        +(l.listing?'<details class="resources"><summary>'+html(l.listing.title)+'</summary><pre><code>'+html(l.listing.code)+'</code></pre></details>':'')
        +'<p class="source-note">'+html(l.source)+'</p><a class="cta" href="#'+l.id+'/practice">Try it yourself →</a>';
    } else {
      const previous=state.attempts[l.id];
      content='<details class="chapter-overview" open><summary>Starting example</summary><pre><code>'+html(l.example)+'</code></pre></details><form id="concept-form">'+choices('concept',l.question,l.options,previous)+'<button class="primary" type="submit">Check answer</button><p class="response" id="feedback" role="status"></p></form>'
        +lookupSkills(l).map(({s,i})=>'<section class="task"><h2>Explain it from memory</h2>'+recall(s,i)+'<a href="#checklist/'+i+'">Open this checklist item →</a></section>').join('')
        +assemblyLinks(l);
    }
    const prev=n ? lessonLink(lessons[n-1].id,'← Previous lesson') : '';
    const next=n+1<lessons.length ? lessonLink(lessons[n+1].id,'Next lesson →') : lessonLink('checklist','Review the checklist →');
    app.innerHTML=heading(chapters[l.chapter],l.title,tab==='lesson'?l.intro:'Use the starting example below. Change the condition named in the question and predict the result.')+tabs+content+'<nav class="footer-nav" aria-label="Lesson order"><span>'+prev+'</span>'+next+'</nav>';
    if (tab==='lesson') wireExperiment(l.id);
    else {
      function feedback(choice) {
        const right=choice===l.answer;
        $('feedback').textContent=(right?'Correct. ':'Look again. ')+l.reason;
      }
      if (Number.isInteger(state.attempts[l.id])) feedback(state.attempts[l.id]);
      $('concept-form').onsubmit=e=>{
        e.preventDefault();
        const choice=new FormData(e.target).get('concept');
        if (choice===null) { $('feedback').textContent='Choose an answer first.'; return; }
        state.attempts[l.id]=Number(choice);
        save(); feedback(Number(choice));outline();
      };
    }
  }
  function checklist(tab) {
    let group='';
    const rows=skills.map((s,i)=>{
      const title=s.group===group?'':'<h2>'+html(s.group)+'</h2>';
      group=s.group;
      return title+'<section class="skill" id="skill-'+i+'"><label><input type="checkbox" data-skill="'+i+'" '+(state.mastered[i]?'checked':'')+'><span>'+html(s.title)+'</span></label><details '+(String(i)===tab?'open':'')+'><summary>Test this skill</summary>'+recall(s,i)+'<p class="check-links">Review · '+s.lessons.map(id=>lessonLink(id,lessons[byId.get(id)].title)).join(' ')+'</p></details></section>';
    }).join('');
    app.innerHTML=heading('Exam preparation','Master checklist','Try each task from memory. Compare your reasoning with the model. Check a skill when you can explain a changed example, then revisit it a day later before the mixed exam.')+'<p id="skill-count" role="status"></p>'+rows+'<p>'+lessonLink('exam','Take the mixed exam →','cta')+'</p>';
    updateMastery();
  }
  function updateMastery() {
    $('skill-count').textContent=skills.filter((s,i)=>state.mastered[i]).length+' of '+skills.length+' skills checked';
  }
  function examPage() {
    const graded=state.submitted;
    let correct=0;
    const rows=exam.map((q,i)=>{
      const selected=state.examAnswers[i];
      const right=selected===q.answer;
      if (right) correct++;
      const feedback=graded?'<div class="response"><strong>'+(right?'Correct.':'Review this one.')+'</strong> '+html(q.options[q.answer])+'. '+html(q.reason)+'<p>Change one detail. '+html(q.variation)+'</p>'+lessonLink(q.lesson,'Review '+lessons[byId.get(q.lesson)].title+' →')+'</div>':'';
      return '<section class="exam-item"><h2>Question '+(i+1)+'</h2>'+choices('exam-'+i,q.question,q.options,selected,graded)+feedback+'</section>';
    }).join('');
    app.innerHTML=heading('Exam preparation','Mixed practice exam','The workbook’s 20 questions. Give yourself 30 minutes and write down the deciding condition for each choice. Grade when you have answered every question.')+
      (graded?'<p class="response" role="status"><strong>'+correct+' / '+exam.length+' correct</strong></p>':'<p id="answered" aria-live="polite"></p>')+
      '<form id="exam-form">'+rows+'<div class="button-row">'+(graded?'<button type="button" data-retry>Start a fresh attempt</button>':'<button class="primary" type="submit">Grade my exam</button>')+'<span id="exam-feedback" role="status"></span></div></form>'+
      '<details class="resources"><summary>More portfolio practice</summary><div class="resource-row">'+[
        ['quiz.html?course=2122','CSCI 2122 practice test'],['midterm.html','Midterm builder'],['a2-recall.html','C recall'],['drill.html','Bits and pointers']
      ].map(([path,label])=>'<a href="'+project('fall-2026/'+path)+'">'+label+' ↗</a>').join('')+'</div></details>';
    if (!graded) updateAnswered();
    $('exam-form').onsubmit=e=>{
      e.preventDefault();
      const missing=exam.findIndex((q,i)=>state.examAnswers[i]===undefined);
      if (missing>=0) {
        $('exam-feedback').textContent='Answer question '+(missing+1)+' to finish.';
        const el=app.querySelector('[name="exam-'+missing+'"]');
        el.focus(); el.scrollIntoView({block:'center'}); return;
      }
      state.submitted=true;save();render(true);
    };
  }
  function updateAnswered() {
    $('answered').textContent=exam.filter((q,i)=>Number.isInteger(state.examAnswers[i])).length+' of '+exam.length+' answered';
  }
  app.addEventListener('input',e=>{
    if (e.target.matches('textarea[data-note]')) { state.notes[e.target.dataset.note]=e.target.value; save(); }
  });
  app.addEventListener('change',e=>{
    if(e.target.matches('[data-skill]')) { state.mastered[e.target.dataset.skill]=e.target.checked;save();updateMastery(); }
    if(e.target.name?.startsWith('exam-') && !state.submitted) {
      state.examAnswers[Number(e.target.name.slice(5))]=Number(e.target.value);save();updateAnswered();
    }
  });
  app.addEventListener('click',e=>{
    if(e.target.closest('[data-retry]')){state.examAnswers={};state.submitted=false;save();render(true);}
  });
  function experiment(id) {
    if(id==='bit-order') return '<details class="experiment"><summary>Try a bit position</summary><div class="lab-controls"><label>Position <input type="number" min="0" max="31" value="12" id="bit-pos"></label><label>Numbering <select id="bit-order"><option>LSB-first</option><option>MSB-first</option></select></label></div><p id="bit-output" aria-live="polite"></p></details>';
    if(id==='direct'||id==='ways') return '<details class="experiment"><summary>Step through the cache</summary><p>Read byte addresses 0, 1, 7, 8, 0 from a cold eight-byte cache.</p><div class="lab-controls"><label>Geometry <select id="cache-ways"><option value="1">4 sets, one way</option><option value="2">2 sets, two ways</option></select></label><button id="back-access">Back</button><button id="next-access">Read next byte</button></div><div id="trace" aria-live="polite"></div></details>';
    return '';
  }
  function wireExperiment(id) {
    if (id==='bit-order') {
      const update=()=>{
        const p=$('bit-pos').valueAsNumber;
        if(!Number.isInteger(p)||p<0||p>31){$('bit-output').textContent='Enter a whole position from 0 to 31.';return;}
        const slot=p%8, shift=$('bit-order').selectedIndex ? 7-slot : slot;
        $('bit-output').textContent='Byte '+Math.floor(p/8)+', slot '+slot+', shift '+shift+'. Mask 0x'+(1<<shift).toString(16).padStart(2,'0').toUpperCase()+' ('+(1<<shift).toString(2).padStart(8,'0')+').';
      };
      $('bit-pos').oninput=$('bit-order').onchange=update;update();
    }
    if(id!=='direct'&&id!=='ways')return;
    let count=0;
    $('cache-ways').value=id==='direct'?'1':'2';
    const addresses=[0,1,7,8,0];
    const show=()=>{
      const ways=Number($('cache-ways').value), sets=4/ways;
      const lines=Array.from({length:sets},()=>[]);
      const history=[];
      let last='All lines are invalid.';
      for(const addr of addresses.slice(0,count)){
        const block=Math.floor(addr/2),set=block%sets,tag=Math.floor(block/sets);
        const slot=lines[set],hit=slot.includes(tag);
        if(hit) slot.splice(slot.indexOf(tag),1);
        if(slot.length===ways)slot.shift();
        slot.push(tag);
        history.push(hit?'H':'M');
        last='Byte '+addr+' → block '+block+', set '+set+', tag '+tag+'. '+(hit?'Hit.':'Miss.');
      }
      $('trace').innerHTML='<p><strong>'+last+'</strong> '+history.join(' · ')+'</p><table><thead><tr><th>Set</th><th>Resident tags (oldest first)</th></tr></thead><tbody>'+lines.map((tags,s)=>'<tr><th scope="row">'+s+'</th><td>'+[...tags,...Array(ways-tags.length).fill('invalid')].join(', ')+'</td></tr>').join('')+'</tbody></table>';
      $('next-access').disabled=count===addresses.length;$('back-access').disabled=count===0;
    };
    $('next-access').onclick=()=>{count++;show();};$('back-access').onclick=()=>{count--;show();};
    $('cache-ways').onchange=show;show();
  }
  function render(focus=false) {
    const {id,tab}=route();
    if (id==='exam') examPage();
    else if (id==='checklist') checklist(tab);
    else { state.last=id;save();renderLesson(lessons[byId.get(id)],tab); }
    document.title=app.querySelector('h1').textContent+' · Systems Lab';
    outline();menu(false);
    if(focus){window.scrollTo(0,0);app.querySelector('h1').focus({preventScroll:true});}
    if(id==='checklist' && /^\d+$/.test(tab||'')) {
      document.getElementById('skill-'+tab)?.scrollIntoView({block:'center'});
    }
  }
  window.addEventListener('hashchange',()=>render(true));render();
})();
