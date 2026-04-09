
# Session Notes

## ACTIVE TASK: Building CSCI 1120 Exam Practice Website

### Current Work (Updated: 2026-04-09)
- PDF extraction and module conversion paused (attachment/upload issues)
- Completed markdown extraction for:
	- Module 7 (Binary Search Trees)
	- Module 8 (Heaps)
	- Module 10 (Graphs)
- PDF splitting utility and "PDF too big" web app created for easier uploads

### Status
- Waiting to restart PDF extraction process for remaining modules (6, 9, Final Exam)
- Will use new tools/workflow for next attempt

## Project Files
- Main practice site: `csci 1120 prac websiute/` (index.html, script.js, style.css)
- Questions: `questions.json`, `questions5.json`
- Output: `_output/` (for generated markdown/JSON)
- Intake: `_intake/` (for source PDFs/materials)
- PDF splitter: `pdf-splitter/`

## Next Steps
1. Restart PDF extraction for Module 6, 9, and Final Exam
2. Extract questions and format to JSON
3. Update the practice website with new questions
4. Test the site

## Notes
- No servers needed — everything is static
- Use relative paths for all assets
- Question format: `{ "id": int, "question": str, "options": [str,str,str,str], "correct": int, "section": str }`

---

## Session Update (2026-04-09)

### Completed
- Created a fully isolated CSCI 2110 practice site at `csci-2110-practice-site/`
- Implemented standalone quiz app files:
	- `csci-2110-practice-site/index.html`
	- `csci-2110-practice-site/style.css`
	- `csci-2110-practice-site/script.js`
- Added separate module question banks using the same MCQ JSON structure:
	- `csci-2110-practice-site/data/questions7.json` (BST content from Module 7 notes)
	- `csci-2110-practice-site/data/questions8.json` (Heap content from Module 8 notes)
	- `csci-2110-practice-site/data/questions9.json` (Hashing/graph basics from practice test notes)
- Added the 2110 site to the main portal registry in `projects.js`
- Enhanced `pdf-splitter/` with optional max file size per output part
- Added `pdf-splitter/` to the main portal registry in `projects.js`
- Added max-size quick presets in `pdf-splitter/` (2, 5, 10, 15, 20, 25 MB)
- Added CSCI 2110 Module 6 bank in `csci-2110-practice-site/data/questions6.json`
- Registered Module 6 in `csci-2110-practice-site/script.js`
- Rebuilt Module 9 bank from visual notes file:
	- `csci-2110-practice-site/data/questions9.json`
	- Updated module label to `Module 9 - Hashing and Hash Tables`
- Applied mobile hardening updates to:
	- `New folder (4)/site/style.css` (Discrete Math course)
	- `csci-2110-practice-site/style.css`

### Why This Was Done
- User requested a separate site so CSCI 1120 and CSCI 2110 do not interfere.
- New 2110 app is isolated by folder and data files; no existing 1120 files were modified.

### Next Steps
1. Review and expand questions in `csci-2110-practice-site/data/*.json` using full Module 9/10 material.
2. Add additional modules by creating new JSON files and registering them in `csci-2110-practice-site/script.js`.
3. Fine-tune card text/tags in `projects.js` if needed.
4. If needed, expand 2110 banks with additional modules and more practice-test variants.
5. Continue adding higher-volume Module 6/7/8/9 questions from intake notes.

---

## Session Update (2026-04-09, Consistency Pass)

### Completed
- Updated `csci-2110-practice-site/script.js` to enforce normalized question structure at load time:
	- trims/cleans text fields
	- enforces exactly 4 options per question
	- validates/corrects `correct` index into range `0..3`
	- guarantees numeric/unique IDs for loaded banks
	- ensures module/section fallback values are always present
- Updated quiz assembly in `csci-2110-practice-site/script.js` to use section-balanced ordering
	- prevents heavy clumping of one section/type
	- improves overlap distribution for mixed practice sets
- Harmonized one Module 7 outlier section label in `csci-2110-practice-site/data/questions7.json`
	- `Tree Terms` -> `BST Fundamentals`
- Validation check run:
	- no errors in `csci-2110-practice-site/script.js`
	- no errors in `csci-2110-practice-site/data/questions7.json`

### Why This Was Done
- User requested a consistency pass so practice exam/question pools have a normal structure and better overlap across question types.

### Next Steps
1. Optionally align section labels across `questions6.json`, `questions8.json`, and `questions9.json` to a tighter shared taxonomy.
2. Add a lightweight admin/debug view to show per-quiz section distribution counts.
3. Continue expanding question pools while preserving normalized schema.
