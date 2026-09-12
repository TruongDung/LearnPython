const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[988];

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

function bruteSmallestFromLeaf(values) {
  const root = parseCompactTree(values);
  let best = null;
  function dfs(node, rootToNode) {
    if (!node) return;
    const next = [...rootToNode, String.fromCharCode(97 + node.val)];
    if (!node.left && !node.right) {
      const candidate = [...next].reverse().join('');
      if (best === null || candidate < best) best = candidate;
      return;
    }
    dfs(node.left, next);
    dfs(node.right, next);
  }
  dfs(root, []);
  return best || '';
}

test('988 is registered as a DFS leaf-to-root lexicographic lesson', () => {
  assert.equal(problem.id, 988);
  assert.equal(problem.slug, 'smallest-string-starting-from-leaf');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs']);
  assert.equal(problem.complexity.time, 'O(nh)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /path = chr\(ord\('a'\) \+ node\.val\) \+ path/);
  assert.match(problem.code.join('\n'), /path < best/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(129) + 1], 988);
});

test('988 matches the published examples and small edge cases', () => {
  const cases = [
    ['0,1,2,3,4,3,4', 'dba'],
    ['25,1,3,1,3,0,2', 'adz'],
    ['2,2,1,null,1,0,null,0', 'abc'],
    ['0', 'a'],
    ['25', 'z'],
    ['[]', ''],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).smallestLeaf988View.best ?? '', expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('988 agrees with an independent reverse-at-leaf oracle on deterministic random trees', () => {
  let seed = 988;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 150; trial += 1) {
    const root = { val: random(26), left: null, right: null, depth: 1 };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(24);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      if (node.depth >= 8) continue;
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 36) continue;
        const child = { val: random(26), left: null, right: null, depth: node.depth + 1 };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteSmallestFromLeaf(values), input);
  }
});

test('988 trace makes direction, first differing letter, best update, and traversal explicit', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.smallestLeaf988View);
  assert.equal(run.answer, 'dba');
  assert.ok(run.steps.length > 35);
  assert.ok(views.every(view => view?.problemId === 988));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'enter', 'prepend-letter', 'check-leaf', 'candidate', 'compare', 'update-best', 'keep-best', 'leaf-return', 'call-left', 'call-right', 'done']) {
    if (event === 'candidate') continue;
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }
  assert.ok(problem.builder('0,1').steps.some(step => step.smallestLeaf988View.event === 'return-null'));

  const pathDba = views.find(view => view.event === 'prepend-letter' && view.pathString === 'dba');
  assert.deepEqual(pathDba.rootPath.map(node => node.letter), ['a', 'b', 'd']);

  const compareEba = views.find(view => view.event === 'compare' && view.candidate === 'eba');
  assert.equal(compareEba.previousBest, 'dba');
  assert.equal(compareEba.compareIndex, 0);
  assert.equal(compareEba.decision, 'keep');
  const compareDca = views.find(view => view.event === 'compare' && view.candidate === 'dca');
  assert.equal(compareDca.compareIndex, 1);

  const final = views.at(-1);
  assert.equal(final.best, 'dba');
  assert.deepEqual(final.candidates.map(item => item.candidate), ['dba', 'eba', 'dca', 'eca']);
  assert.deepEqual(final.candidates.filter(item => item.isBest).map(item => item.candidate), ['dba']);
  assert.deepEqual(final.rootPath, []);
  assert.deepEqual(final.stack, []);
  assert.deepEqual(run.steps.at(-1).tree.nodes.filter(node => node.isWord).map(node => node.label).sort(), ['a', 'b', 'd']);
});

test('988 validates the 0 to 25 letter range, compact shape, and visualization size', () => {
  assert.throws(() => problem.builder('0,-1'), /integers from 0 to 25/);
  assert.throws(() => problem.builder('0,26'), /integers from 0 to 25/);
  assert.throws(() => problem.builder('0,1.5'), /integers from 0 to 25/);
  assert.throws(() => problem.builder('0,null,null,1'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, {}), [{
    __viz_type: 'binary_tree',
    values: [0, 1, 2, 3, 4, 3, 4],
    tree_id: 'root',
  }]);
});

test('988 custom renderer stays complete in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderSmallestLeaf988View(step)');
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

  const runs = [problem.builder(problem.defaultInput), problem.builder('0,1'), problem.builder('[]')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderSmallestLeaf988View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /sl988-viz/);
        assert.match(html, /sl988-direction/);
        assert.match(html, /sl988-compare/);
        assert.match(html, /sl988-candidates/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'sl988Tree'));
  assert.match(styles, /\.sl988-layout/);
  assert.match(styles, /@container \(max-width: 760px\) \{ \.sl988-layout/);
  assert.match(script, /else if \(step\.smallestLeaf988View\)/);
});
