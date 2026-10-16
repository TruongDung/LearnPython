"use strict";
const CODE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumEffortPath(self, heights: List[List[int]]) -> int:",
  "        rows, cols = len(heights), len(heights[0])",
  "        edges = []",
  "        for r in range(rows):",
  "            for c in range(cols):",
  "                if r + 1 < rows:",
  "                    diff = abs(heights[r][c] - heights[r + 1][c])",
  "                    edges.append((diff, r * cols + c, (r + 1) * cols + c))",
  "                if c + 1 < cols:",
  "                    diff = abs(heights[r][c] - heights[r][c + 1])",
  "                    edges.append((diff, r * cols + c, r * cols + c + 1))",
  "        edges.sort()",
  "        parent = list(range(rows * cols))",
  "        size = [1] * (rows * cols)",
  "        def find(x: int) -> int:",
  "            while x != parent[x]:",
  "                parent[x] = parent[parent[x]]",
  "                x = parent[x]",
  "            return x",
  "        for diff, a, b in edges:",
  "            root_a, root_b = find(a), find(b)",
  "            if root_a == root_b:",
  "                continue",
  "            if size[root_a] < size[root_b]:",
  "                root_a, root_b = root_b, root_a",
  "            parent[root_b] = root_a",
  "            size[root_a] += size[root_b]",
  "            if find(0) == find(rows * cols - 1):",
  "                return diff",
  "        return 0",
]);

function buildSteps(heights, createRecorder) {
  const height = heights.length, width = heights[0].length;
  const { state, emit, finish } = createRecorder(heights, CODE, 1, "kruskal");
  let rows, cols, edges, r, c, diff, parent, size, a, b, root_a, root_b;
  const locals = () => ({ rows, cols, edges, r, c, diff, parent, size, a, b, root_a, root_b });
  const snap = (line, phase) => emit(line, phase, locals());
  const coord = id => [Math.floor(id / width), id % width];
  function find(start) {
    let x = start;
    const frame = () => ({ x, parent });
    while (true) {
      emit(19, "find-check", frame(), "find"); if (x === parent[x]) break;
      emit(20, "compress", frame(), "find"); parent[x] = parent[parent[x]];
      emit(21, "climb", frame(), "find"); x = parent[x];
    }
    emit(22, "find-root", frame(), "find"); return x;
  }
  function path() {
    const total = height * width, graph = Array.from({ length: total }, () => []);
    for (const key of state.accepted) {
      const [u, v] = key.split(":").map(Number); graph[u].push(v); graph[v].push(u);
    }
    const previous = Array(total).fill(null), queue = [0]; previous[0] = -1;
    for (let i = 0; i < queue.length; i++) for (const next of graph[queue[i]]) if (previous[next] === null) { previous[next] = queue[i]; queue.push(next); }
    const route = [];
    for (let id = total - 1; id !== -1; id = previous[id]) { const [rr, cc] = coord(id); route.push([rr, cc, heights[rr][cc]]); }
    return route.reverse();
  }
  snap(5, "size"); rows = height; cols = width;
  snap(6, "edges"); edges = state.edges = [];
  for (let ri = 0; ; ri++) {
    snap(7, "row"); if (ri === rows) break; r = ri;
    for (let ci = 0; ; ci++) {
      snap(8, "column"); if (ci === cols) break; c = ci; state.current = [r, c];
      snap(9, "down");
      if (r + 1 < rows) {
        snap(10, "edge-diff"); diff = Math.abs(heights[r][c] - heights[r + 1][c]);
        state.activeEdge = [diff, r * cols + c, (r + 1) * cols + c];
        snap(11, "append-edge"); edges.push([...state.activeEdge]);
      }
      state.activeEdge = null;
      snap(12, "right");
      if (c + 1 < cols) {
        snap(13, "edge-diff"); diff = Math.abs(heights[r][c] - heights[r][c + 1]);
        state.activeEdge = [diff, r * cols + c, r * cols + c + 1];
        snap(14, "append-edge"); edges.push([...state.activeEdge]);
      }
      state.activeEdge = null;
    }
  }
  state.current = null;
  snap(15, "sort"); edges.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); state.sorted = true;
  snap(16, "parents"); parent = state.parent = Array.from({ length: rows * cols }, (_, i) => i);
  snap(17, "sizes"); size = state.sizes = Array(rows * cols).fill(1);
  snap(18, "define-find");
  for (let i = 0; ; i++) {
    snap(23, "next-edge"); if (i === edges.length) break;
    [diff, a, b] = edges[i]; state.activeEdge = [...edges[i]]; state.capacity = diff; state.current = coord(a);
    snap(24, "find-pair");
    const first = find(a), second = find(b); root_a = first; root_b = second;
    snap(25, "same-root");
    const key = `${a}:${b}`;
    if (root_a === root_b) { snap(26, "cycle"); state.skipped.add(key); state.processed++; continue; }
    snap(27, "choose-root");
    if (size[root_a] < size[root_b]) { snap(28, "swap"); [root_a, root_b] = [root_b, root_a]; }
    snap(29, "link"); parent[root_b] = root_a; state.accepted.add(key);
    snap(30, "grow"); size[root_a] += size[root_b]; state.processed++;
    snap(31, "check-connected");
    const sourceRoot = find(0), targetRoot = find(rows * cols - 1);
    if (sourceRoot === targetRoot) return finish(diff, path(), 32, locals());
  }
  state.capacity = 0;
  return finish(0, [[0, 0, heights[0][0]]], 33, locals());
}

module.exports = { CODE, buildSteps };
