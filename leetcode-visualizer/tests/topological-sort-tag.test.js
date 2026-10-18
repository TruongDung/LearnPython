"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { test } = require("node:test");
const {
  SUPPORTED,
  TOPOLOGICAL_SORT_SUBTABS,
  TOPOLOGICAL_SORT_TAG,
} = require("../problems");

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
    assert.deepEqual(matches, [TOPOLOGICAL_SORT_TAG], `#${id}`);
  }
});

test("the Topological Sort roster exposes all 40 problems and marks 17 unavailable", () => {
  const [all] = TOPOLOGICAL_SORT_SUBTABS;
  const rosterIds = all.roster.map(problem => problem.id);
  assert.equal(all.key, "all");
  assert.equal(all.roster.length, 40);
  assert.equal(new Set(rosterIds).size, 40);
  assert.deepEqual(rosterIds, requestedIds);
  assert.deepEqual(all.roster.filter(problem => !problem.available).map(problem => problem.id), expectedMissing);
  assert.equal(all.roster.filter(problem => problem.available).length, 23);
  for (const problem of all.roster) {
    assert.ok(problem.title.length > 3, `#${problem.id} title`);
    assert.match(problem.difficulty, /^(medium|hard)$/);
  }
});

test("catalog API wiring renders unavailable topo problems as dimmed disabled chips", () => {
  const server = fs.readFileSync(require.resolve("../server.js"), "utf8");
  const client = fs.readFileSync(require.resolve("../public/app-core.js"), "utf8");
  const styles = fs.readFileSync(require.resolve("../public/style-09.css"), "utf8");
  assert.match(server, /TOPOLOGICAL_SORT_SUBTABS/);
  assert.match(server, /topologicalGroup\.subTabs/);
  assert.match(client, /p\.unavailable \? " unavailable"/);
  assert.match(client, /chip\.disabled = true/);
  assert.match(styles, /\.prob-chip\.unavailable\s*\{[\s\S]*?opacity:\s*0\.44/);
});
