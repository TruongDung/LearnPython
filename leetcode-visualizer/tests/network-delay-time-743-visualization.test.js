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

test("743 visualization puts the current action first and explains the final delay", () => {
  const result = problem.builder(problem.defaultInput, { n: 4, k: 2 });
  const html = renderStep(result.steps.at(-1));

  assert.equal(result.answer, 2);
  assert.match(html, /WHAT IS HAPPENING/);
  assert.match(html, /Time to each node/);
  assert.doesNotMatch(html, /network-delay-guide/);
  assert.match(html, /max\(1, 0, 1, 2\) = 2/);
  assert.match(html, /network delay is the largest shortest-path distance/);
  assert.ok(html.indexOf("network-delay-action") < html.indexOf("networkDelayGraph"));
});

test("743 visualization explains unreachable nodes and localizes labels", () => {
  const result = problem.builder("1-2-1", { n: 3, k: 1 });
  const html = renderStep(result.steps.at(-1), "vi");

  assert.equal(result.answer, -1);
  assert.match(html, /ĐANG XẢY RA/);
  assert.match(html, /Thời gian tới từng node/);
  assert.match(html, /∞ trong dist → -1/);
  assert.match(html, /Còn node không thể tới từ nguồn/);
  assert.match(html, /Lượt sẽ xét/);
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
  assert.match(compareHtml, /is faster than/);
  assert.match(compareHtml, /Update the best known time/);
});
