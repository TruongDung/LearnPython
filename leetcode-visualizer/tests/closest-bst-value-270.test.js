const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[270];

function oracle(values, target) {
  return values.reduce((best, value) => {
    const candidateKey = [Math.abs(value - target), value];
    const bestKey = [Math.abs(best - target), best];
    return candidateKey[0] < bestKey[0]
      || (candidateKey[0] === bestKey[0] && candidateKey[1] < bestKey[1])
      ? value
      : best;
  });
}

test('270 is registered as a semantic BST search lesson', () => {
  assert.equal(problem.id, 270);
  assert.equal(problem.slug, 'closest-binary-search-tree-value');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.category.key, 'bst');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'binary-search'));
  assert.match(problem.code.join('\n'), /\(abs\(node\.val - target\), node\.val\)/);
});

test('270 handles the published examples and the smaller-value tie-break', () => {
  assert.equal(problem.builder('4,2,5,1,3', { target: 3.714286 }).answer, 4);
  assert.equal(problem.builder('1', { target: 4.428571 }).answer, 1);
  assert.equal(problem.builder('4,2,5,1,3', { target: 3.5 }).answer, 3);
  assert.equal(problem.builder('4,2,5,1,3', { target: 0 }).answer, 1);
  assert.equal(problem.builder('4,2,5,1,3', { target: 6 }).answer, 5);
});

test('270 agrees with an independent nearest-value oracle', () => {
  const cases = [
    { input: '8,4,12,2,6,10,14,1,3,5,7,9,11,13,15', values: Array.from({ length: 15 }, (_, i) => i + 1) },
    { input: '0,-4,7,-8,-2,3,12', values: [-8, -4, -2, 0, 3, 7, 12] },
    { input: '20,10,30,5,15,25,40', values: [5, 10, 15, 20, 25, 30, 40] },
  ];
  const targets = [-10, -3, -1, 0, 2.5, 6.5, 11.25, 16, 27.5, 100];
  for (const sample of cases) {
    for (const target of targets) {
      assert.equal(problem.builder(sample.input, { target }).answer, oracle(sample.values, target), `${sample.input}; target=${target}`);
    }
  }
});

test('270 trace shows each comparison, update, branch, move, and return line', () => {
  const run = problem.builder('4,2,5,1,3', { target: 3.714286 });
  const views = run.steps.map(step => step.closestBst270View);
  for (const operation of ['initialize', 'set-node', 'visit', 'compare', 'choose-branch', 'move', 'return']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.ok(problem.builder('4,2,5,1,3', { target: 2.1 }).steps.some(step => step.closestBst270View.operation === 'update'));
  assert.deepEqual(views.at(-1).visited.map(item => item.value), [4, 2, 3]);
  assert.equal(views.at(-1).answer, 4);
  assert.equal(run.steps.at(-1).final, true);
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const tie = problem.builder('4,2,5,1,3', { target: 3.5 });
  const tieComparison = tie.steps.find(step => step.closestBst270View.tied && step.closestBst270View.operation === 'compare');
  assert.ok(tieComparison);
  assert.equal(tieComparison.closestBst270View.candidateWins, true);
  assert.equal(tie.answer, 3);
});

test('270 displayed and repository Python solutions pass representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(5))',
  ].join('\n');
  const assertions = [
    'assert Solution().closestValue(root, 3.714286) == 4',
    'assert Solution().closestValue(root, 3.5) == 3',
    'assert Solution().closestValue(root, 0) == 1',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const repository = spawnSync('python3', [require.resolve('../../Leetcode-sln/tree/Leetcode_270.py')], { encoding: 'utf8' });
  assert.equal(repository.status, 0, repository.stderr);
});

test('270 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderClosestBst270View(step)');
  const end = source.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.closestBst270View[\s\S]*renderClosestBst270View\(step\)/);

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

  const run = problem.builder(problem.defaultInput, { target: 3.714286 });
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderClosestBst270View(step);
      const html = elementFor('treeView').innerHTML;
      assert.match(html, /cb270-viz/);
      assert.match(html, /cb270-ruler/);
      assert.match(html, /cb270-tree/);
      assert.match(html, /cb270-compare/);
      assert.match(elementFor('cb270Tree').innerHTML, /tree-svg/);
      assert.doesNotMatch(html, /undefined|NaN|Infinity/);
    }
  }
});

test('270 validates input and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('', { target: 1 }), /non-empty BST/);
  assert.throws(() => problem.builder('4,2,5', { target: 'not-a-number' }), /finite number/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.cb270-viz \{/);
  assert.match(css, /\.cb270-ruler-row\.target/);
  assert.match(css, /\.cb270-tree \.tree-node\.word/);
  assert.match(css, /@container \(max-width: 470px\)[\s\S]*\.cb270-result/);
});
