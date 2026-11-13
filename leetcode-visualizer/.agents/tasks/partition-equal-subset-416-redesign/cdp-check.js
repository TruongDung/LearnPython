'use strict';
// Throwaway headless-Chrome probe for the 416 redesign (not part of the app or test suite).
// Usage: start `PORT=4416 node server.js`, then `BASE=http://localhost:4416/ node .agents/tasks/partition-equal-subset-416-redesign/cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4416/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped }; })()`;
// Geometry probe for the 416 SVG: shapes (cells, call circles, stubs) and free labels must not overlap each other,
// labels must not sit on an arrow, arrows must not lie on each other, and everything stays inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.pe416-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], labelOnArrow: [], arrowShare: 0 };
  const box = (el, name) => { const b = el.getBBox(); return { name, x: b.x, y: b.y, w: b.width, h: b.height }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const shapes = [...svg.querySelectorAll('.pe416-cell rect, .pe416-call circle, .pe416-stub circle')].map((el) => box(el, (el.parentElement.getAttribute('class') || '') + ' ' + (el.parentElement.dataset.sum ?? el.parentElement.dataset.call ?? el.parentElement.dataset.stub ?? '')));
  const labels = [...svg.querySelectorAll('text')].filter((t) => !t.closest('marker') && (!t.parentElement.matches('.pe416-cell, .pe416-call, .pe416-stub') || t.classList.contains('pe416-call-result'))).map((t) => box(t, 'text:' + t.textContent));
  const items = [...shapes, ...labels];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (hit(items[i], items[j])) out.overlaps.push([items[i].name, items[j].name]);
  [...svg.querySelectorAll('rect, circle, path, text')].forEach((el) => { if (el.closest('marker') || el.closest('defs')) return; const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const arrows = [...svg.querySelectorAll('path.pe416-arrow, path.pe416-edge')].map((el) => { const len = el.getTotalLength(); const n = Math.max(2, Math.ceil(len)); const pts = [];
    for (let k = 0; k <= n; k++) { const p = el.getPointAtLength(len * k / n); pts.push([p.x, p.y]); } return { name: el.getAttribute('class'), pts }; });
  for (const a of arrows) for (const b of arrows) { if (a === b) continue; const near = a.pts.filter(([x, y]) => b.pts.some(([u, v]) => Math.hypot(x - u, y - v) <= 2)).length / a.pts.length; out.arrowShare = Math.max(out.arrowShare, near); }
  for (const l of [...labels, ...shapes]) for (const a of arrows) { const inside = a.pts.slice(3, -3).filter(([x, y]) => x > l.x + 1 && x < l.x + l.w - 1 && y > l.y + 1 && y < l.y + l.h - 1).length; if (inside) out.labelOnArrow.push([l.name, a.name]); }
  const r = svg.getBoundingClientRect(); const card = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= card.width + 1; out.arrows = arrows.length; return out; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pe416-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9416', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9416/json')).json(); if (targets.length) break; } catch { /* retry */ }
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
    if (approach) await evaluate(`(() => { const s = document.querySelector('#extraParams [data-param="approach"]'); s.value = '${approach}'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    if (input) await evaluate(`document.getElementById('arrInput').value = ${JSON.stringify(input)}`);
    await evaluate(`document.getElementById('runBtn').click()`);
    await sleep(1500);
  };
  const report = { approaches: {} };
  const presets = [['default', null], ['short', '1,5,11,5'], ['no', '1,2,5'], ['odd', '1,2,3,5']];
  for (const approach of [1, 2, 3]) {
    for (const theme of ['dark', 'light']) {
      for (const [name, input] of presets) {
        await load(416, input, approach);
        const key = `m${approach}-${name}-${theme}`;
        report.approaches[key] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
          const out = { steps: steps.length, lines: '', mismatches: [], overlaps: 0, clipped: 0, labelOnArrow: 0, maxArrowShare: 0, notFit: 0, maxNote: 0, inViewSource: 0, codeScroll: 0 };
          const block = ${approach}; const attr = block > 1 ? 'line' + block : 'line';
          const seen = new Set();
          for (let i = 0; i < steps.length; i++) {
            stepIndex = i; renderStep();
            const want = steps[i].codeLines[0]; seen.add(want);
            const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset[attr]));
            const viz = document.querySelector('.pe416-viz');
            if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want || Number(viz.dataset.method) !== block) out.mismatches.push([i, want, active]);
            const g = ${GEOMETRY_PROBE};
            if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.labelOnArrow += g.labelOnArrow.length; out.maxArrowShare = Math.max(out.maxArrowShare, g.arrowShare); if (!g.fitsCard) out.notFit++;
              if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; if (g.labelOnArrow.length && !out.firstLabel) out.firstLabel = [i, g.labelOnArrow[0]]; }
            out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
            out.inViewSource = Math.max(out.inViewSource, /canPartition|range\\(target/.test(viz ? viz.textContent : '') ? 1 : 0);
            const p = document.getElementById('codePanel'); if (p.scrollHeight > p.clientHeight + 1) out.codeScroll++;
          }
          out.lines = [...seen].sort((a, b) => a - b).join(',');
          out.noteVisible = getComputedStyle(document.getElementById('stepNote')).display !== 'none';
          return out; })()`);
      }
      // Screenshot a mid-run frame of the default example.
      await load(416, null, approach);
      await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
        stepIndex = (() => { const i = steps.findIndex((s) => ${approach === 1 ? "s.equalSubset416View.event === 'update' && s.equalSubset416View.itemIndex === 4 && s.equalSubset416View.transition.changed" : approach === 2 ? "s.equalSubset416BitsetView.phase === 'shift-or' && s.equalSubset416BitsetView.activeIndex === 2" : "s.equalSubset416DfsView.event === 'skip' && s.equalSubset416DfsView.stack.length >= 4"}); return i < 0 ? 10 : i; })(); renderStep();`);
      await sleep(600);
      report[`code-m${approach}-${theme}`] = await evaluate(CODE_PROBE);
      report[`colors-m${approach}-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.pe416-viz')); const c = getComputedStyle(document.querySelector('.pe416-card')); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor }; })()`);
      const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
      fs.writeFileSync(path.join(OUT, `shot-m${approach}-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
      if (theme === 'light') {
        await evaluate(`stepIndex = steps.length - 1; renderStep();`);
        await sleep(400);
        const fb = await evaluate(`(() => { const r = document.querySelector('.pe416-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
        const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.7 } });
        fs.writeFileSync(path.join(OUT, `shot-m${approach}-final-light.png`), Buffer.from(fs2.result.data, 'base64'));
      }
    }
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [698, 2416, 1416, 432, 426, 146, 410, 514, 707]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, pe416: Boolean(document.querySelector('.pe416-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
