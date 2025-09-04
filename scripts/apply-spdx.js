// scripts/apply-spdx.js
// Usage: node scripts/apply-spdx.js "[TON ORGANISATION]"

const fs = require('fs');
const path = require('path');
const ORG = process.argv[2] || '[TON ORGANISATION]';
const YEAR = '2025';
const IGNORE_DIRS = new Set(['node_modules','vendor','dist','build','.git']);
const HTML_HEADER =
  `<!--\n  Copyright (c) ${YEAR} ${ORG}\n  SPDX-License-Identifier: LicenseRef-SA-NC-1.0
const JS_HEADER =
  `/*!\n * Copyright (c) ${YEAR} ${ORG}\n * SPDX-License-Identifier: LicenseRef-SA-NC-1.0

function shouldIgnore(file) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g,'/');
  if (rel.split('/').some(d => IGNORE_DIRS.has(d))) return true;
  const lower = rel.toLowerCase();
  if (/\.(png|jpg|jpeg|gif|webp|svg|pdf|woff2?|ttf|eot|mp4|webm|zip|gz|br)$/.test(lower)) return true;
  return false;
}

function applyHeader(file) {
  if (shouldIgnore(file)) return;
  const ext = path.extname(file).toLowerCase();
  if (!['.html','.js','.css'].includes(ext)) return;
  let src = fs.readFileSync(file, 'utf8');

  // Normaliser fins de ligne
  src = src.replace(/\r\n/g, '\n');

  // Si déjà SPDX → remplace la ligne entière
  if (/SPDX-License-Identifier: LicenseRef-SA-NC-1.0
    src = src.replace(/SPDX-License-Identifier: LicenseRef-SA-NC-1.0
    src = src.replace(/Copyright \(c\) \d{4} .*?/g, `Copyright (c) ${YEAR} ${ORG}`);
    fs.writeFileSync(file, src);
    return;
  }

  // Sinon, préfixer selon type
  const header = (ext === '.html') ? HTML_HEADER : JS_HEADER;
  fs.writeFileSync(file, header + src);
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.lstatSync(p);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(name)) walk(p);
    } else if (stat.isFile()) {
      applyHeader(p);
    }
  }
}

walk(process.cwd());
console.log('SPDX headers applied.');
