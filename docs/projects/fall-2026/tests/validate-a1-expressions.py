"""Check all four choices in mask-expression questions against independent oracles.

The displayed C choices are compiled verbatim, then exercised over low-bit
combinations, empty/full masks, and high-bit boundary values. A wrong choice
must have a counterexample; exactly the keyed choice must satisfy every case.
Run: python docs/projects/fall-2026/tests/validate-a1-expressions.py
"""
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
bank = {q['id']:q for q in json.loads((root/'data/2122-a1.json').read_text())['questions']}
U = (1 << 32) - 1
values = list(range(32)) + [63, 127, 255, 0x80000000, 0x80000001, U]
def bits(x):
    return {i for i in range(32) if (x // (2**i)) % 2}
def number(items):
    return sum(2**i for i in items)

checks = []
def add(qid, names, cases, oracle, statement=False):
    checks.append((qid, names, list(cases), oracle, statement))
one = [(x,) for x in values]
pair = [(a,b) for a in values for b in values]
xk = [(x,k) for x in values for k in [0,1,2,3,4,5,7,15,30,31]]
add('C031', ['x','k'], xk, lambda x,k: int(k in bits(x)))
add('C034', ['x'], one, lambda x: int(4 in bits(x)))
add('C035', ['x'], one, lambda x: x % 16)
add('C037', ['x'], one, lambda x: (x // 16) % 16)
add('C039', ['flags','mask'], pair, lambda a,b: int(bool(bits(a) & bits(b))))
add('C040', ['flags','mask'], pair, lambda a,b: int(bits(b) <= bits(a)))
add('C041', ['x','k'], xk, lambda x,k: number(bits(x) | {k}), True)
add('C042', ['x','k'], xk, lambda x,k: number(bits(x) - {k}), True)
add('C043', ['x','k'], xk, lambda x,k: number(bits(x) ^ {k}), True)
add('C048', ['flags'], one, lambda x: number(bits(x) | {1,4}), True)
add('C049', ['x','mask'], pair, lambda x,m: number(bits(x) - bits(m)), True)
add('C051', ['a','b'], pair, lambda a,b: number(bits(a) | bits(b)))
add('C052', ['a','b'], pair, lambda a,b: number(bits(a) & bits(b)))
add('C053', ['a','b'], pair, lambda a,b: number(bits(a) - bits(b)))
add('C054', ['a','b'], pair, lambda a,b: number(bits(a) ^ bits(b)))
add('C055', ['needed','available'], pair, lambda a,b: int(bits(a) <= bits(b)))
add('C060', ['a'], [(x,) for x in range(16)], lambda a: number(set(range(4)) - bits(a)))
add('C076', ['x'], [(x,) for x in values if x], lambda x: number(bits(x) - {min(bits(x))}), True)
add('C151', ['flags'], one, lambda x: number((bits(x) | {0,2}) - {1}))
add('C152', ['x','value'], [(x,v) for x in values for v in range(8)],
    lambda x,v: number((bits(x) - {2,3,4}) | {i+2 for i in bits(v)}))
add('C153', ['x'], one, lambda x: int(len(bits(x)) == 1))
add('C155', ['a','b'], pair, lambda a,b: 1)

with tempfile.TemporaryDirectory() as tmp:
    src, exe = Path(tmp)/'choices.c', Path(tmp)/'choices'
    total = 0
    for qid, names, cases, oracle, statement in checks:
        q = bank[qid]
        functions = []
        parameters = ', '.join('unsigned int '+name for name in names)
        for i, option in enumerate(q['options']):
            body = option + '\nreturn ' + names[0] + ';' if statement else 'return ' + option + ';'
            functions.append(f'unsigned int f{i}({parameters}) {{ {body} }}')
        declarations = '\n'.join('unsigned int '+name+';' for name in names)
        fmt = ' '.join('%u' for _ in names)
        addresses = ', '.join('&'+name for name in names)
        args = ', '.join(names)
        calls = ', '.join(f'f{i}({args})' for i in range(4))
        src.write_text('#include <stdio.h>\n'+'\n'.join(functions)+
            f'\nint main(void) {{ {declarations}\nwhile (scanf("{fmt}", {addresses}) == {len(names)}) '
            f'printf("%u %u %u %u\\n", {calls});\nreturn 0; }}\n')
        subprocess.run(['gcc','-std=c17','-pedantic-errors','-fsanitize=undefined',
                        '-fno-sanitize-recover=all',str(src),'-o',str(exe)],check=True,capture_output=True)
        text = '\n'.join(' '.join(map(str,case)) for case in cases)+'\n'
        run = subprocess.run([str(exe)],input=text,text=True,capture_output=True,check=True,timeout=3)
        actual = [list(map(int,line.split())) for line in run.stdout.splitlines()]
        assert len(actual) == len(cases)
        passing = [i for i in range(4) if all(row[i] == oracle(*case) for row,case in zip(actual,cases))]
        assert passing == [q['correct']], (qid, passing, q['correct'])
        total += len(cases) * 4
print(f'PASS: all four choices for {len(checks)} mask questions; {total:,} candidate evaluations against set/bit oracles.')
