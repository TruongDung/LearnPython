const assert = require('node:assert/strict');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[674];

function brute(nums) {
  let best = 0;
  for (let s = 0; s < nums.length; s++) {
    let len = 1;
    for (let i = s + 1; i < nums.length && nums[i] > nums[i - 1]; i++) len++;
    best = Math.max(best, len);
  }
  return nums.length ? best : 0;
}

test('674 matches the LeetCode examples', () => {
  assert.equal(problem.builder([1, 3, 5, 4, 7]).answer, 3);
  assert.equal(problem.builder([2, 2, 2, 2, 2]).answer, 1);
  assert.equal(problem.builder([1, 3, 5, 7]).answer, 4);
  assert.equal(problem.builder([7]).answer, 1);
  assert.equal(problem.builder([]).answer, 0);
});

test('674 trace is line-by-line and picture-first (bars, run highlight, best mark)', () => {
  const { steps, answer } = problem.builder([1, 3, 5, 4, 7]);
  assert.equal(answer, 3);
  assert.equal(steps.at(-1).final, true);
  // displayed code has 12 lines; every step points at exactly one valid line
  for (const s of steps) {
    assert.equal(s.codeLines.length, 1);
    assert.ok(s.codeLines[0] >= 1 && s.codeLines[0] <= 12, `bad code line ${s.codeLines}`);
    assert.deepEqual(s.arr, [1, 3, 5, 4, 7]);
    assert.equal(s.sub.length, 5);
  }
  // run lengths under the bars tell the story: 1,2,3 then break to 1,2
  assert.deepEqual(steps.at(-1).sub, [1, 2, 3, 1, 2]);
  // final step marks the best run [0..2] in green
  assert.deepEqual(steps.at(-1).mark, [0, 1, 2]);
  // a grow step (code line 8) highlights the whole current run
  const grow = steps.find((s) => s.codeLines[0] === 8);
  assert.ok(grow.highlight.length >= 2);
  // a break step (code line 10) exists after the 5 > 4 drop
  assert.ok(steps.some((s) => s.codeLines[0] === 10));
});

test('674 agrees with brute force on randomized arrays', () => {
  let seed = 674;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let t = 0; t < 80; t++) {
    const n = Math.floor(rnd() * 12);
    const nums = Array.from({ length: n }, () => Math.floor(rnd() * 7) - 2);
    assert.equal(problem.builder(nums).answer, brute(nums), `mismatch on ${nums}`);
  }
});
