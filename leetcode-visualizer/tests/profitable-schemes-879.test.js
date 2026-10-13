"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[879];

test("Profitable Schemes 879 keeps the sample answer and visual state aligned", () => {
  const run = problem.builder(problem.defaultInput, {
    minProfit: 3,
    group: "2,2",
    profit: "2,3",
  });

  assert.equal(run.answer, 2);
  assert.equal(run.steps.at(-1).profitableSchemes879View.answer, 2);
  assert.equal(run.steps.at(-1).profitableSchemes879View.dp[5][3], 2);
  assert.ok(run.steps.every((step) => step.profitableSchemes879View));
  assert.deepEqual(
    run.steps.map((step) => step.profitableSchemes879View.phase),
    ["intro", "crime", "crime", "result"],
  );
});

test("Profitable Schemes 879 exposes before/after plans and source states per crime", () => {
  const run = problem.builder([5], {
    minProfit: 3,
    group: "2,2",
    profit: "2,3",
  });
  const firstCrime = run.steps[1].profitableSchemes879View;
  const secondCrime = run.steps[2].profitableSchemes879View;

  assert.deepEqual(firstCrime.crimes[0], { index: 0, members: 2, gain: 2 });
  assert.equal(firstCrime.beforeDp[2][2], 0);
  assert.equal(firstCrime.dp[2][2], 1);
  assert.ok(firstCrime.updates.some((update) =>
    update.members === 2 && update.profit === 2 &&
    update.sourceMembers === 0 && update.sourceProfit === 0 &&
    update.previous === 0 && update.added === 1 && update.after === 1,
  ));
  assert.equal(secondCrime.dp[5][3], 2);
});

test("Profitable Schemes 879 handles zero required profit and an unusable crime", () => {
  const run = problem.builder([3], {
    minProfit: 0,
    group: "4",
    profit: "0",
  });

  assert.equal(run.answer, 1);
  assert.equal(run.steps.at(-1).profitableSchemes879View.dp[3][0], 1);
  assert.equal(run.steps.at(-1).profitableSchemes879View.crimes.length, 1);
});
