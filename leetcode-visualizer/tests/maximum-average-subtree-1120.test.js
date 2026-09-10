const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[1120];

function parseLevelOrder(values) {
  const root = { value: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
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
  return root;
}

function bruteMaximumAverage(values) {
  const root = parseLevelOrder(values);
  let best = -Infinity;
  const visit = node => {
    if (!node) return [0, 0];
    const [leftSum, leftCount] = visit(node.left);
    const [rightSum, rightCount] = visit(node.right);
    const sum = leftSum + node.value + rightSum;
    const count = leftCount + 1 + rightCount;
    best = Math.max(best, sum / count);
    return [sum, count];
  };
  visit(root);
  return best;
}

test('1120 is registered with the O(n) postorder solution', () => {
  assert.equal(problem.id, 1120);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.premium, true);
  assert.equal(problem.slug, 'maximum-average-subtree');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.equal(problem.complexity.space, 'O(h)');
  assert.match(problem.code.join('\n'), /subtree_sum \/ subtree_count/);
  assert.ok(problem.builder(problem.defaultInput).steps.every(step => step.maximumAverage1120View));
});

test('1120 handles the published example and representative subtree shapes', () => {
  const cases = [
    ['5,6,1', 6],
    ['1', 1],
    ['100,0,0', 100 / 3],
    ['1,2,3', 3],
    ['0,0,0', 0],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.ok(Math.abs(run.answer - expected) < 1e-12, input);
    assert.ok(Math.abs(run.steps.at(-1).maximumAverage1120View.best - expected) < 1e-12, input);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('1120 agrees with an independent oracle on random level-order trees', () => {
  let seed = 1120;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };
  for (let caseIndex = 0; caseIndex < 180; caseIndex += 1) {
    const length = 1 + random(20);
    const values = [random(101)];
    let openParents = 1;
    for (let index = 1; index < length && openParents > 0; index += 1) {
      const value = random(5) === 0 ? null : random(101);
      values.push(value);
      if (index % 2 === 0) openParents -= 1;
      if (value !== null) openParents += 1;
    }
    while (values.at(-1) === null) values.pop();
    const input = values.map(value => value === null ? 'null' : value).join(',');
    assert.ok(Math.abs(problem.builder(input).answer - bruteMaximumAverage(values)) < 1e-12, input);
  }
});

test('1120 trace shows enter, combine, best update, best retention, and completion', () => {
  const run = problem.builder('5,6,1');
  const events = run.steps.map(step => step.maximumAverage1120View.event);
  for (const event of ['start', 'enter', 'combine', 'new-best', 'keep-best', 'done']) {
    assert.ok(events.includes(event), `missing trace event: ${event}`);
  }
  for (const step of run.steps) {
    const view = step.maximumAverage1120View;
    assert.equal(view.nodes.length, 3);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
    assert.ok(view.ranking.every((item, index, items) => index === 0 || items[index - 1].average >= item.average));
  }
  const final = run.steps.at(-1).maximumAverage1120View;
  assert.equal(final.bestNode, 1);
  assert.deepEqual(final.bestSubtreeIds, [1]);
});

test('1120 validates bracketed input, values, malformed trees, and visualization size', () => {
  assert.equal(problem.builder('[5,6,1]').answer, 6);
  assert.throws(() => problem.builder(''), /non-empty binary tree/);
  assert.throws(() => problem.builder('1,-1'), /integers from 0 to 100000/);
  assert.throws(() => problem.builder('1,100001'), /integers from 0 to 100000/);
  assert.throws(() => problem.builder('1,null,null,2'), /values remain/);
  assert.throws(() => problem.builder(Array(32).fill(1).join(',')), /at most 31 tree nodes/);
});

test('1120 custom renderer covers every phase in Vietnamese and English', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderMaximumAverage1120View(step)');
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
    for (const run of [problem.builder(problem.defaultInput), problem.builder('100,0,0')]) {
      for (const step of run.steps) {
        context.renderMaximumAverage1120View(step);
        assert.match(element.innerHTML, /ma1120-viz/);
        assert.match(element.innerHTML, /ma1120-tree/);
        assert.match(element.innerHTML, /ma1120-ranking/);
        assert.match(element.innerHTML, /ma1120-(formula|rule)/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
