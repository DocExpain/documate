/* SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://documate.work';
const PAGES = [
  { url: '/', expectCanonicalStartsWith: 'https://documate.work/' },
  { url: '/explain/bill',     expectCanonicalStartsWith: 'https://documate.work/explain/bill/' },
  { url: '/explain/contract', expectCanonicalStartsWith: 'https://documate.work/explain/contract/' },
  { url: '/fr/', expectCanonicalStartsWith: 'https://documate.work/fr/' },
  { url: '/fr/expliquer/facture', expectCanonicalStartsWith: 'https://documate.work/fr/expliquer/facture/' },
  { url: '/fr/expliquer/contrat',  expectCanonicalStartsWith: 'https://documate.work/fr/expliquer/contrat/' },
];

function join(base, path) {
  return base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  try {
    for (const p of PAGES) {
      const startUrl = join(BASE, p.url);

      // 1) GET the URL; follow 308/301/302 automatically with Playwright
      const res = await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
      if (!res) throw new Error(`No response for ${startUrl}`);

      const status = res.status();
      const finalUrl = page.url();

      // Accept either 200 (served) or 308->200 (redirected then served)
      if (!(status === 200 || status === 308 || status === 301 || status === 302)) {
        throw new Error(`${startUrl} returned ${status}`);
      }

      // If we landed on a redirect status, go to the final URL again to get DOM
      if (status !== 200) {
        await page.goto(finalUrl, { waitUntil: 'domcontentloaded' });
      }

      // 2) Read canonical
      const canonical = await page.evaluate(() => {
        const el = document.querySelector('link[rel="canonical"]');
        return el ? el.href : null;
      });

      if (!canonical) {
        throw new Error(`No canonical on ${finalUrl}`);
      }
      if (!canonical.startsWith(p.expectCanonicalStartsWith)) {
        throw new Error(`${finalUrl} canonical mismatch: got "${canonical}" expected startsWith "${p.expectCanonicalStartsWith}"`);
      }

      console.log(`✅ OK: ${finalUrl}`);
    }
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
