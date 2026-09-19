const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');
const { prepareGenericLiveArgs } = require('../live-args');

const problem = SUPPORTED[2096];

// BFS level-order parser, matching parseTreeEssentialsInput rather than the
// index-based variant: "5,1,2,3,null,6,4" must put 6 and 4 under node 2.
function parseCompactTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null && values[index] !== undefined) {
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

// Independent oracle: walk the tree as an undirected graph with a parent map
// and BFS from start to dest, recording the move made on each edge. This is a
// different derivation from the builder's two-root-paths-plus-shared-prefix.
function oracleDirections(values, startValue, destValue) {
  const root = parseCompactTree(values);
  const parent = new Map();
  const byValue = new Map();
  (function walk(node, up) {
    if (!node) return;
    parent.set(node.val, up);
    byValue.set(node.val, node);
    walk(node.left, node);
    walk(node.right, node);
  })(root, null);

  const queue = [[startValue, '']];
  const seen = new Set([startValue]);
  while (queue.length) {
    const [value, route] = queue.shift();
    if (value === destValue) return route;
    const node = byValue.get(value);
    const up = parent.get(value);
    const moves = [];
    if (up) moves.push([up.val, 'U']);
    if (node.left) moves.push([node.left.val, 'L']);
    if (node.right) moves.push([node.right.val, 'R']);
    for (const [next, letter] of moves) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([next, route + letter]);
    }
  }
  throw new Error('oracle found no route');
}

function build(tree, startValue, destValue) {
  return problem.builder(tree, { startValue, destValue });
}

test('2096 is registered in the binary-tree catalog with the Google roster link', () => {
  assert.equal(problem.id, 2096);
  assert.equal(problem.slug, 'step-by-step-directions-from-a-binary-tree-node-to-another');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'binary-tree');
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['dfs', 'lowest-common-ancestor', 'string']);
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  // index.js attaches this from the Google roster once SUPPORTED[2096] exists.
  assert.deepEqual(problem.companies, ['google']);
  // The learning order must list it next to the other LCA problems.
  const order = require('../problems').CATEGORY_ORDER['binary-tree'].order;
  assert.ok(order.includes(2096));
  assert.equal(order[order.indexOf(2096) - 1], 1676);

  const code = problem.code.join('\n');
  assert.match(code, /def getDirections\(self, root, startValue: int, destValue: int\) -> str:/);
  // The empty-list-is-falsy trap must be handled with an identity check.
  assert.match(code, /if left is not None:/);
  assert.match(code, /if right is not None:/);
  assert.doesNotMatch(code, /if left:|if right:/);
  assert.match(code, /return "U" \* \(len\(start_path\) - common\) \+ ""\.join\(dest_path\[common:\]\)/);
});

test('2096 matches the published examples and the ancestor edge cases', () => {
  const cases = [
    // LeetCode example 1: LCA is the root, so the U's come first.
    ['5,1,2,3,null,6,4', 3, 6, 'UURL'],
    // LeetCode example 2: start is the parent of dest, so there is no U.
    ['2,1', 2, 1, 'L'],
    // dest is an ancestor of start: the answer is nothing but U's.
    ['1,2,3,4,5', 4, 1, 'UU'],
    // Sibling leaves: one step up, one step down.
    ['1,2,3,4,5', 4, 5, 'UR'],
    // Deep left leaf to deep right leaf, crossing the root.
    ['1,2,3,4,null,null,7', 4, 7, 'UURR'],
  ];
  for (const [tree, startValue, destValue, expected] of cases) {
    const run = build(tree, startValue, destValue);
    assert.equal(run.answer, expected, `${tree}: ${startValue} -> ${destValue}`);
    assert.equal(run.steps.at(-1).directions2096View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
  }
});

test('2096 agrees with an independent BFS-on-parent-map oracle', () => {
  let seed = 2096;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };

  for (let trial = 0; trial < 160; trial += 1) {
    const count = 2 + random(18);
    const nodes = Array.from({ length: count }, (_unused, index) => ({ val: index + 1, left: null, right: null }));
    const slots = [
      { parent: nodes[0], side: 'left' },
      { parent: nodes[0], side: 'right' },
    ];
    for (let index = 1; index < nodes.length; index += 1) {
      const [{ parent, side }] = slots.splice(random(slots.length), 1);
      parent[side] = nodes[index];
      slots.push({ parent: nodes[index], side: 'left' }, { parent: nodes[index], side: 'right' });
    }
    const values = serializeCompact(nodes[0]);
    const first = random(nodes.length);
    let second = random(nodes.length - 1);
    if (second >= first) second += 1;
    const startValue = nodes[first].val;
    const destValue = nodes[second].val;
    const tree = values.map((value) => (value === null ? 'null' : value)).join(',');
    assert.equal(
      build(tree, startValue, destValue).answer,
      oracleDirections(values, startValue, destValue),
      `${tree}; start=${startValue}; dest=${destValue}`,
    );
  }
});

test('2096 answer is always a shortest route made only of U, L and R', () => {
  let seed = 7;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 120; trial += 1) {
    const count = 2 + random(14);
    const nodes = Array.from({ length: count }, (_unused, index) => ({ val: index + 1, left: null, right: null }));
    const slots = [{ parent: nodes[0], side: 'left' }, { parent: nodes[0], side: 'right' }];
    for (let index = 1; index < nodes.length; index += 1) {
      const [{ parent, side }] = slots.splice(random(slots.length), 1);
      parent[side] = nodes[index];
      slots.push({ parent: nodes[index], side: 'left' }, { parent: nodes[index], side: 'right' });
    }
    const values = serializeCompact(nodes[0]);
    const first = random(nodes.length);
    let second = random(nodes.length - 1);
    if (second >= first) second += 1;
    const tree = values.map((value) => (value === null ? 'null' : value)).join(',');
    const run = build(tree, nodes[first].val, nodes[second].val);
    assert.match(run.answer, /^[ULR]*$/, run.answer);
    // All U's must precede every L/R: the route climbs to the LCA, then descends.
    assert.doesNotMatch(run.answer, /[LR]U/, `U after a descent: ${run.answer}`);
    assert.equal(run.answer.length, oracleDirections(values, nodes[first].val, nodes[second].val).length);
  }
});

test('2096 trace walks both searches, the prefix loop, and the assembly', () => {
  const run = build('5,1,2,3,null,6,4', 3, 6);
  const views = run.steps.map((step) => step.directions2096View);
  assert.ok(views.every((view) => view?.problemId === 2096));
  assert.ok(run.steps.every((step) => step.codeLines.length <= 1));
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
  // Every step carries a full tree payload so renderTree can always draw.
  assert.ok(run.steps.every((step) => step.tree && step.tree.nodes.length === 6));

  // Stages advance monotonically: start search, dest search, prefix, assembly.
  const stagesSeen = [...new Set(views.map((view) => view.stage))];
  assert.deepEqual(stagesSeen, [0, 1, 2, 3]);

  // The start search must finish before the dest search begins.
  const startDone = views.findIndex((view) => view.event === 'start-path');
  const destDone = views.findIndex((view) => view.event === 'dest-path');
  assert.ok(startDone > 0 && destDone > startDone);
  assert.deepEqual(views[startDone].startPath, ['L', 'L']);
  assert.equal(views[startDone].destPath, null, 'dest_path must still be unknown');
  assert.deepEqual(views[destDone].destPath, ['R', 'L']);
  assert.equal(views[startDone].codeLines === undefined, true);
  assert.equal(run.steps[startDone].codeLines[0], 14);
  assert.equal(run.steps[destDone].codeLines[0], 15);

  // 'L' vs 'R' at index 0, so the prefix is empty and the LCA is the root.
  const split = views.find((view) => view.event === 'compare-stop');
  assert.equal(split.compareIndex, 0);
  assert.equal(split.compareResult, false);
  assert.equal(views.at(-1).common, 0);
  assert.equal(views.at(-1).lca.value, 5);
  assert.equal(views.at(-1).upCount, 2);
  assert.deepEqual(views.at(-1).downLetters, ['R', 'L']);

  // The recursion must record the falsy-empty-list return and the dead ends.
  assert.ok(views.some((view) => view.event === 'return-empty'));
  assert.ok(views.some((view) => view.event === 'return-none'));
  assert.ok(views.some((view) => view.event === 'dead-end'));
  assert.ok(views.some((view) => view.stack.length >= 3), 'the call stack must actually grow');
  assert.equal(views.at(-1).stack.length, 0, 'every frame must be popped by the end');
});

test('2096 advances the shared prefix step by step when the LCA is deeper', () => {
  // start=4, dest=5 under parent 2: both paths begin with "L", so common hits 1.
  const run = build('1,2,3,4,5', 4, 5);
  const views = run.steps.map((step) => step.directions2096View);
  assert.equal(run.answer, 'UR');
  assert.deepEqual(views.at(-1).startPath, ['L', 'L']);
  assert.deepEqual(views.at(-1).destPath, ['L', 'R']);
  assert.equal(views.at(-1).common, 1);
  assert.equal(views.at(-1).lca.value, 2, 'the LCA is the shared parent, not the root');
  assert.equal(views.at(-1).upCount, 1);
  assert.deepEqual(views.at(-1).downLetters, ['R']);

  const advances = views.filter((view) => view.event === 'common-advance');
  assert.equal(advances.length, 1);
  assert.equal(advances[0].common, 1);
  assert.equal(advances[0].lca.value, 2);
  assert.equal(run.steps[views.indexOf(advances[0])].codeLines[0], 18);
  assert.ok(views.some((view) => view.event === 'compare-same'));
});

test('2096 stops the prefix loop when one path is a prefix of the other', () => {
  // dest is an ancestor of start, so dest_path runs out first.
  const run = build('1,2,3,4,5', 4, 1);
  const views = run.steps.map((step) => step.directions2096View);
  assert.equal(run.answer, 'UU');
  assert.deepEqual(views.at(-1).startPath, ['L', 'L']);
  assert.deepEqual(views.at(-1).destPath, []);
  assert.equal(views.at(-1).common, 0);
  assert.equal(views.at(-1).lca.value, 1);
  assert.equal(views.at(-1).upCount, 2);
  assert.deepEqual(views.at(-1).downLetters, []);
  // The loop must stop on the range guard, not on a letter mismatch.
  const stop = views.find((view) => view.event === 'compare-stop');
  assert.equal(stop.compareResult, false);
  assert.equal(stop.compareIndex, 0);
});

test('2096 validates the LeetCode guarantees and binds live tree arguments', () => {
  assert.throws(() => build('1,1,2', 1, 2), /values must be unique/);
  assert.throws(() => build('1,2,3', 2, 9), /must exist in the tree/);
  assert.throws(() => build('1,2,3', 2, 2), /must be different nodes/);
  assert.throws(() => build('1,2,3', 'x', 2), /must be integers/);
  assert.throws(() => build('', 1, 2), /non-empty binary tree/);
  assert.throws(() => build('1,null,null,2', 1, 2), /Invalid level-order tree/);
  assert.throws(() => build('0,1,2', 1, 2), /integers from 1 to 100000/);
  assert.throws(
    () => build(Array.from({ length: 32 }, (_unused, index) => index + 1).join(','), 1, 2),
    /up to 31 nodes per tree/,
  );

  // startValue/destValue are plain ints on LeetCode, not TreeNode references.
  assert.deepEqual(prepareGenericLiveArgs(problem, problem.defaultInput, { startValue: 3, destValue: 6 }), [
    { __viz_type: 'binary_tree', values: [5, 1, 2, 3, null, 6, 4], tree_id: 'root' },
    3,
    6,
  ]);
});

test('2096 displayed Python and the solution file agree with the visualizer', () => {
  const prelude = [
    'class TreeNode:',
    '    def __init__(self, val=0, left=None, right=None):',
    '        self.val = val',
    '        self.left = left',
    '        self.right = right',
    '',
    'def build(values):',
    '    if not values or values[0] is None:',
    '        return None',
    '    root = TreeNode(values[0])',
    '    queue = [root]',
    '    head = 0',
    '    index = 1',
    '    while head < len(queue) and index < len(values):',
    '        node = queue[head]',
    '        head += 1',
    '        if index < len(values) and values[index] is not None:',
    '            node.left = TreeNode(values[index])',
    '            queue.append(node.left)',
    '        index += 1',
    '        if index < len(values) and values[index] is not None:',
    '            node.right = TreeNode(values[index])',
    '            queue.append(node.right)',
    '        index += 1',
    '    return root',
    '',
  ].join('\n');
  const assertions = [
    'assert Solution().getDirections(build([5,1,2,3,None,6,4]), 3, 6) == "UURL"',
    'assert Solution().getDirections(build([2,1]), 2, 1) == "L"',
    'assert Solution().getDirections(build([1,2,3,4,5]), 4, 1) == "UU"',
    'assert Solution().getDirections(build([1,2,3,4,5]), 4, 5) == "UR"',
    'assert Solution().getDirections(build([1,2,3,4,None,None,7]), 4, 7) == "UURR"',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${prelude}\n${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/tree/Leetcode_2096.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('2096 renderer covers every trace state in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderDirections2096View(step)');
  const end = script.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);

  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const treeTargets = [];
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: (value) => String(value ?? ''),
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
    renderTree: (_step, targetId) => {
      treeTargets.push(targetId);
      elementFor(targetId).innerHTML = '<svg class="tree-svg"></svg>';
    },
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [
    build('5,1,2,3,null,6,4', 3, 6),
    build('1,2,3,4,5', 4, 5),
    build('1,2,3,4,5', 4, 1),
    build('2,1', 2, 1),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderDirections2096View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /dir2096-viz/);
        assert.match(html, /dir2096-paths/);
        assert.match(html, /dir2096-answer/);
        assert.match(html, /CALL STACK/);
        assert.match(html, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
        assert.doesNotMatch(html, /NaN|undefined|Infinity/);
        if (step.final) {
          assert.match(html, /dir2096-answer ready/);
          assert.match(html, /dir2096-answer-cells/);
        }
      }
    }
  }
  assert.ok(treeTargets.length > 0);
  assert.ok(treeTargets.every((targetId) => targetId === 'dir2096Tree'), 'the tree must render into the scoped id');
  assert.match(script, /else if \(step\.directions2096View\)/);
});

test('2096 answer strip separates the U prefix from the descent letters', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderDirections2096View(step)');
  const end = script.indexOf('\nfunction renderStep()', start);
  const elements = new Map();
  const elementFor = (id) => {
    if (!elements.has(id)) elements.set(id, { innerHTML: '' });
    return elements.get(id);
  };
  const context = {
    lang: 'en',
    $: elementFor,
    escapeHtml: (value) => String(value ?? ''),
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
    renderTree: () => {},
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  // "UURL" → two up cells then two down cells, in that order.
  context.renderDirections2096View(build('5,1,2,3,null,6,4', 3, 6).steps.at(-1));
  const html = elementFor('treeView').innerHTML;
  const cells = [...html.matchAll(/<span class="(up|down)"><small>(\d+)<\/small><strong>([ULR])<\/strong>/g)]
    .map((match) => [match[1], Number(match[2]), match[3]]);
  assert.deepEqual(cells, [['up', 0, 'U'], ['up', 1, 'U'], ['down', 2, 'R'], ['down', 3, 'L']]);
});

test('2096 ships responsive scoped styles and tree annotation colours', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.dir2096-viz \{/);
  assert.match(css, /\.dir2096-path-row span\.shared/);
  assert.match(css, /\.dir2096-path-row span\.compare/);
  assert.match(css, /\.dir2096-answer-cells \.up/);
  assert.match(css, /\.dir2096-answer-cells \.down/);
  assert.match(css, /\.tree-annotation\.dir2096-lca/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
