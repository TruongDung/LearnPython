'use strict';
const base = require('./graph')[1377];
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const copy = value => JSON.parse(JSON.stringify(value));
const CODE = `from collections import deque

class Solution:
    def frogPosition(self, n, edges, t, target):
        graph = [[] for _ in range(n + 1)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        queue = deque([(1, 0, 0, 1.0)])
        while queue:
            node, parent, elapsed, probability = queue.popleft()
            children = [child for child in graph[node] if child != parent]
            if elapsed == t or not children:
                if node == target:
                    return probability
                continue
            share = probability / len(children)
            for child in children:
                queue.append((child, node, elapsed + 1, share))
        return 0.0`;

function parse(input, params = {}) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) throw new TypeError('#1377: invalid parameters');
  const n = params.n === undefined ? 7 : params.n;
  const t = params.t === undefined ? 2 : params.t;
  const target = params.target === undefined ? 4 : params.target;
  if (!Number.isInteger(n) || n < 1 || n > 14 || !Number.isInteger(t) || t < 0 || t > 50 ||
      !Number.isInteger(target) || target < 1 || target > n) {
    throw new RangeError('#1377: 1 ≤ n ≤ 14, 0 ≤ t ≤ 50, 1 ≤ target ≤ n');
  }
  let edges = input;
  try {
    if (typeof edges === 'string') {
      const s = edges.trim();
      edges = s.startsWith('[') ? JSON.parse(s) : s ? s.split(/[;\n]/).map(row =>
        row.split(',').map(token => token.trim() ? Number(token) : NaN)) : [];
    }
  } catch { edges = null; }
  if (!Array.isArray(edges) || edges.length !== n - 1 || !Array.from(edges).every(edge =>
    Array.isArray(edge) && edge.length === 2 && Array.from(edge).every(u => Number.isInteger(u) && u >= 1 && u <= n) && edge[0] !== edge[1])) {
    throw new RangeError('#1377: edges must contain exactly n−1 pairs [u,v] with vertices 1…n');
  }
  const graph = Array.from({ length: n + 1 }, () => []), pairs = new Set();
  for (const [u, v] of edges) {
    const key = [Math.min(u, v), Math.max(u, v)].join(',');
    if (pairs.has(key)) throw new RangeError('#1377: duplicate undirected edge');
    pairs.add(key); graph[u].push(v); graph[v].push(u);
  }
  const seen = new Set([1]), todo = [1];
  for (let i = 0; i < todo.length; i++) for (const child of graph[todo[i]]) if (!seen.has(child)) { seen.add(child); todo.push(child); }
  if (seen.size !== n) throw new RangeError('#1377: edges must form one connected tree');
  return { n, t, target, edges: edges.map(edge => [...edge]) };
}
function payload(input, params) { const c = parse(input, params); return { code: CODE, method: 'frogPosition', args: [c.n, c.edges, c.t, c.target] }; }

function build(input, params) {
  const config = parse(input, params), code = CODE.split('\n');
  const native = runTrace({ code: CODE, method: 'frogPosition', args: [config.n, config.edges, config.t, config.target] });
  const arrivals = Array(config.n + 1).fill(null), popped = [], transfers = [], navigation = {};
  let current = null, children = null, share = null, shareDenominator = null, decision = null, flow = null;
  const steps = native.events.map((event, step) => {
    const x = event.locals, text = code[event.line - 1].trim(); let change = null;
    if (text === 'queue = deque([(1, 0, 0, 1.0)])') {
      arrivals[1] = { node: 1, parent: 0, elapsed: 0, probability: x.queue[0][3], denominator: 1, step };
      navigation[1] = { enqueue: step, pop: null }; change = { kind: 'seed', node: 1 };
    }
    if (text === 'node, parent, elapsed, probability = queue.popleft()') {
      current = x.node; children = null; share = null; shareDenominator = null; decision = null; flow = null;
      popped.push({ node: x.node, elapsed: x.elapsed, probability: x.probability, step });
      navigation[x.node].pop = step; change = { kind: 'pop', node: x.node };
    }
    if (text.startsWith('children = ')) { children = [...x.children]; change = { kind: 'choices', node: x.node }; }
    if (text === 'if elapsed == t or not children:') {
      decision = { terminal: event.branch, atTime: x.elapsed === config.t, leaf: x.children.length === 0 };
      change = { kind: 'decision', node: x.node };
    }
    if (text === 'share = probability / len(children)') {
      share = x.share; shareDenominator = arrivals[x.node].denominator * x.children.length;
      change = { kind: 'split', node: x.node };
    }
    if (text === 'queue.append((child, node, elapsed + 1, share))') {
      const packet = x.queue.at(-1), row = { node: packet[0], parent: packet[1], elapsed: packet[2], probability: packet[3], denominator: shareDenominator, step };
      arrivals[row.node] = row; navigation[row.node] = { enqueue: step, pop: null };
      flow = { from: row.parent, to: row.node, probability: row.probability, denominator: row.denominator };
      transfers.push({ ...flow, elapsed: row.elapsed, step }); change = { kind: 'enqueue', node: row.node };
    }
    const final = event.returning && event.scope === 'frogPosition';
    let reason = null;
    if (final) {
      const targetArrival = arrivals[config.target];
      reason = native.answer > 0 ? (x.elapsed < config.t ? 'leaf-stay' : 'at-time') : targetArrival ? 'must-leave' : 'too-far';
    }
    const path = [];
    for (let node = current; node; node = arrivals[node]?.parent ?? 0) path.unshift(node);
    const v = { id: 1377, ...config, current, children: copy(children), share, shareDenominator,
      arrivals: copy(arrivals), popped: copy(popped), transfers: copy(transfers), decision: copy(decision), flow: copy(flow), path,
      elapsed: x.elapsed ?? null, parent: x.parent ?? null, probability: x.probability ?? null, change,
      source: { line: event.line, text, timing: 'after' }, locals: x, outer: event.outer, frames: event.frames,
      scope: event.scope, branch: event.branch, returning: event.returning, returned: event.returned,
      trace: native.trace, reason, result: final ? native.answer : null,
      resultDenominator: final && native.answer > 0 ? arrivals[config.target].denominator : null };
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: bi(`L${event.line} · ${text}`, `L${event.line} · ${text}`), note: bi('', ''),
      vars: Object.entries(x).map(([name, value]) => ({ name, value, rawValue: value })), frog1377View: v };
  });
  // Navigation can target a later recorded statement; it does not expose future probability state.
  for (const step of steps) step.frog1377View.navigation = copy(navigation);
  return { original: config.edges, answer: native.answer, steps };
}

module.exports = { 1377: {
  ...base, difficulty: 'hard', code: CODE.split('\n'), debugMode: 'line-by-line', builder: build, liveArgs: (input, params) => payload(input, params).args,
  tracePayload: payload, allowEmptyInput: true,
  inputLabel: bi('edges · u,v;u,v hoặc JSON · cây 1–14 đỉnh', 'edges · u,v;u,v or JSON · a tree of 1–14 nodes'),
  extraParams: [
    { key: 'n', label: bi('n · 1–14 đỉnh', 'n · 1–14 nodes'), default: 7, min: 1, max: 14 },
    { key: 't', label: bi('t · 0–50 giây', 't · 0–50 seconds'), default: 2, min: 0, max: 50 },
    { key: 'target', label: bi('target', 'target'), default: 4, min: 1, max: 14 },
  ],
  statement: bi('Ếch bắt đầu ở 1, chia đều xác suất cho các đỉnh kề chưa thăm. Không còn chỗ nhảy thì đứng yên. Tìm xác suất ở target sau t giây.',
    'The frog starts at 1 and splits probability equally among unvisited neighbors. It stays when none remain. Find the probability at target after t seconds.'),
  approach: [bi('BFS giữ các trạng thái (đỉnh, parent, giây, xác suất). Chỉ dừng một nhánh khi hết t hoặc tới lá; lá giữ nguyên xác suất đến t.',
    'BFS stores (node, parent, elapsed, probability). Stop a branch at time t or at a leaf; a leaf retains its probability until t.')],
  complexity: { time: 'O(n)', space: 'O(n)', note: bi('Mỗi đỉnh vào queue tối đa một lần trên cây.', 'Each tree node enters the queue at most once.') },
  visualizationLimits: { maxNodes: 14, maxTime: 50, completeTrace: true },
} };
