# Control-flow, inline-assembly and conversation coverage review

Reviewed 16 October 2026 against every page of the supplied **Lecture11-ASMII.pdf (21 pages)** and **inLine.pdf (8 pages)**, including image-only code and tables. This is an author/reviewer map. The learning path supplies its own examples and does not require either source document.

## Result and teaching approach

The course now contains **17 chapters and 108 concepts**, with **49 diagrams**, **66 interpreter-checked assembly worked examples**, and **10 separately compiled native inline-C worked examples**. The guided path has **221 questions**; the preserved original bank adds 70, giving **291 questions: 103 code translations and 188 multiple-choice concepts**. This update adds 33 concepts, 14 diagrams and 73 questions, including 15 code translations with 82 cases.

New ideas retain the established cycle: introduction, concrete starting information, worked reasoning, teach-back prompt, focused practice, and earlier review. Register naming enters near the beginning; address/data widths follow memory; byte-result and widening lessons follow comparisons; complete loop forms precede the stack/call chapters; GCC inline assembly follows the native build pipeline. Existing question IDs and valid saved progress remain compatible.

Native inline-C examples are visibly identified as code to compile with GCC. Their browser practice covers interpretation, correction and deterministic calculations. The browser does not run GCC, native RDTSC, or arbitrary uploaded code. It does now execute SETcc byte results and the supported MOVZX/MOVSX forms, so the Boolean and widening translations receive actual execution-based feedback.

## Lecture11-ASMII: all 21 pages

IDs refer to stable JSON author identifiers; students see descriptive titles.

| Page | Understanding to demonstrate | Concept path | Direct practice |
| --- | --- | --- | --- |
| 1 | Orientation: control flow follows data operations | Existing foundations through branches; no separate title-page fact to test | Following pages supply the substantive content |
| 2 | Complete signed maximum with the stated argument/result registers | `function-registers`, `ordered-branches` | `l10-signedmax`, `l10-cmp` |
| 3 | Conditional/unconditional transfer, if/else and loop forms | `equality-branch`, `threshold-if`, `do-while`, `for-loop` | `p-branch`, `x-threshold`, `x-do-width`, `x-for-sum` |
| 4 | Registers, RSP, RIP and condition codes describe program state | `registers`, `instruction-position`, `flags`, `frame-register-names` | `l10-state`, `x-frame-name`, `p-cmp` |
| 5 | ZF/SF/CF/OF after arithmetic, and LEA preserving flags | `flag-details`, `arithmetic-tests` | `x-carry-overflow`, `x-arithmetic-zero`, `l10-leaflags` |
| 6 | CMP uses destination minus source; unsigned subtraction borrow and signed overflow | `flags`, `flag-details`, `ordered-branches` | `p-cmp`, `x-borrow`, extreme signed/unsigned maximum cases |
| 7 | TEST computes AND for flags without changing operands; self-test and masks | `test-bits`, `arithmetic-tests` | `l10-test`, `l10-bittest`, `x-overflow-sign` |
| 8 | Jcc equality, sign, signed order and unsigned order predicates | `ordered-branches`, `arithmetic-tests`, `set-conditions` | `l10-cmp`, `l10-unsigned`, `x-threshold-branch`; shared predicate table |
| 9 | SETcc writes a Boolean byte; select the matching predicate | `set-byte`, `set-conditions` | `x-set-byte`, `x-set-vs-jump`, `x-condition-table`, `x-setne-spelling` |
| 10 | Byte-register or byte-memory destination; preserve other bytes; normalize a wider result | `set-byte`, `set-result`, `set-memory` | `x-boolean-clean`, `x-greater-int`, `x-store-bool`, `x-set-memory` |
| 11 | Decode source/destination suffixes; zero/sign extension from register or memory into a wider register | `zero-extension`, `sign-extension`, `extension32` | `x-load-ubyte`, `x-load-sbyte`, `x-int-long`, `x-load-unsigned-memory`, `x-load-signed-memory`, `x-load-word-memory`; register/memory sources and distinct byte/word/int widths |
| 12 | Translate int gt(long,long) as CMP/SETG/MOVZBL/RET | `set-result` | `x-greater-int`, including equality, negatives and extreme-order comparisons |
| 13 | Reuse arithmetic flags only for predicates they actually represent | `arithmetic-tests`, `flag-lifetime` | `x-arithmetic-zero`, `x-overflow-sign`, `l10-shiftflags` |
| 14 | Relate CMP/SUB and TEST/AND without treating all branches as result-versus-zero | `flags`, `test-bits`, `arithmetic-tests` | `p-cmp`, `l10-test`, explicit overflow counterexample |
| 15 | Implement signed x<3 with two complete return paths and the equality boundary | `threshold-if` | `x-threshold`, `x-threshold-branch` |
| 16 | Preserve inputs and subtract in the correct order for absdiff | `absolute-difference` | `x-absdiff`, `x-absdiff-direction`, stated representable-difference precondition |
| 17 | Rewrite if/else as conditional goto, fall-through and a jump to a join | `goto-paths` | `x-goto`, `x-absdiff` |
| 18 | Test a while condition before entering the body | `while-loop` | `l10-loopzero`, `l10-sumloop` |
| 19 | Compare top-tested while, do-while, and entry-guarded bottom-test while | `do-while`, `guarded-while` | `x-do-first`, `x-do-width`, `x-guarded-while`, `x-guarded-visits` |
| 20 | Derive population count using low-bit extraction and logical shift; explain its goto form | `goto-paths`, `population-count` | `x-popcount-trace`, `x-popcount` |
| 21 | Explain every population-count instruction, 32-bit AND zeroing, SHR flags feeding JNE and final return | `population-count`, `alias-writes`, `flag-lifetime` | `x-popcount`, `x-popcount-return`; zero, high-bit-only and all-64-ones fixtures |

## inLine: all 8 pages

| Page | Understanding to demonstrate | Concept path | Direct practice |
| --- | --- | --- | --- |
| 1 | C strings, separators, basic versus extended asm, accurate AT&T notation and declared effects | `inline-basic`, `inline-contract` | `x-inline-basic`, `x-inline-string`, `x-inline-syntax`, `x-inline-sections` |
| 2 | GCC supplies operand locations and setup; template and compiler contract are separate | `inline-contract`, `inline-placeholders` | `x-inline-register-allocation`, `x-inline-percent`, `x-inline-numbering` |
| 3 | A complete two-long product, placeholders, literal percent escapes, initialized versus write-only output, fixed scratch and changed flags | `inline-writeonly`, `inline-readwrite`, `inline-clobbers` | `x-write-only`, `x-bad-readwrite`, `x-read-write`, `x-multiply-cc`, `x-scratch-clobber`, `x-inline-result`; compiled 13×7=91 and varied signed cases |
| 4 | Read object disassembly, distinguish template operations from compiler-generated setup and output use | `inline-disassembly` | `x-inline-objdump`, `l10-disassembly`; reproducible GCC/objdump commands |
| 5 | Outputs then inputs; = versus +; r versus m; read/write C locations | `inline-writeonly`, `inline-readwrite`, `inline-locations` | `x-write-only`, `x-read-write`, `x-constraint-location`, `x-pointer-input-not-memory` |
| 6 | Declare scratch registers without assuming an unconditional reload afterward | `inline-clobbers`, `inline-earlyclobber` | `x-scratch-clobber`, `x-reload-myth`, `x-early-clobber`, `x-early-repair` |
| 7 | RDTSC result is EDX:EAX; a reading differs from an interval | `inline-counter-read`, `counter-combine` | `x-rdtsc-halves`, `x-rdtsc-meaning`, `x-counter-cast`, `x-join-counter` |
| 8 | Correct output contract, persistence, baseline, counter-half composition and elapsed difference | `inline-counter-read`, `counter-combine`, `counter-delta` | `x-ticks-first`, `x-ticks-delta`, `x-ticks-wrap`; complete compiled `ticks_since` example |

Early-clobber, precise memory effects and volatile-versus-hardware-ordering explanations are necessary supporting additions: they prevent the supplied multi-instruction inline examples from being understood as safe merely because a single run produced the expected number.

## This conversation and the pasted explanation

| Question or misconception | Where it is taught | Practice |
| --- | --- | --- |
| What do register names and widths mean? | `register-names`, `register-aliases`, `alias-writes` | `x-register-names`, `x-historical-role`, existing byte/word/32-bit-write tasks |
| Are EBX and EBP sizes of one register? Is EBX the stack or function base? | `register-names`, `frame-register-names`, `local-frame` | `x-register-names`, `x-frame-name`, executable local-frame task |
| What differs between P and X? | P in SP/BP is pointer; BX and BP are different historical families | Family diagram and naming questions; no invented universal meaning for X |
| Copy p versus read *p | `pointer`, `pointer-load` | `x-dereference` and existing load/store tasks |
| Parentheses with MOV versus LEA | `lea-compare` | `x-lea-three`; values 4096, 23, 4096 and offset reasoning |
| Full-width address with small data | `address-data-width` | `x-address-width`, `x-address32` |
| Is a memory load necessarily a trip to the RAM sticks? | `performance-meaning` | `x-memory-cache` |
| Are 8/16-bit operations always slower, or every MOV one cycle? | `performance-meaning` | `x-width-speed`; width semantics take precedence over timing slogans |
| Is every x64 argument convention identical? | `function-registers` | `x-argument-mnemonic`, Linux versus Windows distinction |
| Better argument-order mnemonic | `function-registers` | “Dogs Steal Donuts; Cats Ate Nine,” with RDI first and RDX third explicitly distinguished |

## Corrections incorporated into the actual teaching

- **CF after subtraction:** describes unsigned borrow, not an ADD-style carry-out story. CMP leaves its operands unchanged.
- **SETNE spelling:** the nonzero/not-equal condition is SETNE, not a second SETE row with an opposite predicate.
- **SETcc width:** changes one destination byte; it does not zero seven other bytes. Wider register results need their own initialization or extension.
- **Extension notation:** use valid commas and explicit suffixes, such as `movzbq %al,%rbx` and `movsbl (%rax),%ebx`. `movslq` handles signed 32-to-64; an ordinary 32-bit MOV provides unsigned zero extension.
- **Greater-than return:** `movzbl %al,%eax` is a 32-bit/four-byte destination operation, not a “32-byte instruction.” Its EAX write clears the high half of RAX.
- **Arithmetic flags:** not every arithmetic-looking instruction defines every condition code. LEA/NOT preserve flags, INC/DEC preserve CF, and IMUL leaves ZF/SF undefined. After an overflowing ADD, JG/JL are not just stored-result sign tests. TEST can establish a new result-versus-zero predicate. Unsigned JB after ADD tests carry, not a result below unsigned zero.
- **Basic-asm syntax:** remove the opcode’s stray comma, do not mark memory displacement as an immediate, and write a bare scale `4`, not `$4`.
- **Fresh inline outputs:** use `=r` for the newly produced result; `+r` requires an initialized input value as well as a result. The corrected multiplication also declares `cc`.
- **Clobber interpretation:** GCC accounts for changed state and protects live values; there is no guarantee that it reloads every clobbered register afterward.
- **Percent escapes:** `%%rax` is for a literal register in an extended template; operand `%0` is substitution. Do not double every percent in basic asm or standalone assembly.
- **Counter spelling/order:** RDTSC, high EDX and low EAX. Widen before shifting the high half by 32.
- **Counter contract and policy:** a volatile read with two write-only outputs accurately captures the hardware result. Unsigned arithmetic avoids signed-overflow counter subtraction. A ready flag defines first-call zero rather than presenting a reading-from-zero as an elapsed interval. Bare RDTSC is not serialized, invariant-TSC ticks are not generally current-frequency core cycles, and the illustrative static-state function is not a concurrent timing API.

## Verification and limits

- **146 automated Node tests** check all question banks, the 108-concept prerequisite/review sequence, first-use instruction order, all 66 executable assembly worked examples and the interpreter’s existing edge cases.
- All **103 code reference answers pass 355 interpreter fixtures**.
- **253 guided-course fixtures pass as native x86-64 assembly**. The original 102 legacy cases remain checked in their stated teaching model.
- **225 fixtures across 57 displayed C functions** pass separately compiled C with undefined-behavior checks. The standalone C promotion example also passes.
- **1,527 instruction/flag comparisons against real x86-64** cover shifts/immediates plus all 11 supported extension forms and every supported canonical/alias SETcc condition, including dirty upper bytes and overflow cases.
- **10 displayed inline-C functions** compile with strict C11, warnings-as-errors and undefined-behavior checking at GCC `-O0`, `-O2`, `-O3`, and `-O3 -flto`: **136 checks** cover copy, product, early-clobber sum, memory effects, counter reads and first-call policy. The tests compile the exact displayed source. They do not assert a predictable elapsed duration from real hardware.
- DOM integration checks all 108 concepts and all 291 answer handlers, including focused/chapter scope, old progress migration, restored drafts, trace behavior and imports. All 14 new SVGs are rendered and inspected independently.

The native tests run only trusted repository-owned programs. Passing finite cases is not proof for every input, every allocator choice or every processor. The interpreter is a bounded teaching subset. Full browser layout/mobile inspection is unavailable in this environment; DOM behavior and SVG inspection are explicitly separate checks. This map covers the supplied materials and requested discussion, not the entire CSCI 2122 exam syllabus.

## Primary references

- Supplied course PDFs, visually reviewed page by page; originals are not redistributed.
- [GNU extended asm](https://gcc.gnu.org/onlinedocs/gcc/Extended-Asm.html), including outputs, inputs, clobbers, early-clobber and volatile.
- [GNU basic asm](https://gcc.gnu.org/onlinedocs/gcc/Basic-Asm.html) and [simple constraints](https://gcc.gnu.org/onlinedocs/gcc/Simple-Constraints.html).
- [Intel instruction manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html): SETcc, MOVZX, MOVSX/MOVSXD, condition flags and RDTSC.
- [GNU AT&T notation](https://sourceware.org/binutils/docs/as/i386_002dVariations.html).
- [System V AMD64 ABI](https://gitlab.com/x86-psABIs/x86-64-ABI) and [Microsoft x64 calling convention](https://learn.microsoft.com/en-us/cpp/build/x64-calling-convention).
