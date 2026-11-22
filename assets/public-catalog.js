// Normalize public CMS shape without relaxing the repository's publication validator.
const OPTIONAL=['artist','theme','notes','source','bpm','key','url','meter','form','bible','meaning','lyrics','rights'];
export function normalizePublicCatalog(raw){
 if(!Array.isArray(raw)||!raw.length)throw Error('Pustaka publik tidak valid.');
 return raw.map(song=>{if(!song||typeof song!=='object'||Array.isArray(song))throw Error('Lagu publik tidak valid.');const result={...song};for(const field of OPTIONAL){if(!Object.hasOwn(result,field))result[field]='';else if(typeof result[field]!=='string')throw Error('Kolom publik harus berupa teks: '+field)}return result});
}
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export async function sha256(text){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('')}
// Pilot: the owner manages publication editorially; a ledger is not a display prerequisite.
// Keep the older call signature for importers/tests; never infer legal verification here.
export async function preparePublicCatalog(songs,_permissions=null,_previous=[],version=null){
 const fingerprint=await sha256(canonical(songs)),expected='sha256-'+fingerprint.match(/.{8}/g).join('-');
 const versionMismatch=!!version?.startsWith('sha256-')&&version!==expected;
 return {songs:songs.map(song=>({...song})),version:versionMismatch?null:version,fingerprint,blocked:[],versionMismatch};
}
