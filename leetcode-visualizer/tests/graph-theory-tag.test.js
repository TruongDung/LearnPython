"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const requestedIds = [133, 207, 210, 261, 269, 277, 310, 323];
const availableIds = [133, 207, 210, 261, 269, 323];

test("requested available problems are grouped under Graph Theory", () => {
  for (const id of availableIds) {
    assert.ok(SUPPORTED[id], `#${id} should be available`);
    const tag = SUPPORTED[id].tags.find(item => item.key === "graph-theory");
    assert.deepEqual(tag, { key: "graph-theory", vi: "Lý thuyết đồ thị", en: "Graph Theory" });
  }
});

test("the requested list keeps unsupported problems out of the runnable catalog", () => {
  assert.deepEqual(requestedIds.filter(id => !SUPPORTED[id]), [277, 310]);
});
