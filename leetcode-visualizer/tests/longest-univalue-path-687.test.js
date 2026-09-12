const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[687];

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

function bruteLongest(values) {
  const root = parseCompactTree(values);
  let best = 0;
  function dfs(node) {
    if (!node) return 0;
    const left = dfs(node.left);
    const right = dfs(node.right);
    const leftArrow = node.left && node.left.val === node.val ? left + 1 : 0;
    const rightArrow = node.right && node.right.val === node.val ? right + 1 : 0;
    best = Math.max(best, leftArrow + rightArrow);
    return Math.max(leftArrow, rightArrow);
  }
  dfs(root);
  return best;
}

test('687 is registered as the postorder DFS + tree DP lesson', () => {
  assert.equal(problem.id, 687);
  assert.equal(problem.slug, 'longest-univalue-path');
  assert.equal(problem.difficulty, 'medium');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['dfs', 'tree-dp']);
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /left_arrow = left \+ 1 if node\.left/);
  assert.match(problem.code.join('\n'), /self\.best = max\(self\.best, left_arrow \+ right_arrow\)/);
  assert.match(problem.code.join('\n'), /return max\(left_arrow, right_arrow\)/);

  const order = CATEGORY_ORDER['binary-tree'].order;
  assert.equal(order[order.indexOf(1457) + 1], 687);
});

test('687 matches the published examples and edge cases', () => {
  const cases = [
    ['5,4,5,1,1,null,5', 2],
    ['1,4,5,4,4,null,5', 2],
    ['1,1,1,1,1,1,1', 4],
    ['7', 0],
    ['1,2', 0],
    ['[]', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).univaluePath687View.best, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('687 agrees with an independent postorder oracle on deterministic random trees', () => {
  let seed = 687;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 150; trial += 1) {
    const root = { val: random(5) - 2, left: null, right: null, depth: 1 };
    const queue = [root];
    let nodeCount = 1;
    const limit = 1 + random(20);
    while (queue.length && nodeCount < limit) {
      const node = queue.shift();
      if (node.depth >= 7) continue;
      for (const side of ['left', 'right']) {
        if (nodeCount >= limit || random(100) < 38) continue;
        const child = { val: random(5) - 2, left: null, right: null, depth: node.depth + 1 };
        node[side] = child;
        queue.push(child);
        nodeCount += 1;
      }
    }
    const values = serializeCompact(root);
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteLongest(values), input);
  }
});

test('687 trace separates raw gains, edge filtering, best update, and one-arm return', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.univaluePath687View);
  assert.equal(run.answer, 2);
  assert.ok(views.every(view => view?.problemId === 687));
  assert.ok(run.steps.every(step => step.codeLines.length <= 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const events = new Set(views.map(view => view.event));
  for (const event of ['rule', 'enter', 'call-left', 'return-zero', 'left-return', 'call-right', 'right-return', 'filter-left', 'filter-right', 'best-update', 'best-keep', 'return-gain', 'done']) {
    assert.ok(events.has(event), `missing trace event: ${event}`);
  }

  const rootFilterLeft = views.find(view => view.event === 'filter-left' && view.current?.value === 5 && view.left?.value === 4);
  assert.equal(rootFilterLeft.leftRaw, 0);
  assert.equal(rootFilterLeft.leftArrow, 0);
  assert.equal(rootFilterLeft.left.match, false);

  const rootFilterRight = views.find(view => view.event === 'filter-right' && view.current?.value === 5 && view.left?.value === 4);
  assert.equal(rootFilterRight.rightRaw, 1);
  assert.equal(rootFilterRight.rightArrow, 2);
  assert.equal(rootFilterRight.right.match, true);

  const rootReturn = views.find(view => view.event === 'return-gain' && view.current?.value === 5 && view.left?.value === 4);
  assert.equal(rootReturn.through, 2);
  assert.equal(rootReturn.returnGain, 2);
  assert.equal(rootReturn.chosenArm, 'right');
  assert.deepEqual(views.at(-1).bestPath, [5, 5, 5]);
  assert.equal(views.at(-1).processed.length, 6);
  assert.deepEqual(views.at(-1).path, []);
  assert.deepEqual(views.at(-1).stack, []);
});

test('687 validates values, compact tree shape, size, and prepares a live TreeNode', () => {
  assert.throws(() => problem.builder('1,1001'), /integers from -1000 to 1000/);
  assert.throws(() => problem.builder('1,-1001'), /integers from -1000 to 1000/);
  assert.throws(() => problem.builder('1,2.5'), /integers from -1000 to 1000/);
  assert.throws(() => problem.builder('1,null,null,2'), /Invalid level-order tree/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /up to 31 nodes per tree/);

  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, {}), [{
    __viz_type: 'binary_tree',
    values: [5, 4, 5, 1, 1, null, 5],
    tree_id: 'root',
  }]);
});

test('687 custom renderer remains complete in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = script.indexOf('function renderUnivaluePath687View(step)');
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
        context.renderUnivaluePath687View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /uv687-viz/);
        assert.match(html, /uv687-gates/);
        assert.match(html, /uv687-through/);
        assert.match(html, /uv687-return/);
        assert.match(html, /uv687-processed/);
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
        if (step.final) {
          assert.match(html, /GLOBAL BEST PATH|PATH TỐT NHẤT TOÀN CỤC/);
          assert.match(html, /root return =/);
          assert.doesNotMatch(html, /not returned yet|chưa return/);
        }
      }
    }
  }
  assert.ok(treeTargets.every(targetId => targetId === 'uv687Tree'));
  assert.match(styles, /\.uv687-layout/);
  assert.match(styles, /@container \(max-width: 760px\)/);
  assert.match(script, /else if \(step\.univaluePath687View\)/);
});
