"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[1046];

const view = (step) => step.lastStoneWeight1046View;

test("1046 records the heap, picked stones, clash, and answer in each visualization step", () => {
  const result = problem.builder([2, 7, 4, 1, 8, 1]);
  assert.equal(result.answer, 1);
  assert.ok(result.steps.every((step) => view(step)));
  assert.deepEqual(view(result.steps.at(-1)).heap.map((stone) => stone.weight), [1]);
  assert.equal(view(result.steps.at(-1)).answer, 1);

  const secondPick = result.steps.find((step) => view(step).role === "y");
  assert.deepEqual(view(secondPick).clash, { x: 8, y: 7, difference: null });
  const smash = result.steps.find((step) => view(step).phase === "smash");
  assert.deepEqual(view(smash).clash, { x: 8, y: 7, difference: 1 });
  assert.ok(view(smash).heap.some((stone) => stone.weight === 1));
});

test("1046 shows equal stones disappearing and handles a single stone", () => {
  const equalStones = problem.builder([2, 2]);
  assert.equal(equalStones.answer, 0);
  const equalSmash = equalStones.steps.find((step) => view(step).phase === "smash");
  assert.deepEqual(view(equalSmash).clash, { x: 2, y: 2, difference: 0 });
  assert.deepEqual(view(equalStones.steps.at(-1)).heap, []);

  const singleStone = problem.builder([9]);
  assert.equal(singleStone.answer, 9);
  assert.equal(view(singleStone.steps.at(-1)).answer, 9);
});

test("1046 renderer illustrates heap stones and collisions without missing values", () => {
  const host = { innerHTML: "" };
  const context = { lang: "en", $: () => host };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "../public/renderer-last-stone-weight-1046.js"), "utf8"),
    context,
  );

  const trace = problem.builder([2, 7, 4, 1, 8, 1]).steps;
  for (const language of ["vi", "en"]) {
    context.lang = language;
    for (const step of trace) {
      context.renderLastStoneWeight1046View(step);
      assert.match(host.innerHTML, /lsw1046-viz/);
      assert.match(host.innerHTML, /lsw1046-stones/);
      assert.match(host.innerHTML, /lsw1046-action/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
    }
  }
  assert.match(host.innerHTML, /lsw1046-final-stone/);
  assert.match(host.innerHTML, /is-final/);
});

test("1046 renderer is registered and loaded with its visualization assets", () => {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");
  assert.match(html, /<template id="problemVisualizationStyles"[\s\S]*last-stone-weight-1046\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts"[\s\S]*renderer-last-stone-weight-1046\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(activeHtml, /last-stone-weight-1046\.(?:css|js)/);
  assert.match(script, /step\.lastStoneWeight1046View[\s\S]*renderLastStoneWeight1046View\(step\)/);
});
