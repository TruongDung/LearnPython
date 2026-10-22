"use strict";
const base = require('./math')[3867];
const { trace, bi } = require('./picture-trace');
const code = [
  'from math import gcd',
  '',
  'class Solution:',
  '    def gcdSum(self, nums):',
  '        prefixGcd = []',
  '        mx = 0',
  '        for i, x in enumerate(nums):',
  '            mx = max(mx, x)',
  '            g = gcd(x, mx)',
  '            prefixGcd.append(g)',
  '        prefixGcd.sort()',
  '        answer = 0',
  '        left, right = 0, len(prefixGcd) - 1',
  '        while left < right:',
  '            g = gcd(prefixGcd[left], prefixGcd[right])',
  '            answer += g',
  '            left += 1',
  '            right -= 1',
  '        return answer',
];
function parse(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 100000 || !input.every(x => Number.isInteger(x) && x >= 1 && x <= 1000000000)) {
    throw new Error('nums: cần 1–100000 số nguyên trong [1,10^9]. / Use 1–100000 integers in [1,10^9].');
  }
  return [...input];
}
function gcd(a, b) { while (b) { const remainder = a % b; a = b; b = remainder; } return a; }
function builder(input) {
  const nums = parse(input), detailed = nums.length <= 30, preview = detailed ? nums.length : 12;
  const run = trace(3867, code, detailed), locals = { self: {}, nums };
  const maxima = [], built = [], pairs = [];
  let phase = 'prefix', sortOrder = [], pair = null, addition = null, mxUpdate = null, loopFinished = false, pairCount = 0;
  const picture = () => {
    const indices = detailed ? locals.prefixGcd.map((_, i) => i) : Array.from(new Set([
      ...Array.from({ length: Math.min(6, nums.length) }, (_, i) => i),
      ...Array.from({ length: Math.min(6, nums.length) }, (_, i) => nums.length - Math.min(6, nums.length) + i),
    ]));
    return { phase, nums: nums.slice(0, preview), total: nums.length, maxima, built,
      i: locals.i ?? null, x: locals.x ?? null, mx: locals.mx ?? null, g: locals.g ?? null,
      sorted: phase === 'prefix' ? [] : indices.map(i => ({ index: i, value: locals.prefixGcd[i] })), sortOrder,
      left: locals.left ?? null, right: locals.right ?? null, answer: locals.answer ?? null,
      pair, addition, mxUpdate, pairs, pairCount, loopFinished,
      middle: loopFinished && nums.length % 2 ? { index: locals.left, value: locals.prefixGcd[locals.left] } : null };
  };
  const emit = (line, event) => run.emit(line, event, locals, picture);
  locals.prefixGcd = []; emit(5, 'prefixGcd = []');
  locals.mx = 0; emit(6, 'mx = 0');
  for (let i = 0; i < nums.length; i++) {
    locals.i = i; locals.x = nums[i]; mxUpdate = null; emit(7, 'i, x');
    const before = locals.mx;
    locals.mx = Math.max(locals.mx, locals.x);
    if (i < preview) maxima.push(locals.mx);
    mxUpdate = { before, after: locals.mx }; emit(8, 'mx');
    locals.g = gcd(locals.x, locals.mx); emit(9, 'gcd(x, mx)');
    locals.prefixGcd.push(locals.g); if (i < preview) built.push(locals.g);
    emit(10, 'append(g)');
  }
  mxUpdate = null; emit(7, 'prefix-end');
  if (detailed) sortOrder = locals.prefixGcd.map((value, from) => ({ value, from })).sort((a, b) => a.value - b.value || a.from - b.from);
  locals.prefixGcd.sort((a, b) => a - b); phase = 'sort'; emit(11, 'sort()');
  locals.answer = 0; phase = 'pair'; emit(12, 'answer = 0');
  locals.left = 0; locals.right = nums.length - 1; emit(13, 'left, right');
  while (true) {
    pair = null; addition = null;
    const more = locals.left < locals.right; loopFinished = !more;
    emit(14, more ? 'True' : 'False'); if (!more) break;
    locals.g = gcd(locals.prefixGcd[locals.left], locals.prefixGcd[locals.right]);
    pair = { left: locals.left, right: locals.right, a: locals.prefixGcd[locals.left], b: locals.prefixGcd[locals.right], g: locals.g, counted: false };
    emit(15, 'gcd hai đầu / endpoint gcd');
    addition = { before: locals.answer, g: locals.g, after: locals.answer + locals.g };
    locals.answer += locals.g; pair = { ...pair, counted: true }; pairCount++;
    if (detailed || pairs.length < 6) pairs.push({ ...pair, before: addition.before, after: addition.after });
    emit(16, 'answer += g');
    locals.left++; emit(17, 'left += 1');
    locals.right--; emit(18, 'right -= 1');
  }
  phase = 'done'; emit(19, 'return');
  const result = run.finish(locals.answer, picture, nums);
  for (const step of result.steps) { step.gcd3867View = step.pictureView; delete step.pictureView; }
  return result;
}
module.exports = { 3867: { ...base, code, builder, debugMode: 'line-by-line',
  titleVi: bi('Tổng GCD của các cặp được tạo', 'Sum of GCD of Formed Pairs'),
  statement: bi('Tạo prefixGcd[i] = gcd(nums[i], max(nums[0..i])). Sắp xếp, ghép nhỏ nhất với lớn nhất, cộng GCD. Bỏ phần tử giữa nếu lẻ.', 'Build prefixGcd[i] = gcd(nums[i], max(nums[0..i])). Sort, pair smallest with largest, and sum their GCDs. Ignore an odd middle element.'),
  codeLabel: bi('Prefix Max → GCD → sort → hai con trỏ', 'Prefix Max → GCD → sort → two pointers'),
  approach: [bi('Max tích lũy → GCD từng cột. Sort prefixGcd tăng dần.', 'Running maximum → GCD in each column. Sort prefixGcd ascending.'),
    bi('Ghép hai đầu → cộng GCD → thu hai con trỏ vào giữa. Phần tử lẻ không ghép.', 'Pair the two ends → add GCD → move both pointers inward. Leave an odd middle unpaired.')],
  complexity: { time: 'O(n log n + n log V)', space: 'O(n)', note: bi('V = max(nums). Debug từng dòng với ≤30 số. Mảng lớn vẫn tính đầy đủ; hình chỉ xem trước 12 số và 6 cặp đầu.', 'V = max(nums). Line debug for ≤30 values. Larger arrays are fully solved; pictures preview 12 values and the first 6 pairs.') },
  liveArgs: input => [parse(input)],
} };
