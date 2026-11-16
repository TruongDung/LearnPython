'use strict';
// Throwaway headless-Chrome probe for the 2218 page (not part of the app or test suite).
// Usage: start the server with PORT=4218, then `BASE=http://localhost:4218/ node cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4218/';
const PORT = 9218;
const OUT = __dirname;
const PID = 2218;
// Code panel: no vertical or horizontal scrollbar; no visible line cut at the top/bottom or at the right edge.
// Wrapped lines: every continuation starts exactly at its own indent + 4 columns.
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  const hClipped = lines.filter((l) => { const t = l.querySelector('.txt') || l; const rng = document.createRange(); rng.selectNodeContents(t); const rr = rng.getBoundingClientRect(); return rr.right > pr.right - 1 || l.getBoundingClientRect().right > pr.right + 0.5; }).length;
  const probe = document.createElement('span'); probe.textContent = '0000000000'; const t0 = lines[0].querySelector('.txt'); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;text-indent:0'; t0.appendChild(probe); const ch = probe.getBoundingClientRect().width / 10; probe.remove();
  const hang = []; let wrapped = 0;
  lines.forEach((l) => { const t = l.querySelector('.txt'); if (!t) return; const rng = document.createRange(); rng.selectNodeContents(t);
    const rects = [...rng.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5); if (!rects.length) return;
    const lh = parseFloat(getComputedStyle(t).lineHeight) || 18; const c0 = Math.min(...rects.map((r) => r.top + r.height / 2));
    const bins = new Map(); rects.forEach((r) => { const k = Math.round((r.top + r.height / 2 - c0) / lh); bins.set(k, Math.min(bins.has(k) ? bins.get(k) : Infinity, r.left)); });
    if (bins.size < 2) return; wrapped++;
    const keys = [...bins.keys()].sort((a, b) => a - b);
    const guides = t.querySelectorAll(':scope > .indent-guide').length; const want = (guides * 4 + 4) * ch;
    keys.slice(1).forEach((k) => { const got = bins.get(k) - bins.get(keys[0]); if (Math.abs(got - want) > 1.5) hang.push({ line: Number(l.dataset.line || l.dataset.line2), guides, gotCols: +(got / ch).toFixed(2), wantCols: guides * 4 + 4 }); }); });
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped, scrollW: p.scrollWidth, clientW: p.clientWidth, hScroll: p.scrollWidth > p.clientWidth + 1, hClipped, wrapped, hangBad: hang }; })()`;
// Real bounding boxes: texts vs texts and shapes (a label may sit on the shape that owns it); shapes vs each other;
// owned labels inside their shapes; rects, texts, lines and paths inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.lc2218-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOutside: 0 };
  const grow = (el, name) => { const b = el.getBBox(); const sw = el.tagName === 'text' ? 0 : (parseFloat(getComputedStyle(el).strokeWidth) || 0); return { el, name, x: b.x - sw / 2, y: b.y - sw / 2, w: b.width + sw, h: b.height + sw }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const all = (sel) => [...svg.querySelectorAll(sel)];
  const texts = all('text').map((el) => grow(el, 'text:' + el.textContent));
  const shapes = all('rect.lc2218-coin, rect.lc2218-cell, rect.lc2218-choice').map((el) => grow(el, el.getAttribute('class') + '#' + (el.dataset.cell || el.dataset.t || (el.dataset.pile + '/' + el.dataset.coin))));
  const owned = { 'lc2218-coin-label': 'lc2218-coin', 'lc2218-cell-label': 'lc2218-cell', 'lc2218-choice-label': 'lc2218-choice', 'lc2218-choice-mark': 'lc2218-choice' };
  for (let i = 0; i < texts.length; i++) { const t = texts[i]; const kind = Object.keys(owned).find((k) => t.el.classList.contains(k));
    const cx = t.x + t.w / 2; const cy = t.y + t.h / 2;
    const mine = kind ? shapes.find((s) => s.el.classList.contains(owned[kind]) && (() => { const b = s.el.getBBox(); return cx > b.x && cx < b.x + b.width && cy > b.y && cy < b.y + b.height; })()) : null;
    if (kind) { const o = mine ? mine.el.getBBox() : null; if (!o || t.x < o.x - 0.5 || t.x + t.w > o.x + o.width + 0.5 || t.y < o.y - 1 || t.y + t.h > o.y + o.height + 1) out.labelOutside++; }
    for (let j = i + 1; j < texts.length; j++) if (hit(t, texts[j])) out.overlaps.push([t.name, texts[j].name]);
    for (const s of shapes) if (s !== mine && hit(t, s)) out.overlaps.push([t.name, s.name]); }
  for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) if (hit(shapes[i], shapes[j])) out.overlaps.push([shapes[i].name, shapes[j].name]);
  all('rect, text, line, path').forEach((el) => { if (el.closest('marker')) return; const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 80)); });
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  const cellBottoms = all('rect.lc2218-cell').map((el) => { const b = el.getBBox(); return b.y + b.height; });
  out.tableGap = cellBottoms.length ? vb.y + vb.height - Math.max(...cellBottoms) : 0; out.footCollision = all('.lc2218-foot').length;
  out.fitsCard = r.width <= pc.width + 1; out.scale = r.width / vb.width; out.minFontPx = Math.min(...all('text').map((el) => parseFloat(getComputedStyle(el).fontSize) * r.width / vb.width));
  return out; })()`;
// HTML cards: nothing inside the viz overflows its card, horizontally or vertically.
const HTML_PROBE = `(() => { const viz = document.querySelector('.lc2218-viz'); let clipped = 0; viz.querySelectorAll('.lc2218-card').forEach((card) => { const cr = card.getBoundingClientRect();
  card.querySelectorAll('*').forEach((el) => { if (el.closest('svg') && el.tagName !== 'svg') return; const r = el.getBoundingClientRect(); if (r.width && (r.left < cr.left - 1 || r.right > cr.right + 1 || r.top < cr.top - 1 || r.bottom > cr.bottom + 1)) clipped++; }); });
  const vr = viz.getBoundingClientRect(); viz.querySelectorAll(':scope > *').forEach((el) => { const r = el.getBoundingClientRect(); if (r.left < vr.left - 1 || r.right > vr.right + 1) clipped++; });
  return clipped; })()`;
// DP formula block: present and visible; no horizontal overflow; every segment inside the block and the card; segments
// don't overlap each other; the block doesn't overlap the SVG picture or the legend; the step row is filled while comparing.
const FORMULA_PROBE = `(() => { const f = document.querySelector('.lc2218-formula'); if (!f) return { exists: false };
  const fr = f.getBoundingClientRect(); const card = f.closest('.lc2218-card').getBoundingClientRect();
  const box = (el) => el.getBoundingClientRect(); const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const segs = [...f.querySelectorAll('.fx-seg, .lc2218-fx-symbols > span')].map(box);
  let segOverlap = 0; for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) if (hit(segs[i], segs[j])) segOverlap++;
  const segClipped = segs.filter((r) => r.left < fr.left - 0.5 || r.right > fr.right + 0.5 || r.top < fr.top - 0.5 || r.bottom > fr.bottom + 0.5 || r.right > card.right + 0.5).length;
  const svg = document.querySelector('.lc2218-svg'); const legend = document.querySelector('.lc2218-legend');
  const now = f.querySelector('.lc2218-fx-now:not(.is-empty)');
  const cs = getComputedStyle(f);
  return { exists: true, visible: f.offsetParent !== null && fr.width > 0 && fr.height > 0 && cs.visibility !== 'hidden', hOverflow: f.scrollWidth > f.clientWidth + 1,
    segClipped, segOverlap, overSvg: svg ? hit(fr, box(svg)) : false, overLegend: legend ? hit(fr, box(legend)) : false,
    general: (f.querySelector('.lc2218-fx-general') || {}).textContent || '', now: now ? now.textContent : '', nowColor: now ? getComputedStyle(now.querySelector('.fx-dst') || now).color : null, height: fr.height }; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc2218-'));
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

  const load = async (pid, input, params = {}) => {
    await evaluate(`(async () => { document.getElementById('problemId').value = '${pid}'; document.getElementById('loadBtn').click(); })()`);
    await sleep(1500);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    for (const [key, value] of Object.entries(params)) {
      await evaluate(`(() => { const el = document.getElementById('param-${key}'); if (el) { el.value = ${JSON.stringify(String(value))}; el.dispatchEvent(new Event('change', { bubbles: true })); } })()`);
    }
    await sleep(200);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { runs: {} };
  const runs = [
    ['default', '[[1,100,3],[7,8,9],[20,5,40]]', 3],
    ['short', '[[1,100,3],[7,8,9]]', 2],
    ['bottom700', '[[100],[100],[100],[100],[100],[100],[1,1,1,1,1,1,700]]', 7],
    ['wide-7x7', JSON.stringify(Array.from({ length: 7 }, (_, p) => Array.from({ length: 7 }, (_, c) => 999 - p * 7 - c))), 8],
    ['one-pile', '[[999,999,999,999,999,999,999]]', 7],
  ];
  if (process.env.QUICK) runs.length = 1;
  // Catalog: load 2218, open its (collapsed by default) category, check the chip; then recent and search.
  await load(PID, null);
  report.listed = await evaluate(`(async () => {
    const out = { currentProblemId, idType: typeof currentProblemId, input: document.getElementById('arrInput').value, k: document.getElementById('param-k')?.value, approach: document.getElementById('param-approach')?.value };
    out.groups = [...document.querySelectorAll('#catalog .prob-chip[data-id="${PID}"]')].map((c) => c.closest('[data-group-key]')?.dataset.groupKey);
    const before = [...document.querySelectorAll('#catalog [data-group-key="dp"] .prob-chip[data-id="${PID}"]')].some((c) => c.offsetParent !== null);
    openCatalogGroupExclusively('dp'); markActiveChip(); await new Promise((r) => setTimeout(r, 400));
    const chip = [...document.querySelectorAll('#catalog [data-group-key="dp"] .prob-chip[data-id="${PID}"]')].find((c) => c.offsetParent !== null) || document.querySelector('#catalog [data-group-key="dp"] .prob-chip[data-id="${PID}"]');
    out.dp = { visibleBeforeOpen: before, found: Boolean(chip), visible: Boolean(chip && chip.offsetParent !== null), active: Boolean(chip && chip.classList.contains('active')),
      unavailable: Boolean(chip && (chip.classList.contains('unavailable') || chip.disabled || chip.getAttribute('aria-disabled') === 'true')), cls: chip ? chip.className : null };
    const recent = document.querySelector('#recentItems .prob-chip[data-id="${PID}"]');
    out.recentChip = Boolean(recent); out.recentActive = Boolean(recent && recent.classList.contains('active'));
    const kw = document.getElementById('problemKeyword'); kw.value = '${PID}'; kw.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const found = document.querySelector('#problemSearchItems .prob-chip[data-id="${PID}"]');
    out.searchChip = Boolean(found); out.searchActive = Boolean(found && found.classList.contains('active'));
    kw.value = ''; kw.dispatchEvent(new Event('input', { bubbles: true }));
    return out; })()`);
  // A preset button sets the input box and k, and reruns.
  await evaluate(`document.querySelector('[data-lc2218-case="2"]').click()`);
  await sleep(1800);
  report.presetButton = await evaluate(`({ input: document.getElementById('arrInput').value, k: document.getElementById('param-k').value, answer: steps.at(-1).maxCoins2218View.answer, steps: steps.length })`);
  for (const theme of ['dark', 'light']) {
    for (const approach of [1, 2]) {
      for (const [name, input, k] of runs) {
        await load(PID, input, { k, approach });
        report.runs[`a${approach}-${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
          const out = { fxMissing: 0, fxHidden: 0, fxOverflow: 0, fxClipped: 0, fxOverlap: 0, fxNowMissing: 0, fxGeneralBad: 0, fxMaxH: 0, steps: steps.length, approach: null, answer: null, lines: '', mismatches: [], emptyRow: 0, footCollision: 0, overlaps: 0, clipped: 0, labelOutside: 0, htmlClipped: 0, notFit: 0, minFontPx: 99, scale: 0, maxNote: 0, inViewSource: 0, codeScroll: 0, codeClipped: 0, hangBad: 0, hiddenOtherBlock: true };
          const seen = new Set();
          for (let i = 0; i < steps.length; i++) {
            stepIndex = i; renderStep();
            const want = steps[i].codeLines[0]; seen.add(want);
            const block = steps[i].codeBlock || 1;
            const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(block === 2 ? r.dataset.line2 : r.dataset.line));
            const viz = document.querySelector('.lc2218-viz');
            if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want || Number(viz.dataset.approach) !== block) out.mismatches.push([i, want, active]);
            const visibleBlocks = [...document.querySelectorAll('#codePanel .code-section')].filter((s) => s.offsetParent !== null).map((s) => s.dataset.block);
            if (visibleBlocks.length !== 1 || visibleBlocks[0] !== String(block)) out.hiddenOtherBlock = false;
            const g = ${GEOMETRY_PROBE};
            if (g.svg !== false) { if (g.tableGap > 33) out.emptyRow++; out.footCollision += g.footCollision; out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOutside += g.labelOutside; if (!g.fitsCard) out.notFit++;
              out.minFontPx = Math.min(out.minFontPx, g.minFontPx); out.scale = g.scale;
              if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
            else out.mismatches.push([i, 'no svg']);
            out.htmlClipped += ${HTML_PROBE};
            const fx = ${FORMULA_PROBE};
            if (!fx.exists) out.fxMissing++; else {
              if (!fx.visible) out.fxHidden++; if (fx.hOverflow) out.fxOverflow++; out.fxClipped += fx.segClipped; out.fxOverlap += fx.segOverlap + (fx.overSvg ? 1 : 0) + (fx.overLegend ? 1 : 0);
              const ev = steps[i].maxCoins2218View.event; if (['for-t', 'check', 'update'].includes(ev) && !fx.now) out.fxNowMissing++;
              if (!fx.general.includes(block === 1 ? 'dp[i][j] = max(dp[i][j], dp[i-1][j-t] + prefix[t])' : 'new_dp[j] = max(new_dp[j], dp[j-t] + prefix[t])')) out.fxGeneralBad++;
              out.fxMaxH = Math.max(out.fxMaxH, Math.round(fx.height)); if (ev === 'update' && !out.fxSample) out.fxSample = fx.now; }
            out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
            out.inViewSource = Math.max(out.inViewSource, /def maxValueOfCoins|for coin in pile/.test(viz ? viz.textContent : '') ? 1 : 0);
            if (i % 7 === 0 || i === steps.length - 1) { const c = ${CODE_PROBE}; if (c.vScroll || c.hScroll) out.codeScroll++; out.codeClipped += c.clipped + c.hClipped; out.hangBad += c.hangBad.length; out.wrapped = c.wrapped; }
          }
          out.approach = steps[0].maxCoins2218View.approach;
          out.answer = steps.at(-1).maxCoins2218View.answer;
          out.lines = [...seen].sort((a, b) => a - b).join(',');
          out.lineCount = seen.size;
          return out; })()`);
      }
    }
    for (const approach of [1, 2]) {
      await load(PID, runs[0][1], { k: runs[0][2], approach });
      await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
        stepIndex = Math.max(0, steps.findIndex((s) => s.maxCoins2218View.event === 'update' && s.maxCoins2218View.updated && s.maxCoins2218View.pileIndex === 2)); renderStep();`);
      await sleep(600);
      report[`code-a${approach}-${theme}`] = await evaluate(CODE_PROBE);
      // Narrow windows: more lines wrap; every continuation must start at its own indent + 4, never at column 0.
      for (const width of [1100, 1000, 520, 400]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 1800, deviceScaleFactor: 1, mobile: false });
        await sleep(600);
        report[`code-a${approach}-w${width}-${theme}`] = await evaluate(CODE_PROBE);
        report[`geometry-a${approach}-w${width}-${theme}`] = await evaluate(`(() => { const g = ${GEOMETRY_PROBE}; const fx = ${FORMULA_PROBE}; return { overlaps: g.overlaps.length, clipped: g.clipped.length, labelOutside: g.labelOutside, fitsCard: g.fitsCard, minFontPx: g.minFontPx, htmlClipped: ${HTML_PROBE},
          fx: { exists: fx.exists, visible: fx.visible, hOverflow: fx.hOverflow, segClipped: fx.segClipped, segOverlap: fx.segOverlap, overSvg: fx.overSvg, overLegend: fx.overLegend, now: fx.now, height: fx.height } }; })()`);
      }
      await send('Emulation.clearDeviceMetricsOverride');
      await sleep(600);
      report[`colors-a${approach}-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.lc2218-viz')); const c = getComputedStyle(document.querySelector('.lc2218-card')); const coin = document.querySelector('.lc2218-coin'); const take = document.querySelector('.lc2218-coin.is-take'); const neg = document.querySelector('.lc2218-cell.is-neg');
        return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, coin: coin ? getComputedStyle(coin).fill : null, take: take ? getComputedStyle(take).fill : null, negDash: neg ? getComputedStyle(neg).strokeDasharray : null }; })()`);
      const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
      fs.writeFileSync(path.join(OUT, `shot-a${approach}-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
      await evaluate(`document.documentElement.dataset.theme = '${theme}'; stepIndex = steps.length - 1; renderStep();`);
      await sleep(400);
      const fb = await evaluate(`(() => { const r = document.querySelector('.lc2218-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
      const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.8 } });
      fs.writeFileSync(path.join(OUT, `shot-final-a${approach}-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
    }
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  // Other pages: the remaining requested-visualizations problems (spot check) plus 1970 and 9025.
  report.others = {};
  for (const pid of [542, 802, 684, 9006, 1162, 2050, 9017, 1970, 9025]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { let empty = 0; for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); const tv = document.getElementById('treeView'); if (!tv.classList.contains('hidden') && !tv.innerHTML.trim()) empty++; }
      const tv = document.getElementById('treeView');
      return { steps: steps.length, emptyTree: empty, requestedViz: Boolean(tv.querySelector('.requested-viz')), lc2218: Boolean(document.querySelector('.lc2218-viz')), firstClass: tv.firstElementChild ? tv.firstElementChild.className : null, sharedLoaded: typeof renderMatrix542View === 'function', oldGone: typeof renderCoins2218View === 'undefined', maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  // Live editor (real Pyodide): the displayed 2218 code runs as-is, both approaches.
  report.live = {};
  for (const approach of [1, 2]) {
    const before = errors.length;
    await load(PID, runs[0][1], { k: runs[0][2], approach });
    report.live[`a${approach}`] = await evaluate(`(async () => { await ensureLiveEditorRuntime(); await openLiveEditor(); await runLiveCode();
      const err = document.getElementById('liveError');
      return { answer: typeof answerValue === 'undefined' ? null : answerValue, steps: steps.length, error: err && !err.classList.contains('hidden') ? err.textContent.slice(0, 300) : null, result: (document.getElementById('liveResult') || {}).textContent || null }; })()`);
    report.live[`a${approach}`].consoleErrors = errors.length - before;
    await evaluate(`typeof closeLiveEditor === 'function' && closeLiveEditor()`);
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
