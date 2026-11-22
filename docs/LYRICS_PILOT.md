# Owner-approved lyrics pilot — v0.5.4

On **2026-11-22**, the project owner explicitly stated that publication permission is **Approved** for the five existing lyric entries and requested that permission matching no longer be a technical publication condition. This pilot implements that current instruction; it supersedes the earlier ledger-gated policy.

The five owner decisions are recorded in `data/lyrics-permissions.json` as `owner-confirmed-pilot`, with exact lyric/rights hashes and the task date/context:

| ID | Song |
| --- | --- |
| s001 | Bejana-Mu |
| s002 | Ku Mau Cinta Yesus Selamanya |
| s003 | Bagi Tuhan Tak Ada yang Mustahil |
| s004 | Dengan Sayap-Mu |
| s005 | Engkau Setia |

These record the owner's editorial decision, not independent legal verification. The unchanged public disclaimer does not itself grant a license. Existing attribution/source/rights text is retained exactly; no songwriter, publisher or permission evidence was invented.

## Behavior

- Permission-ledger matching is removed from public display, catalog validation, CMS preparation and content versioning. The pilot applies to catalog lyrics generally; the five recorded decisions are historical context, not a whitelist.
- Missing, empty, malformed or stale optional approval metadata cannot hide lyrics or block the publication workflow. The PWA no longer requests or precaches the ledger. Optional approval tooling remains available if the owner wants an audit-only PR.
- Required fields, unique/stable IDs, types, categories, musical keys, URLs, canonical content hashes, conflict detection and manual PR/content review remain. No automatic main merge/deployment or new backend/authentication system was added.
- Submission exports still require explicit choices to include lyrics/rights and never save/publish automatically. Their permission metadata is advisory and does not claim independent verification; UI copy states it is optional for pilot publication.
- Field-level local edits, intentional clears, legacy ambiguity, hidden songs, conflicts, setlists, progress, reflections and backups remain. No local-storage reset is performed. Previously withheld public lyrics arrive for unchanged local lyric fields; private edits stay private.

## Catalog repair and versions

All **38 IDs and every pre-existing catalog value** are unchanged, including all five lyric strings byte for byte. **310 missing optional string fields** were restored to empty strings, preserving original property order where present. This repairs the sparse direct-CMS saves that previously failed canonical validation. The frozen migration file is untouched.

App/UI/SW cache advances from **0.5.3 to 0.5.4** because runtime policy changed. Content version now matches the full canonical catalog hash. Future content-only edits still use `node scripts/version-content.mjs` without changing the app version. No song text or attribution was changed to make a check pass.

## Verification performed

Passed locally:

```sh
node tests/validate.mjs
node scripts/check-content.mjs --base origin/main
node tests/catalog-merge.mjs
node tests/public-catalog.mjs
node tests/service-model.mjs
node tests/song-submission.mjs
node tests/service-song-picker.mjs
node tests/cms-content.mjs
node tests/cms-editorial.mjs
SELAH_PAGES_CMS_SOURCE=/tmp/selah-pages-cms-upstream node tests/pages-cms-upstream.mjs
node tests/lyrics-pilot-browser.cjs
node tests/song-sync-browser.cjs
node tests/cms-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-pilot-experience node tests/experience-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-pilot-submission node tests/song-submission-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-pilot-service node tests/service-builder-browser.cjs
```

- Exact pre-existing value/ID comparison against main; all existing lyric/rights bytes preserved. All five optional records match those bytes. The public disclaimer text is unchanged. App/UI/cache versions and the content hash agree.
- Pilot unit tests cover display and publication with absent/empty/stale/malformed approval metadata, including a blank rights note; normal schema/version errors still fail. Editorial-branch tests prepare publications without any ledger file, preserve multiple edits/IDs and detect conflicts. The pinned upstream CMS save round-trip still preserves fields and types.
- At **360×640, 390×844, 412×915 and 1440×900**, all 38 songs appear and each of the five exact lyric strings displays in the profile and focused reader. Offline cold reload works with a missing permission endpoint; fresh v0.5.4 makes zero ledger requests.
- An actual cached **0.5.3 → 0.5.4** update reproduces the previous hold, activates the new worker and delivers the public lyrics without resetting data. A local key, private lyric edit, plans/templates/checklists/progress/reflections and the legacy storage key survive; offline still works.
- Field synchronization tests cover intentional clears, ambiguity, stale editor forms, private lyric bytes, conflict history, backup/import, submissions and reused/mismatched content versions. Existing application/submission/service journeys pass at all four sizes, including touch dragging and both historical migration keys.
- JavaScript syntax and `git diff --check` pass. These are local/source-based checks; no authenticated hosted CMS save, live Pages deployment, physical iOS/Safari or GitHub Actions execution is claimed.

After review/merge, let Pages deploy and close/reopen SELAH to activate **0.5.4**. Do not reset user data. Sync the editorial branch from the reviewed main baseline before further CMS edits, preserving pending work. GitHub API access may require the owner to create the prepared PR manually if it returns Forbidden.
