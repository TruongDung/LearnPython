const test = require('node:test');
const assert = require('node:assert/strict');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2059];
const solve = (nums, start, goal) => problem.builder(nums, { start, goal });

function independentBfs(nums, start, goal) {
  if (start === goal) return 0;
  let frontier = new Set([start]);
  const seen = new Set([start]);
  for (let distance = 1; frontier.size; distance++) {
    const nextFrontier = new Set();
    for (const value of frontier) {
      for (const num of nums) {
        for (const next of [value + num, value - num, value ^ num]) {
          if (next === goal) return distance;
          if (next >= 0 && next <= 1000 && !seen.has(next)) {
            seen.add(next);
            nextFrontier.add(next);
          }
        }
      }
    }
    frontier = nextFrontier;
  }
  return -1;
}

test('2059 is registered as a BFS shortest-path problem', () => {
  assert.equal(problem.id, 2059);
  assert.equal(problem.slug, 'minimum-operations-to-convert-number');
  assert.equal(problem.category.key, 'graph');
  assert.ok(problem.tags.some((tag) => tag.key === 'bfs'));
  assert.equal(problem.extraParams.find((param) => param.key === 'goal').allowNegative, true);
});

test('2059 handles published examples and out-of-range final moves', () => {
  assert.equal(solve([2, 4, 12], 2, 12).answer, 2);
  assert.equal(solve([3, 5, 7], 0, -4).answer, 2);
  assert.equal(solve([2, 8, 16], 0, 1).answer, -1);
  assert.equal(solve([1000], 1000, 2000).answer, 1);
  assert.equal(solve([-1], 0, -1).answer, 1);
  assert.equal(solve([5], 5, 5).answer, 0);
  assert.equal(solve([0], 0, 1).answer, -1);
});

test('2059 agrees with an independent layered BFS on small cases', () => {
  const choices = [-3, -1, 0, 2, 5];
  for (let first = 0; first < choices.length; first++) {
    for (let second = first + 1; second < choices.length; second++) {
      const nums = [choices[first], choices[second]];
      for (const start of [0, 1, 7, 1000]) {
        for (const goal of [-4, 0, 3, 1001]) {
          assert.equal(solve(nums, start, goal).answer, independentBfs(nums, start, goal),
            `nums=${nums}, start=${start}, goal=${goal}`);
        }
      }
    }
  }
});

test('2059 trace matches code lines, queue invariants, and its final path', () => {
  const run = solve([3, 5, 7], 0, -4);
  assert.equal(run.steps.at(-1).codeLines[0], 14);
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 5 && step.codeLines[0] <= problem.code.length);
    const view = step.numberBfs2059View;
    assert.ok(view);
    assert.ok(view.queue.length <= 8);
    if (view.queueSize !== null) assert.ok(view.queueSize >= view.queue.length);
  }
  const path = run.steps.at(-1).numberBfs2059View.path;
  assert.equal(path[0].value, 0);
  assert.equal(path.at(-1).value, -4);
  assert.equal(path.length - 1, run.answer);
  for (let index = 1; index < path.length; index++) {
    const previous = path[index - 1].value;
    const { value, num, op } = path[index];
    assert.ok(run.original.includes(num));
    assert.equal(value, op === '+' ? previous + num : op === '−' ? previous - num : previous ^ num);
  }
  const terminal = run.steps.at(-1).numberBfs2059View;
  assert.equal(terminal.candidate.status, 'goal');
  assert.ok(!terminal.omitted);
});

test('2059 validates the bounded state and distinct nums requirements', () => {
  assert.throws(() => solve([1, 1], 0, 2));
  assert.throws(() => solve([1], -1, 2));
  assert.throws(() => solve([1], 1001, 2));
  assert.throws(() => solve([1], 0, 1e9 + 1));
});

test('2059 bounds long traces while still computing the full BFS result', () => {
  const run = solve([2], 0, 1);
  assert.equal(run.answer, -1);
  assert.ok(run.steps.length <= 451);
  const last = run.steps.at(-1);
  assert.equal(last.codeLines[0], 18);
  assert.equal(last.numberBfs2059View.omitted, true);
});
