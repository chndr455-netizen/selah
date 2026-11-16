# Song synchronization investigation — 2026-11-16

Baseline: `main` **7f78381**. The sync branch changes app/UI/cache to **0.5.3**; it does not alter any catalog entry, public lyric, approval record, frozen migration data or content version.

## Findings

1. **Whole-record local overlays.** `mergeCatalog` previously replaced the entire public record whenever any local field differed from `publishedBase`. A saved key change on s001 therefore preserved an old blank `lyrics` field and hid unrelated public updates. Launch, refresh and backup import used this policy. The baseline was then advanced, which could make stale blanks indistinguishable from deliberate local clears on a later upgrade.
2. **Sparse CMS JSON.** After CMS integration PR #8, direct “via Pages CMS” commits `7c5fceb`, `841514d`, `7f78381` reached main. All 38 records now omit empty optional fields. s001 has 13 of the 18 canonical fields, missing bpm/url/meter/form/meaning. Other records also omit artist/key. The app's previous catalog validator required these core strings and could reject the entire fetch, falling back to an old saved public baseline or showing no catalog on a fresh device.
3. **Content version did not advance.** `data/version.json.content` remains `2026-11-16.1` despite the catalog changes. The existing two version reads only detect a version changing during the fetch; they cannot prove that an unchanged legacy date describes new data. The CMS publication checkpoint is still null.
4. **Permission controls have not been satisfied.** s001–s005 contain nonempty public lyric strings, but main's approval ledger is empty. No exact lyric/rights approval exists for any of these five entries. A nonempty short rights note is not an authorization record. The strict CMS checks correctly reject this state; a client synchronization fix must not grant approval or fabricate evidence.
5. **Service worker behavior.** Data requests are already network-first, with cached fallback; app-shell files are cache-first and use a waiting worker until the old app releases its clients. A cached old shell retains the old whole-record policy. Offline/stale catalog or ledger responses can also delay incoming fields. Clearing browser data is unnecessary and would destroy local edits; the release bumps the shell cache and retains storage.

Repository evidence cannot reveal the contents of the owner's actual browser storage or prove its live deployment status. Browser reproductions use isolated test profiles, synthetic authorized text and the same storage/routes.

## Implemented behavior

- Compare each field against the previous public baseline. If the local field is unchanged, accept the public field; otherwise preserve the exact local value. If both changed differently, keep the local value and retain original/local/public alternatives in optional `songSync` metadata.
- Preserve explicit empty strings, private lyrics/whitespace, local additions, hidden public IDs and locally edited songs removed from the public catalog. Conflict ancestry survives subsequent no-op refreshes, updates, offline reloads and full backup/import. Schema 2 and both historical storage keys remain supported.
- Legacy ambiguous differences are shown under **Edit → Periksa perbedaan lokal**. The comparisons are read-only: no one-click overwrite/reset. A user can deliberately edit the existing form after review. A blank that may represent an intentional clear is not silently replaced.
- Saving an editor opened before a refresh merges only actual form changes into the latest working record, so untouched stale textareas cannot overwrite newly received lyrics. Newly concurrent edits retain the local draft and record the public alternative.
- Normalize only missing optional public text fields at runtime. Invalid present types and required fields still fail. Strict repository publication validation remains unchanged; this read adapter does not authorize malformed direct CMS publication.
- New incoming lyrics/rights require exact reviewed hashes plus review metadata from the public ledger. On missing/stale/unavailable permission data, retain the previous baseline text and local working text instead of inserting unverified new lyrics or blanking existing text. Backup imports retain their previous lyric values when incoming public fields are withheld. Other valid metadata remains usable.
- Compute a public catalog fingerprint and check hash-style content versions. A reused legacy version detected on an existing client stays unknown across reloads until corrected. Withheld or mismatched snapshots have unknown submission base versions; no version is fabricated. Old date versions remain readable where no mismatch is observable.
- Cache the new runtime modules and permission ledger. No automatic local-storage reset, cache wipe of private state, catalog publication or lyric approval is performed.

## Validation

Passed:

```sh
node tests/catalog-merge.mjs
node tests/public-catalog.mjs
node tests/service-model.mjs
node tests/song-submission.mjs
node tests/service-song-picker.mjs
node --check assets/app.js
node --check assets/catalog-sync.js
node --check assets/public-catalog.js
node --check sw.js
node tests/song-sync-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-sync-experience node tests/experience-browser.cjs
node tests/fluidity-browser.cjs
SELAH_SCREENSHOT_DIR=/tmp/selah-sync-welcome node tests/welcome-browser.cjs
```

The synchronization suite checks **360×640, 390×844, 412×915 and 1440×900**: approved public lyrics with a local key, independent public metadata, exact private lyric retention, intentional clears, ambiguous older baselines, durable conflicts, read-only comparisons, backup/import, submission originals and no-save export, stale editor saves and offline cold reloads. It also checks the actual sparse/unapproved main shape without displaying or approving its new lyrics; stale/reused versions; unreadable storage; and an actual cached 0.5.2 → 0.5.3 transition with old-cache removal, private-data preservation and offline loading of the new modules/ledger. Chromium needs the old controlled document released before reopening; the test navigates away/closes it and waits for activation, without skipWaiting or storage reset.

Application navigation/editing/reader/setlist/progress/reflection/backup/offline regressions, focus/history/transitions and welcome/reduced-motion tests passed at all four sizes. No physical Safari/iOS/Android or live deployment claim is made.

**Existing main publication checks remain failing**, intentionally not bypassed: `node tests/validate.mjs`, `node scripts/check-content.mjs` and CMS catalog round-trip checks encounter the missing canonical fields; normalizing those fields reveals the missing exact lyric approvals. The existing content version also does not represent these edits. The new synchronization tests run before these gates in CI; the gates remain required and the PR must not be merged around them.

## Required content repair before publication

A separate owner-reviewed content repair must restore canonical optional strings, document genuine permission decisions for the exact s001–s005 lyric/rights text, and generate the correct content hash. Do not invent approval records or delete a user's local lyrics. The current invalid main snapshot also blocks the trusted-main CMS preparation/approval preflight, so repair needs a focused reviewed content PR before the regular CMS workflows can resume.

A reviewer can use the existing `normalizeDraft` helper for known missing strings, inspect the text privately, record only real owner-approved permission decisions, then run `scripts/version-content.mjs` and all publication checks. No automatic repair or purported permission confirmation is included in this sync PR. Route later edits through **cms/editorial → prepared publication PR → reviewed main**, with main's required checks/review enforced and no CMS/app bypass. Effective repository protection/live Pages deployment could not be checked via the blocked GitHub API.
