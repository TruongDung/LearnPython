"use strict";
const { bi } = require("./hard-viz-shared");
const base = require("./dp")[474], copy = value => JSON.parse(JSON.stringify(value));
const code = ["class Solution:", "    def findMaxForm(self, strs, m, n):", "        rows, cols = m + 1, n + 1", "        dp = [[0] * cols for _ in range(rows)]",
  "        for s in strs:", "            zeros = s.count('0')", "            ones = s.count('1')", "            for z in range(m, zeros - 1, -1):", "                for o in range(n, ones - 1, -1):",
  "                    skip = dp[z][o]", "                    take = dp[z - zeros][o - ones] + 1", "                    dp[z][o] = max(skip, take)", "        return dp[m][n]"];
function parse(input, params = {}) {
  if (!Array.isArray(input) || input.length > 600 || !input.every(s => typeof s === "string" && s.length <= 100 && /^[01]*$/.test(s))) throw new TypeError("#474: tối đa 600 chuỗi nhị phân, mỗi chuỗi ≤ 100 ký tự / up to 600 binary strings, each ≤ 100 characters.");
  const capacity = (raw, fallback, name) => {
    const value = raw === undefined ? fallback : typeof raw === "number" || typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
    if (!Number.isSafeInteger(value) || value < 0 || value > 100) throw new RangeError(`#474: ${name} phải là số nguyên 0–100 / use an integer in 0–100.`);
    return value;
  };
  return { strs: [...input], m: capacity(params.m, 5, "m"), n: capacity(params.n, 3, "n") };
}
function builder(input, params) {
  const { strs, m, n } = parse(input, params), steps = [], strings = strs.map((text, index) => ({ text, index, zeros: [...text].filter(c => c === "0").length, ones: [...text].filter(c => c === "1").length }));
  const updates = strings.reduce((sum, s) => sum + Math.max(0, m - s.zeros + 1) * Math.max(0, n - s.ones + 1), 0);
  const detailed = strs.length <= 30 && (m + 1) * (n + 1) <= 625 && updates <= 350;
  const keepWitness = strs.length <= 30 && (m + 1) * (n + 1) <= 2500;
  let dp = [], previous = [], paths = [], activeIndex = null, zeros, ones, z, o, skip, take, transition = null, processed = 0, capture = true, witness = null;
  const history = [];
  function emit(line, phase, final = false) {
    if (!capture && !final) return;
    steps.push({ title: bi(`Dòng ${line} · ${phase}`, `Line ${line} · ${phase}`), note: bi("", ""), arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      vars: ["zeros", "ones", "z", "o", "skip", "take"].map((name, i) => ({ name, value: [zeros, ones, z, o, skip, take][i] ?? "—" })),
      onesZeros474View: copy({ strings, m, n, dp, previous, detailed, line, source: code[line - 1], phase, activeIndex, processed,
        zeros: zeros ?? null, ones: ones ?? null, z: z ?? null, o: o ?? null, sourceZ: transition?.sourceZ ?? null, sourceO: transition?.sourceO ?? null,
        skip: transition?.skip ?? null, takeFrom: transition?.takeFrom ?? null, take: transition?.take ?? null, result: transition?.result ?? null,
        transition, witness, history, answer: final ? dp[m][n] : null, final }),
    });
  }
  emit(3, "intro"); dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  if (keepWitness) paths = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => []));
  emit(4, "initialize");
  strings.forEach((item, index) => {
    capture = detailed || strs.length <= 20 || index < 3 || index >= strs.length - 2 || index % Math.ceil(strs.length / 12) === 0;
    activeIndex = index; transition = null; previous = dp.map(row => [...row]); emit(5, "choose-string");
    zeros = item.zeros; emit(6, "count-zero"); ones = item.ones; emit(7, zeros > m || ones > n ? "skip-string" : "inspect-string");
    let updated = false;
    for (let zeroCap = m; zeroCap >= zeros; zeroCap--) {
      z = zeroCap; if (detailed) emit(8, "scan-capacity");
      for (let oneCap = n; oneCap >= ones; oneCap--) {
        o = oneCap; transition = null; if (detailed) emit(9, "cell");
        skip = dp[z][o]; transition = { z, o, sourceZ: z - zeros, sourceO: o - ones, skip, takeFrom: null, take: null, result: null };
        if (detailed) emit(10, "read-skip");
        const from = dp[z - zeros][o - ones]; take = from + 1; transition.takeFrom = from; transition.take = take;
        if (detailed) emit(11, "compare");
        if (keepWitness && take > skip) paths[z][o] = [...paths[z - zeros][o - ones], index];
        dp[z][o] = Math.max(skip, take); transition.result = dp[z][o]; updated = true;
        if (detailed) emit(12, "update");
      }
      transition = null; if (detailed) emit(9, "row-end");
    }
    // For large inputs, record one actual final cell update per sampled item.
    if (!detailed && updated) {
      transition = { z, o, sourceZ: z - zeros, sourceO: o - ones, skip, takeFrom: take - 1, take, result: dp[z][o] };
      emit(12, "item-update");
    }
    transition = null; processed = index + 1; history.push({ index, value: dp[m][n] }); emit(8, "item-end");
  });
  capture = true; emit(5, "items-end"); witness = keepWitness ? paths[m][n] : null; emit(13, "result", true);
  return { strs, m, n, answer: dp[m][n], steps };
}
module.exports = { 474: { ...base, code, builder, debugMode: "line-by-line", liveArgs: (input, params) => { const p = parse(input, params); return [p.strs, p.m, p.n]; },
  category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }, titleVi: bi("Chọn nhiều chuỗi 0/1 nhất", "Maximum binary strings"),
  inputLabel: bi("strs · chuỗi nhị phân dạng JSON hoặc ngăn bằng dấu phẩy", "strs · binary strings as JSON or comma-separated"),
  statement: bi("Chọn nhiều chuỗi nhất với tối đa m số 0 và n số 1. Mỗi vị trí trong strs chỉ dùng một lần.", "Pick the most strings with at most m zeroes and n ones. Use each input position at most once."),
  extraParams: [{ key: "m", type: "number", label: bi("m · số 0", "m · zeroes"), default: 5, min: 0, max: 100 }, { key: "n", type: "number", label: bi("n · số 1", "n · ones"), default: 3, min: 0, max: 100 }],
  approach: [bi("Mỗi chuỗi tốn hai loại chỗ: số 0 và số 1.", "Each string consumes two resources: zeroes and ones."), bi("Duyệt ngân sách giảm dần; so sánh bỏ chuỗi với lấy chuỗi + 1.", "Sweep capacities downward; compare skipping with taking the string + 1.")],
  complexity: { time: "O(total characters + len(strs) · (m+1) · (n+1))", space: "O((m+1) · (n+1))", note: bi("Input lớn hiển thị các chuỗi đại diện; vẫn tính đủ toàn bộ kết quả.", "Large inputs show representative strings; the full answer is still computed.") },
} };
