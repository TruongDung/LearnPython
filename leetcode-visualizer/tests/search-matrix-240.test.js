const { readFrontendJavaScript } = require('./helpers/frontend-source');
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
  const source = fs.readFileSync(require.resolve('../public/renderer-search-matrix-ii-240.js'), 'utf8');
  const element = { querySelector: () => null };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  for (const target of [5, 20, -1, 31]) {
    const run = problem.builder(problem.defaultInput, { target });
    for (const language of ['en', 'vi']) {
      context.lang = language;
      for (const step of run.steps) {
        const before = JSON.stringify(step);
        context.renderSearchMatrix240Pictures(step);
        assert.match(element.innerHTML, /s240p-viz/);
        assert.match(element.innerHTML, /s240p-grid/);
        assert.match(element.innerHTML, /s240p-operation/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|object Object|<p[ >]|<table/);
        assert.equal((element.innerHTML.match(/class="s240p-cell /g) || []).length, 25);
        const view = step.search240View;
        if (view.pointer && view.pointer.join(',') !== view.readCell?.join(',')) assert.match(element.innerHTML, /class="s240p-next-mark"/);
        else assert.doesNotMatch(element.innerHTML, /class="s240p-next-mark"/);
        if (step.search240View.drop) {
          const count = step.search240View.drop.cells.length;
          const state = step.search240View.drop.applied ? 'removed' : 'preview';
          assert.equal((element.innerHTML.match(new RegExp(`class="s240p-cell [^"]* ${state} `, 'g')) || []).length, count);
        }
        assert.equal(JSON.stringify(step), before);
      }
      context.renderSearchMatrix240Pictures(run.steps[0]); const first = element.innerHTML;
      context.renderSearchMatrix240Pictures(run.steps.at(-1)); context.renderSearchMatrix240Pictures(run.steps[0]);
      assert.equal(element.innerHTML, first);
    }
  }
});

test('240 custom renderer is wired before the generic grid renderer and has responsive styles', () => {
  const script = readFrontendJavaScript();
  const css = fs.readFileSync(require.resolve('../public/search-matrix-ii-240.css'), 'utf8');
  assert.match(script, /Boolean\(step\.search240View\)[\s\S]*?renderSearchMatrix240Pictures\(step\)/);
  assert.ok(script.indexOf('Boolean(step.search240View)') < script.indexOf('Boolean(step.grid)'));
  assert.match(css, /#treeView:has\(> \.s240p-viz\)/);
  assert.match(css, /\.s240p-cell\.current/);
  assert.match(css, /@container search240 \(max-width: 390px\)/);
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  for (const asset of ['search-matrix-ii-240.css', 'renderer-search-matrix-ii-240.js']) {
    assert.equal(html.split(asset + '?').length - 1, 1);
    assert.ok(!html.replace(/<template[\s\S]*?<\/template>/g, '').includes(asset));
  }
});

test('240 agrees with CPython after every executed line and preserves a fixed watch list', () => {
  const matrices = [[[5]], [[-5, -2, 0, 8]], [[-5], [-2], [0], [8]], [[1, 1, 4], [1, 3, 4], [2, 3, 5]],
    [[1, 4, 7], [2, 5, 9], [3, 6, 12]]];
  const cases = matrices.flatMap(matrix => [matrix[0][0], matrix.at(-1).at(-1), matrix[0][0] - 1, matrix.at(-1).at(-1) + 1, 8]
    .map(target => ({ matrix, target, code: problem.code.join('\n') })));
  const program = `
import copy, json, sys
runs = []
for case in json.load(sys.stdin):
    namespace = {}
    exec(case['code'], namespace)
    events, pending = [], None
    def snapshot(frame, line):
        events.append({'line': line, 'locals': copy.deepcopy({name: value for name, value in frame.f_locals.items() if name != 'self'})})
    def trace(frame, event, arg):
        global pending
        if frame.f_code.co_name != 'searchMatrix':
            return trace
        if event == 'line':
            if pending is not None:
                snapshot(frame, pending)
            pending = frame.f_lineno
        elif event == 'return':
            snapshot(frame, pending)
            pending = None
        return trace
    sys.settrace(trace)
    answer = namespace['Solution']().searchMatrix(case['matrix'], case['target'])
    sys.settrace(None)
    runs.append({'answer': answer, 'events': events})
print(json.dumps(runs))
`;
  const python = spawnSync(process.env.PYTHON || 'python3', ['-c', program], { input: JSON.stringify(cases), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(python.status, 0, python.stderr);
  JSON.parse(python.stdout).forEach((reference, index) => {
    const run = problem.builder(cases[index].matrix, { target: cases[index].target });
    assert.equal(run.answer, reference.answer);
    assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const event = reference.events[i], v = step.search240View;
      assert.deepEqual(step.codeLines, [event.line]);
      assert.deepEqual(v.locals, event.locals, `case ${index}, event ${i}, line ${event.line}`);
      assert.deepEqual(v.source, { line: event.line, text: problem.code[event.line - 1], timing: 'after' });
      assert.deepEqual(step.vars.map(variable => variable.name), ['row', 'col', 'value', 'target']);
      assert.deepEqual(step.vars.map(variable => variable.value), ['row', 'col', 'value', 'target'].map(name => event.locals[name] ?? '—'));
    });
  });
});

test('240 previews never remove candidates; applied strips contain no target and reduce the exact remaining region', () => {
  let seed = 240;
  const random = max => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % max; };
  for (let rows = 1; rows <= 8; rows++) for (let cols = 1; cols <= 8; cols++) {
    const matrix = Array.from({ length: rows }, () => Array(cols));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) matrix[r][c] = Math.max(r ? matrix[r - 1][c] : -10, c ? matrix[r][c - 1] : -10) + random(3);
    for (const target of new Set([-11, matrix.at(-1).at(-1) + 1, matrix[Math.floor(rows / 2)][Math.floor(cols / 2)]])) {
      const immutable = Object.freeze(matrix.map(row => Object.freeze([...row]))), run = problem.builder(immutable, { target });
      assert.equal(run.answer, brute(matrix, target));
      let previous = null;
      for (const step of run.steps) {
        const v = step.search240View, line = step.codeLines[0];
        const remaining = matrix.flatMap((row, r) => row.map((_, c) => [r, c])).filter(([r, c]) => v.row === null || r >= v.row && c <= v.col);
        assert.equal(v.candidates, remaining.length);
        if (previous && line !== 7) assert.deepEqual(v.path, previous.path);
        if (v.drop) {
          assert.equal(new Set(v.drop.cells.map(cell => cell.join(','))).size, v.drop.cells.length);
          for (const [r, c] of v.drop.cells) {
            assert.ok(r >= previous.row && r < rows && c >= 0 && c <= previous.col);
            assert.ok(v.drop.kind === 'col' ? matrix[r][c] > target : matrix[r][c] < target);
          }
          if (v.drop.applied) assert.equal(v.candidates, previous.candidates - v.drop.cells.length);
          else { assert.equal(line, 10); assert.equal(v.candidates, previous.candidates); }
        }
        previous = v;
      }
      assert.ok(run.steps.at(-1).search240View.path.length <= rows + cols - 1);
    }
  }
});

test('240 accepts CSV, pipe, newline, JSON and arrays and rejects invalid parameters and sparse input', () => {
  const matrix = [[1, 4], [2, 5]];
  for (const input of [matrix, '1,4;2,5', '1,4|2,5', '1,4\n2,5', JSON.stringify(matrix)]) {
    assert.deepEqual(problem.liveArgs(input, { target: '4' }), [matrix, 4]);
    assert.equal(problem.builder(input, { target: '4' }).answer, true);
  }
  for (const input of [null, [], [[]], [[NaN]], [[Infinity]], [[true]], [[null]], [['1']], [[1.5]], [[Number.MAX_SAFE_INTEGER + 1]], [Array(2)], Array(2), '1,,3', '[[1]', [Array(101).fill(1)], Array.from({ length: 101 }, (_, r) => [r])]) {
    assert.throws(() => problem.builder(input)); assert.throws(() => problem.liveArgs(input));
  }
  for (const params of [null, [], { target: '' }, { target: null }, { target: true }, { target: 1.5 }, { target: Infinity }]) {
    assert.throws(() => problem.builder(matrix, params)); assert.throws(() => problem.liveArgs(matrix, params));
  }
  const large = Array.from({ length: 100 }, (_, r) => Array.from({ length: 100 }, (_, c) => (r + c) * 2));
  for (const target of [0, 199, 396]) assert.equal(problem.builder(large, { target }).answer, brute(large, target));
});
