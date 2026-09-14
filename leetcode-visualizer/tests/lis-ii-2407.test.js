const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[2407];

function quadraticOracle(nums, k) {
  const dp = new Array(nums.length).fill(1);
  let answer = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const difference = nums[i] - nums[j];
      if (difference >= 1 && difference <= k) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    answer = Math.max(answer, dp[i]);
  }
  return answer;
}

test('2407 is registered with complete segment-tree metadata', () => {
  assert.equal(problem.id, 2407);
  assert.equal(problem.slug, 'longest-increasing-subsequence-ii');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n log n)');
  assert.ok(problem.tags.some(tag => tag.key === 'segment-tree'));
  assert.ok(problem.tags.some(tag => tag.key === 'coordinate-compression'));
  assert.match(problem.code.join('\n'), /bisect_left|def query|def update/);
});

test('2407 matches the official examples', () => {
  const examples = [
    [[4, 2, 1, 4, 3, 4, 5, 8, 15], 3, 5],
    [[7, 4, 5, 1, 8, 12, 4, 7], 5, 4],
    [[1, 5], 1, 1],
  ];
  for (const [nums, k, expected] of examples) {
    const built = problem.builder(nums, { k });
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).lis2407View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('2407 agrees with an independent quadratic oracle', () => {
  let seed = 2407;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };

  for (let caseIndex = 0; caseIndex < 250; caseIndex += 1) {
    const length = 1 + random(12);
    const nums = Array.from({ length }, () => 1 + random(30));
    const k = 1 + random(12);
    assert.equal(
      problem.builder(nums, { k }).answer,
      quadraticOracle(nums, k),
      JSON.stringify({ nums, k }),
    );
  }
});

test('2407 trace exposes the value window, query decomposition, and update path', () => {
  const built = problem.builder(problem.defaultInput, { k: 3 });
  const operations = new Set(built.steps.map(step => step.lis2407View.operation));
  for (const operation of ['init', 'scan', 'bounds', 'query', 'dp', 'update', 'best', 'done']) {
    assert.ok(operations.has(operation), operation);
  }
  assert.ok(built.steps.every(step => step.codeLines.length === 1));
  assert.ok(built.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(built.steps.some(step => step.lis2407View.queryNodes.length > 1));
  assert.ok(built.steps.some(step => step.lis2407View.updatePath.length > 1));

  const finalView = built.steps.at(-1).lis2407View;
  const chainValues = finalView.chain.map(index => finalView.nums[index]);
  assert.equal(chainValues.length, built.answer);
  for (let i = 1; i < chainValues.length; i += 1) {
    assert.ok(chainValues[i] > chainValues[i - 1]);
    assert.ok(chainValues[i] - chainValues[i - 1] <= finalView.k);
  }
});

test('2407 validates visualization inputs', () => {
  assert.throws(() => problem.builder([], { k: 3 }), /positive integers/);
  assert.throws(() => problem.builder([1, 0, 2], { k: 3 }), /positive integers/);
  assert.throws(() => problem.builder(Array.from({ length: 17 }, (_, index) => index + 1), { k: 3 }), /at most 16/);
  assert.throws(() => problem.builder([1, 2], { k: 0 }), /1 to 100000/);
  assert.throws(() => problem.builder([1, 2], { k: 100001 }), /1 to 100000/);
});

test('2407 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().lengthOfLIS([4,2,1,4,3,4,5,8,15], 3) == 5',
    'assert Solution().lengthOfLIS([7,4,5,1,8,12,4,7], 5) == 4',
    'assert Solution().lengthOfLIS([1,5], 1) == 1',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/dynamic-programming/Leetcode_2407.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('2407 custom renderer handles every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderLIS2407View(step)');
  const end = source.indexOf('\nfunction renderHouseRobberView(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const trace = problem.builder(problem.defaultInput, { k: 3 }).steps;
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of trace) {
      context.renderLIS2407View(step);
      assert.match(element.innerHTML, /lis2407-viz/);
      assert.match(element.innerHTML, /COMPRESSED VALUE AXIS|TRỤC GIÁ TRỊ ĐÃ NÉN/);
      assert.match(element.innerHTML, /RANGE-MAX TREE/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('2407 has responsive, scoped visualization styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.lis2407-viz/);
  assert.match(css, /\.lis2407-leaf\.is-eligible/);
  assert.match(css, /\.lis2407-node\.is-query/);
  assert.match(css, /\.lis2407-node\.is-update/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
