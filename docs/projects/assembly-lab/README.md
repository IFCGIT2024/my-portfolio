# C → x86 Assembly Lab — CSCI 2122

A static, browser-only integer assembly course and practice lab. **12 guided lessons, 80 C-to-assembly exercises, and 90 concept questions**: the original 36 translations / 34 concepts are preserved; Lecture 10 adds 44 translations / 56 concepts. Every new concept has an introduction, a worked example, pitfalls and explained practice. The new reference translations have **149 independent expected-output cases**; the original bank retains 102.

Live URL: https://ifcgit2024.github.io/my-portfolio/docs/projects/assembly-lab/index.html

No backend or build step. The site remains at its existing path and does not change Pages configuration. No uploaded lecture PDF, personal school information or unrelated portfolio files are published.

## Study workflow

Choose a lesson, read its introduction, open the worked C → assembly example, then practice **both** Code translation and Concept questions. Lesson navigation follows prerequisites. Choose **Original practice** to use the preserved refresher, or **All practice** for the combined banks. The first lesson is conceptual and automatically selects that mode.

Code answers are executed against multiple supplied states, not compared to solution strings. Show hint, show solution and step through **Trace my code** when needed. The trace includes registers (decimal and hexadecimal), flags, question memory and eight-byte stack slots **before** each instruction. The first 200 steps are retained, including steps captured before a runtime error. Check answer grades all cases; tracing one case does not mark an exercise solved.

Drafts, attempts, solved/reviewed status and the selected lesson persist in browser localStorage under `mizel:assembly-lab:progress:v1`. Stable question IDs and content fingerprints preserve the original bank's progress. Modified questions invalidate only their own old results. Revealing a solution before passing marks that question reviewed, not independently solved. Nothing is synchronized or uploaded.

## Lecture coverage

| Lesson | Content | Lecture pages |
| --- | --- | --- |
| 1 | ISA, microarchitecture, state, types, C/assembly/object code, encoding and disassembly | 1–8, 11–17 |
| 2 | AT&T operands, b/w/l/q, registers and overlapping aliases | 9–10, 13, 18–20 |
| 3 | Pointers, loads, stores, swap and aliasing | 20–28 |
| 4 | Displacement, base/index/scale, arrays, endian layout | 21, 29–30, 34–35 |
| 5 | LEA versus MOV, address-of, scaled arithmetic | 31–32, 36 |
| 6 | Arithmetic, subtraction, multiplication, audit of mismatched example | 12, 31, 33 |
| 7 | AND/OR/XOR/NOT, masks, TEST, bitwise versus logical C | 12 + requested extension |
| 8 | SHL/SAL/SHR/SAR, CL, signedness and count rules | 31, 33 + extension |
| 9 | Flags, signed/unsigned conditions, array loops | 6, 12 + control-flow bridge |
| 10 | PUSH/POP, automatic stack setup, frames, LEAVE | 15 + stack mechanics |
| 11 | CALL/RET, System V ABI, saved registers, full sumstore | 15–16, 22–28 + ABI detail |
| 12 | Integrated array, mask, runtime-bit and call/store exercises | Whole lecture |

The image-only pages were inspected, including the register diagrams, instruction encoding, slide 15's `sumstore`, and slide 35's array example. This is coverage of the supplied integer-assembly lecture plus the requested extensions, **not a claim to cover the entire CSCI 2122 exam syllabus**.

### Corrections explicitly taught

- Slide 2's 1–8-byte instruction-length range is not the general x86 limit: x86 instructions can be up to 15 bytes. RISC/CISC are not universal speed/power rankings or guarantees of fixed instruction size.
- Slide 20's C-equivalent for `movq (%rax),%rdx` reverses the pointer/value mapping. The instruction loads from the address in RAX into RDX.
- Slide 33's C returns `(x+y+z)*(5*y)`; its assembly returns `(x+y+z)*(2*x+4)`. Its `48*y` result is unused. Both actual computations have separate verified exercises.
- Slide 35 mixes RBP and EAX in one address; address-register widths must match, e.g. `20(%rbp,%rax,4)` for a four-byte element.
- Original branching-slide corrections remain: JNE means ZF=0; JGE is signed greater-or-equal.

## Simulator contract

The data model is Linux x86-64 **LP64**: `long` and pointers are eight bytes; `int` is four. Legacy exercises default to four-byte memory cells. Arithmetic uses BigInt internally, so 64-bit values above JavaScript Number's safe range remain exact. In JSON, write large integers as strings.

- Supports all 16 general-purpose register families and their 32/16/8-bit aliases, including AH/BH/CH/DH where no REX encoding is required. A 32-bit register write clears its upper half; narrower writes preserve other bits. Uninitialized bits cannot be read.
- Data operations: MOV, LEA, ADD, SUB, two/three-operand IMUL, CMP, TEST, AND, OR, XOR, NEG, INC, DEC, NOT, NOP, SHL/SAL, SHR, SAR.
- Control: named-label JMP and signed/unsigned/equality/overflow/sign conditional branches and aliases; local direct CALL, RET, 64-bit PUSH/POP and LEAVE. No suffix infers a register width; ambiguous memory-only instructions default to 32 bits for legacy compatibility. Prefer explicit sizes.
- Little-endian byte memory supports overlapping accesses, aliases, symbols, immediates, register indirect, displacement and base/index/scale. Index scale is 1/2/4/8; ESP/RSP cannot index. Memory addresses are restricted to nonnegative safe JavaScript integer addresses. LEA arithmetic itself remains fully 64-bit, including negative results.
- Most q-form arithmetic and memory-immediate operations encode sign-extended 32-bit immediates. A register-destination MOV can load a full-width immediate. Shift counts must be an immediate byte or CL, and are hardware-masked to five or six bits.
- Relevant ZF/SF/CF/OF flags are tracked. IMUL leaves ZF/SF undefined; shift OF is undefined for nonzero counts other than one. NOT/MOV/LEA and stack/control instructions preserve flags. A branch on an undefined flag fails clearly.
- A 4096-byte stack is preallocated at `[0x7000,0x8000)`. Snippets start with RSP=0x8000; functions start at 0x7ff8 with a simulated return sentinel. Function fixtures seed RBX/RBP/R12–R15 with visible sentinel values unless explicitly overridden, and check their preservation. Function calls check ordinary 16-byte pre-call alignment and helper preservation.
- `call` pushes a simulated instruction index, **not a native byte address**. `ret` pops it. Helpers must be included in the submitted code. Function exercises must execute RET; falling off the end is an error. Snippets may end normally. Stack balance is checked. No external/native functions run in the browser.
- Output memory and registers must match; other supplied memory must remain unchanged. Stack scratch bytes may change. Some exercises explicitly require instructions such as PUSH/POP/CALL to practice that concept; this is stated in the task. Otherwise equivalent implementations are accepted.
- Limits: 50,000 characters, 1,000 lines/instructions, 10,000 executed instructions per case. The interpreter is a bounded teaching subset, not a complete assembler/emulator. No directives, indirect calls, division, extension moves, floating-point/SIMD, operating-system calls, arbitrary C parser, or machine-code generation. The displayed C is a specification, never evaluated.

Passing tests is evidence for the listed inputs, not a proof for all C inputs. C signed overflow is undefined; signed examples avoid it. Unsigned examples can deliberately wrap. Negative signed right-shift questions explicitly specify x86 arithmetic behavior; C shift-count restrictions differ from hardware count masking.

## Files and authoring

- `engine.js`: parser, execution, grading and bank validation.
- `app.js`, `index.html`, `styles.css`: accessible interface and browser persistence.
- `data/manifest.json`: bank list.
- `data/translation.json`, `data/concepts.json`: original unchanged questions.
- `data/lecture10.json`: new exercises and answer explanations.
- `data/lessons.json`: ordered introductions, worked examples, walkthroughs and pitfalls.
- `data/example.json`: simple legacy-compatible import template.

Each bank uses `schemaVersion: 1`, a `questions` array, unique lowercase slug IDs, `type`, `category` and `title`. Code questions need `cCode`, `hint`, `solutions`, and `cases`; new ones add `lesson`, `explanation`, `dataModel` and optional `requirements` (normalized opcode names). MCQs need `question`, `options`, a zero-based `correctAnswer`, and `explanation`.

A 64-bit function fixture looks like:

```json
{
  "name": "Long pointer load",
  "function": true,
  "registers": {"rdi": 4096},
  "symbols": {"A": 4096},
  "memoryWidth": 8,
  "memory": {"A": "9007199254740993"},
  "expected": {"registers": {"rax": "9007199254740993"}}
}
```

Additional fields: `entry` selects a label; `memoryWidths` overrides widths by memory key; `preserveRegisters` adds preservation checks; `abi` enables call checks for snippets. Default cell width is 4. Null means allocated but uninitialized. Arrays use keys such as `a`, `a+8`, `a+16`. `checkStack:false` is an explicit advanced-fixture opt-out, not used by this course. Import validates reference solutions before admitting a bank and remains session-only.

## Validation and local preview

```sh
node --test docs/projects/assembly-lab/tests/*.test.cjs
python3 docs/projects/assembly-lab/tests/native-reference.py
python3 -m http.server 8000
```

Open `http://localhost:8000/docs/projects/assembly-lab/index.html`. Browsers block JSON fetches from `file://`.

The Node suite covers original and new banks plus exact 64-bit arithmetic, aliases, overlapping widths, negative LEA, shifts/flags, stack boundaries, PUSH/POP special cases, nested calls, RET/LEAVE, ABI rules, invalid forms and grading. The independent native suite compiles and executes all **149 new reference cases** using GCC on Linux x86-64 and verifies expected register values, changed outputs and preserved input memory. It runs only repository-owned reference solutions in a temporary directory, never user code. GCC is a development-only verification dependency; the published site needs only a modern browser with BigInt.

## Primary references

- Supplied Lecture 10, “Assembly 1” (36 slides), used as the course-content map; source PDF is not redistributed.
- [Intel architecture manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- [GNU assembler AT&T syntax](https://sourceware.org/binutils/docs/as/i386_002dVariations.html)
- [GNU operand sizes](https://sourceware.org/binutils/docs/as/i386_002dMnemonics.html)
- [System V AMD64 ABI source](https://gitlab.com/x86-psABIs/x86-64-ABI)

No analytics, external fonts or third-party runtime scripts. Static assets and banks are the only app network requests.
