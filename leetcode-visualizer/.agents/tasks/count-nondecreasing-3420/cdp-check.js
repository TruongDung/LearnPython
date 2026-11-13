'use strict';
// Throwaway headless-Chrome probe for the new 3420 page (not part of the app or test suite).
// Usage: start the server on PORT=4420, then `BASE=http://localhost:4420/ node cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4420/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped: lines.filter((l) => l.getBoundingClientRect().height > 25).length }; })()`;
// Real bounding boxes: texts vs texts and vs bars, fills, chips, cells, level lines and the window bracket
// (a chip / cell label may sit on its own chip / cell); chips vs chips; values inside their cells / chips; all inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.nd3420-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOutside: 0 };
  const grow = (el, name) => { const b = el.getBBox(); const sw = el.tagName === 'text' ? 0 : (parseFloat(getComputedStyle(el).strokeWidth) || 0); return { el, name, x: b.x - sw / 2, y: b.y - sw / 2, w: b.width + sw, h: b.height + sw }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const texts = [...svg.querySelectorAll('text')].map((el) => grow(el, 'text:' + el.textContent));
  const shapes = [...svg.querySelectorAll('rect.nd3420-bar, rect.nd3420-fill, rect.nd3420-chip, rect.nd3420-cell, rect.nd3420-window, line.nd3420-level')].map((el) => grow(el, el.getAttribute('class')));
  const chipEls = [...svg.querySelectorAll('rect.nd3420-chip')]; const cellEls = [...svg.querySelectorAll('rect.nd3420-cell')];
  const own = (t) => { if (t.el.dataset.chipLabel !== undefined) return svg.querySelector('[data-chip="' + t.el.dataset.chipLabel + '"]');
    if (t.el.classList.contains('nd3420-cell-value')) { const k = [...svg.querySelectorAll('text.nd3420-cell-value')].indexOf(t.el); return cellEls[k]; } return null; };
  for (let i = 0; i < texts.length; i++) { const mine = own(texts[i]);
    if (mine) { const o = mine.getBBox(); const b = texts[i]; if (b.x < o.x - 0.5 || b.x + b.w > o.x + o.width + 0.5 || b.y < o.y - 1 || b.y + b.h > o.y + o.height + 1) out.labelOutside++; }
    for (let j = i + 1; j < texts.length; j++) if (hit(texts[i], texts[j])) out.overlaps.push([texts[i].name, texts[j].name]);
    for (const s of shapes) if (s.el !== mine && hit(texts[i], s)) out.overlaps.push([texts[i].name, s.name]); }
  const chips = shapes.filter((s) => chipEls.includes(s.el)); for (let i = 0; i < chips.length; i++) for (let j = i + 1; j < chips.length; j++) if (hit(chips[i], chips[j])) out.overlaps.push([chips[i].name, chips[j].name]);
  [...svg.querySelectorAll('rect, line, text')].forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...[...svg.querySelectorAll('text')].map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  return out; })()`;
// HTML cards: nothing inside the viz overflows its card horizontally.
const HTML_PROBE = `(() => { const viz = document.querySelector('.nd3420-viz'); let clipped = 0; viz.querySelectorAll('.nd3420-card').forEach((card) => { const cr = card.getBoundingClientRect();
  card.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1)) clipped++; }); }); return clipped; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nd3420-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9420', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9420/json')).json(); if (targets.length) break; } catch { /* retry */ }
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

  const load = async (pid, input, k) => {
    await evaluate(`(async () => { document.getElementById('problemId').value = '${pid}'; document.getElementById('loadBtn').click(); })()`);
    await sleep(1500);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    if (k) await evaluate(`document.getElementById('param-k').value = '${k}'`);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const presets = [
    ['default', null, 5],
    ['short', '3,1,2', 1],
    ['lc1', '6,3,1,2,4,4', 7],
    ['lc2', '6,3,1,3,6', 4],
    ['sorted', '1,2,3,4', 1],
    ['tall-k999', '20,1,1,1,1,1,1,1,1,1', 999],
    ['zigzag-k1', '1,20,1,20,1,20,1,20,1,20', 1],
  ];
  // Catalog: load 3420, open its (collapsed by default) Sliding Window category, then the Segment Tree group.
  await load(3420, null, null);
  report.listed = await evaluate(`(async () => {
    const out = { currentProblemId, idType: typeof currentProblemId };
    const chipIn = async (key) => { openCatalogGroupExclusively(key); markActiveChip(); await new Promise((r) => setTimeout(r, 400));
      const chip = document.querySelector('#catalog [data-group-key="' + key + '"] .prob-chip[data-id="3420"]');
      return { found: Boolean(chip), visible: Boolean(chip && chip.offsetParent !== null), active: Boolean(chip && chip.classList.contains('active')),
        unavailable: Boolean(chip && (chip.classList.contains('unavailable') || chip.disabled || chip.getAttribute('aria-disabled') === 'true')), cls: chip ? chip.className : null }; };
    out.sliding = await chipIn('sliding');
    out.segmentTree = await chipIn('segment-tree');
    const recent = document.querySelector('#recentItems .prob-chip[data-id="3420"]');
    out.recentChip = Boolean(recent); out.recentActive = Boolean(recent && recent.classList.contains('active'));
    const kw = document.getElementById('problemKeyword'); kw.value = '3420'; kw.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const found = document.querySelector('#problemSearchItems .prob-chip[data-id="3420"]');
    out.searchChip = Boolean(found); out.searchActive = Boolean(found && found.classList.contains('active'));
    kw.value = ''; kw.dispatchEvent(new Event('input', { bubbles: true }));
    out.kParam = document.getElementById('param-k') ? document.getElementById('param-k').value : null;
    return out; })()`);
  // A preset button sets both nums and k.
  await evaluate(`document.querySelector('[data-nd3420-case="2"]').click()`);
  await sleep(1500);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, k: document.getElementById('param-k').value, answer: steps.at(-1).nonDec3420View.answer })`);
  for (const theme of ['dark', 'light']) {
    for (const [name, input, k] of presets) {
      await load(3420, input, k);
      report.runs[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, labelOutside: 0, htmlClipped: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0, codeClipped: 0 };
        const seen = new Set();
        for (let i = 0; i < steps.length; i++) {
          stepIndex = i; renderStep();
          const want = steps[i].codeLines[0]; seen.add(want);
          const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset.line));
          const viz = document.querySelector('.nd3420-viz');
          if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
          const g = ${GEOMETRY_PROBE};
          if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOutside += g.labelOutside; if (!g.fitsCard) out.notFit++;
            out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
            if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
          out.htmlClipped += ${HTML_PROBE};
          out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
          out.inViewSource = Math.max(out.inViewSource, /def countNonDecreasingSubarrays|appendleft/.test(viz ? viz.textContent : '') ? 1 : 0);
          const c = ${CODE_PROBE}; if (c.vScroll || c.hScroll) out.codeScroll++; out.codeClipped += c.clipped + c.hClipped;
        }
        out.answer = steps.at(-1).nonDec3420View.answer;
        out.lines = [...seen].sort((a, b) => a - b).join(',');
        return out; })()`);
    }
    await load(3420, null, 5);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
      stepIndex = Math.max(0, steps.findIndex((s) => s.nonDec3420View.event === 'raise' && s.nonDec3420View.i === 2)); renderStep();`);
    await sleep(600);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    report[`colors-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.nd3420-viz')); const c = getComputedStyle(document.querySelector('.nd3420-card')); const b = getComputedStyle(document.querySelector('.nd3420-bar.is-in')); const f = document.querySelector('.nd3420-fill'); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, bar: b.fill, fill: f ? getComputedStyle(f).fill : null }; })()`);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
    await sleep(400);
    const fb = await evaluate(`(() => { const r = document.querySelector('.nd3420-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
    const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
    fs.writeFileSync(path.join(OUT, `shot-final-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [2406, 1854, 1094, 416, 432]) {
    const before = errors.length;
    await load(pid, null, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, nd3420: Boolean(document.querySelector('.nd3420-viz')), kParam: Boolean(document.getElementById('param-k')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
