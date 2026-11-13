'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const context=new Proxy({}, {get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
const canvas={style:{},parentElement:{},getContext:()=>context,getBoundingClientRect:()=>({width:800,height:600,left:0,top:0}),addEventListener(){},removeEventListener(){},setPointerCapture(){}};
const sandbox={window:{devicePixelRatio:1},ResizeObserver:class{observe(){} disconnect(){}},setTimeout,clearTimeout,console};
const source=fs.readFileSync(path.join(__dirname,'..','canvas.js'),'utf8').replace(/^export (const|function|class) /gm,'$1 ');
vm.runInNewContext(source+'\nthis.RoomCanvas=RoomCanvas;this.windowRun=windowRun;this.windowPoint=windowPoint;this.outlineFromWalls=outlineFromWalls;',sandbox);
const snapshot=x=>JSON.parse(JSON.stringify(x));
function event(room,x,y,id=1){return {button:0,pointerId:id,clientX:room.view.ox+x*room.view.scale,clientY:room.view.oy+y*room.view.scale}}
function drag(room,a,b){room.onPointerDown(event(room,a.x,a.y));room.onPointerMove(event(room,b.x,b.y));room.onPointerUp(event(room,b.x,b.y))}
function setup(){const events=[];const room=new sandbox.RoomCanvas(canvas,{onChange:s=>events.push(snapshot(s))});const state=room.getState();state.polygon=[[0,0],[10,0],[10,8],[0,8]];state.items=[];state.openings=[{id:'w',type:'window',x:3,y:0,side:'top',edgeIndex:0,t:.3,width:1}];assert.equal(room.setState(state),true);room.selectItem('w');return {room,events}}
function run(room){return sandbox.windowRun(room.state,room.state.openings[0])}

test('dragging a selected window endpoint grows along the wall and clamps at the corner',()=>{
 const {room,events}=setup(),before=run(room),start=sandbox.windowPoint(before,before.start),end=sandbox.windowPoint(before,before.end),count=events.length;
 drag(room,end,{x:20,y:2});const after=run(room);assert.ok(after.end<=after.length+1e-8);assert.ok(after.end>9.9);assert.ok(Math.abs(after.start-before.start)<1e-8);assert.ok(room.state.openings[0].width>7);assert.equal(events.length,count+1);assert.equal(sandbox.windowPoint(after,after.start).x,start.x);
});
test('numeric window width stays on its wall and remains safely serializable',()=>{
 const {room}=setup();assert.equal(room.setOpeningWidth(30),true);const r=run(room);assert.ok(Math.abs(room.state.openings[0].width-10)<1e-8);assert.equal(r.start,0);assert.equal(r.end,10);assert.equal(room.setOpeningWidth(-1),false);assert.equal(room.setState(snapshot(room.getState())),true);
});
test('curved wall resizing follows the whole wall rather than one sampled segment',()=>{
 const {room}=setup(),state=room.getState();state.roomVertices=[[0,0],[10,0],[10,8],[0,8]];state.wallCurves={0:{center:[5,5],direction:1}};const result=sandbox.outlineFromWalls(state.roomVertices,state.wallCurves);state.polygon=snapshot(result.points);const first=result.edgeMap.indexOf(0),last=result.edgeMap.lastIndexOf(0),index=Math.floor((first+last)/2);state.openings=[{id:'w',type:'window',x:5,y:0,side:'top',edgeIndex:index,t:.5,width:1}];assert.equal(room.setState(state),true);room.selectItem('w');const before=run(room);assert.ok(before.segments.length>1);const end=sandbox.windowPoint(before,before.end),target=sandbox.windowPoint(before,Math.min(before.length,before.end+3));drag(room,end,target);const after=run(room);assert.ok(room.state.openings[0].width>2);assert.ok(after.segments.length>1);assert.ok(after.end<=after.length+1e-8);
});
test('starting a pinch cancels an in-progress resize without recording a change',()=>{
 const {room,events}=setup(),before=run(room),end=sandbox.windowPoint(before,before.end),saved=snapshot(room.state.openings[0]),count=events.length;room.onPointerDown(event(room,end.x,end.y));room.onPointerMove(event(room,7,0));room.onPointerDown(event(room,2,3,2));assert.deepEqual(snapshot(room.state.openings[0]),saved);assert.equal(events.length,count);
});
test('legacy grid windows stretch across adjacent cells and remain selectable along their length',()=>{
 const room=new sandbox.RoomCanvas(canvas);const state=room.getState();delete state.polygon;state.cells=[];for(let x=0;x<10;x++)for(let y=0;y<4;y++)state.cells.push([x,y]);state.items=[];state.openings=[{id:'w',type:'window',x:2,y:0,side:'top',width:1}];assert.equal(room.setState(state),true);room.selectItem('w');const before=run(room),end=sandbox.windowPoint(before,before.end);drag(room,end,{x:8,y:0});assert.ok(room.state.polygon);assert.ok(room.state.openings[0].width>5);room.selectItem(null);room.onPointerDown(event(room,7,0));room.onPointerUp(event(room,7,0));assert.equal(room.selected,'w');
});
