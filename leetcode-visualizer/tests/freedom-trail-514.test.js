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
  return {
    host,
    render: context.renderFreedomTrail514View,
    source: vm.runInContext("FT514_SOURCE", context),
  };
}

const expectedSource = [
  "from collections import defaultdict",
  "",
  "class Solution:",
  "    def findRotateSteps(self, ring: str, key: str) -> int:",
  "        n = len(ring)",
  "",
  "        positions = defaultdict(list)",
  "        for i, char in enumerate(ring):",
  "            positions[char].append(i)",
  "",
  "        dp = {0: 0}",
  "",
  "        for char in key:",
  "            next_dp = {}",
  "",
  "            for target in positions[char]:",
  "                best = float(\"inf\")",
  "",
  "                for prev, cost in dp.items():",
  "                    diff = abs(target - prev)",
  "                    steps = min(diff, n - diff)",
  "",
  "                    best = min(best, cost + steps + 1)",
  "",
  "                next_dp[target] = best",
  "",
  "            dp = next_dp",
  "",
  "        return min(dp.values())",
];

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
    assert.ok(Array.isArray(view.positions));
    if (view.event === "compute-linear-distance") {
      assert.equal(view.source.line, 20);
      assert.equal(view.transition.diff, Math.abs(view.transition.to - view.transition.from));
    }
    if (view.event === "compute-distance") {
      assert.equal(view.source.line, 21);
      assert.equal(view.transition.turns, Math.min(view.transition.diff, view.input.length - view.transition.diff));
    }
    if (view.event === "build-candidate") {
      assert.equal(view.source.line, 23);
      assert.equal(view.transition.best, Math.min(view.transition.bestBefore ?? Infinity, view.transition.total));
      assert.equal(view.transition.accepted, view.transition.total < (view.transition.bestBefore ?? Infinity));
    }
    if (view.event === "store-ring-position") {
      assert.ok(view.positions.find(group => group.char === view.cursor.ringChar).indices.includes(view.cursor.ringIndex));
    }
  }
  for (let line = 5; line <= problem.code.length; line += 1) {
    if (!problem.code[line - 1].trim()) continue;
    assert.ok(lines.has(line), `source line ${line} is not stepped`);
  }
  assert.deepEqual(problem.code, expectedSource);
});

test("514 renders line 23 as a visual minimum comparison and marks the winner", () => {
  const run = problem.builder("godding", { key: "gd" });
  const candidate = run.steps.find(item => item.freedomTrail514View.event === "build-candidate");
  const { host, render } = createRenderer();
  render(candidate);
  assert.match(host.innerHTML, /class="ft514-best"/);
  assert.match(host.innerHTML, /class="accepted"/);
});

test("514 retains DP trace steps after indexing a maximum-size ring", () => {
  const run = problem.builder("a".repeat(100), { key: "a" });
  assert.ok(run.steps.some(step => step.freedomTrail514View.event === "compute-linear-distance"));
  assert.equal(run.steps.at(-1).freedomTrail514View.truncated, true);
});

test("514 renderer prioritizes the ring, position map, key, and DP comparison", () => {
  const run = problem.builder("godding", { key: "gd" });
  const step = run.steps.find(item => item.freedomTrail514View.event === "build-candidate");
  for (const language of ["en", "vi"]) {
    const { host, render, source } = createRenderer(language);
    assert.deepEqual(Array.from(source), expectedSource);
    render(step);
    assert.match(host.innerHTML, /class="ft514-ring-wheel"/);
    assert.match(host.innerHTML, /class="ft514-direction-grid"/);
    assert.match(host.innerHTML, /class="ft514-key-list"/);
    assert.match(host.innerHTML, /class="ft514-position-map"/);
    assert.match(host.innerHTML, /class="ft514-dp-card"/);
    assert.match(host.innerHTML, /aria-current="step"/);
    assert.match(host.innerHTML, /class="ft514-cost"/);
    assert.doesNotMatch(host.innerHTML, /undefined|NaN|object Object/);
  }
});
