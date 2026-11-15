# Changelog

## 0.3.2 — 2026-11-15
- Redesigned only the welcome screen with an edge-to-edge Holy Fire background, soft animated light, compact logo, sans-serif hierarchy and Baby Yellow Open button.
- Made the Open button compact (180px maximum), centered its label and removed the arrow.
- Integrated the owner-supplied Kolose 3:23 text with TB attribution, with no separate scripture card.
- Added dynamic viewport sizing, safe-area padding, small-screen scrolling and reduced-motion support; all visuals remain available offline.
- Synchronized app, displayed and service-worker cache versions; song catalog and local-data behavior remain unchanged.

## 0.3.1 — 2026-11-15
- Fixed portable PWA identity under GitHub Pages project paths by omitting the explicit manifest ID; identity now defaults to start URL.
- Added manifest/subpath and displayed-version regression checks; synchronized UI, app and cache versions.
- Completed Chromium subpath, responsive, local data, migration, catalog refresh, offline and update checks; see docs/AUDIT_2026-11-15.md. Device installation and live Pages deployment remain pending.

## 0.3.0 — 2026-11-15
- Migrated original v0.2 foundations, ten academy lessons and 38 song profiles.
- Rebranded to Crimson / Deep Red / Baby Yellow / Cream, new vector icon and responsive welcome screen with Kolose 3:23 paraphrase.
- Added PWA manifest, icons and service worker, offline caching and update guidance.
- Extracted public song library into JSON, with network-first refresh and local add/edit/delete overlays; frozen v0.2 migration baseline.
- Added repo docs, content guide, permanent Codex instructions, rights notice, validation and CI.
- Pending live GitHub Pages deployment, Android/iOS install, browser interaction and offline acceptance. Current environment's browser policy blocked local navigation; static and functional unit checks are not an end-to-end test.
