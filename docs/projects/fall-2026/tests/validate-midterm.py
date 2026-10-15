"""Independent numeric oracles and compiled C checks for the midterm bank.

Never executes the deliberately undefined printf examples. Machine-specific
signed conversions are checked only on the explicitly stated host model.
"""
import collections
import json
import operator
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BANK = json.loads((ROOT / 'data/2122-midterm.json').read_text())
counts = collections.Counter()
roman = ['I', 'II', 'III', 'IV']

def integer(text):
    return int(text.replace(']', '').strip(), 0) if '0x' in text else int(text.replace(']', '').strip())

def signed(n, width):
    bits = f'{n:0{width}b}'
    return -int(bits[0]) * 2**(width-1) + int(bits[1:], 2)

with tempfile.TemporaryDirectory() as directory:
    path = Path(directory)
    def run_c(source, expected=None):
        (path / 'check.c').write_text('#include <stdio.h>\n#include <stddef.h>\n#include <assert.h>\n' + source)
        result = subprocess.run(['gcc', '-std=c17', '-Wall', '-Wextra', '-pedantic', '-fsanitize=undefined', '-fno-sanitize-recover=all', str(path/'check.c'), '-o', str(path/'check')], capture_output=True, text=True)
        assert result.returncode == 0, result.stderr
        result = subprocess.run([str(path/'check')], capture_output=True, text=True, timeout=3)
        assert result.returncode == 0, result.stderr
        if expected is not None: assert result.stdout.strip() == expected.strip(), (result.stdout, expected)
        counts['C programs'] += 1
        return result.stdout

    run_c('_Static_assert(sizeof(int) == 4 && sizeof(char) == 1, "host model");\nint main(void) { assert((signed char)255 == -1); }')
    assert len(BANK['groups']) == 21 and len(BANK['questions']) == 231
    assert len({q['id'] for q in BANK['questions']}) == 231
    for group in BANK['groups']:
        qs = [q for q in BANK['questions'] if q['group'] == group['id']]
        assert sorted(q['variant'] for q in qs) == list(range(11))
        assert all(q['type'] == group['responseType'] for q in qs)
        assert len(group['review']) >= 3
    keys = collections.Counter(q['correct'] for q in BANK['questions'] if q['type'] == 'mcq' and q['origin'] == 'variant')
    assert keys == {0:45, 1:45, 2:45, 3:45}, keys

    for q in BANK['questions']:
        assert q['question'] and q['explanation'] and 1 <= q['sourcePage'] <= 5
        if q['type'] == 'mcq':
            assert len(q['options']) == len(set(q['options'])) == 4
            assert 0 <= q['correct'] < 4
        else:
            assert q['rubric']
        check = q.get('verification', {})
        kind = check.get('kind')
        if not kind:
            counts['manually reviewed conceptual/diagnostic questions'] += 1
            continue
        counts[kind] += 1
        candidates = q.get('options', [])
        answer = candidates[q['correct']] if candidates else None
        matches = None
        if kind == 'output':
            assert answer == check['expected']
            run_c('int main(void) {\n' + q['code'] + '\n}', answer)
        elif kind == 'hierarchy':
            ranking = ['Registers','L1 cache','Cache','L2 cache','L3 cache','Main memory','SSD storage','Hard disk']
            order = sorted(range(4), key=lambda i:ranking.index(check['levels'][i]), reverse=check['reverse'])
            assert answer == ', '.join(roman[i] for i in order)
        elif kind == 'validStatements':
            valid = []
            for i, statement in enumerate(q['statements']):
                statement = re.sub(r'^IV?I*\s+', '', statement)
                (path/'constraint.c').write_text('#include <stddef.h>\nvoid f(void) {\n'+q['code']+'\n'+statement+'\n}')
                result = subprocess.run(['gcc','-std=c17','-pedantic-errors','-Werror=incompatible-pointer-types','-Werror=int-conversion','-fsyntax-only',str(path/'constraint.c')], capture_output=True)
                # These expressions form pointers beyond the permitted [0, length] range.
                outside = statement in ['p = a + 4;', 'p = a - 1;']
                if result.returncode == 0 and not outside: valid.append(i)
            assert valid == check['valid'], (q['id'], valid)
            assert answer == ', '.join(roman[i] for i in valid)
        elif kind == 'binary':
            matches = [i for i,s in enumerate(candidates) if len(s.replace(' ','')) == 32 and int(s.replace(' ',''),2) == check['value']]
        elif kind == 'capacity':
            room = check['capacity'] - check['offset'] - 1
            expected = min(room, check['width']) if check['width'] is not None else room
            assert int(answer) == expected
        elif kind == 'field':
            expected = (check['value'] // 2**check['shift']) % (check['mask']+1)
            assert integer(answer) == expected
        elif kind == 'signParity':
            sign = 'negative' if signed(check['value'], check['width']) < 0 else 'positive'
            parity = 'odd' if check['value'] % 2 else 'even'
            assert answer == f'The integer is {sign} and {parity}.'
        elif kind == 'interpretations':
            n,w = check['value'],check['width']
            magnitude = n % 2**(w-1)
            values = {n, -magnitude if n >= 2**(w-1) else magnitude, signed(n,w)}
            matches = [i for i,s in enumerate(candidates) if integer(s) not in values]
        elif kind == 'extend':
            assert signed(integer(answer),check['to']) == signed(check['value'], check['from'])
        elif kind == 'discard':
            matches = [i for i,s in enumerate(candidates) if (integer(s) % 2**check['shift'] != 0) == (check['relation'] == '!=')]
        elif kind == 'signed':
            assert integer(answer) == signed(check['value'],check['width'])
        elif kind == 'negation':
            model,w = check['model'],check['width']
            if model == 'pair': assert answer == '0 and -128'
            elif model == 'unary': assert integer(answer) == 128
            elif model == 'negatePattern': assert integer(answer) == signed((-0x81) % 256,8)
            else:
                matches = []
                for i,s in enumerate(candidates):
                    n = integer(s)
                    if model == 'wrap' and not -2**(w-1) <= n < 2**(w-1): continue
                    equal = n == -n if model == 'promoted' else n % 2**w == (-n) % 2**w
                    if equal: matches.append(i)
        elif kind == 'comparison':
            compare = {'>':operator.gt, '<':operator.lt, '>=':operator.ge, '<=':operator.le, '==':operator.eq}[check['relation']]
            matches = []
            for i,s in enumerate(candidates):
                n = integer(s)
                if check['signedChar'] and not -128 <= n <= 127: continue
                if compare(n % 2**32 if check['unsigned'] else n,check['threshold']): matches.append(i)
        elif kind == 'narrow':
            byte = check['value'] % 256
            assert integer(answer) == (signed(byte,8) if check['signed'] else byte)
            run_c('int main(void) {\n'+q['code']+'\n}',answer)
        elif kind == 'packed':
            byte, bit = divmod(check['index'],8)
            if check['ask'] == 'both':
                a,b = answer.split(', '); assert int(a) == byte and int(b,16) == 2**bit
            else: assert int(answer,16) == 2**bit
        elif kind == 'trace':
            name = check['pointerName']
            source = 'int main(void) { int A[] = {'+','.join(map(str,check['values']))+'}; int *'+name+' = A + '+str(check['start'])+';\n'
            expected = []
            for statement, part in zip(check['steps'],q['parts']):
                source += statement + '\nfor(int j=0;j<5;++j) printf("%d ",A[j]); printf("%td\\n",'+name+'-A);\n'
                expected.append(' '.join(map(str,part['values']+[part['pointerIndex']])))
                assert part['pointerAddress'] == q['initialMemory']['baseAddress'] + part['pointerIndex']*4
            run_c(source+'}', '\n'.join(expected))
        elif kind == 'implementation':
            solution = q['modelAnswer']
            cases = []
            for case in check['cases']:
                body = case['setup']+'\n'
                if 'call' in case: body += 'assert(('+case['call']+') == '+str(case['expected'])+');'
                else: body += case['invoke']+'\nassert('+case['assert']+');'
                cases.append('{'+body+'}')
            source = solution+'\nint main(void) {\n'+'\n'.join(cases)+'\n}'
            source = re.sub(r'\b(strlen|memset)\b',lambda m:'study_'+m[0],source)
            run_c(source)
            counts['implementation boundary cases'] += len(cases)
        elif kind == 'list':
            contract = check['contract']
            expected_names = {'contains':'is_node_in_list()','head':'is_node_head()','tail':'is_node_tail()','empty':'is_list_empty()','length':'list_length()','value':'contains_value()','index':'index_of_node()','predecessor':'has_predecessor_in_list()','singleton':'has_exactly_one_node()','count':'count_value_matches()','afterHead':'is_node_after_head()'}
            assert answer == expected_names[contract]
            statements = []
            values = [4,7,4,9]
            for length in range(5):
                setup = 'll_node_t a[4] = {{4,NULL},{7,NULL},{4,NULL},{9,NULL}}; ll_node_t other = {4,NULL}; linked_list_t list = {NULL};'
                if length: setup += 'list.head = a;'+''.join(f'a[{i}].next = &a[{i+1}];' for i in range(length-1))
                asserts = []
                if contract in ['empty','length','singleton']:
                    expect = {'empty':int(length==0),'length':length,'singleton':int(length==1)}[contract]
                    asserts.append(f'assert(mystery(&list)=={expect});')
                elif contract in ['value','count']:
                    for target in [4,7,9,12]:
                        n = values[:length].count(target); expect = int(n>0) if contract=='value' else n
                        asserts.append(f'assert(mystery(&list,{target})=={expect});')
                else:
                    for i,node in list(enumerate(['&a[0]','&a[1]','&a[2]','&a[3]']))+[(-1,'NULL'),(9,'&other')]:
                        inside = 0 <= i < length
                        expect = {'contains':int(inside),'head':int(inside and i==0),'tail':int(inside and i==length-1),'index':i if inside else -1,'predecessor':int(inside and i>0),'afterHead':int(inside and i>0)}[contract]
                        asserts.append(f'assert(mystery(&list,{node})=={expect});')
                statements.append('{'+setup+''.join(asserts)+'}')
                counts['linked-list boundary cases'] += len(asserts)
            types = 'typedef struct node { int value; struct node *next; } ll_node_t; typedef struct { ll_node_t *head; } linked_list_t;\n'
            run_c(types+q['code']+'\nint main(void) {\n'+''.join(statements)+'}')
        else: raise AssertionError(kind)
        if matches is not None: assert matches == [q['correct']], (q['id'],matches,q['correct'])
    print('PASS: 231 records, 21 originals, 210 variants, unique groups and balanced new MCQ keys.')
    print(dict(counts))
