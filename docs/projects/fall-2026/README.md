# Fall 2026 practice hub

This directory is intentionally self-contained. `index.html` is the course hub and `quiz.html` plus `quiz.js` provide one shared quiz engine.

Each course owns one file in `data/`: `2115.json`, `2122.json`, `2134.json`, or `2141.json`.

CSCI 2122 also has a separate A1 bank at `data/2122-a1.json`, opened with
`quiz.html?course=2122&quiz=a1`. The hub and the 2122 quiz navigation link to it.
The general 2122 bank remains separate. A1 contains 83 questions across 18 topics;
IDs 9–91 retain their correspondence with the supplied source questions.
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

## A1 question review — 2026-10-14

Reviewed all 83 imported questions and their answer keys. Clarified C17, ASCII,
32-bit int, non-negative masks, and the subset-only word-composition rule.
Questions that depended on an unseen source file now give the relevant code or
use the shared background. The assignment PDF and original `spellbee/main.c`
were not supplied with this bank; assignment-specific rules are presented as
the study examples' assumptions, not independently verified assignment text.

Corrections include string capacity (`MAX_LEN - 1` plus the terminator),
signed-shift preconditions, undefined over-width shifts, the scope of `const`,
`scanf` argument mismatches and EOF behavior, automatic storage versus a
guaranteed stack, and `strdup` failure and C17 portability. Removed the incomplete
comparison with NYT Spelling Bee rules and unqualified speed claims.

References used for C semantics:

- [WG14 N1570](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf), especially 6.2.4, 6.3.2.1, 6.5.7, 6.7.3, and 7.21.6.2.
- [POSIX strdup](https://pubs.opengroup.org/onlinepubs/9699919799/functions/strdup.html).

Validation covered JSON schemas, unique IDs/prompts/options, answer-index ranges,
compiled C examples (numeric masks, population counts, subset counts, and output),
and the actual quiz script in a DOM test harness: all 83 answers with shuffling
on/off, topic filtering, empty selections, incorrect answers, scoring, retry,
original course routes, invalid routes, and failed bank loads.
