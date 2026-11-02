(function (root) {
  'use strict';
  const grammars = {
    matching: {title:'Matched outer blocks',start:'S',rules:{S:[['a','S','b'],[]]},example:'aaabbb'},
    balanced: {title:'Balanced parentheses',start:'S',rules:{S:[['(','S',')','S'],[]]},example:'(()())'},
    expressions: {title:'Addition and grouped expressions',start:'E',rules:{E:[['T','R']],R:[['+','T','R'],[]],T:[['id'],['(','E',')']]},example:'id+id'}
  };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function leaves(n){return n.children?n.children.flatMap(leaves):[n];}
  function createTree(g){return {label:g.start};}
  function derive(tree,g,choice){
    const node=leaves(tree).find(n=>g.rules[n.label]);
    if(!node)return null;
    const rhs=g.rules[node.label][choice];
    if(!rhs)throw new Error('Choose an available rule.');
    node.children=(rhs.length?rhs:['ε']).map(label=>({label}));
    return `${node.label} → ${rhs.join(' ')||'ε'}`;
  }
  function grammarTrace(g,input,limit=15000){
    const tokens=g===grammars.expressions?(input.match(/id|[()+]/g)||[]):Array.from(input);
    if(tokens.join('')!==input)return {status:'invalid',rows:[],message:'Input contains symbols outside this grammar.'};
    if(tokens.length>14)return {status:'bounded',rows:[],message:'Use at most 14 input tokens for this teaching search.'};
    const first={stack:[g.start,'#'],pos:0,rows:[{action:'Push start variable above #',stack:g.start+' #',consumed:'ε',remaining:input||'ε'}]};
    const queue=[first],seen=new Set();let at=0,truncated=false;
    while(at<queue.length&&at<limit){
      const s=queue[at++],key=s.pos+'|'+s.stack.join('\u0001');if(seen.has(key))continue;seen.add(key);
      if(!s.stack.length&&s.pos===tokens.length)return {status:'accepted',rows:s.rows};
      if(s.stack.length>2*tokens.length+12){truncated=true;continue;}
      const top=s.stack[0];
      const add=(stack,pos,action)=>queue.push({stack,pos,rows:s.rows.concat({action,stack:stack.join(' ')||'ε',consumed:tokens.slice(0,pos).join('')||'ε',remaining:tokens.slice(pos).join('')||'ε'})});
      if(g.rules[top])for(const rhs of g.rules[top])add(rhs.concat(s.stack.slice(1)),s.pos,top+' → '+(rhs.join(' ')||'ε'));
      else if(top==='#'){if(s.pos===tokens.length)add([],s.pos,'End of input: pop #');}
      else if(s.pos<tokens.length&&top===tokens[s.pos])add(s.stack.slice(1),s.pos+1,'Match and pop '+top);
    }
    return {status:at>=limit||truncated?'bounded':'rejected',rows:[],message:at>=limit||truncated?'No accepting run found within this bounded search. This is not a proof of rejection.':'Every possible run in this finite search rejected.'};
  }
  function pdaTrace(kind,input){
    if(input.length>40)return {status:'invalid',rows:[],message:'Use at most 40 input symbols.'};
    const alphabet=kind==='balanced'?/^[()]*$/:kind==='ratio'?/^[01]*$/:/^[abc]*$/;
    if(!alphabet.test(input))return {status:'invalid',rows:[],message:'Use only the displayed input alphabet. The end marker is added automatically.'};
    let stack=['#'],state='q',pos=0;
    const rows=[{action:'Initial configuration',state,stack:'#',consumed:'ε',remaining:input+'⊣'}];
    const row=action=>rows.push({action,state,stack:stack.slice().reverse().join(' ')||'ε',consumed:input.slice(0,pos)||'ε',remaining:input.slice(pos)+'⊣'});
    for(const ch of input){
      if(kind==='balanced'){
        if(ch==='('){stack.push('X');row('Read (: push X');}
        else if(stack.at(-1)==='X'){stack.pop();row('Read ): pop X');}
        else {row('No transition: unmatched closing parenthesis');return {status:'rejected',rows};}
      }else if(kind==='ratio'){
        if(ch==='0'&&state==='q'){stack.push('X','X');row('Read 0: push two X symbols');}
        else if(ch==='1'&&stack.at(-1)==='X'){state='r';stack.pop();row('Read 1: pop one X');}
        else {row('No transition: wrong phase or no matching X');return {status:'rejected',rows};}
      }else{
        if(ch==='c')row('Read c: leave stack unchanged');
        else {const own=ch==='a'?'A':'B',opposite=ch==='a'?'B':'A';if(stack.at(-1)===opposite){stack.pop();row('Read '+ch+': cancel one '+opposite);}else{stack.push(own);row('Read '+ch+': push '+own);}}
      }
      pos++;rows.at(-1).consumed=input.slice(0,pos)||'ε';rows.at(-1).remaining=input.slice(pos)+'⊣';
    }
    if(stack.length!==1){row('At ⊣: unmatched stack symbols remain');return {status:'rejected',rows};}
    stack=[];state='done';rows.push({action:'Read ⊣: pop #',state,stack:'ε',consumed:input+'⊣',remaining:'ε'});
    return {status:'accepted',rows};
  }
  function pumping(kind,p,start,a,gap,b,i){
    const text=kind==='copy'?'0'.repeat(2*p)+'1'.repeat(2*p)+'0'.repeat(2*p)+'1'.repeat(2*p):'a'.repeat(p)+'b'.repeat(p)+'c'.repeat(p);
    const end=start+a+gap+b;
    if(![p,start,a,gap,b,i].every(Number.isInteger)||p<1||p>8||start<0||a<0||gap<0||b<0||i<0||i>3||a+b<1||a+gap+b>p||end>text.length)throw new Error('Require p = 1…8, nonnegative lengths and start, |v| + |y| ≥ 1, |vxy| ≤ p, and a window inside the string.');
    const u=text.slice(0,start),v=text.slice(start,start+a),x=text.slice(start+a,start+a+gap),y=text.slice(start+a+gap,end),z=text.slice(end);
    const result=u+v.repeat(i)+x+y.repeat(i)+z;
    const member=kind==='copy'?result.length%2===0&&result.slice(0,result.length/2)===result.slice(result.length/2):/^a*b*c*$/.test(result)&&[...result].filter(c=>c==='a').length===[...result].filter(c=>c==='b').length&&[...result].filter(c=>c==='b').length===[...result].filter(c=>c==='c').length;
    return {text,u,v,x,y,z,result,member};
  }
  function treeSvg(tree,g){
    let x=0,maxDepth=0;const nodes=[],edges=[];
    function visit(n,d){const obj={n,d};maxDepth=Math.max(maxDepth,d);if(n.children){obj.children=n.children.map(c=>visit(c,d+1));obj.x=obj.children.reduce((s,c)=>s+c.x,0)/obj.children.length;for(const c of obj.children)edges.push([obj,c]);}else obj.x=35+70*x++;nodes.push(obj);return obj;}
    visit(tree,0);const w=Math.max(400,70*x+20),h=80+maxDepth*80;
    return `<svg class="parse-tree" role="img" aria-label="Current parse tree. Its leaves in order are ${esc(leaves(tree).map(n=>n.label).join(' '))}" viewBox="0 0 ${w} ${h}" style="min-width:${w}px">${edges.map(([a,b])=>`<line x1="${a.x}" y1="${28+a.d*80}" x2="${b.x}" y2="${28+b.d*80}" stroke="#b6c4bc"/>`).join('')}${nodes.map(o=>`<g transform="translate(${o.x},${28+o.d*80})"><rect x="-23" y="-17" width="46" height="34" rx="4" fill="${g.rules[o.n.label]?'#e1f2e8':'#fff'}" stroke="#9ab4a5"/><text y="5" text-anchor="middle" fill="#213c2c" font-size="16" font-family="ui-monospace,monospace">${esc(o.n.label)}</text></g>`).join('')}</svg>`;
  }
  function table(rows){return `<div class="tool-scroll"><table><thead><tr>${['Step','Action','State','Consumed','Remaining input','Stack (top at left)'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i}</td><td>${esc(r.action)}</td><td>${esc(r.state||'q')}</td><td><code>${esc(r.consumed)}</code></td><td><code>${esc(r.remaining)}</code></td><td><code>${esc(r.stack)}</code></td></tr>`).join('')}</tbody></table></div>`;}
  function mount(el){
    el.innerHTML=`<style>.tool-section{border-top:1px solid #dfe5e2;padding:26px 0;margin-top:26px}.tool-section label{display:block;margin:12px 0;font-weight:600;font-size:.88rem}.tool-section input,.tool-section select{display:block;max-width:100%;padding:8px;border:1px solid #bdccc4;border-radius:4px;background:white}.tool-section input[type=number]{width:85px}.tool-controls{display:flex;gap:14px;flex-wrap:wrap;align-items:end}.tool-scroll{overflow:auto;margin:18px 0}.tool-scroll table{width:100%;border-collapse:collapse;font-size:.82rem}.tool-scroll td,.tool-scroll th{padding:10px;text-align:left;border:1px solid #dfe5e2;white-space:nowrap}.tool-scroll th{background:#f1f6f3}.tool-output{border-left:3px solid #087f5b;background:#f5f8f6;padding:15px;margin:18px 0}.parse-tree{display:block;width:100%;height:auto}.pump-string{font:16px/2 ui-monospace,monospace;word-break:break-all}.pump-v{background:#b9e9d2;padding:3px 0}.pump-y{background:#f6d791;padding:3px 0}.pump-x{background:#e6eaf1;padding:3px 0}</style>
    <p>Make one change at a time and explain its effect before checking the result. These tools illustrate specific grammars and machines; written constructions still need a general explanation.</p>
    <section class="tool-section" id="tree-tool"><h2>1. Build a derivation and its parse tree</h2><p>Expand the leftmost variable. A production replaces one variable leaf with all symbols on its right side. The terminal leaves, read left to right, form the generated string.</p><label>Grammar<select id="tree-grammar">${Object.entries(grammars).map(([k,v])=>`<option value="${k}">${v.title}</option>`).join('')}</select></label><pre id="tree-rules"></pre><div id="tree-choices" class="tool-controls"></div><p><button id="tree-reset">Start again</button> <button id="tree-undo">Undo one expansion</button></p><div id="tree-result" aria-live="polite"></div></section>
    <section class="tool-section"><h2>2. Trace a complete PDA run</h2><p>Each row shows the configuration after the named action. The stack top is always at the left. A machine accepts only after it consumes the entire input and empties the stack.</p><label>Machine<select id="pda-kind"><option value="balanced">Deterministic: balanced parentheses</option><option value="ratio">Deterministic: 0ⁿ1²ⁿ</option><option value="cancel">Deterministic: equal a and b counts; c ignored</option><option value="grammar">Nondeterministic: balanced grammar → PDA</option></select></label><div class="tool-output" id="pda-convention"></div><label>Input string (leave blank for ε)<input id="pda-input" value="(()())" maxlength="40" spellcheck="false" autocomplete="off"></label><button id="pda-run">Trace input</button><div id="pda-result" aria-live="polite"></div></section>
    <section class="tool-section"><h2>3. Inspect a pumping decomposition</h2><p>Use s = uvxyz, where |vxy| ≤ p and |vy| ≥ 1. You may inspect one proposed decomposition here. A proof must cover <strong>every</strong> legal decomposition.</p><label>Witness<select id="pump-kind"><option value="triple">aᵖbᵖcᵖ (equal three blocks)</option><option value="copy">0²ᵖ1²ᵖ0²ᵖ1²ᵖ (copy language)</option></select></label><div class="tool-controls">${[['p','Pumping length p',3,1,8],['start','Start of v (zero based)',1,0,64],['v','Length of v',1,0,8],['x','Length of x',1,0,8],['y','Length of y',1,0,8],['i','Repeat count i',0,0,3]].map(([k,l,v,min,max])=>`<label>${l}<input type="number" id="pump-${k}" value="${v}" min="${min}" max="${max}" step="1"></label>`).join('')}</div><button id="pump-run">Show pumped string</button><div id="pump-result" aria-live="polite"></div></section>`;
    let tree,g,history=[];
    const $=id=>el.querySelector('#'+id);
    const showTree=()=>{const live=leaves(tree).filter(n=>n.label!=='ε'),next=live.find(n=>g.rules[n.label]);$('tree-rules').textContent=Object.entries(g.rules).map(([l,rs])=>l+' → '+rs.map(r=>r.join(' ')||'ε').join(' | ')).join('\n');$('tree-choices').innerHTML=next?g.rules[next.label].map((rhs,i)=>`<button data-rule="${i}">Use ${esc(next.label)} → ${esc(rhs.join(' ')||'ε')}</button>`).join(''):'<p>No variables remain. The derivation is complete.</p>';$('tree-result').innerHTML=`<p>Current sentential form: <code>${esc(live.map(n=>n.label).join(' ')||'ε')}</code></p><p>${next?'Next variable to expand: <strong>'+esc(next.label)+'</strong>':'Generated string: <strong>'+esc(live.map(n=>n.label).join('')||'ε')+'</strong>'}</p><div class="tool-scroll">${treeSvg(tree,g)}</div><details><summary>Production history (${history.length} steps)</summary><ol>${history.map(h=>`<li>${esc(h.action)}</li>`).join('')}</ol></details>`;$('tree-undo').disabled=!history.length;};
    const reset=()=>{g=grammars[$('tree-grammar').value];tree=createTree(g);history=[];showTree();};
    $('tree-choices').addEventListener('click',e=>{const b=e.target.closest('[data-rule]');if(!b)return;if(history.length>=35){$('tree-result').insertAdjacentHTML('afterbegin','<p role="status">This small diagram supports 35 expansions. Start again to build another tree.</p>');return;}const before=JSON.stringify(tree),action=derive(tree,g,Number(b.dataset.rule));history.push({before,action});showTree();});
    $('tree-grammar').addEventListener('change',reset);$('tree-reset').addEventListener('click',reset);$('tree-undo').addEventListener('click',()=>{const last=history.pop();if(last){tree=JSON.parse(last.before);showTree();}});reset();
    const convention=()=>{const k=$('pda-kind').value;$('pda-convention').innerHTML=k==='grammar'?'<strong>Grammar simulation.</strong> S → ( S ) S | ε. The machine guesses expansions and matches terminal stack symbols. A bounded breadth-first search finds an accepting branch when available; the shown run is one branch. # is popped after the input is exhausted.':'<strong>End-marker convention.</strong> The tool appends ⊣ to the input. Only reading ⊣ with # on top pops the marker. This permits deterministic empty-stack acceptance, including ε. ⊣ is an added input symbol and is not part of the original language alphabet.';};
    $('pda-kind').addEventListener('change',()=>{const k=$('pda-kind').value;$('pda-input').value={balanced:'(()())',ratio:'001111',cancel:'bacab',grammar:'(()())'}[k];$('pda-result').innerHTML='';convention();});convention();
    $('pda-run').addEventListener('click',()=>{const k=$('pda-kind').value,input=$('pda-input').value,r=k==='grammar'?grammarTrace(grammars.balanced,input):pdaTrace(k,input);$('pda-result').innerHTML=`<p class="tool-output"><strong>${esc(r.status.toUpperCase())}</strong>${r.message?' · '+esc(r.message):''}</p>${r.rows.length?table(r.rows):''}`;});
    $('pump-run').addEventListener('click',()=>{try{const r=pumping($('pump-kind').value,...['p','start','v','x','y','i'].map(k=>Number($('pump-'+k).value)));$('pump-result').innerHTML=`<p class="pump-string">${esc(r.u)}<span class="pump-v" title="v">${esc(r.v)}</span><span class="pump-x" title="x">${esc(r.x)}</span><span class="pump-y" title="y">${esc(r.y)}</span>${esc(r.z)}</p><p>Green = v; grey = x; amber = y. Only v and y repeat.</p><table><tbody>${['u','v','x','y','z'].map(k=>`<tr><th>${k}</th><td><code>${esc(r[k]||'ε')}</code></td></tr>`).join('')}</tbody></table><p>Pumped string uvⁱxyⁱz:</p><p class="pump-string">${esc(r.result||'ε')}</p><p class="tool-output">This string ${r.member?'remains in':'is outside'} the selected language. ${r.member?'Try a different exponent. A surviving example does not establish that the language is context-free.':'This defeats this one decomposition. A complete proof must defeat all legal decompositions.'}</p>`;}catch(e){$('pump-result').innerHTML=`<p class="tool-output">${esc(e.message)}</p>`;}});
  }
  const api={grammars,createTree,derive,leaves,grammarTrace,pdaTrace,pumping,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.CFLTools=api;
})(typeof window!=='undefined'?window:globalThis);
