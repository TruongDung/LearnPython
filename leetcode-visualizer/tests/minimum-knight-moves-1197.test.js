"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const { prepareGenericLiveArgs } = require("../live-args");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");
const problem = SUPPORTED[1197];

function isKnightMove([x1, y1], [x2, y2]) {
  const dx = Math.abs(x1 - x2); const dy = Math.abs(y1 - y2);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

test("1197 returns known minimum distances and a real shortest knight path", () => {
  const cases = [
    [0, 0, 0], [2, 1, 1], [1, 1, 2], [1, 0, 3], [5, 5, 4], [7, 3, 4], [-5, 5, 4], [-4, -7, 5],
  ];
  for (const [x, y, expected] of cases) {
    const run = problem.builder(String(x), { y });
    assert.equal(run.answer, expected, `target (${x},${y})`);
    assert.deepEqual(run.path[0], [0, 0]);
    assert.deepEqual(run.path.at(-1), [Math.abs(x), Math.abs(y)]);
    assert.equal(run.path.length, expected + 1);
    for (let index = 1; index < run.path.length; index++) assert.ok(isKnightMove(run.path[index - 1], run.path[index]));
    assert.equal(run.steps.filter(step => step.final).length, 1);
  }
});

test("1197 trace is single-line, source-accurate, bounded, and explains every candidate outcome", () => {
  const run = problem.builder("5", { y: 5 });
  const events = new Set(run.steps.map(step => step.knight1197View.event));
  for (const event of ["normalize", "dequeue", "candidate", "skip-bounds", "skip-visited", "enqueue", "target-found", "path-append", "path-ready", "return"]) {
    assert.ok(events.has(event), `missing event ${event}`);
  }
  run.steps.forEach((step) => {
    assert.equal(step.codeLines.length, 1);
    assert.equal(step.knight1197View.source, problem.code[step.codeLines[0] - 1]);
    assert.ok(step.knight1197View.visited.every(cell => cell.x >= -2 && cell.x <= 7 && cell.y >= -2 && cell.y <= 7));
  });
  const final = run.steps.at(-1).knight1197View;
  assert.equal(final.answer, 4);
  assert.deepEqual(final.path.map(point => [point.x, point.y]), run.path);
  assert.equal(final.phase, "done");
});

test("1197 validates the detailed range and prepares live Python arguments", () => {
  for (const [x, y] of [["x", 1], ["1.5", 2], [21, 0], [0, -21], [1, undefined]]) {
    assert.throws(() => problem.builder(String(x), { y }));
  }
  assert.deepEqual(prepareGenericLiveArgs(problem, "-5", { y: -3 }), [-5, -3]);
});

test("1197 displayed Python agrees with the visualization and reconstructs valid paths", () => {
  const executable = process.env.PYTHON || "python3";
  const source = `${problem.code.join("\n")}\nimport json\nout=[]\nfor x,y in [(0,0),(2,1),(1,0),(5,5),(-4,-7)]:\n s=Solution(); a=s.minKnightMoves(x,y); out.append([a,s.path])\nprint(json.dumps(out))\n`;
  const executed = spawnSync(executable, ["-"], { input: source, encoding: "utf8" });
  assert.equal(executed.status, 0, executed.stderr);
  const values = JSON.parse(executed.stdout);
  [[0,0],[2,1],[1,0],[5,5],[-4,-7]].forEach(([x,y], index) => {
    const run = problem.builder(String(x), { y });
    assert.equal(values[index][0], run.answer);
    assert.deepEqual(values[index][1], run.path);
  });
});

test("1197 dedicated renderer shows symmetry, board, layers, candidate gate, queue, and path in both languages", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../public/renderer-minimum-knight-moves-1197.js"), "utf8");
  const element = {};
  const context = { lang: "en", $: () => element, pick: value => typeof value === "object" ? value[context.lang] : value };
  vm.createContext(context);
  vm.runInContext(source, context);
  const run = problem.builder("5", { y: 5 });
  const samples = [
    run.steps[0],
    run.steps.find(step => step.knight1197View.event === "candidate"),
    run.steps.find(step => step.knight1197View.event === "skip-bounds"),
    run.steps.find(step => step.knight1197View.event === "enqueue"),
    run.steps.at(-1),
  ];
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of samples) {
      context.renderMinimumKnightMoves1197View(step);
      assert.match(element.innerHTML, /km1197-viz/);
      assert.match(element.innerHTML, /km1197-symmetry/);
      assert.match(element.innerHTML, /km1197-board/);
      assert.match(element.innerHTML, /km1197-layers/);
      assert.match(element.innerHTML, /km1197-candidate/);
      assert.match(element.innerHTML, /km1197-queue/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
  context.lang = "en";
  context.renderMinimumKnightMoves1197View(run.steps.at(-1));
  assert.match(element.innerHTML, /km1197-path/);
  assert.match(element.innerHTML, /minimum moves/);
});

test("1197 frontend loads its renderer and responsive theme-aware styles", () => {
  const html = readFrontendIndex(); const javascript = readFrontendJavaScript(); const css = readFrontendStyles();
  assert.match(html, /minimum-knight-moves-1197\.css/);
  assert.match(html, /renderer-minimum-knight-moves-1197\.js/);
  assert.match(javascript, /step\.knight1197View/);
  assert.match(javascript, /renderMinimumKnightMoves1197View\(step\)/);
  assert.match(css, /\.km1197-viz \{/);
  assert.match(css, /\[data-theme="light"\] \.km1197-viz/);
  assert.match(css, /@container \(max-width:720px\)/);
});
