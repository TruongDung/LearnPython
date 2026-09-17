const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[510];

function oracle(values, p) {
  const candidates = values.filter(value => value > p);
  return candidates.length ? Math.min(...candidates) : 'null';
}

test('510 is registered as a semantic parent-pointer BST lesson', () => {
  assert.equal(problem.id, 510);
  assert.equal(problem.slug, 'inorder-successor-in-bst-ii');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'bst');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'parent-pointer'));
  assert.match(problem.code.join('\n'), /while node\.parent/);
});

test('510 handles right-subtree, parent-climb, root, and no-successor cases', () => {
  const input = '5,3,6,2,4,null,null,1';
  assert.equal(problem.builder(input, { p: 3 }).answer, 4);
  assert.equal(problem.builder(input, { p: 4 }).answer, 5);
  assert.equal(problem.builder(input, { p: 5 }).answer, 6);
  assert.equal(problem.builder(input, { p: 6 }).answer, 'null');
  assert.equal(problem.builder('2,1,3', { p: 1 }).answer, 2);
  assert.equal(problem.builder('1', { p: 1 }).answer, 'null');
});

test('510 agrees with an independent inorder oracle', () => {
  const samples = [
    { input: '8,4,12,2,6,10,14,1,3,5,7,9,11,13,15', values: Array.from({ length: 15 }, (_, index) => index + 1) },
    { input: '0,-4,7,-8,-2,3,12', values: [-8, -4, -2, 0, 3, 7, 12] },
    { input: '20,10,30,5,15,25,40', values: [5, 10, 15, 20, 25, 30, 40] },
  ];
  for (const sample of samples) {
    for (const p of sample.values) {
      assert.equal(problem.builder(sample.input, { p }).answer, oracle(sample.values, p), `${sample.input}; p=${p}`);
    }
  }
});

test('510 trace exposes both algorithm cases and a final state', () => {
  const right = problem.builder('8,4,12,2,6,10,14,1,3,5,7,9,11,13,15', { p: 4 });
  const rightViews = right.steps.map(step => step.inorderSuccessor510View);
  for (const operation of ['initialize', 'set-node', 'check-right', 'move-right', 'check-left', 'move-left', 'found-right', 'return']) {
    assert.ok(rightViews.some(view => view.operation === operation), operation);
  }
  assert.equal(rightViews.at(-1).answer, 5);

  const climb = problem.builder('5,3,6,2,4,null,null,1', { p: 4 });
  const climbViews = climb.steps.map(step => step.inorderSuccessor510View);
  for (const operation of ['check-parent', 'climb-up', 'found-parent']) {
    assert.ok(climbViews.some(view => view.operation === operation), operation);
  }
  assert.deepEqual(climbViews.at(-1).visited.map(item => item.value), [4, 3, 5]);
  assert.equal(climbViews.at(-1).answer, 5);

  const noSuccessor = problem.builder('5,3,6,2,4,null,null,1', { p: 6 });
  assert.ok(noSuccessor.steps.some(step => step.inorderSuccessor510View.operation === 'no-successor'));
  assert.equal(noSuccessor.steps.at(-1).inorderSuccessor510View.answer, null);
  assert.equal(noSuccessor.steps.at(-1).final, true);
  assert.ok(climb.steps.every(step => step.codeLines.length === 1));
  assert.ok(climb.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
});

test('510 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None, parent=None):',
    '        self.val, self.left, self.right, self.parent = val, left, right, parent',
    'n1 = TreeNode(1)',
    'n2 = TreeNode(2, n1, None)',
    'n3 = TreeNode(3, n2, None)',
    'n4 = TreeNode(4)',
    'n5 = TreeNode(5, n3, n4)',
    'n1.parent, n2.parent, n3.parent, n4.parent = n2, n3, n5, n5',
  ].join('\n');
  const assertions = [
    'assert Solution().inorderSuccessor(n3).val == 5',
    'assert Solution().inorderSuccessor(n4) is None',
    'assert Solution().inorderSuccessor(n1).val == 2',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('510 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderInorderSuccessor510View(step)');
  const end = source.indexOf('\nfunction renderClosestBst272View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.inorderSuccessor510View[\s\S]*renderInorderSuccessor510View\(step\)/);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '', classList: { add() {}, remove() {} } });
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
  vm.runInContext(source.slice(start, end), context);

  const runs = [
    problem.builder(problem.defaultInput, { p: 3 }),
    problem.builder(problem.defaultInput, { p: 6 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderInorderSuccessor510View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /is510-viz/);
        assert.match(html, /is510-cases/);
        assert.match(html, /is510-pointer/);
        assert.match(elementFor('is510Tree').innerHTML, /tree-svg/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('510 validates input and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('', { p: 1 }), /non-empty BST/);
  assert.throws(() => problem.builder('5,3,6', { p: 'bad' }), /finite number/);
  assert.throws(() => problem.builder('5,3,6', { p: 4 }), /exists in the BST/);
  assert.throws(() => problem.builder('5,6,3', { p: 5 }), /valid BST/);

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.is510-viz \{/);
  assert.match(css, /\.is510-cases/);
  assert.match(css, /\.is510-tree \.tree-annotation\.parent/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.is510-result/);
});
