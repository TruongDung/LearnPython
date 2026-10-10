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

const problem = SUPPORTED[2013];

function oracle(operations) {
  const frequency = new Map();
  const key = (x, y) => `${x},${y}`;
  return operations.map(([name, [px, py]]) => {
    if (name === 'add') {
      frequency.set(key(px, py), (frequency.get(key(px, py)) || 0) + 1);
      return null;
    }
    let total = 0;
    for (const [stored, count] of frequency) {
      const [x, y] = stored.split(',').map(Number);
      if (x !== px && Math.abs(x - px) === Math.abs(y - py)) {
        total += count * (frequency.get(key(x, py)) || 0) * (frequency.get(key(px, y)) || 0);
      }
    }
    return total;
  });
}

test('2013 solves the official operation stream and duplicate multiplicity', () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [null, null, null, 1, 0, null, 2]);
  const operations = [
    ['add', [0, 0]], ['add', [2, 0]], ['add', [2, 0]],
    ['add', [0, 2]], ['add', [2, 2]], ['add', [2, 2]], ['add', [2, 2]],
    ['count', [0, 0]],
  ];
  assert.equal(problem.builder(JSON.stringify(operations)).answer.at(-1), 6);
});

test('2013 agrees with an independent frequency-map oracle', () => {
  let seed = 2013;
  for (let sample = 0; sample < 35; sample += 1) {
    const operations = [];
    for (let index = 0; index < 45; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const x = seed % 8;
      const y = (seed >>> 5) % 8;
      operations.push(index < 4 || seed % 3 ? ['add', [x, y]] : ['count', [x, y]]);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('2013 trace exposes diagonal, required corners, multiplicities, and contribution', () => {
  const run = problem.builder(problem.defaultInput);
  const matches = run.steps.filter((step) => step.detectSquares2013View.phase === 'match');
  assert.equal(matches.length, 2);
  assert.deepEqual(matches.map((step) => {
    const candidate = step.detectSquares2013View.candidate;
    return [candidate.diagonal, candidate.otherCorners, candidate.cornerCounts, candidate.contribution];
  }), [
    [[3, 2], [[3, 10], [11, 2]], [1, 1], 1],
    [[3, 2], [[3, 10], [11, 2]], [1, 2], 2],
  ]);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  assert.deepEqual(run.steps.at(-1).detectSquares2013View.answer, run.answer);
});

test('2013 validates operation names, points, bounds, and stream length', () => {
  for (const input of [
    'bad',
    '[]',
    '[["remove",[1,2]]]',
    '[["add",[1]]]',
    '[["count",[1.5,2]]]',
    '[["add",[-1,2]]]',
    '[["add",[1,1001]]]',
  ]) assert.throws(() => problem.builder(input));
});

test('2013 displayed Python matches the live design runner', () => {
  const operations = [
    ['add', [3, 10]], ['add', [11, 2]], ['add', [3, 2]],
    ['count', [11, 10]], ['add', [11, 2]], ['count', [11, 10]],
  ];
  const input = JSON.stringify(operations);
  const config = prepareDesignLiveRun(problem, input);
  assert.deepEqual(config, {
    className: 'DetectSquares',
    constructorArgs: [],
    operations: operations.map(([name, point]) => ({ name, args: [point] })),
  });
  const expected = oracle(operations);
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = DetectSquares()
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2013 is registered as a Google design, hash-map, and geometry lesson', () => {
  assert.equal(problem.id, 2013);
  assert.equal(problem.slug, 'detect-squares');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'design');
  const tags = problem.tags.map((tag) => tag.key);
  assert.ok(tags.includes('hashmap'));
  assert.ok(tags.includes('geometry'));
  assert.ok(problem.companies.includes('google'));
  assert.equal(problem.debugMode, 'line-by-line');
});

test('2013 dedicated geometry renderer and responsive assets are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-detect-squares-2013.js'));
  assert.ok(STYLESHEET_ASSETS.includes('detect-squares-2013.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderDetectSquares2013View\(step\)/);
  assert.match(javascript, /Why is scanning diagonal corners enough/);
  assert.match(styles, /\.ds2013-square/);
  assert.match(styles, /@container \(max-width:620px\)/);
  assert.ok(index.indexOf('renderer-detect-squares-2013.js') < index.indexOf('script.js?'));
});
