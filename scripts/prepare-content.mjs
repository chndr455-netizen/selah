// Always execute this script from trusted main, never from the editorial branch.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {normalizeDraft,validateCatalog,mergeEditorial,contentVersion,canonical} from './content-model.mjs';
const args=process.argv.slice(2),value=name=>args[args.indexOf(name)+1];
const editorial=value('--editorial');if(!editorial||!args.includes('--editorial'))throw Error('Gunakan --editorial <commit/ref>.');
const read=(ref,file)=>JSON.parse(execFileSync('git',['show',`${ref}:${file}`],{encoding:'utf8'}));
const current=read('HEAD','data/songs.json'),marker=read('HEAD','data/cms-publication.json');
if(marker?.schema!==1||(marker.editorial_commit!==null&&!/^[a-f0-9]{40}$/.test(marker.editorial_commit)))throw Error('Checkpoint editorial tidak valid.');
const configAt=ref=>execFileSync('git',['show',`${ref}:.pages.yml`],{encoding:'utf8'});
if(configAt('HEAD')!==configAt(editorial))throw Error('Konfigurasi CMS berbeda dari main; sinkronkan konfigurasi yang telah ditinjau.');
const sha=execFileSync('git',['rev-parse',`${editorial}^{commit}`],{encoding:'utf8'}).trim();
validateCatalog(current);
let baseRef=marker.editorial_commit;
if(baseRef){execFileSync('git',['merge-base','--is-ancestor',baseRef,sha]);}else baseRef=execFileSync('git',['merge-base','HEAD',sha],{encoding:'utf8'}).trim();
const base=normalizeDraft(read(baseRef,'data/songs.json')),draft=normalizeDraft(read(sha,'data/songs.json'));
validateCatalog(draft,null,{base});
const songs=mergeEditorial(base,draft,current);validateCatalog(songs,null,{base:current});
const changed=canonical(songs)!==canonical(current);console.log(`Valid: ${songs.length} lagu; ${changed?'ada perubahan untuk review':'tidak ada perubahan publik'}.`);
if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`changed=${changed}\neditorial_sha=${sha}\n`);
if(args.includes('--output')&&changed){
 const root=value('--output'),version=read('HEAD','data/version.json');version.content=contentVersion(songs);
 for(const [file,data]of Object.entries({'data/songs.json':songs,'data/version.json':version,'data/cms-publication.json':{schema:1,editorial_commit:sha}})){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),JSON.stringify(data,null,2)+'\n')}
}
