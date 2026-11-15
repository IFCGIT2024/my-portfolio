# Little Room rebuild — work tracker

**Updated:** 15 November 2026  
**Approach:** Work on one segment at a time. Keep the original Little Room available while the rebuild is developed and checked. The new version remains a preview until the release gates at the end of this document are met.

This is the working list. The [feature inventory](FEATURE_INVENTORY.md) records what the original already does and everything requested; the [architecture](ARCHITECTURE.md) explains the intended structure and design decisions. Update this tracker at the end of each work session.

## How to use this list

- `[x]` means implemented **and** checked against the segment's acceptance checks. A test pass or an early prototype alone does not mean the whole segment is done.
- `[ ]` means work is outstanding. The table records whether work has started.
- Finish a segment with a short entry in the progress log: date, changes, tests, limitations, and where the code can be reviewed. If a task uncovers missing work, add it here before moving on.
- The suggested order reflects dependencies. The order can be changed if the user decides a different feature is more urgent.

## Current snapshot

| Area | Status | Evidence and limits |
| --- | --- | --- |
| Original app | Available | Remains at its current portfolio URL. Its code and browser saves are separate from the rebuild. |
| Inventory and design | Initial versions written | [Feature inventory](FEATURE_INVENTORY.md) and [architecture/roadmap](ARCHITECTURE.md); refine as decisions are made. |
| Rebuild preview | In progress | Rectangular room, Plan/Furnish modes, straight walls, hosted openings, a basic catalog, layers, editing, undo, save/export and environmental experiments exist. This is a starting slice, not full parity. |
| Tests | Initial suite passing | On 15 November 2026, `node --test tests/*.test.mjs src/environment/*.test.mjs` passed 30 checks. Browser interactions were checked in a preview; physical-device testing remains open. |
| Legacy saves | Not migrated | Previous JSON/PNG files are recognized as legacy and left unchanged; converting old plans and named homes/templates remains work to do. |
| Codespaces | Configuration prepared | See the [workspace guide](CODESPACES.md). Launch and forwarded preview in a real Codespace are still unverified. |

## Segment overview

| Segment | Focus | Status |
| --- | --- | --- |
| 0 | Tracking and development workspace | In progress |
| 1 | Dependable objects, selection and modes | Prototype started; hardening needed |
| 2 | Room geometry and walls | Prototype straight walls; irregular geometry outstanding |
| 3 | Doors, windows and half walls | Basic hosted openings; advanced behavior outstanding |
| 4 | Furniture, artwork and floor finishes | Basic catalog and finishes; custom content outstanding |
| 5 | Templates and whole-home organization | Not started |
| 6 | Saves, sharing and safe migration | Native preview formats started; legacy migration outstanding |
| 7 | Sun, surroundings and feng shui | Solar and audio prototypes; environment and guidance outstanding |
| 8 | Mobile, accessibility and release | Continuous checks started; release gates outstanding |

## 0. Tracking and development workspace

**Goal:** Give us a dependable place to work and a clear record of progress.

- [x] Write an inventory of the original features and requested additions.
- [x] Document the proposed architecture, test strategy and release gates.
- [x] Create this segment-by-segment tracker.
- [x] Prepare and document a repeatable Codespaces development environment, including how to run and test the rebuild and how the original is preserved.
- [ ] Verify the workspace and forwarded preview in an actual Codespace; record any account, permission or plan limitations.
- [ ] Keep the tracker and progress log updated as each later segment is completed.

**Acceptance:** A developer can find the source, run the preview and tests, identify which app is the original, and understand the next task without relying on chat history. A Codespaces configuration by itself does not prove an actual Codespace was created or tested.

## 1. Dependable objects, selection and modes

**Goal:** Make the basic object system predictable before adding complex geometry.

- [ ] Define and document stable IDs, object types/capabilities, coordinate units, transforms, layer order, and a versioned document format.
- [ ] Support move, stretch, 360° rotate, flip/mirror, duplicate, remove and numeric editing when meaningful for the selected type; explain unsupported operations.
- [ ] Make selection, multi-selection, select all, group move/rotation and clear-all scope clear and undoable. Ensure attached openings stay with their walls.
- [ ] Apply Plan/Furnish locks consistently across canvas, inspector, layer list and commands; Furnish must protect room structure from accidental changes.
- [ ] Separate catalog definitions and artwork from generic selection and editing logic so a new item gains shared behavior without modifying unrelated tools.
- [ ] Cover invalid values, rotated/scaled items, selected groups, undo/redo and save/reload with tests; provide usable pointer, touch and non-gesture alternatives.

**Acceptance:** A new catalog item can be added through the documented contract, transformed and layered, saved/reopened, and edited in the correct mode without breaking existing objects.

## 2. Room geometry and walls

**Goal:** Recreate awkward real-world room shapes while keeping the floor intact.

- [ ] Enter starting room dimensions; define and explain which objects scale when resizing a room or the entire plan.
- [ ] Draw walls by dragging from a chosen point; add grid and endpoint snapping with visible feedback and numeric dimensions.
- [ ] Support angled/irregular floors, connected floor additions, and partitions that do not remove floor.
- [ ] Add, drag and delete points on straight and curved walls/floors; validate crossings, minimum geometry and connected joints.
- [ ] Restore curved walls, adjustable curve centers, shared-center snapping and safe straightening; include angled and curved-wall regression cases.
- [ ] Restore zoom, pan, grid visibility, snap options, tracing an uploaded floor plan, trace opacity and cancellation.

**Acceptance:** Build and reopen an irregular room with an angled section, a curved wall and an interior partition; changes are undoable and leave valid, connected geometry.

## 3. Doors, windows and half walls

**Goal:** Treat openings and wall heights as real, editable parts of the plan.

- [ ] Select any eligible exterior or interior wall and add an opening directly at the intended position.
- [ ] Slide, stretch, mirror and invert doors/windows with clear limits; preserve position and orientation along straight and curved hosts.
- [ ] Define safe behavior for moving, rotating, resizing, splitting, joining, curving and deleting a host wall. Reject or remap atomically without losing openings.
- [ ] Make wall height and half walls clear to edit and visualize, independently from visual layer order.
- [ ] Test intersections, openings near corners, overlap, host changes, undo, export and touch interactions.

**Acceptance:** An opening remains attached and editable through all supported host edits; an unsupported edit explains why and leaves the prior plan intact.

## 4. Furniture, artwork and floor finishes

**Goal:** Bring back the expressive furnishing tools using the shared object system.

- [ ] Restore the original catalog and shared edit actions; make stacking and layer selection work for furniture, shelves and bunk beds.
- [ ] Add items by tap or drag/drop and draw a footprint then choose the item to fit that footprint.
- [ ] Restore custom rectangles, ellipses, pillars, freehand shapes, point editing, image upload and the simple paint studio; preserve original artwork through transforms.
- [ ] Restore snap to grid/wall and fit-to-room with clear limits and non-destructive behavior.
- [ ] Offer floor finishes including tile, with editable/persistent color, scale and orientation where supported.

**Acceptance:** A user can create or upload an object, reshape and layer it, save it, and reopen it without losing its artwork or dimensions.

## 5. Templates and whole-home organization

**Goal:** Make reusable rooms fit together without damaging existing work.

- [ ] Restore the six original starter-room types and named local homes/templates.
- [ ] Save the current room as a reusable template and preview its placement under the pointer or finger.
- [ ] Snap or align template walls at the chosen location, preserving floor, furniture, wall relationships, doors and windows.
- [ ] Support moving and rotating a selected room or the whole build together; define behavior for openings, layers and shared edges.
- [ ] Reject or explain invalid joins and prove that undo restores the complete prior state.

**Acceptance:** Place two different templates at user-chosen positions, align their walls, retain their openings, undo the placement and reopen the resulting saved home.

## 6. Saves, sharing and safe migration

**Goal:** Keep work portable, recoverable and under the user's control.

- [ ] Test local autosave, named plans/templates and storage-failure recovery; never silently overwrite an unreadable save.
- [ ] Round-trip the new document through JSON and editable PNG, including room data, layers, environment and any custom assets.
- [ ] Keep the render prompt in PNG metadata and offer a visible copy/download option; explain that some services strip metadata.
- [ ] Build explicit migration from original JSON, PNG, autosave and named homes/templates, including half-metre legacy units, curves, openings, trace images and custom artwork.
- [ ] If a file cannot be migrated faithfully, report the exact limitation and preserve both the source and the current plan. Use representative and damaged-file fixtures.
- [ ] Clearly disclose location and hidden image data included in a share; provide appropriate removal or export choices.

**Acceptance:** Representative original and new plans reopen with their content intact, and failed imports never alter the open plan or original file.

## 7. Sun, surroundings and feng shui

**Goal:** Make atmosphere enjoyable while being honest about the accuracy of the light.

- [ ] Verify solar position for date, time, time zone and coordinates, including daylight-saving transitions, night and high latitudes.
- [ ] Add plan north/orientation and connect window geometry and object height to a documented light/shadow model; label approximations clearly.
- [ ] Add optional surroundings such as forest, high-rise, ground floor, desert and jungle, with user-started audio, mute/volume and offline-safe behavior.
- [ ] Restore the original feng-shui-inspired guidance with explicit limits for multi-room plans and interior walls; explore visual, game-like guidance as a separate, testable feature.

**Acceptance:** Sun position matches trusted examples, lighting limitations are clear, and atmosphere/audio is optional and respects the user's settings.

## 8. Mobile, accessibility and release

**Goal:** Verify that the whole planner is usable and trustworthy before replacing the original.

- [ ] Test phone-sized layouts and real touch gestures, including scrolling, pinch/zoom, pointer cancellation, long press, safe areas and orientation changes.
- [ ] Test on physical iPhone/Safari and Android/Chrome; record device, browser and results. Narrow desktop previews are not a substitute.
- [ ] Provide accessible names, keyboard/focus navigation, screen-reader alternatives, readable contrast and alternatives to gesture-only actions.
- [ ] Run geometry, interaction, portability, save recovery and regression tests; check large plans and long sessions.
- [ ] Review the feature inventory against actual demonstrations and tests, document remaining limitations, and prepare a rollback path.

**Release gates:** Do not replace or remove the original app until the user has a usable, verified replacement with the agreed original features, tested safe migration, accessible core workflows, real-device results and a documented rollback. Keep original data recoverable.

## Progress log

| Date | Work completed | Verification / known limits |
| --- | --- | --- |
| 15 Nov 2026 | Inventoried the original app, documented target architecture and started a separate rebuild preview. | Initial 30 automated checks passed; preview is incomplete and original-save migration and physical-device tests remain open. |
| 15 Nov 2026 | Added the tracker and Codespaces configuration, preview server and workspace guide. | Server checked locally against representative paths; an actual Codespace and its forwarded port still require verification. |
