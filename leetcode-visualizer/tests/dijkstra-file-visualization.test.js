const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[9030];

test("Dijkstra file visualization is registered with the original demo and source", () => {
  const result = problem.builder(problem.defaultInput, { n: 5, start: 0 });

  assert.equal(problem.slug, undefined);
  assert.deepEqual(result.answer, [0, 3, 1, 4, 7]);
  assert.match(problem.code.join("\n"), /def dijkstra\(n, graph, start\):/);
  assert.match(problem.code.join("\n"), /heapq\.heappop\(pq\)/);
  assert.match(problem.code.join("\n"), /dist\[start\] = 0/);
});

test("Dijkstra trace shows improvements, stale heap entries, and the final distances", () => {
  const result = problem.builder(problem.defaultInput, { n: 5, start: 0 });
  const phases = result.steps.map((step) => step.dijkstraFileView.phase);
  const staleStep = result.steps.find((step) => step.dijkstraFileView.phase === "stale");
  const relaxStep = result.steps.find((step) => step.dijkstraFileView.phase === "compare"
    && step.dijkstraFileView.activeEdge?.u === 2
    && step.dijkstraFileView.activeEdge?.v === 1);
  const finalStep = result.steps.at(-1);

  assert.ok(phases.includes("build"));
  assert.ok(phases.includes("inspect"));
  assert.ok(phases.includes("update"));
  assert.ok(phases.includes("push"));
  assert.ok(staleStep);
  assert.match(staleStep.note.vi, /Bản ghi .* không còn hữu ích/);
  assert.equal(relaxStep.dijkstraFileView.candidate, 3);
  assert.equal(relaxStep.dijkstraFileView.improves, true);
  assert.deepEqual(finalStep.dijkstraFileView.answer, [0, 3, 1, 4, 7]);
  assert.equal(finalStep.final, true);
});

test("Dijkstra visualizer displays the graph, min-heap, adjacency list, and result in Vietnamese", () => {
  const result = problem.builder(problem.defaultInput, { n: 5, start: 0 });
  const treeHost = { innerHTML: "" };
  const graphHost = { innerHTML: "" };
  const context = {
    lang: "vi",
    escapeHtml: String,
    escapeXml: String,
    pick: (value) => typeof value === "object" ? value.vi : String(value),
    $: (id) => id === "treeView" ? treeHost : id === "dijkstraFileGraph" ? graphHost : { innerHTML: "" },
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, "..", "public", "renderers-01.js"), "utf8"), context);
  context.renderNetworkDelayView(result.steps.at(-1));

  assert.match(graphHost.innerHTML, /graph-svg/);
  assert.match(graphHost.innerHTML, /graph-weight/);
  assert.match(treeHost.innerHTML, /Directed graph|Đồ thị có hướng/);
  assert.match(treeHost.innerHTML, /pq · min-heap/);
  assert.match(treeHost.innerHTML, /graph\[u\]/);
  assert.match(treeHost.innerHTML, /\[0, 3, 1, 4, 7\]/);
});

test("Dijkstra trace preserves unreachable nodes and reports malformed edges", () => {
  const unreachable = problem.builder("0-1-2", { n: 3, start: 0 });
  assert.deepEqual(unreachable.answer, [0, 2, "∞"]);
  assert.deepEqual(unreachable.steps.at(-1).dijkstraFileView.answer, [0, 2, "∞"]);

  const invalid = problem.builder("0-3-1", { n: 3, start: 0 });
  assert.equal(invalid.answer, null);
  assert.equal(invalid.steps.at(-1).dijkstraFileView.phase, "invalid");
});
