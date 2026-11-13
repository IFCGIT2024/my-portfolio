'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const env = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','furniture.js'),'utf8'),env);
const F = env.window.Furniture;
const catalog = {rug:{w:5,h:4},custom:{w:2,h:2}};
const copy = value => JSON.parse(JSON.stringify(value));

test('removing a point from an untouched rectangular rug creates a valid triangle',()=>{
 const item={id:'rug',type:'rug',x:3,y:4,rotation:35};
 const points=F.shapePoints(item,catalog), before=copy(item);
 const world=points.map(([x,y])=>F.toWorld(item,{x:x*5,y:y*4}));
 assert.equal(F.removeShapePoint(item,catalog,1),true);
 assert.equal(item.shapeOutline.length,3);
 assert.equal(F.validShapeOutline(item.shapeOutline),true);
 assert.deepEqual(copy({...item,shapeOutline:undefined}),before);
 const remaining=F.shapePoints(item,catalog).map(([x,y])=>F.toWorld(item,{x:x*5,y:y*4}));
 assert.deepEqual(copy(remaining),copy([world[0],world[2],world[3]]));
});

test('at least three distinct points remain and invalid indices never mutate the piece',()=>{
 const item={id:'triangle',type:'rug',x:3,y:4,rotation:0,shapeOutline:[[-.5,-.5],[.5,-.5],[0,.5]]};
 for(const i of [-1,0,2,3,1.2,NaN]){const before=copy(item);assert.equal(F.removeShapePoint(item,catalog,i),false);assert.deepEqual(copy(item),before)}
});

test('point removal fails safely when reconnecting the edge would create an invalid outline',()=>{
 const item={type:'rug',x:0,y:0,rotation:0,shapeOutline:[[0,.2],[-.4,.4],[-.4,.2],[-.5,0],[.2,.1],[-.1,.1]]};
 assert.equal(F.validShapeOutline(item.shapeOutline),true);
 const before=copy(item);assert.equal(F.removeShapePoint(item,catalog,3),false);assert.deepEqual(copy(item),before);
});

test('image artwork, transforms, and room-fit masks are preserved',()=>{
 const item={type:'custom',shape:'image',id:'image',x:1,y:2,w:3,h:4,rotation:80,imageData:'data:image/png;base64,YWJj'};
 const before=copy(item);assert.equal(F.removeShapePoint(item,catalog,2),true);
 assert.deepEqual(copy({...item,shapeOutline:undefined}),before);
 const masked={...before,clipPolygon:[[-1,-1],[1,-1],[1,1],[-1,1]]},saved=copy(masked);
 assert.equal(F.removeShapePoint(masked,catalog,1),false);assert.deepEqual(copy(masked),saved);
});
