"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[9007];
const inputOf = grid => grid.map(row => row.join(",")).join("|");
const paramsOf = (sources, target) => ({ sources: sources.map(point => point.join(",")).join(";"), target: target.join(",") });
const defaults = Object.fromEntries(problem.extraParams.map(item => [item.key, item.default]));
const cases = [
  { input: problem.defaultInput, params: defaults },
  { input: "0000|0110|0000", params: paramsOf([[0, 0]], [2, 3]) },
  { input: "010|111|010", params: paramsOf([[0, 0]], [2, 2]) },
  { input: "00000|01110|00000", params: paramsOf([[0, 0], [2, 4]], [0, 4]) },
  { input: "000|000|000", params: paramsOf([[0, 0], [0, 0], [2, 2]], [1, 2]) },
  { input: "0", params: paramsOf([[0, 0]], [0, 0]) },
  { input: "00000", params: paramsOf([[0, 0]], [0, 4]) },
];

function oracle(grid, sources, target) {
  // Repeated edge relaxation, independent of the FIFO implementation and parent tree.
  const d = grid.map(row => row.map(() => Infinity));
  for (const [r, c] of sources) d[r][c] = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c]) continue;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = d[r + dr]?.[c + dc];
        if (next !== undefined && next + 1 < d[r][c]) { d[r][c] = next + 1; changed = true; }
      }
    }
  }
  return Number.isFinite(d[target[0]][target[1]]) ? d[target[0]][target[1]] : -1;
}

test("9007 finds the nearest source through obstacles and its route never crosses a wall", () => {
  let seed = 9007;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const all = [...cases];
  for (let i = 0; i < 50; i++) {
    const rows = 1 + rand(6), cols = 1 + rand(7);
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(4) === 0 ? 1 : 0));
    const sources = [[rand(rows), rand(cols)], [rand(rows), rand(cols)]], target = [rand(rows), rand(cols)];
    [...sources, target].forEach(([r, c]) => { grid[r][c] = 0; });
    all.push({ input: inputOf(grid), params: paramsOf(sources, target) });
  }
  for (const { input, params } of all) {
    const [grid, sources, target] = problem.liveArgs(input, params), run = problem.builder(input, params);
    assert.equal(run.answer, oracle(grid, sources, target));
    assert.equal(run.steps.filter(step => step.final).length, 1);
    const end = run.steps.at(-1).obstacle9007View, route = end.path;
    if (run.answer < 0) assert.deepEqual(route, []);
    else {
      assert.equal(route.length - 1, run.answer);
      assert.ok(sources.some(point => point.join(",") === route[0].join(",")));
      assert.deepEqual(route.at(-1), target);
      route.forEach(([r, c], i) => {
        assert.equal(grid[r][c], 0);
        assert.equal(end.distance[`${r},${c}`], i);
        if (i) assert.equal(Math.abs(r - route[i - 1][0]) + Math.abs(c - route[i - 1][1]), 1);
      });
    }
    let lastDistance = -1;
    for (const step of run.steps) {
      const v = step.obstacle9007View;
      assert.ok(step.codeLines[0] > 0 && step.codeLines[0] <= problem.code.length);
      assert.equal(new Set(v.queue.map(point => point.join(","))).size, v.queue.length);
      if (v.operation === "dequeue") {
        const d = v.distance[v.current.join(",")]; assert.ok(d >= lastDistance); lastDistance = d;
      }
    }
  }
});

test("9007 snapshots and six stable watches match CPython after each displayed instruction", () => {
  const python = `import sys,json
${problem.code.join("\n")}
runs=[]
for case in json.load(sys.stdin):
    events,pending=[],None
    def tup(value):
        return 'None' if value is None else '—' if value=='—' else '('+', '.join(map(str,value))+')'
    def snapshot(frame,line):
        s=frame.f_locals
        cell,neighbor=s.get('cell','—'),s.get('neighbor','—')
        distance,parent=s.get('distance',{}),s.get('parent',{})
        watches=[tup(cell),tup(neighbor),distance.get(cell,'—'),tup(parent[neighbor]) if neighbor in parent else '—',distance.get(neighbor,'—'),len(s.get('queue',[]))]
        events.append({'line':line-1,'watches':watches,'queue':list(s.get('queue',[])),
            'parent':{','.join(map(str,k)):v for k,v in parent.items()},
            'distance':{','.join(map(str,k)):v for k,v in distance.items()},'path':list(s.get('path',[]))})
    def trace(frame,event,arg):
        global pending
        if frame.f_code.co_name!='shortest_path': return trace
        if event=='line':
            if pending is not None: snapshot(frame,pending)
            pending=frame.f_lineno
        elif event=='return':
            snapshot(frame,pending)
            pending=None
        return trace
    sys.settrace(trace)
    answer=shortest_path(*case)
    sys.settrace(None)
    runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const args = cases.map(({ input, params }) => problem.liveArgs(input, params));
  const process = spawnSync("python3", ["-c", python], { input: JSON.stringify(args), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.equal(process.status, 0, process.stderr);
  const names = ["cell", "neighbor", "distance[cell]", "parent[neighbor]", "distance[neighbor]", "len(queue)"];
  JSON.parse(process.stdout).forEach((expected, i) => {
    const run = problem.builder(cases[i].input, cases[i].params);
    assert.equal(run.answer, expected.answer);
    let cursor = 0;
    for (const step of run.steps) {
      const v = step.obstacle9007View, line = step.codeLines[0];
      assert.deepEqual(step.vars.map(variable => variable.name), names);
      while (cursor < expected.events.length && expected.events[cursor].line !== line) cursor++;
      assert.ok(cursor < expected.events.length, `case ${i}, line ${line}, ${v.operation}`);
      const e = expected.events[cursor++];
      assert.deepEqual(step.vars.map(variable => variable.value), e.watches, `case ${i}, line ${line}`);
      for (const name of ["queue", "parent", "distance", "path"]) assert.deepEqual(v[name], e[name], `case ${i}, ${v.operation}: ${name}`);
    }
  });
});

test("9007 rejection leaves the frontier intact, and discovery, distance and enqueue are separate", () => {
  const reasons = new Set();
  for (const { input, params } of cases) {
    const steps = problem.builder(input, params).steps;
    for (let i = 1; i < steps.length; i++) {
      const v = steps[i].obstacle9007View, prev = steps[i - 1].obstacle9007View;
      if (v.operation === "check") {
        assert.deepEqual(v.queue, prev.queue); assert.deepEqual(v.parent, prev.parent); assert.deepEqual(v.distance, prev.distance);
        if (v.reason) reasons.add(v.reason);
      }
      if (v.operation === "set-parent") {
        assert.deepEqual(v.parent[v.neighbor.join(",")], v.current);
        assert.deepEqual(v.distance, prev.distance); assert.deepEqual(v.queue, prev.queue);
      }
      if (v.operation === "set-distance") {
        assert.equal(v.distance[v.neighbor.join(",")], v.distance[v.current.join(",")] + 1);
        assert.deepEqual(v.queue, prev.queue);
      }
      if (v.operation === "enqueue") assert.deepEqual(v.queue, [...prev.queue, v.neighbor]);
      if (v.operation === "path-append") assert.deepEqual(v.path, [...prev.path, v.current]);
      if (v.operation === "path-reverse") assert.deepEqual(v.path, [...prev.path].reverse());
    }
  }
  assert.deepEqual([...reasons].sort(), ["boundary", "seen", "wall"]);
});

function renderer() {
  const host = { innerHTML: "" }, context = { lang: "vi", $: () => host,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-obstacle-grid-9007.js"), "utf8"), context);
  return { context, render: step => { context.renderObstacleGrid9007(step); return host.innerHTML; } };
}

test("9007 draws the complete map, compass, FIFO and directed route in both languages without mutating snapshots", () => {
  const { context, render } = renderer();
  for (const language of ["vi", "en"]) for (const { input, params } of cases) {
    context.lang = language;
    const run = problem.builder(input, params), frozen = JSON.stringify(run);
    for (const step of run.steps) {
      const v = step.obstacle9007View, html = render(step);
      assert.doesNotMatch(html, /NaN|Infinity|undefined|object Object|<p[ >]/);
      assert.equal((html.match(/data-cell="/g) || []).length, v.grid.length * v.grid[0].length);
      assert.equal((html.match(/class="og7-bricks"/g) || []).length, v.grid.flat().filter(Boolean).length);
      if (["done", "trace"].includes(v.phase)) assert.doesNotMatch(html, /class="og7-queue"/);
      else assert.match(html, /class="og7-compass"/);
      if (v.path.length > 1) assert.equal((html.match(/class="og7-arrow route"/g) || []).length, v.path.length - 1);
      if (v.operation === "check" && v.reason === "boundary") assert.match(html, /class="og7-arrow rejected"/);
    }
    const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
    assert.equal(JSON.stringify(run), frozen);
  }
});

test("9007 keeps a long queue's first and last cells and validates coordinates", () => {
  const { render } = renderer(), params = paramsOf(Array.from({ length: 19 }, (_, c) => [0, c]), [0, 19]);
  const html = render(problem.builder("0".repeat(20), params).steps[0]);
  assert.match(html, /data-queue-cell="0,0"/); assert.match(html, /data-queue-cell="0,18"/);
  assert.match(html, /og7-q-more/);
  assert.deepEqual(problem.liveArgs("00", paramsOf([[0, 0], [0, 0]], [0, 1]))[1], [[0, 0]]);
  for (const [input, params] of [
    ["01", paramsOf([[0, 1]], [0, 0])], ["01", paramsOf([[0, 0]], [0, 1])],
    ["00", paramsOf([[-1, 0]], [0, 0])], ["00", { sources: "0,0,1", target: "0,1" }],
    ["00", { sources: "0,0", target: "0,0;0,1" }], ["01|0", defaults], ["02", defaults],
  ]) assert.throws(() => problem.builder(input, params));
});

test("9007 has dedicated lazy assets and keeps source lines unwrapped with horizontal scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/obstacle-grid-9007.css"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(html, /obstacle-grid-9007\.css[^\n]*data-problem-ids="9007"/);
  assert.match(html, /renderer-obstacle-grid-9007\.js[^\n]*data-problem-ids="9007"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?obstacle-grid-9007\.(?:css|js)/);
  assert.match(script, /Boolean\(step.obstacle9007View\)[^\n]*renderObstacleGrid9007\(step\)/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*width:max-content; white-space:pre/);
  assert.match(css, /\.code-line \.txt\s*\{[^}]*flex:0 0 auto; white-space:pre; overflow-wrap:normal/);
});
