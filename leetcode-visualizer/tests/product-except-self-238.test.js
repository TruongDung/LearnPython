const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[238];

function bruteProductExceptSelf(nums) {
  return nums.map((_, excluded) => {
    const product = nums.reduce(
      (running, value, index) => index === excluded ? running : running * value,
      1,
    );
    return product === 0 ? 0 : product;
  });
}

test('238 keeps the O(n), no-division solution and has a dedicated visualization', () => {
  assert.equal(problem.id, 238);
  assert.equal(problem.slug, 'product-of-array-except-self');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(1)');
  assert.doesNotMatch(problem.code.join('\n'), /\/\/|\/ nums|divide/i);

  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every(step => step.productExcept238View));
});

test('238 handles standard input, negatives, one zero, and multiple zeros', () => {
  const cases = [
    [[1, 2, 3, 4], [24, 12, 8, 6]],
    [[-1, 1, 0, -3, 3], [0, 0, 9, 0, 0]],
    [[0, 0], [0, 0]],
    [[2, -3, 4], [-12, 8, -6]],
    [[5], [1]],
  ];

  for (const [nums, expected] of cases) {
    const frozen = Object.freeze([...nums]);
    const run = problem.builder(frozen);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(frozen, nums);
    assert.deepEqual(run.steps.at(-1).productExcept238View.answer, expected);
  }
});

test('238 agrees with a brute-force oracle on deterministic random arrays', () => {
  let seed = 238;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };

  for (let caseIndex = 0; caseIndex < 180; caseIndex += 1) {
    const length = 1 + random(10);
    const nums = Array.from({ length }, () => random(7) - 3);
    assert.deepEqual(problem.builder(nums).answer, bruteProductExceptSelf(nums), JSON.stringify(nums));
  }
});

test('238 trace makes the prefix and suffix invariants explicit', () => {
  const nums = [1, 2, 3, 4];
  const run = problem.builder(nums);
  const events = run.steps.map(step => step.productExcept238View.event);
  assert.deepEqual(events, [
    'intro',
    'prefix-start',
    'prefix-cell', 'prefix-cell', 'prefix-cell', 'prefix-cell',
    'suffix-start',
    'suffix-cell', 'suffix-cell', 'suffix-cell', 'suffix-cell',
    'done',
  ]);

  const prefixSteps = run.steps.filter(step => step.productExcept238View.event === 'prefix-cell');
  for (const step of prefixSteps) {
    const view = step.productExcept238View;
    const expected = nums.slice(0, view.currentIndex).reduce((product, value) => product * value, 1);
    assert.equal(view.leftProducts[view.currentIndex], expected);
  }

  const suffixSteps = run.steps.filter(step => step.productExcept238View.event === 'suffix-cell');
  for (const step of suffixSteps) {
    const view = step.productExcept238View;
    const expected = nums.slice(view.currentIndex + 1).reduce((product, value) => product * value, 1);
    assert.equal(view.rightProducts[view.currentIndex], expected);
    assert.equal(view.answer[view.currentIndex], view.leftProducts[view.currentIndex] * expected);
  }

  for (const step of run.steps) {
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
});

test('238 validates the visualization input limit', () => {
  assert.throws(() => problem.builder([]), /non-empty array/);
  assert.throws(() => problem.builder(Array(13).fill(1)), /at most 12/);
  assert.throws(() => problem.builder([1, 2.5]), /integers/);
});

test('238 custom renderer handles every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderProductExcept238View(step)');
  const end = script.indexOf('\nfunction renderPourWater755View(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [
    problem.builder([1, 2, 3, 4]),
    problem.builder([-1, 1, 0, -3, 3]),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderProductExcept238View(step);
        assert.match(element.innerHTML, /pes238-viz/);
        assert.match(element.innerHTML, /pes238-factors/);
        assert.match(element.innerHTML, /pes238-cards-wrap/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
