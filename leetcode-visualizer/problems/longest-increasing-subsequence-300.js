"use strict";

const { bi } = require("./hard-viz-shared");
const { DP_CODE, INDEX_CODE, BINARY_CODE, UNIT_STEP_CODE, UNIT_LENGTH_CODE, parseNums, buildDp, buildBinary, buildIndices } = require("./increasing-subsequence-shared");
const code4 = UNIT_STEP_CODE;
const code5 = UNIT_LENGTH_CODE;
const code6 = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
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
const builder4 = input => buildIndices(input, 4, { source: code4 });
const builder5 = input => buildDp(input, 5, { source: code5 });

function buildHashMap(input) {
  const nums = parseNums(input);
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
        problemId: 300,
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
    { value: 4, label: bi("4 · Biến thể +1: trả về index", "4 · +1 variant: return indices") },
    { value: 5, label: bi("5 · Biến thể +1: DP trả về độ dài", "5 · +1 variant: DP length") },
    { value: 6, label: bi("6 · Biến thể +1: hash map O(n)", "6 · +1 variant: hash map O(n)") },
  ] }],
  approach: [
    bi("DP: dp[i] = dài nhất kết thúc tại i.", "DP: dp[i] = longest length ending at i."),
    bi("Chỉ nối j → i khi nums[j] < nums[i].", "Extend j → i only when nums[j] < nums[i]."),
    bi("tails: giữ đuôi nhỏ nhất cho mỗi độ dài.", "tails: keep the smallest tail for each length."),
    bi("Cách 3: lưu parent, lần ngược rồi trả về danh sách index.", "Approach 3: save parent links, backtrack and return the indices."),
    bi("Cách 4 là biến thể +1 đặc biệt: chỉ nối hai giá trị khi giá trị sau bằng giá trị trước +1; trả về index. Không giải LIS tổng quát.", "Approach 4 is a special +1 variant: only link values when the next equals the previous value +1; returns indices. It does not solve general LIS."),
    bi("Cách 5 dùng cùng quy tắc +1 nhưng chỉ trả về độ dài; không giải LIS tổng quát.", "Approach 5 uses the same +1 rule but returns only the length; it does not solve general LIS."),
    bi("Cách 6 dùng hash map để tìm dãy +1 theo thứ tự đầu vào trong O(n); đây cũng là biến thể đặc biệt, không giải LIS tổng quát.", "Approach 6 uses a hash map to find a +1 subsequence in input order in O(n); it is also a special variant, not a general LIS solution."),
  ],
  complexity: { time: "O(n²) / O(n log n)", space: "O(n)", note: bi("Cách 1, 3: DP · Cách 2: tails. Tối đa 40 số.", "Approaches 1, 3: DP · Approach 2: tails. Up to 40 values.") },
  code: DP_CODE, code2: BINARY_CODE, code3: INDEX_CODE, code4, code5, code6,
  codeLabel: bi("1 · DP O(n²)", "1 · DP O(n²)"), code2Label: bi("2 · tails O(n log n)", "2 · tails O(n log n)"),
  code3Label: bi("3 · DP range(n): danh sách index", "3 · DP range(n): index lists"),
  code4Label: bi("4 · Biến thể +1: trả về index", "4 · +1 variant: return indices"),
  code5Label: bi("5 · Biến thể +1: trả về max(dp)", "5 · +1 variant: return max(dp)"),
  code6Label: bi("6 · Biến thể +1: hash map dp[x]", "6 · +1 variant: hash map dp[x]"),
  complexity4: { time: "O(n²)", space: "O(n)" },
  complexity5: { time: "O(n²)", space: "O(n)" },
  complexity6: { time: "O(n)", space: "O(n)" },
  builder: (input, params = {}) => {
    const approach = Number(params.approach);
    return approach === 2 ? buildBinary(input)
      : approach === 3 ? buildIndices(input, 3)
      : approach === 4 ? builder4(input)
      : approach === 5 ? builder5(input)
      : approach === 6 ? buildHashMap(input)
      : buildDp(input);
  },
  builder2: buildBinary,
  builder3: input => buildIndices(input, 3),
  builder4,
  builder5,
  builder6: buildHashMap,
  liveArgs: input => [parseNums(input)],
} };
