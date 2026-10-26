"use strict";

const { bi, parsePlainParams, parseInteger } = require("./hard-viz-shared");
const base = require("./array")[240];
const copy = matrix => matrix.map(row => [...row]);
const MAX_SIZE = 100;

function parseSearch240(input = base.defaultInput, params = {}) {
  const options = parsePlainParams(params, 240);
  const target = parseInteger(options.target === undefined ? 5 : options.target, { problemId: 240, name: "target" });
  let matrix = input;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      matrix = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.trim()).filter(Boolean)
        .map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    } catch (_) { throw new TypeError("#240: ma trận không hợp lệ / invalid matrix; example: 1,4;2,5."); }
  }
  const cols = Array.isArray(matrix?.[0]) ? matrix[0].length : 0;
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > MAX_SIZE || !cols || cols > MAX_SIZE
    || !Array.from(matrix).every(row => Array.isArray(row) && row.length === cols && Array.from(row).every(Number.isSafeInteger))) {
    throw new RangeError("#240: cần ma trận chữ nhật 1–100 hàng/cột, các ô là số nguyên an toàn / use a rectangular matrix with 1–100 rows/columns of safe integers.");
  }
  if (matrix.some((row, r) => row.some((value, c) => c > 0 && value < row[c - 1] || r > 0 && value < matrix[r - 1][c]))) {
    throw new RangeError("#240: mỗi hàng và mỗi cột phải tăng không giảm / matrix rows and columns must be sorted in nondecreasing order.");
  }
  return { matrix: copy(matrix), target };
}

function buildSteps240(input, params) {
  const parsed = parseSearch240(input, params), target = parsed.target;
  // The algorithm never edits matrix; immutable rows can be shared by all frames.
  const matrix = Object.freeze(parsed.matrix.map(row => Object.freeze(row)));
  const rows = matrix.length, cols = matrix[0].length, state = { target };
  const steps = [], path = [], eliminatedRows = [], eliminatedCols = [];
  let lastMove = null;
  const captions = {
    guard: bi("Ma trận hợp lệ", "Matrix is valid"), init: bi("Bắt đầu ở góc trên-phải", "Start at the top-right corner"),
    loop: bi("Kiểm tra vị trí", "Check the position"), read: bi("Đọc ô đang xét", "Read the current cell"),
    compare: bi("So với target", "Compare with target"), "move-left": bi("Đi trái · loại cột", "Move left · drop column"),
    "move-down": bi("Đi xuống · loại hàng", "Move down · drop row"),
    found: bi("Tìm thấy target", "Target found"), missing: bi("Không tìm thấy target", "Target not found"),
  };
  function emit(line, phase, decision, detail = {}) {
    const row = state.row ?? null, col = state.col ?? null;
    const pointer = row !== null && row < rows && col >= 0 ? [row, col] : null;
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [],
      codeLines: [line], codeBlock: 1, final: phase === "found" || phase === "missing",
      vars: ["row", "col", "value", "target"].map(name => ({ name, value: state[name] ?? "—" })),
      search240View: {
        matrix, rows, cols, target, row, col, value: state.value ?? null, pointer, activeCell: pointer,
        readCell: path.length ? [...path.at(-1)] : null, previousCell: detail.previousCell || null,
        path: path.map(cell => [...cell]), eliminatedRows: [...eliminatedRows], eliminatedCols: [...eliminatedCols],
        candidates: row === null ? rows * cols : Math.max(0, rows - row) * Math.max(0, col + 1),
        phase, decision: { ...decision }, drop: detail.drop || null,
        lastMove: lastMove ? { from: [...lastMove.from], to: [...lastMove.to] } : null,
        source: { line, text: base.code[line - 1], timing: "after" }, locals: { matrix, ...state },
      },
    });
  }
  function strip(kind, row, col, applied) {
    return { kind, index: kind === "col" ? col : row, applied,
      cells: kind === "col" ? Array.from({ length: rows - row }, (_, i) => [row + i, col])
        : Array.from({ length: col + 1 }, (_, c) => [row, c]) };
  }
  emit(3, "guard", { kind: "guard", passed: true });
  state.row = 0; state.col = cols - 1; emit(5, "init", { kind: "init" });
  while (true) {
    const inBounds = state.row < rows && state.col >= 0;
    emit(6, "loop", { kind: "bounds", inBounds });
    if (!inBounds) break;
    state.value = matrix[state.row][state.col]; path.push([state.row, state.col]);
    emit(7, "read", { kind: "read" });
    const equal = state.value === target;
    emit(8, "compare", { kind: "equal", result: equal });
    if (equal) {
      emit(9, "found", { kind: "found" });
      return { original: copy(matrix), answer: true, steps };
    }
    const greater = state.value > target;
    emit(10, "compare", { kind: "greater", result: greater }, { drop: strip(greater ? "col" : "row", state.row, state.col, false) });
    const previousCell = [state.row, state.col], drop = strip(greater ? "col" : "row", state.row, state.col, true);
    if (greater) {
      eliminatedCols.push(state.col); state.col--;
      lastMove = { from: previousCell, to: [state.row, state.col] };
      emit(11, "move-left", { kind: "move-left", eliminatedCol: drop.index }, { previousCell, drop });
    } else {
      eliminatedRows.push(state.row); state.row++;
      lastMove = { from: previousCell, to: [state.row, state.col] };
      emit(13, "move-down", { kind: "move-down", eliminatedRow: drop.index }, { previousCell, drop });
    }
  }
  emit(14, "missing", { kind: "missing" });
  return { original: copy(matrix), answer: false, steps };
}

module.exports = {
  240: {
    ...base, builder: buildSteps240,
    inputLabel: bi("matrix · hàng/cột tăng không giảm · hàng cách ; hoặc JSON · tối đa 100 × 100", "matrix · sorted rows/columns · semicolon rows or JSON · up to 100 × 100"),
    approach: [
      bi("Bắt đầu ở góc trên-phải. value > target → ← loại cột.", "Start at the top-right. value > target → ← drop the column."),
      bi("value < target → ↓ loại hàng. value == target → ✓.", "value < target → ↓ drop the row. value == target → ✓."),
    ],
    visualizationLimits: { maxRows: MAX_SIZE, maxCols: MAX_SIZE },
    liveArgs: (input, params) => { const { matrix, target } = parseSearch240(input, params); return [matrix, target]; },
  },
};
