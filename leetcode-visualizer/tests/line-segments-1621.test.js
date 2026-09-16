const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1621];

function bruteForce(n, k) {
  const memo = new Map();
  function visit(minimumStart, remaining) {
    if (remaining === 0) return 1;
    const key = `${minimumStart}:${remaining}`;
    if (memo.has(key)) return memo.get(key);
    let count = 0;
    for (let left = minimumStart; left < n - 1; left += 1) {
      for (let right = left + 1; right < n; right += 1) {
        count += visit(right, remaining - 1);
      }
    }
    memo.set(key, count);
    return count;
  }
  return visit(0, k);
}

test('1621 is registered with prefix-sum counting DP metadata', () => {
  assert.equal(problem.id, 1621);
  assert.equal(problem.slug, 'number-of-sets-of-k-non-overlapping-line-segments');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(nk)');
  assert.match(problem.code.join('\n'), /def numberOfSets\(self, n: int, k: int\) -> int/);
  assert.ok(problem.tags.some((tag) => tag.key === 'prefix-sum'));
});

test('1621 matches the official examples supported by the visualizer', () => {
  const examples = [
    [4, 2, 5],
    [3, 1, 3],
  ];
  for (const [n, k, expected] of examples) {
    const result = problem.builder([n], { k });
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).lineSegments1621View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('1621 agrees with an independent exhaustive segment-set oracle', () => {
  for (let n = 2; n <= 8; n += 1) {
    for (let k = 1; k < n; k += 1) {
      assert.equal(problem.builder([n], { k }).answer, bruteForce(n, k), `n=${n}, k=${k}`);
    }
  }
});

test('1621 trace exposes both recurrence branches and prefix aggregation', () => {
  const result = problem.builder([4], { k: 2 });
  assert.ok(result.steps.every((step) => step.lineSegments1621View));
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(result.steps.map((step) => step.lineSegments1621View.operation));
  for (const operation of ['init', 'base', 'cell', 'return']) assert.ok(operations.has(operation), operation);

  const finalCell = result.steps.find((step) => {
    const view = step.lineSegments1621View;
    return view.operation === 'cell' && view.points === 4 && view.segments === 2;
  }).lineSegments1621View;
  assert.equal(finalCell.skip, 1);
  assert.equal(finalCell.endHere, 4);
  assert.equal(finalCell.ways[4][2], 5);
  assert.deepEqual(finalCell.candidates.map((item) => item.priorWays), [0, 1, 3]);
});

test('1621 displayed Python handles both small and full-constraint examples', () => {
  const assertions = [
    'assert Solution().numberOfSets(4, 2) == 5',
    'assert Solution().numberOfSets(3, 1) == 3',
    'assert Solution().numberOfSets(30, 7) == 796297179',
    'assert Solution().numberOfSets(10, 3) == 924',
  ].join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('1621 custom renderer covers every phase in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderLineSegments1621View(step)');
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
  const result = problem.builder([4], { k: 2 });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of result.steps) {
      context.renderLineSegments1621View(step);
      assert.match(element.innerHTML, /ls1621-viz/);
      assert.match(element.innerHTML, /ls1621-grid/);
      assert.match(element.innerHTML, /ls1621-result/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('1621 validates visual inputs and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([1], { k: 1 }), /between 2 and 10/);
  assert.throws(() => problem.builder([11], { k: 1 }), /between 2 and 10/);
  assert.throws(() => problem.builder([4], { k: 0 }), /between 1 and n - 1/);
  assert.throws(() => problem.builder([4], { k: 4 }), /between 1 and n - 1/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ls1621-viz \{/);
  assert.match(css, /\.ls1621-cell\.prefix-source/);
  assert.match(css, /@container \(max-width: 470px\)/);
});
