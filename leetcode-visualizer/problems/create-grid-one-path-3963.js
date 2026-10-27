"use strict";

const { bi, parsePlainParams, parseInteger } = require("./hard-viz-shared");
const CODE = Object.freeze([
  "class Solution:",
  "    def createGrid(self, m: int, n: int) -> list[str]:",
  "        grid = [['#'] * n for _ in range(m)]",
  "        for c in range(n):",
  "            grid[0][c] = '.'",
  "        for r in range(1, m):",
  "            grid[r][n - 1] = '.'",
  "        return [''.join(row) for row in grid]",
]);
const copyGrid = grid => grid.map(row => [...row]);

function parse3963(input, params) {
  const options = parsePlainParams(params, 3963);
  if (!Array.isArray(input) || input.length !== 1) throw new TypeError("#3963: nhập một số m / enter one value for m.");
  const dimension = (value, name) => parseInteger(value, { problemId: 3963, name, min: 1, max: 25 });
  return [dimension(input[0], "m"), dimension(options.n === undefined ? 6 : options.n, "n")];
}

function buildSteps3963(input, params) {
  const [m, n] = parse3963(input, params), steps = [], grid = Array.from({ length: m }, () => Array(n).fill("#"));
  let c, r;
  function emit(line, phase, focus = null, final = false) {
    const snapshot = copyGrid(grid), route = [];
    for (let col = 0; col < n && grid[0][col] === "."; col++) route.push([0, col]);
    if (route.length === n) for (let row = 1; row < m && grid[row][n - 1] === "."; row++) route.push([row, n - 1]);
    const locals = { m, n, grid: copyGrid(grid), ...(c === undefined ? {} : { c }), ...(r === undefined ? {} : { r }) };
    const titles = {
      init: bi("Lấp lưới bằng vật cản", "Fill the grid with walls"),
      "select-top": bi("Chọn ô ở hàng trên", "Select a top-row cell"),
      "open-top": bi("Mở đường sang phải →", "Open a route to the right →"),
      "top-done": bi("Hàng trên đã mở", "Top row complete"),
      "select-right": bi("Chọn ô ở cột phải", "Select a right-column cell"),
      "open-right": bi("Mở đường đi xuống ↓", "Open a route down ↓"),
      "right-done": bi("Cột phải đã mở", "Right column complete"),
      done: bi("Đúng 1 đường từ S đến T", "Exactly 1 path from S to T"),
    };
    const openCount = snapshot.flat().filter(cell => cell === ".").length;
    steps.push({ title: titles[phase], note: bi("", ""), arr: [], codeLines: [line], final,
      vars: [
        { name: "m", value: m }, { name: "n", value: n }, { name: "c", value: c ?? "—" }, { name: "r", value: r ?? "—" },
        { name: "grid[0][c]", value: c === undefined ? "—" : grid[0][c] },
        { name: "grid[r][n - 1]", value: r === undefined ? "—" : grid[r][n - 1] },
      ],
      onePath3963View: {
        m, n, grid: snapshot, locals, phase, focus: focus ? [...focus] : null,
        source: { line, text: CODE[line - 1], timing: "after" },
        openCount, totalOpen: m + n - 1, wallCount: m * n - openCount,
        route, pathCount: route.length === m + n - 1 ? 1 : 0,
        answer: final ? snapshot.map(row => row.join("")) : null,
      },
    });
  }
  emit(3, "init");
  for (let col = 0; col < n; col++) {
    c = col; emit(4, "select-top", [0, c]);
    grid[0][c] = "."; emit(5, "open-top", [0, c]);
  }
  emit(4, "top-done");
  for (let row = 1; row < m; row++) {
    r = row; emit(6, "select-right", [r, n - 1]);
    grid[r][n - 1] = "."; emit(7, "open-right", [r, n - 1]);
  }
  emit(6, "right-done"); emit(8, "done", [m - 1, n - 1], true);
  return { original: [m], m, n, answer: grid.map(row => row.join("")), steps };
}

module.exports = { 3963: {
  id: 3963, difficulty: "easy", slug: "create-grid-with-exactly-one-path",
  category: { key: "array", vi: "Mảng", en: "Array" },
  tags: [{ key: "matrix", vi: "Ma trận", en: "Matrix" }, { key: "constructive", vi: "Xây dựng", en: "Constructive" }],
  title: bi("Create Grid With Exactly One Path", "Create Grid With Exactly One Path"),
  titleVi: bi("Tạo lưới có đúng một đường đi", "Build a grid with exactly one path"),
  statement: bi("Tạo lưới m × n bằng '.' (trống) và '#' (cản), có đúng 1 đường từ góc trên trái đến góc dưới phải. Chỉ đi → hoặc ↓.", "Build an m × n grid of '.' (free) and '#' (wall), with exactly 1 path from top left to bottom right. Only → and ↓ moves are allowed."),
  defaultInput: [4], inputKind: "positive", singleInput: true, maxInput: 25,
  inputLabel: bi("m · số hàng (1–25)", "m · rows (1–25)"),
  extraParams: [{ key: "n", type: "number", min: 1, max: 25, default: 6, label: bi("n · số cột (1–25)", "n · columns (1–25)") }],
  approach: [bi("Chặn tất cả → mở hàng trên → mở cột phải. Mọi lối rẽ còn lại đều bị chặn.", "Block everything → open the top row → open the right column. All other turns remain blocked.")],
  complexity: { time: "O(m · n)", space: "O(m · n)", note: bi("Tạo và trả về toàn bộ lưới; mở m + n − 1 ô.", "Build and return the whole grid; open m + n − 1 cells.") },
  code: CODE, debugMode: "line-by-line", builder: buildSteps3963, liveArgs: parse3963,
} };
