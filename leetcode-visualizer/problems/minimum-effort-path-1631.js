"use strict";
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "import heapq",
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumEffortPath(self, heights: List[List[int]]) -> int:",
  "        rows, cols = len(heights), len(heights[0])",
  "        best = [[float('inf')] * cols for _ in range(rows)]",
  "        best[0][0] = 0",
  "        heap = [(0, 0, 0)]",
  "        directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]",
  "        while heap:",
  "            effort, r, c = heapq.heappop(heap)",
  "            if effort != best[r][c]:",
  "                continue",
  "            if r == rows - 1 and c == cols - 1:",
  "                return effort",
  "            for dr, dc in directions:",
  "                nr, nc = r + dr, c + dc",
  "                if 0 <= nr < rows and 0 <= nc < cols:",
  "                    diff = abs(heights[r][c] - heights[nr][nc])",
  "                    candidate = max(effort, diff)",
  "                    if candidate < best[nr][nc]:",
  "                        best[nr][nc] = candidate",
  "                        heapq.heappush(heap, (candidate, nr, nc))",
  "        return 0",
]);

function parseInput(input) {
  let grid = input;
  if (typeof input === "string") {
    const text = input.trim();
    if (text.startsWith("[")) {
      try { grid = JSON.parse(text); } catch { throw new Error("1631: JSON lưới không hợp lệ / Invalid grid JSON."); }
    } else grid = text.split(/[|;]/).map(row => row.split(",").map(x => x.trim() === "" ? NaN : Number(x.trim())));
  }
  if (!Array.isArray(grid) || !grid.length || grid.length > 100 || !Array.isArray(grid[0]) || !grid[0].length || grid[0].length > 100 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length)) throw new RangeError("1631: lưới chữ nhật, 1..100 hàng/cột / Rectangular grid, 1..100 rows/columns.");
  if (grid.some(row => row.some(x => !Number.isInteger(x) || x < 1 || x > 1e6))) throw new RangeError("1631: độ cao nguyên từ 1..10⁶ / Integer heights in 1..10⁶.");
  return grid.map(row => [...row]);
}
const copy = value => Array.isArray(value) ? value.map(copy) : value === Infinity ? "∞" : value;
const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (a[1] === b[1] && a[2] < b[2])));
function sift(heap, start, position) {
  const item = heap[position];
  while (position > start) {
    const parent = (position - 1) >> 1;
    if (!less(item, heap[parent])) break;
    heap[position] = heap[parent]; position = parent;
  }
  heap[position] = item;
}
function push(heap, item) { heap.push(item); sift(heap, 0, heap.length - 1); }
function pop(heap) {
  const last = heap.pop(); if (!heap.length) return last;
  const first = heap[0]; let position = 0, child = 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && !less(heap[child], heap[right])) child = right;
    heap[position] = heap[child]; position = child; child = position * 2 + 1;
  }
  heap[position] = last; sift(heap, 0, position); return first;
}

function reachableAt(grid, threshold) {
  if (threshold < 0) return false;
  const rows = grid.length, cols = grid[0].length, seen = new Set([0]), queue = [[0, 0]];
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i]; if (r === rows - 1 && c === cols - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, id = nr * cols + nc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(id) && Math.abs(grid[r][c] - grid[nr][nc]) <= threshold) { seen.add(id); queue.push([nr, nc]); }
    }
  }
  return false;
}

// Both algorithms use immutable, BEFORE-line pictures. Large traces preserve
// their exact prefix and final result, explicitly disclosing omitted events.
function createRecorder(grid, code, codeBlock, algorithm) {
  const height = grid.length, width = grid[0].length, steps = [];
  let events = 0, omitted = 0;
  const state = { best: null, heap: [], current: null, capacity: null, probe: null, settled: new Set(), parent: null, sizes: null, edges: null, activeEdge: null, accepted: new Set(), skipped: new Set(), processed: 0 };
  const axis = (size, coord) => size <= 6 ? Array.from({ length: size }, (_, i) => i) : [...new Set([0, 1, size - 1, coord === undefined ? null : coord - 1, coord, coord === undefined ? null : coord + 1])].filter(i => Number.isInteger(i) && i >= 0 && i < size).sort((a, b) => a - b);
  const root = id => { while (state.parent && state.parent[id] !== id) id = state.parent[id]; return id; };
  function emit(line, phase, values, scope = "minimumEffortPath", extra = {}) {
    events++;
    if (steps.length >= 1600 && !extra.final) { omitted++; return; }
    const locals = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined).map(([name, value]) => [name, copy(value)]));
    const current = scope === "find" ? [Math.floor(values.x / width), values.x % width] : state.current;
    const rows = axis(height, current?.[0]), cols = axis(width, current?.[1]);
    const queued = new Set(state.heap.map(([, r, c]) => r * width + c));
    const view = {
      algorithm, height, width, rows, cols, phase, source: { line, text: code[line - 1], scope, timing: "before" }, locals,
      current: current ? [...current] : null, capacity: state.capacity, probe: state.probe ? { ...state.probe } : null,
      heap: copy(state.heap),
      cells: rows.map(r => cols.map(c => ({ r, c, value: grid[r][c], best: state.best ? copy(state.best[r][c]) : null, queued: queued.has(r * width + c), settled: state.settled.has(r * width + c), root: state.parent ? root(r * width + c) : null }))),
      parent: state.parent ? [...state.parent] : null, sizes: state.sizes ? [...state.sizes] : null,
      edges: state.edges ? copy(state.edges) : [], sorted: !!state.sorted, activeEdge: state.activeEdge ? [...state.activeEdge] : null,
      accepted: [...state.accepted], skipped: [...state.skipped], processed: state.processed,
      cropped: rows.length < height || cols.length < width, final: false, answer: null, path: [], lowerReachable: null, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeBlock, codeLines: [line], final: !!extra.final, title: bi("Đường đi ít tốn sức nhất", "The minimum-effort path"), note: bi("", ""), vars: Object.entries(locals).filter(([name]) => !["_", "parent", "size", "edges"].includes(name)).map(([name, value]) => ({ name, value })), effort1631View: view });
  }
  function finish(answer, path, line, values) {
    state.probe = null;
    emit(line, "found", values, "minimumEffortPath", { final: true, answer, path, lowerReachable: reachableAt(grid, answer - 1) });
    const trace = { events, omitted, captured: steps.length, truncated: omitted > 0 };
    for (const step of steps) step.effort1631View.trace = trace;
    return { original: grid, heights: grid, answer, steps };
  }
  return { state, emit, finish };
}

function buildDijkstra(input) {
  const heights = parseInput(input), height = heights.length, width = heights[0].length;
  const { state, emit, finish } = createRecorder(heights, CODE, 2, "dijkstra");
  const parent = Array.from({ length: height }, () => Array(width).fill(null));
  let rows, cols, best, heap, directions, effort, r, c, dr, dc, nr, nc, diff, candidate, rowIndex;
  const locals = () => ({ rows, cols, directions, effort, r, c, dr, dc, nr, nc, diff, candidate, _: rowIndex });
  const snap = (line, phase) => emit(line, phase, locals());
  snap(6, "size"); rows = height; cols = width;
  snap(7, "best"); for (rowIndex = 0; rowIndex < rows; rowIndex++) snap(7, "best"); rowIndex = undefined;
  best = state.best = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  snap(8, "start"); best[0][0] = 0;
  snap(9, "seed"); heap = state.heap = [[0, 0, 0]];
  snap(10, "directions"); directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (true) {
    snap(11, "while"); if (!heap.length) break;
    state.probe = null;
    snap(12, "pop"); [effort, r, c] = pop(heap); state.capacity = effort; state.current = [r, c];
    snap(13, "stale"); if (effort !== best[r][c]) { snap(14, "skip-stale"); continue; }
    state.settled.add(r * width + c);
    snap(15, "target");
    if (r === rows - 1 && c === cols - 1) {
      const path = [];
      for (let cell = [r, c]; cell; cell = parent[cell[0]][cell[1]]) path.push([...cell, heights[cell[0]][cell[1]]]);
      return finish(effort, path.reverse(), 16, locals());
    }
    for (let i = 0; ; i++) {
      snap(17, "direction"); if (i === directions.length) break;
      [dr, dc] = directions[i]; state.probe = null;
      snap(18, "neighbor"); nr = r + dr; nc = c + dc;
      const inside = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      state.probe = { r: nr, c: nc, inside, fromValue: heights[r][c], value: inside ? heights[nr][nc] : null, diff: null, candidate: null, oldBest: inside ? copy(best[nr][nc]) : null };
      snap(19, "bounds"); if (!inside) continue;
      snap(20, "diff"); diff = Math.abs(heights[r][c] - heights[nr][nc]); state.probe.diff = diff;
      snap(21, "max"); candidate = Math.max(effort, diff); state.probe.candidate = candidate;
      snap(22, "compare");
      if (candidate < best[nr][nc]) {
        snap(23, "update"); best[nr][nc] = candidate; parent[nr][nc] = [r, c];
        snap(24, "push"); push(heap, [candidate, nr, nc]);
      }
    }
    state.probe = null;
  }
  throw new Error("1631: rectangular grids must have a path.");
}

const kruskal = require("./minimum-effort-kruskal-1631");
module.exports = { 1631: {
  id: 1631, difficulty: "medium", slug: "path-with-minimum-effort",
  category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "dijkstra", vi: "Dijkstra", en: "Dijkstra" }, { key: "minimax", vi: "Minimax", en: "Minimax" }],
  title: bi("Path With Minimum Effort", "Path With Minimum Effort"), titleVi: bi("Minimax · giảm cạnh khó nhất", "Minimax · minimize the hardest edge"),
  statement: bi("Đi 4 hướng từ S ở góc trên trái đến T ở góc dưới phải. Mỗi bước tốn |cao A − cao B|. Effort của đường là bước lớn nhất; tìm effort nhỏ nhất.", "Move in four directions from top-left S to bottom-right T. Each step costs |height A − height B|. A path’s effort is its largest step cost; minimize it."),
  defaultInput: "1,2,2;3,8,2;5,3,5", inputKind: "string", debugMode: "line-by-line",
  inputLabel: bi("heights · [[1,2,2],[3,8,2],[5,3,5]] hoặc 1,2,2|3,8,2|5,3,5", "heights · [[1,2,2],[3,8,2],[5,3,5]] or 1,2,2|3,8,2|5,3,5"),
  extraParams: [{ key: "approach", label: bi("Cách giải", "Approach"), type: "select", default: "2", options: [{ value: "2", label: bi("Cách 2: Dijkstra · nên học trước", "Approach 2: Dijkstra · start here") }, { value: "1", label: bi("Cách 1: Kruskal + DSU", "Approach 1: Kruskal + DSU") }] }],
  approach: [bi("Effort là max |diff| giữa hai ô kề nhau trên đường.", "Effort is the maximum |difference| between adjacent cells on a path."), bi("Dijkstra: candidate = max(effort, diff); chỉ giữ best nhỏ hơn. Dừng khi pop đích hợp lệ.", "Dijkstra: candidate = max(effort, diff); keep smaller best values. Stop when the target is validly popped."), bi("Kruskal: thêm cạnh nhỏ trước, union theo size và nén đường đi; S nối T → có đáp án.", "Kruskal: add smaller edges first, union by size with path compression; connecting S to T gives the answer.")],
  complexity: { time: "O(RC log(RC))", space: "O(RC)", note: bi("Cả hai cách hỗ trợ R,C ≤ 100, không sửa heights. Lưới lớn rút gọn trace/hình và ghi rõ số sự kiện đã lược.", "Both approaches support R,C ≤ 100 without mutating heights. Large grids condense the trace/picture and disclose omitted events.") },
  code: kruskal.CODE, code2: CODE, codeLabel: bi("Cách 1: Kruskal + DSU", "Approach 1: Kruskal + DSU"), code2Label: bi("Cách 2: Dijkstra Minimax", "Approach 2: Minimax Dijkstra"),
  builder: (input, params = {}) => String(params.approach ?? "2") === "1" ? kruskal.buildSteps(parseInput(input), createRecorder) : buildDijkstra(input),
  parseInput, liveArgs: input => [parseInput(input)],
} };
module.exports.buildDijkstra = buildDijkstra;
