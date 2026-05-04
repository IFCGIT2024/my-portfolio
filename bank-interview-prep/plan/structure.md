# Structure Notes for Implementation

## How to Include This Content Without Breaking the Existing Framework

### Option A — Expand each data-mX.js file in place
Each module JS file gets much more HTML content added. Simple. Existing navigation all works. Risk: files become very large (50–100KB each).

### Option B — Add sub-sections with collapsible accordion sections
Within each module, add collapsible `<details>` sections or new accordion components for "Part 1 — Basics", "Part 2 — Core Concepts", etc. The current code content becomes a "Part 5 — Code Deep Dive" section. Clean UX.

### Option C — Add sub-navigation within each module
Each module gets its own internal tab system: [Concepts] [How It Works] [Code Examples] [Mini Projects] [Quick Reference]. The user can jump to the part they need.

### Recommended approach
**Option B (accordion sections) + Option C (tabs for the four main areas) combined.** This keeps each module manageable without losing depth.

---

## Content Priority Order for Implementation

| Priority | Module | Reason |
|---|---|---|
| 1 | Module 1 — SQL | Highest interview relevance |
| 2 | Module 4 — Classification | Core domain |
| 3 | Module 5 — Compliance | Most asked about in interviews |
| 4 | Module 2 — Python | Strong technical signal |
| 5 | Module 7 — AI/ML | Forward-looking, increasingly tested |
| 6 | Module 3 — Cloud | Important but less granular in interviews |
| 7 | Module 6 — DSPM Tools | Tooling knowledge, good differentiator |
| 8 | Module 8 — Projects | Full expanded versions last (most build time) |

---

## Implementation Approach per Module

Each module should be restructured as follows:

### Tab 1 — Concepts
The narrative explanation ("what is this and why does it exist at a bank?"). No code. Plain English. The through-line story is prominent.

### Tab 2 — How It Works
The technical detail — diagrams, tables, step-by-step processes. Architecture diagrams where relevant (can be ASCII art or styled divs).

### Tab 3 — Code Examples
All SQL/Python/code snippets. Syntax-highlighted. Copy button. "What this code does in plain English" explanation alongside each snippet.

### Tab 4 — Mini Projects
The 2–3 mini projects from each module's plan file. Each project presented as a structured task with clear deliverables.

### Tab 5 — Quick Reference
A summary card: key terms, key regulations, key formulas, key commands. Printable. Interview-ready.

---

## Accordion Section Approach (within each tab)

Where a tab has multiple major parts (e.g., the Concepts tab for Module 5 covers GDPR + DORA + BCBS 239 + PCI DSS + AI Act), use collapsible `<details>` elements so learners can navigate to what they need without scrolling.

```html
<details>
  <summary>Part 2 — GDPR Deep Dive</summary>
  <!-- full GDPR content here -->
</details>
<details>
  <summary>Part 3 — DORA</summary>
  <!-- DORA content here -->
</details>
```

---

## Technical Implementation Notes

- Do NOT use any external libraries or frameworks. Pure HTML/CSS/JS only.
- Tab switching: vanilla JS click handlers, same pattern as existing quiz tabs.
- Accordion: use native HTML `<details>`/`<summary>` elements. No JS needed. Supports keyboard navigation out of the box.
- All code blocks: wrap in `<pre><code>` with CSS class for syntax highlighting via a simple regex-based highlighter (or just `<pre>` with a monospace font and distinct background colour).
- The `window.MODULES` registry pattern stays — each `data-mX.js` file exports one `renderModule` function.
- Do NOT change `index.html`, `app.js`, or `styles.css` for content changes. Add new CSS classes to `styles.css` only.

---

## State Management

The existing `dga_completed_<name>` localStorage key stores completed modules. When a module is expanded into tabs/accordion, the mark-complete button should remain at the module level (not per-tab). No change needed to the completion logic.

---

## Content Fidelity

All content in `data-m1.js` through `data-m8.js` must be sourced from the corresponding `plan/0X-*.md` file. Do not invent content. Do not simplify content below the level in the plan files. The plan files have been reviewed and corrected — they are the authoritative source.
