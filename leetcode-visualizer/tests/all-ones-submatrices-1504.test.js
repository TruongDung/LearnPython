'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm');
const p = require('../problems').SUPPORTED[1504];
const cases = [
  [[1,0,1],[1,1,0],[1,1,0]], [[0,1,1,0],[0,1,1,1],[1,1,1,0]],
  [[1,1],[1,1]], [[0,0],[0,0]], [[1]], [[0]],
  [[1,0,1,1,1,0]], [[1],[1],[0],[1]], Array.from({ length: 6 }, () => Array(6).fill(1)),
];
function oracle(mat, end = null) {
  const output = [];
  for (let top = 0; top < mat.length; top++) for (let left = 0; left < mat[0].length; left++) {
    for (let bottom = top; bottom < mat.length; bottom++) for (let right = left; right < mat[0].length; right++) {
      if (end && (bottom !== end[0] || right !== end[1])) continue;
      if (mat.slice(top, bottom + 1).every(row => row.slice(left, right + 1).every(value => value === 1))) output.push({ top, left, bottom, right });
    }
  }
  return output;
}
const v = step => step.allOnes1504View;

test('1504 every displayed rectangle has the current bottom-right corner and matches an independent four-border scan', () => {
  for (const mat of cases) {
    const run = p.builder(mat);
    assert.equal(run.answer, oracle(mat).length);
    for (const step of run.steps) {
      const view = v(step);
      if (!view.ready) { assert.deepEqual(view.rectangles, []); continue; }
      const expected = oracle(mat, view.focus).map(rect => JSON.stringify(rect)).sort();
      const actual = view.rectangles.map(({ top, left, bottom, right }) => JSON.stringify({ top, left, bottom, right })).sort();
      assert.deepEqual(actual, expected);
      assert.equal(view.rowSum, expected.length);
      assert.equal(new Set(view.rectangles.map(rect => rect.key)).size, expected.length);
      for (const rect of view.rectangles) {
        assert.equal(rect.height, rect.bottom - rect.top + 1);
        assert.equal(rect.width, rect.right - rect.left + 1);
      }
    }
  }
  assert.equal(p.builder(cases[0]).answer, 13);
  assert.equal(p.builder(cases[1]).answer, 24);
  assert.equal(p.builder(cases[8]).answer, 441);
});

test('1504 records a contribution only after answer += row_sum and partitions every rectangle by its corner', () => {
  for (const mat of cases) {
    const run = p.builder(mat);
    let expectedTotal = 0, corners = 0;
    for (const step of run.steps) {
      const view = v(step);
      if (view.line === 20) {
        expectedTotal += oracle(mat, view.focus).length; corners++;
        assert.equal(view.counted, true);
      }
      assert.equal(view.answer ?? 0, expectedTotal);
      assert.equal(view.contributions.flat().filter(value => value !== null).length, corners);
      assert.equal(view.contributions.flat().reduce((sum, value) => sum + (value ?? 0), 0), expectedTotal);
    }
    assert.equal(corners, mat.length * mat[0].length);
    assert.equal(expectedTotal, run.answer);
  }
});

test('1504 height, pop, subtraction, width merge, push and addition pictures keep the exact Python post-state', () => {
  let equalPop = false, zeroPop = false, positivePop = false;
  for (const mat of cases) {
    const run = p.builder(mat);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter(step => step.final).length, 1);
    for (const [index, step] of run.steps.entries()) {
      const view = v(step), native = step.stackJumpGridView;
      assert.deepEqual(step.codeLines, [view.line]);
      assert.equal(view.source, p.code[view.line - 1].trim());
      assert.deepEqual(view.locals, native.locals);
      assert.equal(native.trace.truncated, false);
      if (view.transition && !view.transition.reset) assert.equal(view.transition.after, view.transition.before + view.transition.amount);
      if (view.transition?.reset) assert.equal(view.transition.after, 0);
      if (view.line === 15) {
        const previous = v(run.steps[index - 1]);
        equalPop ||= previous.comparison.left === previous.comparison.right;
        zeroPop ||= view.popped.height === 0;
        positivePop ||= view.popped.height > 0;
        assert.equal(view.rowSum, previous.rowSum, 'pop does not subtract until line 16');
        assert.equal(view.groups.length, previous.groups.length - 1);
      }
      if (view.line === 19) {
        assert.equal(view.rowSum, view.groups.reduce((sum, group) => sum + group.contribution, 0));
        for (const group of view.groups) for (let left = group.from; left <= group.to; left++) {
          assert.equal(view.minima.find(item => item.left === left).height, group.height);
        }
      }
      if (view.line === 12) {
        const [r,c] = view.focus;
        let height = 0; for (let row = r; row >= 0 && mat[row][c]; row--) height++;
        assert.equal(view.heights[c], height);
      }
    }
  }
  assert.ok(equalPop && zeroPop && positivePop);
});

test('1504 pictures render all lines in VI/EN and preserve matrix, rectangle and contribution snapshots', () => {
  const host = { innerHTML: '', querySelectorAll: () => [] };
  const ctx = { lang: 'vi', $: () => host, steps: [], stepIndex: 0, escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;') };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(require.resolve('../public/renderer-all-ones-submatrices-1504.js'), 'utf8'), ctx);
  for (const mat of cases) {
    ctx.steps = p.builder(mat).steps;
    const saved = JSON.stringify(ctx.steps);
    for (const lang of ['vi','en']) {
      ctx.lang = lang;
      ctx.steps.forEach((step, index) => {
        ctx.stepIndex = index; ctx.renderAllOnes1504View(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.match(host.innerHTML, new RegExp(`data-source-line="${v(step).line}"`));
        assert.equal((host.innerHTML.match(/data-s1504-cell=/g) || []).length, mat.length * mat[0].length);
        assert.equal((host.innerHTML.match(/data-s1504-rectangle=/g) || []).length, v(step).rectangles.length);
        assert.equal((host.innerHTML.match(/data-height-column=/g) || []).length, mat[0].length);
      });
    }
    assert.equal(JSON.stringify(ctx.steps), saved);
  }
});

test('1504 keeps bounded complete traces, rejects malformed binary matrices and supplies a matrix to live Python', () => {
  for (const input of ['', [], [[2]], [[true]], [[1],[1,0]], [Array(2)], '1,0;', Array.from({ length: 7 }, () => [1])]) assert.throws(() => p.builder(input));
  for (const mat of cases) {
    assert.deepEqual(p.liveArgs(JSON.stringify(mat)), [mat]);
    const before = JSON.stringify(mat); p.builder(mat); assert.equal(JSON.stringify(mat), before);
  }
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ''), /renderer-all-ones-submatrices-1504|all-ones-submatrices-1504\.css/);
  assert.match(html, /trie-picture-ui\.js[^>]+data-problem-ids="[^"]*1504/);
});
