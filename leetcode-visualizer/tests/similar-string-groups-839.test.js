"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[839];

test("839 counts components connected by at most one character swap", () => {
  const cases = [
    [["tars", "rats", "arts", "star"], 2],
    [["omv", "ovm"], 1],
    [["abc", "abc"], 1],
    [["ab", "ba", "ab"], 1],
    [["abc", "def"], 2],
    [["abc", "ab"], 2],
  ];
  for (const [strings, answer] of cases) {
    const result = problem.builder(strings);
    assert.equal(result.answer, answer);
    assert.equal(result.steps.at(-1).similar839View.answer, answer);
    assert.equal(result.steps.at(-1).final, true);
    assert.deepEqual(problem.liveArgs(strings), [strings]);
  }
});

test("839 records both successful unions and already-connected similar pairs", () => {
  const result = problem.builder(["ab", "ba", "ab"]);
  const events = result.steps.map((step) => step.similar839View.event);
  assert.ok(events.includes("union-merge"));
  assert.ok(events.includes("union-skip"));
  assert.ok(result.steps.some((step) => step.similar839View.mismatch.length === 2));
  assert.equal(result.steps.at(-1).similar839View.components.length, 1);
});

test("839 validates JSON and visualization input limits", () => {
  assert.deepEqual(problem.builder('["tars","rats"]').strings, ["tars", "rats"]);
  assert.deepEqual(problem.builder("tars,rats").strings, ["tars", "rats"]);
  for (const invalid of ["not-json [", [], [""] , [1], ["UP"], ["a".repeat(17)], Array(17).fill("a")]) {
    assert.throws(() => problem.builder(invalid), /839:/);
  }
});

test("839 renderer handles every trace step in both languages", () => {
  const element = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => element,
    escapeHtml: (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]),
    pick: (value) => value[context.lang],
  };
  vm.createContext(context);
  const renderer = fs.readFileSync(
    path.join(__dirname, "../public/renderer-similar-string-groups-839.js"),
    "utf8",
  );
  vm.runInContext(renderer, context);

  const trace = problem.builder(["tars", "rats", "arts", "star"]).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of trace) {
      context.renderSimilarStringGroups839View(step);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
      assert.match(element.innerHTML, /ssg839-viz/);
    }
  }
  assert.match(element.innerHTML, />2<\/strong>/);
});

test("839 assets are problem-lazy and its renderer is registered", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  const problemIndex = fs.readFileSync(path.join(root, "problems/index.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*similar-string-groups-839\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-similar-string-groups-839\.js[\s\S]*<\/template>/);
  assert.match(script, /step\.similar839View[\s\S]*renderSimilarStringGroups839View\(step\)/);
  assert.match(problemIndex, /require\("\.\/similar-string-groups-839"\)/);
});
