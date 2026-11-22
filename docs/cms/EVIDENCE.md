# Phase I implementation evidence — 2026-11-16

Historical report: the permission gate described here was superseded by the owner-approved 2026-11-22 pilot. See [current policy](../LYRICS_PILOT.md).

Baseline: main `0c880e8` (merged v0.5.2 picker). Public catalog: **38 songs**, content version `2026-11-16.1`, app version `0.5.2`. Integration leaves `data/songs.json`, frozen legacy catalog, application assets, manifest, service worker and version file unchanged.

## Passed locally

- `npm ci`; configuration/content checks; separate editorial Git-branch tests; all pre-existing validation/model suites and JS syntax checks.
- `.pages.yml` validated by the actual pinned Pages CMS 2.1.8 configuration schema. The headless audit ran upstream initialization, field validation, deep mapping and save sanitization. Every ID and nonempty field survived, including a variant with source hidden. CMS intentionally omits optional empty strings; normalization restored the complete catalog **exactly**, with all 18 fields per song and unchanged JSON types.
- A disposable Git repository with distinct main and cms/editorial branches: two CMS-style sparse saves accumulated into one review output; all 38 IDs and fields retained; only catalog/content version/checkpoint output generated; app version unchanged. Reviewed publication was simulated by a squash commit; the next batch used the saved editorial checkpoint correctly.
- Independent main/editorial field edits merged; same-field conflicts stopped. Stable-ID removal, duplicate IDs, unknown fields, invalid keys/required fields, type coercion, schema drift and unverified lyrics were rejected. New stable IDs were accepted, so the checks do not freeze the catalog at 38 songs.
- Lyrics authorization checks require hashes matching the exact lyric and rights text. A nonempty rights claim alone failed; stale lyric/rights hashes failed; a reviewed dummy self-authored fixture passed. No dummy or third-party lyric was committed to the repository.
- `node tests/cms-browser.cjs`: Chromium at 390×844 served a content-only update with a hash version while app and SW assets remained unchanged. Unmodified public content refreshed; an existing local song override, saved plans/templates/progress and reflections remained. EDIT export used the new public original/version and left local storage unchanged. Offline cold reload and export retained those results. The full content hash is grouped to keep the existing mobile version label within the dialog without an app/CSS change.
- Existing `validate`, `catalog-merge`, `service-model`, `song-submission` and `service-song-picker` suites passed. `git diff --check` passed. No application release, live deployment, automatic merge, CMS backend or custom authentication was performed.

## Upstream audit reproduction

```sh
npm ci
# Git clone pagescms/pagescms elsewhere, then checkout:
# 6f4e860a35d934406580287e7042e5e111e207a1
SELAH_PAGES_CMS_SOURCE=/path/to/pagescms node tests/pages-cms-upstream.mjs
node tests/cms-content.mjs
node tests/cms-editorial.mjs
node tests/cms-browser.cjs # externally installed Playwright + Chromium
```

CI checks out the same upstream revision with credentials disabled. UI modules and unused filename/date helpers are stubbed solely for this headless save-transform test; configured field schemas and save transformations come from upstream. This audit neither launches nor hosts Pages CMS.

## Activation and evidence still required

GitHub API requests for branch protection returned **Forbidden**. Hosted Pages CMS pages/docs access was unavailable from this environment; source was inspected through the upstream Git repository. Therefore **no authenticated hosted CMS save, GitHub App installation, effective protected-main rule, or remote Actions execution was verified**. The save evidence above is a real-source headless round-trip and separate local editorial-branch exercise, not a hosted-session claim.

The prepared cms/editorial branch must be tested through the hosted UI after the owner connects the app and merges the integration. Required owner setup, protected-main settings, permission review, action fallback and the no-merge hosted acceptance checklist are in [README.md](README.md). These are activation blockers, not optional enforcement: without protected main, configuration cannot stop an authorized CMS user from choosing main or bypassing PR checks.
