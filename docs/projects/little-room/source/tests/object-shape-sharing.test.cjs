'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','sharing.js'),'utf8');
const scope={TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,Blob,console};
vm.runInNewContext(source,scope);
const sharing=scope.RoomSharing;
const outline=[[-.5,-.5],[.5,-.5],[.5,0],[0,0],[0,.5],[-.5,.5]];
const item={id:'sofa1',type:'sofa',x:2,y:2,w:4,h:3,rotation:37,shapeOutline:outline,clipPolygon:[[-2,-2],[2,-2],[2,2],[-2,2]]};
const state={title:'Test room',cells:[[0,0],[1,0],[0,1],[1,1]],items:[item],openings:[]};
const envelope=state=>({format:'little-room',version:2,title:'Test room',state});
const file=bytes=>({size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
const jsonFile=state=>file(new TextEncoder().encode(JSON.stringify(envelope(state))));
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM0QAAAAASUVORK5CYII=','base64'));
const plain=value=>JSON.parse(JSON.stringify(value));

test('editable PNG and JSON preserve a reshaped, rotated object',async()=>{
  const encoded=sharing.embedMetadata(png,envelope(state));
  assert.deepEqual(plain((await sharing.readPlan(file(encoded))).state.items[0]),item);
  assert.deepEqual(plain((await sharing.readPlan(jsonFile(state))).state.items[0]),item);
});
test('legacy large fit-to-room clips and objects without a shape outline remain readable',async()=>{
  const legacy={...item};delete legacy.shapeOutline;
  const room={...state,items:[legacy]};
  assert.deepEqual(plain((await sharing.readPlan(jsonFile(room))).state.items[0]),legacy);
});
test('invalid or excessive object outlines are rejected before import',async()=>{
  const cases=[null,{},[],[[0,0],[.1,0]],Array.from({length:65},(_,i)=>[i/1000,0]),
    [[-.5,-.5],[.6,-.5],[0,.5]],[[0,0],[.5,0],[.5,'bad']],
    [[-.5,-.5],[.5,.5],[-.5,.5],[.5,-.5]],
    [[0,0],[.5,0],[.5,0],[0,.5]],[[0,0],[.1,0],[.2,0]]];
  for(const shapeOutline of cases){
    await assert.rejects(()=>sharing.readPlan(jsonFile({...state,items:[{...item,shapeOutline}]})),/unsupported or excessive data/);
  }
});
test('saved-outline validation matches the editing validator near its geometry thresholds',async()=>{
  const furnitureSource=fs.readFileSync(path.join(__dirname,'..','furniture.js'),'utf8');
  const editor={};vm.runInNewContext(furnitureSource,editor);
  const candidates=[
    outline,
    [[0,0],[.000001,0],[.5,.000001],[0,.5]],
    [[0,0],[.5,0],[.5,.000001],[0,.000001]],
    [[-.5,-.5],[.5,.5],[-.5,.5],[.5,-.5]],
    [[0,0],[.5,0],[.5,.5],[.25,.0000001],[0,.5]],
    [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]
  ];
  for(const shapeOutline of candidates){
    const editorAccepts=editor.Furniture.validShapeOutline(shapeOutline);
    let importAccepts=true;
    try{await sharing.readPlan(jsonFile({...state,items:[{...item,shapeOutline}]}))}catch(_){importAccepts=false}
    assert.equal(importAccepts,editorAccepts,JSON.stringify(shapeOutline));
  }
});
