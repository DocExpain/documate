/*
 * SPDX-FileCopyrightText: 2025 DocExpain
 * SPDX-License-Identifier: LicenseRef-SA-NC-1.0
 */

const { chromium } = require('playwright');

function full(base, path) {
  return base.replace(/\/$/, '') + path;
}

const PAGES = [
  { path: '/',                canonical: '/',                      expectFAQ: false },
  { path: '/explain/bill',    canonical: '/explain/bill',          expectFAQ: true  },
  { path: '/explain/contract',canonical: '/explain/contract',      expectFAQ: true  },
  { path: '/fr/',             canonical: '/fr/',                   expectFAQ: false },
  { path: '/fr/expliquer/facture', canonical: '/fr/expliquer/facture', expectFAQ: true },
  { path: '/fr/expliquer/contrat', canonical: '/fr/expliquer/contrat', expectFAQ: true }
];

(async () => {
  const base = process.argv[2] || 'https://documate.work';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
  });

  for (const p of PAGES) {
    const url = full(base, p.path);
    const page = await ctx.newPage();
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const status = resp ? resp.status() : 0;
    if (status !== 200) {
      console.error(`❌ ${url} returned ${status}`);
      process.exit(1);
    }

    const title = await page.title();
    if (!title || title.length < 10) {
      console.error(`❌ ${url} missing/short <title>: "${title}"`);
      process.exit(1);
    }

    const metaDesc = await page.locator('meta[name="description"]').first();
    if (!(await metaDesc.count())) {
      console.error(`❌ ${url} missing meta description`);
      process.exit(1);
    }

    const canonicalEl = await page.locator('link[rel="canonical"]').first();
    if (!(await canonicalEl.count())) {
      console.error(`❌ ${url} missing canonical`);
      process.exit(1);
    }
    const canonicalHref = await canonicalEl.getAttribute('href');
    const expectedCanonical = full(base, p.canonical);
    if (!canonicalHref || !canonicalHref.startsWith(expectedCanonical)) {
      console.error(`❌ ${url} canonical mismatch: got "${canonicalHref}" expected startsWith "${expectedCanonical}"`);
      process.exit(1);
    }

    // hreflang (global block present)
    const hreflangs = await page.$$eval('link[rel="alternate"][hreflang]', els => els.map(e => e.getAttribute('hreflang')));
    if (!hreflangs.length || !hreflangs.includes('x-default')) {
      console.error(`❌ ${url} hreflang alternates missing or x-default absent`);
      process.exit(1);
    }

    // FAQ JSON-LD on topic pages
    const hasLd = await page.locator('script#ld-faq[type="application/ld+json"]').first().count();
    if (p.expectFAQ && !hasLd) {
      console.error(`❌ ${url} expected FAQ JSON-LD but none found`);
      process.exit(1);
    }

    // If JSON-LD exists, validate it's a FAQPage
    if (hasLd) {
      const json = await page.$eval('script#ld-faq', el => el.textContent);
      try {
        const obj = JSON.parse(json || '{}');
        if (obj['@type'] !== 'FAQPage') {
          console.error(`❌ ${url} ld-faq @type is not FAQPage`);
          process.exit(1);
        }
        if (!Array.isArray(obj.mainEntity) || obj.mainEntity.length < 1) {
          console.error(`❌ ${url} ld-faq mainEntity empty`);
          process.exit(1);
        }
      } catch (e) {
        console.error(`❌ ${url} ld-faq invalid JSON`);
        process.exit(1);
      }
    }

    console.log(`✅ OK: ${url}`);
    await page.close();
  }

  await ctx.close();
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
