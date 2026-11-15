// Optional: external Playwright/Chromium. The app itself has no dependencies.
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const url=process.env.SELAH_TEST_URL||'http://127.0.0.1:8765/selah/';
const output=process.env.SELAH_SCREENSHOT_DIR||path.join(__dirname,'../docs/review/v050');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const [width,height]of [[360,640],[390,844],[412,915],[1440,900]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
   try{
    const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
    const route=async id=>{await p.evaluate(id=>{location.hash=id},id);await p.waitForSelector('#'+id+'.active');};
    const tab=async id=>{await p.locator(`[data-page="${id}"]`).click();await p.waitForSelector('#'+id+'.active');};
    const enter=async()=>{await p.waitForFunction(()=>document.activeElement.id==='enterApp');await p.locator('#enterApp').click();};
    await p.goto(url);await enter();
    assert.deepEqual(await p.locator('.nav button').allTextContents(),['Beranda','Lagu','Ibadah','Belajar','Lainnya']);
    for(const id of ['home','library','setlist','academy','more']){
     await tab(id);assert.equal(await p.locator('.nav [aria-current="page"]').getAttribute('data-page'),id);
     assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${id} ${width}`);
     const nav=await p.locator('.bottom-nav').boundingBox();assert(Math.abs(nav.y+nav.height-height)<=1,'Bottom navigation must remain visible');
     await p.locator('.page.active h1').evaluate(el=>el.blur());
     fs.mkdirSync(output,{recursive:true});await p.screenshot({path:path.join(output,`${id}-${width}x${height}.png`)});
    }
    for(const [id,parent]of [['faith','academy'],['service','setlist'],['arrange','setlist'],['operations','more'],['reflection','more'],['manage','more'],['settings','more']]){
     await route(id);assert.equal(await p.locator('.nav [aria-current="page"]').getAttribute('data-page'),parent);
     assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${id} ${width}`);
    }
    // Use actual secondary menu links, not only legacy routes.
    await tab('more');await p.locator('#more [data-go="reflection"]').click();assert(await p.locator('#reflection').isVisible());
    await tab('setlist');await p.locator('#setlist [data-go="arrange"]').click();assert(await p.locator('#arrange').isVisible());
    await tab('academy');await p.locator('#academy [data-go="faith"]').click();assert(await p.locator('#faith').isVisible());
    await tab('home');await p.locator('[data-search]').click();assert(await p.locator('#search').evaluate(e=>e===document.activeElement));
    await p.locator('#search').fill('Bejana');assert.equal(await p.locator('#songGrid .song').count(),2);await p.locator('#search').fill('');
    await p.locator('#chips [data-cat="P"]').click();assert.match(await p.locator('#resultCount').innerText(),/^13 dari 38/);await p.locator('#chips [data-cat=""]').click();
    await p.locator('#openLibraryOptions').click();await p.locator('#typeFilter').selectOption('P');assert.equal(await p.locator('#songGrid .song').count(),16);await p.locator('#typeFilter').selectOption('');
    await p.locator('#statusFilter').selectOption('Siap');assert.equal(await p.locator('#songGrid .song').count(),0);await p.locator('#statusFilter').selectOption('');await p.locator('#applyLibraryOptions').click();
    await p.locator('#songGrid [data-profile]').first().click();const songRoute=await p.evaluate(()=>location.hash);assert(songRoute.startsWith('#song/'));
    await p.locator('#editProfile').click();await p.locator('#fKey').fill('G');await p.locator('#fLyrics').fill('Teks uji asli\nBaris kedua');await p.locator('#fRights').fill('Teks uji milik pembuat tes');await p.locator('#songForm button[type="submit"]').click();
    await p.waitForSelector('#songDialog',{state:'hidden'});assert.match(await p.locator('#panel-lyrics').innerText(),/Teks uji asli/);
    await p.locator('[data-profiletab="lyrics"]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('[data-profiletab="arrange"]').getAttribute('aria-selected'),'true');assert(await p.locator('#panel-arrange').isVisible());await p.keyboard.press('End');assert(await p.locator('#panel-meaning').isVisible());await p.keyboard.press('Home');
    await p.locator('#readLyrics').click();assert(await p.locator('#lyricsDialog').isVisible());assert.match(await p.locator('#readerLyrics').innerText(),/Baris kedua/);const font=await p.locator('#readerLyrics').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));await p.locator('#largerLyrics').click();assert((await p.locator('#readerLyrics').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)))>font);
    if(width===390)await p.screenshot({path:path.join(output,'lyrics-reader-390.png')});await p.keyboard.press('Escape');assert(await p.locator('#lyricsDialog').isHidden());
    if(width===390)await p.screenshot({path:path.join(output,'profile-390.png')});
    await p.reload();await enter();assert.equal(await p.evaluate(()=>location.hash),songRoute);assert.match(await p.locator('#profileBody').innerText(),/Teks uji asli/);
    await p.locator('#closeProfile').click();await p.waitForSelector('#library.active');await p.goForward();await p.waitForSelector('#profile.active');await p.goBack();await p.waitForSelector('#library.active');
    await p.locator('#openLibraryOptions').click();await p.locator('#addSong').click();await p.locator('#fTitle').fill('Lagu uji lokal');await p.locator('#fCats input[value="O"]').check();await p.locator('#songForm button[type="submit"]').click();assert.match(await p.locator('#resultCount').innerText(),/39/);await p.locator('#search').fill('Lagu uji lokal');await p.locator('#songGrid [data-profile]').click();await p.locator('#editProfile').click();await p.locator('#deleteSong').click();await p.waitForSelector('#library.active');await p.locator('#search').fill('');assert.equal(await p.locator('#songGrid .song').count(),38);
    await tab('setlist');for(let i=0;i<6;i++){await p.locator('.segment-summary').nth(i).click();await p.locator('[data-entry-field="songId"]').selectOption('s001');if(i===0)await p.locator('#segmentNotes').fill('Cue uji');await p.locator('#segmentForm button[type="submit"]').click()}
    await p.locator('#editSetMeta').click();await p.locator('#setWL').fill('Uji WL');await p.locator('#setMetaForm button[type="submit"]').click();assert.match(await p.locator('#setSummary').innerText(),/6 segmen · 6 lagu/);
    await p.locator('#openSetActions').click();await p.locator('#copySet').click();assert.match(await p.evaluate(()=>navigator.clipboard.readText()),/Uji WL/);
    let pending=p.waitForEvent('download');await p.locator('#downloadSet').click();assert.match(fs.readFileSync(await(await pending).path(),'utf8'),/Cue uji/);
    await p.evaluate(()=>window.print=()=>window.printed=true);await p.locator('#printSet').click();assert(await p.evaluate(()=>window.printed));
    await tab('academy');await p.locator('[data-rolefilter="singer"]').click();assert(await p.locator('.lesson:not([hidden])').count()>0);await p.locator('[data-rolefilter="all"]').click();await p.locator('[data-lesson="0"]').check();
    await tab('more');await p.locator('#more [data-go="reflection"]').click();await p.locator('#refNext').fill('Uji tindak lanjut');await p.locator('#reflectionForm button[type="submit"]').click();assert.match(await p.locator('#refList').innerText(),/Uji tindak lanjut/);
    await route('manage');await p.locator('[data-check="0"]').check();await p.locator('#manage [data-go="settings"]').click();
    pending=p.waitForEvent('download');await p.locator('#exportAll').click();const backup=fs.readFileSync(await(await pending).path());const saved=JSON.parse(backup);assert.equal(saved.set.wl,'Uji WL');assert(saved.lessons[0]&&saved.checks[0]&&saved.reflections.length===1);
    await p.locator('#resetAll').click();await p.locator('#importFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:backup});await p.waitForFunction(()=>JSON.parse(localStorage.getItem('selah.v03.state')).reflections.length===1);
    await p.locator('#importFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await p.waitForFunction(()=>document.getElementById('toast').textContent.includes('Impor gagal'));assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('selah.v03.state')).reflections.length),1);
    await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>navigator.serviceWorker.controller);await context.setOffline(true);await p.reload();await enter();await tab('library');assert.equal(await p.locator('#songGrid .song').count(),38);await tab('setlist');assert.match(await p.locator('#setSummary').innerText(),/6 segmen · 6 lagu/);await tab('academy');assert(await p.locator('[data-lesson="0"]').isChecked());await route('reflection');assert.match(await p.locator('#refList').innerText(),/Uji tindak lanjut/);
    await p.locator('.top [data-go="settings"]').click();await p.locator('#showWelcome').click();assert(await p.locator('#welcome').isVisible());await p.locator('#enterApp').click();
    assert.deepEqual(errors,[]);console.log(`PASS ${width}x${height}: five tabs, all routes, search/filter, edit/add/delete, profile/reader, history, setlist, progress, reflections, backup/import, offline`);
   }finally{await context.close()}
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
