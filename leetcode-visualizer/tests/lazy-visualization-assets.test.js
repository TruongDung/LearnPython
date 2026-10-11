const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
const appCore = fs.readFileSync(path.join(root, "public/app-core.js"), "utf8");

test("problem-specific visualization assets are inert during initial page load", () => {
  assert.match(html, /<template id="problemVisualizationStyles" data-problem-assets="styles">[\s\S]*max-consecutive-ones-1004\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts" data-problem-assets="scripts">[\s\S]*renderer-max-consecutive-ones-1004\.js[\s\S]*<\/template>/);
  assert.match(html, /<\/template>\s*<script src="renderer-requested-visualizations\.js/);
  assert.match(html, /<\/template>\s*<link rel="stylesheet" href="requested-visualizations\.css/);
});

test("the client loads only the selected problem assets and preserves script order", () => {
  assert.match(appCore, /function problemVisualizationAssetNodes\(problemId\)/);
  assert.match(appCore, /template\[data-problem-assets\]/);
  assert.match(appCore, /asset\.async = false/);
  assert.match(appCore, /for \(const script of scripts\) \{\s*await loadProblemVisualizationAsset\(script\);/);
  assert.match(appCore, /warmProblemVisualizationAssets\(data\.id\)/);
  assert.match(appCore, /ensureProblemVisualizationAssets\(currentProblemId\)/);
});
