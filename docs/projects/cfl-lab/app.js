(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey = 'cfl-lab-progress-v1';
  let lessons = [], state = {read: {}, ready: {}, drafts: {}}, currentId = null, search = '', saveTimer;
  let storageAvailable = true;
  const view = $('#view');
  function storageWarning() {
    storageAvailable = false;
    $('#storage-status').hidden = false;
    $('#storage-status').textContent = 'This browser cannot save your progress. Your notes will stay available while this page is open.';
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      for (const key of ['read','ready','drafts']) if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) state[key] = saved[key];
    }
  } catch (_) { storageWarning(); }
  function save() { if (storageAvailable) try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) { storageWarning(); } }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }
  function groups() {
    const result = [];
    lessons.forEach(l => { let g = result.find(x => x.name === l.module); if (!g) result.push(g = {name:l.module,lessons:[]}); g.lessons.push(l); });
    return result;
  }
  function route() { const raw = location.hash.slice(1); return raw.startsWith('lesson-') ? raw.slice(7) : raw || 'home'; }
  function closeMenu(returnFocus = false) { document.body.classList.remove('sidebar-open'); $('#sidebar-backdrop').hidden = true; $('#menu-toggle').setAttribute('aria-expanded','false'); if (returnFocus) $('#menu-toggle').focus(); }
  function updateProgress() {
    const read = lessons.filter(l => state.read[l.id]).length, ready = lessons.filter(l => state.ready[l.id]).length;
    $('#reading-count').textContent = `${read} of ${lessons.length} read`;
    $('#reading-percent').textContent = `${Math.round(100*read/Math.max(1,lessons.length))}%`;
    $('#reading-progress').max = lessons.length; $('#reading-progress').value = read;
    $('#confidence-count').textContent = `${ready} ${ready===1?'lesson':'lessons'} self-assessed as ready`;
  }
  function renderOutline() {
    const active = route();
    $('#course-outline').innerHTML = groups().map((g,i) => {
      const filtered = g.lessons.filter(l => !search || `${l.id} ${l.title} ${l.summary} ${l.module} ${l.goals.join(' ')} ${l.setup || ''} ${l.worked.intro} ${l.worked.steps.map(s=>s.title+' '+s.html).join(' ')} ${l.sections.map(s=>s.title+' '+s.html).join(' ')} ${l.practice.map(p=>p.prompt+' '+p.solution).join(' ')} ${l.check.prompt} ${l.transfer.prompt} ${l.bridge || ''}`.replace(/<[^>]+>/g,' ').toLowerCase().includes(search));
      if (!filtered.length) return '';
      return `<details class="chapter" ${search || g.lessons.some(l=>l.id===active) || active==='home' && i===0 ? 'open':''}><summary><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span>${escapeHTML(g.name)}</span></summary><div class="chapter-lessons">${filtered.map(l=>`<a class="lesson-link" href="#lesson-${l.id}" ${l.id===active?'aria-current="page"':''}><span class="lesson-number">${l.id}</span><span>${escapeHTML(l.title)}</span>${state.read[l.id]?'<span class="read-mark" aria-label="Marked read">✓</span>':''}</a>`).join('')}</div></details>`;
    }).join('');
    $('#search-empty').hidden = !!$('#course-outline').textContent.trim();
    document.querySelectorAll('.start-link a,.tool-links a').forEach(a => { if (a.hash === `#${active}`) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    updateProgress();
  }
  function heading(kicker,title,description) { return `<header class="page-heading"><p class="eyebrow">${escapeHTML(kicker)}</p><h1 id="page-title" tabindex="-1">${escapeHTML(title)}</h1><p class="page-description">${escapeHTML(description)}</p></header>`; }
  function home() {
    const next = lessons.find(l=>!state.read[l.id]) || lessons[0];
    return heading('A COMPLETE LEARNING PATH · CSCI 2115','Context-free languages, one idea at a time.','Learn to describe a language, construct a grammar, trace a parser, build a pushdown automaton and write a proof.')+
      `<section class="home-lead"><p>Start with a complete example. Read why each step works. Then build your own answer, with less help each time. The lessons develop the ideas in order, so each new problem uses skills you have already practised.</p><a class="primary-link" href="#lesson-${next.id}">${lessons.some(l=>state.read[l.id])?'Continue learning':'Start with the first lesson'} <span aria-hidden="true">→</span></a></section>
      <div class="learning-sequence" aria-label="The course in five parts"><div><span>01</span><strong>Read a language</strong><p>Symbols, order and counts.</p></div><div><span>02</span><strong>Write a grammar</strong><p>Rules that generate it.</p></div><div><span>03</span><strong>Build a tree</strong><p>Structure and derivations.</p></div><div><span>04</span><strong>Use a stack</strong><p>Machines that recognize it.</p></div><div><span>05</span><strong>Prove a limit</strong><p>What a stack cannot do.</p></div></div>
      <section class="study-method"><h2>How to use each lesson</h2><ol><li>Read the lesson connection and new terms, then see the complete worked example before studying its steps.</li><li>Follow each explanation. Use “One step at a time” when you want to slow down.</li><li>Write an answer to the guided practice before opening its hint or solution.</li><li>Explain the check in your own words, then try the independent problem.</li><li>Mark the lesson read. Mark yourself ready when you can solve a new problem and explain why your answer works.</li></ol><p class="small">Reading and confidence are separate. Written answers are yours to compare with the explanations; they are not automatically graded.</p></section>
      <section aria-labelledby="curriculum-title"><h2 id="curriculum-title">Your learning path</h2><p class="section-intro">${lessons.length} lessons, with worked examples, guided practice and independent problems.</p>${groups().map((g,i)=>`<section class="curriculum-module"><header><span>${String(i+1).padStart(2,'0')}</span><h3>${escapeHTML(g.name)}</h3></header><div class="curriculum-lessons">${g.lessons.map(l=>`<a href="#lesson-${l.id}"><span>${l.id}</span>${escapeHTML(l.title)}</a>`).join('')}</div></section>`).join('')}</section>`;
  }
  function pager(index) { return `<nav class="lesson-pager" aria-label="Previous and next lesson">${index>0?`<a href="#lesson-${lessons[index-1].id}">← Previous lesson</a>`:'<a href="#home">← Course overview</a>'}${index<lessons.length-1?`<a class="next" href="#lesson-${lessons[index+1].id}">Next lesson →</a>`:'<a class="next" href="#tools">Open workbench →</a>'}</nav>`; }
  function draft(id,key,label) { const name = `${id}-${key}`; return `<label class="draft-label" for="draft-${name}">${label}</label><textarea id="draft-${name}" data-draft="${name}" spellcheck="false" placeholder="Write your reasoning here…">${escapeHTML(state.drafts[name] || '')}</textarea>`; }
  function html(value) { return String(value ?? ''); }
  function lesson(l) {
    const index = lessons.indexOf(l), w = l.worked;
    return heading(`${l.module} · Lesson ${l.id} of ${lessons.length}`,l.title,l.summary)+pager(index)+
      `<nav class="lesson-jump" aria-label="In this lesson"><a href="#start-here" data-scroll="start-here">Start here</a><a href="#worked-example" data-scroll="worked-example">Worked example</a><a href="#concepts" data-scroll="concepts">Understand it</a><a href="#practice" data-scroll="practice">Practise</a><a href="#independent" data-scroll="independent">Try independently</a></nav>
      <section class="goals" aria-labelledby="goals-title"><h2 id="goals-title">By the end, you can</h2><ul>${l.goals.map(g=>`<li>${escapeHTML(g)}</li>`).join('')}</ul></section>
      ${l.setup?`<section id="start-here" class="lesson-section lesson-setup" aria-labelledby="setup-title"><p class="eyebrow">CONNECT THE IDEAS</p><h2 id="setup-title">Before the example</h2>${html(l.setup)}</section>`:""}
      <section id="worked-example" class="worked-example" aria-labelledby="worked-title"><p class="eyebrow">SEE THE COMPLETE EXAMPLE</p><h2 id="worked-title">${escapeHTML(w.title)}</h2><div class="example-intro">${html(w.intro)}</div><div class="step-controls" role="group" aria-label="Worked example display"><button id="show-all" aria-pressed="true">Show all steps</button><button id="show-one" aria-pressed="false">One step at a time</button><button id="step-prev" hidden>← Back</button><button id="step-next" hidden>Next step →</button><span id="step-position" class="step-position">${w.steps.length} steps</span></div><ol class="worked-steps">${w.steps.map((s,i)=>`<li class="worked-step" data-step="${i}" style="counter-reset:worked ${i}"><h3>${escapeHTML(s.title)}</h3><div class="step-content">${html(s.html)}</div></li>`).join('')}</ol></section>
      <div id="concepts" class="lesson-content">${l.sections.map((s,i)=>`<section class="lesson-section" id="section-${i+1}"><h2>${escapeHTML(s.title)}</h2>${html(s.html)}</section>`).join('')}</div>
      <section id="practice" class="practice-section" aria-labelledby="practice-title"><p class="eyebrow">BUILD YOUR OWN ANSWER</p><h2 id="practice-title">Guided practice</h2><p class="section-intro">Try each problem before revealing help. Compare your reasoning as well as your final answer.</p>${l.practice.map((p,i)=>`<article class="exercise"><h3>Practice ${i+1}</h3><div class="exercise-prompt">${html(p.prompt)}</div>${draft(l.id,`practice-${i}`,'Your attempt · saved on this device')}<details><summary>Show a hint</summary><div class="answer">${html(p.hint)}</div></details><details><summary>Show the worked solution</summary><div class="answer">${html(p.solution)}</div></details></article>`).join('')}</section>
      <section class="self-check exercise" aria-labelledby="check-title"><p class="eyebrow">EXPLAIN IT IN YOUR OWN WORDS</p><h2 id="check-title">Check your understanding</h2><div class="exercise-prompt">${html(l.check.prompt)}</div>${draft(l.id,'check','Your explanation')}<details><summary>Compare with an explanation</summary><div class="answer"><div>${html(l.check.answer)}</div><div>${html(l.check.explanation)}</div></div></details></section>
      <section id="independent" class="exercise transfer" aria-labelledby="transfer-title"><p class="eyebrow">USE THE IDEA IN A NEW PROBLEM</p><h2 id="transfer-title">Try independently</h2><div class="exercise-prompt">${html(l.transfer.prompt)}</div>${draft(l.id,'transfer','Your complete answer')}<details><summary>Check the solution after your attempt</summary><div class="answer">${html(l.transfer.solution)}</div></details></section>
      ${l.bridge?`<section class="lesson-bridge" aria-labelledby="bridge-title"><h2 id="bridge-title">Carry this forward</h2><p>${escapeHTML(l.bridge)}</p></section>`:""}
      <div class="reading-actions"><label class="progress-check"><input type="checkbox" id="mark-read" ${state.read[l.id]?'checked':''}>I have read this lesson</label><label class="progress-check"><input type="checkbox" id="mark-ready" ${state.ready[l.id]?'checked':''}>I can solve a new problem using this idea</label><p class="progress-explanation">Your own assessment, saved on this device. Opening a solution does not count as independent success.</p></div>${pager(index)}
      <details class="source-note"><summary>Source topics for this lesson</summary>${l.sources.map(s=>`<p>${escapeHTML(s.deck)}${s.pages.length?' · '+(s.pages.length===1?'page ':'pages ')+s.pages.join(', '):''}</p>`).join('')}<p><a href="coverage.html">View the complete slide coverage map ↗</a></p></details>`;
  }
  function reference() {
    return heading('KEEP NEARBY','Symbols & problem-solving methods','Read the notation aloud, identify the structure, and give every step a reason.')+
      `<section class="reference-section"><h2>Read the symbols</h2><table><thead><tr><th>Notation</th><th>Read it as</th><th>What it means</th></tr></thead><tbody><tr><td><code>Σ</code></td><td>alphabet sigma</td><td>The set of allowed input symbols.</td></tr><tr><td><code>ε</code></td><td>empty string</td><td>A string containing zero symbols. Its length is 0.</td></tr><tr><td><code>∅</code></td><td>empty set</td><td>A set containing no strings. Different from {ε}.</td></tr><tr><td><code>Σ*</code></td><td>all finite strings over sigma</td><td>Includes ε.</td></tr><tr><td><code>aⁿ</code></td><td>n copies of a</td><td>Concatenate a exactly n times; a⁰ = ε.</td></tr><tr><td><code>|w|ₐ</code></td><td>number of a symbols in w</td><td>Count occurrences, regardless of their positions.</td></tr><tr><td><code>S → aSb | ε</code></td><td>S may become a S b, or the empty string</td><td>Two productions; the vertical bar separates alternatives.</td></tr><tr><td><code>⇒</code> / <code>⇒*</code></td><td>derives in one step / zero or more steps</td><td>Apply one production / a sequence of productions.</td></tr><tr><td><code>∈</code> / <code>∉</code></td><td>belongs to / does not belong to</td><td>Membership of a string in a language.</td></tr><tr><td><code>∧</code> / <code>∨</code></td><td>and / or</td><td>Both conditions must hold / at least one must hold.</td></tr><tr><td><code>wᴿ</code></td><td>w reversed</td><td>The symbols of w in reverse order.</td></tr><tr><td><code>Z</code> / <code>#</code> in a stack</td><td>bottom marker</td><td>A marker used to detect when the counting or grammar symbols above it are gone. Its name depends on the machine.</td></tr><tr><td><code>#</code> in an input</td><td>separator</td><td>An actual input symbol used to mark the middle in languages such as w#wᴿ. Check the declared alphabet.</td></tr><tr><td><code>$</code></td><td>right-end marker</td><td>An added input symbol declaring the end; distinct from ε, which consumes nothing.</td></tr><tr><td><code>read, top/replacement</code></td><td>PDA transition</td><td>Consume the read symbol unless it is ε; require and remove the named top, then put the replacement above the untouched stack.</td></tr><tr><td><code>⊆</code> / <code>∩</code> / <code>∪</code></td><td>subset / intersection / union</td><td>Every member belongs to the other set / belongs to both sets / belongs to at least one set.</td></tr><tr><td><code>u vⁱ x yⁱ z</code></td><td>pump v and y together</td><td>Repeat v and y the same number of times; u, x and z stay once. At i = 0 the two pumped pieces disappear.</td></tr></tbody></table></section>
      <section class="reference-section"><h2>Choose a method</h2><details open><summary>Design a grammar</summary><ol><li>Write accepted and rejected strings, including the smallest cases.</li><li>Separate order constraints from count constraints.</li><li>Choose independent pieces or dependent outer pairs.</li><li>Choose a base case that obeys all lower bounds.</li><li>Add recursive rules that preserve the required relationship.</li><li>Show both that every generated string is allowed and that every allowed string can be generated.</li></ol></details><details><summary>Build a parse tree</summary><ol><li>Put the start variable at the root.</li><li>Expand each variable using exactly one production.</li><li>Keep children in the order of that production.</li><li>Expand every variable, including nullable lists.</li><li>Read terminal leaves left to right; they must match the entire input.</li></ol></details><details><summary>Design a PDA</summary><ol><li>State whether acceptance uses a final state or an empty stack.</li><li>Write which end of your written stack is the top.</li><li>Say what each stack symbol counts or represents.</li><li>Use states for input phases and the stack for unbounded information.</li><li>Write each transition's input, pop requirement and replacement.</li><li>Test full input consumption, phase order, underflow and boundary cases.</li></ol><p>With deterministic empty-stack acceptance, make any end-marker convention explicit. An empty input position in a transition is an ε-move, not a test that input has ended.</p></details><details><summary>Write a CFL pumping proof</summary><ol><li>Assume the language is context-free and name its pumping length p.</li><li>Choose a string in the language whose length is at least p.</li><li>Consider every legal decomposition u v x y z.</li><li>Use |vxy| ≤ p and |vy| &gt; 0 to organize exhaustive cases.</li><li>For each case, choose a pumping exponent i ≥ 0 that breaks membership.</li><li>State the contradiction and the conclusion.</li></ol><p>You choose the witness and pumping exponent. You do not choose how the opponent decomposes your witness.</p></details></section>
      <p><a href="#tools">Open the interactive workbench →</a></p>`;
  }
  function sources() {
    return heading('COURSE NOTES','Sources & coverage','The learning path reorganizes the supplied topics into a gradual sequence of concepts and problems.')+
      `<section class="reference-section"><h2>Reviewed slide decks</h2><p>The course was built from a review of six slide decks, totalling 144 pages. Worked examples and practice are written as self-contained lessons, so you can learn without opening the slides.</p><table><thead><tr><th>Source</th><th>Pages</th><th>Main topics</th></tr></thead><tbody><tr><td>Context Free Languages.pdf</td><td>26</td><td>Grammars, derivations, parse trees and language structure.</td></tr><tr><td>Parsers .pdf</td><td>27</td><td>Parsing, leftmost and rightmost derivations, recursive descent and lookahead.</td></tr><tr><td>Pushdown Automata.pdf</td><td>13</td><td>Stacks, transitions, nondeterminism and acceptance.</td></tr><tr><td>The Equivalence Theorem for CFLs and PDAs.pdf</td><td>28</td><td>Grammar-machine conversions and their meaning.</td></tr><tr><td>Designing Grammars and PDAs.pdf</td><td>19</td><td>Independent and nested structures, design patterns and constructions.</td></tr><tr><td>Pumping Lemma for CFLs.pdf</td><td>31</td><td>Quantifiers, pumping decompositions, case analysis and non-context-free proofs.</td></tr></tbody></table><p><a href="coverage.html">See the slide-by-slide coverage map →</a></p></section>
      <section class="reference-section"><h2>Supplementary material</h2><p>Additional explanations, fresh examples and practice fill the prerequisite steps between the supplied topics. Parsing extensions and further proof techniques are identified in the coverage map.</p><p>The lessons make acceptance conventions explicit and correct inconsistencies in examples where necessary. The coverage map distinguishes source topics from extensions.</p></section>
      <section class="reference-section"><h2>What progress means</h2><p>Reading marks are bookmarks. “I can solve a new problem” is your own assessment. Written practice and proofs are not automatically graded. Use the worked solutions to check the structure and reasons in your answer, then try a fresh problem without opening help.</p><p>Your notes and progress stay in this browser on this device. They are not uploaded or synchronized.</p></section>
      <section class="settings"><h2>Your saved progress</h2><p>You can clear this lab's reading marks, confidence marks and written practice notes.</p><button id="reset-request" class="danger">Reset this lab's progress</button><div id="reset-panel" class="reset-panel" hidden><p>This clears your saved notes and progress for this lab on this device. Continue?</p><button id="reset-confirm" class="danger">Clear notes and progress</button><button id="reset-cancel">Keep my progress</button></div><p id="reset-status" class="status-line" role="status"></p></section>`;
  }
  function setupLesson(l) {
    let step = 0, one = false;
    const updateSteps = () => {
      document.querySelectorAll('.worked-step').forEach((el,i)=>{el.hidden=one && i!==step;});
      $('#show-all').setAttribute('aria-pressed',String(!one)); $('#show-one').setAttribute('aria-pressed',String(one));
      $('#step-prev').hidden=!one; $('#step-next').hidden=!one;
      $('#step-prev').disabled=step===0; $('#step-next').disabled=step===l.worked.steps.length-1;
      $('#step-position').textContent=one?`Step ${step+1} of ${l.worked.steps.length}`:`${l.worked.steps.length} steps`;
    };
    $('#show-all').onclick=()=>{one=false;updateSteps();}; $('#show-one').onclick=()=>{one=true;updateSteps();};
    $('#step-prev').onclick=()=>{step=Math.max(0,step-1);updateSteps();}; $('#step-next').onclick=()=>{step=Math.min(l.worked.steps.length-1,step+1);updateSteps();};
    $('#mark-read').onchange=e=>{state.read[l.id]=e.target.checked;save();renderOutline();};
    $('#mark-ready').onchange=e=>{state.ready[l.id]=e.target.checked;save();renderOutline();};
    view.querySelectorAll('[data-draft]').forEach(el=>el.addEventListener('input',()=>{state.drafts[el.dataset.draft]=el.value;queueSave();}));
    view.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const target=document.getElementById(a.dataset.scroll);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
    wrapTables();
  }
  function wrapTables() { view.querySelectorAll('table').forEach(t=>{if(t.parentElement.classList.contains('table-scroll'))return;const wrap=document.createElement('div');wrap.className='table-scroll';t.before(wrap);wrap.append(t);}); }
  function render(focus=true) {
    clearTimeout(saveTimer);save();currentId=route();
    const l=lessons.find(x=>x.id===currentId);
    if(l){view.innerHTML=lesson(l);setupLesson(l);document.title=`${l.title} · CFL Lab`;}
    else if(currentId==='reference'){view.innerHTML=reference();document.title='Symbols & methods · CFL Lab';wrapTables();}
    else if(currentId==='sources'){
      view.innerHTML=sources();document.title='Sources & coverage · CFL Lab';wrapTables();
      $('#reset-request').onclick=()=>{$('#reset-panel').hidden=false;$('#reset-cancel').focus();};
      $('#reset-cancel').onclick=()=>{$('#reset-panel').hidden=true;$('#reset-request').focus();};
      $('#reset-confirm').onclick=()=>{state={read:{},ready:{},drafts:{}};save();renderOutline();$('#reset-panel').hidden=true;$('#reset-status').textContent='This lab’s notes and progress have been cleared.';$('#reset-request').focus();};
    }else if(currentId==='tools'){
      view.innerHTML=heading('TRY IT AND TRACE IT','Interactive workbench','Change the input. Predict the result, then inspect the steps.')+'<div id="workbench"></div>';
      if(window.CFLTools && typeof window.CFLTools.mount==='function')window.CFLTools.mount($('#workbench'));
      else $('#workbench').innerHTML='<p class="notice">The workbench could not load. Reload the page to try again; all lessons remain available.</p>';
      document.title='Interactive workbench · CFL Lab';
    }else{view.innerHTML=home();document.title='Context-Free Languages Lab · CSCI 2115';}
    renderOutline();closeMenu();
    if(focus){window.scrollTo({top:0,behavior:'instant'});$('#page-title')?.focus({preventScroll:true});}
  }
  $('#menu-toggle').addEventListener('click',()=>{const open=!document.body.classList.contains('sidebar-open');document.body.classList.toggle('sidebar-open',open);$('#sidebar-backdrop').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));if(open)$('#menu-close').focus();});
  $('#menu-close').addEventListener('click',()=>closeMenu(true));$('#sidebar-backdrop').addEventListener('click',()=>closeMenu(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && document.body.classList.contains('sidebar-open'))closeMenu(true);});
  $('#lesson-search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();renderOutline();});
  window.addEventListener('hashchange',()=>{if(lessons.length)render();});
  window.addEventListener('pagehide',save);
  fetch('data/lessons.json?v=20261103-continuity').then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}).then(data=>{
    if(!Array.isArray(data)||!data.length)throw new Error('No lessons found');lessons=data;$('#load-status').hidden=true;$('#lesson-search').disabled=false;render(false);
  }).catch(()=>{$('#load-status').innerHTML='The course could not load. <button id="retry-load">Reload course</button>';$('#retry-load').onclick=()=>location.reload();});
})();
