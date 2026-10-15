// Runs the real browser controller in a minimal DOM. Visual QA is separate.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../midterm-core.js');
const bank = require('../data/2122-midterm.json');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'midterm.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'midterm.html'), 'utf8');
class Element {
  constructor(tag='div') { this.tag=tag;this.children=[];this.attributes={};this.events={};this.className='';this.textContent='';this.value='';this.checked=false;this.disabled=false;
    this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c;},remove:c=>{this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' ');},toggle:(c,on)=>{on=on??!this.classList.contains(c);on?this.classList.add(c):this.classList.remove(c);}};
  }
  append(...nodes){this.children.push(...nodes);if(this.tag==='select'&&!this.value&&nodes[0])this.value=nodes[0].value;}
  replaceChildren(...nodes){this.children=[...nodes];}
  setAttribute(k,v){this.attributes[k]=v;}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  fire(k){if(!this.disabled)for(const fn of this.events[k]||[])fn();}
  focus(){this.focused=true;}
}
const all = node => [node,...node.children.flatMap(all)];
const text = node => all(node).map(n=>n.textContent).join(' ');
async function load(saved=null,{failFetch=false,noStorage=false}={}) {
  const els=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  for(const id of ['paper','results','setup','resume-area','focus-setting'])els[id].className='hidden';
  els.source.value='variants';els.scope.value='full';els.shuffle.checked=true;
  const storage={value:saved};
  const context={window:{MidtermCore:C,scrollTo(){}},document:{getElementById:id=>{assert(els[id],id);return els[id];},createElement:tag=>new Element(tag),createTextNode:text=>{const e=new Element('#text');e.textContent=text;return e;}},
    localStorage:{getItem:()=>{if(noStorage)throw Error('blocked');return storage.value;},setItem:(key,value)=>{if(noStorage)throw Error('blocked');storage.value=value;}},
    fetch:async()=>({ok:!failFetch,status:503,json:async()=>bank})};
  await vm.runInNewContext(script,context);
  return {e:els,storage};
}
function paperForVariant(v) {
  const s=C.generate(bank,{source:v?'variants':'originals'});
  s.selected=bank.groups.map(g=>({id:g.id+(v?'-V'+String(v).padStart(2,'0'):'-O'),order:g.responseType==='mcq'?[3,1,0,2]:[]}));
  if(!v)s.selected.slice(0,18).forEach(x=>x.order=[0,1,2,3]);
  return s;
}
test('all 231 questions render, accept responses, and review with intact answer mapping',async()=>{
  for(let v=0;v<=10;++v){
    const initial=paperForVariant(v);
    const {e,storage}=await load(JSON.stringify(initial));
    e.resume.fire('click');
    for(let i=0;i<21;++i){
      const q=bank.questions.find(q=>q.id===initial.selected[i].id);
      assert.equal(e['question-title'].textContent,q.question);
      assert(!text(e['question-material']).includes(q.explanation));
      if(q.type==='mcq'){
        const radios=all(e.response).filter(n=>n.tag==='input');assert.equal(radios.length,4);
        radios.find(n=>+n.value===q.correct).fire('change');
      }else{
        const inputs=all(e.response).filter(n=>n.tag==='textarea');
        assert.equal(inputs.length,q.type==='trace'?2:1);
        inputs.forEach(input=>{input.value='<script>not executable</script> independent response';input.fire('input');});
      }
      if(i<20)e.next.fire('click');
    }
    assert.match(e['paper-progress'].textContent,/21 of 21/);
    e.submit.fire('click');
    assert(!e.results.classList.contains('hidden'));
    assert.match(text(e['score-summary']),/18 \/ 18/);
    assert.equal(e['answer-review'].children.length,21);
    const ratings=all(e['answer-review']).filter(n=>n.tag==='select');assert.equal(ratings.length,3);
    ratings.forEach(n=>{n.value='confident';n.fire('change');});
    assert.match(text(e['score-summary']),/3 \/ 3/);
    assert(e['review-weak'].disabled);
    assert.equal(all(e['answer-review']).filter(n=>n.tag==='script').length,0);
    assert(JSON.parse(storage.value).submitted);
    const restored=await load(storage.value);restored.e.resume.fire('click');
    assert.match(text(restored.e['score-summary']),/3 \/ 3/);
  }
});
test('navigation preserves input, partial traces remain incomplete, and retry targets missed groups',async()=>{
  const {e,storage}=await load(JSON.stringify(paperForVariant(1)));e.resume.fire('click');
  const q=bank.questions.find(q=>q.id==='M01-V01');
  all(e.response).find(n=>n.tag==='input'&&+n.value!==q.correct).fire('change');
  e['question-nav'].children[18].fire('click');
  const areas=all(e.response).filter(n=>n.tag==='textarea');areas[0].value='first only';areas[0].fire('input');
  e.previous.fire('click');e.next.fire('click');assert.equal(all(e.response).find(n=>n.tag==='textarea').value,'first only');
  e['save-exit'].fire('click');e.resume.fire('click');
  e.submit.fire('click');assert.match(text(e['score-summary']),/0 \/ 18/);
  assert(all(e['answer-review']).filter(n=>n.tag==='select').every(n=>n.disabled));
  const before=JSON.parse(storage.value).selected.map(q=>q.id);
  e['review-weak'].fire('click');
  assert(JSON.parse(storage.value).selected.every((q,i)=>q.id!==before[i]));
});
test('one-type setup, load failures, and unavailable storage have usable behavior',async()=>{
  let {e}=await load();e.scope.value='focus';e.scope.fire('change');e['focus-group'].value='M20';e.start.fire('click');
  assert.equal(e['question-nav'].children.length,1);assert(e.next.disabled&&e.previous.disabled);
  ({e}=await load(null,{failFetch:true}));assert.match(e['load-status'].textContent,/could not be loaded/);
  ({e}=await load(null,{noStorage:true}));e.start.fire('click');assert.match(e['save-status'].textContent,/storage is unavailable/);assert(!e.paper.classList.contains('hidden'));
});
