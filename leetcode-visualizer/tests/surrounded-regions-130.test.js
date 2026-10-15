"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const problem = SUPPORTED[130];

function toMatrix(input) {
  return input.split("|").map(row => [...row]);
}

function answerText(result) {
  return result.answer.map(row => row.join("")).join("|");
}

function renderGuide(step, language = "vi") {
  const context = {
    lang: language,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/app-renderers-base.js"), "utf8"), context);
  return context.surroundedRegionsGuideHtml(step.surroundedRegionsView);
}

test("130 keeps border-connected O and flips only enclosed O", () => {
  const cases = [
    [problem.defaultInput, "XXXX|XXXX|XXXX|XOXX"],
    ["OOOO|OOOO|OOOO", "OOOO|OOOO|OOOO"],
    ["XXXX|XOOX|XXXX", "XXXX|XXXX|XXXX"],
    ["XOXX|XOOX|XXXX", "XOXX|XOOX|XXXX"],
    ["X", "X"],
    ["O", "O"],
  ];
  for (const builder of [problem.builder, problem.builder2]) {
    for (const [input, expected] of cases) assert.equal(answerText(builder(input)), expected);
  }
});

test("130 BFS and DFS traces share the same three-scene visual language", () => {
  for (const [codeBlock, builder] of [[1, problem.builder], [2, problem.builder2]]) {
    const run = builder(problem.defaultInput);
    const events = new Set(run.steps.map(step => step.surroundedRegionsView?.event));
    assert.ok(events.has("border-seeds"));
    assert.ok(events.has("mark-safe"));
    assert.ok(events.has("flip"));
    assert.ok(events.has("restore-safe"));
    assert.ok(events.has("done"));
    for (const step of run.steps) {
      assert.equal(step.codeBlock || 1, codeBlock);
      assert.ok(step.surroundedRegionsView);
      assert.equal(step.bfsGrid.variant, "surrounded-regions");
      assert.ok(step.codeLines.length >= 1);
      for (const line of step.codeLines) assert.ok(problem[codeBlock === 1 ? "code" : "code2"][line - 1]?.trim());
    }
    const done = run.steps.at(-1).surroundedRegionsView;
    assert.deepEqual({ safe: done.safeCount, captured: done.capturedCount }, { safe: 1, captured: 3 });
  }
});

test("130 displayed Python agrees with both visualizers", () => {
  const inputs = [problem.defaultInput, "OOOO|OOOO|OOOO", "XXXX|XOOX|XXXX", "XOXX|XOOX|XXXX", "X", "O"];
  const expected = inputs.map(input => answerText(problem.builder(input)));
  for (const code of [problem.code, problem.code2]) {
    const source = `${code.join("\n")}\nimport json, sys\nfor raw, expected in json.load(sys.stdin):\n    board = [list(row) for row in raw.split('|')]\n    result = Solution().solve(board)\n    actual = result if result is not None else board\n    assert '|'.join(''.join(row) for row in actual) == expected`;
    const execution = spawnSync("python3", ["-c", source], {
      encoding: "utf8",
      input: JSON.stringify(inputs.map((input, index) => [input, expected[index]])),
    });
    assert.equal(execution.status, 0, execution.stderr);
  }
});

test("130 renderer stays picture-first in Vietnamese and English", () => {
  const frames = problem.builder(problem.defaultInput).steps.filter(step =>
    ["border-seeds", "mark-safe", "flip", "done"].includes(step.surroundedRegionsView.event)
  );
  for (const language of ["vi", "en"]) {
    for (const step of frames) {
      const html = renderGuide(step, language);
      assert.match(html, /sr130-viz/);
      assert.match(html, /sr130-mini-board/);
      assert.match(html, /sr130-cases/);
      assert.match(html, /sr130-flip-picture/);
      assert.doesNotMatch(html, /undefined|NaN|object Object/);
    }
  }
});

test("130 marks escape cells and captured cells directly on the live board", () => {
  const run = problem.builder(problem.defaultInput);
  const safeFrame = run.steps.find(step => step.surroundedRegionsView.event === "mark-safe");
  const flipFrame = run.steps.find(step => step.surroundedRegionsView.event === "flip");
  const safeCell = safeFrame.bfsGrid.cells.flat().find(cell => cell.meta === "✓");
  const capturedCell = flipFrame.bfsGrid.cells.flat().find(cell => cell.meta === "✕");
  assert.match(safeCell.cls, /path/);
  assert.match(safeCell.cls, /escape-gate/);
  assert.match(capturedCell.cls, /visited/);
});

test("130 has responsive light and dark presentation", () => {
  const css = fs.readFileSync(require.resolve("../public/style-04.css"), "utf8");
  const renderer = fs.readFileSync(require.resolve("../public/app-renderers-base.js"), "utf8");
  assert.match(css, /\.bfs-grid-view\.sr130-host\s*\{/);
  assert.match(css, /\[data-theme="light"\] \.bfs-grid-view\.sr130-host/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.sr130-cases/);
  assert.match(renderer, /classList\.toggle\("sr130-host", isSurroundedRegions\)/);
  assert.match(renderer, /surroundedRegionsGuideHtml\(step\.surroundedRegionsView\)/);
});
