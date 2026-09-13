const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[240];

function encode(matrix) {
  return matrix.map(row => row.join(',')).join(';');
}

function brute(matrix, target) {
  return matrix.some(row => row.includes(target));
}

test('240 metadata exposes the staircase-search solution', () => {
  assert.equal(problem.id, 240);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.slug, 'search-a-2d-matrix-ii');
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.extraParams[0].key, 'target');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === '2d-array'));
  assert.match(problem.code.join('\n'), /row, col = 0, len\(matrix\[0\]\) - 1/);
  assert.match(problem.code.join('\n'), /col -= 1[\s\S]*row \+= 1/);
});

test('240 agrees with a brute-force oracle on present and missing targets', () => {
  let seed = 240;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let sample = 0; sample < 50; sample++) {
    const rows = 1 + random(6);
    const cols = 1 + random(6);
    const base = random(11) - 5;
    const matrix = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => base + row * 7 + col * 2),
    );
    const target = random(2)
      ? matrix[random(rows)][random(cols)]
      : base + rows * 7 + cols * 2 + 1;
    const run = problem.builder(encode(matrix), { target });
    assert.equal(run.answer, brute(matrix, target));
    assert.deepEqual(run.original, matrix);
    assert.equal(run.steps.at(-1).final, true);
    assert.ok(run.steps.every(step => step.codeLines.length === 1));
    assert.ok(run.steps.every(step => step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length));
    assert.ok(run.steps.every(step => step.search240View));
  }
});

test('240 trace moves only left or down and records each eliminated strip', () => {
  const run = problem.builder(problem.defaultInput, { target: 20 });
  const reads = run.steps.filter(step => step.search240View.decision.kind === 'read');
  const path = reads.at(-1).search240View.path;
  assert.ok(path.length <= run.original.length + run.original[0].length - 1);
  for (let index = 1; index < path.length; index++) {
    const [prevRow, prevCol] = path[index - 1];
    const [row, col] = path[index];
    assert.ok((row === prevRow + 1 && col === prevCol) || (row === prevRow && col === prevCol - 1));
  }

  for (const step of run.steps) {
    const view = step.search240View;
    if (view.decision.kind === 'move-left') {
      assert.ok(view.eliminatedCols.includes(view.decision.eliminatedCol));
      assert.equal(view.col, view.decision.eliminatedCol - 1);
    }
    if (view.decision.kind === 'move-down') {
      assert.ok(view.eliminatedRows.includes(view.decision.eliminatedRow));
      assert.equal(view.row, view.decision.eliminatedRow + 1);
    }
  }
});

test('240 validates the matrix shape, ordering, and integer target', () => {
  for (const input of ['', '1,2;3', '1,2.5;3,4', '1,3,2;4,5,6', '1,4;3,2']) {
    assert.throws(() => problem.builder(input, { target: 2 }));
  }
  assert.throws(() => problem.builder('1,2;3,4', { target: '2.5' }));
});

test('240 Python solution agrees with deterministic cases', () => {
  const cases = [
    { matrix: [[1]], target: 1 },
    { matrix: [[1]], target: 2 },
    { matrix: [[1, 4, 7], [2, 5, 9], [3, 6, 12]], target: 6 },
    { matrix: [[1, 4, 7], [2, 5, 9], [3, 6, 12]], target: 8 },
    { matrix: [[-5, -2, 0, 8]], target: -2 },
  ].map(item => ({ ...item, expected: brute(item.matrix, item.target) }));
  const code = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    result = Solution().searchMatrix(case['matrix'], case['target'])
    assert result == case['expected'], case
`;
  const python = spawnSync('python3', ['-c', code], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('240 renderer covers every trace state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderSearchMatrix240View(step)');
  const end = source.indexOf('\nfunction renderImageOverlap835View(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const target of [5, 20]) {
    const run = problem.builder(problem.defaultInput, { target });
    for (const language of ['en', 'vi']) {
      context.lang = language;
      for (const step of run.steps) {
        context.renderSearchMatrix240View(step);
        assert.match(element.innerHTML, /s240-viz/);
        assert.match(element.innerHTML, /s240-grid/);
        assert.match(element.innerHTML, /s240-decision/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('240 custom renderer is wired before the generic grid renderer and has responsive styles', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(script, /else if \(step\.search240View\)[\s\S]*renderSearchMatrix240View\(step\)/);
  assert.ok(script.indexOf('else if (step.search240View)') < script.indexOf('} else if (step.grid)'));
  assert.match(css, /\.tree-view:has\(\.s240-viz\)/);
  assert.match(css, /\.s240-cell\.current/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*\.s240-grid/);
});
