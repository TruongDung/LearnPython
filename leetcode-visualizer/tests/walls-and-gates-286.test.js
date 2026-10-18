"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[286];

const expectedCode = [
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def wallsAndGates(self, rooms: List[List[int]]) -> None:",
  "        if not rooms or not rooms[0]:",
  "            return",
  "",
  "        rows, cols = len(rooms), len(rooms[0])",
  "        INF = 2147483647",
  "        queue = deque()",
  "",
  "        for row in range(rows):",
  "            for col in range(cols):",
  "                if rooms[row][col] == 0:",
  "                    queue.append((row, col))",
  "",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        while queue:",
  "            row, col = queue.popleft()",
  "",
  "            for delta_row, delta_col in directions:",
  "                next_row = row + delta_row",
  "                next_col = col + delta_col",
  "",
  "                if (0 <= next_row < rows and",
  "                    0 <= next_col < cols and",
  "                    rooms[next_row][next_col] == INF):",
  "",
  "                    rooms[next_row][next_col] = rooms[row][col] + 1",
  "                    queue.append((next_row, next_col))",
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
  context.renderWallsAndGates286View(step);
  return treeView.innerHTML;
}

test("286 fills every reachable room with its nearest-gate distance", () => {
  const cases = [
    [problem.defaultInput, [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]]],
    ["0,2147483647|2147483647,2147483647", [[0, 1], [1, 2]]],
    ["2147483647,-1|2147483647,2147483647", [[2147483647, -1], [2147483647, 2147483647]]],
    ["0,-1|-1,0", [[0, -1], [-1, 0]]],
  ];
  for (const [input, expected] of cases) assert.deepEqual(problem.builder(input).answer, expected);
});

test("286 snippet and trace agree line by line", () => {
  assert.deepEqual(problem.code, expectedCode);
  assert.equal(problem.debugMode, "line-by-line");
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.wallsGates286View?.event));
  for (const event of ["gate-check", "gate-enqueue", "dequeue", "neighbor-check", "distance-update", "enqueue", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim(), `line ${step.codeLines[0]}`);
    assert.ok(step.wallsGates286View);
  }
  const update = run.steps.find(step => step.wallsGates286View.event === "distance-update").wallsGates286View;
  assert.ok(Array.isArray(update.origin));
  assert.ok(Array.isArray(update.direction));
  assert.equal(Math.abs(update.direction[0]) + Math.abs(update.direction[1]), 1);
  const final = run.steps.at(-1).wallsGates286View;
  assert.equal(final.phase, "result");
  assert.deepEqual(final.answer, [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]]);
  assert.equal(final.assignedRoomCount, final.roomTotal);
  assert.equal(final.maxDistance, 4);
});

test("286 displayed Python mutates rooms exactly like the visualizer", () => {
  const inputs = [
    problem.defaultInput,
    "0,2147483647|2147483647,2147483647",
    "2147483647,-1|2147483647,2147483647",
    "0,-1|-1,0",
  ];
  const payload = inputs.map(input => [
    input.split("|").map(row => row.split(",").map(Number)),
    problem.builder(input).answer,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    result = Solution().wallsAndGates(matrix)\n    assert result is None\n    assert matrix == expected\nempty = []\nassert Solution().wallsAndGates(empty) is None\nassert empty == []`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("286 renderer is picture-first and bilingual", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = [
    run.steps.find(step => step.wallsGates286View.event === "gate-enqueue"),
    run.steps.find(step => step.wallsGates286View.event === "distance-update"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /wg286-viz/);
      assert.match(html, /wg286-grid/);
      assert.match(html, /wg286-profile/);
      assert.match(html, /wg286-queue/);
      assert.match(html, /🚪|🧱|🏠/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const spread = render(frames[1], "vi");
  assert.match(spread, /wg286-direction/);
  assert.match(spread, /wg286-spark/);
  assert.match(render(frames[2], "en"), /wg286-result/);
});

test("286 renderer and no-scroll styles are registered for lazy loading", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(
    /const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/,
  )[1].replace(/,\s*}/g, "}"));

  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderWallsAndGates286View"));
  assert.match(script, /wallsGates286View/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v18-286-illustrated/);
  assert.match(html, /renderer-requested-visualizations\.js\?v=requested-visualizations-v19-286-illustrated/);
  assert.match(html, /walls286=picture-v1/);
  assert.match(css, /\.wg286-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.wg286-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderWallsAndGates286View\(step\)/);
});
