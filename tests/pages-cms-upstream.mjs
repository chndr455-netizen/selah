// Audit the actual pinned Pages CMS validators/save transforms, without hosting a CMS/backend.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=process.env.SELAH_PAGES_CMS_SOURCE;
const commit='6f4e860a35d934406580287e7042e5e111e207a1';
if(!root)throw Error('Set SELAH_PAGES_CMS_SOURCE to a checkout of pagescms/pagescms at '+commit);
if(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==commit)throw Error('Pages CMS source revision mismatch.');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'selah-cms-audit-'));
try{
 const entry=path.join(tmp,'audit.mjs'),bundle=path.join(tmp,'audit.cjs');
 fs.writeFileSync(entry,`
 import assert from 'node:assert/strict';import fs from 'node:fs';
 import YAML from ${JSON.stringify(require.resolve('yaml'))};
 import {ConfigSchema} from ${JSON.stringify(path.join(root,'lib/config-schema.ts'))};
 import {initializeState,generateZodSchema,deepMap,sanitizeObject} from ${JSON.stringify(path.join(root,'lib/schema.ts'))};
 const config=YAML.parse(fs.readFileSync('.pages.yml','utf8'));const checked=ConfigSchema.safeParse(config);assert(checked.success,JSON.stringify(checked.error?.issues));
 const catalog=JSON.parse(fs.readFileSync('data/songs.json'));const fields=config.content[0].fields;
 function save(list,fieldList=fields){const wrapped=[{name:'listWrapper',type:'object',list:true,fields:fieldList}];const state=initializeState(wrapped,sanitizeObject({listWrapper:list}));const parsed=generateZodSchema(wrapped).parse(state);return sanitizeObject(deepMap(parsed,wrapped,v=>v).listWrapper)}
 const raw=save(catalog);assert(Array.isArray(raw)&&raw.length===catalog.length);if(catalog[0].lyrics==='')assert(!Object.hasOwn(raw[0],'lyrics'));else assert.equal(raw[0].lyrics,catalog[0].lyrics);assert.deepEqual(raw.map(s=>s.id),catalog.map(s=>s.id));assert.deepEqual(raw.map(s=>s.source),catalog.map(s=>s.source));
 const hidden=save(catalog,fields.map(f=>f.name==='source'?{...f,hidden:true}:f));assert.deepEqual(hidden.map(s=>s.source),catalog.map(s=>s.source));
 fs.writeFileSync(${JSON.stringify(path.join(tmp,'roundtrip.json'))},JSON.stringify(raw));
 console.log('OK: upstream 2.1.8 config schema + root-list initialization/validation/save/sanitize; 38 IDs and hidden source fields retained.');
 `);
 await build({entryPoints:[entry],outfile:bundle,bundle:true,platform:'node',format:'cjs',logLevel:'silent',plugins:[{
  name:'headless-upstream-fields',setup(b){
   b.onResolve({filter:/^\//,namespace:'audit'},args=>({path:args.path,namespace:'file'}));
   b.onResolve({filter:/^@\/fields\/registry$/},()=>({path:'registry',namespace:'audit'}));
   b.onLoad({filter:/.*/,namespace:'audit'},()=>({contents:`${['string','text','select'].map(t=>`import{schema as ${t}}from ${JSON.stringify(path.join(root,`fields/core/${t}/index.tsx`))};`).join('')}export const schemas={string,text,select};export const defaultValues={};export const fieldTypes=new Set(['boolean','code','date','file','image','number','reference','rich-text','select','string','text','uuid']);`,loader:'js'}));
   b.onResolve({filter:/edit-component$/},()=>({path:'ui',namespace:'headless'}));
   b.onLoad({filter:/.*/,namespace:'headless'},()=>({contents:'export const EditComponent=()=>null;',loader:'js'}));
   b.onResolve({filter:/^(slugify|date-fns)$/},args=>({path:args.path,namespace:'unused'}));
   b.onLoad({filter:/.*/,namespace:'unused'},()=>({contents:'export default ()=>{throw Error("Unused filename helper invoked")};export const format=()=>{throw Error("Unused date helper invoked")};',loader:'js'}));
   b.onResolve({filter:/^zod$/},()=>({path:require.resolve('zod')}));
  }
 }]});
 execFileSync(process.execPath,[bundle],{stdio:'inherit'});
 const {normalizeDraft,canonical,validateCatalog}=await import('../scripts/content-model.mjs');
 const restored=normalizeDraft(JSON.parse(fs.readFileSync(path.join(tmp,'roundtrip.json')))),catalog=JSON.parse(fs.readFileSync('data/songs.json'));
 if(canonical(restored)!==canonical(catalog))throw Error('Upstream save lost or changed song data.');
 validateCatalog(restored,JSON.parse(fs.readFileSync('data/lyrics-permissions.json')),{base:catalog});
 console.log('OK: publication normalization restores every field/type and all 38 songs exactly after actual upstream save transforms.');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
