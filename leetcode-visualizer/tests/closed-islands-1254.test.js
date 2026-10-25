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
    for (const step of run.steps) assert.deepEqual(step.vars.map(variable => variable.name), ["r", "c", "grid[r][c]", "count", "answer"]);
    assert.equal(run.steps.at(-1).vars.find(variable => variable.name === "count").value, answer);
    assert.equal(run.steps.at(-1).vars.find(variable => variable.name === "answer").value, answer);
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

test("1254 watches follow recursive coordinates, flooding, and count initialization", () => {
  const values = step => Object.fromEntries(step.vars.map(variable => [variable.name, variable.value]));
  const steps = problem.builder("000|010|000").steps;
  assert.equal(values(steps[0]).count, "—");
  for (const step of steps) {
    const state = values(step);
    if (step.codeLines[0] === 9) assert.equal(state["grid[r][c]"], 1);
    const current = step.bfsGrid.cells.flatMap((row, r) => row.flatMap((cell, c) => cell.isCurrent ? [[r, c]] : []))[0];
    if (current) assert.deepEqual([state.r, state.c], current);
    if (Number.isInteger(state.r) && Number.isInteger(state.c) && (state.r < 0 || state.r >= 3 || state.c < 0 || state.c >= 3)) {
      assert.equal(state["grid[r][c]"], "—");
    }
  }
  assert.ok(steps.some(step => values(step).r === -1));
  assert.equal(values(steps.find(step => step.codeLines[0] === 20)).count, 0);
  const counted = problem.builder("111|101|111").steps.find(step => step.codeLines[0] === 25);
  assert.deepEqual(values(counted), { r: 1, c: 1, "grid[r][c]": 1, count: 1, answer: "—" });
  assert.deepEqual(problem.builder("invalid").steps[0].vars.map(variable => variable.name), ["r", "c", "grid[r][c]", "count", "answer"]);
});
