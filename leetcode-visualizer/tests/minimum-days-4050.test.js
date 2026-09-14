const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const problem = require('../problems').SUPPORTED[4050];

function bfsOracle(target) {
  let states = new Set(['0,0']);
  for (let days = 0; days <= target * 2; days += 1) {
    const next = new Set();
    for (const state of states) {
      const [score, streak] = state.split(',').map(Number);
      if (score === target) return days;
      const earned = score + streak + 1;
      if (earned <= target) next.add(`${earned},${streak + 1}`);
      if (streak > 0) next.add(`${score},0`);
    }
    states = next;
  }
  throw new Error(`No schedule found for ${target}`);
}

test('4050 is registered with the official signature and metadata', () => {
  assert.equal(problem.id, 4050);
  assert.equal(problem.slug, 'minimum-days-to-score-exactly-n-points');
  assert.equal(problem.difficulty, 'medium');
  assert.equal(problem.debugMode, 'semantic');
  assert.equal(problem.complexity.time, 'O(n · √n)');
  assert.match(problem.code.join('\n'), /def minDays\(self, n: int\) -> int/);
});

test('4050 matches all official examples', () => {
  for (const [n, expected] of [[2, 3], [9, 6], [12, 7]]) {
    const built = problem.builder([n]);
    assert.equal(built.answer, expected);
    assert.equal(built.steps.at(-1).minDays4050View.answer, expected);
    assert.equal(built.steps.at(-1).final, true);
  }
});

test('4050 builder agrees with an independent day-by-day BFS', () => {
  for (let n = 1; n <= 40; n += 1) {
    assert.equal(problem.builder([n]).answer, bfsOracle(n), `n=${n}`);
  }
});

test('4050 trace is line-by-line and exposes the complete DP path', () => {
  const built = problem.builder([9]);
  assert.ok(built.steps.every((step) => step.codeLines.length === 1));
  const operations = new Set(built.steps.map((step) => step.minDays4050View.operation));
  for (const operation of ['init-streaks', 'init-length', 'while-check', 'compute-points', 'append-option', 'increment-length', 'while-stop', 'init-dp', 'base-case', 'score-loop', 'option-loop', 'fit-check', 'break', 'relax', 'return']) {
    assert.ok(operations.has(operation), operation);
  }
  assert.ok(built.steps.some((step) => step.minDays4050View.operation === 'relax' && step.minDays4050View.updated));
  assert.ok(built.steps.some((step) => step.minDays4050View.operation === 'relax' && step.minDays4050View.updated === false));
});

test('4050 final schedule has the reported days and exact target score', () => {
  for (const n of [1, 2, 7, 9, 12, 30, 40]) {
    const built = problem.builder([n]);
    const schedule = built.steps.at(-1).minDays4050View.schedule;
    assert.equal(schedule.length, built.answer);
    assert.equal(schedule.reduce((sum, day) => sum + day.points, 0), n);
    for (let index = 0; index < schedule.length; index += 1) {
      if (schedule[index].type === 'skip') {
        assert.notEqual(index, 0);
        assert.notEqual(index, schedule.length - 1);
      }
    }
  }
});

test('4050 displayed Python and solution file produce the expected answers', () => {
  const assertions = [
    'assert Solution().minDays(1) == 1',
    'assert Solution().minDays(2) == 3',
    'assert Solution().minDays(9) == 6',
    'assert Solution().minDays(12) == 7',
    'assert Solution().minDays(100000) > 0',
  ].join('\n');
  const displayed = spawnSync('python3', ['-c', `${problem.code.join('\n')}\n${assertions}`], { encoding: 'utf8' });
  assert.equal(displayed.status, 0, displayed.stderr);

  const solutionPath = path.resolve(__dirname, '../../Leetcode-sln/dynamic-programming/Leetcode_4050.py');
  const solution = spawnSync('python3', [solutionPath], { encoding: 'utf8' });
  assert.equal(solution.status, 0, solution.stderr);
});

test('4050 custom renderer handles every state in English and Vietnamese', () => {
  const source = fs.readFileSync(require.resolve('../public/script.js'), 'utf8');
  const start = source.indexOf('function renderMinDays4050View(step)');
  const end = source.indexOf('\nfunction renderRectangleOverlap836View(step)', start);
  assert.ok(start >= 0 && end > start);
  const element = {};
  const context = {
    lang: 'en',
    $: () => element,
    escapeHtml: String,
    pick: (value) => value?.en ?? value?.vi ?? value ?? '',
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const trace = problem.builder([9]).steps;
  for (const language of ['en', 'vi']) {
    context.lang = language;
    for (const step of trace) {
      context.renderMinDays4050View(step);
      assert.match(element.innerHTML, /md4050-viz/);
      assert.match(element.innerHTML, /DP\[EXACT SCORE\]/);
      assert.match(element.innerHTML, new RegExp(`(?:LINE|DÒNG) ${step.codeLines[0]}`));
      assert.doesNotMatch(element.innerHTML, /undefined|NaN/);
    }
  }
});

test('4050 validates visual input and includes responsive scoped styles', () => {
  assert.throws(() => problem.builder([]), /exactly one integer/);
  assert.throws(() => problem.builder([0]), /1 to 60/);
  assert.throws(() => problem.builder([61]), /1 to 60/);
  const css = fs.readFileSync(require.resolve('../public/style.css'), 'utf8');
  assert.match(css, /\.md4050-viz/);
  assert.match(css, /\.md4050-cell\.active/);
  assert.match(css, /\.md4050-day\.skip/);
  assert.match(css, /@container \(max-width: 390px\)/);
});
