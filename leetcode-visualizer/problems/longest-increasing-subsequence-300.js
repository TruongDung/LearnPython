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
const code5 = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
  "        dp = {}",
  "        end_at = {}",
  "        parent = [-1] * len(nums)",
  "        max_len = 0",
  "        best_end = -1",
  "",
  "        for i, num in enumerate(nums):",
  "            dp[num] = dp.get(num - 1, 0) + 1",
  "            parent[i] = end_at.get(num - 1, -1)",
  "            end_at[num] = i",
  "",
  "            if dp[num] > max_len:",
  "                max_len = dp[num]",
  "                best_end = i",
  "",
  "        indices = []",
  "        while best_end != -1:",
  "            indices.append(best_end)",
  "            best_end = parent[best_end]",
  "",
  "        indices.reverse()",
  "        return indices",
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

function buildHashMapIndices(input) {
  const nums = parseNums(input);
  const dp = Object.create(null);
  const endAt = Object.create(null);
  const parent = nums.map(() => -1);
  const steps = [];
  let maxLen = 0;
  let bestEnd = -1;
  let solutionEnd = -1;
  let i = null;
  let num = null;
  let indices = null;
  let transition = null;
  const available = { dp: false, endAt: false, parent: false, maxLen: false, bestEnd: false, loop: false, indices: false };

  function pathTo(end) {
    const path = [];
    for (let at = end; at >= 0; at = parent[at]) path.push(at);
    return path.reverse();
  }

  function emit(line, event, final = false) {
    const labels = {
      initialize: bi("Tạo dp rỗng", "Create empty dp"),
      "ends-initialize": bi("Tạo bảng index cuối", "Create ending-index map"),
      "parents-initialize": bi("Khởi tạo parent", "Initialize parent links"),
      "max-initialize": bi("Đặt max_len = 0", "Set max_len = 0"),
      "best-initialize": bi("Chưa có điểm cuối", "No ending index yet"),
      visit: bi(`Xét index ${i}, num = ${num}`, `Visit index ${i}, num = ${num}`),
      update: bi(`Cập nhật dp[${num}]`, `Update dp[${num}]`),
      parent: bi(`Nối parent[${i}]`, `Link parent[${i}]`),
      endpoint: bi(`Ghi end_at[${num}] = ${i}`, `Set end_at[${num}] = ${i}`),
      compare: bi("Có dãy dài hơn?", "Found a longer chain?"),
      maximum: bi(`max_len = ${maxLen}`, `max_len = ${maxLen}`),
      best: bi(`best_end = ${bestEnd}`, `best_end = ${bestEnd}`),
      "loop-end": bi("Hết nums", "No more nums"),
      "indices-initialize": bi("Tạo danh sách index", "Create index list"),
      "trace-check": bi(bestEnd >= 0 ? `Lần ngược từ ${bestEnd}` : "Đã lần ngược xong", bestEnd >= 0 ? `Backtrack from ${bestEnd}` : "Backtracking complete"),
      "trace-append": bi(`Thêm index ${bestEnd}`, `Append index ${bestEnd}`),
      "trace-parent": bi(`Đi theo parent → ${bestEnd}`, `Follow parent → ${bestEnd}`),
      reverse: bi("Đảo về thứ tự ban đầu", "Reverse to original order"),
      result: bi(`Trả về [${(indices || []).join(", ")}]`, `Return [${(indices || []).join(", ")}]`),
    };
    const locals = { nums: [...nums] };
    if (available.dp) locals.dp = Object.assign({}, dp);
    if (available.endAt) locals.end_at = Object.assign({}, endAt);
    if (available.parent) locals.parent = [...parent];
    if (available.maxLen) locals.max_len = maxLen;
    if (available.bestEnd) locals.best_end = bestEnd;
    if (available.loop) { locals.i = i; locals.num = num; }
    if (available.indices) locals.indices = [...indices];
    const witness = pathTo(solutionEnd >= 0 ? solutionEnd : bestEnd);
    steps.push({
      arr: [],
      codeLines: [line],
      codeBlock: 5,
      final,
      title: bi(`Dòng ${line} · ${labels[event].vi}`, `Line ${line} · ${labels[event].en}`),
      note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })),
      lis300View: {
        problemId: 300,
        approach: 5,
        line,
        source: code5[line - 1].trim(),
        event,
        nums: [...nums],
        mapDp: Object.assign({}, dp),
        endMap: Object.assign({}, endAt),
        parent: [...parent],
        x: num,
        i,
        index: i,
        end: solutionEnd >= 0 ? solutionEnd : bestEnd,
        cursor: bestEnd,
        transition: transition && { ...transition },
        candidate: [],
        witness,
        reconstructing: available.indices && !final,
        indices: indices ? [...indices] : [],
        answer: final ? [...indices] : null,
      },
    });
  }

  available.dp = true;
  emit(3, "initialize");
  available.endAt = true;
  emit(4, "ends-initialize");
  available.parent = true;
  emit(5, "parents-initialize");
  available.maxLen = true;
  emit(6, "max-initialize");
  available.bestEnd = true;
  emit(7, "best-initialize");
  nums.forEach((value, index) => {
    i = index;
    num = value;
    transition = null;
    available.loop = true;
    emit(9, "visit");
    const before = dp[num] || 0;
    const previousLength = dp[num - 1] || 0;
    dp[num] = previousLength + 1;
    transition = { value: num, before, candidate: dp[num], after: dp[num], previousLength };
    emit(10, "update");
    parent[i] = Object.prototype.hasOwnProperty.call(endAt, num - 1) ? endAt[num - 1] : -1;
    emit(11, "parent");
    endAt[num] = i;
    emit(12, "endpoint");
    const improves = dp[num] > maxLen;
    emit(14, "compare");
    if (improves) {
      maxLen = dp[num];
      emit(15, "maximum");
      bestEnd = i;
      emit(16, "best");
    }
  });
  emit(9, "loop-end");
  solutionEnd = bestEnd;
  indices = [];
  available.indices = true;
  emit(18, "indices-initialize");
  while (true) {
    emit(19, "trace-check");
    if (bestEnd === -1) break;
    indices.push(bestEnd);
    emit(20, "trace-append");
    bestEnd = parent[bestEnd];
    emit(21, "trace-parent");
  }
  indices.reverse();
  emit(23, "reverse");
  emit(24, "result", true);
  return { original: nums, answer: [...indices], chain: [...indices], steps };
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
    { value: 5, label: bi("5 · Hash map +1: danh sách index", "5 · +1 hash map: index list") },
  ] }],
  approach: [
    bi("DP: dp[i] = dài nhất kết thúc tại i.", "DP: dp[i] = longest length ending at i."),
    bi("Chỉ nối j → i khi nums[j] < nums[i].", "Extend j → i only when nums[j] < nums[i]."),
    bi("tails: giữ đuôi nhỏ nhất cho mỗi độ dài.", "tails: keep the smallest tail for each length."),
    bi("Cách 3: lưu parent, lần ngược rồi trả về danh sách index.", "Approach 3: save parent links, backtrack and return the indices."),
    bi("Cách 4 dùng hash map để tìm dãy +1 theo thứ tự đầu vào trong O(n); đây cũng là biến thể đặc biệt, không giải LIS tổng quát.", "Approach 4 uses a hash map to find a +1 subsequence in input order in O(n); it is also a special variant, not a general LIS solution."),
    bi("Cách 5 thêm parent và end_at vào cách 4 để lần ngược, rồi trả về danh sách index.", "Approach 5 adds parent and end_at to approach 4, backtracks, then returns the index list."),
  ],
  complexity: { time: "O(n²) / O(n log n) / O(n)", space: "O(n)", note: bi("Cách 1, 3: DP · Cách 2: tails · Cách 4, 5: hash map +1.", "Approaches 1, 3: DP · Approach 2: tails · Approaches 4, 5: +1 hash map.") },
  code: DP_CODE, code2: BINARY_CODE, code3: INDEX_CODE, code4, code5,
  codeLabel: bi("1 · DP O(n²)", "1 · DP O(n²)"), code2Label: bi("2 · tails O(n log n)", "2 · tails O(n log n)"),
  code3Label: bi("3 · DP range(n): danh sách index", "3 · DP range(n): index lists"),
  code4Label: bi("4 · Biến thể +1: hash map dp[num]", "4 · +1 variant: hash map dp[num]"),
  code5Label: bi("5 · Hash map +1: trả về index", "5 · +1 hash map: return indices"),
  complexity4: { time: "O(n)", space: "O(n)" },
  complexity5: { time: "O(n)", space: "O(n)" },
  builder: (input, params = {}) => {
    const approach = Number(params.approach);
    return approach === 2 ? buildBinary(input)
      : approach === 3 ? buildIndices(input, 3)
      : approach === 4 ? buildHashMap(input)
      : approach === 5 ? buildHashMapIndices(input)
      : buildDp(input);
  },
  builder2: buildBinary,
  builder3: input => buildIndices(input, 3),
  builder4: buildHashMap,
  builder5: buildHashMapIndices,
  liveArgs: input => [parseNums(input)],
} };
