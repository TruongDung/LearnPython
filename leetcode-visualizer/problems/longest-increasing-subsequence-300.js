"use strict";

const { bi, parseIntegerArray } = require("./hard-viz-shared");
const DP_CODE = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
  "        n = len(nums)",
  "        dp = [1] * n",
  "        for i in range(1, n):",
  "            for j in range(i):",
  "                if nums[j] < nums[i]:",
  "                    dp[i] = max(dp[i], dp[j] + 1)",
  "        return max(dp)",
];
const BINARY_CODE = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
  "        tails = []",
  "        for num in nums:",
  "            lo, hi = 0, len(tails)",
  "            while lo < hi:",
  "                mid = (lo + hi) // 2",
  "                if tails[mid] < num:",
  "                    lo = mid + 1",
  "                else:",
  "                    hi = mid",
  "            if lo == len(tails):",
  "                tails.append(num)",
  "            else:",
  "                tails[lo] = num",
  "        return len(tails)",
];

function parseNums(input) {
  return parseIntegerArray(input, { problemId: 300, name: "nums", minLength: 1, maxLength: 40, minValue: -10000, maxValue: 10000 });
}

function pathTo(end, parents) {
  const path = [];
  for (let at = end; at >= 0; at = parents[at]) path.push(at);
  return path.reverse();
}

function buildDp(input) {
  const nums = parseNums(input);
  const locals = { nums: [...nums] };
  const parents = nums.map(() => -1);
  const steps = [];
  let dp = [], i = null, j = null, comparison = null, transition = null;
  function emit(line, event, label, final = false) {
    const best = dp.length ? dp.indexOf(Math.max(...dp)) : -1;
    const end = final ? best : i ?? (dp.length ? 0 : -1);
    const witness = end < 0 ? [] : pathTo(end, parents);
    steps.push({
      arr: [], codeLines: [line], codeBlock: 1, final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      lis300View: { approach: 1, line, source: DP_CODE[line - 1].trim(), event, nums: [...nums], dp: [...dp], i, j,
        comparison, transition: transition && { ...transition }, witness,
        candidate: comparison === true && j !== null ? [...pathTo(j, parents), i] : [],
        answer: final ? Math.max(...dp) : null, end },
    });
  }
  locals.n = nums.length;
  emit(3, "length", bi(`n = ${nums.length}`, `n = ${nums.length}`));
  dp = nums.map(() => 1); locals.dp = dp;
  emit(4, "initialize", bi("Mỗi số đứng riêng: dài 1", "Each number alone: length 1"));
  for (i = 1; i < nums.length; i++) {
    locals.i = i; comparison = null; transition = null;
    emit(5, "outer", bi(`Xét i = ${i}`, `Visit i = ${i}`));
    for (j = 0; j < i; j++) {
      locals.j = j; comparison = null; transition = null;
      emit(6, "inner", bi(`Thử j = ${j}`, `Try j = ${j}`));
      comparison = nums[j] < nums[i];
      emit(7, "compare", bi(comparison ? "Nối được ✓" : "Không tăng: bỏ qua", comparison ? "Can extend ✓" : "Not increasing: skip"));
      if (comparison) {
        const before = dp[i], candidate = dp[j] + 1;
        dp[i] = Math.max(before, candidate);
        if (candidate > before) parents[i] = j;
        transition = { before, candidate, after: dp[i] };
        emit(8, "update", bi(`dp[${i}]: ${before} → ${dp[i]}`, `dp[${i}]: ${before} → ${dp[i]}`));
      }
    }
    // Python visits the for header once more when its iterator is exhausted.
    j = locals.j; comparison = null; transition = null;
    emit(6, "inner-end", bi("Hết j", "No more j"));
  }
  i = locals.i ?? null; j = locals.j ?? null;
  emit(5, "outer-end", bi("Hết i", "No more i"));
  emit(9, "done", bi(`LIS dài ${Math.max(...dp)}`, `LIS length ${Math.max(...dp)}`), true);
  return { original: nums, answer: Math.max(...dp), chain: steps.at(-1).lis300View.witness, steps };
}

function buildBinary(input) {
  const nums = parseNums(input), tails = [], tailIndices = [], parents = nums.map(() => -1), steps = [];
  const locals = { nums: [...nums], tails };
  let k = null, comparison = null, transition = null;
  function emit(line, event, label, final = false) {
    const witness = tails.length ? pathTo(tailIndices.at(-1), parents) : [];
    steps.push({
      arr: [], codeLines: [line], codeBlock: 2, final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      lis300View: { approach: 2, line, source: BINARY_CODE[line - 1].trim(), event, nums: [...nums], tails: [...tails],
        k, num: locals.num ?? null, lo: locals.lo ?? null, hi: locals.hi ?? null, mid: locals.mid ?? null,
        comparison, transition: transition && { ...transition }, witness, answer: final ? tails.length : null },
    });
  }
  emit(3, "initialize", bi("tails rỗng", "Empty tails"));
  for (k = 0; k < nums.length; k++) {
    const num = nums[k]; locals.num = num; comparison = null; transition = null;
    emit(4, "take", bi(`Lấy ${num}`, `Take ${num}`));
    locals.lo = 0; locals.hi = tails.length;
    emit(5, "bounds", bi(`[lo, hi) = [0, ${tails.length})`, `[lo, hi) = [0, ${tails.length})`));
    while (true) {
      const search = locals.lo < locals.hi;
      emit(6, "while", bi(search ? "Còn vùng tìm kiếm" : `Vị trí: ${locals.lo}`, search ? "Search range remains" : `Position: ${locals.lo}`));
      if (!search) break;
      locals.mid = Math.floor((locals.lo + locals.hi) / 2);
      emit(7, "middle", bi(`mid = ${locals.mid}`, `mid = ${locals.mid}`));
      comparison = tails[locals.mid] < num;
      emit(8, "compare", bi(`${tails[locals.mid]} < ${num} → ${comparison ? "True" : "False"}`, `${tails[locals.mid]} < ${num} → ${comparison ? "True" : "False"}`));
      if (comparison) {
        locals.lo = locals.mid + 1;
        emit(9, "right", bi("Tìm nửa phải →", "Search right →"));
      } else {
        locals.hi = locals.mid;
        emit(11, "left", bi("← Tìm nửa trái", "← Search left"));
      }
    }
    const position = locals.lo, append = position === tails.length;
    emit(12, "append-check", bi(append ? "Thêm vào cuối? True" : "Thêm vào cuối? False", append ? "Append? True" : "Append? False"));
    parents[k] = position ? tailIndices[position - 1] : -1;
    transition = { index: position, before: tails[position] ?? null, after: num };
    tailIndices[position] = k;
    if (append) {
      tails.push(num);
      emit(13, "append", bi(`Nối thêm ${num}`, `Append ${num}`));
    } else {
      tails[position] = num;
      emit(15, "replace", bi(`${transition.before} → ${num}`, `${transition.before} → ${num}`));
    }
  }
  k = nums.length - 1; comparison = null; transition = null;
  emit(4, "loop-end", bi("Hết nums", "No more nums"));
  emit(16, "done", bi(`LIS dài ${tails.length}`, `LIS length ${tails.length}`), true);
  return { original: nums, answer: tails.length, chain: steps.at(-1).lis300View.witness, steps };
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
  ] }],
  approach: [bi("DP: dp[i] = dài nhất kết thúc tại i.", "DP: dp[i] = longest length ending at i."), bi("Chỉ nối j → i khi nums[j] < nums[i].", "Extend j → i only when nums[j] < nums[i]."), bi("tails: giữ đuôi nhỏ nhất cho mỗi độ dài.", "tails: keep the smallest tail for each length.")],
  complexity: { time: "O(n²) / O(n log n)", space: "O(n)", note: bi("Cách 1: DP · Cách 2: tails. Giới hạn mô phỏng: 40 số.", "Approach 1: DP · Approach 2: tails. Visualization limit: 40 values.") },
  code: DP_CODE, code2: BINARY_CODE,
  codeLabel: bi("1 · DP O(n²)", "1 · DP O(n²)"), code2Label: bi("2 · tails O(n log n)", "2 · tails O(n log n)"),
  builder: (input, params = {}) => Number(params.approach) === 2 ? buildBinary(input) : buildDp(input),
  builder2: buildBinary, liveArgs: input => [parseNums(input)],
} };
