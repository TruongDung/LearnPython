const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[2128];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function brute(grid) {
  const rows = grid.length;
  const columns = grid[0].length;
  for (let rowMask = 0; rowMask < 2 ** rows; rowMask += 1) {
    for (let columnMask = 0; columnMask < 2 ** columns; columnMask += 1) {
      let valid = true;
      for (let row = 0; row < rows && valid; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          if ((grid[row][column] ^ ((rowMask >> row) & 1) ^ ((columnMask >> column) & 1)) !== 0) {
            valid = false;
            break;
          }
        }
      }
      if (valid) return true;
    }
  }
  return false;
}

test('2128 solves official examples and boundary matrices', () => {
  assert.equal(problem.builder([[0, 1, 0], [1, 0, 1], [0, 1, 0]]).answer, true);
  assert.equal(problem.builder([[1, 1, 0], [0, 0, 0], [0, 0, 0]]).answer, false);
  assert.equal(problem.builder([[0]]).answer, true);
  assert.equal(problem.builder([[1]]).answer, true);
  assert.equal(problem.builder([[1, 0], [0, 1]]).answer, true);
});

test('2128 agrees with exhaustive row/column flip search', () => {
  for (let mask = 0; mask < 2 ** 9; mask += 1) {
    const grid = Array.from({ length: 3 }, (_, row) => Array.from({ length: 3 }, (_, column) => (mask >> (row * 3 + column)) & 1));
    assert.equal(problem.builder(grid).answer, brute(grid), `mask=${mask}`);
  }
});

test('2128 trace explains equal rows, complementary rows, and contradictions', () => {
  const valid = problem.builder(problem.defaultInput);
  const final = valid.steps.at(-1).removeOnes2128View;
  assert.equal(final.answer, true);
  assert.deepEqual(final.columnFlips, [1]);
  assert.deepEqual(final.rowFlips, [1]);
  assert.deepEqual(final.rowStates, ['same', 'opposite', 'same']);

  const invalid = problem.builder([[1, 1, 0], [0, 0, 0], [0, 0, 0]]);
  const rejected = invalid.steps.find((step) => step.removeOnes2128View.phase === 'invalid').removeOnes2128View;
  assert.equal(rejected.activeRow, 1);
  assert.deepEqual(rejected.normalized[1], [1, 1, 0]);
  assert.deepEqual(new Set(rejected.contradiction), new Set([0, 2]));
  assert.equal(invalid.steps.at(-1).removeOnes2128View.answer, false);
  assert.equal(invalid.steps.filter((step) => step.final).length, 1);
});

test('2128 validates binary rectangular matrices and visualization bounds', () => {
  for (const input of [
    'bad',
    '[]',
    '[[0,1],[1]]',
    '[[0,2]]',
    JSON.stringify([Array(17).fill(0)]),
    JSON.stringify(Array.from({ length: 17 }, () => [0])),
  ]) assert.throws(() => problem.builder(input));
});

test('2128 displayed Python agrees with exhaustive answers', () => {
  const cases = [
    [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 0, 0], [0, 0, 0]],
    [[1, 0], [0, 1]],
    [[0, 0], [1, 1], [0, 0]],
  ];
  const harness = `
s = Solution()
${cases.map((grid) => `assert s.removeOnes(${JSON.stringify(grid)}) is ${brute(grid) ? 'True' : 'False'}`).join('\n')}
`;
  const run = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${harness}`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2128 is registered as a Google matrix and XOR lesson', () => {
  assert.equal(problem.id, 2128);
  assert.equal(problem.slug, 'remove-all-ones-with-row-and-column-flips');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'array');
  assert.ok(problem.tags.some((tag) => tag.key === 'matrix'));
  assert.ok(problem.tags.some((tag) => tag.key === 'bitwise-xor'));
  assert.ok(problem.companies.includes('google'));
  assert.deepEqual(problem.liveArgs('[[0,1],[1,0]]'), [[[0, 1], [1, 0]]]);
});

test('2128 dedicated matrix renderer and responsive assets are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-remove-ones-2128.js'));
  assert.ok(STYLESHEET_ASSETS.includes('remove-ones-2128.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderRemoveOnes2128View\(step\)/);
  assert.match(javascript, /Why is equal-or-complement sufficient/);
  assert.match(styles, /\.ro2128-normal-row/);
  assert.match(styles, /@container \(max-width:650px\)/);
  assert.ok(index.indexOf('renderer-remove-ones-2128.js') < index.indexOf('script.js?'));
});
