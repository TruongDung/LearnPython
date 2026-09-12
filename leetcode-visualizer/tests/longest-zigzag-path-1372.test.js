const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[1372];

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

function bruteLongestZigzag(values) {
  const root = parseCompactTree(values);
  let best = 0;
  function walk(node, lastDirection, length) {
    if (!node) return;
    best = Math.max(best, length);
    if (node.left) walk(node.left, 'L', lastDirection === 'R' ? length + 1 : 1);
    if (node.right) walk(node.right, 'R', lastDirection === 'L' ? length + 1 : 1);
  }
  walk(root, null, 0);
  return best;
}

test('1372 is registered as a postorder DFS + Tree DP lesson', () => {
  assert.equal(problem.id, 1372);
  assert.equal(problem.slug, 'longest-zigzag-path-in-a-binary-tree');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs', 'tree-dp']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /return -1, -1/);
  assert.match(problem.code.join('\n'), /go_left = 1 \+ left_r/);
  assert.match(problem.code.join('\n'), /go_right = 1 \+ right_l/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(687) + 1], 1372);
});

test('1372 handles alternating, straight, full, single-node, and empty trees', () => {
  const cases = [
    [problem.defaultInput, 4],
    ['1,2,null,null,3,4,null,null,5', 4],
    ['1,2,null,3,null,4', 1],
    ['1,2,3,4,5,6,7', 2],
    ['1,2,3', 1],
    ['1', 0],
    ['[]', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).zigzag1372View.best, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('1372 agrees with an independent top-down oracle on deterministic random trees', () => {
  let seed = 1372;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 160; trial += 1) {
    const root = { val: 1 + random(100), left: null, right: null, depth: 1 };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(22);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      if (node.depth >= 8) continue;
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 36) continue;
        const child = { val: 1 + random(100), left: null, right: null, depth: node.depth + 1 };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteLongestZigzag(values), input);
  }
});

test('1372 trace exposes the child direction switch, best update, and returned pair', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.zigzag1372View);
  assert.equal(run.answer, 4);
  assert.ok(views.every(view => view?.problemId === 1372));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'enter', 'call-left', 'return-null', 'left-return', 'call-right', 'right-return', 'build-left', 'build-right', 'best-update', 'best-keep', 'return-pair', 'done']) {
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }

  const nullReturn = views.find(view => view.event === 'return-null');
  assert.deepEqual(nullReturn.returnPair, { left: -1, right: -1 });

  const rootLeft = views.find(view => view.event === 'build-left' && view.current?.id === 0);
  assert.deepEqual(rootLeft.leftPair, { left: 0, right: 3 });
  assert.equal(rootLeft.goLeft, 4);
  assert.deepEqual(rootLeft.candidateDirections, ['L', 'R', 'L', 'R']);

  const rootRight = views.find(view => view.event === 'build-right' && view.current?.id === 0);
  assert.deepEqual(rootRight.rightPair, { left: 1, right: 0 });
  assert.equal(rootRight.goRight, 2);

  const rootReturn = views.find(view => view.event === 'return-pair' && view.current?.id === 0);
  assert.deepEqual(rootReturn.returnPair, { left: 4, right: 2 });
  assert.deepEqual(views.at(-1).bestPath, [1, 2, 4, 5, 6]);
  assert.deepEqual(views.at(-1).bestDirections, ['L', 'R', 'L', 'R']);
  assert.equal(views.at(-1).processed.length, 7);
  assert.deepEqual(views.at(-1).path, []);
  assert.deepEqual(views.at(-1).stack, []);
});

test('1372 validates values and compact shape and prepares a live TreeNode', () => {
  assert.throws(() => problem.builder('1,0'), /integers from 1 to 100/);
  assert.throws(() => problem.builder('1,101'), /integers from 1 to 100/);
  assert.throws(() => problem.builder('1,2.5'), /integers from 1 to 100/);
  assert.throws(() => problem.builder('1,null,null,2'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, {}), [{
    __viz_type: 'binary_tree',
    values: [1, 2, 3, null, 4, 7, null, 5, null, null, null, null, 6],
    tree_id: 'root',
  }]);
});

test('1372 custom renderer stays complete in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderLongestZigzag1372View(step)');
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

  const runs = [problem.builder(problem.defaultInput), problem.builder('1,2,3'), problem.builder('[]')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderLongestZigzag1372View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /zz1372-viz/);
        if (!step.final) assert.match(html, /zz1372-choices/);
        if (!step.final) {
          assert.match(html, /go_left = 1 \+ child\.R/);
          assert.match(html, /go_right = 1 \+ child\.L/);
        }
        assert.match(html, /zz1372-processed/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
        if (step.final) assert.match(html, /GLOBAL RESULT|KẾT QUẢ TOÀN CỤC/);
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'zz1372Tree'));
  assert.match(styles, /\.zz1372-layout/);
  assert.match(styles, /@container \(max-width: 520px\)/);
  assert.match(script, /else if \(step\.zigzag1372View\)/);
});
