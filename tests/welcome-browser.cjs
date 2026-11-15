// Optional browser checks: requires externally installed Playwright and Chromium.
// Serve /workspace on port 8765, then: node tests/welcome-browser.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const url = process.env.SELAH_TEST_URL || 'http://127.0.0.1:8765/selah/';
const output = path.join(__dirname, '../docs/review/welcome');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const [width, height] of [[360, 640], [390, 844], [412, 915], [1440, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(url);
        await page.waitForFunction(() => document.activeElement.id === 'enterApp');
        assert.equal(await page.locator('#appShell').evaluate(el => el.inert), true);
        assert.match(await page.locator('.welcome h1').innerText(), /Shalom,\s*Hamba Tuhan!/);
        assert.equal(await page.locator('.welcome .intro').innerText(), 'Selah, melayani dengan sungguh-sungguh bersama Tuhan.');
        assert.match(await page.locator('.welcome cite').innerText(), /Roma 12:11.*Parafrasa/);
        const layout = await page.locator('#welcome').evaluate(el => {
          const bounds = [...el.querySelectorAll('img,h1,p,button,.scripture')].map(x => x.getBoundingClientRect());
          return { fits: el.scrollHeight <= el.clientHeight + 1, horizontal: el.scrollWidth <= el.clientWidth,
            visible: bounds.every(r => r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth),
            animation: getComputedStyle(el, '::before').animationName,
            button: getComputedStyle(document.getElementById('enterApp')).backgroundColor };
        });
        assert(layout.fits && layout.horizontal && layout.visible, `${width}x${height}: primary content must fit`);
        assert.equal(layout.animation, 'none');
        assert.equal(layout.button, 'rgb(254, 237, 101)');
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `after-${width}x${height}.png`) });
        await page.keyboard.press('Enter');
        assert(await page.locator('#welcome').isHidden());
        assert.equal(await page.locator('#appShell').evaluate(el => el.inert), false);
        await page.locator('#showWelcome').click();
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        assert.equal(await page.locator('#welcome').evaluate(el => getComputedStyle(el, '::before').animationName), 'welcome-light');
        // Model enlarged default text without changing viewport size or disabling zoom.
        await page.addStyleTag({ content: 'html { font-size: 32px; }' });
        assert(await page.locator('#welcome').evaluate(el => el.scrollWidth <= el.clientWidth));
        await page.locator('.welcome cite').scrollIntoViewIfNeeded();
        assert(await page.locator('.welcome cite').isVisible());
        await page.locator('#enterApp').scrollIntoViewIfNeeded();
        await page.locator('#enterApp').click();
        // Seed dummy private state through the app, then verify offline reload preserves it.
        await page.locator('[data-page="academy"]').click();
        await page.locator('[data-lesson="0"]').check();
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.waitForFunction(() => navigator.serviceWorker.controller);
        const saved = await page.evaluate(() => localStorage.getItem('selah.v03.state'));
        await context.setOffline(true);
        await page.reload();
        await page.waitForFunction(() => document.activeElement.id === 'enterApp');
        assert.match(await page.locator('.welcome cite').innerText(), /Roma 12:11/);
        assert.equal(await page.evaluate(() => localStorage.getItem('selah.v03.state')), saved);
        await page.locator('#enterApp').click();
        await page.locator('[data-page="academy"]').click();
        assert(await page.locator('[data-lesson="0"]').isChecked());
        await page.locator('[data-page="library"]').click();
        assert.equal(await page.locator('.song').count(), 38);
        assert.deepEqual(errors, []);
        console.log(`PASS ${width}x${height}: fit, welcome, focus, motion, enlarged text, navigation, local data and offline reload`);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
