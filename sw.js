/* Increment on shell/UI release; content JSON uses network-first. */
const PREFIX = 'selah-pwa-' + new URL(self.registration.scope).pathname + '-';
const CACHE = PREFIX + '0.5.3';
const root = self.registration.scope;
const shell = ['./','./index.html','./assets/app.css','./assets/app.js','./assets/catalog-sync.js','./assets/public-catalog.js','./assets/song-submission.js','./assets/icons.js','./assets/content.js','./assets/service-model.js','./assets/service-templates.js','./assets/service-builder.js','./assets/service-song-picker.js','./assets/logo.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png','./manifest.webmanifest','./data/songs.json','./data/legacy-v02.json','./data/version.json','./data/lyrics-permissions.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(shell.map(x=>new Request(new URL(x,root),{cache:'reload'}))))));
self.addEventListener('activate', e => e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith(PREFIX)&&k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch', e => {
 const r=e.request,u=new URL(r.url); if(r.method!=='GET'||!r.url.startsWith(root)||u.origin!==self.location.origin) return;
 const isNav=r.mode==='navigate', isData=u.pathname.startsWith(new URL('./data/',root).pathname), isShell=shell.some(path=>new URL(path,root).pathname===u.pathname);
 if(!isNav&&!isData&&!isShell)return;
 e.respondWith((async()=>{const c=await caches.open(CACHE);
 // Keep shell version coherent when offline; updated SW activates after existing tabs close.
 if(!isData){const cached=await c.match(isNav?new URL('./index.html',root):r,{ignoreSearch:true});if(cached)return cached;}
 try{const res=await fetch(r,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);await c.put(r,res.clone());return res;}
 catch{const hit=await c.match(r,{ignoreSearch:true});if(hit)return hit;if(isNav){const fallback=await c.match(new URL('./index.html',root));if(fallback)return fallback;}return new Response('Offline: konten belum tersimpan.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
