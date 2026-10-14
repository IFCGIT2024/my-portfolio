# C → x86 Assembly Lab — CSCI 2122

A static, browser-only integer assembly course and practice lab. **14 chapters, 75 small concepts, 35 diagrams and 51 executable worked examples** build from state and C assignment to complete translations. The guided path contains 148 questions; the preserved original bank adds 70, for **218 questions: 88 code exercises and 130 concepts**. Reference translations have **273 expected-output cases**: 171 guided-course cases and 102 original cases.

Live URL: https://ifcgit2024.github.io/my-portfolio/docs/projects/assembly-lab/index.html

No backend or build step. The site remains at its existing path and does not change Pages configuration. No uploaded lecture PDF, personal school information or unrelated portfolio files are published.

## Study workflow

Start with the first concept. Read its explanation and worked example, predict what changes, explain the idea in your own words, then use the focused practice and earlier review buttons. One concept is visible at a time. **Mark read and continue** records reading only; it does not solve any question. **Whole chapter** enables a broader review. **Original practice** preserves the 32-bit refresher, and **All practice** exposes the combined banks. Each concept automatically opens its first appropriate question mode.

The [course design and educational review](COURSE_DESIGN.md) explains the progression, evidence of understanding and next improvements. Learners do not need the source lecture or external notes to follow the lessons.

Code answers are executed against multiple supplied states, not compared to solution strings. Show hint, show solution and step through **Trace my code** when needed. The trace includes registers (decimal and hexadecimal), flags, question memory and eight-byte stack slots **before** each instruction. The first 200 pre-instruction states are retained, including steps captured before a runtime error. The final state is available separately through **Show final state**. Full registers and the initialized aliases used by the program appear with their actual widths. Check answer grades all cases; tracing one case does not mark an exercise solved.

Drafts, attempts, solved/reviewed status and the selected chapter/concept persist in browser localStorage under `mizel:assembly-lab:progress:v1`. Course schema version 2 adds concept and reading progress while retaining the existing storage key. Valid old answers and drafts are preserved; learners upgrading from the previous course start at the new foundation path. Stable question IDs and content fingerprints preserve unchanged questions' progress. Modified questions invalidate only their own old results. Revealing a solution before passing marks that question reviewed, not independently solved. Nothing is synchronized or uploaded.

## Lecture coverage

The [page-by-page review](LECTURE_REVIEW.md) maps all 36 lecture pages to practice, records answer verification and prioritizes short-term educational improvements.

| Chapters | Learning path |
| --- | --- |
| 1–3 | State, C assignment, bits/bytes, binary/hex, signedness, registers, MOV, widths and arithmetic |
| 4–5 | Functions, arguments/results, RET, memory, pointers, loads/stores and swap |
| 6–7 | Arrays, full address forms, width versus scale and LEA versus MOV |
| 8–9 | Bit masks, logical versus bitwise operations, shifts, C promotions, runtime counts and fields |
| 10–12 | Flags, branches, loops, PUSH/POP, frames, CALL, ABI rules and complete call/store functions |
| 13–14 | Encoding, disassembly, architecture, syntax/build pipeline and integrated explanations/translations |

The image-only pages were inspected, including the register diagrams, instruction encoding, slide 15's `sumstore`, and slide 35's array example. This is coverage of the supplied integer-assembly lecture plus the requested extensions, **not a claim to cover the entire CSCI 2122 exam syllabus**.

### Corrections explicitly taught

- Slide 2's 1–8-byte instruction-length range is not the general x86 limit: x86 instructions can be up to 15 bytes. RISC/CISC are not universal speed/power rankings or guarantees of fixed instruction size.
- Slide 20's C-equivalent for `movq (%rax),%rdx` reverses the pointer/value mapping. The instruction loads from the address in RAX into RDX.
- Slide 33's C returns `(x+y+z)*(5*y)`; its assembly returns `(x+y+z)*(2*x+4)`. Its `48*y` result is unused. Both actual computations have separate verified exercises.
- Slide 35 mixes RBP and EAX in one address; address-register widths must match, e.g. `20(%rbp,%rax,4)` for a four-byte element.
- Original branching-slide corrections remain: JNE means ZF=0; JGE is signed greater-or-equal.

## Simulator contract

The data model is Linux x86-64 **LP64**: `long` and pointers are eight bytes; `int` is four. Legacy exercises use a separate 32-bit teaching model with four-byte integers and pointer slots. They default to four-byte memory cells. Arithmetic uses BigInt internally, so 64-bit values above JavaScript Number's safe range remain exact. In JSON, write large integers as strings.

- Supports all 16 general-purpose register families and their 32/16/8-bit aliases, including AH/BH/CH/DH where no REX encoding is required. A 32-bit register write clears its upper half; narrower writes preserve other bits. Uninitialized bits cannot be read.
- Data operations: MOV, LEA, ADD, SUB, two/three-operand IMUL, CMP, TEST, AND, OR, XOR, NEG, INC, DEC, NOT, NOP, SHL/SAL, SHR, SAR.
- Control: named-label JMP and signed/unsigned/equality/overflow/sign conditional branches and aliases; local direct CALL, RET, 64-bit PUSH/POP and LEAVE. No suffix infers a register width; ambiguous memory-only instructions default to 32 bits for legacy compatibility. Prefer explicit sizes.
- Little-endian byte memory supports overlapping accesses, aliases, symbols, immediates, register indirect, displacement and base/index/scale. Index scale is 1/2/4/8; ESP/RSP cannot index. Memory addresses are restricted to nonnegative safe JavaScript integer addresses. LEA arithmetic itself remains fully 64-bit, including negative results.
- Most q-form arithmetic and memory-immediate operations encode sign-extended 32-bit immediates. A register-destination MOV can load a full-width immediate. Signed constants and equivalent 64-bit hexadecimal patterns are both accepted (for example, `-9` and `0xfffffffffffffff7`). Shift counts must be an immediate byte or CL, and are hardware-masked to five or six bits. A zero effective count preserves flags and the operand-width value; a 32-bit register destination still clears the upper half of its 64-bit parent.
- Relevant ZF/SF/CF/OF flags are tracked. IMUL leaves ZF/SF undefined; shift OF is undefined for nonzero counts other than one. NOT/MOV/LEA and stack/control instructions preserve flags. A branch on an undefined flag fails clearly.
- A 4096-byte stack is preallocated at `[0x7000,0x8000)`. Snippets start with RSP=0x8000; functions start at 0x7ff8 with a simulated return sentinel. Function fixtures seed RBX/RBP/R12–R15 with visible sentinel values unless explicitly overridden, and check their preservation. Function calls check ordinary 16-byte pre-call alignment and helper preservation.
- `call` pushes a simulated instruction index, **not a native byte address**. `ret` pops it. Helpers must be included in the submitted code. Function exercises must execute RET; falling off the end is an error. Snippets may end normally. Stack balance is checked. No external/native functions run in the browser.
- Output memory and registers must match; other supplied memory must remain unchanged. Stack scratch bytes may change. Some exercises explicitly require instructions such as PUSH/POP/CALL to practice that concept; this is stated in the task. Required operations must execute in at least one test case; unreachable instructions do not satisfy that requirement. Otherwise equivalent implementations are accepted.
- Limits: 50,000 characters, 1,000 lines/instructions, 10,000 executed instructions per case. The interpreter is a bounded teaching subset, not a complete assembler/emulator. No directives, indirect calls, division, extension moves, floating-point/SIMD, operating-system calls, arbitrary C parser, or machine-code generation. The displayed C is a specification, never evaluated.

Passing tests is evidence for the listed inputs, not a proof for all C inputs. C signed overflow is undefined; signed examples avoid it. Unsigned examples can deliberately wrap. Negative signed right-shift questions explicitly specify x86 arithmetic behavior; C shift-count restrictions differ from hardware count masking.

## Files and authoring

- `engine.js`: parser, execution, grading and bank validation.
- `app.js`, `index.html`, `styles.css`: accessible interface and browser persistence.
- `data/manifest.json`: bank list.
- `data/translation.json`, `data/concepts.json`: preserved original questions, with reviewed concept wording.
- `data/lecture10.json`: the reviewed core exercises and answer explanations.
- `data/foundations.json`: 26 first-principles practice questions.
- `data/lessons.json`: schema-version-2 chapters with ordered concepts, prerequisites, explanations, worked examples, teach-back prompts, focused practice and review IDs.
- `data/diagrams.json`, `diagrams/*.svg`: figure metadata and 35 local accessible diagrams.
- `COURSE_DESIGN.md`, `LECTURE_REVIEW.md`: author guidance, coverage mapping and review evidence.
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

Additional fields: `entry` selects a label; `memoryWidths` overrides widths by memory key; `preserveRegisters` adds preservation checks; `abi` enables call checks for snippets. Default cell width is 4. Null means allocated but uninitialized. Arrays use keys such as `a`, `a+8`, `a+16`. `checkStack:false` is used only by the isolated PUSH worked example to observe an unfinished push. All graded exercises still require a balanced stack. Import validates reference solutions before admitting a bank and remains session-only.

## Validation and local preview

```sh
node --test docs/projects/assembly-lab/tests/*.test.cjs
python3 docs/projects/assembly-lab/tests/native-reference.py
python3 docs/projects/assembly-lab/tests/c-reference.py
python3 docs/projects/assembly-lab/tests/native-semantics.py
python3 -m http.server 8000
```

Open `http://localhost:8000/docs/projects/assembly-lab/index.html`. Browsers block JSON fetches from `file://`.

The Node suite additionally checks prerequisite order, instruction introduction, self-contained wording, local diagrams and all 51 executable worked examples. It covers original and new banks plus exact 64-bit arithmetic, aliases, overlapping widths, negative LEA, shifts/flags, stack boundaries, PUSH/POP special cases, nested calls, RET/LEAVE, ABI rules, invalid forms and grading. The independent native suite compiles and executes all **171 guided-course reference cases** using GCC on Linux x86-64 and verifies expected register values, changed outputs and preserved input memory. The separate native-semantics suite compares shift results, defined flags and sign-extended immediate masks directly with hardware, including zero-count register writes. The C-reference suite separately compiles the displayed C functions with undefined-behavior checking and checks 143 fixtures across 42 functions and the separate integer-promotion worked example. Machine-only snippets remain covered by the assembly suite. All native suites run only repository-owned programs in a temporary directory, never user code. GCC is a development-only verification dependency; the published site needs only a modern browser with BigInt.

The optional DOM integration suite requires a development installation of `jsdom` and runs with `node docs/projects/assembly-lab/tests/ui-review.cjs`. If the dependency is installed elsewhere, set `ASSEMBLY_LAB_JSDOM` to its module path. It checks the full course flow, all 218 answer handlers and progress migration without starting a browser. It does not verify rendered layout. No runtime dependency was added to the site.

## Primary references

- Supplied Lecture 10, “Assembly 1” (36 slides), used as the course-content map; source PDF is not redistributed.
- [Intel architecture manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- [GNU assembler AT&T syntax](https://sourceware.org/binutils/docs/as/i386_002dVariations.html)
- [GNU operand sizes](https://sourceware.org/binutils/docs/as/i386_002dMnemonics.html)
- [C23 committee draft, §6.5.7 (shift rules)](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3096.pdf)
- [System V AMD64 ABI source](https://gitlab.com/x86-psABIs/x86-64-ABI)

No analytics, external fonts or third-party runtime scripts. Static assets and banks are the only app network requests.
