'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[308];
function renderer() {
  const host = { innerHTML: '', dataset: {} }, ctx = { $: () => host, lang: 'vi' };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-matrix-regions-308.js'), 'utf8'), ctx);
  return { ctx, host };
}
const directSum = (matrix, [r1, c1, r2, c2]) => matrix.slice(r1, r2 + 1).reduce((total, row) => total + row.slice(c1, c2 + 1).reduce((sum, x) => sum + x, 0), 0);
const run = (matrix, operations) => problem.builder(matrix, { operations });
const sample = () => run(problem.defaultInput, problem.extraParams[0].default);

test('308 four pictures have coefficient one inside the query and zero everywhere else', () => {
  const { ctx } = renderer(), matrix = [[-2, 3, 1, 0], [5, -8, 2, 1], [4, 6, -3, 7]];
  for (let r1 = 0; r1 < 3; r1++) for (let r2 = r1; r2 < 3; r2++) for (let c1 = 0; c1 < 4; c1++) for (let c2 = c1; c2 < 4; c2++) {
    const rect = [r1, c1, r2, c2], picture = ctx.matrix308Corners(matrix, rect);
    assert.equal(picture.sum, directSum(matrix, rect));
    matrix.forEach((row, r) => row.forEach((_, c) => {
      const coefficient = picture.rectangles.reduce((sum, p, i) => sum + (p && r <= p[2] && c <= p[3] ? [1, -1, -1, 1][i] : 0), 0);
      assert.equal(coefficient, r >= r1 && r <= r2 && c >= c1 && c <= c2 ? 1 : 0);
    }));
  }
});

test('308 clickable BIT blocks represent their exact lowbit rectangles, including non-prefix blocks', () => {
  const { ctx } = renderer(), v = sample().steps.at(-1).segmentTreeView;
  for (let i = 1; i <= 5; i++) for (let j = 1; j <= 5; j++) {
    const rect = Array.from(ctx.matrix308Coverage(i, j));
    assert.equal(directSum(v.matrix, rect), v.bit[i][j]);
    assert.equal((rect[2] - rect[0] + 1) * (rect[3] - rect[1] + 1), (i & -i) * (j & -j));
  }
  assert.deepEqual(Array.from(ctx.matrix308Coverage(3, 5)), [2, 4, 2, 4]);
  assert.match(ctx.matrix308Mini(5, 5, [2, 4, 2, 4], 'block-outline'), /x="88"[^>]*width="20"/);
});

test('308 every frame retains exact matrix and BIT values in both languages without mutating debugger snapshots', () => {
  const { ctx, host } = renderer();
  for (const result of [sample(), run([[2, -3], [-1, 4]], 'sumRegion 0 0 1 1 | update 0 1 3 | sumRegion 0 0 1 1'), run([[4]], 'update 0 0 -2 | sumRegion 0 0 0 0')]) {
    const before = JSON.stringify(result);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of result.steps) {
        ctx.renderMatrixRegions308Pictures(step);
        const v = step.segmentTreeView;
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        const matrix = [...host.innerHTML.matchAll(/data-m308-cell="(\d+),(\d+)" data-value="([^"]+)"/g)];
        assert.equal(matrix.length, v.matrix.length * v.matrix[0].length);
        matrix.forEach(([, r, c, value]) => assert.equal(Number(value), v.matrix[r][c]));
        const bit = [...host.innerHTML.matchAll(/data-m308-bit="(\d+),(\d+)" data-value="([^"]+)"/g)];
        assert.equal(bit.length, matrix.length);
        bit.forEach(([, i, j, value]) => assert.equal(Number(value), v.bit[i][j]));
      }
    }
    assert.equal(JSON.stringify(result), before);
  }
});

test('308 interactive final rectangles use the updated matrix and handle empty prefix strips', () => {
  const { ctx, host } = renderer(), result = sample(), last = result.steps.at(-1), v = last.segmentTreeView;
  ctx.renderMatrixRegions308Pictures(last);
  for (const rect of [[0, 0, 4, 4], [0, 0, 0, 0], [2, 1, 4, 3], [3, 2, 3, 2], [0, 2, 4, 4]]) {
    host.dataset.m308Explore = JSON.stringify(rect);
    ctx.renderMatrixRegions308Pictures(last);
    assert.match(host.innerHTML, new RegExp(`data-m308-sum="${directSum(v.matrix, rect)}"`));
  }
  assert.deepEqual(result.answer, [8, null, 10]);
  assert.equal(v.matrix[3][2], 2);
});

test('308 shows pending BIT additions instead of claiming an intermediate block is already synchronized', () => {
  const { ctx, host } = renderer(), result = sample();
  const step = result.steps.find(s => s.segmentTreeView.phase === 'update' && s.codeLines[0] === 12);
  ctx.renderMatrixRegions308Pictures(step);
  host.dataset.m308SelectedBlock = '[4,4]';
  ctx.renderMatrixRegions308Pictures(step);
  assert.match(host.innerHTML, /class="m308-pending"/);
  const completed = result.steps.find(s => s.segmentTreeView.phase === 'update' && s.codeLines[0] === 17);
  ctx.renderMatrixRegions308Pictures(completed);
  assert.match(host.innerHTML, /class="m308-check"/);
});
