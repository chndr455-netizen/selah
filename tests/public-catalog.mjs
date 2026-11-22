import assert from 'node:assert/strict';import fs from 'node:fs';
import {normalizePublicCatalog,preparePublicCatalog,sha256} from '../assets/public-catalog.js';
import {contentVersion} from '../scripts/content-model.mjs';
const record={id:'s001',title:'Bejana-Mu',type:'W',cats:['O'],status:'Kandidat',key:'D',lyrics:'Teks uji milik pembuat tes\nBaris kedua',rights:'Izin uji yang telah diperiksa'};
const songs=normalizePublicCatalog([record]);assert.equal(songs[0].bpm,'');assert.equal(songs[0].artist,'');assert.equal(record.bpm,undefined);assert.throws(()=>normalizePublicCatalog([{...record,bpm:72}]));assert.throws(()=>normalizePublicCatalog({songs:[]}));
const approved={schema:1,approvals:[{song_id:'s001',lyrics_sha256:await sha256(record.lyrics),rights_sha256:await sha256(record.rights),approved_by:'chndr455-netizen',approved_at:'2026-11-16T00:00:00.000Z',basis:'Teks asli uji'}]};
let snapshot=await preparePublicCatalog(songs,approved,[],contentVersion(songs));assert.equal(snapshot.songs[0].lyrics,record.lyrics);assert.equal(snapshot.version,contentVersion(songs));assert.deepEqual(snapshot.blocked,[]);
for(const ledger of [{schema:1,approvals:[approved.approvals[0],approved.approvals[0]]},null,{schema:1,approvals:[]},{schema:1,approvals:[{...approved.approvals[0],lyrics_sha256:'0'.repeat(64)}]},{schema:1,approvals:[{...approved.approvals[0],basis:''}]}]){
 snapshot=await preparePublicCatalog(songs,ledger,[],contentVersion(songs));assert.equal(snapshot.songs[0].lyrics,'');assert.equal(snapshot.songs[0].rights,'');assert.equal(snapshot.songs[0].key,'D');assert.equal(snapshot.version,null);assert.deepEqual(snapshot.blocked,['s001']);
 const prior={...songs[0],lyrics:'Teks tersimpan sebelumnya',rights:'Catatan lama'};snapshot=await preparePublicCatalog(songs,ledger,[prior],contentVersion(songs));assert.equal(snapshot.songs[0].lyrics,prior.lyrics);assert.equal(snapshot.songs[0].rights,prior.rights);
}
snapshot=await preparePublicCatalog(songs,approved,[],'sha256-'+Array(8).fill('00000000').join('-'));assert.equal(snapshot.version,null);assert(snapshot.versionMismatch);assert.equal(snapshot.songs[0].lyrics,record.lyrics);
snapshot=await preparePublicCatalog(normalizePublicCatalog([{...record,lyrics:''}]),null,[],'2026-11-16.1');assert.equal(snapshot.version,'2026-11-16.1');assert.deepEqual(snapshot.blocked,[]);
// Diagnose actual main without printing/re-publishing its lyric text or granting an approval.
const current=normalizePublicCatalog(JSON.parse(fs.readFileSync('data/songs.json'))),permissions=JSON.parse(fs.readFileSync('data/lyrics-permissions.json'));
const actual=await preparePublicCatalog(current,permissions);for(const id of actual.blocked)assert.equal(actual.songs.find(s=>s.id===id).lyrics,'');assert.equal(actual.songs.length,current.length);
console.log(`OK: CMS sparse public shape, strict types, exact approved lyric hashes, unavailable/stale permissions, preserved previous text, version hashes and fail-closed main diagnostics (${actual.blocked.length} lyric entries withheld).`);
