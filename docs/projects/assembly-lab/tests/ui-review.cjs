/* Optional DOM integration suite. Requires jsdom; no browser or site server is started. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require(process.env.ASSEMBLY_LAB_JSDOM||'jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const key='mizel:assembly-lab:progress:v1';
const json=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name),'utf8'));
const bank=json('manifest.json').banks.flatMap(n=>json(n).questions);
const course=json('lessons.json').lessons;
async function open(saved){
 const dom=new JSDOM(html,{url:'https://example.test/docs/projects/assembly-lab/index.html',runScripts:'outside-only'});
 const w=dom.window;
 w.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))});
 if(saved)w.localStorage.setItem(key,saved);
 w.confirm=()=>true;
 w.eval(fs.readFileSync(path.join(root,'engine.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
 for(let i=0;i<30&&w.document.getElementById('app').hidden;i++)await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(w.document.getElementById('app').hidden,false,w.document.getElementById('load-status').textContent);
 return dom;
}
(async()=>{
 const dom=await open(),w=dom.window,$=id=>w.document.getElementById(id);
 const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change'));};
 const input=code=>{$('assembly-input').value=code;$('assembly-input').dispatchEvent(new w.Event('input'));};
 assert.equal($('lesson-select').options.length,19);
 assert.equal($('lesson-select').value,'00-foundations');
 assert.equal($('concept-select').value,'state');
 assert.equal($('question-select').value,'p-state');
 assert.equal($('code-mode').disabled,true);
 assert.equal($('mcq-total').textContent,'1');
 assert.match($('lesson-content').textContent,/do not need previous assembly knowledge/);
 assert.equal($('lesson-content').querySelector('img').getAttribute('src'),'diagrams/state.svg');
 $('concept-next').click();
 assert.equal($('concept-select').value,'c-assignment');
 assert.equal(JSON.parse(w.localStorage.getItem(key)).readSteps.state,true);
 assert.match($('course-progress').textContent,/1 marked read/);
 // Reading is not counted as an independently solved answer.
 assert.match($('course-progress').textContent,/0 practice questions solved independently/);
 // Every concept renders, and focused practice exposes exactly its own tasks plus earlier review.
 for(const l of course){
  change('lesson-select',l.id);
  for(const step of l.steps){
   change('concept-select',step.id);
   assert.match($('concept-card').textContent,/Explain it in your own words/);
   assert.equal($('practice-scope').value,'step');
   const expected=new Set([...step.practice,...step.review]);
   const actual=new Set();
   for(const type of ['code','mcq'])if(!$(type+'-mode').disabled){
    $(type+'-mode').click();
    for(const option of $('question-select').options)actual.add(option.value);
   }
   assert.deepEqual(actual,expected,step.id);
   if(step.diagram)assert.ok($('concept-card').querySelector('img[alt]'),step.id);
  }
 }
 // Whole-chapter scope does not leak other chapters or reset its selected concept.
 change('lesson-select','03-pointers');change('concept-select','pointer-load');
 const chapter=course.find(l=>l.id==='03-pointers');
 change('practice-scope','chapter');$('code-mode').click();
 assert.equal($('concept-select').value,'pointer-load');
 assert.ok([...$('question-select').options].some(o=>o.value==='l10-swap'));
 const chapterIds=new Set(chapter.steps.flatMap(s=>[...s.practice,...s.review]));
 assert.ok([...$('question-select').options].every(o=>chapterIds.has(o.value)));
 // A focused task button routes to the right question and mode.
 const direct=[...$('concept-card').querySelectorAll('.practice-links button')].find(b=>b.textContent.includes('Read through a pointer'));
 direct.click();assert.equal($('question-select').value,'l10-loadptr');assert.equal($('practice-scope').value,'step');
 input('movq (%rdi),%rax\nret');$('check').click();assert.ok($('feedback').classList.contains('success'));
 // Restore the exact chapter, concept, scope, question and draft.
 const snapshot=w.localStorage.getItem(key),restored=await open(snapshot),rd=restored.window.document;
 assert.equal(rd.getElementById('lesson-select').value,'03-pointers');
 assert.equal(rd.getElementById('concept-select').value,'pointer-load');
 assert.equal(rd.getElementById('question-select').value,'l10-loadptr');
 assert.equal(rd.getElementById('assembly-input').value,'movq (%rdi),%rax\nret');restored.window.close();
 // Original bank remains available and all answers still pass through real UI handlers.
 change('lesson-select','all');
 assert.equal($('code-total').textContent,'103');assert.equal($('mcq-total').textContent,'188');
 $('code-mode').click();
 for(const q of bank.filter(q=>q.type==='code')){
  change('question-select',q.id);input(q.solutions[0]);$('check').click();
  assert.ok($('feedback').classList.contains('success'),q.id+': '+$('feedback').textContent);
 }
 $('mcq-mode').click();
 for(const q of bank.filter(q=>q.type==='mcq')){
  change('question-select',q.id);if($('check').textContent==='Try again')$('check').click();
  $('options').querySelector('input[value="'+q.correctAnswer+'"]').click();$('check').click();
  assert.ok($('feedback').textContent.startsWith('Correct.'),q.id);
 }
 // v1 progress migrates to the beginning of the new path while retaining valid records.
 const old=JSON.parse(w.localStorage.getItem(key));delete old.courseVersion;delete old.steps;delete old.readSteps;old.lesson='01-machine';
 const migrated=await open(JSON.stringify(old)),md=migrated.window.document;
 assert.equal(md.getElementById('lesson-select').value,'00-foundations');
 assert.equal(md.getElementById('concept-select').value,'state');
 assert.equal(JSON.parse(migrated.window.localStorage.getItem(key)).records['code-01'].passed,true);
 migrated.window.close();
 // Final traces still show aliases accurately and never falsely mark work solved.
 change('lesson-select','original');$('code-mode').click();
 input('movb $255,%al\nmovb %al,%dl');$('trace-button').click();$('trace-final').click();
 assert.match($('trace-state').textContent,/Final state after 2 instructions/);
 assert.match($('trace-state').textContent,/%dl\s+-1\s+\(0xff; 8 bits\)/);
 // Retry feedback and import visibility remain usable from within the new course.
 change('lesson-select','09-branches');change('concept-select','flag-lifetime');$('mcq-mode').click();change('question-select','l10-zero-shift-alias');
 if($('check').textContent==='Try again')$('check').click();
 $('options').querySelector('input[value="1"]').click();$('check').click();assert.match($('feedback').textContent,/Correct/);
 $('check').click();assert.equal($('options').querySelector('input:checked'),null);
 const incoming={schemaVersion:1,questions:[{id:'review-import',type:'mcq',category:'review',title:'Imported concept',question:'Pick 1',options:['1','2'],correctAnswer:0,explanation:'One.'}]};
 Object.defineProperty($('import-bank'),'files',{value:[{size:200,text:async()=>JSON.stringify(incoming)}],configurable:true});
 $('import-bank').dispatchEvent(new w.Event('change'));await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal($('lesson-select').value,'all');assert.equal($('question-select').value,'review-import');
 w.localStorage.setItem('unrelated-tool','keep');$('reset').click();
 const reset=JSON.parse(w.localStorage.getItem(key));assert.ok(Object.values(reset.records).every(r=>r.attempts===0&&!r.passed&&!r.draft));
 assert.deepEqual(reset.readSteps,{});assert.equal(w.localStorage.getItem('unrelated-tool'),'keep');
 w.close();
 console.log('DOM workflow passed: 17 chapters, 108 concepts, 291 answers, focused/chapter practice, direct task buttons, progress migration, restoration, traces, retry, imports and reset.');
})().catch(e=>{console.error(e);process.exitCode=1;});
