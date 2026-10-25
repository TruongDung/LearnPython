"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[1568];

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

test("1568 uses an illustrative bridge input and still returns the correct 0/1/2 answers", () => {
  const cases = [
    [problem.defaultInput, 1],
    ["000|000", 0],
    ["0110|0110|0000", 2],
  ];

  for (const [input, answer] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, answer);
    assert.ok(run.steps.length > 0);
    assert.ok(run.steps.every((step) => step.disconnect1568View));
    assert.ok(run.steps.some((step) => step.vars.some((variable) => variable.name === "count")));
    assert.equal(run.steps.at(-1).disconnect1568View.answer, answer);
  }

  const bridge = problem.builder(problem.defaultInput).steps.at(-1).disconnect1568View;
  assert.deepEqual(bridge.removed, [0, 1]);
  assert.equal(bridge.componentCount, 2);
  assert.equal(bridge.isDisconnected, true);
});

test("1568 renders a picture-first cut-and-split map", () => {
  const run = problem.builder(problem.defaultInput);
  const trial = run.steps.find((step) => step.disconnect1568View.phase === "trial" && step.disconnect1568View.removed);
  const final = run.steps.at(-1);
  const trialHtml = render(trial);
  const finalHtml = render(final, "en");

  assert.match(trialHtml, /ci1568-scene/);
  assert.match(trialHtml, /ci1568-ripples/);
  assert.match(trialHtml, /ci1568-cell is-removed/);
  assert.match(trialHtml, /ci1568-mark/);
  assert.match(finalHtml, /ci1568-viz is-result is-split/);
  assert.match(finalHtml, /ci1568-answer[^>]*[\s\S]*<strong>1<\/strong>/);

  const css = fs.readFileSync(require.resolve("../public/style-04.css"), "utf8");
  assert.match(css, /\.ci1568-cell\.is-removed \.ci1568-mark::before/);
  assert.match(css, /\.ci1568-cell\.component-2/);
  assert.match(css, /#vizPanel:has\(\.ci1568-viz\) #stepNote/);
});

test("1568 keeps only the essential watches visible for every frame and snapshots their changing values", () => {
  const names = problem.builder(problem.defaultInput).steps[0].vars.map(variable => variable.name);
  assert.deepEqual(names, ["r", "c", "count", "stack", "cr, cc", "removed cell", "disconnects?", "answer"]);
  for (const input of [problem.defaultInput, "000|000", "10|00", "0110|0110|0000", "invalid"]) {
    const run = problem.builder(input);
    for (const step of run.steps) assert.deepEqual(step.vars.map(variable => variable.name), names);
    assert.equal(run.steps.at(-1).vars.find(variable => variable.name === "answer").value, run.answer);
  }

  const steps = problem.builder(problem.defaultInput).steps;
  const values = step => Object.fromEntries(step.vars.map(variable => [variable.name, variable.value]));
  assert.equal(values(steps[0]).count, "—");
  assert.equal(values(steps.find(step => step.codeLines[0] === 14)).count, 0);
  const seedIndex = steps.findIndex(step => step.codeLines[0] === 7);
  assert.equal(values(steps[seedIndex]).stack, "[(0,0)]");
  assert.equal(values(steps[seedIndex + 2]).stack, "[]");
  const restore = steps.find(step => step.codeLines[0] === 29);
  assert.equal(values(restore)["removed cell"], "—");
  assert.equal(values(steps.at(-1)).count, 2);
  assert.equal(values(steps.at(-1))["disconnects?"], true);
  assert.equal(values(steps.at(-1))["r"], 0);
  assert.equal(values(steps.at(-1))["c"], 1);
});
