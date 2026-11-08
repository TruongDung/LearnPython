'use strict';
const base = require('./monotonic-stack');
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const CODES = {
  2334: `from typing import List

class Solution:
    def validSubarraySize(self, nums: List[int], threshold: int) -> int:
        n = len(nums)
        stack = []
        for right in range(n + 1):
            current = nums[right] if right < n else 0
            while stack and nums[stack[-1]] > current:
                mid = stack.pop()
                left = stack[-1] if stack else -1
                width = right - left - 1
                minimum = nums[mid]
                product = minimum * width
                if product > threshold:
                    return width
            if right < n:
                stack.append(right)
        return -1`,
  2297: `from typing import List

class Solution:
    def minCost(self, nums: List[int], costs: List[int]) -> int:
        n = len(nums)
        dp = [float('inf')] * n
        dp[0] = 0
        parent = [-1] * n
        greater = []
        smaller = []
        for j, value in enumerate(nums):
            while greater and nums[greater[-1]] <= value:
                i = greater.pop()
                candidate = dp[i] + costs[j]
                if candidate < dp[j]:
                    dp[j] = candidate
                    parent[j] = i
            while smaller and nums[smaller[-1]] > value:
                i = smaller.pop()
                candidate = dp[i] + costs[j]
                if candidate < dp[j]:
                    dp[j] = candidate
                    parent[j] = i
            greater.append(j)
            smaller.append(j)
        return dp[-1]`,
};
function parseArray(input, name, min, max, limit = 14) {
  let a = input;
  try {
    if (typeof a === 'string') {
      const s = a.trim();
      a = s.startsWith('[') ? JSON.parse(s) : s ? s.split(',').map(t => t.trim() ? Number(t) : NaN) : [];
    }
  } catch { a = null; }
  if (!Array.isArray(a) || !a.length || a.length > limit ||
      !Array.from(a).every(x => Number.isInteger(x) && x >= min && x <= max)) {
    throw new RangeError(`${name}: 1–${limit} integers from ${min} to ${max}`);
  }
  return [...a];
}
function argsFor(id, input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('Invalid parameters');
  if (id === 2334) {
    const nums = parseArray(input, 'nums', 1, 1e9);
    const threshold = params.threshold === undefined ? 6 : params.threshold;
    if (typeof threshold !== 'number' || !Number.isInteger(threshold) || threshold < 1 || threshold > 1e9) {
      throw new RangeError('threshold: an integer from 1 to 1000000000');
    }
    return [nums, threshold];
  }
  const nums = parseArray(input, 'nums', 0, 100000);
  const costs = parseArray(params.costs === undefined ? '3,7,6,4,2' : params.costs, 'costs', 0, 100000);
  if (costs.length !== nums.length) throw new RangeError('nums and costs must have the same length');
  return [nums, costs];
}
function route(parent, end) {
  if (!parent || end === null || end === undefined) return [];
  const ids = [];
  for (let i = end; i >= 0; i = parent[i]) {
    ids.push(i);
    if (i === 0) return ids.reverse();
    if (parent[i] < 0 || parent[i] >= i) return [];
  }
  return [];
}
function build(id, input, params) {
  const args = argsFor(id, input, params), values = args[0], code = CODES[id].split('\n');
  const method = id === 2334 ? 'validSubarraySize' : 'minCost';
  const native = runTrace({ code: CODES[id], method, args });
  let current = null, scratch = {}, comparison = null, edge = null, pendingParent = null, previous = null;
  const checks = [], edges = [], writes = [];
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = code[event.line - 1].trim(), final = event.returning;
    let change = null;
    if (text.startsWith('for ') && event.branch) {
      current = id === 2334 ? x.right : x.j;
      scratch = {}; comparison = null; edge = null;
    }
    if (id === 2334) {
      if (text === 'while stack and nums[stack[-1]] > current:') {
        const top = x.stack.at(-1);
        comparison = { stack: 'stack', top: top ?? null, left: top === undefined ? null : values[top],
          right: x.current, op: '>', pass: event.branch, line: event.line };
      }
      if (text === 'mid = stack.pop()') {
        scratch = { mid: x.mid }; change = { kind: 'pop', index: x.mid };
      }
      for (const name of ['left', 'width', 'minimum', 'product']) {
        if (text.startsWith(`${name} = `)) scratch[name] = x[name];
      }
      if (text === 'if product > threshold:') {
        const check = { mid: x.mid, left: x.left, right: x.right, width: x.width,
          minimum: x.minimum, product: x.product, pass: event.branch, step };
        checks.push(check); change = { kind: 'check', ...check };
      }
      if (text === 'stack.append(right)') change = { kind: 'push', index: x.right };
    } else {
      const stackName = text.startsWith('while greater ') ? 'greater' : text.startsWith('while smaller ') ? 'smaller' : null;
      if (stackName) {
        const top = x[stackName].at(-1);
        comparison = { stack: stackName, top: top ?? null, left: top === undefined ? null : values[top],
          right: x.value, op: stackName === 'greater' ? '≤' : '>', pass: event.branch, line: event.line };
      }
      if (text === 'i = greater.pop()' || text === 'i = smaller.pop()') {
        edge = { from: x.i, to: x.j, kind: text.includes('greater') ? 'greater' : 'smaller', step };
        edges.push(copy(edge)); scratch = {}; change = { kind: 'pop', index: x.i };
      }
      if (text === 'candidate = dp[i] + costs[j]') scratch = { candidate: x.candidate, fromCost: x.dp[x.i] };
      if (text === 'if candidate < dp[j]:') scratch.improves = event.branch;
      if (text === 'dp[j] = candidate') {
        const row = { from: x.i, to: x.j, before: previous.locals.dp[x.j], after: x.dp[x.j], step };
        writes.push(row); pendingParent = x.j; change = { kind: 'write', ...row };
      }
      if (text === 'parent[j] = i') { pendingParent = null; change = { kind: 'parent', from: x.i, to: x.j }; }
      if (text.endsWith('.append(j)')) change = { kind: 'push', index: x.j };
    }
    const target = final ? values.length - 1 : current;
    const path = id === 2297 && x.dp?.[0] === 0 && pendingParent !== target ? route(x.parent, target) : [];
    const view = { id, values, threshold: id === 2334 ? args[1] : null, costs: id === 2297 ? args[1] : null,
      current: final ? null : current, scratch: copy(scratch), comparison: copy(comparison), edge: copy(edge),
      checks: copy(checks), edges: copy(edges), writes: copy(writes), path, pendingParent, change,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer: event.outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returned: event.returned, returning: event.returning,
      trace: native.trace, result: final ? native.answer : null };
    previous = view;
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), stackBoundaryView: view };
  });
  return { original: values, answer: native.answer, steps };
}
module.exports = Object.fromEntries([2334, 2297].map(id => [id, {
  ...base[id], code: CODES[id].split('\n'), debugMode: 'line-by-line', inputKind: 'string',
  inputLabel: bi(id === 2334 ? 'nums · 1–14 số dương, tối đa 10⁹' : 'nums · 1–14 số từ 0 đến 100000',
    id === 2334 ? 'nums · 1–14 positive integers, up to 10⁹' : 'nums · 1–14 integers from 0 to 100000'),
  extraParams: id === 2334 ? [{ key: 'threshold', label: bi('threshold', 'threshold'), default: 6, min: 1, max: 1e9 }] :
    [{ key: 'costs', label: bi('costs · phí đáp xuống, cùng độ dài nums', 'costs · landing fees, same length as nums'),
      default: '3,7,6,4,2', type: 'string' }],
  statement: id === 2334 ? bi('Tìm một đoạn liên tiếp dài k có min × k > threshold. Trả k bất kỳ, hoặc −1.',
    'Find a contiguous segment of length k with min × k > threshold. Return any valid k, or −1.') :
    bi('Đi từ 0 đến n−1. Nhảy tới số đầu tiên bên phải ≥ nums[i], hoặc số đầu tiên < nums[i]. Trả tổng phí đáp xuống nhỏ nhất; vị trí 0 miễn phí.',
      'Go from 0 to n−1. Jump to the first value on the right ≥ nums[i], or the first value < nums[i]. Minimize landing fees; index 0 is free.'),
  approach: [id === 2334 ? bi('Stack không giảm. Khi POP, mở đoạn (left, right) rồi kiểm tra min × độ dài.',
    'A nondecreasing stack. On POP, expose the segment (left, right) and test min × length.') :
    bi('Hai stack tìm cạnh nhảy; DP cập nhật chi phí. parent ghi lại đường đi đang tốt nhất.',
      'Two stacks find jump edges; DP relaxes costs. parent records the current best route.')],
  complexity: { time: 'O(n)', space: 'O(n)', note: bi('Mỗi vị trí vào / ra mỗi stack tối đa một lần.',
    'Each index enters and leaves each stack at most once.') },
  visualizationLimits: { maxValues: 14, completeTrace: true },
  builder: (input, params) => build(id, input, params), liveArgs: (input, params) => argsFor(id, input, params),
}]));
