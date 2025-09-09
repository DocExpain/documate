#!/usr/bin/env node
// SPDX-License-Identifier: LicenseRef-SA-NC-1.0
/**
 * Ajoute un en-tête SPDX aux fichiers manquants.
 * - Compatible Node CommonJS (CJS)
 * - Charge globby (ESM-only) via import dynamique
 */

const fs = require("node:fs");
const path = require("node:path");

(async () => {
  // globby v14 est ESM-only → import dynamique
  const { globby } = await import("globby");

  const SPDX = "LicenseRef-SA-NC-1.0";
  const patterns = [
    "**/*.{js,cjs,mjs,ts,tsx,css,scss,html}",
    "!node_modules/**",
    "!.git/**",
    "!dist/**",
    "!build/**",
    "!out/**",
    "!public/**" // ajuste si besoin
  ];

  const files = await globby(patterns, { dot: false });

  for (const file of files) {
    let src;
    try {
      src = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    // déjà présent ?
    if (src.includes("SPDX-License-Identifier")) continue;

    let header;
    if (file.endsWith(".html")) {
      // HTML → commentaire HTML, après le doctype si présent
      header = `<!-- SPDX-License-Identifier: ${SPDX} -->\n`;
      const m = src.match(/^\s*<!doctype[^>\n]*>\s*/i);
      if (m) {
        src = src.slice(0, m[0].length) + header + src.slice(m[0].length);
      } else {
        src = header + src;
      }
    } else if (file.endsWith(".css") || file.endsWith(".scss")) {
      // CSS/SCSS
      header = `/* SPDX-License-Identifier: ${SPDX} */\n`;
      src = header + src;
    } else {
      // JS/TS/etc.
      header = `// SPDX-License-Identifier: ${SPDX}\n`;
      src = header + src;
    }

    fs.writeFileSync(file, src);
    console.log("SPDX added:", file);
  }

  // succès
  process.exit(0);
})();
