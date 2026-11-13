'use strict';

// Execute the real validator from ui.js with the real furniture catalogue.
// Run with: node --test tests/validation.test.cjs tests/trace.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const canvasSource = fs.readFileSync(path.join(root, 'canvas.js'), 'utf8');
const catalogueEnd = canvasSource.indexOf('\n};');
assert.notEqual(catalogueEnd, -1, 'catalogue declaration exists');
const catalogueSource = canvasSource.slice(0, catalogueEnd + 3)
  .replace('export const CATALOG', 'const CATALOG');
const CATALOG = vm.runInNewContext(catalogueSource + '\nCATALOG;', {}, {filename:'canvas.js'});

const uiSource = fs.readFileSync(path.join(root, 'ui.js'), 'utf8');
const start = uiSource.indexOf('function safeState(state)');
const end = uiSource.indexOf('function persist(state)', start);
assert.ok(start >= 0 && end > start, 'actual UI validator can be loaded');
const safeState = vm.runInNewContext(uiSource.slice(start, end) + '\nsafeState;',
  {CATALOG}, {filename:'ui.js'});

const opening = () => ({id:'front-door', type:'door', x:0, y:1, side:'left'});
const legacyPlan = () => ({cells:[[0,0],[1,0],[0,1],[1,1]], items:[], openings:[opening()]});
const polygonPlan = () => ({...legacyPlan(), polygon:[[0,0],[2,0],[2,2],[0,2]],
  openings:[{...opening(),edgeIndex:3,t:0.5,width:1}]});

// Fixtures represent the shape of files produced by the original editor and the
// current polygon editor; each rejection checks the actual production function.
test('accepts a legacy cell-based room with a door and window', () => {
  const state=legacyPlan();
  state.openings.push({id:'window',type:'window',x:1,y:0,side:'top'});
  assert.equal(safeState(state),true);
});
test('accepts small legacy cell-only rooms', () => {
  for (const cells of [[[0,0]], [[0,0],[1,0]]]) {
    assert.equal(safeState({cells,items:[],openings:[]}),true);
  }
});
test('accepts a polygon room and opening endpoint positions', () => {
  for (const t of [0,0.5,1]) {
    const state=polygonPlan(); state.openings[0].t=t;
    assert.equal(safeState(state),true,`fraction ${t}`);
  }
});
test('accepts valid opening width and width omitted in old files', () => {
  for (const width of [undefined,0.2,1,100]) {
    const state=legacyPlan();
    if(width !== undefined) state.openings[0].width=width;
    assert.equal(safeState(state),true,`width ${width}`);
  }
});
test('rejects opening widths that cannot be rendered safely', () => {
  for (const width of [-1,0,101,Infinity,NaN,'1',null]) {
    const state=legacyPlan(); state.openings[0].width=width;
    assert.equal(safeState(state),false,`width ${String(width)}`);
  }
});
test('rejects invalid edge indexes including an index without a polygon', () => {
  for (const index of [-1,4,1.5,NaN,Infinity,'1',null]) {
    const state=polygonPlan(); state.openings[0].edgeIndex=index;
    assert.equal(safeState(state),false,`edge ${String(index)}`);
  }
  const legacy=legacyPlan();legacy.openings[0].edgeIndex=0;
  assert.equal(safeState(legacy),false,'edge index requires a polygon');
});
test('rejects invalid positions along a polygon edge', () => {
  for (const t of [-0.001,1.001,Infinity,NaN,'0.5',null]) {
    const state=polygonPlan(); state.openings[0].t=t;
    assert.equal(safeState(state),false,`t ${String(t)}`);
  }
});
test('rejects missing and invalid legacy opening geometry', () => {
  for (const [field,value] of [['x',undefined],['x',NaN],['y',Infinity],['side','diagonal']]) {
    const state=legacyPlan();state.openings[0][field]=value;
    assert.equal(safeState(state),false,`${field} ${String(value)}`);
  }
});
test('rejects unknown opening types and malformed opening entries', () => {
  for (const bad of [null,{}, {id:'x',type:'arch',x:0,y:0,side:'top'}]) {
    const state=legacyPlan(); state.openings=[bad];
    assert.equal(safeState(state),false);
  }
});
test('rejects malformed cells even when a polygon is present', () => {
  for (const cells of [[], [null], [[0,Infinity]], [[0,'1']]]) {
    const state=polygonPlan();state.cells=cells;
    assert.equal(safeState(state),false,`cells ${String(cells)}`);
  }
});
test('accepts a legacy polygon-only plan for migration', () => {
  const state=polygonPlan();delete state.cells;
  assert.equal(safeState(state),true);
});
