'use strict';

const base = require('./monotonic-stack')[2832];
const bi = (vi, en) => ({ vi, en });
const CODE = [
  'from typing import List',
  '',
  'class Solution:',
  '    def maximumLengthOfRanges(',
  '        self, nums: List[int]',
  '    ) -> List[int]:',
  '        n = len(nums)',
  '        ans = [0] * n',
  '        stack = []',
  '        for i in range(n + 1):',
  "            cur = nums[i] if i < n else float('inf')",
  '            while stack and nums[stack[-1]] < cur:',
  '                mid = stack.pop()',
  '                left = stack[-1] if stack else -1',
  '                ans[mid] = i - left - 1',
  '            if i < n:',
  '                stack.append(i)',
  '        return ans',
];

function parse(input, limit = 14) {
  let nums = input;
  if (typeof input === 'string') {
    try {
      const raw = input.trim();
      nums = raw.startsWith('[') ? JSON.parse(raw) : raw.split(',').map(part => /^\d+$/.test(part.trim()) ? Number(part) : NaN);
    } catch (_) { nums = null; }
  }
  if (!Array.isArray(nums) || !nums.length || nums.length > limit ||
      !Array.from(nums).every(value => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100000) ||
      new Set(nums).size !== nums.length) {
    throw new RangeError(`2832: nums cần 1–${limit} số nguyên khác nhau, 1…100000 / use 1–${limit} distinct integers in 1…100000.`);
  }
  return [...nums];
}

function builder(input) {
  const nums = parse(input), n = nums.length, ans = Array(n).fill(0), stack = [], ranges = Array(n).fill(null), steps = [];
  let nReady = false, ansReady = false, stackReady = false, i, cur, mid, left, pop = null, comparison = null;
  const titles = {
    7: ['Đọc độ dài mảng', 'Read the array length'],
    8: ['Tạo mảng kết quả', 'Create the answer array'],
    9: ['Tạo stack rỗng', 'Create an empty stack'],
    10: ['Di chuyển con trỏ i', 'Move pointer i'],
    11: ['Đọc chiều cao hiện tại', 'Read the current height'],
    12: ['Đỉnh stack thấp hơn cur?', 'Is the stack top lower than cur?'],
    13: ['Pop: đã gặp biên phải', 'Pop: the right barrier was found'],
    14: ['Đỉnh còn lại là biên trái', 'The remaining top is the left barrier'],
    15: ['Ghi độ dài khoảng', 'Store the range length'],
    16: ['i còn nằm trong mảng?', 'Is i inside the array?'],
    17: ['Push i để chờ biên phải', 'Push i to await its right barrier'],
    18: ['Trả các độ dài', 'Return the range lengths'],
  };
  function emit(line, phase, condition = null) {
    const locals = { nums: [...nums] };
    if (nReady) locals.n = n;
    if (ansReady) locals.ans = [...ans];
    if (stackReady) locals.stack = [...stack];
    for (const [name, value] of Object.entries({ i, cur: cur === Infinity ? '∞' : cur, mid, left })) if (value !== undefined) locals[name] = value;
    const title = titles[line];
    steps.push({
      title: bi(`Dòng ${line} · ${title[0]}`, `Line ${line} · ${title[1]}`), note: bi('', ''),
      arr: [], highlight: [], mark: [], codeLines: [line], final: line === 18,
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      range2832View: {
        nums: [...nums], n, ans: ansReady ? [...ans] : null, stack: [...stack], ranges: ranges.map(range => range ? { ...range } : null),
        line, source: CODE[line - 1].trim(), phase, condition, i: i ?? null, cur: cur === Infinity ? '∞' : cur ?? null,
        pop: pop ? { ...pop } : null, comparison: comparison ? { ...comparison } : null, locals, final: line === 18,
      },
    });
  }
  nReady = true; emit(7, 'init');
  ansReady = true; emit(8, 'init');
  stackReady = true; emit(9, 'init');
  for (i = 0; i <= n; i++) {
    pop = null; comparison = null; emit(10, 'scan');
    cur = i < n ? nums[i] : Infinity; emit(11, 'read');
    while (true) {
      const top = stack.at(-1), condition = top !== undefined && nums[top] < cur;
      comparison = { top: top ?? null, current: i, lower: condition }; emit(12, 'compare', condition);
      if (!condition) break;
      mid = stack.pop(); pop = { mid, left: null, right: i, assigned: false }; emit(13, 'pop');
      left = stack.length ? stack.at(-1) : -1; pop.left = left; emit(14, 'left');
      ans[mid] = i - left - 1; pop.assigned = true;
      ranges[mid] = { mid, left, right: i, length: ans[mid] }; emit(15, 'answer');
    }
    emit(16, 'inside', i < n);
    if (i < n) { stack.push(i); pop = null; emit(17, 'push'); }
  }
  // Python retains the final loop value when the iterator is exhausted.
  i = n; emit(10, 'end', false); emit(18, 'done');
  return { original: nums, answer: [...ans], steps };
}

module.exports = { 2832: {
  ...base, code: CODE, builder, debugMode: 'line-by-line',
  inputKind: 'string', inputLabel: bi('nums · 1–14 số khác nhau, 1…100000', 'nums · 1–14 distinct integers in 1…100000'),
  statement: bi('Với mỗi nums[i], tìm độ dài khoảng liên tiếp lớn nhất mà nums[i] là phần tử lớn nhất. Các số trong nums khác nhau.', 'For each nums[i], find the longest contiguous range whose maximum is nums[i]. Values in nums are distinct.'),
  approach: [bi('Cột lớn hơn chặn hai đầu. Khi pop mid: left là đỉnh stack còn lại, i là biên phải; độ dài = i − left − 1.', 'Taller bars block both ends. When mid is popped: left is the remaining stack top, i is the right barrier; length = i − left − 1.')],
  complexity: { time: 'O(n)', space: 'O(n)', note: bi('Mỗi index push và pop một lần. Minh hoạ tối đa 14 cột.', 'Each index is pushed and popped once. Visualization up to 14 bars.') },
  liveArgs: input => [parse(input, 100000)],
} };
