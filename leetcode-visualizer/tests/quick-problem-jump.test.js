const { JAVASCRIPT_ASSETS, STYLESHEET_ASSETS, readFrontendIndex, readFrontendJavaScript, readFrontendStyles } = require('./helpers/frontend-source');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');

const html = readFrontendIndex();
const script = readFrontendJavaScript();
const css = readFrontendStyles();

test('index loads only the shell assets synchronously and keeps visualization chunks inert', () => {
  const sharedStyleTemplate = html.match(/<template id="sharedVisualizationStyles"[\s\S]*?<\/template>/)?.[0] || '';
  const styleTemplate = html.match(/<template id="problemVisualizationStyles"[\s\S]*?<\/template>/)?.[0] || '';
  const sharedScriptTemplate = html.match(/<template id="sharedVisualizationScripts"[\s\S]*?<\/template>/)?.[0] || '';
  const scriptTemplate = html.match(/<template id="problemVisualizationScripts"[\s\S]*?<\/template>/)?.[0] || '';
  const liveEditorTemplate = html.match(/<template id="liveEditorScripts"[\s\S]*?<\/template>/)?.[0] || '';
  const activeHtml = html
    .replace(sharedStyleTemplate, '')
    .replace(styleTemplate, '')
    .replace(sharedScriptTemplate, '')
    .replace(scriptTemplate, '')
    .replace(liveEditorTemplate, '');
  const shellStyles = new Set(['style.css', 'debug-controls.css']);
  const stylesheetAssets = [...activeHtml.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)]
    .map(match => match[1].split('?')[0]);
  assert.deepEqual(stylesheetAssets, STYLESHEET_ASSETS.filter(asset => shellStyles.has(asset)));
  const deferredSharedStyles = [...sharedStyleTemplate.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)]
    .map(match => match[1].split('?')[0]);
  const isDeferredSharedStyle = asset => /^style-\d+\.css$/.test(asset)
    || asset === 'requested-visualizations.css'
    || asset === 'hard-problems.css';
  assert.deepEqual(deferredSharedStyles, STYLESHEET_ASSETS.filter(isDeferredSharedStyle));
  const deferredStyles = [...styleTemplate.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)]
    .map(match => match[1].split('?')[0]);
  assert.deepEqual(deferredStyles, STYLESHEET_ASSETS.filter(asset => !shellStyles.has(asset) && !isDeferredSharedStyle(asset)));

  const externalScriptTags = [...activeHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)];
  const localScriptTags = externalScriptTags;
  const shellScripts = new Set();
  const isShellScript = asset => asset === 'app-core.js'
    || asset === 'script.js'
    || shellScripts.has(asset);
  assert.deepEqual(localScriptTags.map(match => match[1].split('?')[0]), JAVASCRIPT_ASSETS.filter(isShellScript));
  const isDeferredSharedScript = asset => asset === 'app-renderers-base.js'
    || /^renderers-\d+\.js$/.test(asset)
    || asset === 'renderer-requested-visualizations.js'
    || asset === 'renderer-hard-problems.js';
  const deferredSharedScripts = [...sharedScriptTemplate.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]
    .map(match => match[1].split('?')[0]);
  assert.deepEqual(deferredSharedScripts, JAVASCRIPT_ASSETS.filter(isDeferredSharedScript));
  const deferredLiveEditorScripts = [...liveEditorTemplate.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]
    .map(match => match[1].split('?')[0]);
  assert.deepEqual(deferredLiveEditorScripts, ['live-editor.js']);
  const deferredScripts = [...scriptTemplate.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]
    .map(match => match[1].split('?')[0]);
  assert.deepEqual(deferredScripts, JAVASCRIPT_ASSETS.filter(asset => asset !== 'live-editor.js' && !isShellScript(asset) && !isDeferredSharedScript(asset)));
  for (const [tag] of localScriptTags) {
    assert.doesNotMatch(tag, /\b(?:async|defer)\b|type=["']module["']/i);
  }
  assert.ok(html.indexOf(localScriptTags.at(-1)[0]) < html.indexOf('new MutationObserver'));
});

test('floating tag navigation has an accessible problem textbox and mobile submit button', () => {
  const formStart = html.indexOf('<form id="quickProblemForm"');
  const formEnd = html.indexOf('</form>', formStart);
  const form = html.slice(formStart, formEnd);
  assert.match(form, /aria-label="Jump to LeetCode problem"[\s\S]*<input id="quickProblemId" type="number"/);
  assert.match(form, /<button id="quickProblemGoBtn" type="submit"[\s\S]*>Go<\/button>/);
  assert.doesNotMatch(form, /<label|catalog-quick-row|quickProblemError|aria-hidden="true">#/);
  assert.ok(html.indexOf('id="quickProblemForm"') < html.indexOf('id="backToTopBtn"'));
});

test('quick form delegates to the same loadProblem flow as the top controls', () => {
  assert.match(script, /\$\("quickProblemForm"\)\.addEventListener\("submit", async \(event\) => \{/);
  assert.match(script, /\$\("problemId"\)\.value = input\.value\.trim\(\);/);
  assert.match(script, /await loadProblem\(\{ scrollToEnd: true \}\)/);
  assert.match(script, /input\.setAttribute\("aria-invalid", "true"\)/);
  assert.match(script, /input\.disabled = true;[\s\S]*input\.disabled = false;/);
  assert.match(script, /submitButton\.disabled = true;[\s\S]*submitButton\.disabled = false;/);
  assert.match(script, /jumpNav\.querySelector\("\.catalog-jump-btn"\)/);
});

test('quick form is fixed with the tag shortcuts and remains responsive', () => {
  assert.match(css, /\.catalog-jump-nav \{[\s\S]*position: fixed;[\s\S]*justify-items: end;/);
  assert.match(css, /\.catalog-quick-jump \{[\s\S]*position: sticky;[\s\S]*width: 112px;/);
  assert.match(css, /\.catalog-quick-jump input \{[\s\S]*height: 34px;/);
  assert.match(css, /\.catalog-quick-jump button \{[\s\S]*display: none;/);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\), \(max-width: 640px\)[\s\S]*grid-template-columns: 68px 44px;[\s\S]*\.catalog-quick-jump button \{[\s\S]*display: grid;/);
  assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.catalog-quick-jump \{ width: 112px;/);
});
