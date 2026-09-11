const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[3483];

function oracle(digits) {
  const result = new Set();
  for (let i = 0; i < digits.length; i += 1) {
    for (let j = 0; j < digits.length; j += 1) {
      for (let k = 0; k < digits.length; k += 1) {
        if (i === j || i === k || j === k) continue;
        const value = 100 * digits[i] + 10 * digits[j] + digits[k];
        if (digits[i] !== 0 && digits[k] % 2 === 0) result.add(value);
      }
    }
  }
  return result;
}

test('3483 is registered with complete metadata and a dedicated visualization', () => {
  assert.equal(problem.id, 3483);
  assert.equal(problem.slug, 'unique-3-digit-even-numbers');
  assert.equal(problem.difficulty, 'easy');
  assert.equal(problem.category.key, 'array');
  assert.equal(problem.complexity.time, 'O(n³)');
  assert.deepEqual(problem.liveArgs([1, 2, 3, 4]), [[1, 2, 3, 4]]);

  const run = problem.builder(problem.defaultInput);
  assert.equal(run.answer, 12);
  assert.ok(run.steps.length > 1);
  assert.ok(run.steps.every(step => step.uniqueEven3483View));
});

test('3483 matches all four published examples', () => {
  const cases = [
    [[1, 2, 3, 4], 12],
    [[0, 2, 2], 2],
    [[6, 6, 6], 1],
    [[1, 3, 5], 0],
  ];
  for (const [digits, expected] of cases) {
    const frozen = Object.freeze([...digits]);
    const run = problem.builder(frozen);
    assert.equal(run.answer, expected);
    assert.deepEqual(frozen, digits);
    assert.equal(run.steps.at(-1).uniqueEven3483View.numbers.length, expected);
    assert.equal(run.steps.at(-1).uniqueEven3483View.final, true);
  }
});

test('3483 agrees with an independent oracle on deterministic random inputs', () => {
  let seed = 3483;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 90; caseIndex += 1) {
    const length = 3 + random(6);
    const digits = Array.from({ length }, () => random(10));
    const expected = oracle(digits);
    const run = problem.builder(digits);
    assert.equal(run.answer, expected.size, JSON.stringify(digits));
    assert.deepEqual(run.numbers, [...expected].sort((a, b) => a - b), JSON.stringify(digits));
  }
});

test('3483 trace explains leading zero, odd units, duplicates, new values, and completion', () => {
  const run = problem.builder([0, 2, 2, 3]);
  const events = run.steps.map(step => step.uniqueEven3483View.event);
  for (const event of ['intro', 'reject-leading-zero', 'choose-hundreds', 'choose-tens', 'reject-odd-ones', 'add-number', 'duplicate', 'done']) {
    assert.ok(events.includes(event), `missing trace event: ${event}`);
  }
  for (const step of run.steps) {
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    assert.equal(step.codeLines.length, 1, 'each teaching step should highlight one code line');
    assert.ok(Array.isArray(step.uniqueEven3483View.numbers));
  }
});

test('3483 validates digit count and values', () => {
  assert.throws(() => problem.builder([1, 2]), /between 3 and 10/);
  assert.throws(() => problem.builder(Array(11).fill(1)), /between 3 and 10/);
  assert.throws(() => problem.builder([1, -1, 2]), /between 0 and 9/);
  assert.throws(() => problem.builder([1, 2, 10]), /between 0 and 9/);
  assert.throws(() => problem.builder([1, 2, 2.5]), /between 0 and 9/);
});

test('3483 custom renderer handles every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderUniqueEven3483View(step)');
  const end = script.indexOf('\nfunction renderPourWater755View(step)', start);
  assert.ok(start >= 0 && end > start);
  assert.match(script, /step\.uniqueEven3483View[\s\S]*renderUniqueEven3483View\(step\)/);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [problem.builder([1, 2, 3, 4]), problem.builder([0, 2, 2, 3])];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderUniqueEven3483View(step);
        assert.match(element.innerHTML, /ue3483-viz/);
        assert.match(element.innerHTML, /ue3483-digits/);
        assert.match(element.innerHTML, /ue3483-set/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
