const { readFrontendJavaScript } = require('./helpers/frontend-source');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[437];

const SOURCE = `from collections import defaultdict

class Solution:
    def pathSum(self, root, targetSum):
        prefix = defaultdict(int)
        prefix[0] = 1

        def dfs(node, curr_sum):
            if not node:
                return 0

            curr_sum += node.val

            count = prefix[curr_sum - targetSum]

            prefix[curr_sum] += 1

            count += dfs(node.left, curr_sum)
            count += dfs(node.right, curr_sum)

            prefix[curr_sum] -= 1

            return count

        return dfs(root, 0)`;

const SOURCE2 = `from collections import defaultdict

class Solution:
    def pathSumPaths(self, root, targetSum):
        positions = defaultdict(list)
        positions[0].append(-1)
        path = []
        result = []

        def dfs(node, curr_sum):
            if not node:
                return

            path.append(node.val)
            curr_sum += node.val
            need = curr_sum - targetSum

            for start in positions.get(need, []):
                result.append(path[start + 1:].copy())

            positions[curr_sum].append(len(path) - 1)

            dfs(node.left, curr_sum)
            dfs(node.right, curr_sum)

            positions[curr_sum].pop()
            if not positions[curr_sum]:
                del positions[curr_sum]
            path.pop()

        dfs(root, 0)
        return result`;

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

function brutePathLists(values, target) {
  const root = parseCompactTree(values);
  const result = [];
  const path = [];
  function dfs(node) {
    if (!node) return;
    path.push(node.val);
    for (let start = 0; start < path.length; start += 1) {
      const sum = path.slice(start).reduce((total, value) => total + value, 0);
      if (sum === target) result.push(path.slice(start));
    }
    dfs(node.left);
    dfs(node.right);
    path.pop();
  }
  dfs(root);
  return result;
}

test('437 is registered as the Prefix Sum + DFS Path Sum III lesson', () => {
  assert.equal(problem.id, 437);
  assert.equal(problem.slug, 'path-sum-iii');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['prefix-sum', 'dfs']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.equal(problem.code.join('\n'), SOURCE);
  assert.equal(problem.code2.join('\n'), SOURCE2);
  assert.equal(problem.complexity2.time, 'O(n + R)');
  assert.equal(problem.complexity2.space, 'O(h + R)');
  assert.deepEqual(problem.extraParams.find(param => param.key === 'approach').options.map(option => option.value), [1, 2]);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(113) + 1], 437);
});

test('437 requested defaultdict snippet executes the published example', () => {
  const harness = `
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(10,
    TreeNode(5, TreeNode(3, TreeNode(3), TreeNode(-2)), TreeNode(2, None, TreeNode(1))),
    TreeNode(-3, None, TreeNode(11)))
assert Solution().pathSum(root, 8) == 3
assert Solution().pathSum(None, 8) == 0
`;
  const executed = spawnSync(process.env.PYTHON || 'python3', ['-c', `${SOURCE}\n${harness}`], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
});

test('437 approach 2 follow-up returns every matching path as a list of node values', () => {
  const harness = `
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

root = TreeNode(10,
    TreeNode(5, TreeNode(3, TreeNode(3), TreeNode(-2)), TreeNode(2, None, TreeNode(1))),
    TreeNode(-3, None, TreeNode(11)))
assert Solution().pathSumPaths(root, 8) == [[5, 3], [5, 2, 1], [-3, 11]]
assert Solution().pathSumPaths(None, 8) == []
`;
  const executed = spawnSync(process.env.PYTHON || 'python3', ['-c', `${SOURCE2}\n${harness}`], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);

  assert.deepEqual(problem.builder2(problem.defaultInput, { target: 8 }).answer, [[5, 3], [5, 2, 1], [-3, 11]]);
  assert.deepEqual(problem.builder2('0,0,0', { target: 0 }).answer, [[0], [0, 0], [0], [0, 0], [0]]);
  assert.deepEqual(problem.builder2('[]', { target: 8 }).answer, []);
});

test('437 approach 2 matches an independent path-list oracle on deterministic random trees', () => {
  let seed = 2437;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 100; trial += 1) {
    const root = { val: random(11) - 5, left: null, right: null };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(16);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 40) continue;
        const child = { val: random(11) - 5, left: null, right: null };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const target = random(17) - 8;
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.deepEqual(problem.builder2(input, { target }).answer, brutePathLists(values, target), `${input}; target=${target}`);
  }
});

test('437 approach 2 trace follows positions, slices paths, and highlights code block 2', () => {
  const run = problem.builder2(problem.defaultInput, { target: 8 });
  const views = run.steps.map(step => step.pathSumIIIView);
  assert.ok(run.steps.every(step => step.codeBlock === 2));
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code2.length));
  assert.ok(views.every(view => view.approach === 2));

  const lineFor = event => run.steps.find(step => step.pathSumIIIView.event === event).codeLines;
  assert.deepEqual(lineFor('init-map'), [6]);
  assert.deepEqual(lineFor('add-node'), [15]);
  assert.deepEqual(lineFor('compute-needed'), [16]);
  assert.deepEqual(lineFor('found'), [19]);
  assert.deepEqual(lineFor('store-prefix'), [21]);
  assert.deepEqual(lineFor('call-left'), [23]);
  assert.deepEqual(lineFor('call-right'), [24]);
  assert.deepEqual(lineFor('remove-prefix'), [26]);
  assert.deepEqual(lineFor('done'), [32]);

  const found = views.find(view => view.event === 'found');
  assert.deepEqual(found.matches[0].values, [5, 3]);
  assert.deepEqual(found.resultPaths, [[5, 3]]);
  const final = views.at(-1);
  assert.deepEqual(final.resultPaths, [[5, 3], [5, 2, 1], [-3, 11]]);
  assert.deepEqual(final.prefixEntries, [{ sum: 0, count: 1, sources: ['before root'], positions: [-1] }]);
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

  const lineFor = event => run.steps.find(step => step.pathSumIIIView.event === event).codeLines;
  assert.deepEqual(lineFor('init-map'), [6]);
  assert.deepEqual(lineFor('add-node'), [12]);
  assert.deepEqual(lineFor('compute-needed'), [14]);
  assert.deepEqual(lineFor('store-prefix'), [16]);
  assert.deepEqual(lineFor('call-left'), [18]);
  assert.deepEqual(lineFor('call-right'), [19]);
  assert.deepEqual(lineFor('remove-prefix'), [21]);
  assert.deepEqual(lineFor('return-subtree'), [23]);
  assert.deepEqual(lineFor('done'), [25]);

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

test('437 class renders both approaches with pictures in English and Vietnamese', () => {
  const source = require('node:fs').readFileSync(require.resolve('../public/renderer-path-sum-437.js'), 'utf8');
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: value => String(value ?? '') };
  vm.createContext(context);
  vm.runInContext(source, context);
  const runs = [problem.builder(problem.defaultInput, { target: 8 }), problem.builder('[]', { target: 8 }), problem.builder2(problem.defaultInput, { target: 8 })];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) for (const step of run.steps) {
      context.renderPathSumIIIView(step);
      assert.match(host.innerHTML, /p437-viz/);
      if (!step.final) {
        assert.match(host.innerHTML, /p437-rule/);
        assert.match(host.innerHTML, /p437-checkpoints/);
      }
      assert.match(host.innerHTML, /p437-map/);
      assert.match(host.innerHTML, /p437-found/);
      if (step.tree.nodes.length || !step.final) assert.match(host.innerHTML, /<svg/);
      else assert.match(host.innerHTML, /p437-empty-tree">∅/);
      assert.doesNotMatch(host.innerHTML, /NaN|undefined|Infinity/);
      assert.equal((host.innerHTML.match(/data-node-id=/g) || []).length, step.tree.nodes.length);
    }
  }
  const found = runs[0].steps.find(step => step.pathSumIIIView.event === 'found');
  context.renderPathSumIIIView(found);
  assert.match(host.innerHTML, /data-match-ids="1,3"/);
  assert.match(host.innerHTML, /data-lookup-count="1"/);
  assert.match(host.innerHTML, /p437-checkpoint cut/);
  const backtrack = runs[0].steps.find(step => step.pathSumIIIView.event === 'remove-prefix');
  context.renderPathSumIIIView(backtrack);
  assert.match(host.innerHTML, /p437-checkpoint removed/);
  assert.match(host.innerHTML, /p437-undo-label/);
  assert.match(host.innerHTML, /prefix\[21\] −1/);
});

test('437 repeated prefix display preserves lookup count after storing current node', () => {
  const source = require('node:fs').readFileSync(require.resolve('../public/renderer-path-sum-437.js'), 'utf8');
  const host = { innerHTML: '' };
  const context = { lang: 'en', $: () => host, escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(source, context);
  const trace = problem.builder('0,0,0', { target: 0 }).steps;
  const stored = trace.find(step => step.pathSumIIIView.event === 'store-prefix' && step.pathSumIIIView.matches.length === 1);
  assert.equal(stored.pathSumIIIView.prefixEntries.find(entry => entry.sum === 0).count, 2);
  context.renderPathSumIIIView(stored);
  assert.match(host.innerHTML, /data-lookup-count="1"/);
  assert.match(host.innerHTML, /<em>×2<\/em>/);
  assert.doesNotMatch(host.innerHTML, /data-lookup-count="2"/);
});

test('437 class keeps repeated matches distinct and result lists do not reveal future paths', () => {
  const source = require('node:fs').readFileSync(require.resolve('../public/renderer-path-sum-437.js'), 'utf8');
  const context = { escapeHtml: String };
  vm.createContext(context);
  vm.runInContext(source, context);
  const Visualizer = vm.runInContext('PathSum437Visualizer', context);
  const host = { innerHTML: '' };
  const visualizer = new Visualizer({ host, language: 'vi' });
  const trace = problem.builder2('0,0,null,0', { target: 0 }).steps;
  visualizer.render(trace[0]);
  assert.equal((host.innerHTML.match(/class="p437-result"/g) || []).length, 0);
  const three = trace.find(step => step.pathSumIIIView.event === 'found' && step.pathSumIIIView.added === 3);
  visualizer.render(three);
  assert.equal((host.innerHTML.match(/class="p437-match"/g) || []).length, 3);
  assert.equal((host.innerHTML.match(/p437-checkpoint cut/g) || []).length, 3);
  visualizer.render(trace.at(-1));
  assert.equal((host.innerHTML.match(/class="p437-result"/g) || []).length, 6);
  assert.match(host.innerHTML, /List · 6/);
  assert.match(host.innerHTML, /p437-map-position">-1/);
});

test('437 dedicated assets stay lazy and the renderer is extracted from the base bundle', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(html, /path-sum-437\.css/);
  assert.match(html, /renderer-path-sum-437\.js/);
  assert.doesNotMatch(html.replace(/<template[\s\S]*?<\/template>/g, ''), /(?:renderer-)?path-sum-437\.(?:css|js)/);
  assert.doesNotMatch(fs.readFileSync(require.resolve('../public/app-renderers-base.js'), 'utf8'), /function renderPathSumIIIView/);
  assert.match(readFrontendJavaScript(), /Boolean\(step\.pathSumIIIView\)/);
});
