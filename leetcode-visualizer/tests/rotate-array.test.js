const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[189];

const cases = [
  { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 },
  { nums: [-1, -100, 3, 99], k: 2 },
  { nums: [9], k: 100000 },
  { nums: [4, 4, -2, 4], k: 0 },
  { nums: [4, 4, -2, 4], k: 8 },
  { nums: [1, 2, 3], k: 100000 },
  { nums: [-2147483648, 2147483647, 0, 0], k: 1 },
];
for (let n = 2; n <= 12; n++) for (const k of [1, n - 1, n, n + 1]) {
  cases.push({ nums: Array.from({ length: n }, (_, i) => (i % 4) - 2), k });
}
function expected(nums, k) {
  const answer = Array(nums.length);
  nums.forEach((value, i) => { answer[(i + k) % nums.length] = value; });
  return answer;
}

test('189 three reversals match independent index relocation, including zero and large k', () => {
  for (const { nums, k } of cases) {
    const result = problem.builder(Object.freeze([...nums]), { k });
    assert.deepEqual(result.answer, expected(nums, k));
    assert.deepEqual(result.original, nums);
    assert.deepEqual(result.steps[0].rotateArray189View.nums, nums);
    assert.equal(result.steps.at(-1).final, true);
    if (k % nums.length === 0) assert.ok(result.steps.every(step => step.rotateArray189View.event !== 'swap'));
  }
});

test('189 snapshots show precisely one valid pointer swap and retain duplicate element identities', () => {
  for (const { nums, k } of cases) {
    const result = problem.builder(nums, { k });
    for (let i = 0; i < result.steps.length; i++) {
      const step = result.steps[i], view = step.rotateArray189View;
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
      assert.deepEqual(view.ids.map(id => nums[id]), view.nums);
      if (view.event !== 'swap') continue;
      const prior = result.steps[i - 1].rotateArray189View, next = [...prior.nums];
      assert.equal(prior.event, 'check');
      assert.ok(view.lo < view.hi && view.lo >= view.range[0] && view.hi <= view.range[1]);
      [next[view.lo], next[view.hi]] = [next[view.hi], next[view.lo]];
      assert.deepEqual(view.nums, next);
      assert.deepEqual(view.before, [prior.nums[view.lo], prior.nums[view.hi]]);
      assert.deepEqual(step.codeLines, [9]);
    }
    result.steps.at(-1).rotateArray189View.ids.forEach((id, i) => assert.equal(i, (id + k) % nums.length));
  }
});

test('189 Python mutates the original list in place and returns None', () => {
  const payload = cases.map(({ nums, k }) => ({ args: problem.liveArgs(nums, { k }), expected: expected(nums, k) }));
  const code = problem.code.join('\n') + `
import json, sys
for case in json.load(sys.stdin):
    nums, k = case['args']
    alias = nums
    result = Solution().rotate(nums, k)
    assert result is None
    assert alias is nums and alias == case['expected'], (nums, case)
`;
  const result = spawnSync('python', ['-c', code], { input: JSON.stringify(payload), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(problem.liveArgs([1, 2, 3], { k: 8 }), [[1, 2, 3], 8]);
});

test('189 visualization and live code validate numbers and k consistently', () => {
  for (const nums of [[], [1.5], [NaN], [null], [true], [2147483648], [-2147483649], Array(25).fill(1), '', '1,,2', '1,no,2']) {
    assert.throws(() => problem.builder(nums, { k: 1 }));
    assert.throws(() => problem.liveArgs(nums, { k: 1 }));
  }
  for (const k of [-1, 0.5, NaN, null, 100001]) assert.throws(() => problem.builder([1, 2, 3], { k }));
});

test('189 renders all reversal phases, pointer crossings, and no-op rotations in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderRotateArray189View(step)');
  const end = source.indexOf('\nfunction renderRotatedSearchView', start);
  const element = {}, context = { lang: 'en', $: () => element, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const lang of ['en', 'vi']) {
    context.lang = lang;
    for (const { nums, k } of cases.slice(0, 7)) for (const step of problem.builder(nums, { k }).steps) {
      context.renderRotateArray189View(step);
      assert.match(element.innerHTML, /ra189-array/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((element.innerHTML.match(/role="listitem"/g) || []).length, nums.length);
    }
  }
});
