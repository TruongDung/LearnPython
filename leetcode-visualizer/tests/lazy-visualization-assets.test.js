const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
const appCore = fs.readFileSync(path.join(root, "public/app-core.js"), "utf8");
const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");

test("problem-specific visualization assets are inert during initial page load", () => {
  assert.match(html, /<template id="problemVisualizationStyles" data-problem-assets="styles">[\s\S]*max-consecutive-ones-1004\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts" data-problem-assets="scripts">[\s\S]*renderer-max-consecutive-ones-1004\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /renderer-max-consecutive-ones-1004\.(?:js|css)/);
});

test("the client loads only the selected problem assets and preserves script order", () => {
  assert.match(appCore, /function problemVisualizationAssetNodes\(problemId\)/);
  assert.match(appCore, /template\[data-problem-assets\]/);
  assert.match(appCore, /asset\.async = false/);
  assert.match(appCore, /for \(const script of scripts\) \{\s*await loadProblemVisualizationAsset\(script\);/);
  assert.match(appCore, /warmProblemVisualizationAssets\(data\.id\)/);
  assert.match(appCore, /ensureProblemVisualizationAssets\(currentProblemId\)/);
});

test("shared renderer and style chunks are deferred until solve steps identify a renderer", () => {
  assert.match(html, /<template id="sharedVisualizationStyles" data-shared-visualization-assets="styles">[\s\S]*style-07\.css[\s\S]*requested-visualizations\.css[\s\S]*hard-problems\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="sharedVisualizationScripts" data-shared-visualization-assets="scripts">[\s\S]*renderers-06\.js[\s\S]*renderer-requested-visualizations\.js[\s\S]*renderer-hard-problems\.js[\s\S]*<\/template>/);
  assert.match(script, /const SHARED_RENDERER_BUNDLES = Object\.freeze\(/);
  assert.match(script, /const SHARED_RENDERER_STYLES = Object\.freeze\(/);
  assert.match(script, /function rendererFunctionName\(rendererEntry\)/);
  assert.match(script, /async function ensureSharedVisualizationAssets\(nextSteps\)/);
  assert.match(appCore, /await ensureSharedVisualizationAssets\(data\.steps \|\| \[\]\)/);
});

test("Monaco loader is requested only after the live editor is opened", () => {
  assert.doesNotMatch(html, /monaco-editor@0\.52\.0\/min\/vs\/loader\.js/);
  assert.match(script, /const MONACO_LOADER_URL = "https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@0\.52\.0\/min\/vs\/loader\.js"/);
  assert.match(script, /const loader = document\.createElement\("script"\)/);
  assert.match(script, /loader\.async = true/);
  assert.match(script, /\$\("liveEditBtn"\).*addEventListener\("click", async \(\) =>/);
  assert.match(script, /await ensureMonacoEditor\(\)/);
});

test("every registry renderer housed in a shared bundle is present in the lazy manifest", () => {
  const bundleJson = script.match(/const SHARED_RENDERER_BUNDLES = Object\.freeze\((\{[^\n]+\})\);/)?.[1];
  assert.ok(bundleJson, "shared renderer manifest should be parseable");
  const manifestNames = new Set(Object.values(JSON.parse(bundleJson)).flat());
  const registryNames = new Set([...script.matchAll(/\b(render[A-Za-z0-9_]+)\(step(?:[,)]|\s*\))/g)].map(match => match[1]));
  for (let index = 1; index <= 6; index += 1) {
    const source = fs.readFileSync(path.join(root, `public/renderers-0${index}.js`), "utf8");
    for (const name of [...source.matchAll(/^function (render[A-Za-z0-9_]+)\(/gm)].map(match => match[1])) {
      if (registryNames.has(name)) assert.ok(manifestNames.has(name), `${name} is missing from the lazy manifest`);
    }
  }
});
