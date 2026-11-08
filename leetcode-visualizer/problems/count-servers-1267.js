"use strict";

const { runTrace } = require("./wasm-picture-trace");
const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def countServers(self, grid):",
  "        rows, cols = len(grid), len(grid[0])",
  "        row_count = [0] * rows",
  "        col_count = [0] * cols",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                if grid[r][c] == 1:",
  "                    row_count[r] += 1",
  "                    col_count[c] += 1",
  "",
  "        answer = 0",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                if grid[r][c] == 1:",
  "                    shares_row = row_count[r] > 1",
  "                    shares_col = col_count[c] > 1",
  "                    if shares_row or shares_col:",
  "                        answer += 1",
  "        return answer",
];

function parse(input) {
  let grid = input;
  if (typeof grid === "string") {
    const text = grid.trim();
    try {
      grid = text.startsWith("[") ? JSON.parse(text) : text.split(/[|;\n]/).map(row => {
        const trimmed = row.trim();
        const cells = trimmed.includes(",") ? trimmed.split(",") : /^[01]+$/.test(trimmed) ? [...trimmed] : trimmed.split(/\s+/);
        return cells.map(cell => cell.trim() === "" ? NaN : Number(cell.trim()));
      });
    } catch { grid = null; }
  }
  if (!Array.isArray(grid) || !grid.length || grid.length > 250 || !Array.isArray(grid[0]) || !grid[0].length || grid[0].length > 250
    || !Array.from(grid).every(row => Array.isArray(row) && row.length === grid[0].length && Array.from(row).every(cell => cell === 0 || cell === 1))) {
    throw new RangeError("grid: ma trận chữ nhật 1–250 hàng/cột, chỉ gồm 0/1 / use a nonempty rectangular 0/1 grid, at most 250 × 250");
  }
  return grid.map(row => [...row]);
}

function builder(input) {
  const grid = parse(input), rows = grid.length, cols = grid[0].length;
  const detailed = rows <= 8 && cols <= 8;
  const payload = { code: CODE.join("\n"), method: "countServers", args: [grid], summarizeLocals: { grid: 0 }, ...(!detailed ? { maxEvents: 1600 } : {}) };
  const trace = runTrace(payload), accepted = new Set(), isolated = new Set();
  let focus = null, active = null, scanned = -1, checks = { row: null, col: null, pass: null }, previous = null;
  const steps = trace.events.map(record => {
    const x = record.locals, line = record.line;
    const phase = line < 12 ? "count" : record.returning ? "done" : "check";
    let change = null;
    if ([6,13].includes(line)) active = null;
    if ([7,14].includes(line)) {
      active = record.branch ? [x.r, x.c] : null;
      if (active) { focus = [...active]; checks = { row: null, col: null, pass: null }; }
    }
    if (line === 8) scanned = x.r * cols + x.c;
    if (line === 9 || line === 10) {
      const axis = line === 9 ? "row" : "col", index = line === 9 ? x.r : x.c, name = axis + "_count";
      change = { kind: "counter", axis, index, before: previous.locals[name][index], after: x[name][index], cell: [...active] };
    }
    if (line === 16) checks.row = x.shares_row;
    if (line === 17) checks.col = x.shares_col;
    if (line === 18) {
      checks.pass = record.branch;
      if (!record.branch) isolated.add(x.r * cols + x.c);
    }
    if (line === 19) {
      accepted.add(x.r * cols + x.c);
      change = { kind: "answer", before: previous.locals.answer, after: x.answer, cell: [...active] };
    }
    if (record.returning) { active = null; focus = [x.r, x.c]; scanned = rows * cols - 1; }
    const rowStart = Math.min(Math.max(0, (focus?.[0] ?? 0) - 3), Math.max(0, rows - 8));
    const colStart = Math.min(Math.max(0, (focus?.[1] ?? 0) - 3), Math.max(0, cols - 8));
    const window = grid.slice(rowStart, rowStart + 8).map(row => row.slice(colStart, colStart + 8));
    const previewStates = window.map((row, r) => row.map((cell, c) => {
      const rr = rowStart + r, cc = colStart + c, index = rr * cols + cc;
      if (!cell) return "empty";
      if (record.returning && trace.trace.truncated) return x.row_count[rr] > 1 || x.col_count[cc] > 1 ? "accepted" : "isolated";
      return accepted.has(index) ? "accepted" : isolated.has(index) ? "isolated" : "pending";
    }));
    const view = {
      rows, cols, rowStart, colStart, window, previewStates, cropped: rows > 8 || cols > 8,
      rowCounts: x.row_count ?? null, colCounts: x.col_count ?? null, phase,
      active: active ? [...active] : null, focus: focus ? [...focus] : null, scanned,
      checks: { ...checks }, change, counted: x.answer ?? null, answer: record.returning ? trace.answer : null,
      source: { line, text: CODE[line - 1].trim(), timing: "after" }, scope: record.scope, locals: x,
      outer: record.outer, frames: record.frames, branch: record.branch, returning: record.returning, returned: record.returned, trace: trace.trace,
    };
    previous = view;
    const phaseName = phase === "count" ? bi("Lượt 1 · đếm hàng/cột", "Pass 1 · count rows/columns")
      : phase === "check" ? bi("Lượt 2 · chọn server", "Pass 2 · select servers") : bi("Kết quả", "Result");
    return {
      arr: [], codeBlock: 1, codeLines: [line], final: record.returning,
      title: bi(`L${line} · ${phaseName.vi}`, `L${line} · ${phaseName.en}`), note: bi("", ""),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), servers1267View: view,
    };
  });
  return { original: grid, answer: trace.answer, steps };
}

module.exports = { 1267: {
  id: 1267, difficulty: "medium", slug: "count-servers-that-communicate",
  category: { key: "array", vi: "Mảng", en: "Array" },
  tags: [{ key: "2d-array", vi: "Mảng 2D", en: "2D Array" }, { key: "matrix", vi: "Ma trận", en: "Matrix" }, { key: "counting", vi: "Đếm", en: "Counting" }],
  title: bi("Count Servers that Communicate", "Count Servers that Communicate"),
  titleVi: bi("Đếm server liên lạc qua hàng hoặc cột", "Count servers sharing a row or column"),
  statement: bi("1 = server, 0 = ô trống. Đếm server có ít nhất một server khác cùng hàng hoặc cùng cột; không cần nằm cạnh nhau.", "1 = server, 0 = empty. Count servers with another server in the same row or column; adjacency is unnecessary."),
  defaultInput: "1,1,0,0|0,0,1,0|0,0,1,0|0,0,0,1", inputKind: "string", extraParams: [], debugMode: "line-by-line",
  inputLabel: bi("grid 0/1 · JSON hoặc hàng ngăn bởi | / ; · debug đầy đủ ≤ 8×8", "0/1 grid · JSON or rows separated by | / ; · full debug ≤ 8×8"),
  approach: [bi("Lượt 1: đếm theo hàng/cột. Lượt 2: hàng > 1 OR cột > 1 → cộng đúng một lần.", "Pass 1: count rows/columns. Pass 2: row > 1 OR column > 1 → count once.")],
  complexity: { time: "O(MN)", space: "O(M+N)", note: bi("Lưới 1–250 hàng/cột. Lưới lớn vẫn tính đủ; hình xem tối đa 8×8 và trace có giới hạn.", "Grids support 1–250 rows/columns. Large inputs compute the full answer with an 8×8 picture window and bounded replay.") },
  code: CODE, codeLabel: bi("Hai lượt đếm · từng dòng Python", "Two counting passes · Python line by line"),
  builder, parseInput: parse, liveArgs: input => [parse(input)],
} };
