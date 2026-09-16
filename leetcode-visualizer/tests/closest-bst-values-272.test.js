const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[272];

function oracle(values, target, k) {
  return [...values]
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)
    .slice(0, k)
    .sort((a, b) => a - b);
}

test('272 is registered as a semantic inorder and two-pointer lesson', () => {
  assert.equal(problem.id, 272);
  assert.equal(problem.slug, 'closest-binary-search-tree-value-ii');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'bst');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.ok(problem.tags.some(tag => tag.key === 'inorder'));
  assert.ok(problem.tags.some(tag => tag.key === 'two-pointer'));
  assert.match(problem.code.join('\n'), /values\[left:right \+ 1\]/);
});

test('272 handles examples, edge targets, k=n, and distance ties', () => {
  assert.deepEqual(problem.builder('4,2,5,1,3', { target: 3.714286, k: 2 }).answer, [3, 4]);
  assert.deepEqual(problem.builder('1', { target: 0, k: 1 }).answer, [1]);
  assert.deepEqual(problem.builder('4,2,6,1,3,5,7', { target: -10, k: 3 }).answer, [1, 2, 3]);
  assert.deepEqual(problem.builder('4,2,6,1,3,5,7', { target: 20, k: 3 }).answer, [5, 6, 7]);
  assert.deepEqual(problem.builder('4,2,6,1,3,5,7', { target: 4, k: 7 }).answer, [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(problem.builder('4,2,6,1,3,5,7', { target: 4, k: 2 }).answer, [3, 4]);
});

test('272 agrees with an independent nearest-values oracle', () => {
  const samples = [
    { input: '8,4,12,2,6,10,14,1,3,5,7,9,11,13,15', values: Array.from({ length: 15 }, (_, index) => index + 1) },
    { input: '0,-4,7,-8,-2,3,12', values: [-8, -4, -2, 0, 3, 7, 12] },
    { input: '20,10,30,5,15,25,40', values: [5, 10, 15, 20, 25, 30, 40] },
  ];
  const targets = [-20, -3.5, 0, 2.5, 7, 11.25, 27.5, 100];
  for (const sample of samples) {
    for (const target of targets) {
      for (const k of [1, 2, Math.min(4, sample.values.length), sample.values.length]) {
        assert.deepEqual(problem.builder(sample.input, { target, k }).answer, oracle(sample.values, target, k), `${sample.input}; target=${target}; k=${k}`);
      }
    }
  }
});

test('272 trace exposes inorder, endpoint comparisons, removals, and one active line per step', () => {
  const run = problem.builder(problem.defaultInput, { target: 3.714286, k: 2 });
  const views = run.steps.map(step => step.closestBst272View);
  for (const operation of ['initialize-values', 'visit-frame', 'go-left', 'append', 'go-right', 'inorder-complete', 'set-left', 'set-right', 'check-window', 'compare-ends', 'remove-left', 'remove-right', 'window-ready', 'return']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.deepEqual(views.find(view => view.operation === 'inorder-complete').values, [1, 2, 3, 4, 5]);
  assert.deepEqual(views.at(-1).answer, [3, 4]);
  assert.equal(run.steps.at(-1).final, true);
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const tie = problem.builder('4,2,6,1,3,5,7', { target: 4, k: 2 });
  assert.ok(tie.steps.some(step => step.closestBst272View.operation === 'compare-ends'
    && step.closestBst272View.leftDistance === step.closestBst272View.rightDistance
    && step.closestBst272View.removeSide === 'right'));
});

test('272 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))',
  ].join('\n');
  const assertions = [
    'assert Solution().closestKValues(root, 3.714286, 2) == [3, 4]',
    'assert Solution().closestKValues(root, 3.5, 2) == [3, 4]',
    'assert Solution().closestKValues(root, -1, 3) == [1, 2, 3]',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('272 custom renderer covers all states in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderClosestBst272View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.closestBst272View[\s\S]*renderClosestBst272View\(step\)/);

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

  const run = problem.builder(problem.defaultInput, { target: 3.714286, k: 2 });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderClosestBst272View(step);
      const html = elementFor('treeView').innerHTML;
      assert.match(html, /cb272-viz/);
      assert.match(html, /cb272-values/);
      assert.match(html, /cb272-compare/);
      assert.match(html, /cb272-window/);
      assert.match(elementFor('cb272Tree').innerHTML, /tree-svg/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
    }
  }
});

test('272 validates inputs and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('', { target: 1, k: 1 }), /non-empty BST/);
  assert.throws(() => problem.builder('4,2,5', { target: 'nope', k: 1 }), /finite number/);
  assert.throws(() => problem.builder('4,2,5', { target: 3, k: 0 }), /positive integer/);
  assert.throws(() => problem.builder('4,2,5', { target: 3, k: 1.5 }), /positive integer/);
  assert.throws(() => problem.builder('4,2,5', { target: 3, k: 4 }), /cannot exceed/);
  assert.throws(() => problem.builder('4,5,2', { target: 3, k: 1 }), /valid BST/);

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cb272-viz \{/);
  assert.match(css, /\.cb272-cell\.removed/);
  assert.match(css, /\.cb272-compare\.remove-left/);
  assert.match(css, /@container \(max-width: 470px\)[\s\S]*\.cb272-result/);
});
