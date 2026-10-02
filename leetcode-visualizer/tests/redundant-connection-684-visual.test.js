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

  assert.equal(problem.code[1], '    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:');
  assert.equal(problem.code[2], '        n = len(edges)');
  assert.equal(problem.code[9], '                parent[x] = find(parent[x])   # Path Compression');
  assert.equal(problem.code[12], '        def union(x, y):');
  assert.equal(problem.code[18], '                return False');
  assert.equal(problem.code[34], '            if not union(u, v):');

  const run = problem.builder('1,2;1,3;2,3');
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'find-check'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'attach-y-to-x'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'cycle-check'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'union-true'));
  assert.ok(run.steps.some(step => step.unionFind684View.operation === 'union-false'));
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 2 && step.codeLines[0] <= problem.code.length));
  assert.deepEqual(run.steps.at(-1).unionFind684View.answer, [2, 3]);
});

test('684 traces every union-by-rank branch used by the requested code', () => {
  const equalThenGreater = problem.builder('1,2;1,3;2,3');
  const smaller = problem.builder('1,2;3,2;1,3');
  const operations = [...equalThenGreater.steps, ...smaller.steps]
    .map(step => step.unionFind684View.operation);

  assert.ok(operations.includes('equal-rank-branch'));
  assert.ok(operations.includes('attach-y-to-x'));
  assert.ok(operations.includes('rank-increment'));
  assert.ok(operations.includes('rank-greater-check'));
  assert.ok(operations.includes('attach-x-to-y'));
  assert.deepEqual(smaller.answer, [1, 3]);
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
