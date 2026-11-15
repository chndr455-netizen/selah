# Acceptance tests — first deployment

Update 2026-11-15: Chromium subpath, local data, migration, offline and app-update checks now passed; see [audit results](AUDIT_2026-11-15.md). Live Pages and physical Android/iOS installation remain pending. The packaging note below records the earlier ZIP environment only.

At packaging: 38-song schema, icon paths, cache version, JS syntax, catalog merge and static HTML checks performed locally. Browser navigation was blocked by the environment's Chromium URL policy; no live interaction/installation or offline tests were completed. Verify after deployment or in Codex's browser-enabled environment.

1. Serve at `/selah/` or the actual GitHub project subpath. Check no console errors, failed asset requests, or missing icons. On 360px, 393px, tablet and desktop widths, check no horizontal page overflow; dialogs and nav remain usable.
2. Welcome appears on fresh document launch, exact headline/subtitle, verse marked as paraphrase, Open dismisses and enables navigation. Reopen via footer; keyboard focus remains usable.
3. Confirm initial 38 song profiles and category/type search. Add a test song locally; edit lyrics/key using original dummy text; reload and confirm persistence, local badge. Delete/restore and verify no changes to public JSON.
4. Edit one UNMODIFIED public record and add one test public record in test copy. Refresh/reopen. New entry and updated record should appear; existing local additions/edits should remain. Restore public library and verify local song overrides removed; other personal data remain. Roll test catalog back.
5. Create six-slot setlist, copy/download and print. Test academy check, reflection, checklist. Export/import backup and old v0.2 backup in a test profile; avoid publishing backups or test lyrics.
6. After initial online visit, wait for service worker control, then airplane mode/offline. Reload and open welcome, library, academy and stored notes. External links require internet. Restore internet, refresh song data, check public updates. Test an app-shell version update: close all tabs/relaunch when prompted; confirm new UI without loss of local edits. Install on Android Chrome and iOS Safari, as available. Test start URL/scope/icon/theme.
7. Public site is public. Confirm no personal journals, secrets, private contact info or unapproved lyrics were committed. Rights text is not by itself authorization.
