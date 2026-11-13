'use strict';

// Shared source tracing and bounded input validation for the sweep-line study path.
// Every frame comes from the displayed Python, including nested heap/DP/tree operations.
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const labels = {
  interval: bi('Khoảng', 'Intervals'),
  'sweep-line': bi('Đường quét', 'Sweep Line'),
  'prefix-sum': bi('Tổng tiền tố', 'Prefix Sum'),
  heap: bi('Heap / Hàng đợi ưu tiên', 'Heap / Priority Queue'),
  greedy: bi('Tham lam', 'Greedy'),
  dp: bi('Quy hoạch động', 'Dynamic Programming'),
  geometry: bi('Hình học', 'Geometry'),
  'segment-tree': bi('Cây phân đoạn', 'Segment Tree'),
  'two-pointer': bi('Hai con trỏ', 'Two Pointers'),
  array: bi('Mảng', 'Array'),
};
const tag = key => ({ key, ...(labels[key] || bi(key, key)) });
function fail(message) { throw new RangeError(message); }
function integer(value, lo = -10000, hi = 10000) {
  if (!Number.isSafeInteger(value) || value < lo || value > hi) fail(`Expected an integer in [${lo}, ${hi}].`);
  return value;
}
function vector(value, { min = 0, max = 24, lo = -10000, hi = 10000 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail(`Expected ${min}–${max} numbers.`);
  value.forEach(x => integer(x, lo, hi));
  return value;
}
function rows(value, width = 2, { min = 0, max = 16, lo = -10000, hi = 10000, ordered = true } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail(`Expected ${min}–${max} rows.`);
  value.forEach(row => {
    vector(row, { min: width, max: width, lo, hi });
    if (ordered && row[0] > row[1]) fail('Each interval must have start ≤ end.');
  });
  return value;
}
function sortedDisjoint(value, closed = true) {
  rows(value);
  for (let i = 1; i < value.length; i++) {
    if (closed ? value[i - 1][1] >= value[i][0] : value[i - 1][1] > value[i][0]) fail('Use sorted, disjoint intervals.');
  }
}
function indexedQueries(nums, queries, width = 2) {
  vector(nums, { min: 1, lo: 0, hi: 100 });
  rows(queries, width, { lo: 0, hi: 100 });
  queries.forEach(q => { if (q[1] >= nums.length) fail('Query endpoints must be valid array indices.'); });
}

function lesson(spec) {
  const imports = [];
  if (/\bheapq\b/.test(spec.source)) imports.push('import heapq');
  if (/\bbisect_right\b/.test(spec.source)) imports.push('from bisect import bisect_right');
  if (/\bdefaultdict\b/.test(spec.source)) imports.push('from collections import defaultdict');
  if (/\bcombinations\b/.test(spec.source)) imports.push('from itertools import combinations');
  const math = ['inf', 'hypot'].filter(name => new RegExp(`\\b${name}\\b`).test(spec.source));
  if (math.length) imports.push(`from math import ${math.join(', ')}`);
  const code = [...imports, ...(imports.length ? [''] : []), 'class Solution:',
    ...spec.source.trim().split('\n').map(line => `    ${line}`)];
  const method = spec.source.match(/def (\w+)\(/)[1];
  function parse(input) {
    let value = input;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { fail(`${spec.id}: Enter valid JSON. Example: ${JSON.stringify(spec.example)}`); }
    }
    const args = spec.fields.length === 1 && Array.isArray(value) ? [value]
      : spec.fields.map(key => value && typeof value === 'object' ? value[key] : undefined);
    try { spec.validate(...args); } catch (error) { fail(`${spec.id}: ${error.message}`); }
    return JSON.parse(JSON.stringify(args));
  }
  function builder(input) {
    const args = parse(input);
    const trace = runTrace({ code: code.join('\n'), method, args });
    const original = Object.fromEntries(spec.fields.map((key, index) => [key, args[index]]));
    const checks = new Map();
    let lastCheck = null;
    const steps = trace.events.map((record, index) => {
      const state = { ...record.outer, ...record.locals };
      const final = index === trace.events.length - 1;
      const source = code[record.line - 1].trim();
      if (spec.id === 3356 && record.scope === 'enough') {
        lastCheck = { ...record.locals };
        checks.set(record.locals.count, lastCheck);
      }
      // Keep a labeled historical picture after the checker frame has returned.
      // The Variables panel below still shows only the currently executing frame.
      const check = spec.id === 3356 && record.scope !== 'enough'
        ? final && trace.answer >= 0 ? checks.get(trace.answer) : lastCheck : null;
      return {
        arr: [], highlight: [], mark: [], codeLines: [record.line], final,
        title: bi(`Dòng ${record.line} · ${method}`, `Line ${record.line} · ${method}`),
        note: record.branch === null ? bi('Theo dõi trạng thái trong hình.', 'Follow the state in the picture.')
          : bi(`Điều kiện: ${record.branch ? 'đúng' : 'sai'}.`, `Condition: ${record.branch ? 'true' : 'false'}.`),
        vars: Object.entries(state).map(([name, value]) => ({ name, value: typeof value === 'object' ? JSON.stringify(value) : value })),
        sweepStudyView: { id: spec.id, kind: spec.kind, original, state, source, line: record.line,
          branch: record.branch, scope: record.scope, final, answer: final ? trace.answer : null,
          title: bi(spec.title, spec.title), hint: bi(...spec.hint), config: spec.picture || {}, check: check || null },
      };
    });
    return { input, original, answer: trace.answer, steps };
  }
  return {
    id: spec.id, slug: spec.slug, difficulty: spec.difficulty || 'medium',
    title: bi(spec.title, spec.title), statement: bi(...spec.statement),
    category: tag(spec.category || 'interval'),
    tags: [...new Set(['sweep-line', ...(spec.tags || [])])].map(tag),
    premium: !!spec.premium, inputKind: 'string', defaultInput: JSON.stringify(spec.example),
    inputLabel: bi(`JSON · ${spec.fields.join(', ')} · giới hạn nhỏ để xem từng bước`, `JSON · ${spec.fields.join(', ')} · bounded examples for stepping`),
    debugMode: 'line-by-line', code, codeLabel: bi(...spec.hint),
    complexity: { time: spec.time, space: spec.space },
    approach: [bi(...spec.hint), bi('Nhấn Tiếp để xem dòng Python, con trỏ và cấu trúc dữ liệu thay đổi.',
      'Step forward to follow the Python line, pointers, and data structure changes.')],
    builder, liveArgs: input => parse(input),
  };
}
module.exports = { lesson, bi, tag, integer, vector, rows, sortedDisjoint, indexedQueries };
