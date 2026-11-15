import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const snippet=source.slice(source.indexOf('const sameSong='),source.indexOf('function checkedCatalog('));
const result=vm.runInNewContext(snippet+`
const base=[{id:'a',title:'Old A',lyrics:''},{id:'b',title:'Old B',lyrics:''},{id:'d',title:'Delete me',lyrics:''}];
const working=[{id:'a',title:'Old A',lyrics:'Local'},base[1],{id:'l',title:'Local song',lyrics:''}];
const next=[{id:'a',title:'New A',lyrics:''},{id:'b',title:'New B',lyrics:''},{id:'d',title:'Updated deleted',lyrics:''},{id:'c',title:'New song',lyrics:''}];
JSON.stringify(mergeCatalog(base,working,next));`);
const merged=JSON.parse(result);assert.equal(merged.find(s=>s.id==='a').lyrics,'Local');assert.equal(merged.find(s=>s.id==='b').title,'New B');assert(!merged.some(s=>s.id==='d'));assert(merged.some(s=>s.id==='l'));assert(merged.some(s=>s.id==='c'));
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');const ids=[...html.matchAll(/\bid="([\w-]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');for(const k of ['welcome','enterApp','appShell','songGrid','refreshLibrary','resetLibrary','installApp','showWelcome'])assert(ids.includes(k),k);for(const m of source.matchAll(/\$\('([\w-]+)'\)/g))assert(ids.includes(m[1]),`Missing HTML id: ${m[1]}`);console.log('OK: local overlay merge, published changes/additions, hidden records, static DOM IDs.');
