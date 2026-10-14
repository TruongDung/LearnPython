"use strict";
const { bi, parseInteger, parseIntegerArray, parsePlainParams } = require("./hard-viz-shared");
const MOD = 1000000007;
const CODE = [
  "class Solution:",
  "    def countPartitions(self, nums, k):",
  "        MOD = 10**9 + 7",
  "        if sum(nums) < 2 * k:",
  "            return 0",
  "        total = pow(2, len(nums), MOD)",
  "        dp = [0] * k",
  "        dp[0] = 1",
  "        for x in nums:",
  "            for s in range(k - 1, x - 1, -1):",
  "                dp[s] = (dp[s] + dp[s - x]) % MOD",
  "        bad = sum(dp) % MOD",
  "        return (total - 2 * bad) % MOD",
];
function parseInput(input, params = {}) {
  const nums = parseIntegerArray(input, { problemId: 2518, name: "nums", maxLength: 1000, minValue: 1, maxValue: 1000000000 });
  const p = parsePlainParams(params, 2518);
  const k = parseInteger(p.k, { problemId: 2518, name: "k", min: 1, max: 1000 });
  return { nums, k };
}
function examples(nums, k) {
  if (nums.length > 12) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  const buckets = { good: [], badA: [], badB: [], both: [] };
  for (let mask = 0; mask < 2 ** nums.length; mask++) {
    const a = nums.flatMap((_, i) => mask & (1 << i) ? [i] : []);
    const sumA = a.reduce((sum, i) => sum + nums[i], 0);
    const key = sumA < k ? (total - sumA < k ? "both" : "badA") : (total - sumA < k ? "badB" : "good");
    if (buckets[key].length < 6) buckets[key].push({ a, sumA, sumB: total - sumA });
  }
  return buckets;
}
function buildSteps(input, params) {
  const { nums, k } = parseInput(input, params);
  const sum = nums.reduce((a, b) => a + b, 0);
  const dp = Array(k).fill(0);
  const witnesses = nums.length <= 12 ? Array.from({ length: k }, () => []) : null;
  const steps = [];
  let index = -1, s = null, transition = null, total = null, bad = null, answer = null, truncated = false;
  const samples = examples(nums, k);
  function emit(line, phase, final = false) {
    if (!final && steps.length >= 500) { truncated = true; return; }
    const selected = new Set(k <= 24 ? Array.from({ length: k }, (_, i) => i) : [0, 1, 2, k - 3, k - 2, k - 1]);
    for (const center of [s, transition?.source]) if (Number.isInteger(center)) for (let d = -2; d <= 2; d++) if (center + d >= 0 && center + d < k) selected.add(center + d);
    const cells = [...selected].sort((a, b) => a - b).map(sum => ({ sum, count: dp[sum], examples: witnesses ? witnesses[sum].map(indices => [...indices]) : [] }));
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final,
      title: bi("Hai nhóm đều ≥ k", "Both groups ≥ k"), note: bi("", ""),
      vars: [{ name: "x", value: index < 0 ? "—" : nums[index] }, { name: "s", value: s ?? "—" }, { name: "bad", value: bad ?? "—" }],
      greatPartitions2518View: { nums: [...nums], k, sum, index, phase, cells, cropped: cells.length < k,
        transition: transition ? { ...transition, indices: [...transition.indices] } : null,
        total, bad, answer, truncated, modulo: MOD, samples: final ? samples : null },
    });
  }
  emit(4, "guard");
  if (sum < 2 * k) { answer = 0; emit(5, "impossible", true); return { original: nums, answer, steps }; }
  total = 1;
  for (const _ of nums) total = total * 2 % MOD;
  emit(6, "choices");
  emit(7, "init");
  dp[0] = 1;
  if (witnesses) witnesses[0] = [[]];
  emit(8, "seed");
  for (index = 0; index < nums.length; index++) {
    s = null; transition = null;
    emit(9, "item");
    const x = nums[index];
    if (x >= k) emit(10, "skip");
    for (s = k - 1; s >= x; s--) {
      if (steps.length < 500) transition = { source: s - x, destination: s, before: dp[s], added: dp[s - x], after: null, indices: witnesses?.[s - x]?.[0] ? [...witnesses[s - x][0], index] : [] };
      emit(10, "read");
      dp[s] = (dp[s] + dp[s - x]) % MOD;
      if (witnesses) witnesses[s] = [...witnesses[s], ...witnesses[s - x].map(indices => [...indices, index])].slice(0, 3);
      if (transition) transition.after = dp[s];
      emit(11, "write");
    }
  }
  index = -1; s = null; transition = null;
  bad = dp.reduce((a, b) => (a + b) % MOD, 0);
  emit(12, "bad");
  answer = ((total - 2 * bad) % MOD + MOD) % MOD;
  emit(13, "result", true);
  return { original: nums, answer, steps };
}
module.exports = { 2518: {
  id: 2518, difficulty: "hard", slug: "number-of-great-partitions",
  category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  tags: [{ key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" }],
  title: bi("Số cách chia hai nhóm hợp lệ", "Number of Great Partitions"),
  titleVi: bi("Chia vào A hoặc B → loại nhóm thiếu tổng", "Choose A or B → remove groups below k"),
  statement: bi("Chia nums vào hai nhóm A, B có thứ tự. Mỗi phần tử thuộc đúng một nhóm; tổng mỗi nhóm phải ≥ k. Đếm số cách, modulo 10⁹+7.", "Split nums into ordered groups A and B. Each index belongs to exactly one group, and each group sums to at least k. Count partitions modulo 10⁹+7."),
  defaultInput: [1, 2, 3, 4], inputKind: "positive",
  inputLabel: bi("nums (1–1000 số dương)", "nums (1–1000 positive integers)"),
  extraParams: [{ key: "k", label: bi("k · tổng tối thiểu mỗi nhóm", "k · minimum sum per group"), default: 4, min: 1, max: 1000 }],
  debugMode: "line-by-line",
  approach: [bi("Tổng < 2k → 0 cách.", "Total sum < 2k → 0 partitions."), bi("dp[s] đếm nhóm có tổng s < k. Duyệt s giảm để mỗi số chỉ dùng một lần.", "dp[s] counts groups totaling s < k. Scan downward to use each index once."), bi("Đáp án = 2ⁿ − bad(A) − bad(B). A và B có thứ tự.", "Answer = 2ⁿ − bad(A) − bad(B). A and B are ordered.")],
  complexity: { time: "O(n × k)", space: "O(k)", note: bi("Input lớn: rút gọn các bước và ô DP; vẫn tính đáp án đầy đủ. Hình cách chia là ví dụ, số đếm lấy modulo 10⁹+7.", "Large inputs: trace and DP display are shortened; the full answer is still computed. Partition pictures are examples; counts are modulo 10⁹+7.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => { const p = parseInput(input, params); return [p.nums, p.k]; },
} };
