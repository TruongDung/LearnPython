"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const problem = require("../problems").SUPPORTED[9012];

function minimumCoinCount(coins, change) {
  const dp = Array(change + 1).fill(Infinity);
  dp[0] = 0;
  for (let amount = 1; amount <= change; amount++) {
    for (const coin of coins) {
      if (coin <= amount) dp[amount] = Math.min(dp[amount], dp[amount - coin] + 1);
    }
  }
  return Number.isFinite(dp[change]) ? dp[change] : null;
}

test("9012 is registered with a valid single-line trace", () => {
  assert.equal(problem.id, 9012);
  assert.equal(problem.debugMode, "line-by-line");

  const run = problem.builder(problem.defaultInput, { price: 65, paid: 100 });
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).final, true);
});

test("9012 returns a minimum-coin combination or null when change is impossible", () => {
  const cases = [
    ["1,5,10,25", 65, 100],
    ["1,3,4", 0, 6],
    ["2,5,7", 1, 28],
    ["4,6", 0, 5],
    ["2,5", 7, 7],
  ];

  for (const [input, price, paid] of cases) {
    const coins = input.split(",").map(Number);
    const change = paid - price;
    const expectedCount = minimumCoinCount(coins, change);
    const run = problem.builder(input, { price, paid });
    if (expectedCount === null) {
      assert.equal(run.answer, null);
      continue;
    }
    assert.equal(run.answer.length, expectedCount);
    assert.equal(run.answer.reduce((sum, coin) => sum + coin, 0), change);
    assert.ok(run.answer.every((coin) => coins.includes(coin)));
  }
});

test("9012 separates the dp update from the pick update", () => {
  const run = problem.builder("1,3,4", { price: 0, paid: 6 });
  const dpUpdateIndex = run.steps.findIndex((step) => step.codeLines[0] === 22 && step.vending9012View.amount === 1);
  assert.ok(dpUpdateIndex >= 0);

  const dpStep = run.steps[dpUpdateIndex].vending9012View;
  const pickStep = run.steps[dpUpdateIndex + 1].vending9012View;
  assert.equal(run.steps[dpUpdateIndex + 1].codeLines[0], 23);
  assert.equal(dpStep.dp[1], 1);
  assert.equal(dpStep.pick[1], -1);
  assert.equal(pickStep.dp[1], 1);
  assert.equal(pickStep.pick[1], 1);
});

test("9012 validates denominations and payment values", () => {
  for (const input of ["", "1,,5", "0,1", "-1,2", "1.5,2", "a,2"]) {
    assert.throws(() => problem.builder(input, { price: 0, paid: 5 }));
  }
  assert.throws(() => problem.builder("1,5", { price: 6, paid: 5 }));
  assert.throws(() => problem.builder("1,5", { price: -1, paid: 5 }));
  assert.throws(() => problem.builder("1,5", { price: 0.5, paid: 5 }));
});
