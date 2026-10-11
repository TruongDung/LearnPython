const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "public/index.html"), "utf8");
const shellUi = fs.readFileSync(path.join(root, "public/shell-ui.css"), "utf8");
const appCore = fs.readFileSync(path.join(root, "public/app-core.js"), "utf8");
const baseRenderers = fs.readFileSync(path.join(root, "public/app-renderers-base.js"), "utf8");
const liveEditor = fs.readFileSync(path.join(root, "public/live-editor.js"), "utf8");
const script = fs.readFileSync(path.join(root, "public/script.js"), "utf8");

test("problem-specific visualization assets are inert during initial page load", () => {
  assert.match(html, /<template id="problemVisualizationStyles" data-problem-assets="styles">[\s\S]*max-consecutive-ones-1004\.css[\s\S]*<\/template>/);
  assert.match(html, /<template id="problemVisualizationScripts" data-problem-assets="scripts">[\s\S]*renderer-max-consecutive-ones-1004\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /renderer-max-consecutive-ones-1004\.(?:js|css)/);
});

test("the initial shell keeps code and theme controls styled before visualization assets load", () => {
  const activeHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.match(activeHtml, /<link rel="stylesheet" href="shell-ui\.css\?[^\"]+" \/>/);
  assert.match(shellUi, /\.code-panel\s*\{/);
  assert.match(shellUi, /\.code-line\s*\{/);
  assert.match(shellUi, /\.theme-toggle\s*\{/);
  assert.match(shellUi, /\.theme-auto\s*\{/);
  assert.match(shellUi, /\[data-theme="light"\] body\s*\{/);
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
  assert.match(html, /<template id="sharedVisualizationScripts" data-shared-visualization-assets="scripts">[\s\S]*app-renderers-base\.js[\s\S]*renderers-06\.js[\s\S]*renderer-requested-visualizations\.js[\s\S]*renderer-hard-problems\.js[\s\S]*<\/template>/);
  assert.match(script, /const SHARED_RENDERER_BUNDLES = Object\.freeze\(/);
  assert.match(script, /const SHARED_RENDERER_STYLES = Object\.freeze\(/);
  assert.match(script, /function rendererFunctionName\(rendererEntry\)/);
  assert.match(script, /async function ensureSharedVisualizationAssets\(nextSteps\)/);
  assert.match(appCore, /async function ensureBaseVisualizationRuntime\(\)/);
  assert.match(appCore, /await Promise\.all\(\[[\s\S]*ensureBaseVisualizationRuntime\(\)[\s\S]*ensureSharedVisualizationAssets\(data\.steps \|\| \[\]\)[\s\S]*\]\)/);
});

test("base renderers live outside the initial shell bundle", () => {
  assert.doesNotMatch(appCore, /function renderBars\(/);
  assert.doesNotMatch(appCore, /function renderTree\(/);
  assert.match(baseRenderers, /function renderBars\(/);
  assert.match(baseRenderers, /function renderBfsGrid\(/);
  assert.match(baseRenderers, /function renderGrid\(/);
  assert.match(baseRenderers, /function renderTree\(/);
  assert.match(baseRenderers, /function renderDecisionTree\(/);
});

test("Monaco loader is requested only after the live editor is opened", () => {
  assert.doesNotMatch(html, /monaco-editor@0\.52\.0\/min\/vs\/loader\.js/);
  assert.match(html, /<template id="liveEditorScripts" data-live-editor-assets="scripts">[\s\S]*live-editor\.js[\s\S]*<\/template>/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ""), /live-editor\.js/);
  assert.doesNotMatch(script, /const TRACER_PY|function ensureMonacoEditor\(/);
  assert.match(script, /function ensureLiveEditorRuntime\(\)/);
  assert.match(script, /\$\("liveEditBtn"\).*addEventListener\("click", async \(\) =>/);
  assert.match(script, /await ensureLiveEditorRuntime\(\)/);
  assert.match(script, /await openLiveEditor\(\)/);
  assert.match(liveEditor, /const MONACO_LOADER_URL = "https:\/\/cdn\.jsdelivr\.net\/npm\/monaco-editor@0\.52\.0\/min\/vs\/loader\.js"/);
  assert.match(liveEditor, /const loader = document\.createElement\("script"\)/);
  assert.match(liveEditor, /loader\.async = true/);
  assert.match(liveEditor, /const TRACER_PY = `/);
  assert.match(liveEditor, /async function openLiveEditor\(\)/);
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
