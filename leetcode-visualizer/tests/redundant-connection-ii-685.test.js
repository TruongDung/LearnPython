const assert = require('node:assert/strict');
const { test } = require('node:test');

const problem = require('../problems').SUPPORTED[685];

test('685 uses the requested typed Python solution', () => {
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.code.length, 46);
  assert.equal(problem.code[1], '    def findRedundantDirectedConnection(self, edges: list[list[int]]) -> list[int]:');
  assert.equal(problem.code[5], '        parent = list(range(n + 1))');
  assert.equal(problem.code[11], '                candidate1 = [parent[v], v]  # first edge');
  assert.equal(problem.code[12], '                candidate2 = [u, v]          # second edge');
  assert.equal(problem.code[28], '            if candidate2 == [u, v]:');
  assert.equal(problem.code[42], '            uf[root_v] = root_u');
  assert.equal(problem.code[45], '        return candidate2');
});

test('685 solves the two-parent, cycle-only, and combined cases', () => {
  assert.deepEqual(problem.builder('1,2;1,3;2,3').answer, [2, 3]);
  assert.deepEqual(problem.builder('1,2;2,3;3,4;4,1;1,5').answer, [4, 1]);
  assert.deepEqual(problem.builder('2,1;3,1;4,2;1,4').answer, [2, 1]);
});

test('685 trace highlights exactly one valid source line per step', () => {
  const runs = [
    problem.builder('1,2;1,3;2,3'),
    problem.builder('1,2;2,3;3,4;4,1;1,5'),
    problem.builder('2,1;3,1;4,2;1,4'),
  ];
  const visited = new Set(runs.flatMap(run => run.steps.map(step => step.codeLines[0])));

  for (const run of runs) {
    assert.ok(run.steps.every(step => step.codeLines.length === 1));
    assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
    assert.deepEqual(run.steps.at(-1).directed685View.answer, run.answer);
  }

  for (const line of [3, 6, 7, 8, 10, 11, 12, 13, 15, 18, 20, 21, 22, 23, 24, 26, 29, 30, 32, 33, 35, 37, 38, 41, 43, 46]) {
    assert.ok(visited.has(line), `expected line ${line} to be covered`);
  }
});
