const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[1457];

function parseCompactTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null) {
      node.left = { val: values[index], left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < values.length && values[index] !== null) {
      node.right = { val: values[index], left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  return root;
}

function serializeCompact(root) {
  if (!root) return [];
  const values = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      values.push(null);
      continue;
    }
    values.push(node.val);
    queue.push(node.left, node.right);
  }
  while (values.at(-1) === null) values.pop();
  return values;
}

function bruteCount(values) {
  const root = parseCompactTree(values);
  let answer = 0;
  const counts = Array(10).fill(0);
  function dfs(node) {
    if (!node) return;
    counts[node.val] += 1;
    if (!node.left && !node.right) {
      const odd = counts.slice(1).filter(count => count % 2 === 1).length;
      if (odd <= 1) answer += 1;
    } else {
      dfs(node.left);
      dfs(node.right);
    }
    counts[node.val] -= 1;
  }
  dfs(root);
  return answer;
}

test('1457 is registered as the DFS + bitmask parity lesson', () => {
  assert.equal(problem.id, 1457);
  assert.equal(problem.slug, 'pseudo-palindromic-paths-in-a-binary-tree');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs', 'bitmask']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /mask \^= 1 << node\.val/);
  assert.match(problem.code.join('\n'), /mask & \(mask - 1\) == 0/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(988) + 1], 1457);
});

test('1457 matches the published examples and edge cases', () => {
  const cases = [
    ['2,3,1,3,1,null,1', 2],
    ['2,1,1,1,3,null,null,null,null,null,1', 1],
    ['9', 1],
    ['1,2', 0],
    ['[]', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).pseudoPalindrome1457View.returnValue, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('1457 agrees with an independent frequency-count oracle on deterministic random trees', () => {
  let seed = 1457;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 150; trial += 1) {
    const root = { val: 1 + random(9), left: null, right: null, depth: 1 };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(20);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      if (node.depth >= 7) continue;
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 38) continue;
        const child = { val: 1 + random(9), left: null, right: null, depth: node.depth + 1 };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteCount(values), input);
  }
});

test('1457 trace explains toggles, odd digits, leaf decisions, and subtree totals', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.pseudoPalindrome1457View);
  assert.equal(run.answer, 2);
  assert.ok(views.every(view => view?.problemId === 1457));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'enter', 'toggle-bit', 'inspect-parity', 'check-leaf', 'call-left', 'leaf-pass', 'leaf-fail', 'left-return', 'call-right', 'right-return', 'combine', 'done']) {
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }
  assert.ok(views.some(view => view.event === 'return-zero'));

  const final = views.at(-1);
  assert.deepEqual(final.leaves.map(leaf => ({ path: leaf.path, valid: leaf.valid, odd: leaf.oddDigits, palindrome: leaf.palindrome })), [
    { path: [2, 3, 3], valid: true, odd: [2], palindrome: '323' },
    { path: [2, 3, 1], valid: false, odd: [1, 2, 3], palindrome: null },
    { path: [2, 1, 1], valid: true, odd: [2], palindrome: '121' },
  ]);
  assert.equal(final.leaves[0].mask, 4);
  assert.equal(final.leaves[0].mask & (final.leaves[0].mask - 1), 0);
  assert.equal(final.leaves[1].mask, 14);
  assert.equal(final.leaves[1].mask & (final.leaves[1].mask - 1), 12);
  assert.equal(final.acceptedTotal, 2);
  assert.deepEqual(final.path, []);
  assert.deepEqual(final.stack, []);
});

test('1457 validates digit range, compact tree shape, size, and live tree input', () => {
  assert.throws(() => problem.builder('1,0'), /integers from 1 to 9/);
  assert.throws(() => problem.builder('1,10'), /integers from 1 to 9/);
  assert.throws(() => problem.builder('1,2.5'), /integers from 1 to 9/);
  assert.throws(() => problem.builder('1,null,null,2'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, {}), [{
    __viz_type: 'binary_tree',
    values: [2, 3, 1, 3, 1, null, 1],
    tree_id: 'root',
  }]);
});

test('1457 custom renderer remains complete in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderPseudoPalindrome1457View(step)');
  const end = script.indexOf('\nfunction renderTreeEssentialsView(step)', start);
  assert.ok(start >= 0 && end > start);

  const elements = new Map();
  const elementFor = id => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const treeTargets = [];
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => {
      treeTargets.push(targetId);
      elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>';
    },
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [problem.builder(problem.defaultInput), problem.builder('1,2'), problem.builder('[]')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderPseudoPalindrome1457View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /pp1457-viz/);
        assert.match(html, /pp1457-parity/);
        assert.match(html, /pp1457-test/);
        assert.match(html, /pp1457-leaves/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'pp1457Tree'));
  assert.match(styles, /\.pp1457-layout/);
  assert.match(styles, /@container \(max-width: 760px\) \{ \.pp1457-layout/);
  assert.match(script, /else if \(step\.pseudoPalindrome1457View\)/);
});
