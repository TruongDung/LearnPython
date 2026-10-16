"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[327];
const publicDir = path.join(__dirname, "..", "public");

function bruteForce(nums, lower, upper) {
  let answer = 0;
  for (let left = 0; left < nums.length; left += 1) {
    let sum = 0;
    for (let right = left; right < nums.length; right += 1) {
      sum += nums[right];
      if (lower <= sum && sum <= upper) answer += 1;
    }
  }
  return answer;
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
  const source = fs.readFileSync(path.join(publicDir, "renderers-04.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__render327 = renderRangeSumCountView;`, context);
  context.__render327(step);
  return treeView.innerHTML;
}

test("327 merge sort matches brute force across edge cases", () => {
  const cases = [
    { nums: [-2, 5, -1], lower: -2, upper: 2 },
    { nums: [0], lower: 0, upper: 0 },
    { nums: [], lower: -2, upper: 2 },
    { nums: [1, -1, 1], lower: 0, upper: 0 },
    { nums: [-3, -2, -1], lower: -5, upper: -3 },
    { nums: [2147483647, -2147483648, -1, 0], lower: -1, upper: 0 },
  ];
  for (const { nums, lower, upper } of cases) {
    const result = problem.builder(nums, { approach: "1", lower, upper });
    assert.equal(result.answer, bruteForce(nums, lower, upper));
  }
});

test("327 trace uses a linear sorted merge buffer", () => {
  const result = problem.builder([-2, 5, -1], { approach: "1", lower: -2, upper: 2 });
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 23));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 26));
  assert.ok(result.steps.some((step) => step.codeLines[0] === 30));
  for (const step of result.steps.filter((item) => item.rangeSumCountView.phase.startsWith("merge"))) {
    const sums = step.rangeSumCountView.mergeBuffer.map((item) => item.sum);
    assert.deepEqual(sums, [...sums].sort((a, b) => a - b));
  }
  const finalMerge = result.steps.filter((step) => step.codeLines[0] === 30).at(-1).rangeSumCountView;
  assert.deepEqual(finalMerge.working.map((item) => item.sum), [-2, 0, 2, 3]);
});

test("327 displayed Python is O(n log n) and agrees with the visualizer", () => {
  const nums = [-2, 5, -1, 3, -4];
  const lower = -2;
  const upper = 2;
  const code = problem.code.join("\n");
  assert.doesNotMatch(code, /prefix\[start:end\]\s*=\s*sorted/);
  assert.match(code, /while left < mid and right < end/);
  assert.match(code, /prefix\[start:end\] = merged/);
  const run = spawnSync("python3", ["-c", `${code}\nprint(Solution().countRangeSum(${JSON.stringify(nums)}, ${lower}, ${upper}))`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(Number(run.stdout.trim()), bruteForce(nums, lower, upper));
  assert.equal(problem.builder(nums, { approach: "1", lower, upper }).answer, bruteForce(nums, lower, upper));
});

test("327 renderer stays picture-first in Vietnamese and English", () => {
  const result = problem.builder([-2, 5, -1], { approach: "1", lower: -2, upper: 2 });
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.rangeSumCountView.phase === "count-add"),
    result.steps.find((step) => step.rangeSumCountView.phase === "merge-pick"),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /rs327i-viz/);
      assert.match(html, /rs327i-prefix-rail/);
      assert.match(html, /rs327i-arena/);
      assert.match(html, /rs327i-half left/);
      assert.match(html, /rs327i-half right/);
      assert.match(html, /rs327i-buffer/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("327 styles support themes, narrow layouts, and fresh assets", () => {
  const css = fs.readFileSync(path.join(publicDir, "style.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /container: rs327i \/ inline-size/);
  assert.match(css, /@container rs327i \(max-width: 500px\)/);
  assert.match(css, /\[data-theme="light"\] \.rs327i-viz/);
  assert.match(css, /body:has\(\.rs327i-viz\) #stepNote/);
  assert.match(html, /count-range-sum-327-v1/);
  assert.match(problem.complexity.time, /O\(n log n\)/);
});
