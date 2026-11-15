# Song Library — Panduan pengiriman konten ke Codex

Copy the following form into a Codex task. Fill only what you know; use “belum diketahui” for uncertain details. For lyrics, include exact owner-approved text and documented publication authorization, or leave blank. Never infer unknown credits or musical values. Categories can overlap. English equivalents: O Opening/Pembukaan, P Praise/Pujian, S Sermon/Sebelum firman, G Giving/Persembahan, C Closing/Penutup. W/P type is separate from the category. Under the local six-slot service, W fits O/S/C, P fits P/G; mixed-purpose suggestions may be recorded but the setlist filters by both type and category.

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
