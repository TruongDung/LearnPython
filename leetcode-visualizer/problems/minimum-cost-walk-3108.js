"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE_1 = [
  "class Solution:",
  "    def minimumCost(self, n, edges, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edges:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        answer = []",
  "        for source, target in queries:",
  "            stack, seen = [source], {source}",
  "            cost = -1",
  "            while stack:",
  "                node = stack.pop()",
  "                for neighbor, weight in graph[node]:",
  "                    cost &= weight",
  "                    if neighbor not in seen:",
  "                        seen.add(neighbor)",
  "                        stack.append(neighbor)",
  "            answer.append(cost if target in seen else -1)",
  "        return answer",
];

const CODE_2 = [
  "class Solution:",
  "    def minimumCost(self, n, edges, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edges:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        component = [-1] * n",
  "        for start in range(n):",
  "            if component[start] != -1:",
  "                continue",
  "            stack = [start]",
  "            component[start] = start",
  "            while stack:",
  "                node = stack.pop()",
  "                for neighbor, _ in graph[node]:",
  "                    if component[neighbor] == -1:",
  "                        component[neighbor] = start",
  "                        stack.append(neighbor)",
  "        cost = [-1] * n",
  "        for a, b, weight in edges:",
  "            root = component[a]",
  "            cost[root] &= weight",
  "        return [cost[component[u]] if component[u] == component[v] else -1",
  "                for u, v in queries]",
];

const CODE_3 = [
  "from collections import deque",
  "",
  "class Solution:",
  "    def minimumCost(self, n, edges, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edges:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        component = [-1] * n",
  "        for start in range(n):",
  "            if component[start] != -1:",
  "                continue",
  "            queue = deque([start])",
  "            component[start] = start",
  "            while queue:",
  "                node = queue.popleft()",
  "                for neighbor, _ in graph[node]:",
  "                    if component[neighbor] == -1:",
  "                        component[neighbor] = start",
  "                        queue.append(neighbor)",
  "        cost = [-1] * n",
  "        for a, b, weight in edges:",
  "            cost[component[a]] &= weight",
  "        return [cost[component[u]] if component[u] == component[v] else -1",
  "                for u, v in queries]",
];

const CODE_4 = [
  "class Solution:",
  "    def minimumCost(self, n, edges, queries):",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])",
  "            return parent[x]",
  "        for a, b, weight in edges:",
  "            root_a, root_b = find(a), find(b)",
  "            if root_a != root_b:",
  "                if size[root_a] < size[root_b]:",
  "                    root_a, root_b = root_b, root_a",
  "                parent[root_b] = root_a",
  "                size[root_a] += size[root_b]",
  "        cost = [-1] * n",
  "        for a, _, weight in edges:",
  "            cost[find(a)] &= weight",
  "        return [cost[find(u)] if find(u) == find(v) else -1",
  "                for u, v in queries]",
];

const CODE_5 = [
  "class Solution:",
  "    def minimumCost(self, n, edges, queries):",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "        cost = [-1] * n",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])",
  "            return parent[x]",
  "        for a, b, weight in edges:",
  "            root_a, root_b = find(a), find(b)",
  "            if root_a == root_b:",
  "                cost[root_a] &= weight",
  "            else:",
  "                if size[root_a] < size[root_b]:",
  "                    root_a, root_b = root_b, root_a",
  "                parent[root_b] = root_a",
  "                size[root_a] += size[root_b]",
  "                cost[root_a] &= cost[root_b] & weight",
  "        return [cost[find(u)] if find(u) == find(v) else -1",
  "                for u, v in queries]",
];

const CODES = [CODE_1, CODE_2, CODE_3, CODE_4, CODE_5];
const APPROACHES = [
  bi("1 · Brute Force · DFS mỗi query", "1 · Brute force · DFS per query"),
  bi("2 · DFS + Connected Components", "2 · DFS + connected components"),
  bi("3 · BFS + Connected Components", "3 · BFS + connected components"),
  bi("4 · Union Find (DSU) · 2 Passes", "4 · Union Find (DSU) · 2 passes"),
  bi("5 · Union Find (DSU) · 1 Pass", "5 · Union Find (DSU) · 1 pass"),
];
const METHODS = [
  ["Brute Force (DFS/BFS cho từng query)", "Brute force (DFS/BFS per query)", "O(Q(V+E))*", "O(V+E)"],
  ["DFS + Connected Components", "DFS + connected components", "O(V+E+Q)", "O(V+E)"],
  ["BFS + Connected Components", "BFS + connected components", "O(V+E+Q)", "O(V+E)"],
  ["Union Find (DSU) – 2 Passes", "Union Find (DSU) – 2 passes", "O(Eα(V)+V+Q)", "O(V)"],
  ["Union Find (DSU) – 1 Pass", "Union Find (DSU) – 1 pass", "O((E+Q)α(V)+V)", "O(V)"],
];

function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try { data = JSON.parse(input); } catch { throw new Error("3108: input must be valid JSON."); }
  }
  if (!data || !Number.isInteger(data.n) || data.n < 1 || data.n > 12) {
    throw new Error("3108: n must be an integer from 1 to 12 for visualization.");
  }
  if (!Array.isArray(data.edges) || data.edges.length > 30) {
    throw new Error("3108: edges must contain at most 30 [u, v, weight] entries.");
  }
  if (!Array.isArray(data.queries) || data.queries.length > 12) {
    throw new Error("3108: queries must contain at most 12 [u, v] entries.");
  }
  const edges = data.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length !== 3 || edge.some((value) => !Number.isInteger(value))) {
      throw new Error("3108: each edge must be [u, v, weight] with integer values.");
    }
    const [u, v, weight] = edge;
    if (u < 0 || u >= data.n || v < 0 || v >= data.n || weight < 0 || weight > 1_000_000) {
      throw new Error("3108: edge endpoints must be valid nodes and weight must be in [0, 1e6].");
    }
    return [u, v, weight];
  });
  const queries = data.queries.map((query) => {
    if (!Array.isArray(query) || query.length !== 2 || query.some((value) => !Number.isInteger(value))) {
      throw new Error("3108: each query must be [u, v] with integer endpoints.");
    }
    const [u, v] = query;
    if (u < 0 || u >= data.n || v < 0 || v >= data.n) {
      throw new Error("3108: query endpoints must be valid nodes.");
    }
    return [u, v];
  });
  return { n: data.n, edges, queries };
}

function buildSteps(input, approach = 1) {
  const { n, edges, queries } = parseInput(input);
  const selected = Math.min(5, Math.max(1, Number(approach) || 1));
  const graph = Array.from({ length: n }, () => []);
  edges.forEach(([u, v, weight], id) => {
    graph[u].push({ node: v, weight, id });
    graph[v].push({ node: u, weight, id });
  });
  const answer = Array(queries.length).fill(null);
  const component = Array(n).fill(-1);
  const componentCost = Array(n).fill(-1);
  const andEdges = [];
  const steps = [];
  let currentQuery = null, activeEdge = null, currentNode = null;
  let visited = [], queue = [], parent = null, pass = "";
  let currentCost = -1, dsuCost = null;

  function emit(lineNumber, phase, extra = {}, final = false) {
    if (!Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > CODES[selected - 1].length) {
      throw new Error(`3108: invalid source line ${lineNumber} for approach ${selected}.`);
    }
    const roots = parent ? Array.from({ length: n }, (_, node) => {
      let root = node;
      while (parent[root] !== root) root = parent[root];
      return root;
    }) : [...component];
    steps.push({
      codeBlock: selected,
      codeLines: [lineNumber],
      final,
      title: bi(`Cách ${selected} · ${APPROACHES[selected - 1].vi.split(" · ").slice(1).join(" · ")}`, `Approach ${selected} · ${APPROACHES[selected - 1].en.split(" · ").slice(1).join(" · ")}`),
      note: bi("", ""),
      vars: [
        { name: "query", value: currentQuery === null ? "—" : currentQuery },
        { name: "component", value: currentNode === null ? "—" : roots[currentNode] },
        { name: "cost", value: currentCost },
      ],
      minimumCostWalk3108View: {
        n, edges, queries, approach: selected, phase, currentQuery, activeEdge, currentNode,
        visited: [...visited], queue: [...queue], answer: [...answer], component: roots,
        componentCost: [...componentCost], currentCost, parent: parent ? [...parent] : null,
        dsuCost: dsuCost ? [...dsuCost] : null, andEdges: [...andEdges], pass, final, ...extra,
      },
    });
  }

  const emitAt = (lineNumber, phase, extra = {}, final = false) =>
    emit(lineNumber, phase, extra, final);

  if (selected === 1) {
    emitAt(3, "build");
    for (let id = 0; id < edges.length; id++) {
      const [u, v, weight] = edges[id];
      activeEdge = id;
      emitAt(5, "add-edge", { builtEdges: id + 1 });
    }
    activeEdge = null;
    for (let qi = 0; qi < queries.length; qi++) {
      const [source, target] = queries[qi];
      currentQuery = qi; currentCost = -1; currentNode = source;
      visited = [source]; queue = [source];
      const scannedEdges = new Set();
      emitAt(9, "query-start");
      while (queue.length) {
        currentNode = queue.pop();
        emitAt(12, "visit");
        for (const edge of graph[currentNode]) {
          activeEdge = edge.id;
          if (!scannedEdges.has(edge.id)) {
            scannedEdges.add(edge.id);
            andEdges.push(edge.id);
            currentCost &= edge.weight;
            emitAt(14, "and-edge");
          }
          if (!visited.includes(edge.node)) {
            visited.push(edge.node); queue.push(edge.node);
            emitAt(16, "discover");
          }
        }
      }
      activeEdge = null;
      const found = visited.includes(target);
      answer[qi] = found ? currentCost : -1;
      componentCost[source] = found ? currentCost : -1;
      if (found) visited.forEach((node) => { component[node] = source; });
      emitAt(18, "answer", { result: answer[qi] });
    }
  } else if (selected === 2 || selected === 3) {
    const isBfs = selected === 3;
    emitAt(3, "build");
    for (let id = 0; id < edges.length; id++) {
      const [u, v, weight] = edges[id];
      activeEdge = id;
      emitAt(5, "add-edge", { builtEdges: id + 1 });
    }
    activeEdge = null;
    for (let start = 0; start < n; start++) {
      if (component[start] !== -1) continue;
      component[start] = start; visited = [start]; queue = [start]; currentNode = start;
      emitAt(isBfs ? 13 : 11, "component-start");
      while (queue.length) {
        currentNode = isBfs ? queue.shift() : queue.pop();
        emitAt(isBfs ? 16 : 14, "visit");
        for (const edge of graph[currentNode]) {
          activeEdge = edge.id;
          emitAt(isBfs ? 18 : 16, "check-neighbor");
          if (component[edge.node] === -1) {
            component[edge.node] = start;
            visited.push(edge.node); queue.push(edge.node);
            emitAt(isBfs ? 20 : 18, "discover");
          }
        }
      }
      componentCost[start] = -1;
    }
    queue = []; currentNode = null; activeEdge = null;
    emitAt(selected === 2 ? 19 : 21, "component-cost-start");
    for (let id = 0; id < edges.length; id++) {
      const [u, v, weight] = edges[id];
      activeEdge = id;
      andEdges.push(id);
      componentCost[component[u]] &= weight;
      currentCost = componentCost[component[u]];
      emitAt(selected === 2 ? 22 : 23, "and-edge");
    }
    activeEdge = null;
    for (let qi = 0; qi < queries.length; qi++) {
      const [u, v] = queries[qi]; currentQuery = qi;
      answer[qi] = component[u] === component[v] ? componentCost[component[u]] : -1;
      currentCost = answer[qi];
      emitAt(selected === 2 ? 23 : 24, answer[qi] < 0 ? "disconnected" : "answer", { result: answer[qi] });
    }
  } else if (selected === 4) {
    parent = Array.from({ length: n }, (_, i) => i);
    const size = Array(n).fill(1);
    dsuCost = Array(n).fill(-1);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    emitAt(3, "init-parent");
    emitAt(4, "init-size");
    for (let id = 0; id < edges.length; id++) {
      const [u, v] = edges[id]; activeEdge = id;
      let rootA = find(u), rootB = find(v);
      emitAt(9, "edge-union");
      if (rootA !== rootB) {
        emitAt(11, "different-roots");
        if (size[rootA] < size[rootB]) {
          emitAt(12, "compare-size");
          [rootA, rootB] = [rootB, rootA];
          emitAt(13, "swap-roots");
        }
        parent[rootB] = rootA;
        emitAt(14, "union");
        size[rootA] += size[rootB];
        emitAt(15, "grow-size");
      }
    }
    activeEdge = null;
    pass = "2 · AND edges";
    emitAt(16, "init-cost");
    for (let id = 0; id < edges.length; id++) {
      const [u, , weight] = edges[id]; activeEdge = id;
      const root = find(u); dsuCost[root] &= weight; componentCost[root] = dsuCost[root]; andEdges.push(id);
      currentCost = dsuCost[root];
      emitAt(18, "and-edge");
    }
    activeEdge = null;
    for (let qi = 0; qi < queries.length; qi++) {
      const [u, v] = queries[qi]; currentQuery = qi;
      const ru = find(u), rv = find(v);
      answer[qi] = ru === rv ? dsuCost[ru] : -1; currentCost = answer[qi];
      emitAt(19, ru === rv ? "answer" : "disconnected", { result: answer[qi], roots: [ru, rv] });
    }
  } else {
    parent = Array.from({ length: n }, (_, i) => i);
    const size = Array(n).fill(1);
    dsuCost = Array(n).fill(-1);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    emitAt(3, "init-parent");
    emitAt(4, "init-size");
    emitAt(5, "init-cost");
    for (let id = 0; id < edges.length; id++) {
      const [u, v, weight] = edges[id]; activeEdge = id;
      let ru = find(u), rv = find(v);
      emitAt(11, "find-roots");
      if (ru === rv) {
        dsuCost[ru] &= weight;
        componentCost[ru] = dsuCost[ru];
        andEdges.push(id);
        currentCost = dsuCost[ru];
        emitAt(13, "same-component");
      } else {
        emitAt(14, "different-roots");
        if (size[ru] < size[rv]) {
          emitAt(15, "compare-size");
          [ru, rv] = [rv, ru];
          emitAt(16, "swap-roots");
        }
        parent[ru] = rv;
        emitAt(17, "union");
        size[rv] += size[ru];
        emitAt(18, "grow-size");
        dsuCost[rv] &= dsuCost[ru] & weight;
        componentCost[rv] = dsuCost[rv];
        andEdges.push(id);
        currentCost = dsuCost[rv];
        emitAt(19, "merge");
      }
    }
    activeEdge = null;
    for (let qi = 0; qi < queries.length; qi++) {
      const [u, v] = queries[qi]; currentQuery = qi;
      const ru = find(u), rv = find(v);
      answer[qi] = ru === rv ? dsuCost[ru] : -1; currentCost = answer[qi];
      emitAt(20, ru === rv ? "answer" : "disconnected", { result: answer[qi], roots: [ru, rv] });
    }
  }

  currentQuery = null; activeEdge = null; currentNode = null; queue = [];
  emitAt(CODES[selected - 1].length, "done", { results: [...answer] }, true);
  return { original: { n, edges, queries }, answer, steps };
}

function builderFor(approach) {
  return (input) => buildSteps(input, approach);
}

const problem = {
  id: 3108,
  difficulty: "hard",
  slug: "minimum-cost-walk-in-weighted-graph",
  category: { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
  tags: [
    { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
    { key: "graph", vi: "Đồ thị", en: "Graph" },
    { key: "bit-manipulation", vi: "Thao tác bit", en: "Bit Manipulation" },
  ],
  title: bi("Minimum Cost Walk in Weighted Graph", "Minimum Cost Walk in Weighted Graph"),
  titleVi: bi("Tìm chi phí walk nhỏ nhất bằng AND cạnh", "Find the minimum walk cost by AND-ing edges"),
  statement: bi(
    "Mỗi query [u, v] hỏi AND nhỏ nhất của trọng số cạnh trên một walk từ u đến v. Walk được đi lại node/cạnh; nếu không liên thông, trả -1. AND của toàn bộ cạnh trong component là đáp án.",
    "For each [u, v], find the minimum bitwise AND of edge weights along a walk from u to v. A walk may revisit nodes and edges; return -1 if disconnected. The AND of all edges in the component is the answer.",
  ),
  defaultInput: JSON.stringify({
    n: 5,
    edges: [[0, 1, 7], [1, 3, 7], [1, 2, 1], [0, 2, 3]],
    queries: [[0, 3], [3, 4], [0, 2]],
  }),
  inputKind: "string",
  inputLabel: bi("JSON: {n, edges:[[u,v,w]], queries:[[u,v]]}", "JSON: {n, edges:[[u,v,w]], queries:[[u,v]]}"),
  extraParams: [{
    key: "approach", type: "select", default: "5", label: bi("Cách giải", "Approach"),
    options: APPROACHES.map((label, index) => ({ value: String(index + 1), label })),
  }],
  approach: METHODS.map((method, index) => bi(
    `Cách ${index + 1}: ${method[0]} · Thời gian ${method[2]}, bộ nhớ ${method[3]}.`,
    `Approach ${index + 1}: ${method[1]} · Time ${method[2]}, space ${method[3]}.`,
  )),
  complexity: {
    time: METHODS[4][2],
    space: METHODS[4][3],
    note: bi(
      "Walk được phép lặp lại cạnh. Vì vậy, khi u và v cùng component, có thể đi vòng để dùng mọi cạnh; AND tất cả trọng số cạnh sẽ cho chi phí nhỏ nhất.",
      "Walks may repeat edges. Thus, if u and v share a component, a detour can include every edge; AND-ing all edge weights gives the minimum cost.",
    ),
  },
  code: CODE_1,
  code2: CODE_2,
  code3: CODE_3,
  code4: CODE_4,
  code5: CODE_5,
  codeLabel: APPROACHES[0],
  code2Label: APPROACHES[1],
  code3Label: APPROACHES[2],
  code4Label: APPROACHES[3],
  code5Label: APPROACHES[4],
  parser: parseInput,
  liveArgs: (input) => {
    const { n, edges, queries } = parseInput(input);
    return [n, edges, queries];
  },
  builder: (input, params = {}) => buildSteps(input, params.approach),
  builder2: builderFor(2),
  builder3: builderFor(3),
  builder4: builderFor(4),
  builder5: builderFor(5),
};

module.exports = { 3108: problem };
