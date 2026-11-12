const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[3105];
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
} = require('./helpers/frontend-source');

function brute(nums) {
  let best = 0;
  for (let start = 0; start < nums.length; start += 1) {
    let up = true;
    let down = true;
    for (let end = start; end < nums.length; end += 1) {
      if (end > start) {
        up &&= nums[end] > nums[end - 1];
        down &&= nums[end] < nums[end - 1];
      }
      if (up || down) best = Math.max(best, end - start + 1);
      else break;
    }
  }
  return best;
}

test('3105 matches increasing, decreasing, equal, mixed, singleton, and empty arrays', () => {
  assert.equal(problem.builder([1, 4, 3, 3, 2]).answer, 2);
  assert.equal(problem.builder([3, 3, 3, 3]).answer, 1);
  assert.equal(problem.builder([3, 2, 1]).answer, 3);
  assert.equal(problem.builder([1, 2, 3, 4]).answer, 4);
  assert.equal(problem.builder([7]).answer, 1);
  assert.equal(problem.builder([]).answer, 0);
});

test('3105 trace labels rising, falling, and equal comparisons and resets the right runs', () => {
  const { steps } = problem.builder([1, 4, 3, 3, 2]);
  const views = steps.map(step => step.monotonic3105View);
  const rising = views.find(view => view.action === 'compare' && view.relation === 'up');
  const falling = views.find(view => view.action === 'compare' && view.relation === 'down');
  const equal = views.find(view => view.action === 'compare' && view.relation === 'equal');
  assert.deepEqual([rising.previousValue, rising.value], [1, 4]);
  assert.deepEqual([falling.previousValue, falling.value], [4, 3]);
  assert.deepEqual([equal.previousValue, equal.value], [3, 3]);

  const reset = views.find(view => view.action === 'update' && view.relation === 'equal');
  assert.equal(reset.increasing, 1);
  assert.equal(reset.decreasing, 1);
  assert.deepEqual(reset.increasingRange, [3, 3]);
  assert.deepEqual(reset.decreasingRange, [3, 3]);

  const answer = views.at(-1);
  assert.equal(answer.best, 2);
  assert.equal(answer.bestDirection, 'up');
  assert.deepEqual([answer.bestStart, answer.bestEnd], [0, 1]);
  assert.ok(steps.every(step => step.codeLines.length === 1 && step.codeLines[0] >= 1 && step.codeLines[0] <= 16));
});

test('3105 renderer explains comparisons and displays its final range in Vietnamese and English', () => {
  const run = problem.builder([1, 4, 3, 3, 2]);
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    escapeHtml: value => String(value),
    steps: run.steps,
    stepIndex: run.steps.findIndex(step => step.monotonic3105View.action === 'compare' && step.monotonic3105View.relation === 'equal'),
    ORDERED_RENDERER_REGISTRY: [],
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../public/renderer-monotonic-subarray-3105.js'), 'utf8'),
    context,
  );
  assert.equal(context.ORDERED_RENDERER_REGISTRY.length, 1);
  assert.ok(context.ORDERED_RENDERER_REGISTRY[0].predicate({ monotonic3105View: {} }));
  context.renderMonotonicSubarray3105(run.steps[context.stepIndex]);
  assert.match(host.innerHTML, /3 = 3/);
  assert.match(host.innerHTML, /neither strict increase nor decrease continues/);
  assert.match(host.innerHTML, /current increasing run/);
  assert.match(host.innerHTML, /current decreasing run/);

  context.lang = 'vi';
  context.stepIndex = run.steps.length - 1;
  context.renderMonotonicSubarray3105(run.steps.at(-1));
  assert.match(host.innerHTML, /Đoạn tăng hoặc giảm nghiêm ngặt dài nhất/);
  assert.match(host.innerHTML, /ĐOẠN ĐƠN ĐIỆU DÀI NHẤT/);
  assert.match(host.innerHTML, /chỉ số 0–1/);
  assert.match(host.innerHTML, /tăng dần/);
  assert.match(host.innerHTML, /Quét xong · xem kết quả bên dưới/);
  assert.doesNotMatch(host.innerHTML, /3 = 2/);

  const empty = problem.builder([]);
  context.lang = 'en';
  context.steps = empty.steps;
  context.stepIndex = 0;
  context.renderMonotonicSubarray3105(empty.steps[0]);
  assert.match(host.innerHTML, /Empty array/);
  assert.match(host.innerHTML, /Scan complete/);
});

test('3105 renderer bounds long arrays and registers its lazy-loaded assets', () => {
  const run = problem.builder(Array.from({ length: 300 }, (_, index) => index % 20));
  const host = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => host,
    escapeHtml: value => String(value),
    steps: run.steps,
    stepIndex: run.steps.length - 1,
    ORDERED_RENDERER_REGISTRY: [],
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../public/renderer-monotonic-subarray-3105.js'), 'utf8'),
    context,
  );
  context.renderMonotonicSubarray3105(run.steps.at(-1));
  assert.match(host.innerHTML, /hidden/);
  assert.ok((host.innerHTML.match(/class="mono3105-cell/g) || []).length <= 28);

  const html = readFrontendIndex();
  assert.match(html, /monotonic-subarray-3105\.css[^\n]*data-problem-ids="3105"/);
  assert.match(html, /renderer-monotonic-subarray-3105\.js[^\n]*data-problem-ids="3105"/);
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-monotonic-subarray-3105.js'));
  assert.ok(STYLESHEET_ASSETS.includes('monotonic-subarray-3105.css'));
  assert.match(readFrontendJavaScript(), /renderMonotonicSubarray3105/);
  assert.match(readFrontendStyles(), /\.mono3105-viz/);
});

test('3105 result agrees with brute force over small arrays', () => {
  let seed = 3105;
  const random = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let trial = 0; trial < 100; trial += 1) {
    const length = Math.floor(random() * 12);
    const nums = Array.from({ length }, () => Math.floor(random() * 7) - 3);
    assert.equal(problem.builder(nums).answer, brute(nums), `mismatch on ${nums}`);
  }
});
