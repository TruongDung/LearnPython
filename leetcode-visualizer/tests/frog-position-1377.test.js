const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');

const problem = SUPPORTED[1377];

test('1377 registers its Python trace builder and the sample probability is exact', () => {
  assert.equal(problem.slug, 'frog-position-after-t-seconds');
  assert.equal(problem.debugMode, 'line-by-line');
  const run = problem.builder(problem.defaultInput, { n: 7, t: 2, target: 4 });
  assert.equal(run.answer, 1 / 6);
  assert.equal(run.steps.at(-1).frog1377View.resultDenominator, 6);
  assert.match(run.steps.at(-1).note.en, /probability is 1\/6/);
});

test('1377 explains equal splits, leaf-stays, forced departures, and unreachable targets', () => {
  const split = problem.builder('1,2;1,3;1,4', { n: 4, t: 1, target: 3 }).steps
    .find(step => step.frog1377View.change?.kind === 'split');
  assert.match(split.note.en, /1\/1 ÷ 3 children = 1\/3/);

  const leaf = problem.builder('1,2;1,3;3,4', { n: 4, t: 3, target: 2 });
  assert.equal(leaf.answer, 0.5);
  assert.equal(leaf.steps.at(-1).frog1377View.reason, 'leaf-stay');
  assert.match(leaf.steps.at(-1).note.en, /stays unchanged/);

  const mustLeave = problem.builder('1,2;1,3;2,4', { n: 4, t: 2, target: 2 });
  assert.equal(mustLeave.answer, 0);
  assert.equal(mustLeave.steps.at(-1).frog1377View.reason, 'must-leave');

  const tooFar = problem.builder('1,2;2,3', { n: 3, t: 1, target: 3 });
  assert.equal(tooFar.answer, 0);
  assert.equal(tooFar.steps.at(-1).frog1377View.reason, 'too-far');
});

test('1377 renderer shows the tree, per-node probabilities, BFS queue, and final result', () => {
  const run = problem.builder(problem.defaultInput, { n: 7, t: 2, target: 4 });
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    escapeHtml: value => String(value),
    steps: run.steps,
    stepIndex: run.steps.findIndex(step => step.frog1377View.change?.kind === 'split' && step.frog1377View.current === 2),
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-frog-position-1377.js'), 'utf8'), context);
  context.renderFrog1377View(run.steps[context.stepIndex]);
  assert.match(host.innerHTML, /frog1377-viz/);
  assert.match(host.innerHTML, /Tree rooted at node 1/);
  assert.match(host.innerHTML, /Probability here/);
  assert.match(host.innerHTML, /1\/3 ÷ 2 = 1\/6/);
  assert.match(host.innerHTML, /BFS queue/);

  context.lang = 'vi';
  context.stepIndex = run.steps.length - 1;
  context.renderFrog1377View(run.steps.at(-1));
  assert.match(host.innerHTML, /Cây gốc tại đỉnh 1/);
  assert.match(host.innerHTML, /1\/6/);
  assert.match(host.innerHTML, /frog1377-result/);
});

test('1377 renderer assets are wired for lazy loading and frontend source tests', () => {
  const html = readFrontendIndex();
  assert.ok(html.includes('frog-position-1377.css') && html.includes('data-problem-ids="1377"'));
  assert.ok(html.includes('renderer-frog-position-1377.js') && html.includes('data-problem-ids="1377"'));
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-frog-position-1377.js'));
  assert.ok(STYLESHEET_ASSETS.includes('frog-position-1377.css'));
  assert.match(readFrontendJavaScript(), /renderFrog1377View/);
  assert.match(readFrontendStyles(), /\.frog1377-viz/);
});
