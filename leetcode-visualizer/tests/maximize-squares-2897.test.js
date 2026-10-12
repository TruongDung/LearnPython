const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');
const problem = SUPPORTED[2897];
const view = step => step.maximizeSquares2897View;

// Explore actual legal AND/OR operations, not another bit-count implementation.
function reachableBest(nums) {
  const start = [...nums].sort((a, b) => a - b);
  const queue = [start];
  const seen = new Set([start.join(',')]);
  const best = Array(nums.length).fill(0);
  for (let index = 0; index < queue.length; index++) {
    const state = queue[index];
    let total = 0;
    [...state].reverse().forEach((value, k) => { total += value * value; best[k] = Math.max(best[k], total); });
    for (let i = 0; i < state.length; i++) for (let j = i + 1; j < state.length; j++) {
      const next = [...state];
      next[i] = state[i] & state[j];
      next[j] = state[i] | state[j];
      next.sort((a, b) => a - b);
      const key = next.join(',');
      if (!seen.has(key)) { seen.add(key); queue.push(next); }
    }
  }
  return best;
}

test('2897 matches official examples, single values and zero-valued constructed numbers', () => {
  assert.equal(problem.builder([2, 6, 5, 8], { k: 2 }).answer, 261);
  assert.equal(problem.builder([4, 5, 4, 7], { k: 3 }).answer, 90);
  assert.equal(problem.builder('2,6,5,8', { k: '2' }).answer, 261);
  assert.equal(problem.builder('[2,6,5,8]', { k: 2 }).answer, 261);
  assert.equal(problem.builder([5], { k: 1 }).answer, 25);
  const zero = problem.builder([1, 2, 4], { k: 3 });
  assert.equal(zero.answer, 49);
  assert.deepEqual(view(zero.steps.at(-1)).selected.map(item => item.value), [7, 0, 0]);
});

test('2897 greedy results match exhaustive reachable AND/OR states for small arrays', () => {
  for (let a = 1; a <= 7; a++) for (let b = a; b <= 7; b++) for (let c = b; c <= 7; c++) {
    const nums = [a, b, c];
    const expected = reachableBest(nums);
    for (let k = 1; k <= 3; k++) assert.equal(problem.builder(nums, { k }).answer, expected[k - 1], `${nums}, k=${k}`);
  }
  assert.equal(problem.builder(problem.defaultInput, { k: 2 }).answer, reachableBest(problem.defaultInput)[1]);
});

test('2897 conserves bits, isolates snapshots and leaves unselected bits in the bank', () => {
  const nums = [4, 5, 4, 7];
  const run = problem.builder(nums, { k: 3 });
  assert.deepEqual(nums, [4, 5, 4, 7]);
  for (const step of run.steps) {
    const frame = view(step);
    assert.ok(step.codeLines.every(line => problem.code[line - 1]?.trim()));
    if (['ready', 'start', 'consume', 'square', 'done'].includes(frame.phase)) for (let bit = 0; bit < 30; bit++) {
      const completed = frame.selected.reduce((count, item) => count + ((item.value >>> bit) & 1), 0);
      const building = ['start', 'consume'].includes(frame.phase) ? (frame.current >>> bit) & 1 : 0;
      assert.equal(frame.counts[bit] + completed + building, frame.initialCounts[bit]);
    }
  }
  const final = view(run.steps.at(-1));
  assert.equal(final.counts[2], 1); // The unselected fourth number is 4.
  assert.equal(final.rawSum, '90');
  assert.equal(run.steps.at(-1).final, true);
  assert.deepEqual(view(run.steps[0]).counts, Array(30).fill(0));
  const counted = run.steps.find(step => view(step).phase === 'count');
  assert.equal(view(counted).counts[2], 1);
  assert.equal(view(counted).selected.length, 0);
  assert.doesNotThrow(() => JSON.stringify(run));
});

test('2897 uses exact large squares and all 30 bits without signed truncation', () => {
  assert.equal(problem.builder([1000000000, 1000000000], { k: 2 }).answer, 98);
  const run = problem.builder([536870911, 536870912], { k: 1 });
  const final = view(run.steps.at(-1));
  assert.equal(final.width, 30);
  assert.equal(final.selected[0].value, 1073741823);
  assert.equal(final.selected[0].square, String(1073741823n ** 2n));
  assert.equal(run.answer, Number(1073741823n ** 2n % 1000000007n));
});

test('2897 caps long traces while computing every chosen number and complete sums', () => {
  const nums = Array(12).fill(536870911);
  const run = problem.builder(nums, { k: 12 });
  const final = view(run.steps.at(-1));
  assert.equal(run.steps.length, 420);
  assert.ok(final.omittedSteps > 0);
  assert.equal(final.selected.length, 12);
  assert.deepEqual(final.counts, Array(30).fill(0));
  assert.equal(final.rawSum, String(12n * 536870911n ** 2n));
  assert.equal(run.answer, Number(12n * 536870911n ** 2n % 1000000007n));
});

test('2897 rejects invalid nums, k and visualization limits', () => {
  for (const input of [[], null, [0], [-1], [1000000001], [1.5], [true], Array(13).fill(1), '1,nope', '[']) assert.throws(() => problem.builder(input, { k: 1 }), /2897/);
  for (const k of [0, -1, 3, 1.5, true, '2.0', 'nope']) assert.throws(() => problem.builder([1, 2], { k }), /2897/);
  assert.throws(() => problem.builder([1], []), /2897/);
});

test('2897 displayed Python and live arguments agree with the visualizer', () => {
  const cases = [{ nums: [2, 6, 5, 8], k: 2 }, { nums: [4, 5, 4, 7], k: 3 }, { nums: [1, 2, 4], k: 3 }, { nums: [1000000000, 1000000000], k: 2 }, { nums: [536870911, 536870912], k: 1 }];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor case in json.load(sys.stdin):\n    assert Solution().maxSum(case['nums'], case['k']) == case['expected']`;
  const execution = spawnSync('python3', ['-c', source], { input: JSON.stringify(cases.map(input => ({ ...input, expected: problem.builder(input.nums, { k: input.k }).answer }))), encoding: 'utf8' });
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(problem.liveArgs('2,6,5,8', { k: '2' }), [[2, 6, 5, 8], 2]);
});

test('2897 renderer handles counting, transfer, zero values and exact squares in both languages', () => {
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximize-squares-2897.js'), 'utf8'), context);
  const steps = [...problem.builder(problem.defaultInput, { k: 2 }).steps, ...problem.builder([1, 2, 4], { k: 3 }).steps, ...problem.builder([536870911, 536870912], { k: 1 }).steps];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of steps) {
      context.renderMaximizeSquares2897View(step);
      assert.match(host.innerHTML, /sq2897-bank/);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.equal((host.innerHTML.match(/class="sq2897-column /g) || []).length, view(step).width);
      if (view(step).phase === 'attach') assert.match(host.innerHTML, /transferring/);
      if (view(step).phase === 'done') assert.match(host.innerHTML, new RegExp(`<output>${step.maximizeSquares2897View.answer}</output>`));
    }
  }
});

test('2897 is registered with its own lazy renderer, styles and official slug', () => {
  assert.equal(problem.slug, 'apply-operations-on-array-to-maximize-sum-of-squares');
  assert.equal(problem.difficulty, 'hard');
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-maximize-squares-2897.js'));
  assert.ok(STYLESHEET_ASSETS.includes('maximize-squares-2897.css'));
  assert.match(readFrontendJavaScript(), /renderMaximizeSquares2897View\(step\)/);
  assert.doesNotMatch(readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?maximize-squares-2897\.(?:js|css)/);
});
