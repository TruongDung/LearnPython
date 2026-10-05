const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1376];
const defaults = Object.fromEntries(problem.extraParams.map(p => [p.key, p.default]));
const view = step => step.informEmployees1376View;

function expectedTimes(manager, informTime) {
  // Independent oracle: walk upward from each employee to the root.
  return manager.map((_, employee) => {
    let total = 0;
    for (let boss = manager[employee]; boss >= 0; boss = manager[boss]) total += informTime[boss];
    return total;
  });
}

test('1376 BFS and DFS agree with path sums on varied rooted trees', () => {
  const cases = [
    { manager: [-1], informTime: [0] },
    { manager: [2, 2, -1, 2, 2, 2], informTime: [0, 0, 1, 0, 0, 0] },
    { manager: [-1, 0, 0, 1, 1, 2, 2], informTime: [2, 3, 1, 0, 0, 0, 0] },
    { manager: [1, 2, -1], informTime: [0, 4, 2] },
    { manager: [-1, 0], informTime: [0, 9] },
  ];
  let seed = 1376;
  const random = bound => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % bound; };
  for (let sample = 0; sample < 80; sample++) {
    const n = 1 + random(12), ids = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = random(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const manager = Array(n).fill(-1), informTime = Array.from({ length: n }, () => random(8));
    for (let i = 1; i < n; i++) manager[ids[i]] = ids[random(i)];
    cases.push({ manager, informTime });
  }
  for (const data of cases) {
    const n = data.manager.length, times = expectedTimes(data.manager, data.informTime);
    const params = { manager: JSON.stringify(data.manager), informTime: JSON.stringify(data.informTime), headID: data.manager.indexOf(-1) };
    for (const builder of [problem.builder, problem.builder2]) {
      const run = builder(n, params), final = view(run.steps.at(-1));
      assert.equal(run.answer, Math.max(...times));
      assert.deepEqual(final.arrival, times);
      assert.equal(final.processed.length, n);
      assert.equal(new Set(final.processed).size, n);
      assert.equal(final.path[0], params.headID);
      assert.equal(times[final.path.at(-1)], run.answer);
      assert.equal(final.path.slice(0, -1).reduce((sum, employee) => sum + data.informTime[employee], 0), run.answer);
    }
  }
});

test('1376 uses FIFO for BFS and LIFO for DFS, with correctly staged mutations', () => {
  for (const [dfs, builder] of [[false, problem.builder], [true, problem.builder2]]) {
    const run = builder(7, defaults), code = dfs ? problem.code2 : problem.code;
    const processed = run.steps.filter(s => view(s).event === 'pop').map(s => view(s).current);
    assert.deepEqual(processed, dfs ? [0, 2, 6, 5, 1, 4, 3] : [0, 1, 2, 3, 4, 5, 6]);
    for (let i = 0; i < run.steps.length; i++) {
      const step = run.steps[i], v = view(step);
      assert.equal(step.codeLines.length, 1);
      assert.equal(step.codeBlock, dfs ? 2 : 1);
      assert.ok(step.codeLines[0] >= 1 && step.codeLines[0] <= code.length);
      assert.ok(v.processed.every(employee => v.arrival[employee] !== null));
      if (v.event === 'pop') {
        const old = view(run.steps[i - 1]).pending;
        assert.equal(v.current, (dfs ? old.at(-1) : old[0]).employee);
        assert.match(code[step.codeLines[0] - 1], dfs ? /stack.pop/ : /queue.popleft/);
      }
      if (v.event === 'calculate') {
        assert.equal(v.arrival[v.child], null);
        assert.ok(!v.pending.some(item => item.employee === v.child));
        assert.equal(v.nextTime, v.arrival[v.current] + v.informTime[v.current]);
      }
      if (v.event === 'push') {
        assert.equal(v.arrival[v.child], v.nextTime);
        assert.deepEqual(v.pending.at(-1), { employee: v.child, time: v.nextTime });
        assert.match(code[step.codeLines[0] - 1], /append/);
      }
      if (v.event === 'max') assert.equal(v.answer, Math.max(v.previousAnswer, v.arrival[v.current]));
    }
  }
});

test('1376 rejects disconnected management cycles and invalid inputs', () => {
  for (const builder of [problem.builder, problem.builder2]) {
    assert.throws(() => builder(3, { headID: 0, manager: '[-1,2,1]', informTime: '[1,1,1]' }), /connected tree/);
    assert.throws(() => builder(2, { headID: 0, manager: '[-1,-1]', informTime: '[0,0]' }), /connected tree/);
    assert.throws(() => builder(2, { headID: 0, manager: '[-1,0]', informTime: '[1,-1]' }), /non-negative/);
  }
});

test('1376 dedicated renderer shows both traversal containers, times and the critical branch', () => {
  const host = { innerHTML: '' };
  const ctx = { lang: 'vi', $: () => host, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-inform-employees-1376.js'), 'utf8'), ctx);
  for (const language of ['vi', 'en']) {
    ctx.lang = language;
    for (const builder of [problem.builder, problem.builder2]) {
      const run = builder(7, defaults);
      for (const step of run.steps) {
        ctx.renderInformEmployees1376View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
        assert.equal((host.innerHTML.match(/class="ie1376-node /g) || []).length, 7);
        assert.equal((host.innerHTML.match(/class="ie1376-time-row /g) || []).length, 7);
        assert.match(host.innerHTML, /STACK|QUEUE/);
      }
      assert.match(host.innerHTML, /2 \+ 3 = 5/);
      assert.equal((host.innerHTML.match(/class="ie1376-node critical"/g) || []).length, 3);
      const beforePush = run.steps.find(s => view(s).event === 'calculate');
      ctx.renderInformEmployees1376View(beforePush);
      assert.match(host.innerHTML, language === 'vi' ? /Chưa thêm/ : /Not added/);
    }
  }
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(html, /renderer-inform-employees-1376.js/);
  assert.match(html, /inform-employees-1376.css/);
  assert.match(fs.readFileSync(path.join(__dirname, '../public/script.js'), 'utf8'), /renderInformEmployees1376View\(step\)/);
});
