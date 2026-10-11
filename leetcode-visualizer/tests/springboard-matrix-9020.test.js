const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');
const rendererSource = require('node:fs').readFileSync(require.resolve('../public/renderer-springboard-matrix-9020.js'), 'utf8');

const { SUPPORTED } = require('../problems');
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[9020];
const DIRECTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

function bruteForce(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let best = 0;
  function visit(r, c, mode, ceiling, mask) {
    let length = 1;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = nr * cols + nc;
      if (mask & (1 << next)) continue;
      const currentHeight = matrix[r][c];
      const nextHeight = matrix[nr][nc];
      let nextMode;
      let nextCeiling;
      if (mode === 'rest') {
        if (nextHeight > currentHeight) continue;
        nextMode = 'momentum';
        nextCeiling = currentHeight;
      } else if (nextHeight <= currentHeight) {
        nextMode = 'momentum';
        nextCeiling = currentHeight;
      } else if (nextHeight <= ceiling) {
        nextMode = 'rest';
        nextCeiling = null;
      } else {
        continue;
      }
      length = Math.max(length, 1 + visit(nr, nc, nextMode, nextCeiling, mask | (1 << next)));
    }
    return length;
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      best = Math.max(best, visit(r, c, 'rest', null, 1 << (r * cols + c)));
    }
  }
  return best;
}

function brutePaths(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = [];
  function visit(r, c, mode, ceiling, mask, path) {
    const nextPath = [...path, [r, c]];
    result.push(nextPath);
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const next = nr * cols + nc;
      if (mask & (1 << next)) continue;
      const currentHeight = matrix[r][c];
      const nextHeight = matrix[nr][nc];
      let nextMode;
      let nextCeiling;
      if (mode === 'rest') {
        if (nextHeight > currentHeight) continue;
        nextMode = 'momentum';
        nextCeiling = currentHeight;
      } else if (nextHeight <= currentHeight) {
        nextMode = 'momentum';
        nextCeiling = currentHeight;
      } else if (nextHeight <= ceiling) {
        nextMode = 'rest';
        nextCeiling = null;
      } else {
        continue;
      }
      visit(nr, nc, nextMode, nextCeiling, mask | (1 << next), nextPath);
    }
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      visit(r, c, 'rest', null, 1 << (r * cols + c), []);
    }
  }
  return result;
}

function assertLegalPath(matrix, path) {
  const used = new Set();
  let mode = 'rest';
  let ceiling = null;
  for (let index = 0; index < path.length; index += 1) {
    const [r, c] = path[index];
    const key = `${r},${c}`;
    assert.ok(!used.has(key), `revisited ${key}`);
    used.add(key);
    if (index === path.length - 1) break;
    const [nr, nc] = path[index + 1];
    assert.equal(Math.abs(r - nr) + Math.abs(c - nc), 1);
    const currentHeight = matrix[r][c];
    const nextHeight = matrix[nr][nc];
    if (mode === 'rest') {
      assert.ok(nextHeight <= currentHeight);
      mode = 'momentum';
      ceiling = currentHeight;
    } else if (nextHeight <= currentHeight) {
      ceiling = currentHeight;
    } else {
      assert.ok(nextHeight <= ceiling);
      mode = 'rest';
      ceiling = null;
    }
  }
}

test('9020 registers the springboard problem and solves a physics-rich default matrix', () => {
  assert.ok(problem);
  const run = problem.builder(problem.defaultInput);
  assert.equal(run.answer, 9);
  assert.equal(run.path.length, 9);
  assertLegalPath(run.original, run.path);
  assert.deepEqual(run.path.slice(0, 3), [[0, 0], [0, 1], [0, 2]]);
  const moves = run.steps.filter((step) => step.springboardMatrix9020View.phase === 'move');
  assert.ok(moves.some((step) => step.springboardMatrix9020View.nextMove.rule === 'launch'));
  assert.ok(moves.some((step) => step.springboardMatrix9020View.nextMove.rule === 'coast'));
  assert.ok(moves.some((step) => step.springboardMatrix9020View.nextMove.rule === 'spring'));
});

test('9020 matches independent brute force on every ternary 2x2 matrix', () => {
  for (let encoded = 0; encoded < 3 ** 4; encoded += 1) {
    let value = encoded;
    const flat = Array.from({ length: 4 }, () => {
      const digit = value % 3;
      value = Math.floor(value / 3);
      return digit;
    });
    const matrix = [flat.slice(0, 2), flat.slice(2)];
    const run = problem.builder(matrix);
    assert.equal(run.answer, bruteForce(matrix), JSON.stringify(matrix));
    assertLegalPath(matrix, run.path);
  }
});

test('9020 approach 2 stores every distinct coordinate path and groups all lengths', () => {
  assert.equal(typeof problem.builder2, 'function');
  assert.ok(Array.isArray(problem.code2));
  assert.equal(problem.extraParams.find((param) => param.key === 'approach').options.length, 3);
  const run = problem.builder2(problem.defaultInput, { approach: 2 });
  assert.equal(run.answer, 9);
  assert.equal(run.allPaths.length, 91);
  assert.equal(new Set(run.allPaths.map((path) => JSON.stringify(path))).size, run.allPaths.length);
  assert.deepEqual(run.groups.map((group) => [group.length, group.paths.length]), [
    [1, 9], [2, 12], [3, 18], [4, 20], [5, 16], [6, 8], [7, 6], [8, 1], [9, 1],
  ]);
  assert.deepEqual(run.groups.at(-1).paths[0], [[0, 0], [0, 1], [0, 2], [1, 2], [1, 1], [1, 0], [2, 0], [2, 1], [2, 2]]);
  assert.ok(run.steps.every((step) => step.codeBlock === 2));
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => problem.code2[line - 1].trim())));
  assert.equal(run.steps.at(-1).springboardMatrix9020View.groups.reduce((sum, group) => sum + group.paths.length, 0), 91);
});

test('9020 approach 2 path list matches independent enumeration on ternary 2x2 matrices', () => {
  for (let encoded = 0; encoded < 3 ** 4; encoded += 1) {
    let value = encoded;
    const flat = Array.from({ length: 4 }, () => {
      const digit = value % 3;
      value = Math.floor(value / 3);
      return digit;
    });
    const matrix = [flat.slice(0, 2), flat.slice(2)];
    const actual = problem.builder2(matrix, { approach: 2 });
    const expected = brutePaths(matrix);
    assert.deepEqual(actual.allPaths, expected, JSON.stringify(matrix));
    assert.equal(actual.answer, Math.max(...expected.map((path) => path.length)));
  }
});

test('9020 trace preserves mode, ceiling, candidate rules, and unique visited cells', () => {
  const run = problem.builder([[6, 2, 5], [1, 4, 0]]);
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps.at(-1).springboardMatrix9020View.answer, run.answer);
  for (const step of run.steps) {
    const view = step.springboardMatrix9020View;
    assert.ok(step.codeLines.every((line) => problem.code[line - 1].trim()));
    assert.equal(new Set(view.path.map((cell) => cell.join(','))).size, view.path.length);
    if (view.mode === 'rest') assert.equal(view.ceiling, null);
    if (view.mode === 'momentum') assert.ok(Number.isInteger(view.ceiling));
    for (const candidate of view.candidates) {
      if (candidate.visited) assert.equal(candidate.allowed, false);
      if (candidate.rule === 'spring' && candidate.allowed) {
        assert.equal(candidate.nextMode, 'rest');
        assert.ok(candidate.height <= view.ceiling);
        assert.ok(candidate.height > view.currentHeight);
      }
      if (candidate.rule === 'coast' && candidate.allowed) {
        assert.equal(candidate.nextMode, 'momentum');
        assert.ok(candidate.height <= view.currentHeight);
      }
    }
  }
});

test('9020 visited-set DFS matches exhaustive answers and restores the branch on backtracking', () => {
  for (let encoded = 0; encoded < 3 ** 4; encoded += 1) {
    let value = encoded;
    const flat = Array.from({ length: 4 }, () => {
      const digit = value % 3;
      value = Math.floor(value / 3);
      return digit;
    });
    const matrix = [flat.slice(0, 2), flat.slice(2)];
    const run = problem.builder3(matrix);
    assert.equal(run.answer, bruteForce(matrix), JSON.stringify(matrix));
    assertLegalPath(matrix, run.path);
    for (const step of run.steps) {
      const view = step.springboardMatrix9020View;
      assert.equal(step.codeBlock, 3);
      assert.ok(step.codeLines.every((line) => problem.code3[line - 1]?.trim()));
      assert.deepEqual(view.visited, view.path);
      assert.equal(new Set(view.visited.map(String)).size, view.visited.length);
      if (view.phase === 'add') assert.deepEqual(view.visited.at(-1), view.current);
      if (view.phase === 'remove') assert.ok(!view.visited.some((cell) => String(cell) === String(view.removed)));
      if (view.phase === 'root-done' || step.final) assert.deepEqual(view.visited, []);
      assertLegalPath(matrix, view.path);
    }
  }
});

test('9020 visited-set trace limits rendering work while still searching every branch', () => {
  const matrix = [[2, 2, 2], [2, 2, 2], [2, 2, 2]];
  const run = problem.builder3(matrix);
  assert.equal(run.answer, 9);
  assert.ok(run.skippedSteps > 0);
  assert.equal(run.steps.length, 1201);
  const final = run.steps.at(-1);
  assert.equal(final.final, true);
  assert.equal(final.springboardMatrix9020View.answer, 9);
  assert.equal(final.springboardMatrix9020View.processedRoots, 9);
  assertLegalPath(matrix, final.springboardMatrix9020View.bestPath);
});

test('9020 supplied visited-set Python handles empty input and agrees with the other approaches', () => {
  const cases = [[], [[]], [[0]], [[2, 2], [2, 2]], [[5, 1, 4], [2, 3, 0]], [[9, 6, 8], [5, 4, 7], [3, 2, 1]], [[1e9, 0, 1e9]], [[3, 1, 2, 3]]];
  const expected = cases.map((matrix) => matrix.length && matrix[0].length ? problem.builder3(matrix).answer : 0);
  const executed = spawnSync('python3', ['-c', `${problem.code3.join('\n')}\nimport json\ncases = json.loads(${JSON.stringify(JSON.stringify(cases))})\nprint(json.dumps([Solution().longestPhysicsPath(matrix) for matrix in cases]))`], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
  assert.deepEqual(JSON.parse(executed.stdout), expected);
});

test('9020 validates matrix shape, size, and height bounds', () => {
  assert.throws(() => problem.builder(''), /non-empty matrix/);
  assert.throws(() => problem.builder([[1, 2], [3]]), /rectangular matrix/);
  assert.throws(() => problem.builder([[0, -1]]), /rectangular matrix/);
  assert.throws(() => problem.builder([[1_000_000_001]]), /rectangular matrix/);
  assert.throws(() => problem.builder(Array.from({ length: 4 }, () => [1, 1, 1, 1])), /at most 12 cells/);
});

test('9020 displayed Python returns the same representative answers', () => {
  const source = `${problem.code.join('\n')}
cases = [
    ([[9,6,8],[5,4,7],[3,2,1]], 9),
    ([[5,1,4],[2,3,0]], 6),
    ([[1]], 1),
    ([[2,2],[2,2]], 4),
]
for matrix, expected in cases:
    assert Solution().longestPhysicsPath(matrix) == expected
`;
  const executed = spawnSync('python3', ['-c', source], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
});

test('9020 follow-up Python returns the longest length and complete path list', () => {
  const source = `${problem.code2.join('\n')}
longest, paths = Solution().longestPhysicsPaths([[9,6,8],[5,4,7],[3,2,1]])
assert longest == 9
assert len(paths) == 91
assert paths[-1] == [(2,2)]
assert len({tuple(path) for path in paths}) == len(paths)
`;
  const executed = spawnSync('python3', ['-c', source], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
});

test('9020 dedicated renderer handles every trace step in English and Vietnamese', () => {
  const element = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value),
  };
  context.pick = (value) => value?.[context.lang] ?? value ?? '';
  vm.createContext(context);
  vm.runInContext(rendererSource, context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderSpringboardMatrix9020View(step);
      assert.match(element.innerHTML, /spring9020-viz/);
      assert.match(element.innerHTML, /spring9020-board/);
      assert.match(element.innerHTML, /spring9020-route/);
      assert.match(element.innerHTML, /spring9020-map-arrows/);
      assert.match(element.innerHTML, /spring9020-jump/);
      assert.doesNotMatch(element.innerHTML, /spring9020-step|spring9020-neighbors/);
      assert.equal((element.innerHTML.match(/class="spring9020-cell(?: |")/g) || []).length, 9);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|object Object/);
    }
  }
});

test('9020 follow-up renderer shows path copies, counts, and the complete grouped list', () => {
  const element = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value),
  };
  context.pick = (value) => value?.[context.lang] ?? value ?? '';
  vm.createContext(context);
  vm.runInContext(rendererSource, context);
  const run = problem.builder2(problem.defaultInput, { approach: 2 });
  const samples = [run.steps[0], run.steps.find((step) => step.springboardMatrix9020View.phase === 'record'), run.steps.at(-1)];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of samples) {
      context.renderSpringboardMatrix9020View(step);
      assert.match(element.innerHTML, /spring9020-list-viz/);
      assert.match(element.innerHTML, /spring9020-list-summary/);
      assert.match(element.innerHTML, /spring9020-copy/);
      assert.match(element.innerHTML, /spring9020-mini-map/);
      assert.equal((element.innerHTML.match(/class="spring9020-cell(?: |")/g) || []).length, 9);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|object Object/);
    }
  }
  context.lang = 'en';
  context.renderSpringboardMatrix9020View(run.steps.at(-1));
  assert.match(element.innerHTML, /Saved paths/);
  assert.match(element.innerHTML, /91 paths/);
  assert.match(element.innerHTML, /Longest/);
  assert.equal((element.innerHTML.match(/<details class="(?:longest|)"/g) || []).length, 9);
  assert.equal((element.innerHTML.match(/<li>/g) || []).length, 91);
});

test('9020 visited-set visualization shows add, remove, returned length, and optimal path in both languages', () => {
  const element = { innerHTML: '' };
  const context = { lang: 'en', $: () => element, escapeHtml: String };
  context.pick = (value) => value?.[context.lang] ?? value ?? '';
  vm.createContext(context);
  vm.runInContext(rendererSource, context);
  const run = problem.builder3(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderSpringboardMatrix9020View(step);
      assert.match(element.innerHTML, /DFS \+ VISITED SET/);
      assert.match(element.innerHTML, /spring9020-visited-set/);
      assert.doesNotMatch(element.innerHTML, /BITMASK|undefined|NaN|Infinity|object Object/);
      assert.equal((element.innerHTML.match(/class="spring9020-cell(?: |")/g) || []).length, 9);
      if (step.springboardMatrix9020View.phase === 'add') assert.match(element.innerHTML, /visited\.add/);
      if (step.springboardMatrix9020View.phase === 'remove') assert.match(element.innerHTML, /visited\.remove/);
    }
  }
});

test('9020 frontend loads the dedicated responsive visualization', () => {
  const html = readFrontendIndex();
  const script = readFrontendJavaScript();
  const styles = readFrontendStyles();
  assert.equal(html.split('springboard-matrix-9020.css?').length - 1, 1);
  assert.equal(html.split('renderer-springboard-matrix-9020.js?').length - 1, 1);
  assert.match(script, /step\.springboardMatrix9020View/);
  assert.match(script, /renderSpringboardMatrix9020View\(step\)/);
  assert.match(styles, /\.spring9020-board \{/);
  assert.match(styles, /@container \(max-width: 500px\)/);
  assert.match(styles, /\.spring9020-route > div \{[^}]*flex-wrap: wrap/s);
  assert.match(styles, /\.spring9020-list-output details/);
});

test('9020 jump simulation follows the actual landing and blocks visited destinations', () => {
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(rendererSource, context);
  const run = problem.builder(problem.defaultInput);
  const landing = run.steps.find((step) => step.springboardMatrix9020View.phase === 'land').springboardMatrix9020View;
  const text = (vi, en) => en;
  const landed = context.springboardJump9020(landing, run.original, landing.bestPath, text);
  assert.match(landed, /\(0,0\) · 9 → \(0,1\) · 6/);
  const setRun = problem.builder3(problem.defaultInput);
  const blocked = setRun.steps.find((step) => {
    const view = step.springboardMatrix9020View;
    return view.phase === 'reject' && view.next && view.visited.some((cell) => String(cell) === String(view.next));
  }).springboardMatrix9020View;
  const rejected = context.springboardJump9020(blocked, setRun.original, blocked.path, text);
  assert.match(rejected, /× Visited/);
  assert.match(rejected, /spring9020-flight rejected/);
  assert.doesNotMatch(rejected, /animateMotion/);
});
