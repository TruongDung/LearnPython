const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const { SUPPORTED, CATEGORY_ORDER } = require('../problems');

const problem = SUPPORTED[3414];

function compareIndexLists(left, right) {
  const size = Math.min(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.length - right.length;
}

function bruteForce(intervals) {
  let bestScore = -1;
  let best = [];
  for (let mask = 0; mask < (1 << intervals.length); mask += 1) {
    const picks = [];
    for (let index = 0; index < intervals.length; index += 1) {
      if (mask & (1 << index)) picks.push(index);
    }
    if (picks.length > 4) continue;
    const chronological = picks.slice().sort((left, right) => intervals[left][0] - intervals[right][0] || intervals[left][1] - intervals[right][1]);
    let valid = true;
    for (let index = 1; index < chronological.length; index += 1) {
      if (intervals[chronological[index - 1]][1] >= intervals[chronological[index]][0]) {
        valid = false;
        break;
      }
    }
    if (!valid) continue;
    const score = picks.reduce((total, index) => total + intervals[index][2], 0);
    if (score > bestScore || (score === bestScore && compareIndexLists(picks, best) < 0)) {
      bestScore = score;
      best = picks;
    }
  }
  return best;
}

test('3414 is registered as a hard DP interval problem', () => {
  assert.equal(problem.id, 3414);
  assert.equal(problem.difficulty, 'hard');
  assert.equal(problem.slug, 'maximum-score-of-non-overlapping-intervals');
  assert.equal(problem.category.key, 'dp');
  assert.ok(problem.tags.some(tag => tag.key === 'binary-search'));
  assert.ok(problem.tags.some(tag => tag.key === 'interval'));
  assert.ok(CATEGORY_ORDER.dp.order.includes(3414));
});

test('3414 solves both official examples', () => {
  const first = problem.builder('1,3,2;4,5,2;1,5,5;6,9,3;6,7,1;8,9,1');
  assert.deepEqual(first.answer, [2, 3]);
  assert.equal(first.score, 8);

  const second = problem.builder('5,8,1;6,7,7;4,7,3;9,10,6;7,8,2;11,14,3;3,5,5');
  assert.deepEqual(second.answer, [1, 3, 5, 6]);
  assert.equal(second.score, 21);
});

test('3414 treats touching endpoints as overlap and applies lexicographic tie-breaking', () => {
  assert.deepEqual(problem.builder('1,2,5;2,3,6').answer, [1]);
  assert.deepEqual(problem.builder('1,1,5;2,2,5;1,1,5;2,2,5').answer, [0, 1]);
  assert.deepEqual(problem.builder('1,10,9').answer, [0]);
});

test('3414 matches brute force on deterministic small cases', () => {
  let seed = 3414;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let trial = 0; trial < 80; trial += 1) {
    const size = 1 + Math.floor(random() * 8);
    const intervals = Array.from({ length: size }, () => {
      const start = 1 + Math.floor(random() * 9);
      const end = start + Math.floor(random() * 4);
      const weight = 1 + Math.floor(random() * 10);
      return [start, end, weight];
    });
    const input = intervals.map(interval => interval.join(',')).join(';');
    assert.deepEqual(problem.builder(input).answer, bruteForce(intervals), input);
  }
});

test('3414 exposes the sorting, predecessor, DP decision, and final states', () => {
  const run = problem.builder(problem.defaultInput);
  const events = run.steps.map(step => step.weightedIntervals3414View.event);
  assert.equal(events[0], 'sort');
  assert.equal(events.at(-1), 'done');
  assert.ok(events.includes('build-ends'));
  assert.equal(events.filter(event => event === 'find-prev').length, 6);
  assert.ok(events.includes('take'));
  assert.ok(events.includes('skip'));
  assert.ok(run.steps.every(step => step.weightedIntervals3414View));
  assert.ok(run.steps.every(step => step.codeLines.length === 1));
  assert.ok(run.steps.every(step => step.codeLines.every(line => line >= 1 && line <= problem.code.length)));

  const strictBoundary = problem.builder('1,2,5;2,3,6');
  const secondPrev = strictBoundary.steps.find(step => step.weightedIntervals3414View.event === 'find-prev' && step.weightedIntervals3414View.activeRow === 1);
  assert.equal(secondPrev.weightedIntervals3414View.predecessors[1], -1);

  const last = run.steps.at(-1).weightedIntervals3414View;
  assert.deepEqual(last.answer, [2, 3]);
  assert.equal(last.answerScore, 8);
  assert.deepEqual(last.dp.at(-1)[4], { score: 8, picks: [2, 3] });
});

test('3414 explains every DP cell as SKIP source, TAKE base, TAKE sum, then winner', () => {
  const run = problem.builder(problem.defaultInput);
  const events = run.steps.map(step => step.weightedIntervals3414View.event);
  assert.equal(events.filter(event => event === 'read-skip').length, 24);
  assert.equal(events.filter(event => event === 'read-take-base').length, 24);
  assert.equal(events.filter(event => event === 'build-take').length, 24);

  const baseStep = run.steps.find(step => step.weightedIntervals3414View.event === 'read-take-base');
  assert.equal(baseStep.codeLines[0], 17);
  assert.ok(baseStep.weightedIntervals3414View.decision.skip);
  assert.ok(baseStep.weightedIntervals3414View.decision.base);
  assert.equal(baseStep.weightedIntervals3414View.decision.take, null);

  const winnerStep = run.steps.find(step => ['take', 'skip'].includes(step.weightedIntervals3414View.event));
  assert.equal(winnerStep.codeLines[0], 19);
  assert.ok(winnerStep.weightedIntervals3414View.decision.winner);
  assert.equal(winnerStep.weightedIntervals3414View.completedCells, 1);
});

test('3414 parser feeds the same triples to Edit and run code', () => {
  assert.deepEqual(problem.liveArgs('1,3,2;4,5,7'), [[[1, 3, 2], [4, 5, 7]]]);
  assert.throws(() => problem.builder('1,0,2'));
  assert.throws(() => problem.builder(Array.from({ length: 13 }, (_, index) => [index + 1, index + 1, 1])));
});

test('3414 custom renderer and responsive styles are wired into the page', () => {
  const script = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(script, /function renderWeightedIntervals3414View\(step\)/);
  assert.match(script, /step\.weightedIntervals3414View/);
  assert.match(script, /renderWeightedIntervals3414View\(step\)/);
  assert.match(css, /\.wi3414-timeline/);
  assert.match(css, /\.wi3414-decision/);
  assert.match(css, /\.wi3414-compat/);
  assert.match(css, /\.wi3414-progress/);
  assert.match(css, /\.wi3414-table/);
  assert.match(css, /@container \(max-width: 480px\)/);
});

test('3414 custom renderer handles every step in Vietnamese and English', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderWeightedIntervals3414View(step)');
  const end = source.indexOf('\nfunction renderAdvancedBitmaskView(step)', start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: value => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const run = problem.builder(problem.defaultInput);
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of run.steps) {
      context.renderWeightedIntervals3414View(step);
      assert.match(element.innerHTML, /wi3414-timeline/);
      assert.match(element.innerHTML, /wi3414-table/);
      assert.match(element.innerHTML, /wi3414-action/);
      assert.match(element.innerHTML, /wi3414-progress/);
      assert.doesNotMatch(element.innerHTML, /NaN|undefined|Infinity/);
    }
  }
  context.renderWeightedIntervals3414View(run.steps.at(-1));
  assert.match(element.innerHTML, /\[2, 3\]/);
  assert.match(element.innerHTML, /score = 8/);
});
