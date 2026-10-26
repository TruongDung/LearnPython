"use strict";

const { bi, parsePlainParams, parseInteger } = require("./hard-viz-shared");
const base = require("./array")[74];
const clone = value => JSON.parse(JSON.stringify(value));
const MAX_SIZE = 100;

function parseSearch74(input = base.defaultInput, params = {}) {
  const options = parsePlainParams(params, 74);
  const target = parseInteger(options.target === undefined ? 3 : options.target, { problemId: 74, name: "target" });
  let matrix = input;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      matrix = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.trim()).filter(Boolean)
        .map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    } catch (_) { throw new TypeError("#74: ma trận không hợp lệ / invalid matrix; example: 1,3;5,7."); }
  }
  const cols = Array.isArray(matrix?.[0]) ? matrix[0].length : 0;
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > MAX_SIZE || !cols || cols > MAX_SIZE
    || !Array.from(matrix).every(row => Array.isArray(row) && row.length === cols && Array.from(row).every(Number.isSafeInteger))) {
    throw new RangeError("#74: cần ma trận chữ nhật 1–100 hàng/cột, các ô là số nguyên an toàn / use a rectangular matrix with 1–100 rows/columns of safe integers.");
  }
  if (matrix.some((row, r) => row.some((value, c) => c > 0 && value < row[c - 1]) || r > 0 && row[0] <= matrix[r - 1][cols - 1])) {
    throw new RangeError("#74: mỗi hàng phải tăng không giảm; đầu hàng sau phải lớn hơn cuối hàng trước / rows must be nondecreasing and each row must start above the previous row's last value.");
  }
  return { matrix: clone(matrix), target };
}

function buildSteps74(input, params) {
  const { matrix, target } = parseSearch74(input, params), rows = matrix.length, cols = matrix[0].length;
  const state = { matrix, target }, steps = [], inspected = [];
  let lastReadIndex = null;
  const captions = {
    init: bi("Ma trận → chỉ số phẳng", "Matrix → flat indexes"), range: bi("Kiểm tra khoảng tìm kiếm", "Check the search range"),
    mid: bi("Chọn chỉ số giữa", "Pick the middle index"), read: bi("Đổi chỉ số → đọc ô", "Map the index → read the cell"),
    "check-equal": bi("Có bằng target?", "Equal to target?"), "check-less": bi("Có nhỏ hơn target?", "Less than target?"),
    "move-left": bi("Giữ nửa trái", "Keep the left half"), "move-right": bi("Giữ nửa phải", "Keep the right half"),
    found: bi("Tìm thấy target", "Target found"), missing: bi("Không tìm thấy target", "Target not found"),
  };
  function emit(line, phase, detail = {}) {
    const locals = clone(state), mid = state.mid ?? null;
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [],
      codeLines: [line], codeBlock: 1, final: phase === "found" || phase === "missing",
      vars: ["target", "lo", "hi", "mid", "value"].map(name => ({ name, value: state[name] ?? "—" })),
      search74View: {
        matrix: locals.matrix, rows, cols, total: rows * cols, target,
        lo: state.lo ?? null, hi: state.hi ?? null, mid, value: state.value ?? null,
        activeCell: mid === null ? null : [Math.floor(mid / cols), mid % cols],
        lastReadIndex, inspected: clone(inspected), phase, locals,
        remaining: state.lo === undefined ? rows * cols : Math.max(0, state.hi - state.lo + 1),
        comparison: detail.comparison || null, removed: detail.removed || null,
        guard: detail.guard ?? null, source: { line, text: base.code[line - 1], timing: "after" },
      },
    });
  }
  state.rows = rows; state.cols = cols; emit(3, "init");
  state.lo = 0; state.hi = rows * cols - 1; emit(4, "init");
  while (true) {
    const pass = state.lo <= state.hi;
    emit(5, "range", { guard: pass });
    if (!pass) break;
    state.mid = Math.floor((state.lo + state.hi) / 2); emit(6, "mid");
    state.value = matrix[Math.floor(state.mid / cols)][state.mid % cols];
    lastReadIndex = state.mid;
    inspected.push({ index: state.mid, row: Math.floor(state.mid / cols), col: state.mid % cols, value: state.value });
    emit(7, "read");
    emit(8, "check-equal", { comparison: { left: state.value, operator: "==", right: target, pass: state.value === target } });
    if (state.value === target) {
      emit(9, "found");
      return { original: clone(matrix), answer: true, steps };
    }
    emit(10, "check-less", { comparison: { left: state.value, operator: "<", right: target, pass: state.value < target } });
    const before = [state.lo, state.hi];
    if (state.value < target) {
      state.lo = state.mid + 1;
      emit(11, "move-right", { removed: { from: before[0], to: state.mid, side: "left", before, after: [state.lo, state.hi] } });
    } else {
      state.hi = state.mid - 1;
      emit(13, "move-left", { removed: { from: state.mid, to: before[1], side: "right", before, after: [state.lo, state.hi] } });
    }
  }
  emit(14, "missing");
  return { original: clone(matrix), answer: false, steps };
}

module.exports = {
  74: {
    ...base, builder: buildSteps74, debugMode: "line-by-line",
    inputLabel: bi("matrix đã sắp xếp · hàng cách ; hoặc JSON · tối đa 100 × 100", "sorted matrix · semicolon rows or JSON · up to 100 × 100"),
    approach: [
      bi("Ma trận → dải chỉ số 0 … rows × cols − 1.", "Matrix → index range 0 … rows × cols − 1."),
      bi("mid → (mid // cols, mid % cols). So sánh với target → giữ một nửa.", "mid → (mid // cols, mid % cols). Compare with target → keep one half."),
    ],
    visualizationLimits: { maxRows: MAX_SIZE, maxCols: MAX_SIZE },
    liveArgs: (input, params) => { const { matrix, target } = parseSearch74(input, params); return [matrix, target]; },
  },
};
