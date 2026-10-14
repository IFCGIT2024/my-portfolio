# Lecture 10 coverage and educational review

Reviewed 14 October 2026 against the supplied 36-page **Assembly 1 / Lecture 10** PDF. Page numbers below mean PDF pages, including slides whose teaching content is an image.

## Assessment

The lab now provides an explanation and a relevant practice task for every substantive topic presented in the supplied lecture. Core integer operations are practiced by executing translations; introductory topics such as ISA distinctions, floating-point register families, compiler integration and debugger commands are practiced conceptually. This distinction matters: answering a debugger question is not experience operating GDB.

The course contains **12 lessons and 192 questions: 81 code exercises and 111 concepts**. Of these, 70 are the preserved introductory bank; 122 belong to the Lecture 10 course and requested extensions. PUSH/POP/CALL, 64-bit widths and bit operations have both explanations and executable practice.

This is a strong focused resource for the supplied material. It is not a complete CSCI 2122 syllabus or a substitute for compiling and debugging native programs. The external textbook exercise “problem 3.1, page 182” mentioned on the final slide was not supplied and is **not verified or reproduced**.

## Page-by-page coverage

Question IDs are visible in the lab above each prompt. Several pages develop one example, so a task can legitimately cover multiple pages.

| PDF page | Understanding to demonstrate | Lesson | Direct practice evidence |
| --- | --- | --- | --- |
| 1 | Identify software-visible state and instruction behavior as ISA | 1 | `l10-isa`, `l10-state` |
| 2 | Compare CISC/RISC without assuming universal speed or encoding rules | 1 | `l10-risc` |
| 3 | Separate architecture, implementation, assembly and machine code | 1 | `l10-isa`, `l10-forms` |
| 4 | Explain why optimized executable behavior can require assembly inspection | 1 | `l10-whyassembly` |
| 5 | Recognize syntax dialects and distinguish separate assembly from inline assembly | 1–2 | `l10-cbridge`, `l10-intelsyntax` |
| 6 | Identify instruction pointer, registers, flags, data and stack state | 1, 9–11 | `l10-state`, `l10-cmp`, `l10-pushdelta`, `l10-callreturn` |
| 7 | Distinguish integer sizes, vector register families and aggregate byte layouts | 1–2, 4 | `l10-bytes`, `l10-floatregs`, `l10-aggregate`, `l10-arrayint` |
| 8 | Distinguish named register storage from addressed memory | 1 | `l10-regmemory`, `l10-regcapacity` |
| 9 | Recognize 64-bit register families and overlapping aliases | 2 | `l10-copy64`, `l10-alias`, `l10-zeroextend` |
| 10 | Explain smaller register views and partial writes | 2 | `l10-lowbyte`, `l10-lowword`, `l10-zeroextend` |
| 11 | Compare register capacity with memory and avoid double-counting aliases | 1 | `l10-regmemory`, `l10-regcapacity` |
| 12 | Classify arithmetic/logic, movement and control flow | 1, 6–9 | `l10-opfamilies`, arithmetic/bit/branch translations |
| 13 | Distinguish immediate, register and memory operands | 2–3 | `l10-syntax`, `l10-addressvalue`, `l10-deref` |
| 14 | Interpret the prefix, opcode and operand fields in the illustrated MOV encoding | 1 | `l10-encodingfields`, `l10-encodingdirection` |
| 15 | Translate the entire sumstore example, including preservation across a call | 10–11 | `l10-sumstore`, `l10-destlive`, `l10-alignment` |
| 16 | Separate instruction address, instruction length, data address and data width | 1 | `l10-encoding`, `l10-disassembly` |
| 17 | Distinguish disassembly from examining raw bytes in GDB | 1 | `l10-gdbbytes`, `l10-disassembly` |
| 18 | Relate operands to constants, variables and pointer dereferences | 2–3 | `l10-syntax`, `l10-storeorder`, `l10-deref` |
| 19 | Select b/w/l/q and explain their actual widths | 2 | `l10-quad`, `l10-long`, `l10-lowbyte`, `l10-lowword` |
| 20 | Translate all listed MOV directions and reject memory-to-memory MOV | 2–3 | `l10-constant64`, `l10-storeimmediate`, `l10-copy64`, `l10-loadptr`, `l10-storeptr`, `l10-memcopy` |
| 21 | Evaluate indirect and displaced memory operands | 3–4 | `l10-loadptr`, `l10-displaced` |
| 22 | Translate swap from C using preserved temporaries | 3 | `l10-swap`, `l10-swaporder` |
| 23 | Map pointer arguments and temporary data to different registers | 3 | `l10-swap`, `l10-swapload1` |
| 24 | Interpret the initial pointer and memory state of swap | 3 | Starting states in `l10-swapload1` through `l10-swapfinal` |
| 25 | Predict the first load without changing memory or the pointer | 3 | `l10-swapload1` |
| 26 | Predict the second load and retain both originals | 3 | `l10-swapload2` |
| 27 | Explain why both memory cells temporarily hold the same value | 3 | `l10-swapstore1` |
| 28 | Predict the completed swap while pointers remain unchanged | 3 | `l10-swapfinal`, executable `l10-swap` including aliased pointers |
| 29 | Apply displacement + base + index × scale, including omitted components | 4 | `l10-scales`, `l10-nobase`, `l10-displaced`, `l10-addressforms` |
| 30 | Calculate all four illustrated address forms | 4 | `l10-addressforms`, `l10-nobase` |
| 31 | Use LEA for addresses and scaled arithmetic, including 12× | 5 | `l10-elementptr`, `l10-times12`, `l10-affine` |
| 32 | Predict all four LEA/MOV destinations from the supplied memory table | 5 | `l10-leafour`, `l10-leamov` |
| 33 | Track live values and recognize the C/assembly mismatch | 6 | `l10-slide33audit`, `l10-slide33c`, `l10-slide33asm` |
| 34 | Evaluate displacement 42 with base/index/scale | 4 | `l10-displacement42` |
| 35 | Match an int store’s width and scale while correcting mixed address widths | 4 | `l10-localintstore`, `l10-mixedaddr`, `l10-arrayint`, `l10-arraystore` |
| 36 | Select and write the LEA expression for 9× | 5 | `l10-nine`, `l10-times9`; external textbook problem unavailable |

The requested extensions go further than the lecture: lesson 7 practices setting, clearing, toggling, complementing and testing bits; lesson 8 practices logical/arithmetic shifts and runtime counts; lessons 10–11 practice stack frames, nested calls, alignment and register preservation. Lesson 12 combines arrays, masks and calls.

## Corrections and gaps addressed

This second review added **19 concept questions and one executable immediate-store exercise**. The main gaps were active practice for the encoding diagram, GDB byte syntax, syntax conversion, intermediate swap states, all slide-30 addresses and all slide-32 destinations. Supporting explanations now appear in expandable lesson sections.

- Fixed the original explanation that incorrectly claimed the simulator only supports 32-bit instructions.
- Clarified the assembler long-word suffix versus the LP64 C `long`, conventional EBP frames, and the difference between JS and a signed less-than comparison.
- Corrected the register-width worked example’s ambiguous goal: writing EAX also clears the upper half of RAX.
- Explicitly labeled the old exercises’ 32-bit pointer-storage model so it is not confused with the guided LP64 course.
- Tightened the nested-call exercise to check its stated RDI clobber requirement.

The course already corrects the lecture’s x86 instruction-length generalization (page 2), reversed load mapping (20), mismatched arithmetic (33), and mixed address-register widths (35). The debugger command uses the correct forward slash: `x/14xb sum`.

## Answer verification and its limits

All 111 multiple-choice answer keys and explanations were reviewed against the lecture, the stated data model and instruction semantics. Numerical state-prediction questions were also checked by execution. All 81 code reference answers passed their **254 total fixtures**: 102 original and 152 Lecture 10 cases.

Independent checks avoid relying solely on the simulator:

- **76 automated tests passed**, including execution of all 12 displayed worked examples and the corrected grading constraint.
- **152 Lecture 10 reference fixtures passed as native x86-64 assembly**, including output values and preservation of supplied memory.
- **137 fixtures across 40 displayed C functions passed when compiled separately with GCC and undefined-behavior checking.** The remaining five Lecture 10 code tasks describe machine-state operations or a global snippet, rather than complete C functions; the native assembly checks cover them.
- **1,209 native instruction/flag comparisons passed**, covering the previously risky shift, alias and immediate cases.
- GNU assembler/objdump confirmed `48 89 d8`, `48 89 c3` and `48 89 03` against the encoding explanations.
- DOM workflow checks passed for lesson navigation, supplemental explanations, every executable answer, progress restoration, traces, concept feedback and question import. These check behavior; they are not a visual layout or mobile-device review.

Tests establish correctness for the supplied cases, not every possible input. The browser uses a bounded teaching interpreter, not a full assembler. Conceptual coverage of encoding, GDB, floating-point/vector families and C/assembly integration does not mean those systems execute inside the lab. ABI-only exercise constraints are checked separately from compiled C, because C source does not specify their register clobbers.

## Educational feedback and short-term priorities

The strongest features are the prerequisite order, immediate feedback, explicit pointer/value distinction, varied signed and high-bit cases, actual execution of translations, and the distinction between independently solved and reviewed work. The main remaining weakness is **transfer**: recognizing a familiar option or reconstructing a shown answer is easier than explaining and writing an unfamiliar exam solution.

The following are recommendations, not features already implemented. Each can be a bounded next change without replacing the simulator.

| Priority | Small first implementation | Why it helps | Relative effort |
| --- | --- | --- | --- |
| 1 | A 10-question mixed exam set: three translations, three state predictions, two bug repairs and two explanations; hide feedback until submission | Checks whether students can select the right idea without the lesson title giving it away | Small content/UI change |
| 2 | Scaffold six difficult tasks: worked example → one missing operand → modify for a new type/value → write from scratch | Bridges the large jump between reading a solution and independently constructing it | Small content change using existing code grading |
| 3 | Add numeric “predict the next state” inputs for swap and call/return before revealing the trace | Requires recall of values, addresses and stack changes rather than recognition among options | Moderate UI/grading change |
| 4 | Add six ASM→C or “repair this broken solution” tasks covering LEA/MOV, width, signed branch, mask, lost pointer and unbalanced stack | Tests whether the learner can explain and diagnose the mechanism in another direction | Small content change; free-form C needs a rubric rather than exact-text grading |
| 5 | A retry queue with checked parameter variants and a later review date | Reduces memorization of answer positions and tests retention after a delay | Moderate state/authoring change |

The scaffold recommendation adapts the Predict–Run–Investigate–Modify–Make approach studied in programming education. The cited PRIMM study involved secondary-school learners, so it is supporting rationale, not proof of effectiveness for university assembly. Delayed retrieval practice is also supported by experimental learning research; its application here is an educational recommendation rather than a measured result from this lab.

For studying now: predict a result before running, write the translation without opening the solution, explain each width and address, then repeat a related task later with different inputs. Keep concept accuracy and independent code construction as separate signals of progress. A high completion count alone is not evidence of exam readiness.

## References

- Supplied Lecture 10 PDF, 36 pages; source PDF not redistributed.
- [Intel instruction manuals](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- [GNU AT&T and Intel syntax](https://sourceware.org/binutils/docs/as/i386_002dVariations.html)
- [System V AMD64 ABI](https://gitlab.com/x86-psABIs/x86-64-ABI)
- [C23 committee draft, section 6.5.7](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3096.pdf)
- [Sentance, Waite & Kallia (2019), Teaching computer programming with PRIMM](https://eprints.gla.ac.uk/229013/)
- [Roediger & Karpicke (2006), Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)
