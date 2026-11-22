// Optional owner editorial record. This never grants rights or independently verifies permission.
import fs from 'node:fs';
import {digest} from './content-model.mjs';
const args=process.argv.slice(2),get=name=>args.includes(name)?args[args.indexOf(name)+1]:null;
const id=get('--song'),by=get('--by'),basis=get('--basis'),file=get('--catalog')||'data/songs.json';
if(!id||!by||!basis)throw Error('Gunakan --song sNNN --by github-owner --basis "dasar izin publik" [--catalog berkas-draf.json].');
const song=JSON.parse(fs.readFileSync(file)).find(s=>s.id===id);if(!song?.lyrics?.trim())throw Error('Lirik harus tersedia untuk dicatat.');
const fileName='data/lyrics-permissions.json',ledger=fs.existsSync(fileName)?JSON.parse(fs.readFileSync(fileName)):{schema:1,approvals:[]};ledger.approvals=ledger.approvals.filter(a=>a.song_id!==id);ledger.approvals.push({song_id:id,lyrics_sha256:digest(song.lyrics),rights_sha256:digest(song.rights||''),approval_type:'owner-confirmed',approved_by:by,approved_at:new Date().toISOString(),basis});fs.writeFileSync(fileName,JSON.stringify(ledger,null,2)+'\n');console.log('Catatan tinjauan disiapkan. Buat PR untuk review; tidak ada publikasi otomatis.');
