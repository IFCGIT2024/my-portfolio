"""Compile the displayed guided-course C functions and check their fixtures.

Trusted repository-owned C only, never imported banks or student submissions.
Machine-state snippets (aliases, push/pop and the global copy) are checked by
native-reference.py instead. C cannot specify the assembly-only clobber rules.
Requires Linux x86-64, GCC, Python 3 and the GCC undefined-behavior sanitizer.
"""
import ctypes as C
import json
import platform
import re
import subprocess
import tempfile
from pathlib import Path

if platform.machine() not in ('x86_64', 'AMD64') or C.sizeof(C.c_long) != 8:
    raise SystemExit('Requires x86-64 LP64 host')
base = Path(__file__).resolve().parents[1]
bank = sum([json.loads((base / 'data' / name).read_text())['questions']
            for name in ['lecture10.json', 'foundations.json']], [])
signature = re.compile(r'\b((?:unsigned\s+)?(?:long|int|void)\s*\*?)\s*(\w+)\s*\(([^()]*)\)\s*\{')
register_args = ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9']

def number(value):
    return int(str(value), 0)

def ctype(text):
    if '*' in text:
        return C.c_void_p
    if text.strip() == 'void':
        return None
    return C.c_ulong if 'unsigned' in text else C.c_int if 'int' in text else C.c_long

def split(key):
    match = re.fullmatch(r'([A-Za-z_]\w*)(?:\+(\d+))?', key)
    assert match, key
    return match[1], int(match[2] or 0)

programs = []
source = []
for index, question in enumerate(bank):
    if question['type'] != 'code':
        continue
    code = re.sub(r'//[^\n]*', '', question['cCode'])
    definitions = list(signature.finditer(code))
    if not definitions:
        continue
    names = {match[2]: f'question_{index}_{match[2]}' for match in definitions}
    for old, new in names.items():
        code = re.sub(r'\b' + re.escape(old) + r'\b', new, code)
    source.append(code)
    entry = question['cases'][0].get('entry', definitions[-1][2])
    definition = next(match for match in definitions if match[2] == entry)
    args = [] if definition[3].strip() == 'void' else definition[3].split(',')
    programs.append((question, names[entry], ctype(definition[1]), [ctype(arg) for arg in args]))

course = json.loads((base / 'data/lessons.json').read_text())
promotion = next(step for lesson in course['lessons'] for step in lesson['steps']
                 if step['id'] == 'c-promotions')
source.append('int course_promotion_result(int which) {\n' +
              promotion['worked']['goal'] + '\nreturn which ? narrow : wide;\n}')

count = 0
with tempfile.TemporaryDirectory(prefix='assembly-c-reference-') as temporary:
    folder = Path(temporary)
    (folder / 'answers.c').write_text('\n'.join(source))
    subprocess.run(['gcc', '-shared', '-fPIC', '-O2', '-fsanitize=undefined',
                    '-fno-sanitize-recover=all', '-o', str(folder / 'answers.so'),
                    str(folder / 'answers.c')], check=True)
    library = C.CDLL(str(folder / 'answers.so'))
    promotion_result = library.course_promotion_result
    promotion_result.argtypes = [C.c_int]
    promotion_result.restype = C.c_int
    assert promotion_result(0) == 540
    assert promotion_result(1) == 28
    for question, name, return_type, argument_types in programs:
        function = getattr(library, name)
        function.restype = return_type
        function.argtypes = argument_types
        for fixture in question['cases']:
            # Map simulated object addresses to real allocated C objects.
            objects = {}
            for key, value in fixture['memory'].items():
                root, offset = split(key)
                width = fixture.get('memoryWidths', {}).get(key, fixture.get('memoryWidth', 4))
                objects.setdefault(root, {'cells': [], 'size': 0})
                objects[root]['cells'].append((key, offset, width, value))
                objects[root]['size'] = max(objects[root]['size'], offset + width)
            mappings = []
            for root, obj in objects.items():
                obj['buffer'] = C.create_string_buffer(obj['size'])
                obj['address'] = C.addressof(obj['buffer'])
                for key, offset, width, value in obj['cells']:
                    if value is not None:
                        bits = number(value) & ((1 << (8 * width)) - 1)
                        C.memmove(obj['address'] + offset, bits.to_bytes(width, 'little'), width)
                mappings.append((number(fixture['symbols'][root]), obj['address'], obj['size']))
            arguments = []
            pointer_only_buffers = []
            for register, arg_type in zip(register_args, argument_types):
                value = number(fixture['registers'][register])
                if arg_type is C.c_void_p:
                    target = next((real + value - fake for fake, real, size in mappings
                                   if fake <= value < fake + size), None)
                    if target is None:
                        # Address-only lesson: supply a real array for legal C pointer arithmetic.
                        assert question['id'] == 'l10-elementptr'
                        array = (C.c_long * 64)()
                        pointer_only_buffers.append(array)
                        target = C.addressof(array)
                        mappings.append((value, target, C.sizeof(array)))
                    value = target
                arguments.append(value)
            result = function(*arguments)
            expected_registers = fixture['expected'].get('registers', {})
            if return_type is not None:
                register = 'eax' if return_type is C.c_int else 'rax'
                expected = number(expected_registers[register])
                if return_type is C.c_void_p:
                    result = next(fake + result - real for fake, real, size in mappings
                                  if real <= result <= real + size)
                bits = 32 if register == 'eax' else 64
                assert result % (1 << bits) == expected % (1 << bits), (question['id'], fixture['name'], result, expected)
            for root, obj in objects.items():
                for key, offset, width, initial in obj['cells']:
                    expected = fixture['expected'].get('memory', {}).get(key, initial)
                    if expected is None:
                        continue
                    observed = int.from_bytes(C.string_at(obj['address'] + offset, width), 'little')
                    assert observed == number(expected) % (1 << (8 * width)), (question['id'], key, observed, expected)
            count += 1
print(f'Compiled C fixtures passed: {count} across {len(programs)} functions')
print('C integer-promotion example passed: wide = 540, narrow = 28')
