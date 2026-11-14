'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[239];
const run = (nums, k) => problem.builder(nums, { k });
const cases = [
  [[1, 3, -1, -3, 5, 3, 6, 7], 3], [[9, 7, 5, 3, 1], 3],
  [[4, 4, 4, 2, 4], 3], [[-5, -1, -3, -2, -7], 2],
  [[3, 1, 3, 2], 1], [[-8], 1], [[3, 3, 1, 3], 4],
  [Array.from({ length: 40 }, (_, i) => 40 - i), 20],
  [[Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, 0], 2],
];
const oracle = (nums, k) => Array.from({ length: nums.length - k + 1 }, (_, i) => Math.max(...nums.slice(i, i + k)));
function renderer() {
  const host = { innerHTML: '', dataset: {}, clientWidth: 560 }, ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-sliding-maximum-239.js'), 'utf8'), ctx);
  return { host, ctx };
}

test('239 answers and witness indices match independent maxima, including equal, negative and length-one windows', () => {
  let seed = 239;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const samples = [...cases];
  for (let i = 0; i < 90; i++) { const n = 1 + rand(12); samples.push([Array.from({ length: n }, () => rand(13) - 6), 1 + rand(n)]); }
  for (const [nums, k] of samples) {
    const result = run(nums, k); assert.deepEqual(result.answer, oracle(nums, k));
    const witnesses = result.steps.at(-1).slidingMaximum239View.answerWitness;
    witnesses.forEach(w => { assert.equal(w.value, nums[w.witnessIndex]); assert.equal(w.value, Math.max(...nums.slice(w.windowLeft, w.windowRight + 1))); assert.equal(w.witnessIndex, nums.indexOf(w.value, w.windowLeft)); });
  }
});

test('239 final selectable deque reconstructions match actual append frames and retain equal-valued candidates', () => {
  const { ctx } = renderer();
  for (const [nums, k] of cases) {
    const result = run(nums, k), final = ctx.sm239Normalize(result.steps.at(-1));
    for (const w of final.answerWitness) {
      const actual = result.steps.find(step => step.slidingMaximum239View.event === 'append-maximum' && step.slidingMaximum239View.currentWitness.answerIndex === w.answerIndex).slidingMaximum239View;
      const scene = ctx.sm239PictureScene(final, w.answerIndex);
      assert.deepEqual(JSON.parse(JSON.stringify(scene.deque.after)), actual.deque.after);
      assert.equal(scene.window.left, w.windowLeft); assert.equal(scene.window.right, w.windowRight);
      assert.equal(scene.deque.after[0].index, w.witnessIndex);
      const fromTrace = ctx.sm239PictureScene(final, w.answerIndex, result.steps);
      assert.deepEqual(JSON.parse(JSON.stringify(fromTrace.deque.after)), actual.deque.after);
    }
  }
  assert.deepEqual(Array.from(ctx.sm239WindowDeque([4, 4, 4], 0, 2), x => x.index), [0, 1, 2]);
});

test('239 every picture keeps exact array/deque state and never labels an unprocessed or expired front as the max', () => {
  const { ctx, host } = renderer();
  for (const [nums, k] of cases) {
    const result = run(nums, k), before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        ctx.renderSlidingMaximum239View(step);
        const normalized = ctx.sm239Normalize(step), scene = ctx.sm239PictureScene(normalized, Number(host.dataset.p239SelectedOutput || 0));
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.equal((host.innerHTML.match(/data-array-index="/g) || []).length, nums.length);
        const row = host.innerHTML.match(/data-p239-deque="after">([\s\S]*?)<\/div>/)[1];
        const entries = [...row.matchAll(/data-dq-index="(\d+)" data-dq-value="([^"]+)"/g)].map(([, index, value]) => [Number(index), Number(value)]);
        assert.deepEqual(entries, Array.from(scene.deque.after, entry => [entry.index, entry.value]));
        const numbers = [...host.innerHTML.matchAll(/data-array-index="(\d+)" data-value="([^"]+)" data-in-window="(true|false)" data-in-deque="(true|false)" data-maximum="(true|false)"/g)];
        for (const [, index, value, inside, , maximum] of numbers) {
          assert.equal(Number(value), nums[Number(index)]);
          assert.equal(inside === 'true', scene.window.left !== null && Number(index) >= scene.window.left && Number(index) <= scene.window.right);
          if (maximum === 'true') { assert.equal(inside, 'true'); assert.equal(Number(value), Math.max(...nums.slice(scene.window.left, scene.window.right + 1))); }
        }
      }
    }
    assert.equal(JSON.stringify(result), before);
    assert.ok(Object.isFrozen(result.steps[0].slidingMaximum239View));
  }
});

test('239 explains equality, back removal and expiry with compact pictures and preserves replay', () => {
  const { ctx, host } = renderer();
  const equal = run([4, 4, 2], 2).steps.find(s => s.slidingMaximum239View.event === 'check-dominated-back' && s.slidingMaximum239View.check.candidate?.value === s.slidingMaximum239View.num);
  ctx.renderSlidingMaximum239View(equal); assert.match(host.innerHTML, /Bằng nhau → giữ cả hai/);
  for (const [nums, k] of cases.slice(0, 2)) {
    const result = run(nums, k);
    const pop = result.steps.find(s => s.slidingMaximum239View.action.kind === 'pop');
    ctx.renderSlidingMaximum239View(pop); assert.match(host.innerHTML, /data-p239-deque="before"/); assert.match(host.innerHTML, /p239-token removed/);
    ctx.renderSlidingMaximum239View(result.steps[0]); const first = host.innerHTML;
    ctx.renderSlidingMaximum239View(result.steps.at(-1)); ctx.renderSlidingMaximum239View(result.steps[0]); assert.equal(host.innerHTML, first);
  }
});

test('239 displayed Python matches the visualizer on the picture examples', () => {
  const script = 'import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p["code"],scope)\nprint(json.dumps([scope["Solution"]().maxSlidingWindow(a,k) for a,k in p["cases"]]))';
  const out = spawnSync(process.env.PYTHON || 'python3', ['-c', script], { encoding: 'utf8', input: JSON.stringify({ code: problem.code.join('\n'), cases }) });
  assert.equal(out.status, 0, out.stderr); assert.deepEqual(JSON.parse(out.stdout), cases.map(([nums, k]) => oracle(nums, k)));
});

test('239 preserves input validation and safely handles incomplete renderer frames', () => {
  for (const [nums, k] of [[[], 1], [[1], 0], [[1], 2], [[1.5], 1], [Array(41).fill(0), 3]]) assert.throws(() => run(nums, k));
  const { ctx, host } = renderer();
  for (const frame of [null, {}, { slidingMaximum239View: { nums: ['<img>', NaN], n: 2, k: 1 } }]) { ctx.renderSlidingMaximum239View(frame); assert.doesNotMatch(host.innerHTML, /<img>|NaN|Infinity|undefined/); }
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /sliding-maximum-239\.css\?v=sliding-maximum-239-v2/);
  assert.match(html, /renderer-sliding-maximum-239\.js\?v=sliding-maximum-239-v2/);
});
