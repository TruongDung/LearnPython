const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1080];

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

function cloneAndPrune(node, limit, pathSum = 0) {
  if (!node) return null;
  const total = pathSum + node.val;
  if (!node.left && !node.right) return total >= limit ? { val: node.val, left: null, right: null } : null;
  const left = cloneAndPrune(node.left, limit, total);
  const right = cloneAndPrune(node.right, limit, total);
  return left || right ? { val: node.val, left, right } : null;
}

test('1080 keeps the O(n) postorder solution and dedicated teaching view', () => {
  assert.equal(problem.id, 1080);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.match(problem.code.join('\n'), /node\.left or node\.right/);
  assert.ok(problem.builder(problem.defaultInput, { limit: -1 }).steps.every(step => step.insufficient1080View));
});

test('1080 matches all three published examples with compact level-order parsing', () => {
  const examples = [
    ['1,2,3,4,-99,-99,7,8,9,-99,-99,12,13,-99,14', 1, [1, 2, 3, 4, null, null, 7, 8, 9, null, 14]],
    ['5,4,8,11,null,17,4,7,1,null,null,5,3', 22, [5, 4, 8, 11, null, 17, 4, 7, null, null, null, 5]],
    ['1,2,-3,-5,null,4,null', -1, [1, null, -3, 4]],
  ];
  for (const [input, limit, expected] of examples) {
    assert.deepEqual(JSON.parse(problem.builder(input, { limit }).answer), expected);
  }
});

test('1080 agrees with an independent oracle on deterministic random trees', () => {
  let seed = 1080;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let trial = 0; trial < 120; trial++) {
    const root = { val: (random() % 21) - 10, left: null, right: null };
    const queue = [root];
    let nodes = 1;
    while (queue.length && nodes < 18) {
      const parent = queue.shift();
      for (const side of ['left', 'right']) {
        if (nodes >= 18 || random() % 100 < 38) continue;
        const child = { val: (random() % 21) - 10, left: null, right: null };
        parent[side] = child;
        queue.push(child);
        nodes++;
      }
    }
    const input = JSON.stringify(serialize(root));
    const limit = (random() % 31) - 15;
    const expected = serialize(cloneAndPrune(root, limit));
    const actual = JSON.parse(problem.builder(input, { limit }).answer);
    assert.deepEqual(actual, expected, `${input}; limit=${limit}`);
  }
});

test('1080 trace clearly separates descending, leaf decisions, backtracking, and result', () => {
  const run = problem.builder(problem.defaultInput, { limit: -1 });
  const views = run.steps.map(step => step.insufficient1080View);
  const events = new Set(views.map(view => view.event));
  for (const event of ['intro', 'enter', 'call-left', 'prune-leaf', 'keep-leaf', 'left-return', 'right-return', 'prune-parent', 'keep-parent', 'done']) {
    assert.ok(events.has(event), event);
  }
  assert.deepEqual([...new Set(views.map(view => view.phaseIndex))], [0, 1, 2, 3]);
  for (const step of run.steps) {
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    const view = step.insufficient1080View;
    assert.ok(Array.isArray(view.stack));
    assert.ok(Array.isArray(view.path));
    assert.equal(view.decided, view.keptIds.length + view.prunedIds.length);
  }
  const final = views.at(-1);
  assert.equal(final.resultTree, '[1,null,-3,4]');
  assert.equal(final.decided, final.totalNodes);
});

test('1080 validates limit, node values, and malformed compact trees', () => {
  assert.throws(() => problem.builder('1,2,3', { limit: 1.5 }), /limit must be an integer/);
  assert.throws(() => problem.builder('1,100001', { limit: 0 }), /between -100000 and 100000/);
  assert.throws(() => problem.builder('1,null,null,2', { limit: 0 }), /Invalid level-order tree/);
  assert.equal(problem.builder('[1,2,3]', { limit: 4 }).answer, '[1,null,3]');
});

test('1080 custom renderer covers every step in Vietnamese and English', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderInsufficient1080View(step)');
  const end = script.indexOf('\nfunction renderTree(step, targetId = "treeView")', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const treeTargets = [];
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, target) => treeTargets.push(target),
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder(problem.defaultInput, { limit: -1 }).steps) {
      context.renderInsufficient1080View(step);
      assert.match(element.innerHTML, /is1080-viz/);
      assert.match(element.innerHTML, /is1080-(rule|decision)/);
      assert.match(element.innerHTML, /is1080-tree/);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
    }
  }
  assert.ok(treeTargets.every(target => target === 'is1080Tree'));
});
