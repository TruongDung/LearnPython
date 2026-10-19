"use strict";

const { bi } = require("./hard-viz-shared");
const { UNIT_STEP_CODE, UNIT_LENGTH_CODE, parseNums, buildDp, buildIndices } = require("./increasing-subsequence-shared");
const code4 = UNIT_STEP_CODE.map(line => line.replace("lengthOfLIS", "longestSubsequence"));
const code5 = UNIT_LENGTH_CODE.map(line => line.replace("lengthOfLIS", "longestSubsequence"));
const builder4 = input => buildIndices(input, 4, { problemId: 9024, source: code4 });
const builder5 = input => buildDp(input, 5, { problemId: 9024, source: code5 });

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
  ] }],
  approach: [bi("Nối j → i khi j < i và nums[j] + 1 = nums[i].", "Extend j → i when j < i and nums[j] + 1 = nums[i]."), bi("Cách 5: return max(dp). Cách 4: lưu parent để lấy index.", "Approach 5: return max(dp). Approach 4: save parent links to recover indices.")],
  complexity: { time: "O(n²)", space: "O(n)" },
  code: [], code4, code5,
  code4Label: bi("4 · Tăng đúng 1: trả về index", "4 · Exactly +1: return indices"),
  code5Label: bi("5 · Tăng đúng 1: trả về max(dp)", "5 · Exactly +1: return max(dp)"),
  builder: (input, params = {}) => Number(params.approach) === 4 ? builder4(input) : builder5(input),
  builder4, builder5, liveArgs: input => [parseNums(input, 9024)],
} };
