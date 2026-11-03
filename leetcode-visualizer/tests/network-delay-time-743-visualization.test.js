const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[743];

test("743 code snippet uses the requested numbered Dijkstra steps", () => {
  const code = problem.code.join("\n");

  assert.equal(problem.debugMode, "line-by-line");
  assert.match(code, /# Step 1: Build graph/);
  assert.match(code, /dist = \[float\("inf"\)\] \* \(n \+ 1\)/);
  assert.match(code, /minHeap = \[\(0, k\)\]/);
  assert.match(code, /time, node = heapq\.heappop\(minHeap\)/);
  assert.match(code, /newTime = time \+ weight/);
  assert.match(code, /# Step 5: Result\n        answer = max\(dist\[1:\]\)/);
  assert.match(code, /return answer if answer != float\("inf"\) else -1/);
});

test("743 trace highlights the exact Python line for every Dijkstra operation", () => {
  const result = problem.builder("1-2-4,1-3-1,3-2-2,2-4-1,3-4-5", { n: 4, k: 1 });
  const lineFor = (step) => problem.code[step.codeLines[0] - 1].trim();

  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "Create the adjacency list")), "graph = defaultdict(list)");
  assert.equal(lineFor(result.steps.find((step) => step.title.en.startsWith("Read edge "))), "for u, v, w in times:");
  assert.equal(lineFor(result.steps.find((step) => step.title.en.startsWith("graph[") && step.title.en.includes(".append"))), "graph[u].append((v, w))");
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "Initialize every distance to ∞")), 'dist = [float("inf")] * (n + 1)');
  assert.equal(lineFor(result.steps.find((step) => step.title.en.startsWith("dist[") && step.title.en.endsWith(" = 0"))), "dist[k] = 0");
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "Push the source into the min-heap")), "minHeap = [(0, k)]");
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "The heap is not empty")), "while minHeap:");
  assert.equal(lineFor(result.steps.find((step) => step.title.en.startsWith("heappop"))), "time, node = heapq.heappop(minHeap)");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "stale")), "if time > dist[node]:");
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "Skip the stale entry")), "continue");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "inspect")), "for neighbor, weight in graph[node]:");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "calculate")), "newTime = time + weight");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "compare")), "if newTime < dist[neighbor]:");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "update")), "dist[neighbor] = newTime");
  assert.equal(lineFor(result.steps.find((step) => step.networkDelayView.phase === "push")), "heapq.heappush(minHeap, (newTime, neighbor))");
  assert.equal(lineFor(result.steps.find((step) => step.title.en === "The heap is empty")), "while minHeap:");
  assert.equal(lineFor(result.steps.find((step) => step.title.en.startsWith("ans ="))), "answer = max(dist[1:])");
  assert.equal(lineFor(result.steps.at(-1)), 'return answer if answer != float("inf") else -1');
});

function renderStep(step, language = "en") {
  const treeHost = { innerHTML: "" };
  const context = {
    lang: language,
    escapeHtml: String,
    escapeXml: String,
    $: (id) => id === "treeView" ? treeHost : { innerHTML: "" },
    renderGraph: () => {},
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, "..", "public", "renderers-01.js"), "utf8"), context);
  context.renderNetworkDelayView(step);
  return treeHost.innerHTML;
}

test("743 visualization illustrates the signal route and highlights the final delay", () => {
  const result = problem.builder(problem.defaultInput, { n: 4, k: 2 });
  const html = renderStep(result.steps.at(-1));

  assert.equal(result.answer, 2);
  assert.match(html, /CURRENT STEP/);
  assert.match(html, /class="network-delay-finish"/);
  assert.match(html, /network-delay-dist is-finalized is-slowest/);
  assert.match(html, /Delay/);
  assert.doesNotMatch(html, /network-delay-guide/);
  assert.match(html, /max\(1, 0, 1, 2\) = 2/);
  assert.ok(html.indexOf("network-delay-action") < html.indexOf("networkDelayGraph"));
});

test("743 visualization shows unreachable nodes with concise Vietnamese labels", () => {
  const result = problem.builder("1-2-1", { n: 3, k: 1 });
  const html = renderStep(result.steps.at(-1), "vi");

  assert.equal(result.answer, -1);
  assert.match(html, /BƯỚC ĐANG XÉT/);
  assert.match(html, /class="network-delay-finish is-unreachable"/);
  assert.match(html, /thời gian ngắn nhất/);
  assert.match(html, /∞ trong dist → -1/);
  assert.match(html, /Có node không tới được/);
});

test("743 visualization draws the active edge and arrival-time equation", () => {
  const result = problem.builder("1-2-1,1-3-4", { n: 3, k: 1 });
  const step = result.steps.find((item) => item.networkDelayView.phase === "calculate");
  const html = renderStep(step, "vi");

  assert.match(html, /class="network-delay-signal"/);
  assert.match(html, /class="network-delay-signal-node is-origin"/);
  assert.match(html, /class="network-delay-signal-edge"/);
  assert.match(html, /dist\[1\] \+ 1 = 1/);
  assert.match(html, /Thời điểm tới 2/);
});

test("743 explains a route comparison and condenses long queues", () => {
  const result = problem.builder("1-2-1,1-3-2,1-4-3,1-5-4,1-6-5", { n: 6, k: 1 });
  const queueStep = result.steps.find((step) => step.networkDelayView.phase === "push"
    && step.networkDelayView.heap.length > 4);
  const queueHtml = renderStep(queueStep);
  const compareStep = result.steps.find((step) => step.networkDelayView.phase === "compare");
  const compareHtml = renderStep(compareStep);

  assert.match(queueHtml, /\+ 1 more/);
  assert.match(queueHtml, /NEXT/);
  assert.match(compareHtml, /1 < ∞ ✓/);
  assert.match(compareHtml, /Compare arrival times/);
});
