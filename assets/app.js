import { icon, injectIcons } from './icons.js';
import { SRC, SLOTS, CHECKS } from './content.js';
import { freshPlanning, validatePlanning, syncActiveSet } from './service-model.js';
import { createServiceBuilder } from './service-builder.js';
import { createSongSubmission, submissionFilename, fetchPublishedSnapshot } from './song-submission.js';
import { sameSong, sameField, mergeSongFields, syncCatalog, readSongSync, SONG_FIELDS } from './catalog-sync.js';
import { normalizePublicCatalog, preparePublicCatalog } from './public-catalog.js';


let publishedContentVersion=null,submissionContext=null,editorStart=null;
let songSync=readSongSync(),publishedFingerprint=null,publishedObservedVersion=null,publishedVersionMismatch=false;
let SEED=[]; let publishedAvailable=false; let libraryMessage="Memuat pustaka publik…";
const CAT={O:'Pembukaan',P:'Pujian',S:'Sebelum firman',G:'Persembahan',C:'Penutup'};
const THEMATIC={}; const EXTRA={fMeter:"meter",fForm:"form",fBible:"bible",fMeaning:"meaning",fLyrics:"lyrics",fRights:"rights"}; const enrich=s=>({...s, meter:typeof s.meter==="string"?s.meter:"", form:typeof s.form==="string"?s.form:"", bible:typeof s.bible==="string"?s.bible:(THEMATIC[s.id]||""), meaning:typeof s.meaning==="string"?s.meaning:"", lyrics:typeof s.lyrics==="string"?s.lyrics:"", rights:typeof s.rights==="string"?s.rights:""});

const KEY='selah.v03.state';const LEGACY_KEY='musicMinistry.v1';const $=id=>document.getElementById(id);const clone=o=>JSON.parse(JSON.stringify(o));const fresh=()=>({schema:2,songs:clone(SEED).map(enrich),...freshPlanning(),checks:CHECKS.map(()=>false),lessons:Array(10).fill(false),reflections:[]});let state=fresh(), baseline=[], storageOK=true,activeCat='',editing=null,timer;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
// Three-way public baseline + working fields; no reset or whole-record overlay.
function checkedCatalog(songs){return validate({...fresh(),songs:normalizePublicCatalog(songs)}).songs;}
async function fetchCatalogRaw(path='./data/songs.json'){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const songs=normalizePublicCatalog(await r.json());checkedCatalog(songs);return songs;}
async function fetchCatalog(path='./data/songs.json'){return checkedCatalog(await fetchCatalogRaw(path));}
async function fetchContentVersion(){const r=await fetch('./data/version.json',{cache:'no-store'});if(!r.ok)throw Error('Versi tidak tersedia');const v=await r.json();if(typeof v.content!=='string'||!v.content.trim())throw Error('Versi tidak valid');return v.content;}
async function publishedSnapshot(previous=baseline){
 const raw=await fetchPublishedSnapshot(()=>fetchCatalogRaw(),fetchContentVersion);
 const snapshot=await preparePublicCatalog(raw.songs,null,previous,raw.version);
 if(raw.version&&raw.version===publishedObservedVersion&&(publishedVersionMismatch||(publishedFingerprint&&snapshot.fingerprint!==publishedFingerprint))){snapshot.version=null;snapshot.versionMismatch=true;}
 return {...snapshot,songs:checkedCatalog(snapshot.songs),observedVersion:raw.version};
}
function snapshotMetadata(snapshot){publishedContentVersion=snapshot.version;publishedObservedVersion=snapshot.observedVersion;publishedFingerprint=snapshot.fingerprint;publishedVersionMismatch=snapshot.versionMismatch;profileSnapshot=null;}
function snapshotMessage(snapshot){return 'Pustaka publik dimuat (jaringan atau cache offline).'+(snapshot.versionMismatch?' Versi konten tidak cocok; versi pengajuan ditandai belum diketahui.':'');}
function applyCatalog(base,working,next,metadata=songSync,legacy=false){const result=syncCatalog(base,working,next,metadata,{legacy});songSync=result.sync;return result.songs;}
async function load(){
 let saved=null,unreadable=false,previous=[];
 try{const raw=localStorage.getItem(KEY);if(raw)saved=JSON.parse(raw);else{const old=localStorage.getItem(LEGACY_KEY);if(old){saved=JSON.parse(old);}}}catch{storageOK=false;unreadable=true;}
 try{if(saved?.publishedBase)previous=checkedCatalog(saved.publishedBase);}catch{}
 publishedFingerprint=typeof saved?.publishedFingerprint==='string'?saved.publishedFingerprint:null;publishedVersionMismatch=saved?.publishedVersionMismatch===true;
 publishedObservedVersion=typeof saved?.publishedObservedVersion==='string'?saved.publishedObservedVersion:saved?.publishedContentVersion||null;
 try{const snapshot=await publishedSnapshot(previous);SEED=snapshot.songs;snapshotMetadata(snapshot);publishedAvailable=true;libraryMessage=snapshotMessage(snapshot);}
 catch{libraryMessage='Pustaka publik belum tersedia. Data perangkat dipertahankan.';if(previous.length){SEED=previous;publishedContentVersion=saved.publishedContentVersion||null;publishedAvailable=true;libraryMessage='Menggunakan salinan pustaka publik terakhir dari perangkat.';}}
 baseline=clone(SEED);state=fresh();
 if(unreadable){libraryMessage+=' Data perangkat tidak dapat dibaca dan tidak ditimpa.';return;}
 if(saved)try{
  const working=validate(saved);songSync=readSongSync(saved.songSync);
  if(!previous.length)previous=await fetchCatalog('./data/legacy-v02.json').catch(()=>clone(SEED));
  state=working;if(publishedAvailable)state.songs=applyCatalog(previous,working.songs,SEED,songSync,saved.songSync===undefined);else baseline=previous;
  reconcile();
 }catch{storageOK=false;libraryMessage+=' Cadangan lokal tidak valid; data asal tidak ditimpa.';return;}
 if(publishedAvailable)save();
}
function save(){syncActiveSet(state);try{localStorage.setItem(KEY,JSON.stringify({...state,publishedBase:baseline,publishedContentVersion,publishedFingerprint,publishedObservedVersion,publishedVersionMismatch,songSync}));storageOK=true}catch(e){storageOK=false}storageNotice();return storageOK}
function updateLibraryStatus(){const b=new Map(baseline.map(s=>[s.id,s]));const local=state.songs.filter(s=>!sameSong(b.get(s.id),s)).length;const removed=baseline.filter(s=>!state.songs.some(z=>z.id===s.id)).length;$('libraryStatus').textContent=`${libraryMessage} ${baseline.length} lagu publik · ${local} tambahan/perubahan lokal · ${removed} disembunyikan lokal. ${songSync.conflicts.length} perbedaan perlu ditinjau.`;}
function isLocalSong(s){return !sameSong(baseline.find(z=>z.id===s.id),s);}
function storageNotice(){$('storageStatus').textContent=storageOK?'Tersimpan di perangkat ini.':'Penyimpanan lokal tidak tersedia atau data gagal dibaca; ekspor JSON sebelum menutup halaman.'}
function notify(t){if($('libraryOptions').open){$('libraryActionStatus').textContent=t;return;}$('toast').textContent=t;$('toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('toast').hidden=true,3200)}
function validate(x){if(!x||![1,2].includes(x.schema)||!Array.isArray(x.songs)||x.songs.length>10000||!Array.isArray(x.checks)||x.checks.length!==CHECKS.length)throw Error('Format tidak sesuai');const ids=new Set();const strings=['title','artist','theme','notes','source','bpm','key','status','url'];const songs=x.songs.map(s=>{if(!s||typeof s.id!=='string'||!s.id||ids.has(s.id)||!['W','P'].includes(s.type)||!Array.isArray(s.cats)||!s.cats.length||s.cats.some(c=>!Object.hasOwn(CAT,c))||strings.some(k=>typeof s[k]!=='string')||!s.title.trim()||!['Kandidat','Dalam latihan','Siap'].includes(s.status))throw Error('Data lagu tidak valid');ids.add(s.id);return enrich({...s,url:safeUrl(s.url),cats:[...new Set(s.cats)]})});return {schema:2,songs,...validatePlanning(x,songs),checks:x.checks.map(Boolean),lessons:Array.from({length:10},(_,i)=>Boolean(x.lessons?.[i])),reflections:Array.isArray(x.reflections)?x.reflections.filter(r=>r&&["id","date","role","good","improve","next"].every(k=>typeof r[k]==="string")):[]}}
const tabForPage = {home:'home',library:'library',profile:'library',setlist:'setlist',service:'setlist',arrange:'setlist',academy:'academy',faith:'academy',more:'more',operations:'more',reflection:'more',manage:'more',settings:'more'};
const routeAliases = {songs:'library',learn:'academy',devotion:'faith'};
let profileReturn = 'library';
let activeRoute = '', routeAnimation;
const scrollPositions = new Map();
history.scrollRestoration = 'manual';
function resolveRoute(route) {
  let id=Object.hasOwn(routeAliases,route)?routeAliases[route]:route, songId=null;
  if(id.startsWith('song/')) {
    try { songId=decodeURIComponent(id.slice(5)); } catch { songId=''; }
    if(state.songs.some(song=>song.id===songId)) id='profile';
    else { id='library'; songId=null; }
  }
  if(!document.getElementById(id)?.classList.contains('page') || (id==='profile'&&!songId)) id='home';
  return {id,songId,route:id==='profile'?'song/'+encodeURIComponent(songId):id};
}
function page(route, push=true) {
  const next=resolveRoute(route);
  // popstate and hashchange may describe the same history traversal. Handle it once.
  if(next.route===activeRoute){if(location.hash!=='#'+next.route)history.replaceState(history.state,'','#'+next.route);return;}
  const previous=activeRoute;
  if(previous)scrollPositions.set(previous,window.scrollY);
  routeAnimation?.cancel();
  if(next.songId)renderProfile(next.songId);
  document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===next.id));
  document.querySelectorAll('.nav button').forEach(el=>{
    const active=el.dataset.page===tabForPage[next.id];
    el.classList.toggle('active',active);
    if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
  });
  if(location.hash!=='#'+next.route) {
    const entry={...history.state,selahFrom:previous};
    history[push?'pushState':'replaceState'](entry,'','#'+next.route);
  }
  activeRoute=next.route;
  const target=document.querySelector('.page.active'), heading=target.querySelector('h1');
  document.title='SELAH · '+(heading?.textContent||'Music Ministry');
  let focusTarget=heading;
  if(previous.startsWith('song/') && ['library','home'].includes(next.id)) {
    focusTarget=[...target.querySelectorAll('[data-profile]')].find(el=>el.dataset.profile===profileId)||heading;
  }
  focusTarget?.focus({preventScroll:true});
  window.scrollTo({top:scrollPositions.get(next.route)||0,behavior:'instant'});
  if(previous && !matchMedia('(prefers-reduced-motion: reduce)').matches && target.animate) {
    routeAnimation=target.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.2,.7,.2,1)'});
  }
}
function backTo(route) {
  if(history.state?.selahFrom===route)history.back();
  else page(route);
}
function syncLocation(){page(location.hash.slice(1)||'home',false);}
window.addEventListener('popstate',syncLocation);
window.addEventListener('hashchange',syncLocation);
function renderFlow(){const markup=SLOTS.map((s,i)=>`<div class="step"><small>${String(i+1).padStart(2,'0')} · ${esc(s.en)}</small><strong>${esc(s.n)}</strong><span class="tag ${s.t.toLowerCase()}">${s.t==='W'?'W · Worship':'P · Praise'}</span></div>`).join('');$('serviceFlow').innerHTML=markup;$('serviceRows').innerHTML=SLOTS.map(s=>`<tr><td><strong>${esc(s.n)}</strong> <span class="tag ${s.t.toLowerCase()}">${s.t}</span></td><td>${esc(s.aim)}</td><td>${s.bpm}</td><td>${s.energy}</td><td>${esc(s.transition)}</td></tr>`).join('');$('sourceList').innerHTML=Object.values(SRC).map(([t,u])=>`<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a></li>`).join('')}
function songRow(s) {
  return `<button class="song-row song" data-profile="${esc(s.id)}"><span class="songicon ${s.type.toLowerCase()}">${icon('music')}</span><span class="rowtext"><strong>${esc(s.title)}${isLocalSong(s)?'<span class="tag local-label">Lokal</span>':''}</strong><small>${esc(s.artist|| (s.type==='P'?'Praise':'Worship'))}${s.key?' · '+esc(s.key):''}</small></span>${icon('chevron')}</button>`;
}
function renderSongs(){
  const q=$('search').value.toLocaleLowerCase('id').trim(),type=$('typeFilter').value,st=$('statusFilter').value;
  const candidates=state.songs.filter(s=>(!q||[s.title,s.artist,s.theme,s.notes].join(' ').toLocaleLowerCase('id').includes(q))&&(!type||s.type===type)&&(!st||s.status===st));
  if(!$('chips').children.length)$('chips').innerHTML=[['','Semua'],...Object.entries(CAT)].map(([key,label])=>`<button class="chip" data-cat="${key}">${esc(label)}</button>`).join('');
  $('chips').querySelectorAll('button').forEach(button=>{const selected=button.dataset.cat===activeCat;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  const results=candidates.filter(s=>!activeCat||s.cats.includes(activeCat)).sort((a,b)=>a.title.localeCompare(b.title,'id'));
  $('resultCount').textContent=`${results.length} dari ${state.songs.length} lagu`;
  $('songGrid').innerHTML=results.map(songRow).join('')||'<div class="empty">Tidak ada lagu yang cocok. Ubah filter atau tambahkan lagu.</div>';
}
const SYNC_LABELS={title:'Judul',artist:'Artis',key:'Nada dasar',type:'Jenis',cats:'Kategori',theme:'Tema',bpm:'BPM',meter:'Birama',form:'Alur lagu',bible:'Rujukan Alkitab',meaning:'Makna',notes:'Catatan',status:'Status',url:'Tautan',lyrics:'Lirik',rights:'Izin lirik',source:'Sumber','$song':'Lagu'};
function renderSyncReview(id){
 const rows=songSync.conflicts.filter(c=>c.songId===id);$('songSyncReview').hidden=!rows.length;$('songSyncReview').open=false;
 $('songSyncDifferences').innerHTML=rows.map(c=>`<section><h3>${esc(SYNC_LABELS[c.field]||c.field)}</h3><p class="note">${c.reason==='legacy-difference'?'Asal perubahan versi lama tidak dapat dipastikan.':'Perubahan lokal dipertahankan.'} Bandingkan sebelum menyimpan edit.</p><p><strong>Perangkat ini</strong></p><pre>${esc(Array.isArray(c.localValue)?c.localValue.join(', '):c.localValue||'(kosong)')}</pre><p><strong>Publik</strong></p><pre>${esc(Array.isArray(c.publicValue)?c.publicValue.join(', '):c.publicValue||'(kosong)')}</pre></section>`).join('');
}
function openSong(id){if($('libraryOptions').open)$('libraryOptions').close();editing=id||null;submissionContext={published:clone(baseline.find(song=>song.id===id)||null),baseVersion:publishedContentVersion};let s=state.songs.find(z=>z.id===id)||{title:'',artist:'',type:'W',cats:[],theme:'',key:'',bpm:'',status:'Kandidat',url:'',notes:''};$('dialogTitle').textContent=id?'Detail / edit lagu':'Tambah lagu';for(const [k,v] of Object.entries({fTitle:s.title,fArtist:s.artist,fType:s.type,fTheme:s.theme,fKey:s.key,fBpm:s.bpm,fStatus:s.status,fUrl:s.url,fNotes:s.notes}))$(k).value=v;$('fCats').innerHTML=Object.entries(CAT).map(([k,v])=>`<label><input type="checkbox" name="category" value="${k}" ${s.cats.includes(k)?'checked':''}>${esc(v)}</label>`).join('');for(const [field,k] of Object.entries(EXTRA))$(field).value=s[k]||'';editorStart={song:clone(s),form:songDraft()};renderSyncReview(id);$('deleteSong').hidden=!id;$('formMsg').textContent='';$('submissionStatus').textContent='';$('submitLyrics').checked=false;$('submitRights').checked=false;$('songAdvanced').open=false;$('submissionContext').textContent=submissionContext.published?'Pengajuan perubahan · ID '+submissionContext.published.id+' · Versi '+(submissionContext.baseVersion||'belum diketahui'):'Pengajuan lagu baru · Versi '+(submissionContext.baseVersion||'belum diketahui');if(typeof $('songDialog').showModal==='function')$('songDialog').showModal();else $('songDialog').setAttribute('open','')}
function closeSong(){if(typeof $('songDialog').close==='function')$('songDialog').close();else $('songDialog').removeAttribute('open')}
function reconcile(){syncActiveSet(state)}
function renderSet(){builder.render()}
function download(name,content,type){let u=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function renderChecks(){$('checklist').innerHTML=CHECKS.map((v,i)=>`<label class="checkline"><input type="checkbox" data-check="${i}" ${state.checks[i]?'checked':''}> <span>${esc(v)}</span></label>`).join('');$('checkProgress').textContent=`${state.checks.filter(Boolean).length}/${CHECKS.length} selesai`}
function renderAll(){
  if(activeRoute.startsWith('song/')){
    if(state.songs.some(song=>song.id===profileId))renderProfile(profileId);
    else {profileId=null;page('library');}
  }
  updateLibraryStatus();$('homeCount').textContent=state.songs.length;
  renderSongs();
  $('featuredSongs').innerHTML=state.songs.slice(0,3).map(songRow).join('');
  renderSet();renderChecks();renderAcademy();renderReflections();storageNotice();
}

let profileId=null, profileSnapshot=null, roleFilter='all';
function showProfile(id){
  profileReturn=document.querySelector('.page.active')?.id==='home'?'home':'library';
  page('song/'+encodeURIComponent(id));
}
function renderProfile(id){
  const s=state.songs.find(x=>x.id===id);if(!s)return;
  $('closeProfile').textContent=profileReturn==='home'?'← Beranda':'← Lagu';
  if(profileId===id && sameSong(profileSnapshot,s))return;
  const selected=profileId===id?document.querySelector('[data-profiletab][aria-selected="true"]')?.dataset.profiletab:'lyrics';
  profileId=id;profileSnapshot=clone(s);
  $('profileTitle').textContent=s.title;
  const link=safeUrl(s.url)||(Object.hasOwn(SRC,s.source)?SRC[s.source][1]:'');
  $('profileSummary').innerHTML=`<p class="muted">${s.artist?esc(s.artist)+' · ':''}${esc(s.status)}${isLocalSong(s)?' · Lokal':''}${songSync.conflicts.some(c=>c.songId===id)?' · Periksa perbedaan di Edit':''}</p><div class="chips"><span class="tag ${s.type.toLowerCase()}">${s.type==='W'?'Worship':'Praise'}</span>${s.cats.map(c=>`<span class="tag">${esc(CAT[c])}</span>`).join('')}</div>`;
  $('profileBody').innerHTML=`<div class="profileFacts">${[['Nada dasar',s.key],['BPM',s.bpm],['Birama',s.meter]].map(([k,v])=>`<div><strong>${esc(v||'—')}</strong><small>${k}</small></div>`).join('')}</div>
  <div class="profile-tabs" role="tablist" aria-label="Profil lagu">${[['lyrics','Lirik'],['arrange','Aransemen'],['meaning','Makna']].map(([key,label],i)=>`<button id="tab-${key}" role="tab" data-profiletab="${key}" aria-controls="panel-${key}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>
  <section id="panel-lyrics" role="tabpanel" aria-labelledby="tab-lyrics" tabindex="0"><div class="profileLyrics">${esc(s.lyrics||'Lirik belum tersedia. Tambahkan melalui Edit.')}</div>${s.rights?`<p class="note">Sumber / izin: ${esc(s.rights)}</p>`:''}<div class="actions"><button class="btn" id="readLyrics">Baca tanpa gangguan</button></div></section>
  <section id="panel-arrange" role="tabpanel" aria-labelledby="tab-arrange" tabindex="0" hidden><div class="profileSection"><h2>Aransemen</h2><p><strong>Struktur:</strong> ${esc(s.form||'Belum ditetapkan')}</p><p>${esc(s.notes||'Belum ada catatan.')}</p></div></section>
  <section id="panel-meaning" role="tabpanel" aria-labelledby="tab-meaning" tabindex="0" hidden><div class="profileSection"><h2>Makna &amp; dasar Alkitab</h2><p>Tema: ${esc(s.theme||'—')}</p><p>${esc(s.meaning||'Refleksi detail belum diisi.')}</p><p class="ref">${esc(s.bible||'Rujukan belum diisi')}</p><p class="note">Rujukan tematik untuk direnungkan, bukan tafsiran resmi pencipta lagu.</p></div></section>
  ${link?`<div class="profileSection"><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${s.url?'Buka referensi versi':'Buka sumber katalog'}</a></div>`:''}`;
  selectProfileTab(selected||'lyrics');
}
function selectProfileTab(key){
  document.querySelectorAll('[data-profiletab]').forEach(el=>{const active=el.dataset.profiletab===key;el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;document.getElementById(el.getAttribute('aria-controls')).hidden=!active;});
}
let lyricSize=22;
function readLyrics(){const song=state.songs.find(s=>s.id===profileId);if(!song)return;$('readerTitle').textContent=song.title;$('readerLyrics').textContent=song.lyrics||'Lirik belum tersedia. Tambahkan melalui Edit.';$('lyricsDialog').showModal();}
function renderAcademy(){document.querySelectorAll('[data-lesson]').forEach(el=>el.checked=Boolean(state.lessons[Number(el.dataset.lesson)]));document.querySelectorAll('.lesson').forEach(el=>el.hidden=!(roleFilter==='all'||el.dataset.role==='all'||el.dataset.role===roleFilter));$('academyProgress').textContent=`${state.lessons.filter(Boolean).length}/10 materi dipelajari`;document.querySelectorAll('[data-rolefilter]').forEach(b=>{b.classList.toggle('active',b.dataset.rolefilter===roleFilter);b.setAttribute('aria-pressed',b.dataset.rolefilter===roleFilter)})}
function renderReflections(){$('refList').innerHTML=state.reflections.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(r=>`<article class="panel refcard"><p class="eyebrow">${esc(r.date)} · ${esc(r.role)}</p><h3>Yang berjalan baik</h3><p>${esc(r.good||'—')}</p><h3 style="margin-top:12px">Yang perlu diperbaiki</h3><p>${esc(r.improve||'—')}</p><h3 style="margin-top:12px">Langkah berikutnya</h3><p>${esc(r.next)}</p><button class="btn danger" data-delref="${esc(r.id)}">Hapus catatan</button></article>`).join('')||'<div class="empty">Belum ada catatan refleksi.</div>'}

injectIcons();
const builder=createServiceBuilder({getState:()=>state,save,storageReady:()=>storageOK,notify,download,esc,icon});
document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();$('mainContent').focus();});
await load();renderFlow();renderAll();page(location.hash.slice(1)||'home',false);
function handleAction(e){
  const button=e.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-search')){page('library');$('search').focus({preventScroll:true});return;}
  if(button.dataset.page||button.dataset.go){const route=button.dataset.page||button.dataset.go;if(button.classList.contains('back'))backTo(route);else page(route);return;}
  if(button.hasAttribute('data-cat')){activeCat=button.dataset.cat;renderSongs();return;}
  if(button.dataset.profile){showProfile(button.dataset.profile);return;}
  if(button.dataset.profiletab){selectProfileTab(button.dataset.profiletab);return;}
  if(button.id==='readLyrics'){readLyrics();return;}
  if(button.dataset.rolefilter){roleFilter=button.dataset.rolefilter;renderAcademy();return;}
  if(button.dataset.delref&&confirm('Hapus catatan refleksi ini?')){state.reflections=state.reflections.filter(r=>r.id!==button.dataset.delref);save();renderReflections();return;}
  if(button.dataset.edit)openSong(button.dataset.edit);
}
document.addEventListener('click',handleAction);
$('openLibraryOptions').onclick=()=>{$('libraryActionStatus').textContent='';$('libraryOptions').showModal();$('openLibraryOptions').setAttribute('aria-expanded','true')};
$('libraryOptions').addEventListener('close',()=>{$('openLibraryOptions').setAttribute('aria-expanded','false')});
$('songDialog').addEventListener('close',()=>{(activeRoute.startsWith('song/')?$('editProfile'):$('openLibraryOptions')).focus({preventScroll:true})});
$('closeLibraryOptions').onclick=$('applyLibraryOptions').onclick=()=>$('libraryOptions').close();
$('search').addEventListener('input',renderSongs);$('typeFilter').addEventListener('change',renderSongs);$('statusFilter').addEventListener('change',renderSongs);$('addSong').onclick=()=>openSong();$('closeDialog').onclick=closeSong;
function songDraft(){
 const draft={};for(const[id,key]of Object.entries({fTitle:'title',fArtist:'artist',fType:'type',fTheme:'theme',fKey:'key',fBpm:'bpm',fStatus:'status',fUrl:'url',fNotes:'notes',...EXTRA}))draft[key]=$(id).value;
 draft.cats=[...$('fCats').querySelectorAll('input:checked')].map(el=>el.value);return draft;
}
$('songForm').addEventListener('invalid',e=>{
 e.preventDefault();const first=$('songForm').querySelector('input:invalid,select:invalid,textarea:invalid');if(e.target!==first)return;
 const details=e.target.closest('details');if(details)details.open=true;
 $('formMsg').textContent=e.target.id==='fTitle'?'Judul lagu wajib diisi.':e.target.id==='fBpm'?'BPM harus bilangan bulat antara 20 dan 300, atau kosong.':'Periksa kolom yang ditandai; gunakan tautan yang valid.';
 e.target.focus();
},true);
$('songForm').onsubmit=e=>{
 e.preventDefault();const draft=songDraft(),title=draft.title.trim(),cats=draft.cats,url=draft.url.trim();
 if(!title||!cats.length){$('formMsg').textContent='Judul dan minimal satu kategori wajib diisi.';return;}
 if(url&&!safeUrl(url)){$('formMsg').textContent='Gunakan tautan http atau https.';return;}
 const old=state.songs.find(song=>song.id===editing),song={...(old||editorStart?.song||{}),...draft,id:editing||('u'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2))),source:old?.source||editorStart?.song?.source||''};
 song.title=title;song.url=safeUrl(url);
 if(old&&editorStart){
  for(const field of SONG_FIELDS)if(sameField(field,draft[field],editorStart.form[field]))song[field]=clone(editorStart.song[field]??(field==='cats'?[]:''));
  const merged=mergeSongFields(editorStart.song,song,old);state.songs[state.songs.indexOf(old)]=merged.song;
  const conflicts=new Map(songSync.conflicts.map(c=>[JSON.stringify([c.songId,c.field]),c]));for(const c of merged.conflicts)conflicts.set(JSON.stringify([c.songId,c.field]),c);songSync.conflicts=[...conflicts.values()];
 }else state.songs.push(song);
 state.songs=applyCatalog(baseline,state.songs,baseline);
 reconcile();save();closeSong();renderAll();notify('Lagu disimpan di perangkat, bukan dipublikasikan. Kategori adalah saran; alur ibadah tetap dipertahankan.');
};
async function submitSong(copyToClipboard){
 $('formMsg').textContent='';$('submissionStatus').textContent='';
 if(!$('songForm').reportValidity())return;
 let submission;
 try{submission=createSongSubmission({draft:songDraft(),...submissionContext,includeLyrics:$('submitLyrics').checked,includeRights:$('submitRights').checked});}
 catch(error){$('formMsg').textContent=error.message;return;}
 const json=JSON.stringify(submission,null,2);
 if(copyToClipboard){try{await navigator.clipboard.writeText(json)}catch{$('formMsg').textContent='Tidak dapat menyalin. Gunakan Ekspor Pengajuan (.json).';return;}}
 else download(submissionFilename(submission),json,'application/json');
 $('submissionStatus').textContent=(copyToClipboard?'Pengajuan disalin.':'Pengajuan diekspor.')+' Tindakan ini tidak menyimpan lokal atau memublikasikan.'+(submission.review.lyrics_permission==='unverified'?' Catatan izin bersifat opsional pada pilot.':'');
}
$('exportSongSubmission').onclick=()=>submitSong(false);
$('copySongSubmission').onclick=()=>submitSong(true);
$('deleteSong').onclick=()=>{if(editing&&confirm('Hapus lagu ini? Referensi di setlist tetap disimpan dan ditandai jika lagu tidak tersedia.')){state.songs=state.songs.filter(s=>s.id!==editing);reconcile();save();closeSong();renderAll();notify('Lagu dihapus.')}};
$('checklist').addEventListener('change',e=>{if(e.target.hasAttribute('data-check')){state.checks[Number(e.target.dataset.check)]=e.target.checked;save();$('checkProgress').textContent=`${state.checks.filter(Boolean).length}/${CHECKS.length} selesai`}});$('resetChecks').onclick=()=>{state.checks=CHECKS.map(()=>false);save();renderChecks()};$('exportAll').onclick=()=>download('selah-backup.json',JSON.stringify({...state,publishedBase:baseline,publishedContentVersion,publishedFingerprint,publishedObservedVersion,publishedVersionMismatch,songSync},null,2),'application/json');$('importAll').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{
 const raw=JSON.parse(await file.text()),candidate=validate(raw),importedSync=readSongSync(raw.songSync);
 const oldBase=Array.isArray(raw.publishedBase)?checkedCatalog(raw.publishedBase):await fetchCatalog('./data/legacy-v02.json').catch(()=>clone(baseline));
 const merged=publishedAvailable?syncCatalog(oldBase,candidate.songs,baseline,importedSync,{legacy:raw.songSync===undefined}):{songs:candidate.songs,sync:importedSync};
 if(confirm(`Impor ${candidate.songs.length} lagu? Ini mengganti data lokal saat ini.`)){state=candidate;state.songs=merged.songs;songSync=merged.sync;reconcile();save();renderAll();notify('Cadangan diimpor.');}
 }catch{notify('Impor gagal: format cadangan tidak valid.')}finally{e.target.value=''}};
$('exportCsv').onclick=()=>{const cell=v=>'"'+String(v??'').replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';let rows=[['Judul','Versi','Jenis','Kategori','Tema','Key','BPM','Status','Catatan','Tautan','Birama','Struktur','Rujukan Alkitab','Makna'],...state.songs.map(s=>[s.title,s.artist,s.type,s.cats.map(c=>CAT[c]).join('; '),s.theme,s.key,s.bpm,s.status,s.notes,s.url||(Object.hasOwn(SRC,s.source)?SRC[s.source][1]:''),s.meter,s.form,s.bible,s.meaning])];download('pustaka-lagu.csv','\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8')};$('resetAll').onclick=()=>{if(confirm('Reset SEMUA data? Lagu tambahan, perubahan, setlist dan checklist akan hilang. Ekspor cadangan terlebih dahulu.')){state=fresh();songSync=readSongSync();baseline=clone(SEED);save();renderAll();notify('Data awal dipulihkan.')}};

$('closeProfile').onclick=()=>backTo(profileReturn);
$('editProfile').onclick=()=>openSong(profileId);
$('closeLyrics').onclick=()=>$('lyricsDialog').close();
function resizeLyrics(delta){lyricSize=Math.max(16,Math.min(36,lyricSize+delta));$('readerLyrics').style.setProperty('--lyrics-size',lyricSize+'px');}
$('smallerLyrics').onclick=()=>resizeLyrics(-2);$('largerLyrics').onclick=()=>resizeLyrics(2);
document.addEventListener('keydown',e=>{const tab=e.target.closest('[data-profiletab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-profiletab]')];let i=tabs.indexOf(tab);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;selectProfileTab(tabs[i].dataset.profiletab);tabs[i].focus();});
$('lessons').addEventListener('change',e=>{if(e.target.hasAttribute('data-lesson')){state.lessons[Number(e.target.dataset.lesson)]=e.target.checked;save();renderAcademy()}});
const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};$('refDate').value=localToday();$('reflectionForm').onsubmit=e=>{e.preventDefault();let next=$('refNext').value.trim();if(!next){notify('Isi langkah nyata berikutnya.');return}state.reflections.push({id:globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random(),date:$('refDate').value,role:$('refRole').value,good:$('refGood').value.trim(),improve:$('refImprove').value.trim(),next});save();$('refGood').value=$('refImprove').value=$('refNext').value='';renderReflections();notify('Refleksi tersimpan.')};

$('refreshLibrary').onclick=async()=>{const btn=$('refreshLibrary');btn.disabled=true;try{const snapshot=await publishedSnapshot(),next=snapshot.songs;state.songs=applyCatalog(baseline,state.songs,next);snapshotMetadata(snapshot);SEED=next;baseline=clone(next);publishedAvailable=true;libraryMessage=snapshotMessage(snapshot);reconcile();save();renderAll();notify(songSync.conflicts.length?`Pembaruan dimuat; ${songSync.conflicts.length} perbedaan dipertahankan. Periksa melalui Edit lagu.`:'Pustaka publik dimuat; perubahan lokal dipertahankan.')}catch{notify('Tidak dapat memuat pustaka publik. Data lokal dipertahankan.')}finally{btn.disabled=false}};
$('resetLibrary').onclick=()=>{if(!publishedAvailable){notify('Pustaka publik belum tersedia.');return}if(confirm('Pulihkan pustaka publik? Semua tambahan, edit dan penghapusan lagu lokal akan dibuang. Cadangkan dahulu jika diperlukan.')){state.songs=clone(baseline);songSync=readSongSync();reconcile();save();renderAll();notify('Pustaka publik dipulihkan.')}};
// Welcome on each new browser/PWA document session; no background audio.
function welcome(open){$('welcome').hidden=!open;$('appShell').inert=open;document.body.style.overflow=open?'hidden':'';if(open)$('enterApp').focus();else document.querySelector('.nav button.active')?.focus();}
$('enterApp').onclick=()=>welcome(false);$('showWelcome').onclick=()=>welcome(true);welcome(true);
let deferredInstall;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installApp').hidden=false});$('installApp').onclick=async()=>{if(!deferredInstall)return;await deferredInstall.prompt();deferredInstall=null;$('installApp').hidden=true};window.addEventListener('appinstalled',()=>{$('installApp').hidden=true});
if('serviceWorker' in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').then(reg=>{const announce=()=>{$('updateStatus').textContent='Versi baru siap. Tutup semua tab SELAH dan buka kembali untuk memperbarui aplikasi.'};if(reg.waiting)announce();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',e=>{if(e.target.state==='installed'&&navigator.serviceWorker.controller)announce()})});}).catch(()=>{$('updateStatus').textContent='Offline belum siap; muat ulang melalui HTTPS.'});}
