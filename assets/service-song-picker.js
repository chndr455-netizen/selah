// Selection rules affect new choices only; never reconcile away saved references.
export function songTypeForSegment(type){return type==='worship'?'W':type==='praise'?'P':'';}
export function songMatchesSegment(song,type){const wanted=songTypeForSegment(type);return !song||!wanted||song.type===wanted;}
const searchText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('id');
export function groupServiceSongs(songs,{type,category='',query=''}={}){
 const terms=searchText(query).trim().split(/\s+/).filter(Boolean),recommended=[],others=[];
 const matches=songs.filter(song=>songMatchesSegment(song,type)&&terms.every(term=>searchText([song.title,song.artist,song.key].join(' ')).includes(term)));
 matches.sort((a,b)=>a.title.localeCompare(b.title,'id')||a.id.localeCompare(b.id));
 for(const song of matches)(category&&song.cats.includes(category)?recommended:others).push(song);
 return {recommended,others};
}
export function incompatibleEntries(entries,songs,type){
 const byId=new Map(songs.map(song=>[song.id,song]));
 return entries.filter(entry=>entry.songId&&!songMatchesSegment(byId.get(entry.songId),type));
}
