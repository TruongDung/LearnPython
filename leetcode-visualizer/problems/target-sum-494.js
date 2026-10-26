"use strict";

const { bi } = require("./hard-viz-shared");
const base = require("./dp")[494], copy = value => JSON.parse(JSON.stringify(value));
function parse(input, params = {}) {
  if (!Array.isArray(input) || input.length > 20 || !input.every(x => Number.isSafeInteger(x) && x >= 0 && x <= 1000) || input.reduce((a, b) => a + b, 0) > 1000) {
    throw new RangeError("#494: tối đa 20 số nguyên không âm, tổng ≤ 1000 / up to 20 non-negative integers, total ≤ 1000.");
  }
  const raw = params.target ?? 3, target = typeof raw === "number" || typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
  if (!Number.isSafeInteger(target) || Math.abs(target) > 1000) throw new RangeError("#494: target phải là số nguyên trong [-1000,1000] / target must be an integer in [-1000,1000].");
  return { nums: [...input], target };
}

function examples(nums, rows, sum, limit = 5) {
  const output = [], signs = Array(nums.length).fill(-1);
  function visit(i, remaining) {
    if (output.length >= limit) return;
    if (!i) { if (!remaining) output.push([...signs]); return; }
    if (rows[i - 1][remaining] > 0) { signs[i - 1] = -1; visit(i - 1, remaining); }
    if (remaining >= nums[i - 1] && rows[i - 1][remaining - nums[i - 1]] > 0) { signs[i - 1] = 1; visit(i - 1, remaining - nums[i - 1]); }
  }
  visit(nums.length, sum); return output;
}

function builder(input, params) {
  const { nums, target } = parse(input, params), total = nums.reduce((a, b) => a + b, 0), steps = [], history = [], rows = [];
  let P, dp = [], previous = [], num, j, activeNumIndex = null, transition = null, processed = 0, answer = null, sampleAssignments = [];
  let detailed = true;
  const checks = { range: null, even: null };
  function emit(line, phase, final = false) {
    const data = { target, P: P ?? "—", num: num ?? "—", j: j ?? "—", sourceWays: transition?.sourceWays ?? "—", "dp[j]": dp[j] ?? "—" };
    steps.push({ title: bi(`Dòng ${line} · ${phase}`, `Line ${line} · ${phase}`), note: bi("", ""), arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      vars: Object.entries(data).map(([name, value]) => ({ name, value })),
      targetSum494View: copy({ nums, target, total, subsetTarget: P ?? null, dp, previous, phase, line, source: base.code[line - 1], activeNumIndex,
        num: num ?? null, currentSum: j ?? null, sourceWays: transition?.sourceWays ?? null, beforeWays: transition?.before ?? null,
        afterWays: transition?.after ?? null, transition, processed, detailed, checks, history, answer, sampleAssignments, final }),
    });
  }
  emit(3, "intro"); checks.range = Math.abs(target) <= total;
  if (checks.range) checks.even = (total + target) % 2 === 0;
  emit(5, "feasibility");
  if (!checks.range || !checks.even) { answer = 0; emit(6, "infeasible", true); return { original: nums, answer, steps }; }
  P = (total + target) / 2;
  detailed = nums.reduce((count, value) => count + Math.max(0, P - value + 1), 0) <= 700;
  emit(7, "reduction"); dp = Array(P + 1).fill(0); emit(9, "allocate"); dp[0] = 1; rows.push([...dp]); emit(10, "initialize");
  nums.forEach((value, index) => {
    num = value; activeNumIndex = index; previous = [...dp]; transition = null; emit(11, "choose-signs");
    let updated = false;
    for (let sum = P; sum >= num; sum--) {
      j = sum; transition = { source: j - num, destination: j, before: dp[j], sourceWays: dp[j - num], after: null };
      if (detailed) emit(12, "consider-sum");
      dp[j] += transition.sourceWays; transition.after = dp[j]; updated = true;
      if (detailed) emit(13, "update-sum");
    }
    if (!detailed && updated) emit(13, "row-update");
    transition = null; processed = index + 1; rows.push([...dp]);
    history.push({ itemIndex: index, num, ways: dp[P] }); emit(12, "sum-end");
  });
  emit(11, "items-end"); answer = dp[P]; sampleAssignments = examples(nums, rows, P); emit(14, "done", true);
  return { original: nums, answer, steps };
}

module.exports = { 494: { ...base, builder, debugMode: "line-by-line", liveArgs: (input, params) => { const p = parse(input, params); return [p.nums, p.target]; },
  inputLabel: bi("nums · tối đa 20 số không âm · tổng ≤ 1000", "nums · up to 20 non-negative values · total ≤ 1000"),
  approach: [bi("Nhóm dấu + có tổng P = (total + target) / 2.", "The + group has sum P = (total + target) / 2."),
    bi("Duyệt j từ phải sang trái: số cách bỏ num + số cách chọn num.", "Sweep j from right to left: ways to skip num + ways to choose num.")],
  complexity: { time: "O(n · (P+1))", space: "O(P)", note: bi("P = (total+target)/2. Input lớn hiển thị theo từng số; số cách vẫn được tính đầy đủ.", "P = (total+target)/2. Large inputs show one update per value; all ways are counted.") },
} };
