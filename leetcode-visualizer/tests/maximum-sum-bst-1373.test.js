const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const problem = SUPPORTED[1373];

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
    if (!node) return { bst: true, min: Infinity, max: -Infinity, sum: 0 };
    const left = dfs(node.left);
    const right = dfs(node.right);
    if (left.bst && right.bst && left.max < node.value && node.value < right.min) {
      const sum = left.sum + node.value + right.sum;
      best = Math.max(best, sum);
      return {
        bst: true,
        min: Math.min(left.min, node.value),
        max: Math.max(right.max, node.value),
        sum,
      };
    }
    return { bst: false, min: -Infinity, max: Infinity, sum: 0 };
  }
  dfs(root);
  return best;
}

test('1373 is registered as a postorder BST-state lesson', () => {
  assert.equal(problem.id, 1373);
  assert.equal(problem.slug, 'maximum-sum-bst-in-binary-tree');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'bst'));
  assert.ok(problem.tags.some(tag => tag.key === 'tree-dp'));
  assert.match(problem.code.join('\n'), /left_max < node\.val < right_min/);
  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(979) + 1], 1373);
});

test('1373 handles official examples and representative boundaries', () => {
  const cases = [
    ['1,4,3,2,4,2,5,null,null,null,null,null,null,4,6', 20],
    ['4,3,null,1,2', 2],
    ['-4,-2,-5', 0],
    ['2,1,3', 6],
    ['5,4,8,3,null,6,3', 7],
    ['1', 1],
    ['2,2,3', 3],
    ['[]', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).maximumSumBst1373View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('1373 agrees with an independent oracle on deterministic trees', () => {
  let seed = 1373;
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

test('1373 trace exposes child states, strict bounds, updates, invalidation, and final answer', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.maximumSumBst1373View);
  for (const operation of ['start', 'enter', 'combine', 'valid', 'update-best', 'keep-best', 'return-bst', 'invalid', 'return-invalid', 'done']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));
  assert.ok(views.every(view => view.nodes.length === 9));
  assert.ok(views.every(view => JSON.stringify(view).includes('Infinity') === false));

  const winningUpdate = views.find(view => view.operation === 'update-best' && view.formula?.candidateSum === 20);
  assert.ok(winningUpdate);
  assert.equal(winningUpdate.formula.valid, true);
  assert.equal(winningUpdate.formula.bestAfter, 20);
  assert.equal(winningUpdate.bestSubtreeIds.length, 5);
  assert.equal(views.at(-1).best, 20);
});

test('1373 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
  ].join('\n');
  const assertions = [
    'assert Solution().maxSumBST(TreeNode(2, TreeNode(1), TreeNode(3))) == 6',
    'assert Solution().maxSumBST(TreeNode(-4, TreeNode(-2), TreeNode(-5))) == 0',
    'assert Solution().maxSumBST(TreeNode(2, TreeNode(2), TreeNode(3))) == 3',
    'root = TreeNode(5, TreeNode(4, TreeNode(3)), TreeNode(8, TreeNode(6), TreeNode(3)))',
    'assert Solution().maxSumBST(root) == 7',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('1373 validates input values and visualization size', () => {
  assert.equal(problem.builder('[2,1,3]').answer, 6);
  assert.throws(() => problem.builder('1,-40001'), /integers from -40000 to 40000/);
  assert.throws(() => problem.builder('1,40001'), /integers from -40000 to 40000/);
  assert.throws(() => problem.builder('1,2.5'), /integers from -40000 to 40000/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes/);
});

test('1373 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderMaximumSumBst1373View(step)');
  const end = source.indexOf('\nfunction renderMaximumAverage1120View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.maximumSumBst1373View[\s\S]*renderMaximumSumBst1373View\(step\)/);

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
    for (const run of [problem.builder(problem.defaultInput), problem.builder('-4,-2,-5')]) {
      for (const step of run.steps) {
        context.renderMaximumSumBst1373View(step);
        assert.match(element.innerHTML, /mb1373-viz/);
        assert.match(element.innerHTML, /mb1373-tree/);
        assert.match(element.innerHTML, /mb1373-stack/);
        assert.match(element.innerHTML, /mb1373-history/);
        assert.match(element.innerHTML, /mb1373-result/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('1373 includes scoped responsive styles and refreshed assets', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const html = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.match(css, /\.mb1373-viz \{/);
  assert.match(css, /\.mb1373-node\.invalid/);
  assert.match(css, /\.mb1373-node\.best-subtree/);
  assert.match(css, /\.mb1373-formula \.ordering/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.mb1373-result/);
  assert.match(html, /style\.css\?v=20260917-1373-v1/);
  assert.match(html, /script\.js\?v=20260917-1373-v1/);
});
