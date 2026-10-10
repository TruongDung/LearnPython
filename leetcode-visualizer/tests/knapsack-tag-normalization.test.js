"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  SUPPORTED,
  KNAPSACK_TAG,
  KNAPSACK_SUBTABS,
  KNAPSACK_ORDER_LABEL,
  KNAPSACK_GUIDE,
} = require("../problems");

test("0/1 Knapsack uses one canonical key across categories and tags", () => {
  const knapsackProblemIds = new Set();

  for (const problem of Object.values(SUPPORTED)) {
    const categories = [problem.category, ...(problem.tags || [])].filter(Boolean);
    assert.equal(
      categories.some((category) => category.key === "knapsack"),
      false,
      `problem ${problem.id} still uses the legacy knapsack key`,
    );
    if (categories.some((category) => category.key === KNAPSACK_TAG.key)) {
      knapsackProblemIds.add(problem.id);
    }

    const tagKeys = (problem.tags || []).map((tag) => tag.key);
    assert.equal(new Set(tagKeys).size, tagKeys.length, `problem ${problem.id} has duplicate tag keys`);
  }

  assert.deepEqual([...knapsackProblemIds].sort((a, b) => a - b), [416, 474, 494, 698, 879, 1049, 2218, 2915]);
});

test("0/1 Knapsack exposes a complete bilingual 24-problem learning path", () => {
  const roster = KNAPSACK_SUBTABS[0].roster;
  const rosterIds = roster.map((problem) => problem.id);

  assert.equal(roster.length, 24);
  assert.equal(new Set(rosterIds).size, 24);
  assert.ok(KNAPSACK_ORDER_LABEL.vi.includes("Lộ trình"));
  assert.ok(KNAPSACK_ORDER_LABEL.en.includes("path"));

  for (const language of ["vi", "en"]) {
    const guide = KNAPSACK_GUIDE[language];
    assert.equal(guide.patterns.length, 24);
    assert.deepEqual(guide.patterns.map((problem) => problem.id), rosterIds);
    assert.equal(guide.stages.length, 5);
    assert.deepEqual(guide.stages.flatMap((stage) => stage.problems), rosterIds);
    assert.ok(guide.intro.length > 80);
    assert.ok(guide.conclusion.length > 80);
  }
});
