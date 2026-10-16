"use strict";

const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "import heapq",
  "from typing import List",
  "",
  "class Solution:",
  "    def maximumMinimumPath(self, grid: List[List[int]]) -> int:",
  "        rows, cols = len(grid), len(grid[0])",
  "        best = [[-1] * cols for _ in range(rows)]",
  "        best[0][0] = grid[0][0]",
  "        heap = [(-grid[0][0], 0, 0)]",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "        while heap:",
  "            neg_score, r, c = heapq.heappop(heap)",
  "            score = -neg_score",
  "            if score != best[r][c]:",
  "                continue",
  "            if r == rows - 1 and c == cols - 1:",
  "                return score",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if 0 <= nr < rows and 0 <= nc < cols:",
  "                    candidate = min(score, grid[nr][nc])",
  "                    if candidate > best[nr][nc]:",
  "                        best[nr][nc] = candidate",
  "                        heapq.heappush(heap, (-candidate, nr, nc))",
  "        return -1",
]);

function parseInput(input) {
  let grid = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { grid = JSON.parse(text); }
      catch { throw new Error("1102: JSON lưới không hợp lệ / Invalid grid JSON."); }
    } else {
      grid = text.split(/[|;]/).map(row => row.split(",").map(value => value.trim() === "" ? NaN : Number(value.trim())));
    }
  }
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 100 || !Array.isArray(grid[0]) || grid[0].length < 1 || grid[0].length > 100 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length)) {
    throw new RangeError("1102: lưới chữ nhật, 1..100 hàng/cột / Rectangular grid, 1..100 rows/columns.");
  }
  if (grid.some(row => row.some(value => !Number.isInteger(value) || value < 0 || value > 1e9))) {
    throw new RangeError("1102: mỗi ô là số nguyên 0..10⁹ / Cell values must be integers in 0..10⁹.");
  }
  return grid.map(row => [...row]);
}

// Match heapq's tuple comparison AND internal heap layout for the debugger.
const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])));
function siftUp(heap, start, position) {
  const item = heap[position];
  while (position > start) {
    const parent = (position - 1) >> 1;
    if (!less(item, heap[parent])) break;
    heap[position] = heap[parent];
    position = parent;
  }
  heap[position] = item;
}
function push(heap, item) { heap.push(item); siftUp(heap, 0, heap.length - 1); }
function pop(heap) {
  const last = heap.pop();
  if (!heap.length) return last;
  const first = heap[0];
  let position = 0, child = 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && !less(heap[child], heap[right])) child = right;
    heap[position] = heap[child];
    position = child;
    child = position * 2 + 1;
  }
  heap[position] = last;
  siftUp(heap, 0, position);
  return first;
}
const copy = value => Array.isArray(value) ? value.map(copy) : value;

function reachableAt(grid, threshold) {
  const rows = grid.length, cols = grid[0].length;
  if (grid[0][0] < threshold) return false;
  const seen = new Set([0]), queue = [[0, 0]];
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i];
    if (r === rows - 1 && c === cols - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, id = nr * cols + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] >= threshold && !seen.has(id)) {
        seen.add(id); queue.push([nr, nc]);
      }
    }
  }
  return false;
}

function buildSteps(input) {
  const grid = parseInput(input), height = grid.length, width = grid[0].length;
  const steps = [], settled = new Set();
  const parent = Array.from({ length: height }, () => Array(width).fill(null));
  const maxValue = Math.max(...grid.flat());
  let rows, cols, best, heap, directions, neg_score, score, r, c, dr, dc, nr, nc, candidate, rowIndex;
  let capacity = null, probeActive = false, oldBest = null, events = 0, omitted = 0;
  const cap = 1600;
  const axis = (size, coordinate) => size <= 6 ? Array.from({ length: size }, (_, i) => i)
    : [...new Set([0, 1, size - 1, coordinate === undefined ? null : coordinate - 1, coordinate, coordinate === undefined ? null : coordinate + 1])]
      .filter(i => Number.isInteger(i) && i >= 0 && i < size).sort((a, b) => a - b);

  function emit(line, phase, extra = {}) {
    events++;
    if (steps.length >= cap && !extra.final) { omitted++; return; }
    const locals = {};
    for (const [name, value] of Object.entries({ rows, cols, directions, neg_score, score, r, c, dr, dc, nr, nc, candidate, _: rowIndex })) {
      if (value !== undefined) locals[name] = copy(value);
    }
    const visibleRows = axis(height, r), visibleCols = axis(width, c);
    const queued = new Set((heap || []).map(([, rr, cc]) => rr * width + cc));
    const inside = probeActive && nr >= 0 && nr < height && nc >= 0 && nc < width;
    const probe = probeActive ? {
      r: nr, c: nc, inside, value: inside ? grid[nr][nc] : null, oldBest: inside ? oldBest : null,
      candidate: inside && ["compare", "update", "push"].includes(phase) ? candidate : null,
    } : null;
    const view = {
      height, width, maxValue, phase, source: { line, text: CODE[line - 1], scope: "maximumMinimumPath", timing: "before" },
      locals, capacity, current: r === undefined ? null : [r, c], probe, heap: heap ? copy(heap) : [],
      rows: visibleRows, cols: visibleCols,
      cells: visibleRows.map(rr => visibleCols.map(cc => ({
        r: rr, c: cc, value: grid[rr][cc], best: best ? best[rr][cc] : null,
        allowed: capacity !== null && grid[rr][cc] >= capacity,
        settled: settled.has(rr * width + cc), queued: queued.has(rr * width + cc),
      }))),
      cropped: visibleRows.length < height || visibleCols.length < width,
      final: false, answer: null, path: [], higherReachable: null, ...extra,
    };
    steps.push({
      arr: [], highlight: [], mark: [], codeLines: [line], final: !!extra.final,
      title: bi("Đường đi có nút thắt lớn nhất", "Path with the strongest bottleneck"), note: bi("", ""),
      vars: Object.entries(locals).filter(([name]) => name !== "_").map(([name, value]) => ({ name, value })),
      maximin1102View: view,
    });
  }

  emit(6, "size"); rows = height; cols = width;
  // CPython 3.12+ inlines the list comprehension and emits this line for each row.
  emit(7, "best");
  for (rowIndex = 0; rowIndex < rows; rowIndex++) emit(7, "best");
  rowIndex = undefined;
  best = Array.from({ length: rows }, () => Array(cols).fill(-1));
  emit(8, "start"); best[0][0] = grid[0][0];
  emit(9, "seed"); heap = [[0 - grid[0][0], 0, 0]];
  emit(10, "directions"); directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (true) {
    emit(11, "while"); if (!heap.length) break;
    probeActive = false;
    emit(12, "pop"); [neg_score, r, c] = pop(heap); capacity = null;
    emit(13, "score"); score = 0 - neg_score; capacity = score;
    emit(14, "stale"); if (score !== best[r][c]) { emit(15, "skip-stale"); continue; }
    settled.add(r * width + c);
    emit(16, "target");
    if (r === rows - 1 && c === cols - 1) {
      const path = [];
      for (let current = [r, c]; current; current = parent[current[0]][current[1]]) path.push([...current, grid[current[0]][current[1]]]);
      path.reverse();
      emit(17, "found", { final: true, answer: score, path, higherReachable: reachableAt(grid, score + 1) });
      const trace = { events, captured: steps.length, omitted, truncated: omitted > 0 };
      for (const step of steps) step.maximin1102View.trace = trace;
      return { original: grid, grid, answer: score, steps };
    }
    for (let i = 0; ; i++) {
      emit(18, "direction"); if (i === directions.length) break;
      [dr, dc] = directions[i]; probeActive = false;
      emit(19, "neighbor"); nr = r + dr; nc = c + dc; probeActive = true;
      oldBest = nr >= 0 && nr < rows && nc >= 0 && nc < cols ? best[nr][nc] : null;
      emit(20, "bounds"); if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      emit(21, "min"); candidate = Math.min(score, grid[nr][nc]);
      emit(22, "compare");
      if (candidate > best[nr][nc]) {
        emit(23, "update"); best[nr][nc] = candidate; parent[nr][nc] = [r, c];
        emit(24, "push"); push(heap, [0 - candidate, nr, nc]);
      }
    }
    probeActive = false;
  }
  throw new Error("1102: a rectangular grid must have a path to the target.");
}

module.exports = { 1102: {
  id: 1102, difficulty: "medium", premium: true, slug: "path-with-maximum-minimum-value",
  category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "dijkstra", vi: "Dijkstra", en: "Dijkstra" }, { key: "minimax", vi: "Minimax", en: "Minimax" }],
  title: bi("Path With Maximum Minimum Value", "Path With Maximum Minimum Value"),
  titleVi: bi("Maximin · đường đi có nút thắt lớn nhất", "Maximin · the strongest bottleneck path"),
  statement: bi("Đi 4 hướng từ S ở góc trên trái đến T ở góc dưới phải. Điểm đường đi là giá trị ô nhỏ nhất, kể cả S và T. Tìm điểm lớn nhất có thể.", "Move in four directions from top-left S to bottom-right T. A path’s score is its minimum cell value, including S and T. Maximize this score."),
  defaultInput: "[[5,4,5],[1,2,6],[7,4,6]]", inputKind: "string", singleInput: true,
  inputLabel: bi("grid · [[5,4,5],[1,2,6],[7,4,6]] hoặc 5,4,5|1,2,6|7,4,6", "grid · [[5,4,5],[1,2,6],[7,4,6]] or 5,4,5|1,2,6|7,4,6"),
  debugMode: "line-by-line",
  approach: [
    bi("best[r][c] = điểm lớn nhất của đường từ S tới ô (r,c). -1 nghĩa là chưa tìm thấy.", "best[r][c] is the largest path score from S to (r,c). -1 means undiscovered."),
    bi("Max-heap lấy score lớn nhất. Sang ô kế: candidate = min(score, giá trị ô kế).", "Pop the largest score from a max-heap. Moving to a neighbor: candidate = min(score, next cell value)."),
    bi("Chỉ cập nhật khi candidate lớn hơn best. Pop đích hợp lệ → trả score; Python dùng -score trong heapq.", "Update only when candidate exceeds best. Validly pop the target → return score; Python stores -score in heapq."),
  ],
  complexity: { time: "O(RC log(RC))", space: "O(RC)", note: bi("Không sửa grid. Hỗ trợ R,C ≤ 100 và giá trị 0..10⁹. Lưới lớn rút gọn hình/trace, vẫn tính đầy đủ đáp án.", "Does not mutate grid. Supports R,C ≤ 100 and values 0..10⁹. Large grids condense the picture/trace; the answer is fully computed.") },
  code: CODE, builder: buildSteps, parseInput, liveArgs: input => [parseInput(input)],
} };
