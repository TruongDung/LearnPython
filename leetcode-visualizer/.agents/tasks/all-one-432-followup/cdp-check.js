'use strict';
// Throwaway headless-Chrome probe for the 432 follow-up (not part of the app or test suite).
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3999/';
const OUT = __dirname;
const CODE_PROBE = `(() => { const p = document.getElementById('codePanel'); const cs = getComputedStyle(p); const pr = p.getBoundingClientRect();
  const lines = [...p.querySelectorAll('.code-line')]; const clipped = lines.filter((l) => { const r = l.getBoundingClientRect(); return r.top < pr.top - 1 || r.bottom > pr.bottom + 1; }).length;
  return { maxHeight: cs.maxHeight, overflowX: cs.overflowX, overflowY: cs.overflowY, position: cs.position, scrollH: p.scrollHeight, clientH: p.clientHeight, vScroll: p.scrollHeight > p.clientHeight + 1, lines: lines.length, clipped }; })()`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ao432-'));
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, '--window-size=1400,1800', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9333/json')).json(); if (targets.length) break; } catch { /* retry */ }
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
  const tour = 'getMinKey | getMaxKey | inc a | inc b | inc a | inc a | getMaxKey | getMinKey | dec b | dec x | dec a | dec a | dec a | getMaxKey';
  for (const [name, input] of [['default', null], ['tour', tour]]) {
    await load(432, input);
    report[name] = await evaluate(`(() => {
      const out = { steps: steps.length, mismatches: [], inViewLists: 0, maxNote: 0, noteVisible: null, codeVisible: null };
      for (let i = 0; i < steps.length; i++) {
        stepIndex = i; renderStep();
        const want = steps[i].codeLines[0];
        const active = [...document.querySelectorAll('#codePanel .code-line.active')].map((r) => Number(r.dataset.line));
        const viz = document.querySelector('.ao432-viz');
        if (active.length !== 1 || active[0] !== want || !viz || Number(viz.dataset.sourceLine) !== want) out.mismatches.push([i, want, active]);
        out.inViewLists = Math.max(out.inViewLists, document.querySelectorAll('.ao432-viz .ao432-lines').length);
        const note = document.getElementById('stepNote');
        out.maxNote = Math.max(out.maxNote, note.textContent.length);
        out.noteVisible = getComputedStyle(note).display !== 'none';
        out.codeVisible = getComputedStyle(document.getElementById('codePanel')).display !== 'none';
      }
      return out;
    })()`);
  }
  for (const theme of ['dark', 'light']) {
    await evaluate(`document.documentElement.dataset.theme = '${theme}'; if (typeof setCodeSnippetBlurred === 'function') setCodeSnippetBlurred(false); stepIndex = 120; renderStep();`);
    await sleep(600);
    const box = await evaluate(`(() => { const r = document.getElementById('vizPanel').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 2400) }; })()`);
    report[`code-${theme}`] = await evaluate(CODE_PROBE);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 0.6 } });
    fs.writeFileSync(path.join(OUT, `shot-${theme}.png`), Buffer.from(shot.result.data, 'base64'));
  }
  report.others = {};
  for (const pid of [146, 410, 514, 707]) {
    const before = errors.length;
    await load(pid, null);
    report.others[pid] = await evaluate(`(() => { let bad = 0; for (let i = 0; i < steps.length; i++) { stepIndex = i; renderStep(); } return { steps: steps.length, ao432: Boolean(document.querySelector('.ao432-viz')), noteVisible: getComputedStyle(document.getElementById('stepNote')).display !== 'none' }; })()`);
    report.others[pid].code = await evaluate(CODE_PROBE);
    report.others[pid].errors = errors.length - before;
  }
  report.errors = errors;
  console.log(JSON.stringify(report, null, 2));
  ws.close();
  chrome.kill();
}

main().catch((error) => { console.error(error); process.exit(1); });
