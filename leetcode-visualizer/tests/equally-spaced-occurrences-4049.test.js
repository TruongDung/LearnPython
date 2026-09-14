const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4049];

function oracle(nums) {
  const positions = new Map();
  nums.forEach((value, index) => {
    if (!positions.has(value)) positions.set(value, []);
    positions.get(value).push(index);
  });
  let answer = 0;
  for (const indices of positions.values()) {
    if (indices.length < 3) continue;
    const gap = indices[1] - indices[0];
    if (indices.slice(2).every((index, offset) => index - indices[offset + 1] === gap)) {
      answer += 1;
    }
  }
  return answer;
}

test('4049 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4049);
  assert.equal(problem.slug, 'count-values-with-equally-spaced-occurrences-ii');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /def countSpecialIntegers\(self, nums: List\[int\]\) -> int/);
});

test('4049 matches all official examples', () => {
  const cases = [
    [[1, 8, 1, 5, 1, 5, 8, 5], 2],
    [[8, 8, 8, 8], 1],
    [[8, 6, 6, 8, 8], 0],
  ];
  for (const [nums, expected] of cases) {
    const built = problem.builder(nums);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).equallySpaced4049View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4049 builder agrees with an independent grouping oracle', () => {
  let seed = 4049;
  for (let length = 3; length <= 30; length += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      const nums = Array.from({ length }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % 9 + 1;
      });
      assert.equal(problem.builder(nums).answer, oracle(nums), JSON.stringify(nums));
    }
  }
});

test('4049 trace separates lines and exposes valid, too-short, and mismatch paths', () => {
  const cases = [
    problem.builder([8, 8, 8, 8]),
    problem.builder([8, 6, 6, 8, 8]),
  ];
  assert.ok(cases.flatMap((built) => built.steps).every((step) => step.codeLines.length === 1));
  const operations = new Set(cases.flatMap((built) => built.steps.map((step) => step.equallySpaced4049View.operation)));
  for (const operation of ['init-map', 'scan', 'append', 'init-answer', 'group', 'size-check', 'continue', 'set-gap', 'init-flag', 'gap-loop', 'gap-check', 'set-false', 'break', 'final-check', 'count', 'return']) {
    assert.ok(operations.has(operation), operation);
  }

  const valid = cases[0].steps.at(-1).equallySpaced4049View.groups[0];
  assert.equal(valid.status, 'special');
  assert.deepEqual(valid.indices, [0, 1, 2, 3]);

  const mismatch = cases[1].steps.find((step) => step.equallySpaced4049View.operation === 'gap-check' && step.equallySpaced4049View.mismatchGapOrdinal != null);
  assert.deepEqual([mismatch.equallySpaced4049View.expectedGap, mismatch.equallySpaced4049View.actualGap], [3, 1]);
  assert.equal(mismatch.equallySpaced4049View.currentGapOrdinal, 2);
});

test('4049 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().countSpecialIntegers([1,8,1,5,1,5,8,5]) == 2',
    'assert Solution().countSpecialIntegers([8,8,8,8]) == 1',
    'assert Solution().countSpecialIntegers([8,6,6,8,8]) == 0',
    'assert Solution().countSpecialIntegers([4,1,4,2,4,3,4]) == 1',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_4049.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('4049 custom renderer handles every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderEquallySpaced4049View(step)');
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
  const traces = [
    ...problem.builder([8, 8, 8, 8]).steps,
    ...problem.builder([8, 6, 6, 8, 8]).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderEquallySpaced4049View(step);
      assert.match(element.innerHTML, /esii4049-viz/);
      assert.match(element.innerHTML, /HASH MAP: VALUE → INDICES/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('4049 validates visual input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
  assert.throws(() => problem.builder([1, 0, 2]), /1,000,000,000/);
  assert.throws(() => problem.builder(Array(31).fill(1)), /at most 30/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.esii4049-viz/);
  assert.match(css, /\.esii4049-gap\.mismatch/);
  assert.match(css, /\.esii4049-viz \.es4048-group\.too-few/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
