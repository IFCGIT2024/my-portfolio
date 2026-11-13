'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const scope = { TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Blob, console };
vm.runInNewContext(fs.readFileSync(path.join(root, 'sharing.js'), 'utf8'), scope);
vm.runInNewContext(fs.readFileSync(path.join(root, 'local-plans.js'), 'utf8'), scope);
const sharing = scope.RoomSharing;
const base = { title: 'My home', cells: [[0,0],[1,0],[0,1],[1,1]], items: [], openings: [] };
const curved = { id:'wall-one', type:'interior-wall', x1:0, y1:0, x2:2, y2:0, curve:{center:[1,3], direction:1, group:'arc-one'} };
const envelope = state => ({format:'little-room', version:2, title:'My home', state});
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM0QAAAAASUVORK5CYII=', 'base64'));
const plain = x => JSON.parse(JSON.stringify(x));
const asFile = bytes => ({size:bytes.length, arrayBuffer:async()=>Uint8Array.from(bytes).buffer});
const jsonFile = state => asFile(new TextEncoder().encode(JSON.stringify(envelope(state))));
const pngFile = state => asFile(sharing.embedMetadata(png,envelope(state)));

test('curved interior walls round trip through editable PNG, JSON, and local saves', async () => {
  const state = {...base, interiorWalls:[curved]};
  for (const file of [jsonFile(state), pngFile(state)]) {
    assert.deepEqual(plain((await sharing.readPlan(file)).state), state);
  }
  let raw = null;
  const storage = {getItem:()=>raw, setItem:(_key,value)=>{raw=value}};
  const plans = scope.LocalPlans.create(storage);
  const saved = plans.save({kind:'home', name:'Curved home', state});
  assert.deepEqual(plain(plans.get(saved.id).state), state);
});

test('node-deleted wall topology and legacy straight walls survive both formats', async () => {
  const state = {...base, interiorWalls:[curved, {id:'straight',type:'interior-wall',x1:2,y1:0,x2:2,y2:2}]};
  for (const file of [jsonFile(state), pngFile(state)]) assert.deepEqual(plain((await sharing.readPlan(file)).state.interiorWalls), state.interiorWalls);
  assert.deepEqual(plain((await sharing.readPlan(jsonFile(base))).state),base);
});

test('malformed interior curves are rejected before opening', async () => {
  const invalid = [null, [], {}, {center:null,direction:1}, {center:[1],direction:1},
    {center:[1,2,3],direction:1}, {center:['1',2],direction:1},
    {center:[1000001,2],direction:1}, {center:[1,3],direction:0},
    {center:[1,3],direction:'1'}, {center:[0,0],direction:1}, {center:[.009,0],direction:1},
    {center:[2,0],direction:-1}, {center:[1,3],direction:1,group:''},
    {center:[1,3],direction:1,group:4}, {center:[1,3],direction:1,group:'x'.repeat(101)}];
  for (const curve of invalid) {
    const state = {...base,interiorWalls:[{...curved,curve}]};
    await assert.rejects(()=>sharing.readPlan(jsonFile(state)),/unsupported or excessive data/);
    await assert.rejects(()=>sharing.readPlan(pngFile(state)),/unsupported or excessive data/);
  }
});

test('small valid radius and optional group align with editor limits', async () => {
  for (const curve of [{center:[0,.01],direction:1}, {center:[1,3],direction:-1,group:'g'}]) {
    const state = {...base,interiorWalls:[{...curved,curve}]};
    assert.deepEqual(plain((await sharing.readPlan(jsonFile(state))).state),state);
  }
});

test('file validation agrees with the editor for curve bounds and attributes', async () => {
  const canvasSource = fs.readFileSync(path.join(root,'canvas.js'),'utf8').replace(/^export (const|function|class) /gm,'$1 ');
  const runtime = {};
  vm.runInNewContext(canvasSource+'\nthis.checkWalls=validInteriorWalls;',runtime);
  const variants = [undefined,null,{center:[0,.01],direction:1},{center:[0,.009],direction:1},
    {center:[1,3],direction:-1,group:'g'},{center:[1,3],direction:1,group:''},
    {center:[1000001,0],direction:1},{center:[1,3],direction:0}];
  for (const curve of variants) {
    const wall = {...curved};
    if (curve === undefined) delete wall.curve; else wall.curve=curve;
    const editorAccepts = runtime.checkWalls([wall]);
    let fileAccepts = true;
    try { await sharing.readPlan(jsonFile({...base,interiorWalls:[wall]})); } catch (_) { fileAccepts = false; }
    assert.equal(fileAccepts,editorAccepts,JSON.stringify(curve));
  }
});
