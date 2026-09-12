const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED } = require('../problems');

const problem = SUPPORTED[2054];

function bruteForce(events) {
  let answer = 0;
  for (let first = 0; first < events.length; first += 1) {
    answer = Math.max(answer, events[first][2]);
    for (let second = first + 1; second < events.length; second += 1) {
      const separate = events[first][1] < events[second][0] || events[second][1] < events[first][0];
      if (separate) answer = Math.max(answer, events[first][2] + events[second][2]);
    }
  }
  return answer;
}

test('2054 is registered as the heap sweep-line interval lesson', () => {
  assert.equal(problem.id, 2054);
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.slug, 'two-best-non-overlapping-events');
  assert.equal(problem.category.key, 'heap');
  assert.deepEqual(problem.tags.map(tag => tag.key), ['heap', 'sorting', 'interval']);
  assert.equal(problem.complexity.time, 'O(n log n)');
  assert.match(problem.code.join('\n'), /heap\[0\]\[0\] < start/);
  assert.match(problem.code.join('\n'), /best_ended \+ value/);
});

test('2054 solves all three published examples', () => {
  const cases = [
    ['1,3,2;4,5,2;2,4,3', 4],
    ['1,3,2;4,5,2;1,5,5', 5],
    ['1,5,3;1,5,1;6,6,5', 8],
  ];
  for (const [input, expected] of cases) {
    const run = problem.builder(input);
    assert.equal(run.answer, expected, input);
    assert.equal(run.steps.at(-1).twoEvents2054View.answer.score, expected);
    assert.equal(run.steps.at(-1).final, true);
  }
});

test('2054 treats touching endpoints as overlap and may choose one event', () => {
  const touching = problem.builder('1,2,5;2,3,6');
  assert.equal(touching.answer, 6);
  assert.deepEqual(touching.picks, [1]);
  assert.ok(touching.steps.some(step => step.twoEvents2054View.event === 'stop-overlap'
    && step.twoEvents2054View.heapTop.end === step.twoEvents2054View.events[step.twoEvents2054View.currentIndex].start));

  const separate = problem.builder('1,2,5;3,3,6');
  assert.equal(separate.answer, 11);
  assert.deepEqual(separate.picks, [0, 1]);
});

test('2054 matches brute force on deterministic random event sets', () => {
  let seed = 2054;
  const random = max => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  for (let trial = 0; trial < 160; trial += 1) {
    const size = 2 + random(9);
    const events = Array.from({ length: size }, () => {
      const start = 1 + random(14);
      const end = start + random(5);
      const value = 1 + random(30);
      return [start, end, value];
    });
    const input = events.map(event => event.join(',')).join(';');
    assert.equal(problem.builder(input).answer, bruteForce(events), input);
  }
});

test('2054 trace exposes sort, strict release gate, heap, candidate, and answer', () => {
  const run = problem.builder(problem.defaultInput);
  const views = run.steps.map(step => step.twoEvents2054View);
  const events = views.map(view => view.event);
  assert.ok(views.every(view => view?.problemId === 2054));
  assert.equal(events[0], 'sort');
  assert.equal(events.at(-1), 'done');
  for (const event of ['scan', 'heap-clear', 'check-compatible', 'pop-ended', 'new-best-past', 'stop-overlap', 'combine', 'new-answer', 'push']) {
    assert.ok(events.includes(event), event);
  }
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines[0] >= 1 && step.codeLines[0] <= problem.code.length));

  const passingGate = views.find(view => view.event === 'check-compatible');
  assert.equal(passingGate.compatible, true);
  assert.ok(passingGate.heapTop.end < passingGate.events[passingGate.currentIndex].start);
  const final = views.at(-1);
  assert.deepEqual(final.answer, { score: 4, picks: [0, 1] });
  assert.equal(final.processed.length, 3);
});

test('2054 parser validates visualization bounds and feeds Edit and run code', () => {
  assert.deepEqual(problem.liveArgs('1,3,2;4,5,7'), [[[1, 3, 2], [4, 5, 7]]]);
  assert.deepEqual(problem.liveArgs('[[1,3,2],[4,5,7]]'), [[[1, 3, 2], [4, 5, 7]]]);
  assert.throws(() => problem.builder('1,3,2'), /2–12 events/);
  assert.throws(() => problem.builder('3,1,2;4,5,7'), /2–12 events/);
  assert.throws(() => problem.builder('1,3,0;4,5,7'), /2–12 events/);
  assert.throws(() => problem.builder('1,1000000001,2;4,5,7'), /2–12 events/);
  assert.throws(() => problem.builder(Array.from({ length: 13 }, (_, index) => [index + 1, index + 1, 1])), /2–12 events/);
});

test('2054 renderer handles every step in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const styles = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  const start = source.indexOf('function renderTwoEvents2054View(step)');
  const end = source.indexOf('\nfunction renderWeightedIntervals3414View(step)', start);
  assert.ok(start >= 0 && end > start);

  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: value => String(value ?? ''),
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const runs = [problem.builder(problem.defaultInput), problem.builder('1,2,5;2,3,6')];
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const run of runs) {
      for (const step of run.steps) {
        context.renderTwoEvents2054View(step);
        assert.match(element.innerHTML, /te2054-timeline/);
        assert.match(element.innerHTML, /te2054-memory/);
        assert.match(element.innerHTML, /end\(previous\) &lt; start\(current\)/);
        assert.match(element.innerHTML, /te2054-processed/);
        assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
        if (step.final) assert.match(element.innerHTML, /te2054-answer/);
      }
    }
  }
  assert.match(styles, /\.te2054-gate/);
  assert.match(styles, /\.te2054-equation/);
  assert.match(styles, /@container \(max-width: 480px\)/);
  assert.match(source, /else if \(step\.twoEvents2054View\)/);
});
