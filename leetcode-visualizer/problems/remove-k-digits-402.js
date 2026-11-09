'use strict';
const base = require('./string')[402];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const CODE = `class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        stack = []
        for i, digit in enumerate(num):
            while k > 0 and stack and stack[-1] > digit:
                removed = stack.pop()
                k -= 1
            stack.append(digit)
        if k > 0:
            stack = stack[:-k]
        raw = ''.join(stack)
        stripped = raw.lstrip('0')
        return stripped or '0'`;

function parse(input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('Invalid parameters');
  const num = typeof input === 'string' ? input.trim() : '';
  const k = params.k === undefined ? 3 : params.k;
  if (!/^\d{1,18}$/.test(num) || !Number.isInteger(k) || k < 0 || k > num.length) {
    throw new RangeError('#402: use 1–18 digits and an integer k with 0 ≤ k ≤ num.length');
  }
  return [num, k];
}
function payload(input, params) { return { code: CODE, method: 'removeKdigits', args: parse(input, params) }; }

function build(input, params) {
  const tracePayload = payload(input, params), [num, initialK] = tracePayload.args, code = CODE.split('\n');
  const native = runTrace(tracePayload), stackIds = [], deleted = [], visits = [];
  let current = null, pending = null, comparison = null, phase = 'scan', previous = null;
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = code[event.line - 1].trim();
    let change = null;
    if (text === 'for i, digit in enumerate(num):') {
      current = event.branch ? x.i : null; comparison = null;
      if (event.branch) { visits.push({ index: x.i, step }); change = { kind: 'visit', index: x.i }; }
    }
    if (text.startsWith('while k > 0')) {
      const top = stackIds.at(-1) ?? null, hasStack = x.stack.length > 0;
      comparison = { top, left: top === null ? null : num[top], right: x.digit, k: x.k,
        budget: x.k > 0, hasStack, evaluatedTop: x.k > 0 && hasStack, pass: event.branch };
    }
    if (text === 'removed = stack.pop()') {
      const index = stackIds.pop();
      const row = { index, digit: num[index], kind: 'greedy', incoming: x.i, step };
      deleted.push(row); pending = index; change = { ...row, kind: 'pop' };
    }
    if (text === 'k -= 1') {
      change = { kind: 'budget', before: previous.locals.k, after: x.k, index: pending }; pending = null;
    }
    if (text === 'stack.append(digit)') {
      stackIds.push(x.i); comparison = null; change = { kind: 'push', index: x.i };
    }
    if (text === 'if k > 0:') { phase = 'tail'; current = null; comparison = null; }
    if (text === 'stack = stack[:-k]') {
      const indices = stackIds.splice(x.stack.length);
      for (const index of indices) deleted.push({ index, digit: num[index], kind: 'tail', incoming: null, step });
      change = { kind: 'trim', indices, k: x.k };
    }
    if (text === "raw = ''.join(stack)") { phase = 'join'; change = { kind: 'join' }; }
    if (text === "stripped = raw.lstrip('0')") { phase = 'normalize'; change = { kind: 'normalize' }; }
    const final = event.returning && event.scope === 'removeKdigits';
    const raw = x.raw ?? null, stripped = x.stripped ?? null;
    const leadingIds = stripped === null ? [] : stackIds.slice(0, raw.length - stripped.length);
    const view = { id: 402, num, initialK, k: x.k, phase: final ? 'done' : phase, current,
      stack: x.stack ?? null, stackIds: [...stackIds], deleted: copy(deleted), visits: copy(visits),
      pending, comparison: copy(comparison), raw, stripped, leadingIds, change,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer: event.outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returning: event.returning, returned: event.returned,
      trace: native.trace, result: final ? native.answer : null };
    previous = view;
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), removeKDigits402View: view };
  });
  return { original: num, k: initialK, answer: native.answer, steps };
}

module.exports = { 402: {
  ...base, code: CODE.split('\n'), debugMode: 'line-by-line', builder: build, tracePayload: payload,
  liveArgs: parse,
  inputLabel: bi('num · chuỗi 1–18 chữ số', 'num · a string of 1–18 digits'),
  extraParams: [{ key: 'k', label: bi('k · 0 đến độ dài num', 'k · 0 through num.length'), default: 3, min: 0, max: 18 }],
  approach: [bi('Khi còn k, bỏ TOP lớn hơn chữ số mới. Sau lượt quét, cắt đuôi nếu còn k; cuối cùng bỏ số 0 đầu để chuẩn hóa.',
    'While k remains, remove a TOP larger than the new digit. Trim the tail if k remains after scanning, then normalize leading zeroes.')],
  visualizationLimits: { maxDigits: 18, completeTrace: true },
} };
