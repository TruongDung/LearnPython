"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1254];

function render(step, language = "vi") {
  const bfsGridView = { innerHTML: "", style: {}, classList: { remove() {}, toggle() {} } };
  const context = {
    lang: language,
    $: (id) => {
      assert.equal(id, "bfsGridView");
      return bfsGridView;
    },
    escapeXml: (value) => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;",
    })[character]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/app-renderers-base.js"), "utf8"), context);
  context.renderBfsGrid(step);
  return bfsGridView.innerHTML;
}

test("1254 keeps the correct answer while attaching a picture-first state to every frame", () => {
  const cases = [
    [problem.defaultInput, 2],
    ["111|101|111", 1],
    ["000|010|000", 0],
  ];

  for (const [input, answer] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, answer);
    assert.ok(run.steps.length > 0);
    assert.ok(run.steps.every((step) => step.closedIsland1254View));
    assert.ok(run.steps.every((step) => step.vars.length === 0));
  }

  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.some((step) => step.closedIsland1254View.phase === "flood"));
  assert.ok(run.steps.some((step) => step.closedIsland1254View.phase === "count"));
  assert.equal(run.steps.at(-1).closedIsland1254View.done, true);
});

test("1254 renders a compact illustrated map instead of emoji-filled text labels", () => {
  const run = problem.builder(problem.defaultInput);
  const active = run.steps.find((step) => step.bfsGrid.cells.flat().some((cell) => cell.isCurrent));
  const final = run.steps.at(-1);
  const activeHtml = render(active);
  const finalHtml = render(final, "en");

  assert.match(activeHtml, /ci1254-scene/);
  assert.match(activeHtml, /ci1254-tide/);
  assert.match(activeHtml, /ci1254-mark/);
  assert.match(activeHtml, /ci1254-current-tag[^>]*>✦/);
  assert.doesNotMatch(activeHtml, /ci1254-icon/);
  assert.match(finalHtml, /ci1254-viz is-finished/);
  assert.match(finalHtml, /ci1254-count[^>]*[\s\S]*<strong>2<\/strong>/);

  const css = fs.readFileSync(require.resolve("../public/style-04.css"), "utf8");
  assert.match(css, /\.ci1254-cell\.is-water \.ci1254-mark::before/);
  assert.match(css, /\.ci1254-cell\.is-land \.ci1254-mark/);
  assert.match(css, /#vizPanel:has\(\.ci1254-viz\) #stepNote/);
});
