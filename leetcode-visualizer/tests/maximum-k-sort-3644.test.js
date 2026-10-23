const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3644];

function canSortWithK(nums, k) {
  const start = [...nums];
  const queue = [start];
  const seen = new Set([start.join(',')]);
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    if (state.every((value, index) => value === index)) return true;
    for (let i = 0; i < state.length; i++) {
      for (let j = i + 1; j < state.length; j++) {
        if ((state[i] & state[j]) !== k) continue;
        const next = [...state];
        [next[i], next[j]] = [next[j], next[i]];
        const key = next.join(',');
        if (!seen.has(key)) { seen.add(key); queue.push(next); }
      }
    }
  }
  return false;
}

function bruteAnswer(nums) {
  if (nums.every((value, index) => value === index)) return 0;
  for (let k = nums.length - 1; k >= 0; k--) if (canSortWithK(nums, k)) return k;
  return -1;
}

test('3644 returns the largest feasible k on examples, sorted input, and a swap-search oracle', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.builder([0, 3, 2, 1]).answer, 1);
  assert.equal(problem.builder([0, 1, 3, 2]).answer, 2);
  assert.equal(problem.builder([3, 2, 1, 0]).answer, 0);
  assert.equal(problem.builder([0, 1, 2, 3]).answer, 0);
  assert.equal(problem.builder([0]).answer, 0);
  for (let n = 1; n <= 4; n++) {
    const permute = (prefix, rest) => {
      if (!rest.length) {
        assert.equal(problem.builder(prefix).answer, Math.max(0, bruteAnswer(prefix)), prefix.join(','));
        return;
      }
      rest.forEach((value, index) => permute([...prefix, value], [...rest.slice(0, index), ...rest.slice(index + 1)]));
    };
    permute([], Array.from({ length: n }, (_, index) => index));
  }
});

test('3644 emits a separate source-line frame for every executed statement', () => {
  const nums = [0, 3, 2, 1];
  const run = problem.builder(nums);
  assert.deepEqual(nums, [0, 3, 2, 1]);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length));
  const view = run.steps.map((step) => step.k3644View);
  assert.deepEqual(view.filter((state) => state.line === 5).map((state) => state.comparison.misplaced), [false, true, false, true]);
  assert.deepEqual(view.filter((state) => state.line === 6).map((state) => state.maskUpdate.after), [3, 1]);
  assert.equal(run.steps.at(-1).k3644View.answer, 1);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
});

test('3644 validates permutations, runs the displayed Python, and bounds large-input previews', () => {
  for (const input of [[], null, '', [1], [0, 0], [0, 2], [-1, 0], [0, 1.5], [true], Array(100001).fill(0)]) {
    assert.throws(() => problem.builder(input));
  }
  assert.deepEqual(problem.liveArgs([0, 3, 2, 1]), [[0, 3, 2, 1]]);
  const python = `${problem.code.join('\n')}\nassert Solution().sortPermutation([0,3,2,1]) == 1\nassert Solution().sortPermutation([0,1,3,2]) == 2\nassert Solution().sortPermutation([3,2,1,0]) == 0\nassert Solution().sortPermutation([0,1,2,3]) == 0`;
  const run = spawnSync('python', ['-c', python], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);

  const large = Array.from({ length: 100000 }, (_, index) => 99999 - index);
  const summary = problem.builder(large);
  assert.equal(summary.answer, 0);
  assert.equal(summary.steps.length, 1);
  assert.equal(summary.steps[0].k3644View.total, 100000);
  assert.equal(summary.steps[0].k3644View.preview, true);
  assert.equal(summary.steps[0].k3644View.nums.length, 16);
  assert.equal(summary.steps[0].k3644View.misplacedCount, 100000);
});

test('3644 renderer draws positions and bit intersections in Vietnamese and English', () => {
  const source = fs.readFileSync(require.resolve('../public/renderer-maximum-k-sort-3644.js'), 'utf8');
  const element = { innerHTML: '' };
  const context = {
    lang: 'vi',
    $: () => element,
    escapeHtml: (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;'),
    pick: (value) => value?.vi ?? value?.en ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  const run = problem.builder([0, 3, 2, 1]);
  for (const language of ['vi', 'en']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderK3644View(step);
      assert.match(element.innerHTML, /k3644-viz/);
      assert.match(element.innerHTML, /k3644-tile/);
      assert.match(element.innerHTML, /k3644-bit-row/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  context.renderK3644View(run.steps.find((step) => step.k3644View.line === 6));
  assert.match(element.innerHTML, /11 &amp; 11 = 11/);
  context.renderK3644View(run.steps.filter((step) => step.k3644View.line === 6).at(-1));
  assert.match(element.innerHTML, /11 &amp; 01 = 01/);
  assert.match(element.innerHTML, /k3644-tile .*current/);
  context.lang = 'en';
  context.renderK3644View(run.steps.at(-1));
  assert.match(element.innerHTML, /MAXIMUM K/);
  assert.match(element.innerHTML, /<strong>1<\/strong>/);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /maximum-k-sort-3644\.css[^>]*data-problem-ids="3644"/);
  assert.match(html, /renderer-maximum-k-sort-3644\.js[^>]*data-problem-ids="3644"/);
});

test('3644 is available through the app API and serves its lazy illustration assets', async () => {
  const port = await new Promise((resolve, reject) => {
    const probe = require('node:net').createServer();
    probe.on('error', reject);
    probe.listen(0, () => {
      const selected = probe.address().port;
      probe.close((error) => error ? reject(error) : resolve(selected));
    });
  });
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port) },
    stdio: 'pipe',
  });
  const url = `http://localhost:${port}`;
  let logs = '';
  server.stderr.on('data', (data) => { logs += data; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(`${url}/api/problem/3644`)).ok; } catch {}
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assert.ok(ready, logs);
    const meta = await (await fetch(`${url}/api/problem/3644`)).json();
    assert.equal(meta.slug, 'maximum-k-to-sort-a-permutation');
    assert.deepEqual(meta.code, problem.code);
    const response = await fetch(`${url}/api/problem/3644/solve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: [0, 3, 2, 1] }),
    });
    assert.equal(response.status, 200);
    const solved = await response.json();
    assert.equal(solved.answer, 1);
    assert.ok(solved.steps.every((step) => step.k3644View));
    for (const asset of ['renderer-maximum-k-sort-3644.js', 'maximum-k-sort-3644.css']) {
      assert.equal((await fetch(`${url}/${asset}`)).status, 200);
    }
    const { groups } = await (await fetch(`${url}/api/problems`)).json();
    assert.ok(groups.find((group) => group.key === 'bitmask')?.problems.some((entry) => entry.id === 3644));
  } finally {
    server.kill();
  }
});
