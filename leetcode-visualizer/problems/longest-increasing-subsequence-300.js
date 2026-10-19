"use strict";

const { bi } = require("./hard-viz-shared");
const { DP_CODE, INDEX_CODE, BINARY_CODE, parseNums, buildDp, buildBinary, buildIndices } = require("./increasing-subsequence-shared");

module.exports = { 300: {
  id: 300, difficulty: "medium", slug: "longest-increasing-subsequence",
  category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
  title: bi("Longest Increasing Subsequence", "Longest Increasing Subsequence"),
  titleVi: bi("Dãy con tăng dài nhất", "Longest increasing subsequence"),
  statement: bi("Chọn các số tăng nghiêm ngặt, giữ thứ tự ban đầu; được phép bỏ qua số. Tìm độ dài lớn nhất.", "Pick strictly increasing values in their original order; skipping values is allowed. Find the maximum length."),
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18], inputKind: "integer",
  inputLabel: bi("nums (1–40 số, −10000..10000)", "nums (1–40 values, −10000..10000)"),
  debugMode: "line-by-line",
  extraParams: [{ key: "approach", type: "select", default: 1, label: bi("Cách giải", "Approach"), options: [
    { value: 1, label: bi("1 · DP: nối j → i", "1 · DP: extend j → i") },
    { value: 2, label: bi("2 · tails + tìm kiếm nhị phân", "2 · tails + binary search") },
    { value: 3, label: bi("3 · DP range(n): danh sách index", "3 · DP range(n): index lists") },
  ] }],
  approach: [bi("DP: dp[i] = dài nhất kết thúc tại i.", "DP: dp[i] = longest length ending at i."), bi("Chỉ nối j → i khi nums[j] < nums[i].", "Extend j → i only when nums[j] < nums[i]."), bi("tails: giữ đuôi nhỏ nhất cho mỗi độ dài.", "tails: keep the smallest tail for each length."), bi("Cách 3: lưu parent, lần ngược rồi trả về danh sách index.", "Approach 3: save parent links, backtrack and return the indices.")],
  complexity: { time: "O(n²) / O(n log n)", space: "O(n)", note: bi("Cách 1, 3: DP · Cách 2: tails. Tối đa 40 số.", "Approaches 1, 3: DP · Approach 2: tails. Up to 40 values.") },
  code: DP_CODE, code2: BINARY_CODE, code3: INDEX_CODE,
  codeLabel: bi("1 · DP O(n²)", "1 · DP O(n²)"), code2Label: bi("2 · tails O(n log n)", "2 · tails O(n log n)"),
  code3Label: bi("3 · DP range(n): danh sách index", "3 · DP range(n): index lists"),
  builder: (input, params = {}) => Number(params.approach) === 2 ? buildBinary(input) : Number(params.approach) === 3 ? buildIndices(input, 3) : buildDp(input),
  builder2: buildBinary, builder3: input => buildIndices(input, 3), liveArgs: input => [parseNums(input)],
} };
