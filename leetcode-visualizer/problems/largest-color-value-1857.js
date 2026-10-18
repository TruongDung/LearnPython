// LeetCode 1857 — topological BFS + a 26-color DP vector per node.

const text = (vi, en) => ({ vi, en });

const CODE = [
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def largestPathValue(self, colors: str, edges: List[List[int]]) -> int:",
  "        n = len(colors)",
  "        graph = [[] for _ in range(n)]",
  "        indegree = [0] * n",
  "",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            indegree[v] += 1",
  "",
  "        dp = [[0] * 26 for _ in range(n)]",
  "        queue = deque()",
  "",
  "        for i in range(n):",
  "            if indegree[i] == 0:",
  "                queue.append(i)",
  "",
  "        visited = 0",
  "        answer = 0",
  "",
  "        while queue:",
  "            node = queue.popleft()",
  "            visited += 1",
  "",
  "            color = ord(colors[node]) - ord('a')",
  "            dp[node][color] += 1",
  "",
  "            answer = max(answer, max(dp[node]))",
  "",
  "            for nei in graph[node]:",
  "                for c in range(26):",
  "                    dp[nei][c] = max(",
  "                        dp[nei][c],",
  "                        dp[node][c]",
  "                    )",
  "",
  "                indegree[nei] -= 1",
  "",
  "                if indegree[nei] == 0:",
  "                    queue.append(nei)",
  "",
  "        return answer if visited == n else -1",
];

function parseEdges(raw, n) {
  let edges = raw;
  if (typeof raw === "string") {
    try {
      edges = JSON.parse(raw);
    } catch (_) {
      throw new Error('edges phải là JSON, ví dụ [[0,1],[0,2]]');
    }
  }
  if (!Array.isArray(edges) || edges.length > 120 || edges.some((edge) =>
    !Array.isArray(edge) || edge.length !== 2 || !Number.isInteger(edge[0]) || !Number.isInteger(edge[1]))) {
    throw new Error("edges phải gồm tối đa 120 cặp số nguyên [u, v]");
  }
  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      throw new Error("Mỗi đỉnh trong edges phải thuộc [0, len(colors))");
    }
  }
  return edges.map(([u, v]) => [u, v]);
}

function validate(input, params = {}) {
  const colors = String(input ?? "").trim();
  if (!/^[a-z]+$/.test(colors) || colors.length > 30) {
    throw new Error("colors cần 1..30 chữ cái thường a-z");
  }
  return { colors, edges: parseEdges(params.edges ?? "[]", colors.length) };
}

function buildSteps(input, params = {}) {
  const { colors, edges } = validate(input, params);
  const n = colors.length;
  const graph = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);
  const dp = Array.from({ length: n }, () => Array(26).fill(0));
  const queue = [];
  const processed = new Set();
  const steps = [];
  let visited = 0;
  let answer = 0;
  let current = null;
  let neighbor = null;
  let activeColor = null;
  let activeEdge = null;

  function emit(line, event, overrides = {}) {
    const final = Boolean(overrides.final);
    const cycleNodes = final && visited !== n
      ? indegree.map((degree, id) => degree > 0 ? id : null).filter(Number.isInteger)
      : [];
    const bestColor = dp.flatMap((counts, node) => counts.map((count, color) => ({ node, color, count })))
      .reduce((best, item) => item.count > best.count ? item : best, { node: null, color: null, count: 0 });
    const short = {
      enter: "START", size: `n = ${n}`, "graph-init": "GRAPH", "indegree-init": "IN-DEGREE",
      "edge-read": "EDGE", "edge-add": "→", "indegree-add": "+1", "dp-init": "DP × 26",
      "queue-init": "QUEUE", "source-scan": "SCAN", "source-check": "in = 0?", enqueue: "PUSH",
      "visited-init": "visited = 0", "answer-init": "best = 0", "queue-check": "QUEUE?",
      dequeue: "POP", "visited-add": "+ VISITED", "color-index": "COLOR", "color-count": "+1",
      "answer-update": "BEST", "neighbor-loop": "EDGE", "color-loop": "COLOR",
      "dp-transfer": "MAX", "indegree-drop": "−1", "ready-check": "in = 0?", result: final && cycleNodes.length ? "CYCLE" : "DONE",
    }[event] || event.toUpperCase();
    steps.push({
      title: text(short, short),
      note: text("", ""),
      arr: [], highlight: [], mark: [], codeLines: [line], final,
      vars: [
        { name: "queue", value: `[${queue.join(", ")}]` },
        { name: "visited", value: visited },
        { name: "answer", value: answer },
      ],
      largestColor1857View: {
        phase: final ? (cycleNodes.length ? "cycle" : "result") : overrides.phase || "topo",
        event,
        colors,
        edges: edges.map(([u, v]) => ({ u, v })),
        graph: graph.map((neighbors) => [...neighbors]),
        indegree: [...indegree],
        dp: dp.map((row) => [...row]),
        queue: [...queue],
        processed: [...processed],
        current: overrides.current ?? current,
        neighbor: overrides.neighbor ?? neighbor,
        activeColor: overrides.activeColor ?? activeColor,
        activeEdge: overrides.activeEdge ?? activeEdge,
        before: overrides.before ?? null,
        incoming: overrides.incoming ?? null,
        after: overrides.after ?? null,
        accepted: overrides.accepted ?? null,
        visited,
        answer: final ? (cycleNodes.length ? -1 : answer) : answer,
        bestColor,
        cycleNodes,
      },
    });
  }

  emit(5, "enter", { phase: "setup" });
  emit(6, "size", { phase: "setup" });
  emit(7, "graph-init", { phase: "build" });
  emit(8, "indegree-init", { phase: "build" });
  edges.forEach(([u, v]) => {
    activeEdge = [u, v];
    emit(10, "edge-read", { phase: "build" });
    graph[u].push(v);
    emit(11, "edge-add", { phase: "build" });
    indegree[v] += 1;
    emit(12, "indegree-add", { phase: "build" });
  });
  activeEdge = null;
  emit(14, "dp-init", { phase: "sources" });
  emit(15, "queue-init", { phase: "sources" });
  for (let i = 0; i < n; i++) {
    current = i;
    emit(17, "source-scan", { phase: "sources" });
    emit(18, "source-check", { phase: "sources", accepted: indegree[i] === 0 });
    if (indegree[i] === 0) {
      queue.push(i);
      emit(19, "enqueue", { phase: "sources" });
    }
  }
  current = null;
  emit(21, "visited-init");
  emit(22, "answer-init");

  while (queue.length) {
    emit(24, "queue-check");
    current = queue.shift();
    emit(25, "dequeue");
    visited += 1;
    processed.add(current);
    emit(26, "visited-add");
    activeColor = colors.charCodeAt(current) - 97;
    emit(28, "color-index");
    dp[current][activeColor] += 1;
    emit(29, "color-count", { before: dp[current][activeColor] - 1, after: dp[current][activeColor] });
    answer = Math.max(answer, ...dp[current]);
    emit(31, "answer-update");

    for (const nei of graph[current]) {
      neighbor = nei;
      activeEdge = [current, nei];
      emit(33, "neighbor-loop");
      for (let c = 0; c < 26; c++) {
        activeColor = c;
        emit(34, "color-loop");
        const before = dp[nei][c];
        const incoming = dp[current][c];
        dp[nei][c] = Math.max(before, incoming);
        emit(35, "dp-transfer", { before, incoming, after: dp[nei][c], accepted: dp[nei][c] > before });
      }
      activeColor = null;
      indegree[nei] -= 1;
      emit(40, "indegree-drop");
      emit(42, "ready-check", { accepted: indegree[nei] === 0 });
      if (indegree[nei] === 0) {
        queue.push(nei);
        emit(43, "enqueue");
      }
    }
    neighbor = null;
    activeEdge = null;
  }
  current = null;
  activeColor = null;
  emit(45, "result", { final: true });
  return { original: colors, answer: visited === n ? answer : -1, steps };
}

module.exports = {
  1857: {
    id: 1857,
    difficulty: "hard",
    slug: "largest-color-value-in-a-directed-graph",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "topological-sort", vi: "Sắp xếp topo", en: "Topological Sort" },
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
    ],
    title: text("Largest Color Value in a Directed Graph", "Largest Color Value in a Directed Graph"),
    titleVi: text("Giá trị màu lớn nhất trên đường đi", "Largest color value along a path"),
    statement: text("Tìm số lần xuất hiện lớn nhất của một màu trên một đường đi; có chu trình thì trả -1.", "Find the largest frequency of one color along a path; return -1 if the graph has a cycle."),
    defaultInput: "abaca",
    inputKind: "string",
    inputLabel: text("colors (a-z)", "colors (a-z)"),
    extraParams: [{ key: "edges", type: "string", label: text("edges (JSON)", "edges (JSON)"), default: "[[0,1],[0,2],[2,3],[3,4]]" }],
    approach: [
      text("🎨 Mỗi node mang một màu.", "🎨 Each node carries one color."),
      text("📨 Node indegree 0 truyền bảng đếm sang hàng xóm.", "📨 Zero-indegree nodes pass color counts forward."),
      text("⟳ Còn node chưa thăm nghĩa là có chu trình.", "⟳ Unvisited nodes mean a cycle exists."),
    ],
    complexity: { time: "O((n + m) · 26)", space: "O(n · 26 + m)", note: text("Mỗi cạnh truyền 26 bộ đếm màu.", "Every edge transfers 26 color counters.") },
    debugMode: "line-by-line",
    code: CODE,
    builder: buildSteps,
    liveArgs(input, params) {
      const { colors, edges } = validate(input, params);
      return [colors, edges];
    },
  },
};
