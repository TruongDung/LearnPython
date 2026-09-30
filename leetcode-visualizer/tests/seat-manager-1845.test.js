const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const problem = SUPPORTED[1845];

function oracle(n, operations) {
  const available = new Set(Array.from({ length: n }, (_, index) => index + 1));
  return operations.map(([name, seat]) => {
    if (name === 'unreserve') { available.add(seat); return null; }
    const smallest = Math.min(...available); available.delete(smallest); return smallest;
  });
}

test('1845 is registered as a line-by-line min-heap design problem', () => {
  assert.equal(problem.slug, 'seat-reservation-manager');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.ok(problem.tags.some((tag) => tag.key === 'heap'));
});

test('1845 matches the published operation sequence', () => {
  assert.deepEqual(problem.builder(problem.defaultInput, { n: 5 }).answer, [1, 2, null, 2, 3, 4, 5, null]);
});

test('1845 agrees with an independent seat-set oracle', () => {
  let seed = 1845;
  for (let sample = 0; sample < 40; sample += 1) {
    const n = 3 + (sample % 8);
    const available = new Set(Array.from({ length: n }, (_, index) => index + 1));
    const reserved = new Set();
    const operations = [];
    for (let index = 0; index < 30; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if (!available.size || (reserved.size && seed % 3 === 0)) {
        const seats = [...reserved].sort((a, b) => a - b);
        const seat = seats[seed % seats.length];
        operations.push(['unreserve', seat]); reserved.delete(seat); available.add(seat);
      } else {
        const seat = Math.min(...available);
        operations.push(['reserve']); available.delete(seat); reserved.add(seat);
      }
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations), { n }).answer, oracle(n, operations));
  }
});

test('1845 trace has one active line and partitions all seats', () => {
  const n = 5;
  const run = problem.builder(problem.defaultInput, { n });
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  for (const step of run.steps) {
    const items = step.hardProblemView.groups[0].items;
    const parse = (text) => text === '[]' ? [] : text.slice(1, -1).split(', ').map(Number);
    const available = parse(items[1].value);
    const reserved = parse(items[2].value);
    assert.equal(new Set([...available, ...reserved]).size, n);
    assert.equal(available.length + reserved.length, n);
  }
});

test('1845 validation and Python design runner use the same operations', () => {
  assert.throws(() => problem.builder('[["reserve"],["reserve"]]', { n: 1 }), /no available seat/);
  assert.throws(() => prepareDesignLiveRun(problem, '[["reserve"],["reserve"]]', { n: 1 }), /no available seat/);
  assert.throws(() => problem.builder('[["unreserve",1]]', { n: 3 }), /reserved seat/);
  assert.throws(() => prepareDesignLiveRun(problem, '[["unreserve",1]]', { n: 3 }), /reserved seat/);
  assert.throws(() => problem.builder('[["unreserve",4]]', { n: 3 }), /reserved seat/);
  const config = prepareDesignLiveRun(problem, problem.defaultInput, { n: 5 });
  assert.equal(config.className, 'SeatManager');
  assert.deepEqual(config.constructorArgs, [5]);
  assert.deepEqual(config.operations, problem.builder(problem.defaultInput, { n: 5 }).operations);

  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = SeatManager(*case['config']['constructorArgs'])
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], {
    input: JSON.stringify({ config, expected: problem.builder(problem.defaultInput, { n: 5 }).answer }),
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
});
