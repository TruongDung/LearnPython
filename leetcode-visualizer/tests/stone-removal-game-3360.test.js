const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");
const { readFrontendJavaScript, readFrontendStyles, readFrontendIndex } = require("./helpers/frontend-source");

const problem = SUPPORTED[3360];

test("3360 is registered for one-line-at-a-time tracing and validates n", () => {
  assert.equal(problem.slug, "stone-removal-game");
  assert.equal(problem.debugMode, "line-by-line");
  assert.deepEqual(problem.liveArgs([12]), [12]);
  for (const invalid of [0, 55, 1.5, "12", [], [12, 13]]) {
    assert.throws(() => problem.builder(invalid));
  }
});

test("3360 follows the alternating removal game and snapshots each executed line", () => {
  for (const [n, expected] of [[1, false], [9, false], [10, true], [12, true], [19, false], [54, true]]) {
    const run = problem.builder(n);
    assert.equal(run.answer, expected, `n=${n}`);
    assert.equal(run.steps.at(-1).stoneRemoval3360View.winner, expected ? "Alice" : "Bob");
    for (const step of run.steps) {
      const view = step.stoneRemoval3360View;
      assert.equal(step.codeLines.length, 1);
      assert.equal(view.source, problem.code[step.codeLines[0] - 1]);
      assert.doesNotMatch(JSON.stringify(view), /undefined|NaN/);
    }
  }
  const run = problem.builder(12);
  const removal = run.steps.find((step) => step.codeLines[0] === 7);
  assert.equal(removal.stoneRemoval3360View.remaining, 2);
  assert.equal(removal.stoneRemoval3360View.turns[0].stones, 10);
  assert.equal(run.steps.at(-1).stoneRemoval3360View.current.stones, 9);
  assert.equal(run.steps.at(-1).stoneRemoval3360View.current.player, "Bob");
});

test("3360 renderer translates its status and exposes both themes", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "renderer-stone-removal-game-3360.js"), "utf8");
  const host = { innerHTML: "" };
  const context = { lang: "vi", $: () => host };
  vm.createContext(context);
  vm.runInContext(source, context);

  for (const language of ["vi", "en"]) {
    context.lang = language;
    context.renderStoneRemovalGame3360View(problem.builder(12).steps.at(-1));
    assert.match(host.innerHTML, /Alice/);
    assert.match(host.innerHTML, /sr3360-turn current bob failed/);
    assert.ok(host.innerHTML.includes(language === "vi" ? "đã lấy" : "taken"));
    assert.doesNotMatch(host.innerHTML, /undefined|NaN/);
  }
  const steps = problem.builder(12).steps;
  context.renderStoneRemovalGame3360View(steps.find((step) => step.codeLines[0] === 4));
  assert.match(host.innerHTML, /L4 · 10 \? 12/);
  context.renderStoneRemovalGame3360View(steps.find((step) => step.codeLines[0] === 5));
  assert.match(host.innerHTML, /L5 · 10 ≤ 12/);
  assert.match(readFrontendIndex(), /renderer-stone-removal-game-3360\.js/);
  assert.match(readFrontendIndex(), /stone-removal-game-3360\.css/);
  assert.match(readFrontendStyles(), /\[data-theme="light"\] \.sr3360-viz/);
  assert.match(readFrontendJavaScript(), /step\.stoneRemoval3360View/);
});
