'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'sharing.js'), 'utf8');
const scope = { TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Blob, console };
vm.runInNewContext(source, scope);
const sharing = scope.RoomSharing;
const wall = { id: 'wall-one', type: 'interior-wall', x1: 2, y1: 1, x2: 2, y2: 5 };
const state = { title: 'Home', cells: [[0,0],[1,0],[0,1],[1,1]], items: [], openings: [], interiorWalls: [wall] };
const envelope = plan => ({ format: 'little-room', version: 2, title: 'Home', state: plan });
const plain = value => JSON.parse(JSON.stringify(value));
const asFile = bytes => ({ size: bytes.length, arrayBuffer: async () => Uint8Array.from(bytes).buffer });
const asJsonFile = plan => asFile(new TextEncoder().encode(JSON.stringify(envelope(plan))));
// Minimal PNG fixture; no browser file-picker or real personal data is needed.
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM0QAAAAASUVORK5CYII=', 'base64'));

test('editable PNG round trip retains interior walls exactly', async () => {
  const data = sharing.embedMetadata(png, envelope(state));
  const loaded = await sharing.readPlan(asFile(data));
  assert.equal(loaded.source, 'png');
  assert.deepEqual(plain(loaded.state.interiorWalls), [wall]);
});

test('JSON round trip retains walls and older plans without walls remain readable', async () => {
  const loaded = await sharing.readPlan(asJsonFile(state));
  assert.equal(loaded.source, 'json');
  assert.deepEqual(plain(loaded.state.interiorWalls), [wall]);
  const old = { title: 'Legacy', cells: [[0,0]], items: [], openings: [] };
  assert.deepEqual(plain((await sharing.readPlan(asJsonFile(old))).state), old);
});

test('damaged wall data is rejected before it reaches the editor', async () => {
  const invalid = [
    null, {}, [{ ...wall, id: '' }], [{ ...wall, type: 'window' }],
    [{ ...wall, x1: '2' }], [{ ...wall, x1: 101 }],
    [{ ...wall, x2: 2, y2: 1 }],
    [wall, { ...wall }], Array.from({ length: 301 }, (_, i) => ({ ...wall, id: String(i) }))
  ];
  for (const interiorWalls of invalid) {
    await assert.rejects(() => sharing.readPlan(asJsonFile({ ...state, interiorWalls })), /unsupported or excessive data/);
  }
  for (const key of ['items', 'openings']) {
    await assert.rejects(() => sharing.readPlan(asJsonFile({ ...state, [key]: [{ id: wall.id }] })), /unsupported or excessive data/);
  }
});

test('diagonal interior walls remain editable after JSON and PNG import', async () => {
  const diagonal = { ...wall, x2: 4, y2: 5 };
  const room = { ...state, interiorWalls: [diagonal] };
  assert.deepEqual(plain((await sharing.readPlan(asJsonFile(room))).state.interiorWalls), [diagonal]);
  assert.deepEqual(plain((await sharing.readPlan(asFile(sharing.embedMetadata(png, envelope(room))))).state.interiorWalls), [diagonal]);
});
