"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1765];

const expectedCode = [
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def highestPeak(self, isWater: List[List[int]]) -> List[List[int]]:",
  "        rows, cols = len(isWater), len(isWater[0])",
  "",
  "        heights = [[-1] * cols for _ in range(rows)]",
  "        queue = deque()",
  "",
  "        # Step 1: Add all water cells to the queue",
  "        for row in range(rows):",
  "            for col in range(cols):",
  "                if isWater[row][col] == 1:",
  "                    heights[row][col] = 0",
  "                    queue.append((row, col))",
  "",
  "        directions = [(1, 0), (-1, 0),",
  "                      (0, 1), (0, -1)]",
  "",
  "        # Step 2: Multi-source BFS",
  "        while queue:",
  "            row, col = queue.popleft()",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = row + dr, col + dc",
  "",
  "                if (0 <= nr < rows and",
  "                    0 <= nc < cols and",
  "                    heights[nr][nc] == -1):",
  "",
  "                    heights[nr][nc] = heights[row][col] + 1",
  "                    queue.append((nr, nc))",
  "",
  "        return heights",
];

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => {
      assert.equal(id, "treeView");
      return treeView;
    },
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderHighestPeak1765View(step);
  return treeView.innerHTML;
}

test("1765 builds the expected height maps", () => {
  const cases = [
    [problem.defaultInput, [[1, 0], [2, 1]]],
    ["1,0,0|0,0,0|0,0,0", [[0, 1, 2], [1, 2, 3], [2, 3, 4]]],
    ["1,0,1|0,0,0|0,1,0", [[0, 1, 0], [1, 1, 1], [1, 0, 1]]],
    ["0,0|0,0", [[-1, -1], [-1, -1]]],
  ];
  for (const [input, expected] of cases) assert.deepEqual(problem.builder(input).answer, expected);
});

test("1765 snippet and trace agree line by line", () => {
  assert.deepEqual(problem.code, expectedCode);
  assert.equal(problem.debugMode, "line-by-line");
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.highestPeak1765View?.event));
  for (const event of ["source-check", "source-height", "source-enqueue", "dequeue", "neighbor-check", "height-update", "enqueue", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(step.highestPeak1765View);
  }
  const update = run.steps.find(step => step.highestPeak1765View.event === "height-update").highestPeak1765View;
  assert.ok(Array.isArray(update.origin));
  assert.ok(Array.isArray(update.direction));
  assert.equal(Math.abs(update.direction[0]) + Math.abs(update.direction[1]), 1);
  const final = run.steps.at(-1).highestPeak1765View;
  assert.equal(final.phase, "result");
  assert.deepEqual(final.answer, [[1, 0], [2, 1]]);
  assert.equal(final.assignedCount, final.totalCells);
  assert.equal(final.maxHeight, 2);
});

test("1765 displayed Python returns the same maps as the visualizer", () => {
  const inputs = [
    problem.defaultInput,
    "1,0,0|0,0,0|0,0,0",
    "1,0,1|0,0,0|0,1,0",
    "0,0|0,0",
  ];
  const payload = inputs.map(input => [
    input.split("|").map(row => row.split(",").map(Number)),
    problem.builder(input).answer,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    assert Solution().highestPeak(matrix) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("1765 renderer is picture-first and bilingual", () => {
  const run = problem.builder("0,1,0|0,0,0|0,0,0");
  const frames = [
    run.steps.find(step => step.highestPeak1765View.event === "source-enqueue"),
    run.steps.find(step => step.highestPeak1765View.event === "height-update"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /hp1765-viz/);
      assert.match(html, /hp1765-grid/);
      assert.match(html, /hp1765-profile/);
      assert.match(html, /hp1765-queue/);
      assert.match(html, /💧|🌱|⛰️|🏔️/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const spread = render(frames[1], "vi");
  assert.match(spread, /hp1765-direction/);
  assert.match(spread, /hp1765-spark/);
  const result = render(frames[2], "en");
  assert.match(result, /hp1765-result/);
});

test("1765 renderer and styles are registered for lazy loading", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(
    /const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/,
  )[1].replace(/,\s*}/g, "}"));

  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderHighestPeak1765View"));
  assert.match(script, /highestPeak1765View/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v18-286-illustrated/);
  assert.match(html, /renderer-requested-visualizations\.js\?v=requested-visualizations-v19-286-illustrated/);
  assert.match(html, /peak1765=picture-v1/);
  assert.match(css, /\.hp1765-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.hp1765-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderHighestPeak1765View\(step\)/);
});
