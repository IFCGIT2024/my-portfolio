// Little Room concept generator. One world unit is 0.5 metres.
// The present editor has one exterior footprint: partitions below are movable
// illustration objects, not architectural walls or an assessment of legality.
(function(root){
'use strict';
const SQFT_PER_CELL=2.690977604;
const WARNING='Concept only: movable partitions and fixture sizes are illustrations, not a building-code or accessibility check.';
const TEMPLATES={bedroom:{w:8,h:8,title:'Bedroom'},bathroom:{w:6,h:6,title:'Bathroom'},living:{w:10,h:8,title:'Living room'},kitchen:{w:8,h:7,title:'Kitchen'}};
function integer(value,name,min,max){const n=Number(value);if(!Number.isInteger(n)||n<min||n>max)throw new Error(`${name} must be between ${min} and ${max}.`);return n}
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function uniqueFactory(seed){let i=0;return ()=>`g${(seed>>>0).toString(36)}-${++i}`}
function stateFor(w,h,title){const cells=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)cells.push([x,y]);return {cells,title,sunAngle:180,sunTime:12,items:[],openings:[]}}
function object(id,type,x,y,more={}){return {id:id(),type,x,y,rotation:0,...more}}
function fixture(s,id,name,x,y,w,h,color='#e9f0eb'){s.items.push(object(id,'custom',x,y,{shape:'rect',name,w,h,color}))}
function pillar(s,id,x,y){s.items.push(object(id,'custom',x,y,{shape:'pillar',name:'Pillar',w:.7,h:.7,color:'#cbbcab'}))}
function windowAt(s,id,x,y,side,width=1.6){s.openings.push({id:id(),type:'window',x,y,side,width})}
function entryAt(s,id,x,y,side){s.openings.push({id:id(),type:'door',x,y,side,width:1.6})}
function bathFixtures(s,id,x,y,w,full){if(full)fixture(s,id,'Shower',x+1.1,y+1.1,1.8,1.8,'#c6e3e2');fixture(s,id,'Toilet',x+w-0.85,y+1.0,1.2,1.4);fixture(s,id,'Basin',x+w-0.85,y+3.1,1.2,1.0)}
function partition(s,id,x,y,w,h){if(w<.1||h<.1)return;s.items.push(object(id,'custom',x+w/2,y+h/2,{shape:'rect',name:'Illustrative partition',w,h,color:'#bca99a'}))}
function wallWithOpening(s,id,x,y,w){const gap=Math.min(1.8,w-.8),left=(w-gap)/2;partition(s,id,x,y,left,.16);partition(s,id,x+left+gap,y,w-left-gap,.16)}
function generateTemplate(kind,options={}){const t=TEMPLATES[kind];if(!t)throw new Error('Choose a bedroom, bathroom, living room or kitchen template.');const seed=Number.isFinite(Number(options.seed))?Number(options.seed)>>>0:1,id=uniqueFactory(seed),s=stateFor(t.w,t.h,t.title);
 if(kind==='bedroom'){s.items.push(object(id,'bed',4,2.25),object(id,'plant',7,6.7));windowAt(s,id,3,0,'top',2);entryAt(s,id,0,6,'left')}
 if(kind==='living'){s.items.push(object(id,'sofa',4,2),object(id,'coffeeTable',4,4),object(id,'plant',8.5,6.7));windowAt(s,id,4,0,'top',2);entryAt(s,id,0,6,'left')}
 if(kind==='kitchen'){s.items.push(object(id,'counter',2,.6),object(id,'sink',5,.6),object(id,'fridge',7,1.1),object(id,'diningTable',4.5,4.5));windowAt(s,id,3,6,'bottom',2);entryAt(s,id,0,5,'left')}
 if(kind==='bathroom'){bathFixtures(s,id,.5,.5,5,true);entryAt(s,id,2,5,'bottom')}
 s.generation={version:1,kind:'template',template:kind,seed,zones:[{name:t.title,type:kind,x:0,y:0,w:t.w,h:t.h}]};return {state:s,description:`${t.title} starting plan`,warnings:[WARNING],actualAreaSqFt:Math.round(t.w*t.h*SQFT_PER_CELL)};
}
function generateApartment(options={}){
 const bedrooms=integer(options.bedrooms??1,'Bedrooms',0,2),bathrooms=integer(options.bathrooms??1,'Full bathrooms',1,2),halfBaths=integer(options.halfBaths??0,'Half bathrooms',0,1),pillars=integer(options.pillars??0,'Pillars',0,2);
 const area=Number(options.areaSqFt??800);if(!Number.isFinite(area)||area<150||area>4000)throw new Error('Choose an area between 150 and 4,000 square feet.');
 const seed=options.seed==null?(Math.random()*4294967296)>>>0:integer(options.seed,'Seed',0,4294967295),random=rng(seed),id=uniqueFactory(seed);
 const target=area/SQFT_PER_CELL,blocks=[];for(let i=0;i<Math.max(1,bedrooms);i++)blocks.push({type:bedrooms?'bedroom':'sleeping',name:bedrooms?`Bedroom ${i+1}`:'Sleeping area',min:6});for(let i=0;i<bathrooms;i++)blocks.push({type:'bathroom',name:`Bathroom ${i+1}`,min:4});for(let i=0;i<halfBaths;i++)blocks.push({type:'half-bath',name:`Half bath ${i+1}`,min:3});
 const minWidth=blocks.reduce((n,b)=>n+b.min,0);let w=Math.max(minWidth,Math.round(Math.sqrt(target*(1.2+random()*.3))));let h=Math.round(target/w);if(w>100||h>100||h<12||w*h>10000)throw new Error('That area is too small for this combination of rooms. Increase the area or reduce the room count.');const zoneH=Math.max(6,Math.min(h-6,Math.round(h*(.43+random()*.07))));if(zoneH<6||h-zoneH<6)throw new Error('Choose a larger area for this combination of rooms.');
 const s=stateFor(w,h,bedrooms?`${bedrooms} bedroom apartment`:'Studio apartment'),zones=[],extra=w-minWidth;let x=0;
 // Extra width is distributed predictably; the seeded random aspect varies layouts.
 blocks.forEach((b,i)=>{const share=Math.floor(extra*(i+1)/blocks.length)-Math.floor(extra*i/blocks.length),bw=b.min+share;zones.push({name:b.name,type:b.type,x,y:0,w:bw,h:zoneH});if(i>0)partition(s,id,x-.08,0,.16,zoneH);if(b.type!=='sleeping')wallWithOpening(s,id,x,zoneH,bw);
 if(b.type==='bedroom'||b.type==='sleeping'){s.items.push(object(id,'bed',x+bw/2,2.2));windowAt(s,id,Math.max(x,Math.min(x+bw-1,Math.floor(x+bw/2))),0,'top',Math.min(2,bw-1))}else bathFixtures(s,id,x,0,bw,b.type==='bathroom');x+=bw;});
 const living={name:'Living and kitchen',type:'living-kitchen',x:0,y:zoneH,w,h:h-zoneH};zones.push(living);
 s.items.push(object(id,'sofa',Math.min(w-2.5,3),zoneH+1.2),object(id,'coffeeTable',Math.min(w-2.5,3),zoneH+3.2),object(id,'counter',w-2,zoneH+.6));
 entryAt(s,id,Math.max(0,Math.min(w-1,Math.floor(w*.22))),h-1,'bottom');windowAt(s,id,Math.max(0,Math.min(w-1,Math.floor(w*.65))),h-1,'bottom',2);
 // Place illustrative columns in the shared living area, away from its main furnishings.
 for(let i=0;i<pillars;i++)pillar(s,id,Math.max(1,Math.min(w-1,w*.58+i*1.5)),h-1.2);
 s.generation={version:1,kind:'apartment',seed,options:{bedrooms,bathrooms,halfBaths,areaSqFt:area,pillars},zones};return {state:s,description:`${bedrooms?`${bedrooms}-bedroom`:'Studio'} apartment concept`,warnings:[WARNING,'The footprint is approximate. Partitions can be moved as objects; they are not connected walls or separate rooms.'],actualAreaSqFt:Math.round(w*h*SQFT_PER_CELL)};
}
root.RoomGenerator={generateTemplate,generateApartment,TEMPLATES,SQFT_PER_CELL};
})(typeof window!=='undefined'?window:globalThis);
