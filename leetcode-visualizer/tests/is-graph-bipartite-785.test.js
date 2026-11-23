"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const problem = require("../problems").SUPPORTED[785];

const BFS_SOURCE = `from collections import deque

class Solution:
    def isBipartite(self, graph: list[list[int]]) -> bool:
        n = len(graph)
        color = [-1] * n

        for start in range(n):
            if color[start] != -1:
                continue

            queue = deque([start])
            color[start] = 0

            while queue:
                node = queue.popleft()

                for nei in graph[node]:
                    if color[nei] == -1:
                        color[nei] = 1 - color[node]
                        queue.append(nei)

                    elif color[nei] == color[node]:
                        return False

        return True`;

const DFS_SOURCE = `class Solution:
    def isBipartite(self, graph: list[list[int]]) -> bool:
        n = len(graph)
        color = [-1] * n

        def dfs(node, c):
            color[node] = c

            for nei in graph[node]:
                if color[nei] == -1:
                    if not dfs(nei, 1 - c):
                        return False

                elif color[nei] == c:
                    return False

            return True

        for node in range(n):
            if color[node] == -1:
                if not dfs(node, 0):
                    return False

        return True`;

const cases = [
  [[[1, 3], [0, 2], [1, 3], [0, 2]], true],
  [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]], false],
  [[[], [2], [1], [4, 5], [3], [3]], true],
  [[[1], [0], [3, 4], [2, 4], [2, 3]], false],
  [[[]], true],
];

test("785 displays the requested deque BFS snippet exactly", () => {
  assert.equal(problem.code.join("\n"), BFS_SOURCE);
  assert.equal(problem.codeLabel.en, "Approach 1: BFS colouring with a queue");
  assert.equal(problem.code2Label.en, "Approach 2: Recursive DFS colouring");
});

test("785 displays the requested recursive DFS snippet exactly", () => {
  assert.equal(problem.code2.join("\n"), DFS_SOURCE);
});

test("785 BFS visualization agrees with the requested Python snippet", () => {
  const checks = cases.map(([graph, expected]) => `assert Solution().isBipartite(${JSON.stringify(graph)}) is ${expected ? "True" : "False"}`);
  const executed = spawnSync(process.env.PYTHON || "python3", ["-c", `${BFS_SOURCE}\n${checks.join("\n")}`], { encoding: "utf8" });
  assert.equal(executed.status, 0, executed.stderr);
  for (const [graph, expected] of cases) {
    const run = problem.builder(JSON.stringify(graph), { approach: 1 });
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.ok(run.steps.every((step) => step.codeBlock === 1));
    assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
  }
});

test("785 DFS visualization agrees with the requested Python snippet", () => {
  const checks = cases.map(([graph, expected]) => `assert Solution().isBipartite(${JSON.stringify(graph)}) is ${expected ? "True" : "False"}`);
  const executed = spawnSync(process.env.PYTHON || "python3", ["-c", `${DFS_SOURCE}\n${checks.join("\n")}`], { encoding: "utf8" });
  assert.equal(executed.status, 0, executed.stderr);
  for (const [graph, expected] of cases) {
    const run = problem.builder(JSON.stringify(graph), { approach: 2 });
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.ok(run.steps.every((step) => step.codeBlock === 2));
    assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code2.length)));
  }
});

test("785 debugger line mapping follows queue, neighbor coloring, conflict, and return lines", () => {
  const pass = problem.builder(JSON.stringify(cases[0][0]), { approach: 1 });
  const fail = problem.builder(JSON.stringify(cases[1][0]), { approach: 1 });
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "start-component" && step.codeLines.includes(12) && step.codeLines.includes(13)));
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "dequeue" && step.codeLines.includes(16)));
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "colour-neighbour" && step.codeLines.includes(20) && step.codeLines.includes(21)));
  assert.deepEqual(pass.steps.at(-1).codeLines, [26]);
  assert.ok(fail.steps.some((step) => step.bipartiteView.decision === "conflict" && step.codeLines.includes(23)));
  assert.deepEqual(fail.steps.at(-1).codeLines, [24]);
});

test("785 DFS line mapping follows recursion, conflict, propagation, and returns", () => {
  const pass = problem.builder(JSON.stringify(cases[0][0]), { approach: 2 });
  const fail = problem.builder(JSON.stringify(cases[1][0]), { approach: 2 });
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "start-component" && step.codeLines.includes(19) && step.codeLines.includes(21)));
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "colour-node" && step.codeLines.includes(7)));
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "recurse" && step.codeLines.includes(11)));
  assert.ok(pass.steps.some((step) => step.bipartiteView.decision === "return-true" && step.codeLines.includes(17)));
  assert.deepEqual(pass.steps.at(-1).codeLines, [24]);
  assert.ok(fail.steps.some((step) => step.bipartiteView.decision === "conflict" && step.codeLines.includes(14) && step.codeLines.includes(15)));
  assert.ok(fail.steps.some((step) => step.bipartiteView.decision === "propagate-false" && step.codeLines.includes(11) && step.codeLines.includes(12)));
  assert.deepEqual(fail.steps.at(-1).codeLines, [21, 22]);
});

function makeRenderer(language = "en") {
  const element = {};
  const context = vm.createContext({
    lang: language,
    $: () => element,
    escapeHtml: value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/renderers-01.js"), "utf8"), context);
  return step => {
    context.renderBipartiteView(step);
    return element.innerHTML;
  };
}

test("785 renders actual node colours and a persistent conflict witness for both approaches", () => {
  const render = makeRenderer();
  for (const approach of [1, 2]) {
    const run = problem.builder(JSON.stringify(cases[1][0]), { approach });
    const conflictStep = run.steps.find(step => step.bipartiteView.conflictEdge);
    const { u, v, color } = conflictStep.bipartiteView.conflictEdge;
    for (const step of run.steps.filter(step => step.bipartiteView.conflictEdge)) {
      const html = render(step);
      assert.match(html, /Same colour → False/);
      assert.match(html, new RegExp(`bip785-edge conflict" data-edge="(?:${u}-${v}|${v}-${u})"`));
      for (const node of [u, v]) {
        assert.match(html, new RegExp(`bip785-node c${color}[^\"]* conflict" data-node="${node}"`));
      }
    }
  }
});

test("785 distinguishes a pending DFS colour from the colour assigned on entry", () => {
  const run = problem.builder(JSON.stringify(cases[0][0]), { approach: 2 });
  const index = run.steps.findIndex(step => step.bipartiteView.decision === "recurse");
  const node = run.steps[index].bipartiteView.activeNeighbor;
  const render = makeRenderer();
  const pending = render(run.steps[index]);
  assert.match(pending, new RegExp(`bip785-node none[^\"]*" data-node="${node}"`));
  assert.match(pending, /Flip the neighbour's colour/);
  assert.match(pending, /uncoloured/);
  assert.match(render(run.steps[index + 1]), new RegExp(`bip785-node c1[^\"]*" data-node="${node}"`));
});

test("785 renders every frame in both languages with stable geometry and faithful queue state", () => {
  for (const language of ["en", "vi"]) {
    const render = makeRenderer(language);
    for (const approach of [1, 2]) {
      for (const [graph] of [...cases, [Array.from({ length: 12 }, () => []), true]]) {
        const run = problem.builder(JSON.stringify(graph), { approach });
        let topology;
        for (const step of run.steps) {
          const html = render(step);
          assert.doesNotMatch(html, /undefined|NaN|Infinity/);
          const nodes = [...html.matchAll(/data-node="(\d+)" transform="([^"]+)"/g)].map(match => [match[1], match[2]]);
          assert.equal(nodes.length, graph.length);
          if (topology) assert.deepEqual(nodes, topology);
          topology = nodes;
          assert.match(html, /<details class="bip785-adj">/);
          if (approach === 1 && step.bipartiteView.decision === "dequeue") {
            assert.match(html, /bip785-processing/);
            assert.ok(!step.bipartiteView.queue.includes(step.bipartiteView.activeNode));
          }
        }
        assert.match(render(run.steps.at(-1)), new RegExp(`bip785-status ${run.answer ? "true" : "false"}`));
      }
    }
  }
});
