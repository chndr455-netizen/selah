import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateCatalog} from '../scripts/content-model.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const songFields=['id','title','artist','theme','notes','source','bpm','key','status','url','meter','form','bible','meaning','lyrics','rights'];
const songs=read('data/songs.json');validateCatalog(songs,read('data/lyrics-permissions.json'));assert(Array.isArray(songs)&&songs.length>0);const ids=new Set();
for(const s of songs){for(const k of songFields)assert.equal(typeof s[k],'string',`Invalid ${k}: ${s.id}`);assert(s.id.trim()&&s.title.trim()&&!ids.has(s.id),`Missing/duplicate id ${s.id}`);ids.add(s.id);assert(['W','P'].includes(s.type));assert(Array.isArray(s.cats)&&s.cats.length&&new Set(s.cats).size===s.cats.length&&s.cats.every(c=>['O','P','S','G','C'].includes(c)));assert(['Kandidat','Dalam latihan','Siap'].includes(s.status));if(s.bpm)assert(Number.isFinite(Number(s.bpm))&&Number(s.bpm)>0&&Number(s.bpm)<=300);if(s.url)assert(['http:','https:'].includes(new URL(s.url).protocol));if(s.lyrics.trim())assert(s.rights.trim(),`Lyrics require rights evidence: ${s.id}`);}
const m=read('manifest.webmanifest');assert.equal(m.start_url,'./');assert.equal(m.scope,'./');for(const x of m.icons)assert(fs.existsSync(new URL('../'+x.src,import.meta.url)));
const v=read('data/version.json');assert(v.app&&v.content);assert(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8').includes(`'${v.app}'`),'SW app cache version must match app version');console.log(`OK: ${songs.length} songs, manifest, version and icon paths.`);

// Manifest id resolves against the start URL's origin, unlike scope/start_url.
// Omit it so identity follows the start URL on any GitHub project subpath.
assert(!Object.hasOwn(m,'id'),'Omit explicit manifest id for portable project-site identity');
for(const path of ['/selah/','/renamed-repository/']){
 const manifestURL=new URL('manifest.webmanifest','https://example.github.io'+path);
 const startURL=new URL(m.start_url,manifestURL);
 assert.equal(startURL.pathname,path);
 assert.equal(new URL(m.scope,manifestURL).pathname,path);
}
assert(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8').includes(`v${v.app}`),'Displayed version must match app version');
console.log('OK: project-subpath manifest identity and displayed app version.');
