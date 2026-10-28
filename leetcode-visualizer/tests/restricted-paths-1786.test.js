"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1786];
const sample = "1,2,3;1,3,3;2,3,1;1,4,2;5,2,2;3,5,1;5,4,10";

function run(edges = sample, n = 5) {
  return problem.builder(edges, { n });
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
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-restricted-paths-1786.js"), "utf8"), context);
  context.renderRestrictedPaths1786Pictures(step);
  return treeView.innerHTML;
}

test("1786 counts restricted paths", () => {
  assert.equal(run().answer, 3);
  assert.equal(run("1,2,7", 2).answer, 1);
  assert.equal(run("1,2,1;2,3,1;1,3,3", 3).answer, 2);
});

test("1786 emits visual states for Dijkstra, downhill edges, and path DP", () => {
  const result = run();
  const events = new Set(result.steps.map(step => step.restricted1786View.event));
  for (const event of ["build", "seed-target", "settle", "relax-improve", "relax-skip", "stale", "orient", "dp-seed", "dp-node", "dp-update", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of result.steps) {
    const view = step.restricted1786View;
    assert.equal(view.edges.length, 7);
    assert.equal(view.distances.length, 5);
    assert.equal(view.ways.length, 5);
    assert.equal(step.codeLines.length, 1);
  }
  const relax = result.steps.find(step => step.restricted1786View.event === "relax-improve");
  assert.ok(relax.restricted1786View.activeEdge);
  assert.equal(relax.restricted1786View.improves, true);
  const update = result.steps.find(step => step.restricted1786View.event === "dp-update");
  assert.equal(typeof update.restricted1786View.beforeWays, "number");
  assert.equal(typeof update.restricted1786View.contribution, "number");
  const finalView = result.steps.at(-1).restricted1786View;
  assert.equal(finalView.answer, 3);
  assert.equal(finalView.settledCount, 5);
  assert.ok(finalView.restrictedEdges.length > 0);
});

test("1786 renderer is picture-first across relax, DP, and result states", () => {
  const result = run();
  const relax = result.steps.find(step => step.restricted1786View.event === "relax-improve");
  const update = result.steps.find(step => step.restricted1786View.event === "dp-update");
  for (const language of ["vi", "en"]) {
    const html = render(relax, language);
    assert.match(html, /r1786-viz/);
    assert.match(html, /r1786-graph/);
    assert.match(html, /r1786-edge road active/);
    assert.match(html, /r1786-calc/);
    assert.match(html, /r1786-heap/);
    assert.doesNotMatch(html, /restricted1786-title|restricted1786-formula|undefined|NaN|object Object/);
  }
  const dpHtml = render(update);
  assert.match(dpHtml, /r1786-edge downhill active/);
  assert.match(dpHtml, /r1786-calc/);
  assert.match(dpHtml, /r1786-order/);
  assert.match(dpHtml, /r1786-way/);
  const finalHtml = render(result.steps.at(-1));
  assert.match(finalHtml, /r1786-result/);
  assert.match(finalHtml, /1 → 5/);
  assert.match(finalHtml, /3 đường ✓/);
  assert.match(finalHtml, /r1786-edge downhill/);
  assert.equal((finalHtml.match(/class="r1786-path /g) || []).length, 3);
});

test("1786 renderer, styles, and cache keys remain registered", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/restricted-paths-1786.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-restricted-paths-1786.js"), "utf8");
  assert.match(script, /renderRestrictedPaths1786Pictures\(step\)/);
  assert.match(script, /restricted1786View/);
  assert.match(html, /restricted-paths-1786\.css\?v=restricted1786-line-pictures-v2/);
  assert.match(html, /renderer-restricted-paths-1786\.js\?v=restricted1786-line-pictures-v2/);
  assert.match(css, /\.r1786-viz\s*\{/);
  assert.match(css, /#vizPanel:has\(\.r1786-viz\) :is\(#codePanel,#codePanel2\)/);
  assert.match(renderer, /function renderRestrictedPaths1786Pictures\(step\)/);
});
