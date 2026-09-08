"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");
const { extractLiveMethod, prepareGenericLiveArgs } = require("../live-args");

const problem = SUPPORTED[3870];

function bruteCount(n) {
  let total = 0;
  for (let value = 1; value <= n; value++) {
    total += (value.toLocaleString("en-US").match(/,/g) || []).length;
  }
  return total;
}

function renderStep(step, language) {
  const source = fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8");
  const start = source.indexOf("function renderCountCommas3870View");
  const end = source.indexOf("\nfunction renderStable3903View", start);
  assert.ok(start >= 0 && end > start, "renderer must be present in public/script.js");
  const target = { innerHTML: "" };
  const context = {
    lang: language,
    $: (id) => {
      assert.equal(id, "treeView");
      return target;
    },
    escapeHtml: (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;"),
    pick: (value) => value && typeof value === "object" ? value[language] : String(value || ""),
  };
  vm.runInNewContext(`${source.slice(start, end)}\nrenderCountCommas3870View(step);`, { ...context, step });
  return target.innerHTML;
}

test("3870 metadata and examples are wired correctly", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "count-commas-in-range");
  assert.equal(problem.inputKind, "positive");
  assert.equal(problem.singleInput, true);
  assert.equal(problem.maxInput, 100000);
  assert.equal(problem.builder([998]).answer, 0);
  assert.equal(problem.builder([999]).answer, 0);
  assert.equal(problem.builder([1000]).answer, 1);
  assert.equal(problem.builder([1002]).answer, 3);
  assert.equal(problem.builder([100000]).answer, 99001);
});

test("3870 formula agrees with independently formatted ranges", () => {
  for (const n of [1, 7, 998, 999, 1000, 1001, 1234, 9999, 10000, 54321, 100000]) {
    assert.equal(problem.builder([n]).answer, bruteCount(n), `n=${n}`);
  }
});

test("3870 trace covers both branches and keeps line references valid", () => {
  const small = problem.builder([999]);
  const large = problem.builder([1002]);
  assert.deepEqual(small.steps.map((step) => step.countCommas3870View.phase), ["read", "threshold", "answer"]);
  assert.deepEqual(large.steps.map((step) => step.countCommas3870View.phase), ["read", "threshold", "count", "answer"]);
  assert.equal(small.steps.at(-1).final, true);
  assert.equal(large.steps.at(-1).countCommas3870View.calculation, "3 × 1 = 3");
  for (const result of [small, large]) {
    for (const step of result.steps) {
      assert.ok(step.countCommas3870View);
      assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
    }
  }
});

test("3870 validates its constraint and prepares the live Python argument", () => {
  for (const input of [[0], [-1], [100001], [1.5], [], [1, 2], "bad"]) {
    assert.throws(() => problem.builder(input));
  }
  const method = extractLiveMethod(problem);
  assert.deepEqual(method, { name: "countCommas", params: ["n"] });
  assert.deepEqual(prepareGenericLiveArgs(problem, [1002]), [1002]);
  const python = spawnSync("python3", ["-c", `${problem.code.join("\n")}\nprint(Solution().countCommas(1002))`], { encoding: "utf8" });
  assert.equal(python.status, 0, python.stderr);
  assert.equal(python.stdout.trim(), "3");
});

test("3870 custom renderer works in Vietnamese and English without leaked values", () => {
  for (const language of ["vi", "en"]) {
    for (const input of [[999], [1002]]) {
      for (const step of problem.builder(input).steps) {
        const html = renderStep(step, language);
        assert.match(html, /cc3870-viz/);
        assert.match(html, /999/);
        assert.match(html, /1,000/);
        assert.doesNotMatch(html, /undefined|NaN/);
      }
    }
  }
});
