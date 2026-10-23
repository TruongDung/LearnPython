"use strict";

const bi = (vi, en) => ({ vi, en });

const SOURCE = [
  "class Solution:",
  "    def splitArraySameAverage(self, nums):",
  "        n, total = len(nums), sum(nums)",
  "        sizes = [k for k in range(1, n)",
  "                 if total * k % n == 0]",
  "        if not sizes:",
  "            return False",
  "        dp = [set() for _ in range(max(sizes) + 1)]",
  "        dp[0] = {0}",
  "        for value in nums:",
  "            for count in range(max(sizes), 0, -1):",
  "                dp[count] |= {s + value for s in dp[count - 1]} ",
  "        return any(total*k//n in dp[k] for k in sizes)",
];

function parseInput(input) {
  let nums;
  if (Array.isArray(input)) nums = input;
  else if (typeof input === "string") {
    nums = input.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  } else if (input && typeof input === "object") nums = input.nums;
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12
    || nums.some((value) => !Number.isInteger(value) || value < 1 || value > 1000)) {
    throw new Error("805: Enter 2–12 positive integers, each at most 1000 / Nhập 2–12 số nguyên dương, mỗi số tối đa 1000.");
  }
  return [...nums];
}

function buildSteps(input) {
  const nums = parseInput(input);
  const n = nums.length;
  const total = nums.reduce((sum, value) => sum + value, 0);
  const sizes = [];
  for (let size = 1; size < n; size++) {
    const numerator = total * size;
    if (numerator % n === 0) sizes.push({ size, target: numerator / n });
  }
  const steps = [];
  let itemIndex = -1;
  let currentValue = null;
  let dp = null;
  let before = null;
  let after = null;
  let answer = null;
  let witnessMask = null;

  function sample(set, target) {
    const values = [...set].sort((a, b) => a - b);
    if (values.length <= 100) return values;
    const keep = new Set([values[0], values.at(-1)]);
    for (let offset = -6; offset <= 6; offset++) {
      const value = target + offset;
      if (set.has(value)) keep.add(value);
    }
    for (let i = 0; i < 80; i++) keep.add(values[Math.round(i * (values.length - 1) / 79)]);
    return [...keep].sort((a, b) => a - b);
  }

  function candidateViews(state) {
    return sizes.map(({ size, target }) => {
      const set = state?.[size] || new Map();
      return {
        size,
        target,
        reachable: set.has(target),
        stateCount: set.size,
        sums: sample(set.keys(), target),
      };
    });
  }

  function emit(phase, final = false) {
    steps.push({
      arr: [...nums],
      highlight: itemIndex >= 0 ? [itemIndex] : [],
      mark: witnessMask === null ? [] : nums.map((_, index) => (witnessMask & (1 << index)) ? index : -1).filter((index) => index >= 0),
      codeLines: [phase === "start" ? 3 : phase === "sizes" ? 4 : phase === "no-size" ? 7 : phase === "seed" ? 9 : phase === "item" ? 10 : 13],
      title: bi(
        phase === "start" ? "Tính tổng và trung bình" : phase === "sizes" ? "Chỉ thử kích thước hợp lệ" : phase === "no-size" ? "Không thể chia đều" : phase === "item" ? `Thêm ${currentValue} vào tập con` : answer ? "Tìm thấy hai tập cùng trung bình" : "Không có tập con phù hợp",
        phase === "start" ? "Find the total and average" : phase === "sizes" ? "Keep only valid subset sizes" : phase === "no-size" ? "No valid subset size" : phase === "item" ? `Add ${currentValue} to subsets` : answer ? "Two subsets share an average" : "No matching subset",
      ),
      note: bi("", ""),
      final,
      vars: [
        { name: "n", value: n },
        { name: "total", value: total },
        { name: "sizes", value: sizes.map((item) => item.size).join(", ") || "∅" },
        { name: "value", value: currentValue ?? "—" },
        { name: "answer", value: answer === null ? "—" : answer },
      ],
      sameAverage805View: {
        phase, nums: [...nums], n, total, averageNumerator: total, averageDenominator: n,
        candidates: sizes.map((item) => ({ ...item })),
        itemIndex, currentValue, before: candidateViews(before), after: candidateViews(after || dp),
        processedCount: itemIndex + 1,
        answer, witnessMask,
      },
    });
  }

  emit("start");
  if (!sizes.length) {
    answer = false;
    emit("no-size", true);
    return { original: nums, answer, steps };
  }
  emit("sizes");

  const maxSize = sizes.at(-1).size;
  dp = Array.from({ length: maxSize + 1 }, () => new Map());
  dp[0].set(0, 0);
  before = null;
  after = dp;
  emit("seed");

  for (itemIndex = 0; itemIndex < n; itemIndex++) {
    currentValue = nums[itemIndex];
    before = dp;
    dp = dp.map((map) => new Map(map));
    for (let count = maxSize; count >= 1; count--) {
      for (const [partial, mask] of before[count - 1]) {
        const sum = partial + currentValue;
        if (!dp[count].has(sum)) dp[count].set(sum, mask | (1 << itemIndex));
      }
    }
    after = dp;
    emit("item");
  }

  for (const { size, target } of sizes) {
    if (dp[size].has(target)) {
      answer = true;
      witnessMask = dp[size].get(target);
      break;
    }
  }
  itemIndex = n - 1;
  currentValue = null;
  before = dp;
  after = dp;
  emit("done", true);
  return { original: nums, answer, steps };
}

module.exports = {
  805: {
    id: 805,
    slug: "split-array-with-same-average",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "subset-sum", vi: "Subset sum", en: "Subset sum" },
    ],
    title: bi("Split Array With Same Average", "Split Array With Same Average"),
    titleVi: bi("Chia mảng thành hai tập cùng trung bình", "Split into two subsets with the same average"),
    statement: bi("Chia mảng thành hai tập không rỗng sao cho trung bình của chúng bằng nhau.", "Split the array into two non-empty subsets with the same average."),
    defaultInput: "1,2,3,4,5,6,7,8",
    inputKind: "string",
    inputLabel: bi("nums · ngăn cách bằng dấu phẩy", "nums · comma-separated"),
    debugMode: "line-by-line",
    approach: [
      bi("Nếu chọn k số, tổng của chúng phải là total × k ÷ n.", "For k chosen numbers, their sum must be total × k ÷ n."),
      bi("DP lưu các tổng có thể tạo cho từng số lượng phần tử.", "DP stores reachable sums for each subset size."),
      bi("Duyệt ngược kích thước để không dùng lại cùng một số.", "Scan sizes backward so an element cannot be reused."),
    ],
    complexity: { time: "O(n² · S)", space: "O(n · S)", note: bi("Số tổng khả thi được lưu theo kích thước tập con.", "Reachable sums are stored by subset size.") },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input) => [parseInput(input)],
  },
};
