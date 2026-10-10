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

const problem = SUPPORTED[2034];

function oracle(operations) {
  const prices = new Map();
  let latest = 0;
  return operations.map(([name, timestamp, price]) => {
    if (name === 'update') {
      prices.set(timestamp, price);
      latest = Math.max(latest, timestamp);
      return null;
    }
    if (name === 'current') return prices.get(latest);
    const values = [...prices.values()];
    return name === 'maximum' ? Math.max(...values) : Math.min(...values);
  });
}

test('2034 solves the official correction example', () => {
  const run = problem.builder(problem.defaultInput);
  assert.deepEqual(run.answer, [null, null, 5, 10, null, 5, null, 2]);
  assert.deepEqual(run.original, [
    ['update', 1, 10], ['update', 2, 5], ['current'], ['maximum'],
    ['update', 1, 3], ['maximum'], ['update', 4, 2], ['minimum'],
  ]);
});

test('2034 handles repeated corrections and out-of-order timestamps', () => {
  const operations = [
    ['update', 8, 40], ['update', 2, 5], ['current'], ['minimum'],
    ['update', 8, 1], ['current'], ['minimum'], ['maximum'],
    ['update', 2, 80], ['maximum'], ['minimum'],
  ];
  assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
});

test('2034 agrees with a simple map oracle on deterministic random streams', () => {
  let seed = 2034;
  for (let sample = 0; sample < 40; sample += 1) {
    const operations = [['update', 1, 1 + sample]];
    for (let index = 0; index < 60; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const kind = seed % 6;
      if (kind < 3) operations.push(['update', 1 + ((seed >>> 4) % 12), 1 + ((seed >>> 9) % 1000)]);
      else operations.push([kind === 3 ? 'current' : kind === 4 ? 'maximum' : 'minimum']);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('2034 trace exposes latest timestamp, stale roots, pruning, and final answer', () => {
  const run = problem.builder(problem.defaultInput);
  const stale = run.steps.find((step) => step.stockPrice2034View.phase === 'stale-root');
  const pruned = run.steps.find((step) => step.stockPrice2034View.phase === 'prune');
  assert.deepEqual(stale.stockPrice2034View.pruned, { key: -10, timestamp: 1, price: 10 });
  assert.equal(pruned.stockPrice2034View.maxHeap.some((entry) => entry.price === 10), false);
  assert.equal(run.steps.at(-1).stockPrice2034View.latest, 4);
  assert.deepEqual(run.steps.at(-1).stockPrice2034View.answer, run.answer);
  assert.equal(run.steps.filter((step) => step.final).length, 1);
});

test('2034 validates JSON, operation shape, ranges, and query ordering', () => {
  for (const input of [
    'bad',
    '[]',
    '[["current"]]',
    '[["update",0,1]]',
    '[["update",1,0]]',
    '[["update",1,1000000001]]',
    '[["update",1,2,3]]',
    '[["update",1,2],["maximum",1]]',
    '[["remove"]]',
  ]) assert.throws(() => problem.builder(input));
});

test('2034 displayed Python matches the live design runner', () => {
  const operations = [
    ['update', 4, 9], ['update', 1, 2], ['maximum'], ['update', 4, 1],
    ['current'], ['maximum'], ['minimum'], ['update', 9, 7], ['current'],
  ];
  const config = prepareDesignLiveRun(problem, JSON.stringify(operations));
  assert.deepEqual(config, {
    className: 'StockPrice',
    constructorArgs: [],
    operations: operations.map(([name, ...args]) => ({ name, args })),
  });
  const expected = oracle(operations);
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = StockPrice(*case['config']['constructorArgs'])
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python3', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2034 is registered as a Google design lesson with heap and hash map tags', () => {
  assert.equal(problem.id, 2034);
  assert.equal(problem.slug, 'stock-price-fluctuation');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'design');
  assert.ok(problem.tags.some((tag) => tag.key === 'heap'));
  assert.ok(problem.tags.some((tag) => tag.key === 'hashmap'));
  assert.ok(problem.tags.some((tag) => tag.key === 'lazy-deletion'));
  assert.ok(problem.companies.includes('google'));
  assert.equal(problem.debugMode, 'line-by-line');
});

test('2034 dedicated lazy-heap renderer and responsive assets are wired', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-stock-price-2034.js'));
  assert.ok(STYLESHEET_ASSETS.includes('stock-price-2034.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderStockPrice2034View\(step\)/);
  assert.match(javascript, /Why is lazy deletion still correct and fast/);
  assert.match(styles, /\.sp2034-node\.stale/);
  assert.match(styles, /@container \(max-width:480px\)/);
  assert.ok(index.indexOf('renderer-stock-price-2034.js') < index.indexOf('script.js?'));
});
