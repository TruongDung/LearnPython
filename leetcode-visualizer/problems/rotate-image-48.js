"use strict";

const { bi, parsePlainParams, parseInteger } = require("./hard-viz-shared");
const base = require("./array")[48];
const clone = matrix => matrix.map(row => [...row]);
const SOURCE = Object.freeze([...base.code, "        return"]);
const SOURCE2 = Object.freeze([...base.code2, "        return"]);
const MAX_N = 20;

function parseRotate48(input = base.defaultInput) {
  let matrix = input;
  if (typeof input === "string") {
    const text = input.trim();
    try {
      matrix = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.trim()).filter(Boolean)
        .map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    } catch (_) { throw new TypeError("#48: ma trận không hợp lệ / invalid matrix; example: 1,2;3,4."); }
  }
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > MAX_N || !matrix.every(row => Array.isArray(row) && row.length === matrix.length && row.every(value => typeof value === "number" && Number.isFinite(value)))) {
    throw new RangeError(`#48: cần ma trận vuông 1–${MAX_N}, các ô là số hữu hạn / use a square 1–${MAX_N} matrix of finite numbers.`);
  }
  return clone(matrix);
}

function buildSteps48(input, params = {}) {
  const options = parsePlainParams(params, 48);
  const approach = parseInteger(options.approach ?? 1, { problemId: 48, name: "approach", min: 1, max: 2 });
  const matrix = parseRotate48(input), original = clone(matrix), n = matrix.length;
  const ids = matrix.map((row, r) => row.map((_, c) => r * n + c));
  const state = { matrix }, steps = [], reversedRows = [];
  const source = approach === 1 ? SOURCE : SOURCE2;
  let stage = "transpose", transposeSwaps = 0, transposed = null, rowIndex = null;
  const captions = {
    init: bi("Kích thước ma trận", "Matrix size"), row: bi("Chọn hàng", "Select a row"),
    pair: bi("Chọn cặp ô", "Select a cell pair"), swap: bi("Đổi chỗ hai ô", "Swap the cells"),
    "transpose-done": bi("Chuyển vị xong", "Transpose complete"),
    reverse: bi("Đảo trái ↔ phải", "Reverse left ↔ right"),
    loop: bi("Hết vòng lặp", "Loop complete"), done: bi("Xoay 90° hoàn tất", "90° rotation complete"),
  };
  function emit(line, phase, equation, detail = {}) {
    const locals = JSON.parse(JSON.stringify(state));
    const mirror = state.j === undefined ? undefined : n - 1 - state.j;
    const watches = [
      { name: "n", value: state.n }, { name: "i", value: state.i ?? "—" }, { name: "j", value: state.j ?? "—" },
      ...(approach === 1 ? [{ name: "row", value: state.row ? `[${state.row.join(", ")}]` : "—" }]
        : [{ name: "n - 1 - j", value: mirror ?? "—" }]),
    ];
    steps.push({
      title: captions[phase], note: bi("", ""), arr: [], highlight: [], mark: [],
      codeBlock: approach, codeLines: [line], final: phase === "done", vars: watches,
      rotate48View: {
        original, matrix: locals.matrix, ids: clone(ids), n, approach, stage, phase, equation,
        source: { line, text: source[line - 1], timing: "after" }, locals,
        activeCells: (detail.activeCells || []).map(cell => [...cell]), activeRow: rowIndex,
        swap: detail.swap ? JSON.parse(JSON.stringify(detail.swap)) : null,
        transposeSwaps, totalTransposeSwaps: n * (n - 1) / 2,
        reversedRows: [...reversedRows], transposed,
      },
    });
  }
  state.n = n; emit(3, "init", `n = ${n}`);
  for (let i = 0; i < n; i++) {
    state.i = i; emit(4, "row", `i = ${i}`);
    for (let j = i + 1; j < n; j++) {
      state.j = j;
      const a = [i, j], b = [j, i];
      emit(5, "pair", `(${i},${j}) ↔ (${j},${i})`, { activeCells: [a, b] });
      const before = [matrix[i][j], matrix[j][i]];
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
      [ids[i][j], ids[j][i]] = [ids[j][i], ids[i][j]];
      transposeSwaps++;
      emit(6, "swap", `${before[0]} ↔ ${before[1]}`, { activeCells: [a, b], swap: { kind: "transpose", a, b, before, after: [matrix[i][j], matrix[j][i]] } });
    }
    emit(5, "loop", "j ✓");
  }
  transposed = clone(matrix);
  emit(4, "transpose-done", "(r,c) → (c,r)");
  stage = "reverse";
  if (approach === 1) {
    for (let r = 0; r < n; r++) {
      rowIndex = r; state.row = matrix[r];
      emit(7, "row", `row = matrix[${r}]`);
      const beforeRow = [...matrix[r]];
      matrix[r].reverse(); ids[r].reverse(); reversedRows.push(r);
      emit(8, "reverse", "row.reverse()", { activeCells: matrix[r].map((_, c) => [r, c]), swap: { kind: "row-reverse", row: r, beforeRow, afterRow: [...matrix[r]] } });
    }
    rowIndex = null; emit(7, "loop", "row ✓");
  } else {
    for (let i = 0; i < n; i++) {
      state.i = i; rowIndex = i; emit(7, "row", `i = ${i}`);
      for (let j = 0; j < Math.floor(n / 2); j++) {
        state.j = j;
        const right = n - 1 - j, a = [i, j], b = [i, right];
        emit(8, "pair", `(${i},${j}) ↔ (${i},${right})`, { activeCells: [a, b] });
        const before = [matrix[i][j], matrix[i][right]];
        [matrix[i][j], matrix[i][right]] = [matrix[i][right], matrix[i][j]];
        [ids[i][j], ids[i][right]] = [ids[i][right], ids[i][j]];
        if (j === Math.floor(n / 2) - 1) reversedRows.push(i);
        emit(9, "swap", `${before[0]} ↔ ${before[1]}`, { activeCells: [a, b], swap: { kind: "reverse", a, b, before, after: [matrix[i][j], matrix[i][right]] } });
      }
      if (n === 1) reversedRows.push(i);
      emit(8, "loop", "j ✓");
    }
    rowIndex = null; emit(7, "loop", "i ✓");
  }
  stage = "done";
  emit(source.length, "done", "(r,c) → (c,n−1−r)");
  return { original: clone(original), answer: clone(matrix), steps };
}

module.exports = {
  48: {
    ...base, code: SOURCE, code2: SOURCE2, debugMode: "line-by-line", builder: buildSteps48,
    inputLabel: bi("matrix · hàng cách ; hoặc JSON · tối đa 20 × 20", "matrix · semicolon rows or JSON · up to 20 × 20"),
    approach: [
      bi("Chuyển vị: (r,c) ↔ (c,r).", "Transpose: (r,c) ↔ (c,r)."),
      bi("Đảo trái–phải từng hàng → xoay 90° theo chiều kim đồng hồ.", "Reverse each row → rotate 90° clockwise."),
      bi("Chọn một ô để theo dõi vị trí của nó.", "Select a cell to follow its position."),
    ],
    visualizationLimits: { maxN: MAX_N }, liveArgs: input => [parseRotate48(input)],
  },
};
