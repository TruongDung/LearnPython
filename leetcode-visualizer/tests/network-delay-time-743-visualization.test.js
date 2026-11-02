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

test("743 visualization explains distances, relaxations, and the final delay", () => {
  const result = problem.builder(problem.defaultInput, { n: 4, k: 2 });
  const html = renderStep(result.steps.at(-1));

  assert.equal(result.answer, 2);
  assert.match(html, /Earliest time the signal from k reaches node v/);
  assert.match(html, /dist\[u\] \+ w\(u,v\)/);
  assert.match(html, /Update dist\[v\] only when this candidate is smaller/);
  assert.match(html, /max\(1, 0, 1, 2\) = 2/);
  assert.match(html, /network delay is the largest shortest-path distance/);
  assert.match(html, /Priority queue/);
});

test("743 visualization explains unreachable nodes and localizes labels", () => {
  const result = problem.builder("1-2-1", { n: 3, k: 1 });
  const html = renderStep(result.steps.at(-1), "vi");

  assert.equal(result.answer, -1);
  assert.match(html, /Thời điểm sớm nhất tín hiệu từ k tới node v/);
  assert.match(html, /∞ trong dist → -1/);
  assert.match(html, /Còn node không thể tới từ nguồn/);
  assert.match(html, /Hàng đợi ưu tiên/);
});
