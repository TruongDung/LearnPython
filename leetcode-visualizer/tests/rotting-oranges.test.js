const { readFrontendStyles } = require('./helpers/frontend-source');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[994];

function renderView(step, language = 'vi') {
  const treeView = { innerHTML: '' };
  const context = {
    lang: language,
    escapeHtml: value => String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]),
    pick: value => typeof value === 'object' && value !== null
      ? value[language] || value.en
      : value,
    $: id => id === 'treeView' ? treeView : null,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../public/app-renderers-base.js'), 'utf8'), context);
  context.renderRottingOrangesView(step);
  return treeView.innerHTML;
}

test('994 solves the standard, impossible, and already-finished cases', () => {
  const cases = [
    ['2,1,1|1,1,0|0,1,1', 4],
    ['2,1,1|0,1,1|1,0,1', -1],
    ['0,2', 0],
  ];

  for (const [input, answer] of cases) {
    const result = problem.builder(input);
    assert.equal(result.answer, answer);
    assert.ok(result.steps.every(step => step.rottingOrangesView));
  }
});

test('994 traces exactly one executable Python line per frame', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  const run = problem.builder(problem.defaultInput);

  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(problem.code[step.codeLines[0] - 1]?.trim());
    assert.ok(step.rottingOrangesView);
  }
});

test('994 renderer and picture styles are registered for lazy loading', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const bundleManifest = JSON.parse(script.match(
    /const SHARED_RENDERER_BUNDLES = Object\.freeze\((\{[^\n]+\})\);/,
  )[1]);
  const styleManifest = JSON.parse(script.match(
    /const SHARED_RENDERER_STYLES = Object\.freeze\((\{[^\n]+\})\);/,
  )[1]);

  assert.ok(bundleManifest['app-renderers-base.js'].includes('renderRottingOrangesView'));
  assert.ok(styleManifest['style-04.css'].includes('renderRottingOrangesView'));
});

test('994 renderer emphasizes the orange grid and propagation arrows', () => {
  const run = problem.builder(problem.defaultInput);
  const step = run.steps.find(item => item.rottingOrangesView.event === 'neighbor-check');

  for (const language of ['vi', 'en']) {
    const html = renderView(step, language);
    assert.match(html, /rotting-debug-line/);
    assert.match(html, /rotting-grid/);
    assert.match(html, /rotting-orange/);
    assert.match(html, /rotting-directions/);
    assert.match(html, /rotting-neighbor-check/);
    assert.doesNotMatch(html, /THIS ORANGE ROTS|SKIP THIS DIRECTION|inside grid/);
    assert.doesNotMatch(html, /undefined|NaN|object Object/);
  }
});

test('994 light theme keeps labels, empty cells, and state panels legible', () => {
  const css = readFrontendStyles();

  assert.match(css, /\[data-theme="light"\] \.rotting-phases span \{ color: #475569; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-status small,[\s\S]*?\.rotting-action span \{ color: #475569; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-cell\.is-empty \{ opacity: 1; background: #f1f5f9; \}/);
  assert.match(css, /\[data-theme="light"\] \.rotting-checks > span strong \{ color: #1e293b; \}/);
  assert.match(css, /\.rotting-direction small,[\s\S]*?font-size: 8px;/);
});
