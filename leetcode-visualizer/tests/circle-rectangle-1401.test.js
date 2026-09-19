const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[1401];

// Independent oracle: explicit 9-region case analysis instead of clamping.
function oracle(radius, xCenter, yCenter, x1, y1, x2, y2) {
  const leftOf = xCenter < x1;
  const rightOf = xCenter > x2;
  const below = yCenter < y1;
  const above = yCenter > y2;
  let distSq;
  if (!leftOf && !rightOf && !below && !above) {
    distSq = 0;
  } else if (!leftOf && !rightOf) {
    const gap = below ? y1 - yCenter : yCenter - y2;
    distSq = gap * gap;
  } else if (!below && !above) {
    const gap = leftOf ? x1 - xCenter : xCenter - x2;
    distSq = gap * gap;
  } else {
    const cornerX = leftOf ? x1 : x2;
    const cornerY = below ? y1 : y2;
    distSq = (cornerX - xCenter) ** 2 + (cornerY - yCenter) ** 2;
  }
  return distSq <= radius * radius;
}

function build(radius, xCenter, yCenter, rect) {
  return problem.builder(`${radius},${xCenter},${yCenter}`, { rect: rect.join(',') });
}

function buildApproach2(radius, xCenter, yCenter, rect) {
  return problem.builder2(`${radius},${xCenter},${yCenter}`, { rect: rect.join(','), approach: 2 });
}

test('1401 is registered with the expected signature and metadata', () => {
  assert.equal(problem.id, 1401);
  assert.equal(problem.slug, 'circle-and-rectangle-overlapping');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(1)');
  assert.equal(problem.category.key, 'math');
  assert.ok(problem.tags.some((tag) => tag.key === 'geometry'));
  const signature = /def checkOverlap\(self, radius: int, xCenter: int, yCenter: int, x1: int, y1: int, x2: int, y2: int\) -> bool/;
  assert.match(problem.code.join('\n'), signature);
  assert.match(problem.code2.join('\n'), signature);
  assert.deepEqual(problem.liveArgs('1,0,0', { rect: '1,-1,3,1' }), [1, 0, 0, 1, -1, 3, 1]);
});

test('1401 matches the official examples plus exact-corner edge cases', () => {
  const cases = [
    [1, 0, 0, [1, -1, 3, 1], true],
    [1, 1, 1, [1, -3, 2, -1], false],
    [1, 0, 0, [-1, 0, 0, 1], true],
    // Nearest point is the corner (3, 4), exactly radius 5 away.
    [5, 0, 0, [3, 4, 8, 9], true],
    // Same corner, one unit out of reach.
    [4, 0, 0, [3, 4, 8, 9], false],
    // Center strictly inside the rectangle.
    [1, 5, 5, [0, 0, 10, 10], true],
  ];
  for (const [radius, xCenter, yCenter, rect, expected] of cases) {
    const result = build(radius, xCenter, yCenter, rect);
    assert.equal(result.answer, expected, `approach 1: r=${radius} c=(${xCenter},${yCenter}) rect=${rect}`);
    assert.equal(result.steps.at(-1).circleRectangle1401View.answer, expected);
    assert.equal(result.steps.at(-1).final, true);

    const result2 = buildApproach2(radius, xCenter, yCenter, rect);
    assert.equal(result2.answer, expected, `approach 2: r=${radius} c=(${xCenter},${yCenter}) rect=${rect}`);
    assert.equal(result2.steps.at(-1).circleRectangle1401View.answer, expected);
    assert.equal(result2.steps.at(-1).final, true);
  }
});

test('1401 builders agree with an independent region-based oracle', () => {
  let seed = 1401;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  for (let sample = 0; sample < 1500; sample += 1) {
    const radius = next() % 12 + 1;
    const xCenter = next() % 25 - 12;
    const yCenter = next() % 25 - 12;
    const x1 = next() % 25 - 12;
    const y1 = next() % 25 - 12;
    const rect = [x1, y1, x1 + (next() % 9) + 1, y1 + (next() % 9) + 1];
    const expected = oracle(radius, xCenter, yCenter, ...rect);
    const label = `r=${radius} c=(${xCenter},${yCenter}) rect=${rect}`;
    assert.equal(build(radius, xCenter, yCenter, rect).answer, expected, label);
    assert.equal(buildApproach2(radius, xCenter, yCenter, rect).answer, expected, `approach 2: ${label}`);
  }
});

test('1401 approach 1 traces the clamp line by line', () => {
  const result = build(1, 0, 0, [1, -1, 3, 1]);
  assert.equal(result.steps.length, 6);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(result.steps.map((step) => step.circleRectangle1401View.operation), [
    'inputs', 'closest-x', 'closest-y', 'dx', 'dy', 'return',
  ]);
  // Values only become non-null on the step that assigns them.
  assert.equal(result.steps[0].circleRectangle1401View.closestX, null);
  assert.equal(result.steps[1].circleRectangle1401View.closestX, 1);
  assert.equal(result.steps[1].circleRectangle1401View.closestY, null);
  assert.equal(result.steps[2].circleRectangle1401View.closestY, 0);
  assert.equal(result.steps[3].circleRectangle1401View.dx, -1);
  assert.equal(result.steps[4].circleRectangle1401View.dy, 0);
  const final = result.steps.at(-1).circleRectangle1401View;
  assert.equal(final.distSq, 1);
  assert.equal(final.radiusSq, 1);
  assert.equal(final.answer, true);
  assert.equal(final.approach, 1);
  // The drawing anchor is always resolved so the plane can be rendered.
  assert.deepEqual([final.anchorX, final.anchorY], [1, 0]);
});

test('1401 approach 2 traces the per-axis overshoot line by line', () => {
  const result = buildApproach2(1, 1, 1, [1, -3, 2, -1]);
  assert.equal(result.answer, false);
  assert.equal(result.steps.length, 5);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [1, 2, 3, 4, 5]);
  assert.deepEqual(result.steps.map((step) => step.circleRectangle1401View.operation), [
    'inputs', 'dx', 'dy', 'dist-squared', 'return',
  ]);
  // Overshoots are never negative, unlike approach 1's signed gaps.
  assert.equal(result.steps[1].circleRectangle1401View.dx, 0);
  assert.equal(result.steps[2].circleRectangle1401View.dy, 2);
  const final = result.steps.at(-1).circleRectangle1401View;
  assert.equal(final.distSq, 4);
  assert.equal(final.radiusSq, 1);
  assert.equal(final.approach, 2);
  assert.equal(final.closestX, null);
  assert.deepEqual([final.anchorX, final.anchorY], [1, -1]);
});

test('1401 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().checkOverlap(1, 0, 0, 1, -1, 3, 1) is True',
    'assert Solution().checkOverlap(1, 1, 1, 1, -3, 2, -1) is False',
    'assert Solution().checkOverlap(1, 0, 0, -1, 0, 0, 1) is True',
    'assert Solution().checkOverlap(5, 0, 0, 3, 4, 8, 9) is True',
    'assert Solution().checkOverlap(4, 0, 0, 3, 4, 8, 9) is False',
    'assert Solution().checkOverlap(1, 5, 5, 0, 0, 10, 10) is True',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);
  const displayedApproach2 = spawnSync('python3', ['-c', `${problem.code2.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayedApproach2.status, 0, displayedApproach2.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/other/Leetcode_1401.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('1401 renderer covers all states in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderCircleRectangle1401View(step)');
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
    // Overlapping, separated, center inside, corner-exact, and clamped-on-both-axes shapes.
    ...build(1, 0, 0, [1, -1, 3, 1]).steps,
    ...build(1, 1, 1, [1, -3, 2, -1]).steps,
    ...build(1, 5, 5, [0, 0, 10, 10]).steps,
    ...build(5, 0, 0, [3, 4, 8, 9]).steps,
    ...build(2000, -10000, 10000, [-10000, -10000, 10000, 10000]).steps,
    ...buildApproach2(1, 0, 0, [1, -1, 3, 1]).steps,
    ...buildApproach2(1, 1, 1, [1, -3, 2, -1]).steps,
    ...buildApproach2(1, 5, 5, [0, 0, 10, 10]).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderCircleRectangle1401View(step);
      assert.match(element.innerHTML, /cr1401-viz/);
      assert.match(element.innerHTML, /COORDINATE PLANE|MẶT PHẲNG TỌA ĐỘ/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|null/);
    }
  }
});

test('1401 draws the circle with one shared scale on both axes', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderCircleRectangle1401View(step)');
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
  // A wide, short rectangle would stretch the circle if mapX and mapY differed.
  const step = build(2, 0, 0, [-40, -1, 40, 1]).steps.at(-1);
  context.renderCircleRectangle1401View(step);
  const circle = element.innerHTML.match(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/);
  assert.ok(circle, 'the plane must contain a <circle> element');
  const [, cx, cy, r] = circle.map(Number);
  assert.ok(Number.isFinite(cx) && Number.isFinite(cy) && Number.isFinite(r));
  assert.ok(r > 0, 'radius must map to a positive pixel length');
  // 2 world units of radius across an 80-unit-wide span inside a 552px plot.
  assert.ok(Math.abs(r - (552 / (80 * 1.2)) * 2) < 0.5, `unexpected mapped radius ${r}`);
});

test('1401 validates the circle and rectangle inputs', () => {
  assert.throws(() => problem.builder('1,0', { rect: '1,-1,3,1' }), /exactly 3/);
  assert.throws(() => problem.builder('1,0,0,0', { rect: '1,-1,3,1' }), /exactly 3/);
  assert.throws(() => problem.builder('0,0,0', { rect: '1,-1,3,1' }), /radius must be between 1 and 2,000/);
  assert.throws(() => problem.builder('2001,0,0', { rect: '1,-1,3,1' }), /radius must be between 1 and 2,000/);
  assert.throws(() => problem.builder('1,10001,0', { rect: '1,-1,3,1' }), /xCenter and yCenter/);
  assert.throws(() => problem.builder('1,0,0', { rect: '1,-1,3' }), /exactly 4/);
  assert.throws(() => problem.builder('1,0,0', { rect: '1,-1,3,no' }), /integers/);
  assert.throws(() => problem.builder('1,0,0', { rect: '1,-1,1,1' }), /x1 < x2 and y1 < y2/);
  assert.throws(() => problem.builder('1,0,0', { rect: '1,-1,3,-1' }), /x1 < x2 and y1 < y2/);
  assert.throws(() => problem.builder('1,0,0', { rect: '-10001,-1,3,1' }), /rect coordinates/);
  assert.throws(() => problem.builder2('1,0', { rect: '1,-1,3,1' }), /exactly 3/);
});

test('1401 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cr1401-viz \{/);
  assert.match(css, /\.cr1401-anchor circle/);
  assert.match(css, /\.cr1401-compare\.fail/);
  assert.match(css, /\.cr1401-axis-card\.aligned/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
