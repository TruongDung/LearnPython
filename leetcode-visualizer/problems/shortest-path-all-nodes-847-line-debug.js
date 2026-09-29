// Instruction-level traces for LC 847: Shortest Path Visiting All Nodes.
// Both approaches execute the exact Python source exposed in metadata.

const label = (vi, en) => ({ vi, en });
const TRACE_LIMIT = 8000;
const MAX_VISIBLE_STATES = 48;

const code = [
  "from collections import deque",
  "",
  "class Solution:",
  "    def shortestPathLength(self, graph):",
  "        n = len(graph)",
  "        if n == 1:",
  "            return 0",
  "        full = (1 << n) - 1",
  "        visited = {(node, 1 << node) for node in range(n)}",
  "        queue = deque((node, 1 << node, 0) for node in range(n))",
  "        while queue:",
  "            node, mask, dist = queue.popleft()",
  "            for neighbor in graph[node]:",
  "                new_mask = mask | (1 << neighbor)",
  "                if new_mask == full:",
  "                    return dist + 1",
  "                if (neighbor, new_mask) in visited:",
  "                    continue",
  "                visited.add((neighbor, new_mask))",
  "                queue.append((neighbor, new_mask, dist + 1))",
  "        return -1",
];

const code2 = [
  "class Solution:",
  "    def shortestPathLength(self, graph):",
  "        n = len(graph)",
  "        if n == 1:",
  "            return 0",
  "        INF = float('inf')",
  "        distances = [[INF] * n for _ in range(n)]",
  "        for node in range(n):",
  "            distances[node][node] = 0",
  "            for neighbor in graph[node]:",
  "                distances[node][neighbor] = 1",
  "        for via in range(n):",
  "            for left in range(n):",
  "                for right in range(n):",
  "                    candidate = distances[left][via] + distances[via][right]",
  "                    if candidate < distances[left][right]:",
  "                        distances[left][right] = candidate",
  "        full = (1 << n) - 1",
  "        dp = [[INF] * n for _ in range(1 << n)]",
  "        for node in range(n):",
  "            dp[1 << node][node] = 0",
  "        for mask in range(1 << n):",
  "            for end in range(n):",
  "                if dp[mask][end] == INF:",
  "                    continue",
  "                for neighbor in range(n):",
  "                    if mask & (1 << neighbor):",
  "                        continue",
  "                    new_mask = mask | (1 << neighbor)",
  "                    candidate = dp[mask][end] + distances[end][neighbor]",
  "                    if candidate < dp[new_mask][neighbor]:",
  "                        dp[new_mask][neighbor] = candidate",
  "        answer = min(dp[full])",
  "        return -1 if answer == INF else answer",
];

function parseAdjacency(input) {
  const rows = String(input ?? "").split("|").map((row) => row.trim());
  const n = rows.length;
  if (n < 1 || n > 12) throw new Error("Visualizer hỗ trợ graph từ 1 đến 12 nodes");
  return rows.map((row) => {
    if (!row) return [];
    const tokens = row.split(",").map((token) => token.trim());
    if (tokens.some((token) => token === "")) throw new Error("Adjacency row chứa neighbor rỗng");
    const neighbors = tokens.map(Number);
    if (neighbors.some((neighbor) => !Number.isInteger(neighbor) || neighbor < 0 || neighbor >= n)) {
      throw new Error(`Mỗi neighbor phải là số nguyên trong [0, ${n - 1}]`);
    }
    return [...new Set(neighbors)];
  });
}

function graphEdges(adjacency) {
  const edges = [];
  const seen = new Set();
  adjacency.forEach((neighbors, node) => neighbors.forEach((neighbor) => {
    const key = node < neighbor ? `${node}-${neighbor}` : `${neighbor}-${node}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ u: node, v: neighbor });
  }));
  return edges;
}

function maskBits(mask, n) {
  return Number.isInteger(mask) ? mask.toString(2).padStart(n, "0") : "—";
}

function maskNodes(mask, n) {
  if (!Number.isInteger(mask)) return [];
  return Array.from({ length: n }, (_, node) => node).filter((node) => mask & (1 << node));
}

function cloneState(state, n) {
  if (!state) return null;
  return {
    node: state.node,
    mask: state.mask,
    bits: maskBits(state.mask, n),
    visited: maskNodes(state.mask, n),
    dist: state.dist,
  };
}

function displayNumber(value) {
  return value === Infinity ? "∞" : value;
}

function buildBfsTrace(adjacency) {
  const n = adjacency.length;
  const edges = graphEdges(adjacency);
  const steps = [];
  let omittedInstructions = 0;
  let fullMask = null;
  let visited = null;
  let queue = null;
  let current = null;
  let candidate = null;
  let neighbor = null;
  let answer = null;

  function record(line, operation, options = {}) {
    if (steps.length >= TRACE_LIMIT && !options.final) {
      omittedInstructions++;
      return;
    }
    const displayState = options.displayState || candidate || current || queue?.[0] || null;
    const state = cloneState(displayState, n);
    const queueStates = (queue || []).slice(0, MAX_VISIBLE_STATES).map((item) => cloneState(item, n));
    const candidateState = cloneState(candidate, n);
    const visitedNodes = state ? state.visited : [];
    const phase = options.phase || (line <= 10 ? "setup" : line <= 20 ? "bfs" : "result");
    steps.push({
      title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [line],
      vars: [
        { name: "operation", value: operation },
        { name: "node", value: current?.node ?? "—" },
        { name: "mask", value: current ? maskBits(current.mask, n) : "—" },
        { name: "dist", value: current?.dist ?? "—" },
        { name: "neighbor", value: neighbor ?? "—" },
        { name: "new_mask", value: candidate ? maskBits(candidate.mask, n) : "—" },
        { name: "queue size", value: queue?.length ?? "—" },
        { name: "visited states", value: visited?.size ?? "—" },
      ],
      note: options.note || label("Mỗi snapshot phản ánh đúng một câu lệnh Bitmask BFS.", "Each snapshot reflects exactly one Bitmask BFS instruction."),
      graph: {
        nodes: Array.from({ length: n }, (_, node) => ({ id: node, label: String(node) })),
        edges,
        hlNodes: [current?.node, neighbor].filter(Number.isInteger),
        hlEdges: Number.isInteger(current?.node) && Number.isInteger(neighbor) ? [[current.node, neighbor]] : [],
        visitedNodes,
      },
      visitAll847View: {
        approach: 1,
        lineByLine: true,
        phase,
        operation,
        n,
        adjacency: adjacency.map((row) => [...row]),
        nodes: Array.from({ length: n }, (_, node) => ({
          id: node,
          active: node === state?.node,
          visited: visitedNodes.includes(node),
        })),
        edges,
        fullMask,
        fullBits: maskBits(fullMask, n),
        bits: state ? state.bits : "—",
        currentNode: state?.node ?? null,
        visited: visitedNodes,
        dist: state?.dist ?? null,
        currentState: cloneState(current, n),
        candidateState,
        neighbor,
        queue: queueStates,
        frontier: queueStates,
        nextFrontier: candidateState ? [candidateState] : [],
        frontierTotal: queue?.length || 0,
        nextFrontierTotal: candidateState ? 1 : 0,
        omittedFrontier: Math.max(0, (queue?.length || 0) - MAX_VISIBLE_STATES),
        omittedNext: 0,
        visitedStateCount: visited?.size || 0,
        complete: Boolean(options.final && answer !== -1),
        distanceMatrix: null,
        popcount: state ? state.visited.length : null,
        dpValue: null,
        dpRow: null,
        candidateValue: null,
        indices: null,
        omittedInstructions,
        answer: options.final ? answer : null,
      },
    });
  }

  record(4, "enter", { phase: "setup" });
  record(5, "read-n", { phase: "setup", note: label(`n = ${n}.`, `n = ${n}.`) });
  const singleNode = n === 1;
  record(6, "single-node-check", { phase: "setup", note: label(`n == 1 là ${singleNode}.`, `n == 1 is ${singleNode}.`) });
  if (singleNode) {
    answer = 0;
    current = { node: 0, mask: 1, dist: 0 };
    record(7, "return-zero", { phase: "result", final: true });
    return { adj: adjacency, answer, steps };
  }

  fullMask = (1 << n) - 1;
  record(8, "full-mask", { phase: "setup", note: label(`Target mask = ${maskBits(fullMask, n)}.`, `Target mask = ${maskBits(fullMask, n)}.`) });
  visited = new Set(Array.from({ length: n }, (_, node) => `${node},${1 << node}`));
  record(9, "visited-init", { phase: "setup" });
  queue = Array.from({ length: n }, (_, node) => ({ node, mask: 1 << node, dist: 0 }));
  record(10, "queue-init", { phase: "setup", displayState: queue[0] });

  while (queue.length) {
    record(11, "queue-check", { phase: "bfs", note: label("Queue chưa rỗng.", "The queue is not empty.") });
    current = queue.shift();
    candidate = null;
    neighbor = null;
    record(12, "dequeue", { phase: "bfs" });
    for (const next of adjacency[current.node]) {
      neighbor = next;
      candidate = null;
      record(13, "neighbor-loop", { phase: "bfs" });
      const newMask = current.mask | (1 << next);
      candidate = { node: next, mask: newMask, dist: current.dist + 1 };
      record(14, "mask-or", { phase: "bfs", displayState: candidate });
      const complete = newMask === fullMask;
      record(15, "full-mask-check", {
        phase: "bfs",
        displayState: candidate,
        note: label(`${maskBits(newMask, n)} ${complete ? "==" : "!="} ${maskBits(fullMask, n)}.`, `${maskBits(newMask, n)} ${complete ? "==" : "!="} ${maskBits(fullMask, n)}.`),
      });
      if (complete) {
        answer = current.dist + 1;
        record(16, "return-distance", { phase: "result", displayState: candidate, final: true });
        return { adj: adjacency, answer, steps };
      }

      const key = `${next},${newMask}`;
      const alreadyVisited = visited.has(key);
      record(17, "visited-check", {
        phase: "bfs",
        displayState: candidate,
        note: alreadyVisited
          ? label("State (node, mask) này đã được BFS thấy trước đó.", "BFS has already seen this (node, mask) state.")
          : label("Đây là một state mới.", "This is a new state."),
      });
      if (alreadyVisited) {
        record(18, "continue", { phase: "bfs", displayState: candidate });
        candidate = null;
        continue;
      }

      visited.add(key);
      record(19, "visited-add", { phase: "bfs", displayState: candidate });
      queue.push({ ...candidate });
      record(20, "enqueue", { phase: "bfs", displayState: candidate });
      candidate = null;
    }
  }

  record(11, "queue-check", { phase: "bfs", note: label("Queue đã rỗng.", "The queue is empty.") });
  answer = -1;
  record(21, "return-empty", { phase: "result", final: true });
  return { adj: adjacency, answer, steps };
}

function buildDpTrace(adjacency) {
  const n = adjacency.length;
  const edges = graphEdges(adjacency);
  const steps = [];
  let omittedInstructions = 0;
  let distances = null;
  let fullMask = null;
  let dp = null;
  let answer = null;
  let current = {};

  function record(line, operation, options = {}) {
    if (steps.length >= TRACE_LIMIT && !options.final) {
      omittedInstructions++;
      return;
    }
    const destinationFocused = Number.isInteger(current.newMask) && line >= 29;
    const activeMask = destinationFocused ? current.newMask : Number.isInteger(current.mask) ? current.mask : null;
    const activeEnd = destinationFocused ? current.neighbor : current.end;
    const currentNode = Number.isInteger(activeEnd) ? activeEnd
      : Number.isInteger(current.right) ? current.right : null;
    const visitedNodes = maskNodes(activeMask, n);
    const phase = options.phase || (line <= 6 ? "setup" : line <= 17 ? "floyd" : line <= 33 ? "dp" : "result");
    const row = dp && Number.isInteger(activeMask) ? dp[activeMask] : null;
    const dpValue = row && Number.isInteger(activeEnd) ? row[activeEnd] : null;
    const distanceMatrix = phase === "floyd" && distances
      ? distances.map((matrixRow) => matrixRow.map(displayNumber))
      : null;
    steps.push({
      title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeBlock: 2,
      codeLines: [line],
      vars: [
        { name: "operation", value: operation },
        { name: "via / left / right", value: `${current.via ?? "—"} / ${current.left ?? "—"} / ${current.right ?? "—"}` },
        { name: "mask", value: maskBits(activeMask, n) },
        { name: "end / neighbor", value: `${current.end ?? "—"} / ${current.neighbor ?? "—"}` },
        { name: "candidate", value: displayNumber(current.candidate ?? "—") },
        { name: "omitted instructions", value: omittedInstructions },
      ],
      note: options.note || label("Snapshot này thuộc đúng một câu lệnh Floyd/Bitmask DP.", "This snapshot belongs to exactly one Floyd/Bitmask DP instruction."),
      graph: {
        nodes: Array.from({ length: n }, (_, node) => ({ id: node, label: String(node) })),
        edges,
        hlNodes: [current.end, current.neighbor, current.via].filter(Number.isInteger),
        hlEdges: Number.isInteger(current.end) && Number.isInteger(current.neighbor) ? [[current.end, current.neighbor]] : [],
        visitedNodes,
      },
      visitAll847View: {
        approach: 2,
        lineByLine: true,
        phase: options.final ? "result" : phase,
        operation,
        n,
        adjacency: adjacency.map((adjacencyRow) => [...adjacencyRow]),
        nodes: Array.from({ length: n }, (_, node) => ({ id: node, active: node === currentNode, visited: visitedNodes.includes(node) })),
        edges,
        fullMask,
        fullBits: maskBits(fullMask, n),
        bits: maskBits(activeMask, n),
        currentNode,
        visited: visitedNodes,
        dist: dpValue === Infinity || dpValue === null ? null : dpValue,
        currentState: Number.isInteger(activeEnd) && Number.isInteger(activeMask)
          ? cloneState({ node: activeEnd, mask: activeMask, dist: dpValue }, n) : null,
        candidateState: Number.isInteger(current.neighbor) && Number.isInteger(current.newMask)
          ? cloneState({ node: current.neighbor, mask: current.newMask, dist: current.candidate }, n) : null,
        neighbor: current.neighbor ?? null,
        queue: [],
        frontier: [],
        nextFrontier: [],
        frontierTotal: 0,
        nextFrontierTotal: 0,
        omittedFrontier: 0,
        omittedNext: 0,
        visitedStateCount: 0,
        complete: Boolean(options.final && answer !== -1),
        distanceMatrix,
        popcount: Number.isInteger(activeMask) ? maskNodes(activeMask, n).length : null,
        dpValue: dpValue === Infinity || dpValue === null ? null : dpValue,
        dpRow: row ? row.map(displayNumber).join(", ") : null,
        candidateValue: current.candidate === Infinity ? "∞" : current.candidate ?? null,
        indices: { ...current },
        omittedInstructions,
        answer: options.final ? answer : null,
      },
    });
  }

  record(2, "enter", { phase: "setup" });
  record(3, "read-n", { phase: "setup", note: label(`n = ${n}.`, `n = ${n}.`) });
  const singleNode = n === 1;
  record(4, "single-node-check", { phase: "setup" });
  if (singleNode) {
    answer = 0;
    current = { mask: 1, end: 0 };
    record(5, "return-zero", { phase: "result", final: true });
    return { adj: adjacency, answer, steps };
  }

  record(6, "infinity", { phase: "setup" });
  distances = Array.from({ length: n }, () => Array(n).fill(Infinity));
  record(7, "distance-init", { phase: "floyd" });
  for (let node = 0; node < n; node++) {
    current = { node };
    record(8, "node-loop", { phase: "floyd" });
    distances[node][node] = 0;
    record(9, "distance-diagonal", { phase: "floyd" });
    for (const neighbor of adjacency[node]) {
      current = { node, neighbor };
      record(10, "edge-loop", { phase: "floyd" });
      distances[node][neighbor] = 1;
      record(11, "edge-distance", { phase: "floyd" });
    }
  }

  for (let via = 0; via < n; via++) {
    current = { via };
    record(12, "via-loop", { phase: "floyd" });
    for (let left = 0; left < n; left++) {
      current = { via, left };
      record(13, "left-loop", { phase: "floyd" });
      for (let right = 0; right < n; right++) {
        current = { via, left, right };
        record(14, "right-loop", { phase: "floyd" });
        const candidateValue = distances[left][via] + distances[via][right];
        current.candidate = candidateValue;
        record(15, "distance-candidate", { phase: "floyd" });
        const improved = candidateValue < distances[left][right];
        record(16, "distance-check", { phase: "floyd" });
        if (improved) {
          distances[left][right] = candidateValue;
          record(17, "distance-update", { phase: "floyd" });
        }
      }
    }
  }

  fullMask = (1 << n) - 1;
  current = {};
  record(18, "full-mask", { phase: "dp" });
  dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
  record(19, "dp-init", { phase: "dp" });
  for (let node = 0; node < n; node++) {
    current = { node, mask: 1 << node, end: node };
    record(20, "source-loop", { phase: "dp" });
    dp[1 << node][node] = 0;
    record(21, "source-state", { phase: "dp" });
  }

  for (let mask = 0; mask < 1 << n; mask++) {
    current = { mask };
    record(22, "mask-loop", { phase: "dp" });
    for (let end = 0; end < n; end++) {
      current = { mask, end };
      record(23, "end-loop", { phase: "dp" });
      const unreachable = dp[mask][end] === Infinity;
      record(24, "reachable-check", { phase: "dp" });
      if (unreachable) {
        record(25, "continue-unreachable", { phase: "dp" });
        continue;
      }
      for (let next = 0; next < n; next++) {
        current = { mask, end, neighbor: next };
        record(26, "neighbor-loop", { phase: "dp" });
        const alreadyIncluded = Boolean(mask & (1 << next));
        record(27, "mask-membership", { phase: "dp" });
        if (alreadyIncluded) {
          record(28, "continue-visited", { phase: "dp" });
          continue;
        }
        const newMask = mask | (1 << next);
        current.newMask = newMask;
        record(29, "new-mask", { phase: "dp" });
        const candidateValue = dp[mask][end] + distances[end][next];
        current.candidate = candidateValue;
        record(30, "dp-candidate", { phase: "dp" });
        const improved = candidateValue < dp[newMask][next];
        record(31, "dp-check", { phase: "dp" });
        if (improved) {
          dp[newMask][next] = candidateValue;
          record(32, "dp-update", { phase: "dp" });
        }
      }
    }
  }

  const best = Math.min(...dp[fullMask]);
  current = { mask: fullMask, end: dp[fullMask].indexOf(best) };
  record(33, "answer-min", { phase: "dp" });
  answer = best === Infinity ? -1 : best;
  record(34, "return", {
    phase: "result",
    final: true,
    note: omittedInstructions
      ? label(`Đáp án đầy đủ; ${omittedInstructions} instruction đã được ẩn để giới hạn trace.`, `The answer is complete; ${omittedInstructions} instructions were hidden to bound the trace.`)
      : label("Lấy giá trị nhỏ nhất trong hàng full mask.", "Take the minimum value in the full-mask row."),
  });
  return { adj: adjacency, answer, steps };
}

function builder(input, params = {}) {
  const adjacency = parseAdjacency(input);
  return Number(params.approach) === 2 ? buildDpTrace(adjacency) : buildBfsTrace(adjacency);
}

module.exports = { code, code2, builder };
