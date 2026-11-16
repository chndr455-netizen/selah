import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
export const STRING_FIELDS=['id','title','artist','type','theme','notes','source','bpm','key','status','url','meter','form','bible','meaning','lyrics','rights'];
export const FIELDS=[...STRING_FIELDS,'cats'];
export const KEY_PATTERN='^$|^[A-G](?:#|b)?m?(?:/[A-G](?:#|b)?)?$';
export const REQUIRED=['id','title','type','cats','status'];
export const digest=text=>createHash('sha256').update(text,'utf8').digest('hex');
export function canonical(value){return JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v)}
// Group the full hash so the existing mobile version label can wrap without a UI release.
export const contentVersion=songs=>'sha256-'+digest(canonical(songs)).match(/.{8}/g).join('-');
export function normalizeDraft(raw){
 assert(Array.isArray(raw)&&raw.length>0,'Katalog harus berupa array lagu, bukan pembungkus objek.');
 return raw.map(song=>{
  assert(song&&typeof song==='object'&&!Array.isArray(song),'Data lagu tidak valid.');
  for(const key of Object.keys(song))assert(FIELDS.includes(key),`Kolom belum dikonfigurasi: ${song.id}.${key}; jangan menghapusnya.`);
  for(const key of REQUIRED)assert(Object.hasOwn(song,key),`Kolom wajib hilang: ${song.id}.${key}`);
  // Pages CMS sanitizes optional empty strings out of root lists. Restore only known text fields.
  return Object.fromEntries(FIELDS.map(key=>[key,Object.hasOwn(song,key)?song[key]:key==='cats'?[]:'']));
 });
}
export function validateCatalog(songs,permissions,{base=[]}={}){
 assert(Array.isArray(songs)&&songs.length>0,'Katalog harus berupa array.');const ids=new Set();
 assert(permissions?.schema===1&&Array.isArray(permissions.approvals),'Daftar verifikasi izin tidak valid.');
 const approvals=new Map();
 for(const a of permissions.approvals){
  assert(a&&typeof a.song_id==='string'&&!approvals.has(a.song_id),'ID verifikasi izin kosong/duplikat.');
  for(const k of ['lyrics_sha256','rights_sha256'])assert(/^[a-f0-9]{64}$/.test(a[k]),`Hash izin tidak valid: ${a.song_id}`);
  assert(typeof a.approved_by==='string'&&/^[A-Za-z0-9-]+$/.test(a.approved_by),'Identitas peninjau wajib diisi.');
  assert(typeof a.basis==='string'&&a.basis.trim(),'Dasar izin publik wajib diisi.');
  assert(typeof a.approved_at==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(a.approved_at)&&Number.isFinite(Date.parse(a.approved_at)),'Waktu verifikasi tidak valid.');
  approvals.set(a.song_id,a);
 }
 for(const song of songs){
  assert(song&&Object.keys(song).length===FIELDS.length&&FIELDS.every(k=>Object.hasOwn(song,k)),`Kolom lagu hilang/berlebih: ${song?.id}`);
  for(const k of STRING_FIELDS)assert.equal(typeof song[k],'string',`${song.id}.${k} harus teks.`);
  assert(/^s[0-9]{3,}$/.test(song.id)&&!ids.has(song.id),`ID tidak valid/duplikat: ${song.id}`);ids.add(song.id);
  assert(song.title.trim(),`Judul wajib: ${song.id}`);assert(['W','P'].includes(song.type),`Jenis tidak valid: ${song.id}`);
  assert(Array.isArray(song.cats)&&song.cats.length&&new Set(song.cats).size===song.cats.length&&song.cats.every(c=>['O','P','S','G','C'].includes(c)),`Kategori tidak valid: ${song.id}`);
  assert(new RegExp(KEY_PATTERN).test(song.key),`Nada dasar tidak valid: ${song.id}`);
  assert(song.bpm===''||/^(?:[2-9][0-9]|[12][0-9]{2}|300)$/.test(song.bpm),`BPM harus teks 20–300: ${song.id}`);
  assert(song.meter===''||/^[1-9][0-9]*\/(?:1|2|4|8|16|32)$/.test(song.meter),`Birama tidak valid: ${song.id}`);
  assert(['Kandidat','Dalam latihan','Siap'].includes(song.status),`Status tidak valid: ${song.id}`);
  if(song.url){const url=new URL(song.url);assert(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password,`Tautan tidak valid/mengandung kredensial: ${song.id}`)}
  if(song.lyrics.trim()){
   const a=approvals.get(song.id);assert(song.rights.trim()&&a&&a.lyrics_sha256===digest(song.lyrics)&&a.rights_sha256===digest(song.rights),`Izin lirik belum diverifikasi untuk teks/catatan persis ini: ${song.id}`);
  }
 }
 for(const old of base)assert(ids.has(old.id),`ID lama dihapus/diubah: ${old.id}`);
 return songs;
}
export function mergeEditorial(base,draft,current){
 const before=new Map(base.map(s=>[s.id,s])),latest=new Map(current.map(s=>[s.id,s])),edits=new Map(draft.map(s=>[s.id,s]));
 for(const id of before.keys())assert(edits.has(id)&&latest.has(id),`ID lama hilang: ${id}`);
 const result=current.map(song=>{
  const original=before.get(song.id),edit=edits.get(song.id);if(!edit)return song;
  if(!original){assert(canonical(song)===canonical(edit),`ID baru berbenturan: ${song.id}`);return song}
  return Object.fromEntries(FIELDS.map(k=>{
   const a=canonical(original[k]),b=canonical(edit[k]),c=canonical(song[k]);
   assert(b===a||c===a||b===c,`Konflik ${song.id}.${k}; tinjau main dan draf sebelum publikasi.`);
   return [k,b===a?song[k]:edit[k]];
  }));
 });
 for(const song of draft)if(!latest.has(song.id)){assert(!before.has(song.id),`ID lama hilang dari main: ${song.id}`);result.push(song)}
 return result;
}
