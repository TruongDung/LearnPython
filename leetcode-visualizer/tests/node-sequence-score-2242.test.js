const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2242];
const solve = (scores, edges) => problem.builder(scores, { edges });

function brute(scores, edges) {
  const neighbors = Array.from({ length: scores.length }, () => []);
  for (const [u, v] of edges) {
    neighbors[u].push(v);
    neighbors[v].push(u);
  }
  let answer = -1;
  function dfs(path) {
    if (path.length === 4) {
      answer = Math.max(answer, path.reduce((sum, id) => sum + scores[id], 0));
      return;
    }
    for (const next of neighbors[path.at(-1)]) {
      if (!path.includes(next)) dfs([...path, next]);
    }
  }
  for (let node = 0; node < scores.length; node++) dfs([node]);
  return answer;
}

test('2242 is registered as a hard graph problem with two inputs', () => {
  assert.equal(problem.id, 2242);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'graph');
  assert.equal(problem.extraParams[0].key, 'edges');
  assert.equal(problem.code[1].includes('maximumScore'), true);
});

test('2242 matches both official examples and edge cases', () => {
  assert.equal(solve([5, 2, 9, 8, 4], [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3], [2, 4]]).answer, 24);
  assert.equal(solve([9, 20, 6, 4, 11, 12], [[0, 3], [5, 3], [2, 4], [1, 3]]).answer, -1);
  assert.equal(solve([1, 2, 3, 4], [[0, 1], [1, 2], [2, 3]]).answer, 10);
  assert.equal(solve([1, 2, 3, 4], []).answer, -1);
  assert.equal(solve([1, 1, 1, 1], [[0, 1], [1, 2], [2, 3]]).answer, 4);
  assert.deepEqual(problem.liveArgs([1, 2, 3, 4], { edges: '[[0,1],[1,2]]' }),
    [[1, 2, 3, 4], [[0, 1], [1, 2]]]);
});

test('2242 agrees with exhaustive length-four paths on small random graphs', () => {
  let seed = 2242;
  const rand = (limit) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % limit;
  };
  for (let trial = 0; trial < 130; trial++) {
    const n = 4 + rand(5);
    const scores = Array.from({ length: n }, () => 1 + rand(30));
    const edges = [];
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        if (rand(3) !== 0) edges.push([u, v]);
      }
    }
    assert.equal(solve(scores, edges).answer, brute(scores, edges), JSON.stringify({ scores, edges }));
  }
});

test('2242 trace keeps top-three lists and rejects repeated outer nodes', () => {
  const run = solve([100, 90, 80, 70], [[0, 1], [0, 2], [1, 2], [1, 3]]);
  assert.equal(run.answer, 340);
  const middle = run.steps.find((step) => step.nodeSequence2242View.phase === 'middle'
    && step.nodeSequence2242View.edgeIndex === 0).nodeSequence2242View;
  assert.deepEqual(middle.leftTop.map((item) => item.id), [1, 2]);
  assert.deepEqual(middle.rightTop.map((item) => item.id), [0, 2, 3]);
  assert.ok(run.steps.some((step) => step.nodeSequence2242View.reason === 'a=d'));
  assert.deepEqual(run.steps.at(-1).nodeSequence2242View.bestPath.length, 4);
  assert.equal(run.steps.at(-1).codeLines[0], 21);
});

test('2242 validates score and undirected-edge constraints', () => {
  assert.throws(() => solve([1, 2, 3], []), /scores/);
  assert.throws(() => solve([1, 2, 3, 0], []), /scores/);
  assert.throws(() => solve([1, 2, 3, 4], 'oops'), /JSON/);
  assert.throws(() => solve([1, 2, 3, 4], [[0, 4]]), /distinct nodes/);
  assert.throws(() => solve([1, 2, 3, 4], [[0, 0]]), /distinct nodes/);
  assert.throws(() => solve([1, 2, 3, 4], [[0, 1], [1, 0]]), /duplicate/);
  assert.throws(() => solve([1, 2, 3, 4], [[0, 1, 2]]), /pairs/);
});

test('2242 shortens large traces but checks all middle edges', () => {
  const n = 50000;
  const scores = new Array(n).fill(1);
  const edges = Array.from({ length: n - 1 }, (_, index) => [index, index + 1]);
  const run = solve(scores, edges);
  assert.equal(run.answer, 4);
  assert.ok(run.steps.length < 220);
  assert.equal(run.steps.at(-1).nodeSequence2242View.shortened, true);
  assert.equal(run.steps.at(-1).final, true);
});

test('2242 renderer handles every phase in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderNodeSequence2242View(step)');
  const end = source.indexOf('\nfunction renderSlidingFreqView(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '' };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [
      solve([5, 2, 9, 8, 4], [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3], [2, 4]]),
      solve([1, 2, 3, 4], []),
    ]) {
      for (const step of run.steps) {
        context.renderNodeSequence2242View(step);
        assert.match(element.innerHTML, /ns2242-viz/);
        assert.match(element.innerHTML, /ns2242-path/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ns2242-viz \{/);
  assert.match(css, /\.ns2242-path\.rejected/);
});
