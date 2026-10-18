"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1857];
const expectedCode = `from collections import deque
from typing import List

class Solution:
    def largestPathValue(self, colors: str, edges: List[List[int]]) -> int:
        n = len(colors)
        graph = [[] for _ in range(n)]
        indegree = [0] * n

        for u, v in edges:
            graph[u].append(v)
            indegree[v] += 1

        dp = [[0] * 26 for _ in range(n)]
        queue = deque()

        for i in range(n):
            if indegree[i] == 0:
                queue.append(i)

        visited = 0
        answer = 0

        while queue:
            node = queue.popleft()
            visited += 1

            color = ord(colors[node]) - ord('a')
            dp[node][color] += 1

            answer = max(answer, max(dp[node]))

            for nei in graph[node]:
                for c in range(26):
                    dp[nei][c] = max(
                        dp[nei][c],
                        dp[node][c]
                    )

                indegree[nei] -= 1

                if indegree[nei] == 0:
                    queue.append(nei)

        return answer if visited == n else -1`;

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    $: id => { assert.equal(id, "treeView"); return treeView; },
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderLargestColor1857View(step);
  return treeView.innerHTML;
}

test("1857 solves DAGs and detects cycles", () => {
  const cases = [
    ["abaca", "[[0,1],[0,2],[2,3],[3,4]]", 3],
    ["a", "[]", 1],
    ["a", "[[0,0]]", -1],
    ["bbbaa", "[[0,1],[1,2],[0,3],[3,4]]", 3],
    ["abc", "[[0,1],[1,2],[2,1]]", -1],
  ];
  for (const [colors, edges, expected] of cases) {
    assert.equal(problem.builder(colors, { edges }).answer, expected);
  }
});

test("1857 uses the requested Python and instruction-aligned frames", () => {
  assert.equal(problem.code.join("\n"), expectedCode);
  assert.equal(problem.debugMode, "line-by-line");
  assert.ok(problem.tags.some(tag => tag.key === "graph-theory" && tag.en === "Graph Theory"));
  const run = problem.builder(problem.defaultInput, { edges: problem.extraParams[0].default });
  const events = new Set(run.steps.map(step => step.largestColor1857View.event));
  for (const event of ["edge-add", "indegree-add", "enqueue", "dequeue", "color-count", "dp-transfer", "indegree-drop", "ready-check", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1].trim(), `line ${step.codeLines[0]}`);
    assert.ok(step.largestColor1857View);
  }
  const transfer = run.steps.find(step => step.largestColor1857View.event === "dp-transfer" && step.largestColor1857View.accepted);
  assert.ok(Array.isArray(transfer.largestColor1857View.activeEdge));
  assert.equal(run.steps.at(-1).largestColor1857View.answer, 3);
  assert.equal(run.steps.at(-1).largestColor1857View.visited, 5);
});

test("1857 displayed Python agrees with the visualizer", () => {
  const cases = [
    ["abaca", [[0, 1], [0, 2], [2, 3], [3, 4]]],
    ["a", []],
    ["a", [[0, 0]]],
    ["abc", [[0, 1], [1, 2], [2, 1]]],
  ];
  const payload = cases.map(([colors, edges]) => [colors, edges, problem.builder(colors, { edges }).answer]);
  const source = `${expectedCode}\nimport json, sys\nfor colors, edges, expected in json.load(sys.stdin):\n    assert Solution().largestPathValue(colors, edges) == expected`;
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("1857 renderer is picture-first for topo transfer and cycle states", () => {
  const dag = problem.builder(problem.defaultInput, { edges: problem.extraParams[0].default });
  const transfer = dag.steps.find(step => step.largestColor1857View.event === "dp-transfer" && step.largestColor1857View.accepted);
  const cycle = problem.builder("abc", { edges: [[0, 1], [1, 2], [2, 1]] }).steps.at(-1);
  for (const language of ["vi", "en"]) {
    const html = render(transfer, language);
    assert.match(html, /lc1857-viz/);
    assert.match(html, /lc1857-graph/);
    assert.match(html, /lc1857-edge active/);
    assert.match(html, /lc1857-transfer/);
    assert.match(html, /lc1857-beads/);
    assert.match(html, /lc1857-queue/);
    assert.doesNotMatch(html, /undefined|NaN|object Object/);
  }
  const cycleHtml = render(cycle, "vi");
  assert.match(cycleHtml, /lc1857-result cycle/);
  assert.match(cycleHtml, />-1</);
  assert.match(cycleHtml, /lc1857-node cycle/);
});

test("1857 renderer and no-scroll styles are registered and cache-busted", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(/const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/)[1].replace(/,\s*}/g, "}"));
  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderLargestColor1857View"));
  assert.match(script, /largestColor1857View/);
  assert.match(html, /requested-visualizations\.css\?v=requested-visualizations-v21-1857-illustrated/);
  assert.match(html, /renderer-requested-visualizations\.js\?v=requested-visualizations-v22-1857-illustrated/);
  assert.match(html, /color1857=picture-v1/);
  assert.match(css, /\.lc1857-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.lc1857-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderLargestColor1857View\(step\)/);
});
