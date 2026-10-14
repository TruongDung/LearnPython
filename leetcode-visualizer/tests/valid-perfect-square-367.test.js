"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[367];

test("367 binary search handles perfect and non-perfect squares", () => {
  const cases = [
    [1, true],
    [4, true],
    [16, true],
    [14, false],
    [2147395600, true],
    [2147483647, false],
  ];

  for (const [num, expected] of cases) {
    assert.equal(problem.builder([num]).answer, expected, `num=${num}`);
  }

  for (let num = 1; num <= 500; num++) {
    const root = Math.floor(Math.sqrt(num));
    assert.equal(problem.builder([num]).answer, root * root === num, `num=${num}`);
  }
});

test("367 trace highlights one matching Python line per debug step", () => {
  assert.equal(problem.debugMode, "line-by-line");
  for (const num of [1, 14, 16, 2147395600, 2147483647]) {
    const run = problem.builder([num]);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
    for (const step of run.steps.filter((entry) => entry.sqrtBinaryView.event === "compute-square")) {
      assert.equal(step.sqrtBinaryView.comparison, null);
    }
    for (const step of run.steps) {
      assert.equal(step.codeLines.length, 1);
      assert.ok(step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length);
      assert.equal(typeof problem.code[step.codeLines[0] - 1], "string");
    }
    assert.doesNotThrow(() => JSON.stringify(run));
  }
});

test("367 rejects invalid inputs instead of silently changing them", () => {
  for (const num of [0, -1, 1.5, 2147483648, Number.NaN, "not a number"]) {
    assert.throws(() => problem.builder([num]), /num must be an integer/);
  }
});

test("367 visualization renders every step in Vietnamese and English", () => {
  const host = { innerHTML: "" };
  const context = {
    $: () => host,
    escapeHtml: String,
    lang: "vi",
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderers-02.js"), "utf8"), context);

  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const num of [14, 16, 2147483647]) {
      for (const step of problem.builder([num]).steps) {
        context.step = JSON.parse(JSON.stringify(step));
        vm.runInContext("renderSqrtBinaryView(step)", context);
        assert.match(host.innerHTML, /sqrt-binary-viz/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});
