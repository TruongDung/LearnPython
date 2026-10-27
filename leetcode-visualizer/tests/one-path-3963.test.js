"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[3963];
const cases = [[1, 1], [1, 4], [4, 1], [2, 3], [3, 3], [4, 6], [25, 25], [25, 1], [1, 25]];

// Count legal right/down paths independently of the chosen construction.
function countPaths(grid) {
  const dp = Array(grid[0].length).fill(0);
  grid.forEach((row, r) => [...row].forEach((cell, c) => {
    dp[c] = cell === "#" ? 0 : r === 0 && c === 0 ? 1 : dp[c] + (dp[c - 1] || 0);
  }));
  return dp.at(-1);
}

test("3963 constructs exactly one valid path for every official grid size from 1×1 to 25×25", () => {
  for (let m = 1; m <= 25; m++) for (let n = 1; n <= 25; n++) {
    const input = Object.freeze([m]), params = Object.freeze({ n }), run = problem.builder(input, params);
    assert.equal(run.answer.length, m);
    assert.ok(run.answer.every(row => typeof row === "string" && row.length === n && /^[.#]+$/.test(row)));
    assert.equal(countPaths(run.answer), 1, `${m}×${n}`);
    assert.equal([...run.answer.join("")].filter(c => c === ".").length, m + n - 1);
    assert.equal(run.steps.length, 2 * (m + n) + 2, "no skipped loop iterations");
    assert.equal(run.steps.filter(s => s.final).length, 1);
    assert.deepEqual(run.steps.at(-1).onePath3963View.answer, run.answer);
    assert.deepEqual(input, [m]); assert.deepEqual(params, { n });
  }
});

test("3963 matches every completed Python statement, grid mutation and actual local variable", () => {
  const source = problem.code.join("\n");
  const python = `import sys,json,copy
scope={};filename='<onepath3963>';exec(compile(json.load(sys.stdin),filename,'exec'),scope)
runs=[]
for m,n in ${JSON.stringify(cases)}:
 events=[];pending=None
 def snapshot(frame,line):
  events.append({'line':line,'locals':copy.deepcopy({k:frame.f_locals[k] for k in ('m','n','grid','c','r') if k in frame.f_locals})})
 def trace(frame,event,arg):
  global pending
  if frame.f_code.co_filename!=filename or frame.f_code.co_name!='createGrid':return trace
  if event=='line':
   if pending is not None:snapshot(frame,pending)
   pending=frame.f_lineno
  elif event=='return':snapshot(frame,pending);pending=None
  return trace
 sys.settrace(trace);answer=scope['Solution']().createGrid(m,n);sys.settrace(None)
 runs.append({'answer':answer,'events':events})
print(json.dumps(runs))`;
  const proc = spawnSync("python3", ["-c", python], { input: JSON.stringify(source), encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  assert.equal(proc.status, 0, proc.stderr);
  JSON.parse(proc.stdout).forEach((reference, index) => {
    const [m, n] = cases[index], run = problem.builder([m], { n });
    assert.deepEqual(run.answer, reference.answer); assert.equal(run.steps.length, reference.events.length);
    run.steps.forEach((step, i) => {
      const v = step.onePath3963View, e = reference.events[i], s = e.locals;
      assert.deepEqual(step.codeLines, [e.line]); assert.deepEqual(v.locals, s);
      assert.deepEqual(v.grid, s.grid); assert.equal(v.source.text, problem.code[e.line - 1]);
      assert.equal(v.source.timing, "after");
      assert.deepEqual(step.vars.map(w => w.name), ["m", "n", "c", "r", "grid[0][c]", "grid[r][n - 1]"]);
      assert.deepEqual(step.vars.map(w => w.value), [m, n, s.c ?? "—", s.r ?? "—", s.c === undefined ? "—" : s.grid[0][s.c], s.r === undefined ? "—" : s.grid[s.r][n - 1]]);
    });
  });
});

test("3963 previews leave walls intact; each write opens exactly one cell and counters never reveal a future route", () => {
  for (const [m, n] of cases) {
    const run = problem.builder([m], { n }); let previous;
    for (const step of run.steps) {
      const v = step.onePath3963View, open = v.grid.flat().filter(c => c === ".").length;
      assert.equal(v.openCount, open); assert.equal(v.wallCount, m * n - open);
      assert.equal(v.pathCount, countPaths(v.grid));
      assert.equal(v.route.length, open);
      assert.ok(v.route.every(([r, c]) => v.grid[r][c] === "."));
      v.route.slice(1).forEach(([r, c], i) => {
        const [pr, pc] = v.route[i]; assert.ok(r === pr + 1 && c === pc || r === pr && c === pc + 1);
      });
      if (v.phase.startsWith("select")) {
        assert.deepEqual(v.grid, previous.grid);
        assert.equal(v.grid[v.focus[0]][v.focus[1]], "#");
      }
      if (v.phase.startsWith("open")) {
        assert.equal(open, previous.openCount + 1);
        const changes = v.grid.flatMap((row, r) => row.flatMap((value, c) => value !== previous.grid[r][c] ? [[r, c]] : []));
        assert.deepEqual(changes, [v.focus]);
      }
      if (!step.final) assert.equal(v.answer, null);
      previous = v;
    }
  }
});

test("3963 solve and live code share strict dimensions and accept the full 25×25 boundary", () => {
  assert.deepEqual(problem.liveArgs([25], { n: 25 }), [25, 25]);
  assert.deepEqual(problem.liveArgs([4]), [4, 6]);
  assert.deepEqual(problem.liveArgs(["2"], { n: "3" }), [2, 3]);
  for (const [input, params] of [[[], {}], [[1, 2], {}], [null, {}], ["4", {}], [[0], {}], [[26], {}], [[1.5], {}], [[NaN], {}], [[Infinity], {}], [[true], {}], [[2], { n: 0 }], [[2], { n: 26 }], [[2], { n: 2.5 }], [[2], { n: "3junk" }], [[2], { n: null }], [[2], null], [[2], []]]) {
    assert.throws(() => problem.builder(input, params), /3963/); assert.throws(() => problem.liveArgs(input, params), /3963/);
  }
});

function renderer(lang) {
  const host = { innerHTML: "", querySelector: () => null }, context = { lang, $: () => host,
    escapeHtml: x => String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]) };
  vm.createContext(context); vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-one-path-3963.js"), "utf8"), context);
  return step => { context.renderOnePath3963Pictures(step); return host.innerHTML; };
}

test("3963 drawings preserve every wall, open cell, directed path edge and output row in both languages", () => {
  for (const lang of ["vi", "en"]) {
    const render = renderer(lang);
    for (const [m, n] of cases.slice(0, 6)) {
      const run = problem.builder([m], { n }), original = JSON.stringify(run);
      for (const step of run.steps) {
        const v = step.onePath3963View, html = render(step);
        assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object|<p\b|<table\b/);
        const cells = [...html.matchAll(/data-cell="(\d+),(\d+)" data-value="([.#])"/g)];
        assert.equal(cells.length, m * n);
        assert.equal(cells.filter(cell => cell[3] === ".").length, v.openCount);
        cells.forEach(([, r, c, value]) => assert.equal(v.grid[Number(r)][Number(c)], value));
        assert.equal((html.match(/data-route-edge=/g) || []).length, Math.max(0, v.route.length - 1));
        assert.equal((html.match(/data-output-row=/g) || []).length, m);
        const rowValues = [...html.matchAll(/data-output-row="\d+"><small>\d+<\/small><code>(.*?)<\/code>/g)]
          .map(match => JSON.parse(match[1].replace(/<[^>]*>/g, "").replaceAll("'", '"')));
        assert.deepEqual(rowValues, step.final ? v.answer : v.grid, "grid rows remain character lists until return joins them");
        assert.equal(html.includes('class="op3963-path-count"'), Boolean(step.final));
      }
      const first = render(run.steps[0]); render(run.steps.at(-1)); assert.equal(render(run.steps[0]), first);
      assert.equal(JSON.stringify(run), original);
    }
    const boundary = render(problem.builder([25], { n: 25 }).steps.at(-1));
    assert.equal((boundary.match(/data-cell=/g) || []).length, 625);
  }
});

test("3963 has lazy scoped assets, explicit line debug, light/dark palettes and horizontal source scrolling", () => {
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8"), script = fs.readFileSync(require.resolve("../public/script.js"), "utf8"), css = fs.readFileSync(require.resolve("../public/one-path-3963.css"), "utf8");
  assert.equal(problem.debugMode, "line-by-line");
  assert.match(problem.code[1], /def createGrid\(self, m: int, n: int\)/);
  assert.match(html, /one-path-3963\.css[^\n]*data-problem-ids="3963"/);
  assert.match(html, /renderer-one-path-3963\.js[^\n]*data-problem-ids="3963"/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /(?:renderer-)?one-path-3963\.(?:css|js)/);
  assert.match(script, /Boolean\(step.onePath3963View\)[^\n]*renderOnePath3963Pictures\(step\)/);
  assert.match(css, /\[data-theme="light"\] \.op3963-viz/);
  assert.match(css, /\.code-panel\s*\{[^}]*overflow-x:auto/);
  assert.match(css, /\.code-line\s*\{[^}]*white-space:pre/);
});
