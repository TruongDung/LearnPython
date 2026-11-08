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

  assert.deepEqual([...fenwickProblemIds].sort((a, b) => a - b), [303, 307, 308, 315, 327, 493, 673, 775, 1395, 1409, 1505, 1649, 2179, 2250, 2426, 2519, 2659, 2907, 2908, 2916, 2940, 3072, 3161, 3187, 3505, 4051, 4055]);
});
