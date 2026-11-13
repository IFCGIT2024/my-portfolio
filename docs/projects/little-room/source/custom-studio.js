/* Little Room: draw or import a custom piece entirely on this device. */
(function (root) {
  'use strict';
  const MAX_SIDE = 1024, MIN_SIDE = 16, MAX_INPUT = 12 * 1024 * 1024, MAX_PIXELS = 40 * 1000 * 1000, MAX_ENCODED = 850000;
  let dialog, canvas, context, callback = null, initialItem = null, tool = 'pencil', drawing = null, undoStack = [], created = false, loading = false, openSeq = 0;
  const find = selector => dialog.querySelector(selector);
  function message(text, isError = false) { const status = find('[data-studio-status]'); status.textContent = text; status.classList.toggle('studio-error', isError); }
  function makeUI() {
    dialog = document.createElement('dialog');
    dialog.className = 'custom-studio';
    dialog.setAttribute('aria-labelledby', 'studio-title');
    dialog.innerHTML = `
      <div class="studio-head"><div><span class="studio-kicker">YOUR OWN LITTLE CREATION</span><h2 id="studio-title">Make a custom piece</h2><p>Draw something or bring in a picture. Everything stays on this device.</p></div><button type="button" class="studio-close" aria-label="Close custom piece editor">×</button></div>
      <div class="studio-body"><div class="studio-workspace">
        <div class="studio-image-area"><canvas class="studio-canvas" aria-label="Drawing canvas. Draw with your finger or mouse."></canvas></div>
        <p class="studio-canvas-help">Draw right on the canvas. Use a transparent PNG for a cutout.</p>
      </div><div class="studio-settings">
        <label class="studio-name-label">Piece name<input data-studio-name type="text" maxlength="60" placeholder="e.g. My favorite chair" value="My custom piece"></label>
        <div class="studio-section-title">START WITH AN IMAGE</div>
        <button type="button" class="studio-upload" data-studio-upload><span>↥</span> Choose PNG, JPG or WebP</button><input data-studio-file type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" hidden>
        <div class="studio-dimension-title"><span class="studio-section-title">CANVAS SIZE</span><span>pixels</span></div>
        <div class="studio-size-row"><label>Width<input data-studio-width type="number" min="16" max="1024" step="1" inputmode="numeric" value="256"></label><span>×</span><label>Height<input data-studio-height type="number" min="16" max="1024" step="1" inputmode="numeric" value="256"></label><button type="button" data-studio-resize>Apply</button></div>
        <div class="studio-section-title">DRAWING TOOLS</div>
        <div class="studio-tools" role="group" aria-label="Drawing tool"><button type="button" data-tool="pencil" class="is-active" aria-pressed="true">✎ <span>Pen</span></button><button type="button" data-tool="marker" aria-pressed="false">● <span>Marker</span></button><button type="button" data-tool="eraser" aria-pressed="false">◩ <span>Eraser</span></button></div>
        <div class="studio-brush-row"><label>Color<input data-studio-color type="color" value="#6c9271" aria-label="Brush color"></label><label>Brush size <output data-studio-size-output>10 px</output><input data-studio-size type="range" min="1" max="80" value="10" aria-label="Brush size"></label></div>
        <div class="studio-edit-row"><button type="button" data-studio-undo disabled>↶ Undo</button><button type="button" data-studio-clear>Clear canvas</button></div>
      </div></div>
      <div class="studio-footer"><p role="status" aria-live="polite" data-studio-status>Ready to create.</p><button type="button" class="studio-add" data-studio-add>＋ Add to my room</button></div>`;
    document.body.appendChild(dialog);
    canvas = find('.studio-canvas'); context = canvas.getContext('2d', { willReadFrequently: true }); canvas.width = 256; canvas.height = 256;
    find('.studio-close').addEventListener('click', () => dialog.close());
    find('[data-studio-upload]').addEventListener('click', () => find('[data-studio-file]').click());
    find('[data-studio-file]').addEventListener('change', loadFile);
    find('[data-studio-resize]').addEventListener('click', resizeCanvas);
    find('[data-studio-size]').addEventListener('input', event => { find('[data-studio-size-output]').textContent = `${event.target.value} px`; });
    find('.studio-tools').addEventListener('click', event => {
      const button = event.target.closest('[data-tool]'); if (!button) return;
      tool = button.dataset.tool;
      find('.studio-tools').querySelectorAll('[data-tool]').forEach(b => { const active = b === button; b.classList.toggle('is-active', active); b.setAttribute('aria-pressed', String(active)); });
    });
    find('[data-studio-undo]').addEventListener('click', undo);
    find('[data-studio-clear]').addEventListener('click', () => { pushUndo(); context.clearRect(0, 0, canvas.width, canvas.height); created = true; message('Canvas cleared. You can undo this.'); });
    find('[data-studio-add]').addEventListener('click', addToRoom);
    canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerUp);
    dialog.addEventListener('close', () => { drawing = null; openSeq++; });
    window.addEventListener('resize', updateCanvasDisplay);
  }
  function updateCanvasDisplay() {
    if (!dialog || !dialog.open) return;
    const area = find('.studio-image-area'); const availableWidth = Math.max(50, area.clientWidth - 28);
    const availableHeight = Math.max(110, Math.min(420, window.innerWidth <= 700 ? window.innerHeight * .36 : 420));
    const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
    canvas.style.width = `${Math.floor(canvas.width * scale)}px`; canvas.style.height = `${Math.floor(canvas.height * scale)}px`;
  }
  function clampSize(raw) { const n = Number(raw); return Number.isInteger(n) && n >= MIN_SIDE && n <= MAX_SIDE ? n : null; }
  function pushUndo() {
    try { undoStack.push({width:canvas.width, height:canvas.height, pixels:context.getImageData(0,0,canvas.width,canvas.height)}); if (undoStack.length > 8) undoStack.shift(); find('[data-studio-undo]').disabled = false; }
    catch (_) { message('Undo is unavailable for this canvas.', true); }
  }
  function undo() {
    const state = undoStack.pop(); if (!state) return;
    canvas.width = state.width; canvas.height = state.height; context = canvas.getContext('2d', {willReadFrequently:true}); context.putImageData(state.pixels,0,0);
    find('[data-studio-width]').value = state.width; find('[data-studio-height]').value = state.height; updateCanvasDisplay();
    find('[data-studio-undo]').disabled = !undoStack.length; created = true; message('Last change undone.');
  }
  function resizeCanvas() {
    const width = clampSize(find('[data-studio-width]').value), height = clampSize(find('[data-studio-height]').value);
    if (!width || !height) { message(`Choose whole-number dimensions from ${MIN_SIDE} to ${MAX_SIDE} pixels.`, true); return; }
    if (canvas.width === width && canvas.height === height) { message('That canvas size is already in use.'); return; }
    pushUndo(); const old = document.createElement('canvas'); old.width = canvas.width; old.height = canvas.height; old.getContext('2d').drawImage(canvas,0,0);
    canvas.width = width; canvas.height = height; context = canvas.getContext('2d', {willReadFrequently:true}); context.imageSmoothingEnabled = true; context.drawImage(old,0,0,width,height);
    created = true; updateCanvasDisplay(); message(`Canvas resized to ${width} × ${height} pixels.`);
  }
  function getPoint(event) {
    const rect = canvas.getBoundingClientRect(); return {x:(event.clientX-rect.left)*canvas.width/rect.width, y:(event.clientY-rect.top)*canvas.height/rect.height};
  }
  function beginBrush() {
    context.save(); context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'; context.globalAlpha = tool === 'marker' ? .35 : 1;
    context.strokeStyle = find('[data-studio-color]').value; context.fillStyle = context.strokeStyle;
    context.lineWidth = Number(find('[data-studio-size]').value); context.lineCap = 'round'; context.lineJoin = 'round';
  }
  function pointerDown(event) {
    if (event.button !== 0 || drawing) return;
    event.preventDefault(); pushUndo(); const point = getPoint(event); drawing = {id:event.pointerId, point}; canvas.setPointerCapture(event.pointerId); beginBrush();
    context.beginPath(); context.arc(point.x,point.y,context.lineWidth/2,0,Math.PI*2); context.fill(); context.restore(); created = true;
  }
  function pointerMove(event) {
    if (!drawing || drawing.id !== event.pointerId) return;
    event.preventDefault(); const point = getPoint(event); beginBrush(); context.beginPath(); context.moveTo(drawing.point.x,drawing.point.y); context.lineTo(point.x,point.y); context.stroke(); context.restore(); drawing.point = point;
  }
  function pointerUp(event) { if (drawing && drawing.id === event.pointerId) { drawing = null; message('Looking good. Keep drawing or add it to your room.'); } }
  async function loadFile(event) {
    const file = event.target.files && event.target.files[0]; event.target.value = ''; if (!file) return; const activeSeq=openSeq;
    try {
      if (file.size > MAX_INPUT) throw new Error('Choose an image smaller than 12 MB.');
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const png = head[0]===137 && head[1]===80 && head[2]===78 && head[3]===71 && head[4]===13 && head[5]===10 && head[6]===26 && head[7]===10;
      const jpeg = head[0]===255 && head[1]===216 && head[2]===255;
      const webp = String.fromCharCode(...head.slice(0,4))==='RIFF' && String.fromCharCode(...head.slice(8,12))==='WEBP';
      if (!png && !jpeg && !webp) throw new Error('Choose a PNG, JPG, or WebP image.');
      const url = URL.createObjectURL(file); let image;
      try { image = await new Promise((resolve,reject) => { const candidate = new Image(); candidate.onload = () => resolve(candidate); candidate.onerror = () => reject(new Error('That image could not be opened.')); candidate.src = url; }); }
      finally { URL.revokeObjectURL(url); }
      if (!dialog.open || activeSeq!==openSeq) return;
      const iw = image.naturalWidth, ih = image.naturalHeight;
      if (!iw || !ih || iw * ih > MAX_PIXELS) throw new Error('That image is too large. Try a smaller image.');
      const factor = Math.min(1, MAX_SIDE / iw, MAX_SIDE / ih), width = Math.max(MIN_SIDE,Math.round(iw*factor)), height = Math.max(MIN_SIDE,Math.round(ih*factor));
      pushUndo(); canvas.width = width; canvas.height = height; context = canvas.getContext('2d', {willReadFrequently:true}); context.drawImage(image,0,0,width,height);
      find('[data-studio-width]').value = width; find('[data-studio-height]').value = height; created = true; updateCanvasDisplay();
      message(factor < 1 ? `Image loaded at ${width} × ${height} pixels to fit the editor.` : `Image loaded at ${width} × ${height} pixels. You can paint over it.`);
    } catch (error) { if(dialog.open && activeSeq===openSeq) message(error && error.message || 'That image could not be opened.', true); }
  }
  function hasVisiblePixel() {
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    for (let i=3;i<pixels.length;i+=4) if (pixels[i]!==0) return true;
    return false;
  }
  function encodedImage() {
    let data = canvas.toDataURL('image/png');
    if (data.length > 400000) {
      const smaller = canvas.toDataURL('image/webp', .86);
      if (smaller.startsWith('data:image/webp;base64,') && smaller.length < data.length) data = smaller;
    }
    if (data.length > MAX_ENCODED) throw new Error('This image is too detailed to save at this size. Use a smaller canvas, such as 512 × 512 pixels.');
    return data;
  }
  function addToRoom() {
    try {
      if (loading) throw new Error('Please wait while the image opens.');
      if (!hasVisiblePixel()) throw new Error('Draw something or choose an image first.');
      const imageData=encodedImage(), longSide=4, ratio=canvas.width/canvas.height;
      const width = ratio>=1 ? longSide : Math.max(.4,longSide*ratio), height = ratio>=1 ? Math.max(.4,longSide/ratio) : longSide;
      const item = {...(initialItem || {}), type:'custom', shape:'image', imageData, name:(find('[data-studio-name]').value.trim() || 'My custom piece').slice(0,60), w:initialItem?.w || width, h:initialItem?.h || height, rotation:initialItem?.rotation || 0};
      if (initialItem && initialItem.shape !== 'image') delete item.color;
      if (typeof callback !== 'function') throw new Error('The room is not ready yet. Please try again.');
      callback(item); dialog.close(); message('Added to your room.');
    } catch (error) { message(error && error.message || 'This piece could not be added.', true); }
  }
  function open(options = {}) {
    if (!dialog) makeUI(); if (dialog.open) return;
    const activeSeq=++openSeq; initialItem = options.item || null; callback = initialItem ? (options.onSave || options.onAdd) : options.onAdd;
    find('[data-studio-add]').textContent = initialItem ? '✓ Save changes' : '＋ Add to my room';
    undoStack=[];find('[data-studio-undo]').disabled=true;
    if (!initialItem) {
      canvas.width=256;canvas.height=256;context=canvas.getContext('2d',{willReadFrequently:true});
      find('[data-studio-width]').value=256;find('[data-studio-height]').value=256;find('[data-studio-name]').value='My custom piece';created=false;message('Ready to create.');
    }
    dialog.showModal(); updateCanvasDisplay();
    if (initialItem) {
      const data = initialItem.imageData;
      find('[data-studio-name]').value=typeof initialItem.name==='string'?initialItem.name:'My custom piece';
      if (initialItem.type === 'custom' && initialItem.shape !== 'image') {
        const itemW=Number(initialItem.w)>0?Number(initialItem.w):2,itemH=Number(initialItem.h)>0?Number(initialItem.h):2;
        const scale=256/Math.max(itemW,itemH);canvas.width=Math.max(MIN_SIDE,Math.round(itemW*scale));canvas.height=Math.max(MIN_SIDE,Math.round(itemH*scale));context=canvas.getContext('2d',{willReadFrequently:true});
        context.fillStyle=typeof initialItem.color==='string'&&/^#[0-9a-f]{6}$/i.test(initialItem.color)?initialItem.color:'#cfac9c';context.beginPath();
        if((initialItem.shape==='freehand'||initialItem.shape==='polygon')&&Array.isArray(initialItem.points)&&initialItem.points.length>=3){initialItem.points.forEach((p,i)=>{const x=(p[0]+.5)*canvas.width,y=(p[1]+.5)*canvas.height;if(i)context.lineTo(x,y);else context.moveTo(x,y)});context.closePath()}
        else if(initialItem.shape==='ellipse'||initialItem.shape==='pillar')context.ellipse(canvas.width/2,canvas.height/2,canvas.width/2,canvas.height/2,0,0,Math.PI*2);
        else context.rect(0,0,canvas.width,canvas.height);
        context.fill();find('[data-studio-width]').value=canvas.width;find('[data-studio-height]').value=canvas.height;loading=false;created=true;find('[data-studio-add]').disabled=false;updateCanvasDisplay();message('Paint on your piece, then save your changes.');return;
      }
      if(typeof data !== 'string' || data.length>2500000 || !/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(data)) { find('[data-studio-add]').disabled=true;message('This image could not be opened for painting.',true);return; }
      loading=true;find('[data-studio-add]').disabled=true;message('Opening your image…');
      const image=new Image();image.onload=()=>{if(!dialog.open || activeSeq!==openSeq)return;const iw=image.naturalWidth,ih=image.naturalHeight;if(!iw||!ih||iw*ih>MAX_PIXELS){loading=false;find('[data-studio-add]').disabled=true;message('This image is too large to edit.',true);return}const factor=Math.min(1,MAX_SIDE/iw,MAX_SIDE/ih);canvas.width=Math.max(MIN_SIDE,Math.round(iw*factor));canvas.height=Math.max(MIN_SIDE,Math.round(ih*factor));context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,canvas.width,canvas.height);find('[data-studio-width]').value=canvas.width;find('[data-studio-height]').value=canvas.height;created=true;loading=false;find('[data-studio-add]').disabled=false;updateCanvasDisplay();message('Paint on your piece, then save your changes.')};
      image.onerror=()=>{if(activeSeq!==openSeq)return;loading=false;find('[data-studio-add]').disabled=true;message('This image could not be opened for painting.',true)};image.src=data;
    } else { loading=false;find('[data-studio-add]').disabled=false; }
  }
  root.CustomStudio = {open};
})(typeof window !== 'undefined' ? window : globalThis);
