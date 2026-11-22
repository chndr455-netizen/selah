# Pages CMS — editorial workflow and lyrics pilot

SELAH remains a static PWA. Hosted [Pages CMS](https://app.pagescms.org) edits the existing top-level `data/songs.json` array on **cms/editorial**. No backend, database or custom authentication was introduced. Configuration is tested against Pages CMS 2.1.8, revision `6f4e860a35d934406580287e7042e5e111e207a1`.

## Current pilot policy

On 2026-11-22 the owner explicitly marked the existing s001–s005 lyrics **Approved** and requested removal of publication-permission matching as a technical condition. The PWA and content validator now accept lyrics without an approval-ledger entry, including when that optional ledger is missing or stale. `data/lyrics-permissions.json` records the five owner editorial decisions and exact text hashes for context; it is not consulted to authorize display or publication.

Keep the attribution/rights fields, existing copyright disclaimer and manual owner review. The disclaimer itself does not grant a license, and an owner editorial record is not independent legal verification. Do not invent credits/authorization or put private evidence, credentials or journals in this public repository. Submission consent/permission warnings remain informational and never block pilot publication.

## Setup and editing

1. Connect the hosted GitHub App to chndr455-netizen/selah and select **cms/editorial**, not main. After merging the pilot PR, update the editorial branch from main so its configuration and catalog match the latest reviewed baseline. Preserve any pending edits and resolve conflicts explicitly; do not force-reset the branch.
2. Keep GitHub Pages on main/root. Allow repository Actions to create PRs; protect main with reviewed PRs, code-owner review, required **Validate SELAH / validate**, up-to-date checks and no bypass/force pushes. These protect the content workflow, not a permission-ledger prerequisite.
3. Edit existing songs or add an unused stable ID (s039, etc.). Do not change/remove old IDs. All 18 existing fields remain present; BPM is text, categories are an array, lyrics are plain text. Leave unknown credits/musical values blank. Save multiple edits before publication.
4. Check **Validate CMS draft**. It runs trusted-main code, restores missing optional strings, checks IDs/schema/musical keys and detects concurrent edits. Permission metadata is not required. Git commits on any public branch are publicly readable.
5. Save everything, then choose **Siapkan publikasi untuk review**, or GitHub Actions → **Prepare CMS publication** → Run on **main**. Preparation reads the saved editorial snapshot, three-way merges independent main updates and opens a publication PR. It never merges automatically.
6. Review the song diff, attribution, context and validation, then approve/merge manually. The generated PR changes only catalog, content version and editorial checkpoint. A repeated unchanged draft produces no PR/version bump. Checkpoints support later batches after normal or squash merges.

`.pages.yml` cannot enforce the branch selector or GitHub protections. Repository-owner activation, effective protections, hosted UI saves and remote Actions execution need owner verification; GitHub API access from the implementation environment has returned Forbidden. Local source-based tests do not claim a hosted authenticated save.

## Optional approval record

The old approval workflow is retained as **Record optional owner lyric approval**. It prepares an audit-only PR when the owner wants one; it is never a prerequisite for publishing a song. Its confirmation describes an editorial decision, not a legal determination.

Local equivalent:

```sh
node scripts/approve-lyrics.mjs --song s001 --by chndr455-netizen \
  --basis 'Owner editorial decision and public context' \
  --catalog /path/to/catalog.json
```

Records include exact lyric/rights hashes, reviewer, timestamp and context. Existing records are retained. Missing, stale or absent records cannot hide lyrics or stop the publisher.

## Format, versions and recovery

- Root JSON array, all 18 fields, stable IDs, string values and category arrays remain unchanged. The pilot restores only missing optional strings; every pre-existing value and lyric byte is retained.
- Pages CMS omits empty strings and does not merge hidden unknown fields for root lists. Every known field is configured; publication normalizes those omissions. Unknown fields/schema drift fail for review. Missing optional fields in a CMS draft mean empty/cleared; review intentional clears carefully.
- Run `node scripts/version-content.mjs` for a direct content PR. `version.content` is the full canonical SHA-256 hash grouped for mobile wrapping. Content-only changes do not increment the app/SW version. The pilot itself changes runtime behavior, so app/UI/cache advance to 0.5.4.
- Never hand-edit `data/cms-publication.json`, reset editorial history, publish the frozen migration file, or merge a sparse editorial array directly into main. Preparation takes app/scripts from current main, not an older editorial tree.
- If bot PR creation fails, use the prepared branch to open a PR manually and run **Validate SELAH** on that branch. No workflow merges automatically.
- Existing local lyric edits/clears, song IDs, setlists, progress, reflections and full backups are preserved by the field-level merger. Do not reset local storage to reveal public lyrics. Ambiguous legacy local differences stay available under Edit for review.

## Validation and hosted acceptance

```sh
npm ci
node tests/validate.mjs
node tests/cms-content.mjs
node tests/cms-editorial.mjs
node scripts/check-content.mjs
node tests/catalog-merge.mjs
node tests/public-catalog.mjs
node tests/service-model.mjs
node tests/song-submission.mjs
node tests/service-song-picker.mjs
# Checkout pagescms/pagescms at the pinned revision above, then:
SELAH_PAGES_CMS_SOURCE=/path/to/pagescms node tests/pages-cms-upstream.mjs
```

The source audit uses actual upstream validators/save transformations, with headless UI stubs. It is not a hosted CMS deployment. Before normal production use, test two harmless metadata saves on the editorial branch, prepare a PR, and confirm all IDs/fields/text are preserved, app version stays unchanged and content version updates. Test invalid IDs/keys/required fields fail while lyrics with an empty optional permission ledger pass. Close/revert disposable test edits without force-resetting history.

After deployment, verify public refresh, intentional local overrides and offline reload on target devices. See [pilot evidence](../LYRICS_PILOT.md) and the [historical Phase I report](EVIDENCE.md).
