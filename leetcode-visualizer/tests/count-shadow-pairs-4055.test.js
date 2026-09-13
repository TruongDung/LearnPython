const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4055];

function oracle(nums) {
  let answer = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[i] >= nums[j]) continue;
      let blocked = false;
      for (let k = i + 1; k < j; k += 1) {
        if (nums[i] < nums[k] && nums[k] < nums[j]) {
          blocked = true;
          break;
        }
      }
      if (!blocked) answer += 1;
    }
  }
  return answer;
}

test('4055 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4055);
  assert.equal(problem.slug, 'count-shadow-pairs-ii');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n log² n)');
  assert.match(problem.code.join('\n'), /def shadowPairs\(self, nums: List\[int\]\) -> int/);
});

test('4055 matches both official examples', () => {
  const cases = [
    [[3, 1, 4, 2, 5], 5],
    [[6, 7, 8, 9], 3],
  ];
  for (const [nums, expected] of cases) {
    const built = problem.builder(nums);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).shadowPairs4055View.subtotal, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4055 visualization agrees with an independent brute-force oracle', () => {
  let seed = 4055;
  for (let n = 3; n <= 10; n += 1) {
    for (let sample = 0; sample < 60; sample += 1) {
      const nums = Array.from({ length: n }, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed % 9 + 1;
      });
      assert.equal(problem.builder(nums).answer, oracle(nums), JSON.stringify(nums));
    }
  }
});

test('4055 trace separates split, bounds, Fenwick sweep, and combine line by line', () => {
  const built = problem.builder([3, 1, 4, 2, 5]);
  assert.ok(built.steps.length > 40);
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(built.steps.map((step) => step.shadowPairs4055View.operation));
  for (const operation of ['split', 'upper-bound', 'lower-bound', 'sort-right', 'active-window', 'query-lower', 'add-cross', 'return-segment', 'return-final']) {
    assert.ok(operations.has(operation), operation);
  }
  const rootAdds = built.steps.filter((step) => {
    const view = step.shadowPairs4055View;
    return view.operation === 'add-cross' && view.left === 0 && view.right === 4;
  });
  assert.equal(rootAdds.reduce((sum, step) => sum + step.shadowPairs4055View.qualifying.length, 0), 2);
  assert.equal(built.answer, 5);
});

test('4055 displayed Python and solution file match brute force', () => {
  let seed = 55;
  const cases = [];
  for (let n = 3; n <= 9; n += 1) {
    for (let sample = 0; sample < 15; sample += 1) {
      const nums = Array.from({ length: n }, () => {
        seed = (seed * 1103515245 + 12345) >>> 0;
        return seed % 10 + 1;
      });
      cases.push([nums, oracle(nums)]);
    }
  }
  const assertions = cases.map(([nums, expected]) => `assert Solution().shadowPairs(${JSON.stringify(nums)}) == ${expected}`).join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = require('node:path').resolve(__dirname, '../../Leetcode-sln/divide-and-conquer/Leetcode_4055.py');
  const fileSource = fs.readFileSync(solutionPath, 'utf8').split('if __name__ == "__main__":')[0];
  const fileRun = spawnSync('python3', ['-c', `${fileSource}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(fileRun.status, 0, fileRun.stderr);
});

test('4055 custom renderer handles every phase in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderShadowPairs4055View(step)');
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
  const built = problem.builder([3, 1, 4, 2, 5]);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of built.steps) {
      context.renderShadowPairs4055View(step);
      assert.match(element.innerHTML, /spii4055-viz/);
      assert.match(element.innerHTML, /c\[j\].*nums\[i\].*nums\[j\].*b\[i\]/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
    }
  }
});

test('4055 validates visualization input and includes responsive styles', () => {
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
  assert.throws(() => problem.builder([1, 0, 2]), /1,000,000,000/);
  assert.throws(() => problem.builder(Array(17).fill(1)), /at most 16/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.spii4055-viz \{/);
  assert.match(css, /\.spii4055-cell\.qualifying/);
  assert.match(css, /@container \(max-width: 420px\)/);
});
