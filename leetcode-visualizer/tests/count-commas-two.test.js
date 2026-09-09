"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");
const { prepareGenericLiveArgs } = require("../live-args");

const problem = SUPPORTED[3871];

function bruteCount(n) {
  let total = 0;
  for (let value = 1; value <= n; value++) {
    total += (value.toLocaleString("en-US").match(/,/g) || []).length;
  }
  return total;
}

function thresholdOracle(n) {
  const value = BigInt(n);
  let total = 0n;
  for (let threshold = 1000n; threshold <= value; threshold *= 1000n) {
    total += value - threshold + 1n;
  }
  return Number(total);
}

function renderStep(step, language) {
  const source = fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8");
  const start = source.indexOf("function renderCountCommas3871View");
  const end = source.indexOf("\nfunction renderStable3903View", start);
  assert.ok(start >= 0 && end > start, "#3871 renderer must be present");
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
  vm.runInNewContext(`${source.slice(start, end)}\nrenderCountCommas3871View(step);`, { ...context, step });
  return target.innerHTML;
}

test("3871 metadata and official examples are wired correctly", () => {
  assert.ok(problem);
  assert.equal(problem.slug, "count-commas-in-range-ii");
  assert.equal(problem.difficulty, "medium");
  assert.equal(problem.inputKind, "positive");
  assert.equal(problem.singleInput, true);
  assert.equal(problem.maxInput, 1000000000000000);
  assert.equal(problem.builder([1002]).answer, 3);
  assert.equal(problem.builder([998]).answer, 0);
});

test("3871 agrees with direct formatting and a BigInt threshold oracle", () => {
  for (const n of [1, 998, 999, 1000, 1002, 9999, 100000, 250000]) {
    assert.equal(problem.builder([n]).answer, bruteCount(n), `brute n=${n}`);
  }
  for (const n of [999999, 1000000, 1000002, 999999999, 1000000000, 1000000000000, 1000000000000000]) {
    assert.equal(problem.builder([n]).answer, thresholdOracle(n), `threshold n=${n}`);
  }
});

test("3871 trace checks and adds each reached comma layer", () => {
  const run = problem.builder([1000002]);
  const events = run.steps.map((step) => step.countCommas3871View.event);
  assert.deepEqual(events, ["setup", "check", "add", "check", "add", "check", "answer"]);
  assert.equal(run.steps[2].countCommas3871View.contribution, 999003);
  assert.equal(run.steps[4].countCommas3871View.contribution, 3);
  assert.equal(run.answer, 999006);
  for (const step of run.steps) {
    assert.ok(step.countCommas3871View);
    assert.ok(step.codeLines.every((line) => line >= 1 && line <= problem.code.length));
  }
});

test("3871 validates its range and prepares the live Python argument", () => {
  for (const invalid of [[], [1, 2], [0], [-1], [1.5], [1000000000000001]]) {
    assert.throws(() => problem.builder(invalid), /10\^15|exactly one/);
  }
  assert.deepEqual(prepareGenericLiveArgs(problem, [1000002], {}), [1000002]);
});

test("3871 custom renderer covers every phase in Vietnamese and English", () => {
  for (const language of ["vi", "en"]) {
    for (const n of [998, 1002, 1000002, 1000000000000000]) {
      for (const step of problem.builder([n]).steps) {
        const html = renderStep(step, language);
        assert.match(html, /cc3871-viz/);
        assert.match(html, /cc3871-phases/);
        assert.match(html, /cc3871-layer/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
});
