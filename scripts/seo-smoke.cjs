// SPDX-License-Identifier: LicenseRef-SA-NC-1.0
/* Smoke SEO avec Puppeteer : log console & pageerror, fallback, attente stricte de la canonical */
const puppeteer = require("puppeteer");

const BASE = (process.argv[2] || "https://documate.work/").replace(/\/+$/, "") + "/";
function url(p){ return (BASE + p.replace(/^\/+/, "")).replace(/\/+$/, "/"); }

async function waitCanonicalMatches(page, startsWith, timeout=20000) {
  await page.waitForFunction((prefix) => {
    const l = document.querySelector('link[rel="canonical"]');
    return !!(l && typeof l.href === 'string' && l.href.toLowerCase().startsWith(prefix.toLowerCase()));
  }, { timeout }, startsWith);
  return page.evaluate(() => document.querySelector('link[rel="canonical"]').href);
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox","--disable-dev-shm-usage"] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // instrumentation debug
  page.on('console', msg => console.log('console:', msg.text()));
  page.on('pageerror', err => console.error('PageError:', err.message));

  // 1) HOME
  const home = url("/");
  console.log(`\n→ Opening ${home}`);
  await page.goto(home, { waitUntil: "domcontentloaded" });
  const homeCanon = await waitCanonicalMatches(page, home, 15000).catch(() => null);
  if (homeCanon !== home) {
    console.error(`❌ ${home} canonical mismatch (seen: "${homeCanon || "(missing)"}")`);
    await browser.close(); process.exit(1);
  }
  console.log(`✅ OK: ${home} (canonical: ${homeCanon})`);

  // 2) BILL (pretty + fallback)
  const pretty = url("/explain/bill/");
  const fallback = url("/index.html?topic=bill");

  console.log(`→ Opening ${pretty}`);
  await page.goto(pretty, { waitUntil: "domcontentloaded" });
  let canon = await waitCanonicalMatches(page, pretty, 15000).catch(() => null);

  if (!canon) {
    console.log(`   ↪ Fallback to ${fallback}`);
    await page.goto(fallback, { waitUntil: "domcontentloaded" });
    // ici on attend que la canonical change VERS la pretty (script runtime)
    canon = await waitCanonicalMatches(page, pretty, 20000).catch(() => null);
  }

  if (canon && canon.toLowerCase().startsWith(pretty.toLowerCase())) {
    console.log(`✅ OK: ${pretty} (canonical: ${canon})`);
    await browser.close(); process.exit(0);
  } else {
    console.error(`❌ Fallback failed for ${pretty} (canonical seen: "${canon || "(missing)"}")`);
    await browser.close(); process.exit(1);
  }
})();
