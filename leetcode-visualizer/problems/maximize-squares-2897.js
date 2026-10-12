"use strict";
const { bi, parseIntegerArray, parseInteger, parsePlainParams } = require("./hard-viz-shared");
const MOD = 1_000_000_007n;
const MAX_TRACE = 420;
const CODE = [
  "from typing import List",
  "",
  "class Solution:",
  "    def maxSum(self, nums: List[int], k: int) -> int:",
  "        MOD = 10**9 + 7",
  "        counts = [0] * 30",
  "        for num in nums:",
  "            for bit in range(30):",
  "                counts[bit] += (num >> bit) & 1",
  "        answer = 0",
  "        for _ in range(k):",
  "            current = 0",
  "            for bit in range(30):",
  "                if counts[bit] > 0:",
  "                    current |= 1 << bit",
  "                    counts[bit] -= 1",
  "            answer = (answer + current * current) % MOD",
  "        return answer",
];

function parseInput(input, params) {
  const nums = parseIntegerArray(input, { problemId: 2897, name: "nums", minLength: 1, maxLength: 12, minValue: 1, maxValue: 1_000_000_000 });
  const options = parsePlainParams(params, 2897);
  const k = parseInteger(options.k ?? Math.min(2, nums.length), { problemId: 2897, name: "k", min: 1, max: nums.length });
  return { nums, k };
}

function buildSteps(input, params = {}) {
  const { nums, k } = parseInput(input, params);
  const counts = Array(30).fill(0);
  let initialCounts = Array(30).fill(0);
  const selected = [];
  const steps = [];
  const width = Math.max(...nums.map(num => Math.floor(Math.log2(num)) + 1));
  let current = null;
  let activeSlot = null;
  let activeBit = null;
  let inputIndex = null;
  let answer = 0n;
  let rawSum = 0n;
  let omittedSteps = 0;
  let operation = null;
  for (let i = 0; i < nums.length && !operation; i++) for (let j = i + 1; j < nums.length; j++) {
    const and = nums[i] & nums[j];
    if (and !== nums[i] && and !== nums[j]) { operation = { i, j, before: [nums[i], nums[j]], after: [and, nums[i] | nums[j]] }; break; }
  }
  const emit = (phase, line, final = false) => {
    if (!final && steps.length >= MAX_TRACE - 1) { omittedSteps++; return; }
    const labels = { init: bi("AND / OR giữ nguyên số bit 1", "AND / OR preserve bit counts"), count: bi("Đếm bit 1", "Count set bits"), ready: bi("Kho bit sẵn sàng", "Bit bank ready"), start: bi("Dựng số tiếp theo", "Build the next number"), attach: bi("Gắn một bit 1", "Attach a set bit"), consume: bi("Lấy một bit khỏi kho", "Consume one bit"), square: bi("Cộng bình phương", "Add the square"), done: bi("Tổng bình phương lớn nhất", "Maximum sum of squares") };
    steps.push({
      title: labels[phase], note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [{ name: "num", value: inputIndex === null ? "—" : nums[inputIndex] }, { name: "bit", value: activeBit ?? "—" }, { name: "current", value: current ?? "—" }, { name: "answer", value: Number(answer) }],
      maximizeSquares2897View: {
        phase, nums: [...nums], k, width, counts: [...counts], initialCounts: [...initialCounts],
        selected: selected.map(item => ({ ...item })), current, activeSlot, activeBit, inputIndex,
        answer: Number(answer), rawSum: String(rawSum), omittedSteps, final,
        operation: operation ? { ...operation, before: [...operation.before], after: [...operation.after] } : null,
      },
    });
  };
  emit("init", 6);
  nums.forEach((num, index) => {
    inputIndex = index;
    for (let bit = 0; bit < 30; bit++) counts[bit] += (num >>> bit) & 1;
    // One visual frame per completed input number, not thirty zero-bit checks.
    emit("count", 7);
  });
  initialCounts = [...counts];
  inputIndex = null;
  emit("ready", 10);
  for (let index = 0; index < k; index++) {
    activeSlot = index;
    activeBit = null;
    current = 0;
    emit("start", 12);
    for (let bit = 0; bit < 30; bit++) {
      if (!counts[bit]) continue;
      activeBit = bit;
      current |= 1 << bit;
      emit("attach", 15);
      counts[bit]--;
      emit("consume", 16);
    }
    activeBit = null;
    const square = BigInt(current) * BigInt(current);
    rawSum += square;
    answer = (answer + square) % MOD;
    selected.push({ value: current, square: String(square), sum: Number(answer) });
    emit("square", 17);
  }
  activeSlot = null;
  activeBit = null;
  current = null;
  emit("done", 18, true);
  return { original: [...nums], k, answer: Number(answer), steps };
}

module.exports = {
  2897: {
    id: 2897, difficulty: "hard", slug: "apply-operations-on-array-to-maximize-sum-of-squares",
    category: { key: "bitmask", vi: "Bitmask", en: "Bitmask" },
    tags: [{ key: "greedy", vi: "Tham lam", en: "Greedy" }, { key: "array", vi: "Mảng", en: "Array" }],
    title: bi("Apply Operations on Array to Maximize Sum of Squares", "Apply Operations on Array to Maximize Sum of Squares"),
    titleVi: bi("Gom bit để tối đa tổng bình phương", "Concentrate bits to maximize squared sum"),
    statement: bi("Chọn i ≠ j và đồng thời thay nums[i] bằng AND, nums[j] bằng OR của hai số cũ. Có thể thao tác tùy ý; chọn k phần tử để tổng bình phương lớn nhất, trả kết quả modulo 1e9+7. Mô phỏng 1..12 số, mỗi số thuộc [1,1e9], 1 ≤ k ≤ n.", "Choose i ≠ j and simultaneously replace nums[i] with the AND and nums[j] with the OR of their old values. Perform any number of operations, then maximize the squared sum of k chosen elements, modulo 1e9+7. Visualization: 1..12 numbers in [1,1e9], 1 ≤ k ≤ n."),
    defaultInput: [2, 6, 5, 8], inputKind: "nonneg", inputLabel: bi("nums (1..12 số, giá trị 1..1e9)", "nums (1..12 numbers, values 1..1e9)"),
    extraParams: [{ key: "k", type: "number", default: 2, min: 1, max: 12, label: bi("k số được chọn", "k chosen numbers") }],
    debugMode: "line-by-line",
    approach: [
      bi("AND/OR giữ nguyên số lượng bit 1 ở từng vị trí. Đếm 30 vị trí bit.", "AND/OR preserve the number of ones at every bit position. Count all 30 positions."),
      bi("Dựng từng số bằng cách lấy một bit ở mỗi vị trí còn bit 1. Gom bit vào các số lớn làm tổng bình phương lớn hơn.", "Build each number by taking one available set bit at every position. Concentrating bits into larger values increases the squared sum."),
      bi("Dựng k số, cộng bình phương và lấy modulo 1e9+7. Bit còn lại thuộc các số không chọn; số dựng có thể bằng 0.", "Build k numbers, sum their squares and reduce modulo 1e9+7. Remaining bits belong to unselected numbers; a built number may be zero."),
    ],
    complexity: { time: "O(30·(n+k))", space: "O(30)", note: bi("Không tính các bản sao và k số lưu riêng để mô phỏng. Code Python dùng số nguyên chính xác.", "Excludes snapshots and the k numbers retained for visualization. Python uses exact integers.") },
    code: CODE, builder: buildSteps, liveArgs: (input, params = {}) => { const { nums, k } = parseInput(input, params); return [nums, k]; },
  },
};
