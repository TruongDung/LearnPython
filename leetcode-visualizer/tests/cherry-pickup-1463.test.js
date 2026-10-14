"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const problem = require("../problems").SUPPORTED[1463];
const encode = grid => grid.map(row => row.join(",")).join(";");
const samples = [
  [[3,1,1],[2,5,1],[1,5,5],[2,1,1]],
  [[1,0,0,0,0,0,1],[2,0,0,0,0,3,0],[2,0,9,0,0,0,0],[0,3,0,5,4,0,0],[1,0,2,3,0,0,6]],
  [[0,0],[0,0]], [[1,2],[3,4]], [[0,0,0],[0,100,0],[0,100,0]],
];
function oracle(grid) {
  const memo = new Map();
  function visit(row, c1, c2) {
    if (row === grid.length) return 0;
    const key = `${row},${c1},${c2}`;
    if (memo.has(key)) return memo.get(key);
    let best = 0;
    for (let a = c1 - 1; a <= c1 + 1; a++) for (let b = c2 - 1; b <= c2 + 1; b++) if (a >= 0 && a < grid[0].length && b >= 0 && b < grid[0].length) best = Math.max(best, visit(row + 1, a, b));
    const total = grid[row][c1] + (c1 === c2 ? 0 : grid[row][c2]) + best;
    memo.set(key, total); return total;
  }
  return visit;
}
let seed = 1463;
const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
const cases = [...samples, ...Array.from({ length: 70 }, () => {
  const rows = 2 + random() % 3, cols = 2 + random() % 3;
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => random() % 11));
})];

test("1463 matches independent recursive DP and official examples", () => {
  assert.equal(problem.builder(encode(samples[0])).answer, 24);
  assert.equal(problem.builder(encode(samples[1])).answer, 28);
  for (const grid of cases) assert.equal(problem.builder(encode(grid)).answer, oracle(grid)(0, 0, grid[0].length - 1));
});

test("1463 transition pictures use exact suffix values and count overlaps once", () => {
  for (const grid of samples) {
    const visit = oracle(grid), run = problem.builder(encode(grid));
    for (const step of run.steps) {
      const v = step.cherryPickup1463View;
      assert.equal(v.gain, grid[v.row][v.c1] + (v.c1 === v.c2 ? 0 : grid[v.row][v.c2]));
      if (v.phase === "focus") assert.equal(v.matrix.cells[v.matrix.indices.indexOf(v.c1)][v.matrix.indices.indexOf(v.c2)], null);
      if (v.phase === "write") assert.equal(v.total, visit(v.row, v.c1, v.c2));
      if (v.candidates.length) {
        assert.equal(v.candidates.length, 9);
        for (const c of v.candidates) {
          assert.equal(c.valid, c.c1 >= 0 && c.c1 < v.cols && c.c2 >= 0 && c.c2 < v.cols);
          assert.equal(c.future, c.valid ? visit(v.row + 1, c.c1, c.c2) : null);
        }
        const chosen = v.candidates.filter(c => c.best);
        assert.equal(chosen.length, 1);
        assert.equal(chosen[0].future, Math.max(...v.candidates.filter(c => c.valid).map(c => c.future)));
      }
    }
  }
});

test("1463 replay follows legal simultaneous moves and collects the reported optimum", () => {
  for (const grid of cases) {
    const run = problem.builder(encode(grid)), path = run.steps.at(-1).cherryPickup1463View.path;
    assert.deepEqual([path[0].c1, path[0].c2], [0, grid[0].length - 1]);
    assert.equal(path.length, grid.length);
    let sum = 0;
    path.forEach((p, i) => {
      assert.equal(p.row, i);
      if (i) { assert.ok(Math.abs(p.c1 - path[i - 1].c1) <= 1); assert.ok(Math.abs(p.c2 - path[i - 1].c2) <= 1); }
      sum += grid[i][p.c1] + (p.c1 === p.c2 ? 0 : grid[i][p.c2]);
      assert.equal(p.collected, sum);
    });
    assert.equal(sum, run.answer);
    const replay = run.steps.filter(s => s.cherryPickup1463View.phase === "path");
    replay.forEach((s, i) => assert.equal(s.cherryPickup1463View.path.length, i + 1));
  }
});

test("1463 displayed typed Python and live arguments agree with the JS implementation", () => {
  const program = problem.code.join("\n") + "\nimport json,sys\nfor grid,expected in json.load(sys.stdin):\n    assert Solution().cherryPickup(grid)==expected\n";
  const result = spawnSync("C:/Users/david.truong/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe", ["-c", program], { encoding: "utf8", input: JSON.stringify(cases.map(grid => [grid, oracle(grid)(0,0,grid[0].length - 1)])) });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(problem.liveArgs(encode(samples[0])), [samples[0]]);
  for (const input of ["", "1,2", "1;2", "1,2;3", "1,;2,3", "-1,2;3,4", "1.5,2;3,4", "101,2;3,4", "1,2;3,4;"]) assert.throws(() => problem.builder(input), /1463:/);
});

test("1463 accepts maximum constraints with a bounded visual trace", () => {
  const grid = Array.from({ length:70 }, () => Array(70).fill(100));
  const run = problem.builder(encode(grid));
  assert.equal(run.answer, 14000);
  assert.ok(run.steps.length < 300);
  assert.ok(JSON.stringify(run).length < 1000000);
  for (const step of run.steps) {
    const v = step.cherryPickup1463View;
    assert.ok(v.board.rowIndices.length <= 8 && v.board.colIndices.length <= 9);
    if (v.matrix) assert.ok(v.matrix.indices.length <= 8);
  }
});

test("1463 renders both languages from immutable JSON snapshots and restores Prev", () => {
  const context = { escapeHtml: String }; vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-cherry-pickup-1463.js"), "utf8"), context);
  const Klass = vm.runInContext("CherryPickup1463Visualizer", context);
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" }, renderer = new Klass({ host, language });
    for (const grid of samples) {
      const run = problem.builder(encode(grid));
      for (const step of run.steps) { renderer.render(JSON.parse(JSON.stringify(step))); assert.match(host.innerHTML, /cp1463-viz/); assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/); }
      renderer.render(run.steps[0]); const first = host.innerHTML;
      renderer.render(run.steps.at(-1)); renderer.render(run.steps[0]); assert.equal(host.innerHTML, first);
    }
  }
});
