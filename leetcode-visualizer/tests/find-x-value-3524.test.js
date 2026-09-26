const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3524];

// Independent oracle: enumerate every (prefix, suffix) removal literally as the
// statement describes, using exact big-integer products rather than modular
// bookkeeping. Nothing here reuses the DP's remainder arithmetic.
function oracle(nums, k) {
  const result = Array(k).fill(0);
  const modulus = BigInt(k);
  for (let removedPrefix = 0; removedPrefix < nums.length; removedPrefix += 1) {
    for (let removedSuffix = 0; removedPrefix + removedSuffix < nums.length; removedSuffix += 1) {
      let product = 1n;
      for (let i = removedPrefix; i < nums.length - removedSuffix; i += 1) {
        product *= BigInt(nums[i]);
      }
      result[Number(product % modulus)] += 1;
    }
  }
  return result;
}

function build(nums, k) {
  return problem.builder(nums, { k });
}

test('3524 is registered in the dp catalog with the expected signature', () => {
  assert.equal(problem.id, 3524);
  assert.equal(problem.slug, 'find-x-value-of-array-i');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'dp');
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['prefix-sum', 'math', 'counting']);
  assert.equal(problem.complexity.time, 'O(n·k)');
  assert.equal(problem.complexity.space, 'O(k)');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.inputKind, 'positive');
  assert.deepEqual(problem.defaultInput, [1, 2, 3, 4, 5]);
  assert.deepEqual(problem.extraParams.map((p) => p.key), ['k']);

  const code = problem.code.join('\n');
  assert.match(code, /def resultArray\(self, nums: List\[int\], k: int\) -> List\[int\]:/);
  // The remainder transition and the accumulate-not-assign detail are the crux.
  assert.match(code, /new_dp\[\(r \* num_mod\) % k\] \+= dp\[r\]/);
  assert.match(code, /new_dp\[num_mod\] = 1/);
  assert.doesNotMatch(code, /new_dp\[\(r \* num_mod\) % k\] = dp\[r\]/);
  assert.deepEqual(problem.liveArgs([1, 2, 3, 4, 5], { k: 3 }), [[1, 2, 3, 4, 5], 3]);
});

test('3524 matches all three published examples', () => {
  const cases = [
    [[1, 2, 3, 4, 5], 3, [9, 2, 4]],
    [[1, 2, 4, 8, 16, 32], 4, [18, 1, 2, 0]],
    [[1, 1, 2, 1, 1], 2, [9, 6]],
  ];
  for (const [nums, k, expected] of cases) {
    const run = build(nums, k);
    assert.deepEqual(run.answer, expected, `[${nums}] k=${k}`);
    assert.deepEqual(run.steps.at(-1).findXValue3524View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
    assert.equal(run.steps.filter((step) => step.final).length, 1);
  }
});

test('3524 agrees with a literal prefix/suffix-removal oracle', () => {
  let seed = 3524;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 250; trial += 1) {
    const n = 1 + random(10);
    const k = 1 + random(5);
    const nums = Array.from({ length: n }, () => 1 + random(50));
    assert.deepEqual(build(nums, k).answer, oracle(nums, k), `[${nums}] k=${k}`);
  }
  // Large values must not lose precision on the way to the remainder.
  const big = [1000000000, 999999999, 123456789, 7];
  for (let k = 1; k <= 5; k += 1) {
    assert.deepEqual(build(big, k).answer, oracle(big, k), `big k=${k}`);
  }
});

test('3524 buckets always sum to the number of non-empty subarrays', () => {
  let seed = 11;
  const random = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 150; trial += 1) {
    const n = 1 + random(10);
    const k = 1 + random(5);
    const nums = Array.from({ length: n }, () => 1 + random(30));
    const run = build(nums, k);
    assert.equal(run.answer.length, k);
    assert.equal(
      run.answer.reduce((sum, value) => sum + value, 0),
      (n * (n + 1)) / 2,
      `[${nums}] k=${k}`,
    );
    // ans is monotonically non-decreasing across the trace.
    let previous = Array(k).fill(0);
    for (const step of run.steps) {
      const current = step.findXValue3524View.ans;
      if (!current) continue;
      for (let r = 0; r < k; r += 1) assert.ok(current[r] >= previous[r]);
      previous = current;
    }
  }
});

test('3524 trace steps one source line at a time through both inner loops', () => {
  const run = build([1, 2, 3, 4, 5], 3);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  // intro, ans, dp, then per element: 4,5,6,7,8, 9*k, 10, 11*k, 12; then 13.
  // codeLines are 1-based: line N highlights code[N - 1].
  const perElement = [5, 6, 7, 8, 9, 10, 10, 10, 11, 12, 12, 12, 13];
  const expected = [2, 3, 4];
  for (let i = 0; i < 5; i += 1) expected.push(...perElement);
  expected.push(14);
  assert.deepEqual(run.steps.map((step) => step.codeLines[0]), expected);
  assert.equal(run.steps.length, 3 + 5 * 13 + 1);
  // Guards the convention: each step must light up the line that performs it.
  const sourceFor = (event) => problem.code[
    run.steps.find((step) => step.findXValue3524View.event === event).codeLines[0] - 1
  ];
  assert.match(sourceFor('init-ans'), /ans = \[0\] \* k/);
  assert.match(sourceFor('init-dp'), /dp = \[0\] \* k/);
  assert.match(sourceFor('take-num'), /for num in nums:/);
  assert.match(sourceFor('num-mod'), /num_mod = num % k/);
  assert.match(sourceFor('seed-single'), /new_dp\[num_mod\] = 1/);
  assert.match(sourceFor('extend'), /new_dp\[\(r \* num_mod\) % k\] \+= dp\[r\]/);
  assert.match(sourceFor('accumulate'), /ans\[r\] \+= new_dp\[r\]/);
  assert.match(sourceFor('roll-dp'), /dp = new_dp/);
  assert.match(sourceFor('return'), /return ans/);

  const views = run.steps.map((step) => step.findXValue3524View);
  assert.ok(views.every((view) => view.problemId === 3524));
  // dp and ans only exist once their own line has run.
  assert.equal(views[0].ans, null);
  assert.equal(views[0].dp, null);
  assert.deepEqual(views[1].ans, [0, 0, 0]);
  assert.equal(views[1].dp, null);
  assert.deepEqual(views[2].dp, [0, 0, 0]);
});

test('3524 first element seeds only the single-element subarray', () => {
  const run = build([1, 2, 3, 4, 5], 3);
  const views = run.steps.map((step) => step.findXValue3524View);
  const seed = views.find((view) => view.event === 'seed-single');
  assert.equal(seed.index, 0);
  assert.equal(seed.num, 1);
  assert.equal(seed.numMod, 1);
  assert.deepEqual(seed.newDp, [0, 1, 0]);
  // Every extension from an all-zero dp must add nothing.
  const firstExtends = views.filter((view) => view.event === 'extend' && view.index === 0);
  assert.equal(firstExtends.length, 3);
  assert.ok(firstExtends.every((view) => view.delta === 0));
  assert.deepEqual(firstExtends.at(-1).newDp, [0, 1, 0]);
});

test('3524 exposes the remainder transition r -> (r * num_mod) % k', () => {
  const run = build([1, 2, 3, 4, 5], 3);
  const views = run.steps.map((step) => step.findXValue3524View);
  // Element index 2 is 3, so num_mod = 0 and every remainder collapses to 0.
  const collapse = views.filter((view) => view.event === 'extend' && view.index === 2);
  assert.equal(collapse.length, 3);
  assert.ok(collapse.every((view) => view.numMod === 0));
  assert.deepEqual(collapse.map((view) => view.targetR), [0, 0, 0]);
  // dp after element 1 was [0,0,2], so the r=2 bucket carries 2 into bucket 0.
  assert.deepEqual(collapse[0].dp, [0, 0, 2]);
  assert.deepEqual(collapse.map((view) => view.delta), [0, 0, 2]);
  assert.deepEqual(collapse.at(-1).newDp, [3, 0, 0]);

  // Element index 4 is 5, num_mod = 2: bucket 1 maps to 2, bucket 2 maps to 1.
  const mix = views.filter((view) => view.event === 'extend' && view.index === 4);
  assert.ok(mix.every((view) => view.numMod === 2));
  assert.deepEqual(mix.map((view) => view.targetR), [0, 2, 1]);
  assert.deepEqual(mix.at(-1).newDp, [3, 0, 2]);
});

test('3524 grid records the product remainder of every subarray', () => {
  const run = build([1, 2, 3, 4, 5], 3);
  const grid = run.steps.at(-1).findXValue3524View.grid;
  assert.equal(grid.length, 5);
  // Row 0 = subarrays starting at 0: products 1,2,6,24,120 -> mod 3.
  assert.deepEqual(grid[0].map((cell) => cell.mod), [1, 2, 0, 0, 0]);
  // fromMod links each subarray to the one it extends.
  assert.deepEqual(grid[0].map((cell) => cell.fromMod), [null, 1, 2, 0, 0]);
  assert.equal(grid[4].length, 1);
  assert.equal(grid[4][0].mod, 2);
  // The grid must agree with the answer it is meant to illustrate.
  const tally = Array(3).fill(0);
  for (const row of grid) for (const cell of row) tally[cell.mod] += 1;
  assert.deepEqual(tally, run.answer);
});

test('3524 validates nums and k', () => {
  assert.throws(() => build([], 3), /comma-separated list of integers/);
  assert.throws(() => build([0, 1], 3), /integers from 1 to 1,000,000,000/);
  assert.throws(() => build([-1, 2], 3), /integers from 1 to 1,000,000,000/);
  assert.throws(() => build([1, 1000000001], 3), /integers from 1 to 1,000,000,000/);
  assert.throws(() => build(Array.from({ length: 11 }, () => 1), 3), /up to 10 numbers/);
  assert.throws(() => build([1, 2], 0), /k must be an integer from 1 to 5/);
  assert.throws(() => build([1, 2], 6), /k must be an integer from 1 to 5/);
  assert.throws(() => build([1, 2], 2.5), /k must be an integer from 1 to 5/);
  // A comma-separated string is accepted too, since that is what the UI sends.
  assert.deepEqual(problem.builder('1,2,3,4,5', { k: 3 }).answer, [9, 2, 4]);
});

test('3524 displayed Python and the solution file agree with the visualizer', () => {
  const assertions = [
    'assert Solution().resultArray([1,2,3,4,5], 3) == [9,2,4]',
    'assert Solution().resultArray([1,2,4,8,16,32], 4) == [18,1,2,0]',
    'assert Solution().resultArray([1,1,2,1,1], 2) == [9,6]',
    'assert Solution().resultArray([7,7,7], 1) == [6]',
    'assert Solution().resultArray([5], 3) == [0,0,1]',
  ].join('\n');
  const displayed = spawnSync(
    'python3',
    ['-c', `from typing import List\n${problem.code.join('\n')}\n${assertions}`],
    { encoding: 'utf8' },
  );
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/array/Leetcode_3524.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

function loadRenderer() {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderFindXValue3524View(step)');
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

test('3524 renderer covers every trace state in English and Vietnamese', () => {
  const { context, elementFor, script } = loadRenderer();
  const runs = [
    build([1, 2, 3, 4, 5], 3),
    build([1, 2, 4, 8, 16, 32], 4),
    build([1, 1, 2, 1, 1], 2),
    build([7, 7, 7], 1),
    build([5], 3),
    build([3, 9, 27, 81, 6, 10, 2, 4, 8, 16], 5),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderFindXValue3524View(step);
        const html = elementFor('treeView').innerHTML;
        assert.match(html, /fx3524-viz/);
        assert.match(html, /fx3524-triangle/);
        assert.match(html, /fx3524-dp/);
        assert.match(html, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
        assert.doesNotMatch(html, /NaN|undefined|Infinity|null/);
        // The triangle always draws one cell per subarray.
        const n = step.findXValue3524View.n;
        assert.equal((html.match(/class="fx3524-cell /g) || []).length, (n * (n + 1)) / 2);
      }
    }
  }
  assert.match(script, /else if \(step\.findXValue3524View\)/);
});

test('3524 renderer lights the column of subarrays currently being counted', () => {
  const { context, elementFor } = loadRenderer();
  const run = build([1, 2, 3, 4, 5], 3);
  // While handling index 2 there are 3 subarrays ending there, so 3 active cells
  // and 3 already-counted ones (the columns for index 0 and 1).
  const step = run.steps.find(
    (candidate) => candidate.findXValue3524View.index === 2
      && candidate.findXValue3524View.event === 'seed-single',
  );
  context.renderFindXValue3524View(step);
  const html = elementFor('treeView').innerHTML;
  assert.equal((html.match(/fx3524-cell active/g) || []).length, 3);
  assert.equal((html.match(/fx3524-cell counted/g) || []).length, 3);
  assert.equal((html.match(/fx3524-cell pending/g) || []).length, 15 - 6);
  // Seeding marks exactly the single-element subarray (2,2).
  assert.equal((html.match(/matched/g) || []).length, 1);

  // Before the loop nothing is counted; after it everything is.
  context.renderFindXValue3524View(run.steps[0]);
  assert.equal((elementFor('treeView').innerHTML.match(/fx3524-cell pending/g) || []).length, 15);
  context.renderFindXValue3524View(run.steps.at(-1));
  assert.equal((elementFor('treeView').innerHTML.match(/fx3524-cell counted/g) || []).length, 15);
});

test('3524 renderer shows the checksum reaching n(n+1)/2 only at the end', () => {
  const { context, elementFor } = loadRenderer();
  const run = build([1, 2, 3, 4, 5], 3);
  context.renderFindXValue3524View(run.steps.at(-1));
  assert.match(elementFor('treeView').innerHTML, /fx3524-checksum full/);
  // Mid-run the checksum must not claim completeness.
  const mid = run.steps.find((step) => step.findXValue3524View.index === 1);
  context.renderFindXValue3524View(mid);
  assert.match(elementFor('treeView').innerHTML, /fx3524-checksum/);
  assert.doesNotMatch(elementFor('treeView').innerHTML, /fx3524-checksum full/);
});

test('3524 ships responsive scoped styles', () => {
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.fx3524-viz \{/);
  assert.match(css, /\.fx3524-cell\.matched/);
  assert.match(css, /\.fx3524-cell\.counted/);
  assert.match(css, /\.fx3524-row > div > span\.focus\.source/);
  assert.match(css, /\.fx3524-checksum\.full/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
