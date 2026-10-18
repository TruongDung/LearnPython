"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { SUPPORTED } = require("../problems");

const requestedIds = [
  207, 210, 269, 310, 329, 444, 631, 802, 851, 913,
  1059, 1136, 1203, 1245, 1462, 1591, 1632, 1728, 1786, 1857,
  1916, 1976, 2050, 2115, 2127, 2192, 2204, 2246, 2328, 2360,
  2371, 2392, 2603, 2876, 3383, 3435, 3481, 3530, 3620, 3812,
];

const expectedMissing = [
  310, 444, 631, 1059, 1203, 1591, 1632, 1728, 1916,
  2127, 2204, 2371, 2603, 3383, 3435, 3530, 3812,
];

test("all available requested problems are grouped under Topological Sort", () => {
  const available = requestedIds.filter(id => SUPPORTED[id]);
  assert.equal(available.length, 23);
  for (const id of available) {
    const tags = SUPPORTED[id].tags || [];
    const matches = tags.filter(tag => tag.key === "topological-sort");
    assert.deepEqual(matches, [{ key: "topological-sort", vi: "Topological Sort", en: "Topological Sort" }], `#${id}`);
  }
});

test("the requested topo list records exactly the unavailable visualizations", () => {
  assert.deepEqual(requestedIds.filter(id => !SUPPORTED[id]), expectedMissing);
});
