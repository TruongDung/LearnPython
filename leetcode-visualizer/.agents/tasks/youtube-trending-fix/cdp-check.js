'use strict';
// Throwaway headless-Chrome probe for the 9025 page (not part of the app or test suite).
// Usage: start the server with PORT=4325, then `BASE=http://localhost:4325/ node cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4325/';
const PORT = 9325;
const OUT = __dirname;
const PID = 9025;
// Code panel: no vertical or horizontal scrollbar; no visible line cut at the top/bottom or at the right edge.
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  const wraps = lines.filter((l) => l.getBoundingClientRect().height > 25).map((l) => { const t = l.querySelector('.txt'); const guide = t.querySelector('.indent-guide'); const probe = document.createElement('span'); probe.textContent = '0000000000'; probe.style.whiteSpace = 'nowrap'; t.appendChild(probe);
    const ch = guide ? guide.getBoundingClientRect().width / 4 : probe.getBoundingClientRect().width / 10; probe.remove(); const rng = document.createRange(); rng.selectNodeContents(t); const rects = [...rng.getClientRects()].filter((r) => r.width > 0);
    const top0 = Math.min(...rects.map((r) => r.top)); const left0 = Math.min(...rects.filter((r) => r.top < top0 + 4).map((r) => r.left)); const rest = rects.filter((r) => r.top >= top0 + 4);
    const lead = (/^ */.exec(t.textContent) || [''])[0].length; const col = rest.length ? Math.round((Math.min(...rest.map((r) => r.left)) - left0) / ch) : null;
    return { line: Number(l.dataset.line || l.dataset.line2 || l.dataset.line3), lead, col }; });
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped: wraps.length, wraps, badWraps: wraps.filter((w) => w.col === null || w.col !== w.lead + 4).length }; })()`;
// Real bounding boxes: a text may only touch the shape whose data-key equals its data-own (and must sit inside it);
// solid rects never overlap each other; background bands (data-layer="bg") are skipped; everything inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.yt9025-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOutside: 0 };
  const grow = (el, name) => { const b = el.getBBox(); const sw = el.tagName === 'text' ? 0 : (parseFloat(getComputedStyle(el).strokeWidth) || 0); return { el, name, x: b.x - sw / 2, y: b.y - sw / 2, w: b.width + sw, h: b.height + sw }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const all = (sel) => [...svg.querySelectorAll(sel)];
  const texts = all('text').map((el) => grow(el, 'text:' + el.textContent));
  const solids = all('rect:not([data-layer="bg"])').map((el) => grow(el, el.getAttribute('class') + '#' + (el.dataset.key || '')));
  const inside = (t, s) => t.x >= s.x - 0.5 && t.x + t.w <= s.x + s.w + 0.5 && t.y >= s.y - 1 && t.y + t.h <= s.y + s.h + 1;
  for (let i = 0; i < texts.length; i++) {
    const own = texts[i].el.dataset.own; const mine = own ? solids.find((s) => s.el.dataset.key === own) : null;
    if (own && (!mine || !inside(texts[i], mine))) out.labelOutside++;
    for (let j = i + 1; j < texts.length; j++) if (hit(texts[i], texts[j])) out.overlaps.push([texts[i].name, texts[j].name]);
    for (const s of solids) if (s !== mine && hit(texts[i], s)) out.overlaps.push([texts[i].name, s.name]); }
  for (let i = 0; i < solids.length; i++) for (let j = i + 1; j < solids.length; j++) if (hit(solids[i], solids[j])) out.overlaps.push([solids[i].name, solids[j].name]);
  all('rect, text, path').forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...all('text').map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  return out; })()`;
// HTML cards: nothing inside the viz overflows its card, horizontally or vertically.
const HTML_PROBE = `(() => { const viz = document.querySelector('.yt9025-viz'); let clipped = 0; viz.querySelectorAll('.yt9025-card').forEach((card) => { const cr = card.getBoundingClientRect();
  card.querySelectorAll('*').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1 || r.top < cr.top - 1 || r.bottom > cr.bottom + 1)) clipped++; }); });
  const vr = viz.getBoundingClientRect(); viz.querySelectorAll(':scope > *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.left < vr.left - 1 || r.right > vr.right + 1) clipped++; });
  return clipped; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'yt9025-'));
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

  const load = async (pid, input, approach) => {
    await evaluate(`(async () => { document.getElementById('problemId').value = '${pid}'; document.getElementById('loadBtn').click(); })()`);
    await sleep(1500);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    if (approach) await evaluate(`(() => { const s = document.getElementById('param-approach'); if (s) { s.value = '${approach}'; s.dispatchEvent(new Event('change', { bubbles: true })); } })()`);
    await sleep(300);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const runs = [
    ['default', null],
    ['screenshot', '2 | 1:3, 2:3, 3:4 | 1'],
    ['k3', '3 | a:2, b:5, c:1, d:4 | c, c, a, e, c, c'],
    ['k1', '1 | x:2, y:1 | y, y, z'],
    ['full', '5 | 1:9, 2:9, 3:9, 4:9, 5:9, 6:9, 7:9, 8:9 | 8, 8, 8, 8, 8, 8, 8, 8'],
    ['empty-start', '1 |  | a'],
    ['hop', '2 | a:1, b:2, c:3 | a, a, a, a, b, b, b, b'],
  ];
  if (process.env.QUICK) runs.length = 1; // debugging aid: one input per approach and theme
  // Catalog: load 9025, open its (collapsed by default) Interview category, check the chip; then recent and search.
  await load(PID, null);
  report.listed = await evaluate(`(async () => {
    const out = { currentProblemId, idType: typeof currentProblemId, input: document.getElementById('arrInput').value, approachParam: Boolean(document.getElementById('param-approach')) };
    const before = [...document.querySelectorAll('#catalog [data-group-key="interview"] .prob-chip[data-id="${PID}"]')].some((c) => c.offsetParent !== null);
    openCatalogGroupExclusively('interview'); markActiveChip(); await new Promise((r) => setTimeout(r, 400));
    const chip = [...document.querySelectorAll('#catalog [data-group-key="interview"] .prob-chip[data-id="${PID}"]')].find((c) => c.offsetParent !== null) || document.querySelector('#catalog [data-group-key="interview"] .prob-chip[data-id="${PID}"]');
    out.interview = { visibleBeforeOpen: before, found: Boolean(chip), visible: Boolean(chip && chip.offsetParent !== null), active: Boolean(chip && chip.classList.contains('active')),
      unavailable: Boolean(chip && (chip.classList.contains('unavailable') || chip.disabled || chip.getAttribute('aria-disabled') === 'true')), cls: chip ? chip.className : null };
    const recent = document.querySelector('#recentItems .prob-chip[data-id="${PID}"]');
    out.recentChip = Boolean(recent); out.recentActive = Boolean(recent && recent.classList.contains('active'));
    const kw = document.getElementById('problemKeyword'); kw.value = '${PID}'; kw.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const found = document.querySelector('#problemSearchItems .prob-chip[data-id="${PID}"]');
    out.searchChip = Boolean(found); out.searchActive = Boolean(found && found.classList.contains('active'));
    kw.value = ''; kw.dispatchEvent(new Event('input', { bubbles: true }));
    const kw2 = document.getElementById('problemKeyword'); kw2.value = 'trending'; kw2.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    out.searchByName = Boolean(document.querySelector('#problemSearchItems .prob-chip[data-id="${PID}"]'));
    kw2.value = ''; kw2.dispatchEvent(new Event('input', { bubbles: true }));
    return out; })()`);
  // A preset button sets the input box and reruns.
  await evaluate(`document.querySelector('[data-yt9025-case="1"]').click()`);
  await sleep(1500);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, answer: steps.at(-1).yt9025View.answer })`);
  for (const theme of ['dark', 'light']) {
    for (const approach of [1, 2, 3]) {
      for (const [name, input] of runs) {
        await load(PID, input, approach);
        report.runs[`${name}-a${approach}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
          const out = { steps: steps.length, approach: steps[0].yt9025View.approach, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, labelOutside: 0, htmlClipped: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0, codeClipped: 0 };
          const seen = new Set();
          for (let i = 0; i < steps.length; i++) {
            stepIndex = i; renderStep();
            const want = steps[i].codeLines[0]; seen.add(want);
            const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset[steps[i].codeBlock === 3 ? 'line3' : steps[i].codeBlock === 2 ? 'line2' : 'line']));
            const viz = document.querySelector('.yt9025-viz');
            if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
            const g = ${GEOMETRY_PROBE};
            if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOutside += g.labelOutside; if (!g.fitsCard) out.notFit++;
              out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
              if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
            out.htmlClipped += ${HTML_PROBE};
            out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
            out.inViewSource = Math.max(out.inViewSource, /def records\\(self|def __init__\\(self/.test(viz ? viz.textContent : '') ? 1 : 0);
            const c = ${CODE_PROBE}; if (c.vScroll || c.hScroll) out.codeScroll++; out.codeClipped += c.clipped + c.hClipped;
          }
          out.answer = steps.at(-1).yt9025View.answer;
          out.lines = [...seen].sort((a, b) => a - b).join(',');
          out.lineCount = seen.size;
          return out; })()`);
      }
      await load(PID, null, approach);
      await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
        stepIndex = Math.max(0, steps.findIndex((s) => ['push', 'add', 'walk'].includes(s.yt9025View.event) && s.yt9025View.ci === 2)); renderStep();`);
      await sleep(600);
      report[`code-a${approach}-${theme}`] = await evaluate(CODE_PROBE);
      // Narrow window: more lines wrap; every continuation must start at its own indent + 4, never at column 0.
      for (const width of [1100, 1000, 520]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 1800, deviceScaleFactor: 1, mobile: false });
        await sleep(600);
        report[`code-w${width}-a${approach}-${theme}`] = await evaluate(CODE_PROBE);
      }
      await send('Emulation.clearDeviceMetricsOverride');
      await sleep(600);
      report[`colors-a${approach}-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.yt9025-viz')); const c = getComputedStyle(document.querySelector('.yt9025-card')); const b = document.querySelector('.yt9025-bar'); const s = document.querySelector('.yt9025-node, .yt9025-bucket'); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, bar: b ? getComputedStyle(b).fill : null, slot: s ? getComputedStyle(s).stroke : null }; })()`);
      const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
      fs.writeFileSync(path.join(OUT, `shot-a${approach}-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
      await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
      await sleep(400);
      const fb = await evaluate(`(() => { const r = document.querySelector('.yt9025-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
      const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
      fs.writeFileSync(path.join(OUT, `shot-final-a${approach}-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
    }
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [3161, 3420, 2406, 300]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } const txt = document.querySelector('#codePanel .code-line .txt');
      return { steps: steps.length, yt9025: Boolean(document.querySelector('.yt9025-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight, textIndent: txt ? getComputedStyle(txt).textIndent : null }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  // Live editor (real Pyodide): 9025 in every approach, plus other live-editor pages as a spot check.
  report.live = {};
  const liveRuns = [[PID, '2 | 1:3, 2:3, 3:4 | 1', 1], [PID, '2 | 1:3, 2:3, 3:4 | 1', 2], [PID, '2 | 1:3, 2:3, 3:4 | 1', 3],
    [PID, null, 1], [PID, null, 2], [PID, null, 3], [146, null, null], [432, null, null], [295, null, null], [208, null, null], [1, null, null]];
  for (const [pid, input, approach] of liveRuns) {
    const before = errors.length;
    await load(pid, input, approach);
    const key = `${pid}${approach ? `-a${approach}` : ''}${input ? '-screenshot' : ''}`;
    report.live[key] = await evaluate(`(async () => { await ensureLiveEditorRuntime(); await openLiveEditor(); await runLiveCode();
      const err = document.getElementById('liveError');
      return { answer: answerValue, steps: steps.length, error: err && !err.classList.contains('hidden') ? err.textContent.slice(0, 300) : null }; })()`);
    report.live[key].consoleErrors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
