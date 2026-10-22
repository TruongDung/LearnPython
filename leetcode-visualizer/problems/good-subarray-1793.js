"use strict";
const base = require('./monotonic-stack')[1793];
const { bi, trace } = require('./picture-trace');
const code = [
  'class Solution:',
  '    def maximumScore(self, nums, k):',
  '        n = len(nums)',
  '        left, right = k, k',
  '        minimum = nums[k]',
  '        width = 1',
  '        score = minimum * width',
  '        answer = score',
  '        while left > 0 or right < n - 1:',
  '            if left == 0 or (right < n - 1 and nums[right + 1] > nums[left - 1]):',
  '                right += 1',
  '            else:',
  '                left -= 1',
  '            minimum = min(minimum, nums[left], nums[right])',
  '            width = right - left + 1',
  '            score = minimum * width',
  '            answer = max(answer, score)',
  '        return answer',
];
function parse(input, params = {}) {
  const nums = Array.isArray(input) ? [...input] : typeof input === 'string' && input.trim() ? input.split(',').map(x => x.trim() === '' ? NaN : Number(x)) : [];
  const raw = params.k === undefined ? 3 : params.k;
  const k = typeof raw === 'number' || typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (nums.length < 1 || nums.length > 100000 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 20000)) throw new Error('nums: cần 1–100000 số nguyên từ 1 đến 20000. / Use 1–100000 integers in [1,20000].');
  if (!Number.isInteger(k) || k < 0 || k >= nums.length) throw new Error('k phải là index trong mảng. / k must be a valid array index.');
  return { nums, k };
}
function builder(input, params = {}) {
  const { nums, k } = parse(input, params), detailed = nums.length <= 30;
  const run = trace(1793, code, detailed), locals = { self: {}, nums, k };
  let best = null, choice = null, moved = null, line = null;
  const history = [];
  function picture() {
    const offset = detailed ? 0 : Math.max(0, Math.min((best?.left ?? k) - 1, nums.length - 12));
    return { nums: detailed ? nums : nums.slice(offset, offset + 12), offset, total: nums.length, k,
      left: locals.left ?? null, right: locals.right ?? null, minimum: locals.minimum ?? null,
      width: locals.width ?? null, score: locals.score ?? null, answer: locals.answer ?? null,
      best, choice, moved, history: detailed ? history : history.slice(-6), pending: line === 11 || line === 13 || line === 14 || line === 15 };
  }
  function emit(at, event) { line = at; run.emit(at, event, locals, picture); }
  locals.n = nums.length; emit(3, 'n');
  locals.left = k; locals.right = k; emit(4, '[k, k]');
  locals.minimum = nums[k]; emit(5, 'minimum');
  locals.width = 1; emit(6, 'width');
  locals.score = locals.minimum * locals.width; emit(7, 'score');
  locals.answer = locals.score; best = { left: k, right: k, minimum: nums[k], score: locals.score };
  history.push({ ...best }); emit(8, 'answer');
  while (true) {
    choice = null; moved = null;
    const more = locals.left > 0 || locals.right < locals.n - 1;
    emit(9, more ? 'True' : 'False'); if (!more) break;
    const leftValue = locals.left > 0 ? nums[locals.left - 1] : null;
    const rightValue = locals.right < nums.length - 1 ? nums[locals.right + 1] : null;
    const goRight = locals.left === 0 || (locals.right < locals.n - 1 && rightValue > leftValue);
    choice = { leftValue, rightValue, side: goRight ? 'right' : 'left', reason: leftValue === null ? 'left-boundary' : rightValue === null ? 'right-boundary' : rightValue === leftValue ? 'tie' : 'larger' };
    emit(10, goRight ? 'True → right' : 'False → left');
    if (goRight) { locals.right++; moved = locals.right; emit(11, 'right + 1'); }
    else { locals.left--; moved = locals.left; emit(13, 'left − 1'); }
    locals.minimum = Math.min(locals.minimum, nums[locals.left], nums[locals.right]); emit(14, 'minimum');
    locals.width = locals.right - locals.left + 1; emit(15, 'width');
    locals.score = locals.minimum * locals.width; emit(16, 'score');
    if (locals.score > locals.answer) best = { left: locals.left, right: locals.right, minimum: locals.minimum, score: locals.score };
    locals.answer = Math.max(locals.answer, locals.score);
    history.push({ left: locals.left, right: locals.right, minimum: locals.minimum, score: locals.score });
    if (!detailed && history.length > 6) history.shift();
    emit(17, 'answer');
  }
  emit(18, 'return');
  const result = run.finish(locals.answer, picture, nums);
  // This view has its own renderer; preserve the shared line/locals contract.
  for (const step of result.steps) { step.good1793View = step.pictureView; delete step.pictureView; }
  return result;
}
module.exports = { 1793: { ...base, code, builder, debugMode: 'line-by-line',
  statement: bi('Chọn một đoạn liên tiếp chứa k. Điểm = số nhỏ nhất × độ dài.', 'Choose a contiguous range containing k. Score = minimum × length.'),
  codeLabel: bi('Hai con trỏ · mở về phía số lớn hơn', 'Two pointers · expand toward the larger neighbor'),
  approach: [bi('Bắt đầu tại k. Mỗi lượt mở về phía số kề lớn hơn; bằng nhau chọn trái.', 'Start at k. Expand toward the larger adjacent value; choose left on ties.'),
    bi('Cập nhật min → độ dài → điểm → đáp án. Mọi đoạn xét đều chứa k.', 'Update minimum → length → score → answer. Every candidate contains k.')],
  complexity: { time: 'O(n)', space: 'O(1)', note: bi('Mỗi lượt thêm 1 số. Debug từng dòng với ≤30 số; mảng lớn vẫn tính đủ, hình xem trước 12 số quanh đoạn tốt nhất. Bộ nhớ không tính bản ghi minh họa.', 'Add one element per round. Line debug for ≤30 numbers; larger arrays are fully solved with a 12-value preview near the best range. Space excludes visualization records.') },
  liveArgs: (input, params) => { const { nums, k } = parse(input, params); return [nums, k]; },
} };
