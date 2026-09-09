const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2940];

function bruteLeftmostMeeting(heights, queries) {
  const canReach = (start, target) => (
    target === start || (target > start && heights[target] > heights[start])
  );
  return queries.map(([alice, bob]) => {
    for (let building = 0; building < heights.length; building += 1) {
      if (canReach(alice, building) && canReach(bob, building)) return building;
    }
    return -1;
  });
}

test('2940 has complete hard-problem metadata and the optimal offline approach', () => {
  assert.equal(problem.id, 2940);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.slug, 'find-building-where-alice-and-bob-can-meet');
  assert.equal(problem.complexity.time, 'O((n + q) log q)');
  assert.ok(problem.tags.some(tag => tag.key === 'heap'));
  assert.ok(problem.tags.some(tag => tag.key === 'offline-query'));
  assert.match(problem.code.join('\n'), /heappush|heappop/);
});

test('2940 matches both official examples', () => {
  const examples = [
    {
      heights: '6,4,8,5,2,7',
      queries: '0,1;0,3;2,4;3,4;2,2',
      expected: [2, 5, -1, 5, 2],
    },
    {
      heights: '5,3,8,2,6,1,4,6',
      queries: '0,7;3,5;5,2;3,0;1,6',
      expected: [7, 6, -1, 4, 6],
    },
  ];

  for (const example of examples) {
    const run = problem.builder(example.heights, { queries: example.queries });
    assert.deepEqual(run.answer, example.expected);
    assert.deepEqual(run.steps.at(-1).buildingMeet2940View.answers, example.expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('2940 agrees with an independent brute-force oracle on deterministic random cases', () => {
  let seed = 2940;
  const random = max => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed % max;
  };

  for (let caseIndex = 0; caseIndex < 160; caseIndex += 1) {
    const length = 1 + random(8);
    const heights = Array.from({ length }, () => 1 + random(12));
    const queryCount = 1 + random(10);
    const queries = Array.from({ length: queryCount }, () => [random(length), random(length)]);
    const run = problem.builder(heights.join(','), {
      queries: queries.map(query => query.join(',')).join(';'),
    });
    assert.deepEqual(run.answer, bruteLeftmostMeeting(heights, queries), JSON.stringify({ heights, queries }));
  }
});

test('2940 trace covers classification, activation, heap resolution, and finalization', () => {
  const run = problem.builder('6,4,8,5,2,7', {
    queries: '0,1;0,3;2,4;3,4;2,2;0,2',
  });
  const events = run.steps.map(step => step.buildingMeet2940View.event);

  for (const event of ['intro', 'same', 'direct', 'wait', 'scan-start', 'visit', 'activate', 'resolve', 'done']) {
    assert.ok(events.includes(event), `missing trace event: ${event}`);
  }
  for (const step of run.steps) {
    assert.ok(step.buildingMeet2940View);
    assert.ok(step.codeLines.every(line => line >= 1 && line <= problem.code.length));
  }
});

test('2940 validates visualization limits and query indexes', () => {
  assert.throws(
    () => problem.builder(Array.from({ length: 17 }, (_, index) => index + 1).join(','), { queries: '0,1' }),
    /at most 16 buildings/,
  );
  assert.throws(
    () => problem.builder('1,2', { queries: Array.from({ length: 13 }, () => '0,1').join(';') }),
    /at most 12 queries/,
  );
  assert.throws(() => problem.builder('1,2', { queries: '0,2' }), /between 0 and 1/);
  assert.throws(() => problem.builder('0,2', { queries: '0,1' }), /between 1 and 10\^9/);
});

test('2940 custom visualization renders every step in English and Vietnamese', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = script.indexOf('function renderBuildingMeet2940View(step)');
  const end = script.indexOf('\nfunction renderMaximizeScore2818View(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(script.slice(start, end), context);

  const runs = [
    problem.builder('6,4,8,5,2,7', { queries: '0,1;0,3;2,4;3,4;2,2' }),
    problem.builder('5,3,8,2,6,1,4,6', { queries: '0,7;3,5;5,2;3,0;1,6' }),
  ];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderBuildingMeet2940View(step);
        assert.match(element.innerHTML, /bm2940-viz/);
        assert.match(element.innerHTML, /bm2940-skyline/);
        assert.match(element.innerHTML, /bm2940-query/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
      }
    }
  }
});
