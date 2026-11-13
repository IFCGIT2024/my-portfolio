/* Named home and room-template copies. No network access is used. */
(function(root){
'use strict';
const KEY='little-room-library-v1', VERSION=1, MAX_NAME=80, MAX_PLANS=100;
function fail(code,message){const error=new Error(message);error.code=code;throw error}
function clone(value){try{const json=JSON.stringify(value);if(json===undefined)throw new Error();return JSON.parse(json)}catch(_){fail('INVALID_PLAN','This plan could not be saved. Export a backup first.') }}
function nameOf(name){if(typeof name!=='string')fail('INVALID_NAME','Give your saved plan a name.');const value=name.trim();if(!value)fail('INVALID_NAME','Give your saved plan a name.');if(value.length>MAX_NAME)fail('INVALID_NAME',`Choose a name with ${MAX_NAME} characters or fewer.`);return value}
function validState(state){return !!state&&typeof state==='object'&&!Array.isArray(state)&&Array.isArray(state.items)&&Array.isArray(state.openings)&&(Array.isArray(state.cells)||Array.isArray(state.polygon))}
function validKind(kind){return kind==='home'||kind==='template'}
function create(storage){
 function getStore(){try{const s=storage||root.localStorage;if(!s||typeof s.getItem!=='function'||typeof s.setItem!=='function')throw new Error();return s}catch(_){fail('STORAGE_UNAVAILABLE','Saved plans are unavailable in this browser. Export a backup instead.')}}
 function read(){let raw;try{raw=getStore().getItem(KEY)}catch(error){if(error.code)throw error;fail('STORAGE_UNAVAILABLE','Saved plans are unavailable in this browser. Export a backup instead.')}
  if(raw===null)return {version:VERSION,plans:[]};let data;try{data=JSON.parse(raw)}catch(_){fail('CORRUPT_LIBRARY','Your saved-plan collection could not be read. It has been preserved.')}
  if(!data||typeof data!=='object'||data.version!==VERSION||!Array.isArray(data.plans)||data.plans.length>MAX_PLANS)fail('CORRUPT_LIBRARY','Your saved-plan collection could not be read. It has been preserved.');
  const ids=new Set(),names=new Set();for(const record of data.plans){if(!record||typeof record.id!=='string'||!record.id||record.id.length>100||!validKind(record.kind)||typeof record.name!=='string'||!record.name.trim()||record.name.length>MAX_NAME||typeof record.updatedAt!=='string'||!validState(record.state)||ids.has(record.id))fail('CORRUPT_LIBRARY','Your saved-plan collection could not be read. It has been preserved.');const key=record.kind+'\0'+record.name.trim().toLocaleLowerCase();if(names.has(key))fail('CORRUPT_LIBRARY','Your saved-plan collection could not be read. It has been preserved.');names.add(key);ids.add(record.id)}return data;
 }
 function write(data){const serialized=JSON.stringify(data);try{getStore().setItem(KEY,serialized)}catch(error){if(error.code)throw error;fail('STORAGE_FULL','Could not save on this device. Storage may be full; export a backup instead.')}}
 function list(kind){if(kind!==undefined&&!validKind(kind))fail('INVALID_KIND','Choose Home or Room template.');return read().plans.filter(p=>kind===undefined||p.kind===kind).map(({id,kind,name,updatedAt})=>({id,kind,name,updatedAt})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
 function get(id){if(typeof id!=='string')return null;const item=read().plans.find(p=>p.id===id);return item?clone(item):null}
 function save({kind,name,state,overwrite=false}={}){if(!validKind(kind))fail('INVALID_KIND','Choose Home or Room template.');const title=nameOf(name);if(!validState(state))fail('INVALID_PLAN','This plan could not be saved. Export a backup first.');const copy=clone(state),data=read(),existing=data.plans.find(p=>p.kind===kind&&p.name.trim().toLocaleLowerCase()===title.toLocaleLowerCase());if(existing&&!overwrite)fail('DUPLICATE_NAME','A saved plan already has this name.');if(!existing&&data.plans.length>=MAX_PLANS)fail('LIBRARY_FULL','You have reached the maximum number of saved plans.');
  const ids=new Set(data.plans.map(p=>p.id));let planId=existing?.id;while(!planId||(!existing&&ids.has(planId)))planId='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,12);const item={id:planId,kind,name:title,updatedAt:new Date().toISOString(),state:copy};if(existing)data.plans[data.plans.indexOf(existing)]=item;else data.plans.push(item);write(data);return clone(item);
 }
 function remove(id){if(typeof id!=='string')return false;const data=read(),index=data.plans.findIndex(p=>p.id===id);if(index<0)return false;data.plans.splice(index,1);write(data);return true}
 return Object.freeze({list,get,save,remove});
}
root.LocalPlans=Object.freeze({create,KEY,VERSION});
})(typeof window!=='undefined'?window:globalThis);
