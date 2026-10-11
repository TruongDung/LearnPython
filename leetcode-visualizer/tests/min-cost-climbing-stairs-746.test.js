const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');

const { SUPPORTED } = require('../problems');
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[746];

test('746 solves the official examples with both approaches', () => {
  const cases = [
    [[10, 15, 20], 15],
    [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1], 6],
    [[0, 0], 0],
    [[5, 7, 2, 4], 7],
  ];

  for (const approach of [1, 2]) {
    for (const [cost, expected] of cases) {
      const run = problem.builder(cost, { approach });
      assert.equal(run.answer, expected, JSON.stringify({ approach, cost }));
      assert.equal(run.steps.at(-1).minCostStairsView.answer, expected);
      assert.equal(run.steps.at(-1).minCostStairsView.phase, 'done');
    }
  }
});

test('746 compact renderer draws stairs, jump choices, and rolling memory', () => {
  const script = readFrontendJavaScript();
  const start = script.indexOf('function renderMinCostStairsView(step)');
  const end = script.indexOf('\nfunction ', start + 20);
  assert.ok(start >= 0 && end > start);

  const element = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value),
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const costs = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const approach of [1, 2]) {
      const run = problem.builder(costs, { approach });
      for (const step of run.steps) {
        context.renderMinCostStairsView(step);
        assert.match(element.innerHTML, /mcs746-viz/);
        assert.match(element.innerHTML, /mcs746-costs/);
        assert.match(element.innerHTML, /mcs746-top/);
        assert.ok((element.innerHTML.match(/class="mcs746-cost(?: |")/g) || []).length <= 5);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.doesNotMatch(element.innerHTML, /mcs746-rule|LIVE MEMORY|BỘ NHỚ ĐANG GIỮ/);
      }
    }
  }

  const dpRun = problem.builder([10, 15, 20], { approach: 1 });
  context.renderMinCostStairsView(dpRun.steps.find((step) => step.minCostStairsView.formula));
  assert.match(element.innerHTML, /mcs746-formula/);
  assert.match(element.innerHTML, /↗↗/);
  assert.match(element.innerHTML, /mcs746-opt chosen/);

  const compactText = element.innerHTML
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  assert.ok(compactText.length < 180, `visual should stay compact, got ${compactText.length} chars`);

  const rollingRun = problem.builder([10, 15, 20], { approach: 2 });
  context.renderMinCostStairsView(rollingRun.steps[0]);
  assert.match(element.innerHTML, /mcs746-regs/);
  assert.match(element.innerHTML, /prev2/);
  assert.match(element.innerHTML, /prev1/);

  context.renderMinCostStairsView(rollingRun.steps.at(-1));
  assert.match(element.innerHTML, /mcs746-answer/);
  assert.match(element.innerHTML, /MIN COST/);
});

test('746 visualization is theme-aware, responsive, and cache-busted', () => {
  const index = readFrontendIndex();
  const styles = readFrontendStyles();

  assert.match(index, /style-06\.css[^"']*min-cost-stairs-746-v2/);
  assert.match(index, /renderers-05\.js[^"']*min-cost-stairs-746-v2/);
  assert.match(styles, /\.mcs746-costs \{[^}]*align-items: flex-end/s);
  assert.match(styles, /\.mcs746-cost\.source\.chosen::after/);
  assert.match(styles, /\[data-theme="light"\] \.mcs746-viz/);
  assert.match(styles, /@container \(max-width: 560px\)/);
  assert.match(styles, /@container \(max-width: 390px\)/);
});
