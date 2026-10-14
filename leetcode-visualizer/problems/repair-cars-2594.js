"use strict";
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "from collections import Counter",
  "from math import isqrt",
  "from typing import List",
  "",
  "class Solution:",
  "    def repairCars(self, ranks: List[int], cars: int) -> int:",
  "        frequency = Counter(ranks)",
  "        lo, hi = 0, min(ranks) * cars * cars",
  "        while lo < hi:",
  "            mid = lo + (hi - lo) // 2",
  "            repaired = 0",
  "            for rank, count in frequency.items():",
  "                repaired += count * isqrt(mid // rank)",
  "            if repaired >= cars:",
  "                hi = mid",
  "            else:",
  "                lo = mid + 1",
  "        return lo",
]);

function parseInput(input, params = {}) {
  if (!Array.isArray(input) || !input.length || input.length > 100000 || input.some(r => !Number.isInteger(r) || r < 1 || r > 100)) {
    throw new RangeError("2594: ranks must contain 1..100000 integers in [1, 100] / ranks gồm 1..100000 số nguyên từ 1 đến 100.");
  }
  const raw = params.cars === undefined ? 10 : params.cars;
  if (typeof raw !== "number" && (typeof raw !== "string" || !/^\d+$/.test(raw.trim()))) throw new TypeError("2594: cars must be an integer / cars phải là số nguyên.");
  const cars = Number(raw);
  if (!Number.isInteger(cars) || cars < 1 || cars > 1000000) throw new RangeError("2594: cars must be in [1, 1000000] / cars từ 1 đến 1000000.");
  return { ranks: [...input], cars };
}

// All official times fit exactly in Number. Correct the square root at integer boundaries.
function capacityAt(time, rank) {
  const quotient = Math.floor(time / rank);
  let capacity = Math.floor(Math.sqrt(quotient));
  while ((capacity + 1) * (capacity + 1) <= quotient) capacity++;
  while (capacity * capacity > quotient) capacity--;
  return capacity;
}

function buildSteps(input, params = {}) {
  const { ranks, cars } = parseInput(input, params);
  const grouped = new Map();
  for (const r of ranks) grouped.set(r, (grouped.get(r) || 0) + 1);
  const groups = [...grouped].map(([rank, count]) => ({ rank, count }));
  const initialHi = Math.min(...groups.map(g => g.rank)) * cars * cars;
  const capacities = time => groups.reduce((sum, g) => sum + g.count * capacityAt(time, g.rank), 0);
  let frequency, lo, hi, mid, repaired, rank, count;
  let time = null, scanStarted = false, complete = false, processed = 0, active = -1, round = 0;
  let results = [];
  const steps = [];
  function emit(line, phase, extra = {}) {
    // ranks stays in the input panel; omit that potentially huge, unchanged local.
    const locals = { cars };
    for (const [key, value] of Object.entries({ frequency, lo, hi, mid, repaired, rank, count })) if (value !== undefined) locals[key] = value;
    const ids = groups.length <= 6 ? groups.map((_, i) => i) : [...new Set([0, 1, groups.length - 1, ...(active >= 0 ? [Math.max(0, active - 1), active, Math.min(groups.length - 1, active + 1)] : [])])].sort((a, b) => a - b);
    const view = {
      phase, source: { line, text: CODE[line - 1], timing: "before" }, locals,
      cars, mechanics: ranks.length, groupCount: groups.length, initialHi,
      lo: lo ?? null, hi: hi ?? null, mid: mid ?? null, time,
      repaired: scanStarted ? repaired : null, processed, complete, round,
      groups: ids.map(i => ({ ...groups[i], index: i, active: i === active && !complete, done: i < processed,
        capacity: i < processed ? results[i] : null,
        preview: i === active && time !== null ? capacityAt(time, groups[i].rank) : null })),
      cropped: ids.length < groups.length, final: false, answer: null, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeLines: [line], final: !!extra.final,
      title: bi("Thợ sửa xe chạy song song", "Mechanics repair cars in parallel"), note: bi("", ""),
      vars: Object.entries(locals).map(([name, value]) => ({ name, value })), repairCars2594View: view });
  }
  emit(7, "group"); frequency = Object.fromEntries(grouped);
  emit(8, "bounds"); lo = 0; hi = initialHi;
  while (true) {
    emit(9, "while"); if (!(lo < hi)) break;
    emit(10, "mid"); mid = lo + Math.floor((hi - lo) / 2); round++;
    time = mid; scanStarted = false; complete = false; processed = 0; active = -1; results = [];
    emit(11, "reset"); repaired = 0; scanStarted = true;
    for (let i = 0; ; i++) {
      emit(12, "next-group"); if (i === groups.length) break;
      ({ rank, count } = groups[i]); active = i;
      emit(13, "add"); const k = capacityAt(mid, rank); repaired += count * k;
      results.push(k); processed++;
    }
    complete = true;
    emit(14, "check");
    if (repaired >= cars) { emit(15, "keep", { nextLo: lo, nextHi: mid }); hi = mid; }
    else { emit(17, "discard", { nextLo: mid + 1, nextHi: hi }); lo = mid + 1; }
  }
  // Final picture and T-1 certificate are explanatory data, not extra solution lines.
  const finalCapacity = capacities(lo), previousCapacity = capacities(lo - 1);
  time = lo; active = -1; processed = groups.length; complete = true;
  results = groups.map(g => capacityAt(lo, g.rank));
  emit(18, "result", { final: true, answer: lo, repaired: finalCapacity, previousCapacity, proofTime: lo - 1 });
  return { original: ranks, answer: lo, steps };
}

module.exports = { 2594: {
  id: 2594, difficulty: "medium", slug: "minimum-time-to-repair-cars",
  category: { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
  title: bi("Minimum Time to Repair Cars", "Minimum Time to Repair Cars"),
  titleVi: bi("Thời gian ít nhất để sửa xe", "Minimum repair time"),
  statement: bi("Thợ rank r sửa k xe mất r × k² phút. Tất cả thợ làm song song. Tìm thời gian ít nhất để sửa đủ cars xe.", "A rank-r mechanic repairs k cars in r × k² minutes. All mechanics work in parallel. Find the minimum time to repair cars vehicles."),
  defaultInput: [4,2,3,1], inputKind: "positive", inputLabel: bi("ranks · mỗi thợ 1–100", "ranks · each mechanic 1–100"),
  extraParams: [{ key: "cars", type: "number", min: 1, max: 1000000, default: 10, label: bi("cars · số xe cần sửa", "cars · cars to repair") }],
  approach: [
    bi("Thử T phút: một thợ rank r sửa được isqrt(T // r) xe.", "Try T minutes: each rank-r mechanic can repair isqrt(T // r) cars."),
    bi("Đủ xe → hi = mid. Thiếu xe → lo = mid + 1.", "Enough cars → hi = mid. Too few → lo = mid + 1."),
    bi("Gộp thợ cùng rank; chỉ kiểm tra tối đa 100 nhóm.", "Group equal ranks; check at most 100 groups."),
  ],
  complexity: { time: "O(n + R log U)", space: "O(R)", note: bi("R ≤ 100 rank khác nhau; U = min(ranks) × cars². Hình lớn rút gọn, giữ đầy đủ trace; ranks không lặp lại trong bảng biến.", "R ≤ 100 distinct ranks; U = min(ranks) × cars². Large pictures are condensed, with every line event retained; ranks stays in the input panel.") },
  code: CODE, debugMode: "line-by-line", builder: buildSteps, parseInput,
  liveArgs: (input, params) => { const { ranks, cars } = parseInput(input, params); return [ranks, cars]; },
} };
