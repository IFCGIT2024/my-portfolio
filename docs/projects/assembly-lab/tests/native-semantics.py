"""Compare the interpreter with real x86-64 for shifts, flags and q immediates.

Runs only the fixed programs generated below, never learner submissions.
Requires Linux x86-64, GCC, Python 3 and Node. No third-party dependencies.
"""
import json
import platform
import subprocess
import tempfile
from pathlib import Path

if platform.system() != 'Linux' or platform.machine() not in ('x86_64', 'AMD64'):
    raise SystemExit('Requires Linux x86-64')

base = Path(__file__).resolve().parents[1]
programs = []
for bits, suffix, reg in [(8, 'b', 'al'), (16, 'w', 'ax'), (32, 'l', 'eax'), (64, 'q', 'rax')]:
    counts = sorted({0, 1, bits - 1, bits, bits + 1, 31, 32, 63, 64, 255})
    for op in ['shl', 'sal', 'shr', 'sar']:
        for count in counts:
            for value in ['0', '0xffffffffffffffff', '0x8000000080008080', '0x123456789abcdef0']:
                for variable in [False, True]:
                    operand = '%cl' if variable else f'${count}'
                    programs.append(f'movq ${value},%rax\nmovl ${count},%ecx\ncmpq $-1,%rax\n{op}{suffix} {operand},%{reg}')

for op in ['and', 'or', 'xor', 'add', 'sub', 'cmp', 'test', 'imul']:
    for immediate in ['-9', '0xfffffffffffffff7', '-1', '0xffffffffffffffff', '-2147483648', '0xffffffff80000000', '2147483647']:
        programs.append(f'movq $0x8000000012345678,%rax\n{op}q ${immediate},%rax')
programs.append('pushq $0xfffffffffffffff7\npopq %rax\ncmpq $-9,%rax')

# Every supported extension form, including destination partial-write effects.
for op in ['movzbw','movzbl','movzbq','movzwl','movzwq',
           'movsbw','movsbl','movsbq','movswl','movswq','movslq']:
    src = {'b':'dl','w':'dx','l':'edx'}[op[-2]]
    dst = {'w':'ax','l':'eax','q':'rax'}[op[-1]]
    for value in [0,1,127,128,255,32767,32768,65535,2147483648,4294967295]:
        programs.append(f'movq $-1,%rax\nmovq ${value},%rdx\ncmpq $3,%rdx\n{op} %{src},%{dst}')

# Condition bytes retain unrelated upper bytes and preserve the source flags.
conditions=['e','ne','g','ge','l','le','s','ns','o','no','a','ae','b','be',
            'z','nz','nle','nl','nge','ng','c','nae','nc','nb','na','nbe']
for cc in conditions:
    for x,y in [(0,0),(1,2),(2,1),(-1,1),(9223372036854775807,-1),(-9223372036854775808,1)]:
        programs.append(f'movq $0x1122334455667788,%rax\nmovq ${x},%rdi\nmovq ${y},%rsi\ncmpq %rsi,%rdi\nset{cc} %al')
    for start in [127,255]:
        programs.append(f'movl ${start},%eax\naddb $1,%al\nset{cc} %dl\nmovzbq %dl,%rax')

# The native functions return RAX and save RFLAGS before any later instructions
# can overwrite flags. RDX/RCX are caller-saved; no callee-saved state is changed.
asm = ['.text']
decl = ['#include <stdio.h>', '#include <stdint.h>', 'uint64_t observed_flags;']
checks = []
for index, code in enumerate(programs):
    asm += [f'.globl probe_{index}', f'probe_{index}:', code,
            'pushfq', 'popq %rdx', 'movq %rdx,observed_flags(%rip)', 'ret']
    decl.append(f'extern uint64_t probe_{index}(void);')
    checks.append(f'v=probe_{index}(); printf("%llu %llu\\n", (unsigned long long)v, (unsigned long long)observed_flags);')
asm.append('.section .note.GNU-stack,"",@progbits')

with tempfile.TemporaryDirectory(prefix='assembly-semantics-') as temp:
    path = Path(temp)
    (path / 'suite.s').write_text('\n'.join(asm) + '\n')
    (path / 'main.c').write_text('\n'.join(decl) + '\nint main(void){ uint64_t v;\n' + '\n'.join(checks) + '\nreturn 0;}\n')
    subprocess.run(['gcc', '-no-pie', '-o', str(path / 'test'), str(path / 'main.c'), str(path / 'suite.s')], check=True)
    native = subprocess.check_output([str(path / 'test')], text=True, timeout=20).splitlines()

    runner = """
const E=require(process.argv[1]);
const programs=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
console.log(JSON.stringify(programs.map(code=>{
  const state=E.execute(code);
  return {value:BigInt.asUintN(64,state.registers.get('rax')).toString(),flags:state.flags};
})));
"""
    simulated = json.loads(subprocess.check_output(['node', '-e', runner, str(base / 'engine.js')], input=json.dumps(programs), text=True, timeout=20))
    assert len(native) == len(simulated) == len(programs)
    for code, actual, expected in zip(programs, simulated, native):
        value, flags = map(int, expected.split())
        assert int(actual['value']) == value, (code, actual, expected)
        # Undefined flags are deliberately absent from JSON and are not compared.
        for name, bit in [('CF', 0), ('ZF', 6), ('SF', 7), ('OF', 11)]:
            if name in actual['flags']:
                assert actual['flags'][name] == bool(flags & (1 << bit)), (code, name, actual, expected)

print(f'Native instruction/flag comparisons passed: {len(programs)}')
