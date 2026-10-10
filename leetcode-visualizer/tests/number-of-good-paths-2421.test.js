const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[2421];

const DEFAULT_EDGES = [[0, 1], [0, 2], [2, 3], [2, 4]];
const edgesParam = (edges) => ({ edges: JSON.stringify(edges) });

// Oracle độc lập phía test: liệt kê mọi cặp cùng giá trị, kiểm tra max trên đường đi.
function bruteForce(vals, edges) {
  const n = vals.length;
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const parent = Array(n).fill(-1);
  const depth = Array(n).fill(0);
  parent[0] = 0;
  const stack = [0];
  while (stack.length) {
    const node = stack.pop();
    for (const next of adj[node]) {
      if (parent[next] === -1) { parent[next] = node; depth[next] = depth[node] + 1; stack.push(next); }
    }
  }
  const pathMax = (a, b) => {
    let maximum = 0; let x = a; let y = b;
    while (depth[x] > depth[y]) { maximum = Math.max(maximum, vals[x]); x = parent[x]; }
    while (depth[y] > depth[x]) { maximum = Math.max(maximum, vals[y]); y = parent[y]; }
    while (x !== y) { maximum = Math.max(maximum, vals[x], vals[y]); x = parent[x]; y = parent[y]; }
    return Math.max(maximum, vals[x]);
  };
  let total = n;
  for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) {
    if (vals[a] === vals[b] && pathMax(a, b) === vals[a]) total += 1;
  }
  return total;
}

// Pruefer-like deterministic tree generator (seeded).
function makeTree(n, seed) {
  let state = seed >>> 0;
  const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
  const edges = [];
  for (let i = 1; i < n; i += 1) edges.push([Math.floor(rand() * i), i]);
  return edges;
}

test('2421 solves the LeetCode examples', () => {
  assert.equal(problem.builder([1, 3, 2, 1, 3], edgesParam(DEFAULT_EDGES)).answer, 6);
  assert.equal(
    problem.builder([1, 1, 2, 2, 3], edgesParam([[0, 1], [1, 2], [2, 3], [2, 4]])).answer,
    7,
  );
  assert.equal(problem.builder([1], edgesParam([])).answer, 1);
});

test('2421 matches the brute-force oracle on random small trees', () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const n = 2 + (seed % 9);
    const edges = makeTree(n, seed);
    const vals = Array.from({ length: n }, (_, i) => 1 + ((seed * 7 + i * 13) % 4));
    const expected = bruteForce(vals, edges);
    const result = problem.builder(vals, edgesParam(edges));
    assert.equal(result.answer, expected, `seed=${seed} vals=${vals}`);
  }
});

test('2421 trace walks every phase and ends with a single final frame', () => {
  const result = problem.builder([1, 3, 2, 1, 3], edgesParam(DEFAULT_EDGES));
  const finals = result.steps.filter((step) => step.final);
  assert.equal(finals.length, 1);
  assert.equal(result.steps.at(-1).final, true);
  assert.equal(result.steps.at(-1).hardProblemView.answer, 6);
  const seen = new Set(result.steps.map((step) => step.hardProblemView.phaseIndex));
  for (const phase of [0, 1, 2, 3, 4]) assert.ok(seen.has(phase), `missing phase ${phase}`);
  for (const step of result.steps) {
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    assert.ok(step.hardProblemView.graph.nodes.length > 0);
  }
  const last = result.steps.at(-1);
  assert.match(last.hardProblemView.formula.vi, /answer = 6/);
  assert.ok(last.vars.some((v) => v.value === 6));
});

test('2421 validates vals and edges without silently accepting bad trees', () => {
  const good = [1, 3, 2, 1, 3];
  assert.throws(() => problem.builder([], edgesParam([])), /2421/);
  assert.throws(() => problem.builder([0, 1], edgesParam([[0, 1]])), /2421/);
  assert.throws(() => problem.builder(good, edgesParam([[0, 1]])), /2421/); // thiếu cạnh
  assert.throws(() => problem.builder(good, edgesParam([[0, 1], [0, 2], [2, 3], [2, 3]])), /2421/); // trùng lặp chu trình
  assert.throws(() => problem.builder([1, 2, 3], edgesParam([[0, 1], [0, 1]])), /2421/); // không liên thông
  assert.throws(() => problem.builder([1, 2], edgesParam([[0, 0]])), /2421/); // khuyên
  assert.throws(() => problem.builder([1, 2], edgesParam([[0, 5]])), /2421/); // node ngoài phạm vi
  assert.throws(() => problem.builder([1, 2], edgesParam('not-json')), /2421/);
  assert.throws(() => problem.builder([1, 2], edgesParam([[0]])), /2421/);
  assert.throws(() => problem.liveArgs([1, 2], edgesParam([[0, 1], [0, 2]])), /2421/);
});

test('2421 liveArgs round-trips parsed input', () => {
  const args = problem.liveArgs([1, 3, 2, 1, 3], edgesParam(DEFAULT_EDGES));
  assert.deepEqual(args, [[1, 3, 2, 1, 3], DEFAULT_EDGES]);
  const viaObject = problem.builder({ vals: [1, 1, 2, 2, 3], edges: [[0, 1], [1, 2], [2, 3], [2, 4]] });
  assert.equal(viaObject.answer, 7);
});

test('2421 displayed Python matches an executable reference solution', () => {
  const code = problem.code.join('\n');
  const assertions = [
    'assert Solution().numberOfGoodPaths([1,3,2,1,3], [[0,1],[0,2],[2,3],[2,4]]) == 6',
    'assert Solution().numberOfGoodPaths([1,1,2,2,3], [[0,1],[1,2],[2,3],[2,4]]) == 7',
    'assert Solution().numberOfGoodPaths([1], []) == 1',
  ].join('\n');
  const run = spawnSync('python3', ['-c', `${code}\n${assertions}\n`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2421 is registered under union-find with bilingual metadata', () => {
  assert.equal(problem.id, 2421);
  assert.equal(problem.category.key, 'union-find');
  assert.ok(problem.tags.some((tag) => tag.key === 'union-find'));
  assert.ok(problem.tags.some((tag) => tag.key === 'tree'));
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.slug, 'number-of-good-paths');
  assert.ok(problem.title.vi && problem.title.en);
  assert.ok(problem.statement.vi && problem.statement.en);
  assert.equal(problem.expectedOutput, 6);
  assert.ok(Array.isArray(problem.approach) && problem.approach.length >= 3);
  assert.ok(problem.code.length > 30);
});
