/**
 * Little Room's portable file codec. No editor, DOM, or storage dependency.
 * Images use standard uncompressed PNG iTXt; the picture remains a normal PNG.
 * Legacy plans are returned as legacy, never silently coerced into a new model.
 */
const SIGNATURE = Uint8Array.of(137,80,78,71,13,10,26,10);
const PLAN_KEY = 'LittleRoomPlan';
const PROMPT_KEY = 'LittleRoomRenderPrompt';
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_PLAN_BYTES = 10 * 1024 * 1024;
const MAX_PROMPT_BYTES = 20000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal:true});

const fail = message => { throw new Error(message); };
const asBytes = value => value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : fail('Expected PNG bytes.');
function concat(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
}
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function getU32(bytes, i) { return ((bytes[i] * 0x1000000) + (bytes[i+1] << 16) + (bytes[i+2] << 8) + bytes[i+3]) >>> 0; }
function putU32(bytes, i, n) { bytes[i] = n >>> 24; bytes[i+1] = n >>> 16; bytes[i+2] = n >>> 8; bytes[i+3] = n; }
function pngChunks(input) {
  const bytes = asBytes(input);
  if (bytes.length < 20 || bytes.length > MAX_FILE_BYTES || !SIGNATURE.every((n,i) => bytes[i] === n)) fail('Choose a valid PNG under 30 MB.');
  const chunks = []; let offset = 8, ended = false;
  while (offset + 12 <= bytes.length) {
    const length = getU32(bytes, offset);
    if (length > bytes.length - offset - 12) fail('PNG is incomplete or damaged.');
    const type = String.fromCharCode(...bytes.subarray(offset+4, offset+8));
    if (!/^[A-Za-z]{4}$/.test(type)) fail('PNG has an invalid chunk.');
    const end = offset + 12 + length;
    const data = bytes.subarray(offset+8,offset+8+length);
    chunks.push({type,data,offset,end,bytes});
    offset = end;
    if (type === 'IEND') { if (length !== 0) fail('PNG has an invalid ending.'); ended = true; break; }
  }
  if (!ended || chunks[0]?.type !== 'IHDR' || offset !== bytes.length) fail('PNG is incomplete or damaged.');
  return {bytes,chunks};
}
function textKeyword(chunk) {
  if (chunk.type !== 'iTXt') return null;
  const i = chunk.data.indexOf(0);
  return i > 0 && i <= 79 ? String.fromCharCode(...chunk.data.subarray(0,i)) : null;
}
function readTextChunk(chunk) {
  const d = chunk.data, i = d.indexOf(0);
  if (i < 1 || i > 79 || i+2 >= d.length || d[i+1] !== 0 || d[i+2] !== 0) fail('Unsupported PNG metadata format.');
  if (crc32(chunk.bytes.subarray(chunk.offset+4,chunk.end-4)) !== getU32(chunk.bytes,chunk.end-4)) fail('The embedded information is damaged.');
  const languageEnd = d.indexOf(0,i+3);
  const translatedEnd = languageEnd < 0 ? -1 : d.indexOf(0,languageEnd+1);
  if (translatedEnd < 0) fail('PNG metadata is incomplete.');
  try { return decoder.decode(d.subarray(translatedEnd+1)); }
  catch { return fail('The embedded information is not valid UTF-8.'); }
}
function makeTextChunk(keyword, text) {
  const bytes = concat([encoder.encode(keyword), Uint8Array.of(0,0,0,0,0), encoder.encode(text)]);
  const chunk = new Uint8Array(bytes.length+12);
  putU32(chunk,0,bytes.length); chunk.set(encoder.encode('iTXt'),4); chunk.set(bytes,8);
  putU32(chunk,chunk.length-4,crc32(chunk.subarray(4,chunk.length-4)));
  return chunk;
}
// Fail early on hostile/nonportable values rather than executing or mutating them.
function assertPortable(value) {
  let seen = 0;
  function visit(v, depth) {
    if (++seen > 250000 || depth > 32) fail('Plan is too complex.');
    if (v === null || typeof v === 'boolean') return;
    if (typeof v === 'number') { if (!Number.isFinite(v) || Math.abs(v) > 1e9) fail('Plan has an invalid number.'); return; }
    if (typeof v === 'string') { if (v.length > 3500000) fail('Plan contains oversized data.'); return; }
    if (!v || typeof v !== 'object') fail('Plan contains an unsupported value.');
    if (Array.isArray(v)) { if (v.length > 50000) fail('Plan contains too many entries.'); for (const x of v) visit(x,depth+1); return; }
    const keys=Object.keys(v);
    if (keys.length > 200 || keys.some(k => k === '__proto__' || k === 'constructor' || k === 'prototype')) fail('Plan contains invalid fields.');
    for (const k of keys) visit(v[k],depth+1);
  }
  visit(value,0);
}
function isObject(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
/** Serialize a new document without imposing an editor-specific scene schema. */
export function encodePlan(document, {title='My room', renderPrompt=''} = {}) {
  if (!isObject(document)) fail('No room document was provided.');
  if (typeof title !== 'string' || title.length > 160) fail('Room title is invalid.');
  if (typeof renderPrompt !== 'string' || encoder.encode(renderPrompt).length > MAX_PROMPT_BYTES) fail('The render prompt is too long.');
  const value={format:'little-room',version:3,title,document,renderPrompt};
  assertPortable(value);
  const json=JSON.stringify(value,null,2);
  if (encoder.encode(json).length > MAX_PLAN_BYTES) fail('Plan is too large to save.');
  return json;
}
/** Returns {kind:'current', document,...} or {kind:'legacy', state,...}. */
export function decodePlan(json) {
  if (typeof json !== 'string' || encoder.encode(json).length > MAX_PLAN_BYTES) fail('Plan is too large or could not be read.');
  let value;
  try { value=JSON.parse(json); } catch { return fail('Saved room information is not valid JSON.'); }
  if (!isObject(value)) fail('This file does not contain a room plan.');
  assertPortable(value);
  if (value.format && value.format !== 'little-room') fail('This file is not a Little Room plan.');
  const title = typeof value.title === 'string' ? value.title.slice(0,160) : '';
  if (value.format === 'little-room' && value.version === 3) {
    if (!isObject(value.document) || (value.renderPrompt !== undefined && (typeof value.renderPrompt !== 'string' || encoder.encode(value.renderPrompt).length > MAX_PROMPT_BYTES))) fail('This room document is incomplete.');
    return {kind:'current',version:3,title,document:value.document,renderPrompt:value.renderPrompt || ''};
  }
  if (value.format && value.version != null && (!Number.isInteger(value.version) || value.version < 1 || value.version > 2)) fail('This room plan was created by an unsupported version.');
  const state=value.state || value;
  if (!isObject(state) || !Array.isArray(state.items) || !Array.isArray(state.openings) || (!Array.isArray(state.cells) && !Array.isArray(state.polygon) && !Array.isArray(state.roomPolygon))) fail('This file does not contain a complete legacy room plan.');
  return {kind:'legacy',version:value.format ? (value.version || 1) : 0,title,state};
}
/** Insert the plan and a separately inspectable render prompt into a PNG. */
export function embedPlanInPng(input, document, options={}) {
  const json=encodePlan(document,options), prompt=options.renderPrompt || '';
  const {bytes,chunks}=pngChunks(input), parts=[bytes.subarray(0,8)];
  for (const chunk of chunks) {
    const key=textKeyword(chunk);
    if (key === PLAN_KEY || key === PROMPT_KEY) continue;
    if (chunk.type === 'IEND') {
      parts.push(makeTextChunk(PLAN_KEY,json));
      if (prompt) parts.push(makeTextChunk(PROMPT_KEY,prompt));
    }
    parts.push(bytes.subarray(chunk.offset,chunk.end));
  }
  const out=concat(parts);
  if (out.length > MAX_FILE_BYTES) fail('The editable image is too large to save.');
  return out;
}
/** Decode original v1/v2 PNGs as legacy or a v3 PNG as current. */
export function extractPlanFromPng(input) {
  const {chunks}=pngChunks(input);
  const matching=chunks.filter(chunk => textKeyword(chunk) === PLAN_KEY);
  if (!matching.length) fail('This image has no editable room data. Use the original PNG or a JSON backup.');
  const chunk=matching.at(-1);
  if (chunk.data.length > MAX_PLAN_BYTES+256) fail('Embedded plan is too large.');
  return decodePlan(readTextChunk(chunk));
}
export async function makeEditablePng(canvas, document, options={}) {
  if (!canvas || typeof canvas.toBlob !== 'function') fail('The room image could not be created.');
  const blob=await new Promise((resolve,reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('The room image could not be created.')), 'image/png'));
  return new Blob([embedPlanInPng(await blob.arrayBuffer(),document,options)],{type:'image/png'});
}
export async function readPlanFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size > MAX_FILE_BYTES) fail('Choose a room PNG or JSON backup under 30 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  if (SIGNATURE.every((n,i) => bytes[i] === n)) return {...extractPlanFromPng(bytes),source:'png'};
  if (bytes.length > MAX_PLAN_BYTES) fail('The JSON plan is too large.');
  try { return {...decodePlan(decoder.decode(bytes)),source:'json'}; }
  catch (error) { if (error instanceof TypeError) fail('The plan is not valid UTF-8.'); throw error; }
}
