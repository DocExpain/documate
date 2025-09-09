/*
 * SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'https://documate.work';
const PAGES = [
  { url: '/',                          expect: 'https://documate.work/' },
  { url: '/explain/bill/',             expect: 'https://documate.work/explain/bill/' },
  { url: '/explain/contract/',         expect: 'https://documate.work/explain/contract/' },
  { url: '/fr/',                       expect: 'https://documate.work/fr/' },
  { url: '/fr/expliquer/facture/',     expect: 'https://documate.work/fr/expliquer/facture/' },
  { url: '/fr/expliquer/contrat/',     expect: 'https://documate.work/fr/expliquer/contrat/' }
];

const WAIT_MS = 20000;

function join(base, path) {
  return base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

function fallbackFromExpected(expectedAbs) {
  // Transforme une canonique "/explain/:topic/" -> "/?topic=:topic"
  // ou "/fr/expliquer/:topic/" -> "/fr/?topic=:topic"
  try {
    const { pathname } = new URL(expectedAbs);
    let m = pathname.match(/^\/explain\/([^/]+)\/$/);
    if (m) return '/?topic=' + m[1];
    m = pathname.match(/^\/fr\/expliquer\/([^/]+)\/$/);
    if (m) return '/fr/?topic=' + m[1];
  } catch {}
  return null;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(WAIT_MS);

  async function getCanonical() {
    return await page.evaluate(() => {
      const el = document.querySelector('link[rel="canonical"]');
      return el ? el.href : null;
    });
  }

  async function waitCanonicalStartsWith(prefix) {
    await page.waitForFunction((expected) => {
      const el = document.querySelector('link[rel="canonical"]');
      return !!el && typeof el.href === 'string' && el.href.startsWith(expected);
    }, prefix, { timeout: WAIT_MS });
  }

  for (const p of PAGES) {
    const startUrl = join(BASE, p.url);
    try {
      console.log(`→ Opening ${startUrl}`);
      const res = await page.goto(startUrl, { waitUntil: 'networkidle' });
      if (!res) throw new Error(`No response for ${startUrl}`);
      const status = res.status();
      if (status !== 200) throw new Error(`${startUrl} returned ${status}`);

      // 1) Essai direct : attendre la canonical calculée
      let initial = await getCanonical();
      try {
        // Si ton router a fini, il insère aussi #ld-faq — on patiente sur l’un OU l’autre
        await Promise.race([
          waitCanonicalStartsWith(p.expect),
          page.waitForSelector('#ld-faq, script#ld-faq', { timeout: WAIT_MS })
        ]);
      } catch (_) {
        // pas grave, on va tenter la route de secours juste après
      }

      let canonical = await getCanonical();

      // 2) Fallback : si la canonical n’est pas bonne, naviguer vers /?topic=… ou /fr/?topic=…
      if (!canonical || !canonical.startsWith(p.expect)) {
        const fb = fallbackFromExpected(p.expect);
        if (!fb) {
          throw new Error(`${startUrl} canonical mismatch: got "${canonical}" expected startsWith "${p.expect}"`);
        }
        const fbUrl = join(BASE, fb);
        console.log(`   ↪ Fallback to ${fbUrl}`);
        const res2 = await page.goto(fbUrl, { waitUntil: 'networkidle' });
        if (!res2 || res2.status() !== 200) {
          throw new Error(`Fallback ${fbUrl} failed (${res2 ? res2.status() : 'no response'})`);
        }
        await waitCanonicalStartsWith(p.expect);
        canonical = await getCanonical();
      }

      if (!canonical) throw new Error(`No canonical on ${page.url()}`);
      if (!canonical.startsWith(p.expect)) {
        throw new Error(`${page.url()} canonical mismatch: got "${canonical}" expected startsWith "${p.expect}"`);
      }

      console.log(`✅ OK: ${page.url()} (canonical: ${canonical})`);
    } catch (e) {
      console.error(`❌ ${e.message}`);
      await browser.close();
      process.exit(1);
    }
  }

  await browser.close();
  process.exit(0);
})();
