"""Independent Linux x86-64 check: assemble and execute every new reference case.
Only trusted, repository-owned reference solutions run here, never user submissions.
Requires Python 3, GCC, and an x86-64 Linux host. Temporary artifacts are removed.
"""
import json, re, subprocess, tempfile, platform
from pathlib import Path
if platform.machine() not in ('x86_64','AMD64'): raise SystemExit('Requires x86-64 host')
base=Path(__file__).resolve().parents[1]
bank={'questions':sum([json.loads((base/'data'/name).read_text())['questions'] for name in ['lecture10.json','foundations.json','control-inline.json']],[])}
def num(v):return int(str(v),0) if str(v).lstrip('-').startswith(('0x','0b')) else int(v)
def split(k):
 m=re.fullmatch(r'([A-Za-z_.$][\w.$]*)(?:([+-])((?:0x[\da-fA-F]+|\d+)))?',k)
 if not m: raise ValueError(k)
 return m[1], num((m[2] or '')+(m[3] or '0'))
def width(reg):
 if reg.startswith('r') and not reg.endswith(('d','w','b')):return 8
 if reg.startswith('e') or reg.endswith('d'):return 4
 if reg.endswith('w') or reg in ('ax','bx','cx','dx','si','di','bp','sp'):return 2
 return 1
asm=['.text']; decl=['#include <stdint.h>','#include <stdio.h>'];checks=[];count=0
for q in bank['questions']:
 if q['type']!='code':continue
 for fixture in q['cases']:
  n=count;count+=1;prefix=f'c{n}_';solution=q['solutions'][0]
  labels=re.findall(r'^\s*([\w.$]+):',solution,re.M)
  roots={split(k)[0] for k in fixture['memory']}
  renames={k:prefix+k for k in set(labels)|roots}
  for old,new in sorted(renames.items(),key=lambda x:-len(x[0])):
   solution=re.sub(r'(?<![\w.$%])'+re.escape(old)+r'(?![\w.$])',new,solution)
  entry=prefix+fixture['entry'] if fixture.get('entry') else prefix+'fixture_start'
  if not fixture.get('entry'):
   while entry in renames.values():entry+='_'  # Keep wrapper entry distinct from learner labels.
  outregs=dict(fixture['expected'].get('registers',{}))
  for reg in fixture.get('preserveRegisters',[]):outregs[reg]=fixture['registers'][reg]
  asm+=['.text',f'.globl run_{n}',f'run_{n}:','pushq %rbx','pushq %rbp','pushq %r12','pushq %r13','pushq %r14','pushq %r15','subq $8,%rsp']
  for reg,v in fixture.get('registers',{}).items():
   address=next((renames[k] for k,at in fixture.get('symbols',{}).items() if num(at)==num(v)),None)
   imm=address or str(num(v));asm.append(f'mov{ {8:"q",4:"l",2:"w",1:"b"}[width(reg)]} ${imm},%{reg}')
  asm.append(f'call {entry}')
  for j,reg in enumerate(outregs):asm.append(f'mov{ {8:"q",4:"l",2:"w",1:"b"}[width(reg)]} %{reg},observed_{n}+{j*8}(%rip)')
  asm+=['addq $8,%rsp','popq %r15','popq %r14','popq %r13','popq %r12','popq %rbp','popq %rbx','ret']
  if not fixture.get('entry'):asm.append(entry+':')
  asm.append(solution)
  if not fixture.get('function'):asm.append('ret')
  asm+=['.data',f'.globl observed_{n}',f'observed_{n}: .zero {max(8,len(outregs)*8)}']
  decl+=[f'extern void run_{n}(void);',f'extern uint64_t observed_{n}[];']
  checks.append(f'run_{n}();')
  for j,(reg,v) in enumerate(outregs.items()):
   val=num(v)&((1<<(width(reg)*8))-1)
   checks.append(f'if(observed_{n}[{j}] != UINT64_C({val})) {{puts("{q["id"]} case {n} {reg}"); return 1;}}')
  for root in roots:
   cells={split(k)[1]:(k,v) for k,v in fixture['memory'].items() if split(k)[0]==root}
   size=max(off+fixture.get('memoryWidths',{}).get(k,fixture.get('memoryWidth',4)) for off,(k,v) in cells.items())
   data=bytearray(size)
   for off,(k,v) in cells.items():
    w=fixture.get('memoryWidths',{}).get(k,fixture.get('memoryWidth',4));data[off:off+w]=((num(v) if v is not None else 0)&((1<<(w*8))-1)).to_bytes(w,'little')
   name=renames[root];asm+=['.balign 8',f'.globl {name}',f'{name}: .byte '+','.join(map(str,data))];decl.append(f'extern unsigned char {name}[];')
   for off,(k,v) in cells.items():
    expected=fixture['expected'].get('memory',{}).get(k,v)
    if expected is None:continue
    w=fixture.get('memoryWidths',{}).get(k,fixture.get('memoryWidth',4));value=num(expected)&((1<<(w*8))-1)
    for i,b in enumerate(value.to_bytes(w,'little')):checks.append(f'if({name}[{off+i}] != {b}) {{puts("{q["id"]} case {n} memory {k}");return 1;}}')
asm.append('.section .note.GNU-stack,"",@progbits')
with tempfile.TemporaryDirectory(prefix='assembly-native-') as tmp:
 p=Path(tmp);(p/'suite.s').write_text('\n'.join(asm)+'\n');(p/'main.c').write_text('\n'.join(decl)+'\nint main(void){\n'+'\n'.join(checks)+f'\nprintf("Native reference cases passed: {count}\\n");return 0;}}\n')
 subprocess.run(['gcc','-no-pie','-o',str(p/'test'),str(p/'main.c'),str(p/'suite.s')],check=True)
 subprocess.run([str(p/'test')],check=True,timeout=10)
