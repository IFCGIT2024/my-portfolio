// Reusable single-room starters. One world unit is 0.5 metres.
(function(root){
'use strict';
const SQFT_PER_CELL=2.690977604;
const WARNING='Room templates are illustrative and are not a building-code or accessibility check.';
const TEMPLATES={bedroom:{w:8,h:8,title:'Bedroom'},bathroom:{w:6,h:6,title:'Bathroom'},living:{w:10,h:8,title:'Living room'},kitchen:{w:8,h:7,title:'Kitchen'},office:{w:8,h:7,title:'Home office'},dining:{w:8,h:7,title:'Dining room'}};
function uniqueFactory(seed){let i=0;return ()=>`g${(seed>>>0).toString(36)}-${++i}`}
function stateFor(w,h,title){const cells=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)cells.push([x,y]);return {cells,title,sunAngle:180,sunTime:12,items:[],openings:[]}}
function object(id,type,x,y,more={}){return {id:id(),type,x,y,rotation:0,...more}}
function fixture(s,id,name,x,y,w,h,color='#e9f0eb'){s.items.push(object(id,'custom',x,y,{shape:'rect',name,w,h,color}))}
function windowAt(s,id,x,y,side,width=1.6){s.openings.push({id:id(),type:'window',x,y,side,width})}
function entryAt(s,id,x,y,side){s.openings.push({id:id(),type:'door',x,y,side,width:1.6})}
function bathFixtures(s,id,x,y,w){fixture(s,id,'Shower',x+1.1,y+1.1,1.8,1.8,'#c6e3e2');fixture(s,id,'Toilet',x+w-0.85,y+1.0,1.2,1.4);fixture(s,id,'Basin',x+w-0.85,y+3.1,1.2,1.0)}
function generateTemplate(kind,options={}){
 if(!Object.prototype.hasOwnProperty.call(TEMPLATES,kind))throw new Error('Choose one of the room templates.');const t=TEMPLATES[kind];
 const seed=Number.isFinite(Number(options.seed))?Number(options.seed)>>>0:1,id=uniqueFactory(seed),s=stateFor(t.w,t.h,t.title);
 if(kind==='bedroom'){s.items.push(object(id,'bed',4,2.25),object(id,'plant',7,6.7));windowAt(s,id,3,0,'top',2);entryAt(s,id,0,6,'left')}
 if(kind==='living'){s.items.push(object(id,'sofa',4,2),object(id,'coffeeTable',4,4),object(id,'plant',8.5,6.7));windowAt(s,id,4,0,'top',2);entryAt(s,id,0,6,'left')}
 if(kind==='kitchen'){s.items.push(object(id,'counter',2,.6),object(id,'sink',5,.6),object(id,'fridge',7,1.1),object(id,'diningTable',4.5,4.5));windowAt(s,id,3,6,'bottom',2);entryAt(s,id,0,5,'left')}
 if(kind==='bathroom'){bathFixtures(s,id,.5,.5,5);entryAt(s,id,2,5,'bottom')}
 if(kind==='office'){s.items.push(object(id,'desk',4,1.25),object(id,'armchair',4,3.5),object(id,'bookshelf',1.75,5.5),object(id,'plant',7,5.5));windowAt(s,id,3,0,'top',2);entryAt(s,id,5,6,'bottom')}
 if(kind==='dining'){s.items.push(object(id,'diningTable',4,3.25),object(id,'plant',7,1));windowAt(s,id,3,0,'top',2);entryAt(s,id,2,6,'bottom')}
 s.generation={version:1,kind:'template',template:kind,seed,zones:[{name:t.title,type:kind,x:0,y:0,w:t.w,h:t.h}]};
 return {state:s,description:`${t.title} starting plan`,warnings:[WARNING],actualAreaSqFt:Math.round(t.w*t.h*SQFT_PER_CELL)};
}
root.RoomGenerator={generateTemplate,TEMPLATES,SQFT_PER_CELL};
})(typeof window!=='undefined'?window:globalThis);
