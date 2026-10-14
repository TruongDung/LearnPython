"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2178];

const view = (step) => step.maximumEvenSplit2178View;

test("2178 greedily splits the sample and assigns the leftover to the last part", () => {
  assert.ok(problem, "2178 is registered as a supported problem");
  const result = problem.builder(problem.defaultInput);
  assert.deepEqual(result.answer, [2, 4, 6, 16]);
  assert.equal(result.answer.reduce((sum, value) => sum + value, 0), 28);
  assert.deepEqual(view(result.steps.at(-1)).answer, result.answer);
  const remainderStep = result.steps.find((step) => view(step).phase === "balance");
  assert.deepEqual(view(remainderStep).adjustment, { before: 8, added: 8, after: 16 });
});

test("2178 handles minimum, odd, and invalid totals", () => {
  assert.deepEqual(problem.builder(2).answer, [2]);
  assert.deepEqual(problem.builder(12).answer, [2, 4, 6]);
  assert.deepEqual(problem.builder(7).answer, []);
  assert.deepEqual(problem.builder("not a number").answer, []);
});

test("2178 keeps large inputs correct while limiting visualization frames", () => {
  const result = problem.builder(1_000_000_000);
  const parts = result.answer;
  assert.ok(result.steps.length <= 43);
  assert.equal(parts.reduce((sum, value) => sum + value, 0), 1_000_000_000);
  assert.ok(parts.every((value, index) => value > 0 && value % 2 === 0 && (index === 0 || value > parts[index - 1])));
  assert.equal(parts.length, 31_622);
  assert.ok(result.steps.every((step) => view(step)));
});

test("2178 renderer shows a visual split in both languages without missing values", () => {
  const host = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => host,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
    pick: (value) => value[context.lang],
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../public/renderer-maximum-even-split-2178.js"), "utf8"),
    context,
  );

  const trace = problem.builder(28).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of trace) {
      context.renderMaximumEvenSplit2178View(step);
      assert.match(host.innerHTML, /mes2178-viz/);
      assert.match(host.innerHTML, /mes2178-stones/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
    }
  }
  assert.match(host.innerHTML, /mes2178-equation/);
  assert.match(host.innerHTML, />2, 4, 6, 16</);
});

test("2178 renderer is registered and loaded with its visualization assets", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*maximum-even-split-2178\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-maximum-even-split-2178\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /maximum-even-split-2178\.(?:css|js)/);
  assert.match(script, /step\.maximumEvenSplit2178View[\s\S]*renderMaximumEvenSplit2178View\(step\)/);
});
