// Custom teaching payloads for LC 307, 542, 684, 787, and 847.
// Existing answer-producing builders remain the source of truth except for LC 684,
// whose compact trace is replaced by an equivalent instruction-level DSU trace.

const label = (vi, en) => ({ vi, en });

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
  const finalDistances = Array.isArray(result.answer) && result.answer.length ? result.answer : [];
  const totalCells = original.reduce((sum, row) => sum + row.length, 0);
  const maxDistance = finalDistances.length ? Math.max(0, ...finalDistances.flat()) : 0;
  const targetLayers = Array.from({ length: maxDistance + 1 }, (_, distance) => ({
    distance,
    total: finalDistances.flat().filter((value) => value === distance).length,
  }));
  const operationByLine = {
    5: "enter", 6: "dimensions", 7: "distance-init", 8: "queue-init",
    9: "scan-row", 10: "scan-cell", 11: "source-check", 12: "source-distance",
    13: "source-enqueue", 14: "directions", 15: "queue-check", 16: "dequeue",
    17: "direction-loop", 18: "neighbor-coordinate", 19: "neighbor-check",
    20: "distance-update", 21: "neighbor-enqueue", 22: "return",
  };

  let activeOrigin = null;
  let activeDirection = null;
  let activeNeighbor = null;

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
    const highlightedCell = flatCells.find((cell) => cell.state === "current") || null;
    const discoveredCell = flatCells.find((cell) => cell.state === "path") || null;
    const readNumber = (names) => {
      const value = findVariable(step, (name) => names.includes(name));
      if (value === null || value === undefined || value === "") return null;
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    };
    const nextRow = readNumber(["next_row"]);
    const nextCol = readNumber(["next_col"]);
    const deltaRow = readNumber(["delta_row"]);
    const deltaCol = readNumber(["delta_col"]);
    const inBounds = findVariable(step, (name) => name === "in bounds?");
    const unvisited = findVariable(step, (name) => name === "unvisited?");
    const phase = line <= 8 ? "setup" : line <= 14 ? "sources" : line <= 21 ? "bfs" : "result";
    const operation = operationByLine[line] || (step.final ? "invalid" : "step");

    if (operation === "dequeue" && highlightedCell) {
      activeOrigin = [highlightedCell.row, highlightedCell.col];
      activeDirection = null;
      activeNeighbor = null;
    }
    if (operation === "direction-loop" && Number.isInteger(deltaRow) && Number.isInteger(deltaCol)) {
      activeDirection = [deltaRow, deltaCol];
      activeNeighbor = null;
    }
    if (operation === "neighbor-coordinate" && Number.isInteger(nextRow) && Number.isInteger(nextCol)) {
      activeNeighbor = [nextRow, nextCol];
    }
    if (step.final) {
      activeOrigin = null;
      activeDirection = null;
      activeNeighbor = null;
    }

    const discovered = discoveredCell
      ? [discoveredCell.row, discoveredCell.col]
      : ["distance-update", "neighbor-enqueue"].includes(operation) && activeNeighbor
        ? [...activeNeighbor]
        : null;
    const discoveredValue = discovered ? cells[discovered[0]]?.[discovered[1]]?.distance : null;
    const knownCount = flatCells.filter((cell) => cell.distance !== null).length;
    const waves = targetLayers.map((layer) => ({
      ...layer,
      reached: flatCells.filter((cell) => cell.distance === layer.distance).length,
    }));
    const originCell = activeOrigin ? cells[activeOrigin[0]]?.[activeOrigin[1]] : null;
    const activeDistance = discoveredValue ?? originCell?.distance ?? null;
    const sourceFocus = phase === "sources" && highlightedCell ? [highlightedCell.row, highlightedCell.col] : null;
    const current = phase === "bfs" ? activeOrigin : sourceFocus;
    const neighbor = phase === "bfs" ? activeNeighbor : null;
    const currentText = current ? `(${current.join(",")})` : "";
    const neighborText = neighbor ? `(${neighbor.join(",")})` : "";
    const nextDistance = discoveredValue ?? (originCell?.distance !== null && originCell?.distance !== undefined ? originCell.distance + 1 : null);
    let shortTitle;
    let shortNote;

    if (step.final && !finalDistances.length) {
      shortTitle = label("Đầu vào không hợp lệ", "Invalid input");
      shortNote = label("Cần grid 0/1 có ít nhất một số 0.", "Use a 0/1 grid with at least one zero.");
    } else if (operation === "distance-init") {
      shortTitle = label(`∞ × ${totalCells}`, `∞ × ${totalCells}`);
      shortNote = label("Chưa thăm.", "Unvisited.");
    } else if (operation === "source-check") {
      shortTitle = highlightedCell?.isSource ? label("0 → SOURCE", "0 → SOURCE") : label("1 → CHỜ", "1 → WAIT");
      shortNote = highlightedCell?.isSource ? label("Nguồn d=0.", "Source d=0.") : label("Đợi sóng BFS.", "Wait for BFS wave.");
    } else if (operation === "source-distance") {
      shortTitle = label(`${sourceFocus ? `d(${sourceFocus.join(",")})` : "d(source)"} = 0`, `${sourceFocus ? `d(${sourceFocus.join(",")})` : "d(source)"} = 0`);
      shortNote = label("Nguồn.", "Source.");
    } else if (operation === "source-enqueue") {
      shortTitle = label(`PUSH ${sourceFocus ? `(${sourceFocus.join(",")})` : "0"}`, `PUSH ${sourceFocus ? `(${sourceFocus.join(",")})` : "0"}`);
      shortNote = label("Nhiều nguồn, một queue.", "Many sources, one queue.");
    } else if (operation === "dequeue") {
      shortTitle = label(`POP ${currentText} · d=${originCell?.distance ?? "?"}`, `POP ${currentText} · d=${originCell?.distance ?? "?"}`);
      shortNote = label("Đầu queue.", "Queue front.");
    } else if (operation === "neighbor-check") {
      const verdict = inBounds === false ? "OUT" : unvisited === true ? "✓ NEW" : "× SKIP";
      shortTitle = label(`${neighborText} · ${verdict}`, `${neighborText} · ${verdict}`);
      shortNote = unvisited === true ? label("Lần đầu = ngắn nhất.", "First visit = shortest.") : label("Không cập nhật.", "No update.");
    } else if (operation === "distance-update") {
      shortTitle = label(`d${neighborText} = ${originCell?.distance ?? "?"} + 1 = ${nextDistance ?? "?"}`, `d${neighborText} = ${originCell?.distance ?? "?"} + 1 = ${nextDistance ?? "?"}`);
      shortNote = label("Chốt khoảng cách.", "Lock distance.");
    } else if (operation === "neighbor-enqueue") {
      shortTitle = label(`PUSH ${neighborText}`, `PUSH ${neighborText}`);
      shortNote = label("Lan tiếp.", "Keep spreading.");
    } else if (step.final) {
      shortTitle = label(`✓ ${totalCells}/${totalCells}`, `✓ ${totalCells}/${totalCells}`);
      shortNote = label("Hoàn tất.", "Done.");
    } else if (operation === "queue-check") {
      shortTitle = label(`QUEUE · ${queue.length}`, `QUEUE · ${queue.length}`);
      shortNote = label("FIFO.", "FIFO.");
    } else if (operation === "direction-loop") {
      shortTitle = label(activeDirection ? `Δ (${activeDirection.join(",")})` : "4 HƯỚNG", activeDirection ? `Δ (${activeDirection.join(",")})` : "4 DIRECTIONS");
      shortNote = label("Thử hàng xóm.", "Try neighbor.");
    } else if (operation === "neighbor-coordinate") {
      shortTitle = label(`${currentText} → ${neighborText}`, `${currentText} → ${neighborText}`);
      shortNote = label("Một bước.", "One step.");
    } else {
      const phaseTitle = phase === "setup" ? "SETUP" : phase === "sources" ? "SOURCES" : phase === "bfs" ? "WAVE" : "DISTANCE";
      shortTitle = label(phaseTitle, phaseTitle);
      shortNote = label("Multi-source BFS.", "Multi-source BFS.");
    }

    step.title = shortTitle;
    step.note = shortNote;
    step.matrix542View = {
      phase: step.final ? "result" : phase,
      operation,
      rows,
      cols,
      cells,
      sources: flatCells.filter((cell) => cell.isSource).map(({ row, col }) => [row, col]),
      queue,
      current,
      origin: activeOrigin ? [...activeOrigin] : null,
      discovered,
      neighbor,
      direction: activeDirection ? [...activeDirection] : null,
      check: {
        inBounds: typeof inBounds === "boolean" ? inBounds : null,
        unvisited: typeof unvisited === "boolean" ? unvisited : null,
      },
      knownCount,
      totalCells,
      maxDistance,
      activeDistance,
      waves,
      answer: step.final ? result.answer : null,
      invalid: step.final && (!Array.isArray(result.answer) || result.answer.length === 0),
    };
  }
  return result;
}

function enhance307(result) {
  const nums = Array.isArray(result.original?.nums) ? result.original.nums : [];
  const rawOperations = String(result.original?.operations || "");
  const operations = rawOperations.split("|").map((part) => part.trim()).filter(Boolean).map((text) => {
    const [rawName, first, second] = text.split(/\s+/);
    const name = String(rawName || "").toLowerCase();
    return {
      name,
      first: Number(first),
      second: Number(second),
      label: name === "sumrange" ? `Σ(${first},${second})` : `U(${first}→${second})`,
    };
  });
  const statusValue = (view, name) => view.status?.find((item) => item?.label === name)?.value ?? null;
  const treeValue = (view, index) => Number.isInteger(index) && index > 0 ? view.tree?.[index - 1] : null;
  let operationIndex = -1;

  for (const step of result.steps || []) {
    const view = step.segmentTreeView;
    if (!view) continue;
    const line = Number(step.codeLines?.[0] || 0);
    if ((line === 10 || line === 18) && operationIndex + 1 < operations.length) operationIndex += 1;
    const operation = operations[operationIndex] || null;
    const activeTree = Array.isArray(view.activeTree) ? view.activeTree : [];
    const selectedTree = Array.isArray(view.selectedTree) ? view.selectedTree : [];
    const activeNums = Array.isArray(view.activeNums) ? view.activeNums : [];
    const mode = view.mode || "idle";
    let phase = "build";
    let action = "INIT";
    let equation = `${nums.length} → ${nums.length * 2}`;

    if (mode === "build" && line === 5) {
      action = "LEAF";
      equation = `nums[${activeNums[0] ?? "?"}] → tree[${activeTree[0] ?? "?"}]`;
    } else if (mode === "build" && line === 8) {
      action = "↑ PARENT";
      const [parent, left, right] = activeTree;
      equation = `${treeValue(view, left)} + ${treeValue(view, right)} = ${treeValue(view, parent)}`;
    } else if (mode === "update" && line === 10) {
      phase = "update";
      action = "FIND LEAF";
      equation = `${activeNums[0] ?? "i"} + ${nums.length} = ${activeTree[0] ?? "pos"}`;
    } else if (mode === "update" && line === 12) {
      phase = "update";
      action = "WRITE";
      equation = `${statusValue(view, "old")} → ${statusValue(view, "new")}`;
    } else if (mode === "update") {
      phase = "update";
      action = activeTree.length >= 3 ? "↑ PARENT" : "✓ UPDATE";
      if (activeTree.length >= 3) {
        const [parent, left, right] = activeTree;
        equation = `${treeValue(view, left)} + ${treeValue(view, right)} = ${treeValue(view, parent)}`;
      } else {
        equation = operation ? operation.label : "✓";
      }
    } else if (mode === "query") {
      phase = "query";
      if (line === 18) action = "L / R";
      else if (line === 24) action = "CHECK";
      else if (line === 26 || line === 29) action = "+ TAKE";
      else if (line === 33) action = "↑ PARENT";
      else if (line === 35) action = "✓ SUM";
      const total = statusValue(view, "total") ?? statusValue(view, "answer");
      equation = line === 35
        ? `${selectedTree.map((index) => treeValue(view, index)).join(" + ") || "0"} = ${statusValue(view, "answer")}`
        : (total !== null ? `total = ${total}` : operation?.label || "Σ");
    } else if (step.final) {
      phase = "result";
      action = "!";
      equation = "INVALID";
    }

    const queryRange = operation?.name === "sumrange" ? [operation.first, operation.second] : null;
    const pointerNodes = mode === "query" && [18, 24, 33].includes(line) ? activeTree.slice(0, 2) : [];
    const operationComplete = line === 35 || (mode === "update" && line === 16 && activeTree.length === 0);
    const completedOperations = Math.max(0, operationIndex + (operationComplete ? 1 : 0));
    view.variant = "range-sum-307";
    view.phase = phase;
    view.action = action;
    view.equation = equation;
    view.operations = operations;
    view.operationIndex = operationIndex;
    view.completedOperations = completedOperations;
    view.queryRange = queryRange;
    view.pointerNodes = pointerNodes;
    view.outputs = Array.isArray(result.answer) ? result.answer.slice(1) : [];
    view.invalid = step.final && result.answer === null;

    step.title = label(action, action);
    step.note = label(
      phase === "query" ? "Ghép các đoạn không chồng lặp." : phase === "update" ? "Chỉ sửa đường từ lá lên gốc." : "Lá trước, tổng cha sau.",
      phase === "query" ? "Combine non-overlapping segments." : phase === "update" ? "Only the leaf-to-root path changes." : "Leaves first, parent sums next.",
    );
  }
  return result;
}

const CODE_684 = [
  "class Solution:",
  "    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:",
  "        n = len(edges)",
  "",
  "        parent = list(range(n + 1))",
  "        rank = [0] * (n + 1)",
  "",
  "        def find(x):",
  "            if parent[x] != x:",
  "                parent[x] = find(parent[x])   # Path Compression",
  "            return parent[x]",
  "",
  "        def union(x, y):",
  "            root_x = find(x)",
  "            root_y = find(y)",
  "",
  "            # Already connected -> cycle",
  "            if root_x == root_y:",
  "                return False",
  "",
  "            # Union by Rank",
  "            if rank[root_x] < rank[root_y]:",
  "                parent[root_x] = root_y",
  "",
  "            elif rank[root_x] > rank[root_y]:",
  "                parent[root_y] = root_x",
  "",
  "            else:",
  "                parent[root_y] = root_x",
  "                rank[root_x] += 1",
  "",
  "            return True",
  "",
  "        for u, v in edges:",
  "            if not union(u, v):",
  "                return [u, v]",
  "",
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
        { name: "root_x / root_y", value: `${roots.u ?? "—"} / ${roots.v ?? "—"}` },
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
  emit(3, "n-init", { phase: "setup", note: label(`n = ${n}, nên các node hợp lệ nằm trong 1..${n}.`, `n = ${n}, so valid node labels are 1..${n}.`) });
  parentReady = true;
  emit(5, "parent-init", { phase: "setup" });
  rankReady = true;
  emit(6, "rank-init", { phase: "setup" });
  emit(8, "define-find", { phase: "setup" });
  emit(13, "define-union", { phase: "setup", note: label("union(x, y) sẽ trả False nếu cạnh nối hai node đã cùng nhóm.", "union(x, y) returns False when the endpoints are already connected.") });

  function findWithTrace(value, endpoint) {
    const path = [value];
    let cursor = value;
    while (parent[cursor] !== cursor) {
      emit(9, "find-check", {
        phase: "find",
        findState: { endpoint, start: value, current: cursor, path, root: null, compressed: [], condition: true },
      });
      cursor = parent[cursor];
      path.push(cursor);
    }
    const root = cursor;
    emit(9, "find-check", {
      phase: "find",
      findState: { endpoint, start: value, current: cursor, path, root, compressed: [], condition: false },
    });
    const compressed = [];
    emit(11, "find-return", {
      phase: "find",
      findState: { endpoint, start: value, current: root, path, root, compressed, condition: false },
    });
    for (const node of path.slice(0, -1).reverse()) {
      parent[node] = root;
      compressed.push(node);
      emit(10, "path-compress", {
        phase: "find",
        findState: { endpoint, start: value, current: node, path, root, compressed, condition: false },
      });
      emit(11, "find-return", {
        phase: "find",
        findState: { endpoint, start: value, current: node, path, root, compressed, condition: false },
      });
    }
    return root;
  }

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
    currentEdgeIndex = edgeIndex;
    const [u, v] = edges[edgeIndex];
    roots = { u: null, v: null };
    emit(34, "edge-loop", { phase: "edge", edgeState: "current" });
    emit(35, "union-call", {
      phase: "edge",
      edgeState: "current",
      note: label(`Gọi union(${u}, ${v}); nếu trả False thì cạnh này tạo cycle.`, `Call union(${u}, ${v}); a False result means this edge forms a cycle.`),
    });
    roots.u = findWithTrace(u, "u");
    emit(14, "root-x", { phase: "compare", edgeState: "current" });
    roots.v = findWithTrace(v, "v");
    emit(15, "root-y", { phase: "compare", edgeState: "current" });
    const createsCycle = roots.u === roots.v;
    emit(18, "cycle-check", {
      phase: "compare",
      edgeState: createsCycle ? "redundant" : "current",
      note: createsCycle
        ? label(`Hai đầu cùng root ${roots.u}; thêm cạnh sẽ khép chu trình.`, `Both endpoints have root ${roots.u}; adding the edge closes a cycle.`)
        : label(`Root ${roots.u} và ${roots.v} khác nhau; có thể union.`, `Roots ${roots.u} and ${roots.v} differ, so union is safe.`),
    });
    if (createsCycle) {
      emit(19, "union-false", {
        phase: "compare",
        edgeState: "redundant",
        note: label("union trả False vì hai đầu cạnh đã nằm trong cùng component.", "union returns False because both endpoints are already in the same component."),
      });
      answer = [u, v];
      emit(36, "return-redundant", {
        phase: "done",
        edgeState: "redundant",
        final: true,
        note: label(`Cạnh [${u}, ${v}] là cạnh đầu tiên nối hai node đã liên thông.`, `Edge [${u}, ${v}] is the first edge joining already-connected nodes.`),
      });
      return { original: edges, answer, steps };
    }

    const leftRankIsSmaller = rank[roots.u] < rank[roots.v];
    emit(22, "rank-less-check", { phase: "union", edgeState: "current" });
    if (leftRankIsSmaller) {
      parent[roots.u] = roots.v;
      acceptedIndexes.add(edgeIndex);
      emit(23, "attach-x-to-y", {
        phase: "union",
        edgeState: "accepted",
        note: label(`rank[${roots.u}] nhỏ hơn, nên root ${roots.u} trỏ vào root ${roots.v}.`, `rank[${roots.u}] is smaller, so root ${roots.u} points to root ${roots.v}.`),
      });
    } else {
      const leftRankIsLarger = rank[roots.u] > rank[roots.v];
      emit(25, "rank-greater-check", { phase: "union", edgeState: "current" });
      if (leftRankIsLarger) {
        parent[roots.v] = roots.u;
        acceptedIndexes.add(edgeIndex);
        emit(26, "attach-y-to-x", {
          phase: "union",
          edgeState: "accepted",
          note: label(`rank[${roots.u}] lớn hơn, nên root ${roots.v} trỏ vào root ${roots.u}.`, `rank[${roots.u}] is larger, so root ${roots.v} points to root ${roots.u}.`),
        });
      } else {
        emit(28, "equal-rank-branch", { phase: "union", edgeState: "current" });
        parent[roots.v] = roots.u;
        acceptedIndexes.add(edgeIndex);
        emit(29, "attach-y-to-x", {
          phase: "union",
          edgeState: "accepted",
          note: label(`Hai rank bằng nhau; chọn root ${roots.u} làm root mới.`, `The ranks are equal; choose root ${roots.u} as the new root.`),
        });
        rank[roots.u]++;
        emit(30, "rank-increment", { phase: "union", edgeState: "accepted" });
      }
    }
    emit(32, "union-true", {
      phase: "union",
      edgeState: "accepted",
      note: label("union trả True: cạnh không tạo cycle.", "union returns True: the edge does not create a cycle."),
    });
  }

  currentEdgeIndex = -1;
  emit(38, "return-empty", { phase: "done", final: true });
  return { original: edges, answer, steps };
}

function flightDiagnostic787(result) {
  const {n,flights,src,dst}=result;
  if(!Number.isInteger(n)||n>100||n<1||!Array.isArray(flights))return null;
  const costs=Array(n).fill(Infinity),paths=Array(n).fill(null),done=new Set();costs[src]=0;paths[src]=[];
  for(let i=0;i<n;i++) {
    let u=-1;for(let city=0;city<n;city++)if(!done.has(city)&&(u<0||costs[city]<costs[u]))u=city;
    if(u<0||!Number.isFinite(costs[u]))break;
    if(u===dst)return {nodes:[src,...paths[u].map(edge=>edge.v)],edges:paths[u],cost:costs[u]};
    done.add(u);
    for(const [from,to,w] of flights)if(from===u&&costs[u]+w<costs[to]){
      costs[to]=costs[u]+w;paths[to]=[...paths[u],{u:from,v:to,w}];
    }
  }
  return null;
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
  const numberOf=(step,names)=>{
    const raw=findVariable(step,name=>names.includes(name));
    if(raw===null||raw===undefined||raw==="")return null;
    const numeric=Number(raw);return Number.isFinite(numeric)?numeric:null;
  };
  let frozen=null,round=null,popped={city:null,price:null,used:null},heapSnapshot=[],bestSnapshot=null;
  const parseHeap=raw=>[...String(raw).matchAll(/\(([-\d.]+),\s*(\d+),\s*(\d+)\)/g)].map(match=>({price:Number(match[1]),city:Number(match[2]),used:Number(match[3])}));
  const parseBest=raw=>{
    const rows=Array.from({length:result.n},()=>[]);
    for(const match of String(raw).matchAll(/(\d+):\[([^\]]*)\]/g))rows[Number(match[1])]=parseVector('['+match[2]+']');
    return rows;
  };

  for (const step of result.steps || []) {
    const line = Number(step.codeLines?.[0] || 0);
    const variables = (step.vars || []).map((variable) => ({ name: variableName(variable), value: variable.value }));
    const currentEdge = step.graph?.hlEdges?.[0] || null;
    const graphNodes = step.graph?.nodes || [];
    const costs = graphNodes.map((node) => node.dist === "∞" || node.dist === Infinity ? null : Number(node.dist));
    const rawOld = parseVector(findVariable(step, (name) => name.includes("cost (chỉ đọc)")));
    const nextCost = parseVector(findVariable(step, (name) => name === "next_cost" || name.startsWith("next_cost (")));
    const explicitRound = numberOf(step, ["allowed flights", "max flights"]);
    if(approach===1&&line>=9&&line<=14&&explicitRound!==null)round=explicitRound;
    if(approach===1&&line===9)frozen=[...costs];
    if(rawOld)frozen=[...rawOld];
    const oldCost=approach===1&&line>=9&&line<=14?frozen:null;
    for(const key of ['used','price']){const value=numberOf(step,[key]);if(value!==null)popped[key]=value;}
    const explicitCity=numberOf(step,['u']);if(explicitCity!==null)popped.city=explicitCity;
    const allowedFlights=approach===1?round:(Number.isInteger(result.k)?result.k+1:null);
    const used=approach===1?numberOf(step,['used']):popped.used,price=approach===1?numberOf(step,['price']):popped.price,city=approach===1?numberOf(step,['u']):popped.city;
    const rawCandidate=findVariable(step, name=>name==='candidate'||name==='new_price');
    const candidate=rawCandidate===null?null:typeof rawCandidate==='number'?rawCandidate:Number(String(rawCandidate).split('=').at(-1).trim());
    const heap = findVariable(step, (name) => name === "heap" || name === "heap còn lại");
    const best = findVariable(step, (name) => name === "best" || name === "best[city][used]");
    if(heap!==null)heapSnapshot=parseHeap(heap);
    if(best!==null&&approach===2)bestSnapshot=parseBest(best);
    const path=step.final&&result.answer!==-1&&step.graph?{
      nodes:[...step.graph.hlNodes],
      edges:step.graph.hlEdges.map(([u,v])=>({u,v,w:flights.find(edge=>edge[0]===u&&edge[1]===v)?.[2]??0})),
      cost:result.answer,
    }:null;
    const diagnostic=step.final?flightDiagnostic787(result):null;
    const invalidRoute=diagnostic&&diagnostic.edges.length>result.k+1&&(result.answer===-1||diagnostic.cost<result.answer)?diagnostic:null;
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
      heapStates:heapSnapshot.map(state=>({...state})),
      bestMatrix:bestSnapshot?bestSnapshot.map(row=>[...row]):null,
      nextUsed:numberOf(step,['next_used']),
      path,
      invalidRoute,
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
    const original = registry[847].builder;
    registry[847].builder = (input, params = {}) => enhance847(original(input, params), input, params);
    registry[847].debugMode = "semantic";
    registry[847].tags = [...(registry[847].tags || []), { key: "bitmask-bfs", vi: "Bitmask BFS", en: "Bitmask BFS" }];
  }
}

function installUnionFind(registry) {
  if (!registry[684]) return;
  registry[684].builder = buildSteps684Custom;
  registry[684].code = CODE_684;
  registry[684].debugMode = "line-by-line";
}

function installHashmap(registry) {
  if (!registry[307]) return;
  const original = registry[307].builder;
  registry[307].builder = (input, params) => enhance307(original(input, params));
  registry[307].debugMode = "line-by-line";
}

module.exports = { installGraph, installHashmap, installUnionFind };
