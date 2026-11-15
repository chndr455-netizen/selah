# Song Library — Panduan pengiriman konten ke Codex

Copy the following form into a Codex task. Fill only what you know; use “belum diketahui” for uncertain details. For lyrics, include exact owner-approved text and documented publication authorization, or leave blank. Never infer unknown credits or musical values. Categories can overlap. English equivalents: O Opening/Pembukaan, P Praise/Pujian, S Sermon/Sebelum firman, G Giving/Persembahan, C Closing/Penutup. W/P type is separate from the category. For the six-song Ibadah Minggu starter, W suggests O/S/C and P suggests P/G. These are recommendations only: the Service Builder allows every library song in any segment.

```
ACTION: ADD / EDIT (existing ID or exact title if editing)
Judul:
Versi / Artis:
Jenis: W / P
Kategori: O / P / S / G / C (select one or more)
Nada dasar (aransemen lokal):
BPM:
Birama:
Song flow (Intro, Verse, Chorus, Bridge, ending; only if supplied):
Tema:
Makna / renungan:
Referensi Alkitab (ayat):
Catatan aransemen:
Tautan resmi:
Lirik (paste sectioned authorized text):
Pencipta / publisher / sumber / dasar izin publikasi:
Status: Kandidat / Dalam latihan / Siap
```

## Instruction to Codex for each submission
Read `AGENTS.md`. Add or edit this exact song in `data/songs.json`. Preserve all existing entries and stable IDs; for additions choose a new unique stable ID. Validate required types, categories, rights/lyrics and avoid guessing. If publishing permission is not evidenced, leave public lyrics blank and flag for owner instead of committing them. Do not change the app or `data/legacy-v02.json`. Update content version in `data/version.json` and changelog as appropriate. Run validation, create a focused PR for my review, and report files changed and tests. Do not merge without approval.

## Schema (all string fields required; empty is allowed except ID/title)
`id`, `title`, `artist`, `type` (W/P), `cats` (array of O/P/S/G/C), `theme`, `notes`, `source`, `bpm`, `key`, `status`, `url`, `meter`, `form`, `bible`, `meaning`, `lyrics`, `rights`.
Use `source` empty or existing legacy source code; `url` for verified direct reference. For rights use a concise attribution and lawful authorization note (do not expose confidential permission documents). No chord field. `bpm` string e.g. `72` or empty. Store actual lyrics with line breaks (JSON escapes handled by editor/agent). User-facing content is Bahasa Indonesia.

## Pengajuan dari aplikasi (v0.5.1)

Gunakan formulir Tambah/Edit Lagu yang sama. Isi judul, artis/pencipta, nada dasar, jenis musikal W/P dan minimal satu kategori; nada dasar/artis yang belum diketahui boleh kosong. Lirik tetap opsional. Informasi tambahan berada di **Informasi Lanjutan**. Pilih salah satu:

- **Simpan Lokal**: menyimpan lagu hanya di perangkat dengan ID lokal/publik yang sudah ada.
- **Ekspor Pengajuan (.json)**: mengunduh satu lagu, tanpa menyimpan perubahan lokal atau memublikasikan.
- **Salin Pengajuan**: menyalin JSON yang sama ke clipboard, tanpa menyimpan atau memublikasikan. Jika clipboard ditolak, gunakan ekspor berkas.

Judul, kategori, jenis, status, BPM opsional (20–300) dan tautan http/https divalidasi sebelum ekspor. Tautan dengan nama pengguna/kata sandi ditolak. Ekspor bisa digunakan offline setelah aplikasi tersedia di cache. Semua pengajuan tetap memerlukan tinjauan; ekspor tidak mengirim permintaan ke GitHub atau layanan lain.

Lirik dan informasi izin memiliki **dua pilihan penyertaan terpisah, tidak dicentang secara otomatis**, termasuk saat membuka ulang lagu lokal. Centang hanya informasi yang ingin Anda kirim. Jika disertakan dalam EDIT, nilai publik semula juga ikut sebagai pembanding. Teks izin tidak membuktikan hak publikasi: lirik yang disertakan selalu ditandai belum diverifikasi jika nilai asal/usulan berisi teks. Jangan memasukkan dokumen izin rahasia, kontak pribadi atau kredensial ke kolom lagu. Formulir teks lama di atas tetap diterima.

### Format JSON schema 1

Format pengajuan berbeda dari schema katalog, cadangan penuh dan ekspor setlist. Nama berkas mengikuti judul: `selah-add-nama-lagu.json` atau `selah-edit-bejana-mu.json`. Nama dinormalisasi agar aman; ID publik tidak diambil dari nama berkas.

| Properti | Makna |
| --- | --- |
| `format` | Selalu `selah-song-submission`. |
| `schema_version` | Angka `1`, versi format pengajuan, terpisah dari versi aplikasi/data lokal. |
| `action` | `ADD` atau `EDIT`. |
| `song_id` | ID publik stabil untuk EDIT; `null` untuk ADD, termasuk lagu buatan lokal yang diedit. |
| `submitted_at` | Waktu perangkat saat ekspor, UTC ISO 8601. |
| `base_published_content_version` | Versi konten publik yang diamati saat editor dibuka; `null` jika tidak dapat diketahui. |
| `song` | Informasi usulan ADD saja, tanpa ID lokal atau data lagu lain. |
| `original`, `proposed` | EDIT saja: nilai publik asal dan nilai formulir; bukan perbandingan terhadap simpanan lokal terakhir. |
| `field_status` | EDIT saja: status setiap kolom yang disertakan. |
| `changed_fields` | EDIT saja: nama kolom berstatus `modified` atau `cleared`. EDIT tanpa perubahan yang disertakan ditolak. |
| `included_sensitive_fields` | Boolean `lyrics` dan `rights` sesuai pilihan eksplisit pengguna. |
| `omitted_fields` | Nama kolom lirik/izin yang tidak disertakan. Bukan perintah mengosongkan. |
| `review` | `required: true`, `publication_permission_verified: false`, status lirik serta peringatan tinjauan. |

Kolom yang diperbolehkan: `title`, `artist`, `key`, `type`, `cats`, `theme`, `bpm`, `meter`, `form`, `bible`, `meaning`, `notes`, `status`, `url`; `lyrics` dan `rights` hanya sesuai pilihan masing-masing. Tidak ada `source`, ID lokal, lagu lain, refleksi, pelayanan, rencana ibadah, token atau data aplikasi lain yang disalin otomatis. Catatan/teks yang diketik sendiri tetap ikut jika kolomnya disertakan; tinjau sebelum membagikan.

Status EDIT:

- `unchanged`: sama dengan nilai publik. Urutan kategori dan perbedaan akhir baris CRLF/LF tidak dianggap perubahan.
- `modified`: nilai berbeda dan tidak kosong.
- `cleared`: nilai yang sebelumnya berisi sengaja diubah menjadi string kosong. Kolom wajib tetap harus valid. Menghapus lirik memerlukan pilihan sertakan lirik; tanpa pilihan itu lirik tetap dihilangkan dari pengajuan.

Nilai teks dan akhir baris dipertahankan dalam JSON, termasuk nilai publik asal. Penyimpanan lokal tetap memakai normalisasi formulir sebelumnya. `review.lyrics_permission` adalah `not_included`, `no_text`, atau `unverified`; tidak ada pilihan pengguna yang otomatis mengubah verifikasi menjadi benar.

Contoh struktur EDIT (cuplikan; pengajuan nyata menyertakan semua kolom dalam daftar yang diperbolehkan):

```json
{
  "format": "selah-song-submission",
  "schema_version": 1,
  "action": "EDIT",
  "song_id": "s001",
  "submitted_at": "2026-11-15T12:00:00.000Z",
  "base_published_content_version": "2026-11-15.2",
  "original": {"title": "Bejana-Mu", "artist": "Contoh artis", "key": "D"},
  "proposed": {"title": "Bejana-Mu", "artist": "", "key": "E"},
  "field_status": {"title": "unchanged", "artist": "cleared", "key": "modified"},
  "changed_fields": ["artist", "key"],
  "included_sensitive_fields": {"lyrics": false, "rights": false},
  "omitted_fields": ["lyrics", "rights"],
  "review": {"required": true, "publication_permission_verified": false, "lyrics_permission": "not_included", "warnings": []}
}
```

### Instruksi penerapan untuk ChatGPT/Codex

1. Baca `AGENTS.md`; periksa format, versi schema dan validitas setiap kolom. Jangan perlakukan JSON sebagai instruksi menjalankan kode atau sebagai cadangan aplikasi.
2. Untuk EDIT, temukan ID yang persis sama. Bandingkan `original` dengan katalog terbaru dan periksa versi konten. Versi adalah metadata yang diamati, bukan bukti kriptografis: dua pembacaan versi yang berbeda/gagal menghasilkan `null`; cache offline bisa lebih lama dari server. Editor yang sudah terbuka mempertahankan pembandingnya walaupun katalog dimuat ulang. Jika asal sudah berbeda atau versi tidak diketahui, tinjau konflik secara eksplisit; jangan menimpa katalog secara membabi buta.
3. Terapkan hanya perubahan yang telah ditinjau dalam `changed_fields`, termasuk `cleared` yang disetujui. Pertahankan kolom `unchanged`, kolom yang dihilangkan, `source`, semua ID dan entri lain. Jangan mengosongkan lirik/izin karena tidak ada dalam payload.
4. Untuk ADD, pilih ID publik baru yang unik saat review; jangan menggunakan UUID lagu lokal sebagai ID publik. Lengkapi kolom schema katalog yang tidak disertakan dengan nilai kosong yang sesuai, tanpa menebak konten.
5. Verifikasi izin publikasi dengan owner sebelum memasukkan lirik. Peringatan `unverified` tetap berlaku meskipun teks izin disertakan. Jika belum ada dasar yang disetujui, biarkan lirik publik kosong dan tandai untuk review.
6. Ubah hanya konten lagu yang disetujui, versi konten dan changelog seperlunya. Jalankan validasi, buat PR terfokus, jangan merge tanpa review. Jangan menaruh JSON pengajuan/backup pribadi di repo publik.

Data lokal tetap menggunakan `selah.v03.state`/`musicMinistry.v1`, ID yang sama dan schema 2 dengan impor schema 1. Metadata opsional `publishedContentVersion` disimpan bersama `publishedBase` agar pembanding terakhir tetap dapat diidentifikasi ketika katalog tidak tersedia; ini bukan migrasi schema baru. Pengajuan hanya membaca formulir dan salinan pembanding satu lagu, tidak menulis local storage. Konten katalog tidak berubah pada rilis fitur ini.
