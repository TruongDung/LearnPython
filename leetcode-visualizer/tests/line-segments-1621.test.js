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

test('1621 is registered with DP and combinatorial approaches', () => {
  assert.equal(problem.id, 1621);
  assert.equal(problem.slug, 'number-of-sets-of-k-non-overlapping-line-segments');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(nk) / O(k)');
  assert.match(problem.code.join('\n'), /def numberOfSets\(self, n: int, k: int\) -> int/);
  assert.match(problem.code2.join('\n'), /math\.comb\(total_slots, dividers\)/);
  assert.ok(problem.extraParams.some((param) => param.key === 'approach'));
  assert.ok(problem.tags.some((tag) => tag.key === 'prefix-sum'));
});

test('1621 matches the official examples supported by the visualizer', () => {
  const examples = [
    [4, 2, 5],
    [3, 1, 3],
  ];
  for (const [n, k, expected] of examples) {
    for (const approach of [1, 2]) {
      const result = problem.builder([n], { k, approach });
      assert.equal(result.answer, expected);
      assert.equal(result.steps.at(-1).lineSegments1621View.answer, expected);
      assert.equal(result.steps.at(-1).final, true);
    }
  }
});

test('1621 agrees with an independent exhaustive segment-set oracle', () => {
  for (let n = 2; n <= 8; n += 1) {
    for (let k = 1; k < n; k += 1) {
      const expected = bruteForce(n, k);
      assert.equal(problem.builder([n], { k, approach: 1 }).answer, expected, `DP n=${n}, k=${k}`);
      assert.equal(problem.builder([n], { k, approach: 2 }).answer, expected, `combination n=${n}, k=${k}`);
    }
  }
});

test('1621 DP trace advances one source/read/write line at a time', () => {
  const result = problem.builder([4], { k: 2 });
  assert.ok(result.steps.every((step) => step.lineSegments1621View));
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(result.steps.map((step) => step.lineSegments1621View.operation));
  for (const operation of [
    'init',
    'base-ways',
    'base-prefix',
    'read-skip',
    'read-prefix',
    'write-ways',
    'write-prefix',
    'return',
  ]) assert.ok(operations.has(operation), operation);

  const cellSteps = result.steps.filter((step) => {
    const view = step.lineSegments1621View;
    return view.points === 4 && view.segments === 2 && view.phase === 'fill';
  });
  assert.deepEqual(cellSteps.map((step) => step.codeLines[0]), [11, 12, 13, 14]);
  assert.deepEqual(cellSteps.map((step) => step.lineSegments1621View.operation), [
    'read-skip',
    'read-prefix',
    'write-ways',
    'write-prefix',
  ]);

  const finalCell = cellSteps[2].lineSegments1621View;
  assert.equal(finalCell.skip, 1);
  assert.equal(finalCell.endHere, 4);
  assert.equal(finalCell.ways[4][2], 5);
  assert.equal(finalCell.prefixComputed[4][2], false);
  assert.equal(cellSteps[3].lineSegments1621View.prefixComputed[4][2], true);
  assert.deepEqual(finalCell.candidates.map((item) => item.priorWays), [0, 1, 3]);
});

test('1621 combinatorial trace maps every derived quantity to one code line', () => {
  const result = problem.builder([4], { k: 2, approach: 2 });
  assert.equal(result.steps.length, 7);
  assert.ok(result.steps.every((step) => step.codeBlock === 2));
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [6, 7, 8, 9, 10, 11, 12]);
  assert.deepEqual(result.steps.map((step) => step.lineSegments1621View.operation), [
    'distance',
    'mandatory',
    'remaining',
    'variables',
    'dividers',
    'total-slots',
    'return',
  ]);
  const view = result.steps.at(-1).lineSegments1621View;
  assert.equal(view.totalDistance, 3);
  assert.equal(view.remaining, 1);
  assert.equal(view.variables, 5);
  assert.equal(view.bars, 4);
  assert.equal(view.totalSlots, 5);
  assert.equal(view.answer, 5);
});

test('1621 displayed Python approaches handle small and full-constraint examples', () => {
  const assertions = [
    'assert Solution().numberOfSets(4, 2) == 5',
    'assert Solution().numberOfSets(3, 1) == 3',
    'assert Solution().numberOfSets(30, 7) == 796297179',
    'assert Solution().numberOfSets(10, 3) == 924',
  ].join('\n');
  for (const code of [problem.code, problem.code2]) {
    const python = spawnSync('python3', ['-c', `${code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
    assert.equal(python.status, 0, python.stderr);
  }
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
  const results = [
    problem.builder([4], { k: 2, approach: 1 }),
    problem.builder([4], { k: 2, approach: 2 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const result of results) {
      for (const step of result.steps) {
        context.renderLineSegments1621View(step);
        assert.match(element.innerHTML, /ls1621-viz/);
        assert.match(element.innerHTML, /ls1621-result/);
        if (step.lineSegments1621View.approach === 2) {
          assert.match(element.innerHTML, /ls1621-comb-(parts|stars)/);
        } else {
          assert.match(element.innerHTML, /ls1621-grid/);
        }
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('1621 validates visual inputs and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([1], { k: 1 }), /between 2 and 10/);
  assert.throws(() => problem.builder([11], { k: 1 }), /between 2 and 10/);
  assert.throws(() => problem.builder([4], { k: 0 }), /between 1 and n - 1/);
  assert.throws(() => problem.builder([4], { k: 4 }), /between 1 and n - 1/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;
  assert.equal(openBraces, closeBraces, 'the stylesheet must not trap 1621 inside an earlier at-rule');
  assert.match(css, /\.ls1621-viz \{/);
  assert.match(css, /\.ls1621-cell\.prefix-source/);
  assert.match(css, /\.ls1621-comb-stars/);
  assert.match(css, /@container \(max-width: 470px\)/);
});
