import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateCatalog,contentVersion,canonical} from './content-model.mjs';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const songs=read('data/songs.json');validateCatalog(songs,read('data/lyrics-permissions.json'));
const marker=read('data/cms-publication.json');if(marker?.schema!==1||(marker.editorial_commit!==null&&!/^[a-f0-9]{40}$/.test(marker.editorial_commit)))throw Error('Checkpoint CMS tidak valid.');
const args=process.argv.slice(2),base=args.includes('--base')?args[args.indexOf('--base')+1]:null;
if(base){
 const old=JSON.parse(execFileSync('git',['show',`${base}:data/songs.json`],{encoding:'utf8'}));
 validateCatalog(songs,read('data/lyrics-permissions.json'),{base:old});
 const oldVersion=JSON.parse(execFileSync('git',['show',`${base}:data/version.json`],{encoding:'utf8'})),version=read('data/version.json');
 if(canonical(songs)!==canonical(old)){
  if(version.content!==contentVersion(songs))throw Error('Versi konten harus hash katalog; jalankan node scripts/version-content.mjs.');
  if(process.env.SELAH_CONTENT_ONLY==='true'&&version.app!==oldVersion.app)throw Error('Publikasi CMS tidak boleh mengubah versi aplikasi.');
 }
}
console.log(`OK: ${songs.length} lagu, ID/nada/schema dan verifikasi izin lirik.`);
