const CS753_PHASE_ORDER = Object.freeze(["setup", "traverse", "unwind", "verify", "done"]);
const CS753_EDGE_STATUSES = new Set(["unused", "used", "emitted", "active"]);
const CS753_NODE_STATUSES = new Set(["idle", "stack", "current"]);
const CS753_DECISIONS = new Set([
  "idle",
  "enter-root",
  "descend",
  "start-dfs",
  "inspect-value",
  "skip-seen",
  "consume",
  "emit-postorder",
  "return",
  "assemble-answer",
  "verify-pass",
  "verify-fail",
  "done",
]);

const CS753_EVENT_LABELS = Object.freeze({
  "bind-class": { en: "Bind Solution class", vi: "Liên kết lớp Solution" },
  "bind-method": { en: "Bind crackSafe method", vi: "Liên kết method crackSafe" },
  "create-start-node": { en: "Create start node", vi: "Tạo node bắt đầu" },
  "initialize-edge-set": { en: "Initialize edge set", vi: "Khởi tạo tập cạnh" },
  "initialize-postorder": { en: "Initialize postorder output", vi: "Khởi tạo output postorder" },
  "bind-dfs": { en: "Bind DFS helper", vi: "Liên kết helper DFS" },
  "value-loop-true": { en: "Select alphabet value", vi: "Chọn giá trị bảng chữ số" },
  "value-loop-false": { en: "Finish alphabet loop", vi: "Hoàn tất vòng bảng chữ số" },
  "assign-digit": { en: "Convert value to digit", vi: "Chuyển giá trị thành digit" },
  "build-edge": { en: "Build candidate edge", vi: "Tạo cạnh ứng viên" },
  "seen-check-true": { en: "Edge was already used", vi: "Cạnh đã được dùng" },
  "seen-check-false": { en: "Edge is unused", vi: "Cạnh chưa được dùng" },
  "recurse-edge": { en: "Recurse through edge", vi: "Đệ quy qua cạnh" },
  "start-dfs": { en: "Start Hierholzer DFS", vi: "Bắt đầu DFS Hierholzer" },
  "enter-dfs": { en: "Enter DFS call", vi: "Vào lời gọi DFS" },
  "skip-seen-edge": { en: "Skip a used edge", vi: "Bỏ qua cạnh đã dùng" },
  "consume-edge": { en: "Consume a new edge", vi: "Dùng một cạnh mới" },
  "emit-postorder-digit": { en: "Emit on unwind", vi: "Phát chữ số khi quay lui" },
  "assemble-answer": { en: "Assemble answer", vi: "Ghép đáp án" },
  "verify-window": { en: "Verify n-digit window", vi: "Kiểm tra cửa sổ n chữ số" },
  "final-return": { en: "Return valid sequence", vi: "Trả về chuỗi hợp lệ" },
});

const CS753_COPY = Object.freeze({
  en: {
    region: "Cracking the Safe De Bruijn visualization",
    kicker: "De Bruijn graph · Eulerian circuit",
    edges: "Edges",
    nodes: "Nodes",
    length: "Sequence length",
    waiting: "Waiting",
    phase: "Phase",
    event: "Event",
    decision: "Decision",
    source: "Current Python line",
    graph: "De Bruijn graph",
    graphHelp: "An n-digit password is a directed edge from its prefix to its suffix.",
    edgeLedger: "Edge ledger",
    edgeLedgerHelp: "Edges, not nodes, must be used exactly once.",
    recursionStack: "Recursion stack",
    stackHelp: "The top frame is the active DFS call. Digits are appended only while unwinding.",
    emptyStack: "The traversal stack is empty.",
    root: "root",
    incoming: "incoming",
    next: "next value",
    output: "Postorder → answer",
    outputHelp: "Postorder digits are followed by the all-zero start suffix.",
    postorder: "Postorder digits",
    startSuffix: "Start suffix",
    sequence: "Candidate sequence",
    none: "none yet",
    epsilon: "ε",
    windows: "Verified windows",
    windowsHelp: "Every length-n window must be a different graph edge.",
    noWindows: "Verification has not started.",
    counters: "Execution counters",
    invariants: "Correctness checks",
    note: "Step explanation",
    used: "used",
    emitted: "emitted",
    active: "active",
    unused: "unused",
    current: "current",
    inStack: "in stack",
    visit: "visit",
    emit: "emit",
    pass: "PASS",
    fail: "FAIL",
    pending: "PENDING",
    candidateChecks: "Candidate checks",
    skippedSeenEdges: "Seen-edge skips",
    recursiveCalls: "DFS calls",
    recursiveReturns: "DFS returns",
    consumedEdges: "Consumed edges",
    emittedDigits: "Emitted digits",
    verifiedWindows: "Verified windows",
    phaseLabels: ["1. Setup", "2. Traverse edges", "3. Unwind", "4. Verify", "5. Done"],
  },
  vi: {
    region: "Trực quan hóa Cracking the Safe bằng đồ thị De Bruijn",
    kicker: "Đồ thị De Bruijn · Chu trình Euler",
    edges: "Cạnh",
    nodes: "Node",
    length: "Độ dài chuỗi",
    waiting: "Đang chờ",
    phase: "Giai đoạn",
    event: "Sự kiện",
    decision: "Quyết định",
    source: "Dòng Python hiện tại",
    graph: "Đồ thị De Bruijn",
    graphHelp: "Một mật mã n chữ số là cạnh có hướng từ tiền tố tới hậu tố.",
    edgeLedger: "Sổ cạnh",
    edgeLedgerHelp: "Cạnh, không phải node, phải được dùng đúng một lần.",
    recursionStack: "Ngăn xếp đệ quy",
    stackHelp: "Frame trên cùng là lời gọi DFS hiện tại. Chữ số chỉ được thêm khi quay lui.",
    emptyStack: "Ngăn xếp duyệt đang rỗng.",
    root: "gốc",
    incoming: "cạnh vào",
    next: "giá trị kế",
    output: "Postorder → đáp án",
    outputHelp: "Các chữ số postorder được nối với hậu tố bắt đầu toàn số 0.",
    postorder: "Chữ số postorder",
    startSuffix: "Hậu tố bắt đầu",
    sequence: "Chuỗi ứng viên",
    none: "chưa có",
    epsilon: "ε",
    windows: "Các cửa sổ đã kiểm tra",
    windowsHelp: "Mỗi cửa sổ độ dài n phải là một cạnh khác nhau của đồ thị.",
    noWindows: "Chưa bắt đầu kiểm tra.",
    counters: "Bộ đếm thực thi",
    invariants: "Kiểm tra tính đúng",
    note: "Giải thích bước",
    used: "đã dùng",
    emitted: "đã phát",
    active: "đang xét",
    unused: "chưa dùng",
    current: "hiện tại",
    inStack: "trong stack",
    visit: "duyệt",
    emit: "phát",
    pass: "ĐẠT",
    fail: "LỖI",
    pending: "CHỜ",
    candidateChecks: "Lần kiểm tra ứng viên",
    skippedSeenEdges: "Lần bỏ qua cạnh cũ",
    recursiveCalls: "Lời gọi DFS",
    recursiveReturns: "Lần DFS trả về",
    consumedEdges: "Cạnh đã dùng",
    emittedDigits: "Chữ số đã phát",
    verifiedWindows: "Cửa sổ đã kiểm tra",
    phaseLabels: ["1. Chuẩn bị", "2. Duyệt cạnh", "3. Quay lui", "4. Kiểm tra", "5. Hoàn tất"],
  },
});

const CS753_INVARIANT_LABELS = Object.freeze([
  ["sourceLineValid", { en: "Source line is valid", vi: "Dòng mã nguồn hợp lệ" }],
  ["seenEdgesAreExpected", { en: "Every seen edge is an n-digit password", vi: "Mọi cạnh đã thấy đều là mật mã n chữ số" }],
  ["visitOrdersAreUnique", { en: "Each consumed edge has one visit order", vi: "Mỗi cạnh đã dùng có một thứ tự duyệt" }],
  ["emittedEdgesWereSeen", { en: "Only consumed edges emit digits", vi: "Chỉ cạnh đã dùng mới phát chữ số" }],
  ["emitOrdersAreUnique", { en: "Postorder emissions are unique", vi: "Thứ tự phát postorder không trùng" }],
  ["stackStartsAtRoot", { en: "DFS stack starts at the zero node", vi: "Stack DFS bắt đầu tại node toàn số 0" }],
  ["usedEveryEdge", { en: "All k^n edges were consumed", vi: "Đã dùng đủ k^n cạnh" }],
  ["emittedEveryDigit", { en: "Every edge emitted one digit", vi: "Mỗi cạnh đã phát một chữ số" }],
  ["answerLengthMatches", { en: "Length is k^n + n − 1", vi: "Độ dài bằng k^n + n − 1" }],
  ["everyWindowUnique", { en: "All n-digit windows are unique", vi: "Mọi cửa sổ n chữ số đều khác nhau" }],
  ["windowsCoverEveryEdge", { en: "Windows cover every graph edge", vi: "Các cửa sổ phủ mọi cạnh đồ thị" }],
]);

function cs753Locale() {
  return typeof lang !== "undefined" && lang === "vi" ? "vi" : "en";
}

function cs753Escape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cs753Text(value, fallback = "", maximum = 160) {
  if (typeof value !== "string") return fallback;
  return value.slice(0, maximum);
}

function cs753Integer(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function cs753Boolean(value) {
  return value === true ? true : value === false ? false : null;
}

function cs753Localized(value, locale, fallback) {
  if (typeof value === "string") return cs753Text(value, fallback, 500);
  if (value && typeof value === "object") {
    return cs753Text(value[locale] ?? value.en ?? value.vi, fallback, 500);
  }
  return fallback;
}

function cs753NodeLabel(node, copy) {
  return node === "" ? copy.epsilon : node;
}

function cs753Normalize(step) {
  const raw = step && step.crackingSafe753View && typeof step.crackingSafe753View === "object"
    ? step.crackingSafe753View
    : {};
  const inputRaw = raw.input && typeof raw.input === "object" ? raw.input : {};
  const n = cs753Integer(inputRaw.n, 1, 4) ?? 1;
  const k = cs753Integer(inputRaw.k, 1, 10) ?? 1;
  const totalEdges = cs753Integer(inputRaw.totalEdges, 1, 64) ?? Math.min(64, k ** n);
  const totalNodes = cs753Integer(inputRaw.totalNodes, 1, 64) ?? 1;
  const expectedLength = cs753Integer(inputRaw.expectedLength, 1, 67) ?? totalEdges + n - 1;
  const startNode = cs753Text(inputRaw.startNode, "", 3);
  const phase = CS753_PHASE_ORDER.includes(raw.phase) ? raw.phase : "setup";
  const event = Object.prototype.hasOwnProperty.call(CS753_EVENT_LABELS, raw.event)
    ? raw.event
    : "create-start-node";
  const sourceRaw = raw.source && typeof raw.source === "object" ? raw.source : {};
  const fallbackLine = step && Array.isArray(step.codeLines) ? step.codeLines[0] : null;
  const sourceLine = cs753Integer(sourceRaw.line, 1, 16)
    ?? cs753Integer(fallbackLine, 1, 16)
    ?? 1;
  const sourceText = cs753Text(sourceRaw.text, "", 220);

  const graphRaw = raw.graph && typeof raw.graph === "object" ? raw.graph : {};
  const seenNodeIds = new Set();
  const nodes = Array.isArray(graphRaw.nodes) ? graphRaw.nodes.slice(0, 64).flatMap((item) => {
    const node = item && typeof item === "object" ? item : {};
    const id = cs753Text(node.id, "", 3);
    if (seenNodeIds.has(id)) return [];
    seenNodeIds.add(id);
    return [{
      id,
      label: cs753Text(node.label, id || "ε", 8),
      outTotal: cs753Integer(node.outTotal, 0, 10) ?? 0,
      outUsed: cs753Integer(node.outUsed, 0, 10) ?? 0,
      status: CS753_NODE_STATUSES.has(node.status) ? node.status : "idle",
    }];
  }) : [];

  const seenEdgeIds = new Set();
  const edges = Array.isArray(graphRaw.edges) ? graphRaw.edges.slice(0, 64).flatMap((item) => {
    const edge = item && typeof item === "object" ? item : {};
    const id = cs753Text(edge.id, "", 4);
    if (!id || seenEdgeIds.has(id)) return [];
    seenEdgeIds.add(id);
    return [{
      id,
      word: cs753Text(edge.word, id, 4),
      from: cs753Text(edge.from, "", 3),
      to: cs753Text(edge.to, "", 3),
      digit: cs753Text(edge.digit, id.slice(-1), 1),
      seen: edge.seen === true,
      emitted: edge.emitted === true,
      visitOrder: cs753Integer(edge.visitOrder, 1, 64),
      emitOrder: cs753Integer(edge.emitOrder, 1, 64),
      status: CS753_EDGE_STATUSES.has(edge.status) ? edge.status : "unused",
    }];
  }) : [];

  const traversalRaw = raw.traversal && typeof raw.traversal === "object" ? raw.traversal : {};
  const callStack = Array.isArray(traversalRaw.callStack)
    ? traversalRaw.callStack.slice(0, 65).map((item, index) => {
      const frame = item && typeof item === "object" ? item : {};
      return {
        depth: cs753Integer(frame.depth, 0, 64) ?? index,
        node: cs753Text(frame.node, "", 3),
        incomingEdgeId: frame.incomingEdgeId === null ? null : cs753Text(frame.incomingEdgeId, "", 4),
        nextValue: frame.nextValue === null ? null : cs753Integer(frame.nextValue, 0, 9),
      };
    })
    : [];
  const decision = CS753_DECISIONS.has(traversalRaw.decision) ? traversalRaw.decision : "idle";

  const outputRaw = raw.output && typeof raw.output === "object" ? raw.output : {};
  const normalizeDigits = (value, limit) => Array.isArray(value)
    ? value.slice(0, limit).map((digit) => cs753Text(digit, "", 1)).filter((digit) => /^\d$/.test(digit))
    : [];
  const postorderDigits = normalizeDigits(outputRaw.postorderDigits, 64);
  const startSuffix = normalizeDigits(outputRaw.startSuffix, 3);
  const sequence = typeof outputRaw.sequence === "string" && /^\d{1,67}$/.test(outputRaw.sequence)
    ? outputRaw.sequence
    : null;
  const activeWindowIndex = outputRaw.activeWindowIndex === null
    ? null
    : cs753Integer(outputRaw.activeWindowIndex, 0, 63);
  const verifiedWindows = Array.isArray(outputRaw.verifiedWindows)
    ? outputRaw.verifiedWindows.slice(0, 64).flatMap((item) => {
      const window = item && typeof item === "object" ? item : {};
      const index = cs753Integer(window.index, 0, 63);
      const word = cs753Text(window.word, "", 4);
      return index === null || !/^\d{1,4}$/.test(word) ? [] : [{
        index,
        word,
        unique: window.unique === true,
        expected: window.expected === true,
      }];
    })
    : [];

  const countersRaw = raw.counters && typeof raw.counters === "object" ? raw.counters : {};
  const counterNames = [
    "candidateChecks",
    "skippedSeenEdges",
    "recursiveCalls",
    "recursiveReturns",
    "consumedEdges",
    "emittedDigits",
    "verifiedWindows",
  ];
  const counters = {};
  counterNames.forEach((name) => {
    counters[name] = cs753Integer(countersRaw[name], 0, 100000) ?? 0;
  });

  const invariantRaw = raw.invariants && typeof raw.invariants === "object" ? raw.invariants : {};
  const invariants = {};
  CS753_INVARIANT_LABELS.forEach(([name]) => {
    invariants[name] = cs753Boolean(invariantRaw[name]);
  });

  const locale = cs753Locale();
  return {
    n,
    k,
    totalEdges,
    totalNodes,
    expectedLength,
    startNode,
    phase,
    event,
    source: { line: sourceLine, text: sourceText },
    graph: {
      nodes,
      edges,
      activeNodeId: graphRaw.activeNodeId === null ? null : cs753Text(graphRaw.activeNodeId, "", 3),
      activeEdgeId: graphRaw.activeEdgeId === null ? null : cs753Text(graphRaw.activeEdgeId, "", 4),
    },
    traversal: {
      currentNode: traversalRaw.currentNode === null ? null : cs753Text(traversalRaw.currentNode, "", 3),
      candidateDigit: traversalRaw.candidateDigit === null ? null : cs753Text(traversalRaw.candidateDigit, "", 1),
      candidateEdgeId: traversalRaw.candidateEdgeId === null ? null : cs753Text(traversalRaw.candidateEdgeId, "", 4),
      decision,
      callStack,
      usedCount: cs753Integer(traversalRaw.usedCount, 0, 64) ?? 0,
    },
    output: { postorderDigits, startSuffix, sequence, activeWindowIndex, verifiedWindows },
    counters,
    invariants,
    answer: typeof raw.answer === "string" ? cs753Text(raw.answer, "", 67) : null,
    final: raw.final === true || Boolean(step && step.final),
    title: cs753Localized(step && step.title, locale, "Cracking the Safe"),
    note: cs753Localized(step && step.note, locale, ""),
  };
}

function cs753RenderPhases(state, copy) {
  const active = CS753_PHASE_ORDER.indexOf(state.phase);
  return `<nav class="cs753-phases" aria-label="${cs753Escape(copy.phase)}"><ol>${copy.phaseLabels.map((label, index) => {
    const status = index === active ? "is-active" : "";
    return `<li class="${status}"${index === active ? ' aria-current="step"' : ""}><span>${index === active ? "●" : "○"}</span><b>${cs753Escape(label.replace(/^\d+\.\s*/, ""))}</b></li>`;
  }).join("")}</ol></nav>`;
}

function cs753RenderSource(state, copy, locale) {
  const eventLabel = CS753_EVENT_LABELS[state.event]?.[locale] || state.event.replace(/-/g, " ");
  return `<section class="cs753-source-card"><div><small>${cs753Escape(copy.source)} · L${state.source.line}</small><code>${cs753Escape(state.source.text || "—")}</code></div><dl><div><dt>${cs753Escape(copy.phase)}</dt><dd>${cs753Escape(state.phase)}</dd></div><div><dt>${cs753Escape(copy.event)}</dt><dd>${cs753Escape(eventLabel)}</dd></div><div><dt>${cs753Escape(copy.decision)}</dt><dd>${cs753Escape(state.traversal.decision)}</dd></div></dl></section>`;
}

function cs753GraphPositions(nodes, width, height) {
  const positions = new Map();
  const centerX = width / 2;
  const centerY = height / 2;
  if (nodes.length === 1) {
    positions.set(nodes[0].id, { x: centerX, y: centerY });
    return positions;
  }
  const radiusX = Math.min(width * 0.38, 270);
  const radiusY = Math.min(height * 0.34, 145);
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
    positions.set(node.id, {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
    });
  });
  return positions;
}

function cs753RenderGraph(state, copy) {
  const width = 760;
  const height = 420;
  const radius = 29;
  const positions = cs753GraphPositions(state.graph.nodes, width, height);
  const loopRanks = new Map();
  let edgeSvg = "";

  state.graph.edges.forEach((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return;
    const status = edge.status;
    const marker = status === "active" ? "active" : edge.emitted ? "emitted" : edge.seen ? "used" : "unused";
    const shouldLabel = state.graph.edges.length <= 32 || status === "active";
    let path = "";
    let labelX = 0;
    let labelY = 0;

    if (edge.from === edge.to) {
      const rank = loopRanks.get(edge.from) || 0;
      loopRanks.set(edge.from, rank + 1);
      const centerX = width / 2;
      const centerY = height / 2;
      let radialX = from.x - centerX;
      let radialY = from.y - centerY;
      const radialLength = Math.hypot(radialX, radialY) || 1;
      radialX /= radialLength;
      radialY /= radialLength;
      if (state.graph.nodes.length === 1) {
        const angle = (2 * Math.PI * rank) / Math.max(1, state.graph.edges.length) - Math.PI / 2;
        radialX = Math.cos(angle);
        radialY = Math.sin(angle);
      }
      const tangentX = -radialY;
      const tangentY = radialX;
      const spread = 10;
      const reach = 54 + (rank % 3) * 12;
      const startX = from.x + radialX * radius + tangentX * spread;
      const startY = from.y + radialY * radius + tangentY * spread;
      const endX = from.x + radialX * radius - tangentX * spread;
      const endY = from.y + radialY * radius - tangentY * spread;
      const control1X = startX + radialX * reach + tangentX * 28;
      const control1Y = startY + radialY * reach + tangentY * 28;
      const control2X = endX + radialX * reach - tangentX * 28;
      const control2Y = endY + radialY * reach - tangentY * 28;
      path = `M ${startX.toFixed(2)} ${startY.toFixed(2)} C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
      labelX = from.x + radialX * (radius + reach * 0.82);
      labelY = from.y + radialY * (radius + reach * 0.82);
    } else {
      const deltaX = to.x - from.x;
      const deltaY = to.y - from.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      const unitX = deltaX / length;
      const unitY = deltaY / length;
      const normalX = -unitY;
      const normalY = unitX;
      const startX = from.x + unitX * (radius + 2);
      const startY = from.y + unitY * (radius + 2);
      const endX = to.x - unitX * (radius + 8);
      const endY = to.y - unitY * (radius + 8);
      const curve = 18;
      const controlX = (startX + endX) / 2 + normalX * curve;
      const controlY = (startY + endY) / 2 + normalY * curve;
      path = `M ${startX.toFixed(2)} ${startY.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;
      labelX = 0.25 * startX + 0.5 * controlX + 0.25 * endX;
      labelY = 0.25 * startY + 0.5 * controlY + 0.25 * endY;
    }

    edgeSvg += `<path class="cs753-edge cs753-edge-${cs753Escape(status)}" d="${path}" marker-end="url(#cs753-arrow-${marker})" />`;
    if (shouldLabel) {
      edgeSvg += `<text class="cs753-edge-label cs753-edge-label-${cs753Escape(status)}" x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="middle" dy="0.35em">${cs753Escape(edge.digit)}</text>`;
    }
  });

  const nodeSvg = state.graph.nodes.map((node) => {
    const position = positions.get(node.id);
    if (!position) return "";
    return `<g class="cs753-node cs753-node-${cs753Escape(node.status)}"><circle cx="${position.x.toFixed(2)}" cy="${position.y.toFixed(2)}" r="${radius}"/><text x="${position.x.toFixed(2)}" y="${position.y.toFixed(2)}" text-anchor="middle" dy="0.2em">${cs753Escape(node.label)}</text><text class="cs753-node-count" x="${position.x.toFixed(2)}" y="${(position.y + 44).toFixed(2)}" text-anchor="middle">${node.outUsed}/${node.outTotal}</text></g>`;
  }).join("");

  const definitions = `<defs><marker id="cs753-arrow-unused" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker><marker id="cs753-arrow-used" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker><marker id="cs753-arrow-emitted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker><marker id="cs753-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>`;
  return `<section class="cs753-card cs753-graph-card"><header><div><h3>${cs753Escape(copy.graph)}</h3><p>${cs753Escape(copy.graphHelp)}</p></div><strong>${state.traversal.usedCount}/${state.totalEdges} ${cs753Escape(copy.used)}</strong></header><div class="cs753-graph-scroll" tabindex="0"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${cs753Escape(copy.graph)}">${definitions}${edgeSvg}${nodeSvg}</svg></div></section>`;
}

function cs753RenderLedger(state, copy) {
  const rows = state.graph.edges.map((edge) => {
    const status = edge.status === "active"
      ? copy.active
      : edge.emitted
        ? copy.emitted
        : edge.seen
          ? copy.used
          : copy.unused;
    const from = cs753NodeLabel(edge.from, copy);
    const to = cs753NodeLabel(edge.to, copy);
    const orders = [
      edge.visitOrder === null ? "" : `${copy.visit} #${edge.visitOrder}`,
      edge.emitOrder === null ? "" : `${copy.emit} #${edge.emitOrder}`,
    ].filter(Boolean).join(" · ");
    return `<li class="cs753-ledger-edge cs753-ledger-${cs753Escape(edge.status)}"><div><code>${cs753Escape(edge.word)}</code><span>${cs753Escape(from)} → ${cs753Escape(to)}</span></div><small>${cs753Escape(status)}${orders ? ` · ${cs753Escape(orders)}` : ""}</small></li>`;
  }).join("");
  return `<section class="cs753-card cs753-ledger-card"><header><div><h3>${cs753Escape(copy.edgeLedger)}</h3><p>${cs753Escape(copy.edgeLedgerHelp)}</p></div><strong>${state.totalEdges}</strong></header><ol class="cs753-ledger" role="list" tabindex="0">${rows}</ol></section>`;
}

function cs753RenderStack(state, copy) {
  const frames = [...state.traversal.callStack].reverse().map((frame, index) => {
    const top = index === 0;
    const incoming = frame.incomingEdgeId === null ? copy.root : `${copy.incoming} ${frame.incomingEdgeId}`;
    const next = frame.nextValue === null ? "—" : frame.nextValue;
    return `<li class="${top ? "is-top" : ""}"><span>${top ? "TOP" : `d${frame.depth}`}</span><code>dfs(${cs753Escape(cs753NodeLabel(frame.node, copy))})</code><small>${cs753Escape(incoming)} · ${cs753Escape(copy.next)} ${next}</small></li>`;
  }).join("");
  return `<section class="cs753-card cs753-stack-card"><header><div><h3>${cs753Escape(copy.recursionStack)}</h3><p>${cs753Escape(copy.stackHelp)}</p></div><strong>${state.traversal.callStack.length}</strong></header>${frames ? `<ol class="cs753-stack" role="list">${frames}</ol>` : `<p class="cs753-empty">${cs753Escape(copy.emptyStack)}</p>`}</section>`;
}

function cs753Tokens(digits, className) {
  if (!digits.length) return "";
  return digits.map((digit, index) => `<span class="${className}"><small>${index}</small><b>${cs753Escape(digit)}</b></span>`).join("");
}

function cs753RenderOutput(state, copy) {
  const postorder = cs753Tokens(state.output.postorderDigits, "cs753-token cs753-token-postorder");
  const suffix = cs753Tokens(state.output.startSuffix, "cs753-token cs753-token-suffix");
  const sequence = state.output.sequence || copy.waiting;
  const windows = state.output.verifiedWindows.map((window) => {
    const active = window.index === state.output.activeWindowIndex;
    const valid = window.unique && window.expected;
    return `<li class="${active ? "is-active " : ""}${valid ? "is-valid" : "is-invalid"}"><small>${window.index}</small><code>${cs753Escape(window.word)}</code><span>${valid ? "✓" : "!"}</span></li>`;
  }).join("");
  return `<section class="cs753-card cs753-output-card"><header><div><h3>${cs753Escape(copy.output)}</h3><p>${cs753Escape(copy.outputHelp)}</p></div><strong>${state.output.sequence ? `${state.output.sequence.length}/${state.expectedLength}` : copy.waiting}</strong></header><div class="cs753-tape-block"><small>${cs753Escape(copy.postorder)}</small><div class="cs753-tape">${postorder || `<em>${cs753Escape(copy.none)}</em>`}</div></div><div class="cs753-tape-block"><small>${cs753Escape(copy.startSuffix)}</small><div class="cs753-tape">${suffix || `<span class="cs753-epsilon">${cs753Escape(copy.epsilon)}</span>`}</div></div><div class="cs753-sequence"><small>${cs753Escape(copy.sequence)}</small><code>${cs753Escape(sequence)}</code></div><div class="cs753-window-block"><div><h4>${cs753Escape(copy.windows)}</h4><p>${cs753Escape(copy.windowsHelp)}</p></div>${windows ? `<ol class="cs753-windows" role="list">${windows}</ol>` : `<p class="cs753-empty">${cs753Escape(copy.noWindows)}</p>`}</div></section>`;
}

function cs753RenderDiagnostics(state, copy, locale) {
  const invariantRows = CS753_INVARIANT_LABELS.map(([name, labels]) => {
    const result = state.invariants[name];
    const status = result === null ? "pending" : result ? "pass" : "fail";
    const icon = result === null ? "…" : result ? "✓" : "!";
    const text = result === null ? copy.pending : result ? copy.pass : copy.fail;
    return `<li class="cs753-check cs753-check-${status}"><span>${icon}</span><p>${cs753Escape(labels[locale])}</p><strong>${cs753Escape(text)}</strong></li>`;
  }).join("");
  const counterKeys = [
    "candidateChecks",
    "skippedSeenEdges",
    "recursiveCalls",
    "recursiveReturns",
    "consumedEdges",
    "emittedDigits",
    "verifiedWindows",
  ];
  const counterRows = counterKeys.map((name) => `<div><dt>${cs753Escape(copy[name])}</dt><dd>${state.counters[name]}</dd></div>`).join("");
  return `<section class="cs753-diagnostics"><article class="cs753-card"><header><h3>${cs753Escape(copy.invariants)}</h3></header><ul class="cs753-checks" role="list">${invariantRows}</ul></article><article class="cs753-card"><header><h3>${cs753Escape(copy.counters)}</h3></header><dl class="cs753-counters">${counterRows}</dl></article></section>`;
}

function renderCrackingSafe753View(step) {
  const root = typeof $ === "function" ? $("treeView") : null;
  if (!root) return;
  const locale = cs753Locale();
  const copy = CS753_COPY[locale];
  const state = cs753Normalize(step);
  const event = CS753_EVENT_LABELS[state.event]?.[locale] || state.event;
  root.innerHTML = `<div class="cs753-viz${state.final ? " cs753-is-final" : ""}" role="region" aria-label="${cs753Escape(copy.region)}"><header class="cs753-hero"><div><p>${cs753Escape(copy.kicker)}</p><h2>${cs753Escape(state.title)}</h2><span>${cs753Escape(event)}</span></div><dl><div><dt>n / k</dt><dd>${state.n} / ${state.k}</dd></div><div><dt>${cs753Escape(copy.nodes)}</dt><dd>${state.totalNodes}</dd></div><div><dt>${cs753Escape(copy.edges)}</dt><dd>${state.traversal.usedCount}/${state.totalEdges}</dd></div><div><dt>${cs753Escape(copy.length)}</dt><dd>${state.output.sequence ? state.output.sequence.length : "—"}/${state.expectedLength}</dd></div></dl></header>${cs753RenderPhases(state, copy)}${cs753RenderSource(state, copy, locale)}<div class="cs753-primary-grid">${cs753RenderGraph(state, copy)}${cs753RenderLedger(state, copy)}</div><div class="cs753-secondary-grid">${cs753RenderStack(state, copy)}${cs753RenderOutput(state, copy)}</div>${cs753RenderDiagnostics(state, copy, locale)}<section class="cs753-note"><strong>${cs753Escape(copy.note)}</strong><p>${cs753Escape(state.note)}</p></section></div>`;
}
