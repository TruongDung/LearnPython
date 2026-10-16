"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[1102];
const PYTHON = "C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const view = step => step.maximin1102View;
const cases = [
  [[0]], [[1000000000]], [[9, 2, 8, 7]], [[9], [2], [8]], [[5, 5], [5, 5]],
  [[8, 1, 9], [7, 6, 5]], [[1, 9], [9, 9]], [[9, 9], [9, 1]],
  problem.parseInput(problem.defaultInput),
  [[2, 2, 1, 2, 2, 2], [1, 2, 2, 2, 1, 2]],
];
function reachable(grid, level) {
  const rows = grid.length, cols = grid[0].length;
  if (grid[0][0] < level) return false;
  const queue = [[0, 0]], seen = new Set([0]);
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i];
    if (r === rows - 1 && c === cols - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, id = nr * cols + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] >= level && !seen.has(id)) {
        seen.add(id); queue.push([nr, nc]);
      }
    }
  }
  return false;
}
function oracle(grid) {
  let low = 0, high = Math.min(grid[0][0], grid.at(-1).at(-1));
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (reachable(grid, mid)) low = mid; else high = mid - 1;
  }
  return low;
}
function python(program, payload) {
  const result = spawnSync(PYTHON, ["-c", program], { encoding: "utf8", input: JSON.stringify(payload), maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("1102 maximin matches independent threshold BFS on rectangular grids, duplicates and endpoints", () => {
  const grids = [...cases];
  let seed = 1102;
  const random = () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  for (let i = 0; i < 100; i++) grids.push(Array.from({ length: 1 + random() % 5 }, () => Array.from({ length: 1 + i % 6 }, () => random() % 20)));
  for (const grid of grids) {
    const original = JSON.stringify(grid), run = problem.builder(grid), final = view(run.steps.at(-1));
    assert.equal(run.answer, oracle(grid));
    assert.equal(JSON.stringify(grid), original);
    assert.deepEqual(final.path[0].slice(0, 2), [0, 0]);
    assert.deepEqual(final.path.at(-1).slice(0, 2), [grid.length - 1, grid[0].length - 1]);
    assert.equal(Math.min(...final.path.map(cell => cell[2])), run.answer);
    final.path.slice(1).forEach(([r, c], i) => assert.equal(Math.abs(r - final.path[i][0]) + Math.abs(c - final.path[i][1]), 1));
    assert.equal(final.higherReachable, false);
  }
  assert.equal(problem.builder(problem.defaultInput).answer, 4);
});

test("1102 every Python line, local, negative heapq tuple and best cell matches CPython", () => {
  const program = problem.code.join("\n") + `
import sys,json
results=[]
for grid in json.load(sys.stdin):
    events=[]
    def trace(frame,event,arg):
        if frame.f_code.co_name=='maximumMinimumPath' and event=='line':
            v=frame.f_locals
            events.append(json.loads(json.dumps({'line':frame.f_lineno,'locals':{k:x for k,x in v.items() if k not in ('self','grid','best','heap')},'heap':v.get('heap',[]),'best':v.get('best')})))
        return trace
    sys.settrace(trace)
    answer=Solution().maximumMinimumPath(grid)
    sys.settrace(None)
    results.append({'answer':answer,'events':events})
print(json.dumps(results))
`;
  python(program, cases).forEach((expected, i) => {
    const run = problem.builder(cases[i]);
    assert.equal(run.answer, expected.answer);
    assert.deepEqual(run.steps.map(s => ({ line: s.codeLines[0], locals: view(s).locals, heap: view(s).heap })), expected.events.map(e => ({ line: e.line, locals: e.locals, heap: e.heap })));
    run.steps.forEach((s, j) => {
      assert.equal(view(s).source.timing, "before");
      assert.equal(view(s).source.text, problem.code[s.codeLines[0] - 1]);
      for (const row of view(s).cells) for (const cell of row) assert.equal(cell.best, expected.events[j].best?.[cell.r]?.[cell.c] ?? null);
    });
  });
});

test("1102 best assignment and heap push occur after their own highlighted lines", () => {
  const run = problem.builder(problem.defaultInput);
  for (let i = 0; i < run.steps.length - 1; i++) {
    const v = view(run.steps[i]), next = view(run.steps[i + 1]);
    assert.deepEqual(run.steps[i].codeLines, [v.source.line]);
    if (v.phase === "update") {
      const p = v.probe;
      assert.equal(v.cells[p.r][p.c].best, p.oldBest);
      assert.equal(next.cells[p.r][p.c].best, p.candidate);
      assert.equal(next.heap.length, v.heap.length);
    }
    if (v.phase === "push") {
      assert.equal(next.heap.length, v.heap.length + 1);
      assert.equal(next.cells[v.probe.r][v.probe.c].queued, true);
    }
    if (v.phase === "pop") {
      assert.deepEqual(next.current, v.heap[0].slice(1));
      assert.equal(next.heap.length, v.heap.length - 1);
      assert.equal(next.capacity, null);
    }
    if (v.phase === "score") assert.equal(next.capacity, 0 - v.locals.neg_score);
  }
});

test("1102 min extension and descending max-heap scores keep threshold/discovery/settlement separate", () => {
  const run = problem.builder('5,4,5|1,2,6|7,4,6');
  let last = Infinity, unreachedAllowed = false, decreased = false;
  for (const s of run.steps) {
    const v = view(s);
    if (v.capacity !== null) { assert.ok(v.capacity <= last); last = v.capacity; }
    if (v.phase === "min" || v.phase === "bounds") assert.equal(v.probe.candidate, null);
    if (v.phase === "compare") {
      assert.equal(v.probe.candidate, Math.min(v.capacity, v.probe.value));
      if (v.probe.candidate < v.capacity) decreased = true;
    }
    for (const row of v.cells) for (const cell of row) {
      assert.equal(cell.allowed, v.capacity !== null && cell.value >= v.capacity);
      assert.equal(cell.queued, v.heap.some(([, r, c]) => r === cell.r && c === cell.c));
      if (cell.allowed && cell.best === -1) unreachedAllowed = true;
      if (cell.settled) assert.ok(cell.best >= 0);
    }
  }
  assert.ok(unreachedAllowed && decreased);
});

test("1102 validates the full rectangular 0..10⁹ domain and creates typed live arguments", () => {
  assert.deepEqual(problem.liveArgs('1,2,3;4,5,6'), [[[1, 2, 3], [4, 5, 6]]]);
  assert.deepEqual(problem.liveArgs('[[0]]'), [[[0]]]);
  for (const input of ['', null, '[', '1,2|3', '1,|2,3', '-1', '1.5', '1000000001', [[true]], [[]], Array.from({length:101},()=>[1]), [Array(101).fill(1)]]) assert.throws(() => problem.builder(input), /1102:/);
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(t => t.key === 'dijkstra'));
});

test("1102 100×100 input computes the complete answer with bounded, disclosed trace and pictures", () => {
  const grid = Array.from({ length: 100 }, (_, r) => Array.from({ length: 100 }, (_, c) => 10000 - r * 100 - c));
  const run = problem.builder(grid), final = view(run.steps.at(-1));
  assert.equal(run.answer, 1);
  assert.ok(final.trace.truncated && final.trace.omitted > 0);
  assert.equal(final.higherReachable, false);
  assert.ok(run.steps.length <= 1601);
  assert.ok(JSON.stringify(run).length < 20000000);
  for (const s of run.steps) {
    const v = view(s);
    assert.ok(v.rows.length <= 6 && v.cols.length <= 6);
    for (const row of v.cells) for (const cell of row) assert.equal(cell.value, grid[cell.r][cell.c]);
  }
});

test("1102 displayed code works with the actual live editor tracer", () => {
  const source = fs.readFileSync(require.resolve('../public/live-editor.js'), 'utf8');
  const template = source.match(/const TRACER_PY = (`[\s\S]*?`);/)[1];
  const program = vm.runInNewContext(template) + `
import sys,json
payload=json.load(sys.stdin)
print(json.dumps([__viz_run_trace(payload['code'],'maximumMinimumPath',[grid])['result'] for grid in payload['grids']]))
`;
  assert.deepEqual(python(program, { code: problem.code.join('\n'), grids: cases }), cases.map(oracle));
});

test("1102 pictorial renderer restores snapshots and shows all tied bottlenecks in both languages", () => {
  const context = { escapeHtml: String }; vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-maximum-minimum-path-1102.js'), 'utf8'), context);
  const Renderer = vm.runInContext('Maximin1102Visualizer', context);
  for (const language of ['vi', 'en']) {
    const host = { innerHTML: '' }, renderer = new Renderer({ host, language });
    for (const grid of cases) {
      const run = problem.builder(grid);
      for (const s of run.steps) {
        renderer.render(JSON.parse(JSON.stringify(s)));
        assert.match(host.innerHTML, /mm1102-map/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      }
      renderer.render(run.steps[0]); const first = host.innerHTML;
      renderer.render(run.steps.at(-1));
      assert.equal((host.innerHTML.match(/mm1102-cell [^"]*path bottleneck/g) || []).length, view(run.steps.at(-1)).path.filter(cell => cell[2] === run.answer).length);
      renderer.render(run.steps[0]); assert.equal(host.innerHTML, first);
    }
  }
});

test("1102 dedicated assets are lazy and registered before the generic BFS grid", () => {
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /renderer-maximum-minimum-path-1102\.js/);
  assert.match(html, /maximum-minimum-path-1102\.css/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?maximum-minimum-path-1102\.(?:js|css)/);
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  assert.ok(source.indexOf('step.maximin1102View') < source.indexOf('step.bfsGrid'));
});
