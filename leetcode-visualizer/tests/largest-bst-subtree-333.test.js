const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const problem = SUPPORTED[333];

function parseTree(input) {
  const values = String(input).replace(/^\[|\]$/g, '').split(',').map(token => {
    const value = token.trim();
    return value === '' || value.toLowerCase() === 'null' ? null : Number(value);
  });
  if (!values.length || values[0] === null) return null;
  const root = { value: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null) {
      node.left = { value: values[index], left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < values.length && values[index] !== null) {
      node.right = { value: values[index], left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  return root;
}

function oracle(input) {
  const root = parseTree(input);
  let best = 0;
  function dfs(node) {
    if (!node) return { bst: true, min: Infinity, max: -Infinity, size: 0 };
    const left = dfs(node.left);
    const right = dfs(node.right);
    if (left.bst && right.bst && left.max < node.value && node.value < right.min) {
      const size = left.size + 1 + right.size;
      best = Math.max(best, size);
      return { bst: true, min: Math.min(left.min, node.value), max: Math.max(right.max, node.value), size };
    }
    return { bst: false, min: -Infinity, max: Infinity, size: 0 };
  }
  dfs(root);
  return best;
}

test('333 is registered as a postorder BST-state lesson', () => {
  assert.equal(problem.id, 333);
  assert.equal(problem.slug, 'largest-bst-subtree');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'bst'));
  assert.ok(problem.tags.some(tag => tag.key === 'tree-dp'));
  assert.match(problem.code.join('\n'), /left_max < node\.val < right_min/);
  assert.match(problem.code.join('\n'), /nonlocal best/);
  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.ok(order.includes(333));
});

test('333 handles representative trees', () => {
  const cases = [
    ['10,5,15,1,8,null,7', 3],
    ['4,2,6,1,3,5,7', 7],
    ['1', 1],
    ['[]', 0],
    ['2,2,3', 1],
    ['5,4,6,null,null,3', 2],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).largestBst333View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('333 agrees with an independent oracle on deterministic trees', () => {
  let seed = 333;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 180; caseIndex += 1) {
    const size = 1 + random(15);
    const values = Array.from({ length: size }, () => random(31) - 15);
    const input = values.join(',');
    assert.equal(problem.builder(input).answer, oracle(input), input);
  }
});

test('333 trace exposes child states, strict bounds, updates, invalidation, and final answer', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.largestBst333View);
  for (const operation of ['start', 'enter', 'combine', 'valid', 'update-best', 'keep-best', 'return-bst', 'invalid', 'return-invalid', 'done']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));
  assert.ok(views.every(view => view.nodes.length === 6));
  assert.ok(views.every(view => JSON.stringify(view).includes('Infinity') === false));
  const winningUpdate = views.find(view => view.operation === 'update-best' && view.formula?.candidateSize === 3);
  assert.ok(winningUpdate);
  assert.equal(winningUpdate.formula.valid, true);
  assert.equal(winningUpdate.formula.bestAfter, 3);
  assert.equal(winningUpdate.bestSubtreeIds.length, 3);
  assert.equal(views.at(-1).best, 3);
});

test('333 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
  ].join('\n');
  const assertions = [
    'assert Solution().largestBSTSubtree(TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6, TreeNode(5), TreeNode(7)))) == 7',
    'assert Solution().largestBSTSubtree(TreeNode(10, TreeNode(5, TreeNode(1), TreeNode(8)), TreeNode(15, None, TreeNode(7)))) == 3',
    'assert Solution().largestBSTSubtree(TreeNode(2, TreeNode(2), TreeNode(3))) == 1',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('333 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderLargestBst333View(step)');
  const end = source.indexOf('\nfunction renderMaximumAverage1120View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.largestBst333View[\s\S]*renderLargestBst333View\(step\)/);

  const element = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of [problem.builder(problem.defaultInput).steps[0], problem.builder(problem.defaultInput).steps.at(-1)]) {
      context.renderLargestBst333View(step);
      assert.match(element.innerHTML, /lb333-viz/);
      assert.match(element.innerHTML, /lb333-tree/);
      assert.match(element.innerHTML, /lb333-stack/);
      assert.match(element.innerHTML, /lb333-history/);
      assert.match(element.innerHTML, /lb333-result/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('333 includes scoped responsive styles and refreshed assets', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(css, /\.lb333-viz \{/);
  assert.match(css, /\.lb333-node\.invalid/);
  assert.match(css, /\.lb333-node\.best-subtree/);
  assert.match(css, /\.lb333-formula \.ordering/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.lb333-result/);
  assert.match(html, /style\.css\?v=20260917-1373-v1&b=20260917-333-v1/);
  assert.match(html, /script\.js\?v=20260917-1373-v1&b=20260917-333-v1/);
});
