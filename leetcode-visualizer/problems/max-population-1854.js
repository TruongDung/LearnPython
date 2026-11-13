"use strict";

// LeetCode 1854 — Maximum Population Year.
// Difference array over the used years, then a running prefix sum, traced one executed Python line per step.
// Picture lives in public/renderer-max-population-1854.js (life bars, diff cells with +/-, population bars).

const MAX_LOGS_1854 = 10;
const MIN_YEAR_1854 = 1950;
const MAX_YEAR_1854 = 2050;
const MAX_CELLS_1854 = 32; // hi - lo + 1: the picture draws one cell per year
const DEFAULT_INPUT_1854 = "[[1952,1960],[1955,1966],[1950,1956],[1958,1963],[1961,1972],[1964,1970],[1957,1962],[1966,1975]]";

const SOURCE_1854 = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maximumPopulation(self, logs: List[List[int]]) -> int:",
  "        lo = min(birth for birth, _ in logs)",
  "        hi = max(death for _, death in logs)",
  "        diff = [0] * (hi - lo + 1)",
  "        for birth, death in logs:",
  "            diff[birth - lo] += 1",
  "            diff[death - lo] -= 1",
  "        max_pop = curr = 0",
  "        ans = lo",
  "        for i in range(len(diff)):",
  "            curr += diff[i]",
  "            if curr > max_pop:",
  "                max_pop = curr",
  "                ans = lo + i",
  "        return ans",
]);

const bi = (vi, en) => ({ vi, en });

function parseInput1854(input) {
  let value = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input.trim());
    } catch (_error) {
      throw new Error("1854: enter logs like [[1950,1961],[1960,1971]].");
    }
  }
  if (value && !Array.isArray(value) && typeof value === "object") value = value.logs;
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_LOGS_1854) {
    throw new Error(`1854: enter 1–${MAX_LOGS_1854} logs.`);
  }
  const logs = value.map((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 2
      || pair.some((year) => !Number.isSafeInteger(year) || year < MIN_YEAR_1854 || year > MAX_YEAR_1854)
      || pair[0] >= pair[1]) {
      throw new Error(`1854: log ${index + 1} must be [birth, death] with ${MIN_YEAR_1854} ≤ birth < death ≤ ${MAX_YEAR_1854}.`);
    }
    return [pair[0], pair[1]];
  });
  const lo = Math.min(...logs.map((pair) => pair[0]));
  const hi = Math.max(...logs.map((pair) => pair[1]));
  if (hi - lo + 1 > MAX_CELLS_1854) {
    throw new Error(`1854: years are drawn one cell each; keep max(death) − min(birth) ≤ ${MAX_CELLS_1854 - 1}.`);
  }
  return logs;
}

function buildSteps1854(input) {
  const logs = parseInput1854(input);
  const steps = [];
  let lo = null;
  let hi = null;
  let diff = null;
  let person = null; // index into logs during the first loop
  let i = null;
  let curr = null;
  let maxPop = null;
  let ans = null;
  const prefix = []; // curr after each finished year i (the population bars)
  // Bar-chart scale: the final max population, known up front so the picture keeps one height.
  const peak = (() => {
    let best = 0;
    for (let year = MIN_YEAR_1854; year <= MAX_YEAR_1854; year++) {
      best = Math.max(best, logs.filter(([birth, death]) => birth <= year && year < death).length);
    }
    return best;
  })();
  const dash = (value) => (value === null ? "—" : value);
  const cur = () => (person === null ? null : logs[person]);

  const emit = ({ line, event, title, note, condition = null, changed = null, delta = null, final = false }) => {
    const log = cur();
    steps.push({
      title,
      note,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "lo", value: dash(lo) },
        { name: "hi", value: dash(hi) },
        { name: "birth", value: log ? log[0] : "—" },
        { name: "death", value: log ? log[1] : "—" },
        { name: "diff", value: diff ? `[${diff.join(", ")}]` : "—" },
        { name: "i", value: dash(i) },
        { name: "curr", value: dash(curr) },
        { name: "max_pop", value: dash(maxPop) },
        { name: "ans", value: dash(ans) },
      ],
      final,
      maxPop1854View: JSON.parse(JSON.stringify({
        version: 1,
        problemId: 1854,
        line,
        event,
        condition,
        logs: logs.map(([birth, death], id) => ({ id, birth, death })),
        start: Math.min(...logs.map((pair) => pair[0])),
        end: Math.max(...logs.map((pair) => pair[1])),
        lo,
        hi,
        person,
        diff,
        changed,
        delta,
        i,
        curr,
        maxPop,
        ans,
        prefix,
        peak,
        final,
      })),
    });
  };

  emit({ line: 1, event: "import", title: bi("from typing import List", "from typing import List"), note: bi("Kiểu List.", "Type hints.") });
  emit({ line: 3, event: "class", title: bi("class Solution", "class Solution"), note: bi("Định nghĩa lớp.", "Class defined.") });
  emit({ line: 4, event: "call", title: bi("Gọi maximumPopulation", "Call maximumPopulation"), note: bi(`${logs.length} người.`, `${logs.length} people.`) });
  lo = Math.min(...logs.map((pair) => pair[0]));
  emit({ line: 5, event: "lo", title: bi(`lo = ${lo}`, `lo = ${lo}`), note: bi(`Sinh sớm nhất: ${lo}.`, `Earliest birth: ${lo}.`) });
  hi = Math.max(...logs.map((pair) => pair[1]));
  emit({ line: 6, event: "hi", title: bi(`hi = ${hi}`, `hi = ${hi}`), note: bi(`Mất muộn nhất: ${hi}.`, `Latest death: ${hi}.`) });
  diff = new Array(hi - lo + 1).fill(0);
  emit({ line: 7, event: "diff", title: bi(`diff = [0] * ${diff.length}`, `diff = [0] * ${diff.length}`), note: bi(`${diff.length} ô, tất cả 0.`, `${diff.length} cells, all 0.`) });

  logs.forEach(([birth, death], index) => {
    person = index;
    emit({ line: 8, event: "for-log", title: bi(`P${index + 1}: [${birth}, ${death}]`, `P${index + 1}: [${birth}, ${death}]`), note: bi(`P${index + 1}: ${birth}–${death}.`, `P${index + 1}: ${birth}–${death}.`) });
    diff[birth - lo] += 1;
    emit({ line: 9, event: "plus", changed: birth - lo, delta: 1, title: bi(`diff[${birth - lo}] += 1`, `diff[${birth - lo}] += 1`), note: bi(`Sinh ${birth}: +1.`, `Born ${birth}: +1.`) });
    diff[death - lo] -= 1;
    emit({ line: 10, event: "minus", changed: death - lo, delta: -1, title: bi(`diff[${death - lo}] -= 1`, `diff[${death - lo}] -= 1`), note: bi(`Mất ${death}: -1.`, `Died ${death}: -1.`) });
  });
  emit({ line: 8, event: "for-log-done", title: bi("Hết logs", "logs done"), note: bi("Đã đánh dấu hết.", "All marked.") });
  person = null;

  maxPop = 0;
  curr = 0;
  emit({ line: 11, event: "init", title: bi("max_pop = curr = 0", "max_pop = curr = 0"), note: bi("Bắt đầu từ 0.", "Start at 0.") });
  ans = lo;
  emit({ line: 12, event: "ans", title: bi(`ans = ${lo}`, `ans = ${lo}`), note: bi(`Tạm ans = ${lo}.`, `ans starts at ${lo}.`) });

  for (let index = 0; index < diff.length; index++) {
    i = index;
    const year = lo + index;
    emit({ line: 13, event: "for-year", title: bi(`i = ${index} (${year})`, `i = ${index} (${year})`), note: bi(`Năm ${year}.`, `Year ${year}.`) });
    curr += diff[index];
    prefix.push(curr);
    emit({ line: 14, event: "add", title: bi(`curr += diff[${index}]`, `curr += diff[${index}]`), note: bi(`Còn sống: ${curr}.`, `Alive: ${curr}.`) });
    const better = curr > maxPop;
    emit({
      line: 15,
      event: "check",
      condition: better,
      title: bi(`if ${curr} > ${maxPop}`, `if ${curr} > ${maxPop}`),
      note: better
        ? bi(`${curr} > ${maxPop} → True.`, `${curr} > ${maxPop} → True.`)
        : curr === maxPop && curr > 0
          ? bi("Bằng max → giữ năm cũ.", "Tie → keep earlier year.")
          : bi(`${curr} ≤ ${maxPop} → False.`, `${curr} ≤ ${maxPop} → False.`),
    });
    if (better) {
      maxPop = curr;
      emit({ line: 16, event: "set-max", title: bi(`max_pop = ${curr}`, `max_pop = ${curr}`), note: bi(`Max mới: ${curr}.`, `New max: ${curr}.`) });
      ans = year;
      emit({ line: 17, event: "set-ans", title: bi(`ans = ${year}`, `ans = ${year}`), note: bi(`Năm tốt nhất: ${year}.`, `Best year: ${year}.`) });
    }
  }
  emit({ line: 13, event: "for-year-done", title: bi("Hết năm", "years done"), note: bi("Hết năm.", "All years done.") });
  i = null;
  emit({ line: 18, event: "return", final: true, title: bi(`return ${ans}`, `return ${ans}`), note: bi(`Đông nhất: ${ans}.`, `Most people: ${ans}.`) });
  return { input, answer: ans, steps };
}

module.exports = {
  1854: {
    id: 1854,
    difficulty: "easy",
    slug: "maximum-population-year",
    category: { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
    tags: [
      { key: "prefix-sum", vi: "Prefix Sum", en: "Prefix Sum" },
      { key: "array", vi: "Mảng", en: "Array" },
      { key: "counting", vi: "Đếm", en: "Counting" },
    ],
    title: { vi: "Maximum Population Year", en: "Maximum Population Year" },
    titleVi: { vi: "Năm đông dân nhất", en: "Year with the most people alive" },
    statement: {
      vi: "logs[i] = [birth, death]. Người i được tính trong các năm birth … death − 1 (năm mất không tính). Trả về năm sớm nhất có nhiều người sống nhất. Visualization: tối đa 10 người, max(death) − min(birth) ≤ 31.",
      en: "logs[i] = [birth, death]. Person i counts in years birth … death − 1 (not the death year). Return the earliest year with the most people alive. Visualization: up to 10 people, max(death) − min(birth) ≤ 31.",
    },
    defaultInput: DEFAULT_INPUT_1854,
    inputKind: "string",
    inputLabel: { vi: "logs: [[birth,death], ...]", en: "logs: [[birth,death], ...]" },
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      { vi: "Mảng hiệu diff: +1 ở năm sinh, −1 ở năm mất.", en: "Difference array diff: +1 at the birth year, −1 at the death year." },
      { vi: "Cộng dồn diff từ trái sang phải: curr = số người đang sống ở năm đó.", en: "Running sum of diff left to right: curr = people alive that year." },
      { vi: "Chỉ cập nhật khi curr > max_pop, nên khi bằng nhau giữ năm sớm hơn.", en: "Update only when curr > max_pop, so a tie keeps the earlier year." },
    ],
    complexity: {
      time: "O(n + R)",
      space: "O(R)",
      note: { vi: "n người, R = hi − lo + 1 năm.", en: "n people, R = hi − lo + 1 years." },
    },
    code: [...SOURCE_1854],
    builder: buildSteps1854,
    liveArgs: (input) => [parseInput1854(input)],
  },
};

Object.defineProperty(module.exports, "__internals1854", {
  value: { parseInput1854, SOURCE_1854, MAX_CELLS_1854 },
  enumerable: false,
});
