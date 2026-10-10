const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

const problem = SUPPORTED[1146];

function oracle(length, operations) {
  const values = Array(length).fill(0);
  const snapshots = [];
  return operations.map(([name, first, second]) => {
    if (name === 'set') {
      values[first] = second;
      return null;
    }
    if (name === 'snap') {
      snapshots.push([...values]);
      return snapshots.length - 1;
    }
    return snapshots[second][first];
  });
}

test('1146 solves the official example', () => {
  const run = problem.builder(problem.defaultInput, { length: 3 });
  assert.deepEqual(run.answer, [null, 0, null, 5]);
  assert.deepEqual(run.original, {
    length: 3,
    operations: [['set', 0, 5], ['snap'], ['set', 0, 6], ['get', 0, 0]],
  });
});

test('1146 coalesces repeated sets and preserves independent index histories', () => {
  const operations = [
    ['set', 0, 4], ['set', 0, 7], ['snap'], ['set', 0, 9], ['snap'],
    ['get', 0, 0], ['get', 0, 1], ['get', 1, 1],
  ];
  const run = problem.builder(JSON.stringify(operations), { length: 2 });
  assert.deepEqual(run.answer, [null, null, 0, null, 1, 7, 9, 0]);
  assert.deepEqual(run.steps.at(-1).snapshotArray1146View.histories, [
    [[0, 7], [1, 9]],
    [[0, 0]],
  ]);
  assert.equal(run.steps.filter((step) => step.snapshotArray1146View.phase === 'set-update').length, 2);
});

test('1146 agrees with a full-copy snapshot oracle on deterministic random streams', () => {
  let seed = 1146;
  for (let sample = 0; sample < 35; sample += 1) {
    const length = 1 + (sample % 8);
    const operations = [['snap']];
    let snapshotCount = 1;
    for (let index = 0; index < 55; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const kind = seed % 5;
      if (kind < 2) operations.push(['set', (seed >>> 4) % length, (seed >>> 9) % 1000]);
      else if (kind === 2) {
        operations.push(['snap']);
        snapshotCount += 1;
      } else operations.push(['get', (seed >>> 4) % length, (seed >>> 10) % snapshotCount]);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations), { length }).answer, oracle(length, operations));
  }
});

test('1146 trace exposes sparse histories and every binary-search direction', () => {
  const operations = [
    ['set', 0, 2], ['snap'], ['set', 0, 4], ['snap'], ['set', 0, 8], ['snap'],
    ['get', 0, 1],
  ];
  const run = problem.builder(JSON.stringify(operations), { length: 1 });
  const search = run.steps.filter((step) => ['search-left', 'search-right'].includes(step.snapshotArray1146View.phase));
  assert.ok(search.some((step) => step.snapshotArray1146View.binary.decision === 'left'));
  assert.ok(search.some((step) => step.snapshotArray1146View.binary.decision === 'right'));
  assert.ok(search.every((step) => Number.isInteger(step.snapshotArray1146View.binary.mid)));
  const found = run.steps.find((step) => step.snapshotArray1146View.phase === 'get-done').snapshotArray1146View.binary;
  assert.deepEqual(found.record, [1, 4]);
  assert.equal(found.resultPosition, 1);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.deepEqual(run.steps.at(-1).snapshotArray1146View.answer, run.answer);
});

test('1146 validates length, operation shapes, bounds, values, and existing snapshots', () => {
  assert.throws(() => problem.builder(problem.defaultInput, { length: 0 }));
  assert.throws(() => problem.builder(problem.defaultInput, { length: 41 }));
  for (const input of [
    'bad',
    '[]',
    '[["remove",0]]',
    '[["set",3,1]]',
    '[["set",0,-1]]',
    '[["set",0,1000000001]]',
    '[["snap",1]]',
    '[["get",0,0]]',
    '[["snap"],["get",0,1]]',
  ]) assert.throws(() => problem.builder(input, { length: 3 }));
});

test('1146 displayed Python matches the live design runner', () => {
  const operations = [
    ['set', 0, 5], ['set', 0, 7], ['snap'], ['set', 1, 9], ['snap'],
    ['get', 0, 0], ['get', 0, 1], ['get', 1, 0], ['get', 1, 1],
  ];
  const config = prepareDesignLiveRun(problem, JSON.stringify(operations), { length: 2 });
  assert.deepEqual(config, {
    className: 'SnapshotArray',
    constructorArgs: [2],
    operations: operations.map(([name, ...args]) => ({ name, args })),
  });
  const expected = oracle(2, operations);
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = SnapshotArray(*case['config']['constructorArgs'])
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('1146 is registered as a Google design and binary-search lesson', () => {
  assert.equal(problem.id, 1146);
  assert.equal(problem.slug, 'snapshot-array');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'design');
  assert.ok(problem.tags.some((tag) => tag.key === 'binary-search'));
  assert.ok(problem.tags.some((tag) => tag.key === 'array'));
  assert.ok(problem.companies.includes('google'));
  assert.equal(problem.debugMode, 'line-by-line');
});

test('1146 dedicated sparse-history renderer and responsive assets are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-snapshot-array-1146.js'));
  assert.ok(STYLESHEET_ASSETS.includes('snapshot-array-1146.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderSnapshotArray1146View\(step\)/);
  assert.match(javascript, /Why bisect_right, then subtract 1/);
  assert.match(styles, /\.sa1146-history-row/);
  assert.match(styles, /@container \(max-width:480px\)/);
  assert.ok(index.indexOf('renderer-snapshot-array-1146.js') < index.indexOf('script.js?'));
});
