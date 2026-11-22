import fs from 'node:fs';
import {validateCatalog,contentVersion} from './content-model.mjs';
const songs=JSON.parse(fs.readFileSync('data/songs.json'));
validateCatalog(songs);const version=JSON.parse(fs.readFileSync('data/version.json'));version.content=contentVersion(songs);fs.writeFileSync('data/version.json',JSON.stringify(version,null,2)+'\n');console.log('Versi konten diperbarui; versi aplikasi tetap.');
