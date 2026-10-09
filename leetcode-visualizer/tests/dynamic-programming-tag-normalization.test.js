"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const { SUPPORTED } = require("../problems");

test("Dynamic Programming uses one canonical dp key across categories and tags", () => {
  const dpProblemIds = new Set();

  for (const problem of Object.values(SUPPORTED)) {
    const categories = [problem.category, ...(problem.tags || [])].filter(Boolean);
    assert.equal(
      categories.some((category) => category.key === "dynamic-programming"),
      false,
      `problem ${problem.id} still uses the legacy dynamic-programming key`,
    );
    if (categories.some((category) => category.key === "dp")) dpProblemIds.add(problem.id);

    const tagKeys = (problem.tags || []).map((tag) => tag.key);
    assert.equal(new Set(tagKeys).size, tagKeys.length, `problem ${problem.id} has duplicate tag keys`);
  }

  assert.equal(dpProblemIds.size, 136);
  for (const id of [787, 975, 1723, 1928, 2050, 2172, 2876, 2945, 3117, 3414]) {
    const problem = SUPPORTED[id];
    assert.ok(problem, `problem ${id} should be registered`);
    assert.ok(
      [problem.category, ...(problem.tags || [])].some((category) => category && category.key === "dp"),
      `problem ${id} should appear in the merged dp group`,
    );
  }
});
