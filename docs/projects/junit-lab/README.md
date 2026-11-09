# Java Testing Lab

A progressive, static Java and JUnit Jupiter course in the portfolio. Open `index.html` through an HTTP server. The course has 30 lessons, 124 practice tasks, a 16-pattern syntax workshop, a coverage explorer, mixed practice, and a runnable Java project.

## Intended outcome

Given an unfamiliar Java method and its contract, the learner can construct a valid call, choose a meaningful case, derive the expected observation, write a compiling JUnit test, interpret its result, and justify a diagnosis with evidence.

The learner-facing **What you will be able to do** page maps the competencies to observable evidence and lessons. The sequence makes typing and contracts prerequisites for test syntax, and reliable single tests prerequisites for suite design and diagnosis.

| Lessons | Competency built | Evidence of performance |
| --- | --- | --- |
| 01–04 | Read Java types, calls, objects, and execution | Construct suitable arguments; trace values, decisions, and returns; distinguish compilation from execution. |
| 05–06 | Extract a testable contract | State initial conditions, exact inputs, expected results, state changes, and documented exceptions without inventing requirements. |
| 07–10 | Write and interpret a complete JUnit test | Supply imports, class, annotation, valid method, fixture, action, and suitable assertion; interpret compiler errors, assertion failures, and unexpected exceptions. |
| 11–15 | Design black-box tests and test ADTs | Identify partitions, boundaries, null/empty distinctions, operation sequences, equality, identity, and ordering from a public contract. |
| 16–18 | Design white-box tests | Trace short-circuit conditions, branches, loop counts, paths, and definition/use relationships; explain coverage limits and redundant cases. |
| 19–22 | Understand and test exceptional control flow | Trace throw/catch/finally; distinguish throw and throws; write narrow exception tests and appropriate validation. |
| 23–27 | Diagnose and record defects | Give a revealing input, explain expected versus actual behaviour, inspect invariants, repair faulty tests, and produce a reproducible report and regression check. |
| 28–30 | Transfer across unfamiliar problems | Select a technique without a lesson cue, design tests from comments, review implementation and tests together, and justify a complete answer. |

## Learning design

Each lesson supplies an explicit goal, prerequisite links, a bridge from the preceding ideas, a complete worked example, a step-by-step explanation, short recognition practice, written practice, a teach-back prompt, and a bridge to the next idea. Worked examples can be viewed whole or one step at a time.

An exercise must use concepts already explained before that exercise, or provide and explain the additional API or scaffolding it needs. Early complete examples preview the whole task while identifying which syntax is supplied for now. Transfer tasks change the situation while retaining the skill just practised. The syntax workshop follows prerequisite order and links to the relevant lessons; whole-course mixed practice is explicitly identified as cumulative.

There are **61 automatically checked choice tasks and 63 written tasks**. Written tasks ask for tests, repairs, traces, diagnoses, case tables, or explanations. Every written task includes a model answer and specific review criteria. Every objective option has explanatory feedback. The 30 additional teach-back prompts and 16 syntax patterns are separate from the 124-task count.

Mixed practice samples six objective and six written questions, hides lesson titles and help until submission, and reports an objective score separately from written self-review. Prompts carry their own method signatures, contracts, or setup rather than relying on a preceding lesson. Practice mode can filter by lesson, unattempted work, missed/reviewed choices, or written work.

The examples are general-purpose teaching material and do not depend on a particular source exercise or assignment.

## Feedback boundaries

- Written Java and prose are **not compiled or automatically graded in the webpage**. The learner compares against criteria and can compile Java in the downloadable project.
- The syntax workshop checks tokens in the missing pieces of a displayed, fixed example. It is not a general compiler. Whitespace inside a String or identifier is not silently removed.
- The coverage explorer evaluates one shown Boolean expression and distinguishes decision outcomes from independently evaluated condition outcomes, including short-circuit skips. Its percentages do not establish correctness.
- Reading, confidence, historical unaided successes, latest answer status, and written self-review are distinct. Editing a reviewed answer clears its current review mark.
- A repeated correct answer after feedback is recorded as reviewed. A later mistake remains visible even when the question was previously solved independently.

## Files and maintenance

| File | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Responsive shell, navigation, layout, and typography matching the portfolio's existing learning courses. |
| `app.js` | Lesson rendering, practice modes, feedback, navigation, and progress UI. |
| `core.js` | Grading, state normalization, mixed selection, and coverage calculations. |
| `pages.js` | Outcomes, syntax reference, project guide, and official source links. |
| `workbench.js` | Bounded syntax exercises, coverage explorer, and defect report builder. |
| `data/lessons-*.json` | The 30 lessons and their practice content. |
| `practice-project/` | Java sources, real JUnit tests, intentionally faulty challenges, separate solutions, and setup instructions. |
| `practice-project.zip` | Downloadable copy of that folder, rooted at `java-testing-practice/`. Rebuild it if project files change. |
| `tests/core.test.cjs` | Checks for grading, corrupted progress, answer status, short-circuit coverage, mixed selection, syntax checking, and curriculum structure. |

No build step, external JavaScript library, application server, login, or network grading service is required. Serve the files over HTTP because lessons load with `fetch`. The only outbound links are normal portfolio navigation, official documentation, and setup instructions for the Java tools.

Progress and drafts use `localStorage` key `java-testing-lab-v1`. Export/import is available on **Sources & saved progress**. Data is not sent to a server or synchronized between devices. Import replaces this course's saved record. Invalid JSON is handled without preventing access to the course.

## Validation

From this directory, run the application logic tests:

```sh
node --test tests/core.test.cjs
```

The runnable Java project targets Java 11+ syntax and JUnit Jupiter 5.10.5. Its README documents Maven, IDE, shell, and PowerShell workflows. The initial reference suite contains **40 active tests and one explicitly disabled writing placeholder**. The separate fault-finding suite contains six tests that expose the six intended defects; five produce assertion failures and one exposes an unexpected null dereference. All six pass against corrected implementations.

Before publication, the complete worked test classes and executable lesson examples were checked with Java/JUnit, including the intended compiler errors, incorrect assertions, and false-passing tests. All 16 completed workshop patterns and their three alternative completions compiled and passed. The application logic suite passed, and browser review covered desktop and 390px layouts, lesson navigation, step controls, feedback, draft persistence, self-review invalidation, syntax checking, coverage, and mixed submission.

Use the official Java and JUnit references linked in the course when changing technical claims. Preserve the distinction between a deliberately invalid example, a complete executable example, and a fragment that explicitly assumes surrounding setup.
