import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDocument,addObject,validateDocument} from '../src/core/document.mjs';
import {EditorView} from '../src/editor/view.js';

globalThis.ResizeObserver=class {observe(){} disconnect(){}};
globalThis.window={devicePixelRatio:1};

function setup() {
 let doc=createDocument({width:8,height:6});
 const log={selections:[],commits:[],notices:[],openings:[]};
 const ctx=new Proxy({}, {get:(target,key)=>target[key]||(()=>{}),set:(target,key,value)=>(target[key]=value,true)});
 const listeners={};
 const canvas={getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),setPointerCapture(){},addEventListener:(name,fn)=>{listeners[name]=fn}};
 const view=new EditorView(canvas,{getDocument:()=>doc,commit:next=>{assert.ok(validateDocument(next));doc=next;log.commits.push(structuredClone(next))},onSelection:ids=>log.selections.push([...ids]),onNotice:msg=>log.notices.push(msg),onOpening:wall=>log.openings.push(wall.id)});
 view.view={scale:50,ox:0,oy:0};
 const event=(x,y,extra={})=>({button:0,pointerId:1,clientX:x*50,clientY:y*50,preventDefault(){},...extra});
 const down=(x,y,extra)=>listeners.pointerdown(event(x,y,extra));
 const move=(x,y,extra)=>listeners.pointermove(event(x,y,extra));
 const up=(x,y,extra)=>listeners.pointerup(event(x,y,extra));
 const drag=(a,b)=>{down(...a);move(...b);up(...b)};
 return {view,log,down,move,up,drag,cancel:()=>listeners.pointercancel(event(0,0)),get doc(){return doc},set doc(d){doc=d}};
}

test('plan and furnish modes keep furniture and structure independently editable',()=>{
 const s=setup();s.doc=addObject(s.doc,{id:'seat',kind:'furniture',type:'chair',x:3,y:3,w:1,h:1});
 s.view.setMode('plan');const before=structuredClone(s.doc.objects.find(o=>o.id==='seat'));
 s.drag([3,3],[4,3]);assert.deepEqual(s.doc.objects.find(o=>o.id==='seat'),before);
 s.view.setMode('furnish');const wall=structuredClone(s.doc.objects[1]);
 s.drag([2,0],[3,0]);assert.deepEqual(s.doc.objects[1],wall);
 s.drag([3,3],[4,3]);assert.equal(s.doc.objects.find(o=>o.id==='seat').x,4);
});

test('dragging a wall from a chosen start creates a snapped wall without changing floor',()=>{
 const s=setup(),floor=structuredClone(s.doc.objects[0]);s.view.setMode('plan');s.view.setTool('wall');
 s.drag([1.03,1.02],[4.02,2.01]);const w=s.doc.objects.at(-1);
 assert.equal(w.kind,'wall');assert.deepEqual([w.x1,w.y1,w.x2,w.y2],[1,1,4,2]);assert.deepEqual(s.doc.objects[0],floor);assert.deepEqual(s.view.selection,[w.id]);assert.equal(s.log.commits.length,1);
});

test('a door can be placed, selected, and slid along its wall without detaching',()=>{
 const s=setup(),wall=s.doc.objects[1];s.view.setMode('plan');s.view.setTool('door');s.down(3,0);s.up(3,0);
 const door=s.doc.objects.at(-1);assert.equal(door.kind,'door');assert.equal(door.hostWallId,wall.id);assert.equal(door.t,.375);assert.deepEqual(s.view.selection,[door.id]);
 s.view.setTool('select');s.drag([3,0],[6,0]);const moved=s.doc.objects.find(o=>o.id===door.id);assert.equal(moved.hostWallId,wall.id);assert.equal(moved.t,.75);assert.ok(validateDocument(s.doc));
});

test('placing an opening at a wall endpoint stays within its host or gives a clear refusal',()=>{
 const s=setup();s.view.setMode('plan');s.view.setTool('window');
 assert.doesNotThrow(()=>{s.down(0,0);s.up(0,0)});
 const opening=s.doc.objects.find(o=>o.kind==='window');
 assert.ok(opening||s.log.notices.length,'placement must succeed or explain why it cannot');
 assert.ok(validateDocument(s.doc));
});

test('drawing a furniture footprint in furnish mode creates the requested piece and dimensions',()=>{
 const s=setup();s.view.setMode('furnish');s.view.pieceType='bed';s.view.setTool('draw');s.drag([1,2],[3,4.5]);
 const bed=s.doc.objects.at(-1);assert.equal(bed.kind,'furniture');assert.equal(bed.type,'bed');assert.deepEqual([bed.x,bed.y,bed.w,bed.h],[2,3.25,2,2.5]);assert.deepEqual(s.view.selection,[bed.id]);
});

test('selection supports shift-clicking multiple furniture pieces',()=>{
 const s=setup();s.doc=addObject(s.doc,{id:'first',kind:'furniture',type:'chair',x:2,y:2,w:1,h:1});s.doc=addObject(s.doc,{id:'second',kind:'furniture',type:'chair',x:5,y:4,w:1,h:1});s.view.setMode('furnish');
 s.down(2,2);s.up(2,2);s.down(5,4,{shiftKey:true});s.up(5,4,{shiftKey:true});assert.deepEqual(s.view.selection,['first','second']);
});

test('canceling a drag preserves the document and does not affect the next click',()=>{
 const s=setup();s.view.setMode('plan');s.view.setTool('wall');const before=structuredClone(s.doc);
 s.down(1,1);s.move(3,2);s.cancel();assert.deepEqual(s.doc,before);assert.equal(s.log.commits.length,0);
 s.view.setTool('select');s.down(4,0);s.up(4,0);assert.equal(s.log.openings.at(-1),s.doc.objects[1].id);
});

test('a second pointer cancels a wall drawing without creating geometry',()=>{
 const s=setup();s.view.setMode('plan');s.view.setTool('wall');const before=structuredClone(s.doc);
 s.down(1,1);s.move(3,2);s.down(2,2,{pointerId:2});s.up(3,2,{pointerId:1});s.up(2,2,{pointerId:2});
 assert.deepEqual(s.doc,before);assert.equal(s.log.commits.length,0);
});

test('a wall shorter than the requested opening is rejected without modifying the plan',()=>{
 const s=setup();s.doc=addObject(s.doc,{id:'short',kind:'wall',x1:2,y1:2,x2:2.5,y2:2});const before=structuredClone(s.doc);s.view.setMode('plan');s.view.setTool('door');
 assert.doesNotThrow(()=>s.down(2.25,2));assert.deepEqual(s.doc,before);assert.match(s.log.notices.at(-1),/short|fit/i);
});
