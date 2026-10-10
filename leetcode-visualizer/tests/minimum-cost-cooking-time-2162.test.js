const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const problem = require('../problems').SUPPORTED[2162];
const {
  JAVASCRIPT_ASSETS,
  STYLESHEET_ASSETS,
  readFrontendIndex,
  readFrontendJavaScript,
  readFrontendStyles,
} = require('./helpers/frontend-source');

function brute(startAt, moveCost, pushCost, targetSeconds) {
  let best = Infinity;
  for (let length = 1; length <= 4; length++) {
    const limit = 10 ** length;
    for (let value = 0; value < limit; value++) {
      const digits = String(value).padStart(length, '0');
      const padded = digits.padStart(4, '0');
      const minutes = Number(padded.slice(0, 2));
      const seconds = Number(padded.slice(2));
      if (minutes * 60 + seconds !== targetSeconds) continue;
      let finger = startAt;
      let cost = 0;
      for (const ch of digits) {
        const digit = Number(ch);
        if (digit !== finger) cost += moveCost;
        cost += pushCost;
        finger = digit;
      }
      best = Math.min(best, cost);
    }
  }
  return best;
}

test('2162 solves official examples and boundary representations', () => {
  assert.equal(problem.builder('1,2,1,600').answer, 6);
  assert.equal(problem.builder('0,1,2,76').answer, 6);
  assert.equal(problem.builder('5,10,10,5').answer, 10);
  assert.equal(problem.builder('0,1,1,6039').answer, 5);
  assert.equal(problem.builder('0,5,1,60').answer, brute(0, 5, 1, 60));
});

test('2162 agrees with exhaustive one-to-four-digit entry', () => {
  const cases = [
    [0, 1, 1, 1], [9, 3, 2, 9], [3, 5, 7, 60], [8, 2, 9, 83],
    [1, 10, 1, 599], [4, 2, 3, 3599], [0, 8, 2, 6039],
  ];
  for (const args of cases) {
    const result = problem.builder(args.join(',')).answer;
    assert.equal(result, brute(...args), args.join(','));
  }
});

test('2162 trace shows two representations and exact movement receipts', () => {
  const result = problem.builder('1,2,1,600');
  assert.ok(result.steps.every((step) => step.cookingTime2162View));
  const final = result.steps.at(-1).cookingTime2162View;
  assert.deepEqual(final.plans.map(({ minutes, seconds, digits, cost }) => [minutes, seconds, digits, cost]), [
    [10, 0, '1000', 6],
    [9, 60, '960', 9],
  ]);
  assert.deepEqual(final.plans[0].events.map(({ digit, moved, total }) => [digit, moved, total]), [
    [1, false, 1], [0, true, 4], [0, false, 5], [0, false, 6],
  ]);
  assert.equal(final.answer, 6);

  const edge = problem.builder('5,10,10,5').steps.at(-1).cookingTime2162View;
  assert.equal(edge.plans[1].valid, false);
});

test('2162 validates all four numeric constraints', () => {
  assert.throws(() => problem.builder('1,2,3'), /4 số nguyên/);
  assert.throws(() => problem.builder('-1,2,3,4'), /startAt/);
  assert.throws(() => problem.builder('10,2,3,4'), /startAt/);
  assert.throws(() => problem.builder('1,0,3,4'), /moveCost/);
  assert.throws(() => problem.builder('1,2,0,4'), /moveCost/);
  assert.throws(() => problem.builder('1,2,3,0'), /targetSeconds/);
  assert.throws(() => problem.builder('1,2,3,6040'), /targetSeconds/);
});

test('2162 displayed Python agrees with exhaustive answers', () => {
  const code = problem.code.join('\n');
  const cases = [[1, 2, 1, 600], [0, 1, 2, 76], [3, 5, 7, 60], [0, 8, 2, 6039]];
  const harness = `
s = Solution()
${cases.map((args) => `assert s.minCostSetTime(${args.join(', ')}) == ${brute(...args)}`).join('\n')}
`;
  const run = spawnSync('python3', ['-c', `${code}\n${harness}`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('2162 is registered as a Google enumeration and simulation lesson', () => {
  assert.equal(problem.id, 2162);
  assert.equal(problem.slug, 'minimum-cost-to-set-cooking-time');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.category.key, 'math');
  assert.ok(problem.tags.some((tag) => tag.key === 'enumeration'));
  assert.ok(problem.tags.some((tag) => tag.key === 'simulation'));
  assert.deepEqual(problem.liveArgs('1,2,1,600'), [1, 2, 1, 600]);
});

test('2162 dedicated renderer and responsive assets are wired before script.js', () => {
  assert.ok(JAVASCRIPT_ASSETS.includes('renderer-cooking-time-2162.js'));
  assert.ok(STYLESHEET_ASSETS.includes('cooking-time-2162.css'));
  const javascript = readFrontendJavaScript();
  const styles = readFrontendStyles();
  const index = readFrontendIndex();
  assert.match(javascript, /function renderCookingTime2162View\(step\)/);
  assert.match(javascript, /Why are there only two candidates/);
  assert.match(styles, /\.mc2162-key/);
  assert.match(styles, /@container \(max-width:600px\)/);
  assert.ok(index.indexOf('renderer-cooking-time-2162.js') < index.indexOf('script.js?'));
});
