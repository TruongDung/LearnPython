"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[1049];

const view = (step) => step.stoneWeight1049View;

test("1049 keeps the minimum last-stone weight and exposes a valid final split", () => {
  const result = problem.builder(problem.defaultInput);
  assert.equal(result.answer, 1);
  assert.equal(view(result.steps.at(-1)).answer, 1);
  const final = view(result.steps.at(-1));
  const pileA = final.bestStones.reduce((sum, index) => sum + final.stones[index].weight, 0);
  const pileB = final.otherStones.reduce((sum, index) => sum + final.stones[index].weight, 0);
  assert.equal(pileA, final.bestSum);
  assert.equal(pileB + pileA, final.total);
  assert.equal(Math.abs(pileB - pileA), result.answer);
  assert.deepEqual([...final.bestStones, ...final.otherStones].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
});

test("1049 keeps subset witnesses valid after each stone is processed", () => {
  const result = problem.builder([1, 2, 7, 7]);
  assert.equal(result.answer, 1);
  for (const step of result.steps) {
    const state = view(step);
    assert.ok(state);
    assert.ok(state.bestSum <= state.target);
    assert.equal(state.bestStones.reduce((sum, index) => sum + state.stones[index].weight, 0), state.bestSum);
    assert.equal(new Set(state.bestStones).size, state.bestStones.length);
    assert.ok(state.bestStones.every((index) => index < state.processedCount));
  }
});

test("1049 draws a visual balance, stone belt, and subset-sum track in both languages", () => {
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
    fs.readFileSync(path.join(__dirname, "../public/renderer-last-stone-weight-1049.js"), "utf8"),
    context,
  );

  const trace = problem.builder(problem.defaultInput).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of trace) {
      context.renderLastStoneWeight1049View(step);
      assert.match(host.innerHTML, /lsw1049-viz/);
      assert.match(host.innerHTML, /lsw1049-stones/);
      assert.match(host.innerHTML, /lsw1049-sums/);
      assert.match(host.innerHTML, /lsw1049-beam/);
      assert.match(host.innerHTML, /lsw1049-track/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
    }
  }
  assert.match(host.innerHTML, /lsw1049-balance/);
  assert.match(host.innerHTML, /is-final/);
  assert.match(host.innerHTML, />1<\/strong>/);
});

test("1049 renderer is registered and loaded only with its visualization assets", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*last-stone-weight-1049\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-last-stone-weight-1049\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /last-stone-weight-1049\.(?:css|js)/);
  assert.match(script, /step\.stoneWeight1049View[\s\S]*renderLastStoneWeight1049View\(step\)/);
});
