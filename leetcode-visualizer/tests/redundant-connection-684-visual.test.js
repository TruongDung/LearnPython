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
      assert.match(element.innerHTML, /d684-graph/);
      assert.match(element.innerHTML, /d684-stream/);
      assert.doesNotMatch(element.innerHTML, /\?\?\?|undefined|NaN|Infinity/);
      const view = step.unionFind684View;
      const lineIndices = [...element.innerHTML.matchAll(/<line class="d684-edge [^"]+" data-edge="(\d+)"/g)].map(match => Number(match[1]));
      assert.deepEqual(lineIndices, view.edges.filter(edge => edge.state !== 'pending').map(edge => edge.index));
      assert.equal((element.innerHTML.match(/<g class="d684-node /g) || []).length, view.nodes.length);
      assert.match(element.innerHTML, /<details class="d684-table" open>/);
      assert.doesNotMatch(element.innerHTML, /rv-action-banner|rv-dsu-explanation|Rank = estimated tree height/);
    }
  }

  context.lang = 'en';
  context.renderUnionFind684View(run.steps.at(-1));
  assert.match(element.innerHTML, /Cycle/);
  assert.match(element.innerHTML, /d684-edge redundant" data-edge="2"/);
  assert.match(element.innerHTML, /d684-edge route" data-edge="0"/);
  assert.match(element.innerHTML, /d684-edge route" data-edge="1"/);
  assert.doesNotMatch(element.innerHTML, /d684-rank/);
  assert.match(element.innerHTML, /Remove edge/);
  assert.match(element.innerHTML, /\[2, 3\]/);

  const equalRankStep = run.steps.find(step => step.unionFind684View.operation === 'equal-rank-branch');
  context.renderUnionFind684View(equalRankStep);
  assert.match(element.innerHTML, /d684-rank/);
  assert.match(element.innerHTML, /<strong>=<\/strong>/);
  assert.match(element.innerHTML, /rank 0/);
  const incrementStep = run.steps.find(step => step.unionFind684View.operation === 'rank-increment');
  context.renderUnionFind684View(incrementStep);
  assert.match(element.innerHTML, /rank\[1\]: 0 → 1 ↑/);

  const lowerRankRun = problem.builder('1,2;3,2;1,3');
  const lowerRankStep = lowerRankRun.steps.find(step => step.unionFind684View.operation === 'attach-x-to-y');
  context.renderUnionFind684View(lowerRankStep);
  assert.match(element.innerHTML, /<strong>&lt;<\/strong>/);
  assert.match(element.innerHTML, /data-child="3" data-parent="1"/);
  const longerCycle = problem.builder('1,2;2,3;3,4;1,4;1,5');
  context.renderUnionFind684View(longerCycle.steps.at(-1));
  for (const index of [0,1,2]) assert.match(element.innerHTML, new RegExp('d684-edge route" data-edge="'+index+'"'));
  assert.match(element.innerHTML, /d684-edge redundant" data-edge="3"/);
  assert.doesNotMatch(element.innerHTML, /<line[^>]*data-edge="4"/);
});

test('684 dedicated styles are responsive and prevent horizontal overflow', () => {
  const css = readFrontendStyles();
  const appCore = fs.readFileSync(path.resolve(__dirname, '../public/app-core.js'), 'utf8');
  assert.match(css, /\.rv-dsu684-viz\s*\{/);
  assert.match(css, /\.rv-dsu684-viz[^}]*overflow-x:\s*clip/s);
  assert.match(css, /@container rv-dsu684 \(max-width:\s*620px\)/);
  assert.match(css, /@container rv-dsu684 \(max-width:\s*380px\)/);
  assert.match(css, /\.rv-dsu-decision/);
  assert.match(css, /\.rv-dsu-explanation/);
  assert.match(css, /\.rv-dsu-rank-lesson/);
  assert.match(css, /\.rv-dsu-rank-compare/);
  assert.match(css, /\.rv-dsu-rank-tower/);
  assert.match(appCore, /classList\.toggle\("problem-684-layout", problemId === 684\)/);
  assert.match(css, /\.viz-split\.problem-684-layout \.code-panel[^{]*\{[^}]*max-height:\s*none[^}]*overflow-y:\s*hidden/s);
});
