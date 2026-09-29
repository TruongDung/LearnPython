// Custom teaching payloads for LC 542, 684, 787, and 847.
// Existing answer-producing builders remain the source of truth except for LC 684,
// whose compact trace is replaced by an equivalent instruction-level DSU trace.

const label = (vi, en) => ({ vi, en });
const LINE_DEBUG_847 = require("./shortest-path-all-nodes-847-line-debug");

function variableName(variable) {
  if (!variable) return "";
  if (typeof variable.name === "object" && variable.name) {
    return String(variable.name.en || variable.name.vi || "");
  }
  return String(variable.name || "");
}

function findVariable(step, matcher) {
  const variable = (step.vars || []).find((item) => matcher(variableName(item)));
  return variable ? variable.value : null;
}

function numericVariable(step, names) {
  const value = findVariable(step, (name) => names.includes(name));
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseVector(value) {
  if (Array.isArray(value)) return [...value];
  const text = String(value ?? "").trim();
  if (!text.startsWith("[") || !text.endsWith("]")) return null;
  return text.slice(1, -1).split(",").map((token) => {
    const item = token.trim();
    if (!item || item === "∞" || item === "·" || item === "Infinity") return null;
    const number = Number(item);
    return Number.isFinite(number) ? number : item;
  });
}

function parseCoordinateQueue(value) {
  const coordinates = [];
  const pattern = /\((-?\d+)\s*,\s*(-?\d+)\)/g;
  const text = String(value ?? "");
  let match = pattern.exec(text);
  while (match) {
    coordinates.push([Number(match[1]), Number(match[2])]);
    match = pattern.exec(text);
  }
  return coordinates;
}

function parseNumberList(value) {
  const match = String(value ?? "").match(/\[([^\]]*)\]/);
  if (!match || !match[1].trim()) return [];
  return match[1].split(",").map((item) => Number(item.trim())).filter(Number.isInteger);
}

function enhance542(result) {
  const original = Array.isArray(result.original) ? result.original : [];
  const operationByLine = {
    5: "enter",
    6: "dimensions",
    7: "distance-init",
    8: "queue-init",
    9: "scan-row",
    10: "scan-cell",
    11: "source-check",
    12: "source-distance",
    13: "source-enqueue",
    14: "directions",
    15: "queue-check",
    16: "dequeue",
    17: "direction-loop",
    18: "neighbor-coordinate",
    19: "neighbor-check",
    20: "distance-update",
    21: "neighbor-enqueue",
    22: "return",
  };

  for (const step of result.steps || []) {
    if (!step.bfsGrid) continue;
    const line = Number(step.codeLines?.[0] || 0);
    const rows = Number(step.bfsGrid.rows || original.length || 1);
    const cols = Number(step.bfsGrid.cols || original[0]?.length || 1);
    const distanceReady = line >= 7 && !(step.final && result.answer?.length === 0);
    const cells = (step.bfsGrid.cells || []).map((row, rowIndex) => row.map((cell, colIndex) => {
      const rawDistance = cell.label === "∞" ? null : Number(cell.label);
      return {
        row: rowIndex,
        col: colIndex,
        input: original[rowIndex]?.[colIndex] ?? null,
        distance: distanceReady && Number.isFinite(rawDistance) ? rawDistance : null,
        state: cell.cls || "empty",
        isSource: original[rowIndex]?.[colIndex] === 0,
      };
    }));
    const flatCells = cells.flat();
    const queueCoordinates = parseCoordinateQueue(findVariable(step, (name) => name === "queue"));
    const queue = queueCoordinates.map(([row, col], index) => ({
      row,
      col,
      index,
      distance: cells[row]?.[col]?.distance ?? null,
    }));
    const currentCell = flatCells.find((cell) => cell.state === "current") || null;
    const discoveredCell = flatCells.find((cell) => cell.state === "path") || null;
    const nextRow = numericVariable(step, ["next_row"]);
    const nextCol = numericVariable(step, ["next_col"]);
    const deltaRow = numericVariable(step, ["delta_row"]);
    const deltaCol = numericVariable(step, ["delta_col"]);
    const inBounds = findVariable(step, (name) => name === "in bounds?");
    const unvisited = findVariable(step, (name) => name === "unvisited?");
    const phase = line <= 8 ? "setup" : line <= 14 ? "sources" : line <= 21 ? "bfs" : "result";

    step.matrix542View = {
      phase: step.final ? "result" : phase,
      operation: operationByLine[line] || (step.final ? "invalid" : "step"),
      rows,
      cols,
      cells,
      sources: flatCells.filter((cell) => cell.isSource).map(({ row, col }) => [row, col]),
      queue,
      current: currentCell ? [currentCell.row, currentCell.col] : null,
      discovered: discoveredCell ? [discoveredCell.row, discoveredCell.col] : null,
      neighbor: Number.isInteger(nextRow) && Number.isInteger(nextCol) ? [nextRow, nextCol] : null,
      direction: Number.isInteger(deltaRow) && Number.isInteger(deltaCol) ? [deltaRow, deltaCol] : null,
      check: {
        inBounds: typeof inBounds === "boolean" ? inBounds : null,
        unvisited: typeof unvisited === "boolean" ? unvisited : null,
      },
      answer: step.final ? result.answer : null,
      invalid: step.final && (!Array.isArray(result.answer) || result.answer.length === 0),
    };
  }
  return result;
}

const CODE_684 = [
  "class Solution:",
  "    def findRedundantConnection(self, edges):",
  "        parent = list(range(len(edges) + 1))",
  "        rank = [0] * (len(edges) + 1)",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])",
  "            return parent[x]",
  "        for u, v in edges:",
  "            root_u = find(u)",
  "            root_v = find(v)",
  "            if root_u == root_v:",
  "                return [u, v]",
  "            if rank[root_u] < rank[root_v]:",
  "                root_u, root_v = root_v, root_u",
  "            parent[root_v] = root_u",
  "            if rank[root_u] == rank[root_v]:",
  "                rank[root_u] += 1",
  "        return []",
];

function buildSteps684Custom(input) {
  const edges = String(input).split(";").map((item) => item.trim()).filter(Boolean)
    .map((item) => item.split(",").map((value) => Number(value.trim())));
  const n = edges.length;
  const valid = n > 0 && n <= 40 && edges.every((edge) => edge.length === 2
    && edge.every((node) => Number.isInteger(node) && node >= 1 && node <= n));
  if (!valid) throw new Error("Cần 1–40 cạnh u,v với node nguyên trong miền 1..số cạnh");

  const parent = Array.from({ length: n + 1 }, (_, index) => index);
  const rank = Array(n + 1).fill(0);
  const acceptedIndexes = new Set();
  const steps = [];
  let parentReady = false;
  let rankReady = false;
  let answer = [];
  let currentEdgeIndex = -1;
  let roots = { u: null, v: null };

  const peekRoot = (node) => {
    let cursor = node;
    const guarded = new Set();
    while (parent[cursor] !== cursor && !guarded.has(cursor)) {
      guarded.add(cursor);
      cursor = parent[cursor];
    }
    return cursor;
  };

  function emit(line, operation, options = {}) {
    const currentEdge = currentEdgeIndex >= 0 ? edges[currentEdgeIndex] : null;
    const componentsByRoot = new Map();
    if (parentReady) {
      for (let node = 1; node <= n; node++) {
        const root = peekRoot(node);
        if (!componentsByRoot.has(root)) componentsByRoot.set(root, []);
        componentsByRoot.get(root).push(node);
      }
    }
    const components = [...componentsByRoot.entries()].map(([root, members]) => ({ root, members }));
    const nodes = Array.from({ length: n }, (_, index) => {
      const id = index + 1;
      return {
        id,
        parent: parentReady ? parent[id] : null,
        rank: rankReady ? rank[id] : null,
        root: parentReady ? peekRoot(id) : null,
        isRoot: parentReady && parent[id] === id,
        active: Boolean(currentEdge?.includes(id)),
      };
    });
    const edgeRows = edges.map(([u, v], index) => {
      let state = acceptedIndexes.has(index) ? "accepted" : "pending";
      if (index === currentEdgeIndex) {
        if (options.edgeState) state = options.edgeState;
        else if (state !== "accepted") state = "current";
      }
      return { index, u, v, state };
    });
    const graphEdges = edgeRows.filter((edge) => edge.state !== "pending").map((edge) => ({
      u: edge.u,
      v: edge.v,
      w: "",
      state: edge.state,
    }));
    steps.push({
      title: options.title || label(`Dòng ${line}: ${operation}`, `Line ${line}: ${operation}`),
      arr: [],
      highlight: [],
      mark: [],
      final: Boolean(options.final),
      codeLines: [line],
      vars: [
        { name: "operation", value: operation },
        { name: "edge", value: currentEdge ? `[${currentEdge.join(", ")}]` : "—" },
        { name: "root_u / root_v", value: `${roots.u ?? "—"} / ${roots.v ?? "—"}` },
        { name: "parent", value: parentReady ? `[${parent.slice(1).join(", ")}]` : "—" },
        { name: "rank", value: rankReady ? `[${rank.slice(1).join(", ")}]` : "—" },
      ],
      note: options.note || label("Theo dõi forest DSU, find path và union riêng từng lệnh.", "Track the DSU forest, find path, and union one instruction at a time."),
      graph: {
        nodes: nodes.map((node) => ({ id: node.id, label: String(node.id), sub: node.root === null ? "" : `root=${node.root}` })),
        edges: graphEdges,
        hlNodes: currentEdge || [],
        hlEdges: currentEdge ? [currentEdge] : [],
        visitedNodes: [],
      },
      unionFind684View: {
        phase: options.phase || "setup",
        operation,
        nodes,
        forestEdges: nodes.filter((node) => node.parent !== null && node.parent !== node.id)
          .map((node) => ({ child: node.id, parent: node.parent })),
        components,
        edges: edgeRows,
        currentEdgeIndex,
        currentEdge: currentEdge ? [...currentEdge] : null,
        roots: { ...roots },
        findState: options.findState ? {
          ...options.findState,
          path: [...(options.findState.path || [])],
          compressed: [...(options.findState.compressed || [])],
        } : null,
        swapped: Boolean(options.swapped),
        answer: options.final ? [...answer] : null,
      },
    });
  }

  emit(2, "enter", { phase: "setup", note: label(`Nhận ${n} cạnh trên các node 1..${n}.`, `Receive ${n} edges over nodes 1..${n}.`) });
  parentReady = true;
  emit(3, "parent-init", { phase: "setup" });
  rankReady = true;
  emit(4, "rank-init", { phase: "setup" });
  emit(5, "define-find", { phase: "setup" });

  function findWithTrace(value, endpoint) {
    const path = [value];
    let cursor = value;
    while (parent[cursor] !== cursor) {
      emit(6, "find-check", {
        phase: "find",
        findState: { endpoint, start: value, current: cursor, path, root: null, compressed: [], condition: true },
      });
      cursor = parent[cursor];
      path.push(cursor);
    }
    const root = cursor;
    emit(6, "find-check", {
      phase: "find",
      findState: { endpoint, start: value, current: cursor, path, root, compressed: [], condition: false },
    });
    const compressed = [];
    for (const node of path.slice(0, -1).reverse()) {
      parent[node] = root;
      compressed.push(node);
      emit(7, "path-compress", {
        phase: "find",
        findState: { endpoint, start: value, current: node, path, root, compressed, condition: false },
      });
    }
    emit(8, "find-return", {
      phase: "find",
      findState: { endpoint, start: value, current: root, path, root, compressed, condition: false },
    });
    return root;
  }

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    currentEdgeIndex = edgeIndex;
    const [u, v] = edges[edgeIndex];
    roots = { u: null, v: null };
    emit(9, "edge-loop", { phase: "edge", edgeState: "current" });
    roots.u = findWithTrace(u, "u");
    emit(10, "root-u", { phase: "compare", edgeState: "current" });
    roots.v = findWithTrace(v, "v");
    emit(11, "root-v", { phase: "compare", edgeState: "current" });
    const createsCycle = roots.u === roots.v;
    emit(12, "cycle-check", {
      phase: "compare",
      edgeState: createsCycle ? "redundant" : "current",
      note: createsCycle
        ? label(`Hai đầu cùng root ${roots.u}; thêm cạnh sẽ khép chu trình.`, `Both endpoints have root ${roots.u}; adding the edge closes a cycle.`)
        : label(`Root ${roots.u} và ${roots.v} khác nhau; có thể union.`, `Roots ${roots.u} and ${roots.v} differ, so union is safe.`),
    });
    if (createsCycle) {
      answer = [u, v];
      emit(13, "return-redundant", {
        phase: "done",
        edgeState: "redundant",
        final: true,
        note: label(`Cạnh [${u}, ${v}] là cạnh đầu tiên nối hai node đã liên thông.`, `Edge [${u}, ${v}] is the first edge joining already-connected nodes.`),
      });
      return { original: edges, answer, steps };
    }

    const shouldSwap = rank[roots.u] < rank[roots.v];
    emit(14, "rank-compare", { phase: "union", edgeState: "current", swapped: shouldSwap });
    if (shouldSwap) {
      [roots.u, roots.v] = [roots.v, roots.u];
      emit(15, "swap-roots", { phase: "union", edgeState: "current", swapped: true });
    }
    parent[roots.v] = roots.u;
    acceptedIndexes.add(edgeIndex);
    emit(16, "attach-root", { phase: "union", edgeState: "accepted", swapped: shouldSwap });
    const equalRank = rank[roots.u] === rank[roots.v];
    emit(17, "rank-equality", { phase: "union", edgeState: "accepted", swapped: shouldSwap });
    if (equalRank) {
      rank[roots.u]++;
      emit(18, "rank-increment", { phase: "union", edgeState: "accepted", swapped: shouldSwap });
    }
  }

  currentEdgeIndex = -1;
  emit(19, "return-empty", { phase: "done", final: true });
  return { original: edges, answer, steps };
}

function enhance787(result, params = {}) {
  const approach = Number(params.approach) === 2 ? 2 : 1;
  const operationByLine = approach === 2 ? {
    6: "state-model", 7: "graph-init", 8: "flight-loop", 9: "edge-append",
    11: "flight-limit", 12: "best-init", 13: "source-init", 14: "heap-init",
    16: "heap-check", 17: "heap-pop", 18: "target-check", 19: "stale-check",
    20: "limit-check", 22: "neighbor-loop", 23: "price-candidate", 24: "flight-count",
    25: "improvement-check", 26: "best-update", 27: "heap-push", 28: "return-empty",
  } : {
    4: "flight-limit", 5: "infinity", 6: "cost-init", 7: "source-init",
    9: "round-start", 10: "copy-cost", 11: "flight-loop", 12: "reachable-check",
    13: "relax", 14: "round-commit", 16: "return",
  };
  const flights = Array.isArray(result.flights) ? result.flights : [];

  for (const step of result.steps || []) {
    const line = Number(step.codeLines?.[0] || 0);
    const variables = (step.vars || []).map((variable) => ({ name: variableName(variable), value: variable.value }));
    const currentEdge = step.graph?.hlEdges?.[0] || null;
    const graphNodes = step.graph?.nodes || [];
    const costs = graphNodes.map((node) => node.dist === "∞" || node.dist === Infinity ? null : Number(node.dist));
    const oldCost = parseVector(findVariable(step, (name) => name.includes("cost (chỉ đọc)")));
    const nextCost = parseVector(findVariable(step, (name) => name === "next_cost" || name.startsWith("next_cost (")));
    const allowedFlights = numericVariable(step, ["allowed flights", "max flights", "max_flights"]);
    const used = numericVariable(step, ["used"]);
    const price = numericVariable(step, ["price"]);
    const city = numericVariable(step, ["u"]);
    const candidate = findVariable(step, (name) => name === "candidate" || name === "new_price");
    const heap = findVariable(step, (name) => name === "heap" || name === "heap còn lại");
    const best = findVariable(step, (name) => name === "best" || name === "best[city][used]");
    const phase = approach === 1
      ? (line <= 7 ? "setup" : line <= 14 ? "rounds" : "result")
      : (line <= 14 ? "setup" : line <= 27 ? "search" : "result");

    step.flights787View = {
      approach,
      phase: step.final ? "result" : phase,
      operation: operationByLine[line] || "step",
      n: Number.isInteger(result.n) ? result.n : null,
      src: Number.isInteger(result.src) ? result.src : null,
      dst: Number.isInteger(result.dst) ? result.dst : null,
      k: Number.isInteger(result.k) ? result.k : null,
      nodes: graphNodes.map((node, index) => ({
        id: node.id ?? index,
        cost: costs[index],
        isSource: (node.id ?? index) === result.src,
        isTarget: (node.id ?? index) === result.dst,
        active: Boolean(step.graph?.hlNodes?.includes(node.id ?? index)),
        reachable: costs[index] !== null,
      })),
      edges: (step.graph?.edges || []).map((edge, index) => ({
        ...edge,
        index,
        current: Boolean(currentEdge && edge.u === currentEdge[0] && edge.v === currentEdge[1]),
      })),
      currentEdge: currentEdge ? [...currentEdge] : null,
      costs,
      oldCost,
      nextCost,
      allowedFlights,
      used,
      price,
      city,
      candidate,
      heap: heap === null ? null : String(heap),
      best: best === null ? null : String(best),
      variables,
      answer: step.final ? result.answer : null,
    };
  }
  return result;
}

function parse847Adjacency(input) {
  const rows = String(input).split("|").map((row) => row.trim());
  const n = rows.length;
  return rows.map((row) => row === "" ? [] : row.split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 0 && value < n));
}

function maskState(node, mask, n, dist) {
  return {
    node,
    mask,
    bits: mask.toString(2).padStart(n, "0"),
    visited: Array.from({ length: n }, (_, index) => index).filter((index) => mask & (1 << index)),
    dist,
  };
}

function simulate847Levels(adjacency) {
  const n = adjacency.length;
  if (!n || n > 15) return [];
  const fullMask = (1 << n) - 1;
  let frontier = Array.from({ length: n }, (_, node) => [node, 1 << node]);
  const visited = new Set(frontier.map(([node, mask]) => `${node},${mask}`));
  const levels = [{
    dist: 0,
    frontier: frontier.map(([node, mask]) => maskState(node, mask, n, 0)),
    nextFrontier: [],
    visitedCount: visited.size,
    complete: n === 1,
  }];
  if (n === 1) return levels;

  let dist = 0;
  while (frontier.length) {
    dist++;
    const processed = frontier;
    const nextFrontier = [];
    let found = null;
    outer: for (const [node, mask] of processed) {
      for (const next of adjacency[node]) {
        const newMask = mask | (1 << next);
        const key = `${next},${newMask}`;
        if (visited.has(key)) continue;
        const state = [next, newMask];
        if (newMask === fullMask) {
          found = state;
          visited.add(key);
          break outer;
        }
        visited.add(key);
        nextFrontier.push(state);
      }
    }
    levels.push({
      dist,
      frontier: processed.map(([node, mask]) => maskState(node, mask, n, dist - 1)),
      nextFrontier: (found ? [found] : nextFrontier).map(([node, mask]) => maskState(node, mask, n, dist)),
      visitedCount: visited.size,
      complete: Boolean(found),
    });
    if (found) break;
    frontier = nextFrontier;
  }
  return levels;
}

function enhance847(result, input, params = {}) {
  const approach = Number(params.approach) === 2 ? 2 : 1;
  const adjacency = parse847Adjacency(input);
  const n = adjacency.length;
  const fullMask = n && n <= 30 ? (1 << n) - 1 : 0;
  const levels = approach === 1 ? simulate847Levels(adjacency) : [];
  const edges = [];
  const seenEdges = new Set();
  adjacency.forEach((neighbors, node) => neighbors.forEach((next) => {
    const key = node < next ? `${node}-${next}` : `${next}-${node}`;
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      edges.push({ u: node, v: next });
    }
  }));

  for (let index = 0; index < (result.steps || []).length; index++) {
    const step = result.steps[index];
    const variables = (step.vars || []).map((variable) => ({ name: variableName(variable), value: variable.value }));
    const dist = numericVariable(step, ["dist"]);
    const level = approach === 1
      ? (Number.isInteger(dist) ? levels.find((item) => item.dist === dist) : step.final ? levels.at(-1) : levels[0])
      : null;
    const sampleStateText = findVariable(step, (name) => name === "sample state");
    const stateMatch = String(sampleStateText ?? "").match(/node=(\d+),\s*mask=([01]+)/);
    const sampleMaskText = findVariable(step, (name) => name === "example mask" || name === "fullMask");
    const bitsMatch = String(sampleMaskText ?? "").match(/[01]+/);
    const bits = stateMatch?.[2] || bitsMatch?.[0] || fullMask.toString(2).padStart(n, "0");
    const currentNode = stateMatch ? Number(stateMatch[1]) : numericVariable(step, ["end node", "best end node"]);
    const visited = stateMatch
      ? Array.from({ length: n }, (_, node) => node).filter((node) => bits[bits.length - 1 - node] === "1")
      : parseNumberList(findVariable(step, (name) => name === "visited" || name === "sample visited"));
    const phase = approach === 1
      ? (step.final ? "result" : index === 0 ? "setup" : "bfs")
      : (step.final ? "result" : step.grid ? "floyd" : findVariable(step, (name) => name === "popcount") !== null ? "dp" : "setup");

    step.visitAll847View = {
      approach,
      phase,
      operation: approach === 1 ? (phase === "setup" ? "multi-source-init" : phase === "bfs" ? "bfs-level" : "return")
        : (phase === "floyd" ? "all-pairs-shortest-path" : phase === "dp" ? "bitmask-dp-level" : phase === "result" ? "return" : "setup"),
      n,
      adjacency: adjacency.map((row) => [...row]),
      nodes: Array.from({ length: n }, (_, node) => ({
        id: node,
        active: node === currentNode,
        visited: visited.includes(node),
      })),
      edges,
      fullMask,
      fullBits: fullMask.toString(2).padStart(n, "0"),
      bits,
      currentNode,
      visited,
      dist: Number.isInteger(dist) ? dist : level?.dist ?? null,
      frontier: (level?.frontier || []).slice(0, 48),
      nextFrontier: (level?.nextFrontier || []).slice(0, 48),
      frontierTotal: level?.frontier.length || 0,
      nextFrontierTotal: level?.nextFrontier.length || 0,
      omittedFrontier: Math.max(0, (level?.frontier.length || 0) - 48),
      omittedNext: Math.max(0, (level?.nextFrontier.length || 0) - 48),
      visitedStateCount: level?.visitedCount || numericVariable(step, ["total visited", "states explored"]) || 0,
      complete: Boolean(level?.complete || step.final),
      distanceMatrix: step.grid?.dp ? step.grid.dp.map((row) => [...row]) : null,
      popcount: numericVariable(step, ["popcount"]),
      dpValue: findVariable(step, (name) => name === "dp[mask][end]"),
      dpRow: findVariable(step, (name) => name === "dp[fullMask] row"),
      variables,
      answer: step.final ? result.answer : null,
    };
  }
  return result;
}

function installGraph(registry) {
  if (registry[542]) {
    const original = registry[542].builder;
    registry[542].builder = (input, params) => enhance542(original(input, params));
    registry[542].debugMode = "line-by-line";
  }
  if (registry[787]) {
    const original = registry[787].builder;
    registry[787].builder = (input, params = {}) => enhance787(original(input, params), params);
    registry[787].debugMode = "line-by-line";
    registry[787].tags = [...(registry[787].tags || []), { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" }];
  }
  if (registry[847]) {
    registry[847].builder = LINE_DEBUG_847.builder;
    registry[847].code = LINE_DEBUG_847.code;
    registry[847].code2 = LINE_DEBUG_847.code2;
    registry[847].debugMode = "line-by-line";
    registry[847].tags = [...(registry[847].tags || []), { key: "bitmask-bfs", vi: "Bitmask BFS", en: "Bitmask BFS" }];
  }
}

function installUnionFind(registry) {
  if (!registry[684]) return;
  registry[684].builder = buildSteps684Custom;
  registry[684].code = CODE_684;
  registry[684].debugMode = "line-by-line";
}

module.exports = { installGraph, installUnionFind };
