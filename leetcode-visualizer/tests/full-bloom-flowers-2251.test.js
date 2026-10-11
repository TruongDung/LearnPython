"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[2251];

const view = (step) => step.fullBloomFlowers2251View;

test("2251 counts flowers in bloom at each person's visit time", () => {
  const result = problem.builder(problem.defaultInput);
  assert.deepEqual(result.answer, [1, 2, 2, 2]);
  assert.deepEqual(problem.liveArgs(problem.defaultInput), [
    [[1, 6], [3, 7], [9, 12], [4, 13]],
    [2, 3, 7, 11],
  ]);
  assert.deepEqual(result.steps.at(-1).fullBloomFlowers2251View.answer, [1, 2, 2, 2]);
  assert.equal(result.steps.at(-1).final, true);
});

test("2251 preserves inclusive endpoints and handles duplicate intervals", () => {
  const result = problem.builder({
    flowers: [[1, 2], [2, 2], [2, 3], [2, 2]],
    people: [0, 1, 2, 3, 4],
  });
  assert.deepEqual(result.answer, [0, 1, 4, 1, 0]);

  const oneFlower = problem.builder({ flowers: [[5, 5]], people: [4, 5, 6] });
  assert.deepEqual(oneFlower.answer, [0, 1, 0]);
});

test("2251 validates input shapes, ranges, and visualization limits", () => {
  for (const invalid of [
    "not json",
    null,
    [],
    { flowers: [], people: [1] },
    { flowers: [[1, 2]], people: [] },
    { flowers: [[2, 1]], people: [1] },
    { flowers: [[-1, 2]], people: [1] },
    { flowers: [[1, 2, 3]], people: [1] },
    { flowers: [[1, 2]], people: [1.5] },
    { flowers: Array(13).fill([1, 2]), people: [1] },
    { flowers: [[1, 2]], people: Array(9).fill(1) },
  ]) {
    assert.throws(() => problem.builder(invalid), /2251:/);
  }
});

test("2251 traces upper and lower bound searches and valid source lines", () => {
  const result = problem.builder(problem.defaultInput);
  const events = result.steps.map((step) => view(step).event);
  assert.ok(events.includes("search-starts"));
  assert.ok(events.includes("starts-count"));
  assert.ok(events.includes("search-ends"));
  assert.ok(events.includes("result"));
  for (const step of result.steps) {
    assert.ok(step.codeLines.length > 0);
    for (const line of step.codeLines) {
      assert.ok(line >= 1 && line <= problem.code.length, `invalid code line ${line}`);
    }
  }
});

test("2251 renderer shows every trace step in Vietnamese and English", () => {
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
  const source = fs.readFileSync(
    path.join(__dirname, "../public/renderer-full-bloom-flowers-2251.js"),
    "utf8",
  );
  vm.runInContext(source, context);
  const steps = problem.builder(problem.defaultInput).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of steps) {
      context.renderFullBloomFlowers2251View(step);
      assert.match(host.innerHTML, /fb2251-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      assert.equal((host.innerHTML.match(/class="fb2251-flower(?: |")/g) || []).length, 4);
      assert.equal((host.innerHTML.match(/class="fb2251-visitor(?: |")/g) || []).length, 4);
    }
  }
  assert.match(host.innerHTML, /\[1, 2, 2, 2\]/);
});

test("2251 is registered with problem-lazy assets and its renderer", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  const problemIndex = fs.readFileSync(path.join(root, "problems/index.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*full-bloom-flowers-2251\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-full-bloom-flowers-2251\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /full-bloom-flowers-2251\.(?:css|js)/);
  assert.match(script, /step\.fullBloomFlowers2251View[\s\S]*renderFullBloomFlowers2251View\(step\)/);
  assert.match(problemIndex, /require\("\.\/full-bloom-flowers-2251"\)/);
});
