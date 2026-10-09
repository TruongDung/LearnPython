const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const appCore = fs.readFileSync(path.join(root, "public", "app-core.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "public", "style-06.css"), "utf8");

test("BFS catalog exposes a bilingual Learn Suggestion map", () => {
  assert.match(appCore, /group\.key === "bfs"/);
  assert.match(appCore, /BFS LEARNING MAP/);
  assert.match(appCore, /9 nhóm BFS/);
  assert.match(appCore, /9 BFS groups/);
  assert.match(appCore, /data-bfs-problem-id/);
  assert.match(appCore, /0-1 BFS with a deque/);
});

test("BFS learning map has theme-aware category styling", () => {
  assert.match(styles, /\.bfs-learn-suggestion/);
  assert.match(styles, /\.bfs-pattern-card/);
  assert.match(styles, /\[data-theme="light"\] \.bfs-roadmap/);
});
