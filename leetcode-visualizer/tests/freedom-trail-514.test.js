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

test("514 snapshots match displayed source and exact DP transition costs", () => {
  const run = problem.builder("godding", {key:"gd"});
  for (const step of run.steps) {
    const v=step.freedomTrail514View;
    assert.deepEqual(step.codeLines,[v.source.line]);
    assert.equal(v.source.text,problem.code[v.source.line-1]);
    const tr=v.transition;
    if (tr && tr.turns!==null) {
      assert.equal(tr.turns,Math.min(tr.clockwise,tr.counterclockwise));
      if(tr.total!==null)assert.equal(tr.total,tr.baseCost+tr.turns+1);
    }
    if(!step.final)assert.equal(v.invariants.costsFinite,true);
    if(v.event==="replay-press")assert.equal(v.replay.typed.length,v.replay.presses);
  }
  assert.deepEqual(problem.code,expectedSource);
});
test("514 compact renderer shows the wheel, physical routes, key and restored frames", () => {
  const run=problem.builder("godding",{key:"gd"});
  for(const language of ["en","vi"]) {
    const {host,render,source}=createRenderer(language);
    assert.deepEqual(Array.from(source),expectedSource);
    for(const step of run.steps) {render(step);assert.match(host.innerHTML,/ft514-ring-wheel/);assert.doesNotMatch(host.innerHTML,/undefined|NaN|object Object/);}
    render(run.steps.find(s=>s.freedomTrail514View.event==="compute-distance"));
    assert.match(host.innerHTML,/ft514-direction-grid/);
    assert.match(host.innerHTML,/ft514-key-list/);
    assert.match(host.innerHTML,/ft514-dp-card/);
    render(run.steps[0]);const initial=host.innerHTML;
    render(run.steps.at(-1));render(run.steps[0]);assert.equal(host.innerHTML,initial);
  }
});
test("514 accepts full official limits and caps snapshots without losing the optimal route", () => {
  const run=problem.builder("ab".repeat(50),{key:"ab".repeat(50)});
  assert.equal(run.answer,199);
  assert.ok(run.steps.length<=581);
  assert.ok(JSON.stringify(run).length<2000000);
  assert.equal(run.actions.length,100);
  assert.equal(run.steps.at(-1).freedomTrail514View.truncated,true);
});
