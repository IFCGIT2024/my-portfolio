'use strict';

// Run with: node --test tests/trace.test.cjs
// The real canvas module is exercised with a lightweight browser canvas mock.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function makeCanvas() {
  const context = new Proxy({}, {
    get: (target, prop) => prop in target ? target[prop] : () => {},
    set: (target, prop, value) => { target[prop] = value; return true; }
  });
  return {
    style: {}, parentElement: {}, width: 0, height: 0,
    getContext: () => context,
    getBoundingClientRect: () => ({width: 800, height: 600, left: 0, top: 0}),
    addEventListener() {}, removeEventListener() {}, setPointerCapture() {}
  };
}

function loadRoomCanvas() {
  class FakeImage {
    constructor() { this.complete = false; this.naturalWidth = 0; this.listeners = {}; }
    addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
    set src(value) {
      this.source = value;
      setTimeout(() => {
        this.complete = true;
        this.naturalWidth = 400;
        this.onload?.();
        for (const callback of this.listeners.load || []) callback();
      }, 0);
    }
  }
  class FakeResizeObserver { observe() {} disconnect() {} }
  const sandbox = { window: {devicePixelRatio: 1}, Image: FakeImage,
    ResizeObserver: FakeResizeObserver, setTimeout, clearTimeout, console };
  const source = fs.readFileSync(path.join(__dirname, '..', 'canvas.js'), 'utf8')
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export class /gm, 'class ');
  vm.runInNewContext(source + '\nthis.RoomCanvasForTests = RoomCanvas;', sandbox,
    {filename: 'canvas.js'});
  return sandbox.RoomCanvasForTests;
}

const RoomCanvas = loadRoomCanvas();
const sampleImage = 'data:image/png;base64,QUJDRA==';
const snapshot = value => JSON.parse(JSON.stringify(value));

function setup() {
  const events = [], notices = [];
  const room = new RoomCanvas(makeCanvas(), {
    onChange: state => events.push(snapshot(state)),
    onNotice: text => notices.push(text)
  });
  return {room, events, notices};
}

function pointerAt(room, x, y) {
  return {button: 0, pointerId: 1, clientX: room.view.ox + x * room.view.scale,
    clientY: room.view.oy + y * room.view.scale};
}

function tap(room, x, y) {
  const event = pointerAt(room, x, y);
  room.onPointerDown(event);
  room.onPointerUp(event);
}

function drag(room, x1, y1, x2, y2) {
  room.onPointerDown(pointerAt(room, x1, y1));
  room.onPointerMove(pointerAt(room, x2, y2));
  room.onPointerUp(pointerAt(room, x2, y2));
}

test('legacy rooms remain unchanged when tracing cannot start', () => {
  const {room, notices} = setup();
  const legacy = snapshot(room.getState());
  assert.equal(room.startTrace(), false);
  assert.deepEqual(snapshot(room.getState()), legacy);
  assert.match(notices.at(-1), /floor plan image/i);
  assert.equal(room.setState(legacy), true);
  assert.deepEqual(snapshot(room.getState()), legacy);
});

test('reference opacity, visibility, movement, and scaling retain the image aspect', () => {
  const {room} = setup();
  assert.equal(room.setTraceReference(sampleImage, 400, 200), true);
  let ref = snapshot(room.state.traceReference);
  assert.equal(ref.w / ref.h, 2);
  assert.equal(room.setTraceOptions({opacity: 0.4, visible: false, width: 10}), true);
  ref = snapshot(room.state.traceReference);
  assert.equal(ref.opacity, 0.4);
  assert.equal(ref.visible, false);
  assert.equal(ref.w, 10);
  assert.equal(ref.h, 5);
  assert.equal(room.setTraceOptions({opacity: 0.8, width: 300}), false);
  assert.equal(room.state.traceReference.opacity, 0.4, 'rejected edits are atomic');
  assert.equal(room.setTool('trace-move'), true);
  drag(room, ref.x + 2, ref.y + 2, ref.x + 3, ref.y + 3);
  const moved = snapshot(room.state.traceReference);
  assert.ok(Math.abs(moved.x - ref.x - 1) < 1e-6);
  assert.ok(Math.abs(moved.y - ref.y - 1) < 1e-6);
  drag(room, moved.x + moved.w, moved.y + moved.h,
    moved.x + moved.w * 1.5, moved.y + moved.h * 1.5);
  const resized = snapshot(room.state.traceReference);
  assert.ok(Math.abs(resized.w - 15) < 1e-6);
  assert.ok(Math.abs(resized.w / resized.h - 2) < 1e-6);
});

test('cancel leaves the old room, contents, openings and reference untouched', () => {
  const {room} = setup();
  room.setTraceReference(sampleImage, 400, 200);
  const before = snapshot(room.getState());
  room.startTrace();
  tap(room, 0, 0); tap(room, 6, 0); tap(room, 6, 4);
  assert.equal(room.getTraceInfo().count, 3);
  room.cancelTrace();
  assert.equal(room.getTraceInfo().active, false);
  assert.deepEqual(snapshot(room.getState()), before);
});

test('finish creates a room, retains furniture, remaps openings and can restore previous state', () => {
  const {room, events} = setup();
  room.setTraceReference(sampleImage, 400, 200);
  const before = snapshot(room.getState());
  room.startTrace();
  tap(room, 0, 0); tap(room, 10, 0); tap(room, 10, 6); tap(room, 0, 6);
  assert.equal(room.finishTrace(), true);
  const result = snapshot(room.getState());
  assert.deepEqual(result.polygon, [[0,0], [10,0], [10,6], [0,6]]);
  assert.deepEqual(result.items, before.items);
  assert.equal(result.openings.length, before.openings.length);
  for (const opening of result.openings) {
    assert.ok(Number.isInteger(opening.edgeIndex) && opening.edgeIndex >= 0 && opening.edgeIndex < 4);
    assert.ok(opening.t >= 0 && opening.t <= 1);
  }
  assert.equal(result.traceReference.imageData, sampleImage);
  assert.equal(room.getTraceInfo().active, false);
  assert.deepEqual(events.at(-1), result, 'the completed plan is emitted for undo history');
  assert.equal(room.setState(before), true);
  assert.deepEqual(snapshot(room.getState()), before, 'the UI can undo by restoring the prior snapshot');
});

test('invalid crossing outlines fail safely and individual trace points can be undone', () => {
  const {room, notices} = setup();
  room.setTraceReference(sampleImage, 400, 200);
  const before = snapshot(room.getState());
  room.startTrace();
  tap(room, 0, 0); tap(room, 8, 6); tap(room, 0, 6); tap(room, 8, 0);
  assert.equal(room.finishTrace(), false);
  assert.match(notices.at(-1), /non-crossing/i);
  assert.deepEqual(snapshot(room.getState()), before);
  assert.equal(room.undoTracePoint(), true);
  assert.equal(room.getTraceInfo().count, 3);
  room.cancelTrace();
  assert.deepEqual(snapshot(room.getState()), before);
});

test('export waits for visible reference decoding and removing a reference removes its bytes', async () => {
  const {room} = setup();
  room.setTraceReference(sampleImage, 400, 200);
  await room.waitForTraceImage();
  assert.ok(room.traceImage.complete && room.traceImage.naturalWidth > 0);
  assert.equal(room.getState().traceReference.imageData, sampleImage);
  assert.equal(room.setTraceOptions({visible: false}), true);
  assert.equal(room.getState().traceReference.imageData, sampleImage, 'hiding is not removal');
  room.clearTraceReference();
  assert.equal(room.getState().traceReference, undefined);
  await room.waitForTraceImage();
});
