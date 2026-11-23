'use strict';
const { runTrace } = require('./wasm-picture-trace');
const bi = (vi, en) => ({ vi, en });
const BIPARTITION = `from collections import deque

class Solution:
    def possibleBipartition(self, n: int, dislikes: list[list[int]]) -> bool:
        graph = [[] for _ in range(n + 1)]
        for u, v in dislikes:
            graph[u].append(v)
            graph[v].append(u)

        color = [-1] * (n + 1)
        for start in range(1, n + 1):
            if color[start] != -1:
                continue
            color[start] = 0
            queue = deque([start])
            while queue:
                node = queue.popleft()
                for nei in graph[node]:
                    if color[nei] == -1:
                        color[nei] = 1 - color[node]
                        queue.append(nei)
                    elif color[nei] == color[node]:
                        return False
        return True`;
const GARDENS = `class Solution:
    def gardenNoAdj(self, n: int, paths: list[list[int]]) -> list[int]:
        graph = [[] for _ in range(n + 1)]
        for u, v in paths:
            graph[u].append(v)
            graph[v].append(u)

        color = [0] * (n + 1)
        for garden in range(1, n + 1):
            used = {color[nei] for nei in graph[garden]}
            for flower in range(1, 5):
                if flower not in used:
                    color[garden] = flower
                    break
        return color[1:]`;

function parse(id, input, params = {}) {
  const n = Number(params.n ?? 4);
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError(`${id}: n must be an integer from 1 to 12.`);
  let edges;
  try { edges = typeof input === 'string' ? JSON.parse(input) : input; } catch { edges = null; }
  if (!Array.isArray(edges) || edges.some(e => !Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 1 || v > n) || e[0] === e[1])) throw new RangeError(`${id}: use JSON pairs of distinct nodes from 1 to n, or [] for no edges.`);
  const seen = new Set(), graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    const key = [Math.min(u, v), Math.max(u, v)].join('-');
    if (seen.has(key)) throw new RangeError(`${id}: duplicate undirected edges are not allowed.`);
    seen.add(key); graph[u].push(v); graph[v].push(u);
  }
  if (id === 1042 && graph.some(neighbors => neighbors.length > 3)) throw new RangeError('1042: every garden must have at most 3 neighbors.');
  return { n, edges: edges.map(e => [...e]), graph };
}

function oddCycle(u, v, parent) {
  const left = [], right = [];
  for (let node = u; node !== null && node !== undefined; node = parent[node]) left.push(node);
  for (let node = v; node !== null && node !== undefined; node = parent[node]) {
    const at = left.indexOf(node);
    if (at !== -1) return [...left.slice(0, at + 1), ...right.reverse(), u];
    right.push(node);
  }
  return [];
}

function build(id, input, params = {}) {
  const { n, edges, graph } = parse(id, input, params), gardenMode = id === 1042;
  const code = (gardenMode ? GARDENS : BIPARTITION).split('\n');
  const trace = runTrace({ code: code.join('\n'), method: gardenMode ? 'gardenNoAdj' : 'possibleBipartition', args: [n, edges] });
  let active = null, conflict = null, cycle = [], candidate = null;
  const parent = {};
  const steps = trace.events.map((record, index) => {
    const x = record.outer, source = code[record.line - 1].trim(), final = index === trace.events.length - 1;
    const colors = x.color ? x.color.slice(1) : Array(n).fill(gardenMode ? 0 : -1);
    let event = 'prepare';
    if (gardenMode) {
      if (x.garden !== undefined) event = 'inspect';
      if (source === 'for garden in range(1, n + 1):' && record.branch) { candidate = null; event = 'garden'; }
      if (source === 'used = {color[nei] for nei in graph[garden]}') { candidate = null; event = 'blocked'; }
      if (source === 'for flower in range(1, 5):' && record.branch) { candidate = x.flower; event = 'candidate'; }
      if (source === 'if flower not in used:') { candidate = x.flower; event = record.branch ? 'available' : 'blocked-candidate'; }
      if (source === 'color[garden] = flower') { candidate = x.flower; event = 'plant'; }
    } else {
      if (x.start !== undefined) event = 'search';
      if (source === 'for start in range(1, n + 1):' && record.branch) { active = null; event = 'start'; }
      if (source === 'color[start] = 0') { parent[x.start] = null; event = 'seed'; }
      if (source === 'node = queue.popleft()') { active = null; event = 'pop'; }
      if (source === 'for nei in graph[node]:') { active = record.branch ? [x.node, x.nei] : null; event = 'edge'; }
      if (source === 'color[nei] = 1 - color[node]') { parent[x.nei] = x.node; active = [x.node, x.nei]; event = 'assign'; }
      if (source === 'elif color[nei] == color[node]:') {
        active = [x.node, x.nei]; event = record.branch ? 'conflict' : 'valid';
        if (record.branch) { conflict = [...active]; cycle = oddCycle(...active, parent); }
      }
    }
    if (final) event = gardenMode || trace.answer ? 'done' : 'impossible';
    const garden = gardenMode && !final ? x.garden ?? null : null;
    const used = garden === null ? [] : [...new Set(graph[garden].map(nei => colors[nei - 1]).filter(c => c > 0))].sort((a, b) => a - b);
    const titles = gardenMode ? {
      prepare: bi('Dựng đường nối giữa các vườn', 'Build paths between gardens'),
      garden: bi(`Xét vườn ${garden}`, `Inspect garden ${garden}`),
      blocked: bi(`Vườn ${garden}: loại màu hàng xóm đang dùng`, `Garden ${garden}: exclude colors used by neighbors`),
      'blocked-candidate': bi(`Loại ${candidate} đã bị chặn → thử loại tiếp`, `Type ${candidate} is blocked → try the next type`),
      plant: bi(`Vườn ${garden} → trồng loại ${candidate}`, `Garden ${garden} → plant type ${candidate}`),
      done: bi('Xong: mọi vườn kề nhau đều khác loại hoa', 'Done: adjacent gardens have different flower types'),
    } : {
      prepare: bi('Mỗi cặp không thích nhau phải khác nhóm', 'Each dislike pair must be in opposite groups'),
      seed: bi(`Người ${x.start} → nhóm A`, `Person ${x.start} → group A`),
      assign: bi(`Người ${x.nei} phải khác nhóm người ${x.node}`, `Person ${x.nei} must be opposite person ${x.node}`),
      conflict: bi(`Cặp ${x.node} — ${x.nei} cùng nhóm → False`, `Pair ${x.node} — ${x.nei} shares a group → False`),
      impossible: bi('Có chu trình lẻ → không thể chia hai nhóm', 'An odd cycle → bipartition is impossible'),
      done: bi('Chia được hai nhóm → True', 'A valid bipartition → True'),
    };
    const view = {
      id, n, edges: edges.map(e => [...e]), graph: graph.map(neighbors => [...neighbors]), colors,
      event, source, active: active ? [...active] : null, conflict: conflict ? [...conflict] : null, cycle: [...cycle],
      start: x.start ?? null, node: x.node ?? null, queue: x.queue ? [...x.queue] : [],
      garden, used, candidate, answer: final ? trace.answer : null, final,
    };
    return {
      arr: [], codeBlock: 1, codeLines: [record.line], final,
      title: titles[event] || bi(`Dòng ${record.line} · ${gardenMode ? 'chọn hoa' : 'chia nhóm'}`, `Line ${record.line} · ${gardenMode ? 'choose flowers' : 'split groups'}`),
      note: bi('', ''),
      vars: (gardenMode ? ['garden', 'used', 'flower', 'color'] : ['start', 'node', 'nei', 'queue', 'color']).map(name => ({ name, value: x[name] ?? '—' })),
      ...(gardenMode ? { garden1042View: view } : { partition886View: view }),
    };
  });
  return { original: edges, answer: trace.answer, steps };
}

const shared = id => ({
  id, difficulty: 'medium', inputKind: 'string', debugMode: 'line-by-line',
  category: { key: 'graph', vi: 'Đồ thị', en: 'Graph' },
  tags: [{ key: 'graph-coloring', vi: 'Tô màu đồ thị', en: 'Graph Coloring' }, { key: id === 886 ? 'bfs' : 'greedy', vi: id === 886 ? 'BFS' : 'Tham lam', en: id === 886 ? 'BFS' : 'Greedy' }],
  extraParams: [{ key: 'n', label: bi(`n · số ${id === 886 ? 'người' : 'vườn'} (1–12)`, `n · ${id === 886 ? 'people' : 'gardens'} (1–12)`), type: 'number', default: 4, min: 1, max: 12 }],
  complexity: { time: 'O(n + E)', space: 'O(n + E)' },
  builder: (input, params) => build(id, input, params),
  liveArgs: (input, params) => { const { n, edges } = parse(id, input, params); return [n, edges]; },
});

module.exports = {
  886: {
    ...shared(886), slug: 'possible-bipartition', title: bi('Possible Bipartition', 'Possible Bipartition'),
    titleVi: bi('Không thích nhau → phải khác nhóm', 'Dislike each other → opposite groups'),
    statement: bi('Chia n người vào hai nhóm sao cho không có cặp không thích nhau nào chung nhóm. Trả True nếu chia được, ngược lại False. Bản trực quan hỗ trợ 1–12 người.', 'Split n people into two groups so no dislike pair shares a group. Return True if possible, otherwise False. Visualization supports 1–12 people.'),
    inputLabel: bi('dislikes · các cặp người không thích nhau (JSON)', 'dislikes · JSON pairs of people who dislike each other'),
    defaultInput: '[[1,2],[1,3],[2,4]]', code: BIPARTITION.split('\n'),
    approach: [bi('Mỗi người là một đỉnh, mỗi cặp không thích nhau là một cạnh. Mọi cạnh phải bắc qua giữa hai nhóm.', 'Each person is a node and each dislike pair is an edge. Every edge must cross between the groups.'), bi('BFS: hàng xóm chưa xếp thì vào nhóm ngược lại. Hai đầu cạnh cùng nhóm tạo chu trình lẻ → False.', 'BFS: place an unassigned neighbor in the opposite group. A same-group edge reveals an odd cycle → False.'), bi('Duyệt mọi người để xử lý cả các nhóm rời nhau và người không có cặp dislike.', 'Scan every person to cover disconnected components and isolated people.')],
  },
  1042: {
    ...shared(1042), slug: 'flower-planting-with-no-adjacent', title: bi('Flower Planting With No Adjacent', 'Flower Planting With No Adjacent'),
    titleVi: bi('Vườn kề nhau → trồng khác loại hoa', 'Adjacent gardens → different flower types'),
    statement: bi('Có n vườn và 4 loại hoa. Các vườn nối bằng đường đi phải trồng khác loại. Mỗi vườn có tối đa 3 hàng xóm nên luôn còn một loại hoa để chọn. Trả về một cách trồng hợp lệ. Bản trực quan hỗ trợ 1–12 vườn.', 'Plant one of 4 flower types in each garden. Connected gardens must have different types. Every garden has at most 3 neighbors, so an available type always exists. Return any valid assignment. Visualization supports 1–12 gardens.'),
    inputLabel: bi('paths · các đường nối hai vườn (JSON)', 'paths · JSON pairs of connected gardens'),
    defaultInput: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]', code: GARDENS.split('\n'),
    approach: [bi('Xét từng vườn, loại các màu mà hàng xóm đã trồng, rồi chọn loại đầu tiên còn dùng được.', 'For each garden, exclude colors already used by neighbors, then choose the first available type.'), bi('Có 4 loại hoa và tối đa 3 hàng xóm → nhiều nhất 3 màu bị chặn → luôn còn ít nhất 1 màu.', 'Four types and at most three neighbors → at most three colors blocked → at least one remains.'), bi('0 nghĩa là chưa trồng; 0 không phải một loại hoa bị chặn. Không cần quay lui.', 'Zero means unplanted; zero is not a blocked flower type. No backtracking is needed.')],
  },
};
