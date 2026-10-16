"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[307];
const publicDir = path.join(__dirname, "..", "public");

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    console,
    $: (id) => id === "treeView" ? treeView : null,
    escapeHtml: (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;"),
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(publicDir, "renderers-04.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__render307 = renderSegmentTreeView;`, context);
  context.__render307(step);
  return treeView.innerHTML;
}

test("307 returns correct sums across updates", () => {
  const cases = [
    { nums: [1, 3, 5], operations: "sumRange 0 2 | update 1 2 | sumRange 0 2", answer: [null, 9, null, 8] },
    { nums: [2, -1, 4, 7, 3], operations: "sumRange 1 3 | update 4 -2 | sumRange 0 4", answer: [null, 10, null, 10] },
    { nums: [8], operations: "sumRange 0 0 | update 0 5 | sumRange 0 0", answer: [null, 8, null, 5] },
  ];
  for (const item of cases) {
    assert.deepEqual(problem.builder(item.nums, { operations: item.operations }).answer, item.answer);
  }
});

test("307 trace follows one executable line and exposes build, update, and query pictures", () => {
  const result = problem.builder([1, 3, 5], { operations: "sumRange 0 2 | update 1 2 | sumRange 0 2" });
  assert.ok(result.steps.length > 20);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.segmentTreeView.variant === "range-sum-307"));
  const phases = new Set(result.steps.map((step) => step.segmentTreeView.phase));
  assert.deepEqual([...phases].sort(), ["build", "query", "update"]);
  for (const action of ["LEAF", "↑ PARENT", "WRITE", "+ TAKE", "✓ SUM"]) {
    assert.ok(result.steps.some((step) => step.segmentTreeView.action === action), `missing ${action}`);
  }
  const updatingParent = result.steps.find((step) => step.segmentTreeView.phase === "update" && step.segmentTreeView.activeTree.length >= 3);
  const updateDone = result.steps.find((step) => step.segmentTreeView.action === "✓ UPDATE");
  assert.equal(updatingParent.segmentTreeView.completedOperations, 1, "update stays active while climbing");
  assert.equal(updateDone.segmentTreeView.completedOperations, 2, "update completes only after reaching the root");
});

test("307 selected query nodes cover the requested range exactly once", () => {
  const result = problem.builder([2, -1, 4, 7, 3], { operations: "sumRange 1 4 | update 2 9 | sumRange 0 3" });
  for (const step of result.steps.filter((item) => item.codeLines[0] === 35)) {
    const view = step.segmentTreeView;
    const covered = view.selectedTree.flatMap((node) => view.coverage[node - 1]);
    const expected = Array.from({ length: view.queryRange[1] - view.queryRange[0] + 1 }, (_, index) => view.queryRange[0] + index);
    assert.deepEqual(covered.sort((a, b) => a - b), expected);
    assert.equal(new Set(covered).size, covered.length);
  }
});

test("307 displayed Python agrees with the JavaScript visualizer", () => {
  const code = problem.code.join("\n");
  const script = [
    "from typing import List",
    code,
    "obj = NumArray([2, -1, 4, 7, 3])",
    "out = [None, obj.sumRange(1, 4)]",
    "out.append(obj.update(2, 9))",
    "out.append(obj.sumRange(0, 3))",
    "print(out)",
  ].join("\n");
  const run = spawnSync("python3", ["-c", script], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), "[None, 13, None, 17]");
  assert.deepEqual(
    problem.builder([2, -1, 4, 7, 3], { operations: "sumRange 1 4 | update 2 9 | sumRange 0 3" }).answer,
    [null, 13, null, 17],
  );
});

test("307 renderer is picture-first, bilingual, and free of broken placeholders", () => {
  const result = problem.builder([1, 3, 5], { operations: "sumRange 0 2 | update 1 2 | sumRange 0 2" });
  for (const language of ["vi", "en"]) {
    for (const step of [result.steps[0], result.steps.find((item) => item.segmentTreeView.action === "WRITE"), result.steps.at(-1)]) {
      const html = render(step, language);
      assert.match(html, /rs307-viz/);
      assert.match(html, /rs307-ops/);
      assert.match(html, /rs307-array/);
      assert.match(html, /rs307-tree/);
      assert.match(html, /rs307-action/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("307 styles are responsive and theme-aware with concise interview metadata", () => {
  const css = fs.readFileSync(path.join(publicDir, "style-02.css"), "utf8");
  const renderer = fs.readFileSync(path.join(publicDir, "renderers-04.js"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /\.rs307-viz\s*\{/);
  assert.match(css, /\[data-theme="light"\] \.rs307-viz/);
  assert.match(css, /@container rs307 \(max-width: 560px\)/);
  assert.match(css, /body:has\(\.rs307-viz\) #stepNote/);
  assert.match(renderer, /function renderRangeSum307View\(step\)/);
  assert.match(html, /range-sum-307-v2/);
  assert.equal(problem.category.key, "segment-tree");
  assert.deepEqual(problem.tags.map((tag) => tag.key), ["array"]);
  assert.equal(problem.approach.length, 3);
  assert.match(problem.complexity.time, /O\(log n\)/);
});
