import { SEGMENT_TYPES } from './service-templates.js';
import { copy, segment, songEntry, cloneSegment, makeService, makeTemplate, syncActiveSet, moveSegment, resolvedEntry, formatService, validateService } from './service-model.js';

export function createServiceBuilder({getState,save,storageReady,notify,download,esc,icon}){
 const $=id=>document.getElementById(id),dialogs=['serviceLibrary','setMetaDialog','segmentDialog','setActions'];
 let templateId=null,draft=null,isNew=false,metaAction='',libraryTab='lists',lastState=null,drag=null,dragFrame=0,suppressClickUntil=0;
 const state=()=>getState(),plan=()=>templateId?state().templates.find(t=>t.id===templateId):state().set;
 function feedback(text){if(!storageReady())text='Belum tersimpan. Ekspor cadangan sebelum menutup.';$('serviceStatus').textContent=text;const dialog=dialogs.map($).find(d=>d.open);if(dialog)dialog.querySelector('.sheet-feedback').textContent=text;else notify(text)}
 function closeDialogs(){dialogs.forEach(id=>{if($(id).open)$(id).close()})}
 function open(id){closeDialogs();$(id).querySelector('.sheet-feedback').textContent='';$(id).showModal()}
 function persist(){const ok=save();$('serviceStatus').textContent=ok?'Tersimpan':'Belum tersimpan — ekspor cadangan.';return ok}
 function render(){
  if(drag)finishDrag(true,false);
  if(lastState!==state()){templateId=null;lastState=state()}
  if(templateId&&!state().templates.some(t=>t.id===templateId))templateId=null;
  const current=plan();$('templateMode').hidden=!templateId;$('serviceName').textContent=current.name;
  $('serviceMeta').textContent=templateId?'Template lokal': [current.date,current.wl,current.theme].filter(Boolean).join(' · ')||'Detail ibadah';
  $('setSummary').textContent=`${current.segments.length} segmen · ${current.segments.reduce((n,s)=>n+s.songs.filter(e=>e.songId).length,0)} lagu`;
  $('slots').innerHTML=current.segments.map((s,i)=>`<li class="service-segment" data-segment-id="${esc(s.id)}"><button class="segment-drag iconbtn" data-builder="drag" data-id="${esc(s.id)}" aria-label="Urutkan ${esc(s.name)}. Alt dan panah atas/bawah, atau Naik/Turun di editor.">${icon('grip')}</button><button class="segment-summary" data-builder="edit-segment" data-id="${esc(s.id)}"><strong>${i+1}. ${esc(s.name)}</strong><small>${esc(s.songs.some(e=>e.songId)?s.songs.filter(e=>e.songId).map(e=>resolvedEntry(e,state().songs).title).join(' / '):SEGMENT_TYPES[s.type])}</small></button><button class="iconbtn" data-builder="edit-segment" data-id="${esc(s.id)}" aria-label="Edit ${esc(s.name)}">${icon('menu')}</button></li>`).join('')||'<li class="empty">Belum ada segmen. Tambahkan sesuai kebutuhan ibadah.</li>';
  const chosen=current.segments.flatMap(s=>s.songs).filter(e=>e.songId),notReady=chosen.filter(e=>state().songs.find(s=>s.id===e.songId)?.status!=='Siap').length,repeated=new Set(chosen.map(e=>e.songId)).size<chosen.length;
  $('serviceReadiness').textContent=[notReady?`${notReady} pilihan lagu belum berstatus Siap.`:'',repeated?'Lagu yang sama digunakan beberapa kali.':''].filter(Boolean).join(' ');
  $('servicePrint').textContent=formatService({...current,date:current.date||'',wl:current.wl||'',theme:current.theme||''},state().songs);
 }
 function focusRow(id){[...$('slots').querySelectorAll('.segment-drag')].find(el=>el.dataset.id===id)?.focus({preventScroll:true})}
 function renderLibrary(){
  $('savedSetlists').hidden=libraryTab!=='lists';$('savedTemplates').hidden=libraryTab!=='templates';
  document.querySelectorAll('.builder-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.builder==='tab-'+libraryTab)));
  $('savedSetlists').innerHTML=state().setlists.map(s=>`<button class="menu-row" data-builder="load-set" data-id="${esc(s.id)}"><span class="rowtext"><strong>${esc(s.name)}${s.id===state().set.id?' · Aktif':''}</strong><small>${esc([s.date,s.wl,`${s.segments.length} segmen`].filter(Boolean).join(' · '))}</small></span>${icon('chevron')}</button>`).join('');
  $('savedTemplates').innerHTML=state().templates.map(t=>`<div class="template-row"><button class="menu-row" data-builder="use-template" data-id="${esc(t.id)}"><span class="rowtext"><strong>${esc(t.name)}</strong><small>${t.segments.length} segmen · Gunakan</small></span></button><button class="iconbtn" data-builder="edit-template" data-id="${esc(t.id)}" aria-label="Edit template ${esc(t.name)}">${icon('edit')}</button><button class="iconbtn" data-builder="duplicate-template" data-id="${esc(t.id)}" aria-label="Duplikasi template ${esc(t.name)}">${icon('copy')}</button></div>`).join('')||'<p class="empty">Belum ada template. Buat template baru.</p>';
 }
 function library(tab='lists'){libraryTab=tab;renderLibrary();open('serviceLibrary')}
 function editMeta(action='edit'){
  metaAction=action;const p=plan(),asTemplate=!!templateId||action==='save-template';
  $('setMetaDialogTitle').textContent=asTemplate?'Detail template':'Detail ibadah';$('serviceDateFields').hidden=asTemplate;
  $('setName').value=p.name;for(const [id,key]of [['setDate','date'],['setWL','wl'],['setTheme','theme'],['setNotes','notes']])$(id).value=p[key]||'';open('setMetaDialog');
 }
 function renderEntries(){
  const opened=new Set([...$('segmentSongs').querySelectorAll('.entry-overrides[open]')].map(el=>el.closest('[data-entry]').dataset.entry));
  const active=document.activeElement,focus=active?.dataset.entryField?{id:active.closest('[data-entry]').dataset.entry,field:active.dataset.entryField}:null;
  const songs=[...state().songs].sort((a,b)=>a.title.localeCompare(b.title,'id'));
  $('segmentSongs').innerHTML=draft.songs.map((entry,i)=>{
   const selected=state().songs.find(s=>s.id===entry.songId),r=draft.recommendation;
   return `<div class="segment-song" data-entry="${esc(entry.id)}"><div class="entry-heading"><label for="entry-song-${i}">Lagu ${i+1}</label><button type="button" class="iconbtn" data-builder="remove-song" data-id="${esc(entry.id)}" aria-label="Hapus lagu ${i+1}">×</button></div><select id="entry-song-${i}" data-entry-field="songId"><option value="">Pilih lagu...</option>${entry.songId&&!selected?`<option value="${esc(entry.songId)}" selected>${esc(entry.title||entry.songId)} · tidak di pustaka</option>`:''}${songs.map(s=>`<option value="${esc(s.id)}" ${s.id===entry.songId?'selected':''}>${esc(s.title)}${r.category&&s.cats.includes(r.category)&&(!r.type||s.type===r.type)?' · saran':''}</option>`).join('')}</select><details class="entry-overrides" ${opened.has(entry.id)?'open':''}><summary>Nada dasar, flow & aransemen</summary><div class="field"><label for="entry-key-${i}">Nada dasar ibadah</label><input id="entry-key-${i}" data-entry-field="key" value="${esc(entry.key)}" placeholder="${esc(selected?.key||'Ikuti profil lagu')}" maxlength="30"></div><div class="field"><label for="entry-flow-${i}">Song flow</label><input id="entry-flow-${i}" data-entry-field="flow" value="${esc(entry.flow)}" placeholder="${esc(selected?.form||'Ikuti profil lagu')}" maxlength="1000"></div><div class="field"><label for="entry-notes-${i}">Aransemen ibadah</label><textarea id="entry-notes-${i}" data-entry-field="notes" maxlength="5000" placeholder="${esc(selected?.notes||'Ikuti profil lagu')}">${esc(entry.notes)}</textarea></div><small>Perubahan hanya untuk ibadah ini. Kosong = profil lagu.</small></details></div>`;
  }).join('');
  if(focus)[...$('segmentSongs').querySelectorAll('[data-entry]')].find(el=>el.dataset.entry===focus.id)?.querySelector(`[data-entry-field="${focus.field}"]`)?.focus({preventScroll:true});
 }
 function editSegment(id){
  const found=plan().segments.find(s=>s.id===id);draft=found?copy(found):segment();isNew=!found;
  if(!draft.songs.length&&['worship','praise','medley','instrumental'].includes(draft.type))draft.songs.push(songEntry());
  $('segmentDialogTitle').textContent=isNew?'Tambah segmen':'Edit segmen';$('segmentName').value=draft.name;$('segmentType').value=draft.type;$('segmentNotes').value=draft.notes;$('segmentCategory').value=draft.recommendation.category;
  for(const action of ['move-up','move-down','delete-segment'])document.querySelector(`[data-builder="${action}"]`).hidden=isNew;
  const index=plan().segments.findIndex(s=>s.id===id);document.querySelector('[data-builder="move-up"]').disabled=index<=0;document.querySelector('[data-builder="move-down"]').disabled=index===plan().segments.length-1;
  renderEntries();open('segmentDialog');
 }
 function readDraft(){if(!$('segmentForm').reportValidity())return false;draft.name=$('segmentName').value.trim();if(!draft.name)return false;draft.type=$('segmentType').value;draft.notes=$('segmentNotes').value;draft.recommendation.category=$('segmentCategory').value;draft.recommendation.type=draft.type==='worship'?'W':draft.type==='praise'?'P':'';return true}
 function commitSegment(action='save'){
  if(!readDraft())return;const p=plan(),index=p.segments.findIndex(s=>s.id===draft.id);if(index<0)p.segments.push(copy(draft));else p.segments[index]=copy(draft);
  let focus=draft.id;
  if(action==='duplicate'){const duplicate=cloneSegment(draft);duplicate.name='Salinan '+draft.name;const at=p.segments.findIndex(s=>s.id===draft.id);p.segments.splice(at+1,0,duplicate);focus=duplicate.id;}
  if(action==='up'||action==='down')moveSegment(p,draft.id,action==='up'?-1:1);
  persist();closeDialogs();render();focusRow(focus);feedback('Segmen disimpan.');
 }
 function reorder(id,delta){if(moveSegment(plan(),id,delta)){persist();render();focusRow(id);feedback(`Posisi ${plan().segments.findIndex(s=>s.id===id)+1} dari ${plan().segments.length}.`)}}
 async function copyText(text,shared=false){try{await navigator.clipboard.writeText(text);feedback(shared?'Teks setlist disalin untuk dibagikan.':'Setlist disalin.')}catch{download('setlist-ibadah.txt',text,'text/plain;charset=utf-8');feedback('Clipboard tidak tersedia; TXT diunduh.')}}
 async function action(event){
  const button=event.target.closest('[data-builder]');if(!button)return;const name=button.dataset.builder,id=button.dataset.id,p=plan();
  if(name==='close'){button.closest('dialog').close();return}
  if(name==='drag'){if(performance.now()<suppressClickUntil){event.preventDefault();return}editSegment(id);return}
  if(name==='edit-segment'){editSegment(id);return}
  if(name==='tab-lists'||name==='tab-templates'){libraryTab=name==='tab-lists'?'lists':'templates';renderLibrary();return}
  if(name==='new-list'){syncActiveSet(state());state().set=makeService();templateId=null;persist();closeDialogs();render();return}
  if(name==='new-template'){const t=makeTemplate({name:'Template baru',notes:'',segments:[]});state().templates.push(t);templateId=t.id;persist();closeDialogs();render();editMeta();return}
  if(name==='load-set'){syncActiveSet(state());state().set=copy(state().setlists.find(s=>s.id===id));templateId=null;persist();closeDialogs();render();return}
  if(name==='use-template'){syncActiveSet(state());state().set=makeService(state().templates.find(t=>t.id===id));templateId=null;persist();closeDialogs();render();return}
  if(name==='edit-template'){templateId=id;closeDialogs();render();return}
  if(name==='duplicate-template'){const t=state().templates.find(t=>t.id===id),duplicate=makeTemplate(t,'Salinan '+t.name);state().templates.push(duplicate);templateId=duplicate.id;persist();closeDialogs();render();return}
  if(name==='add-song'){draft.songs.push(songEntry());renderEntries();return}
  if(name==='remove-song'){draft.songs=draft.songs.filter(e=>e.id!==id);renderEntries();return}
  if(name==='move-up'||name==='move-down'||name==='duplicate-segment'){commitSegment(name==='move-up'?'up':name==='move-down'?'down':'duplicate');return}
  if(name==='delete-segment'){if(confirm('Hapus segmen ini?')){p.segments=p.segments.filter(s=>s.id!==draft.id);persist();closeDialogs();render();feedback('Segmen dihapus.')}return}
  if(name==='duplicate-plan'){if(templateId){const t=makeTemplate(p,'Salinan '+p.name);state().templates.push(t);templateId=t.id}else{syncActiveSet(state());state().set=makeService(p);Object.assign(state().set,{name:'Salinan '+p.name,date:p.date,wl:p.wl,theme:p.theme,notes:p.notes})}persist();closeDialogs();render();return}
  if(name==='delete-plan'){if(!confirm(`Hapus ${p.name}?`))return;if(templateId){state().templates=state().templates.filter(t=>t.id!==templateId);templateId=null}else{state().setlists=state().setlists.filter(s=>s.id!==p.id);state().set=copy(state().setlists[0]||makeService())}persist();closeDialogs();render();return}
  if(name==='save-template'){editMeta('save-template');return}
  if(name==='clear'){if(confirm('Kosongkan semua segmen pada alur ini?')){p.segments=[];persist();closeDialogs();render()}return}
  if(name==='import-set'){$('importSetFile').click();return}
  const printable={...p,date:p.date||'',wl:p.wl||'',theme:p.theme||''},text=formatService(printable,state().songs);
  if(name==='copy'){await copyText(text);return}
  if(name==='share'){closeDialogs();if(navigator.share){try{await navigator.share({title:p.name,text});feedback('Setlist dibagikan.')}catch(error){if(error.name!=='AbortError')await copyText(text,true)}}else await copyText(text,true);return}
  if(name==='export-text'){download('setlist-ibadah.txt',text,'text/plain;charset=utf-8');return}
  if(name==='export-json'){download('selah-setlist.json',JSON.stringify({format:'selah-service',version:1,set:printable},null,2),'application/json');return}
  if(name==='print'){closeDialogs();render();window.print()}
 }
 $('segmentType').innerHTML=Object.entries(SEGMENT_TYPES).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
 $('builderMenu').onclick=()=>library();$('chooseTemplate').onclick=()=>library('templates');$('finishTemplate').onclick=()=>{templateId=null;render()};$('editSetMeta').onclick=()=>editMeta();$('addSegment').onclick=()=>editSegment();
 $('openSetActions').onclick=()=>{$('setActionsTitle').textContent=templateId?'Template':'Setlist';document.querySelector('[data-builder="delete-plan"]').textContent=templateId?'Hapus template':'Hapus setlist';open('setActions')};
 $('setMetaForm').onsubmit=e=>{e.preventDefault();const name=$('setName').value.trim();if(!name)return;const p=plan();if(metaAction==='save-template'){state().templates.push(makeTemplate({...p,notes:$('setNotes').value},name))}else{p.name=name;p.notes=$('setNotes').value;if(!templateId)for(const[id,key]of [['setDate','date'],['setWL','wl'],['setTheme','theme']])p[key]=$(id).value}persist();closeDialogs();render();feedback(metaAction==='save-template'?'Template disimpan.':'Tersimpan.')};
 $('segmentForm').onsubmit=e=>{e.preventDefault();commitSegment()};
 $('segmentType').onchange=()=>{const previous=SEGMENT_TYPES[draft.type];draft.type=$('segmentType').value;if($('segmentName').value===previous)$('segmentName').value=SEGMENT_TYPES[draft.type];if(['prayer','word','communion','custom'].includes(draft.type))draft.songs=draft.songs.filter(e=>e.songId||e.key||e.flow||e.notes||e.title);else if(!draft.songs.length)draft.songs.push(songEntry());renderEntries()};
 $('segmentSongs').addEventListener('input',e=>{const field=e.target.dataset.entryField;if(!field)return;const entry=draft.songs.find(item=>item.id===e.target.closest('[data-entry]').dataset.entry);entry[field]=e.target.value;if(field==='songId')entry.title=state().songs.find(s=>s.id===entry.songId)?.title||''});
 $('segmentSongs').addEventListener('change',e=>{if(e.target.dataset.entryField==='songId'){const entry=draft.songs.find(item=>item.id===e.target.closest('[data-entry]').dataset.entry);entry.songId=e.target.value;entry.title=state().songs.find(s=>s.id===entry.songId)?.title||'';renderEntries()}});
 $('importSetFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const raw=JSON.parse(await file.text());if(raw.format!=='selah-service'||raw.version!==1)throw Error('format');const imported=validateService(raw.set),next=makeService(imported);Object.assign(next,{date:imported.date,wl:imported.wl,theme:imported.theme,notes:imported.notes});if(confirm(`Impor ${imported.name} sebagai setlist baru?`)){syncActiveSet(state());state().set=next;templateId=null;persist();closeDialogs();render();feedback('Setlist diimpor.')}}catch{feedback('Impor setlist gagal: format tidak valid.')}finally{e.target.value=''}};
 [$('setlist'),...dialogs.map($)].forEach(root=>root.addEventListener('click',action));
 // Pointer-based sorting works with touch, mouse and pen. Only the grip suppresses scrolling.
 function finishDrag(cancel=false,redraw=true){
  if(!drag)return;const current=drag;drag=null;cancelAnimationFrame(dragFrame);current.handle.closest('.service-segment')?.classList.remove('dragging');
  if(current.moved){
   suppressClickUntil=performance.now()+350;let committed=false;
   if(!cancel){const byId=new Map(plan().segments.map(s=>[s.id,s])),order=[...$('slots').querySelectorAll('[data-segment-id]')].map(row=>row.dataset.segmentId);if(order.length===byId.size&&new Set(order).size===order.length&&order.every(id=>byId.has(id))){plan().segments=order.map(id=>byId.get(id));persist();committed=true}}
   if(redraw){render();focusRow(current.id)}if(committed)feedback('Urutan segmen disimpan.');
  }
  try{current.handle.releasePointerCapture(current.pointerId)}catch{}
 }
 function placeDrag(){if(!drag?.moved)return;const row=drag.handle.closest('.service-segment'),others=[...$('slots').querySelectorAll('.service-segment')].filter(el=>el!==row),before=others.find(el=>{const r=el.getBoundingClientRect();return drag.y<r.y+r.height/2});if(before!==row.nextElementSibling){$('slots').insertBefore(row,before||null);try{drag.handle.setPointerCapture(drag.pointerId)}catch{}}}
 function scrollDrag(){if(!drag)return;const delta=drag.y<110?-8:drag.y>innerHeight-110?8:0;if(delta){window.scrollBy({top:delta,behavior:'instant'});placeDrag()}dragFrame=requestAnimationFrame(scrollDrag)}
 $('slots').addEventListener('pointerdown',e=>{const handle=e.target.closest('.segment-drag');if(!handle||e.button!==0||drag)return;drag={id:handle.dataset.id,handle,pointerId:e.pointerId,start:e.clientY,y:e.clientY,moved:false};handle.setPointerCapture(e.pointerId)});
 $('slots').addEventListener('pointermove',e=>{if(!drag||drag.pointerId!==e.pointerId)return;drag.y=e.clientY;if(!drag.moved&&Math.abs(drag.y-drag.start)>6){drag.moved=true;drag.handle.closest('.service-segment').classList.add('dragging');dragFrame=requestAnimationFrame(scrollDrag)}if(drag.moved){e.preventDefault();placeDrag()}});
 window.addEventListener('pointerup',e=>{if(drag?.pointerId===e.pointerId)finishDrag()});window.addEventListener('pointercancel',e=>{if(drag?.pointerId===e.pointerId)finishDrag(true)});window.addEventListener('keydown',e=>{if(drag&&e.key==='Escape'){e.preventDefault();finishDrag(true)}});window.addEventListener('blur',()=>finishDrag(true));
 $('slots').addEventListener('keydown',e=>{const handle=e.target.closest('.segment-drag');if(handle&&e.altKey&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();reorder(handle.dataset.id,e.key==='ArrowUp'?-1:1)}});
 return {render};
}
