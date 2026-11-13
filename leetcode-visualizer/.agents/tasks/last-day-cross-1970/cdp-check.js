'use strict';
// Throwaway headless-Chrome probe for the 1970 page (not part of the app or test suite).
// Usage: start the server with PORT=4197, then `BASE=http://localhost:4197/ node cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4197/';
const PORT = 9197;
const OUT = __dirname;
const PID = 1970;
// Code panel: no vertical or horizontal scrollbar; no visible line cut at the top/bottom or at the right edge.
// Wrapped lines: every continuation starts exactly at its own indent + 4 columns.
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  const probe = document.createElement('span'); probe.textContent = '0000000000'; const t0 = p.querySelector('.code-line .txt'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;text-indent:0'; t0.appendChild(probe); const ch = probe.getBoundingClientRect().width / 10; probe.remove();
  const hang = []; let wrapped = 0;
  lines.forEach((l) => { const t = l.querySelector('.txt'); if (!t) return; const rng = document.createRange(); rng.selectNodeContents(t);
    const rects = [...rng.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5); if (!rects.length) return;
    const lh = parseFloat(getComputedStyle(t).lineHeight) || 18; const c0 = Math.min(...rects.map((r) => r.top + r.height / 2));
    const bins = new Map(); rects.forEach((r) => { const k = Math.round((r.top + r.height / 2 - c0) / lh); bins.set(k, Math.min(bins.has(k) ? bins.get(k) : Infinity, r.left)); });
    if (bins.size < 2) return; wrapped++;
    const keys = [...bins.keys()].sort((a, b) => a - b);
    const guides = t.querySelectorAll(':scope > .indent-guide').length; const want = (guides * 4 + 4) * ch;
    keys.slice(1).forEach((k) => { const got = bins.get(k) - bins.get(keys[0]); if (Math.abs(got - want) > 1.5) hang.push({ line: Number(l.dataset.line), guides, gotCols: +(got / ch).toFixed(2), wantCols: guides * 4 + 4 }); }); });
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped, hangBad: hang }; })()`;
// Real bounding boxes: texts vs texts, cells, day boxes and bars (a label may sit on the shape that contains its
// anchor); solid shapes vs each other; labels inside their owners; rects, texts, lines and paths inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.lc1970-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOutside: 0 };
  const grow = (el, name) => { const b = el.getBBox(); const sw = el.tagName === 'text' ? 0 : (parseFloat(getComputedStyle(el).strokeWidth) || 0); return { el, name, x: b.x - sw / 2, y: b.y - sw / 2, w: b.width + sw, h: b.height + sw }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const all = (sel) => [...svg.querySelectorAll(sel)];
  const texts = all('text').map((el) => grow(el, 'text:' + el.textContent));
  const shapes = all('rect.lc1970-cell, rect.lc1970-daybox, rect.lc1970-bar').map((el) => grow(el, el.getAttribute('class') + '#' + (el.dataset.cell || el.dataset.day || el.dataset.node)));
  const owned = ['lc1970-cell-id', 'lc1970-cell-label', 'lc1970-day-label', 'lc1970-bar-label'];
  for (let i = 0; i < texts.length; i++) { const t = texts[i]; const ax = Number(t.el.getAttribute('x')); const ay = Number(t.el.getAttribute('y'));
    const mine = owned.some((k) => t.el.classList.contains(k)) ? shapes.find((s) => { const b = s.el.getBBox(); return ax > b.x && ax < b.x + b.width && ay > b.y && ay < b.y + b.height; }) : null;
    if (owned.some((k) => t.el.classList.contains(k))) { const o = mine ? mine.el.getBBox() : null; if (!o || t.x < o.x - 0.5 || t.x + t.w > o.x + o.width + 0.5 || t.y < o.y - 1 || t.y + t.h > o.y + o.height + 1) out.labelOutside++; }
    for (let j = i + 1; j < texts.length; j++) if (hit(t, texts[j])) out.overlaps.push([t.name, texts[j].name]);
    for (const s of shapes) if (s !== mine && hit(t, s)) out.overlaps.push([t.name, s.name]); }
  for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) if (hit(shapes[i], shapes[j])) out.overlaps.push([shapes[i].name, shapes[j].name]);
  all('rect, text, line, path.lc1970-link').forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 80)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...all('text').map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  return out; })()`;
// HTML cards: nothing inside the viz overflows its card, horizontally or vertically.
const HTML_PROBE = `(() => { const viz = document.querySelector('.lc1970-viz'); let clipped = 0; viz.querySelectorAll('.lc1970-card').forEach((card) => { const cr = card.getBoundingClientRect();
  card.querySelectorAll('*').forEach((el) => { if (el.closest('svg') && el.tagName !== 'svg') return; const r = el.getBoundingClientRect(); if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1 || r.top < cr.top - 1 || r.bottom > cr.bottom + 1)) clipped++; }); });
  const vr = viz.getBoundingClientRect(); viz.querySelectorAll(':scope > *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.left < vr.left - 1 || r.right > vr.right + 1) clipped++; });
  return clipped; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc1970-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break; } catch { /* retry */ }
    await sleep(200);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') errors.push(msg.params.entry.text + ' ' + (msg.params.entry.url || ''));
  });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (res.result.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails));
    return res.result.result.value;
  };
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: BASE });
  await sleep(3000);

  const load = async (pid, input) => {
    await evaluate(`(async () => { document.getElementById('problemId').value = '${pid}'; document.getElementById('loadBtn').click(); })()`);
    await sleep(1500);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    await sleep(200);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const runs = [
    ['default', null],
    ['short', '2,2 | 1,1;2,1;1,2;2,2'],
    ['day1', '2,2 | 1,1;1,2;2,1;2,2'],
    ['wide', '3,5 | 2,3;1,1;3,5;2,1;2,5;1,3;3,1;2,2;2,4;1,2;3,3;1,4;1,5;3,2;3,4'],
    ['bigger', '4,4 | 2,2;3,3;1,4;4,1;2,3;3,2;1,1;4,4;2,4;3,1;1,2;4,3;2,1;3,4;1,3;4,2'],
    ['tall-6x4', '6,4 | 3,2;1,1;6,4;2,3;5,1;4,4;1,3;3,4;6,1;2,2;5,3;4,1;1,2;3,1;6,2;2,4;5,2;4,3;1,4;3,3;6,3;2,1;5,4;4,2'],
    ['flat-2x6', '2,6 | 1,3;2,4;1,1;2,6;1,5;2,2;1,2;2,1;1,6;2,3;1,4;2,5'],
  ];
  if (process.env.QUICK) runs.length = 1;
  // Catalog: load 1970, open its (collapsed by default) Union-Find category, check the chip; then recent and search.
  await load(PID, null);
  report.listed = await evaluate(`(async () => {
    const out = { currentProblemId, idType: typeof currentProblemId, input: document.getElementById('arrInput').value, extraParams: document.querySelectorAll('[id^="param-"]').length };
    const before = [...document.querySelectorAll('#catalog [data-group-key="union-find"] .prob-chip[data-id="${PID}"]')].some((c) => c.offsetParent !== null);
    openCatalogGroupExclusively('union-find'); markActiveChip(); await new Promise((r) => setTimeout(r, 400));
    const chip = [...document.querySelectorAll('#catalog [data-group-key="union-find"] .prob-chip[data-id="${PID}"]')].find((c) => c.offsetParent !== null) || document.querySelector('#catalog [data-group-key="union-find"] .prob-chip[data-id="${PID}"]');
    out.unionFind = { visibleBeforeOpen: before, found: Boolean(chip), visible: Boolean(chip && chip.offsetParent !== null), active: Boolean(chip && chip.classList.contains('active')),
      unavailable: Boolean(chip && (chip.classList.contains('unavailable') || chip.disabled || chip.getAttribute('aria-disabled') === 'true')), cls: chip ? chip.className : null };
    const recent = document.querySelector('#recentItems .prob-chip[data-id="${PID}"]');
    out.recentChip = Boolean(recent); out.recentActive = Boolean(recent && recent.classList.contains('active'));
    const kw = document.getElementById('problemKeyword'); kw.value = '${PID}'; kw.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const found = document.querySelector('#problemSearchItems .prob-chip[data-id="${PID}"]');
    out.searchChip = Boolean(found); out.searchActive = Boolean(found && found.classList.contains('active'));
    kw.value = ''; kw.dispatchEvent(new Event('input', { bubbles: true }));
    return out; })()`);
  // A preset button sets the input box and reruns.
  await evaluate(`document.querySelector('[data-lc1970-case="4"]').click()`);
  await sleep(1500);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, answer: steps.at(-1).cross1970View.answer, steps: steps.length })`);
  for (const theme of ['dark', 'light']) {
    for (const [name, input] of runs) {
      await load(PID, input);
      report.runs[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, labelOutside: 0, htmlClipped: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0, codeClipped: 0, hangBad: 0 };
        const seen = new Set();
        for (let i = 0; i < steps.length; i++) {
          stepIndex = i; renderStep();
          const want = steps[i].codeLines[0]; seen.add(want);
          const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset.line));
          const viz = document.querySelector('.lc1970-viz');
          if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
          const g = ${GEOMETRY_PROBE};
          if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOutside += g.labelOutside; if (!g.fitsCard) out.notFit++;
            out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
            if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
          else out.mismatches.push([i, 'no svg']);
          out.htmlClipped += ${HTML_PROBE};
          out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
          out.inViewSource = Math.max(out.inViewSource, /def latestDayToCross|def find/.test(viz ? viz.textContent : '') ? 1 : 0);
          if (i % 7 === 0 || i === steps.length - 1) { const c = ${CODE_PROBE}; if (c.vScroll || c.hScroll) out.codeScroll++; out.codeClipped += c.clipped + c.hClipped; out.hangBad += c.hangBad.length; out.wrapped = c.wrapped; }
        }
        out.answer = steps.at(-1).cross1970View.answer;
        out.lines = [...seen].sort((a, b) => a - b).join(',');
        out.lineCount = seen.size;
        return out; })()`);
    }
    await load(PID, null);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
      stepIndex = Math.max(0, steps.findIndex((s, i) => i > 60 && s.cross1970View.event === 'link' && s.cross1970View.linked[0] !== s.cross1970View.linked[1])); renderStep();`);
    await sleep(600);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    // Narrow windows: more lines wrap; every continuation must start at its own indent + 4, never at column 0.
    for (const width of [1100, 1000, 520]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1800, deviceScaleFactor: 1, mobile: false });
      await sleep(600);
      report[`code-w${width}-${theme}`] = await evaluate(CODE_PROBE);
      report[`geometry-w${width}-${theme}`] = await evaluate(`(() => { const g = ${GEOMETRY_PROBE}; return { overlaps: g.overlaps.length, clipped: g.clipped.length, labelOutside: g.labelOutside, fitsCard: g.fitsCard, minFontPx: g.minFontPx, htmlClipped: ${HTML_PROBE} }; })()`);
    }
    await send('Emulation.clearDeviceMetricsOverride');
    await sleep(600);
    report[`colors-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.lc1970-viz')); const c = getComputedStyle(document.querySelector('.lc1970-card')); const w = document.querySelector('.lc1970-cell.is-water'); const l = document.querySelector('.lc1970-cell.is-land'); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, water: w ? getComputedStyle(w).fill : null, waterDash: w ? getComputedStyle(w).strokeDasharray : null, land: l ? getComputedStyle(l).fill : null }; })()`);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
    await sleep(400);
    const fb = await evaluate(`(() => { const r = document.querySelector('.lc1970-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
    const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
    fs.writeFileSync(path.join(OUT, `shot-final-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [9025, 3161, 3420, 547, 684, 2316]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } const txt = document.querySelector('#codePanel .code-line .txt');
      return { steps: steps.length, lc1970: Boolean(document.querySelector('.lc1970-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight, textIndent: txt ? getComputedStyle(txt).textIndent : null }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  // Live editor (real Pyodide): the displayed 1970 code runs as-is.
  report.live = {};
  for (const [key, input] of [['default', null], ['bigger', runs[4] ? runs[4][1] : null]]) {
    const before = errors.length;
    await load(PID, input);
    report.live[key] = await evaluate(`(async () => { await ensureLiveEditorRuntime(); await openLiveEditor(); await runLiveCode();
      const err = document.getElementById('liveError');
      return { answer: typeof answerValue === 'undefined' ? null : answerValue, steps: steps.length, error: err && !err.classList.contains('hidden') ? err.textContent.slice(0, 300) : null }; })()`);
    report.live[key].consoleErrors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
