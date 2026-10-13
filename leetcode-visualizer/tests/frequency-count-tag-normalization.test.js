"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

test("Frequency Count merges both aliases into one bilingual four-problem group", () => {
  const ids = [];
  const keys = new Set();
  for (const problem of Object.values(SUPPORTED)) {
    const categories = [problem.category, ...(problem.tags || [])].filter(Boolean);
    assert.ok(!categories.some(tag => tag.key === "frequency"), `problem ${problem.id} uses the old alias`);
    for (const tag of categories.filter(tag => tag.en === "Frequency Count")) {
      keys.add(tag.key);
      assert.deepEqual(tag, { key: "frequency-count", vi: "Đếm tần suất", en: "Frequency Count" });
    }
    if (categories.some(tag => tag.key === "frequency-count")) ids.push(problem.id);
    const tagKeys = (problem.tags || []).map(tag => tag.key);
    assert.equal(new Set(tagKeys).size, tagKeys.length);
  }
  assert.deepEqual([...keys], ["frequency-count"]);
  assert.deepEqual(ids.sort((a, b) => a - b), [350, 387, 3720, 3734]);
});
