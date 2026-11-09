'use strict';
const base = require('./monotonic-stack')[581];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
// Keep the existing two-stack solution; capture its actual completed statements.
const CODE = base.code.join('\n');

function parse(input) {
  let nums = input;
  try {
    if (typeof nums === 'string') {
      const s = nums.trim();
      nums = s.startsWith('[') ? JSON.parse(s) : s ? s.split(',').map(t => t.trim() ? Number(t) : NaN) : [];
    }
  } catch { nums = null; }
  if (!Array.isArray(nums) || !nums.length || nums.length > 14 ||
      !Array.from(nums).every(n => Number.isInteger(n) && n >= -100000 && n <= 100000)) {
    throw new RangeError('#581: use 1–14 integers from −100000 to 100000');
  }
  return [...nums];
}
function payload(input) { return { code: CODE, method: 'findUnsortedSubarray', args: [parse(input)] }; }

function build(input) {
  const tracePayload = payload(input), values = tracePayload.args[0], code = CODE.split('\n');
  const native = runTrace(tracePayload), resetLine = code.lastIndexOf('        stack = []') + 1;
  const visits = [], evidence = [], writes = [];
  let phase = 'left', current = null, held = null, comparison = null, inversion = null, previous = null;
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = code[event.line - 1].trim();
    let change = null;
    if (event.line === resetLine) {
      phase = 'right'; current = null; held = null; comparison = null; inversion = null;
      change = { kind: 'reset' };
    }
    if (text.startsWith('for i') && event.branch) {
      current = x.i; held = null; comparison = null; inversion = null;
      visits.push({ phase, index: x.i, step }); change = { kind: 'visit', index: x.i };
    }
    if (text.startsWith('while stack ')) {
      const top = x.stack.at(-1) ?? null;
      comparison = { top, left: top === null ? null : values[top], right: phase === 'left' ? x.num : values[x.i],
        op: phase === 'left' ? '>' : '<', pass: event.branch };
      held = null;
      inversion = event.branch ? { from: Math.min(top, x.i), to: Math.max(top, x.i) } : null;
    }
    if (text === 'j = stack.pop()') {
      held = x.j;
      const edge = { phase, index: x.j, current: x.i, from: Math.min(x.j, x.i), to: Math.max(x.j, x.i), step };
      evidence.push(edge); inversion = { from: edge.from, to: edge.to };
      change = { kind: 'pop', ...edge };
    }
    if (text === 'left = min(left, j)' || text === 'right = max(right, j)') {
      const name = phase === 'left' ? 'left' : 'right';
      const row = { phase, name, index: x.j, before: previous.locals[name], after: x[name], step };
      writes.push(row); change = { kind: 'bound', ...row };
    }
    if (text === 'stack.append(i)') { held = null; inversion = null; change = { kind: 'push', index: x.i }; }
    const final = event.returning && event.scope === 'findUnsortedSubarray';
    const left = x.left ?? null, right = x.right ?? null;
    const window = left !== null && right !== null && right > left ? [left, right] : null;
    // This is a final explanatory picture, separate from the Python locals.
    let illustration = null;
    if (final) {
      illustration = values.map((value, index) => ({ value, index }));
      if (window) illustration.splice(left, right - left + 1,
        ...illustration.slice(left, right + 1).sort((a, b) => a.value - b.value || a.index - b.index));
    }
    const view = { id: 581, values, phase, current: final ? null : current, held, comparison: copy(comparison),
      inversion: final ? null : copy(inversion), left, right, window, stack: x.stack ?? null,
      visits: copy(visits), evidence: copy(evidence), writes: copy(writes), change, illustration,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer: event.outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returning: event.returning, returned: event.returned,
      trace: native.trace, result: final ? native.answer : null };
    previous = view;
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), shortestUnsorted581View: view };
  });
  return { original: values, answer: native.answer, steps };
}

module.exports = { 581: {
  ...base, debugMode: 'line-by-line', builder: build, tracePayload: payload, liveArgs: input => [parse(input)],
  inputLabel: bi('nums · 1–14 số · −100000…100000 · cách bằng , hoặc JSON',
    'nums · 1–14 integers · −100000…100000 · comma-separated or JSON'),
  approach: [bi('Quét → với stack tăng để tìm left; quét ← với stack giảm để tìm right. Mỗi POP chỉ ra một cặp sai thứ tự.',
    'Scan → with an increasing stack to find left; scan ← with a decreasing stack to find right. Each POP identifies an inversion.')],
  visualizationLimits: { maxValues: 14, completeTrace: true },
} };
