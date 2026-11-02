const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[743];

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
