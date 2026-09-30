const { readFrontendJavaScript } = require('./helpers/frontend-source');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[2218];

function oracle(piles, k, index = 0, memo = new Map()) {
  if (index === piles.length) return k === 0 ? 0 : Number.NEGATIVE_INFINITY;
  const key = `${index},${k}`;
  if (memo.has(key)) return memo.get(key);
  let best = Number.NEGATIVE_INFINITY;
  let prefix = 0;
  for (let take = 0; take <= Math.min(piles[index].length, k); take += 1) {
    if (take > 0) prefix += piles[index][take - 1];
    const suffix = oracle(piles, k - take, index + 1, memo);
    if (Number.isFinite(suffix)) best = Math.max(best, prefix + suffix);
  }
  memo.set(key, best);
  return best;
}

test('2218 is registered for true line-by-line debugging', () => {
  assert.equal(problem.id, 2218);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(typeof problem.builder2, 'function');
  assert.ok(Array.isArray(problem.code2));
  assert.equal(problem.extraParams.find((param) => param.key === 'approach').options.length, 2);
  assert.deepEqual(problem.liveArgs('[[1,100,3],[7,8,9]]', { k: 2 }), [[[1, 100, 3], [7, 8, 9]], 2]);
});

test('2218 matches the published examples', () => {
  const cases = [
    [[[1, 100, 3], [7, 8, 9]], 2, 101],
    [[[100], [100], [100], [100], [100], [100], [1, 1, 1, 1, 1, 1, 700]], 7, 706],
  ];
  for (const [piles, k, expected] of cases) {
    const run = problem.builder(piles, { k });
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).coins2218View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.selectedCounts.reduce((sum, take) => sum + take, 0), k);
  }
});

test('2218 agrees with an independent exhaustive oracle', () => {
  let seed = 2218;
  for (let sample = 0; sample < 160; sample += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const pileCount = 1 + seed % 5;
    const piles = [];
    for (let i = 0; i < pileCount; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const length = 1 + seed % 4;
      const pile = [];
      for (let j = 0; j < length; j += 1) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        pile.push(1 + seed % 30);
      }
      piles.push(pile);
    }
    const total = piles.reduce((sum, pile) => sum + pile.length, 0);
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const k = 1 + seed % Math.min(12, total);
    assert.equal(problem.builder(piles, { k }).answer, oracle(piles, k), JSON.stringify({ piles, k }));
    assert.equal(problem.builder2(piles, { k, approach: 2 }).answer, oracle(piles, k), JSON.stringify({ piles, k, approach: 2 }));
  }
});

test('2218 approach 2 uses separate O(k) snapshots and exact-count states', () => {
  const run = problem.builder2([[1, 100, 3], [7, 8, 9]], { k: 2, approach: 2 });
  assert.equal(run.answer, 101);
  assert.equal(run.steps.at(-1).coins2218View.answer, 101);
  assert.ok(run.steps.every((step) => step.codeBlock === 2));
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.coins2218View.approach === 2));

  const lines = [...new Set(run.steps.map((step) => step.codeLines[0]))].sort((a, b) => a - b);
  assert.deepEqual(lines, [1, 2, 3, 4, 5, 7, 8, 10, 11, 13, 15, 16, 17, 18, 23, 25]);

  const copy = run.steps.find((step) => step.coins2218View.operation === 'copy-dp');
  assert.deepEqual(copy.coins2218View.dpRowLabels, ['dp (previous)', 'new_dp']);
  assert.equal(copy.coins2218View.dp.length, 2);

  const unreachable = run.steps.find((step) => step.coins2218View.operation === 'unreachable-source');
  assert.ok(unreachable);
  assert.equal(unreachable.codeLines[0], 17);
  assert.equal(unreachable.coins2218View.reachable, false);

  assert.ok(run.steps.filter((step) => step.codeLines[0] === 18)
    .every((step) => step.coins2218View.reachable === true));
});

test('2218 trace executes exactly one source line per step', () => {
  const run = problem.builder([[1, 100, 3], [7, 8, 9]], { k: 2 });
  assert.ok(run.steps.length > 40);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => Number.isInteger(step.codeLines[0]) && step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.deepEqual([...new Set(run.steps.map((step) => step.codeLines[0]))].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);

  const operations = new Set(run.steps.map((step) => step.coins2218View.operation));
  for (const operation of [
    'bind-class', 'enter-method', 'set-n', 'allocate-dp', 'seed-base-case',
    'select-pile', 'init-prefix', 'append-prefix', 'select-used', 'select-take',
    'reachable-source', 'unreachable-source', 'update-cell', 'keep-cell', 'return-answer',
  ]) {
    assert.ok(operations.has(operation), operation);
  }

  assert.ok(run.steps.filter((step) => step.codeLines[0] === 12)
    .every((step) => step.coins2218View.reachable === true));
});

test('2218 displayed Python agrees with the independent oracle', () => {
  const cases = [
    [[[1, 100, 3], [7, 8, 9]], 2],
    [[[10], [20, 30], [40, 50, 60]], 4],
    [[[5, 4, 3]], 2],
  ];
  const assertions = cases.map(([piles, k]) => (
    `assert Solution().maxValueOfCoins(${JSON.stringify(piles)}, ${k}) == ${oracle(piles, k)}`
  )).join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);

  const python2 = spawnSync('python3', ['-c', `${problem.code2.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python2.status, 0, python2.stderr);
});

test('2218 renderer handles every line-by-line state in both languages', () => {
  const source = readFrontendJavaScript();
  const start = source.indexOf('function requestedVizEsc(value)');
  const end = source.indexOf('// ─── #9006:', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const runs = [
    problem.builder([[1, 100, 3], [7, 8, 9]], { k: 2 }),
    problem.builder2([[1, 100, 3], [7, 8, 9]], { k: 2, approach: 2 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderCoins2218View(step);
        assert.match(element.innerHTML, /requested-viz/);
        assert.match(element.innerHTML, /rv-dp-table/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('2218 validates piles and k', () => {
  assert.throws(() => problem.builder('[]', { k: 1 }));
  assert.throws(() => problem.builder('[[1],[]]', { k: 1 }));
  assert.throws(() => problem.builder('[[0]]', { k: 1 }));
  assert.throws(() => problem.builder('[[1,2]]', { k: 0 }));
  assert.throws(() => problem.builder('[[1,2]]', { k: 3 }));
  assert.throws(() => problem.builder2('[[1,2]]', { k: 3, approach: 2 }));
});
