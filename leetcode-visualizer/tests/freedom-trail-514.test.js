"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[514];

function reference(ring, key) {
  let dp = new Map([[0, 0]]);
  for (const char of key) {
    const next = new Map();
    for (let target = 0; target < ring.length; target += 1) {
      if (ring[target] !== char) continue;
      let best = Infinity;
      for (const [previous, cost] of dp) {
        const clockwise = (previous - target + ring.length) % ring.length;
        const counterclockwise = (target - previous + ring.length) % ring.length;
        best = Math.min(best, cost + Math.min(clockwise, counterclockwise) + 1);
      }
      next.set(target, best);
    }
    dp = next;
  }
  return Math.min(...dp.values());
}

function createRenderer(language = "en") {
  const host = { innerHTML: "" };
  const context = {
    document: { getElementById: id => id === "treeView" ? host : null },
    lang: language,
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(require.resolve("../public/renderer-freedom-trail-514.js"), "utf8"),
    context,
  );
  return { host, render: context.renderFreedomTrail514View };
}

test("514 layered position DP returns the minimum and a valid rotation witness", () => {
  const cases = [
    ["godding", "gd", 4],
    ["godding", "godding", 13],
    ["abcde", "ade", 6],
    ["abca", "caba", 10],
  ];
  for (const [ring, key, expected] of cases) {
    const run = problem.builder(ring, { key });
    assert.equal(run.answer, expected);
    assert.equal(run.answer, reference(ring, key));
    assert.equal(run.actions.length, key.length);
    assert.equal(run.actions.map(action => action.char).join(""), key);
    assert.equal(run.actions.reduce((sum, action) => sum + action.turns + 1, 0), run.answer);
    assert.equal(run.steps.at(-1).freedomTrail514View.invariants.witnessValid, true);
  }
});

test("514 snapshots follow the interview code line by line and preserve DP invariants", () => {
  const run = problem.builder("godding", { key: "gd" });
  const lines = new Set();
  for (const step of run.steps) {
    const view = step.freedomTrail514View;
    assert.ok(view, "every trace step has a Freedom Trail view");
    assert.deepEqual(step.codeLines, [view.source.line]);
    assert.equal(view.source.text, problem.code[view.source.line - 1]);
    lines.add(view.source.line);
    assert.equal(view.invariants.costsFinite, true);
    assert.equal(view.invariants.dpPositionsMatchLayer, true);
    assert.equal(view.invariants.nextPositionsMatchChar, true);
    if (view.event === "write-next-cost") {
      assert.equal(view.invariants.parentCoversNext, false);
    } else {
      assert.equal(view.invariants.parentCoversNext, true);
    }
  }
  for (let line = 1; line <= problem.code.length; line += 1) {
    assert.ok(lines.has(line), `source line ${line} is not stepped`);
  }
});

test("514 renderer prioritizes the ring, rotation choices, key, and DP over optional detail", () => {
  const run = problem.builder("godding", { key: "gd" });
  const step = run.steps.find(item => item.freedomTrail514View.event === "compute-clockwise");
  for (const language of ["en", "vi"]) {
    const { host, render } = createRenderer(language);
    render(step);
    assert.match(host.innerHTML, /class="ft514-ring-wheel"/);
    assert.match(host.innerHTML, /class="ft514-direction-grid"/);
    assert.match(host.innerHTML, /class="ft514-key-list"/);
    assert.match(host.innerHTML, /class="[^"]*ft514-dp-card/);
    assert.match(host.innerHTML, /class="[^"]*ft514-source-card/);
    assert.match(host.innerHTML, /aria-current="step"/);
    assert.match(host.innerHTML, /<details class="ft514-debug-details">/);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN|object Object/);
  }
});
