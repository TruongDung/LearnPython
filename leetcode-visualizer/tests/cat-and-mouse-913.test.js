const assert = require('node:assert/strict');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[913];

test('913 solves the LeetCode examples', () => {
  assert.equal(problem.builder([[2, 5], [3], [0, 4, 5], [1, 4, 5], [2, 3], [0, 2, 3]]).answer, 0);
  assert.equal(problem.builder([[1, 3], [0], [3], [0, 2]]).answer, 1);
  assert.equal(problem.builder([[2], [2], [0, 1]]).answer, 2);
});

test('913 renders a complete mouse-row and cat-column state grid', () => {
  const graph = [[1, 2], [0, 2], [0, 1]];
  const result = problem.builder(graph);
  const seed = result.steps.find((step) => step.codeLines[0] === 23);
  const board = seed.hardProblemView.table;

  assert.equal(board.rows.length, graph.length);
  assert.equal(board.columns.length, 2 * (graph.length - 1));
  assert.deepEqual(board.columns.map((column) => column.vi), [
    '🐱1 · 🐭', '🐱1 · 🐱',
    '🐱2 · 🐭', '🐱2 · 🐱',
  ]);
  assert.equal(board.rows[0].cells[0].value, '🐭 2');
  assert.equal(board.rows[0].cells[0].state, 'info');
});

test('913 trace highlights one source line per step with matching line labels', () => {
  const result = problem.builder(problem.defaultInput);

  assert.equal(result.answer, 0);
  assert.ok(result.steps.length > 20);
  assert.ok(result.steps.every((step) => step.codeLines.length === 1));
  for (const step of result.steps) {
    const line = step.codeLines[0];
    assert.ok(line >= 1 && line <= problem.code.length);
    assert.notEqual(problem.code[line - 1].trim().startsWith('#'), true);
    assert.ok(step.title.vi.startsWith(`Dòng ${line}:`));
    assert.ok(step.title.en.startsWith(`Line ${line}:`));
  }
  assert.equal(result.steps.filter((step) => step.final).length, 1);
  assert.equal(result.steps.at(-1).codeLines[0], 53);
  assert.equal(result.steps.at(-1).hardProblemView.answer, 0);
});
