"use strict";
const bi = (vi, en) => ({ vi, en });
const SOURCE = [
  "class Solution:",
  "    def longestIncreasingPath(self, matrix):",
  "        res = 0",
  "        rows = len(matrix)",
  "        cols = len(matrix[0])",
  "",
  "        dp = [[0] * cols for _ in range(rows)]",
  "",
  "        directions = [(1,0), (-1,0), (0,1), (0,-1)]",
  "        def dfs(r,c):",
  "            if dp[r][c]:",
  "                return dp[r][c]",
  "",
  "            best = 1",
  "            for dr, dc in directions:",
  "                nr = r + dr",
  "                nc = c + dc",
  "",
  "                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:",
  "                    best = max(best, 1 + dfs(nr, nc))",
  "            dp[r][c] = best",
  "            return best",
  "",
  "",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                res = max(res, dfs(r,c))",
  "",
  "",
  "        return res",
];
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function parseInput(input) {
  let matrix;
  if (Array.isArray(input)) matrix = input;
  else if (typeof input === "string" && input.trim()) {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { matrix = JSON.parse(text); } catch { throw new Error("329: JSON matrix is invalid / Ma trận JSON không hợp lệ."); }
    } else {
      const pieces = text.split(/[;|]/).map(row => row.split(","));
      if (pieces.some(row => row.some(value => !value.trim()))) throw new Error("329: Empty matrix entry / Ma trận có ô rỗng.");
      matrix = pieces.map(row => row.map(value => Number(value.trim())));
    }
  }
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 6 || !Array.isArray(matrix[0]) || matrix[0].length < 1 || matrix[0].length > 6 || matrix.some(row => !Array.isArray(row) || row.length !== matrix[0].length || row.some(value => !Number.isSafeInteger(value)))) {
    throw new Error("329: Use a nonempty rectangular matrix ≤6×6 of safe integers / Cần ma trận chữ nhật không rỗng ≤6×6 gồm số nguyên an toàn.");
  }
  return matrix.map(row => [...row]);
}

function buildSteps(input) {
  const matrix = parseInput(input), steps = [], stack = [];
  let res = null, rows = null, cols = null, dp = null, root = null, bestRoot = null;
  let cacheHits = 0, writes = 0;
  const emit = (line, phase, title, note, extra = {}) => {
    const current = stack.at(-1);
    const view = {
      matrix: matrix.map(row => [...row]), dp: dp ? dp.map(row => [...row]) : null, res, root: root ? [...root] : null,
      phase, cacheHits, writes, current: current ? [current.r, current.c] : null,
      stack: stack.map(frame => ({ ...frame })), neighbor: current && Number.isInteger(current.nr) && Number.isInteger(current.nc) ? [current.nr, current.nc] : null,
      condition: extra.condition ?? null, calculation: extra.calculation ? { ...extra.calculation } : null,
      path: extra.path || [], answer: phase === "done" ? res : null,
    };
    steps.push({ arr: [], codeLines: [line], title, note, final: phase === "done", longestIncreasingPath329View: view,
      vars: [ ...(res === null ? [] : [{ name: "res", value: res }]), ...(rows === null ? [] : [{ name: "rows", value: rows }]), ...(cols === null ? [] : [{ name: "cols", value: cols }]),
        ...(current ? [{ name: "r, c", value: `${current.r}, ${current.c}` }, ...(current.best === null ? [] : [{ name: "best", value: current.best }]), ...(current.nr === null ? [] : [{ name: "nr", value: current.nr }]), ...(current.nc === null ? [] : [{ name: "nc", value: current.nc }])] : []) ],
    });
  };
  res = 0;
  emit(3, "init", bi("res = 0: kết quả toàn ma trận", "res = 0: result for the entire matrix"), bi("res là độ dài tốt nhất từ các ô gốc đã xét. Nó khác best bên trong mỗi lần gọi dfs.", "res is the best length among roots checked so far. It differs from best inside each dfs call."));
  rows = matrix.length; emit(4, "setup", bi(`rows = ${rows}`, `rows = ${rows}`), bi("Số hàng của ma trận.", "Number of matrix rows."));
  cols = matrix[0].length; emit(5, "setup", bi(`cols = ${cols}`, `cols = ${cols}`), bi("Số cột của ma trận.", "Number of matrix columns."));
  dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  emit(7, "allocate", bi("Tạo dp: tất cả ô bằng 0", "Create dp: every cell is 0"), bi("dp[r][c] = độ dài đường tăng dài nhất BẮT ĐẦU tại (r,c). 0 nghĩa là chưa tính, không phải đáp án 0.", "dp[r][c] is the longest increasing path STARTING at (r,c). 0 means uncomputed, not a path of length zero."));
  emit(9, "directions", bi("Thử xuống → lên → phải → trái", "Try down → up → right → left"), bi("Chỉ đi bốn hướng và chỉ tới giá trị lớn hơn; không đi chéo.", "Move in four directions, only to larger values; no diagonal moves."));
  emit(10, "define", bi("dfs(r,c) trả độ dài bắt đầu ở ô này", "dfs(r,c) returns the length starting here"), bi("Mỗi lời gọi có best riêng. dp giúp dùng lại kết quả đã hoàn tất.", "Each call has its own best. dp reuses completed results."));

  function dfs(r, c) {
    const frame = { r, c, best: null, nr: null, nc: null, direction: null, waiting: false };
    stack.push(frame);
    const cached = dp[r][c] !== 0;
    emit(11, "cache-check", bi(`dfs(${r},${c}): dp = ${dp[r][c]}`, `dfs(${r},${c}): dp = ${dp[r][c]}`), cached
      ? bi("Đã tính ô này: dùng lại kết quả, không duyệt các hướng nữa.", "This cell is already computed: reuse its result without exploring directions again.")
      : bi("Chưa tính ô này. Tìm đường dài nhất bắt đầu từ đây.", "This cell is uncomputed. Find the longest path starting here."), { condition: cached });
    if (cached) {
      cacheHits++;
      emit(12, "cache-return", bi(`Trả ngay dp[${r}][${c}] = ${dp[r][c]}`, `Return dp[${r}][${c}] = ${dp[r][c]} immediately`), bi("Memoization tránh tính lại cả nhánh DFS đã làm trước đó.", "Memoization avoids recomputing an entire DFS branch."));
      stack.pop(); return dp[r][c];
    }
    frame.best = 1;
    emit(14, "best-init", bi(`best = 1 tại (${r},${c})`, `best = 1 at (${r},${c})`), bi("Bản thân ô hiện tại đã tạo một đường dài 1, dù không đi được tới ô nào khác.", "The current cell alone is a path of length 1, even if no neighbor is reachable."));
    for (let direction = 0; direction < DIRECTIONS.length; direction++) {
      const [dr, dc] = DIRECTIONS[direction];
      frame.direction = direction; frame.nr = null; frame.nc = null;
      emit(15, "direction", bi(`Chọn hướng (${dr},${dc})`, `Choose direction (${dr},${dc})`), bi("Mỗi ô chỉ kiểm tra bốn ô kề.", "Each cell checks just four neighbors."));
      frame.nr = r + dr;
      emit(16, "neighbor-row", bi(`nr = ${r} + (${dr}) = ${frame.nr}`, `nr = ${r} + (${dr}) = ${frame.nr}`), bi("Tính hàng của ô kề.", "Compute the neighbor row."));
      frame.nc = c + dc;
      emit(17, "neighbor-col", bi(`nc = ${c} + (${dc}) = ${frame.nc}`, `nc = ${c} + (${dc}) = ${frame.nc}`), bi("Tính cột của ô kề. Tiếp theo kiểm tra biên và giá trị.", "Compute the neighbor column. Next check bounds and value."));
      const nr = frame.nr, nc = frame.nc;
      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      const increasing = inBounds && matrix[nr][nc] > matrix[r][c];
      const reason = !inBounds ? bi(`(${nr},${nc}) nằm ngoài ma trận → bỏ qua.`, `(${nr},${nc}) is outside the matrix → skip.`)
        : increasing ? bi(`${matrix[nr][nc]} > ${matrix[r][c]} → được đi tới (${nr},${nc}).`, `${matrix[nr][nc]} > ${matrix[r][c]} → may move to (${nr},${nc}).`)
        : bi(`${matrix[nr][nc]} ≤ ${matrix[r][c]} → không tăng nghiêm ngặt, bỏ qua.`, `${matrix[nr][nc]} ≤ ${matrix[r][c]} → not strictly increasing, skip.`);
      emit(19, increasing ? "accept" : "reject", increasing ? bi("Ô kề hợp lệ: gọi DFS con", "Valid neighbor: call child DFS") : bi("Không đi theo hướng này", "Do not follow this direction"), reason, { condition: increasing });
      if (increasing) {
        frame.waiting = true;
        emit(20, "call", bi(`dfs(${r},${c}) chờ dfs(${nr},${nc})`, `dfs(${r},${c}) waits for dfs(${nr},${nc})`), bi("Phải lấy kết quả của ô con trước, rồi mới cộng 1 cho ô hiện tại và cập nhật best.", "Get the child's result first, then add 1 for the current cell and update best."));
        const child = dfs(nr, nc), before = frame.best;
        frame.waiting = false; frame.best = Math.max(before, 1 + child);
        emit(20, "best-update", bi(`best = max(${before}, 1 + ${child}) = ${frame.best}`, `best = max(${before}, 1 + ${child}) = ${frame.best}`), bi("+1 là ô hiện tại. best chỉ thay đổi sau khi DFS con trả về.", "+1 counts the current cell. best changes only after the child DFS returns."), { calculation: { before, child, after: frame.best } });
      }
    }
    frame.nr = null; frame.nc = null; frame.direction = null;
    dp[r][c] = frame.best; writes++;
    emit(21, "dp-write", bi(`Lưu dp[${r}][${c}] = ${frame.best}`, `Store dp[${r}][${c}] = ${frame.best}`), bi("Đã xét hết bốn hướng. Đây là kết quả hoàn chỉnh, có thể dùng lại cho các lời gọi sau.", "All four directions are checked. This complete result can be reused by later calls."));
    emit(22, "return", bi(`dfs(${r},${c}) trả ${frame.best}`, `dfs(${r},${c}) returns ${frame.best}`), stack.length > 1
      ? bi("Quay về lời gọi cha đang chờ; cha sẽ dùng 1 + kết quả này.", "Return to the waiting parent; it will use 1 + this result.")
      : bi("Quay về vòng lặp ngoài để cập nhật res.", "Return to the outer loop to update res."));
    stack.pop(); return frame.best;
  }
  for (let r = 0; r < rows; r++) {
    emit(25, "row", bi(`Duyệt hàng r = ${r}`, `Scan row r = ${r}`), bi("Thử từng ô làm điểm bắt đầu để không bỏ sót đường dài nhất.", "Try every cell as a starting point so no longest path is missed."));
    for (let c = 0; c < cols; c++) {
      root = [r, c];
      emit(26, "root", bi(`Điểm bắt đầu (${r},${c})`, `Starting cell (${r},${c})`), bi("Ô gốc này có thể được tính mới hoặc đã có kết quả trong dp.", "This root may need computing or may already have a result in dp."));
      emit(27, "root-call", bi(`Gọi dfs(${r},${c}) trước khi cập nhật res`, `Call dfs(${r},${c}) before updating res`), bi("res giữ nguyên trong lúc lời gọi DFS này đang chạy.", "res stays unchanged while this DFS call runs."));
      const length = dfs(r, c), before = res;
      if (length > res) bestRoot = [r, c];
      res = Math.max(res, length);
      emit(27, "res-update", bi(`res = max(${before}, ${length}) = ${res}`, `res = max(${before}, ${length}) = ${res}`), bi("So độ dài từ ô gốc với kết quả tốt nhất toàn ma trận.", "Compare this root's length with the best result for the whole matrix."), { calculation: { before, rootLength: length, after: res } });
    }
  }
  // A display-only example path derived from completed dp; no extra Python variables.
  const path = [];
  let cell = bestRoot;
  while (cell) {
    const [r, c] = cell; path.push([r, c]);
    cell = null;
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c] && dp[nr][nc] === dp[r][c] - 1) { cell = [nr, nc]; break; }
    }
  }
  root = null;
  emit(30, "done", bi(`Trả res = ${res}`, `Return res = ${res}`), bi(`Đã tính ${writes} ô đúng một lần và dùng lại dp ${cacheHits} lần. Đường màu xanh minh họa một đường đạt độ dài ${res}.`, `Computed ${writes} cells once and reused dp ${cacheHits} times. The green path illustrates one path of length ${res}.`), { path });
  return { original: matrix, answer: res, dp: dp.map(row => [...row]), path, steps };
}

module.exports = {
  329: {
    id: 329, difficulty: "hard", slug: "longest-increasing-path-in-a-matrix", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: bi("Longest Increasing Path in a Matrix", "Longest Increasing Path in a Matrix"), titleVi: bi("Đường tăng dài nhất: DFS + dp", "Longest increasing path: DFS + dp"),
    statement: bi("Tìm độ dài đường tăng nghiêm ngặt dài nhất trong ma trận. Chỉ đi lên, xuống, trái, phải tới ô có giá trị lớn hơn. Mô phỏng nhận ma trận ≤6×6; nhập hàng cách bằng ; hoặc |, hoặc mảng JSON.", "Find the longest strictly increasing path in a matrix. Move up, down, left, or right to a larger value. The visualization accepts matrices ≤6×6; separate rows with ; or |, or use JSON."),
    defaultInput: "9,9,4;6,6,8;2,1,1", inputKind: "string", inputLabel: bi("Ma trận ≤6×6 (;, | hoặc JSON)", "Matrix ≤6×6 (;, |, or JSON)"), extraParams: [], debugMode: "line-by-line",
    approach: [bi("dfs(r,c) trả đường dài nhất bắt đầu tại (r,c). best ban đầu là 1.", "dfs(r,c) returns the longest path starting at (r,c). best starts at 1."), bi("Thử xuống, lên, phải, trái. Với ô kề lớn hơn, best = max(best, 1 + dfs(ô kề)).", "Try down, up, right, left. For a larger neighbor, best = max(best, 1 + dfs(neighbor))."), bi("Ghi dp sau khi xét đủ bốn hướng; dùng lại dp nếu ô đã tính.", "Write dp after checking all four directions; reuse it for computed cells."), bi("Vòng lặp ngoài lấy res = max(res, dfs(r,c)) cho mọi ô.", "The outer loop takes res = max(res, dfs(r,c)) for every cell.")],
    complexity: { time: "O(rows × cols)", space: "O(rows × cols)", note: bi("Mỗi ô được tính một lần, xét bốn hướng. dp và stack DFS dùng O(rows × cols); không tính dữ liệu mô phỏng.", "Each cell is computed once and checks four directions. dp and the DFS stack use O(rows × cols); excludes trace data.") },
    code: SOURCE, builder: buildSteps, liveArgs: input => [parseInput(input)], parseLongestIncreasingPath329Input: parseInput,
  },
};
