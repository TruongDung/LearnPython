"use strict";

const bi = (vi, en) => ({ vi, en });

const CODE_1 = [
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edgeList:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        answer = []",
  "        for u, v, limit in queries:",
  "            stack, seen = [u], {u}",
  "            while stack:",
  "                node = stack.pop()",
  "                if node == v:",
  "                    break",
  "                for neighbor, weight in graph[node]:",
  "                    if weight < limit and neighbor not in seen:",
  "                        seen.add(neighbor)",
  "                        stack.append(neighbor)",
  "            answer.append(v in seen)",
  "        return answer",
];

const CODE_2 = [
  "from collections import deque",
  "",
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edgeList:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        answer = []",
  "        for u, v, limit in queries:",
  "            queue, seen = deque([u]), {u}",
  "            while queue:",
  "                node = queue.popleft()",
  "                if node == v:",
  "                    break",
  "                for neighbor, weight in graph[node]:",
  "                    if weight < limit and neighbor not in seen:",
  "                        seen.add(neighbor)",
  "                        queue.append(neighbor)",
  "            answer.append(v in seen)",
  "        return answer",
];

const CODE_3 = [
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])",
  "            return parent[x]",
  "        def union(a, b):",
  "            ra, rb = find(a), find(b)",
  "            if ra == rb:",
  "                return",
  "            if size[ra] < size[rb]:",
  "                ra, rb = rb, ra",
  "            parent[rb] = ra",
  "            size[ra] += size[rb]",
  "        ordered_edges = sorted(edgeList, key=lambda e: e[2])",
  "        ordered_queries = sorted(enumerate(queries), key=lambda x: x[1][2])",
  "        answer = [False] * len(queries)",
  "        edge_index = 0",
  "        for query_id, (u, v, limit) in ordered_queries:",
  "            while edge_index < len(ordered_edges) and ordered_edges[edge_index][2] < limit:",
  "                a, b, _ = ordered_edges[edge_index]",
  "                union(a, b)",
  "                edge_index += 1",
  "            answer[query_id] = find(u) == find(v)",
  "        return answer",
];

const CODE_4 = [
  "import heapq",
  "",
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, weight in edgeList:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "        answer = []",
  "        for source, target, limit in queries:",
  "            best = [float('inf')] * n",
  "            best[source] = 0",
  "            heap = [(0, source)]",
  "            while heap:",
  "                bottleneck, node = heapq.heappop(heap)",
  "                if bottleneck != best[node]:",
  "                    continue",
  "                for neighbor, weight in graph[node]:",
  "                    candidate = max(bottleneck, weight)",
  "                    if candidate < best[neighbor]:",
  "                        best[neighbor] = candidate",
  "                        heapq.heappush(heap, (candidate, neighbor))",
  "            answer.append(best[target] < limit)",
  "        return answer",
];

const CODE_5 = [
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        parent = list(range(n))",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])",
  "            return parent[x]",
  "        tree = [[] for _ in range(n)]",
  "        for a, b, weight in sorted(edgeList, key=lambda e: e[2]):",
  "            ra, rb = find(a), find(b)",
  "            if ra != rb:",
  "                parent[ra] = rb",
  "                tree[a].append((b, weight))",
  "                tree[b].append((a, weight))",
  "        levels = n.bit_length()",
  "        up = [[-1] * n for _ in range(levels)]",
  "        high = [[0] * n for _ in range(levels)]",
  "        depth = [-1] * n",
  "        component = [-1] * n",
  "        for root in range(n):",
  "            if depth[root] != -1:",
  "                continue",
  "            depth[root] = 0",
  "            component[root] = root",
  "            stack = [root]",
  "            while stack:",
  "                node = stack.pop()",
  "                for neighbor, weight in tree[node]:",
  "                    if neighbor == up[0][node]:",
  "                        continue",
  "                    up[0][neighbor] = node",
  "                    high[0][neighbor] = weight",
  "                    depth[neighbor] = depth[node] + 1",
  "                    component[neighbor] = root",
  "                    stack.append(neighbor)",
  "        for k in range(1, levels):",
  "            for node in range(n):",
  "                middle = up[k - 1][node]",
  "                if middle != -1:",
  "                    up[k][node] = up[k - 1][middle]",
  "                    high[k][node] = max(high[k - 1][node], high[k - 1][middle])",
  "        def bottleneck(a, b):",
  "            result = 0",
  "            if depth[a] < depth[b]:",
  "                a, b = b, a",
  "            diff = depth[a] - depth[b]",
  "            for k in range(levels):",
  "                if diff >> k & 1:",
  "                    result = max(result, high[k][a])",
  "                    a = up[k][a]",
  "            if a == b:",
  "                return result",
  "            for k in range(levels - 1, -1, -1):",
  "                if up[k][a] != up[k][b]:",
  "                    result = max(result, high[k][a], high[k][b])",
  "                    a, b = up[k][a], up[k][b]",
  "            return max(result, high[0][a], high[0][b])",
  "        return [component[u] == component[v] and bottleneck(u, v) < limit",
  "                for u, v, limit in queries]",
];

const CODE_6 = [
  "class Solution:",
  "    def distanceLimitedPathsExist(self, n, edgeList, queries):",
  "        edges = sorted(edgeList, key=lambda e: e[2])",
  "        weights = sorted({weight for _, _, weight in edges})",
  "        low, high = [-1] * len(queries), [len(weights)] * len(queries)",
  "        while any(high[i] - low[i] > 1 for i in range(len(queries))):",
  "            groups = {}",
  "            for i, (u, v, _) in enumerate(queries):",
  "                if high[i] - low[i] > 1:",
  "                    mid = (low[i] + high[i]) // 2",
  "                    groups.setdefault(mid, []).append(i)",
  "            parent = list(range(n))",
  "            def find(x):",
  "                if parent[x] != x:",
  "                    parent[x] = find(parent[x])",
  "                return parent[x]",
  "            edge_index = 0",
  "            for mid in sorted(groups):",
  "                while edge_index < len(edges) and edges[edge_index][2] <= weights[mid]:",
  "                    a, b, _ = edges[edge_index]",
  "                    parent[find(a)] = find(b)",
  "                    edge_index += 1",
  "                for i in groups[mid]:",
  "                    u, v, _ = queries[i]",
  "                    if find(u) == find(v):",
  "                        high[i] = mid",
  "                    else:",
  "                        low[i] = mid",
  "        return [u == v or (high[i] < len(weights) and weights[high[i]] < limit)",
  "                for i, (u, v, limit) in enumerate(queries)]",
];

const CODES = [CODE_1, CODE_2, CODE_3, CODE_4, CODE_5, CODE_6];
const APPROACHES = [
  { value: "1", label: bi("1 · Brute Force DFS · Dễ hiểu, TLE", "1 · Brute-force DFS · Easy, TLE") },
  { value: "2", label: bi("2 · BFS mỗi query · Dễ hiểu, TLE", "2 · BFS per query · Easy, TLE") },
  { value: "3", label: bi("3 · Sorting + Union-Find · Tối ưu, nên học", "3 · Sorting + Union-Find · Optimal, recommended") },
  { value: "4", label: bi("4 · Dijkstra minimax · Đúng nhưng chậm", "4 · Minimax Dijkstra · Correct but slow") },
  { value: "5", label: bi("5 · MST + LCA · Nâng cao", "5 · MST + LCA · Advanced") },
  { value: "6", label: bi("6 · Parallel Binary Search + DSU · Phức tạp", "6 · Parallel binary search + DSU · Complex") },
];

const METHODS = [
  ["Brute Force DFS", "Brute-force DFS", "O(Q × (V + E))", "Dễ hiểu, TLE", "Easy, TLE"],
  ["BFS cho từng Query", "BFS per query", "O(Q × (V + E))", "Dễ hiểu, TLE", "Easy, TLE"],
  ["Sorting + Union-Find (DSU)", "Sorting + Union-Find (DSU)", "O(E log E + Q log Q + (E+Q)α(V))", "Tối ưu, nên học", "Optimal, recommended"],
  ["Dijkstra (Minimax Path)", "Dijkstra (Minimax path)", "O(Q × (V+E) log V)", "Đúng nhưng chậm", "Correct but slow"],
  ["Minimum Spanning Tree + LCA", "Minimum spanning tree + LCA", "O(E log E + V log V + Q log V)", "Nâng cao", "Advanced"],
  ["Parallel Binary Search + DSU", "Parallel binary search + DSU", "O((E+Q) log E × α(V) + E log E)", "Nâng cao, phức tạp", "Advanced, complex"],
];

function parseInput(input) {
  let data = input;
  if (typeof input === "string") {
    try { data = JSON.parse(input); } catch { throw new Error("1697: input must be valid JSON."); }
  }
  if (!data || !Number.isInteger(data.n) || data.n < 1 || data.n > 12) {
    throw new Error("1697: n must be an integer from 1 to 12 for visualization.");
  }
  if (!Array.isArray(data.edgeList) || data.edgeList.length > 30) {
    throw new Error("1697: edgeList must contain at most 30 [u, v, weight] edges.");
  }
  if (!Array.isArray(data.queries) || data.queries.length > 12) {
    throw new Error("1697: queries must contain at most 12 [p, q, limit] entries.");
  }
  const edgeList = data.edgeList.map((edge) => {
    if (!Array.isArray(edge) || edge.length !== 3 || edge.some((value) => !Number.isInteger(value))) {
      throw new Error("1697: every edge must be [u, v, weight] with integer values.");
    }
    const [u, v, weight] = edge;
    if (u < 0 || u >= data.n || v < 0 || v >= data.n || weight < 0 || weight > 1_000_000_000) {
      throw new Error("1697: edge endpoints must be valid nodes and weight must be in [0, 1e9].");
    }
    return [u, v, weight];
  });
  const queries = data.queries.map((query) => {
    if (!Array.isArray(query) || query.length !== 3 || query.some((value) => !Number.isInteger(value))) {
      throw new Error("1697: every query must be [p, q, limit] with integer values.");
    }
    const [p, q, limit] = query;
    if (p < 0 || p >= data.n || q < 0 || q >= data.n || limit < 1 || limit > 1_000_000_000) {
      throw new Error("1697: query endpoints must be valid nodes and limit must be in [1, 1e9].");
    }
    return [p, q, limit];
  });
  return { n: data.n, edgeList, queries };
}

function buildSteps(input, approach = 1) {
  const data = parseInput(input);
  const selected = Math.min(6, Math.max(1, Number(approach) || 1));
  const { n, edgeList, queries } = data;
  const graph = Array.from({ length: n }, () => []);
  edgeList.forEach(([a, b, weight], id) => {
    graph[a].push({ node: b, weight, id });
    graph[b].push({ node: a, weight, id });
  });
  const steps = [];
  let currentQuery = null, activeEdge = null, currentNode = null, threshold = null;
  let queue = [], seen = [], accepted = [], distance = [], forest = [], answer = [];
  let detail = {};
  const parentRoot = (parent, x) => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  function emit(phase, lineText, updates = {}, final = false) {
    Object.assign(detail, updates);
    const line = CODES[selected - 1].findIndex((text) => text.trim() === lineText.trim() || text.trim().startsWith(lineText.trim())) + 1;
    if (line < 1) throw new Error(`1697: source line not found: ${lineText}`);
    const components = detail.parent
      ? Array.from({ length: n }, (_, node) => parentRoot(detail.parent, node))
      : [];
    const view = {
      n, edgeList, queries, approach: selected, phase, currentQuery, activeEdge, currentNode,
      threshold, queue: [...queue], seen: [...seen], accepted: [...accepted], forest: [...forest],
      distance: [...distance], answer: [...answer], components, detail: { ...detail }, final,
    };
    steps.push({
      codeBlock: selected,
      codeLines: [line],
      final,
      title: bi(`Cách ${selected} · ${APPROACHES[selected - 1].label.vi.split(" · ").slice(1).join(" · ")}`, `Approach ${selected} · ${APPROACHES[selected - 1].label.en.split(" · ").slice(1).join(" · ")}`),
      note: bi("", ""),
      vars: [{ name: "query", value: currentQuery === null ? "—" : currentQuery }, { name: "limit", value: threshold ?? "—" }, { name: "queue", value: queue.length ? queue.join(" → ") : "∅" }],
      distanceLimited1697View: view,
    });
  }

  if (selected <= 2) {
    const breadthFirst = selected === 2;
    const buildLine = breadthFirst ? "graph = [[] for _ in range(n)]" : "graph = [[] for _ in range(n)]";
    emit("build", buildLine);
    edgeList.forEach(([a, b, weight], id) => {
      activeEdge = id;
      emit("add-edge", breadthFirst ? `graph[a].append((b, weight))` : "graph[a].append((b, weight))", { built: id + 1 });
    });
    activeEdge = null;
    for (let qi = 0; qi < queries.length; qi++) {
      currentQuery = qi;
      const [source, target, limit] = queries[qi];
      threshold = limit;
      queue = [source]; seen = [source]; currentNode = null;
      emit("query-start", breadthFirst ? "queue, seen = deque([u]), {u}" : "stack, seen = [u], {u}");
      while (queue.length) {
        currentNode = breadthFirst ? queue.shift() : queue.pop();
        emit("pop", breadthFirst ? "node = queue.popleft()" : "node = stack.pop()");
        if (currentNode === target) {
          emit("found", "if node == v:");
          break;
        }
        for (const edge of graph[currentNode]) {
          activeEdge = edge.id;
          emit("check-edge", "for neighbor, weight in graph[node]:");
          if (edge.weight < limit && !seen.includes(edge.node)) {
            seen.push(edge.node); queue.push(edge.node);
            emit("discover", breadthFirst ? "queue.append(neighbor)" : "stack.append(neighbor)");
          } else {
            emit(edge.weight < limit ? "visited" : "blocked", "if weight < limit and neighbor not in seen:");
          }
        }
        activeEdge = null;
      }
      const reachable = seen.includes(target);
      answer[qi] = reachable;
      queue = [];
      emit(reachable ? "yes" : "no", "answer.append(v in seen)", { reachable, path: [] });
    }
  } else if (selected === 3) {
    const parent = Array.from({ length: n }, (_, i) => i), size = Array(n).fill(1);
    const sortedEdges = edgeList.map((edge, id) => ({ edge, id })).sort((a, b) => a.edge[2] - b.edge[2] || a.id - b.id);
    const sortedQueries = queries.map((query, id) => ({ query, id })).sort((a, b) => a.query[2] - b.query[2] || a.id - b.id);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => {
      let ra = find(a), rb = find(b);
      if (ra === rb) return false;
      if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
      parent[rb] = ra; size[ra] += size[rb]; return true;
    };
    let edgeIndex = 0;
    emit("sort", "ordered_edges = sorted(edgeList, key=lambda e: e[2])", { parent, size, sortedEdges: sortedEdges.map(({ edge }) => edge), sortedQueries: sortedQueries.map(({ id }) => id) });
    for (const { query: [u, v, limit], id } of sortedQueries) {
      currentQuery = id; threshold = limit;
      emit("query-start", "for query_id, (u, v, limit) in ordered_queries:", { parent, size, edgeIndex });
      while (edgeIndex < sortedEdges.length && sortedEdges[edgeIndex].edge[2] < limit) {
        const { edge: [a, b], id: edgeId } = sortedEdges[edgeIndex];
        activeEdge = edgeId;
        emit("add-eligible", "while edge_index < len(ordered_edges) and ordered_edges[edge_index][2] < limit:", { parent, size, edgeIndex });
        if (union(a, b)) accepted.push(edgeId);
        edgeIndex++;
        emit("union", "union(a, b)", { parent, size, edgeIndex });
      }
      activeEdge = null;
      const reachable = find(u) === find(v); answer[id] = reachable;
      emit(reachable ? "yes" : "no", "answer[query_id] = find(u) == find(v)", { parent, size, reachable });
    }
  } else if (selected === 4) {
    for (let qi = 0; qi < queries.length; qi++) {
      currentQuery = qi;
      const [source, target, limit] = queries[qi]; threshold = limit;
      distance = Array(n).fill(Infinity); distance[source] = 0;
      let heap = [[0, source]], visited = [];
      emit("query-start", "best[source] = 0", { best: [...distance] });
      while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [cost, node] = heap.shift(); currentNode = node;
        emit("pop", "bottleneck, node = heapq.heappop(heap)", { heap: [...heap], best: [...distance] });
        if (cost !== distance[node]) { emit("stale", "if bottleneck != best[node]:"); continue; }
        if (!visited.includes(node)) visited.push(node);
        for (const edge of graph[node]) {
          activeEdge = edge.id;
          emit("check-edge", "for neighbor, weight in graph[node]:", { best: [...distance] });
          const candidate = Math.max(cost, edge.weight);
          if (candidate < distance[edge.node]) {
            distance[edge.node] = candidate; heap.push([candidate, edge.node]);
            accepted = [...new Set([...accepted, edge.id])];
            emit("relax", "candidate = max(bottleneck, weight)", { best: [...distance], heap: [...heap] });
          } else emit("keep", "if candidate < best[neighbor]:", { best: [...distance] });
        }
      }
      activeEdge = null;
      const reachable = distance[target] < limit; answer[qi] = reachable;
      emit(reachable ? "yes" : "no", "answer.append(best[target] < limit)", { reachable, best: [...distance], visited });
      accepted = [];
    }
  } else if (selected === 5) {
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const tree = Array.from({ length: n }, () => []);
    const sortedEdges = edgeList.map((edge, id) => ({ edge, id })).sort((a, b) => a.edge[2] - b.edge[2] || a.id - b.id);
    emit("mst-start", "tree = [[] for _ in range(n)]", { parent, tree: tree.map((x) => [...x]) });
    for (const { edge: [a, b, weight], id } of sortedEdges) {
      activeEdge = id;
      emit("mst-check", "for a, b, weight in sorted(edgeList, key=lambda e: e[2]):", { parent, tree: tree.map((x) => [...x]) });
      const ra = find(a), rb = find(b);
      if (ra !== rb) {
        parent[ra] = rb; tree[a].push({ node: b, weight, id }); tree[b].push({ node: a, weight, id }); forest.push(id);
        emit("mst-add", "tree[a].append((b, weight))", { parent, tree: tree.map((x) => [...x]) });
      } else emit("mst-skip", "if ra != rb:", { parent, tree: tree.map((x) => [...x]) });
    }
    activeEdge = null;
    const levels = Math.max(1, Math.ceil(Math.log2(n + 1)));
    const up = Array.from({ length: levels }, () => Array(n).fill(-1));
    const high = Array.from({ length: levels }, () => Array(n).fill(0));
    const depth = Array(n).fill(-1), component = Array(n).fill(-1), treeParentEdge = Array(n).fill(-1);
    for (let root = 0; root < n; root++) {
      if (depth[root] !== -1) continue;
      depth[root] = 0; component[root] = root;
      const stack = [root];
      while (stack.length) {
        const node = stack.pop();
        for (const edge of tree[node]) {
          if (edge.node === up[0][node]) continue;
          up[0][edge.node] = node; high[0][edge.node] = edge.weight;
          depth[edge.node] = depth[node] + 1; component[edge.node] = root; treeParentEdge[edge.node] = edge.id;
          stack.push(edge.node);
        }
      }
    }
    emit("lca-base", "up = [[-1] * n for _ in range(levels)]", { parent, depth, up: up.map((x) => [...x]), high: high.map((x) => [...x]), component });
    for (let k = 1; k < levels; k++) for (let node = 0; node < n; node++) {
      const middle = up[k - 1][node];
      if (middle !== -1) {
        up[k][node] = up[k - 1][middle];
        high[k][node] = Math.max(high[k - 1][node], high[k - 1][middle]);
      }
    }
    emit("lca-build", "for k in range(1, levels):", { parent, depth, up: up.map((x) => [...x]), high: high.map((x) => [...x]), component });
    const bottleneck = (a0, b0) => {
      let a = a0, b = b0, result = 0;
      if (depth[a] < depth[b]) [a, b] = [b, a];
      let diff = depth[a] - depth[b];
      for (let k = levels - 1; k >= 0; k--) if ((diff >> k) & 1) { result = Math.max(result, high[k][a]); a = up[k][a]; }
      if (a !== b) for (let k = levels - 1; k >= 0; k--) if (up[k][a] !== up[k][b]) {
        result = Math.max(result, high[k][a], high[k][b]); a = up[k][a]; b = up[k][b];
      }
      if (a !== b) result = Math.max(result, high[0][a], high[0][b]);
      return result;
    };
    for (let qi = 0; qi < queries.length; qi++) {
      currentQuery = qi;
      const [u, v, limit] = queries[qi]; threshold = limit;
      const reachable = component[u] === component[v] && bottleneck(u, v) < limit;
      answer[qi] = reachable;
      emit(reachable ? "yes" : "no", "return max(result, high[0][a], high[0][b])", { parent, depth, up: up.map((x) => [...x]), high: high.map((x) => [...x]), component, reachable, bottleneck: component[u] === component[v] ? bottleneck(u, v) : Infinity });
    }
  } else {
    const sortedEdges = edgeList.map((edge, id) => ({ edge, id })).sort((a, b) => a.edge[2] - b.edge[2] || a.id - b.id);
    const weights = [...new Set(sortedEdges.map(({ edge }) => edge[2]))];
    const low = Array(queries.length).fill(-1), high = Array(queries.length).fill(weights.length);
    const midsByRound = [];
    emit("pbs-start", "edges = sorted(edgeList, key=lambda e: e[2])", { sortedEdges: sortedEdges.map(({ edge }) => edge), weights, low: [...low], high: [...high] });
    while (queries.some((_, i) => high[i] - low[i] > 1)) {
      const groups = new Map();
      queries.forEach((_, i) => {
        if (high[i] - low[i] > 1) {
          const mid = Math.floor((low[i] + high[i]) / 2);
          if (!groups.has(mid)) groups.set(mid, []);
          groups.get(mid).push(i);
        }
      });
      const parent = Array.from({ length: n }, (_, i) => i);
      const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
      let edgeIndex = 0;
      const mids = [...groups.keys()].sort((a, b) => a - b); midsByRound.push(mids);
      emit("pbs-round", "groups = {}", { parent, low: [...low], high: [...high], mids, round: midsByRound.length });
      for (const mid of mids) {
        threshold = weights[mid];
        while (edgeIndex < sortedEdges.length && sortedEdges[edgeIndex].edge[2] <= threshold) {
          const { edge: [a, b], id } = sortedEdges[edgeIndex]; activeEdge = id;
          emit("pbs-edge", "while edge_index < len(edges) and edges[edge_index][2] <= weights[mid]:", { parent, low: [...low], high: [...high], mids, edgeIndex, mid });
          const ra = find(a), rb = find(b);
          if (ra !== rb) { parent[ra] = rb; accepted.push(id); }
          edgeIndex++;
          emit("pbs-union", "parent[find(a)] = find(b)", { parent, low: [...low], high: [...high], mids, edgeIndex, mid });
        }
        for (const queryId of groups.get(mid)) {
          currentQuery = queryId;
          const [u, v] = queries[queryId], connected = find(u) === find(v);
          if (connected) high[queryId] = mid; else low[queryId] = mid;
          emit(connected ? "pbs-yes" : "pbs-no", "if find(u) == find(v):", { parent, low: [...low], high: [...high], mids, mid, connected });
        }
      }
      accepted = []; activeEdge = null;
    }
    queries.forEach(([u, v, limit], i) => {
      currentQuery = i; threshold = limit;
      answer[i] = u === v || (high[i] < weights.length && weights[high[i]] < limit);
      emit(answer[i] ? "yes" : "no", "return [u == v or (high[i] < len(weights)", { low: [...low], high: [...high], weights, resultIndex: i, reachable: answer[i] });
    });
  }

  answer.length = queries.length;
  emit("done", selected === 3 ? "return answer" : selected === 5 ? "for u, v, limit in queries]" : selected === 6 ? "return [u == v or (high[i] < len(weights)" : "return answer", { answer: [...answer], results: [...answer] }, true);
  return { original: data, answer, steps };
}

function buildFor(approach) {
  return (input) => buildSteps(input, approach);
}

const problem = {
  id: 1697,
  difficulty: "hard",
  slug: "checking-existence-of-edge-length-limited-paths",
  category: { key: "union-find", vi: "Union-Find (DSU)", en: "Union-Find (DSU)" },
  tags: [
    { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
    { key: "graph", vi: "Đồ thị", en: "Graph" },
    { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
  ],
  title: bi("Kiểm tra đường đi giới hạn độ dài cạnh", "Checking Existence of Edge Length Limited Paths"),
  titleVi: bi("Đường đi chỉ dùng cạnh nhỏ hơn limit", "Paths using only edges below the limit"),
  statement: bi(
    "Mỗi truy vấn [p, q, limit] hỏi có đường đi từ p tới q sao cho mọi cạnh trên đường có trọng số nhỏ hơn limit không? So sánh 6 cách giải; cách 3 là lựa chọn tối ưu nên học.",
    "For each [p, q, limit], determine whether p can reach q using only edges with weight strictly below limit. Compare six approaches; approach 3 is the recommended optimal method.",
  ),
  defaultInput: JSON.stringify({
    n: 5,
    edgeList: [[0, 1, 2], [1, 2, 4], [2, 3, 6], [3, 4, 8], [0, 4, 10], [0, 2, 5]],
    queries: [[0, 2, 5], [0, 3, 6], [0, 4, 9], [1, 4, 8], [0, 4, 10]],
  }),
  inputKind: "string",
  inputLabel: bi("JSON: {n, edgeList, queries} · n≤12, E≤30, Q≤12", "JSON: {n, edgeList, queries} · n≤12, E≤30, Q≤12"),
  extraParams: [{
    key: "approach", type: "select", default: "3", label: bi("Cách giải", "Approach"), options: APPROACHES,
  }],
  approach: METHODS.map((method, index) => bi(
    `Cách ${index + 1}: ${method[0]} · ${method[3]}. Thời gian ${method[2]}.`,
    `Approach ${index + 1}: ${method[1]} · ${method[4]}. Time ${method[2]}.`,
  )),
  complexity: {
    time: METHODS[2][2],
    space: "O(V + E + Q)",
    note: bi("Cách 3 sắp xếp cạnh và truy vấn tăng dần theo limit; chỉ thêm cạnh có weight < limit. Hãy thử limit bằng đúng trọng số cạnh để thấy điều kiện nghiêm ngặt.", "Approach 3 sorts edges and queries by limit, adding only edges with weight < limit. Try a limit equal to an edge weight to see the strict comparison."),
  },
  code: CODE_1,
  code2: CODE_2,
  code3: CODE_3,
  code4: CODE_4,
  code5: CODE_5,
  code6: CODE_6,
  codeLabel: APPROACHES[0].label,
  code2Label: APPROACHES[1].label,
  code3Label: APPROACHES[2].label,
  code4Label: APPROACHES[3].label,
  code5Label: APPROACHES[4].label,
  code6Label: APPROACHES[5].label,
  parser: parseInput,
  liveArgs: (input) => {
    const { n, edgeList, queries } = parseInput(input);
    return [n, edgeList, queries];
  },
  builder: (input, params = {}) => buildSteps(input, params.approach),
  builder2: buildFor(2),
  builder3: buildFor(3),
  builder4: buildFor(4),
  builder5: buildFor(5),
  builder6: buildFor(6),
};

module.exports = { 1697: problem };
