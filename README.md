# Portfolio Site Layout

This repo now has a clean deployable portfolio site under `docs/`.

## What gets deployed

Use `docs/` as the GitHub Pages site root.

The deployed portfolio includes only these runtime folders:

- `docs/index.html`
- `docs/portal.css`
- `docs/projects.js`
- `docs/projects/discrete-math/`
- `docs/projects/proofs/`
- `docs/projects/csci-1120-prep/`
- `docs/projects/re-analyzer/`

Everything else in the repo stays outside the public site, including pipelines, agent systems, prompts, PDFs, test files, and unrelated project folders.

## Publishing On GitHub Pages

1. Push the repo.
2. In GitHub, open `Settings > Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose your main branch and the `/docs` folder.
5. Save.

## Editing The Live Portfolio

For the deployable site, edit `docs/projects.js` and keep project paths inside `docs/projects/...`.

Example:

```js
{
  id: "unique-slug",
  title: "Project Name",
  description: "One or two sentences about what it does.",
  path: "projects/project-folder/index.html",
  tags: ["Tag1", "Tag2"],
  badge: "New",
  badgeColor: "#10b981",
  icon: "⚡",
}
```

## Workspace Copies

The root `index.html`, `portal.css`, and `projects.js` are still present for local workspace browsing, but the GitHub-ready version is the one in `docs/`.

## Folder Naming Rule

For anything that will be public on the site, use lowercase folder names with hyphens instead of spaces.
