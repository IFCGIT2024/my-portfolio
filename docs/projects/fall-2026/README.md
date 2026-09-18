# Fall 2026 practice hub

This directory is intentionally self-contained. `index.html` is the course hub and `quiz.html` plus `quiz.js` provide one shared quiz engine.

Each course owns one file in `data/`: `2115.json`, `2122.json`, `2134.json`, or `2141.json`.

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
