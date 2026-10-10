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
    return {
      layout: "circle",
      nodes: visible.map((index) => ({
        id: index,
        label: String(index),
        sub: active[index]
          ? `v=${vals[index]} · root=${dsu.find(index)}`
          : `v=${vals[index]} · inactive`,
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

  emit2421({
    phaseIndex: 0,
    title: bi(
      `Dựng cây ${n} node và sắp xếp theo giá trị tăng dần`,
      `Build the ${n}-node tree and sort by ascending value`,
    ),
    note: bi(
      `Thứ tự kích hoạt: [${order.slice(0, 12).join(", ")}${order.length > 12 ? ", …" : ""}]. Node giá trị nhỏ được kích hoạt trước để mọi láng giềng đã kích hoạt đều có giá trị không vượt quá node hiện tại.`,
      `Activation order: [${order.slice(0, 12).join(", ")}${order.length > 12 ? ", …" : ""}]. Smaller values activate first so every activated neighbor has value at most the current node.`,
    ),
    action: bi("Dựng danh sách kề, mảng active và thứ tự order.", "Build the adjacency list, the active array, and the order."),
    formula: bi(`answer = n = ${n}`, `answer = n = ${n}`),
    codeLines: [8, 10, 11, 12, 13, 15, 16, 17, 37, 39],
  });

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

    for (const node of currentGroupNodes) {
      currentNode = node;
      currentNeighbor = null;
      dsu.activate(node);
      active[node] = true;
      activeCount += 1;
      activeTransition = {
        kind: "activate",
        detail: `active[${node}] = True · v=${value}`,
      };
      rememberEvent(`+n${node}`, `v=${value}`, "active");
      emit2421({
        phaseIndex: 1,
        title: bi(`Kích hoạt node ${node} (v=${value})`, `Activate node ${node} (v=${value})`),
        note: bi(
          `Node ${node} tạo component đơn lẻ. Các láng giềng đã kích hoạt đều có giá trị ≤ ${value} nên mọi đường đi qua chúng đều "tốt" nếu hai đầu cùng giá trị ${value}.`,
          `Node ${node} starts a singleton component. All activated neighbors have value ≤ ${value}, so any path through them is "good" when both ends share value ${value}.`,
        ),
        action: bi("Bật node trong DSU và mảng active.", "Activate the node in the DSU and the active array."),
        formula: bi(`active[${node}] = True`, `active[${node}] = True`),
        codeLines: [47, 48],
      });
    }

    for (const node of currentGroupNodes) {
      currentNode = node;
      for (const neighbor of adj[node]) {
        if (!active[neighbor]) continue;
        currentNeighbor = neighbor;
        const rootNode = dsu.find(node);
        const rootNeighbor = dsu.find(neighbor);
        if (rootNode === rootNeighbor) {
          currentNeighbor = null;
          continue;
        }
        const root = dsu.union(node, neighbor);
        currentUnionEdge = [node, neighbor];
        activeTransition = {
          kind: "union",
          detail: `union(${node}, ${neighbor}) → root ${root}`,
        };
        rememberEvent(`n${node}↔n${neighbor}`, `root=${root}`, "updated");
        emit2421({
          phaseIndex: 2,
          title: bi(`Gộp node ${node} với láng giềng ${neighbor}`, `Union node ${node} with neighbor ${neighbor}`),
          note: bi(
            `Láng giềng ${neighbor} đã kích hoạt (v=${vals[neighbor]} ≤ ${value}) nên hai component nhập thành một.`,
            `Neighbor ${neighbor} is active (v=${vals[neighbor]} ≤ ${value}), so both components merge into one.`,
          ),
          action: bi("Union hai component theo kích thước.", "Union both components by size."),
          formula: bi(`union(${node}, ${neighbor}) → root ${root}`, `union(${node}, ${neighbor}) → root ${root}`),
          codeLines: [50, 51, 52],
        });
        currentUnionEdge = null;
        currentNeighbor = null;
      }
    }
    currentNode = null;
    currentNeighbor = null;

    const counts = new Map();
    for (const node of currentGroupNodes) {
      const root = dsu.find(node);
      counts.set(root, (counts.get(root) || 0) + 1);
    }
    let added = 0;
    const parts = [];
    for (const [root, count] of counts) {
      const contribution = (count * (count - 1)) / 2;
      added += contribution;
      parts.push(`root ${root}: k=${count} → +${contribution}`);
    }
    const before = answer;
    answer += added;
    groupsDone.push({
      value,
      nodes: [...currentGroupNodes],
      components: counts.size,
      added,
    });
    activeTransition = {
      kind: "count",
      detail: `${before} + ${added} = ${answer}`,
    };
    rememberEvent(`v=${value}`, `+${added} good paths`, added > 0 ? "updated" : "computed");
    emit2421({
      phaseIndex: 3,
      title: bi(
        `Nhóm v=${value}: cộng ${added} đường tốt (tổng ${answer})`,
        `Group v=${value}: add ${added} good paths (total ${answer})`,
      ),
      note: bi(
        parts.length
          ? `Trong nhóm, mỗi component có k node cùng giá trị tạo C(k,2) đường tốt: ${parts.join("; ")}.`
          : "Nhóm rỗng, không cộng thêm.",
        parts.length
          ? `Inside the group, each component with k equal-value nodes forms C(k,2) good paths: ${parts.join("; ")}.`
          : "Empty group, nothing added.",
      ),
      action: bi("Đếm node cùng giá trị theo component rồi cộng C(k,2).", "Count equal-value nodes per component, then add C(k,2)."),
      formula: bi(`${before} + ${added} = ${answer}`, `${before} + ${added} = ${answer}`),
      codeLines: [57, 59, 60, 61, 64, 65],
    });

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
