const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const ids = [257, 404, 617, 572, 965, 872, 951];

test('all seven tree essentials are registered in the learning order with dedicated views', () => {
  const order = CATEGORY_ORDER['binary-tree'].order;
  for (const id of ids) {
    const problem = SUPPORTED[id];
    assert.equal(problem.id, id);
    assert.equal(problem.category.key, 'binary-tree');
    assert.ok(order.includes(id));
    assert.ok(problem.code.length >= 8);
    const run = problem.builder(problem.defaultInput, Object.fromEntries((problem.extraParams || []).map(param => [param.key, param.default])));
    assert.ok(run.steps.length > 1, String(id));
    assert.ok(run.steps.every(step => step.treeEssentialsView?.problemId === id), String(id));
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length), `${id}: ${step.codeLines}`);
      assert.ok(Array.isArray(step.treeEssentialsView.panels));
      assert.ok(step.treeEssentialsView.panels.length >= 1);
    }
  }
  assert.equal(SUPPORTED[951].difficulty, 'medium');
  for (const id of ids.filter(value => value !== 951)) assert.equal(SUPPORTED[id].difficulty, 'easy');
});

test('257 Binary Tree Paths matches the published examples and backtracks cleanly', () => {
  const problem = SUPPORTED[257];
  assert.deepEqual(problem.builder('1,2,3,null,5').answer, ['1->2->5', '1->3']);
  assert.deepEqual(problem.builder('1').answer, ['1']);
  const run = problem.builder('1,2,3,4,5');
  assert.deepEqual(run.answer, ['1->2->4', '1->2->5', '1->3']);
  const events = new Set(run.steps.map(step => step.treeEssentialsView.event));
  for (const event of ['intro', 'visit', 'save', 'backtrack', 'done']) assert.ok(events.has(event), event);
  assert.deepEqual(run.steps.at(-1).treeEssentialsView.sequences[0].values, []);
});

test('404 Sum of Left Leaves distinguishes left leaves from left internal nodes and right leaves', () => {
  const problem = SUPPORTED[404];
  assert.equal(problem.builder('3,9,20,null,null,15,7').answer, 24);
  assert.equal(problem.builder('1').answer, 0);
  assert.equal(problem.builder('1,2,3,4,null,5,6').answer, 9);
  const run = problem.builder('3,9,20,null,null,15,7');
  assert.ok(run.steps.some(step => step.treeEssentialsView.event === 'add'));
  assert.equal(run.steps.at(-1).treeEssentialsView.cards[0].value, 24);
});

test('617 Merge Two Binary Trees builds the published result in a visible third tree', () => {
  const problem = SUPPORTED[617];
  assert.deepEqual(problem.builder('1,3,2,5', { root2: '2,1,3,null,4,null,7' }).answer, [3, 4, 5, 5, 4, null, 7]);
  assert.deepEqual(problem.builder('1', { root2: '1,2' }).answer, [2, 2]);
  assert.deepEqual(problem.builder('[]', { root2: '4,2,6' }).answer, [4, 2, 6]);
  assert.deepEqual(problem.builder('[]', { root2: '[]' }).answer, []);
  const run = problem.builder('1,3,2,5', { root2: '2,1,3,null,4,null,7' });
  assert.ok(run.steps.every(step => step.treeEssentialsView.panels.length === 3));
  assert.ok(run.steps.some(step => step.treeEssentialsView.event === 'combine' && step.treeEssentialsView.panels[2].tree.nodes.length > 1));
  assert.deepEqual(run.steps.at(-1).treeEssentialsView.cards[0].value, '[3,4,5,5,4,null,7]');
});

test('572 Subtree of Another Tree requires the full shape, not only equal root values', () => {
  const problem = SUPPORTED[572];
  assert.equal(problem.builder('3,4,5,1,2', { subRoot: '4,1,2' }).answer, true);
  assert.equal(problem.builder('3,4,5,1,2,null,null,null,null,0', { subRoot: '4,1,2' }).answer, false);
  assert.equal(problem.builder('1,1', { subRoot: '1' }).answer, true);
  const falseRun = problem.builder('3,4,5,1,2,null,null,null,null,0', { subRoot: '4,1,2' });
  assert.ok(falseRun.steps.some(step => ['shape-mismatch', 'value-mismatch'].includes(step.treeEssentialsView.event)));
  assert.equal(falseRun.steps.at(-1).treeEssentialsView.status, 'mismatch');
});

test('965 Univalued Binary Tree stops on the first different value', () => {
  const problem = SUPPORTED[965];
  assert.equal(problem.builder('1,1,1,1,1,null,1').answer, true);
  const run = problem.builder('2,2,2,5,2');
  assert.equal(run.answer, false);
  assert.equal(run.steps.filter(step => step.treeEssentialsView.event === 'mismatch').length, 1);
  assert.equal(run.steps.at(-1).treeEssentialsView.status, 'mismatch');
});

test('872 Leaf-Similar Trees compares only left-to-right leaf sequences', () => {
  const problem = SUPPORTED[872];
  const first = '3,5,1,6,2,9,8,null,null,7,4';
  const second = '3,5,1,6,7,4,2,null,null,null,null,null,null,9,8';
  assert.equal(problem.builder(first, { root2: second }).answer, true);
  assert.equal(problem.builder('1,2,3', { root2: '1,3,2' }).answer, false);
  const run = problem.builder(first, { root2: second });
  const comparison = run.steps.find(step => step.treeEssentialsView.event === 'compare');
  assert.deepEqual(comparison.treeEssentialsView.sequences[0].values, [6, 7, 4, 9, 8]);
  assert.deepEqual(comparison.treeEssentialsView.sequences[1].values, [6, 7, 4, 9, 8]);
});

test('951 Flip Equivalent Binary Trees handles flips, empty trees, and mismatches', () => {
  const problem = SUPPORTED[951];
  const first = '1,2,3,4,5,6,null,null,null,7,8';
  const second = '1,3,2,null,6,4,5,null,null,null,null,8,7';
  const run = problem.builder(first, { root2: second });
  assert.equal(run.answer, true);
  assert.ok(run.steps.some(step => step.treeEssentialsView.event === 'flip'));
  assert.equal(problem.builder('[]', { root2: '[]' }).answer, true);
  assert.equal(problem.builder('[]', { root2: '1' }).answer, false);
  assert.equal(problem.builder('1,2,3', { root2: '1,2,4' }).answer, false);
});

test('shared tree essentials parser validates bounds and malformed level order', () => {
  assert.throws(() => SUPPORTED[257].builder(''), /non-empty/);
  assert.throws(() => SUPPORTED[965].builder('1,100'), /integers from 0 to 99/);
  assert.throws(() => SUPPORTED[404].builder('1,null,null,2'), /no parent/);
  assert.throws(() => SUPPORTED[257].builder(Array(32).fill(1)), /up to 31/);
});

test('Edit & run code receives real TreeNode arguments for one-tree and two-tree problems', () => {
  const oneTree = prepareGenericLiveArgs(SUPPORTED[257], '1,2,3,null,5', {});
  assert.deepEqual(oneTree, [{ __viz_type: 'binary_tree', values: [1, 2, 3, null, 5], tree_id: 'root' }]);

  const twoTrees = prepareGenericLiveArgs(SUPPORTED[617], '1,3,2,5', { root2: '2,1,3,null,4,null,7' });
  assert.deepEqual(twoTrees, [
    { __viz_type: 'binary_tree', values: [1, 3, 2, 5], tree_id: 'root1' },
    { __viz_type: 'binary_tree', values: [2, 1, 3, null, 4, null, 7], tree_id: 'root2' },
  ]);

  const subtreeTrees = prepareGenericLiveArgs(SUPPORTED[572], '[3,4,5,1,2]', { subRoot: '[4,1,2]' });
  assert.equal(subtreeTrees[0].tree_id, 'root');
  assert.equal(subtreeTrees[1].tree_id, 'subRoot');
  assert.deepEqual(subtreeTrees[1].values, [4, 1, 2]);

  const emptyTrees = prepareGenericLiveArgs(SUPPORTED[951], '[]', { root2: '[]' });
  assert.deepEqual(emptyTrees.map(tree => tree.values), [[], []]);
});

test('shared renderer handles every step for all seven problems in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderTreeEssentialsView(step)');
  const end = script.indexOf('\nfunction renderSortedListBstView(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.treeEssentialsView[\s\S]*renderTreeEssentialsView\(step\)/);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => { elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>'; },
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const id of ids) {
      const problem = SUPPORTED[id];
      const params = Object.fromEntries((problem.extraParams || []).map(param => [param.key, param.default]));
      for (const step of problem.builder(problem.defaultInput, params).steps) {
        context.renderTreeEssentialsView(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, new RegExp(`te-viz te-${step.treeEssentialsView.mode}`));
        assert.match(html, /te-tree-grid/);
        assert.match(html, /te-action/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
});
