# Fall 2026 practice hub

This directory is intentionally self-contained. `index.html` is the course hub and `quiz.html` plus `quiz.js` provide one shared quiz engine.

Each course owns one file in `data/`: `2115.json`, `2122.json`, `2134.json`, or `2141.json`.

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
