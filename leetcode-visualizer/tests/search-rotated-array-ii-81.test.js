const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[81];

test('81 is registered as a line-by-line duplicate-aware binary search lesson', () => {
  assert.equal(problem.id, 81);
  assert.equal(problem.slug, 'search-in-rotated-sorted-array-ii');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'binary-search');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.complexity.space, 'O(1)');
  assert.match(problem.complexity.time, /O\(n\) worst/);
  assert.match(problem.code.join('\n'), /nums\[left\] == nums\[mid\] == nums\[right\]/);
});

test('81 matches the published examples and duplicate-wall edge cases', () => {
  const cases = [
    [[2, 5, 6, 0, 0, 1, 2], 0, true],
    [[2, 5, 6, 0, 0, 1, 2], 3, false],
    [[1, 0, 1, 1, 1], 0, true],
    [[1, 1, 1, 1, 1], 2, false],
    [[1], 1, true],
    [[1], 0, false],
    [[3, 1, 1], 3, true],
  ];
  for (const [nums, target, expected] of cases) {
    const run = problem.builder(nums, { target });
    assert.equal(run.answer, expected, `${nums}; target=${target}`);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('81 agrees with linear search on deterministic rotated arrays with duplicates', () => {
  let seed = 81;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let sample = 0; sample < 180; sample += 1) {
    const length = 1 + random(20);
    const sorted = [];
    let value = random(7) - 3;
    for (let index = 0; index < length; index += 1) {
      value += random(3) === 0 ? 1 : 0;
      sorted.push(value);
    }
    const pivot = random(length);
    const nums = sorted.slice(pivot).concat(sorted.slice(0, pivot));
    const target = random(2) ? nums[random(length)] : value + 2 + random(4);
    assert.equal(problem.builder(nums, { target }).answer, nums.includes(target), `${nums}; target=${target}`);
  }
});

test('81 trace exposes the duplicate gate, safe boundary shrinking, sorted half, and final answer', () => {
  const duplicateRun = problem.builder([1, 0, 1, 1, 1], { target: 0 });
  const views = duplicateRun.steps.map(step => step.rotatedSearch81View);
  for (const operation of ['initialize', 'choose-mid', 'check-target', 'check-duplicates', 'shrink-left', 'shrink-right', 'continue', 'detect-sorted-half', 'return-true']) {
    assert.ok(views.some(view => view.operation === operation), operation);
  }
  const wall = views.find(view => view.operation === 'check-duplicates' && view.duplicateWall);
  assert.deepEqual([wall.nums[wall.left], wall.nums[wall.mid], wall.nums[wall.right]], [1, 1, 1]);
  const shrink = views.find(view => view.operation === 'shrink-right');
  assert.deepEqual(shrink.eliminated, [0, 4]);
  assert.deepEqual([shrink.comparedLeft, shrink.mid, shrink.comparedRight], [0, 2, 4]);
  assert.deepEqual([shrink.left, shrink.right], [1, 3]);

  const missingRun = problem.builder([2, 5, 6, 0, 0, 1, 2], { target: 3 });
  assert.equal(missingRun.steps.at(-1).rotatedSearch81View.operation, 'return-false');
  for (const step of [...duplicateRun.steps, ...missingRun.steps]) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length);
  }
});

test('81 displayed and repository Python solutions agree with representative cases', () => {
  const assertions = [
    'assert Solution().search([2,5,6,0,0,1,2], 0) is True',
    'assert Solution().search([2,5,6,0,0,1,2], 3) is False',
    'assert Solution().search([1,0,1,1,1], 0) is True',
    'assert Solution().search([1,1,1,1,1], 2) is False',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const repository = spawnSync('python3', [require.resolve('../../Leetcode-sln/array/Leetcode_81.py')], { encoding: 'utf8' });
  assert.equal(repository.status, 0, repository.stderr);
});

test('81 renderer covers regular, duplicate, found, and missing states in both languages', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderRotatedSearch81View(step)');
  const end = source.indexOf('\n// ---- Find Minimum in Rotated Sorted Array II visualization', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.rotatedSearch81View[\s\S]*renderRotatedSearch81View\(step\)/);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const runs = [
    problem.builder([1, 0, 1, 1, 1], { target: 0 }),
    problem.builder([2, 5, 6, 0, 0, 1, 2], { target: 3 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderRotatedSearch81View(step);
        assert.match(element.innerHTML, /rs81-viz/);
        assert.match(element.innerHTML, /rs81-cells/);
        assert.match(element.innerHTML, /rs81-triplet/);
        assert.match(element.innerHTML, /rs81-gates/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('81 validates visual input and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder([], { target: 1 }), /1 to 24 safe integers/);
  assert.throws(() => problem.builder([1, 2.5], { target: 1 }), /safe integers/);
  assert.throws(() => problem.builder([2, 1, 3], { target: 1 }), /rotated non-decreasing/);
  assert.throws(() => problem.builder([1, 2, 3], { target: 1.5 }), /target must be a safe integer/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.rs81-viz \{/);
  assert.match(css, /\.rs81-cell\.duplicate/);
  assert.match(css, /\.rs81-triplet\.ambiguous/);
  assert.match(css, /@container \(max-width: 470px\)[\s\S]*\.rs81-result/);
});
