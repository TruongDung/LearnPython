const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[835];

function encode(image) {
  return image.map(row => row.join(',')).join(';');
}

function brute(img1, img2) {
  const n = img1.length;
  let best = 0;
  for (let dr = 1 - n; dr < n; dr++) {
    for (let dc = 1 - n; dc < n; dc++) {
      let overlap = 0;
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const movedRow = row + dr;
          const movedCol = col + dc;
          if (img1[row][col] === 1 && movedRow >= 0 && movedRow < n && movedCol >= 0 && movedCol < n && img2[movedRow][movedCol] === 1) overlap++;
        }
      }
      best = Math.max(best, overlap);
    }
  }
  return best;
}

const cases = [
  {
    img1: [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    img2: [[0, 0, 0], [0, 1, 1], [0, 0, 1]],
  },
  { img1: [[1]], img2: [[1]] },
  { img1: [[0]], img2: [[0]] },
  { img1: [[1, 0], [0, 0]], img2: [[0, 0], [0, 1]] },
  { img1: [[1, 1], [1, 1]], img2: [[1, 1], [1, 1]] },
  { img1: [[0, 1, 0], [1, 0, 1], [0, 1, 0]], img2: [[1, 0, 1], [0, 1, 0], [1, 0, 1]] },
];

test('835 metadata exposes two binary images and the translation-vector solution', () => {
  assert.equal(problem.id, 835);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.slug, 'image-overlap');
  assert.equal(problem.inputKind, 'string');
  assert.equal(problem.extraParams[0].key, 'img2');
  assert.equal(problem.extraParams[0].type, 'string');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some(tag => tag.key === '2d-array'));
  assert.ok(problem.tags.some(tag => tag.key === 'hash-map'));
  assert.match(problem.code.join('\n'), /shift = \(r2 - r1, c2 - c1\)/);
});

test('835 matches an independent brute-force translation oracle', () => {
  let seed = 835;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let sample = 0; sample < 40; sample++) {
    const n = 1 + random(4);
    const image = () => Array.from({ length: n }, () => Array.from({ length: n }, () => random(2)));
    cases.push({ img1: image(), img2: image() });
  }

  for (const { img1, img2 } of cases) {
    const run = problem.builder(encode(img1), { img2: encode(img2) });
    assert.equal(run.answer, brute(img1, img2));
    assert.deepEqual(run.original, { img1, img2 });
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.at(-1).codeLines[0], 12);
    assert.ok(run.steps.every(step => step.codeLines.length === 1));
    assert.ok(run.steps.every(step => step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length));
    assert.ok(run.steps.every(step => step.overlap835View));
  }
});

test('835 trace counts each coordinate pair once and keeps counter state exact', () => {
  const img1 = [[1, 1, 0], [0, 1, 0], [0, 1, 0]];
  const img2 = [[0, 0, 0], [0, 1, 1], [0, 0, 1]];
  const run = problem.builder(encode(img1), { img2: encode(img2) });
  const k1 = img1.flat().filter(Boolean).length;
  const k2 = img2.flat().filter(Boolean).length;
  const writes = run.steps.filter(step => step.codeLines[0] === 10);
  assert.equal(writes.length, k1 * k2);
  for (const step of writes) {
    const view = step.overlap835View;
    assert.equal(view.countAfter, view.countBefore + 1);
    const entry = view.counts.find(item => item.dr === view.shift[0] && item.dc === view.shift[1]);
    assert.equal(entry.count, view.countAfter);
    assert.equal(view.countedCells.length, view.countAfter);
  }
  const final = run.steps.at(-1).overlap835View;
  assert.equal(final.counts[0].count, run.answer);
  assert.equal(final.overlapCells.length, run.answer);
});

test('835 validates shape, values, matching sizes, and live arguments', () => {
  assert.deepEqual(problem.liveArgs('1,0;0,1', { img2: '0,1;1,0' }), [[[1, 0], [0, 1]], [[0, 1], [1, 0]]]);
  for (const [img1, img2] of [
    ['1,0;0,2', '1,0;0,1'],
    ['1,0;0,1', '1,0,0;0,1,0;0,0,1'],
    ['1,0,1;0,1,0', '1,0,1;0,1,0'],
    ['1,0;0,1', '1,0;0'],
  ]) {
    assert.throws(() => problem.builder(img1, { img2 }));
    assert.throws(() => problem.liveArgs(img1, { img2 }));
  }
});

test('835 Python solution agrees with all deterministic cases', () => {
  const payload = cases.slice(0, 6).map(({ img1, img2 }) => ({ img1, img2, expected: brute(img1, img2) }));
  const code = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    result = Solution().largestOverlap(case['img1'], case['img2'])
    assert result == case['expected'], case
`;
  const python = spawnSync('python3', ['-c', code], { input: JSON.stringify(payload), encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
});

test('835 renderer shows all trace states in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderImageOverlap835View(step)');
  const end = source.indexOf('\nfunction renderSetMatrixZeroes73ConstantView(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const run = problem.builder(problem.defaultInput, { img2: problem.extraParams[0].default });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderImageOverlap835View(step);
      assert.match(element.innerHTML, /io835-viz/);
      assert.match(element.innerHTML, /io835-grid/);
      assert.match(element.innerHTML, /io835-score/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});
