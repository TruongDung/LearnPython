const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1223];

function oracle(n, rollMax) {
  let count = 0;
  function visit(length, lastFace, streak) {
    if (length === n) {
      count += 1;
      return;
    }
    for (let face = 0; face < 6; face += 1) {
      const nextStreak = face === lastFace ? streak + 1 : 1;
      if (nextStreak <= rollMax[face]) visit(length + 1, face, nextStreak);
    }
  }
  visit(0, -1, 0);
  return count;
}

test('1223 is registered with state-DP metadata', () => {
  assert.equal(problem.id, 1223);
  assert.equal(problem.slug, 'dice-roll-simulation');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n · 6 · max(rollMax))');
  assert.match(problem.code.join('\n'), /dp\[face\]\[streak\]/);
});

test('1223 matches the official examples', () => {
  const cases = [
    [2, [1, 1, 2, 2, 2, 3], 34],
    [2, [1, 1, 1, 1, 1, 1], 30],
    [3, [1, 1, 1, 2, 2, 3], 181],
  ];
  for (const [n, rollMax, expected] of cases) {
    const result = problem.builder(rollMax, { n });
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).diceRoll1223View.total, expected);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('1223 agrees with an independent brute-force oracle', () => {
  const limits = [
    [1, 1, 1, 1, 1, 1],
    [1, 2, 1, 2, 1, 2],
    [2, 2, 2, 2, 2, 2],
    [1, 3, 2, 1, 3, 2],
  ];
  for (let n = 1; n <= 5; n += 1) {
    for (const rollMax of limits) {
      assert.equal(problem.builder(rollMax, { n }).answer, oracle(n, rollMax), `${n}: ${rollMax}`);
    }
  }
});

test('1223 trace exposes switch and repeat transitions', () => {
  const result = problem.builder([1, 1, 2, 2, 2, 3], { n: 3 });
  assert.ok(result.steps.every((step) => step.diceRoll1223View));
  const faceSix = result.steps.find((step) => step.diceRoll1223View.phase === 'face'
    && step.diceRoll1223View.currentRoll === 2
    && step.diceRoll1223View.currentFace === 5);
  assert.ok(faceSix);
  assert.equal(faceSix.diceRoll1223View.switchWays, 5);
  assert.deepEqual(faceSix.diceRoll1223View.repeatWays.map((item) => item.ways), [1, 0]);
  assert.equal(faceSix.diceRoll1223View.dp[5][1], 5);
  assert.equal(faceSix.diceRoll1223View.dp[5][2], 1);
  assert.equal(result.steps.filter((step) => step.diceRoll1223View.phase === 'face').length, 12);
});

test('1223 displayed Python agrees with the visualization', () => {
  const assertions = [
    'assert Solution().dieSimulator(2, [1, 1, 2, 2, 2, 3]) == 34',
    'assert Solution().dieSimulator(2, [1, 1, 1, 1, 1, 1]) == 30',
    'assert Solution().dieSimulator(3, [1, 1, 1, 2, 2, 3]) == 181',
  ].join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('1223 custom renderer covers all phases in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderDiceRoll1223View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const result = problem.builder([1, 1, 2, 2, 2, 3], { n: 3 });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of result.steps) {
      context.renderDiceRoll1223View(step);
      assert.match(element.innerHTML, /dr1223-viz/);
      assert.match(element.innerHTML, /dr1223-table/);
      assert.match(element.innerHTML, /dr1223-result/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('1223 validates inputs and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([1, 1, 1], { n: 2 }), /exactly six/);
  assert.throws(() => problem.builder([1, 1, 1, 1, 1, 16], { n: 2 }), /between 1 and 15/);
  assert.throws(() => problem.builder([1, 1, 1, 1, 1, 1], { n: 13 }), /between 1 and 12/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.dr1223-viz \{/);
  assert.match(css, /\.dr1223-cell\.blocked/);
  assert.match(css, /@container \(max-width: 430px\)/);
});
