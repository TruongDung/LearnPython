const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1973];

function serialize(root) {
  if (!root) return [];
  const values = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      values.push(null);
      continue;
    }
    values.push(node.val);
    queue.push(node.left, node.right);
  }
  while (values.at(-1) === null) values.pop();
  return values;
}

function oracle(root) {
  let answer = 0;
  function dfs(node) {
    if (!node) return 0;
    const descendants = dfs(node.left) + dfs(node.right);
    if (node.val === descendants) answer++;
    return node.val + descendants;
  }
  dfs(root);
  return answer;
}

test('1973 is registered as a premium medium postorder problem', () => {
  assert.equal(problem.id, 1973);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.premium, true);
  assert.equal(problem.slug, 'count-nodes-equal-to-sum-of-descendants');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /descendant_sum = left_sum \+ right_sum/);
  assert.ok(problem.builder(problem.defaultInput).steps.every(step => step.descendantSum1973View));
});

test('1973 handles the published examples and the zero-leaf rule', () => {
  const cases = [
    ['10,3,4,2,1', 2],
    ['2,3,null,2,null', 0],
    ['0', 1],
    ['0,0,0', 3],
    ['5', 0],
  ];
  for (const [input, expected] of cases) assert.equal(problem.builder(input).answer, expected, input);
});

test('1973 agrees with an independent oracle on deterministic random trees', () => {
  let seed = 1973;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 180; trial++) {
    const root = { val: random() % 31, left: null, right: null };
    const queue = [root];
    let count = 1;
    while (queue.length && count < 24) {
      const parent = queue.shift();
      for (const side of ['left', 'right']) {
        if (count >= 24 || random() % 100 < 40) continue;
        const child = { val: random() % 31, left: null, right: null };
        parent[side] = child;
        queue.push(child);
        count++;
      }
    }
    const input = JSON.stringify(serialize(root));
    assert.equal(problem.builder(input).answer, oracle(root), input);
  }
});

test('1973 trace exposes wait, sum, comparison, return value, and final states', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.descendantSum1973View);
  const events = new Set(views.map(view => view.event));
  for (const event of ['start', 'enter', 'combine', 'match', 'miss', 'done']) assert.ok(events.has(event), event);
  for (const step of run.steps) {
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    const view = step.descendantSum1973View;
    assert.equal(view.processed, view.results.length);
    if (view.formula) {
      assert.equal(view.formula.descendantSum, view.formula.leftSum + view.formula.rightSum);
      assert.equal(view.formula.subtreeSum, view.formula.nodeValue + view.formula.descendantSum);
    }
  }
  assert.equal(views.at(-1).answer, 2);
  assert.equal(views.at(-1).processed, 5);
});

test('1973 accepts bracketed level-order input and validates visualization bounds', () => {
  assert.equal(problem.builder('[10,3,4,2,1]').answer, 2);
  assert.throws(() => problem.builder('1,-1'), /integers from 0 to 100000/);
  assert.throws(() => problem.builder('1,100001'), /integers from 0 to 100000/);
  assert.throws(() => problem.builder('1,null,null,2'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(0)), /at most 31 tree nodes/);
});

test('1973 custom renderer covers every phase in Vietnamese and English', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderDescendantSum1973View(step)');
  const end = script.indexOf('\nfunction renderMissingIntegerView(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder(problem.defaultInput).steps) {
      context.renderDescendantSum1973View(step);
      assert.match(element.innerHTML, /ds1973-viz/);
      assert.match(element.innerHTML, /ds1973-tree/);
      assert.match(element.innerHTML, /ds1973-results/);
      assert.match(element.innerHTML, /ds1973-(formula|rule)/);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
    }
  }
});
