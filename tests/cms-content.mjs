import fs from 'node:fs';
import assert from 'node:assert/strict';
import YAML from 'yaml';
import {FIELDS,KEY_PATTERN,normalizeDraft,validateCatalog,mergeEditorial,canonical,contentVersion,digest} from '../scripts/content-model.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),songs=read('data/songs.json'),permissions=read('data/lyrics-permissions.json');
const config=YAML.parse(fs.readFileSync('.pages.yml','utf8')),entry=config.content[0];
assert.equal(config.content.length,1);assert.equal(entry.type,'file');assert.equal(entry.path,'data/songs.json');assert.equal(entry.format,'json');assert.equal(entry.list,true);assert.equal(config.settings.config,false);
assert.deepEqual(entry.fields.map(f=>f.name).sort(),[...FIELDS].sort());assert.equal(entry.fields.find(f=>f.name==='bpm').type,'string');assert.equal(entry.fields.find(f=>f.name==='cats').options.multiple,true);assert.equal(entry.fields.find(f=>f.name==='key').pattern.regex,KEY_PATTERN);
for(const f of entry.fields)assert(['string','text','select'].includes(f.type));
const normalized=normalizeDraft(songs);assert.equal(canonical(normalized),canonical(songs));validateCatalog(normalized,permissions,{base:songs});
// Exact Pages CMS sanitize behavior for these flat song records: omit blank strings.
const sparse=songs.map(s=>Object.fromEntries(Object.entries(s).filter(([,v])=>v!=='')));
assert.equal(canonical(normalizeDraft(sparse)),canonical(songs));assert(songs.length>=read('data/legacy-v02.json').length);
for(const bad of [()=>validateCatalog([...songs,songs[0]],permissions),()=>validateCatalog(songs.slice(1),permissions,{base:songs}),()=>normalizeDraft({songs}),()=>normalizeDraft(sparse.map((s,i)=>i? s:{...s,extra:'hidden'}))])assert.throws(bad);
for(const [field,value] of [['id','changed'],['title',' '],['key','H#'],['bpm',72],['bpm','301'],['meter','4/3'],['cats',[]],['type','X'],['status','Unknown'],['url','https://user:password@example.com']]){const changed=structuredClone(songs);changed[0][field]=value;assert.throws(()=>validateCatalog(changed,permissions))}
for(const key of ['','C','F#','Bb','Am','F#m','C/E'])assert(new RegExp(KEY_PATTERN).test(key));
for(const key of ['H','C##','G major','Cm7'])assert(!new RegExp(KEY_PATTERN).test(key));
const lyrics=structuredClone(songs);lyrics[0].lyrics='Teks asli pengujian\nBaris kedua';lyrics[0].rights='Catatan izin yang telah ditinjau';assert.throws(()=>validateCatalog(lyrics,permissions),/belum diverifikasi/);
const approved={schema:1,approvals:[...permissions.approvals.filter(a=>a.song_id!==lyrics[0].id),{song_id:lyrics[0].id,lyrics_sha256:digest(lyrics[0].lyrics),rights_sha256:digest(lyrics[0].rights),approved_by:'chndr455-netizen',approved_at:'2026-11-16T00:00:00.000Z',basis:'Teks uji buatan sendiri'}]};validateCatalog(lyrics,approved);lyrics[0].lyrics+='!';assert.throws(()=>validateCatalog(lyrics,approved));lyrics[0].lyrics=lyrics[0].lyrics.slice(0,-1);lyrics[0].rights+='!';assert.throws(()=>validateCatalog(lyrics,approved));
const draft=structuredClone(songs),current=structuredClone(songs);draft[0].key='F#';current[1].theme='Perubahan main';const merged=mergeEditorial(songs,draft,current);assert.equal(merged[0].key,'F#');assert.equal(merged[1].theme,'Perubahan main');assert.equal(canonical(songs),canonical(normalized));current[0].key='Bb';assert.throws(()=>mergeEditorial(songs,draft,current),/Konflik/);current[0].key=draft[0].key;assert.equal(mergeEditorial(songs,draft,current)[0].key,'F#');
assert.notEqual(contentVersion(draft),contentVersion(songs));assert.equal(contentVersion(normalizeDraft(sparse)),contentVersion(songs));
const added={...structuredClone(songs[0]),id:'s'+String(Math.max(...songs.map(s=>Number(s.id.slice(1))))+1).padStart(3,'0'),title:'Lagu baru uji',lyrics:'',rights:''};const expanded=[...songs,added];validateCatalog(expanded,permissions,{base:songs});assert.equal(mergeEditorial(songs,expanded,songs).at(-1).id,added.id);
const permissionWorkflow=YAML.parse(fs.readFileSync('.github/workflows/cms-approve-lyrics.yml','utf8'));assert.equal(permissionWorkflow.on.workflow_dispatch.inputs.permission_verified.type,'boolean');assert.equal(permissionWorkflow.on.workflow_dispatch.inputs.permission_verified.default,false);
const publication=YAML.parse(fs.readFileSync('.github/workflows/cms-publish.yml','utf8'));assert(publication.on.workflow_dispatch===null||publication.on.workflow_dispatch!==undefined);const step=publication.jobs.prepare.steps.find(s=>s.run?.includes('gh pr create'));assert(step.run.includes('gh workflow run validate.yml'));assert(!/gh pr merge|--auto/.test(step.run));assert.equal(entry.actions[0].ref,'main');
console.log('OK: CMS field coverage/types, 38-song sparse round-trip, immutable IDs, key/required validation, exact lyric permission hashes, conflicts, content hashes and review-only workflow.');
