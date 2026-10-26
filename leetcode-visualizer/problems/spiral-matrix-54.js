"use strict";

const { bi } = require("./hard-viz-shared");
const base = require("./array")[54];
const clone = value => JSON.parse(JSON.stringify(value));
const MAX_SIZE = 20;

function parseSpiral54(input = base.defaultInput) {
  let matrix = input;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      matrix = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.trim()).filter(Boolean)
        .map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    } catch (_) { throw new TypeError("#54: ma trận không hợp lệ / invalid matrix; example: 1,2,3;4,5,6."); }
  }
  const cols = Array.isArray(matrix?.[0]) ? matrix[0].length : 0;
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > MAX_SIZE || !cols || cols > MAX_SIZE
    || !matrix.every(row => Array.isArray(row) && row.length === cols && row.every(value => typeof value === "number" && Number.isFinite(value)))) {
    throw new RangeError("#54: cần ma trận chữ nhật 1–20 hàng/cột, các ô là số hữu hạn / use a rectangular matrix with 1–20 rows/columns of finite numbers.");
  }
  return clone(matrix);
}

function buildSteps54(input) {
  const matrix = parseSpiral54(input), rows = matrix.length, cols = matrix[0].length;
  const state = { matrix }, steps = [], visitedCells = [];
  const captions = {
    init: bi("Khởi tạo", "Initialize"), check: bi("Kiểm tra biên", "Check bounds"),
    select: bi("Chọn ô tiếp theo", "Select next cell"), append: bi("Thêm vào res", "Append to res"),
    shrink: bi("Co vùng đang xử lý", "Shrink the active region"),
    loop: bi("Hết cạnh", "Edge complete"), done: bi("Hoàn tất xoắn ốc", "Spiral complete"),
  };
  function emit(line, phase, direction = null, detail = {}) {
    const locals = clone(state);
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [],
      codeLines: [line], codeBlock: 1, final: phase === "done",
      vars: ["top", "bottom", "left", "right", "r", "c"].map(name => ({ name, value: state[name] ?? "—" })),
      spiral54View: {
        matrix: locals.matrix, rows, cols, phase, direction, locals,
        bounds: Object.fromEntries(["top", "bottom", "left", "right"].map(name => [name, state[name] ?? null])),
        activeCell: detail.activeCell || null, visitedCells: clone(visitedCells), result: [...(state.res || [])],
        remainingCount: rows * cols - visitedCells.length,
        boundaryChange: detail.boundaryChange || null, guard: detail.guard || null,
        source: { line, text: base.code[line - 1], timing: "after" },
      },
    });
  }
  function append(line, direction, row, col) {
    state.res.push(matrix[row][col]);
    visitedCells.push({ row, col, value: matrix[row][col], order: state.res.length, direction });
    emit(line, "append", direction, { activeCell: [row, col] });
  }
  function shrink(line, name, delta) {
    const from = state[name]; state[name] += delta;
    emit(line, "shrink", name, { boundaryChange: { name, from, to: state[name] } });
  }
  function check(line, expression, pass, direction = null) {
    emit(line, "check", direction, { guard: { expression, pass } });
  }
  state.res = []; emit(3, "init");
  state.top = 0; state.bottom = rows - 1; emit(4, "init");
  state.left = 0; state.right = cols - 1; emit(5, "init");
  while (true) {
    const pass = state.top <= state.bottom && state.left <= state.right;
    check(6, "top <= bottom and left <= right", pass);
    if (!pass) break;
    for (let c = state.left; c <= state.right; c++) {
      state.c = c; emit(7, "select", "top", { activeCell: [state.top, c] });
      append(8, "top", state.top, c);
    }
    emit(7, "loop", "top"); shrink(9, "top", 1);
    for (let r = state.top; r <= state.bottom; r++) {
      state.r = r; emit(10, "select", "right", { activeCell: [r, state.right] });
      append(11, "right", r, state.right);
    }
    emit(10, "loop", "right"); shrink(12, "right", -1);
    check(13, "top <= bottom", state.top <= state.bottom, "bottom");
    if (state.top <= state.bottom) {
      for (let c = state.right; c >= state.left; c--) {
        state.c = c; emit(14, "select", "bottom", { activeCell: [state.bottom, c] });
        append(15, "bottom", state.bottom, c);
      }
      emit(14, "loop", "bottom"); shrink(16, "bottom", -1);
    }
    check(17, "left <= right", state.left <= state.right, "left");
    if (state.left <= state.right) {
      for (let r = state.bottom; r >= state.top; r--) {
        state.r = r; emit(18, "select", "left", { activeCell: [r, state.left] });
        append(19, "left", r, state.left);
      }
      emit(18, "loop", "left"); shrink(20, "left", 1);
    }
  }
  emit(21, "done");
  return { original: clone(matrix), answer: [...state.res], steps };
}

module.exports = {
  54: {
    ...base, builder: buildSteps54, debugMode: "line-by-line",
    inputLabel: bi("matrix · hàng cách ; hoặc JSON · tối đa 20 × 20", "matrix · semicolon rows or JSON · up to 20 × 20"),
    approach: [
      bi("→ Hàng trên · ↓ Cột phải · ← Hàng dưới · ↑ Cột trái.", "→ Top row · ↓ Right column · ← Bottom row · ↑ Left column."),
      bi("Xong một cạnh → co biên vào trong. Kiểm tra biên trước hai cạnh cuối để tránh lặp ô.", "Finish an edge → move its bound inward. Check bounds before the last two edges to avoid duplicates."),
    ],
    visualizationLimits: { maxRows: MAX_SIZE, maxCols: MAX_SIZE }, liveArgs: input => [parseSpiral54(input)],
  },
};
