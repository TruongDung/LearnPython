"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[542];

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => {
      assert.equal(id, "treeView");
      return treeView;
    },
    pick: value => typeof value === "object" ? value[language] : value,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderMatrix542View(step);
  return treeView.innerHTML;
}

test("542 returns the nearest-zero distance for representative matrices", () => {
  const cases = [
    [problem.defaultInput, [[0, 0, 0], [0, 1, 0], [1, 2, 1]]],
    ["0", [[0]]],
    ["0,0|0,0", [[0, 0], [0, 0]]],
    ["1,1,1|1,0,1|1,1,1", [[2, 1, 2], [1, 0, 1], [2, 1, 2]]],
    ["0,1,1,1", [[0, 1, 2, 3]]],
    ["1,1,1|0,1,1", [[1, 2, 3], [0, 1, 2]]],
  ];
  for (const [input, expected] of cases) assert.deepEqual(problem.builder(input).answer, expected);
});

test("542 trace follows one executable line and exposes source, wave, and result scenes", () => {
  const run = problem.builder(problem.defaultInput);
  const operations = new Set(run.steps.map(step => step.matrix542View?.operation));
  for (const operation of ["source-check", "source-enqueue", "dequeue", "neighbor-check", "distance-update", "neighbor-enqueue", "return"]) {
    assert.ok(operations.has(operation), operation);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(step.matrix542View);
  }
  const final = run.steps.at(-1).matrix542View;
  assert.equal(final.phase, "result");
  assert.equal(final.knownCount, final.totalCells);
  assert.equal(final.neighbor, null);
  assert.deepEqual(final.waves.map(wave => [wave.distance, wave.reached, wave.total]), [[0, 5, 5], [1, 3, 3], [2, 1, 1]]);
});

test("542 locks every newly discovered distance to current distance plus one", () => {
  const updates = problem.builder(problem.defaultInput).steps.filter(step => step.matrix542View.operation === "distance-update");
  assert.ok(updates.length > 0);
  for (const step of updates) {
    const view = step.matrix542View;
    const [or, oc] = view.origin;
    const [nr, nc] = view.neighbor;
    assert.equal(view.cells[nr][nc].distance, view.cells[or][oc].distance + 1);
    assert.equal(view.discovered.join(","), view.neighbor.join(","));
  }
});

test("542 displayed Python agrees with the visualizer", () => {
  const inputs = [problem.defaultInput, "0", "0,0|0,0", "1,1,1|1,0,1|1,1,1", "0,1,1,1", "1,1,1|0,1,1"];
  const payload = inputs.map(input => {
    const matrix = input.split("|").map(row => row.split(",").map(Number));
    return [matrix, problem.builder(input).answer];
  });
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    assert Solution().updateMatrix(matrix) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("542 renderer is picture-first and bilingual", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = [
    run.steps.find(step => step.matrix542View.operation === "source-enqueue"),
    run.steps.find(step => step.matrix542View.operation === "distance-update"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /m542-viz/);
      assert.match(html, /m542-source-picture/);
      assert.match(html, /m542-waves/);
      assert.match(html, /m542-grid/);
      assert.match(html, /m542-queue/);
      assert.match(html, /first visit = shortest|lần đầu = ngắn nhất/);
      assert.doesNotMatch(html, /\?\?\?|undefined|NaN|object Object/);
    }
  }
});

test("542 uses responsive theme-aware styling and compact interview copy", () => {
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  assert.match(css, /\.m542-viz\s*\{/);
  assert.match(css, /@container m542 \(max-width: 520px\)/);
  assert.match(css, /body:has\(\.m542-viz\) #stepNote \{ display: none; \}/);
  assert.match(css, /\[data-theme="light"\] \.requested-viz/);
  assert.match(css, /var\(--rv-panel\)/);
  assert.match(renderer, /function renderMatrix542View\(step\)/);
  assert.equal(problem.approach.length, 3);
  assert.equal(problem.complexity.time, "O(rows·cols)");
});
