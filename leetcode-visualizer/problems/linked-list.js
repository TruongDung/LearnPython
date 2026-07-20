// LeetCode Visualizer — Linked List problems.

/**
 * LeetCode 141: Linked List Cycle — Floyd's Slow/Fast Pointer.
 *
 * Visualization: show the linked list as a graph (nodes in a line, with
 * a back-edge for the cycle). Highlight slow (amber) and fast (green)
 * pointers each step. When they meet → cycle detected.
 *
 * Input: comma-separated node values as a string.
 * Param `pos`: index where the tail connects to (0-indexed). -1 = no cycle.
 */
function buildSteps141(input, params) {
  const values = String(input || "").split(",").map((s) => Number(s.trim()));
  const pos = params && Number.isFinite(Number(params.pos)) ? Number(params.pos) : -1;
  const n = values.length;
  const steps = [];

  if (n === 0) {
    steps.push({
      title: { vi: "List rỗng → False", en: "Empty list → False" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: false }],
      note: { vi: "List rỗng, không có cycle.", en: "Empty list, no cycle." },
    });
    return { original: values, answer: false, steps };
  }

  // Build graph structure: each node points to next; last node points to pos
  // (or null if pos === -1).
  function snapshot(opts) {
    const slowIdx = opts.slowIdx != null ? opts.slowIdx : -1;
    const fastIdx = opts.fastIdx != null ? opts.fastIdx : -1;
    const fastNextIdx = opts.fastNextIdx != null ? opts.fastNextIdx : -1;
    const nodes = values.map((v, i) => {
      return { id: i, label: `${v}` };
    });
    // Build annotations object: { nodeId: "label text" }
    const annotations = {};
    if (slowIdx >= 0 && slowIdx === fastIdx) {
      annotations[slowIdx] = "slow+fast";
    } else {
      if (slowIdx >= 0) annotations[slowIdx] = "slow";
      if (fastIdx >= 0) annotations[fastIdx] = "fast";
    }
    // Show fast.next (the intermediate node fast passes through)
    if (fastNextIdx >= 0 && fastNextIdx !== slowIdx && fastNextIdx !== fastIdx) {
      annotations[fastNextIdx] = "fast.next";
    }
    // Always mark head (node 0)
    if (!annotations[0]) annotations[0] = "head";
    else if (!annotations[0].includes("head")) annotations[0] = "head " + annotations[0];
    // Edges: 0→1, 1→2, ..., n-2→n-1, optionally n-1→pos
    const edges = [];
    for (let i = 0; i < n - 1; i++) edges.push({ u: i, v: i + 1, w: "" });
    if (pos >= 0 && pos < n) edges.push({ u: n - 1, v: pos, w: "cycle" });

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges,
        annotations,
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: opts.visitedNodes || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // ── Intro ─────────────────────────────────────────────
  snapshot({
    title: { vi: "Khởi tạo slow = fast = head", en: "Initialize slow = fast = head" },
    codeLines: [3],
    hlNodes: [0],
    slowIdx: 0,
    fastIdx: 0,
    vars: [
      { name: "slow", value: `node 0 (val=${values[0]})` },
      { name: "fast", value: `node 0 (val=${values[0]})` },
      { name: "pos (cycle target)", value: pos },
    ],
    note: {
      vi:
        `Floyd's Algorithm: slow đi 1 bước, fast đi 2 bước mỗi vòng lặp.\n` +
        `Nếu có cycle → fast sẽ bắt kịp slow (gặp nhau ở cùng node).\n` +
        `Nếu fast chạm null → không có cycle.` +
        (pos >= 0 ? `\n(Cycle: node cuối trỏ về node ${pos}.)` : `\n(Không có cycle: pos = -1.)`),
      en:
        `Floyd's Algorithm: slow advances 1 step, fast advances 2 steps each iteration.\n` +
        `If cycle exists → fast catches up to slow (they meet at the same node).\n` +
        `If fast hits null → no cycle.` +
        (pos >= 0 ? `\n(Cycle: last node points back to node ${pos}.)` : `\n(No cycle: pos = -1.)`),
    },
  });

  // ── Simulate Floyd's ──────────────────────────────────
  // Build the "next" mapping (simulates the linked list)
  const next = new Array(n).fill(-1);
  for (let i = 0; i < n - 1; i++) next[i] = i + 1;
  if (pos >= 0 && pos < n) next[n - 1] = pos;

  let slow = 0;
  let fast = 0;
  let answer = false;
  const MAX_STEPS = 30;

  for (let step = 0; step < MAX_STEPS; step++) {
    // Check if fast can move
    if (fast === -1 || next[fast] === -1) {
      // fast hit end → no cycle
      snapshot({
        title: { vi: "fast chạm null → Không cycle", en: "fast hit null → No cycle" },
        codeLines: [4, 9],
        hlNodes: slow !== -1 ? [slow] : [],
        slowIdx: slow >= 0 ? slow : -1,
        fastIdx: -1,
        vars: [
          { name: "slow", value: slow >= 0 ? `node ${slow}` : "null" },
          { name: "fast", value: fast >= 0 ? `node ${fast}` : "null" },
          { name: "answer", value: false },
        ],
        note: {
          vi: `fast (hoặc fast.next) là null → list kết thúc, không có chu trình. Trả về False.`,
          en: `fast (or fast.next) is null → list terminates, no cycle. Return False.`,
        },
      });
      break;
    }

    // Move pointers
    slow = next[slow];
    fast = next[next[fast]]; // fast moves 2 (next[fast] guaranteed valid above)

    snapshot({
      title: { vi: `Bước ${step + 1}: slow→${slow}, fast→${fast}`, en: `Step ${step + 1}: slow→${fast >= 0 ? fast : "null"}` },
      codeLines: [5, 6],
      hlNodes: fast >= 0 ? [slow, fast] : [slow],
      slowIdx: slow,
      fastIdx: fast >= 0 ? fast : -1,
      fastNextIdx: fast >= 0 && next[fast] >= 0 ? next[fast] : -1,
      hlEdges: fast >= 0 && slow !== fast ? [[slow > 0 ? slow - 1 : (pos >= 0 ? n - 1 : -1), slow]] : [],
      vars: [
        { name: "step", value: step + 1 },
        { name: "slow", value: slow >= 0 ? `node ${slow} (val=${values[slow]})` : "null" },
        { name: "fast", value: fast >= 0 ? `node ${fast} (val=${values[fast]})` : "null" },
        { name: "fast.next", value: fast >= 0 && next[fast] >= 0 ? `node ${next[fast]} (val=${values[next[fast]]})` : "null" },
      ],
      note: {
        vi: `slow → node ${slow}${slow >= 0 ? ` (val=${values[slow]})` : ""}. fast → node ${fast >= 0 ? fast : "null"}${fast >= 0 ? ` (val=${values[fast]})` : ""}.${slow === fast && slow >= 0 ? " ⚡ GẶP NHAU!" : ""}`,
        en: `slow → node ${slow}${slow >= 0 ? ` (val=${values[slow]})` : ""}. fast → node ${fast >= 0 ? fast : "null"}${fast >= 0 ? ` (val=${values[fast]})` : ""}.${slow === fast && slow >= 0 ? " ⚡ MEET!" : ""}`,
      },
    });

    // Check meeting
    if (slow === fast && slow >= 0) {
      answer = true;
      snapshot({
        title: { vi: "✓ slow == fast → Có cycle!", en: "✓ slow == fast → Cycle detected!" },
        codeLines: [7, 8],
        hlNodes: [slow],
        slowIdx: slow,
        fastIdx: fast,
        vars: [
          { name: "slow", value: `node ${slow}` },
          { name: "fast", value: `node ${fast}` },
          { name: "met at", value: `node ${slow} (val=${values[slow]})` },
          { name: "answer", value: true },
        ],
        note: {
          vi: `slow và fast gặp nhau tại node ${slow} (val=${values[slow]}). → Có chu trình! Trả về True.`,
          en: `slow and fast meet at node ${slow} (val=${values[slow]}). → Cycle exists! Return True.`,
        },
      });
      break;
    }

    // Check if fast hit end after moving
    if (fast < 0 || fast >= n) {
      snapshot({
        title: { vi: "fast ra khỏi list → Không cycle", en: "fast out of list → No cycle" },
        codeLines: [4, 9],
        hlNodes: [slow],
        slowIdx: slow,
        fastIdx: -1,
        vars: [
          { name: "slow", value: `node ${slow}` },
          { name: "fast", value: "null" },
          { name: "answer", value: false },
        ],
        note: { vi: "fast.next.next = null → không có cycle.", en: "fast.next.next = null → no cycle." },
      });
      break;
    }
  }

  if (!steps[steps.length - 1].final) steps[steps.length - 1].final = true;

  return { original: values, answer, steps };
}


/**
 * LeetCode 83: Remove Duplicates from Sorted List.
 * Walk through the sorted list; when curr.val == curr.next.val, skip the duplicate.
 * Visualize using graph renderer with `curr` annotation above the active node.
 * Removed nodes shown as "visited" (greyed-out) in the graph.
 */
function buildSteps83(input) {
  const values = String(input || "").split(",").map((s) => Number(s.trim()));
  const n = values.length;
  const steps = [];
  const removed = new Set(); // indices of removed nodes

  if (n === 0) {
    steps.push({
      title: { vi: "List rỗng", en: "Empty list" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "List rỗng, trả về null.", en: "Empty list, return null." },
    });
    return { original: values, answer: [], steps };
  }

  function snapshot(opts) {
    const currIdx = opts.currIdx != null ? opts.currIdx : -1;
    const nodes = values.map((v, i) => ({ id: i, label: `${v}` }));
    const edges = [];
    // Build edges skipping removed nodes (curr.next = curr.next.next)
    let prev = -1;
    for (let i = 0; i < n; i++) {
      if (removed.has(i)) continue;
      if (prev >= 0) edges.push({ u: prev, v: i, w: "" });
      prev = i;
    }
    // Annotations
    const annotations = {};
    if (currIdx >= 0) annotations[currIdx] = "curr";
    // Head always labeled
    if (!removed.has(0)) {
      annotations[0] = annotations[0] ? "head " + annotations[0] : "head";
    }

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges,
        annotations,
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: [...removed], // greyed-out removed nodes
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  // Init
  snapshot({
    title: { vi: "Khởi tạo curr = head", en: "Initialize curr = head" },
    currIdx: 0,
    codeLines: [3],
    hlNodes: [0],
    vars: [
      { name: "curr", value: `node 0 (val=${values[0]})` },
    ],
    note: {
      vi: `List đã sắp xếp: [${values.join(" → ")}]. Duyệt từ head, nếu curr.val == curr.next.val → bỏ next.`,
      en: `Sorted list: [${values.join(" → ")}]. Walk from head; if curr.val == curr.next.val → skip next.`,
    },
  });

  // Simulate
  let curr = 0;
  while (curr < n) {
    // Find next non-removed node after curr
    let nextIdx = curr + 1;
    while (nextIdx < n && removed.has(nextIdx)) nextIdx++;

    if (nextIdx >= n) break; // no next node

    if (values[curr] === values[nextIdx]) {
      // Duplicate: remove nextIdx
      removed.add(nextIdx);
      snapshot({
        title: { vi: `${values[curr]} == ${values[nextIdx]} → bỏ node ${nextIdx}`, en: `${values[curr]} == ${values[nextIdx]} → remove node ${nextIdx}` },
        currIdx: curr,
        codeLines: [5, 6],
        hlNodes: [curr, nextIdx],
        vars: [
          { name: "curr", value: `node ${curr} (val=${values[curr]})` },
          { name: "curr.next", value: `node ${nextIdx} (val=${values[nextIdx]})` },
          { name: "action", value: "duplicate → skip" },
        ],
        note: {
          vi: `curr.val (${values[curr]}) == next.val (${values[nextIdx]}) → bỏ node ${nextIdx}. curr.next trỏ sang node tiếp theo.`,
          en: `curr.val (${values[curr]}) == next.val (${values[nextIdx]}) → remove node ${nextIdx}. curr.next now points further.`,
        },
      });
      // Don't advance curr — check the new next
    } else {
      // Move to next
      snapshot({
        title: { vi: `${values[curr]} ≠ ${values[nextIdx]} → tiến`, en: `${values[curr]} ≠ ${values[nextIdx]} → advance` },
        currIdx: nextIdx,
        codeLines: [7, 8],
        hlNodes: [curr, nextIdx],
        vars: [
          { name: "curr (old)", value: `node ${curr} (val=${values[curr]})` },
          { name: "curr (new)", value: `node ${nextIdx} (val=${values[nextIdx]})` },
          { name: "action", value: "different → move" },
        ],
        note: {
          vi: `curr.val (${values[curr]}) ≠ next.val (${values[nextIdx]}) → giá trị mới, tiến curr.`,
          en: `curr.val (${values[curr]}) ≠ next.val (${values[nextIdx]}) → new value, advance curr.`,
        },
      });
      curr = nextIdx;
    }
  }

  // Result
  const result = values.filter((_, i) => !removed.has(i));
  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    currIdx: -1,
    codeLines: [9],
    vars: [
      { name: "result", value: `[${result.join(", ")}]` },
      { name: "removed", value: removed.size },
    ],
    note: {
      vi: `Sau khi xóa ${removed.size} node trùng: [${result.join(" → ")}].`,
      en: `After removing ${removed.size} duplicate node(s): [${result.join(" → ")}].`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: values, answer: result, steps };
}

/**
 * LeetCode 203: Remove Linked List Elements.
 * Use a dummy node → prev/curr walk. When curr.val == val, skip it (prev.next = curr.next).
 * Visualization: graph with annotations "prev", "curr", removed nodes greyed out.
 */
function buildSteps203(input, params) {
  const values = String(input || "").split(",").map((s) => Number(s.trim()));
  const val = params && Number.isFinite(Number(params.val)) ? Number(params.val) : 6;
  const n = values.length;
  const steps = [];
  const removed = new Set();

  if (n === 0) {
    steps.push({
      title: { vi: "List rỗng", en: "Empty list" },
      arr: [], highlight: [], mark: [], final: true, codeLines: [3],
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "List rỗng → trả về null.", en: "Empty list → return null." },
    });
    return { original: values, answer: [], steps };
  }

  function snapshot(opts) {
    const prevIdx = opts.prevIdx != null ? opts.prevIdx : -1; // -1 = dummy
    const currIdx = opts.currIdx != null ? opts.currIdx : -1;
    // Include dummy node (id = -1 displayed as index 0, real nodes shifted +1)
    // Actually simpler: prepend a "D" dummy node at id "d"
    const nodes = [{ id: "d", label: "D" }, ...values.map((v, i) => ({ id: i, label: `${v}` }))];
    // Build edges: dummy → first non-removed, then chain non-removed nodes
    const edges = [];
    let prev = "d";
    for (let i = 0; i < n; i++) {
      if (removed.has(i)) continue;
      edges.push({ u: prev, v: i, w: "" });
      prev = i;
    }
    // If all removed, dummy points nowhere (no edge)
    // Annotations
    const annotations = {};
    // Always show prev (even when on dummy)
    const prevKey = prevIdx === -1 ? "d" : prevIdx;
    annotations[prevKey] = "prev";
    // Show curr
    if (currIdx >= 0) {
      const currLabel = removed.has(currIdx) ? "curr ✗" : "curr";
      if (currIdx === prevIdx) {
        // same node: combine
        annotations[currIdx] = "prev " + currLabel;
      } else {
        annotations[currIdx] = currLabel;
      }
    }
    // Always label dummy
    if (!annotations["d"]) annotations["d"] = "dummy";
    else if (!String(annotations["d"]).includes("dummy")) annotations["d"] = "dummy " + annotations["d"];
    // Label head (first non-removed real node)
    const headIdx = values.findIndex((_, i) => !removed.has(i));
    if (headIdx >= 0 && !annotations[headIdx]) annotations[headIdx] = "head";
    else if (headIdx >= 0 && annotations[headIdx] && !String(annotations[headIdx]).includes("head")) {
      annotations[headIdx] = "head " + annotations[headIdx];
    }

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges,
        annotations,
        hlNodes: opts.hlNodes || [],
        hlEdges: opts.hlEdges || [],
        visitedNodes: [...removed],
      },
      highlight: [], mark: [], codeLines: opts.codeLines || [],
      vars: opts.vars || [], note: opts.note,
    });
  }

  // Init: dummy → head
  snapshot({
    title: { vi: "Khởi tạo dummy → prev = dummy, curr = head", en: "Init dummy → prev = dummy, curr = head" },
    prevIdx: -1, currIdx: 0,
    codeLines: [3, 4, 5],
    hlNodes: [0],
    vars: [
      { name: "dummy", value: `ListNode(0, head) → dummy.next = node 0` },
      { name: "val to remove", value: val },
      { name: "prev", value: "dummy" },
      { name: "curr", value: `node 0 (val=${values[0]})` },
    ],
    note: {
      vi: `Dùng dummy node trước head. prev = dummy, curr = head. Xóa mọi node có val = ${val}.`,
      en: `Use a dummy node before head. prev = dummy, curr = head. Remove all nodes with val = ${val}.`,
    },
  });

  // Walk
  let prevIdx = -1; // -1 means dummy
  let currIdx = 0;

  while (currIdx < n) {
    // Step A: show curr arriving at this node (prev stays where it was)
    snapshot({
      title: { vi: `curr = curr.next → node ${currIdx}`, en: `curr = curr.next → node ${currIdx}` },
      prevIdx, currIdx,
      codeLines: [11],
      hlNodes: [currIdx],
      vars: [
        { name: "prev", value: prevIdx >= 0 ? `node ${prevIdx} (val=${values[prevIdx]})` : "dummy" },
        { name: "curr", value: `node ${currIdx} (val=${values[currIdx]})` },
      ],
      note: {
        vi: `curr tiến đến node ${currIdx} (val=${values[currIdx]}). Kiểm tra: curr.val == val (${val})?`,
        en: `curr advances to node ${currIdx} (val=${values[currIdx]}). Check: curr.val == val (${val})?`,
      },
    });

    // Step B: decide based on value
    if (values[currIdx] === val) {
      // Remove currIdx
      removed.add(currIdx);
      snapshot({
        title: { vi: `${values[currIdx]} == ${val} → xóa node ${currIdx}`, en: `${values[currIdx]} == ${val} → remove node ${currIdx}` },
        prevIdx, currIdx,
        codeLines: [6, 7, 8],
        hlNodes: [currIdx],
        vars: [
          { name: "prev", value: prevIdx >= 0 ? `node ${prevIdx} (val=${values[prevIdx]})` : "dummy" },
          { name: "curr", value: `node ${currIdx} (val=${values[currIdx]}) ✗ removed` },
          { name: "action", value: "remove → skip node" },
        ],
        note: {
          vi: `curr.val == ${val} → xóa. prev giữ nguyên, chỉ nhảy qua node ${currIdx}.`,
          en: `curr.val == ${val} → remove. prev stays, just skip node ${currIdx}.`,
        },
      });
    } else {
      // Keep — show prev moving to curr (separate from curr advance)
      const oldPrev = prevIdx;
      prevIdx = currIdx;
      snapshot({
        title: { vi: `${values[currIdx]} ≠ ${val} → giữ. prev = curr`, en: `${values[currIdx]} ≠ ${val} → keep. prev = curr` },
        prevIdx, currIdx,
        codeLines: [6, 9, 10],
        hlNodes: [currIdx],
        vars: [
          { name: "prev (was)", value: oldPrev >= 0 ? `node ${oldPrev} (val=${values[oldPrev]})` : "dummy" },
          { name: "prev = curr", value: `node ${currIdx} (val=${values[currIdx]})` },
          { name: "action", value: "keep → prev = curr" },
        ],
        note: {
          vi: `curr.val ≠ ${val} → giữ. prev dời: ${oldPrev >= 0 ? `node ${oldPrev}` : "dummy"} → node ${currIdx}.`,
          en: `curr.val ≠ ${val} → keep. prev moves: ${oldPrev >= 0 ? `node ${oldPrev}` : "dummy"} → node ${currIdx}.`,
        },
      });
    }

    currIdx++;
  }

  // Result
  const result = values.filter((_, i) => !removed.has(i));
  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    prevIdx: prevIdx, currIdx: -1,
    codeLines: [12],
    vars: [
      { name: "result", value: `[${result.join(", ")}]` },
      { name: "removed", value: removed.size },
    ],
    note: {
      vi: `Xóa ${removed.size} node có val=${val}. List còn lại: [${result.join(" → ")}].`,
      en: `Removed ${removed.size} node(s) with val=${val}. Remaining: [${result.join(" → ")}].`,
    },
  });
  steps[steps.length - 1].final = true;

  return { original: values, answer: result, steps };
}

/**
 * LeetCode 1472: Design Browser History.
 * Approach 2: Doubly Linked List.
 * Each page is a node. current.prev powers back(), current.next powers forward().
 * visit(url) cuts current.next, creates a new node, links prev/next, then moves current.
 */
function buildSteps1472(input, params) {
  const raw = String(input || "").trim();
  const selectedApproach = params && Number(params.approach) === 1 ? 1 : 2;

  function parseCommand(segment, idx) {
    const text = String(segment || "").trim();
    if (!text) return null;

    if (idx === 0 && !/^(BrowserHistory|visit|back|forward)\b/i.test(text)) {
      return { op: "init", url: text };
    }

    const parts = text.split(/\s+/);
    const op = parts[0].replace(/[(),]/g, "");
    if (/^BrowserHistory$/i.test(op)) {
      return { op: "init", url: parts.slice(1).join(" ").replace(/^["']|["']$/g, "") };
    }
    if (/^visit$/i.test(op)) {
      return { op: "visit", url: parts.slice(1).join(" ").replace(/^["']|["']$/g, "") };
    }
    if (/^back$/i.test(op)) {
      return { op: "back", steps: Number(parts[1]) || 0 };
    }
    if (/^forward$/i.test(op)) {
      return { op: "forward", steps: Number(parts[1]) || 0 };
    }
    return null;
  }

  function parseInput(value) {
    if (!value) return [{ op: "init", url: "leetcode.com" }];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        return parsed
          .map((item) => {
            const op = item[0];
            if (op === "BrowserHistory") return { op: "init", url: String(item[1] || "") };
            if (op === "visit") return { op: "visit", url: String(item[1] || "") };
            if (op === "back") return { op: "back", steps: Number(item[1]) || 0 };
            if (op === "forward") return { op: "forward", steps: Number(item[1]) || 0 };
            return null;
          })
          .filter(Boolean);
      }
    } catch (err) {
      // Fall back to the compact pipe-separated format below.
    }

    return value
      .split(/[|\n;]/)
      .map((segment, idx) => parseCommand(segment, idx))
      .filter(Boolean);
  }

  const commands = parseInput(raw);
  if (!commands.length || commands[0].op !== "init") {
    commands.unshift({ op: "init", url: "leetcode.com" });
  }

  function shortUrl(url) {
    return String(url || "").replace(/^https?:\/\//, "");
  }

  function displayUrl(url) {
    return shortUrl(url).replace(/\.com$/i, "");
  }

  if (selectedApproach === 1) {
    return buildArrayHistorySteps1472(raw, commands, shortUrl, displayUrl);
  }

  const steps = [];
  const homepage = commands[0].url || "leetcode.com";
  const nodes = [];
  let currentId = null;
  let nextId = 1;
  const outputs = [null];

  function currentNode() {
    return nodes.find((node) => node.id === currentId);
  }

  function collectForward(startId) {
    const result = [];
    let node = nodes.find((item) => item.id === startId);
    while (node) {
      result.push(node.id);
      node = node.next == null ? null : nodes.find((item) => item.id === node.next);
    }
    return result;
  }

  function activeChain() {
    const result = [];
    if (currentId == null) return result;
    let node = nodes[0];
    while (node) {
      result.push(node);
      node = node.next == null ? null : nodes.find((item) => item.id === node.next);
    }
    return result;
  }

  function nodeLabel(id) {
    const node = nodes.find((item) => item.id === id);
    return node && node.url ? shortUrl(node.url) : "null";
  }

  function snapshot(opts) {
    const chainNodes = activeChain();
    const chainIds = chainNodes.map((node) => node.id);
    const visibleIds = new Set(chainIds);
    for (const id of opts.showIds || []) visibleIds.add(id);
    const discardedIds = (opts.showIds || []).filter((id) => !chainIds.includes(id));
    const graphNodes = nodes
      .filter((node) => visibleIds.has(node.id))
      .map((node) => ({
        id: node.id,
        label: opts.nodeLabels && opts.nodeLabels[node.id] != null
          ? opts.nodeLabels[node.id]
          : displayUrl(node.url || "new Node"),
        row: chainIds.includes(node.id) || (opts.mainIds || []).includes(node.id) ? "main" : "discarded",
        sub: opts.nodeSubs && opts.nodeSubs[node.id] != null
          ? opts.nodeSubs[node.id]
          : node.id === 0 && currentId != null ? "home" : node.id === currentId ? "current" : "",
      }));
    const edges = [];
    for (const node of nodes) {
      if (visibleIds.has(node.id) && node.next != null && visibleIds.has(node.next)) {
        edges.push({ u: node.id, v: node.next, w: "next", kind: "next" });
      }
      if (visibleIds.has(node.id) && node.prev != null && visibleIds.has(node.prev)) {
        edges.push({ u: node.id, v: node.prev, w: "prev", kind: "prev" });
      }
    }

    const annotations = {};
    if (currentId != null && opts.showCurrent !== false) annotations[currentId] = "curr";
    if (currentId != null && currentId !== 0) annotations[0] = "home";
    for (const [nodeIdx, label] of Object.entries(opts.annotations || {})) {
      annotations[nodeIdx] = annotations[nodeIdx] ? `${annotations[nodeIdx]}\n${label}` : label;
    }

    const curr = currentNode();
    const chain = activeChain().map((node) => shortUrl(node.url));
    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes: graphNodes,
        edges,
        layout: "linear",
        order: chainIds.concat(discardedIds),
        caption: opts.caption || `reachable: ${chainNodes.map((node) => shortUrl(node.url)).join(" -> ")}`,
        annotations,
        hlNodes: opts.hlNodes || [currentId],
        hlEdges: opts.hlEdges || [],
        visitedNodes: opts.visitedNodes || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        ...(opts.includeState === false ? [] : [
          { name: "chain", value: `[${chain.join(", ")}]` },
          { name: "curr", value: currentId == null ? "unassigned" : nodeLabel(currentId) },
          { name: "curr.prev", value: curr && curr.prev != null ? nodeLabel(curr.prev) : "null" },
          { name: "curr.next", value: curr && curr.next != null ? nodeLabel(curr.next) : "null" },
        ]),
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snapshot({
    title: { vi: `BrowserHistory("${shortUrl(homepage)}")`, en: `BrowserHistory("${shortUrl(homepage)}")` },
    codeLines: [8],
    includeState: false,
    caption: "history: empty",
    vars: [
      { name: "homepage", value: shortUrl(homepage) },
      { name: "self.curr", value: "unassigned" },
    ],
    note: {
      vi: `Bắt đầu BrowserHistory.__init__. Lúc này chưa tạo node và self.curr chưa trỏ vào đâu.`,
      en: `Enter BrowserHistory.__init__. No node exists yet and self.curr does not point anywhere.`,
    },
  });

  snapshot({
    title: { vi: "self.curr = DoubleListNode(homepage)", en: "self.curr = DoubleListNode(homepage)" },
    codeLines: [9],
    includeState: false,
    caption: "calling DoubleListNode(homepage)",
    vars: [
      { name: "homepage", value: shortUrl(homepage) },
      { name: "self.curr", value: "waiting for DoubleListNode(...)" },
    ],
    note: {
      vi: "Python phải chạy xong DoubleListNode(homepage) trước, sau đó mới gán kết quả vào self.curr.",
      en: "Python must finish DoubleListNode(homepage) before assigning its result to self.curr.",
    },
  });

  const homepageNode = { id: 0, url: "", prev: null, next: null, alive: true };
  nodes.push(homepageNode);

  snapshot({
    title: { vi: `DoubleListNode.__init__("${shortUrl(homepage)}", prev=None, next=None)`, en: `DoubleListNode.__init__("${shortUrl(homepage)}", prev=None, next=None)` },
    codeLines: [2],
    includeState: false,
    showIds: [0],
    mainIds: [0],
    nodeLabels: { 0: "new node" },
    nodeSubs: { 0: "being created" },
    annotations: { 0: "self" },
    hlNodes: [0],
    caption: "inside DoubleListNode.__init__",
    vars: [
      { name: "self", value: "new node" },
      { name: "val", value: shortUrl(homepage) },
      { name: "prev", value: "None" },
      { name: "next", value: "None" },
    ],
    note: {
      vi: "Tạo một DoubleListNode mới. self là object đang được khởi tạo; val, prev và next sẽ được gán lần lượt.",
      en: "Create a new DoubleListNode. self is the object being initialized; val, prev, and next will be assigned line by line.",
    },
  });

  homepageNode.url = homepage;
  snapshot({
    title: { vi: "self.val = val", en: "self.val = val" },
    codeLines: [3],
    includeState: false,
    showIds: [0],
    mainIds: [0],
    nodeSubs: { 0: "val assigned" },
    annotations: { 0: "self" },
    hlNodes: [0],
    caption: "building homepage node",
    vars: [
      { name: "val", value: shortUrl(homepage) },
      { name: "self.val", value: shortUrl(homepage) },
    ],
    note: {
      vi: `Gán địa chỉ "${shortUrl(homepage)}" vào field self.val của node đầu tiên.`,
      en: `Assign "${shortUrl(homepage)}" to the first node's self.val field.`,
    },
  });

  snapshot({
    title: { vi: "self.prev = prev", en: "self.prev = prev" },
    codeLines: [4],
    includeState: false,
    showIds: [0],
    mainIds: [0],
    nodeSubs: { 0: "prev = None" },
    annotations: { 0: "self" },
    hlNodes: [0],
    caption: "building homepage node",
    vars: [
      { name: "prev", value: "None" },
      { name: "self.prev", value: "None" },
    ],
    note: {
      vi: "Homepage không có trang đứng trước, nên self.prev = None.",
      en: "The homepage has no previous page, so self.prev = None.",
    },
  });

  snapshot({
    title: { vi: "self.next = next", en: "self.next = next" },
    codeLines: [5],
    includeState: false,
    showIds: [0],
    mainIds: [0],
    nodeSubs: { 0: "prev=None | next=None" },
    annotations: { 0: "self" },
    hlNodes: [0],
    caption: "homepage node complete",
    vars: [
      { name: "self.prev", value: "None" },
      { name: "next", value: "None" },
      { name: "self.next", value: "None" },
    ],
    note: {
      vi: "Tham số next mặc định là None, nên self.next = next = None. Node đầu tiên đã hoàn chỉnh.",
      en: "The next parameter defaults to None, so self.next = next = None. The first node is now complete.",
    },
  });

  currentId = 0;
  snapshot({
    title: { vi: "self.curr = homepage_node", en: "self.curr = homepage_node" },
    codeLines: [9],
    vars: [{ name: "output", value: "null" }],
    note: {
      vi: `DoubleListNode(homepage) đã trả về. Bây giờ self.curr mới trỏ vào node "${nodeLabel(0)}"; đây cũng là home.`,
      en: `DoubleListNode(homepage) has returned. self.curr now points to "${nodeLabel(0)}", which is also home.`,
    },
  });

  for (let commandIndex = 1; commandIndex < commands.length; commandIndex++) {
    const command = commands[commandIndex];

    if (command.op === "visit") {
      const url = command.url || "about:blank";
      const curr = currentNode();
      const discarded = curr && curr.next != null ? collectForward(curr.next) : [];

      snapshot({
        title: { vi: `visit("${shortUrl(url)}")`, en: `visit("${shortUrl(url)}")` },
        codeLines: [11],
        showIds: discarded,
        visitedNodes: discarded,
        vars: [
          { name: "url", value: shortUrl(url) },
          { name: "discard forward", value: discarded.length ? discarded.map((id) => nodeLabel(id)).join(", ") : "none" },
        ],
        note: {
          vi: "Bắt đầu visit. Nếu curr đang có forward history, lát nữa dòng curr.next = new_node sẽ ghi đè và cắt chuỗi đó.",
          en: "Start visit. If curr has forward history, the later curr.next = new_node line will overwrite and cut that chain.",
        },
      });

      const newNode = { id: nextId++, url: "", prev: null, next: null, alive: true };
      nodes.push(newNode);

      snapshot({
        title: { vi: `new_node = DoubleListNode("${shortUrl(url)}", self.curr)`, en: `new_node = DoubleListNode("${shortUrl(url)}", self.curr)` },
        codeLines: [12],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [newNode.id],
        annotations: { [newNode.id]: "new object" },
        vars: [
          { name: "prev argument", value: nodeLabel(currentId) },
          { name: "val argument", value: shortUrl(url) },
          { name: "new object.val", value: "unassigned" },
          { name: "new_node.prev", value: "null" },
          { name: "new_node.next", value: "null" },
        ],
        note: {
          vi: "Python bắt đầu tính vế phải DoubleListNode(url, self.curr). Object mới được cấp phát nhưng constructor chưa gán các field.",
          en: "Python starts evaluating DoubleListNode(url, self.curr). The new object is allocated, but its constructor has not assigned the fields yet.",
        },
      });

      snapshot({
        title: { vi: `DoubleListNode.__init__("${shortUrl(url)}", prev=${nodeLabel(currentId)}, next=None)`, en: `DoubleListNode.__init__("${shortUrl(url)}", prev=${nodeLabel(currentId)}, next=None)` },
        codeLines: [2],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [newNode.id],
        annotations: { [newNode.id]: "self" },
        vars: [
          { name: "self", value: "new object" },
          { name: "val", value: shortUrl(url) },
          { name: "prev", value: nodeLabel(currentId) },
          { name: "next", value: "None" },
        ],
        note: {
          vi: `Vào constructor: self là object mới, val="${shortUrl(url)}", prev nhận self.curr hiện tại và next mặc định None.`,
          en: `Enter the constructor: self is the new object, val="${shortUrl(url)}", prev receives the current self.curr, and next defaults to None.`,
        },
      });

      newNode.url = url;
      snapshot({
        title: { vi: "self.val = val", en: "self.val = val" },
        codeLines: [3],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [newNode.id],
        annotations: { [newNode.id]: "self" },
        vars: [
          { name: "self", value: shortUrl(url) },
          { name: "val", value: shortUrl(url) },
          { name: "self.val", value: shortUrl(url) },
        ],
        note: {
          vi: "Bên trong DoubleListNode.__init__, self chính là node mới đang được tạo.",
          en: "Inside DoubleListNode.__init__, self is the new node being created.",
        },
      });

      newNode.prev = currentId;
      snapshot({
        title: { vi: "self.prev = prev", en: "self.prev = prev" },
        codeLines: [4],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [currentId, newNode.id],
        hlEdges: [[newNode.id, currentId, "prev"]],
        annotations: { [newNode.id]: "self", [currentId]: "prev" },
        vars: [
          { name: "prev", value: nodeLabel(currentId) },
          { name: "self.prev", value: nodeLabel(newNode.prev) },
          { name: "meaning", value: `${shortUrl(url)} can back() to ${nodeLabel(currentId)}` },
        ],
        note: {
          vi: `Đây là dòng bạn hỏi: self.prev nhận prev, mà prev chính là curr hiện tại "${nodeLabel(currentId)}".`,
          en: `This is the line in question: self.prev receives prev, and prev is the current page "${nodeLabel(currentId)}".`,
        },
      });

      snapshot({
        title: { vi: "self.next = next", en: "self.next = next" },
        codeLines: [5],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [newNode.id],
        annotations: { [newNode.id]: "self" },
        vars: [
          { name: "next", value: "None" },
          { name: "self.next", value: "null" },
        ],
        note: {
          vi: "Không truyền đối số next nên next mặc định là None; node mới chưa có trang forward.",
          en: "No next argument was supplied, so it defaults to None; the new node has no forward page.",
        },
      });

      for (const id of discarded) {
        const node = nodes.find((item) => item.id === id);
        if (node) node.alive = false;
      }
      if (curr) curr.next = newNode.id;

      snapshot({
        title: { vi: "self.curr.next = new_node", en: "self.curr.next = new_node" },
        codeLines: [13],
        showIds: [...discarded, newNode.id],
        visitedNodes: discarded,
        hlNodes: [currentId, newNode.id],
        hlEdges: [[currentId, newNode.id, "next"]],
        annotations: { [newNode.id]: "new" },
        vars: [
          { name: "old forward", value: discarded.length ? discarded.map((id) => nodeLabel(id)).join(", ") : "none" },
          { name: "curr.next", value: nodeLabel(newNode.id) },
        ],
        note: {
          vi: discarded.length
            ? `Ghi đè curr.next sang node mới. Chuỗi forward cũ (${discarded.map((id) => nodeLabel(id)).join(" -> ")}) bị mất khỏi history.`
            : "Nối curr.next sang node mới. Không có forward history cũ cần cắt.",
          en: discarded.length
            ? `Overwrite curr.next to the new node. The old forward chain (${discarded.map((id) => nodeLabel(id)).join(" -> ")}) is removed from history.`
            : "Link curr.next to the new node. There is no old forward history to cut.",
        },
      });

      currentId = newNode.id;
      outputs.push(null);
      snapshot({
        title: { vi: "self.curr = new_node", en: "self.curr = new_node" },
        codeLines: [14],
        vars: [
          { name: "curr", value: nodeLabel(currentId) },
          { name: "output", value: "null" },
        ],
        note: {
          vi: `Sau visit, trang hiện tại là "${nodeLabel(currentId)}".`,
          en: `After visit, the current page is "${nodeLabel(currentId)}".`,
        },
      });
    } else if (command.op === "back") {
      const amount = command.steps;
      let remaining = amount;

      snapshot({
        title: { vi: `back(${amount})`, en: `back(${amount})` },
        codeLines: [16, 17],
        vars: [
          { name: "steps", value: amount },
          { name: "condition", value: currentNode().prev != null && remaining > 0 ? "curr.prev and steps > 0" : "stop" },
        ],
        note: {
          vi: `Đi lùi từng node bằng curr.prev, tối đa ${amount} bước.`,
          en: `Move backward one node at a time through curr.prev, up to ${amount} step(s).`,
        },
      });

      while (currentNode().prev != null && remaining > 0) {
        const from = currentId;
        currentId = currentNode().prev;
        remaining--;
        snapshot({
          title: { vi: `self.curr = self.curr.prev → "${nodeLabel(currentId)}"`, en: `self.curr = self.curr.prev → "${nodeLabel(currentId)}"` },
          codeLines: [18, 19],
          hlNodes: [from, currentId],
          hlEdges: [[from, currentId, "prev"]],
          vars: [
            { name: "steps left", value: remaining },
            { name: "moved", value: `${nodeLabel(from)} -> ${nodeLabel(currentId)}` },
          ],
          note: {
            vi: `Lùi 1 bước từ "${nodeLabel(from)}" về "${nodeLabel(currentId)}".`,
            en: `Move back 1 step from "${nodeLabel(from)}" to "${nodeLabel(currentId)}".`,
          },
        });
      }

      outputs.push(currentNode().url);
      snapshot({
        title: { vi: `return "${nodeLabel(currentId)}"`, en: `return "${nodeLabel(currentId)}"` },
        codeLines: [20],
        vars: [{ name: "output", value: nodeLabel(currentId) }],
        note: {
          vi: `Dừng vì hết bước hoặc curr.prev = null. Trả về "${nodeLabel(currentId)}".`,
          en: `Stop because steps are exhausted or curr.prev is null. Return "${nodeLabel(currentId)}".`,
        },
      });
    } else if (command.op === "forward") {
      const amount = command.steps;
      let remaining = amount;

      snapshot({
        title: { vi: `forward(${amount})`, en: `forward(${amount})` },
        codeLines: [22, 23],
        vars: [
          { name: "steps", value: amount },
          { name: "condition", value: currentNode().next != null && remaining > 0 ? "curr.next and steps > 0" : "stop" },
        ],
        note: {
          vi: `Đi tới từng node bằng curr.next, tối đa ${amount} bước.`,
          en: `Move forward one node at a time through curr.next, up to ${amount} step(s).`,
        },
      });

      while (currentNode().next != null && remaining > 0) {
        const from = currentId;
        currentId = currentNode().next;
        remaining--;
        snapshot({
          title: { vi: `self.curr = self.curr.next → "${nodeLabel(currentId)}"`, en: `self.curr = self.curr.next → "${nodeLabel(currentId)}"` },
          codeLines: [24, 25],
          hlNodes: [from, currentId],
          hlEdges: [[from, currentId, "next"]],
          vars: [
            { name: "steps left", value: remaining },
            { name: "moved", value: `${nodeLabel(from)} -> ${nodeLabel(currentId)}` },
          ],
          note: {
            vi: `Tiến 1 bước từ "${nodeLabel(from)}" tới "${nodeLabel(currentId)}".`,
            en: `Move forward 1 step from "${nodeLabel(from)}" to "${nodeLabel(currentId)}".`,
          },
        });
      }

      outputs.push(currentNode().url);
      snapshot({
        title: { vi: `return "${nodeLabel(currentId)}"`, en: `return "${nodeLabel(currentId)}"` },
        codeLines: [26],
        vars: [{ name: "output", value: nodeLabel(currentId) }],
        note: {
          vi: `Dừng vì hết bước hoặc curr.next = null. Trả về "${nodeLabel(currentId)}".`,
          en: `Stop because steps are exhausted or curr.next is null. Return "${nodeLabel(currentId)}".`,
        },
      });
    }
  }

  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [26],
    vars: [
      { name: "outputs", value: `[${outputs.map((item) => item == null ? "null" : `"${shortUrl(item)}"`).join(", ")}]` },
      { name: "current", value: nodeLabel(currentId) },
    ],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác. Current cuối cùng là "${nodeLabel(currentId)}".`,
      en: `Finished ${commands.length} operation(s). Final current page is "${nodeLabel(currentId)}".`,
    },
    final: true,
  });

  return {
    original: raw,
    answer: outputs,
    steps,
  };
}

function buildArrayHistorySteps1472(raw, commands, shortUrl, displayUrl) {
  const steps = [];
  let history = [commands[0].url || "leetcode.com"];
  let index = 0;
  const outputs = [null];

  function snapshot(opts) {
    const current = opts.index == null ? index : opts.index;
    const nodes = history.map((url, i) => ({
      id: i,
      label: displayUrl(url),
      sub: i === 0 ? "home" : i === index ? "current" : `i=${i}`,
    }));
    const edges = [];
    for (let i = 0; i < history.length - 1; i++) edges.push({ u: i, v: i + 1, w: "" });

    const annotations = {};
    if (current >= 0 && current < history.length) annotations[current] = "index";
    if (history.length > 0 && current !== 0) annotations[0] = "home";
    for (const [nodeIdx, label] of Object.entries(opts.annotations || {})) {
      annotations[nodeIdx] = annotations[nodeIdx] ? `${annotations[nodeIdx]}\n${label}` : label;
    }

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges,
        layout: "linear",
        order: history.map((_, i) => i),
        caption: opts.caption || `history: ${history.map((url, i) => i === index ? `[${shortUrl(url)}]` : shortUrl(url)).join(" -> ")}`,
        annotations,
        hlNodes: opts.hlNodes || [index],
        hlEdges: opts.hlEdges || [],
        visitedNodes: opts.visitedNodes || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "history", value: `[${history.map((url) => shortUrl(url)).join(", ")}]` },
        { name: "index", value: index },
        { name: "current", value: shortUrl(history[index]) },
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  snapshot({
    title: { vi: `BrowserHistoryArray("${shortUrl(history[0])}")`, en: `BrowserHistoryArray("${shortUrl(history[0])}")` },
    codeLines: [31, 32, 33],
    vars: [{ name: "output", value: "null" }],
    note: {
      vi: `Cách 1 tạo mảng history = ["${shortUrl(history[0])}"] và index = 0.`,
      en: `Approach 1 creates history = ["${shortUrl(history[0])}"] and index = 0.`,
    },
  });

  for (let commandIndex = 1; commandIndex < commands.length; commandIndex++) {
    const command = commands[commandIndex];

    if (command.op === "visit") {
      const url = command.url || "about:blank";
      const discarded = [];
      for (let i = index + 1; i < history.length; i++) discarded.push(i);

      snapshot({
        title: { vi: `visit("${shortUrl(url)}")`, en: `visit("${shortUrl(url)}")` },
        codeLines: [35, 36],
        visitedNodes: discarded,
        vars: [
          { name: "url", value: shortUrl(url) },
          { name: "discard forward", value: discarded.length ? discarded.map((i) => shortUrl(history[i])).join(", ") : "none" },
        ],
        note: {
          vi: "Vì visit trang mới, cắt mọi phần tử sau index trước khi append.",
          en: "Because we visit a new page, slice away every item after index before appending.",
        },
      });

      history = history.slice(0, index + 1);
      snapshot({
        title: { vi: "history = history[:index + 1]", en: "history = history[:index + 1]" },
        codeLines: [36],
        vars: [{ name: "after slice", value: `[${history.map((item) => shortUrl(item)).join(", ")}]` }],
        note: {
          vi: "Mảng chỉ còn homepage đến trang current.",
          en: "The array now keeps only homepage through the current page.",
        },
      });

      history.push(url);
      snapshot({
        title: { vi: `history.append("${shortUrl(url)}")`, en: `history.append("${shortUrl(url)}")` },
        codeLines: [37],
        hlNodes: [history.length - 1],
        annotations: { [history.length - 1]: "new" },
        vars: [{ name: "append", value: shortUrl(url) }],
        note: {
          vi: `Append "${shortUrl(url)}" vào cuối mảng history.`,
          en: `Append "${shortUrl(url)}" to the end of the history array.`,
        },
      });

      index += 1;
      outputs.push(null);
      snapshot({
        title: { vi: "index += 1", en: "index += 1" },
        codeLines: [38],
        vars: [{ name: "output", value: "null" }],
        note: {
          vi: `Sau visit, index trỏ tới trang mới "${shortUrl(history[index])}".`,
          en: `After visit, index points to the new page "${shortUrl(history[index])}".`,
        },
      });
    } else if (command.op === "back") {
      const amount = command.steps;
      const oldIndex = index;
      const nextIndex = Math.max(0, index - amount);

      snapshot({
        title: { vi: `back(${amount})`, en: `back(${amount})` },
        codeLines: [40, 41],
        hlNodes: [oldIndex, nextIndex].filter((v, i, arr) => arr.indexOf(v) === i),
        vars: [
          { name: "steps", value: amount },
          { name: "max(0, index - steps)", value: nextIndex },
        ],
        note: {
          vi: "Không đi từng node; cách array tính thẳng index mới và chặn ở 0.",
          en: "No node-by-node movement; the array approach computes the new index directly and clamps at 0.",
        },
      });

      index = nextIndex;
      outputs.push(history[index]);
      snapshot({
        title: { vi: `return "${shortUrl(history[index])}"`, en: `return "${shortUrl(history[index])}"` },
        codeLines: [42],
        vars: [{ name: "output", value: shortUrl(history[index]) }],
        note: {
          vi: `Current bây giờ là history[${index}] = "${shortUrl(history[index])}".`,
          en: `Current is now history[${index}] = "${shortUrl(history[index])}".`,
        },
      });
    } else if (command.op === "forward") {
      const amount = command.steps;
      const oldIndex = index;
      const nextIndex = Math.min(history.length - 1, index + amount);

      snapshot({
        title: { vi: `forward(${amount})`, en: `forward(${amount})` },
        codeLines: [44, 45],
        hlNodes: [oldIndex, nextIndex].filter((v, i, arr) => arr.indexOf(v) === i),
        vars: [
          { name: "steps", value: amount },
          { name: "min(last, index + steps)", value: nextIndex },
        ],
        note: {
          vi: "Tính thẳng index mới và chặn ở phần tử cuối mảng.",
          en: "Compute the new index directly and clamp at the last array item.",
        },
      });

      index = nextIndex;
      outputs.push(history[index]);
      snapshot({
        title: { vi: `return "${shortUrl(history[index])}"`, en: `return "${shortUrl(history[index])}"` },
        codeLines: [46],
        vars: [{ name: "output", value: shortUrl(history[index]) }],
        note: {
          vi: `Current bây giờ là history[${index}] = "${shortUrl(history[index])}".`,
          en: `Current is now history[${index}] = "${shortUrl(history[index])}".`,
        },
      });
    }
  }

  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [46],
    vars: [
      { name: "outputs", value: `[${outputs.map((item) => item == null ? "null" : `"${shortUrl(item)}"`).join(", ")}]` },
      { name: "current", value: shortUrl(history[index]) },
    ],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác bằng cách array + index.`,
      en: `Finished ${commands.length} operation(s) with the array + index approach.`,
    },
    final: true,
  });

  return {
    original: raw,
    answer: outputs,
    steps,
  };
}

/**
 * LeetCode 146: LRU Cache.
 * Hash map gives O(1) key lookup; a doubly linked list stores recency order.
 * Left side is least recently used, right side is most recently used.
 */
function buildSteps146(input, params) {
  const capacity = Math.max(1, Number.isFinite(Number(params && params.capacity)) ? Number(params.capacity) : 2);
  const raw = String(input || "").trim();
  const steps = [];
  const nodes = new Map(); // key -> { key, value }
  const order = []; // keys from LRU to MRU
  const outputs = [];

  function parseCommands(text) {
    return text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const tokens = part.replace(/[(),]/g, " ").split(/\s+/).filter(Boolean);
        const op = (tokens[0] || "").toLowerCase();
        if (op === "put" && tokens.length >= 3) {
          return { op, key: Number(tokens[1]), value: Number(tokens[2]), raw: part };
        }
        if (op === "get" && tokens.length >= 2) {
          return { op, key: Number(tokens[1]), raw: part };
        }
        return { op: "invalid", raw: part };
      });
  }

  function cacheLabel() {
    return order.length
      ? order.map((key) => `${key}:${nodes.get(key).value}`).join(" -> ")
      : "empty";
  }

  function mapLabel() {
    return nodes.size
      ? Array.from(nodes.values()).map((node) => `${node.key}->node(${node.value})`).join(", ")
      : "{}";
  }

  function keyLabel(key) {
    return `key-${key}`;
  }

  function snapshot(opts) {
    const graphNodes = order.map((key, index) => ({
      id: keyLabel(key),
      label: `${key}:${nodes.get(key).value}`,
      row: "main",
      sub: order.length === 1
        ? "LRU | MRU"
        : index === 0
          ? "LRU"
          : index === order.length - 1
            ? "MRU"
            : "",
    }));
    const graphEdges = [];
    for (let i = 0; i < order.length - 1; i++) {
      graphEdges.push({ u: keyLabel(order[i]), v: keyLabel(order[i + 1]), w: "next", kind: "next" });
      graphEdges.push({ u: keyLabel(order[i + 1]), v: keyLabel(order[i]), w: "prev", kind: "prev" });
    }

    let transientId = null;
    if (opts.transient) {
      transientId = `transient-${opts.transient.key}-${steps.length}`;
      graphNodes.push({
        id: transientId,
        label: `${opts.transient.key}:${opts.transient.value}`,
        row: "discarded",
        sub: opts.transient.status,
      });
    }

    const annotations = {};
    if (opts.activeKey != null && nodes.has(opts.activeKey)) {
      const activeId = keyLabel(opts.activeKey);
      const eventLabel = {
        "lookup-hit": "found",
        "lookup-update": "update",
        hit: "hit -> MRU",
        update: "updated MRU",
        insert: "new MRU",
        evict: "new MRU",
        "select-lru": "LRU candidate",
      }[opts.event];
      if (eventLabel) annotations[activeId] = eventLabel;
    }
    if (transientId) annotations[transientId] = opts.transient.status;

    const highlightedNodes = [];
    if (opts.activeKey != null && nodes.has(opts.activeKey) && order.includes(opts.activeKey)) {
      highlightedNodes.push(keyLabel(opts.activeKey));
    }
    if (transientId && opts.highlightTransient) highlightedNodes.push(transientId);

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
        layout: "linear",
        order: order.map(keyLabel).concat(transientId ? [transientId] : []),
        caption: `${opts.operation || "LRUCache"} | capacity=${capacity} | LRU -> MRU: ${cacheLabel()}`,
        annotations,
        hlNodes: highlightedNodes,
        hlEdges: [],
        visitedNodes: transientId && !opts.highlightTransient ? [transientId] : [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: [
        { name: "cache", value: cacheLabel() },
        { name: "map", value: mapLabel() },
        { name: "size/capacity", value: `${nodes.size}/${capacity}` },
        ...(nodes.size !== order.length ? [{ name: "linked nodes", value: order.length }] : []),
        ...(opts.vars || []),
      ],
      note: opts.note,
      final: Boolean(opts.final),
    });
  }

  const commands = parseCommands(raw);
  if (!commands.length || commands.some((command) => command.op === "invalid" || !Number.isFinite(command.key) || (command.op === "put" && !Number.isFinite(command.value)))) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      final: true,
      codeLines: [1],
      vars: [{ name: "expected", value: "put key value | get key | ..." }],
      note: {
        vi: "Nhập thao tác dạng: put 1 1 | put 2 2 | get 1 | put 3 3.",
        en: "Enter operations like: put 1 1 | put 2 2 | get 1 | put 3 3.",
      },
    });
    return { original: raw, answer: [], steps };
  }

  snapshot({
    title: { vi: `Khởi tạo LRUCache(${capacity})`, en: `Initialize LRUCache(${capacity})` },
    event: "ready",
    operation: `LRUCache(${capacity})`,
    codeLines: [10, 11, 12, 13, 14, 15],
    vars: [{ name: "outputs", value: "[]" }],
    note: {
      vi: "Dùng hash map key->node để tìm O(1), và doubly linked list để biết node nào là LRU/MRU.",
      en: "Use a hash map key->node for O(1) lookup, plus a doubly linked list for LRU/MRU order.",
    },
  });

  for (const command of commands) {
    if (command.op === "get") {
      snapshot({
        title: { vi: `get(${command.key})`, en: `get(${command.key})` },
        activeKey: command.key,
        event: nodes.has(command.key) ? "lookup-hit" : "lookup-miss",
        operation: `get(${command.key})`,
        codeLines: [29],
        vars: [{ name: "operation", value: command.raw }],
        note: {
          vi: `Kiểm tra map có key ${command.key} hay không.`,
          en: `Check whether key ${command.key} exists in the map.`,
        },
      });

      if (!nodes.has(command.key)) {
        outputs.push(-1);
        snapshot({
          title: { vi: `key ${command.key} không tồn tại -> -1`, en: `key ${command.key} missing -> -1` },
          event: "miss",
          operation: `get(${command.key})`,
          result: -1,
          codeLines: [30],
          vars: [{ name: "output", value: -1 }],
          note: {
            vi: "Cache miss: không thấy key, trả về -1 và không đổi thứ tự sử dụng.",
            en: "Cache miss: return -1 and leave recency order unchanged.",
          },
        });
        continue;
      }

      const value = nodes.get(command.key).value;
      snapshot({
        title: { vi: `node = cache[${command.key}]`, en: `node = cache[${command.key}]` },
        activeKey: command.key,
        event: "lookup-hit",
        operation: `get(${command.key})`,
        codeLines: [31],
        vars: [
          { name: "node", value: `${command.key}:${value}` },
          { name: "node.prev", value: order.indexOf(command.key) > 0 ? `${order[order.indexOf(command.key) - 1]}` : "left sentinel" },
          { name: "node.next", value: order.indexOf(command.key) < order.length - 1 ? `${order[order.indexOf(command.key) + 1]}` : "right sentinel" },
        ],
        note: {
          vi: `Lấy trực tiếp node ${command.key}:${value} từ hash map. Thứ tự list chưa đổi.`,
          en: `Read node ${command.key}:${value} directly from the hash map. The list order is unchanged.`,
        },
      });

      const nodeIndex = order.indexOf(command.key);
      order.splice(nodeIndex, 1);
      snapshot({
        title: { vi: `remove(node ${command.key})`, en: `remove(node ${command.key})` },
        event: "detach",
        operation: `get(${command.key})`,
        transient: { key: command.key, value, status: "detached" },
        highlightTransient: true,
        codeLines: [32],
        vars: [{ name: "action", value: "unlink node.prev <-> node.next" }],
        note: {
          vi: `Tháo node ${command.key}:${value} khỏi vị trí cũ bằng cách nối node.prev trực tiếp với node.next.`,
          en: `Detach node ${command.key}:${value} from its old position by linking node.prev directly to node.next.`,
        },
      });

      order.push(command.key);
      snapshot({
        title: { vi: `hit ${command.key}:${value} -> đưa lên MRU`, en: `hit ${command.key}:${value} -> move to MRU` },
        activeKey: command.key,
        event: "hit",
        operation: `get(${command.key})`,
        result: value,
        codeLines: [33],
        vars: [
          { name: "action", value: "insert before right sentinel" },
        ],
        note: {
          vi: `Đọc key ${command.key}, nên node này vừa được dùng gần nhất và chuyển sang phía MRU.`,
          en: `Reading key ${command.key} makes it most recently used, so move it to the MRU side.`,
        },
      });

      outputs.push(value);
      snapshot({
        title: { vi: `return ${value}`, en: `return ${value}` },
        activeKey: command.key,
        event: "hit",
        operation: `get(${command.key})`,
        result: value,
        codeLines: [34],
        vars: [
          { name: "output", value },
          { name: "outputs", value: `[${outputs.map((item) => item === null ? "null" : item).join(", ")}]` },
        ],
        note: {
          vi: `Trả về value=${value}. Node ${command.key} vẫn ở vị trí MRU.`,
          en: `Return value=${value}. Node ${command.key} remains at the MRU position.`,
        },
      });
    } else if (command.op === "put") {
      snapshot({
        title: { vi: `put(${command.key}, ${command.value})`, en: `put(${command.key}, ${command.value})` },
        activeKey: command.key,
        event: nodes.has(command.key) ? "lookup-update" : "lookup-new",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [37],
        vars: [{ name: "operation", value: command.raw }],
        note: {
          vi: `Nếu key ${command.key} đã có thì cập nhật value; nếu chưa có thì tạo node mới.`,
          en: `If key ${command.key} exists, update it; otherwise create a new node.`,
        },
      });

      if (nodes.has(command.key)) {
        const oldValue = nodes.get(command.key).value;
        const oldIndex = order.indexOf(command.key);
        order.splice(oldIndex, 1);
        snapshot({
          title: { vi: `remove(cache[${command.key}])`, en: `remove(cache[${command.key}])` },
          event: "detach",
          operation: `put(${command.key}, ${command.value})`,
          transient: { key: command.key, value: oldValue, status: "old node detached" },
          highlightTransient: true,
          codeLines: [38],
          vars: [{ name: "old node", value: `${command.key}:${oldValue}` }],
          note: {
            vi: `Key ${command.key} đã tồn tại, nên tháo node cũ khỏi doubly linked list trước.`,
            en: `Key ${command.key} already exists, so detach its old node from the doubly linked list first.`,
          },
        });

        nodes.set(command.key, { key: command.key, value: command.value });
        snapshot({
          title: { vi: `cache[${command.key}] = Node(${command.key}, ${command.value})`, en: `cache[${command.key}] = Node(${command.key}, ${command.value})` },
          event: "new-node",
          operation: `put(${command.key}, ${command.value})`,
          transient: { key: command.key, value: command.value, status: "new node" },
          highlightTransient: true,
          codeLines: [39],
          vars: [{ name: `cache[${command.key}]`, value: `new Node(${command.key}, ${command.value})` }],
          note: {
            vi: `Tạo node mới với value=${command.value} và cập nhật hash map. Node này chưa được nối vào list.`,
            en: `Create a new node with value=${command.value} and update the hash map. It is not linked into the list yet.`,
          },
        });

        order.push(command.key);
        snapshot({
          title: { vi: `update key ${command.key} -> MRU`, en: `update key ${command.key} -> MRU` },
          activeKey: command.key,
          event: "update",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [40],
          vars: [{ name: "new value", value: command.value }],
          note: {
            vi: "Put trên key đã tồn tại cũng tính là vừa sử dụng, nên đưa node sang MRU.",
            en: "Putting an existing key counts as recent use, so move that node to MRU.",
          },
        });

        snapshot({
          title: { vi: "Kiểm tra capacity", en: "Check capacity" },
          activeKey: command.key,
          event: "update",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [41],
          vars: [
            { name: "len(cache)", value: nodes.size },
            { name: "condition", value: `${nodes.size} > ${capacity} = false` },
          ],
          note: {
            vi: "Update key cũ không làm tăng số node, nên cache không vượt capacity.",
            en: "Updating an existing key does not increase the node count, so capacity is not exceeded.",
          },
        });
        outputs.push(null);
        continue;
      }

      nodes.set(command.key, { key: command.key, value: command.value });
      snapshot({
        title: { vi: `cache[${command.key}] = Node(${command.key}, ${command.value})`, en: `cache[${command.key}] = Node(${command.key}, ${command.value})` },
        event: "new-node",
        operation: `put(${command.key}, ${command.value})`,
        transient: { key: command.key, value: command.value, status: "new node" },
        highlightTransient: true,
        codeLines: [39],
        vars: [{ name: `cache[${command.key}]`, value: `Node(${command.key}, ${command.value})` }],
        note: {
          vi: `Tạo node ${command.key}:${command.value} trong hash map. Node chưa có prev/next trong cache list.`,
          en: `Create node ${command.key}:${command.value} in the hash map. It is not linked into the cache list yet.`,
        },
      });

      order.push(command.key);
      snapshot({
        title: { vi: `thêm node ${command.key}:${command.value} vào MRU`, en: `add node ${command.key}:${command.value} as MRU` },
        activeKey: command.key,
        event: "insert",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [40],
        vars: [{ name: "insert", value: `${command.key}:${command.value}` }],
        note: {
          vi: "Node mới được nối vào phía MRU của doubly linked list và map trỏ tới node đó.",
          en: "The new node is linked on the MRU side of the doubly linked list and mapped by key.",
        },
      });

      snapshot({
        title: { vi: "Kiểm tra capacity", en: "Check capacity" },
        activeKey: command.key,
        event: "insert",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [41],
        vars: [
          { name: "len(cache)", value: nodes.size },
          { name: "condition", value: `${nodes.size} > ${capacity} = ${nodes.size > capacity}` },
        ],
        note: {
          vi: nodes.size > capacity
            ? `Cache có ${nodes.size} node, vượt capacity=${capacity}; cần loại LRU.`
            : `Cache có ${nodes.size} node, chưa vượt capacity=${capacity}.`,
          en: nodes.size > capacity
            ? `The cache has ${nodes.size} nodes, exceeding capacity=${capacity}; evict the LRU node.`
            : `The cache has ${nodes.size} nodes, within capacity=${capacity}.`,
        },
      });

      if (order.length > capacity) {
        const evictedKey = order[0];
        const evictedValue = nodes.get(evictedKey).value;

        snapshot({
          title: { vi: `lru = left.next -> ${evictedKey}:${evictedValue}`, en: `lru = left.next -> ${evictedKey}:${evictedValue}` },
          activeKey: evictedKey,
          event: "select-lru",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [42],
          vars: [
            { name: "lru", value: `${evictedKey}:${evictedValue}` },
            { name: "left.next", value: `${evictedKey}:${evictedValue}` },
          ],
          note: {
            vi: `Node ngay sau left sentinel là ${evictedKey}:${evictedValue}, nên đây là least recently used.`,
            en: `The node after the left sentinel is ${evictedKey}:${evictedValue}, so it is the least recently used.`,
          },
        });

        order.shift();
        snapshot({
          title: { vi: `remove(lru ${evictedKey}:${evictedValue})`, en: `remove(lru ${evictedKey}:${evictedValue})` },
          event: "detach",
          operation: `put(${command.key}, ${command.value})`,
          transient: { key: evictedKey, value: evictedValue, status: "LRU unlinked" },
          highlightTransient: true,
          codeLines: [43],
          vars: [
            { name: "lru", value: `${evictedKey}:${evictedValue}` },
            { name: "map still contains key", value: nodes.has(evictedKey) },
          ],
          note: {
            vi: `Tháo LRU ${evictedKey}:${evictedValue} khỏi doubly linked list. Hash map vẫn còn key này cho đến dòng kế tiếp.`,
            en: `Unlink LRU ${evictedKey}:${evictedValue} from the doubly linked list. The hash map still contains its key until the next line.`,
          },
        });

        nodes.delete(evictedKey);
        snapshot({
          title: { vi: `vượt capacity -> loại LRU ${evictedKey}:${evictedValue}`, en: `over capacity -> evict LRU ${evictedKey}:${evictedValue}` },
          activeKey: command.key,
          event: "evict",
          operation: `put(${command.key}, ${command.value})`,
          transient: { key: evictedKey, value: evictedValue, status: "evicted" },
          codeLines: [44],
          vars: [
            { name: "evicted", value: `${evictedKey}:${evictedValue}` },
            { name: "reason", value: `${capacity + 1} > ${capacity}` },
          ],
          note: {
            vi: `Cache vượt capacity, nên xóa node bên trái nhất (least recently used): key ${evictedKey}.`,
            en: `Cache exceeds capacity, so remove the leftmost least-recently-used node: key ${evictedKey}.`,
          },
        });
      }
      outputs.push(null);
    }
  }

  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    event: "complete",
    operation: "done",
    codeLines: [],
    vars: [{ name: "outputs", value: `[${outputs.map((v) => v === null ? "null" : v).join(", ")}]` }],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác. Thứ tự cuối: ${cacheLabel()}.`,
      en: `Finished ${commands.length} operation(s). Final order: ${cacheLabel()}.`,
    },
    final: true,
  });

  return { original: raw, answer: outputs, steps };
}

/**
 * LeetCode 430: Flatten a Multilevel Doubly Linked List.
 * Recursive DFS: dfs(node) walks node's own next-chain; whenever a node has
 * a child, splice the child's flattened chain in between node and node.next,
 * then continue. Returns the LAST node of the flattened chain starting at node.
 *
 * Input:
 *  - main input: comma-separated values of the top-level list, e.g. "1,2,3,4,5,6"
 *  - params.children: "afterVal:c1,c2,...;afterVal2:c1,c2,..." — each entry
 *    attaches a new child chain under the node whose value is afterVal.
 *    Order matters: a later entry can attach under a node created by an
 *    earlier entry (e.g. "3:7,8,9,10;8:11,12" attaches 11-12 under node 8,
 *    which itself was just created as part of node 3's child chain).
 * Assumes all node values in the whole structure are unique (as in the
 * standard LeetCode examples), so nodes can be looked up by value.
 */
function parseMultilevelList(mainInput, childSpec) {
  let idCounter = 0;
  const nodes = new Map(); // id -> { id, val }
  const nextMap = new Map();
  const prevMap = new Map();
  const childMap = new Map();
  const valueToId = new Map();

  function makeChain(values) {
    let firstId = null;
    let lastId = null;
    for (const v of values) {
      const id = `n${idCounter++}`;
      nodes.set(id, { id, val: v });
      valueToId.set(v, id);
      if (lastId !== null) {
        nextMap.set(lastId, id);
        prevMap.set(id, lastId);
      }
      if (firstId === null) firstId = id;
      lastId = id;
    }
    return firstId;
  }

  const mainVals = String(mainInput || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((v) => !Number.isNaN(v));
  const headId = mainVals.length ? makeChain(mainVals) : null;

  const specParts = String(childSpec || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of specParts) {
    const [afterStr, childStr] = part.split(":");
    if (afterStr === undefined || childStr === undefined) continue;
    const afterVal = Number(afterStr.trim());
    const childVals = childStr
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((v) => !Number.isNaN(v));
    const parentId = valueToId.get(afterVal);
    if (parentId === undefined || childVals.length === 0) continue;
    const childHeadId = makeChain(childVals);
    childMap.set(parentId, childHeadId);
  }

  return { nodes, nextMap, prevMap, childMap, headId };
}

function buildSteps430(input, params) {
  const childSpec = params && params.children !== undefined ? params.children : "3:7,8,9,10;8:11,12";
  const { nodes, nextMap, prevMap, childMap, headId } = parseMultilevelList(input, childSpec);
  const steps = [];

  const nodeLabel = (id) => (id === null || id === undefined ? "None" : String(nodes.get(id).val));

  function currentEdges() {
    const edges = [];
    for (const [u, v] of nextMap) if (v) edges.push({ u, v, w: "next", kind: "next" });
    for (const [u, v] of prevMap) if (v) edges.push({ u, v, w: "prev", kind: "prev" });
    for (const [u, v] of childMap) if (v) edges.push({ u, v, w: "child" });
    return edges;
  }

  function push({ title, hlNodes = [], annotations = {}, codeLines, vars, note, final = false }) {
    steps.push({
      title,
      arr: [],
      graph: {
        nodes: [...nodes.values()].map((n) => ({ id: n.id, label: String(n.val) })),
        edges: currentEdges(),
        hlNodes,
        hlEdges: [],
        visitedNodes: [],
        annotations,
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: vars || [],
      note,
    });
  }

  push({
    title: { vi: "def flatten(self, head)", en: "def flatten(self, head)" },
    codeLines: [9],
    vars: [],
    note: {
      vi: "Mỗi node có next, prev, và child (trỏ tới một danh sách con riêng). Cần 'làm phẳng' toàn bộ thành 1 danh sách 2 chiều duy nhất.",
      en: "Each node has next, prev, and child (pointing to its own separate list). We need to flatten everything into a single doubly linked list.",
    },
  });

  push({
    title: { vi: "Định nghĩa dfs(node)", en: "Define dfs(node)" },
    codeLines: [10],
    vars: [],
    note: {
      vi: "dfs(node) flatten toàn bộ chain bắt đầu từ node, trả về node CUỐI của chain đã flatten.",
      en: "dfs(node) flattens the whole chain starting at node, returning the LAST node of the flattened chain.",
    },
  });

  // Line 29: if not head
  const isEmpty = headId === null;
  push({
    title: { vi: `head is None? ${isEmpty}`, en: `head is None? ${isEmpty}` },
    hlNodes: isEmpty ? [] : [headId],
    codeLines: [29],
    vars: [{ name: "head", value: isEmpty ? "None" : nodeLabel(headId) }],
    note: {
      vi: isEmpty ? "Danh sách rỗng." : "head tồn tại, tiếp tục flatten.",
      en: isEmpty ? "The list is empty." : "head exists, proceed to flatten.",
    },
  });
  if (isEmpty) {
    push({
      title: { vi: "return head (None)", en: "return head (None)" },
      codeLines: [30],
      final: true,
      vars: [{ name: "answer", value: "None" }],
      note: { vi: "Không có node nào để flatten.", en: "There are no nodes to flatten." },
    });
    return { input, answer: "None", steps };
  }

  push({
    title: { vi: "dfs(head)", en: "dfs(head)" },
    hlNodes: [headId],
    codeLines: [31],
    vars: [{ name: "calling", value: nodeLabel(headId) }],
    note: { vi: "Gọi DFS để flatten toàn bộ cấu trúc, bắt đầu từ head.", en: "Call DFS to flatten the entire structure, starting at head." },
  });

  function dfs(nodeId) {
    let cur = nodeId;
    push({
      title: { vi: `dfs(${nodeLabel(nodeId)}): cur = node`, en: `dfs(${nodeLabel(nodeId)}): cur = node` },
      hlNodes: [cur],
      annotations: { [cur]: "cur" },
      codeLines: [11],
      vars: [{ name: "cur", value: nodeLabel(cur) }],
      note: { vi: `cur bắt đầu tại ${nodeLabel(cur)}.`, en: `cur starts at ${nodeLabel(cur)}.` },
    });

    let last = nodeId;
    push({
      title: { vi: "last = node", en: "last = node" },
      hlNodes: [cur],
      annotations: { [cur]: "cur,last" },
      codeLines: [12],
      vars: [{ name: "last", value: nodeLabel(last) }],
      note: { vi: "last tạm là node hiện tại, sẽ cập nhật khi duyệt tiếp.", en: "last is temporarily the current node, updated as we continue." },
    });

    while (cur) {
      const baseAnn = () => {
        const ann = { [cur]: "cur" };
        if (last !== cur) ann[last] = "last";
        else ann[cur] = "cur,last";
        return ann;
      };

      push({
        title: { vi: `while cur: True (cur=${nodeLabel(cur)})`, en: `while cur: True (cur=${nodeLabel(cur)})` },
        hlNodes: [cur],
        annotations: baseAnn(),
        codeLines: [13],
        vars: [{ name: "cur", value: nodeLabel(cur) }],
        note: { vi: "cur khác None, tiếp tục vòng lặp.", en: "cur is not None, continue looping." },
      });

      const child = childMap.get(cur) || null;
      push({
        title: { vi: `child = cur.child = ${nodeLabel(child)}`, en: `child = cur.child = ${nodeLabel(child)}` },
        hlNodes: child ? [cur, child] : [cur],
        annotations: { ...baseAnn(), ...(child ? { [child]: "child" } : {}) },
        codeLines: [14],
        vars: [{ name: "child", value: nodeLabel(child) }],
        note: { vi: `cur.child = ${nodeLabel(child)}.`, en: `cur.child = ${nodeLabel(child)}.` },
      });

      const nxt = nextMap.get(cur) || null;
      push({
        title: { vi: `nxt = cur.next = ${nodeLabel(nxt)}`, en: `nxt = cur.next = ${nodeLabel(nxt)}` },
        hlNodes: nxt ? [cur, nxt] : [cur],
        annotations: { ...baseAnn(), ...(child ? { [child]: "child" } : {}), ...(nxt ? { [nxt]: "nxt" } : {}) },
        codeLines: [15],
        vars: [{ name: "nxt", value: nodeLabel(nxt) }],
        note: { vi: `Lưu cur.next = ${nodeLabel(nxt)} trước khi cur.next có thể bị đổi.`, en: `Save cur.next = ${nodeLabel(nxt)} before cur.next might be overwritten.` },
      });

      const hasChild = Boolean(child);
      push({
        title: { vi: `if child: ${hasChild}`, en: `if child: ${hasChild}` },
        hlNodes: [cur],
        annotations: { ...baseAnn(), ...(child ? { [child]: "child" } : {}), ...(nxt ? { [nxt]: "nxt" } : {}) },
        codeLines: [16],
        vars: [{ name: "child", value: nodeLabel(child) }],
        note: {
          vi: hasChild ? "cur có child → cần chèn chain con vào giữa cur và nxt." : "cur không có child → chỉ cần cập nhật last.",
          en: hasChild ? "cur has a child → splice the child chain between cur and nxt." : "cur has no child → just update last.",
        },
      });

      if (hasChild) {
        nextMap.set(cur, child);
        push({
          title: { vi: `cur.next = child → ${nodeLabel(cur)}.next = ${nodeLabel(child)}`, en: `cur.next = child → ${nodeLabel(cur)}.next = ${nodeLabel(child)}` },
          hlNodes: [cur, child],
          annotations: { [cur]: "cur", [child]: "child" },
          codeLines: [17],
          vars: [{ name: `${nodeLabel(cur)}.next`, value: nodeLabel(child) }],
          note: { vi: `Nối ${nodeLabel(cur)} → ${nodeLabel(child)}.`, en: `Link ${nodeLabel(cur)} → ${nodeLabel(child)}.` },
        });

        prevMap.set(child, cur);
        push({
          title: { vi: `child.prev = cur → ${nodeLabel(child)}.prev = ${nodeLabel(cur)}`, en: `child.prev = cur → ${nodeLabel(child)}.prev = ${nodeLabel(cur)}` },
          hlNodes: [cur, child],
          annotations: { [cur]: "cur", [child]: "child" },
          codeLines: [18],
          vars: [{ name: `${nodeLabel(child)}.prev`, value: nodeLabel(cur) }],
          note: { vi: `Nối ngược ${nodeLabel(child)} → ${nodeLabel(cur)}; cặp 2 chiều hoàn tất.`, en: `Link back ${nodeLabel(child)} → ${nodeLabel(cur)}; the bidirectional pair is complete.` },
        });

        push({
          title: { vi: `tail = dfs(${nodeLabel(child)}) — gọi đệ quy`, en: `tail = dfs(${nodeLabel(child)}) — recursive call` },
          hlNodes: [child],
          annotations: { [cur]: "cur", [child]: "child" },
          codeLines: [19],
          vars: [{ name: "calling", value: nodeLabel(child) }],
          note: { vi: `Tạm dừng dfs(${nodeLabel(cur)}), đệ quy vào dfs(${nodeLabel(child)}) để flatten chain con.`, en: `Pause dfs(${nodeLabel(cur)}), recurse into dfs(${nodeLabel(child)}) to flatten the child chain.` },
        });
        const tail = dfs(child);
        push({
          title: { vi: `dfs(${nodeLabel(child)}) trả về tail = ${nodeLabel(tail)}`, en: `dfs(${nodeLabel(child)}) returned tail = ${nodeLabel(tail)}` },
          hlNodes: [cur, tail],
          annotations: { [cur]: "cur", [tail]: "tail" },
          codeLines: [19],
          vars: [{ name: "tail", value: nodeLabel(tail) }],
          note: { vi: `Chain con đã được flatten hoàn toàn, node cuối là ${nodeLabel(tail)}.`, en: `The child chain is fully flattened; its last node is ${nodeLabel(tail)}.` },
        });

        childMap.set(cur, null);
        push({
          title: { vi: "cur.child = None", en: "cur.child = None" },
          hlNodes: [cur],
          annotations: { [cur]: "cur", [tail]: "tail" },
          codeLines: [20],
          vars: [{ name: `${nodeLabel(cur)}.child`, value: "None" }],
          note: { vi: "Xóa pointer child vì đã chuyển thành next/prev.", en: "Clear the child pointer since it has become a next/prev link." },
        });

        nextMap.set(tail, nxt);
        push({
          title: { vi: `tail.next = nxt → ${nodeLabel(tail)}.next = ${nodeLabel(nxt)}`, en: `tail.next = nxt → ${nodeLabel(tail)}.next = ${nodeLabel(nxt)}` },
          hlNodes: nxt ? [tail, nxt] : [tail],
          annotations: { [tail]: "tail", ...(nxt ? { [nxt]: "nxt" } : {}) },
          codeLines: [21],
          vars: [{ name: `${nodeLabel(tail)}.next`, value: nodeLabel(nxt) }],
          note: { vi: `Nối cuối chain con (${nodeLabel(tail)}) tới phần còn lại (${nodeLabel(nxt)}).`, en: `Link the child chain's tail (${nodeLabel(tail)}) to the rest (${nodeLabel(nxt)}).` },
        });

        push({
          title: { vi: `if nxt: ${Boolean(nxt)}`, en: `if nxt: ${Boolean(nxt)}` },
          hlNodes: nxt ? [nxt] : [],
          annotations: { [tail]: "tail", ...(nxt ? { [nxt]: "nxt" } : {}) },
          codeLines: [22],
          vars: [{ name: "nxt", value: nodeLabel(nxt) }],
          note: {
            vi: nxt ? "nxt tồn tại → cần nối prev ngược lại." : "nxt là None → tail chính là cuối danh sách, không cần nối thêm.",
            en: nxt ? "nxt exists → link its prev back." : "nxt is None → tail is the end of the list, nothing more to link.",
          },
        });
        if (nxt) {
          prevMap.set(nxt, tail);
          push({
            title: { vi: `nxt.prev = tail → ${nodeLabel(nxt)}.prev = ${nodeLabel(tail)}`, en: `nxt.prev = tail → ${nodeLabel(nxt)}.prev = ${nodeLabel(tail)}` },
            hlNodes: [tail, nxt],
            annotations: { [tail]: "tail", [nxt]: "nxt" },
            codeLines: [23],
            vars: [{ name: `${nodeLabel(nxt)}.prev`, value: nodeLabel(tail) }],
            note: { vi: `Nối ngược ${nodeLabel(nxt)} → ${nodeLabel(tail)}; cặp 2 chiều hoàn tất.`, en: `Link back ${nodeLabel(nxt)} → ${nodeLabel(tail)}; the bidirectional pair is complete.` },
          });
        }

        last = tail;
        push({
          title: { vi: `last = tail = ${nodeLabel(tail)}`, en: `last = tail = ${nodeLabel(tail)}` },
          hlNodes: [tail],
          annotations: { [tail]: "last" },
          codeLines: [24],
          vars: [{ name: "last", value: nodeLabel(last) }],
          note: { vi: "last theo dõi node cuối của chain đã flatten tính đến hiện tại.", en: "last tracks the final node of the flattened chain so far." },
        });
      } else {
        last = cur;
        push({
          title: { vi: `last = cur = ${nodeLabel(cur)}`, en: `last = cur = ${nodeLabel(cur)}` },
          hlNodes: [cur],
          annotations: { [cur]: "cur,last" },
          codeLines: [26],
          vars: [{ name: "last", value: nodeLabel(last) }],
          note: { vi: "Không có child, cur chính là last hiện tại.", en: "No child, so cur is the current last." },
        });
      }

      cur = nxt;
      push({
        title: { vi: `cur = nxt = ${nodeLabel(cur)}`, en: `cur = nxt = ${nodeLabel(cur)}` },
        hlNodes: cur ? [cur] : [],
        annotations: cur ? { [cur]: "cur" } : {},
        codeLines: [27],
        vars: [{ name: "cur", value: nodeLabel(cur) }],
        note: { vi: "Tiến tới node tiếp theo trong chain (đã có thể là phần đầu chain con).", en: "Move to the next node in the chain (may now be the start of the child chain)." },
      });
    }

    push({
      title: { vi: "while cur: False", en: "while cur: False" },
      hlNodes: [],
      codeLines: [13],
      vars: [{ name: "cur", value: "None" }],
      note: { vi: "cur là None → kết thúc chain hiện tại.", en: "cur is None → this chain is finished." },
    });

    push({
      title: { vi: `return last = ${nodeLabel(last)}`, en: `return last = ${nodeLabel(last)}` },
      hlNodes: [last],
      annotations: { [last]: "last" },
      codeLines: [28],
      vars: [{ name: "returns", value: nodeLabel(last) }],
      note: { vi: `dfs(${nodeLabel(nodeId)}) hoàn tất, trả về node cuối ${nodeLabel(last)}.`, en: `dfs(${nodeLabel(nodeId)}) finishes, returning the last node ${nodeLabel(last)}.` },
    });
    return last;
  }

  dfs(headId);

  // Walk the final next-chain from head to build the flattened answer.
  const order = [];
  const seenIds = new Set();
  let walk = headId;
  while (walk && !seenIds.has(walk)) {
    order.push(walk);
    seenIds.add(walk);
    walk = nextMap.get(walk) || null;
  }
  const answerStr = order.map((id) => nodeLabel(id)).join(", ");

  push({
    title: { vi: `return head → [${answerStr}]`, en: `return head → [${answerStr}]` },
    hlNodes: [headId],
    codeLines: [32],
    final: true,
    vars: [{ name: "answer", value: answerStr }],
    note: {
      vi: `Toàn bộ cấu trúc đã được flatten thành 1 doubly linked list: ${answerStr}.`,
      en: `The entire structure is flattened into a single doubly linked list: ${answerStr}.`,
    },
  });

  return { input, answer: answerStr, steps };
}

module.exports = {
  146: {
    id: 146,
    difficulty: "medium",
    slug: "lru-cache",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "LRU Cache", en: "LRU Cache" },
    titleVi: { vi: "Cache loại bỏ phần tử ít dùng gần đây nhất", en: "Least Recently Used cache" },
    statement: {
      vi:
        "Thiết kế LRUCache với get(key) và put(key, value). get trả value nếu key tồn tại, ngược lại -1. " +
        "Mỗi get/put thành công làm key đó trở thành most recently used. Khi vượt capacity, xóa key least recently used.",
      en:
        "Design an LRUCache with get(key) and put(key, value). get returns the value if the key exists, otherwise -1. " +
        "Every successful get/put makes that key most recently used. When capacity is exceeded, evict the least recently used key.",
    },
    defaultInput: "put 1 1 | put 2 2 | get 1 | put 3 3 | get 2 | put 4 4 | get 1 | get 3 | get 4",
    inputKind: "string",
    inputLabel: { vi: "Thao tác LRU, ngăn cách bằng |", en: "LRU operations separated by |" },
    extraParams: [
      { key: "capacity", label: { vi: "capacity", en: "capacity" }, default: 2 },
    ],
    approach: [
      { vi: "Hash map key->node giúp get/put tìm node O(1).", en: "A hash map key->node gives O(1) lookup for get/put." },
      { vi: "Doubly linked list giữ thứ tự sử dụng: trái là LRU, phải là MRU.", en: "A doubly linked list stores recency order: left is LRU, right is MRU." },
      { vi: "get hit hoặc put key cũ sẽ đưa node sang MRU. put key mới thêm vào MRU; nếu vượt capacity thì xóa LRU.", en: "get hit or put existing key moves the node to MRU. put new key appends MRU, then evicts LRU if over capacity." },
    ],
    complexity: {
      time: "O(1) per operation",
      space: "O(capacity)",
      note: {
        vi: "Map và doubly linked list lưu tối đa capacity node. Mỗi thao tác chỉ đổi vài pointer và map entry.",
        en: "The map and doubly linked list store at most capacity nodes. Each operation changes only a few pointers and map entries.",
      },
    },
    code: [
      "class Node:",
      "    def __init__(self, key=0, value=0):",
      "        self.key = key",
      "        self.value = value",
      "        self.prev = None",
      "        self.next = None",
      "",
      "class LRUCache:",
      "    def __init__(self, capacity: int):",
      "        self.capacity = capacity",
      "        self.cache = {}",
      "        self.left = Node()   # LRU sentinel",
      "        self.right = Node()  # MRU sentinel",
      "        self.left.next = self.right",
      "        self.right.prev = self.left",
      "",
      "    def remove(self, node):",
      "        node.prev.next = node.next",
      "        node.next.prev = node.prev",
      "",
      "    def insert(self, node):",
      "        prev = self.right.prev",
      "        prev.next = node",
      "        node.prev = prev",
      "        node.next = self.right",
      "        self.right.prev = node",
      "",
      "    def get(self, key: int) -> int:",
      "        if key not in self.cache:",
      "            return -1",
      "        node = self.cache[key]",
      "        self.remove(node)",
      "        self.insert(node)",
      "        return node.value",
      "",
      "    def put(self, key: int, value: int) -> None:",
      "        if key in self.cache:",
      "            self.remove(self.cache[key])",
      "        self.cache[key] = Node(key, value)",
      "        self.insert(self.cache[key])",
      "        if len(self.cache) > self.capacity:",
      "            lru = self.left.next",
      "            self.remove(lru)",
      "            del self.cache[lru.key]",
    ],
    builder: buildSteps146,
  },
  430: {
    id: 430,
    difficulty: "medium",
    slug: "flatten-a-multilevel-doubly-linked-list",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "Flatten a Multilevel Doubly Linked List", en: "Flatten a Multilevel Doubly Linked List" },
    titleVi: { vi: "Làm phẳng danh sách liên kết đôi đa cấp", en: "Flatten a multilevel doubly linked list" },
    statement: {
      vi:
        "Cho một doubly linked list mà mỗi node ngoài next/prev còn có thể có con trỏ child, trỏ tới một danh sách con riêng (cũng có thể có child lồng nhau). " +
        "Hãy làm phẳng (flatten) toàn bộ cấu trúc thành 1 doubly linked list duy nhất, theo đúng thứ tự DFS (chain con được chèn ngay sau node cha).",
      en:
        "Given a doubly linked list where each node may also have a child pointer to a separate list (which may itself contain nested children), " +
        "flatten the entire structure into a single doubly linked list, in DFS order (each child chain is spliced right after its parent node).",
    },
    defaultInput: "1,2,3,4,5,6",
    inputKind: "string",
    inputLabel: { vi: "Danh sách cấp gốc (values, ngăn bởi ,)", en: "Top-level list (values, comma separated)" },
    extraParams: [
      {
        key: "children",
        type: "string",
        label: { vi: "child chains: sauGiaTri:c1,c2;...", en: "child chains: afterValue:c1,c2;..." },
        default: "3:7,8,9,10;8:11,12",
      },
    ],
    approach: [
      { vi: "DFS đệ quy: dfs(node) duyệt chain next của node, trả về node CUỐI của chain đã flatten.", en: "Recursive DFS: dfs(node) walks node's next-chain, returning the LAST node of the flattened chain." },
      { vi: "Gặp node có child: nối cur → child, đệ quy dfs(child) để flatten chain con, rồi nối tail của chain con → nxt (phần còn lại sau cur).", en: "When a node has a child: link cur → child, recurse dfs(child) to flatten the child chain, then link the child chain's tail → nxt (the rest after cur)." },
      { vi: "Xóa pointer child sau khi đã chuyển thành next/prev, để không còn cấu trúc đa cấp.", en: "Clear the child pointer once it's converted into next/prev links, removing the multilevel structure." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(d)",
      note: {
        vi: "Mỗi node được xử lý đúng 1 lần → O(n). Độ sâu đệ quy bằng độ sâu lồng child → O(d).",
        en: "Each node is processed exactly once → O(n). Recursion depth equals the child-nesting depth → O(d).",
      },
    },
    code: [
      "class Node:",
      "    def __init__(self, val, prev=None, next=None, child=None):",
      "        self.val = val",
      "        self.prev = prev",
      "        self.next = next",
      "        self.child = child",
      "",
      "class Solution:",
      "    def flatten(self, head: 'Node') -> 'Node':",
      "        def dfs(node):",
      "            cur = node",
      "            last = node",
      "            while cur:",
      "                child = cur.child",
      "                nxt = cur.next",
      "                if child:",
      "                    cur.next = child",
      "                    child.prev = cur",
      "                    tail = dfs(child)",
      "                    cur.child = None",
      "                    tail.next = nxt",
      "                    if nxt:",
      "                        nxt.prev = tail",
      "                    last = tail",
      "                else:",
      "                    last = cur",
      "                cur = nxt",
      "            return last",
      "        if not head:",
      "            return head",
      "        dfs(head)",
      "        return head",
    ],
    builder: buildSteps430,
  },
  141: {
    id: 141,
    difficulty: "easy",
    slug: "linked-list-cycle",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Linked List Cycle", en: "Linked List Cycle" },
    titleVi: { vi: "Phát hiện chu trình trong danh sách liên kết", en: "Detect cycle in linked list" },
    statement: {
      vi:
        "Cho head của một linked list. Xác định xem linked list có chu trình hay không. " +
        "Chu trình xảy ra khi có một node mà ta có thể quay lại bằng cách theo con trỏ next liên tục. " +
        "Trả về True nếu có chu trình, ngược lại False.",
      en:
        "Given head of a linked list, determine if it has a cycle. " +
        "A cycle exists if some node can be reached again by following next pointers. " +
        "Return True if there is a cycle, else False.",
    },
    defaultInput: "3,2,0,-4,6,7,8",
    inputKind: "string",
    inputLabel: { vi: "Giá trị các node (phẩy ngăn). Để tạo cycle: thêm pos vào param.", en: "Node values (comma-sep). Set pos param for cycle start." },
    extraParams: [
      { key: "pos", label: { vi: "pos (index node tạo cycle, -1 nếu không cycle)", en: "pos (cycle start index, -1 if none)" }, default: 1, allowNegative: true },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: {
        vi: "Floyd's tortoise and hare: slow đi 1 bước, fast đi 2 bước. Nếu có cycle → fast sẽ gặp slow. O(n) thời gian, O(1) bộ nhớ.",
        en: "Floyd's tortoise and hare: slow moves 1 step, fast moves 2. If cycle exists → fast meets slow. O(n) time, O(1) space.",
      },
    },
    code: [
      "class Solution:",
      "    def hasCycle(self, head):",
      "        slow = fast = head",
      "        while fast and fast.next:",
      "            slow = slow.next",
      "            fast = fast.next.next",
      "            if slow == fast:",
      "                return True",
      "        return False",
    ],
    builder: buildSteps141,
  },
  83: {
    id: 83,
    difficulty: "easy",
    slug: "remove-duplicates-from-sorted-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Remove Duplicates from Sorted List", en: "Remove Duplicates from Sorted List" },
    titleVi: { vi: "Xóa phần tử trùng trong list đã sắp xếp", en: "Remove duplicates from sorted linked list" },
    statement: {
      vi: "Cho head của linked list đã sắp xếp. Xóa tất cả các node trùng giá trị, giữ lại mỗi giá trị một node duy nhất. Trả về list đã sắp xếp.",
      en: "Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the list still sorted.",
    },
    defaultInput: "1,1,2,3,3",
    inputKind: "string",
    inputLabel: { vi: "Giá trị các node (phẩy ngăn)", en: "Node values (comma separated)" },
    extraParams: [],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyệt list 1 lần, xóa tại chỗ.", en: "Single traversal, in-place removal." },
    },
    code: [
      "class Solution:",
      "    def deleteDuplicates(self, head):",
      "        curr = head",
      "        while curr and curr.next:",
      "            if curr.val == curr.next.val:",
      "                curr.next = curr.next.next",
      "            else:",
      "                curr = curr.next",
      "        return head",
    ],
    builder: buildSteps83,
  },
  203: {
    id: 203,
    difficulty: "easy",
    slug: "remove-linked-list-elements",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Remove Linked List Elements", en: "Remove Linked List Elements" },
    titleVi: { vi: "Xóa node có giá trị bằng val", en: "Remove all nodes with given value" },
    statement: {
      vi: "Cho head và val. Xóa tất cả node có val bằng giá trị cho trước. Trả về list mới.",
      en: "Given head and val, remove all nodes whose value equals val. Return the new list.",
    },
    defaultInput: "1,2,6,3,4,5,6",
    inputKind: "string",
    inputLabel: { vi: "Giá trị node (phẩy ngăn)", en: "Node values (comma separated)" },
    extraParams: [
      { key: "val", label: { vi: "val (giá trị cần xóa)", en: "val (value to remove)" }, default: 6, allowNegative: true },
    ],
    complexity: {
      time: "O(n)",
      space: "O(1)",
      note: { vi: "Duyệt 1 lần, xóa tại chỗ.", en: "Single traversal, in-place removal." },
    },
    code: [
      "class Solution:",
      "    def removeElements(self, head, val):",
      "        dummy = ListNode(0, head)",
      "        prev = dummy",
      "        curr = head",
      "        while curr:",
      "            if curr.val == val:",
      "                prev.next = curr.next",
      "            else:",
      "                prev = curr",
      "            curr = curr.next",
      "        return dummy.next",
    ],
    builder: buildSteps203,
  },
  1472: {
    id: 1472,
    difficulty: "medium",
    slug: "design-browser-history",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "Design Browser History", en: "Design Browser History" },
    titleVi: { vi: "Thiết kế lịch sử trình duyệt", en: "Design browser history" },
    statement: {
      vi: "Thiết kế BrowserHistory với visit(url), back(steps), forward(steps). visit xoá forward history rồi thêm trang mới.",
      en: "Design BrowserHistory with visit(url), back(steps), and forward(steps). visit discards forward history and appends a new page.",
    },
    defaultInput: "leetcode.com | visit google.com | visit facebook.com | visit youtube.com | back 1 | back 1 | forward 1 | visit linkedin.com | forward 2 | back 2 | back 7",
    inputKind: "string",
    inputLabel: { vi: "Các thao tác, ngăn bằng |", en: "Operations separated by |" },
    extraParams: [
      {
        key: "approach",
        type: "select",
        label: { vi: "Chọn cách visualize", en: "Visualization approach" },
        default: 2,
        options: [
          { value: 1, label: { vi: "Cách 1: Array + index", en: "Approach 1: Array + index" } },
          { value: 2, label: { vi: "Cách 2: Doubly linked list", en: "Approach 2: Doubly linked list" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: dùng mảng history + index. Dễ code, back/forward chỉ clamp index.", en: "Approach 1: use a history array + index. Easy to code; back/forward only clamp the index." },
      { vi: "Cách 2: dùng DoubleListNode. Mỗi trang nằm trong val, có prev/next, và curr trỏ tới trang hiện tại.", en: "Approach 2: use DoubleListNode. Each page is stored in val with prev/next links, and curr points to the current page." },
      { vi: "Visualization đang debug cách 2: visit cắt curr.next, nối node mới sau curr, rồi curr chuyển sang node mới.", en: "The visualization debugs approach 2: visit cuts curr.next, links a new node after curr, then moves curr to that node." },
    ],
    complexity: {
      time: "Array: O(n) visit, O(1) back/forward; DLL: O(1) visit, O(steps) back/forward",
      space: "O(n)",
      note: {
        vi: "Cả 2 cách đều dùng O(n) bộ nhớ. Cách array cắt mảng khi visit; cách doubly linked list chỉ đổi pointer nhưng back/forward đi từng node.",
        en: "Both approaches use O(n) space. The array approach slices on visit; the doubly linked list approach only rewires pointers, while back/forward walk node by node.",
      },
    },
    code: [
      "class DoubleListNode:",
      "    def __init__(self, val=0, prev=None, next=None):",
      "        self.val = val",
      "        self.prev = prev",
      "        self.next = next",
      "",
      "class BrowserHistory:",
      "    def __init__(self, homepage: str):",
      "        self.curr = DoubleListNode(homepage)",
      "",
      "    def visit(self, url: str) -> None:",
      "        new_node = DoubleListNode(url, self.curr)",
      "        self.curr.next = new_node",
      "        self.curr = new_node",
      "",
      "    def back(self, steps: int) -> str:",
      "        while self.curr.prev and steps > 0:",
      "            self.curr = self.curr.prev",
      "            steps -= 1",
      "        return self.curr.val",
      "",
      "    def forward(self, steps: int) -> str:",
      "        while self.curr.next and steps > 0:",
      "            self.curr = self.curr.next",
      "            steps -= 1",
      "        return self.curr.val",
      "",
      "",
      "# Approach 1: Array + index",
      "class BrowserHistoryArray:",
      "    def __init__(self, homepage: str):",
      "        self.history = [homepage]",
      "        self.index = 0",
      "",
      "    def visit(self, url: str) -> None:",
      "        self.history = self.history[:self.index + 1]",
      "        self.history.append(url)",
      "        self.index += 1",
      "",
      "    def back(self, steps: int) -> str:",
      "        self.index = max(0, self.index - steps)",
      "        return self.history[self.index]",
      "",
      "    def forward(self, steps: int) -> str:",
      "        self.index = min(len(self.history) - 1, self.index + steps)",
      "        return self.history[self.index]",
    ],
    builder: buildSteps1472,
  },
};
