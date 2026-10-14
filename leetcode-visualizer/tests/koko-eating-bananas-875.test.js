"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const problem = require("../problems").SUPPORTED[875];

function oracle(piles, h) {
  for (let speed = 1; speed <= Math.max(...piles); speed++) {
    const hours = piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);
    if (hours <= h) return speed;
  }
  return Math.max(...piles);
}

test("875 uses the interview-standard integer ceiling solution and line mapping", () => {
  assert.equal(problem.debugMode, "line-by-line");
  assert.deepEqual(problem.code, [
    "class Solution:",
    "    def minEatingSpeed(self, piles, h):",
    "        lo, hi = 1, max(piles)",
    "        while lo < hi:",
    "            mid = (lo + hi) // 2",
    "            hours = sum((pile + mid - 1) // mid for pile in piles)",
    "            if hours <= h:",
    "                hi = mid",
    "            else:",
    "                lo = mid + 1",
    "        return lo",
  ]);
  const result = problem.builder([3, 6, 7, 11], { h: 8 });
  assert.equal(result.answer, 4);
  assert.ok(result.steps.every((step) => step.codeBlock === 1
    && step.codeLines.length === 1
    && step.codeLines[0] >= 1
    && step.codeLines[0] <= problem.code.length));
  assert.equal(result.steps.find((step) => step.kokoSpeedView.event === "compute-mid").codeLines[0], 5);
  assert.equal(result.steps.find((step) => step.kokoSpeedView.event === "calculate-hours").codeLines[0], 6);
  assert.equal(result.steps.find((step) => step.kokoSpeedView.event === "feasible-check").codeLines[0], 7);
  assert.equal(result.steps.find((step) => step.kokoSpeedView.event === "move-hi").codeLines[0], 8);
  assert.equal(result.steps.find((step) => step.kokoSpeedView.event === "move-lo").codeLines[0], 10);
  assert.equal(result.steps.at(-1).codeLines[0], 11);
  assert.equal(result.steps.filter((step) => step.final).length, 1);
});

test("875 binary search finds the smallest feasible speed across edge and varied inputs", () => {
  const examples = [
    [[3, 6, 7, 11], 8],
    [[30, 11, 23, 4, 20], 5],
    [[30, 11, 23, 4, 20], 6],
    [[312884470], 312884469],
    [[1, 1, 1], 3],
  ];
  for (let seed = 1; seed <= 50; seed++) {
    let value = seed;
    const next = (max) => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % max + 1;
    };
    const piles = Array.from({ length: next(8) }, () => next(30));
    examples.push([piles, piles.length + next(40)]);
  }
  for (const [piles, h] of examples) {
    assert.equal(problem.builder(piles, { h }).answer, oracle(piles, h));
  }
});

test("875 rejects invalid piles and impossible hour limits without silent correction", () => {
  for (const piles of [[], [0], [-2], [1.5], [1000000001], [1, Number.NaN]]) {
    assert.throws(() => problem.builder(piles, { h: Math.max(8, piles.length) }), /875: piles/);
  }
  for (const h of [0, 2.5, 1000000001, 2]) {
    assert.throws(() => problem.builder([3, 6, 7], { h }), /875: h/);
  }
});

test("875 keeps the alternate manual-ceiling trace mapped to its own code block", () => {
  const result = problem.builder([3, 6, 7, 11], { h: 8, approach: 2 });
  assert.equal(result.answer, 4);
  assert.ok(result.steps.every((step) => step.codeBlock === 2
    && step.codeLines.length >= 1
    && step.codeLines.every((line) => line >= 1 && line <= problem.code2.length)));
});
