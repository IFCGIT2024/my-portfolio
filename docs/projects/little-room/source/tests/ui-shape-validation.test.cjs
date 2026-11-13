'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('ui.js'),validator=source.slice(source.indexOf('function safeState('),source.indexOf('function persist('));
const context={window:{},CATALOG:{bed:{w:4,h:4},custom:{w:2,h:2}},console};vm.createContext(context);vm.runInContext(read('furniture.js'),context);vm.runInContext(validator+'\nthis.safeState=safeState;',context);
const valid=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
const state=outline=>({cells:[[0,0],[1,0],[0,1],[1,1]],items:[{id:'bed',type:'bed',x:1,y:1,rotation:0,...(outline===undefined?{}:{shapeOutline:outline})}],openings:[]});
test('editor validation accepts legacy rooms and valid editable outlines',()=>{assert.equal(context.safeState(state()),true);assert.equal(context.safeState(state(valid)),true)});
test('editor validation rejects damaged or self-crossing editable outlines',()=>{assert.equal(context.safeState(state(null)),false);assert.equal(context.safeState(state([[0,0],[.5,.5],[-.5,.5],[.5,-.5]])),false);assert.equal(context.safeState(state([[-.5,-.5],[.5,-.5],[.5,.5],[2,.5]])),false)});
