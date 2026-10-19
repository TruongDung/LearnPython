"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[218];
const publicDir = path.join(__dirname, "..", "public");

const escape = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function render(step, language = "vi") {
  const treeView = { innerHTML: "" };
  const context = {
    lang: language,
    console,
    $: (id) => id === "treeView" ? treeView : null,
    escapeHtml: escape,
    escapeXml: escape,
    pick: (field) => field && typeof field === "object" ? field[language] : field,
  };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(publicDir, "renderers-04.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__render218 = renderSkylineView;`, context);
  context.__render218(step);
  return treeView.innerHTML;
}

test("218 solves the published skyline example and edge cases", () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [
    [2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0],
  ]);
  assert.deepEqual(problem.builder("0,2,3;2,5,3").answer, [[0, 3], [5, 0]]);
  assert.deepEqual(problem.builder("1,5,3;2,4,6").answer, [[1, 3], [2, 6], [4, 3], [5, 0]]);
  assert.deepEqual(problem.builder("1,4,4;1,4,7").answer, [[1, 7], [4, 0]]);
});

test("218 is a true one-line-at-a-time debugger", () => {
  const result = problem.builder(problem.defaultInput);
  assert.equal(problem.debugMode, "line-by-line");
  assert.ok(result.steps.length > 80);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  assert.ok(result.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.ok(result.steps.every((step) => problem.code[step.codeLines[0] - 1].trim().length > 0));
  assert.equal(result.steps.filter((step) => step.final).length, 1);
  assert.equal(result.steps.at(-1).codeLines[0], 23);

  const phases = new Set(result.steps.map((step) => step.skylineView.phase));
  for (const phase of ["events", "sweep", "start-check", "push", "expire-check", "pop", "height", "compare", "append", "done"]) {
    assert.ok(phases.has(phase), `missing phase ${phase}`);
  }
  assert.ok(result.steps.every((step) => Array.isArray(step.skylineView.events)));
  assert.ok(result.steps.some((step) => step.skylineView.focusBuildingId !== null));
});

test("218 displayed Python agrees with the visualization", () => {
  const source = `${problem.code.join("\n")}\nprint(Solution().getSkyline([[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]))\n`;
  const run = spawnSync("python3", ["-c", source], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout.trim(), "[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]");
});

test("218 renderer is picture-first in both languages", () => {
  const result = problem.builder(problem.defaultInput);
  const samples = [
    result.steps[0],
    result.steps.find((step) => step.skylineView.phase === "push"),
    result.steps.find((step) => step.skylineView.phase === "pop"),
    result.steps.find((step) => step.skylineView.phase === "append"),
    result.steps.at(-1),
  ];
  for (const language of ["vi", "en"]) {
    for (const step of samples) {
      const html = render(step, language);
      for (const className of ["skyline-viz", "skyline-phases", "skyline-events", "skyline-city-card", "skyline-heap-tree", "skyline-height-card", "skyline-output", "skyline-action"]) {
        assert.match(html, new RegExp(className));
      }
      assert.match(html, /SWEEP LINE \+ MAX-HEAP/);
      assert.match(html, /skyline-svg/);
      assert.doesNotMatch(html, /undefined|NaN|\?\?\?/);
    }
  }
});

test("218 ships responsive, theme-aware picture styles and cache busting", () => {
  const css = fs.readFileSync(path.join(publicDir, "style-03.css"), "utf8");
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  assert.match(css, /\.skyline-phases\s*\{/);
  assert.match(css, /\.skyline-heap-node\.root/);
  assert.match(css, /\.skyline-height-bars/);
  assert.match(css, /body:has\(\.skyline-viz\) #stepNote\s*\{\s*display:\s*none/);
  assert.match(css, /\[data-theme="light"\] \.skyline-viz/);
  assert.match(css, /@container \(max-width: 720px\)/);
  assert.match(html, /sky218=picture-debug-v2/);
});
