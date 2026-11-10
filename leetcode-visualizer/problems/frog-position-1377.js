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

function explainStep(view, final) {
  const { current, elapsed, change, children = [], arrivals, decision, share, shareDenominator, flow, t, target } = view;
  const probability = current === null ? null : arrivals[current]?.probability ?? null;
  const fraction = (value, denominator) => denominator ? `${Math.round(value * denominator)}/${denominator}` : `${value}`;
  if (final) {
    if (view.reason === 'leaf-stay') {
      return {
        title: bi(`Ếch đứng yên ở lá ${target}`, `Frog stays at leaf ${target}`),
        note: bi(`Ếch đến lá ở giây ${elapsed} và không còn đỉnh con để nhảy. Xác suất ${fraction(view.result, view.resultDenominator)} được giữ nguyên đến giây ${t}.`,
          `The frog reached this leaf at second ${elapsed} and has nowhere else to jump. Its ${fraction(view.result, view.resultDenominator)} probability stays unchanged through second ${t}.`),
      };
    }
    if (view.reason === 'at-time') {
      return {
        title: bi(`Đã đến giây ${t} tại đỉnh ${target}`, `Reached second ${t} at node ${target}`),
        note: bi(`Vừa đủ ${t} lần nhảy để đến target. Xác suất cần tìm là ${fraction(view.result, view.resultDenominator)}.`,
          `The frog reaches the target in exactly ${t} jumps. Its probability is ${fraction(view.result, view.resultDenominator)}.`),
      };
    }
    const reached = arrivals[target];
    return {
      title: bi('Kết thúc tìm kiếm', 'Search complete'),
      note: reached
        ? bi(`Ếch đã đến đỉnh ${target} ở giây ${reached.elapsed}, nhưng đỉnh này còn đường đi xuống nên phải nhảy tiếp. Vì thế sau ${t} giây, xác suất tại đây bằng 0.`,
          `The frog reached node ${target} at second ${reached.elapsed}, but it still has children and must keep moving. Its probability there after ${t} seconds is 0.`)
        : bi(`Không thể đến đỉnh ${target} trong ${t} giây; xác suất tại target bằng 0.`,
          `Node ${target} cannot be reached in ${t} seconds, so its probability is 0.`),
    };
  }
  if (change?.kind === 'seed') {
    return {
      title: bi('Bắt đầu: ếch ở đỉnh 1', 'Start: frog is at node 1'),
      note: bi('Chưa nhảy lần nào, nên toàn bộ xác suất nằm ở đỉnh 1: P = 1.',
        'No jumps have happened yet, so all probability is at node 1: P = 1.'),
    };
  }
  if (change?.kind === 'pop') {
    return {
      title: bi(`Xét đỉnh ${current} ở giây ${elapsed}`, `Process node ${current} at second ${elapsed}`),
      note: bi(`Lấy trạng thái này khỏi hàng đợi BFS. Xác suất để ếch ở đây là ${fraction(probability, arrivals[current]?.denominator)}.`,
        `Remove this state from the BFS queue. The probability of the frog being here is ${fraction(probability, arrivals[current]?.denominator)}.`),
    };
  }
  if (change?.kind === 'choices') {
    const list = children.length ? children.join(', ') : 'không có';
    return {
      title: bi(`Tìm các đỉnh có thể nhảy từ ${current}`, `Find available jumps from ${current}`),
      note: bi(`Bỏ qua đỉnh cha ${view.parent || '∅'} để không quay lại. Các lựa chọn: ${list}.`,
        `Exclude parent ${view.parent || '∅'} to prevent jumping backward. Available children: ${list}.`),
    };
  }
  if (change?.kind === 'decision') {
    const terminal = decision?.atTime
      ? bi(`Đã hết ${t} giây`, `The ${t} seconds are up`)
      : bi(`Đỉnh ${current} là lá`, `Node ${current} is a leaf`);
    const note = decision?.terminal
      ? bi(`${terminal.vi}; nhánh này dừng lại${decision.atTime ? '.' : ' và ếch sẽ đứng yên ở lá.'}`,
        `${terminal.en}; stop this branch${decision.atTime ? '.' : ' and let the frog stay at the leaf.'}`)
      : bi(`Chưa hết thời gian và còn đỉnh con. Tiếp tục chia xác suất cho ${children.length} lựa chọn.`,
        `Time remains and children are available. Split the probability across ${children.length} choices.`);
    return { title: bi('Kiểm tra điều kiện dừng', 'Check the stopping condition'), note };
  }
  if (change?.kind === 'split') {
    return {
      title: bi(`Chia xác suất tại đỉnh ${current}`, `Split probability at node ${current}`),
      note: bi(`${fraction(probability, arrivals[current]?.denominator)} ÷ ${children.length} đỉnh con = ${fraction(share, shareDenominator)} cho mỗi nhánh.`,
        `${fraction(probability, arrivals[current]?.denominator)} ÷ ${children.length} children = ${fraction(share, shareDenominator)} for each branch.`),
    };
  }
  if (change?.kind === 'enqueue' && flow) {
    return {
      title: bi(`Nhảy ${flow.from} → ${flow.to}`, `Jump ${flow.from} → ${flow.to}`),
      note: bi(`Đưa trạng thái (đỉnh ${flow.to}, giây ${elapsed}, xác suất ${fraction(flow.probability, flow.denominator)}) vào cuối hàng đợi BFS.`,
        `Append (node ${flow.to}, second ${elapsed}, probability ${fraction(flow.probability, flow.denominator)}) to the BFS queue.`),
    };
  }
  if (current !== null && view.source.line === 10) {
    return {
      title: bi('Lấy trạng thái tiếp theo trong BFS', 'Take the next BFS state'),
      note: bi(`Hàng đợi còn ${view.locals.queue?.length ?? 0} trạng thái. BFS xử lý lần lượt từng nhánh xác suất.`,
        `There are ${view.locals.queue?.length ?? 0} states left in the queue. BFS processes each probability branch in turn.`),
    };
  }
  if (view.source.line === 18) {
    return {
      title: bi('Duyệt từng lựa chọn', 'Visit each available choice'),
      note: bi(`Mỗi đỉnh con của ${current} tạo một trạng thái mới với cùng phần xác suất được chia đều.`,
        `Each child of ${current} gets a new state with the same evenly divided share.`),
    };
  }
  return {
    title: current === null
      ? bi('Tạo danh sách kề từ các cạnh', 'Build the adjacency list from edges')
      : bi(`Tiếp tục xử lý đỉnh ${current}`, `Continue processing node ${current}`),
    note: current === null
      ? bi('Đồ thị là cây vô hướng. Danh sách kề giúp tìm các đỉnh có thể đến từ mỗi đỉnh.',
        'The graph is an undirected tree. The adjacency list records which nodes can be reached from each node.')
      : bi('Xác suất đi theo từng nhánh được giữ riêng trong hàng đợi BFS.',
        'The probability for each path is kept as a separate state in the BFS queue.'),
  };
}

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
    const narration = explainStep(v, final);
    return { arr: [], codeBlock: 1, codeLines: [event.line], final,
      title: narration.title, note: narration.note,
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
