/** Little Room's portable, meter-based document model. These functions never mutate their input. */
const clone = value => JSON.parse(JSON.stringify(value));
const num = n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1000000;
const uid = () => globalThis.crypto?.randomUUID?.() || `lr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
const opening = o => o.kind === 'door' || o.kind === 'window';
const length = w => Math.hypot(w.x2-w.x1,w.y2-w.y1);
const wall = (x1,y1,x2,y2) => ({id:uid(),kind:'wall',x1,y1,x2,y2,thickness:.12,height:2.6});
const deep = o => clone(o);

export function createDocument({width=8,height=6,name='My room'}={}) {
 if(!num(width)||!num(height)||width<=0||height<=0) throw new Error('Room dimensions must be positive finite numbers.');
 return {version:2,name,units:'m',objects:[{id:uid(),kind:'floor',x:width/2,y:height/2,w:width,h:height,rotation:0,mirrorX:false,mirrorY:false,style:{color:'#eee2d0'}},wall(0,0,width,0),wall(width,0,width,height),wall(width,height,0,height),wall(0,height,0,0)],environment:{latitude:44.6488,longitude:-63.5752,date:null,scene:'none',sound:false}};
}
export function validateDocument(doc) {
 if(!doc||doc.version!==2||doc.units!=='m'||typeof doc.name!=='string'||doc.name.length>200||!Array.isArray(doc.objects)||doc.objects.length>10000) return false;
 const ids=new Set();
 for(const o of doc.objects){
  if(!o||typeof o.id!=='string'||!o.id||o.id.length>200||ids.has(o.id)||typeof o.kind!=='string')return false;ids.add(o.id);
  if(o.kind==='wall'){if(![o.x1,o.y1,o.x2,o.y2].every(num)||length(o)<.01||!num(o.thickness)||o.thickness<=0||!num(o.height)||o.height<0)return false;}
  else if(opening(o)){if(typeof o.hostWallId!=='string'||!num(o.t)||o.t<0||o.t>1||!num(o.width)||o.width<=0)return false;}
  else {if(![o.x,o.y,o.w,o.h,o.rotation].every(num)||o.w<=0||o.h<=0)return false;
   if(o.points!==undefined&&(!Array.isArray(o.points)||o.points.length<3||o.points.length>1000||!o.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(num))))return false;}
 }
 for(const o of doc.objects.filter(opening)){const host=doc.objects.find(w=>w.id===o.hostWallId&&w.kind==='wall');if(!host||o.width>length(host)+1e-8||o.t-o.width/(2*length(host))< -1e-8||o.t+o.width/(2*length(host))>1+1e-8)return false;}
 for(const w of doc.objects.filter(o=>o.kind==='wall')){const len=length(w), spans=doc.objects.filter(o=>opening(o)&&o.hostWallId===w.id).map(o=>[o.t-o.width/(2*len),o.t+o.width/(2*len)]).sort((a,b)=>a[0]-b[0]);for(let i=1;i<spans.length;i++)if(spans[i][0]<spans[i-1][1]-1e-8)return false;}
 try{JSON.stringify(doc)}catch{return false}return true;
}
function checked(doc){if(!validateDocument(doc))throw new Error('Invalid room document.');return doc;}
function normalized(obj){const o=deep(obj);o.id ||= uid();if(o.kind==='wall'){o.thickness ??= .12;o.height ??= 2.6;} else if(opening(o)){o.t ??= .5;o.width ??= .9;}else{o.rotation ??= 0;o.mirrorX ??= false;o.mirrorY ??= false;o.style ??= {};}return o;}
export function addObject(doc,obj){const next=deep(doc);next.objects.push(normalized(obj));return checked(next)}
export function updateObject(doc,id,patch){const next=deep(doc),index=next.objects.findIndex(o=>o.id===id);if(index<0)return next;next.objects[index]={...next.objects[index],...deep(patch),id};return checked(next)}
export function removeObjects(doc,ids){const deleted=new Set(ids),next=deep(doc);next.objects=next.objects.filter(o=>!deleted.has(o.id)&&!(opening(o)&&deleted.has(o.hostWallId)));return checked(next)}
function transform(doc, ids, fn, angle=0, wallWidthScale=false){
 const next=deep(doc),selected=new Set(ids), old=new Map(doc.objects.filter(o=>o.kind==='wall').map(o=>[o.id,o]));
 for(const o of next.objects){if(!selected.has(o.id)||opening(o))continue;
  if(o.kind==='wall'){[o.x1,o.y1]=fn(o.x1,o.y1);[o.x2,o.y2]=fn(o.x2,o.y2);}else{[o.x,o.y]=fn(o.x,o.y);o.rotation=(o.rotation+angle)%360;}
 }
 if(wallWidthScale)for(const o of next.objects.filter(opening)){if(selected.has(o.hostWallId)){const nw=next.objects.find(w=>w.id===o.hostWallId),ow=old.get(o.hostWallId);o.width*=length(nw)/length(ow);}}
 return next;
}
export function translateObjects(doc,ids,dx,dy){
 if(!num(dx)||!num(dy))throw new Error('Invalid translation.');const selected=new Set(ids),next=transform(doc,ids,(x,y)=>[x+dx,y+dy]);
 for(const o of next.objects.filter(opening)){if(!selected.has(o.id)||selected.has(o.hostWallId))continue;const w=next.objects.find(w=>w.id===o.hostWallId),len=length(w),delta=(dx*(w.x2-w.x1)+dy*(w.y2-w.y1))/(len*len),half=o.width/(2*len);o.t=Math.max(half,Math.min(1-half,o.t+delta));}
 return checked(next);
}
export function rotateObjects(doc,ids,degrees,center={x:0,y:0}){if(!num(degrees)||!num(center.x)||!num(center.y))throw new Error('Invalid rotation.');const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return checked(transform(doc,ids,(x,y)=>[center.x+(x-center.x)*c-(y-center.y)*s,center.y+(x-center.x)*s+(y-center.y)*c],degrees))}
export function scaleObjects(doc,ids,sx,sy,center={x:0,y:0}){if(!num(sx)||!num(sy)||sx<=0||sy<=0||!num(center.x)||!num(center.y))throw new Error('Invalid scale.');const selected=new Set(ids);if(Math.abs(sx-sy)>1e-9&&doc.objects.some(o=>selected.has(o.id)&&o.kind!=='wall'&&!opening(o)&&Math.abs(Math.sin((o.rotation||0)*Math.PI/180))>1e-8))throw new Error('Rotate this piece to zero before resizing it unevenly, or scale both dimensions together.');const next=transform(doc,ids,(x,y)=>[center.x+(x-center.x)*sx,center.y+(y-center.y)*sy],0,true);for(const o of next.objects){if(selected.has(o.id)&&o.kind!=='wall'&&!opening(o)){o.w*=sx;o.h*=sy;}}return checked(next)}
export function reorderObject(doc,id,direction){const next=deep(doc),i=next.objects.findIndex(o=>o.id===id);if(i<0)return next;let j=direction==='front'?next.objects.length-1:direction==='back'?0:direction==='forward'?Math.min(i+1,next.objects.length-1):direction==='backward'?Math.max(0,i-1):i;const [o]=next.objects.splice(i,1);next.objects.splice(j,0,o);return checked(next)}
/** Duplicate hosted openings in the nearest available wall gap or fail without modifying the source. */
export function duplicateObjects(doc,ids,dx=.3,dy=.3){
 const selected=new Set(ids),next=deep(doc),map=new Map();
 for(const o of doc.objects)if(selected.has(o.id))map.set(o.id,uid());
 for(const obj of doc.objects){
  if(!selected.has(obj.id))continue;
  const o=deep(obj);o.id=map.get(obj.id);
  if(o.kind==='wall'){o.x1+=dx;o.y1+=dy;o.x2+=dx;o.y2+=dy;}
  else if(opening(o)){
   if(map.has(o.hostWallId))o.hostWallId=map.get(o.hostWallId);
   else{
    const w=doc.objects.find(w=>w.id===o.hostWallId),len=length(w),half=o.width/(2*len);
    const desired=o.t+(dx*(w.x2-w.x1)+dy*(w.y2-w.y1))/(len*len);
    const spans=next.objects.filter(p=>opening(p)&&p.hostWallId===w.id).map(p=>[p.t-p.width/(2*len),p.t+p.width/(2*len)]).sort((a,b)=>a[0]-b[0]);
    const gaps=[];let start=0;for(const [a,b] of spans){if(a-start>=2*half-1e-8)gaps.push([start+half,a-half]);start=Math.max(start,b)}if(1-start>=2*half-1e-8)gaps.push([start+half,1-half]);
    if(!gaps.length)throw new Error('There is no room for another opening on this wall.');
    const candidates=gaps.map(([a,b])=>Math.max(a,Math.min(b,desired))).sort((a,b)=>Math.abs(a-desired)-Math.abs(b-desired));o.t=candidates[0];
   }
  } else{o.x+=dx;o.y+=dy;}
  next.objects.push(o);
 }
 return checked(next)
}
export function createHistory(initial){checked(initial);let states=[deep(initial)],index=0;return {get current(){return deep(states[index])},commit(doc){checked(doc);const next=deep(doc);if(JSON.stringify(states[index])===JSON.stringify(next))return this.current;states=states.slice(0,index+1);states.push(next);if(states.length>100)states.shift();index=states.length-1;return this.current},undo(){if(index>0)index--;return this.current},redo(){if(index<states.length-1)index++;return this.current},canUndo(){return index>0},canRedo(){return index<states.length-1}};}
