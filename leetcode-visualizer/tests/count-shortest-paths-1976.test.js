"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1976];

function run(roads = problem.defaultInput, n = 7) {
  return problem.builder(roads, { n });
}

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
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderers-01.js"), "utf8"), context);
  context.renderCountPaths1976View(step);
  return treeView.innerHTML;
}

test("1976 counts all routes attaining the shortest time", () => {
  assert.equal(run().answer, 4);
  assert.equal(run("0,1,5", 2).answer, 1);
  assert.equal(run("0,1,1;0,2,1;1,3,1;2,3,1", 4).answer, 2);
  assert.equal(run("", 1).answer, 1);
});

test("1976 emits map-ready Dijkstra and shortest-route DAG states", () => {
  const result = run();
  const relations = new Set(result.steps.map(step => step.countPaths1976View.relation).filter(Boolean));
  assert.deepEqual([...relations].sort(), ["check-equal", "equal", "longer", "shorter"]);
  for (const step of result.steps) {
    const view = step.countPaths1976View;
    assert.equal(view.n, 7);
    assert.equal(view.edges.length, 10);
    assert.equal(view.nodes.length, 7);
    assert.equal(Object.keys(view.positions).length, 7);
    assert.equal(step.codeLines.length, 1);
  }
  const equal = result.steps.find(step => step.countPaths1976View.relation === "equal");
  assert.ok(equal.countPaths1976View.activeEdge);
  assert.equal(typeof equal.countPaths1976View.previousWays, "number");
  assert.equal(typeof equal.countPaths1976View.incomingWays, "number");
  const finalView = result.steps.at(-1).countPaths1976View;
  assert.equal(finalView.event, "result");
  assert.equal(finalView.answer, 4);
  assert.equal(finalView.finalizedCount, 7);
  assert.equal(finalView.shortestEdges.length, 9);
});

test("1976 renderer visualizes roads, comparisons, path counts, and result", () => {
  const result = run();
  for (const relation of ["shorter", "equal", "longer"]) {
    const step = result.steps.find(item => item.countPaths1976View.relation === relation);
    for (const language of ["vi", "en"]) {
      const html = render(step, language);
      assert.match(html, /route1976-viz/);
      assert.match(html, /route1976-map/);
      assert.match(html, new RegExp(`route1976-action ${relation}`));
      assert.match(html, new RegExp(`route1976-road[^\"]* active ${relation}`));
      assert.match(html, /class="clock"/);
      assert.match(html, /class="ways"/);
      assert.match(html, /route1976-heap/);
      assert.doesNotMatch(html, /cp1976-concepts|cp1976-rules|cp1976-node-grid|undefined|NaN|object Object/);
    }
  }
  const equalHtml = render(result.steps.find(step => step.countPaths1976View.relation === "equal"));
  assert.match(equalHtml, /×\d+ \+ ×\d+/);
  const finalHtml = render(result.steps.at(-1));
  assert.match(finalHtml, /route1976-result/);
  assert.match(finalHtml, /🚦0/);
  assert.match(finalHtml, /🏁6/);
  assert.match(finalHtml, /<strong>4<\/strong>/);
  assert.match(finalHtml, /route1976-road shortest/);
});

test("1976 picture renderer, styles, and cache keys are registered", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/style-09.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderers-01.js"), "utf8");
  assert.match(script, /"renderers-01\.js":\[[^\]]*"renderCountPaths1976View"/);
  assert.match(script, /"style-09\.css":\[[^\]]*"renderCountPaths1976View"/);
  assert.match(script, /countPaths1976View/);
  assert.match(html, /style-09\.css[^"\n]*count1976=picture-v1/);
  assert.match(html, /renderers-01\.js[^"\n]*count1976=picture-v1/);
  assert.match(css, /\.route1976-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.route1976-viz\) :is\(#codePanel, #codePanel2\)/);
  assert.match(renderer, /function renderCountPaths1976View\(step\)/);
  assert.doesNotMatch(renderer.match(/function renderCountPaths1976View[\s\S]*?\n\}/)[0], /renderGraph\(/);
});
