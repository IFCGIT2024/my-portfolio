"""Author and regenerate the 2122 midterm bank. No external dependencies.

Every source question has one preserved original and ten aligned variants.
Answers are independently derived; the supplied PDF contains no answer key.
"""
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RNG = random.Random(2122261015)
GROUPS = []
QUESTIONS = []

def group(n, title, competency, response, review):
    GROUPS.append(dict(id=f'M{n:02}', sourceQuestion=n, title=title,
                       competency=competency, responseType=response, review=review))

group(1, 'Data, context, and interpretation', 'Distinguish stored bits from the information needed to interpret their meaning.', 'mcq', ['Identify the data and the missing interpretation rule separately.', 'Review instruction sets, file formats, type information, and signedness.', 'Explain why the same bits can represent different values or instructions.'])
group(2, 'Memory hierarchy', 'Rank storage levels by typical access latency and distinguish latency from capacity.', 'mcq', ['Recall registers → cache → RAM → secondary storage.', 'Order L1, L2, and L3 within a conventional cache hierarchy.', 'Distinguish fastest-to-slowest from slowest-to-fastest; access time from capacity.'])
group(3, 'Pointers and formatted output', 'Trace aliases and dereferences, then match printf conversions to argument types.', 'mcq', ['Track an address separately from the value at that address.', 'Match %d to int and %p to a void pointer.', 'Distinguish a compile-time constraint violation from undefined runtime behavior.'])
group(4, 'Valid array and pointer statements', 'Decide which assignments and pointer operations satisfy C type and object rules.', 'mcq', ['Arrays cannot be assigned as whole objects.', 'Array expressions usually convert to pointers to their first elements.', 'Review const, pointer-to-array types, and one-past pointers.'])
group(5, 'Hexadecimal to binary', 'Translate every hexadecimal digit into four bits without changing byte order.', 'mcq', ['Memorize the four-bit patterns for hexadecimal digits 0–F.', 'Keep leading zeros for a specified width.', 'Distinguish a number’s written binary representation from byte order in memory.'])
group(6, 'String input and buffer capacity', 'Account for the null terminator and scanf field width when finding safe input lengths.', 'mcq', ['A C string needs one byte beyond its visible characters.', 'A %s field width excludes the terminating null byte.', 'Width-limited input can leave the rest of an overlong token unread.'])
group(7, 'Nibble extraction', 'Trace a shift-and-mask helper and identify the selected hexadecimal digit.', 'mcq', ['Number nibbles from zero at the least significant end.', 'Each hexadecimal digit spans four bits; isolate it with 0xF.', 'Use unsigned operands or explicitly state signed conversion/shift assumptions.'])
group(8, 'Sign, parity, and byte order', 'Infer sign and parity from a fixed-width two’s-complement bit pattern.', 'mcq', ['The highest value bit determines the sign in two’s complement.', 'The lowest value bit determines odd/even parity.', 'Little endian changes byte placement, not the value’s sign or parity.'])
group(9, 'Alternative bit-string interpretations', 'Compare unsigned, sign-magnitude, and two’s-complement interpretations of the same bits.', 'mcq', ['Unsigned uses every bit as a positive weight.', 'Sign-magnitude separates the sign bit and magnitude.', 'For negative two’s complement, subtract 2^width from the unsigned value.'])
group(10, 'Sign extension', 'Widen a two’s-complement bit pattern while preserving its signed value.', 'mcq', ['Repeat the original sign bit in the added high positions.', 'Positive values extend with zeros; negative values extend with ones.', 'Check the decimal value before and after widening.'])
group(11, 'Bits discarded by shifts', 'Determine when shifting right and then left loses information.', 'mcq', ['Inspect the low k bits discarded by a right shift of k.', 'For nonnegative values, unchanged means divisible by 2^k.', 'Distinguish a fixed-width bit exercise from promoted signed C expressions.'])
group(12, 'Cross-nibble field extraction', 'Extract a masked field that may span hexadecimal digit boundaries.', 'mcq', ['Identify the rightmost source bit of the field.', 'Shift that bit to position zero, then apply the width mask.', 'Work nibble by nibble, especially for shifts not aligned to a whole byte.'])
group(13, 'Two’s-complement decoding', 'Convert a fixed-width negative hexadecimal pattern to signed decimal.', 'mcq', ['Determine the intended width before deciding the sign.', 'Compute unsigned value minus 2^width when the top bit is set.', 'Check minimum, maximum, minus one, and leading-zero cases.'])
group(14, 'Negation and integer promotion', 'Separate fixed-width wrapping negation from actual C evaluation after promotions.', 'mcq', ['Zero equals its own negation.', 'The minimum signed pattern is also self-negating in a wrapping fixed-width model.', 'An 8-bit signed char promotes to int before unary minus on the stated C machine.'])
group(15, 'Signed and unsigned comparison', 'Apply promotions and the usual arithmetic conversions before comparing values.', 'mcq', ['The U suffix changes the type of an integer constant.', 'A negative int converted to unsigned int becomes a large nonnegative value.', 'An unsigned char can promote to int; an unsigned int remains unsigned.'])
group(16, 'Narrowing and widening conversions', 'Trace low-byte conversion and subsequent sign or zero extension under stated assumptions.', 'mcq', ['Unsigned narrowing is reduction modulo 2^width.', 'Signed out-of-range conversion is implementation-defined in C17.', 'Plain char signedness must be specified before predicting a negative result.'])
group(17, 'Packed bit-array indexing', 'Split a global bit index into byte index, local bit position, and a one-bit mask.', 'mcq', ['For eight-bit bytes, byte index is i / 8 and local index is i % 8.', 'For nonnegative i, i >> 3 and i & 7 implement those operations.', 'Distinguish a set mask from a complemented clear mask and from the byte index.'])
group(18, 'Recognizing linked-list behavior', 'Infer a traversal’s contract from its initialization, comparison, update, and return.', 'mcq', ['Trace what happens for an empty list, head, middle node, and tail.', 'Compare node identity separately from equality of stored values.', 'Check whether the return value is a Boolean, count, index, or pointer.'])
group(19, 'Tracing memory and pointer updates', 'Record array contents and pointer destinations after each statement.', 'trace', ['Pointer addition moves by elements, whose addresses differ by sizeof(element).', 'Dereferencing changes the object at the address; pointer reassignment changes the address.', 'Distinguish *p++, (*p)++, p[i], and a one-past pointer.'])
group(20, 'Writing string traversal functions', 'Implement a terminating scan and compute the requested string length or closely related count.', 'code', ['Stop at the first null character and do not count it.', 'Initialize counters and advance exactly once per examined character.', 'Test empty strings, offsets, bounds, and embedded nulls as the contract requires.'])
group(21, 'Writing byte-oriented memory functions', 'Implement exact byte writes with correct bounds and pointer return semantics.', 'code', ['Convert void * to a character pointer before byte-wise access.', 'Write precisely the requested range, preserving bytes outside it.', 'Test zero size, interior ranges, byte conversion, and the required return pointer.'])

def mc(n, v, prompt, options, correct, explanation, code=None, note=None, statements=None, check=None):
    item = dict(id=f'M{n:02}-'+('O' if v==0 else f'V{v:02}'), group=f'M{n:02}',
                sourceQuestion=n, sourcePage=(1 if n<=4 else 2 if n<=9 else 3 if n<=15 else 4 if n<=18 else 5),
                variant=v, origin='original' if v==0 else 'variant', type='mcq',
                question=prompt, options=options, correct=correct, explanation=explanation)
    if code: item['code']=code
    if note: item['note']=note
    if statements: item['statements']=statements
    if check: item['verification']=check
    assert len(options)==4 and len(set(options))==4, item['id']
    QUESTIONS.append(item)
    return item

def output(n,v,code,answer,wrong,explanation,prompt='What would be printed by the code snippet below?',note=None):
    return mc(n,v,prompt,[answer]+wrong,0,explanation,code,note,check={'kind':'output','expected':answer})

def choices(answer, candidates):
    result=[answer]
    for value in candidates:
        if value not in result: result.append(value)
        if len(result)==4: return result
    raise ValueError((answer,candidates))

# Originals retain the PDF’s order, including its weaker distractors.
mc(1,0,'Given an object file compiled on some other system and you are asked: What does the code do? What statement best describes the situation?',
   ['This is not possible as there is no data.','This is not possible as there is no data and no context.','This is possible because there is data and context.','This is not possible as there is no context.'],3,
   'Under the stated missing-context assumption, D is the intended answer: the file provides data, but its interpretation is unknown. As written, the PDF is under-specified: many real object formats identify their architecture and can be analyzed. This is a conditional, independently derived key.',
   note='For this original, assume the target instruction set and object format are unknown and cannot be identified from metadata. “Compiled elsewhere” alone would not establish that interpretation is impossible.')
context_variants=[
('You receive raw machine-code bytes with no file header and no known target instruction set. What best describes your ability to decode the instructions?', ['Data is present; the decoding context is missing.','Context is present; the stored data is missing.','Both data and decoding context are present.','Neither stored data nor decoding context is present.'], 'The bytes are the data. Instruction-set knowledge supplies the rules that map those bytes to instructions.'),
('The same 8-bit pattern is read as either an unsigned integer or an ASCII character. What determines which interpretation is appropriate?', ['The type or encoding expected by the surrounding program.','The number of ones in the stored byte.','The physical address of the byte alone.','The time at which the byte was written.'], 'The bit pattern has no unique meaning by itself. The consumer’s type or encoding supplies the interpretation.'),
('An object file declares its target architecture and format in a recognized header, and a matching disassembler is available. Which conclusion is justified?', ['Its instructions can be decoded using that context.','Its instructions cannot be decoded because it was compiled elsewhere.','Its exact original variable names must all be recoverable.','Its exact original C source must be uniquely recoverable.'], 'Recognized metadata and a matching decoder supply context. Decoding instructions does not guarantee recovery of exact source or names.'),
('You know a file contains 16-bit integers but do not know the byte order. What information is still missing?', ['How successive bytes contribute to each integer’s value.','How many bits are stored in each integer.','Whether the file contains any stored data.','How many distinct 16-bit patterns are possible.'], 'Width is known, but byte order is needed to assign high and low significance to each byte.'),
('A debugger displays the same bytes once as a floating-point value and once as an integer. Which statement explains the differing values?', ['Different interpretation rules are applied to the same data.','The bytes must have changed between the two views.','The integer view always exposes the one true meaning.','The floating-point view always exposes the one true meaning.'], 'A debugger can reinterpret unchanged storage through different type rules. Neither view is inherently the correct application meaning.'),
('A protocol says one byte is an unsigned count. The byte is 0xFF. Which statement best describes this situation?', ['Both the data and its interpretation rule are available.','The data is available but every interpretation rule is missing.','The interpretation rule is available but the data is missing.','Neither the data nor an interpretation rule is available.'], 'The protocol supplies unsigned-count context and the byte supplies the data, so the value is 255.'),
('A bit sequence is given with no width, signedness, or encoding. What can be stated with certainty?', ['The supplied bit sequence itself is known.','Its signed decimal value is uniquely known.','Its text character is uniquely known.','Its machine instruction is uniquely known.'], 'The literal bits are observable. Their intended numeric, text, or instruction meaning requires additional context.'),
('A program stores 0x41 in memory. One component expects ASCII text and another expects an unsigned byte. Which statement is valid?', ['The components may read A and 65 from the same bits.','The components must read the same displayed text.','The ASCII interpretation changes the stored bits to 65.','The unsigned interpretation changes the stored bits to A.'], 'In ASCII, the code for A is 65, which is 0x41. Different displays need not imply a storage change.'),
('A file format is documented but the file’s payload bytes are unavailable. What best describes the missing information?', ['Interpretation context is known, but the data to interpret is missing.','The data is known, but all interpretation context is missing.','Both the payload data and its context are known.','The format description uniquely determines every payload byte.'], 'A format describes how to interpret content; it does not supply the actual content of a particular file.'),
('Two instruction sets assign different instructions to the same byte pattern. What information selects the correct instruction decoder?', ['The target instruction set used to encode the bytes.','The original source language, regardless of the target.','The byte order alone, regardless of the instruction set.','The compiler optimization level alone, regardless of the target.'], 'The target instruction set selects the decoding rule. Source language, byte order, or optimization level alone cannot identify that rule.')]
for v,(p,o,e) in enumerate(context_variants,1): mc(1,v,p,o,0,e)

mc(2,0,'Memory speeds, ranked fastest to slowest in terms of access times:', ['II, III, IV, I','III, II, IV, I','II, IV, I, III','IV, III, I, II'],3,
   'In the conventional hierarchy, registers have the lowest access latency, then cache, main memory, and a mechanical hard disk.', statements=['I  Main Memory','II  Hard Disk','III  Cache','IV  Registers'],note='Use the conventional qualitative hierarchy, not overlapping real-device benchmark ranges.')
hierarchies=[
(['Hard disk','Registers','Main memory','Cache'],False),
(['L2 cache','Main memory','L1 cache','Registers'],False),
(['Main memory','L3 cache','L1 cache','L2 cache'],False),
(['Cache','Registers','Hard disk','Main memory'],True),
(['SSD storage','Main memory','Registers','L1 cache'],False),
(['L3 cache','L1 cache','L2 cache','Registers'],True),
(['Hard disk','SSD storage','Main memory','Cache'],False),
(['Registers','Cache','Main memory','Hard disk'],True),
(['L1 cache','SSD storage','Main memory','Registers'],True),
(['Main memory','L2 cache','Registers','L1 cache'],True)]
rank={'Registers':0,'Cache':1,'L1 cache':1,'L2 cache':2,'L3 cache':3,'Main memory':4,'SSD storage':5,'Hard disk':6}
roman=['I','II','III','IV']
for v,(levels,reverse) in enumerate(hierarchies,1):
    order=sorted(range(4),key=lambda i:rank[levels[i]],reverse=reverse)
    ans=', '.join(roman[i] for i in order)
    distract=[list(reversed(order)),[order[1],order[0],order[2],order[3]],[order[0],order[2],order[1],order[3]]]
    mc(2,v,'Rank the following storage levels from '+('slowest to fastest' if reverse else 'fastest to slowest')+' in typical access time.',
       [ans]+[', '.join(roman[i] for i in d) for d in distract],0,
       'Use the conventional latency hierarchy: '+ ' → '.join(levels[i] for i in order)+'. This asks about access time, not storage capacity.',
       statements=[f'{roman[i]}  {s}' for i,s in enumerate(levels)],note='Assume a conventional system, with hits at the listed cache level.',check={'kind':'hierarchy','levels':levels,'reverse':reverse})

mc(3,0,'What would be printed by the code snippet below?', ['Nothing, the code will not compile.','42','32','The answer is unpredictable'],3,
   '%d requires an int argument, but ptr is an int pointer. The mismatched variadic argument causes undefined behavior; compilation may still succeed with a warning. Dereferencing ptr would instead supply the int value 32.',code='int val = 42;\nint *ptr = &val;\nval = 32;\nprintf("%d\\n", ptr);')
output(3,1,'int val = 19;\nint *ptr = &val;\nval = 27;\nprintf("%d", *ptr);','27',['19','The pointer address','Undefined behavior'],'ptr still points to val, whose current value is 27. *ptr reads that current int.')
output(3,2,'int a = 7, b = 12;\nint *p = &a;\nint *q = p;\np = &b;\n*q = 9;\nprintf("%d %d", *p, a);','12 9',['9 12','7 12','9 9'],'q retains the address of a after p is redirected to b. Writing through q changes a to 9.')
output(3,3,'int a[] = {8, 16, 24};\nint *p = a + 1;\nprintf("%d", *(p + 1));','24',['8','16','Undefined behavior'],'p points to a[1], so p + 1 points to a[2]. Dereferencing that valid element gives 24.')
mc(3,4,'What would be printed by the code snippet below?', ['6','The address of x','Undefined behavior','A required compilation error'],2,
   '%d expects int, but &x has type int *. A format mismatch is undefined behavior even if the compiler only warns.',code='int x = 6;\nprintf("%d", &x);')
output(3,5,'int x = 3;\nint *p = &x;\n*p += 4;\nprintf("%d %d", x, *p);','7 7',['3 7','7 3','3 3'],'x and *p designate the same object. The assignment changes that object to 7.')
output(3,6,'int a[] = {2, 4, 6};\nint *p = a;\nint old = *p++;\nprintf("%d %d", old, *p);','2 4',['3 2','2 2','4 6'],'Postfix ++ binds to p. The old pointer is dereferenced to obtain 2, and p then points to a[1].')
output(3,7,'int a[] = {2, 4, 6};\nint *p = a;\n(*p)++;\nprintf("%d %d", a[0], *p);','3 3',['2 4','3 4','2 2'],'Parentheses apply ++ to the pointed-to int. The first element becomes 3 and p does not move.')
output(3,8,'int x = 14;\nint *p = &x;\nint **q = &p;\n**q = 18;\nprintf("%d", x);','18',['14','The address of p','Undefined behavior'],'*q is p and **q is x. Assigning through both levels modifies x.')
mc(3,9,'What best describes the output of this code?', ['A representation of the address stored in p','The decimal value 21','The decimal value sizeof(int)','Undefined behavior from the format'],0,
   '%p expects a void * argument; the explicit cast provides it. The implementation chooses the address representation, so a specific numeric address cannot be predicted.',code='int x = 21;\nint *p = &x;\nprintf("%p", (void *)p);')
output(3,10,'int x = 11;\nint *p = &x;\nint copy = *p;\nx = 30;\nprintf("%d %d", copy, *p);','11 30',['30 30','11 11','30 11'],'copy stores the earlier integer value. p retains the address and reads x’s new value.')

mc(4,0,'Given the variable declarations below, which of the following statements would be valid?', ['I & II','I & IV','II, III & IV','I, II, III, & IV'],0,
   'I and II are type-correct assignments to a pointer variable. III and IV attempt to assign to an array, which is not a modifiable lvalue. An automatic uninitialized ptr would make actually evaluating I unsafe; this question is about assignment validity.',
   code='int val[3];\nint *ptr;',statements=['I   ptr = ptr;','II  ptr = val;','III val = ptr;','IV  val = val;'],note='Judge assignment/type compatibility. Treat ptr as initialized before any statement is evaluated; the PDF omits that runtime precondition.')
assignment_variants=[
('int a[4] = {0};\nint *p = a;', ['p = a + 2;','a = p;','p = &a[0];','a = a;'],[0,2], 'A pointer is assignable; a whole array is not. Both a + 2 and &a[0] have type int *.'),
('int a[4] = {0};\nint *p = a;', ['p++;','(*p)++;','a++;','a[0] = 7;'],[0,1,3], 'p can move within the array, and elements are writable. a is an array object, not an incrementable pointer variable.'),
('int a[4] = {0};\nconst int *p = a;', ['p = a + 1;','*p = 5;','a[0] = 5;','p++;'],[0,2,3], 'p may be reassigned, but it cannot be used to modify a const-qualified int. The original a remains writable.'),
('int a[4] = {0};\nint * const p = a;', ['p = a + 1;','*p = 5;','p++;','p[2] = 9;'],[1,3], 'The const pointer cannot change its address, but its pointed-to ints are writable.'),
('int a[4] = {0};\nint *p = a;', ['p = &a;','p = a;','p = &a[2];','p = *a;'],[1,2], '&a has pointer-to-array type, while *a is an int. Only II and III provide an int pointer.'),
('int a[4] = {0};\nint (*p)[4] = &a;', ['p = &a;','p = a;','(*p)[1] = 6;','*p = a;'],[0,2], 'p points to a whole four-int array. Its target’s elements are writable, but the whole array cannot be assigned.'),
('char s[] = "abc";\nchar *p = s;', ['s[0] = \'x\';','p = s + 1;','s = "xyz";','p[1] = \'y\';'],[0,1,3], 's is a writable array, so its elements can change. The array itself cannot be reassigned to a string literal.'),
('int a[3] = {1, 2, 3};\nint *p = a;', ['p = a + 3;','p = a + 4;','p = &a[2];','p = a - 1;'],[0,2], 'A pointer may be formed within the array or one past it. Forming a + 4 or a - 1 goes outside that allowed range.'),
('int a[3] = {0};\nint *p = a;', ['p = NULL;','p = 0;','p = 1;','p = &a[1];'],[0,1,3], 'NULL and the integer constant zero are null pointer constants. The integer constant 1 is not one and requires a diagnostic in this pointer assignment.'),
('int a[3] = {0};\nint *p = a;\nint **q = &p;', ['q = &p;','q = p;','*q = a + 1;','**q = 4;'],[0,2,3], 'q requires int **, while p is only int *. Through q, the pointer p and then its pointed-to int can both be accessed.')]
for v,(code,statements,valid,exp) in enumerate(assignment_variants,1):
    fmt=lambda indices:', '.join(roman[i] for i in indices)
    ans=fmt(valid)
    combos=[fmt(c) for c in [[0,1],[1,2],[0,2],[0,1,3],[1,3],[0,2,3],[0,1,2,3],[0,3]]]
    mc(4,v,'Each statement is considered independently, starting from these declarations. Which statements are valid C and, when evaluated, stay within the stated objects?',choices(ans,combos),0,exp,code,
       statements=[f'{roman[i]}  {s}' for i,s in enumerate(statements)],check={'kind':'validStatements','valid':valid})

binary=lambda x:' '.join(f'{x:032b}'[i:i+8] for i in range(0,32,8))
mc(5,0,'What is the binary representation of the 32 bit hex value 0xcafedead?',
   ['00001101 11010000 11111110 11001010','10101100 11101111 00001101 11010000','11001010 11111110 11011110 10101101','1010000 00001101 11101111 10101100'],2,
   'Each hexadecimal digit contributes four bits: C A F E D E A D becomes 1100 1010 1111 1110 1101 1110 1010 1101. The last original option also has an inconsistent group width.',check={'kind':'binary','value':0xcafedead})
for v,x in enumerate([0xA17C03E9,0x08F2B640,0xDEAD102F,0x7F0081C3,0x80000001,0x13579BDF,0x2468ACE0,0x00FF10A5,0xF00DC0DE,0x10203040],1):
    reverse=int.from_bytes(x.to_bytes(4,'big'),'little')
    rotated=((x<<4)|(x>>28))&0xffffffff
    opts=choices(binary(x),[binary(reverse),binary(rotated),binary(x^0x10),binary(x^0x100)])
    mc(5,v,f'What is the binary representation of the 32-bit hexadecimal value 0x{x:08X}?',opts,0,
       f'Translate the digits in their written order: {" ".join(f"{int(c,16):04b}" for c in f"{x:08X}")}. Endianness does not reverse a number’s written representation.',check={'kind':'binary','value':x})

mc(6,0,'What is the max. length input allowed by this code to ensure correct operation?', ['Unknown','8','9','10'],2,
   'The intended capacity answer is nine non-whitespace characters plus one null terminator. Unbounded %s does not enforce that limit. Literal transcription has a missing semicolon and typographic quotation marks, so those printing artifacts must be corrected before compiling.',
   code='char buffer[10];\nprintf("What is your name?\\n")\nscanf(“%s”, buffer);\nprintf(“Hello %s\\n”, buffer);',note='For the intended buffer-capacity question, treat the missing semicolon and curly quotes in the PDF as typographical errors. Count one whitespace-delimited input token, excluding its terminator.')
buffer_specs=[(6,None,0),(17,None,0),(1,None,0),(12,7,0),(8,8,0),(9,8,0),(20,12,0),(12,None,3),(16,None,7),(32,10,0)]
for v,(capacity,width,offset) in enumerate(buffer_specs,1):
    safe=capacity-offset-1
    dest='buffer' if not offset else f'buffer + {offset}'
    spec='%s' if width is None else f'%{width}s'
    if width is None or width>safe:
        prompt='What is the maximum number of non-whitespace input characters this destination can safely store as a C string?'
        answer=str(safe)
        exp=f'The writable destination has {capacity-offset} bytes, so {safe} are available for input characters and one for the null terminator.'
        if width is not None: exp+=f' The width {width} shown is too large and does not guarantee safety for a longer token.'
    else:
        prompt='For an input token longer than the field width, how many input characters can this call store, excluding the null terminator?'
        answer=str(width);exp=f'The field width limits this conversion to {width} input characters, followed by a null terminator. The destination has enough room; remaining token characters stay unread.'
    candidates=[str(safe+1),str(max(0,safe-1)),str(capacity),str(width+1 if width else capacity+1),str(max(0,(width or safe)-1)),'Unknown']
    mc(6,v,prompt,choices(answer,candidates),0,exp,code=f'char buffer[{capacity}];\nscanf("{spec}", {dest});',check={'kind':'capacity','capacity':capacity,'width':width,'offset':offset})

mc(7,0,'The following function is passed the arguments 0xcafedead and 3. The return value is:', ['0','13','14','15'],1,
   'i * 4 is 12. Shifting right by 12 places puts the fourth nibble from the right (D) into the low position, and 0xF isolates it. Hexadecimal D is decimal 13.',code='int mystery(int b, int i) {\n    return (b >> (i * 4)) & 0xf;\n}',note='Assume 32-bit two’s-complement int, conversion of the argument preserves its low 32 bits, and signed right shift is arithmetic. These are machine assumptions, not universal C17 guarantees.',check={'kind':'field','value':0xcafedead,'shift':12,'mask':15})
for v,(x,index) in enumerate([(0xA17C03E9,0),(0xA17C03E9,7),(0x08F2B640,3),(0xDEAD102F,4),(0x7F0081C3,2),(0x80000001,6),(0x13579BDF,5),(0x2468ACE0,1),(0x00FF10A5,6),(0xF00DC0DE,4)],1):
    answer=(x>>(4*index))&15
    opts=choices(str(answer),[str((x>>(4*((index+1)%8)))&15),str(index),str((answer+1)%16),str((answer+8)%16),'16'])
    mc(7,v,f'The function is called as mystery(0x{x:08X}u, {index}). What value is returned?',opts,0,
       f'The shift is {index} × 4 = {index*4} bits. Nibble index {index}, counting from zero on the right, is {answer:X}; masking with 0xF returns decimal {answer}.',
       code='unsigned int mystery(unsigned int b, int i) {\n    return (b >> (i * 4)) & 0xFu;\n}',check={'kind':'field','value':x,'shift':4*index,'mask':15})

sign_options=['The integer is negative and odd.','The integer is positive and odd.','The integer is negative and even.','The integer is positive and even.']
mc(8,0,'Suppose 0xcafed00d represents a signed int in little endian representation. Which of the following are true?',sign_options.copy(),0,
   'For a 32-bit two’s-complement interpretation, the top bit of C is 1, so the value is negative. The low hexadecimal digit D is odd. Little endian affects byte layout, not either conclusion.',note='Interpret the given hexadecimal number as a 32-bit two’s-complement value, not as a left-to-right list of bytes at increasing addresses.',check={'kind':'signParity','value':0xcafed00d,'width':32})
for v,(x,endian) in enumerate([(0x7ABCDE01,'little'),(0x80000000,'big'),(0xF1234567,'little'),(0x12345678,'big'),(0x00000100,'little'),(0xFFFFFFFE,'little'),(0x7FFFFFFF,'big'),(0xA0000001,'big'),(0x80000002,'little'),(0x00000003,'little')],1):
    neg=bool(x&0x80000000);odd=bool(x&1);answer=0 if neg and odd else 2 if neg else 1 if odd else 3
    prompt=f'The hexadecimal value 0x{x:08X} is interpreted as a 32-bit two’s-complement signed int on a {endian}-endian machine. Which statement is true?'
    mc(8,v,prompt,sign_options.copy(),answer,
       f'The top bit is {int(neg)}, so the value is {"negative" if neg else "positive"}. The low bit is {int(odd)}, so it is {"odd" if odd else "even"}. Byte order does not change these properties.',check={'kind':'signParity','value':x,'width':32})

def signed(x,width): return x-(1<<width) if x&(1<<(width-1)) else x
def signmag(x,width): return -(x&((1<<(width-1))-1)) if x&(1<<(width-1)) else x
mc(9,0,'Consider the 4-bit string s = 0b1011 (0b indicates binary). Which of the values below is NOT a valid interpretation of the bit-string in the formats seen in class (unsigned, sign-mag., 2sC)?',['-5','11','-3','-4'],3,
   'Unsigned gives 11. Sign-magnitude uses sign 1 with magnitude 011, giving -3. Two’s complement gives 11 - 16 = -5. Thus -4 is not one of those interpretations.',check={'kind':'interpretations','value':11,'width':4})
for v,(width,x,invalid) in enumerate([(4,9,-6),(4,10,-4),(4,13,-6),(4,14,-3),(4,15,-2),(5,17,-14),(5,21,-6),(5,27,-4),(8,0x81,-126),(8,0xFE,-3)],1):
    values=[x,signmag(x,width),signed(x,width)]
    assert len(set(values))==3 and invalid not in values
    mc(9,v,f'The {width}-bit string is 0b{x:0{width}b}. Which decimal value is NOT an interpretation under unsigned, sign-magnitude, or two’s-complement encoding?',
       [str(invalid)]+list(map(str,values)),0,
       f'Unsigned: {x}. Sign-magnitude: {signmag(x,width)}. Two’s complement: {x} - {1<<width} = {signed(x,width)}. The remaining option, {invalid}, is not represented by these bits under the listed formats.',check={'kind':'interpretations','value':x,'width':width})

mc(10,0,'Which of the following 8-bit numbers has the same signed value as the 4-bit number 0xC?', ['0x0C','0x7C','0x8C','0xFC'],3,
   'In four-bit two’s complement, 1100 is -4. Repeating its sign bit gives 11111100, which is 0xFC and remains -4 in eight bits.',note='Use two’s-complement encoding at both widths.',check={'kind':'extend','value':12,'from':4,'to':8})
extension_specs=[(4,8,0x9),(4,8,0x7),(4,8,0xF),(4,8,0x8),(8,16,0xA5),(8,16,0x7E),(8,16,0x80),(8,16,0xFF),(4,16,0xB),(8,32,0xD2)]
for v,(old,new,x) in enumerate(extension_specs,1):
    val=signed(x,old);answer=val% (1<<new);fmt=lambda y:f'0x{y:0{new//4}X}'
    candidates=[x,x|(1<<(new-1)),answer^(1<<old),answer^(1<<(new-1)),0]
    mc(10,v,f'Which {new}-bit two’s-complement pattern preserves the signed value of the {old}-bit pattern 0x{x:0{old//4}X}?',choices(fmt(answer),[fmt(y) for y in candidates]),0,
       f'The original signed value is {val}. Extend the sign bit ({1 if val<0 else 0}) through the added high positions; the result is {fmt(answer)}.',check={'kind':'extend','value':x,'from':old,'to':new})

mc(11,0,'Consider a signed char x. The value of x that makes the expression x != (x >> 2) << 2 true is:', ['12','20','22','] 32'],2,
   'All listed numeric candidates are nonnegative. Shifting right and back left removes the low two bits. 22 is 10110, so it becomes 10100 = 20 and differs; 12, 20, and 32 are multiples of four. The stray bracket before 32 is a PDF typo.',check={'kind':'discard','shift':2,'relation':'!='})
discard_specs=[(1,'!=',[18,34,57,80]),(2,'!=',[16,25,44,64]),(3,'!=',[8,24,58,96]),(4,'!=',[16,32,80,95]),(2,'==',[13,18,28,31]),(3,'==',[17,32,39,63]),(4,'==',[15,31,64,95]),(1,'==',[7,21,44,63]),(5,'!=',[0,32,65,96]),(3,'==',[0,7,15,31])]
for v,(k,rel,vals) in enumerate(discard_specs,1):
    result=lambda x: x != ((x>>k)<<k) if rel=='!=' else x==((x>>k)<<k)
    matches=[i for i,x in enumerate(vals) if result(x)];assert len(matches)==1
    answer=vals[matches[0]]
    mc(11,v,f'For a signed char x with one of the nonnegative values listed, which value makes x {rel} ((x >> {k}) << {k}) true?',list(map(str,vals)),matches[0],
       f'The two shifts discard the low {k} bits. The reconstructed value for {answer} is {(answer>>k)<<k}. Equality holds exactly for multiples of {1<<k}; this question asks for {"inequality" if rel=="!=" else "equality"}.',check={'kind':'discard','shift':k,'relation':rel})

mc(12,0,'Given int x = 0x1A 2B 3C 4D, the value of (x >> 12) & 0xFF is:', ['0x2B','0xB3','0xC3','0xA2'],1,
   'Reading the spaced hexadecimal digits as one value, 0x1A2B3C4D >> 12 is 0x1A2B3. The low eight bits are 0xB3. A 12-bit shift is three nibbles, not one byte.',note='The PDF spaces the hexadecimal digits for readability. Use the valid C literal 0x1A2B3C4D.',check={'kind':'field','value':0x1A2B3C4D,'shift':12,'mask':255})
field_specs=[(0x12345678,4,255),(0xA1B2C3D4,12,255),(0x0F1E2D3C,20,255),(0x76543210,8,255),(0xABCD0123,16,255),(0x13579BDF,6,63),(0xFEDCBA98,10,255),(0x80000F00,4,255),(0x01020304,0,255),(0xF2345678,24,255)]
for v,(x,k,mask) in enumerate(field_specs,1):
    answer=(x>>k)&mask;fmt=lambda y:f'0x{y:02X}'
    options=choices(fmt(answer),[fmt((x>>max(0,k-4))&mask),fmt((x>>(k+4))&mask),fmt(answer^1),fmt(answer^16)])
    mc(12,v,f'Given unsigned int x = 0x{x:08X}u, what is the value of (x >> {k}) & 0x{mask:X}u?',options,0,
       f'After shifting by {k} bits the value is 0x{x>>k:X}. Masking with 0x{mask:X} retains the selected low field, giving {fmt(answer)}.',check={'kind':'field','value':x,'shift':k,'mask':mask})

mc(13,0,'The decimal value of the bit-string 0xF3E treated as a twos-complement value is:', ['-194','3902','-3902','-174'],0,
   'Using exactly 12 bits, the unsigned value is 3902 and the sign bit is set. Subtract 4096 to obtain -194. If the width were 16 with a leading zero nibble, the value would instead be positive 3902.',note='Interpret the three hexadecimal digits as exactly 12 bits; the PDF does not explicitly state the width.',check={'kind':'signed','value':0xF3E,'width':12})
for v,(width,x) in enumerate([(8,0xE7),(8,0x80),(8,0xFF),(12,0xF80),(12,0x800),(12,0xFF0),(16,0xFF3C),(16,0x8001),(16,0xFED4),(12,0x7FE)],1):
    answer=signed(x,width)
    opts=choices(str(answer),[str(x),str(-x),str(answer+16),str(answer-16),str(answer+1)])
    mc(13,v,f'What is the signed decimal value of the exactly {width}-bit two’s-complement pattern 0x{x:0{width//4}X}?',opts,0,
       f'The unsigned value is {x}. '+(f'The highest bit is 1, so subtract 2^{width} = {1<<width}: {x} - {1<<width} = {answer}.' if answer<0 else f'The highest bit is 0, so the signed value remains {answer}.'),check={'kind':'signed','value':x,'width':width})

mc(14,0,'Which value of (signed) char x makes the following expression true? (Assume 8-bit arithmetic): x == -x?', ['-128','-142','128','127'],0,
   'In the PDF’s wrapping eight-bit model, negating pattern 10000000 produces the same pattern, so -128 is the listed answer. Zero is also self-negating but is not listed. In actual C on a 32-bit-int machine, signed char promotes to int; -(-128) is 128, so none of these listed representable values satisfies the expression.',note='Use the explicitly requested toy model: negation wraps within eight bits before comparison. This is not ordinary C17 signed-char expression evaluation.',check={'kind':'negation','model':'wrap','width':8})
neg_specs=[
('In wrapping 8-bit two’s-complement arithmetic, which nonzero x satisfies x == -x?',[-128,-127,-1,127],'wrap',8),
('In wrapping 8-bit two’s-complement arithmetic, which listed x satisfies x == -x?',[0,1,-1,126],'wrap',8),
('In wrapping 4-bit two’s-complement arithmetic, which nonzero x satisfies x == -x?',[-8,-7,7,-1],'wrap',4),
('In wrapping 16-bit two’s-complement arithmetic, which nonzero x satisfies x == -x?',[-32768,-32767,32767,-1],'wrap',16),
('Under actual C17 evaluation with 32-bit int and 8-bit signed char x, which value makes x == -x true?',[0,-128,-1,127],'promoted',8),
('Under actual C17 evaluation, unsigned char x promotes to 32-bit int. Which listed x makes x == -x true?',[0,128,255,1],'promoted',8),
('For 32-bit unsigned int x, which nonzero value makes x == -x true?',[2147483648,1,2147483647,4294967295],'wrapUnsigned',32),
('Under actual C17 evaluation with 32-bit int, signed char x is -128. What is the value of the expression -x?',[128,-128,0,127],'unary',8),
('A stored 8-bit pattern is 0x81. Negate it using wrapping two’s-complement arithmetic. What signed decimal value does the result represent?',[127,-127,-128,1],'negatePattern',8),
('In wrapping 8-bit two’s-complement arithmetic, which pair gives ALL values satisfying x == -x?',['0 and -128','0 and 127','-1 and 1','-128 and 127'],'pair',8)]
for v,(prompt,opts,model,width) in enumerate(neg_specs,1):
    explanations={
      'wrap':f'Within {width} bits, zero and the minimum signed value {-1<<(width-1)} have self-negating patterns. The selected value is the only one of those allowed by the question and choices.',
      'promoted':'The char value promotes to int before negation. All possible char values have representable int negations on this machine; equality requires zero.',
      'wrapUnsigned':'Unsigned negation is modulo 2^32. The nonzero halfway value 2^31 maps to itself: 2^32 - 2^31 = 2^31.',
      'unary':'The value -128 promotes to int before unary minus. The result 128 is representable as int, so no eight-bit truncation occurs in this expression.',
      'negatePattern':'0x81 is -127 in eight-bit two’s complement. Inverting and adding one yields 0x7F, which is +127.',
      'pair':'Self-negation modulo 256 requires 2x to be a multiple of 256. The two stored patterns are 0x00 and 0x80, interpreted as 0 and -128.'}
    mc(14,v,prompt,list(map(str,opts)),0,explanations[model],check={'kind':'negation','model':model,'width':width})

mc(15,0,'Find a value of (signed) char x that makes the following expression true (Assume 8-bit arithmetic): x > 192U', ['-10','10','127','-147'],0,
   'The representable negative candidate is -10. In the PDF’s unsigned eight-bit model it converts to 246, which exceeds 192. In actual C with 32-bit unsigned int, promotions/conversions yield 4294967286, also greater than 192U. -147 is outside the assumed signed-char range.',note='Use an eight-bit signed-char range of -128 through 127. The explanation distinguishes the PDF’s eight-bit model from actual C promotion.',check={'kind':'comparison','relation':'>','threshold':192,'unsigned':True,'signedChar':True})
compare_specs=[('>',200,True,[-1,0,100,127]),('>',100,True,[101,0,50,100]),('<',10,True,[0,-1,10,127]),('>=',127,True,[127,0,125,126]),('<',200,False,[-10,200,250,300]),('>',192,False,[193,-10,10,127]),('==',4294967295,True,[-1,0,1,127]),('>',4294967294,True,[-1,-2,0,127]),('<',1,True,[0,-128,1,127]),('<=',0,True,[0,-1,1,127])]
for v,(rel,threshold,uns,vals) in enumerate(compare_specs,1):
    # Two variants use int explicitly to keep all candidate values representable.
    typ='signed char' if v not in [5,6] else 'int'
    convert=lambda x:x%(1<<32) if uns else x
    def truth(x):
        a=convert(x);b=threshold
        return {'>':a>b,'<':a<b,'>=':a>=b,'<=':a<=b,'==':a==b}[rel]
    matches=[i for i,x in enumerate(vals) if truth(x)];assert len(matches)==1,(v,vals)
    a=vals[matches[0]]
    mc(15,v,f'On a C17 machine with 32-bit int and unsigned int, which listed value of {typ} x makes x {rel} {threshold}{"U" if uns else ""} true?',list(map(str,vals)),matches[0],
       (f'The unsigned int constant causes x to be compared as unsigned int. The selected {a} becomes {convert(a)}; compare that with {threshold}. Negative candidates wrap modulo 2^32 during conversion.' if uns else f'The comparison is signed. {a} {rel} {threshold} is true; adding or removing U can change the interpretation of negative operands.'),
       check={'kind':'comparison','relation':rel,'threshold':threshold,'unsigned':uns,'signedChar':typ=='signed char'})

mc(16,0,'What is printed from the following piece of code:', ['0','128','-128','384'],2,
   'Under the stated machine assumptions, narrowing 384 keeps low byte 0x80, interpreted as -128 by signed char. Widening to int preserves -128. If plain char were unsigned, the result would be 128. Out-of-range signed conversion is implementation-defined in C17.',code='int a = 384;\nchar b = a;\na = b;\nprintf("%d\\n", a);',note='Assume eight-bit plain char is signed and out-of-range conversion preserves the low eight bits using two’s-complement interpretation.',check={'kind':'narrow','value':384,'signed':True})
narrow_specs=[(255,True),(255,False),(256,True),(383,True),(511,False),(128,True),(-1,False),(-129,True),(1025,False),(-256,True)]
for v,(x,is_signed) in enumerate(narrow_specs,1):
    low=x%256;answer=signed(low,8) if is_signed else low;typ='signed char' if is_signed else 'unsigned char'
    opts=choices(str(answer),[str(x),str(low),str(signed(low,8)),str(answer+1),str(answer-1),'0'])
    mc(16,v,'What is printed by this sequence of conversions?',opts,0,
       f'The low eight bits of {x} form 0x{low:02X}. As {typ}, that represents {answer}. Converting back to int preserves this value.',code=f'int a = {x};\n{typ} b = a;\na = b;\nprintf("%d", a);',
       note=('Assume an eight-bit two’s-complement signed char and an implementation that preserves the low eight bits on out-of-range conversion.' if is_signed else 'Assume eight-bit unsigned char and 32-bit int.'),check={'kind':'narrow','value':x,'signed':is_signed})

mc(17,0,'What is the value of the mask if i = 11?', ['0x08','0x20','0xf7','0xff'],0,
   'The byte index is 11 >> 3 = 1. The local bit index is 11 & 7 = 3, so the mask is 1 << 3 = 8 = 0x08. The byte index is not the shift count.',code='void set(char *bits, int i) {\n    int idx = i >> 3;\n    int bidx = i & 7;\n    char mask = 1 << bidx;\n    bits[idx] = bits[idx] | mask;\n}',check={'kind':'packed','index':11,'ask':'mask'})
packed_indices=[0,7,8,15,16,23,31,32,41,63]
for v,i in enumerate(packed_indices,1):
    idx=i//8;bidx=i%8;mask=1<<bidx
    if v in [3,6,9]:
        prompt=f'For i = {i}, what are idx and mask, in that order?'
        fmt=lambda a,b:f'{a}, 0x{b:02X}'
        options=choices(fmt(idx,mask),[fmt(bidx,mask),fmt(idx,1<<((bidx+1)%8)),fmt(idx+1,mask),fmt(idx,mask^255)])
        ask='both'
    else:
        prompt=f'What is the value of mask when i = {i}?'
        options=choices(f'0x{mask:02X}',[f'0x{mask^255:02X}',f'0x{1<<((bidx+1)%8):02X}',f'0x{idx:02X}','0xFF'])
        ask='mask'
    mc(17,v,prompt,options,0,f'i / 8 = {idx} identifies the byte. i % 8 = {bidx} identifies the local bit, so 1u << {bidx} gives 0x{mask:02X}. Bit 0 is the least significant bit within each byte.',
       code='void set(unsigned char *bits, unsigned int i) {\n    unsigned int idx = i >> 3;\n    unsigned int bidx = i & 7u;\n    unsigned char mask = (unsigned char)(1u << bidx);\n    bits[idx] = (unsigned char)(bits[idx] | mask);\n}',check={'kind':'packed','index':i,'ask':ask})

list_note='Assume list is a valid pointer, the chain is finite and acyclic, its length fits in int, and each node has int value and a next pointer. Nodes are compared by address unless the code compares value.'
original_list='int mystery(linked_list_t *list, ll_node_t *node) {\n    for (ll_node_t *ptr = list->head; ptr != NULL; ptr = ptr->next) {\n        if (node == ptr) return 1;\n    }\n    return 0;\n}'
mc(18,0,'Which function name best describes this code?', ['is_node_allocated()','is_node_head()','is_node_tail()','is_node_in_list()'],3,
   'The loop compares node with every reachable node address and returns 1 on any match. It returns 0 after exhausting the chain; it does not allocate or free anything.',code=original_list,note=list_note,check={'kind':'list','contract':'contains'})
list_variants=[
('int mystery(linked_list_t *list, ll_node_t *node) {\n    return node != NULL && list->head == node;\n}', 'is_node_head()', ['is_node_tail()','is_node_in_list()','is_list_empty()'],'Only the head pointer is compared. A matching node elsewhere in the list is not accepted.','head'),
('int mystery(linked_list_t *list, ll_node_t *node) {\n    for (ll_node_t *p = list->head; p != NULL; p = p->next) {\n        if (p->next == NULL) return p == node;\n    }\n    return 0;\n}', 'is_node_tail()', ['is_node_head()','is_list_empty()','is_node_in_list()'],'The comparison is performed only at the final node, whose next pointer is NULL. An empty list returns 0.','tail'),
('int mystery(linked_list_t *list) {\n    return list->head == NULL;\n}', 'is_list_empty()', ['list_length()','has_one_node()','contains_zero_value()'],'A NULL head means no nodes are reachable. The function returns a Boolean, not a node count.','empty'),
('int mystery(linked_list_t *list) {\n    int n = 0;\n    for (ll_node_t *p = list->head; p != NULL; p = p->next) ++n;\n    return n;\n}', 'list_length()', ['is_list_empty()','sum_node_values()','index_of_tail()'],'The counter advances once per node, regardless of stored value. Empty lists return 0.','length'),
('int mystery(linked_list_t *list, int target) {\n    for (ll_node_t *p = list->head; p != NULL; p = p->next) {\n        if (p->value == target) return 1;\n    }\n    return 0;\n}', 'contains_value()', ['contains_node_address()','count_value_matches()','sum_node_values()'],'It compares each stored int with target and returns on the first match. Equal values in different nodes are sufficient.','value'),
('int mystery(linked_list_t *list, ll_node_t *node) {\n    int i = 0;\n    for (ll_node_t *p = list->head; p != NULL; p = p->next, ++i) {\n        if (p == node) return i;\n    }\n    return -1;\n}', 'index_of_node()', ['is_node_in_list()','list_length()','index_of_tail()'],'The returned counter is the zero-based index of the matching node. -1 means the address was not found.','index'),
('int mystery(linked_list_t *list, ll_node_t *node) {\n    if (node == NULL) return 0;\n    for (ll_node_t *p = list->head; p != NULL; p = p->next) {\n        if (p->next == node) return 1;\n    }\n    return 0;\n}', 'has_predecessor_in_list()', ['is_node_head()','is_node_tail()','has_successor_in_list()'],'The comparison looks at each next link. It succeeds when some listed node links directly to the supplied non-NULL node.','predecessor'),
('int mystery(linked_list_t *list) {\n    return list->head != NULL && list->head->next == NULL;\n}', 'has_exactly_one_node()', ['is_list_empty()','has_at_least_two_nodes()','all_values_equal()'],'The first condition requires a head; the second requires it to have no successor. Short-circuiting prevents a NULL dereference.','singleton'),
('int mystery(linked_list_t *list, int target) {\n    int count = 0;\n    for (ll_node_t *p = list->head; p != NULL; p = p->next) {\n        if (p->value == target) ++count;\n    }\n    return count;\n}', 'count_value_matches()', ['contains_value()','sum_node_values()','index_of_first_match()'],'Every matching node increments count, so duplicate values contribute separately. The scan does not stop after its first match.','count'),
('int mystery(linked_list_t *list, ll_node_t *node) {\n    ll_node_t *p = list->head;\n    if (p != NULL) p = p->next;\n    for (; p != NULL; p = p->next) {\n        if (p == node) return 1;\n    }\n    return 0;\n}', 'is_node_after_head()', ['is_node_head()','is_node_in_list()','is_node_tail()'],'The first reachable node is deliberately skipped. The function accepts any matching node from the second position onward, not only the tail.','afterHead')]
for v,(code,ans,wrong,exp,contract) in enumerate(list_variants,1):
    mc(18,v,'Which function name best describes the behavior of this code?',[ans]+wrong,0,exp,code,list_note,check={'kind':'list','contract':contract})

def trace(v,values,start,base,steps):
    name='Aptr' if v==0 else 'p'
    code='1  int main(void) {\n2      int A[] = {'+', '.join(map(str,values))+'};\n'
    code+=f'3      int *{name} = A'+(f' + {start}' if start else '')+';\n'
    code+='\n'.join(f'{i+4}      {s[0]}' for i,s in enumerate(steps))+'\n6      return 0;\n7  }'
    parts=[]
    for i,(_,result,idx) in enumerate(steps):
        parts.append(dict(label=f'After line {i+4}',answer=f'A = {{{", ".join(map(str,result))}}}; {name} holds 0x{base+4*idx:X} '+(f'and points to A[{idx}].' if idx<len(values) else '(one past the array; do not dereference it).'),
                          values=result,pointerIndex=idx,pointerAddress=base+4*idx))
    item=dict(id='M19-'+('O' if v==0 else f'V{v:02}'),group='M19',sourceQuestion=19,sourcePage=5,variant=v,
              origin='original' if v==0 else 'variant',type='trace',
              question='The variable values after line 3 executes are shown below. (a) What are they after line 4 is executed? (b) After line 5 is executed?',
              code=code,note='Assume sizeof(int) = 4 bytes. Addresses in the diagram are illustrative, increasing from left to right. For each part, give the full array and the pointer’s stored address or target index.',
              initialMemory=dict(values=values,pointerIndex=start,baseAddress=base,pointerStorageAddress=0x204 if v==0 else base+0x80,elementBytes=4,pointerName=name),
              parts=parts,rubric=['Track the pointer destination and full array after line 4.','Track the pointer destination and full array after line 5.'],
              explanation='Pointer arithmetic advances by array elements, while dereferencing accesses an element’s value. The pointer variable has its own storage address; that address is distinct from the array address stored in it.',
              verification={'kind':'trace','values':values,'start':start,'steps':[s[0] for s in steps],'pointerName':name})
    QUESTIONS.append(item)

trace(0,[50,60,70,80,90],0,0x100,[('Aptr = Aptr + 3;',[50,60,70,80,90],3),('*Aptr = *Aptr + 3;',[50,60,70,83,90],3)])
trace(1,[10,20,30,40,50],0,0x300,[('p = p + 2;',[10,20,30,40,50],2),('*p = *p - 5;',[10,20,25,40,50],2)])
trace(2,[3,6,9,12,15],1,0x400,[('p = &A[4];',[3,6,9,12,15],4),('*p += A[0];',[3,6,9,12,18],4)])
trace(3,[11,22,33,44,55],3,0x500,[('p = p - 1;',[11,22,33,44,55],2),('*(p + 1) = 9;',[11,22,33,9,55],2)])
trace(4,[2,4,6,8,10],0,0x600,[('p++;',[2,4,6,8,10],1),('(*p)++;',[2,5,6,8,10],1)])
trace(5,[5,10,15,20,25],0,0x700,[('p += 1;',[5,10,15,20,25],1),('*p++ = 77;',[5,77,15,20,25],2)])
trace(6,[1,3,5,7,9],0,0x800,[('p = &A[1];',[1,3,5,7,9],1),('p[2] += 6;',[1,3,5,13,9],1)])
trace(7,[8,16,24,32,40],4,0x900,[('p -= 2;',[8,16,24,32,40],2),('*p = *(p + 2);',[8,16,40,32,40],2)])
trace(8,[7,14,21,28,35],2,0xA00,[('p = A + 4;',[7,14,21,28,35],4),('*(p - 3) = *p;',[7,35,21,28,35],4)])
trace(9,[0,-2,4,-6,8],2,0xB00,[('p += 0;',[0,-2,4,-6,8],2),('*p += 0;',[0,-2,4,-6,8],2)])
trace(10,[9,18,27,36,45],0,0xC00,[('p = A + 5;',[9,18,27,36,45],5),('p--;',[9,18,27,36,45],4)])

def coding(n,v,prompt,signature,solution,rubric,explanation,cases,note=None):
    item=dict(id=f'M{n:02}-'+('O' if v==0 else f'V{v:02}'),group=f'M{n:02}',sourceQuestion=n,sourcePage=5,variant=v,
              origin='original' if v==0 else 'variant',type='code',question=prompt,code=signature,
              modelAnswer=solution,rubric=rubric,explanation=explanation,verification={'kind':'implementation','cases':cases})
    if note:item['note']=note
    QUESTIONS.append(item)

length_rubric=['Initialize the count or start pointer correctly.','Stop at the first null character or other limit required by the contract.','Advance safely without skipping or double-counting characters.','Return the required value, including for the empty case.']
coding(20,0,'Recall that the function int strlen(char *string), which takes a pointer to a character array and returns the length of the string stored in it. Give the C code for this function. Note: It does not need to be perfect C code, but it does need to be recognizable as C code.',
       'int strlen(char *string);','int strlen(char *string) {\n    int length = 0;\n    while (string[length] != \'\\0\') {\n        ++length;\n    }\n    return length;\n}',length_rubric,
       'Count characters preceding the first null byte. An empty string returns zero. This is a teaching implementation with the PDF’s simplified signature; the standard library uses size_t strlen(const char *).',
       [{'setup':'char s[] = "";','call':'strlen(s)','expected':0},{'setup':'char s[] = "HELLO";','call':'strlen(s)','expected':5},{'setup':'char s[] = {\'A\',0,\'B\',0};','call':'strlen(s)','expected':1}],
       note='Use the PDF’s requested signature. Assume a valid null-terminated string whose length fits in int. No library strlen call may be used. The signature is simplified from the standard library declaration.')
length_tasks=[
('Implement a function that returns the number of characters before the first null byte. Do not call a string library function.',
 'int text_length(const char *s);','int text_length(const char *s) {\n    int n = 0;\n    while (s[n] != \'\\0\') ++n;\n    return n;\n}',
 [{'setup':'const char s[] = "";','call':'text_length(s)','expected':0},{'setup':'const char s[] = "ABCD";','call':'text_length(s)','expected':4}]),
('Implement the string-length function using a moving pointer rather than array subscripts. Do not call strlen.',
 'size_t pointer_length(const char *s);','size_t pointer_length(const char *s) {\n    const char *p = s;\n    while (*p != \'\\0\') ++p;\n    return (size_t)(p - s);\n}',
 [{'setup':'const char s[] = "";','call':'pointer_length(s)','expected':0},{'setup':'const char s[] = "A B";','call':'pointer_length(s)','expected':3}]),
('Return the length of the suffix beginning at index start. start is between zero and the full string length, inclusive. Do not count the characters before start.',
 'int suffix_length(const char *s, int start);','int suffix_length(const char *s, int start) {\n    int n = 0;\n    while (s[start + n] != \'\\0\') ++n;\n    return n;\n}',
 [{'setup':'const char s[] = "ABCDE";','call':'suffix_length(s, 2)','expected':3},{'setup':'const char s[] = "ABCDE";','call':'suffix_length(s, 5)','expected':0},{'setup':'const char s[] = "";','call':'suffix_length(s, 0)','expected':0}]),
('Return the number of characters before the first null byte, but examine at most limit bytes. If no null occurs within that limit, return limit. If limit is zero, do not read s.',
 'size_t bounded_length(const char *s, size_t limit);','size_t bounded_length(const char *s, size_t limit) {\n    size_t n = 0;\n    while (n < limit && s[n] != \'\\0\') ++n;\n    return n;\n}',
 [{'setup':'char s[3] = {\'A\',\'B\',\'C\'};','call':'bounded_length(s, 3)','expected':3},{'setup':'char s[] = "A";','call':'bounded_length(s, 2)','expected':1},{'setup':'','call':'bounded_length(NULL, 0)','expected':0}]),
('Count occurrences of the non-null character target before the first null byte. A character after that terminator must not be counted.',
 'int count_char(const char *s, char target);','int count_char(const char *s, char target) {\n    int count = 0;\n    for (int i = 0; s[i] != \'\\0\'; ++i) {\n        if (s[i] == target) ++count;\n    }\n    return count;\n}',
 [{'setup':'char s[] = "BANANA";','call':"count_char(s, 'A')",'expected':3},{'setup':'char s[] = {\'A\',0,\'A\',0};','call':"count_char(s, 'A')",'expected':1},{'setup':'char s[] = "";','call':"count_char(s, 'A')",'expected':0}]),
('Return the length of the prefix before the first occurrence of stop or the first null byte, whichever comes first. Exclude the stopping character.',
 'int prefix_length(const char *s, char stop);','int prefix_length(const char *s, char stop) {\n    int n = 0;\n    while (s[n] != \'\\0\' && s[n] != stop) ++n;\n    return n;\n}',
 [{'setup':'char s[] = "ab:cd";','call':"prefix_length(s, ':')",'expected':2},{'setup':'char s[] = "abc";','call':"prefix_length(s, ':')",'expected':3},{'setup':'char s[] = ":a";','call':"prefix_length(s, ':')",'expected':0}]),
('Return the index of the last non-null character in the string. Return -1 for an empty string. Do not use strlen.',
 'int last_char_index(const char *s);','int last_char_index(const char *s) {\n    int n = 0;\n    while (s[n] != \'\\0\') ++n;\n    return n - 1;\n}',
 [{'setup':'char s[] = "";','call':'last_char_index(s)','expected':-1},{'setup':'char s[] = "A";','call':'last_char_index(s)','expected':0},{'setup':'char s[] = "TEST";','call':'last_char_index(s)','expected':3}]),
('Return 1 if the string contains at least n characters before its terminator, otherwise return 0. n is nonnegative. Stop scanning as soon as the answer is known.',
 'int has_at_least(const char *s, int n);','int has_at_least(const char *s, int n) {\n    int i = 0;\n    while (i < n) {\n        if (s[i] == \'\\0\') return 0;\n        ++i;\n    }\n    return 1;\n}',
 [{'setup':'char s[] = "";','call':'has_at_least(s, 0)','expected':1},{'setup':'char s[] = "abc";','call':'has_at_least(s, 3)','expected':1},{'setup':'char s[] = "abc";','call':'has_at_least(s, 4)','expected':0}]),
('Return -1 when s is NULL. Otherwise return the length of the null-terminated string. Do not use strlen.',
 'int checked_length(const char *s);','int checked_length(const char *s) {\n    if (s == NULL) return -1;\n    int n = 0;\n    while (s[n] != \'\\0\') ++n;\n    return n;\n}',
 [{'setup':'','call':'checked_length(NULL)','expected':-1},{'setup':'char s[] = "";','call':'checked_length(s)','expected':0},{'setup':'char s[] = "hello";','call':'checked_length(s)','expected':5}]),
('Compute the length of each of count null-terminated strings and store it in the corresponding out element. Do not use strlen. count is nonnegative; both arrays have count elements.',
 'void string_lengths(const char *const strings[], int count, int out[]);','void string_lengths(const char *const strings[], int count, int out[]) {\n    for (int i = 0; i < count; ++i) {\n        int n = 0;\n        while (strings[i][n] != \'\\0\') ++n;\n        out[i] = n;\n    }\n}',
 [{'setup':'const char *s[] = {"", "A", "BC"}; int out[3] = {-1,-1,-1};','invoke':'string_lengths(s, 3, out);','assert':'out[0] == 0 && out[1] == 1 && out[2] == 2'},{'setup':'int out[1] = {99};','invoke':'string_lengths(NULL, 0, out);','assert':'out[0] == 99'}])]
for v,(prompt,sig,solution,cases) in enumerate(length_tasks,1):
    coding(20,v,prompt+' Give recognizable C code for the function.',sig,solution,length_rubric,
       'Follow the stated stopping condition and return contract. The reference implementation is one possible solution; other implementations are valid if they meet the same contract and boundary cases.',cases,
       note='Assume valid readable storage for every byte the contract permits examining. Counts and pointer differences fit their return types; required standard declarations are available. Do not use library string-length functions.')

fill_rubric=['Use a character pointer to address individual bytes.','Honor the exact bounds and the zero-length case.','Write the requested byte value without changing bytes outside the range.','Return the required pointer or count; preserve the original pointer when needed.']
coding(21,0,'Recall that the function void *memset(void *ptr, char byte, int size) takes a pointer to memory, a byte and the size of the memory and initializes each byte of the memory with the specified byte. Give the C code for the function. Note: it does not need to be perfect C code, but it does have to be recognizable as C code.',
 'void *memset(void *ptr, char byte, int size);','void *memset(void *ptr, char byte, int size) {\n    unsigned char *p = ptr;\n    for (int i = 0; i < size; ++i) {\n        p[i] = (unsigned char)byte;\n    }\n    return ptr;\n}',fill_rubric,
 'A character pointer makes each step one byte. The loop writes offsets 0 through size - 1 and returns the original address. The PDF uses a simplified signature; standard memset takes an int byte value and a size_t count.',
 [{'setup':'unsigned char b[] = {9,9,9,9};','invoke':'void *r = memset(b+1, 3, 2);','assert':'r == b+1 && b[0] == 9 && b[1] == 3 && b[2] == 3 && b[3] == 9'},{'setup':'unsigned char b[] = {9};','invoke':'void *r = memset(b, 5, 0);','assert':'r == b && b[0] == 9'}],
 note='Use the PDF’s simplified signature; size is nonnegative and ptr designates at least size writable bytes. Return the original pointer. Do not call a library memory-filling function.')
fill_tasks=[
('Fill exactly n bytes beginning at ptr with byte and return the original ptr.',
 'void *fill_bytes(void *ptr, unsigned char byte, size_t n);','void *fill_bytes(void *ptr, unsigned char byte, size_t n) {\n    unsigned char *p = ptr;\n    for (size_t i = 0; i < n; ++i) p[i] = byte;\n    return ptr;\n}',
 'void *r = fill_bytes(b+1, 0xA5, 2);','r == b+1 && b[0] == 9 && b[1] == 165 && b[2] == 165 && b[3] == 9','fill_bytes(b, 7, 0);'),
('Set exactly n bytes beginning at ptr to zero. Return no value.',
 'void zero_bytes(void *ptr, size_t n);','void zero_bytes(void *ptr, size_t n) {\n    unsigned char *p = ptr;\n    for (size_t i = 0; i < n; ++i) p[i] = 0;\n}',
 'zero_bytes(b+1, 2);','b[0] == 9 && b[1] == 0 && b[2] == 0 && b[3] == 9','zero_bytes(b, 0);'),
('Fill count bytes starting at buffer[start] with byte. Preserve all other bytes and return the original buffer pointer.',
 'unsigned char *fill_range(unsigned char *buffer, size_t start, size_t count, unsigned char byte);','unsigned char *fill_range(unsigned char *buffer, size_t start, size_t count, unsigned char byte) {\n    for (size_t i = 0; i < count; ++i) buffer[start + i] = byte;\n    return buffer;\n}',
 'unsigned char *r = fill_range(b, 1, 2, 4);','r == b && b[0] == 9 && b[1] == 4 && b[2] == 4 && b[3] == 9','fill_range(b, 0, 0, 4);'),
('Fill n bytes with byte, visiting them from the final byte backward to the first. Return ptr. Avoid unsigned-loop underflow.',
 'void *fill_reverse(void *ptr, unsigned char byte, size_t n);','void *fill_reverse(void *ptr, unsigned char byte, size_t n) {\n    unsigned char *p = ptr;\n    while (n > 0) {\n        --n;\n        p[n] = byte;\n    }\n    return ptr;\n}',
 'void *r = fill_reverse(b+1, 6, 2);','r == b+1 && b[0] == 9 && b[1] == 6 && b[2] == 6 && b[3] == 9','fill_reverse(b, 6, 0);'),
('Fill n bytes with alternating first and second byte values, beginning with first at offset zero. Return ptr.',
 'void *fill_alternating(void *ptr, unsigned char first, unsigned char second, size_t n);','void *fill_alternating(void *ptr, unsigned char first, unsigned char second, size_t n) {\n    unsigned char *p = ptr;\n    for (size_t i = 0; i < n; ++i) {\n        p[i] = i % 2 == 0 ? first : second;\n    }\n    return ptr;\n}',
 'void *r = fill_alternating(b, 1, 2, 3);','r == b && b[0] == 1 && b[1] == 2 && b[2] == 1 && b[3] == 9','fill_alternating(b, 1, 2, 0);'),
('Fill n bytes beginning offset bytes after ptr. Return the original ptr, not the start of the filled subrange.',
 'void *fill_after(void *ptr, size_t offset, unsigned char byte, size_t n);','void *fill_after(void *ptr, size_t offset, unsigned char byte, size_t n) {\n    unsigned char *p = ptr;\n    for (size_t i = 0; i < n; ++i) p[offset + i] = byte;\n    return ptr;\n}',
 'void *r = fill_after(b, 1, 0, 2);','r == b && b[0] == 9 && b[1] == 0 && b[2] == 0 && b[3] == 9','fill_after(b, 0, 0, 0);'),
('If count is zero or negative, write nothing. Otherwise fill count bytes with byte. In every case return ptr.',
 'void *fill_checked(void *ptr, unsigned char byte, int count);','void *fill_checked(void *ptr, unsigned char byte, int count) {\n    unsigned char *p = ptr;\n    for (int i = 0; i < count; ++i) p[i] = byte;\n    return ptr;\n}',
 'void *r = fill_checked(b+1, 7, 2);','r == b+1 && b[0] == 9 && b[1] == 7 && b[2] == 7 && b[3] == 9','fill_checked(b, 7, -2);'),
('Convert value to unsigned char, fill exactly n bytes with that byte, and return the original ptr. Assume 8-bit bytes.',
 'void *fill_value(void *ptr, int value, size_t n);','void *fill_value(void *ptr, int value, size_t n) {\n    unsigned char *p = ptr;\n    unsigned char byte = (unsigned char)value;\n    for (size_t i = 0; i < n; ++i) p[i] = byte;\n    return ptr;\n}',
 'void *r = fill_value(b+1, 258, 2);','r == b+1 && b[0] == 9 && b[1] == 2 && b[2] == 2 && b[3] == 9','fill_value(b, -1, 0);'),
('In n bytes beginning at ptr, replace only bytes currently equal to zero with byte. Return the number of zero bytes selected for replacement, even if byte is itself zero.',
 'size_t fill_zeros(void *ptr, unsigned char byte, size_t n);','size_t fill_zeros(void *ptr, unsigned char byte, size_t n) {\n    unsigned char *p = ptr;\n    size_t count = 0;\n    for (size_t i = 0; i < n; ++i) {\n        if (p[i] == 0) { p[i] = byte; ++count; }\n    }\n    return count;\n}',
 'b[1] = 0; b[2] = 0; size_t r = fill_zeros(b, 5, 3);','r == 2 && b[0] == 9 && b[1] == 5 && b[2] == 5 && b[3] == 9','fill_zeros(b, 5, 0);'),
('Fill n bytes beginning at ptr with byte, then return a pointer one byte past the filled range. For n = 0 return ptr.',
 'unsigned char *fill_end(void *ptr, unsigned char byte, size_t n);','unsigned char *fill_end(void *ptr, unsigned char byte, size_t n) {\n    unsigned char *p = ptr;\n    for (size_t i = 0; i < n; ++i) *p++ = byte;\n    return p;\n}',
 'unsigned char *r = fill_end(b+1, 8, 2);','r == b+3 && b[0] == 9 && b[1] == 8 && b[2] == 8 && b[3] == 9','fill_end(b, 8, 0);')]
for v,(prompt,sig,solution,invoke,assertion,empty) in enumerate(fill_tasks,1):
    coding(21,v,prompt+' Give recognizable C code without calling memset or another memory-fill helper.',sig,solution,fill_rubric,
       'Access storage one byte at a time through a character pointer. Follow this question’s exact range and return contract; the model is one valid implementation.',
       [{'setup':'unsigned char b[] = {9,9,9,9};','invoke':invoke,'assert':assertion},{'setup':'unsigned char b[] = {9,9,9,9};','invoke':empty,'assert':'b[0] == 9 && b[1] == 9 && b[2] == 9 && b[3] == 9'}],
       note='Assume all requested byte ranges fit in writable allocated objects and size calculations do not overflow. Required standard types are declared. Do not perform arithmetic directly on void *.')

# Balance only new MCQ keys; preserve the original PDF option order exactly.
new_mcq=[q for q in QUESTIONS if q['type']=='mcq' and q['variant']>0]
slots=list(range(4))*45
assert len(new_mcq)==len(slots)==180
RNG.shuffle(slots)
for q,slot in zip(new_mcq,slots):
    correct=q['options'][q['correct']]
    wrong=[s for i,s in enumerate(q['options']) if i!=q['correct']]
    RNG.shuffle(wrong);wrong.insert(slot,correct)
    q['options']=wrong;q['correct']=slot

QUESTIONS.sort(key=lambda q:(q['sourceQuestion'],q['variant']))
assert len(QUESTIONS)==231
for g in GROUPS:
    assert len([q for q in QUESTIONS if q['group']==g['id']])==11

BANK=dict(schemaVersion=1,code='CSCI 2122',title='Midterm Review',
          description='One question from each of the 21 sample-test types: 18 multiple-choice questions, a two-part memory trace, and two C implementations.',
          source=dict(filename='SampleQuestionsF26.pdf',title='CSCI 2122 Practice Questions for Mid-Term',pages=5,answerKeyProvided=False,
                      attribution='Dalhousie University Faculty of Computer Science',
                      note='Original questions and choices are transcribed from the supplied PDF. Answer keys, explanations, clarifications, and new variants were created for this review; they are not an official instructor answer key.'),
          assumptions=['Use C17, ASCII, 8-bit bytes, and 32-bit int/unsigned int unless an item specifies a different bit-width model.',
                       'Bit and nibble indices start at zero at the least significant end. 1u means an unsigned int constant with value 1.',
                       'Assume standard declarations are available, all stated objects are valid, and no concurrent changes occur.',
                       'Originals with missing context or typos carry visible clarifications. Fixed-width wrapping exercises are explicitly distinguished from C integer promotions.',
                       'For exam-style practice, follow the sample’s no-calculator, no-notes instruction. Answers are shown after submission.'],
          groups=GROUPS,questions=QUESTIONS)
ROOT.joinpath('data/2122-midterm.json').write_text(json.dumps(BANK,indent=2,ensure_ascii=False)+'\n')
print(f'Built {len(QUESTIONS)} questions: 21 originals, 210 variants; 198 MCQ, 11 memory traces, 22 implementations.')
