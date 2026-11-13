'use strict';
// Throwaway headless-Chrome probe for the redesigned 3161 page (not part of the app or test suite).
// Usage: start the server on PORT=4316, then `BASE=http://localhost:4316/ node cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4316/';
const PORT = 9316;
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped: lines.filter((l) => l.getBoundingClientRect().height > 25).length }; })()`;
// Real bounding boxes: texts vs texts, posts, gaps, tail, nodes and the block (a label may sit on its own bar / node / block);
// live posts vs bars; same-kind shapes vs each other; labels inside their owners; everything inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.bp3161-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOutside: 0 };
  const grow = (el, name) => { const b = el.getBBox(); const sw = el.tagName === 'text' ? 0 : (parseFloat(getComputedStyle(el).strokeWidth) || 0); return { el, name, x: b.x - sw / 2, y: b.y - sw / 2, w: b.width + sw, h: b.height + sw }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const texts = [...svg.querySelectorAll('text')].map((el) => grow(el, 'text:' + el.textContent));
  const all = (sel) => [...svg.querySelectorAll(sel)];
  const posts = all('rect.bp3161-post').map((el) => grow(el, el.getAttribute('class')));
  const live = posts.filter((p) => !p.el.classList.contains('is-ghost'));
  const bars = all('rect.bp3161-gap, rect.bp3161-tail, rect.bp3161-node, rect.bp3161-block').map((el) => grow(el, el.getAttribute('class') + '#' + (el.dataset.gap || el.dataset.node || '')));
  const owners = { 'bp3161-gap-label': all('rect.bp3161-gap'), 'bp3161-node-label': all('rect.bp3161-node'), 'bp3161-block-label': all('rect.bp3161-block'), 'bp3161-tail-label': all('rect.bp3161-tail') };
  const own = (t) => { for (const [kind, list] of Object.entries(owners)) if (t.el.classList.contains(kind)) { const k = all('text.' + kind).indexOf(t.el); return list[k] || null; } return null; };
  for (let i = 0; i < texts.length; i++) { const mine = own(texts[i]);
    if (mine) { const o = mine.getBBox(); const b = texts[i]; if (b.x < o.x - 0.5 || b.x + b.w > o.x + o.width + 0.5 || b.y < o.y - 1 || b.y + b.h > o.y + o.height + 1) out.labelOutside++; }
    for (let j = i + 1; j < texts.length; j++) if (hit(texts[i], texts[j])) out.overlaps.push([texts[i].name, texts[j].name]);
    for (const s of [...posts, ...bars]) if (s.el !== mine && hit(texts[i], s)) out.overlaps.push([texts[i].name, s.name]); }
  for (const p of live) for (const s of bars) if (hit(p, s)) out.overlaps.push([p.name, s.name]);
  for (const sel of ['rect.bp3161-gap', 'rect.bp3161-node', 'rect.bp3161-post']) { const list = all(sel).map((el) => grow(el, sel)); for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (hit(list[i], list[j])) out.overlaps.push([list[i].name, list[j].name]); }
  all('rect, text').forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...all('text').map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  return out; })()`;
// HTML cards: nothing inside the viz overflows its card horizontally.
const HTML_PROBE = `(() => { const viz = document.querySelector('.bp3161-viz'); let clipped = 0; viz.querySelectorAll('.bp3161-card').forEach((card) => { const cr = card.getBoundingClientRect();
  card.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1)) clipped++; }); }); return clipped; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bp3161-'));
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
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const runs = [
    ['default', null],
    ['short', '1,2;2,3,3;2,3,1;2,2,2'],
    ['bigger', '1,3;1,8;2,10,4;1,11;2,13,5;1,6;2,13,3;2,7,4'],
    ['nofit', '1,2;1,4;2,5,3;2,6,3'],
    ['packed-left', '1,1;1,2;1,3;1,4;1,5;1,6;1,7;2,15,1'],
    ['wide-sz', '1,8;2,15,7;2,15,8'],
  ];
  // Catalog: load 3161, open its (collapsed by default) Binary Search category, then the Segment Tree and Fenwick groups.
  await load(3161, null);
  report.listed = await evaluate(`(async () => {
    const out = { currentProblemId, idType: typeof currentProblemId, input: document.getElementById('arrInput').value, extraParams: document.querySelectorAll('[id^="param-"]').length };
    const chipIn = async (key) => { openCatalogGroupExclusively(key); markActiveChip(); await new Promise((r) => setTimeout(r, 400));
      let chip = document.querySelector('#catalog [data-group-key="' + key + '"] .prob-chip[data-id="3161"]');
      if (chip && chip.offsetParent === null) { const tabs = [...document.querySelectorAll('#catalog [data-group-key="' + key + '"] [data-subtab], #catalog [data-group-key="' + key + '"] [role="tab"]')];
        for (const tab of tabs) { tab.click(); markActiveChip(); await new Promise((r) => setTimeout(r, 250)); chip = [...document.querySelectorAll('#catalog [data-group-key="' + key + '"] .prob-chip[data-id="3161"]')].find((c) => c.offsetParent !== null) || chip; if (chip.offsetParent !== null) break; } }
      return { found: Boolean(chip), visible: Boolean(chip && chip.offsetParent !== null), active: Boolean(chip && chip.classList.contains('active')),
        unavailable: Boolean(chip && (chip.classList.contains('unavailable') || chip.disabled || chip.getAttribute('aria-disabled') === 'true')), cls: chip ? chip.className : null }; };
    out.binarySearch = await chipIn('binary-search');
    out.segmentTree = await chipIn('segment-tree');
    out.fenwickTree = await chipIn('fenwick-tree');
    const recent = document.querySelector('#recentItems .prob-chip[data-id="3161"]');
    out.recentChip = Boolean(recent); out.recentActive = Boolean(recent && recent.classList.contains('active'));
    const kw = document.getElementById('problemKeyword'); kw.value = '3161'; kw.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const found = document.querySelector('#problemSearchItems .prob-chip[data-id="3161"]');
    out.searchChip = Boolean(found); out.searchActive = Boolean(found && found.classList.contains('active'));
    kw.value = ''; kw.dispatchEvent(new Event('input', { bubbles: true }));
    return out; })()`);
  // A preset button sets the queries box and reruns.
  await evaluate(`document.querySelector('[data-bp3161-case="2"]').click()`);
  await sleep(1500);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, answer: steps.at(-1).blockPlace3161View.answer })`);
  for (const theme of ['dark', 'light']) {
    for (const [name, input] of runs) {
      await load(3161, input);
      report.runs[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, labelOutside: 0, htmlClipped: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0, codeClipped: 0 };
        const seen = new Set();
        for (let i = 0; i < steps.length; i++) {
          stepIndex = i; renderStep();
          const want = steps[i].codeLines[0]; seen.add(want);
          const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset.line));
          const viz = document.querySelector('.bp3161-viz');
          if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
          const g = ${GEOMETRY_PROBE};
          if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOutside += g.labelOutside; if (!g.fitsCard) out.notFit++;
            out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
            if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
          out.htmlClipped += ${HTML_PROBE};
          out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
          out.inViewSource = Math.max(out.inViewSource, /def getResults|bisect_right\\(/.test(viz ? viz.textContent : '') ? 1 : 0);
          const c = ${CODE_PROBE}; if (c.vScroll || c.hScroll) out.codeScroll++; out.codeClipped += c.clipped + c.hClipped;
        }
        out.answer = steps.at(-1).blockPlace3161View.answer;
        out.lines = [...seen].sort((a, b) => a - b).join(',');
        out.lineCount = seen.size;
        return out; })()`);
    }
    await load(3161, null);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
      stepIndex = Math.max(0, steps.findIndex((s) => s.blockPlace3161View.event === 'append')); renderStep();`);
    await sleep(600);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    report[`colors-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.bp3161-viz')); const c = getComputedStyle(document.querySelector('.bp3161-card')); const g = getComputedStyle(document.querySelector('.bp3161-gap')); const n = document.querySelector('.bp3161-node:not(.is-zero)'); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, gap: g.fill, node: n ? getComputedStyle(n).fill : null }; })()`);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
    await sleep(400);
    const fb = await evaluate(`(() => { const r = document.querySelector('.bp3161-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
    const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
    fs.writeFileSync(path.join(OUT, `shot-final-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [3420, 2406, 1854, 1094, 416, 352, 528]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, bp3161: Boolean(document.querySelector('.bp3161-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
