'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawn, spawnSync } = require('node:child_process');
const p = require('../problems').SUPPORTED[2911];
const BUILDERS = [[1, p.builder], [2, p.builder2]];

// Independent oracle: compare each remainder string against its reversal,
// then exhaustively enumerate legal partitions (no partition DP).
function substringCost(s) {
  return Math.min(...Array.from({ length: s.length - 1 }, (_, i) => i + 1)
    .filter(d => s.length % d === 0).map(d => {
      let mismatch = 0;
      for (let r = 0; r < d; r++) {
        const group = [...s].filter((_, i) => i % d === r);
        mismatch += group.filter((ch, i) => ch !== group[group.length - 1 - i]).length / 2;
      }
      return mismatch;
    }));
}
function oracle(s, k) {
  if (k === 1) return substringCost(s);
  let best = Infinity;
  for (let end = 2; end <= s.length - 2 * (k - 1); end++) {
    best = Math.min(best, substringCost(s.slice(0, end)) + oracle(s.slice(end), k - 1));
  }
  return best;
}
const EXAMPLES = [['abcac', 2, 1], ['abcdef', 2, 2], ['aabbaa', 3, 0], ['abcabc', 1, 0]];

test('2911 official examples, registration, live arguments and reconstruction', () => {
  assert.equal(p.slug, 'minimum-changes-to-make-k-semi-palindromes');
  assert.equal(p.difficulty, 'hard');
  assert.equal(p.debugMode, 'line-by-line');
  assert.equal(p.extraParams.find(param => param.key === 'approach').options.length, 2);
  assert.deepEqual(p.liveArgs({ s: 'abcac', k: 2 }), ['abcac', 2]);
  for (const [approach, build] of BUILDERS) for (const [s, k, answer] of EXAMPLES) {
    const run = build(s, { k });
    assert.equal(run.answer, answer);
    assert.equal(run.selected.length, k);
    assert.equal(run.selected.map(segment => segment.original).join(''), s);
    assert.equal(run.selected.reduce((sum, segment) => sum + segment.cost, 0), answer);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    assert.equal(run.steps.at(-1).semi2911View.answer, answer);
    assert.ok(run.steps.every(step => step.codeBlock === approach));
    for (const segment of run.selected) {
      assert.ok(segment.original.length >= 2);
      assert.ok(segment.d < segment.original.length && segment.original.length % segment.d === 0);
      assert.equal([...segment.original].filter((ch, i) => ch !== segment.repaired[i]).length, segment.cost);
      for (const group of segment.groups) {
        const letters = group.indices.map(i => segment.repaired[i - segment.start]);
        assert.deepEqual(letters, [...letters].reverse());
      }
    }
  }
  const semi = p.builder('abcabc', { k: 1 }).selected[0];
  assert.equal(semi.d, 3, 'must discover a non-palindromic semi-palindrome');
});

test('2911 agrees with exhaustive partitions on random small strings', () => {
  let seed = 2911;
  const next = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % max; };
  for (let sample = 0; sample < 180; sample++) {
    const n = 2 + next(9), k = 1 + next(Math.floor(n / 2));
    const s = Array.from({ length: n }, () => 'abcd'[next(4)]).join('');
    for (const [, build] of BUILDERS) {
    const run = build(s, { k });
    assert.equal(run.answer, oracle(s, k), `${s}, k=${k}`);
    for (const step of run.steps) {
      const f = step.semi2911View.focus;
      if (f) assert.equal(f.cost, f.groups.reduce((total, group) => total + group.pairs.filter(pair => pair.mismatch).length, 0));
      assert.ok(step.codeLines.every(line => line >= 1 && line <= (step.codeBlock === 2 ? p.code2 : p.code).length));
    }
    }
  }
});

test('2911 validates constraints, handles official maximum and bounds trace size', () => {
  for (const [s, k] of [['a',1], ['abc',2], ['ABC',1], ['ab',0], ['ab',1.5], ['a'.repeat(201),1], ['{}',1]]) {
    assert.throws(() => p.builder(s, { k }), /2911:/);
  }
  assert.equal(p.builder('a'.repeat(200), { k: 100 }).answer, 0);
  const large = p.builder('abcdefghijklmnopqrstuvwxyz'.repeat(7), { k: 10 });
  assert.equal(large.steps.length, 5);
  assert.equal(large.selected.length, 10);
  for (const [,build] of BUILDERS) {
    const condensed = build('abcdefghijklmnop', { k: 8 });
    assert.equal(condensed.steps.length, 5);
    assert.equal(condensed.steps.at(-1).final, true);
    const full = build('abcdefghijkl', { k: 6 });
    assert.ok(full.steps.length < 20000);
    assert.equal(full.steps.at(-1).semi2911View.omitted, false);
  }
});

function renderer(language) {
  const handlers = {};
  const host = {
    innerHTML: '',
    querySelectorAll(selector) {
      const attr = { '[data-divisor]': 'divisor', '[data-segment]': 'segment', '[data-example]': 'example', '[data-jump]': 'jump' }[selector];
      if (!attr) return [];
      return [...this.innerHTML.matchAll(new RegExp(`data-${attr}="([^"]+)"`, 'g'))].map(match => ({
        dataset: { [attr]: match[1] },
        addEventListener(type, fn) { handlers[`${attr}:${match[1]}`] = fn; },
      }));
    },
  };
  const context = { lang: language, document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-semi-palindromes-2911.js'), 'utf8'), context);
  context.renderStep = () => context.renderSemi2911View(context.steps[context.stepIndex]);
  return { host, handlers, context, render: (step, allSteps, index = 0) => {
    if (allSteps) { context.steps = allSteps; context.stepIndex = index; }
    context.renderSemi2911View(step); return host.innerHTML;
  } };
}

test('2911 renders every phase in both languages; divisor and segment clicks update the picture', () => {
  for (const lang of ['vi', 'en']) {
    const ui = renderer(lang);
    for (const [,build] of BUILDERS) for (const [s, k] of EXAMPLES) {
      for (const step of build(s, { k }).steps) {
        const html = ui.render(step);
        assert.match(html, /s2911-debug/);
        assert.match(html, new RegExp(`L${step.codeLines[0]}`));
        if (step.semi2911View.focus && step.semi2911View.focus.valid !== false) {
          assert.match(html, /s2911-lanes/);
          assert.match(html, /s2911-repair/);
        }
        if (step.semi2911View.operation === 'cache-hit') assert.match(html, /class="hit"/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|\[object Object\]/);
      }
    }
    ui.render(p.builder('abcabc', { k: 1 }).steps.at(-1));
    ui.handlers['divisor:3']();
    assert.match(ui.host.innerHTML, /data-divisor="3" aria-pressed="true"/);
    assert.equal((ui.host.innerHTML.match(/class="s2911-lane"/g) || []).length, 3);
    assert.doesNotMatch(ui.host.innerHTML, /class="mismatch"/);
    ui.handlers['divisor:1']();
    assert.match(ui.host.innerHTML, /class="mismatch"/);
    ui.render(p.builder('abcac', { k: 2 }).steps.at(-1));
    ui.handlers['segment:1']();
    assert.match(ui.host.innerHTML, /data-segment="1" aria-pressed="true"/);
    assert.match(ui.host.innerHTML, /“cac”/);
    assert.doesNotMatch(ui.host.innerHTML, /class="mismatch"/);
  }
});

test('2911 displayed Python agrees with the independent oracle', () => {
  const local = path.join(__dirname, '../../.venv/Scripts/python.exe');
  const python = fs.existsSync(local) ? local : 'python';
  const cases = [...EXAMPLES.map(([s,k]) => [s,k]), ['abcbacab', 3], ['abbaac',2], ['aa',1]];
  for (const code of [p.code,p.code2]) {
  const run = spawnSync(python, ['-c', `${code.join('\n')}\nimport json\nprint(json.dumps([Solution().minimumChanges(*args) for args in ${JSON.stringify(cases)}]))`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(JSON.parse(run.stdout), cases.map(([s,k]) => oracle(s,k)));
  }
});

test('2911 line debug: every executable line, both branches, pointer movement and exact table mutations', () => {
  for (const [approach, build] of BUILDERS) {
    const run = build('abcac', { k: 2 });
    const code = approach === 2 ? p.code2 : p.code;
    assert.deepEqual([...new Set(run.steps.map(step => step.codeLines[0]))].sort((a,b)=>a-b), code.map((_,i)=>i+1));
    const whileChecks = run.steps.filter(step => step.codeLines[0] === 13).map(step => step.semi2911View.condition);
    assert.ok(whileChecks.includes(true) && whileChecks.includes(false));
    for (let i = 1; i < run.steps.length; i++) {
      const step = run.steps[i], v = step.semi2911View, before = run.steps[i-1].semi2911View;
      if (JSON.stringify(v.costTable) !== JSON.stringify(before.costTable)) assert.ok([4,16].includes(v.line));
      if (JSON.stringify(v.table) !== JSON.stringify(before.table)) assert.ok([17,18,22].includes(v.line));
      if (v.line === 14) {
        const c = v.comparison;
        assert.equal(c.after, c.before + Number(v.s[c.a] !== v.s[c.b]));
        assert.equal(v.focus.cost, c.after);
        assert.equal(v.focus.complete, false);
      }
      if (v.line === 15) {
        const prevVars = Object.fromEntries(run.steps[i-1].vars.map(entry=>[entry.name,entry.value]));
        const now = Object.fromEntries(step.vars.map(entry=>[entry.name,entry.value]));
        assert.equal(now.a, prevVars.a + now.d);
        assert.equal(now.b, prevVars.b - now.d);
      }
      if (v.phase === 'cost' && v.focus?.complete === false) {
        const counts = v.focus.groups.reduce((sum,group)=>sum+group.pairs.length,0);
        assert.ok(counts <= Math.floor((v.focus.end-v.focus.start)/2));
      }
    }
    assert.ok(run.steps.some(step => step.semi2911View.line === 9 && step.semi2911View.condition === true));
    assert.ok(run.steps.filter(step=>step.semi2911View.phase==='partition').every(step => {
      const v = step.semi2911View;
      return v.best === Math.min(v.before, v.previous + v.gain);
    }));
  }
});

test('2911 DFS caches completed calls only; hits reuse a stored result without pushing another frame', () => {
  const run = p.builder2('abcac', { k: 2 });
  const returned = new Set();
  let memoSize = 0, hits = 0;
  for (let i=0;i<run.steps.length;i++) {
    const v = run.steps[i].semi2911View;
    if (v.operation === 'return-call') {
      assert.ok(!returned.has(v.cacheKey), `computed twice: ${v.cacheKey}`);
      returned.add(v.cacheKey);
      assert.equal(v.cacheSize,memoSize+1);
      memoSize++;
    } else assert.equal(v.cacheSize,memoSize);
    if (v.operation === 'cache-hit') {
      hits++;
      assert.ok(returned.has(v.cacheKey));
      assert.equal(v.childValue,v.memo.find(entry=>entry.key===v.cacheKey).value);
      assert.equal(v.stack.length,run.steps[i-1].semi2911View.stack.length);
    }
    assert.equal(v.hits,hits);
  }
  assert.ok(hits > 0);
  assert.equal(run.steps.at(-1).semi2911View.stack.length,0);
  const firstCompare = run.steps.find(step=>step.codeLines[0]===14);
  assert.equal(firstCompare.semi2911View.memo.length,0,'old snapshots never receive future cache entries');
});

test('2911 jump controls navigate the real trace and preserve the recorded pointer state', () => {
  for (const [approach,build] of BUILDERS) {
    const run = build('abcac',{k:2}), ui = renderer('vi');
    ui.render(run.steps[0],run.steps);
    ui.handlers['jump:pair']();
    const compared = ui.context.stepIndex;
    assert.equal(run.steps[compared].codeLines[0],14);
    assert.match(ui.host.innerHTML,/class="mismatch pointer"/);
    ui.render(run.steps[compared-1],run.steps,compared-1);
    assert.doesNotMatch(ui.host.innerHTML,/class="mismatch pointer"/);
    assert.match(ui.host.innerHTML,/Comparisons pending|Chưa so sánh hết/);
    ui.handlers['jump:state']();
    const state = run.steps[ui.context.stepIndex].semi2911View;
    assert.equal(approach===2 ? state.operation : state.phase,approach===2 ? 'enter-call' : 'partition');
    ui.handlers['jump:result']();
    assert.equal(ui.context.stepIndex,run.steps.length-1);
    assert.match(ui.host.innerHTML,/s2911-answer/);
  }
});

test('2911 HTTP exposes both debugging approaches, matching source blocks and complete results', async () => {
  const net = require('node:net');
  const port = await new Promise((resolve,reject) => {
    const probe = net.createServer(); probe.on('error',reject);
    probe.listen(0,()=>{const port=probe.address().port;probe.close(()=>resolve(port));});
  });
  const server = spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port)},stdio:'pipe'});
  let timeout;
  try {
    await new Promise((resolve,reject) => {
      timeout=setTimeout(()=>reject(new Error('Preview server did not start')),15000);
      server.on('error',reject);
      server.once('exit',code=>reject(new Error(`Preview server exited: ${code}`)));
      server.stdout.once('data',resolve);
    });
    clearTimeout(timeout);
    const base=`http://localhost:${port}`;
    const response = await fetch(`${base}/api/problem/2911`);
    assert.equal(response.status,200);
    const metadata=await response.json();
    assert.equal(metadata.debugMode,'line-by-line');
    assert.deepEqual(metadata.code2,p.code2);
    for (const approach of [1,2]) {
      const response=await fetch(`${base}/api/problem/2911/solve`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'abcac',params:{k:2,approach}})});
      assert.equal(response.status,200);
      const run=await response.json();
      assert.equal(run.answer,1);
      assert.ok(run.steps.every(step=>step.codeBlock===approach && step.codeLines.length===1));
      if (approach===2) assert.ok(run.steps.some(step=>step.semi2911View.operation==='cache-hit'));
    }
    const live=await(await fetch(`${base}/api/problem/2911/live-args`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:'abcabc',params:{k:1,approach:2}})})).json();
    assert.deepEqual(live.args,['abcabc',1]);
  } finally {clearTimeout(timeout);server.kill();}
});

test('2911 lazy assets and renderer registry are connected', () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /semi-palindromes-2911\.css[^>]*data-problem-ids="2911"/);
  assert.match(html, /renderer-semi-palindromes-2911\.js[^>]*data-problem-ids="2911"/);
  assert.match(fs.readFileSync(require.resolve('../public/script.js'), 'utf8'), /step\.semi2911View/);
});
