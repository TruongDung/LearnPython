const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[698];

const builder2 = problem.builder2;

test('698 approach 2 is registered with its own code and builder', () => {
  assert.equal(typeof builder2, 'function');
  assert.equal(problem.code2.length, 37);
  assert.match(problem.code2Label.vi, /Cách 2/);
  assert.match(problem.codeLabel.vi, /Cách 1/);
});

test('698 approach 2 solves the default input', () => {
  const result = builder2([4, 3, 2, 3, 5, 2, 1], { k: 4 });
  assert.equal(result.answer, true);
  assert.equal(result.steps.at(-1).final, true);
});

test('698 approach 2 agrees with approach 1 on random inputs', () => {
  let state = 777;
  const rand = (n) => { state = (state * 1664525 + 1013904223) >>> 0; return state % n; };
  for (let t = 0; t < 40; t++) {
    const n = 2 + rand(6);
    const nums = Array.from({ length: n }, () => 1 + rand(6));
    const k = 2 + rand(n - 1);
    const a1 = problem.builder(nums, { k }).answer;
    const a2 = builder2(nums, { k }).answer;
    assert.equal(a2, a1, `nums=${nums} k=${k}`);
  }
});

test('698 approach 2 displayed Python matches brute force', () => {
  const code = problem.code2.join('\n');
  const harness = `
import itertools
cases = [([4,3,2,3,5,2,1], 4, True), ([1,2,3,4], 3, False), ([2,2,2,2,2,2], 3, True), ([9,1,1,1], 2, False)]
def brute(nums, k):
    n = len(nums)
    if k > n or sum(nums) % k != 0:
        return False
    target = sum(nums) // k
    for assign in itertools.product(range(k), repeat=n):
        sums = [0] * k
        for i, g in enumerate(assign):
            sums[g] += nums[i]
        if all(s == target for s in sums):
            return True
    return False
for nums, k, exp in cases:
    got = Solution().canPartitionKSubsets(list(nums), k)
    assert got == exp, (nums, k, got, exp)
    assert got == brute(nums, k), (nums, k, got)
print("py-ok")
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}\n`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /py-ok/);
});

test('698 approach 2 trace highlights real code lines', () => {
  const result = builder2([4, 3, 2, 3, 5, 2, 1], { k: 4 });
  assert.ok(result.steps.length > 5, `steps=${result.steps.length}`);
  for (const s of result.steps) {
    assert.ok(s.codeLines.length > 0, `step missing codeLines: ${s.title.vi}`);
    for (const l of s.codeLines) assert.ok(l >= 1 && l <= 37, `bad line ${l}`);
  }
});

test('698 approach 2 shows symmetry pruning (line 25)', () => {
  const result = builder2([6, 6, 6, 6, 6, 6], { k: 4 });
  assert.equal(result.answer, false);
  const skips = result.steps.filter((s) => s.advancedBitmaskView.phase === 'skip');
  assert.ok(skips.length >= 1, 'expected at least one symmetry-pruning step');
  assert.ok(skips.every((s) => s.codeLines.includes(25)), 'pruning steps must highlight line 25');
});

test('698 approach 2 shows backtracking (line 33)', () => {
  const result = builder2([3, 3, 3, 3, 2, 2, 2, 2], { k: 2 });
  assert.equal(result.answer, true);
  const backs = result.steps.filter((s) => s.advancedBitmaskView.phase === 'backtrack');
  assert.ok(backs.length >= 1, 'expected at least one backtrack step');
  assert.ok(backs.every((s) => s.codeLines.includes(33)), 'backtrack steps must highlight line 33');
});

test('698 approach 2 handles early exits', () => {
  const badTotal = builder2([1, 2, 3, 4], { k: 3 });
  assert.equal(badTotal.answer, false);
  assert.ok(badTotal.steps[0].codeLines.includes(6));
  const tooBig = builder2([9, 1, 1, 1], { k: 2 });
  assert.equal(tooBig.answer, false);
  assert.ok(tooBig.steps[0].codeLines.includes(12));
});

test('698 approach 2 rejects invalid input', () => {
  assert.throws(() => builder2([0, 1, 2], { k: 2 }), /positive/);
  assert.throws(() => builder2([1, 2], { k: 5 }), /integer k/);
});
