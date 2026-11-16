# Changelog

## Pages CMS Phase I — 2026-11-16
- Configured the existing top-level song array with all 18 fields and preserved string BPM, category arrays, stable IDs and plain-text lyrics. Added required/key/ID checks and a reviewed lyric-permission hash ledger; no current lyrics or songs were changed.
- Added editorial draft validation, trusted-main publication preparation and manual review PRs. Normalization restores optional empty strings removed by Pages CMS; schema drift, ID loss, unverified lyrics and conflicting edits block publication.
- Added deterministic content versions and an editorial checkpoint for multiple batches, concurrent main edits and squash-merge compatibility. Application version 0.5.2, service worker, PWA assets, storage and submission behavior remain unchanged.
- Documented hosted-app activation, protected-main requirements, owner permission review and outstanding hosted acceptance. Added development-only validation tools and pinned upstream save/schema tests. No CMS server, database or custom authentication was introduced.

## 0.5.2 — 2026-11-16
- Replaced the Service Builder song dropdown with a responsive, searchable picker. Matches are grouped into Disarankan and Lagu lainnya by service category, without category restrictions or per-title “saran” suffixes.
- Worship shows only W songs and Praise only P songs; added Bebas for both. Other segment types retain access to both. Type/category/catalog changes update available choices immediately.
- Confirm before clearing incompatible choices after a type change, or replacing an incompatible old selection. Cancellation leaves the draft unchanged. Clearing affects only song references in the editor; entry IDs and service overrides remain, and closing without saving preserves the saved plan.
- Existing type/category mismatches, missing references, templates, songs and local data survive loading/importing without automatic clearing. Bebas uses segment type `free` within schema 2; older plans/imports remain supported.
- Updated app/UI/cache to 0.5.2 and precached the picker rules module. Added selection-rule/browser coverage and updated existing service/application journeys. Public catalog/content version and storage keys are unchanged. See docs/review/v052/README.md.

## 0.5.1 — 2026-11-15
- Reused the song editor with primary title/creator/key/type/category/lyrics fields and an Informasi Lanjutan disclosure. Kept Simpan Lokal independent from Ekspor Pengajuan (.json) and Salin Pengajuan.
- Added offline single-song ADD/EDIT submissions with schema version, timestamp, observed public content version, stable public IDs, original/proposed values and unchanged/modified/cleared field statuses. Local-only songs submit as ADD; omitted fields never imply deletion.
- Lyrics and permission text require separate explicit opt-ins; permission claims remain flagged for review. Export/copy never saves the draft or publishes, and never serializes unrelated songs or private application state.
- Preserved catalog content, IDs, storage keys, schema-1 imports, schema-2 backups and all service-planning data. Added optional published-baseline version metadata; unknown versions are flagged rather than invented.
- Updated app/UI/cache to 0.5.1, precached the submission module, documented review format and added validation/browser/offline checks. See docs/review/v051/README.md.

## 0.5.0 — 2026-11-15
- Replaced fixed service slots with a flexible local Service Builder; renamed the guide to Alur Ibadah. The six-song Sunday plan remains the initial template, with editable Praise & Worship Night, Ibadah Khusus and blank starters.
- Added arbitrary segment names/order, optional Worship/Praise/Medley/Instrumental/Doa/Firman Tuhan/Perjamuan Kudus/custom segments, trusted pointer/touch sorting and accessible editor/keyboard reordering.
- Allowed every library song in every segment; categories and W/P now guide rather than restrict. Medleys and repeated songs are supported.
- Added service-only key/flow/arrangement overrides, independent template/setlist copies, multiple saved setlists, native sharing with clipboard/TXT fallback, JSON export/import and complete print output.
- Migrated schema-1 slots to schema 2 under the existing key, preserving metadata, all notes and song references without category-based clearing. Full backups retain all setlists/templates; older backups remain importable.
- Preserved the master catalog, personal progress/reflections/checklist and offline behavior. Updated the first preparation checklist item to refer to the agreed alur rather than a mandatory song count.
- Updated UI/app/cache to 0.5.0 and cached the model, starter-content and builder modules. Added model/browser, touch, migration, quota-recovery, offline and print validation; see docs/review/v050/README.md.

## 0.4.1 — 2026-11-15
- Simplified Beranda to the greeting, concise search, a quiet Holy Fire devotional tile, compact icon shortcuts and song rows. Moved legacy overview material into reading, module information and settings views.
- Renamed the library to Lagu, removed introductory copy and per-category counts, and moved advanced filters, add/refresh/restore actions and technical notes into an accessible secondary sheet.
- Preserved search/category/type/status filters and latest per-route scroll positions during the document session. In-app Back uses the matching history entry; repeated route taps no longer scroll or redraw.
- Consolidated delegated actions and de-duplicated history events. Unchanged profiles and library lists retain their DOM; typing in search no longer rebuilds homepage rows.
- Added 200ms opacity/transform route transitions and lightweight press feedback with reduced-motion support; the bottom shell remains stationary.
- Made lessons expandable and moved preparation guides, storage explanations and required notices into secondary reading/disclosure views without removing educational content.
- Updated app/UI/service-worker cache to 0.4.1. Public songs, content version, storage keys, schema and backup/migration behavior are unchanged.
- Added fluidity/browser regression checks and before/after evidence in docs/review/v041/README.md.

## 0.4.0 — 2026-11-15
- Rebuilt the application shell around five persistent bottom tabs: Beranda, Lagu, Ibadah, Belajar and Lainnya, following the owner-supplied Experience Preview.
- Introduced Canvas / Ink tokens, compact typography, local SVG icons, plain reading layouts and list-based song browsing. Original educational text and every existing module remain available.
- Added a searchable home entry, featured catalog rows, grouped service/learning links and a dedicated settings/data page.
- Reworked song profiles into Lirik / Aransemen / Makna views with accessible keyboard tabs, shareable song routes and a distraction-free lyric reader with text-size controls.
- Preserved original hash routes, both storage keys, schema 1, all 38 public songs, the frozen migration baseline and catalog/local-overlay behavior. Browser back/forward now follows in-app navigation.
- Updated app/UI/cache to 0.4.0, cached the local icon and ministry-reference content modules and adjusted PWA canvas colors. Existing installation and waiting-worker update behavior remain in place.
- Added browser regression coverage and screenshots for 360×640, 390×844, 412×915 and 1440×900; see docs/review/v04/README.md. Physical Android/iOS installation and device safe-area checks remain manual.

## 0.3.2 — 2026-11-15
- Redesigned only the welcome screen with an edge-to-edge Holy Fire background, soft animated light, compact logo, sans-serif hierarchy and Baby Yellow Open button.
- Made the Open button compact (180px maximum), centered its label, removed the arrow and balanced the space above/below it between the subtitle and scripture.
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
