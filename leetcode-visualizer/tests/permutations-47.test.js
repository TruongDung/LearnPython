const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[47];

function oracle(nums) {
  const result = new Set();
  const visit = (path, rest) => {
    if (!rest.length) result.add(JSON.stringify(path));
    rest.forEach((value, i) => visit([...path, value], rest.filter((_, j) => j !== i)));
  };
  visit([], nums);
  return result;
}

test('47 keeps exactly the unique permutations, including repeated and negative values', () => {
  for (const nums of [[1], [1,1], [1,1,2], [2,1,2,1], [-1,0,-1], [1,2,3], [3,3,3,3]]) {
    const input = [...nums];
    const run = problem.builder(input);
    const expected = oracle(nums);
    const final = run.steps.at(-1).permutation47View;
    assert.equal(run.answer, expected.size);
    assert.deepEqual(new Set(final.saved.map(JSON.stringify)), expected);
    assert.deepEqual(input, nums);
    for (const { permutation47View: view } of run.steps) {
      assert.equal(new Set(view.path).size, view.path.length);
      assert.equal(view.used.filter(Boolean).length, view.path.length);
      view.path.forEach(i => assert.equal(view.used[i], true));
      if (view.phase === 'skip') {
        assert.equal(view.nums[view.activeIndex], view.nums[view.activeIndex - 1]);
        assert.equal(view.used[view.activeIndex - 1], false);
        assert.equal(view.used[view.activeIndex], false);
      }
    }
  }
});

test('47 permits using both equal tiles when the left tile is already in the path', () => {
  const run = problem.builder([1,1,2]);
  assert.ok(run.steps.some(({ permutation47View: v }) => v.phase === 'pick' && v.activeIndex === 1 && v.used[0]));
  assert.deepEqual(run.steps.at(-1).permutation47View.saved, [[1,1,2],[1,2,1],[2,1,1]]);
});

test('47 bounds snapshots and previews while computing the complete answer', () => {
  const run = problem.builder([1,2,3,4,5,6,7,8]);
  assert.equal(run.answer, 40320);
  assert.equal(run.steps.length, 481);
  const final = run.steps.at(-1).permutation47View;
  assert.equal(final.count, 40320);
  assert.equal(final.saved.length, 8);
  assert.equal(final.truncated, true);
  assert.ok(JSON.stringify(run).length < 1500000);
});

test('47 pictures render every phase in both languages without invalid values or modifying snapshots', () => {
  const host = { clientWidth: 260, innerHTML: '' };
  const context = { lang: 'vi', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-permutations-47.js'), 'utf8'), context);
  for (const nums of [[1,1,2], [-10,-10,0,2], [1,1,1,1,1,1,1,1]]) {
    const run = problem.builder(nums);
    const snapshot = JSON.stringify(run);
    for (const lang of ['vi','en']) for (const step of run.steps) {
      context.lang = lang;
      context.renderPermutations47View(step);
      assert.match(host.innerHTML, /<svg/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      if (step.permutation47View.phase === 'skip') assert.match(host.innerHTML, /perm47-branch skip/);
    }
    assert.equal(JSON.stringify(run), snapshot);
  }
});
