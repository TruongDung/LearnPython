"use strict";

const { bi, fail, parsePlainParams, parseIntegerArray, parseRows } = require("./hard-viz-shared");
const DEFAULT_NUMS = "[6,2,2,2,6]";
const DEFAULT_EDGES = "[[0,1],[1,2],[1,3],[3,4]]";
const LIMITS = Object.freeze({ maxNodes: 32, maxValue: 50, maxTraceSteps: 12000 });
const SOURCE = Object.freeze([
  "class Solution:",
  "    def componentValue(self, nums, edges):",
  "        n = len(nums)",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "        parent = [-2] * n",
  "        parent[0] = -1",
  "        order = [0]",
  "        for node in order:",
  "            for neighbor in graph[node]:",
  "                if neighbor == parent[node]:",
  "                    continue",
  "                parent[neighbor] = node",
  "                order.append(neighbor)",
  "        total = sum(nums)",
  "        for parts in range(min(n, total // max(nums)), 0, -1):",
  "            if total % parts:",
  "                continue",
  "            target = total // parts",
  "            subtotal = nums[:]",
  "            groups = 0",
  "            for node in reversed(order):",
  "                carry = subtotal[node]",
  "                if carry > target:",
  "                    break",
  "                if carry == target:",
  "                    groups += 1",
  "                    subtotal[node] = 0",
  "                if parent[node] != -1:",
  "                    subtotal[parent[node]] += subtotal[node]",
  "            if groups == parts:",
  "                return parts - 1",
  "        return 0",
]);

function parseComponents2440Input(input = DEFAULT_NUMS, params = {}) {
  const options = parsePlainParams(params, 2440);
  const nums = parseIntegerArray(input, { problemId: 2440, name: "nums", minLength: 1, maxLength: LIMITS.maxNodes, minValue: 1, maxValue: LIMITS.maxValue });
  const edges = parseRows(options.edges === undefined ? DEFAULT_EDGES : options.edges, {
    problemId: 2440, name: "edges", columns: 2, minRows: 0, maxRows: LIMITS.maxNodes - 1, minValue: 0, maxValue: nums.length - 1,
  });
  if (edges.length !== nums.length - 1) fail(2440, RangeError, "cây n node phải có n − 1 cạnh", "an n-node tree must have n − 1 edges");
  const roots = nums.map((_, node) => node);
  const find = node => { while (roots[node] !== node) node = roots[node]; return node; };
  for (const [a, b] of edges) {
    const x = find(a), y = find(b);
    if (x === y) fail(2440, RangeError, "edges phải là cây, không có cạnh lặp hay chu trình", "edges must form a tree without duplicate edges or cycles");
    roots[x] = y;
  }
  return { nums, edges };
}

function buildSteps2440(input, params) {
  const { nums, edges } = parseComponents2440Input(input, params);
  const state = { nums, edges }, steps = [], attempts = [];
  let stage = "graph", closedGroups = [], cuts = [], carried = [], members = [];
  let attempt = null, answer = null;
  const py = condition => condition ? "True" : "False";
  const titles = {
    init: bi("Chuẩn bị cây", "Prepare the tree"), edge: bi("Thêm cạnh", "Add an edge"),
    loop: bi("Bước lặp", "Loop step"), parent: bi("Ghi parent", "Set the parent"),
    skip: bi("Bỏ qua", "Skip"), total: bi("Tổng cả cây", "Total tree value"),
    candidate: bi("Thử số nhóm", "Try a component count"), divisible: bi("Chia đều tổng?", "Can the total split evenly?"),
    target: bi("Tổng mục tiêu mỗi nhóm", "Target sum per component"), reset: bi("Bắt đầu lượt thử mới", "Start a fresh trial"),
    node: bi("Lấy node từ lá lên", "Process toward the root"), carry: bi("Tổng đang có", "Current subtotal"),
    overflow: bi("Tổng vượt mục tiêu?", "Subtotal exceeds the target?"), reject: bi("Không được · thử ít nhóm hơn", "Failed · try fewer components"),
    equal: bi("Đã đủ một nhóm?", "Is this component complete?"), count: bi("Đếm thêm một nhóm", "Count one component"),
    close: bi("Tách nhóm · gửi lên 0", "Separate the component · pass up 0"), merge: bi("Gửi tổng lên parent", "Carry the subtotal to the parent"),
    check: bi("Đủ tất cả nhóm?", "All components complete?"), done: bi("Số cạnh cắt tối đa", "Maximum edges removed"),
  };
  function emit(line, phase, equation, extra = {}) {
    if (steps.length >= LIMITS.maxTraceSteps) throw new Error("#2440: trace exceeded its visualization bound");
    const locals = JSON.parse(JSON.stringify(state));
    const node = state.node ?? null;
    steps.push({
      title: titles[phase], note: bi("", ""), arr: [], highlight: [], mark: [], codeLines: [line], final: phase === "done",
      vars: [
        { name: "parts", value: state.parts ?? "—" },
        { name: "target", value: state.target ?? "—" },
        { name: "node", value: node ?? "—" },
        { name: "carry", value: state.carry ?? "—" },
        { name: "subtotal[node]", value: state.subtotal?.[node] ?? "—" },
        { name: "groups", value: state.groups ?? "—" },
      ],
      equalComponents2440View: {
        phase, stage, equation, condition: extra.condition ?? null, exhausted: Boolean(extra.exhausted),
        source: { line, text: SOURCE[line - 1], timing: "after" }, locals,
        nums: [...nums], edges: edges.map(edge => [...edge]),
        total: state.total ?? null, parts: state.parts ?? null, target: state.target ?? null,
        node, carry: state.carry ?? null, parent: locals.parent ?? null, order: locals.order ?? [], subtotal: locals.subtotal ?? null,
        groups: state.groups ?? null, answer,
        attempts: attempts.map(item => ({ ...item })),
        closedGroups: closedGroups.map(group => ({ ...group, members: [...group.members] })),
        cuts: cuts.map(edge => [...edge]), carried: [...carried],
        transfer: extra.transfer ? { ...extra.transfer } : null,
        edgeFocus: extra.edgeFocus ? [...extra.edgeFocus] : null,
        traceTruncated: false,
      },
    });
  }
  state.n = nums.length; emit(3, "init", `n = ${state.n}`);
  state.graph = nums.map(() => []); emit(4, "init", "graph = [ … ]");
  for (const [u, v] of edges) {
    state.u = u; state.v = v;
    emit(5, "loop", `${u} — ${v}`, { edgeFocus: [u, v] });
    state.graph[u].push(v); emit(6, "edge", `graph[${u}] ← ${v}`, { edgeFocus: [u, v] });
    state.graph[v].push(u); emit(7, "edge", `graph[${v}] ← ${u}`, { edgeFocus: [u, v] });
  }
  emit(5, "loop", "edges ✓", { exhausted: true });
  stage = "traverse";
  state.parent = nums.map(() => -2); emit(8, "init", "parent = [−2, …]");
  state.parent[0] = -1; emit(9, "parent", "parent[0] = −1");
  state.order = [0]; emit(10, "init", "order = [0]");
  for (let index = 0; index < state.order.length; index++) {
    state.node = state.order[index]; emit(11, "node", `node = ${state.node}`);
    for (const neighbor of state.graph[state.node]) {
      state.neighbor = neighbor; emit(12, "loop", `${state.node} → ${neighbor}`, { edgeFocus: [state.node, neighbor] });
      const isParent = neighbor === state.parent[state.node];
      emit(13, "parent", `neighbor == parent[node] → ${py(isParent)}`, { condition: isParent });
      if (isParent) { emit(14, "skip", "continue"); continue; }
      state.parent[neighbor] = state.node; emit(15, "parent", `parent[${neighbor}] = ${state.node}`);
      state.order.push(neighbor); emit(16, "node", `order ← ${neighbor}`);
    }
    emit(12, "loop", "neighbors ✓", { exhausted: true });
  }
  emit(11, "loop", "order ✓", { exhausted: true });
  stage = "candidate";
  state.total = nums.reduce((sum, value) => sum + value, 0); emit(17, "total", `Σ = ${state.total}`);
  const maxParts = Math.min(nums.length, Math.floor(state.total / Math.max(...nums)));
  for (let parts = maxParts; parts >= 1; parts--) {
    state.parts = parts; stage = "candidate";
    // Previous cuts were trial proposals; each new candidate starts with the original tree.
    closedGroups = []; cuts = []; carried = [];
    emit(18, "candidate", `parts = ${parts}`);
    const remainder = state.total % parts;
    if (remainder) attempts.push({ parts, target: null, remainder, status: "indivisible" });
    emit(19, "divisible", `${state.total} % ${parts} = ${remainder}`, { condition: remainder !== 0 });
    if (remainder) { emit(20, "skip", "continue"); continue; }
    state.target = state.total / parts;
    attempt = { parts, target: state.target, remainder: 0, status: "pending" }; attempts.push(attempt);
    emit(21, "target", `${state.total} = ${parts} × ${state.target}`);
    state.subtotal = [...nums]; members = nums.map((_, node) => [node]); stage = "partition"; attempt.status = "running";
    emit(22, "reset", "subtotal = nums[:]");
    state.groups = 0; emit(23, "reset", "groups = 0");
    let failed = false;
    for (const node of [...state.order].reverse()) {
      state.node = node; emit(24, "node", `node = ${node}`);
      state.carry = state.subtotal[node]; emit(25, "carry", `carry = ${state.carry}`);
      const tooLarge = state.carry > state.target;
      emit(26, "overflow", `${state.carry} > ${state.target} → ${py(tooLarge)}`, { condition: tooLarge });
      if (tooLarge) {
        failed = true; attempt.status = "failed"; emit(27, "reject", "break"); break;
      }
      const equal = state.carry === state.target;
      emit(28, "equal", `${state.carry} == ${state.target} → ${py(equal)}`, { condition: equal });
      if (equal) {
        state.groups++; emit(29, "count", `groups = ${state.groups}`);
        state.subtotal[node] = 0;
        closedGroups.push({ id: closedGroups.length, root: node, members: [...members[node]], sum: state.carry });
        members[node] = [];
        if (state.parent[node] !== -1) cuts.push([state.parent[node], node]);
        emit(30, "close", `${state.carry} = target → ✂ → 0`);
      }
      const hasParent = state.parent[node] !== -1;
      emit(31, "parent", `parent[${node}] != −1 → ${py(hasParent)}`, { condition: hasParent });
      if (hasParent) {
        const parent = state.parent[node], amount = state.subtotal[node], before = state.subtotal[parent];
        state.subtotal[parent] += amount;
        members[parent].push(...members[node]); members[node] = []; carried.push(node);
        emit(32, "merge", `${before} + ${amount} = ${state.subtotal[parent]}`, { transfer: { from: node, to: parent, amount, before, after: state.subtotal[parent] } });
      }
    }
    if (!failed) emit(24, "loop", "reversed(order) ✓", { exhausted: true });
    const success = state.groups === parts;
    if (success) attempt.status = "success";
    emit(33, "check", `${state.groups} == ${parts} → ${py(success)}`, { condition: success });
    if (success) {
      answer = parts - 1; stage = "done";
      emit(34, "done", `${parts} − 1 = ${answer}`);
      return { original: [...nums], answer, steps };
    }
  }
  throw new Error("#2440: a positive tree must admit the one-component partition");
}

module.exports = {
  2440: {
    id: 2440, slug: "create-components-with-same-value", difficulty: "hard",
    category: { key: "binary-tree", vi: "Cây nhị phân / Tree", en: "Binary Tree / Tree" },
    tags: [{ key: "tree", vi: "Cây", en: "Tree" }, { key: "dfs", vi: "DFS", en: "DFS" }, { key: "math", vi: "Toán", en: "Math" }],
    title: bi("Create Components With Same Value", "Create Components With Same Value"),
    titleVi: bi("Cắt cây thành các nhóm có tổng bằng nhau", "Split a tree into equal-sum components"),
    statement: bi("Cắt nhiều cạnh nhất để các thành phần liên thông có cùng tổng giá trị. nums[i] là giá trị node i; minh họa tối đa 32 node, mỗi giá trị 1–50.", "Remove as many edges as possible so all connected components have the same sum. nums[i] is node i's value; the visualization supports up to 32 nodes with values 1–50."),
    inputKind: "string", inputLabel: bi("nums · giá trị mỗi node", "nums · node values"), defaultInput: DEFAULT_NUMS,
    extraParams: [{ key: "edges", label: bi("edges · cạnh của cây", "edges · tree edges"), type: "string", default: DEFAULT_EDGES }],
    approach: [
      bi("Thử nhiều nhóm trước: target = tổng / parts.", "Try more components first: target = total / parts."),
      bi("Từ lá lên: đủ target → tách nhóm; chưa đủ → gửi lên parent; vượt target → thử lại.", "From the leaves: reach target → separate; below target → carry upward; exceed target → retry."),
      bi("parts nhóm cần cắt parts − 1 cạnh.", "parts components require parts − 1 removed edges."),
    ],
    complexity: { time: "O(n · d(S) + n)", space: "O(n)", note: bi("S là tổng nums; d(S) là số ước của S. Thuật toán Python dùng postorder lặp, không phụ thuộc độ sâu đệ quy.", "S is sum(nums); d(S) is its divisor count. Iterative postorder avoids recursive depth limits.") },
    code: SOURCE, debugMode: "line-by-line", visualizationLimits: LIMITS,
    builder: buildSteps2440, parseComponents2440Input,
    liveArgs: (input, params) => { const parsed = parseComponents2440Input(input, params); return [parsed.nums, parsed.edges]; },
  },
};
