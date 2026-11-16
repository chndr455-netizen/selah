# Pages CMS Phase I — setup and publication

SELAH stays a static PWA. The hosted [Pages CMS](https://app.pagescms.org) GitHub App edits `data/songs.json` on **cms/editorial**. No custom CMS, database, authentication, token field or application release is needed. `.pages.yml` is checked against Pages CMS **2.1.8**, source commit [`6f4e860`](https://github.com/pagescms/pagescms/tree/6f4e860a35d934406580287e7042e5e111e207a1).

## Owner activation (required before publishing)

1. Review and merge the integration PR after its checks pass. The separate `cms/editorial` branch contains the same configuration and unchanged 38-song catalog. Do not edit content there until trusted-main workflows are merged.
2. Sign in to app.pagescms.org with GitHub and install/authorize its hosted GitHub App for **chndr455-netizen/selah only**. Select **cms/editorial** in the CMS branch selector. Pin/bookmark that branch. Never enter a token in SELAH or commit a permission document.
3. GitHub → Settings → Actions → General: allow GitHub Actions to create pull requests. The prepare workflow uses the repository's short-lived `GITHUB_TOKEN`, with explicit contents/PR/actions permissions. It does not use a personal token. If your plan/policy disallows bot PR creation, the job leaves its prepared branch; create the PR manually from that branch and run Validate SELAH via Actions on the publication branch.
4. Protect **main** with a ruleset/branch protection: require a PR, at least one approval and code-owner review; require **Validate SELAH / validate**, require the branch to be up to date, block force pushes/deletions, and **do not allow bypass** by Pages CMS, Actions, administrators or other actors. CODEOWNERS names the owner. Publication PRs are authored by Actions so the owner can review/approve them. If sole-owner approval policies conflict with other author identities, use a trusted reviewer; do not bypass the lyric/content gate.
5. Keep GitHub Pages deployment on **main / root**, never cms/editorial. Complete the hosted-save checklist below before using the CMS for publication.

These settings require repository-owner access. `.pages.yml` cannot lock the CMS branch selector, set GitHub branch protection or prevent an authorized actor from bypassing an unprotected branch. GitHub API access in the implementation environment returned Forbidden; activation/protection and a real authenticated hosted save were **not verified**. Do not treat the integration as an enforced publication boundary until these steps are complete.

## Editing and publishing

1. In **cms/editorial → Pustaka Lagu**, expand a song. Every existing song field is represented, including legacy source, URL, rights, and empty optional fields. Keep existing IDs unchanged. Additions use an unused stable ID such as s039; duplicates/removals/renames of existing IDs fail validation. Phase I deliberately blocks deletion.
2. Enter only known metadata. Key examples: C, F#, Bb, Am, F#m, C/E; blank is allowed. BPM is a **string** containing 20–300 or blank, not a numeric field. Categories allow multiple O/P/S/G/C values. Lyrics/notes/meaning use plain text, not rich text. Save as many edits as needed. These are Git commits to the editorial branch and do not deploy the app.
3. Check **Validate CMS draft** in GitHub Actions. It checks the exact saved snapshot using trusted main code and main's permission ledger. A failed draft check does not undo your save, but blocks preparation. Fix errors before proceeding.
4. Save all changes, then choose **Siapkan publikasi untuk review** in the CMS file actions. The action dispatches `cms-publish.yml` on main. If that menu/action is unavailable in your hosted version, open GitHub Actions → **Prepare CMS publication** → Run workflow → **main**. Both routes read the latest saved cms/editorial snapshot. CMS context payloads are ignored; they cannot choose a different branch or execute code.
5. The job restores the complete schema, validates IDs/keys/permissions, merges independent changes on main and blocks same-field conflicts. It creates **cms/publish-… → main** containing only songs, content version and the editorial checkpoint. No changes means no PR/version bump. It never merges automatically.
6. Review the exact diff, rights evidence and passing validation; approve and merge manually. Do not add unrelated code or approvals into the generated PR. Re-run preparation if main moved or a conflict appeared. Required up-to-date checks prevent merging a stale result. The checkpoint supports normal, squash and rebase merges, so several later editorial batches remain independent.

A failed PR/API step can leave a prepared branch. Recover by creating a PR from that branch and running the **Validate SELAH** workflow on that branch; the required check must pass before merge. Do not merge a sparse editorial file directly into main. Do not merge the whole editorial branch: publication uses current main's application and scripts, not an older editorial copy.

## Verified lyrics

A public repo exposes **all branches and commit history**, even before Pages deployment. Do not paste unapproved lyrics, credentials, private journal data or confidential permission documents into editorial commits. Use approved text only after the owner has reviewed a lawful publication basis.

`rights` is a public attribution/authorization note; it does not prove authorization. `data/lyrics-permissions.json` contains reviewed records with `song_id`, SHA-256 hashes of exact UTF-8 `lyrics` and `rights`, `approved_by`, UTC `approved_at`, and a concise public `basis`. There are no approvals initially because all 38 lyrics are blank. Any nonblank lyric without a matching record fails validation. Changing even punctuation/line endings or the rights note invalidates its approval.

Owner/reviewer procedure (entirely through GitHub/CMS):

1. Review exact text and permission evidence privately. Only after authorization is established, enter that authorized text and its public rights note in the editorial draft. Do not commit private evidence. The draft check stays red until the matching approval is reviewed on main.
2. GitHub Actions → **Prepare lyric permission review** → Run workflow on **main**. Enter the stable song ID and a concise public basis, and confirm that you reviewed permission. It reads the saved draft, records hashes with your actual GitHub login, and creates an **approval-only PR**. This records your decision; software does not verify legal rights. No song/app/content version is changed.
3. Review that bot-authored PR and the authorization, approve and merge under the protected-main policy. A record can precede a new song's addition to the main catalog. Then run **Siapkan publikasi untuk review** for the songs. Publication reads only main's ledger, never a draft record from editorial.
4. If the text/rights hash differs, obtain a fresh review; do not weaken validation. The same branch/PR recovery procedure applies if Actions cannot create the permission PR.

For a reviewer who prefers local tools, the equivalent helper is:

```sh
node scripts/approve-lyrics.mjs --song s001 --by chndr455-netizen \
  --basis 'Ringkasan dasar izin publik yang sudah diperiksa' \
  --catalog /path/to/authorized-catalog.json
```

It prepares a ledger change only. Submit a separate reviewed PR; it never approves or publishes automatically.

Trust ultimately comes from owner review and protected main. A fabricated record merged by an authorized bypass cannot be detected as a legal determination by software. The app's submission opt-in remains unverified and cannot create a ledger approval.

## Format preservation and versioning

- The file is still a top-level JSON array with the same 18 fields. Strings stay strings, `cats` stays an array, existing IDs stay stable. All 38 songs are unchanged by integration.
- Pages CMS's root-list save removes empty strings and its `settings.content.merge` excludes root lists. We therefore configure every existing field and restore omitted optional strings in publication preparation. An absent optional field means empty/cleared in the draft; review clearings carefully. Required fields cannot be omitted. Unknown fields/schema drift fail instead of being silently dropped. Do not introduce hidden future fields without updating configuration and tests together.
- The pinned upstream test runs real config validation, initialization, field validators, mapping and sanitization, including a hidden `source` variant. It proves IDs/nonempty fields survive and normalization restores blank fields. It is **not** an authenticated hosted CMS save or GitHub Actions run.
- `version.content` becomes `sha256-<canonical-catalog-hash>` (the full hash is grouped in eight-character blocks so the existing mobile version label can wrap) only when catalog content changes. `version.app` remains 0.5.2. For a direct reviewed content PR, run `node scripts/version-content.mjs`. Validation rejects a catalog change with a stale/incorrect content version.
- `data/cms-publication.json` records the last reviewed editorial snapshot, allowing safe three-way merging even after squash. Do not reset/rewrite editorial history or hand-edit this checkpoint. Unrelated main edits survive; competing edits to the same field stop with an ID/field conflict message. Resolve deliberately on the editorial branch, retaining current main content as appropriate.
- There are no PWA asset, service worker, storage key/schema or submission-format changes. Existing network-first catalog/version fetching, offline cache fallback, local overlays and submission originals remain intact. Changing a song never updates the frozen `data/legacy-v02.json`.

## Validation and hosted acceptance

Development checks (npm tools are development-only; preview still needs no build):

```sh
npm ci
node tests/cms-content.mjs
node tests/cms-editorial.mjs
node scripts/check-content.mjs
node tests/validate.mjs
node tests/catalog-merge.mjs
node tests/service-model.mjs
node tests/song-submission.mjs
node tests/service-song-picker.mjs
# Checkout pagescms/pagescms at the pinned revision above, then:
SELAH_PAGES_CMS_SOURCE=/path/to/pagescms node tests/pages-cms-upstream.mjs
```

CI also checks out that exact upstream revision and runs the save audit. Headless UI stubs replace React components and unused filename helpers only; the tested config/schema/save transforms are upstream source. No CMS service is run locally.

Before production use, owner must test **on cms/editorial**, without merging test edits:

- Confirm all 38 songs and all fields load. Edit one harmless metadata field, save, then inspect the Git diff. Nonempty `source`, all IDs and data types must remain; omitted blank strings are expected and restored by preparation.
- Make a second edit and prepare a publication PR. Confirm only intended changes appear, all 18 fields are restored, the count/IDs remain, the content version changes and app/SW versions do not. Close the test PR and revert the test commits on editorial; do not force-reset history.
- Add a new dummy entry only in a disposable test branch, test duplicate IDs, blank title, invalid key and unapproved **self-authored test text**; confirm checks reject them. Never use third-party/private text for testing.
- Test a legitimate reviewed content update after merge: unchanged local records refresh, local song overrides remain, offline reload works, and an EDIT submission captures the refreshed content version/original. Physical hosted/browser behavior remains an owner acceptance step.

See [implementation evidence](EVIDENCE.md) for checks actually performed and outstanding activation steps.
