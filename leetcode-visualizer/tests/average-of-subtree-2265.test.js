const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2265];

function bruteAverageMatches(values) {
  let index = 0;
  const root = { value: values[0], left: null, right: null };
  const queue = [root];
  index = 1;
  while (queue.length && index < values.length) {
    const node = queue.shift();
    if (values[index] !== null) {
      node.left = { value: values[index], left: null, right: null };
      queue.push(node.left);
    }
    index += 1;
    if (index < values.length && values[index] !== null) {
      node.right = { value: values[index], left: null, right: null };
      queue.push(node.right);
    }
    index += 1;
  }
  let answer = 0;
  const visit = node => {
    if (!node) return [0, 0];
    const [leftSum, leftCount] = visit(node.left);
    const [rightSum, rightCount] = visit(node.right);
    const sum = leftSum + node.value + rightSum;
    const count = leftCount + 1 + rightCount;
    if (node.value === Math.floor(sum / count)) answer += 1;
    return [sum, count];
  };
  visit(root);
  return answer;
}

test('2265 is registered with the postorder sum-and-count solution', () => {
  assert.equal(problem.id, 2265);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.slug, 'count-nodes-equal-to-average-of-subtree');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /subtree_sum \/\/ subtree_count/);

  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every(step => step.averageSubtree2265View));
});

test('2265 matches both official examples and a non-matching root', () => {
  const cases = [
    ['4,8,5,0,1,null,6', 5],
    ['1', 1],
    ['1,2,3', 2],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected);
    assert.equal(run.steps.at(-1).averageSubtree2265View.answer, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('2265 agrees with an independent recursive oracle on random level-order trees', () => {
  let seed = 2265;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 150; caseIndex += 1) {
    const length = 1 + random(15);
    const values = [random(20)];
    let availableParents = 1;
    for (let index = 1; index < length && availableParents > 0; index += 1) {
      const value = random(5) === 0 ? null : random(20);
      values.push(value);
      if (index % 2 === 0) availableParents -= 1;
      if (value !== null) availableParents += 1;
    }
    while (values.at(-1) === null) values.pop();
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.equal(problem.builder(input).answer, bruteAverageMatches(values), input);
  }
});

test('2265 trace exposes postorder, formula, comparison, and final states', () => {
  const run = problem.builder(problem.defaultInput);
  const events = run.steps.map(step => step.averageSubtree2265View.event);
  for (const event of ['start', 'enter', 'combine', 'match', 'miss', 'done']) {
    assert.ok(events.includes(event), `missing trace event: ${event}`);
  }
  for (const step of run.steps) {
    const view = step.averageSubtree2265View;
    assert.equal(view.nodes.length, 6);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
  const rootComparison = run.steps.find(step => step.averageSubtree2265View.formula?.nodeValue === 4 && step.averageSubtree2265View.event === 'match');
  assert.equal(rootComparison.averageSubtree2265View.formula.sum, 24);
  assert.equal(rootComparison.averageSubtree2265View.formula.count, 6);
  assert.equal(rootComparison.averageSubtree2265View.formula.average, 4);
});

test('2265 accepts bracketed input and validates values and visualization size', () => {
  assert.equal(problem.builder('[4,8,5,0,1,null,6]').answer, 5);
  assert.throws(() => problem.builder(''), /non-empty binary tree/);
  assert.throws(() => problem.builder('1,-1'), /integers from 0 to 1000/);
  assert.throws(() => problem.builder('1,2.5'), /integers from 0 to 1000/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /at most 31 tree nodes/);
});

test('2265 custom renderer handles every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderAverageSubtree2265View(step)');
  const end = script.indexOf('\nfunction renderMissingIntegerView(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of [problem.builder(problem.defaultInput), problem.builder('1')]) {
      for (const step of run.steps) {
        context.renderAverageSubtree2265View(step);
        assert.match(element.innerHTML, /as2265-viz/);
        assert.match(element.innerHTML, /as2265-tree/);
        assert.match(element.innerHTML, /as2265-stack/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
