"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1462];

function run(n, prerequisites, queries) {
  return problem.builder([n], {
    prerequisites: JSON.stringify(prerequisites),
    queries: JSON.stringify(queries),
  });
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
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8"), context);
  context.renderCourse1462View(step);
  return treeView.innerHTML;
}

test("1462 answers direct, transitive, and missing prerequisite queries", () => {
  assert.deepEqual(
    run(4, [[0, 1], [1, 2], [2, 3]], [[0, 3], [1, 3], [3, 0]]).answer,
    [true, true, false],
  );
  assert.deepEqual(run(2, [[1, 0]], [[0, 1], [1, 0]]).answer, [false, true]);
  assert.deepEqual(run(3, [], [[0, 2], [2, 0]]).answer, [false, false]);
});

test("1462 emits picture-first closure and query states", () => {
  const result = run(4, [[0, 1], [1, 2], [2, 3]], [[0, 3], [1, 3], [3, 0]]);
  const events = new Set(result.steps.map(step => step.course1462View.event));
  for (const event of ["setup", "direct", "via", "infer", "query", "result"]) {
    assert.ok(events.has(event), event);
  }
  for (const step of result.steps) {
    const view = step.course1462View;
    assert.equal(view.n, 4);
    assert.equal(view.direct.length, 4);
    assert.equal(view.reach.length, 4);
    assert.equal(view.queries.length, 3);
  }
  const inferred = result.steps.find(step => step.course1462View.event === "infer");
  const view = inferred.course1462View;
  assert.equal(view.path.length, 3);
  assert.equal(view.direct[view.from][view.to], false);
  assert.equal(view.reach[view.from][view.to], true);
  assert.ok(view.inferredCount > 0);
  assert.deepEqual(result.steps.at(-1).course1462View.queries.map(query => query.result), [true, true, false]);
});

test("1462 renderer shows graph, transitive bridge, matrix, and query cards", () => {
  const result = run(4, [[0, 1], [1, 2], [2, 3]], [[0, 3], [1, 3], [3, 0]]);
  const inferred = result.steps.find(step => step.course1462View.event === "infer");
  const query = result.steps.find(step => step.course1462View.event === "query" && step.course1462View.queries[step.course1462View.queryIndex].result === false);
  for (const language of ["vi", "en"]) {
    const html = render(inferred, language);
    assert.match(html, /cs1462-viz/);
    assert.match(html, /cs1462-graph/);
    assert.match(html, /cs1462-edge inferred active/);
    assert.match(html, /cs1462-bridge/);
    assert.match(html, /cs1462-matrix/);
    assert.match(html, /cell inferred active/);
    assert.match(html, /cs1462-queries/);
    assert.doesNotMatch(html, /undefined|NaN|object Object/);
  }
  assert.match(render(query), /cs1462-bridge query no/);
  const finalHtml = render(result.steps.at(-1));
  assert.match(finalHtml, /cs1462-result/);
  assert.match(finalHtml, /class="no"/);
  assert.match(finalHtml, /✓/);
  assert.match(finalHtml, /×/);
});

test("1462 custom renderer, styles, and cache keys are registered", () => {
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  const html = fs.readFileSync(require.resolve("../public/index.html"), "utf8");
  const css = fs.readFileSync(require.resolve("../public/requested-visualizations.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/renderer-requested-visualizations.js"), "utf8");
  const manifest = JSON.parse(script.match(/const PHASE_FOUR_RENDERER_BUNDLES = Object\.freeze\((\{[\s\S]*?\})\);/)[1].replace(/,\s*}/g, "}"));
  assert.ok(manifest["renderer-requested-visualizations.js"].includes("renderCourse1462View"));
  assert.match(script, /course1462View/);
  assert.match(html, /requested-visualizations\.css[^"\n]*course1462=picture-v1/);
  assert.match(html, /renderer-requested-visualizations\.js[^"\n]*course1462=picture-v1/);
  assert.match(html, /script\.js[^"\n]*course1462=picture-v1/);
  assert.match(css, /\.cs1462-viz\s*\{/);
  assert.match(css, /body:has\(\.cs1462-viz\) #stepNote/);
  assert.match(renderer, /function renderCourse1462View\(step\)/);
});
