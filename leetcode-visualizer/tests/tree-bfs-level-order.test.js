const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const ids = [107, 515, 513, 662, 117, 1609, 2415, 2471, 2583, 2641];

test('all ten BFS level-order problems are registered with dedicated visualizations', () => {
  const order = CATEGORY_ORDER['binary-tree'].order;
  for (const id of ids) {
    const problem = SUPPORTED[id];
    assert.equal(problem.id, id);
    assert.equal(problem.category.key, 'binary-tree');
    assert.ok(problem.tags.some(tag => tag.key === 'bfs'));
    assert.ok(order.includes(id));
    assert.ok(problem.code.length >= 12);
    const params = Object.fromEntries((problem.extraParams || []).map(param => [param.key, param.default]));
    const run = problem.builder(problem.defaultInput, params);
    assert.ok(run.steps.length >= 4, String(id));
    assert.ok(run.steps.every(step => step.bfsLevelView?.problemId === id), String(id));
    assert.equal(run.steps.at(-1).final, true);
    for (const step of run.steps) {
      assert.ok(Array.isArray(step.tree.nodes));
      assert.ok(Array.isArray(step.bfsLevelView.rows));
      assert.ok(Array.isArray(step.bfsLevelView.queue));
      assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length), `${id}: ${step.codeLines}`);
    }
  }
});

test('107 reverses level order without reversing values inside a level', () => {
  const problem = SUPPORTED[107];
  assert.equal(problem.builder('3,9,20,null,null,15,7').answer, '[[15,7],[9,20],[3]]');
  assert.equal(problem.builder('1').answer, '[[1]]');
  assert.equal(problem.builder('[]').answer, '[]');
  assert.equal(problem.builder('1,2,3,4,null,null,5').answer, '[[4,5],[2,3],[1]]');
});

test('515 and 513 select the correct node from each BFS row', () => {
  assert.equal(SUPPORTED[515].builder('1,3,2,5,3,null,9').answer, '[1,3,9]');
  assert.equal(SUPPORTED[515].builder('-1,-2,-3').answer, '[-1,-2]');
  assert.equal(SUPPORTED[513].builder('2,1,3').answer, 1);
  assert.equal(SUPPORTED[513].builder('1,2,3,4,null,5,6,null,null,7').answer, 7);
});

test('662 counts internal null slots with normalized complete-tree indices', () => {
  assert.equal(SUPPORTED[662].builder('1,3,2,5,3,null,9').answer, 4);
  assert.equal(SUPPORTED[662].builder('1,3,2,5,null,null,9,6,null,7').answer, 7);
  const run = SUPPORTED[662].builder('1,3,2,5,3,null,9');
  const widthFour = run.steps.find(step => step.bfsLevelView.rows.some(row => row.span === 4));
  assert.ok(widthFour);
  assert.match(widthFour.bfsLevelView.formula, /3 − 0 \+ 1 = 4/);
});

test('117 links sparse levels and terminates every chain with null', () => {
  const run = SUPPORTED[117].builder('1,2,3,4,5,null,7');
  assert.deepEqual(run.answer, ['1 → #', '2 → 3 → #', '4 → 5 → 7 → #']);
  assert.ok(run.steps.some(step => step.tree.nodes.some(node => String(node.sub).includes('next → 7'))));
  assert.deepEqual(SUPPORTED[117].builder('[]').answer, []);
});

test('1609 shows both passing rows and the first parity/order violation', () => {
  assert.equal(SUPPORTED[1609].builder('1,10,4,3,null,7,9,12,8,6,null,null,2').answer, true);
  const parityFailure = SUPPORTED[1609].builder('5,4,2,3,3,7');
  assert.equal(parityFailure.answer, false);
  assert.ok(parityFailure.steps.some(step => step.bfsLevelView.event === 'fail'));
  const orderFailure = SUPPORTED[1609].builder('1,2,6,3,5,7,9,12,10,8,6');
  assert.equal(orderFailure.answer, false);
});

test('2415 reverses values on odd levels only', () => {
  assert.deepEqual(SUPPORTED[2415].builder('2,3,5,8,13,21,34').answer, [2, 5, 3, 8, 13, 21, 34]);
  assert.deepEqual(SUPPORTED[2415].builder('7,13,11').answer, [7, 11, 13]);
  const run = SUPPORTED[2415].builder('2,3,5,8,13,21,34');
  const reversed = run.steps.find(step => step.bfsLevelView.event === 'reverse');
  assert.deepEqual(reversed.bfsLevelView.rows.at(-1).before, [3, 5]);
  assert.deepEqual(reversed.bfsLevelView.rows.at(-1).secondary, [5, 3]);
});

test('2471 visualizes each minimum swap and totals independent levels', () => {
  const run = SUPPORTED[2471].builder('1,4,3,7,6,8,5,null,null,null,null,9,null,10');
  assert.equal(run.answer, 3);
  assert.equal(run.steps.filter(step => step.bfsLevelView.event === 'swap').length, 3);
  assert.equal(SUPPORTED[2471].builder('1,2,3,4,5,6').answer, 0);
});

test('2583 ranks all level sums and handles k beyond the tree height', () => {
  assert.equal(SUPPORTED[2583].builder('5,8,9,2,1,3,7,4,6', { k: 2 }).answer, 13);
  assert.equal(SUPPORTED[2583].builder('1,2,null,3', { k: 1 }).answer, 3);
  assert.equal(SUPPORTED[2583].builder('1,2,null,3', { k: 4 }).answer, -1);
  assert.throws(() => SUPPORTED[2583].builder('1', { k: 0 }), /positive integer/);
});

test('2641 subtracts the complete sibling group from each original level total', () => {
  assert.deepEqual(SUPPORTED[2641].builder('5,4,9,1,10,null,7').answer, [0, 0, 0, 7, 7, null, 11]);
  assert.deepEqual(SUPPORTED[2641].builder('3,1,2').answer, [0, 0, 0]);
  const run = SUPPORTED[2641].builder('5,4,9,1,10,null,7');
  assert.ok(run.steps.some(step => step.bfsLevelView.formula === 'new value = 18 − (1 + 10) = 7'));
});

test('Edit & run code gets TreeNode arguments, including Node.next for 117', () => {
  const regular = prepareGenericLiveArgs(SUPPORTED[662], '1,3,2,5,3,null,9', {});
  assert.deepEqual(regular, [{ __viz_type: 'binary_tree', values: [1, 3, 2, 5, 3, null, 9], tree_id: 'root' }]);

  const nextTree = prepareGenericLiveArgs(SUPPORTED[117], '1,2,3,4,5,null,7', {});
  assert.deepEqual(nextTree, [{ __viz_type: 'binary_tree_next', values: [1, 2, 3, 4, 5, null, 7], tree_id: 'root' }]);

  const ranked = prepareGenericLiveArgs(SUPPORTED[2583], '5,8,9', { k: 2 });
  assert.equal(ranked[0].__viz_type, 'binary_tree');
  assert.equal(ranked[1], 2);
});

test('shared level renderer handles every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderBfsLevelView(step)');
  const end = script.indexOf('\nfunction renderTreeEssentialsView(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.bfsLevelView[\s\S]*renderBfsLevelView\(step\)/);

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
        context.renderBfsLevelView(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, new RegExp(`bl-viz bl-${step.bfsLevelView.mode}`));
        assert.match(html, /bl-tree-panel/);
        assert.match(html, /bl-board/);
        assert.match(html, /bl-queue/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
});
