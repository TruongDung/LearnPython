"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const { test } = require("node:test");
const {
  SUPPORTED,
  SEGMENT_TREE_SUBTABS,
  SEGMENT_TREE_TAG,
} = require("../problems");

const requestedIds = [
  218, 307, 308, 315, 327, 406, 493, 673, 683, 699,
  715, 729, 731, 732, 850, 1157, 1395, 1505, 1521, 1622,
  1649, 1687, 2031, 2080, 2158, 2179, 2213, 2276, 2286, 2407,
  2424, 2426, 2519, 2569, 2659, 2736, 2907, 2913, 2916, 2921,
  2926, 2940, 3072, 3109, 3117, 3161, 3165, 3171, 3187, 3209,
  3291, 3292, 3380, 3382, 3410, 3420, 3454, 3477, 3479, 3480,
  3501, 3515, 3520, 3525, 3569, 3605, 3624, 3691, 3719, 3721,
  3737, 3739, 3762, 3768, 3777, 3841, 3901, 3915, 3930, 3935,
  4011, 4013, 4017, 4033, 4042, 4051, 4055,
];

test("all available requested problems are grouped under Segment Tree", () => {
  const available = requestedIds.filter((id) => SUPPORTED[id]);
  assert.equal(available.length, 31);
  for (const id of available) {
    const problem = SUPPORTED[id];
    const belongsToSegmentTree = problem.category === SEGMENT_TREE_TAG
      || (problem.tags || []).includes(SEGMENT_TREE_TAG);
    assert.equal(belongsToSegmentTree, true, `#${id}`);
  }
});

test("the Segment Tree roster exposes all 87 requested problems", () => {
  const [all] = SEGMENT_TREE_SUBTABS;
  assert.equal(all.key, "all");
  assert.equal(all.roster.length, 87);
  assert.deepEqual(all.roster.map((problem) => problem.id), requestedIds);
  assert.equal(new Set(all.roster.map((problem) => problem.id)).size, 87);
  assert.equal(all.roster.filter((problem) => problem.available).length, 31);
  assert.equal(all.roster.filter((problem) => !problem.available).length, 56);
  for (const problem of all.roster) {
    assert.ok(problem.title.length > 3, `#${problem.id} title`);
    assert.match(problem.difficulty, /^(easy|medium|hard)$/);
    assert.equal(problem.available, Boolean(SUPPORTED[problem.id]));
  }
});

test("catalog API wiring keeps unavailable Segment Tree problems dimmed", () => {
  const server = fs.readFileSync(require.resolve("../server.js"), "utf8");
  const client = fs.readFileSync(require.resolve("../public/app-core.js"), "utf8");
  const styles = fs.readFileSync(require.resolve("../public/style-09.css"), "utf8");
  assert.match(server, /SEGMENT_TREE_SUBTABS/);
  assert.match(server, /segmentTreeGroup\.subTabs/);
  assert.match(client, /p\.unavailable \? " unavailable"/);
  assert.match(client, /chip\.disabled = true/);
  assert.match(styles, /\.prob-chip\.unavailable\s*\{[\s\S]*?opacity:\s*0\.44/);
});
