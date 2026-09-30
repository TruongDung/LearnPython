const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');

const problem = SUPPORTED[2336];

function oracle(operations) {
  const present = new Set(Array.from({ length: 1100 }, (_, index) => index + 1));
  return operations.map(([name, value]) => {
    if (name === 'addBack') {
      present.add(value);
      return null;
    }
    const smallest = Math.min(...present);
    present.delete(smallest);
    return smallest;
  });
}

test('2336 is registered as a line-by-line heap allocator', () => {
  assert.equal(problem.slug, 'smallest-number-in-infinite-set');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some((tag) => tag.key === 'heap'));
  assert.ok(problem.tags.some((tag) => tag.key === 'hash-set'));
});

test('2336 matches the published sequence and repeated addBack semantics', () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [1, 2, null, 1, 3, 4]);
  const operations = [
    ['popSmallest'], ['popSmallest'], ['addBack', 1], ['addBack', 1],
    ['addBack', 8], ['popSmallest'], ['popSmallest'], ['addBack', 2], ['popSmallest'],
  ];
  assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
});

test('2336 agrees with an independent finite-prefix oracle', () => {
  let seed = 2336;
  for (let sample = 0; sample < 30; sample += 1) {
    const operations = [];
    for (let index = 0; index < 35; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if (seed % 3 === 0) operations.push(['addBack', 1 + (seed % 20)]);
      else operations.push(['popSmallest']);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('2336 trace owns one valid Python line per frame and preserves heap/set parity', () => {
  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.ok(run.steps.every((step) => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.equal(run.steps.at(-1).hardProblemView.answer.join(','), run.answer.join(','));
  const popLine = problem.code.findIndex((line) => line.includes('heappop(self.added_back)')) + 1;
  const pushLine = problem.code.findIndex((line) => line.includes('heappush(self.added_back')) + 1;
  for (const step of run.steps) {
    const view = step.hardProblemView;
    const heapText = view.groups[0].items[0].value;
    const setText = view.groups[0].items[1].value;
    const heapValues = heapText === '[]' ? [] : heapText.slice(1, -1).split(', ').map(Number);
    const setValues = setText === '[]' ? [] : setText.slice(1, -1).split(', ').map(Number);
    if (step.codeLines[0] === popLine) {
      assert.equal(setValues.length, heapValues.length + 1, 'set removal executes on the next line');
    } else if (step.codeLines[0] === pushLine) {
      assert.equal(heapValues.length, setValues.length + 1, 'set insertion executes on the next line');
    } else {
      assert.deepEqual([...heapValues].sort((a, b) => a - b), setValues);
    }
  }
});

test('2336 validates operations and prepares the Python design runner', () => {
  for (const input of ['bad', '[]', 'null', '{}', '[[]]', '[["popSmallest",1]]', '[["addBack"]]', '[["addBack",0]]', '[["unknown"]]']) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => prepareDesignLiveRun(problem, input));
  }
  const config = prepareDesignLiveRun(problem, problem.defaultInput);
  assert.equal(config.className, 'SmallestInfiniteSet');
  assert.deepEqual(config.constructorArgs, []);
  assert.deepEqual(config.operations, problem.builder(problem.defaultInput).operations);
});

test('2336 displayed Python implementation matches the visualization', () => {
  const operationSets = [
    JSON.parse(problem.defaultInput),
    [['addBack', 1], ['popSmallest'], ['popSmallest'], ['addBack', 1], ['popSmallest']],
  ];
  const cases = operationSets.map((operations) => ({
    config: prepareDesignLiveRun(problem, JSON.stringify(operations)),
    expected: problem.builder(JSON.stringify(operations)).answer,
  }));
  const source = `${problem.code.join('\n')}
import json, sys
for case in json.load(sys.stdin):
    config = case['config']
    instance = SmallestInfiniteSet(*config['constructorArgs'])
    actual = [getattr(instance, op['name'])(*op['args']) for op in config['operations']]
    assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
