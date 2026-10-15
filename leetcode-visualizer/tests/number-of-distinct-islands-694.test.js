"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[694];

function renderGuide(step, language = "vi") {
  const context = {
    lang: language,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/app-renderers-base.js"), "utf8"), context);
  return context.distinctIslandGuideHtml(step.distinctIslandView);
}

function toMatrix(input) {
  return input.split("|").map(row => [...row].map(Number));
}

test("694 counts translation-equivalent shapes once but keeps rotations distinct", () => {
  const cases = [
    [problem.defaultInput, 2],
    ["11000|11000|00011|00011", 1],
    ["100011|110001", 2],
    ["000|000", 0],
    ["1", 1],
  ];
  for (const [input, expected] of cases) assert.equal(problem.builder(input).answer, expected);
});

test("694 trace maps every frame to one executable Python line", () => {
  const run = problem.builder(problem.defaultInput);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(step.distinctIslandView);
  }
  const comparisons = run.steps.filter(step => step.distinctIslandView.event === "compare-signature");
  assert.deepEqual(comparisons.map(step => step.distinctIslandView.candidateState), ["new", "duplicate", "new"]);
  assert.equal(run.steps.at(-1).distinctIslandView.distinctCount, 2);
});

test("694 displayed Python agrees with the visualization", () => {
  const inputs = [problem.defaultInput, "11000|11000|00011|00011", "100011|110001", "000|000", "1"];
  const source = `${problem.code.join("\n")}\nimport json, sys\nfor grid, expected in json.load(sys.stdin):\n    assert Solution().numDistinctIslands(grid) == expected`;
  const payload = inputs.map(input => [toMatrix(input), problem.builder(input).answer]);
  const execution = spawnSync("python3", ["-c", source], { encoding: "utf8", input: JSON.stringify(payload) });
  assert.equal(execution.status, 0, execution.stderr);
});

test("694 renderer is picture-first in both languages", () => {
  const run = problem.builder(problem.defaultInput);
  for (const language of ["vi", "en"]) {
    for (const step of run.steps) {
      const html = renderGuide(step, language);
      assert.match(html, /di694-viz/);
      assert.match(html, /di694-normalizer/);
      assert.match(html, /di694-shape-grid|di694-empty-shape/);
      assert.match(html, /di694-library/);
      assert.doesNotMatch(html, /distinct-island-action|distinct-shape-cells|DFS frontier|Candidate signature/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
});

test("694 comparison frames show plus for a new shape and equals for a duplicate", () => {
  const comparisons = problem.builder(problem.defaultInput).steps
    .filter(step => step.distinctIslandView.event === "compare-signature");
  const firstNew = renderGuide(comparisons[0]);
  const duplicate = renderGuide(comparisons[1]);
  const secondNew = renderGuide(comparisons[2]);
  assert.match(firstNew, /di694-verdict new/);
  assert.match(firstNew, />\+<\/b>/);
  assert.match(duplicate, /di694-verdict duplicate/);
  assert.match(duplicate, />=<\/b>/);
  assert.match(duplicate, /di694-shape-card matched duplicate/);
  assert.match(secondNew, /<b>S2<\/b><i>\+<\/i>/);
});

test("694 styles keep the grid and shape board responsive", () => {
  const css = fs.readFileSync(require.resolve("../public/style-04.css"), "utf8");
  const script = fs.readFileSync(require.resolve("../public/script.js"), "utf8");
  assert.match(css, /\.di694-normalizer\s*\{/);
  assert.match(css, /\.di694-shape-grid\s*\{/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.di694-normalizer/);
  assert.match(script, /"app-renderers-base\.js":\["renderBfsGrid"\]/);
  assert.match(script, /"style-04\.css":\["renderBfsGrid"/);
});
