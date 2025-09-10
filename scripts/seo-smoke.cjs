// SPDX-License-Identifier: LicenseRef-SA-NC-1.0
/* Smoke SEO: vérifie les canonicals des pages. */
const puppeteer = require("puppeteer");

const BASE = (process.argv[2] || "https://documate.work/").replace(/\/+$/, "") + "/";
function abs(p){ return BASE + p.replace(/^\/+/, ""); }

const CHECKS = [
  { url: "/", expect: "/" },
  { url: "/explain/bill/", expect: "/explain/bill/", fallback: "/?topic=bill" },
  { url: "/explain/contract/", expect: "/explain/contract/", fallback: "/?topic=contract" },
  { url: "/fr/", expect: "/fr/" },
  { url: "/fr/expliquer/facture/", expect: "/fr/expliquer/facture/", fallback: "/fr/?topic=bill" },
  { url: "/fr/expliquer/contrat/", expect: "/fr/expliquer/contrat/", fallback: "/fr/?topic=contract" }
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args:["--no-sandbox","--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage();

    for (const c of CHECKS) {
      const target = abs(c.url);
      process.stdout.write(`\n→ Opening ${target}\n`);
      let res = await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!res) throw new Error(`No response for ${target}`);
      if (res.status() !== 200) throw new Error(`${target} returned ${res.status()}`);

      // petite attente pour laisser le canonical bootstrap poser la balise
      await page.waitForFunction(() => !!document.querySelector('link[rel="canonical"]'), { timeout: 15000 });
      let canon = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href || null);

      const expectAbs = abs(c.expect);
      if (!canon || !canon.toLowerCase().startsWith(expectAbs.toLowerCase())) {
        if (c.fallback) {
          const fb = abs(c.fallback);
          console.log(`   ↪ Fallback to ${fb}`);
          res = await page.goto(fb, { waitUntil: "domcontentloaded", timeout: 30000 });
          if (!res) throw new Error(`No response for ${fb}`);
          if (res.status() !== 200) throw new Error(`${fb} returned ${res.status()}`);
          await page.waitForFunction(() => !!document.querySelector('link[rel="canonical"]'), { timeout: 15000 });
          canon = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href || null);
        }
      }

      if (!canon || !canon.toLowerCase().startsWith(expectAbs.toLowerCase())) {
        throw new Error(`Fallback failed for ${target} (canonical seen: "${canon || "(missing)"}")`);
      }

      console.log(`✅ OK: ${target} (canonical: ${canon})`);
    }
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
