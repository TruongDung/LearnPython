"use strict";
const base = require('./monotonic-stack')[1762];
const { trace, bi } = require('./picture-trace');
const code = [
  'class Solution:',
  '    def findBuildings(self, heights):',
  '        answer = []',
  '        highest = 0',
  '        for i in range(len(heights) - 1, -1, -1):',
  '            if heights[i] > highest:',
  '                answer.append(i)',
  '            highest = max(highest, heights[i])',
  '        answer.reverse()',
  '        return answer',
];
function parse(input) {
  const heights = Array.isArray(input) ? [...input] : typeof input === 'string' && input.trim()
    ? input.split(',').map(s => s.trim() === '' ? NaN : Number(s)) : [];
  if (heights.length < 1 || heights.length > 100000 || !heights.every(h => Number.isInteger(h) && h >= 1 && h <= 1000000000)) {
    throw new Error('heights: cần 1–100000 số nguyên từ 1 đến 10^9. / Use 1–100000 integers in [1,10^9].');
  }
  return heights;
}
function builder(input) {
  const heights = parse(input), detailed = heights.length <= 30, offset = detailed ? 0 : Math.max(0, heights.length - 12);
  const run = trace(1762, code, detailed), locals = { self: {}, heights };
  const states = detailed ? Array(heights.length).fill('pending') : [], checks = [];
  let highestIndex = null, check = null, update = null;
  const picture = () => ({ heights: heights.slice(offset), total: heights.length, offset,
    i: locals.i ?? null, highest: locals.highest ?? null, highestIndex,
    answer: detailed ? locals.answer : locals.answer.filter(i => i >= offset), answerCount: locals.answer.length,
    states, check, update, checks });
  const emit = (line, event) => run.emit(line, event, locals, picture);
  locals.answer = []; emit(3, 'answer = []');
  locals.highest = 0; emit(4, 'highest = 0');
  for (let i = heights.length - 1; i >= 0; i--) {
    locals.i = i; check = null; update = null;
    if (detailed) states[i] = 'checking';
    emit(5, '← i');
    const visible = heights[i] > locals.highest;
    if (detailed) {
      let blocker = null;
      if (!visible) for (let j = i + 1; j < heights.length; j++) if (heights[j] >= heights[i]) { blocker = j; break; }
      check = { i, height: heights[i], maxBefore: locals.highest, maxIndex: highestIndex, visible, blocker };
      checks.push(check); states[i] = visible ? 'eligible' : 'blocked';
    }
    emit(6, visible ? 'True · thấy biển / ocean view' : 'False · bị chắn / blocked');
    if (visible) { locals.answer.push(i); if (detailed) states[i] = 'visible'; emit(7, 'append(i)'); }
    const before = locals.highest;
    if (heights[i] > locals.highest) highestIndex = i;
    locals.highest = Math.max(locals.highest, heights[i]);
    update = { before, after: locals.highest }; emit(8, 'highest');
  }
  check = null; update = null; emit(5, 'loop-end');
  locals.answer.reverse(); emit(9, 'reverse()');
  emit(10, 'return');
  const result = run.finish([...locals.answer], picture, heights);
  for (const step of result.steps) { step.ocean1762View = step.pictureView; delete step.pictureView; }
  return result;
}
module.exports = { 1762: { ...base, code, builder, debugMode: 'line-by-line',
  inputLabel: bi('heights · chiều cao từ trái sang phải', 'heights · building heights from left to right'),
  statement: bi('Biển ở bên phải. Trả index các tòa cao hơn mọi tòa bên phải; cao bằng nhau vẫn bị chắn.', 'The ocean is on the right. Return indices taller than every building to their right; equal heights still block the view.'),
  codeLabel: bi('Quét phải → trái · Suffix Max', 'Scan right → left · Suffix Max'),
  approach: [bi('highest = tòa cao nhất đã xét ở bên phải. heights[i] > highest → thêm i.', 'highest is the tallest processed building to the right. heights[i] > highest → append i.'),
    bi('Cập nhật highest, đi sang trái. Đảo answer để trả index từ trái sang phải.', 'Update highest, move left. Reverse answer to return indices from left to right.')],
  complexity: { time: 'O(n)', space: 'O(1) + O(k) output', note: bi('Quét mỗi tòa 1 lần; k là số index trả về. Debug từng dòng với ≤30 tòa. Mảng lớn vẫn tính đủ, hình xem 12 tòa cuối; không tính bộ nhớ bản ghi minh họa.', 'Visit each building once; k is the output length. Line debug for ≤30 buildings. Larger inputs are fully solved with a 12-building suffix preview; visualization records are excluded.') },
  liveArgs: input => [parse(input)],
} };
