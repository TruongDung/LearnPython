const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[836];

function oracle(rec1, rec2) {
  const width = Math.min(rec1[2], rec2[2]) - Math.max(rec1[0], rec2[0]);
  const height = Math.min(rec1[3], rec2[3]) - Math.max(rec1[1], rec2[1]);
  return width > 0 && height > 0;
}

function build(rec1, rec2) {
  return problem.builder(rec1.join(','), { rec2: rec2.join(',') });
}

test('836 is registered with the expected signature and metadata', () => {
  assert.equal(problem.id, 836);
  assert.equal(problem.slug, 'rectangle-overlap');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(1)');
  assert.match(problem.code.join('\n'), /def isRectangleOverlap\(self, rec1: List\[int\], rec2: List\[int\]\) -> bool/);
});

test('836 matches the official overlap, edge-touching, and separated examples', () => {
  const cases = [
    [[0, 0, 2, 2], [1, 1, 3, 3], true],
    [[0, 0, 1, 1], [1, 0, 2, 1], false],
    [[0, 0, 1, 1], [2, 2, 3, 3], false],
  ];
  for (const [rec1, rec2, expected] of cases) {
    const result = build(rec1, rec2);
    assert.equal(result.answer, expected);
    assert.equal(result.steps.at(-1).rectangleOverlap836View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('836 builder agrees with an independent intersection-area oracle', () => {
  let seed = 836;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  for (let sample = 0; sample < 1200; sample += 1) {
    const x1 = next() % 21 - 10;
    const y1 = next() % 21 - 10;
    const x2 = x1 + next() % 8 + 1;
    const y2 = y1 + next() % 8 + 1;
    const a1 = next() % 21 - 10;
    const b1 = next() % 21 - 10;
    const a2 = a1 + next() % 8 + 1;
    const b2 = b1 + next() % 8 + 1;
    const rec1 = [x1, y1, x2, y2];
    const rec2 = [a1, b1, a2, b2];
    assert.equal(build(rec1, rec2).answer, oracle(rec1, rec2), `${rec1} vs ${rec2}`);
  }
});

test('836 trace executes exactly one source line per step', () => {
  const result = build([0, 0, 2, 2], [1, 1, 3, 3]);
  assert.equal(result.steps.length, 8);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(result.steps.map((step) => step.rectangleOverlap836View.operation), [
    'inputs', 'left', 'right', 'bottom', 'top', 'overlap-x', 'overlap-y', 'return',
  ]);
  const final = result.steps.at(-1).rectangleOverlap836View;
  assert.deepEqual([final.left, final.right, final.bottom, final.top], [1, 2, 1, 2]);
  assert.equal(final.overlapX, true);
  assert.equal(final.overlapY, true);
});

test('836 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().isRectangleOverlap([0,0,2,2], [1,1,3,3]) is True',
    'assert Solution().isRectangleOverlap([0,0,1,1], [1,0,2,1]) is False',
    'assert Solution().isRectangleOverlap([-3,-2,4,5], [-1,0,2,7]) is True',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_836.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('836 renderer covers all states in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderRectangleOverlap836View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const traces = [
    ...build([0, 0, 2, 2], [1, 1, 3, 3]).steps,
    ...build([0, 0, 1, 1], [1, 0, 2, 1]).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderRectangleOverlap836View(step);
      assert.match(element.innerHTML, /ro836-viz/);
      assert.match(element.innerHTML, /COORDINATE PLANE|MẶT PHẲNG TỌA ĐỘ/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('836 validates rectangles and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder('0,0,1', { rec2: '1,1,2,2' }), /exactly 4/);
  assert.throws(() => problem.builder('0,0,0,2', { rec2: '1,1,2,2' }), /positive area/);
  assert.throws(() => problem.builder('0,0,1,1', { rec2: '1,1,no,2' }), /integers/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ro836-viz \{/);
  assert.match(css, /\.ro836-intersection rect/);
  assert.match(css, /\.ro836-axis-card\.fail/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
