'use strict';

const {runTrace} = require('./wasm-picture-trace');
const bi = (vi, en) => ({vi, en});
const copy = value => JSON.parse(JSON.stringify(value));
const code = `class Solution:
    def taskSchedulerII(self, tasks, space):
        day = 0
        last = {}

        for i, task in enumerate(tasks):
            day += 1
            if task in last:
                day = max(day, last[task] + space + 1)
            last[task] = day

        return day`.split('\n');

function parse(input, params = {}) {
  let tasks = input;
  if (typeof tasks === 'string') {
    const raw = tasks.trim();
    try {
      tasks = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',').map(token => token.trim() ? Number(token) : NaN);
    } catch { tasks = null; }
  }
  if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 32 ||
      tasks.some(task => !Number.isInteger(task) || task < 1 || task > 1e9)) {
    throw new RangeError('2365: Enter 1–32 tasks, each an integer from 1 to 10⁹.');
  }
  const rawSpace = params.space ?? 3;
  const space = typeof rawSpace === 'string' && rawSpace.trim() === '' ? NaN : Number(rawSpace);
  if (!['number', 'string'].includes(typeof rawSpace) || !Number.isInteger(space) || space < 1 || space > tasks.length) {
    throw new RangeError('2365: space must be an integer from 1 to tasks.length.');
  }
  return {tasks: [...tasks], space};
}

function build(input, params) {
  const {tasks, space} = parse(input, params);
  const trace = runTrace({code: code.join('\n'), method: 'taskSchedulerII', args: [tasks, space]});
  const scheduled = [], timeline = [];
  let active = null, candidate = null, previous = null, checked = null, before = 0;
  const steps = trace.events.map((record, index) => {
    const local = record.locals, source = code[record.line - 1].trim();
    const last = (local.last?.__pairs__ ?? []).map(([task, day]) => ({task, day}));
    const final = index === trace.events.length - 1;
    let event = 'initialize';
    if (source === 'for i, task in enumerate(tasks):') {
      active = record.branch ? local.i : null;
      candidate = null; checked = null;
      previous = record.branch ? last.find(row => row.task === local.task)?.day ?? null : null;
      before = local.day;
      event = record.branch ? 'select' : 'loop-end';
    }
    if (source === 'day += 1') { candidate = local.day; event = 'advance'; }
    if (source === 'if task in last:') { checked = record.branch; event = 'check'; }
    if (source === 'day = max(day, last[task] + space + 1)') event = local.day > candidate ? 'wait' : 'ready';
    if (source === 'last[task] = day') {
      event = 'execute';
      if (local.day > before + 1) timeline.push({kind: 'rest', start: before + 1, end: local.day - 1});
      const entry = {kind: 'task', task: local.task, index: local.i, start: local.day, end: local.day, step: index};
      scheduled.push({...entry}); timeline.push({...entry});
    }
    const view = {id: 2365, tasks, space, line: record.line, source, event: final ? 'return' : event,
      active, task: active === null ? null : tasks[active], candidate, previous, before, checked,
      earliest: previous === null ? 1 : previous + space + 1, day: local.day ?? 0,
      last, scheduled, timeline, completed: scheduled.length, final, answer: final ? trace.answer : null};
    return {arr: [], codeLines: [record.line], final,
      title: bi(`Dòng ${record.line}`, `Line ${record.line}`), note: bi('', ''),
      vars: Object.entries(local).map(([name, value]) => ({name, value})), scheduler2365View: copy(view)};
  });
  return {original: tasks, answer: trace.answer, steps};
}

module.exports = {2365: {
  id: 2365, difficulty: 'medium', slug: 'task-scheduler-ii',
  category: {key: 'greedy', vi: 'Tham lam', en: 'Greedy'},
  tags: [{key: 'greedy', vi: 'Tham lam', en: 'Greedy'}, {key: 'hashmap', vi: 'Hash Map', en: 'Hash Map'}],
  title: bi('Task Scheduler II', 'Task Scheduler II'),
  titleVi: bi('Xếp lịch task theo thứ tự', 'Schedule tasks in their given order'),
  statement: bi('Làm các task theo thứ tự đã cho, mỗi ngày tối đa một task. Giữa hai task cùng loại cần ít nhất space ngày. Tìm tổng số ngày ít nhất.',
    'Complete tasks in the given order, at most one per day. Leave at least space days between tasks of the same type. Minimize the total days.'),
  defaultInput: '1,2,1,2,3,1', inputKind: 'string',
  inputLabel: bi('tasks · 1–32 số nguyên dương', 'tasks · 1–32 positive integers'),
  extraParams: [{key: 'space', type: 'number', label: bi('space · số ngày ở giữa', 'space · days between repeats'), default: 3, min: 1, max: 32}],
  debugMode: 'line-by-line', code,
  approach: [bi('Ngày chạy = max(ngày kế tiếp, lần trước + space + 1).', 'Run day = max(next day, previous run + space + 1).')],
  complexity: {time: 'O(n)', space: 'O(u)', note: bi('u: số loại task khác nhau. Nhảy thẳng qua các ngày nghỉ.', 'u: distinct task types. Jump directly across idle days.')},
  builder: build,
  liveArgs: (input, params) => { const {tasks, space} = parse(input, params); return [tasks, space]; },
}};
