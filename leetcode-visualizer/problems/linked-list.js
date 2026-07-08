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
    const nodes = values.map((v, i) => {
      let label = `${v}`;
      const tags = [];
      if (i === 0) tags.push("HEAD");
      if (i === slowIdx) tags.push("🐢S");
      if (i === fastIdx) tags.push("🐇F");
      if (tags.length > 0) label += `\n${tags.join(" ")}`;
      return { id: i, label };
    });
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
      hlEdges: fast >= 0 && slow !== fast ? [[slow > 0 ? slow - 1 : (pos >= 0 ? n - 1 : -1), slow]] : [],
      vars: [
        { name: "step", value: step + 1 },
        { name: "slow", value: slow >= 0 ? `node ${slow} (val=${values[slow]})` : "null" },
        { name: "fast", value: fast >= 0 ? `node ${fast} (val=${values[fast]})` : "null" },
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
    defaultInput: "3,2,0,-4",
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
};
