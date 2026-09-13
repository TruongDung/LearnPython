const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4054];

function oracle(nums) {
  let answer = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[i] >= nums[j]) continue;
      let shadowed = false;
      for (let k = i + 1; k < j; k += 1) {
        if (nums[k] < nums[i]) {
          shadowed = true;
          break;
        }
      }
      if (!shadowed) answer += 1;
    }
  }
  return answer;
}

test('4054 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4054);
  assert.equal(problem.slug, 'count-shadow-pairs-i');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n log n)');
  assert.match(problem.code.join('\n'), /def shadowPairs\(self, nums\)/);
});

test('4054 matches all official examples', () => {
  const cases = [
    [[3, 1, 4, 1, 5], 3],
    [[6, 7, 6, 6, 7], 4],
    [[1, 2, 3, 4], 6],
  ];
  for (const [nums, expected] of cases) {
    const built = problem.builder(nums);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).shadowPairs4054View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4054 agrees with an independent brute-force oracle', () => {
  let seed = 4054;
  for (let n = 3; n <= 10; n += 1) {
    for (let sample = 0; sample < 80; sample += 1) {
      const nums = Array.from({ length: n }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % 8 + 1;
      });
      assert.equal(problem.builder(nums).answer, oracle(nums), JSON.stringify(nums));
    }
  }
});

test('4054 trace debugs exactly one executed source line per step', () => {
  const built = problem.builder([3, 1, 4, 1, 5]);
  assert.equal(built.steps.length, 32);
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  const lineCounts = built.steps.reduce((counts, step) => {
    const line = step.codeLines[0];
    counts[line] = (counts[line] || 0) + 1;
    return counts;
  }, {});
  assert.deepEqual(lineCounts, {
    5: 1, 6: 1, 7: 5, 8: 5, 9: 5,
    10: 7, 11: 2, 12: 5, 13: 1,
  });
  const lastAddition = built.steps.findLast((step) => step.codeLines[0] === 9);
  assert.deepEqual(lastAddition.shadowPairs4054View.qualifying.map((item) => item.index), [1, 3]);
  assert.equal(lastAddition.shadowPairs4054View.answer, 3);
});

test('4054 displayed Python agrees with the visualization', () => {
  const assertions = [
    'assert Solution().shadowPairs([3,1,4,1,5]) == 3',
    'assert Solution().shadowPairs([6,7,6,6,7]) == 4',
    'assert Solution().shadowPairs([1,2,3,4]) == 6',
  ].join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('4054 custom renderer handles every phase in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderShadowPairs4054View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
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
  const built = problem.builder([3, 1, 4, 1, 5]);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of built.steps) {
      context.renderShadowPairs4054View(step);
      assert.match(element.innerHTML, /sp4054-viz/);
      assert.match(element.innerHTML, /CANDIDATE STACK/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('4054 validates visualization input and includes responsive styles', () => {
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
  assert.throws(() => problem.builder([1, 0, 2]), /1,000,000,000/);
  assert.throws(() => problem.builder(Array(41).fill(1)), /at most 40/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.sp4054-viz \{/);
  assert.match(css, /\.sp4054-stack-item\.qualifying/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
