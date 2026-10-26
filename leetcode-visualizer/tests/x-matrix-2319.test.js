"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const problem = require("../problems").SUPPORTED[2319];

function renderer() {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host, escapeHtml: value => String(value).replace(/[&<>"']/g,
    char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve("../public/renderers-05.js"), "utf8"), context);
  return { context, render: step => { context.renderXMatrix2319View(step); return host.innerHTML; } };
}

const cases = [
  problem.defaultInput,
  "1,0,2;0,3,0;4,0,5", // One shared center, counted once.
  "0,0,2;0,3,0;4,0,5", // Zero on X.
  "1,7,2;0,3,0;4,0,5", // Nonzero outside X.
  "1,0,2;0,3,0;4,0,0", // Failure at the last cell.
  "-1,0,-2;0,-3,0;-4,0,-5", // Nonzero also includes negative numbers.
  "1,2;3,4", "9", "0",
];

test("2319 marks an invalid cell red at the condition check, before return False", () => {
  const { render } = renderer();
  for (const input of cases) {
    const run = problem.builder(input);
    for (const step of run.steps) {
      const view = step.xMatrix2319View;
      const html = render(step);
      const cells = [...html.matchAll(/<g class="xm2319-cell ([^"]*)" data-cell="([^"]+)">([\s\S]*?)<\/g>/g)];
      const current = cells.find(cell => cell[2] === view.activeCell?.join(","));
      if (!current) continue;
      const [r, c] = view.activeCell;
      const belongsToX = r === c || r + c === view.n - 1;
      const valid = belongsToX ? view.matrix[r][c] !== 0 : view.matrix[r][c] === 0;
      if (["check-x", "check-outside", "fail"].includes(view.phase)) {
        assert.equal(/\binvalid\b/.test(current[1]), !valid, `${input}: ${view.phase}`);
        assert.equal(/\bvalid\b/.test(current[1]), valid);
        assert.match(current[3], valid ? /✓/ : /✕/);
        assert.match(html, valid ? /xm2319-inspect valid/ : /xm2319-inspect invalid/);
      } else {
        assert.doesNotMatch(current[1], /\b(?:valid|invalid)\b/);
        assert.doesNotMatch(current[3], /xm2319-check/);
      }
    }
  }
});

test("2319 pictures preserve every value, both diagonals and exactly one odd center in both languages", () => {
  const { context, render } = renderer();
  for (const language of ["vi", "en"]) for (const input of cases) {
    context.lang = language;
    const run = problem.builder(input);
    const original = JSON.stringify(run);
    for (const step of run.steps) {
      const html = render(step), view = step.xMatrix2319View, n = view.matrix.length;
      assert.doesNotMatch(html, /undefined|NaN|Infinity|object Object/);
      const cells = [...html.matchAll(/<g class="xm2319-cell ([^"]*)" data-cell="(\d+),(\d+)">([\s\S]*?)<\/g>/g)];
      assert.equal(cells.length, n * n);
      assert.equal(cells.filter(cell => /\bon-x\b/.test(cell[1])).length, 2 * n - n % 2);
      assert.equal(cells.filter(cell => /\bboth\b/.test(cell[1])).length, n % 2);
      for (const cell of cells) {
        assert.match(cell[4], new RegExp(`>${view.matrix[Number(cell[2])][Number(cell[3])]}<`));
      }
      assert.equal((html.match(/<figure class="xm2319-pattern /g) || []).length, 4);
    }
    const end = render(run.steps.at(-1));
    assert.match(end, run.answer ? /<strong>True<\/strong>/ : /<strong>False<\/strong>/);
    if (run.answer) assert.match(end, new RegExp(`<progress max="${run.original.length ** 2}" value="${run.original.length ** 2}"`));
    assert.equal(JSON.stringify(run), original);
    const first = render(run.steps[0]);
    render(run.steps.at(-1));
    assert.equal(render(run.steps[0]), first, "stepping back must restore the exact picture");
  }
});

test("2319 keeps the visual concise and reports progress without counting a failed cell", () => {
  const { render } = renderer();
  for (const input of cases) {
    let confirmed = 0;
    for (const step of problem.builder(input).steps) {
      const view = step.xMatrix2319View, html = render(step);
      if (["check-x", "check-outside"].includes(view.phase) && !view.decision.invalid) confirmed++;
      assert.match(html, new RegExp(`<progress max="${view.n ** 2}" value="${confirmed}"`));
      // Title/description already appear in the app shell. Avoid repeating them inside the picture.
      assert.ok(!html.includes(step.note.vi));
      assert.doesNotMatch(html, /xm2319-stages|xm2319-stats|xm2319-decision|<p[ >]/);
      assert.doesNotMatch(html, /ĐƯỜNG CHÉO|PHẢI = 0|VI PHẠM/);
    }
  }
});
