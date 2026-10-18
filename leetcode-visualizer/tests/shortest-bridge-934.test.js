"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[934];

const expectedCode = [
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def shortestBridge(self, grid: List[List[int]]) -> int:",
  "        rows, cols = len(grid), len(grid[0])",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        queue = deque()",
  "        visited = set()",
  "",
  "        def mark_first_island(start_row, start_col):",
  "            stack = [(start_row, start_col)]",
  "            visited.add((start_row, start_col))",
  "",
  "            while stack:",
  "                row, col = stack.pop()",
  "                queue.append((row, col, 0))",
  "",
  "                for dr, dc in directions:",
  "                    nr, nc = row + dr, col + dc",
  "",
  "                    if (0 <= nr < rows and",
  "                        0 <= nc < cols and",
  "                        grid[nr][nc] == 1 and",
  "                        (nr, nc) not in visited):",
  "",
  "                        visited.add((nr, nc))",
  "                        stack.append((nr, nc))",
  "",
  "        # Step 1: Find and mark the first island",
  "        found = False",
  "",
  "        for row in range(rows):",
  "            if found:",
  "                break",
  "",
  "            for col in range(cols):",
  "                if grid[row][col] == 1:",
  "                    mark_first_island(row, col)",
  "                    found = True",
  "                    break",
  "",
  "        # Step 2: Multi-source BFS",
  "        while queue:",
  "            row, col, distance = queue.popleft()",
  "",
  "            for dr, dc in directions:",
  "                nr, nc = row + dr, col + dc",
  "",
  "                if not (0 <= nr < rows and",
  "                        0 <= nc < cols):",
  "                    continue",
  "",
  "                if (nr, nc) in visited:",
  "                    continue",
  "",
  "                if grid[nr][nc] == 1:",
  "                    return distance",
  "",
  "                visited.add((nr, nc))",
  "                queue.append((nr, nc, distance + 1))",
  "",
  "        return -1",
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
  context.renderShortestBridge934View(step);
  return treeView.innerHTML;
}

test("934 finds the minimum number of water cells for representative islands", () => {
  const cases = [
    [problem.defaultInput, 2],
    ["0,1|1,0", 1],
    ["1,1,1,1,1|1,0,0,0,1|1,0,1,0,1|1,0,0,0,1|1,1,1,1,1", 1],
    ["1,0,0,0,0,1", 4],
  ];
  for (const [input, expected] of cases) assert.equal(problem.builder(input).answer, expected);
});

test("934 snippet and trace agree line by line", () => {
  assert.deepEqual(problem.code, expectedCode);
  assert.equal(problem.debugMode, "line-by-line");
  const run = problem.builder(problem.defaultInput);
  const events = new Set(run.steps.map(step => step.shortestBridge934View?.event));
  for (const event of ["land-check", "dfs-call", "island-mark", "source-enqueue", "dequeue", "water-visit", "enqueue", "second-island-check", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim(), `line ${step.codeLines[0]}`);
    assert.ok(step.shortestBridge934View);
  }
  const spread = run.steps.find(step => step.shortestBridge934View.event === "water-visit").shortestBridge934View;
  assert.ok(Array.isArray(spread.origin));
  assert.ok(Array.isArray(spread.direction));
  assert.equal(Math.abs(spread.direction[0]) + Math.abs(spread.direction[1]), 1);
  const final = run.steps.at(-1).shortestBridge934View;
  assert.equal(final.phase, "result");
  assert.equal(final.answer, 2);
  assert.equal(final.bridgeLength, 2);
  assert.ok(Array.isArray(final.target));
});

test("934 displayed Python agrees with the visualizer", () => {
  const inputs = [
    problem.defaultInput,
    "0,1|1,0",
    "1,1,1,1,1|1,0,0,0,1|1,0,1,0,1|1,0,0,0,1|1,1,1,1,1",
    "1,0,0,0,0,1",
  ];
  const payload = inputs.map(input => [
    input.split("|").map(row => row.split(",").map(Number)),
    problem.builder(input).answer,
  ]);
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor matrix, expected in json.load(sys.stdin):\n    assert Solution().shortestBridge(matrix) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("934 renderer tells the island-wave-bridge story with pictures", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = [
    run.steps.find(step => step.shortestBridge934View.event === "island-mark"),
    run.steps.find(step => step.shortestBridge934View.event === "water-visit"),
    run.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const frame of frames) {
      const html = render(frame, language);
      assert.match(html, /sb934-viz/);
      assert.match(html, /sb934-grid/);
      assert.match(html, /sb934-waves/);
      assert.match(html, /sb934-tray/);
      assert.match(html, /🔎|🏝️|🌊|🪵/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
  const spread = render(frames[1], "vi");
  assert.match(spread, /sb934-direction/);
  assert.match(spread, /sb934-spark/);
  const result = render(frames[2], "en");
  assert.match(result, /sb934-result/);
  assert.match(result, /bridge/);
});

test("934 renderer and no-scroll styles are registered for lazy loading", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(
    /const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/,
  )[1].replace(/,\s*}/g, "}"));

  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderShortestBridge934View"));
  assert.match(script, /shortestBridge934View/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v21-1857-illustrated/);
  assert.match(html, /renderer-requested-visualizations\.js\?v=requested-visualizations-v22-1857-illustrated/);
  assert.match(html, /bridge934=picture-v1&water417=picture-v1&color1857=picture-v1/);
  assert.match(css, /\.sb934-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.sb934-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderShortestBridge934View\(step\)/);
});
