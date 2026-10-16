"use strict";
const bi = (vi, en) => ({ vi, en });
const CODE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def minimumSafeLevel(self, n: int, edges: List[List[int]], u: int, v: int) -> int:",
  "        if u == v:",
  "            return 0",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "",
  "        def find(x: int) -> int:",
  "            while x != parent[x]:",
  "                parent[x] = parent[parent[x]]",
  "                x = parent[x]",
  "            return x",
  "",
  "        def union(a: int, b: int) -> bool:",
  "            root_a, root_b = find(a), find(b)",
  "            if root_a == root_b:",
  "                return False",
  "            if size[root_a] < size[root_b]:",
  "                root_a, root_b = root_b, root_a",
  "            parent[root_b] = root_a",
  "            size[root_a] += size[root_b]",
  "            return True",
  "",
  "        ordered_edges = sorted(edges, key=lambda edge: edge[2])",
  "        for a, b, weight in ordered_edges:",
  "            if union(a, b):",
  "                if find(u) == find(v):",
  "                    return weight",
  "        return -1",
]);
const copy = value => Array.isArray(value) ? value.map(copy) : value;

function buildSteps({ n, edges, u, v }) {
  let parent, size, ordered_edges, a, b, weight;
  let activeEdge = null, unionResult = null, sortEdge = null;
  const steps = [], accepted = new Set(), skipped = new Set();
  const sorted = edges.map(([a, b, weight], id) => ({ a, b, weight, id })).sort((a, b) => a.weight - b.weight || a.id - b.id);
  const chain = start => {
    if (!parent) return [start];
    const result = [start];
    while (parent[result.at(-1)] !== result.at(-1)) {
      result.push(parent[result.at(-1)]);
      if (result.length > n) throw new Error("9021: cyclic DSU parent chain");
    }
    return result;
  };
  function finalRoute() {
    const graph = Array.from({ length: n }, () => []);
    for (const id of accepted) {
      const [x, y] = edges[id]; graph[x].push([y, id]); graph[y].push([x, id]);
    }
    const from = Array(n).fill(null), queue = [u]; from[u] = [u, null];
    for (let i = 0; i < queue.length; i++) for (const [next, id] of graph[queue[i]]) if (!from[next]) { from[next] = [queue[i], id]; queue.push(next); }
    const nodes = [], ids = [];
    if (!from[v]) return { nodes, ids };
    for (let cursor = v; ; cursor = from[cursor][0]) {
      nodes.push(cursor); if (cursor === u) break; ids.push(from[cursor][1]);
    }
    return { nodes: nodes.reverse(), ids: ids.reverse() };
  }
  function emit(line, phase, frame = null, extra = {}) {
    const scope = frame?.scope || "minimumSafeLevel";
    const values = frame ? frame.locals : { n, u, v, parent, size, ordered_edges, a, b, weight };
    const locals = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined).map(([key, value]) => [key, copy(value)]));
    const roots = Array.from({ length: n }, (_, i) => chain(i).at(-1));
    const components = [...new Set(roots)].map(root => ({ root, nodes: roots.flatMap((r, i) => r === root ? [i] : []) }));
    const find = scope === "find" ? { x: frame.locals.x, chain: chain(frame.locals.x) } : null;
    const union = scope === "union" ? { a: frame.locals.a, b: frame.locals.b, rootA: frame.locals.root_a ?? null, rootB: frame.locals.root_b ?? null } : null;
    const view = {
      n, edges: copy(edges), u, v, phase, source: { line, text: CODE[line - 1], scope, timing: "before" }, locals,
      parent: parent ? [...parent] : null, size: size ? [...size] : null, roots, components,
      ordered: ordered_edges ? sorted.map(e => ({ ...e })) : [], activeEdge, sortEdge,
      weight: weight ?? null, accepted: [...accepted], skipped: [...skipped], unionResult,
      find, union, connected: parent ? roots[u] === roots[v] : u === v,
      final: false, answer: null, pathNodes: [], pathEdges: [], ...extra,
    };
    steps.push({ arr: [], highlight: [], mark: [], codeBlock: 3, codeLines: [line], final: !!extra.final,
      title: bi("Kruskal + Union-Find", "Kruskal + Union-Find"), note: bi("", ""),
      vars: Object.entries(locals).filter(([name]) => !["parent", "size", "ordered_edges"].includes(name)).map(([name, value]) => ({ name, value })),
      safeKruskal9021View: view });
  }
  function find(start) {
    let x = start;
    const frame = () => ({ scope: "find", locals: { x, parent } });
    while (true) {
      emit(11, "find-check", frame()); if (x === parent[x]) break;
      emit(12, "compress", frame()); parent[x] = parent[parent[x]];
      emit(13, "climb", frame()); x = parent[x];
    }
    emit(14, "find-root", frame()); return x;
  }
  function union(a, b) {
    let root_a, root_b;
    const frame = () => ({ scope: "union", locals: { a, b, root_a, root_b, parent, size } });
    emit(17, "find-pair", frame());
    const first = find(a), second = find(b); root_a = first; root_b = second;
    emit(18, "same-root", frame());
    if (root_a === root_b) {
      emit(19, "cycle", frame()); skipped.add(activeEdge); unionResult = false; return false;
    }
    emit(20, "choose-root", frame());
    if (size[root_a] < size[root_b]) { emit(21, "swap", frame()); [root_a, root_b] = [root_b, root_a]; }
    emit(22, "link", frame()); parent[root_b] = root_a; accepted.add(activeEdge);
    emit(23, "grow", frame()); size[root_a] += size[root_b];
    emit(24, "merged", frame()); unionResult = true; return true;
  }
  emit(5, "same-node");
  if (u === v) {
    emit(6, "found", null, { final: true, answer: 0, pathNodes: [u] });
    return { original: { n, edges, u, v }, answer: 0, steps };
  }
  emit(7, "parents"); parent = Array.from({ length: n }, (_, i) => i);
  emit(8, "sizes"); size = Array(n).fill(1);
  emit(10, "define-find"); emit(16, "define-union");
  emit(26, "sort");
  edges.forEach((edge, id) => { sortEdge = id; emit(26, "sort-key", { scope: "<lambda>", locals: { edge } }); });
  sortEdge = null; ordered_edges = sorted.map(e => [e.a, e.b, e.weight]);
  for (let i = 0; ; i++) {
    emit(27, "next-edge"); if (i === sorted.length) break;
    const edge = sorted[i]; ({ a, b, weight } = edge); activeEdge = edge.id; unionResult = null;
    emit(28, "try-union");
    if (union(a, b)) {
      emit(29, "check-connected");
      const sourceRoot = find(u), targetRoot = find(v);
      if (sourceRoot === targetRoot) {
        const route = finalRoute();
        emit(30, "found", null, { final: true, answer: weight, pathNodes: route.nodes, pathEdges: route.ids });
        return { original: { n, edges, u, v }, answer: weight, steps };
      }
    }
  }
  activeEdge = null;
  emit(31, "unreachable", null, { final: true, answer: -1 });
  return { original: { n, edges, u, v }, answer: -1, steps };
}
module.exports = { CODE, buildSteps };
