const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[223];

function oracle(a, b) {
  const areaA = (a[2] - a[0]) * (a[3] - a[1]);
  const areaB = (b[2] - b[0]) * (b[3] - b[1]);
  const width = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const height = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  return areaA + areaB - width * height;
}

function build(a, b) {
  return problem.builder(a.join(','), { rectB: b.join(',') });
}

test('223 is registered with its official signature and metadata', () => {
  assert.equal(problem.id, 223);
  assert.equal(problem.slug, 'rectangle-area');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(1)');
  assert.equal(problem.complexity.space, 'O(1)');
  assert.match(problem.code.join('\n'), /def computeArea\(self, ax1: int, ay1: int, ax2: int, ay2: int, bx1: int, by1: int, bx2: int, by2: int\) -> int/);
});

test('223 matches the official examples and geometric edge cases', () => {
  const cases = [
    [[-3, 0, 3, 4], [0, -1, 9, 2], 45],
    [[-2, -2, 2, 2], [-2, -2, 2, 2], 16],
    [[0, 0, 1, 1], [2, 2, 3, 3], 2],
    [[0, 0, 2, 2], [2, 0, 4, 2], 8],
    [[0, 0, 10, 10], [2, 3, 4, 5], 100],
    [[0, 0, 0, 5], [1, 1, 3, 3], 4],
  ];
  for (const [a, b, expected] of cases) {
    const result = build(a, b);
    assert.equal(result.answer, expected, `${a} vs ${b}`);
    assert.equal(result.steps.at(-1).rectangleArea223View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);
  }
});

test('223 builder agrees with an independent union-area oracle', () => {
  let seed = 223;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  for (let sample = 0; sample < 1200; sample += 1) {
    const ax1 = next() % 31 - 15;
    const ay1 = next() % 31 - 15;
    const ax2 = ax1 + next() % 9;
    const ay2 = ay1 + next() % 9;
    const bx1 = next() % 31 - 15;
    const by1 = next() % 31 - 15;
    const bx2 = bx1 + next() % 9;
    const by2 = by1 + next() % 9;
    const a = [ax1, ay1, ax2, ay2];
    const b = [bx1, by1, bx2, by2];
    assert.equal(build(a, b).answer, oracle(a, b), `${a} vs ${b}`);
  }
});

test('223 trace highlights exactly one displayed source line per step', () => {
  const result = build([-3, 0, 3, 4], [0, -1, 9, 2]);
  assert.deepEqual(result.steps.map((step) => step.codeLines), [[2], [3], [4], [6], [7], [8], [10]]);
  assert.deepEqual(result.steps.map((step) => step.rectangleArea223View.operation), [
    'inputs', 'area-a', 'area-b', 'overlap-width', 'overlap-height', 'overlap-area', 'return',
  ]);
  const final = result.steps.at(-1).rectangleArea223View;
  assert.deepEqual(
    [final.areaA, final.areaB, final.overlapWidth, final.overlapHeight, final.overlapArea, final.answer],
    [24, 27, 3, 2, 6, 45],
  );
});

test('223 displayed Python and solution file return the expected values', () => {
  const assertions = [
    's = Solution()',
    'assert s.computeArea(-3, 0, 3, 4, 0, -1, 9, 2) == 45',
    'assert s.computeArea(-2, -2, 2, 2, -2, -2, 2, 2) == 16',
    'assert s.computeArea(0, 0, 1, 1, 2, 2, 3, 3) == 2',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/other/Leetcode_223.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('223 renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderRectangleArea223View(step)');
  const end = source.indexOf('\nfunction renderRectangleOverlap836View(step)', start);
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
    ...build([-3, 0, 3, 4], [0, -1, 9, 2]).steps,
    ...build([0, 0, 1, 1], [2, 2, 3, 3]).steps,
    ...build([0, 0, 10, 10], [2, 3, 4, 5]).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderRectangleArea223View(step);
      assert.match(element.innerHTML, /ra223-viz/);
      assert.match(element.innerHTML, /COORDINATE PLANE|MẶT PHẲNG TỌA ĐỘ/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('223 validates coordinates and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('0,0,1', { rectB: '0,0,1,1' }), /exactly 4/);
  assert.throws(() => problem.builder('2,0,1,1', { rectB: '0,0,1,1' }), /x1 <= x2/);
  assert.throws(() => problem.builder('0,0,10001,1', { rectB: '0,0,1,1' }), /between -10,000 and 10,000/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ra223-viz/);
  assert.match(css, /\.ra223-overlap/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.ra223-workspace \{ grid-template-columns: 1fr;/);
});
