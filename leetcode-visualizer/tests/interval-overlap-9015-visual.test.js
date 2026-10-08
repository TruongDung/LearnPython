"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[9015];

function renderer() {
  const element = { innerHTML: "" };
  const context = {
    lang: "en",
    $: () => element,
    escapeHtml: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../public/renderer-requested-visualizations.js"), "utf8"), context);
  return { context, element };
}

test("9015 preserves touching and zero-duration closed intervals", () => {
  for (const [input, pairs, peak] of [
    ["[[1,2],[2,3]]", 1, 2],
    ["[[2,2],[2,2],[1,2]]", 3, 3],
    ["[[-3,-1],[0,0],[1,2]]", 0, 1],
  ]) {
    const run = problem.builder(input);
    assert.deepEqual(run.answer, { overlapPairs: pairs, maxAtAnyTime: peak });
    const sorted = run.steps.find((step) => step.sweep9015View.operation === "sort-events").sweep9015View.events;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].time === sorted[i].time) {
        assert.ok(sorted[i - 1].kind !== "end" || sorted[i].kind !== "start");
      }
    }
    const { context, element } = renderer();
    for (const step of run.steps) {
      context.renderSweep9015View(step);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      if (input.includes("[2,2]")) assert.match(element.innerHTML, /rv-sweep-segment point/);
    }
  }
});

test("9015 shows pair arithmetic and set mutations only on their own instruction", () => {
  const run = problem.builder(problem.defaultInput);
  const { context, element } = renderer();
  for (const language of ["en", "vi"]) {
    context.lang = language;
    for (const step of run.steps) {
      const view = step.sweep9015View;
      context.renderSweep9015View(step);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|rv-event-stream|rv-sweep-cursor/);
      if (view.operation === "count-overlaps") {
        assert.ok(element.innerHTML.includes(`${view.overlapPairs - view.activeBefore.length} + ${view.activeBefore.length} = ${view.overlapPairs}`));
        assert.ok(!view.activeAfter.includes(view.currentEvent.id));
      }
      if (view.operation === "active-add") {
        assert.ok(view.activeAfter.includes(view.currentEvent.id));
        assert.match(element.innerHTML, /active.add/);
      }
      if (view.operation === "active-remove") {
        assert.ok(!view.activeAfter.includes(view.currentEvent.id));
        assert.match(element.innerHTML, /active.remove/);
      }
      if (view.phase === "done") {
        assert.match(element.innerHTML, /rv-sweep-result/);
        assert.doesNotMatch(element.innerHTML, /rv-sweep-queue|rv-sweep-work/);
      }
    }
  }
});

test("9015 keeps the current event and interval visible in a large stream", () => {
  const input = JSON.stringify(Array.from({ length: 40 }, (_, i) => [i, 100 + i]));
  const run = problem.builder(input);
  const { context, element } = renderer();
  for (const step of run.steps) {
    const view = step.sweep9015View;
    context.renderSweep9015View(step);
    assert.ok((element.innerHTML.match(/class="rv-sweep-event /g) || []).length <= 6);
    if (view.currentEvent) {
      assert.ok(element.innerHTML.includes(`class="rv-sweep-event current ${view.currentEvent.kind}"`));
      assert.ok(element.innerHTML.includes(`current"><div><b>#${view.currentEvent.id}</b>`));
    }
  }
  assert.deepEqual(run.answer, { overlapPairs: 780, maxAtAnyTime: 40 });
});
