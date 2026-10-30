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

test("1254 all five approaches count every binary 3×3 grid and record valid source lines", () => {
  for (let mask = 0; mask < 512; mask++) {
    const grid = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => mask >> (r * 3 + c) & 1));
    const expected = grid[1][1] === 0 && [1, 3, 5, 7].every(bit => (mask >> bit) & 1) ? 1 : 0;
    const input = grid.map(row => row.join("")).join("|");
    for (let approach = 1; approach <= 5; approach++) {
      const run = problem.builder(input, { approach });
      assert.equal(run.answer, expected, `approach ${approach}, mask ${mask}`);
      assert.ok(run.steps.every(step => step.closedIsland1254View));
      for (const step of run.steps) {
        const code = problem[`code${approach === 1 ? "" : approach}`];
        assert.equal(step.codeBlock, approach);
        assert.equal(step.codeLines.length, 1);
        assert.ok(step.codeLines[0] >= 1 && step.codeLines[0] <= code.length);
      }
      assert.equal(run.steps.at(-1).closedIsland1254View.count, expected);
      assert.equal(run.steps.at(-1).closedIsland1254View.done, true);
    }
  }
});

test("1254 exposes five runnable Python code blocks and approach metadata", () => {
  assert.equal(problem.extraParams[0].options.length, 5);
  assert.equal(problem.approach.length, 5);
  const grid = [[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 1, 1]];
  const sources = Array.from({ length: 5 }, (_, i) => problem[`code${i + 1 === 1 ? "" : i + 1}`].join("\n"));
  const python = `import json,sys\ncases=json.load(sys.stdin)\nfor source in cases:\n scope={};exec(source,scope);print(scope['Solution']().closedIsland([row[:] for row in ${JSON.stringify(grid)}]))`;
  const { spawnSync } = require("node:child_process");
  const result = spawnSync("python3", ["-c", python], { input: JSON.stringify(sources), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split("\n").map(Number), [2, 2, 2, 2, 2]);
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

test("1254 renders approach-specific traversal state for all five algorithms", () => {
  const input = "11111|10001|10101|10001|11111";
  for (let approach = 1; approach <= 5; approach++) {
    if (approach === 1) {
      const step = problem.builder(input).steps.find(item => item.bfsGrid.cells.flat().some(cell => cell.isCurrent));
      assert.match(render(step), /ci1254-scene/);
      continue;
    }
    const step = problem.builder(input, { approach }).steps.find(item => item.bfsGrid && item.closedIsland1254View.approach);
    const html = render(step);
    assert.match(html, /ci1254-approach/);
    if (approach === 2 || approach === 3 || approach === 4) assert.match(html, /ci1254-state/);
    if (approach === 5) assert.match(html, /parent ·/);
  }
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
