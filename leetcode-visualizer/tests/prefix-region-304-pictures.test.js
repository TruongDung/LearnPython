'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const problem = require('../problems').SUPPORTED[304];
const sum = (matrix, a, b, c, d) => matrix.slice(a, c + 1).reduce((total, row) => total + row.slice(b, d + 1).reduce((x, n) => x + n, 0), 0);
const matrices = [[[3, 0, 1], [5, -6, 3], [1, 2, 0]], [[-5]], [[1, 2, -3, 4]], [[1], [-2], [3]]];

test('304 four corners match direct rectangle sums and preserve the zero border', () => {
  for (const matrix of matrices) for (let a = 0; a < matrix.length; a++) for (let b = 0; b < matrix[0].length; b++) for (let c = a; c < matrix.length; c++) for (let d = b; d < matrix[0].length; d++) {
    const run = problem.builder(JSON.stringify(matrix), { row1: a, col1: b, row2: c, col2: d });
    assert.equal(run.answer, sum(matrix, a, b, c, d));
    const prefix = run.steps.at(-1).prefix2DView.prefix;
    prefix.forEach(row => assert.equal(row[0], 0)); prefix[0].forEach(n => assert.equal(n, 0));
    for (let r = 1; r <= matrix.length; r++) for (let col = 1; col <= matrix[0].length; col++) assert.equal(prefix[r][col], sum(matrix, 0, 0, r - 1, col - 1));
    run.steps.forEach(step => { assert.equal(step.prefix2DView.problemId, 304); assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length)); });
  }
});

test('304 pictures keep every matrix cell, reveal only built prefix cells and preserve snapshots', () => {
  const host = { innerHTML: '', dataset: {} }, ctx = { lang: 'vi', $: () => host };
  vm.createContext(ctx);
  for (const file of ['renderer-window-pictures.js', 'renderer-prefix-region-304.js']) vm.runInContext(fs.readFileSync(require.resolve('../public/' + file), 'utf8'), ctx);
  for (const matrix of matrices) {
    const run = problem.builder(JSON.stringify(matrix), { row1: 0, col1: 0, row2: matrix.length - 1, col2: matrix[0].length - 1 }), before = JSON.stringify(run);
    for (const language of ['vi', 'en']) {
      ctx.lang = language;
      for (const step of run.steps) {
        ctx.renderPrefixRegion304Pictures(step);
        assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity|object Object/);
        assert.equal((host.innerHTML.match(/data-pr304-matrix=/g) || []).length, matrix.length * matrix[0].length);
        assert.equal((host.innerHTML.match(/data-pr304-prefix=/g) || []).length, (matrix.length + 1) * (matrix[0].length + 1));
        const known = [...host.innerHTML.matchAll(/data-pr304-prefix="(\d+),(\d+)" data-value="([^"]*)"/g)];
        known.forEach(([, r, c, value]) => assert.equal(value !== '', r === '0' || c === '0' || step.prefix2DView.ready.includes(`${r},${c}`)));
        if (step.final) { assert.equal((host.innerHTML.match(/data-pr304-term=/g) || []).length, 4); assert.match(host.innerHTML, new RegExp(`data-pr304-answer="${run.answer}"`)); }
      }
    }
    assert.equal(JSON.stringify(run), before);
  }
});

test('304 displayed Python agrees with the four-corner pictures', () => {
  const input = matrices.map(matrix => ({ matrix, query: [0, 0, matrix.length - 1, matrix[0].length - 1] }));
  const script = `import json,sys\np=json.load(sys.stdin)\nscope={}\nexec(p['code'],scope)\nprint(json.dumps([scope['NumMatrix'](v['matrix']).sumRegion(*v['query']) for v in p['cases']]))`;
  const result = spawnSync(process.env.PYTHON || 'python3', ['-c', script], { encoding: 'utf8', input: JSON.stringify({ code: problem.code.join('\n'), cases: input }) });
  assert.equal(result.status, 0, result.stderr); assert.deepEqual(JSON.parse(result.stdout), input.map(({ matrix, query }) => sum(matrix, ...query)));
});
