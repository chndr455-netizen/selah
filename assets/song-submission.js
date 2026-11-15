// Pure, single-song submission envelope. Never accepts or serializes application state.
const FIELDS=['title','artist','key','type','cats','theme','bpm','meter','form','bible','meaning','notes','status','url'];
const CATEGORIES=['O','P','S','G','C'];
function pick(song,includeLyrics,includeRights){
 const fields=[...FIELDS,...(includeLyrics?['lyrics']:[]),...(includeRights?['rights']:[])];
 return Object.fromEntries(fields.map(key=>{
  const value=song?.[key]??(key==='cats'?[]:'');
  if(key==='cats'){
   if(!Array.isArray(value)||!value.length||new Set(value).size!==value.length||!value.every(c=>CATEGORIES.includes(c)))throw Error('Pilih minimal satu kategori lagu yang valid.');
   return [key,[...value]];
  }
  if(typeof value!=='string')throw Error('Informasi lagu harus berupa teks.');
  return [key,value];
 }));
}
function validateSong(song){
 if(!song.title.trim())throw Error('Judul lagu wajib diisi.');
 if(!['W','P'].includes(song.type))throw Error('Pilih jenis musikal Worship atau Praise.');
 if(!['Kandidat','Dalam latihan','Siap'].includes(song.status))throw Error('Status lagu tidak valid.');
 if(song.bpm!==''&&(!/^\d+$/.test(song.bpm)||Number(song.bpm)<20||Number(song.bpm)>300))throw Error('BPM harus bilangan bulat antara 20 dan 300, atau kosong.');
 if(song.url){
  let url;try{url=new URL(song.url)}catch{throw Error('Gunakan tautan http atau https yang valid.')}
  if(!['http:','https:'].includes(url.protocol))throw Error('Gunakan tautan http atau https yang valid.');
  if(url.username||url.password)throw Error('Tautan pengajuan tidak boleh memuat nama pengguna atau kata sandi.');
 }
}
function equivalent(field,a,b){
 if(field==='cats')return CATEGORIES.every(c=>a.includes(c)===b.includes(c));
 return a.replace(/\r\n?/g,'\n')===b.replace(/\r\n?/g,'\n');
}
export function createSongSubmission({draft,published=null,baseVersion=null,includeLyrics=false,includeRights=false,submittedAt=new Date().toISOString()}){
 if(typeof includeLyrics!=='boolean'||typeof includeRights!=='boolean')throw Error('Pilihan penyertaan tidak valid.');
 if(typeof submittedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(submittedAt)||!Number.isFinite(Date.parse(submittedAt)))throw Error('Waktu pengajuan tidak valid.');
 if(baseVersion!==null&&(typeof baseVersion!=='string'||!baseVersion.trim()))throw Error('Versi pustaka tidak valid.');
 const proposed=pick(draft,includeLyrics,includeRights);validateSong(proposed);
 const result={format:'selah-song-submission',schema_version:1,action:published?'EDIT':'ADD',song_id:null,submitted_at:submittedAt,base_published_content_version:baseVersion};
 let original=null;
 if(published){
  if(typeof published.id!=='string'||!published.id.trim())throw Error('ID lagu publik tidak valid.');
  original=pick(published,includeLyrics,includeRights);
  // Credentials must not be copied through an original URL either.
  if(original.url){let url;try{url=new URL(original.url)}catch{}if(url?.username||url?.password)throw Error('Tautan asal mengandung kredensial; tinjau langsung dengan pengelola.');}
  const fieldStatus=Object.fromEntries(Object.keys(proposed).map(key=>[key,equivalent(key,original[key],proposed[key])?'unchanged':proposed[key]===''?'cleared':'modified']));
  const changed=Object.keys(fieldStatus).filter(key=>fieldStatus[key]!=='unchanged');
  if(!changed.length)throw Error('Belum ada perubahan yang disertakan. Centang lirik atau izin jika ingin mengajukannya.');
  Object.assign(result,{song_id:published.id,original,proposed,field_status:fieldStatus,changed_fields:changed});
 }else result.song=proposed;
 const hasLyrics=includeLyrics&&!!(proposed.lyrics.trim()||original?.lyrics?.trim());
 const warnings=[];
 if(baseVersion===null)warnings.push('Versi pustaka asal belum diketahui; bandingkan dengan katalog sebelum menerapkan.');
 if(hasLyrics)warnings.push('Izin publikasi lirik belum diverifikasi. Teks dan bukti izin harus ditinjau sebelum publikasi.');
 result.included_sensitive_fields={lyrics:includeLyrics,rights:includeRights};
 result.omitted_fields=['lyrics','rights'].filter(key=>!result.included_sensitive_fields[key]);
 result.review={required:true,publication_permission_verified:false,lyrics_permission:hasLyrics?'unverified':includeLyrics?'no_text':'not_included',warnings};
 return result;
}
export function submissionFilename(submission){
 const title=(submission.action==='EDIT'?submission.proposed:submission.song).title;
 const slug=title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80).replace(/-+$/,'')||'lagu';
 return `selah-${submission.action.toLowerCase()}-${slug}.json`;
}
// Catalog/version reads can fail independently while offline; never invent a version.
export async function fetchPublishedSnapshot(fetchSongs,fetchVersion){
 const before=await fetchVersion().catch(()=>null);
 const songs=await fetchSongs();
 const after=await fetchVersion().catch(()=>null);
 return {songs,version:typeof before==='string'&&before.trim()&&before===after?before:null};
}
