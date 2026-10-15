"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE_9021 = [
  "from collections import deque",
  "",
  "class Solution:",
  "    def minimumSecurityLevel(self, n, edges, u, v):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, security in edges:",
  "            graph[a].append((b, security))",
  "            graph[b].append((a, security))",
  "",
  "        if u == v:",
  "            return 0",
  "",
  "        levels = sorted({security for _, _, security in edges})",
  "",
  "        def can_reach(limit):",
  "            queue = deque([u])",
  "            seen = {u}",
  "",
  "            while queue:",
  "                node = queue.popleft()",
  "                if node == v:",
  "                    return True",
  "",
  "                for neighbor, security in graph[node]:",
  "                    if security > limit:",
  "                        continue",
  "                    if neighbor in seen:",
  "                        continue",
  "                    seen.add(neighbor)",
  "                    queue.append(neighbor)",
  "",
  "            return False",
  "",
  "        left, right = 0, len(levels)",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "            limit = levels[mid]",
  "",
  "            if can_reach(limit):",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "",
  "        if left == len(levels):",
  "            return -1",
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
  if (!Array.isArray(data.edges) || data.edges.length < 1 || data.edges.length > 16) {
    throw new Error("9021: edges phải có từ 1 đến 16 cạnh [a,b,security].");
  }
  if (!Number.isInteger(data.u) || !Number.isInteger(data.v) || data.u < 0 || data.u >= data.n || data.v < 0 || data.v >= data.n) {
    throw new Error("9021: u và v phải là node hợp lệ.");
  }
  const pairs = new Set();
  const edges = data.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length !== 3 || edge.some((value) => !Number.isInteger(value))) {
      throw new Error("9021: mỗi cạnh phải là [a,b,security] gồm các số nguyên.");
    }
    const [a, b, security] = edge;
    if (a < 0 || a >= data.n || b < 0 || b >= data.n || a === b || security < 1 || security > 99) {
      throw new Error("9021: đầu cạnh phải khác nhau, thuộc [0,n), security thuộc [1,99].");
    }
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (pairs.has(key)) throw new Error("9021: không dùng hai cạnh trùng giữa cùng một cặp node.");
    pairs.add(key);
    return [a, b, security];
  });
  return { n: data.n, edges, u: data.u, v: data.v };
}

function buildSteps9021(input) {
  const { n, edges, u, v } = parseInput9021(input);
  const graph = Array.from({ length: n }, () => []);
  const levels = [...new Set(edges.map((edge) => edge[2]))].sort((a, b) => a - b);
  const steps = [];
  const history = [];
  const builtEdges = new Set();
  let left = null;
  let right = null;

  function emit({ phase, line, limit = null, mid = null, queue = [], seen = [], current = null, activeEdge = null, checkedEdges = [], crossedEdges = [], pathNodes = [], pathEdges = [], reachable = null, final = false }) {
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
      ],
      securityPath9021View: {
        n, edges: edges.map((edge) => [...edge]), u, v, levels: [...levels],
        phase, limit, left, right, mid, queue: [...queue], seen: [...seen], current,
        activeEdge, checkedEdges: [...checkedEdges], crossedEdges: [...crossedEdges],
        builtEdges: [...builtEdges],
        pathNodes: [...pathNodes], pathEdges: [...pathEdges], reachable,
        history: history.map((item) => ({ ...item })), final,
      },
    });
  }

  function bfs(limit, trace) {
    const queue = [u];
    const seen = new Set();
    const parent = Array(n).fill(null);
    const parentEdge = Array(n).fill(null);
    const checkedEdges = new Set();
    const crossedEdges = new Set();
    if (trace) emit({ phase: "visit", line: 16, limit, queue, seen });
    seen.add(u);
    if (trace) emit({ phase: "visit", line: 17, limit, queue, seen, current: u });
    while (queue.length) {
      if (trace) emit({ phase: "check", line: 19, limit, queue, seen, checkedEdges, crossedEdges });
      const node = queue.shift();
      if (trace) emit({ phase: "visit", line: 20, limit, queue, seen, current: node, checkedEdges, crossedEdges });
      if (trace) emit({ phase: "check", line: 21, limit, queue, seen, current: node, checkedEdges, crossedEdges });
      if (node === v) {
        const pathNodes = [];
        const pathEdges = [];
        for (let cursor = v; cursor !== null; cursor = parent[cursor]) {
          pathNodes.push(cursor);
          if (parentEdge[cursor] !== null) pathEdges.push(parentEdge[cursor]);
        }
        pathNodes.reverse();
        pathEdges.reverse();
        if (trace) emit({ phase: "found", line: 22, limit, queue, seen, current: node, checkedEdges, crossedEdges, pathNodes, pathEdges, reachable: true });
        return { reachable: true, pathNodes, pathEdges };
      }
      for (const neighbor of graph[node]) {
        checkedEdges.add(neighbor.edgeId);
        const base = { limit, queue, seen, current: node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges };
        if (trace) emit({ phase: "inspect", line: 24, ...base });
        if (trace) emit({ phase: "inspect", line: 25, ...base });
        if (neighbor.security > limit) {
          if (trace) emit({ phase: "locked", line: 26, ...base });
          continue;
        }
        if (trace) emit({ phase: "check", line: 27, ...base });
        if (seen.has(neighbor.node)) {
          if (trace) emit({ phase: "skip", line: 28, ...base });
          continue;
        }
        seen.add(neighbor.node);
        parent[neighbor.node] = node;
        parentEdge[neighbor.node] = neighbor.edgeId;
        if (trace) emit({ phase: "cross", line: 29, limit, queue, seen, current: neighbor.node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges });
        crossedEdges.add(neighbor.edgeId);
        queue.push(neighbor.node);
        if (trace) emit({ phase: "cross", line: 30, limit, queue, seen, current: neighbor.node, activeEdge: neighbor.edgeId, checkedEdges, crossedEdges });
      }
    }
    if (trace) emit({ phase: "check", line: 19, limit, queue, seen, checkedEdges, crossedEdges });
    if (trace) emit({ phase: "miss", line: 32, limit, queue, seen, checkedEdges, crossedEdges, reachable: false });
    return { reachable: false, pathNodes: [], pathEdges: [] };
  }

  emit({ phase: "build", line: 5 });
  edges.forEach(([a, b, security], edgeId) => {
    emit({ phase: "build", line: 6, current: a, activeEdge: edgeId });
    graph[a].push({ node: b, security, edgeId });
    emit({ phase: "build", line: 7, current: a, activeEdge: edgeId });
    graph[b].push({ node: a, security, edgeId });
    builtEdges.add(edgeId);
    emit({ phase: "build", line: 8, current: b, activeEdge: edgeId });
  });
  emit({ phase: "check", line: 10, seen: [u], current: u });
  if (u === v) {
    emit({ phase: "done", line: 11, limit: 0, seen: [u], pathNodes: [u], reachable: true, final: true });
    return { original: { n, edges, u, v }, answer: 0, steps };
  }
  emit({ phase: "ready", line: 13 });
  left = 0;
  right = levels.length;
  emit({ phase: "ready", line: 34 });
  while (left < right) {
    emit({ phase: "check", line: 35 });
    const mid = Math.floor((left + right) / 2);
    emit({ phase: "pick", line: 36, mid });
    const limit = levels[mid];
    emit({ phase: "pick", line: 37, limit, mid });
    emit({ phase: "check", line: 39, limit, mid });
    const result = bfs(limit, true);
    history.push({ level: limit, reachable: result.reachable });
    if (result.reachable) {
      right = mid;
      emit({ phase: "narrow", line: 40, limit, mid, pathNodes: result.pathNodes, pathEdges: result.pathEdges, reachable: true });
    } else {
      left = mid + 1;
      emit({ phase: "narrow", line: 42, limit, mid, reachable: false });
    }
  }
  emit({ phase: "check", line: 35 });
  emit({ phase: "check", line: 44, reachable: left < levels.length });
  if (left === levels.length) {
    emit({ phase: "done", line: 45, limit: levels.at(-1) ?? null, reachable: false, final: true });
    return { original: { n, edges, u, v }, answer: -1, steps };
  }
  const answer = levels[left];
  const finalRoute = bfs(answer, false);
  emit({ phase: "done", line: 47, limit: answer, mid: left, seen: finalRoute.pathNodes, pathNodes: finalRoute.pathNodes, pathEdges: finalRoute.pathEdges, reachable: true, final: true });
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
    title: bi("Minimum Security Level", "Minimum Security Level"),
    titleVi: bi("Chìa khóa nhỏ nhất để đi từ u tới v", "Minimum key to travel from u to v"),
    statement: bi("Bài phỏng vấn trong ảnh (ID nội bộ #9021). Đồ thị vô hướng có mức bảo mật trên mỗi cạnh. Chìa khóa mức S chỉ mở cạnh có security ≤ S. Tìm S nhỏ nhất để đi từ u tới v; trả -1 nếu không có đường đi.", "Interview problem from the screenshot (internal ID #9021). Each undirected edge has a security level. A key of level S opens edges with security ≤ S. Find the minimum S that connects u to v, or -1 if no path exists."),
    defaultInput: JSON.stringify({ n: 7, edges: [[0, 1, 4], [0, 2, 7], [1, 3, 6], [1, 4, 9], [2, 4, 5], [3, 5, 8], [4, 5, 6], [4, 6, 10], [5, 6, 8], [2, 3, 3]], u: 0, v: 6 }),
    inputKind: "string",
    inputLabel: bi('JSON: {"n":7,"edges":[[a,b,security]],"u":0,"v":6}', 'JSON: {"n":7,"edges":[[a,b,security]],"u":0,"v":6}'),
    debugMode: "line-by-line",
    approach: [bi("Binary search mức security. Với mỗi S, BFS chỉ đi qua cạnh có security ≤ S.", "Binary-search the security levels. For each S, BFS traverses only edges with security ≤ S.")],
    complexity: { time: "O((V + E) log E)", space: "O(V + E)", note: bi("Mỗi lần thử chạy BFS; tìm kiếm trên các mức cạnh khác nhau.", "Each trial runs BFS over the graph; search only distinct edge levels.") },
    code: CODE_9021,
    codeLabel: bi("Binary Search + BFS", "Binary Search + BFS"),
    builder: buildSteps9021,
    liveArgs: input => { const { n, edges, u, v } = parseInput9021(input); return [n, edges, u, v]; },
  },
};
