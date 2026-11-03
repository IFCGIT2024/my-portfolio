# Context-Free Languages Lab

A self-contained CSCI 2115 learning path from language notation to grammars, parse trees, pushdown automata, grammar-machine conversions, and non-context-free proofs. Every lesson opens with a connection to the earlier material and explanations of the notation needed for its first example. Worked examples supply their starting grammar or machine; full trace solutions separate expansion, matching and acceptance. Each lesson closes with the idea carried into the next lesson. Advanced extensions and the cumulative review are optional.

The interface follows the portfolio's Assembly Lab: searchable navigation, a clear reading surface, complete worked examples, one-step controls, saved written practice, and independent transfer problems.

The course contains 24 lessons, 118 worked steps, 64 guided problems, 24 understanding checks and 24 independent problems. Six supplied slide decks (144 pages) informed the scope. A complete PDF-page coverage map is available in `coverage.html` and `data/coverage.json`. Fresh examples and prerequisite explanations make the lessons usable without the source slides. The uploaded source PDFs are not redistributed.

## Learning and progress

Written solutions require comparison and reasoning; the site does not automatically grade proofs or claim mastery. Reading bookmarks and self-assessed readiness are separate. Notes and progress are stored in the current browser only.

The workbench builds leftmost derivations and parse trees, traces specific deterministic PDAs or a grammar-derived NPDA, and inspects pumping decompositions. Its nondeterministic search is bounded and reports an inconclusive bound separately from rejection. Every tool states its model and acceptance convention. Empty-stack deterministic examples use an explicit end marker.

## Files and checks

`data/lessons.json` holds the lessons separately from the interface. `tools.js` contains the teaching tools and pure functions used by the tests. Serve this directory over HTTP to preview it; no build step or external dependency is required.

Run:

```sh
node tests/tools.test.cjs
python3 tests/content_check.py
```

The tool tests compare small-input machine behavior with independent predicates and enumerate legal pumping splits for selected witness lengths. Such finite checks supplement the mathematical arguments in the lessons.
