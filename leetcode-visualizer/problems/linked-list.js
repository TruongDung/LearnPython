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
 * Model the browser history as a linear list plus one current index.
 * visit(url) discards all forward history, appends url, and moves current there.
 */
function buildSteps1472(input) {
  const raw = String(input || "").trim();
  const steps = [];

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

  let history = [commands[0].url || "leetcode.com"];
  let index = 0;
  const outputs = [null];

  function shortUrl(url) {
    return String(url || "").replace(/^https?:\/\//, "");
  }

  function snapshot(opts) {
    const viewHistory = opts.history || history;
    const current = opts.index == null ? index : opts.index;
    const nodes = viewHistory.map((url, i) => ({ id: i, label: shortUrl(url) }));
    const edges = [];
    for (let i = 0; i < viewHistory.length - 1; i++) edges.push({ u: i, v: i + 1, w: "" });

    const annotations = {};
    if (current >= 0 && current < viewHistory.length) annotations[current] = "current";
    if (viewHistory.length > 0 && current !== 0) annotations[0] = "home";
    for (const [nodeIdx, label] of Object.entries(opts.annotations || {})) {
      annotations[nodeIdx] = annotations[nodeIdx] ? `${annotations[nodeIdx]}\n${label}` : label;
    }

    steps.push({
      title: opts.title,
      arr: [],
      graph: {
        nodes,
        edges,
        annotations,
        hlNodes: opts.hlNodes || (current >= 0 ? [current] : []),
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
    title: { vi: `BrowserHistory("${shortUrl(history[0])}")`, en: `BrowserHistory("${shortUrl(history[0])}")` },
    codeLines: [3],
    vars: [{ name: "output", value: "null" }],
    note: {
      vi: `Khởi tạo history với homepage "${shortUrl(history[0])}".`,
      en: `Initialize history with homepage "${shortUrl(history[0])}".`,
    },
  });

  snapshot({
    title: { vi: "index = 0", en: "index = 0" },
    codeLines: [4],
    vars: [{ name: "index", value: index }],
    note: {
      vi: "Con trỏ current bắt đầu ở homepage.",
      en: "The current pointer starts at the homepage.",
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
        codeLines: [6],
        visitedNodes: discarded,
        vars: [
          { name: "url", value: shortUrl(url) },
          { name: "discard forward", value: discarded.length ? discarded.map((i) => shortUrl(history[i])).join(", ") : "none" },
        ],
        note: {
          vi: "Khi vào trang mới, mọi history phía trước current sẽ bị xoá.",
          en: "When visiting a new page, all forward history after current is discarded.",
        },
      });

      history = history.slice(0, index + 1);
      snapshot({
        title: { vi: "Cắt forward history", en: "Trim forward history" },
        codeLines: [6],
        vars: [{ name: "history after trim", value: `[${history.map((item) => shortUrl(item)).join(", ")}]` }],
        note: {
          vi: "Giữ lại history từ homepage đến current.",
          en: "Keep only history from homepage through current.",
        },
      });

      history.push(url);
      snapshot({
        title: { vi: `Thêm "${shortUrl(url)}"`, en: `Append "${shortUrl(url)}"` },
        codeLines: [7],
        index: history.length - 2,
        hlNodes: [history.length - 1],
        annotations: { [history.length - 1]: "new" },
        vars: [{ name: "history append", value: shortUrl(url) }],
        note: {
          vi: `Thêm "${shortUrl(url)}" vào cuối history.`,
          en: `Append "${shortUrl(url)}" to the end of history.`,
        },
      });

      index = history.length - 1;
      outputs.push(null);
      snapshot({
        title: { vi: `current = "${shortUrl(history[index])}"`, en: `current = "${shortUrl(history[index])}"` },
        codeLines: [8],
        vars: [
          { name: "index", value: index },
          { name: "output", value: "null" },
        ],
        note: {
          vi: "Sau visit, current trỏ tới trang vừa thêm.",
          en: "After visit, current points to the newly appended page.",
        },
      });
    } else if (command.op === "back") {
      const amount = command.steps;
      const oldIndex = index;
      const nextIndex = Math.max(0, index - amount);

      snapshot({
        title: { vi: `back(${amount})`, en: `back(${amount})` },
        codeLines: [11],
        hlNodes: [oldIndex, nextIndex].filter((v, i, arr) => arr.indexOf(v) === i),
        vars: [
          { name: "steps", value: amount },
          { name: "max(0, index-steps)", value: nextIndex },
        ],
        note: {
          vi: `Đi lùi tối đa ${amount} bước, nhưng không vượt qua homepage.`,
          en: `Move back up to ${amount} step(s), but not before the homepage.`,
        },
      });

      index = nextIndex;
      outputs.push(history[index]);
      snapshot({
        title: { vi: `return "${shortUrl(history[index])}"`, en: `return "${shortUrl(history[index])}"` },
        codeLines: [12],
        vars: [{ name: "output", value: shortUrl(history[index]) }],
        note: {
          vi: `Current bây giờ là "${shortUrl(history[index])}".`,
          en: `Current is now "${shortUrl(history[index])}".`,
        },
      });
    } else if (command.op === "forward") {
      const amount = command.steps;
      const oldIndex = index;
      const nextIndex = Math.min(history.length - 1, index + amount);

      snapshot({
        title: { vi: `forward(${amount})`, en: `forward(${amount})` },
        codeLines: [15],
        hlNodes: [oldIndex, nextIndex].filter((v, i, arr) => arr.indexOf(v) === i),
        vars: [
          { name: "steps", value: amount },
          { name: "min(last, index+steps)", value: nextIndex },
        ],
        note: {
          vi: `Đi tới tối đa ${amount} bước, nhưng không vượt quá trang mới nhất còn trong history.`,
          en: `Move forward up to ${amount} step(s), but not beyond the newest page in history.`,
        },
      });

      index = nextIndex;
      outputs.push(history[index]);
      snapshot({
        title: { vi: `return "${shortUrl(history[index])}"`, en: `return "${shortUrl(history[index])}"` },
        codeLines: [16],
        vars: [{ name: "output", value: shortUrl(history[index]) }],
        note: {
          vi: `Current bây giờ là "${shortUrl(history[index])}".`,
          en: `Current is now "${shortUrl(history[index])}".`,
        },
      });
    }
  }

  snapshot({
    title: { vi: "Kết quả", en: "Result" },
    codeLines: [16],
    vars: [
      { name: "outputs", value: `[${outputs.map((item) => item == null ? "null" : `"${shortUrl(item)}"`).join(", ")}]` },
      { name: "current", value: shortUrl(history[index]) },
    ],
    note: {
      vi: `Hoàn tất ${commands.length} thao tác. Current cuối cùng là "${shortUrl(history[index])}".`,
      en: `Finished ${commands.length} operation(s). Final current page is "${shortUrl(history[index])}".`,
    },
    final: true,
  });

  return {
    original: raw,
    answer: outputs,
    steps,
  };
}

module.exports = {
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
    category: { key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" },
    title: { vi: "Design Browser History", en: "Design Browser History" },
    titleVi: { vi: "Thiết kế lịch sử trình duyệt", en: "Design browser history" },
    statement: {
      vi: "Thiết kế BrowserHistory với visit(url), back(steps), forward(steps). visit xoá forward history rồi thêm trang mới.",
      en: "Design BrowserHistory with visit(url), back(steps), and forward(steps). visit discards forward history and appends a new page.",
    },
    defaultInput: "leetcode.com | visit google.com | visit facebook.com | visit youtube.com | back 1 | back 1 | forward 1 | visit linkedin.com | forward 2 | back 2 | back 7",
    inputKind: "string",
    inputLabel: { vi: "Các thao tác, ngăn bằng |", en: "Operations separated by |" },
    extraParams: [],
    approach: [
      { vi: "Dùng mảng history và chỉ số index đại diện trang hiện tại.", en: "Use a history array and an index pointing to the current page." },
      { vi: "visit(url): xoá mọi phần tử sau index, append url, rồi index trỏ tới cuối.", en: "visit(url): drop everything after index, append url, then move index to the end." },
      { vi: "back/forward: clamp index trong [0, history.length-1].", en: "back/forward: clamp index inside [0, history.length-1]." },
    ],
    complexity: {
      time: "O(n) visit, O(1) back/forward",
      space: "O(n)",
      note: {
        vi: "n là số trang trong history. visit có thể cắt forward history; back/forward chỉ cập nhật index.",
        en: "n is the number of pages in history. visit may trim forward history; back/forward only update the index.",
      },
    },
    code: [
      "class BrowserHistory:",
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
