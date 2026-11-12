const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[674];
const { readFrontendIndex, readFrontendJavaScript, readFrontendStyles, JAVASCRIPT_ASSETS, STYLESHEET_ASSETS } = require('./helpers/frontend-source');

function brute(nums) {
  let best = 0;
  for (let s = 0; s < nums.length; s++) {
    let len = 1;
    for (let i = s + 1; i < nums.length && nums[i] > nums[i - 1]; i++) len++;
    best = Math.max(best, len);
  }
  return nums.length ? best : 0;
}

test('674 matches the LeetCode examples', () => {
  assert.equal(problem.builder([1, 3, 5, 4, 7]).answer, 3);
  assert.equal(problem.builder([2, 2, 2, 2, 2]).answer, 1);
  assert.equal(problem.builder([1, 3, 5, 7]).answer, 4);
  assert.equal(problem.builder([7]).answer, 1);
  assert.equal(problem.builder([]).answer, 0);
});

test('674 trace follows the left/right sliding-window snippet', () => {
  const { steps, answer } = problem.builder([1, 3, 5, 4, 7]);
  assert.equal(answer, 3);
  assert.equal(steps.at(-1).final, true);
  // displayed code has 14 lines; every step points at exactly one valid line
  for (const s of steps) {
    assert.equal(s.codeLines.length, 1);
    assert.ok(s.codeLines[0] >= 1 && s.codeLines[0] <= 14, `bad code line ${s.codeLines}`);
    assert.deepEqual(s.arr, [1, 3, 5, 4, 7]);
    assert.ok(s.continuous674View);
  }
  assert.deepEqual(steps.at(-1).continuous674View.left, 3);
  assert.equal(steps.at(-1).continuous674View.right, 4);
  // final step marks the best window [0..2] in green
  assert.deepEqual(steps.at(-1).mark, [0, 1, 2]);
  const grow = steps.find((s) => s.continuous674View.action === 'extend');
  assert.ok(grow.highlight.length >= 2);
  assert.equal(grow.codeLines[0], 10);
  const reset = steps.find((s) => s.continuous674View.action === 'reset');
  assert.equal(reset.codeLines[0], 11);
});

test('674 records the comparison, active run, and best range at every meaningful step', () => {
  const { steps } = problem.builder([1, 3, 5, 4, 7]);
  const compare = steps.find(step => step.continuous674View.action === 'compare' && step.continuous674View.index === 3);
  assert.equal(compare.continuous674View.increasing, false);
  assert.equal(compare.continuous674View.previousValue, 5);
  assert.equal(compare.continuous674View.value, 4);
  assert.deepEqual([compare.continuous674View.runStart, compare.continuous674View.runEnd], [0, 2]);

  const reset = steps.find(step => step.continuous674View.action === 'reset');
  assert.deepEqual([reset.continuous674View.runStart, reset.continuous674View.runEnd], [3, 3]);
  assert.equal(reset.continuous674View.cur, 1);
  assert.deepEqual([reset.continuous674View.left, reset.continuous674View.right], [3, 3]);

  const record = steps.find(step => step.continuous674View.action === 'best' && step.continuous674View.index === 2);
  assert.equal(record.continuous674View.improved, true);
  assert.deepEqual([record.continuous674View.bestStart, record.continuous674View.bestEnd], [0, 2]);
  for (const step of steps) {
    const view = step.continuous674View;
    assert.ok(view);
    if (['best', 'done', 'reset'].includes(view.action)) assert.ok(view.best >= view.cur);
    if (view.bestStart !== null) assert.equal(view.bestEnd - view.bestStart + 1, view.best);
  }
});

test('674 renderer explains breaks and shows the final best run in Vietnamese and English', () => {
  const run = problem.builder([1, 3, 5, 4, 7]);
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    escapeHtml: value => String(value),
    steps: run.steps,
    stepIndex: run.steps.findIndex(step => step.continuous674View.action === 'reset'),
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../public/renderer-continuous-increasing-674.js'), 'utf8'),
    context,
  );
  context.renderContinuousIncreasing674(run.steps[context.stepIndex]);
  assert.match(host.innerHTML, /<b>5<\/b><span class="ci674-operator">≥<\/span><b>4<\/b>/);
  assert.match(host.innerHTML, /↘/);
  assert.match(host.innerHTML, /restart/);
  assert.match(host.innerHTML, /class="ci674-edge edge-break"/);
  assert.match(host.innerHTML, /class="left-pointer">L/);
  assert.match(host.innerHTML, /class="right-pointer">R/);
  assert.match(host.innerHTML, /class="ci674-runs"/);
  assert.doesNotMatch(host.innerHTML, /previous run ends because/);

  context.stepIndex = run.steps.findIndex(step => step.continuous674View.action === 'seed');
  context.renderContinuousIncreasing674(run.steps[context.stepIndex]);
  assert.match(host.innerHTML, /ci674-no-compare/);
  assert.doesNotMatch(host.innerHTML, /null [≥<]/);

  context.lang = 'vi';
  context.stepIndex = run.steps.length - 1;
  context.renderContinuousIncreasing674(run.steps.at(-1));
  assert.match(host.innerHTML, /Đoạn tăng liên tục dài nhất/);
  assert.match(host.innerHTML, /ci674-result/);
  assert.match(host.innerHTML, /<b>1<\/b><i>›<\/i><b>3<\/b><i>›<\/i><b>5<\/b>/);
  assert.match(host.innerHTML, /3/);

  const empty = problem.builder([]);
  context.lang = 'en';
  context.steps = empty.steps;
  context.stepIndex = 0;
  context.renderContinuousIncreasing674(empty.steps[0]);
  assert.match(host.innerHTML, /∅ empty array/);
  assert.doesNotMatch(host.innerHTML, /null…null/);
});

test('674 renderer bounds long-array detail and its assets are wired for lazy loading', () => {
  const run = problem.builder(Array.from({ length: 300 }, (_, i) => i));
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: value => String(value), steps: run.steps, stepIndex: run.steps.length - 1 };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../public/renderer-continuous-increasing-674.js'), 'utf8'),
    context,
  );
  context.renderContinuousIncreasing674(run.steps.at(-1));
  assert.match(host.innerHTML, /ci674-gap/);
  assert.ok((host.innerHTML.match(/class="ci674-cell/g) || []).length <= 20);

  const html = readFrontendIndex();
  assert.match(html, /continuous-increasing-674\.css[^\n]*data-problem-ids="674"/);
  assert.match(html, /renderer-continuous-increasing-674\.js[^\n]*data-problem-ids="674"/);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-continuous-increasing-674.js'));
  assert.ok(STYLESHEET_ASSETS.includes('continuous-increasing-674.css'));
  assert.match(readFrontendJavaScript(), /renderContinuousIncreasing674/);
  assert.match(readFrontendStyles(), /\.ci674-viz/);
});

test('674 agrees with brute force on randomized arrays', () => {
  let seed = 674;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let t = 0; t < 80; t++) {
    const n = Math.floor(rnd() * 12);
    const nums = Array.from({ length: n }, () => Math.floor(rnd() * 7) - 2);
    assert.equal(problem.builder(nums).answer, brute(nums), `mismatch on ${nums}`);
  }
});
