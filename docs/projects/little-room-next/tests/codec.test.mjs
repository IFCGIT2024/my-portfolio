import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {encodePlan,decodePlan,embedPlanInPng,extractPlanFromPng,readPlanFile} from '../src/persistence/codec.js';

// A minimal 1x1 PNG. The codec preserves image chunks byte-for-byte.
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aWQAAAAASUVORK5CYII=','base64'));
const document={objects:[{id:'sofa',type:'furniture',width:2,rotation:45}],settings:{grid:true}};
const options={title:'A little room',renderPrompt:'Render a warm, cozy interior based on this floor plan.'};

test('native JSON round trips document and render prompt',()=>{
  const decoded=decodePlan(encodePlan(document,options));
  assert.deepEqual(decoded,{kind:'current',version:3,title:options.title,document,renderPrompt:options.renderPrompt});
});
test('editable PNG round trips document and contains independently readable prompt',async()=>{
  const edited=embedPlanInPng(png,document,options);
  assert.deepEqual(extractPlanFromPng(edited),decodePlan(encodePlan(document,options)));
  assert.ok(Buffer.from(edited).includes(Buffer.from('LittleRoomRenderPrompt\0')));
  assert.ok(Buffer.from(edited).includes(Buffer.from(options.renderPrompt)));
  const loaded=await readPlanFile(new Blob([edited],{type:'image/png'}));
  assert.equal(loaded.source,'png'); assert.deepEqual(loaded.document,document);
  const replaced=embedPlanInPng(edited,{objects:[]},options);
  assert.equal(Buffer.from(replaced).toString('binary').split('LittleRoomPlan').length-1,1);
});
test('imports original v2 PNG and raw v1 state without pretending to migrate them',()=>{
  const state={polygon:[[0,0],[4,0],[4,3],[0,3]],cells:[[0,0]],items:[{id:'old',type:'custom',shapeOutline:[[0,0],[.5,0],[0,.5]]}],openings:[],interiorWalls:[{id:'wall',type:'interior-wall',x1:0,y1:1,x2:1,y2:1,curve:{center:[.5,.5],direction:1}}]};
  const legacy=JSON.parse(JSON.stringify({format:'little-room',version:2,title:'Old',state}));
  // Fixture exported by the previous Little Room PNG encoder.
  const oldPng=readFileSync(new URL('./fixtures/legacy-v2.png',import.meta.url));
  assert.deepEqual(extractPlanFromPng(oldPng),{kind:'legacy',version:2,title:'Old',state:legacy.state});
  assert.deepEqual(decodePlan(JSON.stringify(state)).state,state);
});
test('rejects missing or corrupt embedded plan without modifying the original image',()=>{
  assert.throws(()=>extractPlanFromPng(png),/no editable room data/);
  const edited=embedPlanInPng(png,document,options), damaged=edited.slice();
  const pos=Buffer.from(damaged).indexOf('LittleRoomPlan'); damaged[pos+25] ^= 1;
  assert.throws(()=>extractPlanFromPng(damaged),/damaged/);
  assert.equal(png.length,68);
});
test('rejects invalid or dangerous JSON and future schema versions',()=>{
  for(const text of ['nope','{}','{"format":"little-room","version":4,"document":{}}','{"format":"little-room","version":3,"document":{"__proto__":{}}}']) assert.throws(()=>decodePlan(text));
  assert.throws(()=>encodePlan({bad:Infinity}),/invalid number/);
});
