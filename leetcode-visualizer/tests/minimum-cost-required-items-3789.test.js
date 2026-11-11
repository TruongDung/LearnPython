'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { SUPPORTED } = require('../problems');
const { runTrace } = require('../problems/wasm-picture-trace');
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');

const problem = SUPPORTED[3789];

function bruteForce([cost1, cost2, costBoth, need1, need2]) {
  let best = Infinity;
  for (let both = 0; both <= Math.max(need1, need2); both++) {
    best = Math.min(best,
      both * costBoth + Math.max(0, need1 - both) * cost1 + Math.max(0, need2 - both) * cost2);
  }
  return best;
}

test('3789 is registered with the official examples and all three breakpoints', () => {
  assert.equal(problem.slug, 'minimum-cost-to-acquire-required-items');
  assert.equal(problem.category.key, 'math');
  assert.equal(problem.debugMode, 'line-by-line');
  for (const [input, answer] of [
    ['3,2,1,3,2', 3],
    ['5,4,15,2,3', 22],
    ['5,4,15,0,0', 0],
  ]) {
    const run = problem.builder(input);
    assert.equal(run.answer, answer);
    assert.deepEqual(run.original, input.split(',').map(Number));
    const [both, only1, only2] = run.steps.at(-1).cost3789View.bestPlan;
    assert.ok(both + only1 >= run.original[3]);
    assert.ok(both + only2 >= run.original[4]);
    assert.equal(both * run.original[2] + only1 * run.original[0] + only2 * run.original[1], answer);
  }
  assert.deepEqual(problem.liveArgs('[3,2,1,3,2]'), [3, 2, 1, 3, 2]);
});

test('3789 breakpoint strategy matches brute force over small randomized inputs', () => {
  let seed = 3789;
  const random = maximum => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % maximum;
  };
  for (let trial = 0; trial < 120; trial++) {
    const input = [
      1 + random(30), 1 + random(30), 1 + random(30),
      random(16), random(16),
    ];
    const run = problem.builder(input);
    assert.equal(run.answer, bruteForce(input), JSON.stringify(input));
    const winner = run.steps.at(-1).cost3789View;
    const [both, only1, only2] = winner.bestPlan;
    assert.ok(both + only1 >= input[3]);
    assert.ok(both + only2 >= input[4]);
    assert.equal(both * input[2] + only1 * input[0] + only2 * input[1], run.answer);
  }
});

test('3789 step highlights and watched values match the executed Python code', () => {
  for (const input of ['3,2,1,3,2', '5,4,15,2,3', '5,4,15,0,0', '1,100,2,8,2']) {
    const args = problem.liveArgs(input);
    const trace = runTrace({ code: problem.code.join('\n'), method: 'minimumCost', args });
    const run = problem.builder(input);
    assert.equal(run.steps.length, trace.events.length);
    assert.equal(run.answer, trace.answer);
    run.steps.forEach((step, index) => {
      const event = trace.events[index];
      assert.deepEqual(step.codeLines, [event.line]);
      assert.equal(step.cost3789View.source, problem.code[event.line - 1].trim());
      assert.deepEqual(step.vars, Object.entries(event.locals).map(([name, value]) => ({ name, value, rawValue: value })));
      assert.equal(step.final, index === trace.events.length - 1);
    });
  }
});

test('3789 renderer compares purchase counts, fulfillment, costs, and the final minimum in both languages', () => {
  const run = problem.builder(problem.defaultInput);
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    escapeHtml: value => String(value),
    steps: run.steps,
    stepIndex: run.steps.findIndex(step => step.cost3789View.action === 'cost'),
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../public/renderer-minimum-cost-required-items-3789.js'), 'utf8'),
    context,
  );
  context.renderMinimumCost3789View(run.steps[context.stepIndex]);
  assert.match(host.innerHTML, /No type-3 items/);
  assert.match(host.innerHTML, /Meet the smaller need/);
  assert.match(host.innerHTML, /Cover the larger need/);
  assert.match(host.innerHTML, /Both needs are met/);
  assert.match(host.innerHTML, /Type-1 requirement/);

  context.lang = 'vi';
  context.stepIndex = run.steps.length - 1;
  context.renderMinimumCost3789View(run.steps.at(-1));
  assert.match(host.innerHTML, /CHI PHÍ NHỎ NHẤT/);
  assert.match(host.innerHTML, /Đáp ứng nhu cầu nhỏ hơn/);
  assert.match(host.innerHTML, /RẺ NHẤT/);
  assert.match(host.innerHTML, /3/);
});

test('3789 validates all five inputs against the statement constraints', () => {
  for (const input of ['', '1,2,3,4', '0,2,3,4,5', '1,2,3,-1,5',
    '1,2,3,4,1000000001', '1,2,3,4.5,5', '[true,2,3,4,5]', '1,nope,3,4,5']) {
    assert.throws(() => problem.builder(input), RangeError, input);
  }
  assert.equal(problem.builder([1, 1, 1, 1e9, 1e9]).answer, 1e9);
});

test('3789 renderer files are wired into the page and frontend source manifests', () => {
  const html = readFrontendIndex();
  assert.match(html, /minimum-cost-required-items-3789\.css[^\n]*data-problem-ids="3789"/);
  assert.match(html, /renderer-minimum-cost-required-items-3789\.js[^\n]*data-problem-ids="3789"/);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-minimum-cost-required-items-3789.js'));
  assert.ok(STYLESHEET_ASSETS.includes('minimum-cost-required-items-3789.css'));
  assert.match(readFrontendJavaScript(), /renderMinimumCost3789View/);
  assert.match(readFrontendStyles(), /\.cost3789-viz/);
});
