const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3525];

// Independent oracle: apply each edit and walk the suffix literally, using exact
// BigInt products. Nothing here reuses the segment tree's modular bookkeeping.
function oracle(nums, k, queries) {
  const values = nums.map(BigInt);
  const modulus = BigInt(k);
  const out = [];
  for (const [index, value, start, x] of queries) {
    values[index] = BigInt(value);
    let product = 1n;
    let count = 0;
    for (let j = start; j < values.length; j += 1) {
      product *= values[j];
      if (Number(product % modulus) === x) count += 1;
    }
    out.push(count);
  }
  return out;
}

const asText = (queries) => queries.map((q) => q.join(',')).join(';');
const build = (nums, k, queries) => problem.builder(nums, { k, queries: asText(queries) });

test('3525 is registered as the segment-tree sequel to 3524', () => {
  assert.equal(problem.id, 3525);
  assert.equal(problem.slug, 'find-x-value-of-array-ii');
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.category.key, 'dp');
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['segment-tree', 'math', 'counting']);
  assert.equal(problem.complexity.time, 'O(n·k + q·k·log n)');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.extraParams.map((p) => p.key), ['k', 'queries']);
  // The queries field holds text, so it must not be rendered as a number input.
  assert.equal(problem.extraParams.find((p) => p.key === 'queries').type, 'string');

  const code = problem.code.join('\n');
  assert.match(code, /def resultArray\(self, nums: List\[int\], k: int, queries: List\[List\[int\]\]\) -> List\[int\]:/);
  // The non-commutative merge is the crux of the problem.
  assert.match(code, /cnt\[u\] = cnt\[left\]\[:\]/);
  assert.match(code, /cnt\[u\]\[prod\[left\] \* r % k\] \+= cnt\[right\]\[r\]/);
  assert.match(code, /total\[lp \* r % k\] \+= rc\[r\]/);
  assert.deepEqual(
    problem.liveArgs([1, 2, 3], { k: 3, queries: '0,2,0,1' }),
    [[1, 2, 3], 3, [[0, 2, 0, 1]]],
  );
});

test('3525 matches all three published examples', () => {
  const cases = [
    [[1, 2, 3, 4, 5], 3, [[2, 2, 0, 2], [3, 3, 3, 0], [0, 1, 0, 1]], [2, 2, 2]],
    [[1, 2, 4, 8, 16, 32], 4, [[0, 2, 0, 2], [0, 2, 0, 1]], [1, 0]],
    [[1, 1, 2, 1, 1], 2, [[2, 1, 0, 1]], [5]],
  ];
  for (const [nums, k, queries, expected] of cases) {
    const run = build(nums, k, queries);
    assert.deepEqual(run.answer, expected, `[${nums}] k=${k}`);
    assert.deepEqual(run.steps.at(-1).findXValue3525View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
  }
});

test('3525 agrees with a literal BigInt suffix-walk oracle', () => {
  let seed = 3525;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 250; trial += 1) {
    const n = 1 + random(8);
    const k = 1 + random(5);
    const nums = Array.from({ length: n }, () => 1 + random(40));
    const queries = Array.from({ length: 1 + random(4) }, () => [
      random(n), 1 + random(40), random(n), random(k),
    ]);
    assert.deepEqual(
      build(nums, k, queries).answer,
      oracle(nums, k, queries),
      `[${nums}] k=${k} q=${asText(queries)}`,
    );
  }
  // Large values must survive the reduction to remainders.
  const big = [1000000000, 999999999, 123456789, 7];
  for (let k = 1; k <= 5; k += 1) {
    const queries = [[0, 1000000000, 0, 0], [3, 999999937, 1, k - 1]];
    assert.deepEqual(build(big, k, queries).answer, oracle(big, k, queries), `big k=${k}`);
  }
});

test('3525 edits persist across queries', () => {
  // The second query must see the value written by the first one.
  const nums = [1, 2, 3];
  const withEdit = build(nums, 3, [[1, 3, 0, 0], [0, 1, 0, 0]]);
  assert.deepEqual(withEdit.answer, oracle(nums, 3, [[1, 3, 0, 0], [0, 1, 0, 0]]));
  // The visualizer must not mutate the caller's array.
  assert.deepEqual(nums, [1, 2, 3]);
  // The view reports the live array, which differs from the original.
  const final = withEdit.steps.at(-1).findXValue3525View;
  assert.deepEqual(final.original, [1, 2, 3]);
  assert.deepEqual(final.nums, [1, 3, 3]);
});

test('3525 answers never exceed the number of prefixes in the queried range', () => {
  let seed = 99;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 150; trial += 1) {
    const n = 1 + random(8);
    const k = 1 + random(5);
    const nums = Array.from({ length: n }, () => 1 + random(20));
    const queries = Array.from({ length: 1 + random(4) }, () => [
      random(n), 1 + random(20), random(n), random(k),
    ]);
    const run = build(nums, k, queries);
    run.answer.forEach((value, index) => {
      const start = queries[index][2];
      assert.ok(value >= 0 && value <= n - start, `answer ${value} out of range for start ${start}`);
    });
  }
});

test('3525 builds every segment-tree node exactly once', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2]]);
  const views = run.steps.map((step) => step.findXValue3525View);
  // n = 5 gives 5 leaves plus 4 internal nodes.
  const built = views.find((view) => view.event === 'built');
  assert.equal(built.nodes.length, 9);
  assert.ok(built.nodes.every((node) => node.ready));
  assert.equal(views.filter((view) => view.event === 'build-leaf').length, 5);
  assert.equal(views.filter((view) => view.event === 'build-merge').length, 4);

  // Every node's range must be the union of its children's ranges.
  const byU = new Map(built.nodes.map((node) => [node.u, node]));
  for (const node of built.nodes) {
    const left = byU.get(node.u * 2);
    const right = byU.get(node.u * 2 + 1);
    if (!left) {
      assert.equal(node.lo, node.hi, `u=${node.u} is a leaf so lo must equal hi`);
      continue;
    }
    assert.equal(left.lo, node.lo);
    assert.equal(right.hi, node.hi);
    assert.equal(right.lo, left.hi + 1);
  }

  // cnt at any node must sum to that node's range length, and cnt[root] must
  // describe the prefixes of the whole array.
  for (const node of built.nodes) {
    assert.equal(
      node.cnt.reduce((sum, value) => sum + value, 0),
      node.hi - node.lo + 1,
      `u=${node.u} cnt must sum to its range length`,
    );
  }
  assert.deepEqual(byU.get(1).cnt, [3, 1, 1]);
  assert.equal(byU.get(1).prod, 0);
});

test('3525 merge copies the left cnt and shifts the right by left.prod', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2]]);
  const merges = run.steps
    .map((step) => step.findXValue3525View)
    .filter((view) => view.merge && view.event === 'build-merge');
  assert.ok(merges.length >= 4);
  for (const view of merges) {
    const { aProd, bProd, aCnt, bCnt, result, shifts, prod } = view.merge;
    // prod is the plain product of the two children.
    assert.equal(prod, (aProd * bProd) % view.k);
    // Reconstructing the merge must reproduce the recorded result exactly.
    const expected = [...aCnt];
    for (let r = 0; r < view.k; r += 1) expected[(aProd * r) % view.k] += bCnt[r];
    assert.deepEqual(result, expected);
    // Every remainder of the right child is accounted for exactly once.
    assert.equal(shifts.length, view.k);
    shifts.forEach((shift) => {
      assert.equal(shift.to, (aProd * shift.r) % view.k);
      assert.equal(shift.amount, bCnt[shift.r]);
    });
    // Nothing is created or lost.
    assert.equal(
      result.reduce((sum, value) => sum + value, 0),
      aCnt.reduce((sum, value) => sum + value, 0) + bCnt.reduce((sum, value) => sum + value, 0),
    );
  }
});

test('3525 merge is not commutative, which the trace must reflect', () => {
  // Left [0..1] has prod 2 and the right child [2..2] holds a 3, so swapping the
  // two sides would give a different cnt. Assert the asymmetry on a real merge.
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2]]);
  const view = run.steps
    .map((step) => step.findXValue3525View)
    .find((candidate) => candidate.merge && candidate.event === 'build-merge' && candidate.merge.aProd !== candidate.merge.bProd);
  assert.ok(view, 'need a merge whose two children differ in prod');
  const { aProd, bProd, aCnt, bCnt, result, k } = { ...view.merge, k: view.k };
  const swapped = [...bCnt];
  for (let r = 0; r < k; r += 1) swapped[(bProd * r) % k] += aCnt[r];
  assert.notDeepEqual(result, swapped, 'swapping the children must change the result');
});

test('3525 update walks one root-to-leaf path and re-merges on the way up', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2]]);
  const views = run.steps.map((step) => step.findXValue3525View);
  const descends = views.filter((view) => view.event === 'descend');
  const leafWrite = views.find((view) => view.event === 'update-leaf');
  const remerges = views.filter((view) => view.event === 'update-merge');
  // index 2 in a 5-element tree: root -> [0..2] -> [2..2].
  assert.equal(descends.length, 2);
  assert.equal(leafWrite.activeU, 5);
  // One re-merge per internal node on the path, and they must run bottom-up.
  assert.equal(remerges.length, descends.length);
  assert.deepEqual(remerges.map((view) => view.activeU), [2, 1]);
  // The path recorded in the view is exactly root -> ... -> leaf.
  assert.deepEqual(leafWrite.pathU, [1, 2, 5]);
});

test('3525 query takes whole nodes and only splits where start cuts in', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[3, 3, 3, 0]]);
  const views = run.steps.map((step) => step.findXValue3525View);
  // start = 3 lands exactly on the node [3..4], so one whole node answers it.
  const whole = views.filter((view) => view.event === 'query-whole');
  assert.ok(whole.length >= 1);
  const selected = views.at(-2).selectedU;
  assert.ok(selected.length >= 1);
  // Selected nodes must tile [start, n-1] exactly, with no overlap or gap.
  const built = views.find((view) => view.event === 'built');
  const byU = new Map(built.nodes.map((node) => [node.u, node]));
  const ranges = selected.map((u) => byU.get(u)).sort((a, b) => a.lo - b.lo);
  assert.equal(ranges[0].lo, 3);
  assert.equal(ranges.at(-1).hi, 4);
  for (let i = 1; i < ranges.length; i += 1) assert.equal(ranges[i].lo, ranges[i - 1].hi + 1);

  // A start that cuts a node in half must produce a split plus a merge.
  const cutting = build([1, 2, 3, 4, 5], 3, [[0, 1, 1, 1]]);
  const cuttingViews = cutting.steps.map((step) => step.findXValue3525View);
  assert.ok(cuttingViews.some((view) => view.event === 'query-split'));
  assert.ok(cuttingViews.some((view) => view.event === 'query-merge'));
});

test('3525 prefix-product strip is the ground truth for the answer', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2], [3, 3, 3, 0], [0, 1, 0, 1]]);
  for (const step of run.steps) {
    const view = step.findXValue3525View;
    if (!view.prefixProducts || view.x === null) continue;
    // The strip must start at start and run to the end of the array.
    assert.equal(view.prefixProducts[0].end, view.start);
    assert.equal(view.prefixProducts.at(-1).end, view.n - 1);
    assert.equal(view.prefixProducts.length, view.n - view.start);
  }
  // On each read step, the matching cells must equal the answer just produced.
  const reads = run.steps.map((step) => step.findXValue3525View).filter((view) => view.event === 'read');
  assert.equal(reads.length, 3);
  reads.forEach((view, index) => {
    const matches = view.prefixProducts.filter((entry) => entry.mod === view.x).length;
    assert.equal(matches, view.answers[index], `query ${index}: strip says ${matches}`);
  });
});

test('3525 codeLines are 1-based and point at the line each phase runs', () => {
  const run = build([1, 2, 3, 4, 5], 3, [[0, 1, 1, 1]]);
  assert.ok(run.steps.every((step) => step.codeLines.length > 0));
  assert.ok(run.steps.every((step) => step.codeLines.every((line) => line >= 1 && line <= problem.code.length)));
  const firstLineFor = (event) => problem.code[
    run.steps.find((step) => step.findXValue3525View.event === event).codeLines[0] - 1
  ];
  assert.match(firstLineFor('build-leaf'), /if lo == hi:/);
  assert.match(firstLineFor('build-merge'), /mid = \(lo \+ hi\) \/\/ 2/);
  assert.match(firstLineFor('built'), /build\(1, 0, n - 1\)/);
  assert.match(firstLineFor('assign'), /nums\[index\] = value/);
  assert.match(firstLineFor('update-leaf'), /if lo == hi:/);
  assert.match(firstLineFor('query-whole'), /if lo >= left:/);
  assert.match(firstLineFor('read'), /ans\.append\(query\(1, 0, n - 1, start\)\[1\]\[x\]\)/);
  assert.match(firstLineFor('return'), /return ans/);
});

test('3525 validates nums, k and queries', () => {
  assert.throws(() => build([], 3, [[0, 1, 0, 0]]), /comma-separated list of integers/);
  assert.throws(() => build([0, 1], 3, [[0, 1, 0, 0]]), /integers from 1 to 1,000,000,000/);
  assert.throws(() => build(Array.from({ length: 9 }, () => 1), 3, [[0, 1, 0, 0]]), /up to 8 numbers/);
  assert.throws(() => build([1, 2], 6, [[0, 1, 0, 0]]), /k must be an integer from 1 to 5/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '' }), /at least one query/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '0,1,0' }), /4 integers/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '5,1,0,0' }), /index must be between 0 and 1/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '0,1,7,0' }), /start must be between 0 and 1/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '0,1,0,9' }), /x must be between 0 and 2/);
  assert.throws(() => problem.builder([1, 2], { k: 3, queries: '0,0,0,0' }), /value must be between 1/);
  assert.throws(
    () => problem.builder([1, 2], { k: 3, queries: '0,1,0,0;0,1,0,0;0,1,0,0;0,1,0,0;0,1,0,0' }),
    /up to 4 queries/,
  );
});

test('3525 displayed Python and the solution file agree with the visualizer', () => {
  const assertions = [
    'assert Solution().resultArray([1,2,3,4,5], 3, [[2,2,0,2],[3,3,3,0],[0,1,0,1]]) == [2,2,2]',
    'assert Solution().resultArray([1,2,4,8,16,32], 4, [[0,2,0,2],[0,2,0,1]]) == [1,0]',
    'assert Solution().resultArray([1,1,2,1,1], 2, [[2,1,0,1]]) == [5]',
    'assert Solution().resultArray([7,7,7], 1, [[0,5,0,0]]) == [3]',
    'assert Solution().resultArray([2,3], 5, [[0,2,1,3]]) == [1]',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_3525.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

function loadRenderer() {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderFindXValue3525View(step)');
  const end = script.indexOf('\nfunction renderStep()', start);
  assert.ok(start >= 0 && end > start);
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
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);
  return { context, elementFor, script };
}

test('3525 renderer covers every trace state in English and Vietnamese', () => {
  const { context, elementFor, script } = loadRenderer();
  const runs = [
    build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2], [3, 3, 3, 0], [0, 1, 0, 1]]),
    build([1, 2, 4, 8, 16, 32], 4, [[0, 2, 0, 2], [0, 2, 0, 1]]),
    build([1, 1, 2, 1, 1], 2, [[2, 1, 0, 1]]),
    build([7], 1, [[0, 5, 0, 0]]),
    build([3, 9, 27, 81, 6, 10, 2, 4], 5, [[7, 2, 1, 3]]),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderFindXValue3525View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /fx3525-viz/);
        assert.match(html, /fx3525-tree/);
        assert.match(html, /fx3525-merge-card/);
        assert.match(html, new RegExp(`(?:LINE|DÒNG) ${step.codeLines.join(', ')}`));
        assert.doesNotMatch(html, /NaN|undefined|Infinity|null/);
        // One node card per node built so far.
        assert.equal(
          (html.match(/class="fx3525-node/g) || []).length,
          step.findXValue3525View.nodes.length,
        );
      }
    }
  }
  assert.match(script, /else if \(step\.findXValue3525View\)/);
});

test('3525 renderer lays nodes out spanning their array range', () => {
  const { context, elementFor } = loadRenderer();
  const run = build([1, 2, 3, 4, 5], 3, [[2, 2, 0, 2]]);
  const built = run.steps.find((step) => step.findXValue3525View.event === 'built');
  context.renderFindXValue3525View(built);
  const html = elementFor('treeView').innerHTML;
  // The root sits on row 1 and spans all five columns.
  assert.match(html, /grid-row:1;grid-column:1 \/ span 5/);
  // Leaves span a single column each.
  assert.equal((html.match(/span 1"/g) || []).length, 5);
  // The grid is declared over exactly n columns.
  assert.match(html, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
});

test('3525 renderer marks the merging children and the query selection', () => {
  const { context, elementFor } = loadRenderer();
  const run = build([1, 2, 3, 4, 5], 3, [[3, 3, 3, 0]]);

  // During a merge exactly one node is the left child and one is the right.
  const mergeStep = run.steps.find((step) => step.findXValue3525View.event === 'build-merge');
  context.renderFindXValue3525View(mergeStep);
  let html = elementFor('treeView').innerHTML;
  assert.equal((html.match(/fx3525-node merge-left/g) || []).length, 1);
  assert.equal((html.match(/fx3525-node merge-right/g) || []).length, 1);
  assert.match(html, /fx3525-merge-row shift/);
  assert.match(html, /fx3525-merge-row result/);

  // On a query-whole step the chosen node is marked selected.
  const wholeStep = run.steps.find((step) => step.findXValue3525View.event === 'query-whole');
  context.renderFindXValue3525View(wholeStep);
  html = elementFor('treeView').innerHTML;
  assert.match(html, /selected/);

  // The final step shows every query answered.
  context.renderFindXValue3525View(run.steps.at(-1));
  html = elementFor('treeView').innerHTML;
  assert.match(html, /fx3525-answers/);
  assert.doesNotMatch(html, /fx3525-node merge-left/);
});

test('3525 renderer dims the dropped prefix and flags the written cell', () => {
  const { context, elementFor } = loadRenderer();
  const run = build([1, 2, 3, 4, 5], 3, [[1, 7, 3, 0]]);
  const readStep = run.steps.find((step) => step.findXValue3525View.event === 'read');
  context.renderFindXValue3525View(readStep);
  const html = elementFor('treeView').innerHTML;
  // start = 3, so indices 0..2 are dropped.
  assert.equal((html.match(/fx3525-num dropped/g) || []).length, 3);
  // index 1 was overwritten with 7, so it is both changed and written.
  assert.match(html, /changed/);
  assert.match(html, /written/);
  // The ground-truth strip is present and marks the matches.
  assert.match(html, /fx3525-truth/);
});

test('3525 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.fx3525-viz \{/);
  assert.match(css, /\.fx3525-node\.merge-left/);
  assert.match(css, /\.fx3525-node\.merge-right/);
  assert.match(css, /\.fx3525-node\.selected/);
  assert.match(css, /\.fx3525-merge-row\.shift span\.moves/);
  assert.match(css, /\.fx3525-num\.dropped/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
