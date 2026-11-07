const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {SUPPORTED} = require('../problems');
const {runTrace} = require('../problems/wasm-picture-trace');
const problem = SUPPORTED[2365];

// Advance one day at a time using countdowns rather than a last-day formula.
function dayByDay(tasks, space) {
  const timers = new Map();
  let day = 0, index = 0;
  while (index < tasks.length) {
    day++;
    for (const [task, remaining] of timers) timers.set(task, Math.max(0, remaining - 1));
    if (!timers.get(tasks[index])) {
      timers.set(tasks[index++], space + 1);
    }
  }
  return day;
}

const cases = [
  [[1, 2, 1, 2, 3, 1], 3, 9], [[5, 8, 8, 5], 2, 6], [[1, 2, 3, 1], 2, 4],
  [[7], 1, 1], [[7, 7, 7, 7, 7], 5, 25], [[1, 2, 3], 3, 3],
  [[1e9, 1e9], 2, 4], [Array(32).fill(1), 32, 1024],
];

test('2365 registers a greedy lesson with native debug and editable Python arguments', () => {
  assert.equal(problem.slug, 'task-scheduler-ii');
  assert.equal(problem.category.key, 'greedy');
  assert.equal(problem.debugMode, 'line-by-line');
  assert.equal(problem.complexity.time, 'O(n)');
  assert.deepEqual(problem.liveArgs('[5,8,8,5]', {space: '2'}), [[5, 8, 8, 5], 2]);
  for (const [tasks, space, answer] of cases) assert.equal(problem.builder(tasks, {space}).answer, answer);
});

test('2365 agrees with an independent daily countdown oracle', () => {
  let seed = 2365;
  for (let trial = 0; trial < 100; trial++) {
    const length = 1 + trial % 16, tasks = [];
    for (let i = 0; i < length; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; tasks.push(seed % 5 + 1); }
    const space = 1 + trial % length;
    assert.equal(problem.builder(tasks, {space}).answer, dayByDay(tasks, space), JSON.stringify({tasks, space}));
  }
});

test('2365 code highlights and variables match every actual Python statement', () => {
  for (const [tasks, space] of cases.slice(0, 5)) {
    const trace = runTrace({code: problem.code.join('\n'), method: 'taskSchedulerII', args: [tasks, space]});
    const run = problem.builder(tasks, {space});
    assert.equal(run.steps.length, trace.events.length);
    assert.equal(run.answer, trace.answer);
    run.steps.forEach((step, i) => {
      const record = trace.events[i], view = step.scheduler2365View;
      assert.deepEqual(step.codeLines, [record.line]);
      assert.equal(view.source, problem.code[record.line - 1].trim());
      assert.equal(view.day, record.locals.day ?? 0);
      assert.deepEqual(step.vars, Object.entries(record.locals).map(([name, value]) => ({name, value})));
      assert.deepEqual(view.last, (record.locals.last?.__pairs__ ?? []).map(([task, day]) => ({task, day})));
      assert.equal(step.final, i === trace.events.length - 1);
    });
  }
});

test('2365 schedules in input order, counts idle days once, and preserves the required gap', () => {
  for (const [tasks, space, answer] of cases) {
    const run = problem.builder(tasks, {space}), view = run.steps.at(-1).scheduler2365View;
    assert.deepEqual(view.scheduled.map(row => row.task), tasks);
    assert.equal(view.completed, tasks.length);
    let previousEnd = 0;
    const last = new Map();
    for (const row of view.timeline) {
      assert.equal(row.start, previousEnd + 1);
      assert.ok(row.end >= row.start);
      previousEnd = row.end;
      if (row.kind === 'task') {
        if (last.has(row.task)) assert.ok(row.start - last.get(row.task) > space);
        last.set(row.task, row.start);
        assert.equal(run.steps[row.step].scheduler2365View.event, 'execute');
      }
    }
    assert.equal(previousEnd, answer);
    assert.deepEqual(view.last, [...last].map(([task, day]) => ({task, day})));
    for (const {scheduler2365View: state} of run.steps) {
      assert.equal(state.scheduled.length, state.completed);
      if (state.event === 'wait') {
        assert.equal(state.day, state.previous + space + 1);
        assert.ok(state.day > state.candidate);
        assert.equal(state.completed, state.active);
      }
    }
  }
});

test('2365 distinguishes an already satisfied cooldown from a forced wait', () => {
  const ready = problem.builder([1, 2, 3, 1], {space: 2}).steps.map(s => s.scheduler2365View);
  assert.equal(ready.some(v => v.event === 'wait'), false);
  assert.ok(ready.some(v => v.event === 'ready' && v.day === 4));
  const waiting = problem.builder([1, 1], {space: 2}).steps.map(s => s.scheduler2365View);
  const wait = waiting.find(v => v.event === 'wait');
  assert.equal(wait.candidate, 2); assert.equal(wait.day, 4); assert.equal(wait.completed, 1);
});

test('2365 validates task IDs, task count, and space without mutating the input', () => {
  for (const input of ['', '[]', '1,,2', '[true]', '[0]', '[-1]', '[1.5]', '[1000000001]', Array(33).fill(1)]) {
    assert.throws(() => problem.builder(input, {space: 1}), RangeError);
  }
  for (const space of [0, -1, 4, 1.5, true, '', 'nope']) assert.throws(() => problem.builder([1, 2, 1], {space}), RangeError);
  const tasks = [1, 2, 1]; problem.builder(tasks, {space: 2});
  assert.deepEqual(tasks, [1, 2, 1]);
});

test('2365 renders every native state in both languages and folds long idle ranges', () => {
  const host = {innerHTML: ''}, context = {lang: 'en', $: () => host, escapeHtml: value => String(value), steps: [], stepIndex: 0};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/renderer-task-scheduler-ii-2365.js'), 'utf8'), context);
  for (const language of ['en', 'vi']) for (const [tasks, space] of [cases[0], cases[2], cases.at(-1)]) {
    context.lang = language; context.steps = problem.builder(tasks, {space}).steps;
    context.steps.forEach((step, index) => {
      context.stepIndex = index; context.renderScheduler2365View(step);
      assert.match(host.innerHTML, /ts2365-viz/);
      assert.doesNotMatch(host.innerHTML, /undefined|NaN|Infinity/);
      if (step.final) assert.match(host.innerHTML, /data-ts2365-answer=/);
      const view = step.scheduler2365View;
      if (view.event === 'check' && view.previous !== null) {
        assert.match(host.innerHTML, /class="ts2365-max"><small>[^<]*<\/small><b>…<\/b>/);
      }
    });
  }
  assert.match(host.innerHTML, /data-ts2365-rest-range=/);
});

test('2365 lazy assets and scoped code layout are wired into the app', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert.match(html, /task-scheduler-ii-2365.css[^\n]+data-problem-ids="2365"/);
  assert.match(html, /renderer-task-scheduler-ii-2365.js[^\n]+data-problem-ids="2365"/);
  const script = fs.readFileSync(path.join(__dirname, '../public/script.js'), 'utf8');
  assert.match(script, /Boolean\(step.scheduler2365View\)[\s\S]*renderScheduler2365View\(step\)/);
  const css = fs.readFileSync(path.join(__dirname, '../public/task-scheduler-ii-2365.css'), 'utf8');
  assert.match(css, /#vizPanel:has\(.ts2365-viz\) #codePanel/);
  assert.match(css, /data-theme="light"/);
});
