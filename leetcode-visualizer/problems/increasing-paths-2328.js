"use strict";
const bi = (vi, en) => ({ vi, en });
const MOD = 1000000007;
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SOURCE = [
  "class Solution:",
  "    def countPaths(self, grid):",
  "        MOD = 10**9 + 7",
  "        rows, cols = len(grid), len(grid[0])",
  "        dp = [[1] * cols for _ in range(rows)]",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "        cells = sorted(",
  "            ((grid[r][c], r, c) for r in range(rows) for c in range(cols)),",
  "            reverse=True",
  "        )",
  "        res = 0",
  "        for value, r, c in cells:",
  "            for dr, dc in directions:",
  "                nr = r + dr",
  "                nc = c + dc",
  "                if (0 <= nr < rows and",
  "                    0 <= nc < cols and",
  "                    grid[nr][nc] > value):",
  "                    dp[r][c] = (dp[r][c] + dp[nr][nc]) % MOD",
  "            res = (res + dp[r][c]) % MOD",
  "        return res",
];

function parseInput(input) {
  let grid = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { grid = JSON.parse(text); } catch { throw new Error("2328: Invalid JSON grid / Grid JSON không hợp lệ."); }
    } else {
      const rows = text.split(/[;|]/).map(row => row.split(","));
      if (rows.some(row => row.some(value => !value.trim()))) throw new Error("2328: Empty grid entry / Grid có ô rỗng.");
      grid = rows.map(row => row.map(value => Number(value.trim())));
    }
  }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 1000 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 1000 || grid.length * grid[0].length > 100000 || grid.some(row => !Array.isArray(row) || row.length !== grid[0].length || row.some(value => !Number.isInteger(value) || value < 1 || value > 100000))) {
    throw new Error("2328: Use a rectangular grid with 1–1000 rows/columns, at most 100000 cells and values 1–100000 / Cần grid chữ nhật 1–1000 hàng/cột, tối đa 100000 ô, giá trị 1–100000.");
  }
  return grid.map(row => [...row]);
}

function buildSteps(input) {
  const grid = parseInput(input), rows = grid.length, cols = grid[0].length;
  const steps = [], history = [], completed = new Set();
  let dp = null, cells = [], index = -1, current = null, neighbor = null, direction = null, res = null, processed = 0, omitted = 0;
  const emit = (line, phase, title, note, extra = {}) => {
    if (steps.length >= 600 && phase !== "done") { omitted++; return; }
    const focus = current || [0, 0];
    const rowStart = Math.max(0, Math.min(focus[0] - 2, rows - 6));
    const colStart = Math.max(0, Math.min(focus[1] - 2, cols - 6));
    const window = [];
    for (let r = rowStart; r < Math.min(rows, rowStart + 6); r++) {
      window.push(Array.from({ length: Math.min(6, cols - colStart) }, (_, offset) => {
        const c = colStart + offset;
        return { r, c, value: grid[r][c], count: dp ? dp[r][c] : null, completed: completed.has(r * cols + c) };
      }));
    }
    const orderStart = Math.max(0, index - 1);
    steps.push({ arr: [], codeLines: extra.codeLines || [line], title, note, final: phase === "done",
      vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "MOD", value: MOD }, ...(res === null ? [] : [{ name: "res", value: res }]), ...(current ? [{ name: "r, c", value: current.join(", ") }, { name: "dp[r][c]", value: dp[current[0]][current[1]] }] : [])],
      increasingPaths2328View: { rows, cols, total: rows * cols, window, current: current ? [...current] : null, neighbor: neighbor ? [...neighbor] : null,
        direction, phase, res, processed, omitted, condition: extra.condition ?? null, calculation: extra.calculation ? { ...extra.calculation } : null,
        order: cells.slice(orderStart, orderStart + 6).map(([value, r, c], offset) => ({ index: orderStart + offset, value, r, c, completed: completed.has(r * cols + c) })),
        index, history: history.slice(-4).map(item => ({ ...item })), examplePaths: extra.examplePaths || [], answer: phase === "done" ? res : null },
    });
  };
  emit(3, "mod", bi("MOD = 1,000,000,007", "MOD = 1,000,000,007"), bi("Mọi phép cộng lấy modulo để số đường đi không tăng quá lớn.", "Reduce every addition modulo MOD to keep path counts bounded."));
  emit(4, "dimensions", bi(`rows = ${rows}, cols = ${cols}`, `rows = ${rows}, cols = ${cols}`), bi("Đếm đường bắt đầu ở mọi ô; hai đường khác index vẫn khác nhau dù có cùng giá trị.", "Count paths starting at every cell; different cell sequences are distinct even if their values match."));
  dp = Array.from({ length: rows }, () => Array(cols).fill(1));
  emit(5, "init", bi("Mỗi dp bắt đầu bằng 1", "Every dp starts at 1"), bi("1 là đường chỉ chứa chính ô đó. Sau đó cộng thêm các đường nối qua ô kề lớn hơn.", "1 counts the path containing only this cell. Then add paths extending through larger neighbors."));
  emit(6, "directions", bi("Chỉ đi bốn hướng", "Move in four directions"), bi("Không đi chéo và không nối hai giá trị bằng nhau.", "No diagonal moves and no transitions between equal values."));
  cells = grid.flatMap((row, r) => row.map((value, c) => [value, r, c])).sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  emit(7, "sort", bi("Tính ô lớn trước, ô nhỏ sau", "Compute larger cells before smaller cells"), bi("Đường đi luôn tăng, nên dp của mọi ô kề lớn hơn đã hoàn tất trước khi cần dùng nó. Thứ tự tính ngược với hướng đi.", "Paths always increase, so every larger neighbor's dp is complete before it is needed. Computation order is opposite to path direction."), { codeLines: [7, 8, 9, 10] });
  res = 0;
  emit(11, "total-init", bi("res = 0", "res = 0"), bi("Chỉ cộng dp vào res khi đã xét đủ các hướng của ô đó.", "Add a cell's dp to res only after all its directions have been checked."));
  for (index = 0; index < cells.length; index++) {
    const [value, r, c] = cells[index]; current = [r, c]; neighbor = null; direction = null;
    emit(12, "cell", bi(`Tính dp[${r}][${c}] · giá trị ${value}`, `Compute dp[${r}][${c}] · value ${value}`), bi("dp đếm TẤT CẢ đường tăng bắt đầu ở ô này, không chỉ đường dài nhất.", "dp counts ALL increasing paths starting here, not just the longest one."));
    for (direction = 0; direction < DIRECTIONS.length; direction++) {
      const [dr, dc] = DIRECTIONS[direction]; neighbor = null;
      emit(13, "direction", bi(`Xét hướng (${dr},${dc})`, `Check direction (${dr},${dc})`), bi("Mỗi hướng đóng góp một nhóm đường khác nhau theo bước đi đầu tiên.", "Each direction contributes a distinct group of paths by their first move."));
      const nr = r + dr;
      emit(14, "neighbor-row", bi(`nr = ${nr}`, `nr = ${nr}`), bi("Tính hàng ô kề.", "Compute the neighbor row."));
      const nc = c + dc; neighbor = [nr, nc];
      emit(15, "neighbor-col", bi(`nc = ${nc}`, `nc = ${nc}`), bi("Tiếp theo kiểm tra biên và giá trị lớn hơn.", "Next check bounds and the strictly larger value."));
      const rowValid = nr >= 0 && nr < rows, colValid = nc >= 0 && nc < cols;
      const increasing = rowValid && colValid && grid[nr][nc] > value;
      const note = !rowValid || !colValid ? bi(`(${nr},${nc}) ngoài biên → bỏ qua.`, `(${nr},${nc}) is outside the grid → skip.`)
        : increasing ? bi(`${grid[nr][nc]} > ${value}: nối tới (${nr},${nc}) và dùng dp = ${dp[nr][nc]} đã tính xong.`, `${grid[nr][nc]} > ${value}: extend to (${nr},${nc}) and reuse its completed dp = ${dp[nr][nc]}.`)
        : bi(`${grid[nr][nc]} ≤ ${value}: không tăng nghiêm ngặt → bỏ qua.`, `${grid[nr][nc]} ≤ ${value}: not strictly increasing → skip.`);
      emit(16, increasing ? "accept" : "reject", increasing ? bi("Cộng nhóm đường từ ô kề", "Add this neighbor's group of paths") : bi("Hướng này không đóng góp", "This direction contributes no paths"), note,
        { condition: increasing, codeLines: !rowValid ? [16] : !colValid ? [16, 17] : [16, 17, 18] });
      if (increasing) {
        const before = dp[r][c], child = dp[nr][nc];
        dp[r][c] = (before + child) % MOD;
        emit(19, "add", bi(`dp = (${before} + ${child}) % MOD = ${dp[r][c]}`, `dp = (${before} + ${child}) % MOD = ${dp[r][c]}`), bi("Ghép ô hiện tại vào trước từng đường bắt đầu ở ô kề. Mỗi đường đó tạo một đường mới, nên CỘNG số lượng.", "Prepend the current cell to every path starting at the neighbor. Each creates a new path, so ADD their counts."), { calculation: { before, child, after: dp[r][c] } });
      }
    }
    neighbor = null; direction = null; completed.add(r * cols + c); processed++;
    const before = res; res = (res + dp[r][c]) % MOD;
    history.push({ r, c, value, count: dp[r][c] });
    emit(20, "total", bi(`res = (${before} + ${dp[r][c]}) % MOD = ${res}`, `res = (${before} + ${dp[r][c]}) % MOD = ${res}`), bi("Đã hoàn tất ô này. Cộng các đường có điểm bắt đầu tại đây vào tổng; không đếm trùng với ô gốc khác.", "This cell is complete. Add paths starting here to the total; roots at other cells form different paths."), { calculation: { before, cellCount: dp[r][c], after: res } });
  }
  const examplePaths = [];
  if (rows * cols <= 9) {
    const enumerate = path => {
      if (examplePaths.length >= 16) return;
      examplePaths.push(path.map(([r, c]) => ({ r, c, value: grid[r][c] })));
      const [r, c] = path.at(-1);
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] > grid[r][c]) enumerate([...path, [nr, nc]]);
      }
    };
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) enumerate([[r, c]]);
  }
  current = null; index = -1;
  emit(21, "done", bi(`Tổng số đường tăng: ${res}`, `Total increasing paths: ${res}`), bi(`Cộng dp của ${processed} ô, lấy modulo 1,000,000,007. Mỗi đường được phân biệt bằng dãy index đã đi qua.`, `Sum dp across ${processed} cells modulo 1,000,000,007. Each path is distinguished by its sequence of visited indices.`), { examplePaths });
  return { original: grid, answer: res, dp: dp.map(row => [...row]), steps };
}

module.exports = {
  2328: {
    id: 2328, slug: "number-of-increasing-paths-in-a-grid", difficulty: "hard",
    category: { key: "dp", vi: "Quy hoạch động", en: "Dynamic Programming" }, tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "matrix", vi: "Ma trận", en: "Matrix" }],
    title: bi("Number of Increasing Paths in a Grid", "Number of Increasing Paths in a Grid"), titleVi: bi("Đếm tất cả đường tăng trong grid", "Count all increasing paths in the grid"),
    statement: bi("Đếm tất cả đường tăng nghiêm ngặt trong grid, đi bốn hướng. Được bắt đầu/kết thúc ở mọi ô; đường chỉ gồm một ô cũng được tính. Hai đường khác nhau nếu dãy index khác nhau. Trả kết quả modulo 10⁹ + 7. Ví dụ [[1,1],[3,4]] → 8.", "Count all strictly increasing four-directional paths in grid. Any cell can be a start or end; single-cell paths count too. Paths differ by their sequence of visited cells. Return the count modulo 10⁹ + 7. Example [[1,1],[3,4]] → 8."),
    inputKind: "string", inputLabel: bi("grid — hàng cách bằng ; hoặc |, hoặc JSON", "grid — rows separated by ; or |, or JSON"), defaultInput: "1,1;3,4", extraParams: [], debugMode: "line-by-line",
    approach: [bi("dp[r][c] đếm đường tăng BẮT ĐẦU tại ô (r,c); ban đầu bằng 1 cho đường chỉ chứa ô đó.", "dp[r][c] counts increasing paths STARTING at (r,c); initialize it to 1 for the single-cell path."), bi("Tính các ô theo giá trị giảm dần để dp của ô kề lớn hơn đã hoàn tất.", "Process cells by descending value so larger neighbors' dp values are already complete."), bi("Cộng dp của từng ô kề lớn hơn, rồi cộng dp của ô hiện tại vào res; luôn lấy modulo.", "Add dp from each larger neighbor, then add the current cell's dp to res; always reduce modulo MOD.")],
    complexity: { time: "O(k log k)", space: "O(k)", note: bi("k = rows × cols. Sắp xếp k ô rồi xét bốn hướng mỗi ô. Hỗ trợ đầy đủ giới hạn 100000 ô; dữ liệu lớn hiển thị cửa sổ ≤6×6 và tối đa 600 bước trước kết quả cuối.", "k = rows × cols. Sort k cells, then inspect four neighbors per cell. Supports the full 100000-cell limit; large inputs show a ≤6×6 window and at most 600 steps before the final result.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)],
  },
};
