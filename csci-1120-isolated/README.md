# CSCI 1120 Isolated Practice Site

This folder is a standalone quiz website for CSCI 1120.
It is intentionally isolated so changes here do not affect other websites in this repository.

## Files

- index.html: isolated UI shell
- style.css: isolated styles
- script.js: isolated quiz logic
- data/questions.json: Module 4 question bank
- data/questions5.json: Module 5 question bank

## JSON Structure

Top-level object:

{
  "questions": [ ... ]
}

MCQ question schema:

{
  "id": 1,
  "module": 5,
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "section": "Section Name"
}

Notes:
- `module` can be omitted for Module 4 compatibility.
- `correct` uses zero-based indexing.
- Keep exactly four options for MCQ questions.

## Safe Editing Rule

Only edit files inside this folder if you want to change this isolated website.
