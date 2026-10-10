"use strict";

const { bi, parseInteger, parseIntegerArray, parsePlainParams } = require("./hard-viz-shared");

const MAX_TRACE_STEPS = 600;
const MAX_WITNESS_WORK = 60000;
const SOURCE = Object.freeze([
  "class Solution:",
  "    def lengthOfLongestSubsequence(self, nums, target):",
  "        dp = [-1] * (target + 1)",
  "        dp[0] = 0",
  "",
  "        for num in nums:",
  "            for total in range(target, num - 1, -1):",
  "                if dp[total - num] != -1:",
  "                    dp[total] = max(dp[total], dp[total - num] + 1)",
  "",
  "        return dp[target]",
]);

function parseInput(input, params = {}) {
  const nums = parseIntegerArray(input, {
    problemId: 2915,
    name: "nums",
    minLength: 1,
    maxLength: 1000,
    minValue: 1,
    maxValue: 1000,
  });
  const parsedParams = parsePlainParams(params, 2915);
  const target = parseInteger(parsedParams.target, {
    problemId: 2915,
    name: "target",
    min: 1,
    max: 1000,
  });
  return { nums, target };
}

function buildSteps(input, params = {}) {
  const { nums, target } = parseInput(input, params);
  const dp = Array(target + 1).fill(-1);
  const trackWitness = nums.length * target <= MAX_WITNESS_WORK;
  const witnesses = trackWitness ? Array(target + 1).fill(null) : null;
  const steps = [];
  const history = [];
  let itemIndex = null;
  let num = null;
  let total = null;
  let rowBefore = null;
  let transition = null;
  let answer = null;
  let traceTruncated = false;
  let improvedThisItem = [];
  let improvedCount = 0;

  function displaySums() {
    if (target <= 30) return Array.from({ length: target + 1 }, (_, sum) => sum);
    const shown = new Set([0, 1, 2, target - 2, target - 1, target]);
    for (const center of [total, transition?.source, transition?.destination]) {
      if (!Number.isInteger(center)) continue;
      for (let offset = -3; offset <= 3; offset++) {
        const sum = center + offset;
        if (sum >= 0 && sum <= target) shown.add(sum);
      }
    }
    return [...shown].sort((left, right) => left - right);
  }

  function previewDp() {
    if (dp.length <= 50) return [...dp];
    return `[${dp.slice(0, 12).join(", ")}, …, ${dp.slice(-4).join(", ")}] (${dp.length} cells)`;
  }

  function emit(line, event, title, note, final = false) {
    if (!final && steps.length >= MAX_TRACE_STEPS) {
      traceTruncated = true;
      return;
    }
    const sums = displaySums();
    steps.push({
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note,
      vars: [
        { name: "num", value: num ?? "—" },
        { name: "total", value: total ?? "—" },
        { name: "dp[target]", value: dp[target] },
        { name: "dp", value: previewDp() },
      ],
      longestSubsequence2915View: {
        problemId: 2915,
        line,
        source: SOURCE[line - 1] || "",
        event,
        nums: [...nums],
        target,
        itemIndex,
        num,
        total,
        sums,
        cropped: sums.length < dp.length,
        before: sums.map((sum) => (rowBefore || dp)[sum]),
        current: sums.map((sum) => dp[sum]),
        transition: transition ? {
          ...transition,
          sourceWitness: [...transition.sourceWitness],
          candidateWitness: [...transition.candidateWitness],
        } : null,
        improvedSums: [...improvedThisItem],
        improvedCount,
        history: history.slice(-7).map((entry) => ({ ...entry, improved: [...entry.improved] })),
        historyOmitted: Math.max(0, history.length - 7),
        bestAtTarget: dp[target],
        answer,
        solutionIndices: answer !== null && witnesses?.[target] ? [...witnesses[target]] : null,
        witnessTracked: trackWitness,
        traceTruncated,
      },
    });
  }

  emit(3, "init-dp", bi(
    "Khởi tạo dp bằng −1",
    "Initialize dp with −1",
  ), bi(
    "dp[s] là độ dài lớn nhất của subsequence có tổng đúng s. −1 nghĩa là chưa thể tạo tổng đó.",
    "dp[s] is the maximum subsequence length with exact sum s. −1 means that sum is unreachable.",
  ));

  dp[0] = 0;
  if (witnesses) witnesses[0] = [];
  emit(4, "seed-zero", bi(
    "dp[0] = 0",
    "dp[0] = 0",
  ), bi(
    "Subsequence rỗng tạo tổng 0 với độ dài 0; đây là trạng thái nguồn duy nhất ban đầu.",
    "The empty subsequence makes sum 0 with length 0; this is the only initial source state.",
  ));

  for (let index = 0; index < nums.length; index++) {
    itemIndex = index;
    num = nums[index];
    total = null;
    transition = null;
    rowBefore = [...dp];
    improvedThisItem = [];
    improvedCount = 0;
    emit(6, "select-item", bi(
      `Xét nums[${index}] = ${num}`,
      `Process nums[${index}] = ${num}`,
    ), bi(
      "Mỗi vị trí là một item 0/1: hoặc bỏ qua, hoặc chọn đúng một lần.",
      "Each occurrence is a 0/1 item: skip it or take it exactly once.",
    ));

    if (num > target) {
      history.push({ index, num, improved: [], improvedCount: 0, bestAtTarget: dp[target] });
      emit(7, "skip-large", bi(
        `${num} > target nên vòng lặp rỗng`,
        `${num} > target, so the loop is empty`,
      ), bi(
        "Vì nums chỉ chứa số dương, item này không thể thuộc subsequence có tổng target.",
        "Because nums contains only positive values, this item cannot belong to a subsequence totaling target.",
      ));
      continue;
    }

    for (let sum = target; sum >= num; sum--) {
      total = sum;
      const source = sum - num;
      const before = dp[sum];
      const sourceLength = dp[source];
      const reachable = sourceLength !== -1;
      const candidate = reachable ? sourceLength + 1 : -1;
      const improved = candidate > before;
      const sourceWitness = witnesses?.[source] || [];
      transition = {
        source,
        destination: sum,
        before,
        sourceLength,
        candidate,
        after: improved ? candidate : before,
        reachable,
        improved,
        sourceWitness: [...sourceWitness],
        candidateWitness: reachable ? [...sourceWitness, index] : [],
      };

      emit(7, "scan-backward", bi(
        `total = ${sum}: đọc nguồn ${source}`,
        `total = ${sum}: read source ${source}`,
      ), bi(
        "Duyệt từ target xuống num để dp[total−num] vẫn thuộc trạng thái trước khi dùng item hiện tại.",
        "Scan from target down to num so dp[total−num] still represents the state before using the current item.",
      ));
      emit(8, reachable ? "source-reachable" : "source-unreachable", bi(
        reachable ? `dp[${source}] = ${sourceLength}: có thể chọn ${num}` : `dp[${source}] = −1: không thể chọn ${num}`,
        reachable ? `dp[${source}] = ${sourceLength}: ${num} can be taken` : `dp[${source}] = −1: ${num} cannot be taken`,
      ), bi(
        reachable
          ? `Có subsequence độ dài ${sourceLength} tạo tổng ${source}; thêm nums[${index}] tạo tổng ${sum}.`
          : `Chưa có subsequence nào tạo tổng ${source}, nên nhánh Take không tồn tại.`,
        reachable
          ? `A length-${sourceLength} subsequence makes ${source}; adding nums[${index}] makes ${sum}.`
          : `No subsequence makes ${source}, so the Take branch does not exist.`,
      ));

      if (!reachable) continue;
      if (improved) {
        dp[sum] = candidate;
        if (witnesses) witnesses[sum] = [...sourceWitness, index];
        improvedCount++;
        if (improvedThisItem.length < 18) improvedThisItem.push(sum);
      }
      emit(9, improved ? "update" : "keep", bi(
        improved
          ? `dp[${sum}] = max(${before}, ${candidate}) → ${candidate}`
          : `dp[${sum}] giữ ${before}`,
        improved
          ? `dp[${sum}] = max(${before}, ${candidate}) → ${candidate}`
          : `Keep dp[${sum}] = ${before}`,
      ), bi(
        improved
          ? "Nhánh Take tạo subsequence dài hơn nên cập nhật ô đích."
          : "Nhánh Skip đã tốt hơn hoặc bằng; giữ lời giải cũ để tối đa hóa độ dài.",
        improved
          ? "The Take branch is longer, so update the destination cell."
          : "The Skip branch is at least as good; keep the existing maximum length.",
      ));
    }
    history.push({
      index,
      num,
      improved: [...improvedThisItem].sort((left, right) => left - right),
      improvedCount,
      bestAtTarget: dp[target],
    });
  }

  answer = dp[target];
  itemIndex = null;
  num = null;
  total = null;
  rowBefore = null;
  transition = null;
  improvedThisItem = [];
  improvedCount = 0;
  emit(11, "return", bi(
    answer === -1 ? "Không có subsequence hợp lệ" : `Độ dài lớn nhất là ${answer}`,
    answer === -1 ? "No valid subsequence exists" : `The maximum length is ${answer}`,
  ), bi(
    answer === -1
      ? `dp[${target}] vẫn bằng −1 sau khi xét mọi item.`
      : `dp[${target}] = ${answer}; không subsequence nào có tổng target dài hơn.`,
    answer === -1
      ? `dp[${target}] remains −1 after every item is processed.`
      : `dp[${target}] = ${answer}; no longer subsequence reaches target.`,
  ), true);

  return { original: [...nums], answer, steps };
}

module.exports = {
  2915: {
    id: 2915,
    difficulty: "medium",
    slug: "length-of-the-longest-subsequence-that-sums-to-target",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "0-1-knapsack", vi: "Balo 0/1", en: "0/1 Knapsack" }],
    title: bi(
      "Độ dài subsequence dài nhất có tổng bằng target",
      "Length of the Longest Subsequence That Sums to Target",
    ),
    titleVi: bi(
      "Tối đa số item nhưng phải đạt đúng tổng",
      "Maximize item count while hitting the exact sum",
    ),
    statement: bi(
      "Cho mảng số nguyên dương nums và target. Trả về độ dài lớn nhất của một subsequence có tổng đúng bằng target; trả về −1 nếu không tồn tại.",
      "Given positive integers nums and target, return the maximum length of a subsequence whose sum is exactly target, or −1 if none exists.",
    ),
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "positive",
    inputLabel: bi(
      "nums (1–1000 số, mỗi số 1–1000)",
      "nums (1–1000 values, each 1–1000)",
    ),
    extraParams: [{
      key: "target",
      label: bi("target (1–1000)", "target (1–1000)"),
      default: 9,
      min: 1,
      max: 1000,
    }],
    debugMode: "line-by-line",
    approach: [
      bi(
        "Định nghĩa dp[s] là độ dài lớn nhất của subsequence tạo đúng tổng s; −1 là không thể đạt, dp[0] = 0.",
        "Let dp[s] be the maximum subsequence length with exact sum s; −1 is unreachable and dp[0] = 0.",
      ),
      bi(
        "Với mỗi num, lựa chọn Skip giữ dp[total]; Take dùng dp[total−num] + 1 nếu trạng thái nguồn tồn tại.",
        "For each num, Skip keeps dp[total]; Take uses dp[total−num] + 1 when the source state is reachable.",
      ),
      bi(
        "Duyệt total giảm dần để một vị trí nums không thể tự cấp dữ liệu cho chính nó trong cùng lượt — invariant quan trọng nhất của 0/1 Knapsack.",
        "Iterate total downward so one nums occurrence cannot feed itself in the same pass—the key 0/1 Knapsack invariant.",
      ),
      bi(
        "Trong phỏng vấn, hãy nói rõ vì sao dùng −1 thay vì 0: tổng chưa đạt được phải khác subsequence rỗng có độ dài 0.",
        "In an interview, explain why −1 is required instead of 0: an unreachable sum must differ from the empty subsequence of length 0.",
      ),
    ],
    complexity: {
      time: "O(n × target)",
      space: "O(target)",
      note: bi(
        "Mã Python dùng một mảng DP. Visualization chỉ lưu witness cho input vừa phải và tự rút gọn trace dài; đáp án vẫn được tính trên toàn bộ input.",
        "The Python solution uses one DP array. The visualization tracks a witness only for moderate inputs and truncates long traces while still computing the complete answer.",
      ),
    },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const parsed = parseInput(input, params);
      return [parsed.nums, parsed.target];
    },
  },
};
