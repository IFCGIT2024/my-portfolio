'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.join(__dirname,'..');const env={};vm.runInNewContext(fs.readFileSync(path.join(root,'generator.js'),'utf8'),env);const generator=env.RoomGenerator;
const canvas=fs.readFileSync(path.join(root,'canvas.js'),'utf8');const CATALOG=vm.runInNewContext(canvas.slice(0,canvas.indexOf('\n};')+3).replace('export const CATALOG','const CATALOG')+'\nCATALOG;',{});
const ui=fs.readFileSync(path.join(root,'ui.js'),'utf8');const a=ui.indexOf('function safeState(state)'),b=ui.indexOf('function persist(state)',a);const safeState=vm.runInNewContext(ui.slice(a,b)+'\nsafeState;',{CATALOG});
const copy=o=>JSON.parse(JSON.stringify(o));
test('each room template produces a valid furnished room and matching metadata',()=>{
 const kinds=['bedroom','bathroom','living','kitchen','office','dining'];
 for(const kind of kinds){const result=generator.generateTemplate(kind);assert.equal(safeState(result.state),true,kind);assert.equal(result.state.generation.zones[0].type,kind);assert.ok(result.state.items.length>0);assert.ok(result.state.openings.some(o=>o.type==='door'));}
 const bath=generator.generateTemplate('bathroom').state;assert.deepEqual(copy(bath.items.map(x=>x.name)),['Shower','Toilet','Basin']);
 assert.deepEqual(copy(generator.generateTemplate('office').state.items.map(x=>x.type)),['desk','armchair','bookshelf','plant']);
 assert.equal(generator.generateTemplate('dining').state.items[0].type,'diningTable');
});
test('all template objects and openings fit within their rooms and have unique ids',()=>{
 for(const kind of Object.keys(generator.TEMPLATES)){const {state}=generator.generateTemplate(kind);const w=Math.max(...state.cells.map(c=>c[0]))+1,h=Math.max(...state.cells.map(c=>c[1]))+1,ids=new Set();
 for(const item of state.items){const def=CATALOG[item.type]||{},iw=item.w??def.w,ih=item.h??def.h;assert.ok(item.x-iw/2>=0&&item.x+iw/2<=w&&item.y-ih/2>=0&&item.y+ih/2<=h,`${kind}: ${item.name||item.type}`);assert.ok(!ids.has(item.id));ids.add(item.id)}
 for(const o of state.openings){assert.ok(o.x>=0&&o.x<w&&o.y>=0&&o.y<h);assert.ok(!ids.has(o.id));ids.add(o.id)} }
});
test('templates round trip through saved JSON and reject unknown choices',()=>{
 for(const kind of Object.keys(generator.TEMPLATES)){const state=generator.generateTemplate(kind).state,restored=JSON.parse(JSON.stringify(state));assert.equal(safeState(restored),true);assert.deepEqual(restored.generation,copy(state.generation))}
 assert.throws(()=>generator.generateTemplate('castle'));assert.throws(()=>generator.generateTemplate('__proto__'));assert.equal(generator.generateApartment,undefined);
});
