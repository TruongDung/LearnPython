"use strict";

const CAT_MOUSE_913_MAX_NODES = 10;
const CAT_MOUSE_913_MAX_EDGES = 24;
const CAT_MOUSE_913_TRACE_LIMIT = 480;
const CAT_MOUSE_913_TABLE_LIMIT = 16;
const CAT_MOUSE_913_QUEUE_LIMIT = 16;

const MIN_COST_1928_MAX_NODES = 12;
const MIN_COST_1928_MAX_EDGES = 30;
const MIN_COST_1928_MAX_TIME = 100;
const MIN_COST_1928_MAX_STATES = 1500;
const MIN_COST_1928_TRACE_LIMIT = 480;
const MIN_COST_1928_TABLE_LIMIT = 14;

const CAT_MOUSE_913_SOURCE = Object.freeze([
  "from collections import deque",
  "",
  "class Solution:",
  "    def catMouseGame(self, graph):",
  "        DRAW, MOUSE, CAT = 0, 1, 2",
  "        MOUSE_TURN, CAT_TURN = 0, 1",
  "        n = len(graph)",
  "        color = [[[DRAW] * 2 for _ in range(n)] for _ in range(n)]",
  "        degree = [[[0] * 2 for _ in range(n)] for _ in range(n)]",
  "        queue = deque()",
  "",
  "        for mouse in range(n):",
  "            for cat in range(1, n):",
  "                degree[mouse][cat][MOUSE_TURN] = len(graph[mouse])",
  "                degree[mouse][cat][CAT_TURN] = sum(nxt != 0 for nxt in graph[cat])",
  "",
  "        def resolve(mouse, cat, turn, winner):",
  "            if color[mouse][cat][turn] == DRAW:",
  "                color[mouse][cat][turn] = winner",
  "                queue.append((mouse, cat, turn, winner))",
  "",
  "        for cat in range(1, n):",
  "            resolve(0, cat, MOUSE_TURN, MOUSE)",
  "            resolve(0, cat, CAT_TURN, MOUSE)",
  "        for node in range(1, n):",
  "            resolve(node, node, MOUSE_TURN, CAT)",
  "            resolve(node, node, CAT_TURN, CAT)",
  "        for mouse in range(n):",
  "            for cat in range(1, n):",
  "                if degree[mouse][cat][MOUSE_TURN] == 0:",
  "                    resolve(mouse, cat, MOUSE_TURN, CAT)",
  "                if degree[mouse][cat][CAT_TURN] == 0:",
  "                    resolve(mouse, cat, CAT_TURN, MOUSE)",
  "",
  "        while queue:",
  "            mouse, cat, turn, winner = queue.popleft()",
  "            if turn == CAT_TURN:",
  "                parents = ((prev, cat, MOUSE_TURN) for prev in graph[mouse])",
  "            else:",
  "                parents = ((mouse, prev, CAT_TURN) for prev in graph[cat] if prev != 0)",
  "            for pm, pc, pturn in parents:",
  "                if color[pm][pc][pturn] != DRAW:",
  "                    continue",
  "                mover = MOUSE if pturn == MOUSE_TURN else CAT",
  "                if winner == mover:",
  "                    resolve(pm, pc, pturn, winner)",
  "                else:",
  "                    degree[pm][pc][pturn] -= 1",
  "                    if degree[pm][pc][pturn] == 0:",
  "                        resolve(pm, pc, pturn, CAT if mover == MOUSE else MOUSE)",
  "",
  "        # States left DRAW after retrograde propagation are genuine draws.",
  "        return color[1][2][MOUSE_TURN]",
]);

const MIN_COST_1928_SOURCE = Object.freeze([
  "from math import inf",
  "from typing import List",
  "",
  "class Solution:",
  "    def minCost(self, maxTime: int, edges: List[List[int]], passingFees: List[int]) -> int:",
  "        n = len(passingFees)",
  "        graph = [[] for _ in range(n)]",
  "        for u, v, travel in edges:",
  "            graph[u].append((v, travel))",
  "            graph[v].append((u, travel))",
  "",
  "        dp = [[inf] * n for _ in range(maxTime + 1)]",
  "        dp[0][0] = passingFees[0]",
  "",
  "        for elapsed in range(maxTime + 1):",
  "            for node in range(n):",
  "                if dp[elapsed][node] == inf:",
  "                    continue",
  "                for nxt, travel in graph[node]:",
  "                    arrival = elapsed + travel",
  "                    if arrival > maxTime:",
  "                        continue",
  "                    candidate = dp[elapsed][node] + passingFees[nxt]",
  "                    if candidate < dp[arrival][nxt]:",
  "                        dp[arrival][nxt] = candidate",
  "",
  "        answer = min(dp[elapsed][n - 1] for elapsed in range(maxTime + 1))",
  "        return -1 if answer == inf else answer",
]);

const localized = (vi, en) => ({ vi, en });
const jsonSnapshot = (value) => JSON.parse(JSON.stringify(value));

function assertSemanticLines(lines, source, problemId) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.some((line) => (
    !Number.isInteger(line) || line < 1 || line > source.length
  ))) {
    throw new Error(`Problem ${problemId} emitted invalid semantic codeLines.`);
  }
}

function parseStrictInteger(value, label) {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  throw new TypeError(`${label} must be a safe integer.`);
}

function assertConnectedUndirectedGraph(nodeCount, edges, label) {
  const adjacency = Array.from({ length: nodeCount }, () => []);
  for (const [u, v] of edges) {
    adjacency[u].push(v);
    adjacency[v].push(u);
  }
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const node = stack.pop();
    for (const next of adjacency[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  if (seen.size !== nodeCount) {
    throw new RangeError(`${label} must be connected.`);
  }
}

function parseCatMouse913Input(input) {
  let candidate;
  if (Array.isArray(input)) {
    candidate = input;
  } else if (typeof input === "string") {
    const text = input.trim();
    if (!text) throw new RangeError("Cat and Mouse graph must be nonempty.");
    try {
      candidate = JSON.parse(text);
    } catch (_error) {
      throw new TypeError("Cat and Mouse input must be a valid JSON adjacency list.");
    }
  } else {
    throw new TypeError("Cat and Mouse input must be a JSON adjacency-list string or an array.");
  }

  if (!Array.isArray(candidate)) {
    throw new TypeError("Cat and Mouse graph must be an adjacency list.");
  }
  if (candidate.length < 3 || candidate.length > CAT_MOUSE_913_MAX_NODES) {
    throw new RangeError(`Cat and Mouse visualization supports 3 to ${CAT_MOUSE_913_MAX_NODES} nodes.`);
  }

  const n = candidate.length;
  const graph = candidate.map((rawNeighbors, node) => {
    if (!Array.isArray(rawNeighbors) || rawNeighbors.length === 0) {
      throw new TypeError(`graph[${node}] must be a nonempty neighbor array.`);
    }
    const neighbors = rawNeighbors.map((neighbor) => {
      if (!Number.isSafeInteger(neighbor) || neighbor < 0 || neighbor >= n) {
        throw new RangeError(`Every Cat and Mouse neighbor must be an integer from 0 to ${n - 1}.`);
      }
      if (neighbor === node) {
        throw new RangeError(`Self-loop ${node}-${neighbor} is not allowed.`);
      }
      return neighbor;
    });
    if (new Set(neighbors).size !== neighbors.length) {
      throw new RangeError(`graph[${node}] contains a duplicate neighbor.`);
    }
    return neighbors;
  });

  const neighborSets = graph.map((neighbors) => new Set(neighbors));
  const edges = [];
  for (let u = 0; u < n; u += 1) {
    for (const v of graph[u]) {
      if (!neighborSets[v].has(u)) {
        throw new RangeError(`Cat and Mouse graph must be undirected: ${u}-${v} is missing its reverse entry.`);
      }
      if (u < v) edges.push([u, v]);
    }
  }
  if (edges.length > CAT_MOUSE_913_MAX_EDGES) {
    throw new RangeError(`Cat and Mouse visualization supports at most ${CAT_MOUSE_913_MAX_EDGES} undirected edges.`);
  }
  assertConnectedUndirectedGraph(n, edges, "Cat and Mouse graph");
  return graph.map((neighbors) => [...neighbors]);
}

function parseRoads1928(rawEdges) {
  let candidate;
  if (Array.isArray(rawEdges)) {
    candidate = rawEdges;
  } else if (typeof rawEdges === "string") {
    const text = rawEdges.trim();
    if (!text) throw new RangeError("Minimum Cost roads must be nonempty.");
    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (_error) {
        throw new TypeError("Minimum Cost roads must be valid JSON.");
      }
    } else {
      const chunks = text.split(";");
      if (chunks.some((chunk) => !chunk.trim())) {
        throw new TypeError("Minimum Cost compact roads cannot contain an empty edge.");
      }
      candidate = chunks.map((chunk, index) => {
        const cells = chunk.split(",");
        if (cells.length !== 3 || cells.some((cell) => !cell.trim())) {
          throw new TypeError(`Road ${index + 1} must contain exactly u,v,time.`);
        }
        return cells.map((cell, cellIndex) => parseStrictInteger(
          cell,
          `Road ${index + 1} value ${cellIndex + 1}`,
        ));
      });
    }
  } else {
    throw new TypeError("Minimum Cost roads must be a compact string, JSON string, or edge array.");
  }

  if (!Array.isArray(candidate) || candidate.length === 0) {
    throw new RangeError("Minimum Cost input must contain at least one road.");
  }
  if (candidate.length > MIN_COST_1928_MAX_EDGES) {
    throw new RangeError(`Minimum Cost visualization supports at most ${MIN_COST_1928_MAX_EDGES} roads.`);
  }
  return candidate.map((rawEdge, index) => {
    if (!Array.isArray(rawEdge) || rawEdge.length !== 3) {
      throw new TypeError(`Road ${index + 1} must be a three-integer array [u,v,time].`);
    }
    return rawEdge.map((value, cellIndex) => parseStrictInteger(
      value,
      `Road ${index + 1} value ${cellIndex + 1}`,
    ));
  });
}

function parsePassingFees1928(rawFees) {
  let candidate;
  if (Array.isArray(rawFees)) {
    candidate = rawFees;
  } else if (typeof rawFees === "string") {
    const text = rawFees.trim();
    if (!text) throw new RangeError("passingFees must be nonempty.");
    if (text.startsWith("[")) {
      try {
        candidate = JSON.parse(text);
      } catch (_error) {
        throw new TypeError("passingFees must be valid JSON or comma-separated integers.");
      }
    } else {
      const cells = text.split(",");
      if (cells.some((cell) => !cell.trim())) {
        throw new TypeError("passingFees cannot contain an empty value.");
      }
      candidate = cells.map((cell, index) => parseStrictInteger(cell, `passingFees[${index}]`));
    }
  } else {
    throw new TypeError("passingFees must be a JSON array, comma-separated string, or integer array.");
  }

  if (!Array.isArray(candidate)) {
    throw new TypeError("passingFees must be an array.");
  }
  return candidate.map((fee, index) => parseStrictInteger(fee, `passingFees[${index}]`));
}

function parseMinCost1928Input(input, params = {}) {
  const safeParams = params && typeof params === "object" ? params : {};
  const objectInput = input && typeof input === "object" && !Array.isArray(input)
    ? input
    : null;
  const rawEdges = objectInput ? objectInput.edges : input;
  const rawMaxTime = objectInput && objectInput.maxTime !== undefined
    ? objectInput.maxTime
    : safeParams.maxTime;
  const rawFees = objectInput && objectInput.passingFees !== undefined
    ? objectInput.passingFees
    : safeParams.passingFees;

  const maxTime = parseStrictInteger(rawMaxTime, "maxTime");
  if (maxTime < 1 || maxTime > MIN_COST_1928_MAX_TIME) {
    throw new RangeError(`Minimum Cost visualization supports maxTime from 1 to ${MIN_COST_1928_MAX_TIME}.`);
  }

  const passingFees = parsePassingFees1928(rawFees);
  if (passingFees.length < 2 || passingFees.length > MIN_COST_1928_MAX_NODES) {
    throw new RangeError(`Minimum Cost visualization supports 2 to ${MIN_COST_1928_MAX_NODES} nodes.`);
  }
  passingFees.forEach((fee, node) => {
    if (fee < 1 || fee > 1000) {
      throw new RangeError(`passingFees[${node}] must be from 1 to 1000.`);
    }
  });

  const n = passingFees.length;
  if (n * (maxTime + 1) > MIN_COST_1928_MAX_STATES) {
    throw new RangeError(`Minimum Cost visualization supports at most ${MIN_COST_1928_MAX_STATES} time-node states.`);
  }

  const edges = parseRoads1928(rawEdges);
  const pairs = new Set();
  edges.forEach(([u, v, travel], index) => {
    if (u < 0 || u >= n || v < 0 || v >= n) {
      throw new RangeError(`Road ${index + 1} endpoints must be from 0 to ${n - 1}.`);
    }
    if (u === v) throw new RangeError(`Road ${index + 1} cannot be a self-loop.`);
    if (travel < 1 || travel > 1000) {
      throw new RangeError(`Road ${index + 1} travel time must be from 1 to 1000.`);
    }
    const pair = u < v ? `${u}:${v}` : `${v}:${u}`;
    if (pairs.has(pair)) {
      throw new RangeError(`Duplicate road between ${Math.min(u, v)} and ${Math.max(u, v)} is not allowed.`);
    }
    pairs.add(pair);
  });
  assertConnectedUndirectedGraph(n, edges, "Minimum Cost road graph");

  return {
    maxTime,
    edges: edges.map((edge) => [...edge]),
    passingFees: [...passingFees],
  };
}

function buildSteps913(input) {
  const graph = parseCatMouse913Input(input);
  const n = graph.length;
  const DRAW = 0;
  const MOUSE = 1;
  const CAT = 2;
  const MOUSE_TURN = 0;
  const CAT_TURN = 1;
  const phases = [
    localized("Dựng không gian trạng thái", "Build product-state space"),
    localized("Gieo trạng thái kết thúc", "Seed terminal states"),
    localized("BFS hồi quy", "Retrograde BFS"),
    localized("Phân loại hòa", "Classify draws"),
    localized("Kết quả", "Result"),
  ];
  const edges = [];
  for (let u = 0; u < n; u += 1) {
    for (const v of graph[u]) if (u < v) edges.push({ u, v });
  }

  const color = Array.from({ length: n }, () => (
    Array.from({ length: n }, () => [DRAW, DRAW])
  ));
  const degree = Array.from({ length: n }, () => (
    Array.from({ length: n }, () => [0, 0])
  ));
  const queue = [];
  const steps = [];
  const recentStates = [];
  let queueHead = 0;
  let traceDropped = 0;
  let activeChild = null;
  let activeParent = null;
  let activeEdge = null;

  const counters = {
    legalStates: n * (n - 1) * 2,
    seeded: 0,
    resolved: 0,
    queuePops: 0,
    parentsExamined: 0,
    immediateWins: 0,
    degreeReductions: 0,
    forcedLosses: 0,
    skippedResolved: 0,
  };

  const stateKey = (state) => state ? `${state.mouse}:${state.cat}:${state.turn}` : null;
  const turnCode = (turn) => turn === MOUSE_TURN ? "MOUSE" : "CAT";
  const outcomeCode = (outcome) => (
    outcome === MOUSE ? "MOUSE" : outcome === CAT ? "CAT" : "DRAW"
  );
  const outcomeState = (outcome) => (
    outcome === MOUSE ? "success" : outcome === CAT ? "danger" : "muted"
  );
  const stateText = (state) => state
    ? `(m=${state.mouse}, c=${state.cat}, ${turnCode(state.turn)})`
    : "—";

  function touchState(state) {
    if (!state || state.cat === 0) return;
    const key = stateKey(state);
    const existing = recentStates.findIndex((item) => stateKey(item) === key);
    if (existing !== -1) recentStates.splice(existing, 1);
    recentStates.unshift({ mouse: state.mouse, cat: state.cat, turn: state.turn });
    if (recentStates.length > CAT_MOUSE_913_TABLE_LIMIT * 2) recentStates.pop();
  }

  function countOutcomes() {
    const result = { draw: 0, mouse: 0, cat: 0 };
    for (let mouse = 0; mouse < n; mouse += 1) {
      for (let cat = 1; cat < n; cat += 1) {
        for (let turn = 0; turn < 2; turn += 1) {
          const outcome = color[mouse][cat][turn];
          if (outcome === MOUSE) result.mouse += 1;
          else if (outcome === CAT) result.cat += 1;
          else result.draw += 1;
        }
      }
    }
    return result;
  }

  function selectedStates() {
    const selected = [];
    const seen = new Set();
    const add = (state) => {
      if (!state || state.cat < 1 || state.cat >= n || state.mouse < 0 || state.mouse >= n) return;
      const normalized = { mouse: state.mouse, cat: state.cat, turn: state.turn };
      const key = stateKey(normalized);
      if (seen.has(key) || selected.length >= CAT_MOUSE_913_TABLE_LIMIT) return;
      seen.add(key);
      selected.push(normalized);
    };

    add(activeParent);
    add(activeChild);
    add({ mouse: 1, cat: 2, turn: MOUSE_TURN });
    add({ mouse: 1, cat: 2, turn: CAT_TURN });
    for (let index = queueHead; index < queue.length && selected.length < CAT_MOUSE_913_TABLE_LIMIT; index += 1) {
      add(queue[index]);
    }
    recentStates.forEach(add);
    for (const wanted of [MOUSE, CAT, DRAW]) {
      for (let mouse = 0; mouse < n && selected.length < CAT_MOUSE_913_TABLE_LIMIT; mouse += 1) {
        for (let cat = 1; cat < n && selected.length < CAT_MOUSE_913_TABLE_LIMIT; cat += 1) {
          for (let turn = 0; turn < 2 && selected.length < CAT_MOUSE_913_TABLE_LIMIT; turn += 1) {
            if (color[mouse][cat][turn] === wanted) add({ mouse, cat, turn });
          }
        }
      }
    }
    return selected;
  }

  function queueView() {
    const remaining = queue.length - queueHead;
    const visibleCount = Math.min(remaining, CAT_MOUSE_913_QUEUE_LIMIT);
    const visible = [];
    const directLimit = remaining > CAT_MOUSE_913_QUEUE_LIMIT
      ? CAT_MOUSE_913_QUEUE_LIMIT - 1
      : visibleCount;
    for (let index = 0; index < directLimit; index += 1) {
      const entry = queue[queueHead + index];
      visible.push({
        label: stateText(entry),
        sub: `winner=${outcomeCode(entry.winner)}`,
        state: index === 0 ? "active" : outcomeState(entry.winner),
      });
    }
    if (remaining > CAT_MOUSE_913_QUEUE_LIMIT) {
      visible.push({
        label: `… +${remaining - directLimit}`,
        sub: "bounded queue preview",
        state: "muted",
      });
    }
    return visible;
  }

  function graphView() {
    const mouseNode = activeChild ? activeChild.mouse : null;
    const catNode = activeChild ? activeChild.cat : null;
    return {
      layout: "circle",
      nodes: Array.from({ length: n }, (_, id) => {
        const roles = [];
        if (id === 0) roles.push("hole");
        if (id === mouseNode) roles.push("mouse");
        if (id === catNode) roles.push("cat");
        let state = "default";
        if (id === mouseNode && id === catNode) state = "warning";
        else if (id === mouseNode) state = "success";
        else if (id === catNode) state = "danger";
        else if (id === 0) state = "info";
        return { id, label: String(id), sub: roles.join(" · "), state };
      }),
      edges: edges.map(({ u, v }) => ({
        u,
        v,
        directed: false,
        state: activeEdge && (
          (activeEdge.u === u && activeEdge.v === v)
          || (activeEdge.u === v && activeEdge.v === u)
        ) ? "active" : "default",
      })),
    };
  }

  function tableView() {
    return {
      title: localized(
        `Tối đa ${CAT_MOUSE_913_TABLE_LIMIT} trạng thái tích (đang hoạt động, queue, gần đây)`,
        `Up to ${CAT_MOUSE_913_TABLE_LIMIT} product states (active, queued, recent)`,
      ),
      columns: [
        localized("Lượt", "Turn"),
        localized("Kết quả", "Outcome"),
        localized("Bậc còn lại", "Remaining degree"),
      ],
      rows: selectedStates().map((state) => {
        const outcome = color[state.mouse][state.cat][state.turn];
        const isParent = stateKey(state) === stateKey(activeParent);
        const isChild = stateKey(state) === stateKey(activeChild);
        return {
          label: `(m=${state.mouse}, c=${state.cat})`,
          state: isParent ? "active" : isChild ? "info" : outcomeState(outcome),
          cells: [
            { value: turnCode(state.turn), state: state.turn === MOUSE_TURN ? "success" : "danger" },
            { value: outcomeCode(outcome), state: outcomeState(outcome) },
            { value: degree[state.mouse][state.cat][state.turn], state: degree[state.mouse][state.cat][state.turn] === 0 ? "warning" : "default" },
          ],
        };
      }),
    };
  }

  function makeHardView({ phaseIndex, action, formula, answerValue }) {
    const totals = countOutcomes();
    const currentOutcome = activeChild
      ? color[activeChild.mouse][activeChild.cat][activeChild.turn]
      : DRAW;
    return jsonSnapshot({
      problemId: 913,
      phaseIndex,
      phases,
      phase: ["setup", "seed", "retrograde", "draws", "done"][phaseIndex],
      action,
      formula,
      metrics: [
        { label: localized("Trạng thái hợp lệ", "Legal states"), value: counters.legalStates, state: "info" },
        { label: localized("Chuột thắng", "Mouse wins"), value: totals.mouse, state: "success" },
        { label: localized("Mèo thắng", "Cat wins"), value: totals.cat, state: "danger" },
        { label: localized("Chưa giải / hòa", "Unresolved / draw"), value: totals.draw, state: "muted" },
        { label: localized("Queue còn lại", "Queue remaining"), value: queue.length - queueHead, state: "active" },
      ],
      graph: graphView(),
      table: tableView(),
      queue: queueView(),
      groups: [
        {
          title: localized("Trạng thái đang lan truyền", "Propagation state"),
          items: [
            { label: "child", value: stateText(activeChild), state: outcomeState(currentOutcome) },
            { label: "parent", value: stateText(activeParent), state: activeParent ? "active" : "muted" },
          ],
        },
        {
          title: localized("Bộ đếm", "Counters"),
          items: [
            { label: "pops", value: counters.queuePops, state: "info" },
            { label: "degree--", value: counters.degreeReductions, state: "warning" },
            { label: "forced", value: counters.forcedLosses, state: "danger" },
          ],
        },
      ],
      sequence: [
        ...(activeParent ? [{ label: "parent", value: stateText(activeParent), state: "active" }] : []),
        ...(activeChild ? [{ label: "child", value: stateText(activeChild), state: outcomeState(currentOutcome) }] : []),
      ],
      legend: [
        { label: localized("Chuột thắng", "Mouse win"), state: "success" },
        { label: localized("Mèo thắng", "Cat win"), state: "danger" },
        { label: localized("Hòa / chưa giải", "Draw / unresolved"), state: "muted" },
        { label: localized("Trạng thái cha đang xét", "Parent under inspection"), state: "active" },
      ],
      answer: answerValue,
      traceTruncated: traceDropped > 0,
    });
  }

  function emit({
    title,
    note,
    codeLines,
    phaseIndex,
    action,
    formula,
    final = false,
    answerValue = null,
  }) {
    assertSemanticLines(codeLines, CAT_MOUSE_913_SOURCE, 913);
    if (!final && steps.length >= CAT_MOUSE_913_TRACE_LIMIT - 1) {
      traceDropped += 1;
      return;
    }
    const highlighted = activeChild
      ? [...new Set([activeChild.mouse, activeChild.cat])]
      : [];
    const marked = activeParent
      ? [...new Set([activeParent.mouse, activeParent.cat])]
      : [];
    steps.push({
      title,
      note,
      codeLines: [...codeLines],
      vars: [
        { name: "child", value: stateText(activeChild) },
        { name: "parent", value: stateText(activeParent) },
        { name: "queue", value: queue.length - queueHead },
        { name: "resolved", value: counters.resolved },
        ...(answerValue === null ? [] : [{ name: "answer", value: answerValue }]),
      ],
      arr: [],
      sub: [],
      highlight: highlighted,
      mark: marked,
      final: Boolean(final),
      hardProblemView: makeHardView({ phaseIndex, action, formula, answerValue }),
    });
  }

  for (let mouse = 0; mouse < n; mouse += 1) {
    for (let cat = 1; cat < n; cat += 1) {
      degree[mouse][cat][MOUSE_TURN] = graph[mouse].length;
      degree[mouse][cat][CAT_TURN] = graph[cat].filter((next) => next !== 0).length;
    }
  }
  emit({
    title: localized("Dựng bậc cho mọi trạng thái (mouse, cat, turn)", "Build degrees for every (mouse, cat, turn) state"),
    note: localized(
      "Bậc là số nước đi hợp lệ. Ở lượt mèo, mọi cạnh đi vào lỗ 0 bị loại khỏi bậc.",
      "A degree counts legal moves. On the cat turn, every edge entering hole 0 is excluded.",
    ),
    codeLines: [7, 8, 9, 10, 12, 13, 14, 15],
    phaseIndex: 0,
    action: localized("Khởi tạo màu, bậc và queue", "Initialize colors, degrees, and queue"),
    formula: localized("degree(m,c,M)=|graph[m]|; degree(m,c,C)=|graph[c] \\ {0}|", "degree(m,c,M)=|graph[m]|; degree(m,c,C)=|graph[c] \\ {0}|"),
  });

  function resolveState(mouse, cat, turn, winner) {
    if (color[mouse][cat][turn] !== DRAW) return false;
    color[mouse][cat][turn] = winner;
    const entry = { mouse, cat, turn, winner };
    queue.push(entry);
    counters.resolved += 1;
    touchState(entry);
    return true;
  }

  for (let cat = 1; cat < n; cat += 1) {
    for (const turn of [MOUSE_TURN, CAT_TURN]) {
      if (!resolveState(0, cat, turn, MOUSE)) continue;
      counters.seeded += 1;
      activeChild = { mouse: 0, cat, turn };
      activeParent = null;
      activeEdge = null;
      emit({
        title: localized(`Chuột ở lỗ: ${stateText(activeChild)} → MOUSE`, `Mouse is in the hole: ${stateText(activeChild)} → MOUSE`),
        note: localized("Chuột đã tới node 0 nên trạng thái kết thúc là chuột thắng, bất kể lượt kế tiếp.", "The mouse has reached node 0, so this terminal state is a mouse win regardless of the next turn."),
        codeLines: [17, 18, 19, 20, turn === MOUSE_TURN ? 23 : 24],
        phaseIndex: 1,
        action: localized("Gieo trạng thái chuột tới lỗ", "Seed a mouse-at-hole terminal"),
        formula: localized("mouse = 0 ⇒ MOUSE", "mouse = 0 ⇒ MOUSE"),
      });
    }
  }

  for (let node = 1; node < n; node += 1) {
    for (const turn of [MOUSE_TURN, CAT_TURN]) {
      if (!resolveState(node, node, turn, CAT)) continue;
      counters.seeded += 1;
      activeChild = { mouse: node, cat: node, turn };
      activeParent = null;
      activeEdge = null;
      emit({
        title: localized(`Mèo bắt chuột tại node ${node}`, `Cat catches mouse at node ${node}`),
        note: localized("Khi mouse == cat ở ngoài lỗ, mèo đã bắt được chuột nên mèo thắng.", "When mouse == cat away from the hole, the cat has caught the mouse and wins."),
        codeLines: [17, 18, 19, 20, turn === MOUSE_TURN ? 26 : 27],
        phaseIndex: 1,
        action: localized("Gieo trạng thái mèo bắt chuột", "Seed a cat-catches-mouse terminal"),
        formula: localized("mouse = cat ≠ 0 ⇒ CAT", "mouse = cat ≠ 0 ⇒ CAT"),
      });
    }
  }

  for (let mouse = 0; mouse < n; mouse += 1) {
    for (let cat = 1; cat < n; cat += 1) {
      const zeroDegreeSeeds = [
        { turn: MOUSE_TURN, winner: CAT, line: 31 },
        { turn: CAT_TURN, winner: MOUSE, line: 33 },
      ];
      for (const seed of zeroDegreeSeeds) {
        if (degree[mouse][cat][seed.turn] !== 0) continue;
        if (!resolveState(mouse, cat, seed.turn, seed.winner)) continue;
        counters.seeded += 1;
        activeChild = { mouse, cat, turn: seed.turn };
        activeParent = null;
        activeEdge = null;
        emit({
          title: localized(`Không có nước đi hợp lệ: ${stateText(activeChild)}`, `No legal move: ${stateText(activeChild)}`),
          note: localized("Người đang tới lượt không thể đi, vì vậy đối thủ thắng trạng thái này.", "The player to move has no legal move, so the opponent wins this state."),
          codeLines: seed.turn === MOUSE_TURN ? [28, 29, 30, 31] : [28, 29, 32, 33],
          phaseIndex: 1,
          action: localized("Gieo trạng thái bậc 0", "Seed a zero-degree state"),
          formula: localized("degree = 0 ⇒ đối thủ thắng", "degree = 0 ⇒ opponent wins"),
        });
      }
    }
  }

  while (queueHead < queue.length) {
    const childEntry = queue[queueHead];
    queueHead += 1;
    counters.queuePops += 1;
    activeChild = { mouse: childEntry.mouse, cat: childEntry.cat, turn: childEntry.turn };
    activeParent = null;
    activeEdge = null;
    touchState(activeChild);
    emit({
      title: localized(`Lấy ${stateText(activeChild)} = ${outcomeCode(childEntry.winner)}`, `Pop ${stateText(activeChild)} = ${outcomeCode(childEntry.winner)}`),
      note: localized("Đi ngược một nước từ trạng thái đã biết kết quả để chứng minh các trạng thái cha.", "Move one turn backward from a solved child to prove predecessor states."),
      codeLines: [35, 36],
      phaseIndex: 2,
      action: localized("Lấy trạng thái đã giải khỏi queue", "Pop a solved state from the queue"),
      formula: localized("child đã biết ⇒ xét mọi predecessor hợp lệ", "known child ⇒ inspect every legal predecessor"),
    });

    const parents = [];
    if (childEntry.turn === CAT_TURN) {
      for (const previousMouse of graph[childEntry.mouse]) {
        parents.push({ mouse: previousMouse, cat: childEntry.cat, turn: MOUSE_TURN });
      }
    } else {
      for (const previousCat of graph[childEntry.cat]) {
        if (previousCat !== 0) {
          parents.push({ mouse: childEntry.mouse, cat: previousCat, turn: CAT_TURN });
        }
      }
    }

    for (const parent of parents) {
      counters.parentsExamined += 1;
      activeParent = parent;
      touchState(parent);
      activeEdge = parent.turn === MOUSE_TURN
        ? { u: parent.mouse, v: childEntry.mouse }
        : { u: parent.cat, v: childEntry.cat };

      if (color[parent.mouse][parent.cat][parent.turn] !== DRAW) {
        counters.skippedResolved += 1;
        emit({
          title: localized(`Bỏ qua cha đã giải ${stateText(parent)}`, `Skip solved parent ${stateText(parent)}`),
          note: localized("Mỗi trạng thái chỉ được tô màu và đưa vào queue một lần.", "Each state is colored and enqueued at most once."),
          codeLines: [37, 38, 39, 40, 41, 42, 43],
          phaseIndex: 2,
          action: localized("Bỏ qua predecessor đã có kết quả", "Skip an already-solved predecessor"),
          formula: localized("color[parent] ≠ DRAW ⇒ continue", "color[parent] ≠ DRAW ⇒ continue"),
        });
        continue;
      }

      const mover = parent.turn === MOUSE_TURN ? MOUSE : CAT;
      if (childEntry.winner === mover) {
        resolveState(parent.mouse, parent.cat, parent.turn, childEntry.winner);
        counters.immediateWins += 1;
        emit({
          title: localized(`${turnCode(parent.turn)} chọn được nước thắng`, `${turnCode(parent.turn)} can choose a winning move`),
          note: localized(
            `Chỉ cần một nước tới child ${outcomeCode(childEntry.winner)}, người đang đi có thể ép thắng ngay.`,
            `One move to a ${outcomeCode(childEntry.winner)} child is enough for the player to force a win.`,
          ),
          codeLines: [37, 38, 39, 40, 41, 44, 45, 46],
          phaseIndex: 2,
          action: localized("Tô màu cha bằng kết quả thắng của người đi", "Color the parent as a win for the mover"),
          formula: localized("winner(child) = mover(parent) ⇒ color(parent)=winner", "winner(child) = mover(parent) ⇒ color(parent)=winner"),
        });
      } else {
        degree[parent.mouse][parent.cat][parent.turn] -= 1;
        counters.degreeReductions += 1;
        if (degree[parent.mouse][parent.cat][parent.turn] === 0) {
          const forcedWinner = mover === MOUSE ? CAT : MOUSE;
          resolveState(parent.mouse, parent.cat, parent.turn, forcedWinner);
          counters.forcedLosses += 1;
          emit({
            title: localized(`Mọi nước đi của ${turnCode(parent.turn)} đều thua`, `Every ${turnCode(parent.turn)} move loses`),
            note: localized("Bậc còn lại về 0: mọi child đều thắng cho đối thủ, nên cha bị ép thua.", "The remaining degree reached zero: every child wins for the opponent, so the parent is forced to lose."),
            codeLines: [44, 45, 47, 48, 49, 50],
            phaseIndex: 2,
            action: localized("Giải cha bằng quy tắc mọi nước đều thua", "Resolve the parent because all moves lose"),
            formula: localized("degree(parent)=0 ⇒ đối thủ của mover thắng", "degree(parent)=0 ⇒ mover's opponent wins"),
          });
        } else {
          emit({
            title: localized(`Giảm bậc còn lại xuống ${degree[parent.mouse][parent.cat][parent.turn]}`, `Reduce remaining degree to ${degree[parent.mouse][parent.cat][parent.turn]}`),
            note: localized("Child này có lợi cho đối thủ, nhưng cha vẫn còn nước chưa được chứng minh là thua.", "This child favors the opponent, but the parent still has moves not yet proven losing."),
            codeLines: [44, 45, 47, 48],
            phaseIndex: 2,
            action: localized("Loại một nước không thể thắng", "Eliminate one non-winning move"),
            formula: localized("child thắng cho đối thủ ⇒ degree(parent) -= 1", "child wins for opponent ⇒ degree(parent) -= 1"),
          });
        }
      }
    }
  }

  activeChild = null;
  activeParent = null;
  activeEdge = null;
  const totals = countOutcomes();
  emit({
    title: localized(`${totals.draw} trạng thái còn lại là hòa`, `${totals.draw} remaining states are draws`),
    note: localized("Không bên nào có thể ép đi tới trạng thái thắng từ các state chưa được retrograde BFS giải.", "Neither player can force a winning terminal from states left unresolved by retrograde BFS."),
    codeLines: [52],
    phaseIndex: 3,
    action: localized("Giữ trạng thái chưa tô là DRAW", "Keep every uncolored state as DRAW"),
    formula: localized("color = DRAW sau BFS ⇒ vòng chơi tối ưu có thể kéo dài", "color = DRAW after BFS ⇒ optimal play can continue indefinitely"),
  });

  const answer = color[1][2][MOUSE_TURN];
  activeChild = { mouse: 1, cat: 2, turn: MOUSE_TURN };
  touchState(activeChild);
  emit({
    title: localized(`Kết quả ban đầu = ${outcomeCode(answer)} (${answer})`, `Initial state result = ${outcomeCode(answer)} (${answer})`),
    note: localized(
      answer === DRAW
        ? "Với chiến lược tối ưu, không bên nào ép thắng từ (mouse=1, cat=2, lượt chuột)."
        : answer === MOUSE
          ? "Chuột có thể ép thắng từ trạng thái ban đầu."
          : "Mèo có thể ép thắng từ trạng thái ban đầu.",
      answer === DRAW
        ? "With optimal play, neither side can force a win from (mouse=1, cat=2, mouse turn)."
        : answer === MOUSE
          ? "The mouse can force a win from the initial state."
          : "The cat can force a win from the initial state.",
    ),
    codeLines: [53],
    phaseIndex: 4,
    action: localized("Trả màu của trạng thái xuất phát", "Return the initial state's color"),
    formula: localized("answer = color[1][2][MOUSE_TURN]", "answer = color[1][2][MOUSE_TURN]"),
    final: true,
    answerValue: answer,
  });

  return {
    original: graph.map((neighbors) => [...neighbors]),
    answer,
    steps,
  };
}

function buildSteps1928(input, params = {}) {
  const parsed = parseMinCost1928Input(input, params);
  const { maxTime } = parsed;
  const edges = parsed.edges.map((edge) => [...edge]);
  const passingFees = [...parsed.passingFees];
  const n = passingFees.length;
  const target = n - 1;
  const phases = [
    localized("Dựng đồ thị", "Build graph"),
    localized("Khởi tạo DP", "Initialize DP"),
    localized("Mở rộng theo thời gian", "Expand through time"),
    localized("Quét đích", "Scan destination"),
    localized("Kết quả", "Result"),
  ];

  const graph = Array.from({ length: n }, () => []);
  for (const [u, v, travel] of edges) {
    graph[u].push([v, travel]);
    graph[v].push([u, travel]);
  }

  const dp = Array.from({ length: maxTime + 1 }, () => Array(n).fill(Infinity));
  const steps = [];
  const recentTimes = [];
  let traceDropped = 0;
  let currentElapsed = null;
  let currentNode = null;
  let candidateNode = null;
  let candidateArrival = null;
  let candidateCost = null;
  let previousCost = null;
  let activeEdge = null;
  let reachableStates = 0;

  const counters = {
    elapsedRows: 0,
    statesExpanded: 0,
    transitions: 0,
    updates: 0,
    overBudget: 0,
    noImprovement: 0,
  };

  const displayCost = (value) => Number.isFinite(value) ? value : "—";
  const touchTime = (time) => {
    if (!Number.isInteger(time) || time < 0 || time > maxTime) return;
    const existing = recentTimes.indexOf(time);
    if (existing !== -1) recentTimes.splice(existing, 1);
    recentTimes.unshift(time);
    if (recentTimes.length > MIN_COST_1928_TABLE_LIMIT * 2) recentTimes.pop();
  };

  function bestTarget() {
    let cost = Infinity;
    let time = null;
    for (let elapsed = 0; elapsed <= maxTime; elapsed += 1) {
      if (dp[elapsed][target] < cost) {
        cost = dp[elapsed][target];
        time = elapsed;
      }
    }
    return { cost, time };
  }

  function selectedTimes() {
    const selected = [];
    const seen = new Set();
    const add = (time) => {
      if (!Number.isInteger(time) || time < 0 || time > maxTime) return;
      if (seen.has(time) || selected.length >= MIN_COST_1928_TABLE_LIMIT) return;
      seen.add(time);
      selected.push(time);
    };
    const best = bestTarget();
    add(currentElapsed);
    add(candidateArrival);
    add(best.time);
    add(0);
    for (let radius = 1; radius <= MIN_COST_1928_TABLE_LIMIT; radius += 1) {
      if (currentElapsed !== null) {
        add(currentElapsed - radius);
        add(currentElapsed + radius);
      }
    }
    recentTimes.forEach(add);
    for (let elapsed = 0; elapsed <= maxTime && selected.length < MIN_COST_1928_TABLE_LIMIT; elapsed += 1) {
      if (dp[elapsed].some(Number.isFinite)) add(elapsed);
    }
    add(maxTime);
    return selected.sort((a, b) => a - b);
  }

  function graphView() {
    return {
      layout: "circle",
      nodes: Array.from({ length: n }, (_, id) => {
        let state = "default";
        if (id === currentNode) state = "active";
        else if (id === candidateNode) state = "warning";
        else if (id === target) state = "success";
        else if (id === 0) state = "info";
        const roles = [];
        if (id === 0) roles.push("start");
        if (id === target) roles.push("target");
        roles.push(`fee=${passingFees[id]}`);
        return { id, label: String(id), sub: roles.join(" · "), state };
      }),
      edges: edges.map(([u, v, travel]) => ({
        u,
        v,
        label: String(travel),
        directed: false,
        state: activeEdge && (
          (activeEdge.u === u && activeEdge.v === v)
          || (activeEdge.u === v && activeEdge.v === u)
        ) ? "active" : "default",
      })),
    };
  }

  function tableView() {
    const best = bestTarget();
    return {
      title: localized(
        `Các hàng thời gian chính xác đã chọn (tối đa ${MIN_COST_1928_TABLE_LIMIT})`,
        `Selected exact-time rows (up to ${MIN_COST_1928_TABLE_LIMIT})`,
      ),
      columns: Array.from({ length: n }, (_, node) => localized(`Nút ${node}`, `Node ${node}`)),
      rows: selectedTimes().map((elapsed) => ({
        label: `t=${elapsed}`,
        state: elapsed === currentElapsed ? "active" : elapsed === best.time ? "success" : "default",
        cells: dp[elapsed].map((cost, node) => {
          let state = Number.isFinite(cost) ? "info" : "muted";
          if (elapsed === currentElapsed && node === currentNode) state = "active";
          else if (elapsed === candidateArrival && node === candidateNode) state = "warning";
          else if (node === target && elapsed === best.time) state = "success";
          return { value: displayCost(cost), state };
        }),
      })),
    };
  }

  function frontierView() {
    if (currentElapsed === null) return [];
    const frontier = [];
    for (let node = 0; node < n; node += 1) {
      if (!Number.isFinite(dp[currentElapsed][node])) continue;
      frontier.push({
        label: `(t=${currentElapsed}, node=${node})`,
        sub: `fee=${dp[currentElapsed][node]}`,
        state: node === currentNode ? "active" : node === target ? "success" : "info",
      });
      if (frontier.length === MIN_COST_1928_MAX_NODES) break;
    }
    return frontier;
  }

  function makeHardView({ phaseIndex, action, formula, answerValue }) {
    const best = bestTarget();
    return jsonSnapshot({
      problemId: 1928,
      phaseIndex,
      phases,
      phase: ["graph", "initialize", "transition", "scan", "done"][phaseIndex],
      action,
      formula,
      metrics: [
        { label: localized("maxTime", "maxTime"), value: maxTime, state: "info" },
        { label: localized("State tới được", "Reachable states"), value: reachableStates, state: "active" },
        { label: localized("Lần cập nhật", "Updates"), value: counters.updates, state: "success" },
        { label: localized("Vượt ngân sách", "Over budget"), value: counters.overBudget, state: "warning" },
        { label: localized("Phí đích tốt nhất", "Best target fee"), value: displayCost(best.cost), state: Number.isFinite(best.cost) ? "success" : "muted" },
      ],
      graph: graphView(),
      table: tableView(),
      queue: frontierView(),
      groups: [
        {
          title: localized("Chuyển trạng thái", "Transition"),
          items: [
            { label: "from", value: currentElapsed === null || currentNode === null ? "—" : `(t=${currentElapsed}, node=${currentNode})`, state: currentNode === null ? "muted" : "active" },
            { label: "to", value: candidateArrival === null || candidateNode === null ? "—" : `(t=${candidateArrival}, node=${candidateNode})`, state: candidateNode === null ? "muted" : "warning" },
            { label: "candidate", value: candidateCost === null ? "—" : candidateCost, state: candidateCost === null ? "muted" : "info" },
            { label: "previous", value: previousCost === null ? "—" : displayCost(previousCost), state: "muted" },
          ],
        },
        {
          title: localized("Đầu vào", "Input"),
          items: [
            { label: "nodes", value: n, state: "info" },
            { label: "roads", value: edges.length, state: "info" },
            { label: "target", value: target, state: "success" },
          ],
        },
      ],
      sequence: [
        ...(currentElapsed === null || currentNode === null ? [] : [{ label: "from", value: `${currentElapsed}:${currentNode}`, state: "active" }]),
        ...(candidateArrival === null || candidateNode === null ? [] : [{ label: "to", value: `${candidateArrival}:${candidateNode}`, state: "warning" }]),
      ],
      legend: [
        { label: localized("State đang mở rộng", "State being expanded"), state: "active" },
        { label: localized("State ứng viên", "Candidate state"), state: "warning" },
        { label: localized("Chi phí hữu hạn", "Finite cost"), state: "info" },
        { label: localized("Chi phí đích tốt nhất", "Best target cost"), state: "success" },
        { label: localized("Chưa tới được", "Unreachable"), state: "muted" },
      ],
      answer: answerValue,
      traceTruncated: traceDropped > 0,
    });
  }

  function emit({
    title,
    note,
    codeLines,
    phaseIndex,
    action,
    formula,
    final = false,
    answerValue = null,
  }) {
    assertSemanticLines(codeLines, MIN_COST_1928_SOURCE, 1928);
    if (!final && steps.length >= MIN_COST_1928_TRACE_LIMIT - 1) {
      traceDropped += 1;
      return;
    }
    steps.push({
      title,
      note,
      codeLines: [...codeLines],
      vars: [
        { name: "elapsed", value: currentElapsed === null ? "—" : currentElapsed },
        { name: "node", value: currentNode === null ? "—" : currentNode },
        { name: "arrival", value: candidateArrival === null ? "—" : candidateArrival },
        { name: "candidate", value: candidateCost === null ? "—" : candidateCost },
        { name: "reachable", value: reachableStates },
        ...(answerValue === null ? [] : [{ name: "answer", value: answerValue }]),
      ],
      arr: [],
      sub: [],
      highlight: currentNode === null ? [] : [currentNode],
      mark: candidateNode === null ? [] : [candidateNode],
      final: Boolean(final),
      hardProblemView: makeHardView({ phaseIndex, action, formula, answerValue }),
    });
  }

  emit({
    title: localized("Dựng đồ thị đường hai chiều", "Build the undirected road graph"),
    note: localized("Mỗi road [u,v,time] tạo hai cung có cùng thời gian; phí nằm trên node và được trả khi vào node.", "Each road [u,v,time] creates two arcs with equal travel time; fees live on nodes and are paid upon entry."),
    codeLines: [6, 7, 8, 9, 10],
    phaseIndex: 0,
    action: localized("Tạo adjacency list từ roads", "Create an adjacency list from roads"),
    formula: localized("u—v, travel=w ⇒ u→(v,w) và v→(u,w)", "u—v, travel=w ⇒ u→(v,w) and v→(u,w)"),
  });

  dp[0][0] = passingFees[0];
  reachableStates = 1;
  currentElapsed = 0;
  currentNode = 0;
  touchTime(0);
  emit({
    title: localized(`dp[0][0] = ${passingFees[0]}`, `dp[0][0] = ${passingFees[0]}`),
    note: localized("Bắt đầu ở node 0 tại thời gian 0 và phải trả phí của node xuất phát đúng một lần.", "Start at node 0 at time 0 and pay the source node's fee exactly once."),
    codeLines: [12, 13],
    phaseIndex: 1,
    action: localized("Gieo state xuất phát", "Seed the start state"),
    formula: localized("dp[0][0] = passingFees[0]", "dp[0][0] = passingFees[0]"),
  });

  for (let elapsed = 0; elapsed <= maxTime; elapsed += 1) {
    counters.elapsedRows += 1;
    currentElapsed = elapsed;
    currentNode = null;
    candidateNode = null;
    candidateArrival = null;
    candidateCost = null;
    previousCost = null;
    activeEdge = null;
    touchTime(elapsed);
    const finiteNodes = dp[elapsed].filter(Number.isFinite).length;
    emit({
      title: localized(`Xét hàng thời gian chính xác t=${elapsed}`, `Inspect exact-time row t=${elapsed}`),
      note: localized(
        finiteNodes
          ? `Có ${finiteNodes} node tới được đúng tại t=${elapsed}; chỉ các state hữu hạn mới phát sinh transition.`
          : `Không node nào tới được đúng tại t=${elapsed}; hàng này không phát sinh transition.`,
        finiteNodes
          ? `${finiteNodes} nodes are reachable at exactly t=${elapsed}; only finite states generate transitions.`
          : `No node is reachable at exactly t=${elapsed}; this row generates no transition.`,
      ),
      codeLines: [15, 16, 17, 18],
      phaseIndex: 2,
      action: localized("Quét một lớp thời gian", "Scan one time layer"),
      formula: localized("dp[t][u] = phí nhỏ nhất khi tới u đúng lúc t", "dp[t][u] = minimum fee to reach u at exactly time t"),
    });

    for (let node = 0; node < n; node += 1) {
      if (!Number.isFinite(dp[elapsed][node])) continue;
      counters.statesExpanded += 1;
      currentNode = node;
      candidateNode = null;
      candidateArrival = null;
      candidateCost = null;
      previousCost = null;
      activeEdge = null;
      emit({
        title: localized(`Mở rộng state (t=${elapsed}, node=${node}, fee=${dp[elapsed][node]})`, `Expand state (t=${elapsed}, node=${node}, fee=${dp[elapsed][node]})`),
        note: localized("Thử mọi road kề từ state thời gian chính xác này.", "Try every adjacent road from this exact-time state."),
        codeLines: [16, 17, 18, 19],
        phaseIndex: 2,
        action: localized("Mở rộng state hữu hạn", "Expand a finite state"),
        formula: localized("base = dp[elapsed][node]", "base = dp[elapsed][node]"),
      });

      for (const [next, travel] of graph[node]) {
        counters.transitions += 1;
        candidateNode = next;
        candidateArrival = elapsed + travel;
        candidateCost = null;
        previousCost = candidateArrival <= maxTime ? dp[candidateArrival][next] : null;
        activeEdge = { u: node, v: next, travel };
        touchTime(candidateArrival);

        if (candidateArrival > maxTime) {
          counters.overBudget += 1;
          emit({
            title: localized(`Bỏ ${node}→${next}: tới lúc ${candidateArrival} > ${maxTime}`, `Reject ${node}→${next}: arrival ${candidateArrival} > ${maxTime}`),
            note: localized("Transition vượt ngân sách thời gian nên không được ghi vào bảng DP.", "The transition exceeds the time budget and is not written to the DP table."),
            codeLines: [19, 20, 21, 22],
            phaseIndex: 2,
            action: localized("Loại transition quá thời gian", "Reject an over-budget transition"),
            formula: localized(`${elapsed} + ${travel} = ${candidateArrival} > maxTime`, `${elapsed} + ${travel} = ${candidateArrival} > maxTime`),
          });
          continue;
        }

        candidateCost = dp[elapsed][node] + passingFees[next];
        if (candidateCost < dp[candidateArrival][next]) {
          const wasUnreachable = !Number.isFinite(dp[candidateArrival][next]);
          previousCost = dp[candidateArrival][next];
          dp[candidateArrival][next] = candidateCost;
          counters.updates += 1;
          if (wasUnreachable) reachableStates += 1;
          emit({
            title: localized(`Cập nhật dp[${candidateArrival}][${next}] = ${candidateCost}`, `Update dp[${candidateArrival}][${next}] = ${candidateCost}`),
            note: localized(
              `Đi từ node ${node} tốn thêm phí ${passingFees[next]}; ứng viên mới tốt hơn ${displayCost(previousCost)}.`,
              `Moving from node ${node} adds fee ${passingFees[next]}; the new candidate improves ${displayCost(previousCost)}.`,
            ),
            codeLines: [19, 20, 23, 24, 25],
            phaseIndex: 2,
            action: localized("Relax state thời gian-node", "Relax a time-node state"),
            formula: localized(`dp[${candidateArrival}][${next}] = min(${displayCost(previousCost)}, ${dp[elapsed][node]} + ${passingFees[next]})`, `dp[${candidateArrival}][${next}] = min(${displayCost(previousCost)}, ${dp[elapsed][node]} + ${passingFees[next]})`),
          });
        } else {
          counters.noImprovement += 1;
          emit({
            title: localized(`Giữ dp[${candidateArrival}][${next}] = ${displayCost(previousCost)}`, `Keep dp[${candidateArrival}][${next}] = ${displayCost(previousCost)}`),
            note: localized(`Ứng viên ${candidateCost} không nhỏ hơn giá trị đã biết nên không cập nhật.`, `Candidate ${candidateCost} is not smaller than the known value, so no update is made.`),
            codeLines: [19, 20, 23, 24],
            phaseIndex: 2,
            action: localized("Bỏ ứng viên không cải thiện", "Discard a non-improving candidate"),
            formula: localized(`${candidateCost} ≥ ${displayCost(previousCost)} ⇒ giữ nguyên`, `${candidateCost} ≥ ${displayCost(previousCost)} ⇒ keep current value`),
          });
        }
      }
    }
  }

  const best = bestTarget();
  const answer = Number.isFinite(best.cost) ? best.cost : -1;
  currentElapsed = best.time === null ? maxTime : best.time;
  currentNode = target;
  candidateNode = null;
  candidateArrival = null;
  candidateCost = null;
  previousCost = null;
  activeEdge = null;
  touchTime(currentElapsed);
  emit({
    title: localized(
      best.time === null ? "Đích không xuất hiện ở hàng thời gian nào" : `Phí đích nhỏ nhất là ${best.cost} tại t=${best.time}`,
      best.time === null ? "The destination is absent from every time row" : `Minimum target fee is ${best.cost} at t=${best.time}`,
    ),
    note: localized("Quét cột đích qua mọi thời gian 0..maxTime; không chỉ lấy hàng maxTime.", "Scan the target column over every time from 0 through maxTime; do not use only the maxTime row."),
    codeLines: [27],
    phaseIndex: 3,
    action: localized("Lấy min trên mọi thời gian hợp lệ", "Take the minimum over all allowed times"),
    formula: localized("answer = min(dp[t][n-1]) với 0 ≤ t ≤ maxTime", "answer = min(dp[t][n-1]) for 0 ≤ t ≤ maxTime"),
  });

  emit({
    title: localized(`Trả về ${answer}`, `Return ${answer}`),
    note: localized(
      answer === -1
        ? "Không có đường nào tới đích trong maxTime."
        : `Một state đích tối ưu có thời gian chính xác ${best.time} và tổng phí ${answer}.`,
      answer === -1
        ? "No route reaches the destination within maxTime."
        : `An optimal target state has exact elapsed time ${best.time} and total fee ${answer}.`,
    ),
    codeLines: [28],
    phaseIndex: 4,
    action: localized("Đổi vô cực thành -1, nếu cần", "Convert infinity to -1 when necessary"),
    formula: localized("return -1 nếu answer=∞, ngược lại return answer", "return -1 if answer=∞, otherwise return answer"),
    final: true,
    answerValue: answer,
  });

  return {
    original: {
      maxTime,
      edges: edges.map((edge) => [...edge]),
      passingFees: [...passingFees],
    },
    answer,
    steps,
  };
}

module.exports = {
  913: {
    id: 913,
    difficulty: "hard",
    slug: "cat-and-mouse",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "bfs", vi: "BFS hồi quy", en: "Retrograde BFS" },
      { key: "game-theory", vi: "Lý thuyết trò chơi", en: "Game Theory" },
    ],
    title: { vi: "Mèo và Chuột", en: "Cat and Mouse" },
    titleVi: { vi: "Mèo và Chuột — BFS hồi quy trên trạng thái tích", en: "Cat and Mouse — retrograde product-state BFS" },
    statement: {
      vi: `Cho đồ thị vô hướng liên thông đơn gồm 3..${CAT_MOUSE_913_MAX_NODES} node. Chuột bắt đầu ở 1, mèo ở 2, chuột đi trước; node 0 là lỗ và mèo không được vào. Trả 0 nếu hòa, 1 nếu chuột thắng, 2 nếu mèo thắng khi cả hai tối ưu. Nhập JSON adjacency list đối xứng, không self-loop hay cạnh trùng.`,
      en: `Given a connected simple undirected graph with 3..${CAT_MOUSE_913_MAX_NODES} nodes, the mouse starts at 1, the cat at 2, and the mouse moves first. Node 0 is the hole and the cat may not enter it. Return 0 for draw, 1 for mouse win, or 2 for cat win under optimal play. Enter a symmetric JSON adjacency list with no self-loops or duplicates.`,
    },
    defaultInput: "[[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]]",
    inputKind: "string",
    inputLabel: { vi: "Adjacency list JSON vô hướng", en: "Undirected JSON adjacency list" },
    extraParams: [],
    visualizationLimits: {
      maxNodes: CAT_MOUSE_913_MAX_NODES,
      maxEdges: CAT_MOUSE_913_MAX_EDGES,
      maxTraceSteps: CAT_MOUSE_913_TRACE_LIMIT,
      maxTableRows: CAT_MOUSE_913_TABLE_LIMIT,
      maxQueueItems: CAT_MOUSE_913_QUEUE_LIMIT,
    },
    approach: [
      { vi: "State đầy đủ là (mouse, cat, turn), có màu DRAW/MOUSE/CAT và bậc bằng số nước đi hợp lệ.", en: "A complete state is (mouse, cat, turn), with color DRAW/MOUSE/CAT and degree equal to its legal move count." },
      { vi: "Gieo mouse=0 là MOUSE, mouse=cat≠0 là CAT, cùng các state không có nước đi hợp lệ.", en: "Seed mouse=0 as MOUSE, mouse=cat≠0 as CAT, plus states with no legal move." },
      { vi: "BFS đi ngược: nếu người tới lượt có một child thắng cho mình, tô cha cùng màu ngay.", en: "Run BFS backward: if the player to move has one child winning for that player, immediately color the parent the same." },
      { vi: "Nếu child thắng cho đối thủ, giảm degree cha; degree về 0 nghĩa mọi nước đều thua nên cha mang màu đối thủ.", en: "If a child wins for the opponent, decrement the parent's degree; degree zero means every move loses, so color the parent for the opponent." },
      { vi: "Những state không bao giờ được tô vẫn là DRAW. Đáp án là color[1][2][MOUSE_TURN].", en: "States never colored remain DRAW. The answer is color[1][2][MOUSE_TURN]." },
    ],
    complexity: {
      time: "O(n³)",
      space: "O(n²)",
      note: {
        vi: "Có O(n²) state tích và hai lượt; mỗi state duyệt tối đa O(n) predecessor. Bảng màu, degree và queue dùng O(n²).",
        en: "There are O(n²) product states across two turns; each examines up to O(n) predecessors. Color, degree, and queue storage use O(n²).",
      },
    },
    code: CAT_MOUSE_913_SOURCE,
    debugMode: "line-by-line",
    parseCatMouse913Input,
    liveArgs: (input) => [parseCatMouse913Input(input)],
    builder: buildSteps913,
  },
  1928: {
    id: 1928,
    difficulty: "hard",
    slug: "minimum-cost-to-reach-destination-in-time",
    category: { key: "graph", vi: "Đồ thị / Quy hoạch động", en: "Graph / Dynamic Programming" },
    tags: [
      { key: "dynamic-programming", vi: "Quy hoạch động", en: "Dynamic Programming" },
      { key: "shortest-path", vi: "Đường đi có ràng buộc", en: "Resource-Constrained Path" },
    ],
    title: { vi: "Chi phí nhỏ nhất để tới đích đúng thời gian", en: "Minimum Cost to Reach Destination in Time" },
    titleVi: { vi: "Chi phí nhỏ nhất với DP thời gian-node", en: "Minimum cost with time-node DP" },
    statement: {
      vi: `Cho tối đa ${MIN_COST_1928_MAX_NODES} node, road vô hướng [u,v,time], phí vào mỗi node và maxTime≤${MIN_COST_1928_MAX_TIME}. Bắt đầu ở 0 và trả phí node 0; tìm tổng phí nhỏ nhất để tới n-1 trong thời gian không quá maxTime, hoặc -1. Nhập roads dạng u,v,time;...; passingFees là tham số cách bởi dấu phẩy. Không cho self-loop hay road trùng.`,
      en: `Given up to ${MIN_COST_1928_MAX_NODES} nodes, undirected roads [u,v,time], a fee for entering each node, and maxTime≤${MIN_COST_1928_MAX_TIME}, start at 0 while paying node 0's fee. Find the minimum total fee to reach n-1 within maxTime, or -1. Enter roads as u,v,time;... and passingFees as a comma-separated parameter. Self-loops and duplicate roads are rejected.`,
    },
    defaultInput: "0,1,10;1,2,10;2,5,10;0,3,1;3,4,10;4,5,15",
    inputKind: "string",
    inputLabel: { vi: "Roads vô hướng (u,v,time; ...)", en: "Undirected roads (u,v,time; ...)" },
    extraParams: [
      { key: "maxTime", type: "number", label: { vi: "maxTime", en: "maxTime" }, default: 30, min: 1, max: MIN_COST_1928_MAX_TIME },
      { key: "passingFees", type: "string", label: { vi: "Phí các node", en: "Node passing fees" }, default: "5,1,2,20,20,3" },
    ],
    visualizationLimits: {
      maxNodes: MIN_COST_1928_MAX_NODES,
      maxEdges: MIN_COST_1928_MAX_EDGES,
      maxTime: MIN_COST_1928_MAX_TIME,
      maxStates: MIN_COST_1928_MAX_STATES,
      maxTraceSteps: MIN_COST_1928_TRACE_LIMIT,
      maxTableRows: MIN_COST_1928_TABLE_LIMIT,
    },
    approach: [
      { vi: "Dựng adjacency list hai chiều; thời gian nằm trên road và phí được cộng khi đi vào node kế tiếp.", en: "Build an undirected adjacency list; time lives on roads and a fee is added when entering the next node." },
      { vi: "dp[t][u] là phí nhỏ nhất để tới u tại ĐÚNG thời gian t; dp[0][0]=passingFees[0].", en: "dp[t][u] is the minimum fee to reach u at EXACTLY elapsed time t; dp[0][0]=passingFees[0]." },
      { vi: "Duyệt t tăng dần. Từ state hữu hạn, đi road (u,v,w) tới (t+w,v) nếu không vượt maxTime và relax thêm passingFees[v].", en: "Scan t in increasing order. From a finite state, traverse road (u,v,w) to (t+w,v) within maxTime and relax by adding passingFees[v]." },
      { vi: "Không được gộp mọi thời gian thành một best[u]: đường rẻ hơn nhưng chậm hơn có thể làm mất một continuation hợp lệ.", en: "Do not collapse all times into one best[u]: a cheaper but slower route can invalidate a continuation that a faster state permits." },
      { vi: "Đáp án là min dp[t][n-1] trên toàn bộ 0≤t≤maxTime, không chỉ hàng maxTime.", en: "The answer is min dp[t][n-1] over every 0≤t≤maxTime, not only the maxTime row." },
    ],
    complexity: {
      time: "O(maxTime·E)",
      space: "O(maxTime·V + V + E)",
      note: {
        vi: "Mỗi lớp thời gian xét tối đa hai hướng của mọi road. Bảng lưu một chi phí cho từng state (thời gian chính xác, node).",
        en: "Each time layer examines at most both directions of every road. The table stores one cost per (exact elapsed time, node) state.",
      },
    },
    code: MIN_COST_1928_SOURCE,
    debugMode: "line-by-line",
    parseMinCost1928Input,
    liveArgs: (input, params) => {
      const parsed = parseMinCost1928Input(input, params);
      return [parsed.maxTime, parsed.edges.map((edge) => [...edge]), [...parsed.passingFees]];
    },
    builder: buildSteps1928,
  },
};
