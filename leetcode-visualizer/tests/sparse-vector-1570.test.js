"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const { readFrontendJavaScript } = require("./helpers/frontend-source");
const problem = require("../problems").SUPPORTED[1570];

function renderStep(step, language = "en") {
  const treeHost = { innerHTML: "" };
  const context = {
    lang: language,
    pick: (value) => value && typeof value === "object" ? value[language] || value.en || value.vi : value,
    escapeHtml: (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;"),
    $: (id) => id === "treeView" ? treeHost : null,
  };
  vm.createContext(context);
  vm.runInContext(
    readFileSync(join(__dirname, "..", "public", "renderer-sparse-vector-1570.js"), "utf8"),
    context,
  );
  context.renderSparseVector1570View(step);
  return treeHost.innerHTML;
}

test("1570 debugs both approaches one source line at a time", () => {
  assert.equal(problem.debugMode, "line-by-line");

  const source = readFrontendJavaScript();
  const start = source.indexOf("function shouldUseLineByLineDebug()");
  const end = source.indexOf("\n// ---- Run algorithm ----", start);
  const context = {
    problemData: { id: 1570, debugMode: problem.debugMode },
    debugBreakpoints: new Set(),
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  const runs = [
    problem.builder(problem.defaultInput),
    problem.builder2(problem.defaultInput, { approach: 2 }),
  ];

  for (const run of runs) {
    const expanded = context.expandStepsLineByLine(run.steps);
    assert.equal(context.shouldUseLineByLineDebug(), true);
    assert.ok(expanded.length > run.steps.length);
    assert.ok(expanded.every((step) => !step.codeLines || step.codeLines.length <= 1));
    assert.equal(expanded.filter((step) => step.final).length, 1);
    assert.equal(expanded.at(-1).final, true);
  }
});

test("1570 illustrates zero skipping and storing nonzero vector entries", () => {
  const result = problem.builder(problem.defaultInput);
  const zeroStep = result.steps.find((step) => step.sparseVector1570View.build.action === "skip-zero");
  const storeStep = result.steps.find((step) => step.sparseVector1570View.build.action === "store");
  const zeroHtml = renderStep(zeroStep, "vi");
  const storeHtml = renderStep(storeStep, "vi");

  assert.match(zeroHtml, /sv1570-dense-building/);
  assert.match(zeroHtml, /sv1570-visual-value is-zero/);
  assert.match(zeroHtml, /sv1570-visual-output is-empty/);
  assert.match(zeroHtml, /Bỏ số 0/);
  assert.match(storeHtml, /sv1570-visual-output/);
  assert.match(storeHtml, /Lưu cặp/);
  assert.doesNotMatch(storeHtml, /sv1570-action-note/);
});

test("1570 draws matching values, product, and hash lookup probe", () => {
  const hashRun = problem.builder(problem.defaultInput);
  const twoPointerRun = problem.builder2(problem.defaultInput, { approach: 2 });
  const hashMatch = renderStep(hashRun.steps.find((step) => step.sparseVector1570View.phase === "match"));
  const pointerMatch = renderStep(twoPointerRun.steps.find((step) => (
    step.sparseVector1570View.phase === "compare" && step.sparseVector1570View.current.relation === "match"
  )));
  const probe = renderStep(hashRun.steps.find((step) => step.sparseVector1570View.phase === "probe"));

  for (const html of [hashMatch, pointerMatch]) {
    assert.match(html, /sv1570-comparison-visual/);
    assert.match(html, /sv1570-visual-left/);
    assert.match(html, /sv1570-visual-right/);
    assert.match(html, /sv1570-visual-product/);
  }
  assert.match(probe, /sv1570-lookup-visual/);
  assert.match(probe, /lookup\[/);
});
