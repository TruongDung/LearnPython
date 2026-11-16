'use strict';
// One-off edit: move 2218 out of the shared requested-visualizations files and re-register it.
const fs = require('node:fs');
const path = require('node:path');
const pub = path.join(__dirname, '..', '..', '..', 'public');
const file = (name) => path.join(pub, name);

let js = fs.readFileSync(file('renderer-requested-visualizations.js'), 'utf8');
const a = js.indexOf('// ─── #2218:');
const b = js.indexOf('// ─── #9006:');
if (a < 0 || b < a) throw new Error('2218 block not found in renderer');
js = js.slice(0, a) + js.slice(b);
fs.writeFileSync(file('renderer-requested-visualizations.js'), js);

let css = fs.readFileSync(file('requested-visualizations.css'), 'utf8');
const c1 = css.indexOf('/* 2218: picture-first pile choices */');
const c2 = css.indexOf('/* Legacy coin styles retained for shared DP helpers. */');
if (c1 < 0 || c2 < c1) throw new Error('2218 block not found in css');
css = css.slice(0, c1) + css.slice(c2);
fs.writeFileSync(file('requested-visualizations.css'), css);

let s = fs.readFileSync(file('script.js'), 'utf8');
const m1 = '"renderVisitAll847View", "renderCoins2218View", "renderBfs9006View"';
if (!s.includes(m1)) throw new Error('manifest entry not found');
s = s.replace(m1, '"renderVisitAll847View", "renderBfs9006View"');
const oldEntry = /\{ predicate: \(step\) => Boolean\(step\.coins2218View\), surface: "treeView", render: \(step\) => \{(\r?\n)      renderCoins2218View\(step\);/;
if (!oldEntry.test(s)) throw new Error('registry entry not found');
s = s.replace(oldEntry, '{ predicate: (step) => Boolean(step.maxCoins2218View), surface: "treeView", render: (step) => {$1      renderMaxCoins2218View(step);');
fs.writeFileSync(file('script.js'), s);

let html = fs.readFileSync(file('index.html'), 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n';
const cssAnchor = '<link rel="stylesheet" href="last-day-cross-1970.css?v=last-day-cross-1970-v1" data-problem-ids="1970" />';
const jsAnchor = '<script src="renderer-last-day-cross-1970.js?v=last-day-cross-1970-v1" data-problem-ids="1970"></script>';
for (const anchor of [cssAnchor, jsAnchor]) if (!html.includes(anchor)) throw new Error(`anchor missing: ${anchor}`);
const indent = (anchor) => html.slice(html.lastIndexOf('\n', html.indexOf(anchor)) + 1, html.indexOf(anchor));
html = html.replace(cssAnchor, `${cssAnchor}${eol}${indent(cssAnchor)}<link rel="stylesheet" href="max-coins-2218.css?v=max-coins-2218-v1" data-problem-ids="2218" />`);
html = html.replace(jsAnchor, `${jsAnchor}${eol}${indent(jsAnchor)}<script src="renderer-max-coins-2218.js?v=max-coins-2218-v1" data-problem-ids="2218"></script>`);
if (!html.includes('&lc1970=pictures-v1')) throw new Error('script.js query flag missing');
html = html.replace('&lc1970=pictures-v1', '&lc1970=pictures-v1&lc2218=pictures-v1');
fs.writeFileSync(file('index.html'), html);
console.log('ok');
