"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def findMinHeightTrees(self, n, edges):",
  "        if n <= 2: return list(range(n))",
  "        graph = [[] for _ in range(n)]",
  "        for a, b in edges:",
  "            graph[a].append(b); graph[b].append(a)",
  "        leaves = [i for i in range(n) if len(graph[i]) == 1]",
  "        remaining = n",
  "        while remaining > 2:",
  "            remaining -= len(leaves)",
  "            next_leaves = []",
  "            for leaf in leaves:",
  "                neighbor = graph[leaf].pop()",
  "                graph[neighbor].remove(leaf)",
  "                if len(graph[neighbor]) == 1:",
  "                    next_leaves.append(neighbor)",
  "            leaves = next_leaves",
  "        return leaves",
];

function parseInput(input, params = {}) {
  let n = Number(params.n);
  let edges = input;
  if (input && !Array.isArray(input) && typeof input === "object") {
    n = Number(input.n ?? params.n);
    edges = input.edges;
  }
  if (typeof edges === "string") edges = edges.trim() ? edges.split(/[;,\s]+/).filter(Boolean).map((edge) => edge.split("-").map(Number)) : [];
  if (!Array.isArray(edges) || !Number.isInteger(n) || n < 1 || n > 15
    || edges.some((edge) => !Array.isArray(edge) || edge.length !== 2 || edge.some((v) => !Number.isInteger(v) || v < 0 || v >= n))) {
    throw new RangeError("310: Use n from 1–15 and edges like 0-1,1-2 / Nhập n từ 1–15 và cạnh dạng 0-1,1-2.");
  }
  if (edges.length !== n - 1) throw new RangeError("310: A tree needs n−1 edges / Cây cần n−1 cạnh.");
  const seen = new Set(); const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
  for (const [a, b] of edges) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a === b || seen.has(key) || find(a) === find(b)) throw new RangeError("310: Edges must form a tree / Các cạnh phải tạo thành cây.");
    seen.add(key); parent[find(a)] = find(b);
  }
  return { n, edges: edges.map(([a, b]) => [a, b]) };
}

function buildSteps(input, params = {}) {
  const { n, edges } = parseInput(input, params);
  const graph = Array.from({ length: n }, () => []);
  const degree = Array(n).fill(0); const removed = new Set(); const steps = [];
  let leaves = []; let layer = 0; let current = null; let neighbor = null; let roots = [];
  let phase = "start";

  function emit(line, final = false) {
    steps.push({
      title: bi(phase === "start" ? "Cây ban đầu" : phase === "small" ? "Tâm đã rõ" : phase === "build" ? "Nối cạnh" : phase === "leaves" ? `Lá ${leaves.length}` : phase === "round" ? `Tỉa lớp ${layer + 1}` : phase === "next" ? "Lá mới" : phase === "leaf" ? `Bỏ lá ${current}` : phase === "edge" ? `Cắt cạnh ${current}—${neighbor}` : phase === "degree" ? `Bậc ${neighbor}: ${degree[neighbor]}` : phase === "center" ? `Tâm cây: ${roots.join(", ")}` : `Tâm: ${roots.join(", ")}`,
        phase === "start" ? "Tree" : phase === "small" ? "Center found" : phase === "build" ? "Add edge" : phase === "leaves" ? `${leaves.length} leaves` : phase === "round" ? `Peel layer ${layer + 1}` : phase === "next" ? "New leaves" : phase === "leaf" ? `Remove leaf ${current}` : phase === "edge" ? `Cut edge ${current}—${neighbor}` : phase === "degree" ? `Degree ${neighbor}: ${degree[neighbor]}` : phase === "center" ? `Tree center: ${roots.join(", ")}` : `Center: ${roots.join(", ")}`),
      note: bi("", ""), arr: Array(n).fill(0), highlight: current === null ? [] : [current], mark: [...roots], codeLines: [line], final,
      vars: [{ name: "remaining", value: n - removed.size }, { name: "layer", value: layer }, { name: "leaves", value: `{${leaves.join(",")}}` }, { name: "center", value: roots.length ? `{${roots.join(",")}}` : "—" }],
      minimumHeightTrees310View: { phase, n, edges: edges.map(([a,b]) => [a,b]), graph: graph.map((list) => [...list]), degree: [...degree], leaves: [...leaves], removed: [...removed], layer, current, neighbor, roots: [...roots] },
    });
  }

  emit(1); phase = "start"; emit(2);
  phase = "small"; emit(3);
  if (n <= 2) { roots = Array.from({ length: n }, (_, i) => i); phase = "done"; emit(18, true); return { original: edges, answer: roots, steps }; }
  phase = "build"; emit(4); emit(5);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); degree[a]++; degree[b]++; emit(6); }
  leaves = degree.flatMap((d, i) => d === 1 ? [i] : []); phase = "leaves"; emit(7);
  emit(8);
  while (n - removed.size > 2) {
    phase = "round"; emit(9);
    const thisLayer = [...leaves]; thisLayer.forEach((leaf) => removed.add(leaf));
    emit(10); phase = "next"; const next = []; emit(11);
    for (const leaf of thisLayer) {
      current = leaf; phase = "leaf"; emit(12);
      neighbor = graph[leaf].find((v) => !removed.has(v));
      if (neighbor === undefined) continue;
      graph[leaf] = graph[leaf].filter((v) => v !== neighbor);
      graph[neighbor] = graph[neighbor].filter((v) => v !== leaf);
      degree[leaf] = 0; emit(13);
      current = leaf; phase = "edge"; emit(14);
      degree[neighbor]--; current = null; phase = "degree"; emit(15);
      if (degree[neighbor] === 1) { next.push(neighbor); phase = "next"; current = neighbor; emit(16); }
    }
    leaves = next; current = null; neighbor = null; layer++; phase = "center"; emit(17);
  }
  roots = Array.from({ length: n }, (_, i) => i).filter((i) => !removed.has(i));
  phase = "done"; emit(18, true);
  return { original: edges, answer: roots, steps };
}

module.exports = { 310: {
  id: 310, slug: "minimum-height-trees", difficulty: "medium", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "topological-sort", vi: "Tỉa lá", en: "Leaf trimming" }],
  title: bi("Minimum Height Trees", "Minimum Height Trees"), titleVi: bi("Cây có chiều cao nhỏ nhất", "Minimum height trees"),
  statement: bi("Tìm nút gốc giúp cây có chiều cao nhỏ nhất.", "Find the root node(s) that produce the smallest tree height."),
  defaultInput: "0-1,1-2,1-3,3-4,3-5", inputKind: "string", inputLabel: bi("edges · cặp nút dạng 0-1,1-2", "edges · node pairs like 0-1,1-2"),
  extraParams: [{ key: "n", label: bi("n · số nút", "n · nodes"), default: 6 }], debugMode: "line-by-line",
  approach: [bi("Tỉa các lá ngoài cùng theo từng lớp.", "Peel the outer leaves one layer at a time."), bi("Còn 1–2 nút thì đó là tâm cây.", "The last one or two nodes are the tree centers.")],
  complexity: { time: "O(n)", space: "O(n)", note: bi("Minh họa giới hạn 15 nút để dễ theo dõi.", "Visualization supports up to 15 nodes for readability.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => [parseInput(input, params)],
} };
