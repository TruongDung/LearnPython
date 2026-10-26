"use strict";

const base = require("./interview")[9008];
const { bi, copy, integer, heapify, heapPop, heapPush } = require("./picture-study-shared");
const watches = ["k", "value", "r", "c", "len(heap)", "len(answer)"];

function parse(input, params = {}) {
  let rows = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { rows = JSON.parse(text); } catch (_) { throw new TypeError("#9008: JSON không hợp lệ / invalid JSON."); }
    } else rows = text.split(/[;\n]/).map(row => row.split(","));
  }
  if (!Array.isArray(rows) || !rows.length || rows.length > 12) throw new RangeError("#9008: 1–12 hàng / rows.");
  const matrix = rows.map(row => {
    if (!Array.isArray(row) || !row.length || row.length > 16) throw new RangeError("#9008: 1–16 số mỗi hàng / numbers per row.");
    const values = row.map(raw => {
      const value = typeof raw === "number" || typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
      if (!Number.isFinite(value) || Math.abs(value) > 1e9) throw new TypeError("#9008: cần số trong ±10⁹ / use numbers within ±10⁹.");
      return value === 0 ? 0 : value;
    });
    if (values.some((value, i) => i && value < values[i - 1])) throw new RangeError("#9008: mỗi hàng phải tăng dần / each row must be sorted.");
    return values;
  });
  const total = matrix.reduce((sum, row) => sum + row.length, 0);
  return { matrix, k: integer(params.k ?? 5, 1, total, "k"), total };
}

function builder(input, params) {
  const { matrix, k, total } = parse(input, params), heap = [], answer = [], taken = [], steps = [];
  let value, r, c, iteration, heapReady = false, answerReady = false;
  const emit = (line, phase, action = null, final = false) => {
    const values = { k, value, r, c, "len(heap)": heap.length, "len(answer)": answerReady ? answer.length : null };
    steps.push({ title: bi(phase), note: bi(""), arr: [], highlight: [], mark: [], codeBlock: 1, codeLines: [line], final,
      vars: watches.map(name => ({ name, value: values[name] ?? "—" })),
      matrixMerge9008View: copy({ matrix, k, total, heap, heapReady, answer, answerReady, taken, value, r, c, iteration, line, phase, action, final }) });
  };
  matrix.forEach((row, rowIndex) => heap.push([row[0], rowIndex, 0])); emit(4, "seed");
  heapify(heap); heapReady = true; emit(5, "heapify");
  answerReady = true; emit(6, "initialize");
  for (let i = 0; i < k; i++) {
    iteration = i; emit(7, "loop");
    [value, r, c] = heapPop(heap); emit(8, "pop", { kind: "pop", value, r, c });
    answer.push(value); taken.push({ value, r, c }); emit(9, "append", { kind: "append", value, r, c });
    const pass = c + 1 < matrix[r].length;
    emit(10, "check", { kind: "check", r, c: c + 1, pass });
    if (pass) {
      const next = [matrix[r][c + 1], r, c + 1]; heapPush(heap, next);
      emit(11, "push", { kind: "push", value: next[0], r, c: c + 1 });
    }
  }
  emit(7, "stop"); emit(12, "return", null, true);
  return { original: matrix, answer, steps };
}

module.exports = { 9008: { ...base, builder, debugMode: "line-by-line",
  liveArgs: (input, params) => { const { matrix, k } = parse(input, params); return [matrix, k]; },
  inputLabel: bi("Các hàng tăng dần (; ngăn hàng) · tối đa 12 hàng × 16 số", "Sorted rows (; separates rows) · up to 12 rows × 16 numbers"),
  extraParams: [{ ...base.extraParams[0], max: 192 }],
  complexity: { time: "O(rows + k log(rows+1))", space: "O(rows + k)",
    note: bi("Heap: O(rows) · kết quả: O(k). Chỉ cần từng hàng tăng dần.", "Heap: O(rows) · output: O(k). Only the rows need to be sorted.") } } };
