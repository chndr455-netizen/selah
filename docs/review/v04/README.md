# SELAH v0.4.0 — Experience review

Implemented against `main` at `6ec9357`, using the owner-supplied `SELAH_v0.4_Experience_Preview_1_.html` as a visual reference. The prototype's demo catalog, temporary state and placeholder modules were not substituted for the application.

## What changed

- Canvas `#FCFAF7`, Ink `#30201D`, Deep Red, Crimson and Baby Yellow; compact system typography, locally rendered SVG icons, quieter separators and readable layouts.
- Five persistent bottom tabs: **Beranda**, **Lagu**, **Ibadah**, **Belajar**, **Lainnya**. The header gear opens **Pengaturan & data**.
- Home search entry, four quick destinations, catalog-backed featured songs and the existing devotional content. Complete original home material remains in the expandable Heart / Skill / Unity overview.
- Song rows replace the old card grid. Search by title/artist/theme/notes and all category/type/status filters remain available. Secondary catalog refresh controls live in a disclosure.
- Profiles provide Lirik / Aransemen / Makna tabs with keyboard arrow/Home/End support. A full-screen lyric reader provides a back button and text-size controls; native dialog behavior manages focus. No lyrics were added to the public catalog.
- Service planning retains six slots, metadata, notes, clipboard/TXT/print and persistence; links lead to structure, arrangement and readiness guides.
- Academy retains all ten lessons and role filters; spiritual foundation, operations, reflections, song management and data controls retain their full material and behavior. Settings collects backups, local-data notices, installation and rights information.
- Ministry-reference constants live in `assets/content.js`, separate from rendering/storage logic; educational material stays in HTML and public songs stay in JSON. No framework, package manifest or build step was introduced.

## Data and routes

`data/songs.json`, `data/legacy-v02.json` and the content version are unchanged. Both `selah.v03.state` and `musicMinistry.v1`, schema 1, validation, import/export, migration and catalog overlay semantics remain intact.

Legacy hashes `#home`, `#library`, `#setlist`, `#academy`, `#faith`, `#operations`, `#reflection`, `#manage`, `#service` and `#arrange` continue to work. New supporting routes are `#more`, `#settings` and `#song/<encoded-id>`. Browser back/forward works for navigation and song profiles. A missing song route falls back to the library. Parent tabs remain selected on supporting pages.

## Screenshots

Screenshots are Chromium CSS viewports. They use disposable profiles; the song profile and reader use original dummy text, not copyrighted song lyrics or a personal backup.

[Before: home at 390px](before-home-390.png)

| Viewport | Beranda | Lagu | Ibadah | Belajar | Lainnya |
| --- | --- | --- | --- | --- | --- |
| 360 × 640 | [View](home-360x640.png) | [View](library-360x640.png) | [View](setlist-360x640.png) | [View](academy-360x640.png) | [View](more-360x640.png) |
| 390 × 844 | [View](home-390x844.png) | [View](library-390x844.png) | [View](setlist-390x844.png) | [View](academy-390x844.png) | [View](more-390x844.png) |
| 412 × 915 | [View](home-412x915.png) | [View](library-412x915.png) | [View](setlist-412x915.png) | [View](academy-412x915.png) | [View](more-412x915.png) |
| 1440 × 900 | [View](home-1440x900.png) | [View](library-1440x900.png) | [View](setlist-1440x900.png) | [View](academy-1440x900.png) | [View](more-1440x900.png) |

Supporting views: [Profile](profile-390.png), [Lyric reader](lyrics-reader-390.png), [Spiritual foundation](faith-390x844.png), [Structure](service-390x844.png), [Arrangements](arrange-390x844.png), [Operations](operations-390x844.png), [Reflections](reflection-390x844.png), [Management](manage-390x844.png), [Settings/data](settings-390x844.png).

## Verified

All four required checks passed:

```sh
node tests/validate.mjs
node tests/catalog-merge.mjs
node --check assets/app.js
node --check sw.js
```

Also passed syntax checks for `assets/icons.js` and `assets/content.js`, plus:

- `tests/experience-browser.cjs`: all four viewports; five tabs; all original routes and contextual parent selection; no horizontal document overflow; fixed bottom navigation; actual supporting menu links; home search; category/type/status filtering; local edit/add/delete; profile deep-link reload and browser back/forward; keyboard profile tabs; lyric reader/size controls/Escape; six-slot setlists, clipboard and TXT download; print invocation; learning role filters and progress; reflection submission; checklist; backup/reset/import; invalid import preserving current data; offline reload with catalog, setlist, learning and reflection data; welcome reopening. No page errors in these flows.
- `tests/welcome-browser.cjs`: existing welcome fit, focus, reduced-motion, enlarged-text and offline checks at the same four viewports. Selector updates account for settings navigation and featured home song rows.
- Supplemental temporary fixture: actual cached **0.3.2 → 0.4.0** upgrade, waiting notice, close/reopen activation, cache cleanup and offline use of the new application and local JS modules. Existing song edit, setlist and learning progress survived unchanged.
- Supplemental legacy-storage fixture: `musicMinistry.v1` migrates with existing song edit, setlist and learning progress intact.
- Supplemental catalog fixture: actual network addition/update preserves a local edit; restoring public catalog preserves personal learning progress. Test catalog changes were confined to a temporary copy.
- DOM comparison against the previous release: every original module text node remains present, including material moved to settings or the home overview.
- Chromium parses the manifest without errors and resolves identity, scope and start URL under `/selah/`. Skip-to-content keyboard navigation preserves the route.

The optional browser runners require an externally installed Playwright and Chromium; both were already available in this cloud environment. They are not runtime dependencies of SELAH. To reproduce, run a server from a persistent terminal:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /workspace
```

Then, from `/workspace/selah`:

```sh
node tests/experience-browser.cjs
node tests/welcome-browser.cjs
```

`SELAH_TEST_URL` and `CHROMIUM_PATH` can override the server/browser paths. The experience runner regenerates review screenshots. The welcome runner regenerates the earlier welcome-review screenshots; those historical images were kept unchanged in this branch.

## Remaining device checks

No physical Android/iOS installation, Safari test, device safe-area rendering, screen-reader session, OS text scaling or physical printer test was performed. The existing install flow is preserved; manifest parsing, keyboard behavior, dialog semantics and offline/update behavior were verified in Chromium. Print testing exercised the action, not a physical printout.

After owner approval and deployment, check the installed PWA on Android Chrome and iOS Safari: safe areas in portrait/landscape, browser toolbar transitions, system text scaling, touch targets, reader focus/return, installation icons/start URL and offline relaunch. Test with a private owner backup only on a private browser profile. Do not publish that backup.

This branch is prepared for review. It has not been merged or deployed to Pages.
