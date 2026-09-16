const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[285];

function oracle(values, p) {
  const candidates = values.filter(value => value > p);
  return candidates.length ? Math.min(...candidates) : 'null';
}

test('285 is registered as a semantic one-path BST lesson', () => {
  assert.equal(problem.id, 285);
  assert.equal(problem.slug, 'inorder-successor-in-bst');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'bst');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'binary-search'));
  assert.ok(problem.tags.some(tag => tag.key === 'inorder'));
  assert.match(problem.code.join('\n'), /if node\.val > p\.val/);
});

test('285 handles left, right, root, zero, and no-successor cases', () => {
  assert.equal(problem.builder('5,3,6,2,4,null,null,1', { p: 3 }).answer, 4);
  assert.equal(problem.builder('5,3,6,2,4,null,null,1', { p: 4 }).answer, 5);
  assert.equal(problem.builder('5,3,6,2,4,null,null,1', { p: 5 }).answer, 6);
  assert.equal(problem.builder('5,3,6,2,4,null,null,1', { p: 6 }).answer, 'null');
  assert.equal(problem.builder('0,-2,2,-3,-1,1,3', { p: 0 }).answer, 1);
  assert.equal(problem.builder('1', { p: 1 }).answer, 'null');
});

test('285 agrees with an independent successor oracle', () => {
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

test('285 trace shows comparisons, candidate updates, both moves, stop, and return line by line', () => {
  const run = problem.builder(problem.defaultInput, { p: 3 });
  const views = run.steps.map(step => step.inorderSuccessor285View);
  for (const operation of ['initialize-successor', 'set-node', 'while-check', 'compare', 'update-successor', 'move-left', 'move-right', 'while-stop', 'return']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.deepEqual(views.at(-1).visited.map(item => item.value), [5, 3, 4]);
  assert.equal(views.at(-1).answer, 4);
  assert.equal(run.steps.at(-1).final, true);
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const noSuccessor = problem.builder(problem.defaultInput, { p: 6 });
  assert.equal(noSuccessor.steps.at(-1).inorderSuccessor285View.answer, null);
  assert.equal(noSuccessor.steps.at(-1).final, true);
});

test('285 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'n1 = TreeNode(1)',
    'n2 = TreeNode(2, n1)',
    'n4 = TreeNode(4)',
    'n3 = TreeNode(3, n2, n4)',
    'n6 = TreeNode(6)',
    'root = TreeNode(5, n3, n6)',
  ].join('\n');
  const assertions = [
    'assert Solution().inorderSuccessor(root, n3).val == 4',
    'assert Solution().inorderSuccessor(root, n4).val == 5',
    'assert Solution().inorderSuccessor(root, root).val == 6',
    'assert Solution().inorderSuccessor(root, n6) is None',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('285 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderInorderSuccessor285View(step)');
  const end = source.indexOf('\nfunction renderClosestBst272View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.inorderSuccessor285View[\s\S]*renderInorderSuccessor285View\(step\)/);

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
  vm.runInContext(source.slice(start, end), context);

  const runs = [
    problem.builder(problem.defaultInput, { p: 3 }),
    problem.builder(problem.defaultInput, { p: 6 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderInorderSuccessor285View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /cb285-viz/);
        assert.match(html, /cb285-compare/);
        assert.match(html, /cb285-decision/);
        assert.match(html, /cb285-candidate/);
        assert.match(elementFor('cb285Tree').innerHTML, /tree-svg/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('285 validates input and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('', { p: 1 }), /non-empty BST/);
  assert.throws(() => problem.builder('5,3,6', { p: 'bad' }), /finite number/);
  assert.throws(() => problem.builder('5,3,6', { p: 4 }), /exists in the BST/);
  assert.throws(() => problem.builder('5,6,3', { p: 5 }), /valid BST/);

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cb285-viz \{/);
  assert.match(css, /\.cb285-compare\.valid/);
  assert.match(css, /\.cb285-tree \.tree-annotation\.target/);
  assert.match(css, /@container \(max-width: 470px\)[\s\S]*\.cb285-result/);
});
