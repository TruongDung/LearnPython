"use strict";

const { bi } = require("./hard-viz-shared");
const { UNIT_STEP_CODE, UNIT_LENGTH_CODE, parseNums, buildDp, buildIndices } = require("./increasing-subsequence-shared");
const code4 = UNIT_STEP_CODE.map(line => line.replace("lengthOfLIS", "longestSubsequence"));
const code5 = UNIT_LENGTH_CODE.map(line => line.replace("lengthOfLIS", "longestSubsequence"));
const code6 = [
  "class Solution:",
  "    def longestSubsequence(self, nums):",
  "        if not nums:",
  "            return 0",
  "",
  "        dp = {}",
  "        max_len = 1",
  "",
  "        for x in nums:",
  "            dp[x] = max(dp.get(x, 0), dp.get(x - 1, 0) + 1)",
  "            max_len = max(max_len, dp[x])",
  "",
  "        return max_len",
];
const builder4 = input => buildIndices(input, 4, { problemId: 9024, source: code4 });
const builder5 = input => buildDp(input, 5, { problemId: 9024, source: code5 });

function buildHashMap(input) {
  const nums = parseNums(input, 9024);
  const dp = Object.create(null);
  const parents = nums.map(() => -1);
  const bestIndexByValue = Object.create(null);
  const steps = [];
  let maxLen = 1;
  let bestEnd = -1;
  let initialized = false;
  let x = null;
  let index = null;
  let transition = null;

  function emit(line, event, final = false) {
    const labels = {
      validate: bi("Xác nhận nums", "Check nums"),
      initialize: bi("Tạo dp rỗng", "Create empty dp"),
      "max-initialize": bi("Đặt max_len = 1", "Set max_len = 1"),
      visit: bi(`Xét x = ${x}`, `Visit x = ${x}`),
      update: bi(`Cập nhật dp[${x}]`, `Update dp[${x}]`),
      maximum: bi(`Cập nhật max_len = ${maxLen}`, `Update max_len = ${maxLen}`),
      "loop-end": bi("Hết nums", "No more nums"),
      result: bi(`Trả về ${maxLen}`, `Return ${maxLen}`),
    };
    const witness = [];
    for (let at = bestEnd; at >= 0; at = parents[at]) witness.push(at);
    witness.reverse();
    const snapshot = Object.assign({}, dp);
    const locals = { nums: [...nums] };
    if (initialized) locals.dp = snapshot;
    if (event === "max-initialize" || initialized && event !== "initialize") locals.max_len = maxLen;
    if (x !== null) locals.x = x;
    steps.push({
      arr: [],
      codeLines: [line],
      codeBlock: 6,
      final,
      title: bi(`Dòng ${line} · ${labels[event].vi}`, `Line ${line} · ${labels[event].en}`),
      note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      lis300View: {
        problemId: 9024,
        approach: 6,
        line,
        source: code6[line - 1].trim(),
        event,
        nums: [...nums],
        mapDp: snapshot,
        x,
        index,
        end: bestEnd,
        transition: transition && { ...transition },
        candidate: [],
        witness,
        answer: final ? maxLen : null,
      },
    });
  }

  emit(3, "validate");
  initialized = true;
  emit(6, "initialize");
  emit(7, "max-initialize");
  bestEnd = 0;
  nums.forEach((value, currentIndex) => {
    x = value;
    index = currentIndex;
    transition = null;
    emit(9, "visit");
    const before = dp[x] || 0;
    const previousLength = dp[x - 1] || 0;
    const candidate = previousLength + 1;
    if (candidate > before) {
      dp[x] = candidate;
      parents[currentIndex] = previousLength ? bestIndexByValue[x - 1] : -1;
      bestIndexByValue[x] = currentIndex;
    }
    transition = { value: x, before, candidate, after: dp[x] || candidate, previousLength };
    emit(10, "update");
    maxLen = Math.max(maxLen, dp[x]);
    if (dp[x] === maxLen) bestEnd = bestIndexByValue[x];
    emit(11, "maximum");
  });
  emit(9, "loop-end");
  index = null;
  transition = null;
  emit(13, "result", true);
  const witness = steps.at(-1).lis300View.witness;
  return { original: nums, answer: maxLen, chain: witness, steps };
}

module.exports = { 9024: {
  id: 9024, difficulty: "medium", slug: null,
  category: { key: "interview", vi: "Phỏng vấn", en: "Interview" },
  tags: [{ key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }],
  title: bi("Dãy con tăng đúng 1", "Longest +1 Subsequence"),
  titleVi: bi("Bài trong ảnh · Mỗi giá trị sau tăng đúng 1", "Screenshot exercise · Each next value is exactly +1"),
  statement: bi("Giữ thứ tự ban đầu, được bỏ qua phần tử. Tìm dãy con dài nhất có nums[sau] = nums[trước] + 1. Ví dụ trong ảnh trả về độ dài 5.", "Keep the original order; skipping elements is allowed. Find the longest subsequence where each next value is the previous value + 1. The screenshot example returns length 5."),
  defaultInput: [2, 1, 3, 2, 4, 3, 2, 5, 4, 5], inputKind: "integer",
  inputLabel: bi("nums (1–40 số, −10000..10000)", "nums (1–40 values, −10000..10000)"),
  debugMode: "line-by-line",
  extraParams: [{ key: "approach", type: "select", default: 5, label: bi("Cách giải", "Approach"), options: [
    { value: 4, label: bi("4 · Tăng đúng 1: trả về index", "4 · Exactly +1: return indices") },
    { value: 5, label: bi("5 · Tăng đúng 1: trả về max", "5 · Exactly +1: return max") },
    { value: 6, label: bi("6 · Hash map: O(n)", "6 · Hash map: O(n)") },
  ] }],
  approach: [bi("Nối j → i khi j < i và nums[j] + 1 = nums[i].", "Extend j → i when j < i and nums[j] + 1 = nums[i]."), bi("Cách 5: return max(dp). Cách 4: lưu parent để lấy index.", "Approach 5: return max(dp). Approach 4: save parent links to recover indices."), bi("Cách 6: dp[x] lưu độ dài tốt nhất kết thúc bằng x. Dùng max để không ghi đè kết quả tốt hơn khi nums có giá trị lặp.", "Approach 6: dp[x] stores the best length ending at x. Use max so duplicate values cannot overwrite a better result.")],
  complexity: { time: "O(n²)", space: "O(n)" },
  complexity6: { time: "O(n)", space: "O(n)" },
  code: [], code4, code5, code6,
  code4Label: bi("4 · Tăng đúng 1: trả về index", "4 · Exactly +1: return indices"),
  code5Label: bi("5 · Tăng đúng 1: trả về max(dp)", "5 · Exactly +1: return max(dp)"),
  code6Label: bi("6 · Hash map: dp[x] = độ dài tốt nhất", "6 · Hash map: dp[x] = best length"),
  builder: (input, params = {}) => Number(params.approach) === 4 ? builder4(input) : Number(params.approach) === 6 ? buildHashMap(input) : builder5(input),
  builder4, builder5, builder6: buildHashMap, liveArgs: input => [parseNums(input, 9024)],
} };
