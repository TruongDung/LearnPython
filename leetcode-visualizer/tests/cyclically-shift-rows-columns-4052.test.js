const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4052];

function oracle(grid, rowShift, colShift) {
  const n = grid.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      const shiftedCol = (col - rowShift[row] + n) % n;
      const shiftedRow = (row - colShift[shiftedCol] + n) % n;
      result[shiftedRow][shiftedCol] = grid[row][col];
    }
  }
  return result;
}

test('4052 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4052);
  assert.equal(problem.slug, 'cyclically-shift-rows-and-columns');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n²)');
  assert.match(problem.code.join('\n'), /def cyclicShift\(self, n, grid, rowShift, colShift\)/);
});

test('4052 matches both official examples', () => {
  const cases = [
    ['1,2;3,4', '1,0', '0,1', [[2, 4], [3, 1]]],
    ['1,2,3;4,5,6;7,8,9', '1,2,0', '2,2,1', [[7, 8, 5], [2, 3, 9], [6, 4, 1]]],
  ];
  for (const [grid, rowShift, colShift, expected] of cases) {
    const built = problem.builder(grid, { rowShift, colShift });
    assert.deepEqual(built.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
    assert.deepEqual(built.steps.at(-1).cyclicShift4052View.result, expected);
  }
});

test('4052 agrees with an independent direct-mapping oracle', () => {
  let seed = 4052;
  for (let n = 1; n <= 6; n += 1) {
    for (let sample = 0; sample < 20; sample += 1) {
      const next = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed;
      };
      const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => next() % 100 + 1));
      const rowShift = Array.from({ length: n }, () => next() % n);
      const colShift = Array.from({ length: n }, () => next() % n);
      const input = grid.map((row) => row.join(',')).join(';');
      assert.deepEqual(
        problem.builder(input, { rowShift: rowShift.join(','), colShift: colShift.join(',') }).answer,
        oracle(grid, rowShift, colShift),
      );
    }
  }
});

test('4052 trace keeps row and column phases separate', () => {
  const built = problem.builder('1,2,3;4,5,6;7,8,9', { rowShift: '1,2,0', colShift: '2,2,1' });
  assert.equal(built.steps.length, 8);
  assert.ok(built.steps.every((step) => step.cyclicShift4052View));
  const rowSteps = built.steps.filter((step) => step.cyclicShift4052View.phase === 'rows');
  const colSteps = built.steps.filter((step) => step.cyclicShift4052View.phase === 'columns');
  assert.equal(rowSteps.length, 3);
  assert.equal(colSteps.length, 3);
  assert.deepEqual(rowSteps.at(-1).cyclicShift4052View.afterRows, [[2, 3, 1], [6, 4, 5], [7, 8, 9]]);
  assert.deepEqual(colSteps[0].cyclicShift4052View.mappings.map((item) => item.to), [1, 2, 0]);
});

test('4052 displayed Python agrees with the visualization', () => {
  const assertions = [
    'assert Solution().cyclicShift(2, [[1,2],[3,4]], [1,0], [0,1]) == [[2,4],[3,1]]',
    'assert Solution().cyclicShift(3, [[1,2,3],[4,5,6],[7,8,9]], [1,2,0], [2,2,1]) == [[7,8,5],[2,3,9],[6,4,1]]',
  ].join('\n');
  const python = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('4052 custom renderer handles every phase in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderCyclicShift4052View(step)');
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
  const built = problem.builder('1,2,3;4,5,6;7,8,9', { rowShift: '1,2,0', colShift: '2,2,1' });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of built.steps) {
      context.renderCyclicShift4052View(step);
      assert.match(element.innerHTML, /cs4052-viz/);
      assert.match(element.innerHTML, /AFTER ROW SHIFTS/);
      assert.match(element.innerHTML, /FINAL GRID/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('4052 validates grid and shift vectors and has responsive styles', () => {
  assert.throws(() => problem.builder('1,2;3,4', { rowShift: '1', colShift: '0,1' }), /rowShift/);
  assert.throws(() => problem.builder('1,2;3,4', { rowShift: '2,0', colShift: '0,1' }), /rowShift/);
  assert.throws(() => problem.builder('1,2,3;4,5,6', { rowShift: '0,0', colShift: '0,0' }), /n x n/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cs4052-viz \{/);
  assert.match(css, /\.cs4052-cell\.target/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
