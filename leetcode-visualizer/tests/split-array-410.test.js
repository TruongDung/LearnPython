"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[410];

const cases = [
  [[7, 2, 5, 10, 8], 2, 18],
  [[1, 2, 3, 4, 5], 2, 9],
  [[1, 4, 4], 3, 4],
  [[5], 1, 5],
];

test("410 produces the expected minimum largest sum", () => {
  for (const [nums, k, answer] of cases) {
    const run = problem.builder(nums, { k });
    assert.equal(run.answer, answer);
    const final = run.steps.at(-1).splitArray410View;
    assert.equal(final.answer, answer);
    assert.equal(final.witness.complete, true);
    assert.equal(final.witness.partitions.length, k);
  }
});

test("410 renderer stays pictorial and stable across every frame", () => {
  const source = fs.readFileSync(require.resolve("../public/renderer-split-array-410.js"), "utf8");
  for (const language of ["vi", "en"]) {
    const host = { innerHTML: "" };
    const context = { lang: language, document: { getElementById: (id) => id === "treeView" ? host : null } };
    vm.createContext(context);
    vm.runInContext(source, context);
    for (const [nums, k] of cases) {
      const run = problem.builder(nums, { k });
      for (const step of run.steps) {
        context.renderSplitArray410View(JSON.parse(JSON.stringify(step)));
        assert.match(host.innerHTML, /sa410-capacity-orb/);
        assert.match(host.innerHTML, /sa410-number-bar/);
        assert.match(host.innerHTML, /sa410-bin/);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
        assert.doesNotMatch(host.innerHTML, /sa410-event-rail|sa410-counters|sa410-invariant-list/);
      }
    }
  }
});

test("410 final frame shows exactly k boxes and k - 1 cuts", () => {
  const host = { innerHTML: "" };
  const context = { lang: "vi", document: { getElementById: () => host } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderer-split-array-410.js"), "utf8"), context);
  const final = problem.builder([7, 2, 5, 10, 8], { k: 2 }).steps.at(-1);
  context.renderSplitArray410View(final);
  assert.match(host.innerHTML, /Tối ưu = 18/);
  assert.match(host.innerHTML, />2 \/ 2<\/strong>/);
  assert.equal((host.innerHTML.match(/class="sa410-bin group-/g) || []).length, 2);
  assert.equal((host.innerHTML.match(/class="sa410-scissors"/g) || []).length, 1);
});
