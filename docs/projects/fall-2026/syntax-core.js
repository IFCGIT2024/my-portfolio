/* Pure C syntax drill: shuffled complete passes and persistent practice records. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SyntaxDrill=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const validId=s=>typeof s==='string'&&/^[a-z][a-z0-9-]*$/.test(s)&&!['constructor','prototype'].includes(s);
  const hash=s=>{let n=2166136261;for(let i=0;i<s.length;i++){n^=s.charCodeAt(i);n=Math.imul(n,16777619);}return(n>>>0).toString(16);};
  const fingerprint=q=>hash(JSON.stringify(q));
  const stamp=b=>hash(JSON.stringify(b.questions));
  const find=(b,id)=>b.questions.find(q=>q.id===id);
  function validate(b){
    const errors=[];if(!b||b.schemaVersion!==1||!Array.isArray(b.topics)||!b.topics.length||!Array.isArray(b.questions)||!b.questions.length||!Array.isArray(b.assumptions))return['Invalid syntax bank.'];
    const topics=new Set(),ids=new Set();
    for(const t of b.topics){if(!validId(t.id)||topics.has(t.id)||!t.title||!t.reference)errors.push('Invalid topic '+t.id);topics.add(t.id);}
    for(const q of b.questions){
      if(!validId(q.id)||ids.has(q.id)||!topics.has(q.topic))errors.push('Invalid question '+q.id);ids.add(q.id);
      if(!q.prompt||!q.explanation||!Array.isArray(q.options)||q.options.length!==4||q.options.some(o=>typeof o!=='string'||!o.trim())||new Set(q.options).size!==4||!Number.isInteger(q.correct)||q.correct<0||q.correct>3)errors.push('Invalid choices '+q.id);
      if([q.prompt,q.code,q.explanation,...(Array.isArray(q.options)?q.options:[])].some(s=>typeof s==='string'&&/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s)))errors.push('Control character '+q.id);
    }return errors;
  }
  function fresh(b){return{version:1,bankStamp:stamp(b),records:{},decks:{},settings:{topic:'all',pattern:'all',mode:'practice',length:'25'},session:null};}
  function settings(b,s={}){
    if(!s||typeof s!=='object')s={};
    const topic=b.topics.some(t=>t.id===s.topic)?s.topic:'all';
    const pattern=find(b,s.pattern);return{topic,pattern:pattern&&(topic==='all'||pattern.topic===topic)?pattern.id:'all',mode:s.mode==='missed'?'missed':'practice',length:['10','25','50','100','pass','endless'].includes(String(s.length))?String(s.length):'25'};
  }
  const shuffle=(a,rng)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function eligible(b,db,s){return b.questions.filter(q=>(s.topic==='all'||q.topic===s.topic)&&(s.pattern==='all'||q.id===s.pattern)&&(s.mode!=='missed'||db.records[q.id]?.missed));}
  function order(pool,rng){
    const groups=new Map();for(const q of pool){if(!groups.has(q.topic))groups.set(q.topic,[]);groups.get(q.topic).push(q.id);}
    const queues=shuffle([...groups.values()].map(g=>shuffle(g,rng)),rng),out=[];
    while(queues.some(g=>g.length))for(const g of queues)if(g.length)out.push(g.shift());return out;
  }
  function deck(b,db,s,rng){
    const pool=eligible(b,db,s),ids=new Set(pool.map(q=>q.id)),key=[s.topic,s.pattern,s.mode].join(':');let d=db.decks[key];
    if(!d)d=db.decks[key]={ids:[],cursor:0,cycle:0,last:null};
    while(d.cursor<d.ids.length&&!ids.has(d.ids[d.cursor]))d.cursor++;
    if(d.cursor>=d.ids.length&&pool.length){
      d.ids=order(pool,rng);d.cursor=0;d.cycle++;
      if(d.ids.length>1&&d.ids[0]===d.last)[d.ids[0],d.ids[1]]=[d.ids[1],d.ids[0]];
    }return{d,key,pool};
  }
  function draw(b,db,rng){
    const s=db.session,{d,pool}=deck(b,db,s.settings,rng);
    if(!pool.length||(s.limit!==null&&s.answered>=s.limit)){s.done=true;s.current=null;return null;}
    const id=d.ids[d.cursor++];d.last=id;
    s.current={id,order:shuffle([0,1,2,3],rng),selected:null,outcome:null,assisted:false,pass:d.cycle,position:d.cursor,passSize:d.ids.length};return s.current;
  }
  function start(b,db,input,now=Date.now(),rng=Math.random){
    const s=settings(b,input);if(!eligible(b,db,s).length)return null;
    const {d}=deck(b,db,s,rng);
    db.settings=s;db.session={settings:s,limit:s.length==='endless'?null:s.length==='pass'?d.ids.length-d.cursor:Number(s.length),answered:0,correct:0,assisted:0,revealed:0,streak:0,best:0,startedAt:now,done:false,current:null};
    draw(b,db,rng);return db.session;
  }
  function submit(b,db,choice,now=Date.now()){
    const s=db.session,c=s?.current;if(!c||s.done||c.outcome!==null)return null;
    if(choice!==null&&(!Number.isInteger(choice)||choice<0||choice>3))return null;
    const q=find(b,c.id),correct=choice!==null&&c.order[choice]===q.correct;
    c.selected=choice;c.outcome=choice===null?'revealed':correct?(c.assisted?'assisted':'correct'):'miss';
    let r=db.records[q.id];if(!r||r.fingerprint!==fingerprint(q))r={fingerprint:fingerprint(q),attempts:0,correct:0,assisted:0,revealed:0,misses:0,missed:false,lastAt:now};
    r.attempts++;r.lastAt=now;r.missed=c.outcome!=='correct';
    if(c.outcome==='correct')r.correct++;else if(c.outcome==='assisted')r.assisted++;else if(c.outcome==='revealed')r.revealed++;else r.misses++;
    db.records[q.id]=r;s.answered++;
    if(c.outcome==='correct'){s.correct++;s.streak++;s.best=Math.max(s.best,s.streak);}else{s.streak=0;if(c.outcome==='assisted')s.assisted++;if(c.outcome==='revealed')s.revealed++;}
    return c.outcome;
  }
  function next(b,db,rng=Math.random){if(!db.session?.current?.outcome)return null;return draw(b,db,rng);}
  function assist(db){if(db.session?.current&&!db.session.current.outcome)db.session.current.assisted=true;}
  function finish(db){if(db.session){db.session.done=true;db.session.current=null;}}
  function stats(b,db){return b.topics.map(t=>{const qs=b.questions.filter(q=>q.topic===t.id),rs=qs.map(q=>db.records[q.id]).filter(Boolean);return{id:t.id,title:t.title,total:qs.length,seen:rs.length,attempts:rs.reduce((n,r)=>n+r.attempts,0),correct:rs.reduce((n,r)=>n+r.correct,0),missed:rs.filter(r=>r.missed).length};});}
  function restore(b,raw){
    if(typeof raw==='string'&&raw.length>3000000)throw Error('Backup too large.');
    let v;try{v=typeof raw==='string'?JSON.parse(raw):JSON.parse(JSON.stringify(raw));}catch{throw Error('Invalid JSON backup.');}
    if(!v||v.version!==1||!v.records||typeof v.records!=='object'||Array.isArray(v.records)||!v.decks||typeof v.decks!=='object'||Array.isArray(v.decks))throw Error('Not a syntax-drill backup.');
    const db=fresh(b),integer=n=>Number.isSafeInteger(n)&&n>=0;
    for(const q of b.questions){const r=v.records[q.id];if(!r||r.fingerprint!==fingerprint(q))continue;
      if(!['attempts','correct','assisted','revealed','misses','lastAt'].every(k=>integer(r[k]))||r.attempts!==r.correct+r.assisted+r.revealed+r.misses||typeof r.missed!=='boolean')throw Error('Invalid practice record.');
      db.records[q.id]={fingerprint:r.fingerprint,attempts:r.attempts,correct:r.correct,assisted:r.assisted,revealed:r.revealed,misses:r.misses,missed:r.missed,lastAt:r.lastAt};
    }
    db.settings=settings(b,v.settings);
    if(v.bankStamp!==db.bankStamp)return db;
    for(const [key,d] of Object.entries(v.decks)){
      const parts=key.split(':');if(parts.length!==3)continue;const ss=settings(b,{topic:parts[0],pattern:parts[1],mode:parts[2]});if([ss.topic,ss.pattern,ss.mode].join(':')!==key)continue;
      if(!d||!Array.isArray(d.ids)||d.ids.length>b.questions.length||new Set(d.ids).size!==d.ids.length||!d.ids.every(id=>{const q=find(b,id);return q&&(ss.topic==='all'||q.topic===ss.topic)&&(ss.pattern==='all'||q.id===ss.pattern);})||!integer(d.cursor)||d.cursor>d.ids.length||!integer(d.cycle))continue;
      db.decks[key]={ids:d.ids.slice(),cursor:d.cursor,cycle:d.cycle,last:find(b,d.last)?d.last:null};
    }
    const s=v.session;
    if(s&&typeof s.done==='boolean'&&['answered','correct','assisted','revealed','streak','best','startedAt'].every(k=>integer(s[k]))&&s.correct+s.assisted+s.revealed<=s.answered&&s.streak<=s.best&&s.best<=s.correct&&(s.limit===null||integer(s.limit)&&s.limit>0)){
      const ss=settings(b,s.settings),key=[ss.topic,ss.pattern,ss.mode].join(':'),c=s.current,q=c&&find(b,c.id);
      const validCurrent=q&&(ss.topic==='all'||q.topic===ss.topic)&&(ss.pattern==='all'||q.id===ss.pattern)&&Array.isArray(c.order)&&c.order.length===4&&c.order.every(Number.isInteger)&&c.order.slice().sort().join(',')==='0,1,2,3'&&[null,'correct','assisted','revealed','miss'].includes(c.outcome)&&(c.selected===null||Number.isInteger(c.selected)&&c.selected>=0&&c.selected<4)&&typeof c.assisted==='boolean'&&['pass','position','passSize'].every(k=>integer(c[k]))&&c.position<=c.passSize&&c.passSize<=b.questions.length;
      let consistent=false;
      if(validCurrent){const expected=c.selected===null?(c.outcome===null?null:'revealed'):c.order[c.selected]===q.correct?(c.assisted?'assisted':'correct'):'miss';consistent=c.outcome===expected;}
      if(s.done||consistent&&db.decks[key]&&db.decks[key].cursor>0&&db.decks[key].ids[db.decks[key].cursor-1]===c.id){
        db.session={settings:ss,limit:s.limit,answered:s.answered,correct:s.correct,assisted:s.assisted,revealed:s.revealed,streak:s.streak,best:s.best,startedAt:s.startedAt,done:s.done,current:s.done?null:{id:c.id,order:c.order.slice(),selected:c.selected,outcome:c.outcome,assisted:c.assisted,pass:c.pass,position:c.position,passSize:c.passSize}};
      }
    }return db;
  }
  return{validate,fresh,settings,eligible,start,submit,next,assist,finish,stats,restore,find,fingerprint,serialize:db=>JSON.stringify(db)};
});
