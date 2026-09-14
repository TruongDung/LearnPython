const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4051];

function brute(nums, goal, k) {
  let answer = 0;
  for (let left = 0; left < nums.length; left += 1) {
    let sum = 0;
    for (let right = left; right < nums.length; right += 1) {
      sum += nums[right];
      if (Math.abs(sum - goal) >= k) answer += 1;
    }
  }
  return answer;
}

test('4051 is registered with the official signature and optimal metadata', () => {
  assert.equal(problem.id, 4051);
  assert.equal(problem.slug, 'count-subarrays-with-distant-sums');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n log n)');
  assert.match(problem.code.join('\n'), /def distantSubarrays\(self, nums: list\[int\], goal: int, k: int\) -> int/);
});

test('4051 matches every official example', () => {
  const cases = [
    [[1, 2, 1], 4, 1, 5],
    [[2, -1, 3], 2, 2, 2],
    [[-3, 1, 2], 0, 3, 2],
  ];
  for (const [nums, goal, k, expected] of cases) {
    const built = problem.builder(nums, { goal, k });
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).distantSubarrays4051View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4051 Fenwick builder agrees with independent quadratic enumeration', () => {
  let seed = 4051;
  for (let length = 1; length <= 9; length += 1) {
    for (let sample = 0; sample < 100; sample += 1) {
      const next = (modulus) => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % modulus;
      };
      const nums = Array.from({ length }, () => next(13) - 6);
      const goal = next(15) - 7;
      const k = next(8);
      assert.equal(problem.builder(nums, { goal, k }).answer, brute(nums, goal, k), JSON.stringify({ nums, goal, k }));
    }
  }
});

test('4051 handles k = 0 without double-counting overlapping ranges', () => {
  for (const nums of [[5], [1, -1], [2, 0, -2, 4]]) {
    const built = problem.builder(nums, { goal: 999, k: 0 });
    assert.equal(built.answer, nums.length * (nums.length + 1) / 2);
    assert.deepEqual(built.steps.map((step) => step.distantSubarrays4051View.operation), ['k-check', 'set-n', 'return-all']);
  }
});

test('4051 trace debugs one source line at a time and covers both Fenwick ranges', () => {
  const built = problem.builder([2, -1, 3], { goal: 2, k: 2 });
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  assert.ok(built.steps.every((step) => problem.code[step.codeLines[0] - 1].trim().length > 0));
  const operations = new Set(built.steps.map((step) => step.distantSubarrays4051View.operation));
  for (const operation of ['k-check', 'init-prefix', 'prefix-loop', 'append-prefix', 'compress', 'init-bit', 'init-counters', 'scan-prefix', 'low-threshold', 'high-threshold', 'query-left', 'query-right', 'count', 'insert', 'increment-seen', 'return']) {
    assert.ok(operations.has(operation), operation);
  }
  assert.ok(built.steps.some((step) => Number(step.distantSubarrays4051View.leftCount) > 0));
  assert.ok(built.steps.some((step) => Number(step.distantSubarrays4051View.rightCount) > 0));
});

test('4051 final visual subarray records are exact', () => {
  const nums = [1, 2, 1];
  const goal = 4;
  const k = 1;
  const view = problem.builder(nums, { goal, k }).steps.at(-1).distantSubarrays4051View;
  assert.equal(view.accepted.length, view.answer);
  for (const item of view.accepted) {
    const sum = nums.slice(item.start, item.end + 1).reduce((total, value) => total + value, 0);
    assert.equal(item.sum, sum);
    assert.equal(item.difference, Math.abs(sum - goal));
    assert.ok(item.difference >= k);
  }
});

test('4051 displayed Python, solution file, and live arguments agree', () => {
  const assertions = [
    'assert Solution().distantSubarrays([1,2,1], 4, 1) == 5',
    'assert Solution().distantSubarrays([2,-1,3], 2, 2) == 2',
    'assert Solution().distantSubarrays([-3,1,2], 0, 3) == 2',
    'assert Solution().distantSubarrays([0,0,0], -5, 0) == 6',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_4051.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
  assert.deepEqual(problem.liveArgs([2, -1, 3], { goal: 2, k: 2 }), [[2, -1, 3], 2, 2]);
});

test('4051 custom renderer handles every path in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderDistantSubarrays4051View(step)');
  const end = source.indexOf('\nfunction renderRectangleOverlap836View(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const traces = [
    ...problem.builder([2, -1, 3], { goal: 2, k: 2 }).steps,
    ...problem.builder([1, 2], { goal: 10, k: 0 }).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderDistantSubarrays4051View(step);
      assert.match(element.innerHTML, /ds4051-viz/);
      assert.match(element.innerHTML, /COMPRESSED COORDINATES|TỌA ĐỘ NÉN/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('4051 validates visual input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([], { goal: 0, k: 1 }), /at least one/);
  assert.throws(() => problem.builder(Array(17).fill(1), { goal: 0, k: 1 }), /at most 16/);
  assert.throws(() => problem.builder([1], { goal: 0.5, k: 1 }), /goal must be an integer/);
  assert.throws(() => problem.builder([1], { goal: 0, k: -1 }), /k must be an integer/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ds4051-viz/);
  assert.match(css, /\.ds4051-bound\.left/);
  assert.match(css, /\.ds4051-coordinate\.right-range/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
