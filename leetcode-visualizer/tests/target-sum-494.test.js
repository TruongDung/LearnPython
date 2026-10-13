"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[494];

test("Target Sum 494 keeps the signed-sum and subset-DP result aligned", () => {
  const run = problem.builder(problem.defaultInput, { target: 3 });

  assert.equal(run.answer, 5);
  assert.equal(run.steps.at(-1).targetSum494View.answer, 5);
  assert.equal(run.steps.at(-1).targetSum494View.dp[4], 5);
  assert.ok(run.steps.every((step) => step.targetSum494View));
  assert.deepEqual(
    run.steps.slice(0, 3).map((step) => step.targetSum494View.phase),
    ["intro", "feasibility", "reduction"],
  );
});

test("Target Sum 494 exposes consistent before/after DP snapshots", () => {
  const run = problem.builder([1, 2, 1], { target: 2 });
  const steps = run.steps;
  const checks = steps.filter((step) => step.targetSum494View.phase === "consider-sum");
  const updates = steps.filter((step) => step.targetSum494View.phase === "update-sum");

  assert.equal(run.answer, 2);
  assert.ok(checks.length > 0);
  assert.equal(checks.length, updates.length);
  for (const step of checks) {
    const view = step.targetSum494View;
    assert.equal(view.dp[view.currentSum], view.beforeWays);
    assert.equal(view.dp[view.currentSum - run.steps.find(
      (candidate) => candidate.targetSum494View.activeNumIndex === view.activeNumIndex,
    ).targetSum494View.nums[view.activeNumIndex]], view.sourceWays);
  }
  for (const step of updates) {
    const view = step.targetSum494View;
    assert.equal(view.dp[view.currentSum], view.afterWays);
    assert.equal(view.afterWays, view.beforeWays + view.sourceWays);
  }
});

test("Target Sum 494 marks impossible targets in the visualization", () => {
  for (const target of [6, 2]) {
    const run = problem.builder([1, 1, 1, 1, 1], { target });
    assert.equal(run.answer, 0);
    assert.equal(run.steps.at(-1).targetSum494View.phase, "infeasible");
    assert.equal(run.steps.at(-1).targetSum494View.answer, 0);
  }
});

test("Target Sum 494 supports an empty input with target zero", () => {
  const run = problem.builder([], { target: 0 });

  assert.equal(run.answer, 1);
  assert.equal(run.steps.at(-1).targetSum494View.dp[0], 1);
});
