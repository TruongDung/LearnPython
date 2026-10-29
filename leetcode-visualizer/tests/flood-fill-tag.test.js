"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { test } = require("node:test");
const {
  CATEGORY_ORDER,
  FLOOD_FILL_SUBTABS,
  FLOOD_FILL_TAG,
  SUPPORTED,
} = require("../problems");

const requested = [
  [733, "Flood Fill", "easy"],
  [200, "Number of Islands", "medium"],
  [695, "Max Area of Island", "medium"],
  [1254, "Number of Closed Islands", "medium"],
  [1020, "Number of Enclaves", "medium"],
  [130, "Surrounded Regions", "medium"],
  [417, "Pacific Atlantic Water Flow", "medium"],
  [994, "Rotting Oranges", "medium"],
  [1905, "Count Sub Islands", "medium"],
  [827, "Making A Large Island", "hard"],
  [934, "Shortest Bridge", "medium"],
  [1568, "Minimum Number of Days to Disconnect Island", "hard"],
  [463, "Island Perimeter", "easy"],
  [529, "Minesweeper", "medium"],
  [1034, "Coloring A Border", "medium"],
  [1162, "As Far from Land as Possible", "medium"],
  [1971, "Find if Path Exists in Graph", "easy"],
  [1992, "Find All Groups of Farmland", "medium"],
  [2658, "Maximum Number of Fish in a Grid", "medium"],
  [2812, "Find the Safest Path in a Grid", "medium"],
  [286, "Walls and Gates", "medium"],
  [305, "Number of Islands II", "hard"],
  [694, "Number of Distinct Islands", "medium"],
  [711, "Number of Distinct Islands II", "hard"],
  [489, "Robot Room Cleaner", "hard"],
  [3619, "Count Islands With Total Value Divisible by K", "medium"],
  [1559, "Detect Cycles in 2D Grid", "medium"],
  [542, "01 Matrix", "medium"],
  [1765, "Map of Highest Peak", "medium"],
  [329, "Longest Increasing Path in a Matrix", "hard"],
  [778, "Swim in Rising Water", "hard"],
  [407, "Trapping Rain Water II", "hard"],
  [864, "Shortest Path to Get All Keys", "hard"],
];

const expectedMissing = [529, 1034, 1992, 2658, 711, 1559];

test("all built requested problems carry the Flood Fill tag", () => {
  const available = requested.filter(([id]) => SUPPORTED[id]).map(([id]) => id);
  assert.equal(available.length, requested.length - expectedMissing.length);
  for (const id of available) {
    assert.deepEqual((SUPPORTED[id].tags || []).filter((tag) => tag.key === FLOOD_FILL_TAG.key), [FLOOD_FILL_TAG], `#${id}`);
  }
});

test("Flood Fill roster preserves the requested order and identifies missing visualizations", () => {
  const [all] = FLOOD_FILL_SUBTABS;
  assert.equal(all.key, "all");
  assert.deepEqual(all.roster.map(({ id, title, difficulty }) => [id, title, difficulty]), requested);
  assert.deepEqual(all.roster.filter((problem) => !problem.available).map((problem) => problem.id), expectedMissing);
  assert.equal(all.roster.filter((problem) => problem.available).length, requested.length - expectedMissing.length);
  assert.deepEqual(CATEGORY_ORDER[FLOOD_FILL_TAG.key].order, requested.map(([id]) => id));
});

test("catalog API sends the Flood Fill roster through the shared dimmed-placeholder UI", () => {
  const server = fs.readFileSync(require.resolve("../server.js"), "utf8");
  const client = fs.readFileSync(require.resolve("../public/app-core.js"), "utf8");
  const styles = fs.readFileSync(require.resolve("../public/style-09.css"), "utf8");
  assert.match(server, /FLOOD_FILL_SUBTABS/);
  assert.match(server, /floodFillGroup\.subTabs/);
  assert.match(client, /const roster = Array\.isArray\(tab\.roster\) \? tab\.roster : \[\]/);
  assert.match(client, /chip\.disabled = true/);
  assert.match(styles, /\.prob-chip\.unavailable\s*\{[\s\S]*?opacity:\s*0\.44/);
});
