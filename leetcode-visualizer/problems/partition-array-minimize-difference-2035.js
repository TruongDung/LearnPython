"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def minimumDifference(self, nums):",
  "        n = len(nums) // 2",
  "        left = subset_sums(nums[:n])",
  "        right = subset_sums(nums[n:])",
  "        for count, sums in right.items():",
  "            sums.sort()",
  "        best = float('inf')",
  "        for count, sums in left.items():",
  "            other = right[n - count]",
  "            for total in sums:",
  "                i = lower_bound(other, sum(nums)/2-total)",
  "                check(i - 1, i)",
  "        return best",
];

function parse(nums) {
  if (typeof nums === "string") nums = nums.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (nums && !Array.isArray(nums) && typeof nums === "object") nums = nums.nums;
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12 || nums.length % 2
    || nums.some((x) => !Number.isInteger(x) || Math.abs(x) > 10000000)) {
    throw new RangeError("2035: Visualization accepts 2–12 integers, in an even-length array / Minh họa nhận mảng chẵn gồm 2–12 số nguyên.");
  }
  return [...nums];
}

function enumerate(values, offset) {
  const groups = Array.from({ length: values.length + 1 }, () => []);
  for (let mask = 0; mask < 2 ** values.length; mask++) {
    let sum = 0; const indices = []; let count = 0;
    for (let bit = 0; bit < values.length; bit++) if (mask & (1 << bit)) {
      sum += values[bit]; count++; indices.push(offset + bit);
    }
    groups[count].push({ sum, mask, indices });
  }
  return groups;
}

function buildSteps(input) {
  const nums = parse(input); const n = nums.length / 2; const total = nums.reduce((a, b) => a + b, 0);
  const left = enumerate(nums.slice(0, n), 0); const right = enumerate(nums.slice(n), n);
  const steps = []; let best = Infinity; let bestPair = null; let activeLeft = null; let activeRight = null;
  let activeCount = null; let middle = null; let phase = "split";
  const emit = (line, final = false) => steps.push({
    title: bi(phase === "split" ? "Chia đôi" : phase === "left" ? "Tổng nửa trái" : phase === "right" ? "Tổng nửa phải" : phase === "sort" ? "Xếp tổng" : phase === "pair" ? `Ghép nhóm ${activeCount}` : phase === "search" ? "Tìm điểm giữa" : phase === "check" ? "So độ lệch" : `Độ lệch nhỏ nhất: ${best}`,
      phase === "split" ? "Split" : phase === "left" ? "Left sums" : phase === "right" ? "Right sums" : phase === "sort" ? "Sort sums" : phase === "pair" ? `Pair group ${activeCount}` : phase === "search" ? "Find midpoint" : phase === "check" ? "Compare gaps" : `Smallest gap: ${best}`),
    note: bi("", ""), arr: [...nums], highlight: [...(activeLeft?.indices || []), ...(activeRight?.indices || [])], mark: bestPair?.indices || [],
    codeLines: [({ split: 3, left: 4, right: 5, count: 6, sort: 7, init: 8, pair: 9, bucket: 10, total: 11, search: 12, check: 13, done: 14 })[phase]], final,
    vars: [{ name: "total", value: total }, { name: "pick", value: n }, { name: "left", value: activeLeft?.sum ?? "—" }, { name: "right", value: activeRight?.sum ?? "—" }, { name: "best", value: Number.isFinite(best) ? best : "—" }],
    partition2035View: { phase, nums: [...nums], n, total, left: left.map((g) => g.map((x) => ({ ...x, indices: [...x.indices] }))), right: right.map((g) => g.map((x) => ({ ...x, indices: [...x.indices] }))), activeCount, activeLeft: activeLeft && { ...activeLeft }, activeRight: activeRight && { ...activeRight }, middle, best: Number.isFinite(best) ? best : null, bestPair: bestPair && { ...bestPair }, answer: Number.isFinite(best) ? best : null },
  });
  emit(3); phase = "left";
  for (const group of left) for (const item of group) { activeLeft = item; emit(4); }
  phase = "right"; activeLeft = null;
  for (const group of right) for (const item of group) { activeRight = item; emit(5); }
  for (let size = 0; size <= n; size++) { phase = "count"; activeCount = size; emit(6); }
  phase = "sort"; activeRight = null; right.forEach((group) => group.sort((a, b) => a.sum - b.sum)); emit(7);
  phase = "init"; best = Infinity; emit(8);
  outer: for (let count = 0; count <= n; count++) {
    phase = "pair"; activeCount = count;
    for (const a of left[count]) {
      activeLeft = a; activeRight = null; emit(9);
      const candidates = right[n - count]; phase = "bucket"; emit(10);
      const wanted = (total - 2 * a.sum) / 2;
      phase = "total"; emit(11);
      let low = 0; let high = candidates.length;
      while (low < high) {
        middle = (low + high) >> 1; activeRight = candidates[middle]; phase = "search"; emit(12);
        if (candidates[middle].sum < wanted) low = middle + 1; else high = middle;
      }
      for (const index of [low - 1, low]) if (index >= 0 && index < candidates.length) {
        activeRight = candidates[index]; phase = "check"; emit(13);
        const sum = a.sum + activeRight.sum; const gap = Math.abs(total - 2 * sum);
        if (gap < best) { best = gap; bestPair = { left: a.sum, right: activeRight.sum, sum, gap, indices: [...a.indices, ...activeRight.indices] }; }
        emit(13);
      }
      if (best === 0) break outer;
    }
  }
  phase = "done"; emit(14, true);
  return { original: nums, answer: best, steps };
}

module.exports = { 2035: {
  id: 2035, slug: "partition-array-into-two-arrays-to-minimize-sum-difference", difficulty: "hard",
  category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  tags: [{ key: "meet-in-the-middle", vi: "Chia đôi tìm kiếm", en: "Meet in the middle" }],
  title: bi("Partition Array Into Two Arrays to Minimize Sum Difference", "Partition Array Into Two Arrays to Minimize Sum Difference"),
  titleVi: bi("Chia mảng giảm chênh lệch tổng", "Split the array to minimize sum difference"),
  statement: bi("Chia mảng thành hai nhóm bằng số phần tử, sao cho chênh lệch hai tổng nhỏ nhất.", "Split the array into equal-size groups with the smallest possible sum difference."),
  defaultInput: [3, 9, 7, 3], inputKind: "string", inputLabel: bi("nums · cách nhau bằng dấu phẩy", "nums · comma-separated"), debugMode: "line-by-line",
  approach: [bi("Chia số thành hai nửa, liệt kê tổng theo cỡ nhóm.", "Split into halves and list sums by group size."), bi("Ghép đúng n phần tử; tìm hai tổng gần nhau nhất.", "Pair exactly n elements and find the closest sums.")],
  complexity: { time: "O(2^(n/2) · n)", space: "O(2^(n/2))", note: bi("Minh họa giới hạn 12 số để xem rõ từng bước.", "Visualization supports up to 12 values to keep each step clear.") },
  code: CODE, builder: buildSteps, liveArgs: (input) => [parse(input)],
} };
