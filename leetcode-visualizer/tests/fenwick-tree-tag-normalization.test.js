"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");

test("Fenwick Tree uses one canonical catalog key", () => {
  const fenwickProblemIds = new Set();

  for (const problem of Object.values(SUPPORTED)) {
    const categories = [problem.category, ...(problem.tags || [])].filter(Boolean);
    const keys = categories.map((category) => category.key);

    assert.equal(
      keys.some((key) => key === "fenwick" || key === "binary-indexed-tree"),
      false,
      `problem ${problem.id} still uses a legacy Fenwick key`,
    );

    if (keys.includes("fenwick-tree")) fenwickProblemIds.add(problem.id);
  }

  assert.deepEqual([...fenwickProblemIds].sort((a, b) => a - b), [315, 327, 1649, 2426, 4051, 4055]);
});
