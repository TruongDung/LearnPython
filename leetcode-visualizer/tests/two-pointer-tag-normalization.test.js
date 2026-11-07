"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

test("Two Pointers aliases form one bilingual group without losing either original problem set", () => {
  const ids = new Set();
  const visibleKeys = new Set();
  for (const problem of Object.values(SUPPORTED)) {
    const topics = [problem.category, ...(problem.tags || [])].filter(Boolean);
    assert.equal(topics.some(topic => topic.key === "two-pointers"), false, `legacy alias on #${problem.id}`);
    for (const topic of topics) {
      if (topic.key === "two-pointer" || /^two pointers$/i.test(topic.en || "")) {
        assert.deepEqual(topic, { key: "two-pointer", vi: "Hai con trỏ", en: "Two Pointers" });
        visibleKeys.add(topic.key);
        ids.add(problem.id);
      }
    }
    const keys = (problem.tags || []).map(topic => topic.key);
    assert.equal(new Set(keys).size, keys.length, `duplicate tags on #${problem.id}`);
  }
  assert.deepEqual([...visibleKeys], ["two-pointer"]);
  for (const id of [
    11, 15, 16, 18, 26, 27, 75, 80, 88, 125, 151, 167, 189, 272, 283,
    344, 345, 392, 443, 475, 493, 524, 541, 557, 611, 680, 777, 792,
    844, 900, 905, 917, 977, 1055, 1089, 1111, 1214, 1570, 1750, 1855,
  ]) assert.ok(ids.has(id), `missing merged problem #${id}`);
});
