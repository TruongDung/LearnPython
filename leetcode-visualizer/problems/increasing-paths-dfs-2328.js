"use strict";
const bi = (vi, en) => ({ vi, en });
const MOD = 1000000007;
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const SOURCE = [
  "class Solution:",
  "    def countPaths(self, grid: List[List[int]]) -> int:",
  "        MOD = 10**9 + 7",
  "        rows, cols = len(grid), len(grid[0])",
  "",
  "        dp = [[0] * cols for _ in range(rows)]",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "",
  "        def dfs(r, c):",
  "            if dp[r][c]:",
  "                return dp[r][c]",
  "",
  "            count = 1",
  "",
  "            for dr, dc in directions:",
  "                nr = r + dr",
  "                nc = c + dc",
  "",
  "                if (0 <= nr < rows and",
  "                    0 <= nc < cols and",
  "                    grid[nr][nc] > grid[r][c]):",
  "",
  "                    count += dfs(nr, nc)",
  "",
  "            dp[r][c] = count % MOD",
  "            return dp[r][c]",
  "",
  "        ans = 0",
  "",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                ans = (ans + dfs(r, c)) % MOD",
  "",
  "        return ans"
];

function buildSteps(grid, enumeratePaths) {
  const rows = grid.length, cols = grid[0].length, steps = [], stack = [], history = [], completed = new Set();
  let dp = null, ans = null, root = null, cacheHits = 0, omitted = 0, returned = null;
  function emit(line, phase, title, note, extra = {}) {
    if (steps.length >= 600 && phase !== "done") { omitted++; return; }
    const frame = stack.at(-1);
    const current = frame ? [frame.r, frame.c] : root;
    const focus = current || [0, 0];
    const rowStart = Math.max(0, Math.min(focus[0] - 2, rows - 6));
    const colStart = Math.max(0, Math.min(focus[1] - 2, cols - 6));
    const window = Array.from({ length: Math.min(6, rows - rowStart) }, (_, i) => {
      const r = rowStart + i;
      return Array.from({ length: Math.min(6, cols - colStart) }, (_, j) => {
        const c = colStart + j;
        return { r, c, value: grid[r][c], count: dp ? dp[r][c] : null, completed: completed.has(r * cols + c) };
      });
    });
    steps.push({ arr: [], codeBlock: 2, codeLines: extra.codeLines || [line], title, note, final: phase === "done",
      vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }, { name: "MOD", value: MOD },
        ...(ans === null ? [] : [{ name: "ans", value: ans }]),
        ...(frame ? [{ name: "r, c", value: frame.r + ", " + frame.c }, ...(frame.count === null ? [] : [{ name: "count", value: frame.count }]),
          ...(frame.nr === null ? [] : [{ name: "nr", value: frame.nr }]), ...(frame.nc === null ? [] : [{ name: "nc", value: frame.nc }])] : [])],
      increasingPaths2328View: { method: 2, rows, cols, total: rows * cols, window, current: current ? [...current] : null,
        neighbor: frame && frame.nr !== null && frame.nc !== null ? [frame.nr, frame.nc] : null,
        direction: frame ? frame.direction : null, phase, res: ans, processed: completed.size, omitted,
        condition: extra.condition ?? null, calculation: extra.calculation ? { ...extra.calculation } : null,
        order: [], index: -1, history: history.slice(-4).map(item => ({ ...item })), examplePaths: extra.examplePaths || [],
        stack: stack.slice(-8).map(item => ({ r: item.r, c: item.c, count: item.count, waiting: item.waiting })),
        depth: stack.length, cacheHits, root: root ? [...root] : null, answer: phase === "done" ? ans : null },
    });
  }
  emit(3, "mod", bi("MOD = 1,000,000,007", "MOD = 1,000,000,007"), bi("DFS trả số đường đã lấy modulo; ans cũng lấy modulo sau mỗi ô gốc.", "DFS returns a modulo count; ans is also reduced after each root."));
  emit(4, "dimensions", bi(`rows = ${rows}, cols = ${cols}`, `rows = ${rows}, cols = ${cols}`), bi("Đếm đường bắt đầu từ mọi ô.", "Count paths starting at every cell."));
  dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  emit(6, "init", bi("Khởi tạo dp bằng 0", "Initialize dp to 0"), bi("0 là chưa có kết quả cache. count riêng của mỗi DFS sẽ bắt đầu bằng 1.", "0 means no cached result. Each DFS has a separate count starting at 1."));
  emit(7, "directions", bi("Xuống → lên → phải → trái", "Down → up → right → left"), bi("Chỉ đi tới ô kề có giá trị lớn hơn; không đi chéo.", "Only move to a strictly larger neighbor; no diagonals."));
  emit(9, "define", bi("dfs(r,c) đếm đường bắt đầu tại (r,c)", "dfs(r,c) counts paths starting at (r,c)"), bi("Cần tính DFS con trước khi cộng kết quả của nó vào count cha.", "Compute the child DFS before adding its result to the parent's count."));

  // Explicit frames simulate the supplied recursive Python, including return order,
  // without imposing JavaScript's call-stack limit on full-size grids.
  const push = (r, c) => stack.push({ r, c, count: null, nr: null, nc: null, direction: null, nextDirection: 0, waiting: false, stage: "check" });
  function runDfs() {
    while (stack.length) {
      const f = stack.at(-1), { r, c } = f;
      if (f.stage === "check") {
        const cached = Boolean(dp[r][c]);
        emit(10, "cache-check", bi(`dfs(${r},${c}): dp = ${dp[r][c]}`, `dfs(${r},${c}): dp = ${dp[r][c]}`), cached
          ? bi("Đã có cache: trả ngay, không xét các hướng.", "Cached: return immediately without checking directions.")
          : bi("Chưa có cache: tính count cho ô này.", "No cached result: compute this cell's count."), { condition: cached });
        if (cached) {
          cacheHits++; returned = dp[r][c];
          emit(11, "cache-return", bi(`Dùng lại dp[${r}][${c}] = ${returned}`, `Reuse dp[${r}][${c}] = ${returned}`), bi("Memoization tránh tính lại nhánh DFS này.", "Memoization avoids recomputing this DFS branch."));
          stack.pop(); continue;
        }
        f.count = 1; f.stage = "explore";
        emit(13, "count-init", bi("count = 1: đường chỉ gồm ô hiện tại", "count = 1: the current cell alone"), bi("Mỗi lời gọi DFS có count riêng. Chưa ghi count vào dp.", "Each DFS call has its own count. It has not been stored in dp yet."));
        continue;
      }
      if (f.stage === "resume") {
        const before = f.count, child = returned;
        f.count += child; f.waiting = false; f.stage = "explore"; f.nextDirection++;
        emit(23, "count-add", bi(`count = ${before} + ${child} = ${f.count}`, `count = ${before} + ${child} = ${f.count}`), bi("DFS con đã trả về. Thêm ô cha vào trước mỗi đường của con tạo từng đường mới. Dòng này chưa lấy modulo.", "The child DFS returned. Prepending the parent to each child path creates a new path. This line does not apply modulo yet."), { calculation: { before, child, after: f.count } });
        continue;
      }
      if (f.nextDirection === 4) {
        f.nr = null; f.nc = null; f.direction = null;
        dp[r][c] = f.count % MOD; completed.add(r * cols + c);
        history.push({ r, c, value: grid[r][c], count: dp[r][c] });
        emit(25, "dp-write", bi(`Lưu dp[${r}][${c}] = ${f.count} % MOD = ${dp[r][c]}`, `Store dp[${r}][${c}] = ${f.count} % MOD = ${dp[r][c]}`), bi("Đã xét đủ bốn hướng. Lúc này mới lấy modulo và lưu kết quả hoàn chỉnh.", "All four directions are checked. Now reduce modulo and store the complete result."), { calculation: { before: f.count, after: dp[r][c], moduloOnly: true } });
        returned = dp[r][c];
        emit(26, "return", bi(`dfs(${r},${c}) trả ${returned}`, `dfs(${r},${c}) returns ${returned}`), stack.length > 1 ? bi("Trở về cha đang chờ; cha sẽ cộng số đường này.", "Return to the waiting parent; it will add this count.") : bi("Trở về vòng lặp ngoài để cập nhật ans.", "Return to the outer loop to update ans."));
        stack.pop(); continue;
      }
      f.direction = f.nextDirection; f.nr = null; f.nc = null;
      const [dr, dc] = DIRECTIONS[f.direction];
      emit(15, "direction", bi(`Xét hướng (${dr},${dc})`, `Check direction (${dr},${dc})`), bi("Mỗi hướng tạo một nhóm đường theo bước đi đầu tiên.", "Each direction forms a group of paths by their first move."));
      f.nr = r + dr;
      emit(16, "neighbor-row", bi(`nr = ${f.nr}`, `nr = ${f.nr}`), bi("Tính hàng ô kề.", "Compute the neighbor row."));
      f.nc = c + dc;
      emit(17, "neighbor-col", bi(`nc = ${f.nc}`, `nc = ${f.nc}`), bi("Tiếp theo kiểm tra biên và giá trị.", "Next check bounds and value."));
      const nr = f.nr, nc = f.nc, rowValid = nr >= 0 && nr < rows, colValid = nc >= 0 && nc < cols;
      const increasing = rowValid && colValid && grid[nr][nc] > grid[r][c];
      const note = !rowValid || !colValid ? bi(`(${nr},${nc}) ngoài biên → bỏ qua.`, `(${nr},${nc}) is outside the grid → skip.`)
        : increasing ? bi(`${grid[nr][nc]} > ${grid[r][c]} → gọi dfs(${nr},${nc}).`, `${grid[nr][nc]} > ${grid[r][c]} → call dfs(${nr},${nc}).`)
        : bi(`${grid[nr][nc]} ≤ ${grid[r][c]} → không tăng, bỏ qua.`, `${grid[nr][nc]} ≤ ${grid[r][c]} → not increasing, skip.`);
      emit(19, increasing ? "accept" : "reject", increasing ? bi("Ô kề hợp lệ", "Valid neighbor") : bi("Bỏ qua hướng này", "Skip this direction"), note,
        { condition: increasing, codeLines: !rowValid ? [19] : !colValid ? [19, 20] : [19, 20, 21] });
      if (increasing) {
        f.waiting = true; f.stage = "resume";
        emit(23, "call", bi(`dfs(${r},${c}) chờ dfs(${nr},${nc})`, `dfs(${r},${c}) waits for dfs(${nr},${nc})`), bi("count cha giữ nguyên trong lúc DFS con đang chạy.", "The parent's count stays unchanged while the child DFS runs."));
        push(nr, nc);
      } else f.nextDirection++;
    }
    return returned;
  }
  ans = 0;
  emit(28, "total-init", bi("ans = 0: tổng toàn grid", "ans = 0: total for the grid"), bi("ans chỉ cộng sau khi DFS của ô gốc đã trả về.", "Update ans only after the root DFS returns."));
  for (let r = 0; r < rows; r++) {
    emit(30, "row", bi(`Duyệt hàng ${r}`, `Scan row ${r}`), bi("Thử từng ô làm điểm bắt đầu.", "Try every cell as a starting point."));
    for (let c = 0; c < cols; c++) {
      root = [r, c];
      emit(31, "root", bi(`Ô gốc (${r},${c})`, `Root cell (${r},${c})`), bi("Ô này có thể đã được tính từ DFS của ô gốc trước.", "This cell may already have been computed by a previous root's DFS."));
      emit(32, "root-call", bi(`Gọi dfs(${r},${c}) trước khi cộng vào ans`, `Call dfs(${r},${c}) before adding to ans`), bi("ans giữ nguyên trong toàn bộ lời gọi này.", "ans stays unchanged throughout this call."));
      push(r, c); const cellCount = runDfs(), before = ans;
      ans = (ans + cellCount) % MOD;
      emit(32, "total", bi(`ans = (${before} + ${cellCount}) % MOD = ${ans}`, `ans = (${before} + ${cellCount}) % MOD = ${ans}`), bi("Cộng các đường có điểm bắt đầu ở ô gốc này. Cache không làm mất đóng góp của ô gốc.", "Add paths starting at this root. A cached result still contributes to the root's total."), { calculation: { before, cellCount, after: ans } });
    }
  }
  root = null;
  emit(34, "done", bi(`Trả ans = ${ans}`, `Return ans = ${ans}`), bi(`Đã lưu dp cho ${completed.size} ô và dùng lại cache ${cacheHits} lần. Cộng số đường từ mọi ô gốc.`, `Stored dp for ${completed.size} cells and reused the cache ${cacheHits} times. Sum path counts from every root.`), { examplePaths: enumeratePaths(grid) });
  return { original: grid, answer: ans, dp: dp.map(row => [...row]), steps };
}
module.exports = { SOURCE, buildSteps };

