const systemsCourse = {
  "chapters": [
    "Reading C",
    "Addresses and strings",
    "Integer representation",
    "Masks and bitstreams",
    "Storage and linked structures",
    "Modules and Makefiles",
    "Assembly recall",
    "Arrays and struct layout",
    "Cache and performance"
  ],
  "lessons": [
    {
      "id": "objects",
      "chapter": 0,
      "title": "Start with a value",
      "source": "Course model",
      "intro": "What changes when a C statement runs? Through this path, follow one named object from C source to the bytes the machine reads. Use the class’s C99 Linux x86-64 model: a byte has 8 bits, an int occupies 4 bytes, and a long or pointer occupies 8.",
      "example": "int x = 3;\nint y = x;\nx = 8;",
      "steps": [
        "An object is a place where a value is stored. The first line creates x with value 3. A semicolon ends a statement.",
        "The second line copies the current value into another object. The third replaces the value in x. Now x holds 8 and y still holds 3."
      ],
      "question": "Change the final statement to y = 8. What value does x hold?",
      "options": [
        "8",
        "3",
        "11"
      ],
      "answer": 1,
      "reason": "Only the object on the left receives the new value."
    },
    {
      "id": "decisions",
      "chapter": 0,
      "title": "Follow an if",
      "source": "C foundations",
      "intro": "A condition chooses which statements run. Braces group statements. In C, zero means false and any nonzero value means true. The operator == compares two values.",
      "example": "int n = 2;\nif (n == 2) { n = n + 3; }\nelse        { n = 0; }",
      "steps": [
        "The test reads the current n. Two equals two, so the first block runs.",
        "The assignment reads 2, adds 3, and stores 5. The else block is skipped."
      ],
      "question": "Start instead with n = 5. What is the final n?",
      "options": [
        "5",
        "8",
        "0"
      ],
      "answer": 2,
      "reason": "The comparison fails. Control goes directly to the else block."
    },
    {
      "id": "loops",
      "chapter": 0,
      "title": "Trace a loop",
      "source": "C foundations",
      "intro": "A while loop tests a condition before each pass. The body must update something that can change the test. A for loop puts the starting action, test and update together.",
      "example": "int i = 0;\nwhile (i < 3) { i = i + 1; }\n// Equivalent count: for (i=0; i<3; ++i) { }",
      "steps": [
        "The body runs for i equal to 0, 1 and 2. ++i adds one.",
        "At 3 the test fails. The loop has executed three times. Starting at 3 skips every pass."
      ],
      "question": "Change the while test to i <= 3, starting at 0. How many passes?",
      "options": [
        "4",
        "3",
        "5"
      ],
      "answer": 0,
      "reason": "The extra equality admits i=3. The next test sees 4 and fails."
    },
    {
      "id": "functions",
      "chapter": 0,
      "title": "Pass a value to a function",
      "source": "C foundations",
      "intro": "A function takes named inputs called parameters. Calling it gives each parameter its own value. return sends a result back to the caller. Read a fragment from the call site into the function and back.",
      "example": "int plus_one(int v) { v = v + 1; return v; }\n// Inside the caller:\nint x = 6;\nint y = plus_one(x);",
      "steps": [
        "v starts as a copy of 6. Changing it leaves x at 6.",
        "The function returns 7. The caller stores that value in y. A call whose result is discarded can still perform other work."
      ],
      "question": "Replace the last line with plus_one(x); alone. What value is left in x?",
      "options": [
        "7",
        "Indeterminate",
        "6"
      ],
      "answer": 2,
      "reason": "The returned 7 is discarded, and the assignment inside the function targeted v."
    },
    {
      "id": "address",
      "chapter": 1,
      "title": "Follow one pointer",
      "source": "Lecture 3 pp. 4–9",
      "intro": "Every live object has an address. A pointer stores an address. In a declaration int *p means “p can point to an int.” In an expression &x means “address of x” and *p means “the object p points to.”",
      "example": "int x = 4;\nint *p = &x;\n*p = 9;",
      "steps": [
        "Draw x holding 4, then an arrow from p to x.",
        "Follow the arrow for *p = 9. The object x now holds 9 and p still contains the same address."
      ],
      "question": "If the last line becomes x = 12, what is *p afterward?",
      "options": [
        "12",
        "4",
        "An address"
      ],
      "answer": 0,
      "reason": "Reading through p reads the current contents of x."
    },
    {
      "id": "aliases",
      "chapter": 1,
      "title": "Rebind one alias",
      "source": "Lecture 3 p. 9",
      "intro": "Two pointers can designate the same object. Copying a pointer copies its address value. Later assigning a new address to one pointer moves only that arrow.",
      "example": "int a=2, b=8;\nint *p=&a, *q=p;\np=&b;\n*q=5;",
      "steps": [
        "After q=p both arrows end at a. After p=&b, q still ends at a.",
        "The write through q changes a to 5. A write through p would now change b."
      ],
      "question": "Move q=p to just after p=&b. After *q=5 what are a,b?",
      "options": [
        "5, 8",
        "2, 5",
        "5, 5"
      ],
      "answer": 1,
      "reason": "Both arrows now end at b before the write. Draw them before assigning through q."
    },
    {
      "id": "arrays",
      "chapter": 1,
      "title": "Index an array",
      "source": "Lecture 3 and Arrays pp. 3–8",
      "intro": "An array contains adjacent elements of one type. Count from index zero. Each increase of one in an int index advances by sizeof(int), the number of bytes occupied by one int.",
      "example": "int a[3] = {4, 8, 9};\nint *p = a;\n// Suppose a begins at decimal byte address 100.",
      "steps": [
        "Here a supplies the address of its first element. p+1 points four bytes later, to address 104.",
        "a[1] and *(p+1) both read 8. Address 104 identifies the location; 8 is its contents."
      ],
      "question": "What byte address contains a[2]?",
      "options": [
        "108",
        "102",
        "9"
      ],
      "answer": 0,
      "reason": "Two int elements span 2 × 4 bytes."
    },
    {
      "id": "bounds",
      "chapter": 1,
      "title": "Decide whether an element exists",
      "source": "Arrays pp. 8, 15",
      "intro": "A pointer may designate an element or the position just after the last element of the same array. That one-past pointer is useful as a stopping position. Reading or writing through it has undefined behavior in C.",
      "example": "int a[3] = {4, 8, 9};\nint *end = a + 3;\nint last = *(end - 1);",
      "steps": [
        "end is a valid stopping position. Subtracting one reaches a[2], so last is 9.",
        "Forming a+4 already exceeds the allowed range. A scalar counts as a one-element array for this rule."
      ],
      "question": "Which expression can you evaluate to read the last int?",
      "options": [
        "*end",
        "end[-1]",
        "a[3]"
      ],
      "answer": 1,
      "reason": "end[-1] means *(end-1), which designates the existing element at index 2."
    },
    {
      "id": "strings",
      "chapter": 1,
      "title": "Find the end of a string",
      "source": "Lecture 3 p. 17",
      "intro": "A char occupies one byte. A C string ends at its first zero character, written '\\0'. The double quotes in an initializer tell C to include a terminating zero.",
      "example": "char word[] = \"cat\";\n// Cells: 'c'  'a'  't'  '\\0'\n// Index:  0    1    2     3",
      "steps": [
        "sizeof word counts all four bytes of this array. strlen(word), declared in <string.h>, counts the three characters before zero.",
        "Writing word[1]='\\0' shortens the string to \"c\". The four-byte object still exists."
      ],
      "question": "For char s[8]=\"hi\", what are sizeof s and strlen(s)?",
      "options": [
        "3 and 2",
        "8 and 8",
        "8 and 2"
      ],
      "answer": 2,
      "reason": "The declaration reserves eight cells. The first zero is at index 2."
    },
    {
      "id": "parameter-size",
      "chapter": 1,
      "title": "Pass the length with an array",
      "source": "Arrays p. 8",
      "intro": "Inside an array parameter declaration, C adjusts the parameter to a pointer. A function receiving only that address needs a separate count to learn the array length.",
      "example": "int a[5];           // caller: sizeof a is 20\n// In the function declaration below, v is an int pointer.\nvoid visit(int v[5], int count);",
      "steps": [
        "The caller owns five ints. sizeof a measures the complete object.",
        "Inside visit, sizeof v measures one pointer, eight bytes in the course model. sizeof v[0] is still four."
      ],
      "question": "A caller changes its array to int a[9]. Inside visit, how many bytes does sizeof v report?",
      "options": [
        "36",
        "8",
        "9"
      ],
      "answer": 1,
      "reason": "Changing the caller’s allocation does not change the parameter type."
    },
    {
      "id": "line-buffer",
      "chapter": 1,
      "title": "Keep input between reads",
      "source": "Lecture 3 pp. 17–19",
      "intro": "fgets reads a line into a character array, leaves room for the terminator, and keeps the newline when it fits. On a successful read the array holds that line. The next successful read into it overwrites the same cells.",
      "example": "char line[256], first[256];\n// After a successful bounded read into line:\nstrcpy(first, line);   // copy through the terminator\nchar *alias = line;",
      "steps": [
        "If line originally contains \"red\" plus newline, first now owns a separate copy. Both arrays have room under the exercise’s input limit.",
        "Read \"blue\" into line. alias follows the reused buffer and sees blue. first still holds red. fgets returns a null pointer when it cannot read a line."
      ],
      "question": "To compare two saved lines by characters, which test checks equality?",
      "options": [
        "a == b",
        "sizeof a == sizeof b",
        "strcmp(a,b) == 0"
      ],
      "answer": 2,
      "reason": "strcmp from <string.h> compares the terminated sequences. a==b compares their addresses here."
    },
    {
      "id": "rmdup",
      "chapter": 1,
      "title": "Keep the first occurrence of a line",
      "source": "Lecture 3 p. 19",
      "intro": "The course’s rmdup exercise preserves input order. Store each distinct line once. A table char saved[1000][256] is 1000 rows, each a separate 256-character array. count is the number of occupied rows.",
      "example": "For each successful fgets into line:\n    scan rows 0 through count−1 with strcmp\n    if all are different:\n        copy line into saved[count]\n        print that copy and increase count",
      "steps": [
        "Trace red, blue, red. Red is copied to row 0; blue is copied to row 1. The last red matches row 0 and is skipped.",
        "Empty input makes no rows. Under the course limit, reserve space for the newline and terminating zero. Saving the same pointer every time would overwrite earlier evidence."
      ],
      "question": "Input is oak, oak!, oak on three terminated lines. Which lines are printed in order?",
      "options": [
        "oak then oak!",
        "oak only",
        "oak twice then oak!"
      ],
      "answer": 0,
      "reason": "Punctuation changes the string. Only the final oak matches an existing row.",
      "listing": {
        "title": "A complete C99 line filter",
        "code": "#include <stdio.h>\n#include <string.h>\n\n/* Course bounds: at most 1000 lines, each shorter than 255 characters. */\nint main(void) {\n    char saved[1000][256];\n    char line[256];\n    int used = 0;\n    while (fgets(line, sizeof line, stdin)) {\n        int row = 0;\n        while (row < used && strcmp(saved[row], line) != 0) {\n            ++row;\n        }\n        if (row == used) {\n            strcpy(saved[used], line);\n            ++used;\n            fputs(line, stdout);\n        }\n    }\n    return 0;\n}\n"
      }
    },
    {
      "id": "bits",
      "chapter": 2,
      "title": "Read the width of a bit pattern",
      "source": "Lecture 5 pp. 3–9",
      "intro": "A bit is 0 or 1. Read binary place values from the right: 1, 2, 4, 8 and then successive powers of two. Four bits make one hex digit; 0x marks hexadecimal. A through F stand for 10 through 15.",
      "example": "unsigned byte pattern: 1010 0110\n                       A    6\n0xA6 = 10×16 + 6 = 166",
      "steps": [
        "The leftmost one here contributes 128 and the rightmost one contributes 2. A byte can encode 256 patterns, from 0 through 255 as unsigned.",
        "Keep leading zeros when a width is specified: 0x06 occupies the pattern 00000110 in eight bits."
      ],
      "question": "What is the unsigned value of 0011 0101?",
      "options": [
        "35",
        "83",
        "53"
      ],
      "answer": 2,
      "reason": "The nibbles are 3 and 5. In base 16 that gives 3×16+5."
    },
    {
      "id": "signed",
      "chapter": 2,
      "title": "Give the top bit a negative weight",
      "source": "Lecture 5 pp. 4–9",
      "intro": "For an n-bit two’s-complement number the high bit has weight minus 2 to the power n−1. The other bit weights are positive. Equivalently subtract 2ⁿ from the unsigned value if the top bit is set.",
      "example": "Five bits: 10001\nUnsigned: 16 + 1 = 17\nSigned:  −16 + 1 = −15",
      "steps": [
        "The highest positive five-bit value is 01111 = 15. The lowest is 10000 = −16.",
        "A one-bit signed field has only 0 and −1. The same pattern can mean different numbers when the width or signedness changes."
      ],
      "question": "What signed value does the eight-bit pattern 1111 1110 represent?",
      "options": [
        "−2",
        "254",
        "−1"
      ],
      "answer": 0,
      "reason": "The unsigned value is 254. Subtract 256 for an eight-bit signed field."
    },
    {
      "id": "convert",
      "chapter": 2,
      "title": "Widen or narrow a value",
      "source": "Lecture 5 pp. 10–12",
      "intro": "To widen a signed value on the course machine, replicate its sign bit. Unsigned widening fills the new high positions with zeros. Conversion to an unsigned width keeps the value modulo 2 to that width.",
      "example": "8-bit signed   11111010  = −6\n16-bit signed  11111111 11111010\n16-bit unsigned 0x12FE → 8-bit unsigned 0xFE",
      "steps": [
        "The first change preserves −6. Reading the original eight bits as unsigned gives 250, which widens to 0x00FA.",
        "When narrowing to signed C types, an out-of-range result depends on the implementation under C99. The slides use the course machine’s low-bit convention."
      ],
      "question": "Widen unsigned 8-bit 0xFE to a 16-bit unsigned value. What do you get?",
      "options": [
        "0xFFFE",
        "0x00FE",
        "0xFE00"
      ],
      "answer": 1,
      "reason": "The source value is 254 and the new high bits are zero."
    },
    {
      "id": "promotions",
      "chapter": 2,
      "title": "Choose the comparison type",
      "source": "Lecture 5 p. 18",
      "intro": "Before arithmetic or a comparison, C promotes narrow integer types. On this machine int can hold every unsigned short value. Equal-rank signed int and unsigned int are compared as unsigned int.",
      "example": "int x = -1;\nunsigned short s = 1;\nunsigned int   u = 1;\n// x < s is true. x < u is false.",
      "steps": [
        "For x<s, s promotes to int: −1 < 1. For x<u, x converts to UINT_MAX, the largest unsigned int.",
        "An explicit cast to int preserves any value that fits. (int)2147483647U is still 2147483647 here."
      ],
      "question": "On this machine, is 2147483647 > (int)2147483647U true?",
      "options": [
        "False; the values are equal",
        "True; the cast produces −1",
        "True; signed always wins"
      ],
      "answer": 0,
      "reason": "0x7FFFFFFF is representable in a 32-bit signed int. The U suffix never set its high bit."
    },
    {
      "id": "unsigned-loop",
      "chapter": 2,
      "title": "Test an empty unsigned range",
      "source": "Lecture 5 p. 19",
      "intro": "size_t, the type returned by sizeof, is unsigned. Subtracting one from unsigned zero wraps to its maximum. A loop may accidentally enter on an empty input if its bound subtracts one first.",
      "example": "for (size_t i=0; i<n; ++i) { /* visit i */ }\n// For adjacent pairs instead:\nfor (size_t j=1; j<n; ++j) { /* use j-1 and j */ }",
      "steps": [
        "The first loop visits zero elements when n=0. The pair loop begins with the right index 1 and checks it before touching either element.",
        "For n=3 the pairs are (0,1) and (1,2). The tempting condition i<n-1 underflows if n=0."
      ],
      "question": "For n=1 how many pairs does the second loop visit?",
      "options": [
        "1",
        "0",
        "2"
      ],
      "answer": 1,
      "reason": "Its first test is 1<1. There is one element and no adjacent pair."
    },
    {
      "id": "shift",
      "chapter": 3,
      "title": "Move a bit into position",
      "source": "Lecture 4 pp. 7–8",
      "intro": "Start with an unsigned pattern. A left shift by k moves its bits k positions toward higher place values, introducing zeros on the right. Unsigned right shift moves them toward lower values, introducing zeros on the left.",
      "example": "unsigned x=5u;  // low bits 0101\n1u << 3   → 00001000 (8)\nx >> 1    → 00000010 (2)",
      "steps": [
        "5 is 0101. Shifting it right by one discards its low one. The remaining value is 2.",
        "The examples display low bits. In C the operands are promoted first; plain 1 is int. For 32-bit unsigned int use shift counts from 0 through 31."
      ],
      "question": "Which expression selects the weight of bit 5 when the rightmost bit is numbered zero?",
      "options": [
        "5u << 1",
        "1u >> 5",
        "1u << 5"
      ],
      "answer": 2,
      "reason": "The place value is 2 to the fifth power, or 32."
    },
    {
      "id": "mask",
      "chapter": 3,
      "title": "Select a bit with a mask",
      "source": "Lecture 4 pp. 12–16",
      "intro": "A mask has ones at selected positions. Unsigned 1u << k moves a one left k positions. Bitwise & keeps positions where both inputs have a one. Use a count below the promoted width and an unsigned left operand wide enough for the field.",
      "example": "unsigned byte = 0x10, mask = 1u << 4;\nint selected = (byte & mask) != 0;",
      "steps": [
        "mask equals 0x10. The AND yields 0x10, and comparing that to zero yields 1.",
        "Without the parentheses, != runs before &: byte & (mask!=0) tests bit zero for a nonzero mask. 0x57 hides this bug because bits zero and four are both set."
      ],
      "question": "For byte 0x01 and mask 0x10, what does the correctly grouped test return?",
      "options": [
        "1",
        "0",
        "16"
      ],
      "answer": 1,
      "reason": "Bit zero is set, but bit four is clear."
    },
    {
      "id": "modify",
      "chapter": 3,
      "title": "Update one bit without disturbing its neighbors",
      "source": "Lecture 6 pp. 15–18",
      "intro": "OR sets the selected bit, AND with an inverted mask clears it, and XOR flips it. The C operators are |, & with ~, and ^. Compound assignment stores the computed value back, for example x ^= mask means x = x ^ mask.",
      "example": "unsigned x=0x57, m=0x10;\nx &= ~m;  // 0x47\nx ^= m;   // 0x57\nx |= m;   // 0x57",
      "steps": [
        "Clearing takes away the 16-place bit. Toggling once restores it. Setting an already-set bit leaves the value alone.",
        "A helper that returns x | m takes its integer argument by value. The caller must store that return value to change its own x."
      ],
      "question": "Start with 0x5C and toggle 0x40 twice. What is the final byte?",
      "options": [
        "0x1C",
        "0x40",
        "0x5C"
      ],
      "answer": 2,
      "reason": "The two intermediate states are 0x1C and 0x5C."
    },
    {
      "id": "bit-order",
      "chapter": 3,
      "title": "Locate a global bit in either order",
      "source": "Lecture 6 pp. 9–16",
      "intro": "For a nonnegative global position p in a byte array, integer division p/8 chooses the byte. The remainder p%8 chooses a slot from 0 to 7. The stream specification decides which physical bit that slot names.",
      "example": "p=12 → byte 1, slot 4\nLSB-first mask: 1u << 4     = 0x10\nMSB-first mask: 1u << (7-4) = 0x08",
      "steps": [
        "LSB means least significant bit, the rightmost position in the usual written byte. MSB means most significant, the leftmost position.",
        "Use exactly the same test, set, clear or toggle from the last pages after choosing the mask. Byte order in a multibyte integer is a separate convention."
      ],
      "question": "Set global bit 8 in an initially zero MSB-first stream. Which byte changes and to what?",
      "options": [
        "Byte 1 becomes 0x80",
        "Byte 0 becomes 0x01",
        "Byte 1 becomes 0x01"
      ],
      "answer": 0,
      "reason": "Position 8 begins the second byte. MSB-first slot 0 selects shift 7."
    },
    {
      "id": "cursor",
      "chapter": 3,
      "title": "Read a field across a byte boundary",
      "source": "Lecture 5 pp. 24–28",
      "intro": "A cursor records the position of the next unread bit. With MSB-first positions and the first extracted bit most significant, append each bit by doubling the running value and adding the new bit.",
      "example": "bytes:    10110110 01010111\nposition: 0......7 8.....15\nstart p=6, width=5",
      "steps": [
        "Take positions 6,7 from the first byte: 10. Take 8,9,10 from the second: 010. Joined field 10010 is 18 unsigned or 18−32=−14 signed.",
        "The next unread position is 6+5=11. In a length-prefixed format read the length first, advance past it, stop on its zero sentinel, and check enough bits remain before consuming a nonempty field."
      ],
      "question": "Starting at p=7 in the same bytes, read three MSB-first bits. Which unsigned value and next p?",
      "options": [
        "0 and 10",
        "1 and 9",
        "1 and 10"
      ],
      "answer": 2,
      "reason": "The last bit of the first byte is 0. The second byte begins 01. Joined, 001 is 1, and 7+3=10."
    },
    {
      "id": "length-field",
      "chapter": 3,
      "title": "Read a length-prefixed record",
      "source": "Bitstream practice",
      "intro": "A record format can reuse the cursor twice: first to read a width, then to read that many data bits. In this exercise the length takes five MSB-first bits. A zero length ends the stream. A nonzero field includes its own sign bit.",
      "example": "Bits:   00011 101 00000\nFields: width data  stop",
      "steps": [
        "Starting at 0, read 00011 = 3 and advance to 5. Read 101 at positions 5–7: as three-bit signed data its value is 5−8=−3. The cursor reaches 8.",
        "Read the next five bits and stop at cursor 13. With only two data bits available after a declared width of three, report an incomplete record before accessing another bit."
      ],
      "question": "A stream starts 00001 1 00000. What is the first decoded value and the cursor just after its data?",
      "options": [
        "−1 and 6",
        "1 and 6",
        "−1 and 5"
      ],
      "answer": 0,
      "reason": "Length 1 consumes five bits. One signed data bit 1 has weight −1. Reading it advances to 6."
    },
    {
      "id": "pack",
      "chapter": 3,
      "title": "Find the shortest signed field",
      "source": "Lecture 5 pp. 29–31",
      "intro": "Remove repeated leading sign bits while the next bit has the same sign. Preserve at least one bit. To decode, recover the unsigned field and apply its top-bit weight. Packing and unpacking should undo one another.",
      "example": "0 → 0      −1 → 1\n1 → 01     −2 → 10\n2 → 010    −3 → 101",
      "steps": [
        "Positive one needs a leading zero or its only bit would mean −1. For −2 the pattern 10 weighs −2+0.",
        "If the highest stored index is n and you wrote indices 0 through n inclusive, report n+1 bits. For bits 32–63 use a 64-bit unsigned mask, e.g. UINT64_C(1)<<i with 0≤i<64."
      ],
      "question": "What is the shortest signed encoding of +3?",
      "options": [
        "11",
        "011",
        "0011"
      ],
      "answer": 1,
      "reason": "11 interpreted in two signed bits is −1. Three bits suffice to hold +3.",
      "listing": {
        "title": "Pack and unpack signed fields in C99",
        "code": "#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <stdio.h>\n\n/* Preconditions: eight-bit bytes, 1 <= n <= 64, enough buffer bytes.\n   Bit 0 is the low bit of byte 0. */\nstatic unsigned bit_at(const unsigned char *buf, unsigned i) {\n    return (buf[i / 8] >> (i % 8)) & 1u;\n}\n\nstatic int64_t unpack_signed(const unsigned char *buf, unsigned n) {\n    /* Begin with the signed contribution of the leading bit.\n       Appending each lower bit doubles the prefix, then adds the bit. */\n    int64_t value = bit_at(buf, n - 1) ? -1 : 0;\n    for (unsigned remaining = n - 1; remaining > 0; --remaining) {\n        value = value * 2 + bit_at(buf, remaining - 1);\n    }\n    return value;\n}\n\nstatic unsigned pack_signed(int64_t value, unsigned char *buf) {\n    uint64_t u = (uint64_t)value;\n    unsigned n = 64;\n    while (n > 1 && ((u >> (n-1)) & 1u) == ((u >> (n-2)) & 1u)) {\n        --n;\n    }\n    for (unsigned i = 0; i < (n + 7) / 8; ++i) buf[i] = 0;\n    for (unsigned i = 0; i < n; ++i) {\n        if ((u >> i) & 1u) buf[i / 8] |= 1u << (i % 8);\n    }\n    return n;\n}\n\n/* Compare two signed n-bit patterns WITHOUT comparing x and y with <.\n   Flip their sign bit so negative patterns sort before positive ones.\n   Compare the resulting bits from high to low. */\nstatic int less_signed_field(uint64_t x, uint64_t y, unsigned n) {\n    uint64_t sign = UINT64_C(1) << (n - 1);\n    x ^= sign;\n    y ^= sign;\n    for (unsigned left = n; left > 0; --left) {\n        unsigned bx = (unsigned)((x >> (left-1)) & 1u);\n        unsigned by = (unsigned)((y >> (left-1)) & 1u);\n        if (bx != by) return !bx;\n    }\n    return 0;\n}\n\nint main(void) {\n    unsigned char buf[8];\n    int64_t cases[] = {0, -1, 1, -2, 127, -128, 128, -129,\n                       INT64_MAX, INT64_MIN};\n    for (size_t i = 0; i < sizeof cases / sizeof cases[0]; ++i) {\n        unsigned n = pack_signed(cases[i], buf);\n        assert(unpack_signed(buf, n) == cases[i]);\n        printf(\"%lld uses %u bits\\n\", (long long)cases[i], n);\n    }\n    assert(less_signed_field(0x10, 0x0F, 5)); /* -16 < 15 */\n    assert(!less_signed_field(0x0F, 0x10, 5));\n}\n"
      }
    },
    {
      "id": "struct",
      "chapter": 4,
      "title": "Group fields into a struct",
      "source": "Lecture 8 and Structs p. 3",
      "intro": "A struct keeps several fields together in one object. A field has a type and a name. Use a dot to select it from an object. Use an arrow to select it through a pointer to that object.",
      "example": "struct Point { int x; int y; };\nstruct Point a = {2, 5};\nstruct Point *p = &a;\np->y = 7;",
      "steps": [
        "p->y means (*p).y. The store changes a.y, leaving a.x at 2.",
        "An assignment of the whole struct makes a value copy. Any pointer field inside would itself be copied as an address."
      ],
      "question": "After struct Point b=a; b.x=9; what is a.x?",
      "options": [
        "2",
        "9",
        "7"
      ],
      "answer": 0,
      "reason": "The structs have separate storage. Updating b.x leaves the copied-from field alone."
    },
    {
      "id": "lifetime",
      "chapter": 4,
      "title": "Track how long an object exists",
      "source": "Lecture 8 pp. 9–12",
      "intro": "Ordinary local variables live until execution leaves their block. Static storage lasts for the whole program. A pointer may itself go out of scope while an object it points to continues to exist.",
      "example": "int next(void) {\n    static int n;  // initially zero, persists\n    return ++n;\n}",
      "steps": [
        "Two calls return 1 then 2. In contrast, an ordinary local int n=0 is initialized again each call.",
        "Returning the address of an ordinary local creates a dangling pointer when the function returns. An uninitialized automatic scalar has an indeterminate value."
      ],
      "question": "Which object may a caller still read through a returned pointer after the function returns?",
      "options": [
        "An ordinary local int",
        "A static local int",
        "An ordinary local array"
      ],
      "answer": 1,
      "reason": "The static object’s lifetime continues even though its name is scoped to the function."
    },
    {
      "id": "allocate",
      "chapter": 4,
      "title": "Allocate the right number of bytes",
      "source": "Lecture 8 pp. 10–15",
      "intro": "malloc from <stdlib.h> asks for bytes of dynamically allocated storage. It returns a pointer or NULL on failure. free releases a successful allocation. Its lifetime extends until release, across ordinary function returns.",
      "example": "int *p = malloc(3 * sizeof *p);\nif (p != NULL) {\n    p[2] = 7;\n    free(p);\n}",
      "steps": [
        "sizeof *p gives the size of one int here without reading uninitialized storage. Three ints require 12 bytes. sizeof p would measure the 8-byte pointer.",
        "The local p and the allocation have different lifetimes. After free no alias may access the released ints. For an arbitrary count, check multiplication fits before allocating."
      ],
      "question": "For a pointer to 16-byte structs, how many bytes does malloc(3 * sizeof *p) request?",
      "options": [
        "24",
        "16",
        "48"
      ],
      "answer": 2,
      "reason": "sizeof *p follows the pointed-to type through a type change."
    },
    {
      "id": "list",
      "chapter": 4,
      "title": "Draw a list and its endpoints",
      "source": "Linked lists pp. 3–6",
      "intro": "A node holds a payload and links to other nodes. A doubly linked node has next and prev pointers. The list records the first node as head and the last as tail. NULL marks a missing neighbor.",
      "example": "head → A ⇄ B ← tail\nA.prev=NULL    A.next=B\nB.prev=A       B.next=NULL",
      "steps": [
        "Read A.next to reach B. Read B.prev to get back. A list can use separated allocations, so moving to the next node follows an address stored inside the current one.",
        "An empty list has head=tail=NULL. In a singleton head and tail both designate the same node."
      ],
      "question": "In a two-node list, which expression designates the second node?",
      "options": [
        "head + 1",
        "head->next",
        "head->prev"
      ],
      "answer": 1,
      "reason": "Nodes can be anywhere in allocated storage. The stored next link supplies the address."
    },
    {
      "id": "insert",
      "chapter": 4,
      "title": "Insert without losing a neighbor",
      "source": "Linked lists pp. 4, 11–13",
      "intro": "Before inserting, name the left and right neighbors. Give the new node links to both, then change each existing neighbor or endpoint to point to it. Assume a fresh allocated node n.",
      "example": "right = left ? left->next : head;\nn->prev = left; n->next = right;\nif (left) left->next = n; else head = n;\nif (right) right->prev = n; else tail = n;",
      "steps": [
        "The first line uses C’s condition ? value_if_true : value_if_false. In A⇄C, inserting after A saves C before changing A.next. The result is A⇄n⇄C.",
        "For insertion at the front left is NULL. For insertion at the end right is NULL. In an empty list both branches update the endpoints."
      ],
      "question": "Append n to the singleton A. Which two pointers must now designate n?",
      "options": [
        "head and tail",
        "A.prev and head",
        "A.next and tail"
      ],
      "answer": 2,
      "reason": "A stays the head. The new last node has prev=A and next=NULL."
    },
    {
      "id": "unlink",
      "chapter": 4,
      "title": "Unlink a node at any position",
      "source": "Linked lists p. 5",
      "intro": "Save the node’s two neighbors and its payload before freeing it. Bypass the node in both directions. When a neighbor is absent, change the corresponding endpoint.",
      "example": "left=n->prev; right=n->next; item=n->data;\nif (left)  left->next=right; else head=right;\nif (right) right->prev=left; else tail=left;\nfree(n);",
      "steps": [
        "For middle B in A⇄B⇄C, A.next becomes C and C.prev becomes A. The endpoints stay A and C.",
        "For head or tail, one endpoint changes. For a singleton, both neighbors are NULL, so both endpoints become NULL. item may still belong to the caller."
      ],
      "question": "Remove A from A⇄B. What are head, tail and B.prev?",
      "options": [
        "B, B, NULL",
        "B, A, A",
        "NULL, B, A"
      ],
      "answer": 0,
      "reason": "B is the only remaining node. Its reverse link must stop at NULL."
    },
    {
      "id": "ownership",
      "chapter": 4,
      "title": "Release each owned object once",
      "source": "Linked lists pp. 15–17",
      "intro": "An ownership rule says who must release an allocation. A list may own its nodes and merely borrow payloads. A free list is a second chain of detached nodes saved for reuse.",
      "example": "while (n != NULL) {\n    struct Node *later = n->next;\n    free(n);\n    n = later;\n}",
      "steps": [
        "Save next while n still exists. Freeing n first and then reading n->next uses released storage.",
        "If this list borrows payloads, release only nodes. If it owns distinct heap strings, release each string before the node. A free-list design also drains its detached chain on destruction and never leaves a node in both chains."
      ],
      "question": "A node holds the address of a caller’s ordinary local int. Who should free that int?",
      "options": [
        "The list destructor",
        "The node allocator",
        "Nobody calls free on that int"
      ],
      "answer": 2,
      "reason": "That int has automatic storage. The caller controls its lifetime and free requires allocated storage."
    },
    {
      "id": "list-rmdup",
      "chapter": 4,
      "title": "Store distinct lines in owned nodes",
      "source": "Linked lists p. 15",
      "intro": "Combine the line-buffer problem with a list. Compare a newly read string against the payloads. For an unseen line allocate a node and a private copy of the characters, then append it and print the line.",
      "example": "read line → search using strcmp\nduplicate → reuse the input buffer\nnew line → reserve strlen(line)+1 bytes\n         → copy, append, print",
      "steps": [
        "Trace A, B, A. Two owned strings outlive the reused input buffer; the third line adds no node.",
        "On either allocation failure release any partial allocation and later destroy the list. On normal completion release each owned string and node. Empty input requires no allocation."
      ],
      "question": "For a saved line containing the characters A and newline, how many bytes must the copy hold?",
      "options": [
        "3",
        "2",
        "1"
      ],
      "answer": 0,
      "reason": "The copy holds A, the newline and the terminating zero.",
      "listing": {
        "title": "Filter repeated lines with owned nodes in C99",
        "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n/* Each node owns its text. A singly linked chain suffices for this search. */\nstruct Node {\n    char *text;\n    struct Node *next;\n};\n\nint main(void) {\n    struct Node *head = NULL;\n    struct Node *tail = NULL;\n    char line[256];\n    int status = 0;\n\n    while (fgets(line, sizeof line, stdin)) {\n        struct Node *seen = head;\n        while (seen && strcmp(seen->text, line) != 0) {\n            seen = seen->next;\n        }\n        if (seen) continue;\n\n        struct Node *node = malloc(sizeof *node);\n        if (!node) {\n            status = 1;\n            break;\n        }\n        node->text = malloc(strlen(line) + 1);\n        if (!node->text) {\n            free(node);\n            status = 1;\n            break;\n        }\n        strcpy(node->text, line);\n        node->next = NULL;\n        if (tail) tail->next = node;\n        else head = node;\n        tail = node;\n        fputs(node->text, stdout);\n    }\n    while (head) {\n        struct Node *next = head->next;\n        free(head->text);\n        free(head);\n        head = next;\n    }\n    return status || ferror(stdin);\n}\n"
      }
    },
    {
      "id": "closest",
      "chapter": 4,
      "title": "Visit each possible pair once",
      "source": "Lecture 8 p. 15",
      "intro": "For closest, store the requested points, then compare pairs of distinct indices. Squared distance compares the same way as distance for ordinary bounded coordinates and saves a square root. Keep the first minimum when distances tie.",
      "example": "for i from 0 through n−1:\n    for j from i+1 through n−1:\n        d = (x[i]−x[j])² + (y[i]−y[j])²\n        if d < best: remember d, i, j",
      "steps": [
        "Check n≥2 and all coordinate reads before comparing. With (0,0), (3,0), (4,0), squared distances are 9, 16, 1. Initialize best from the first pair. The final pair wins.",
        "Validate the requested allocation size and its result. Free the points on success and on an incomplete read. Compare indices so two distinct points at identical coordinates can legitimately have distance zero."
      ],
      "question": "For three identical input points and a strict less-than update, which index pair survives?",
      "options": [
        "(0,0)",
        "(0,1)",
        "(1,2)"
      ],
      "answer": 1,
      "reason": "The first valid pair has distance zero. No later distance is strictly smaller.",
      "listing": {
        "title": "Read, compare and release the points in C99",
        "code": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct { double x, y; } point;\n\nstatic double distance_squared(point a, point b) {\n    double dx = a.x - b.x;\n    double dy = a.y - b.y;\n    return dx*dx + dy*dy;\n}\n\nint main(void) {\n    size_t n;\n    if (scanf(\"%zu\", &n) != 1 || n < 2 || n > SIZE_MAX / sizeof(point))\n        return 1;\n    point *p = malloc(n * sizeof *p);\n    if (!p) return 1;\n    for (size_t i = 0; i < n; ++i) {\n        if (scanf(\"%lf%lf\", &p[i].x, &p[i].y) != 2) {\n            free(p);\n            return 1;\n        }\n    }\n    size_t first = 0, second = 1;\n    double best = distance_squared(p[first], p[second]);\n    for (size_t i = 0; i < n; ++i) {\n        for (size_t j = i + 1; j < n; ++j) {\n            double d = distance_squared(p[i], p[j]);\n            if (d < best) { best = d; first = i; second = j; }\n        }\n    }\n    printf(\"%.2f %.2f\\n%.2f %.2f\\n\", p[first].x, p[first].y,\n           p[second].x, p[second].y);\n    free(p);\n    return 0;\n}\n"
      }
    },
    {
      "id": "build",
      "chapter": 5,
      "title": "Follow one source file through a build",
      "source": "Lecture 7 pp. 3–6",
      "intro": "A program can use several .c files. Preprocessing expands #include and macros in each. Compilation and assembly produce an object file per source. The linker connects references across objects to create the executable.",
      "example": "gcc -std=c99 -c main.c -o main.o\ngcc -std=c99 -c stack.c -o stack.o\ngcc main.o stack.o -o demo",
      "steps": [
        "A header supplies declarations so the compiler can check calls. The first two commands stop after producing object files.",
        "If main calls a declared function whose definition is in stack.o, linking only main.o can fail with an undefined reference. A missing included header fails earlier, during preprocessing."
      ],
      "question": "Both object files build, but each defines the same external function. Which step detects the duplicate?",
      "options": [
        "Linking",
        "Preprocessing",
        "Reading the header guard"
      ],
      "answer": 0,
      "reason": "The linker combines external definitions from the separately compiled objects."
    },
    {
      "id": "interface",
      "chapter": 5,
      "title": "Expose declarations and hide helpers",
      "source": "Lecture 7 pp. 6–11",
      "intro": "A declaration gives a name and type. A function definition also gives its body. Put the public declaration in a header so clients and implementation agree. A file-scope static function is private to its translation unit.",
      "example": "// stack.h\nint stack_size(void);\n // stack.c\nstatic int count_nodes(void) { return 0; }\nint stack_size(void) { return count_nodes(); }",
      "steps": [
        "Here void in a parameter list means no parameters. count_nodes is callable within stack.c. A client includes the header for stack_size.",
        "A header guard (#ifndef, #define, #endif) prevents repeated inclusion within a translation unit. The external definition belongs in a single .c file."
      ],
      "question": "Two .c files include a guarded header containing an ordinary external function body. What can still happen?",
      "options": [
        "The guard spans the whole program",
        "Duplicate definitions at link time",
        "Both calls become private helpers"
      ],
      "answer": 1,
      "reason": "Each .c is preprocessed separately and can acquire its own external definition."
    },
    {
      "id": "handle",
      "chapter": 5,
      "title": "Use an opaque handle for each stack",
      "source": "Lecture 7 pp. 16–18 and void-pointer handout",
      "intro": "A handle lets clients identify an object while the implementation defines its representation. typedef gives a type a name. The lecture uses void * for a generic object address. An implementation must recover the correct concrete pointer type before accessing fields.",
      "example": "typedef void *stack_t;\nstack_t a=stack_new(), b=stack_new();\nstack_push(a, item);    // item is the payload pointer",
      "steps": [
        "The implementation can allocate a separate top-pointer slot per stack. Through a pointer to that slot (struct node **), push can replace the top even when the stack starts empty.",
        "The stack handle identifies which stack to update. The payload pointer identifies what to store. Separate handle allocations let b remain empty after pushing onto a."
      ],
      "question": "If stack_t b=a; copies an existing handle, how many stack objects does that line create?",
      "options": [
        "1",
        "2",
        "0"
      ],
      "answer": 2,
      "reason": "Both handle values now designate the same state. A second constructor call would create separate state."
    },
    {
      "id": "make",
      "chapter": 5,
      "title": "Follow a changed prerequisite",
      "source": "Makefiles handout pp. 1–2",
      "intro": "In make, the target is left of the colon. Prerequisites are on the right. The tab-indented recipe builds the target. A newer prerequisite makes its dependent target stale.",
      "example": "demo: main.o names.o\n\tgcc -o $@ $^\nmain.o: main.c common.h\n\tgcc -c main.c -o main.o\nnames.o: names.c common.h names.h\n\tgcc -c names.c -o names.o",
      "steps": [
        "Change names.h: rebuild names.o, then relink demo. Change common.h: both objects rebuild.",
        "In the link recipe $@ expands to demo and $^ to main.o names.o, with repeated prerequisites omitted. -c requests compilation without linking; -o names the output."
      ],
      "question": "From an up-to-date build change only main.c. What rebuilds?",
      "options": [
        "All objects then demo",
        "main.o then demo",
        "Only demo"
      ],
      "answer": 1,
      "reason": "Only main.o lists main.c. Its new timestamp makes demo stale next."
    },
    {
      "id": "operands",
      "chapter": 6,
      "title": "Recall what an operand names",
      "source": "Assembly I pp. 15–24",
      "intro": "Use your Assembly Lab vocabulary here. In AT&T order, movq reads its left operand and writes its right operand. The q selects eight bytes. $ introduces a constant, % names a register, and parentheses in mov request memory at an address.",
      "example": "%rdi points to a long holding 7; %rsi points to a long holding 9\nmovq (%rdi), %rax\nmovq (%rsi), %rdx\nmovq %rdx, (%rdi)\nmovq %rax, (%rsi)",
      "steps": [
        "Trace the two loads: registers receive 7 and 9 while memory stays unchanged. The stores write 9 and 7 to the original locations.",
        "Saving the first value before overwriting its cell makes the swap possible. A register copy alone never writes the caller’s memory."
      ],
      "question": "Replace the last instruction with movq $4,%rax. What values are now in the two memory cells?",
      "options": [
        "9 and 7",
        "4 and 9",
        "9 and 9"
      ],
      "answer": 2,
      "reason": "The first store already changed the first cell. The replacement changes a register, so the second cell still contains its original 9.",
      "assembly": [
        {
          "id": "pointer-load",
          "title": "Parentheses make MOV read memory"
        },
        {
          "id": "swap-complete",
          "title": "Complete the swap and explain every state"
        }
      ]
    },
    {
      "id": "lea",
      "chapter": 6,
      "title": "Recall the address calculation",
      "source": "Assembly I pp. 30–33",
      "intro": "For displacement(base,index,scale), compute displacement + base + index×scale. lea returns that number. mov with a memory source reads bytes at that address. The same arithmetic can also build a product without accessing memory.",
      "example": "%rdi=100, %rsi=3; memory at byte 116 holds 42\nleaq 4(%rdi,%rsi,4), %rax\nmovl 4(%rdi,%rsi,4), %edx",
      "steps": [
        "Address column: 4+100+3×4=116. Register results: rax=116 and edx=42. Memory was only read by movl.",
        "For arithmetic, leaq (%rsi,%rsi,4),%rax gives 5×rsi. Follow subsequent shifts and multiplies through the registers that actually reach the return value."
      ],
      "question": "If rsi=3 and lea computes 5×rsi before salq $1,%rax, what is the final rax?",
      "options": [
        "30",
        "15",
        "6"
      ],
      "answer": 0,
      "reason": "The intermediate is 15; shifting left one doubles it.",
      "assembly": [
        {
          "id": "lea-compare",
          "title": "Predict LEA and MOV side by side"
        },
        {
          "id": "lea-arithmetic",
          "title": "Use address arithmetic on ordinary numbers"
        }
      ]
    },
    {
      "id": "flags",
      "chapter": 6,
      "title": "Recall the last flag writer",
      "source": "Assembly II pp. 5–12",
      "intro": "cmpq src,dst sets condition flags as if computing dst−src. A conditional jump reads the flags. jl and jg use signed order; jb and ja use unsigned order. Equality branches test the zero flag.",
      "example": "%rdi=2, %rsi=5\ncmpq %rsi,%rdi\nleaq 8(%rdi),%rdi\njl .smaller",
      "steps": [
        "cmp compared 2 against 5. lea changes rdi to 10 and preserves the flags, so the jump is taken.",
        "Replacing lea with addq $8,%rdi overwrites the flags. A nonzero shift also updates flags; a zero-count shift preserves them. test r,r sets zero/sign flags from r and clears carry and overflow."
      ],
      "question": "With rdi holding all-one bits and rsi=1, which two jumps after cmpq %rsi,%rdi are true independently?",
      "options": [
        "jg and jb",
        "je and ja",
        "jl and ja"
      ],
      "answer": 2,
      "reason": "All-one bits encode signed −1 or the largest unsigned value. The jump condition selects the interpretation.",
      "assembly": [
        {
          "id": "flag-lifetime",
          "title": "Know which flags are still meaningful"
        },
        {
          "id": "ordered-branches",
          "title": "Signed and unsigned need different conditions"
        }
      ]
    },
    {
      "id": "loop-recall",
      "chapter": 6,
      "title": "Recall the loop’s entry test",
      "source": "Loops pp. 5–8",
      "intro": "Recover initialization, first test, body and update. A pre-test while can run zero times. A post-test do-while runs the body before its first test. In a for loop the update follows the body.",
      "example": "result=b\nif b<=0, return result\nrepeat: result=result*a; b=b-a\n        if b>0, go to repeat\nreturn result",
      "steps": [
        "The guard makes the whole loop equivalent to while(b>0). For a=2,b=5 the b values after subtraction are 3,1,−1 and result ends at 40.",
        "Look immediately before jne to find the deciding flag writer. A decrement there tests the remaining count; a shift there can test whether an input has become zero."
      ],
      "question": "Set a=2,b=0 at entry to the guarded example. How many multiplications execute?",
      "options": [
        "0",
        "1",
        "2"
      ],
      "answer": 0,
      "reason": "The entry guard takes the return path before the first multiply.",
      "assembly": [
        {
          "id": "guarded-while",
          "title": "Use a bottom test without changing while semantics"
        },
        {
          "id": "do-while",
          "title": "Place the condition after the first body execution"
        },
        {
          "id": "for-loop",
          "title": "Separate initialize, test, body and update"
        }
      ]
    },
    {
      "id": "call",
      "chapter": 6,
      "title": "Recall the return address",
      "source": "Procedures pp. 4–12",
      "intro": "On the class’s Linux x86-64 convention the first integer arguments arrive in rdi, rsi and rdx, and a scalar result returns in rax. rip tracks the next instruction and rsp points to the top of the stack.",
      "example": "Before call: rsp=0x1000. Following instruction starts at 0x405.\ncall f  → rsp=0xFF8, memory[rsp]=0x405, execution enters f\nret     → pop saved address into rip, rsp=0x1000",
      "steps": [
        "A push subtracts eight from rsp and stores a value. A pop reads it and adds eight. With a conventional frame, leave restores rsp from rbp, then pops the previous rbp.",
        "call saves the continuation. If the caller needs a value in caller-saved r10 after f returns, it must preserve it. A callee using r12 must restore that callee-saved register."
      ],
      "question": "If f returns 7, which register holds 7 after ret?",
      "options": [
        "rip",
        "rax",
        "rsp"
      ],
      "answer": 1,
      "reason": "The result and the address of the instruction to resume have different jobs.",
      "assembly": [
        {
          "id": "call-continuation",
          "title": "CALL saves where execution should resume"
        },
        {
          "id": "local-frame",
          "title": "Reserve a local value at a stable offset"
        },
        {
          "id": "saved-registers",
          "title": "Respect the caller’s saved values"
        }
      ]
    },
    {
      "id": "frames",
      "chapter": 6,
      "title": "Count active calls",
      "source": "Procedures p. 23",
      "intro": "Count an activation when a named function begins. Depth is the number active simultaneously. A recursive function must preserve any local value it needs after calling itself, using separate per-call storage or correctly saved registers.",
      "example": "main → helper → rand → return to helper → return to main\nmain repeats the helper call three times\nmain then calls printf once",
      "steps": [
        "Counting main and every displayed named call once per invocation gives 1+3+3+1=8 activations. Peak depth is 3 while rand runs. This counts the source-level calls and excludes library internals.",
        "For factorial(3), a multiplication after the recursive return needs this call’s n=3, even while the child operates on n=2. A single unprotected caller-saved register cannot preserve both."
      ],
      "question": "Counting only the displayed bodies main and helper, what are total activations and peak depth?",
      "options": [
        "4 and 2",
        "8 and 3",
        "3 and 3"
      ],
      "answer": 0,
      "reason": "Main runs once; helper runs three times sequentially. At most one helper is active with main.",
      "assembly": [
        {
          "id": "live-across-call",
          "title": "Keep a needed value safe across a helper"
        },
        {
          "id": "frame-register-names",
          "title": "Distinguish stack top from frame reference"
        }
      ]
    },
    {
      "id": "inline",
      "chapter": 6,
      "title": "Recall the compiler’s operand contract",
      "source": "Inline assembly pp. 1–5",
      "intro": "A GNU extended asm statement lists template, outputs, inputs, and clobbers. An operand number uses one %, while a literal register in a template uses two, as in %%rax. The compiler assigns registers according to the constraints.",
      "example": "long a=13, b=7;\n__asm__(\"imulq %1,%0\" : \"+r\"(a) : \"r\"(b) : \"cc\");",
      "steps": [
        "Operand 0 is a: +r says read and write its old value. Operand 1 supplies b. The result is 91. cc declares changed condition codes.",
        "A fresh output written only at the end uses =r. If an output is written before an independent input’s final read, =&r can forbid that unsafe register overlap."
      ],
      "question": "Which constraint fits a fresh register output written early while another input is still needed?",
      "options": [
        "+r",
        "=&r",
        "r"
      ],
      "answer": 1,
      "reason": "The = declares write-only and & marks early clobber. r selects a register.",
      "assembly": [
        {
          "id": "inline-contract",
          "title": "Declare what the compiler must know"
        },
        {
          "id": "inline-placeholders",
          "title": "Substitute operands without guessing register names"
        },
        {
          "id": "inline-earlyclobber",
          "title": "Protect a later input from an early output write"
        }
      ]
    },
    {
      "id": "counter",
      "chapter": 6,
      "title": "Recall how two halves form a timestamp",
      "source": "Inline assembly pp. 7–8",
      "intro": "RDTSC supplies a 64-bit counter as two unsigned 32-bit halves, high in EDX and low in EAX. Widen the high half before shifting it 32 places. A volatile asm read requests a fresh sample.",
      "example": "uint64_t cur = ((uint64_t)hi << 32) | lo;\n// hi=1, lo=2 → 0x0000000100000002\nstatic uint64_t last;\nuint64_t delta=cur-last; last=cur;",
      "steps": [
        "uint64_t from <stdint.h> holds 64 unsigned bits. Moving hi left creates room for all 32 low bits. OR combines the nonoverlapping fields.",
        "Static last starts at zero. The first delta equals the first full counter. Later deltas include the work between reads."
      ],
      "question": "One sample is hi=0,lo=0xFFFFFFFE. The next is hi=1,lo=1. What is the delta?",
      "options": [
        "1",
        "4294967295",
        "3"
      ],
      "answer": 2,
      "reason": "After FFFFFFFE come FFFFFFFF, 1:00000000, and 1:00000001. Combining the halves accounts for the carry.",
      "assembly": [
        {
          "id": "inline-counter-read",
          "title": "Read a changing hardware counter through explicit outputs"
        },
        {
          "id": "counter-combine",
          "title": "Combine two halves into one unsigned value"
        },
        {
          "id": "counter-delta",
          "title": "Turn readings into a documented interval"
        }
      ]
    },
    {
      "id": "rows",
      "chapter": 7,
      "title": "Recover a row width from a stride",
      "source": "Arrays pp. 10–15",
      "intro": "In int a[R][C], a row is itself an array of C ints. C places each complete row after the previous one. With four-byte ints, the byte address of a[i][j] is base + 4×(C×i+j).",
      "example": "Address from machine code: base + 20*i + 4*j\nbase=76, i=2, j=3",
      "steps": [
        "The row coefficient is 20 bytes. Divide by four bytes per int to recover five columns. The address is 76+40+12=128.",
        "This expression alone does not reveal the number of rows. Bounds apply to each row separately: for five columns, reading a[0][5] is undefined even if its computed address reaches a[1][0]."
      ],
      "question": "For a contiguous int array, address = base+28*i+4*j. How many columns?",
      "options": [
        "28",
        "7",
        "4"
      ],
      "answer": 1,
      "reason": "One row spans 28 bytes, which is seven four-byte elements."
    },
    {
      "id": "row-pointers",
      "chapter": 7,
      "title": "Trace a pointer table",
      "source": "Arrays pp. 16–19",
      "intro": "In int *rows[3], each of the three elements is a pointer. Reading rows[i][j] first obtains the row base from the table. In a contiguous two-dimensional array the row base follows directly from the declaration.",
      "example": "Table starts at 160. Eight-byte slots hold 36,16,56.\nFind rows[1][2]. Four-byte ints in the pointed-to arrays.",
      "steps": [
        "Slot 1 lives at 168 and contains 16. Follow 16, then add 2×4. Read the int at 24. The slot address 168 and the row base 16 are different numbers.",
        "The course drawing reverses the first two slots relative to its printed initializer. Follow the representation specified in the question. Count conceptual data loads with the base already available."
      ],
      "question": "With the same table, which two addresses are read for rows[0][1]?",
      "options": [
        "160 then 164",
        "36 then 40",
        "160 then 40"
      ],
      "answer": 2,
      "reason": "Read slot 0 at 160 to obtain 36. Then read the int four bytes beyond 36.",
      "assembly": [
        {
          "id": "array-layout",
          "title": "An array is a sequence of equal-sized elements"
        }
      ]
    },
    {
      "id": "padding",
      "chapter": 7,
      "title": "Place one struct field at a time",
      "source": "Structs pp. 14–21",
      "intro": "Alignment is a required address multiple. In the course layout, char aligns to 1, short to 2, int and float to 4, and pointers and double to 8. Preserve field order. Round each field’s starting offset up to its alignment.",
      "example": "struct T { short i; float v; short j; };\ni occupies 0–1; padding 2–3\nv occupies 4–7; j occupies 8–9",
      "steps": [
        "The next free byte after j is 10. The largest alignment here is 4, so add two trailing padding bytes. sizeof(struct T)=12.",
        "An array of T has stride 12. For a[2].j the byte offset is 2×12+8=32. The padding ensures the next object’s fields are also aligned."
      ],
      "question": "Move v to the front: float v; short i; short j;. What is the new struct size?",
      "options": [
        "8",
        "10",
        "12"
      ],
      "answer": 0,
      "reason": "Fields occupy offsets 0–3, 4–5 and 6–7. Eight is already a multiple of four."
    },
    {
      "id": "offset-list",
      "chapter": 7,
      "title": "Recover a list operation from offsets",
      "source": "Structs pp. 22–25",
      "intro": "A machine instruction names byte offsets rather than field names. First recover the struct’s layout. Then translate each memory read or write using that map.",
      "example": "struct N { long value; struct N *next; };\n// rdi is a valid node pointer. Offsets: value=0, next=8.\nmovq 8(%rdi),%rax\ntestq %rax,%rax\nje .done\nmovq $0,(%rax)",
      "steps": [
        "The first mov follows the current node’s next link. test checks whether a next node exists. On a null link, the jump skips the store.",
        "Otherwise rax points to the successor. Offset zero of that node is value. The code sets the successor’s value to 0."
      ],
      "question": "What would movq $0,8(%rdi) do in its place on the taken-through-to-store path?",
      "options": [
        "Clear the successor’s value",
        "Move to the successor",
        "Clear the current node’s next pointer"
      ],
      "answer": 2,
      "reason": "The base is still the current node. Offset 8 selects its pointer field.",
      "assembly": [
        {
          "id": "displacement",
          "title": "Add a fixed byte offset"
        },
        {
          "id": "pointer-load",
          "title": "Parentheses make MOV read memory"
        }
      ]
    },
    {
      "id": "hierarchy",
      "chapter": 8,
      "title": "Follow a block into cache",
      "source": "Cache I pp. 5–16",
      "intro": "The CPU works in registers. Small fast caches, usually built with SRAM, hold copies of blocks from slower memory. Main memory typically uses denser DRAM. A block is a consecutive group of bytes transferred together. A cache line holds a block and information about its identity.",
      "example": "A cache starts empty. Each block holds four bytes.\nRead byte 6 → fetch bytes 4,5,6,7.\nRead byte 7 → the same block is already resident.",
      "steps": [
        "The first lookup is a miss, and the second is a hit. A cold cache starts with no valid copies. A later fill may evict a resident block.",
        "SRAM retains its bit while powered without periodic refresh. DRAM needs refresh. Both lose their contents without power."
      ],
      "question": "With four-byte blocks, which address shares byte 7’s block?",
      "options": [
        "4",
        "8",
        "3"
      ],
      "answer": 0,
      "reason": "Blocks are aligned groups 0–3, 4–7, 8–11, and so on."
    },
    {
      "id": "locality",
      "chapter": 8,
      "title": "Rank loops by their inner stride",
      "source": "Cache I pp. 16–21 and locality handout",
      "intro": "Temporal locality means reusing an item soon. Spatial locality means accessing nearby addresses soon. To compare loops, list addresses in execution order and measure the stride in bytes.",
      "example": "int a[3][4];       // base 76, four bytes per int\na[0][0], a[0][1], a[0][2] → 76, 80, 84\na[0][0], a[1][0], a[2][0] → 76, 92, 108",
      "steps": [
        "The row walk steps one int or four bytes. The column walk steps four ints or 16 bytes. Both can compute the same sum.",
        "For the handout’s point with vel[3],acc[3], clear1 visits int offsets 0,1,2,3,4,5; clear2 visits 0,3,1,4,2,5; clear3 starts 0,6,12 across points. The lecture ranks spatial locality clear1, clear2, clear3. Exact misses need geometry."
      ],
      "question": "Each point holds six adjacent ints. What byte stride does a loop over vel[0] of successive points have?",
      "options": [
        "6 bytes",
        "24 bytes",
        "4 bytes"
      ],
      "answer": 1,
      "reason": "One point spans 6×4 bytes in this layout."
    },
    {
      "id": "geometry",
      "chapter": 8,
      "title": "Decide which bytes share a line",
      "source": "Cache II pp. 3–4",
      "intro": "B is data bytes per block. S is the number of sets, and E is the number of lines in each set (ways). Cache data capacity is S×E×B. Address width m describes the address space separately.",
      "example": "m=8 address bits, S=4 sets, E=2 ways, B=4 bytes\nTotal data = 4×2×4 = 32 bytes\nAddress space = 2⁸ = 256 byte addresses",
      "steps": [
        "Each set can keep two different blocks. An address maps to one set and can occupy either way.",
        "Each line also stores a valid bit and a tag identifying its block. These are metadata. They do not add data capacity."
      ],
      "question": "For S=2, E=2, B=8, how many cache lines exist?",
      "options": [
        "4",
        "32",
        "8"
      ],
      "answer": 0,
      "reason": "There are S×E=4 lines, each holding eight data bytes."
    },
    {
      "id": "decode",
      "chapter": 8,
      "title": "Split an address into tag, set and offset",
      "source": "Cache II pp. 3–8",
      "intro": "The offset selects a byte inside a block. Divide the byte address by B, rounding down, to get its block number. Dividing that number among S sets leaves the set as remainder and the tag as quotient.",
      "example": "A=13 (1101 in four bits), B=2, S=4\nblock=13/2 rounded down=6; offset=13%2=1\nset=6%4=2; tag=6/4 rounded down=1",
      "steps": [
        "In bits the split is 1 | 10 | 1: one tag bit, two set bits, one offset bit. Powers of two make these field widths exact.",
        "A tag match is a hit only in the selected set and only if the valid bit is set. The byte offset never changes which block is resident."
      ],
      "question": "With the same geometry, what are tag,set,offset for address 8 (1000)?",
      "options": [
        "0,0,1",
        "1,0,0",
        "2,0,0"
      ],
      "answer": 1,
      "reason": "Block 4 maps to set 0 and has tag 1. Address 8 begins the block."
    },
    {
      "id": "direct",
      "chapter": 8,
      "title": "Simulate a cold direct-mapped cache",
      "source": "Cache II pp. 8–9",
      "intro": "A direct-mapped cache has one way per set. For each access, compute the block and set, check the valid tag, then record the resulting contents before moving to the next address.",
      "example": "S=4, E=1, B=2. Read byte addresses 0,1,7,8,0.\n0: block 0 → set 0, miss, install tag 0\n1: block 0 → set 0, hit\n7: block 3 → set 3, miss, install tag 0",
      "steps": [
        "8 requests block 4 in set 0, replacing block 0 with tag 1. The final 0 misses and brings tag 0 back. Trace: M H M M M.",
        "Final state: set 0 holds bytes 0–1, set 3 holds 6–7. Sets 1 and 2 are invalid. A miss can evict a line even while another set is empty."
      ],
      "question": "Repeat from cold but end with byte 9 instead of byte 0. What is the final access?",
      "options": [
        "Miss in set 0",
        "Hit in set 3",
        "Hit in set 0"
      ],
      "answer": 2,
      "reason": "Byte 8 just installed block 4, which contains both 8 and 9."
    },
    {
      "id": "ways",
      "chapter": 8,
      "title": "Repeat the trace with two ways",
      "source": "Cache II p. 16",
      "intro": "In a two-way set, check the valid tags in both lines. A missed block enters an empty way if available. Only a full set needs a victim. Least recently used (LRU) chooses the line unused for the longest time.",
      "example": "S=2, E=2, B=2, cold. Read 0,1,7,8,0.\nBlocks: 0,0,3,4,0\nSets:   0,0,1,0,0",
      "steps": [
        "0 misses and 1 hits. Block 3 enters set 1. Block 4 can share set 0 with block 0, so the final 0 hits. Trace: M H M M H.",
        "Final set 0 holds tags 0 and 2, set 1 tag 1. This uses the slide’s two-set table. Its conflicting four-set tuple would give different tag numbers."
      ],
      "question": "From this final state, read 4 (block 2 in set 0) under LRU. Which block does it evict?",
      "options": [
        "Block 0",
        "Block 4",
        "Block 3"
      ],
      "answer": 1,
      "reason": "The final access refreshed block 0. Block 4 was used less recently. Block 3 is in a different set."
    },
    {
      "id": "misses",
      "chapter": 8,
      "title": "Classify a miss using a comparison cache",
      "source": "Cache I p. 27 and Cache II p. 11",
      "intro": "A block’s first demand access is compulsory. For a repeated block, compare against a fully associative LRU cache with the same number of lines, where any block can occupy any line. A hit there indicates a placement conflict in the actual cache. A miss there indicates insufficient capacity under this model.",
      "example": "Two total lines. The numbers here are BLOCK numbers.\nDirect-mapped, read 0,2,0: both map to set 0.\nFully associative, same trace: both blocks fit.",
      "steps": [
        "The last 0 is a conflict miss in the direct map. Now try 0,1,2,0 in a two-line fully associative LRU cache. Block 2 replaces block 0, so the last 0 misses even there: capacity.",
        "A first visit to a byte can hit when another byte already fetched its block. Classify using block history."
      ],
      "question": "Cold two-line direct map, block trace 0,2,0. Classify the second access, to block 2.",
      "options": [
        "Conflict",
        "Capacity",
        "Compulsory"
      ],
      "answer": 2,
      "reason": "It is the first reference to block 2, even though installing it evicts block 0."
    },
    {
      "id": "amat",
      "chapter": 8,
      "title": "Average the cost per memory reference",
      "source": "Cache I pp. 28–29",
      "intro": "Average memory access time (AMAT) is hit time plus miss fraction per access times extra miss penalty. A miss pays the normal lookup and then the extra cost. Convert percentages to fractions before multiplying.",
      "example": "Hit time=2 cycles, hit rate=95%, extra penalty=40 cycles\nMiss fraction=0.05\nAMAT=2+0.05×40=4 cycles/reference",
      "steps": [
        "With 250 ps per cycle, multiply 4×250=1000 ps/reference. If 40 cycles instead includes the entire miss service, use a weighted average: 0.95×2+0.05×40=3.9.",
        "Check which quantity the problem labels extra. Hit time is charged to every reference in the additive formula."
      ],
      "question": "At a 99% hit rate, one-cycle hit time and 100 extra cycles per miss, what is AMAT?",
      "options": [
        "2 cycles/reference",
        "1 cycle/reference",
        "101 cycles/reference"
      ],
      "answer": 0,
      "reason": "One miss per hundred references adds one cycle on average to the one-cycle lookup."
    },
    {
      "id": "cpi",
      "chapter": 8,
      "title": "Compare costs per instruction",
      "source": "Cache I p. 30",
      "intro": "CPI is cycles per instruction. A rate measured in misses per instruction times extra cycles per miss gives stall cycles per instruction. Add base CPI, then multiply by clock period to obtain time per instruction.",
      "example": "Base CPI c, 0.02 misses/instruction, 50 extra cycles, 200 ps/cycle\nTime=(c+0.02×50)×200 ps/instruction\nAt c=1: baseline 400; clock 190 → 380; penalty 40 → 360; rate .015 → 350",
      "steps": [
        "Each option changes one input. At c=1 the lower miss rate wins. At c=5 the three options cost 1140, 1160 and 1150 ps/instruction; the faster clock wins.",
        "The slide gives one cycle per hit. Establish base CPI separately before ranking. To convert a miss rate per instruction to one per access, divide by accesses per instruction."
      ],
      "question": "For c=4 compare a 190 ps clock with reducing the miss rate to .015 at 200 ps. Which is faster?",
      "options": [
        "The shorter clock always wins",
        "Lower miss rate always wins",
        "They tie at 950 ps/instruction"
      ],
      "answer": 2,
      "reason": "190×(4+1) and 200×(4+0.75) both equal 950."
    },
    {
      "id": "writes",
      "chapter": 8,
      "title": "Follow a store on a hit or miss",
      "source": "Cache II p. 19",
      "intro": "A write policy answers two questions. On a hit, write-through also updates the next level now; write-back marks the cached line dirty and sends changes when needed, including on eviction. On a miss, write-allocate fetches a line first; no-write-allocate sends the write onward.",
      "example": "Write-back + write-allocate. Store to an absent block.\n1. Miss: bring its block into the cache.\n2. Update the resident bytes and mark the line dirty.\n3. On dirty eviction, propagate the block to the next level.",
      "steps": [
        "Dirty means the cached contents have changed relative to the lower level. A clean line can be evicted without writing it back.",
        "The chosen hit policy governs propagation and the chosen miss policy governs allocation. Read the two policy names independently."
      ],
      "question": "A write-through, no-write-allocate cache misses on a store. What happens?",
      "options": [
        "Write to the next level and leave the block absent",
        "Install a dirty line",
        "Install the block and defer the write"
      ],
      "answer": 0,
      "reason": "No-write-allocate determines the miss path. A later read of that block can still miss."
    }
  ],
  "skills": [
    {
      "group": "Pointers, strings and object identity",
      "title": "Draw a variable, its address, and two aliases, then predict a write through each.",
      "lessons": [
        "aliases"
      ],
      "prompt": "At x=4, y=9, let p point to x and q copy p. Move p to y, write 6 through p and 3 through q. Draw the final arrows and cells.",
      "model": "p→y, q→x. The first write changes y to 6. The second changes x to 3. Copying the address gave q its own pointer value."
    },
    {
      "group": "Pointers, strings and object identity",
      "title": "Distinguish array size, pointer size, character count and terminator space.",
      "lessons": [
        "strings",
        "parameter-size"
      ],
      "prompt": "For char a[6]=\"cat\" and char *p=a, give sizeof a, sizeof p, strlen(a), and the smallest space a full copy needs.",
      "model": "6 bytes, 8 bytes, 3 characters, 4 bytes. The zero terminator occupies one cell of its own. Inside an array parameter the caller’s array size is lost."
    },
    {
      "group": "Pointers, strings and object identity",
      "title": "Solve rmdup while preserving strings across reads.",
      "lessons": [
        "rmdup",
        "line-buffer"
      ],
      "prompt": "Write the rmdup algorithm for input sun, sun, Sun. Name what must persist after the input buffer is reused.",
      "model": "Read into a bounded temporary buffer. Search the saved strings with strcmp. Copy, print and increment the saved count only on a miss. Print sun then Sun. Each saved row owns its bytes, including the terminating zero."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Convert byte patterns to signed and unsigned values at a stated width.",
      "lessons": [
        "signed",
        "bits"
      ],
      "prompt": "Interpret 11010110 as an unsigned byte, a signed byte, and hex. Show one calculation.",
      "model": "0xD6. Unsigned 13×16+6=214. Signed 214−256=−42. The bits stayed fixed while the interpretation changed."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Predict truncation, widening and a mixed signed/unsigned comparison after promotions.",
      "lessons": [
        "promotions",
        "convert"
      ],
      "prompt": "Narrow 0x12FE to eight unsigned bits. Widen that byte as unsigned and widen signed −2 as signed. Then explain −1 < (unsigned short)1 here.",
      "model": "The low byte is FE. Unsigned widening gives 00FE. Signed −2 extended to 16 bits gives FFFE. On this machine unsigned short promotes to int, so −1<1 is true. With 1U the comparison becomes unsigned and is false."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Write test, set, reset and toggle for both bit-numbering conventions.",
      "lessons": [
        "bit-order",
        "modify",
        "mask"
      ],
      "prompt": "Write pseudocode for testing, setting, clearing and toggling global bit 10 in a byte array. Give both numbering conventions.",
      "model": "Byte index 1, slot 2. LSB-first uses mask 1u<<2, MSB-first uses 1u<<5. Test (b[1]&m)!=0. Set b[1] OR-equals m, clear b[1] AND-equals ~m, toggle b[1] XOR-equals m. Each update is stored."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Extract a cross-byte signed field and update a global bit cursor.",
      "lessons": [
        "cursor",
        "signed"
      ],
      "prompt": "For MSB-first bytes 10110110 01010111, start at bit 5, take five bits most-significant first. Give the field, signed value and next cursor.",
      "model": "Take 110 from the first byte and 01 from the next, giving 11001. Unsigned 25 minus 32 is −7. The next cursor is 10."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Pack 0, −1, +1 and −2 with exactly the needed sign bits.",
      "lessons": [
        "pack"
      ],
      "prompt": "Encode 0, −1, 1 and −2 as the shortest signed fields. State how you know the returned count.",
      "model": "0, 1, 01, 10, with widths 1,1,2,2. Drop a high sign bit only while the next one agrees. The last retained index plus one is the count."
    },
    {
      "group": "Integer representation, masks and bitstreams",
      "title": "Explain and fix an empty unsigned-length loop.",
      "lessons": [
        "unsigned-loop"
      ],
      "prompt": "Repair a pair loop whose bound is i<n-1 for unsigned n. Give its behavior on n=0,1,2.",
      "model": "Start j at 1 and use j<n. Process j−1 and j. Zero pairs for n=0 and 1, one pair (0,1) for n=2. Comparing before subtracting avoids unsigned underflow at n=0."
    },
    {
      "group": "Modules, opaque handles and Makefiles",
      "title": "Predict preprocessing, compilation and linking outcomes separately.",
      "lessons": [
        "build"
      ],
      "prompt": "Classify three failures: missing included header, invalid C expression, then a declared function with no linked definition.",
      "model": "Preprocessing fails to open the header. During compilation the invalid expression fails the language checks. An unresolved external is reported while linking otherwise valid objects."
    },
    {
      "group": "Modules, opaque handles and Makefiles",
      "title": "Choose public declarations, private helpers and an opaque handle for two stacks.",
      "lessons": [
        "handle",
        "interface"
      ],
      "prompt": "Design a public interface for two independently mutable stacks. Where do the node layout and private helper go?",
      "model": "Expose a handle type plus constructor, push, pop and destruction declarations in a guarded header. Define the node layout in stack.c with a file-scope static helper. Call the constructor twice for two distinct stack states and pass the chosen handle into each operation."
    },
    {
      "group": "Modules, opaque handles and Makefiles",
      "title": "Trace recompilation from a changed header and expand $@ and $^.",
      "lessons": [
        "make"
      ],
      "prompt": "Given app: a.o b.o, a.o: a.c api.h and b.o: b.c api.h b.h, change just b.h. Expand gcc -o $@ $^ in the link rule.",
      "model": "Rebuild b.o then relink app. a.o stays current. The link expands to gcc -o app a.o b.o. Changing api.h instead recompiles both."
    },
    {
      "group": "Storage lifetime and linked structures",
      "title": "Classify pointer and pointee lifetimes independently and size an allocation with sizeof *p.",
      "lessons": [
        "allocate",
        "lifetime"
      ],
      "prompt": "A function allocates two doubles and returns its local pointer by value. Give the size expression, two lifetimes and cleanup owner.",
      "model": "malloc(2 * sizeof *p) with double *p requests 16 bytes here. Check for NULL. The pointer variable’s lifetime ends at return. The returned address still designates the allocation; the receiving owner frees it exactly once."
    },
    {
      "group": "Storage lifetime and linked structures",
      "title": "Trace insertion and removal on empty, singleton, middle and end cases.",
      "lessons": [
        "insert",
        "unlink"
      ],
      "prompt": "Draw empty → A → A,C → A,B,C by inserting B after A. Then remove B, A, and C. Record both endpoints each time.",
      "model": "Endpoints go (NULL,NULL), (A,A), (A,C), (A,C). B.prev=A and B.next=C; the neighbors point back to B. After B is removed reconnect A and C. After A is removed C is both endpoints with prev=NULL. After C both are NULL."
    },
    {
      "group": "Storage lifetime and linked structures",
      "title": "Release a list safely and explain who owns its payloads and free-list nodes.",
      "lessons": [
        "ownership"
      ],
      "prompt": "A list owns its nodes, borrows active payloads and keeps detached nodes on a free list. Describe destruction and what to save before each free.",
      "model": "Walk both distinct node chains. Save next while each node is live, then free the node. Leave caller-owned payloads to their owner. A node must belong to at most one chain."
    },
    {
      "group": "Storage lifetime and linked structures",
      "title": "Design closest and list-based rmdup using correct input and ownership boundaries.",
      "lessons": [
        "closest",
        "list-rmdup"
      ],
      "prompt": "Plan both programs for awkward inputs: closest with one point or two points at identical coordinates, and rmdup with repeated input and allocation failure.",
      "model": "Closest requires at least two complete points; compare distinct indices, allowing distance zero, and free the points. For rmdup search first, copy unseen strings with terminator room, release partial allocations on failure, and destroy all owned strings and nodes."
    },
    {
      "group": "Reading x86-64 data movement",
      "title": "Translate immediate, register, memory source and memory destination operands.",
      "lessons": [
        "operands"
      ],
      "prompt": "Give the effects of movq $7,%rax; movq %rax,%rdx; movq (%rdi),%rax; movq %rax,(%rsi) if rdi points to 42.",
      "model": "First rax=7, then rdx=7. The load replaces rax with 42. The store writes 42 to memory at rsi. Neither pointer register changes."
    },
    {
      "group": "Reading x86-64 data movement",
      "title": "Compute effective addresses and trace lea/mov with separate register and memory columns.",
      "lessons": [
        "lea"
      ],
      "prompt": "With base=100, index=3, scale=4, displacement=8, and value 70 at that location, trace lea and a load into separate registers.",
      "model": "Address 100+12+8=120. lea places 120 in the destination. mov reads 70 from 120. Memory contents stay 70 for both operations."
    },
    {
      "group": "Reading x86-64 data movement",
      "title": "Trace swap and recover an arithmetic expression from lea, shifts and imul.",
      "lessons": [
        "operands",
        "lea"
      ],
      "prompt": "Explain why a swap needs a saved value, then reconstruct a result from a register trace: t=x+2*x; t=t<<1; return t*y. Test x=2,y=3.",
      "model": "Save an original operand before overwriting its cell. The arithmetic computes 3x, then 6x, then 6xy, giving 36 here. A scratch value no later instruction reads cannot affect the return."
    },
    {
      "group": "Flags, loops and procedure calls",
      "title": "Derive signed and unsigned branches from cmp order, flags and fall-through.",
      "lessons": [
        "flags"
      ],
      "prompt": "For rdi=−1 and rsi=1, trace cmpq %rsi,%rdi followed independently by jl, ja and je. State where execution continues when a branch is false.",
      "model": "Comparison is rdi−rsi. Signed jl is taken, unsigned ja is taken, equality je falls through to the next instruction. The same flags are interpreted by different predicates."
    },
    {
      "group": "Flags, loops and procedure calls",
      "title": "Explain which flags are live after test, lea, arithmetic or a shift.",
      "lessons": [
        "flags"
      ],
      "prompt": "After a compare, insert lea, test r,r, or a one-bit left shift before a branch. Which flags will it read?",
      "model": "lea preserves the comparison flags. test writes ZF/SF according to the bitwise result and clears CF/OF. A one-bit shift writes flags including ZF from its result. A zero-count shift preserves flags. Identify the last writer for the particular branch."
    },
    {
      "group": "Flags, loops and procedure calls",
      "title": "Reconstruct while, do-while and for loops including the zero-iteration case.",
      "lessons": [
        "loop-recall"
      ],
      "prompt": "Give C skeletons for while, do-while and for loops. For each, identify when the first test occurs and reconstruct the guard for b-=a until b≤0.",
      "model": "while(b>0){body;} and for(init;test;update){body;} test before the body. do{body;}while(test); executes the body once first. The guarded b loop is result=b; while(b>0){result*=a; b-=a;}. At b=0 it skips the multiply."
    },
    {
      "group": "Flags, loops and procedure calls",
      "title": "Trace rip, rsp and a return value across call, push, pop, leave and ret.",
      "lessons": [
        "call"
      ],
      "prompt": "Start with rsp=0x1000 and next instruction address 0x405. Walk call, push rbp, mov rsp to rbp, leave and ret. Where is a scalar return value?",
      "model": "call puts 0x405 at 0xFF8. push saves the prior rbp at 0xFF0. rbp becomes 0xFF0. leave resets rsp from rbp then restores rbp, leaving rsp=0xFF8. ret resumes at 0x405 with rsp=0x1000. rax carries the scalar result."
    },
    {
      "group": "Flags, loops and procedure calls",
      "title": "Count total calls versus peak stack depth and protect a value across recursion.",
      "lessons": [
        "frames",
        "call"
      ],
      "prompt": "main calls f twice sequentially; each f calls g once. Count named calls including main, give peak depth, and say how a recursive caller keeps a live input.",
      "model": "Five activations, peak three (main,f,g). Save each invocation’s needed value in its own stack slot or a correctly preserved register. Reusing a caller-saved register across a call without saving it can lose the value."
    },
    {
      "group": "C arrays and structs at machine level",
      "title": "Distinguish one-past address formation from a valid C element access.",
      "lessons": [
        "bounds",
        "rows"
      ],
      "prompt": "For int a[2][3], which can you form or read: a[0]+3, *(a[0]+3), and a[1][0]?",
      "model": "Forming the one-past pointer a[0]+3 is permitted. Reading through it has undefined behavior. a[1][0] designates a valid int when initialized. Matching physical addresses do not extend row zero."
    },
    {
      "group": "C arrays and structs at machine level",
      "title": "Recover dimensions of nested arrays from address coefficients.",
      "lessons": [
        "rows"
      ],
      "prompt": "An int access uses byte address base+36*i+4*j. Recover what you can about the declared dimensions.",
      "model": "Four bytes per int and 36 bytes per row imply nine columns. The row count needs separate evidence, such as a declared bound. Check both indices before claiming C defines the access."
    },
    {
      "group": "C arrays and structs at machine level",
      "title": "Trace an inline row and a row-pointer lookup with the right number of memory reads.",
      "lessons": [
        "row-pointers"
      ],
      "prompt": "For int flat[3][4] starting at 80, and int *rows[3] at 160 with rows[1]=400, trace [1][2] in each representation.",
      "model": "Contiguous: address 80+16+8=104, one element read. Pointer table: read slot 168 to obtain 400, then read the int at 408. Assumes the base address is already available and rows are initialized."
    },
    {
      "group": "C arrays and structs at machine level",
      "title": "Compute field offsets, internal/trailing padding, size and array-of-struct stride.",
      "lessons": [
        "padding"
      ],
      "prompt": "Lay out struct T { char c; int i; short s; }; on the course ABI. Find a[2].s relative to a.",
      "model": "Offsets 0,4,8. Three internal bytes after c and two trailing bytes after s; size and stride 12. Element 2 begins at 24, and its s is at 32."
    },
    {
      "group": "C arrays and structs at machine level",
      "title": "Recover a linked-list operation from offset-based machine code.",
      "lessons": [
        "offset-list"
      ],
      "prompt": "For a node with value at offset 0 and next at offset 8, explain movq 8(%rdi),%rax followed by movq (%rax),%rax. State the needed precondition.",
      "model": "Load current->next, then load the successor’s value. Both nodes must be valid and the next pointer non-null. Reading the two fields of the original node would require keeping the original base."
    },
    {
      "group": "GNU extended inline assembly",
      "title": "Identify each input, output, read/write operand and clobber in a template.",
      "lessons": [
        "inline"
      ],
      "prompt": "A template reads a and b, overwrites a with their product and changes flags. State the constraints, including the fresh-output alternative.",
      "model": "Use +r for initialized a, r for b, and cc for the flags. For a fresh output written at the end, use =r and declare the separate inputs. List any fixed scratch registers actually overwritten."
    },
    {
      "group": "GNU extended inline assembly",
      "title": "Explain %0 versus %%rax and when early-clobber protects an unread input.",
      "lessons": [
        "inline"
      ],
      "prompt": "Explain %0, %%rax and =&r in an extended template with a temporary output written before the last input is used.",
      "model": "%0 names operand zero. %%rax emits the literal register %rax. =&r declares a register output overwritten early, preventing overlap with independent inputs that are still live."
    },
    {
      "group": "GNU extended inline assembly",
      "title": "Combine EDX:EAX from RDTSC and explain why the first delta is different.",
      "lessons": [
        "counter"
      ],
      "prompt": "With high half 2 and low half 5, combine the counter. Explain the first result if static last starts at zero.",
      "model": "((uint64_t)hi<<32) OR lo gives 0x0000000200000005. Widen before shifting. The first subtraction returns the full counter; later subtractions measure differences between samples."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Rank loops by actual byte addresses and state the units of the inner stride.",
      "lessons": [
        "locality"
      ],
      "prompt": "For int a[3][5], list the first three offsets walking row zero, then column zero. Rank the three six-int point loops from the handout.",
      "model": "Row offsets 0,4,8; column offsets 0,20,40 bytes. clear1 visits contiguous ints, clear2 alternates two groups in the same point, clear3 strides 24 bytes between points. The qualitative order is clear1, clear2, clear3."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Decode tag, set, offset, total data capacity and metadata separately.",
      "lessons": [
        "decode",
        "geometry"
      ],
      "prompt": "For a cold cache with 8-bit addresses, four sets, two ways and four bytes per block, decode 0x2D and distinguish capacity from metadata.",
      "model": "0x2D=45, block 11, offset 1, set 3, tag 2. Capacity 4×2×4=32 data bytes. In binary: four tag bits, two index bits, two offset bits. Valid bits and stored tags are additional metadata."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Simulate a full cold direct-mapped and two-way trace, including final contents.",
      "lessons": [
        "direct",
        "ways"
      ],
      "prompt": "Trace 0,1,7,8,0 using two-byte blocks, first four sets/one way, then two sets/two ways. Give final resident blocks by set.",
      "model": "Direct: M H M M M; sets 0 and 3 hold blocks 0 and 3 respectively. Two-way: M H M M H; set 0 holds blocks 0 and 4, set 1 holds block 3. Other slots are invalid."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Explain compulsory, conflict and capacity misses with a trace.",
      "lessons": [
        "misses"
      ],
      "prompt": "Give a compulsory, conflict and capacity example using two lines and a cold start. State whether your trace numbers are blocks or bytes.",
      "model": "Use block numbers. First reference to 0 is compulsory. In a two-set direct map, 0,2,0 ends in conflict, since a fully associative two-line cache retains both. Under fully associative LRU, 0,1,2,0 ends in a capacity miss."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Compute average time with compatible units and compare one change at a time.",
      "lessons": [
        "amat",
        "cpi"
      ],
      "prompt": "Compute AMAT for hit time 2 cycles, miss rate 5% per access, 40 extra cycles, 250 ps/cycle. Explain what changes if the rate is per instruction.",
      "model": "4 cycles/reference = 1000 ps/reference. If the rate is per instruction, the product gives 2 stall cycles/instruction. Add base CPI before multiplying by clock period. To compute AMAT, first obtain misses per reference."
    },
    {
      "group": "Locality, cache mapping and performance",
      "title": "Classify write-through/write-back and allocate/no-allocate as separate decisions.",
      "lessons": [
        "writes"
      ],
      "prompt": "Trace a store to an absent byte under write-back/write-allocate, then repeat under write-through/no-write-allocate. What happens on later eviction?",
      "model": "The first pair fills a line and writes to it, marking it dirty. Evicting that dirty line propagates its contents. The second pair sends the missed write to the lower level without installing a line, leaving nothing from that miss to evict here."
    }
  ],
  "exam": [
    {
      "title": "Copying a pointer",
      "lesson": "aliases",
      "question": "int x=2,y=7; int *p=&x,*q=p; p=&y; *q=5; What are x and y?",
      "options": [
        "2 and 5",
        "5 and 7",
        "5 and 5",
        "2 and 7"
      ],
      "answer": 1,
      "reason": "q copied the address of x before p changed. Writing *q reaches x. Only a write through the rebound p would reach y.",
      "variation": "Move q=p to after p=&y. The resulting values are 2 and 5."
    },
    {
      "title": "Size and lifetime",
      "lesson": "parameter-size",
      "question": "On Timberlea a caller declares int a[5]. Inside f(int a[5]), what does sizeof a report in bytes?",
      "options": [
        "4",
        "5",
        "20",
        "8"
      ],
      "answer": 3,
      "reason": "The array parameter is adjusted to int*. A pointer is 8 bytes in the course ABI. In the caller sizeof a is 5×4=20.",
      "variation": "Replace the parameter with a local int a[5] object. The size is then 20."
    },
    {
      "title": "Operator precedence",
      "lesson": "mask",
      "question": "LSB-first bits[0]=0x10, mask=0x10. What do bits[0] & mask != 0 and (bits[0] & mask) != 0 return, in order?",
      "options": [
        "0, 1",
        "1, 1",
        "16, 1",
        "1, 0"
      ],
      "answer": 0,
      "reason": "The first parses as 0x10 & 1 and gives 0. The second tests whether the masked bit is nonzero and gives 1.",
      "variation": "For 0x11 both happen to return 1. One test case can hide the bug."
    },
    {
      "title": "Promotions",
      "lesson": "promotions",
      "question": "On Timberlea int is 32 bits and unsigned short is 16. With int x=−1 and unsigned short y=1, what is x<y?",
      "options": [
        "False because an operand is unsigned",
        "Depends on the bit order of memory",
        "True because y promotes to int",
        "Undefined because the signs differ"
      ],
      "answer": 2,
      "reason": "int can represent all unsigned short values here. Both operands compare as int. Rank and range matter before you apply the usual conversions.",
      "variation": "Change y to unsigned int. Now x converts to UINT_MAX and the result is false."
    },
    {
      "title": "Field interpretation",
      "lesson": "signed",
      "question": "A five-bit two’s-complement field is 10001₂. Which result should an unpacker return in a wider signed type?",
      "options": [
        "17",
        "−1",
        "−17",
        "−15"
      ],
      "answer": 3,
      "reason": "Unsigned 17 minus 2⁵ equals −15. Equivalently use the top-bit weight −16, then add 1.",
      "variation": "Change the field specification to unsigned; the same bits give 17."
    },
    {
      "title": "Header changes",
      "lesson": "make",
      "question": "Only file1.h changes in the explicit three-object Makefile. No other target depends on that header. What rebuilds?",
      "options": [
        "Every .o and the executable",
        "file1.o and the executable",
        "Only file1.o",
        "Only the executable"
      ],
      "answer": 1,
      "reason": "make first recompiles file1.c because file1.o is stale. The new object makes the linked target stale.",
      "variation": "A change only to a .c file also recompiles its object; a shared header can affect several."
    },
    {
      "title": "Heap ownership",
      "lesson": "unlink",
      "question": "Remove the only node in a list. Its payload points to a caller-owned int. Which final state is correct?",
      "options": [
        "Free node and payload; head=tail=NULL",
        "Free node; tail unchanged; head=NULL",
        "Free node; head=tail=NULL; payload remains live",
        "Keep node; only decrement size"
      ],
      "answer": 2,
      "reason": "Both endpoints used to designate the removed node. List ownership covers the node. The caller owns the payload in the stated contract.",
      "variation": "If a free list is in use, detach and recycle the node; both active endpoints still become NULL."
    },
    {
      "title": "Effective address",
      "lesson": "lea",
      "question": "%rdi=0x100, %rsi=3, M4[0x110]=0x2A. What is in %rax after leaq 4(%rdi,%rsi,4),%rax?",
      "options": [
        "0x110",
        "0x2A",
        "0x10C",
        "0x114"
      ],
      "answer": 0,
      "reason": "Compute 0x100+3×4+4=0x110. lea returns the numerical address. M4 denotes a four-byte value and its contents are irrelevant to lea.",
      "variation": "Replace with movl and destination %eax; rax becomes 0x2A."
    },
    {
      "title": "Flag lifetime",
      "lesson": "flags",
      "question": "%rdi=2 and %rsi=5. Execute cmpq %rsi,%rdi; leaq 8(%rdi),%rdi; jl .L. Is the jump taken?",
      "options": [
        "No, rdi is now 10",
        "Yes, because lea set SF",
        "No, lea cleared the flags",
        "Yes, because the compare tested 2−5"
      ],
      "answer": 3,
      "reason": "jl reads the signed comparison flags. lea changes the register without changing flags, so the original comparison still governs.",
      "variation": "Replace lea with addq $8,%rdi; the add writes flags for 10 and jl is no longer taken."
    },
    {
      "title": "Signedness of a jump",
      "lesson": "flags",
      "question": "%rdi holds all-one bits; %rsi holds 1. After cmpq %rsi,%rdi, which pair of jumps would be taken if each were tested independently?",
      "options": [
        "jg and jb",
        "jl and ja",
        "je and ja",
        "jl and jb"
      ],
      "answer": 1,
      "reason": "As signed, −1<1. As unsigned, UINT64_MAX>1. The same flags support both readings; the suffix chooses the predicate.",
      "variation": "Equal operands instead make je true and make both strict relations false."
    },
    {
      "title": "Reading a loop",
      "lesson": "loop-recall",
      "question": "A loop initializes a counter to 64. Immediately before jne .Loop it executes subq $1,%rdx. What decides whether another iteration runs?",
      "options": [
        "Whether the shifted input has any one bits",
        "Whether the accumulator is negative",
        "Whether the decremented counter is nonzero",
        "Whether the current input bit equals 1"
      ],
      "answer": 2,
      "reason": "jne tests ZF from subq, the last flag writer. All 64 input positions are processed, even after the remaining input becomes zero.",
      "variation": "In the popcount loop, shrq directly precedes jne. That loop stops when the remaining input becomes zero."
    },
    {
      "title": "Calls and returns",
      "lesson": "call",
      "question": "Just before a near call, %rsp=0x1000; the call begins at 0x400 and the following instruction begins at 0x405. New %rsp and saved value?",
      "options": [
        "0xFF8 and 0x405",
        "0xFF8 and 0x400",
        "0x1008 and 0x405",
        "0x1000 and the callee address"
      ],
      "answer": 0,
      "reason": "The stack grows down by eight bytes and holds the address to resume after the call. ret uses that value later.",
      "variation": "A plain jmp transfers control without pushing a return address."
    },
    {
      "title": "Register ownership",
      "lesson": "call",
      "question": "foo calls bar and needs its current value of %r10 afterward. Under the course ABI, who must protect it?",
      "options": [
        "bar, because every callee preserves r10",
        "Nobody, because call pushes all registers",
        "The operating system",
        "foo, because r10 is caller-saved"
      ],
      "answer": 3,
      "reason": "call automatically saves a return address. The caller must arrange to preserve a live caller-saved value, e.g. by moving or spilling it.",
      "variation": "Change r10 to r12. A callee that changes r12 must restore it."
    },
    {
      "title": "Subarray bounds",
      "lesson": "bounds",
      "question": "For int a[2][3], which statement about evaluating a[0][3] as an int is justified in C?",
      "options": [
        "It is guaranteed to equal a[1][0]",
        "The nominal address coincides with the next row, but the read is undefined",
        "It always causes a hardware trap",
        "It is valid if the result is assigned to unsigned"
      ],
      "answer": 1,
      "reason": "The first row has three ints. One-past is a permitted address to form, not an element to read. The adjacent row explains the diagram without legalizing the C access.",
      "variation": "a[1][0] is an in-range expression for the intended element."
    },
    {
      "title": "Structs and stride",
      "lesson": "padding",
      "question": "For struct T { short i; float v; short j; } a[5], using alignments 2,4,2, what is the byte offset of a[2].j?",
      "options": [
        "20",
        "24",
        "32",
        "36"
      ],
      "answer": 2,
      "reason": "Offsets are 0,4,8; total size rounds to 12. Therefore 2×12+8=32. The size includes trailing padding.",
      "variation": "The address of a[2] alone has offset 24."
    },
    {
      "title": "Inline constraints",
      "lesson": "inline",
      "question": "A block writes a fresh C variable out once at the end and never reads its previous value. Which register-output constraint matches?",
      "options": [
        "r",
        "=r",
        "+r",
        "m"
      ],
      "answer": 1,
      "reason": "=r declares a write-only register output. +r would claim the incoming value was read; r alone is an input-style constraint. A fixed scratch register still needs a clobber if used.",
      "variation": "If the first instruction multiplies the old out in place, initialize out and use +r."
    },
    {
      "title": "Two-dimensional locality",
      "lesson": "locality",
      "question": "For int a[3][4] at byte 76, hold j fixed and increment i. Which two consecutive addresses can occur in the inner loop?",
      "options": [
        "76 then 80",
        "76 then 88",
        "76 then 124",
        "76 then 92"
      ],
      "answer": 3,
      "reason": "Moving one row changes address by 4 columns × 4 bytes = 16 bytes. The first column starts at 76 and continues at 92.",
      "variation": "Increment j inside instead: the inner byte increment is 4."
    },
    {
      "title": "Cache misses",
      "lesson": "direct",
      "question": "Cold direct map, S=4, E=1, B=2. Read bytes 0,1,8,1. What is the last access?",
      "options": [
        "Conflict miss",
        "Compulsory miss",
        "Hit because the same byte was read before",
        "Capacity miss because there are only four sets"
      ],
      "answer": 0,
      "reason": "Bytes 0 and 1 share block zero. Address 8 fills block four in the same set and evicts it. A fully associative four-line cache could retain both.",
      "variation": "With two sets and two ways at the same data capacity, the final 1 hits."
    },
    {
      "title": "AMAT and units",
      "lesson": "amat",
      "question": "Hit time 2 cycles, extra miss penalty 40 cycles, hit rate 95%, clock 250 ps. What is AMAT in time per reference?",
      "options": [
        "500 ps",
        "10,000 ps",
        "1,000 ps",
        "1,500 ps"
      ],
      "answer": 2,
      "reason": "Miss fraction 0.05. AMAT=2+0.05×40=4 cycles; 4×250=1000 ps. Additional penalty is charged only on misses.",
      "variation": "If 40 cycles instead denoted the entire miss service time, use 0.95×2+0.05×40=3.9 cycles."
    },
    {
      "title": "Cache writes",
      "lesson": "writes",
      "question": "A write-back, write-allocate cache receives a store to an absent block. What normally happens?",
      "options": [
        "Write only to lower memory; leave cache unchanged",
        "Install block, update cached bytes, mark it dirty",
        "Install block and always immediately write the new bytes through",
        "Mark the evicted block dirty even if it was clean"
      ],
      "answer": 1,
      "reason": "Write-allocate controls the miss and brings in the block. Write-back controls propagation of the change; the newly written line becomes dirty.",
      "variation": "On a later eviction of that dirty line, propagate its contents to the next level."
    }
  ]
};
