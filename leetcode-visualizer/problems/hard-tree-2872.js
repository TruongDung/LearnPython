"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  parseIntegerArray,
  parseRows,
} = require("./hard-viz-shared");

const PROBLEM_ID = 2872;
const DEFAULT_EDGES = "[[0,2],[1,2],[1,3],[2,4]]";
const DEFAULT_VALUES = "[1,8,1,4,4]";
const DEFAULT_K = 6;

const LIMITS = Object.freeze({
  minNodes: 1,
  maxNodes: 96,
  minValue: 0,
  maxValue: 1_000_000_000,
  maxK: 1_000_000_000,
  maxTraceSteps: 4000,
});

const SOURCE = Object.freeze([
  "from typing import List",
  "",
  "class Solution:",
  "    def maxKDivisibleComponents(",
  "        self, n: int, edges: List[List[int]], values: List[int], k: int",
  "    ) -> int:",
  "        graph = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "",
  "        parent = [-2] * n",
  "        parent[0] = -1",
  "        order, stack = [], [0]",
  "        while stack:",
  "            node = stack.pop()",
  "            order.append(node)",
  "            for neighbor in graph[node]:",
  "                if neighbor == parent[node]:",
  "                    continue",
  "                parent[neighbor] = node",
  "                stack.append(neighbor)",
  "",
  "        contribution = [0] * n",
  "        components = 0",
  "        for node in reversed(order):",
  "            subtotal = values[node]",
  "            for neighbor in graph[node]:",
  "                if parent[neighbor] == node:",
  "                    subtotal += contribution[neighbor]",
  "            if subtotal % k == 0:",
  "                components += 1",
  "                contribution[node] = 0",
  "            else:",
  "                contribution[node] = subtotal",
  "        return components",
]);

const BFS_SOURCE = Object.freeze([
  "from collections import deque",
  "from typing import List",
  "",
  "class Solution:",
  "    def maxKDivisibleComponents(",
  "        self, n: int, edges: List[List[int]], values: List[int], k: int",
  "    ) -> int:",
  "        graph = [[] for _ in range(n)]",
  "        degree = [0] * n",
  "        for u, v in edges:",
  "            graph[u].append(v)",
  "            graph[v].append(u)",
  "            degree[u] += 1",
  "            degree[v] += 1",
  "",
  "        subtotal = values[:]",
  "        queue = deque(node for node in range(n) if degree[node] <= 1)",
  "        components = 0",
  "        while queue:",
  "            node = queue.popleft()",
  "            carry = subtotal[node]",
  "            if carry % k == 0:",
  "                components += 1",
  "                carry = 0",
  "            degree[node] = 0",
  "            for neighbor in graph[node]:",
  "                if degree[neighbor] == 0:",
  "                    continue",
  "                subtotal[neighbor] += carry",
  "                degree[neighbor] -= 1",
  "                if degree[neighbor] == 1:",
  "                    queue.append(neighbor)",
  "        return components",
]);

function undirectedKey(left, right) {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function orientTree(adjacency) {
  const n = adjacency.length;
  const parent = Array(n).fill(-2);
  const depth = Array(n).fill(-1);
  const children = Array.from({ length: n }, () => []);
  const order = [];
  const stack = [0];
  parent[0] = -1;
  depth[0] = 0;

  while (stack.length) {
    const node = stack.pop();
    order.push(node);
    const nextChildren = [];
    for (const neighbor of adjacency[node]) {
      if (neighbor === parent[node]) continue;
      if (parent[neighbor] !== -2) {
        fail(PROBLEM_ID, RangeError, "các cạnh tạo chu trình", "tree edges contain a cycle");
      }
      parent[neighbor] = node;
      depth[neighbor] = depth[node] + 1;
      children[node].push(neighbor);
      nextChildren.push(neighbor);
    }
    for (let index = nextChildren.length - 1; index >= 0; index -= 1) {
      stack.push(nextChildren[index]);
    }
  }

  if (order.length !== n) {
    fail(PROBLEM_ID, RangeError, "cây phải liên thông", "the tree must be connected");
  }

  const levels = [];
  for (const node of order) {
    if (!levels[depth[node]]) levels[depth[node]] = [];
    levels[depth[node]].push(node);
  }
  return { n, root: 0, adjacency, parent, depth, children, order, levels };
}

function parseMaximumKDivisibleComponents2872Input(input, params = {}) {
  const safeParams = parsePlainParams(params, PROBLEM_ID);
  const values = parseIntegerArray(
    safeParams.values === undefined ? DEFAULT_VALUES : safeParams.values,
    {
      problemId: PROBLEM_ID,
      name: "values",
      minLength: LIMITS.minNodes,
      maxLength: LIMITS.maxNodes,
      minValue: LIMITS.minValue,
      maxValue: LIMITS.maxValue,
    },
  );
  const n = values.length;
  const edges = parseRows(input === undefined ? DEFAULT_EDGES : input, {
    problemId: PROBLEM_ID,
    name: "edges",
    columns: 2,
    minRows: 0,
    maxRows: LIMITS.maxNodes - 1,
    minValue: Number.MIN_SAFE_INTEGER,
    maxValue: Number.MAX_SAFE_INTEGER,
  });
  const k = parseInteger(safeParams.k === undefined ? DEFAULT_K : safeParams.k, {
    problemId: PROBLEM_ID,
    name: "k",
    min: 1,
    max: LIMITS.maxK,
  });

  if (edges.length !== n - 1) {
    fail(
      PROBLEM_ID,
      RangeError,
      `cây ${n} node phải có đúng ${n - 1} cạnh`,
      `a ${n}-node tree must have exactly ${n - 1} edges`,
    );
  }

  const adjacency = Array.from({ length: n }, () => []);
  const dsuParent = Array.from({ length: n }, (_, node) => node);
  const dsuRank = Array(n).fill(0);
  const seenEdges = new Set();

  function find(node) {
    let root = node;
    while (dsuParent[root] !== root) root = dsuParent[root];
    while (dsuParent[node] !== node) {
      const next = dsuParent[node];
      dsuParent[node] = root;
      node = next;
    }
    return root;
  }

  function union(left, right) {
    let leftRoot = find(left);
    let rightRoot = find(right);
    if (leftRoot === rightRoot) return false;
    if (dsuRank[leftRoot] < dsuRank[rightRoot]) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }
    dsuParent[rightRoot] = leftRoot;
    if (dsuRank[leftRoot] === dsuRank[rightRoot]) dsuRank[leftRoot] += 1;
    return true;
  }

  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(
        PROBLEM_ID,
        RangeError,
        `cạnh [${u},${v}] có endpoint ngoài [0,${n - 1}]`,
        `edge [${u},${v}] has an endpoint outside [0,${n - 1}]`,
      );
    }
    if (u === v) {
      fail(PROBLEM_ID, RangeError, `cạnh [${u},${v}] là self-loop`, `edge [${u},${v}] is a self-loop`);
    }
    const key = undirectedKey(u, v);
    if (seenEdges.has(key)) {
      fail(PROBLEM_ID, RangeError, `cạnh [${u},${v}] bị lặp`, `edge [${u},${v}] is duplicated`);
    }
    seenEdges.add(key);
    if (!union(u, v)) {
      fail(PROBLEM_ID, RangeError, "các cạnh tạo chu trình", "tree edges contain a cycle");
    }
    adjacency[u].push(v);
    adjacency[v].push(u);
  }

  adjacency.forEach((neighbors) => neighbors.sort((left, right) => left - right));
  const root = find(0);
  for (let node = 1; node < n; node += 1) {
    if (find(node) !== root) {
      fail(PROBLEM_ID, RangeError, "cây phải liên thông", "the tree must be connected");
    }
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isSafeInteger(total)) {
    fail(PROBLEM_ID, RangeError, "tổng values vượt số nguyên an toàn", "the values total exceeds the safe-integer range");
  }
  if (total % k !== 0) {
    fail(
      PROBLEM_ID,
      RangeError,
      `tổng values = ${total} không chia hết cho k = ${k}`,
      `the values total ${total} is not divisible by k = ${k}`,
    );
  }

  return {
    n,
    edges: edges.map((edge) => [...edge]),
    values: [...values],
    k,
    total,
    tree: orientTree(adjacency),
  };
}

function collectFinalComponents(tree, values, cutEdges) {
  const visited = Array(tree.n).fill(false);
  const components = [];

  for (let start = 0; start < tree.n; start += 1) {
    if (visited[start]) continue;
    const members = [];
    const stack = [start];
    visited[start] = true;
    let sum = 0;

    while (stack.length) {
      const node = stack.pop();
      members.push(node);
      sum += values[node];
      for (const neighbor of tree.adjacency[node]) {
        if (visited[neighbor] || cutEdges.has(undirectedKey(node, neighbor))) continue;
        visited[neighbor] = true;
        stack.push(neighbor);
      }
    }

    members.sort((left, right) => left - right);
    let root = members[0];
    for (const node of members) {
      if (tree.depth[node] < tree.depth[root]) root = node;
    }
    components.push({ root, members, sum });
  }

  components.sort((left, right) => left.root - right.root);
  return components;
}

function buildSteps2872(input, params = {}) {
  const parsed = parseMaximumKDivisibleComponents2872Input(input, params);
  const { n, edges, values, k, total, tree } = parsed;
  const steps = [];
  const locals = { n, edges: edges.map(edge => [...edge]), values: [...values], k };
  const sums = Array(n).fill(null);
  const processed = new Set();
  const completed = [];
  const cutRecords = [];
  const cutEdges = new Set();
  let previousVars = watches(locals);

  function snapshotLocals() {
    return Object.fromEntries(Object.entries(locals).map(([name, value]) => [
      name, Array.isArray(value) ? value.map(item => Array.isArray(item) ? [...item] : item) : value,
    ]));
  }

  function watches(state) {
    return [
      { name: "node", value: state.node ?? "—" },
      { name: "k", value: k },
      { name: "subtotal", value: state.subtotal ?? "—" },
      { name: "subtotal % k", value: state.subtotal === undefined ? "—" : state.subtotal % k },
      { name: "contribution[node]", value: state.contribution?.[state.node] ?? "—" },
      { name: "components", value: state.components ?? "—" },
    ];
  }

  function emit(line, detail = {}) {
    if (steps.length >= LIMITS.maxTraceSteps) throw new Error("#2872: full line trace exceeded its bound");
    const stage = line <= 10 ? "graph" : line <= 22 ? "dfs" : line === 36 ? "done" : "postorder";
    const phase = detail.phase || (stage === "graph" ? "graph" : stage === "dfs" ? "dfs" : stage === "done" ? "done" : "inspect");
    const state = snapshotLocals();
    let activeNode = stage === "graph" ? state.u ?? null
      : stage === "dfs" ? state.node ?? (line === 13 ? 0 : null)
        : line >= 26 && line < 36 ? state.node ?? null : null;
    if (line === 26 && detail.exhausted) activeNode = null;
    const cursor = {};
    let edgeFocus = null;
    if ([8, 9, 10].includes(line) && state.u !== undefined && !detail.exhausted) {
      cursor.u = state.u; cursor.v = state.v;
      edgeFocus = [state.u, state.v];
    } else if ([18, 19, 20, 21, 22, 28, 29, 30].includes(line) && state.neighbor !== undefined && !detail.exhausted) {
      cursor.neighbor = state.neighbor;
      cursor["parent[neighbor]"] = state.parent[state.neighbor];
      if (line >= 28) cursor["contribution[neighbor]"] = state.contribution[state.neighbor];
      edgeFocus = [state.node, state.neighbor];
    }
    const pieces = new Map(collectFinalComponents(tree, values, cutEdges).map(piece => [piece.root, piece]));
    const closedGroups = completed.map((component, id) => ({
      id, ...component, members: [...pieces.get(component.root).members],
    }));
    const vars = watches(state);
    const labels = {
      graph: bi("Dựng cạnh", "Build edges"), dfs: bi("Duyệt DFS", "Traverse with DFS"),
      inspect: bi("Duyệt cây từ dưới lên", "Process the tree bottom-up"),
      merge: bi("Cộng contribution", "Add the contribution"),
      check: bi("Kiểm tra chia hết", "Check divisibility"),
      count: bi("Tăng components", "Increment components"),
      cut: bi("Cắt cạnh, gửi 0", "Cut the edge and send 0"),
      close: bi("Khép nhóm gốc", "Complete the root component"),
      carry: bi("Lưu tổng gửi lên cha", "Save the parent contribution"),
      done: bi("Trả kết quả", "Return the result"),
    };
    const label = labels[phase];
    steps.push({
      title: bi("Dòng " + line + " · " + label.vi, "Line " + line + " · " + label.en),
      note: bi("", ""), arr: [...values], sub: values.map(() => ""),
      highlight: activeNode === null ? [] : [activeNode], mark: [...processed],
      codeLines: [line], vars, final: line === 36,
      kDivisible2872View: {
        n, k, stage, phase, activeNode,
        source: { line, text: SOURCE[line - 1], timing: "after" },
        locals: state, beforeVars: previousVars,
        condition: typeof detail.condition === "boolean" ? detail.condition : null,
        exhausted: Boolean(detail.exhausted), nextLine: null, nextSource: null,
        cursor, edgeFocus, graph: state.graph,
        stack: state.stack ?? null, order: state.order ?? null,
        components: state.components ?? 0,
        values: [...values], edges: edges.map(edge => [...edge]),
        parent: [...tree.parent], children: tree.children.map(children => [...children]),
        traversalParent: state.parent ?? null,
        postorder: state.order ? [...state.order].reverse() : [],
        processed: [...processed], subtotal: [...sums],
        activeSum: activeNode === null ? null : sums[activeNode],
        remainder: sums.map(sum => sum === null ? null : sum % k),
        contribution: state.contribution ? [...state.contribution] : Array(n).fill(null),
        cuts: cutRecords.map(cut => ({ ...cut })), closedGroups,
        transfer: detail.transfer || null, traceTruncated: false,
      },
    });
    previousVars = vars.map(variable => ({ ...variable }));
  }

  // Each emit follows one executed Python line, including loop exhaustion.
  locals.graph = Array.from({ length: n }, () => []);
  emit(7);
  for (const [u, v] of edges) {
    locals.u = u; locals.v = v; emit(8, { condition: true });
    locals.graph[u].push(v); emit(9);
    locals.graph[v].push(u); emit(10);
  }
  emit(8, { condition: false, exhausted: true });
  locals.parent = Array(n).fill(-2); emit(12);
  locals.parent[0] = -1; emit(13);
  locals.order = []; locals.stack = [0]; emit(14);
  while (true) {
    const more = locals.stack.length > 0;
    emit(15, { condition: more });
    if (!more) break;
    locals.node = locals.stack.pop(); emit(16);
    locals.order.push(locals.node); emit(17);
    for (const neighbor of locals.graph[locals.node]) {
      locals.neighbor = neighbor; emit(18, { condition: true });
      const isParent = neighbor === locals.parent[locals.node];
      emit(19, { condition: isParent });
      if (isParent) { emit(20); continue; }
      locals.parent[neighbor] = locals.node; emit(21);
      locals.stack.push(neighbor); emit(22);
    }
    emit(18, { condition: false, exhausted: true });
  }

  locals.contribution = Array(n).fill(0); emit(24);
  locals.components = 0; emit(25);
  for (const node of [...locals.order].reverse()) {
    locals.node = node; emit(26, { condition: true });
    locals.subtotal = values[node]; sums[node] = locals.subtotal; emit(27);
    for (const neighbor of locals.graph[node]) {
      locals.neighbor = neighbor; emit(28, { condition: true });
      const isChild = locals.parent[neighbor] === node;
      emit(29, { condition: isChild });
      if (isChild) {
        const before = locals.subtotal;
        locals.subtotal += locals.contribution[neighbor];
        sums[node] = locals.subtotal;
        emit(30, { phase: "merge", transfer: { from: neighbor, to: node, amount: locals.contribution[neighbor], before, after: locals.subtotal } });
      }
    }
    emit(28, { condition: false, exhausted: true });
    const divisible = locals.subtotal % k === 0;
    emit(31, { phase: "check", condition: divisible });
    if (divisible) {
      locals.components++; emit(32, { phase: "count" });
      locals.contribution[node] = 0;
      processed.add(node); completed.push({ root: node, sum: locals.subtotal });
      const parent = locals.parent[node];
      if (parent !== -1) {
        cutEdges.add(undirectedKey(parent, node));
        cutRecords.push({ parent, child: node, sum: locals.subtotal });
      }
      emit(33, { phase: parent === -1 ? "close" : "cut" });
    } else {
      locals.contribution[node] = locals.subtotal;
      processed.add(node);
      emit(35, { phase: "carry" });
    }
  }
  emit(26, { condition: false, exhausted: true });

  const finalComponents = collectFinalComponents(tree, values, cutEdges);
  if (locals.contribution[0] !== 0 || cutEdges.size !== locals.components - 1
    || finalComponents.length !== locals.components
    || finalComponents.some(component => component.sum % k !== 0)
    || finalComponents.reduce((sum, component) => sum + component.sum, 0) !== total) {
    throw new Error("#2872: reconstructed components violate the divisibility invariant");
  }
  emit(36, { phase: "done" });
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.kDivisible2872View.nextLine = nextLine;
    step.kDivisible2872View.nextSource = nextLine === null ? null : SOURCE[nextLine - 1];
  });
  return {
    original: { n, edges: edges.map(edge => [...edge]), values: [...values], k },
    answer: locals.components, steps,
  };
}

function buildBfsSteps2872(input, params = {}) {
  const { n, edges, values, k, total, tree } = parseMaximumKDivisibleComponents2872Input(input, params);
  const steps = [];
  const locals = { n, edges: edges.map(edge => [...edge]), values: [...values], k };
  const removed = new Set(), cutEdges = new Set(), cuts = [], completed = [];
  const contribution = Array(n).fill(null);
  let previousVars = watches(locals);

  function watches(state) {
    return [
      { name: "node", value: state.node ?? "—" },
      { name: "k", value: k },
      { name: "subtotal[node]", value: state.subtotal?.[state.node] ?? "—" },
      { name: "carry", value: state.carry ?? "—" },
      { name: "degree[node]", value: state.degree?.[state.node] ?? "—" },
      { name: "components", value: state.components ?? "—" },
    ];
  }

  function emit(line, detail = {}) {
    if (steps.length >= LIMITS.maxTraceSteps) throw new Error("#2872: full BFS line trace exceeded its bound");
    const state = Object.fromEntries(Object.entries(locals).map(([name, value]) => [
      name, Array.isArray(value) ? value.map(item => Array.isArray(item) ? [...item] : item) : value,
    ]));
    const stage = line <= 14 ? "graph" : line === 33 ? "done" : "bfs";
    const activeNode = stage === "graph" ? state.u ?? null : stage === "done" ? null : state.node ?? null;
    const phase = detail.phase || (stage === "graph" ? "graph" : stage === "done" ? "done" : "inspect");
    const cursor = {};
    let edgeFocus = null;
    if (line >= 10 && line <= 14 && state.u !== undefined && !detail.exhausted) {
      cursor.u = state.u; cursor.v = state.v; edgeFocus = [state.u, state.v];
    } else if (line >= 26 && line <= 32 && state.neighbor !== undefined && !detail.exhausted) {
      cursor.neighbor = state.neighbor;
      cursor["degree[neighbor]"] = state.degree[state.neighbor];
      cursor["subtotal[neighbor]"] = state.subtotal[state.neighbor];
      edgeFocus = [state.node, state.neighbor];
    }
    const pieces = collectFinalComponents(tree, values, cutEdges);
    const closedGroups = completed.map((component, id) => ({
      id, ...component, members: [...pieces.find(piece => piece.members.includes(component.root)).members],
    }));
    const labels = {
      graph: bi("Dựng cây và bậc", "Build the tree and degrees"),
      inspect: bi("BFS · xử lý lá", "BFS · process a leaf"),
      queue: bi("Đưa các lá vào queue", "Queue the leaves"),
      pop: bi("Lấy đầu queue", "Pop the queue front"),
      check: bi("Kiểm tra chia hết", "Check divisibility"),
      count: bi("Tăng components", "Increment components"),
      cut: bi("Tách nhóm, gửi 0", "Separate a component and send 0"),
      close: bi("Khép nhóm cuối", "Complete the last component"),
      remove: bi("Gỡ lá khỏi cây", "Remove the leaf"),
      merge: bi("Cộng carry sang nút kề", "Add carry to the neighbor"),
      degree: bi("Giảm bậc nút kề", "Decrease the neighbor's degree"),
      enqueue: bi("Thêm lá mới vào cuối queue", "Append the new leaf to the queue"),
      done: bi("Trả kết quả BFS", "Return the BFS result"),
    };
    const vars = watches(state), label = labels[phase];
    steps.push({
      title: bi(`Dòng ${line} · ${label.vi}`, `Line ${line} · ${label.en}`),
      note: bi("", ""), arr: [...values], sub: values.map(() => ""),
      highlight: activeNode === null ? [] : [activeNode], mark: [...removed],
      codeLines: [line], codeBlock: 2, vars, final: line === 33,
      kDivisible2872View: {
        n, k, algorithm: "bfs", stage, phase, activeNode,
        source: { line, text: BFS_SOURCE[line - 1], timing: "after" },
        locals: state, beforeVars: previousVars,
        condition: typeof detail.condition === "boolean" ? detail.condition : null,
        exhausted: Boolean(detail.exhausted), nextLine: null, nextSource: null,
        cursor, edgeFocus, graph: state.graph, queue: state.queue ?? null, degree: state.degree ?? null,
        arrayChanges: detail.arrayChanges || {},
        components: state.components ?? 0,
        values: [...values], edges: edges.map(edge => [...edge]),
        parent: [...tree.parent], children: tree.children.map(children => [...children]),
        processed: [...removed], subtotal: state.subtotal ?? Array(n).fill(null),
        activeSum: activeNode === null ? null : state.subtotal?.[activeNode] ?? null,
        contribution: [...contribution], cuts: cuts.map(cut => ({ ...cut })), closedGroups,
        transfer: detail.transfer || null, traceTruncated: false,
      },
    });
    previousVars = vars.map(variable => ({ ...variable }));
  }

  locals.graph = Array.from({ length: n }, () => []); emit(8);
  locals.degree = Array(n).fill(0); emit(9);
  for (const [u, v] of edges) {
    locals.u = u; locals.v = v; emit(10, { condition: true });
    locals.graph[u].push(v); emit(11, { arrayChanges: { graph: u } });
    locals.graph[v].push(u); emit(12, { arrayChanges: { graph: v } });
    locals.degree[u]++; emit(13, { arrayChanges: { degree: u } });
    locals.degree[v]++; emit(14, { arrayChanges: { degree: v } });
  }
  emit(10, { condition: false, exhausted: true });
  locals.subtotal = [...values]; emit(16);
  locals.queue = values.flatMap((_, node) => locals.degree[node] <= 1 ? [node] : []); emit(17, { phase: "queue" });
  locals.components = 0; emit(18);
  while (true) {
    const more = locals.queue.length > 0;
    emit(19, { condition: more });
    if (!more) break;
    locals.node = locals.queue.shift(); emit(20, { phase: "pop" });
    const node = locals.node;
    locals.carry = locals.subtotal[node]; contribution[node] = locals.carry; emit(21);
    const divisible = locals.carry % k === 0;
    emit(22, { phase: "check", condition: divisible });
    if (divisible) {
      locals.components++; emit(23, { phase: "count" });
      locals.carry = 0; contribution[node] = 0;
      const neighbor = locals.graph[node].find(other => locals.degree[other] > 0);
      if (neighbor !== undefined) {
        cutEdges.add(undirectedKey(node, neighbor));
        cuts.push({ parent: neighbor, child: node, sum: locals.subtotal[node] });
      }
      completed.push({ root: node, sum: locals.subtotal[node] });
      emit(24, { phase: neighbor === undefined ? "close" : "cut" });
    }
    locals.degree[node] = 0; removed.add(node); emit(25, { phase: "remove", arrayChanges: { degree: node } });
    for (const neighbor of locals.graph[node]) {
      locals.neighbor = neighbor; emit(26, { condition: true });
      const gone = locals.degree[neighbor] === 0;
      emit(27, { condition: gone });
      if (gone) { emit(28); continue; }
      const before = locals.subtotal[neighbor];
      locals.subtotal[neighbor] += locals.carry;
      emit(29, { phase: "merge", arrayChanges: { subtotal: neighbor }, transfer: { from: node, to: neighbor, amount: locals.carry, before, after: locals.subtotal[neighbor] } });
      locals.degree[neighbor]--; emit(30, { phase: "degree", arrayChanges: { degree: neighbor } });
      const leaf = locals.degree[neighbor] === 1;
      emit(31, { condition: leaf });
      if (leaf) { locals.queue.push(neighbor); emit(32, { phase: "enqueue" }); }
    }
    emit(26, { condition: false, exhausted: true });
  }
  const finalComponents = collectFinalComponents(tree, values, cutEdges);
  if (removed.size !== n || cutEdges.size !== locals.components - 1
    || finalComponents.length !== locals.components || finalComponents.some(component => component.sum % k !== 0)
    || finalComponents.reduce((sum, component) => sum + component.sum, 0) !== total) {
    throw new Error("#2872: BFS components violate the divisibility invariant");
  }
  emit(33);
  steps.forEach((step, index) => {
    const nextLine = steps[index + 1]?.codeLines[0] ?? null;
    step.kDivisible2872View.nextLine = nextLine;
    step.kDivisible2872View.nextSource = nextLine === null ? null : BFS_SOURCE[nextLine - 1];
  });
  return { original: { n, edges: edges.map(edge => [...edge]), values: [...values], k }, answer: locals.components, steps };
}

module.exports = {
  2872: {
    id: 2872,
    difficulty: "hard",
    slug: "maximum-number-of-k-divisible-components",
    category: { key: "binary-tree", vi: "Cây tổng quát", en: "General Tree" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "bfs", vi: "BFS", en: "BFS" },
      { key: "postorder", vi: "Hậu tự", en: "Postorder" },
      { key: "greedy", vi: "Tham lam", en: "Greedy" },
    ],
    title: bi(
      "Số component chia hết cho k lớn nhất",
      "Maximum Number of K-Divisible Components",
    ),
    titleVi: bi(
      "Cộng từ lá · chia hết thì cắt",
      "Accumulate from leaves · cut divisible totals",
    ),
    statement: bi(
      "Cho cây vô hướng n node, values[u] tại mỗi node và số dương k. Cắt một số cạnh để tối đa hóa số component sao cho tổng values trong mọi component đều chia hết cho k.",
      "Given an undirected n-node tree, a value at each node, and positive k, remove edges to maximize the number of components whose value sums are all divisible by k.",
    ),
    defaultInput: DEFAULT_EDGES,
    defaults: { input: DEFAULT_EDGES, values: DEFAULT_VALUES, k: DEFAULT_K, approach: "1" },
    inputKind: "string",
    inputLabel: bi(
      "edges [u,v] (JSON hoặc u,v;u,v)",
      "edges [u,v] (JSON or u,v;u,v)",
    ),
    extraParams: [
      {
        key: "approach", type: "select", default: "1", label: bi("Cách giải", "Approach"),
        options: [
          { value: "1", label: bi("Cách 1 · DFS hậu tự", "Approach 1 · Postorder DFS") },
          { value: "2", label: bi("Cách 2 · BFS tỉa lá", "Approach 2 · BFS leaf pruning") },
        ],
      },
      {
        key: "values",
        type: "string",
        default: DEFAULT_VALUES,
        label: bi("values theo node", "values by node"),
      },
      {
        key: "k",
        type: "number",
        min: 1,
        max: LIMITS.maxK,
        default: DEFAULT_K,
        label: bi("k (ước số dương)", "k (positive divisor)"),
      },
    ],
    visualizationLimits: { ...LIMITS },
    approach: [
      bi(
        "DFS: duyệt hậu tự, cộng giá trị riêng và phần các con gửi lên.",
        "DFS: process in postorder, adding each node's value and its children's contributions.",
      ),
      bi(
        "Tổng chia hết cho k → tách nhóm, gửi 0. Còn dư → gửi tổng sang nút kề chưa xử lý.",
        "A divisible total forms a component and sends 0. Otherwise, pass the total to the unprocessed neighbor.",
      ),
      bi(
        "BFS: đưa các lá vào queue. Gỡ từng lá, chuyển carry sang nút kề; bậc còn 1 thì thêm lá mới vào queue.",
        "BFS: queue the leaves. Remove each leaf and pass its contribution to its neighbor; enqueue a neighbor when its degree becomes 1.",
      ),
    ],
    complexity: {
      time: "O(n)",
      space: "O(n)",
      note: bi(
        "Mỗi node và cạnh được xử lý số lần hằng số. Debug từng dòng giữ đủ mọi bước, kể cả điều kiện và lần kết thúc vòng lặp.",
        "Each node and edge is processed a constant number of times. Line-by-line debugging retains every step, including conditions and loop exhaustion.",
      ),
    },
    codeLabel: bi("Cách 1 · DFS hậu tự", "Approach 1 · Postorder DFS"),
    code2Label: bi("Cách 2 · BFS tỉa lá", "Approach 2 · BFS leaf pruning"),
    code: SOURCE,
    code2: BFS_SOURCE,
    debugMode: "line-by-line",
    parser: parseMaximumKDivisibleComponents2872Input,
    parseMaximumKDivisibleComponents2872Input,
    liveArgs(input, params = {}) {
      const parsed = parseMaximumKDivisibleComponents2872Input(input, params);
      return [
        parsed.n,
        parsed.edges.map((edge) => [...edge]),
        [...parsed.values],
        parsed.k,
      ];
    },
    builder(input, params = {}) {
      return Number(params.approach) === 2 ? buildBfsSteps2872(input, params) : buildSteps2872(input, params);
    },
  },
};
