"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");
const problem = SUPPORTED[474];

test("Ones and Zeroes 474 keeps its classic answer and visual snapshots", () => {
  const run = problem.builder(problem.defaultInput, { m: 5, n: 3 });

  assert.equal(run.answer, 4);
  assert.equal(run.steps.at(-1).onesZeros474View.answer, 4);
  assert.ok(run.steps.every((step) => step.onesZeros474View));
  assert.deepEqual(
    run.steps.slice(0, 2).map((step) => step.onesZeros474View.phase),
    ["intro", "initialize"],
  );
});

test("Ones and Zeroes 474 shows the candidate resource cost and skip/take decision", () => {
  const run = problem.builder(["10"], { m: 1, n: 1 });
  const item = run.steps.find((step) => step.onesZeros474View.phase === "inspect-string");
  const comparison = run.steps.find((step) => step.onesZeros474View.phase === "compare");
  const update = run.steps.find((step) => step.onesZeros474View.phase === "update");

  assert.deepEqual(
    [item.onesZeros474View.strings[0].zeros, item.onesZeros474View.strings[0].ones],
    [1, 1],
  );
  assert.equal(comparison.onesZeros474View.skip, 0);
  assert.equal(comparison.onesZeros474View.takeFrom, 0);
  assert.equal(comparison.onesZeros474View.take, 1);
  assert.equal(update.onesZeros474View.result, 1);
  assert.equal(update.onesZeros474View.dp[1][1], 1);
});

test("Ones and Zeroes 474 skips strings that exceed either pocket", () => {
  const run = problem.builder(["000", "1"], { m: 2, n: 1 });
  const skipped = run.steps.filter((step) => step.onesZeros474View.phase === "skip-string");

  assert.equal(run.answer, 1);
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].onesZeros474View.activeIndex, 0);
});

test("Ones and Zeroes 474 allows empty strings without reusing an item", () => {
  const run = problem.builder(["", "0"], { m: 1, n: 0 });

  assert.equal(run.answer, 2);
  assert.equal(run.steps.at(-1).onesZeros474View.dp[1][0], 2);
});
