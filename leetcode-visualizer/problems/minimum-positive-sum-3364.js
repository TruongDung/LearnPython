'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const code = [
  'class Solution:',
  '    def minimumSumSubarray(self, nums, l, r):',
  '        best = float("inf")',
  '        best_window = None',
  '        for size in range(l, r + 1):',
  '            total = sum(nums[i] for i in range(size))',
  '            if 0 < total < best:',
  '                best, best_window = total, [0, size - 1]',
  '            for right in range(size, len(nums)):',
  '                total += nums[right] - nums[right - size]',
  '                if 0 < total < best:',
  '                    best, best_window = total, [right - size + 1, right]',
  '        return best if best != float("inf") else -1',
];
function parse(input, params = {}) {
  let nums = input;
  if (typeof input === 'string') { try { nums = input.trim().startsWith('[') ? JSON.parse(input) : input.split(',').map(s => s.trim() ? Number(s) : NaN); } catch (_) { nums = null; } }
  const l = Number(params.l ?? 2), r = Number(params.r ?? 3);
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100 || nums.some(n => !Number.isInteger(n) || n < -1000 || n > 1000) || !Number.isInteger(l) || !Number.isInteger(r) || l < 1 || l > r || r > nums.length) throw Error('3364: 1–100 integers in [-1000,1000], 1 ≤ l ≤ r ≤ nums.length.');
  return { nums: [...nums], l, r };
}
function builder(input, params = {}) {
  const { nums, l, r } = parse(input, params), trace = runTrace({ code: code.join('\n'), method: 'minimumSumSubarray', args: [nums, l, r] });
  let window = null, previous = null;
  const steps = trace.events.map((record, index) => {
    const x = record.locals, final = index === trace.events.length - 1; let event = 'line', change = null;
    if (record.line === 6) { window = [0, x.size - 1]; event = 'size'; }
    if (record.line === 10) {
      change = { before: previous, out: nums[x.right - x.size], in: nums[x.right] };
      window = [x.right - x.size + 1, x.right]; event = 'slide';
    }
    if (record.line === 7 || record.line === 11) event = x.total <= 0 ? 'nonpositive' : record.branch ? 'improve' : 'keep';
    if (record.line === 8 || record.line === 12) event = 'best';
    if (record.line === 6 || record.line === 10) previous = x.total;
    return { arr: [], codeLines: [record.line], title: bi(`Dòng ${record.line}`, `Line ${record.line}`), note: bi('', ''), final,
      vars: ['size', 'right', 'total', 'best', 'best_window'].map(name => ({ name, value: x[name] ?? '—' })),
      minPositive3364View: { nums: [...nums], l, r, size: x.size ?? null, window: window && [...window], total: x.total ?? null, best: x.best ?? '∞', bestWindow: x.best_window ? [...x.best_window] : null, change, event: final ? 'result' : event, line: record.line, source: code[record.line - 1], final, answer: final ? trace.answer : null },
    };
  });
  return { original: nums, answer: trace.answer, steps };
}
module.exports = { 3364: {
  id: 3364, difficulty: 'easy', slug: 'minimum-positive-sum-subarray',
  category: { key: 'sliding', vi: 'Cửa sổ trượt', en: 'Sliding Window' }, tags: [{ key: 'array', vi: 'Mảng', en: 'Array' }],
  title: bi('Minimum Positive Sum Subarray', 'Minimum Positive Sum Subarray'), titleVi: bi('Tổng dương nhỏ nhất của đoạn con', 'Minimum positive subarray sum'),
  statement: bi('Chọn đoạn con liên tiếp có độ dài từ l đến r và tổng > 0. Trả tổng nhỏ nhất; không có thì −1.', 'Choose a contiguous subarray of length l through r and sum > 0. Return the smallest such sum, or −1.'),
  defaultInput: '[3,-2,1,4]', inputKind: 'string', inputLabel: bi('nums dạng JSON hoặc cách dấu phẩy', 'nums as JSON or comma-separated integers'),
  extraParams: [{ key: 'l', label: bi('l · độ dài nhỏ nhất', 'l · minimum length'), default: 2, min: 1 }, { key: 'r', label: bi('r · độ dài lớn nhất', 'r · maximum length'), default: 3, min: 1 }],
  approach: [bi('Thử từng độ dài l…r. Trượt cửa sổ: bỏ số bên trái, thêm số bên phải. Chỉ giữ tổng dương nhỏ nhất.', 'Try each length l…r. Slide the window: remove the left value and add the right one. Keep the smallest positive sum.')],
  complexity: { time: 'O(n(r−l+1))', space: 'O(1)' }, code, debugMode: 'line-by-line', builder, liveArgs: (input, params) => { const p = parse(input, params); return [p.nums, p.l, p.r]; },
} };
