const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const p = SUPPORTED[715];
const build = operations => p.builder(JSON.stringify(operations));
const finalPoints = result => result.steps.at(-1).rangeModuleView.points;

test('715 example splits coverage and queries half-open boundaries without mutation', () => {
  const result = p.builder(p.defaultInput);
  assert.deepEqual(result.answer, [null, null, true, false, true]);
  assert.deepEqual(finalPoints(result), [10, 14, 16, 20]);
  assert.deepEqual(result.steps[0].rangeModuleView.points, []);
  for (const step of result.steps) {
    const view = step.rangeModuleView;
    assert.ok(step.codeLines.every(line => line >= 1 && line <= p.code.length));
    if (view.current?.[0] === 'queryRange') assert.deepEqual(view.points, view.before);
  }
  const failedQuery = result.steps.find(step => step.rangeModuleView.phase === 'result' && step.rangeModuleView.callIndex === 3).rangeModuleView;
  assert.equal(failedQuery.i, 1);
  assert.equal(failedQuery.j, 2);
  assert.equal(result.steps.at(-1).final, true);
});

test('715 merges adjacent and overlapping ranges; handles trims, gaps, duplicates, and full removal', () => {
  const result = build([
    ['queryRange', 1, 2], ['removeRange', 1, 100],
    ['addRange', 10, 20], ['addRange', 20, 30], ['addRange', 10, 30],
    ['queryRange', 10, 30], ['queryRange', 30, 31],
    ['removeRange', 14, 16], ['removeRange', 14, 16],
    ['queryRange', 10, 14], ['queryRange', 14, 16], ['queryRange', 16, 30],
    ['addRange', 14, 16], ['queryRange', 10, 30],
    ['removeRange', 1, 12], ['removeRange', 28, 40], ['queryRange', 12, 28],
    ['removeRange', 1, 100], ['queryRange', 12, 28],
  ]);
  assert.deepEqual(result.answer, [false, null, null, null, null, true, false, null, null, true, false, true, null, true, null, null, true, null, false]);
  const updates = result.steps.filter(step => step.rangeModuleView.phase === 'applied');
  assert.deepEqual(updates.find(step => step.rangeModuleView.callIndex === 3).rangeModuleView.points, [10, 30]);
  assert.deepEqual(updates.find(step => step.rangeModuleView.callIndex === 15).rangeModuleView.points, [12, 28]);
  assert.deepEqual(finalPoints(result), []);
  assert.deepEqual(build([]).answer, []);
  assert.deepEqual(build([]).steps[0].rangeModuleView.coordinates, [0, 1]);
  assert.deepEqual(build([
    ['addRange', 1, 1000000000], ['removeRange', 2, 999999999],
    ['queryRange', 999999999, 1000000000], ['queryRange', 1, 2], ['queryRange', 2, 3],
  ]).answer, [null, null, true, true, false]);
});

function randomCases() {
  let seed = 715;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  return Array.from({ length: 80 }, () => Array.from({ length: 40 }, () => {
    const name = ['addRange', 'removeRange', 'queryRange'][random() % 3];
    const left = 1 + random() % 19, right = left + 1 + random() % (20 - left);
    return [name, left, right];
  }));
}

test('715 deterministic random traces match independent half-unit occupancy after every call', () => {
  for (const operations of randomCases()) {
    // Check integer and fractional positions, since coverage represents real numbers.
    const occupancy = Array(41).fill(false), expected = [], states = [];
    for (const [name, left, right] of operations) {
      if (name === 'queryRange') expected.push(occupancy.slice(left * 2, right * 2).every(Boolean));
      else {
        occupancy.fill(name === 'addRange', left * 2, right * 2);
        expected.push(null);
      }
      states.push([...occupancy]);
    }
    const result = build(operations);
    assert.deepEqual(result.answer, expected);
    for (const step of result.steps) {
      const v = step.rangeModuleView;
      assert.equal(v.points.length % 2, 0);
      assert.ok(v.points.every((point, index) => !index || v.points[index - 1] < point));
      if (!['applied', 'result'].includes(v.phase)) continue;
      for (let half = 0; half < 41; half++) {
        const covered = v.points.some((left, index) => index % 2 === 0 && left <= half / 2 && half / 2 < v.points[index + 1]);
        assert.equal(covered, states[v.callIndex][half]);
      }
    }
  }
});

test('715 input validation is shared by visualization and the Python design runner', () => {
  for (const input of ['bad', '{}', 'null', '[[]]', '[["RangeModule"]]', '[["book",1,2]]', '[["addRange",0,1]]', '[["addRange",1,1]]', '[["addRange",2,1]]', '[["addRange",1,2.5]]', '[["addRange","1",2]]', '[["addRange",1,1000000001]]', '[["addRange",1,2,3]]', JSON.stringify(Array(101).fill(['queryRange', 1, 2]))]) {
    assert.throws(() => p.builder(input), /100/);
    assert.throws(() => prepareDesignLiveRun(p, input), /100/);
  }
  assert.equal(build(Array(100).fill(['queryRange', 1, 2])).answer.length, 100);
  const config = prepareDesignLiveRun(p, p.defaultInput);
  assert.equal(config.className, 'RangeModule');
  assert.deepEqual(config.constructorArgs, []);
  assert.deepEqual(config.operations, JSON.parse(p.defaultInput).map(([name, ...args]) => ({ name, args })));
});

test('715 displayed Python code and live-run configuration match all generated traces', () => {
  const operations = [JSON.parse(p.defaultInput), [], ...randomCases()];
  const cases = operations.map(ops => ({
    config: prepareDesignLiveRun(p, JSON.stringify(ops)),
    expected: build(ops).answer,
  }));
  const source = p.code.join('\n') + `
import json, sys
for case in json.load(sys.stdin):
    config = case['config']
    instance = globals()[config['className']](*config['constructorArgs'])
    actual = [getattr(instance, op['name'])(*op['args']) for op in config['operations']]
    assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify(cases), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('715 renders every phase in both languages, including an uncovered query and empty input', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderRangeModuleView(step)');
  const end = source.indexOf('\nfunction ', start + 1);
  const element = {};
  const context = { lang: 'en', $: () => element, escapeHtml: String };
  context.pick = value => value?.[context.lang] ?? value;
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const inputs = [p.defaultInput, '[]', '[["addRange",1,1000000000],["removeRange",2,999999999]]'];
  for (const input of inputs) for (const lang of ['en', 'vi']) for (const step of p.builder(input).steps) {
    context.lang = lang; context.step = step;
    vm.runInContext('renderRangeModuleView(step)', context);
    assert.ok(element.innerHTML.includes('Range Module'));
    assert.ok(!/undefined|NaN|Infinity/.test(element.innerHTML));
    if (step.rangeModuleView.phase === 'result' && step.rangeModuleView.results.at(-1) === false) {
      assert.ok(element.innerHTML.includes('rm715-cell gap'));
    }
  }
});
