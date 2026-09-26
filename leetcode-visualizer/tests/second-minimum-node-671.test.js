const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { SUPPORTED, CATEGORY_ORDER } = require('../problems');

const problem = SUPPORTED[671];

function bruteSecondMinimum(values) {
  const minimum = Math.min(...values);
  const candidate = values.filter((value) => value > minimum).sort((a, b) => a - b)[0];
  return candidate ?? -1;
}

test('671 is registered as a line-by-line special binary-tree lesson', () => {
  assert.equal(problem.id, 671);
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.slug, 'second-minimum-node-in-a-binary-tree');
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(CATEGORY_ORDER['binary-tree'].order.includes(671));
  assert.match(problem.code.join('\n'), /if node\.val > first:/);
  assert.match(problem.code.join('\n'), /return min\(left, right\)/);
});

test('671 returns the second distinct minimum for the official examples and edge cases', () => {
  const cases = [
    ['2,2,5,null,null,5,7', 5],
    ['2,2,2', -1],
    ['2,2,5', 5],
    ['1', -1],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).secondMinimum671View.answer, expected, input);
    assert.equal(run.steps.at(-1).final, true, input);
  }
});

test('671 agrees with an independent distinct-value oracle on generated special trees', () => {
  let seed = 671;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 100; trial += 1) {
    const height = random(4);
    const firstLeaf = (2 ** height) - 1;
    const values = Array.from({ length: (2 ** (height + 1)) - 1 }, () => 0);
    for (let index = firstLeaf; index < values.length; index += 1) values[index] = 1 + random(30);
    for (let index = firstLeaf - 1; index >= 0; index -= 1) {
      values[index] = Math.min(values[index * 2 + 1], values[index * 2 + 2]);
    }
    assert.equal(problem.builder(values.join(',')).answer, bruteSecondMinimum(values), values.join(','));
  }
});

test('671 trace records candidates and prunes their descendants', () => {
  const run = problem.builder('2,2,5,null,null,5,7');
  const views = run.steps.map((step) => step.secondMinimum671View);
  const candidate = views.find((view) => view.candidates.length === 1);
  const final = views.at(-1);

  assert.ok(candidate);
  assert.equal(candidate.current, candidate.candidates[0]);
  assert.deepEqual(final.pruned.sort((a, b) => a - b), [3, 4]);
  assert.equal(final.answer, 5);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.ok(run.steps.every((step) => step.codeLines.length > 0));
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
});

test('671 rejects trees that do not satisfy the special-tree constraints', () => {
  assert.throws(() => problem.builder(''), /non-empty binary tree/);
  assert.throws(() => problem.builder('0'), /integers from 1 to 100000/);
  assert.throws(() => problem.builder('2,2'), /exactly two children/);
  assert.throws(() => problem.builder('3,2,4'), /parent must equal the smaller/);
  assert.throws(() => problem.builder('2,2,5,null,null,4,7'), /parent must equal the smaller/);
});

test('671 displayed Python and repository solution agree with the trace', () => {
  const setup = [
    'class TreeNode:',
    '    def __init__(self, val=0, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'root = TreeNode(2, TreeNode(2), TreeNode(5, TreeNode(5), TreeNode(7)))',
  ].join('\n');
  const assertions = [
    'assert Solution().findSecondMinimumValue(root) == 5',
    'assert Solution().findSecondMinimumValue(TreeNode(2, TreeNode(2), TreeNode(2))) == -1',
  ].join('\n');
  const displayed = spawnSync('python', ['-c', `${setup}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/tree/Leetcode_671.py');
  assert.equal(fs.existsSync(solutionPath), true);
  const solution = spawnSync('python', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});
