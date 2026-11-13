'use strict';
// Throwaway headless-Chrome probe for the new 1094 page (not part of the app or test suite).
// Usage: start the worktree server on PORT=4094, then `BASE=http://localhost:4094/ node cdp-check-1094.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4094/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped: lines.filter((l) => l.getBoundingClientRect().height > 25).length }; })()`;
// Real bounding boxes: texts vs texts and vs solid shapes (trip bars, drop dots, load bars),
// the max_pop line vs texts (widened by its stroke), diff values inside their cells, everything inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.cp1094-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], cellOverflow: 0 };
  const box = (el, name) => { const b = el.getBBox(); return { name, x: b.x, y: b.y, w: b.width, h: b.height }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const textEls = [...svg.querySelectorAll('text')]; const texts = textEls.map((el) => ({ ...box(el, 'text:' + el.textContent), own: el.dataset.tripNum !== undefined ? svg.querySelector('[data-trip=\"' + el.dataset.tripNum + '\"]') : null }));
  const shapes = [...svg.querySelectorAll('rect.cp1094-trip, rect.cp1094-load, circle.cp1094-drop')].map((el) => { const b = box(el, el.getAttribute('class')); const sw = parseFloat(getComputedStyle(el).strokeWidth) || 0; return { ...b, el, x: b.x - sw / 2, y: b.y - sw / 2, w: b.w + sw, h: b.h + sw }; });
  const marks = [...svg.querySelectorAll('line.cp1094-cap')].map((el) => { const b = el.getBBox(); const sw = parseFloat(getComputedStyle(el).strokeWidth) || 1; return { name: 'cap', x: b.x, y: b.y - sw / 2 - 1, w: b.width, h: sw + 2 }; });
  for (let i = 0; i < texts.length; i++) { for (let j = i + 1; j < texts.length; j++) if (hit(texts[i], texts[j])) out.overlaps.push([texts[i].name, texts[j].name]);
    for (const s of shapes) if (s.el !== texts[i].own && hit(texts[i], s)) out.overlaps.push([texts[i].name, s.name]);
    for (const m of marks) if (hit(texts[i], m)) out.overlaps.push([texts[i].name, m.name]); }
  for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) if (hit(shapes[i], shapes[j])) out.overlaps.push([shapes[i].name, shapes[j].name]);
  const cells = [...svg.querySelectorAll('rect.cp1094-cell, rect.cp1094-curr')].map((el) => el.getBBox());
  [...svg.querySelectorAll('text.cp1094-cell-value, text.cp1094-curr-value')].forEach((el, k) => { const b = el.getBBox(); const c = cells[k]; if (!c || b.x < c.x - 0.5 || b.x + b.width > c.x + c.width + 0.5) out.cellOverflow++; });
  [...svg.querySelectorAll('rect, line, text, circle')].forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...[...svg.querySelectorAll('text')].map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  out.tripNumOutside = textEls.filter((el, k) => texts[k].own).filter((el, k) => { const b = el.getBBox(); const o = el.parentNode.querySelector('[data-trip=\"' + el.dataset.tripNum + '\"]').getBBox(); return b.x < o.x || b.x + b.width > o.x + o.width || b.y < o.y - 1 || b.y + b.height > o.y + o.height + 1; }).length; return out; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cp1094-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9094', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9094/json')).json(); if (targets.length) break; } catch { /* retry */ }
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

  const load = async (pid, input, capacity) => {
    await evaluate(`(async () => { document.getElementById('problemId').value = '${pid}'; document.getElementById('loadBtn').click(); })()`);
    await sleep(1500);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    if (capacity) await evaluate(`document.getElementById('param-capacity').value = '${capacity}'`);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const presets = [
    ['default', null, 6],
    ['over', '[[2,1,5],[3,3,7]]', 4],
    ['fits', '[[2,1,5],[3,3,7]]', 5],
    ['back', '[[3,2,7],[3,7,9],[8,3,9]]', 11],
    ['tall', JSON.stringify(Array.from({ length: 8 }, (_, k) => [9, k, 16])), 99],
    ['one-cell', JSON.stringify(Array.from({ length: 8 }, () => [9, 15, 16])), 1],
    ['offscale', '[[1,0,16]]', 99],
  ];
  await load(1094, null, null);
  report.listed = await evaluate(`(async () => { openCatalogGroupExclusively('prefix-sum'); await new Promise((r) => setTimeout(r, 400)); markActiveChip();
    const chips = [...document.querySelectorAll('#catalog .prob-chip')].filter((c) => c.dataset.id === '1094');
    return { currentProblemId, type: typeof currentProblemId, chips: chips.length, active: chips.filter((c) => c.classList.contains('active')).length,
      recentActive: [...document.querySelectorAll('.recent-chip')].filter((c) => c.dataset.id === '1094' && c.classList.contains('active')).length,
      capacityParam: document.getElementById('param-capacity') ? document.getElementById('param-capacity').value : null }; })()`);
  report.api = await evaluate(`fetch('/api/problems').then((r) => r.json()).then((d) => { const groups = (Array.isArray(d) ? d : d.groups || []).filter((g) => (g.problems || []).some((p) => Number(p.id) === 1094)).map((g) => g.key); return groups; })`);
  // A preset button sets both trips and capacity.
  await evaluate(`document.querySelector('[data-cp1094-case="1"]').click()`);
  await sleep(1500);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, capacity: document.getElementById('param-capacity').value, answer: steps.at(-1).carPool1094View.answer })`);
  for (const theme of ['dark', 'light']) {
    for (const [name, input, capacity] of presets) {
      await load(1094, input, capacity);
      report.runs[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, cellOverflow: 0, tripNumOutside: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0 };
        const seen = new Set();
        for (let i = 0; i < steps.length; i++) {
          stepIndex = i; renderStep();
          const want = steps[i].codeLines[0]; seen.add(want);
          const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset.line));
          const viz = document.querySelector('.cp1094-viz');
          if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
          const g = ${GEOMETRY_PROBE};
          if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.cellOverflow += g.cellOverflow; out.tripNumOutside += g.tripNumOutside; if (!g.fitsCard) out.notFit++;
            out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
            if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
          out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
          out.inViewSource = Math.max(out.inViewSource, /def carPooling|range\\(last/.test(viz ? viz.textContent : '') ? 1 : 0);
          const p = document.getElementById('codePanel'); if (p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1) out.codeScroll++;
        }
        out.answer = steps.at(-1).carPool1094View.answer;
        out.lines = [...seen].sort((a, b) => a - b).join(',');
        return out; })()`);
    }
    await load(1094, null, 6);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
      stepIndex = Math.max(0, steps.findIndex((s) => { const v = s.carPool1094View; return v.event === 'check' && v.i === 7; })); renderStep();`);
    await sleep(600);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    report[`colors-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.cp1094-viz')); const c = getComputedStyle(document.querySelector('.cp1094-card')); const n = getComputedStyle(document.querySelector('.cp1094-trip-num')); const b = getComputedStyle(document.querySelector('.cp1094-trip')); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, tripNum: n.fill, trip: b.fill }; })()`);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-1094-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
    await load(1094, '[[2,1,5],[3,3,7]]', 4);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
    await sleep(400);
    const fb = await evaluate(`(() => { const r = document.querySelector('.cp1094-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
    const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
    fs.writeFileSync(path.join(OUT, `shot-1094-over-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [1854, 2406, 416, 426, 432, 146, 1851]) {
    const before = errors.length;
    await load(pid, null, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, cp1094: Boolean(document.querySelector('.cp1094-viz')), mp1854: Boolean(document.querySelector('.mp1854-viz')), capacityParam: Boolean(document.getElementById('param-capacity')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report-1094.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
