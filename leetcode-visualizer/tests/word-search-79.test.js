const assert = require('node:assert/strict');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[79];

const DEFAULT_BOARD = 'A,B,C,E;S,F,C,S;A,D,E,E';

function brute(board, word) {
  const R = board.length, C = board[0].length;
  const used = Array.from({ length: R }, () => Array(C).fill(false));
  function dfs(r, c, i) {
    if (i === word.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || used[r][c] || board[r][c] !== word[i]) return false;
    used[r][c] = true;
    const ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    used[r][c] = false;
    return ok;
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true;
  return false;
}

test('79 answers match brute force on the LeetCode examples', () => {
  assert.equal(problem.builder(DEFAULT_BOARD, { word: 'ABCCED' }).answer, true);
  assert.equal(problem.builder(DEFAULT_BOARD, { word: 'SEE' }).answer, true);
  assert.equal(problem.builder(DEFAULT_BOARD, { word: 'ABCB' }).answer, false);
});

test('79 trace executes one source line per step and preserves the winning path', () => {
  const { steps, answer } = problem.builder(DEFAULT_BOARD, { word: 'ABCCED' });
  assert.equal(answer, true);
  assert.ok(steps.length <= 200, `expected a focused line trace, got ${steps.length} steps`);
  assert.equal(steps.at(-1).final, true);
  assert.equal(steps.at(-1).wordSearchView.result, true);
  // Every snapshot follows exactly one displayed Python line.
  for (const s of steps) {
    assert.ok(s.wordSearchView, 'missing wordSearchView');
    assert.ok(s.title && s.note, 'missing title/note');
    assert.equal(s.codeLines.length, 1);
    for (const n of s.codeLines) assert.ok(n >= 1 && n <= problem.code.length, `bad code line ${n}`);
  }
  // the winning path is shown in order on the final step
  const finalView = steps.at(-1).wordSearchView;
  assert.deepEqual(finalView.board, finalView.original);
  assert.deepEqual(finalView.path.map((p) => [p.r, p.c]),
    [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1]]);
});

test('79 shows reject reasons and backtrack restores on dead ends', () => {
  const { steps } = problem.builder('A,B;B,A', { word: 'ABBA' });
  const reasons = new Set(steps.map((s) => s.wordSearchView.reason).filter(Boolean));
  assert.ok(reasons.has('mismatch'), 'expected a mismatch reject');
  assert.ok(reasons.has('outside'), 'expected an outside reject');
  assert.ok(steps.some((s) => s.wordSearchView.action === 'restore'), 'expected a restore step');
});

test('79 agrees with brute force on randomized boards', () => {
  const letters = 'ABCDE';
  let seed = 79;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let t = 0; t < 60; t++) {
    const R = 1 + Math.floor(rnd() * 3), C = 1 + Math.floor(rnd() * 4);
    const b = Array.from({ length: R }, () => Array.from({ length: C }, () => letters[Math.floor(rnd() * 5)]));
    const w = Array.from({ length: 1 + Math.floor(rnd() * 5) }, () => letters[Math.floor(rnd() * 5)]).join('');
    const input = b.map((r) => r.join(',')).join(';');
    assert.equal(problem.builder(input, { word: w }).answer, brute(b, w), `mismatch on ${input} / ${w}`);
  }
});
