// Run only after the owner has verified permission. This records, never verifies, that review.
import fs from 'node:fs';
import {digest} from './content-model.mjs';
const args=process.argv.slice(2),get=name=>args.includes(name)?args[args.indexOf(name)+1]:null;
const id=get('--song'),by=get('--by'),basis=get('--basis'),file=get('--catalog')||'data/songs.json';
if(!id||!by||!basis)throw Error('Gunakan --song sNNN --by github-owner --basis "dasar izin publik" [--catalog berkas-draf.json].');
const song=JSON.parse(fs.readFileSync(file)).find(s=>s.id===id);if(!song?.lyrics?.trim()||!song?.rights?.trim())throw Error('Lirik dan catatan izin harus tersedia untuk ditinjau.');
const fileName='data/lyrics-permissions.json',ledger=JSON.parse(fs.readFileSync(fileName));ledger.approvals=ledger.approvals.filter(a=>a.song_id!==id);ledger.approvals.push({song_id:id,lyrics_sha256:digest(song.lyrics),rights_sha256:digest(song.rights),approved_by:by,approved_at:new Date().toISOString(),basis});fs.writeFileSync(fileName,JSON.stringify(ledger,null,2)+'\n');console.log('Catatan tinjauan disiapkan. Buat PR untuk review; tidak ada publikasi otomatis.');
