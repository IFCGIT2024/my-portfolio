# Work on Little Room in GitHub Codespaces

This repository contains both the original Little Room and the new rebuild. A GitHub Codespace opens a working copy of the whole repository; it does not move or replace the live portfolio.

## Create the workspace

1. On [the portfolio repository](https://github.com/IFCGIT2024/my-portfolio), choose the branch you want to work on.
2. Click **Code → Codespaces → Create codespace on main** (or create one for your chosen branch).
3. Wait for the VS Code workspace and terminal to open. The repository's dev container supplies Node.js. There is nothing to install for these projects.

GitHub tells you which account pays before creating a codespace. Personal accounts include a monthly allowance; usage beyond the available allowance can incur charges according to your account's spending limits. A stopped codespace does not consume compute, but its stored files still count toward storage usage. See [GitHub's billing guide](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) and [how to stop a codespace](https://docs.github.com/en/codespaces/developing-in-a-codespace/stopping-and-starting-a-codespace).

## Start the preview

In the terminal, from the repository root, run:

```sh
node .devcontainer/serve.mjs
```

Open the forwarded port **8000** from the Ports tab. Forwarded ports are private by default. In the browser window that opens, use these paths:

- Rebuild preview: `/docs/projects/little-room-next/`
- Original app: `/docs/projects/little-room/`
- Portfolio: `/`

The preview runs until you stop it with `Ctrl+C`. It is intended for development only. `npm install` is not required. The server serves the repository's static files; keep its forwarded port private unless you deliberately want to share the preview.

## Where the work lives

- `docs/projects/little-room-next/` — modular rebuild and its own local autosave key.
- `docs/projects/little-room-next/docs/WORK_TRACKER.md` — segment-by-segment progress and next tasks.
- `docs/projects/little-room/` — published original and its standalone `index.html`.
- `docs/projects/little-room/source/` — original's editable source and tests.

The rebuild is incomplete and does not yet migrate older Little Room saves. Keep the original app and its saved plans while the rebuild approaches parity. Browser-local saves belong to a browser origin, so the Codespaces preview, the existing live site, and the rebuild's live site may each have separate local data. Export a backup before changing environments.

## Run checks

From the repository root, test the rebuild:

```sh
cd docs/projects/little-room-next
node --test tests/*.test.mjs src/environment/*.test.mjs
```

To test the original separately, return to the repository root and run:

```sh
cd docs/projects/little-room/source
node --test tests/*.test.cjs
```

The original app is already usable from its checked-in `docs/projects/little-room/index.html`. If its **source** is changed later, `node build.cjs` in `docs/projects/little-room/source/` regenerates that published `index.html`; run it only when intentionally updating the original.

Commit and push changes you want to keep. Codespaces provide a development environment, not a substitute for committed Git history or exported plan backups.
