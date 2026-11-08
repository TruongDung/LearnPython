const { readFrontendStyles } = require('./helpers/frontend-source');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
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
  assert.equal(problem.debugMode, 'line-by-line');
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
  const views = built.steps.map(s => s.fenwickCountView);
  for (const phase of ['split','upper','lower','sweep','done']) assert.ok(views.some(v => v.phase === phase));
  for (const scope of ['solve','add','prefix_sum','kth']) assert.ok(views.some(v => v.scope === scope));
  const rootAdds = views.filter(v => v.change?.kind === 'count' && v.left === 0 && v.right === 4);
  assert.equal(rootAdds.reduce((sum,v) => sum + v.qualifying.length, 0), 2);
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

test('4055 validates visualization input and includes responsive styles', () => {
  assert.throws(() => problem.builder([1, 2]), /at least 3/);
  assert.throws(() => problem.builder([1, 0, 2]), /1,000,000,000/);
  assert.throws(() => problem.builder(Array(17).fill(1)), /at most 16/);
  const css = readFrontendStyles();
  assert.match(css, /\.spii4055-viz \{/);
  assert.match(css, /\.spii4055-cell\.qualifying/);
  assert.match(css, /@container \(max-width: 420px\)/);
});
