"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE = [
  "class Solution:",
  "    def leadsToDestination(self, n, edges, source, destination):",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges: graph[u].append(v)",
  "        color = [0] * n  # 0=new, 1=visiting, 2=good, 3=bad",
  "        def dfs(node):",
  "            if not graph[node]: return node == destination",
  "            if color[node] == 1: return False",
  "            if color[node] == 2: return True",
  "            color[node] = 1",
  "            for nxt in graph[node]:",
  "                if not dfs(nxt):",
  "                    color[node] = 3",
  "                    return False",
  "            color[node] = 2",
  "            return True",
  "        return dfs(source)",
];

function parseEdges(input) {
  if (Array.isArray(input)) return input.map((edge) => Array.isArray(edge) ? edge.map(Number) : []);
  if (typeof input !== "string") throw new RangeError("#1059: Enter directed edges such as 0>1, 0>2.");
  if (!input.trim()) return [];
  return input.split(/[;,]/).map((part) => {
    const match = /^\s*(\d+)\s*(?:->|>|-)\s*(\d+)\s*$/.exec(part);
    return match ? [Number(match[1]), Number(match[2])] : [];
  });
}

function parseInput(input, params = {}) {
  let edgesInput = input;
  if (input && !Array.isArray(input) && typeof input === "object") {
    edgesInput = input.edges;
    params = { ...params, n: input.n ?? params.n, source: input.source ?? params.source, destination: input.destination ?? params.destination };
  }
  const n = Number(params.n ?? 4);
  const source = Number(params.source ?? 0);
  const destination = Number(params.destination ?? Math.max(0, n - 1));
  const edges = parseEdges(edgesInput);
  if (!Number.isInteger(n) || n < 1 || n > 10 || !Number.isInteger(source) || !Number.isInteger(destination)
    || source < 0 || source >= n || destination < 0 || destination >= n
    || edges.length > 24 || edges.some((edge) => edge.length !== 2 || edge.some((node) => !Number.isInteger(node) || node < 0 || node >= n))) {
    throw new RangeError("#1059: Use 1–10 nodes, valid source/destination, and up to 24 directed edges.");
  }
  return { n, edges: edges.map(([u, v]) => [u, v]), source, destination };
}

function buildSteps(input, params = {}) {
  const { n, edges: inputEdges, source, destination } = parseInput(input, params);
  const graph = Array.from({ length: n }, () => []);
  const edges = inputEdges.map(([u, v], index) => ({ u, v, index, status: "pending" }));
  const color = Array(n).fill(0); const stack = []; const steps = [];
  let activeNode = null; let activeEdge = null; let currentPhase = "start"; let answer = null; let witness = []; let failureWitness = [];

  function emit(line, phase = currentPhase) {
    steps.push({
      title: bi(phase === "start" ? "Đồ thị ban đầu" : phase === "build" ? "Thêm mũi tên" : phase === "visit" ? `Vào ${activeNode}` : phase === "leaf" ? `Ngõ cuối ${activeNode}` : phase === "cycle" ? "Gặp lại nút đang thăm" : phase === "memo" ? `Đã an toàn: ${activeNode}` : phase === "branch" ? `Thử nhánh ${activeNode} → ${activeEdge?.v}` : phase === "fail" ? `Nhánh hỏng tại ${activeNode}` : phase === "good" ? `Mọi nhánh từ ${activeNode} đều tới đích` : phase === "done" ? (answer ? "Mọi đường tới đích ✓" : "Có đường không tới đích ✕") : "DFS",
        phase === "start" ? "Graph" : phase === "build" ? "Add arrow" : phase === "visit" ? `Visit ${activeNode}` : phase === "leaf" ? `End node ${activeNode}` : phase === "cycle" ? "Node already visiting" : phase === "memo" ? `Already safe: ${activeNode}` : phase === "branch" ? `Try ${activeNode} → ${activeEdge?.v}` : phase === "fail" ? `Branch fails at ${activeNode}` : phase === "good" ? `All paths from ${activeNode} reach destination` : phase === "done" ? (answer ? "Every path reaches destination ✓" : "A path misses destination ✕") : "DFS"),
      note: bi("", ""), arr: [], highlight: activeNode === null ? [] : [activeNode], mark: [], codeLines: [line], final: false,
      vars: [{ name: "node", value: activeNode ?? "—" }, { name: "stack", value: stack.join("→") || "∅" }, { name: "dest", value: destination }],
      allPathsDestination1059View: {
        n, edges: edges.map((edge) => ({ ...edge })), graph: graph.map((neighbors) => neighbors.map((edge) => edge.v)),
        color: [...color], stack: [...stack], activeNode, activeEdge: activeEdge ? { ...activeEdge } : null,
        source, destination, phase, answer, witness: [...witness], failureWitness: [...failureWitness],
      },
    });
  }

  emit(1); emit(2); currentPhase = "build"; emit(3);
  for (let i = 0; i < inputEdges.length; i++) {
    const [u, v] = inputEdges[i]; activeNode = u; activeEdge = { u, v, index: i };
    graph[u].push({ v, index: i }); currentPhase = "build"; emit(4);
  }
  activeNode = null; activeEdge = null; emit(5);

  function dfs(node) {
    stack.push(node); activeNode = node; activeEdge = null; currentPhase = "visit"; emit(6);
    if (graph[node].length === 0) {
      const reached = node === destination;
      currentPhase = "leaf"; emit(7);
      if (reached && witness.length === 0) witness = [...stack];
      if (!reached && failureWitness.length === 0) failureWitness = [...stack];
      stack.pop();
      return reached;
    }
    currentPhase = color[node] === 1 ? "cycle" : "visit"; emit(8);
    if (color[node] === 1) { if (!failureWitness.length) failureWitness = [...stack]; stack.pop(); return false; }
    currentPhase = color[node] === 2 ? "memo" : "visit"; emit(9);
    if (color[node] === 2) { stack.pop(); return true; }
    color[node] = 1; currentPhase = "visit"; emit(10);
    for (const adjacent of graph[node]) {
      const edge = edges[adjacent.index];
      activeEdge = { u: edge.u, v: edge.v, index: edge.index }; currentPhase = "branch"; emit(11);
      edge.status = "active"; emit(11);
      const good = dfs(adjacent.v);
      edge.status = good ? "good" : "bad";
      activeNode = node; currentPhase = good ? "branch" : "fail"; emit(12);
      if (!good) {
        color[node] = 3; currentPhase = "fail"; emit(13);
        stack.pop(); emit(14);
        return false;
      }
    }
    color[node] = 2; currentPhase = "good"; emit(15);
    stack.pop(); emit(16);
    return true;
  }

  currentPhase = "visit"; emit(17);
  answer = dfs(source);
  activeNode = null; activeEdge = null; currentPhase = "done"; emit(17);
  steps[steps.length - 1].final = true;
  return { original: { n, edges: inputEdges, source, destination }, answer, steps };
}

module.exports = { 1059: {
  id: 1059, slug: "all-paths-from-source-lead-to-destination", difficulty: "medium", category: { key: "graph", vi: "Đồ thị", en: "Graph" },
  tags: [{ key: "graph", vi: "Đồ thị", en: "Graph" }, { key: "depth-first-search", vi: "DFS", en: "Depth-First Search" }, { key: "memoization", vi: "Ghi nhớ trạng thái", en: "Memoization" }],
  title: bi("All Paths from Source Lead to Destination", "All Paths from Source Lead to Destination"),
  titleVi: bi("Mọi đường từ nguồn có tới đích?", "Do all source paths reach the destination?"),
  statement: bi("Kiểm tra mọi đường đi bắt đầu từ source có kết thúc ở destination không.", "Check whether every path starting at source ends at destination."),
  defaultInput: "0>1,0>2,1>3,2>3", inputKind: "string", inputLabel: bi("cạnh có hướng · u>v", "directed edges · u>v"),
  extraParams: [{ key: "n", label: bi("n · số nút (0…n−1)", "n · nodes (0…n−1)"), default: 4, min: 1, max: 10 }, { key: "source", label: bi("source", "source"), default: 0, min: 0, max: 9 }, { key: "destination", label: bi("destination", "destination"), default: 3, min: 0, max: 9 }],
  debugMode: "line-by-line",
  approach: [bi("DFS đánh dấu nút đang thăm và đã xác minh.", "DFS marks nodes as visiting or verified."), bi("Ngõ cụt sai đích hoặc cạnh quay lại đang thăm thì thất bại.", "A wrong dead end or a back edge means failure.")],
  complexity: { time: "O(V + E)", space: "O(V + E)", note: bi("Tối đa 10 nút để sơ đồ DFS luôn rõ.", "Limited to 10 nodes so the DFS graph stays readable.") },
  code: CODE, builder: buildSteps, liveArgs: (input, params) => [parseInput(input, params)],
} };
