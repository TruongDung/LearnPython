"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[493];
const publicDir = path.join(__dirname, "..", "public");

function bruteForce(nums) {
  let count = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[i] > 2 * nums[j]) count += 1;
    }
  }
  return count;
}

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
  const source = fs.readFileSync(path.join(publicDir, "renderers-03.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__render493 = renderReversePairsView;`, context);
  context.__render493(step);
  return treeView.innerHTML;
}

test("493 merge sort matches brute force across edge cases", () => {
  const cases = [
    [1, 3, 2, 3, 1],
    [2, 4, 3, 5, 1],
    [5, 4, 3, 2, 1],
    [7, 7, 7],
    [-5, -5],
    [-2, -1, 0, 1, 2],
    [2147483647, -2147483648, 0],
    [],
  ];
  for (const nums of cases) {
    assert.equal(problem.builder(nums, { approach: "1" }).answer, bruteForce(nums));
  }
});

test("493 trace follows the linear merge and keeps every buffer sorted", () => {
  const result = problem.builder([2, 4, 3, 5, 1], { approach: "1" });
  assert.ok(result.steps.length > 100);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 18));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 21));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 25));
  for (const step of result.steps.filter((item) => item.reversePairsView.phase.startsWith("merge"))) {
    const values = step.reversePairsView.mergeBuffer.map((item) => item.value);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
  }
  const finalMerge = result.steps.filter((step) => step.codeLines[0] === 25).at(-1).reversePairsView;
  assert.deepEqual(finalMerge.working.map((item) => item.value), [1, 2, 3, 4, 5]);
});

test("493 displayed Python is O(n log n) merge code and agrees with the visualizer", () => {
  const nums = [2, 4, 3, 5, 1, -2];
  const code = problem.code.join("\n");
  assert.doesNotMatch(code, /sorted\s*\(/);
  assert.match(code, /while left < mid and right < end/);
  assert.match(code, /nums\[start:end\] = merged/);
  const run = spawnSync("python3", ["-c", `${code}\nprint(Solution().reversePairs(${JSON.stringify(nums)}))`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(Number(run.stdout.trim()), bruteForce(nums));
  assert.equal(problem.builder(nums, { approach: "1" }).answer, bruteForce(nums));
});

test("493 renderer is picture-first in both languages", () => {
  const result = problem.builder([1, 3, 2, 3, 1], { approach: "1" });
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.reversePairsView.phase === "compare-valid"),
    result.steps.find((step) => step.reversePairsView.phase === "merge-pick"),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /rp493-viz/);
      assert.match(html, /rp493-originals/);
      assert.match(html, /rp493-arena/);
      assert.match(html, /rp493-half left/);
      assert.match(html, /rp493-half right/);
      assert.match(html, /rp493-buffer/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("493 styles are responsive, theme-aware, and cache-busted", () => {
  const css = fs.readFileSync(path.join(publicDir, "style.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /container: rp493 \/ inline-size/);
  assert.match(css, /@container rp493 \(max-width: 500px\)/);
  assert.match(css, /\[data-theme="light"\] \.rp493-viz/);
  assert.match(css, /body:has\(\.rp493-viz\) #stepNote/);
  assert.match(html, /reverse-pairs-493-v3/);
  assert.equal(problem.complexity.time, "O(n log n)");
});
