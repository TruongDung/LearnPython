"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE_9021 = [
  "from collections import deque",
  "",
  "class Solution:",
  "    def minimumSafeLevel(self, n, edges, u, v):",
  "        if u == v:",
  "            return 0",
  "",
  "        graph = [[] for _ in range(n)]",
  "        levels = set()",
  "",
  "        for a, b, safe in edges:",
  "            graph[a].append((b, safe))",
  "            graph[b].append((a, safe))",
  "            levels.add(safe)",
  "",
  "        if not levels:",
  "            return -1",
  "",
  "        levels = sorted(levels)",
  "",
  "        def can_reach(limit):",
  "            queue = deque([u])",
  "            visited = {u}",
  "",
  "            while queue:",
  "                node = queue.popleft()",
  "",
  "                if node == v:",
  "                    return True",
  "",
  "                for nei, weight in graph[node]:",
  "                    if weight <= limit and nei not in visited:",
  "                        visited.add(nei)",
  "                        queue.append(nei)",
  "",
  "            return False",
  "",
  "        # Check if any path exists",
  "        if not can_reach(levels[-1]):",
  "            return -1",
  "",
  "        # Binary Search: First True",
  "        left, right = 0, len(levels) - 1",
  "",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "",
  "            if can_reach(levels[mid]):",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "",
  "        return levels[left]",
];

function parseInput9021(input) {
  let data = input;
  if (typeof input === "string") {
    try { data = JSON.parse(input); } catch { throw new Error('9021: JSON không hợp lệ / invalid JSON.'); }
  }
  if (!data || !Number.isInteger(data.n) || data.n < 2 || data.n > 9) {
    throw new Error("9021: n phải là số nguyên từ 2 đến 9.");
  }
  if (!Array.isArray(data.edges) || data.edges.length > 16) {
    throw new Error("9021: edges phải có từ 0 đến 16 cạnh [a,b,safe].");
  }
  if (!Number.isInteger(data.u) || !Number.isInteger(data.v) || data.u < 0 || data.u >= data.n || data.v < 0 || data.v >= data.n) {
    throw new Error("9021: u và v phải là node hợp lệ.");
  }
  const pairs = new Set();
  const edges = data.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length !== 3 || edge.some((value) => !Number.isInteger(value))) {
      throw new Error("9021: mỗi cạnh phải là [a,b,safe] gồm các số nguyên.");
    }
    const [a, b, safe] = edge;
    if (a < 0 || a >= data.n || b < 0 || b >= data.n || a === b || safe < 1 || safe > 99) {
      throw new Error("9021: đầu cạnh phải khác nhau, thuộc [0,n), safe thuộc [1,99].");
    }
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (pairs.has(key)) throw new Error("9021: không dùng hai cạnh trùng giữa cùng một cặp node.");
    pairs.add(key);
    return [a, b, safe];
  });
  return { n: data.n, edges, u: data.u, v: data.v };
}

function buildSteps9021(input) {
  const { n, edges, u, v } = parseInput9021(input);
  const graph = Array.from({ length: n }, () => []);
  const levelSet = new Set();
  let levels = [];
  const steps = [];
  const history = [];
  const builtEdges = new Set();
  let left = null;
  let right = null;

  function emit({ phase, line, limit = null, mid = null, queue = [], visited = [], current = null, activeEdge = null, checkedEdges = [], crossedEdges = [], pathNodes = [], pathEdges = [], reachable = null, final = false }) {
    const phaseTitles = {
      build: bi("Dựng đồ thị", "Build the graph"),
      check: bi("Kiểm tra điều kiện", "Check the condition"),
      ready: bi("Chọn chìa khóa", "Choose a key"),
      pick: bi("Thử mức khóa", "Try key level"),
      visit: bi("BFS mở phòng", "BFS opens a room"),
      inspect: bi("Thử cánh cửa", "Try a door"),
      cross: bi("Cửa mở", "Door opens"),
      locked: bi("Cửa khóa", "Door locked"),
      skip: bi("Đã ghé rồi", "Already visited"),
      found: bi("Đã nối tới v", "Reached v"),
      miss: bi("Chưa tới v", "Cannot reach v"),
      narrow: bi("Thu hẹp chìa khóa", "Narrow the key"),
      done: bi("Mức nhỏ nhất", "Minimum level"),
    };
    steps.push({
      title: phaseTitles[phase], note: bi("", ""), codeLines: [line], final,
      vars: [
        { name: "left", value: left ?? "—" },
        { name: "right", value: right ?? "—" },
        { name: "mid", value: mid ?? "—" },
        { name: "S", value: limit ?? "—" },
        { name: "node", value: current ?? "—" },
        { name: "queue", value: queue.length ? queue.join(" → ") : "∅" },
        { name: "visited", value: (visited.size ?? visited.length) ? `{${[...visited].join(", ")}}` : "∅" },
      ],
      securityPath9021View: {
        n, edges: edges.map((edge) => [...edge]), u, v, levels: [...levels],
        phase, limit, left, right, mid, queue: [...queue], seen: [...visited], current,
        activeEdge, checkedEdges: [...checkedEdges], crossedEdges: [...crossedEdges],
        builtEdges: [...builtEdges],
        pathNodes: [...pathNodes], pathEdges: [...pathEdges], reachable,
        history: history.map((item) => ({ ...item })), final,
      },
    });
  }

  function bfs(limit, trace) {
    const queue = [u];
    const visited = new Set();
    const parent = Array(n).fill(null);
    const parentEdge = Array(n).fill(null);
    const checkedEdges = new Set();
    const crossedEdges = new Set();
    if (trace) emit({ phase: "visit", line: 22, limit, queue, visited });
    visited.add(u);
    if (trace) emit({ phase: "visit", line: 23, limit, queue, visited, current: u });
    while (queue.length) {
      if (trace) emit({ phase: "check", line: 25, limit, queue, visited, checkedEdges, crossedEdges });
      const node = queue.shift();
      if (trace) emit({ phase: "visit", line: 26, limit, queue, visited, current: node, checkedEdges, crossedEdges });
      if (trace) emit({ phase: "check", line: 28, limit, queue, visited, current: node, checkedEdges, crossedEdges });
      if (node === v) {
        const pathNodes = [];
        const pathEdges = [];
        for (let cursor = v; cursor !== null; cursor = parent[cursor]) {
          pathNodes.push(cursor);
          if (parentEdge[cursor] !== null) pathEdges.push(parentEdge[cursor]);
        }
        pathNodes.reverse();
        pathEdges.reverse();
        if (trace) emit({ phase: "found", line: 29, limit, queue, visited, current: node, checkedEdges, crossedEdges, pathNodes, pathEdges, reachable: true });
        return { reachable: true, pathNodes, pathEdges };
      }
      for (const neighbor of graph[node]) {
        checkedEdges.add(neighbor.edgeId);
        const base = { limit, queue, visited, current: node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges };
        if (trace) emit({ phase: "inspect", line: 31, ...base });
        const canCross = neighbor.safe <= limit && !visited.has(neighbor.node);
        if (trace) emit({ phase: neighbor.safe > limit ? "locked" : visited.has(neighbor.node) ? "skip" : "inspect", line: 32, ...base });
        if (!canCross) continue;
        visited.add(neighbor.node);
        parent[neighbor.node] = node;
        parentEdge[neighbor.node] = neighbor.edgeId;
        if (trace) emit({ phase: "cross", line: 33, limit, queue, visited, current: neighbor.node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges });
        crossedEdges.add(neighbor.edgeId);
        queue.push(neighbor.node);
        if (trace) emit({ phase: "cross", line: 34, limit, queue, visited, current: neighbor.node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges });
      }
    }
    if (trace) emit({ phase: "check", line: 25, limit, queue, visited, checkedEdges, crossedEdges });
    if (trace) emit({ phase: "miss", line: 36, limit, queue, visited, checkedEdges, crossedEdges, reachable: false });
    return { reachable: false, pathNodes: [], pathEdges: [] };
  }

  emit({ phase: "check", line: 5, visited: [u], current: u });
  if (u === v) {
    emit({ phase: "done", line: 6, limit: 0, visited: [u], pathNodes: [u], reachable: true, final: true });
    return { original: { n, edges, u, v }, answer: 0, steps };
  }
  emit({ phase: "build", line: 8 });
  emit({ phase: "build", line: 9 });
  edges.forEach(([a, b, safe], edgeId) => {
    emit({ phase: "build", line: 11, current: a, activeEdge: edgeId });
    graph[a].push({ node: b, safe, edgeId });
    emit({ phase: "build", line: 12, current: a, activeEdge: edgeId });
    graph[b].push({ node: a, safe, edgeId });
    emit({ phase: "build", line: 13, current: b, activeEdge: edgeId });
    levelSet.add(safe);
    builtEdges.add(edgeId);
    emit({ phase: "build", line: 14, current: b, activeEdge: edgeId });
  });
  emit({ phase: "check", line: 16 });
  if (!levelSet.size) {
    emit({ phase: "done", line: 17, reachable: false, final: true });
    return { original: { n, edges, u, v }, answer: -1, steps };
  }
  levels = [...levelSet].sort((a, b) => a - b);
  emit({ phase: "ready", line: 19 });

  const largestLevel = levels.at(-1);
  emit({ phase: "check", line: 39, limit: largestLevel });
  const pathExists = bfs(largestLevel, true);
  if (!pathExists.reachable) {
    emit({ phase: "done", line: 40, limit: largestLevel, reachable: false, final: true });
    return { original: { n, edges, u, v }, answer: -1, steps };
  }

  left = 0;
  right = levels.length - 1;
  emit({ phase: "ready", line: 43 });
  while (left < right) {
    emit({ phase: "check", line: 45 });
    const mid = Math.floor((left + right) / 2);
    emit({ phase: "pick", line: 46, mid });
    const limit = levels[mid];
    emit({ phase: "check", line: 48, limit, mid });
    const result = bfs(limit, true);
    history.push({ level: limit, reachable: result.reachable });
    if (result.reachable) {
      right = mid;
      emit({ phase: "narrow", line: 49, limit, mid, pathNodes: result.pathNodes, pathEdges: result.pathEdges, reachable: true });
    } else {
      left = mid + 1;
      emit({ phase: "narrow", line: 51, limit, mid, reachable: false });
    }
  }
  emit({ phase: "check", line: 45 });
  const answer = levels[left];
  const finalRoute = bfs(answer, false);
  emit({ phase: "done", line: 53, limit: answer, mid: left, visited: finalRoute.pathNodes, pathNodes: finalRoute.pathNodes, pathEdges: finalRoute.pathEdges, reachable: true, final: true });
  return { original: { n, edges, u, v }, answer, steps };
}

module.exports = {
  9021: {
    id: 9021,
    difficulty: "medium",
    slug: null,
    category: { key: "interview", vi: "Phỏng vấn", en: "Interview" },
    tags: [
      { key: "graph", vi: "Đồ thị", en: "Graph" },
      { key: "binary-search", vi: "Tìm kiếm nhị phân", en: "Binary Search" },
      { key: "bfs", vi: "BFS", en: "BFS" },
    ],
    title: bi("Minimum Safe Level", "Minimum Safe Level"),
    titleVi: bi("Mức safe nhỏ nhất để đi từ u tới v", "Minimum safe level to travel from u to v"),
    statement: bi("Bài phỏng vấn trong ảnh (ID nội bộ #9021). Đồ thị vô hướng có mức safe trên mỗi cạnh. Chìa khóa mức S chỉ mở cạnh có safe ≤ S. Tìm S nhỏ nhất để đi từ u tới v; trả -1 nếu không có đường đi.", "Interview problem from the screenshot (internal ID #9021). Each undirected edge has a safe level. A key of level S opens edges with safe ≤ S. Find the minimum S that connects u to v, or -1 if no path exists."),
    defaultInput: JSON.stringify({ n: 7, edges: [[0, 1, 4], [0, 2, 7], [1, 3, 6], [1, 4, 9], [2, 4, 5], [3, 5, 8], [4, 5, 6], [4, 6, 10], [5, 6, 8], [2, 3, 3]], u: 0, v: 6 }),
    inputKind: "string",
    inputLabel: bi('JSON: {"n":7,"edges":[[a,b,safe]],"u":0,"v":6}', 'JSON: {"n":7,"edges":[[a,b,safe]],"u":0,"v":6}'),
    debugMode: "line-by-line",
    approach: [bi("Binary search mức safe. Với mỗi S, BFS chỉ đi qua cạnh có safe ≤ S.", "Binary-search the safe levels. For each S, BFS traverses only edges with safe ≤ S.")],
    complexity: { time: "O((V + E) log E)", space: "O(V + E)", note: bi("Mỗi lần thử chạy BFS; tìm kiếm trên các mức cạnh khác nhau.", "Each trial runs BFS over the graph; search only distinct edge levels.") },
    code: CODE_9021,
    codeLabel: bi("Binary Search + BFS", "Binary Search + BFS"),
    builder: buildSteps9021,
    liveArgs: input => { const { n, edges, u, v } = parseInput9021(input); return [n, edges, u, v]; },
  },
};
