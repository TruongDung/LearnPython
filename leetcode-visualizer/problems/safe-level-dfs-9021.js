"use strict";
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumSafeLevel(self, n: int, edges: List[List[int]], u: int, v: int) -> int:",
  "        if u == v:",
  "            return 0",
  "        graph = [[] for _ in range(n)]",
  "        max_level = 0",
  "        for a, b, weight in edges:",
  "            graph[a].append((b, weight))",
  "            graph[b].append((a, weight))",
  "            max_level = max(max_level, weight)",
  "        def can_reach(limit: int) -> bool:",
  "            stack = [u]",
  "            visited = {u}",
  "            while stack:",
  "                node = stack.pop()",
  "                if node == v:",
  "                    return True",
  "                for nei, weight in graph[node]:",
  "                    if weight <= limit and nei not in visited:",
  "                        visited.add(nei)",
  "                        stack.append(nei)",
  "            return False",
  "        if not can_reach(max_level):",
  "            return -1",
  "        left, right = 0, max_level",
  "        while left < right:",
  "            mid = (left + right) // 2",
  "            if can_reach(mid):",
  "                right = mid",
  "            else:",
  "                left = mid + 1",
  "        return left",
]);
const copy = value => Array.isArray(value) ? value.map(copy) : value instanceof Set ? [...value].sort((a, b) => a - b) : value;

function buildSteps({ n, edges, u, v }) {
  let graph, max_level, a, b, weight, left, right, mid, rowIndex;
  let limit = null, stack, visited, current = null, neighbor = null, activeEdge = null;
  let call = 0, checkKind = null, reachable = null, routeNodes = [], routeEdges = [];
  let neighborSeen = null;
  const steps = [], built = new Set(), crossed = new Set(), history = [];
  const edgeIds = new Map(edges.map(([x, y], id) => [`${Math.min(x, y)}:${Math.max(x, y)}`, id]));
  const mainLocals = () => ({ n, u, v, graph, max_level, a, b, weight, left, right, mid, _: rowIndex });
  function emit(line, phase, values = mainLocals(), scope = "minimumSafeLevel", extra = {}) {
    const locals = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => [key, copy(value)]));
    const view = {
      n, edges: copy(edges), u, v, phase, source: { line, text: CODE[line - 1], scope, timing: "before" }, locals,
      graph: graph ? copy(graph) : null, maxLevel: max_level ?? null, left: left ?? null, right: right ?? null, mid: mid ?? null,
      limit, stack: stack ? [...stack] : [], seen: visited ? copy(visited) : [], current, neighbor, activeEdge, neighborSeen,
      builtEdges: [...built], crossedEdges: [...crossed], history: history.map(item => ({ ...item })),
      call, checkKind, reachable, pathNodes: [...routeNodes], pathEdges: [...routeEdges], final: false, answer: null, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeBlock: 4, codeLines: [line], final: !!extra.final,
      title: bi("Binary Search + DFS", "Binary Search + DFS"), note: bi("", ""),
      vars: Object.entries(locals).filter(([name]) => !["graph", "_"].includes(name)).map(([name, value]) => ({ name, value })),
      safeDfs9021View: view });
  }
  function witness(threshold) {
    const frontier = [u], previous = Array(n).fill(null), previousEdge = Array(n).fill(null), seen = new Set([u]);
    while (frontier.length) {
      const node = frontier.pop();
      if (node === v) {
        const nodes = [], ids = [];
        for (let cursor = v; cursor !== null; cursor = previous[cursor]) { nodes.push(cursor); if (previousEdge[cursor] !== null) ids.push(previousEdge[cursor]); }
        return { nodes: nodes.reverse(), edges: ids.reverse() };
      }
      for (const [nei, weight] of graph[node]) if (weight <= threshold && !seen.has(nei)) {
        seen.add(nei); previous[nei] = node; previousEdge[nei] = edgeIds.get(`${Math.min(node, nei)}:${Math.max(node, nei)}`); frontier.push(nei);
      }
    }
    return { nodes: [], edges: [] };
  }
  function canReach(threshold, kind) {
    limit = threshold; checkKind = kind; call++; stack = undefined; visited = undefined;
    current = null; neighbor = null; activeEdge = null; neighborSeen = null; reachable = null; routeNodes = []; routeEdges = []; crossed.clear();
    let node, nei, weight;
    const locals = () => ({ limit, stack, visited, node, nei, weight, graph, u, v });
    const snap = (line, phase, extra) => emit(line, phase, locals(), "can_reach", extra);
    snap(14, "stack"); stack = [u];
    snap(15, "visited"); visited = new Set([u]);
    while (true) {
      snap(16, "while-stack"); if (!stack.length) break;
      activeEdge = null; neighbor = null;
      snap(17, "pop"); node = stack.pop(); current = node;
      snap(18, "target");
      if (node === v) {
        const path = witness(limit); routeNodes = path.nodes; routeEdges = path.edges;
        snap(19, "success", { reachable: true }); reachable = true;
        history.push({ limit, reachable: true, kind }); return true;
      }
      for (let i = 0; ; i++) {
        snap(20, "next-neighbor"); if (i === graph[node].length) break;
        [nei, weight] = graph[node][i]; neighbor = nei;
        neighborSeen = visited.has(nei);
        activeEdge = edgeIds.get(`${Math.min(node, nei)}:${Math.max(node, nei)}`);
        snap(21, weight > limit ? "locked" : visited.has(nei) ? "seen" : "inspect");
        if (weight <= limit && !visited.has(nei)) {
          snap(22, "mark"); visited.add(nei);
          snap(23, "push"); stack.push(nei); crossed.add(activeEdge);
        }
      }
    }
    snap(24, "failure", { reachable: false }); reachable = false;
    history.push({ limit, reachable: false, kind }); return false;
  }
  emit(5, "same-node");
  if (u === v) { emit(6, "found", undefined, undefined, { final: true, answer: 0, limit: 0, pathNodes: [u], reachable: true }); return { original: { n, edges, u, v }, answer: 0, steps }; }
  emit(7, "graph"); for (rowIndex = 0; rowIndex < n; rowIndex++) emit(7, "graph"); rowIndex = undefined;
  graph = Array.from({ length: n }, () => []);
  emit(8, "max-level"); max_level = 0;
  for (let i = 0; ; i++) {
    emit(9, "next-edge"); if (i === edges.length) break;
    [a, b, weight] = edges[i]; activeEdge = i;
    emit(10, "add-forward"); graph[a].push([b, weight]);
    emit(11, "add-backward"); graph[b].push([a, weight]); built.add(i);
    emit(12, "raise-max"); max_level = Math.max(max_level, weight);
  }
  activeEdge = null;
  emit(13, "define-dfs");
  emit(25, "precheck");
  if (!canReach(max_level, "precheck")) {
    emit(26, "unreachable", undefined, undefined, { final: true, answer: -1, reachable: false });
    return { original: { n, edges, u, v }, answer: -1, steps };
  }
  emit(27, "bounds"); left = 0; right = max_level;
  while (true) {
    emit(28, "while-search"); if (left >= right) break;
    emit(29, "mid"); mid = Math.floor((left + right) / 2);
    emit(30, "check-mid");
    if (canReach(mid, "search")) { emit(31, "lower-right"); right = mid; }
    else { emit(33, "raise-left"); left = mid + 1; }
  }
  const path = witness(left);
  emit(34, "found", undefined, undefined, { final: true, answer: left, limit: left, reachable: true, current: null, neighbor: null, activeEdge: null, pathNodes: path.nodes, pathEdges: path.edges });
  return { original: { n, edges, u, v }, answer: left, steps };
}
module.exports = { CODE, buildSteps };
