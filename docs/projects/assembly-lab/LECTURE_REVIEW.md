# Lecture 10 coverage and educational review

Reviewed 14 October 2026 against the supplied 36-page **Assembly 1 / Lecture 10** PDF. Page numbers below mean PDF pages, including slides whose teaching content is an image.

## Assessment

The lab now provides an explanation and a relevant practice task for every substantive topic presented in the supplied lecture. Core integer operations are practiced by executing translations; introductory topics such as ISA distinctions, floating-point register families, compiler integration and debugger commands are practiced conceptually. This distinction matters: answering a debugger question is not experience operating GDB.

The current course contains **17 chapters, 108 small concepts and 291 questions: 103 code exercises and 188 concepts**. Of these, 70 are the preserved original bank and 221 form the guided course. There are 49 diagrams, 66 executable assembly worked examples and 10 native inline-C examples. This page maps the original 36 pages; [the newer review](CONTROL_INLINE_REVIEW.md) maps Assembly II, inline assembly and the conversation additions. See [Course design](COURSE_DESIGN.md) for the beginner-to-independent progression. PUSH/POP/CALL, 64-bit widths and bit operations have both explanations and executable practice.

This is a strong focused resource for the supplied material. It is not a complete CSCI 2122 syllabus or a substitute for compiling and debugging native programs. The external textbook exercise “problem 3.1, page 182” mentioned on the final slide was not supplied and is **not verified or reproduced**.

## Page-by-page coverage

Question and concept IDs below are stable author identifiers in the JSON data. Learners see plain titles and self-contained information. Several pages develop one example, so a task can legitimately cover multiple pages.

| PDF page | Understanding to demonstrate | Concepts | Direct practice evidence |
| --- | --- | --- | --- |
| 1 | Identify software-visible state and instruction behavior as ISA | `isa`, `state` | `l10-isa`, `l10-state` |
| 2 | Compare CISC/RISC without assuming universal speed or encoding rules | `instruction-traditions` | `l10-risc` |
| 3 | Separate architecture, implementation, assembly and machine code | `isa`, `machine-encoding` | `l10-isa`, `l10-forms` |
| 4 | Explain why optimized executable behavior can require assembly inspection | `disassembly` | `l10-whyassembly` |
| 5 | Recognize syntax dialects and distinguish separate assembly from inline assembly | `syntax-dialects`, `build-pipeline` | `l10-cbridge`, `l10-intelsyntax` |
| 6 | Identify instruction pointer, registers, flags, data and stack state | `instruction-position`, `flags`, `stack-push` | `l10-state`, `l10-cmp`, `l10-pushdelta`, `l10-callreturn` |
| 7 | Distinguish integer sizes, vector register families and aggregate byte layouts | `bits-bytes`, `operand-width`, `array-layout`, `other-data` | `l10-bytes`, `l10-floatregs`, `l10-aggregate`, `l10-arrayint` |
| 8 | Distinguish named register storage from addressed memory | `registers` | `l10-regmemory`, `l10-regcapacity` |
| 9 | Recognize 64-bit register families and overlapping aliases | `register-aliases`, `alias-writes` | `l10-copy64`, `l10-alias`, `l10-zeroextend` |
| 10 | Explain smaller register views and partial writes | `register-aliases` | `l10-lowbyte`, `l10-lowword`, `l10-zeroextend` |
| 11 | Compare register capacity with memory and avoid double-counting aliases | `registers`, `memory` | `l10-regmemory`, `l10-regcapacity` |
| 12 | Classify arithmetic/logic, movement and control flow | `isa`, `addition`, `and`, `equality-branch` | `l10-opfamilies`, arithmetic/bit/branch translations |
| 13 | Distinguish immediate, register and memory operands | `immediate`, `register-copy`, `pointer-load` | `l10-syntax`, `l10-addressvalue`, `l10-deref` |
| 14 | Interpret the prefix, opcode and operand fields in the illustrated MOV encoding | `machine-encoding`, `operand-fields` | `l10-encodingfields`, `l10-encodingdirection` |
| 15 | Translate the entire sumstore example, including preservation across a call | `sumstore` | `l10-sumstore`, `l10-destlive`, `l10-alignment` |
| 16 | Separate instruction address, instruction length, data address and data width | `instruction-position`, `machine-encoding`, `disassembly` | `l10-encoding`, `l10-disassembly` |
| 17 | Distinguish disassembly from examining raw bytes in GDB | `disassembly` | `l10-gdbbytes`, `l10-disassembly` |
| 18 | Relate operands to constants, variables and pointer dereferences | `immediate`, `pointer` | `l10-syntax`, `l10-storeorder`, `l10-deref` |
| 19 | Select b/w/l/q and explain their actual widths | `operand-width`, `alias-writes` | `l10-quad`, `l10-long`, `l10-lowbyte`, `l10-lowword` |
| 20 | Translate all listed MOV directions and reject memory-to-memory MOV | `register-copy`, `pointer-load`, `pointer-store`, `memory-copy` | `l10-constant64`, `l10-storeimmediate`, `l10-copy64`, `l10-loadptr`, `l10-storeptr`, `l10-memcopy` |
| 21 | Evaluate indirect and displaced memory operands | `pointer-load`, `displacement` | `l10-loadptr`, `l10-displaced` |
| 22 | Translate swap from C using preserved temporaries | `swap-preserve`, `swap-complete` | `l10-swap`, `l10-swaporder` |
| 23 | Map pointer arguments and temporary data to different registers | `pointer`, `swap-preserve` | `l10-swap`, `l10-swapload1` |
| 24 | Interpret the initial pointer and memory state of swap | `swap-preserve` | Starting states in `l10-swapload1` through `l10-swapfinal` |
| 25 | Predict the first load without changing memory or the pointer | `swap-preserve` | `l10-swapload1` |
| 26 | Predict the second load and retain both originals | `swap-preserve` | `l10-swapload2` |
| 27 | Explain why both memory cells temporarily hold the same value | `swap-complete` | `l10-swapstore1` |
| 28 | Predict the completed swap while pointers remain unchanged | `swap-complete` | `l10-swapfinal`, executable `l10-swap` including aliased pointers |
| 29 | Apply displacement + base + index × scale, including omitted components | `scaled-index`, `displacement`, `omitted-components` | `l10-scales`, `l10-nobase`, `l10-displaced`, `l10-addressforms` |
| 30 | Calculate all four illustrated address forms | `omitted-components` | `l10-addressforms`, `l10-nobase` |
| 31 | Use LEA for addresses and scaled arithmetic, including 12× | `lea-address`, `lea-arithmetic`, `left-shift` | `l10-elementptr`, `l10-times12`, `l10-affine` |
| 32 | Predict all four LEA/MOV destinations from the supplied memory table | `lea-compare` | `l10-leafour`, `l10-leamov` |
| 33 | Track live values and recognize the C/assembly mismatch | `live-values` | `l10-slide33audit`, `l10-slide33c`, `l10-slide33asm` |
| 34 | Evaluate displacement 42 with base/index/scale | `displacement` | `l10-displacement42` |
| 35 | Match an int store’s width and scale while correcting mixed address widths | `array-store`, `local-frame` | `l10-localintstore`, `l10-mixedaddr`, `l10-arrayint`, `l10-arraystore` |
| 36 | Select and write the LEA expression for 9× | `lea-arithmetic` | `l10-nine`, `l10-times9`; external textbook problem unavailable |

The requested extensions go further than the lecture: chapter 8 practices setting, clearing, toggling, complementing and testing bits; chapter 9 practices logical/arithmetic shifts and runtime counts; chapters 13–14 practice stack frames, nested calls, alignment and register preservation. Chapter 17 combines arrays, masks and calls.

## Corrections and gaps addressed

The earlier coverage review added **19 concept questions and one executable immediate-store exercise**. The main gaps were active practice for the encoding diagram, GDB byte syntax, syntax conversion, intermediate swap states, all slide-30 addresses and all slide-32 destinations. The new design incorporates those explanations into prerequisite-ordered concept lessons, then adds 26 foundation questions and a complete explanation/example/practice/teach-back cycle to every concept.

- Fixed the original explanation that incorrectly claimed the simulator only supports 32-bit instructions.
- Clarified the assembler long-word suffix versus the LP64 C `long`, conventional EBP frames, and the difference between JS and a signed less-than comparison.
- Corrected the register-width worked example’s ambiguous goal: writing EAX also clears the upper half of RAX.
- Explicitly labeled the old exercises’ 32-bit pointer-storage model so it is not confused with the guided LP64 course.
- Tightened the nested-call exercise to check its stated RDI clobber requirement.

The course already corrects the lecture’s x86 instruction-length generalization (page 2), reversed load mapping (20), mismatched arithmetic (33), and mixed address-register widths (35). The debugger command uses the correct forward slash: `x/14xb sum`.

## Answer verification and its limits

All 188 multiple-choice answer keys and explanations were reviewed against the stated data model, instruction semantics and supplied material. Numerical state-prediction questions were also checked by execution. All 103 code reference answers pass **355 total fixtures**: 102 original and 253 guided-course cases.

Independent checks avoid relying solely on the simulator:

- The automated Node suite executes all 66 displayed assembly worked examples and checks prerequisite order, prior instruction introduction, cumulative review, local diagrams and question validation.
- **253 guided-course reference fixtures pass as native x86-64 assembly**, including output values and preservation of supplied memory.
- **225 fixtures across 57 displayed C functions pass when compiled separately with GCC and undefined-behavior checking.** Machine-state snippets remain covered by the native assembly checks. The integer-promotion worked example is also compiled independently and checked before and after narrowing.
- **1,527 native instruction/flag comparisons** cover shifts, aliases and sign-extended immediate cases.
- GNU assembler/objdump confirmed `48 89 d8`, `48 89 c3` and `48 89 03` against the encoding explanations in the preceding coverage review; those explanations remain unchanged.
- DOM workflow checks cover all 108 concepts and all 291 answer handlers, focused/chapter practice, navigation, progress restoration and migration, traces, concept feedback and imports. All 49 SVGs were rendered and inspected separately. Full browser layout and mobile-device review was unavailable in this environment.

Tests establish correctness for the supplied cases, not every possible input. The browser uses a bounded teaching interpreter, not a full assembler. Conceptual coverage of encoding, GDB, floating-point/vector families and C/assembly integration does not mean those systems execute inside the lab. ABI-only exercise constraints are checked separately from compiled C, because C source does not specify their register clobbers.

## Educational feedback and short-term priorities

The strongest features are now the small prerequisite-ordered concepts, self-contained explanations, diagrams, teach-back prompts, cumulative review, immediate feedback, explicit pointer/value distinction, varied signed and high-bit cases, actual execution of translations, and the distinction between reading, independently solved and reviewed work. The main remaining weakness is **transfer**: recognizing a familiar option or reconstructing a shown answer is easier than explaining and writing an unfamiliar exam solution.

The following are recommendations, not features already implemented. Each can be a bounded next change without replacing the simulator.

| Priority | Small first implementation | Why it helps | Relative effort |
| --- | --- | --- | --- |
| 1 | A 10-question mixed exam set: three translations, three state predictions, two bug repairs and two explanations; hide feedback until submission | `isa`, `state` | Small content/UI change |
| 2 | Scaffold six difficult tasks: worked example → one missing operand → modify for a new type/value → write from scratch | `instruction-traditions` | Small content change using existing code grading |
| 3 | Add numeric “predict the next state” inputs for swap and call/return before revealing the trace | `isa`, `machine-encoding` | Moderate UI/grading change |
| 4 | Add six ASM→C or “repair this broken solution” tasks covering LEA/MOV, width, signed branch, mask, lost pointer and unbalanced stack | `disassembly` | Small content change; free-form C needs a rubric rather than exact-text grading |
| 5 | A retry queue with checked parameter variants and a later review date | `syntax-dialects`, `build-pipeline` | Moderate state/authoring change |

The scaffold recommendation adapts the Predict–Run–Investigate–Modify–Make approach studied in programming education. The cited PRIMM study involved secondary-school learners, so it is supporting rationale, not proof of effectiveness for university assembly. Delayed retrieval practice is also supported by experimental learning research; its application here is an educational recommendation rather than a measured result from this lab.

The current redesign implements the foundational explanation, worked-example and review sequence. The scaffold variants, delayed mixed assessment and numeric prediction inputs below remain future improvements; the [course-design review](COURSE_DESIGN.md) gives updated acceptance criteria.

For studying now: predict a result before running, write the translation without opening the solution, explain each width and address, then repeat a related task later with different inputs. Keep concept accuracy and independent code construction as separate signals of progress. A high completion count alone is not evidence of exam readiness.

## References

- Supplied Lecture 10 PDF, 36 pages; source PDF not redistributed.
- [Intel instruction manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- [GNU AT&T and Intel syntax](https://sourceware.org/binutils/docs/as/i386_002dVariations.html)
- [System V AMD64 ABI](https://gitlab.com/x86-psABIs/x86-64-ABI)
- [C23 committee draft, section 6.5.7](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3096.pdf)
- [Sentance, Waite & Kallia (2019), Teaching computer programming with PRIMM](https://eprints.gla.ac.uk/229013/)
- [Roediger & Karpicke (2006), Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)
