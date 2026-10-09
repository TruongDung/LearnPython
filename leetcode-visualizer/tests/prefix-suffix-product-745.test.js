"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const { prepareDesignLiveRun } = require("../live-args");
const { readFrontendStyles } = require("./helpers/frontend-source");
const problem = SUPPORTED[745];
const brute = (words, pref, suff) => words.reduce((best, word, index) => word.startsWith(pref) && word.endsWith(suff) ? index : best, -1);

test("745 approach 3 registers a non-nested prefix/suffix Cartesian-product implementation", () => {
  const selector = problem.extraParams.find(param => param.key === "approach");
  assert.equal(selector.options.length, 3);
  assert.match(selector.options[2].label.en, /Cartesian product/);
  assert.match(problem.code3.join("\n"), /from itertools import product/);
  assert.match(problem.code3.join("\n"), /for pref, suff in product\(prefixes, suffixes\):/);
  assert.doesNotMatch(problem.code3.join("\n"), /^\s+for (?:p|s) in/m);
  assert.deepEqual(prepareDesignLiveRun(problem, ["apple"], { queries: '[["a","e"]]', approach: 3 }, 3), {
    className: "WordFilter", constructorArgs: [["apple"]], operations: [{ name: "f", args: ["a", "e"] }],
  });
});

test("745 Cartesian-product results match scanning and both existing approaches", () => {
  const words = ["apple", "apply", "apple", "maple"];
  const queries = [["a", "e"], ["app", "ly"], ["x", "e"], ["apple", "apple"], ["m", "le"], ["ap", "e"]];
  const expected = [null, ...queries.map(([pref, suff]) => brute(words, pref, suff))];
  const run = problem.builder3(words, { queries });
  assert.deepEqual(run.answer, expected);
  assert.deepEqual(run.answer, problem.builder(words, { queries }).answer);
  assert.deepEqual(run.answer, problem.builder2(words, { queries }).answer);
  assert.equal(run.steps.filter(step => step.final).length, 1);
});

test("745 Cartesian trace exposes independent axes, L² pairs, overwrites, and exact source lines", () => {
  const run = problem.builder3(["aa", "aa"], { queries: [["a", "a"]] });
  const productSteps = run.steps.filter(step => step.prefixSuffix745View.event === "product-pair");
  const writes = run.steps.filter(step => step.prefixSuffix745View.event === "write");
  assert.equal(productSteps.length, 8);
  assert.equal(writes.length, 8);
  assert.deepEqual(productSteps[0].prefixSuffix745View.prefixes, ["a", "aa"]);
  assert.deepEqual(productSteps[0].prefixSuffix745View.suffixes, ["a", "aa"]);
  assert.equal(productSteps[0].prefixSuffix745View.pairCount, 4);
  assert.equal(writes[4].prefixSuffix745View.previousIndex, 0);
  assert.equal(writes[4].prefixSuffix745View.grid[0][0], 1);
  run.steps.forEach((step, index) => {
    const view = step.prefixSuffix745View;
    assert.equal(step.codeBlock, 3);
    assert.equal(step.codeLines.length, 1);
    assert.equal(view.source, problem.code3[view.line - 1]);
    assert.equal(view.nextLine, run.steps[index + 1]?.codeLines[0] ?? null);
    assert.equal(view.strategy, "cartesian-product");
  });
});

test("745 displayed Cartesian-product Python executes the official and largest-index cases", () => {
  const executable = process.env.PYTHON || "python3";
  const source = `${problem.code3.join("\n")}\nwf = WordFilter(["apple", "apply", "apple"])\nprint(wf.f("a", "e"), wf.f("app", "ly"), wf.f("x", "e"))\n`;
  const executed = spawnSync(executable, ["-"], { input: source, encoding: "utf8" });
  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stdout.trim(), "2 1 -1");
});

test("745 renderer explains Cartesian axes and current pair in Vietnamese and English", () => {
  const element = { querySelector: () => null };
  const context = { lang: "vi", $: () => element, escapeHtml: String };
  context.pick = value => value[context.lang];
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "public", "renderer-prefix-suffix-search-745.js"), "utf8"), context);
  const run = problem.builder3(["apple", "apply"], { queries: [["a", "e"], ["x", "e"]] });
  const samples = [
    run.steps.find(step => step.prefixSuffix745View.event === "prefixes"),
    run.steps.find(step => step.prefixSuffix745View.event === "product-pair"),
    run.steps.find(step => step.prefixSuffix745View.event === "write"),
  ];
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of samples) {
      context.renderPrefixSuffix745View(step);
      assert.match(element.innerHTML, /ps745-product/);
      assert.match(element.innerHTML, /ps745-product-formula/);
      assert.match(element.innerHTML, language === "vi" ? /TÍCH DESCARTES/ : /CARTESIAN PRODUCT/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test("745 Cartesian-product panel has scoped responsive styles", () => {
  const css = readFrontendStyles();
  assert.match(css, /\.ps745-product \{/);
  assert.match(css, /\.ps745-product-formula \{/);
  assert.match(css, /@container \(max-width: 600px\)/);
});
