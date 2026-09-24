const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1589];
const solve = (nums, requests) => problem.builder(nums, { requests });

function brute(nums, requests) {
  let best = -1;
  // Permute indices to keep duplicate values as independent elements.
  function permuteIndices(start, indices) {
    if (start === indices.length) {
      const arranged = indices.map((index) => nums[index]);
      const total = requests.reduce((sum, [left, right]) => {
        for (let index = left; index <= right; index++) sum += arranged[index];
        return sum;
      }, 0);
      best = Math.max(best, total);
      return;
    }
    for (let index = start; index < indices.length; index++) {
      [indices[start], indices[index]] = [indices[index], indices[start]];
      permuteIndices(start + 1, indices);
      [indices[start], indices[index]] = [indices[index], indices[start]];
    }
  }
  permuteIndices(0, nums.map((_, index) => index));
  return best;
}

test('1589 is registered with two inputs and prefix-sum/greedy tags', () => {
  assert.equal(problem.id, 1589);
  assert.equal(problem.slug, 'maximum-sum-obtained-of-any-permutation');
  assert.equal(problem.category.key, 'array');
  assert.equal(problem.extraParams[0].key, 'requests');
  assert.ok(problem.tags.some((tag) => tag.key === 'prefix-sum'));
  assert.ok(problem.tags.some((tag) => tag.key === 'greedy'));
});

test('1589 matches official examples and simple boundaries', () => {
  assert.equal(solve([1, 2, 3, 4, 5], [[1, 3], [0, 1]]).answer, 19);
  assert.equal(solve([1, 2, 3, 4, 5, 6], [[0, 1]]).answer, 11);
  assert.equal(solve([1, 2, 3, 4, 5, 10], [[0, 2], [1, 3], [1, 1]]).answer, 47);
  assert.equal(solve([7], [[0, 0]]).answer, 7);
  assert.equal(solve([0, 0, 0], [[0, 2], [1, 1]]).answer, 0);
  assert.deepEqual(problem.liveArgs([1, 2], { requests: '[[0,1]]' }), [[1, 2], [[0, 1]]]);
});

test('1589 agrees with brute-force permutations on small random cases', () => {
  let seed = 1589;
  const rand = (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  };
  for (let trial = 0; trial < 60; trial++) {
    const n = 1 + rand(6);
    const nums = Array.from({ length: n }, () => rand(9));
    const requests = Array.from({ length: 1 + rand(6) }, () => {
      const a = rand(n), b = rand(n);
      return [Math.min(a, b), Math.max(a, b)];
    });
    assert.equal(solve(nums, requests).answer, brute(nums, requests), JSON.stringify({ nums, requests }));
  }
});

test('1589 trace exposes range marks, prefix frequencies, sorting and pair products', () => {
  const run = solve([1, 2, 3, 4, 5], [[1, 3], [0, 1]]);
  assert.ok(run.steps[0].permutation1589View.cells.every((cell) => cell.frequency === null));
  assert.equal(run.steps[0].permutation1589View.sorted.length, 0);
  const phases = run.steps.map((step) => step.permutation1589View.phase);
  for (const phase of ['range-start', 'range-end', 'prefix', 'sort-values', 'sort-frequency', 'pair', 'done']) {
    assert.ok(phases.includes(phase), phase);
  }
  const lastPrefix = run.steps.filter((step) => step.permutation1589View.phase === 'prefix').at(-1);
  assert.deepEqual(lastPrefix.permutation1589View.cells.slice(0, 5).map((cell) => cell.frequency), [1, 2, 1, 1, 0]);
  const pairSteps = run.steps.filter((step) => step.permutation1589View.phase === 'pair');
  assert.deepEqual(pairSteps.map((step) => step.permutation1589View.contribution), [0, 2, 3, 4, 10]);
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps.at(-1).codeLines[0], 19);
});

test('1589 validates nums, JSON and request bounds', () => {
  assert.throws(() => solve([], [[0, 0]]), /nums/);
  assert.throws(() => solve([100001], [[0, 0]]), /nums/);
  assert.throws(() => solve([1], 'oops'), /JSON/);
  assert.throws(() => solve([1], []), /requests/);
  assert.throws(() => solve([1], [[0, 1]]), /left/);
  assert.throws(() => solve([1, 2], [[1, 0]]), /left/);
  assert.throws(() => solve([1, 2], [[0, 1, 2]]), /pairs/);
});

test('1589 caps large traces but computes the full modulo answer', () => {
  const n = 100000;
  const nums = new Array(n).fill(100000);
  const requests = new Array(n).fill(null).map(() => [0, n - 1]);
  const run = solve(nums, requests);
  const expected = Number((BigInt(n) * BigInt(n) * 100000n) % 1000000007n);
  assert.equal(run.answer, expected);
  assert.ok(run.steps.length < 130);
  assert.equal(run.steps.at(-1).permutation1589View.truncated, true);
});

test('1589 renderer handles every phase in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderPermutation1589View(step)');
  const end = source.indexOf('\nfunction renderSlidingFreqView(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '' };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of solve([1, 2, 3, 4, 5], [[1, 3], [0, 1]]).steps) {
      context.renderPermutation1589View(step);
      assert.match(element.innerHTML, /mp1589-viz/);
      assert.match(element.innerHTML, /mp1589-cells/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      if (step.final) assert.match(element.innerHTML, /19/);
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.mp1589-viz \{/);
  assert.match(css, /\.mp1589-pair\.active/);
});
