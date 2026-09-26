const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[562];
const solve = (mat) => problem.builder(mat);

function brute(mat) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let answer = 0;
  for (let r = 0; r < mat.length; r++) {
    for (let c = 0; c < mat[0].length; c++) {
      for (const [dr, dc] of directions) {
        let length = 0;
        let row = r;
        let col = c;
        while (row >= 0 && row < mat.length && col >= 0 && col < mat[0].length && mat[row][col] === 1) {
          length++;
          row += dr;
          col += dc;
        }
        answer = Math.max(answer, length);
      }
    }
  }
  return answer;
}

test('562 is registered as a medium matrix DP lesson with a runnable Python solution', () => {
  assert.equal(problem.id, 562);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'dp');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.code.length, 15);
  assert.deepEqual(problem.liveArgs('1,0;0,1'), [[[1, 0], [0, 1]]]);
});

test('562 handles published examples, four directions, zeroes and one cell', () => {
  assert.equal(solve([[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 1]]).answer, 3);
  assert.equal(solve([[1, 1, 1, 1], [0, 1, 1, 0], [0, 0, 0, 1]]).answer, 4);
  assert.equal(solve([[1, 1, 1, 1]]).answer, 4);
  assert.equal(solve([[1], [1], [1], [1]]).answer, 4);
  assert.equal(solve([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).answer, 3);
  assert.equal(solve([[0, 0, 1], [0, 1, 0], [1, 0, 0]]).answer, 3);
  assert.equal(solve([[0, 0], [0, 0]]).answer, 0);
  assert.equal(solve([[1]]).answer, 1);
});

test('562 matches an independent four-direction oracle on random matrices', () => {
  let seed = 562;
  const rand = (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  };
  for (let trial = 0; trial < 120; trial++) {
    const rows = 1 + rand(6);
    const cols = 1 + rand(6);
    const mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(2)));
    assert.equal(solve(mat).answer, brute(mat), JSON.stringify(mat));
  }
});

test('562 trace follows the displayed Python one line at a time', () => {
  assert.deepEqual(solve([[0]]).steps.map((step) => step.codeLines[0]),
    [2, 3, 4, 5, 6, 7, 8, 9, 15]);
  assert.deepEqual(solve([[1]]).steps.map((step) => step.codeLines[0]),
    [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15]);
  const run = solve([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  const lastOne = run.steps.find((step) => step.codeLines[0] === 14
    && step.longestLine562View.current.join(',') === '2,2');
  assert.deepEqual(lastOne.longestLine562View.lengths, [1, 1, 3, 1]);
  assert.deepEqual(lastOne.longestLine562View.bestLine,
    { direction: 2, end: [2, 2], length: 3 });
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
});

test('562 displayed Python agrees with the builder', () => {
  const assertions = [
    's = Solution()',
    'assert s.longestLine([[0,1,1,0],[0,1,1,0],[0,0,0,1]]) == 3',
    'assert s.longestLine([[1,1,1,1]]) == 4',
    'assert s.longestLine([[0,0,1],[0,1,0],[1,0,0]]) == 3',
    'assert s.longestLine([[0,0],[0,0]]) == 0',
  ].join('\n');
  const result = spawnSync('python', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});

test('562 validates binary rectangular input and bounds the trace without losing the answer', () => {
  for (const invalid of ['', '1,;', [[1], [1, 0]], [[2]], [[0.5]], [], '[oops]']) {
    assert.throws(() => solve(invalid));
  }
  assert.throws(() => solve([new Array(10001).fill(1)]), /10000/);
  const run = solve([new Array(10000).fill(1)]);
  assert.equal(run.answer, 10000);
  assert.ok(run.steps.length < 300);
  assert.equal(run.steps.at(-1).longestLine562View.shortened, true);
  assert.equal(run.steps.at(-1).final, true);
});

test('562 custom renderer covers every step in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderLongestLine562View(step)');
  const end = source.indexOf('\nfunction renderNodeSequence2242View(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '' };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [solve([[0, 1, 1], [0, 1, 0], [1, 0, 0]]), solve([[0]])]) {
      for (const step of run.steps) {
        context.renderLongestLine562View(step);
        assert.match(element.innerHTML, /ll562-viz/);
        assert.match(element.innerHTML, /ll562-cell/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ll562-viz \{/);
  assert.match(css, /\.ll562-cell\.current/);
});
