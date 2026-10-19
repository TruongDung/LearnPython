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
const INDEX_CODE = [
  "class Solution:",
  "    def lengthOfLIS(self, nums):",
  "        n = len(nums)",
  "        dp = [1] * n",
  "        parent = [-1] * n",
  "",
  "        for i in range(n):",
  "            for j in range(i):",
  "                if nums[j] < nums[i]:",
  "                    if dp[j] + 1 > dp[i]:",
  "                        dp[i] = dp[j] + 1",
  "                        parent[i] = j",
  "",
  "        end = dp.index(max(dp))",
  "        indices = []",
  "        while end != -1:",
  "            indices.append(end)",
  "            end = parent[end]",
  "        indices.reverse()",
  "        return indices",
];
const UNIT_STEP_CODE = INDEX_CODE.map(line => line.replace("nums[j] < nums[i]", "nums[j] + 1 == nums[i]"));
const UNIT_LENGTH_CODE = DP_CODE.map(line => line.replace("range(1, n)", "range(n)").replace("nums[j] < nums[i]", "nums[j] + 1 == nums[i]"));
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

function parseNums(input, problemId = 300) {
  return parseIntegerArray(input, { problemId, name: "nums", minLength: 1, maxLength: 40, minValue: -10000, maxValue: 10000 });
}

function pathTo(end, parents) {
  const path = [];
  for (let at = end; at >= 0; at = parents[at]) path.push(at);
  return path.reverse();
}

function buildDp(input, approach = 1, options = {}) {
  const nums = parseNums(input, options.problemId);
  const unitStep = approach === 5;
  const source = options.source || (unitStep ? UNIT_LENGTH_CODE : DP_CODE);
  const locals = { nums: [...nums] };
  const parents = nums.map(() => -1);
  const steps = [];
  let dp = [], i = null, j = null, comparison = null, transition = null;
  function emit(line, event, label, final = false) {
    const best = dp.length ? dp.indexOf(Math.max(...dp)) : -1;
    const end = final ? best : i ?? (dp.length ? 0 : -1);
    const witness = end < 0 ? [] : pathTo(end, parents);
    steps.push({
      arr: [], codeLines: [line], codeBlock: approach, final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      lis300View: { problemId: options.problemId || 300, approach, unitStep, line, source: source[line - 1].trim(), event, nums: [...nums], dp: [...dp], i, j,
        comparison, transition: transition && { ...transition }, witness,
        candidate: comparison === true && j !== null ? [...pathTo(j, parents), i] : [],
        answer: final ? Math.max(...dp) : null, end },
    });
  }
  locals.n = nums.length;
  emit(3, "length", bi(`n = ${nums.length}`, `n = ${nums.length}`));
  dp = nums.map(() => 1); locals.dp = dp;
  emit(4, "initialize", bi("Mỗi số đứng riêng: dài 1", "Each number alone: length 1"));
  for (i = unitStep ? 0 : 1; i < nums.length; i++) {
    locals.i = i; comparison = null; transition = null;
    emit(5, "outer", bi(`Xét i = ${i}`, `Visit i = ${i}`));
    for (j = 0; j < i; j++) {
      locals.j = j; comparison = null; transition = null;
      emit(6, "inner", bi(`Thử j = ${j}`, `Try j = ${j}`));
      comparison = unitStep ? nums[j] + 1 === nums[i] : nums[j] < nums[i];
      emit(7, "compare", bi(comparison ? (unitStep ? "Tăng đúng 1 ✓" : "Nối được ✓") : (unitStep ? "Không tăng đúng 1: bỏ qua" : "Không tăng: bỏ qua"), comparison ? (unitStep ? "Exactly +1 ✓" : "Can extend ✓") : (unitStep ? "Not exactly +1: skip" : "Not increasing: skip")));
      if (comparison) {
        const before = dp[i], candidate = dp[j] + 1;
        dp[i] = Math.max(before, candidate);
        if (candidate > before) parents[i] = j;
        transition = { before, candidate, after: dp[i] };
        emit(8, "update", bi(`dp[${i}]: ${before} → ${dp[i]}`, `dp[${i}]: ${before} → ${dp[i]}`));
      }
    }
    // Python visits the for header once more when its iterator is exhausted.
    j = locals.j ?? null; comparison = null; transition = null;
    emit(6, "inner-end", bi("Hết j", "No more j"));
  }
  i = locals.i ?? null; j = locals.j ?? null;
  emit(5, "outer-end", bi("Hết i", "No more i"));
  emit(9, "done", bi(unitStep ? `Trả về max(dp) = ${Math.max(...dp)}` : `LIS dài ${Math.max(...dp)}`, unitStep ? `Return max(dp) = ${Math.max(...dp)}` : `LIS length ${Math.max(...dp)}`), true);
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

function buildIndices(input, approach = 3, options = {}) {
  const nums = parseNums(input, options.problemId), steps = [];
  const unitStep = approach === 4;
  const source = options.source || (unitStep ? UNIT_STEP_CODE : INDEX_CODE);
  const locals = { nums: [...nums] };
  const eligibleByEnd = nums.map(() => []), checkedByEnd = nums.map(() => 0);
  let dp = [], parent = nums.map(() => -1), indices = null;
  let i = null, j = null, bestEnd = null, comparison = null, transition = null;
  function emit(line, event, label, final = false) {
    const end = bestEnd ?? i ?? (dp.length ? 0 : -1);
    const reconstructing = bestEnd !== null;
    steps.push({
      arr: [], codeLines: [line], codeBlock: approach, final,
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: Array.isArray(value) ? [...value] : value })),
      lis300View: { problemId: options.problemId || 300, approach, unitStep, line, source: source[line - 1].trim(), event, nums: [...nums], dp: [...dp],
        i: reconstructing ? null : i, j: reconstructing ? null : j, comparison, transition: transition && { ...transition },
        parent: locals.parent ? [...parent] : null, indices: indices && [...indices], cursor: locals.end ?? null,
        reconstructing, witness: end < 0 ? [] : pathTo(end, parent), end,
        candidate: comparison === true && j !== null && !reconstructing ? [...pathTo(j, parent), i] : [],
        eligibleByEnd: eligibleByEnd.map(list => [...list]), checkedByEnd: [...checkedByEnd],
        answer: final ? [...indices] : null },
    });
  }
  locals.n = nums.length;
  emit(3, "length", bi(`n = ${nums.length}`, `n = ${nums.length}`));
  dp = nums.map(() => 1); locals.dp = dp;
  emit(4, "initialize", bi("Mỗi số đứng riêng: dài 1", "Each number alone: length 1"));
  locals.parent = parent;
  emit(5, "parents", bi("parent rỗng: −1", "No predecessor: −1"));
  for (i = 0; i < nums.length; i++) {
    locals.i = i; comparison = null; transition = null;
    emit(7, "outer", bi(`Xét i = ${i}`, `Visit i = ${i}`));
    for (j = 0; j < i; j++) {
      locals.j = j; comparison = null; transition = null;
      emit(8, "inner", bi(`Thử j = ${j}`, `Try j = ${j}`));
      comparison = unitStep ? nums[j] + 1 === nums[i] : nums[j] < nums[i]; checkedByEnd[i] = j + 1;
      if (comparison) eligibleByEnd[i].push(j);
      emit(9, "compare", bi(comparison ? (unitStep ? "Tăng đúng 1 ✓" : "Nối được ✓") : (unitStep ? "Không tăng đúng 1: bỏ qua" : "Không tăng: bỏ qua"), comparison ? (unitStep ? "Exactly +1 ✓" : "Can extend ✓") : (unitStep ? "Not exactly +1: skip" : "Not increasing: skip")));
      if (comparison) {
        const before = dp[i], candidate = dp[j] + 1;
        const improve = candidate > before;
        emit(10, "improve-check", bi(`${candidate} > ${before} → ${improve ? "True" : "False"}`, `${candidate} > ${before} → ${improve ? "True" : "False"}`));
        if (improve) {
          dp[i] = candidate; transition = { before, candidate, after: candidate };
          emit(11, "update", bi(`dp[${i}]: ${before} → ${candidate}`, `dp[${i}]: ${before} → ${candidate}`));
          parent[i] = j;
          emit(12, "parent", bi(`parent[${i}] = ${j}`, `parent[${i}] = ${j}`));
        }
      }
    }
    j = locals.j ?? null; comparison = null; transition = null;
    emit(8, "inner-end", bi("Hết j", "No more j"));
  }
  i = locals.i; j = locals.j ?? null;
  emit(7, "outer-end", bi("Hết i", "No more i"));
  bestEnd = dp.indexOf(Math.max(...dp)); locals.end = bestEnd;
  emit(14, "find-end", bi(`Bắt đầu từ index ${bestEnd}`, `Start at index ${bestEnd}`));
  indices = []; locals.indices = indices;
  emit(15, "indices-init", bi("indices = []", "indices = []"));
  while (true) {
    emit(16, "trace-check", bi(`end = ${locals.end}`, `end = ${locals.end}`));
    if (locals.end === -1) break;
    indices.push(locals.end);
    emit(17, "trace-append", bi(`Thêm index ${locals.end}`, `Append index ${locals.end}`));
    locals.end = parent[locals.end];
    emit(18, "trace-parent", bi(`Lùi về ${locals.end}`, `Follow parent to ${locals.end}`));
  }
  indices.reverse();
  emit(19, "reverse", bi("Đảo lại thứ tự index", "Reverse the indices"));
  emit(20, "done", bi(`Trả về [${indices.join(", ")}]`, `Return [${indices.join(", ")}]`), true);
  return { original: nums, answer: [...indices], chain: [...indices], steps };
}

module.exports = { DP_CODE, INDEX_CODE, BINARY_CODE, UNIT_STEP_CODE, UNIT_LENGTH_CODE, parseNums, buildDp, buildBinary, buildIndices };
