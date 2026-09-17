const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');

const problem = require('../problems').SUPPORTED[1477];

function oracle(nums, target) {
  const segments = [];
  for (let left = 0; left < nums.length; left += 1) {
    let sum = 0;
    for (let right = left; right < nums.length; right += 1) {
      sum += nums[right];
      if (sum === target) segments.push({ left, right, length: right - left + 1 });
      if (sum >= target) break;
    }
  }
  let answer = Infinity;
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      if (segments[i].right < segments[j].left || segments[j].right < segments[i].left) {
        answer = Math.min(answer, segments[i].length + segments[j].length);
      }
    }
  }
  return answer === Infinity ? -1 : answer;
}

test('1477 is registered as a semantic sliding-window and prefix-DP lesson', () => {
  assert.equal(problem.id, 1477);
  assert.equal(problem.slug, 'find-two-non-overlapping-sub-arrays-each-with-target-sum');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.ok(problem.tags.some(tag => tag.key === 'prefix-dp'));
  assert.match(problem.code.join('\n'), /best\[left - 1\]/);
});

test('1477 handles official examples and edge cases', () => {
  const cases = [
    [[3, 2, 2, 4, 3], 3, 2],
    [[7, 3, 4, 7], 7, 2],
    [[4, 3, 2, 6, 2, 3, 4], 6, -1],
    [[5, 5, 4, 4, 5], 3, -1],
    [[3, 1, 1, 1, 5, 1, 2, 1], 3, 3],
    [[1, 1], 1, 2],
    [[1], 1, -1],
  ];
  for (const [nums, target, expected] of cases) {
    assert.equal(problem.builder(nums, { target }).answer, expected, `${nums} target=${target}`);
  }
});

test('1477 agrees with an independent brute-force oracle', () => {
  const cases = [
    [[1, 2, 1, 2, 1], 3],
    [[2, 1, 1, 1, 2, 1, 1], 3],
    [[1, 6, 1, 1, 1, 6, 1], 6],
    [[2, 2, 2, 2], 4],
    [[8, 1, 2, 3, 4, 1, 1], 5],
  ];
  for (const [nums, target] of cases) {
    assert.equal(problem.builder(nums, { target }).answer, oracle(nums, target));
  }
});

test('1477 trace shows window, prefix best, pairing, and output line by line', () => {
  const run = problem.builder(problem.defaultInput, { target: 3 });
  const views = run.steps.map(step => step.twoSubarrays1477View);
  for (const phase of ['initialize', 'expand', 'shrink', 'check', 'found', 'pair', 'prefix', 'done']) {
    assert.ok(views.some(view => view.phase === phase), phase);
  }
  assert.ok(views.some(view => view.candidatePair && view.candidatePair.totalLength === 2));
  assert.deepEqual(views.at(-1).bestPair, {
    first: { left: 0, right: 0, length: 1 },
    second: { left: 4, right: 4, length: 1 },
    totalLength: 2,
  });
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(run.steps.at(-1).final, true);
});

test('1477 displayed Python solution passes representative cases', () => {
  const assertions = [
    's = Solution()',
    'assert s.minSumOfLengths([3,2,2,4,3], 3) == 2',
    'assert s.minSumOfLengths([7,3,4,7], 7) == 2',
    'assert s.minSumOfLengths([4,3,2,6,2,3,4], 6) == -1',
    'assert s.minSumOfLengths([3,1,1,1,5,1,2,1], 3) == 3',
  ].join('\n');
  const result = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('1477 custom renderer covers every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderTwoSubarrays1477View(step)');
  const end = source.indexOf('\nfunction renderAverageWindowView(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source, /step\.twoSubarrays1477View[\s\S]*renderTwoSubarrays1477View\(step\)/);

  const element = { innerHTML: '' };
  const context = {
    lang: 'en', $: () => element,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const runs = [problem.builder(problem.defaultInput, { target: 3 }), problem.builder([5, 5], { target: 3 })];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderTwoSubarrays1477View(step);
        assert.match(element.innerHTML, /ts1477-viz/);
        assert.match(element.innerHTML, /ts1477-best/);
        assert.match(element.innerHTML, /ts1477-pair/);
        assert.match(element.innerHTML, /ts1477-result/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
      }
    }
  }
});

test('1477 validates inputs and includes scoped responsive styles', () => {
  assert.throws(() => problem.builder([1, 0, 2], { target: 3 }), /positive integers/);
  assert.throws(() => problem.builder([1, 2], { target: 0 }), /positive integer/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ts1477-viz \{/);
  assert.match(css, /\.ts1477-best > div > span\.lookup/);
  assert.match(css, /\.ts1477-cell\.pair-first/);
  assert.match(css, /@container \(max-width: 520px\)[\s\S]*\.ts1477-result/);
});
