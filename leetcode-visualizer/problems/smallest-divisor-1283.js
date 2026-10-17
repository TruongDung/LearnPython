"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = Object.freeze([
  "class Solution:",
  "    def smallestDivisor(self, nums: list[int], threshold: int) -> int:",
  "        left, right = 1, max(nums)",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "            total = 0",
  "",
  "            for num in nums:",
  "                total += (num + mid - 1) // mid",
  "",
  "            if total <= threshold:",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "",
  "        return left",
]);

const MAX_LENGTH = 60;
const MAX_VALUE = 1000000;
const MAX_THRESHOLD = 1000000;

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_LENGTH) {
    throw new RangeError(`1283: nums must contain 1..${MAX_LENGTH} values / nums cần 1..${MAX_LENGTH} số.`);
  }
  if (input.some((value) => !Number.isInteger(value) || value < 1 || value > MAX_VALUE)) {
    throw new RangeError(`1283: nums values must be integers in [1, ${MAX_VALUE}] / mỗi phần tử nums phải là số nguyên dương hợp lệ.`);
  }
  const rawThreshold = params.threshold === undefined ? Math.max(6, input.length) : params.threshold;
  if (typeof rawThreshold !== "number" && (typeof rawThreshold !== "string" || !/^\d+$/.test(rawThreshold.trim()))) {
    throw new TypeError("1283: threshold must be an integer / threshold phải là số nguyên.");
  }
  const threshold = Number(rawThreshold);
  if (!Number.isInteger(threshold) || threshold < input.length || threshold > MAX_THRESHOLD) {
    throw new RangeError(`1283: threshold must be in [nums.length, ${MAX_THRESHOLD}] / threshold phải từ nums.length đến ${MAX_THRESHOLD}.`);
  }
  return { nums: [...input], threshold };
}

function ceilingSum(nums, divisor) {
  return nums.reduce((total, num) => total + Math.floor((num + divisor - 1) / divisor), 0);
}

function buildSteps(input, params = {}) {
  const { nums, threshold } = parseInput(input, params);
  const initialRight = Math.max(...nums);
  const steps = [];
  const tested = [];
  let left = 1;
  let right = initialRight;
  let mid = null;
  let total = null;
  let currentIndex = null;
  let currentQuotient = null;
  let quotients = [];
  let decision = "idle";

  function emit(line, phase, action, extra = {}) {
    const view = {
      problemId: 1283,
      phase,
      action,
      source: { line, text: CODE[line - 1] },
      input: { nums: [...nums], threshold },
      search: { initialLeft: 1, initialRight, left, right, mid, decision },
      scan: {
        currentIndex,
        currentQuotient,
        total,
        quotients: [...quotients],
      },
      tested: tested.map((attempt) => ({ ...attempt })),
      final: false,
      answer: null,
      ...extra,
    };
    steps.push({
      arr: [...nums],
      highlight: currentIndex === null ? [] : [currentIndex],
      mark: [],
      codeLines: [line],
      final: Boolean(extra.final),
      title: bi("Ước số nhỏ nhất", "Smallest Divisor"),
      note: bi("", ""),
      vars: [
        { name: "left", value: left },
        { name: "right", value: right },
        ...(mid === null ? [] : [{ name: "mid", value: mid }]),
        ...(total === null ? [] : [{ name: "total", value: total }]),
      ],
      smallestDivisor1283View: view,
    });
  }

  emit(3, "range", "set-range");
  while (left < right) {
    decision = "idle";
    currentIndex = null;
    currentQuotient = null;
    emit(5, "range", "range-open");
    mid = Math.floor((left + right) / 2);
    emit(6, "try", "choose-mid");
    total = 0;
    quotients = [];
    emit(7, "divide", "reset-total");

    for (let index = 0; index < nums.length; index += 1) {
      currentIndex = index;
      currentQuotient = Math.floor((nums[index] + mid - 1) / mid);
      emit(9, "divide", "pick-number");
      total += currentQuotient;
      quotients.push(currentQuotient);
      emit(10, "divide", "add-ceiling");
    }

    currentIndex = null;
    currentQuotient = null;
    decision = total <= threshold ? "feasible" : "too-small";
    emit(12, "decide", decision);
    tested.push({ divisor: mid, total, feasible: decision === "feasible" });
    if (decision === "feasible") {
      right = mid;
      emit(13, "range", "keep-left");
    } else {
      left = mid + 1;
      emit(15, "range", "discard-left");
    }
  }

  const answer = left;
  mid = answer;
  quotients = nums.map((num) => Math.floor((num + answer - 1) / answer));
  total = quotients.reduce((sum, value) => sum + value, 0);
  currentIndex = null;
  currentQuotient = null;
  decision = "done";
  emit(17, "done", "answer", {
    final: true,
    answer,
    previousTotal: answer > 1 ? ceilingSum(nums, answer - 1) : null,
  });
  return { original: nums, answer, steps };
}

module.exports = {
  1283: {
    id: 1283,
    difficulty: "medium",
    slug: "find-the-smallest-divisor-given-a-threshold",
    category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
    tags: [
      { key: "binary-search", vi: "Binary Search", en: "Binary Search" },
      { key: "binary-search-on-answer", vi: "Binary Search đáp án", en: "Binary Search on Answer" },
      { key: "array", vi: "Mảng", en: "Array" },
    ],
    title: bi("Find the Smallest Divisor Given a Threshold", "Find the Smallest Divisor Given a Threshold"),
    titleVi: bi("Tìm ước số nhỏ nhất theo ngưỡng", "Find the smallest divisor under a threshold"),
    statement: bi(
      "Chia từng số trong nums cho cùng một ước số dương, làm tròn lên rồi cộng lại. Tìm ước số nhỏ nhất để tổng không vượt threshold.",
      "Divide every value in nums by one positive divisor, round each result up, and add them. Find the smallest divisor whose sum does not exceed threshold.",
    ),
    defaultInput: [1, 2, 5, 9],
    inputKind: "positive",
    inputLabel: bi("nums · số nguyên dương", "nums · positive integers"),
    extraParams: [
      { key: "threshold", type: "number", min: 1, max: MAX_THRESHOLD, default: 6, label: bi("threshold · tổng tối đa", "threshold · maximum sum") },
    ],
    approach: [
      bi("Ước số tăng thì tổng làm tròn chỉ giảm: đây là điều kiện đơn điệu.", "As the divisor grows, the rounded sum only decreases: the predicate is monotonic."),
      bi("Thử mid và cộng ceil(num / mid) bằng (num + mid - 1) // mid.", "Try mid and sum ceil(num / mid) using (num + mid - 1) // mid."),
      bi("Tổng ≤ threshold: giữ mid. Tổng lớn hơn: bỏ mid và nửa trái.", "Sum ≤ threshold: keep mid. Larger sum: discard mid and everything to its left."),
    ],
    complexity: {
      time: "O(n log M)",
      space: "O(1)",
      note: bi("M = max(nums); mỗi lần thử quét nums một lần.", "M = max(nums); every trial scans nums once."),
    },
    code: CODE,
    debugMode: "line-by-line",
    builder: buildSteps,
    parseInput,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.nums, parsed.threshold];
    },
  },
};
