"use strict";

// Visualization for LeetCode 2421 — Number of Good Paths.
//
// Thuật toán: sắp xếp các node theo vals tăng dần, rồi kích hoạt từng nhóm
// cùng giá trị. Mỗi node khi kích hoạt sẽ union với các láng giềng đã kích
// hoạt (chúng đều có giá trị <= giá trị hiện tại). Trong một nhóm giá trị,
// mỗi component chứa k node của nhóm đóng góp k*(k-1)/2 đường tốt mới
// (cộng n đường đơn ban đầu).

const {
  DSU,
  bi,
  createTracer,
  fail,
  parseIntegerArray,
  parsePlainParams,
} = require("./hard-viz-shared");

const DEFAULT_VALS_2421 = Object.freeze([1, 3, 2, 1, 3]);
const DEFAULT_EDGES_2421 = Object.freeze([[0, 1], [0, 2], [2, 3], [2, 4]]);
const EXPECTED_2421 = 6;

const LIMITS_2421 = Object.freeze({
  maxNodes: 120,
  maxValue: 1_000_000_000,
  maxTraceSteps: 260,
  maxGraphNodes: 40,
  maxGraphEdges: 60,
  maxGroupRows: 16,
  maxComponentGroups: 10,
  maxMembersPerComponent: 10,
  maxEventHistory: 16,
  maxSequenceItems: 64,
});

const PHASES_2421 = Object.freeze([
  bi("Dựng cây và sắp xếp theo giá trị", "Build the tree and sort by value"),
  bi("Kích hoạt node cùng giá trị", "Activate equal-value nodes"),
  bi("Gộp với láng giềng đã kích hoạt", "Union with activated neighbors"),
  bi("Đếm đường tốt trong nhóm", "Count good paths in the group"),
  bi("Kết quả", "Result"),
]);

const SOURCE_2421 = Object.freeze([
  "from collections import defaultdict",
  "from typing import List",
  "",
  "class Solution:",
  "    def numberOfGoodPaths(",
  "        self, vals: List[int], edges: List[List[int]]",
  "    ) -> int:",
  "        n = len(vals)",
  "",
  "        adj = [[] for _ in range(n)]",
  "        for u, v in edges:",
  "            adj[u].append(v)",
  "            adj[v].append(u)",
  "",
  "        parent = list(range(n))",
  "        size = [1] * n",
  "        active = [False] * n",
  "",
  "        def find(x):",
  "            while parent[x] != x:",
  "                parent[x] = parent[parent[x]]",
  "                x = parent[x]",
  "            return x",
  "",
  "        def union(a, b):",
  "            ra, rb = find(a), find(b)",
  "",
  "            if ra == rb:",
  "                return",
  "",
  "            if size[ra] < size[rb]:",
  "                ra, rb = rb, ra",
  "",
  "            parent[rb] = ra",
  "            size[ra] += size[rb]",
  "",
  "        order = sorted(range(n), key=lambda i: vals[i])",
  "",
  "        answer = n",
  "        i = 0",
  "",
  "        while i < n:",
  "            j = i",
  "",
  "            # Activate nodes with the same value",
  "            while j < n and vals[order[j]] == vals[order[i]]:",
  "                node = order[j]",
  "                active[node] = True",
  "",
  "                for nb in adj[node]:",
  "                    if active[nb]:",
  "                        union(node, nb)",
  "",
  "                j += 1",
  "",
  "            # Count nodes per connected component",
  "            groups = defaultdict(int)",
  "",
  "            for k in range(i, j):",
  "                root = find(order[k])",
  "                groups[root] += 1",
  "",
  "            # Count good paths",
  "            for cnt in groups.values():",
  "                answer += cnt * (cnt - 1) // 2",
  "",
  "            i = j",
  "",
  "        return answer",
]);

function parseEdgeEndpoint(value, edgeIndex, position, n) {
  if (!Number.isSafeInteger(value) || value < 0 || value >= n) {
    fail(
      2421,
      RangeError,
      `edges[${edgeIndex}][${position}] phải là node 0..${n - 1}`,
      `edges[${edgeIndex}][${position}] must be a node in 0..${n - 1}`,
    );
  }
  return value;
}

function parseNumberOfGoodPaths2421Input(input, params = {}) {
  const safeParams = parsePlainParams(params, 2421);
  let rawVals = input;
  let rawEdges = Object.prototype.hasOwnProperty.call(safeParams, "edges")
    ? safeParams.edges
    : JSON.stringify(DEFAULT_EDGES_2421);

  if (input !== null && typeof input === "object" && !Array.isArray(input)) {
    const objectInput = parsePlainParams(input, 2421);
    if (!Object.prototype.hasOwnProperty.call(objectInput, "vals")) {
      fail(2421, TypeError, "input object phải có vals", "an input object must contain vals");
    }
    rawVals = objectInput.vals;
    if (Object.prototype.hasOwnProperty.call(objectInput, "edges")) {
      rawEdges = objectInput.edges;
    }
  }

  const vals = parseIntegerArray(rawVals, {
    problemId: 2421,
    name: "vals",
    minLength: 1,
    maxLength: LIMITS_2421.maxNodes,
    minValue: 1,
    maxValue: LIMITS_2421.maxValue,
  });
  const n = vals.length;

  let decodedEdges = rawEdges;
  if (typeof decodedEdges === "string") {
    const text = decodedEdges.trim();
    try {
      decodedEdges = text ? JSON.parse(text) : [];
    } catch (_error) {
      fail(2421, TypeError, "edges không phải JSON hợp lệ", "edges is not valid JSON");
    }
  }
  if (!Array.isArray(decodedEdges)) {
    fail(2421, TypeError, "edges phải là mảng các cặp [u, v]", "edges must be an array of [u, v] pairs");
  }
  if (decodedEdges.length !== Math.max(0, n - 1)) {
    fail(
      2421,
      RangeError,
      `cây ${n} node cần đúng ${Math.max(0, n - 1)} cạnh, nhận ${decodedEdges.length}`,
      `a tree with ${n} nodes needs exactly ${Math.max(0, n - 1)} edges, got ${decodedEdges.length}`,
    );
  }
  const edges = decodedEdges.map((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      fail(2421, TypeError, `edges[${index}] phải là cặp [u, v]`, `edges[${index}] must be a [u, v] pair`);
    }
    const u = parseEdgeEndpoint(pair[0], index, 0, n);
    const v = parseEdgeEndpoint(pair[1], index, 1, n);
    if (u === v) {
      fail(2421, RangeError, `edges[${index}] là khuyên (u == v)`, `edges[${index}] is a self-loop`);
    }
    return [u, v];
  });

  // edges phải liên thông (tạo thành một cây)
  const link = new DSU(n);
  for (const [u, v] of edges) link.union(u, v);
  const root = link.find(0);
  for (let node = 1; node < n; node += 1) {
    if (link.find(node) !== root) {
      fail(2421, RangeError, "edges không liên thông, không phải một cây", "edges are disconnected, not a tree");
    }
  }

  return { vals: [...vals], edges: edges.map((pair) => [...pair]) };
}

function boundedIndices2421(length, anchors, limit) {
  const selected = new Set();
  const add = (index) => {
    if (selected.size >= limit || !Number.isSafeInteger(index) || index < 0 || index >= length) return;
    selected.add(index);
  };
  anchors.forEach(add);
  const pivot = anchors.find((index) => Number.isSafeInteger(index) && index >= 0 && index < length) ?? 0;
  for (let distance = 1; selected.size < limit && (pivot - distance >= 0 || pivot + distance < length); distance += 1) {
    add(pivot - distance);
    add(pivot + distance);
  }
  for (let index = 0; selected.size < limit && index < length; index += 1) add(index);
  return [...selected].sort((left, right) => left - right);
}

function components2421(dsu, active) {
  const byRoot = new Map();
  for (let index = 0; index < active.length; index += 1) {
    if (!active[index]) continue;
    const root = dsu.find(index);
    if (!byRoot.has(root)) byRoot.set(root, { root, members: [] });
    byRoot.get(root).members.push(index);
  }
  return [...byRoot.values()].sort((left, right) => left.members[0] - right.members[0]);
}

// Oracle độc lập: liệt kê mọi cặp (a, b) cùng giá trị và kiểm tra
// max trên đường đi duy nhất trong cây có bằng giá trị đó không.
function bruteGoodPaths2421(vals, adj) {
  const n = vals.length;
  const parent = Array(n).fill(-1);
  const depth = Array(n).fill(0);
  parent[0] = 0;
  const stack = [0];
  while (stack.length) {
    const node = stack.pop();
    for (const next of adj[node]) {
      if (parent[next] === -1) {
        parent[next] = node;
        depth[next] = depth[node] + 1;
        stack.push(next);
      }
    }
  }
  const pathMax = (a, b) => {
    let maximum = 0;
    let x = a;
    let y = b;
    while (depth[x] > depth[y]) { maximum = Math.max(maximum, vals[x]); x = parent[x]; }
    while (depth[y] > depth[x]) { maximum = Math.max(maximum, vals[y]); y = parent[y]; }
    while (x !== y) { maximum = Math.max(maximum, vals[x], vals[y]); x = parent[x]; y = parent[y]; }
    return Math.max(maximum, vals[x]);
  };
  let total = n;
  for (let a = 0; a < n; a += 1) {
    for (let b = a + 1; b < n; b += 1) {
      if (vals[a] === vals[b] && pathMax(a, b) === vals[a]) total += 1;
    }
  }
  return total;
}

function buildSteps2421(input, params = {}) {
  const { vals, edges } = parseNumberOfGoodPaths2421Input(input, params);
  const n = vals.length;
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  adj.forEach((neighbors) => neighbors.sort((a, b) => a - b));
  const order = Array.from({ length: n }, (_, index) => index)
    .sort((a, b) => vals[a] - vals[b] || a - b);

  // Độ sâu BFS từ node 0 để vẽ state graph theo layout cây (gọn, không tràn).
  const depthOf = (() => {
    const depth = new Array(n).fill(-1);
    depth[0] = 0;
    const queue = [0];
    while (queue.length) {
      const u = queue.shift();
      for (const w of adj[u]) {
        if (depth[w] === -1) { depth[w] = depth[u] + 1; queue.push(w); }
      }
    }
    return depth;
  })();

  const dsu = new DSU(n, null, false);
  const active = new Array(n).fill(false);
  const eventHistory = [];
  const groupsDone = [];
  let answer = n;
  let activeCount = 0;
  let currentGroupValue = null;
  let currentGroupNodes = [];
  let currentNode = null;
  let currentNeighbor = null;
  let currentUnionEdge = null;
  let activeTransition = null;

  const tracer = createTracer({
    problemId: 2421,
    source: SOURCE_2421,
    phases: PHASES_2421,
    maxSteps: LIMITS_2421.maxTraceSteps,
    baseArray: vals,
    legend: [
      { label: bi("Node đang xét", "Current node"), state: "active" },
      { label: bi("Láng giềng sắp gộp", "Neighbor to union"), state: "candidate" },
      { label: bi("Vừa gộp", "Just united"), state: "updated" },
      { label: bi("Đã kích hoạt", "Activated"), state: "success" },
      { label: bi("Chưa kích hoạt", "Inactive"), state: "idle" },
    ],
  });

  function rememberEvent(label, value, state) {
    eventHistory.push({ label, value, state });
    if (eventHistory.length > LIMITS_2421.maxEventHistory) eventHistory.shift();
  }

  function nodeState(index) {
    if (!active[index]) return "idle";
    if (index === currentNeighbor) return "candidate";
    if (index === currentNode) return "active";
    if (currentGroupNodes.includes(index)) return "active";
    return "success";
  }

  function stateGraph() {
    const visible = boundedIndices2421(n, [currentNode, currentNeighbor, 0, n - 1], LIMITS_2421.maxGraphNodes);
    const visibleSet = new Set(visible);
    const shownEdges = edges.filter(([u, v]) => visibleSet.has(u) && visibleSet.has(v))
      .slice(0, LIMITS_2421.maxGraphEdges);
    const maxDepth = Math.max(...visible.map((index) => depthOf[index]));
    const levels = [];
    for (let d = 0; d <= maxDepth; d += 1) {
      const level = visible.filter((index) => depthOf[index] === d);
      if (level.length) levels.push(level);
    }
    return {
      layout: "tree",
      levels,
      nodes: visible.map((index) => ({
        id: index,
        label: String(index),
        sub: active[index]
          ? `v=${vals[index]} · root=${dsu.find(index)}`
          : `v=${vals[index]}`,
        state: nodeState(index),
      })),
      edges: shownEdges.map(([u, v]) => {
        const isCurrentUnion = currentUnionEdge
          && ((currentUnionEdge[0] === u && currentUnionEdge[1] === v)
            || (currentUnionEdge[0] === v && currentUnionEdge[1] === u));
        const united = active[u] && active[v] && dsu.find(u) === dsu.find(v);
        return {
          u,
          v,
          directed: false,
          label: united ? "united" : "tree edge",
          state: isCurrentUnion ? "active" : united ? "computed" : "muted",
        };
      }),
    };
  }

  function groupTable() {
    const rows = groupsDone.slice(-LIMITS_2421.maxGroupRows).map((group) => ({
      label: `v=${group.value}`,
      state: "computed",
      cells: [
        group.value,
        { value: group.nodes.join(", "), state: "info" },
        { value: group.components, state: "computed" },
        { value: `+${group.added}`, state: group.added > 0 ? "updated" : "muted" },
      ],
    }));
    if (currentGroupValue !== null && !groupsDone.some((group) => group.value === currentGroupValue && group.nodes.length === currentGroupNodes.length)) {
      rows.push({
        label: `v=${currentGroupValue}`,
        state: "active",
        cells: [
          currentGroupValue,
          { value: currentGroupNodes.join(", "), state: "active" },
          { value: "…", state: "pending" },
          { value: "…", state: "pending" },
        ],
      });
    }
    return {
      title: bi("Các nhóm giá trị đã xử lý", "Processed value groups"),
      columns: [
        bi("Giá trị", "Value"),
        bi("Node", "Nodes"),
        bi("Số component", "Components"),
        bi("Đường tốt cộng thêm", "Good paths added"),
      ],
      rows,
    };
  }

  function componentGroupsView(snapshot) {
    const groups = [
      {
        title: bi("Trạng thái hiện tại", "Current transition"),
        items: activeTransition
          ? [
            { label: bi("Loại", "Kind"), value: activeTransition.kind, state: "active" },
            { label: bi("Chi tiết", "Detail"), value: activeTransition.detail, state: "candidate" },
            { label: bi("Đáp án", "Answer"), value: answer, state: "success" },
          ]
          : [{ label: bi("Chưa bắt đầu", "Not started"), value: "—", state: "pending" }],
      },
    ];
    snapshot.slice(0, LIMITS_2421.maxComponentGroups).forEach((component) => {
      const shown = component.members.slice(0, LIMITS_2421.maxMembersPerComponent);
      const memberText = shown.join(", ")
        + (component.members.length > shown.length ? `, … +${component.members.length - shown.length}` : "");
      const groupHits = component.members.filter((index) => currentGroupNodes.includes(index)).length;
      groups.push({
        title: bi(
          `Component root ${component.root} · ${component.members.length} node`,
          `Component root ${component.root} · ${component.members.length} nodes`,
        ),
        items: [
          { label: bi("Thành viên", "Members"), value: memberText, state: "success" },
          {
            label: bi("Node cùng giá trị hiện tại", "Current-value nodes"),
            value: groupHits,
            state: groupHits > 1 ? "updated" : "info",
          },
        ],
      });
    });
    if (snapshot.length > LIMITS_2421.maxComponentGroups) {
      groups.push({
        title: bi("Component chưa hiển thị", "Hidden components"),
        items: [{
          label: bi("Số lượng", "Count"),
          value: snapshot.length - LIMITS_2421.maxComponentGroups,
          state: "muted",
        }],
      });
    }
    return groups;
  }

  function emit2421(options) {
    const final = Boolean(options.final);
    if (!final && tracer.steps.length >= LIMITS_2421.maxTraceSteps - 1) {
      tracer.truncate();
      return false;
    }
    const snapshot = components2421(dsu, active);
    const highlight = [currentNode, currentNeighbor].filter((index) => Number.isSafeInteger(index));
    const mark = active.map((isActive, index) => (isActive ? index : -1)).filter((index) => index >= 0);
    const sequenceIndices = boundedIndices2421(
      n,
      [currentNode, currentNeighbor, 0, n - 1],
      LIMITS_2421.maxSequenceItems,
    );
    return tracer.emit({
      phaseIndex: options.phaseIndex,
      title: options.title,
      note: options.note,
      action: options.action,
      formula: options.formula,
      codeLines: options.codeLines,
      vars: [
        { name: bi("giá trị nhóm", "group value"), value: currentGroupValue === null ? "—" : currentGroupValue },
        { name: bi("node", "node"), value: currentNode === null ? "—" : currentNode },
        { name: bi("node đã kích hoạt", "activated nodes"), value: `${activeCount}/${n}` },
        { name: bi("số component", "components"), value: snapshot.length },
        { name: bi("đáp án", "answer"), value: answer },
      ],
      arr: vals,
      sub: vals.map((value, index) => {
        if (!active[index]) return `n${index}: v=${value} · inactive`;
        return `n${index}: v=${value} · root ${dsu.find(index)}`;
      }),
      highlight,
      mark,
      graph: stateGraph(),
      table: groupTable(),
      queue: eventHistory.length
        ? eventHistory.map((event) => ({ ...event }))
        : [{ label: "init", sub: "waiting", state: "pending" }],
      groups: componentGroupsView(snapshot),
      sequence: sequenceIndices.map((index) => {
        const position = order.indexOf(index);
        return {
          label: `n${index}`,
          value: `v=${vals[index]} · #${position}`,
          state: nodeState(index),
        };
      }),
      metrics: [
        { label: bi("Số node", "Nodes"), value: n },
        {
          label: bi("Giá trị đang xử lý", "Processing value"),
          value: currentGroupValue === null ? "—" : currentGroupValue,
          state: "active",
        },
        { label: bi("Đã kích hoạt", "Activated"), value: `${activeCount}/${n}` },
        { label: bi("Đáp án", "Answer"), value: answer, state: "success" },
      ],
      final,
      answer: final ? answer : null,
    });
  }

  // Debug line-by-line: mỗi step chỉ highlight đúng 1 dòng code đang chạy.
  const lineStep = (phaseIndex, codeLine, title, note, action, formula) => emit2421({
    phaseIndex, title, note, action, formula, codeLines: [codeLine],
  });

  lineStep(0, 8,
    bi(`Dòng 8: n = ${n}`, `Line 8: n = ${n}`),
    bi(`Cây có ${n} node, đánh số 0..${n - 1}.`, `The tree has ${n} nodes numbered 0..${n - 1}.`),
    bi("Đọc số node từ vals.", "Read the node count from vals."),
    bi(`n = len(vals) = ${n}`, `n = len(vals) = ${n}`));

  lineStep(0, 10,
    bi("Dòng 10: tạo danh sách kề rỗng", "Line 10: create empty adjacency lists"),
    bi("Mỗi node có một danh sách láng giềng riêng, ban đầu rỗng.", "Each node gets its own neighbor list, initially empty."),
    bi("Khởi tạo adj.", "Initialize adj."),
    bi("adj = [[] for _ in range(n)]", "adj = [[] for _ in range(n)]"));

  lineStep(0, 11,
    bi("Dòng 11: duyệt từng cạnh", "Line 11: iterate over edges"),
    bi(`Thêm ${edges.length} cạnh vào adj theo cả hai chiều (dòng 12–13).`, `Add all ${edges.length} edges to adj in both directions (lines 12–13).`),
    bi("Nối mỗi cạnh vào danh sách kề hai đầu.", "Append each edge to both endpoint lists."),
    bi(`for u, v in edges:  (${edges.length} cạnh)`, `for u, v in edges:  (${edges.length} edges)`));

  lineStep(0, 15,
    bi("Dòng 15: parent[i] = i", "Line 15: parent[i] = i"),
    bi("Mỗi node ban đầu là một tập riêng trong DSU.", "Each node starts as its own DSU set."),
    bi("Khởi tạo DSU.", "Initialize the DSU."),
    bi("parent = list(range(n))", "parent = list(range(n))"));

  lineStep(0, 16,
    bi("Dòng 16: size[i] = 1", "Line 16: size[i] = 1"),
    bi("Mỗi component ban đầu có kích thước 1, dùng cho union theo kích thước.", "Each component starts with size 1, used for union by size."),
    bi("Khởi tạo mảng size.", "Initialize the size array."),
    bi("size = [1] * n", "size = [1] * n"));

  lineStep(0, 17,
    bi("Dòng 17: chưa node nào hoạt động", "Line 17: no active node yet"),
    bi("active[node] chỉ thành True khi node đã được xử lý (giá trị ≤ giá trị hiện tại).", "active[node] becomes True only once the node is processed (value ≤ current value)."),
    bi("Khởi tạo mảng active.", "Initialize the active array."),
    bi("active = [False] * n", "active = [False] * n"));

  lineStep(0, 37,
    bi("Dòng 37: sắp xếp node theo giá trị", "Line 37: sort nodes by value"),
    bi(`Thứ tự kích hoạt: [${order.slice(0, 12).join(", ")}${order.length > 12 ? ", …" : ""}]. Giá trị nhỏ trước để láng giềng đã kích hoạt luôn có giá trị ≤ hiện tại.`, `Activation order: [${order.slice(0, 12).join(", ")}${order.length > 12 ? ", …" : ""}]. Smaller values first so activated neighbors always have value ≤ current.`),
    bi("Sắp xếp order theo vals tăng dần.", "Sort order by ascending vals."),
    bi("order = sorted(range(n), key=lambda i: vals[i])", "order = sorted(range(n), key=lambda i: vals[i])"));

  lineStep(0, 39,
    bi(`Dòng 39: answer = ${n}`, `Line 39: answer = ${n}`),
    bi("Mỗi node đơn tự tạo một đường tốt.", "Each single node forms one good path by itself."),
    bi("Khởi tạo đáp án.", "Initialize the answer."),
    bi(`answer = n = ${n}`, `answer = n = ${n}`));

  let i = 0;
  while (i < n) {
    const value = vals[order[i]];
    let j = i;
    currentGroupValue = value;
    currentGroupNodes = [];
    while (j < n && vals[order[j]] === value) {
      currentGroupNodes.push(order[j]);
      j += 1;
    }

    lineStep(1, 42,
      bi(`Dòng 42: while i < n — xử lý nhóm v=${value}`, `Line 42: while i < n — process group v=${value}`),
      bi(`Nhóm gồm các node [${currentGroupNodes.join(", ")}] cùng giá trị ${value}.`, `The group holds nodes [${currentGroupNodes.join(", ")}] with value ${value}.`),
      bi("Bắt đầu một nhóm giá trị.", "Start a value group."),
      bi(`while i < n:  (i=${i}, v=${value})`, `while i < n:  (i=${i}, v=${value})`));

    lineStep(1, 43,
      bi(`Dòng 43: j = ${i}`, `Line 43: j = ${i}`),
      bi("j quét từ i để gom các node cùng giá trị (dòng 46).", "j scans from i to collect equal-value nodes (line 46)."),
      bi("Đánh dấu đầu nhóm.", "Mark the group start."),
      bi(`j = i = ${i}`, `j = i = ${i}`));

    for (const node of currentGroupNodes) {
      currentNode = node;
      currentNeighbor = null;
      lineStep(1, 47,
        bi(`Dòng 47: node = ${node}`, `Line 47: node = ${node}`),
        bi(`Lấy node tiếp theo trong nhóm v=${value}.`, `Take the next node of group v=${value}.`),
        bi("Chọn node để kích hoạt.", "Pick the node to activate."),
        bi(`node = order[j] = ${node}`, `node = order[j] = ${node}`));

      dsu.activate(node);
      active[node] = true;
      activeCount += 1;
      activeTransition = { kind: "activate", detail: `active[${node}] = True · v=${value}` };
      rememberEvent(`+n${node}`, `v=${value}`, "active");
      lineStep(1, 48,
        bi(`Dòng 48: kích hoạt node ${node}`, `Line 48: activate node ${node}`),
        bi(`Node ${node} thành component đơn lẻ trong DSU.`, `Node ${node} becomes a singleton DSU component.`),
        bi("Bật node trong DSU và mảng active.", "Activate the node in the DSU and active array."),
        bi(`active[${node}] = True`, `active[${node}] = True`));

      for (const neighbor of adj[node]) {
        currentNeighbor = neighbor;
        lineStep(2, 50,
          bi(`Dòng 50: xét láng giềng ${neighbor} của node ${node}`, `Line 50: check neighbor ${neighbor} of node ${node}`),
          bi(`Duyệt danh sách kề của node ${node}.`, `Iterate the adjacency list of node ${node}.`),
          bi("Lấy láng giềng tiếp theo.", "Take the next neighbor."),
          bi(`for nb in adj[${node}]  →  nb=${neighbor}`, `for nb in adj[${node}]  →  nb=${neighbor}`));

        if (!active[neighbor]) {
          lineStep(2, 51,
            bi(`Dòng 51: active[${neighbor}] là False → bỏ qua`, `Line 51: active[${neighbor}] is False → skip`),
            bi(`Láng giềng ${neighbor} (v=${vals[neighbor]}) chưa kích hoạt nên chưa thể gộp.`, `Neighbor ${neighbor} (v=${vals[neighbor]}) is not active yet, so no union.`),
            bi("Kiểm tra active[nb].", "Check active[nb]."),
            bi(`if active[${neighbor}]:  →  False`, `if active[${neighbor}]:  →  False`));
          currentNeighbor = null;
          continue;
        }
        const alreadyUnited = dsu.find(node) === dsu.find(neighbor);
        lineStep(2, 51,
          bi(`Dòng 51: active[${neighbor}] là True → gọi union`, `Line 51: active[${neighbor}] is True → call union`),
          bi(`Láng giềng ${neighbor} (v=${vals[neighbor]} ≤ ${value}) đã kích hoạt.`, `Neighbor ${neighbor} (v=${vals[neighbor]} ≤ ${value}) is active.`),
          bi("Kiểm tra active[nb].", "Check active[nb]."),
          bi(`if active[${neighbor}]:  →  True`, `if active[${neighbor}]:  →  True`));

        const root = dsu.union(node, neighbor);
        if (!alreadyUnited) {
          currentUnionEdge = [node, neighbor];
          activeTransition = { kind: "union", detail: `union(${node}, ${neighbor}) → root ${root}` };
          rememberEvent(`n${node}↔n${neighbor}`, `root=${root}`, "updated");
        }
        lineStep(2, 52,
          alreadyUnited
            ? bi(`Dòng 52: union(${node}, ${neighbor}) — đã cùng root`, `Line 52: union(${node}, ${neighbor}) — already same root`)
            : bi(`Dòng 52: union(${node}, ${neighbor}) → root ${root}`, `Line 52: union(${node}, ${neighbor}) → root ${root}`),
          alreadyUnited
            ? bi("Hai node đã cùng component (ra == rb) nên union trả về ngay, không đổi gì.", "Both nodes already share a component (ra == rb), so union returns immediately with no change.")
            : bi(`Gộp hai component (union theo kích thước) thành root ${root}.`, `Merge the two components (union by size) into root ${root}.`),
          bi("Gọi union(a, b).", "Call union(a, b)."),
          bi(`union(${node}, ${neighbor})`, `union(${node}, ${neighbor})`));
        currentUnionEdge = null;
        currentNeighbor = null;
      }

      lineStep(1, 54,
        bi("Dòng 54: j += 1", "Line 54: j += 1"),
        bi("Sang node kế tiếp trong nhóm.", "Move to the next node in the group."),
        bi("Tăng j.", "Increment j."),
        bi("j += 1", "j += 1"));
    }
    currentNode = null;
    currentNeighbor = null;

    lineStep(3, 57,
      bi("Dòng 57: groups = defaultdict(int)", "Line 57: groups = defaultdict(int)"),
      bi("Chuẩn bị đếm số node cùng giá trị theo từng component.", "Prepare to count equal-value nodes per component."),
      bi("Tạo dict đếm.", "Create the counting dict."),
      bi("groups = defaultdict(int)", "groups = defaultdict(int)"));

    const counts = new Map();
    for (const node of currentGroupNodes) {
      currentNode = node;
      lineStep(3, 59,
        bi(`Dòng 59: duyệt node ${node} trong nhóm`, `Line 59: visit node ${node} in the group`),
        bi(`Đếm node ${node} vào component chứa nó.`, `Count node ${node} into its component.`),
        bi("Lặp k trên nhóm.", "Loop k over the group."),
        bi(`for k in range(i, j)  →  order[k] = ${node}`, `for k in range(i, j)  →  order[k] = ${node}`));
      const root = dsu.find(node);
      counts.set(root, (counts.get(root) || 0) + 1);
      lineStep(3, 60,
        bi(`Dòng 60: root = find(${node}) = ${root}`, `Line 60: root = find(${node}) = ${root}`),
        bi(`Node ${node} thuộc component root ${root}.`, `Node ${node} belongs to component root ${root}.`),
        bi("Tìm root của node.", "Find the node's root."),
        bi(`root = find(order[k]) = ${root}`, `root = find(order[k]) = ${root}`));
      lineStep(3, 61,
        bi(`Dòng 61: groups[${root}] = ${counts.get(root)}`, `Line 61: groups[${root}] = ${counts.get(root)}`),
        bi(`Component root ${root} có ${counts.get(root)} node giá trị ${value}.`, `Component root ${root} holds ${counts.get(root)} nodes of value ${value}.`),
        bi("Tăng bộ đếm.", "Increment the counter."),
        bi(`groups[${root}] += 1`, `groups[${root}] += 1`));
    }
    currentNode = null;

    let added = 0;
    const before = answer;
    lineStep(3, 64,
      bi("Dòng 64: duyệt từng component", "Line 64: iterate components"),
      bi(`${counts.size} component chứa node giá trị ${value}.`, `${counts.size} component(s) hold value-${value} nodes.`),
      bi("Lặp cnt trên groups.", "Loop cnt over groups."),
      bi("for cnt in groups.values():", "for cnt in groups.values():"));
    for (const [root, count] of counts) {
      const contribution = (count * (count - 1)) / 2;
      added += contribution;
      answer += contribution;
      activeTransition = { kind: "count", detail: `root ${root}: C(${count},2) = ${contribution} → answer = ${answer}` };
      rememberEvent(`v=${value}@r${root}`, `+${contribution}`, contribution > 0 ? "updated" : "computed");
      lineStep(3, 65,
        bi(`Dòng 65: +${contribution}  (k=${count} tại root ${root})`, `Line 65: +${contribution}  (k=${count} at root ${root})`),
        bi(`C(${count}, 2) = ${contribution} đường tốt mới; tổng hiện tại ${answer}.`, `C(${count}, 2) = ${contribution} new good paths; running total ${answer}.`),
        bi("Cộng C(k,2) vào answer.", "Add C(k,2) to the answer."),
        bi(`answer += ${count}*${count - 1}//2  →  ${answer}`, `answer += ${count}*${count - 1}//2  →  ${answer}`));
    }
    groupsDone.push({ value, nodes: [...currentGroupNodes], components: counts.size, added });

    lineStep(3, 67,
      bi("Dòng 67: i = j — sang nhóm kế tiếp", "Line 67: i = j — next group"),
      bi(`Nhóm v=${value} xong: ${before} + ${added} = ${answer}.`, `Group v=${value} done: ${before} + ${added} = ${answer}.`),
      bi("Nhảy i tới đầu nhóm mới.", "Jump i to the next group."),
      bi("i = j", "i = j"));

    i = j;
  }

  const oracle = bruteGoodPaths2421(vals, adj);
  if (oracle !== answer) {
    throw new Error(`#2421: DSU answer ${answer} disagrees with brute-force oracle ${oracle}`);
  }

  currentGroupValue = null;
  currentGroupNodes = [];
  currentNode = null;
  currentNeighbor = null;
  activeTransition = { kind: "result", detail: `answer = ${answer}` };
  emit2421({
    phaseIndex: 4,
    title: bi(`Hoàn tất: ${answer} đường tốt`, `Done: ${answer} good paths`),
    note: tracer.truncated
      ? bi(
        "Trace đã rút gọn cho input lớn, nhưng đáp án vẫn được tính đầy đủ và đối chiếu với kiểm tra vét cạn.",
        "The trace was shortened for large inputs, but the answer was fully computed and checked against brute force.",
      )
      : bi(
        "Mỗi nhóm giá trị được xử lý đúng một lần theo thứ tự tăng dần; đáp án khớp với kiểm tra vét cạn độc lập.",
        "Each value group was processed exactly once in ascending order; the answer matches the independent brute-force check.",
      ),
    action: bi("Trả về tổng số đường tốt.", "Return the total number of good paths."),
    formula: bi(`answer = ${answer}`, `answer = ${answer}`),
    codeLines: [69],
    final: true,
  });

  return {
    original: { vals: [...vals], edges: edges.map((pair) => [...pair]) },
    answer,
    steps: tracer.finish(),
  };
}

module.exports = {
  2421: {
    id: 2421,
    difficulty: "hard",
    slug: "number-of-good-paths",
    category: { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
    tags: [
      { key: "union-find", vi: "Hợp nhất tập hợp", en: "Union-Find" },
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "sorting", vi: "Sắp xếp", en: "Sorting" },
    ],
    title: bi("Số đường tốt", "Number of Good Paths"),
    titleVi: bi("Đếm đường tốt bằng Union-Find theo giá trị tăng dần", "Count good paths with Union-Find in ascending value order"),
    statement: bi(
      "Cho cây n node, vals[i] là giá trị của node i. Một đường đi là đường tốt nếu node đầu và node cuối có cùng giá trị, và mọi node trên đường đều có giá trị không vượt quá giá trị đó. Đếm tất cả đường tốt (mỗi node đơn cũng tính là một).",
      "Given a tree of n nodes where vals[i] is node i's value. A path is good if its endpoints share the same value and every node on the path has value at most that value. Count all good paths (each single node counts as one).",
    ),
    defaultInput: [...DEFAULT_VALS_2421],
    defaults: {
      input: [...DEFAULT_VALS_2421],
      edges: JSON.stringify(DEFAULT_EDGES_2421),
    },
    expectedOutput: EXPECTED_2421,
    inputKind: "positive",
    inputLabel: bi("vals (giá trị mỗi node)", "vals (value per node)"),
    extraParams: [
      {
        key: "edges",
        type: "string",
        default: JSON.stringify(DEFAULT_EDGES_2421),
        label: bi("edges (JSON các cặp [u, v])", "edges (JSON [u, v] pairs)"),
      },
    ],
    visualizationLimits: { ...LIMITS_2421 },
    approach: [
      bi("Sắp xếp node theo vals tăng dần; node giá trị nhỏ được kích hoạt trước.", "Sort nodes by ascending vals; smaller values activate first."),
      bi("Khi kích hoạt một node, union nó với mọi láng giềng đã kích hoạt (chúng đều có giá trị ≤ giá trị hiện tại).", "When activating a node, union it with every activated neighbor (all have value ≤ the current value)."),
      bi("Trong một nhóm cùng giá trị, component chứa k node của nhóm đóng góp C(k,2) đường tốt mới.", "Inside an equal-value group, a component holding k group nodes contributes C(k,2) new good paths."),
      bi("Khởi đầu đáp án bằng n (mỗi node đơn là một đường tốt), rồi cộng dồn theo từng nhóm.", "Start the answer at n (each single node is a good path), then accumulate per group."),
    ],
    complexity: {
      time: "O(n log n · α(n))",
      space: "O(n)",
      note: bi(
        "Sắp xếp chiếm phần lớn chi phí; mỗi node kích hoạt một lần và mỗi cạnh xét tối đa hai lần union. Trace, đồ thị và bảng nhóm đều có giới hạn hữu hạn.",
        "Sorting dominates the cost; each node activates once and each edge is considered for at most two unions. The trace, graph, and group table are finitely bounded.",
      ),
    },
    code: SOURCE_2421,
    debugMode: "semantic",
    parser: parseNumberOfGoodPaths2421Input,
    parseNumberOfGoodPaths2421Input,
    liveArgs: (input, params = {}) => {
      const parsed = parseNumberOfGoodPaths2421Input(input, params);
      return [[...parsed.vals], parsed.edges.map((pair) => [...pair])];
    },
    builder: buildSteps2421,
  },
};
