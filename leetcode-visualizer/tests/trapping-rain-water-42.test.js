"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[42];
const publicDir = path.join(__dirname, "..", "public");

function bruteForce(heights) {
  let total = 0;
  for (let index = 0; index < heights.length; index += 1) {
    const left = Math.max(...heights.slice(0, index + 1));
    const right = Math.max(...heights.slice(index));
    total += Math.max(0, Math.min(left, right) - heights[index]);
  }
  return total;
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
  vm.runInContext(`${source}\nglobalThis.__render42 = renderTrappingRainView;`, context);
  context.__render42(step);
  return treeView.innerHTML;
}

test("42 two-pointer builder matches brute force", () => {
  const cases = [
    [],
    [0],
    [2, 0, 2],
    [3, 0, 1, 3],
    [4, 2, 0, 3, 2, 5],
    [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
  ];
  for (const heights of cases) {
    assert.equal(problem.builder(heights).answer, bruteForce(heights));
  }
});

test("42 trace keeps pointers valid and water non-negative", () => {
  const result = problem.builder([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
  const visualSteps = result.steps.filter((step) => step.trappingRainView);
  assert.ok(visualSteps.length > 50);
  assert.ok(visualSteps.every((step) => step.codeLines.length === 1));
  assert.ok(visualSteps.every((step) => step.codeLines[0] >= 4 && step.codeLines[0] <= 16));
  assert.ok(visualSteps.every((step) => step.trappingRainView.water.every((amount) => amount >= 0)));
  assert.ok(visualSteps.every((step) => step.trappingRainView.left <= step.trappingRainView.right));
  assert.equal(visualSteps.at(-1).trappingRainView.total, 6);
  assert.deepEqual(visualSteps.at(-1).trappingRainView.water, [0, 0, 1, 0, 1, 2, 1, 0, 0, 1, 0, 0]);
});

test("42 displayed Python agrees with the visualization", () => {
  const heights = [4, 2, 0, 3, 2, 5];
  const code = problem.code.join("\n");
  assert.match(code, /if left_max < right_max/);
  assert.match(code, /water \+= left_max - height\[left\]/);
  assert.match(code, /water \+= right_max - height\[right\]/);
  const run = spawnSync("python3", ["-c", `${code}\nprint(Solution().trap(${JSON.stringify(heights)}))`], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(Number(run.stdout.trim()), bruteForce(heights));
});

test("42 renderer is picture-first in Vietnamese and English", () => {
  const result = problem.builder([4, 2, 0, 3, 2, 5]);
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.trappingRainView?.side === "left" && step.trappingRainView?.current < 0),
    result.steps.find((step) => Number(step.trappingRainView?.add) > 0),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      assert.match(html, /trap42-viz/);
      assert.match(html, /trap42-phases/);
      assert.match(html, /trap42-chart/);
      assert.match(html, /trap42-action/);
      assert.match(html, /trap42-rule/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("42 styles support themes, narrow layouts, and fresh assets", () => {
  const css = fs.readFileSync(path.join(publicDir, "style-02.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /container: trap42 \/ inline-size/);
  assert.match(css, /@container trap42 \(max-width: 380px\)/);
  assert.match(css, /\[data-theme="light"\] \.trap42-viz/);
  assert.match(css, /body:has\(\.trap42-viz\) #stepNote/);
  assert.match(html, /trap-water-42-v5/);
  assert.equal(problem.complexity.time, "O(n)");
  assert.equal(problem.complexity.space, "O(1)");
});
