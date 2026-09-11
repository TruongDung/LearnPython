// LeetCode Visualizer — BFS / level-order binary-tree problems.
// These problems share one level board, while each builder supplies the
// problem-specific comparison, metric, pointer, or transformation.

const TREE_CAT = { key: "binary-tree", vi: "Cây nhị phân", en: "Binary Tree" };
const BFS_TAG = { key: "bfs", vi: "BFS / Theo tầng", en: "BFS / Level Order" };
const HEAP_TAG = { key: "heap", vi: "Heap / Hàng đợi ưu tiên", en: "Heap / Priority Queue" };
const SORTING_TAG = { key: "sorting", vi: "Sắp xếp", en: "Sorting" };

function parseLevelTree(input) {
  const raw = Array.isArray(input)
    ? input.slice()
    : String(input ?? "").trim().replace(/^\[|\]$/g, "").split(",").map((value) => value.trim());
  if (raw.length === 1 && (raw[0] === "" || raw[0] === null || raw[0] === undefined)) return null;
  const values = raw.map((value) => {
    if (value === null || value === undefined || /^(null|none|#)?$/i.test(String(value).trim())) return null;
    const number = Number(value);
    if (!Number.isInteger(number)) throw new Error("Tree values must be integers or null");
    return number;
  });
  if (values.length > 63) throw new Error("Visualization supports up to 63 level-order tokens");
  if (!values.length || values[0] === null) {
    if (values.slice(1).some((value) => value !== null)) throw new Error("A non-null node cannot appear after an empty root");
    return null;
  }

  let nextId = 0;
  const root = { id: nextId++, val: values[0], original: values[0], left: null, right: null, depth: 0, slot: 0 };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const parent = queue.shift();
    for (const side of ["left", "right"]) {
      if (index >= values.length) break;
      const value = values[index++];
      if (value === null) continue;
      const child = {
        id: nextId++, val: value, original: value, left: null, right: null,
        depth: parent.depth + 1,
        slot: parent.slot * 2 + (side === "left" ? 0 : 1),
      };
      parent[side] = child;
      queue.push(child);
    }
  }
  if (values.slice(index).some((value) => value !== null)) throw new Error("Invalid level-order tree: node has no parent");
  return root;
}

function levelsOf(root) {
  const levels = [];
  let queue = root ? [root] : [];
  while (queue.length) {
    levels.push(queue);
    const next = [];
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return levels;
}

function serializeTree(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      result.push(null);
      continue;
    }
    result.push(node.val);
    queue.push(node.left, node.right);
  }
  while (result.at(-1) === null) result.pop();
  return result;
}

function formatNested(levels) {
  return JSON.stringify(levels.map((level) => level.map((node) => node.val)));
}

function treeState(root, options = {}) {
  const active = new Set(options.active || []);
  const done = new Set(options.done || []);
  const selected = new Set(options.selected || []);
  const bad = new Set(options.bad || []);
  const sub = options.sub || {};
  const annotations = options.annotations || {};
  const nodes = [];
  let x = 0;
  function visit(node, parentId) {
    if (!node) return;
    visit(node.left, node.id);
    const nodeX = x++;
    visit(node.right, node.id);
    nodes.push({
      id: node.id,
      label: String(node.val),
      x: nodeX,
      y: node.depth,
      parentId,
      hl: active.has(node.id),
      isWord: done.has(node.id) || selected.has(node.id),
      isPruned: bad.has(node.id),
      sub: sub[node.id],
    });
  }
  visit(root, null);
  return { nodes, annotations, showLevels: true, levelLabelGutter: 64 };
}

const STAGES = [
  { vi: "Lấy một tầng", en: "Take one level" },
  { vi: "Tính / kiểm tra", en: "Compute / check" },
  { vi: "Lưu kết quả", en: "Save result" },
  { vi: "Kết luận", en: "Finish" },
];

function levelTokens(nodes, extras = {}) {
  return nodes.map((node, index) => ({
    id: node.id,
    value: node.val,
    tone: extras.tones?.[index] || "neutral",
    meta: extras.meta?.[index],
  }));
}

function makeStep({
  problemId, mode, root, title, note, codeLines, stage = 0, event = "level",
  queue = [], rows = [], active = [], done = [], selected = [], bad = [], sub = {}, annotations = {},
  cards = [], formula = null, queueNote = null, status = "checking", final = false, vars = [], result = null,
}) {
  return {
    title, note, codeLines, vars, final,
    arr: [], highlight: [], mark: [],
    tree: treeState(root, { active, done, selected, bad, sub, annotations }),
    bfsLevelView: {
      problemId, mode, stages: STAGES, stage, event, status,
      queue: queue.map((entry) => {
        const node = entry && entry.node ? entry.node : entry;
        return {
          id: node?.id,
          value: node?.val ?? entry?.value,
          role: entry?.role,
          label: entry?.label,
          meta: entry?.meta,
        };
      }),
      rows: rows.map((row) => ({ ...row, values: (row.values || []).map((value) => ({ ...value })) })),
      cards, formula, queueNote, result,
    },
  };
}

function introStep(problemId, mode, root, title, note, codeLines = [3]) {
  return makeStep({
    problemId, mode, root, title, note, codeLines, event: "intro", stage: 0,
    queue: root ? [root] : [],
    cards: [
      { label: { vi: "QUEUE", en: "QUEUE" }, value: root ? `[${root.val}]` : "[]" },
      { label: { vi: "QUY TẮC", en: "RULE" }, value: { vi: "xử lý trọn từng tầng", en: "finish one level at a time" } },
    ],
  });
}

function emptyResult(problemId, mode, root, answer, codeLine, display = answer) {
  return makeStep({
    problemId, mode, root,
    title: { vi: "Cây rỗng", en: "Empty tree" },
    note: { vi: `Không có tầng nào để xử lý; trả về ${display}.`, en: `There is no level to process; return ${display}.` },
    codeLines: [codeLine], stage: 3, event: "done", status: "success", final: true,
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: display, tone: "success" }], result: display,
  });
}

// 107 — collect top-down, then reverse only the result rows.
function build107(input) {
  const root = parseLevelTree(input);
  const steps = [introStep(107, "bottom-up", root,
    { vi: "BFS vẫn đọc từ trên xuống", en: "BFS still reads top to bottom" },
    { vi: "Thu thập từng tầng như BFS bình thường; chỉ đảo danh sách các tầng một lần ở cuối.", en: "Collect levels with normal BFS; reverse the list of levels only once at the end." })];
  if (!root) return { input, answer: "[]", steps: [emptyResult(107, "bottom-up", root, "[]", 3)] };
  const levels = levelsOf(root);
  const rows = [];
  const done = new Set();
  levels.forEach((level, index) => {
    level.forEach((node) => done.add(node.id));
    rows.push({ level: index, label: { vi: `Tầng ${index}`, en: `Level ${index}` }, values: levelTokens(level), metric: { label: "append", value: `[${level.map((n) => n.val).join(", ")}]` } });
    steps.push(makeStep({
      problemId: 107, mode: "bottom-up", root, stage: 1, event: "collect", title: { vi: `Thu thập tầng ${index}`, en: `Collect level ${index}` },
      note: { vi: `Tạm thời result theo thứ tự top-down: ${formatNested(levels.slice(0, index + 1))}.`, en: `Temporary top-down result: ${formatNested(levels.slice(0, index + 1))}.` },
      codeLines: [7, 8, 9], queue: levels[index + 1] || [], rows, active: level.map((n) => n.id), done,
      cards: [{ label: "level", value: index }, { label: "top-down", value: formatNested(levels.slice(0, index + 1)) }],
    }));
  });
  const answerRows = [...levels].reverse().map((level) => level.map((node) => node.val));
  steps.push(makeStep({
    problemId: 107, mode: "bottom-up", root, stage: 3, event: "reverse", status: "success", final: true,
    title: { vi: "Đảo thứ tự các tầng", en: "Reverse the level order" },
    note: { vi: "Giá trị bên trong mỗi tầng giữ nguyên trái → phải; chỉ thứ tự tầng bị đảo.", en: "Values inside each level remain left → right; only the level order is reversed." },
    codeLines: [13], rows: [...rows].reverse().map((row, index) => ({ ...row, displayLevel: index, tone: "success" })), done,
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: JSON.stringify(answerRows), tone: "success" }], result: JSON.stringify(answerRows),
  }));
  return { input, answer: JSON.stringify(answerRows), steps };
}

function build515(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: "[]", steps: [emptyResult(515, "level-max", root, "[]", 3)] };
  const steps = [introStep(515, "level-max", root,
    { vi: "Giữ maximum của từng tầng", en: "Keep each level's maximum" },
    { vi: "Bấm Next để theo đúng từng dòng: khóa size, pop một node, cập nhật level_max, rồi enqueue từng child.", en: "Press Next to follow each line: lock size, pop one node, update level_max, then enqueue each child." })];
  const queue = [root];
  const answer = [];
  const completedRows = [];
  const processed = new Set();
  const winners = new Set();
  const sub = {};
  const maxText = (value) => value === -Infinity ? "−∞" : value === null || value === undefined ? "—" : value;
  const queueText = () => queue.map((node) => node.val);
  const answerText = () => `[${answer.join(", ")}]`;
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const varsSnapshot = ({ size = "—", i = "—", node = null, levelMax = "—" } = {}) => [
    { name: "queue", value: queueText() },
    { name: "answer", value: answer.slice() },
    { name: "size", value: size },
    { name: "i", value: i },
    { name: "node", value: node ? node.val : "—" },
    { name: "level_max", value: maxText(levelMax) },
  ];
  const currentRow = ({ level, nodes, processedCount = 0, currentIndex = -1, levelMax = null, winner = null, state = "waiting", complete = false }) => ({
    level,
    status: complete ? "sorted" : undefined,
    values: nodes.map((node, index) => {
      let tone = "neutral";
      let meta = index < processedCount ? "checked" : "waiting";
      if (winner && node.id === winner.id) { tone = "success"; meta = "level_max"; }
      if (index === currentIndex) {
        tone = state === "new-max" ? "success" : state === "keep-max" ? "neutral" : "warning";
        meta = state === "new-max" ? "new max" : state === "keep-max" ? "≤ max" : state;
      }
      return { id: node.id, value: node.val, tone, meta };
    }),
    metric: { label: "level_max", value: levelMax === null ? "not set" : maxText(levelMax) },
  });
  const debugStep = ({
    level, nodes, size, i = "—", node = null, levelMax = "—", winner = null,
    currentIndex = -1, processedCount = 0, rowState = "waiting", complete = false,
    currentCount = 0, title, note, codeLine, stage = 1, event, formula = null,
    active = [], status = "checking", final = false, result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, currentRow({ level, nodes, processedCount, currentIndex, levelMax, winner, state: rowState, complete })]
      : completedRows;
    steps.push(makeStep({
      problemId: 515, mode: "level-max", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: queueSnapshot(currentCount),
      queueNote: { vi: "vàng = tầng này · xanh dương = tầng kế", en: "amber = this level · blue = next level" },
      active, done: processed, selected: [...winners, ...(winner ? [winner.id] : [])], sub,
      formula,
      vars: varsSnapshot({ size, i, node, levelMax }),
      cards: [
        { label: "level", value: level ?? "—" },
        { label: { vi: "size (đã khóa)", en: "size (locked)" }, value: size ?? "—", detail: { vi: "chỉ pop đúng size node", en: "pop exactly size nodes" } },
        { label: "i / size", value: Number.isInteger(i) ? `${i} / ${size}` : "—" },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: "level_max", value: maxText(levelMax), tone: Number.isFinite(levelMax) ? "success" : "neutral" },
        { label: "answer", value: answerText() },
      ],
    }));
  };

  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "guard", codeLine: 3,
    title: { vi: "Kiểm tra root có rỗng không", en: "Check whether root is empty" },
    note: { vi: `root = ${root.val} nên điều kiện \`not root\` là False; tiếp tục BFS.`, en: `root = ${root.val}, so \`not root\` is False; continue into BFS.` },
    formula: "not root = False",
  });
  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "init", codeLine: 4,
    title: { vi: "Khởi tạo queue và answer", en: "Initialize queue and answer" },
    note: { vi: "Đưa root vào queue; answer bắt đầu rỗng.", en: "Put the root in the queue; answer starts empty." },
    formula: `queue = [${root.val}] · answer = []`,
  });

  let level = 0;
  while (queue.length) {
    const size = queue.length;
    const nodes = queue.slice(0, size);
    debugStep({
      level, nodes, size, currentCount: size, stage: 0, event: "while-check", codeLine: 5,
      title: { vi: `Queue chưa rỗng: bắt đầu tầng ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Queue hiện có [${queueText().join(", ")}], nên vòng while chạy tiếp.`, en: `The queue is [${queueText().join(", ")}], so the while loop continues.` },
      formula: "bool(queue) = True",
    });
    debugStep({
      level, nodes, size, currentCount: size, stage: 0, event: "lock-size", codeLine: 6,
      title: { vi: `Khóa size = ${size}`, en: `Lock size = ${size}` },
      note: { vi: "Child được enqueue sau đó không thuộc vòng for hiện tại; chúng chờ tầng kế tiếp.", en: "Children enqueued later do not belong to this for-loop; they wait for the next level." },
      formula: `size = len(queue) = ${size}`,
    });

    let levelMax = -Infinity;
    let winner = null;
    debugStep({
      level, nodes, size, levelMax, currentCount: size, event: "reset-max", codeLine: 7,
      title: { vi: "Reset level_max về −∞", en: "Reset level_max to −∞" },
      note: { vi: "Mỗi tầng phải bắt đầu một maximum mới, kể cả khi mọi giá trị đều âm.", en: "Each level needs a fresh maximum, including levels containing only negative values." },
      formula: "level_max = −∞",
    });

    for (let i = 0; i < size; i++) {
      const remainingBeforePop = size - i;
      const node = queue[0];
      debugStep({
        level, nodes, size, i, node, levelMax, winner, currentIndex: i, processedCount: i,
        currentCount: remainingBeforePop, rowState: "front", event: "loop", codeLine: 8,
        title: { vi: `Lượt i = ${i}: xử lý FRONT = ${node.val}`, en: `Iteration i = ${i}: process FRONT = ${node.val}` },
        note: { vi: `Đây là node thứ ${i + 1}/${size} của tầng ${level}.`, en: `This is node ${i + 1}/${size} in level ${level}.` },
        formula: `i = ${i} < size = ${size}`,
        active: [node.id],
      });

      queue.shift();
      processed.add(node.id);
      debugStep({
        level, nodes, size, i, node, levelMax, winner, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "popped", event: "pop", codeLine: 9,
        title: { vi: `Pop ${node.val} khỏi đầu queue`, en: `Pop ${node.val} from the queue front` },
        note: { vi: `Queue sau popleft: [${queueText().join(", ")}].`, en: `Queue after popleft: [${queueText().join(", ")}].` },
        formula: `node = queue.popleft() = ${node.val}`,
        active: [node.id],
      });

      const previousMax = levelMax;
      debugStep({
        level, nodes, size, i, node, levelMax: previousMax, winner, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "compare", event: "compare", codeLine: 10,
        title: { vi: `So ${node.val} với level_max = ${maxText(previousMax)}`, en: `Compare ${node.val} with level_max = ${maxText(previousMax)}` },
        note: { vi: "Chưa thay đổi biến; bước kế tiếp sẽ cho thấy kết quả của max(...).", en: "No variable has changed yet; the next step shows the result of max(...)." },
        formula: `max(${maxText(previousMax)}, ${node.val}) = ?`,
        active: [node.id],
      });

      const isNewMax = node.val > levelMax;
      if (isNewMax) {
        if (winner && !winners.has(winner.id)) delete sub[winner.id];
        levelMax = node.val;
        winner = node;
      }
      if (winner) sub[winner.id] = `level_max = ${levelMax}`;
      debugStep({
        level, nodes, size, i, node, levelMax, winner, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: isNewMax ? "new-max" : "keep-max", event: isNewMax ? "new-max" : "keep-max", codeLine: 10,
        title: isNewMax
          ? { vi: `Cập nhật level_max = ${levelMax}`, en: `Update level_max = ${levelMax}` }
          : { vi: `Giữ level_max = ${levelMax}`, en: `Keep level_max = ${levelMax}` },
        note: isNewMax
          ? { vi: `${node.val} lớn hơn maximum cũ, nên node này trở thành ứng viên xanh.`, en: `${node.val} is greater than the old maximum, so this node becomes the green candidate.` }
          : { vi: `${node.val} không lớn hơn ${levelMax}; ứng viên hiện tại vẫn giữ nguyên.`, en: `${node.val} is not greater than ${levelMax}; the current candidate stays.` },
        formula: `max(${maxText(previousMax)}, ${node.val}) = ${levelMax}`,
        active: [node.id],
      });

      if (node.left) queue.push(node.left);
      debugStep({
        level, nodes, size, i, node, levelMax, winner, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: winner?.id === node.id ? "new-max" : "checked",
        event: node.left ? "enqueue-left" : "skip-left", codeLine: 11,
        title: node.left
          ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left
          ? { vi: `${node.left.val} nằm ở phần xanh dương của queue: chỉ xử lý ở tầng kế tiếp.`, en: `${node.left.val} sits in the blue part of the queue and is processed only on the next level.` }
          : { vi: "Không có gì được thêm vào queue.", en: "Nothing is added to the queue." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
        active: [node.id],
      });

      if (node.right) queue.push(node.right);
      debugStep({
        level, nodes, size, i, node, levelMax, winner, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: winner?.id === node.id ? "new-max" : "checked",
        event: node.right ? "enqueue-right" : "skip-right", codeLine: 12,
        title: node.right
          ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right
          ? { vi: `${node.right.val} cũng chờ ở tầng kế tiếp; size vẫn cố định là ${size}.`, en: `${node.right.val} also waits for the next level; size remains locked at ${size}.` }
          : { vi: `Queue giữ nguyên; vòng for vẫn chỉ chạy ${size} lượt.`, en: `The queue is unchanged; the for-loop still runs exactly ${size} times.` },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
        active: [node.id],
      });
    }

    answer.push(levelMax);
    winners.add(winner.id);
    completedRows.push(currentRow({ level, nodes, processedCount: size, levelMax, winner, complete: true }));
    debugStep({
      level, size, levelMax, winner, currentCount: 0, stage: 2, event: "append-level", codeLine: 13,
      title: { vi: `Chốt tầng ${level}: append ${levelMax}`, en: `Finish level ${level}: append ${levelMax}` },
      note: { vi: `Đã pop đủ ${size} node; answer trở thành ${answerText()}.`, en: `All ${size} nodes were popped; answer is now ${answerText()}.` },
      formula: `answer.append(${levelMax}) → ${answerText()}`,
    });
    level += 1;
  }

  debugStep({
    level, size: 0, currentCount: 0, stage: 0, event: "while-stop", codeLine: 5,
    title: { vi: "Queue rỗng: thoát vòng while", en: "Queue is empty: exit the while loop" },
    note: { vi: "Không còn node nào của tầng hiện tại hoặc tầng kế tiếp.", en: "No nodes remain in either the current or next level." },
    formula: "bool(queue) = False",
  });
  debugStep({
    level, size: 0, currentCount: 0, stage: 3, event: "done", codeLine: 14, status: "success", final: true, result: answerText(),
    title: { vi: "Trả về maximum của từng tầng", en: "Return every level maximum" },
    note: { vi: "Mỗi hàng xanh đã được chốt đúng một giá trị lớn nhất.", en: "Each green row has exactly one finalized maximum." },
    formula: `return ${answerText()}`,
  });
  return { input, answer: JSON.stringify(answer), steps };
}

function build513(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: null, steps: [emptyResult(513, "bottom-left", root, null, 3, "None")] };
  const steps = [introStep(513, "bottom-left", root,
    { vi: "Node đầu tiên của mỗi tầng là bên trái nhất", en: "The first node of a level is its leftmost" },
    { vi: "Bấm Next để theo từng dòng: khóa size, pop FRONT, kiểm tra i == 0, cập nhật answer rồi enqueue child.", en: "Press Next to follow each line: lock size, pop FRONT, check i == 0, update answer, then enqueue each child." })];
  const queue = [root];
  const completedRows = [];
  const processed = new Set();
  const sub = {};
  let answer = null;
  let candidate = null;
  const queueText = () => queue.map((node) => node.val);
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const varsSnapshot = ({ size = "—", i = "—", node = null, condition = "—" } = {}) => [
    { name: "queue", value: queueText() },
    { name: "answer", value: answer ?? "—" },
    { name: "size", value: size },
    { name: "i", value: i },
    { name: "node", value: node ? node.val : "—" },
    { name: "i == 0", value: condition },
  ];
  const currentRow = ({ level, nodes, processedCount = 0, currentIndex = -1, leftmost = null, state = "waiting", complete = false }) => ({
    level,
    status: complete ? "sorted" : undefined,
    values: nodes.map((node, index) => {
      let tone = "neutral";
      let meta = index < processedCount ? "checked" : "waiting";
      if (leftmost && node.id === leftmost.id) { tone = "success"; meta = "leftmost"; }
      if (index === currentIndex) {
        tone = state === "leftmost" ? "success" : state === "not-first" ? "neutral" : "warning";
        meta = state === "leftmost" ? "leftmost" : state === "not-first" ? "not first" : state;
      }
      return { id: node.id, value: node.val, tone, meta };
    }),
    metric: { label: "answer", value: leftmost ? leftmost.val : "pending" },
  });
  const debugStep = ({
    level, nodes, size, i = "—", node = null, condition = "—", leftmost = null,
    currentIndex = -1, processedCount = 0, rowState = "waiting", complete = false,
    currentCount = 0, title, note, codeLine, stage = 1, event, formula = null,
    active = [], status = "checking", final = false, result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, currentRow({ level, nodes, processedCount, currentIndex, leftmost, state: rowState, complete })]
      : completedRows;
    steps.push(makeStep({
      problemId: 513, mode: "bottom-left", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: queueSnapshot(currentCount),
      queueNote: { vi: "vàng = tầng này · xanh dương = tầng kế", en: "amber = this level · blue = next level" },
      active, done: processed, selected: candidate ? [candidate.id] : [], sub,
      formula,
      vars: varsSnapshot({ size, i, node, condition }),
      cards: [
        { label: "level", value: level ?? "—" },
        { label: { vi: "size (đã khóa)", en: "size (locked)" }, value: size ?? "—", detail: { vi: "chỉ pop đúng size node", en: "pop exactly size nodes" } },
        { label: "i / size", value: Number.isInteger(i) ? `${i} / ${size}` : "—" },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: "i == 0", value: condition === true ? "True" : condition === false ? "False" : "—", tone: condition === true ? "success" : "neutral" },
        { label: "answer", value: answer ?? "—", tone: answer !== null ? "success" : "neutral" },
      ],
    }));
  };

  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "init-queue", codeLine: 3,
    title: { vi: "Đưa root vào queue", en: "Put root into the queue" },
    note: { vi: `BFS bắt đầu với queue = [${root.val}].`, en: `BFS starts with queue = [${root.val}].` },
    formula: `queue = deque([${root.val}])`,
  });
  answer = root.val;
  candidate = root;
  sub[candidate.id] = `answer = ${answer}`;
  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "init-answer", codeLine: 4,
    title: { vi: `Khởi tạo answer = ${answer}`, en: `Initialize answer = ${answer}` },
    note: { vi: "Nếu cây chỉ có root, đây cũng chính là node trái nhất ở tầng cuối.", en: "If the tree contains only the root, this is also the bottom-left value." },
    formula: `answer = root.val = ${answer}`,
  });

  let level = 0;
  while (queue.length) {
    const size = queue.length;
    const nodes = queue.slice(0, size);
    let leftmost = null;
    debugStep({
      level, nodes, size, currentCount: size, stage: 0, event: "while-check", codeLine: 5,
      title: { vi: `Queue chưa rỗng: bắt đầu tầng ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Queue hiện có [${queueText().join(", ")}], nên tiếp tục vòng while.`, en: `The queue is [${queueText().join(", ")}], so the while loop continues.` },
      formula: "bool(queue) = True",
    });
    debugStep({
      level, nodes, size, currentCount: size, stage: 0, event: "lock-size", codeLine: 6,
      title: { vi: `Khóa size = ${size}`, en: `Lock size = ${size}` },
      note: { vi: "Chỉ các node đang ở queue lúc này thuộc tầng hiện tại; child mới enqueue sẽ chờ tầng kế.", en: "Only nodes currently in the queue belong to this level; newly enqueued children wait for the next level." },
      formula: `size = len(queue) = ${size}`,
    });

    for (let i = 0; i < size; i++) {
      const node = queue[0];
      debugStep({
        level, nodes, size, i, node, leftmost, currentIndex: i, processedCount: i,
        currentCount: size - i, rowState: "front", event: "loop", codeLine: 7,
        title: { vi: `Lượt i = ${i}: FRONT = ${node.val}`, en: `Iteration i = ${i}: FRONT = ${node.val}` },
        note: { vi: `Đây là node thứ ${i + 1}/${size} của tầng ${level}.`, en: `This is node ${i + 1}/${size} in level ${level}.` },
        formula: `i = ${i} < size = ${size}`,
        active: [node.id],
      });

      queue.shift();
      processed.add(node.id);
      debugStep({
        level, nodes, size, i, node, leftmost, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "popped", event: "pop", codeLine: 8,
        title: { vi: `Pop ${node.val} khỏi đầu queue`, en: `Pop ${node.val} from the queue front` },
        note: { vi: `Queue sau popleft: [${queueText().join(", ")}].`, en: `Queue after popleft: [${queueText().join(", ")}].` },
        formula: `node = queue.popleft() = ${node.val}`,
        active: [node.id],
      });

      const isFirst = i === 0;
      debugStep({
        level, nodes, size, i, node, condition: isFirst, leftmost, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "check i == 0", event: "check-first", codeLine: 9,
        title: isFirst
          ? { vi: `i = 0: ${node.val} là node đầu tầng`, en: `i = 0: ${node.val} is first in the level` }
          : { vi: `i = ${i}: ${node.val} không phải node đầu`, en: `i = ${i}: ${node.val} is not first` },
        note: isFirst
          ? { vi: "BFS enqueue trái trước phải, nên node đầu tiên chính là node trái nhất của tầng.", en: "BFS enqueues left before right, so the first node is the level's leftmost node." }
          : { vi: "Node này vẫn được duyệt để tìm tầng kế tiếp, nhưng không được ghi vào answer.", en: "This node is still visited to discover the next level, but it does not overwrite answer." },
        formula: `i == 0 → ${isFirst ? "True" : "False"}`,
        active: [node.id],
      });

      if (isFirst) {
        if (candidate) delete sub[candidate.id];
        answer = node.val;
        candidate = node;
        leftmost = node;
        sub[candidate.id] = `answer = ${answer}`;
      }
      debugStep({
        level, nodes, size, i, node, condition: isFirst, leftmost, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: isFirst ? "leftmost" : "not-first",
        stage: 2, event: isFirst ? "select-leftmost" : "keep-candidate", codeLine: 9,
        title: isFirst
          ? { vi: `Cập nhật answer = ${answer}`, en: `Update answer = ${answer}` }
          : { vi: `Giữ answer = ${answer}`, en: `Keep answer = ${answer}` },
        note: isFirst
          ? { vi: `${node.val} được đánh dấu xanh là node trái nhất của tầng ${level}.`, en: `${node.val} is marked green as the leftmost node of level ${level}.` }
          : { vi: `Chỉ i = 0 được ghi đè answer; ${node.val} có i = ${i}.`, en: `Only i = 0 overwrites answer; ${node.val} has i = ${i}.` },
        formula: isFirst ? `answer = node.val = ${answer}` : `i != 0 → answer stays ${answer}`,
        active: [node.id],
      });

      if (node.left) queue.push(node.left);
      debugStep({
        level, nodes, size, i, node, condition: isFirst, leftmost, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: leftmost?.id === node.id ? "leftmost" : "checked", stage: 2,
        event: node.left ? "enqueue-left" : "skip-left", codeLine: 10,
        title: node.left
          ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left
          ? { vi: `${node.left.val} nằm ở phần xanh dương của queue và sẽ được xét ở tầng kế tiếp.`, en: `${node.left.val} sits in the blue part of the queue and will be processed on the next level.` }
          : { vi: "Không có gì được thêm vào queue.", en: "Nothing is added to the queue." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
        active: [node.id],
      });

      if (node.right) queue.push(node.right);
      debugStep({
        level, nodes, size, i, node, condition: isFirst, leftmost, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: leftmost?.id === node.id ? "leftmost" : "checked", stage: 2,
        event: node.right ? "enqueue-right" : "skip-right", codeLine: 11,
        title: node.right
          ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right
          ? { vi: `${node.right.val} vào sau con trái, nhờ đó thứ tự trái → phải được giữ nguyên.`, en: `${node.right.val} enters after the left child, preserving left-to-right order.` }
          : { vi: `Queue giữ nguyên; size của tầng ${level} vẫn là ${size}.`, en: `The queue is unchanged; level ${level}'s size remains ${size}.` },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
        active: [node.id],
      });
    }

    completedRows.push(currentRow({ level, nodes, processedCount: size, leftmost, complete: true }));
    level += 1;
  }

  debugStep({
    level, size: 0, currentCount: 0, stage: 0, event: "while-stop", codeLine: 5,
    title: { vi: "Queue rỗng: thoát vòng while", en: "Queue is empty: exit the while loop" },
    note: { vi: "Candidate hiện tại đến từ tầng sâu nhất vừa xử lý.", en: "The current candidate came from the deepest processed level." },
    formula: "bool(queue) = False",
  });
  debugStep({
    level, size: 0, currentCount: 0, stage: 3, event: "done", codeLine: 12, status: "success", final: true, result: answer,
    title: { vi: `Trả về node trái nhất tầng cuối = ${answer}`, en: `Return the bottom-left value = ${answer}` },
    note: { vi: "Mỗi tầng ghi đè answer đúng một lần tại i = 0; tầng sâu nhất ghi đè cuối cùng.", en: "Each level overwrites answer exactly once at i = 0; the deepest level writes last." },
    formula: `return ${answer}`,
  });
  return { input, answer, steps };
}

function build662(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: 0, steps: [emptyResult(662, "indexed-width", root, 0, 3)] };
  const steps = [introStep(662, "indexed-width", root,
    { vi: "Gán index như cây hoàn chỉnh", en: "Index nodes as if the tree were complete" },
    { vi: "Bấm Next để theo từng dòng: pop (node, pos), chuẩn hóa pos, enqueue child bằng 2·pos / 2·pos+1, rồi tính width.", en: "Press Next to follow each line: pop (node, pos), normalize pos, enqueue children with 2·pos / 2·pos+1, then compute width." })];
  const queue = [{ node: root, pos: 0 }];
  const completedRows = [];
  const processed = new Set();
  const sub = {};
  let best = 0;
  let bestIds = [];
  const queueText = () => queue.map((entry) => `${entry.node.val}@${entry.pos}`);
  const queueSnapshot = (currentCount = 0) => queue.map((entry, index) => ({
    node: entry.node,
    role: index < currentCount ? "current-level" : "next-level",
    meta: `pos ${entry.pos}`,
  }));
  const varsSnapshot = ({ size = "—", i = "—", node = null, rawPos = "—", pos = "—", first = "—", last = "—", width = "—" } = {}) => [
    { name: "queue", value: queueText() },
    { name: "size", value: size },
    { name: "i", value: i },
    { name: "node", value: node ? node.val : "—" },
    { name: "raw_pos", value: rawPos },
    { name: "pos", value: pos },
    { name: "first", value: first },
    { name: "last", value: last },
    { name: "width", value: width },
    { name: "best", value: best },
  ];
  const currentRow = ({ level, entries, first = null, processedCount = 0, currentIndex = -1, state = "waiting", last = null, width = null, complete = false }) => {
    const positions = entries.map((entry) => first === null ? entry.pos : entry.pos - first);
    return {
      level,
      status: complete ? "sorted" : undefined,
      values: entries.map((entry, index) => {
        let tone = "neutral";
        let meta = `${first === null ? "raw" : "idx"} ${positions[index]}`;
        if (index < processedCount) meta += " · checked";
        if (complete && (index === 0 || index === entries.length - 1)) {
          tone = "success";
          meta = entries.length === 1 ? `idx ${positions[index]} · both ends` : `idx ${positions[index]} · ${index === 0 ? "first" : "last"}`;
        }
        if (index === currentIndex) {
          tone = state === "last" ? "success" : "warning";
          meta = state === "raw" ? `raw ${entries[index].pos}` : state === "last" ? `idx ${positions[index]} · last` : `idx ${positions[index]} · ${state}`;
        }
        return { id: entry.node.id, value: entry.node.val, tone, meta };
      }),
      metric: {
        label: "width",
        value: width === null ? (last === null ? "pending" : `${last} − 0 + 1`) : `${last} − 0 + 1 = ${width}`,
      },
      span: width ?? undefined,
    };
  };
  const debugStep = ({
    level, entries, size, i = "—", node = null, rawPos = "—", pos = "—",
    first = "—", last = "—", width = "—", currentIndex = -1, processedCount = 0,
    rowState = "waiting", complete = false, currentCount = 0, title, note, codeLine,
    stage = 1, event, formula = null, active = [], status = "checking", final = false, result = null,
  }) => {
    const rowFirst = Number.isInteger(first) ? first : null;
    const rowLast = Number.isInteger(last) ? last : null;
    const rowWidth = Number.isInteger(width) ? width : null;
    const rows = entries
      ? [...completedRows, currentRow({ level, entries, first: rowFirst, processedCount, currentIndex, state: rowState, last: rowLast, width: rowWidth, complete })]
      : completedRows;
    steps.push(makeStep({
      problemId: 662, mode: "indexed-width", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: queueSnapshot(currentCount),
      queueNote: { vi: "mỗi node mang positional index", en: "each node carries a positional index" },
      active, done: processed, selected: bestIds, sub,
      formula,
      vars: varsSnapshot({ size, i, node, rawPos, pos, first, last, width }),
      cards: [
        { label: "level", value: level ?? "—" },
        { label: { vi: "size (đã khóa)", en: "size (locked)" }, value: size ?? "—", detail: { vi: "chỉ pop đúng size node", en: "pop exactly size nodes" } },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: { vi: "pos gốc → chuẩn hóa", en: "raw → normalized pos" }, value: Number.isInteger(rawPos) ? `${rawPos} → ${Number.isInteger(pos) ? pos : "?"}` : "—" },
        { label: "first / last", value: `${Number.isInteger(first) ? first : "—"} / ${Number.isInteger(last) ? last : "—"}` },
        { label: "width / best", value: `${Number.isInteger(width) ? width : "—"} / ${best}`, tone: Number.isInteger(width) ? "success" : "neutral" },
      ],
    }));
  };

  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "guard", codeLine: 3,
    title: { vi: "Kiểm tra root có rỗng không", en: "Check whether root is empty" },
    note: { vi: `root = ${root.val}, nên tiếp tục BFS.`, en: `root = ${root.val}, so continue into BFS.` },
    formula: "not root = False",
  });
  debugStep({
    level: "—", size: "—", currentCount: 1, stage: 0, event: "init", codeLine: 4,
    title: { vi: "Khởi tạo queue với (root, 0)", en: "Initialize queue with (root, 0)" },
    note: { vi: `Root ${root.val} bắt đầu ở positional index 0; best bắt đầu bằng 0.`, en: `Root ${root.val} starts at positional index 0; best starts at 0.` },
    formula: `queue = [(${root.val}, 0)] · best = 0`,
  });

  let level = 0;
  while (queue.length) {
    const size = queue.length;
    const entries = queue.slice(0, size);
    debugStep({
      level, entries, size, currentCount: size, stage: 0, event: "while-check", codeLine: 5,
      title: { vi: `Queue chưa rỗng: bắt đầu tầng ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Queue đang giữ [${queueText().join(", ")}], trong đó value@pos cho biết node và index.`, en: `The queue holds [${queueText().join(", ")}], where value@pos shows each node and index.` },
      formula: "bool(queue) = True",
    });
    debugStep({
      level, entries, size, currentCount: size, stage: 0, event: "lock-size", codeLine: 6,
      title: { vi: `Khóa size = ${size}`, en: `Lock size = ${size}` },
      note: { vi: "Child mới enqueue không được pop trong level hiện tại.", en: "Newly enqueued children are not popped in the current level." },
      formula: `size = len(queue) = ${size}`,
    });

    const first = queue[0].pos;
    debugStep({
      level, entries, size, first, currentCount: size, stage: 0, event: "set-first", codeLine: 7,
      title: { vi: `Lấy first = ${first}`, en: `Set first = ${first}` },
      note: { vi: "Trừ first khỏi mọi pos trong tầng để index không tăng quá lớn.", en: "Subtract first from every position in the level so indices do not grow too large." },
      formula: `first = queue[0].pos = ${first}`,
    });
    let last = 0;
    debugStep({
      level, entries, size, first, last, currentCount: size, event: "reset-last", codeLine: 8,
      title: { vi: "Reset last = 0", en: "Reset last = 0" },
      note: { vi: "Sau chuẩn hóa, node đầu tiên luôn ở index 0; last sẽ đi tới endpoint bên phải.", en: "After normalization, the first node is always at index 0; last will move to the right endpoint." },
      formula: "last = 0",
    });

    for (let i = 0; i < size; i++) {
      const entry = queue[0];
      const node = entry.node;
      const rawPos = entry.pos;
      debugStep({
        level, entries, size, i, node, rawPos, first, last, currentIndex: i, processedCount: i,
        currentCount: size - i, rowState: "front", event: "loop", codeLine: 9,
        title: { vi: `Lượt i = ${i}: FRONT = (${node.val}, ${rawPos})`, en: `Iteration i = ${i}: FRONT = (${node.val}, ${rawPos})` },
        note: { vi: `Đây là node thứ ${i + 1}/${size} của tầng ${level}.`, en: `This is node ${i + 1}/${size} in level ${level}.` },
        formula: `i = ${i} < size = ${size}`,
        active: [node.id],
      });

      queue.shift();
      processed.add(node.id);
      debugStep({
        level, entries, size, i, node, rawPos, first, last, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "raw", event: "pop", codeLine: 10,
        title: { vi: `Pop (${node.val}, ${rawPos})`, en: `Pop (${node.val}, ${rawPos})` },
        note: { vi: `pos hiện vẫn là index gốc ${rawPos}; queue còn [${queueText().join(", ")}].`, en: `pos is still the raw index ${rawPos}; the queue is now [${queueText().join(", ")}].` },
        formula: `node, pos = queue.popleft() = (${node.val}, ${rawPos})`,
        active: [node.id],
      });

      const pos = rawPos - first;
      sub[node.id] = `idx = ${pos}`;
      debugStep({
        level, entries, size, i, node, rawPos, pos, first, last, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "normalized", event: "normalize", codeLine: 11,
        title: { vi: `Chuẩn hóa pos: ${rawPos} − ${first} = ${pos}`, en: `Normalize pos: ${rawPos} − ${first} = ${pos}` },
        note: { vi: "Khoảng cách giữa các node vẫn giữ nguyên, nhưng index được kéo về gần 0.", en: "Distances between nodes stay unchanged, while indices shift closer to 0." },
        formula: `pos = raw_pos − first = ${rawPos} − ${first} = ${pos}`,
        active: [node.id],
      });

      last = pos;
      debugStep({
        level, entries, size, i, node, rawPos, pos, first, last, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "last", event: "set-last", codeLine: 12,
        title: { vi: `Dời last tới ${last}`, en: `Move last to ${last}` },
        note: { vi: "BFS đọc trái → phải, nên pos của node vừa pop là endpoint phải mới nhất.", en: "BFS reads left to right, so the popped node's position is the newest right endpoint." },
        formula: `last = pos = ${last}`,
        active: [node.id],
      });

      if (node.left) queue.push({ node: node.left, pos: 2 * pos });
      debugStep({
        level, entries, size, i, node, rawPos, pos, first, last, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "checked", event: node.left ? "enqueue-left" : "skip-left", codeLine: 13,
        title: node.left
          ? { vi: `Enqueue con trái ${node.left.val} tại pos ${2 * pos}`, en: `Enqueue left child ${node.left.val} at pos ${2 * pos}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left
          ? { vi: "Con trái dùng index 2 × pos và chờ ở phần xanh dương của queue.", en: "The left child uses index 2 × pos and waits in the blue part of the queue." }
          : { vi: "Vị trí con trái vẫn là một khoảng trống có thể nằm bên trong width.", en: "The missing left-child slot may still be an internal gap inside the width." },
        formula: node.left ? `left pos = 2 × ${pos} = ${2 * pos}` : "node.left = None → skip",
        active: [node.id],
      });

      if (node.right) queue.push({ node: node.right, pos: 2 * pos + 1 });
      debugStep({
        level, entries, size, i, node, rawPos, pos, first, last, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "checked", event: node.right ? "enqueue-right" : "skip-right", codeLine: 14,
        title: node.right
          ? { vi: `Enqueue con phải ${node.right.val} tại pos ${2 * pos + 1}`, en: `Enqueue right child ${node.right.val} at pos ${2 * pos + 1}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right
          ? { vi: "Con phải dùng index 2 × pos + 1; chênh lệch index sẽ bảo toàn các ô null ở giữa.", en: "The right child uses 2 × pos + 1; index gaps preserve null slots between endpoints." }
          : { vi: "Không thêm node, nhưng không nén các positional index đã tạo.", en: "No node is added, but existing positional indices are not compressed." },
        formula: node.right ? `right pos = 2 × ${pos} + 1 = ${2 * pos + 1}` : "node.right = None → skip",
        active: [node.id],
      });
    }

    const width = last + 1;
    debugStep({
      level, entries, size, first, last, width, processedCount: size, currentCount: 0,
      stage: 2, event: "width", codeLine: 15,
      title: { vi: `Tầng ${level}: width = ${width}`, en: `Level ${level}: width = ${width}` },
      note: { vi: `Endpoint chuẩn hóa là 0 và ${last}; mọi slot giữa chúng đều được tính.`, en: `The normalized endpoints are 0 and ${last}; every slot between them counts.` },
      formula: `width = ${last} − 0 + 1 = ${width}`,
    });

    const previousBest = best;
    debugStep({
      level, entries, size, first, last, width, processedCount: size, currentCount: 0,
      stage: 2, event: "compare-best", codeLine: 16,
      title: { vi: `So width ${width} với best ${previousBest}`, en: `Compare width ${width} with best ${previousBest}` },
      note: { vi: "Bước kế tiếp sẽ cho thấy best có thay đổi hay không.", en: "The next step shows whether best changes." },
      formula: `max(${previousBest}, ${width}) = ?`,
    });
    const isNewBest = width > best;
    if (isNewBest) {
      best = width;
      bestIds = [entries[0].node.id, entries.at(-1).node.id];
    }
    completedRows.push(currentRow({ level, entries, first, processedCount: size, last, width, complete: true }));
    debugStep({
      level, size, first, last, width, currentCount: 0, stage: 2,
      event: isNewBest ? "new-best" : "keep-best", codeLine: 16,
      title: isNewBest
        ? { vi: `Cập nhật best = ${best}`, en: `Update best = ${best}` }
        : { vi: `Giữ best = ${best}`, en: `Keep best = ${best}` },
      note: isNewBest
        ? { vi: `Width ${width} lớn hơn kỷ lục cũ ${previousBest}.`, en: `Width ${width} exceeds the previous record ${previousBest}.` }
        : { vi: `Width ${width} không lớn hơn kỷ lục ${best}.`, en: `Width ${width} does not exceed the record ${best}.` },
      formula: `best = max(${previousBest}, ${width}) = ${best}`,
    });
    level += 1;
  }

  debugStep({
    level, size: 0, currentCount: 0, stage: 0, event: "while-stop", codeLine: 5,
    title: { vi: "Queue rỗng: thoát vòng while", en: "Queue is empty: exit the while loop" },
    note: { vi: `Mọi tầng đã được đo; best hiện là ${best}.`, en: `Every level has been measured; best is now ${best}.` },
    formula: "bool(queue) = False",
  });
  debugStep({
    level, size: 0, currentCount: 0, stage: 3, event: "done", codeLine: 17, status: "success", final: true, result: best,
    title: { vi: `Trả về độ rộng lớn nhất = ${best}`, en: `Return maximum width = ${best}` },
    note: { vi: "Trong bảng level, hai chip endpoint màu xanh đánh dấu khoảng tạo ra best hiện tại.", en: "On the level board, the two green endpoint chips mark the span that produced the current best." },
    formula: `return ${best}`,
  });
  return { input, answer: best, steps };
}

function build117(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: [], steps: [emptyResult(117, "next-pointers", root, "[]", 3)] };
  const levels = levelsOf(root), steps = [introStep(117, "next-pointers", root,
    { vi: "Dùng dummy để nối một tầng bất kỳ", en: "Use a dummy node to link any level" },
    { vi: "Đi ngang tầng hiện tại bằng next; append mọi child tồn tại vào chuỗi của tầng sau. Cây không cần hoàn hảo.", en: "Walk the current level through next pointers; append every existing child to the next-level chain. The tree need not be perfect." })];
  const rows = [], done = new Set(), sub = {}, chains = [];
  levels.forEach((level, index) => {
    const chain = level.map((node) => node.val).join(" → ") + " → #";
    chains.push(chain);
    level.forEach((node, i) => { done.add(node.id); sub[node.id] = `next → ${i + 1 < level.length ? level[i + 1].val : "#"}`; });
    rows.push({ level: index, values: levelTokens(level, { meta: level.map((node, i) => `next → ${i + 1 < level.length ? level[i + 1].val : "#"}`), tones: level.map(() => "success") }), metric: { label: "chain", value: chain } });
    steps.push(makeStep({
      problemId: 117, mode: "next-pointers", root, stage: 2, event: "connect", rows, queue: levels[index + 1] || [], active: level.map((node) => node.id), done, sub,
      title: { vi: `Nối tầng ${index}: ${chain}`, en: `Connect level ${index}: ${chain}` },
      note: { vi: "Con trỏ next chỉ nối các node cùng tầng; node cuối luôn trỏ # (null).", en: "A next pointer links only nodes on the same level; the last node always points to # (null)." },
      codeLines: [8, 9, 10, 11], cards: [{ label: "level", value: index }, { label: "next chain", value: chain, tone: "success" }],
    }));
  });
  steps.push(makeStep({ problemId: 117, mode: "next-pointers", root, stage: 3, event: "done", status: "success", final: true, rows, done, sub,
    title: { vi: "Mọi next pointer đã được nối", en: "All next pointers are connected" }, note: { vi: "Đọc từng hàng theo mũi tên xanh để kiểm tra kết quả.", en: "Read each green row left to right to verify the result." }, codeLines: [14],
    cards: [{ label: { vi: "SỐ TẦNG", en: "LEVELS" }, value: levels.length, tone: "success" }], result: chains }));
  return { input, answer: chains, steps };
}

function build1609(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: true, steps: [emptyResult(1609, "even-odd", root, true, 3)] };
  const levels = levelsOf(root), steps = [introStep(1609, "even-odd", root,
    { vi: "Level quyết định parity và chiều", en: "The level decides parity and direction" },
    { vi: "Level chẵn: số lẻ tăng nghiêm ngặt. Level lẻ: số chẵn giảm nghiêm ngặt.", en: "Even levels: odd values strictly increase. Odd levels: even values strictly decrease." })];
  const rows = [], done = new Set(), bad = new Set(); let answer = true;
  for (let index = 0; index < levels.length; index++) {
    const level = levels[index];
    const needOdd = index % 2 === 0;
    let previous = needOdd ? -Infinity : Infinity;
    let invalidIndex = -1;
    for (let i = 0; i < level.length; i++) {
      const value = level[i].val;
      const parityOk = Math.abs(value % 2) === (needOdd ? 1 : 0);
      const orderOk = needOdd ? value > previous : value < previous;
      if (!parityOk || !orderOk) { invalidIndex = i; break; }
      previous = value;
    }
    level.forEach((node) => done.add(node.id));
    if (invalidIndex >= 0) { answer = false; bad.add(level[invalidIndex].id); }
    const rule = needOdd ? "odd · strictly ↑" : "even · strictly ↓";
    rows.push({ level: index, values: levelTokens(level, { tones: level.map((_, i) => i === invalidIndex ? "danger" : "success") }), metric: { label: "rule", value: rule }, status: invalidIndex < 0 ? "pass" : "fail" });
    steps.push(makeStep({
      problemId: 1609, mode: "even-odd", root, stage: 1, event: invalidIndex < 0 ? "pass" : "fail", status: invalidIndex < 0 ? "success" : "danger", rows,
      active: invalidIndex < 0 ? level.map((node) => node.id) : [level[invalidIndex].id], done, bad,
      title: invalidIndex < 0 ? { vi: `Tầng ${index}: PASS`, en: `Level ${index}: PASS` } : { vi: `Tầng ${index}: FAIL tại ${level[invalidIndex].val}`, en: `Level ${index}: FAIL at ${level[invalidIndex].val}` },
      note: invalidIndex < 0 ? { vi: `Dãy [${level.map((n) => n.val).join(", ")}] thỏa ${rule}.`, en: `[${level.map((n) => n.val).join(", ")}] satisfies ${rule}.` } : { vi: `Node đỏ vi phạm parity hoặc thứ tự ${rule}.`, en: `The red node violates parity or the ${rule} ordering.` },
      codeLines: [9, 10], formula: needOdd ? "level % 2 = 0 ⇒ odd and a[i] < a[i+1]" : "level % 2 = 1 ⇒ even and a[i] > a[i+1]",
      cards: [{ label: "level", value: index }, { label: { vi: "QUY TẮC", en: "RULE" }, value: rule }, { label: { vi: "KẾT QUẢ", en: "RESULT" }, value: invalidIndex < 0 ? "PASS" : "FAIL", tone: invalidIndex < 0 ? "success" : "danger" }],
    }));
    if (!answer) break;
  }
  steps.push(makeStep({ problemId: 1609, mode: "even-odd", root, stage: 3, event: "done", status: answer ? "success" : "danger", final: true, rows, done, bad,
    title: { vi: `Even-Odd Tree = ${answer}`, en: `Even-Odd Tree = ${answer}` }, note: answer ? { vi: "Tất cả các tầng đều PASS.", en: "Every level passed." } : { vi: "Chỉ một node vi phạm là đủ trả False.", en: "A single violation is enough to return false." },
    codeLines: [15], cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: answer, tone: answer ? "success" : "danger" }], result: answer }));
  return { input, answer, steps };
}

function build2415(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: [], steps: [emptyResult(2415, "reverse-odd", root, "[]", 3)] };
  const levels = levelsOf(root), steps = [introStep(2415, "reverse-odd", root,
    { vi: "Chỉ đảo giá trị ở tầng lẻ", en: "Reverse values only on odd levels" },
    { vi: "Cấu trúc và các cạnh không đổi. Ở level 1, 3, 5… đổi giá trị đối xứng từ hai đầu vào.", en: "The shape and edges do not change. On levels 1, 3, 5… swap symmetric values from the outside inward." })];
  const rows = [], done = new Set();
  levels.forEach((level, index) => {
    const before = level.map((node) => node.val);
    const reversed = index % 2 === 1 ? [...before].reverse() : [...before];
    if (index % 2 === 1) level.forEach((node, i) => { node.val = reversed[i]; });
    level.forEach((node) => done.add(node.id));
    rows.push({ level: index, values: levelTokens(level, { tones: level.map(() => index % 2 === 1 ? "warning" : "neutral") }), before, secondary: reversed, metric: { label: index % 2 === 1 ? "reverse" : "keep", value: `[${reversed.join(", ")}]` } });
    steps.push(makeStep({
      problemId: 2415, mode: "reverse-odd", root, stage: index % 2 === 1 ? 2 : 1, event: index % 2 === 1 ? "reverse" : "keep", rows,
      active: level.map((node) => node.id), done,
      title: index % 2 === 1 ? { vi: `Tầng ${index}: đảo [${before}] → [${reversed}]`, en: `Level ${index}: reverse [${before}] → [${reversed}]` } : { vi: `Tầng ${index} chẵn: giữ nguyên`, en: `Even level ${index}: keep values` },
      note: index % 2 === 1 ? { vi: "Node giữ nguyên vị trí; chỉ các value đổi chỗ đối xứng.", en: "Nodes stay in place; only their values swap symmetrically." } : { vi: "Level chẵn không thay đổi.", en: "Even levels remain unchanged." },
      codeLines: index % 2 === 1 ? [7, 8] : [6], cards: [{ label: "level", value: index }, { label: "before", value: `[${before}]` }, { label: "after", value: `[${reversed}]`, tone: index % 2 === 1 ? "warning" : "neutral" }],
    }));
  });
  const answer = serializeTree(root);
  steps.push(makeStep({ problemId: 2415, mode: "reverse-odd", root, stage: 3, event: "done", status: "success", final: true, rows, done,
    title: { vi: "Đã đảo mọi tầng lẻ", en: "All odd levels are reversed" }, note: { vi: "So sánh hàng before → after để thấy chính xác value nào đổi chỗ.", en: "Compare each before → after row to see exactly which values moved." }, codeLines: [12],
    cards: [{ label: { vi: "CÂY KẾT QUẢ", en: "RESULT TREE" }, value: JSON.stringify(answer), tone: "success" }], result: answer }));
  return { input, answer, steps };
}

function build2471(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: 0, steps: [emptyResult(2471, "level-sort", root, 0, 3)] };
  const levels = levelsOf(root), steps = [introStep(2471, "level-sort", root,
    { vi: "Mỗi tầng là một bài minimum swaps", en: "Each level is a minimum-swaps problem" },
    { vi: "Tạo target đã sort. Mỗi swap đặt ít nhất một giá trị đúng vị trí, rồi cộng swaps của mọi tầng.", en: "Build the sorted target. Every swap fixes at least one position, then sum swaps over all levels." })];
  const rows = [], done = new Set(); let total = 0;
  levels.forEach((level, levelIndex) => {
    const before = level.map((node) => node.val), current = [...before], target = [...before].sort((a, b) => a - b);
    const position = new Map(current.map((value, index) => [value, index]));
    let swaps = 0;
    rows.push({ level: levelIndex, values: levelTokens(level), before, secondary: target, working: [...current], metric: { label: "swaps", value: swaps } });
    for (let index = 0; index < current.length; index++) {
      if (current[index] === target[index]) continue;
      const other = position.get(target[index]);
      const a = current[index], b = current[other];
      [current[index], current[other]] = [current[other], current[index]];
      position.set(a, other); position.set(b, index); swaps += 1; total += 1;
      rows[rows.length - 1] = { ...rows.at(-1), working: [...current], metric: { label: "swaps", value: swaps }, swap: [index, other] };
      steps.push(makeStep({
        problemId: 2471, mode: "level-sort", root, stage: 1, event: "swap", rows, active: [level[index].id, level[other].id], done,
        title: { vi: `Tầng ${levelIndex}: swap vị trí ${index} ↔ ${other}`, en: `Level ${levelIndex}: swap positions ${index} ↔ ${other}` },
        note: { vi: `Cần ${target[index]} tại index ${index}; đổi với vị trí ${other} → [${current}].`, en: `Index ${index} needs ${target[index]}; swap with position ${other} → [${current}].` },
        codeLines: [10, 11, 12], formula: `[${before}] → [${current}] → target [${target}]`,
        cards: [{ label: "level", value: levelIndex }, { label: "level swaps", value: swaps, tone: "warning" }, { label: "total", value: total }],
      }));
    }
    level.forEach((node) => done.add(node.id));
    rows[rows.length - 1] = { ...rows.at(-1), working: [...current], metric: { label: "minimum swaps", value: swaps }, status: "sorted" };
    steps.push(makeStep({
      problemId: 2471, mode: "level-sort", root, stage: 2, event: "sorted", rows, active: level.map((node) => node.id), done,
      title: { vi: `Tầng ${levelIndex} cần ${swaps} swap`, en: `Level ${levelIndex} needs ${swaps} swaps` },
      note: { vi: `[${current}] đã bằng target tăng dần [${target}].`, en: `[${current}] now equals the ascending target [${target}].` },
      codeLines: [13], cards: [{ label: "level swaps", value: swaps, tone: "success" }, { label: "running total", value: total }],
    }));
  });
  steps.push(makeStep({ problemId: 2471, mode: "level-sort", root, stage: 3, event: "done", status: "success", final: true, rows, done,
    title: { vi: `Tổng minimum swaps = ${total}`, en: `Total minimum swaps = ${total}` }, note: { vi: "Các tầng độc lập, nên cộng số swap tối thiểu của từng tầng.", en: "Levels are independent, so add their individual minimum swap counts." }, codeLines: [15],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: total, tone: "success" }], result: total }));
  return { input, answer: total, steps };
}

function build2583(input, params) {
  const root = parseLevelTree(input);
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");
  if (!root) return { input, k, answer: -1, steps: [emptyResult(2583, "level-sums", root, -1, 3)] };
  const levels = levelsOf(root), steps = [introStep(2583, "level-sums", root,
    { vi: "Cộng từng tầng, giữ min-heap size k", en: "Sum each level, keep a size-k min-heap" },
    { vi: `BFS tạo một sum cho mỗi level. Min-heap chỉ giữ k=${k} tổng lớn nhất đã gặp.`, en: `BFS creates one sum per level. The min-heap keeps only the k=${k} largest sums seen.` })];
  const rows = [], sums = [], done = new Set();
  levels.forEach((level, index) => {
    const sum = level.reduce((total, node) => total + node.val, 0); sums.push(sum); level.forEach((node) => done.add(node.id));
    rows.push({ level: index, values: levelTokens(level), metric: { label: "sum", value: `${level.map((n) => n.val).join(" + ")} = ${sum}` } });
    steps.push(makeStep({
      problemId: 2583, mode: "level-sums", root, stage: 1, event: "sum", rows, queue: levels[index + 1] || [], active: level.map((node) => node.id), done,
      title: { vi: `Tầng ${index}: sum = ${sum}`, en: `Level ${index}: sum = ${sum}` }, note: { vi: `Thêm ${sum} vào danh sách tổng các tầng.`, en: `Append ${sum} to the list of level sums.` },
      codeLines: [8, 9], formula: `${level.map((n) => n.val).join(" + ")} = ${sum}`,
      cards: [{ label: "level", value: index }, { label: "sum", value: sum }, { label: "all sums", value: `[${sums}]` }],
    }));
  });
  const heap = [];
  sums.forEach((sum) => {
    heap.push(sum);
    heap.sort((a, b) => a - b);
    const removed = heap.length > k ? heap.shift() : null;
    steps.push(makeStep({
      problemId: 2583, mode: "level-sums", root, stage: 2, event: removed === null ? "heap-push" : "heap-trim", rows, done,
      title: removed === null
        ? { vi: `Push sum ${sum} vào min-heap`, en: `Push sum ${sum} into the min-heap` }
        : { vi: `Heap vượt k: bỏ minimum ${removed}`, en: `Heap exceeded k: remove minimum ${removed}` },
      note: removed === null
        ? { vi: `Heap đang giữ ${heap.length}/${k} tổng lớn nhất đã gặp.`, en: `The heap currently keeps ${heap.length}/${k} largest sums seen.` }
        : { vi: `Sau khi bỏ ${removed}, heap chỉ giữ k=${k} tổng lớn nhất: [${heap}].`, en: `After removing ${removed}, the heap keeps only the k=${k} largest sums: [${heap}].` },
      codeLines: removed === null ? [15] : [16], formula: `min-heap (size ≤ ${k}) = [${heap}]`,
      cards: [
        { label: { vi: "SUM VỪA XÉT", en: "CURRENT SUM" }, value: sum },
        { label: "min-heap", value: `[${heap}]`, tone: "warning" },
        { label: { vi: "ĐÃ BỎ", en: "REMOVED" }, value: removed === null ? "—" : removed },
      ],
    }));
  });
  const answer = heap.length === k ? heap[0] : -1;
  steps.push(makeStep({ problemId: 2583, mode: "level-sums", root, stage: 3, event: "done", status: answer === -1 ? "danger" : "success", final: true, rows, done,
    title: { vi: `Kết quả = ${answer}`, en: `Result = ${answer}` }, note: answer === -1 ? { vi: "Số tầng nhỏ hơn k nên trả -1.", en: "The tree has fewer than k levels, so return -1." } : { vi: `Heap giữ k tổng lớn nhất; minimum ${answer} chính là hạng ${k}.`, en: `The heap keeps the k largest sums; its minimum ${answer} is rank ${k}.` }, codeLines: [17],
    cards: [{ label: "k", value: k }, { label: "min-heap", value: `[${heap}]` }, { label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: answer, tone: answer === -1 ? "danger" : "success" }], result: answer }));
  return { input, k, answer, steps };
}

function build2641(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: [], steps: [emptyResult(2641, "cousin-sum", root, "[]", 3)] };
  const steps = [introStep(2641, "cousin-sum", root,
    { vi: "Cousin sum = tổng cả tầng − tổng nhóm anh em", en: "Cousin sum = level total − sibling-group total" },
    { vi: "Hai node là cousin khi cùng độ sâu nhưng khác cha. Vì vậy loại cả nhóm con của cùng một parent khỏi tổng tầng.", en: "Cousins share a depth but not a parent. Subtract the whole sibling group under the same parent from the level total." })];
  const rows = [{ level: 0, values: [{ id: root.id, value: 0, tone: "success", meta: "root → 0" }], before: [root.val], secondary: [0], metric: { label: "root", value: 0 } }];
  root.val = 0;
  const done = new Set([root.id]);
  let parents = [root], depth = 1;
  while (parents.length) {
    const children = parents.flatMap((node) => [node.left, node.right].filter(Boolean));
    if (!children.length) break;
    const before = children.map((node) => node.val);
    const levelSum = before.reduce((sum, value) => sum + value, 0);
    const nextValues = new Map();
    for (const parent of parents) {
      const siblings = [parent.left, parent.right].filter(Boolean);
      const siblingSum = siblings.reduce((sum, node) => sum + node.val, 0);
      siblings.forEach((node) => nextValues.set(node.id, levelSum - siblingSum));
    }
    for (const parent of parents) {
      const siblings = [parent.left, parent.right].filter(Boolean);
      if (!siblings.length) continue;
      const siblingSum = siblings.reduce((sum, node) => sum + node.val, 0);
      const replacement = levelSum - siblingSum;
      siblings.forEach((node) => { node.val = replacement; done.add(node.id); });
      const previewValues = children.map((node) => nextValues.get(node.id));
      const previewRow = { level: depth, values: levelTokens(children, { tones: children.map((node) => siblings.some((sibling) => sibling.id === node.id) ? "warning" : "neutral"), meta: children.map((node) => `new ${nextValues.get(node.id)}`) }), before, secondary: previewValues, metric: { label: "level sum", value: levelSum } };
      const priorRows = rows.filter((row) => row.level !== depth);
      steps.push(makeStep({
        problemId: 2641, mode: "cousin-sum", root, stage: 1, event: "replace", rows: [...priorRows, previewRow], active: siblings.map((node) => node.id), done,
        title: { vi: `Con của ${parent.val}: ${levelSum} − ${siblingSum} = ${replacement}`, en: `Children of ${parent.val}: ${levelSum} − ${siblingSum} = ${replacement}` },
        note: { vi: `Tổng level ${depth} là ${levelSum}. Bỏ nhóm sibling [${siblings.map((n) => n.original).join(", ")}] có tổng ${siblingSum}; phần còn lại là cousin sum.`, en: `Level ${depth} totals ${levelSum}. Remove sibling group [${siblings.map((n) => n.original).join(", ")}] totaling ${siblingSum}; the remainder is the cousin sum.` },
        codeLines: [10, 11, 12], formula: `new value = ${levelSum} − (${siblings.map((n) => n.original).join(" + ")}) = ${replacement}`,
        cards: [{ label: "level sum", value: levelSum }, { label: "sibling sum", value: siblingSum }, { label: "cousin sum", value: replacement, tone: "success" }],
      }));
    }
    children.forEach((node) => { node.val = nextValues.get(node.id); });
    rows.push({ level: depth, values: levelTokens(children, { tones: children.map(() => "success"), meta: children.map((node) => `new ${node.val}`) }), before, secondary: children.map((node) => node.val), metric: { label: "level sum", value: levelSum } });
    parents = children; depth += 1;
  }
  const answer = serializeTree(root);
  steps.push(makeStep({ problemId: 2641, mode: "cousin-sum", root, stage: 3, event: "done", status: "success", final: true, rows, done,
    title: { vi: "Mọi node đã mang cousin sum", en: "Every node now stores its cousin sum" }, note: { vi: "Root bằng 0; mỗi node khác đã loại chính nó và mọi sibling khỏi tổng cùng tầng.", en: "The root is 0; every other node excludes itself and all siblings from its level total." }, codeLines: [14],
    cards: [{ label: { vi: "CÂY KẾT QUẢ", en: "RESULT TREE" }, value: JSON.stringify(answer), tone: "success" }], result: answer }));
  return { input, answer, steps };
}

const base = (id, difficulty, slug, title, titleVi, statement, defaultInput, approach, complexity, code, builder, extraParams = []) => ({
  id, difficulty, slug, category: TREE_CAT, tags: [BFS_TAG], title: { vi: title, en: title }, titleVi,
  statement, defaultInput, inputKind: "string", inputLabel: { vi: "Tree (level-order; null cho node rỗng)", en: "Tree (level-order; null for empty)" },
  extraParams, approach, complexity, code, builder,
});

module.exports = {
  107: base(107, "medium", "binary-tree-level-order-traversal-ii", "Binary Tree Level Order Traversal II", { vi: "Duyệt tầng từ dưới lên", en: "Bottom-up level order" },
    { vi: "Trả về các giá trị theo tầng từ dưới lên; trong mỗi tầng vẫn giữ thứ tự trái sang phải.", en: "Return node values level by level from bottom to top, preserving left-to-right order inside each level." }, "3,9,20,null,null,15,7",
    [{ vi: "BFS thu thập từng tầng theo thứ tự bình thường.", en: "Use BFS to collect levels in normal order." }, { vi: "Đảo danh sách level một lần ở cuối.", en: "Reverse the level list once at the end." }],
    { time: "O(n)", space: "O(n)", note: { vi: "Mỗi node vào queue một lần; output cũng cần O(n).", en: "Each node enters the queue once; the output also needs O(n)." } },
    ["class Solution:", "    def levelOrderBottom(self, root):", "        if not root: return []", "        queue, result = deque([root]), []", "        while queue:", "            level = []", "            for _ in range(len(queue)):", "                node = queue.popleft()", "                level.append(node.val)", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "            result.append(level)", "        return result[::-1]"], build107),

  515: base(515, "medium", "find-largest-value-in-each-tree-row", "Find Largest Value in Each Tree Row", { vi: "Giá trị lớn nhất của mỗi hàng", en: "Largest value in each tree row" },
    { vi: "Trả về giá trị lớn nhất ở mỗi tầng của cây.", en: "Return the largest value in every level of the tree." }, "1,3,2,5,3,null,9",
    [{ vi: "BFS theo tầng và lấy max của các node vừa pop.", en: "Run level-order BFS and take the maximum among nodes popped for each level." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Queue chứa tối đa w node ở tầng rộng nhất.", en: "The queue holds at most w nodes on the widest level." } },
    ["class Solution:", "    def largestValues(self, root):", "        if not root: return []", "        queue, answer = deque([root]), []", "        while queue:", "            size = len(queue)", "            level_max = float('-inf')", "            for i in range(size):", "                node = queue.popleft()", "                level_max = max(level_max, node.val)", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "            answer.append(level_max)", "        return answer"], build515),

  513: base(513, "medium", "find-bottom-left-tree-value", "Find Bottom Left Tree Value", { vi: "Giá trị trái nhất ở tầng cuối", en: "Bottom-left tree value" },
    { vi: "Tìm giá trị của node bên trái nhất tại tầng sâu nhất.", en: "Find the leftmost value in the last row of the tree." }, "2,1,3",
    [{ vi: "BFS trái trước phải; node đầu tiên của mỗi tầng là leftmost candidate.", en: "BFS left before right; the first node of each level is the leftmost candidate." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Duyệt mọi node một lần.", en: "Visit every node once." } },
    ["class Solution:", "    def findBottomLeftValue(self, root):", "        queue = deque([root])", "        answer = root.val", "        while queue:", "            size = len(queue)", "            for i in range(size):", "                node = queue.popleft()", "                if i == 0: answer = node.val", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "        return answer"], build513),

  662: base(662, "medium", "maximum-width-of-binary-tree", "Maximum Width of Binary Tree", { vi: "Độ rộng lớn nhất của cây", en: "Maximum width of a binary tree" },
    { vi: "Độ rộng một tầng tính từ node ngoài cùng trái đến ngoài cùng phải, kể cả các vị trí null ở giữa.", en: "A level's width spans its leftmost to rightmost non-null nodes, including null positions between them." }, "1,3,2,5,3,null,9",
    [{ vi: "Gán index như cây hoàn chỉnh và chuẩn hóa mỗi tầng để số không phình lớn.", en: "Assign complete-tree indices and normalize them per level to keep numbers small." }, { vi: "width = last_index − first_index + 1.", en: "width = last_index − first_index + 1." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Mỗi node mang thêm một positional index.", en: "Each queued node carries one positional index." } },
    ["class Solution:", "    def widthOfBinaryTree(self, root):", "        if not root: return 0", "        queue, best = deque([(root, 0)]), 0", "        while queue:", "            size = len(queue)", "            first = queue[0][1]", "            last = 0", "            for i in range(size):", "                node, pos = queue.popleft()", "                pos -= first", "                last = pos", "                if node.left: queue.append((node.left, 2 * pos))", "                if node.right: queue.append((node.right, 2 * pos + 1))", "            width = last + 1", "            best = max(best, width)", "        return best"], build662),

  117: base(117, "medium", "populating-next-right-pointers-in-each-node-ii", "Populating Next Right Pointers in Each Node II", { vi: "Nối next trên cây nhị phân bất kỳ", en: "Populate next pointers in any binary tree" },
    { vi: "Nối mỗi node với node ngay bên phải cùng tầng; cây có thể thiếu node ở bất kỳ vị trí nào.", en: "Connect each node to its immediate right neighbor on the same level; the tree may be sparse." }, "1,2,3,4,5,null,7",
    [{ vi: "Duyệt ngang bằng next hiện có và dùng dummy để xây chuỗi con cho tầng sau.", en: "Walk the current level through existing next pointers and use a dummy node to build the next level." }],
    { time: "O(n)", space: "O(1)", note: { vi: "Tái sử dụng next pointers; dummy/tail chỉ là hai con trỏ.", en: "Reuse next pointers; dummy and tail are only two pointers." } },
    ["class Solution:", "    def connect(self, root):", "        current = root", "        while current:", "            dummy = Node(0)", "            tail = dummy", "            while current:", "                for child in (current.left, current.right):", "                    if child:", "                        tail.next = child", "                        tail = child", "                current = current.next", "            current = dummy.next", "        return root"], build117),

  1609: base(1609, "medium", "even-odd-tree", "Even Odd Tree", { vi: "Cây chẵn-lẻ", en: "Even-Odd Tree" },
    { vi: "Tầng chẵn phải chứa số lẻ tăng nghiêm ngặt; tầng lẻ phải chứa số chẵn giảm nghiêm ngặt.", en: "Even-indexed levels must contain strictly increasing odd values; odd-indexed levels strictly decreasing even values." }, "1,10,4,3,null,7,9,12,8,6,null,null,2",
    [{ vi: "BFS từng tầng, chọn parity và sentinel theo level index.", en: "BFS by level, choosing parity and a comparison sentinel from the level index." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Dừng ngay khi gặp vi phạm đầu tiên.", en: "Stop at the first violation." } },
    ["class Solution:", "    def isEvenOddTree(self, root):", "        if not root: return True", "        queue, level = deque([root]), 0", "        while queue:", "            prev = float('-inf') if level % 2 == 0 else float('inf')", "            for _ in range(len(queue)):", "                node = queue.popleft()", "                parity_bad = node.val % 2 == level % 2", "                order_bad = node.val <= prev if level % 2 == 0 else node.val >= prev", "                if parity_bad or order_bad: return False", "                prev = node.val", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "            level += 1", "        return True"], build1609),

  2415: base(2415, "medium", "reverse-odd-levels-of-binary-tree", "Reverse Odd Levels of Binary Tree", { vi: "Đảo giá trị ở các tầng lẻ", en: "Reverse odd levels" },
    { vi: "Trong cây hoàn hảo, đảo thứ tự các giá trị ở mọi tầng lẻ và trả về root.", en: "In a perfect binary tree, reverse the node values at every odd level and return the root." }, "2,3,5,8,13,21,34",
    [{ vi: "BFS lấy list node từng tầng; ở tầng lẻ, đổi value đối xứng từ hai đầu.", en: "Use BFS to get each level's node list; on odd levels, swap symmetric values from both ends." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Mỗi node được đọc một lần; swap value tại chỗ.", en: "Read each node once and swap values in place." } },
    ["class Solution:", "    def reverseOddLevels(self, root):", "        queue, level = deque([root]), 0", "        while queue:", "            nodes = [queue.popleft() for _ in range(len(queue))]", "            if level % 2 == 1:", "                values = [node.val for node in nodes][::-1]", "                for node, value in zip(nodes, values):", "                    node.val = value", "            for node in nodes:", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "            level += 1", "        return root"], build2415),

  2471: base(2471, "medium", "minimum-number-of-operations-to-sort-a-binary-tree-by-level", "Minimum Number of Operations to Sort a Binary Tree by Level", { vi: "Ít swap nhất để sort từng tầng", en: "Minimum swaps to sort every level" },
    { vi: "Một thao tác đổi giá trị của hai node cùng tầng. Tìm tổng số thao tác ít nhất để mỗi tầng tăng nghiêm ngặt.", en: "One operation swaps two values on the same level. Find the minimum total operations needed to make every level strictly increasing." }, "1,4,3,7,6,8,5,null,null,null,null,9,null,10",
    [{ vi: "BFS lấy values của từng tầng, tạo target đã sort và đếm minimum swaps bằng vị trí hiện tại của từng value.", en: "BFS each level, build its sorted target, and count minimum swaps using each value's current position." }],
    { time: "O(n log n)", space: "O(w)", note: { vi: "Sort từng tầng; tổng kích thước mọi tầng là n.", en: "Sort each level; all level sizes sum to n." } },
    ["class Solution:", "    def minimumOperations(self, root):", "        queue, answer = deque([root]), 0", "        while queue:", "            nodes = [queue.popleft() for _ in range(len(queue))]", "            values = [node.val for node in nodes]", "            target = sorted(values)", "            pos = {value: i for i, value in enumerate(values)}", "            for i, wanted in enumerate(target):", "                if values[i] != wanted:", "                    j = pos[wanted]", "                    pos[values[i]] = j", "                    values[i], values[j] = values[j], values[i]", "                    pos[wanted] = i; answer += 1", "            for node in nodes:", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "        return answer"], build2471),

  2583: base(2583, "medium", "kth-largest-sum-in-a-binary-tree", "Kth Largest Sum in a Binary Tree", { vi: "Tổng tầng lớn thứ k", en: "K-th largest level sum" },
    { vi: "Tính tổng mỗi tầng và trả về tổng lớn thứ k; nếu cây có ít hơn k tầng thì trả -1.", en: "Compute every level sum and return the k-th largest; return -1 when the tree has fewer than k levels." }, "5,8,9,2,1,3,7,4,6",
    [{ vi: "BFS để lấy level sums; giữ min-heap tối đa k phần tử.", en: "Use BFS for level sums; keep a min-heap of at most k elements." }, { vi: "Sau cùng heap[0] là tổng lớn thứ k.", en: "At the end, heap[0] is the k-th largest sum." }],
    { time: "O(n + h log k)", space: "O(w + k)", note: { vi: "h là số tầng và w là độ rộng lớn nhất.", en: "h is the number of levels and w is the maximum width." } },
    ["class Solution:", "    def kthLargestLevelSum(self, root, k):", "        if not root: return -1", "        queue, sums = deque([root]), []", "        while queue:", "            total = 0", "            for _ in range(len(queue)):", "                node = queue.popleft()", "                total += node.val", "                if node.left: queue.append(node.left)", "                if node.right: queue.append(node.right)", "            sums.append(total)", "        heap = []", "        for total in sums:", "            heapq.heappush(heap, total)", "            if len(heap) > k: heapq.heappop(heap)", "        return heap[0] if len(heap) == k else -1"], build2583,
    [{ key: "k", type: "number", label: { vi: "Hạng k", en: "Rank k" }, min: 1, default: 2 }]),

  2641: base(2641, "medium", "cousins-in-binary-tree-ii", "Cousins in Binary Tree II", { vi: "Thay value bằng tổng các cousin", en: "Replace each value with its cousin sum" },
    { vi: "Thay value của mỗi node bằng tổng giá trị các cousin của nó trong cây ban đầu.", en: "Replace every node's value with the sum of its cousins' original values." }, "5,4,9,1,10,null,7",
    [{ vi: "Với mỗi tầng con, tính level_sum trước khi sửa value.", en: "For every child level, compute level_sum before changing values." }, { vi: "Mỗi child nhận level_sum − (left_child + right_child của cùng parent).", en: "Each child gets level_sum − (left_child + right_child under the same parent)." }],
    { time: "O(n)", space: "O(w)", note: { vi: "Hai lượt nhỏ trên mỗi tầng; mỗi node xử lý hằng số lần.", en: "Two small passes per level; each node is processed a constant number of times." } },
    ["class Solution:", "    def replaceValueInTree(self, root):", "        if not root: return root", "        root.val = 0", "        parents = [root]", "        while parents:", "            children = [child for p in parents for child in (p.left, p.right) if child]", "            level_sum = sum(child.val for child in children)", "            for parent in parents:", "                sibling_sum = sum(child.val for child in (parent.left, parent.right) if child)", "                for child in (parent.left, parent.right):", "                    if child: child.val = level_sum - sibling_sum", "            parents = children", "        return root"], build2641),
};

module.exports[2471].tags.push(SORTING_TAG);
module.exports[2583].tags.push(HEAP_TAG);
