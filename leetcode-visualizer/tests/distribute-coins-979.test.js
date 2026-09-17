const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[979];

function parseCompactTree(input) {
  const values = String(input).replace(/^\[|\]$/g, '').split(',').map(token => {
    const value = token.trim();
    return value === '' || value.toLowerCase() === 'null' ? null : Number(value);
  });
  if (!values.length || values[0] === null) return null;
  let nextId = 0;
  const root = { id: nextId++, value: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null) {
      node.left = { id: nextId++, value: values[index], left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < values.length && values[index] !== null) {
      node.right = { id: nextId++, value: values[index], left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  return root;
}

function oracle(input) {
  const root = parseCompactTree(input);
  let moves = 0;
  function dfs(node) {
    if (!node) return 0;
    const left = dfs(node.left);
    const right = dfs(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.value + left + right - 1;
  }
  assert.equal(dfs(root), 0);
  return moves;
}

test('979 is registered as a semantic postorder balance lesson', () => {
  assert.equal(problem.id, 979);
  assert.equal(problem.slug, 'distribute-coins-in-binary-tree');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.ok(problem.tags.some(tag => tag.key === 'tree-dp'));
  assert.match(problem.code.join('\n'), /self\.moves \+= abs\(left\) \+ abs\(right\)/);
  assert.match(problem.code.join('\n'), /node\.val \+ left \+ right - 1/);
});

test('979 handles official and representative distributions', () => {
  const cases = [
    ['3,0,0', 2],
    ['0,3,0', 3],
    ['1,0,2', 2],
    ['1,0,0,null,3', 4],
    ['1', 0],
    ['0,0,0,0,0,0,7', 16],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).distributeCoins979View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('979 agrees with an independent balance oracle', () => {
  let seed = 979;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (const size of [1, 3, 7, 15]) {
    for (let caseIndex = 0; caseIndex < 30; caseIndex += 1) {
      const values = Array(size).fill(0);
      for (let coin = 0; coin < size; coin += 1) values[random(size)] += 1;
      const input = values.join(',');
      assert.equal(problem.builder(input).answer, oracle(input), input);
    }
  }
});

test('979 trace separates child balances, edge moves, and returned balance line by line', () => {
  const run = problem.builder('0,3,0');
  const views = run.steps.map(step => step.distributeCoins979View);
  for (const operation of ['initialize', 'call-root', 'enter', 'check-null', 'return-null', 'call-left', 'left-return', 'call-right', 'right-return', 'add-moves', 'return-balance', 'root-return', 'return-answer']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const leftReturn = views.find(view => view.operation === 'left-return' && view.returnBalance === 2);
  assert.ok(leftReturn, 'left subtree should return two surplus coins');
  const rootMove = views.find(view => view.operation === 'add-moves' && view.formula?.movesAdded === 3);
  assert.deepEqual(
    { left: rootMove.formula.leftBalance, right: rootMove.formula.rightBalance, added: rootMove.formula.movesAdded },
    { left: 2, right: -1, added: 3 },
  );
  assert.equal(views.at(-1).history.at(-1).balance, 0);
  assert.equal(views.at(-1).moves, 3);
});

test('979 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
  ].join('\n');
  const assertions = [
    's = Solution()',
    'assert s.distributeCoins(TreeNode(3, TreeNode(0), TreeNode(0))) == 2',
    'assert Solution().distributeCoins(TreeNode(0, TreeNode(3), TreeNode(0))) == 3',
    'assert Solution().distributeCoins(TreeNode(1)) == 0',
    'assert Solution().distributeCoins(TreeNode(1, TreeNode(0, None, TreeNode(3)), TreeNode(0))) == 4',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('979 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderDistributeCoins979View(step)');
  const end = source.indexOf('\nfunction renderMaximumAverage1120View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.distributeCoins979View[\s\S]*renderDistributeCoins979View\(step\)/);

  const element = { innerHTML: '' };
  const context = {
    lang: 'en', $: () => element,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of problem.builder('0,3,0').steps) {
      context.renderDistributeCoins979View(step);
      assert.match(element.innerHTML, /dc979-viz/);
      assert.match(element.innerHTML, /dc979-tree/);
      assert.match(element.innerHTML, /dc979-stack/);
      assert.match(element.innerHTML, /dc979-history/);
      assert.match(element.innerHTML, /dc979-result/);
      assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
    }
  }
});

test('979 validates coin totals and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('1,0,0'), /Total coins/);
  assert.throws(() => problem.builder('1,-1,3'), /integers from 0/);
  assert.throws(() => problem.builder('1,nope'), /integers from 0/);

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.dc979-viz \{/);
  assert.match(css, /\.dc979-edge\.surplus/);
  assert.match(css, /\.dc979-edge\.deficit/);
  assert.match(css, /\.dc979-formula \.balance-equation/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.dc979-result/);
});
