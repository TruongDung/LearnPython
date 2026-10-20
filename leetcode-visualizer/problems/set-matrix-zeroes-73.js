"use strict";
const base = require("./array")[73];
const bi = (vi, en) => ({ vi, en });
const clone = matrix => matrix.map(row => [...row]);
const code = [...base.code.slice(0, -1), "        return"];
const code2 = [...base.code2];
function parse(input) {
  const text = String(input).trim();
  let matrix;
  try { matrix = text.startsWith("[") ? JSON.parse(text) : text.split(/[;|\n]/).map(row => row.split(",").map(cell => cell.trim() === "" ? NaN : Number(cell.trim()))); }
  catch (_) { throw new Error("matrix: ví dụ 1,1,1;1,0,1;1,1,1 hoặc [[1,0],[2,3]]."); }
  if (!Array.isArray(matrix) || !matrix.length || matrix.length > 200 || !Array.isArray(matrix[0]) || !matrix[0].length || matrix[0].length > 200 || !matrix.every(row => Array.isArray(row) && row.length === matrix[0].length && row.every(n => Number.isInteger(n) && n >= -2147483648 && n <= 2147483647))) {
    throw new Error("matrix: ma trận chữ nhật 1–200 hàng/cột, các ô là số nguyên 32-bit.");
  }
  return matrix;
}
function build(input, approach) {
  const original = parse(input), matrix = clone(original), rows = matrix.length, cols = matrix[0].length;
  const detailed = rows <= 6 && cols <= 8, source = approach === 1 ? code : code2;
  const locals = { self: {}, matrix }, steps = [];
  function encode(value) {
    if (value instanceof Set) return [...value].sort((a, b) => a - b);
    if (Array.isArray(value)) return value.map(encode);
    if (value && typeof value === "object") return {};
    return value;
  }
  function emit(line, phase, event, label, info = {}) {
    if (!detailed) return;
    const recorded = Object.fromEntries(Object.entries(locals).map(([key, value]) => [key, encode(value)]));
    const markerRows = approach === 1 ? [...(locals.zero_rows || [])] : matrix.map((row, r) => r > 0 && row[0] === 0 ? r : null).filter(r => r !== null);
    const markerCols = approach === 1 ? [...(locals.zero_cols || [])] : matrix[0].map((value, c) => c > 0 && value === 0 ? c : null).filter(c => c !== null);
    steps.push({ title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`), codeLines: [line], codeBlock: approach,
      arr: [], highlight: [], mark: [], final: phase === "done", note: bi("", ""),
      vars: Object.entries(recorded).map(([name, rawValue]) => ({ name, rawValue, value: name === "self" ? "Solution" : locals[name] instanceof Set ? `{${rawValue.join(", ")}}` : typeof rawValue === "object" ? JSON.stringify(rawValue) : rawValue })),
      matrixZero73View: { mode: "trace", approach, phase, event, line, source: source[line - 1].trim(), original: clone(original), matrix: clone(matrix), rows, cols,
        markerRows, markerCols, firstRow: locals.first_row_has_zero ?? null, firstCol: locals.first_col_has_zero ?? null,
        active: info.active || null, cause: info.cause || null, changed: info.changed || null, decision: info.decision ?? null }
    });
  }
  function loop(name, start, end, line, phase, body) {
    for (let i = start; i < end; i++) {
      locals[name] = i;
      emit(line, phase, "loop", bi(`${name} = ${i}`, `${name} = ${i}`));
      body(i);
    }
    emit(line, phase, "loop-end", bi(`Hết vòng ${name}`, `End ${name} loop`));
  }
  function write(r, c, line, phase, cause = null) {
    const before = matrix[r][c]; matrix[r][c] = 0;
    emit(line, phase, "write", bi(`matrix[${r}][${c}]: ${before} → 0`, `matrix[${r}][${c}]: ${before} → 0`), { active: [r, c], cause, changed: { r, c, before, after: 0 } });
  }
  locals.rows = rows; locals.cols = cols;
  emit(3, approach === 1 ? "scan" : "flags", "size", bi(`${rows} hàng × ${cols} cột`, `${rows} rows × ${cols} columns`));
  if (approach === 1) {
    locals.zero_rows = new Set(); locals.zero_cols = new Set();
    emit(4, "scan", "init", bi("Hai Set rỗng", "Two empty Sets"));
    loop("r", 0, rows, 5, "scan", r => loop("c", 0, cols, 6, "scan", c => {
      const zero = matrix[r][c] === 0;
      emit(7, "scan", "check-zero", bi(`${matrix[r][c]} == 0? ${zero ? "Đúng" : "Sai"}`, `${matrix[r][c]} == 0? ${zero ? "True" : "False"}`), { active: [r, c], decision: zero });
      if (zero) {
        locals.zero_rows.add(r);
        emit(8, "scan", "row-set", bi(`Đánh dấu hàng ${r}`, `Mark row ${r}`), { active: [r, c], cause: [r, c] });
        locals.zero_cols.add(c);
        emit(9, "scan", "col-set", bi(`Đánh dấu cột ${c}`, `Mark column ${c}`), { active: [r, c], cause: [r, c] });
      }
    }));
    loop("r", 0, rows, 10, "apply", r => loop("c", 0, cols, 11, "apply", c => {
      const zero = locals.zero_rows.has(r) || locals.zero_cols.has(c);
      emit(12, "apply", "check-marker", bi(zero ? "Có marker → xóa ô" : "Không có marker → giữ ô", zero ? "Marked → zero cell" : "Unmarked → keep cell"), { active: [r, c], decision: zero });
      if (zero) write(r, c, 13, "apply");
    }));
    emit(14, "done", "return", bi("Xong · matrix đã đổi tại chỗ", "Done · matrix updated in place"));
  } else {
    locals.first_row_has_zero = matrix[0].some(value => value === 0);
    emit(4, "flags", "row-flag", bi(`Hàng đầu có 0? ${locals.first_row_has_zero ? "Có" : "Không"}`, `First row has zero? ${locals.first_row_has_zero ? "Yes" : "No"}`));
    locals.first_col_has_zero = matrix.some(row => row[0] === 0);
    emit(5, "flags", "col-flag", bi(`Cột đầu có 0? ${locals.first_col_has_zero ? "Có" : "Không"}`, `First column has zero? ${locals.first_col_has_zero ? "Yes" : "No"}`));
    loop("r", 1, rows, 7, "mark", r => loop("c", 1, cols, 8, "mark", c => {
      const zero = matrix[r][c] === 0;
      emit(9, "mark", "check-zero", bi(`${matrix[r][c]} == 0? ${zero ? "Đúng" : "Sai"}`, `${matrix[r][c]} == 0? ${zero ? "True" : "False"}`), { active: [r, c], decision: zero });
      if (zero) { write(r, 0, 10, "mark", [r, c]); write(0, c, 11, "mark", [r, c]); }
    }));
    loop("r", 1, rows, 13, "apply", r => loop("c", 1, cols, 14, "apply", c => {
      const zero = matrix[r][0] === 0 || matrix[0][c] === 0;
      emit(15, "apply", "check-marker", bi(zero ? "Có marker → xóa ô" : "Không có marker → giữ ô", zero ? "Marked → zero cell" : "Unmarked → keep cell"), { active: [r, c], decision: zero });
      if (zero) write(r, c, 16, "apply");
    }));
    emit(18, "edges", "check-row-flag", bi(`Xóa hàng đầu? ${locals.first_row_has_zero ? "Có" : "Không"}`, `Zero first row? ${locals.first_row_has_zero ? "Yes" : "No"}`), { decision: locals.first_row_has_zero });
    if (locals.first_row_has_zero) loop("c", 0, cols, 19, "edges", c => write(0, c, 20, "edges"));
    emit(22, "edges", "check-col-flag", bi(`Xóa cột đầu? ${locals.first_col_has_zero ? "Có" : "Không"}`, `Zero first column? ${locals.first_col_has_zero ? "Yes" : "No"}`), { decision: locals.first_col_has_zero });
    if (locals.first_col_has_zero) loop("r", 0, rows, 23, "edges", r => write(r, 0, 24, "edges"));
    emit(25, "done", "return", bi("Xong · matrix đã đổi tại chỗ", "Done · matrix updated in place"));
  }
  if (!detailed) steps.push({ title: bi("Ma trận kết quả", "Result matrix"), codeLines: [], codeBlock: approach, final: true, vars: [], note: bi("", ""), arr: [], highlight: [], mark: [],
    matrixZero73View: { mode: "summary", approach, phase: "done", event: "return", line: null, source: "", rows, cols,
      original: original.slice(0, 6).map(row => row.slice(0, 8)), matrix: matrix.slice(0, 6).map(row => row.slice(0, 8)), markerRows: [], markerCols: [],
      firstRow: null, firstCol: null, active: null, cause: null, changed: null, decision: null }
  });
  return { original, answer: matrix, steps };
}
module.exports = { 73: { ...base, code, code2, debugMode: "line-by-line", builder: input => build(input, 1), builder2: input => build(input, 2), parseMatrixZero73: parse,
  titleVi: bi("Một ô 0 → cả hàng và cột thành 0", "One zero → zero its row and column"),
  statement: bi("Chỉ các số 0 ban đầu tạo hàng/cột cần xóa. Đánh dấu trước, đổi matrix sau.", "Only original zeroes identify rows and columns to clear. Mark first, update matrix second."),
  approach: [bi("Cách 1: lưu hàng/cột trong hai Set", "Approach 1: remember rows/columns in two Sets"), bi("Cách 2: mượn hàng/cột đầu làm marker · xóa mép cuối cùng", "Approach 2: reuse the first row/column as markers · clear edges last")],
  complexity: { time: "O(m·n)", space: "O(m+n) / O(1)", note: bi("Cách 1 / Cách 2. Debug đầy đủ với ≤6 hàng × 8 cột; ma trận lớn vẫn tính đủ, hình chỉ xem trước.", "Approach 1 / Approach 2. Full debug for ≤6 rows × 8 columns; larger matrices compute the full result with a picture preview.") },
  liveArgs: input => [parse(input)]
} };
