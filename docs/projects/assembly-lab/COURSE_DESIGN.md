# From first principles to independent assembly understanding

Updated 16 October 2026. This is an author and reviewer guide; learners do not need it or the source lecture to complete the course.

## The target

A learner should be able to encounter the supplied Assembly 1 material after finishing the course, explain the mechanisms in their own words, predict the changes in a new example, and construct or correct a C-to-assembly translation. The lecture is a coverage benchmark, not the lesson sequence or a required source of facts.

The course now has **17 chapters containing 108 small concepts**, **49 local diagrams**, **66 interpreter-checked assembly worked examples**, and **10 native inline-C worked examples**. Its guided path uses **221 questions**. The original 70-question practice bank remains available, making **291 questions overall: 103 code translations and 188 multiple-choice concepts**. The initial foundation bank has 26 questions; the control/inline expansion adds another 73 questions.

## The repeated learning cycle

Each concept presents:

1. A concrete goal and a link back to an earlier prerequisite.
2. An explanation that starts from known ideas and introduces the next mechanism.
3. A small worked example with all starting information and explicit reasoning. A diagram illustrates spatial or bit-level relationships where it helps.
4. An explain-it-yourself prompt, with a model explanation hidden until requested.
5. Direct buttons for focused practice, followed by selected earlier questions that bring prior ideas back into use.
6. A route to the next concept, with reading progress kept separate from independently solved work.

Code examples begin as short state changes before becoming complete functions. For example, a beginner first learns replacement and copying, then MOV, ADD and SUB, then parameters, result registers and RET. They are not asked to translate a pointer-taking function before learning what a function and a pointer are.

The later paths deliberately decompose the mechanisms:

- **Pointers:** address versus contents → load → store → temporary copy → preserve an old value → complete swap.
- **Addresses:** equal-sized elements → scale → displacement → omitted fields → choosing data width separately.
- **Bits:** AND → OR → XOR → NOT → bitwise versus truth → clear a bit; then left shift → logical right shift → arithmetic right shift → C promotions → runtime count → field extraction.
- **Calls:** returning a result first; later PUSH → POP → last-in-first-out → local storage → CALL continuation → saved registers → alignment → live values across a helper → complete call and store.
- **Encoding:** familiar instructions first; then instruction addresses → bytes → operand fields → immediate encoding → disassembly and the build pipeline.

Encoding and architecture terminology comes near the end because it explains operations the learner can already execute and discuss. The chapter IDs remain stable for compatibility; their numeric prefixes are not the teaching order.

## Full learning path

| Chapter | Concepts | Progression |
| --- | ---: | --- |
| 1. Values, bits and a changing machine | 6 | A program changes a state → Read a C assignment → A bit and a byte → Read binary by place value → Read hexadecimal addresses and values → The same bits can have different meanings |
| 2. Registers and your first instructions | 7 | Registers are named CPU storage → Read register names without inventing a role → Write a constant with MOV → Copy a register without erasing it → Choose the amount of data → Read smaller views of one register → A 32-bit write clears the upper half |
| 3. Compute a result one operation at a time | 4 | ADD uses the old destination → SUB has a direction → Multiply while keeping the needed inputs → Fixed width limits arithmetic |
| 4. Functions: inputs, results and a return | 3 | A function receives values and produces a result → Agree where inputs and results go → RET returns control, not a numeric value |
| 5. Memory, pointers and preserving a value | 8 | Memory has addresses and contents → Little endian: which byte is first? → A pointer is an address value → Parentheses make MOV read memory → Put the memory operand last to store → Use a temporary between two memory locations → Save a value before overwriting it → Complete the swap and explain every state |
| 6. Arrays and address arithmetic | 6 | An array is a sequence of equal-sized elements → Use base plus index times scale → Add a fixed byte offset → Read shortened address forms → Choose width and address independently → Choose address width separately from data width |
| 7. Calculate an address without reading it | 3 | LEA computes; MOV dereferences → Predict LEA and MOV side by side → Use address arithmetic on ordinary numbers |
| 8. Build and use bit masks | 6 | AND keeps shared one bits → OR sets selected bits → XOR toggles selected bits → NOT flips every bit in the chosen width → Bitwise operations and truth are different questions → Clear one bit by combining NOT and AND |
| 9. Move bits, then extract a field | 6 | Shift left by a known count → SHR fills with zeros → SAR repeats the sign bit → C can widen a small value before shifting → A variable count goes in CL → Shift into place, then mask |
| 10. Flags, decisions and repetition | 10 | CMP records a comparison without storing a result → Compute carry, overflow, sign and zero separately → A branch chooses the next instruction → Signed and unsigned need different conditions → Turn a condition into two complete paths → Choose subtraction order with a comparison → TEST asks whether selected bits are zero → Use flags from the operation you actually executed → Check before repeating → Know which flags are still meaningful |
| 11. Widen values and produce Boolean results | 7 | Make a small unsigned value wider → Keep the signed meaning while widening → Widen a 32-bit value according to its type → Write a condition as zero or one → Return a complete Boolean value → Choose the condition that matches the question → Store a Boolean byte without touching its neighbors |
| 12. Translate every loop form and count set bits | 5 | Make a C control path explicit with goto → Place the condition after the first body execution → Use a bottom test without changing while semantics → Separate initialize, test, body and update → Count every set bit in an unsigned long |
| 13. A stack is memory with a moving top | 5 | PUSH reserves space before writing → POP reads, then releases the slot → Last in, first out → Distinguish stack top from frame reference → Reserve a local value at a stable offset |
| 14. Functions that call other functions | 5 | CALL saves where execution should resume → Respect the caller’s saved values → Prepare the stack for another call → Keep a needed value safe across a helper → Combine a call with a pointer store |
| 15. Read machine code and explain the architecture | 11 | The machine also tracks where it is → An assembler turns instruction text into bytes → Read one operand byte in small fields → A written constant must fit an instruction form → Read the executable through two different views → Separate the software contract from the implementation → Separate an operation’s meaning from its speed → Read CISC and RISC as design traditions → Translate notation without changing behavior → Connect C source, object files and linked functions → Recognize the boundary of integer instructions |
| 16. Connect assembly to C with a correct compiler contract | 13 | Put an assembler template inside a C function → Declare what the compiler must know → Substitute operands without guessing register names → Describe a newly produced value with = → Update an initialized value with + → Describe registers and addressed objects precisely → Declare fixed scratch registers without losing C values → Protect a later input from an early output write → Describe side effects and compiler ordering separately → Inspect the compiled template in context → Read a changing hardware counter through explicit outputs → Combine two halves into one unsigned value → Turn readings into a documented interval |
| 17. Explain and build a complete translation | 3 | Start from the contract, then decompose the work → Find the value actually used by an instruction → Explain a whole program without prompts |

## Self-contained material and diagrams

Every task supplies its own code, values, memory table or scenario. No student-facing explanation or question asks the learner to consult a slide or PDF. The arithmetic discrepancy is taught as an ordinary program-analysis task with the complete code present.

Diagrams are local SVGs with readable text, descriptive alternatives and full captions. They show before/after state, place values, register aliases, pointer versus value, arrays, bit masks, shifts, branching, stack movement, calls and instruction fields. First appearances show only the relevant new operation; comparison diagrams appear after both sides have been introduced. All 49 SVGs were rendered and inspected independently of the application.

Worked code is visible as instruction, not counted as an independently solved answer. The teach-back answer is deliberately collapsible. Chapter-wide and full-bank practice remain available, but the default exercise set is the current concept and its cumulative review.

## What counts as understanding

A useful completion check has four parts:

| Evidence | What the learner should demonstrate |
| --- | --- |
| Explain | Name what the operation reads, changes and preserves; justify width, signedness and address use. |
| Predict | Compute the next state before running, including registers, relevant memory and stack changes. |
| Construct | Write a translation without revealing the answer and pass varied inputs. |
| Transfer | Change a value, type or requirement; identify why the corresponding instructions must change. |

The final concepts ask the learner to combine these skills and explain a complete program. Self-reported reading, revealed answers and independently passed questions stay distinct. The lab does not automatically grade the free-form teach-back explanations. A completed path or a passing fixture set is not a validated claim of exam readiness.

## Coverage and correctness review

The [initial lecture review](LECTURE_REVIEW.md) maps all 36 original pages. The [control/inline review](CONTROL_INLINE_REVIEW.md) maps all 29 new PDF pages and the specific register, pointer, LEA and performance questions raised in conversation. This includes the image-only examples. Lecture errors are corrected in the actual explanations: instruction length, reversed load interpretation, the mismatched arithmetic calculation, and incompatible address-register widths.

Verification checks the lesson sequence as well as answers:

- All question banks validate; every course question ID resolves.
- Every concept has an explanation, example, practice and teach-back prompt.
- Prerequisites point backward; review tasks have already appeared; worked code and reference solutions use instructions introduced by that point.
- All 66 executable assembly worked examples execute against explicit expected states.
- All 103 code answers pass 355 supplied fixtures in the interpreter.
- The 253 guided-course assembly fixtures also run as native x86-64 programs.
- Separately compiled displayed C passes 225 fixtures across 57 functions, with undefined-behavior checks; the C promotion example independently produces 540 before narrowing and 28 afterward.
- The exact 10 displayed inline-C functions compile under four GCC optimization settings with warnings-as-errors and undefined-behavior checks; 136 checks pass. Native instruction/flag verification covers 1,527 cases.
- DOM integration exercises all 108 concepts and all 291 answer handlers, focused/chapter scope, navigation, persistence migration, traces, retries, imports and reset.

These checks do not prove every possible student program correct or measure learning gains. Full browser layout and mobile interaction inspection was unavailable in this environment; DOM behavior and rendered SVG inspection are separate checks, not substitutes for that review. The interpreter is an intentional integer-assembly subset. GDB, encoding, floating-point register families and GCC inline contracts have conceptual practice; native examples require GCC outside the browser. The counter-half recombination task does execute in the interpreter using supplied deterministic values. Neither a native toolchain nor a real timestamp counter runs in the browser.

## Educational review and bounded next improvements

The former jump from a chapter explanation to a complete translation is now much smaller. The strongest improvements are the explicit prerequisites, beginner state examples, visible reasoning, cumulative retrieval and teach-back prompts. The original practice style and execution-based grading remain useful.

The next priority is to test transfer and retention rather than add more topics:

| Priority | Short-term change | Acceptance check |
| --- | --- | --- |
| 1 | Add a ten-question mixed final set with feedback delayed until submission. Include translation, prediction, bug repair and explanation. | Students choose the applicable concept without a chapter title giving it away. |
| 2 | Add a blank-operand and a small modification variant for six difficult tasks before the independent version. | Each scaffold is removable; the final task still requires constructing the entire solution. |
| 3 | Add numeric prediction fields before tracing a load, swap, shift and call. | The student supplies the value or address before seeing the trace. |
| 4 | Pilot the first three chapters and the pointer/call transitions with a novice. | Record the first unexplained word, first incorrect prediction and first navigation obstacle; revise those exact points. |
| 5 | Add a small later-review queue with checked parameter variants. | Previously solved work can be attempted after a delay without changing its original progress history. |

These are proposed next increments, not features claimed to be implemented. The current course already supplies independent translation, explanation and review opportunities, but delayed mastery checks and learner testing would provide stronger evidence that the intended understanding has been achieved.
