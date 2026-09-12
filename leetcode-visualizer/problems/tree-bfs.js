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
  cards = [], formula = null, queueTitle = null, queueNote = null, status = "checking", final = false, vars = [], result = null,
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
      cards, formula, queueTitle, queueNote, result,
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
  const levels = levelsOf(root);
  const steps = [];
  const completedRows = [];
  const processed = new Set();
  const sub = { [root.id]: "next → #" };
  const nextMap = new Map([[root.id, null]]);
  const chains = [];
  let current = root;
  let level = 0;
  let dummyReady = false;
  let dummyNext = null;
  let tail = null;
  let side = "—";
  let child = null;
  let nextChain = [];

  const pointerValue = (node, fallback = "#") => node ? node.val : fallback;
  const currentNext = () => current ? (nextMap.get(current.id) || null) : null;
  const chainText = (nodes) => nodes.length ? `${nodes.map((node) => node.val).join(" → ")} → #` : "∅";
  const chainSnapshot = () => nextChain.map((node, index) => {
    const labels = [];
    if (node.id === dummyNext?.id) labels.push("HEAD");
    if (node.id === tail?.id) labels.push("TAIL");
    return {
      node,
      role: "next-level",
      label: labels.length ? labels.join(" / ") : "LINKED",
      meta: `next → ${pointerValue(nextMap.get(node.id) || null)}`,
    };
  });
  const varsSnapshot = () => [
    { name: "current", value: pointerValue(current) },
    { name: "current.next", value: current ? pointerValue(currentNext()) : "—" },
    { name: "dummy", value: dummyReady ? "Node(0)" : "—" },
    { name: "dummy.next", value: dummyReady ? pointerValue(dummyNext) : "—" },
    { name: "tail", value: dummyReady ? (tail ? tail.val : "dummy") : "—" },
    { name: "child", value: side === "—" ? "—" : pointerValue(child) },
    { name: "next chain", value: chainText(nextChain) },
  ];
  const rowFor = (nodes, rowLevel, scanIndex = -1, complete = false) => ({
    level: rowLevel,
    status: complete ? "sorted" : undefined,
    values: nodes.map((node, index) => ({
      id: node.id,
      value: node.val,
      tone: complete || index < scanIndex ? "success" : index === scanIndex ? "warning" : "neutral",
      meta: sub[node.id] || "next → ?",
    })),
    metric: { label: "next chain", value: chainText(nodes) },
  });
  const debugStep = ({
    nodes = null, scanIndex = -1, complete = false, title, note, codeLine, event,
    stage = 1, formula = null, active = [], status = "checking", final = false, result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, rowFor(nodes, level, scanIndex, complete)]
      : completedRows;
    steps.push(makeStep({
      problemId: 117, mode: "next-pointers", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: chainSnapshot(),
      queueTitle: { vi: "CHUỖI TẦNG KẾ", en: "NEXT-LEVEL CHAIN" },
      queueNote: { vi: "dummy.next = HEAD · tail = con trỏ cuối", en: "dummy.next = HEAD · tail = last pointer" },
      active, done: processed, selected: nextChain.map((node) => node.id), sub,
      formula, vars: varsSnapshot(),
      cards: [
        { label: "level", value: level },
        { label: "current", value: pointerValue(current), tone: current ? "warning" : "neutral" },
        { label: "side", value: side },
        { label: "child", value: side === "—" ? "—" : pointerValue(child) },
        { label: "dummy.next", value: dummyReady ? pointerValue(dummyNext) : "—", tone: dummyNext ? "success" : "neutral" },
        { label: "tail", value: dummyReady ? (tail ? tail.val : "dummy") : "—", tone: tail ? "success" : "neutral" },
      ],
    }));
  };

  debugStep({
    nodes: levels[0], scanIndex: 0, stage: 0, event: "init-current", codeLine: 3,
    title: { vi: `Bắt đầu với current = root = ${root.val}`, en: `Start with current = root = ${root.val}` },
    note: { vi: "current đi ngang một tầng bằng các con trỏ next; ban đầu root.next là #.", en: "current walks across one level through next pointers; initially root.next is #." },
    formula: `current = root = ${root.val}`,
    active: [root.id],
  });

  while (current) {
    const currentLevel = levels[level];
    debugStep({
      nodes: currentLevel, scanIndex: 0, stage: 0, event: "outer-while", codeLine: 4,
      title: { vi: `current = ${current.val}: xử lý tầng ${level}`, en: `current = ${current.val}: process level ${level}` },
      note: { vi: "Điều kiện while ngoài là True, nên ta sẽ tạo chuỗi next cho tầng ngay bên dưới.", en: "The outer while condition is true, so build the next-pointer chain one level below." },
      formula: `current is not None → True`,
      active: [current.id],
    });

    dummyReady = true;
    dummyNext = null;
    tail = null;
    side = "—";
    child = null;
    nextChain = [];
    debugStep({
      nodes: currentLevel, scanIndex: 0, stage: 0, event: "new-dummy", codeLine: 5,
      title: { vi: "Tạo dummy mới cho tầng kế", en: "Create a fresh dummy for the next level" },
      note: { vi: "dummy là mốc giả; dummy.next sẽ giữ HEAD của chuỗi mới.", en: "dummy is a sentinel; dummy.next will hold the new chain's HEAD." },
      formula: "dummy = Node(0) · dummy.next = #",
      active: [current.id],
    });
    debugStep({
      nodes: currentLevel, scanIndex: 0, stage: 0, event: "init-tail", codeLine: 6,
      title: { vi: "Cho tail bắt đầu tại dummy", en: "Point tail at dummy" },
      note: { vi: "Mỗi child hợp lệ sẽ được nối sau tail, rồi tail tiến tới child đó.", en: "Each existing child is linked after tail, then tail advances to that child." },
      formula: "tail = dummy",
      active: [current.id],
    });

    let scanIndex = 0;
    while (current) {
      const scanning = current;
      debugStep({
        nodes: currentLevel, scanIndex, event: "inner-while", codeLine: 7,
        title: { vi: `Quét current = ${scanning.val}`, en: `Scan current = ${scanning.val}` },
        note: { vi: `Node ${scanning.val} có thể đóng góp tối đa hai child vào chuỗi tầng kế.`, en: `Node ${scanning.val} can contribute up to two children to the next-level chain.` },
        formula: `current = ${scanning.val} → while True`,
        active: [scanning.id],
      });

      for (const childSide of ["left", "right"]) {
        side = childSide;
        child = scanning[childSide];
        debugStep({
          nodes: currentLevel, scanIndex, event: "inspect-child", codeLine: 8,
          title: { vi: `Lấy child ${childSide}: ${pointerValue(child)}`, en: `Read ${childSide} child: ${pointerValue(child)}` },
          note: { vi: `Vòng for luôn kiểm tra con trái trước, rồi mới đến con phải của ${scanning.val}.`, en: `The for-loop always checks ${scanning.val}'s left child before its right child.` },
          formula: `child = current.${childSide} = ${pointerValue(child)}`,
          active: [scanning.id, ...(child ? [child.id] : [])],
        });
        debugStep({
          nodes: currentLevel, scanIndex, event: child ? "child-check" : "skip-child", codeLine: 9,
          title: child
            ? { vi: `Child ${child.val} tồn tại`, en: `Child ${child.val} exists` }
            : { vi: `${scanning.val}.${childSide} là # — bỏ qua`, en: `${scanning.val}.${childSide} is # — skip it` },
          note: child
            ? { vi: "Điều kiện True: nối child này vào cuối chuỗi đang xây.", en: "The condition is true: append this child to the chain being built." }
            : { vi: "Điều kiện False: không đổi dummy.next, tail hay chuỗi tầng kế.", en: "The condition is false: dummy.next, tail, and the next-level chain stay unchanged." },
          formula: `bool(child) = ${child ? "True" : "False"}`,
          active: [scanning.id, ...(child ? [child.id] : [])],
        });

        if (child) {
          const previousTail = tail;
          if (!dummyNext) dummyNext = child;
          else nextMap.set(previousTail.id, child);
          if (!nextChain.some((node) => node.id === child.id)) nextChain.push(child);
          nextMap.set(child.id, null);
          if (previousTail) sub[previousTail.id] = `next → ${child.val}`;
          sub[child.id] = "next → #";
          debugStep({
            nodes: currentLevel, scanIndex, stage: 2, event: "link-child", codeLine: 10,
            title: previousTail
              ? { vi: `Nối ${previousTail.val}.next → ${child.val}`, en: `Link ${previousTail.val}.next → ${child.val}` }
              : { vi: `Nối dummy.next → ${child.val}`, en: `Link dummy.next → ${child.val}` },
            note: previousTail
              ? { vi: `Chuỗi tầng kế hiện là ${chainText(nextChain)}; tail vẫn còn đứng ở ${previousTail.val} cho tới dòng kế.`, en: `The next-level chain is now ${chainText(nextChain)}; tail still points to ${previousTail.val} until the next line.` }
              : { vi: `${child.val} trở thành HEAD được giữ bởi dummy.next; tail vẫn còn ở dummy cho tới dòng kế.`, en: `${child.val} becomes the HEAD stored in dummy.next; tail remains at dummy until the next line.` },
            formula: previousTail ? `tail.next = child → ${previousTail.val}.next = ${child.val}` : `tail.next = child → dummy.next = ${child.val}`,
            active: [scanning.id, child.id],
          });

          tail = child;
          debugStep({
            nodes: currentLevel, scanIndex, stage: 2, event: "move-tail", codeLine: 11,
            title: { vi: `Di chuyển tail tới ${child.val}`, en: `Move tail to ${child.val}` },
            note: { vi: "tail luôn chỉ node cuối của chuỗi để lần nối kế tiếp là O(1).", en: "tail always points at the chain's last node, making the next append O(1)." },
            formula: `tail = child = ${child.val}`,
            active: [scanning.id, child.id],
          });
        }
      }

      side = "—";
      child = null;
      const nextCurrent = nextMap.get(scanning.id) || null;
      processed.add(scanning.id);
      current = nextCurrent;
      scanIndex += 1;
      debugStep({
        nodes: currentLevel, scanIndex: Math.min(scanIndex, currentLevel.length - 1), event: "advance-current", codeLine: 12,
        title: current
          ? { vi: `Đi ngang: current = ${current.val}`, en: `Move right: current = ${current.val}` }
          : { vi: `Sau ${scanning.val} là #`, en: `After ${scanning.val} comes #` },
        note: current
          ? { vi: `Dùng con trỏ ${scanning.val}.next để sang node kế cùng tầng — không dùng queue.`, en: `Use ${scanning.val}.next to reach the next node on the same level—no queue is used.` }
          : { vi: "Đã đi hết tầng hiện tại; vòng while bên trong sẽ dừng.", en: "The current level is exhausted, so the inner while loop will stop." },
        formula: `current = ${scanning.val}.next = ${pointerValue(nextCurrent)}`,
        active: current ? [current.id] : [],
      });
    }

    debugStep({
      nodes: currentLevel, scanIndex: currentLevel.length, complete: true, event: "inner-stop", codeLine: 7,
      title: { vi: `Đã quét xong tầng ${level}`, en: `Finished scanning level ${level}` },
      note: { vi: `current = #; chuỗi vừa tạo cho tầng dưới là ${chainText(nextChain)}.`, en: `current = #; the chain just built for the level below is ${chainText(nextChain)}.` },
      formula: "current is not None → False",
    });

    const completedChain = chainText(currentLevel);
    chains.push(completedChain);
    completedRows.push(rowFor(currentLevel, level, currentLevel.length, true));
    current = dummyNext;
    level += 1;
    side = "—";
    child = null;
    debugStep({
      stage: 2, event: "descend", codeLine: 13,
      title: current
        ? { vi: `Xuống tầng kế: current = ${current.val}`, en: `Descend: current = ${current.val}` }
        : { vi: "dummy.next = #: không còn tầng kế", en: "dummy.next = #: there is no next level" },
      note: current
        ? { vi: `HEAD ${current.val} mở chuỗi ${chainText(nextChain)}; vòng ngoài sẽ xử lý chuỗi này.`, en: `HEAD ${current.val} starts ${chainText(nextChain)}; the outer loop will process this chain.` }
        : { vi: "Tầng vừa quét không có child nào, nên thuật toán sắp kết thúc.", en: "The scanned level has no children, so the algorithm is about to finish." },
      formula: `current = dummy.next = ${pointerValue(current)}`,
      active: current ? [current.id] : [],
    });
  }

  debugStep({
    stage: 0, event: "outer-stop", codeLine: 4,
    title: { vi: "current = #: thoát vòng while ngoài", en: "current = #: exit the outer while loop" },
    note: { vi: "Không còn tầng nào cần xây next pointer.", en: "No level remains to have its next pointers built." },
    formula: "current is not None → False",
  });
  debugStep({
    stage: 3, event: "done", codeLine: 14, status: "success", final: true, result: chains,
    title: { vi: "Trả về root với mọi next pointer đã nối", en: "Return root with every next pointer connected" },
    note: { vi: "Đọc từng hàng trong bảng: mỗi node trỏ sang node kế bên phải, node cuối trỏ #.", en: "Read each board row: every node points to its right neighbor, and the last node points to #." },
    formula: `return root · ${chains.join(" · ")}`,
  });
  return { input, answer: chains, steps };
}

function build1609(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: true, steps: [emptyResult(1609, "even-odd", root, true, 3)] };
  const steps = [];
  const queue = [root];
  const completedRows = [];
  const processed = new Set();
  const bad = new Set();
  const sub = {};
  let level = 0;
  let answer = true;
  let previous = null;
  let previousNode = null;

  const sentinelText = (value) => value === -Infinity ? "−∞" : value === Infinity ? "+∞" : value ?? "—";
  const queueText = () => queue.map((node) => node.val);
  const ruleFor = (currentLevel) => currentLevel % 2 === 0
    ? { parity: "odd", direction: "strictly ↑", symbol: ">", vi: "số lẻ · tăng nghiêm ngặt", en: "odd · strictly increasing" }
    : { parity: "even", direction: "strictly ↓", symbol: "<", vi: "số chẵn · giảm nghiêm ngặt", en: "even · strictly decreasing" };
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const rowFor = ({ nodes, rowLevel, processedCount = 0, currentIndex = -1, state = "waiting", complete = false }) => {
    const rule = ruleFor(rowLevel);
    return {
      level: rowLevel,
      status: state === "fail" ? "fail" : complete ? "sorted" : undefined,
      values: nodes.map((node, index) => {
        let tone = index < processedCount ? "success" : "neutral";
        let meta = sub[node.id] || (index < processedCount ? "PASS" : "waiting");
        if (index === currentIndex) {
          tone = state === "fail" ? "danger" : state === "pass" ? "success" : "warning";
          meta = sub[node.id] || state;
        }
        return { id: node.id, value: node.val, tone, meta };
      }),
      metric: { label: "rule", value: `${rule.parity} · ${rule.direction}` },
    };
  };
  const varsSnapshot = ({ size = "—", i = "—", node = null, parityBad = "—", orderBad = "—" } = {}) => [
    { name: "queue", value: queueText() },
    { name: "level", value: level },
    { name: "size", value: size },
    { name: "i", value: i },
    { name: "node", value: node ? node.val : "—" },
    { name: "prev", value: sentinelText(previous) },
    { name: "parity_bad", value: parityBad },
    { name: "order_bad", value: orderBad },
  ];
  const boolText = (value) => typeof value === "boolean" ? (value ? "True" : "False") : "—";
  const debugStep = ({
    nodes = null, size = "—", i = "—", node = null, parityBad = "—", orderBad = "—",
    processedCount = 0, currentIndex = -1, rowState = "waiting", complete = false,
    currentCount = 0, title, note, codeLine, event, stage = 1, formula = null,
    active = [], status = "checking", final = false, result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, rowFor({ nodes, rowLevel: level, processedCount, currentIndex, state: rowState, complete })]
      : completedRows;
    const rule = ruleFor(level);
    steps.push(makeStep({
      problemId: 1609, mode: "even-odd", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: queueSnapshot(currentCount),
      queueNote: { vi: "vàng = level hiện tại · xanh dương = level kế", en: "amber = current level · blue = next level" },
      active, done: processed, selected: previousNode ? [previousNode.id] : [], bad, sub,
      formula,
      vars: varsSnapshot({ size, i, node, parityBad, orderBad }),
      cards: [
        { label: "level", value: level },
        { label: { vi: "QUY TẮC", en: "RULE" }, value: { vi: rule.vi, en: rule.en } },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: "prev", value: sentinelText(previous), tone: previousNode ? "success" : "neutral" },
        { label: "parity_bad", value: boolText(parityBad), tone: parityBad === true ? "danger" : parityBad === false ? "success" : "neutral" },
        { label: "order_bad", value: boolText(orderBad), tone: orderBad === true ? "danger" : orderBad === false ? "success" : "neutral" },
      ],
    }));
  };

  debugStep({
    stage: 0, event: "guard", codeLine: 3, currentCount: 1,
    title: { vi: "Kiểm tra root có rỗng không", en: "Check whether root is empty" },
    note: { vi: `root = ${root.val}, nên không return sớm và bắt đầu BFS.`, en: `root = ${root.val}, so do not return early; start BFS.` },
    formula: "not root = False",
    active: [root.id],
  });
  debugStep({
    stage: 0, event: "init", codeLine: 4, currentCount: 1,
    title: { vi: `Khởi tạo queue = [${root.val}], level = 0`, en: `Initialize queue = [${root.val}], level = 0` },
    note: { vi: "Level 0 là level chẵn nên cần các giá trị lẻ tăng nghiêm ngặt.", en: "Level 0 is even-indexed, so it needs strictly increasing odd values." },
    formula: `queue = [${root.val}] · level = 0`,
    active: [root.id],
  });

  while (queue.length) {
    const size = queue.length;
    const levelNodes = queue.slice(0, size);
    const rule = ruleFor(level);
    debugStep({
      nodes: levelNodes, size, currentCount: size, stage: 0, event: "while-check", codeLine: 5,
      title: { vi: `Queue chưa rỗng: bắt đầu level ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Có ${size} node trong level này; quy tắc là ${rule.vi}.`, en: `This level contains ${size} node(s); its rule is ${rule.en}.` },
      formula: "bool(queue) = True",
    });

    previous = level % 2 === 0 ? -Infinity : Infinity;
    previousNode = null;
    debugStep({
      nodes: levelNodes, size, currentCount: size, stage: 0, event: "reset-prev", codeLine: 6,
      title: { vi: `Reset prev = ${sentinelText(previous)}`, en: `Reset prev = ${sentinelText(previous)}` },
      note: level % 2 === 0
        ? { vi: "Dùng −∞ để node đầu tiên chỉ cần là số lẻ; mọi giá trị thực đều lớn hơn sentinel.", en: "Use −∞ so the first node only needs to be odd; every real value exceeds the sentinel." }
        : { vi: "Dùng +∞ để node đầu tiên chỉ cần là số chẵn; mọi giá trị thực đều nhỏ hơn sentinel.", en: "Use +∞ so the first node only needs to be even; every real value is below the sentinel." },
      formula: `prev = ${sentinelText(previous)}`,
    });

    for (let i = 0; i < size; i += 1) {
      const node = queue[0];
      debugStep({
        nodes: levelNodes, size, i, node, currentIndex: i, processedCount: i,
        currentCount: size - i, rowState: "front", stage: 0, event: "loop", codeLine: 7,
        title: { vi: `Lượt ${i + 1}/${size}: FRONT = ${node.val}`, en: `Iteration ${i + 1}/${size}: FRONT = ${node.val}` },
        note: { vi: "range(len(queue)) được khóa trước khi child được append, nên chỉ xử lý đúng level hiện tại.", en: "range(len(queue)) is fixed before children are appended, so it processes exactly the current level." },
        formula: `i = ${i} < size = ${size}`,
        active: [node.id],
      });

      queue.shift();
      processed.add(node.id);
      debugStep({
        nodes: levelNodes, size, i, node, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "popped", event: "pop", codeLine: 8,
        title: { vi: `Pop ${node.val} khỏi FRONT`, en: `Pop ${node.val} from the FRONT` },
        note: { vi: `Queue sau popleft: [${queueText().join(", ")}].`, en: `Queue after popleft: [${queueText().join(", ")}].` },
        formula: `node = queue.popleft() = ${node.val}`,
        active: [node.id],
      });

      const parityBad = Math.abs(node.val % 2) === level % 2;
      sub[node.id] = parityBad ? `${rule.parity} ✗` : `${rule.parity} ✓`;
      debugStep({
        nodes: levelNodes, size, i, node, parityBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: parityBad ? "fail" : "parity pass", stage: 1,
        event: parityBad ? "parity-fail" : "parity-pass", codeLine: 9,
        title: parityBad
          ? { vi: `${node.val} sai parity`, en: `${node.val} has the wrong parity` }
          : { vi: `${node.val} đúng parity ${rule.parity}`, en: `${node.val} has the required ${rule.parity} parity` },
        note: parityBad
          ? { vi: `node.val % 2 bằng level % 2, nên parity_bad = True.`, en: `node.val % 2 equals level % 2, so parity_bad = True.` }
          : { vi: `node.val % 2 khác level % 2, đúng quy tắc của level ${level}.`, en: `node.val % 2 differs from level % 2, satisfying level ${level}'s parity rule.` },
        formula: `${node.val} % 2 == ${level} % 2 → ${parityBad ? "True" : "False"}`,
        active: [node.id],
      });

      const orderBad = level % 2 === 0 ? node.val <= previous : node.val >= previous;
      const comparison = `${node.val} ${rule.symbol} ${sentinelText(previous)}`;
      sub[node.id] = `${rule.parity} ${parityBad ? "✗" : "✓"} · ${comparison} ${orderBad ? "✗" : "✓"}`;
      debugStep({
        nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: orderBad ? "fail" : parityBad ? "fail" : "order pass", stage: 1,
        event: orderBad ? "order-fail" : "order-pass", codeLine: 10,
        title: orderBad
          ? { vi: `${comparison} sai`, en: `${comparison} fails` }
          : { vi: `${comparison} đúng`, en: `${comparison} passes` },
        note: orderBad
          ? { vi: `Thứ tự phải ${rule.vi}; node hiện tại không đi đúng hướng so với prev.`, en: `Values must be ${rule.en}; the current node does not move in the required direction from prev.` }
          : { vi: "So sánh với prev đạt yêu cầu nghiêm ngặt; giá trị bằng nhau cũng sẽ FAIL.", en: "The strict comparison with prev passes; equal values would fail." },
        formula: level % 2 === 0
          ? `${node.val} <= ${sentinelText(previous)} → ${orderBad ? "True" : "False"}`
          : `${node.val} >= ${sentinelText(previous)} → ${orderBad ? "True" : "False"}`,
        active: [node.id],
      });

      if (parityBad || orderBad) {
        answer = false;
        bad.add(node.id);
        const reasons = [parityBad ? "parity_bad" : null, orderBad ? "order_bad" : null].filter(Boolean).join(" OR ");
        debugStep({
          nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
          currentCount: size - i - 1, rowState: "fail", stage: 3, event: "fail", codeLine: 11,
          status: "danger", final: true, result: false,
          title: { vi: `FAIL tại node ${node.val} · return False`, en: `FAIL at node ${node.val} · return False` },
          note: { vi: `${reasons} = True. Thuật toán dừng ngay; không cập nhật prev và không enqueue child của node này.`, en: `${reasons} = True. Stop immediately without updating prev or enqueuing this node's children.` },
          formula: `${boolText(parityBad)} OR ${boolText(orderBad)} → True · return False`,
          active: [node.id],
        });
        return { input, answer, steps };
      }

      debugStep({
        nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "pass", stage: 1, event: "pass-node", codeLine: 11,
        title: { vi: `Node ${node.val} PASS cả hai điều kiện`, en: `Node ${node.val} passes both checks` },
        note: { vi: "parity_bad và order_bad đều False, nên không return sớm.", en: "Both parity_bad and order_bad are false, so there is no early return." },
        formula: "False OR False → False · continue",
        active: [node.id],
      });

      previous = node.val;
      previousNode = node;
      sub[node.id] = `prev = ${node.val} · PASS`;
      debugStep({
        nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "pass", stage: 2, event: "update-prev", codeLine: 12,
        title: { vi: `Cập nhật prev = ${node.val}`, en: `Update prev = ${node.val}` },
        note: { vi: "Node kế bên phải phải tiếp tục tăng hoặc giảm nghiêm ngặt từ giá trị này.", en: "The next node to the right must continue strictly increasing or decreasing from this value." },
        formula: `prev = node.val = ${node.val}`,
        active: [node.id],
      });

      if (node.left) queue.push(node.left);
      debugStep({
        nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "pass", stage: 2,
        event: node.left ? "enqueue-left" : "skip-left", codeLine: 13,
        title: node.left
          ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left
          ? { vi: `${node.left.val} nằm ở phần xanh dương và chỉ được kiểm tra ở level kế.`, en: `${node.left.val} sits in the blue section and is checked only on the next level.` }
          : { vi: "Queue không đổi ở dòng này.", en: "The queue does not change on this line." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
        active: [node.id],
      });

      if (node.right) queue.push(node.right);
      debugStep({
        nodes: levelNodes, size, i, node, parityBad, orderBad, currentIndex: i, processedCount: i + 1,
        currentCount: size - i - 1, rowState: "pass", stage: 2,
        event: node.right ? "enqueue-right" : "skip-right", codeLine: 14,
        title: node.right
          ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right
          ? { vi: "Con phải vào sau con trái, nên thứ tự trái → phải của level được giữ nguyên.", en: "The right child enters after the left child, preserving the level's left-to-right order." }
          : { vi: "Không có node nào được thêm ở phía phải.", en: "No node is added from the right side." },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
        active: [node.id],
      });
    }

    completedRows.push(rowFor({ nodes: levelNodes, rowLevel: level, processedCount: size, complete: true }));
    level += 1;
    previous = null;
    previousNode = null;
    debugStep({
      stage: 2, event: "level-complete", codeLine: 15, currentCount: 0,
      title: { vi: `Level trước PASS · chuyển sang level ${level}`, en: `Previous level passed · advance to level ${level}` },
      note: { vi: `Tăng level để đổi parity và chiều so sánh; queue hiện là [${queueText().join(", ")}].`, en: `Increment level to switch parity and comparison direction; the queue is now [${queueText().join(", ")}].` },
      formula: `level = ${level - 1} + 1 = ${level}`,
    });
  }

  debugStep({
    stage: 0, event: "while-stop", codeLine: 5, currentCount: 0,
    title: { vi: "Queue rỗng: thoát vòng while", en: "Queue is empty: exit the while loop" },
    note: { vi: "Mọi node đều đã vượt qua cả kiểm tra parity và thứ tự.", en: "Every node passed both the parity and ordering checks." },
    formula: "bool(queue) = False",
  });
  debugStep({
    stage: 3, event: "done", codeLine: 16, currentCount: 0, status: "success", final: true, result: true,
    title: { vi: "Mọi level đều PASS · return True", en: "Every level passed · return True" },
    note: { vi: "Level chẵn chứa số lẻ tăng nghiêm ngặt; level lẻ chứa số chẵn giảm nghiêm ngặt.", en: "Even-indexed levels contain strictly increasing odd values; odd-indexed levels contain strictly decreasing even values." },
    formula: "return True",
  });
  return { input, answer, steps };
}

function build2415(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: [], steps: [emptyResult(2415, "reverse-odd", root, "[]", 3)] };
  const steps = [];
  const queue = [root];
  const completedRows = [];
  const done = new Set();
  const sub = {};
  let level = 0;
  const queueText = () => queue.map((node) => node.val);
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const rowFor = ({ nodes, before, target, written = 0, currentIndex = -1, state = "waiting", complete = false }) => ({
    level,
    status: complete ? "sorted" : undefined,
    before: [...before],
    secondary: [...target],
    working: nodes.map((node) => node.val),
    swap: currentIndex >= 0 ? [currentIndex] : [],
    values: nodes.map((node, index) => ({
      id: node.id,
      value: node.val,
      tone: index === currentIndex ? "warning" : index < written ? "success" : "neutral",
      meta: index === currentIndex ? state : index < written ? (level % 2 ? "reversed" : "kept") : "waiting",
    })),
    metric: { label: level % 2 ? "odd → reverse" : "even → keep", value: `[${nodes.map((node) => node.val).join(", ")}]` },
  });
  const debugStep = ({
    nodes = null, before = [], target = [], written = 0, currentIndex = -1, state = "waiting",
    currentCount = 0, node = null, value = "—", title, note, codeLine, event,
    stage = 1, formula = null, active = [], final = false, status = "checking", result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, rowFor({ nodes, before, target, written, currentIndex, state })]
      : completedRows;
    steps.push(makeStep({
      problemId: 2415, mode: "reverse-odd", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows, queue: queueSnapshot(currentCount),
      queueNote: { vi: "vàng = level hiện tại · xanh dương = level kế", en: "amber = current level · blue = next level" },
      active, done, sub, formula,
      vars: [
        { name: "queue", value: queueText() },
        { name: "level", value: level },
        { name: "nodes", value: nodes ? nodes.map((item) => item.val) : [] },
        { name: "values", value: target.length ? target : "—" },
        { name: "node", value: node ? node.val : "—" },
        { name: "value", value },
      ],
      cards: [
        { label: "level", value: level, tone: level % 2 ? "warning" : "neutral" },
        { label: { vi: "CHẴN / LẺ", en: "PARITY" }, value: level % 2 ? "ODD" : "EVEN" },
        { label: "before", value: before.length ? `[${before.join(", ")}]` : "—" },
        { label: "target", value: target.length ? `[${target.join(", ")}]` : "—", tone: target.length ? "success" : "neutral" },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: "queue", value: `[${queueText().join(", ")}]` },
      ],
    }));
  };

  debugStep({
    stage: 0, event: "init", codeLine: 3, currentCount: 1, active: [root.id],
    title: { vi: `Khởi tạo queue = [${root.val}], level = 0`, en: `Initialize queue = [${root.val}], level = 0` },
    note: { vi: "Chỉ level lẻ mới đảo value; cấu trúc cây luôn giữ nguyên.", en: "Only odd levels reverse values; the tree structure never changes." },
    formula: `queue = [${root.val}] · level = 0`,
  });

  while (queue.length) {
    const size = queue.length;
    const levelNodes = queue.slice(0, size);
    debugStep({
      nodes: levelNodes, before: levelNodes.map((node) => node.val), target: levelNodes.map((node) => node.val),
      currentCount: size, stage: 0, event: "while-check", codeLine: 4,
      title: { vi: `Queue chưa rỗng: bắt đầu level ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Khóa ${size} node đang có trong queue thành một level.`, en: `Lock the ${size} node(s) currently in the queue as one level.` },
      formula: `bool(queue) = True · size = ${size}`,
    });

    const nodes = queue.splice(0, size);
    const before = nodes.map((node) => node.val);
    let target = [...before];
    debugStep({
      nodes, before, target, stage: 0, event: "collect-level", codeLine: 5,
      title: { vi: `Pop trọn level ${level}: [${before}]`, en: `Pop all of level ${level}: [${before}]` },
      note: { vi: "List nodes giữ các node vừa pop; queue tạm rỗng trước khi append children.", en: "The nodes list holds the popped nodes; the queue is temporarily empty before appending children." },
      formula: `nodes = [${before.join(", ")}]`,
    });

    const odd = level % 2 === 1;
    debugStep({
      nodes, before, target, stage: 1, event: "parity-check", codeLine: 6,
      title: odd ? { vi: `${level} là level lẻ → vào nhánh reverse`, en: `${level} is odd → enter the reverse block` }
        : { vi: `${level} là level chẵn → bỏ qua reverse`, en: `${level} is even → skip the reverse block` },
      note: odd ? { vi: "Bước kế sẽ đọc list value từ phải sang trái.", en: "The next step reads the value list from right to left." }
        : { vi: "Các node giữ nguyên value và chuyển thẳng sang bước enqueue child.", en: "Nodes keep their values and move directly to child enqueueing." },
      formula: `${level} % 2 == 1 → ${odd ? "True" : "False"}`,
    });

    let written = odd ? 0 : nodes.length;
    if (odd) {
      target = [...before].reverse();
      debugStep({
        nodes, before, target, stage: 1, event: "reverse", codeLine: 7,
        title: { vi: `Đảo list value: [${before}] → [${target}]`, en: `Reverse the value list: [${before}] → [${target}]` },
        note: { vi: "Đây mới là target; cây chưa đổi cho tới dòng gán node.val.", en: "This is only the target; the tree does not change until node.val is assigned." },
        formula: `values = [${before.join(", ")}][::-1] = [${target.join(", ")}]`,
      });

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        const value = target[index];
        debugStep({
          nodes, before, target, written, currentIndex: index, state: "zip pair", node, value,
          stage: 1, event: "zip-pair", codeLine: 8, active: [node.id],
          title: { vi: `Ghép node vị trí ${index} với value ${value}`, en: `Pair node at index ${index} with value ${value}` },
          note: { vi: `zip chọn cặp (node ${node.val}, value ${value}); chưa gán ở dòng này.`, en: `zip selects (node ${node.val}, value ${value}); this line does not assign yet.` },
          formula: `(node, value) = (${node.val}, ${value})`,
        });
        const oldValue = node.val;
        node.val = value;
        written += 1;
        sub[node.id] = `${oldValue} → ${value}`;
        debugStep({
          nodes, before, target, written, currentIndex: index, state: "assigned", node, value,
          stage: 2, event: "assign", codeLine: 9, active: [node.id],
          title: { vi: `Gán ${oldValue} → ${value}`, en: `Assign ${oldValue} → ${value}` },
          note: { vi: "Value đổi tại chỗ, còn node và mọi cạnh vẫn ở nguyên vị trí.", en: "The value changes in place while the node and every edge stay put." },
          formula: `node.val = ${value}`,
        });
      }
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      debugStep({
        nodes, before, target, written, currentIndex: index, state: "scan children", node,
        stage: 1, event: "child-loop", codeLine: 10, active: [node.id],
        title: { vi: `Xét children của node ${node.val}`, en: `Inspect children of node ${node.val}` },
        note: { vi: `Đây là node ${index + 1}/${nodes.length}; children sẽ tạo level ${level + 1}.`, en: `This is node ${index + 1}/${nodes.length}; its children build level ${level + 1}.` },
        formula: `for node in nodes → ${node.val}`,
      });

      if (node.left) queue.push(node.left);
      debugStep({
        nodes, before, target, written, currentIndex: index, state: "left checked", node,
        stage: 1, event: node.left ? "enqueue-left" : "skip-left", codeLine: 11, active: [node.id],
        title: node.left ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left ? { vi: "Con trái vào queue trước con phải.", en: "The left child enters the queue before the right child." }
          : { vi: "Queue không đổi.", en: "The queue is unchanged." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
      });

      if (node.right) queue.push(node.right);
      debugStep({
        nodes, before, target, written, currentIndex: index, state: "right checked", node,
        stage: 1, event: node.right ? "enqueue-right" : "skip-right", codeLine: 12, active: [node.id],
        title: node.right ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right ? { vi: "Thứ tự trái → phải của level kế tiếp được giữ nguyên.", en: "The next level keeps left-to-right order." }
          : { vi: "Không có node nào được thêm ở phía phải.", en: "No node is appended from the right side." },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
      });
      done.add(node.id);
    }

    completedRows.push(rowFor({ nodes, before, target, written: nodes.length, complete: true }));
    const finishedLevel = level;
    level += 1;
    debugStep({
      stage: 2, event: "level-complete", codeLine: 13,
      title: { vi: `Level ${finishedLevel} xong → level = ${level}`, en: `Level ${finishedLevel} done → level = ${level}` },
      note: { vi: `Queue cho level kế là [${queueText()}].`, en: `The next level queue is [${queueText()}].` },
      formula: `level = ${finishedLevel} + 1 = ${level}`,
    });
  }

  debugStep({
    stage: 0, event: "while-stop", codeLine: 4,
    title: { vi: "Queue rỗng: dừng BFS", en: "Queue is empty: stop BFS" },
    note: { vi: "Mọi level lẻ đã được đảo, mọi level chẵn được giữ nguyên.", en: "Every odd level was reversed and every even level was preserved." },
    formula: "bool(queue) = False",
  });
  const answer = serializeTree(root);
  debugStep({
    stage: 3, event: "done", codeLine: 14, status: "success", final: true, result: answer,
    title: { vi: "Trả về cây đã cập nhật", en: "Return the updated tree" },
    note: { vi: "So sánh BEFORE → AFTER ở từng hàng để thấy chính xác value nào đổi chỗ.", en: "Compare BEFORE → AFTER in each row to see exactly which values moved." },
    formula: `return root → ${JSON.stringify(answer)}`,
  });
  return { input, answer, steps };
}

function build2471(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: 0, steps: [emptyResult(2471, "level-sort", root, 0, 3)] };
  const steps = [];
  const queue = [root];
  const completedRows = [];
  const done = new Set();
  let answer = 0;
  let level = 0;
  const queueText = () => queue.map((node) => node.val);
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const mapText = (position) => position ? `{${[...position.entries()].map(([value, index]) => `${value}:${index}`).join(", ")}}` : "—";
  const rowFor = ({ nodes, before, values, target, active = [], state = "waiting", swaps = 0, complete = false }) => ({
    level,
    status: complete ? "sorted" : undefined,
    before: [...before],
    secondary: [...target],
    working: [...values],
    swap: [...active],
    values: nodes.map((node, index) => ({
      id: node.id,
      value: values[index],
      tone: active.includes(index) ? "warning" : values[index] === target[index] ? "success" : "neutral",
      meta: active.includes(index) ? state : values[index] === target[index] ? "correct" : `slot ${index}`,
    })),
    metric: { label: "level swaps", value: swaps },
  });
  const debugStep = ({
    nodes = null, before = [], values = [], target = [], position = null, swaps = 0,
    i = "—", wanted = "—", j = "—", activeSlots = [], rowState = "waiting",
    currentCount = 0, node = null, title, note, codeLine, event, stage = 1,
    formula = null, active = [], complete = false, final = false, status = "checking", result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, rowFor({ nodes, before, values, target, active: activeSlots, state: rowState, swaps, complete })]
      : completedRows;
    steps.push(makeStep({
      problemId: 2471, mode: "level-sort", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows, queue: queueSnapshot(currentCount),
      queueNote: { vi: "vàng = level hiện tại · xanh dương = level kế", en: "amber = current level · blue = next level" },
      active, done, formula,
      vars: [
        { name: "queue", value: queueText() },
        { name: "answer", value: answer },
        { name: "level", value: level },
        { name: "nodes", value: nodes ? nodes.map((item) => item.val) : [] },
        { name: "values", value: values.length ? values : "—" },
        { name: "target", value: target.length ? target : "—" },
        { name: "pos", value: mapText(position) },
        { name: "i / wanted / j", value: `${i} / ${wanted} / ${j}` },
      ],
      cards: [
        { label: "level", value: level },
        { label: "values", value: values.length ? `[${values.join(", ")}]` : "—" },
        { label: "target", value: target.length ? `[${target.join(", ")}]` : "—", tone: target.length ? "success" : "neutral" },
        { label: "i / wanted", value: `${i} / ${wanted}` },
        { label: "j", value: j },
        { label: "level / total swaps", value: `${swaps} / ${answer}`, tone: swaps ? "warning" : "neutral" },
      ],
    }));
  };

  debugStep({
    stage: 0, event: "init", codeLine: 3, currentCount: 1, active: [root.id],
    title: { vi: `Khởi tạo queue = [${root.val}], answer = 0`, en: `Initialize queue = [${root.val}], answer = 0` },
    note: { vi: "Mỗi level được sort độc lập; answer cộng số swap của tất cả level.", en: "Each level is sorted independently; answer adds swaps from every level." },
    formula: `queue = [${root.val}] · answer = 0`,
  });

  while (queue.length) {
    const size = queue.length;
    const preview = queue.slice(0, size);
    const previewValues = preview.map((node) => node.val);
    debugStep({
      nodes: preview, before: previewValues, values: previewValues, target: previewValues,
      currentCount: size, stage: 0, event: "while-check", codeLine: 4,
      title: { vi: `Queue chưa rỗng: bắt đầu level ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Khóa ${size} node để children append sau đó không lẫn vào level này.`, en: `Lock ${size} node(s) so appended children cannot leak into this level.` },
      formula: `bool(queue) = True · size = ${size}`,
    });

    const nodes = queue.splice(0, size);
    const before = nodes.map((node) => node.val);
    const values = [...before];
    let target = [...before];
    let position = null;
    let swaps = 0;
    debugStep({
      nodes, before, values, target, swaps, stage: 0, event: "collect-level", codeLine: 5,
      title: { vi: `Pop level ${level}: nodes = [${before}]`, en: `Pop level ${level}: nodes = [${before}]` },
      note: { vi: "Queue tạm rỗng; list nodes giữ đúng thứ tự trái → phải.", en: "The queue is temporarily empty; nodes preserves left-to-right order." },
      formula: `nodes = [${before.join(", ")}]`,
    });

    debugStep({
      nodes, before, values, target, swaps, stage: 0, event: "copy-values", codeLine: 6,
      title: { vi: `Sao chép value: [${values}]`, en: `Copy node values: [${values}]` },
      note: { vi: "Ta sort và swap trên mảng values; node trong cây không bị đổi value.", en: "We sort and swap the values array; tree-node values are not mutated." },
      formula: `values = [node.val for node in nodes] = [${values.join(", ")}]`,
    });

    target = [...values].sort((a, b) => a - b);
    debugStep({
      nodes, before, values, target, swaps, stage: 1, event: "build-target", codeLine: 7,
      title: { vi: `Tạo target tăng dần: [${target}]`, en: `Build ascending target: [${target}]` },
      note: { vi: "Mỗi index i phải nhận đúng target[i].", en: "Each index i must receive target[i]." },
      formula: `target = sorted([${values.join(", ")}]) = [${target.join(", ")}]`,
    });

    position = new Map(values.map((value, index) => [value, index]));
    debugStep({
      nodes, before, values, target, position, swaps, stage: 1, event: "build-position", codeLine: 8,
      title: { vi: "Lập bảng value → index hiện tại", en: "Build the current value → index map" },
      note: { vi: `pos = ${mapText(position)} giúp tìm O(1) vị trí của value đang cần.`, en: `pos = ${mapText(position)} finds the needed value's position in O(1).` },
      formula: `pos = ${mapText(position)}`,
    });

    for (let i = 0; i < target.length; i += 1) {
      const wanted = target[i];
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, stage: 1,
        event: "target-loop", codeLine: 9, activeSlots: [i], active: [nodes[i].id],
        title: { vi: `Index ${i} cần value ${wanted}`, en: `Index ${i} needs value ${wanted}` },
        note: { vi: `Hiện values[${i}] = ${values[i]}; so với target[${i}] = ${wanted}.`, en: `Currently values[${i}] = ${values[i]}; compare it with target[${i}] = ${wanted}.` },
        formula: `i = ${i} · wanted = ${wanted}`,
      });

      const mismatch = values[i] !== wanted;
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, stage: 1,
        event: mismatch ? "needs-swap" : "already-correct", codeLine: 10,
        activeSlots: [i], rowState: mismatch ? "wrong" : "correct", active: [nodes[i].id],
        title: mismatch ? { vi: `${values[i]} ≠ ${wanted} → cần swap`, en: `${values[i]} ≠ ${wanted} → swap needed` }
          : { vi: `${values[i]} = ${wanted} → index này đã đúng`, en: `${values[i]} = ${wanted} → this index is correct` },
        note: mismatch ? { vi: "Dùng pos để nhảy thẳng tới nơi value wanted đang đứng.", en: "Use pos to jump directly to where the wanted value currently sits." }
          : { vi: "Không tăng answer và chuyển sang index kế tiếp.", en: "Do not increment answer; continue to the next index." },
        formula: `${values[i]} != ${wanted} → ${mismatch ? "True" : "False"}`,
      });
      if (!mismatch) continue;

      const j = position.get(wanted);
      const displaced = values[i];
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, j, stage: 1,
        event: "find-swap-index", codeLine: 11, activeSlots: [i, j], active: [nodes[i].id, nodes[j].id],
        title: { vi: `Tìm thấy ${wanted} tại j = ${j}`, en: `Find ${wanted} at j = ${j}` },
        note: { vi: `Sẽ đổi values[${i}] = ${displaced} với values[${j}] = ${wanted}.`, en: `Swap values[${i}] = ${displaced} with values[${j}] = ${wanted}.` },
        formula: `j = pos[${wanted}] = ${j}`,
      });

      position.set(displaced, j);
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, j, stage: 1,
        event: "move-displaced-position", codeLine: 12, activeSlots: [i, j], active: [nodes[i].id, nodes[j].id],
        title: { vi: `Cập nhật vị trí tương lai của ${displaced} thành ${j}`, en: `Update ${displaced}'s future position to ${j}` },
        note: { vi: "Bảng pos được chuẩn bị trước khi mảng values thực hiện swap ở dòng kế.", en: "The position map is prepared before values performs the swap on the next line." },
        formula: `pos[${displaced}] = ${j}`,
      });

      [values[i], values[j]] = [values[j], values[i]];
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, j, stage: 1,
        event: "swap", codeLine: 13, activeSlots: [i, j], rowState: "swapped", active: [nodes[i].id, nodes[j].id],
        title: { vi: `Swap index ${i} ↔ ${j}`, en: `Swap indices ${i} ↔ ${j}` },
        note: { vi: `values trở thành [${values}]; index ${i} đã khớp target.`, en: `values becomes [${values}]; index ${i} now matches target.` },
        formula: `[${displaced}, ${wanted}] → [${wanted}, ${displaced}]`,
      });

      position.set(wanted, i);
      swaps += 1;
      answer += 1;
      debugStep({
        nodes, before, values, target, position, swaps, i, wanted, j, stage: 2,
        event: "count-swap", codeLine: 14, activeSlots: [i], rowState: "fixed", active: [nodes[i].id],
        title: { vi: `Chốt pos[${wanted}] = ${i}; answer = ${answer}`, en: `Set pos[${wanted}] = ${i}; answer = ${answer}` },
        note: { vi: `Swap vừa rồi đặt ${wanted} đúng vị trí và tăng bộ đếm đúng một lần.`, en: `The swap places ${wanted} correctly and increments the counter exactly once.` },
        formula: `pos[${wanted}] = ${i} · answer += 1 → ${answer}`,
      });
    }

    debugStep({
      nodes, before, values, target, position, swaps, complete: true, stage: 2,
      event: "sorted", codeLine: 15, active: nodes.map((node) => node.id),
      title: { vi: `Level ${level} đã sort với ${swaps} swap`, en: `Level ${level} is sorted with ${swaps} swap(s)` },
      note: { vi: `[${values}] đã bằng target; giờ enqueue children để sang level kế.`, en: `[${values}] now equals target; enqueue children for the next level.` },
      formula: `[${values.join(", ")}] = [${target.join(", ")}]`,
    });

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      debugStep({
        nodes, before, values, target, position, swaps, i: index, complete: true,
        stage: 2, event: "child-loop", codeLine: 15, active: [node.id],
        title: { vi: `Xét children của node ${node.val}`, en: `Inspect children of node ${node.val}` },
        note: { vi: `Node ${index + 1}/${nodes.length}; cây vẫn giữ các value gốc.`, en: `Node ${index + 1}/${nodes.length}; the tree still keeps its original values.` },
        formula: `for node in nodes → ${node.val}`,
      });
      if (node.left) queue.push(node.left);
      debugStep({
        nodes, before, values, target, position, swaps, i: index, complete: true,
        stage: 2, event: node.left ? "enqueue-left" : "skip-left", codeLine: 16, active: [node.id],
        title: node.left ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left ? { vi: "Child này thuộc level kế tiếp.", en: "This child belongs to the next level." }
          : { vi: "Queue không đổi.", en: "The queue is unchanged." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
      });
      if (node.right) queue.push(node.right);
      debugStep({
        nodes, before, values, target, position, swaps, i: index, complete: true,
        stage: 2, event: node.right ? "enqueue-right" : "skip-right", codeLine: 17, active: [node.id],
        title: node.right ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right ? { vi: "Con phải vào sau con trái để giữ thứ tự BFS.", en: "The right child follows the left child to preserve BFS order." }
          : { vi: "Không append node ở phía phải.", en: "No node is appended from the right side." },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
      });
      done.add(node.id);
    }
    completedRows.push(rowFor({ nodes, before, values, target, swaps, complete: true }));
    level += 1;
  }

  debugStep({
    stage: 0, event: "while-stop", codeLine: 4,
    title: { vi: "Queue rỗng: mọi level đã hoàn tất", en: "Queue is empty: every level is complete" },
    note: { vi: `Tổng hiện tại là ${answer} swap.`, en: `The running total is ${answer} swap(s).` },
    formula: "bool(queue) = False",
  });
  debugStep({
    stage: 3, event: "done", codeLine: 18, status: "success", final: true, result: answer,
    title: { vi: `Trả về tổng minimum swaps = ${answer}`, en: `Return total minimum swaps = ${answer}` },
    note: { vi: "Mỗi level độc lập, nên tổng các minimum swap theo level là đáp án toàn cây.", en: "Levels are independent, so the sum of their minimum swap counts is the tree-wide answer." },
    formula: `return ${answer}`,
  });
  return { input, answer, steps };
}

function build2583(input, params) {
  const root = parseLevelTree(input);
  const k = Number(params?.k ?? 2);
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer");
  if (!root) return { input, k, answer: -1, steps: [emptyResult(2583, "level-sums", root, -1, 3)] };
  const steps = [];
  const queue = [root];
  const completedRows = [];
  const sums = [];
  const heap = [];
  const done = new Set();
  const sub = {};
  let level = 0;
  const queueText = () => queue.map((node) => node.val);
  const queueSnapshot = (currentCount = 0) => queue.map((node, index) => ({
    node,
    role: index < currentCount ? "current-level" : "next-level",
  }));
  const heapSnapshot = () => heap.map((value, index) => ({
    value,
    role: index === 0 ? "current-level" : "next-level",
    label: index === 0 ? "MIN / k-th" : `KEEP #${index + 1}`,
    meta: `heap[${index}]`,
  }));
  const rowFor = ({ nodes, processedCount = 0, currentIndex = -1, total = 0, complete = false }) => ({
    level,
    status: complete ? "sorted" : undefined,
    values: nodes.map((node, index) => ({
      id: node.id,
      value: node.val,
      tone: index === currentIndex ? "warning" : index < processedCount ? "success" : "neutral",
      meta: index === currentIndex ? "current add" : index < processedCount ? "added" : "waiting",
    })),
    metric: { label: "running sum", value: total },
  });
  const debugStep = ({
    nodes = null, processedCount = 0, currentIndex = -1, total = "—", size = "—",
    i = "—", node = null, currentSum = "—", removed = "—", currentCount = 0,
    heapMode = false, title, note, codeLine, event, stage = 1, formula = null,
    active = [], final = false, status = "checking", result = null,
  }) => {
    const rows = nodes
      ? [...completedRows, rowFor({ nodes, processedCount, currentIndex, total: Number.isFinite(total) ? total : 0 })]
      : completedRows;
    steps.push(makeStep({
      problemId: 2583, mode: "level-sums", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: heapMode ? heapSnapshot() : queueSnapshot(currentCount),
      queueTitle: heapMode ? { vi: `MIN-HEAP · GIỮ K=${k} TỔNG LỚN NHẤT`, en: `MIN-HEAP · KEEP K=${k} LARGEST SUMS` } : "BFS QUEUE",
      queueNote: heapMode
        ? { vi: "phần tử nhỏ nhất ở FRONT; nếu đủ k thì đó là hạng k", en: "the minimum is at the FRONT; with k items it is rank k" }
        : { vi: "vàng = level hiện tại · xanh dương = level kế", en: "amber = current level · blue = next level" },
      active, done, sub, formula,
      vars: [
        { name: "queue", value: heapMode ? "—" : queueText() },
        { name: "sums", value: sums.slice() },
        { name: "level", value: level },
        { name: "size / i", value: `${size} / ${i}` },
        { name: "node", value: node ? node.val : "—" },
        { name: "total", value: total },
        { name: "heap", value: heap.slice() },
        { name: "k", value: k },
        { name: "current sum", value: currentSum },
        { name: "removed", value: removed },
      ],
      cards: heapMode ? [
        { label: "k", value: k },
        { label: { vi: "SUM ĐANG XÉT", en: "CURRENT SUM" }, value: currentSum },
        { label: "heap", value: `[${heap.join(", ")}]`, tone: heap.length === k ? "success" : "warning" },
        { label: "heap size / k", value: `${heap.length} / ${k}` },
        { label: { vi: "ĐÃ BỎ", en: "REMOVED" }, value: removed },
        { label: { vi: "ỨNG VIÊN HẠNG K", en: "RANK-K CANDIDATE" }, value: heap.length === k ? heap[0] : "—", tone: heap.length === k ? "success" : "neutral" },
      ] : [
        { label: "level", value: level },
        { label: { vi: "size (đã khóa)", en: "size (locked)" }, value: size },
        { label: "node", value: node ? node.val : "—", tone: node ? "warning" : "neutral" },
        { label: "running total", value: total, tone: Number.isFinite(total) ? "success" : "neutral" },
        { label: "sums", value: `[${sums.join(", ")}]` },
        { label: "k", value: k },
      ],
    }));
  };

  debugStep({
    stage: 0, event: "guard", codeLine: 3, currentCount: 1, active: [root.id],
    title: { vi: "Kiểm tra root có rỗng không", en: "Check whether root is empty" },
    note: { vi: `root = ${root.val}, nên không return -1 và tiếp tục BFS.`, en: `root = ${root.val}, so do not return -1; continue into BFS.` },
    formula: "not root = False",
  });
  debugStep({
    stage: 0, event: "init", codeLine: 4, currentCount: 1, active: [root.id],
    title: { vi: `Khởi tạo queue = [${root.val}], sums = []`, en: `Initialize queue = [${root.val}], sums = []` },
    note: { vi: "Pha đầu dùng BFS để tính đúng một sum cho mỗi level.", en: "The first phase uses BFS to compute exactly one sum per level." },
    formula: `queue = [${root.val}] · sums = []`,
  });

  while (queue.length) {
    const size = queue.length;
    const nodes = queue.slice(0, size);
    debugStep({
      nodes, size, total: 0, currentCount: size, stage: 0, event: "while-check", codeLine: 5,
      title: { vi: `Queue chưa rỗng: bắt đầu level ${level}`, en: `Queue is not empty: start level ${level}` },
      note: { vi: `Khóa size = ${size}; chỉ ${size} node này được cộng vào total của level.`, en: `Lock size = ${size}; only these ${size} node(s) contribute to this level total.` },
      formula: `bool(queue) = True · size = ${size}`,
    });

    let total = 0;
    debugStep({
      nodes, size, total, currentCount: size, stage: 0, event: "reset-total", codeLine: 6,
      title: { vi: "Reset total = 0", en: "Reset total = 0" },
      note: { vi: "Mỗi level bắt đầu một tổng mới; sums cũ vẫn được giữ riêng.", en: "Each level starts a fresh total; earlier sums remain stored separately." },
      formula: "total = 0",
    });

    for (let i = 0; i < size; i += 1) {
      const node = queue[0];
      debugStep({
        nodes, size, i, node, total, processedCount: i, currentIndex: i,
        currentCount: size - i, stage: 0, event: "level-loop", codeLine: 7, active: [node.id],
        title: { vi: `Lượt ${i + 1}/${size}: FRONT = ${node.val}`, en: `Iteration ${i + 1}/${size}: FRONT = ${node.val}` },
        note: { vi: "range(len(queue)) đã khóa trước khi enqueue children.", en: "range(len(queue)) was fixed before any children are enqueued." },
        formula: `i = ${i} < size = ${size}`,
      });

      queue.shift();
      debugStep({
        nodes, size, i, node, total, processedCount: i + 1, currentIndex: i,
        currentCount: size - i - 1, stage: 0, event: "pop", codeLine: 8, active: [node.id],
        title: { vi: `Pop node ${node.val}`, en: `Pop node ${node.val}` },
        note: { vi: `Queue sau popleft: [${queueText()}].`, en: `Queue after popleft: [${queueText()}].` },
        formula: `node = queue.popleft() = ${node.val}`,
      });

      const beforeTotal = total;
      total += node.val;
      sub[node.id] = `total = ${total}`;
      debugStep({
        nodes, size, i, node, total, processedCount: i + 1, currentIndex: i,
        currentCount: size - i - 1, stage: 1, event: "add-value", codeLine: 9, active: [node.id],
        title: { vi: `Cộng ${node.val}: total = ${total}`, en: `Add ${node.val}: total = ${total}` },
        note: { vi: `Running sum đổi từ ${beforeTotal} thành ${total}.`, en: `The running sum changes from ${beforeTotal} to ${total}.` },
        formula: `${beforeTotal} + ${node.val} = ${total}`,
      });

      if (node.left) queue.push(node.left);
      debugStep({
        nodes, size, i, node, total, processedCount: i + 1, currentIndex: i,
        currentCount: size - i - 1, stage: 1, event: node.left ? "enqueue-left" : "skip-left", codeLine: 10, active: [node.id],
        title: node.left ? { vi: `Enqueue con trái ${node.left.val}`, en: `Enqueue left child ${node.left.val}` }
          : { vi: `${node.val} không có con trái`, en: `${node.val} has no left child` },
        note: node.left ? { vi: "Child nằm ở phần xanh dương và thuộc level kế.", en: "The child sits in the blue section for the next level." }
          : { vi: "Queue không đổi.", en: "The queue is unchanged." },
        formula: node.left ? `queue.append(${node.left.val})` : "node.left = None → skip",
      });

      if (node.right) queue.push(node.right);
      debugStep({
        nodes, size, i, node, total, processedCount: i + 1, currentIndex: i,
        currentCount: size - i - 1, stage: 1, event: node.right ? "enqueue-right" : "skip-right", codeLine: 11, active: [node.id],
        title: node.right ? { vi: `Enqueue con phải ${node.right.val}`, en: `Enqueue right child ${node.right.val}` }
          : { vi: `${node.val} không có con phải`, en: `${node.val} has no right child` },
        note: node.right ? { vi: "Con phải vào sau con trái, giữ đúng thứ tự level.", en: "The right child follows the left child, preserving level order." }
          : { vi: "Không append child bên phải.", en: "No right child is appended." },
        formula: node.right ? `queue.append(${node.right.val})` : "node.right = None → skip",
      });
      done.add(node.id);
    }

    sums.push(total);
    completedRows.push(rowFor({ nodes, processedCount: size, total, complete: true }));
    debugStep({
      size, total, currentCount: 0, stage: 2, event: "append-sum", codeLine: 12,
      title: { vi: `Chốt level ${level}: append sum ${total}`, en: `Finish level ${level}: append sum ${total}` },
      note: { vi: `sums trở thành [${sums}].`, en: `sums becomes [${sums}].` },
      formula: `sums.append(${total}) → [${sums.join(", ")}]`,
    });
    level += 1;
  }

  debugStep({
    size: 0, total: "—", stage: 0, event: "while-stop", codeLine: 5,
    title: { vi: "Queue rỗng: đã có toàn bộ level sums", en: "Queue is empty: all level sums are ready" },
    note: { vi: `Có ${sums.length} level với sums = [${sums}].`, en: `There are ${sums.length} levels with sums = [${sums}].` },
    formula: "bool(queue) = False",
  });

  debugStep({
    heapMode: true, stage: 0, event: "heap-init", codeLine: 13,
    title: { vi: "Khởi tạo min-heap rỗng", en: "Initialize an empty min-heap" },
    note: { vi: `Heap sẽ chỉ giữ tối đa k = ${k} tổng lớn nhất đã gặp.`, en: `The heap will keep at most the k = ${k} largest sums seen.` },
    formula: "heap = []",
  });

  for (let index = 0; index < sums.length; index += 1) {
    const currentSum = sums[index];
    debugStep({
      heapMode: true, currentSum, stage: 1, event: "heap-loop", codeLine: 14,
      title: { vi: `Xét level sum ${currentSum}`, en: `Inspect level sum ${currentSum}` },
      note: { vi: `Đây là sum thứ ${index + 1}/${sums.length}.`, en: `This is sum ${index + 1}/${sums.length}.` },
      formula: `total = sums[${index}] = ${currentSum}`,
    });

    heap.push(currentSum);
    heap.sort((a, b) => a - b);
    debugStep({
      heapMode: true, currentSum, stage: 1, event: "heap-push", codeLine: 15,
      title: { vi: `Push ${currentSum} vào min-heap`, en: `Push ${currentSum} into the min-heap` },
      note: { vi: `Heap tạm thời là [${heap}]; minimum luôn đứng ở FRONT.`, en: `The temporary heap is [${heap}]; its minimum is always at the FRONT.` },
      formula: `heappush(heap, ${currentSum}) → [${heap.join(", ")}]`,
    });

    const mustTrim = heap.length > k;
    const beforeTrim = [...heap];
    const removed = mustTrim ? heap.shift() : null;
    debugStep({
      heapMode: true, currentSum, removed: removed ?? "—", stage: 2,
      event: mustTrim ? "heap-trim" : "heap-keep", codeLine: 16,
      title: mustTrim ? { vi: `Heap vượt k → bỏ minimum ${removed}`, en: `Heap exceeds k → remove minimum ${removed}` }
        : { vi: `Heap size ${heap.length} ≤ k → giữ nguyên`, en: `Heap size ${heap.length} ≤ k → keep it` },
      note: mustTrim ? { vi: `Bỏ ${removed} vì nó không thể nằm trong k tổng lớn nhất; heap còn [${heap}].`, en: `Remove ${removed} because it cannot belong to the k largest sums; heap is [${heap}].` }
        : { vi: `Chưa có hơn ${k} ứng viên nên không pop.`, en: `There are no more than ${k} candidates yet, so do not pop.` },
      formula: mustTrim ? `[${beforeTrim.join(", ")}] → pop min ${removed} → [${heap.join(", ")}]` : `${heap.length} > ${k} → False`,
    });
  }

  const answer = heap.length === k ? heap[0] : -1;
  debugStep({
    heapMode: true, currentSum: "—", stage: 3, event: "done", codeLine: 17,
    status: answer === -1 ? "danger" : "success", final: true, result: answer,
    title: answer === -1 ? { vi: `Chỉ có ${heap.length} level < k=${k} → return -1`, en: `Only ${heap.length} levels < k=${k} → return -1` }
      : { vi: `Heap minimum ${answer} là tổng lớn thứ ${k}`, en: `Heap minimum ${answer} is the ${k}-th largest sum` },
    note: answer === -1 ? { vi: "Không tồn tại đủ k level để xếp hạng.", en: "There are not enough levels to define rank k." }
      : { vi: `Heap giữ đúng k tổng lớn nhất; phần tử nhỏ nhất trong nhóm đó là hạng ${k}.`, en: `The heap holds exactly the k largest sums; the smallest among them is rank k.` },
    formula: `return ${answer}`,
  });
  return { input, k, answer, steps };
}

function build2641(input) {
  const root = parseLevelTree(input);
  if (!root) return { input, answer: [], steps: [emptyResult(2641, "cousin-sum", root, "[]", 3)] };
  const steps = [];
  const completedRows = [];
  const done = new Set();
  const sub = {};
  let parents = [];
  let depth = 0;
  const listText = (nodes) => `[${nodes.map((node) => node.val).join(", ")}]`;
  const frontierSnapshot = (parentNodes = parents, childNodes = [], activeParent = null, activeChild = null) => [
    ...parentNodes.map((node, index) => ({
      node,
      role: "current-level",
      label: node.id === activeParent?.id ? "CURRENT PARENT" : `PARENT ${index + 1}`,
      meta: `now ${node.val}`,
    })),
    ...childNodes.map((node, index) => ({
      node,
      role: "next-level",
      label: node.id === activeChild?.id ? "CURRENT CHILD" : `CHILD ${index + 1}`,
      meta: `original ${node.original}`,
    })),
  ];
  const rowFor = ({ children, before, target = null, updated = new Set(), activeIds = [], complete = false, levelSum = "—" }) => ({
    level: depth,
    status: complete ? "sorted" : undefined,
    before: [...before],
    secondary: target ? [...target] : undefined,
    working: children.map((node) => node.val),
    swap: children.map((node, index) => activeIds.includes(node.id) ? index : -1).filter((index) => index >= 0),
    values: children.map((node) => ({
      id: node.id,
      value: node.val,
      tone: activeIds.includes(node.id) ? "warning" : updated.has(node.id) ? "success" : "neutral",
      meta: activeIds.includes(node.id) ? "current group" : updated.has(node.id) ? `new ${node.val}` : "waiting",
    })),
    metric: { label: "level_sum", value: levelSum },
  });
  const debugStep = ({
    children = null, before = [], target = null, updated = new Set(), activeIds = [],
    levelSum = "—", parent = null, siblingValues = [], siblingSum = "—", child = null,
    replacement = "—", frontier = null, title, note, codeLine, event, stage = 1,
    formula = null, active = [], final = false, status = "checking", result = null,
  }) => {
    const rows = children && children.length
      ? [...completedRows, rowFor({ children, before, target, updated, activeIds, levelSum })]
      : completedRows;
    steps.push(makeStep({
      problemId: 2641, mode: "cousin-sum", root, stage, event, status, final, result,
      title, note, codeLines: [codeLine], rows,
      queue: frontier || frontierSnapshot(parents, children || [], parent, child),
      queueTitle: { vi: "PARENTS HIỆN TẠI → CHILDREN LEVEL KẾ", en: "CURRENT PARENTS → NEXT-LEVEL CHILDREN" },
      queueNote: { vi: "cam = parent đang xử lý · xanh dương = child cùng level_sum", en: "amber = current parent · blue = children sharing one level_sum" },
      active, done, sub, formula,
      vars: [
        { name: "parents", value: parents.map((node) => node.val) },
        { name: "children", value: children ? children.map((node) => node.val) : [] },
        { name: "depth", value: depth },
        { name: "level_sum", value: levelSum },
        { name: "parent", value: parent ? `${parent.original}→${parent.val}` : "—" },
        { name: "siblings", value: siblingValues.length ? siblingValues : "[]" },
        { name: "sibling_sum", value: siblingSum },
        { name: "child", value: child ? child.val : "None" },
        { name: "new value", value: replacement },
      ],
      cards: [
        { label: "depth", value: depth },
        { label: "level_sum", value: levelSum, tone: Number.isFinite(levelSum) ? "success" : "neutral" },
        { label: { vi: "PARENT GỐC → HIỆN TẠI", en: "PARENT ORIGINAL → NOW" }, value: parent ? `${parent.original} → ${parent.val}` : "—" },
        { label: { vi: "NHÓM SIBLING GỐC", en: "ORIGINAL SIBLING GROUP" }, value: siblingValues.length ? `[${siblingValues.join(", ")}]` : "[]" },
        { label: "sibling_sum", value: siblingSum },
        { label: "cousin sum", value: replacement, tone: Number.isFinite(replacement) ? "success" : "neutral" },
      ],
    }));
  };

  debugStep({
    stage: 0, event: "guard", codeLine: 3,
    frontier: [{ node: root, role: "current-level", label: "ROOT", meta: `original ${root.original}` }],
    active: [root.id],
    title: { vi: "Kiểm tra root có rỗng không", en: "Check whether root is empty" },
    note: { vi: `root = ${root.val}, nên không return sớm.`, en: `root = ${root.val}, so do not return early.` },
    formula: "not root = False",
  });

  const rootBefore = root.val;
  root.val = 0;
  done.add(root.id);
  sub[root.id] = `${rootBefore} → 0`;
  completedRows.push({
    level: 0,
    status: "sorted",
    before: [rootBefore],
    secondary: [0],
    working: [0],
    values: [{ id: root.id, value: 0, tone: "success", meta: "root → 0" }],
    metric: { label: "cousin sum", value: 0 },
  });
  debugStep({
    stage: 0, event: "root-zero", codeLine: 4,
    frontier: [{ node: root, role: "current-level", label: "ROOT", meta: `${rootBefore} → 0` }],
    active: [root.id], levelSum: 0, replacement: 0,
    title: { vi: `Root ${rootBefore} → 0`, en: `Root ${rootBefore} → 0` },
    note: { vi: "Root không có cousin nên giá trị mới luôn bằng 0.", en: "The root has no cousins, so its new value is always 0." },
    formula: "root.val = 0",
  });

  parents = [root];
  depth = 1;
  debugStep({
    stage: 0, event: "init-parents", codeLine: 5,
    frontier: frontierSnapshot(parents), active: [root.id],
    title: { vi: "Khởi tạo parents với root", en: "Initialize parents with the root" },
    note: { vi: "Mỗi vòng while dùng parents để tạo toàn bộ children của level kế.", en: "Each while-loop uses parents to build the complete next child level." },
    formula: `parents = [${root.val}]`,
  });

  while (parents.length) {
    debugStep({
      stage: 0, event: "while-check", codeLine: 6, frontier: frontierSnapshot(parents),
      active: parents.map((node) => node.id),
      title: { vi: `parents chưa rỗng: chuẩn bị depth ${depth}`, en: `parents is not empty: prepare depth ${depth}` },
      note: { vi: `Có ${parents.length} parent ở frontier hiện tại.`, en: `There are ${parents.length} parent(s) in the current frontier.` },
      formula: "bool(parents) = True",
    });

    const children = parents.flatMap((node) => [node.left, node.right].filter(Boolean));
    const before = children.map((node) => node.val);
    const beforeById = new Map(children.map((node) => [node.id, node.val]));
    debugStep({
      children, before, target: null, stage: 0, event: "collect-children", codeLine: 7,
      frontier: frontierSnapshot(parents, children), active: children.map((node) => node.id),
      title: children.length ? { vi: `Thu thập children depth ${depth}: [${before}]`, en: `Collect depth-${depth} children: [${before}]` }
        : { vi: "Các parent đều là lá: children = []", en: "Every parent is a leaf: children = []" },
      note: children.length ? { vi: "Phải lấy trọn level trước khi thay bất kỳ value nào.", en: "Collect the entire level before changing any value." }
        : { vi: "Không còn level con; vòng kế tiếp sẽ dừng.", en: "There is no child level; the next loop check will stop." },
      formula: `children = [${before.join(", ")}]`,
    });

    const levelSum = before.reduce((sum, value) => sum + value, 0);
    const targetById = new Map();
    for (const parent of parents) {
      const siblings = [parent.left, parent.right].filter(Boolean);
      const siblingSum = siblings.reduce((sum, node) => sum + (beforeById.get(node.id) ?? 0), 0);
      siblings.forEach((node) => targetById.set(node.id, levelSum - siblingSum));
    }
    const target = children.map((node) => targetById.get(node.id));
    const updated = new Set();
    debugStep({
      children, before, target, updated, levelSum, stage: 1, event: "level-sum", codeLine: 8,
      frontier: frontierSnapshot(parents, children), active: children.map((node) => node.id),
      title: { vi: `Tổng depth ${depth} = ${levelSum}`, en: `Depth ${depth} total = ${levelSum}` },
      note: children.length ? { vi: `Cộng các value gốc trước khi sửa: ${before.join(" + ")} = ${levelSum}.`, en: `Add original values before mutation: ${before.join(" + ")} = ${levelSum}.` }
        : { vi: "Level rỗng có tổng 0.", en: "An empty level has total 0." },
      formula: before.length ? `${before.join(" + ")} = ${levelSum}` : "sum([]) = 0",
    });

    for (const parent of parents) {
      const siblings = [parent.left, parent.right].filter(Boolean);
      const siblingValues = siblings.map((node) => beforeById.get(node.id));
      const siblingSum = siblingValues.reduce((sum, value) => sum + value, 0);
      const replacement = levelSum - siblingSum;
      const siblingIds = siblings.map((node) => node.id);
      debugStep({
        children, before, target, updated, activeIds: siblingIds, levelSum, parent,
        siblingValues, siblingSum: "—", replacement: "—", stage: 1, event: "parent-loop", codeLine: 9,
        frontier: frontierSnapshot(parents, children, parent), active: [parent.id, ...siblingIds],
        title: { vi: `Xét nhóm con của parent ${parent.original}`, en: `Inspect children of parent ${parent.original}` },
        note: siblings.length ? { vi: `Nhóm này là [${siblingValues}]; cả nhóm phải bị loại khỏi level_sum.`, en: `This group is [${siblingValues}]; the entire group must be excluded from level_sum.` }
          : { vi: "Parent này không có child; nhóm sibling rỗng.", en: "This parent has no children; its sibling group is empty." },
        formula: `for parent in parents → ${parent.original}`,
      });

      debugStep({
        children, before, target, updated, activeIds: siblingIds, levelSum, parent,
        siblingValues, siblingSum, replacement, stage: 1, event: "sibling-sum", codeLine: 10,
        frontier: frontierSnapshot(parents, children, parent), active: [parent.id, ...siblingIds],
        title: { vi: `sibling_sum = ${siblingSum}`, en: `sibling_sum = ${siblingSum}` },
        note: siblings.length ? { vi: `Cộng value gốc của mọi child cùng parent: ${siblingValues.join(" + ")} = ${siblingSum}.`, en: `Add the original values of all children sharing this parent: ${siblingValues.join(" + ")} = ${siblingSum}.` }
          : { vi: "Không có child nên sum của nhóm bằng 0.", en: "There are no children, so the group sum is 0." },
        formula: siblings.length ? `sibling_sum = ${siblingValues.join(" + ")} = ${siblingSum}` : "sibling_sum = sum([]) = 0",
      });

      for (const child of [parent.left, parent.right]) {
        debugStep({
          children, before, target, updated, activeIds: child ? [child.id] : siblingIds,
          levelSum, parent, siblingValues, siblingSum, child, replacement,
          stage: 1, event: "child-loop", codeLine: 11,
          frontier: frontierSnapshot(parents, children, parent, child), active: child ? [parent.id, child.id] : [parent.id],
          title: child ? { vi: `Xét child gốc ${beforeById.get(child.id)}`, en: `Inspect original child ${beforeById.get(child.id)}` }
            : { vi: "Vị trí child này là None", en: "This child position is None" },
          note: child ? { vi: "Cả left và right child của cùng parent dùng chung một replacement.", en: "Both left and right children of one parent use the same replacement." }
            : { vi: "Vòng for vẫn nhìn vị trí rỗng, nhưng dòng if sẽ bỏ qua.", en: "The loop still sees the empty slot, but the if condition skips it." },
          formula: child ? `child = ${beforeById.get(child.id)}` : "child = None",
        });

        if (child) {
          const oldValue = child.val;
          child.val = replacement;
          updated.add(child.id);
          done.add(child.id);
          sub[child.id] = `${oldValue} → ${replacement}`;
          debugStep({
            children, before, target, updated, activeIds: [child.id], levelSum, parent,
            siblingValues, siblingSum, child, replacement, stage: 2, event: "replace", codeLine: 12,
            frontier: frontierSnapshot(parents, children, parent, child), active: [child.id],
            title: { vi: `Thay ${oldValue} bằng cousin sum ${replacement}`, en: `Replace ${oldValue} with cousin sum ${replacement}` },
            note: { vi: `Lấy tổng cả level ${levelSum}, rồi loại toàn bộ sibling group [${siblingValues}].`, en: `Take the whole-level total ${levelSum}, then exclude the full sibling group [${siblingValues}].` },
            formula: `new value = ${levelSum} − (${siblingValues.join(" + ")}) = ${replacement}`,
          });
        } else {
          debugStep({
            children, before, target, updated, activeIds: siblingIds, levelSum, parent,
            siblingValues, siblingSum, child, replacement, stage: 2, event: "skip-child", codeLine: 12,
            frontier: frontierSnapshot(parents, children, parent), active: [parent.id],
            title: { vi: "child là None → không gán", en: "child is None → skip assignment" },
            note: { vi: "Không có node ở vị trí này nên cây không thay đổi.", en: "There is no node in this slot, so the tree is unchanged." },
            formula: "if child → False · skip",
          });
        }
      }
    }

    if (children.length) {
      completedRows.push(rowFor({ children, before, target, updated, levelSum, complete: true }));
    }
    parents = children;
    depth += 1;
    debugStep({
      stage: 2, event: "advance-frontier", codeLine: 13,
      frontier: frontierSnapshot(parents), active: parents.map((node) => node.id),
      levelSum, replacement: "—",
      title: parents.length ? { vi: `Children trở thành parents của depth ${depth}`, en: `Children become the parents for depth ${depth}` }
        : { vi: "children rỗng → parents trở thành []", en: "children is empty → parents becomes []" },
      note: parents.length ? { vi: `Frontier mới là ${listText(parents)}.`, en: `The new frontier is ${listText(parents)}.` }
        : { vi: "Điều kiện while tiếp theo sẽ là False.", en: "The next while condition will be false." },
      formula: `parents = children = ${listText(parents)}`,
    });
  }

  debugStep({
    stage: 0, event: "while-stop", codeLine: 6, frontier: [],
    title: { vi: "parents rỗng: dừng duyệt", en: "parents is empty: stop traversing" },
    note: { vi: "Mọi node thật đã nhận cousin sum của mình.", en: "Every real node now stores its cousin sum." },
    formula: "bool(parents) = False",
  });
  const answer = serializeTree(root);
  debugStep({
    stage: 3, event: "done", codeLine: 14, frontier: [], status: "success", final: true, result: answer,
    title: { vi: "Trả về cây cousin-sum", en: "Return the cousin-sum tree" },
    note: { vi: "Root bằng 0; mỗi node khác bằng tổng value gốc của các node cùng depth nhưng khác parent.", en: "The root is 0; every other node equals the original-value sum of nodes at the same depth with different parents." },
    formula: `return root → ${JSON.stringify(answer)}`,
  });
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
