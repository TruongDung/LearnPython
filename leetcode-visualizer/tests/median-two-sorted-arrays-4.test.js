const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[4];
const cases = [
  [[1, 3], [2], 2],
  [[1, 2], [3, 4], 2.5],
  [[], [1], 1],
  [[2, 3], [], 2.5],
  [[0, 0], [0, 0], 0],
  [[-5, -2], [-3, -1], -2.5],
  [[6, 7], [1, 2, 3, 4, 5], 4],
  [[1, 2], [3, 4, 5, 6, 7], 4],
];
const run = (a, b) => problem.builder(a, { nums2: b.join(',') });

test('4 keeps median answers and balanced cuts correct, including empty arrays', () => {
  for (const [a, b, expected] of cases) {
    const result = run(a, b);
    assert.equal(result.answer, expected);
    assert.deepEqual(result.steps[0].partitionView.rowA, a);
    assert.deepEqual(result.steps[0].partitionView.rowB, b);
    for (const step of result.steps) {
      const v = step.partitionView;
      if (v.cutB === null) continue;
      assert.ok(v.cutA >= 0 && v.cutA <= v.rowA.length);
      assert.ok(v.cutB >= 0 && v.cutB <= v.rowB.length);
      assert.equal(v.cutA + v.cutB, Math.ceil((a.length + b.length) / 2));
    }
    const final = result.steps.at(-1);
    assert.equal(final.final, true);
    assert.equal(final.partitionView.answer, expected);
    assert.equal(final.partitionView.phase, 'median');
  }
});

test('4 reveals each cut when its code executes and preserves the updated search range', () => {
  const result = run([1, 3], [2]);
  for (const step of result.steps) {
    const line = step.codeLines[0];
    if (line < 8) assert.equal(step.partitionView.cutA, null);
    if (line < 9) assert.equal(step.partitionView.cutB, null);
    if (line === 8) assert.ok(Number.isInteger(step.partitionView.cutA));
  }
  const swapped = result.steps.find(s => s.codeLines[0] === 5).partitionView;
  assert.deepEqual(swapped.rowA, [2]);
  assert.equal(swapped.labelA, 'nums2');
  assert.equal(swapped.swapped, true);
  for (const [a, b, line, field, offset] of [
    [[6, 7], [1, 2, 3, 4, 5], 11, 'right', -1],
    [[1, 2], [3, 4, 5, 6, 7], 13, 'left', 1],
  ]) {
    const move = run(a, b).steps.find(s => s.codeLines[0] === line).partitionView;
    assert.equal(move[field], move.cutA + offset);
  }
});

const source = fs.readFileSync(path.join(__dirname, '../public/renderers-03.js'), 'utf8');
const renderer = source.slice(source.indexOf('function renderPartitionView(step)'), source.indexOf('// ---- Two-pointer merge visualization'));
function render(step, lang) {
  const target = { innerHTML: '' };
  const context = { lang, $: () => target, escapeHtml: s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;') };
  vm.createContext(context);
  vm.runInContext(renderer, context);
  // The browser receives JSON, so sentinels must be calculated from cuts.
  context.renderPartitionView(JSON.parse(JSON.stringify(step)));
  return target.innerHTML;
}

test('4 renders all trace states in Vietnamese and English without missing values', () => {
  for (const lang of ['vi', 'en']) {
    for (const [a, b, answer] of cases) {
      const steps = run(a, b).steps;
      for (const step of steps) assert.doesNotMatch(render(step, lang), /undefined|NaN/);
      assert.match(render(steps.at(-1), lang), new RegExp(`Median = .*${answer}`));
    }
  }
});

test('4 shows no imaginary partition before cuts, then distinguishes pending and failed checks', () => {
  const result = run([6, 7], [1, 2, 3, 4, 5]);
  assert.doesNotMatch(render(result.steps[0], 'vi'), /partition-cut|left-half|giá trị quy ước/);
  const firstCheck = result.steps.find(s => s.codeLines[0] === 10);
  const html = render(firstCheck, 'vi');
  assert.match(html, /partition-check active fail/);
  assert.match(html, /Chưa kiểm tra/);
  assert.match(html, /← Giảm i/);
  const increase = run([1, 2], [3, 4, 5, 6, 7]).steps.find(s => s.codeLines[0] === 12);
  assert.match(render(increase, 'vi'), /Tăng i →/);
});

test('4 marks actual middle values and labels edge sentinels without adding fake array cells', () => {
  const odd = render(run([1, 3], [2]).steps.at(-1), 'vi');
  assert.equal((odd.match(/partition-median-tag/g) || []).length, 1);
  assert.match(odd, /Rỗng.*\+∞/s);
  assert.equal((odd.match(/class="partition-cell[ "]/g) || []).length, 3);
  const even = render(run([1, 2], [3, 4]).steps.at(-1), 'en');
  assert.equal((even.match(/partition-median-tag/g) || []).length, 2);
  assert.match(even, /Median = \(2 \+ 3\) \/ 2 = 2.5/);
  const duplicates = render(run([0, 0], [0, 0]).steps.at(-1), 'vi');
  assert.equal((duplicates.match(/partition-median-tag/g) || []).length, 2);
});
