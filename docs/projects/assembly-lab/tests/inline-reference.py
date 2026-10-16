"""Compile the actual displayed native-inline examples under optimized GCC builds.

Runs only trusted course-owned C. The browser never compiles or runs this code.
Requires Linux x86-64 LP64, GCC, and Python; no external packages.
"""
import ctypes as C
import json
import platform
import subprocess
import tempfile
from pathlib import Path

if platform.system()!='Linux' or platform.machine() not in ('x86_64','AMD64') or C.sizeof(C.c_long)!=8:
    raise SystemExit('Requires Linux x86-64 LP64')
base=Path(__file__).resolve().parents[1]
steps=json.loads((base/'data/lessons.json').read_text())['lessons']
examples=[s['worked']['goal'] for l in steps for s in l['steps'] if s['worked'].get('nativeC')]
assert len(examples)==10
source='\n'.join(examples)
count=0
with tempfile.TemporaryDirectory(prefix='assembly-inline-') as temporary:
    folder=Path(temporary);(folder/'examples.c').write_text(source)
    for index,options in enumerate([['-O0'],['-O2'],['-O3'],['-O3','-flto']]):
        target=folder/f'examples-{index}.so'
        subprocess.run(['gcc','-std=c11','-Wall','-Wextra','-Werror','-shared','-fPIC',
                        '-fsanitize=undefined','-fno-sanitize-recover=all',*options,
                        str(folder/'examples.c'),'-o',str(target)],check=True)
        lib=C.CDLL(str(target))
        def fn(name,args,restype=C.c_long):
            f=getattr(lib,name);f.argtypes=args;f.restype=restype;return f
        fn('basic_nop',[],None)();count+=1
        constant=fn('inline_constant',[]);assert constant()==42;count+=1
        copy=fn('inline_copy',[C.c_long])
        for x in [-9223372036854775808,-1,0,1,9223372036854775807]:assert copy(x)==x;count+=1
        for name,operation in [('inline_product',lambda x,y:x*y),('inline_scratch',lambda x,y:x*y),('inline_sum',lambda x,y:x+y)]:
            f=fn(name,[C.c_long,C.c_long])
            for x,y in [(13,7),(-9,4),(-31,-17),(0,7),(7,0),(1073741824,3)]:
                assert f(x,y)==operation(x,y),(options,name,x,y);count+=1
        increment=fn('inline_increment',[C.POINTER(C.c_long)],None)
        store=fn('inline_store',[C.POINTER(C.c_long),C.c_long],None)
        for x in [-1,0,41]:
            memory=(C.c_long*2)(x,12345);increment(memory)
            assert list(memory)==[x+1,12345];count+=1
            store(memory,x-7);assert list(memory)==[x-7,12345];count+=1
        # Real values vary: verify the explicit first-call policy, not a timing claim.
        reader=fn('read_tsc',[],C.c_ulong);reader();count+=1
        ticks=fn('ticks_since',[],C.c_ulong);assert ticks()==0;count+=1
        ticks();count+=1
print(f'Native inline examples passed: {len(examples)} displayed functions, 4 GCC builds, {count} checks')
