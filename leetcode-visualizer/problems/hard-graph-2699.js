"use strict";

const {
  bi,
  fail,
  parsePlainParams,
  parseInteger,
  parseRows,
  createTracer,
  MinHeap,
  formatFinite,
} = require("./hard-viz-shared");

const PROBLEM_ID = 2699;
const MAX_EDGE_WEIGHT = 2_000_000_000;
const MAX_NODES = 24;
const MAX_EDGES = 80;
const MAX_TRACE_STEPS = 180;
const MAX_TABLE_ROWS = 16;
const MAX_QUEUE_ITEMS = 14;
const MAX_ASSIGNMENT_HISTORY = 14;
const MAX_PATH_ITEMS = 14;

const DEFAULT_N = 4;
const DEFAULT_INPUT = "[[0,1,-1],[1,3,2],[0,2,2],[2,3,5]]";
const DEFAULT_SOURCE = 0;
const DEFAULT_DESTINATION = 3;
const DEFAULT_TARGET = 6;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const MODIFY_GRAPH_EDGE_WEIGHTS_2699_SOURCE = Object.freeze([
  "from heapq import heappop, heappush",
  "from math import inf",
  "from typing import List",
  "",
  "class Solution:",
  "    def modifiedGraphEdges(self, n: int, edges: List[List[int]], source: int, destination: int, target: int) -> List[List[int]]:",
  "        MAX_WEIGHT = 2_000_000_000",
  "        graph = [[] for _ in range(n)]",
  "        for edge_index, (u, v, _) in enumerate(edges):",
  "            graph[u].append((v, edge_index))",
  "            graph[v].append((u, edge_index))",
  "",
  "        def dijkstra(start: int) -> List[int]:",
  "            distance = [inf] * n",
  "            distance[start] = 0",
  "            heap = [(0, start)]",
  "            while heap:",
  "                current_distance, node = heappop(heap)",
  "                if current_distance != distance[node]:",
  "                    continue",
  "                for nxt, edge_index in graph[node]:",
  "                    weight = edges[edge_index][2]",
  "                    if weight == -1:",
  "                        weight = 1",
  "                    candidate = current_distance + weight",
  "                    if candidate < distance[nxt]:",
  "                        distance[nxt] = candidate",
  "                        heappush(heap, (candidate, nxt))",
  "            return distance",
  "",
  "        dist_to_destination = dijkstra(destination)",
  "        if dist_to_destination[source] > target:",
  "            return []",
  "",
  "        dist_from_source = [inf] * n",
  "        dist_from_source[source] = 0",
  "        heap = [(0, source)]",
  "        while heap:",
  "            current_distance, node = heappop(heap)",
  "            if current_distance != dist_from_source[node]:",
  "                continue",
  "            for nxt, edge_index in graph[node]:",
  "                weight = edges[edge_index][2]",
  "                if weight == -1:",
  "                    needed = target - current_distance - dist_to_destination[nxt]",
  "                    weight = min(MAX_WEIGHT, max(1, needed))",
  "                    edges[edge_index][2] = weight",
  "                candidate = current_distance + weight",
  "                if candidate < dist_from_source[nxt]:",
  "                    dist_from_source[nxt] = candidate",
  "                    heappush(heap, (candidate, nxt))",
  "",
  "        for edge in edges:",
  "            if edge[2] == -1:",
  "                edge[2] = MAX_WEIGHT",
  "",
  "        if dijkstra(source)[destination] != target:",
  "            return []",
  "        return edges",
]);

const MODIFY_GRAPH_EDGE_WEIGHTS_2699_PHASES = Object.freeze([
  bi("Dựng đồ thị dùng chung", "Build the shared graph"),
  bi("Khoảng cách cận dưới tới đích", "Lower-bound distances to destination"),
  bi("Kiểm tra tính khả thi", "Check feasibility"),
  bi("Dijkstra từ nguồn và gán cạnh", "Source Dijkstra with edge assignment"),
  bi("Khóa các cạnh chưa gặp", "Seal untouched unknown edges"),
  bi("Xác minh đường đi ngắn nhất", "Verify the final shortest path"),
  bi("Hoàn tất", "Complete"),
]);

function sourceLine(fragment, occurrence = 0) {
  let seen = 0;
  for (let index = 0; index < MODIFY_GRAPH_EDGE_WEIGHTS_2699_SOURCE.length; index += 1) {
    if (!MODIFY_GRAPH_EDGE_WEIGHTS_2699_SOURCE[index].includes(fragment)) continue;
    if (seen === occurrence) return index + 1;
    seen += 1;
  }
  throw new Error(`#${PROBLEM_ID}: missing Python source line: ${fragment}`);
}

const PYTHON_LINES = Object.freeze({
  graph: [sourceLine("graph = [[]"), sourceLine("graph[u].append"), sourceLine("graph[v].append")],
  reverseStart: [sourceLine("def dijkstra"), sourceLine("dist_to_destination =")],
  reversePop: [sourceLine("current_distance, node = heappop", 0)],
  reverseRelax: [sourceLine("candidate = current_distance + weight", 0), sourceLine("distance[nxt] = candidate")],
  feasible: [sourceLine("if dist_to_destination[source] > target")],
  forwardStart: [sourceLine("dist_from_source ="), sourceLine("heap = [(0, source)]")],
  forwardPop: [sourceLine("current_distance, node = heappop", 1)],
  assign: [sourceLine("needed = target"), sourceLine("weight = min(MAX_WEIGHT"), sourceLine("edges[edge_index][2] = weight")],
  forwardRelax: [sourceLine("candidate = current_distance + weight", 1), sourceLine("dist_from_source[nxt] = candidate")],
  finalize: [sourceLine("for edge in edges"), sourceLine("edge[2] = MAX_WEIGHT")],
  verify: [sourceLine("if dijkstra(source)[destination] != target")],
  impossible: [sourceLine("return []", 1)],
  finish: [sourceLine("return edges")],
});

function parseModifyGraphEdgeWeights2699Input(input, params) {
  const parsedParams = parsePlainParams(params, PROBLEM_ID);
  const n = parseInteger(hasOwn(parsedParams, "n") ? parsedParams.n : DEFAULT_N, {
    problemId: PROBLEM_ID,
    name: "n",
    min: 2,
    max: MAX_NODES,
  });
  const source = parseInteger(
    hasOwn(parsedParams, "source") ? parsedParams.source : DEFAULT_SOURCE,
    { problemId: PROBLEM_ID, name: "source", min: 0, max: n - 1 },
  );
  const destination = parseInteger(
    hasOwn(parsedParams, "destination") ? parsedParams.destination : DEFAULT_DESTINATION,
    { problemId: PROBLEM_ID, name: "destination", min: 0, max: n - 1 },
  );
  const target = parseInteger(
    hasOwn(parsedParams, "target") ? parsedParams.target : DEFAULT_TARGET,
    { problemId: PROBLEM_ID, name: "target", min: 1, max: MAX_EDGE_WEIGHT },
  );

  if (source === destination) {
    fail(
      PROBLEM_ID,
      RangeError,
      "source và destination phải khác nhau",
      "source and destination must be different",
    );
  }
  if (typeof input !== "string") {
    fail(
      PROBLEM_ID,
      TypeError,
      "edges phải là chuỗi JSON hoặc chuỗi u,v,w;...",
      "edges must be a JSON string or a u,v,w;... string",
    );
  }
  if (!input.trim()) {
    fail(PROBLEM_ID, RangeError, "edges không được rỗng", "edges must not be empty");
  }

  const rows = parseRows(input, {
    problemId: PROBLEM_ID,
    name: "edges",
    columns: 3,
    minRows: 1,
    maxRows: MAX_EDGES,
    minValue: -1,
    maxValue: MAX_EDGE_WEIGHT,
  });

  const edges = rows.map(([u, v, weight], edgeIndex) => {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      fail(
        PROBLEM_ID,
        RangeError,
        `edges[${edgeIndex}] có endpoint ngoài [0, ${n - 1}]`,
        `edges[${edgeIndex}] has an endpoint outside [0, ${n - 1}]`,
      );
    }
    if (u === v) {
      fail(
        PROBLEM_ID,
        RangeError,
        `edges[${edgeIndex}] không được là self-edge`,
        `edges[${edgeIndex}] must not be a self-edge`,
      );
    }
    if (weight !== -1 && weight <= 0) {
      fail(
        PROBLEM_ID,
        RangeError,
        `edges[${edgeIndex}][2] phải là -1 hoặc số dương`,
        `edges[${edgeIndex}][2] must be -1 or positive`,
      );
    }
    return [u, v, weight];
  });

  return { n, edges, source, destination, target };
}

function buildModifyGraphEdgeWeights2699(input, params) {
  const parsed = parseModifyGraphEdgeWeights2699Input(input, params);
  const { n, source, destination, target } = parsed;
  const originalEdges = parsed.edges.map((edge) => [...edge]);
  const edges = parsed.edges.map((edge) => [...edge]);
  const wasUnknown = edges.map((edge) => edge[2] === -1);
  const adjacency = Array.from({ length: n }, () => []);

  edges.forEach(([u, v], edgeIndex) => {
    adjacency[u].push({ to: v, edgeIndex });
    adjacency[v].push({ to: u, edgeIndex });
  });

  const tracer = createTracer({
    problemId: PROBLEM_ID,
    source: MODIFY_GRAPH_EDGE_WEIGHTS_2699_SOURCE,
    phases: MODIFY_GRAPH_EDGE_WEIGHTS_2699_PHASES,
    maxSteps: MAX_TRACE_STEPS,
    baseArray: [],
    legend: [
      { label: bi("Đỉnh/cạnh đang xét", "Active node/edge"), state: "active" },
      { label: bi("Khoảng cách ứng viên", "Distance candidate"), state: "candidate" },
      { label: bi("Cạnh chưa biết", "Unknown edge"), state: "pending" },
      { label: bi("Trọng số vừa gán", "Newly assigned weight"), state: "updated" },
      { label: bi("Đường xác minh", "Verified path"), state: "success" },
    ],
  });

  const distToDestination = Array(n).fill(Infinity);
  const distFromSource = Array(n).fill(Infinity);
  const verifyDistance = Array(n).fill(Infinity);
  const reverseSettled = new Set();
  const forwardSettled = new Set();
  const verifySettled = new Set();
  const assignedEdgeIndices = new Set();
  const verificationPathEdges = new Set();
  const verificationPathNodes = new Set();
  const assignmentHistory = [];

  const counters = {
    reversePops: 0,
    reverseRelaxations: 0,
    forwardPops: 0,
    forwardRelaxations: 0,
    edgeScans: 0,
    adaptiveAssignments: 0,
    sealedAssignments: 0,
    verifyPops: 0,
    verifyRelaxations: 0,
  };

  let activeNode = null;
  let candidateNode = null;
  let activeEdgeIndex = null;
  let lastAssignedEdgeIndex = null;
  let activeHeap = null;
  let heapStage = "idle";
  let currentStage = "graph";
  let transition = null;
  let assignmentHistoryDropped = 0;
  let traceSaturated = false;
  let verificationSucceeded = null;
  let verificationPath = [];

  function distanceText(value) {
    return formatFinite(value);
  }

  function requiredText(value) {
    if (value === Infinity) return "∞";
    if (value === -Infinity) return "-∞";
    return value;
  }

  function nodeSub(node) {
    const roles = [];
    if (node === source) roles.push("source");
    if (node === destination) roles.push("destination");
    if (currentStage === "reverse" || currentStage === "feasibility") {
      roles.push(`toD=${distanceText(distToDestination[node])}`);
    } else if (currentStage === "forward" || currentStage === "finalize") {
      roles.push(`fromS=${distanceText(distFromSource[node])}`);
      roles.push(`toD=${distanceText(distToDestination[node])}`);
    } else if (currentStage === "verify" || currentStage === "result") {
      roles.push(`check=${distanceText(verifyDistance[node])}`);
    }
    return roles.join(" · ");
  }

  function nodeState(node) {
    if (verificationPathNodes.has(node)) {
      return verificationSucceeded === false ? "danger" : "success";
    }
    if (node === activeNode) return "active";
    if (node === candidateNode) return "candidate";
    if (currentStage === "reverse" && reverseSettled.has(node)) return "visited";
    if (currentStage === "forward" && forwardSettled.has(node)) return "visited";
    if (currentStage === "verify" && verifySettled.has(node)) return "visited";
    if (node === destination) return "success";
    if (node === source) return "info";
    return "default";
  }

  function edgeState(edgeIndex) {
    if (verificationPathEdges.has(edgeIndex)) {
      return verificationSucceeded === false ? "danger" : "success";
    }
    if (activeEdgeIndex === edgeIndex && transition && transition.kind === "assign") {
      return "updated";
    }
    if (activeEdgeIndex === edgeIndex) return "active";
    if (lastAssignedEdgeIndex === edgeIndex) return "updated";
    if (wasUnknown[edgeIndex] && edges[edgeIndex][2] === -1) return "pending";
    if (assignedEdgeIndices.has(edgeIndex)) return "chosen";
    return "default";
  }

  function graphView() {
    return {
      layout: "circle",
      nodes: Array.from({ length: n }, (_, node) => ({
        id: node,
        label: String(node),
        sub: nodeSub(node),
        state: nodeState(node),
      })),
      edges: edges.map(([u, v, weight], edgeIndex) => ({
        u,
        v,
        label: weight === -1 ? "?" : String(weight),
        directed: false,
        state: edgeState(edgeIndex),
      })),
    };
  }

  function selectedTableNodes() {
    const selected = [];
    const seen = new Set();
    const add = (node) => {
      if (!Number.isSafeInteger(node) || node < 0 || node >= n) return;
      if (seen.has(node) || selected.length >= MAX_TABLE_ROWS) return;
      seen.add(node);
      selected.push(node);
    };

    add(activeNode);
    add(candidateNode);
    add(source);
    add(destination);
    for (let node = 0; node < n; node += 1) {
      if (Number.isFinite(verifyDistance[node])) add(node);
    }
    for (let node = 0; node < n; node += 1) {
      if (Number.isFinite(distFromSource[node])) add(node);
    }
    for (let node = 0; node < n; node += 1) {
      if (Number.isFinite(distToDestination[node])) add(node);
    }
    for (let node = 0; node < n; node += 1) add(node);

    if (selected.length < n) tracer.truncate();
    return selected.sort((left, right) => left - right);
  }

  function rowState(node) {
    if (verificationPathNodes.has(node)) {
      return verificationSucceeded === false ? "danger" : "success";
    }
    if (node === activeNode) return "active";
    if (node === candidateNode) return "candidate";
    if (node === destination) return "success";
    if (node === source) return "info";
    return "default";
  }

  function distanceCell(value, state) {
    return {
      value: distanceText(value),
      state: Number.isFinite(value) ? state : "muted",
    };
  }

  function distanceTable() {
    return {
      title: bi(
        `Khoảng cách theo đỉnh (tối đa ${MAX_TABLE_ROWS} hàng)`,
        `Per-node distances (up to ${MAX_TABLE_ROWS} rows)`,
      ),
      columns: [
        bi("cận dưới tới đích", "lower bound to destination"),
        bi("từ nguồn", "from source"),
        bi("xác minh", "verification"),
        bi("vai trò", "role"),
      ],
      rows: selectedTableNodes().map((node) => {
        const role = node === source && node === destination
          ? "source + destination"
          : node === source
            ? "source"
            : node === destination
              ? "destination"
              : "—";
        return {
          label: bi(`Đỉnh ${node}`, `Node ${node}`),
          state: rowState(node),
          cells: [
            distanceCell(distToDestination[node], "info"),
            distanceCell(distFromSource[node], "updated"),
            distanceCell(
              verifyDistance[node],
              verificationPathNodes.has(node) ? "success" : "computed",
            ),
            { value: role, state: role === "—" ? "muted" : "default" },
          ],
        };
      }),
    };
  }

  function heapQueue() {
    if (!activeHeap || activeHeap.size === 0) {
      return [{
        label: bi("Heap rỗng", "Empty heap"),
        sub: bi(`Giai đoạn: ${heapStage}`, `Stage: ${heapStage}`),
        state: "muted",
      }];
    }

    const directLimit = activeHeap.size > MAX_QUEUE_ITEMS
      ? MAX_QUEUE_ITEMS - 1
      : MAX_QUEUE_ITEMS;
    const items = activeHeap.snapshot(directLimit).map(([distance, node], index) => ({
      label: `(distance=${distance}, node=${node})`,
      sub: bi(
        `ô ${index} trong binary heap · ${heapStage}`,
        `binary-heap slot ${index} · ${heapStage}`,
      ),
      state: index === 0 ? "active" : "queued",
    }));

    if (activeHeap.size > directLimit) {
      tracer.truncate();
      items.push({
        label: `… +${activeHeap.size - directLimit}`,
        sub: bi("các entry heap còn lại", "remaining heap entries"),
        state: "muted",
      });
    }
    return items;
  }

  function rememberAssignment(record) {
    assignmentHistory.push(record);
    if (assignmentHistory.length > MAX_ASSIGNMENT_HISTORY) {
      assignmentHistory.shift();
      assignmentHistoryDropped += 1;
      tracer.truncate();
    }
  }

  function assignmentSequence() {
    const items = [];
    if (assignmentHistoryDropped > 0) {
      items.push({
        label: bi("Các phép gán trước đó", "Earlier assignments"),
        value: `… ${assignmentHistoryDropped}`,
        state: "muted",
      });
    }
    assignmentHistory.forEach((record) => {
      const reason = record.kind === "adaptive"
        ? `max(1, ${target} - ${record.fromDistance} - ${record.lowerBound}) = ${record.weight}`
        : `${MAX_EDGE_WEIGHT} (untouched)`;
      items.push({
        label: bi(
          `Gán cạnh #${record.edgeIndex}: ${record.u}—${record.v}`,
          `Assign edge #${record.edgeIndex}: ${record.u}—${record.v}`,
        ),
        value: reason,
        state: record.kind === "adaptive" ? "updated" : "warning",
      });
    });

    if (verificationPath.length) {
      const visiblePath = verificationPath.slice(0, MAX_PATH_ITEMS);
      if (visiblePath.length < verificationPath.length) tracer.truncate();
      visiblePath.forEach((node, index) => {
        items.push({
          label: bi(`Đường xác minh ${index + 1}`, `Verification path ${index + 1}`),
          value: node,
          state: verificationSucceeded === false ? "danger" : "success",
        });
      });
      if (visiblePath.length < verificationPath.length) {
        items.push({
          label: bi("Phần đường còn lại", "Remaining path"),
          value: `… +${verificationPath.length - visiblePath.length}`,
          state: "muted",
        });
      }
    }

    if (!items.length) {
      items.push({
        label: bi("Chưa gán cạnh -1", "No -1 edge assigned yet"),
        value: "—",
        state: "muted",
      });
    }
    return items;
  }

  function transitionItems() {
    if (!transition) {
      return [
        { label: bi("Giai đoạn heap", "Heap stage"), value: heapStage, state: "muted" },
        { label: bi("Chuyển cạnh", "Edge transition"), value: "—", state: "muted" },
      ];
    }
    return [
      { label: bi("Từ đỉnh", "From node"), value: transition.from, state: "active" },
      { label: bi("Qua cạnh", "Via edge"), value: `#${transition.edgeIndex}`, state: "active" },
      { label: bi("Tới đỉnh", "To node"), value: transition.to, state: "candidate" },
      { label: bi("Trọng số", "Weight"), value: transition.weight, state: transition.kind === "assign" ? "updated" : "default" },
      { label: bi("Khoảng cách ứng viên", "Candidate distance"), value: distanceText(transition.candidate), state: "candidate" },
      { label: bi("Giá trị trước", "Previous value"), value: distanceText(transition.previous), state: "muted" },
    ];
  }

  function lowerBoundSlack() {
    const lower = distToDestination[source];
    return Number.isFinite(lower) ? target - lower : "-∞";
  }

  function emitTrace({
    phaseIndex,
    codeLines,
    title,
    note,
    action,
    formula,
    final = false,
    answer = null,
  }) {
    if (traceSaturated && !final) return false;

    const emitted = tracer.emit({
      phaseIndex,
      codeLines,
      title,
      note,
      action,
      formula,
      vars: [
        { name: "stage", value: currentStage },
        { name: "node", value: activeNode === null ? "—" : activeNode },
        { name: "candidate_node", value: candidateNode === null ? "—" : candidateNode },
        { name: "target", value: target },
        { name: "assigned", value: counters.adaptiveAssignments + counters.sealedAssignments },
        { name: "heap_size", value: activeHeap ? activeHeap.size : 0 },
      ],
      arr: [],
      sub: [],
      highlight: [],
      mark: [],
      metrics: [
        { label: bi("Mục tiêu", "Target"), value: target, state: "info" },
        {
          label: bi("Cận dưới source→dest", "Source→destination lower bound"),
          value: distanceText(distToDestination[source]),
          state: Number.isFinite(distToDestination[source]) ? "computed" : "muted",
        },
        {
          label: bi("Khoảng cách forward", "Forward distance"),
          value: distanceText(distFromSource[destination]),
          state: Number.isFinite(distFromSource[destination]) ? "updated" : "muted",
        },
        {
          label: bi("Khoảng cách xác minh", "Verified distance"),
          value: distanceText(verifyDistance[destination]),
          state: verificationSucceeded === true
            ? "success"
            : verificationSucceeded === false
              ? "danger"
              : "muted",
        },
        {
          label: bi("Cạnh gán thích nghi", "Adaptive assignments"),
          value: counters.adaptiveAssignments,
          state: counters.adaptiveAssignments ? "updated" : "muted",
        },
        {
          label: bi("Kích thước heap", "Heap size"),
          value: activeHeap ? activeHeap.size : 0,
          state: activeHeap && activeHeap.size ? "active" : "muted",
        },
      ],
      graph: graphView(),
      table: distanceTable(),
      queue: heapQueue(),
      groups: [
        {
          title: bi("Transition Dijkstra hiện tại", "Current Dijkstra transition"),
          items: transitionItems(),
        },
        {
          title: bi("Bất biến và bộ đếm", "Invariants and counters"),
          items: [
            { label: bi("target - lower[source]", "target - lower[source]"), value: lowerBoundSlack(), state: "info" },
            { label: bi("Lần quét cạnh", "Edge scans"), value: counters.edgeScans, state: "default" },
            { label: bi("Relax cận dưới", "Lower-bound relaxations"), value: counters.reverseRelaxations, state: "computed" },
            { label: bi("Relax forward", "Forward relaxations"), value: counters.forwardRelaxations, state: "updated" },
            { label: bi("Relax xác minh", "Verification relaxations"), value: counters.verifyRelaxations, state: "success" },
            { label: bi("Cạnh khóa ở 2e9", "Edges sealed at 2e9"), value: counters.sealedAssignments, state: counters.sealedAssignments ? "warning" : "muted" },
          ],
        },
        {
          title: bi("Lịch sử gán trọng số (có giới hạn)", "Bounded weight-assignment history"),
          items: [
            { label: bi("Đã lưu", "Retained"), value: assignmentHistory.length, state: "updated" },
            { label: bi("Đã lược", "Omitted"), value: assignmentHistoryDropped, state: assignmentHistoryDropped ? "warning" : "muted" },
            { label: bi("Tổng đã gán", "Total assigned"), value: counters.adaptiveAssignments + counters.sealedAssignments, state: "info" },
          ],
        },
      ],
      sequence: assignmentSequence(),
      final,
      answer: final ? answer : null,
    });

    if (!emitted && !final) traceSaturated = true;
    return emitted;
  }

  currentStage = "graph";
  activeNode = source;
  candidateNode = destination;
  emitTrace({
    phaseIndex: 0,
    codeLines: PYTHON_LINES.graph,
    title: bi(
      `Dựng adjacency bằng ${edges.length} cạnh canonical`,
      `Build adjacency from ${edges.length} canonical edges`,
    ),
    note: bi(
      "Hai hướng của một cạnh giữ cùng edgeIndex, nên cạnh -1 vô hướng được gán đúng một lần và cả hai hướng thấy ngay trọng số mới.",
      "Both directions retain the same edgeIndex, so an undirected -1 edge is assigned once and both directions immediately observe the new weight.",
    ),
    action: bi("Dựng adjacency list theo edge index", "Build an edge-indexed adjacency list"),
    formula: bi("graph[u] và graph[v] cùng trỏ tới edges[i]", "graph[u] and graph[v] share edges[i]"),
  });

  function createHeap() {
    return new MinHeap((left, right) => left[0] - right[0] || left[1] - right[1]);
  }

  currentStage = "reverse";
  heapStage = "destination lower bounds";
  activeNode = destination;
  candidateNode = null;
  activeEdgeIndex = null;
  lastAssignedEdgeIndex = null;
  transition = null;
  activeHeap = createHeap();
  distToDestination[destination] = 0;
  activeHeap.push([0, destination]);
  emitTrace({
    phaseIndex: 1,
    codeLines: PYTHON_LINES.reverseStart,
    title: bi(
      `Bắt đầu Dijkstra cận dưới tại destination=${destination}`,
      `Start lower-bound Dijkstra at destination=${destination}`,
    ),
    note: bi(
      "Trong lượt này mọi cạnh -1 chỉ được ĐỌC như trọng số 1; mảng edges chưa bị sửa.",
      "During this pass every -1 edge is only READ as weight 1; edges is not mutated.",
    ),
    action: bi("Gieo heap đảo từ destination", "Seed the reverse heap from destination"),
    formula: bi("distToDest[destination] = 0", "distToDest[destination] = 0"),
  });

  while (activeHeap.size) {
    const [currentDistance, node] = activeHeap.pop();
    if (currentDistance !== distToDestination[node]) continue;
    counters.reversePops += 1;
    reverseSettled.add(node);
    activeNode = node;
    candidateNode = null;
    activeEdgeIndex = null;
    transition = null;
    emitTrace({
      phaseIndex: 1,
      codeLines: PYTHON_LINES.reversePop,
      title: bi(
        `Chốt cận dưới của đỉnh ${node} là ${currentDistance}`,
        `Settle node ${node}'s lower bound at ${currentDistance}`,
      ),
      note: bi(
        "MinHeap luôn lấy nhãn nhỏ nhất chưa xử lý; entry cũ bị bỏ qua bằng phép so sánh khoảng cách.",
        "MinHeap extracts the smallest unsettled label; stale entries are skipped by comparing distances.",
      ),
      action: bi("Pop nhãn cận dưới nhỏ nhất", "Pop the minimum lower-bound label"),
      formula: bi(`distToDest[${node}] = ${currentDistance}`, `distToDest[${node}] = ${currentDistance}`),
    });

    for (const { to: next, edgeIndex } of adjacency[node]) {
      counters.edgeScans += 1;
      const edgeWeight = edges[edgeIndex][2] === -1 ? 1 : edges[edgeIndex][2];
      const candidate = currentDistance + edgeWeight;
      const previous = distToDestination[next];
      if (candidate >= previous) continue;
      distToDestination[next] = candidate;
      activeHeap.push([candidate, next]);
      counters.reverseRelaxations += 1;
      candidateNode = next;
      activeEdgeIndex = edgeIndex;
      transition = {
        kind: "reverse-relax",
        from: node,
        to: next,
        edgeIndex,
        weight: edgeWeight,
        candidate,
        previous,
      };
      emitTrace({
        phaseIndex: 1,
        codeLines: PYTHON_LINES.reverseRelax,
        title: bi(
          `Cập nhật cận dưới của ${next}: ${distanceText(previous)} → ${candidate}`,
          `Update node ${next}'s lower bound: ${distanceText(previous)} → ${candidate}`,
        ),
        note: wasUnknown[edgeIndex]
          ? bi("Cạnh -1 đang dùng trọng số tạm 1, không sửa cạnh gốc.", "The -1 edge uses temporary weight 1 without mutating the original edge.")
          : bi("Relax bằng trọng số cố định của cạnh.", "Relax with the edge's fixed weight."),
        action: bi("Relax khoảng cách tới destination", "Relax distance to destination"),
        formula: bi(
          `distToDest[${next}] = ${currentDistance} + ${edgeWeight} = ${candidate}`,
          `distToDest[${next}] = ${currentDistance} + ${edgeWeight} = ${candidate}`,
        ),
      });
    }
  }

  currentStage = "feasibility";
  heapStage = "lower bounds complete";
  activeNode = source;
  candidateNode = destination;
  activeEdgeIndex = null;
  transition = null;
  const minimumPossible = distToDestination[source];
  const lowerBoundFeasible = minimumPossible <= target;
  emitTrace({
    phaseIndex: 2,
    codeLines: PYTHON_LINES.feasible,
    title: lowerBoundFeasible
      ? bi(
        `Cận dưới ${minimumPossible} không vượt target ${target}`,
        `Lower bound ${minimumPossible} does not exceed target ${target}`,
      )
      : bi(
        `Cận dưới ${distanceText(minimumPossible)} vượt target ${target}`,
        `Lower bound ${distanceText(minimumPossible)} exceeds target ${target}`,
      ),
    note: lowerBoundFeasible
      ? bi(
        "Có thể tăng một số cạnh -1; Dijkstra forward sẽ chọn đúng mức tăng khi cạnh được gặp lần đầu.",
        "Some -1 edges may be increased; the forward Dijkstra will choose the increase when each edge is first encountered.",
      )
      : bi(
        "Ngay cả khi mọi cạnh -1 bằng 1, đường ngắn nhất vẫn quá dài (hoặc không tồn tại), nên không có nghiệm.",
        "Even with every -1 edge equal to 1, the shortest path is too long (or absent), so no solution exists.",
      ),
    action: bi("So sánh cận dưới với target", "Compare the lower bound with target"),
    formula: bi(
      `${distanceText(minimumPossible)} ≤ ${target} ?`,
      `${distanceText(minimumPossible)} ≤ ${target} ?`,
    ),
  });

  if (!lowerBoundFeasible) {
    currentStage = "verify";
    heapStage = "verification skipped";
    activeNode = null;
    candidateNode = null;
    emitTrace({
      phaseIndex: 5,
      codeLines: PYTHON_LINES.feasible,
      title: bi("Bất khả thi đã được chứng minh bằng cận dưới", "Impossibility is certified by the lower bound"),
      note: bi(
        "Không cần chạy Dijkstra forward hay thử từng cạnh -1; cận dưới đã lớn hơn target.",
        "No forward Dijkstra or per-unknown-edge retries are needed; the lower bound already exceeds target.",
      ),
      action: bi("Bỏ qua xác minh candidate không tồn tại", "Skip verification because no candidate exists"),
      formula: bi("minimumPossible > target ⇒ []", "minimumPossible > target ⇒ []"),
    });

    currentStage = "result";
    verificationSucceeded = false;
    emitTrace({
      phaseIndex: 6,
      codeLines: PYTHON_LINES.feasible,
      title: bi("Trả về mảng rỗng", "Return an empty array"),
      note: bi("Không tồn tại phép gán trọng số hợp lệ.", "No valid weight assignment exists."),
      action: bi("Hoàn tất với impossible", "Finish as impossible"),
      formula: bi("answer = []", "answer = []"),
      final: true,
      answer: [],
    });

    return {
      original: {
        n,
        edges: originalEdges.map((edge) => [...edge]),
        source,
        destination,
        target,
      },
      answer: [],
      steps: tracer.finish(),
    };
  }

  currentStage = "forward";
  heapStage = "source assignment pass";
  activeNode = source;
  candidateNode = null;
  activeEdgeIndex = null;
  lastAssignedEdgeIndex = null;
  transition = null;
  activeHeap = createHeap();
  distFromSource[source] = 0;
  activeHeap.push([0, source]);
  emitTrace({
    phaseIndex: 3,
    codeLines: PYTHON_LINES.forwardStart,
    title: bi(
      `Bắt đầu Dijkstra forward tại source=${source}`,
      `Start the forward Dijkstra at source=${source}`,
    ),
    note: bi(
      "Mỗi adjacency entry giữ edgeIndex dùng chung; chỉ lần đầu cạnh còn -1 mới thực hiện phép gán.",
      "Each adjacency entry keeps the shared edgeIndex; assignment occurs only the first time the edge is still -1.",
    ),
    action: bi("Gieo khoảng cách từ source", "Seed distances from source"),
    formula: bi("distFromSource[source] = 0", "distFromSource[source] = 0"),
  });

  while (activeHeap.size) {
    const [currentDistance, node] = activeHeap.pop();
    if (currentDistance !== distFromSource[node]) continue;
    counters.forwardPops += 1;
    forwardSettled.add(node);
    activeNode = node;
    candidateNode = null;
    activeEdgeIndex = null;
    lastAssignedEdgeIndex = null;
    transition = null;
    emitTrace({
      phaseIndex: 3,
      codeLines: PYTHON_LINES.forwardPop,
      title: bi(
        `Chốt distFromSource[${node}] = ${currentDistance}`,
        `Settle distFromSource[${node}] = ${currentDistance}`,
      ),
      note: bi(
        "Vì mọi trọng số đã thấy đều dương, nhãn non-stale lấy từ MinHeap là khoảng cách ngắn nhất cuối cùng của đỉnh này.",
        "Because every observed weight is positive, the non-stale label extracted from MinHeap is this node's final shortest distance.",
      ),
      action: bi("Pop khoảng cách forward nhỏ nhất", "Pop the minimum forward distance"),
      formula: bi(`distFromSource[${node}] = ${currentDistance}`, `distFromSource[${node}] = ${currentDistance}`),
    });

    for (const { to: next, edgeIndex } of adjacency[node]) {
      counters.edgeScans += 1;
      candidateNode = next;
      activeEdgeIndex = edgeIndex;
      let weight = edges[edgeIndex][2];

      if (weight === -1) {
        const needed = target - currentDistance - distToDestination[next];
        weight = Math.min(MAX_EDGE_WEIGHT, Math.max(1, needed));
        edges[edgeIndex][2] = weight;
        assignedEdgeIndices.add(edgeIndex);
        lastAssignedEdgeIndex = edgeIndex;
        counters.adaptiveAssignments += 1;
        rememberAssignment({
          kind: "adaptive",
          edgeIndex,
          u: edges[edgeIndex][0],
          v: edges[edgeIndex][1],
          from: node,
          to: next,
          fromDistance: currentDistance,
          lowerBound: requiredText(distToDestination[next]),
          needed: requiredText(needed),
          weight,
        });
        transition = {
          kind: "assign",
          from: node,
          to: next,
          edgeIndex,
          weight,
          candidate: currentDistance + weight,
          previous: distFromSource[next],
        };
        emitTrace({
          phaseIndex: 3,
          codeLines: PYTHON_LINES.assign,
          title: bi(
            `Gán cạnh #${edgeIndex} (${edges[edgeIndex][0]}—${edges[edgeIndex][1]}) = ${weight}`,
            `Assign edge #${edgeIndex} (${edges[edgeIndex][0]}—${edges[edgeIndex][1]}) = ${weight}`,
          ),
          note: bi(
            "Đây là lần đầu cạnh canonical này được xử lý. Trọng số được chặn trong [1, 2·10⁹] và được dùng ngay ở cả hai hướng.",
            "This is the first processing of this canonical edge. Its weight is clamped to [1, 2·10⁹] and immediately shared by both directions.",
          ),
          action: bi("Gán trọng số thích nghi cho cạnh -1", "Adaptively assign the -1 edge"),
          formula: bi(
            `w = max(1, ${target} - ${currentDistance} - ${requiredText(distToDestination[next])}) = ${weight}`,
            `w = max(1, ${target} - ${currentDistance} - ${requiredText(distToDestination[next])}) = ${weight}`,
          ),
        });
      }

      const candidate = currentDistance + weight;
      const previous = distFromSource[next];
      if (candidate >= previous) continue;
      distFromSource[next] = candidate;
      activeHeap.push([candidate, next]);
      counters.forwardRelaxations += 1;
      transition = {
        kind: "forward-relax",
        from: node,
        to: next,
        edgeIndex,
        weight,
        candidate,
        previous,
      };
      emitTrace({
        phaseIndex: 3,
        codeLines: PYTHON_LINES.forwardRelax,
        title: bi(
          `Relax distFromSource[${next}]: ${distanceText(previous)} → ${candidate}`,
          `Relax distFromSource[${next}]: ${distanceText(previous)} → ${candidate}`,
        ),
        note: bi(
          "Relax bình thường bằng trọng số hiện tại của cạnh canonical; không chạy lại Dijkstra cho riêng cạnh này.",
          "Perform a normal relaxation with the canonical edge's current weight; no per-edge Dijkstra rerun occurs.",
        ),
        action: bi("Cập nhật khoảng cách forward", "Update the forward distance"),
        formula: bi(
          `distFromSource[${next}] = ${currentDistance} + ${weight} = ${candidate}`,
          `distFromSource[${next}] = ${currentDistance} + ${weight} = ${candidate}`,
        ),
      });
    }
  }

  currentStage = "finalize";
  heapStage = "assignment pass complete";
  activeNode = null;
  candidateNode = null;
  activeEdgeIndex = null;
  transition = null;
  let finalizedNow = 0;
  edges.forEach((edge, edgeIndex) => {
    if (edge[2] !== -1) return;
    edge[2] = MAX_EDGE_WEIGHT;
    assignedEdgeIndices.add(edgeIndex);
    lastAssignedEdgeIndex = edgeIndex;
    counters.sealedAssignments += 1;
    finalizedNow += 1;
    rememberAssignment({
      kind: "sealed",
      edgeIndex,
      u: edge[0],
      v: edge[1],
      fromDistance: "—",
      lowerBound: "—",
      weight: MAX_EDGE_WEIGHT,
    });
  });
  emitTrace({
    phaseIndex: 4,
    codeLines: PYTHON_LINES.finalize,
    title: finalizedNow
      ? bi(
        `Khóa ${finalizedNow} cạnh chưa gặp ở trọng số ${MAX_EDGE_WEIGHT}`,
        `Seal ${finalizedNow} untouched edges at weight ${MAX_EDGE_WEIGHT}`,
      )
      : bi("Mọi cạnh -1 đã được xử lý", "Every -1 edge was processed"),
    note: finalizedNow
      ? bi(
        "Các cạnh này không được tiếp cận từ source trong forward pass; đặt 2·10⁹ bảo đảm output hợp lệ mà không tạo đường tắt mới.",
        "These edges were unreachable from source in the forward pass; assigning 2·10⁹ makes the output valid without creating a new shortcut.",
      )
      : bi(
        "Không còn trọng số -1; mọi trọng số output hiện nằm trong [1, 2·10⁹].",
        "No -1 weight remains; every output weight is now in [1, 2·10⁹].",
      ),
    action: bi("Hoàn thiện toàn bộ trọng số", "Finalize every edge weight"),
    formula: bi("cạnh -1 còn lại → 2·10⁹", "remaining -1 edge → 2·10⁹"),
  });

  currentStage = "verify";
  heapStage = "independent verification";
  activeNode = source;
  candidateNode = null;
  activeEdgeIndex = null;
  lastAssignedEdgeIndex = null;
  transition = null;
  activeHeap = createHeap();
  const predecessorNode = Array(n).fill(-1);
  const predecessorEdge = Array(n).fill(-1);
  verifyDistance[source] = 0;
  activeHeap.push([0, source]);
  emitTrace({
    phaseIndex: 5,
    codeLines: PYTHON_LINES.verify,
    title: bi("Chạy Dijkstra xác minh độc lập", "Run an independent verification Dijkstra"),
    note: bi(
      "Lượt này chỉ dùng các trọng số cuối cùng; không còn cách diễn giải tạm cho cạnh -1.",
      "This pass uses only final weights; no temporary interpretation of -1 edges remains.",
    ),
    action: bi("Gieo heap xác minh", "Seed the verification heap"),
    formula: bi("verifyDistance[source] = 0", "verifyDistance[source] = 0"),
  });

  while (activeHeap.size) {
    const [currentDistance, node] = activeHeap.pop();
    if (currentDistance !== verifyDistance[node]) continue;
    counters.verifyPops += 1;
    verifySettled.add(node);
    activeNode = node;
    candidateNode = null;
    activeEdgeIndex = null;
    transition = null;

    for (const { to: next, edgeIndex } of adjacency[node]) {
      counters.edgeScans += 1;
      const weight = edges[edgeIndex][2];
      const candidate = currentDistance + weight;
      const previous = verifyDistance[next];
      if (candidate >= previous) continue;
      verifyDistance[next] = candidate;
      predecessorNode[next] = node;
      predecessorEdge[next] = edgeIndex;
      activeHeap.push([candidate, next]);
      counters.verifyRelaxations += 1;
      candidateNode = next;
      activeEdgeIndex = edgeIndex;
      transition = {
        kind: "verify-relax",
        from: node,
        to: next,
        edgeIndex,
        weight,
        candidate,
        previous,
      };
      emitTrace({
        phaseIndex: 5,
        codeLines: PYTHON_LINES.verify,
        title: bi(
          `Xác minh relax ${node}→${next}: ${distanceText(previous)} → ${candidate}`,
          `Verification relax ${node}→${next}: ${distanceText(previous)} → ${candidate}`,
        ),
        note: bi(
          "Cập nhật này thuộc Dijkstra cuối cùng dùng toàn bộ trọng số đã gán.",
          "This update belongs to the final Dijkstra over all assigned weights.",
        ),
        action: bi("Relax trong lượt xác minh", "Relax during verification"),
        formula: bi(
          `verifyDistance[${next}] = ${currentDistance} + ${weight} = ${candidate}`,
          `verifyDistance[${next}] = ${currentDistance} + ${weight} = ${candidate}`,
        ),
      });
    }
  }

  if (Number.isFinite(verifyDistance[destination])) {
    const reversedNodes = [];
    const reversedEdges = [];
    let cursor = destination;
    let guard = 0;
    while (cursor !== source && cursor !== -1 && guard <= n) {
      reversedNodes.push(cursor);
      const edgeIndex = predecessorEdge[cursor];
      if (edgeIndex === -1) break;
      reversedEdges.push(edgeIndex);
      cursor = predecessorNode[cursor];
      guard += 1;
    }
    if (cursor === source) {
      reversedNodes.push(source);
      verificationPath = reversedNodes.reverse();
      reversedEdges.reverse().forEach((edgeIndex) => verificationPathEdges.add(edgeIndex));
      verificationPath.forEach((node) => verificationPathNodes.add(node));
    }
  }

  verificationSucceeded = verifyDistance[destination] === target;
  currentStage = "verify";
  heapStage = "verification complete";
  activeNode = destination;
  candidateNode = null;
  activeEdgeIndex = null;
  transition = null;
  emitTrace({
    phaseIndex: 5,
    codeLines: PYTHON_LINES.verify,
    title: verificationSucceeded
      ? bi(
        `Đã xác minh shortest(${source}, ${destination}) = ${target}`,
        `Verified shortest(${source}, ${destination}) = ${target}`,
      )
      : bi(
        `Xác minh nhận ${distanceText(verifyDistance[destination])}, không phải ${target}`,
        `Verification found ${distanceText(verifyDistance[destination])}, not ${target}`,
      ),
    note: verificationSucceeded
      ? bi(
        "Dijkstra cuối xác nhận không có đường nào ngắn hơn target và có ít nhất một đường đúng target.",
        "The final Dijkstra confirms that no path is shorter than target and at least one path equals target.",
      )
      : bi(
        "Candidate không thỏa điều kiện shortest path chính xác nên phải trả mảng rỗng.",
        "The candidate fails the exact shortest-path condition, so an empty array must be returned.",
      ),
    action: bi("So sánh khoảng cách xác minh với target", "Compare the verified distance with target"),
    formula: bi(
      `${distanceText(verifyDistance[destination])} === ${target}`,
      `${distanceText(verifyDistance[destination])} === ${target}`,
    ),
  });

  const answer = verificationSucceeded ? edges.map((edge) => [...edge]) : [];
  currentStage = "result";
  heapStage = "complete";
  activeNode = destination;
  candidateNode = null;
  activeEdgeIndex = null;
  transition = null;
  emitTrace({
    phaseIndex: 6,
    codeLines: verificationSucceeded ? PYTHON_LINES.finish : PYTHON_LINES.impossible,
    title: verificationSucceeded
      ? bi("Trả về các cạnh đã gán", "Return the assigned edges")
      : bi("Trả về mảng rỗng", "Return an empty array"),
    note: verificationSucceeded
      ? bi(
        "Mọi trọng số thuộc [1, 2·10⁹] và shortest(source,destination) bằng target.",
        "Every weight lies in [1, 2·10⁹], and shortest(source,destination) equals target.",
      )
      : bi(
        "Không xuất candidate chưa xác minh; kết quả impossible được biểu diễn bằng [].",
        "No unverified candidate is emitted; impossibility is represented by [].",
      ),
    action: bi("Hoàn tất thuật toán", "Complete the algorithm"),
    formula: verificationSucceeded
      ? bi("answer = assigned edges", "answer = assigned edges")
      : bi("answer = []", "answer = []"),
    final: true,
    answer,
  });

  return {
    original: {
      n,
      edges: originalEdges.map((edge) => [...edge]),
      source,
      destination,
      target,
    },
    answer,
    steps: tracer.finish(),
  };
}

module.exports = {
  2699: {
    id: 2699,
    difficulty: "hard",
    slug: "modify-graph-edge-weights",
    category: { key: "graph", ...bi("Đồ thị / Dijkstra", "Graph / Dijkstra") },
    tags: [
      { key: "graph", ...bi("Đồ thị", "Graph") },
      { key: "dijkstra", ...bi("Dijkstra hai chiều", "Bidirectional Dijkstra reasoning") },
      { key: "greedy", ...bi("Gán tham lam có cận dưới", "Lower-bound greedy assignment") },
      { key: "shortest-path", ...bi("Đường đi ngắn nhất", "Shortest Path") },
    ],
    title: bi("Điều chỉnh trọng số cạnh đồ thị", "Modify Graph Edge Weights"),
    titleVi: bi(
      "Dijkstra cận dưới + gán cạnh -1 một lần",
      "Lower-bound Dijkstra + one-time -1 edge assignment",
    ),
    statement: bi(
      "Cho đồ thị vô hướng có trọng số edges=[u,v,w], trong đó w=-1 là chưa biết và w>0 là cố định. Hãy thay mọi -1 bằng số nguyên trong [1,2·10⁹] sao cho đường đi ngắn nhất từ source tới destination bằng đúng target; nếu không thể, trả [].",
      "Given a weighted undirected graph edges=[u,v,w], where w=-1 is unknown and w>0 is fixed, replace every -1 with an integer in [1,2·10⁹] so the shortest source-to-destination path equals target; return [] if impossible.",
    ),
    defaultInput: DEFAULT_INPUT,
    defaults: {
      input: DEFAULT_INPUT,
      n: DEFAULT_N,
      source: DEFAULT_SOURCE,
      destination: DEFAULT_DESTINATION,
      target: DEFAULT_TARGET,
    },
    expectedAnswer: [[0, 1, 4], [1, 3, 2], [0, 2, 2], [2, 3, 5]],
    inputKind: "string",
    inputLabel: bi(
      `Cạnh vô hướng [u,v,w] dạng JSON hoặc u,v,w;... (tối đa ${MAX_EDGES})`,
      `Undirected [u,v,w] edges as JSON or u,v,w;... (up to ${MAX_EDGES})`,
    ),
    extraParams: [
      {
        key: "n",
        type: "number",
        min: 2,
        max: MAX_NODES,
        default: DEFAULT_N,
        label: bi("n (số đỉnh nhỏ)", "n (small node count)"),
      },
      {
        key: "source",
        type: "number",
        min: 0,
        max: MAX_NODES - 1,
        default: DEFAULT_SOURCE,
        label: bi("Đỉnh nguồn", "Source node"),
      },
      {
        key: "destination",
        type: "number",
        min: 0,
        max: MAX_NODES - 1,
        default: DEFAULT_DESTINATION,
        label: bi("Đỉnh đích", "Destination node"),
      },
      {
        key: "target",
        type: "number",
        min: 1,
        max: MAX_EDGE_WEIGHT,
        default: DEFAULT_TARGET,
        label: bi("Độ dài shortest path mục tiêu", "Target shortest-path length"),
      },
    ],
    visualizationLimits: {
      maxNodes: MAX_NODES,
      maxEdges: MAX_EDGES,
      maxEdgeWeight: MAX_EDGE_WEIGHT,
      maxTraceSteps: MAX_TRACE_STEPS,
      maxTableRows: MAX_TABLE_ROWS,
      maxHeapItemsPerFrame: MAX_QUEUE_ITEMS,
      maxAssignmentHistory: MAX_ASSIGNMENT_HISTORY,
      note: bi(
        "Trace, bảng, heap và lịch sử được chặn kích thước; ba lượt Dijkstra vẫn chạy đầy đủ trên mọi input được chấp nhận.",
        "Trace, table, heap, and history sizes are bounded; all three Dijkstra passes still run fully on every accepted input.",
      ),
    },
    approach: [
      bi(
        "Dựng adjacency chứa edgeIndex ở cả hai hướng để mọi lần đọc/sửa một cạnh vô hướng dùng chung đúng một hàng edges.",
        "Store each edgeIndex in both adjacency directions so every read/write of an undirected edge shares one canonical edges row.",
      ),
      bi(
        "Chạy Dijkstra từ destination với mọi -1 tạm bằng 1 để lấy distToDestination, là cận dưới nhỏ nhất có thể. Nếu cận dưới tại source vượt target thì impossible.",
        "Run Dijkstra from destination with every -1 temporarily equal to 1. This gives the minimum possible distToDestination; if its source value exceeds target, the instance is impossible.",
      ),
      bi(
        "Chạy Dijkstra từ source. Khi lần đầu xử lý cạnh -1 (u,v), gán max(1,target-distFromSource[u]-distToDestination[v]) trong [1,2·10⁹], rồi relax bình thường.",
        "Run Dijkstra from source. On first processing an unknown (u,v), assign max(1,target-distFromSource[u]-distToDestination[v]) within [1,2·10⁹], then relax normally.",
      ),
      bi(
        "Đặt mọi cạnh -1 chưa tiếp cận thành 2·10⁹ và chạy một Dijkstra độc lập trên trọng số cuối. Chỉ trả edges khi shortest(source,destination)==target.",
        "Set every untouched -1 edge to 2·10⁹ and run an independent Dijkstra over final weights. Return edges only when shortest(source,destination)==target.",
      ),
    ],
    complexity: {
      time: "O((V + E) log V)",
      space: "O(V + E)",
      note: bi(
        "Ba lượt Dijkstra là một số hằng lượt; mỗi lượt dùng MinHeap và quét mỗi hướng cạnh một lần. Không chạy Dijkstra riêng cho từng cạnh -1.",
        "Three Dijkstra passes are a constant number of runs; each uses a MinHeap and scans every directed edge incidence once. No Dijkstra run is repeated per unknown edge.",
      ),
    },
    debugMode: "semantic",
    code: MODIFY_GRAPH_EDGE_WEIGHTS_2699_SOURCE,
    parser: parseModifyGraphEdgeWeights2699Input,
    parseModifyGraphEdgeWeights2699Input,
    liveArgs(input, params = {}) {
      const parsedInput = parseModifyGraphEdgeWeights2699Input(input, params);
      return [
        parsedInput.n,
        parsedInput.edges.map((edge) => [...edge]),
        parsedInput.source,
        parsedInput.destination,
        parsedInput.target,
      ];
    },
    builder: buildModifyGraphEdgeWeights2699,
  },
};
