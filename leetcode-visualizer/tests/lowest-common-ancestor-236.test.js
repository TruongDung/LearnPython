const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[236];

function parseCompactTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null) {
      node.left = { val: values[index], left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < values.length && values[index] !== null) {
      node.right = { val: values[index], left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  return root;
}

function serializeCompact(root) {
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

function pathTo(root, target, path = []) {
  if (!root) return null;
  const next = [...path, root.val];
  if (root.val === target) return next;
  return pathTo(root.left, target, next) || pathTo(root.right, target, next);
}

function oracleLca(values, p, q) {
  const root = parseCompactTree(values);
  const pPath = pathTo(root, p);
  const qPath = pathTo(root, q);
  let answer = pPath[0];
  for (let index = 0; index < Math.min(pPath.length, qPath.length) && pPath[index] === qPath[index]; index += 1) {
    answer = pPath[index];
  }
  return answer;
}

test('236 keeps the canonical recursive solution and expanded teaching metadata', () => {
  assert.equal(problem.id, 236);
  assert.equal(problem.slug, 'lowest-common-ancestor-of-a-binary-tree');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs', 'lowest-common-ancestor']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /if root == p or root == q/);
  assert.match(problem.code.join('\n'), /if left and right/);
  assert.match(problem.code.join('\n'), /return left or right/);
});

test('236 matches all published examples including the ancestor-is-target case', () => {
  const tree = '3,5,1,6,2,0,8,null,null,7,4';
  const cases = [
    [tree, 5, 1, 3],
    [tree, 5, 4, 5],
    ['1,2', 1, 2, 1],
    [tree, 7, 4, 2],
  ];
  for (const [input, p, q, expected] of cases) {
    const run = problem.builder(input, { p, q });
    assert.equal(run.answer, expected, `${p},${q}`);
    assert.equal(run.steps.at(-1).lca236View.lca.value, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('236 agrees with an independent root-path oracle on deterministic random trees', () => {
  let seed = 236;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 140; trial += 1) {
    const count = 2 + random(20);
    const nodes = Array.from({ length: count }, (_, index) => ({ val: trial * 100 + index + 1, left: null, right: null }));
    const available = [
      { parent: nodes[0], side: 'left' },
      { parent: nodes[0], side: 'right' },
    ];
    for (let index = 1; index < nodes.length; index += 1) {
      const slotIndex = random(available.length);
      const [{ parent, side }] = available.splice(slotIndex, 1);
      parent[side] = nodes[index];
      available.push(
        { parent: nodes[index], side: 'left' },
        { parent: nodes[index], side: 'right' },
      );
    }
    const values = serializeCompact(nodes[0]);
    const first = random(nodes.length);
    let second = random(nodes.length - 1);
    if (second >= first) second += 1;
    const p = nodes[first].val;
    const q = nodes[second].val;
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input, { p, q }).answer, oracleLca(values, p, q), `${input}; p=${p}; q=${q}`);
  }
});

test('236 trace explains target return, split, bubbling, None, and final routes', () => {
  const splitRun = problem.builder(problem.defaultInput, { p: 5, q: 1 });
  const splitViews = splitRun.steps.map(step => step.lca236View);
  assert.ok(splitViews.every(view => view?.problemId === 236));
  assert.ok(splitRun.steps.every(step => step.codeLines.length <= 1));
  assert.ok(splitRun.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));
  assert.equal(splitViews.filter(view => view.event === 'target-match').length, 2);
  const split = splitViews.find(view => view.decision === 'split');
  assert.equal(split.current.value, 3);
  assert.equal(split.leftResult.value, 5);
  assert.equal(split.rightResult.value, 1);
  assert.equal(split.returnValue.value, 3);
  assert.deepEqual(splitViews.at(-1).routeP, [3, 5]);
  assert.deepEqual(splitViews.at(-1).routeQ, [3, 1]);
  assert.equal(splitViews.at(-1).current.value, 3);
  assert.equal(splitViews.at(-1).leftResult.value, 5);
  assert.equal(splitViews.at(-1).rightResult.value, 1);
  assert.equal(splitViews.at(-1).decision, 'split');

  const ancestorRun = problem.builder(problem.defaultInput, { p: 5, q: 4 });
  const ancestorViews = ancestorRun.steps.map(step => step.lca236View);
  assert.equal(ancestorRun.answer, 5);
  assert.ok(ancestorViews.some(view => view.event === 'return-null'));
  assert.ok(ancestorViews.some(view => view.decision === 'none'));
  assert.ok(ancestorViews.some(view => view.decision === 'bubble-left'));
  assert.ok(!ancestorViews.some(view => view.current?.value === 4), 'DFS should stop when it reaches ancestor target p=5');
  assert.deepEqual(ancestorViews.at(-1).routeP, [5]);
  assert.deepEqual(ancestorViews.at(-1).routeQ, [5, 2, 4]);
  assert.equal(ancestorViews.at(-1).current.value, 5);
  assert.equal(ancestorViews.at(-1).decision, 'target-p');
  assert.equal(ancestorViews.at(-1).leftReady, false);
  assert.equal(ancestorViews.at(-1).rightReady, false);
});

test('236 validates the LeetCode guarantees and prepares live TreeNode references', () => {
  assert.throws(() => problem.builder('1,1,2', { p: 1, q: 2 }), /values must be unique/);
  assert.throws(() => problem.builder('1,2,3', { p: 2, q: 9 }), /must exist/);
  assert.throws(() => problem.builder('1,2,3', { p: 2, q: 2 }), /different nodes/);
  assert.throws(() => problem.builder('1,2,3', { p: 'x', q: 2 }), /must be integers/);
  assert.throws(() => problem.builder('1000000001,2', { p: 1000000001, q: 2 }), /integers from -1000000000 to 1000000000/);
  assert.throws(() => problem.builder('1,null,null,2', { p: 1, q: 2 }), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array.from({ length: 32 }, (_, index) => index + 1).join(','), { p: 1, q: 2 }), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, { p: 5, q: 1 }), [
    { __viz_type: 'binary_tree', values: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], tree_id: 'root' },
    { __viz_type: 'binary_tree_ref', tree_id: 'root', value: 5 },
    { __viz_type: 'binary_tree_ref', tree_id: 'root', value: 1 },
  ]);
});

test('236 custom renderer remains complete in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderLca236View(step)');
  const end = script.indexOf('\nfunction renderTreeEssentialsView(step)', start);
  assert.ok(start >= 0 && end > start);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const treeTargets = [];
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => {
      treeTargets.push(targetId);
      elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>';
    },
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [
    problem.builder(problem.defaultInput, { p: 5, q: 1 }),
    problem.builder(problem.defaultInput, { p: 5, q: 4 }),
    problem.builder(problem.defaultInput, { p: 7, q: 4 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderLca236View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /lca236-viz/);
        assert.match(html, /lca236-returns/);
        assert.match(html, /lca236-decisions/);
        assert.match(html, /return left or right/);
        assert.match(html, /lca236-processed/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
        if (step.final) assert.match(html, /TWO ROUTES FROM THE LCA|HAI ĐƯỜNG TỪ LCA/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'lca236Tree'));
  assert.match(styles, /\.lca236-layout/);
  assert.match(styles, /@container \(max-width: 520px\)/);
  assert.match(script, /else if \(step\.lca236View\)/);
});
