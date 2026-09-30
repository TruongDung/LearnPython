const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const problem = SUPPORTED[379];

function oracle(maxNumbers, operations) {
  const queue = Array.from({ length: maxNumbers }, (_, index) => index);
  const free = new Set(queue);
  return operations.map(([name, number]) => {
    if (name === 'get') {
      if (!queue.length) return -1;
      const value = queue.shift(); free.delete(value); return value;
    }
    if (name === 'check') return free.has(number);
    if (!free.has(number)) { free.add(number); queue.push(number); }
    return null;
  });
}

test('379 is registered with queue and set metadata', () => {
  assert.equal(problem.slug, 'design-phone-directory');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.premium, true);
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['queue', 'hash-set']);
});

test('379 matches the published example and exhausted directory behavior', () => {
  assert.deepEqual(problem.builder(problem.defaultInput, { maxNumbers: 3 }).answer, [0, 1, true, 2, false, null, true]);
  assert.deepEqual(problem.builder('[["get"],["get"],["get"],["release",0],["release",0],["get"],["get"]]', { maxNumbers: 2 }).answer, [0, 1, -1, null, null, 0, -1]);
});

test('379 agrees with an independent FIFO directory oracle', () => {
  let seed = 379;
  for (let sample = 0; sample < 40; sample += 1) {
    const maxNumbers = 2 + sample % 9;
    const operations = [];
    for (let index = 0; index < 45; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const choice = seed % 3;
      const number = seed % maxNumbers;
      operations.push(choice === 0 ? ['get'] : choice === 1 ? ['check', number] : ['release', number]);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations), { maxNumbers }).answer, oracle(maxNumbers, operations));
  }
});

test('379 trace is line-by-line and queue/set resynchronize after mutation lines', () => {
  const run = problem.builder(problem.defaultInput, { maxNumbers: 3 });
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  const transitionLines = new Set([
    problem.code.findIndex((line) => line.includes('popleft()')) + 1,
    problem.code.findIndex((line) => line.includes('self.free.add')) + 1,
  ]);
  for (const step of run.steps) {
    const invariant = step.hardProblemView.groups[0].items[2].value;
    if (!transitionLines.has(step.codeLines[0])) assert.equal(invariant, 'queue = free');
  }
});

test('379 validates bounds and displayed Python matches the design runner', () => {
  assert.throws(() => problem.builder('[["check",3]]', { maxNumbers: 3 }), /0..2/);
  assert.throws(() => prepareDesignLiveRun(problem, '[["check",3]]', { maxNumbers: 3 }), /0..2/);
  assert.throws(() => problem.builder('[["release",-1]]', { maxNumbers: 3 }), /0..2/);
  assert.throws(() => prepareDesignLiveRun(problem, '[["release",-1]]', { maxNumbers: 3 }), /0..2/);
  const config = prepareDesignLiveRun(problem, problem.defaultInput, { maxNumbers: 3 });
  assert.equal(config.className, 'PhoneDirectory');
  assert.deepEqual(config.constructorArgs, [3]);
  const expected = problem.builder(problem.defaultInput, { maxNumbers: 3 }).answer;
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = PhoneDirectory(*case['config']['constructorArgs'])
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
