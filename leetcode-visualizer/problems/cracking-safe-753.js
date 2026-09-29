// LeetCode 753 — Cracking the Safe (De Bruijn graph + Hierholzer DFS).

const CRACKING_SAFE_753_MAX_N = 4;
const CRACKING_SAFE_753_MAX_K = 10;
const CRACKING_SAFE_753_MAX_VISUAL_EDGES = 16;

const CRACKING_SAFE_753_SOURCE = Object.freeze([
  "class Solution:",
  "    def crackSafe(self, n: int, k: int) -> str:",
  "        start = '0' * (n - 1)",
  "        seen = set()",
  "        postorder = []",
  "        def dfs(node):",
  "            for value in range(k):",
  "                digit = str(value)",
  "                edge = node + digit",
  "                if edge in seen:",
  "                    continue",
  "                seen.add(edge)",
  "                dfs(edge[1:])",
  "                postorder.append(digit)",
  "        dfs(start)",
  "        return ''.join(postorder) + start",
]);

function parseCrackingSafe753Input(input) {
  if (!Array.isArray(input) || input.length !== 2 || !input.every(Number.isSafeInteger)) {
    throw new TypeError("Cracking the Safe input must contain exactly two safe integers: n,k.");
  }
  const [n, k] = input;
  if (n < 1 || n > CRACKING_SAFE_753_MAX_N) {
    throw new RangeError(`n must be between 1 and ${CRACKING_SAFE_753_MAX_N}.`);
  }
  if (k < 1 || k > CRACKING_SAFE_753_MAX_K) {
    throw new RangeError(`k must be between 1 and ${CRACKING_SAFE_753_MAX_K}.`);
  }
  const totalEdges = k ** n;
  if (totalEdges > CRACKING_SAFE_753_MAX_VISUAL_EDGES) {
    throw new RangeError(
      `This visualization supports at most ${CRACKING_SAFE_753_MAX_VISUAL_EDGES} combinations; k^n is ${totalEdges}.`,
    );
  }
  return { n, k, totalEdges };
}

function buildCrackingSafe753Words(length, k) {
  let words = [""];
  for (let position = 0; position < length; position++) {
    const next = [];
    for (const prefix of words) {
      for (let value = 0; value < k; value++) next.push(prefix + String(value));
    }
    words = next;
  }
  return words;
}

function deepFreezeCrackingSafe753(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (!item || typeof item !== "object" || Object.isFrozen(item)) return item;
    Object.values(item).forEach(freeze);
    return Object.freeze(item);
  };
  return freeze(copy);
}

function buildSteps753(input) {
  const { n, k, totalEdges } = parseCrackingSafe753Input(input);
  const alphabet = Array.from({ length: k }, (_, value) => String(value));
  const start = "0".repeat(n - 1);
  const nodeWords = buildCrackingSafe753Words(n - 1, k);
  const edgeBlueprints = nodeWords.flatMap((from) => alphabet.map((digit) => {
    const id = from + digit;
    return { id, word: id, from, to: id.slice(1), digit };
  }));
  const expectedEdges = new Set(edgeBlueprints.map((edge) => edge.id));

  const steps = [];
  const seen = new Set();
  const visitOrder = new Map();
  const emitOrder = new Map();
  const postorder = [];
  const callStack = [];
  const verifiedWindows = [];
  const counters = {
    frames: 0,
    recursiveCalls: 0,
    recursiveReturns: 0,
    candidateChecks: 0,
    skippedSeenEdges: 0,
    consumedEdges: 0,
    emittedDigits: 0,
    verifiedWindows: 0,
  };

  let currentNode = start;
  let activeEdgeId = null;
  let candidateDigit = null;
  let decision = "idle";
  let sequence = null;
  let activeWindowIndex = null;
  let traversalComplete = false;
  let verificationComplete = false;

  const localized = (en, vi) => ({ en, vi });
  const displayNode = (node) => node === "" ? "ε" : node;

  const makeView = ({ line, event, phase, final }) => {
    const stackNodes = new Set(callStack.map((frame) => frame.node));
    const graphNodes = nodeWords.map((node) => {
      const outgoing = edgeBlueprints.filter((edge) => edge.from === node);
      return {
        id: node,
        label: displayNode(node),
        outTotal: outgoing.length,
        outUsed: outgoing.filter((edge) => seen.has(edge.id)).length,
        status: node === currentNode ? "current" : stackNodes.has(node) ? "stack" : "idle",
      };
    });
    const graphEdges = edgeBlueprints.map((edge) => ({
      ...edge,
      seen: seen.has(edge.id),
      emitted: emitOrder.has(edge.id),
      visitOrder: visitOrder.get(edge.id) || null,
      emitOrder: emitOrder.get(edge.id) || null,
      status: edge.id === activeEdgeId
        ? "active"
        : emitOrder.has(edge.id)
          ? "emitted"
          : seen.has(edge.id)
            ? "used"
            : "unused",
    }));

    const seenWithinExpected = [...seen].every((edge) => expectedEdges.has(edge));
    const emittedWithinSeen = [...emitOrder.keys()].every((edge) => seen.has(edge));
    const visitOrders = [...visitOrder.values()];
    const emitOrders = [...emitOrder.values()];
    const uniqueVisitOrders = new Set(visitOrders).size === visitOrders.length;
    const uniqueEmitOrders = new Set(emitOrders).size === emitOrders.length;
    const expectedLength = totalEdges + n - 1;
    const verifiedWords = verifiedWindows.map((window) => window.word);
    const uniqueVerifiedWords = new Set(verifiedWords);

    return {
      version: 1,
      problemId: 753,
      event,
      phase,
      source: {
        line,
        text: CRACKING_SAFE_753_SOURCE[line - 1],
      },
      input: {
        n,
        k,
        alphabet: [...alphabet],
        startNode: start,
        totalNodes: nodeWords.length,
        totalEdges,
        expectedLength,
        visualEdgeLimit: CRACKING_SAFE_753_MAX_VISUAL_EDGES,
      },
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
        activeNodeId: currentNode,
        activeEdgeId,
      },
      traversal: {
        currentNode,
        candidateDigit,
        candidateEdgeId: activeEdgeId,
        decision,
        callStack: callStack.map((frame) => ({ ...frame })),
        usedEdgeIds: [...seen],
        usedCount: seen.size,
      },
      output: {
        postorderDigits: [...postorder],
        startSuffix: [...start],
        sequence,
        activeWindowIndex,
        verifiedWindows: verifiedWindows.map((window) => ({ ...window })),
      },
      counters: { ...counters },
      invariants: {
        sourceLineValid: Number.isSafeInteger(line)
          && line >= 1
          && line <= CRACKING_SAFE_753_SOURCE.length,
        seenEdgesAreExpected: seenWithinExpected,
        visitOrdersAreUnique: uniqueVisitOrders && visitOrder.size === seen.size,
        emittedEdgesWereSeen: emittedWithinSeen,
        emitOrdersAreUnique: uniqueEmitOrders && emitOrder.size === postorder.length,
        stackStartsAtRoot: callStack.length === 0 || callStack[0].node === start,
        usedEveryEdge: traversalComplete ? seen.size === totalEdges : null,
        emittedEveryDigit: traversalComplete ? postorder.length === totalEdges : null,
        answerLengthMatches: sequence === null ? null : sequence.length === expectedLength,
        everyWindowUnique: verificationComplete
          ? verifiedWindows.length === totalEdges && uniqueVerifiedWords.size === totalEdges
          : null,
        windowsCoverEveryEdge: verificationComplete
          ? expectedEdges.size === uniqueVerifiedWords.size
            && [...expectedEdges].every((edge) => uniqueVerifiedWords.has(edge))
          : null,
      },
      answer: sequence,
      final,
    };
  };

  const emit = ({ line, event, phase, title, note, final = false }) => {
    // Sequence assembly and window verification are sidecar proofs, not extra
    // executions of the displayed Python return statement. Build them fully
    // and expose them on the one real final-return frame.
    if (event === "assemble-answer" || event === "verify-window" || event === "enter-dfs") return;
    counters.frames++;
    const view = makeView({ line, event, phase, final });
    const tape = view.output.sequence === null
      ? view.output.postorderDigits
      : [...view.output.sequence];
    let highlight = [];
    if (view.output.sequence !== null && view.output.activeWindowIndex !== null) {
      highlight = Array.from({ length: n }, (_, offset) => view.output.activeWindowIndex + offset);
    } else if (view.output.postorderDigits.length > 0) {
      highlight = [view.output.postorderDigits.length - 1];
    }
    const suffixStart = view.output.sequence === null
      ? -1
      : view.output.sequence.length - view.output.startSuffix.length;
    const mark = suffixStart < 0
      ? []
      : Array.from({ length: view.output.startSuffix.length }, (_, offset) => suffixStart + offset);

    steps.push(deepFreezeCrackingSafe753({
      title,
      note,
      arr: tape.map(Number),
      sub: tape.map((_, index) => String(index)),
      highlight,
      mark,
      codeLines: [line],
      final,
      vars: [
        { name: "n, k", value: `${n}, ${k}` },
        { name: "node", value: currentNode === null ? "—" : displayNode(currentNode) },
        { name: "edge", value: activeEdgeId || "—" },
        { name: "seen", value: `${seen.size}/${totalEdges}` },
        { name: "postorder", value: postorder.join("") || "∅" },
        { name: "stack depth", value: callStack.length },
      ],
      crackingSafe753View: view,
    }));
  };

  emit({
    line: 1,
    event: "bind-class",
    phase: "setup",
    title: localized("Bind Solution class", "Liên kết lớp Solution"),
    note: localized(
      "The class owns one exact De Bruijn graph traversal method.",
      "Lớp chứa một phương thức duyệt đồ thị De Bruijn chính xác.",
    ),
  });

  emit({
    line: 2,
    event: "bind-method",
    phase: "setup",
    title: localized("Bind crackSafe", "Liên kết crackSafe"),
    note: localized(
      "The strict parser has already bounded n, k, and the complete edge set.",
      "Bộ phân tích nghiêm ngặt đã giới hạn n, k và toàn bộ tập cạnh.",
    ),
  });

  emit({
    line: 3,
    event: "create-start-node",
    phase: "setup",
    title: localized("Create the zero start node", "Tạo node bắt đầu toàn số 0"),
    note: localized(
      `Every node stores ${n - 1} digit${n === 2 ? "" : "s"}; the start node is ${displayNode(start)}.`,
      `Mỗi node lưu ${n - 1} chữ số; node bắt đầu là ${displayNode(start)}.`,
    ),
  });

  emit({
    line: 4,
    event: "initialize-edge-set",
    phase: "setup",
    title: localized("Initialize the used-edge set", "Khởi tạo tập cạnh đã dùng"),
    note: localized(
      `The De Bruijn graph has ${nodeWords.length} node(s) and ${totalEdges} distinct ${n}-digit edge(s).`,
      `Đồ thị De Bruijn có ${nodeWords.length} node và ${totalEdges} cạnh ${n} chữ số khác nhau.`,
    ),
  });

  emit({
    line: 5,
    event: "initialize-postorder",
    phase: "setup",
    title: localized("Initialize postorder output", "Khởi tạo output postorder"),
    note: localized(
      "Digits are appended only after each recursive edge traversal returns.",
      "Chữ số chỉ được thêm sau khi mỗi lần duyệt cạnh đệ quy trả về.",
    ),
  });

  emit({
    line: 6,
    event: "bind-dfs",
    phase: "setup",
    title: localized("Bind Hierholzer DFS helper", "Liên kết helper DFS Hierholzer"),
    note: localized(
      "Each recursive call consumes unused outgoing edges and emits digits on return.",
      "Mỗi lời gọi đệ quy dùng các cạnh ra chưa dùng và phát digit khi trả về.",
    ),
  });

  function dfs(node, incomingEdgeId = null) {
    counters.recursiveCalls++;
    currentNode = node;
    activeEdgeId = incomingEdgeId;
    candidateDigit = incomingEdgeId === null ? null : incomingEdgeId.slice(-1);
    decision = incomingEdgeId === null ? "enter-root" : "descend";
    callStack.push({
      depth: callStack.length,
      node,
      incomingEdgeId,
      nextValue: null,
    });

    emit({
      line: 6,
      event: "enter-dfs",
      phase: "traverse",
      title: localized(`Enter dfs(${displayNode(node)})`, `Vào dfs(${displayNode(node)})`),
      note: localized(
        incomingEdgeId === null
          ? "Start Hierholzer DFS at the all-zero node. Nodes may repeat; edges may not."
          : `Follow edge ${incomingEdgeId} to suffix node ${displayNode(node)}.`,
        incomingEdgeId === null
          ? "Bắt đầu DFS Hierholzer tại node toàn số 0. Node được phép lặp; cạnh thì không."
          : `Đi theo cạnh ${incomingEdgeId} tới node hậu tố ${displayNode(node)}.`,
      ),
    });

    for (let value = 0; value < k; value++) {
      const frame = callStack[callStack.length - 1];
      frame.nextValue = value;
      currentNode = node;
      candidateDigit = String(value);
      activeEdgeId = null;
      decision = "inspect-value";
      emit({
        line: 7,
        event: "value-loop-true",
        phase: "traverse",
        title: localized(`Try value ${value} at ${displayNode(node)}`, `Thử giá trị ${value} tại ${displayNode(node)}`),
        note: localized(
          `The loop examines value ${value} of 0..${k - 1} for this DFS frame.`,
          `Vòng lặp xét giá trị ${value} trong 0..${k - 1} cho frame DFS này.`,
        ),
      });

      const digit = String(value);
      emit({
        line: 8,
        event: "assign-digit",
        phase: "traverse",
        title: localized(`digit = \"${digit}\"`, `digit = \"${digit}\"`),
        note: localized(
          "Convert the numeric alphabet value to the digit appended to this node.",
          "Chuyển giá trị bảng chữ số thành digit được nối vào node này.",
        ),
      });

      const edge = node + digit;
      activeEdgeId = edge;
      counters.candidateChecks++;
      emit({
        line: 9,
        event: "build-edge",
        phase: "traverse",
        title: localized(`edge = ${edge}`, `edge = ${edge}`),
        note: localized(
          `This n-digit word represents one directed edge to suffix ${displayNode(edge.slice(1))}.`,
          `Từ n chữ số này biểu diễn một cạnh có hướng tới hậu tố ${displayNode(edge.slice(1))}.`,
        ),
      });

      const alreadySeen = seen.has(edge);
      emit({
        line: 10,
        event: alreadySeen ? "seen-check-true" : "seen-check-false",
        phase: "traverse",
        title: localized(
          alreadySeen ? `${edge} is already used` : `${edge} is unused`,
          alreadySeen ? `${edge} đã được dùng` : `${edge} chưa được dùng`,
        ),
        note: localized(
          alreadySeen ? "The next source line continues this exact loop iteration." : "The edge can be consumed exactly once.",
          alreadySeen ? "Dòng nguồn kế tiếp continue đúng vòng lặp này." : "Cạnh có thể được dùng đúng một lần.",
        ),
      });

      if (alreadySeen) {
        counters.skippedSeenEdges++;
        decision = "skip-seen";
        emit({
          line: 11,
          event: "skip-seen-edge",
          phase: "traverse",
          title: localized(`Skip used edge ${edge}`, `Bỏ qua cạnh đã dùng ${edge}`),
          note: localized(
            "This edge already belongs to the Eulerian walk. Every executed continue is represented.",
            "Cạnh này đã thuộc đường đi Euler. Mọi lần continue thực thi đều được biểu diễn.",
          ),
        });
        continue;
      }

      seen.add(edge);
      visitOrder.set(edge, visitOrder.size + 1);
      counters.consumedEdges++;
      decision = "consume";
      emit({
        line: 12,
        event: "consume-edge",
        phase: "traverse",
        title: localized(
          `Consume edge ${edge} (${seen.size}/${totalEdges})`,
          `Dùng cạnh ${edge} (${seen.size}/${totalEdges})`,
        ),
        note: localized(
          `Mark the ${n}-digit word ${edge} before recursing to its suffix ${displayNode(edge.slice(1))}.`,
          `Đánh dấu từ ${n} chữ số ${edge} trước khi đệ quy tới hậu tố ${displayNode(edge.slice(1))}.`,
        ),
      });

      emit({
        line: 13,
        event: "recurse-edge",
        phase: "traverse",
        title: localized(
          `Call dfs(${displayNode(edge.slice(1))})`,
          `Gọi dfs(${displayNode(edge.slice(1))})`,
        ),
        note: localized(
          `Descend through edge ${edge}; its digit is appended only after this call returns.`,
          `Đi xuống qua cạnh ${edge}; digit của nó chỉ được thêm sau khi lời gọi này trả về.`,
        ),
      });
      dfs(edge.slice(1), edge);

      currentNode = node;
      activeEdgeId = edge;
      candidateDigit = digit;
      decision = "emit-postorder";
      postorder.push(digit);
      emitOrder.set(edge, emitOrder.size + 1);
      counters.emittedDigits++;
      emit({
        line: 14,
        event: "emit-postorder-digit",
        phase: "unwind",
        title: localized(
          `Append ${digit} after returning from ${displayNode(edge.slice(1))}`,
          `Thêm ${digit} sau khi quay về từ ${displayNode(edge.slice(1))}`,
        ),
        note: localized(
          `Postorder now reads ${postorder.join("")}. Appending on unwind splices every explored cycle into one Eulerian circuit.`,
          `Postorder hiện là ${postorder.join("")}. Thêm chữ số khi quay lui sẽ ghép mọi chu trình đã duyệt thành một chu trình Euler.`,
        ),
      });
    }

    const completedFrame = callStack[callStack.length - 1];
    completedFrame.nextValue = k;
    currentNode = node;
    activeEdgeId = null;
    candidateDigit = null;
    decision = "return";
    emit({
      line: 7,
      event: "value-loop-false",
      phase: "unwind",
      title: localized(`Finish values for ${displayNode(node)}`, `Hoàn tất các giá trị cho ${displayNode(node)}`),
      note: localized(
        `The loop condition is false after value ${k - 1}; this DFS frame now returns.`,
        `Điều kiện vòng lặp sai sau giá trị ${k - 1}; frame DFS này giờ trả về.`,
      ),
    });

    callStack.pop();
    counters.recursiveReturns++;
    currentNode = callStack.length > 0 ? callStack[callStack.length - 1].node : null;
  }

  decision = "start-dfs";
  emit({
    line: 15,
    event: "start-dfs",
    phase: "setup",
    title: localized("Start Hierholzer traversal", "Bắt đầu duyệt Hierholzer"),
    note: localized(
      "Each possible n-digit password is one directed edge from its prefix to its suffix.",
      "Mỗi mật mã n chữ số là một cạnh có hướng từ tiền tố tới hậu tố của nó.",
    ),
  });

  dfs(start);
  traversalComplete = true;
  sequence = postorder.join("") + start;
  currentNode = null;
  activeEdgeId = null;
  candidateDigit = null;
  decision = "assemble-answer";

  emit({
    line: 16,
    event: "assemble-answer",
    phase: "unwind",
    title: localized(`Assemble ${sequence}`, `Ghép thành ${sequence}`),
    note: localized(
      `Append the start node ${displayNode(start)} to the ${postorder.length}-digit postorder tape.`,
      `Nối node bắt đầu ${displayNode(start)} vào dải postorder gồm ${postorder.length} chữ số.`,
    ),
  });

  const windowSet = new Set();
  for (let index = 0; index < totalEdges; index++) {
    const word = sequence.slice(index, index + n);
    const unique = !windowSet.has(word);
    windowSet.add(word);
    verifiedWindows.push({
      index,
      word,
      unique,
      expected: expectedEdges.has(word),
    });
    counters.verifiedWindows++;
    activeWindowIndex = index;
    activeEdgeId = word;
    decision = unique && expectedEdges.has(word) ? "verify-pass" : "verify-fail";
    emit({
      line: 16,
      event: "verify-window",
      phase: "verify",
      title: localized(
        `Verify window ${index + 1}/${totalEdges}: ${word}`,
        `Kiểm tra cửa sổ ${index + 1}/${totalEdges}: ${word}`,
      ),
      note: localized(
        unique
          ? `${word} is a new ${n}-digit window and maps to exactly one graph edge.`
          : `${word} is duplicated, so the candidate sequence would be invalid.`,
        unique
          ? `${word} là cửa sổ ${n} chữ số mới và tương ứng đúng một cạnh của đồ thị.`
          : `${word} bị lặp, vì vậy chuỗi ứng viên sẽ không hợp lệ.`,
      ),
    });
  }

  verificationComplete = true;
  activeWindowIndex = null;
  activeEdgeId = null;
  decision = "done";
  const finalView = makeView({ line: 16, event: "final-return", phase: "done", final: true });
  const finalChecks = finalView.invariants;
  if (!finalChecks.usedEveryEdge
    || !finalChecks.emittedEveryDigit
    || !finalChecks.answerLengthMatches
    || !finalChecks.everyWindowUnique
    || !finalChecks.windowsCoverEveryEdge) {
    throw new Error("Cracking the Safe final invariant failed.");
  }

  emit({
    line: 16,
    event: "final-return",
    phase: "done",
    title: localized(`Return ${sequence}`, `Trả về ${sequence}`),
    note: localized(
      `All ${totalEdges} possible passwords occur exactly once; the shortest valid sequence has length ${sequence.length}.`,
      `Cả ${totalEdges} mật mã có thể đều xuất hiện đúng một lần; chuỗi hợp lệ ngắn nhất có độ dài ${sequence.length}.`,
    ),
    final: true,
  });

  if (steps.filter((step) => step.final).length !== 1
    || steps.some((step) => step.codeLines.length !== 1)
    || steps.some((step) => !Object.isFrozen(step) || !Object.isFrozen(step.crackingSafe753View))) {
    throw new Error("Cracking the Safe immutable trace invariant failed.");
  }

  return {
    original: [n, k],
    n,
    k,
    start,
    edgeCount: totalEdges,
    answer: sequence,
    steps,
  };
}

module.exports = {
  753: {
    id: 753,
    difficulty: "hard",
    slug: "cracking-the-safe",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    tags: [
      { key: "eulerian-path", vi: "Đường đi Euler", en: "Eulerian Path" },
      { key: "de-bruijn", vi: "Đồ thị De Bruijn", en: "De Bruijn Graph" },
      { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    ],
    title: { vi: "Cracking the Safe", en: "Cracking the Safe" },
    titleVi: {
      vi: "Mở khóa két bằng chuỗi De Bruijn ngắn nhất",
      en: "Open the safe with a shortest De Bruijn sequence",
    },
    statement: {
      vi: `Két ghi nhớ ${"n"} chữ số gần nhất; mỗi chữ số thuộc 0..k-1. Hãy trả về chuỗi ngắn nhất chứa mọi mật mã độ dài n như một substring để chắc chắn mở được két. Visualizer nhận n=1..${CRACKING_SAFE_753_MAX_N}, k=1..${CRACKING_SAFE_753_MAX_K} và giới hạn k^n<=${CRACKING_SAFE_753_MAX_VISUAL_EDGES} cạnh để hiển thị đầy đủ.`,
      en: `The safe remembers the latest n digits, each in 0..k-1. Return a shortest string containing every length-n password as a substring, guaranteeing that the safe opens. The visualizer accepts n=1..${CRACKING_SAFE_753_MAX_N}, k=1..${CRACKING_SAFE_753_MAX_K}, and limits k^n to ${CRACKING_SAFE_753_MAX_VISUAL_EDGES} edges so the full trace remains readable.`,
    },
    defaultInput: [2, 2],
    inputKind: "positive",
    inputLabel: {
      vi: `n,k (k^n <= ${CRACKING_SAFE_753_MAX_VISUAL_EDGES})`,
      en: `n,k (k^n <= ${CRACKING_SAFE_753_MAX_VISUAL_EDGES})`,
    },
    extraParams: [],
    debugMode: "line-by-line",
    approach: [
      {
        vi: "Xem mỗi chuỗi n chữ số là một cạnh từ tiền tố n−1 chữ số tới hậu tố n−1 chữ số trong đồ thị De Bruijn.",
        en: "Treat every n-digit string as an edge from its (n−1)-digit prefix to its (n−1)-digit suffix in a De Bruijn graph.",
      },
      {
        vi: "Chạy DFS Hierholzer từ node toàn số 0; node có thể được thăm nhiều lần nhưng mỗi cạnh chỉ được đánh dấu đúng một lần.",
        en: "Run Hierholzer DFS from the all-zero node; nodes may be revisited, but every edge is marked exactly once.",
      },
      {
        vi: "Chỉ thêm chữ số của cạnh sau khi lời gọi đệ quy quay về. Postorder ghép các chu trình con thành một chu trình Euler duy nhất.",
        en: "Append an edge's digit only after its recursive call returns. Postorder splices the sub-cycles into one Eulerian circuit.",
      },
      {
        vi: "Nối node bắt đầu vào cuối postorder, rồi kiểm tra từng cửa sổ độ dài n để chứng minh đủ k^n mật mã và không trùng.",
        en: "Append the start node to the postorder digits, then verify every length-n window to prove all k^n passwords appear without duplicates.",
      },
    ],
    complexity: {
      time: "O(k^n)",
      space: "O(k^n)",
      note: {
        vi: "Đồ thị có k^(n−1) node và k^n cạnh. Mỗi cạnh được đánh dấu, duyệt và phát ra đúng một lần; seen, postorder và ngăn xếp dùng O(k^n).",
        en: "The graph has k^(n−1) nodes and k^n edges. Every edge is marked, traversed, and emitted once; seen, postorder, and the recursion stack use O(k^n) space.",
      },
    },
    code: CRACKING_SAFE_753_SOURCE,
    parseCrackingSafe753Input,
    liveArgs: (input) => {
      const { n, k } = parseCrackingSafe753Input(input);
      return [n, k];
    },
    builder: buildSteps753,
  },
};
