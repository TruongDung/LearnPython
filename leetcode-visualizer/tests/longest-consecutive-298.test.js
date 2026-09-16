const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[298];

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
  let best = 0;
  function dfs(node, parentValue, length) {
    if (!node) return;
    const nextLength = parentValue !== null && node.value === parentValue + 1 ? length + 1 : 1;
    best = Math.max(best, nextLength);
    dfs(node.left, node.value, nextLength);
    dfs(node.right, node.value, nextLength);
  }
  dfs(root, null, 0);
  return best;
}

test('298 is registered as a semantic top-down DFS lesson', () => {
  assert.equal(problem.id, 298);
  assert.equal(problem.slug, 'binary-tree-longest-consecutive-sequence');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.premium, true);
  assert.equal(problem.category.key, 'binary-tree');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.ok(problem.tags.some(tag => tag.key === 'dfs'));
  assert.match(problem.code.join('\n'), /node\.val == parent_val \+ 1/);
});

test('298 handles empty, single, increasing, broken, negative, and branching trees', () => {
  const cases = [
    ['', 0],
    ['7', 1],
    ['1,2,9,3,8,10,11,4', 4],
    ['2,null,3,null,null,null,4', 3],
    ['-2,-1,5,0', 3],
    ['1,3,2,4,5,3,4', 3],
    ['10,5,11,6,7,12,20,7', 3],
  ];
  for (const [input, expected] of cases) {
    assert.equal(problem.builder(input).answer, expected, input || '<empty>');
  }
});

test('298 agrees with an independent DFS oracle', () => {
  const inputs = [
    '1,2,9,3,8,10,11,4',
    '8,9,2,10,5,3,4,11,12,6,7',
    '0,-1,1,-2,-3,2,8',
    '5,6,6,7,9,7,1,8',
    '20,10,21,11,9,22,23,12',
  ];
  for (const input of inputs) {
    assert.equal(problem.builder(input).answer, oracle(input), input);
  }
});

test('298 trace shows compare, extend, reset, record updates, recursion, and null returns line by line', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.longestConsecutive298View);
  for (const operation of ['initialize', 'start-dfs', 'enter', 'compare', 'extend', 'reset', 'update-longest', 'keep-longest', 'recurse-left', 'recurse-right', 'null-check', 'return-null', 'return']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  assert.deepEqual(views.at(-1).bestChain.map(item => item.value), [1, 2, 3, 4]);
  assert.equal(views.at(-1).answer, 4);
  assert.equal(run.steps.at(-1).final, true);
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const breakStep = views.find(view => view.relation === 'breaks' && view.operation === 'reset');
  assert.ok(breakStep);
  assert.equal(breakStep.currentLength, 1);
  const extendStep = views.find(view => view.relation === 'continues' && view.operation === 'extend');
  assert.ok(extendStep);
  assert.equal(extendStep.currentLength, extendStep.incomingLength + 1);
});

test('298 displayed Python solution passes representative cases', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val, left=None, right=None):',
    '        self.val, self.left, self.right = val, left, right',
    'root = TreeNode(1, TreeNode(2, TreeNode(3, TreeNode(4)), TreeNode(8)), TreeNode(9, TreeNode(10), TreeNode(11)))',
    'broken = TreeNode(5, TreeNode(3), TreeNode(9))',
  ].join('\n');
  const assertions = [
    'assert Solution().longestConsecutive(root) == 4',
    'assert Solution().longestConsecutive(broken) == 1',
    'assert Solution().longestConsecutive(TreeNode(-2, TreeNode(-1, TreeNode(0)))) == 3',
    'assert Solution().longestConsecutive(None) == 0',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('298 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderLongestConsecutive298View(step)');
  const end = source.indexOf('\nfunction renderUpsideDown156View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.longestConsecutive298View[\s\S]*renderLongestConsecutive298View\(step\)/);

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

  const runs = [problem.builder(problem.defaultInput), problem.builder('')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderLongestConsecutive298View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /lc298-viz/);
        assert.match(html, /lc298-relation/);
        assert.match(html, /lc298-chains/);
        assert.match(html, /lc298-stack/);
        assert.match(elementFor('lc298Tree').innerHTML, /tree-svg/);
        assert.doesNotMatch(html, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('298 validates values and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder('1,nope,3'), /finite number/);

  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.lc298-viz \{/);
  assert.match(css, /\.lc298-relation\.continues/);
  assert.match(css, /\.lc298-tree \.tree-annotation\.chain/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.lc298-result/);
});
