const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const { readFrontendStyles } = require('./helpers/frontend-source');
const problem = require('../problems').SUPPORTED[684];

test('684 keeps the expected Union-Find answers and line-by-line trace', () => {
  assert.deepEqual(problem.builder('1,2;1,3;2,3').answer, [2, 3]);
  assert.deepEqual(problem.builder('1,2;2,3;3,4;1,4;1,5').answer, [1, 4]);

  const run = problem.builder('1,2;1,3;2,3');
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'find-check'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'attach-root'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'cycle-check'));
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.deepEqual(run.steps.at(-1).unionFind684View.answer, [2, 3]);
});

test('684 renderer explains every trace frame without corrupted placeholders', () => {
  const rendererPath = path.resolve(__dirname, '../public/renderer-requested-visualizations.js');
  const source = fs.readFileSync(rendererPath, 'utf8');
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;'),
    pick: value => typeof value === 'object' && value !== null
      ? (value[context.lang] || value.en || value.vi || '')
      : String(value ?? ''),
  };
  vm.createContext(context);
  vm.runInContext(source, context);

  const run = problem.builder('1,2;1,3;2,3');
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderUnionFind684View(step);
      assert.match(element.innerHTML, /rv-dsu684-viz/);
      assert.match(element.innerHTML, /rv-dsu-rule/);
      assert.match(element.innerHTML, /rv-dsu-edge-stream/);
      assert.doesNotMatch(element.innerHTML, /\?\?\?|undefined|NaN|Infinity/);
    }
  }

  context.lang = 'en';
  context.renderUnionFind684View(run.steps.at(-1));
  assert.match(element.innerHTML, /SAME GROUP → CYCLE/);
  assert.match(element.innerHTML, /REDUNDANT EDGE/);
  assert.match(element.innerHTML, /\[2, 3\]/);
});

test('684 dedicated styles are responsive and prevent horizontal overflow', () => {
  const css = readFrontendStyles();
  assert.match(css, /\.rv-dsu684-viz\s*\{/);
  assert.match(css, /\.rv-dsu684-viz[^}]*overflow-x:\s*clip/s);
  assert.match(css, /@container rv-dsu684 \(max-width:\s*620px\)/);
  assert.match(css, /@container rv-dsu684 \(max-width:\s*380px\)/);
  assert.match(css, /\.rv-dsu-decision/);
  assert.match(css, /\.rv-dsu-explanation/);
});
