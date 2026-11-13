'use strict';
// Throwaway headless-Chrome probe for the new 2406 page (not part of the app or test suite).
// Usage: start `PORT=4406 node server.js`, then `BASE=http://localhost:4406/ node .agents/tasks/min-groups-2406/cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:4406/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')].filter((l) => l.offsetParent !== null); const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, visibleLines: lines.length, clipped }; })()`;
// Real bounding boxes: bars and labels must not overlap; everything stays inside the viewBox;
// heap slots and their "min" tag must not overlap each other or leave the heap card.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.mg2406-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [], htmlOverlaps: [], htmlClipped: [] };
  const box = (el, name) => { const b = el.getBBox(); return { name, x: b.x, y: b.y, w: b.width, h: b.height }; };
  const hit = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;
  const items = [...svg.querySelectorAll('rect.mg2406-bar, text')].map((el) => box(el, el.getAttribute('class') + ':' + (el.textContent || el.dataset.interval || el.dataset.current)));
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (hit(items[i], items[j])) out.overlaps.push([items[i].name, items[j].name]);
  // Line marks (sweep, ends[0]) widened by their computed stroke: must stay apart from each other and from text.
  const marks = [...svg.querySelectorAll('line.mg2406-sweep, line.mg2406-endmark')].map((el) => { const b = el.getBBox(); const sw = parseFloat(getComputedStyle(el).strokeWidth) || 1;
    const cap = getComputedStyle(el).strokeLinecap === 'round' ? sw / 2 : 0; return { name: el.getAttribute('class'), x: b.x - sw / 2 - 1, y: b.y - cap, w: b.width + sw + 2, h: b.height + cap * 2 }; });
  const texts = [...svg.querySelectorAll('text')].map((el) => box(el, 'text:' + el.textContent));
  for (let i = 0; i < marks.length; i++) { for (const t of texts) if (hit(marks[i], t)) out.overlaps.push([marks[i].name, t.name]);
    for (let j = i + 1; j < marks.length; j++) if (hit(marks[i], marks[j])) out.overlaps.push([marks[i].name, marks[j].name]); }
  out.endmarks = marks.filter((m) => m.name.includes('endmark')).length;
  [...svg.querySelectorAll('rect, line, text')].forEach((el) => { const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 70)); });
  const rect = (el, name) => { const r = el.getBoundingClientRect(); return { name, x: r.left, y: r.top, w: r.width, h: r.height }; };
  const html = [...document.querySelectorAll('.mg2406-heap .mg2406-slot, .mg2406-heap .mg2406-slot i, .mg2406-heap .mg2406-out, .mg2406-chip')].map((el) => rect(el, el.className || el.tagName));
  for (let i = 0; i < html.length; i++) for (let j = i + 1; j < html.length; j++) {
    const a = html[i]; const b = html[j]; const nested = document.querySelectorAll('.mg2406-slot i').length && (a.name === 'I' || b.name === 'I');
    if (hit(a, b) && !nested) out.htmlOverlaps.push([a.name, b.name]);
  }
  const card = document.querySelector('.mg2406-heap-card').getBoundingClientRect();
  [...document.querySelectorAll('.mg2406-heap .mg2406-slot, .mg2406-heap .mg2406-slot i')].forEach((el) => { const r = el.getBoundingClientRect();
    if (r.top < card.top - 0.5 || r.bottom > card.bottom + 0.5 || r.left < card.left - 0.5 || r.right > card.right + 0.5) out.htmlClipped.push(el.className || el.tagName); });
  // A "min" tag must not sit on a neighbouring slot.
  const tags = [...document.querySelectorAll('.mg2406-slot i')].map((el) => rect(el, 'min'));
  const slots = [...document.querySelectorAll('.mg2406-heap .mg2406-slot')].map((el) => rect(el, 'slot'));
  for (const t of tags) for (const s of slots) if (hit(t, s)) out.htmlOverlaps.push(['min', 'slot']);
  const r = svg.getBoundingClientRect(); const pc = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= pc.width + 1; return out; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mg2406-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9406', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9406/json')).json(); if (targets.length) break; } catch { /* retry */ }
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
  const presets = [['default', null], ['short', '[[5,10],[6,8],[1,5],[2,3],[1,10]]'], ['touch', '[[1,2],[2,3],[3,4]]'], ['none', '[[1,3],[5,6],[8,10],[11,13]]'], ['wide', '[[1,40],[2,3],[999,999]]'.replace('[999,999]', '[39,40]')], ['ten', JSON.stringify(Array.from({ length: 10 }, (_, i) => [999961 + i, 1000000]))]];
  report.listed = await evaluate(`(() => { const t = document.body.innerText; return { has2406: /2406/.test(t) }; })()`);
  for (const theme of ['dark', 'light']) {
    for (const [name, input] of presets) {
      await load(2406, input);
      report.runs[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, answer: null, lines: '', mismatches: [], overlaps: 0, clipped: 0, htmlOverlaps: 0, htmlClipped: 0, notFit: 0, maxNote: 0, inViewSource: 0, codeScroll: 0 };
        const seen = new Set();
        for (let i = 0; i < steps.length; i++) {
          stepIndex = i; renderStep();
          const want = steps[i].codeLines[0]; seen.add(want);
          const active = [...document.querySelectorAll('#codePanel .code-line.active')].filter((r) => r.offsetParent !== null).map((r) => Number(r.dataset.line));
          const viz = document.querySelector('.mg2406-viz');
          if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
          const g = ${GEOMETRY_PROBE};
          if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; out.htmlOverlaps += g.htmlOverlaps.length; out.htmlClipped += g.htmlClipped.length; if (!g.fitsCard) out.notFit++;
            if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; if (g.htmlOverlaps.length && !out.firstHtml) out.firstHtml = [i, g.htmlOverlaps[0]]; if (g.htmlClipped.length && !out.firstHtmlClip) out.firstHtmlClip = [i, g.htmlClipped[0]]; }
          out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
          out.inViewSource = Math.max(out.inViewSource, /def minGroups|heappush\\(ends/.test(viz ? viz.textContent : '') ? 1 : 0);
          const p = document.getElementById('codePanel'); if (p.scrollHeight > p.clientHeight + 1) out.codeScroll++;
        }
        out.answer = steps.at(-1).minGroups2406View.groups;
        out.lines = [...seen].sort((a, b) => a - b).join(',');
        out.varsVisible = Boolean(document.querySelector('#varsPanel, .vars-panel, #vars')) ;
        return out; })()`);
    }
    // Screenshot a mid-run frame (ends[0] compared and still overlapping) and the final frame.
    await load(2406, null);
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false);
      stepIndex = Math.max(0, steps.findIndex((s) => s.minGroups2406View.event === 'check' && s.minGroups2406View.condition === true && s.minGroups2406View.heap.length >= 4)); renderStep();`);
    await sleep(600);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    report[`colors-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.mg2406-viz')); const c = getComputedStyle(document.querySelector('.mg2406-card')); const lab = getComputedStyle(document.querySelector('.mg2406-lane-label')); return { bg: v.backgroundColor, text: v.color, card: c.backgroundColor, laneLabel: lab.fill }; })()`);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
    await evaluate(`stepIndex = steps.length - 1; renderStep();`);
    await sleep(400);
    const fb = await evaluate(`(() => { const r = document.querySelector('.mg2406-viz').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
    const fs2 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...fb, scale: 0.7 } });
    fs.writeFileSync(path.join(OUT, `shot-final-${theme}.png`), Buffer.from(fs2.result.data, 'base64'));
  }
  await evaluate(`document.documentElement.dataset.theme = 'dark'`);
  report.others = {};
  for (const pid of [416, 426, 432, 146, 410, 514, 707, 2402, 1851]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, mg2406: Boolean(document.querySelector('.mg2406-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  fs.writeFileSync(path.join(OUT, 'cdp-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
