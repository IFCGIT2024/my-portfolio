// Execute the real browser controller against a minimal DOM; visual QA is separate.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../a2-recall-core.js');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'a2-recall.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'a2-recall.html'), 'utf8');
const bank = {
  schemaVersion: 1, title: 'Test', description: 'Fixture', assumptions: ['C17; 8-bit bytes.'],
  sources: [{title: 'Fixture', detail: 'Synthetic prompts for controller tests.'}],
  topics: ['numeric', 'exact', 'self'].map(id => ({id, title: id, description: id, notes: ['Reference note'], prerequisites: []})),
  questions: [
    {id:'number-1',topic:'numeric',family:'numeric',stage:1,type:'number',prompt:'How many bytes?',answer:'8',hint:'Multiply.',explanation:'Four times two.',source:'fixture'},
    {id:'exact-1',topic:'exact',family:'exact',stage:1,type:'exact',prompt:'Give the token.',answer:'unsigned',hint:'A type modifier.',explanation:'Unsigned arithmetic.',source:'fixture'},
    {id:'self-1',topic:'self',family:'self',stage:1,type:'self',prompt:'Write a helper.',answer:'return 1;',hint:'Use return.',explanation:'A model only.',rubric:['Returns one.'],source:'fixture'}
  ]
};
class Element {
  constructor(tag='div') { this.tag=tag;this.children=[];this.events={};this.attributes={};this.dataset={};this.textContent='';this.value='';this.hidden=false;this.disabled=false;this.open=false; }
  get options(){return this.children;}
  get firstElementChild(){return this.children[0];}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  async fire(type,extra={}){if(this.disabled)return;for(const fn of this.events[type]||[])await fn({preventDefault(){},target:this,...extra});}
  querySelector(){return this.children[0];}
  focus(){this.focused=true;}
  scrollIntoView(){}
  remove(){}
  click(){return this.fire('click');}
}
const content = node => node.textContent+' '+node.children.map(content).join(' ');
async function load(saved=null,options={}) {
  const elements=Object.fromEntries([...html.matchAll(/<([a-z]+)[^>]*id="([^"]+)"[^>]*>/g)].map(match=>{
    const element=new Element(match[1]);element.id=match[2];element.hidden=/\shidden(?:\s|>)/.test(match[0]);return [match[2],element];
  }));
  for(const match of html.matchAll(/<select id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const select=elements[match[1]];
    for(const optionMatch of match[2].matchAll(/<option value="([^"]*)"([^>]*)>(.*?)<\/option>/g)) {
      const option=new Element('option');option.value=optionMatch[1];option.textContent=optionMatch[3];select.append(option);
      if(select.children.length===1||/selected/.test(optionMatch[2]))select.value=option.value;
    }
  }
  elements['question-code'].append(new Element('code'));
  const ratings=[0,1,2].map(value=>{const button=new Element('button');button.dataset.rating=String(value);return button;});
  elements['self-rating'].append(...ratings);
  const storage={value:saved};
  const context={
    window:{A2Recall:core,addEventListener(){},confirm:()=>true,location:{reload(){}}},
    document:{getElementById:id=>{assert(elements[id],id);return elements[id];},createElement:tag=>new Element(tag),createTextNode:value=>{const text=new Element('#text');text.textContent=value;return text;},querySelectorAll:()=>ratings,body:new Element('body')},
    localStorage:{getItem(){if(options.noStorage)throw Error('blocked');return storage.value;},setItem(key,value){if(options.noStorage)throw Error('blocked');storage.value=value;}},
    fetch:async()=>({ok:!options.failFetch,status:503,json:async()=>options.bank||bank}),
    setTimeout:fn=>fn(),URL:{createObjectURL:()=> 'blob:fixture',revokeObjectURL(){}},Blob:class{},
    Date,Math
  };
  vm.runInNewContext(script,context);
  await new Promise(resolve=>setImmediate(resolve));
  const stored=()=>JSON.parse(storage.value);
  return {e:elements,ratings,storage,stored};
}
async function start(harness,topic) {harness.e.topic.value=topic;await harness.e['setup-form'].fire('submit');}
async function answer(harness,value,long=false) {const element=harness.e[long?'answer-long':'answer-short'];element.value=value;await element.fire('input');await harness.e['answer-form'].fire('submit');}

test('numeric input errors do not consume attempts; successful feedback resumes without a second record',async()=>{
  const h=await load();await start(h,'numeric');
  assert(h.e['feedback-panel'].hidden);assert.equal(h.e['model-answer'].textContent,'');
  await answer(h,'eight');assert.match(h.e['answer-error'].textContent,/decimal integer/);assert.equal(h.stored().history.length,0);
  await answer(h,'8');assert.equal(h.stored().history.length,1);assert.equal(h.stored().history[0].outcome,'independent');
  assert.equal(h.e['model-answer'].textContent,'8');assert(h.e['answer-short'].disabled);
  const resumed=await load(h.storage.value);await resumed.e['resume-session'].fire('click');
  assert(!resumed.e['feedback-panel'].hidden);assert.equal(resumed.stored().history.length,1);
  await resumed.e['next-question'].fire('click');assert(!resumed.e['summary-panel'].hidden);assert.equal(resumed.stored().history.length,1);
});

test('self drafts, hint use and pending rubric persist, with one self-labelled assisted attempt',async()=>{
  const h=await load();await start(h,'self');
  h.e['answer-long'].value='return one;';await h.e['answer-long'].fire('input');
  h.e['confidence'].value='unsure';await h.e.confidence.fire('change');
  h.e['question-reference'].open=true;await h.e['question-reference'].fire('toggle');
  assert(!h.e['show-hint'].disabled);await h.e['show-hint'].fire('click');
  await h.e['answer-form'].fire('submit');
  assert.equal(h.stored().history.length,0);assert.equal(h.stored().session.ui.phase,'self');
  const resumed=await load(h.storage.value);await resumed.e['resume-session'].fire('click');
  assert.equal(resumed.e['answer-long'].value,'return one;');assert.equal(resumed.e.confidence.value,'unsure');
  assert(!resumed.e['hint-panel'].hidden);assert(!resumed.e['self-rating'].hidden);
  await resumed.ratings[2].fire('click');
  const record=resumed.stored().history[0];assert.equal(record.kind,'self');assert.equal(record.outcome,'assisted');assert.equal(record.answer,'return one;');
  assert.match(resumed.e['feedback-kind'].textContent,/Self-checked with support/);
  await resumed.ratings[2].fire('click');assert.equal(resumed.stored().history.length,1);
  await resumed.e['next-question'].fire('click');
  assert.equal(resumed.e['summary-stats'].children[1].children[0].textContent,'0');
  assert.equal(resumed.e['summary-stats'].children[2].children[0].textContent,'1');
});

test('exact alternatives can be self-checked without automatic credit or duplicate attempts',async()=>{
  const h=await load();await start(h,'exact');await answer(h,'unsigned int');
  assert.equal(h.stored().history.length,0);assert(!h.e['alternate-check'].hidden);
  await h.e['open-self-check'].fire('click');await h.ratings[2].fire('click');
  assert.equal(h.stored().history.length,1);assert.equal(h.stored().history[0].kind,'self');assert.equal(h.stored().history[0].outcome,'self-pass');
  const other=await load();await start(other,'exact');await answer(other,'wrong');await other.e['next-question'].fire('click');
  assert.equal(other.stored().history.length,1);assert.equal(other.stored().history[0].kind,'auto');assert.equal(other.stored().history[0].outcome,'miss');
});

test('show answer schedules review without recall credit and empty due mode does not add fresh questions',async()=>{
  const h=await load();h.e.mode.value='due';await h.e['setup-form'].fire('submit');
  assert.equal(h.stored().session,null);assert.match(h.e['setup-message'].textContent,/Nothing is due/);assert(h.e['study-panel'].hidden);
  h.e.mode.value='mixed';await start(h,'numeric');assert.equal(h.e['question-topic'].textContent,'Identify the concept');
  await h.e['show-answer'].fire('click');assert.equal(h.stored().history[0].outcome,'revealed');assert.equal(h.stored().history[0].answer,'');
  assert.equal(h.e['question-topic'].textContent,'numeric');assert(h.e['self-rating'].hidden);
  await h.e['next-question'].fire('click');await h.e['review-due'].fire('click');
  assert.match(h.e['setup-message'].textContent,/Nothing is due/);assert(h.e['study-panel'].hidden);
});

test('pause preserves an unsubmitted draft, reset is scoped, and invalid import leaves progress intact',async()=>{
  const h=await load();await start(h,'numeric');h.e['answer-short'].value='12';await h.e['answer-short'].fire('input');
  await h.e['pause-session'].fire('click');assert(!h.e['resume-panel'].hidden);assert.equal(h.stored().history.length,0);
  await h.e['resume-session'].fire('click');assert.equal(h.e['answer-short'].value,'12');assert(h.e['feedback-panel'].hidden);
  const before=h.storage.value;h.e['import-progress'].files=[{size:10,text:async()=>'{broken'}];await h.e['import-progress'].fire('change');
  assert.equal(h.storage.value,before);assert.match(h.e['backup-message'].textContent,/Could not import/);
  await h.e['reset-progress'].fire('click');assert.equal(h.stored().session,null);assert.equal(h.stored().history.length,0);
  assert.match(h.e['backup-message'].textContent,/Other review pages were not changed/);
});

test('load failure and unavailable storage leave actionable states',async()=>{
  let h=await load(null,{failFetch:true});assert(!h.e['retry-load'].hidden);assert.match(h.e['loading-message'].textContent,/HTTP 503/);
  h=await load(null,{noStorage:true});await start(h,'numeric');assert(!h.e['study-panel'].hidden);assert.match(h.e['storage-notice'].textContent,/cannot save progress/);
});


test('every actual Assignment 2 prompt renders and records through its intended grading path',async()=>{
  const actual=JSON.parse(fs.readFileSync(path.join(root,'data/2122-a2-recall.json'),'utf8'));
  assert.deepEqual(core.validateBank(actual),[]);
  for(const q of actual.questions){
    const single={...actual,questions:[q]};
    const h=await load(null,{bank:single});h.e.stage.value='4';await start(h,q.topic);
    assert.equal(h.e['question-prompt'].textContent,q.prompt,q.id);
    assert.equal(h.e['question-code'].firstElementChild.textContent,q.code||'',q.id);
    assert(h.e['feedback-panel'].hidden,q.id);
    await answer(h,q.answer,q.type==='self');
    if(q.type==='self'){assert.equal(h.stored().history.length,0,q.id);await h.ratings[2].fire('click');}
    assert.equal(h.e['model-answer'].textContent,q.answer,q.id);
    assert.equal(h.stored().history.length,1,q.id);
    assert.equal(h.stored().history[0].outcome,q.type==='self'?'self-pass':'independent',q.id);
    await h.e['next-question'].fire('click');assert(!h.e['summary-panel'].hidden,q.id);
  }
});
