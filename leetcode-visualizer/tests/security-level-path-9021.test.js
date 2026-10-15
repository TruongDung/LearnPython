const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { extractLiveMethod } = require('../live-args');
const { readFrontendIndex, readFrontendJavaScript, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');

const problem = SUPPORTED[9021];
const frame = step => step.securityPath9021View;

function oracle({ n, edges, u, v }) {
  if (u === v) return 0;
  const best = Array(n).fill(Infinity);
  const used = Array(n).fill(false);
  best[u] = 0;
  for (let round = 0; round < n; round++) {
    let node = -1;
    for (let i = 0; i < n; i++) if (!used[i] && (node < 0 || best[i] < best[node])) node = i;
    if (node < 0 || best[node] === Infinity) break;
    used[node] = true;
    for (const [a, b, safe] of edges) {
      const neighbor = a === node ? b : b === node ? a : -1;
      if (neighbor >= 0) best[neighbor] = Math.min(best[neighbor], Math.max(best[node], safe));
    }
  }
  return best[v] === Infinity ? -1 : best[v];
}

test('9021 returns the minimum key and highlights a concrete minimum route', () => {
  const input = JSON.parse(problem.defaultInput);
  const run = problem.builder(input);
  assert.equal(run.answer, 8);
  assert.deepEqual(input, JSON.parse(problem.defaultInput));
  const final = frame(run.steps.at(-1));
  assert.equal(final.final, true);
  assert.equal(final.limit, 8);
  assert.deepEqual(final.pathNodes, [0, 1, 3, 5, 6]);
  assert.deepEqual(final.pathEdges.map(index => final.edges[index][2]), [4, 6, 8, 8]);
  assert.equal(Math.max(...final.pathEdges.map(index => final.edges[index][2])), run.answer);
  assert.deepEqual(final.history, [
    { level: 6, reachable: false },
    { level: 8, reachable: true },
    { level: 7, reachable: false },
  ]);
});

test('9021 handles direct paths, equal endpoints, disconnected graphs and nonconsecutive levels', () => {
  const cases = [
    { input: { n: 2, edges: [[0, 1, 42]], u: 0, v: 1 }, answer: 42 },
    { input: { n: 3, edges: [[0, 1, 9]], u: 2, v: 2 }, answer: 0 },
    { input: { n: 3, edges: [], u: 0, v: 1 }, answer: -1 },
    { input: { n: 4, edges: [[0, 1, 2], [2, 3, 3]], u: 0, v: 3 }, answer: -1 },
    { input: { n: 4, edges: [[0, 1, 2], [1, 3, 50], [0, 2, 11], [2, 3, 12]], u: 0, v: 3 }, answer: 12 },
  ];
  for (const { input, answer } of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, answer);
    assert.equal(frame(run.steps.at(-1)).reachable, answer !== -1);
  }
});

test('9021 deterministic random graphs match an independent minimax Dijkstra oracle', () => {
  let seed = 9021;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let sample = 0; sample < 70; sample++) {
    const n = 2 + next() % 7;
    const candidates = [];
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) candidates.push([a, b]);
    const edgeCount = 1 + next() % Math.min(16, candidates.length);
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const edges = candidates.slice(0, edgeCount).map(([a, b]) => [a, b, 1 + next() % 99]);
    const input = { n, edges, u: next() % n, v: next() % n };
    assert.equal(problem.builder(input).answer, oracle(input));
  }
});

test('9021 trace only crosses open edges and binary search retains the answer', () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    const view = frame(step);
    assert.ok(step.codeLines.every(line => problem.code[line - 1]?.trim()), `invalid code line in ${view.phase}`);
    assert.ok(view.seen.every(node => node >= 0 && node < view.n));
    if (step.codeLines[0] !== 22) assert.ok(view.queue.every(node => view.seen.includes(node)));
    for (const edgeId of view.crossedEdges) assert.ok(view.edges[edgeId][2] <= view.limit);
    if (view.activeEdge !== null && view.phase === 'locked') assert.ok(view.edges[view.activeEdge][2] > view.limit);
    if (view.phase === 'cross') assert.ok(view.edges[view.activeEdge][2] <= view.limit);
    if (view.levels.length && view.phase === 'narrow') {
      assert.ok(view.left <= view.right);
      assert.ok(view.levels[view.left] <= run.answer && run.answer <= view.levels[view.right]);
    }
  }
});

test('9021 debug trace advances one executable source line at a time', () => {
  const run = problem.builder(problem.defaultInput);
  const lines = new Set(run.steps.map(step => {
    assert.equal(step.codeLines.length, 1);
    return step.codeLines[0];
  }));
  for (const line of [5, 8, 9, 11, 12, 13, 14, 16, 19, 22, 23, 25, 26, 28, 29, 31, 32, 33, 34, 36, 39, 43, 45, 46, 48, 49, 51, 53]) {
    assert.ok(lines.has(line), `default trace should execute line ${line}`);
  }
  const discover = run.steps.findIndex(step => step.codeLines[0] === 33 && frame(step).current === 1);
  assert.ok(discover >= 0);
  assert.ok(frame(run.steps[discover]).seen.includes(1));
  assert.ok(!frame(run.steps[discover]).queue.includes(1));
  assert.equal(run.steps[discover + 1].codeLines[0], 34);
  assert.ok(frame(run.steps[discover + 1]).queue.includes(1));
  assert.ok(problem.builder({ n: 3, edges: [[0, 1, 2]], u: 2, v: 2 }).steps.some(step => step.codeLines[0] === 6));
  assert.ok(problem.builder({ n: 3, edges: [], u: 0, v: 1 }).steps.some(step => step.codeLines[0] === 17));
  assert.ok(problem.builder({ n: 4, edges: [[0, 1, 2], [2, 3, 3]], u: 0, v: 3 }).steps.some(step => step.codeLines[0] === 40));
});

test('9021 rejects malformed and ambiguous graph inputs', () => {
  const bad = [
    null, '{', {}, { n: 1, edges: [[0, 1, 2]], u: 0, v: 0 },
    { n: 3, edges: [[0, 0, 1]], u: 0, v: 1 },
    { n: 3, edges: [[0, 3, 1]], u: 0, v: 1 }, { n: 3, edges: [[0, 1, 0]], u: 0, v: 1 },
    { n: 3, edges: [[0, 1, 2], [1, 0, 3]], u: 0, v: 1 }, { n: 3, edges: [[0, 1]], u: 0, v: 1 },
    { n: 3, edges: [[0, 1, 2]], u: -1, v: 1 },
  ];
  for (const input of bad) assert.throws(() => problem.builder(input), /9021:/);
});

test('9021 displayed Python and Edit & Run arguments agree with the visualizer', () => {
  const requestedSnippet = `from collections import deque

class Solution:
    def minimumSafeLevel(self, n, edges, u, v):
        if u == v:
            return 0

        graph = [[] for _ in range(n)]
        levels = set()

        for a, b, safe in edges:
            graph[a].append((b, safe))
            graph[b].append((a, safe))
            levels.add(safe)

        if not levels:
            return -1

        levels = sorted(levels)

        def can_reach(limit):
            queue = deque([u])
            visited = {u}

            while queue:
                node = queue.popleft()

                if node == v:
                    return True

                for nei, weight in graph[node]:
                    if weight <= limit and nei not in visited:
                        visited.add(nei)
                        queue.append(nei)

            return False

        # Check if any path exists
        if not can_reach(levels[-1]):
            return -1

        # Binary Search: First True
        left, right = 0, len(levels) - 1

        while left < right:
            mid = (left + right) // 2

            if can_reach(levels[mid]):
                right = mid
            else:
                left = mid + 1

        return levels[left]`;
  assert.equal(problem.code.join('\n'), requestedSnippet);
  const cases = [
    JSON.parse(problem.defaultInput),
    { n: 2, edges: [[0, 1, 42]], u: 0, v: 1 },
    { n: 4, edges: [[0, 1, 2], [2, 3, 3]], u: 0, v: 3 },
    { n: 3, edges: [[0, 1, 9]], u: 2, v: 2 },
    { n: 3, edges: [], u: 0, v: 1 },
  ];
  const source = `${problem.code.join('\n')}\nimport json, sys\nfor case in json.load(sys.stdin):\n    actual = Solution().minimumSafeLevel(case['n'], case['edges'], case['u'], case['v'])\n    assert actual == case['expected'], (actual, case['expected'])`;
  const execution = spawnSync('python3', ['-c', source], { encoding: 'utf8', input: JSON.stringify(cases.map(input => ({ ...input, expected: oracle(input) }))) });
  assert.equal(execution.status, 0, execution.stderr);
  for (const input of cases) assert.deepEqual(problem.liveArgs(input), [input.n, input.edges, input.u, input.v]);
  assert.deepEqual(extractLiveMethod(problem, 1), { name: 'minimumSafeLevel', params: ['n', 'edges', 'u', 'v'] });
});

test('9021 renderer keeps the graph visual, key states and final route clear in both languages', () => {
  const host = { innerHTML: '' };
  const context = {
    lang: 'en', $: () => host,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-security-level-path-9021.js'), 'utf8'), context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderSecurityPath9021View(step);
      assert.match(host.innerHTML, /sp9021-graph/);
      assert.match(host.innerHTML, /<svg/);
      assert.match(host.innerHTML, /sp9021-key-shape/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      if (frame(step).phase === 'locked') assert.match(host.innerHTML, /sp9021-edge locked[^>]* active/);
    }
  }
  context.renderSecurityPath9021View(run.steps.at(-1));
  assert.match(host.innerHTML, /sp9021-route found/);
  assert.match(host.innerHTML, /sp9021-edge open[^>]* route/);
  assert.match(host.innerHTML, /<output>8<\/output>/);
});

test('9021 separates the 1-4 and 2-3 edge labels and draws a visible bridge', () => {
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-security-level-path-9021.js'), 'utf8'), context);
  const Visualizer = vm.runInContext('SecurityPath9021Visualizer', context);
  const renderer = new Visualizer({ host: {}, escape: String });
  const points = renderer.positions(7);
  const oneFour = renderer.edgeGeometry(1, 4, points);
  const twoThree = renderer.edgeGeometry(2, 3, points);
  assert.equal(oneFour.curved, true);
  assert.match(oneFour.path, / L .* Q .* L /);
  assert.equal(twoThree.curved, false);
  assert.ok(Math.abs(oneFour.labelX - twoThree.labelX) >= 44 || Math.abs(oneFour.labelY - twoThree.labelY) >= 32);
  const host = { innerHTML: '' };
  new Visualizer({ host, escape: String }).render(problem.builder(problem.defaultInput).steps.at(-1));
  assert.match(host.innerHTML, /data-pair="1-4"[^>]*data-label-x="194\.40"/);
  assert.match(host.innerHTML, /data-pair="2-3"[^>]*data-label-x="243\.04"/);
  assert.match(host.innerHTML, /sp9021-bridge-underlay/);
});

test('9021 is a lazy custom interview visualization registered in the app', () => {
  assert.equal(problem.category.key, 'interview');
  assert.equal(problem.slug, null);
  assert.deepEqual(problem.tags.map(tag => tag.key), ['graph', 'binary-search', 'bfs']);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-security-level-path-9021.js'));
  assert.ok(STYLESHEET_ASSETS.includes('security-level-path-9021.css'));
  assert.match(readFrontendJavaScript(), /renderSecurityPath9021View\(step\)/);
  const active = readFrontendIndex().replace(/<template[\s\S]*?<\/template>/g, '');
  assert.doesNotMatch(active, /(?:renderer-)?security-level-path-9021\.(?:js|css)/);
});
