# Copilot Instructions – Portfolio & Study Sites

## Start of Every Session
1. Read `SESSION_NOTES.md` in the repo root to understand what was last worked on and what's next.
2. Briefly confirm to the user what the current state is and what the next steps are.

## End of Every Session (or when asked to wrap up)
Update `SESSION_NOTES.md` with:
- What was done this session
- Any files that were changed and why
- Clear "Next steps" section so picking up is instant

## This Project
This is a GitHub Pages portfolio site. The site root for deployment is `docs/`.
- `docs/index.html` + `docs/portal.css` + `docs/projects.js` = the main portfolio page
- `docs/projects/` = individual project subfolders
- Never use root-absolute paths (e.g. `/assets/...`). Always use relative paths.
- No local servers. All testing is done by pushing to GitHub Pages or inspecting static files.

## What This Workspace Is For
- Building and improving the portfolio site
- Creating new study guide websites (HTML/CSS/JS, static, GitHub Pages compatible)
- Adding new projects to the `docs/projects/` folder and registering them in `docs/projects.js`

## Coding Style
- Plain HTML, CSS, and vanilla JavaScript only unless a CDN library is explicitly requested
- Keep files self-contained where possible
- Relative paths only for all assets

## Question Generation Pipeline
- Slides/PDFs go in `_intake/`
- Generated question JSON files go in `_output/`
- The prompt template is at `pipeline/PROMPT_TEMPLATE.md`
- Questions follow this exact schema: `{ "id": int, "question": str, "options": [str,str,str,str], "correct": int, "section": str }`
- When wiring up a new question set, copy the JSON into the relevant `docs/projects/[name]/` folder and update the script's `fetch()` calls to reference it
- When merging multi-chunk JSON batches, re-check that `id` values are sequential with no gaps or duplicates

## Behavior Rules
- Do NOT launch any local servers
- Do NOT run destructive git commands (force push, reset --hard, etc.) without explicit confirmation
- Ask before deleting any files
- Keep changes focused — don't refactor or "improve" things that weren't asked about
