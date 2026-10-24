// Exercise the actual controller with a small DOM; live visual checks are separate.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const core=require('../syntax-core.js'),bank=require('../data/2122-syntax.json');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'syntax.html'),'utf8'),script=fs.readFileSync(path.join(root,'syntax.js'),'utf8');
const KEY='csci2122-syntax-v1';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.attributes={};this.dataset={};this.textContent='';this.value='';this.hidden=false;this.disabled=false;this.checked=false;this.classList={add(){}};}
 get options(){return this.children;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(key,value){this.attributes[key]=value;}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
 async fire(type,extra={}){if(this.disabled)return;for(const fn of this.events[type]||[])await fn({preventDefault(){},target:this,...extra});}
 focus(){if(this.document)this.document.activeElement=this;}
 scrollIntoView(){}
 remove(){}
 click(){return this.fire('click');}
}
async function load(saved=null,options={}){
 const elements=Object.fromEntries([...html.matchAll(/<([a-z]+)[^>]*id="([^"]+)"[^>]*>/g)].map(m=>{const e=new Element(m[1]);e.hidden=/\shidden(?:\s|>)/.test(m[0]);return[m[2],e];}));
 for(const m of html.matchAll(/<select id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)){
  const select=elements[m[1]];
  for(const o of m[2].matchAll(/<option value="([^"]*)"([^>]*)>(.*?)<\/option>/g)){const e=new Element('option');e.value=o[1];e.textContent=o[3];select.append(e);if(select.children.length===1||/selected/.test(o[2]))select.value=e.value;}
 }
 const document=new Element('document');document.hidden=false;document.body=new Element('body');document.getElementById=id=>{assert(elements[id],id);return elements[id];};
 document.createElement=tag=>{const e=new Element(tag);e.document=document;return e;};
 for(const e of Object.values(elements))e.document=document;
 const window=new Element('window');window.SyntaxDrill=core;window.confirm=()=>options.confirm!==false;window.location={reload(){options.reloaded=true;}};
 const storage=new Map([[KEY,saved],['csci2122-a2-recall-v1','keep-recall']]),timers=new Map();let serial=0;
 vm.runInNewContext(script,{
  document,window,localStorage:{getItem:k=>{if(options.noStorage)throw Error('blocked');return storage.get(k);},setItem:(k,v)=>{if(options.noStorage)throw Error('blocked');storage.set(k,v);}},
  fetch:async()=>({ok:!options.failFetch,status:503,json:async()=>options.bank||bank}),
  setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id),
  URL:{createObjectURL:()=> 'blob:fixture',revokeObjectURL(){}},Blob:class{},Date,Math
 });
 await new Promise(resolve=>setImmediate(resolve));
 return{e:elements,document,window,storage,timers,stored:()=>JSON.parse(storage.get(KEY)),tick:()=>{const pending=[...timers.values()];timers.clear();for(const fn of pending)fn();}};
}
async function start(h,topic='declarations',pattern='all',length='10'){
 h.e.topic.value=topic;await h.e.topic.fire('change');h.e.pattern.value=pattern;h.e.length.value=length;await h.e['setup-form'].fire('submit');
}
async function correct(h){const c=h.stored().session.current;await h.e.choices.children[c.order.indexOf(core.find(bank,c.id).correct)].fire('click');}

test('setup exposes the full bank, focused patterns, and an actionable empty missed set',async()=>{
 const h=await load();assert(!h.e.app.hidden);assert.equal(h.e.topic.options.length,31);assert(h.e.pattern.disabled);
 assert.match(h.e['bank-size'].textContent,/294 syntax patterns · 30 topics/);assert.equal(h.e['coverage-rows'].children.length,30);
 await h.e['review-missed'].fire('click');assert.match(h.e['setup-message'].textContent,/No missed/);assert(h.e.practice.hidden);
 h.e.topic.value='scanf';await h.e.topic.fire('change');assert(!h.e.pattern.disabled);assert.equal(h.e.pattern.options.length,13);
});

test('all 294 real prompts render and grade correctly through their shuffled buttons',async()=>{
 for(const q of bank.questions){
  const db=core.fresh(bank);core.start(bank,db,{topic:q.topic,pattern:q.id,length:'pass'});
  const h=await load(core.serialize(db));await h.e.resume.fire('click');
  assert.equal(h.e.prompt.textContent,q.prompt,q.id);assert.equal(h.e['question-code'].textContent,q.code||'',q.id);
  assert.equal(h.e.choices.children.length,4);assert(h.e.feedback.hidden);
  await correct(h);assert.equal(h.e['correct-answer'].textContent,q.options[q.correct],q.id);
  assert.equal(h.stored().session.correct,1,q.id);assert(h.e.choices.children.every(e=>e.disabled));
  await h.e.next.fire('click');assert(!h.e.summary.hidden,q.id);
 }
});

test('pause and reload preserve question, choice order and feedback without duplicate scoring',async()=>{
 const h=await load();await start(h);const current=h.stored().session.current;
 await h.e.pause.fire('click');assert(!h.e['resume-box'].hidden);
 const next=await load(h.storage.get(KEY));await next.e.resume.fire('click');assert.deepEqual(next.stored().session.current,current);
 await correct(next);const feedback=await load(next.storage.get(KEY));await feedback.e.resume.fire('click');
 assert(!feedback.e.feedback.hidden);await feedback.e.choices.children[0].fire('click');assert.equal(feedback.stored().session.answered,1);
});

test('reminders and reveals enter missed review; unassisted answers clear it',async()=>{
 const h=await load();await start(h,'masks','masks-01');await h.e.hint.fire('click');await correct(h);
 assert.match(h.e['feedback-title'].textContent,/reminder/);assert.equal(h.stored().session.correct,0);
 await h.e.next.fire('click');await h.e.reveal.fire('click');assert.equal(h.stored().session.revealed,1);
 await h.e.finish.fire('click');await h.e['summary-missed'].fire('click');await correct(h);await h.e.next.fire('click');
 assert(!h.e.summary.hidden);assert(!h.stored().records['masks-01'].missed);
});

test('keyboard chooses once, Enter advances, and form controls keep their native input',async()=>{
 const h=await load();await start(h);const c=h.stored().session.current,index=c.order.indexOf(core.find(bank,c.id).correct);
 await h.document.fire('keydown',{key:String(index+1)});assert.equal(h.stored().session.correct,1);
 await h.document.fire('keydown',{key:String(index+1)});assert.equal(h.stored().session.answered,1);
 await h.document.fire('keydown',{key:'Enter'});assert.equal(h.stored().session.current.outcome,null);
 h.document.activeElement=h.e['auto-next'];await h.document.fire('keydown',{key:'1'});assert.equal(h.stored().session.answered,1);
});

test('auto-next advances only correct answers and stops on pause or hidden tab',async()=>{
 const h=await load();await start(h);h.e['auto-next'].checked=true;await correct(h);
 assert.equal(h.timers.size,1);h.tick();assert.equal(h.stored().session.current.outcome,null);
 await correct(h);await h.e.pause.fire('click');assert.equal(h.timers.size,0);
 await h.e.resume.fire('click');await h.e.next.fire('click');await correct(h);h.document.hidden=true;await h.document.fire('visibilitychange');assert.equal(h.timers.size,0);
 h.document.hidden=false;await h.e.next.fire('click');await h.e.reveal.fire('click');assert.equal(h.timers.size,0);
});

test('valid import restores progress; invalid import and cancelled reset preserve it',async()=>{
 const h=await load();await start(h);await correct(h);const before=h.storage.get(KEY);
 h.e.import.files=[{size:10,text:async()=>'{bad'}];await h.e.import.fire('change');assert.equal(h.storage.get(KEY),before);assert.match(h.e['backup-message'].textContent,/Could not import/);
 const other=await load();other.e.import.files=[{size:before.length,text:async()=>before}];await other.e.import.fire('change');
 assert.equal(other.stored().session.answered,1);assert(!other.e['resume-box'].hidden);
 const cancelled=await load(before,{confirm:false});await cancelled.e.reset.fire('click');assert.equal(cancelled.storage.get(KEY),before);
 await other.e.reset.fire('click');assert.deepEqual(other.stored().records,{});assert.equal(other.storage.get('csci2122-a2-recall-v1'),'keep-recall');
});

test('load and storage failures leave a usable recovery path',async()=>{
 let h=await load(null,{failFetch:true});assert(!h.e.retry.hidden);assert.match(h.e['load-message'].textContent,/HTTP 503/);assert(h.e.app.hidden);
 h=await load(null,{noStorage:true});await start(h);assert(!h.e.practice.hidden);assert.match(h.e['storage-notice'].textContent,/saving is unavailable/);
 h=await load('{bad');assert(!h.e.app.hidden);assert.match(h.e['storage-notice'].textContent,/could not be read/);
});
