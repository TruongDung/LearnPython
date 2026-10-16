"use strict";
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "import heapq",
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumSafeLevel(self, n: int, edges: List[List[int]], u: int, v: int) -> int:",
  "        graph = [[] for _ in range(n)]",
  "        for a, b, safe in edges:",
  "            graph[a].append((b, safe))",
  "            graph[b].append((a, safe))",
  "        best = [float('inf')] * n",
  "        best[u] = 0",
  "        heap = [(0, u)]",
  "        while heap:",
  "            cost, node = heapq.heappop(heap)",
  "            if cost != best[node]:",
  "                continue",
  "            if node == v:",
  "                return cost",
  "            for nei, weight in graph[node]:",
  "                candidate = max(cost, weight)",
  "                if candidate < best[nei]:",
  "                    best[nei] = candidate",
  "                    heapq.heappush(heap, (candidate, nei))",
  "        return -1",
]);

const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
// Match heapq's tuple ordering and array layout, including its pop sift operation.
function siftDown(heap, start, pos) {
  const item = heap[pos];
  while (pos > start) {
    const parent = (pos - 1) >> 1;
    if (!less(item, heap[parent])) break;
    heap[pos] = heap[parent]; pos = parent;
  }
  heap[pos] = item;
}
function push(heap, item) { heap.push(item); siftDown(heap, 0, heap.length - 1); }
function pop(heap) {
  const last = heap.pop();
  if (!heap.length) return last;
  const result = heap[0]; heap[0] = last;
  let pos = 0, child = 1;
  while (child < heap.length) {
    const right = child + 1;
    if (right < heap.length && !less(heap[child], heap[right])) child = right;
    heap[pos] = heap[child]; pos = child; child = 2 * pos + 1;
  }
  heap[pos] = last; siftDown(heap, 0, pos);
  return result;
}
const snapshot = value => Array.isArray(value) ? value.map(snapshot) : value === Infinity ? "∞" : value;

function buildSteps({ n, edges, u, v }) {
  let graph, best, heap, a, b, safe, cost, node, nei, weight, candidate, rowIndex;
  const steps = [], builtEdges = new Set(), settled = new Set();
  const parents = Array(n).fill(null), parentEdges = Array(n).fill(null);
  const edgeId = new Map(edges.map(([x, y], i) => [Math.min(x, y) + ":" + Math.max(x, y), i]));
  let activeEdge = null, neighbor = null, pending = false, relaxOldBest = null;
  function route(target) {
    if (!best || best[target] === Infinity) return { nodes: [], edges: [] };
    const nodes = [], ids = [], guard = new Set();
    for (let cursor = target; cursor !== null; cursor = parents[cursor]) {
      if (guard.has(cursor)) throw new Error("9021: cyclic predecessor chain");
      guard.add(cursor); nodes.push(cursor);
      if (parentEdges[cursor] !== null) ids.push(parentEdges[cursor]);
    }
    return { nodes: nodes.reverse(), edges: ids.reverse() };
  }
  function emit(line, phase, extra = {}) {
    const locals = { n, u, v };
    for (const [name, value] of Object.entries({ graph, a, b, safe, best, heap, cost, node, nei, weight, candidate, _: rowIndex })) if (value !== undefined) locals[name] = snapshot(value);
    const currentRoute = node !== undefined && !pending && best && cost === best[node] ? route(node) : { nodes: [], edges: [] };
    const view = {
      n, edges: edges.map(e => [...e]), u, v, phase,
      source: { line, text: CODE[line - 1], timing: "before", scope: "minimumSafeLevel" }, locals,
      graph: graph ? snapshot(graph) : null, best: best ? snapshot(best) : null,
      heap: heap ? snapshot(heap) : [], settled: [...settled], builtEdges: [...builtEdges],
      cost: cost ?? null, current: node ?? null, neighbor, activeEdge,
      weight: neighbor === null ? null : weight ?? null,
      candidate: ["compare", "update", "push"].includes(phase) ? candidate : null,
      oldBest: neighbor !== null ? snapshot(relaxOldBest) : null,
      stale: node !== undefined && best ? cost !== best[node] : false,
      currentPath: currentRoute.nodes, currentPathEdges: currentRoute.edges,
      pathNodes: [], pathEdges: [], answer: null, final: false, ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeBlock: 2, codeLines: [line], final: !!extra.final,
      title: bi("Dijkstra — đường có cạnh lớn nhất nhỏ nhất", "Dijkstra — minimax path"), note: bi("", ""),
      vars: Object.entries(locals).filter(([name]) => !["graph", "heap", "best", "_"].includes(name)).map(([name, value]) => ({ name, value })),
      safeDijkstra9021View: view });
  }
  emit(6, "graph");
  // CPython 3.12+ inlines this comprehension, producing one line event per item.
  for (rowIndex = 0; rowIndex < n; rowIndex++) emit(6, "graph");
  rowIndex = undefined; graph = Array.from({ length: n }, () => []);
  for (let i = 0; ; i++) {
    emit(7, "next-edge"); if (i === edges.length) break;
    [a, b, safe] = edges[i]; activeEdge = i;
    emit(8, "add-forward"); graph[a].push([b, safe]);
    emit(9, "add-backward"); graph[b].push([a, safe]); builtEdges.add(i);
  }
  activeEdge = null;
  emit(10, "best"); best = Array(n).fill(Infinity);
  emit(11, "start"); best[u] = 0;
  emit(12, "heap"); heap = [[0, u]];
  while (true) {
    emit(13, "while"); if (!heap.length) break;
    neighbor = null; activeEdge = null; pending = true;
    emit(14, "pop"); [cost, node] = pop(heap); pending = false;
    emit(15, "stale");
    if (cost !== best[node]) { emit(16, "skip-stale"); continue; }
    settled.add(node);
    emit(17, "target");
    if (node === v) {
      const path = route(v);
      emit(18, "found", { final: true, answer: cost, pathNodes: path.nodes, pathEdges: path.edges });
      return { original: { n, edges, u, v }, answer: cost, steps };
    }
    for (let i = 0; ; i++) {
      emit(19, "next-neighbor"); if (i === graph[node].length) break;
      [nei, weight] = graph[node][i]; neighbor = nei; relaxOldBest = best[nei];
      activeEdge = edgeId.get(Math.min(node, nei) + ":" + Math.max(node, nei));
      emit(20, "max"); candidate = Math.max(cost, weight);
      emit(21, "compare");
      if (candidate < best[nei]) {
        emit(22, "update"); best[nei] = candidate;
        parents[nei] = node; parentEdges[nei] = activeEdge;
        emit(23, "push"); push(heap, [candidate, nei]);
      }
    }
    neighbor = null; activeEdge = null;
  }
  neighbor = null; activeEdge = null;
  emit(24, "unreachable", { final: true, answer: -1 });
  return { original: { n, edges, u, v }, answer: -1, steps };
}
module.exports = { CODE, buildSteps };
