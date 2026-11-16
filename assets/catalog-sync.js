// Three-way, per-field synchronization. Local data never becomes public authorization.
export const SONG_FIELDS=['title','artist','key','type','cats','theme','bpm','meter','form','bible','meaning','notes','status','url','lyrics','rights','source'];
const copy=value=>JSON.parse(JSON.stringify(value));
const value=(song,field)=>song?.[field]??(field==='cats'?[]:'');
export function sameField(field,a,b){
 if(field==='cats'&&Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every(c=>b.includes(c));
 if(typeof a==='string'&&typeof b==='string')return a===b;
 return JSON.stringify(a)===JSON.stringify(b);
}
export const sameSong=(a,b)=>!!a&&!!b&&Object.keys({...a,...b}).every(field=>sameField(field,a[field],b[field]));
export function readSongSync(raw){
 if(raw===undefined)return {schema:1,conflicts:[],hiddenIds:[]};
 if(raw?.schema!==1||!Array.isArray(raw.conflicts)||!Array.isArray(raw.hiddenIds)||!raw.hiddenIds.every(id=>typeof id==='string'))throw Error('Metadata sinkronisasi tidak valid.');
 for(const c of raw.conflicts)if(!c||typeof c.songId!=='string'||![...SONG_FIELDS,'$song'].includes(c.field)||!['both-changed','legacy-difference','id-collision','public-removed'].includes(c.reason)||!['baseValue','localValue','publicValue'].every(k=>typeof c[k]==='string'||(Array.isArray(c[k])&&c[k].every(x=>typeof x==='string'))))throw Error('Konflik sinkronisasi tidak valid.');
 return copy(raw);
}
export function mergeSongFields(base,local,published){
 const song={...published,...local,id:local.id},conflicts=[];
 for(const field of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(published)])){
  if(field==='id')continue;
  const before=value(base,field),mine=value(local,field),next=value(published,field);
  if(sameField(field,mine,before))song[field]=copy(next);
  else {song[field]=copy(mine);if(SONG_FIELDS.includes(field)&&!sameField(field,next,before)&&!sameField(field,mine,next))conflicts.push({songId:local.id,field,baseValue:copy(before),localValue:copy(mine),publicValue:copy(next),reason:'both-changed'});}
 }
 return {song,conflicts};
}
export function syncCatalog(base,working,next,metadata, {legacy=false,withheld=[]}={}){
 const sync=readSongSync(metadata),before=new Map(base.map(s=>[s.id,s])),local=new Map(working.map(s=>[s.id,s])),publicSongs=new Map(next.map(s=>[s.id,s]));
 const held=new Set(withheld),hidden=new Set(sync.hiddenIds),conflicts=new Map(sync.conflicts.map(c=>[JSON.stringify([c.songId,c.field]),c])),songs=[];
 for(const old of base)if(!local.has(old.id))hidden.add(old.id);
 for(const mine of working)hidden.delete(mine.id);
 function record(c){const key=JSON.stringify([c.songId,c.field]),previous=conflicts.get(key);conflicts.set(key,previous?{...c,baseValue:previous.baseValue,reason:previous.reason==='legacy-difference'&&c.reason==='both-changed'?'both-changed':previous.reason}:c)}
 for(const incoming of next){
  const previous=before.get(incoming.id),published=held.has(incoming.id)&&previous?{...incoming,lyrics:value(previous,'lyrics'),rights:value(previous,'rights')}:incoming;
  if(hidden.has(published.id))continue;
  const mine=local.get(published.id),old=before.get(published.id);
  if(!mine){songs.push(copy(published));continue}
  if(!old){
   songs.push(copy(mine));for(const field of SONG_FIELDS)if(!sameField(field,value(mine,field),value(published,field)))record({songId:mine.id,field,baseValue:'',localValue:copy(value(mine,field)),publicValue:copy(value(published,field)),reason:'id-collision'});
   continue;
  }
  const merged=mergeSongFields(old,mine,published);songs.push(merged.song);merged.conflicts.forEach(record);
  if(legacy)for(const field of SONG_FIELDS)if(!sameField(field,value(merged.song,field),value(published,field))&&!conflicts.has(JSON.stringify([mine.id,field])))record({songId:mine.id,field,baseValue:copy(value(old,field)),localValue:copy(value(merged.song,field)),publicValue:copy(value(published,field)),reason:'legacy-difference'});
 }
 for(const mine of working)if(!publicSongs.has(mine.id)){
  const old=before.get(mine.id);if(!old||!sameSong(old,mine)){songs.push(copy(mine));if(old)record({songId:mine.id,field:'$song',baseValue:old.title||mine.id,localValue:mine.title||mine.id,publicValue:'',reason:'public-removed'})}
 }
 const byId=new Map(songs.map(s=>[s.id,s]));
 for(const [key,c]of conflicts){
  const mine=byId.get(c.songId),published=publicSongs.get(c.songId);
  if(!mine||hidden.has(c.songId)){conflicts.delete(key);continue}
  if(c.field==='$song'){if(published)conflicts.delete(key);continue}
  if(!published)continue;
  if(sameField(c.field,value(mine,c.field),value(published,c.field))){conflicts.delete(key);continue}
  c.localValue=copy(value(mine,c.field));c.publicValue=copy(value(published,c.field));
 }
 return {songs,sync:{schema:1,conflicts:[...conflicts.values()],hiddenIds:[...hidden]}};
}
