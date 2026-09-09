const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[31];

test('31 returns the immediate next permutation for representative inputs', () => {
  const cases = [
    [[1, 2, 3], [1, 3, 2]],
    [[3, 2, 1], [1, 2, 3]],
    [[1, 1, 5], [1, 5, 1]],
    [[1, 3, 5, 4, 2], [1, 4, 2, 3, 5]],
    [[2, 3, 1, 3, 3], [2, 3, 3, 1, 3]],
    [[1], [1]],
  ];

  for (const [input, expected] of cases) {
    const frozen = Object.freeze([...input]);
    const run = problem.builder(frozen);
    assert.deepEqual(run.answer, expected);
    assert.deepEqual(frozen, input);
    assert.equal(run.steps.at(-1).final, true);
    assert.deepEqual(run.steps.at(-1).nextPermutationView.answer, expected);
  }
});

test('31 trace explains pivot, successor, swap, and suffix reversal', () => {
  const run = problem.builder([1, 3, 5, 4, 2]);
  const events = run.steps.map(step => step.nextPermutationView.event);

  assert.ok(events.filter(event => event === 'pivot-check').length >= 2);
  assert.ok(events.includes('pivot-found'));
  assert.ok(events.includes('successor-check'));
  assert.ok(events.includes('successor-found'));
  assert.ok(events.includes('swap'));
  assert.ok(events.includes('reverse-start'));
  assert.ok(events.includes('reverse-swap'));
  assert.equal(events.at(-1), 'done');

  for (const step of run.steps) {
    assert.ok(step.nextPermutationView);
    assert.deepEqual(step.arr, step.nextPermutationView.arr);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
});

test('31 descending input explicitly skips successor and pivot swap', () => {
  const run = problem.builder([4, 3, 2, 1]);
  const events = run.steps.map(step => step.nextPermutationView.event);

  assert.ok(events.includes('no-pivot'));
  assert.ok(!events.includes('successor-found'));
  assert.ok(!events.includes('swap'));
  assert.deepEqual(run.answer, [1, 2, 3, 4]);
});

test('31 custom visualization renders every phase in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderNextPermutation31View(step)');
  const end = script.indexOf('\n// ---- Permutations (#46)', start);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: value => String(value) };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const input of [[1, 3, 5, 4, 2], [4, 3, 2, 1], [1]]) {
      for (const step of problem.builder(input).steps) {
        context.renderNextPermutation31View(step);
        assert.match(element.innerHTML, /np31-viz/);
        assert.match(element.innerHTML, /np31-phases/);
        assert.match(element.innerHTML, /np31-cells/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
