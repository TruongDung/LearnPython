"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def minAbsDifference(self, nums, goal):",
  "        mid = len(nums) // 2",
  "        left = subset_sums(nums[:mid])",
  "        right = sorted(subset_sums(nums[mid:]))",
  "        best = float('inf')",
  "        for a in left:",
  "            i = bisect_left(right, goal - a)",
  "            for j in (i - 1, i):",
  "                best = min(best, abs(goal - a - right[j]))",
  "        return best",
];

function parseInput(input, params = {}) {
  let nums;
  let goal;
  if (Array.isArray(input)) { nums = input; goal = Number(params.goal ?? 6); }
  else if (typeof input === "string") {
    const [values, target] = input.split(";");
    nums = (values || "").trim().split(/[\s,]+/).filter(Boolean).map(Number);
    goal = target === undefined ? Number(params.goal ?? 6) : Number(target.trim());
  } else if (input && typeof input === "object") {
    nums = input.nums;
    goal = input.goal ?? Number(params.goal ?? 6);
  }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12
    || nums.some((value) => !Number.isInteger(value) || Math.abs(value) > 100)
    || !Number.isInteger(goal) || Math.abs(goal) > 1000) {
    throw new RangeError("1755: Use 1–12 integers from -100 to 100 and a goal from -1000 to 1000 / Nhập 1–12 số nguyên từ -100 đến 100 và goal từ -1000 đến 1000.");
  }
  return { nums: [...nums], goal };
}

function subsetSums(values, offset = 0) {
  const out = [];
  for (let mask = 0; mask < (1 << values.length); mask++) {
    let sum = 0;
    const indices = [];
    for (let bit = 0; bit < values.length; bit++) if (mask & (1 << bit)) {
      sum += values[bit];
      indices.push(offset + bit);
    }
    out.push({ sum, mask, indices });
  }
  return out;
}

function buildSteps(input) {
  const { nums, goal } = parseInput(input);
  const mid = Math.floor(nums.length / 2);
  const leftValues = nums.slice(0, mid);
  const rightValues = nums.slice(mid);
  const left = [];
  const right = [];
  const steps = [];
  let phase = "start";
  let activeSide = null;
  let activeSubset = null;
  let activeLeft = null;
  let activeRight = null;
  let low = null;
  let high = null;
  let middle = null;
  let best = Number.POSITIVE_INFINITY;
  let bestPair = null;

  function emit(line, final = false) {
    const leftSums = left.map((item) => item.sum);
    const rightSums = right.map((item) => item.sum);
    steps.push({
      title: bi(
        phase === "start" ? "Chia đôi" : phase === "left" ? `Nửa trái · ${leftSums.length}` : phase === "right" ? `Nửa phải · ${rightSums.length}` : phase === "sort" ? "Xếp tổng nửa phải" : phase === "pair" ? "Ghép hai nửa" : phase === "probe" ? "Thử vị trí giữa" : phase === "candidate" ? "So tổng gần nhất" : `Sai lệch nhỏ nhất: ${best}`,
        phase === "start" ? "Split" : phase === "left" ? `Left half · ${leftSums.length}` : phase === "right" ? `Right half · ${rightSums.length}` : phase === "sort" ? "Sort right sums" : phase === "pair" ? "Pair the halves" : phase === "probe" ? "Probe the middle" : phase === "candidate" ? "Check nearest sums" : `Smallest gap: ${best}`,
      ),
      note: bi("", ""), arr: [...nums],
      highlight: activeSubset?.indices || [], mark: bestPair?.indices || [],
      codeLines: [line], final,
      vars: [
        { name: "goal", value: goal }, { name: "left", value: leftSums.length },
        { name: "right", value: rightSums.length }, { name: "a", value: activeLeft?.sum ?? "—" },
        { name: "b", value: activeRight?.sum ?? "—" }, { name: "best", value: Number.isFinite(best) ? best : "—" },
      ],
      closestSum1755View: {
        phase, nums: [...nums], goal, mid, leftValues: [...leftValues], rightValues: [...rightValues],
        left: left.map((item) => ({ ...item, indices: [...item.indices] })),
        right: right.map((item) => ({ ...item, indices: [...item.indices] })),
        activeSide, activeSubset: activeSubset ? { ...activeSubset, indices: [...activeSubset.indices] } : null,
        activeLeft: activeLeft ? { ...activeLeft, indices: [...activeLeft.indices] } : null,
        activeRight: activeRight ? { ...activeRight, indices: [...activeRight.indices] } : null,
        low, high, middle, best: Number.isFinite(best) ? best : null,
        bestPair: bestPair ? { ...bestPair, indices: [...bestPair.indices] } : null,
        answer: Number.isFinite(best) ? best : null,
      },
    });
  }

  emit(2);
  phase = "left"; emit(3);
  for (const item of subsetSums(leftValues, 0)) {
    activeSide = "left"; activeSubset = item; left.push(item); emit(4);
  }
  phase = "right"; activeSubset = null; emit(5);
  for (const item of subsetSums(rightValues, mid)) {
    activeSide = "right"; activeSubset = item; right.push(item); emit(5);
  }
  phase = "sort"; activeSubset = null; right.sort((a, b) => a.sum - b.sum); emit(5);

  emit(6);
  phase = "pair";
  for (const a of left) {
    activeLeft = a;
    emit(7);
    const wanted = goal - a.sum;
    low = 0; high = right.length;
    activeRight = null; middle = null; emit(8);
    while (low < high) {
      middle = Math.floor((low + high) / 2);
      activeRight = right[middle];
      phase = "probe"; emit(8);
      if (activeRight.sum < wanted) low = middle + 1;
      else high = middle;
      phase = "pair"; emit(8);
    }
    for (const index of [low - 1, low]) if (index >= 0 && index < right.length) {
      const b = right[index];
      phase = "candidate"; activeRight = b; emit(9);
      const gap = Math.abs(goal - a.sum - b.sum);
      activeRight = b;
      phase = "candidate";
      if (gap < best) {
        best = gap;
        bestPair = { left: a.sum, right: b.sum, total: a.sum + b.sum, gap, indices: [...a.indices, ...b.indices] };
      }
      emit(10);
    }
    if (best === 0) break;
  }
  phase = "done"; activeSide = null; activeSubset = null; emit(11, true);
  return { original: nums, answer: best, steps };
}

module.exports = {
  1755: {
    id: 1755,
    slug: "closest-subsequence-sum",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "meet-in-the-middle", vi: "Chia đôi tìm kiếm", en: "Meet in the middle" }],
    title: bi("Closest Subsequence Sum", "Closest Subsequence Sum"),
    titleVi: bi("Tổng tập con gần nhất", "Closest subsequence sum"),
    statement: bi("Chọn vài số sao cho tổng gần goal nhất. Trả về độ lệch nhỏ nhất.", "Pick numbers whose sum is closest to goal. Return the smallest gap."),
    defaultInput: "5,-7,3,5",
    inputKind: "string",
    inputLabel: bi("nums · số cách nhau bằng dấu phẩy", "nums · comma-separated"),
    extraParams: [{ key: "goal", label: bi("goal", "goal"), default: 6 }],
    debugMode: "line-by-line",
    approach: [
      bi("Chia mảng thành hai nửa.", "Split the array in half."),
      bi("Liệt kê tổng mỗi nửa, rồi ghép cặp gần goal nhất.", "List each half's sums, then pair the closest to goal."),
    ],
    complexity: { time: "O(2^(n/2) · n)", space: "O(2^(n/2))", note: bi("Minh họa giới hạn 12 số để xem rõ từng bước.", "Visualization is limited to 12 values so each step stays clear.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input, params) => [parseInput(input, params)],
  },
};
