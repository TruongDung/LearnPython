const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1248];

const cases = [
  [[1, 1, 2, 1, 1], 3, 2],
  [[2, 4, 6], 1, 0],
  [[2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2, 16],
  [[1, 1, 1, 1], 1, 4],
  [[2, 1, 2, 1, 2], 1, 8],
];

test('1248 returns the correct nice-subarray count', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  for (const [nums, k, expected] of cases) {
    const result = problem.builder(nums, { k });
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).nice1248View.ans, expected);
    assert.equal(result.steps.at(-1).final, true);
    assert.ok(result.steps.every(step => step.nice1248View));
  }
  assert.throws(() => problem.builder([1], { k: 0 }), /positive integer/);
  assert.throws(() => problem.builder(Array(21).fill(1), { k: 1 }), /at most 20/);
});

test('1248 trace identifies the exact new subarrays in the default example', () => {
  const result = problem.builder([1, 1, 2, 1, 1], { k: 3 });
  const countSteps = result.steps.filter(step => step.nice1248View.event === 'count');
  assert.equal(countSteps.length, 5);
  assert.deepEqual(countSteps[3].nice1248View.matchingPositions, [-1]);
  assert.deepEqual(countSteps[3].nice1248View.newSubarrays.map(({ start, end }) => [start, end]), [[0, 3]]);
  assert.deepEqual(countSteps[4].nice1248View.matchingPositions, [0]);
  assert.deepEqual(countSteps[4].nice1248View.newSubarrays.map(({ start, end }) => [start, end]), [[1, 4]]);
});

test('1248 stores duplicate prefix positions so even values create multiple starts', () => {
  const result = problem.builder([2, 2, 1], { k: 1 });
  const finalCount = result.steps.filter(step => step.nice1248View.event === 'count').at(-1).nice1248View;
  assert.deepEqual(finalCount.matchingPositions, [-1, 0, 1]);
  assert.deepEqual(finalCount.newSubarrays.map(item => item.start), [0, 1, 2]);
  assert.equal(finalCount.added, 3);
});

test('1248 displayed Python agrees with the visualization answers', () => {
  const assertions = cases.map(([nums, k, expected]) => (
    `assert Solution().numberOfSubarrays(${JSON.stringify(nums)}, ${k}) == ${expected}`
  )).join('\n');
  const python = spawnSync('python', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('1248 custom renderer covers every event in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderNice1248View(step)');
  const end = source.indexOf('\nfunction renderExactK992View(step)', start);
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
    for (const step of problem.builder([1, 1, 2, 1, 1], { k: 3 }).steps) {
      context.renderNice1248View(step);
      assert.match(element.innerHTML, /nice1248-viz/);
      assert.match(element.innerHTML, /nice1248-prefixes/);
      assert.match(element.innerHTML, /nice1248-ledger/);
      assert.match(element.innerHTML, /nice1248-results/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('1248 remains line-by-line and has scoped responsive CSS', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function shouldUseLineByLineDebug()');
  const end = source.indexOf('\n// ---- Run algorithm ----', start);
  const context = {
    problemData: { id: 1248, debugMode: problem.debugMode },
    debugBreakpoints: new Set(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const expanded = context.expandStepsLineByLine(problem.builder([1, 1, 2, 1, 1], { k: 3 }).steps);
  assert.ok(expanded.every(step => !step.codeLines || step.codeLines.length <= 1));

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.nice1248-viz \{/);
  assert.match(css, /\.nice1248-prefix\.match \{/);
  assert.match(css, /\.nice1248-subarray \{/);
  assert.match(css, /@container \(max-width: 430px\)/);
});
