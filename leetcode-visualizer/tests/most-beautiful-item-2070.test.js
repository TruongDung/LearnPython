"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require("./helpers/frontend-source");

const problem = SUPPORTED[2070];
const view = (step) => step.mostBeautifulItem2070View;

function brute(items, queries) {
  return queries.map((query) => items.reduce(
    (best, [price, beauty]) => price <= query ? Math.max(best, beauty) : best,
    0,
  ));
}

function rendererHarness() {
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../public/renderer-most-beautiful-item-2070.js"), "utf8"),
    context,
  );
  return { context, host };
}

test("2070 matches the official example and brute-force cases", () => {
  assert.ok(problem);
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [2, 4, 5, 5, 6, 6]);
  assert.deepEqual(problem.builder({ items: [[10, 100]], queries: [1, 10, 20] }).answer, [0, 100, 100]);
  assert.deepEqual(problem.builder({ items: [[2, 4], [2, 9], [1, 3]], queries: [2, 1, 2] }).answer, [9, 3, 9]);

  let seed = 2070;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let sample = 0; sample < 100; sample += 1) {
    const input = {
      items: Array.from({ length: 1 + next() % 12 }, () => [1 + next() % 15, 1 + next() % 20]),
      queries: Array.from({ length: 1 + next() % 9 }, () => 1 + next() % 18),
    };
    assert.deepEqual(problem.builder(input).answer, brute(input.items, input.queries));
  }
});

test("2070 validates JSON shape, ranges, and visualization limits", () => {
  for (const invalid of [
    "bad json",
    null,
    [],
    { items: [], queries: [1] },
    { items: [[1, 2]], queries: [] },
    { items: [[1]], queries: [1] },
    { items: [[0, 2]], queries: [1] },
    { items: [[1, 1.5]], queries: [1] },
    { items: [[1, 2]], queries: [0] },
    { items: Array(15).fill([1, 2]), queries: [1] },
    { items: [[1, 2]], queries: Array(11).fill(1) },
  ]) assert.throws(() => problem.builder(invalid), /2070:/);

  const parsed = JSON.parse(problem.defaultInput);
  assert.deepEqual(problem.liveArgs(problem.defaultInput), [parsed.items, parsed.queries]);
});

test("2070 trace sweeps every item once and restores original query order", () => {
  const run = problem.builder(problem.defaultInput);
  const frames = run.steps.map(view);
  const prices = frames.find((frame) => frame.event === "sort-items").sortedItems.map((item) => item.price);
  const budgets = frames.find((frame) => frame.event === "sort-queries").orderedQueries.map((query) => query.value);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  assert.deepEqual(budgets, [...budgets].sort((a, b) => a - b));
  assert.equal(frames.filter((frame) => frame.event === "raise-best").length, JSON.parse(problem.defaultInput).items.length);

  let lastPointer = 0;
  let lastBest = 0;
  for (const frame of frames) {
    assert.ok(frame.pointer >= lastPointer);
    assert.ok(frame.best >= lastBest);
    lastPointer = frame.pointer;
    lastBest = frame.best;
    assert.ok(frame.resolved.every((resolved, index) => !resolved || frame.answers[index] === run.answer[index]));
  }
  assert.deepEqual(frames.at(-1).answers, [2, 4, 5, 5, 6, 6]);
  assert.ok(frames.at(-1).resolved.every(Boolean));
  assert.equal(run.steps.at(-1).final, true);
});

test("2070 displayed Python returns the same result", () => {
  const cases = [
    JSON.parse(problem.defaultInput),
    { items: [[10, 100]], queries: [1, 10, 20] },
    { items: [[2, 4], [2, 9], [1, 3]], queries: [2, 1, 2] },
  ];
  const source = `${problem.code.join("\n")}\nimport json, sys\nprint(json.dumps([Solution().maximumBeauty(case["items"], case["queries"]) for case in json.load(sys.stdin)]))`;
  const execution = spawnSync("python3", ["-c", source], { input: JSON.stringify(cases), encoding: "utf8" });
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(JSON.parse(execution.stdout), cases.map((input) => brute(input.items, input.queries)));
});

test("2070 renderer stays picture-first in Vietnamese and English", () => {
  const { context, host } = rendererHarness();
  const run = problem.builder(problem.defaultInput);
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderMostBeautifulItem2070View(step);
      assert.match(host.innerHTML, /mbi2070-stage/);
      assert.match(host.innerHTML, /mbi2070-market/);
      assert.match(host.innerHTML, /mbi2070-record/);
      assert.equal((host.innerHTML.match(/class="mbi2070-item(?: |")/g) || []).length, 5);
      assert.equal((host.innerHTML.match(/class="mbi2070-query(?: |")/g) || []).length, 6);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
      assert.doesNotMatch(host.innerHTML, /<table|<details|<p[ >]/);
    }
  }

  context.renderMostBeautifulItem2070View(run.steps.at(-1));
  assert.equal((host.innerHTML.match(/class="mbi2070-answer is-ready"/g) || []).length, 6);
  for (const answer of [2, 4, 5, 5, 6, 6]) assert.match(host.innerHTML, new RegExp(`◆${answer}`));
});

test("2070 assets are lazy-wired with responsive, theme-aware styles", () => {
  const html = readFrontendIndex();
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const js = readFrontendJavaScript();
  const css = readFrontendStyles();
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*most-beautiful-item-2070\.css\?v=most-beautiful-item-2070-v1[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-most-beautiful-item-2070\.js\?v=most-beautiful-item-2070-v1[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /most-beautiful-item-2070\.(?:css|js)/);
  assert.match(html, /beauty2070=picture-v1/);
  assert.match(js, /step\.mostBeautifulItem2070View/);
  assert.match(js, /renderMostBeautifulItem2070View/);
  assert.match(css, /@container mbi2070 \(max-width: 600px\)/);
  assert.match(css, /\[data-theme="light"\] \.mbi2070-viz/);
});
