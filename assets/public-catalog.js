// Normalize public CMS shape without relaxing the repository's publication validator.
const OPTIONAL=['artist','theme','notes','source','bpm','key','url','meter','form','bible','meaning','lyrics','rights'];
export function normalizePublicCatalog(raw){
 if(!Array.isArray(raw)||!raw.length)throw Error('Pustaka publik tidak valid.');
 return raw.map(song=>{if(!song||typeof song!=='object'||Array.isArray(song))throw Error('Lagu publik tidak valid.');const result={...song};for(const field of OPTIONAL){if(!Object.hasOwn(result,field))result[field]='';else if(typeof result[field]!=='string')throw Error('Kolom publik harus berupa teks: '+field)}return result});
}
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export async function sha256(text){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('')}
export async function preparePublicCatalog(songs,permissions,previous=[],version=null){
 const before=new Map(previous.map(s=>[s.id,s])),blocked=[],approvals=new Map(),seen=new Set();
 if(permissions?.schema===1&&Array.isArray(permissions.approvals))for(const a of permissions.approvals){
  if(typeof a?.song_id==='string'){if(seen.has(a.song_id)){approvals.delete(a.song_id);continue}seen.add(a.song_id);}
  if(a&&typeof a.song_id==='string'&&/^[a-f0-9]{64}$/.test(a.lyrics_sha256)&&/^[a-f0-9]{64}$/.test(a.rights_sha256)&&typeof a.approved_by==='string'&&/^[A-Za-z0-9-]+$/.test(a.approved_by)&&typeof a.basis==='string'&&a.basis.trim()&&typeof a.approved_at==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(a.approved_at)&&Number.isFinite(Date.parse(a.approved_at))&&!approvals.has(a.song_id))approvals.set(a.song_id,a);
 }
 const fingerprint=await sha256(canonical(songs)),expected='sha256-'+fingerprint.match(/.{8}/g).join('-');
 const accepted=await Promise.all(songs.map(async song=>{
  if(!song.lyrics.trim())return {...song};
  const approval=approvals.get(song.id);
  if(approval&&song.rights.trim()&&approval.lyrics_sha256===await sha256(song.lyrics)&&approval.rights_sha256===await sha256(song.rights))return {...song};
  blocked.push(song.id);const old=before.get(song.id);
  // Withhold unverified incoming text, never erase the previous baseline or local working copy.
  return {...song,lyrics:old?.lyrics||'',rights:old?.rights||''};
 }));
 const versionMismatch=!!version?.startsWith('sha256-')&&version!==expected;
 return {songs:accepted,version:blocked.length||versionMismatch?null:version,fingerprint,blocked,versionMismatch};
}
