const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { SUPPORTED } = require('../problems');
const { prepareDesignLiveRun } = require('../live-args');
const problem = SUPPORTED[2349];

function oracle(operations) {
  const assignments = new Map();
  return operations.map(([name, first, second]) => {
    if (name === 'change') { assignments.set(first, second); return null; }
    const indices = [...assignments].filter(([, number]) => number === first).map(([index]) => index);
    return indices.length ? Math.min(...indices) : -1;
  });
}

test('2349 is registered as a line-by-line heap and hash-map design', () => {
  assert.equal(problem.slug, 'design-a-number-container-system');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.deepEqual(problem.tags.map((tag) => tag.key), ['heap', 'hashmap']);
});

test('2349 matches the published operation sequence and stale-root cleanup', () => {
  assert.deepEqual(problem.builder(problem.defaultInput).answer, [null, null, null, null, 1, null, 2, 1]);
  const operations = [['change', 1, 10], ['change', 1, 20], ['find', 10], ['change', 1, 10], ['find', 10]];
  assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, [null, null, -1, null, 1]);
});

test('2349 agrees with an independent assignment-map oracle', () => {
  let seed = 2349;
  for (let sample = 0; sample < 40; sample += 1) {
    const operations = [];
    for (let index = 0; index < 55; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if (seed % 3) operations.push(['change', 1 + seed % 12, 1 + (seed >>> 5) % 7]);
      else operations.push(['find', 1 + (seed >>> 7) % 7]);
    }
    assert.deepEqual(problem.builder(JSON.stringify(operations)).answer, oracle(operations));
  }
});

test('2349 trace exposes stale entries and prunes them one source line at a time', () => {
  const operations = [['change', 1, 10], ['change', 2, 10], ['change', 1, 20], ['find', 10], ['change', 2, 30], ['find', 10]];
  const run = problem.builder(JSON.stringify(operations));
  assert.ok(run.steps.every((step) => step.codeLines.length === 1));
  assert.equal(run.steps.filter((step) => step.final).length, 1);
  const staleCheckLine = problem.code.findIndex((line) => line.includes('while heap and')) + 1;
  const popLine = problem.code.findIndex((line) => line.includes('heappop(heap)')) + 1;
  assert.ok(run.steps.some((step) => step.codeLines[0] === staleCheckLine && step.hardProblemView.formula.en.endsWith('→ true')));
  assert.ok(run.steps.some((step) => step.codeLines[0] === popLine));
  assert.equal(run.answer.at(-1), -1);
});

test('2349 validation and displayed Python match the live design runner', () => {
  for (const input of ['bad', '[]', '[["change",0,1]]', '[["change",1,0]]', '[["find",0]]', '[["unknown",1]]']) {
    assert.throws(() => problem.builder(input));
    assert.throws(() => prepareDesignLiveRun(problem, input));
  }
  const config = prepareDesignLiveRun(problem, problem.defaultInput);
  const expected = problem.builder(problem.defaultInput).answer;
  assert.equal(config.className, 'NumberContainers');
  const source = `${problem.code.join('\n')}
import json, sys
case = json.loads(sys.stdin.read())
instance = NumberContainers()
actual = [getattr(instance, op['name'])(*op['args']) for op in case['config']['operations']]
assert actual == case['expected'], (actual, case['expected'])
`;
  const run = spawnSync('python', ['-c', source], { input: JSON.stringify({ config, expected }), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});
