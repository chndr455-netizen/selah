import assert from 'node:assert/strict';import fs from 'node:fs';
import {normalizePublicCatalog,preparePublicCatalog,sha256} from '../assets/public-catalog.js';
import {contentVersion} from '../scripts/content-model.mjs';
const record={id:'s001',title:'Bejana-Mu',type:'W',cats:['O'],status:'Kandidat',key:'D',lyrics:'Teks uji milik pembuat tes\nBaris kedua',rights:''};
const songs=normalizePublicCatalog([record]);assert.equal(songs[0].bpm,'');assert.equal(songs[0].artist,'');assert.equal(record.bpm,undefined);assert.throws(()=>normalizePublicCatalog([{...record,bpm:72}]));assert.throws(()=>normalizePublicCatalog({songs:[]}));
const approved={schema:1,approvals:[{song_id:'s001',lyrics_sha256:await sha256(record.lyrics),rights_sha256:await sha256(record.rights),approved_by:'chndr455-netizen',approved_at:'2026-11-22T00:00:00.000Z',basis:'Teks asli uji'}]};
for(const ledger of [null,undefined,{schema:1,approvals:[]},approved,{schema:1,approvals:[approved.approvals[0],approved.approvals[0]]},{schema:1,approvals:[{...approved.approvals[0],lyrics_sha256:'0'.repeat(64)}]},{invalid:true}]){
 const prior={...songs[0],lyrics:'Teks lama',rights:'Catatan lama'};const snapshot=await preparePublicCatalog(songs,ledger,[prior],contentVersion(songs));assert.equal(snapshot.songs[0].lyrics,record.lyrics);assert.equal(snapshot.songs[0].rights,'');assert.equal(snapshot.version,contentVersion(songs));assert.deepEqual(snapshot.blocked,[]);
}
const snapshot=await preparePublicCatalog(songs,null,[],'sha256-'+Array(8).fill('00000000').join('-'));assert.equal(snapshot.version,null);assert(snapshot.versionMismatch);assert.equal(snapshot.songs[0].lyrics,record.lyrics);
const current=normalizePublicCatalog(JSON.parse(fs.readFileSync('data/songs.json')));const actual=await preparePublicCatalog(current,null,[],contentVersion(current));assert.equal(actual.songs.length,current.length);for(let i=0;i<current.length;i++){assert.equal(actual.songs[i].lyrics,current[i].lyrics);assert.equal(actual.songs[i].rights,current[i].rights)}assert.deepEqual(actual.blocked,[]);
console.log('OK: pilot displays lyrics with absent/empty/stale/malformed optional approval records, preserves attribution/text and still detects content-version mismatches.');
