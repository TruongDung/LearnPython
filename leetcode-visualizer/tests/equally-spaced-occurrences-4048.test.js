const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4048];

function oracle(nums) {
  const positions = new Map();
  nums.forEach((value, index) => {
    if (!positions.has(value)) positions.set(value, []);
    positions.get(value).push(index);
  });
  let answer = 0;
  for (const indices of positions.values()) {
    if (indices.length === 3 && indices[1] - indices[0] === indices[2] - indices[1]) {
      answer += 1;
    }
  }
  return answer;
}

test('4048 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4048);
  assert.equal(problem.slug, 'count-values-with-equally-spaced-occurrences-i');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /def countSpecialIntegers\(self, nums: List\[int\]\) -> int/);
});

test('4048 matches all official examples', () => {
  const cases = [
    [[1, 8, 1, 5, 1, 5, 8, 5], 2],
    [[8, 8, 8, 8], 0],
    [[8, 6, 6, 8, 8], 0],
  ];
  for (const [nums, expected] of cases) {
    const built = problem.builder(nums);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).equallySpaced4048View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4048 builder agrees with an independent grouping oracle', () => {
  let seed = 4048;
  for (let length = 3; length <= 24; length += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      const nums = Array.from({ length }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % 8 + 1;
      });
      assert.equal(problem.builder(nums).answer, oracle(nums), JSON.stringify(nums));
    }
  }
});

test('4048 trace separates executed source lines and exposes both rejection reasons', () => {
  const built = problem.builder([1, 8, 1, 5, 1, 5, 8, 5]);
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(built.steps.map((step) => step.equallySpaced4048View.operation));
  for (const operation of ['init-map', 'scan', 'append', 'init-answer', 'group', 'check', 'count', 'return']) {
    assert.ok(operations.has(operation), operation);
  }
  const finalGroups = built.steps.at(-1).equallySpaced4048View.groups;
  assert.deepEqual(finalGroups.filter((group) => group.status === 'special').map((group) => group.value), [1, 5]);
  assert.equal(finalGroups.find((group) => group.value === 8).status, 'wrong-count');

  const unequal = problem.builder([8, 6, 6, 8, 8]).steps
    .find((step) => step.equallySpaced4048View.activeValue === 8 && step.equallySpaced4048View.operation === 'check');
  assert.equal(unequal.equallySpaced4048View.countOk, true);
  assert.equal(unequal.equallySpaced4048View.equalGaps, false);
  assert.deepEqual([unequal.equallySpaced4048View.gapLeft, unequal.equallySpaced4048View.gapRight], [3, 1]);
});

test('4048 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().countSpecialIntegers([1,8,1,5,1,5,8,5]) == 2',
    'assert Solution().countSpecialIntegers([8,8,8,8]) == 0',
    'assert Solution().countSpecialIntegers([8,6,6,8,8]) == 0',
    'assert Solution().countSpecialIntegers([4,1,4,2,4,2,1]) == 1',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_4048.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('4048 custom renderer handles every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderEquallySpaced4048View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
    Set,
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const built = problem.builder([1, 8, 1, 5, 1, 5, 8, 5]);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of built.steps) {
      context.renderEquallySpaced4048View(step);
      assert.match(element.innerHTML, /es4048-viz/);
      assert.match(element.innerHTML, /HASH MAP: VALUE → INDICES/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('4048 validates visual input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
  assert.throws(() => problem.builder([1, 0, 2]), /1 to 100/);
  assert.throws(() => problem.builder(Array(25).fill(1)), /at most 24/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.es4048-viz \{/);
  assert.match(css, /\.es4048-spacing\.equal/);
  assert.match(css, /\.es4048-group\.wrong-count/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
