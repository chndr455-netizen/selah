# SELAH v0.5.0 — Flexible Service Builder

Based on `main` at `cd65fd4` (v0.4.1). Prepared on `feat/v050-service-builder` for review. Nothing has been merged or deployed by this task.

SELAH provides guidance, not restrictions: standardize preparation without standardizing expressions of worship.

## Experience and behavior

- **Alur Ibadah** replaces the fixed-structure label; `#service` and all other existing routes remain available.
- The initial **Ibadah Minggu** template retains the six original song positions. **Praise & Worship Night**, **Ibadah Khusus** and **Custom / Blank** are also provided. Every starter can be edited, duplicated or deleted locally.
- Worship, Praise, Medley, Instrumental, Doa, Firman Tuhan, Perjamuan Kudus and custom-named segments can be added, renamed, duplicated, removed or reordered. Non-musical segments are optional; no starter forces a non-musical segment.
- Every library song can be selected in every segment. Category/W/P matches add a “saran” label only. Multiple songs and repeated songs are allowed, including medleys.
- Service-specific key, flow and arrangement notes override profile defaults without editing the master song. Empty override fields follow the profile. Segment notes and whole-service briefing are separate.
- Confirmed edits automatically update the active local setlist and its saved-library record. Metadata/segment sheets use an explicit Save; closing a sheet discards its unconfirmed draft.
- Selecting a template creates a new saved setlist; the previous setlist is retained. A new blank setlist can also be created from the library. Loading a saved setlist restores it as the active editable record.
- Templates capture reusable segments, song assignments, overrides and briefing. Date/WL/theme belong to individual services. Editing a template does not change existing setlists; duplication regenerates all copied segment/song-entry IDs.
- Reorder using touch/mouse/pen on the grip, **Alt+Up/Down** on a focused grip, or **Naik/Turun** in the editor. Drag changes persist on drop, not on every move. Cancellation restores the original order. A concurrent catalog redraw cancels an in-flight drag safely.
- Clipboard copy, native sharing with clipboard/TXT fallback, TXT/JSON export, standalone JSON import and print are available. Share/export text resolves known key, BPM, flow and notes; it does not copy song lyrics or personal journals. Readiness/repeated-song information remains advisory in the actions sheet.

## Data format and compatibility

The existing `selah.v03.state` storage key is retained. `musicMinistry.v1` remains a recognized legacy source. Public song IDs/catalog, `data/legacy-v02.json`, content version, local overlays, progress, reflections and checklist flags are retained. The first readiness checklist sentence now refers to the agreed alur instead of requiring six songs; its stored boolean position stays the same.

Active storage and full backups use **schema 2**:

- `set`: active service (`id`, `name`, `date`, `wl`, `theme`, `notes`, `segments`).
- `setlists`: independent saved services; the active record is synchronized here by ID.
- `templates`: independent reusable snapshots (`id`, `name`, `notes`, `segments`).
- Segment: stable `id`, `name`, `type`, `songs`, `notes` and optional recommendation values.
- Song entry: stable entry `id`, original `songId`, fallback title, `key`, `flow`, `notes`.

Schema-1 fixed-slot backups migrate automatically. Every original slot becomes a segment, including an empty slot with notes. Date, WL, theme, briefing, all slot notes and chosen song IDs are retained. Choices outside former categories and references to missing library songs are preserved. Legacy segment/entry IDs are deterministic on migration and stable after reload. Modern backups validate duplicate IDs and retain the stored IDs; deliberate copies receive new IDs.

A missing song is shown with its saved title/ID and can be replaced explicitly; reconciliation no longer clears it. Master profile changes are reflected through defaults, while explicit service overrides remain local.

Full schema-2 backups require v0.5+ to restore; older apps that only understand schema 1 cannot restore the new flexible format. Older backups remain importable into v0.5. Standalone setlist JSON is namespaced as `selah-service`, version 1, and imports as a new independent setlist without overwriting the library or another saved service. It preserves references/overrides, not a full copy of every master song; use a full backup to transfer the complete private library.

Failed local-storage writes do not replace the last good stored value. The builder reports that data is not saved; the current in-memory state can still be exported for recovery before closing the page. No cloud database or runtime dependency was added.

## Screenshots

All images use disposable test profiles and dummy local values. Keys/arrangements in screenshots are QA examples, not published musical claims. Optional Doa/Firman segments in the examples were added explicitly, not inserted as mandatory liturgy.

- [Before, 390 × 844](before-390.png)
- Default Sunday builder: [360 × 640](builder-360x640.png), [390 × 844](builder-390x844.png), [412 × 915](builder-412x915.png), [1440 × 900](builder-1440x900.png)
- [Flexible example](flexible-service-390.png), [Overrides](overrides-390.png), [Segment editor](segment-editor-390.png)
- [Templates](templates-390.png), [Template editing](template-edit-390.png), [Saved setlists](saved-setlists-390.png), [Sharing/export](sharing-390.png)
- Other modules at all four sizes are captured in `home-*`, `library-*`, `setlist-*`, `academy-*`, `more-*`; [home example](home-390x844.png), [planner example](setlist-390x844.png), [lyric reader](lyrics-reader-390.png).

## Validation completed

Passed:

- Required Node commands: `tests/validate.mjs`, `tests/catalog-merge.mjs`, `node --check assets/app.js`, `node --check sw.js`.
- `tests/service-model.mjs`: lossless legacy mapping, out-of-category/orphan preservation, stable IDs, all starters/types, independent plan/template/segment copies, overrides, reorder, saved-plan synchronization, text/BPM export, duplicate-ID and malformed-data rejection. Added to CI with syntax checks for the new modules.
- `tests/service-builder-browser.cjs` at **360×640, 390×844, 412×915 and 1440×900**: add/edit/rename/duplicate/delete/reorder segments; all segment types; optional non-musical segments; multi-song medley; any-song selection; key/flow/notes without master mutation; metadata; template save/edit/duplicate/use; multiple saved services and independent copies; standalone JSON export/import; clipboard/TXT; Share API invocation and fallback; print action/styles; full backup/reset/import; offline reload/edit persistence. No page errors in these flows.
- Trusted Chromium touch events verified mobile drag/drop, cancellation rollback and safe cancellation during a concurrent catalog refresh. Editor up/down and Alt-arrow alternatives also passed. These are browser-engine tests, not a physical-device claim.
- Legacy browser fixtures under **both existing keys** retained old metadata, all selected IDs/notes, progress, checklist and reflections. Orphan references survived opening/saving their editor; IDs remained stable across reload.
- Existing **experience**, **fluidity** and **welcome** browser suites passed at all four viewports. Planner selectors were adapted to the new sheets; broad song/editing, navigation/history/scroll, learning, reflections, backup and offline checks remain in place.
- Actual cached **v0.4.1 → v0.5.0** upgrade: waiting notice, close/reopen activation, old-cache cleanup, schema migration and new modules working offline. Old backup import also passed offline.
- Real Chromium PDF output was generated and checked with `pdftotext` for WL, segment notes and service-specific key/flow. This is separate from the stubbed print-button invocation in the browser suite.
- Simulated quota failure retained the original schema-1 local-storage value and still allowed a complete schema-2 recovery export with the unsaved edits.
- The unchanged manifest parses under the project subpath, retaining identity/scope. Public song and legacy catalog files are unchanged; no real private backups or lyrics were committed.

Native Share is invoked through a test stub to inspect the payload; clipboard fallback and downloads ran in Chromium. No operating-system share target received test data.

## Reproduce

The PWA needs no install/build. Optional browser tests use an externally installed Playwright and Chromium, already available in this cloud environment.

```sh
# Persistent server, serving the /selah/ project subpath:
python3 -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

From `/workspace/selah`:

```sh
node tests/validate.mjs
node tests/catalog-merge.mjs
node tests/service-model.mjs
node --check assets/app.js
node --check sw.js
node tests/service-builder-browser.cjs
node tests/experience-browser.cjs
node tests/fluidity-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-welcome-evidence node tests/welcome-browser.cjs
```

`SELAH_TEST_URL` and `CHROMIUM_PATH` override server/browser paths. The service and experience suites regenerate current review screenshots; use the welcome output override to keep historical screenshots unchanged.

## Device checks remaining

Physical Android/iOS installation, Safari touch/drag and hardware Back, device safe areas/system text scaling, real OS sharing destinations, screen-reader sessions and a physical printout remain manual checks. Keyboard labels, native modal focus, reduced motion, responsive layouts, trusted touch events, PDF output and offline/update behavior were checked in Chromium.

After owner review/deployment: close all older SELAH windows after the update notice and reopen. On Android Chrome/iOS Safari, test grip dragging and scrolling independently, cancellation and edge autoscroll, keyboard/assistive up/down alternatives, safe-area sheet controls, OS text scaling and sharing. Reload offline and verify multiple saved setlists/templates and service overrides. Test private owner backups only in a private browser profile; never publish them.
