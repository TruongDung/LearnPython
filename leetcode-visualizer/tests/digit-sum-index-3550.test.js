const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3550];
const solve = (nums) => problem.builder(nums);

function oracle(nums) {
  for (let index = 0; index < nums.length; index++) {
    const sum = String(nums[index]).split('').reduce((total, digit) => total + Number(digit), 0);
    if (sum === index) return index;
  }
  return -1;
}

test('3550 is registered as an array and digit-math lesson', () => {
  assert.equal(problem.id, 3550);
  assert.equal(problem.slug, 'smallest-index-with-digit-sum-equal-to-index');
  assert.equal(problem.category.key, 'array');
  assert.ok(problem.tags.some((tag) => tag.key === 'math'));
});

test('3550 matches all published examples and zero/early-return boundaries', () => {
  assert.equal(solve([1, 3, 2]).answer, 2);
  assert.equal(solve([1, 10, 11]).answer, 1);
  assert.equal(solve([1, 2, 3]).answer, -1);
  assert.equal(solve([0]).answer, 0);
  assert.equal(solve([2, 1000, 11]).answer, 1);
  assert.equal(solve([10, 2, 2]).answer, 2);
});

test('3550 agrees with an independent string-digit oracle on random arrays', () => {
  let seed = 3550;
  const rand = (max) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 180; trial++) {
    const nums = Array.from({ length: 1 + rand(35) }, () => rand(1001));
    assert.equal(solve(nums).answer, oracle(nums), `nums=${nums}`);
  }
});

test('3550 trace adds rightmost digits and stops at the smallest matching index', () => {
  const nums = [1, 10, 11];
  const run = solve(nums);
  assert.equal(run.steps.at(-1).final, true);
  assert.equal(run.steps.at(-1).digitSum3550View.answer, 1);
  assert.ok(run.steps.some((step) => step.digitSum3550View.phase === 'add-digit'));
  assert.ok(run.steps.some((step) => step.digitSum3550View.phase === 'remove-digit'));
  for (const step of run.steps) {
    assert.equal(step.codeLines.length, 1);
    assert.ok(step.codeLines[0] >= 3 && step.codeLines[0] <= problem.code.length);
    const view = step.digitSum3550View;
    assert.ok(view);
    if (view.total !== null) {
      const processedDigits = view.processed ? String(view.value).slice(-view.processed) : '';
      const expected = [...processedDigits].reduce((sum, digit) => sum + Number(digit), 0);
      assert.equal(view.total, expected);
    }
    if (view.phase === 'found') assert.equal(view.total, view.i);
  }
  assert.ok(run.steps.every((step) => step.digitSum3550View.i === null || step.digitSum3550View.i <= 1));
});

test('3550 validates the official input bounds', () => {
  assert.throws(() => solve([]));
  assert.throws(() => solve(Array(101).fill(1)));
  assert.throws(() => solve([-1]));
  assert.throws(() => solve([1001]));
  assert.throws(() => solve([1.5]));
});

test('3550 caps a long trace while still returning -1', () => {
  const nums = Array.from({ length: 100 }, (_, index) => index + 1);
  const run = solve(nums);
  assert.equal(run.answer, -1);
  assert.ok(run.steps.length <= 701);
  assert.equal(run.steps.at(-1).digitSum3550View.omitted, true);
  assert.ok(run.steps.at(-1).digitSum3550View.cells.every((cell) => cell.scanned));
});

test('3550 renderer handles every phase in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderDigitSum3550View(step)');
  const end = source.indexOf('\nfunction renderSlidingFreqView(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const nums of [[1, 10, 11], [1, 2, 3], [0]]) {
      for (const step of solve(nums).steps) {
        context.renderDigitSum3550View(step);
        assert.match(element.innerHTML, /ds3550-viz/);
        assert.match(element.innerHTML, /ds3550-digits/);
        assert.doesNotMatch(element.innerHTML, /undefined|NaN|Infinity/);
        if (step.digitSum3550View.phase === 'sum-init' && step.digitSum3550View.value === 10) {
          assert.match(element.innerHTML, /… = 0/);
        }
        if (step.final && step.digitSum3550View.answer === -1) {
          assert.match(element.innerHTML, language === 'vi' ? /Đã kiểm tra mọi chỉ số/ : /All indices checked/);
          assert.doesNotMatch(element.innerHTML, /— \? —/);
        }
      }
    }
  }
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.ds3550-viz \{/);
  assert.match(css, /\.ds3550-cell\.matched/);
});
