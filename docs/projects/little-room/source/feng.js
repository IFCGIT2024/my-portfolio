/* A local layout helper based on practical spatial heuristics. Feng shui has
   different traditions; these suggestions are not an authoritative assessment. */
const key = (x, y) => `${x},${y}`;
const DIR = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
const SIDES = ['top', 'right', 'bottom', 'left'];
const WALL_PREFERRED = new Set(['bed', 'sofa', 'desk', 'counter', 'sink', 'stove', 'fridge', 'bookshelf']);
const KITCHEN = new Set(['counter', 'sink', 'stove', 'fridge']);
const LOW_PROFILE = new Set(['rug']);
const EPS=1e-7;
function distance(x1,y1,x2,y2){return Math.hypot(x1-x2,y1-y2)}
function dimensions(item,catalog){const def=catalog[item.type];if(!def)return null;const w=Number(item.w??def.w),h=Number(item.h??def.h);return Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0?{w,h}:null}
function shape(item,catalog){
  const d=dimensions(item,catalog);if(!d||!Number.isFinite(item.x)||!Number.isFinite(item.y))return null;
  const angle=(Number(item.rotation)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const point=(x,y)=>[item.x+x*c-y*s,item.y+x*s+y*c];
  const points=[point(-d.w/2,-d.h/2),point(d.w/2,-d.h/2),point(d.w/2,d.h/2),point(-d.w/2,d.h/2)];
  return {points,w:d.w,h:d.h,left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
}
function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function onSegment(p,a,b){return Math.abs(cross(a,b,p))<EPS&&p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS}
function insidePolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {const a=poly[j],b=poly[i];if(onSegment(p,a,b))return true;if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside}
function properCross(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<-EPS&&cross(c,d,a)*cross(c,d,b)<-EPS}
function insideRectStrict(p,rect){const ps=rect.points;for(let i=0;i<4;i++)if(cross(ps[i],ps[(i+1)%4],p)<=EPS)return false;return true}
function containsRoom(rect,ctx){
  if(ctx.polygon){const p=ctx.polygon;if(!rect.points.every(pt=>insidePolygon(pt,p)))return false;
    // In a concave polygon, all four corners can be inside while an edge crosses
    // a notch. Check crossings and vertices inside the rectangle as well.
    for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(insideRectStrict(a,rect))return false;for(let j=0;j<4;j++)if(properCross(a,b,rect.points[j],rect.points[(j+1)%4]))return false;}
    for(let i=0;i<4;i++){const a=rect.points[i],b=rect.points[(i+1)%4];if(!insidePolygon([(a[0]+b[0])/2,(a[1]+b[1])/2],p))return false;}return true;
  }
  // For older cell-only rooms, conservatively require all cells touched by the
  // rotated item's bounding box to be inside. This may reject a possible fit.
  for(let y=Math.floor(rect.top+EPS);y<Math.ceil(rect.bottom-EPS);y++)for(let x=Math.floor(rect.left+EPS);x<Math.ceil(rect.right-EPS);x++)if(!ctx.cells.has(key(x,y)))return false;
  return true;
}
function overlaps(a,b){
  // Separating-axis test for rotated rectangular footprints. Touching edges are fine.
  for(const points of [a.points,b.points])for(let i=0;i<2;i++) {const p=points[i],q=points[i+1],axis=[-(q[1]-p[1]),q[0]-p[0]];let ap=a.points.map(v=>v[0]*axis[0]+v[1]*axis[1]),bp=b.points.map(v=>v[0]*axis[0]+v[1]*axis[1]);if(Math.max(...ap)<=Math.min(...bp)+EPS||Math.max(...bp)<=Math.min(...ap)+EPS)return false;}
  return true;
}
function openingPoint(o,ctx){if(ctx.polygon&&Number.isInteger(o.edgeIndex)&&o.edgeIndex>=0&&o.edgeIndex<ctx.polygon.length&&Number.isFinite(o.t)){const a=ctx.polygon[o.edgeIndex],b=ctx.polygon[(o.edgeIndex+1)%ctx.polygon.length],t=Math.max(0,Math.min(1,o.t));return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t}}const v=DIR[o.side]||[0,-1];return {x:o.x+.5+v[0]*.5,y:o.y+.5+v[1]*.5}}
function pointSegmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;return distance(p[0],p[1],a[0]+t*dx,a[1]+t*dy)}
function roomWalls(ctx){if(ctx.polygon)return ctx.polygon.map((p,i)=>[p,ctx.polygon[(i+1)%ctx.polygon.length]]);const out=[];for(const cell of ctx.cells){const [x,y]=cell.split(',').map(Number);for(const side of SIDES){const [dx,dy]=DIR[side];if(ctx.cells.has(key(x+dx,y+dy)))continue;if(side==='top')out.push([[x,y],[x+1,y]]);if(side==='bottom')out.push([[x,y+1],[x+1,y+1]]);if(side==='left')out.push([[x,y],[x,y+1]]);if(side==='right')out.push([[x+1,y],[x+1,y+1]]);}}return out}
function nearestWallDistance(p,walls){return walls.reduce((best,[a,b])=>Math.min(best,pointSegmentDistance(p,a,b)),Infinity)}
function edgeWallRatio(rect,ctx){const a=rect.points[0],b=rect.points[1];let count=0;for(let i=0;i<5;i++){const t=(i+.5)/5,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];if(nearestWallDistance(p,ctx.walls)<.12)count++}return count/5}
function openingNearHead(rect,ctx,type){const a=rect.points[0],b=rect.points[1];return ctx.openings.some(o=>o.type===type&&(()=>{const p=openingPoint(o,ctx);return pointSegmentDistance([p.x,p.y],a,b)<.75})())}
function nearestOpenDistance(item,ctx,type){const ds=ctx.openings.filter(o=>o.type===type).map(o=>{const p=openingPoint(o,ctx);return distance(item.x,item.y,p.x,p.y)});return ds.length?Math.min(...ds):Infinity}
function doorAligned(rect,door,ctx){const p=openingPoint(door,ctx);return (door.side==='top'||door.side==='bottom')?p.x>rect.left-.5&&p.x<rect.right+.5:p.y>rect.top-.5&&p.y<rect.bottom+.5}
function roomContext(state){const cells=new Set((state.cells||[]).map(([x,y])=>key(x,y)));const polygon=Array.isArray(state.polygon)&&state.polygon.length>=3&&state.polygon.every(p=>Array.isArray(p)&&p.length>=2&&p.every(Number.isFinite))?state.polygon:null;const ctx={cells,polygon,openings:state.openings||[]};ctx.walls=roomWalls(ctx);return ctx}
function score(item,rect,ctx,placed){
  let result=0,backWall=WALL_PREFERRED.has(item.type)?edgeWallRatio(rect,ctx):0;
  if(WALL_PREFERRED.has(item.type))result+=backWall*(item.type==='bed'?35:18);
  if(openingNearHead(rect,ctx,'door'))result-=80;
  if(item.type==='bed'&&openingNearHead(rect,ctx,'window'))result-=18;
  if((item.type==='plant'||item.type==='desk')&&Number.isFinite(nearestOpenDistance(item,ctx,'window')))result+=Math.max(0,12-nearestOpenDistance(item,ctx,'window')*1.4);
  for(const door of ctx.openings.filter(o=>o.type==='door')) {const p=openingPoint(door,ctx),dist=distance(item.x,item.y,p.x,p.y),edgeDist=Math.min(...rect.points.map((a,i)=>pointSegmentDistance([p.x,p.y],a,rect.points[(i+1)%4])));if(!LOW_PROFILE.has(item.type)&&edgeDist<1)result-=55;if(dist<2)result-=15;if((item.type==='bed'||item.type==='desk')&&doorAligned(rect,door,ctx))result-=9;if(item.type==='bed')result+=Math.min(dist,10)*1.1;}
  if(KITCHEN.has(item.type)){const neighbors=placed.filter(p=>KITCHEN.has(p.item.type));if(neighbors.length)result+=Math.max(0,8-Math.min(...neighbors.map(p=>distance(item.x,item.y,p.item.x,p.item.y))))}
  if(item._original)result-=Math.min(12,distance(item.x,item.y,item._original.x,item._original.y)*.12);
  return result;
}
/** Explain the current arrangement using gentle, practical spatial heuristics. */
export function inspectRoom(state,catalog){
  const ctx=roomContext(state),items=state.items||[],doors=ctx.openings.filter(o=>o.type==='door'),windows=ctx.openings.filter(o=>o.type==='window'),notes=[];
  if(!doors.length)notes.push('Add a door so the layout can account for how you enter the room.');
  if(!windows.length)notes.push('Add a window to bring natural light into your plan.');
  for(const bed of items.filter(i=>i.type==='bed').slice(0,1)){const r=shape(bed,catalog);if(!r)continue;if(edgeWallRatio(r,ctx)<.75)notes.push('Try placing the head of the bed against a solid wall for a supported feeling.');else if(openingNearHead(r,ctx,'window'))notes.push('Try a solid wall behind the headboard if your room allows it.');else notes.push('The bed has a wall behind the headboard, giving it a supported position.');if(doors.some(d=>doorAligned(r,d,ctx)))notes.push('If you can, move the bed out of the door’s direct line while keeping the entrance in view.');}
  if(doors.length&&items.some(item=>{const r=shape(item,catalog);return r&&!LOW_PROFILE.has(item.type)&&doors.some(d=>{const p=openingPoint(d,ctx);return r.points.some((a,i)=>pointSegmentDistance([p.x,p.y],a,r.points[(i+1)%4])<.5)})}))notes.push('Give the doorway a little breathing room so the entrance feels open.');
  if(windows.length&&items.some(i=>i.type==='plant'))notes.push('Consider placing your plant near natural light, according to its needs.');
  if(!items.length)notes.push('Add a few pieces, then try an arrangement.');
  if(!notes.length)notes.push('Leave comfortable paths through the room and arrange things to suit your daily life.');return notes;
}
/** Create one arrangement. Fixed custom shapes stay in place as obstacles.
    On failure the caller receives unchanged items. */
export function arrangeRoom(state,catalog){
  const sourceItems=state.items||[];if(!sourceItems.length)return {ok:false,items:[],messages:['Add some furniture first, then try again.']};
  const ctx=roomContext(state);if(!ctx.polygon&&!ctx.cells.size)return {ok:false,items:sourceItems,messages:['Draw a room before arranging your furniture.']};
  for(const item of sourceItems)if(!shape(item,catalog))return {ok:false,items:sourceItems,messages:['One of the furniture pieces is not recognized.']};
  const coords=ctx.polygon||state.cells,offset=ctx.polygon?0:1,minX=Math.min(...coords.map(c=>c[0])),minY=Math.min(...coords.map(c=>c[1])),maxX=Math.max(...coords.map(c=>c[0]))+offset,maxY=Math.max(...coords.map(c=>c[1]))+offset;
  const placed=[];
  for(const item of sourceItems.filter(i=>i.type==='custom'||i.shape==='pillar'||i.locked)){const rect=shape(item,catalog);if(!containsRoom(rect,ctx))return {ok:false,items:sourceItems,messages:['A custom object is partly outside the room. Move it inside before arranging.']};if(placed.some(p=>overlaps(rect,p.rect)))return {ok:false,items:sourceItems,messages:['Custom objects overlap. Move them apart before arranging.']};placed.push({item,rect})}
  const fixedIds=new Set(placed.map(p=>p.item.id));
  const priority={bed:0,sofa:1,counter:2,sink:3,stove:4,fridge:5,desk:6,diningTable:7,bookshelf:8,armchair:9,coffeeTable:10,plant:11,rug:12};
  const ordered=sourceItems.filter(i=>!fixedIds.has(i.id)).sort((a,b)=>(priority[a.type]??10)-(priority[b.type]??10));
  // Search at a practical half-cell resolution, increasing the step only for
  // unusually large rooms to keep this interaction responsive.
  const step=(maxX-minX)*(maxY-minY)>1000?1:.5;
  for(const original of ordered){const def=catalog[original.type],d=dimensions(original,catalog);let best=null;
    for(const rotation of [0,90,180,270]){const swap=rotation%180!==0,w=swap?d.h:d.w,h=swap?d.w:d.h;
      for(let y=minY;y+h<=maxY+EPS;y+=step)for(let x=minX;x+w<=maxX+EPS;x+=step){const item={...original,x:x+w/2,y:y+h/2,rotation,_original:original},rect=shape(item,catalog);if(!containsRoom(rect,ctx))continue;if(!LOW_PROFILE.has(item.type)&&placed.some(p=>!LOW_PROFILE.has(p.item.type)&&overlaps(rect,p.rect)))continue;const value=score(item,rect,ctx,placed);if(!best||value>best.value)best={item,rect,value};}}
    if(!best)return {ok:false,items:sourceItems,messages:[`I couldn’t find a place for ${def.label||original.type}. Try a larger room or fewer pieces.`]};delete best.item._original;placed.push(best);
  }
  const positions=new Map(placed.map(p=>[p.item.id,p.item]));const items=sourceItems.map(i=>positions.get(i.id));return {ok:true,items,messages:inspectRoom({...state,items},catalog)};
}
