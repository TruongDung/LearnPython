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
  const initialized = { capacity: false, cache: false, left: false, right: false, forward: false, backward: false };
  let currentOpIndex = null;

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
      lruCacheView: {
        phase: opts.event || "idle",
        capacity,
        initialized: { ...initialized },
        operations: commands.map((command) => ({
          type: command.op,
          key: command.key,
          value: command.value,
          label: command.op === "put" ? `put(${command.key}, ${command.value})` : `get(${command.key})`,
        })),
        activeOpIndex: currentOpIndex,
        completedOps: outputs.length,
        results: [...outputs],
        order: order.map((key) => ({ key, value: nodes.get(key).value })),
        entries: Array.from(nodes.values()).map((node) => ({ ...node })),
        activeKey: opts.activeKey ?? null,
        transient: opts.transient ? { ...opts.transient } : null,
        result: opts.result ?? null,
        pointerAction: opts.pointerAction || null,
        pointerProgress: Array.isArray(opts.pointerProgress) ? [...opts.pointerProgress] : [],
        prevLabel: opts.prevLabel || null,
        nodeLabel: opts.nodeLabel || null,
        nextLabel: opts.nextLabel || null,
        operation: opts.operation || null,
      },
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

  function removeWithSteps(key, operation, reason) {
    const node = nodes.get(key);
    const index = order.indexOf(key);
    if (!node || index < 0) return;
    const prevKey = index > 0 ? order[index - 1] : null;
    const nextKey = index < order.length - 1 ? order[index + 1] : null;
    const prevLabel = prevKey === null ? "LEFT" : `Node(${prevKey})`;
    const nodeLabel = `Node(${key})`;
    const nextLabel = nextKey === null ? "RIGHT" : `Node(${nextKey})`;

    snapshot({
      title: { vi: `Vào remove(Node ${key})`, en: `Enter remove(Node ${key})` },
      activeKey: key, event: "remove-enter", operation, codeLines: [17],
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `remove(${nodeLabel})`,
      vars: [{ name: "reason", value: reason }, { name: "prev | node | next", value: `${prevLabel} | ${nodeLabel} | ${nextLabel}` }],
      note: {
        vi: `Cần bỏ ${nodeLabel} nằm giữa ${prevLabel} và ${nextLabel}; hai hàng xóm phải nối trực tiếp với nhau.`,
        en: `Remove ${nodeLabel} between ${prevLabel} and ${nextLabel}; its two neighbors must link directly together.`,
      },
    });
    snapshot({
      title: { vi: `${prevLabel}.next = ${nextLabel}`, en: `${prevLabel}.next = ${nextLabel}` },
      activeKey: key, event: "remove-forward", operation, codeLines: [18],
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `${prevLabel}.next = ${nextLabel}`,
      pointerProgress: ["prev.next = next"],
      vars: [{ name: "forward link", value: `${prevLabel} -> ${nextLabel}` }],
      note: {
        vi: `Con trỏ next của ${prevLabel} bỏ qua ${nodeLabel} và trỏ thẳng tới ${nextLabel}. Chiều prev chưa cập nhật.`,
        en: `${prevLabel}.next now skips ${nodeLabel} and points to ${nextLabel}. The backward link is not updated yet.`,
      },
    });

    order.splice(index, 1);
    snapshot({
      title: { vi: `${nextLabel}.prev = ${prevLabel}`, en: `${nextLabel}.prev = ${prevLabel}` },
      event: "remove-backward", operation, codeLines: [19],
      transient: { key, value: node.value, status: "detached" },
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `${nextLabel}.prev = ${prevLabel}`,
      pointerProgress: ["prev.next = next", "next.prev = prev"],
      vars: [{ name: "backward link", value: `${nextLabel} <- ${prevLabel}` }, { name: "detached", value: `${key}:${node.value}` }],
      note: {
        vi: `Cập nhật chiều prev. ${nodeLabel} đã rời list nhưng vẫn còn trong hash map cho tới khi code xóa hoặc chèn lại.`,
        en: `Update the backward link. ${nodeLabel} is detached from the list but remains in the hash map until code deletes or reinserts it.`,
      },
    });
  }

  function insertWithSteps(key, operation, reason) {
    const node = nodes.get(key);
    if (!node) return;
    const prevKey = order.length ? order[order.length - 1] : null;
    const prevLabel = prevKey === null ? "LEFT" : `Node(${prevKey})`;
    const nodeLabel = `Node(${key})`;
    const nextLabel = "RIGHT";
    const transient = { key, value: node.value, status: "linking at MRU" };

    snapshot({
      title: { vi: `Vào insert(Node ${key})`, en: `Enter insert(Node ${key})` },
      event: "insert-enter", operation, codeLines: [21], transient,
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `insert(${nodeLabel})`,
      vars: [{ name: "reason", value: reason }],
      note: {
        vi: `${nodeLabel} sẽ được chèn ngay trước RIGHT sentinel, tức vị trí MRU.`,
        en: `${nodeLabel} will be inserted immediately before the RIGHT sentinel, the MRU position.`,
      },
    });
    snapshot({
      title: { vi: `prev = right.prev → ${prevLabel}`, en: `prev = right.prev → ${prevLabel}` },
      event: "insert-prev", operation, codeLines: [22], transient,
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `prev = ${prevLabel}`,
      vars: [{ name: "prev", value: prevLabel }, { name: "right.prev", value: prevLabel }],
      note: {
        vi: `${prevLabel} hiện là node MRU cũ và sẽ đứng ngay trước node mới.`,
        en: `${prevLabel} is the old MRU and will sit immediately before the new node.`,
      },
    });
    snapshot({
      title: { vi: `${prevLabel}.next = ${nodeLabel}`, en: `${prevLabel}.next = ${nodeLabel}` },
      event: "insert-forward", operation, codeLines: [23], transient,
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `${prevLabel}.next = ${nodeLabel}`,
      pointerProgress: ["prev.next = node"],
      vars: [{ name: "forward link", value: `${prevLabel} -> ${nodeLabel}` }],
      note: { vi: "Nối MRU cũ tiến tới node mới.", en: "Link the old MRU forward to the new node." },
    });
    snapshot({
      title: { vi: `${nodeLabel}.prev = ${prevLabel}`, en: `${nodeLabel}.prev = ${prevLabel}` },
      event: "insert-node-prev", operation, codeLines: [24], transient,
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `${nodeLabel}.prev = ${prevLabel}`,
      pointerProgress: ["prev.next = node", "node.prev = prev"],
      vars: [{ name: "backward link", value: `${nodeLabel} <- ${prevLabel}` }],
      note: { vi: "Nối node mới quay lại MRU cũ.", en: "Link the new node backward to the old MRU." },
    });
    snapshot({
      title: { vi: `${nodeLabel}.next = RIGHT`, en: `${nodeLabel}.next = RIGHT` },
      event: "insert-node-next", operation, codeLines: [25], transient,
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `${nodeLabel}.next = RIGHT`,
      pointerProgress: ["prev.next = node", "node.prev = prev", "node.next = right"],
      vars: [{ name: "forward link", value: `${nodeLabel} -> RIGHT` }],
      note: { vi: "Nối node mới tiến tới RIGHT sentinel.", en: "Link the new node forward to the RIGHT sentinel." },
    });

    order.push(key);
    snapshot({
      title: { vi: `RIGHT.prev = ${nodeLabel}`, en: `RIGHT.prev = ${nodeLabel}` },
      activeKey: key, event: "insert-finish", operation, codeLines: [26],
      prevLabel, nodeLabel, nextLabel,
      pointerAction: `RIGHT.prev = ${nodeLabel}`,
      pointerProgress: ["prev.next = node", "node.prev = prev", "node.next = right", "right.prev = node"],
      vars: [{ name: "new MRU", value: `${key}:${node.value}` }],
      note: {
        vi: `Hoàn tất bốn con trỏ. ${nodeLabel} hiện là MRU, ngay trước RIGHT.`,
        en: `All four pointers are complete. ${nodeLabel} is now MRU, immediately before RIGHT.`,
      },
    });
  }

  initialized.capacity = true;
  snapshot({
    title: { vi: `capacity = ${capacity}`, en: `capacity = ${capacity}` },
    event: "init-capacity", operation: `LRUCache(${capacity})`, codeLines: [10],
    vars: [{ name: "capacity", value: capacity }],
    note: { vi: `Cache chỉ giữ tối đa ${capacity} node dữ liệu.`, en: `The cache stores at most ${capacity} data nodes.` },
  });
  initialized.cache = true;
  snapshot({
    title: { vi: "cache = {}", en: "cache = {}" },
    event: "init-map", operation: `LRUCache(${capacity})`, codeLines: [11],
    vars: [{ name: "cache", value: "{}" }],
    note: { vi: "Hash map sẽ ánh xạ mỗi key tới đúng node trong list.", en: "The hash map will map each key to its exact list node." },
  });
  initialized.left = true;
  snapshot({
    title: { vi: "Tạo LEFT sentinel", en: "Create LEFT sentinel" },
    event: "init-left", operation: `LRUCache(${capacity})`, codeLines: [12],
    vars: [{ name: "left", value: "Node()" }],
    note: { vi: "LEFT không chứa dữ liệu; left.next luôn chỉ LRU thật.", en: "LEFT stores no data; left.next always points to the real LRU." },
  });
  initialized.right = true;
  snapshot({
    title: { vi: "Tạo RIGHT sentinel", en: "Create RIGHT sentinel" },
    event: "init-right", operation: `LRUCache(${capacity})`, codeLines: [13],
    vars: [{ name: "right", value: "Node()" }],
    note: { vi: "RIGHT không chứa dữ liệu; right.prev luôn chỉ MRU thật.", en: "RIGHT stores no data; right.prev always points to the real MRU." },
  });
  initialized.forward = true;
  snapshot({
    title: { vi: "LEFT.next = RIGHT", en: "LEFT.next = RIGHT" },
    event: "init-forward", operation: `LRUCache(${capacity})`, codeLines: [14],
    pointerAction: "LEFT.next = RIGHT", pointerProgress: ["left.next = right"],
    vars: [{ name: "forward", value: "LEFT -> RIGHT" }],
    note: { vi: "List rỗng có chiều next đi thẳng từ LEFT tới RIGHT.", en: "An empty list has its forward link directly from LEFT to RIGHT." },
  });
  initialized.backward = true;
  snapshot({
    title: { vi: "RIGHT.prev = LEFT", en: "RIGHT.prev = LEFT" },
    event: "ready", operation: `LRUCache(${capacity})`, codeLines: [15],
    pointerAction: "RIGHT.prev = LEFT", pointerProgress: ["left.next = right", "right.prev = left"],
    vars: [{ name: "backward", value: "LEFT <- RIGHT" }, { name: "outputs", value: "[]" }],
    note: { vi: "Hai sentinel đã nối hai chiều; cache sẵn sàng nhận operation.", en: "Both sentinels are linked in both directions; the cache is ready for operations." },
  });

  for (const [commandIndex, command] of commands.entries()) {
    currentOpIndex = commandIndex;
    if (command.op === "get") {
      snapshot({
        title: { vi: `key ${command.key} không có trong cache? → ${!nodes.has(command.key)}`, en: `key ${command.key} not in cache? → ${!nodes.has(command.key)}` },
        activeKey: command.key,
        event: nodes.has(command.key) ? "lookup-hit" : "lookup-miss",
        operation: `get(${command.key})`,
        codeLines: [29],
        vars: [{ name: "operation", value: command.raw }, { name: "key not in cache", value: !nodes.has(command.key) }],
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

      snapshot({
        title: { vi: `self.remove(node ${command.key})`, en: `self.remove(node ${command.key})` },
        activeKey: command.key,
        event: "remove-call",
        operation: `get(${command.key})`,
        codeLines: [32],
        vars: [{ name: "call", value: `remove(Node(${command.key}))` }],
        note: {
          vi: `Nhảy vào helper remove để tháo node ${command.key}:${value} khỏi vị trí hiện tại.`,
          en: `Enter the remove helper to detach node ${command.key}:${value} from its current position.`,
        },
      });
      removeWithSteps(command.key, `get(${command.key})`, "get hit: move node to MRU");

      snapshot({
        title: { vi: `self.insert(node ${command.key})`, en: `self.insert(node ${command.key})` },
        event: "insert-call",
        operation: `get(${command.key})`,
        codeLines: [33],
        transient: { key: command.key, value, status: "detached" },
        vars: [{ name: "call", value: `insert(Node(${command.key}))` }],
        note: {
          vi: `get hit tính là vừa sử dụng; helper insert sẽ nối node vào ngay trước RIGHT.`,
          en: `A get hit counts as recent use; insert will link the node immediately before RIGHT.`,
        },
      });
      insertWithSteps(command.key, `get(${command.key})`, "get hit: most recently used");

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
        title: { vi: `key ${command.key} có trong cache? → ${nodes.has(command.key)}`, en: `key ${command.key} in cache? → ${nodes.has(command.key)}` },
        activeKey: command.key,
        event: nodes.has(command.key) ? "lookup-update" : "lookup-new",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [37],
        vars: [{ name: "operation", value: command.raw }, { name: "key in cache", value: nodes.has(command.key) }],
        note: {
          vi: `Nếu key ${command.key} đã có thì cập nhật value; nếu chưa có thì tạo node mới.`,
          en: `If key ${command.key} exists, update it; otherwise create a new node.`,
        },
      });

      if (nodes.has(command.key)) {
        const oldValue = nodes.get(command.key).value;
        snapshot({
          title: { vi: `self.remove(cache[${command.key}])`, en: `self.remove(cache[${command.key}])` },
          activeKey: command.key,
          event: "remove-call",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [38],
          vars: [{ name: "old node", value: `${command.key}:${oldValue}` }, { name: "call", value: `remove(cache[${command.key}])` }],
          note: {
            vi: `Key ${command.key} đã tồn tại; gọi remove rồi theo dõi hai phép gán pointer bên trong helper.`,
            en: `Key ${command.key} exists; call remove and follow its two pointer assignments inside the helper.`,
          },
        });
        removeWithSteps(command.key, `put(${command.key}, ${command.value})`, "replace existing key");

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

        snapshot({
          title: { vi: `self.insert(cache[${command.key}])`, en: `self.insert(cache[${command.key}])` },
          event: "insert-call",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [40],
          transient: { key: command.key, value: command.value, status: "new node" },
          vars: [{ name: "new value", value: command.value }, { name: "call", value: `insert(cache[${command.key}])` }],
          note: {
            vi: "Gọi insert để nối node value mới vào vị trí MRU.",
            en: "Call insert to link the node with its new value at the MRU position.",
          },
        });
        insertWithSteps(command.key, `put(${command.key}, ${command.value})`, "updated key becomes MRU");

        outputs.push(null);
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

      snapshot({
        title: { vi: `self.insert(cache[${command.key}])`, en: `self.insert(cache[${command.key}])` },
        event: "insert-call",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [40],
        transient: { key: command.key, value: command.value, status: "new node" },
        vars: [{ name: "call", value: `insert(cache[${command.key}])` }],
        note: {
          vi: "Node đã nằm trong map nhưng chưa nằm trong list; gọi insert để nối bốn pointer ở phía MRU.",
          en: "The node is in the map but not the list; call insert to wire four pointers on the MRU side.",
        },
      });
      insertWithSteps(command.key, `put(${command.key}, ${command.value})`, "new key becomes MRU");

      const overCapacity = nodes.size > capacity;
      if (!overCapacity) outputs.push(null);
      snapshot({
        title: { vi: "Kiểm tra capacity", en: "Check capacity" },
        activeKey: command.key,
        event: "insert",
        operation: `put(${command.key}, ${command.value})`,
        codeLines: [41],
        vars: [
          { name: "len(cache)", value: nodes.size },
            { name: "condition", value: `${nodes.size} > ${capacity} = ${overCapacity}` },
        ],
        note: {
          vi: overCapacity
            ? `Cache có ${nodes.size} node, vượt capacity=${capacity}; cần loại LRU.`
            : `Cache có ${nodes.size} node, chưa vượt capacity=${capacity}.`,
          en: overCapacity
            ? `The cache has ${nodes.size} nodes, exceeding capacity=${capacity}; evict the LRU node.`
            : `The cache has ${nodes.size} nodes, within capacity=${capacity}.`,
        },
      });

      if (overCapacity) {
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

        snapshot({
          title: { vi: `self.remove(lru ${evictedKey}:${evictedValue})`, en: `self.remove(lru ${evictedKey}:${evictedValue})` },
          activeKey: evictedKey,
          event: "remove-call",
          operation: `put(${command.key}, ${command.value})`,
          codeLines: [43],
          vars: [
            { name: "lru", value: `${evictedKey}:${evictedValue}` },
            { name: "call", value: `remove(Node(${evictedKey}))` },
          ],
          note: {
            vi: `Gọi helper remove để tháo LRU ${evictedKey}:${evictedValue}; map vẫn giữ key cho tới dòng 44.`,
            en: `Call remove to detach LRU ${evictedKey}:${evictedValue}; the map keeps its key until line 44.`,
          },
        });
        removeWithSteps(evictedKey, `put(${command.key}, ${command.value})`, "capacity exceeded: remove LRU");

        nodes.delete(evictedKey);
        outputs.push(null);
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
    }
  }

  currentOpIndex = null;
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
 * LeetCode 432: All O`one Data Structure.
 * Doubly linked list of "buckets" ordered by increasing count (head = lowest
 * count, tail = highest count). Each bucket holds the set of keys sharing
 * that exact count. keyCount maps key->count, keyBucket maps key->bucket.
 * inc/dec move a key to the neighboring bucket (creating it if missing) and
 * delete the old bucket if it becomes empty — giving O(1) for all 4 ops.
 *
 * Input: pipe-separated commands, e.g. "inc a | inc a | inc b | getMaxKey | dec a | getMinKey".
 */
function buildSteps432(input) {
  const raw = String(input || "").trim();
  const steps = [];

  function parseCommands(text) {
    return text
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const tokens = part.replace(/[(),]/g, " ").split(/\s+/).filter(Boolean);
        const op = (tokens[0] || "").toLowerCase();
        if ((op === "inc" || op === "dec") && tokens.length >= 2) {
          return { op, key: tokens[1], raw: part };
        }
        if (op === "getmaxkey" || op === "getminkey") {
          return { op, raw: part };
        }
        return { op: "invalid", raw: part };
      });
  }

  const commands = parseCommands(raw);
  if (!commands.length || commands.some((c) => c.op === "invalid")) {
    steps.push({
      title: { vi: "Input không hợp lệ", en: "Invalid input" },
      arr: [],
      final: true,
      codeLines: [1],
      vars: [{ name: "expected", value: "inc a | inc a | inc b | getMaxKey | dec a | getMinKey" }],
      note: {
        vi: "Nhập thao tác dạng: inc a | inc a | inc b | getMaxKey | dec a | getMinKey.",
        en: "Enter operations like: inc a | inc a | inc b | getMaxKey | dec a | getMinKey.",
      },
    });
    return { original: raw, answer: [], steps };
  }

  // Bucket doubly linked list. HEAD/TAIL are sentinels (count = 0, never hold keys).
  let idCounter = 0;
  const HEAD = "head";
  const TAIL = "tail";
  const buckets = new Map(); // id -> { id, count, keys: Set, sentinel? }
  const nextMap = new Map();
  const prevMap = new Map();
  buckets.set(HEAD, { id: HEAD, count: 0, keys: new Set(), sentinel: "head" });
  buckets.set(TAIL, { id: TAIL, count: 0, keys: new Set(), sentinel: "tail" });
  nextMap.set(HEAD, TAIL);
  prevMap.set(TAIL, HEAD);

  const keyCount = new Map(); // key -> count
  const keyBucket = new Map(); // key -> bucket id
  const outputs = [];

  function bucketLabel(id) {
    const b = buckets.get(id);
    if (b.sentinel === "head") return "H";
    if (b.sentinel === "tail") return "T";
    return String(b.count);
  }

  function bucketOrder() {
    const order = [];
    let cur = HEAD;
    while (cur) {
      order.push(cur);
      cur = nextMap.get(cur);
    }
    return order;
  }

  function push({ title, hlNodes = [], annotations = {}, codeLines, vars, note, operation, final = false }) {
    const order = bucketOrder();
    const nodes = order.map((id) => {
      const b = buckets.get(id);
      const label = bucketLabel(id);
      const sub = b.sentinel ? "sentinel" : ([...b.keys].join(",") || "(empty)");
      return { id, label, row: "main", sub };
    });
    const edges = [];
    for (let i = 0; i < order.length - 1; i++) {
      edges.push({ u: order[i], v: order[i + 1], w: "next", kind: "next" });
      edges.push({ u: order[i + 1], v: order[i], w: "prev", kind: "prev" });
    }
    steps.push({
      title,
      arr: [],
      graph: {
        nodes,
        edges,
        layout: "linear",
        order,
        caption: `${operation || ""} | buckets head→tail: ${order.map(bucketLabel).join(" → ")}`,
        annotations,
        hlNodes,
        hlEdges: [],
        visitedNodes: [],
      },
      highlight: [],
      mark: [],
      codeLines,
      vars: vars || [],
      note,
      final,
    });
  }

  function insertAfter(bucketId, count) {
    const id = `b${idCounter++}`;
    buckets.set(id, { id, count, keys: new Set() });
    const nextId = nextMap.get(bucketId);
    nextMap.set(bucketId, id);
    prevMap.set(id, bucketId);
    nextMap.set(id, nextId);
    prevMap.set(nextId, id);
    return id;
  }

  function removeBucket(bucketId) {
    const prevId = prevMap.get(bucketId);
    const nextId = nextMap.get(bucketId);
    nextMap.set(prevId, nextId);
    prevMap.set(nextId, prevId);
    buckets.delete(bucketId);
  }

  push({
    title: { vi: "Khởi tạo AllOne (head/tail sentinel)", en: "Initialize AllOne (head/tail sentinels)" },
    codeLines: [9],
    operation: "AllOne()",
    vars: [{ name: "keyCount", value: "{}" }, { name: "keyBucket", value: "{}" }],
    note: {
      vi: "Danh sách bucket rỗng, chỉ có 2 sentinel head/tail. Mỗi bucket chứa các key có cùng count, sắp tăng dần từ head đến tail.",
      en: "The bucket list is empty, just head/tail sentinels. Each bucket holds keys sharing the same count, increasing from head to tail.",
    },
  });

  for (const command of commands) {
    if (command.op === "inc") {
      const key = command.key;
      push({
        title: { vi: `inc(${key})`, en: `inc(${key})` },
        operation: `inc(${key})`,
        codeLines: [28],
        vars: [{ name: "key", value: key }],
        note: { vi: `Tăng count của "${key}" lên 1.`, en: `Increase "${key}"'s count by 1.` },
      });

      const isNew = !keyCount.has(key);
      push({
        title: { vi: `key not in keyCount? ${isNew}`, en: `key not in keyCount? ${isNew}` },
        operation: `inc(${key})`,
        codeLines: [29],
        vars: [{ name: "in keyCount?", value: !isNew }],
        note: {
          vi: isNew ? `"${key}" chưa tồn tại → count mới = 1.` : `"${key}" đã tồn tại, count hiện tại = ${keyCount.get(key)}.`,
          en: isNew ? `"${key}" doesn't exist yet → new count = 1.` : `"${key}" already exists, current count = ${keyCount.get(key)}.`,
        },
      });

      let target;
      if (isNew) {
        keyCount.set(key, 1);
        push({
          title: { vi: `keyCount[${key}] = 1`, en: `keyCount[${key}] = 1` },
          operation: `inc(${key})`,
          codeLines: [30],
          vars: [{ name: `keyCount[${key}]`, value: 1 }],
          note: { vi: `Ghi nhận count của "${key}" là 1.`, en: `Record "${key}"'s count as 1.` },
        });

        const headNextId = nextMap.get(HEAD);
        const needNewBucket = buckets.get(headNextId).count !== 1;
        push({
          title: { vi: `head.next.count != 1? ${needNewBucket}`, en: `head.next.count != 1? ${needNewBucket}` },
          hlNodes: [headNextId],
          operation: `inc(${key})`,
          codeLines: [31],
          vars: [{ name: "head.next.count", value: buckets.get(headNextId).count }],
          note: {
            vi: needNewBucket ? "Chưa có bucket count=1 ngay sau head → cần tạo mới." : "Đã có bucket count=1 ngay sau head, dùng lại.",
            en: needNewBucket ? "No count=1 bucket right after head yet → create one." : "A count=1 bucket already sits right after head, reuse it.",
          },
        });
        if (needNewBucket) {
          const newId = insertAfter(HEAD, 1);
          push({
            title: { vi: "insert_after(head, 1)", en: "insert_after(head, 1)" },
            hlNodes: [newId],
            operation: `inc(${key})`,
            codeLines: [32],
            vars: [{ name: "new bucket", value: "count=1" }],
            note: { vi: "Chèn bucket mới count=1 ngay sau head.", en: "Insert a new count=1 bucket right after head." },
          });
        }
        target = nextMap.get(HEAD);
        push({
          title: { vi: `target = head.next (count=${buckets.get(target).count})`, en: `target = head.next (count=${buckets.get(target).count})` },
          hlNodes: [target],
          operation: `inc(${key})`,
          codeLines: [33],
          vars: [{ name: "target", value: `bucket count=${buckets.get(target).count}` }],
          note: { vi: `Bucket đích để thêm "${key}" là bucket count=1 ngay sau head.`, en: `The target bucket to add "${key}" is the count=1 bucket right after head.` },
        });
      } else {
        const oldCount = keyCount.get(key);
        keyCount.set(key, oldCount + 1);
        push({
          title: { vi: `keyCount[${key}] = ${oldCount} + 1 = ${oldCount + 1}`, en: `keyCount[${key}] = ${oldCount} + 1 = ${oldCount + 1}` },
          operation: `inc(${key})`,
          codeLines: [36],
          vars: [{ name: `keyCount[${key}]`, value: oldCount + 1 }],
          note: { vi: `Count của "${key}" tăng từ ${oldCount} lên ${oldCount + 1}.`, en: `"${key}"'s count increases from ${oldCount} to ${oldCount + 1}.` },
        });

        const bucketId = keyBucket.get(key);
        push({
          title: { vi: `bucket = keyBucket[${key}] (count=${oldCount})`, en: `bucket = keyBucket[${key}] (count=${oldCount})` },
          hlNodes: [bucketId],
          operation: `inc(${key})`,
          codeLines: [37],
          vars: [{ name: "bucket", value: `count=${oldCount}` }],
          note: { vi: `Bucket hiện tại của "${key}" có count=${oldCount}.`, en: `"${key}"'s current bucket has count=${oldCount}.` },
        });

        buckets.get(bucketId).keys.delete(key);
        push({
          title: { vi: `bucket.keys.remove(${key})`, en: `bucket.keys.remove(${key})` },
          hlNodes: [bucketId],
          operation: `inc(${key})`,
          codeLines: [38],
          vars: [{ name: "bucket.keys", value: `{${[...buckets.get(bucketId).keys].join(",")}}` }],
          note: { vi: `Xóa "${key}" khỏi bucket count=${oldCount}.`, en: `Remove "${key}" from the count=${oldCount} bucket.` },
        });

        let candidate = nextMap.get(bucketId);
        push({
          title: { vi: `target = bucket.next (count=${buckets.get(candidate).count})`, en: `target = bucket.next (count=${buckets.get(candidate).count})` },
          hlNodes: [candidate],
          operation: `inc(${key})`,
          codeLines: [39],
          vars: [{ name: "target", value: `bucket count=${buckets.get(candidate).count}` }],
          note: { vi: "Bucket kế tiếp có thể đã đúng count mong muốn.", en: "The next bucket might already have the target count." },
        });

        const needNew = buckets.get(candidate).count !== oldCount + 1;
        push({
          title: { vi: `target.count != ${oldCount + 1}? ${needNew}`, en: `target.count != ${oldCount + 1}? ${needNew}` },
          hlNodes: [candidate],
          operation: `inc(${key})`,
          codeLines: [40],
          vars: [{ name: "target.count", value: buckets.get(candidate).count }],
          note: {
            vi: needNew ? `Chưa có bucket count=${oldCount + 1} → cần tạo mới.` : `Đã có bucket count=${oldCount + 1}, dùng lại.`,
            en: needNew ? `No count=${oldCount + 1} bucket yet → create one.` : `A count=${oldCount + 1} bucket already exists, reuse it.`,
          },
        });
        if (needNew) {
          candidate = insertAfter(bucketId, oldCount + 1);
          push({
            title: { vi: `target = insert_after(bucket, ${oldCount + 1})`, en: `target = insert_after(bucket, ${oldCount + 1})` },
            hlNodes: [candidate],
            operation: `inc(${key})`,
            codeLines: [41],
            vars: [{ name: "target", value: `new bucket count=${oldCount + 1}` }],
            note: { vi: `Chèn bucket mới count=${oldCount + 1} ngay sau bucket cũ.`, en: `Insert a new count=${oldCount + 1} bucket right after the old bucket.` },
          });
        }
        target = candidate;

        const bucketEmptyInc = buckets.get(bucketId).keys.size === 0;
        push({
          title: { vi: `not bucket.keys? ${bucketEmptyInc}`, en: `not bucket.keys? ${bucketEmptyInc}` },
          hlNodes: [bucketId],
          operation: `inc(${key})`,
          codeLines: [42],
          vars: [{ name: "bucket.keys empty?", value: bucketEmptyInc }],
          note: {
            vi: bucketEmptyInc ? `Bucket count=${oldCount} rỗng → cần xóa.` : `Bucket count=${oldCount} vẫn còn key khác.`,
            en: bucketEmptyInc ? `The count=${oldCount} bucket is empty → remove it.` : `The count=${oldCount} bucket still has other keys.`,
          },
        });
        if (bucketEmptyInc) {
          removeBucket(bucketId);
          push({
            title: { vi: `remove_bucket(count=${oldCount})`, en: `remove_bucket(count=${oldCount})` },
            operation: `inc(${key})`,
            codeLines: [43],
            vars: [{ name: "removed", value: `count=${oldCount}` }],
            note: { vi: `Xóa bucket count=${oldCount} rỗng khỏi danh sách.`, en: `Remove the now-empty count=${oldCount} bucket from the list.` },
          });
        }
      }

      buckets.get(target).keys.add(key);
      push({
        title: { vi: `target.keys.add(${key})`, en: `target.keys.add(${key})` },
        hlNodes: [target],
        operation: `inc(${key})`,
        codeLines: [44],
        vars: [{ name: "target.keys", value: `{${[...buckets.get(target).keys].join(",")}}` }],
        note: { vi: `Thêm "${key}" vào bucket count=${buckets.get(target).count}.`, en: `Add "${key}" to the count=${buckets.get(target).count} bucket.` },
      });

      keyBucket.set(key, target);
      push({
        title: { vi: `keyBucket[${key}] = target`, en: `keyBucket[${key}] = target` },
        hlNodes: [target],
        operation: `inc(${key})`,
        codeLines: [45],
        vars: [{ name: `keyBucket[${key}]`, value: `count=${buckets.get(target).count}` }],
        note: { vi: `Cập nhật "${key}" trỏ tới bucket count=${buckets.get(target).count}.`, en: `Update "${key}" to point to the count=${buckets.get(target).count} bucket.` },
      });

      outputs.push(null);
    } else if (command.op === "dec") {
      const key = command.key;
      push({
        title: { vi: `dec(${key})`, en: `dec(${key})` },
        operation: `dec(${key})`,
        codeLines: [47],
        vars: [{ name: "key", value: key }],
        note: { vi: `Giảm count của "${key}" đi 1 (hoặc xóa nếu count đang là 1).`, en: `Decrease "${key}"'s count by 1 (or remove it if count is 1).` },
      });

      const exists = keyCount.has(key);
      push({
        title: { vi: `key not in keyCount? ${!exists}`, en: `key not in keyCount? ${!exists}` },
        operation: `dec(${key})`,
        codeLines: [48],
        vars: [{ name: "in keyCount?", value: exists }],
        note: {
          vi: exists ? `"${key}" tồn tại, count hiện tại = ${keyCount.get(key)}.` : `"${key}" không tồn tại.`,
          en: exists ? `"${key}" exists, current count = ${keyCount.get(key)}.` : `"${key}" does not exist.`,
        },
      });
      if (!exists) {
        push({
          title: { vi: "return (không có gì để làm)", en: "return (nothing to do)" },
          operation: `dec(${key})`,
          codeLines: [49],
          vars: [],
          note: { vi: `"${key}" không tồn tại nên bỏ qua.`, en: `"${key}" doesn't exist, so skip.` },
        });
        outputs.push(null);
        continue;
      }

      const oldCount = keyCount.get(key);
      push({
        title: { vi: `old_count = keyCount[${key}] = ${oldCount}`, en: `old_count = keyCount[${key}] = ${oldCount}` },
        operation: `dec(${key})`,
        codeLines: [50],
        vars: [{ name: "old_count", value: oldCount }],
        note: { vi: `Count hiện tại của "${key}" là ${oldCount}.`, en: `"${key}"'s current count is ${oldCount}.` },
      });

      const bucketId = keyBucket.get(key);
      push({
        title: { vi: `bucket = keyBucket[${key}] (count=${oldCount})`, en: `bucket = keyBucket[${key}] (count=${oldCount})` },
        hlNodes: [bucketId],
        operation: `dec(${key})`,
        codeLines: [51],
        vars: [{ name: "bucket", value: `count=${oldCount}` }],
        note: { vi: `Bucket hiện tại của "${key}".`, en: `"${key}"'s current bucket.` },
      });

      buckets.get(bucketId).keys.delete(key);
      push({
        title: { vi: `bucket.keys.remove(${key})`, en: `bucket.keys.remove(${key})` },
        hlNodes: [bucketId],
        operation: `dec(${key})`,
        codeLines: [52],
        vars: [{ name: "bucket.keys", value: `{${[...buckets.get(bucketId).keys].join(",")}}` }],
        note: { vi: `Xóa "${key}" khỏi bucket count=${oldCount}.`, en: `Remove "${key}" from the count=${oldCount} bucket.` },
      });

      const becomesZero = oldCount === 1;
      push({
        title: { vi: `old_count == 1? ${becomesZero}`, en: `old_count == 1? ${becomesZero}` },
        operation: `dec(${key})`,
        codeLines: [53],
        vars: [{ name: "old_count", value: oldCount }],
        note: {
          vi: becomesZero ? `Count sẽ về 0 → xóa "${key}" khỏi hệ thống hoàn toàn.` : `Count mới sẽ là ${oldCount - 1}.`,
          en: becomesZero ? `Count would drop to 0 → remove "${key}" entirely.` : `New count will be ${oldCount - 1}.`,
        },
      });

      if (becomesZero) {
        keyCount.delete(key);
        push({
          title: { vi: `del keyCount[${key}]`, en: `del keyCount[${key}]` },
          operation: `dec(${key})`,
          codeLines: [54],
          vars: [{ name: "keyCount", value: `{${[...keyCount.keys()].join(",")}}` }],
          note: { vi: `Xóa "${key}" khỏi keyCount.`, en: `Remove "${key}" from keyCount.` },
        });
        keyBucket.delete(key);
        push({
          title: { vi: `del keyBucket[${key}]`, en: `del keyBucket[${key}]` },
          operation: `dec(${key})`,
          codeLines: [55],
          vars: [{ name: "keyBucket", value: `{${[...keyBucket.keys()].join(",")}}` }],
          note: { vi: `Xóa "${key}" khỏi keyBucket; "${key}" bị loại hoàn toàn khỏi hệ thống.`, en: `Remove "${key}" from keyBucket; "${key}" is fully gone from the structure.` },
        });
      } else {
        keyCount.set(key, oldCount - 1);
        push({
          title: { vi: `keyCount[${key}] = ${oldCount} - 1 = ${oldCount - 1}`, en: `keyCount[${key}] = ${oldCount} - 1 = ${oldCount - 1}` },
          operation: `dec(${key})`,
          codeLines: [57],
          vars: [{ name: `keyCount[${key}]`, value: oldCount - 1 }],
          note: { vi: `Count của "${key}" giảm xuống ${oldCount - 1}.`, en: `"${key}"'s count decreases to ${oldCount - 1}.` },
        });

        let candidate = prevMap.get(bucketId);
        push({
          title: { vi: `target = bucket.prev (count=${buckets.get(candidate).count})`, en: `target = bucket.prev (count=${buckets.get(candidate).count})` },
          hlNodes: [candidate],
          operation: `dec(${key})`,
          codeLines: [58],
          vars: [{ name: "target", value: `bucket count=${buckets.get(candidate).count}` }],
          note: { vi: "Bucket trước đó có thể đã đúng count mong muốn.", en: "The previous bucket might already have the target count." },
        });

        const needNew = buckets.get(candidate).count !== oldCount - 1;
        push({
          title: { vi: `target.count != ${oldCount - 1}? ${needNew}`, en: `target.count != ${oldCount - 1}? ${needNew}` },
          hlNodes: [candidate],
          operation: `dec(${key})`,
          codeLines: [59],
          vars: [{ name: "target.count", value: buckets.get(candidate).count }],
          note: {
            vi: needNew ? `Chưa có bucket count=${oldCount - 1} → cần tạo mới.` : `Đã có bucket count=${oldCount - 1}, dùng lại.`,
            en: needNew ? `No count=${oldCount - 1} bucket yet → create one.` : `A count=${oldCount - 1} bucket already exists, reuse it.`,
          },
        });
        if (needNew) {
          candidate = insertAfter(prevMap.get(bucketId), oldCount - 1);
          push({
            title: { vi: `target = insert_after(bucket.prev, ${oldCount - 1})`, en: `target = insert_after(bucket.prev, ${oldCount - 1})` },
            hlNodes: [candidate],
            operation: `dec(${key})`,
            codeLines: [60],
            vars: [{ name: "target", value: `new bucket count=${oldCount - 1}` }],
            note: { vi: `Chèn bucket mới count=${oldCount - 1} ngay trước bucket cũ.`, en: `Insert a new count=${oldCount - 1} bucket right before the old bucket.` },
          });
        }

        buckets.get(candidate).keys.add(key);
        push({
          title: { vi: `target.keys.add(${key})`, en: `target.keys.add(${key})` },
          hlNodes: [candidate],
          operation: `dec(${key})`,
          codeLines: [61],
          vars: [{ name: "target.keys", value: `{${[...buckets.get(candidate).keys].join(",")}}` }],
          note: { vi: `Thêm "${key}" vào bucket count=${oldCount - 1}.`, en: `Add "${key}" to the count=${oldCount - 1} bucket.` },
        });

        keyBucket.set(key, candidate);
        push({
          title: { vi: `keyBucket[${key}] = target`, en: `keyBucket[${key}] = target` },
          hlNodes: [candidate],
          operation: `dec(${key})`,
          codeLines: [62],
          vars: [{ name: `keyBucket[${key}]`, value: `count=${oldCount - 1}` }],
          note: { vi: `Cập nhật "${key}" trỏ tới bucket count=${oldCount - 1}.`, en: `Update "${key}" to point to the count=${oldCount - 1} bucket.` },
        });
      }

      const bucketEmptyDec = buckets.get(bucketId).keys.size === 0;
      push({
        title: { vi: `not bucket.keys? ${bucketEmptyDec}`, en: `not bucket.keys? ${bucketEmptyDec}` },
        hlNodes: [bucketId],
        operation: `dec(${key})`,
        codeLines: [63],
        vars: [{ name: "bucket.keys empty?", value: bucketEmptyDec }],
        note: {
          vi: bucketEmptyDec ? `Bucket count=${oldCount} rỗng → cần xóa.` : `Bucket count=${oldCount} vẫn còn key khác.`,
          en: bucketEmptyDec ? `The count=${oldCount} bucket is empty → remove it.` : `The count=${oldCount} bucket still has other keys.`,
        },
      });
      if (bucketEmptyDec) {
        removeBucket(bucketId);
        push({
          title: { vi: `remove_bucket(count=${oldCount})`, en: `remove_bucket(count=${oldCount})` },
          operation: `dec(${key})`,
          codeLines: [64],
          vars: [{ name: "removed", value: `count=${oldCount}` }],
          note: { vi: `Xóa bucket count=${oldCount} rỗng khỏi danh sách.`, en: `Remove the now-empty count=${oldCount} bucket from the list.` },
        });
      }

      outputs.push(null);
    } else if (command.op === "getmaxkey") {
      const tailPrev = prevMap.get(TAIL);
      const isEmptyAll = tailPrev === HEAD;
      push({
        title: { vi: `getMaxKey(): tail.prev is head? ${isEmptyAll}`, en: `getMaxKey(): tail.prev is head? ${isEmptyAll}` },
        hlNodes: isEmptyAll ? [] : [tailPrev],
        operation: "getMaxKey()",
        codeLines: [67],
        vars: [{ name: "tail.prev is head?", value: isEmptyAll }],
        note: {
          vi: isEmptyAll ? "Danh sách bucket rỗng → trả về chuỗi rỗng." : `Bucket cuối (count lớn nhất) có count=${buckets.get(tailPrev).count}.`,
          en: isEmptyAll ? "The bucket list is empty → return an empty string." : `The last bucket (highest count) has count=${buckets.get(tailPrev).count}.`,
        },
      });
      let result;
      if (isEmptyAll) {
        result = "";
        push({
          title: { vi: 'return ""', en: 'return ""' },
          operation: "getMaxKey()",
          codeLines: [68],
          vars: [{ name: "answer", value: '""' }],
          note: { vi: "Chưa có key nào trong hệ thống.", en: "No keys exist in the structure yet." },
          final: true,
        });
      } else {
        result = [...buckets.get(tailPrev).keys][0];
        push({
          title: { vi: `return next(iter(tail.prev.keys)) = "${result}"`, en: `return next(iter(tail.prev.keys)) = "${result}"` },
          hlNodes: [tailPrev],
          operation: "getMaxKey()",
          codeLines: [69],
          vars: [{ name: "answer", value: result }],
          note: { vi: `"${result}" có count lớn nhất = ${buckets.get(tailPrev).count}.`, en: `"${result}" has the highest count = ${buckets.get(tailPrev).count}.` },
        });
      }
      outputs.push(result);
    } else if (command.op === "getminkey") {
      const headNext = nextMap.get(HEAD);
      const isEmptyAll = headNext === TAIL;
      push({
        title: { vi: `getMinKey(): head.next is tail? ${isEmptyAll}`, en: `getMinKey(): head.next is tail? ${isEmptyAll}` },
        hlNodes: isEmptyAll ? [] : [headNext],
        operation: "getMinKey()",
        codeLines: [72],
        vars: [{ name: "head.next is tail?", value: isEmptyAll }],
        note: {
          vi: isEmptyAll ? "Danh sách bucket rỗng → trả về chuỗi rỗng." : `Bucket đầu (count nhỏ nhất) có count=${buckets.get(headNext).count}.`,
          en: isEmptyAll ? "The bucket list is empty → return an empty string." : `The first bucket (lowest count) has count=${buckets.get(headNext).count}.`,
        },
      });
      let result;
      if (isEmptyAll) {
        result = "";
        push({
          title: { vi: 'return ""', en: 'return ""' },
          operation: "getMinKey()",
          codeLines: [73],
          vars: [{ name: "answer", value: '""' }],
          note: { vi: "Chưa có key nào trong hệ thống.", en: "No keys exist in the structure yet." },
        });
      } else {
        result = [...buckets.get(headNext).keys][0];
        push({
          title: { vi: `return next(iter(head.next.keys)) = "${result}"`, en: `return next(iter(head.next.keys)) = "${result}"` },
          hlNodes: [headNext],
          operation: "getMinKey()",
          codeLines: [74],
          vars: [{ name: "answer", value: result }],
          note: { vi: `"${result}" có count nhỏ nhất = ${buckets.get(headNext).count}.`, en: `"${result}" has the lowest count = ${buckets.get(headNext).count}.` },
        });
      }
      outputs.push(result);
    }
  }

  const fs = {
    title: { vi: "Kết quả", en: "Result" },
    arr: [],
    graph: (() => {
      const order = bucketOrder();
      const nodes = order.map((id) => ({ id, label: bucketLabel(id), row: "main", sub: buckets.get(id).sentinel ? "sentinel" : ([...buckets.get(id).keys].join(",") || "(empty)") }));
      const edges = [];
      for (let i = 0; i < order.length - 1; i++) {
        edges.push({ u: order[i], v: order[i + 1], w: "next", kind: "next" });
        edges.push({ u: order[i + 1], v: order[i], w: "prev", kind: "prev" });
      }
      return { nodes, edges, layout: "linear", order, caption: `buckets head→tail: ${order.map(bucketLabel).join(" → ")}`, annotations: {}, hlNodes: [], hlEdges: [], visitedNodes: [] };
    })(),
    highlight: [],
    mark: [],
    codeLines: [],
    vars: [{ name: "outputs", value: `[${outputs.map((v) => (v === null ? "null" : `"${v}"`)).join(", ")}]` }],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác.`,
      en: `Finished ${commands.length} operation(s).`,
    },
    final: true,
  };
  steps.push(fs);

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

/**
 * LeetCode 3507: Minimum Pair Removal to Sort Array I.
 *
 * Model nums as a doubly linked list. Repeatedly:
 *   1. Check if the list is already non-decreasing (no inversions) -> done.
 *   2. Scan left to right for the adjacent pair with the minimum sum
 *      (leftmost wins ties).
 *   3. Merge that pair into a single node holding the sum; relink prev/next.
 * Count merges until sorted.
 */
function buildSteps3507(input) {
  const nums = Array.isArray(input) ? input.map(Number) : String(input).split(",").map(Number);
  const steps = [];

  // DLL nodes: { id, val, prev, next } stored in a Map by id. IDs are stable
  // across merges (never reused) so the visualization can track history.
  let idCounter = 0;
  const nodes = new Map();
  let head = null;
  let prevId = null;
  for (const v of nums) {
    const id = idCounter++;
    nodes.set(id, { id, val: v, prev: prevId, next: null });
    if (prevId !== null) nodes.get(prevId).next = id;
    else head = id;
    prevId = id;
  }

  function order() {
    const out = [];
    let cur = head;
    while (cur !== null) {
      out.push(cur);
      cur = nodes.get(cur).next;
    }
    return out;
  }

  function graphSnap(opts) {
    const ord = order();
    const graphNodes = ord.map((id) => ({ id, label: String(nodes.get(id).val) }));
    const edges = [];
    for (let i = 0; i < ord.length - 1; i++) {
      edges.push({ u: ord[i], v: ord[i + 1], w: "", kind: "next" });
      edges.push({ u: ord[i + 1], v: ord[i], w: "", kind: "prev" });
    }
    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes: graphNodes,
        edges,
        layout: "linear",
        order: ord,
        caption: opts.caption || `nums: ${ord.map((id) => nodes.get(id).val).join(", ")}`,
        annotations: opts.annotations || {},
        hlNodes: opts.hlNodes || [],
        hlEdges: [],
        visitedNodes: opts.visitedNodes || [],
      },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  function hasInversion() {
    const ord = order();
    for (let i = 0; i < ord.length - 1; i++) {
      if (nodes.get(ord[i]).val > nodes.get(ord[i + 1]).val) return true;
    }
    return false;
  }

  // Lines 14-20: build the doubly linked list from nums
  graphSnap({
    title: { vi: "Xây doubly linked list từ nums", en: "Build doubly linked list from nums" },
    codeLines: [14, 15, 16, 17, 18, 19, 20],
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }, { name: "ops", value: 0 }],
    note: {
      vi: `nums = [${nums.join(", ")}]. Mỗi phần tử là 1 node, nối bằng next/prev.`,
      en: `nums = [${nums.join(", ")}]. Each element becomes a node linked by next/prev.`,
    },
  });

  let ops = 0;

  while (true) {
    // Line 31: while has_inversion()
    const inv = hasInversion();
    graphSnap({
      title: { vi: `has_inversion() → ${inv}`, en: `has_inversion() → ${inv}` },
      codeLines: [31],
      vars: [{ name: "ops", value: ops }, { name: "has_inversion?", value: inv }],
      note: inv
        ? { vi: "Vẫn còn nghịch thế (a[i] > a[i+1]) → tiếp tục gộp.", en: "Still an inversion (a[i] > a[i+1]) present → keep merging." }
        : { vi: "Không còn nghịch thế → mảng đã không giảm. Dừng.", en: "No inversion remains → array is non-decreasing. Stop." },
    });
    if (!inv) break;

    // Lines 25-32: find leftmost min-sum adjacent pair
    const ord = order();
    let bestSum = Infinity;
    let bestId = null;
    for (let i = 0; i < ord.length - 1; i++) {
      const a = nodes.get(ord[i]);
      const b = nodes.get(ord[i + 1]);
      const s = a.val + b.val;

      graphSnap({
        title: { vi: `sum(${a.val}, ${b.val}) = ${s}`, en: `sum(${a.val}, ${b.val}) = ${s}` },
        codeLines: [36, 37],
        hlNodes: [a.id, b.id],
        annotations: bestId !== null ? { [bestId]: "best" } : {},
        vars: [
          { name: "pair", value: `(${a.val}, ${b.val})` },
          { name: "sum", value: s },
          { name: "best_sum so far", value: bestSum === Infinity ? "inf" : bestSum },
        ],
        note: {
          vi: `Xét cặp liền kề (${a.val}, ${b.val}): tổng = ${s}.`,
          en: `Consider adjacent pair (${a.val}, ${b.val}): sum = ${s}.`,
        },
      });

      if (s < bestSum) {
        bestSum = s;
        bestId = a.id;
        graphSnap({
          title: { vi: `Cập nhật best: sum=${s} tại node(${a.val})`, en: `Update best: sum=${s} at node(${a.val})` },
          codeLines: [38, 39],
          hlNodes: [a.id, b.id],
          annotations: { [a.id]: "best" },
          vars: [{ name: "best_sum", value: bestSum }, { name: "best node", value: a.val }],
          note: {
            vi: `${s} < best_sum cũ → cập nhật ứng viên tốt nhất = (${a.val}, ${b.val}).`,
            en: `${s} < previous best_sum → update best candidate = (${a.val}, ${b.val}).`,
          },
        });
      }
    }

    // Line 34-38: merge best pair
    const a = nodes.get(bestId);
    const bId = a.next;
    const b = nodes.get(bId);
    const oldAVal = a.val;
    a.val = a.val + b.val;
    a.next = b.next;
    if (b.next !== null) nodes.get(b.next).prev = a.id;
    nodes.delete(bId);
    ops++;

    graphSnap({
      title: { vi: `Merge (${oldAVal}, ${b.val}) → ${a.val}. ops=${ops}`, en: `Merge (${oldAVal}, ${b.val}) → ${a.val}. ops=${ops}` },
      codeLines: [42, 43, 44, 45, 46, 48],
      hlNodes: [a.id],
      visitedNodes: [],
      vars: [
        { name: "merged pair", value: `(${oldAVal}, ${b.val})` },
        { name: "new node value", value: a.val },
        { name: "ops", value: ops },
      ],
      note: {
        vi: `Gộp node(${oldAVal}) và node(${b.val}) thành 1 node giá trị ${a.val}. Nối lại prev/next. ops = ${ops}.`,
        en: `Merge node(${oldAVal}) and node(${b.val}) into one node with value ${a.val}. Relink prev/next. ops = ${ops}.`,
      },
    });
  }

  graphSnap({
    title: { vi: `Kết quả: ${ops} lần gộp`, en: `Result: ${ops} merge(s)` },
    codeLines: [50],
    final: true,
    vars: [{ name: "answer (ops)", value: ops }],
    note: {
      vi: `Mảng đã không giảm sau ${ops} lần gộp tối thiểu.`,
      en: `The array is non-decreasing after a minimum of ${ops} merge(s).`,
    },
  });

  return { original: nums, answer: ops, steps };
}

/**
 * LeetCode 460: LFU Cache — hashmap + frequency buckets (each an LRU order).
 * Evict the least-frequently-used key; ties broken by least-recently-used.
 *
 * Input: capacity via param + a sequence of operations:
 *   put(key,value) / get(key)
 *
 * Code lines (1-indexed):
 *  1  class LFUCache:
 *  2      def __init__(self, capacity):
 *  3          self.cap = capacity; self.min_freq = 0
 *  4          self.val = {}; self.freq = {}
 *  5          self.buckets = defaultdict(OrderedDict)
 *  6      def _touch(self, key):
 *  7          f = self.freq[key]; del self.buckets[f][key]
 *  8          if not self.buckets[f]:
 *  9              del self.buckets[f]
 * 10              if self.min_freq == f: self.min_freq += 1
 * 11          self.freq[key] = f + 1; self.buckets[f+1][key] = None
 * 12      def get(self, key):
 * 13          if key not in self.val: return -1
 * 14          self._touch(key); return self.val[key]
 * 15      def put(self, key, value):
 * 16          if self.cap == 0: return
 * 17          if key in self.val:
 * 18              self.val[key] = value; self._touch(key); return
 * 19          if len(self.val) >= self.cap:
 * 20              k,_ = self.buckets[self.min_freq].popitem(last=False)
 * 21              del self.val[k]; del self.freq[k]
 * 22          self.val[key] = value; self.freq[key] = 1
 * 23          self.buckets[1][key] = None; self.min_freq = 1
 */
function buildSteps460(input, params) {
  const capacity = params && params.capacity !== undefined ? Number(params.capacity) : 2;
  const lines = String(input).split(/[\n;]+/).map((x) => x.trim()).filter(Boolean);

  const ops = [];
  for (const line of lines) {
    const m = line.match(/^(\w+)\(([^)]*)\)$/);
    if (!m) continue;
    const name = m[1];
    const args = m[2] === "" ? [] : m[2].split(",").map((x) => Number(x.trim()));
    if (name === "put" && args.length === 2) ops.push({ type: "put", key: args[0], value: args[1], label: `put(${args[0]}, ${args[1]})` });
    else if (name === "get" && args.length === 1) ops.push({ type: "get", key: args[0], label: `get(${args[0]})` });
  }

  const steps = [];
  const val = new Map();     // key -> value
  const freq = new Map();    // key -> frequency
  const buckets = new Map(); // freq -> array of keys (LRU: front = oldest)
  let minFreq = 0;
  const results = Array(ops.length).fill(null);
  let completedOps = 0;

  const valStr = () => `{${[...val.entries()].map(([k, v]) => `${k}:${v}`).join(", ")}}`;
  const freqStr = () => `{${[...freq.entries()].map(([k, f]) => `${k}:${f}`).join(", ")}}`;
  const bucketsStr = () => {
    const fs = [...buckets.keys()].sort((a, b) => a - b);
    return `{${fs.map((f) => `f${f}:[${buckets.get(f).join(",")}]`).join(", ")}}`;
  };

  function touch(key, opIndex, operation) {
    const f = freq.get(key);
    snap({
      title: { vi: `_touch(${key})`, en: `_touch(${key})` },
      codeLines: [6], opIndex, phase: "touch-enter", activeKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: "operation", value: operation }, { name: "key", value: key }],
      note: { vi: `Bắt đầu tăng tần suất của key ${key} từ ${f} lên ${f + 1}.`, en: `Start increasing key ${key}'s frequency from ${f} to ${f + 1}.` },
    });

    const arr = buckets.get(f);
    snap({
      title: { vi: `f = freq[${key}] = ${f}`, en: `f = freq[${key}] = ${f}` },
      codeLines: [7], opIndex, phase: "touch-read", activeKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: "f", value: f }, { name: `buckets[${f}]`, value: `[${arr.join(", ")}]` }],
      note: { vi: `Đọc tần suất hiện tại f=${f}; key ${key} đang nằm trong bucket f${f}.`, en: `Read current frequency f=${f}; key ${key} is in bucket f${f}.` },
    });

    arr.splice(arr.indexOf(key), 1);
    snap({
      title: { vi: `Xóa key ${key} khỏi bucket f${f}`, en: `Remove key ${key} from bucket f${f}` },
      codeLines: [7], opIndex, phase: "touch-remove", activeKey: key, movingKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: `buckets[${f}] after delete`, value: `[${arr.join(", ")}]` }],
      note: { vi: `Key ${key} tạm rời bucket f${f}; bước sau sẽ đưa nó vào cuối bucket f${f + 1} (MRU).`, en: `Key ${key} temporarily leaves bucket f${f}; it will be appended to bucket f${f + 1} as MRU.` },
    });

    const bucketEmpty = arr.length === 0;
    snap({
      title: { vi: `bucket f${f} rỗng? ${bucketEmpty}`, en: `Is bucket f${f} empty? ${bucketEmpty}` },
      codeLines: [8], opIndex, phase: "touch-empty-check", activeKey: key, movingKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: `bool(buckets[${f}])`, value: !bucketEmpty }],
      note: bucketEmpty
        ? { vi: `Không còn key nào ở f${f}, nên xóa bucket này.`, en: `No keys remain at f${f}, so delete this bucket.` }
        : { vi: `Bucket f${f} vẫn còn key khác; min_freq chưa cần đổi.`, en: `Bucket f${f} still has another key; min_freq does not need to change.` },
    });

    if (bucketEmpty) {
      buckets.delete(f);
      snap({
        title: { vi: `Xóa bucket f${f}`, en: `Delete bucket f${f}` },
        codeLines: [9], opIndex, phase: "touch-delete-bucket", activeKey: key, movingKey: key, fromFreq: f, toFreq: f + 1,
        extraVars: [{ name: "deleted bucket", value: `f${f}` }],
        note: { vi: `Bucket f${f} đã rỗng và được loại khỏi buckets.`, en: `Empty bucket f${f} is removed from buckets.` },
      });

      const shouldRaiseMin = minFreq === f;
      if (shouldRaiseMin) minFreq += 1;
      snap({
        title: shouldRaiseMin
          ? { vi: `min_freq: ${f} → ${minFreq}`, en: `min_freq: ${f} → ${minFreq}` }
          : { vi: `min_freq=${minFreq} khác f=${f} → giữ nguyên`, en: `min_freq=${minFreq} differs from f=${f} → unchanged` },
        codeLines: [10], opIndex, phase: "touch-min-freq", activeKey: key, movingKey: key, fromFreq: f, toFreq: f + 1,
        extraVars: [{ name: "min_freq == f", value: shouldRaiseMin }, { name: "min_freq", value: minFreq }],
        note: shouldRaiseMin
          ? { vi: `Bucket nhỏ nhất vừa rỗng, nên min_freq tăng lên ${minFreq}.`, en: `The minimum bucket became empty, so min_freq increases to ${minFreq}.` }
          : { vi: `Bucket vừa xóa không phải bucket min_freq, nên min_freq giữ ở ${minFreq}.`, en: `The removed bucket was not min_freq, so min_freq stays ${minFreq}.` },
      });
    }

    freq.set(key, f + 1);
    snap({
      title: { vi: `freq[${key}] = ${f + 1}`, en: `freq[${key}] = ${f + 1}` },
      codeLines: [11], opIndex, phase: "touch-update-freq", activeKey: key, movingKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: `freq[${key}]`, value: f + 1 }],
      note: { vi: `Cập nhật bảng freq: key ${key} có tần suất mới ${f + 1}.`, en: `Update the freq map: key ${key} now has frequency ${f + 1}.` },
    });

    if (!buckets.has(f + 1)) buckets.set(f + 1, []);
    buckets.get(f + 1).push(key);
    snap({
      title: { vi: `Đưa key ${key} vào cuối bucket f${f + 1}`, en: `Append key ${key} to bucket f${f + 1}` },
      codeLines: [11], opIndex, phase: "touch-insert", activeKey: key, fromFreq: f, toFreq: f + 1,
      extraVars: [{ name: `buckets[${f + 1}]`, value: `[${buckets.get(f + 1).join(", ")}]` }],
      note: { vi: `Key ${key} trở thành MRU của bucket f${f + 1}; thứ tự trái→phải vẫn là LRU→MRU.`, en: `Key ${key} becomes MRU of bucket f${f + 1}; left-to-right order remains LRU→MRU.` },
    });
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: [
        { name: "capacity", value: capacity },
        { name: "min_freq", value: minFreq },
        { name: "val", value: valStr() },
        { name: "freq", value: freqStr() },
        { name: "buckets", value: bucketsStr() },
        ...(opts.extraVars || []),
      ],
      note: opts.note,
      lfuCacheView: {
        capacity,
        size: val.size,
        minFreq,
        entries: [...val.entries()].map(([key, value]) => ({ key, value, freq: freq.get(key) ?? null })),
        groups: [...buckets.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([frequency, keys]) => ({
            frequency,
            keys: keys.map((key) => ({ key, value: val.get(key), freq: freq.get(key) ?? frequency })),
          })),
        operations: ops.map((op) => ({ ...op })),
        results: [...results],
        completedOps,
        activeOpIndex: opts.opIndex ?? null,
        phase: opts.phase || "idle",
        activeKey: opts.activeKey ?? null,
        movingKey: opts.movingKey ?? null,
        evictedKey: opts.evictedKey ?? null,
        fromFreq: opts.fromFreq ?? null,
        toFreq: opts.toFreq ?? null,
        result: opts.result ?? null,
      },
    });
  }

  snap({
    title: { vi: `Khởi tạo LFUCache(${capacity})`, en: `Initialize LFUCache(${capacity})` },
    codeLines: [3, 4, 5],
    phase: "initialize",
    note: {
      vi:
        `LFU = xóa key ÍT DÙNG NHẤT; nếu hòa tần suất thì xóa key CŨ NHẤT (LRU).\n` +
        `val: key→value. freq: key→số lần dùng. buckets[f]: các key có tần suất f, theo thứ tự LRU (đầu = cũ nhất).\n` +
        `min_freq: tần suất nhỏ nhất hiện có (để biết bucket nào chứa key sẽ bị evict).`,
      en:
        `LFU = evict the LEAST-FREQUENTLY-used key; ties broken by LEAST-RECENTLY-used (LRU).\n` +
        `val: key→value. freq: key→use count. buckets[f]: keys with frequency f in LRU order (front = oldest).\n` +
        `min_freq: current smallest frequency (identifies the bucket to evict from).`,
    },
  });

  for (let oi = 0; oi < ops.length; oi++) {
    const op = ops[oi];

    snap({
      title: { vi: `Operation ${oi + 1}: ${op.label}`, en: `Operation ${oi + 1}: ${op.label}` },
      codeLines: [op.type === "get" ? 12 : 15], opIndex: oi, phase: "operation-start", activeKey: op.key,
      extraVars: [{ name: "operation", value: op.label }],
      note: op.type === "get"
        ? { vi: `Bắt đầu get key ${op.key}.`, en: `Begin get for key ${op.key}.` }
        : { vi: `Bắt đầu put key ${op.key}, value ${op.value}.`, en: `Begin put for key ${op.key}, value ${op.value}.` },
    });

    if (op.type === "get") {
      const hit = val.has(op.key);
      snap({
        title: hit
          ? { vi: `key ${op.key} có trong val → hit`, en: `key ${op.key} is in val → hit` }
          : { vi: `key ${op.key} không có trong val → miss`, en: `key ${op.key} is not in val → miss` },
        codeLines: [13], opIndex: oi, phase: "get-check", activeKey: op.key,
        extraVars: [{ name: `key ${op.key} in val`, value: hit }],
        note: hit
          ? { vi: `Tìm thấy key ${op.key}; cần _touch trước khi trả value.`, en: `Found key ${op.key}; _touch it before returning the value.` }
          : { vi: `Không tìm thấy key ${op.key}; trả -1 và không đổi cache.`, en: `Key ${op.key} is absent; return -1 without changing the cache.` },
      });

      if (!hit) {
        results[oi] = -1;
        completedOps = oi + 1;
        snap({
          title: { vi: `get(${op.key}) → -1 (miss)`, en: `get(${op.key}) → -1 (miss)` },
          codeLines: [13], opIndex: oi, phase: "get-miss", activeKey: op.key, result: -1,
          extraVars: [{ name: "operation", value: op.label }, { name: "result", value: -1 }],
          note: { vi: `key ${op.key} không có trong cache → trả về -1.`, en: `key ${op.key} not in cache → return -1.` },
        });
      } else {
        const before = freq.get(op.key);
        const value = val.get(op.key);
        snap({
          title: { vi: `Gọi _touch(${op.key}) trước khi trả ${value}`, en: `Call _touch(${op.key}) before returning ${value}` },
          codeLines: [14], opIndex: oi, phase: "get-touch", activeKey: op.key, fromFreq: before, toFreq: before + 1,
          extraVars: [{ name: "operation", value: op.label }, { name: "saved value", value }],
          note: {
            vi: `Lưu value=${value}, sau đó tăng tần suất ${before}→${before + 1}.`,
            en: `Save value=${value}, then increase frequency ${before}→${before + 1}.`,
          },
        });
        touch(op.key, oi, op.label);
        results[oi] = value;
        completedOps = oi + 1;
        snap({
          title: { vi: `get(${op.key}) → ${value}`, en: `get(${op.key}) → ${value}` },
          codeLines: [14], opIndex: oi, phase: "get-return", activeKey: op.key, result: value,
          extraVars: [{ name: "result", value }, { name: `freq[${op.key}]`, value: freq.get(op.key) }],
          note: { vi: `Trả ${value}; key ${op.key} hiện là MRU của bucket f${freq.get(op.key)}.`, en: `Return ${value}; key ${op.key} is now MRU in bucket f${freq.get(op.key)}.` },
        });
      }
    } else {
      const zeroCapacity = capacity === 0;
      snap({
        title: zeroCapacity
          ? { vi: "capacity == 0 → true", en: "capacity == 0 → true" }
          : { vi: "capacity == 0 → false", en: "capacity == 0 → false" },
        codeLines: [16], opIndex: oi, phase: "put-capacity-check", activeKey: op.key,
        extraVars: [{ name: "self.cap == 0", value: zeroCapacity }],
        note: zeroCapacity
          ? { vi: "Cache không có chỗ chứa nên put kết thúc ngay.", en: "The cache has no storage, so put returns immediately." }
          : { vi: `capacity=${capacity}, tiếp tục kiểm tra key ${op.key} đã tồn tại chưa.`, en: `capacity=${capacity}; continue by checking whether key ${op.key} exists.` },
      });

      if (zeroCapacity) {
        results[oi] = null;
        completedOps = oi + 1;
        snap({
          title: { vi: `put(${op.key}, ${op.value}): capacity=0 → bỏ qua`, en: `put(${op.key}, ${op.value}): capacity=0 → skip` },
          codeLines: [16], opIndex: oi, phase: "put-capacity-return", activeKey: op.key,
          extraVars: [{ name: "operation", value: op.label }],
          note: { vi: "Cache dung lượng 0, không lưu gì.", en: "Zero-capacity cache stores nothing." },
        });
        continue;
      }

      const exists = val.has(op.key);
      snap({
        title: exists
          ? { vi: `key ${op.key} đã có trong val`, en: `key ${op.key} already exists in val` }
          : { vi: `key ${op.key} chưa có trong val`, en: `key ${op.key} is not in val` },
        codeLines: [17], opIndex: oi, phase: "put-key-check", activeKey: op.key,
        extraVars: [{ name: `key ${op.key} in val`, value: exists }],
        note: exists
          ? { vi: "Đây là update: đổi value rồi tăng tần suất bằng _touch.", en: "This is an update: replace the value, then increase frequency with _touch." }
          : { vi: "Đây là key mới; bước tiếp theo kiểm tra cache đã đầy chưa.", en: "This is a new key; next check whether the cache is full." },
      });

      if (exists) {
        const before = freq.get(op.key);
        val.set(op.key, op.value);
        snap({
          title: { vi: `val[${op.key}] = ${op.value}`, en: `val[${op.key}] = ${op.value}` },
          codeLines: [18], opIndex: oi, phase: "put-update-value", activeKey: op.key,
          extraVars: [{ name: `val[${op.key}]`, value: op.value }],
          note: {
            vi: `Chỉ value đổi thành ${op.value}; key ${op.key} vẫn tạm ở bucket f${before}.`,
            en: `Only the value changes to ${op.value}; key ${op.key} is still temporarily in bucket f${before}.`,
          },
        });
        snap({
          title: { vi: `Gọi _touch(${op.key})`, en: `Call _touch(${op.key})` },
          codeLines: [18], opIndex: oi, phase: "put-update-touch", activeKey: op.key, fromFreq: before, toFreq: before + 1,
          extraVars: [{ name: "operation", value: op.label }],
          note: { vi: `put vào key có sẵn cũng được tính là một lần sử dụng: freq ${before}→${before + 1}.`, en: `Updating an existing key counts as use: freq ${before}→${before + 1}.` },
        });
        touch(op.key, oi, op.label);
        results[oi] = null;
        completedOps = oi + 1;
        snap({
          title: { vi: `put(${op.key}, ${op.value}) hoàn tất`, en: `put(${op.key}, ${op.value}) complete` },
          codeLines: [18], opIndex: oi, phase: "put-update-return", activeKey: op.key,
          extraVars: [{ name: `freq[${op.key}]`, value: freq.get(op.key) }],
          note: { vi: `key ${op.key} hiện là MRU của bucket f${freq.get(op.key)}.`, en: `key ${op.key} is now MRU in bucket f${freq.get(op.key)}.` },
        });
        continue;
      }

      const full = val.size >= capacity;
      snap({
        title: full
          ? { vi: `${val.size} >= ${capacity} → cache đầy`, en: `${val.size} >= ${capacity} → cache full` }
          : { vi: `${val.size} < ${capacity} → còn chỗ`, en: `${val.size} < ${capacity} → space available` },
        codeLines: [19], opIndex: oi, phase: "put-full-check", activeKey: op.key,
        extraVars: [{ name: "len(val)", value: val.size }, { name: "self.cap", value: capacity }],
        note: full
          ? { vi: `Phải evict key LRU ở bucket min_freq=f${minFreq} trước khi thêm key mới.`, en: `Evict the LRU key from min_freq bucket f${minFreq} before inserting the new key.` }
          : { vi: "Không cần evict; chuyển thẳng sang thêm key mới.", en: "No eviction is needed; proceed to insertion." },
      });

      if (full) {
        const evictionFreq = minFreq;
        const bucket = buckets.get(minFreq);
        const evictKey = bucket.shift();
        snap({
          title: { vi: `pop key đầu bucket f${evictionFreq} → ${evictKey}`, en: `Pop front of bucket f${evictionFreq} → ${evictKey}` },
          codeLines: [20], opIndex: oi, phase: "put-evict-select", activeKey: op.key, evictedKey: evictKey, fromFreq: evictionFreq,
          extraVars: [{ name: "evicted key", value: evictKey }, { name: `buckets[${evictionFreq}]`, value: `[${bucket.join(", ")}]` }],
          note: {
            vi: `Bucket f${evictionFreq} có tần suất nhỏ nhất; phần tử đầu là LRU nên chọn key ${evictKey}.`,
            en: `Bucket f${evictionFreq} has the minimum frequency; its front is LRU, so key ${evictKey} is selected.`,
          },
        });

        val.delete(evictKey);
        snap({
          title: { vi: `del val[${evictKey}]`, en: `del val[${evictKey}]` },
          codeLines: [21], opIndex: oi, phase: "put-evict-value", activeKey: op.key, evictedKey: evictKey, fromFreq: evictionFreq,
          extraVars: [{ name: "evicted key", value: evictKey }],
          note: { vi: `Xóa value của key ${evictKey}; bảng freq sẽ được xóa ở thao tác kế tiếp trên cùng dòng code.`, en: `Remove key ${evictKey}'s value; its frequency entry is deleted next on the same code line.` },
        });

        freq.delete(evictKey);
        snap({
          title: { vi: `del freq[${evictKey}]`, en: `del freq[${evictKey}]` },
          codeLines: [21], opIndex: oi, phase: "put-evict-frequency", activeKey: op.key, evictedKey: evictKey, fromFreq: evictionFreq,
          extraVars: [{ name: "operation", value: op.label }, { name: "evicted key", value: evictKey }],
          note: {
            vi: `Key ${evictKey} đã bị loại hoàn toàn. Bucket f${evictionFreq} có thể đang rỗng; key mới sẽ vào f1 ngay sau đó.`,
            en: `Key ${evictKey} is now fully removed. Bucket f${evictionFreq} may be empty; the new key enters f1 next.`,
          },
        });
      }

      val.set(op.key, op.value);
      snap({
        title: { vi: `val[${op.key}] = ${op.value}`, en: `val[${op.key}] = ${op.value}` },
        codeLines: [22], opIndex: oi, phase: "put-insert-value", activeKey: op.key,
        extraVars: [{ name: `val[${op.key}]`, value: op.value }],
        note: { vi: `Thêm cặp key-value ${op.key}:${op.value} vào val.`, en: `Insert key-value pair ${op.key}:${op.value} into val.` },
      });

      freq.set(op.key, 1);
      snap({
        title: { vi: `freq[${op.key}] = 1`, en: `freq[${op.key}] = 1` },
        codeLines: [22], opIndex: oi, phase: "put-insert-frequency", activeKey: op.key, toFreq: 1,
        extraVars: [{ name: `freq[${op.key}]`, value: 1 }],
        note: { vi: "Key mới luôn bắt đầu với tần suất 1.", en: "A new key always starts at frequency 1." },
      });

      if (!buckets.has(1)) buckets.set(1, []);
      buckets.get(1).push(op.key);
      snap({
        title: { vi: `Đưa key ${op.key} vào cuối bucket f1`, en: `Append key ${op.key} to bucket f1` },
        codeLines: [23], opIndex: oi, phase: "put-insert-bucket", activeKey: op.key, toFreq: 1,
        extraVars: [{ name: "buckets[1]", value: `[${buckets.get(1).join(", ")}]` }],
        note: { vi: `Key ${op.key} là phần tử mới nhất (MRU) ở cuối bucket f1.`, en: `Key ${op.key} is the newest (MRU) entry at the end of bucket f1.` },
      });

      minFreq = 1;
      results[oi] = null;
      completedOps = oi + 1;
      snap({
        title: { vi: `min_freq = 1; put hoàn tất`, en: `min_freq = 1; put complete` },
        codeLines: [23], opIndex: oi, phase: "put-insert-complete", activeKey: op.key,
        extraVars: [{ name: "operation", value: op.label }],
        note: {
          vi: `Vì vừa thêm key có freq=1, tần suất nhỏ nhất chắc chắn trở về 1.`,
          en: `Because a key with freq=1 was inserted, the minimum frequency is now definitely 1.`,
        },
      });
    }
  }

  snap({
    title: { vi: "Hoàn tất tất cả operations", en: "All operations completed" },
    final: true,
    codeLines: [],
    phase: "done",
    note: {
      vi: `Đã xử lý ${ops.length} operation. Trạng thái cuối: val=${valStr()}, freq=${freqStr()}.`,
      en: `Processed ${ops.length} operations. Final state: val=${valStr()}, freq=${freqStr()}.`,
    },
  });

  return { original: input, answer: results, steps };
}

/** LeetCode 61: Rotate List right by k. */
function buildSteps61(input, params) {
  const vals = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const k0 = params && params.k !== undefined ? Number(params.k) : 2;
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: o.arr, sub: o.sub || o.arr.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  const n = vals.length;
  if (n === 0) { snap({ title: { vi: "List rỗng", en: "Empty list" }, arr: [], final: true, codeLines: [3], vars: [], note: { vi: "", en: "" } }); return { original: vals, answer: [], steps }; }
  snap({ title: { vi: `List = [${vals.join("→")}], k=${k0}`, en: `List = [${vals.join("→")}], k=${k0}` }, arr: [...vals], codeLines: [3, 4], vars: [{ name: "length", value: n }, { name: "k", value: k0 }], note: { vi: "Xoay phải k = k phần tử cuối chuyển lên đầu. Tìm điểm cắt = length - (k%length).", en: "Right rotate by k = move the last k nodes to the front. Cut point = length - (k%length)." } });
  const k = k0 % n;
  if (k === 0) { snap({ title: { vi: "k%n=0 → không đổi", en: "k%n=0 → unchanged" }, arr: [...vals], final: true, codeLines: [5], vars: [{ name: "k%n", value: 0 }], note: { vi: "Xoay bội của độ dài → giữ nguyên.", en: "Rotating by a multiple of the length → unchanged." } }); return { original: vals, answer: vals, steps }; }
  const cut = n - k;
  snap({ title: { vi: `Điểm cắt sau vị trí ${cut - 1}`, en: `Cut after index ${cut - 1}` }, arr: [...vals], highlight: [cut - 1, cut], codeLines: [6, 7], vars: [{ name: "k%n", value: k }, { name: "cut index", value: cut }], note: { vi: `Nối đuôi vào đầu (vòng tròn), rồi cắt sau phần tử ${cut - 1}. ${k} phần tử cuối thành đầu.`, en: `Link tail to head (circular), then cut after index ${cut - 1}. The last ${k} nodes become the front.` } });
  const answer = [...vals.slice(cut), ...vals.slice(0, cut)];
  snap({ title: { vi: `Kết quả: [${answer.join("→")}]`, en: `Result: [${answer.join("→")}]` }, arr: [...answer], mark: Array.from({ length: k }, (_, i) => i), final: true, codeLines: [8], vars: [{ name: "answer", value: `[${answer.join(",")}]` }], note: { vi: `${k} phần tử cuối (tô xanh) đã chuyển lên đầu.`, en: `The last ${k} nodes (highlighted) moved to the front.` } });
  return { original: vals, answer, steps };
}

/** LeetCode 82: Remove Duplicates from Sorted List II (remove all dups). */
function buildSteps82(input) {
  const vals = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  function snap(o) { steps.push({ title: o.title, arr: o.arr, sub: o.arr.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: `List = [${vals.join("→")}]`, en: `List = [${vals.join("→")}]` }, arr: [...vals], codeLines: [3], vars: [{ name: "list", value: `[${vals.join(",")}]` }], note: { vi: "Xóa MỌI phần tử có giá trị lặp (không giữ lại bản nào). Dùng dummy + prev.", en: "Remove EVERY node whose value appears more than once (keep none). Use dummy + prev." } });
  // simulate removal by value counts
  const count = {};
  for (const v of vals) count[v] = (count[v] || 0) + 1;
  const answer = [];
  for (let i = 0; i < vals.length; i++) {
    const dup = count[vals[i]] > 1;
    snap({ title: { vi: `Node ${vals[i]}: ${dup ? "trùng → xóa" : "duy nhất → giữ"}`, en: `Node ${vals[i]}: ${dup ? "duplicate → remove" : "unique → keep"}` }, arr: [...vals], highlight: [i], mark: answer.map((v) => vals.indexOf(v)).filter((x) => x >= 0), codeLines: dup ? [4, 5, 6] : [7, 8], vars: [{ name: "node", value: vals[i] }, { name: `count[${vals[i]}]`, value: count[vals[i]] }, { name: "kept", value: `[${answer.join(",")}]` }], note: { vi: dup ? `Giá trị ${vals[i]} xuất hiện ${count[vals[i]]} lần → bỏ toàn bộ.` : `Giá trị ${vals[i]} duy nhất → giữ lại.`, en: dup ? `Value ${vals[i]} appears ${count[vals[i]]} times → drop all.` : `Value ${vals[i]} is unique → keep.` } });
    if (!dup) answer.push(vals[i]);
  }
  snap({ title: { vi: `Kết quả: [${answer.join("→")}]`, en: `Result: [${answer.join("→")}]` }, arr: [...answer], final: true, codeLines: [9], vars: [{ name: "answer", value: `[${answer.join(",")}]` }], note: { vi: "Chỉ giữ các giá trị xuất hiện đúng 1 lần.", en: "Keep only values that appear exactly once." } });
  return { original: vals, answer, steps };
}

/** LeetCode 148: Sort List — merge sort. */
function buildSteps148(input) {
  const vals = (Array.isArray(input) ? [...input] : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const steps = [];
  let depth = 0;
  function snap(o) { steps.push({ title: o.title, arr: o.arr, sub: o.arr.map((_, i) => `[${i}]`), highlight: o.highlight || [], mark: o.mark || [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: `List = [${vals.join("→")}]`, en: `List = [${vals.join("→")}]` }, arr: [...vals], codeLines: [3], vars: [{ name: "list", value: `[${vals.join(",")}]` }], note: { vi: "Merge sort trên linked list: chia đôi bằng slow/fast, sắp mỗi nửa, rồi trộn.", en: "Merge sort on a linked list: split via slow/fast, sort each half, then merge." } });
  function sort(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const left = a.slice(0, mid), right = a.slice(mid);
    snap({ title: { vi: `Chia: [${left.join(",")}] | [${right.join(",")}]`, en: `Split: [${left.join(",")}] | [${right.join(",")}]` }, arr: [...a], highlight: Array.from({ length: mid }, (_, i) => i), codeLines: [4, 5, 6, 7], vars: [{ name: "left", value: `[${left.join(",")}]` }, { name: "right", value: `[${right.join(",")}]` }], note: { vi: `Dùng slow/fast tìm giữa, cắt thành hai nửa.`, en: `Use slow/fast to find the middle, split into two halves.` } });
    const sl = sort(left), sr = sort(right);
    // merge
    const merged = [];
    let x = 0, y = 0;
    while (x < sl.length && y < sr.length) { if (sl[x] <= sr[y]) merged.push(sl[x++]); else merged.push(sr[y++]); }
    while (x < sl.length) merged.push(sl[x++]);
    while (y < sr.length) merged.push(sr[y++]);
    snap({ title: { vi: `Trộn → [${merged.join(",")}]`, en: `Merge → [${merged.join(",")}]` }, arr: [...merged], mark: Array.from({ length: merged.length }, (_, i) => i), codeLines: [8, 9, 10, 11], vars: [{ name: "merged", value: `[${merged.join(",")}]` }], note: { vi: `Trộn hai nửa đã sắp [${sl.join(",")}] và [${sr.join(",")}].`, en: `Merge the two sorted halves [${sl.join(",")}] and [${sr.join(",")}].` } });
    return merged;
  }
  const answer = sort(vals);
  snap({ title: { vi: `Kết quả: [${answer.join("→")}]`, en: `Result: [${answer.join("→")}]` }, arr: [...answer], final: true, codeLines: [12], vars: [{ name: "answer", value: `[${answer.join(",")}]` }], note: { vi: "Danh sách đã sắp xếp tăng dần.", en: "The list is sorted ascending." } });
  return { original: vals, answer, steps };
}

/**
 * LeetCode 92: Reverse Linked List II.
 * "Insert-at-front" trick: one pass, no second scan.
 * prev stays at the node just before position `left`.
 * Repeatedly pull the node after curr and insert it right after prev.
 */
function buildSteps92(input, params) {
  const vals = (Array.isArray(input)
    ? [...input]
    : String(input).split(",").map((s) => Number(s.trim())).filter((x) => !isNaN(x)));
  const n = vals.length;
  const left  = Math.min(Math.max(1, Number(params && params.left  !== undefined ? params.left  : 2)), n);
  const right = Math.min(Math.max(left, Number(params && params.right !== undefined ? params.right : Math.min(4, n))), n);
  const steps = [];

  // Working copy we mutate step by step
  const list = [...vals];

  function snap(o) {
    steps.push({
      title: o.title,
      arr:   [...list],
      sub:   list.map((_, i) => `[${i + 1}]`),   // 1-indexed to match problem
      highlight: o.highlight || [],
      mark:      o.mark      || [],
      final:     o.final     || false,
      codeLines: o.codeLines || [],
      vars:      o.vars      || [],
      note:      o.note,
    });
  }

  snap({
    title: { vi: `List = [${vals.join("→")}], left=${left}, right=${right}`, en: `List = [${vals.join("→")}], left=${left}, right=${right}` },
    codeLines: [3],
    vars: [
      { name: "head", value: `[${vals.join(", ")}]` },
      { name: "left",  value: left  },
      { name: "right", value: right },
    ],
    note: {
      vi: `Đảo ngược các node từ vị trí ${left} đến ${right} (1-indexed). Dùng mẹo "insert-at-front": kéo node sau curr và cắm vào ngay sau prev.`,
      en: `Reverse nodes from position ${left} to ${right} (1-indexed). Use the "insert-at-front" trick: pull the node after curr and splice it right after prev.`,
    },
  });

  // Step 1: Advance prev to position left-1 (0-indexed: left-2, because 1-indexed)
  const prevIdx = left - 2;   // index of the node just before `left` (−1 = dummy)
  snap({
    title: { vi: `Tiến đến node trước vị trí left=${left}`, en: `Advance to node before position left=${left}` },
    highlight: prevIdx >= 0 ? [prevIdx] : [],
    codeLines: [4, 5, 6],
    vars: [
      { name: "prev index",  value: prevIdx < 0 ? "dummy (before head)" : prevIdx },
      { name: "curr index",  value: left - 1 },
      { name: "prev.val",    value: prevIdx < 0 ? "dummy" : list[prevIdx] },
    ],
    note: {
      vi: `Dịch chuyển prev ${left - 1} bước: prev bây giờ trỏ vào ${prevIdx < 0 ? "dummy node (trước head)" : `node ${list[prevIdx]} tại [${prevIdx + 1}]`}. curr trỏ vào node [${left}] = ${list[left - 1]}.`,
      en: `Move prev ${left - 1} step(s): prev now points to ${prevIdx < 0 ? "the dummy node (before head)" : `node ${list[prevIdx]} at [${prevIdx + 1}]`}. curr points to node [${left}] = ${list[left - 1]}.`,
    },
  });

  // Step 2: Insert-at-front iterations
  let currIdx = left - 1;   // 0-indexed current node being anchored

  for (let step = 0; step < right - left; step++) {
    // nxt = curr.next (index currIdx+1 initially, but we keep currIdx fixed)
    const nxtIdx = currIdx + 1;
    const nxtVal = list[nxtIdx];

    snap({
      title: { vi: `Bước ${step + 1}: kéo node [${nxtIdx + 1}]=${nxtVal} vào đầu đoạn`, en: `Step ${step + 1}: pull node [${nxtIdx + 1}]=${nxtVal} to the front` },
      highlight: [nxtIdx],
      mark: Array.from({ length: step + 1 }, (_, k) => left - 1 + k),
      codeLines: [8, 9, 10, 11],
      vars: [
        { name: "curr", value: `node [${currIdx + 1}] = ${list[currIdx]}` },
        { name: "nxt",  value: `node [${nxtIdx + 1}] = ${nxtVal}` },
        { name: "list (before)", value: `[${list.join(", ")}]` },
      ],
      note: {
        vi: `curr.next = nxt.next (bỏ qua nxt trong chuỗi). nxt.next = prev.next (nxt trỏ vào đầu đoạn). prev.next = nxt (cắm nxt vào ngay sau prev).`,
        en: `curr.next = nxt.next (detach nxt from the chain). nxt.next = prev.next (nxt points to current front of reversed segment). prev.next = nxt (splice nxt right after prev).`,
      },
    });

    // Simulate the pointer manipulation on the list array
    list.splice(nxtIdx, 1);
    const insertAt = prevIdx + 1;
    list.splice(insertAt, 0, nxtVal);
    // currIdx stays pointing to the same node (which shifted right by 1)
    currIdx = insertAt + 1;  // curr is now one position to the right of insert point

    snap({
      title: { vi: `Sau bước ${step + 1}: [${list.join("→")}]`, en: `After step ${step + 1}: [${list.join("→")}]` },
      highlight: [insertAt],
      mark: Array.from({ length: step + 2 }, (_, k) => left - 1 + k),
      codeLines: [8, 9, 10, 11],
      vars: [
        { name: "list", value: `[${list.join(", ")}]` },
        { name: "reversed so far", value: `[${list.slice(left - 1, left + step + 1).join(", ")}]` },
      ],
      note: {
        vi: `${nxtVal} đã được cắm vào đầu đoạn đảo. List = [${list.join(", ")}].`,
        en: `${nxtVal} is now spliced at the front of the reversed segment. List = [${list.join(", ")}].`,
      },
    });
  }

  snap({
    title: { vi: `Kết quả: [${list.join("→")}]`, en: `Result: [${list.join("→")}]` },
    highlight: [],
    mark: Array.from({ length: right - left + 1 }, (_, k) => left - 1 + k),
    final: true,
    codeLines: [13],
    vars: [
      { name: "answer", value: `[${list.join(", ")}]` },
      { name: "reversed segment", value: `[${list.slice(left - 1, right).join(", ")}]` },
    ],
    note: {
      vi: `Đoạn từ vị trí ${left} đến ${right} đã được đảo ngược trong O(1) extra space và chỉ một lần duyệt.`,
      en: `The segment from position ${left} to ${right} has been reversed in O(1) extra space with a single pass.`,
    },
  });

  return { original: vals, answer: list, steps };
}

module.exports = {
  92: {
    id: 92, difficulty: "medium", slug: "reverse-linked-list-ii",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Reverse Linked List II", en: "Reverse Linked List II" },
    titleVi: { vi: "Đảo ngược đoạn linked list từ left đến right", en: "Reverse a sublist from left to right" },
    statement: {
      vi: "Đảo ngược các node từ vị trí left đến right (1-indexed) trong một lần duyệt. Nhập giá trị list; left và right trong tham số.",
      en: "Reverse the nodes from position left to right (1-indexed) in one pass. Enter the list values; left and right as parameters.",
    },
    defaultInput: [1, 2, 3, 4, 5],
    inputKind: "integer",
    inputLabel: { vi: "Linked list", en: "Linked list" },
    extraParams: [
      { key: "left",  label: { vi: "left (1-indexed)", en: "left (1-indexed)" },  default: 2 },
      { key: "right", label: { vi: "right (1-indexed)", en: "right (1-indexed)" }, default: 4 },
    ],
    approach: [
      { vi: "Dùng dummy node để xử lý đồng nhất trường hợp left=1.", en: "Use a dummy node to handle left=1 uniformly." },
      { vi: "Tiến prev đến node ngay trước vị trí left.", en: "Advance prev to the node just before position left." },
      { vi: "Mẹo 'insert-at-front': right-left lần, kéo node curr.next ra và cắm vào ngay sau prev.", en: "'Insert-at-front' trick: repeat right-left times, pull curr.next out and splice it right after prev." },
    ],
    complexity: {
      time: "O(right - left + 1) ⊆ O(n)",
      space: "O(1)",
      note: { vi: "Một lần duyệt, không cần lưu trữ thêm.", en: "Single pass, no extra storage." },
    },
    code: [
      "class Solution:",
      "    def reverseBetween(self, head, left, right):",
      "        dummy = ListNode(0, head)",
      "        prev = dummy",
      "        for _ in range(left - 1):",
      "            prev = prev.next",
      "        curr = prev.next",
      "        for _ in range(right - left):",
      "            nxt = curr.next",
      "            curr.next = nxt.next",
      "            nxt.next = prev.next",
      "            prev.next = nxt",
      "        return dummy.next",
    ],
    builder: buildSteps92,
  },
  61: {
    id: 61, difficulty: "medium", slug: "rotate-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Rotate List", en: "Rotate List" },
    titleVi: { vi: "Xoay linked list phải k bước", en: "Rotate a linked list right by k" },
    statement: { vi: "Xoay linked list sang phải k vị trí. Nhập giá trị cách nhau dấu phẩy; k trong tham số.", en: "Rotate a linked list right by k places. Enter values comma-separated; k as a parameter." },
    defaultInput: [1, 2, 3, 4, 5], inputKind: "integer", inputLabel: { vi: "Linked list", en: "Linked list" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [{ vi: "Tính độ dài, nối đuôi vào đầu (vòng tròn).", en: "Compute the length, link the tail to the head (circular)." }, { vi: "k %= length; điểm cắt = length - k.", en: "k %= length; cut point = length - k." }, { vi: "Cắt sau điểm cắt, đầu mới là node kế.", en: "Break after the cut point; the new head is the next node." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Vài lượt tuyến tính.", en: "A few linear passes." } },
    code: ["class Solution:", "    def rotateRight(self, head, k):", "        if not head or not head.next or k == 0: return head", "        length, tail = 1, head", "        while tail.next: tail = tail.next; length += 1", "        k %= length", "        if k == 0: return head", "        tail.next = head; new_tail = head", "        for _ in range(length - k - 1): new_tail = new_tail.next", "        new_head = new_tail.next; new_tail.next = None; return new_head"],
    builder: buildSteps61,
  },
  82: {
    id: 82, difficulty: "medium", slug: "remove-duplicates-from-sorted-list-ii",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Remove Duplicates from Sorted List II", en: "Remove Duplicates from Sorted List II" },
    titleVi: { vi: "Xóa mọi node trùng (không giữ bản nào)", en: "Remove all duplicate nodes (keep none)" },
    statement: { vi: "Từ list đã sắp, xóa TẤT CẢ node có giá trị lặp lại (không giữ bản nào). Nhập giá trị đã sắp cách nhau dấu phẩy.", en: "From a sorted list, remove ALL nodes with duplicate values (keep none). Enter sorted values comma-separated." },
    defaultInput: [1, 2, 3, 3, 4, 4, 5], inputKind: "integer", inputLabel: { vi: "Linked list (đã sắp)", en: "Linked list (sorted)" }, extraParams: [],
    approach: [{ vi: "Dùng dummy node + con trỏ prev (node cuối chắc chắn giữ).", en: "Use a dummy node + prev pointer (last guaranteed-kept node)." }, { vi: "Nếu gặp run trùng, bỏ toàn bộ run.", en: "On a run of duplicates, skip the entire run." }, { vi: "Node duy nhất → prev tiến tới nó.", en: "A unique node → advance prev to it." }],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Một lượt.", en: "Single pass." } },
    code: ["class Solution:", "    def deleteDuplicates(self, head):", "        dummy = ListNode(0, head); prev = dummy", "        while head:", "            if head.next and head.val == head.next.val:", "                while head.next and head.val == head.next.val: head = head.next", "                prev.next = head.next", "            else: prev = prev.next", "            head = head.next", "        return dummy.next"],
    builder: buildSteps82,
  },
  148: {
    id: 148, difficulty: "medium", slug: "sort-list",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Sort List", en: "Sort List" },
    titleVi: { vi: "Sắp xếp linked list (merge sort)", en: "Sort a linked list (merge sort)" },
    statement: { vi: "Sắp xếp linked list tăng dần trong O(n log n). Nhập giá trị cách nhau dấu phẩy.", en: "Sort a linked list ascending in O(n log n). Enter values comma-separated." },
    defaultInput: [4, 2, 1, 3], inputKind: "integer", inputLabel: { vi: "Linked list", en: "Linked list" }, extraParams: [],
    approach: [{ vi: "Chia đôi bằng slow/fast pointer.", en: "Split in half via slow/fast pointers." }, { vi: "Đệ quy sắp mỗi nửa.", en: "Recursively sort each half." }, { vi: "Trộn hai nửa đã sắp.", en: "Merge the two sorted halves." }],
    complexity: { time: "O(n log n)", space: "O(log n)", note: { vi: "Merge sort, stack đệ quy O(log n).", en: "Merge sort, O(log n) recursion stack." } },
    code: ["class Solution:", "    def sortList(self, head):", "        if not head or not head.next: return head", "        slow, fast = head, head.next", "        while fast and fast.next: slow = slow.next; fast = fast.next.next", "        mid = slow.next; slow.next = None", "        left = self.sortList(head)", "        right = self.sortList(mid)", "        dummy = tail = ListNode()", "        while left and right:", "            if left.val <= right.val: tail.next, left = left, left.next", "            else: tail.next, right = right, right.next", "            tail = tail.next", "        tail.next = left or right; return dummy.next"],
    builder: buildSteps148,
  },
  460: {
    id: 460,
    difficulty: "hard",
    slug: "lfu-cache",
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "LFU Cache", en: "LFU Cache" },
    titleVi: { vi: "Bộ nhớ đệm LFU (hash map + bucket tần suất)", en: "LFU cache (hash map + frequency buckets)" },
    statement: {
      vi:
        "Thiết kế LFU Cache với get(key) và put(key, value) O(1). Khi đầy, xóa key ÍT DÙNG NHẤT; " +
        "nếu hòa tần suất thì xóa key CŨ NHẤT. Nhập capacity và dãy operations (mỗi dòng), " +
        "vd: put(1,1); put(2,2); get(1); put(3,3); get(2)",
      en:
        "Design an LFU Cache with O(1) get(key) and put(key, value). When full, evict the LEAST-FREQUENTLY-used key; " +
        "ties broken by LEAST-RECENTLY-used. Enter capacity and a sequence of operations (one per line), " +
        "e.g. put(1,1); put(2,2); get(1); put(3,3); get(2)",
    },
    defaultInput: "put(1,1); put(2,2); get(1); put(3,3); get(2); get(3); put(4,4); get(1); get(3); get(4)",
    inputKind: "string",
    inputLabel: { vi: "Operations (ngăn bởi ;)", en: "Operations (separated by ;)" },
    extraParams: [
      { key: "capacity", label: { vi: "capacity", en: "capacity" }, default: 2 },
    ],
    approach: [
      { vi: "val: key→value; freq: key→tần suất; buckets[f]: các key tần suất f theo thứ tự LRU.", en: "val: key→value; freq: key→frequency; buckets[f]: keys of frequency f in LRU order." },
      { vi: "min_freq theo dõi bucket có tần suất nhỏ nhất — nơi chứa key sẽ bị evict.", en: "min_freq tracks the smallest-frequency bucket — where the eviction victim lives." },
      { vi: "get/put trên key có sẵn → _touch: tăng tần suất, chuyển key sang bucket kế tiếp.", en: "get/put on an existing key → _touch: bump frequency, move the key to the next bucket." },
      { vi: "Khi đầy: xóa key ĐẦU bucket min_freq (ít dùng + cũ nhất). Key mới có freq=1, min_freq=1.", en: "When full: evict the FRONT key of the min_freq bucket (least-frequent + oldest). New keys get freq=1, min_freq=1." },
    ],
    complexity: {
      time: "O(1) get & put",
      space: "O(capacity)",
      note: {
        vi: "Mọi thao tác dùng hash map + OrderedDict nên trung bình O(1).",
        en: "All operations use hash maps + OrderedDict, so O(1) on average.",
      },
    },
    code: [
      "class LFUCache:",
      "    def __init__(self, capacity):",
      "        self.cap = capacity; self.min_freq = 0",
      "        self.val = {}; self.freq = {}",
      "        self.buckets = defaultdict(OrderedDict)",
      "    def _touch(self, key):",
      "        f = self.freq[key]; del self.buckets[f][key]",
      "        if not self.buckets[f]:",
      "            del self.buckets[f]",
      "            if self.min_freq == f: self.min_freq += 1",
      "        self.freq[key] = f + 1; self.buckets[f+1][key] = None",
      "    def get(self, key):",
      "        if key not in self.val: return -1",
      "        self._touch(key); return self.val[key]",
      "    def put(self, key, value):",
      "        if self.cap == 0: return",
      "        if key in self.val:",
      "            self.val[key] = value; self._touch(key); return",
      "        if len(self.val) >= self.cap:",
      "            k,_ = self.buckets[self.min_freq].popitem(last=False)",
      "            del self.val[k]; del self.freq[k]",
      "        self.val[key] = value; self.freq[key] = 1",
      "        self.buckets[1][key] = None; self.min_freq = 1",
    ],
    builder: buildSteps460,
  },
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
  432: {
    id: 432,
    difficulty: "hard",
    slug: "all-oone-data-structure",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "All O`one Data Structure", en: "All O`one Data Structure" },
    titleVi: { vi: "Cấu trúc dữ liệu O(1) cho mọi thao tác", en: "O(1) inc/dec/getMax/getMin structure" },
    statement: {
      vi:
        "Thiết kế cấu trúc lưu (key, count), hỗ trợ O(1) cho inc(key), dec(key), getMaxKey(), getMinKey(). " +
        "inc tăng count của key (tạo mới với count=1 nếu chưa tồn tại). dec giảm count của key (xóa key nếu count về 0). " +
        "getMaxKey/getMinKey trả về một key bất kỳ có count lớn nhất/nhỏ nhất, hoặc chuỗi rỗng nếu không có key.",
      en:
        "Design a structure storing (key, count) pairs supporting O(1) inc(key), dec(key), getMaxKey(), getMinKey(). " +
        "inc increases key's count (creating it with count=1 if new). dec decreases key's count (removing it if count hits 0). " +
        "getMaxKey/getMinKey return any key with the highest/lowest count, or an empty string if none exist.",
    },
    defaultInput: "inc a | inc a | inc b | getMaxKey | dec a | getMinKey",
    inputKind: "string",
    inputLabel: { vi: "Thao tác, ngăn cách bằng |", en: "Operations separated by |" },
    extraParams: [],
    approach: [
      { vi: "Doubly linked list các 'bucket', mỗi bucket giữ mọi key có ĐÚNG 1 count, sắp tăng dần từ head đến tail.", en: "A doubly linked list of 'buckets', each holding every key with the EXACT same count, increasing from head to tail." },
      { vi: "keyCount[key] = count hiện tại. keyBucket[key] = bucket đang chứa key.", en: "keyCount[key] = current count. keyBucket[key] = the bucket currently holding key." },
      { vi: "inc/dec: chuyển key sang bucket lân cận (tạo mới nếu chưa có count đó), rồi xóa bucket cũ nếu nó rỗng.", en: "inc/dec: move key to a neighboring bucket (creating it if that count doesn't exist yet), then delete the old bucket if it becomes empty." },
      { vi: "getMaxKey/getMinKey: lấy 1 key bất kỳ từ bucket ngay trước tail / ngay sau head.", en: "getMaxKey/getMinKey: grab any key from the bucket right before tail / right after head." },
    ],
    complexity: {
      time: "O(1) per operation",
      space: "O(n)",
      note: {
        vi: "Mỗi thao tác chỉ đổi vài pointer/bucket, không phụ thuộc số lượng key.",
        en: "Each operation only touches a few pointers/buckets, independent of the number of keys.",
      },
    },
    code: [
      "class Bucket:",                                              //  1
      "    def __init__(self, count):",                             //  2
      "        self.count = count",                                 //  3
      "        self.keys = set()",                                  //  4
      "        self.prev = None",                                   //  5
      "        self.next = None",                                   //  6
      "",                                                            //  7
      "class AllOne:",                                               //  8
      "    def __init__(self):",                                    //  9
      "        self.head = Bucket(0)",                               // 10
      "        self.tail = Bucket(0)",                               // 11
      "        self.head.next = self.tail",                         // 12
      "        self.tail.prev = self.head",                         // 13
      "        self.keyCount = {}",                                 // 14
      "        self.keyBucket = {}",                                // 15
      "",                                                            // 16
      "    def insert_after(self, bucket, count):",                 // 17
      "        new_bucket = Bucket(count)",                         // 18
      "        new_bucket.prev = bucket",                           // 19
      "        new_bucket.next = bucket.next",                      // 20
      "        bucket.next.prev = new_bucket",                      // 21
      "        bucket.next = new_bucket",                           // 22
      "        return new_bucket",                                  // 23
      "",                                                            // 24
      "    def remove_bucket(self, bucket):",                       // 25
      "        bucket.prev.next = bucket.next",                     // 26
      "        bucket.next.prev = bucket.prev",                     // 27
      "    def inc(self, key: str) -> None:",                       // 28
      "        if key not in self.keyCount:",                       // 29
      "            self.keyCount[key] = 1",                         // 30
      "            if self.head.next.count != 1:",                  // 31
      "                self.insert_after(self.head, 1)",             // 32
      "            target = self.head.next",                        // 33
      "        else:",                                               // 34
      "            old_count = self.keyCount[key]",                 // 35
      "            self.keyCount[key] = old_count + 1",              // 36
      "            bucket = self.keyBucket[key]",                    // 37
      "            bucket.keys.remove(key)",                         // 38
      "            target = bucket.next",                            // 39
      "            if target.count != old_count + 1:",               // 40
      "                target = self.insert_after(bucket, old_count + 1)", // 41
      "            if not bucket.keys:",                              // 42
      "                self.remove_bucket(bucket)",                  // 43
      "        target.keys.add(key)",                                 // 44
      "        self.keyBucket[key] = target",                         // 45
      "",                                                              // 46
      "    def dec(self, key: str) -> None:",                        // 47
      "        if key not in self.keyCount:",                        // 48
      "            return",                                           // 49
      "        old_count = self.keyCount[key]",                       // 50
      "        bucket = self.keyBucket[key]",                         // 51
      "        bucket.keys.remove(key)",                              // 52
      "        if old_count == 1:",                                   // 53
      "            del self.keyCount[key]",                           // 54
      "            del self.keyBucket[key]",                          // 55
      "        else:",                                                // 56
      "            self.keyCount[key] = old_count - 1",               // 57
      "            target = bucket.prev",                             // 58
      "            if target.count != old_count - 1:",                // 59
      "                target = self.insert_after(bucket.prev, old_count - 1)", // 60
      "            target.keys.add(key)",                             // 61
      "            self.keyBucket[key] = target",                     // 62
      "        if not bucket.keys:",                                  // 63
      "            self.remove_bucket(bucket)",                       // 64
      "",                                                              // 65
      "    def getMaxKey(self) -> str:",                              // 66
      "        if self.tail.prev is self.head:",                     // 67
      "            return \"\"",                                       // 68
      "        return next(iter(self.tail.prev.keys))",               // 69
      "",                                                              // 70
      "    def getMinKey(self) -> str:",                              // 71
      "        if self.head.next is self.tail:",                     // 72
      "            return \"\"",                                       // 73
      "        return next(iter(self.head.next.keys))",               // 74
    ],
    builder: buildSteps432,
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
  3507: {
    id: 3507,
    difficulty: "easy",
    slug: "minimum-pair-removal-to-sort-array-i",
    category: { key: "doubly-linked-list", vi: "Danh sách liên kết đôi", en: "Doubly Linked List" },
    title: { vi: "Minimum Pair Removal to Sort Array I", en: "Minimum Pair Removal to Sort Array I" },
    titleVi: { vi: "Số lần gộp cặp tối thiểu để sắp xếp mảng", en: "Minimum pair merges to sort the array" },
    statement: {
      vi:
        "Cho mảng nums. Lặp lại thao tác: chọn cặp liền kề có tổng NHỎ NHẤT (nếu có nhiều, chọn cặp bên trái nhất), " +
        "gộp 2 phần tử đó thành 1 (giá trị = tổng). Đếm số lần gộp tối thiểu để mảng trở thành không giảm (non-decreasing).",
      en:
        "Given nums. Repeatedly: pick the adjacent pair with the MINIMUM sum (leftmost wins ties), " +
        "merge them into one element equal to their sum. Return the minimum number of merges to make the array non-decreasing.",
    },
    defaultInput: [2, 1, 2],
    inputKind: "integer",
    inputLabel: { vi: "nums", en: "nums" },
    extraParams: [],
    approach: [
      { vi: "Mô hình hoá nums thành doubly linked list: mỗi node có prev/next.", en: "Model nums as a doubly linked list: each node has prev/next." },
      { vi: "Lặp: nếu không còn nghịch thế (a[i] > a[i+1]) → dừng.", en: "Loop: if no inversion (a[i] > a[i+1]) remains → stop." },
      { vi: "Ngược lại, quét tìm cặp liền kề tổng nhỏ nhất (trái nhất khi hoà), gộp thành 1 node, nối lại prev/next.", en: "Otherwise scan for the leftmost minimum-sum adjacent pair, merge into one node, relink prev/next." },
    ],
    complexity: {
      time: "O(n²)",
      space: "O(n)",
      note: {
        vi: "Mỗi lần gộp giảm 1 node, tối đa n-1 lần gộp; mỗi lần quét toàn bộ list O(n) để tìm min-pair và kiểm tra inversion.",
        en: "Each merge removes one node, at most n-1 merges; each merge scans the whole list O(n) to find the min-pair and check inversions.",
      },
    },
    code: [
      "class Node:",
      "    __slots__ = ('val', 'prev', 'next')",
      "    def __init__(self, val):",
      "        self.val = val",
      "        self.prev = None",
      "        self.next = None",
      "",
      "class Solution:",
      "    def minimumPairRemoval(self, nums):",
      "        n = len(nums)",
      "        if n <= 1:",
      "            return 0",
      "",
      "        head = Node(nums[0])",
      "        cur = head",
      "        for v in nums[1:]:",
      "            node = Node(v)",
      "            cur.next = node",
      "            node.prev = cur",
      "            cur = node",
      "",
      "        def has_inversion():",
      "            node = head",
      "            while node.next:",
      "                if node.val > node.next.val:",
      "                    return True",
      "                node = node.next",
      "            return False",
      "",
      "        ops = 0",
      "        while has_inversion():",
      "            best_sum = float('inf')",
      "            best_node = None",
      "            node = head",
      "            while node.next:",
      "                s = node.val + node.next.val",
      "                if s < best_sum:",
      "                    best_sum = s",
      "                    best_node = node",
      "                node = node.next",
      "",
      "            nxt = best_node.next",
      "            best_node.val += nxt.val",
      "            best_node.next = nxt.next",
      "            if nxt.next:",
      "                nxt.next.prev = best_node",
      "",
      "            ops += 1",
      "",
      "        return ops",
    ],
    builder: buildSteps3507,
  },
};
