(function(){
  'use strict';
  const KEY='csci2122-syntax-v1',$=id=>document.getElementById(id);
  let bank,db,core,view='setup',timer=null;
  const text=(id,s)=>{$(id).textContent=String(s??'');},show=(id,on)=>{$(id).hidden=!on;};
  function stopTimer(){if(timer!==null)clearTimeout(timer);timer=null;}
  function notice(s){text('storage-notice',s);show('storage-notice',true);}
  function save(){try{localStorage.setItem(KEY,core.serialize(db));}catch{notice('Browser saving is unavailable. You can keep drilling in this tab; export progress before closing it.');}}
  function setView(v){stopTimer();view=v;show('setup',v==='setup');show('practice',v==='practice');show('summary',v==='summary');show('coverage',v!=='practice');}
  function choiceSettings(mode='practice'){return{topic:$('topic').value,pattern:$('pattern').value,length:$('length').value,mode};}
  function patternOptions(selected='all'){
    $('pattern').replaceChildren();const option=document.createElement('option');option.value='all';option.textContent='All patterns in this topic';$('pattern').append(option);
    const topic=$('topic').value;$('pattern').disabled=topic==='all';
    if(topic!=='all')for(const q of bank.questions.filter(q=>q.topic===topic)){const o=document.createElement('option');o.value=q.id;o.textContent=q.prompt.length>110?q.prompt.slice(0,107)+'…':q.prompt;$('pattern').append(o);}
    $('pattern').value=Array.from($('pattern').options).some(o=>o.value===selected)?selected:'all';
  }
  function describe(){
    const s=choiceSettings(),count=core.eligible(bank,db,s).length,t=bank.topics.find(t=>t.id===s.topic);
    text('selection-note',count+' pattern'+(count===1?'':'s')+' selected. '+(s.pattern!=='all'?'Repeat this one form; the answer position is shuffled on every attempt.':t?t.reference:'Mix syntax across every topic, rotating between topics as you practise.'));
    const missed=core.eligible(bank,db,{...s,mode:'missed'}).length;text('review-missed','Review missed ('+missed+')');
  }
  function setup(){
    setView('setup');const s=core.settings(bank,db.settings);$('topic').value=s.topic;patternOptions(s.pattern);$('length').value=s.length;describe();
    const active=db.session&&!db.session.done;show('resume-box',active);if(active)text('resume-copy',db.session.answered+' answers recorded. Your current question and answer order are saved. Starting a new round replaces the saved round.');
    dashboard();
  }
  function dashboard(){
    $('coverage-rows').replaceChildren();const rows=core.stats(bank,db);
    for(const t of rows){const tr=document.createElement('tr'),td=document.createElement('td'),button=document.createElement('button');button.type='button';button.textContent=t.title;
      button.addEventListener('click',()=>{setup();$('topic').value=t.id;patternOptions();describe();$('setup').scrollIntoView({block:'start',behavior:'smooth'});$('start').focus();});td.append(button);tr.append(td);
      for(const value of [t.seen+' / '+t.total,t.correct,t.missed]){const cell=document.createElement('td');cell.textContent=String(value);tr.append(cell);}$('coverage-rows').append(tr);
    }
    text('total-progress',rows.reduce((n,t)=>n+t.seen,0)+' / '+bank.questions.length+' patterns attempted · '+rows.reduce((n,t)=>n+t.attempts,0)+' total attempts');
  }
  function start(mode='practice'){
    const result=core.start(bank,db,choiceSettings(mode));
    if(!result){text('setup-message','No missed patterns in this selection. Choose another topic or start a regular drill.');return;}
    text('setup-message','');save();render(true);$('practice').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function render(focus=false){
    stopTimer();const s=db.session;if(!s||s.done){summary();return;}setView('practice');const c=s.current,q=core.find(bank,c.id),topic=bank.topics.find(t=>t.id===q.topic);
    text('round-label',s.settings.mode==='missed'?'Missed-pattern review':s.settings.length==='endless'?'Endless syntax repetition':'C syntax drill');
    text('round-progress',s.answered+' answered'+(s.limit!==null?' · '+s.limit+' in this round':''));text('round-correct',s.correct);text('round-streak',s.streak);text('pass-progress','Pass '+c.pass+' · pattern '+c.position+' / '+c.passSize);
    text('question-topic',topic.title);text('prompt',q.prompt);text('question-code',q.code);show('question-code',!!q.code);
    $('choices').replaceChildren();c.order.forEach((index,position)=>{const button=document.createElement('button');button.type='button';button.className='choice';button.disabled=c.outcome!==null;
      const key=document.createElement('span');key.className='key';key.textContent=position+1;key.setAttribute('aria-hidden','true');const code=document.createElement('pre');code.textContent=q.options[index];button.append(key,code);button.setAttribute('aria-label','Choice '+(position+1)+': '+q.options[index]);
      if(c.outcome){let label='';if(index===q.correct){button.classList.add('correct');label='Correct';}else if(position===c.selected){button.classList.add('wrong');label='Your choice';}if(label){const badge=document.createElement('span');badge.className='choice-status';badge.textContent=label;button.append(badge);}}
      button.addEventListener('click',()=>answer(position));$('choices').append(button);
    });
    show('before-answer',!c.outcome);show('hint-text',c.assisted);text('hint-text','Reminder used · '+topic.reference);show('feedback',!!c.outcome);show('next',!!c.outcome);
    if(c.outcome){text('feedback-title',{correct:'Correct.',assisted:'Correct with a reminder.',miss:'Keep practising this form.',revealed:'Answer shown.'}[c.outcome]);text('correct-answer',q.options[q.correct]);text('explanation',q.explanation);text('review-note',c.outcome==='correct'?'Recorded as a correct choice without assistance.':'Saved for missed-pattern review. Try it again without the reminder.');$('feedback').dataset.result=c.outcome;}
    if(focus)$('prompt').focus({preventScroll:true});
  }
  function scheduleNext(){stopTimer();if($('auto-next').checked&&view==='practice'&&db.session?.current?.outcome==='correct'&&!document.hidden){const current=db.session.current;timer=setTimeout(()=>{timer=null;if(view==='practice'&&db.session?.current===current)advance();},1500);}}
  function answer(index){const result=core.submit(bank,db,index);if(!result)return;save();render();$('feedback').scrollIntoView({block:'nearest',behavior:'smooth'});$('next').focus({preventScroll:true});scheduleNext();}
  function advance(){stopTimer();if(!db.session?.current?.outcome)return;core.next(bank,db);save();if(db.session.done)summary();else{render(true);$('practice').scrollIntoView({block:'start',behavior:'smooth'});}}
  function summary(){
    stopTimer();if(!db.session){setup();return;}setView('summary');const s=db.session;text('summary-copy',s.answered+' answers recorded. '+(s.settings.mode==='missed'?'Continue with any remaining missed patterns or choose another topic.':'Your place in the pass is saved for your next round.'));
    $('summary-metrics').replaceChildren();for(const [value,label] of [[s.correct,'Correct without help'],[s.answered-s.correct-s.assisted-s.revealed,'Missed choices'],[s.assisted+s.revealed,'Assisted or revealed'],[s.best,'Best streak']]){const div=document.createElement('div'),n=document.createElement('strong'),l=document.createElement('span');n.textContent=value;l.textContent=label;div.append(n,l);$('summary-metrics').append(div);}dashboard();$('summary-title').focus();
  }
  function backup(){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([core.serialize(db)],{type:'application/json'}));link.href=url;link.download='csci2122-syntax-progress.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);text('backup-message','Progress exported.');}
  async function importFile(event){const file=event.target.files[0];if(!file)return;stopTimer();try{if(file.size>3000000)throw Error('Backup too large.');const imported=core.restore(bank,await file.text());if(!window.confirm('Replace this syntax drill’s progress with the imported backup?'))return;db=imported;save();setup();text('backup-message','Progress imported.');}catch(e){text('backup-message','Could not import: '+e.message+' Current progress was kept.');}finally{event.target.value='';}}
  function bind(){
    $('setup-form').addEventListener('submit',e=>{e.preventDefault();start();});$('review-missed').addEventListener('click',()=>start('missed'));
    $('topic').addEventListener('change',()=>{patternOptions();describe();db.settings=choiceSettings();save();});for(const id of ['pattern','length'])$(id).addEventListener('change',()=>{describe();db.settings=choiceSettings();save();});
    $('quick-start').addEventListener('click',()=>{$('topic').value='all';patternOptions();$('length').value='endless';start();});
    $('resume').addEventListener('click',()=>{render(true);$('practice').scrollIntoView({block:'start'});});$('pause').addEventListener('click',()=>{save();setup();});
    $('hint').addEventListener('click',()=>{core.assist(db);save();render();});$('reveal').addEventListener('click',()=>answer(null));$('next').addEventListener('click',advance);$('auto-next').addEventListener('change',scheduleNext);
    $('finish').addEventListener('click',()=>{core.finish(db);save();summary();});$('choose').addEventListener('click',setup);
    $('again').addEventListener('click',()=>{const mode=db.session?.settings.mode||'practice';setup();start(mode);});$('summary-missed').addEventListener('click',()=>{setup();start('missed');});
    $('export').addEventListener('click',backup);$('import').addEventListener('change',importFile);
    $('reset').addEventListener('click',()=>{stopTimer();if(!window.confirm('Reset only this C syntax drill’s progress and saved round?'))return;db=core.fresh(bank);save();setup();text('backup-message','Syntax progress reset.');});
    document.addEventListener('keydown',event=>{if(view!=='practice'||event.repeat||event.ctrlKey||event.metaKey||event.altKey||/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName))return;
      const c=db.session?.current;if(!c)return;if(/^[1-4]$/.test(event.key)&&!c.outcome){event.preventDefault();answer(Number(event.key)-1);}else if(event.key==='Enter'&&c.outcome){event.preventDefault();advance();}
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTimer();});window.addEventListener('pagehide',()=>{stopTimer();save();});
  }
  async function load(){try{core=window.SyntaxDrill;if(!core)throw Error('The drill engine did not load.');const response=await fetch('data/2122-syntax.json',{cache:'no-cache'});if(!response.ok)throw Error('Question bank HTTP '+response.status);bank=await response.json();const errors=core.validate(bank);if(errors.length)throw Error(errors[0]);db=core.fresh(bank);
      try{const saved=localStorage.getItem(KEY);if(saved)db=core.restore(bank,saved);}catch{notice('Saved progress could not be read. A fresh drill is available; you can import a valid backup.');}
      for(const t of bank.topics){const option=document.createElement('option');option.value=t.id;option.textContent=t.title;$('topic').append(option);}text('bank-size',bank.questions.length+' syntax patterns · '+bank.topics.length+' topics · repeat as often as you need');bind();show('loading',false);show('app',true);setup();
    }catch(e){text('load-message','Could not load the syntax drill: '+e.message);show('retry',true);}}
  $('retry').addEventListener('click',()=>window.location.reload());load();
})();
