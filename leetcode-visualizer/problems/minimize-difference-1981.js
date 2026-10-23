"use strict";

const bi = (vi, en) => ({ vi, en });

const SOURCE = [
  "class Solution:",
  "    def minimizeTheDifference(self, mat, target):",
  "        sums = {0}",
  "        for row in mat:",
  "            sums = {s + x for s in sums for x in row}",
  "        return min(abs(s - target) for s in sums)",
];

function parseInput(input, params = {}) {
  let matrix;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      matrix = JSON.parse(text);
    } catch {
      throw new Error("1981: Enter a JSON matrix / Nhập ma trận JSON.");
    }
  } else if (Array.isArray(input)) {
    matrix = input;
  } else if (input && typeof input === "object") {
    matrix = input.mat ?? input.matrix;
  }

  const target = Number(params.target ?? input?.target ?? 13);
  const valid = Array.isArray(matrix)
    && matrix.length >= 1 && matrix.length <= 12
    && Array.isArray(matrix[0]) && matrix[0].length >= 1 && matrix[0].length <= 12
    && matrix.every((row) => Array.isArray(row)
      && row.length === matrix[0].length
      && row.every((value) => Number.isInteger(value) && value >= 1 && value <= 70));
  if (!valid || !Number.isInteger(target) || target < 0 || target > 840) {
    throw new Error("1981: Use a 1–12 by 1–12 matrix (values 1–70) and target 0–840 / Ma trận 1–12 hàng, 1–12 cột (giá trị 1–70), target 0–840.");
  }
  return { matrix: matrix.map((row) => [...row]), target };
}

function buildSteps(input, params = {}) {
  const { matrix, target } = parseInput(input, params);
  const steps = [];
  const parentByRow = [];
  let sums = new Set([0]);

  const emit = (phase, rowIndex, before, after, path = null) => {
    const candidates = [...(after || sums)].sort((a, b) => a - b);
    const best = candidates.reduce((bestSoFar, value) => (
      bestSoFar === null
        || Math.abs(value - target) < Math.abs(bestSoFar - target)
        || (Math.abs(value - target) === Math.abs(bestSoFar - target) && value < bestSoFar)
        ? value : bestSoFar
    ), null);
    steps.push({
      arr: [],
      codeLines: [phase === "init" ? 3 : phase === "row" ? 4 : 5],
      title: bi(
        phase === "init" ? "Bắt đầu từ tổng 0" : phase === "done" ? `Gần target nhất: ${best}` : `Thêm hàng ${rowIndex + 1}`,
        phase === "init" ? "Start with sum 0" : phase === "done" ? `Closest to target: ${best}` : `Add row ${rowIndex + 1}`,
      ),
      note: bi(
        phase === "init" ? "" : phase === "done" ? `|${best} − ${target}| = ${Math.abs(best - target)}` : `${before.length} → ${candidates.length} tổng`,
        phase === "init" ? "" : phase === "done" ? `|${best} − ${target}| = ${Math.abs(best - target)}` : `${before.length} → ${candidates.length} sums`,
      ),
      final: phase === "done",
      vars: [
        { name: "row", value: rowIndex < 0 ? "—" : rowIndex + 1 },
        { name: "sums", value: candidates.length },
        { name: "target", value: target },
      ],
      minimizeDifference1981View: {
        phase, rowIndex, matrix, target,
        before: before ? [...before] : [],
        after: candidates,
        best,
        answer: phase === "done" ? Math.abs(best - target) : null,
        path: path || null,
        row: rowIndex >= 0 ? matrix[rowIndex] : [],
      },
    });
  };

  emit("init", -1, [], [0]);
  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
    const before = [...sums].sort((a, b) => a - b);
    const next = new Set();
    const parents = new Map();
    for (const sum of sums) {
      for (const value of matrix[rowIndex]) {
        const candidate = sum + value;
        if (!next.has(candidate)) {
          next.add(candidate);
          parents.set(candidate, sum);
        }
      }
    }
    parentByRow.push(parents);
    sums = next;
    const partialBest = [...sums].reduce((best, value) => (
      Math.abs(value - target) < Math.abs(best - target) ? value : best
    ));
    const partialPath = Array(rowIndex + 1);
    let cursor = partialBest;
    for (let index = rowIndex; index >= 0; index--) {
      const previous = parentByRow[index].get(cursor);
      partialPath[index] = cursor - previous;
      cursor = previous;
    }
    emit("row", rowIndex, before, [...sums], partialPath);
  }

  const answerSum = [...sums].reduce((best, value) => (
    Math.abs(value - target) < Math.abs(best - target)
      || (Math.abs(value - target) === Math.abs(best - target) && value < best) ? value : best
  ));
  const path = Array(matrix.length);
  let sum = answerSum;
  for (let rowIndex = matrix.length - 1; rowIndex >= 0; rowIndex--) {
    const previous = parentByRow[rowIndex].get(sum);
    path[rowIndex] = sum - previous;
    sum = previous;
  }
  emit("done", matrix.length - 1, [...sums], [...sums], path);

  return { original: { matrix, target }, answer: Math.abs(answerSum - target), steps };
}

module.exports = {
  1981: {
    id: 1981,
    slug: "minimize-the-difference-between-target-and-chosen-elements",
    difficulty: "medium",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" },
    tags: [{ key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }, { key: "set", vi: "Tập hợp", en: "Set" }],
    title: bi("Minimize the Difference Between Target and Chosen Elements", "Minimize the Difference Between Target and Chosen Elements"),
    titleVi: bi("Chọn mỗi hàng một số, gần target nhất", "Choose one number per row, closest to target"),
    statement: bi("Chọn đúng 1 số ở mỗi hàng. Tổng nào gần target nhất?", "Choose exactly 1 number from each row. Which sum is closest to target?"),
    defaultInput: "[[1,2,3],[4,5,6],[7,8,9]]",
    inputKind: "string",
    inputLabel: bi("Ma trận JSON", "JSON matrix"),
    extraParams: [{ key: "target", label: bi("target", "target"), default: 13, min: 0, max: 840 }],
    debugMode: "line-by-line",
    approach: [
      bi("Mỗi tổng khả thi là một trạng thái.", "Each reachable sum is a state."),
      bi("Mỗi hàng: cộng từng lựa chọn vào các tổng trước đó.", "For each row, add every choice to each previous sum."),
      bi("Trong các tổng cuối, lấy tổng gần target nhất.", "Pick the final sum closest to target."),
    ],
    complexity: { time: "O(m · n · S)", space: "O(S)", note: bi("S = số tổng khả thi.", "S = number of reachable sums.") },
    code: SOURCE,
    builder: buildSteps,
    liveArgs: (input, params) => {
      const { matrix, target } = parseInput(input, params);
      return [matrix, target];
    },
  },
};
