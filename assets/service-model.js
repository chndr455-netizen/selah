import { STARTERS, SEGMENT_TYPES } from './service-templates.js';
import { SLOTS } from './content.js';
export const copy = value => JSON.parse(JSON.stringify(value));
export const uid = prefix => prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
export const songEntry = (songId='', title='') => ({id:uid('entry'),songId,title,key:'',flow:'',notes:''});
export function segment(type='worship',name=SEGMENT_TYPES[type]||'Segmen baru') {
 return {id:uid('segment'),name,type,songs:[],notes:'',recommendation:{category:'',type:type==='worship'?'W':type==='praise'?'P':''}};
}
export function cloneSegment(value){return {...copy(value),id:uid('segment'),songs:value.songs.map(e=>({...copy(e),id:uid('entry')}))};}
export function makeService(template) {
 return {id:uid('service'),name:template?.name||'Setlist baru',date:'',wl:'',theme:'',notes:template?.notes||'',segments:(template?.segments||[]).map(cloneSegment)};
}
export function makeTemplate(plan,name=plan.name){return {id:uid('template'),name,notes:plan.notes||'',segments:plan.segments.map(cloneSegment)};}
export function starterTemplates(){return STARTERS.map(t=>({id:t.id,name:t.name,notes:'',segments:t.segments.map(s=>{const item=segment(s.type,s.name);return {...item,recommendation:s.recommendation||item.recommendation}})}));}
export function freshPlanning(){const templates=starterTemplates(),set=makeService(templates[0]);return {set,setlists:[copy(set)],templates};}
const text=(x,key)=>{if(typeof x?.[key]!=='string')throw Error('Teks alur tidak valid: '+key);return x[key]};
const identity=x=>{const id=text(x,'id');if(!id.trim())throw Error('ID alur kosong');return id};
function unique(items){const ids=new Set();for(const item of items){if(ids.has(item.id))throw Error('ID alur duplikat');ids.add(item.id)}return items;}
function validateSegments(items){
 if(!Array.isArray(items))throw Error('Segmen tidak valid');
 const entryIds=new Set();
 return unique(items.map(s=>{
  if(!s||!Object.hasOwn(SEGMENT_TYPES,s.type)||!Array.isArray(s.songs))throw Error('Jenis segmen tidak valid');
  const r=s.recommendation;if(!r||!['','O','P','S','G','C'].includes(r.category)||!['','W','P'].includes(r.type))throw Error('Saran lagu tidak valid');
  const songs=s.songs.map(e=>{const id=identity(e);if(entryIds.has(id))throw Error('ID lagu segmen duplikat');entryIds.add(id);return {id,songId:text(e,'songId'),title:text(e,'title'),key:text(e,'key'),flow:text(e,'flow'),notes:text(e,'notes')}});
  const name=text(s,'name');if(!name.trim())throw Error('Nama segmen kosong');
  return {id:identity(s),name,type:s.type,songs,notes:text(s,'notes'),recommendation:{category:r.category,type:r.type}};
 }));
}
export function validateService(s){const name=text(s,'name');if(!name.trim())throw Error('Nama setlist kosong');return {id:identity(s),name,date:text(s,'date'),wl:text(s,'wl'),theme:text(s,'theme'),notes:text(s,'notes'),segments:validateSegments(s.segments)};}
function validateTemplate(t){const name=text(t,'name');if(!name.trim())throw Error('Nama template kosong');return {id:identity(t),name,notes:text(t,'notes'),segments:validateSegments(t.segments)};}
export function validatePlanning(raw,songs){
 if(raw.schema===1){
  const old=raw.set;if(!old||!Array.isArray(old.slots)||old.slots.length!==6)throw Error('Setlist lama tidak valid');
  const set={id:'service-legacy',name:'Ibadah Minggu',date:text(old,'date'),wl:text(old,'wl'),theme:text(old,'theme'),notes:text(old,'notes'),segments:old.slots.map((slot,i)=>{
   const songId=text(slot,'id'),note=text(slot,'note'),spec=SLOTS[i];
   return {id:'legacy-segment-'+(i+1),name:spec.n,type:spec.t==='W'?'worship':'praise',notes:note,recommendation:{category:spec.c,type:spec.t},songs:songId?[{id:'legacy-entry-'+(i+1),songId,title:songs.find(s=>s.id===songId)?.title||songId,key:'',flow:'',notes:''}]:[]};
  })};
  return {set,setlists:[copy(set)],templates:starterTemplates()};
 }
 if(raw.schema!==2||!Array.isArray(raw.setlists)||!Array.isArray(raw.templates))throw Error('Format alur tidak sesuai');
 const set=validateService(raw.set),setlists=unique(raw.setlists.map(validateService)),templates=unique(raw.templates.map(validateTemplate));
 const i=setlists.findIndex(s=>s.id===set.id);if(i<0)setlists.push(copy(set));else setlists[i]=copy(set);
 return {set,setlists,templates};
}
export function syncActiveSet(state){const index=state.setlists.findIndex(s=>s.id===state.set.id);if(index<0)state.setlists.push(copy(state.set));else state.setlists[index]=copy(state.set);}
export function moveSegment(plan,id,delta){const from=plan.segments.findIndex(s=>s.id===id),to=from+delta;if(from<0||to<0||to>=plan.segments.length)return false;const [s]=plan.segments.splice(from,1);plan.segments.splice(to,0,s);return true;}
export function resolvedEntry(entry,songs){const song=songs.find(s=>s.id===entry.songId);return {title:song?.title||entry.title||entry.songId||'Lagu belum dipilih',key:entry.key||song?.key||'',bpm:song?.bpm||'',flow:entry.flow||song?.form||'',notes:entry.notes||song?.notes||'',missing:!!entry.songId&&!song};}
export function formatService(plan,songs){return ['SETLIST IBADAH | SELAH',plan.name,`Tanggal: ${plan.date||'—'}`,`WL: ${plan.wl||'—'}`,`Tema: ${plan.theme||'—'}`,'',...plan.segments.flatMap((s,i)=>[`${i+1}. ${s.name} (${SEGMENT_TYPES[s.type]})`,...s.songs.flatMap(e=>{const r=resolvedEntry(e,songs);return ['   '+r.title+(r.missing?' [tidak di pustaka]':''),...(r.key?['   Key: '+r.key]:[]),...(r.bpm?['   BPM: '+r.bpm]:[]),...(r.flow?['   Flow: '+r.flow]:[]),...(r.notes?['   Aransemen: '+r.notes]:[])]}),...(s.notes?['   Catatan: '+s.notes]:[]),'']),...(plan.notes?['Briefing: '+plan.notes]:[])].join('\n');}
