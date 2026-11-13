export const CATALOG = {
  bed: {label:'Bed',w:4,h:4,category:'Bedroom'},
  sofa: {label:'Sofa',w:5,h:2,category:'Living'},
  armchair: {label:'Armchair',w:2,h:2,category:'Living'},
  coffeeTable: {label:'Coffee table',w:3,h:2,category:'Living'},
  diningTable: {label:'Dining table',w:4,h:3,category:'Living'},
  desk: {label:'Desk',w:3,h:2,category:'Living'},
  counter: {label:'Counter',w:4,h:1,category:'Kitchen'},
  sink: {label:'Sink counter',w:2,h:1,category:'Kitchen'},
  stove: {label:'Stove',w:2,h:1,category:'Kitchen'},
  fridge: {label:'Fridge',w:2,h:2,category:'Kitchen'},
  plant: {label:'Plant',w:1,h:1,category:'Decor'},
  rug: {label:'Rug',w:5,h:4,category:'Decor'},
  bookshelf: {label:'Bookshelf',w:3,h:1,category:'Decor'},
  custom: {label:'Custom shape',w:2,h:2,category:'Custom'}
};
const copy = o => JSON.parse(JSON.stringify(o));
const id = () => Math.random().toString(36).slice(2,10);
const key = (x,y) => `${x},${y}`;
const SIDES = ['top','right','bottom','left'];
const N = {top:[0,-1],right:[1,0],bottom:[0,1],left:[-1,0]};
export function getDefaultState(){
 const cells=[]; for(let y=0;y<12;y++) for(let x=0;x<16;x++) cells.push([x,y]);
 return {cells, title:"My room", sunAngle:180, sunTime:12, items:[
  {id:id(),type:'rug',x:8,y:6,rotation:0},
  {id:id(),type:'bed',x:3,y:2,rotation:0},
  {id:id(),type:'sofa',x:10.5,y:8.5,rotation:0},
  {id:id(),type:'coffeeTable',x:10.5,y:6,rotation:0},
  {id:id(),type:'plant',x:15,y:10.5,rotation:0},
  {id:id(),type:'counter',x:12,y:.5,rotation:0},
  {id:id(),type:'sink',x:9,y:.5,rotation:0},
  {id:id(),type:'desk',x:3,y:10.5,rotation:0}
 ],openings:[{id:id(),type:'window',x:6,y:0,side:'top'}, {id:id(),type:'window',x:7,y:0,side:'top'}, {id:id(),type:'door',x:0,y:8,side:'left'}]};
}
function rr(c,x,y,w,h,r,fill,stroke,lw=.04){
 c.beginPath(); c.roundRect(x,y,w,h,r); if(fill){c.fillStyle=fill;c.fill()} if(stroke){c.lineWidth=lw;c.strokeStyle=stroke;c.stroke()}
}
function line(c,x1,y1,x2,y2,color,width){ c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke(); }
function circle(c,x,y,r,fill,stroke,lw=.04){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function itemDrawing(c,item,selected){
 const t=CATALOG[item.type]; if(!t)return;
 const w=t.w,h=t.h; c.save(); c.translate(item.x,item.y); c.rotate(item.rotation*Math.PI/180); c.translate(-w/2,-h/2);
 if(item.type !== 'rug') {c.shadowColor='rgba(63,43,32,.2)'; c.shadowBlur=.18; c.shadowOffsetY=.11;}
 const outline='#9b8678';
 switch(item.type){
 case 'bed':
  rr(c,0,0,w,h,.16,'#ba9a83',outline);c.shadowColor='transparent';rr(c,.12,.35,w-.24,h-.48,.12,'#fffaf1','#d5c5b4');
  rr(c,.22,.12,w-.44,.38,.1,'#a9836c'); rr(c,.34,.57,1.45,.73,.15,'#fffdf8','#e4d9cb');rr(c,2.18,.57,1.45,.73,.15,'#fffdf8','#e4d9cb');
  rr(c,.17,1.48,w-.34,h-1.68,.08,'#e7a996','#cd8d7c');line(c,.35,1.68,3.65,1.68,'#f2c7b7',.05);break;
 case 'sofa':
  rr(c,0,.12,w,h-.12,.24,'#cc826b','#a86655');c.shadowColor='transparent';rr(c,.12,0,w-.24,.54,.18,'#e8a58d','#c7826e');
  rr(c,.28,.55,2.12,1.04,.16,'#e6a58e','#c98573');rr(c,2.6,.55,2.12,1.04,.16,'#e6a58e','#c98573');
  rr(c,.05,.48,.35,1.28,.16,'#eeb7a1');rr(c,w-.4,.48,.35,1.28,.16,'#eeb7a1');break;
 case 'armchair':
  rr(c,.04,.15,w-.08,h-.18,.25,'#c9826c','#aa715f');c.shadowColor='transparent';rr(c,.14,.03,w-.28,.48,.15,'#efb5a1');rr(c,.25,.52,1.5,1.1,.2,'#eaa991','#c98573');break;
 case 'coffeeTable':
  rr(c,.09,.08,w-.18,h-.16,.45,'#d8b08b','#ae896d');c.shadowColor='transparent';rr(c,.26,.23,w-.52,h-.46,.35,'#e9c8a6','#ceaa88');circle(c,1.72,1,.23,'#f6f2df');circle(c,1.72,1,.14,'#a17459');break;
 case 'diningTable':
  rr(c,.14,.18,w-.28,h-.36,.32,'#d0a27b','#ab8064');c.shadowColor='transparent';rr(c,.3,.31,w-.6,h-.62,.22,'#efd2ae','#cfa984');
  for(let i=0;i<3;i++) circle(c,1+i,1.5,.27,'#faf4e4','#d9c6ab'); break;
 case 'desk':
  rr(c,0,0,w,h,.13,'#c29672','#9d775e');c.shadowColor='transparent';rr(c,.12,.1,w-.24,h-.22,.08,'#ebc9a4','#cfa888');rr(c,.85,.33,1.3,.75,.05,'#677d78','#526a66');rr(c,1,.45,1,.49,.02,'#c8ddd2');circle(c,2.48,.55,.16,'#f7f0dc');break;
 case 'counter': case 'sink': case 'stove':
  rr(c,0,0,w,h,.07,'#c49578','#a57f67'); c.shadowColor='transparent';rr(c,.08,.08,w-.16,h-.19,.04,'#f3e3ca','#d4b89d');
  if(item.type==='counter') for(let x=1;x<w;x++)line(c,x,.1,x,.9,'#dfccb5',.035);
  if(item.type==='sink'){rr(c,.35,.22,1.25,.58,.14,'#c4d4cd','#91aaa1');rr(c,.48,.29,.99,.43,.09,'#e7efdf','#aabcb2');circle(c,.98,.52,.06,'#a4b7ae');}
  if(item.type==='stove'){for(const [x,y] of [[.55,.3],[1.35,.3],[.55,.7],[1.35,.7]]){circle(c,x,y,.16,'#8d9690');circle(c,x,y,.08,'#d9ded2')}} break;
 case 'fridge':
  rr(c,.03,.03,1.94,1.94,.14,'#f7eee0','#c9b7a4');c.shadowColor='transparent';line(c,.12,.7,1.88,.7,'#d6c7b7',.05);line(c,.27,.23,.27,.52,'#b6a99a',.07);line(c,.27,1,.27,1.56,'#b6a99a',.07);break;
 case 'plant':
  circle(c,.5,.5,.43,'#b6c89a','#94aa80');c.shadowColor='transparent';circle(c,.5,.5,.24,'#be8b6b');
  for(let i=0;i<7;i++){let a=i*Math.PI*2/7;circle(c,.5+Math.cos(a)*.23,.5+Math.sin(a)*.23,.16,i%2?'#5e8969':'#789d73')}circle(c,.5,.5,.12,'#88a879');break;
 case 'rug':
  c.shadowColor='transparent';rr(c,.02,.02,w-.04,h-.04,.12,'#eedcc7','#d8bea4');rr(c,.22,.22,w-.44,h-.44,.04,null,'#cfae97',.06);
  for(let x=.48;x<w-.3;x+=.35){line(c,x,.02,x,-.08,'#cfb99f',.045);line(c,x,h-.02,x,h+.08,'#cfb99f',.045)}
  for(let x=.65;x<w-.4;x+=.65) for(let y=.6;y<h-.4;y+=.65)circle(c,x,y,.035,'#d8b8a2');break;
 case 'bookshelf':
  rr(c,0,0,w,h,.07,'#ba8e6d','#9f775d');c.shadowColor='transparent';rr(c,.1,.13,w-.2,.72,.03,'#e0b88f');
  for(let x=.18;x<2.8;x+=.22){rr(c,x,.2,.15,.48,.02,['#bd816c','#e4c29f','#809a83','#ece1c9'][Math.floor(x*10)%4])} break;
 }
 c.shadowColor='transparent'; if(selected){c.setLineDash([.12,.09]);rr(c,-.13,-.13,w+.26,h+.26,.13,null,'#527d65',.075);c.setLineDash([]);circle(c,w+.12,-.12,.12,'#527d65','#fff',.045)}
 c.restore();
}
// Room coordinates use one unit per 0.5 m. Polygon vertices may be fractional.
function polygonArea(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function pointInPolygon(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside}return inside}
function segmentPoint(p,a,b){let dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;let t=len?Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/len)):0;let x=a[0]+t*dx,y=a[1]+t*dy;return {t,x,y,distance:Math.hypot(p.x-x,p.y-y)}}
function validInteriorWalls(walls){if(walls===undefined)return true;if(!Array.isArray(walls)||walls.length>300)return false;const ids=new Set();return walls.every(w=>{if(!w||w.type!=='interior-wall'||typeof w.id!=='string'||!w.id||ids.has(w.id)||![w.x1,w.y1,w.x2,w.y2].every(n=>Number.isFinite(n)&&Math.abs(n)<=100))return false;ids.add(w.id);return (w.x1===w.x2||w.y1===w.y2)&&Math.hypot(w.x2-w.x1,w.y2-w.y1)>=.05})}
// Test every span between intersections, so a line cannot cross a notch or
// hole even when both endpoints lie inside the room.
function interiorWallFits(state,w){const outlines=state.polygon?[state.polygon]:cellOutlines(state.cells);if(!outlines.length)return false;const dx=w.x2-w.x1,dy=w.y2-w.y1,den=dx*dx+dy*dy,ts=[0,1],cross=(a,b,c,d)=>a*d-b*c;for(const poly of outlines)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],sx=b[0]-a[0],sy=b[1]-a[1],qx=a[0]-w.x1,qy=a[1]-w.y1,div=cross(dx,dy,sx,sy);if(Math.abs(div)>1e-10){const t=cross(qx,qy,sx,sy)/div,u=cross(qx,qy,dx,dy)/div;if(t>0&&t<1&&u>=0&&u<=1)ts.push(t)}else if(Math.abs(cross(qx,qy,dx,dy))<1e-8){for(const p of [a,b]){const t=((p[0]-w.x1)*dx+(p[1]-w.y1)*dy)/den;if(t>0&&t<1)ts.push(t)}}}const occupied=new Set((state.cells||[]).map(([x,y])=>key(x,y))),inside=t=>{const p={x:w.x1+dx*t,y:w.y1+dy*t};if(state.polygon)return outlines.some(poly=>pointInPolygon(p.x,p.y,poly)||poly.some((a,i)=>segmentPoint(p,a,poly[(i+1)%poly.length]).distance<1e-7));return [-1e-7,1e-7].some(ax=>[-1e-7,1e-7].some(ay=>occupied.has(key(Math.floor(p.x+ax),Math.floor(p.y+ay)))))};ts.sort((a,b)=>a-b);if(!inside(0)||!inside(1))return false;for(let i=1;i<ts.length;i++)if(ts[i]-ts[i-1]>1e-9&&!inside((ts[i]+ts[i-1])/2))return false;return true}
function nearestPolygonEdge(p,poly){let best=null;for(let i=0;i<poly.length;i++){let v=segmentPoint(p,poly[i],poly[(i+1)%poly.length]);if(!best||v.distance<best.distance)best={...v,index:i}}return best}
function rasterizePolygon(poly){const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),cells=[];let a=Math.floor(Math.min(...xs)),b=Math.ceil(Math.max(...xs)),c=Math.floor(Math.min(...ys)),d=Math.ceil(Math.max(...ys));if(b-a>100||d-c>100)return [];for(let y=c;y<d;y++)for(let x=a;x<b;x++)if(pointInPolygon(x+.5,y+.5,poly))cells.push([x,y]);return cells}
function cellOutlines(cells){
 const set=new Set(cells.map(([x,y])=>key(x,y))), edges=[];
 for(const [x,y] of cells){if(!set.has(key(x,y-1)))edges.push([[x,y],[x+1,y]]);if(!set.has(key(x+1,y)))edges.push([[x+1,y],[x+1,y+1]]);if(!set.has(key(x,y+1)))edges.push([[x+1,y+1],[x,y+1]]);if(!set.has(key(x-1,y)))edges.push([[x,y+1],[x,y]])}
 const starts=new Map();edges.forEach((e,i)=>{const k=e[0].join(',');if(!starts.has(k))starts.set(k,[]);starts.get(k).push(i)});
 const seen=new Set(),out=[];
 for(let i=0;i<edges.length;i++){if(seen.has(i))continue;let at=i,path=[],limit=edges.length+1;while(!seen.has(at)&&limit--){seen.add(at);let e=edges[at];path.push(e[0]);let next=(starts.get(e[1].join(','))||[]).find(n=>!seen.has(n));if(next===undefined)break;at=next}if(path.length>=4){path=path.filter((p,i)=>{const a=path[(i+path.length-1)%path.length],b=path[(i+1)%path.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0])});if(path.length>=3)out.push(path)}}return out;
}
function validPolygon(poly){if(!Array.isArray(poly)||poly.length<3||poly.length>300||poly.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>100))||Math.abs(polygonArea(poly))<.25)return false;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(Math.hypot(b[0]-a[0],b[1]-a[1])<.008)return false;for(let j=i+1;j<poly.length;j++){if(j===i||j===(i+1)%poly.length||(j+1)%poly.length===i)continue;const c=poly[j],d=poly[(j+1)%poly.length],u=cross(a,b,c),v=cross(a,b,d),w=cross(c,d,a),z=cross(c,d,b);if(u*v<=0&&w*z<=0&&Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1])))return false}}
 return rasterizePolygon(poly).length>0;
}
// Intersect a simple room boundary with a rectangular brush without turning
// existing diagonal walls into grid steps. Reject holes and disconnected rooms.
function brushPolygon(poly,rect,add){
 const box=[[rect.x0,rect.y0],[rect.x1,rect.y0],[rect.x1,rect.y1],[rect.x0,rect.y1]], cross=(a,b)=>a[0]*b[1]-a[1]*b[0], sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], eps=1e-8;
 const edges=shape=>shape.map((a,i)=>({a,b:shape[(i+1)%shape.length],cuts:[0,1]})), first=edges(poly),second=edges(box);
 function cutAt(edge,point){const d=sub(edge.b,edge.a),len=d[0]*d[0]+d[1]*d[1],t=((point[0]-edge.a[0])*d[0]+(point[1]-edge.a[1])*d[1])/len;if(t>-eps&&t<1+eps)edge.cuts.push(Math.max(0,Math.min(1,t)))}
 for(const e of first)for(const f of second){const r=sub(e.b,e.a),s=sub(f.b,f.a),q=sub(f.a,e.a),den=cross(r,s);if(Math.abs(den)>eps){const t=cross(q,s)/den,u=cross(q,r)/den;if(t>=-eps&&t<=1+eps&&u>=-eps&&u<=1+eps){e.cuts.push(Math.max(0,Math.min(1,t)));f.cuts.push(Math.max(0,Math.min(1,u)))}}else if(Math.abs(cross(q,r))<eps){cutAt(e,f.a);cutAt(e,f.b);cutAt(f,e.a);cutAt(f,e.b)}}
 const inside=(x,y)=>{const room=pointInPolygon(x,y,poly),brush=x>rect.x0&&x<rect.x1&&y>rect.y0&&y<rect.y1;return add?(room||brush):(room&&!brush)};
 const quant=p=>p.map(n=>Math.round(n*1e7)/1e7), pkey=p=>p.join(','), parts=new Map();
 for(const e of [...first,...second]){const d=sub(e.b,e.a),len=Math.hypot(...d),cuts=[...new Set(e.cuts.map(n=>Math.round(n*1e10)/1e10))].sort((a,b)=>a-b);for(let i=0;i<cuts.length-1;i++){const lo=cuts[i],hi=cuts[i+1];if((hi-lo)*len<1e-6)continue;let a=quant([e.a[0]+d[0]*lo,e.a[1]+d[1]*lo]),b=quant([e.a[0]+d[0]*hi,e.a[1]+d[1]*hi]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],normal=[-d[1]/len*1e-5,d[0]/len*1e-5],left=inside(m[0]+normal[0],m[1]+normal[1]),right=inside(m[0]-normal[0],m[1]-normal[1]);if(left===right)continue;if(!left)[a,b]=[b,a];parts.set(pkey(a)+'|'+pkey(b),[a,b])}}
 const remaining=[...parts.values()],outgoing=new Map();for(const edge of remaining){const k=pkey(edge[0]);if(!outgoing.has(k))outgoing.set(k,[]);outgoing.get(k).push(edge)}
 if(!remaining.length||[...outgoing.values()].some(v=>v.length!==1))return null;
 let edge=remaining[0],start=pkey(edge[0]),path=[],seen=new Set();while(edge&&!seen.has(edge)){seen.add(edge);path.push(edge[0]);const end=pkey(edge[1]);if(end===start)break;edge=(outgoing.get(end)||[])[0]}
 if(!edge||pkey(edge[1])!==start||seen.size!==remaining.length)return null;
 path=path.filter((p,i)=>{const a=path[(i+path.length-1)%path.length],b=path[(i+1)%path.length];return Math.abs(cross(sub(p,a),sub(b,p)))>1e-7});
 return validPolygon(path)?path:null;
}
function openingPosition(o,poly){if(poly&&Number.isInteger(o.edgeIndex)&&poly[o.edgeIndex]){let a=poly[o.edgeIndex],b=poly[(o.edgeIndex+1)%poly.length],t=Math.max(0,Math.min(1,o.t??.5));return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])}}const n=N[o.side]||N.top;return{x:o.x+.5+n[0]*.5,y:o.y+.5+n[1]*.5,angle:{top:0,right:Math.PI/2,bottom:Math.PI,left:-Math.PI/2}[o.side]||0}}
function openingForPolygon(o,poly){const p=openingPosition(o),edge=nearestPolygonEdge(p,poly);return {...o,edgeIndex:edge.index,t:edge.t}}
// Curved edges are sampled into the same polygon used by the floor, openings,
// export and layout engine. roomVertices retains the draggable wall endpoints.
function curvePoints(a,b,curve){
 const center=curve&&curve.center;if(!center||!center.every(Number.isFinite))return [];
 const [cx,cy]=center,r0=Math.hypot(a[0]-cx,a[1]-cy),r1=Math.hypot(b[0]-cx,b[1]-cy);if(r0<.01||r1<.01)return [];
 const t0=Math.atan2(a[1]-cy,a[0]-cx),t1=Math.atan2(b[1]-cy,b[0]-cx);let delta=((t1-t0+Math.PI*3)%(Math.PI*2))-Math.PI;
 if(curve.direction>0&&delta<0)delta+=Math.PI*2;if(curve.direction<0&&delta>0)delta-=Math.PI*2;
 if(Math.abs(delta)>Math.PI*1.9)return [];
 const count=Math.max(4,Math.min(22,Math.ceil(Math.abs(delta)*7))),out=[];
 for(let j=1;j<count;j++){const t=j/count,r=r0+(r1-r0)*t,angle=t0+delta*t;out.push([cx+Math.cos(angle)*r,cy+Math.sin(angle)*r])}return out;
}
function outlineFromWalls(vertices,curves){const points=[],edgeMap=[];for(let i=0;i<vertices.length;i++){points.push(vertices[i].slice());edgeMap.push(i);const extra=curvePoints(vertices[i],vertices[(i+1)%vertices.length],curves?.[i]);for(const p of extra){points.push(p);edgeMap.push(i)}}return {points,edgeMap}}
// A window is measured along one entire wall, including its sampled curve.
function windowRun(state,opening){
 let poly=state.polygon,edge=opening.edgeIndex,t=opening.t;
 if(!poly){const outlines=cellOutlines(state.cells);if(outlines.length!==1)return null;poly=outlines[0];const near=nearestPolygonEdge(openingPosition(opening),poly);edge=near.index;t=near.t}
 if(!Number.isInteger(edge)||!poly[edge])return null;
 let first=edge,last=edge;if(state.roomVertices){const curves=state.wallCurves||{},map=outlineFromWalls(state.roomVertices,curves).edgeMap,base=map[edge],group=curves[base]?.group,same=i=>map[i]===base||(group&&curves[map[i]]?.group===group);while(first>0&&same(first-1))first--;while(last+1<map.length&&same(last+1))last++}
 const segments=[];let length=0,center=0;for(let i=first;i<=last;i++){const a=poly[i],b=poly[(i+1)%poly.length],size=Math.hypot(b[0]-a[0],b[1]-a[1]);if(i===edge)center=length+size*Math.max(0,Math.min(1,t??.5));segments.push({a,b,index:i,at:length,size});length+=size}
 if(length<.001)return null;const width=Math.min(length,Number(opening.width)||1);let start=Math.max(0,center-width/2),end=Math.min(length,center+width/2);if(end-start<width){start=Math.max(0,Math.min(start,length-width));end=start+width}return {segments,length,center,start,end};
}
function windowPoint(run,distance){const d=Math.max(0,Math.min(run.length,distance)),s=run.segments.find(seg=>d<=seg.at+seg.size+1e-8)||run.segments.at(-1),t=s.size?Math.max(0,Math.min(1,(d-s.at)/s.size)):0;return {x:s.a[0]+(s.b[0]-s.a[0])*t,y:s.a[1]+(s.b[1]-s.a[1])*t,index:s.index,t}}
function windowProject(run,p){let best=null;for(const s of run.segments){const hit=segmentPoint(p,s.a,s.b);if(!best||hit.distance<best.distance)best={distance:hit.distance,at:s.at+hit.t*s.size}}return best}
function windowPath(run){const points=[windowPoint(run,run.start)];for(const s of run.segments){const d=s.at+s.size;if(d>run.start+1e-8&&d<run.end-1e-8)points.push(windowPoint(run,d))}points.push(windowPoint(run,run.end));return points}
// The true curve center can be far beyond the viewport for a shallow arc.
// Keep a draggable proxy at the canvas edge while retaining the true center.
function curveCenterProxy(center,view){
 const x=center[0]*view.scale+view.ox,y=center[1]*view.scale+view.oy,m=Math.min(24,view.width/4,view.height/4),px=Math.max(m,Math.min(view.width-m,x)),py=Math.max(m,Math.min(view.height-m,y));
 return {point:[(px-view.ox)/view.scale,(py-view.oy)/view.scale],clipped:px!==x||py!==y,dx:x-px,dy:y-py};
}
function arrowForOffset(dx,dy){const arrows=['→','↘','↓','↙','←','↖','↑','↗'];return arrows[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8]}
function circleFromBulge(a,b,p){
 const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<.1)return null;
 const nx=-dy/length,ny=dx/length,sag=(p.x-mx)*nx+(p.y-my)*ny;if(Math.abs(sag)<.08)return null;
 const h=(sag*sag-length*length/4)/(2*sag),center=[mx+nx*h,my+ny*h],start=Math.atan2(a[1]-center[1],a[0]-center[0]),end=Math.atan2(b[1]-center[1],b[0]-center[0]);
 let short=((end-start+Math.PI*3)%(Math.PI*2))-Math.PI;const candidates=[short,short+Math.PI*2,short-Math.PI*2].filter(x=>Math.abs(x)<Math.PI*1.9);
 const mid=[mx+nx*sag,my+ny*sag],r=Math.hypot(a[0]-center[0],a[1]-center[1]);let best=candidates[0],dist=Infinity;
 for(const d of candidates){let x=center[0]+Math.cos(start+d/2)*r,y=center[1]+Math.sin(start+d/2)*r,v=Math.hypot(x-mid[0],y-mid[1]);if(v<dist){dist=v;best=d}}
 return {center,direction:Math.sign(best)||1};
}
export class RoomCanvas {
 constructor(canvas,options={}){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.options=options;this.state=getDefaultState();this.tool='select';this.selected=null;this.grid=true;this.light=true;this.drag=null;this.view=null;this.snap=.25;this.pointers=new Map();this.pinch=null;this.curveMode=null;this.hold=null;this.wallStart=null;this.tracePoints=[];this.traceActive=false;this.traceImage=null;this.traceSource=null;
  this.onPointerDown=this.onPointerDown.bind(this);this.onPointerMove=this.onPointerMove.bind(this);this.onPointerUp=this.onPointerUp.bind(this);this.onWheel=this.onWheel.bind(this);
  canvas.style.touchAction='none';canvas.addEventListener('pointerdown',this.onPointerDown);canvas.addEventListener('pointermove',this.onPointerMove);canvas.addEventListener('pointerup',this.onPointerUp);canvas.addEventListener('pointercancel',this.onPointerUp);canvas.addEventListener('wheel',this.onWheel,{passive:false});
  this.resizeObserver=new ResizeObserver(()=>this.fit());this.resizeObserver.observe(canvas.parentElement||canvas);this.fit();
 }
 emit(){this.options.onChange?.(this.getState())}
 notice(message){this.options.onNotice?.(message)}
 selectedChanged(){this.options.onSelect?.(this.state.items.find(i=>i.id===this.selected)||this.state.openings.find(i=>i.id===this.selected)||(this.state.interiorWalls||[]).find(i=>i.id===this.selected)||null)}
 traceChanged(){this.options.onTraceChange?.({active:this.traceActive,count:this.tracePoints.length,reference:!!this.state.traceReference})}
 getTraceInfo(){return {active:this.traceActive,count:this.tracePoints.length,reference:this.state.traceReference?{...this.state.traceReference,imageData:undefined}:null}}
 traceImageFor(reference){
  if(!reference)return null;if(this.traceSource===reference.imageData)return this.traceImage?.complete&&this.traceImage.naturalWidth?this.traceImage:null;
  this.traceSource=reference.imageData;const image=new Image();this.traceImage=image;image.onload=()=>{if(this.traceImage===image)this.draw()};image.onerror=()=>{if(this.traceImage===image)this.notice('The floor plan image could not be displayed.')};image.src=reference.imageData;return null;
 }
 async waitForTraceImage(){const ref=this.state.traceReference;if(!ref||!ref.visible)return;this.traceImageFor(ref);const image=this.traceImage;if(!image)throw new Error('The floor plan image could not be opened.');if(!image.complete)await new Promise((resolve,reject)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',()=>reject(new Error('The floor plan image could not be opened.')),{once:true})});if(!image.naturalWidth)throw new Error('The floor plan image could not be opened.');}
 setTraceReference(data,pixelWidth,pixelHeight){
  if(typeof data!=='string'||data.length>2500000||!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(data)||!Number.isFinite(pixelWidth)||!Number.isFinite(pixelHeight)||pixelWidth<=0||pixelHeight<=0){this.notice('Choose a supported PNG, JPG or WebP floor plan.');return false}
  const b=this.bounds(),rw=b.maxX-b.minX+1,rh=b.maxY-b.minY+1,ratio=pixelWidth/pixelHeight;let w=rw,h=w/ratio;if(h>rh){h=rh;w=h*ratio}w=Math.max(.1,w);h=Math.max(.1,h);
  this.state.traceReference={imageData:data,x:(b.minX+b.maxX+1-w)/2,y:(b.minY+b.maxY+1-h)/2,w,h,opacity:.65,visible:true};this.traceSource=null;this.traceImage=null;this.fitTraceReference();this.emit();this.traceChanged();return true
 }
 setTraceOptions(changes){const ref=this.state.traceReference;if(!ref||!changes)return false;const next={...ref};
  if(changes.opacity!==undefined){const n=Number(changes.opacity);if(!Number.isFinite(n)||n<0||n>1)return false;next.opacity=n}
  if(changes.visible!==undefined)next.visible=!!changes.visible;
  if(changes.width!==undefined){const n=Number(changes.width),h=ref.h*n/ref.w;if(!Number.isFinite(n)||n<.1||n>200||h<.1||h>200)return false;next.h=h;next.w=n}
  this.state.traceReference=next;this.draw();this.emit();this.traceChanged();return true
 }
 clearTraceReference(){delete this.state.traceReference;this.traceSource=null;this.traceImage=null;if(this.traceActive)this.cancelTrace();if(this.tool==='trace-move'){this.tool='select';this.options.onToolChange?.('select')}this.draw();this.emit();this.traceChanged()}
 fitTraceReference(){const r=this.state.traceReference;if(!r||!this.view)return;const v=this.view;v.scale=Math.max(4,Math.min((v.width-80)/(r.w+2),(v.height-70)/(r.h+2),38));v.ox=(v.width-r.w*v.scale)/2-r.x*v.scale;v.oy=(v.height-r.h*v.scale)/2-r.y*v.scale;this.draw()}
 startTrace(){if(!this.state.traceReference){this.notice('Add a floor plan image first.');return false}this.traceActive=true;this.tracePoints=[];this.selected=null;this.selectedChanged();this.tool='trace-room';this.options.onToolChange?.('trace-room');this.traceChanged();this.fitTraceReference();return true}
 undoTracePoint(){if(!this.traceActive||!this.tracePoints.length)return false;this.tracePoints.pop();this.draw();this.traceChanged();return true}
 cancelTrace(){if(!this.traceActive)return;this.traceActive=false;this.tracePoints=[];this.tool='select';this.options.onToolChange?.('select');this.draw();this.traceChanged()}
 finishTrace(){if(!this.traceActive)return false;const poly=copy(this.tracePoints);if(!validPolygon(poly)){this.notice('Add at least three corners around a single, non-crossing room.');return false}const old=this.state.polygon,positions=this.state.openings.map(o=>openingPosition(o,old));this.state.polygon=poly;delete this.state.roomVertices;delete this.state.wallCurves;this.state.openings=this.state.openings.map((o,i)=>{const e=nearestPolygonEdge(positions[i],poly);return {...o,edgeIndex:e.index,t:e.t}});this.syncCells();this.traceActive=false;this.tracePoints=[];this.tool='select';this.options.onToolChange?.('select');this.fit();this.emit();this.traceChanged();this.notice('Room traced. Existing openings were moved to the nearest wall.');return true}
 getRoomPolygon(){if(this.state.polygon)return copy(this.state.polygon);const outlines=cellOutlines(this.state.cells);return outlines.length===1?copy(outlines[0]):null}
 ensurePolygon(){if(this.state.polygon)return true;const outlines=cellOutlines(this.state.cells);if(outlines.length!==1){this.notice('The room needs one connected outline before its corners can be edited.');return false}this.state.polygon=outlines[0];this.state.openings=this.state.openings.map(o=>openingForPolygon(o,this.state.polygon));return true}
 baseWalls(){return this.state.roomVertices||this.state.polygon||this.getRoomPolygon()||[]}
 mappedEdge(index){if(!this.state.roomVertices)return index;return outlineFromWalls(this.state.roomVertices,this.state.wallCurves||{}).edgeMap[index]}
 insertWallCorner(edge){
  const i=edge.baseIndex,vertices=copy(this.baseWalls()),curve=this.state.wallCurves?.[i];let q;
  if(curve&&this.state.roomVertices){
   const map=outlineFromWalls(this.state.roomVertices,this.state.wallCurves).edgeMap,first=map.indexOf(i),last=map.lastIndexOf(i),count=last-first+1,t=(edge.index-first+edge.t)/count;
   if(first<0||t<=.001||t>=.999){this.notice('Choose a spot farther from the corner.');return false}
   const a=vertices[i],b=vertices[(i+1)%vertices.length],[cx,cy]=curve.center,r0=Math.hypot(a[0]-cx,a[1]-cy),r1=Math.hypot(b[0]-cx,b[1]-cy),t0=Math.atan2(a[1]-cy,a[0]-cx),t1=Math.atan2(b[1]-cy,b[0]-cx);let delta=((t1-t0+Math.PI*3)%(Math.PI*2))-Math.PI;if(curve.direction>0&&delta<0)delta+=Math.PI*2;if(curve.direction<0&&delta>0)delta-=Math.PI*2;
   const r=r0+(r1-r0)*t;q=[cx+Math.cos(t0+delta*t)*r,cy+Math.sin(t0+delta*t)*r];
  }else q=[Math.round(edge.x/this.snap)*this.snap,Math.round(edge.y/this.snap)*this.snap];
  vertices.splice(i+1,0,q);
  if(this.state.roomVertices){
   const old=copy(this.state.polygon),oldVertices=copy(this.state.roomVertices),oldOpenings=copy(this.state.openings),curves=this.state.wallCurves||{},shifted={};
   for(const [k,c] of Object.entries(curves))shifted[Number(k)>i?Number(k)+1:k]=copy(c);
   if(curve){const group=curve.group||id();shifted[i]={...copy(curve),group};shifted[i+1]={...copy(curve),group}}
   this.state.wallCurves=shifted;this.state.roomVertices=vertices;
   if(!this.refreshOutline(old)){this.state.wallCurves=curves;this.state.roomVertices=oldVertices;this.state.openings=oldOpenings;this.notice('Choose a spot farther from the corner.');return false}
  }else{
   if(!validPolygon(vertices)){this.notice('Choose a spot farther from the corner.');return false}
   for(const o of this.state.openings){if(o.edgeIndex===i){if(o.t<=edge.t)o.t=o.t/edge.t;else{o.edgeIndex++;o.t=(o.t-edge.t)/(1-edge.t)}}else if(o.edgeIndex>i)o.edgeIndex++}this.state.polygon=vertices;this.syncCells();
  }
  this.emit();return true;
 }
 refreshOutline(oldPoly){if(!this.state.roomVertices)return true;const old=oldPoly||this.state.polygon,positions=this.state.openings.map(o=>openingPosition(o,old));const next=outlineFromWalls(this.state.roomVertices,this.state.wallCurves||{}).points;if(!validPolygon(next))return false;this.state.polygon=next;this.state.openings=this.state.openings.map((o,i)=>{const e=nearestPolygonEdge(positions[i],next);return {...o,edgeIndex:e.index,t:e.t}});this.syncCells();return true}
 setCurveMode(edgeIndex){if(!this.ensurePolygon())return false;if(!this.state.roomVertices)this.state.roomVertices=copy(this.state.polygon);this.state.wallCurves||={};if(!Number.isInteger(edgeIndex)||edgeIndex<0||edgeIndex>=this.state.roomVertices.length)return false;this.curveMode=edgeIndex;this.tool='curve-room';this.selected=null;this.selectedChanged();this.options.onToolChange?.('curve-room');this.notice('Drag the highlighted wall to bend it. Drag the dotted center to adjust it.');this.draw();this.emit();return true}
 straightenCurve(edgeIndex=this.curveMode){if(!this.state.roomVertices||!Number.isInteger(edgeIndex))return false;const old=copy(this.state.polygon),saved=copy(this.state.wallCurves||{});delete this.state.wallCurves[edgeIndex];if(!this.refreshOutline(old)){this.state.wallCurves=saved;return false}this.curveMode=edgeIndex;this.draw();this.emit();return true}
 finishCurve(){this.curveMode=null;this.tool='select';this.options.onToolChange?.('select');this.draw()}
 editFloorRectangle(bounds,add=true){
  if(Object.keys(this.state.wallCurves||{}).length){this.notice('Straighten curved walls before adding or removing floor so their curves stay editable.');return false}
  const {x0,y0,x1,y1}=bounds||{};if(![x0,y0,x1,y1].every(Number.isFinite)||x0>=x1||y0>=y1||Math.max(Math.abs(x0),Math.abs(y0),Math.abs(x1),Math.abs(y1))>100){this.notice('Choose a smaller floor section.');return false}
  const old=this.state.polygon||this.getRoomPolygon();if(!old){this.notice('Connect the room into one outline first.');return false}
  const next=brushPolygon(old,{x0,y0,x1,y1},add);if(!next){this.notice(add?'Draw the new floor across an existing wall so it joins the room.':'That cut would split the room or leave a hole. Try a smaller cut.');return false}
  const positions=this.state.openings.map(o=>openingPosition(o,this.state.polygon));this.state.polygon=next;delete this.state.roomVertices;delete this.state.wallCurves;
  this.state.openings=this.state.openings.map((o,i)=>{const e=nearestPolygonEdge(positions[i],next);return {...o,edgeIndex:e.index,t:e.t}});this.syncCells();this.fit();this.emit();return true;
 }
 setTool(tool){
  if(tool==='shape-room'&&!this.state.polygon){if(!this.ensurePolygon())return false;this.emit()}
  if(tool!=='curve-room')this.curveMode=null;
  if(tool!=='interior-wall')this.wallStart=null;
  this.tool=tool;this.canvas.style.cursor=tool==='select'?'default':tool==='pan'?'grab':'crosshair';this.draw();return true
 }
 getState(){return copy(this.state)}
 setState(state){if(!state||typeof state!=='object'||!validInteriorWalls(state.interiorWalls))return false;if(state.interiorWalls?.length){const used=new Set([...(Array.isArray(state.items)?state.items:[]),...(Array.isArray(state.openings)?state.openings:[])].map(o=>o&&o.id));if(state.interiorWalls.some(w=>used.has(w.id)))return false;}if(state.polygon&&!validPolygon(state.polygon))return false;let cells=state.cells;if(cells===undefined&&state.polygon)cells=rasterizePolygon(state.polygon);if(!Array.isArray(cells)||!cells.length||cells.length>10000||!cells.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isInteger(n)&&Math.abs(n)<=100)))return false;const ref=state.traceReference;if(ref&&(!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(ref.imageData||'')||(ref.imageData||'').length>2500000||![ref.x,ref.y,ref.w,ref.h,ref.opacity].every(Number.isFinite)||ref.w<.1||ref.h<.1||ref.w>200||ref.h>200||ref.opacity<0||ref.opacity>1))return false;this.state=copy({...state,cells});this.state.items||=[];this.state.openings||=[];this.selected=null;this.curveMode=null;this.wallStart=null;this.traceActive=false;this.tracePoints=[];this.traceSource=null;this.traceImage=null;this.traceChanged();if(this.tool==='curve-room'||this.tool==='trace-room'||this.tool==='trace-move'||(this.tool==='shape-room'&&!this.state.polygon)){this.tool='select';this.options.onToolChange?.('select')}this.fit();this.selectedChanged();this.emit();return true}
 reset(){this.setState(getDefaultState())}
 setGrid(v){this.grid=!!v;this.draw()}
 setLight(v){this.light=!!v;this.draw()}
 setSunAngle(v){this.state.sunAngle=((Number(v)%360)+360)%360;this.draw();this.emit()}
 setSnap(v){const n=Number(v);if(Number.isFinite(n)&&n>=.05&&n<=1)this.snap=n}
 selectItem(itemId){this.selected=itemId||null;this.selectedChanged();this.draw()}
 applyWindowSpan(opening,run,start,end){const mid=windowPoint(run,(start+end)/2);opening.edgeIndex=mid.index;opening.t=mid.t;opening.width=end-start}
 setOpeningWidth(width){if(!Number.isFinite(width)||width<=0||width>100)return false;let opening=this.state.openings.find(o=>o.id===this.selected&&o.type==='window');if(!opening||!this.ensurePolygon())return false;opening=this.state.openings.find(o=>o.id===this.selected);const run=windowRun(this.state,opening);if(!run)return false;const actual=Math.min(run.length,width),start=Math.max(0,Math.min(run.length-actual,run.center-actual/2));this.applyWindowSpan(opening,run,start,start+actual);this.draw();this.selectedChanged();this.emit();if(actual<width)this.notice('Window length is limited to this wall.');return true}
 addItem(type,position=null){const def=CATALOG[type];if(!def)return;const b=this.bounds();const x=position?.x??(b.minX+b.maxX+1)/2,y=position?.y??(b.minY+b.maxY+1)/2;const snap=n=>Math.round(n/this.snap)*this.snap;const o={id:id(),type,x:snap(x),y:snap(y),rotation:0};if(type==='rug')this.state.items.unshift(o);else this.state.items.push(o);this.selected=o.id;this.tool='select';this.selectedChanged();this.draw();this.emit();return o}
 rotateSelected(){const item=this.state.items.find(i=>i.id===this.selected);if(item){item.rotation=((item.rotation||0)+90)%360;this.draw();this.emit();this.selectedChanged()}}
 updateSelected(changes){const o=this.state.items.find(i=>i.id===this.selected);if(!o||!changes||typeof changes!=='object')return false;for(const k of ['w','h'])if(changes[k]!==undefined){let n=Number(changes[k]);if(!Number.isFinite(n)||n<.1||n>100)return false}if(changes.rotation!==undefined&&!Number.isFinite(Number(changes.rotation)))return false;for(const k of ['w','h'])if(changes[k]!==undefined)o[k]=Number(changes[k]);if(changes.rotation!==undefined)o.rotation=((Number(changes.rotation)%360)+360)%360;if(typeof changes.name==='string')o.name=changes.name.slice(0,80);if(typeof changes.color==='string'&&/^#[0-9a-f]{6}$/i.test(changes.color))o.color=changes.color;this.draw();this.selectedChanged();this.emit();return true}
 deleteSelected(){if(!this.selected)return;this.state.items=this.state.items.filter(i=>i.id!==this.selected);this.state.openings=this.state.openings.filter(i=>i.id!==this.selected);if(this.state.interiorWalls)this.state.interiorWalls=this.state.interiorWalls.filter(i=>i.id!==this.selected);this.selected=null;this.selectedChanged();this.draw();this.emit()}
 cancelInteriorWall(){this.wallStart=null;this.drag=null;this.draw()}
 wallPoint(p){const snap=n=>Math.round(n/this.snap)*this.snap;return{x:snap(p.x),y:snap(p.y)}}
 wallEnd(a,b){return Math.abs(b.x-a.x)>=Math.abs(b.y-a.y)?{x:b.x,y:a.y}:{x:a.x,y:b.y}}
 addInteriorWall(a,b){const end=this.wallEnd(a,b),walls=this.state.interiorWalls||[],used=new Set([...this.state.items,...this.state.openings,...walls].map(i=>i.id));let next;do next='wall-'+id();while(used.has(next));const wall={id:next,type:'interior-wall',x1:a.x,y1:a.y,x2:end.x,y2:end.y};if(!validInteriorWalls([...walls,wall])){this.notice('Draw a wall at least one grid step long.');return false}if(!interiorWallFits(this.state,wall)){this.notice('Keep the entire wall on the floor. Try a shorter wall.');return false}this.state.interiorWalls=[...walls,wall];this.selected=wall.id;this.selectedChanged();this.draw();this.emit();return true}
 bounds(){const poly=this.state.polygon;if(poly&&poly.length){let xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return{minX:Math.min(...xs),minY:Math.min(...ys),maxX:Math.max(...xs)-1,maxY:Math.max(...ys)-1}}let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const [x,y] of this.state.cells){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}return {minX,minY,maxX,maxY}}
 fit(){const rect=this.canvas.getBoundingClientRect(),width=rect.width||700,height=rect.height||500,dpr=window.devicePixelRatio||1;this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);const b=this.bounds(),rw=b.maxX-b.minX+1,rh=b.maxY-b.minY+1,scale=Math.max(4,Math.min((width-80)/(rw+2),(height-70)/(rh+2),38));this.view={width,height,dpr,scale,ox:(width-rw*scale)/2-b.minX*scale,oy:(height-rh*scale)/2-b.minY*scale};this.draw()}
 zoomBy(factor,center=null){if(!this.view)return;const v=this.view,x=center?.x??v.width/2,y=center?.y??v.height/2,wx=(x-v.ox)/v.scale,wy=(y-v.oy)/v.scale;v.scale=Math.max(5,Math.min(240,v.scale*factor));v.ox=x-wx*v.scale;v.oy=y-wy*v.scale;this.draw()}
 point(e){const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left-this.view.ox)/this.view.scale,y:(e.clientY-r.top-this.view.oy)/this.view.scale}}
 screenPoint(e){const r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 onWheel(e){e.preventDefault();this.zoomBy(Math.exp(-e.deltaY*.0015),this.screenPoint(e))}
 edgeAt(p){if(this.state.polygon){let e=nearestPolygonEdge(p,this.state.polygon);return e&&e.distance<Math.max(.4,14/this.view.scale)?e:null}let best=null;const cells=new Set(this.state.cells.map(([x,y])=>key(x,y)));for(const [x,y] of this.state.cells){for(const side of SIDES){const [dx,dy]=N[side];if(cells.has(key(x+dx,y+dy)))continue;let px,py;if(side==='top'||side==='bottom'){px=Math.max(x,Math.min(x+1,p.x));py=y+(side==='bottom'?1:0)}else{px=x+(side==='right'?1:0);py=Math.max(y,Math.min(y+1,p.y))}const d=Math.hypot(p.x-px,p.y-py);if(d<Math.max(.4,14/this.view.scale)&&(!best||d<best.distance))best={x,y,side,distance:d}}}return best}
 cornerAt(p){const poly=this.baseWalls();let best=null;for(let i=0;i<poly.length;i++){let d=Math.hypot(p.x-poly[i][0],p.y-poly[i][1]);if(d<Math.max(.28,16/this.view.scale)&&(!best||d<best.distance))best={index:i,distance:d}}return best}
 syncCells(){if(this.state.polygon){const c=rasterizePolygon(this.state.polygon);if(c.length)this.state.cells=c}}
 cancelHold(){if(this.hold){clearTimeout(this.hold.timer);this.hold=null}}
 armHold(e,item,edge){if(!item&&!edge)return;this.cancelHold();const screen=this.screenPoint(e),pointer=e.pointerId;this.hold={pointer,screen,timer:setTimeout(()=>{if(!this.hold||this.hold.pointer!==pointer||this.pointers.size!==1)return;this.hold=null;this.drag=null;if(item){this.selected=item.id;this.selectedChanged();this.draw();this.options.onObjectMenu?.(copy(item),screen)}else{if(!this.ensurePolygon())return;const closest=this.edgeAt(this.point(e));if(!closest)return;const index=this.mappedEdge(closest.index);this.options.onWallMenu?.({x:screen.x,y:screen.y,edgeIndex:index,curved:!!this.state.wallCurves?.[index]})}},600)}}
 onPointerDown(e){if(e.button!==0)return;this.pointers.set(e.pointerId,this.screenPoint(e));this.canvas.setPointerCapture(e.pointerId);
  if(this.pointers.size===2){this.cancelHold();if(this.drag?.kind==='vertex'||this.drag?.kind==='edge'){this.state.polygon=this.drag.originalPoly;if(this.state.roomVertices)this.state.roomVertices=this.drag.original;if(this.drag.originalOpenings)this.state.openings=this.drag.originalOpenings}else if(this.drag?.kind==='curve-center'||this.drag?.kind==='curve-bend')this.state=copy(this.drag.original);else if(this.drag?.kind==='window-resize'){const i=this.state.openings.findIndex(o=>o.id===this.drag.id);if(i>=0)this.state.openings[i]=this.drag.original}const [a,b]=[...this.pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},v=this.view;this.pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale:v.scale,wx:(mid.x-v.ox)/v.scale,wy:(mid.y-v.oy)/v.scale};this.drag=null;return}if(this.pointers.size>1)return;
  const p=this.point(e),snap=n=>Math.round(n/this.snap)*this.snap;
  if(this.tool==='pan'){this.drag={kind:'pan',start:this.screenPoint(e),ox:this.view.ox,oy:this.view.oy};return}
  if(this.tool==='trace-room'&&this.traceActive){this.drag={kind:'trace-point',point:p,screen:this.screenPoint(e),moved:false};return}
  if(this.tool==='trace-move'&&this.state.traceReference){const r=this.state.traceReference,corner=Math.hypot(p.x-(r.x+r.w),p.y-(r.y+r.h))<Math.max(.3,18/this.view.scale);if(corner)this.drag={kind:'trace-resize',start:p,original:copy(r),moved:false};else if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h)this.drag={kind:'trace-move-ref',start:p,original:copy(r),moved:false};return}
  if(this.tool==='interior-wall'){this.drag={kind:'interior-wall',start:this.wallStart||this.wallPoint(p),end:this.wallPoint(p),screen:this.screenPoint(e),moved:false};this.draw();return}
  if(['draw-rect','draw-ellipse','draw-freehand','draw-pillar'].includes(this.tool)){this.drag={kind:'shape',shape:this.tool.slice(5),start:p,end:p,points:[p]};this.draw();return}
  if(this.tool==='curve-room'&&this.curveMode!==null){const i=this.curveMode,vertices=this.baseWalls(),a=vertices[i],b=vertices[(i+1)%vertices.length],curve=this.state.wallCurves?.[i];if(curve){const proxy=curveCenterProxy(curve.center,this.view).point;if(Math.hypot(p.x-proxy[0],p.y-proxy[1])<Math.max(.3,18/this.view.scale)){this.drag={kind:'curve-center',index:i,original:copy(this.state),start:p,moved:false};return}}const corner=this.cornerAt(p);if(corner){this.drag={kind:'vertex',index:corner.index,original:copy(this.baseWalls()),originalPoly:copy(this.state.polygon),originalOpenings:copy(this.state.openings),moved:false};return}const edge=this.edgeAt(p),target=edge&&this.mappedEdge(edge.index),group=curve?.group;if(edge&&(target===i||(group&&this.state.wallCurves?.[target]?.group===group))){this.curveMode=target;edge.baseIndex=target;this.armHold(e,null,edge);this.drag={kind:'curve-bend',index:target,edge,original:copy(this.state),start:p,screen:this.screenPoint(e),moved:false,attempted:false};return}return}
  if(this.tool==='shape-room'){const corner=this.cornerAt(p);if(corner){this.drag={kind:'vertex',index:corner.index,original:copy(this.baseWalls()),originalPoly:copy(this.state.polygon),originalOpenings:copy(this.state.openings),moved:false};return}const edge=this.edgeAt(p);if(edge){edge.baseIndex=this.mappedEdge(edge.index);this.armHold(e,null,edge);this.drag={kind:'edge',edge,original:copy(this.baseWalls()),originalPoly:copy(this.state.polygon),originalOpenings:copy(this.state.openings),start:p,moved:false};this.draw()}return}
  if(this.tool==='add-room'||this.tool==='erase-room'){this.drag={kind:this.tool,start:{x:Math.floor(p.x),y:Math.floor(p.y)},end:{x:Math.floor(p.x),y:Math.floor(p.y)}};this.draw();return}
  if(this.tool==='window'||this.tool==='door'){const edge=this.edgeAt(p);if(edge){let opening;if(this.state.polygon){const a=this.state.polygon[edge.index],b=this.state.polygon[(edge.index+1)%this.state.polygon.length],ang=Math.atan2(b[1]-a[1],b[0]-a[0]),side=Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang))?(Math.cos(ang)>0?'top':'bottom'):(Math.sin(ang)>0?'right':'left');opening={id:id(),type:this.tool,edgeIndex:edge.index,t:edge.t,x:Math.floor(edge.x),y:Math.floor(edge.y),side}}
   else opening={id:id(),type:this.tool,x:edge.x,y:edge.y,side:edge.side};this.state.openings.push(opening);this.selected=opening.id;if(opening.type==='window'){this.tool='select';this.options.onToolChange?.('select');this.notice('Drag either end of the window to stretch it along the wall.')}this.selectedChanged();this.draw();this.emit()}return}
  const selectedItem=this.state.items.find(o=>o.id===this.selected);if(selectedItem&&window.Furniture){const handle=window.Furniture.hitHandle(selectedItem,CATALOG,p,this.view.scale);if(handle==='delete'){this.deleteSelected();return}if(handle){this.drag={kind:'transform',id:selectedItem.id,transform:window.Furniture.startTransform(handle,selectedItem,CATALOG,p),moved:false};return}}
  const selectedWindow=this.tool==='select'&&this.state.openings.find(o=>o.id===this.selected&&o.type==='window');if(selectedWindow){let run=windowRun(this.state,selectedWindow);if(run){const a=windowPoint(run,run.start),b=windowPoint(run,run.end),da=Math.hypot(p.x-a.x,p.y-a.y),db=Math.hypot(p.x-b.x,p.y-b.y),radius=Math.max(.22,22/this.view.scale);if(Math.min(da,db)<radius&&this.ensurePolygon()){const opening=this.state.openings.find(o=>o.id===this.selected);run=windowRun(this.state,opening);this.drag={kind:'window-resize',id:opening.id,end:da<=db?'start':'end',start:run.start,finish:run.end,run,original:copy(opening),moved:false};return}}}
  // Corners can be dragged directly in the ordinary select tool.
  if(this.tool==='select'){const corner=this.cornerAt(p);if(corner&&this.ensurePolygon()){this.drag={kind:'vertex',index:corner.index,original:copy(this.baseWalls()),originalPoly:copy(this.state.polygon),originalOpenings:copy(this.state.openings),moved:false};return}}
  let opening=null;for(const o of this.state.openings){if(o.type==='window'){const run=windowRun(this.state,o);if(run){const pts=windowPath(run);if(pts.slice(1).some((q,i)=>segmentPoint(p,[pts[i].x,pts[i].y],[q.x,q.y]).distance<Math.max(.3,14/this.view.scale))){opening=o;break}}}else{const v=openingPosition(o,this.state.polygon);if(Math.hypot(p.x-v.x,p.y-v.y)<Math.max(.35,12/this.view.scale)){opening=o;break}}}if(opening){this.selected=opening.id;this.selectedChanged();this.draw();return}
  let found=null;for(let i=this.state.items.length-1;i>=0;i--){const o=this.state.items[i];if(window.Furniture?.hitItem(o,CATALOG,p)){found=o;break}}
  if(!found&&this.tool==='select'){const walls=this.state.interiorWalls||[],visibleAtPoint=this.state.polygon?(pointInPolygon(p.x,p.y,this.state.polygon)||nearestPolygonEdge(p,this.state.polygon)?.distance<.05):[-1e-5,1e-5].some(dx=>[-1e-5,1e-5].some(dy=>this.state.cells.some(([x,y])=>x===Math.floor(p.x+dx)&&y===Math.floor(p.y+dy))));if(visibleAtPoint){for(let i=walls.length-1;i>=0;i--){const w=walls[i];if(segmentPoint(p,[w.x1,w.y1],[w.x2,w.y2]).distance<Math.max(.2,14/this.view.scale)){this.selected=w.id;this.selectedChanged();this.draw();return}}}}
  this.selected=found?.id||null;this.selectedChanged();if(found){this.armHold(e,found,null);this.drag={kind:'item',id:found.id,dx:p.x-found.x,dy:p.y-found.y,moved:false};this.canvas.style.cursor='grabbing'}else{const edge=this.edgeAt(p);if(edge){this.armHold(e,null,edge);const i=this.mappedEdge(edge.index);if(this.tool==='select'&&this.state.wallCurves?.[i])this.drag={kind:'curve-insert',edge:{...edge,baseIndex:i},screen:this.screenPoint(e),moved:false}}}this.draw()
 }
 onPointerMove(e){if(this.hold&&this.hold.pointer===e.pointerId){const q=this.screenPoint(e);if(Math.hypot(q.x-this.hold.screen.x,q.y-this.hold.screen.y)>8)this.cancelHold()}if(this.pointers.has(e.pointerId))this.pointers.set(e.pointerId,this.screenPoint(e));if(this.pinch&&this.pointers.size>=2){const [a,b]=[...this.pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},d=Math.hypot(a.x-b.x,a.y-b.y);this.view.scale=Math.max(5,Math.min(240,this.pinch.scale*d/Math.max(1,this.pinch.distance)));this.view.ox=mid.x-this.pinch.wx*this.view.scale;this.view.oy=mid.y-this.pinch.wy*this.view.scale;this.draw();return}
  const p=this.point(e);if(!this.drag){this.canvas.style.cursor=this.tool==='select'?(this.edgeAt(p)?'pointer':'default'):this.tool==='pan'?'grab':'crosshair';return}
  if(this.drag.kind==='interior-wall'){const q=this.screenPoint(e);if(Math.hypot(q.x-this.drag.screen.x,q.y-this.drag.screen.y)>8)this.drag.moved=true;this.drag.end=this.wallPoint(p);this.draw();return}
  if(this.drag.kind==='trace-point'||this.drag.kind==='curve-insert'){const q=this.screenPoint(e);if(Math.hypot(q.x-this.drag.screen.x,q.y-this.drag.screen.y)>8)this.drag.moved=true;return}
  if(this.drag.kind==='trace-move-ref'){const d=this.drag,r=this.state.traceReference;r.x=d.original.x+p.x-d.start.x;r.y=d.original.y+p.y-d.start.y;d.moved=true;this.draw();return}
  if(this.drag.kind==='trace-resize'){const d=this.drag,r=this.state.traceReference,scale=Math.max(.05,Math.min(200/d.original.w,200/d.original.h,Math.max((p.x-d.original.x)/d.original.w,(p.y-d.original.y)/d.original.h)));r.w=d.original.w*scale;r.h=d.original.h*scale;d.moved=true;this.draw();return}
  if(this.drag.kind==='shape'){this.drag.end=p;if(this.drag.shape==='freehand'){const last=this.drag.points[this.drag.points.length-1];if(Math.hypot(p.x-last.x,p.y-last.y)>.04)this.drag.points.push(p)}this.draw();return}
  if(this.drag.kind==='transform'){const o=this.state.items.find(i=>i.id===this.drag.id);if(o){window.Furniture.moveTransform(this.drag.transform,o,CATALOG,p,this.snap);this.drag.moved=true;this.draw();this.selectedChanged()}return}
  if(this.drag.kind==='window-resize'){const d=this.drag,o=this.state.openings.find(i=>i.id===d.id);if(!o)return;const hit=windowProject(d.run,p);if(!hit)return;const at=Math.round(hit.at/this.snap)*this.snap,min=Math.min(.2,d.run.length);let start=d.start,end=d.finish;if(d.end==='start')start=Math.max(0,end-100,Math.min(end-min,at));else end=Math.min(d.run.length,start+100,Math.max(start+min,at));this.applyWindowSpan(o,d.run,start,end);d.moved=true;this.draw();this.selectedChanged();return}
  if(this.drag.kind==='pan'){const q=this.screenPoint(e);this.view.ox=this.drag.ox+q.x-this.drag.start.x;this.view.oy=this.drag.oy+q.y-this.drag.start.y;this.draw();return}
  if(this.drag.kind==='curve-bend'||this.drag.kind==='curve-center'){const d=this.drag;if(d.kind==='curve-bend'&&!d.attempted){const q=this.screenPoint(e);if(Math.hypot(q.x-d.screen.x,q.y-d.screen.y)<=8)return;d.attempted=true}const i=d.index,base=d.original.roomVertices,a=base[i],b=base[(i+1)%base.length];let curve;if(d.kind==='curve-bend')curve=circleFromBulge(a,b,p);else{const original=d.original.wallCurves[i];if(!original)return;let center=[original.center[0]+p.x-d.start.x,original.center[1]+p.y-d.start.y];for(const [j,other] of Object.entries(d.original.wallCurves)){if(Number(j)!==i&&other?.center&&Math.hypot(center[0]-other.center[0],center[1]-other.center[1])<16/this.view.scale){center=other.center.slice();break}}curve={...original,center}}d.proxyPoint=[p.x,p.y];this.state=copy(d.original);if(curve)this.state.wallCurves[i]=curve;else delete this.state.wallCurves[i];if(this.refreshOutline(d.original.polygon)){d.moved=true;this.draw()}else this.state=copy(d.original);return}
  if(this.drag.kind==='edge'){let dx=Math.round((p.x-this.drag.start.x)/this.snap)*this.snap,dy=Math.round((p.y-this.drag.start.y)/this.snap)*this.snap;if(dx||dy){let poly=copy(this.drag.original),i=this.drag.edge.baseIndex,j=(i+1)%poly.length;poly[i]=[poly[i][0]+dx,poly[i][1]+dy];poly[j]=[poly[j][0]+dx,poly[j][1]+dy];this.state.openings=copy(this.drag.originalOpenings);if(this.state.roomVertices){this.state.roomVertices=poly;if(this.refreshOutline(this.drag.originalPoly)){this.drag.moved=true;this.draw()}else{this.state.roomVertices=copy(this.drag.original);this.state.polygon=copy(this.drag.originalPoly);this.state.openings=copy(this.drag.originalOpenings)}}else if(validPolygon(poly)){this.state.polygon=poly;this.drag.moved=true;this.draw()}}return}
  if(this.drag.kind==='vertex'){const poly=copy(this.drag.original);poly[this.drag.index]=[Math.round(p.x/this.snap)*this.snap,Math.round(p.y/this.snap)*this.snap];this.state.openings=copy(this.drag.originalOpenings);if(this.state.roomVertices){this.state.roomVertices=poly;if(this.refreshOutline(this.drag.originalPoly)){this.drag.moved=true;this.draw()}else{this.state.roomVertices=copy(this.drag.original);this.state.polygon=copy(this.drag.originalPoly);this.state.openings=copy(this.drag.originalOpenings)}}else if(validPolygon(poly)){this.state.polygon=poly;this.drag.moved=true;this.draw()}return}
  if(this.drag.kind==='item'){const o=this.state.items.find(i=>i.id===this.drag.id);if(!o)return;o.x=Math.round((p.x-this.drag.dx)/this.snap)*this.snap;o.y=Math.round((p.y-this.drag.dy)/this.snap)*this.snap;this.drag.moved=true;this.draw()}
  else{this.drag.end={x:Math.floor(p.x),y:Math.floor(p.y)};this.draw()}
 }
 onPointerUp(e){this.cancelHold();this.pointers.delete(e.pointerId);if(this.pinch){if(this.pointers.size<2)this.pinch=null;return}if(!this.drag)return;const d=this.drag;this.drag=null;this.canvas.style.cursor=this.tool==='select'?'default':this.tool==='pan'?'grab':'crosshair';if(d.kind==='interior-wall'){if(e.type==='pointercancel'){this.draw();return}const end=this.wallPoint(this.point(e));if(!d.moved&&!this.wallStart){this.wallStart=d.start;this.notice('Now tap the other end, or drag to draw the wall.');this.draw();return}this.wallStart=null;this.addInteriorWall(d.start,end);this.draw();return}if(e.type==='pointercancel'&&!d.moved&&(d.kind==='curve-insert'||d.kind==='curve-bend'||(d.kind==='edge'&&this.state.wallCurves?.[d.edge.baseIndex]))){this.draw();return}if(d.kind==='pan')return;if(d.kind==='trace-point'){if(!d.moved){const p=d.point;if(this.tracePoints.length>=3&&Math.hypot(p.x-this.tracePoints[0][0],p.y-this.tracePoints[0][1])<Math.max(.25,14/this.view.scale)){this.finishTrace();return}if(this.tracePoints.length<300){this.tracePoints.push([Math.round(p.x*1000)/1000,Math.round(p.y*1000)/1000]);this.draw();this.traceChanged()}else this.notice('This room has reached the corner limit.')}return}if(d.kind==='trace-move-ref'||d.kind==='trace-resize'){if(d.moved)this.emit();this.traceChanged();this.draw();return}if(d.kind==='curve-bend'||d.kind==='curve-center'){if(d.moved)this.emit();else if(d.kind==='curve-bend'&&!d.attempted&&this.state.wallCurves?.[d.index])this.insertWallCorner(d.edge);this.draw();return}if(d.kind==='curve-insert'){if(!d.moved)this.insertWallCorner(d.edge);this.draw();return}if(d.kind==='edge'){if(d.moved){this.syncCells();this.emit()}else this.insertWallCorner(d.edge);this.draw();return}if(d.kind==='window-resize'){if(d.moved)this.emit();this.draw();return}if(d.kind==='transform'){if(d.moved)this.emit();this.draw();return}if(d.kind==='shape'){let shape=d.shape==='freehand'?window.Furniture.createFromPoints(d.points):window.Furniture.createFromBox(d.shape,d.start,d.end);if(shape){shape.id=id();this.state.items.push(shape);this.selected=shape.id;this.tool='select';this.selectedChanged();this.emit();this.options.onToolChange?.('select');this.notice('Custom piece added. Select it to adjust its size or angle.')}else this.notice('Drag a little farther to draw a shape.');this.draw();return}if(d.kind==='vertex'){if(d.moved){this.syncCells();this.emit()}this.draw();return}if(d.kind==='item'){if(d.moved)this.emit();this.draw();return}
  const minX=Math.max(-50,Math.min(d.start.x,d.end.x)),maxX=Math.min(50,Math.max(d.start.x,d.end.x)),minY=Math.max(-50,Math.min(d.start.y,d.end.y)),maxY=Math.min(50,Math.max(d.start.y,d.end.y));if(maxX-minX>40||maxY-minY>40){this.draw();return}
  if(this.state.polygon){this.editFloorRectangle({x0:minX,y0:minY,x1:maxX+1,y1:maxY+1},d.kind==='add-room');this.draw();return}
  const cells=new Set(this.state.cells.map(([x,y])=>key(x,y)));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){if(d.kind==='add-room')cells.add(key(x,y));else cells.delete(key(x,y))}if(cells.size){this.state.cells=[...cells].map(s=>s.split(',').map(Number));this.state.openings=this.state.openings.filter(o=>{const n=N[o.side];return cells.has(key(o.x,o.y))&&!cells.has(key(o.x+n[0],o.y+n[1]))});this.fit();this.emit()}else this.draw()
 }
 draw(){if(!this.view)return;const c=this.ctx,v=this.view;c.setTransform(v.dpr,0,0,v.dpr,0,0);c.clearRect(0,0,v.width,v.height);c.fillStyle='#f2eee7';c.fillRect(0,0,v.width,v.height);c.fillStyle='#dcd5c9';for(let x=15;x<v.width;x+=22)for(let y=15;y<v.height;y+=22){c.beginPath();c.arc(x,y,1,0,Math.PI*2);c.fill()}
  c.save();c.translate(v.ox,v.oy);c.scale(v.scale,v.scale);const poly=this.state.polygon,cells=new Set(this.state.cells.map(([x,y])=>key(x,y))),bounds=this.bounds();
  const reference=this.state.traceReference,showReference=reference&&(reference.visible||this.tool==='trace-room'||this.tool==='trace-move');
  if(showReference){const image=this.traceImageFor(reference);if(image){c.save();c.globalAlpha=reference.opacity;c.drawImage(image,reference.x,reference.y,reference.w,reference.h);c.restore()}}
  if(this.tool==='trace-room'&&this.traceActive){if(this.tracePoints.length){c.save();c.lineWidth=2/v.scale;c.strokeStyle='#3d7357';c.fillStyle='rgba(126,185,142,.20)';c.beginPath();this.tracePoints.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(this.tracePoints.length>=3){c.closePath();c.fill()}c.stroke();for(let i=0;i<this.tracePoints.length;i++){const [x,y]=this.tracePoints[i];circle(c,x,y,(i===0?8:6)/v.scale,i===0?'#d58a69':'#527d65','#fff',2/v.scale)}c.restore()}c.restore();return}
  if(this.tool==='trace-move'&&reference){c.save();c.strokeStyle='#447b60';c.lineWidth=2/v.scale;c.setLineDash([5/v.scale,4/v.scale]);c.strokeRect(reference.x,reference.y,reference.w,reference.h);c.setLineDash([]);circle(c,reference.x+reference.w,reference.y+reference.h,8/v.scale,'#fffefa','#447b60',2/v.scale);c.restore();c.restore();return}
  if(showReference)c.globalAlpha=.32;
  function roomPath(){c.beginPath();if(poly){c.moveTo(poly[0][0],poly[0][1]);for(const p of poly.slice(1))c.lineTo(p[0],p[1]);c.closePath()}else for(const [x,y] of cellsArray)c.rect(x,y,1,1)}const cellsArray=this.state.cells;
  roomPath();c.save();c.shadowColor='rgba(88,70,55,.13)';c.shadowBlur=.35;c.shadowOffsetY=.15;c.fillStyle='#e7c9a9';c.fill();c.restore();c.save();roomPath();c.clip();
  const x0=Math.floor(bounds.minX)-1,x1=Math.ceil(bounds.maxX)+2,y0=Math.floor(bounds.minY)-1,y1=Math.ceil(bounds.maxY)+2;
  for(let y=y0;y<y1;y++){c.fillStyle=y%2===0?'#efd7b9':'#efd2b1';c.fillRect(x0,y,x1-x0,1);c.fillStyle='rgba(169,121,81,.09)';c.fillRect(x0,y+.96,x1-x0,.025);for(let x=x0;x<x1;x++)if((x+Math.floor(y/2))%3===0)c.fillRect(x+.48,y+.03,.015,.9)}
  if(this.grid){let sub=(v.scale>=50||(this.tool==='interior-wall'&&v.scale*this.snap>=4))?this.snap:1;c.lineWidth=(sub===1?.015:.009);c.strokeStyle='rgba(146,109,80,.17)';for(let x=Math.floor(x0/sub)*sub;x<x1;x+=sub)line(c,x,y0,x,y1,'rgba(146,109,80,.15)',sub===1?.015:.009);for(let y=Math.floor(y0/sub)*sub;y<y1;y+=sub)line(c,x0,y,x1,y,'rgba(146,109,80,.15)',sub===1?.015:.009)}
  if(this.light){const angle=(this.state.sunAngle??180)*Math.PI/180,dx=Math.sin(angle)*8,dy=-Math.cos(angle)*8;for(const o of this.state.openings.filter(o=>o.type==='window')){const run=windowRun(this.state,o);if(!run)continue;const a=windowPoint(run,run.start),b=windowPoint(run,run.end);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x+dx,b.y+dy);c.lineTo(a.x+dx,a.y+dy);c.closePath();c.fillStyle='rgba(255,250,202,.28)';c.fill()}}
  c.restore();
  c.globalAlpha=1;
  for(const o of this.state.items){if(window.Furniture)window.Furniture.draw(c,o,CATALOG,itemDrawing,()=>this.draw());else itemDrawing(c,o,o.id===this.selected)}
  if(this.state.interiorWalls?.length){c.save();roomPath();c.clip();for(const wall of this.state.interiorWalls){line(c,wall.x1,wall.y1+.04,wall.x2,wall.y2+.04,'#9e8976',.25);line(c,wall.x1,wall.y1,wall.x2,wall.y2,'#fffaf0',.18);if(wall.id===this.selected){line(c,wall.x1,wall.y1,wall.x2,wall.y2,'#6d9c77',.09)}}c.restore()}
  if(poly){for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];line(c,a[0],a[1]+.045,b[0],b[1]+.045,'#a28e7a',.22);line(c,a[0],a[1],b[0],b[1],'#fffaf0',.18)}}else for(const [x,y] of this.state.cells){for(const side of SIDES){const [dx,dy]=N[side];if(cells.has(key(x+dx,y+dy)))continue;let x1=x,y1=y,x2=x,y2=y;if(side==='top')x2=x+1;else if(side==='bottom'){y1=y2=y+1;x2=x+1}else if(side==='left')y2=y+1;else{x1=x2=x+1;y2=y+1}line(c,x1,y1+.045,x2,y2+.045,'#a28e7a',.22);line(c,x1,y1,x2,y2,'#fffaf0',.18)}}
  for(const o of this.state.openings){if(o.type==='window'){const run=windowRun(this.state,o);if(run){const points=windowPath(run);for(const [color,width] of [['#a7cfca',.22],['#e8fbf1',.08]]){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}}continue}const z=openingPosition(o,poly),width=o.width||1;c.save();c.translate(z.x,z.y);c.rotate(z.angle);line(c,-.47*width,0,.47*width,0,'#e9cfad',.23);line(c,-.47*width,0,-.47*width,.85*width,'#b99575',.07);c.beginPath();c.arc(-.47*width,0,.85*width,0,Math.PI/2);c.setLineDash([.06,.07]);c.lineWidth=.025;c.strokeStyle='#b99575';c.stroke();c.setLineDash([]);if(o.id===this.selected)rr(c,-.53*width,-.12,1.06*width,.24,.08,null,'#527d65',.06);c.restore()}
  const selectedItem=this.state.items.find(o=>o.id===this.selected);if(selectedItem&&this.tool==='select'&&window.Furniture)window.Furniture.drawHandles(c,selectedItem,CATALOG,v.scale);
  if(this.tool==='shape-room'||this.tool==='select'||this.tool==='curve-room'){const anchors=this.baseWalls();for(let i=0;i<anchors.length;i++){const p=anchors[i],q=anchors[(i+1)%anchors.length];if(this.tool==='shape-room'&&!this.state.wallCurves?.[i])circle(c,(p[0]+q[0])/2,(p[1]+q[1])/2,Math.max(.08,4/v.scale),'#ffffff','#6e9a78',Math.max(.035,1/v.scale));circle(c,p[0],p[1],Math.max(.11,(this.tool==='shape-room'||this.tool==='curve-room'?7:5)/v.scale),'#588368','#fff',Math.max(.04,2/v.scale))}}
  if(this.tool==='select'){const opening=this.state.openings.find(o=>o.id===this.selected&&o.type==='window'),run=opening&&windowRun(this.state,opening);if(run){for(const d of [run.start,run.end]){const q=windowPoint(run,d);circle(c,q.x,q.y,Math.max(.13,7/v.scale),'#fffefa','#527d65',Math.max(.04,2/v.scale))}}}
  if(this.tool==='curve-room'&&this.curveMode!==null){const i=this.curveMode,anchors=this.baseWalls(),a=anchors[i],b=anchors[(i+1)%anchors.length],curve=this.state.wallCurves?.[i];if(a&&b){const points=[a,...curvePoints(a,b,curve),b];c.save();c.strokeStyle='#599571';c.lineWidth=Math.max(.08,3/v.scale);c.setLineDash([.12,.11]);c.beginPath();points.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.setLineDash([]);const mid=points[Math.floor(points.length/2)];circle(c,mid[0],mid[1],Math.max(.13,7/v.scale),'#599571','#fff',Math.max(.04,2/v.scale));if(curve){const [cx,cy]=curve.center,r=Math.hypot(a[0]-cx,a[1]-cy),rEnd=Math.hypot(b[0]-cx,b[1]-cy);c.setLineDash([4/v.scale,5/v.scale]);c.strokeStyle='rgba(75,126,94,.65)';c.lineWidth=1.2/v.scale;if(r<500&&Math.abs(r-rEnd)<.02){c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke()}line(c,cx,cy,a[0],a[1],'rgba(75,126,94,.6)',1/v.scale);line(c,cx,cy,b[0],b[1],'rgba(75,126,94,.6)',1/v.scale);const proxy=curveCenterProxy(curve.center,v);if(this.drag?.kind==='curve-center'&&this.drag.proxyPoint)proxy.point=this.drag.proxyPoint;const [px,py]=proxy.point;if(proxy.clipped)line(c,px,py,cx,cy,'rgba(75,126,94,.8)',1.5/v.scale);c.setLineDash([]);circle(c,px,py,Math.max(.14,8/v.scale),'#eea881','#fff',Math.max(.04,2/v.scale));c.fillStyle='#496b55';c.font=`${11/v.scale}px sans-serif`;const text=proxy.clipped?'center '+arrowForOffset(proxy.dx,proxy.dy):'curve center';c.textAlign=px>(v.width/2-v.ox)/v.scale?'right':'left';c.fillText(text,px+(c.textAlign==='right'?-10:10)/v.scale,py-8/v.scale)}c.restore()}}

  if(this.tool==='interior-wall'){const start=this.drag?.kind==='interior-wall'?this.drag.start:this.wallStart;if(start){if(this.drag?.kind==='interior-wall'){const end=this.wallEnd(start,this.drag.end);c.save();c.setLineDash([.12,.1]);line(c,start.x,start.y,end.x,end.y,'#588368',.1);c.restore()}circle(c,start.x,start.y,Math.max(.12,7/v.scale),'#588368','#fff',Math.max(.04,2/v.scale))}}
  if(this.drag&&this.drag.kind==='shape'){const d=this.drag;c.save();c.strokeStyle='#537e64';c.fillStyle='rgba(180,143,126,.35)';c.lineWidth=Math.max(.04,2/v.scale);c.setLineDash([.15,.1]);c.beginPath();if(d.shape==='freehand'){d.points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.lineTo(d.end.x,d.end.y)}else if(d.shape==='ellipse'||d.shape==='pillar'){c.ellipse((d.start.x+d.end.x)/2,(d.start.y+d.end.y)/2,Math.max(.001,Math.abs(d.end.x-d.start.x)/2),Math.max(.001,Math.abs(d.end.y-d.start.y)/2),0,0,Math.PI*2)}else c.rect(Math.min(d.start.x,d.end.x),Math.min(d.start.y,d.end.y),Math.abs(d.end.x-d.start.x),Math.abs(d.end.y-d.start.y));c.fill();c.stroke();c.restore()}
  if(this.drag&&(this.drag.kind==='add-room'||this.drag.kind==='erase-room')){const a=this.drag.start,b=this.drag.end,x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),w=Math.abs(a.x-b.x)+1,h=Math.abs(a.y-b.y)+1;c.fillStyle=this.drag.kind==='add-room'?'rgba(112,160,122,.35)':'rgba(215,125,108,.32)';c.fillRect(x,y,w,h);c.strokeStyle=this.drag.kind==='add-room'?'#699576':'#c7786e';c.lineWidth=.08;c.setLineDash([.18,.12]);c.strokeRect(x,y,w,h);c.setLineDash([])}c.restore()
 }
 destroy(){this.cancelHold();this.resizeObserver.disconnect();this.canvas.removeEventListener('pointerdown',this.onPointerDown);this.canvas.removeEventListener('pointermove',this.onPointerMove);this.canvas.removeEventListener('pointerup',this.onPointerUp);this.canvas.removeEventListener('pointercancel',this.onPointerUp);this.canvas.removeEventListener('wheel',this.onWheel)}
}
