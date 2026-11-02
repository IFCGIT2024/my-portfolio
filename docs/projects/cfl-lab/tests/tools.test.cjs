const assert=require('node:assert/strict');
const T=require('../tools.js');
const words=(alphabet,n)=>{let all=[''],level=[''];for(let i=0;i<n;i++){level=level.flatMap(s=>alphabet.map(c=>s+c));all.push(...level);}return all;};
function balanced(s){let depth=0;for(const c of s){depth+=c==='('?1:-1;if(depth<0)return false;}return depth===0;}
for(const s of words(['(',')'],8)) assert.equal(T.pdaTrace('balanced',s).status==='accepted',balanced(s),s);
for(const s of words(['0','1'],8)) assert.equal(T.pdaTrace('ratio',s).status==='accepted',/^0*1*$/.test(s)&&[...s].filter(c=>c==='1').length===2*[...s].filter(c=>c==='0').length,s);
for(const s of words(['a','b','c'],6)) assert.equal(T.pdaTrace('cancel',s).status==='accepted',[...s].filter(c=>c==='a').length===[...s].filter(c=>c==='b').length,s);
for(const s of words(['(',')'],5)){const r=T.grammarTrace(T.grammars.balanced,s);if(balanced(s))assert.equal(r.status,'accepted',s);else assert.notEqual(r.status,'accepted',s);}
const tree=T.createTree(T.grammars.matching);T.derive(tree,T.grammars.matching,0);T.derive(tree,T.grammars.matching,0);T.derive(tree,T.grammars.matching,1);assert.equal(T.leaves(tree).filter(n=>n.label!=='ε').map(n=>n.label).join(''),'aabb');
for(const kind of ['triple','copy'])for(let p=1;p<=4;p++){const length=(kind==='copy'?8:3)*p;for(let start=0;start<length;start++)for(let a=0;a<=p;a++)for(let x=0;x<=p-a;x++)for(let b=0;b<=p-a-x;b++)if(a+b>0&&start+a+x+b<=length)assert.equal(T.pumping(kind,p,start,a,x,b,0).member,false,`${kind} p=${p} start=${start} v=${a} x=${x} y=${b}`);}
assert.equal(T.grammarTrace(T.grammars.balanced,'(()())').status,'accepted');assert.equal(T.grammarTrace(T.grammars.expressions,'id+id').status,'accepted');assert.equal(T.pdaTrace('balanced','a').status,'invalid');assert.throws(()=>T.pumping('copy',3,0,0,1,0,0));
console.log('Tools: exhaustive small-input machine checks, grammar/tree invariants, and legal pumping decompositions passed.');
