# SELAH v0.3.1 — Fire & Foundation / PWA

Pusat pembelajaran pelayanan musik gereja. Bahasa Indonesia, mobile-first, static PWA, nonkomersial. Migrasi dari SELAH v0.2: 38 profil lagu dan seluruh halaman fondasi dipertahankan; identitas merah/kuning/cream, welcome screen, data lagu eksternal, serta offline app shell ditambahkan.

## Deploy pertama (GitHub Pages)
1. Buat repository GitHub, misalnya `selah` (public jika menggunakan GitHub Free). Ekstrak ZIP. Upload/commit **isi ZIP** ke root repository `main`, termasuk `.nojekyll` dan `.github/workflows/validate.yml`. Jangan upload ZIP sebagai satu berkas atau menaruh semua isi di folder bersarang. Gunakan Git lokal atau unggah file/folder dengan tetap memastikan dotfiles masuk.
2. GitHub repository → Settings → Pages → Build and deployment → Source **Deploy from a branch** → `main` → `/(root)` → Save. Pastikan deploy berhasil dan HTTPS tersedia. URL proyek mengikuti `https://<username>.github.io/<repository>/`.
3. Hubungkan repository tersebut ke Codex Cloud, pilih environment/repository yang tepat, mulai dari `main`. Salin prompt di `docs/CODEX_HANDOFF.md` atau isi tugas berikutnya. Codex dapat menyiapkan PR sesuai izin yang diberikan; owner review dan merge. Jangan memasukkan token ke kode atau prompt.
4. Buka URL hasil deployment. Uji welcome, 38 lagu, local edit, refresh publik, instalasi dan offline. Di Android Chrome gunakan menu Instal aplikasi/Tambahkan ke layar utama jika ditawarkan; di iOS gunakan Safari → Bagikan → Tambah ke Layar Utama. Instalasi bergantung pada browser/platform. Online sekali sampai service worker selesai menyiapkan cache, kemudian coba offline.

Docs: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Local preview
Run `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000/`. Do not double-click `index.html` (`file://` does not support the fetch / PWA architecture). No npm install/build required. Localhost or HTTPS is required for service workers.

## Content vs local data
Published source of truth: `data/songs.json` (public). Each song can have multiple service categories, key, BPM, meter, form, lyrics, meaning, Bible references, notes, source and rights. No chord charts. Unknown values are blank. All existing 38 base profiles migrated; full lyrics remain blank until authorized. Other educational material lives in `index.html` in this release; extraction into separate data files is a later improvement.

Local add/edit/delete makes an overlay visible only on that browser/device. The public catalog is checked on launch and on clicking “Muat pembaruan publik”. An edited/deleted local record takes precedence over an update to that same ID; unmodified records update normally. “Pulihkan pustaka publik” discards song overrides, not journal or academy progress, and may clear invalid setlist slots. Export backups before reset. A v0.2 backup can be imported (migration uses frozen baseline). Local data isn't encrypted or synced. A separate origin (old local file vs GitHub Pages URL) cannot be read automatically; export JSON from old file and import on the new site, only if desired. Never publish that backup: it can contain personal notes and lyrics.

## Publishing without editing code
In Codex, send song information using `docs/CONTENT_GUIDE.md`. The agent should update only song content + content version and validate. Review PR diff, merge, then GitHub Pages publishes. Pages CMS is optional and not configured. App shell caches are versioned; users may need to close all SELAH tabs and reopen after an app update. Song JSON uses network-first with offline fallback. For an app release bump the manifest-related UI version, `data/version.json` and cache name in `sw.js`. No blanket cache clearing or local storage reset on updates.

## Verification
```sh
node tests/validate.mjs
node tests/catalog-merge.mjs
node --check assets/app.js
node --check sw.js
```
`docs/ACCEPTANCE_TESTS.md` records the live browser tests still needed. Automated validations do not verify legal rights, theology, musical accuracy or browser installability. See `AGENTS.md` for permanent contributor instructions and `ROADMAP.md` for scope.
