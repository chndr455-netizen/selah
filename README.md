# SELAH v0.5.2 — Service Song Picker / PWA

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

Local add/edit/delete makes an overlay visible only on that browser/device. The public catalog is checked on launch and on clicking “Muat pembaruan publik”. An edited/deleted local record takes precedence over an update to that same ID; unmodified records update normally. “Pulihkan pustaka publik” discards song overrides, not journal or academy progress, and preserves setlist references, including missing songs. Export backups before reset. A v0.2 backup can be imported (migration uses frozen baseline). Local data isn't encrypted or synced. A separate origin (old local file vs GitHub Pages URL) cannot be read automatically; export JSON from old file and import on the new site, only if desired. Never publish that backup: it can contain personal notes and lyrics.

## Pengajuan lagu (v0.5.1)

Buka Lagu → menu filter → Tambah lagu, atau profil lagu → edit. **Simpan Lokal** menyimpan di perangkat seperti sebelumnya. **Ekspor Pengajuan (.json)** dan **Salin Pengajuan** hanya membuat pengajuan untuk ditinjau; keduanya tidak menyimpan formulir atau memublikasikan ke GitHub. Pilih penyertaan lirik dan informasi izin secara terpisah bila diperlukan. Kolom tambahan berada di Informasi Lanjutan.

Kirim berkas `selah-add-judul.json` / `selah-edit-judul.json` atau teks JSON ke ChatGPT/Codex untuk diperiksa sesuai [panduan konten](docs/CONTENT_GUIDE.md). Pengajuan EDIT membandingkan formulir dengan lagu publik, termasuk perubahan lokal yang sudah tersimpan. Lagu buatan lokal diajukan sebagai ADD. Jangan kirim cadangan penuh: pengajuan hanya berisi satu lagu. Baca isinya sebelum membagikan catatan atau teks izin yang Anda masukkan. Ekspor berfungsi offline setelah aplikasi tersimpan di cache; dukungan clipboard bergantung pada browser/izin.

## Publishing without editing code
In Codex, send song information using `docs/CONTENT_GUIDE.md`. The agent should update only song content + content version and validate. Review PR diff, merge, then GitHub Pages publishes. Pages CMS is optional and not configured. App shell caches are versioned; users may need to close all SELAH tabs and reopen after an app update. Song JSON uses network-first with offline fallback. For an app release bump the manifest-related UI version, `data/version.json` and cache name in `sw.js`. No blanket cache clearing or local storage reset on updates.

## Navigation (v0.4)

Five persistent bottom tabs organize the existing modules: Beranda; Lagu (catalog + profiles/lyrics); Ibadah (setlist, structure, arrangements); Belajar (academy + spiritual foundation); Lainnya (operations, reflections, song management, settings/data). Original hashes such as `#library`, `#setlist`, `#academy`, `#faith`, `#operations`, `#reflection`, `#manage`, `#service` and `#arrange` still work. Song profiles use `#song/<encoded-id>`. Settings and data backups are available through the header gear or Lainnya. The lyric reader is a focused modal with its own back and text-size controls.

Home now keeps only the greeting, concise search, devotional entry, shortcuts and featured songs. Complete devotional and legacy philosophy text remains in Fondasi Rohani; module descriptions are under Lainnya, and reference statistics are in Pengaturan. Lessons open on demand. In Lagu, the filter icon opens advanced controls; search, filters and latest per-route scroll positions survive in-app navigation for the current document session. They do not add fields to private backups.

The Service Builder keeps the six-song Ibadah Minggu starter, with editable Praise & Worship Night, Ibadah Khusus and Custom / Blank starters. Add any segment or song. Worship/Praise show matching musical types; Bebas shows both. Categories group matches into Disarankan and Lagu lainnya without restricting selection. Other segment types retain both musical types. The song picker searches titles, artists and keys. Type changes ask before clearing incompatible selections in the editor; cancellation preserves them. Opening old plans never clears mismatched or missing songs. Segments support multiple songs (including medleys), service-only key/flow/arrangement overrides, grip dragging, Alt+Up/Down and editor Up/Down controls. Non-musical segments are optional.

Confirmed edits save locally to the active setlist and its saved-library record. Selecting a template creates a new setlist, preserving the previous one. Template edits affect future copies, not existing setlists. Templates capture segments/song assignments/overrides and briefing; date, WL and theme belong to each service. Use the menu to load, duplicate or delete setlists/templates; use Bagikan & ekspor for clipboard, native sharing (clipboard/TXT fallback), TXT, standalone JSON and print. Standalone setlist JSON imports as a new independent copy.

Storage stays under `selah.v03.state`; v0.2/v0.4 schema-1 backups and `musicMinistry.v1` migrate to schema 2. All six legacy slot notes, selected song IDs (even outside old recommendations or missing from the library), metadata, library overlays, progress, checklist and reflections are retained. New full backups include every saved setlist and template and require v0.5+ to restore. The active `set` is also synchronized into `setlists`; `templates` are separate snapshots. Do not open new backups in an older app expecting schema 1. A failed storage write leaves the last saved data intact; export a recovery backup before closing.

The v0.5.2 picker leaves the published catalog and its content version unchanged. Segments saved with the new Bebas (`free`) type require v0.5.2+ to reopen; old schema-1/schema-2 plans retain their IDs and selections. See [v0.5 review evidence](docs/review/v050/README.md) for screenshots, test results and device limitations.

## Verification
```sh
node tests/validate.mjs
node tests/catalog-merge.mjs
node tests/service-model.mjs
node tests/song-submission.mjs
node tests/service-song-picker.mjs
node --check assets/song-submission.js
node --check assets/app.js
node --check sw.js
```
`docs/ACCEPTANCE_TESTS.md` records the live browser tests still needed. Automated validations do not verify legal rights, theology, musical accuracy or browser installability. See `AGENTS.md` for permanent contributor instructions and `ROADMAP.md` for scope.
