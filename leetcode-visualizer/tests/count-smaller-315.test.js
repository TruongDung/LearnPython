"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[315];
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
  vm.runInContext(`${source}\nglobalThis.__render315 = renderCountSmallerView;`, context);
  context.__render315(step);
  return treeView.innerHTML;
}

function bruteForce(nums) {
  return nums.map((value, index) => nums.slice(index + 1).filter((other) => other < value).length);
}

test("315 matches brute force for duplicates, negatives, and monotonic arrays", () => {
  const cases = [
    [5, 2, 6, 1],
    [2, 0, 1, 2, -1],
    [7, 7, 7],
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [-3],
  ];
  for (const nums of cases) {
    assert.deepEqual(problem.builder(nums).answer, bruteForce(nums));
  }
});

test("315 trace follows one code line and keeps BIT equal to the inserted right side", () => {
  const result = problem.builder([5, 2, 6, 1]);
  assert.ok(result.steps.length > 30);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => Array.isArray(step.countSmallerView.insertedIndices)));

  const completedUpdates = result.steps.filter((step) => {
    const view = step.countSmallerView;
    return view.phase === "update-check" && view.updateCursor >= view.bit.length + 1;
  });
  assert.equal(completedUpdates.length, 4);
  for (const step of completedUpdates) {
    const view = step.countSmallerView;
    const expected = Array(view.values.length + 1).fill(0);
    for (const numsIndex of view.insertedIndices) {
      let rank = view.ranks.find((item) => item.value === view.nums[numsIndex]).rank;
      while (rank < expected.length) {
        expected[rank] += 1;
        rank += rank & -rank;
      }
    }
    assert.deepEqual(view.bit, expected.slice(1));
  }
});

test("315 displayed Python agrees with the JavaScript visualizer", () => {
  const nums = [5, 2, 6, 1, 2];
  const script = [
    "from typing import List",
    problem.code.join("\n"),
    `print(Solution().countSmaller(${JSON.stringify(nums)}))`,
  ].join("\n");
  const run = spawnSync("python3", ["-c", script], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), JSON.stringify(bruteForce(nums)).replaceAll(",", ", "));
  assert.deepEqual(problem.builder(nums).answer, bruteForce(nums));
});

test("315 renderer is picture-first, bilingual, and has no broken placeholders", () => {
  const result = problem.builder([5, 2, 6, 1]);
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.countSmallerView.phase === "query-read"),
    result.steps.find((step) => step.countSmallerView.phase === "update-write"),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /cs315-viz/);
      assert.match(html, /cs315-nums/);
      assert.match(html, /cs315-ranks/);
      assert.match(html, /cs315-bits/);
      assert.match(html, /cs315-cover/);
      assert.match(html, /cs315-action/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("315 styles are responsive and theme-aware with concise interview metadata", () => {
  const css = fs.readFileSync(path.join(publicDir, "style-02.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /\.cs315-viz\s*\{/);
  assert.match(css, /\[data-theme="light"\] \.cs315-viz/);
  assert.match(css, /@container cs315 \(max-width: 520px\)/);
  assert.match(css, /body:has\(\.cs315-viz\) #stepNote/);
  assert.match(html, /count-smaller-315-v2/);
  assert.equal(problem.approach.length, 3);
  assert.deepEqual(problem.tags.map((tag) => tag.key), ["fenwick-tree", "coordinate-compression", "segment-tree"]);
  assert.equal(problem.complexity.time, "O(n log n)");
});
