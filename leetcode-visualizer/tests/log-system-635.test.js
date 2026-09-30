const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const problem = SUPPORTED[635];
const lengths = { Year: 4, Month: 7, Day: 10, Hour: 13, Minute: 16, Second: 19 };

function oracle(operations) {
  const logs = [];
  return operations.map(([name, first, second, third]) => {
    if (name === 'put') { logs.push([first, second]); return null; }
    const length = lengths[third];
    const start = first.slice(0, length), end = second.slice(0, length);
    return logs.filter(([, timestamp]) => start <= timestamp.slice(0, length) && timestamp.slice(0, length) <= end).map(([id]) => id);
  });
}

test('635 is registered as a line-by-line premium design problem', () => {
  assert.equal(problem.slug, 'design-log-storage-system');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.premium, true);
  assert.ok(problem.tags.some((tag) => tag.key === 'hashmap'));
});

test('635 matches the published Year and Hour queries', () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [null, null, null, [1, 2, 3], [1, 2]]);
});

test('635 agrees with an independent prefix-range oracle for every granularity', () => {
  const operations = [
    ['put', 1, '2016:12:31:23:59:59'],
    ['put', 2, '2017:01:01:00:00:00'],
    ['put', 3, '2017:06:15:12:30:45'],
    ['put', 4, '2018:01:01:00:00:00'],
  ];
  for (const granularity of Object.keys(lengths)) {
    operations.push(['retrieve', '2017:01:01:00:00:00', '2017:12:31:23:59:59', granularity]);
  }
  assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
});

test('635 trace cuts keys and scans each log one source line at a time', () => {
  const run = problem.builder(problem.defaultInput);
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  const keyLine = problem.code.findIndex((line) => line.includes('key = timestamp')) + 1;
  const conditionLine = problem.code.findIndex((line) => line.includes('if start_key')) + 1;
  assert.equal(run.steps.filter((step) => step.codeLines[0] === keyLine).length, 6);
  assert.equal(run.steps.filter((step) => step.codeLines[0] === conditionLine).length, 6);
  assert.deepEqual(run.steps.at(-1).hardProblemView.answer, run.answer);
});

test('635 validates timestamps, ranges, ids, and granularity', () => {
  for (const input of [
    'bad', '[]', '[["put",1,"2017-01-01"]]', '[["put",1,"2017:13:01:00:00:00"]]',
    '[["put",1,"2017:01:01:00:00:00"],["put",1,"2018:01:01:00:00:00"]]',
    '[["retrieve","2018:01:01:00:00:00","2017:01:01:00:00:00","Year"]]',
    '[["retrieve","2017:01:01:00:00:00","2018:01:01:00:00:00","Week"]]',
  ]) assert.throws(() => problem.builder(input));
});

test('635 displayed Python implementation matches the live design runner', () => {
  const config = prepareDesignLiveRun(problem, problem.defaultInput);
  const expected = problem.builder(problem.defaultInput).answer;
  assert.equal(config.className, 'LogSystem');
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = LogSystem()
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
