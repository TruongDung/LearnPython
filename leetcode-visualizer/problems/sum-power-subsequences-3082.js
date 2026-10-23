"use strict";

const bi = (vi, en) => ({ vi, en });
const MOD = 1_000_000_007;

const CODE = [
  "class Solution:",
  "    def sumOfPower(self, nums, k):",
  "        MOD = 10**9 + 7",
  "        dp = [0] * (k + 1)",
  "        dp[0] = 1",
  "        for x in nums:",
  "            next_dp = [0] * (k + 1)",
  "            for s in range(k + 1):",
  "                next_dp[s] = (next_dp[s] + 2 * dp[s]) % MOD",
  "                if s + x <= k:",
  "                    next_dp[s + x] = (next_dp[s + x] + dp[s]) % MOD",
  "            dp = next_dp",
  "        return dp[k]",
];

function parseInput(input, params = {}) {
  const nums = Array.isArray(input) ? [...input]
    : typeof input === "string" ? input.trim().split(/[\s,;]+/).filter(Boolean).map(Number) : [];
  const k = Number(params.k ?? 3);
  if (!nums.length || nums.length > 8 || nums.some((x) => !Number.isInteger(x) || x < 1 || x > 20)
    || !Number.isInteger(k) || k < 1 || k > 20) {
    throw new RangeError("3082: Use 1–8 numbers (1–20) and k 1–20 / Nhập 1–8 số (1–20) và k 1–20.");
  }
  return { nums, k };
}

function buildSteps(input, params = {}) {
  const { nums, k } = parseInput(input, params);
  const dp = Array(k + 1).fill(0);
  const steps = [];
  let next = Array(k + 1).fill(0);
  let itemIndex = null;
  let x = null;
  let sum = null;
  let answer = null;

  const title = (event) => ({
    start: bi("Bắt đầu", "Start"), seed: bi("Tổng 0", "Sum 0"), item: bi(`Lấy ${x}`, `Take ${x}`),
    row: bi("Hàng mới", "New row"), scan: bi(`Tổng ${sum}`, `Sum ${sum}`),
    skip: bi("Không chọn x", "Skip x"), check: bi("Nhánh chọn x", "Pick x branch"),
    pick: bi(`Cộng ${x}`, `Add ${x}`), commit: bi("Chốt hàng", "Save row"), done: bi(`Đáp án ${answer}`, `Answer ${answer}`),
  }[event]);

  function emit(line, event, changedSum = null) {
    const before = [...dp];
    const after = event === "commit" || event === "done" ? [...dp] : [...next];
    steps.push({
      title: title(event), note: bi("", ""), arr: [...nums],
      highlight: Number.isInteger(itemIndex) ? [itemIndex] : [],
      mark: [], codeLines: [line], final: event === "done",
      vars: [
        { name: "x", value: x ?? "—" }, { name: "s", value: sum ?? "—" },
        { name: "dp", value: `[${after.join(",")}]` }, { name: "k", value: k },
      ],
      sumPower3082View: {
        event, nums: [...nums], k, itemIndex, x, sum, before, after,
        changedSum, answer, processedCount: event === "done" ? nums.length : itemIndex === null ? 0 : itemIndex + 1,
        sourceCount: Number.isInteger(sum) ? dp[sum] : null,
        sourceDest: Number.isInteger(sum) && Number.isInteger(x) && sum + x <= k ? sum + x : null,
      },
    });
  }

  emit(2, "start");
  dp[0] = 1;
  next = [...dp];
  emit(5, "seed");

  nums.forEach((value, index) => {
    itemIndex = index; x = value; sum = null;
    emit(6, "item");
    next = Array(k + 1).fill(0);
    emit(7, "row");
    for (sum = 0; sum <= k; sum++) {
      emit(8, "scan");
      next[sum] = (next[sum] + 2 * dp[sum]) % MOD;
      emit(9, "skip", sum);
      emit(10, "check", sum);
      if (sum + x <= k) {
        next[sum + x] = (next[sum + x] + dp[sum]) % MOD;
        emit(11, "pick", sum + x);
      }
    }
    for (let s = 0; s <= k; s++) dp[s] = next[s];
    emit(12, "commit");
  });

  answer = dp[k]; itemIndex = null; x = null; sum = null; next = [...dp];
  emit(13, "done", k);
  return { original: [...nums], answer, steps };
}

module.exports = {
  3082: {
    id: 3082,
    slug: "find-the-sum-of-the-power-of-all-subsequences",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "knapsack", vi: "Balo 0/1", en: "0/1 knapsack" },
    ],
    title: bi("Sum of the Power of All Subsequences", "Sum of the Power of All Subsequences"),
    titleVi: bi("Tổng sức mạnh các subsequence", "Sum of subsequence powers"),
    statement: bi("Cộng số subsequence có tổng k trên mọi subsequence ngoài.", "Sum the count of inner subsequences with sum k across every outer subsequence."),
    defaultInput: [1, 2, 3],
    inputKind: "positive",
    inputLabel: bi("nums · các số", "nums · values"),
    extraParams: [{ key: "k", type: "number", label: bi("k · tổng cần tìm", "k · target sum"), min: 1, max: 20, default: 3 }],
    debugMode: "line-by-line",
    approach: [
      bi("x ngoài tổng: 2 lựa chọn ở subsequence ngoài.", "x outside the target sum: 2 outer-subsequence choices."),
      bi("x trong tổng: dịch DP thêm x.", "x in the target sum: shift the DP by x."),
    ],
    complexity: { time: "O(n · k)", space: "O(k)", note: bi("Hình minh họa giới hạn n ≤ 8, k ≤ 20.", "Visualization is limited to n ≤ 8, k ≤ 20.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const { nums: values, k: target } = parseInput(input, params);
      return [values, target];
    },
  },
};
