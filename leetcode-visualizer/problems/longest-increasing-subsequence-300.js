"use strict";

const { bi } = require("./hard-viz-shared");
const { DP_CODE, INDEX_CODE, BINARY_CODE, parseNums, buildDp, buildBinary, buildIndices } = require("./increasing-subsequence-shared");
const code4 = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
  "        dp = {}",
  "        max_len = 0",
  "",
  "        for num in nums:",
  "            dp[num] = dp.get(num - 1, 0) + 1",
  "            max_len = max(max_len, dp[num])",
  "",
  "        return max_len",
];
function buildHashMap(input) {
  const nums = parseNums(input);
  const dp = Object.create(null);
  const parents = nums.map(() => -1);
  const bestIndexByValue = Object.create(null);
  const steps = [];
  let maxLen = 0;
  let bestEnd = -1;
  let initialized = false;
  let x = null;
  let index = null;
  let transition = null;

  function emit(line, event, final = false) {
    const labels = {
      initialize: bi("Tạo dp rỗng", "Create empty dp"),
      "max-initialize": bi("Đặt max_len = 0", "Set max_len = 0"),
      visit: bi(`Xét num = ${x}`, `Visit num = ${x}`),
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
    if (event !== "initialize") locals.max_len = maxLen;
    if (x !== null) locals.num = x;
    steps.push({
      arr: [],
      codeLines: [line],
      codeBlock: 4,
      final,
      title: bi(`Dòng ${line} · ${labels[event].vi}`, `Line ${line} · ${labels[event].en}`),
      note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      lis300View: {
        problemId: 300,
        approach: 4,
        line,
        source: code4[line - 1].trim(),
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

  initialized = true;
  emit(3, "initialize");
  emit(4, "max-initialize");
  nums.forEach((value, currentIndex) => {
    x = value;
    index = currentIndex;
    transition = null;
    emit(6, "visit");
    const before = dp[x] || 0;
    const previousLength = dp[x - 1] || 0;
    const candidate = previousLength + 1;
    dp[x] = candidate;
    parents[currentIndex] = previousLength ? bestIndexByValue[x - 1] : -1;
    bestIndexByValue[x] = currentIndex;
    transition = { value: x, before, candidate, after: dp[x], previousLength };
    emit(7, "update");
    maxLen = Math.max(maxLen, dp[x]);
    if (dp[x] === maxLen) bestEnd = bestIndexByValue[x];
    emit(8, "maximum");
  });
  emit(6, "loop-end");
  index = null;
  transition = null;
  emit(10, "result", true);
  const witness = steps.at(-1).lis300View.witness;
  return { original: nums, answer: maxLen, chain: witness, steps };
}

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
    { value: 4, label: bi("4 · Biến thể +1: hash map O(n)", "4 · +1 variant: hash map O(n)") },
  ] }],
  approach: [
    bi("DP: dp[i] = dài nhất kết thúc tại i.", "DP: dp[i] = longest length ending at i."),
    bi("Chỉ nối j → i khi nums[j] < nums[i].", "Extend j → i only when nums[j] < nums[i]."),
    bi("tails: giữ đuôi nhỏ nhất cho mỗi độ dài.", "tails: keep the smallest tail for each length."),
    bi("Cách 3: lưu parent, lần ngược rồi trả về danh sách index.", "Approach 3: save parent links, backtrack and return the indices."),
    bi("Cách 4 dùng hash map để tìm dãy +1 theo thứ tự đầu vào trong O(n); đây cũng là biến thể đặc biệt, không giải LIS tổng quát.", "Approach 4 uses a hash map to find a +1 subsequence in input order in O(n); it is also a special variant, not a general LIS solution."),
  ],
  complexity: { time: "O(n²) / O(n log n) / O(n)", space: "O(n)", note: bi("Cách 1, 3: DP · Cách 2: tails · Cách 4: hash map +1.", "Approaches 1, 3: DP · Approach 2: tails · Approach 4: +1 hash map.") },
  code: DP_CODE, code2: BINARY_CODE, code3: INDEX_CODE, code4,
  codeLabel: bi("1 · DP O(n²)", "1 · DP O(n²)"), code2Label: bi("2 · tails O(n log n)", "2 · tails O(n log n)"),
  code3Label: bi("3 · DP range(n): danh sách index", "3 · DP range(n): index lists"),
  code4Label: bi("4 · Biến thể +1: hash map dp[num]", "4 · +1 variant: hash map dp[num]"),
  complexity4: { time: "O(n)", space: "O(n)" },
  builder: (input, params = {}) => {
    const approach = Number(params.approach);
    return approach === 2 ? buildBinary(input)
      : approach === 3 ? buildIndices(input, 3)
      : approach === 4 ? buildHashMap(input)
      : buildDp(input);
  },
  builder2: buildBinary,
  builder3: input => buildIndices(input, 3),
  builder4: buildHashMap,
  liveArgs: input => [parseNums(input)],
} };
