const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[129];

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

function bruteSumNumbers(values) {
  const root = parseCompactTree(values);
  let answer = 0;
  function dfs(node, digits) {
    if (!node) return;
    const next = `${digits}${node.val}`;
    if (!node.left && !node.right) {
      answer += Number(next);
      return;
    }
    dfs(node.left, next);
    dfs(node.right, next);
  }
  dfs(root, '');
  return answer;
}

test('129 is registered as the DFS root-to-leaf decimal-number lesson', () => {
  assert.equal(problem.id, 129);
  assert.equal(problem.slug, 'sum-root-to-leaf-numbers');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /current = current \* 10 \+ node\.val/);
  assert.match(problem.code.join('\n'), /return left \+ right/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(437) + 1], 129);
});

test('129 matches the published examples and edge cases', () => {
  const cases = [
    ['1,2,3', 25],
    ['4,9,0,5,1', 1026],
    ['9,0,1', 181],
    ['0', 0],
    ['[]', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).rootLeafNumber129View.returnValue, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('129 agrees with an independent string-building oracle on deterministic random trees', () => {
  let seed = 129;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 140; trial += 1) {
    const root = { val: random(10), left: null, right: null, depth: 1 };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(20);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      if (node.depth >= 7) continue;
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 38) continue;
        const child = { val: random(10), left: null, right: null, depth: node.depth + 1 };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteSumNumbers(values), input);
  }
});

test('129 trace exposes digit appending, leaf returns, subtree addition, and clean completion', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.rootLeafNumber129View);
  assert.equal(run.answer, 1026);
  assert.ok(views.every(view => view?.problemId === 129));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'enter', 'append-digit', 'check-leaf', 'call-left', 'leaf-return', 'left-return', 'call-right', 'right-return', 'combine', 'done']) {
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }
  assert.ok(problem.builder('1,2').steps.some(step => step.rootLeafNumber129View.event === 'return-zero'));

  const appended495 = views.find(view => view.event === 'append-digit' && view.number === 495);
  assert.equal(appended495.incoming, 49);
  assert.equal(appended495.digit, 5);
  assert.deepEqual(appended495.path.map(item => item.digit), [4, 9, 5]);

  const leafReturns = views.filter(view => view.event === 'leaf-return');
  assert.deepEqual(leafReturns.map(view => view.returnValue), [495, 491, 40]);
  assert.deepEqual(views.at(-1).leaves.map(leaf => leaf.number), [495, 491, 40]);
  assert.deepEqual(views.at(-1).path, []);
  assert.deepEqual(views.at(-1).stack, []);
});

test('129 validates digits, compact tree shape, size, and LeetCode depth constraint', () => {
  assert.throws(() => problem.builder('1,-1'), /integers from 0 to 9/);
  assert.throws(() => problem.builder('1,10'), /integers from 0 to 9/);
  assert.throws(() => problem.builder('1,2.5'), /integers from 0 to 9/);
  assert.throws(() => problem.builder('1,null,null,2'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes per tree/);
  const depthEleven = [1];
  for (let index = 0; index < 10; index += 1) depthEleven.push(1, null);
  assert.throws(() => problem.builder(depthEleven.join(',')), /depth must be at most 10/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, {}), [{
    __viz_type: 'binary_tree',
    values: [4, 9, 0, 5, 1],
    tree_id: 'root',
  }]);
});

test('129 custom renderer stays readable for every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderRootLeafNumber129View(step)');
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

  const runs = [problem.builder(problem.defaultInput), problem.builder('1,2'), problem.builder('[]')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderRootLeafNumber129View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /rln129-viz/);
        assert.match(html, /rln129-rule/);
        assert.match(html, /rln129-equation/);
        assert.match(html, /rln129-leaves/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'rln129Tree'));
  assert.match(styles, /\.rln129-layout/);
  assert.match(styles, /@container \(max-width: 760px\) \{ \.rln129-layout/);
  assert.match(script, /else if \(step\.rootLeafNumber129View\)/);
});
