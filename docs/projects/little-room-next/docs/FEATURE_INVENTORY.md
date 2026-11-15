# Little Room: feature inventory and parity checklist

Status snapshot: 15 November 2026. This document is the baseline for the new implementation, not a claim that the replacement already contains these features. The source examined is the previous `cozy-room` implementation and its tests. All boxes below describe acceptance work to verify in the new app; a feature is complete only after it is implemented **and** tested in that app. The previous app and its browser data should remain available during the transition.

## Why rebuild?

Little Room should remain an approachable, private, playful room planner. The current version grew around a large canvas and interface module, with furniture, exterior outlines, interior walls, and openings stored and handled differently. That makes common transformations, new content, integrations, and changes difficult to reason about. The new model should have explicit, documented objects, shared operations, clear ownership of wall/opening relationships and layers, and separate geometry, rendering, interaction, storage, and integrations. A feature can be added or tested without having to modify one giant canvas handler. Keep the cozy brand while making the core portable across browser interfaces and future applications.

## What the earlier app already does

| Area | Existing behavior and notable limits |
| --- | --- |
| Canvas | Top-down view; room name; grid on/off; grid snap choices of 50 cm, 12.5 cm and 2.5 cm; pan, zoom and fit view; undo; clear furniture and reset room. |
| Floor and perimeter | Rectangular floor additions and cuts, including against angled walls; draggable outline corners; add a corner on a straight or curved exterior wall; curve/straighten perimeter walls and move/snap curve centers. The existing floor editor requires a connected shape without holes, and protects some curved outlines from destructive floor edits. |
| Partitions | Draw interior walls by drag or two endpoints, snap to grid, select and delete, split and drag linked joints, curve and straighten walls, and share/snap curve centers. Interior wall operations preserve the underlying floor. Endpoints and branches cannot always be removed safely. |
| Openings | Doors and windows can be added to exterior walls. Openings can be selected/removed; window length can be changed by handles or numbers, including along a curved exterior wall. Existing interior walls require a gap instead of attached doors or windows. |
| Furniture | Thirteen built-in types: bed, sofa, armchair, coffee table, dining table, desk, counter, sink counter, stove, fridge, plant, rug and bookshelf. Add by tap or drag/drop; move, rotate, numeric dimensions/angle, rename, recolor, duplicate, remove, snap to grid/wall, and fit to room. Selected furniture is rendered on the floor plan. |
| Custom objects | Draw rectangles, ellipses, pillars, freehand objects; upload PNG/JPEG/WebP and paint with pen, marker, eraser, color and size controls. Object outlines support points on many shapes. Existing fit-to-room masks and certain invalid/complex outlines are protected from destructive point editing. |
| Context actions | Hold an object or wall for contextual radial options, with submenus and explicit selected-object Options. Add edge points, drag points, hold a point for deletion. A point may be rejected when deleting it would invalidate geometry. |
| Templates | Six preset room ideas: bedroom, bathroom, living room, kitchen, home office, dining room. Reopen saved room templates. Start fresh or attach a compatible template at a straight right-side wall; some templates cannot attach without loss and are safely rejected. Random apartment/building generation was intentionally removed at the user's request. |
| Reference tracing | Upload a floor-plan image, scale the image, move/resize it, adjust opacity and visibility, trace an irregular outline, undo a point, finish or cancel. Completion preserves furniture, remaps exterior openings and can be undone. A reference image may be included in editable exports even if hidden. |
| Light and ideas | Manual sun direction (0–359°) and time-of-day controls produce an illustrative light effect. Feng-shui-inspired layout suggestions and rearrangement work for a single open room; the helper is deliberately disabled when interior walls exist. The sun is not geographic or date-based. |
| Save/share | Browser autosave; separate named homes and room templates; editable PNG download/share and JSON backup/import. The PNG is a regular image containing serialized project metadata; some services strip it. Storage/import failures preserve existing data and report errors. |
| Small screens | Responsive layout with bottom navigation and drawers. Physical iOS/Android device testing is still needed; a narrow desktop view is not proof of device support. |

## Requested capability and parity acceptance checklist

Unmarked items below are requirements awaiting verification in the replacement. Some may be built while this document is being updated; use the implementation and test results, not this list, as the source of current progress.

### A. Shared object system

- [ ] Define documented object types and versioned data: floor/room, wall/partition/half-wall, opening, furnishing, shelf, surface, custom shape, and reference image as appropriate. Stable IDs and explicit relationships allow an object to be extended without altering unrelated tools.
- [ ] Common selection and commands support move, resize/stretch, rotate through 360°, mirror/flip, duplicate, delete and numeric properties where those operations are meaningful. Clearly explain constraints rather than silently breaking a wall, opening, room or saved data.
- [ ] Select multiple objects or all, then move/rotate/duplicate/mirror as appropriate; undo a single group action. Clear all has an explicit scope and confirmation/undo, and differs clearly from clearing furniture.
- [ ] Provide intuitive z-order/layers: select, reorder, send forward/back, name or identify items, and persist order. A chair can sit under a desk; a table can sit under a bunk bed or shelf. Do not confuse visual draw order with actual object height used by lighting.
- [ ] Add a new furniture definition through a documented registration/content contract without changing editor mechanics. Its default artwork scales to a user-drawn box; image and painted assets retain transforms and data.
- [ ] Add/move/delete shape nodes on furniture and wall edges, including curved edges; touch, mouse and non-gesture alternatives; invalid outlines/operations fail visibly without data loss.

### B. Two clear modes and floor planning

- [ ] Floor-plan mode permits editing floor, walls, partitions and openings; Furnish mode prevents accidental structural changes. Switching modes preserves work and selection behavior is clear.
- [ ] Start a room using entered dimensions; resize a selected room in meaningful units, specifying whether associated objects and openings move/scale. Draw, reshape and manage awkward/angled layouts, corners, pillars and curved walls.
- [ ] Draw a wall directly from a clicked or touched start point by dragging to the end, with understandable grid/endpoint snapping. Add sections without removing existing floor. Support half walls and shelves as distinct, configurable objects.
- [ ] Select a wall and add a door or window promptly. Attach each opening to an exterior **or interior** wall, slide it along straight/curved walls, resize and flip/invert where meaningful; protect or remap attachments when wall geometry changes, splits, moves, rotates or is deleted.
- [ ] Support floor finish selection (including tile), with visible scale/orientation as applicable; finish survives save/export and follows its floor object.
- [ ] Preserve grid/snap settings, pan/zoom/fit, tracing, editable reference opacity/scale, and room/piece labels. Test awkward and concave plans, narrow spaces, curves and cancellation.

### C. Furnishing, templates and whole-plan transforms

- [ ] Keep drag/drop and tap-to-add furniture; support drawing a footprint in Furnish mode and choosing its content type so the object is fitted to the dragged dimensions.
- [ ] Preserve custom shape and raster art creation, painting, editing and export. Existing image metadata and content remain available.
- [ ] Supply the existing six room templates and support user-created room templates and saved homes. Preview and place a template where dragged; align/snap to compatible walls, retain its attached openings, furniture and transforms, and reject or explain invalid joins without losing data.
- [ ] Move/rotate the full selected plan, a room or a selection as intended; attached doors/windows and any grouped interior features follow consistently. Test groups across multiple rooms and avoid detaching dependents.
- [ ] Maintain clear/reset/undo workflows and distinguish destructive actions from view-only changes.

### D. Sun, setting and atmosphere

- [ ] Given location, date, time and timezone, calculate solar azimuth and elevation; render daylight through correctly oriented windows and item shadows only when physically meaningful. Handle sunrise/sunset and polar day/night. The user can set location manually; never require a location permission or network service for the core app. Clearly state approximation/limitations and use trusted test fixtures.
- [ ] Establish an explicit north direction for the plan and define whether rotating the drawing also rotates north; test both world/screen conventions. Object height and window geometry affect shadows; distinguish an illustration from a precise lighting simulation.
- [ ] Offer selectable surroundings such as forest, high-rise, ground floor, desert and jungle as visual/ambience presets. Offer optional warm ambient sound such as birds with explicit user activation, volume/mute and accessible controls; avoid autoplay and ensure graceful offline behavior.
- [ ] Retain optional feng-shui-inspired suggestions without claiming precise architectural or cultural authority. Explain incomplete inputs and avoid applying single-room rules to a multi-room plan as if they were reliable.

### E. Privacy, portability and sharing

- [ ] Keep local-first use: no account needed; editing and save remain usable without a server after the app loads. Clearly disclose data included in shares, especially private trace images and embedded custom artwork.
- [ ] Preserve editable PNG and JSON workflows, original-file warning, native share when available and download fallback, named homes/templates, autosave, import, and recovery from invalid files/storage quota without replacing existing work.
- [ ] Put a useful copyable visual-render prompt in or alongside exported PNG as requested, while retaining the project data. A prompt in metadata alone is not reliably visible to people or image tools; provide an explicit copy/download path and explain that image services may strip metadata.
- [ ] Migrate previous supported plans safely or preserve and report what cannot be imported. Run fixture tests for old PNG/JSON/autosave/home/template data, including custom artwork, curves, trace images and opening attachments. Keep the legacy app and storage keys untouched until migration is verified.
- [ ] Keep an isolated versioned core and documented, reproducible local build/test process. Portability means documented data contracts, no accidental DOM/storage dependency in core geometry, clear asset licensing, and a path to another frontend rather than an untested promise of native support.

### F. Quality and mobile

- [ ] Give every action an accessible visible alternative to long-press, double-tap or drag; include keyboard/focus names, numeric fields, announcements and comfortable touch targets.
- [ ] Test tap/drag/hold/pinch conflicts, pointer cancellation, zoom, phone rotation, scrolling, safe areas and dialogs. Validate on physical iPhone/Safari and Android/Chrome as well as desktop browsers.
- [ ] Verify examples and automated tests for geometry, transformations, layers, attached openings, import validation/migrations, undo, scene selection, solar calculations and image export. Test failures and boundary conditions alongside the happy path.

## Legacy format and migration notes

- Legacy JSON exports contain `{format: "little-room", version: 2, title, state}`; the old importer also accepts version 1 and raw state. Validate before replacing the active document.
- Editable PNGs are standard PNG files with an uncompressed UTF-8 `iTXt` chunk keyed `LittleRoomPlan`, containing the same JSON and a CRC. Preserve the original or offer JSON as a backup when image services remove metadata.
- Legacy geometry is in **half-metre grid units**: multiply room coordinates, lengths, and artwork dimensions by 0.5 when migrating to a metres-based model. Angles are degrees. Identify field semantics individually rather than blindly scaling nested numbers: normalized points, opening fraction `t`, opacity, colors and image pixels are not lengths.
- Older state can include `cells`, `polygon`, `roomVertices`, `wallCurves`, `interiorWalls` with optional curves, `items`, and `openings` with legacy grid `side` or polygon `edgeIndex` and fraction `t`. Curved-wall centers, attachment positions, widths, and split curve groups require explicit conversion.
- Preserve object `shapeOutline`, original custom `points`, old `clipPolygon`, image data, names, colors, dimensions and rotation. `traceReference` can contain a hidden but still exportable raster image, position, size, opacity and visibility. Preserving pixels and shape matters more than silently converting unsupported effects.
- Old autosave key is `little-room-plan-v1`; the separate saved collection is `little-room-library-v1`, version 1, with named `home` and `template` records. Do not replace these keys in-place during a rewrite. Offer an explicit import/copy migration with verification and leave originals recoverable.
- A safe migration either faithfully converts all supported features or reports what is unsupported and retains the original file. Validate IDs, finite geometry, references, bounded sizes, image MIME/data and document limits. Test malformed files and partial migrations without mutating current work.
