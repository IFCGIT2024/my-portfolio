/* Portable PNG/JSON plans. All processing happens in the browser.
   The uncompressed PNG iTXt field is intentionally standards-compliant so
   ordinary image viewers can display the file while Little Room can reopen it. */
(function (root) {
  'use strict';
  const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
  const KEYWORD = 'LittleRoomPlan';
  const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
  const MAX_PLAN_BYTES = 10 * 1024 * 1024;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function u32(bytes, offset) {
    return (bytes[offset] * 0x1000000 + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
  }
  function put32(bytes, offset, value) {
    bytes[offset] = (value >>> 24) & 255; bytes[offset + 1] = (value >>> 16) & 255;
    bytes[offset + 2] = (value >>> 8) & 255; bytes[offset + 3] = value & 255;
  }
  function bytesOf(input) {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    throw new Error('The PNG data could not be read.');
  }
  function concat(parts) {
    const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let offset = 0; for (const part of parts) { out.set(part, offset); offset += part.length; }
    return out;
  }
  function getChunks(input) {
    const bytes = bytesOf(input);
    if (bytes.length > MAX_IMAGE_BYTES || bytes.length < 20 || !PNG_SIGNATURE.every((n, i) => bytes[i] === n)) throw new Error('Please choose a valid Little Room PNG image.');
    const chunks = []; let offset = 8, sawEnd = false;
    while (offset + 12 <= bytes.length) {
      const length = u32(bytes, offset);
      if (length > MAX_IMAGE_BYTES || length > bytes.length - offset - 12) throw new Error('This PNG file is incomplete or damaged.');
      const typeBytes = bytes.subarray(offset + 4, offset + 8);
      const type = String.fromCharCode(...typeBytes);
      if (!/^[A-Za-z]{4}$/.test(type)) throw new Error('This PNG file is incomplete or damaged.');
      const chunk = { type, start: offset, end: offset + 12 + length, data: bytes.subarray(offset + 8, offset + 8 + length), storedCrc: u32(bytes, offset + 8 + length), typeBytes };
      chunks.push(chunk); offset = chunk.end;
      if (type === 'IEND') { if (length !== 0) throw new Error('This PNG file is incomplete or damaged.'); sawEnd = true; break; }
    }
    if (!sawEnd || !chunks.length || chunks[0].type !== 'IHDR') throw new Error('This PNG file is incomplete or damaged.');
    return { bytes, chunks };
  }
  function metadataText(chunk) {
    if (chunk.type !== 'iTXt') return null;
    const d = chunk.data;
    const endKeyword = d.indexOf(0);
    if (endKeyword < 1 || endKeyword > 79) return null;
    const keyword = String.fromCharCode(...d.subarray(0, endKeyword));
    if (keyword !== KEYWORD) return null;
    if (d.length > MAX_PLAN_BYTES + 256) throw new Error('This embedded room plan is too large to open.');
    const crcInput = concat([chunk.typeBytes, d]);
    if (crc32(crcInput) !== chunk.storedCrc) throw new Error('The room information in this image is damaged.');
    const flagPos = endKeyword + 1;
    if (flagPos + 2 >= d.length || d[flagPos] !== 0 || d[flagPos + 1] !== 0) throw new Error('This room image uses an unsupported metadata format.');
    let p = flagPos + 2;
    const languageEnd = d.indexOf(0, p); if (languageEnd < 0) throw new Error('The room information in this image is incomplete.');
    p = languageEnd + 1;
    const translatedEnd = d.indexOf(0, p); if (translatedEnd < 0) throw new Error('The room information in this image is incomplete.');
    p = translatedEnd + 1;
    try { return decoder.decode(d.subarray(p)); } catch (_) { throw new Error('The room information in this image could not be read.'); }
  }
  function payload(state, title) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('No room plan was available to save.');
    return { format: 'little-room', version: 2, title: String(title || 'My room').slice(0, 160), state };
  }
  function validateState(state) {
    const fail = () => { throw new Error('This room plan contains unsupported or excessive data.'); };
    if (!Array.isArray(state.items) || state.items.length > 300 || !Array.isArray(state.openings) || state.openings.length > 500) fail();
    if (state.cells != null && (!Array.isArray(state.cells) || state.cells.length > 50000)) fail();
    if (state.interiorWalls !== undefined) {
      if (!Array.isArray(state.interiorWalls) || state.interiorWalls.length > 300) fail();
      // Walls share the selection/delete namespace with existing objects.
      // Existing legacy item/opening IDs are left alone unless a wall collides.
      const ids = new Set([...state.items, ...state.openings].filter(x => x && typeof x.id === 'string').map(x => x.id));
      for (const wall of state.interiorWalls) {
        if (!wall || typeof wall !== 'object' || Array.isArray(wall) || typeof wall.id !== 'string' || !wall.id || ids.has(wall.id) || wall.type !== 'interior-wall') fail();
        const { x1, y1, x2, y2 } = wall;
        if (![x1, y1, x2, y2].every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 100)) fail();
        if (x1 !== x2 && y1 !== y2) fail();
        if (Math.hypot(x2 - x1, y2 - y1) < .05) fail();
        ids.add(wall.id);
      }
    }
    for (const key of ['polygon', 'roomPolygon']) {
      if (state[key] != null && (!Array.isArray(state[key]) || state[key].length > 1000)) fail();
    }
    let count = 0;
    function walk(value, depth, field) {
      if (++count > 250000 || depth > 14) fail();
      if (value === null || typeof value === 'boolean') return;
      if (typeof value === 'number') { if (!Number.isFinite(value) || Math.abs(value) > 1000000000) fail(); return; }
      if (typeof value === 'string') { if (field === 'imageData') { if (value.length > 2500000 || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) fail(); } else if (value.length > 20000) fail(); return; }
      if (Array.isArray(value)) { if (value.length > 50000) fail(); for (const item of value) walk(item, depth + 1); return; }
      if (typeof value !== 'object') fail();
      const keys = Object.keys(value);
      if (keys.length > 100 || keys.some(key => key === '__proto__' || key === 'constructor' || key === 'prototype')) fail();
      for (const key of keys) walk(value[key], depth + 1, key);
    }
    walk(state, 0);
  }
  function parsePayload(text) {
    let saved;
    try { saved = JSON.parse(text); } catch (_) { throw new Error('The saved room information could not be read.'); }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('This file does not contain a Little Room plan.');
    // The original Little Room exports used version 1; also accept its raw state.
    if (saved.format && saved.format !== 'little-room') throw new Error('This file is not a Little Room plan.');
    if (saved.format && saved.version != null && (!Number.isInteger(saved.version) || saved.version < 1 || saved.version > 2)) throw new Error('This room plan was created by an unsupported version.');
    const state = saved.state || saved;
    if (!state || typeof state !== 'object' || Array.isArray(state) || !Array.isArray(state.items) || !Array.isArray(state.openings) || (!Array.isArray(state.cells) && !Array.isArray(state.polygon) && !Array.isArray(state.roomPolygon))) throw new Error('This file does not contain a complete room plan.');
    validateState(state);
    return { state, title: typeof saved.title === 'string' ? saved.title.slice(0, 160) : '' };
  }
  function makeChunk(type, data) {
    const typeBytes = encoder.encode(type);
    const out = new Uint8Array(12 + data.length);
    put32(out, 0, data.length); out.set(typeBytes, 4); out.set(data, 8);
    put32(out, 8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
  }
  function embedMetadata(input, data) {
    const text = encoder.encode(JSON.stringify(data));
    if (text.length > MAX_PLAN_BYTES) throw new Error('This room plan is too large to embed in an image.');
    // iTXt: keyword, null, compression flag/method, empty language and translated keyword, UTF-8 text.
    const chunk = makeChunk('iTXt', concat([encoder.encode(KEYWORD), new Uint8Array([0, 0, 0, 0, 0]), text]));
    const parsed = getChunks(input), parts = [parsed.bytes.subarray(0, 8)];
    for (const existing of parsed.chunks) {
      // Replace a previous embedded room instead of silently accumulating versions.
      if (existing.type === 'iTXt') {
        const zero = existing.data.indexOf(0);
        if (zero > 0 && String.fromCharCode(...existing.data.subarray(0, zero)) === KEYWORD) continue;
      }
      if (existing.type === 'IEND') parts.push(chunk);
      parts.push(parsed.bytes.subarray(existing.start, existing.end));
    }
    return concat(parts);
  }
  function extractMetadata(input) {
    const parsed = getChunks(input);
    for (let i = parsed.chunks.length - 1; i >= 0; i--) {
      const text = metadataText(parsed.chunks[i]);
      if (text !== null) return parsePayload(text);
    }
    throw new Error('This image has no editable room data. Use the original Little Room PNG or a JSON backup.');
  }
  function canvasPng(canvas) {
    return new Promise((resolve, reject) => {
      if (!canvas || typeof canvas.toBlob !== 'function') { reject(new Error('The room image could not be created in this browser.')); return; }
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The room image could not be created.')), 'image/png');
    });
  }
  async function makePng(canvas, state, title) {
    const image = await canvasPng(canvas);
    const embedded = embedMetadata(await image.arrayBuffer(), payload(state, title));
    return new Blob([embedded], { type: 'image/png' });
  }
  function fileName(title, extension) {
    const name = String(title || 'my-little-room').trim().replace(/[<>:"/\\|?*\x00-\x1f]+/g, '-').replace(/\s+/g, '-').replace(/^[. -]+|[. -]+$/g, '').slice(0, 80) || 'my-little-room';
    return `${name}.${extension}`;
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function downloadPng(canvas, state, title) {
    const blob = await makePng(canvas, state, title);
    download(blob, fileName(title, 'png')); return 'downloaded';
  }
  function downloadJson(state, title) {
    const text = JSON.stringify(payload(state, title), null, 2);
    if (encoder.encode(text).length > MAX_PLAN_BYTES) throw new Error('This room plan is too large to save.');
    download(new Blob([text], { type: 'application/json' }), fileName(title, 'json')); return 'downloaded';
  }
  async function sharePng(canvas, state, title) {
    const blob = await makePng(canvas, state, title), name = fileName(title, 'png');
    let file;
    try { file = new File([blob], name, { type: 'image/png' }); } catch (_) { /* download instead */ }
    if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: title || 'My little room' }); return 'shared'; }
      catch (error) { if (error && error.name === 'AbortError') return 'cancelled'; }
    }
    download(blob, name); return 'downloaded';
  }
  async function readPlan(file) {
    if (!file || typeof file.arrayBuffer !== 'function') throw new Error('Choose a room image or JSON backup.');
    if (file.size > MAX_IMAGE_BYTES) throw new Error('This file is too large to open.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const png = bytes.length >= 8 && PNG_SIGNATURE.every((n, i) => bytes[i] === n);
    if (png) return { ...extractMetadata(bytes), source: 'png' };
    if (bytes.length > MAX_PLAN_BYTES) throw new Error('This room plan is too large to open.');
    try { return { ...parsePayload(decoder.decode(bytes)), source: 'json' }; }
    catch (error) { if (error instanceof TypeError) throw new Error('Choose a Little Room PNG image or JSON backup.'); throw error; }
  }
  root.RoomSharing = { makePng, readPlan, downloadPng, downloadJson, sharePng, embedMetadata, extractMetadata };
})(typeof window !== 'undefined' ? window : globalThis);
