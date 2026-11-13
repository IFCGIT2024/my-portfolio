/* Furniture transforms for Little Room. Coordinates are in half-metre grid units. */
(function(root){
'use strict';
const TAU = Math.PI * 2;
const radians = degrees => (Number(degrees) || 0) * Math.PI / 180;
const finitePositive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;
function itemSize(item, catalog){
  const def = catalog[item.type] || {w:2,h:2};
  return {w:finitePositive(item.w,def.w || 2), h:finitePositive(item.h,def.h || 2)};
}
function toWorld(item, local){
  const a = radians(item.rotation), c = Math.cos(a), s = Math.sin(a);
  return {x:item.x + local.x*c - local.y*s,y:item.y + local.x*s + local.y*c};
}
function toLocal(item, p){
  const a = radians(item.rotation), c = Math.cos(a), s = Math.sin(a), dx=p.x-item.x,dy=p.y-item.y;
  return {x:dx*c+dy*s,y:-dx*s+dy*c};
}
function corners(item,catalog){
 const {w,h}=itemSize(item,catalog);
 return [toWorld(item,{x:-w/2,y:-h/2}),toWorld(item,{x:w/2,y:-h/2}),toWorld(item,{x:w/2,y:h/2}),toWorld(item,{x:-w/2,y:h/2})];
}
function customPath(ctx,item,w,h){
  const points=Array.isArray(item.points)?item.points:[];
  ctx.beginPath();
  if((item.shape==='polygon'||item.shape==='freehand')&&points.length>=3){
    points.forEach((p,i)=>{const x=p[0]*w,y=p[1]*h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.closePath();
  }else if(item.shape==='ellipse'||item.shape==='pillar'){
    ctx.ellipse(0,0,w/2,h/2,0,0,TAU);
  }else if(typeof ctx.roundRect==='function') ctx.roundRect(-w/2,-h/2,w,h,Math.min(.12,w/5,h/5));
  else ctx.rect(-w/2,-h/2,w,h);
}
// Only embedded, locally supplied raster images are accepted. No network requests.
const imageCache=new Map(),tintCache=new Map();
function localImage(data,redraw){
 if(typeof data!=='string'||data.length>12_000_000||!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(data)||typeof Image==='undefined')return null;
 let entry=imageCache.get(data);
 if(!entry){const image=new Image();entry={image,ready:false,failed:false,listeners:new Set()};imageCache.set(data,entry);image.onload=()=>{entry.ready=true;for(const callback of entry.listeners)callback();entry.listeners.clear()};image.onerror=()=>{entry.failed=true;entry.listeners.clear()};image.src=data}
 if(!entry.ready&&!entry.failed&&typeof redraw==='function')entry.listeners.add(redraw);
 return entry.ready?entry.image:null;
}
async function waitForImages(items){
 await Promise.all((items||[]).filter(item=>item&&item.type==='custom'&&item.shape==='image').map(item=>new Promise((resolve,reject)=>{
   const ready=localImage(item.imageData,resolve);if(ready){resolve();return}
   const entry=imageCache.get(item.imageData);if(!entry||entry.failed){reject(new Error('An image in this room could not be loaded.'));return}
   entry.image.addEventListener('error',()=>reject(new Error('An image in this room could not be loaded.')),{once:true});
 })));
}
function pointInPath(point,ps){let inside=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){const [xi,yi]=ps[i],[xj,yj]=ps[j];if(((yi>point.y)!==(yj>point.y))&&(point.x<(xj-xi)*(point.y-yi)/(yj-yi)+xi))inside=!inside}return inside}
function clipToStoredShape(ctx,item,w,h){
 if(!Array.isArray(item.clipPolygon)||item.clipPolygon.length<3)return;
 ctx.beginPath();item.clipPolygon.forEach((p,i)=>{if(i===0)ctx.moveTo(p[0]*w,p[1]*h);else ctx.lineTo(p[0]*w,p[1]*h)});ctx.closePath();ctx.clip();
}
function makeTinted(cacheKey,w,h,color,render){
 if(!validColor(color)||typeof document==='undefined')return null;
 const key=cacheKey+'|'+color,known=tintCache.get(key);if(known)return known;
 const canvas=document.createElement('canvas'),scale=Math.min(160,Math.max(18,320/Math.max(w,h)));
 canvas.width=Math.max(1,Math.ceil(w*scale));canvas.height=Math.max(1,Math.ceil(h*scale));
 const tc=canvas.getContext('2d');tc.setTransform(scale,0,0,scale,0,0);render(tc);
 tc.globalCompositeOperation='source-atop';tc.globalAlpha=.48;tc.fillStyle=color;tc.fillRect(0,0,w,h);tc.globalAlpha=1;tc.globalCompositeOperation='source-over';
 if(tintCache.size>=40)tintCache.delete(tintCache.keys().next().value);tintCache.set(key,canvas);return canvas;
}
function draw(ctx,item,catalog,drawOriginal,requestRedraw){
 const {w,h}=itemSize(item,catalog),def=catalog[item.type];
 ctx.save();ctx.translate(item.x,item.y);ctx.rotate(radians(item.rotation));clipToStoredShape(ctx,item,w,h);
 if(item.type==='custom'&&item.shape==='image'){
   const img=localImage(item.imageData,requestRedraw);
   if(img){const tinted=makeTinted(item.imageData,1,1,item.color,tc=>tc.drawImage(img,0,0,1,1));ctx.drawImage(tinted||img,-w/2,-h/2,w,h)}
   else {ctx.fillStyle='#eee9df';ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeStyle='#bdab9d';ctx.lineWidth=.04;ctx.strokeRect(-w/2,-h/2,w,h)}
 }else if(item.type==='custom' || !def){
   ctx.shadowColor='rgba(63,43,32,.18)';ctx.shadowBlur=.12;ctx.shadowOffsetY=.1;
   customPath(ctx,item,w,h);ctx.fillStyle=validColor(item.color)?item.color:(item.shape==='pillar'?'#cbbcab':'#cfac9c');ctx.fill();ctx.shadowColor='transparent';ctx.lineWidth=.045;ctx.strokeStyle=item.shape==='pillar'?'#a68d79':'#a47c6f';ctx.stroke();
   if(item.shape==='pillar'){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.05;ctx.beginPath();ctx.ellipse(-w*.1,-h*.1,w*.22,h*.18,0,Math.PI,Math.PI*1.85);ctx.stroke()}
 }else {
   const tinted=makeTinted(item.type,def.w,def.h,item.color,tc=>drawOriginal(tc,{...item,x:def.w/2,y:def.h/2,rotation:0},false));
   if(tinted)ctx.drawImage(tinted,-w/2,-h/2,w,h);else{ctx.scale(w/def.w,h/def.h);drawOriginal(ctx,{...item,x:0,y:0,rotation:0},false)}
 }
 ctx.restore();
}
function validColor(s){return typeof s==='string' && /^#[0-9a-f]{6}$/i.test(s)}
function hitItem(item,catalog,point){
 const p=toLocal(item,point),{w,h}=itemSize(item,catalog),nx=p.x/w,ny=p.y/h;
 if(Math.abs(nx)>.5||Math.abs(ny)>.5)return false;
 if(Array.isArray(item.clipPolygon)&&item.clipPolygon.length>=3&&!pointInPath({x:nx,y:ny},item.clipPolygon))return false;
 if(item.type==='custom'&&(item.shape==='ellipse'||item.shape==='pillar'))return nx*nx*4+ny*ny*4<=1;
 if(item.type==='custom'&&(item.shape==='polygon'||item.shape==='freehand')&&Array.isArray(item.points)&&item.points.length>=3){
   let inside=false;const ps=item.points;
   for(let i=0,j=ps.length-1;i<ps.length;j=i++){
     const xi=ps[i][0],yi=ps[i][1],xj=ps[j][0],yj=ps[j][1];
     if(((yi>ny)!==(yj>ny))&&(nx<(xj-xi)*(ny-yi)/(yj-yi)+xi))inside=!inside;
   }
   return inside;
 }
 return true;
}
function handlePoints(item,catalog,scale){
 const points=corners(item,catalog),a=points[0],dx=a.x-item.x,dy=a.y-item.y,l=Math.hypot(dx,dy)||1;
 return {delete:{x:a.x+dx/l*8/scale,y:a.y+dy/l*8/scale},rotate:points[1],resize:points[2]};
}
function drawHandles(ctx,item,catalog,scale){
 const [a,b,c,d]=corners(item,catalog),handles=handlePoints(item,catalog,scale),line=1.5/scale,radius=8/scale;
 ctx.save();ctx.shadowColor='transparent';ctx.lineWidth=line;ctx.strokeStyle='#527d65';ctx.setLineDash([5/scale,4/scale]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
 for(const [key,p,fill,symbol] of [['delete',handles.delete,'#d65555',''],['rotate',handles.rotate,'#527d65','↻'],['resize',handles.resize,'#fffefa','↘']]){
   ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TAU);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=key==='delete'?'#fffefa':'#527d65';ctx.lineWidth=1.5/scale;ctx.stroke();
   if(key==='delete'){const t=3/scale;ctx.strokeStyle='#fff';ctx.lineWidth=1.8/scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-t,p.y-t);ctx.lineTo(p.x+t,p.y+t);ctx.moveTo(p.x+t,p.y-t);ctx.lineTo(p.x-t,p.y+t);ctx.stroke()}
   else {ctx.fillStyle=key==='rotate'?'#fffefa':'#527d65';ctx.font=`bold ${11/scale}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(symbol,p.x,p.y+.2/scale)}
 }
 ctx.restore();
}
function hitHandle(item,catalog,point,scale){
 const points=handlePoints(item,catalog,scale),tolerance=13/Math.max(scale,1),ranked=Object.entries(points).map(([name,p])=>[name,Math.hypot(point.x-p.x,point.y-p.y)]).sort((a,b)=>a[1]-b[1]);
 return ranked[0][1]<=tolerance?ranked[0][0]:null;
}
function startTransform(kind,item,catalog,point){
 if(!['rotate','resize'].includes(kind))return null;
 const {w,h}=itemSize(item,catalog);
 return {kind,startRotation:Number(item.rotation)||0,startAngle:Math.atan2(point.y-item.y,point.x-item.x),w,h,anchor:toWorld(item,{x:-w/2,y:-h/2})};
}
function moveTransform(transform,item,catalog,point,snap=.1){
 if(!transform)return;
 if(transform.kind==='rotate'){
   let angle=(transform.startRotation+(Math.atan2(point.y-item.y,point.x-item.x)-transform.startAngle)*180/Math.PI)%360;
   if(angle<0)angle+=360;item.rotation=Math.round(angle*10)/10;return;
 }
 const a=radians(transform.startRotation),c=Math.cos(a),s=Math.sin(a),dx=point.x-transform.anchor.x,dy=point.y-transform.anchor.y;
 const step=Number.isFinite(snap)&&snap>0?snap:.1;
 const w=Math.max(step,Math.round((dx*c+dy*s)/step)*step),h=Math.max(step,Math.round((-dx*s+dy*c)/step)*step);
 item.w=Math.round(w*1000)/1000;item.h=Math.round(h*1000)/1000;
 item.x=transform.anchor.x+(w/2)*c-(h/2)*s;item.y=transform.anchor.y+(w/2)*s+(h/2)*c;
}
function createFromBox(shape,start,end,options={}){
  const width=Math.abs(end.x-start.x),height=Math.abs(end.y-start.y);
  if(width<.1||height<.1)return null;
  return {type:'custom',shape:['rect','ellipse','pillar'].includes(shape)?shape:'rect',
    x:(start.x+end.x)/2,y:(start.y+end.y)/2,w:width,h:height,rotation:0,
    name:options.name || (shape==='pillar'?'Pillar':'Custom shape'),
    color:validColor(options.color)?options.color:(shape==='pillar'?'#cbbcab':'#cfac9c')};
}
function createFromPoints(points,options={}){
  const clean=points.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y));
  if(clean.length<3)return null;
  const n=Math.ceil(clean.length/400);const sample=clean.filter((_,i)=>i%n===0);
  if(sample.length<3)return null;
  const xs=sample.map(p=>p.x),ys=sample.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const w=maxX-minX,h=maxY-minY;
  if(w<.1||h<.1)return null;
  const x=(minX+maxX)/2,y=(minY+maxY)/2;
  return {type:'custom',shape:options.shape==='polygon'?'polygon':'freehand',x,y,w,h,rotation:0,
    points:sample.map(p=>[Math.round((p.x-x)/w*10000)/10000,Math.round((p.y-y)/h*10000)/10000]),
    name:options.name||'Custom shape',color:validColor(options.color)?options.color:'#cfac9c'};
}
// Snap and clip use item-local coordinates so edited outlines travel with the piece.
function snapToGrid(item,step){
 const n=Number(step);if(!Number.isFinite(n)||n<=0)return {...item};
 return {...item,x:Math.round(item.x/n)*n,y:Math.round(item.y/n)*n};
}
function validPolygon(poly){return Array.isArray(poly)&&poly.length>=3&&poly.length<=5000&&poly.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))}
function nearestPoint(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/len)):0;const x=a[0]+dx*t,y=a[1]+dy*t;return{x,y,t,distance:Math.hypot(p.x-x,p.y-y),dx,dy,len:Math.sqrt(len)}}
function snapToWall(item,catalog,poly){
 if(!validPolygon(poly))return null;let best=null;
 for(let i=0;i<poly.length;i++){const q=nearestPoint(item,poly[i],poly[(i+1)%poly.length]);if(q.len>1e-6&&(!best||q.distance<best.distance))best=q}
 if(!best)return null;let nx=-best.dy/best.len,ny=best.dx/best.len;
 const midpoint={x:best.x+nx*.01,y:best.y+ny*.01};if(!pointInPath(midpoint,poly)){nx=-nx;ny=-ny}
 const size=itemSize(item,catalog),angle=Math.atan2(best.dy,best.dx)*180/Math.PI;
 return {...item,x:best.x+nx*size.h/2,y:best.y+ny*size.h/2,rotation:(angle+360)%360};
}
function segmentIntersects(a,b,c,d){
 const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
 const p=cross(a,b,c),q=cross(a,b,d),r=cross(c,d,a),s=cross(c,d,b),eps=1e-10;
 if((p>eps&&q>eps)||(p< -eps&&q< -eps)||(r>eps&&s>eps)||(r< -eps&&s< -eps))return false;
 return Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))+eps && Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]))+eps;
}
function fitToRoom(item,catalog,poly){
 if(!validPolygon(poly))return null;const size=itemSize(item,catalog);
 const local=poly.map(([x,y])=>{const p=toLocal(item,{x,y});return [p.x/size.w,p.y/size.h]});
 const box=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],within=([x,y])=>x>=-.5&&x<=.5&&y>=-.5&&y<=.5;
 let overlaps=local.some(within)||box.some(([x,y])=>pointInPath({x,y},local));
 if(!overlaps)for(let i=0;i<local.length&&!overlaps;i++)for(let j=0;j<4&&!overlaps;j++)overlaps=segmentIntersects(local[i],local[(i+1)%local.length],box[j],box[(j+1)%4]);
 if(!overlaps)return null;
 return {...item,clipPolygon:local.map(([x,y])=>[Math.round(x*1e6)/1e6,Math.round(y*1e6)/1e6])};
}
root.Furniture={itemSize,toWorld,toLocal,corners,draw,hitItem,drawHandles,hitHandle,startTransform,moveTransform,createFromBox,createFromPoints,snapToGrid,snapToWall,fitToRoom,waitForImages};
})(typeof window==='undefined'?globalThis:window);
