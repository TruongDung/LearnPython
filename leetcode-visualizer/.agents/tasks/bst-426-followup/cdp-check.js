'use strict';
// Throwaway headless-Chrome probe for the 426 redesign (not part of the app or test suite).
// Usage: start `PORT=3999 node server.js`, then `node .agents/tasks/bst-426-followup/cdp-check.js`.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3999/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')]; const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  return { maxHeight: cs.maxHeight, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, lines: lines.length, clipped }; })()`;
// Overlap/clipping probe for the 426 SVG: node shapes and tag labels must not overlap each other,
// and every element must sit inside the viewBox.
const GEOMETRY_PROBE = `(() => {
  const svg = document.querySelector('.dl426-svg'); if (!svg) return { svg: false };
  const vb = svg.viewBox.baseVal; const out = { overlaps: [], clipped: [] };
  const shapes = [...svg.querySelectorAll('.dl426-tnode circle, .dl426-lnode rect, .dl426-null circle, .dl426-tags')].map((el) => {
    const b = el.getBBox(); return { name: (el.closest('[data-tree-node],[data-list-node],[data-null-slot]') || el).outerHTML.slice(0, 40) + el.tagName, x: b.x, y: b.y, w: b.width, h: b.height };
  });
  for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) {
    const a = shapes[i], b = shapes[j];
    if (a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5) out.overlaps.push([a.name, b.name]);
  }
  [...svg.querySelectorAll('circle, rect, path, line, text')].forEach((el) => { if (el.closest('marker')) return; const b = el.getBBox();
    if (b.x < vb.x - 0.5 || b.y < vb.y - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y + b.height > vb.y + vb.height + 0.5) out.clipped.push(el.outerHTML.slice(0, 60)); });
  const r = svg.getBoundingClientRect(); const card = svg.parentElement.getBoundingClientRect();
  out.fitsCard = r.width <= card.width + 1; return out; })()`;
// Arrow probe: sample every rendered pointer path with getPointAtLength and report the largest share of one
// arrow's points within 2px of another arrow (two arrows drawn on top of each other give ~1).
const ARROW_PROBE = `(() => {
  const paths = [...document.querySelectorAll('.dl426-svg path.dl426-ptr')].map((el) => {
    const len = el.getTotalLength(); const n = Math.max(2, Math.ceil(len));
    const pts = []; for (let k = 0; k <= n; k++) { const p = el.getPointAtLength(len * k / n); pts.push([p.x, p.y]); }
    return { name: el.dataset.ptrFrom + '.' + el.dataset.ptrField, close: el.classList.contains('is-close'), pts };
  });
  let worst = { share: 0 };
  for (const a of paths) for (const b of paths) { if (a === b) continue;
    const near = a.pts.filter(([x, y]) => b.pts.some(([u, v]) => Math.hypot(x - u, y - v) <= 2)).length / a.pts.length;
    if (near > worst.share) worst = { share: near, a: a.name, b: b.name }; }
  return { arrows: paths.length, closing: paths.filter((p) => p.close).length, worst };
})()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dl426-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9334', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9334/json')).json(); if (targets.length) break; } catch { /* retry */ }
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
  const report = {};
  for (const [name, input] of [['default', null], ['short', '4,2,5,1,3'], ['single', '1'], ['empty', 'null']]) {
    await load(426, input);
    report[name] = await evaluate(`(() => {
      const out = { steps: steps.length, lines: [], mismatches: [], overlaps: 0, clipped: 0, notFit: 0, maxNote: 0, inViewSource: 0 };
      const probe = () => ${GEOMETRY_PROBE};
      const seen = new Set();
      for (let i = 0; i < steps.length; i++) {
        stepIndex = i; renderStep();
        const want = steps[i].codeLines[0]; seen.add(want);
        const active = [...document.querySelectorAll('#codePanel .code-line.active')].map((r) => Number(r.dataset.line));
        const viz = document.querySelector('.dl426-viz');
        if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
        const g = probe();
        if (g.svg !== false) { out.overlaps += g.overlaps.length; out.clipped += g.clipped.length; if (!g.fitsCard) out.notFit++; if (g.overlaps.length && !out.firstOverlap) out.firstOverlap = [i, g.overlaps[0]]; if (g.clipped.length && !out.firstClip) out.firstClip = [i, g.clipped[0]]; }
        out.maxNote = Math.max(out.maxNote, document.getElementById('stepNote').textContent.length);
        out.inViewSource = Math.max(out.inViewSource, /def inorder/.test(viz ? viz.textContent : '') ? 1 : 0);
      }
      out.lines = [...seen].sort((a, b) => a - b).join(',');
      return out;
    })()`);
  }
  report.arrows = {};
  for (const [name, input] of [['two', '2,1'], ['default', null]]) {
    await load(426, input);
    for (const theme of ['dark', 'light']) {
      report.arrows[`${name}-${theme}`] = await evaluate(`(() => { document.documentElement.dataset.theme = '${theme}';
        const out = { steps: steps.length, maxShare: 0, worstAt: null, finalArrows: 0, finalClosing: 0, chips: 0, varsNames: '' };
        for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); const a = ${ARROW_PROBE};
          if (a.worst.share > out.maxShare) { out.maxShare = a.worst.share; out.worstAt = [i, a.worst.a, a.worst.b]; }
          if (document.querySelector('.dl426-locals, .dl426-viz [class^="chip-"]')) out.chips++;
          if (i === steps.length - 1) { out.finalArrows = a.arrows; out.finalClosing = a.closing; } }
        out.varsNames = steps.at(-1).vars.map((v) => v.name).join(',');
        const vp = document.getElementById('varsPanel');
        out.varsPanelVisible = Boolean(vp && !vp.classList.contains('hidden'));
        out.varsPanelText = document.getElementById('varsGrid').textContent.replace(/\\s+/g, ' ').slice(0, 80);
        return out; })()`);
      if (name === 'two') {
        await sleep(300);
        report.arrows[`${name}-${theme}`].diag = await evaluate(`({ idx: stepIndex, n: steps.length, viz: Boolean(document.querySelector('.dl426-viz')), card: Boolean(document.querySelector('.dl426-picture-card')), input: document.getElementById('arrInput').value, tv: document.getElementById('treeView').className })`);
        if (!report.arrows[`${name}-${theme}`].diag.card) { console.log(JSON.stringify(report.arrows, null, 1)); }
        const box = await evaluate(`(() => { const r = document.querySelector('.dl426-picture-card').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
        const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.9 } });
        fs.writeFileSync(path.join(OUT, `shot-two-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
      }
    }
  }
  await load(426, null);
  for (const theme of ['dark', 'light']) {
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false); stepIndex = steps.findIndex((s) => s.codeLines[0] === 16 && s.bstDll426View.visited.length >= 5); renderStep();`);
    await sleep(600);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    report[`contrast-${theme}`] = await evaluate(`(() => { const v = getComputedStyle(document.querySelector('.dl426-viz')); return { bg: v.backgroundColor, text: v.color }; })()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
  }
  await evaluate(`stepIndex = steps.length - 1; renderStep();`);
  await sleep(400);
  const finalBox = await evaluate(`(() => { const r = document.querySelector('.dl426-picture-card').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
  const finalShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...finalBox, scale: 0.8 } });
  fs.writeFileSync(path.join(OUT, 'shot-final-light.png'), Buffer.from(finalShot.result.data, 'base64'));

  report.others = {};
  const others = [98, 99, 108, 109, 173, 230, 235, 270, 272, 285, 450, 501, 510, 530, 538, 653, 700, 783, 938, 1382, 146, 410, 514, 707, 432];
  for (const pid of others) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, dl426: Boolean(document.querySelector('.dl426-viz')), maxHeight: getComputedStyle(document.getElementById('codePanel')).maxHeight }; })()`);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
