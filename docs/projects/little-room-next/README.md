# Little Room next

An independent, early browser-local prototype of the Little Room rebuild. It is being developed separately from the [current portfolio app](https://ifcgit2024.github.io/my-portfolio/docs/projects/little-room/index.html). The current app and its saved data remain the production experience; the prototype is not yet a replacement.

Work through the rebuild one segment at a time using the [work tracker](docs/WORK_TRACKER.md). To open both versions in a cloud development environment, see the [Codespaces guide](docs/CODESPACES.md).

## Run locally

Use a current browser and serve this directory over HTTP; ES modules may not load reliably by opening the HTML file directly. For example, with Python installed:

```sh
cd little-room-next
python3 -m http.server 8000
```

Open `http://localhost:8000/`. No account, installation or network service is required after loading the local files. Edits are saved to this browser's local storage on this origin. Storage may be unavailable or cleared by the browser; export a backup of work you want to keep.

## Prototype capabilities

- Plan and furnish workspaces, a dimensioned starting room, direct wall drawing, grid snapping, zoom, floor finishes, and adjustable wall heights.
- Place doors and windows on walls, slide and resize them; add furniture from a small catalog or draw a rectangular furniture footprint.
- Select and move items, select all, clear by mode, change ordering, duplicate, mirror, set dimensions, rotate and undo/redo. Some operations have restrictions to prevent invalid geometry.
- Local autosave, JSON export/import, and editable PNG export/import with an embedded render prompt for **new prototype plans**.
- Approximate sun position from coordinates, date, time and time zone, illustrative shadows, and optional locally synthesized atmosphere sounds.

These are prototype capabilities, not a claim that every combination or device has been verified. The sun/shadows are illustrative and do not yet model light passing through windows or real building obstructions. Ambient sounds are synthetic sketches. The prototype has not been validated on physical iPhone and Android devices.

## Important gaps

This rebuild does **not** yet contain the full existing feature set. In particular, it does not yet migrate original Little Room saves; support irregular or curved rooms/walls and editable nodes; trace floor-plan images; offer the original custom painting/image studio and room-template library; or restore feng shui guidance. See the feature inventory for the full parity list. A narrow browser layout is useful for development but is not proof of mobile usability.

Legacy Little Room JSON or editable PNG files are recognized and reported as legacy; migration is not yet implemented. The prototype does not convert them or overwrite the opened document when it encounters one. Keep the original file and use the current app to open it. Prototype autosave uses its own storage key. An exported editable image can contain the full document in PNG metadata, which some messaging apps and image editors strip; retain a JSON backup too. Review the document before sharing: metadata can contain room details and environmental settings.

## Structure and tests

- [`src/core/`](src/core/) contains the portable document and editing operations.
- [`src/editor/`](src/editor/) contains canvas rendering and input.
- [`src/persistence/`](src/persistence/) contains the JSON and PNG file codec.
- [`src/environment/`](src/environment/) contains solar calculations and optional audio.
- [`src/main.js`](src/main.js) connects the interface to these modules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) explains the target design, boundaries, release gates and roadmap; [`docs/FEATURE_INVENTORY.md`](docs/FEATURE_INVENTORY.md) tracks parity and requested additions.

With a current Node.js installed, run all current tests from this directory:

```sh
node --test tests/*.test.mjs src/environment/*.test.mjs
```

`npm test` runs the tests in `tests/`; the explicit command above also includes environment-module tests. Automated tests do not replace manual accessibility and real-device checks.
