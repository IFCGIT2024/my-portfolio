# Fall 2026 practice hub

This directory is intentionally self-contained. `index.html` is the course hub and `quiz.html` plus `quiz.js` provide one shared quiz engine.

Each course owns one file in `data/`: `2115.json`, `2122.json`, `2134.json`, or `2141.json`.

## CSCI 2122 C recall (A2 section) — 2026-10-24

`a2-recall.html` is a separate C quiz preparation section linked from the Systems
Programming card as **A2 · C recall**. The route and section label organize the
course material; every prompt is fully self-contained. Practice targets C
variables and types, formatted I/O, pointer and array behavior, allocation,
integer representations, masks and shifts, bounds, connected traces, and small
functions. Questions provide their own code, values, and conditions. They do not
require memorizing an assignment description, packet format, decoder program,
named helper, or walkthrough.

The bank is `data/2122-a2-recall.json`. The supplied Assignment 2 material informs
the selection of C concepts, not the facts that students are asked to recall.
Student-facing prompts and references teach the C concepts directly; no source
PDF is required or republished. Lab 5 remains outside this section's scope.

Practice progresses through four cumulative stages: facts, syntax, connected
traces, and functions. Focused rounds retain topic cues; mixed rounds hide them until the
answer is committed. Later stages reserve space for their most advanced
available questions while including earlier material. Rounds contain up to
10, 20 or 40 distinct prompts, depending on the selected pool.

Integer and constrained-token answers are checked automatically. Expressions,
explanations, and full functions use a committed draft, model answer, explicit
rubric, and self-rating. A different valid exact answer can be self-checked
without receiving automatic correctness credit. The page never compiles or
executes student code. Hints, opened references, and reveals are recorded
separately from independent recall; invalid numeric input consumes no attempt.

Due review operates on skill families, preferring another prompt for the same
skill when available. A successful review starts at one day and can grow to
3, 7 and 14 days after further successes at least 24 hours apart. Quick repeats
do not extend the interval. Misses, partial answers, assistance and reveals
return after ten minutes and reset spacing. Empty due rounds stay empty.
Delayed-recall counts require automatic independent successes at least 24 hours
apart; self-checks are never folded into that evidence. These intervals are a
transparent practice heuristic, not a validated adaptive model or mastery score.

Progress, drafts and feedback save to `csci2122-a2-recall-v1`. Export/import and
reset affect only this section. Imports validate question revisions and session
phases; incompatible content drops stale records or the saved round. Aggregate
counts persist, while detailed history retains at most 5,000 attempts and about
one million serialized characters. Drafts are limited to 12,000 characters.
The buildless page has no runtime dependencies or network service for answers.

Content distinguishes C guarantees from the stated practice machine. Examples
use properly typed formatted-input arguments, distinguish allocation byte counts
from element counts, respect bounds and shift widths, and handle signed bit
patterns without overflowing signed integers. Any custom bit-field order, width,
or function contract is given in the question itself. Visible practice assumptions
provide necessary context without revealing the rule being tested.

Validation:

```sh
node --test docs/projects/fall-2026/tests/*.test.cjs
python docs/projects/fall-2026/tests/a2-verify.py
```

The A2 core and controller tests cover grading boundaries, hints and self-checks,
nonduplicated scoring, saved drafts, reloads, malformed backups, empty due rounds,
variant selection, delayed evidence, and storage/load failures. C model-answer
checks compile helper functions with strict C17 warnings and undefined-behavior
sanitization, and compare them with independent bit-string oracles.

## CSCI 2122 full-pass trainer — 2026-10-19

`drill.html` complements the quick `basics.html` drill within the same hub section.
Its 79 focused types cover single-bit and single-digit foundations, all six byte
conversion directions, all signed byte values, signed/unsigned reinterpretation,
two's-complement negation, bitwise truth tables and byte pairs, unique-operator
inference, masks, logical and arithmetic shifts, C unsigned shifts, logical
operators, type sizes, ranges, ASCII, unsigned-char conversions and pointers.

Both trainers include an **Upper four bits** shortcut. These six conversion
directions cover all 16 unsigned byte patterns with the low nibble fixed at zero:
0, 16, 32, …, 240. Binary is grouped as `1010 0000`; feedback expands the high
weights (128 + 32 = 160). Each direction completes all 16 patterns before repeating.

Each type has a finite domain; an affine permutation visits every member exactly
once per pass with constant-sized saved deck state. Ordered mode walks the domain
in increasing index order (signed encoders start at −128). Mixed mode rotates
evenly through selected types. Choose endless, 25, 100, 256, or a complete focused
pass. Typed answers and multiple choice are available; definitions use choices.

Sessions save the current question, input, grading state, choice order, deck
positions and score in `csci2122-rapid-drill-v1`, separate from the quick drill.
Misses and reveals enter an exact-question review queue. A correct answer clears
that question; wrong review answers remain for another review round. Topic totals
persist across sessions. Optional automatic advance is off by default and stops
on a miss, pause, manual navigation, or hidden tab. Questions and input render as
text, never HTML. No server or runtime dependency is needed.

All byte arithmetic, character encoding and implementation-size assumptions are
explicit. Type sizes use the documented practice model, not universal C sizes.
The 8-bit shift model is separate from C's promoted 32-bit unsigned expressions.

Validation:

```sh
node --test docs/projects/fall-2026/tests/drill-core.test.cjs docs/projects/fall-2026/tests/drill-ui.test.cjs
```

The core tests exhaust all byte conversions and signed values, all AND/OR/XOR
byte pairs, all inverse-operation questions, all byte shifts and mask operations,
and full domain coverage in both orders. The controller harness checks full
256-question sessions, typed and choice answers, input rejection, review,
pause/resume, persistence, timer cancellation and storage failure. The harness
does not claim visual browser verification.

## CSCI 2122 rapid basics drill — 2026-10-19

`basics.html` is linked from Systems Programming on the hub and from the general,
A1, and midterm navigation. It opens immediately on 8-bit binary → decimal.
`basics-core.js` generates and grades questions; `basics.js` controls the page.
No build step, server, dependency installation, or fixed numeric question bank is needed.

Eleven topic groups cover conversions in six directions plus single hex digits,
two’s-complement binary/hex reading and encoding, bits/bytes/weights, type sizes
and limits, bitwise operations, logical operations, shifts, masks, signed/unsigned
chars and extension/truncation, and one-step pointer reads/writes. The operator
inference questions show two hex operands and a binary result; generated
operands guarantee exactly one matching AND/OR/XOR answer. Optional input/output
base selectors apply to pattern operations, so the same operation can be drilled
with binary, hex, or unsigned-decimal values.

Focus on one skill, mix a topic, or rotate through all topics. Rounds support 10,
25, 100, 256, or endless questions. Binary, hex, and decimal answers are typed;
definitions and operator inference use choices with 1–4 keyboard shortcuts.
Enter checks a typed answer; the focused Next button continues after feedback.
Hints, brief explanations, accuracy, streaks, and a repeat-until-correct missed
review support repetition. Revealing an answer counts as a miss. Invalid input
does not count as an attempt. Correct answers in either mode clear matching misses.

For conversions, two’s complement, and char exercises, each focused value pass
visits every pattern once before starting again. Eight-bit passes include all 256
unsigned values and all signed values −128…127; single-hex-digit passes include
all 16 digits. An odd-stride permutation modulo 2^n guarantees coverage with a
small cursor rather than a stored bank. Pass progress counts questions **shown**,
not mastered; missed review handles errors. Local storage saves settings, pass
positions, and missed questions; round scores restart. Storage failure never
blocks practice. Nothing is sent to a server. Mixed modes use shuffled bags of
topics/skills/definitions so they rotate evenly.

Pattern widths are 4/8/16 bits; byte/char exercises explicitly use 8 bits and
extension asks for 16. Definitions distinguish the fixed-width bit model from C17
integer promotions and implementation-defined negative signed right shift.
The practice machine assumes 8-bit bytes; char/short/int/long sizes 1/2/4/8 bytes
(matching Lecture 5’s Timberlea examples), long long 8, float 4, double 8, and
object pointers 8. These are labelled assumptions, not universal C guarantees.
Plain-char signedness is never silently assumed. Type facts and references are
available in the expandable quick reference. No copyrighted lecture PDFs are
published with this addition.

Validation:

```sh
node --test docs/projects/fall-2026/tests/basics-core.test.cjs docs/projects/fall-2026/tests/basics-ui.test.cjs
```

Checks exhaust all byte conversions and signed interpretations, every byte pair
for AND/OR/XOR against bit-by-bit truth tables, all byte masks and 1–3-place
shifts, every value-pass generator across save/resume, unique operator inference,
all representation pairs, pointer/char questions, parsing, scoring, missed review,
round completion, keyboard selection, persistence, and storage failure. The UI
suite runs the real controller in a DOM harness; it does not verify rendered layout.

CSCI 2122 also has a separate A1 bank at `data/2122-a1.json`, opened with
`quiz.html?course=2122&quiz=a1`. The hub and the 2122 quiz navigation link to it.
The general 2122 bank remains separate. A1 contains 160 newly written questions
across 16 numbered topics (10 per topic), with stable IDs `C001`–`C160`.
The optional `context` array supplies background available during setup and practice.

Question format:

```json
{
  "id": 1,
  "question": "Question text?",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "section": "Topic name",
  "explanation": "Why the answer is correct."
}
```

`correct` is zero-based: `0` is the first option, `1` the second, and so on. File names may be changed only if the corresponding `fetch` path or course mapping in `quiz.js` is updated and tested at the same time.

## A1 concept rebuild — 2026-10-14

The previous 83 assignment-dependent items were replaced in full. The learning
target is transferable C knowledge: choose syntax, evaluate an expression, trace
a short independent program, or identify a precise error. No question requires
the original assignment program, dictionary rules, or named helper functions.

The progression is values/types → bitwise/logical operators → shifts → reading
bits/fields → setting/clearing/toggling → sets → precedence → loops → functions
→ pointers/const → arrays → strings/characters → input → output/headers/macros
→ allocation/lifetime → combined problems. Each section includes basic checks
and applications or edge cases. Distractors model errors such as confusing an
index with a weight, testing any vs all, reversing a subset, losing a terminator,
or confusing pointer reassignment with modification through a pointer.

The answer key has 40 correct answers in each slot, with a non-repeating shuffled
distribution. Answer shuffling remains enabled by default. A1 additionally
defaults to topic order and offers random review. Selecting fewer than all
questions in topic-order mode uses the first selected questions; choose a topic
or random review to focus or sample differently.

Optional question fields:

- `code`: displayed verbatim in an escaped, wrapping monospace block.
- `optionFeedback`: explanations keyed by original A–D positions, used for
  selected misconceptions and still mapped correctly when choices are shuffled.
- `verification`: marks a defined, runnable C output example and supplies its
  standard input for validation; never shown as part of the question.

Assumptions are stated in the practice notes: C17, ASCII, 8-bit bytes, 32-bit
int/unsigned int, and INT_MAX = 2147483647. Questions about what the standard
guarantees explicitly suspend machine-specific assumptions. Negative signed
right shift is distinguished from undefined signed left shift and invalid
shift counts. Undefined-behavior examples are discussed, never executed by the
validation tools.

Reference: [WG14 N1570, public C11 committee draft](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf).
The relevant rules carried into C17 include storage duration (6.2.4), integer
promotions and array conversion (6.3), shifts and bit/logical operations (6.5.7–14),
qualifiers and parameter adjustment (6.7), macro replacement (6.10.3), allocation
(7.22.3), formatted I/O (7.21.6), and string operations (7.24).

Validation commands (Python 3, GCC, and Node required; no npm dependencies):

```sh
python docs/projects/fall-2026/tests/validate-a1.py
python docs/projects/fall-2026/tests/validate-a1-expressions.py
node --test docs/projects/fall-2026/tests/quiz-engine.test.cjs
```

The checks cover all 160 records, 66 compiled output examples with undefined
behavior instrumentation, all four choices of 22 mask-expression questions
(60,404 candidate evaluations against independent bit/set oracles), and the
actual shared quiz script in a DOM harness. UI checks cover every A1 answer with
choice shuffling on/off, ordered/random practice, topic filters, wrong answers,
feedback mapping, scoring, retry, other course routes, and failed bank loads.
The DOM harness is a logic check; it does not substitute for visual browser QA.

## CSCI 2122 midterm review — 2026-10-15

Open `midterm.html` from the hub or the CSCI 2122 navigation. The dedicated
controller keeps the written-response workflow separate from the existing
immediate-feedback quiz engine. It uses `data/2122-midterm.json`, generated by
`scripts/build-midterm.py` without external Python dependencies.

The supplied five-page **SampleQuestionsF26.pdf**, titled *CSCI 2122 Practice
Questions for Mid-Term* (Dalhousie University Faculty of Computer Science), has
21 questions: 18 four-option MCQs, a two-part memory-state trace, and two C
implementation tasks. Each group in the JSON has its original and ten new
variants: **231 records = 21 originals + 210 variants**. Original choices retain
their order; formatting and punctuation are normalized for web display. The PDF
contains no answer key. All keys, explanations, clarifications, model solutions,
and variants in this review are independently authored, not instructor-endorsed.

### Assessment blueprint

| PDF question | Competency | Required response and variant design |
| --- | --- | --- |
| 1 | Data versus interpretation context | Select a precise conclusion about formats, encodings, or instruction sets. |
| 2 | Memory hierarchy | Select an ordering of four Roman-numbered storage levels; vary direction and cache levels. |
| 3 | Pointers and formatted output | Predict output or identify a type/format problem; aliases, copies, indirection, and increment precedence. |
| 4 | Array and pointer validity | Select the complete set of valid independent statements; const, array pointers, null constants, one-past bounds. |
| 5 | Hexadecimal to binary | Select a full 32-bit representation; preserve leading zeros and distinguish byte reversal. |
| 6 | String-input capacity | Select the character count after accounting for a terminator, field width, and interior buffer offsets. |
| 7 | Nibble extraction | Evaluate a shift-and-mask function call; include both end nibbles and zero-valued fields. |
| 8 | Sign, parity, endianness | Select the sign/parity pair under explicit width and representation assumptions. |
| 9 | Multiple bit interpretations | Identify the value not represented under unsigned, sign-magnitude, or two’s complement. |
| 10 | Sign extension | Select the widened pattern preserving the signed value, including positive and boundary patterns. |
| 11 | Information lost by shifts | Select a value making a shift/reconstruction comparison true; vary shift, equality, and zero cases. |
| 12 | Masked-field extraction | Evaluate fields crossing nibble or byte boundaries, including an unaligned six-bit field. |
| 13 | Two’s-complement decoding | Select a signed decimal value at an explicit width; include minimum, minus one, and positive patterns. |
| 14 | Negation and promotions | Select a self-negating value or negation result; distinguish wrapping bit models from actual C. |
| 15 | Signed/unsigned comparisons | Select the value satisfying a comparison after promotions/conversions; vary suffix and relation. |
| 16 | Narrowing/widening | Predict printed output under explicit signedness and conversion assumptions. |
| 17 | Packed-bit indexing | Select the mask, or byte-index/mask pair, especially at byte boundaries. |
| 18 | Linked-list contracts | Select the most precise function name; node identity versus value, counts versus Booleans, head/tail/empty. |
| 19 | Memory-state tracing | Write two complete states: array values plus pointer address/index; include `*p++`, `(*p)++`, and one-past. |
| 20 | String traversal | Write a recognizable C function; termination, bounded scans, suffixes, counts, empty strings, and NULL contracts. |
| 21 | Byte-wise writes | Write a recognizable C function; exact ranges, zero size, reverse traversal, byte conversion, return pointers. |

Numeric variants preserve the original calculation/choice format. Structural
variants change the direction of reasoning or the function contract while
retaining the assessed skill. Distractors reflect specific mistakes: reversed
byte order, missed terminators, off-by-one indices, incorrect extension,
pointer/value confusion, or omitted integer conversions. The 180 new MCQs have
45 correct answers in each stored position, with an irregular fixed-seed order.
Runtime option shuffling is available for new questions only.

### Clarifications to the sample paper

Originals remain selectable, with visible notes where needed:

- Q1 lacks enough information to conclude an object file is uninterpretable.
  Its conditional intended answer assumes the target format/ISA cannot be
  identified from metadata. New variants cover identifiable metadata too.
- Q3 passes a pointer to `%d`: undefined behavior, not a guaranteed compilation
  failure or predictable address printout.
- Q4 asks about assignment validity; its uninitialized automatic pointer would
  make evaluating the self-assignment unsafe without an initialization premise.
- Q5 preserves the malformed-width distractor. Q6 preserves and explains its
  missing semicolon/typographical quotes; Q11 has a stray bracket; Q12 spaces a
  hexadecimal literal. The intended capacity/expression is made explicit.
- Q7 requires stated signed-conversion/right-shift assumptions. Q8 and Q10 use
  explicit two’s-complement widths; Q13 requires exactly 12 bits.
- Q14’s eight-bit wrapping negation is an abstract bit model. Ordinary C17
  promotes an 8-bit signed char to int before negation on the stated machine.
  Q15 explains both the paper’s small-width model and actual C conversions.
- Q16 depends on plain-char signedness and implementation-defined narrowing;
  the low-byte, signed-char interpretation is explicitly assumed.
- Q20 and Q21 use the paper’s simplified signatures rather than the standard
  library declarations. Tests rename these teaching functions to avoid clashes.

The relevant C rules are in [WG14 N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf),
especially 6.3.1.1/6.3.1.3 (promotions/conversions), 6.3.2.1 (arrays/lvalues),
6.5.6–7 (pointer arithmetic/shifts), 7.21.6 (formatted I/O), and 7.24 (strings).
Undefined examples are explained but never executed in validation.

### JSON and application behavior

The top-level schema contains `schemaVersion`, `source`, `assumptions`, `groups`,
and `questions`. A group has `id`, `sourceQuestion`, `title`, `competency`,
`responseType`, and `review` recommendations. Every question has a stable ID
(`M01-O`, `M01-V01` … `M21-V10`), group, origin, source page/question, variant
number, prompt, and explanation. Additional fields depend on response format:

- `mcq`: four `options`, zero-based `correct`, optional `code`/`statements`/`note`.
- `trace`: numbered `code`, `initialMemory`, two `parts` with model states,
  `rubric`, and explicit address/element-size assumptions.
- `code`: function signature in `code`, `modelAnswer`, `rubric`, and a contract.
- `verification`: development-only oracles/cases; never shown as exam hints.

A full test samples exactly one question from every group in PDF order. Source
modes are variants only, originals plus variants, or all originals. Focus mode
samples one selected group. Generation avoids the immediately preceding item
in each group when alternatives exist. It does not promise complete exhaustion
before repeats. Test answers and model solutions appear after submission.

MCQs are scored automatically; blanks count as incorrect. Written work remains
ungraded until the learner compares it with model solutions and records a
self-assessment. No user code is executed and no approximate string matching is
used as a correctness judgment. The two-part trace counts as complete only when
both parts have a response. The final guide prioritizes missed, incomplete, and
partly understood groups, while retaining the full 21-topic overview and buttons
to sample fresh questions from topics requiring review.

One attempt (including responses, choice order, rubric checks, and ratings) is
saved to this browser’s local storage. A fresh test replaces it. Disabled storage
is reported without blocking the current session. The bank is public static
JSON; this is a study aid, not a secure examination system.

### Validation

```sh
python docs/projects/fall-2026/scripts/build-midterm.py
python docs/projects/fall-2026/tests/validate-midterm.py
node --test docs/projects/fall-2026/tests/midterm-core.test.cjs docs/projects/fall-2026/tests/midterm-ui.test.cjs docs/projects/fall-2026/tests/quiz-engine.test.cjs
```

Checks cover all records and numeric keys, all new statement-validity choices,
64 compiled C programs with undefined-behavior instrumentation, 235 linked-list
cases, 52 written-implementation cases, and every trace step. Conceptual and
deliberately undefined questions require manual review. The core tests generate
300 full papers and check coverage, source filtering, option mapping, scoring,
targeted retries, and restored sessions. The DOM harness renders and answers all
231 questions through the actual controller, including written work, review,
self-rating, navigation, incomplete submissions, load/storage failures, and
literal rendering of code-like user input. Shared-engine regressions cover A1
and all other course routes. Browser inspection supplements these logic checks.
