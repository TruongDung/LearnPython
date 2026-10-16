"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

test("all listed minimax and maximin problems carry the minimax tag", () => {
  for (const id of [410, 1631, 778, 1102, 375, 486, 464]) {
    const problem = SUPPORTED[id];
    assert.ok(problem, `problem ${id} should be supported`);
    assert.ok(
      problem.tags.some((tag) => tag.key === "minimax"),
      `problem ${id} should carry the minimax tag`,
    );
  }
});
