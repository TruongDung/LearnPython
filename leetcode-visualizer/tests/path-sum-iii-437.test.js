const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[437];

function parseCompactTree(input) {
  const values = input;
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

function brutePathSum(values, target) {
  const root = parseCompactTree(values);
  let count = 0;
  function startAt(node, sum) {
    if (!node) return;
    const next = sum + node.val;
    if (next === target) count += 1;
    startAt(node.left, next);
    startAt(node.right, next);
  }
  function visit(node) {
    if (!node) return;
    startAt(node, 0);
    visit(node.left);
    visit(node.right);
  }
  visit(root);
  return count;
}

test('437 is registered as the Prefix Sum + DFS Path Sum III lesson', () => {
  assert.equal(problem.id, 437);
  assert.equal(problem.slug, 'path-sum-iii');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['prefix-sum', 'dfs']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /needed = running - targetSum/);
  assert.match(problem.code.join('\n'), /prefix_count\[running\] -= 1  # backtrack/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(113) + 1], 437);
});

test('437 matches the published examples and tricky repeated-prefix cases', () => {
  const cases = [
    ['10,5,-3,3,2,null,11,3,-2,null,1', 8, 3],
    ['5,4,8,11,null,13,4,7,2,null,null,5,1', 22, 3],
    ['1,-2,-3,1,3,-2,null,-1', -1, 4],
    ['0,0,0', 0, 5],
    ['1', 1, 1],
    ['[]', 8, 0],
  ];
  for (const [input, target, expected] of cases) {
    const run = problem.builder(input, { target });
    assert.equal(run.answer, expected, `${input}; target=${target}`);
    assert.equal(run.steps.at(-1).pathSumIIIView.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('437 agrees with an independent O(n squared) oracle on deterministic random trees', () => {
  let seed = 437;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 120; trial += 1) {
    const root = { val: random(13) - 6, left: null, right: null };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(18);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 38) continue;
        const child = { val: random(13) - 6, left: null, right: null };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const target = random(19) - 9;
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input, { target }).answer, brutePathSum(values, target), `${input}; target=${target}`);
  }
});

test('437 trace teaches lookup before store and removes prefixes during backtracking', () => {
  const run = problem.builder(problem.defaultInput, { target: 8 });
  const views = run.steps.map(step => step.pathSumIIIView);
  assert.ok(run.steps.length > 80);
  assert.ok(views.every(view => view?.problemId === 437));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'init-map', 'enter', 'add-node', 'compute-needed', 'found', 'not-found', 'store-prefix', 'call-left', 'call-right', 'return-null', 'remove-prefix', 'return-subtree', 'done']) {
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }

  for (const view of views.filter(view => view.event === 'found')) {
    assert.equal(view.running - view.needed, view.target);
    assert.equal(view.added, view.matches.length);
    assert.ok(view.matches.every(match => match.values.reduce((sum, value) => sum + value, 0) === view.target));
  }

  const firstNodeEvents = views
    .filter(view => view.current?.value === 10)
    .map(view => view.event);
  assert.ok(firstNodeEvents.indexOf('found') < firstNodeEvents.indexOf('store-prefix'));
  assert.ok(firstNodeEvents.indexOf('store-prefix') < firstNodeEvents.indexOf('remove-prefix'));

  const final = views.at(-1);
  assert.deepEqual(final.prefixEntries, [{ sum: 0, count: 1, sources: ['before root'] }]);
  assert.deepEqual(final.path, []);
  assert.deepEqual(final.stack, []);
  assert.deepEqual(final.foundPaths.map(path => path.values), [[5, 3], [5, 2, 1], [-3, 11]]);
});

test('437 validates tree and target inputs and prepares the live Python arguments', () => {
  assert.throws(() => problem.builder('1,2,3', { target: 1.5 }), /targetSum must be an integer/);
  assert.throws(() => problem.builder('1,1000000001', { target: 0 }), /from -1000000000 to 1000000000/);
  assert.throws(() => problem.builder('1,null,null,2', { target: 0 }), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(','), { target: 1 }), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, { target: 8 }), [
    {
      __viz_type: 'binary_tree',
      values: [10, 5, -3, 3, 2, null, 11, 3, -2, null, 1],
      tree_id: 'root',
    },
    8,
  ]);
});

test('437 custom renderer remains complete and readable in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderPathSumIIIView(step)');
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

  const runs = [problem.builder(problem.defaultInput, { target: 8 }), problem.builder('[]', { target: 8 })];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderPathSumIIIView(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /ps437-viz/);
        assert.match(html, /ps437-rule/);
        assert.match(html, /ps437-map/);
        assert.match(html, /ps437-found/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'ps437Tree'));
  assert.match(styles, /\.ps437-layout/);
  assert.match(styles, /@container \(max-width: 760px\)/);
  assert.match(script, /else if \(step\.pathSumIIIView\)/);
});
