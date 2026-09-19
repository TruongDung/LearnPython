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
  // Not "semantic": the client expands and steps this trace one source line at a time.
  assert.equal(problem.debugMode, 'line-by-line');
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

// Line 0 is `class Solution:`, which a debugger never stops on during a call.
// Every other line of a code block must be visited exactly once, in order.
function assertWalksEveryLine(steps, code) {
  assert.ok(steps.every((step) => step.codeLines.length === 1), 'each step must own exactly one line');
  const visited = steps.map((step) => step.codeLines[0]);
  const expected = code.map((_line, index) => index).slice(1);
  assert.deepEqual(visited, expected, 'the trace must step through every body line in source order');
}

test('1401 approach 1 steps through every source line of the clamp', () => {
  const result = build(1, 0, 0, [1, -1, 3, 1]);
  assert.equal(result.steps.length, 10);
  assertWalksEveryLine(result.steps, problem.code);
  assert.deepEqual(result.steps.map((step) => step.circleRectangle1401View.operation), [
    'inputs', 'inner-x', 'closest-x', 'inner-y', 'closest-y', 'dx', 'dy', 'dist-squared', 'radius-squared', 'return',
  ]);
  // Each variable stays null until its own line runs, so the locals panel can
  // distinguish "not assigned yet" from "assigned 0".
  const at = (index) => result.steps[index].circleRectangle1401View;
  assert.equal(at(0).innerX, null);
  assert.equal(at(1).innerX, 0);
  assert.equal(at(1).closestX, null);
  assert.equal(at(2).closestX, 1);
  assert.equal(at(2).innerY, null);
  assert.equal(at(3).innerY, 0);
  assert.equal(at(4).closestY, 0);
  assert.equal(at(5).dx, -1);
  assert.equal(at(6).dy, 0);
  assert.equal(at(7).distSq, 1);
  assert.equal(at(7).radiusSq, null, 'radius_squared has its own line and must not leak early');
  assert.equal(at(8).radiusSq, 1);
  const final = result.steps.at(-1).circleRectangle1401View;
  assert.equal(final.answer, true);
  assert.equal(final.approach, 1);
  // The drawing anchor is always resolved so the plane can be rendered.
  assert.deepEqual([final.anchorX, final.anchorY], [1, 0]);
});

// Approach 2 has branches and a loop, so it visits a subset of lines in an
// order that depends on the input. Only the one-line-per-step rule and the
// validity of each line index are universal.
function assertOneLinePerStep(steps, code) {
  assert.ok(steps.every((step) => step.codeLines.length === 1), 'each step must own exactly one line');
  for (const step of steps) {
    const line = step.codeLines[0];
    assert.ok(Number.isInteger(line) && line >= 1 && line < code.length, `line ${line} is out of range`);
  }
  assert.equal(steps.filter((step) => step.final).length, 1, 'exactly one final step');
  assert.equal(steps.at(-1).final, true);
}

test('1401 approach 2 is a different algorithm, not a rewrite of approach 1', () => {
  // No clamping, no closest point, no single distance: the displayed code must
  // talk about region membership instead.
  const code2 = problem.code2.join('\n');
  assert.match(code2, /in_wide = x1 - radius <= xCenter <= x2 \+ radius and y1 <= yCenter <= y2/);
  assert.match(code2, /in_tall = x1 <= xCenter <= x2 and y1 - radius <= yCenter <= y2 \+ radius/);
  assert.match(code2, /for corner_x, corner_y in \(\(x1, y1\), \(x1, y2\), \(x2, y1\), \(x2, y2\)\):/);
  assert.doesNotMatch(code2, /closest|min\(/);
  assert.doesNotMatch(problem.code.join('\n'), /in_wide|corner_x/);

  // The traces must not be structurally interchangeable either.
  const shape = (steps) => steps.map((step) => step.circleRectangle1401View.operation).join(',');
  const args = [4, 0, 0, [3, 4, 8, 9]];
  assert.notEqual(shape(build(...args).steps), shape(buildApproach2(...args).steps));
  // Approach 1 is straight-line code: always the same 10 steps.
  assert.equal(build(...args).steps.length, 10);
  assert.equal(build(1, 5, 5, [0, 0, 10, 10]).steps.length, 10);
  // Approach 2's length tracks how much control flow actually ran.
  assert.equal(buildApproach2(1, 5, 5, [0, 0, 10, 10]).steps.length, 5, 'slab hit returns early');
  assert.equal(buildApproach2(5, 0, 0, [3, 4, 8, 9]).steps.length, 10, 'first corner disc hits');
  assert.equal(buildApproach2(...args).steps.length, 22, 'all four corner discs miss');
});

test('1401 approach 2 returns early when a slab already contains the center', () => {
  const result = buildApproach2(1, 5, 5, [0, 0, 10, 10]);
  assert.equal(result.answer, true);
  assertOneLinePerStep(result.steps, problem.code2);
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [1, 2, 3, 4, 5]);
  assert.deepEqual(result.steps.map((step) => step.circleRectangle1401View.operation), [
    'inputs', 'in-wide', 'in-tall', 'slab-check', 'return-slab',
  ]);
  const final = result.steps.at(-1).circleRectangle1401View;
  assert.equal(final.inWide, true);
  assert.equal(final.slabHit, true);
  // The corner machinery is never touched, so it must stay untouched in the view.
  assert.equal(final.radiusSq, null, 'line 6 never ran');
  assert.equal(final.cornerIndex, -1);
  assert.deepEqual(final.cornerResults, [null, null, null, null]);
});

test('1401 approach 2 walks the corner discs and breaks on the first hit', () => {
  // Corner (3, 4) is exactly 5 from the origin, so disc #1 hits.
  const result = buildApproach2(5, 0, 0, [3, 4, 8, 9]);
  assert.equal(result.answer, true);
  assertOneLinePerStep(result.steps, problem.code2);
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(result.steps.map((step) => step.circleRectangle1401View.operation), [
    'inputs', 'in-wide', 'in-tall', 'slab-check', 'radius-squared',
    'corner-loop', 'corner-dx', 'corner-dy', 'corner-check', 'return-corner',
  ]);
  const at = (index) => result.steps[index].circleRectangle1401View;
  assert.equal(at(3).slabHit, false, 'both slabs must miss for the loop to run');
  assert.equal(at(4).radiusSq, 25);
  assert.deepEqual([at(5).cornerX, at(5).cornerY], [3, 4]);
  assert.equal(at(5).dx, null, 'the loop header only binds the corner');
  assert.equal(at(6).dx, -3);
  assert.equal(at(7).dy, -4);
  assert.equal(at(8).cornerDistSq, 25);
  // Only the corner that was reached is resolved; the rest stay untested.
  assert.deepEqual(at(8).cornerResults, [true, null, null, null]);
});

test('1401 approach 2 tests all four corner discs before returning False', () => {
  const result = buildApproach2(4, 0, 0, [3, 4, 8, 9]);
  assert.equal(result.answer, false);
  assertOneLinePerStep(result.steps, problem.code2);
  // Slab tests, then four passes of (loop, dx, dy, check), then return False.
  assert.deepEqual(result.steps.map((step) => step.codeLines[0]), [
    1, 2, 3, 4, 6,
    7, 8, 9, 10,
    7, 8, 9, 10,
    7, 8, 9, 10,
    7, 8, 9, 10,
    12,
  ]);
  const loops = result.steps.filter((step) => step.circleRectangle1401View.operation === 'corner-loop');
  assert.deepEqual(loops.map((step) => [step.circleRectangle1401View.cornerX, step.circleRectangle1401View.cornerY]), [
    [3, 4], [3, 9], [8, 4], [8, 9],
  ]);
  assert.deepEqual(result.steps.at(-1).circleRectangle1401View.cornerResults, [false, false, false, false]);
});

test('1401 approach 1 stays a fixed straight-line walk over every source line', () => {
  const shapes = [
    [1, 0, 0, [1, -1, 3, 1]],
    [1, 1, 1, [1, -3, 2, -1]],
    [1, 0, 0, [-1, 0, 0, 1]],
    [5, 0, 0, [3, 4, 8, 9]],
    [1, 5, 5, [0, 0, 10, 10]],
    [2000, -10000, 10000, [-10000, -10000, 10000, 10000]],
  ];
  for (const [radius, xCenter, yCenter, rect] of shapes) {
    assertWalksEveryLine(build(radius, xCenter, yCenter, rect).steps, problem.code);
    assertOneLinePerStep(buildApproach2(radius, xCenter, yCenter, rect).steps, problem.code2);
  }
});

test('1401 approach 2 reaches every line of its code block across inputs', () => {
  const visited = new Set();
  const shapes = [
    [1, 5, 5, [0, 0, 10, 10]],
    [5, 0, 0, [3, 4, 8, 9]],
    [4, 0, 0, [3, 4, 8, 9]],
  ];
  for (const [radius, xCenter, yCenter, rect] of shapes) {
    for (const step of buildApproach2(radius, xCenter, yCenter, rect).steps) {
      visited.add(step.codeLines[0]);
    }
  }
  // Every line except 0 (`class Solution:`) must be reachable.
  const expected = problem.code2.map((_line, index) => index).slice(1);
  assert.deepEqual([...visited].sort((a, b) => a - b), expected);
});

test('1401 opts into the client line-by-line debugger without mangling the trace', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const context = { problemData: { id: 1401, debugMode: problem.debugMode } };
  vm.createContext(context);

  const flagStart = source.indexOf('function shouldUseLineByLineDebug()');
  const flagEnd = source.indexOf('}', source.indexOf('return', flagStart)) + 1;
  vm.runInContext(source.slice(flagStart, flagEnd), context);
  assert.equal(context.shouldUseLineByLineDebug(), true, '1401 must take the line-by-line path');

  const expandStart = source.indexOf('function expandStepsLineByLine(rawSteps)');
  const expandEnd = source.indexOf('\n// ---- Run algorithm ----', expandStart);
  assert.ok(expandStart >= 0 && expandEnd > expandStart);
  vm.runInContext(source.slice(expandStart, expandEnd), context);

  // Because the builders already emit one line per step, expansion is a
  // pass-through: no step is split, dropped, or given a second `final`.
  for (const raw of [build(1, 0, 0, [1, -1, 3, 1]).steps, buildApproach2(1, 0, 0, [1, -1, 3, 1]).steps]) {
    const expanded = context.expandStepsLineByLine(raw);
    assert.equal(expanded.length, raw.length);
    // Array.from rebuilds in this realm: values that cross the vm boundary carry
    // a foreign Array.prototype, which deepStrictEqual would reject.
    assert.deepEqual(
      Array.from(expanded, (step) => step.codeLines[0]),
      raw.map((step) => step.codeLines[0]),
    );
    assert.ok(Array.from(expanded).every((step) => step.codeLines.length === 1));
    assert.equal(Array.from(expanded).filter((step) => step.final).length, 1);
    assert.equal(expanded.at(-1).final, true);
  }
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
  // Lines that assign a local, per approach. Other lines are branches, loop
  // headers, or returns, and legitimately have no active local cell.
  const localLines = { 1: new Set([2, 3, 4, 5, 6, 7, 8, 9]), 2: new Set([2, 3, 6, 7, 8, 9]) };
  const traces = [
    // Overlapping, separated, center inside, corner-exact, clamped-on-both-axes.
    ...build(1, 0, 0, [1, -1, 3, 1]).steps,
    ...build(1, 1, 1, [1, -3, 2, -1]).steps,
    ...build(1, 5, 5, [0, 0, 10, 10]).steps,
    ...build(5, 0, 0, [3, 4, 8, 9]).steps,
    ...build(2000, -10000, 10000, [-10000, -10000, 10000, 10000]).steps,
    // Approach 2's three control-flow outcomes: slab early return, corner hit,
    // and every corner disc missing.
    ...buildApproach2(1, 5, 5, [0, 0, 10, 10]).steps,
    ...buildApproach2(5, 0, 0, [3, 4, 8, 9]).steps,
    ...buildApproach2(4, 0, 0, [3, 4, 8, 9]).steps,
    ...buildApproach2(2000, -10000, 10000, [-10000, -10000, 10000, 10000]).steps,
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of traces) {
      context.renderCircleRectangle1401View(step);
      const approach = step.circleRectangle1401View.approach;
      assert.match(element.innerHTML, /cr1401-viz/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|null/);
      // The locals panel is the line-by-line payload: it must always render, and
      // it must flag the line being executed right now.
      assert.match(element.innerHTML, /cr1401-locals/);
      const line = step.codeLines[0];
      if (localLines[approach].has(line)) {
        assert.match(element.innerHTML, new RegExp(`cr1401-local [a-z]+ active"><small>L${line}</small>`), `line ${line} must be the active local`);
      }
      // Each approach gets its own picture, never the other one's.
      if (approach === 2) {
        assert.match(element.innerHTML, /cr1401-region-viz/);
        assert.match(element.innerHTML, /INFLATED REGION|VÙNG NỞ RA/);
        assert.equal((element.innerHTML.match(/cr1401-region-disc/g) || []).length, 4, 'all four corner discs are drawn');
        assert.equal((element.innerHTML.match(/cr1401-region-slab/g) || []).length, 2);
        assert.equal((element.innerHTML.match(/cr1401-corner-card/g) || []).length, 4);
        assert.doesNotMatch(element.innerHTML, /cr1401-hypot|closest_x/);
      } else {
        assert.match(element.innerHTML, /COORDINATE PLANE|MẶT PHẲNG TỌA ĐỘ/);
        assert.doesNotMatch(element.innerHTML, /cr1401-region-|in_wide/);
      }
    }
  }
});

test('1401 locals panel reveals values only after their line has executed', () => {
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

  const steps = build(1, 0, 0, [1, -1, 3, 1]).steps;
  const pendingCount = (html) => (html.match(/cr1401-local pending/g) || []).length;

  // Entering the function: all 8 locals are still unassigned.
  context.renderCircleRectangle1401View(steps[0]);
  assert.equal(pendingCount(element.innerHTML), 8);

  // Each subsequent line assigns exactly one more local, monotonically.
  let previous = 8;
  for (let index = 1; index < steps.length; index += 1) {
    context.renderCircleRectangle1401View(steps[index]);
    const remaining = pendingCount(element.innerHTML);
    assert.ok(remaining <= previous, `step ${index} must not un-assign a local`);
    previous = remaining;
  }
  // By the return line every local has a value.
  assert.equal(previous, 0);
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

test('1401 parenthesises negative bases when squaring', () => {
  // dx is a signed gap, so a bare "-1²" would read as -(1²).
  const negative = build(1, 0, 0, [1, -1, 3, 1]).steps.find(
    (step) => step.circleRectangle1401View.operation === 'dist-squared',
  );
  assert.equal(negative.circleRectangle1401View.dx, -1);
  assert.match(negative.title.en, /\(-1\)² \+ 0² = 1/);
  assert.doesNotMatch(negative.title.en, /[^(]-1²/);

  // Approach 2's corner offsets are signed too, and the renderer squares them.
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
  const cornerCheck = buildApproach2(5, 0, 0, [3, 4, 8, 9]).steps.find(
    (step) => step.circleRectangle1401View.operation === 'corner-check',
  );
  assert.deepEqual(
    [cornerCheck.circleRectangle1401View.dx, cornerCheck.circleRectangle1401View.dy],
    [-3, -4],
  );
  context.renderCircleRectangle1401View(cornerCheck);
  assert.match(element.innerHTML, /\(-3\)² \+ \(-4\)² = 25/);
});

test('1401 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cr1401-viz \{/);
  assert.match(css, /\.cr1401-anchor circle/);
  assert.match(css, /\.cr1401-compare\.fail/);
  assert.match(css, /\.cr1401-axis-card\.aligned/);
  assert.match(css, /\.cr1401-local\.pending/);
  assert.match(css, /\.cr1401-local\.active/);
  // Approach 2's inflated-region picture has its own scoped block.
  assert.match(css, /\.cr1401-region-slab\.hit/);
  assert.match(css, /\.cr1401-region-disc\.active/);
  assert.match(css, /\.cr1401-ghost-circle/);
  assert.match(css, /\.cr1401-corner-card\.miss/);
  assert.match(css, /\.cr1401-slab-card\.hit/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
