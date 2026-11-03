"use strict";

const bi = (vi, en) => ({ vi, en });
const MAX_VISUAL_LENGTH = 18;
const MAX_VALUE = 1_000_000_000;

const CODE = [
  "class Solution:",
  "    def minimumDifference(self, nums, k):",
  "        best = float('inf')",
  "        suffix_ors = []",
  "        for right, value in enumerate(nums):",
  "            current = [(value, right)]",
  "            for previous_or, left in suffix_ors:",
  "                merged = previous_or | value",
  "                if merged != current[-1][0]:",
  "                    current.append((merged, left))",
  "            suffix_ors = current",
  "            for subarray_or, _ in suffix_ors:",
  "                best = min(best, abs(subarray_or - k))",
  "        return best",
];

function parseInput(input, params = {}) {
  const nums = Array.isArray(input)
    ? input.map(Number)
    : typeof input === "string" && input.trim()
      ? input.split(/[,\s]+/).map(Number)
      : [];
  const k = Number(params.k);
  if (
    nums.length === 0
    || nums.length > MAX_VISUAL_LENGTH
    || nums.some((value) => !Number.isInteger(value) || value < 0 || value > MAX_VALUE)
    || !Number.isInteger(k)
    || k < 0
    || k > MAX_VALUE
  ) {
    throw new RangeError(`3171: nums must contain 1-${MAX_VISUAL_LENGTH} integers in [0, ${MAX_VALUE}] and k must be in the same range.`);
  }
  return { nums, k };
}

function buildSteps(input, params = {}) {
  const { nums, k } = parseInput(input, params);
  let suffixOrs = [];
  let best = Infinity;
  let bestWindow = null;
  const steps = [];

  for (let right = 0; right < nums.length; right++) {
    const value = nums[right];
    const current = [{ value, left: right }];
    for (const previous of suffixOrs) {
      const merged = previous.value | value;
      if (merged !== current[current.length - 1].value) {
        current.push({ value: merged, left: previous.left });
      }
    }
    suffixOrs = current;

    const candidates = current.map(({ value: orValue, left }) => {
      const difference = Math.abs(orValue - k);
      if (difference < best) {
        best = difference;
        bestWindow = { left, right, value: orValue };
      }
      return {
        left,
        right,
        value: orValue,
        difference,
        isRoundBest: false,
      };
    });
    const roundBest = candidates.reduce((bestIndex, candidate, index) =>
      candidate.difference < candidates[bestIndex].difference ? index : bestIndex, 0);
    candidates[roundBest].isRoundBest = true;

    const isFinal = right === nums.length - 1;
    steps.push({
      arr: [...nums],
      sub: nums.map((_, index) => `nums[${index}]`),
      highlight: [right],
      mark: candidates.map((candidate) => candidate.left),
      codeLines: [5, 6, 7, 8, 9, 10, 11, 12, 13],
      final: isFinal,
      title: bi("Gom các OR kết thúc tại vị trí này", "Group OR values ending here"),
      note: bi("", ""),
      vars: [
        { name: "right", value: right },
        { name: "value", value },
        { name: "suffix_ors", value: candidates.map(({ value: orValue }) => orValue).join(", ") },
        { name: "best", value: best },
      ],
      subarrayOr3171View: {
        nums: [...nums],
        k,
        right,
        value,
        candidates,
        best,
        bestWindow: { ...bestWindow },
        final: isFinal,
      },
    });
  }
  return { original: [nums, k], nums, k, answer: best, steps };
}

module.exports = {
  3171: {
    id: 3171,
    difficulty: "hard",
    slug: "find-subarray-with-bitwise-or-closest-to-k",
    category: { key: "array", vi: "Mảng", en: "Array" },
    tags: [{ key: "bitmask", vi: "Bitmask", en: "Bitmask" }],
    title: bi("Find Subarray With Bitwise OR Closest to K", "Find Subarray With Bitwise OR Closest to K"),
    titleVi: bi("Tìm OR của subarray gần K nhất", "Find the subarray OR closest to K"),
    statement: bi(
      "Tìm độ lệch nhỏ nhất giữa k và phép OR bitwise của một subarray không rỗng.",
      "Find the minimum absolute difference between k and the bitwise OR of a non-empty subarray.",
    ),
    defaultInput: [1, 2, 4, 5],
    inputKind: "nonneg",
    inputLabel: bi("nums · tối đa 18 số", "nums · up to 18 values"),
    extraParams: [{ key: "k", type: "number", label: bi("k", "k"), default: 6, min: 0, max: MAX_VALUE }],
    approach: [
      bi("Quét điểm kết thúc từ trái sang phải.", "Scan the right endpoint from left to right."),
      bi("Giữ OR của các suffix khác nhau; OR chỉ có thể thêm bit, nên số trạng thái rất ít.", "Keep distinct suffix ORs; OR only adds bits, so there are few states."),
      bi("So mỗi OR với k và giữ khoảng cách nhỏ nhất.", "Compare each OR with k and keep the smallest difference."),
    ],
    complexity: {
      time: "O(n log M)",
      space: "O(log M)",
      note: bi("Hình giới hạn nums ở 18 phần tử để các cửa sổ con dễ quan sát.", "Visualization limits nums to 18 values so each subarray remains easy to see."),
    },
    code: CODE,
    liveArgs: (input, params = {}) => {
      const { nums: parsedNums, k: target } = parseInput(input, params);
      return [parsedNums, target];
    },
    builder: buildSteps,
  },
};
