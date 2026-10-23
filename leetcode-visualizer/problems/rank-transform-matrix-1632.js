"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = [
  "class Solution:",
  "    def matrixRankTransform(self, matrix):",
  "        m, n = len(matrix), len(matrix[0])",
  "        values = sorted(set of all cells)",
  "        rank = [0] * (m + n)  # row ranks, then column ranks",
  "        result = [[0] * n for _ in range(m)]",
  "        for value in values:",
  "            dsu = DSU(m + n)  # reset for this value",
  "            cells = all (r, c) where matrix[r][c] == value",
  "            for r, c in cells:",
  "                dsu.union(r, m + c)",
  "            best = {}  # component -> largest row/col rank",
  "            for r, c in cells:",
  "                root = dsu.find(r)",
  "                best[root] = max(best.get(root, 0), rank[r], rank[m + c])",
  "            for r, c in cells:",
  "                root = dsu.find(r)",
  "                newRank = best[root] + 1",
  "                result[r][c] = newRank",
  "                rank[r] = rank[m + c] = newRank",
  "        return result",
];

function parseMatrix(input) {
  let matrix;
  if (Array.isArray(input)) matrix = input;
  else if (input && typeof input === "object") matrix = input.matrix;
  else if (typeof input === "string") {
    const source = input.trim();
    try { if (source.startsWith("[")) matrix = JSON.parse(source); } catch (_) { /* use compact row input */ }
    if (!matrix) matrix = source.split(/[;\n]+/).filter(Boolean).map((row) => row.split(/[\s,]+/).filter(Boolean).map(Number));
  }
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 6 || !Array.isArray(matrix[0]) || matrix[0].length < 1 || matrix[0].length > 6
    || matrix.some((row) => !Array.isArray(row) || row.length !== matrix[0].length || row.some((value) => !Number.isSafeInteger(value)))
    || new Set(matrix.flat()).size > 10) {
    throw new RangeError("#1632: Enter a 1–6 × 1–6 integer matrix with at most 10 distinct values (rows separated by ;, cells by ,).");
  }
  return matrix.map((row) => row.map(Number));
}

function buildSteps(input) {
  const matrix = parseMatrix(input), m = matrix.length, n = matrix[0].length;
  const values = [...new Set(matrix.flat())].sort((a, b) => a - b);
  const result = Array.from({ length: m }, () => Array(n).fill(0));
  const rank = Array(m + n).fill(0), steps = [], completedValues = [];
  let parent = Array.from({ length: m + n }, (_, i) => i), cells = [], edges = [];
  let currentValue = null, activeCell = null, activeRoot = null, best = {}, newRank = null, phase = "start", answer = null;
  const find = (node) => { while (parent[node] !== node) node = parent[node]; return node; };
  function emit(line, titleVi, titleEn, final = false) {
    steps.push({
      title: bi(titleVi, titleEn), note: bi("", ""), arr: [], highlight: activeCell ? [activeCell.r * n + activeCell.c] : [], mark: [], codeLines: [line], final,
      vars: [{ name: "value", value: currentValue ?? "—" }, { name: "hạng", value: newRank ?? "—" }, { name: "root", value: activeRoot ?? "—" }],
      rankTransformMatrix1632View: {
        matrix: matrix.map((row) => [...row]), result: result.map((row) => [...row]), m, n, values: [...values], currentValue, activeCell: activeCell ? { ...activeCell } : null,
        activeRoot, parent: [...parent], rank: [...rank], cells: cells.map((cell) => ({ ...cell })), edges: edges.map((edge) => ({ ...edge })),
        best: { ...best }, newRank, phase, completedValues: [...completedValues], answer: answer ? answer.map((row) => [...row]) : answer,
      },
    });
  }
  emit(1, "Bắt đầu", "Start"); emit(2, "Đọc ma trận", "Read the matrix"); emit(3, `${m} hàng × ${n} cột`, `${m} rows × ${n} columns`);
  emit(4, `Xếp ${values.length} giá trị từ nhỏ tới lớn`, `Sort ${values.length} values`); emit(5, "Hạng hàng và cột bắt đầu từ 0", "All row and column ranks start at 0"); emit(6, "Bảng kết quả còn trống", "Start with an empty rank table");
  for (const value of values) {
    currentValue = value; activeCell = null; activeRoot = null; newRank = null; best = {};
    emit(7, `Chuyển sang giá trị ${value}`, `Move to value ${value}`);
    parent = Array.from({ length: m + n }, (_, i) => i); edges = []; emit(8, "Tách DSU mới cho lớp này", "Reset DSU for this value");
    cells = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (matrix[r][c] === value) cells.push({ r, c });
    emit(9, `${cells.length} ô bằng ${value}`, `${cells.length} cells equal ${value}`);
    for (const { r, c } of cells) {
      activeCell = { r, c }; activeRoot = null; emit(10, `Nối hàng ${r} với cột ${c}`, `Connect row ${r} to column ${c}`);
      const rowNode = r, colNode = m + c, rowRoot = find(rowNode), colRoot = find(colNode);
      edges.push({ r, c, rowNode, colNode, status: "active" });
      if (rowRoot !== colRoot) parent[colRoot] = rowRoot;
      activeRoot = find(rowNode); emit(11, `Gộp vào nhóm ${activeRoot}`, `Union into component ${activeRoot}`);
    }
    activeCell = null; activeRoot = null; emit(12, "Tìm hạng nền của từng nhóm", "Find each component's base rank");
    for (const { r, c } of cells) {
      activeCell = { r, c }; emit(13, `Xem ô (${r}, ${c})`, `Check cell (${r}, ${c})`);
      activeRoot = find(r); emit(14, `Root = ${activeRoot}`, `Root = ${activeRoot}`);
      best[activeRoot] = Math.max(best[activeRoot] ?? 0, rank[r], rank[m + c]); emit(15, `Nhóm ${activeRoot}: nền ${best[activeRoot]}`, `Component ${activeRoot}: base ${best[activeRoot]}`);
    }
    for (const { r, c } of cells) {
      activeCell = { r, c }; emit(16, `Gán hạng cho (${r}, ${c})`, `Assign rank to (${r}, ${c})`);
      activeRoot = find(r); emit(17, `Ô thuộc nhóm ${activeRoot}`, `Cell is in component ${activeRoot}`);
      newRank = best[activeRoot] + 1; emit(18, `${best[activeRoot]} + 1 = ${newRank}`, `${best[activeRoot]} + 1 = ${newRank}`);
      result[r][c] = newRank; emit(19, `Ô (${r}, ${c}) nhận hạng ${newRank}`, `Cell (${r}, ${c}) gets rank ${newRank}`);
      rank[r] = rank[m + c] = newRank; emit(20, `Cập nhật hạng hàng ${r} và cột ${c}`, `Update row ${r} and column ${c} ranks`);
    }
    activeCell = null; activeRoot = null; newRank = null; completedValues.push(value);
  }
  currentValue = null; phase = "done"; answer = result.map((row) => [...row]); emit(21, "Ma trận hạng hoàn tất ✓", "Rank matrix complete ✓", true);
  return { original: matrix, answer, steps };
}

module.exports = { 1632: {
  id: 1632, slug: "rank-transform-of-a-matrix", difficulty: "hard", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "union-find", vi: "DSU / Hợp nhất", en: "Union Find" }, { key: "matrix", vi: "Ma trận", en: "Matrix" }],
  title: bi("Rank Transform of a Matrix", "Rank Transform of a Matrix"), titleVi: bi("Xếp hạng ma trận", "Rank transform of a matrix"),
  statement: bi("Thay mỗi ô bằng hạng của nó; mỗi hàng và cột phải tăng theo giá trị.", "Replace each cell with its rank; values must rank increasingly within each row and column."),
  defaultInput: "1,2,2;2,3,4;2,4,4", inputKind: "string", inputLabel: bi("ma trận · hàng cách nhau ;", "matrix · rows separated by ;"),
  debugMode: "line-by-line", approach: [bi("Xử lý giá trị từ nhỏ tới lớn.", "Process values from smallest to largest."), bi("Các ô bằng nhau nối hàng và cột thành DSU chung.", "Equal cells join their rows and columns into DSU components."), bi("Hạng nhóm = hạng nền lớn nhất + 1.", "Component rank = largest base rank + 1.")],
  complexity: { time: "O(MN log(MN))", space: "O(MN)", note: bi("Giới hạn minh họa: 6×6, tối đa 10 giá trị khác nhau.", "Visualization limit: 6×6, up to 10 distinct values.") },
  code: CODE, builder: buildSteps, liveArgs: (input) => [parseMatrix(input)],
} };
