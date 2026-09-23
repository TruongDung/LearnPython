const test = require('node:test');
const assert = require('node:assert/strict');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1658];
const solve = (nums, x) => problem.builder(nums, { x });

function bruteForce(nums, x) {
  let answer = Infinity;
  for (let fromLeft = 0; fromLeft <= nums.length; fromLeft++) {
    for (let fromRight = 0; fromRight <= nums.length - fromLeft; fromRight++) {
      const removed = nums.slice(0, fromLeft).concat(nums.slice(nums.length - fromRight));
      if (removed.reduce((sum, value) => sum + value, 0) === x) {
        answer = Math.min(answer, fromLeft + fromRight);
      }
    }
  }
  return Number.isFinite(answer) ? answer : -1;
}

test('1658 is available in the sliding-window catalog', () => {
  assert.equal(problem.id, 1658);
  assert.equal(problem.category.key, 'sliding');
  assert.equal(problem.slug, 'minimum-operations-to-reduce-x-to-zero');
});

test('1658 handles the official examples and boundary cases', () => {
  assert.equal(solve([1, 1, 4, 2, 3], 5).answer, 2);
  assert.equal(solve([5, 6, 7, 8, 9], 4).answer, -1);
  assert.equal(solve([3, 2, 20, 1, 1, 3], 10).answer, 5);
  assert.equal(solve([1, 2], 3).answer, 2);
  assert.equal(solve([1, 2], 10).answer, -1);
  assert.equal(solve([1, 2], 0).answer, 0);
});

test('1658 matches exhaustive left/right removals on small positive arrays', () => {
  for (let length = 1; length <= 4; length++) {
    for (let pattern = 0; pattern < 3 ** length; pattern++) {
      let remaining = pattern;
      const nums = Array.from({ length }, () => {
        const value = remaining % 3 + 1;
        remaining = Math.floor(remaining / 3);
        return value;
      });
      const total = nums.reduce((sum, value) => sum + value, 0);
      for (let x = 0; x <= total + 1; x++) {
        assert.equal(solve(nums, x).answer, bruteForce(nums, x), `nums=${nums}, x=${x}`);
      }
    }
  }
});

test('1658 steps keep the visualized window and final choice consistent', () => {
  const run = solve([1, 1, 4, 2, 3], 5);
  for (const step of run.steps) {
    const view = step.complement1658View;
    assert.ok(view);
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length);
    if (view.right >= 0 && !step.final) {
      assert.equal(view.windowSum, view.nums.slice(view.left, view.right + 1).reduce((sum, value) => sum + value, 0));
    }
  }
  const final = run.steps.at(-1).complement1658View;
  assert.equal(final.answer, 2);
  assert.equal(final.bestLen, 3);
  assert.equal(final.nums.slice(final.bestLeft, final.bestRight + 1).reduce((sum, value) => sum + value, 0), final.target);
});
