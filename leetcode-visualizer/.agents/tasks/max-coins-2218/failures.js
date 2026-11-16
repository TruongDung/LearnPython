'use strict';
// Lists the failing top-level test names (with their file) from a TAP log: node failures.js <log> [<log2>]
// With two logs, prints the names failing in the second that do not fail in the first.
const fs = require('node:fs');

function failures(file) {
  const raw = fs.readFileSync(file);
  // PowerShell 5.1 `*>` writes UTF-16 LE with a BOM.
  const text = (raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le') : raw.toString('utf8')).replace(/\r/g, '');
  const out = new Map();
  let fileName = '';
  for (const line of text.split('\n')) {
    const loc = line.match(/^\s*location: '.*[\\/]tests[\\/]([^:'\\/]+\.test\.js)/);
    if (loc) fileName = loc[1];
    const m = line.match(/^not ok \d+ - (.*)$/);
    if (m) out.set(m[1], '');
  }
  // Second pass: map names to files via the "# Subtest:" + location blocks is not reliable in TAP; keep names only.
  return [...out.keys()];
}

const [a, b] = process.argv.slice(2);
const base = failures(a);
if (!b) {
  console.log(`${base.length} failing`);
  base.forEach((name) => console.log(`- ${name}`));
} else {
  const after = failures(b);
  const set = new Set(base);
  const fresh = after.filter((name) => !set.has(name));
  const fixed = base.filter((name) => !after.includes(name));
  console.log(`baseline ${base.length} failing, after ${after.length} failing`);
  console.log(`new failures (${fresh.length}):`);
  fresh.forEach((name) => console.log(`+ ${name}`));
  console.log(`no longer failing (${fixed.length}):`);
  fixed.forEach((name) => console.log(`- ${name}`));
}
