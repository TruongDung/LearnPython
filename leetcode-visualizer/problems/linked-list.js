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
};
