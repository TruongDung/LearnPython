"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[417];

const expectedCode = [
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:",
  "        rows, cols = len(heights), len(heights[0])",
  "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
  "        def bfs(starts):",
  "            reachable = set(starts)",
  "            queue = deque(starts)",
  "            while queue:",
  "                row, col = queue.popleft()",
  "                for delta_row, delta_col in directions:",
  "                    next_row, next_col = row + delta_row, col + delta_col",
  "                    if not (0 <= next_row < rows and 0 <= next_col < cols) or (next_row, next_col) in reachable: continue",
  "                    if heights[next_row][next_col] < heights[row][col]: continue",
  "                    reachable.add((next_row, next_col))",
  "                    queue.append((next_row, next_col))",
  "            return reachable",
  "        pacific_starts = [(0,c) for c in range(cols)] + [(r,0) for r in range(1, rows)]",
  "        atlantic_starts = [(rows-1,c) for c in range(cols)] + [(r,cols-1) for r in range(rows-1)]",
  "        pacific = bfs(pacific_starts)",
  "        atlantic = bfs(atlantic_starts)",
  "        result = []",
  "        for row in range(rows):",
  "            for col in range(cols):",
  "                if (row, col) in pacific and (row, col) in atlantic:",
  "                    result.append([row, col])",
  "        return result",
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
  context.renderPacificAtlantic417View(step);
  return treeView.innerHTML;
}

test("417 returns cells that can reach both oceans", () => {
  const cases = [
    [problem.defaultInput, [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]],
    ["1", [[0, 0]]],
    ["1,2|4,3", [[0, 1], [1, 0], [1, 1]]],
    ["1,1,1|1,1,1", [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]],
  ];
  for (const [input, expected] of cases) assert.deepEqual(problem.builder(input).answer, expected);
});

test("417 trace stays aligned with the displayed Python", () => {
  assert.deepEqual(problem.code, expectedCode);
  assert.equal(problem.debugMode, "line-by-line");
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.pacificAtlantic417View?.event));
  for (const event of ["pacific-sources", "atlantic-sources", "ocean-start", "dequeue", "height-check", "reach", "enqueue", "intersection-check", "result-add", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim(), `line ${step.codeLines[0]}`);
    assert.ok(step.pacificAtlantic417View);
  }
  const flow = run.steps.find(step => step.pacificAtlantic417View.event === "height-check" && step.pacificAtlantic417View.canFlow).pacificAtlantic417View;
  assert.ok(Array.isArray(flow.origin));
  assert.ok(Array.isArray(flow.direction));
  const final = run.steps.at(-1).pacificAtlantic417View;
  assert.equal(final.phase, "result");
  assert.equal(final.pacificCount, 16);
  assert.equal(final.atlanticCount, 16);
  assert.equal(final.bothCount, 7);
  assert.deepEqual(final.answer, [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]);
});

test("417 displayed Python agrees with the visualizer", () => {
  const inputs = [problem.defaultInput, "1", "1,2|4,3", "1,1,1|1,1,1"];
  const payload = inputs.map(input => [
    input.split("|").map(row => row.split(",").map(Number)),
    problem.builder(input).answer,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    assert Solution().pacificAtlantic(matrix) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("417 renderer visualizes two oceans, reverse flow, and overlap", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = [
    run.steps.find(step => step.pacificAtlantic417View.event === "pacific-sources"),
    run.steps.find(step => step.pacificAtlantic417View.event === "height-check" && step.pacificAtlantic417View.canFlow),
    run.steps.find(step => step.pacificAtlantic417View.phase === "atlantic" && step.pacificAtlantic417View.event === "reach"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /pa417-viz/);
      assert.match(html, /pa417-map/);
      assert.match(html, /pa417-grid/);
      assert.match(html, /pa417-queue/);
      assert.match(html, /🌊|⛰️|🏔️|✨/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const flow = render(frames[1], "vi");
  assert.match(flow, /pa417-compare yes/);
  assert.match(flow, /pa417-direction/);
  const result = render(frames[3], "en");
  assert.match(result, /pa417-result/);
  assert.match(result, />7</);
});

test("417 renderer and no-scroll styles are registered for lazy loading", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(
    /const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/,
  )[1].replace(/,\s*}/g, "}"));

  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderPacificAtlantic417View"));
  assert.match(script, /pacificAtlantic417View/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v20-417-illustrated/);
  assert.match(html, /renderer-requested-visualizations\.js\?v=requested-visualizations-v21-417-illustrated/);
  assert.match(html, /water417=picture-v1/);
  assert.match(css, /\.pa417-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.pa417-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderPacificAtlantic417View\(step\)/);
});
