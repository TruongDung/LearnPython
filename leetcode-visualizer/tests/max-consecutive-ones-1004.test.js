const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const vm = require('node:vm');

const { SUPPORTED } = require('../problems');
const {
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[1004];

function bruteLongestOnes(nums, k) {
  let best = 0;
  for (let left = 0; left < nums.length; left += 1) {
    let zeros = 0;
    for (let right = left; right < nums.length; right += 1) {
      zeros += nums[right] === 0 ? 1 : 0;
      if (zeros <= k) best = Math.max(best, right - left + 1);
    }
  }
  return best;
}

test('1004 solves official examples and boundary cases', () => {
  const cases = [
    [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2, 6],
    [[0, 0, 1, 1, 1, 0, 0], 0, 3],
    [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3, 10],
    [[1], 0, 1],
    [[0], 0, 0],
    [[0], 1, 1],
    [[0, 0, 0], 3, 3],
  ];
  for (const [nums, k, expected] of cases) {
    const run = problem.builder(nums, { k });
    assert.equal(run.answer, expected, JSON.stringify({ nums, k }));
    assert.equal(run.steps.at(-1).maxConsecutiveOnes1004View.maxLength, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('1004 agrees with exhaustive brute force for every short binary array', () => {
  for (let length = 1; length <= 8; length += 1) {
    for (let mask = 0; mask < 2 ** length; mask += 1) {
      const nums = Array.from({ length }, (_, index) => (mask >> index) & 1);
      for (let k = 0; k <= length; k += 1) {
        assert.equal(problem.builder(nums, { k }).answer, bruteLongestOnes(nums, k), JSON.stringify({ nums, k }));
      }
    }
  }
});

test('1004 trace separates expansion, budget validation, shrinking, and record updates', () => {
  const run = problem.builder([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], { k: 2 });
  const events = new Set(run.steps.map((step) => step.maxConsecutiveOnes1004View.event));
  for (const event of [
    'init-left', 'init-zero-count', 'init-best', 'expand', 'inspect-right',
    'use-flip', 'validate', 'inspect-left', 'refund-flip', 'move-left',
    'record-best', 'keep-best', 'done',
  ]) assert.ok(events.has(event), `missing event ${event}`);

  for (const step of run.steps) {
    const view = step.maxConsecutiveOnes1004View;
    assert.equal(view.problemId, 1004);
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length);
    assert.ok(step.title.vi && step.title.en);
    assert.ok(step.note.vi && step.note.en);
    assert.equal(view.countedZeroIndices.length, view.zeroCount);
    if (view.event === 'validate' && view.valid) {
      assert.ok(view.zeroCount <= view.k);
    }
    if (view.phase === 'record' || view.phase === 'done') {
      assert.equal(view.valid, true);
      assert.ok(view.zeroCount <= view.k);
    }
  }

  const overflow = run.steps.find((step) => (
    step.maxConsecutiveOnes1004View.event === 'validate'
    && !step.maxConsecutiveOnes1004View.valid
  ));
  assert.ok(overflow);
  assert.equal(overflow.maxConsecutiveOnes1004View.zeroCount, 3);
  assert.equal(overflow.maxConsecutiveOnes1004View.remainingFlips, -1);

  const final = run.steps.at(-1).maxConsecutiveOnes1004View;
  assert.deepEqual(final.bestIndices, [4, 5, 6, 7, 8, 9]);
  assert.equal(final.right, 10);
  assert.equal(final.maxLength, 6);
});

test('1004 keeps zero-budget and refund transitions internally consistent', () => {
  const run = problem.builder([0, 1, 0, 1, 1], { k: 0 });
  const refunds = run.steps.filter((step) => step.maxConsecutiveOnes1004View.event === 'refund-flip');
  assert.equal(refunds.length, 2);
  for (const step of refunds) {
    const view = step.maxConsecutiveOnes1004View;
    assert.equal(view.zeroCount, 0);
    assert.deepEqual(view.countedZeroIndices, []);
    assert.equal(view.removedIndex, view.left);
  }
  assert.equal(run.answer, 2);
  assert.deepEqual(run.steps.at(-1).maxConsecutiveOnes1004View.bestIndices, [3, 4]);
});

test('1004 validates direct builder inputs and k', () => {
  assert.throws(() => problem.builder([], { k: 0 }), /non-empty binary array/);
  assert.throws(() => problem.builder([1, 2, 0], { k: 1 }), /non-empty binary array/);
  assert.throws(() => problem.builder([1, 0], { k: -1 }), /between 0 and nums.length/);
  assert.throws(() => problem.builder([1, 0], { k: 3 }), /between 0 and nums.length/);
  assert.throws(() => problem.builder([1, 0], { k: 0.5 }), /between 0 and nums.length/);
});

test('1004 displayed Python agrees with representative inputs', () => {
  const source = `${problem.code.join('\n')}
cases = [
    ([1,1,1,0,0,0,1,1,1,1,0], 2, 6),
    ([0,0,1,1,1,0,0], 0, 3),
    ([0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], 3, 10),
    ([0], 0, 0),
]
for nums, k, expected in cases:
    assert Solution().longestOnes(nums, k) == expected
`;
  const executed = spawnSync('python3', ['-c', source], { encoding: 'utf8' });
  assert.equal(executed.status, 0, executed.stderr);
});

test('1004 dedicated renderer handles every state in English and Vietnamese', () => {
  const script = readFrontendJavaScript();
  const start = script.indexOf('function renderMaxConsecutiveOnes1004View(step)');
  const end = script.indexOf('\nfunction ', start + 20);
  assert.ok(start >= 0 && end > start);

  const element = { innerHTML: '' };
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: (value) => String(value),
  };
  context.pick = (value) => value?.[context.lang] ?? value ?? '';
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [
    problem.builder([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], { k: 2 }),
    problem.builder([0, 1, 0, 1, 1], { k: 0 }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderMaxConsecutiveOnes1004View(step);
        assert.match(element.innerHTML, /ones1004-viz/);
        assert.match(element.innerHTML, /ones1004-budget/);
        assert.match(element.innerHTML, /ones1004-best/);
        assert.equal((element.innerHTML.match(/class="ones1004-cell(?: |")/g) || []).length, run.original.length);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity|object Object/);
      }
    }
  }

  const overflow = runs[0].steps.find((step) => !step.maxConsecutiveOnes1004View.valid);
  context.lang = 'en';
  context.renderMaxConsecutiveOnes1004View(overflow);
  assert.match(element.innerHTML, /ones1004-array invalid/);
  assert.match(element.innerHTML, /ones1004-budget invalid/);
  assert.match(element.innerHTML, /<span class="over"><b>\+1<\/b>/);
  assert.match(element.innerHTML, /0→1/);
  assert.doesNotMatch(element.innerHTML, /ones1004-action|ones1004-metrics|ones1004-invariant/);

  const compactText = element.innerHTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  assert.ok(compactText.length < 230, `visual should stay compact, got ${compactText.length} chars`);

  context.renderMaxConsecutiveOnes1004View(runs[1].steps.at(-1));
  assert.match(element.innerHTML, /class="none"><b>∅<\/b><small>k=0<\/small>/);
});

test('1004 frontend selects the dedicated responsive renderer', () => {
  const index = readFrontendIndex();
  const script = readFrontendJavaScript();
  const styles = readFrontendStyles();
  assert.match(index, /renderer-max-consecutive-ones-1004\.js\?v=max-consecutive-ones-1004-v3/);
  assert.match(index, /max-consecutive-ones-1004\.css\?v=max-consecutive-ones-1004-v4/);
  assert.match(script, /step\.maxConsecutiveOnes1004View/);
  assert.match(styles, /\.ones1004-viz/);
  assert.match(styles, /\[data-theme="light"\] \.ones1004-viz/);
  assert.match(styles, /@container \(max-width: 580px\)/);
  assert.match(styles, /\.ones1004-cells \{[^}]*grid-template-columns: repeat\(auto-fit,[^}]*overflow: visible/s);
  assert.match(styles, /\.ones1004-best > div \{[^}]*flex-wrap: wrap[^}]*overflow: visible/s);
  assert.doesNotMatch(styles, /\.ones1004-(?:cells|best > div) \{[^}]*overflow-x: auto/s);
  assert.match(styles, /\.ones1004-bottom/);
});
