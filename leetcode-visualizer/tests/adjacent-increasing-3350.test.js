const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3350];
const solve = (nums) => problem.builder(nums);

function bruteForce(nums) {
  let answer = 0;
  for (let k = 1; 2 * k <= nums.length; k++) {
    for (let start = 0; start + 2 * k <= nums.length; start++) {
      let valid = true;
      for (let offset = 1; offset < k; offset++) {
        if (nums[start + offset] <= nums[start + offset - 1]
          || nums[start + k + offset] <= nums[start + k + offset - 1]) {
          valid = false;
          break;
        }
      }
      if (valid) answer = k;
    }
  }
  return answer;
}

function validPair(nums, pair) {
  if (!pair || pair.k < 1 || pair.rightStart !== pair.leftStart + pair.k
    || pair.leftStart < 0 || pair.rightStart + pair.k > nums.length) return false;
  for (const start of [pair.leftStart, pair.rightStart]) {
    for (let index = start + 1; index < start + pair.k; index++) {
      if (nums[index] <= nums[index - 1]) return false;
    }
  }
  return true;
}

test('3350 is registered as a one-pass array lesson', () => {
  assert.equal(problem.id, 3350);
  assert.equal(problem.slug, 'adjacent-increasing-subarrays-detection-ii');
  assert.equal(problem.category.key, 'array');
  assert.ok(problem.tags.some((tag) => tag.key === 'greedy'));
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(1)');
});

test('3350 matches published examples and strict-increase boundaries', () => {
  assert.equal(solve([2, 5, 7, 8, 9, 2, 3, 4, 3, 1]).answer, 3);
  assert.equal(solve([1, 2, 3, 4, 4, 4, 4, 5, 6, 7]).answer, 2);
  assert.equal(solve([1, 2, 3, 4, 5, 6]).answer, 3);
  assert.equal(solve([1, 1, 1, 1]).answer, 1);
  assert.equal(solve([2, 1]).answer, 1);
  assert.equal(solve([-4, -2, 0, -5, -3, -1]).answer, 3);
  assert.equal(solve([1, 2, 3, 0, 1, 2, 3, 4]).answer, 3);
});

test('3350 agrees with exhaustive pair search on deterministic random inputs', () => {
  let seed = 3350;
  const rand = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 220; trial++) {
    const nums = Array.from({ length: 2 + rand(12) }, () => rand(11) - 5);
    const run = solve(nums);
    assert.equal(run.answer, bruteForce(nums), `nums=${nums}`);
    assert.equal(run.witness.k, run.answer);
    assert.ok(validPair(nums, run.witness), `witness=${JSON.stringify(run.witness)}, nums=${nums}`);
  }
});

test('3350 trace shows both candidate mechanisms and valid best pairs', () => {
  const nums = [2, 5, 7, 8, 9, 2, 3, 4, 3, 1];
  const run = solve(nums);
  assert.ok(run.steps.some((step) => step.adjacentRuns3350View.phase === 'inside'));
  assert.ok(run.steps.some((step) => step.adjacentRuns3350View.phase === 'across'));
  assert.ok(run.steps.some((step) => step.adjacentRuns3350View.phase === 'close'));
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length);
    const view = step.adjacentRuns3350View;
    assert.ok(view);
    if (view.candidate) assert.ok(validPair(nums, view.candidate));
    if (view.witness) {
      assert.ok(validPair(nums, view.witness));
      assert.equal(view.witness.k, view.best);
    }
    if (view.phase === 'inside') assert.equal(view.inside, Math.floor(view.current / 2));
    if (view.phase === 'across') assert.equal(view.across, Math.min(view.previous, view.current));
  }
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.equal(final.adjacentRuns3350View.best, 3);
  assert.deepEqual(final.adjacentRuns3350View.witness, run.witness);
});

test('3350 rejects invalid lengths and out-of-range values', () => {
  assert.throws(() => solve([]));
  assert.throws(() => solve([1]));
  assert.throws(() => solve([1, 1.5]));
  assert.throws(() => solve([1, 1000000001]));
  assert.throws(() => solve([1, NaN]));
});

test('3350 caps long traces but still computes the whole array', () => {
  const nums = Array.from({ length: 300 }, (_, index) => index);
  const run = solve(nums);
  assert.equal(run.answer, 150);
  assert.ok(run.steps.length <= 701);
  assert.equal(run.steps.at(-1).adjacentRuns3350View.omitted, true);
  assert.ok(validPair(nums, run.witness));
});

test('3350 renderer handles every step in both languages with scoped styles', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderAdjacentRuns3350View(step)');
  const end = source.indexOf('\nfunction renderSlidingFreqView(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of solve([2, 5, 7, 8, 9, 2, 3, 4, 3, 1]).steps) {
      context.renderAdjacentRuns3350View(step);
      assert.match(element.innerHTML, /ai3350-viz/);
      assert.match(element.innerHTML, /ai3350-array/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ai3350-viz \{/);
  assert.match(css, /\.ai3350-cell\.focus-left/);
  assert.match(css, /@container \(max-width: 590px\)/);
});
