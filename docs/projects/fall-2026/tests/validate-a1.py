"""Validate the A1 bank and execute its displayed, defined C17 output examples.

Run: python docs/projects/fall-2026/tests/validate-a1.py
Requires gcc. Intentional undefined-behavior questions are never executed.
"""
import collections
import json
from pathlib import Path
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
bank = json.loads((root / 'data/2122-a1.json').read_text())
questions = bank['questions']
assert len(questions) == 160
assert len({q['id'] for q in questions}) == 160
assert len({(q['question'], q.get('code', '')) for q in questions}) == 160
assert collections.Counter(q['correct'] for q in questions) == {0:40, 1:40, 2:40, 3:40}
assert len(collections.Counter(q['section'] for q in questions)) == 16
assert set(collections.Counter(q['section'] for q in questions).values()) == {10}
for q in questions:
    assert len(q['options']) == len(set(q['options'])) == 4, q['id']
    assert type(q['correct']) is int and 0 <= q['correct'] < 4, q['id']
    assert q['question'] and q['explanation'] and all(q['options']), q['id']
    assert not re.search(r'spellbee|panagram|letterMask|countBits|assignment', q['question'], re.I), q['id']
    assert '\x00' not in json.dumps(q, ensure_ascii=False), q['id']

headers = '''#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
_Static_assert(CHAR_BIT == 8, "8-bit bytes required by this bank");
_Static_assert(sizeof(int) == 4 && UINT_MAX == 4294967295u, "32-bit ints required");
_Static_assert(INT_MAX == 2147483647, "signed int range required");
_Static_assert('A' == 65 && 'Z' == 90, "ASCII required");
'''
checked = 0
with tempfile.TemporaryDirectory() as tmp:
    source, binary = Path(tmp)/'question.c', Path(tmp)/'question'
    for q in questions:
        verification = q.get('verification')
        if not verification:
            continue
        assert verification['kind'] == 'output'
        code = q['code']
        if 'int main(void)' not in code:
            code = 'int main(void) {\n' + code + '\nreturn 0;\n}\n'
        source.write_text(headers + code)
        subprocess.run(['gcc', '-std=c17', '-pedantic-errors', '-Wall', '-Wextra',
                        '-Werror=format', '-Werror=implicit-function-declaration',
                        '-fsanitize=undefined', '-fno-sanitize-recover=all',
                        str(source), '-o', str(binary)], check=True, capture_output=True, text=True)
        result = subprocess.run([str(binary)], input=verification.get('stdin',''),
                                capture_output=True, text=True, timeout=2, check=True)
        expected = q['options'][q['correct']].rstrip()
        assert result.stdout.rstrip() == expected, (q['id'], result.stdout, expected)
        assert not result.stderr, (q['id'], result.stderr)
        checked += 1
print(f'PASS: 160 questions, 16 topics, balanced key; {checked} C17 output examples compiled and verified.')
