'use strict';

// Exercise the actual RoomCanvas restore path without requiring a browser.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'canvas.js'), 'utf8')
  .replace(/^export const /gm, 'const ')
  .replace(/^export function /gm, 'function ')
  .replace(/^export class /gm, 'class ');
const sandbox = {window:{devicePixelRatio:1}, ResizeObserver:class {observe(){} disconnect(){}},
  setTimeout, clearTimeout, console};
vm.runInNewContext(source + '\nthis.RoomCanvasForTest=RoomCanvas;', sandbox, {filename:'canvas.js'});
const RoomCanvas=sandbox.RoomCanvasForTest;
const copy = value => JSON.parse(JSON.stringify(value));
function makeCanvas() {
  const context=new Proxy({}, {get:(o,k)=>k in o?o[k]:()=>{}, set:(o,k,v)=>(o[k]=v,true)});
  return {style:{},parentElement:{},getContext:()=>context,
    getBoundingClientRect:()=>({width:600,height:500,left:0,top:0}),
    addEventListener(){},removeEventListener(){},setPointerCapture(){}};
}
const polygonOnly = () => ({polygon:[[0,0],[2,0],[2,2],[0,2]],items:[],openings:[]});

test('restoring a polygon-only legacy plan generates renderable grid cells', () => {
  const room=new RoomCanvas(makeCanvas());
  assert.equal(room.setState(polygonOnly()),true);
  const state=copy(room.getState());
  assert.deepEqual(state.polygon,[[0,0],[2,0],[2,2],[0,2]]);
  assert.deepEqual(state.cells,[[0,0],[1,0],[0,1],[1,1]]);
});
test('failed cell validation leaves the current room unchanged', () => {
  for(const cells of [[],[null],[[0,Infinity]],[[0,'1']]]){
    const room=new RoomCanvas(makeCanvas());const before=copy(room.getState());
    assert.equal(room.setState({...polygonOnly(),cells}),false);
    assert.deepEqual(copy(room.getState()),before);
  }
});
