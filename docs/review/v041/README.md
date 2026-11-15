# SELAH v0.4.1 — Simplicity & Fluidity

Based on the latest `main` (`11617ef`, v0.4.0). Prepared on `feat/v041-simplicity` for owner review; not merged or published.

## Experience

- **Beranda:** identity and greeting, “Cari lagu...”, a concise devotional entry with abstract CSS Holy Fire art, four compact icon shortcuts and simple featured rows. The former overview no longer repeats the app's modules on the home screen.
- **Lagu:** a short heading, rounded search, horizontally scrollable category choices without counts, and compact title/artist-or-type/key rows. The filter icon opens a native modal sheet containing type/status filters, local add, public refresh/restore and technical notes. Dialog focus, Escape and visible in-sheet feedback are supported.
- **Belajar:** lessons open on demand, retaining their full prose, practice material, references and existing completion checkboxes. Role filters and lesson open states survive navigation without rebuilding the lesson list.
- **Supporting screens:** functional introductions are available through Info disclosures. Reflection reading, repertoire/preparation guides, source notices, copyright and storage explanations remain accessible on their relevant secondary screens. No educational/devotional prose was deleted to shorten functional screens.
- **Motion:** 200ms opacity/4px-transform route entrances and small press feedback. The header and bottom navigation do not participate in route animations. Reduced motion suppresses route, sheet and press animation.

## Continuity and rendering

One delegated action handler serves navigation and list actions. A shared location synchronizer handles browser history; identical popstate/hashchange notifications do not redraw the same route. Repeated taps on the active tab are no-ops.

The current document remembers the latest scroll position of each route. Both browser Back and the in-app return button restore the library position and focus the originating song row when it remains available. Search, category, type and status controls retain their current values. The unchanged library is not redrawn on return; unchanged song profiles retain their tab content. Search rendering no longer rebuilds the home featured list.

This is session UI state, held in memory, not a new backup schema or persistent storage key. A full document reload restores the saved ministry data and route; it starts a new search/scroll session.

## Content and data

All 38 public song records, `data/legacy-v02.json`, `assets/content.js`, the content version, `selah.v03.state`, `musicMinistry.v1`, schema 1, catalog overlays and backup formats remain unchanged.

Complete legacy philosophy and devotional context are in Fondasi Rohani. Module descriptions are retained as secondary reading under Lainnya; reference statistics are under Pengaturan. The duplicate generated home service flow was removed; the same six formal positions and the original contextual explanation remain in Struktur Ibadah. Complete lessons remain available inside their disclosures. Required privacy, rights and source notices remain accessible.

The app/UI/cache version advances together to 0.4.1. No runtime dependencies, external fonts or remote art assets were added.

## Before and after

Before screenshots use the v0.4.0 baseline. After screenshots use disposable browser profiles. Profile/reader images use original dummy text, never a private owner backup or published song lyrics.

| Screen at 390 × 844 | Before | After |
| --- | --- | --- |
| Beranda | [Before](before-home-390.png) | [After](home-390x844.png) |
| Lagu | [Before](before-library-390.png) | [After](library-390x844.png) |
| Belajar | [Before](before-academy-390.png) | [After](academy-390x844.png) |
| Pengaturan | [Before](before-settings-390.png) | [After](settings-390x844.png) |

| Viewport | Beranda | Lagu | Ibadah | Belajar | Lainnya |
| --- | --- | --- | --- | --- | --- |
| 360 × 640 | [View](home-360x640.png) | [View](library-360x640.png) | [View](setlist-360x640.png) | [View](academy-360x640.png) | [View](more-360x640.png) |
| 390 × 844 | [View](home-390x844.png) | [View](library-390x844.png) | [View](setlist-390x844.png) | [View](academy-390x844.png) | [View](more-390x844.png) |
| 412 × 915 | [View](home-412x915.png) | [View](library-412x915.png) | [View](setlist-412x915.png) | [View](academy-412x915.png) | [View](more-412x915.png) |
| 1440 × 900 | [View](home-1440x900.png) | [View](library-1440x900.png) | [View](setlist-1440x900.png) | [View](academy-1440x900.png) | [View](more-1440x900.png) |

Supporting views: [Filter/action sheet](library-sheet-390.png), [Lesson reading](lesson-reading-390.png), [Profile](profile-390.png), [Lyric reader](lyrics-reader-390.png), [Settings](settings-390x844.png), [Readiness management](manage-390x844.png), [Reflection](reflection-390x844.png), [Spiritual foundation](faith-390x844.png), [Structure](service-390x844.png), [Operations](operations-390x844.png).

## Validation

Passed:

- `node tests/validate.mjs`
- `node tests/catalog-merge.mjs`
- `node --check assets/app.js`
- `node --check sw.js`
- Syntax checks for local content/icon modules and `git diff --check`.
- **Experience browser suite** at all four viewports: all tabs and original routes, menu links, horizontal overflow, stable bottom navigation, song search/category/type/status filters, local edit/add/delete, profile deep-link reload and history, keyboard tabs, lyric reading/text size/Escape, six-slot setlist persistence/clipboard/TXT, print invocation, learning progress/roles, reflections, checklist, backup/reset/import and invalid-import preservation, offline reload and welcome reopening. No page errors in these flows.
- **Fluidity browser suite** at all four viewports: compact home/library, native sheet focus and Escape return, saved search and all filters, actual scrolled-list return through browser Back, in-app Back and tab switching, originating-row focus, same DOM/no redraw on unchanged list returns, no scroll on same-route taps, single route update for duplicate history notifications, keyboard lesson disclosure, 200ms content transitions, stationary navigation, real pointer press feedback, reduced motion and malformed/unknown-route fallbacks.
- **Welcome browser suite** at all four viewports: unchanged welcome copy, fit, centered Open, keyboard/inert state, reduced motion, enlarged-text scrolling, offline library and private progress.
- **Actual upgrade fixture:** cached 0.4.0 → 0.4.1, waiting notice, close/reopen activation, old cache cleanup and refined UI offline. Private song edits, setlist and progress survived unchanged.
- **Catalog fixture:** real network addition/update preserved the local edit; reset to the public catalog preserved personal learning progress. The new sheet showed the refresh confirmation. Test catalog edits were confined to a temporary copy.
- **Legacy fixture:** `musicMinistry.v1` migration preserved an edited song, setlist and progress.
- DOM comparison confirmed original educational/devotional paragraphs, lesson content, source/data notices and legacy-home prose remain present. Removed UI eyebrows and duplicate navigation labels are intentionally excluded.
- Chromium manifest parsing and `/selah/` identity/scope/start URL; keyboard skip link retains the current route.

## Reproduce

The optional browser runners use externally installed Playwright and Chromium, already available in this environment. The PWA remains dependency-free.

Serve the workspace from a persistent terminal:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

From `/workspace/selah`:

```sh
node tests/experience-browser.cjs
node tests/fluidity-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-welcome-evidence node tests/welcome-browser.cjs
```

Use `SELAH_TEST_URL` and `CHROMIUM_PATH` for other server/browser paths. `SELAH_SCREENSHOT_DIR` can redirect screenshots; the experience suite defaults to this review directory. The welcome suite defaults to its earlier review directory unless overridden.

## Manual checks remaining

Physical Android/iOS installation, Safari, device safe areas and OS text scaling, hardware Back behavior and screen-reader use remain device checks. Chromium tests cover semantic labels, keyboard access, focus return, reduced motion, safe-area CSS presence and the unchanged installation manifest, not a complete assistive-technology audit. Print testing exercised the action, not a physical printout.

After review and deployment, check the installed PWA on Android Chrome and iOS Safari in portrait/landscape with larger text: the bottom bar and sheet should clear safe areas; category strips should scroll; song return should retain search/position; reading and input controls should remain reachable. Close all SELAH windows after the waiting update notice and reopen before offline relaunch. Use real private backups only in a private owner browser profile.
