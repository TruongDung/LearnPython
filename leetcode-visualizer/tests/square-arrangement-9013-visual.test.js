"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9013];

function renderer() {
  const element = { innerHTML: "" };
  const context = {
    lang: "en", $: () => element,
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../public/renderer-requested-visualizations.js"), "utf8"), context);
  return { context, element };
}

test("9013 keeps path and used changes on separate source instructions", () => {
  const run = problem.builder("7");
  assert.equal(run.steps.find((step) => step.square9013View.operation === "path-init").square9013View.used, null);
  let previous = run.steps[0].square9013View;
  for (const step of run.steps.slice(1)) {
    const view = step.square9013View;
    if (view.operation === "path-append") {
      assert.deepEqual(view.path, [...previous.path, view.focus]);
      assert.deepEqual(view.used, previous.used);
      assert.ok(!view.used.includes(view.focus));
    }
    if (view.operation === "mark-used") {
      assert.ok(view.used.includes(view.focus));
      assert.deepEqual(view.path, previous.path);
    }
    if (view.operation === "unmark-used") {
      assert.ok(!view.used.includes(view.focus));
      assert.equal(view.path.at(-1), view.focus);
      assert.deepEqual(view.path, previous.path);
    }
    if (view.operation === "path-pop") {
      assert.deepEqual(view.path, previous.path.slice(0, -1));
      assert.deepEqual(view.used, previous.used);
      assert.equal(view.backtracks, previous.backtracks + 1);
    }
    if (view.operation === "build-candidates") {
      for (const value of view.candidates) {
        assert.ok(!view.used.includes(value));
        assert.ok(Number.isInteger(Math.sqrt(value + view.focus)));
      }
    }
    previous = view;
  }
  assert.deepEqual(run.answer, []);
  assert.deepEqual(previous.used, []);
});

test("9013 renders successful and exhausted searches in both languages", () => {
  const { context, element } = renderer();
  for (const n of [1, 2, 7, 15, 16]) {
    const run = problem.builder(String(n));
    if ([1, 15, 16].includes(n)) {
      assert.equal(new Set(run.answer).size, n);
      assert.equal(run.answer.length, n);
      for (let i = 1; i < n; i++) assert.ok(Number.isInteger(Math.sqrt(run.answer[i - 1] + run.answer[i])));
    } else assert.deepEqual(run.answer, []);
    for (const language of ["en", "vi"]) {
      context.lang = language;
      for (const step of run.steps) {
        context.renderSquare9013View(step);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity|rv-square-workspace|rv-square-path/);
        const view = step.square9013View;
        if (view.operation === "path-append") {
          assert.match(element.innerHTML, /path.append/);
          assert.ok(element.innerHTML.includes(`class="free current">${view.focus}</span>`));
        }
        if (view.operation === "mark-used") assert.ok(element.innerHTML.includes(`class="locked current">${view.focus}</span>`));
        if (view.operation === "path-pop") assert.match(element.innerHTML, /path.pop/);
        if (view.phase === "done") {
          assert.doesNotMatch(element.innerHTML, /rv-square-instruction|rv-square-options|rv-square-used/);
          assert.match(element.innerHTML, run.answer.length ? /rv-square-route solved/ : /rv-square-no-solution/);
          for (let i = 1; i < run.answer.length; i++) {
            assert.ok(element.innerHTML.includes(`${run.answer[i - 1]}+${run.answer[i]}=${Math.sqrt(run.answer[i - 1] + run.answer[i])}²`));
          }
        }
      }
    }
  }
});

test("9013 graph preserves all nodes and square edges with finite coordinates", () => {
  const run = problem.builder("16");
  const { context } = renderer();
  for (const step of run.steps.filter((step) => step.square9013View.phase === "graph" || step.final)) {
    const view = step.square9013View;
    const html = context.requestedSquareGraph(view);
    assert.equal((html.match(/class="rv-square-net-node /g) || []).length, view.nodes.length);
    assert.equal((html.match(/class="rv-square-net-edge/g) || []).length, view.edges.length);
    assert.doesNotMatch(html, /NaN|undefined|Infinity/);
    for (const edge of view.edges) assert.equal(edge.root ** 2, edge.u + edge.v);
  }
});
