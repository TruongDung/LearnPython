const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[314];

function parseStrictTree(input) {
  const values = String(input).split(',').map(value => {
    const token = value.trim();
    return token === '' || token === 'null' ? null : Number(token);
  });
  if (!values.length || values[0] === null) return null;
  const nodes = values.map(value => value === null ? null : { value, left: null, right: null });
  for (let index = 0; index < nodes.length; index += 1) {
    if (!nodes[index]) continue;
    nodes[index].left = nodes[index * 2 + 1] || null;
    nodes[index].right = nodes[index * 2 + 2] || null;
  }
  return nodes[0];
}

function oracle(input) {
  const root = parseStrictTree(input);
  if (!root) return [];
  const groups = new Map();
  const queue = [{ node: root, col: 0 }];
  let min = 0;
  let max = 0;
  while (queue.length) {
    const { node, col } = queue.shift();
    if (!groups.has(col)) groups.set(col, []);
    groups.get(col).push(node.value);
    min = Math.min(min, col);
    max = Math.max(max, col);
    if (node.left) queue.push({ node: node.left, col: col - 1 });
    if (node.right) queue.push({ node: node.right, col: col + 1 });
  }
  return Array.from({ length: max - min + 1 }, (_, offset) => groups.get(min + offset));
}

test('314 is registered as a semantic BFS column lesson', () => {
  assert.equal(problem.id, 314);
  assert.equal(problem.slug, 'binary-tree-vertical-order-traversal');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.ok(problem.tags.some(tag => tag.key === 'bfs'));
  assert.match(problem.code.join('\n'), /range\(min_col, max_col \+ 1\)/);
});

test('314 handles empty, single, balanced, sparse, negative, and same-position order', () => {
  const cases = [
    ['', []],
    ['7', [[7]]],
    ['3,9,20,4,5,15,7', [[4], [9], [3, 5, 15], [20], [7]]],
    ['3,9,20,null,null,15,7', [[9], [3, 15], [20], [7]]],
    ['0,-1,1,-2,null,null,2', [[-2], [-1], [0], [1], [2]]],
    ['1,2,3,4,6,5,7', [[4], [2], [1, 6, 5], [3], [7]]],
  ];
  for (const [input, expected] of cases) {
    assert.deepEqual(JSON.parse(problem.builder(input).answer), expected, input || '<empty>');
  }
});

test('314 agrees with an independent BFS oracle', () => {
  const inputs = ['3,9,20,4,5,15,7', '1,2,3,null,4,5,null', '8,4,12,2,6,10,14,1,3,5,7'];
  for (const input of inputs) {
    assert.deepEqual(JSON.parse(problem.builder(input).answer), oracle(input), input);
  }
});

test('314 trace exposes every BFS action one code line at a time', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.verticalOrder314View);
  for (const operation of ['check-root', 'initialize-columns', 'initialize-queue', 'initialize-bounds', 'while-check', 'dequeue', 'append-column', 'update-min', 'update-max', 'check-left', 'enqueue-left', 'check-right', 'enqueue-right', 'while-stop', 'return']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.deepEqual(views.at(-1).result, [[4], [9], [3, 5, 15], [20], [7]]);
  assert.equal(run.steps.at(-1).final, true);
});

test('314 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'root = TreeNode(3, TreeNode(9, TreeNode(4), TreeNode(5)), TreeNode(20, TreeNode(15), TreeNode(7)))',
  ].join('\n');
  const assertions = [
    'assert Solution().verticalOrder(root) == [[4], [9], [3, 5, 15], [20], [7]]',
    'assert Solution().verticalOrder(TreeNode(1)) == [[1]]',
    'assert Solution().verticalOrder(None) == []',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('314 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderVerticalOrder314View(step)');
  const end = source.indexOf('\nfunction renderUpsideDown156View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.verticalOrder314View[\s\S]*renderVerticalOrder314View\(step\)/);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en', $: elementFor,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => { elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>'; },
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [problem.builder(problem.defaultInput), problem.builder('')]) {
      for (const step of run.steps) {
        context.renderVerticalOrder314View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /vo314-viz/);
        assert.match(html, /vo314-queue/);
        assert.match(html, /vo314-columns/);
        assert.match(html, /vo314-result/);
        assert.match(elementFor('vo314Tree').innerHTML, /tree-svg/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('314 validates values and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('1,nope,3'), /finite number/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.vo314-viz \{/);
  assert.match(css, /\.vo314-tree \.tree-annotation\.column/);
  assert.match(css, /\.vo314-columns article\.active/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.vo314-result/);
});
