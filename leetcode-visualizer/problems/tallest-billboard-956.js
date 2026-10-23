"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def tallestBillboard(self, rods):",
  "        dp = {0: 0}",
  "        for rod in rods:",
  "            next_dp = dp.copy()",
  "            for diff, short in dp.items():",
  "                next_dp[diff + rod] = max(next_dp.get(diff + rod, 0), short)",
  "                new_diff = abs(diff - rod)",
  "                new_short = short + min(diff, rod)",
  "                next_dp[new_diff] = max(next_dp.get(new_diff, 0), new_short)",
  "            dp = next_dp",
  "        return dp[0]",
];

function parseRods(input) {
  let rods = input;
  if (typeof input === "string") rods = input.trim().split(/[\s,;]+/).filter(Boolean).map(Number);
  if (input && !Array.isArray(input) && typeof input === "object") rods = input.rods;
  if (!Array.isArray(rods) || rods.length < 1 || rods.length > 8
    || rods.some((rod) => !Number.isInteger(rod) || rod < 1 || rod > 20)
    || rods.reduce((sum, rod) => sum + rod, 0) > 60) {
    throw new Error("956: Use 1–8 rods (1–20 each, total ≤ 60) / Nhập 1–8 thanh (mỗi thanh 1–20, tổng ≤ 60).");
  }
  return [...rods];
}

function buildSteps(input) {
  const rods = parseRods(input);
  const total = rods.reduce((sum, rod) => sum + rod, 0);
  const steps = [];
  let dp = null;
  let rodIndex = null;
  let rod = null;
  let currentDiff = null;
  let currentShort = null;
  let nextDiff = null;
  let nextShort = null;
  let preview = { diff: 0, short: 0, leftMask: 0, rightMask: 0 };
  let answer = null;
  let before = new Map();
  let after = new Map();

  const stateRows = (map) => [...(map || new Map())]
    .map(([diff, state]) => ({ diff, ...state }))
    .sort((a, b) => a.diff - b.diff);
  const titleFor = (event) => ({
    start: bi("Bắt đầu", "Start"),
    seed: bi("Chênh lệch 0", "Gap 0"),
    rod: bi(`Lấy thanh ${rod}`, `Pick rod ${rod}`),
    copy: bi("Giữ nguyên (bỏ qua)", "Keep state (skip)"),
    pair: bi(`Xét Δ${currentDiff}`, `Check Δ${currentDiff}`),
    taller: bi(`Thêm ${rod} vào cột cao`, `Add ${rod} to taller side`),
    gap: bi(`Tính |${currentDiff} − ${rod}|`, `Compute |${currentDiff} − ${rod}|`),
    shorter: bi(`Cột thấp + ${Math.min(currentDiff ?? 0, rod ?? 0)}`, `Short side + ${Math.min(currentDiff ?? 0, rod ?? 0)}`),
    place: bi(`Cập nhật Δ${nextDiff}`, `Update Δ${nextDiff}`),
    commit: bi("Xong thanh này", "Finish this rod"),
    done: bi(`Hai cột cao ${answer}`, `Two sides, height ${answer}`),
  }[event]);

  function emit(line, event, options = {}) {
    const source = options.source || null;
    const output = options.output || null;
    const d = currentDiff;
    const short = currentShort;
    const afterRows = stateRows(after);
    const beforeRows = stateRows(before);
    const view = {
      event, rods: [...rods], total, rodIndex, rod, processedCount: rodIndex === null ? 0 : rodIndex + 1,
      currentDiff: d, currentShort: short, nextDiff, nextShort,
      before: beforeRows, after: afterRows, preview: { ...preview }, source: source ? { ...source } : null,
      output: output ? { ...output } : null, answer,
      selected: dp?.get(0) ? { ...dp.get(0) } : null,
    };
    steps.push({
      title: titleFor(event),
      note: bi("", ""),
      arr: [...rods],
      highlight: Number.isInteger(rodIndex) ? [rodIndex] : [],
      mark: [],
      codeLines: [line],
      final: event === "done",
      vars: [
        { name: "rod", value: rod ?? "—" },
        { name: "diff", value: d ?? "—" },
        { name: "short", value: short ?? "—" },
        { name: "next_diff", value: nextDiff ?? "—" },
        { name: "answer", value: answer ?? "—" },
      ],
      tallestBillboard956View: view,
    });
  }

  emit(2, "start");
  dp = new Map([[0, { short: 0, leftMask: 0, rightMask: 0 }]]);
  before = new Map();
  after = dp;
  preview = dp.get(0);
  emit(3, "seed");

  rods.forEach((value, index) => {
    rodIndex = index;
    rod = value;
    currentDiff = null;
    currentShort = null;
    nextDiff = null;
    nextShort = null;
    before = dp;
    after = dp;
    preview = dp.get(0) || preview;
    emit(4, "rod");

    const next = new Map(dp);
    before = dp;
    after = next;
    emit(5, "copy");

    for (const [diff, state] of [...dp].sort((a, b) => a[0] - b[0])) {
      currentDiff = diff;
      currentShort = state.short;
      nextDiff = null;
      nextShort = null;
      before = dp;
      after = next;
      preview = state;
      emit(6, "pair", { source: state });

      nextDiff = diff + rod;
      nextShort = state.short;
      const tallerCandidate = {
        short: state.short,
        leftMask: state.leftMask | (1 << index),
        rightMask: state.rightMask,
      };
      if (!next.has(nextDiff) || tallerCandidate.short > next.get(nextDiff).short) {
        next.set(nextDiff, tallerCandidate);
      }
      before = dp;
      after = next;
      preview = tallerCandidate;
      emit(7, "taller", { source: state, output: tallerCandidate });

      nextDiff = Math.abs(diff - rod);
      before = dp;
      after = next;
      preview = state;
      emit(8, "gap", { source: state, diff: nextDiff, short: state.short });

      nextShort = state.short + Math.min(diff, rod);
      let shorterCandidate;
      if (rod <= diff) {
        shorterCandidate = {
          short: nextShort,
          leftMask: state.leftMask,
          rightMask: state.rightMask | (1 << index),
        };
      } else {
        shorterCandidate = {
          short: nextShort,
          leftMask: state.rightMask | (1 << index),
          rightMask: state.leftMask,
        };
      }
      before = dp;
      after = next;
      preview = shorterCandidate;
      emit(9, "shorter", { source: state, output: shorterCandidate, diff: nextDiff, short: nextShort });

      if (!next.has(nextDiff) || shorterCandidate.short > next.get(nextDiff).short) {
        next.set(nextDiff, shorterCandidate);
      }
      before = dp;
      after = next;
      preview = shorterCandidate;
      emit(10, "place", { source: state, output: shorterCandidate, diff: nextDiff, short: nextShort });
    }

    before = dp;
    dp = next;
    after = dp;
    currentDiff = null;
    currentShort = null;
    nextDiff = null;
    nextShort = null;
    preview = dp.get(0) || preview;
    emit(11, "commit");
  });

  answer = dp.get(0)?.short ?? 0;
  currentDiff = 0;
  currentShort = answer;
  before = dp;
  after = dp;
  const balanced = dp.get(0) || { short: answer, leftMask: 0, rightMask: 0 };
  preview = { diff: 0, ...balanced };
  emit(12, "done", { diff: 0, short: answer });
  return { original: rods, answer, steps };
}

module.exports = {
  956: {
    id: 956,
    slug: "tallest-billboard",
    difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [
      { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "state-compression", vi: "Nén trạng thái", en: "State compression" },
    ],
    title: bi("Tallest Billboard", "Tallest Billboard"),
    titleVi: bi("Dựng biển quảng cáo cao nhất", "Build the tallest billboard"),
    statement: bi("Chọn các thanh để dựng hai cột cao bằng nhau, sao cho cột cao nhất có thể.", "Choose rods to build two equal-height supports as tall as possible."),
    defaultInput: [1, 2, 3, 6],
    inputKind: "positive",
    inputLabel: bi("Độ dài các thanh", "Rod lengths"),
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi trạng thái lưu chênh lệch Δ và cột thấp.", "Each state stores gap Δ and the shorter side."),
      bi("Mỗi thanh: bỏ qua, thêm vào cột cao hoặc cột thấp.", "For each rod: skip, add to the taller or shorter side."),
    ],
    complexity: { time: "O(n · sum(rods))", space: "O(sum(rods))", note: bi("Giới hạn hình minh họa: tổng thanh ≤ 60.", "Visualization limit: total rod length ≤ 60.") },
    code: CODE,
    builder: buildSteps,
    liveArgs: (input) => [parseRods(input)],
  },
};
