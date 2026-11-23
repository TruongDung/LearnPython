'use strict';

const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const CODE = `from collections import deque

class Solution:
    def magnificentSets(self, n: int, edges: list[list[int]]) -> int:
        graph = [[] for _ in range(n + 1)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        best = {}
        for start in range(1, n + 1):
            dist = {start: 0}
            queue = deque([start])

            while queue:
                node = queue.popleft()
                for nei in graph[node]:
                    if nei not in dist:
                        dist[nei] = dist[node] + 1
                        queue.append(nei)
                    elif abs(dist[nei] - dist[node]) != 1:
                        return -1

            component = min(dist)
            groups = max(dist.values()) + 1
            best[component] = max(best.get(component, 0), groups)

        return sum(best.values())`;
const code = CODE.split('\n');

function parse(input, params = {}) {
  const n = Number(params.n ?? 6);
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError('2493: n must be an integer from 1 to 12.');
  let edges;
  try { edges = typeof input === 'string' ? JSON.parse(input) : input; } catch { edges = null; }
  if (!Array.isArray(edges) || edges.some(edge => !Array.isArray(edge) || edge.length !== 2 || edge.some(v => !Number.isInteger(v) || v < 1 || v > n) || edge[0] === edge[1])) {
    throw new RangeError('2493: edges must be JSON pairs of distinct nodes from 1 to n, e.g. [[1,2],[2,3]]. Use [] for no edges.');
  }
  const seen = new Set();
  for (const [u, v] of edges) {
    const key = [Math.min(u, v), Math.max(u, v)].join('-');
    if (seen.has(key)) throw new RangeError('2493: duplicate undirected edges are not allowed.');
    seen.add(key);
  }
  return { n, edges: edges.map(edge => [...edge]) };
}

function componentsOf(n, edges) {
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }
  const components = [], seen = new Set();
  for (let start = 1; start <= n; start++) {
    if (seen.has(start)) continue;
    const nodes = [start]; seen.add(start);
    for (let at = 0; at < nodes.length; at++) for (const nei of graph[nodes[at]]) {
      if (!seen.has(nei)) { nodes.push(nei); seen.add(nei); }
    }
    nodes.sort((a, b) => a - b);
    components.push({ id: nodes[0], nodes });
  }
  return components;
}

function build(input, params = {}) {
  const { n, edges } = parse(input, params);
  const components = componentsOf(n, edges);
  const trace = runTrace({ code: CODE, method: 'magnificentSets', args: [n, edges] });
  const trials = [], winners = new Map();
  let distances = {}, queue = [], active = null, conflict = null;
  const steps = trace.events.map((record, index) => {
    const x = record.outer, source = code[record.line - 1].trim();
    const final = index === trace.events.length - 1;
    let event = 'prepare';
    if (x.start !== undefined) event = 'search';
    if (source === 'for start in range(1, n + 1):' && record.branch) {
      distances = {}; queue = []; active = null; event = 'start';
    } else if (source === 'dist = {start: 0}') {
      distances = Object.fromEntries(x.dist.__pairs__ ?? Object.entries(x.dist)); queue = []; active = null; event = 'seed';
    } else if (source === 'queue = deque([start])') {
      queue = [...x.queue]; event = 'enqueue';
    } else if (source === 'node = queue.popleft()') {
      queue = [...x.queue]; active = null; event = 'pop';
    } else if (source === 'for nei in graph[node]:') {
      active = record.branch ? [x.node, x.nei] : null; event = 'edge';
    } else if (source === 'dist[nei] = dist[node] + 1') {
      distances = Object.fromEntries(x.dist.__pairs__ ?? Object.entries(x.dist)); active = [x.node, x.nei]; event = 'assign';
    } else if (source === 'queue.append(nei)') {
      queue = [...x.queue]; event = 'enqueue';
    } else if (source === 'elif abs(dist[nei] - dist[node]) != 1:') {
      active = [x.node, x.nei]; event = record.branch ? 'conflict' : 'valid';
      if (record.branch) conflict = [...active];
    } else if (source === 'component = min(dist)' || source === 'groups = max(dist.values()) + 1') {
      active = null; event = 'measure';
    } else if (source === 'best[component] = max(best.get(component, 0), groups)') {
      const trial = { start: x.start, component: x.component, groups: x.groups, distances: { ...distances }, step: index };
      trials.push(trial);
      if (!winners.has(x.component) || winners.get(x.component).groups < x.groups) winners.set(x.component, trial);
      active = null; event = 'record';
    }
    if (final) event = trace.answer === -1 ? 'impossible' : 'done';
    const component = components.find(c => c.nodes.includes(x.start));
    const best = Object.fromEntries([...winners].map(([id, trial]) => [id, trial.groups]));
    const labels = {
      prepare: bi('Dựng đồ thị vô hướng', 'Build the undirected graph'),
      start: bi(`Thử đỉnh ${x.start} làm nhóm đầu`, `Try node ${x.start} in the first group`),
      seed: bi(`Đỉnh ${x.start} → nhóm 1`, `Node ${x.start} → group 1`),
      assign: bi(`Đỉnh ${x.nei} → nhóm ${(distances[x.nei] ?? 0) + 1}`, `Node ${x.nei} → group ${(distances[x.nei] ?? 0) + 1}`),
      record: bi(`BFS từ ${x.start}: ${x.groups} nhóm`, `BFS from ${x.start}: ${x.groups} groups`),
      conflict: bi('Hai đầu cạnh cùng nhóm → không thể chia', 'Both endpoints in one group → impossible'),
      impossible: bi('Có cạnh vi phạm → trả -1', 'A violated edge → return -1'),
      done: bi(`Tổng nhiều nhất: ${trace.answer} nhóm`, `Maximum total: ${trace.answer} groups`),
    };
    return {
      arr: [], codeBlock: 1, codeLines: [record.line], final,
      title: labels[event] || bi(`Dòng ${record.line} · BFS chia nhóm`, `Line ${record.line} · BFS grouping`),
      note: bi('', ''),
      vars: ['start', 'node', 'nei', 'dist', 'groups', 'best'].map(name => ({ name, value: x[name] ?? '—' })),
      magnificent2493View: {
        n, edges: edges.map(edge => [...edge]), components: components.map(c => ({ id: c.id, nodes: [...c.nodes] })),
        event, source, start: x.start ?? null, component: component?.id ?? null,
        distances: { ...distances }, queue: [...queue], node: x.node ?? null,
        active: active ? [...active] : null, conflict: conflict ? [...conflict] : null,
        trials: trials.map(t => ({ ...t, distances: { ...t.distances } })),
        winners: [...winners.values()].map(t => ({ ...t, distances: { ...t.distances } })),
        best, total: Object.values(best).reduce((a, b) => a + b, 0),
        answer: final ? trace.answer : null, final,
      },
    };
  });
  return { original: edges, answer: trace.answer, steps };
}

module.exports = { 2493: {
  id: 2493, difficulty: 'hard', slug: 'divide-nodes-into-the-maximum-number-of-groups',
  title: bi('Divide Nodes Into the Maximum Number of Groups', 'Divide Nodes Into the Maximum Number of Groups'),
  titleVi: bi('Xếp thành nhiều nhóm nhất; mỗi cạnh chỉ nối hai nhóm liền nhau', 'Maximize groups; each edge joins adjacent groups'),
  category: { key: 'bfs', vi: 'BFS', en: 'BFS' },
  tags: [{ key: 'graph', vi: 'Đồ thị', en: 'Graph' }, { key: 'graph-coloring', vi: 'Tô màu đồ thị', en: 'Graph Coloring' }],
  statement: bi('Chia n đỉnh thành nhiều nhóm không rỗng nhất. Mọi cạnh phải nối hai đỉnh có số nhóm chênh đúng 1. Các thành phần rời nhau có thể xếp nối tiếp. Nếu không thể chia, trả -1. Bản trực quan hỗ trợ 1–12 đỉnh.', 'Split n nodes into the maximum number of nonempty groups. Every edge must join nodes whose group indices differ by exactly 1. Disconnected components can be placed consecutively. Return -1 if impossible. Visualization supports 1–12 nodes.'),
  defaultInput: '[[1,2],[1,4],[1,5],[2,6],[2,3],[4,6]]', inputKind: 'string',
  inputLabel: bi('edges · các cặp đỉnh dạng JSON', 'edges · JSON node pairs'),
  extraParams: [{ key: 'n', label: bi('n · số đỉnh (1–12)', 'n · nodes (1–12)'), type: 'number', default: 6, min: 1, max: 12 }],
  code, codeLabel: bi('BFS từ mỗi đỉnh → chọn nhiều tầng nhất cho từng thành phần', 'BFS from every node → keep the most layers per component'),
  debugMode: 'line-by-line',
  approach: [
    bi('Mỗi tầng BFS là một nhóm: group[v] = dist[v] + 1. Mọi cạnh phải nối hai tầng chênh đúng 1.', 'Each BFS layer is a group: group[v] = dist[v] + 1. Every edge must join layers differing by exactly 1.'),
    bi('Gặp cạnh nối hai đỉnh cùng tầng → có chu trình lẻ → trả -1.', 'An edge within one BFS layer implies an odd cycle → return -1.'),
    bi('Thử mọi đỉnh làm gốc, lấy số tầng lớn nhất cho mỗi thành phần. Cộng các kết quả, không cộng mọi lần BFS.', 'Try every root; keep the maximum layer count for each component. Sum those maxima, not every BFS result.'),
  ],
  complexity: { time: 'O(n · (n + E))', space: 'O(n + E)' },
  builder: build, liveArgs: (input, params) => { const { n, edges } = parse(input, params); return [n, edges]; },
} };
