"use strict";

const { bi, pictureTrace } = require("./picture-study-shared");
const base = require("./two-pointer")[977], code = base.code;
function parse(input) {
  if (!Array.isArray(input) || !input.length || input.length > 40 || !input.every((x, i) => Number.isSafeInteger(x) && Math.abs(x) <= 10000 && (!i || x >= input[i - 1]))) {
    throw new RangeError("#977: nhập 1–40 số đã tăng dần trong [-10000,10000] / enter 1–40 sorted integers in [-10000,10000].");
  }
  return [...input];
}
function builder(input) {
  const nums = parse(input), n = nums.length, t = pictureTrace(977, code, ["left", "right", "pos", "|nums[left]|", "|nums[right]|", "result[pos]"]);
  let result = [], written = [], used = [], left, right, pos, choice = null;
  const emit = (line, phase, action = null, final = false) => t.emit(line, phase,
    { left, right, pos, "|nums[left]|": left !== undefined && left <= right ? Math.abs(nums[left]) : null,
      "|nums[right]|": right !== undefined && left <= right ? Math.abs(nums[right]) : null, "result[pos]": result[pos] },
    { nums, result, written, used, left, right, pos, choice, action }, final);
  emit(3, "n"); result = Array(n).fill(0); written = Array(n).fill(false); emit(4, "result = 0");
  left = 0; right = n - 1; pos = n - 1; emit(5, "left → ← right");
  while (left <= right) {
    choice = null; emit(6, "left ≤ right");
    const fromLeft = Math.abs(nums[left]) > Math.abs(nums[right]); choice = fromLeft ? left : right;
    emit(7, "|L| ? |R|", { kind: "compare", fromLeft, a: Math.abs(nums[left]), b: Math.abs(nums[right]) });
    const value = nums[choice], target = pos; result[target] = value ** 2; written[target] = true; used.push(choice);
    emit(fromLeft ? 8 : 11, "x² → result", { kind: "write", value, square: result[target], from: choice, to: target });
    if (fromLeft) { left++; emit(9, "left →"); } else { right--; emit(12, "← right"); }
    pos--; emit(13, "← pos");
  }
  choice = null; emit(6, "False"); emit(14, "✓", null, true);
  return { original: nums, answer: result, steps: t.steps };
}
module.exports = { 977: { ...base, builder, debugMode: "line-by-line", liveArgs: input => [parse(input)],
  inputLabel: bi("nums đã sắp xếp · tối đa 40 số", "Sorted nums · up to 40 values"),
  approach: [bi("So sánh khoảng cách tới 0 ở hai đầu.", "Compare the distance from zero at both ends."), bi("Bình phương lớn hơn → điền từ cuối result.", "Place the larger square at the end of result.")] } };
