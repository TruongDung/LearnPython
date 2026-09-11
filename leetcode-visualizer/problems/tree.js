// LeetCode Visualizer — Binary Tree (general) problems: traversals, depth, path sum.
// Uses tree view for visualization. parseTree is a generic level-order parser.

// ─── Helpers ───
function parseTree(input) {
  // Input: "1,2,3,null,5" or array. Strict array indexing (children of i at 2i+1, 2i+2).
  let arr;
  if (typeof input === "string") {
    arr = input.split(",").map((s) => {
      const t = s.trim();
      return t === "null" || t === "" ? null : Number(t);
    });
  } else {
    arr = input;
  }
  if (!arr.length || arr[0] === null) return null;
  const nodes = arr.map((v, i) => (v !== null ? { id: i, val: v, left: null, right: null } : null));
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i]) continue;
    const li = 2 * i + 1, ri = 2 * i + 2;
    if (li < nodes.length && nodes[li]) nodes[i].left = nodes[li];
    if (ri < nodes.length && nodes[ri]) nodes[i].right = nodes[ri];
  }
  return nodes[0];
}

function parseNaryTree(input) {
  const raw = Array.isArray(input)
    ? input
    : String(input).trim().replace(/^\[|\]$/g, "").split(",").map((value) => value.trim());
  const values = raw.map((value) => {
    if (value === null || value === undefined || String(value).toLowerCase() === "null" || String(value) === "") return null;
    const number = Number(value);
    if (!Number.isInteger(number)) throw new Error("N-ary tree values must be integers or null");
    return number;
  });
  if (!values.length || values[0] === null) return null;

  let nextId = 0;
  const root = { id: nextId++, val: values[0], children: [], parentId: null, depth: 0 };
  const queue = [root];
  let index = 1;
  if (values[index] === null) index++;
  while (queue.length && index < values.length) {
    const parent = queue.shift();
    while (index < values.length && values[index] !== null) {
      const child = { id: nextId++, val: values[index], children: [], parentId: parent.id, depth: parent.depth + 1 };
      parent.children.push(child);
      queue.push(child);
      index++;
    }
    if (values[index] === null) index++;
  }
  if (index < values.length) throw new Error("Invalid N-ary level-order input: too many child groups");
  return root;
}

function collectNaryNodes(root) {
  if (!root) return [];
  const nodes = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    nodes.push({ id: node.id, value: node.val, parentId: node.parentId, depth: node.depth, children: node.children.map((child) => child.id) });
    queue.push(...node.children);
  }
  return nodes;
}

function treeToVizNodes(root, hlSet, wordSet) {
  const vizNodes = [];
  let nextX = 0;
  function dfs(node, depth, parentId) {
    if (!node) return -1;
    dfs(node.left, depth + 1, node.id);
    const x = nextX++;
    dfs(node.right, depth + 1, node.id);
    vizNodes.push({
      id: node.id,
      label: String(node.val),
      x,
      y: depth,
      parentId,
      isWord: wordSet ? wordSet.has(node.id) : false,
      hl: hlSet ? hlSet.has(node.id) : false,
    });
    return x;
  }
  dfs(root, 0, null);
  return vizNodes;
}

function snapshot(root, opts) {
  const nodes = treeToVizNodes(root, opts.hlSet, opts.wordSet);
  (opts.nullChildren || []).forEach((child) => {
    const parent = nodes.find((node) => node.id === child.parentId);
    if (!parent) return;
    nodes.push({
      id: child.id,
      label: "null",
      x: parent.x + (child.side === "left" ? -0.82 : 0.82),
      y: parent.y + 1,
      parentId: parent.id,
      isNull: true,
      hl: false,
      isWord: false,
    });
  });
  return {
    title: opts.title,
    arr: [],
    tree: { nodes, annotations: opts.annotations },
    highlight: [],
    mark: [],
    codeLines: opts.codeLines || [],
    codeBlock: opts.codeBlock,
    queueView: opts.queueView,
    lcaDeepestView: opts.lcaDeepestView,
    maxDepthView: opts.maxDepthView,
    rightSideBfsView: opts.rightSideBfsView,
    rightSideDfsView: opts.rightSideDfsView,
    vars: opts.vars || [],
    note: opts.note,
  };
}

const TREE_CAT = { key: "binary-tree", vi: "Cây nhị phân", en: "Binary Tree" };

// Find a node by value (first match in preorder).
function findNode(root, val) {
  let found = null;
  (function dfs(n) { if (!n || found) return; if (n.val === val) { found = n; return; } dfs(n.left); dfs(n.right); })(root);
  return found;
}

// Map each node id → its parent node (null for root).
function buildParents(root) {
  const parent = new Map();
  (function dfs(n, p) { if (!n) return; parent.set(n.id, p); dfs(n.left, n); dfs(n.right, n); })(root, null);
  return parent;
}

// ─── 144: Binary Tree Preorder Traversal (Root → Left → Right) ───
function buildSteps144(input) {
  const root = parseTree(input); const steps = []; const result = []; const visited = new Set();
  steps.push(snapshot(root, {
    title: { vi: "Preorder: Gốc → Trái → Phải", en: "Preorder: Root → Left → Right" },
    codeLines: [2, 3], vars: [{ name: "order", value: "Root, Left, Right" }, { name: "result", value: "[]" }],
    note: { vi: `Preorder: THĂM nút gốc TRƯỚC, rồi đệ quy con trái, rồi con phải.`, en: `Preorder: VISIT the root FIRST, then recurse left, then right.` },
  }));
  function dfs(node) {
    if (!node) return;
    result.push(node.val); visited.add(node.id);
    steps.push(snapshot(root, {
      title: { vi: `Thăm ${node.val} → thêm vào kết quả`, en: `Visit ${node.val} → add to result` },
      hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [3],
      vars: [{ name: "current", value: node.val }, { name: "result", value: `[${result.join(",")}]` }],
      note: { vi: `Thăm gốc trước khi đi xuống con. result = [${result.join(",")}].`, en: `Visit root before descending. result = [${result.join(",")}].` },
    }));
    dfs(node.left); dfs(node.right);
  }
  dfs(root);
  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` },
    wordSet: new Set(visited), vars: [{ name: "answer", value: `[${result.join(",")}]` }],
    note: { vi: `Preorder hoàn tất.`, en: `Preorder complete.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 94: Binary Tree Inorder Traversal (Left → Root → Right) ───
function buildSteps94(input) {
  const root = parseTree(input); const steps = []; const result = []; const visited = new Set();
  steps.push(snapshot(root, {
    title: { vi: "Inorder: Trái → Gốc → Phải", en: "Inorder: Left → Root → Right" },
    codeLines: [2, 3], vars: [{ name: "order", value: "Left, Root, Right" }, { name: "result", value: "[]" }],
    note: { vi: `Inorder: đệ quy con TRÁI trước, rồi THĂM gốc, rồi con phải. (Với BST → thứ tự tăng dần.)`, en: `Inorder: recurse LEFT first, then VISIT root, then right. (For a BST → ascending order.)` },
  }));
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    result.push(node.val); visited.add(node.id);
    steps.push(snapshot(root, {
      title: { vi: `Thăm ${node.val} → thêm vào kết quả`, en: `Visit ${node.val} → add to result` },
      hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [4],
      vars: [{ name: "current", value: node.val }, { name: "result", value: `[${result.join(",")}]` }],
      note: { vi: `Đã xong con trái → thăm gốc ${node.val}. result = [${result.join(",")}].`, en: `Left subtree done → visit root ${node.val}. result = [${result.join(",")}].` },
    }));
    dfs(node.right);
  }
  dfs(root);
  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` },
    wordSet: new Set(visited), vars: [{ name: "answer", value: `[${result.join(",")}]` }],
    note: { vi: `Inorder hoàn tất.`, en: `Inorder complete.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 145: Binary Tree Postorder Traversal (Left → Right → Root) ───
function buildSteps145(input) {
  const root = parseTree(input); const steps = []; const result = []; const visited = new Set();
  steps.push(snapshot(root, {
    title: { vi: "Postorder: Trái → Phải → Gốc", en: "Postorder: Left → Right → Root" },
    codeLines: [2, 3], vars: [{ name: "order", value: "Left, Right, Root" }, { name: "result", value: "[]" }],
    note: { vi: `Postorder: đệ quy con TRÁI, rồi con PHẢI, cuối cùng mới THĂM gốc.`, en: `Postorder: recurse LEFT, then RIGHT, finally VISIT the root.` },
  }));
  function dfs(node) {
    if (!node) return;
    dfs(node.left); dfs(node.right);
    result.push(node.val); visited.add(node.id);
    steps.push(snapshot(root, {
      title: { vi: `Thăm ${node.val} → thêm vào kết quả`, en: `Visit ${node.val} → add to result` },
      hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [5],
      vars: [{ name: "current", value: node.val }, { name: "result", value: `[${result.join(",")}]` }],
      note: { vi: `Đã xong cả 2 con → thăm gốc ${node.val}. result = [${result.join(",")}].`, en: `Both children done → visit root ${node.val}. result = [${result.join(",")}].` },
    }));
  }
  dfs(root);
  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` },
    wordSet: new Set(visited), vars: [{ name: "answer", value: `[${result.join(",")}]` }],
    note: { vi: `Postorder hoàn tất.`, en: `Postorder complete.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 104: Maximum Depth of Binary Tree ───
function buildSteps104(input) {
  const root = parseTree(input);
  const steps = [];
  const callStack = [];
  const returnedDepths = new Map();
  let visualMax = 0;

  const sideText = (side, language) => {
    if (side === "root") return language === "vi" ? "gốc" : "root";
    if (language === "vi") return side === "left" ? "trái" : "phải";
    return side;
  };

  function annotationsFor(current, nextCall, nullChild) {
    const annotations = {};
    const existingLabels = (id) => {
      const annotation = annotations[id];
      if (!annotation) return [];
      if (Array.isArray(annotation.labels)) return [...annotation.labels];
      return [{ label: annotation.label, kind: annotation.kind || "" }];
    };
    returnedDepths.forEach((depth, id) => {
      annotations[id] = { label: `↩ depth ${depth}`, kind: "md-return" };
    });
    if (current) {
      // While a frame is active, show one CURRENT badge instead of stacking it
      // with its completed return-depth badge at the same tree position.
      annotations[current.id] = {
        labels: [{ label: `CURRENT · level ${callStack[callStack.length - 1].level}`, kind: "md-current" }],
      };
    }
    if (nextCall && nextCall.node) {
      const labels = existingLabels(nextCall.node.id);
      labels.push({ label: `NEXT · ${nextCall.side.toUpperCase()}`, kind: "md-next" });
      annotations[nextCall.node.id] = { labels };
    }
    if (nullChild) {
      annotations[nullChild.id] = { label: `${nullChild.side.toUpperCase()} = None`, kind: "md-null" };
    }
    return annotations;
  }

  function makeView(opts) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current") ? opts.current : frame && frame.node;
    return {
      phase: opts.phase,
      current: current ? { id: current.id, value: current.val } : null,
      currentLevel: frame ? frame.level : null,
      currentSide: frame ? frame.side : null,
      stack: callStack.map((item) => ({
        value: item.node ? item.node.val : null,
        level: item.level,
        side: item.side,
        stage: item.stage,
      })),
      nextCall: opts.nextCall ? {
        value: opts.nextCall.node ? opts.nextCall.node.val : null,
        level: opts.nextCall.level,
        side: opts.nextCall.side,
      } : null,
      leftDepth: opts.leftDepth,
      rightDepth: opts.rightDepth,
      returnDepth: opts.returnDepth,
      formula: opts.formula || null,
      visualMaxBefore: opts.visualMaxBefore,
      visualMaxAfter: opts.visualMaxAfter,
      maxUpdated: opts.maxUpdated,
      completed: [...returnedDepths.entries()].map(([id, depth]) => ({ id, depth })),
    };
  }

  function addStep(opts) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current") ? opts.current : frame && frame.node;
    const highlighted = new Set(opts.highlightIds || []);
    if (current) highlighted.add(current.id);
    if (opts.nextCall && opts.nextCall.node) highlighted.add(opts.nextCall.node.id);
    if (opts.parent) highlighted.add(opts.parent.id);
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "call stack")) {
      vars.push({ name: "call stack", value: callStack.length ? `[${callStack.map((item) => item.node ? item.node.val : "None").join(" → ")}]` : "[]" });
    }
    const treeStep = snapshot(root, {
      title: opts.title,
      hlSet: highlighted,
      wordSet: new Set(returnedDepths.keys()),
      annotations: annotationsFor(current, opts.nextCall, opts.nullChild),
      nullChildren: opts.nullChild ? [opts.nullChild] : [],
      codeLines: opts.codeLines,
      maxDepthView: makeView({ ...opts, current }),
      vars,
      note: opts.note,
    });
    steps.push(treeStep);
  }

  addStep({
    title: { vi: "Quy tắc: node đợi cả hai nhánh rồi mới return", en: "Rule: a node waits for both branches before returning" },
    codeLines: [2], phase: "intro", current: null,
    vars: [{ name: "rule", value: "depth(node) = 1 + max(left, right)" }, { name: "base case", value: "depth(None) = 0" }],
    note: { vi: "Đây là DFS hậu tự (postorder): tính depth từ lá đi ngược lên root. Số level trên cây bắt đầu từ 0, còn depth trả về bắt đầu từ 1 ở lá.", en: "This is postorder DFS: compute depths from leaves back to the root. Tree levels start at 0, while a leaf returns depth 1." },
  });

  function dfs(node, parent, side, level) {
    callStack.push({ node, side, level, stage: "enter" });
    addStep({
      title: { vi: `Vào maxDepth(${node ? node.val : "None"})`, en: `Enter maxDepth(${node ? node.val : "None"})` },
      codeLines: [3], phase: "enter", parent,
      vars: [{ name: "node", value: node ? node.val : "None" }, { name: "level", value: level }, { name: "called from", value: sideText(side, "en") }],
      note: node
        ? { vi: `Push frame cho node ${node.val}. Trước hết kiểm tra base case ở dòng 3.`, en: `Push a frame for node ${node.val}. First check the base case on line 3.` }
        : { vi: `Push frame None: đây là lời gọi cho con ${sideText(side, "vi")} không tồn tại.`, en: `Push a None frame: this call is for a missing ${sideText(side, "en")} child.` },
    });

    const isNull = !node;
    callStack[callStack.length - 1].stage = "check-base";
    addStep({
      title: { vi: `if not root → ${isNull ? "ĐÚNG" : "SAI"}`, en: `if not root → ${isNull ? "TRUE" : "FALSE"}` },
      codeLines: [3], phase: "check-base", parent,
      vars: [{ name: "node", value: node ? node.val : "None" }, { name: "not root", value: isNull }],
      note: isNull
        ? { vi: "root là None nên điều kiện đúng; nhánh rỗng có depth bằng 0.", en: "root is None, so the condition is true; an empty branch has depth 0." }
        : { vi: `root là node ${node.val}, nên bỏ qua return 0 và tính hai cây con.`, en: `root is node ${node.val}, so skip return 0 and compute both subtrees.` },
    });

    if (isNull) {
      const nullChild = parent ? { id: `md-null-${parent.id}-${side}-${level}`, parentId: parent.id, side } : null;
      callStack[callStack.length - 1].stage = "return-0";
      addStep({
        title: { vi: "Base case: return 0", en: "Base case: return 0" },
        codeLines: [4], phase: "return-null", current: null, parent, nullChild,
        vars: [{ name: "return", value: 0 }, { name: "meaning", value: "no node → no level" }],
        note: { vi: "Không có node ở nhánh này, nên lời gọi trả về 0 cho lời gọi cha.", en: "There is no node in this branch, so this call returns 0 to its caller." },
      });
      callStack.pop();
      return 0;
    }

    const leftCall = { node: node.left, side: "left", level: level + 1 };
    callStack[callStack.length - 1].stage = "call-left";
    addStep({
      title: { vi: `Gọi maxDepth(con trái của ${node.val})`, en: `Call maxDepth(${node.val}.left)` },
      codeLines: [5], phase: "call-left", nextCall: leftCall,
      vars: [{ name: "node", value: node.val }, { name: "left child", value: node.left ? node.left.val : "None" }, { name: "left depth", value: "waiting" }],
      note: { vi: `Dòng 5 phải chạy xong toàn bộ nhánh trái trước. ${node.left ? `Đi vào node ${node.left.val}.` : "Không có con trái, nên sẽ gọi maxDepth(None)."}`, en: `Line 5 must finish the entire left branch first. ${node.left ? `Enter node ${node.left.val}.` : "There is no left child, so it calls maxDepth(None)."}` },
    });
    const leftDepth = dfs(node.left, node, "left", level + 1);

    callStack[callStack.length - 1].stage = "left-returned";
    addStep({
      title: { vi: `Con trái của ${node.val} trả về ${leftDepth}`, en: `Left child of ${node.val} returns ${leftDepth}` },
      codeLines: [5], phase: "left-return", leftDepth,
      vars: [{ name: "left depth", value: leftDepth }, { name: "right depth", value: "waiting" }],
      note: { vi: `Biến left nhận giá trị ${leftDepth}. Bây giờ mới có thể chạy dòng 6 cho nhánh phải.`, en: `Variable left receives ${leftDepth}. Only now can line 6 run for the right branch.` },
    });

    const rightCall = { node: node.right, side: "right", level: level + 1 };
    callStack[callStack.length - 1].stage = "call-right";
    addStep({
      title: { vi: `Gọi maxDepth(con phải của ${node.val})`, en: `Call maxDepth(${node.val}.right)` },
      codeLines: [6], phase: "call-right", leftDepth, nextCall: rightCall,
      vars: [{ name: "left depth", value: leftDepth }, { name: "right child", value: node.right ? node.right.val : "None" }, { name: "right depth", value: "waiting" }],
      note: { vi: `Đã có left = ${leftDepth}; dòng 6 duyệt nhánh phải. ${node.right ? `Đi vào node ${node.right.val}.` : "Không có con phải, nên sẽ gọi maxDepth(None)."}`, en: `left = ${leftDepth} is ready; line 6 explores the right branch. ${node.right ? `Enter node ${node.right.val}.` : "There is no right child, so it calls maxDepth(None)."}` },
    });
    const rightDepth = dfs(node.right, node, "right", level + 1);

    callStack[callStack.length - 1].stage = "right-returned";
    addStep({
      title: { vi: `Con phải của ${node.val} trả về ${rightDepth}`, en: `Right child of ${node.val} returns ${rightDepth}` },
      codeLines: [6], phase: "right-return", leftDepth, rightDepth,
      vars: [{ name: "left depth", value: leftDepth }, { name: "right depth", value: rightDepth }],
      note: { vi: `Đủ hai kết quả: left = ${leftDepth}, right = ${rightDepth}. Node ${node.val} đã sẵn sàng tính depth của chính nó.`, en: `Both results are ready: left = ${leftDepth}, right = ${rightDepth}. Node ${node.val} can now compute its own depth.` },
    });

    const depth = 1 + Math.max(leftDepth, rightDepth);
    const visualMaxBefore = visualMax;
    visualMax = Math.max(visualMax, depth);
    const maxUpdated = visualMax > visualMaxBefore;
    returnedDepths.set(node.id, depth);
    callStack[callStack.length - 1].stage = "compute-return";
    addStep({
      title: { vi: `Tính depth(${node.val}) = ${depth}`, en: `Compute depth(${node.val}) = ${depth}` },
      codeLines: [7], phase: "compute", leftDepth, rightDepth, returnDepth: depth,
      formula: `1 + max(${leftDepth}, ${rightDepth}) = ${depth}`,
      visualMaxBefore, visualMaxAfter: visualMax, maxUpdated,
      vars: [{ name: "left", value: leftDepth }, { name: "right", value: rightDepth }, { name: "return", value: depth }, { name: "tallest seen (visual)", value: `${visualMaxBefore} → ${visualMax}` }],
      note: { vi: `Dòng 7: 1 + max(${leftDepth}, ${rightDepth}) = ${depth}. Đồng hồ “tallest seen” chỉ để minh họa; code Python không cần biến global này.`, en: `Line 7: 1 + max(${leftDepth}, ${rightDepth}) = ${depth}. The “tallest seen” meter is visualization-only; the Python code needs no global variable.` },
    });
    callStack[callStack.length - 1].stage = "return";
    addStep({
      title: { vi: `Return ${depth} từ node ${node.val}`, en: `Return ${depth} from node ${node.val}` },
      codeLines: [7], phase: "return-node", leftDepth, rightDepth, returnDepth: depth,
      formula: `depth(${node.val}) = ${depth}`,
      visualMaxBefore, visualMaxAfter: visualMax, maxUpdated,
      vars: [{ name: "return to parent", value: depth }, { name: "completed node", value: node.val }],
      note: { vi: `Pop frame ${node.val} và đưa depth ${depth} về lời gọi cha. Nhãn ↩ dưới node lưu giá trị đã hoàn tất.`, en: `Pop frame ${node.val} and pass depth ${depth} back to its caller. The ↩ label under the node records its completed value.` },
    });
    callStack.pop();
    return depth;
  }

  const rootCall = { node: root, side: "root", level: 0 };
  addStep({
    title: { vi: `Bắt đầu maxDepth(${root ? root.val : "None"})`, en: `Start maxDepth(${root ? root.val : "None"})` },
    codeLines: [2], phase: "call-root", current: null, nextCall: rootCall,
    vars: [{ name: "root", value: root ? root.val : "None" }],
    note: { vi: "Gọi hàm ở root. Frame ở cuối call stack luôn là lời gọi hiện đang chạy.", en: "Call the function at the root. The last call-stack frame is always the active call." },
  });
  const answer = dfs(root, null, "root", 0);
  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: maximum depth = ${answer}`, en: `Result: maximum depth = ${answer}` },
    wordSet: new Set(returnedDepths.keys()),
    annotations: annotationsFor(null, null, null),
    codeLines: [7],
    maxDepthView: makeView({ phase: "done", current: null, returnDepth: answer, formula: `maxDepth(root) = ${answer}`, visualMaxBefore: visualMax, visualMaxAfter: visualMax, maxUpdated: false }),
    vars: [{ name: "maxDepth(root)", value: answer }, { name: "answer", value: answer }, { name: "call stack", value: "[]" }],
    note: { vi: `Tất cả lời gọi đã return. Độ sâu lớn nhất của cây là ${answer}.`, en: `Every call has returned. The maximum depth of the tree is ${answer}.` },
  });
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer, steps };
}

// ─── 102: Binary Tree Level Order Traversal (BFS by level) ───
function buildSteps102(input) {
  const root = parseTree(input); const steps = []; const levels = [];
  steps.push(snapshot(root, {
    title: { vi: "Level Order: BFS theo từng tầng", en: "Level Order: BFS by level" },
    codeLines: [2, 3], vars: [{ name: "result", value: "[]" }],
    note: { vi: `Dùng queue. Mỗi vòng lặp xử lý HẾT 1 tầng → tạo 1 mảng con, rồi đưa các con vào queue.`, en: `Use a queue. Each loop processes one ENTIRE level → builds one sublist, then enqueues children.` },
  }));
  if (root) {
    let queue = [root]; const visited = new Set(); let lvl = 0;
    while (queue.length) {
      const cur = queue.map((n) => n.val); levels.push(cur);
      queue.forEach((n) => visited.add(n.id));
      steps.push(snapshot(root, {
        title: { vi: `Tầng ${lvl}: [${cur.join(",")}]`, en: `Level ${lvl}: [${cur.join(",")}]` },
        hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [4, 5, 6],
        vars: [{ name: "level", value: lvl }, { name: "nodes", value: `[${cur.join(",")}]` }, { name: "result", value: JSON.stringify(levels) }],
        note: { vi: `Lấy tất cả ${queue.length} nút ở tầng ${lvl}, thêm con của chúng vào queue cho tầng sau.`, en: `Take all ${queue.length} nodes at level ${lvl}, enqueue their children for the next level.` },
      }));
      const next = [];
      for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); }
      queue = next; lvl++;
    }
  }
  const fs = snapshot(root, {
    title: { vi: `Kết quả: ${JSON.stringify(levels)}`, en: `Result: ${JSON.stringify(levels)}` },
    vars: [{ name: "answer", value: JSON.stringify(levels) }],
    note: { vi: `Level order hoàn tất.`, en: `Level order complete.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: JSON.stringify(levels), steps };
}

// ─── 429: N-ary Tree Level Order Traversal (BFS by level) ───
function buildSteps429(input) {
  const root = parseNaryTree(input);
  const nodes = collectNaryNodes(root);
  const steps = [];
  const result = [];
  const visited = new Set();

  function snapshot429({ title, phase, queue = [], current = null, children = [], currentLevel = [], levelIndex = null, codeLine, vars = [], note, decision = null, final = false }) {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
      nary429View: {
        nodes,
        rootId: root ? root.id : null,
        phase,
        queueIds: queue.map((node) => node.id),
        visitedIds: [...visited],
        currentId: current ? current.id : null,
        childIds: children.map((node) => node.id),
        currentLevel: [...currentLevel],
        result: result.map((level) => [...level]),
        levelIndex,
        decision,
      },
    });
  }

  if (!root) {
    snapshot429({
      title: { vi: "root rỗng → trả về []", en: "root is empty → return []" },
      phase: "empty",
      codeLine: 4,
      vars: [{ name: "root", value: "None" }, { name: "answer", value: "[]" }],
      note: { vi: "Không có node nào để duyệt.", en: "There is no node to traverse." },
      decision: { kind: "empty" },
      final: true,
    });
    return { input, answer: "[]", steps };
  }

  snapshot429({
    title: { vi: "Kiểm tra root tồn tại", en: "Check that root exists" },
    phase: "guard",
    codeLine: 4,
    vars: [{ name: "root", value: root.val }],
    note: { vi: "root có giá trị nên không return sớm.", en: "root has a value, so there is no early return." },
    decision: { kind: "guard", root: root.val },
  });
  snapshot429({
    title: { vi: "Tạo result = []", en: "Create result = []" },
    phase: "init-result",
    codeLine: 6,
    vars: [{ name: "result", value: "[]" }],
    note: { vi: "Mỗi tầng hoàn tất sẽ được thêm thành một mảng con vào result.", en: "Each completed level will be appended as a subarray of result." },
    decision: { kind: "init-result" },
  });

  let queue = [root];
  snapshot429({
    title: { vi: `Đưa root ${root.val} vào queue`, en: `Put root ${root.val} into the queue` },
    phase: "init-queue",
    queue,
    codeLine: 7,
    vars: [{ name: "queue", value: `[${root.val}]` }],
    note: { vi: "BFS luôn bắt đầu từ gốc.", en: "BFS always starts from the root." },
    decision: { kind: "init-queue", root: root.val },
  });

  let levelIndex = 0;
  while (queue.length) {
    snapshot429({
      title: { vi: `queue còn ${queue.length} node → xử lý tầng ${levelIndex}`, en: `queue has ${queue.length} nodes → process level ${levelIndex}` },
      phase: "while",
      queue,
      levelIndex,
      codeLine: 8,
      vars: [{ name: "queue", value: `[${queue.map((node) => node.val).join(", ")}]` }, { name: "level", value: levelIndex }],
      note: { vi: "Queue không rỗng, nên bắt đầu một lượt BFS mới.", en: "The queue is not empty, so start another BFS level." },
      decision: { kind: "while", size: queue.length },
    });
    const levelSize = queue.length;
    snapshot429({
      title: { vi: `level_size = ${levelSize}`, en: `level_size = ${levelSize}` },
      phase: "level-size",
      queue,
      levelIndex,
      codeLine: 9,
      vars: [{ name: "level_size", value: levelSize }, { name: "queue before level", value: `[${queue.map((node) => node.val).join(", ")}]` }],
      note: { vi: "Chỉ xử lý đúng số node đang có trong queue. Các con mới thêm sẽ thuộc tầng sau.", en: "Process exactly the nodes currently in the queue. Newly enqueued children belong to the next level." },
      decision: { kind: "level-size", size: levelSize },
    });
    const currentLevel = [];
    snapshot429({
      title: { vi: "Tạo level = []", en: "Create level = []" },
      phase: "level-init",
      queue,
      currentLevel,
      levelIndex,
      codeLine: 10,
      vars: [{ name: "level", value: "[]" }, { name: "level_size", value: levelSize }],
      note: { vi: "Mảng này chỉ nhận giá trị của tầng hiện tại.", en: "This array receives values from only the current level." },
      decision: { kind: "level-init", levelIndex },
    });

    for (let offset = 0; offset < levelSize; offset++) {
      const next = queue[0];
      snapshot429({
        title: { vi: `Lượt ${offset + 1}/${levelSize} của tầng ${levelIndex}`, en: `Pass ${offset + 1}/${levelSize} of level ${levelIndex}` },
        phase: "for",
        queue,
        current: next,
        currentLevel,
        levelIndex,
        codeLine: 11,
        vars: [{ name: "_", value: offset }, { name: "level_size", value: levelSize }],
        note: { vi: "Lấy node đầu queue của tầng hiện tại.", en: "Take the first queued node from the current level." },
        decision: { kind: "for", offset, size: levelSize },
      });
      const node = queue.shift();
      snapshot429({
        title: { vi: `node = queue.popleft() → ${node.val}`, en: `node = queue.popleft() → ${node.val}` },
        phase: "dequeue",
        queue,
        current: node,
        currentLevel,
        levelIndex,
        codeLine: 12,
        vars: [{ name: "node", value: node.val }, { name: "queue", value: `[${queue.map((item) => item.val).join(", ")}]` }],
        note: { vi: `${node.val} rời đầu queue để được xử lý.`, en: `${node.val} leaves the front of the queue for processing.` },
        decision: { kind: "dequeue", value: node.val },
      });
      currentLevel.push(node.val);
      visited.add(node.id);
      snapshot429({
        title: { vi: `Thêm ${node.val} vào level`, en: `Append ${node.val} to level` },
        phase: "append-value",
        queue,
        current: node,
        currentLevel,
        levelIndex,
        codeLine: 13,
        vars: [{ name: "level", value: `[${currentLevel.join(", ")}]` }, { name: "node.val", value: node.val }],
        note: { vi: `level của tầng ${levelIndex} hiện là [${currentLevel.join(", ")}].`, en: `level ${levelIndex} is now [${currentLevel.join(", ")}].` },
        decision: { kind: "append-value", value: node.val },
      });
      const children = node.children;
      queue.push(...children);
      snapshot429({
        title: { vi: `Đưa ${children.length} con của ${node.val} vào queue`, en: `Enqueue ${children.length} children of ${node.val}` },
        phase: "enqueue-children",
        queue,
        current: node,
        children,
        currentLevel,
        levelIndex,
        codeLine: 14,
        vars: [{ name: "node.children", value: `[${children.map((child) => child.val).join(", ")}]` }, { name: "queue", value: `[${queue.map((item) => item.val).join(", ")}]` }],
        note: { vi: children.length ? `Các con [${children.map((child) => child.val).join(", ")}] xếp cuối queue cho tầng sau.` : `${node.val} không có con, queue không đổi.`, en: children.length ? `Children [${children.map((child) => child.val).join(", ")}] join the back of the queue for the next level.` : `${node.val} has no children, so the queue is unchanged.` },
        decision: { kind: "enqueue-children", values: children.map((child) => child.val) },
      });
    }
    result.push([...currentLevel]);
    snapshot429({
      title: { vi: `Hoàn tất tầng ${levelIndex} → result.append([${currentLevel.join(", ")}])`, en: `Finish level ${levelIndex} → result.append([${currentLevel.join(", ")}])` },
      phase: "level-done",
      queue,
      currentLevel,
      levelIndex,
      codeLine: 15,
      vars: [{ name: "result", value: JSON.stringify(result) }],
      note: { vi: `Đã chốt một mảng con cho tầng ${levelIndex}.`, en: `A subarray for level ${levelIndex} is now complete.` },
      decision: { kind: "level-done", level: [...currentLevel] },
    });
    levelIndex++;
  }

  snapshot429({
    title: { vi: `BFS hoàn tất → trả về ${JSON.stringify(result)}`, en: `BFS complete → return ${JSON.stringify(result)}` },
    phase: "done",
    currentLevel: [],
    levelIndex,
    codeLine: 16,
    vars: [{ name: "answer", value: JSON.stringify(result) }],
    note: { vi: "Queue đã rỗng; mọi tầng đã có trong result.", en: "The queue is empty; every level is in result." },
    decision: { kind: "done" },
    final: true,
  });
  return { input, answer: JSON.stringify(result), steps };
}

// ─── 112: Path Sum (root-to-leaf) ───
function buildSteps112(input, params) {
  const root = parseTree(input);
  const target = params && params.target !== undefined ? Number(params.target) : 20;
  const steps = [];
  const callStack = [];
  const returned = new Map();
  let successfulPathIds = [];
  let successfulPathValues = [];

  function annotationLabels(annotations, id) {
    const value = annotations[id];
    if (!value) return [];
    return Array.isArray(value.labels)
      ? [...value.labels]
      : [{ label: value.label, kind: value.kind || "" }];
  }

  function annotationsFor(current, nextCall, nullChild) {
    const annotations = {};
    returned.forEach((result, id) => {
      annotations[id] = { label: `↩ ${result}`, kind: result ? "ps112-true" : "ps112-false" };
    });
    if (current) {
      const labels = annotationLabels(annotations, current.id);
      labels.push({ label: "CURRENT", kind: "ps112-current" });
      annotations[current.id] = { labels };
    }
    if (nextCall && nextCall.node) {
      const labels = annotationLabels(annotations, nextCall.node.id);
      labels.push({ label: `NEXT · ${nextCall.side.toUpperCase()}`, kind: "ps112-next" });
      annotations[nextCall.node.id] = { labels };
    }
    if (nullChild) annotations[nullChild.id] = { label: `${nullChild.side.toUpperCase()} = None`, kind: "ps112-null" };
    return annotations;
  }

  function makeView(opts) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current") ? opts.current : frame && frame.node;
    return {
      phase: opts.phase,
      target,
      current: current ? { id: current.id, value: current.val } : null,
      remainingBefore: opts.remainingBefore,
      remaining: opts.remaining,
      isLeaf: opts.isLeaf,
      leafMatch: opts.leafMatch,
      leftResult: opts.leftResult,
      rightResult: opts.rightResult,
      returnValue: opts.returnValue,
      shortCircuit: opts.shortCircuit || null,
      nextCall: opts.nextCall ? {
        value: opts.nextCall.node ? opts.nextCall.node.val : null,
        side: opts.nextCall.side,
        target: opts.nextCall.target,
      } : null,
      stack: callStack.map((item) => ({
        value: item.node ? item.node.val : null,
        side: item.side,
        target: item.target,
        remaining: item.remaining,
        path: item.pathValues,
        stage: item.stage,
      })),
      activePath: frame ? frame.pathValues : [],
      successfulPath: [...successfulPathValues],
    };
  }

  function addStep(opts) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current") ? opts.current : frame && frame.node;
    const highlights = new Set(opts.highlightIds || []);
    if (current) highlights.add(current.id);
    if (opts.parent) highlights.add(opts.parent.id);
    if (opts.nextCall && opts.nextCall.node) highlights.add(opts.nextCall.node.id);
    const activePathIds = frame ? frame.pathIds : [];
    const wordSet = successfulPathIds.length ? new Set(successfulPathIds) : new Set(activePathIds);
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "call stack")) {
      vars.push({ name: "call stack", value: callStack.length ? `[${callStack.map((item) => item.node ? item.node.val : "None").join(" → ")}]` : "[]" });
    }
    const treeStep = snapshot(root, {
      title: opts.title,
      hlSet: highlights,
      wordSet,
      annotations: annotationsFor(current, opts.nextCall, opts.nullChild),
      nullChildren: opts.nullChild ? [opts.nullChild] : [],
      codeLines: opts.codeLines,
      vars,
      note: opts.note,
    });
    treeStep.pathSumView = makeView({ ...opts, current });
    treeStep.tree.nodes.forEach((node) => {
      if (returned.has(node.id)) node.sub = `↩ ${returned.get(node.id)}`;
    });
    steps.push(treeStep);
  }

  addStep({
    title: { vi: `Mục tiêu: có đường root → leaf tổng ${target}?`, en: `Goal: is there a root → leaf path summing to ${target}?` },
    codeLines: [2], phase: "intro", current: null,
    vars: [{ name: "targetSum", value: target }, { name: "rule", value: "remaining = targetSum - node.val" }],
    note: { vi: "Mỗi lời gọi nhận một target còn lại. Tại node, trừ node.val; chỉ trả True khi đến LÁ và remaining bằng 0.", en: "Each call receives a remaining target. At a node, subtract node.val; return True only at a LEAF with remaining 0." },
  });

  function dfs(node, currentTarget, pathIds, pathValues, parent, side) {
    callStack.push({ node, side, target: currentTarget, remaining: null, pathIds, pathValues, stage: "enter" });
    addStep({
      title: { vi: `Vào hasPathSum(${node ? node.val : "None"}, ${currentTarget})`, en: `Enter hasPathSum(${node ? node.val : "None"}, ${currentTarget})` },
      codeLines: [3], phase: "enter", parent,
      vars: [{ name: "root", value: node ? node.val : "None" }, { name: "targetSum", value: currentTarget }, { name: "path", value: `[${pathValues.join(", ")}]` }],
      note: node
        ? { vi: `Push frame node ${node.val}; trước hết kiểm tra root có phải None không.`, en: `Push a frame for node ${node.val}; first check whether root is None.` }
        : { vi: `Push frame None cho nhánh ${side}; đây là base case trả False.`, en: `Push a None frame for the ${side} branch; this is the base case that returns False.` },
    });

    const isNull = !node;
    callStack[callStack.length - 1].stage = "check-null";
    addStep({
      title: { vi: `if not root → ${isNull ? "ĐÚNG" : "SAI"}`, en: `if not root → ${isNull ? "TRUE" : "FALSE"}` },
      codeLines: [3], phase: "check-null", parent,
      vars: [{ name: "root", value: node ? node.val : "None" }, { name: "not root", value: isNull }],
      note: isNull
        ? { vi: "Không tồn tại node nên không thể tạo đường root→leaf hợp lệ ở nhánh này.", en: "No node exists, so this branch cannot form a valid root-to-leaf path." }
        : { vi: `Node ${node.val} tồn tại; tiếp tục trừ node.val khỏi target còn lại.`, en: `Node ${node.val} exists; continue by subtracting node.val from the remaining target.` },
    });
    if (isNull) {
      const nullChild = parent ? { id: `ps112-null-${parent.id}-${side}-${callStack.length}`, parentId: parent.id, side } : null;
      callStack[callStack.length - 1].stage = "return-false";
      addStep({
        title: { vi: "Base case: return False", en: "Base case: return False" },
        codeLines: [3], phase: "return-null", current: null, parent, nullChild, returnValue: false,
        vars: [{ name: "return", value: false }, { name: "reason", value: "root is None" }],
        note: { vi: "Dòng 3 trả False ngay lập tức cho nhánh rỗng.", en: "Line 3 immediately returns False for an empty branch." },
      });
      callStack.pop();
      return false;
    }

    const remaining = currentTarget - node.val;
    const currentPathIds = [...pathIds, node.id];
    const currentPathValues = [...pathValues, node.val];
    callStack[callStack.length - 1].remaining = remaining;
    callStack[callStack.length - 1].pathIds = currentPathIds;
    callStack[callStack.length - 1].pathValues = currentPathValues;
    callStack[callStack.length - 1].stage = "subtract";
    addStep({
      title: { vi: `remaining = ${currentTarget} − ${node.val} = ${remaining}`, en: `remaining = ${currentTarget} − ${node.val} = ${remaining}` },
      codeLines: [4], phase: "subtract", remainingBefore: currentTarget, remaining,
      vars: [{ name: "targetSum", value: currentTarget }, { name: "node.val", value: node.val }, { name: "remaining", value: remaining }, { name: "path", value: `[${currentPathValues.join(", ")}]` }],
      note: { vi: `Đường hiện tại là [${currentPathValues.join(", ")}]. Các lời gọi con phải tìm phần tổng còn lại là ${remaining}.`, en: `The current path is [${currentPathValues.join(", ")}]. Child calls must find the remaining sum ${remaining}.` },
    });

    const isLeaf = !node.left && !node.right;
    callStack[callStack.length - 1].stage = "check-leaf";
    addStep({
      title: { vi: `Node ${node.val} có phải lá? → ${isLeaf ? "ĐÚNG" : "SAI"}`, en: `Is node ${node.val} a leaf? → ${isLeaf ? "TRUE" : "FALSE"}` },
      codeLines: [5], phase: "check-leaf", remaining, isLeaf,
      vars: [{ name: "left", value: node.left ? node.left.val : "None" }, { name: "right", value: node.right ? node.right.val : "None" }, { name: "is leaf", value: isLeaf }, { name: "remaining", value: remaining }],
      note: isLeaf
        ? { vi: "Đây là lá: chỉ bây giờ remaining == 0 mới chứng minh được một đường hợp lệ.", en: "This is a leaf: only now can remaining == 0 prove a valid path." }
        : { vi: "Chưa phải lá, nên không được trả True dù remaining có thể đang bằng 0; phải đi tiếp xuống lá.", en: "This is not a leaf, so do not return True even if remaining is 0; continue down to a leaf." },
    });

    if (isLeaf) {
      const leafMatch = remaining === 0;
      if (leafMatch) {
        successfulPathIds = [...currentPathIds];
        successfulPathValues = [...currentPathValues];
      }
      returned.set(node.id, leafMatch);
      callStack[callStack.length - 1].stage = "return-leaf";
      addStep({
        title: { vi: `Lá ${node.val}: remaining == 0 → ${leafMatch}`, en: `Leaf ${node.val}: remaining == 0 → ${leafMatch}` },
        codeLines: [6], phase: "return-leaf", remaining, isLeaf: true, leafMatch, returnValue: leafMatch,
        vars: [{ name: "remaining == 0", value: leafMatch }, { name: "return", value: leafMatch }, { name: "path", value: `[${currentPathValues.join(", ")}]` }],
        note: leafMatch
          ? { vi: `✓ [${currentPathValues.join(", ")}] có tổng đúng ${target}; trả True.`, en: `✓ [${currentPathValues.join(", ")}] sums to ${target}; return True.` }
          : { vi: `✗ [${currentPathValues.join(", ")}] không đạt tổng ${target}; trả False và backtrack.`, en: `✗ [${currentPathValues.join(", ")}] does not sum to ${target}; return False and backtrack.` },
      });
      callStack.pop();
      return leafMatch;
    }

    const leftCall = { node: node.left, side: "left", target: remaining };
    callStack[callStack.length - 1].stage = "call-left";
    addStep({
      title: { vi: `Gọi nhánh trái của ${node.val}`, en: `Call the left branch of ${node.val}` },
      codeLines: [7], phase: "call-left", remaining, nextCall: leftCall,
      vars: [{ name: "remaining", value: remaining }, { name: "left child", value: node.left ? node.left.val : "None" }, { name: "left result", value: "waiting" }],
      note: { vi: `Vế đầu của toán tử or: hasPathSum(left, ${remaining}). Phải chờ nó return trước khi quyết định có gọi phải không.`, en: `First side of the or expression: hasPathSum(left, ${remaining}). Wait for it to return before deciding whether to call right.` },
    });
    const leftResult = dfs(node.left, remaining, currentPathIds, currentPathValues, node, "left");

    callStack[callStack.length - 1].stage = "left-returned";
    addStep({
      title: { vi: `Nhánh trái của ${node.val} trả về ${leftResult}`, en: `Left branch of ${node.val} returns ${leftResult}` },
      codeLines: [7], phase: "left-return", remaining, leftResult,
      vars: [{ name: "left result", value: leftResult }, { name: "or", value: leftResult ? "True or ..." : "False or ..." }],
      note: leftResult
        ? { vi: "Vế trái đã True. Python short-circuit: KHÔNG gọi nhánh phải; toàn biểu thức or là True.", en: "The left side is already True. Python short-circuits: do NOT call the right branch; the whole or expression is True." }
        : { vi: "Vế trái False, nên phải đánh giá vế phải ở dòng 8.", en: "The left side is False, so evaluate the right side on line 8." },
    });

    if (leftResult) {
      returned.set(node.id, true);
      callStack[callStack.length - 1].stage = "short-circuit";
      addStep({
        title: { vi: `Short-circuit tại ${node.val}: return True`, en: `Short-circuit at ${node.val}: return True` },
        codeLines: [7], phase: "short-circuit", remaining, leftResult: true, returnValue: true, shortCircuit: "right skipped",
        vars: [{ name: "left result", value: true }, { name: "right call", value: "SKIPPED" }, { name: "return", value: true }],
        note: { vi: "Không chạy dòng 8 vì `True or anything` luôn là True. Giá trị True được trả ngược lên cha.", en: "Line 8 does not run because `True or anything` is always True. Return True to the caller." },
      });
      callStack.pop();
      return true;
    }

    const rightCall = { node: node.right, side: "right", target: remaining };
    callStack[callStack.length - 1].stage = "call-right";
    addStep({
      title: { vi: `Gọi nhánh phải của ${node.val}`, en: `Call the right branch of ${node.val}` },
      codeLines: [8], phase: "call-right", remaining, leftResult: false, nextCall: rightCall,
      vars: [{ name: "left result", value: false }, { name: "right child", value: node.right ? node.right.val : "None" }, { name: "right result", value: "waiting" }],
      note: { vi: "Vì trái trả False, dòng 8 phải gọi hasPathSum(right, remaining).", en: "Because the left side returned False, line 8 must call hasPathSum(right, remaining)." },
    });
    const rightResult = dfs(node.right, remaining, currentPathIds, currentPathValues, node, "right");

    returned.set(node.id, rightResult);
    callStack[callStack.length - 1].stage = "return-right";
    addStep({
      title: { vi: `Nhánh phải của ${node.val} trả về ${rightResult} → return ${rightResult}`, en: `Right branch of ${node.val} returns ${rightResult} → return ${rightResult}` },
      codeLines: [8], phase: "return-right", remaining, leftResult: false, rightResult, returnValue: rightResult,
      vars: [{ name: "left result", value: false }, { name: "right result", value: rightResult }, { name: "return", value: rightResult }],
      note: { vi: `False or ${rightResult} = ${rightResult}; node ${node.val} trả giá trị này về cha.`, en: `False or ${rightResult} = ${rightResult}; node ${node.val} returns this value to its caller.` },
    });
    callStack.pop();
    return rightResult;
  }

  const rootCall = { node: root, side: "root", target };
  addStep({
    title: { vi: `Bắt đầu hasPathSum(root, ${target})`, en: `Start hasPathSum(root, ${target})` },
    codeLines: [2], phase: "call-root", current: null, nextCall: rootCall,
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "targetSum", value: target }],
    note: { vi: "Gọi hàm tại root. Frame cuối trong stack sẽ là lời gọi đang thực thi.", en: "Call the function at the root. The last frame in the stack will be the active call." },
  });
  const answer = dfs(root, target, [], [], null, "root");
  const finalStep = snapshot(root, {
    title: { vi: answer ? `✓ Tìm thấy đường tổng ${target}` : `✗ Không có đường root→leaf tổng ${target}`, en: answer ? `✓ Found a path summing to ${target}` : `✗ No root-to-leaf path sums to ${target}` },
    hlSet: answer ? new Set(successfulPathIds) : undefined,
    wordSet: answer ? new Set(successfulPathIds) : undefined,
    annotations: annotationsFor(null, null, null),
    codeLines: [7],
    vars: [{ name: "answer", value: answer }, { name: "successful path", value: answer ? `[${successfulPathValues.join(", ")}]` : "none" }, { name: "call stack", value: "[]" }],
    note: answer
      ? { vi: `Đường [${successfulPathValues.join(", ")}] đi từ root đến lá và có tổng ${target}.`, en: `Path [${successfulPathValues.join(", ")}] goes from root to a leaf and sums to ${target}.` }
      : { vi: "Đã thử mọi nhánh cần thiết; không có lá nào kết thúc với remaining = 0.", en: "All required branches were tried; no leaf ended with remaining 0." },
  });
  finalStep.pathSumView = makeView({ phase: "done", current: null, returnValue: answer });
  finalStep.tree.nodes.forEach((node) => {
    if (returned.has(node.id)) node.sub = `↩ ${returned.get(node.id)}`;
  });
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer, steps };
}

// ─── 543: Diameter of Binary Tree ───
function buildSteps543(input) {
  const root = parseTree(input); const steps = [];
  const marker = (label, kind) => ({ label, kind });
  const sideName = (side) => (side === "left" ? "LEFT" : side === "right" ? "RIGHT" : "ROOT");
  const nullId = (node, side) => `null-${node.id}-${side}`;
  function missingNullChildren(node, onlySide = null) {
    if (!node) return [];
    return ["left", "right"]
      .filter((side) => (!onlySide || side === onlySide) && !node[side])
      .map((side) => ({ id: nullId(node, side), parentId: node.id, side }));
  }
  function relationAnnotations(node, side, parentNode) {
    const annotations = {};
    if (parentNode) annotations[parentNode.id] = marker("PARENT", "parent");
    if (node) annotations[node.id] = marker(sideName(side), side);
    else if (parentNode && side !== "root") annotations[nullId(parentNode, side)] = marker(sideName(side), side);
    return annotations;
  }
  function branchAnnotations(node, { activeSide = null, leftDepth, rightDepth } = {}) {
    const annotations = { [node.id]: marker("NODE", "node") };
    if (node.left) {
      const label = leftDepth === undefined
        ? (activeSide === "left" ? "LEFT" : "LEFT · pending")
        : `LEFT · d=${leftDepth}`;
      const kind = activeSide === "left" ? "left" : leftDepth === undefined ? "pending" : "left-done";
      annotations[node.left.id] = marker(label, kind);
    } else {
      const label = leftDepth === undefined ? "LEFT" : `LEFT · d=${leftDepth}`;
      const kind = activeSide === "left" ? "left" : leftDepth === undefined ? "pending" : "left-done";
      annotations[nullId(node, "left")] = marker(label, kind);
    }
    if (node.right) {
      const label = rightDepth === undefined
        ? (activeSide === "right" ? "RIGHT" : "RIGHT · pending")
        : `RIGHT · d=${rightDepth}`;
      const kind = activeSide === "right" ? "right" : rightDepth === undefined ? "pending" : "right-done";
      annotations[node.right.id] = marker(label, kind);
    } else {
      const label = rightDepth === undefined ? "RIGHT" : `RIGHT · d=${rightDepth}`;
      const kind = activeSide === "right" ? "right" : rightDepth === undefined ? "pending" : "right-done";
      annotations[nullId(node, "right")] = marker(label, kind);
    }
    return annotations;
  }
  steps.push(snapshot(root, {
    title: { vi: "Đường kính của cây", en: "Diameter of tree" },
    codeLines: [2], vars: [{ name: "root", value: root ? root.val : "None" }, { name: "l", value: "pending" }, { name: "r", value: "pending" }],
    note: { vi: `Đường kính = số CẠNH trên đường dài nhất giữa 2 nút bất kỳ. Tại mỗi nút: leftDepth + rightDepth. Lấy max toàn cây.`, en: `Diameter = number of EDGES on the longest path between any two nodes. At each node: leftDepth + rightDepth. Take the max over the whole tree.` },
  }));
  let best = 0, bestId = null, rootL = "—", rootR = "—";
  steps.push(snapshot(root, {
    title: { vi: "Khởi tạo đường kính tốt nhất", en: "Initialize the best diameter" },
    codeLines: [3],
    vars: [{ name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "self.best", value: best }],
    note: { vi: "Chưa xét nút nào nên self.best bắt đầu bằng 0 cạnh.", en: "No node has been processed, so self.best starts at 0 edges." },
  }));
  steps.push(snapshot(root, {
    title: { vi: "Định nghĩa hàm depth", en: "Define the depth function" },
    codeLines: [4],
    vars: [{ name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "self.best", value: best }],
    note: { vi: "depth(node) trả về chiều cao của nhánh dài nhất bắt đầu tại node.", en: "depth(node) returns the height of the longest downward branch from node." },
  }));
  function depth(node, side = "root", parentNode = null) {
    if (!node) {
      steps.push(snapshot(root, {
        title: {
          vi: parentNode ? `${sideName(side)} của ${parentNode.val} là None → depth = 0` : "depth(None) trả về 0",
          en: parentNode ? `${sideName(side)} of ${parentNode.val} is None → depth = 0` : "depth(None) returns 0",
        },
        hlSet: parentNode ? new Set([parentNode.id]) : undefined,
        annotations: relationAnnotations(node, side, parentNode),
        nullChildren: parentNode ? missingNullChildren(parentNode, side) : undefined,
        codeLines: [5],
        vars: [{ name: "side", value: sideName(side) }, { name: "node", value: "None" }, { name: "l", value: "—" }, { name: "r", value: "—" }, { name: "return", value: 0 }, { name: "self.best", value: best }],
        note: {
          vi: parentNode ? `Con ${side === "left" ? "trái" : "phải"} của ${parentNode.val} không tồn tại, nên lời gọi này trả 0.` : "Đây là điều kiện dừng của đệ quy; cây rỗng có chiều cao 0.",
          en: parentNode ? `The ${side} child of ${parentNode.val} does not exist, so this call returns 0.` : "This is the recursion base case; an empty tree has height 0.",
        },
      }));
      return 0;
    }
    steps.push(snapshot(root, {
      title: {
        vi: side === "root" ? `Quét ROOT ${node.val}` : `Quét node ${sideName(side)} ${node.val} của ${parentNode.val}`,
        en: side === "root" ? `Scan ROOT ${node.val}` : `Scan ${sideName(side)} node ${node.val} of ${parentNode.val}`,
      },
      hlSet: new Set([node.id]), annotations: relationAnnotations(node, side, parentNode), codeLines: [5],
      vars: [{ name: "side", value: sideName(side) }, { name: "node", value: node.val }, { name: "parent", value: parentNode ? parentNode.val : "None" }, { name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "self.best", value: best }],
      note: {
        vi: side === "root" ? `Bắt đầu tại root ${node.val}.` : `Node ${node.val} được đánh dấu ${sideName(side)} vì nó là con ${side === "left" ? "trái" : "phải"} của ${parentNode.val}.`,
        en: side === "root" ? `Start at root ${node.val}.` : `Node ${node.val} is marked ${sideName(side)} because it is the ${side} child of ${parentNode.val}.`,
      },
    }));
    steps.push(snapshot(root, {
      title: { vi: `Gọi depth bên trái của ${node.val}`, en: `Call the left depth of ${node.val}` },
      hlSet: new Set([node.left ? node.left.id : node.id]), annotations: branchAnnotations(node, { activeSide: "left" }), codeLines: [6],
      nullChildren: missingNullChildren(node),
      vars: [{ name: "node", value: node.val }, { name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "left child", value: node.left ? node.left.val : "None" }, { name: "self.best", value: best }],
      note: { vi: `Dòng 6 gọi depth(node.left). Node sắp quét được gắn nhãn LEFT.`, en: `Line 6 calls depth(node.left). The next node is marked LEFT.` },
    }));
    const l = depth(node.left, "left", node);
    steps.push(snapshot(root, {
      title: { vi: `Nhánh trái của ${node.val} có depth = ${l}`, en: `Left depth of ${node.val} is ${l}` },
      hlSet: new Set([node.right ? node.right.id : node.id]), annotations: branchAnnotations(node, { activeSide: "right", leftDepth: l }), codeLines: [7],
      nullChildren: missingNullChildren(node),
      vars: [{ name: "node", value: node.val }, { name: "l", value: l }, { name: "r", value: "pending" }, { name: "right child", value: node.right ? node.right.val : "None" }, { name: "self.best", value: best }],
      note: { vi: `LEFT đã trả l = ${l}. Dòng 7 chuyển sang node.right và gắn node sắp quét là RIGHT.`, en: `LEFT returned l = ${l}. Line 7 moves to node.right and marks the next node RIGHT.` },
    }));
    const r = depth(node.right, "right", node);
    if (node === root) { rootL = l; rootR = r; }
    const through = l + r;
    if (through > best) { best = through; bestId = node.id; }
    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: qua đây = ${through}`, en: `Node ${node.val}: through = ${through}` },
      hlSet: new Set([node.id]), annotations: branchAnnotations(node, { leftDepth: l, rightDepth: r }), codeLines: [8],
      nullChildren: missingNullChildren(node),
      vars: [{ name: "node", value: node.val }, { name: "l", value: l }, { name: "r", value: r }, { name: "path through", value: through }, { name: "self.best", value: best }],
      note: { vi: `Đường đi qua ${node.val} = ${l} + ${r} = ${through} cạnh. best = ${best}.`, en: `Path through ${node.val} = ${l} + ${r} = ${through} edges. best = ${best}.` },
    }));
    const height = 1 + Math.max(l, r);
    steps.push(snapshot(root, {
      title: { vi: `depth(${node.val}) trả về ${height}`, en: `depth(${node.val}) returns ${height}` },
      hlSet: new Set([node.id]), annotations: branchAnnotations(node, { leftDepth: l, rightDepth: r }), codeLines: [9],
      nullChildren: missingNullChildren(node),
      vars: [{ name: "node", value: node.val }, { name: "l", value: l }, { name: "r", value: r }, { name: "return", value: height }, { name: "self.best", value: best }],
      note: { vi: `Chiều cao trả về = 1 + max(${l}, ${r}) = ${height}.`, en: `Returned height = 1 + max(${l}, ${r}) = ${height}.` },
    }));
    return height;
  }
  steps.push(snapshot(root, {
    title: { vi: "Bắt đầu DFS từ root", en: "Start DFS from root" },
    codeLines: [10],
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "self.best", value: best }],
    note: { vi: "Gọi depth(root) để duyệt cây theo thứ tự hậu tự.", en: "Call depth(root) to traverse the tree in postorder." },
  }));
  depth(root, "root", null);
  const fs = snapshot(root, {
    title: { vi: `Đường kính = ${best}`, en: `Diameter = ${best}` },
    wordSet: bestId !== null ? new Set([bestId]) : undefined, codeLines: [11], vars: [{ name: "l", value: rootL }, { name: "r", value: rootR }, { name: "answer", value: best }],
    note: { vi: `Đường kính lớn nhất = ${best} cạnh.`, en: `Maximum diameter = ${best} edges.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: best, steps };
}

// ─── 124: Binary Tree Maximum Path Sum ───
function buildSteps124(input) {
  const root = parseTree(input);
  const steps = [];
  let maxSum = -Infinity;
  let bestId = null;

  steps.push(snapshot(root, {
    title: { vi: "Maximum Path Sum", en: "Maximum Path Sum" },
    codeLines: [3, 4],
    vars: [{ name: "max_sum", value: "-inf" }, { name: "rule", value: "node.val + left_gain + right_gain" }],
    note: {
      vi: "Dung postorder. Tai moi node, tinh gain tot nhat di len cha va cap nhat duong di tot nhat di QUA node do.",
      en: "Use postorder. At each node, compute the best gain to return to the parent and update the best path passing THROUGH that node.",
    },
  }));

  if (!root) {
    const fs = snapshot(root, {
      title: { vi: "Cay rong", en: "Empty tree" },
      codeLines: [11],
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Cay rong nen tra 0 trong visualization.", en: "The visualization returns 0 for an empty tree." },
    });
    fs.final = true;
    steps.push(fs);
    return { input, answer: 0, steps };
  }

  function gain(node) {
    if (!node) return 0;

    const leftGain = Math.max(gain(node.left), 0);
    const rightGain = Math.max(gain(node.right), 0);
    steps.push(snapshot(root, {
      title: { vi: `Node ${node.val}: left/right gain`, en: `Node ${node.val}: left/right gain` },
      hlSet: new Set([node.id]),
      wordSet: bestId !== null ? new Set([bestId]) : undefined,
      codeLines: [6, 7],
      vars: [
        { name: "node", value: node.val },
        { name: "left_gain", value: leftGain },
        { name: "right_gain", value: rightGain },
        { name: "max_sum", value: maxSum === -Infinity ? "-inf" : maxSum },
      ],
      note: {
        vi: `Gain am bi bo qua bang max(gain, 0). Tai node ${node.val}: left_gain = ${leftGain}, right_gain = ${rightGain}.`,
        en: `Negative gains are ignored with max(gain, 0). At node ${node.val}: left_gain = ${leftGain}, right_gain = ${rightGain}.`,
      },
    }));

    const pathThrough = node.val + leftGain + rightGain;
    const oldMax = maxSum;
    if (pathThrough > maxSum) {
      maxSum = pathThrough;
      bestId = node.id;
    }
    steps.push(snapshot(root, {
      title: { vi: `Qua ${node.val}: ${pathThrough}`, en: `Through ${node.val}: ${pathThrough}` },
      hlSet: new Set([node.id]),
      wordSet: bestId !== null ? new Set([bestId]) : undefined,
      codeLines: [8],
      vars: [
        { name: "node.val", value: node.val },
        { name: "left_gain", value: leftGain },
        { name: "right_gain", value: rightGain },
        { name: "path_sum", value: `${node.val} + ${leftGain} + ${rightGain} = ${pathThrough}` },
        { name: "max_sum before", value: oldMax === -Infinity ? "-inf" : oldMax },
        { name: "max_sum after", value: maxSum },
      ],
      note: {
        vi: `Duong di tot nhat di qua node nay = ${node.val} + ${leftGain} + ${rightGain} = ${pathThrough}. Cap nhat max_sum = ${maxSum}.`,
        en: `Best path passing through this node = ${node.val} + ${leftGain} + ${rightGain} = ${pathThrough}. Update max_sum = ${maxSum}.`,
      },
    }));

    const returnGain = node.val + Math.max(leftGain, rightGain);
    steps.push(snapshot(root, {
      title: { vi: `Return gain = ${returnGain}`, en: `Return gain = ${returnGain}` },
      hlSet: new Set([node.id]),
      wordSet: bestId !== null ? new Set([bestId]) : undefined,
      codeLines: [9],
      vars: [
        { name: "node", value: node.val },
        { name: "return", value: `${node.val} + max(${leftGain}, ${rightGain}) = ${returnGain}` },
        { name: "max_sum", value: maxSum },
      ],
      note: {
        vi: `Tra ve cha chi duoc chon 1 nhanh: node.val + max(left_gain, right_gain) = ${returnGain}.`,
        en: `Return only one branch to the parent: node.val + max(left_gain, right_gain) = ${returnGain}.`,
      },
    }));
    return returnGain;
  }

  gain(root);
  const fs = snapshot(root, {
    title: { vi: `Max path sum = ${maxSum}`, en: `Max path sum = ${maxSum}` },
    wordSet: bestId !== null ? new Set([bestId]) : undefined,
    codeLines: [11],
    vars: [{ name: "answer", value: maxSum }],
    note: {
      vi: `Ket qua la max_sum = ${maxSum}. Duong di co the bat dau va ket thuc o bat ky node nao.`,
      en: `The answer is max_sum = ${maxSum}. The path may start and end at any nodes.`,
    },
  });
  fs.final = true;
  steps.push(fs);
  return { input, answer: maxSum, steps };
}

// ─── 1022: Sum of Root To Leaf Binary Numbers ───
function buildSteps1022(input) {
  const root = parseTree(input); const steps = []; let total = 0;
  steps.push(snapshot(root, {
    title: { vi: "Tổng các số nhị phân root→leaf", en: "Sum of root→leaf binary numbers" },
    codeLines: [2, 3], vars: [{ name: "total", value: 0 }],
    note: { vi: `Mỗi đường root→leaf là 1 số nhị phân (bit cao nhất ở gốc). curr = curr*2 + node.val. Tới lá → cộng curr vào tổng.`, en: `Each root→leaf path is a binary number (MSB at the root). curr = curr*2 + node.val. At a leaf → add curr to total.` },
  }));
  function dfs(node, curr, bits) {
    if (!node) return;
    const c = curr * 2 + node.val; const nb = bits + node.val;
    const isLeaf = !node.left && !node.right;
    steps.push(snapshot(root, {
      title: { vi: `Tại ${node.val}: curr = ${c}`, en: `At ${node.val}: curr = ${c}` },
      hlSet: new Set([node.id]), codeLines: [4, 5],
      vars: [{ name: "node", value: node.val }, { name: "bits", value: nb }, { name: "curr (dec)", value: c }],
      note: { vi: `curr = ${curr}*2 + ${node.val} = ${c} (nhị phân ${nb}).` + (isLeaf ? ` Lá → total += ${c}.` : ``), en: `curr = ${curr}*2 + ${node.val} = ${c} (binary ${nb}).` + (isLeaf ? ` Leaf → total += ${c}.` : ``) },
    }));
    if (isLeaf) { total += c; return; }
    dfs(node.left, c, nb); dfs(node.right, c, nb);
  }
  if (root) dfs(root, 0, "");
  const fs = snapshot(root, {
    title: { vi: `Tổng = ${total}`, en: `Total = ${total}` },
    vars: [{ name: "answer", value: total }],
    note: { vi: `Tổng tất cả số nhị phân root→leaf = ${total}.`, en: `Sum of all root→leaf binary numbers = ${total}.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: total, steps };
}

// ─── 1080: Insufficient Nodes in Root to Leaf Paths ───
function parseTree1080(input) {
  const raw = Array.isArray(input)
    ? input
    : String(input ?? "").trim().replace(/^\[|\]$/g, "").split(",").map((value) => value.trim());
  if (!raw.length || raw.every((value) => value === "")) return null;
  const values = raw.map((value) => {
    if (value === null || String(value).toLowerCase() === "null" || String(value) === "") return null;
    const number = Number(value);
    if (!Number.isInteger(number) || number < -100000 || number > 100000) {
      throw new Error("Tree values must be integers between -100000 and 100000, or null");
    }
    return number;
  });
  if (values[0] === null) return null;

  const root = { id: 0, val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const parent = queue.shift();
    if (values[index] !== null) {
      parent.left = { id: index, val: values[index], left: null, right: null };
      queue.push(parent.left);
    }
    index++;
    if (index < values.length && values[index] !== null) {
      parent.right = { id: index, val: values[index], left: null, right: null };
      queue.push(parent.right);
    }
    index++;
  }
  if (index < values.length && values.slice(index).some((value) => value !== null)) {
    throw new Error("Invalid level-order tree: values remain after all parents are null");
  }
  return root;
}

function buildSteps1080(input, params) {
  const root = parseTree1080(input);
  const limit = Number(params && params.limit);
  if (!Number.isInteger(limit)) throw new Error("limit must be an integer");

  const steps = [];
  const kept = new Set();
  const pruned = new Set();
  const stack = [];
  const pathSums = new Map();
  const nodeById = new Map();
  (function indexNodes(node) {
    if (!node) return;
    nodeById.set(node.id, node);
    indexNodes(node.left);
    indexNodes(node.right);
  })(root);

  // Keep the original shape in every frame. Nodes that have been removed are
  // painted as pruned instead of disappearing, so the decision remains visible.
  function addStep({
    title,
    current = null,
    codeLines = [],
    vars = [],
    note,
    annotations = {},
    final = false,
    event = "intro",
    phaseIndex = 0,
    decision = null,
    resultTree = null,
  }) {
    const frame = snapshot(root, {
      title,
      hlSet: current ? new Set([current.id]) : undefined,
      wordSet: kept,
      annotations,
      codeLines,
      vars: [
        ...vars,
        { name: "kept", value: kept.size },
        { name: "pruned", value: pruned.size },
      ],
      note,
    });
    frame.tree.showLevels = false;
    frame.tree.nodes.forEach((node) => {
      node.isPruned = pruned.has(node.id);
      if (pathSums.has(node.id)) node.sub = `Σ=${pathSums.get(node.id)}`;
    });
    frame.insufficient1080View = {
      event,
      phaseIndex,
      limit,
      currentId: current ? current.id : null,
      currentValue: current ? current.val : null,
      pathSum: current && pathSums.has(current.id) ? pathSums.get(current.id) : null,
      path: stack.map((entry) => ({ id: entry.id, value: entry.value })),
      stack: stack.map((entry) => ({ ...entry })),
      keptIds: [...kept],
      prunedIds: [...pruned],
      decided: kept.size + pruned.size,
      totalNodes: nodeById.size,
      decision,
      resultTree,
    };
    if (final) frame.final = true;
    steps.push(frame);
  }

  function setStackStage(stage) {
    if (stack.length) stack[stack.length - 1].stage = stage;
  }

  function serializeResult(node) {
    if (!node || !kept.has(node.id)) return "[]";
    const values = [];
    const queue = [node];
    while (queue.length) {
      const current = queue.shift();
      if (!current) {
        values.push(null);
        continue;
      }
      values.push(current.val);
      queue.push(current.left && kept.has(current.left.id) ? current.left : null);
      queue.push(current.right && kept.has(current.right.id) ? current.right : null);
    }
    while (values.length && values[values.length - 1] === null) values.pop();
    return JSON.stringify(values);
  }

  if (!root) {
    addStep({
      title: { vi: "Cây rỗng → trả về None", en: "Empty tree → return None" },
      codeLines: [2, 12],
      vars: [{ name: "root", value: "None" }, { name: "answer", value: "[]" }],
      note: { vi: "Không có đường root-to-leaf nào để giữ lại.", en: "There is no root-to-leaf path to retain." },
      event: "done",
      phaseIndex: 3,
      decision: { type: "done", survives: false },
      resultTree: "[]",
      final: true,
    });
    return { input, limit, answer: "[]", steps };
  }

  addStep({
    title: { vi: "Giữ một node nếu còn đường đi đạt limit", en: "Keep a node only if a path can reach limit" },
    codeLines: [2, 3],
    vars: [{ name: "limit", value: limit }, { name: "rule", value: "keep leaf when path_sum ≥ limit" }],
    note: {
      vi: "Duyệt hậu tự. Lá được giữ khi tổng từ root đến lá ≥ limit. Node bên trong chỉ được giữ nếu ít nhất một con còn sống.",
      en: "Use postorder DFS. A leaf survives when its root-to-leaf sum is at least limit. An internal node survives only if at least one child survives.",
    },
    event: "intro",
    phaseIndex: 0,
    decision: { type: "rule" },
  });

  function dfs(node, pathSum, pathValues) {
    if (!node) return false;
    const total = pathSum + node.val;
    const path = [...pathValues, node.val];
    const pathText = path.join(" → ");
    const isLeaf = !node.left && !node.right;
    pathSums.set(node.id, total);
    stack.push({ id: node.id, value: node.val, pathSum: total, stage: "DESCEND" });

    addStep({
      title: { vi: `Vào dfs(${node.val})`, en: `Enter dfs(${node.val})` },
      current: node,
      codeLines: [3, 6, 7],
      vars: [
        { name: "node", value: node.val },
        { name: "path", value: pathText },
        { name: "path_sum", value: total },
        { name: "is leaf", value: isLeaf },
      ],
      annotations: { [node.id]: { label: `sum = ${total}`, kind: "" } },
      note: {
        vi: `Cộng ${node.val}: tổng đường ${pathText} = ${total}.`,
        en: `Add ${node.val}: path sum ${pathText} = ${total}.`,
      },
      event: "enter",
      phaseIndex: 0,
      decision: { type: "enter", previousSum: pathSum, nodeValue: node.val, pathSum: total },
    });

    if (isLeaf) {
      const survives = total >= limit;
      if (survives) kept.add(node.id);
      else pruned.add(node.id);
      setStackStage("LEAF DECISION");
      addStep({
        title: survives
          ? { vi: `Lá ${node.val}: ${total} ≥ ${limit} → GIỮ`, en: `Leaf ${node.val}: ${total} ≥ ${limit} → KEEP` }
          : { vi: `Lá ${node.val}: ${total} < ${limit} → CẮT`, en: `Leaf ${node.val}: ${total} < ${limit} → PRUNE` },
        current: node,
        codeLines: [7, 8],
        vars: [
          { name: "path_sum", value: total },
          { name: "limit", value: limit },
          { name: "return", value: survives ? node.val : "None" },
        ],
        annotations: { [node.id]: { label: survives ? "KEEP" : "PRUNE", kind: "" } },
        note: survives
          ? { vi: "Đây là một đường đi hợp lệ, nên trả node về cho cha.", en: "This is a sufficient path, so return the node to its parent." }
          : { vi: "Mọi đường qua lá này đều không đủ, nên trả None cho cha.", en: "This leaf's path is insufficient, so return None to its parent." },
        event: survives ? "keep-leaf" : "prune-leaf",
        phaseIndex: 1,
        decision: { type: "leaf", pathSum: total, limit, survives },
      });
      stack.pop();
      return survives;
    }

    setStackStage("CALL LEFT");
    addStep({
      title: { vi: `Duyệt con trái của ${node.val}`, en: `Explore ${node.val}'s left child` },
      current: node,
      codeLines: [9],
      vars: [
        { name: "path_sum", value: total },
        { name: "left child", value: node.left ? node.left.val : "None" },
      ],
      note: node.left
        ? { vi: `Phải biết nhánh trái của ${node.val} có đường hợp lệ không.`, en: `First determine whether ${node.val}'s left branch has a sufficient path.` }
        : { vi: "Không có con trái nên lời gọi sẽ trả None.", en: "There is no left child, so this call returns None." },
      event: "call-left",
      phaseIndex: 0,
      decision: { type: "call", side: "left", childValue: node.left ? node.left.val : null },
    });
    const leftKept = dfs(node.left, total, path);
    setStackStage("LEFT RETURNED");
    addStep({
      title: { vi: `Con trái của ${node.val} trả ${leftKept ? "node" : "None"}`, en: `${node.val}'s left child returns ${leftKept ? "node" : "None"}` },
      current: node,
      codeLines: [9],
      vars: [{ name: "left result", value: leftKept ? "kept" : "None" }, { name: "path_sum", value: total }],
      note: leftKept
        ? { vi: "Nhánh trái có ít nhất một lá đủ điều kiện.", en: "The left branch contains at least one sufficient leaf." }
        : { vi: "Nhánh trái không còn đường hợp lệ.", en: "No sufficient path remains in the left branch." },
      event: "left-return",
      phaseIndex: 2,
      decision: { type: "child-return", side: "left", survives: leftKept },
    });

    setStackStage("CALL RIGHT");
    addStep({
      title: { vi: `Duyệt con phải của ${node.val}`, en: `Explore ${node.val}'s right child` },
      current: node,
      codeLines: [10],
      vars: [
        { name: "path_sum", value: total },
        { name: "right child", value: node.right ? node.right.val : "None" },
      ],
      note: node.right
        ? { vi: `Tiếp tục kiểm tra nhánh phải của ${node.val}.`, en: `Continue by checking ${node.val}'s right branch.` }
        : { vi: "Không có con phải nên lời gọi sẽ trả None.", en: "There is no right child, so this call returns None." },
      event: "call-right",
      phaseIndex: 0,
      decision: { type: "call", side: "right", childValue: node.right ? node.right.val : null },
    });
    const rightKept = dfs(node.right, total, path);
    setStackStage("RIGHT RETURNED");
    addStep({
      title: { vi: `Con phải của ${node.val} trả ${rightKept ? "node" : "None"}`, en: `${node.val}'s right child returns ${rightKept ? "node" : "None"}` },
      current: node,
      codeLines: [10],
      vars: [{ name: "right result", value: rightKept ? "kept" : "None" }, { name: "path_sum", value: total }],
      note: rightKept
        ? { vi: "Nhánh phải có ít nhất một lá đủ điều kiện.", en: "The right branch contains at least one sufficient leaf." }
        : { vi: "Nhánh phải không còn đường hợp lệ.", en: "No sufficient path remains in the right branch." },
      event: "right-return",
      phaseIndex: 2,
      decision: { type: "child-return", side: "right", survives: rightKept },
    });

    const survives = leftKept || rightKept;
    if (survives) kept.add(node.id);
    else pruned.add(node.id);
    setStackStage("RETURN TO PARENT");
    addStep({
      title: survives
        ? { vi: `Node ${node.val}: còn con sống → GIỮ`, en: `Node ${node.val}: a child survives → KEEP` }
        : { vi: `Node ${node.val}: hai con đều None → CẮT`, en: `Node ${node.val}: both children are None → PRUNE` },
      current: node,
      codeLines: [11],
      vars: [
        { name: "left", value: leftKept ? "node" : "None" },
        { name: "right", value: rightKept ? "node" : "None" },
        { name: "return", value: survives ? node.val : "None" },
      ],
      annotations: { [node.id]: { label: survives ? "KEEP" : "PRUNE", kind: "" } },
      note: survives
        ? { vi: "Ít nhất một đường đi xuống vẫn đạt limit, nên giữ node hiện tại làm cầu nối.", en: "At least one downward path still reaches limit, so keep this node as the connection." }
        : { vi: "Mọi lá bên dưới đều bị cắt; node này cũng không nằm trên đường hợp lệ nào.", en: "Every leaf below was pruned, so this node lies on no sufficient root-to-leaf path." },
      event: survives ? "keep-parent" : "prune-parent",
      phaseIndex: 2,
      decision: { type: "parent", leftSurvives: leftKept, rightSurvives: rightKept, survives },
    });
    stack.pop();
    return survives;
  }

  const rootKept = dfs(root, 0, []);
  const answer = rootKept ? serializeResult(root) : "[]";
  addStep({
    title: rootKept
      ? { vi: "Hoàn tất: cây đã được cắt", en: "Complete: tree pruned" }
      : { vi: "Hoàn tất: không còn đường hợp lệ", en: "Complete: no sufficient path remains" },
    codeLines: [12],
    vars: [{ name: "answer", value: answer }, { name: "limit", value: limit }],
    note: rootKept
      ? { vi: `Các node xanh tạo thành cây trả về: ${answer}.`, en: `The green nodes form the returned tree: ${answer}.` }
      : { vi: "Tất cả đường root-to-leaf đều có tổng nhỏ hơn limit, nên trả về None.", en: "Every root-to-leaf path has a sum below limit, so return None." },
    event: "done",
    phaseIndex: 3,
    decision: { type: "done", survives: rootKept },
    resultTree: answer,
    final: true,
  });
  return { input, limit, answer, steps };
}

// ─── 226: Invert Binary Tree ───
function buildSteps226(input) {
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Lật cây (Invert)", en: "Invert tree" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "swap(left, right) for every node" }],
    note: { vi: `Với MỖI nút, hoán đổi con trái ↔ con phải, đệ quy toàn cây → được cây gương.`, en: `For EACH node, swap left ↔ right child, recursively over the whole tree → mirrored tree.` },
  }));
  function invert(node) {
    if (!node) return;
    const tmp = node.left; node.left = node.right; node.right = tmp;
    steps.push(snapshot(root, {
      title: { vi: `Hoán đổi con của ${node.val}`, en: `Swap children of ${node.val}` },
      hlSet: new Set([node.id]), codeLines: [4, 5],
      vars: [{ name: "node", value: node.val }, { name: "left now", value: node.left ? node.left.val : "null" }, { name: "right now", value: node.right ? node.right.val : "null" }],
      note: { vi: `Đổi con trái ↔ phải của ${node.val}.`, en: `Swapped left ↔ right of ${node.val}.` },
    }));
    invert(node.left); invert(node.right);
  }
  invert(root);
  const fs = snapshot(root, {
    title: { vi: `Cây đã được lật`, en: `Tree inverted` },
    vars: [{ name: "answer", value: "inverted" }],
    note: { vi: `Tất cả nút đã hoán đổi con → cây gương.`, en: `All nodes' children swapped → mirrored tree.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: "inverted", steps };
}

// ─── 101: Symmetric Tree ───
function buildSteps101(input) {
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Kiểm tra cây đối xứng", en: "Check symmetric tree" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "L.val==R.val, L.left↔R.right, L.right↔R.left" }],
    note: { vi: `Cây đối xứng nếu con trái là ẢNH GƯƠNG của con phải. So sánh: L.val == R.val, rồi (L.left ↔ R.right) và (L.right ↔ R.left).`, en: `Tree is symmetric if the left subtree is a MIRROR of the right. Compare: L.val == R.val, then (L.left ↔ R.right) and (L.right ↔ R.left).` },
  }));
  let answer = true;
  function mirror(a, b) {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) {
      answer = false;
      steps.push(snapshot(root, {
        title: { vi: `✗ Không khớp`, en: `✗ Mismatch` },
        hlSet: new Set([a, b].filter(Boolean).map((n) => n.id)), codeLines: [5, 6],
        vars: [{ name: "left", value: a ? a.val : "null" }, { name: "right", value: b ? b.val : "null" }],
        note: { vi: `${a ? a.val : "null"} ≠ ${b ? b.val : "null"} → không đối xứng.`, en: `${a ? a.val : "null"} ≠ ${b ? b.val : "null"} → not symmetric.` },
      }));
      return false;
    }
    steps.push(snapshot(root, {
      title: { vi: `So khớp ${a.val} ↔ ${b.val}`, en: `Match ${a.val} ↔ ${b.val}` },
      hlSet: new Set([a.id, b.id]), codeLines: [7, 8],
      vars: [{ name: "left", value: a.val }, { name: "right", value: b.val }],
      note: { vi: `${a.val} == ${b.val} ✓. Tiếp tục so: (L.left ↔ R.right) và (L.right ↔ R.left).`, en: `${a.val} == ${b.val} ✓. Continue: (L.left ↔ R.right) and (L.right ↔ R.left).` },
    }));
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  }
  if (root) mirror(root.left, root.right);
  const fs = snapshot(root, {
    title: { vi: answer ? `✓ Đối xứng` : `✗ Không đối xứng`, en: answer ? `✓ Symmetric` : `✗ Not symmetric` },
    vars: [{ name: "answer", value: answer }],
    note: { vi: answer ? `Cây đối xứng qua trục giữa.` : `Cây KHÔNG đối xứng.`, en: answer ? `Tree is symmetric about its center.` : `Tree is NOT symmetric.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 100: Same Tree ───
function buildSteps100(input, params) {
  const pRoot = parseTree(input);
  const qInput = params && typeof params.q === "string" ? params.q : input;
  const qRoot = parseTree(qInput);
  const steps = [];
  const matchedP = new Set();
  const matchedQ = new Set();

  const nodeValue = (node) => (node ? node.val : "None");
  const pythonBool = (value) => (value ? "True" : "False");
  const treeState = (root, current, matched, pointer) => ({
    nodes: treeToVizNodes(root, current ? new Set([current.id]) : null, matched),
    annotations: current ? { [current.id]: pointer } : {},
    showLevels: false,
  });

  function addStep({
    title, p, q, pDisplay, qDisplay, path, status, statusText, relation = "↔", codeLines, vars, note, result,
  }) {
    steps.push({
      title,
      arr: [],
      sameTreeView: {
        pTree: treeState(pRoot, p, matchedP, "p"),
        qTree: treeState(qRoot, q, matchedQ, "q"),
        pValue: pDisplay !== undefined ? pDisplay : nodeValue(p),
        qValue: qDisplay !== undefined ? qDisplay : nodeValue(q),
        path,
        status,
        statusText,
        relation,
        result,
      },
      highlight: [],
      mark: [],
      codeLines: codeLines || [],
      vars: vars || [],
      note,
    });
  }

  function compare(p, q, path) {
    addStep({
      title: { vi: `Gọi isSameTree tại ${path}`, en: `Call isSameTree at ${path}` },
      p, q, path, status: "checking", statusText: { vi: "Bắt đầu so sánh", en: "Start comparison" },
      codeLines: [2],
      vars: [{ name: "p", value: nodeValue(p) }, { name: "q", value: nodeValue(q) }, { name: "path", value: path }],
      note: { vi: `Đặt p và q vào đúng vị trí ${path} của hai cây.`, en: `Place p and q at the same ${path} position in both trees.` },
    });

    const bothNone = !p && !q;
    addStep({
      title: { vi: `Kiểm tra: p và q đều None? → ${pythonBool(bothNone)}`, en: `Check: are p and q both None? → ${pythonBool(bothNone)}` },
      p, q, path, status: bothNone ? "match" : "checking",
      statusText: bothNone ? { vi: "Cùng rỗng", en: "Both empty" } : { vi: "Không cùng rỗng", en: "Not both empty" },
      relation: bothNone ? "=" : "↔", codeLines: [3],
      vars: [{ name: "not p and not q", value: bothNone }],
      note: bothNone
        ? { vi: "Hai vị trí đều không có node nên cấu trúc tại đây giống nhau.", en: "Both positions have no node, so their structure matches here." }
        : { vi: "Ít nhất một bên còn node, tiếp tục điều kiện kế tiếp.", en: "At least one side has a node, so continue to the next condition." },
    });
    if (bothNone) {
      addStep({
        title: { vi: `return True cho ${path}`, en: `return True for ${path}` },
        p, q, path, status: "match", statusText: { vi: "Trả về True", en: "Return True" },
        relation: "=", codeLines: [4], result: true,
        vars: [{ name: "return", value: true }, { name: "path", value: path }],
        note: { vi: "Dòng 4 trả True cho cặp None, None này.", en: "Line 4 returns True for this None, None pair." },
      });
      return true;
    }

    const oneNone = !p || !q;
    addStep({
      title: { vi: `Kiểm tra: chỉ một bên là None? → ${pythonBool(oneNone)}`, en: `Check: is exactly one side None? → ${pythonBool(oneNone)}` },
      p, q, path, status: oneNone ? "mismatch" : "checking",
      statusText: oneNone ? { vi: "Khác cấu trúc", en: "Different structure" } : { vi: "Cả hai đều có node", en: "Both nodes exist" },
      relation: oneNone ? "≠" : "↔", codeLines: [5],
      vars: [{ name: "not p or not q", value: oneNone }],
      note: oneNone
        ? { vi: "Một cây có node nhưng cây kia không có node ở cùng vị trí.", en: "One tree has a node while the other does not at the same position." }
        : { vi: "Cả p và q đều tồn tại, bây giờ mới an toàn đọc .val.", en: "Both p and q exist, so it is now safe to read .val." },
    });
    if (oneNone) {
      addStep({
        title: { vi: `return False: cấu trúc khác tại ${path}`, en: `return False: structure differs at ${path}` },
        p, q, path, status: "mismatch", statusText: { vi: "Trả về False", en: "Return False" },
        relation: "≠", codeLines: [6], result: false,
        vars: [{ name: "return", value: false }, { name: "path", value: path }],
        note: { vi: "Dòng 6 trả False ngay vì cấu trúc hai cây không giống nhau.", en: "Line 6 returns False immediately because the tree structures differ." },
      });
      return false;
    }

    const sameValue = p.val === q.val;
    if (sameValue) {
      matchedP.add(p.id);
      matchedQ.add(q.id);
    }
    addStep({
      title: { vi: `So sánh giá trị: ${p.val} != ${q.val} → ${pythonBool(!sameValue)}`, en: `Compare values: ${p.val} != ${q.val} → ${pythonBool(!sameValue)}` },
      p, q, path, status: sameValue ? "match" : "mismatch",
      statusText: sameValue ? { vi: "Giá trị khớp", en: "Values match" } : { vi: "Giá trị khác nhau", en: "Values differ" },
      relation: sameValue ? "=" : "≠", codeLines: [7],
      vars: [{ name: "p.val", value: p.val }, { name: "q.val", value: q.val }, { name: "p.val != q.val", value: !sameValue }],
      note: sameValue
        ? { vi: `Hai node tại ${path} cùng giá trị ${p.val}; đánh dấu cặp này đã khớp.`, en: `Both nodes at ${path} have value ${p.val}; mark this pair as matched.` }
        : { vi: `Hai node cùng vị trí nhưng ${p.val} khác ${q.val}.`, en: `The nodes share a position, but ${p.val} differs from ${q.val}.` },
    });
    if (!sameValue) {
      addStep({
        title: { vi: `return False: giá trị khác tại ${path}`, en: `return False: values differ at ${path}` },
        p, q, path, status: "mismatch", statusText: { vi: "Trả về False", en: "Return False" },
        relation: "≠", codeLines: [8], result: false,
        vars: [{ name: "return", value: false }, { name: "path", value: path }],
        note: { vi: "Dòng 8 trả False ngay; không cần kiểm tra các node con.", en: "Line 8 returns False immediately; child nodes do not need to be checked." },
      });
      return false;
    }

    addStep({
      title: { vi: `So sánh hai node con trái của ${path}`, en: `Compare the left children of ${path}` },
      p, q, path, status: "checking", statusText: { vi: "Đi vào nhánh trái", en: "Descend left" },
      relation: "=", codeLines: [9],
      vars: [{ name: "next p", value: nodeValue(p.left) }, { name: "next q", value: nodeValue(q.left) }],
      note: { vi: "Dòng 9 gọi đệ quy với p.left và q.left.", en: "Line 9 recursively calls p.left and q.left." },
    });
    const leftSame = compare(p.left, q.left, `${path}.left`);
    if (!leftSame) {
      addStep({
        title: { vi: `Nhánh trái False → bỏ qua nhánh phải`, en: `Left branch is False → skip the right branch` },
        p, q, path, status: "mismatch", statusText: { vi: "and dừng sớm", en: "and short-circuits" },
        relation: "≠", codeLines: [9], result: false,
        vars: [{ name: "left result", value: false }, { name: "right call", value: "skipped" }],
        note: { vi: "Toán tử and dừng ngay khi vế trái False, nên dòng 10 không được gọi tại cặp này.", en: "The and operator stops when its left side is False, so line 10 is not called for this pair." },
      });
      return false;
    }

    addStep({
      title: { vi: `Nhánh trái True → so sánh hai node con phải`, en: `Left branch is True → compare the right children` },
      p, q, path, status: "checking", statusText: { vi: "Đi vào nhánh phải", en: "Descend right" },
      relation: "=", codeLines: [10],
      vars: [{ name: "left result", value: true }, { name: "next p", value: nodeValue(p.right) }, { name: "next q", value: nodeValue(q.right) }],
      note: { vi: "Vế trái của and là True, nên dòng 10 tiếp tục gọi p.right và q.right.", en: "The left side of and is True, so line 10 continues with p.right and q.right." },
    });
    const rightSame = compare(p.right, q.right, `${path}.right`);

    addStep({
      title: {
        vi: `Hai nhánh tại ${path}: True and ${pythonBool(rightSame)} → ${pythonBool(rightSame)}`,
        en: `Both branches at ${path}: True and ${pythonBool(rightSame)} → ${pythonBool(rightSame)}`,
      },
      p, q, path, status: rightSame ? "match" : "mismatch",
      statusText: rightSame ? { vi: "Cây con giống nhau", en: "Subtrees match" } : { vi: "Cây con khác nhau", en: "Subtrees differ" },
      relation: rightSame ? "=" : "≠", codeLines: [9, 10], result: rightSame,
      vars: [{ name: "left result", value: true }, { name: "right result", value: rightSame }, { name: "return", value: rightSame }],
      note: rightSame
        ? { vi: `Cả nhánh trái và phải của ${path} đều True, trả True lên lời gọi cha.`, en: `Both branches of ${path} are True, so return True to the parent call.` }
        : { vi: `Nhánh phải của ${path} là False, nên cây con này trả False.`, en: `The right branch of ${path} is False, so this subtree returns False.` },
    });
    return rightSame;
  }

  const answer = compare(pRoot, qRoot, "root");
  addStep({
    title: { vi: answer ? "Hai cây giống hệt nhau" : "Hai cây không giống nhau", en: answer ? "The two trees are identical" : "The two trees are different" },
    p: null, q: null, pDisplay: { vi: "cây", en: "tree" }, qDisplay: { vi: "cây", en: "tree" },
    path: "done", status: answer ? "match" : "mismatch",
    statusText: answer ? { vi: "Kết quả: True", en: "Result: True" } : { vi: "Kết quả: False", en: "Result: False" },
    relation: answer ? "=" : "≠", result: answer,
    vars: [{ name: "answer", value: answer }],
    note: answer
      ? { vi: "Mọi cặp vị trí đều có cùng cấu trúc và cùng giá trị.", en: "Every corresponding position has the same structure and value." }
      : { vi: "Đã tìm thấy ít nhất một vị trí khác cấu trúc hoặc khác giá trị.", en: "At least one position differs in structure or value." },
  });
  steps[steps.length - 1].final = true;
  return { input, answer, steps };
}

// ─── 637: Average of Levels in Binary Tree ───
function buildSteps637(input) {
  const root = parseTree(input); const steps = []; const averages = [];
  steps.push(snapshot(root, {
    title: { vi: "Trung bình mỗi tầng", en: "Average of each level" },
    codeLines: [2, 3], vars: [{ name: "result", value: "[]" }],
    note: { vi: `BFS theo tầng. Mỗi tầng: tổng giá trị / số nút = trung bình.`, en: `BFS by level. For each level: sum of values / count = average.` },
  }));
  if (root) {
    let queue = [root]; const visited = new Set(); let lvl = 0;
    while (queue.length) {
      const vals = queue.map((n) => n.val); const sum = vals.reduce((a, b) => a + b, 0); const avg = sum / vals.length;
      averages.push(avg); queue.forEach((n) => visited.add(n.id));
      steps.push(snapshot(root, {
        title: { vi: `Tầng ${lvl}: avg = ${avg}`, en: `Level ${lvl}: avg = ${avg}` },
        hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [4, 5, 6],
        vars: [{ name: "level", value: lvl }, { name: "values", value: `[${vals.join(",")}]` }, { name: "avg", value: `${sum}/${vals.length} = ${avg}` }],
        note: { vi: `Trung bình tầng ${lvl} = ${sum}/${vals.length} = ${avg}.`, en: `Average of level ${lvl} = ${sum}/${vals.length} = ${avg}.` },
      }));
      const next = []; for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); } queue = next; lvl++;
    }
  }
  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${averages.join(",")}]`, en: `Result: [${averages.join(",")}]` },
    vars: [{ name: "answer", value: `[${averages.join(",")}]` }],
    note: { vi: `Trung bình các tầng hoàn tất.`, en: `Level averages complete.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: `[${averages.join(",")}]`, steps };
}

// ─── 199: Binary Tree Right Side View ───
function buildSteps199(input) {
  const root = parseTree(input);
  const steps = [];
  const res = [];
  const visible = new Set();
  const values = (nodes) => `[${nodes.map((node) => node.val).join(",")}]`;

  steps.push(snapshot(root, {
    title: { vi: "Bắt đầu rightSideView", en: "Enter rightSideView" },
    codeLines: [2],
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "res", value: "not initialized" }, { name: "queue", value: "not initialized" }],
    note: { vi: "Nhận root và bắt đầu hàm.", en: "Receive root and enter the function." },
  }));

  steps.push(snapshot(root, {
    title: { vi: root ? "root khác None" : "Cây rỗng → trả []", en: root ? "root is not None" : "Empty tree → return []" },
    codeLines: [3],
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "res", value: "[]" }, { name: "queue", value: "[]" }],
    note: root
      ? { vi: "Điều kiện `not root` là False nên tiếp tục BFS.", en: "The `not root` condition is false, so continue with BFS." }
      : { vi: "Điều kiện `not root` là True; hàm kết thúc ngay với [].", en: "The `not root` condition is true; return [] immediately." },
  }));

  if (!root) {
    steps[steps.length - 1].final = true;
    return { input, answer: "[]", steps };
  }

  let queue = [root];
  let level = 0;
  steps.push(snapshot(root, {
    title: { vi: "Khởi tạo res và queue", en: "Initialize res and queue" },
    hlSet: new Set([root.id]), wordSet: new Set(visible), codeLines: [4],
    vars: [{ name: "res", value: "[]" }, { name: "queue", value: values(queue) }, { name: "nxt", value: "not initialized" }],
    note: { vi: `res = []; queue = [${root.val}].`, en: `res = []; queue = [${root.val}].` },
  }));

  while (queue.length) {
    steps.push(snapshot(root, {
      title: { vi: `Tầng ${level}: queue còn phần tử`, en: `Level ${level}: queue is not empty` },
      wordSet: new Set(visible), codeLines: [5],
      vars: [{ name: "level", value: level }, { name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: values(queue) }, { name: "nxt", value: "not initialized" }],
      note: { vi: `queue = ${values(queue)} nên tiếp tục vòng while.`, en: `queue = ${values(queue)}, so enter the while loop.` },
    }));

    const rightmost = queue[queue.length - 1];
    res.push(rightmost.val);
    visible.add(rightmost.id);
    steps.push(snapshot(root, {
      title: { vi: `Tầng ${level}: nhìn thấy ${rightmost.val}`, en: `Level ${level}: see ${rightmost.val}` },
      hlSet: new Set([rightmost.id]), wordSet: new Set(visible), codeLines: [6],
      vars: [{ name: "level", value: level }, { name: "queue[-1]", value: rightmost.val }, { name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: values(queue) }],
      note: { vi: `Node cuối queue là ${rightmost.val}; thêm nó vào res.`, en: `The last queue node is ${rightmost.val}; append it to res.` },
    }));

    const nxt = [];
    steps.push(snapshot(root, {
      title: { vi: `Tạo nxt cho tầng ${level + 1}`, en: `Create nxt for level ${level + 1}` },
      wordSet: new Set(visible), codeLines: [7],
      vars: [{ name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: values(queue) }, { name: "nxt", value: "[]" }],
      note: { vi: "nxt bắt đầu rỗng và sẽ nhận các node con.", en: "nxt starts empty and will collect child nodes." },
    }));

    for (const n of queue) {
      steps.push(snapshot(root, {
        title: { vi: `Xử lý node ${n.val}`, en: `Process node ${n.val}` },
        hlSet: new Set([n.id]), wordSet: new Set(visible), codeLines: [8],
        vars: [{ name: "n", value: n.val }, { name: "queue", value: values(queue) }, { name: "nxt", value: values(nxt) }, { name: "res", value: `[${res.join(",")}]` }],
        note: { vi: `Lấy node ${n.val} từ queue của tầng hiện tại.`, en: `Take node ${n.val} from the current level queue.` },
      }));

      if (n.left) nxt.push(n.left);
      steps.push(snapshot(root, {
        title: { vi: n.left ? `Thêm con trái ${n.left.val}` : `${n.val} không có con trái`, en: n.left ? `Append left child ${n.left.val}` : `${n.val} has no left child` },
        hlSet: new Set([n.id]), wordSet: new Set(visible), codeLines: [9],
        vars: [{ name: "n", value: n.val }, { name: "n.left", value: n.left ? n.left.val : "None" }, { name: "nxt", value: values(nxt) }, { name: "res", value: `[${res.join(",")}]` }],
        note: n.left ? { vi: `nxt = ${values(nxt)}.`, en: `nxt = ${values(nxt)}.` } : { vi: "Điều kiện False; nxt không đổi.", en: "The condition is false; nxt is unchanged." },
      }));

      if (n.right) nxt.push(n.right);
      steps.push(snapshot(root, {
        title: { vi: n.right ? `Thêm con phải ${n.right.val}` : `${n.val} không có con phải`, en: n.right ? `Append right child ${n.right.val}` : `${n.val} has no right child` },
        hlSet: new Set([n.id]), wordSet: new Set(visible), codeLines: [10],
        vars: [{ name: "n", value: n.val }, { name: "n.right", value: n.right ? n.right.val : "None" }, { name: "nxt", value: values(nxt) }, { name: "res", value: `[${res.join(",")}]` }],
        note: n.right ? { vi: `nxt = ${values(nxt)}.`, en: `nxt = ${values(nxt)}.` } : { vi: "Điều kiện False; nxt không đổi.", en: "The condition is false; nxt is unchanged." },
      }));
    }

    queue = nxt;
    level++;
    steps.push(snapshot(root, {
      title: { vi: `Chuyển sang tầng ${level}`, en: `Move to level ${level}` },
      wordSet: new Set(visible), codeLines: [11],
      vars: [{ name: "level", value: level }, { name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: values(queue) }, { name: "nxt", value: values(nxt) }],
      note: { vi: `Gán queue = nxt = ${values(queue)}.`, en: `Assign queue = nxt = ${values(queue)}.` },
    }));
  }

  steps.push(snapshot(root, {
    title: { vi: "queue rỗng → thoát while", en: "queue is empty → exit while" },
    wordSet: new Set(visible), codeLines: [5],
    vars: [{ name: "level", value: level }, { name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: "[]" }],
    note: { vi: "Điều kiện while là False; BFS hoàn tất.", en: "The while condition is false; BFS is complete." },
  }));

  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${res.join(",")}]`, en: `Result: [${res.join(",")}]` },
    wordSet: new Set(visible), codeLines: [12],
    vars: [{ name: "res", value: `[${res.join(",")}]` }, { name: "answer", value: `[${res.join(",")}]` }],
    note: { vi: `Trả về right side view = [${res.join(",")}].`, en: `Return the right side view = [${res.join(",")}].` },
  });
  fs.final = true;
  steps.push(fs);
  return { input, answer: `[${res.join(",")}]`, steps };
}

// ─── 199 Approach 2: deque + fixed level size, fully line-by-line ───
function buildSteps199v2(input) {
  const root = parseTree(input);
  const steps = [];
  const res = [];
  const visible = new Set();
  let queue = null;
  let level = 0;
  let levelSize = 0;
  let currentLevel = [];
  let processedCount = 0;
  let currentIndex = -1;
  let currentNode = null;
  const formatNodes = (nodes) => nodes === null ? "not initialized" : `[${nodes.map((node) => node.val).join(",")}]`;

  function makeQueueView(opts = {}) {
    const items = queue === null ? [] : queue.map((node) => node.val);
    return {
      title: "Queue / Deque",
      items,
      capacity: Math.max(4, items.length),
      active: Number.isInteger(opts.queueActive) ? opts.queueActive : -1,
      status: [
        { label: "operation", value: opts.queueOperation || "—" },
        { label: "popped", value: opts.popped ?? "—" },
        { label: "appended", value: opts.appended ?? "—" },
        { label: "level size", value: opts.levelSize ?? "—" },
      ],
    };
  }

  function makeRightSideBfsView(opts = {}) {
    const line = Array.isArray(opts.codeLines) ? opts.codeLines[0] : null;
    const operation = opts.queueOperation || "";
    let phase = opts.bfsPhase || "initialize";
    if (!opts.bfsPhase) {
      if (line === 7) phase = "enqueue-root";
      else if (line === 8) phase = operation === "queue empty" ? "done-levels" : "while-queue";
      else if (line === 9) phase = "lock-level";
      else if (line === 10) phase = "level-index";
      else if (line === 11) phase = "dequeue";
      else if (line === 12) phase = "check-left";
      else if (line === 13) phase = "enqueue-left";
      else if (line === 14) phase = "check-right";
      else if (line === 15) phase = "enqueue-right";
      else if (line === 16) phase = "check-rightmost";
      else if (line === 17) phase = "save-rightmost";
      else if (line === 18 || line === 5) phase = "done";
    }

    const remainingCurrent = currentLevel.slice(processedCount);
    const nextLevel = queue === null ? [] : queue.slice(remainingCurrent.length);
    const rightmostIndex = levelSize > 0 ? levelSize - 1 : -1;
    return {
      phase,
      level,
      size: levelSize,
      index: currentIndex,
      current: currentNode ? { id: currentNode.id, val: currentNode.val } : null,
      currentLevel: currentLevel.map((node) => ({ id: node.id, val: node.val })),
      processedCount,
      remainingCurrent: remainingCurrent.map((node) => ({ id: node.id, val: node.val })),
      nextLevel: nextLevel.map((node) => ({ id: node.id, val: node.val })),
      queue: queue === null ? [] : queue.map((node) => ({ id: node.id, val: node.val })),
      rightmostIndex,
      isRightmost: currentIndex >= 0 && currentIndex === rightmostIndex,
      result: [...res],
      selectedIds: [...visible],
      childSide: opts.childSide || null,
      child: opts.child || null,
      operation,
    };
  }

  function snap(opts) {
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "res")) vars.push({ name: "res", value: `[${res.join(",")}]` });
    if (!vars.some((item) => item.name === "queue")) vars.push({ name: "queue", value: formatNodes(queue) });
    steps.push(snapshot(root, Object.assign({}, opts, {
      vars,
      codeBlock: 2,
      wordSet: opts.wordSet || new Set(visible),
      queueView: makeQueueView(opts),
      rightSideBfsView: makeRightSideBfsView(opts),
    })));
  }

  snap({
    title: { vi: "Bắt đầu rightSideView", en: "Enter rightSideView" },
    codeLines: [2],
    queueOperation: "enter function",
    vars: [{ name: "root", value: root ? root.val : "None" }],
    note: { vi: "Bắt đầu cách 2: deque và số node cố định của từng tầng.", en: "Start approach 2: deque with a fixed node count for each level." },
  });

  snap({
    title: { vi: "res = []", en: "res = []" },
    codeLines: [3],
    queueOperation: "initialize res",
    note: { vi: "res sẽ lưu node ngoài cùng bên phải của mỗi tầng.", en: "res will store the rightmost node from each level." },
  });

  snap({
    title: { vi: root ? "root is None → False" : "root is None → True", en: root ? "root is None → False" : "root is None → True" },
    codeLines: [4],
    queueOperation: root ? "check root" : "empty tree",
    vars: [{ name: "root", value: root ? root.val : "None" }],
    note: root
      ? { vi: "Cây không rỗng nên tiếp tục tạo queue.", en: "The tree is not empty, so continue to create the queue." }
      : { vi: "Cây rỗng nên thực hiện return sớm.", en: "The tree is empty, so take the early return." },
  });

  if (!root) {
    const emptyStep = snapshot(root, {
      title: { vi: "return res → []", en: "return res → []" },
      codeLines: [5], codeBlock: 2,
      queueView: makeQueueView({ queueOperation: "early return" }),
      rightSideBfsView: makeRightSideBfsView({ codeLines: [5], queueOperation: "early return" }),
      vars: [{ name: "res", value: "[]" }, { name: "queue", value: "not initialized" }, { name: "answer", value: "[]" }],
      note: { vi: "Trả về [] ngay vì root là None.", en: "Return [] immediately because root is None." },
    });
    emptyStep.final = true;
    steps.push(emptyStep);
    return { input, answer: "[]", steps };
  }

  queue = [];
  snap({
    title: { vi: "Tạo collections.deque()", en: "Create collections.deque()" },
    codeLines: [6],
    queueOperation: "create deque",
    vars: [{ name: "queue", value: "[]" }],
    note: { vi: "Tạo deque rỗng để BFS.", en: "Create an empty deque for BFS." },
  });

  queue.push(root);
  snap({
    title: { vi: `queue.append(root) → [${root.val}]`, en: `queue.append(root) → [${root.val}]` },
    hlSet: new Set([root.id]), codeLines: [7],
    queueOperation: `append ${root.val}`, queueActive: 0, appended: root.val,
    note: { vi: `Đưa root ${root.val} vào queue.`, en: `Append root ${root.val} to the queue.` },
  });

  while (queue.length) {
    currentLevel = [...queue];
    levelSize = queue.length;
    processedCount = 0;
    currentIndex = -1;
    currentNode = null;
    snap({
      title: { vi: `Tầng ${level}: queue không rỗng`, en: `Level ${level}: queue is not empty` },
      hlSet: new Set(queue.map((node) => node.id)), codeLines: [8],
      queueOperation: "while queue", queueActive: 0,
      vars: [{ name: "level", value: level }],
      note: { vi: `Bắt đầu xử lý tầng ${level}.`, en: `Begin processing level ${level}.` },
    });

    const size = queue.length;
    levelSize = size;
    snap({
      title: { vi: `size = len(queue) = ${size}`, en: `size = len(queue) = ${size}` },
      hlSet: new Set(queue.slice(0, size).map((node) => node.id)), codeLines: [9],
      queueOperation: "read level size", levelSize: size,
      vars: [{ name: "level", value: level }, { name: "size", value: size }],
      note: { vi: `Chốt ${size} node thuộc tầng hiện tại trước khi thêm node con.`, en: `Lock in the ${size} nodes belonging to this level before appending children.` },
    });

    for (let i = 0; i < size; i++) {
      currentIndex = i;
      currentNode = null;
      processedCount = i;
      snap({
        title: { vi: `for i=${i} trong range(${size})`, en: `for i=${i} in range(${size})` },
        codeLines: [10],
        queueOperation: "next popleft", queueActive: 0, levelSize: size,
        vars: [{ name: "level", value: level }, { name: "i", value: i }, { name: "size", value: size }],
        note: { vi: `Xử lý node thứ ${i + 1}/${size} của tầng ${level}.`, en: `Process node ${i + 1}/${size} from level ${level}.` },
      });

      const curr = queue.shift();
      currentNode = curr;
      processedCount = i + 1;
      snap({
        title: { vi: `curr = queue.popleft() → ${curr.val}`, en: `curr = queue.popleft() → ${curr.val}` },
        hlSet: new Set([curr.id]), codeLines: [11],
        queueOperation: `popleft ${curr.val}`, popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "queue", value: formatNodes(queue) }],
        note: { vi: `Lấy ${curr.val} ở đầu deque; queue còn ${formatNodes(queue)}.`, en: `Pop ${curr.val} from the deque front; remaining queue is ${formatNodes(queue)}.` },
      });

      snap({
        title: { vi: curr.left ? `curr.left = ${curr.left.val}` : "curr.left = None", en: curr.left ? `curr.left = ${curr.left.val}` : "curr.left = None" },
        hlSet: new Set([curr.id]), codeLines: [12],
        queueOperation: "check left child", popped: curr.val, levelSize: size,
        childSide: "left", child: curr.left ? curr.left.val : null,
        vars: [{ name: "curr", value: curr.val }, { name: "curr.left", value: curr.left ? curr.left.val : "None" }, { name: "i", value: i }, { name: "size", value: size }],
        note: curr.left
          ? { vi: "Điều kiện True nên sẽ append con trái.", en: "The condition is true, so append the left child." }
          : { vi: "Điều kiện False; queue không đổi.", en: "The condition is false; queue is unchanged." },
      });
      if (curr.left) {
        queue.push(curr.left);
        snap({
          title: { vi: `queue.append(${curr.left.val})`, en: `queue.append(${curr.left.val})` },
          hlSet: new Set([curr.left.id]), codeLines: [13],
          queueOperation: `append ${curr.left.val}`, queueActive: queue.length - 1, popped: curr.val, appended: curr.left.val, levelSize: size,
          childSide: "left", child: curr.left.val,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }],
          note: { vi: `Thêm con trái; queue = ${formatNodes(queue)}.`, en: `Append the left child; queue = ${formatNodes(queue)}.` },
        });
      }

      snap({
        title: { vi: curr.right ? `curr.right = ${curr.right.val}` : "curr.right = None", en: curr.right ? `curr.right = ${curr.right.val}` : "curr.right = None" },
        hlSet: new Set([curr.id]), codeLines: [14],
        queueOperation: "check right child", popped: curr.val, levelSize: size,
        childSide: "right", child: curr.right ? curr.right.val : null,
        vars: [{ name: "curr", value: curr.val }, { name: "curr.right", value: curr.right ? curr.right.val : "None" }, { name: "i", value: i }, { name: "size", value: size }],
        note: curr.right
          ? { vi: "Điều kiện True nên sẽ append con phải.", en: "The condition is true, so append the right child." }
          : { vi: "Điều kiện False; queue không đổi.", en: "The condition is false; queue is unchanged." },
      });
      if (curr.right) {
        queue.push(curr.right);
        snap({
          title: { vi: `queue.append(${curr.right.val})`, en: `queue.append(${curr.right.val})` },
          hlSet: new Set([curr.right.id]), codeLines: [15],
          queueOperation: `append ${curr.right.val}`, queueActive: queue.length - 1, popped: curr.val, appended: curr.right.val, levelSize: size,
          childSide: "right", child: curr.right.val,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }],
          note: { vi: `Thêm con phải; queue = ${formatNodes(queue)}.`, en: `Append the right child; queue = ${formatNodes(queue)}.` },
        });
      }

      const isRightmost = i === size - 1;
      snap({
        title: { vi: `i == size - 1 → ${isRightmost}`, en: `i == size - 1 → ${isRightmost}` },
        hlSet: new Set([curr.id]), codeLines: [16],
        queueOperation: "check rightmost", popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "is rightmost", value: isRightmost }],
        note: isRightmost
          ? { vi: `${curr.val} là node cuối của tầng nên nhìn thấy từ bên phải.`, en: `${curr.val} is the level's last node, so it is visible from the right.` }
          : { vi: `${curr.val} chưa phải node cuối của tầng.`, en: `${curr.val} is not the level's last node.` },
      });
      if (isRightmost) {
        res.push(curr.val);
        visible.add(curr.id);
        snap({
          title: { vi: `res.append(${curr.val})`, en: `res.append(${curr.val})` },
          hlSet: new Set([curr.id]), codeLines: [17],
          queueOperation: `save rightmost ${curr.val}`, popped: curr.val, levelSize: size,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }],
          note: { vi: `res = [${res.join(",")}].`, en: `res = [${res.join(",")}].` },
        });
      }
    }
    level++;
  }

  currentLevel = [];
  levelSize = 0;
  processedCount = 0;
  currentIndex = -1;
  currentNode = null;
  snap({
    title: { vi: "queue rỗng → thoát while", en: "queue is empty → exit while" },
    codeLines: [8],
    queueOperation: "queue empty",
    vars: [{ name: "level", value: level }, { name: "queue", value: "[]" }],
    note: { vi: "Đã xử lý hết các tầng.", en: "All levels have been processed." },
  });

  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: [${res.join(",")}]`, en: `Result: [${res.join(",")}]` },
    wordSet: new Set(visible), codeLines: [18], codeBlock: 2,
    queueView: makeQueueView({ queueOperation: "done" }),
    rightSideBfsView: makeRightSideBfsView({ codeLines: [18], queueOperation: "done" }),
    vars: [{ name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: "[]" }, { name: "answer", value: `[${res.join(",")}]` }],
    note: { vi: `Trả về right side view = [${res.join(",")}].`, en: `Return the right side view = [${res.join(",")}].` },
  });
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer: `[${res.join(",")}]`, steps };
}

// ─── 199 Approach 3: right-first DFS, fully line-by-line ───
function buildSteps199v3(input) {
  const root = parseTree(input);
  const steps = [];
  const res = [];
  const visible = new Set();
  const selectedDepth = new Map();
  const callStack = [];
  const visitOrder = [];

  function treeDepth(node, depth = 0) {
    if (!node) return depth - 1;
    return Math.max(treeDepth(node.left, depth + 1), treeDepth(node.right, depth + 1));
  }
  const maxDepth = Math.max(0, treeDepth(root));

  function annotationsFor(current, nextCall) {
    const annotations = {};
    visible.forEach((id) => {
      annotations[id] = {
        labels: [{ label: `VIEW d=${selectedDepth.get(id)}`, kind: "rsv-dfs-answer" }],
      };
    });
    if (current) {
      const frame = callStack[callStack.length - 1];
      const via = frame && frame.via !== "root" ? ` · ${frame.via.toUpperCase()}` : "";
      const labels = annotations[current.id] && annotations[current.id].labels
        ? [...annotations[current.id].labels]
        : [];
      labels.push({ label: `CURRENT${via}`, kind: "rsv-dfs-current" });
      annotations[current.id] = { labels };
    }
    if (nextCall && nextCall.node) {
      const labels = annotations[nextCall.node.id] && annotations[nextCall.node.id].labels
        ? [...annotations[nextCall.node.id].labels]
        : [];
      labels.push({ label: `NEXT ${nextCall.side.toUpperCase()}`, kind: "rsv-dfs-next" });
      annotations[nextCall.node.id] = { labels };
    }
    return annotations;
  }

  function makeDfsView(opts = {}) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current")
      ? opts.current
      : frame && frame.node;
    return {
      phase: opts.phase || "initialize",
      current: current ? { id: current.id, val: current.val } : null,
      isNullCall: Boolean(frame && frame.node === null),
      depth: frame ? frame.depth : null,
      via: frame ? frame.via : null,
      stack: callStack.map((item) => ({
        node: item.node ? item.node.val : null,
        depth: item.depth,
        via: item.via,
      })),
      result: [...res],
      maxDepth,
      decision: Object.prototype.hasOwnProperty.call(opts, "decision") ? opts.decision : null,
      nextCall: opts.nextCall
        ? {
          node: opts.nextCall.node ? opts.nextCall.node.val : null,
          depth: opts.nextCall.depth,
          side: opts.nextCall.side,
        }
        : null,
      visitOrder: visitOrder.map((item) => ({ ...item })),
      selectedIds: [...visible],
      action: opts.action,
    };
  }

  function snap(opts) {
    const frame = callStack[callStack.length - 1] || null;
    const current = Object.prototype.hasOwnProperty.call(opts, "current")
      ? opts.current
      : frame && frame.node;
    const nextNode = opts.nextCall && opts.nextCall.node;
    const highlighted = new Set();
    if (current) highlighted.add(current.id);
    if (nextNode) highlighted.add(nextNode.id);
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "node")) vars.push({ name: "node", value: current ? current.val : frame ? "None" : "not called" });
    if (!vars.some((item) => item.name === "depth")) vars.push({ name: "depth", value: frame ? frame.depth : "not initialized" });
    if (!vars.some((item) => item.name === "res")) vars.push({ name: "res", value: `[${res.join(",")}]` });
    steps.push(snapshot(root, {
      title: opts.title,
      hlSet: opts.hlSet || highlighted,
      wordSet: new Set(visible),
      annotations: annotationsFor(current, opts.nextCall),
      codeLines: opts.codeLines || [],
      codeBlock: 3,
      rightSideDfsView: makeDfsView({ ...opts, current }),
      vars,
      note: opts.note,
    }));
  }

  snap({
    title: { vi: "Bắt đầu rightSideView", en: "Enter rightSideView" },
    codeLines: [2], phase: "initialize", current: null,
    vars: [{ name: "root", value: root ? root.val : "None" }],
    action: { vi: "Vào hàm; DFS chưa được gọi và call stack còn rỗng.", en: "Enter the function; DFS has not been called and the call stack is empty." },
    note: { vi: "Cách 3 dùng DFS, luôn đi sang phải trước sang trái.", en: "Approach 3 uses DFS and always explores right before left." },
  });

  snap({
    title: { vi: "res = []", en: "res = []" },
    codeLines: [3], phase: "initialize", current: null,
    action: { vi: "Khởi tạo res rỗng; res[depth] sẽ là node đầu tiên DFS gặp ở depth đó.", en: "Initialize an empty res; res[depth] will be the first node DFS reaches at that depth." },
    note: { vi: "Mỗi depth chỉ được thêm đúng một lần.", en: "Each depth is appended exactly once." },
  });

  snap({
    title: { vi: "Định nghĩa hàm dfs(node, depth)", en: "Define dfs(node, depth)" },
    codeLines: [4], phase: "initialize", current: null,
    action: { vi: "Tạo hàm đệ quy nhận node hiện tại và depth của node.", en: "Define the recursive helper with the current node and its depth." },
    note: { vi: "Thân hàm chỉ chạy khi dfs được gọi.", en: "The helper body runs only when dfs is called." },
  });

  const rootCall = { node: root, depth: 0, side: "root" };
  snap({
    title: { vi: `Gọi dfs(${root ? root.val : "None"}, 0)`, en: `Call dfs(${root ? root.val : "None"}, 0)` },
    codeLines: [11], phase: "call-root", current: null, nextCall: rootCall,
    vars: [{ name: "root", value: root ? root.val : "None" }],
    action: { vi: "Bắt đầu từ root ở depth 0.", en: "Start from root at depth 0." },
    note: { vi: "Bước kế tiếp sẽ tạo frame đầu tiên trên call stack.", en: "The next step creates the first call-stack frame." },
  });

  function dfs(node, depth, via) {
    callStack.push({ node, depth, via });
    if (node) visitOrder.push({ id: node.id, val: node.val, depth, selected: false });

    snap({
      title: { vi: `Vào dfs(${node ? node.val : "None"}, ${depth})`, en: `Enter dfs(${node ? node.val : "None"}, ${depth})` },
      codeLines: [4], phase: "enter",
      action: node
        ? { vi: `Push frame node=${node.val}, depth=${depth} lên call stack.`, en: `Push node=${node.val}, depth=${depth} onto the call stack.` }
        : { vi: `Push frame node=None, depth=${depth} để xử lý base case.`, en: `Push node=None, depth=${depth} to handle the base case.` },
      note: { vi: "Frame ở cuối stack là lời gọi đang chạy.", en: "The last stack frame is the active call." },
    });

    const isNull = node === null;
    snap({
      title: { vi: `if not node → ${isNull}`, en: `if not node → ${isNull}` },
      codeLines: [5], phase: "check-null",
      vars: [{ name: "not node", value: isNull }],
      action: isNull
        ? { vi: "node là None nên điều kiện True; đi vào return.", en: "node is None, so the condition is true; proceed to return." }
        : { vi: `node=${node.val} tồn tại nên điều kiện False; tiếp tục kiểm tra depth.`, en: `node=${node.val} exists, so the condition is false; continue to the depth check.` },
      note: isNull
        ? { vi: "Đây là điểm dừng của một nhánh cây.", en: "This is the stopping point for a tree branch." }
        : { vi: "Không chạy dòng return của base case.", en: "Skip the base-case return line." },
    });

    if (isNull) {
      snap({
        title: { vi: "return khỏi dfs(None)", en: "Return from dfs(None)" },
        codeLines: [6], phase: "return-null",
        action: { vi: "Pop frame None và quay lại lời gọi cha; res không đổi.", en: "Pop the None frame and return to the caller; res is unchanged." },
        note: { vi: "Không có node nào được thêm vào kết quả.", en: "No node is added to the result." },
      });
      callStack.pop();
      return;
    }

    const isFirstAtDepth = depth === res.length;
    snap({
      title: { vi: `depth == len(res) → ${isFirstAtDepth}`, en: `depth == len(res) → ${isFirstAtDepth}` },
      codeLines: [7], phase: "check-depth", decision: isFirstAtDepth,
      vars: [{ name: "depth", value: depth }, { name: "len(res)", value: res.length }],
      action: isFirstAtDepth
        ? { vi: `depth=${depth} chưa có đại diện; ${node.val} là node đầu tiên gặp ở depth này.`, en: `Depth ${depth} has no representative; ${node.val} is the first node reached at this depth.` }
        : { vi: `depth=${depth} đã có res[${depth}]=${res[depth]}; không thêm ${node.val}.`, en: `Depth ${depth} already has res[${depth}]=${res[depth]}; do not add ${node.val}.` },
      note: isFirstAtDepth
        ? { vi: "Vì DFS đi phải trước, node đầu tiên của depth là node nhìn thấy từ bên phải.", en: "Because DFS goes right first, the first node at a depth is visible from the right." }
        : { vi: "Node ngoài cùng bên phải của depth này đã được lưu trước đó.", en: "The rightmost node at this depth was already stored." },
    });

    if (isFirstAtDepth) {
      res.push(node.val);
      visible.add(node.id);
      selectedDepth.set(node.id, depth);
      visitOrder[visitOrder.length - 1].selected = true;
      snap({
        title: { vi: `res.append(${node.val})`, en: `res.append(${node.val})` },
        codeLines: [8], phase: "save", decision: true,
        action: { vi: `Lưu ${node.val} cho depth ${depth}; res=[${res.join(",")}].`, en: `Save ${node.val} for depth ${depth}; res=[${res.join(",")}].` },
        note: { vi: `${node.val} được đánh dấu là node nhìn thấy bên phải.`, en: `${node.val} is marked as visible from the right.` },
      });
    }

    const rightCall = { node: node.right, depth: depth + 1, side: "right" };
    snap({
      title: { vi: `Gọi dfs(${node.right ? node.right.val : "None"}, ${depth + 1}) bên PHẢI`, en: `Call dfs(${node.right ? node.right.val : "None"}, ${depth + 1}) on the RIGHT` },
      codeLines: [9], phase: "call-right", nextCall: rightCall,
      action: node.right
        ? { vi: `Ưu tiên nhánh phải: từ ${node.val} đi tới ${node.right.val}.`, en: `Prioritize the right branch: move from ${node.val} to ${node.right.val}.` }
        : { vi: `${node.val} không có con phải; vẫn gọi dfs(None) để chạy base case.`, en: `${node.val} has no right child; still call dfs(None) to execute the base case.` },
      note: { vi: "Dòng gọi nhánh trái chỉ chạy sau khi toàn bộ nhánh phải return.", en: "The left-call line runs only after the entire right branch returns." },
    });
    dfs(node.right, depth + 1, "right");

    const leftCall = { node: node.left, depth: depth + 1, side: "left" };
    snap({
      title: { vi: `Nhánh phải đã xong; gọi dfs(${node.left ? node.left.val : "None"}, ${depth + 1}) bên TRÁI`, en: `Right branch complete; call dfs(${node.left ? node.left.val : "None"}, ${depth + 1}) on the LEFT` },
      codeLines: [10], phase: "call-left", nextCall: leftCall,
      action: node.left
        ? { vi: `Backtrack về ${node.val}, rồi mới đi sang con trái ${node.left.val}.`, en: `Backtrack to ${node.val}, then move to left child ${node.left.val}.` }
        : { vi: `Backtrack về ${node.val}; không có con trái nên gọi dfs(None).`, en: `Backtrack to ${node.val}; it has no left child, so call dfs(None).` },
      note: { vi: "Các depth đã có kết quả sẽ không bị ghi đè khi đi nhánh trái.", en: "Depths that already have a result are not overwritten while exploring left." },
    });
    dfs(node.left, depth + 1, "left");

    snap({
      title: { vi: `Hoàn tất dfs(${node.val}, ${depth})`, en: `Complete dfs(${node.val}, ${depth})` },
      codeLines: [10], phase: "return-node",
      action: { vi: `Cả nhánh phải và trái của ${node.val} đã xong; pop frame này để quay về caller.`, en: `Both branches of ${node.val} are complete; pop this frame and return to the caller.` },
      note: { vi: "Đây là bước quay lui của DFS.", en: "This is the DFS backtracking step." },
    });
    callStack.pop();
  }

  dfs(root, 0, "root");

  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: [${res.join(",")}]`, en: `Result: [${res.join(",")}]` },
    wordSet: new Set(visible),
    annotations: annotationsFor(null, null),
    codeLines: [12], codeBlock: 3,
    rightSideDfsView: makeDfsView({
      phase: "done", current: null,
      action: { vi: `DFS hoàn tất; trả về [${res.join(",")}].`, en: `DFS is complete; return [${res.join(",")}].` },
    }),
    vars: [{ name: "res", value: `[${res.join(",")}]` }, { name: "answer", value: `[${res.join(",")}]` }],
    note: { vi: `Right side view từ trên xuống là [${res.join(",")}].`, en: `The top-to-bottom right side view is [${res.join(",")}].` },
  });
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer: `[${res.join(",")}]`, steps };
}

// ─── 236: Lowest Common Ancestor of a Binary Tree ───
function buildSteps236(input, params) {
  const root = parseTree(input); const pv = Number(params.p); const qv = Number(params.q); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: `LCA của ${pv} và ${qv}`, en: `LCA of ${pv} and ${qv}` },
    codeLines: [2, 3], vars: [{ name: "p", value: pv }, { name: "q", value: qv }],
    note: { vi: `Đệ quy: nếu nút == p hoặc q → trả nút đó. Nếu CẢ 2 nhánh con đều trả về khác null → nút hiện tại là LCA.`, en: `Recursion: if node == p or q → return it. If BOTH child branches return non-null → current node is the LCA.` },
  }));
  let answer = null;
  function lca(node) {
    if (!node) return null;
    if (node.val === pv || node.val === qv) {
      steps.push(snapshot(root, { title: { vi: `Tìm thấy ${node.val}`, en: `Found ${node.val}` }, hlSet: new Set([node.id]), codeLines: [4, 5], vars: [{ name: "node", value: node.val }], note: { vi: `${node.val} là p hoặc q → trả về nút này.`, en: `${node.val} is p or q → return this node.` } }));
      return node;
    }
    const L = lca(node.left), R = lca(node.right);
    if (L && R) {
      if (!answer) answer = node;
      steps.push(snapshot(root, { title: { vi: `${node.val} là LCA (split)`, en: `${node.val} is LCA (split)` }, hlSet: new Set([node.id]), wordSet: new Set([L.id, R.id]), codeLines: [7, 8], vars: [{ name: "left", value: L.val }, { name: "right", value: R.val }, { name: "LCA", value: node.val }], note: { vi: `p và q nằm ở 2 nhánh khác nhau của ${node.val} → ${node.val} là LCA.`, en: `p and q lie in different branches of ${node.val} → ${node.val} is the LCA.` } }));
      return node;
    }
    return L || R;
  }
  lca(root);
  const fs = snapshot(root, { title: { vi: `LCA = ${answer ? answer.val : "null"}`, en: `LCA = ${answer ? answer.val : "null"}` }, wordSet: answer ? new Set([answer.id]) : undefined, vars: [{ name: "answer", value: answer ? answer.val : "null" }], note: { vi: `Tổ tiên chung thấp nhất = ${answer ? answer.val : "null"}.`, en: `Lowest common ancestor = ${answer ? answer.val : "null"}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: answer ? answer.val : "null", steps };
}

// ─── 1644: LCA of a Binary Tree II (p or q may be absent), fully line-by-line ───
function buildSteps1644(input, params) {
  const root = parseTree(input);
  const pv = Number(params.p);
  const qv = Number(params.q);
  const steps = [];

  let ans = null;
  let count = 0;

  function snap(opts) {
    const vars = [...(opts.vars || [])];
    vars.push({ name: "self.ans", value: ans === null ? "None" : ans.val });
    vars.push({ name: "self.count", value: count });
    steps.push(snapshot(root, Object.assign({}, opts, { vars })));
  }

  // Lines 3-4: self.ans = None; self.count = 0
  snap({
    title: { vi: "self.ans = None, self.count = 0", en: "self.ans = None, self.count = 0" },
    codeLines: [3, 4],
    vars: [{ name: "p", value: pv }, { name: "q", value: qv }],
    note: {
      vi: `Tìm LCA của p=${pv} và q=${qv}, nhưng KHÔNG chắc cả hai có tồn tại trong cây. self.count sẽ đếm số lần gặp p hoặc q trong lúc duyệt toàn bộ cây.`,
      en: `Find the LCA of p=${pv} and q=${qv}, but they might NOT both exist in the tree. self.count will tally how many times p or q is seen during a full traversal.`,
    },
  });

  function dfs(node, depth) {
    // Line 6: if not node: return False
    const isNull = !node;
    snap({
      title: { vi: `dfs(${isNull ? "None" : node.val}): if not node → ${isNull}`, en: `dfs(${isNull ? "None" : node.val}): if not node → ${isNull}` },
      hlSet: isNull ? undefined : new Set([node.id]),
      codeLines: [6],
      vars: [{ name: "node", value: isNull ? "None" : node.val }, { name: "depth", value: depth }],
      note: isNull
        ? { vi: "Đây là con của 1 lá (None) → return False ngay, không đi sâu hơn.", en: "This is a leaf's child (None) → return False immediately, no deeper recursion." }
        : { vi: `node = ${node.val} → tiếp tục đệ quy con trái rồi con phải.`, en: `node = ${node.val} → proceed to recurse left then right.` },
    });
    if (isNull) return false;

    // Line 7: l = dfs(node.left)
    snap({
      title: { vi: `dfs(${node.val}): l = dfs(node.left)`, en: `dfs(${node.val}): l = dfs(node.left)` },
      hlSet: new Set([node.id]),
      codeLines: [7],
      vars: [{ name: "node", value: node.val }, { name: "node.left", value: node.left ? node.left.val : "None" }],
      note: {
        vi: `Gọi đệ quy vào con trái của ${node.val} (${node.left ? node.left.val : "None"}) trước.`,
        en: `Recurse into ${node.val}'s left child (${node.left ? node.left.val : "None"}) first.`,
      },
    });
    const l = dfs(node.left, depth + 1);
    snap({
      title: { vi: `dfs(${node.val}): l = ${l}`, en: `dfs(${node.val}): l = ${l}` },
      hlSet: new Set([node.id]),
      codeLines: [7],
      vars: [{ name: "node", value: node.val }, { name: "l (result)", value: l }],
      note: {
        vi: `Đệ quy con trái của ${node.val} trả về l = ${l}.`,
        en: `The left recursion for ${node.val} returned l = ${l}.`,
      },
    });

    // Line 8: r = dfs(node.right)
    snap({
      title: { vi: `dfs(${node.val}): r = dfs(node.right)`, en: `dfs(${node.val}): r = dfs(node.right)` },
      hlSet: new Set([node.id]),
      codeLines: [8],
      vars: [{ name: "node", value: node.val }, { name: "node.right", value: node.right ? node.right.val : "None" }],
      note: {
        vi: `Gọi đệ quy vào con phải của ${node.val} (${node.right ? node.right.val : "None"}).`,
        en: `Recurse into ${node.val}'s right child (${node.right ? node.right.val : "None"}).`,
      },
    });
    const r = dfs(node.right, depth + 1);
    snap({
      title: { vi: `dfs(${node.val}): r = ${r}`, en: `dfs(${node.val}): r = ${r}` },
      hlSet: new Set([node.id]),
      codeLines: [8],
      vars: [{ name: "node", value: node.val }, { name: "r (result)", value: r }],
      note: {
        vi: `Đệ quy con phải của ${node.val} trả về r = ${r}.`,
        en: `The right recursion for ${node.val} returned r = ${r}.`,
      },
    });

    // Line 9: mid = node == p or node == q
    const mid = node.val === pv || node.val === qv;
    snap({
      title: { vi: `dfs(${node.val}): mid = (node==p or node==q) → ${mid}`, en: `dfs(${node.val}): mid = (node==p or node==q) → ${mid}` },
      hlSet: new Set([node.id]),
      codeLines: [9],
      vars: [{ name: "node.val", value: node.val }, { name: "mid", value: mid }],
      note: mid
        ? { vi: `node.val=${node.val} khớp với p hoặc q → mid=True.`, en: `node.val=${node.val} matches p or q → mid=True.` }
        : { vi: `node.val=${node.val} không khớp p hay q → mid=False.`, en: `node.val=${node.val} matches neither p nor q → mid=False.` },
    });

    // Line 10: if mid + l + r >= 2 and not self.ans
    const cnt = Number(mid) + Number(l) + Number(r);
    const willSetAns = cnt >= 2 && ans === null;
    snap({
      title: { vi: `dfs(${node.val}): mid+l+r=${cnt} >= 2 and not self.ans → ${willSetAns}`, en: `dfs(${node.val}): mid+l+r=${cnt} >= 2 and not self.ans → ${willSetAns}` },
      hlSet: new Set([node.id]),
      codeLines: [10],
      vars: [{ name: "mid+l+r", value: `${Number(mid)}+${Number(l)}+${Number(r)} = ${cnt}` }],
      note: willSetAns
        ? { vi: `${cnt} ≥ 2 và self.ans chưa gán → node ${node.val} là ứng viên LCA.`, en: `${cnt} ≥ 2 and self.ans is not set yet → node ${node.val} becomes the LCA candidate.` }
        : { vi: `Điều kiện không đủ (cnt=${cnt}, self.ans=${ans === null ? "None" : ans.val}) → không cập nhật self.ans.`, en: `Condition not met (cnt=${cnt}, self.ans=${ans === null ? "None" : ans.val}) → self.ans unchanged.` },
    });

    if (willSetAns) {
      // Line 11: self.ans = node
      ans = node;
      snap({
        title: { vi: `dfs(${node.val}): self.ans = ${node.val}`, en: `dfs(${node.val}): self.ans = ${node.val}` },
        hlSet: new Set([node.id]),
        codeLines: [11],
        vars: [{ name: "node", value: node.val }],
        note: {
          vi: `Gán self.ans = ${node.val}. Đây là ứng viên LCA — vẫn cần duyệt hết cây để xác nhận p và q đều tồn tại.`,
          en: `Set self.ans = ${node.val}. This is the LCA candidate — still need to finish the traversal to confirm both p and q exist.`,
        },
      });
    }

    // Line 12: if mid: self.count += 1
    snap({
      title: { vi: `dfs(${node.val}): if mid → ${mid}`, en: `dfs(${node.val}): if mid → ${mid}` },
      hlSet: new Set([node.id]),
      codeLines: [12],
      vars: [{ name: "mid", value: mid }],
      note: mid
        ? { vi: `mid=True → sẽ tăng self.count.`, en: `mid=True → self.count will increase.` }
        : { vi: `mid=False → không tăng self.count.`, en: `mid=False → self.count stays the same.` },
    });
    if (mid) {
      count++;
      snap({
        title: { vi: `dfs(${node.val}): self.count += 1 → ${count}`, en: `dfs(${node.val}): self.count += 1 → ${count}` },
        hlSet: new Set([node.id]),
        codeLines: [12],
        vars: [{ name: "self.count", value: count }],
        note: {
          vi: `self.count = ${count} (đã gặp ${count}/2 trong p, q).`,
          en: `self.count = ${count} (found ${count}/2 of p, q so far).`,
        },
      });
    }

    // Line 13: return l or r or mid
    const ret = l || r || mid;
    snap({
      title: { vi: `dfs(${node.val}): return l or r or mid → ${ret}`, en: `dfs(${node.val}): return l or r or mid → ${ret}` },
      hlSet: new Set([node.id]),
      codeLines: [13],
      vars: [{ name: "l", value: l }, { name: "r", value: r }, { name: "mid", value: mid }, { name: "return", value: ret }],
      note: {
        vi: `Trả về ${ret} lên lời gọi cha — báo rằng nhánh dưới ${node.val} có chứa p hoặc q.`,
        en: `Return ${ret} to the caller — reporting whether the subtree under ${node.val} contains p or q.`,
      },
    });
    return ret;
  }

  // Line 14: dfs(root)
  snap({
    title: { vi: "dfs(root)", en: "dfs(root)" },
    hlSet: root ? new Set([root.id]) : undefined,
    codeLines: [14],
    vars: [{ name: "root", value: root ? root.val : "None" }],
    note: {
      vi: "Bắt đầu đệ quy từ root.",
      en: "Start the recursion from root.",
    },
  });
  dfs(root, 0);

  // Line 15: return self.ans if self.count == 2 else None
  const valid = count === 2 && ans !== null;
  const fs = snapshot(root, {
    title: {
      vi: `return self.ans if self.count==2 else None → ${valid ? `LCA=${ans.val}` : "None"}`,
      en: `return self.ans if self.count==2 else None → ${valid ? `LCA=${ans.val}` : "None"}`,
    },
    wordSet: valid ? new Set([ans.id]) : undefined,
    codeLines: [15],
    vars: [
      { name: "self.count", value: count },
      { name: "self.ans", value: ans === null ? "None" : ans.val },
      { name: "answer", value: valid ? ans.val : "None" },
    ],
    note: valid
      ? { vi: `self.count == 2 → cả p và q đều tồn tại → trả về self.ans = ${ans.val}.`, en: `self.count == 2 → both p and q exist → return self.ans = ${ans.val}.` }
      : { vi: `self.count = ${count} ≠ 2 → thiếu p hoặc q trong cây → trả về None.`, en: `self.count = ${count} ≠ 2 → p or q is missing from the tree → return None.` },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer: valid ? ans.val : "null", steps };
}

// ─── 1644 Approach 2: post-order traversal with self.findP / self.findQ flags, fully line-by-line ───
function buildSteps1644v2(input, params) {
  const root = parseTree(input);
  const pv = Number(params.p);
  const qv = Number(params.q);
  const steps = [];

  let findP = false;
  let findQ = false;

  function nv(node) { return node ? node.val : "None"; }

  const pNode = findNode(root, pv);
  const qNode = findNode(root, qv);

  // Always label the p/q nodes on the tree so the viewer can see WHERE they
  // are without reading the note text; the label turns green (✓) once that
  // node's self.findP / self.findQ flag has actually been set to True.
  function baseAnnotations() {
    const ann = {};
    if (pNode) ann[pNode.id] = findP ? "p ✓" : "p";
    if (qNode) ann[qNode.id] = findQ ? "q ✓" : "q";
    return ann;
  }

  function snap(opts) {
    const vars = [...(opts.vars || [])];
    vars.push({ name: "self.findP", value: findP });
    vars.push({ name: "self.findQ", value: findQ });
    const annotations = Object.assign({}, baseAnnotations(), opts.annotations || {});
    // Give confirmed p/q nodes a green ring (isWord) in addition to the "p ✓"/"q ✓"
    // text annotation, so it's visually obvious the moment each one is found.
    const confirmedWordSet = new Set(opts.wordSet || []);
    if (findP && pNode) confirmedWordSet.add(pNode.id);
    if (findQ && qNode) confirmedWordSet.add(qNode.id);
    steps.push(snapshot(root, Object.assign({}, opts, { vars, codeBlock: 2, annotations, wordSet: confirmedWordSet })));
  }

  // Lines 3-4: self.findP = False; self.findQ = False
  snap({
    title: { vi: "self.findP = False, self.findQ = False", en: "self.findP = False, self.findQ = False" },
    codeLines: [3, 4],
    vars: [{ name: "p", value: pv }, { name: "q", value: qv }],
    note: {
      vi: `Tìm LCA của p=${pv} và q=${qv} bằng duyệt post-order. self.findP/self.findQ sẽ đánh dấu khi thực sự gặp p, q trong cây.`,
      en: `Find the LCA of p=${pv} and q=${qv} via a post-order traversal. self.findP/self.findQ will flag when p, q are actually seen in the tree.`,
    },
  });

  function postOrder(node, depth) {
    // Line 6: if not node:
    const isNull = !node;
    snap({
      title: { vi: `post_order(${isNull ? "None" : node.val}): if not node → ${isNull}`, en: `post_order(${isNull ? "None" : node.val}): if not node → ${isNull}` },
      hlSet: isNull ? undefined : new Set([node.id]),
      codeLines: [6],
      vars: [{ name: "node", value: isNull ? "None" : node.val }, { name: "depth", value: depth }],
      note: isNull
        ? { vi: "Đây là con của 1 lá (None) → sẽ return None ngay.", en: "This is a leaf's child (None) → will return None immediately." }
        : { vi: `node = ${node.val} → tiếp tục đệ quy con trái rồi con phải.`, en: `node = ${node.val} → proceed to recurse left then right.` },
    });

    if (isNull) {
      // Line 7: return node   (node is None here)
      snap({
        title: { vi: "return node → None", en: "return node → None" },
        codeLines: [7],
        note: {
          vi: "node = None → return None.",
          en: "node = None → return None.",
        },
      });
      return null;
    }

    // Line 8: left = post_order(node.left)
    snap({
      title: { vi: `post_order(${node.val}): left = post_order(node.left)`, en: `post_order(${node.val}): left = post_order(node.left)` },
      hlSet: new Set([node.id]),
      codeLines: [8],
      vars: [{ name: "node", value: node.val }, { name: "node.left", value: nv(node.left) }],
      note: {
        vi: `Gọi đệ quy vào con trái của ${node.val} (${nv(node.left)}) trước.`,
        en: `Recurse into ${node.val}'s left child (${nv(node.left)}) first.`,
      },
    });
    const left = postOrder(node.left, depth + 1);
    snap({
      title: { vi: `post_order(${node.val}): left = ${nv(left)}`, en: `post_order(${node.val}): left = ${nv(left)}` },
      hlSet: new Set([node.id]),
      codeLines: [8],
      vars: [{ name: "node", value: node.val }, { name: "left (result)", value: nv(left) }],
      note: {
        vi: `Đệ quy con trái của ${node.val} trả về left = ${nv(left)}.`,
        en: `The left recursion for ${node.val} returned left = ${nv(left)}.`,
      },
    });

    // Line 9: right = post_order(node.right)
    snap({
      title: { vi: `post_order(${node.val}): right = post_order(node.right)`, en: `post_order(${node.val}): right = post_order(node.right)` },
      hlSet: new Set([node.id]),
      codeLines: [9],
      vars: [{ name: "node", value: node.val }, { name: "node.right", value: nv(node.right) }],
      note: {
        vi: `Gọi đệ quy vào con phải của ${node.val} (${nv(node.right)}).`,
        en: `Recurse into ${node.val}'s right child (${nv(node.right)}).`,
      },
    });
    const right = postOrder(node.right, depth + 1);
    snap({
      title: { vi: `post_order(${node.val}): right = ${nv(right)}`, en: `post_order(${node.val}): right = ${nv(right)}` },
      hlSet: new Set([node.id]),
      codeLines: [9],
      vars: [{ name: "node", value: node.val }, { name: "right (result)", value: nv(right) }],
      note: {
        vi: `Đệ quy con phải của ${node.val} trả về right = ${nv(right)}.`,
        en: `The right recursion for ${node.val} returned right = ${nv(right)}.`,
      },
    });

    // Line 10: if node == p:
    const isP = node.val === pv;
    snap({
      title: { vi: `post_order(${node.val}): if node == p → ${isP}`, en: `post_order(${node.val}): if node == p → ${isP}` },
      hlSet: new Set([node.id]),
      codeLines: [10],
      vars: [{ name: "node.val", value: node.val }, { name: "p", value: pv }],
      note: isP
        ? { vi: `node.val=${node.val} == p=${pv} → đây chính là p.`, en: `node.val=${node.val} == p=${pv} → this is p.` }
        : { vi: `node.val=${node.val} ≠ p=${pv} → chưa phải p.`, en: `node.val=${node.val} ≠ p=${pv} → not p.` },
    });

    if (isP) {
      // Line 11: self.findP = True
      findP = true;
      snap({
        title: { vi: `post_order(${node.val}): self.findP = True`, en: `post_order(${node.val}): self.findP = True` },
        hlSet: new Set([node.id]),
        codeLines: [11],
        note: {
          vi: `Đánh dấu đã tìm thấy p=${pv} trong cây.`,
          en: `Mark that p=${pv} was found in the tree.`,
        },
      });
      // Line 12: return node
      snap({
        title: { vi: `post_order(${node.val}): return node → ${node.val}`, en: `post_order(${node.val}): return node → ${node.val}` },
        hlSet: new Set([node.id]),
        codeLines: [12],
        note: {
          vi: `Trả về node ${node.val} (chính là p) lên lời gọi cha.`,
          en: `Return node ${node.val} (which is p) to the caller.`,
        },
      });
      return node;
    }

    // Line 13: if node == q:
    const isQ = node.val === qv;
    snap({
      title: { vi: `post_order(${node.val}): if node == q → ${isQ}`, en: `post_order(${node.val}): if node == q → ${isQ}` },
      hlSet: new Set([node.id]),
      codeLines: [13],
      vars: [{ name: "node.val", value: node.val }, { name: "q", value: qv }],
      note: isQ
        ? { vi: `node.val=${node.val} == q=${qv} → đây chính là q.`, en: `node.val=${node.val} == q=${qv} → this is q.` }
        : { vi: `node.val=${node.val} ≠ q=${qv} → chưa phải q.`, en: `node.val=${node.val} ≠ q=${qv} → not q.` },
    });

    if (isQ) {
      // Line 14: self.findQ = True
      findQ = true;
      snap({
        title: { vi: `post_order(${node.val}): self.findQ = True`, en: `post_order(${node.val}): self.findQ = True` },
        hlSet: new Set([node.id]),
        codeLines: [14],
        note: {
          vi: `Đánh dấu đã tìm thấy q=${qv} trong cây.`,
          en: `Mark that q=${qv} was found in the tree.`,
        },
      });
      // Line 15: return node
      snap({
        title: { vi: `post_order(${node.val}): return node → ${node.val}`, en: `post_order(${node.val}): return node → ${node.val}` },
        hlSet: new Set([node.id]),
        codeLines: [15],
        note: {
          vi: `Trả về node ${node.val} (chính là q) lên lời gọi cha.`,
          en: `Return node ${node.val} (which is q) to the caller.`,
        },
      });
      return node;
    }

    // Line 16: if not left:
    const noLeft = !left;
    snap({
      title: { vi: `post_order(${node.val}): if not left → ${noLeft}`, en: `post_order(${node.val}): if not left → ${noLeft}` },
      hlSet: new Set([node.id]),
      codeLines: [16],
      vars: [{ name: "left", value: nv(left) }],
      note: noLeft
        ? { vi: "left = None → nhánh trái không chứa p, q → sẽ trả về right.", en: "left = None → left subtree has neither p nor q → will return right." }
        : { vi: `left = ${nv(left)} → nhánh trái có chứa ứng viên, kiểm tiếp right.`, en: `left = ${nv(left)} → left subtree has a candidate, check right next.` },
    });

    if (noLeft) {
      // Line 17: return right
      snap({
        title: { vi: `post_order(${node.val}): return right → ${nv(right)}`, en: `post_order(${node.val}): return right → ${nv(right)}` },
        hlSet: new Set([node.id]),
        codeLines: [17],
        note: {
          vi: `Trả về right = ${nv(right)} lên lời gọi cha (bỏ qua nhánh trái vì trống).`,
          en: `Return right = ${nv(right)} to the caller (left branch is empty, so it's ignored).`,
        },
      });
      return right;
    }

    // Line 18: elif not right:
    const noRight = !right;
    snap({
      title: { vi: `post_order(${node.val}): elif not right → ${noRight}`, en: `post_order(${node.val}): elif not right → ${noRight}` },
      hlSet: new Set([node.id]),
      codeLines: [18],
      vars: [{ name: "right", value: nv(right) }],
      note: noRight
        ? { vi: "right = None → nhánh phải không chứa p, q → sẽ trả về left.", en: "right = None → right subtree has neither p nor q → will return left." }
        : { vi: `right = ${nv(right)} → cả 2 nhánh đều có ứng viên → node ${node.val} chính là LCA.`, en: `right = ${nv(right)} → both branches have a candidate → node ${node.val} is the LCA.` },
    });

    if (noRight) {
      // Line 19: return left
      snap({
        title: { vi: `post_order(${node.val}): return left → ${nv(left)}`, en: `post_order(${node.val}): return left → ${nv(left)}` },
        hlSet: new Set([node.id]),
        codeLines: [19],
        note: {
          vi: `Trả về left = ${nv(left)} lên lời gọi cha (bỏ qua nhánh phải vì trống).`,
          en: `Return left = ${nv(left)} to the caller (right branch is empty, so it's ignored).`,
        },
      });
      return left;
    }

    // Lines 20-21: else: return node
    snap({
      title: { vi: `post_order(${node.val}): else → return node → ${node.val}`, en: `post_order(${node.val}): else → return node → ${node.val}` },
      hlSet: new Set([node.id]),
      codeLines: [20, 21],
      note: {
        vi: `Cả left và right đều không rỗng → node ${node.val} là tổ tiên chung thấp nhất (LCA) của 2 ứng viên.`,
        en: `Both left and right are non-empty → node ${node.val} is the lowest common ancestor of the two candidates.`,
      },
    });
    return node;
  }

  // Line 22: res = post_order(root)
  snap({
    title: { vi: "res = post_order(root)", en: "res = post_order(root)" },
    hlSet: root ? new Set([root.id]) : undefined,
    codeLines: [22],
    vars: [{ name: "root", value: nv(root) }],
    note: {
      vi: "Bắt đầu đệ quy post-order từ root.",
      en: "Start the post-order recursion from root.",
    },
  });
  const res = postOrder(root, 0);
  snap({
    title: { vi: `res = post_order(root) → ${nv(res)}`, en: `res = post_order(root) → ${nv(res)}` },
    hlSet: res ? new Set([res.id]) : undefined,
    codeLines: [22],
    vars: [{ name: "res", value: nv(res) }],
    note: {
      vi: `post_order(root) trả về res = ${nv(res)}.`,
      en: `post_order(root) returned res = ${nv(res)}.`,
    },
  });

  // Line 23: if self.findP and self.findQ:
  const valid = findP && findQ;
  snap({
    title: { vi: `if self.findP and self.findQ → ${valid}`, en: `if self.findP and self.findQ → ${valid}` },
    codeLines: [23],
    vars: [{ name: "res", value: nv(res) }],
    note: valid
      ? { vi: "Cả p và q đều tồn tại trong cây → sẽ trả về res.", en: "Both p and q exist in the tree → will return res." }
      : { vi: "Thiếu p hoặc q trong cây → sẽ trả về None.", en: "p or q is missing from the tree → will return None." },
  });

  const finalWordSet = new Set();
  if (findP && pNode) finalWordSet.add(pNode.id);
  if (findQ && qNode) finalWordSet.add(qNode.id);

  let fs;
  if (valid) {
    // Line 24: return res
    if (res) finalWordSet.add(res.id);
    fs = snapshot(root, {
      title: { vi: `return res → ${nv(res)}`, en: `return res → ${nv(res)}` },
      wordSet: finalWordSet,
      annotations: baseAnnotations(),
      codeLines: [24],
      codeBlock: 2,
      vars: [
        { name: "self.findP", value: findP },
        { name: "self.findQ", value: findQ },
        { name: "answer", value: nv(res) },
      ],
      note: { vi: `self.findP và self.findQ đều True → trả về res = ${nv(res)}.`, en: `self.findP and self.findQ are both True → return res = ${nv(res)}.` },
    });
  } else {
    // Lines 25-26: else: return None
    fs = snapshot(root, {
      title: { vi: "else: return None", en: "else: return None" },
      wordSet: finalWordSet,
      annotations: baseAnnotations(),
      codeLines: [25, 26],
      codeBlock: 2,
      vars: [
        { name: "self.findP", value: findP },
        { name: "self.findQ", value: findQ },
        { name: "answer", value: "None" },
      ],
      note: { vi: "Thiếu p hoặc q → trả về None.", en: "p or q is missing → return None." },
    });
  }
  fs.final = true;
  steps.push(fs);

  return { input, answer: valid ? nv(res) : "null", steps };
}

// ─── 1650: LCA of a Binary Tree III (parent pointers) ───
function buildSteps1650(input, params) {
  const root = parseTree(input); const parent = buildParents(root); const pv = Number(params.p); const qv = Number(params.q); const steps = [];
  const p = findNode(root, pv), q = findNode(root, qv);
  steps.push(snapshot(root, {
    title: { vi: `LCA III của ${pv} và ${qv}`, en: `LCA III of ${pv} and ${qv}` },
    codeLines: [2, 3], vars: [{ name: "p", value: pv }, { name: "q", value: qv }],
    note: { vi: `Mỗi nút có con trỏ CHA. Thu tất cả tổ tiên của p (đi lên tới gốc), rồi đi lên từ q, gặp tổ tiên chung đầu tiên → LCA.`, en: `Each node has a PARENT pointer. Collect all ancestors of p (walk up to root), then walk up from q; the first shared ancestor → LCA.` },
  }));
  const anc = new Set(); let cur = p;
  while (cur) {
    anc.add(cur.id);
    steps.push(snapshot(root, { title: { vi: `Tổ tiên của p: ${cur.val}`, en: `Ancestor of p: ${cur.val}` }, hlSet: new Set([cur.id]), wordSet: new Set(anc), codeLines: [4, 5], vars: [{ name: "node", value: cur.val }, { name: "ancestors(p)", value: `{${[...anc].map((id) => findNodeById(root, id)).join(",")}}` }], note: { vi: `Thêm ${cur.val} vào tập tổ tiên của p, đi lên cha.`, en: `Add ${cur.val} to p's ancestor set, move up to parent.` } }));
    cur = parent.get(cur.id);
  }
  cur = q; let lca = null;
  while (cur) {
    if (anc.has(cur.id)) {
      lca = cur;
      steps.push(snapshot(root, { title: { vi: `✓ ${cur.val} là tổ tiên chung`, en: `✓ ${cur.val} is common ancestor` }, hlSet: new Set([cur.id]), wordSet: new Set([cur.id]), codeLines: [6, 7], vars: [{ name: "node", value: cur.val }, { name: "LCA", value: cur.val }], note: { vi: `${cur.val} có trong tổ tiên của p → đây là LCA.`, en: `${cur.val} is in p's ancestors → this is the LCA.` } }));
      break;
    }
    steps.push(snapshot(root, { title: { vi: `${cur.val} chưa phải`, en: `${cur.val} not yet` }, hlSet: new Set([cur.id]), codeLines: [6], vars: [{ name: "node", value: cur.val }], note: { vi: `${cur.val} không thuộc tổ tiên của p → đi lên cha của q.`, en: `${cur.val} not in p's ancestors → go up from q.` } }));
    cur = parent.get(cur.id);
  }
  const fs = snapshot(root, { title: { vi: `LCA = ${lca ? lca.val : "null"}`, en: `LCA = ${lca ? lca.val : "null"}` }, wordSet: lca ? new Set([lca.id]) : undefined, vars: [{ name: "answer", value: lca ? lca.val : "null" }], note: { vi: `Tổ tiên chung thấp nhất = ${lca ? lca.val : "null"}.`, en: `Lowest common ancestor = ${lca ? lca.val : "null"}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: lca ? lca.val : "null", steps };
}
function findNodeById(root, id) { let v = null; (function dfs(n) { if (!n || v !== null) return; if (n.id === id) { v = n.val; return; } dfs(n.left); dfs(n.right); })(root); return v; }

// ─── 1676: LCA of a Binary Tree IV (array of nodes) ───
function buildSteps1676(input, params) {
  const root = parseTree(input); const targets = String(params.nodes || "").split(",").map((s) => Number(s.trim())); const tset = new Set(targets); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: `LCA IV của [${targets.join(",")}]`, en: `LCA IV of [${targets.join(",")}]` },
    codeLines: [2, 3], vars: [{ name: "nodes", value: `[${targets.join(",")}]` }],
    note: { vi: `Tổng quát hóa 236 cho NHIỀU nút. Đệ quy: nếu nút thuộc tập đích → trả về nút. Nếu ≥2 nhánh trả khác null → nút hiện tại là LCA.`, en: `Generalize 236 to MANY nodes. Recursion: if node is in the target set → return it. If ≥2 branches return non-null → current node is the LCA.` },
  }));
  let answer = null;
  function lca(node) {
    if (!node) return null;
    if (tset.has(node.val)) {
      steps.push(snapshot(root, { title: { vi: `Gặp đích ${node.val}`, en: `Hit target ${node.val}` }, hlSet: new Set([node.id]), codeLines: [4, 5], vars: [{ name: "node", value: node.val }], note: { vi: `${node.val} thuộc tập đích → trả về nút này.`, en: `${node.val} is a target → return this node.` } }));
      return node;
    }
    const L = lca(node.left), R = lca(node.right);
    if (L && R) {
      answer = node;
      steps.push(snapshot(root, { title: { vi: `${node.val}: điểm gộp`, en: `${node.val}: merge point` }, hlSet: new Set([node.id]), codeLines: [7, 8], vars: [{ name: "node", value: node.val }, { name: "left", value: L.val }, { name: "right", value: R.val }], note: { vi: `Có đích ở cả 2 nhánh của ${node.val} → ${node.val} là tổ tiên chung (điểm gộp cao nhất sẽ là LCA).`, en: `Targets in both branches of ${node.val} → ${node.val} is a common ancestor (the highest merge point is the LCA).` } }));
      return node;
    }
    return L || R;
  }
  const lcaNode = lca(root);
  if (lcaNode) answer = lcaNode;
  const fs = snapshot(root, { title: { vi: `LCA = ${answer ? answer.val : "null"}`, en: `LCA = ${answer ? answer.val : "null"}` }, wordSet: answer ? new Set([answer.id]) : undefined, vars: [{ name: "answer", value: answer ? answer.val : "null" }], note: { vi: `Tổ tiên chung thấp nhất của tất cả nút = ${answer ? answer.val : "null"}.`, en: `Lowest common ancestor of all nodes = ${answer ? answer.val : "null"}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: answer ? answer.val : "null", steps };
}

// ─── 1123: LCA of Deepest Leaves ───
function buildSteps1123(input) {
  const root = parseTree(input);
  const steps = [];
  const callStack = [];
  const returned = new Map();
  let processed = 0;

  const allNodes = [];
  (function collect(node, depth) {
    if (!node) return;
    allNodes.push({ node, depth });
    collect(node.left, depth + 1);
    collect(node.right, depth + 1);
  })(root, 0);
  const deepestLevel = allNodes.length ? Math.max(...allNodes.map((item) => item.depth)) : 0;
  const deepestLeaves = allNodes.filter(({ node, depth }) => depth === deepestLevel && !node.left && !node.right);

  const pairText = (pair) => pair
    ? `(${pair[0]}, ${pair[1] ? pair[1].val : "None"})`
    : "?";
  const completedAnnotations = (current = null, extra = {}) => {
    const annotations = {};
    returned.forEach((pair, id) => {
      annotations[id] = { label: `↩ ${pairText(pair)}`, kind: "lca-returned" };
    });
    if (current) annotations[current.id] = { label: "CURRENT", kind: "lca-current" };
    Object.entries(extra).forEach(([id, annotation]) => { annotations[id] = annotation; });
    return annotations;
  };
  const makeView = ({ phase, node = null, left = null, right = null, decision = null, result = null }) => ({
    phase,
    current: node ? node.val : null,
    callStack: callStack.map((frame) => frame.val),
    left: left ? { height: left[0], lca: left[1] ? left[1].val : "None" } : null,
    right: right ? { height: right[0], lca: right[1] ? right[1].val : "None" } : null,
    decision,
    result: result ? { height: result[0], lca: result[1] ? result[1].val : "None" } : null,
    processed,
    total: allNodes.length,
    deepestLevel,
    deepestLeaves: phase === "done" ? deepestLeaves.map(({ node: leaf }) => leaf.val) : [],
  });

  steps.push(snapshot(root, {
    title: { vi: "Mỗi lời gọi trả về (chiều cao, LCA)", en: "Each call returns (height, LCA)" },
    codeLines: [2, 3],
    vars: [
      { name: "height", value: "subtree height" },
      { name: "dfs(None)", value: "(0, None)" },
    ],
    lcaDeepestView: makeView({ phase: "intro" }),
    note: {
      vi: "Quan trọng: giá trị đầu tiên là CHIỀU CAO của cây con, không phải độ sâu tính từ root. Lá trả về (1, chính nó).",
      en: "Important: the first value is subtree HEIGHT, not depth from the root. A leaf returns (1, itself).",
    },
  }));

  let nullCallId = 0;
  function dfs(node, parent = null, side = null) {
    if (!node) {
      const nullId = `null-${nullCallId++}`;
      steps.push(snapshot(root, {
        title: { vi: "Gặp None → trả về (0, None)", en: "Hit None → return (0, None)" },
        hlSet: parent ? new Set([parent.id]) : undefined,
        annotations: completedAnnotations(parent, parent ? {
          [parent.id]: { label: `${side === "left" ? "LEFT" : "RIGHT"} child = None`, kind: "lca-null" },
        } : {}),
        nullChildren: parent ? [{ id: nullId, parentId: parent.id, side }] : [],
        codeLines: [4, 5],
        vars: [{ name: "node", value: "None" }, { name: "return", value: "(0, None)" }],
        lcaDeepestView: makeView({ phase: "base", node: parent }),
        note: {
          vi: "None có chiều cao 0. Đây là mốc để một node lá tính được 1 + max(0, 0) = 1.",
          en: "None has height 0. This lets a leaf compute 1 + max(0, 0) = 1.",
        },
      }));
      return [0, null];
    }

    callStack.push(node);
    steps.push(snapshot(root, {
      title: { vi: `Vào dfs(${node.val}): xử lý trái trước`, en: `Enter dfs(${node.val}): process left first` },
      hlSet: new Set([node.id]),
      annotations: completedAnnotations(node),
      codeLines: [3, 4, 6],
      vars: [{ name: "node", value: node.val }, { name: "call stack", value: `[${callStack.map((frame) => frame.val).join(", ")}]` }],
      lcaDeepestView: makeView({ phase: "enter", node }),
      note: {
        vi: "DFS postorder: chưa thể quyết định tại node hiện tại cho đến khi nhận kết quả từ cả cây con trái và phải.",
        en: "Postorder DFS: the current node cannot decide until both child results are available.",
      },
    }));

    const left = dfs(node.left, node, "left");
    const right = dfs(node.right, node, "right");
    let result;
    let decision;
    let codeLines;

    if (left[0] === right[0]) {
      result = [left[0] + 1, node];
      decision = "equal";
      codeLines = [8, 9];
    } else if (left[0] > right[0]) {
      result = [left[0] + 1, left[1]];
      decision = "left";
      codeLines = [10];
    } else {
      result = [right[0] + 1, right[1]];
      decision = "right";
      codeLines = [10];
    }

    returned.set(node.id, result);
    processed += 1;
    const childAnnotations = {};
    if (node.left) childAnnotations[node.left.id] = { label: `L ${pairText(left)}`, kind: "lca-left" };
    if (node.right) childAnnotations[node.right.id] = { label: `R ${pairText(right)}`, kind: "lca-right" };
    steps.push(snapshot(root, {
      title: {
        vi: `Node ${node.val}: ${pairText(left)} và ${pairText(right)} → ${pairText(result)}`,
        en: `Node ${node.val}: ${pairText(left)} and ${pairText(right)} → ${pairText(result)}`,
      },
      hlSet: new Set([node.id]),
      wordSet: result[1] ? new Set([result[1].id]) : undefined,
      annotations: completedAnnotations(node, childAnnotations),
      codeLines,
      vars: [
        { name: "left", value: pairText(left) },
        { name: "right", value: pairText(right) },
        { name: "decision", value: decision === "equal" ? "equal → current node" : `${decision} is deeper` },
        { name: "return", value: pairText(result) },
      ],
      lcaDeepestView: makeView({ phase: "compare", node, left, right, decision, result }),
      note: decision === "equal"
        ? {
          vi: `Hai phía cao bằng nhau (${left[0]}). Lá sâu nhất xuất hiện ở cả hai phía, nên ${node.val} là điểm gặp thấp nhất của chúng.`,
          en: `Both sides have equal height (${left[0]}). Deepest leaves occur on both sides, so ${node.val} is their lowest meeting point.`,
        }
        : {
          vi: `Phía ${decision === "left" ? "trái" : "phải"} cao hơn. Mọi lá sâu nhất nằm phía đó, nên giữ LCA = ${result[1] ? result[1].val : "None"}.`,
          en: `The ${decision} side is taller. Every deepest leaf is there, so keep LCA = ${result[1] ? result[1].val : "None"}.`,
        },
    }));
    callStack.pop();
    return result;
  }

  const result = dfs(root);
  const lcaNode = result[1];
  const deepestIds = new Set(deepestLeaves.map(({ node }) => node.id));
  const finalAnnotations = completedAnnotations(null);
  deepestLeaves.forEach(({ node }) => {
    finalAnnotations[node.id] = { label: "DEEPEST", kind: "lca-deepest" };
  });
  if (lcaNode) finalAnnotations[lcaNode.id] = { label: "LCA · ANSWER", kind: "lca-answer" };
  const fs = snapshot(root, {
    title: { vi: `Kết quả: LCA = ${lcaNode ? lcaNode.val : "None"}`, en: `Result: LCA = ${lcaNode ? lcaNode.val : "None"}` },
    hlSet: deepestIds,
    wordSet: lcaNode ? new Set([lcaNode.id]) : undefined,
    annotations: finalAnnotations,
    codeLines: [11],
    vars: [
      { name: "deepest leaves", value: `[${deepestLeaves.map(({ node }) => node.val).join(", ")}]` },
      { name: "dfs(root)", value: pairText(result) },
      { name: "answer", value: lcaNode ? lcaNode.val : "None" },
    ],
    lcaDeepestView: makeView({ phase: "done", result }),
    note: {
      vi: `Các lá sâu nhất là [${deepestLeaves.map(({ node }) => node.val).join(", ")}]. Thành phần thứ hai của dfs(root) chính là đáp án.`,
      en: `The deepest leaves are [${deepestLeaves.map(({ node }) => node.val).join(", ")}]. The second component of dfs(root) is the answer.`,
    },
  });
  fs.final = true;
  steps.push(fs);
  return { input, answer: lcaNode ? lcaNode.val : "null", steps };
}

// ─── 366: Find Leaves of Binary Tree ───
function buildSteps366(input) {
  const root = parseTree(input); const steps = []; const groups = [];
  steps.push(snapshot(root, {
    title: { vi: "Lần lượt gỡ lá", en: "Repeatedly remove leaves" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "height = 1 + max(left, right)" }],
    note: { vi: `Mỗi nút thuộc nhóm = CHIỀU CAO của nó từ dưới lên (lá = 0). Gỡ lá vòng 0, rồi lá mới vòng 1... height(node) = 1 + max(height con).`, en: `Each node belongs to a group = its HEIGHT from the bottom (leaf = 0). Remove round-0 leaves, then new leaves round 1... height(node) = 1 + max(child heights).` },
  }));
  const nodesByGroup = [];
  function dfs(node) {
    if (!node) return -1;
    const h = 1 + Math.max(dfs(node.left), dfs(node.right));
    if (!groups[h]) { groups[h] = []; nodesByGroup[h] = []; }
    groups[h].push(node.val); nodesByGroup[h].push(node.id);
    return h;
  }
  dfs(root);
  const cumulative = new Set();
  for (let g = 0; g < groups.length; g++) {
    nodesByGroup[g].forEach((id) => cumulative.add(id));
    steps.push(snapshot(root, { title: { vi: `Vòng ${g}: gỡ [${groups[g].join(",")}]`, en: `Round ${g}: remove [${groups[g].join(",")}]` }, hlSet: new Set(nodesByGroup[g]), wordSet: new Set(cumulative), codeLines: [4, 5], vars: [{ name: "round", value: g }, { name: "removed", value: `[${groups[g].join(",")}]` }, { name: "result", value: JSON.stringify(groups.slice(0, g + 1)) }], note: { vi: `Các nút có chiều cao ${g} (lá hiện tại) bị gỡ cùng lúc.`, en: `Nodes with height ${g} (current leaves) are removed together.` } }));
  }
  const fs = snapshot(root, { title: { vi: `Kết quả: ${JSON.stringify(groups)}`, en: `Result: ${JSON.stringify(groups)}` }, vars: [{ name: "answer", value: JSON.stringify(groups) }], note: { vi: `Mỗi mảng con = 1 vòng gỡ lá.`, en: `Each sublist = one round of leaf removal.` } }); fs.final = true; steps.push(fs);
  return { input, answer: JSON.stringify(groups), steps };
}

// ─── 863: All Nodes Distance K in Binary Tree ───
function buildSteps863(input, params) {
  const root = parseTree(input);
  const targetValue = Number(params.target);
  const k = Number(params.k);
  const target = findNode(root, targetValue);
  const parent = new Map();
  const parentEntries = [];
  const visited = new Set();
  const result = [];
  const resultIds = new Set();
  const distanceById = new Map();
  const steps = [];
  let queue = null;
  let phase = "parent";
  let currentNode = null;
  let currentDistance = null;
  let inspectedNeighbor = null;

  const formatQueue = () => queue === null
    ? "not initialized"
    : `[${queue.map(({ node, distance }) => `(${node.val},${distance})`).join(", ")}]`;
  const formatVisited = () => `[${[...visited].map((id) => {
    const value = findNodeById(root, id);
    return value !== null ? value : id;
  }).join(", ")}]`;
  const formatParents = () => `{${parentEntries.map(([child, par]) => `${child}:${par}`).join(", ")}}`;
  const addAnnotation = (annotations, nodeId, label, kind) => {
    if (nodeId === null || nodeId === undefined) return;
    if (!annotations[nodeId]) annotations[nodeId] = { labels: [] };
    annotations[nodeId].labels.push({ label, kind });
  };
  const distanceAnnotations = () => {
    const annotations = {};
    if (target) addAnnotation(annotations, target.id, "TARGET · d=0", "distance-target");
    if (queue) {
      queue.forEach(({ node, distance }) => {
        addAnnotation(annotations, node.id, `QUEUE · d=${distance}`, "distance-queue");
      });
    }
    resultIds.forEach((id) => addAnnotation(annotations, id, `ANSWER · d=${k}`, "distance-answer"));
    if (currentNode) {
      addAnnotation(annotations, currentNode.id, `CURRENT · d=${currentDistance}`, "distance-current");
    }
    if (inspectedNeighbor && inspectedNeighbor.node) {
      addAnnotation(
        annotations,
        inspectedNeighbor.node.id,
        `${inspectedNeighbor.relation.toUpperCase()} · ${inspectedNeighbor.eligible ? "NEW" : "VISITED"}`,
        inspectedNeighbor.eligible ? "distance-candidate" : "distance-rejected",
      );
    }
    return annotations;
  };
  const distanceKView = () => {
    const layers = new Map();
    distanceById.forEach((distance, id) => {
      if (!layers.has(distance)) layers.set(distance, []);
      const nodeValue = findNodeById(root, id);
      layers.get(distance).push({
        id,
        value: nodeValue === null ? id : nodeValue,
        isTarget: !!target && id === target.id,
        isCurrent: !!currentNode && id === currentNode.id,
        isQueued: !!queue && queue.some(({ node }) => node.id === id),
        isAnswer: resultIds.has(id),
      });
    });
    if (target && !distanceById.has(target.id)) {
      layers.set(0, [{
        id: target.id,
        value: target.val,
        isTarget: true,
        isCurrent: false,
        isQueued: false,
        isAnswer: false,
      }]);
    }
    return {
      phase,
      target: target ? target.val : targetValue,
      k,
      current: currentNode ? { value: currentNode.val, distance: currentDistance } : null,
      inspecting: inspectedNeighbor
        ? {
            relation: inspectedNeighbor.relation,
            value: inspectedNeighbor.node ? inspectedNeighbor.node.val : "None",
            eligible: inspectedNeighbor.eligible,
            reason: inspectedNeighbor.reason,
          }
        : null,
      layers: [...layers.entries()].sort(([a], [b]) => a - b).map(([distance, nodes]) => ({ distance, nodes })),
      queue: queue ? queue.map(({ node, distance }) => ({ value: node.val, distance })) : [],
      visited: [...visited].map((id) => findNodeById(root, id)),
      result: [...result],
      parentCount: parentEntries.length,
    };
  };
  const queueView = (operation = "—", popped = "—", appended = "—") => {
    const items = queue === null ? [] : queue.map(({ node, distance }) => `${node.val}@${distance}`);
    return {
      title: "BFS Queue (node@distance)",
      layout: "stacked",
      items,
      capacity: Math.max(5, items.length),
      active: items.length ? 0 : -1,
      status: [
        { label: "operation", value: operation },
        { label: "popped", value: popped },
        { label: "appended", value: appended },
        { label: "target distance", value: k },
      ],
    };
  };
  const addStep = (opts) => {
    const frame = snapshot(root, Object.assign({}, opts, {
      annotations: opts.annotations || distanceAnnotations(),
      queueView: queueView(opts.queueOperation, opts.popped, opts.appended),
    }));
    frame.distanceKView = distanceKView();
    steps.push(frame);
  };

  addStep({
    title: { vi: `Tìm các nút cách target=${targetValue} đúng k=${k}`, en: `Find nodes exactly k=${k} from target=${targetValue}` },
    hlSet: target ? new Set([target.id]) : new Set(), codeLines: [4],
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "target", value: target ? `TreeNode(${target.val})` : "not found" }, { name: "k", value: k }],
    queueOperation: "enter function",
    note: { vi: "Pha 1 tạo parent map để có thể đi từ con lên cha. Pha 2 BFS từ target theo ba hướng: trái, phải, cha.", en: "Phase 1 builds a parent map so traversal can move from child to parent. Phase 2 runs BFS from target in three directions: left, right, parent." },
  });

  addStep({
    title: { vi: "parent = {}", en: "parent = {}" }, codeLines: [5],
    vars: [{ name: "parent", value: "{}" }], queueOperation: "parent map phase",
    note: { vi: "Map parent[node] lưu cha của mỗi node; root sẽ có cha là None.", en: "parent[node] stores each node's parent; the root's parent is None." },
  });

  function buildParent(node, par) {
    if (!node) return;
    parent.set(node.id, par);
    parentEntries.push([node.val, par ? par.val : "None"]);
    addStep({
      title: { vi: `parent[${node.val}] = ${par ? par.val : "None"}`, en: `parent[${node.val}] = ${par ? par.val : "None"}` },
      hlSet: new Set([node.id]), codeLines: [9],
      vars: [{ name: "node", value: node.val }, { name: "par", value: par ? par.val : "None" }, { name: "parent", value: formatParents() }], queueOperation: "record parent",
      note: par
        ? { vi: `Ghi cạnh ngược ${node.val} → ${par.val}; từ ${node.val} ta có thể đi ngược lên cha.`, en: `Record reverse edge ${node.val} → ${par.val}; BFS can now move from ${node.val} back to its parent.` }
        : { vi: `${node.val} là root nên parent[${node.val}] = None.`, en: `${node.val} is the root, so parent[${node.val}] = None.` },
    });
    buildParent(node.left, node);
    buildParent(node.right, node);
  }

  if (root) buildParent(root, null);
  addStep({
    title: { vi: "Hoàn tất parent map", en: "Parent map complete" },
    hlSet: target ? new Set([target.id]) : new Set(), codeLines: [12],
    vars: [{ name: "parent", value: formatParents() }], queueOperation: "finish parent map",
    note: { vi: "Bây giờ mỗi node có tối đa ba hàng xóm: left, right và parent.", en: "Each node now has up to three neighbors: left, right, and parent." },
  });

  if (!target) {
    phase = "done";
    const missing = snapshot(root, {
      title: { vi: `Không tìm thấy target=${targetValue}`, en: `target=${targetValue} was not found` },
      annotations: distanceAnnotations(),
      codeLines: [26], queueView: queueView("stop: missing target"),
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "Input không hợp lệ: target phải là một node trong cây.", en: "Invalid input: target must be a node in the tree." },
    });
    missing.distanceKView = distanceKView();
    missing.final = true;
    steps.push(missing);
    return { input, answer: "[]", steps };
  }

  phase = "bfs";
  queue = [{ node: target, distance: 0 }];
  distanceById.set(target.id, 0);
  addStep({
    title: { vi: `queue = [(${target.val}, 0)]`, en: `queue = [(${target.val}, 0)]` },
    hlSet: new Set([target.id]), codeLines: [14],
    vars: [{ name: "queue", value: formatQueue() }], queueOperation: "enqueue target", appended: `${target.val}@0`,
    note: { vi: "BFS bắt đầu tại target với khoảng cách 0.", en: "BFS starts at target with distance 0." },
  });
  visited.add(target.id);
  addStep({
    title: { vi: `visited = {${target.val}}`, en: `visited = {${target.val}}` },
    hlSet: new Set([target.id]), wordSet: new Set(visited), codeLines: [15],
    vars: [{ name: "visited", value: formatVisited() }, { name: "queue", value: formatQueue() }], queueOperation: "mark target visited",
    note: { vi: "Đánh dấu target ngay khi enqueue để không quay lại node này qua cạnh parent/con.", en: "Mark target when it is enqueued so no parent/child edge can add it again." },
  });
  addStep({
    title: { vi: "result = []", en: "result = []" }, wordSet: new Set(visited), codeLines: [16],
    vars: [{ name: "result", value: "[]" }, { name: "queue", value: formatQueue() }], queueOperation: "initialize result",
    note: { vi: `result chỉ nhận node khi distance == ${k}.`, en: `A node enters result only when distance == ${k}.` },
  });

  while (queue.length) {
    currentNode = null;
    currentDistance = null;
    inspectedNeighbor = null;
    const { node, distance } = queue.shift();
    currentNode = node;
    currentDistance = distance;
    addStep({
      title: { vi: `popleft() → (${node.val}, ${distance})`, en: `popleft() → (${node.val}, ${distance})` },
      hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [17, 18],
      vars: [{ name: "node", value: node.val }, { name: "distance", value: distance }, { name: "queue", value: formatQueue() }, { name: "visited", value: formatVisited() }],
      queueOperation: "popleft", popped: `${node.val}@${distance}`,
      note: { vi: `Lấy node ${node.val} ở khoảng cách ${distance} khỏi đầu queue.`, en: `Remove node ${node.val} at distance ${distance} from the front of the queue.` },
    });

    if (distance === k) {
      phase = "collect";
      result.push(node.val);
      resultIds.add(node.id);
      addStep({
        title: { vi: `distance=${distance}=k → result.append(${node.val})`, en: `distance=${distance}=k → result.append(${node.val})` },
        hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [19, 20, 21],
        vars: [{ name: "result", value: `[${result.join(", ")}]` }, { name: "queue", value: formatQueue() }], queueOperation: "append result; continue",
        note: { vi: `${node.val} nằm đúng lớp d=${k}, nên thêm vào result. continue ngăn BFS đi xa hơn k.`, en: `${node.val} is on layer d=${k}, so add it to result. continue prevents BFS from going farther than k.` },
      });
      continue;
    }

    const neighbors = [
      { label: "left", node: node.left },
      { label: "right", node: node.right },
      { label: "parent", node: parent.get(node.id) },
    ];
    inspectedNeighbor = null;
    addStep({
      title: { vi: `Hàng xóm của ${node.val}: trái, phải, cha`, en: `Neighbors of ${node.val}: left, right, parent` },
      hlSet: new Set([node.id, ...neighbors.filter(({ node: nb }) => nb).map(({ node: nb }) => nb.id)]), wordSet: new Set(visited), codeLines: [22],
      vars: neighbors.map(({ label, node: nb }) => ({ name: label, value: nb ? nb.val : "None" })), queueOperation: "inspect neighbors",
      note: { vi: "parent map biến cạnh cha→con thành đường đi hai chiều mà không sửa cấu trúc cây.", en: "The parent map makes parent-child edges traversable in both directions without changing the tree." },
    });

    for (const { label, node: neighbor } of neighbors) {
      const eligible = !!neighbor && !visited.has(neighbor.id);
      inspectedNeighbor = {
        relation: label,
        node: neighbor,
        eligible,
        reason: !neighbor ? "none" : eligible ? "new" : "visited",
      };
      if (!eligible) {
        addStep({
          title: { vi: `${label}: ${neighbor ? neighbor.val : "None"} → bỏ qua`, en: `${label}: ${neighbor ? neighbor.val : "None"} → skip` },
          hlSet: new Set([node.id].concat(neighbor ? [neighbor.id] : [])), wordSet: new Set(visited), codeLines: [23],
          vars: [{ name: "neighbor", value: neighbor ? neighbor.val : "None" }, { name: "in visited", value: neighbor ? visited.has(neighbor.id) : "N/A" }],
          queueOperation: "skip neighbor",
          note: { vi: neighbor ? `${neighbor.val} đã có trong visited nên không enqueue lại.` : "Hàng xóm là None nên bỏ qua.", en: neighbor ? `${neighbor.val} is already in visited, so do not enqueue it again.` : "The neighbor is None, so skip it." },
        });
        continue;
      }
      visited.add(neighbor.id);
      distanceById.set(neighbor.id, distance + 1);
      queue.push({ node: neighbor, distance: distance + 1 });
      addStep({
        title: { vi: `${neighbor.val} chưa visited → đánh dấu và enqueue`, en: `${neighbor.val} not visited → mark and enqueue` },
        hlSet: new Set([node.id, neighbor.id]), wordSet: new Set(visited), codeLines: [23, 24, 25],
        vars: [{ name: "visited", value: formatVisited() }, { name: "queue", value: formatQueue() }, { name: "distance + 1", value: distance + 1 }],
        queueOperation: "append", appended: `${neighbor.val}@${distance + 1}`,
        note: { vi: `Đánh dấu trước khi enqueue để mỗi node chỉ vào queue một lần. Queue mới = ${formatQueue()}.`, en: `Mark before enqueueing so each node enters the queue once. Updated queue = ${formatQueue()}.` },
      });
    }
  }

  phase = "done";
  currentNode = null;
  currentDistance = null;
  inspectedNeighbor = null;
  const finalStep = snapshot(root, {
    title: { vi: `return [${result.join(", ")}]`, en: `return [${result.join(", ")}]` },
    hlSet: new Set(resultIds),
    wordSet: new Set(visited), annotations: distanceAnnotations(), codeLines: [26], queueView: queueView("done"),
    vars: [{ name: "result", value: `[${result.join(", ")}]` }, { name: "answer", value: `[${result.join(", ")}]` }],
    note: { vi: `Các node cách target=${targetValue} đúng ${k} cạnh là [${result.join(", ")}].`, en: `Nodes exactly ${k} edges from target=${targetValue} are [${result.join(", ")}].` },
  });
  finalStep.distanceKView = distanceKView();
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer: `[${result.join(",")}]`, steps };
}

// ─── 863 Approach 2: parent map + BFS one complete layer at a time ───
function buildSteps863v2(input, params) {
  const root = parseTree(input);
  const targetValue = Number(params.target);
  const k = Number(params.k);
  const target = findNode(root, targetValue);
  const parent = new Map();
  const parentEntries = [];
  const visited = new Set();
  const distanceById = new Map();
  const result = [];
  const resultIds = new Set();
  const steps = [];
  let queue = null;
  let distance = null;
  let size = null;
  let phase = "parent";
  let currentNode = null;
  let inspectedNeighbor = null;

  const formatQueue = () => queue === null ? "not initialized" : `[${queue.map((node) => node.val).join(", ")}]`;
  const formatVisited = () => `[${[...visited].map((id) => findNodeById(root, id)).join(", ")}]`;
  const formatParents = () => `{${parentEntries.map(([child, par]) => `${child}:${par}`).join(", ")}}`;
  const addAnnotation = (annotations, nodeId, label, kind) => {
    if (nodeId === null || nodeId === undefined) return;
    if (!annotations[nodeId]) annotations[nodeId] = { labels: [] };
    annotations[nodeId].labels.push({ label, kind });
  };
  const annotations = () => {
    const resultAnnotations = {};
    if (target) addAnnotation(resultAnnotations, target.id, "TARGET · d=0", "distance-target");
    if (queue) {
      queue.forEach((node) => {
        const nodeDistance = distanceById.get(node.id);
        addAnnotation(resultAnnotations, node.id, `QUEUE · d=${nodeDistance}`, "distance-queue");
      });
    }
    resultIds.forEach((id) => addAnnotation(resultAnnotations, id, `ANSWER · d=${k}`, "distance-answer"));
    if (currentNode) addAnnotation(resultAnnotations, currentNode.id, `CURRENT · d=${distance}`, "distance-current");
    if (inspectedNeighbor && inspectedNeighbor.node) {
      addAnnotation(
        resultAnnotations,
        inspectedNeighbor.node.id,
        `${inspectedNeighbor.relation.toUpperCase()} · ${inspectedNeighbor.eligible ? "NEW" : "VISITED"}`,
        inspectedNeighbor.eligible ? "distance-candidate" : "distance-rejected",
      );
    }
    return resultAnnotations;
  };
  const makeDistanceKView = () => {
    const layers = new Map();
    distanceById.forEach((nodeDistance, id) => {
      if (!layers.has(nodeDistance)) layers.set(nodeDistance, []);
      layers.get(nodeDistance).push({
        id,
        value: findNodeById(root, id),
        isTarget: !!target && id === target.id,
        isCurrent: !!currentNode && id === currentNode.id,
        isQueued: !!queue && queue.some((node) => node.id === id),
        isAnswer: resultIds.has(id),
      });
    });
    if (target && !distanceById.has(target.id)) {
      layers.set(0, [{
        id: target.id,
        value: target.val,
        isTarget: true,
        isCurrent: false,
        isQueued: false,
        isAnswer: false,
      }]);
    }
    return {
      phase,
      target: target ? target.val : targetValue,
      k,
      distance,
      size,
      current: currentNode ? { value: currentNode.val, distance } : null,
      inspecting: inspectedNeighbor
        ? {
            relation: inspectedNeighbor.relation,
            value: inspectedNeighbor.node ? inspectedNeighbor.node.val : "None",
            eligible: inspectedNeighbor.eligible,
            reason: inspectedNeighbor.reason,
          }
        : null,
      layers: [...layers.entries()].sort(([a], [b]) => a - b).map(([nodeDistance, nodes]) => ({ distance: nodeDistance, nodes })),
      queue: queue ? queue.map((node) => ({ value: node.val, distance: distanceById.get(node.id) })) : [],
      visited: [...visited].map((id) => findNodeById(root, id)),
      result: [...result],
      parentCount: parentEntries.length,
    };
  };
  const makeQueueView = (operation = "—", popped = "—", appended = "—") => {
    const items = queue === null ? [] : queue.map((node) => `${node.val}@${distanceById.get(node.id) ?? "?"}`);
    return {
      title: "BFS Queue (current layer first)",
      layout: "stacked",
      items,
      capacity: Math.max(5, items.length),
      active: items.length ? 0 : -1,
      status: [
        { label: "operation", value: operation },
        { label: "distance", value: distance ?? "—" },
        { label: "size", value: size ?? "—" },
        { label: "appended", value: appended },
        { label: "popped", value: popped },
      ],
    };
  };
  const addStep = (opts) => {
    const frame = snapshot(root, Object.assign({}, opts, {
      codeBlock: 2,
      annotations: opts.annotations || annotations(),
      queueView: makeQueueView(opts.queueOperation, opts.popped, opts.appended),
    }));
    frame.distanceKView = makeDistanceKView();
    steps.push(frame);
  };

  addStep({
    title: { vi: `Gọi distanceK(target=${targetValue}, k=${k})`, en: `Call distanceK(target=${targetValue}, k=${k})` },
    hlSet: target ? new Set([target.id]) : new Set(), codeLines: [5],
    vars: [{ name: "root", value: root ? root.val : "None" }, { name: "target", value: target ? `TreeNode(${target.val})` : "not found" }, { name: "k", value: k }],
    queueOperation: "enter function",
    note: { vi: "Cách 2 dựng parent map trước, sau đó BFS theo từng layer với một biến distance chung.", en: "Approach 2 builds the parent map, then runs layer-by-layer BFS with one shared distance variable." },
  });
  addStep({
    title: { vi: "parent = {}", en: "parent = {}" }, codeLines: [6],
    vars: [{ name: "parent", value: "{}" }], queueOperation: "initialize parent map",
    note: { vi: "Map này cho phép BFS đi ngược từ node con lên cha.", en: "This map lets BFS move upward from a child to its parent." },
  });
  addStep({
    title: { vi: "build_parent(root, None)", en: "build_parent(root, None)" },
    hlSet: root ? new Set([root.id]) : new Set(), codeLines: [18],
    vars: [{ name: "node", value: root ? root.val : "None" }, { name: "par", value: "None" }], queueOperation: "start parent DFS",
    note: { vi: "Bắt đầu DFS từ root; tham số par mang node cha của frame hiện tại.", en: "Start DFS at root; par carries the current frame's parent node." },
  });

  function buildParent(node, par) {
    addStep({
      title: { vi: `Gọi build_parent(${node ? node.val : "None"}, ${par ? par.val : "None"})`, en: `Call build_parent(${node ? node.val : "None"}, ${par ? par.val : "None"})` },
      hlSet: node ? new Set([node.id]) : par ? new Set([par.id]) : new Set(), codeLines: [9],
      vars: [{ name: "node", value: node ? node.val : "None" }, { name: "par", value: par ? par.val : "None" }], queueOperation: "enter build_parent",
      note: { vi: "Tạo một frame DFS để ghi parent cho node nếu node tồn tại.", en: "Create a DFS frame that records the node's parent when the node exists." },
    });
    const isNone = node === null;
    addStep({
      title: { vi: `node is None → ${isNone}`, en: `node is None → ${isNone}` },
      hlSet: node ? new Set([node.id]) : par ? new Set([par.id]) : new Set(), codeLines: [10],
      vars: [{ name: "node", value: node ? node.val : "None" }, { name: "condition", value: isNone }], queueOperation: "check node",
      note: isNone
        ? { vi: "Đã đi qua một nhánh rỗng; dòng kế tiếp return khỏi frame này.", en: "This branch is empty; the next line returns from this frame." }
        : { vi: "Node tồn tại nên tiếp tục ghi parent.", en: "The node exists, so continue and record its parent." },
    });
    if (isNone) {
      addStep({
        title: { vi: "return khỏi build_parent(None, par)", en: "return from build_parent(None, par)" },
        hlSet: par ? new Set([par.id]) : new Set(), codeLines: [11],
        vars: [{ name: "return", value: "None" }], queueOperation: "return from empty branch",
        note: { vi: "Không có node để ghi vào parent map.", en: "There is no node to add to the parent map." },
      });
      return;
    }

    parent.set(node.id, par);
    parentEntries.push([node.val, par ? par.val : "None"]);
    addStep({
      title: { vi: `parent[${node.val}] = ${par ? par.val : "None"}`, en: `parent[${node.val}] = ${par ? par.val : "None"}` },
      hlSet: new Set([node.id]), codeLines: [13],
      vars: [{ name: "node", value: node.val }, { name: "par", value: par ? par.val : "None" }, { name: "parent", value: formatParents() }], queueOperation: "record parent",
      note: par
        ? { vi: `Tạo đường đi ngược ${node.val} → ${par.val}.`, en: `Create the reverse link ${node.val} → ${par.val}.` }
        : { vi: `${node.val} là root nên parent của nó là None.`, en: `${node.val} is the root, so its parent is None.` },
    });
    addStep({
      title: { vi: `build_parent(${node.left ? node.left.val : "None"}, ${node.val})`, en: `build_parent(${node.left ? node.left.val : "None"}, ${node.val})` },
      hlSet: new Set([node.id].concat(node.left ? [node.left.id] : [])), codeLines: [15],
      vars: [{ name: "node.left", value: node.left ? node.left.val : "None" }, { name: "par", value: node.val }], queueOperation: "recurse left",
      note: { vi: "Duyệt nhánh trái và truyền node hiện tại làm par.", en: "Traverse the left branch and pass the current node as par." },
    });
    buildParent(node.left, node);
    addStep({
      title: { vi: `build_parent(${node.right ? node.right.val : "None"}, ${node.val})`, en: `build_parent(${node.right ? node.right.val : "None"}, ${node.val})` },
      hlSet: new Set([node.id].concat(node.right ? [node.right.id] : [])), codeLines: [16],
      vars: [{ name: "node.right", value: node.right ? node.right.val : "None" }, { name: "par", value: node.val }], queueOperation: "recurse right",
      note: { vi: "Sau khi nhánh trái hoàn tất, duyệt nhánh phải.", en: "After the left branch finishes, traverse the right branch." },
    });
    buildParent(node.right, node);
  }

  buildParent(root, null);
  if (!target) {
    phase = "done";
    const missingStep = snapshot(root, {
      title: { vi: `Không tìm thấy target=${targetValue} → return []`, en: `target=${targetValue} not found → return []` },
      codeLines: [43], codeBlock: 2, annotations: annotations(), queueView: makeQueueView("missing target"),
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "Target phải là một node trong cây.", en: "Target must be a node in the tree." },
    });
    missingStep.distanceKView = makeDistanceKView();
    missingStep.final = true;
    steps.push(missingStep);
    return { input, answer: "[]", steps };
  }

  phase = "bfs";
  queue = [target];
  distanceById.set(target.id, 0);
  addStep({
    title: { vi: `queue = deque([${target.val}])`, en: `queue = deque([${target.val}])` },
    hlSet: new Set([target.id]), codeLines: [21],
    vars: [{ name: "queue", value: formatQueue() }], queueOperation: "enqueue target", appended: target.val,
    note: { vi: "Queue bắt đầu với target; toàn bộ queue hiện tại thuộc layer d=0.", en: "The queue starts with target; the entire current queue belongs to layer d=0." },
  });
  visited.add(target.id);
  addStep({
    title: { vi: `visited = {${target.val}}`, en: `visited = {${target.val}}` },
    hlSet: new Set([target.id]), wordSet: new Set(visited), codeLines: [22],
    vars: [{ name: "visited", value: formatVisited() }], queueOperation: "mark target visited",
    note: { vi: "Đánh dấu target ngay khi enqueue để không quay ngược lại nó.", en: "Mark target when enqueued so traversal cannot return to it." },
  });
  distance = 0;
  addStep({
    title: { vi: "distance = 0", en: "distance = 0" },
    hlSet: new Set([target.id]), wordSet: new Set(visited), codeLines: [23],
    vars: [{ name: "distance", value: distance }, { name: "queue", value: formatQueue() }], queueOperation: "initialize distance",
    note: { vi: "Mọi node đang có trong queue đều cách target đúng distance cạnh.", en: "Every node currently in the queue is exactly distance edges from target." },
  });

  while (true) {
    currentNode = null;
    inspectedNeighbor = null;
    size = null;
    const hasNodes = queue.length > 0;
    addStep({
      title: hasNodes ? { vi: "while queue → True", en: "while queue → True" } : { vi: "while queue → False", en: "while queue → False" },
      hlSet: new Set(queue.map((node) => node.id)), wordSet: new Set(visited), codeLines: [25],
      vars: [{ name: "queue", value: formatQueue() }, { name: "distance", value: distance }, { name: "condition", value: hasNodes }], queueOperation: hasNodes ? "start layer" : "queue empty",
      note: hasNodes
        ? { vi: `Bắt đầu kiểm tra layer d=${distance}.`, en: `Begin checking layer d=${distance}.` }
        : { vi: "Không còn node để mở rộng.", en: "No nodes remain to expand." },
    });
    if (!hasNodes) break;

    const reachedK = distance === k;
    phase = reachedK ? "collect" : "bfs";
    addStep({
      title: { vi: `distance == k: ${distance} == ${k} → ${reachedK}`, en: `distance == k: ${distance} == ${k} → ${reachedK}` },
      hlSet: new Set(queue.map((node) => node.id)), wordSet: new Set(visited), codeLines: [27],
      vars: [{ name: "distance", value: distance }, { name: "k", value: k }, { name: "queue", value: formatQueue() }, { name: "condition", value: reachedK }], queueOperation: "check target layer",
      note: reachedK
        ? { vi: "Queue hiện chứa chính xác toàn bộ node ở khoảng cách k; dòng kế tiếp trả chúng ngay.", en: "The queue now contains exactly all nodes at distance k; the next line returns them immediately." }
        : { vi: "Chưa tới k nên phải mở rộng hết layer hiện tại.", en: "The target distance has not been reached, so expand the full current layer." },
    });
    if (reachedK) {
      queue.forEach((node) => {
        result.push(node.val);
        resultIds.add(node.id);
      });
      phase = "done";
      const finalStep = snapshot(root, {
        title: { vi: `return [${result.join(", ")}] từ queue`, en: `return [${result.join(", ")}] from queue` },
        hlSet: new Set(resultIds), wordSet: new Set(visited), annotations: annotations(), codeLines: [28], codeBlock: 2,
        queueView: makeQueueView("return current layer"),
        vars: [{ name: "distance", value: distance }, { name: "queue", value: formatQueue() }, { name: "return", value: `[${result.join(", ")}]` }],
        note: { vi: `List comprehension lấy mọi node đang nằm trong queue của layer d=${k}.`, en: `The list comprehension returns every node currently in the d=${k} queue layer.` },
      });
      finalStep.distanceKView = makeDistanceKView();
      finalStep.final = true;
      steps.push(finalStep);
      return { input, answer: `[${result.join(",")}]`, steps };
    }

    size = queue.length;
    addStep({
      title: { vi: `size = len(queue) = ${size}`, en: `size = len(queue) = ${size}` },
      hlSet: new Set(queue.map((node) => node.id)), wordSet: new Set(visited), codeLines: [30],
      vars: [{ name: "size", value: size }, { name: "distance", value: distance }, { name: "queue", value: formatQueue() }], queueOperation: "lock current layer",
      note: { vi: `Chốt đúng ${size} node của layer d=${distance}; node append mới thuộc layer kế tiếp.`, en: `Lock exactly ${size} nodes from layer d=${distance}; newly appended nodes belong to the next layer.` },
    });

    for (let slot = 0; slot < size; slot++) {
      addStep({
        title: { vi: `for _: lượt ${slot + 1}/${size}`, en: `for _: iteration ${slot + 1}/${size}` },
        hlSet: new Set(queue.length ? [queue[0].id] : []), wordSet: new Set(visited), codeLines: [32],
        vars: [{ name: "_", value: slot }, { name: "size", value: size }, { name: "distance", value: distance }], queueOperation: "next node in layer",
        note: { vi: `Chuẩn bị pop node thứ ${slot + 1}/${size} của layer hiện tại.`, en: `Prepare to pop node ${slot + 1}/${size} from the current layer.` },
      });
      const node = queue.shift();
      currentNode = node;
      addStep({
        title: { vi: `node = queue.popleft() → ${node.val}`, en: `node = queue.popleft() → ${node.val}` },
        hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [33],
        vars: [{ name: "node", value: node.val }, { name: "distance", value: distance }, { name: "queue", value: formatQueue() }], queueOperation: "popleft", popped: node.val,
        note: { vi: `Lấy node ${node.val} thuộc layer d=${distance}.`, en: `Pop node ${node.val} from layer d=${distance}.` },
      });

      const neighbors = [
        { relation: "left", node: node.left },
        { relation: "right", node: node.right },
        { relation: "parent", node: parent.get(node.id) },
      ];
      for (const candidate of neighbors) {
        inspectedNeighbor = null;
        addStep({
          title: { vi: `neighbor (${candidate.relation}) = ${candidate.node ? candidate.node.val : "None"}`, en: `neighbor (${candidate.relation}) = ${candidate.node ? candidate.node.val : "None"}` },
          hlSet: new Set([node.id].concat(candidate.node ? [candidate.node.id] : [])), wordSet: new Set(visited), codeLines: [36],
          vars: [{ name: "node", value: node.val }, { name: "neighbor", value: candidate.node ? candidate.node.val : "None" }, { name: "relation", value: candidate.relation }], queueOperation: "inspect neighbor",
          note: { vi: "Mỗi node có tối đa ba hướng đi: con trái, con phải và cha.", en: "Each node has up to three directions: left child, right child, and parent." },
        });
        const eligible = !!candidate.node && !visited.has(candidate.node.id);
        inspectedNeighbor = {
          relation: candidate.relation,
          node: candidate.node,
          eligible,
          reason: !candidate.node ? "none" : eligible ? "new" : "visited",
        };
        addStep({
          title: eligible
            ? { vi: `${candidate.node.val} != None và chưa visited → True`, en: `${candidate.node.val} is not None and unvisited → True` }
            : { vi: `${candidate.node ? candidate.node.val : "None"} hợp lệ và chưa visited → False`, en: `${candidate.node ? candidate.node.val : "None"} is valid and unvisited → False` },
          hlSet: new Set([node.id].concat(candidate.node ? [candidate.node.id] : [])), wordSet: new Set(visited), codeLines: [37],
          vars: [{ name: "neighbor", value: candidate.node ? candidate.node.val : "None" }, { name: "neighbor is not None", value: !!candidate.node }, { name: "neighbor not in visited", value: candidate.node ? !visited.has(candidate.node.id) : false }, { name: "condition", value: eligible }], queueOperation: eligible ? "accept neighbor" : "skip neighbor",
          note: eligible
            ? { vi: `${candidate.node.val} sẽ được đánh dấu trước khi enqueue.`, en: `${candidate.node.val} will be marked before it is enqueued.` }
            : { vi: candidate.node ? `${candidate.node.val} đã visited nên bỏ qua.` : "Neighbor là None nên bỏ qua.", en: candidate.node ? `${candidate.node.val} is already visited, so skip it.` : "The neighbor is None, so skip it." },
        });
        if (!eligible) continue;

        visited.add(candidate.node.id);
        distanceById.set(candidate.node.id, distance + 1);
        addStep({
          title: { vi: `visited.add(${candidate.node.val})`, en: `visited.add(${candidate.node.val})` },
          hlSet: new Set([node.id, candidate.node.id]), wordSet: new Set(visited), codeLines: [38],
          vars: [{ name: "visited", value: formatVisited() }, { name: "neighbor distance", value: distance + 1 }], queueOperation: "mark visited",
          note: { vi: "Đánh dấu trước khi append để node không thể vào queue lần thứ hai.", en: "Mark before appending so the node can never enter the queue twice." },
        });
        queue.push(candidate.node);
        addStep({
          title: { vi: `queue.append(${candidate.node.val})`, en: `queue.append(${candidate.node.val})` },
          hlSet: new Set([node.id, candidate.node.id]), wordSet: new Set(visited), codeLines: [39],
          vars: [{ name: "queue", value: formatQueue() }, { name: "appended layer", value: distance + 1 }], queueOperation: "append next layer", appended: candidate.node.val,
          note: { vi: `${candidate.node.val} được thêm vào cuối queue và thuộc layer d=${distance + 1}.`, en: `${candidate.node.val} is appended to the queue tail and belongs to layer d=${distance + 1}.` },
        });
      }
    }

    currentNode = null;
    inspectedNeighbor = null;
    const previousDistance = distance;
    distance += 1;
    size = null;
    addStep({
      title: { vi: `distance += 1: ${previousDistance} → ${distance}`, en: `distance += 1: ${previousDistance} → ${distance}` },
      hlSet: new Set(queue.map((node) => node.id)), wordSet: new Set(visited), codeLines: [41],
      vars: [{ name: "distance", value: distance }, { name: "queue", value: formatQueue() }], queueOperation: "advance to next layer",
      note: { vi: `Đã xử lý hết layer d=${previousDistance}; toàn bộ queue còn lại thuộc layer d=${distance}.`, en: `Layer d=${previousDistance} is complete; the entire remaining queue belongs to layer d=${distance}.` },
    });
  }

  phase = "done";
  const emptyStep = snapshot(root, {
    title: { vi: "return []", en: "return []" },
    wordSet: new Set(visited), annotations: annotations(), codeLines: [43], codeBlock: 2, queueView: makeQueueView("queue exhausted"),
    vars: [{ name: "distance", value: distance }, { name: "answer", value: "[]" }],
    note: { vi: "Cây không có node nào ở khoảng cách k.", en: "The tree has no node at distance k." },
  });
  emptyStep.distanceKView = makeDistanceKView();
  emptyStep.final = true;
  steps.push(emptyStep);
  return { input, answer: "[]", steps };
}

// ─── 156: Binary Tree Upside Down ───
function buildSteps156(input) {
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Lật ngược cây", en: "Turn the tree upside down" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "left→new root, right→new left, root→new right" }],
    note: { vi: `Đi theo nhánh TRÁI nhất. Con trái cũ thành cha mới; con phải cũ thành con trái mới; cha cũ thành con phải mới.`, en: `Follow the LEFTMOST path. Old left child becomes new parent; old right child becomes new left; old parent becomes new right.` },
  }));
  const chain = []; let c = root; while (c && c.left) { chain.push(c); c = c.left; }
  const newRootVal = c ? c.val : (root ? root.val : "null");
  chain.forEach((n) => {
    steps.push(snapshot(root, { title: { vi: `Xoay quanh ${n.val}`, en: `Rotate around ${n.val}` }, hlSet: new Set([n.id, n.left.id].concat(n.right ? [n.right.id] : [])), codeLines: [4, 5, 6], vars: [{ name: "node", value: n.val }, { name: "left (→ parent)", value: n.left.val }, { name: "right (→ new left)", value: n.right ? n.right.val : "null" }], note: { vi: `${n.left.val} thành cha; ${n.right ? n.right.val : "null"} thành con trái; ${n.val} thành con phải.`, en: `${n.left.val} becomes parent; ${n.right ? n.right.val : "null"} becomes left child; ${n.val} becomes right child.` } }));
  });
  function rec(node) { if (!node || !node.left) return node; const nr = rec(node.left); node.left.left = node.right; node.left.right = node; node.left = null; node.right = null; return nr; }
  const finalRoot = rec(root);
  const fs = snapshot(finalRoot, { title: { vi: `Gốc mới = ${finalRoot ? finalRoot.val : "null"}`, en: `New root = ${finalRoot ? finalRoot.val : "null"}` }, vars: [{ name: "answer", value: finalRoot ? finalRoot.val : "null" }], note: { vi: `Cây đã lật ngược, gốc mới = ${newRootVal}.`, en: `Tree turned upside down, new root = ${newRootVal}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: finalRoot ? finalRoot.val : "null", steps };
}

// ─── 337: House Robber III ───
function buildSteps337(input) {
  const root = parseTree(input);
  const steps = [];
  const computed = new Map(); // nodeId → { rob, skip }

  // Annotate every already-computed node with its (rob, skip) directly on the
  // tree so the DP values visibly bubble up from the leaves to the root.
  function decorate(step, currentId, sourceIds) {
    const sources = new Set(sourceIds || []);
    for (const node of step.tree.nodes) {
      if (node.isNull) continue;
      const state = computed.get(node.id);
      // Keep the circle clean (just the house value) and show the DP pair as a
      // compact label underneath so nothing overlaps inside the node.
      if (state) node.sub = `rob ${state.rob} · skip ${state.skip}`;
      if (node.id === currentId) node.hl = true;
      if (sources.has(node.id)) node.isWord = true; // reuse the green ring for source children
    }
    return step;
  }

  const intro = snapshot(root, {
    title: { vi: "House Robber III · DP trên cây", en: "House Robber III · tree DP" },
    codeLines: [2, 3],
    vars: [
      { name: "state mỗi nút", value: "(rob, skip)" },
      { name: "rob", value: "cướp nút này" },
      { name: "skip", value: "bỏ nút này" },
    ],
    note: {
      vi: "Mỗi nút trả về 2 giá trị: rob = tiền lớn nhất nếu CƯỚP nút này, skip = tiền lớn nhất nếu BỎ nút này. Vì không được cướp 2 nhà nối trực tiếp, ta tính từ lá lên gốc (postorder).",
      en: "Each node returns 2 values: rob = max money if we ROB this node, skip = max money if we SKIP it. Since two directly-linked houses cannot both be robbed, compute from leaves up to the root (postorder).",
    },
  });
  decorate(intro, null, null);
  steps.push(intro);

  function dfs(node) {
    if (!node) return [0, 0];
    const [lr, ls] = dfs(node.left);
    const [rr, rs] = dfs(node.right);
    const rob = node.val + ls + rs;
    const bestLeft = Math.max(lr, ls);
    const bestRight = Math.max(rr, rs);
    const skip = bestLeft + bestRight;
    computed.set(node.id, { rob, skip });

    const sourceIds = [];
    if (node.left) sourceIds.push(node.left.id);
    if (node.right) sourceIds.push(node.right.id);

    const step = snapshot(root, {
      title: { vi: `Nút ${node.val}: rob=${rob}, skip=${skip}`, en: `Node ${node.val}: rob=${rob}, skip=${skip}` },
      hlSet: new Set([node.id]),
      codeLines: [8, 9],
      vars: [
        { name: "node.val", value: node.val },
        { name: "rob = val + skip(L) + skip(R)", value: `${node.val} + ${ls} + ${rs} = ${rob}` },
        { name: "skip = max(L) + max(R)", value: `${bestLeft} + ${bestRight} = ${skip}` },
        { name: "trả về (rob, skip)", value: `(${rob}, ${skip})` },
      ],
      note: {
        vi: `CƯỚP ${node.val}: bắt buộc bỏ 2 con → ${node.val} + skip(trái)=${ls} + skip(phải)=${rs} = ${rob}. BỎ ${node.val}: mỗi con tự do chọn tốt hơn → max(trái)=${bestLeft} + max(phải)=${bestRight} = ${skip}.`,
        en: `ROB ${node.val}: must skip both children → ${node.val} + skip(left)=${ls} + skip(right)=${rs} = ${rob}. SKIP ${node.val}: each child picks its own best → max(left)=${bestLeft} + max(right)=${bestRight} = ${skip}.`,
      },
    });
    decorate(step, node.id, sourceIds);
    steps.push(step);
    return [rob, skip];
  }

  const [r, s] = dfs(root);
  const answer = Math.max(r, s);
  const finalStep = snapshot(root, {
    title: { vi: `Đáp án = max(${r}, ${s}) = ${answer}`, en: `Answer = max(${r}, ${s}) = ${answer}` },
    hlSet: root ? new Set([root.id]) : undefined,
    codeLines: [11],
    vars: [
      { name: "root rob", value: r },
      { name: "root skip", value: s },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Tại gốc, lấy phương án tốt hơn: max(rob=${r}, skip=${s}) = ${answer}. Đây là số tiền lớn nhất cướp được.`,
      en: `At the root, take the better option: max(rob=${r}, skip=${s}) = ${answer}. This is the maximum money that can be robbed.`,
    },
  });
  decorate(finalStep, root ? root.id : null, null);
  finalStep.final = true;
  steps.push(finalStep);
  return { input, answer, steps };
}

// ─── 116: Populating Next Right Pointers in Each Node ───
function buildSteps116(input) {
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Nối con trỏ next mỗi tầng", en: "Populate next pointers per level" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "next = node to the right, else null" }],
    note: { vi: `Mỗi nút có con trỏ next trỏ tới nút bên PHẢI cùng tầng; nút phải nhất → null. Duyệt BFS theo tầng để nối.`, en: `Each node's next points to the node to its RIGHT on the same level; rightmost → null. BFS by level to connect.` },
  }));
  const chains = [];
  if (root) {
    let queue = [root]; const visited = new Set(); let lvl = 0;
    while (queue.length) {
      const chainStr = queue.map((n) => n.val).join(" → ") + " → null";
      chains.push(chainStr); queue.forEach((n) => visited.add(n.id));
      steps.push(snapshot(root, { title: { vi: `Tầng ${lvl}: ${chainStr}`, en: `Level ${lvl}: ${chainStr}` }, hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [4, 5, 6], vars: [{ name: "level", value: lvl }, { name: "next chain", value: chainStr }], note: { vi: `Nối next lần lượt các nút tầng ${lvl} từ trái sang phải, cuối cùng → null.`, en: `Link next across level ${lvl} nodes left to right, last → null.` } }));
      const next = []; for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); } queue = next; lvl++;
    }
  }
  const fs = snapshot(root, { title: { vi: `Hoàn tất`, en: `Done` }, vars: [{ name: "answer", value: "next pointers set" }], note: { vi: `Đã nối next cho mọi tầng:\n${chains.join("\n")}`, en: `next pointers set for all levels:\n${chains.join("\n")}` } }); fs.final = true; steps.push(fs);
  return { input, answer: chains.join(" | "), steps };
}

// ─── 103: Binary Tree Zigzag Level Order Traversal ───
function buildSteps103(input) {
  const root = parseTree(input); const steps = []; const result = [];
  steps.push(snapshot(root, {
    title: { vi: "Zigzag Level Order", en: "Zigzag Level Order" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "alternate L→R, R→L" }],
    note: { vi: `BFS theo tầng, nhưng ĐẢO chiều xen kẽ: tầng 0 trái→phải, tầng 1 phải→trái, tầng 2 trái→phải...`, en: `BFS by level, but ALTERNATE direction: level 0 left→right, level 1 right→left, level 2 left→right...` },
  }));
  if (root) {
    let queue = [root]; const visited = new Set(); let lvl = 0;
    while (queue.length) {
      const vals = queue.map((n) => n.val);
      const ordered = lvl % 2 === 0 ? vals.slice() : vals.slice().reverse();
      result.push(ordered); queue.forEach((n) => visited.add(n.id));
      steps.push(snapshot(root, { title: { vi: `Tầng ${lvl} (${lvl % 2 === 0 ? "→" : "←"}): [${ordered.join(",")}]`, en: `Level ${lvl} (${lvl % 2 === 0 ? "→" : "←"}): [${ordered.join(",")}]` }, hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [4, 5, 6], vars: [{ name: "level", value: lvl }, { name: "direction", value: lvl % 2 === 0 ? "left→right" : "right→left" }, { name: "row", value: `[${ordered.join(",")}]` }], note: { vi: `Tầng ${lvl} đọc theo chiều ${lvl % 2 === 0 ? "trái→phải" : "phải→trái"}.`, en: `Level ${lvl} read ${lvl % 2 === 0 ? "left→right" : "right→left"}.` } }));
      const next = []; for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); } queue = next; lvl++;
    }
  }
  const fs = snapshot(root, { title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` }, vars: [{ name: "answer", value: JSON.stringify(result) }], note: { vi: `Zigzag hoàn tất.`, en: `Zigzag complete.` } }); fs.final = true; steps.push(fs);
  return { input, answer: JSON.stringify(result), steps };
}

// ─── 103 Approach 2: deque + level%2, fully line-by-line ───
function buildSteps103v2(input) {
  const root = parseTree(input);
  const steps = [];
  const result = [];
  // Declared early so snap() can always report the queue, even for the
  // very first steps (before "queue = deque()" has run, it's just "n/a").
  let queue = null;

  function snap(opts) {
    const vars = [...(opts.vars || [])];
    const hasQueueVar = vars.some((v) => v.name === "queue");
    if (!hasQueueVar) {
      vars.push({ name: "queue", value: queue === null ? "n/a (not created yet)" : `[${queue.map((n) => n.val).join(", ")}]` });
    }
    steps.push(snapshot(root, Object.assign({}, opts, { vars, codeBlock: 2 })));
  }

  // Line 3: if not root:
  const hasRoot = !!root;
  snap({
    title: { vi: `if not root → ${!hasRoot}`, en: `if not root → ${!hasRoot}` },
    codeLines: [3],
    vars: [{ name: "root", value: hasRoot ? root.val : "None" }],
    note: hasRoot
      ? { vi: "root tồn tại → not root = False, bỏ qua return sớm.", en: "root exists → not root = False, skip the early return." }
      : { vi: "root = None → not root = True, sẽ return [] ngay.", en: "root = None → not root = True, will return [] immediately." },
  });

  if (!hasRoot) {
    // Line 4: return []
    const fs0 = snapshot(root, {
      title: { vi: "return []", en: "return []" },
      codeLines: [4],
      codeBlock: 2,
      vars: [{ name: "answer", value: "[]" }, { name: "queue", value: "n/a (not created yet)" }],
      note: {
        vi: "Cây rỗng → trả về [] ngay, không cần BFS.",
        en: "Empty tree → return [] immediately, no BFS needed.",
      },
    });
    fs0.final = true;
    steps.push(fs0);
    return { input, answer: "[]", steps };
  }

  // Line 5: queue = collections.deque()
  queue = [];
  snap({
    title: { vi: "queue = collections.deque()", en: "queue = collections.deque()" },
    codeLines: [5],
    vars: [{ name: "queue", value: "[]" }],
    note: {
      vi: "Tạo queue rỗng để BFS theo tầng.",
      en: "Create an empty queue for level-by-level BFS.",
    },
  });

  // Line 6: queue.append(root)
  queue.push(root);
  snap({
    title: { vi: `queue.append(root) → queue=[${root.val}]`, en: `queue.append(root) → queue=[${root.val}]` },
    hlSet: new Set([root.id]),
    codeLines: [6],
    vars: [{ name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }],
    note: {
      vi: `Đẩy root=${root.val} vào queue. queue = [${queue.map((n) => n.val).join(", ")}].`,
      en: `Push root=${root.val} into the queue. queue = [${queue.map((n) => n.val).join(", ")}].`,
    },
  });

  // Line 7: level = 0
  let level = 0;
  snap({
    title: { vi: "level = 0", en: "level = 0" },
    hlSet: new Set(queue.map((n) => n.id)),
    codeLines: [7],
    vars: [{ name: "level", value: level }, { name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }],
    note: {
      vi: "level đếm số tầng đã xử lý — dùng để quyết định chiều đọc (chẵn: trái→phải, lẻ: phải→trái).",
      en: "level counts processed levels — used to decide the reading direction (even: left→right, odd: right→left).",
    },
  });

  // Line 8: result = []
  snap({
    title: { vi: "result = []", en: "result = []" },
    hlSet: new Set(queue.map((n) => n.id)),
    codeLines: [8],
    vars: [{ name: "result", value: "[]" }],
    note: {
      vi: "result sẽ chứa danh sách các tầng, mỗi tầng là 1 list giá trị.",
      en: "result will hold the list of levels, each level being a list of values.",
    },
  });

  const visited = new Set();

  while (queue.length > 0) {
    // Line 9: while queue:
    snap({
      title: { vi: `while queue → True (queue=[${queue.map((n) => n.val).join(", ")}])`, en: `while queue → True (queue=[${queue.map((n) => n.val).join(", ")}])` },
      hlSet: new Set(queue.map((n) => n.id)),
      wordSet: new Set(visited),
      codeLines: [9],
      vars: [{ name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }, { name: "level", value: level }],
      note: {
        vi: "queue không rỗng → còn tầng để xử lý.",
        en: "queue is not empty → there is still a level to process.",
      },
    });

    // Line 10: size = len(queue)
    const size = queue.length;
    snap({
      title: { vi: `size = len(queue) = ${size}`, en: `size = len(queue) = ${size}` },
      hlSet: new Set(queue.map((n) => n.id)),
      wordSet: new Set(visited),
      codeLines: [10],
      vars: [{ name: "size", value: size }],
      note: {
        vi: `size = ${size} — chốt số node CỦA TẦNG NÀY trước khi bắt đầu thêm node tầng sau vào queue.`,
        en: `size = ${size} — lock in how many nodes belong to THIS level before next-level nodes get appended.`,
      },
    });

    // Line 11: lst = []
    const lst = [];
    snap({
      title: { vi: "lst = []", en: "lst = []" },
      hlSet: new Set(queue.map((n) => n.id)),
      wordSet: new Set(visited),
      codeLines: [11],
      vars: [{ name: "lst", value: "[]" }],
      note: {
        vi: "lst sẽ chứa giá trị các node của tầng hiện tại, theo thứ tự trái→phải (chưa đảo).",
        en: "lst will hold this level's node values, in left→right order (not yet reversed).",
      },
    });

    for (let i = 0; i < size; i++) {
      // Line 12: for _ in range(size):
      snap({
        title: { vi: `for _=${i} (range(${size}))`, en: `for _=${i} (range(${size}))` },
        hlSet: new Set(queue.map((n) => n.id)),
        wordSet: new Set(visited),
        codeLines: [12],
        vars: [{ name: "iteration", value: `${i + 1}/${size}` }, { name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }],
        note: {
          vi: `Vòng lặp thứ ${i + 1}/${size} để xử lý đúng ${size} node của tầng này.`,
          en: `Iteration ${i + 1}/${size} to process exactly ${size} nodes of this level.`,
        },
      });

      // Line 13: node = queue.popleft()
      const node = queue.shift();
      visited.add(node.id);
      snap({
        title: { vi: `node = queue.popleft() → node=${node.val}`, en: `node = queue.popleft() → node=${node.val}` },
        hlSet: new Set([node.id]),
        wordSet: new Set(visited),
        codeLines: [13],
        vars: [{ name: "node", value: node.val }, { name: "queue (after pop)", value: `[${queue.map((n) => n.val).join(", ")}]` }],
        note: {
          vi: `Lấy node đầu queue: ${node.val}. queue còn lại = [${queue.map((n) => n.val).join(", ")}].`,
          en: `Pop the front of the queue: ${node.val}. Remaining queue = [${queue.map((n) => n.val).join(", ")}].`,
        },
      });

      // Line 14: lst.append(node.val)
      lst.push(node.val);
      snap({
        title: { vi: `lst.append(${node.val}) → lst=[${lst.join(", ")}]`, en: `lst.append(${node.val}) → lst=[${lst.join(", ")}]` },
        hlSet: new Set([node.id]),
        wordSet: new Set(visited),
        codeLines: [14],
        vars: [{ name: "lst", value: `[${lst.join(", ")}]` }],
        note: {
          vi: `Thêm giá trị ${node.val} vào lst. lst = [${lst.join(", ")}].`,
          en: `Add value ${node.val} to lst. lst = [${lst.join(", ")}].`,
        },
      });

      // Line 15: if node.left:
      const hasLeft = !!node.left;
      snap({
        title: { vi: `if node.left → ${hasLeft}`, en: `if node.left → ${hasLeft}` },
        hlSet: new Set([node.id]),
        wordSet: new Set(visited),
        codeLines: [15],
        vars: [{ name: "node.left", value: hasLeft ? node.left.val : "None" }],
        note: hasLeft
          ? { vi: `node.left = ${node.left.val} → sẽ thêm vào queue.`, en: `node.left = ${node.left.val} → will be added to the queue.` }
          : { vi: "node.left = None → không có gì để thêm.", en: "node.left = None → nothing to add." },
      });

      if (hasLeft) {
        // Line 16: queue.append(node.left)
        queue.push(node.left);
        snap({
          title: { vi: `queue.append(node.left) → queue=[${queue.map((n) => n.val).join(", ")}]`, en: `queue.append(node.left) → queue=[${queue.map((n) => n.val).join(", ")}]` },
          hlSet: new Set([node.left.id]),
          wordSet: new Set(visited),
          codeLines: [16],
          vars: [{ name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }],
          note: {
            vi: `Đẩy con trái (${node.left.val}) vào queue cho tầng kế tiếp.`,
            en: `Push the left child (${node.left.val}) into the queue for the next level.`,
          },
        });
      }

      // Line 17: if node.right:
      const hasRight = !!node.right;
      snap({
        title: { vi: `if node.right → ${hasRight}`, en: `if node.right → ${hasRight}` },
        hlSet: new Set([node.id]),
        wordSet: new Set(visited),
        codeLines: [17],
        vars: [{ name: "node.right", value: hasRight ? node.right.val : "None" }],
        note: hasRight
          ? { vi: `node.right = ${node.right.val} → sẽ thêm vào queue.`, en: `node.right = ${node.right.val} → will be added to the queue.` }
          : { vi: "node.right = None → không có gì để thêm.", en: "node.right = None → nothing to add." },
      });

      if (hasRight) {
        // Line 18: queue.append(node.right)
        queue.push(node.right);
        snap({
          title: { vi: `queue.append(node.right) → queue=[${queue.map((n) => n.val).join(", ")}]`, en: `queue.append(node.right) → queue=[${queue.map((n) => n.val).join(", ")}]` },
          hlSet: new Set([node.right.id]),
          wordSet: new Set(visited),
          codeLines: [18],
          vars: [{ name: "queue", value: `[${queue.map((n) => n.val).join(", ")}]` }],
          note: {
            vi: `Đẩy con phải (${node.right.val}) vào queue cho tầng kế tiếp.`,
            en: `Push the right child (${node.right.val}) into the queue for the next level.`,
          },
        });
      }
    }

    // Line 19: if level % 2 == 0:
    const evenLevel = level % 2 === 0;
    snap({
      title: { vi: `if level % 2 == 0 → ${evenLevel} (level=${level})`, en: `if level % 2 == 0 → ${evenLevel} (level=${level})` },
      hlSet: new Set(queue.map((n) => n.id)),
      wordSet: new Set(visited),
      codeLines: [19],
      vars: [{ name: "level", value: level }, { name: "level % 2", value: level % 2 }, { name: "lst", value: `[${lst.join(", ")}]` }],
      note: evenLevel
        ? { vi: `level=${level} chẵn → giữ nguyên thứ tự trái→phải.`, en: `level=${level} is even → keep left→right order.` }
        : { vi: `level=${level} lẻ → cần đảo ngược lst.`, en: `level=${level} is odd → lst needs to be reversed.` },
    });

    if (evenLevel) {
      // Line 20: result.append(lst)
      result.push([...lst]);
      snap({
        title: { vi: `result.append(lst) → +[${lst.join(", ")}]`, en: `result.append(lst) → +[${lst.join(", ")}]` },
        hlSet: new Set(queue.map((n) => n.id)),
        wordSet: new Set(visited),
        codeLines: [20],
        vars: [{ name: "result", value: JSON.stringify(result) }],
        note: {
          vi: `Thêm lst (giữ nguyên chiều) vào result. result = ${JSON.stringify(result)}.`,
          en: `Append lst (unchanged direction) to result. result = ${JSON.stringify(result)}.`,
        },
      });
    } else {
      // Line 22: result.append(lst[::-1])
      const reversed = [...lst].reverse();
      result.push(reversed);
      snap({
        title: { vi: `result.append(lst[::-1]) → +[${reversed.join(", ")}]`, en: `result.append(lst[::-1]) → +[${reversed.join(", ")}]` },
        hlSet: new Set(queue.map((n) => n.id)),
        wordSet: new Set(visited),
        codeLines: [22],
        vars: [{ name: "lst[::-1]", value: `[${reversed.join(", ")}]` }, { name: "result", value: JSON.stringify(result) }],
        note: {
          vi: `Đảo ngược lst thành [${reversed.join(", ")}] rồi thêm vào result. result = ${JSON.stringify(result)}.`,
          en: `Reverse lst to [${reversed.join(", ")}] then append to result. result = ${JSON.stringify(result)}.`,
        },
      });
    }

    // Line 23: level += 1
    const oldLevel = level;
    level++;
    snap({
      title: { vi: `level += 1 → level=${level}`, en: `level += 1 → level=${level}` },
      hlSet: new Set(queue.map((n) => n.id)),
      wordSet: new Set(visited),
      codeLines: [23],
      vars: [{ name: "level (before)", value: oldLevel }, { name: "level (after)", value: level }],
      note: {
        vi: `Chuyển sang tầng kế tiếp: level = ${level}.`,
        en: `Move to the next level: level = ${level}.`,
      },
    });
  }

  // Final while check → False
  snap({
    title: { vi: "while queue → False", en: "while queue → False" },
    wordSet: new Set(visited),
    codeLines: [9],
    vars: [{ name: "queue", value: "[]" }],
    note: {
      vi: "queue rỗng → đã xử lý hết mọi tầng. Thoát vòng lặp.",
      en: "queue is empty → every level has been processed. Exit the loop.",
    },
  });

  // Line 24: return result
  const answer = JSON.stringify(result);
  const fs = snapshot(root, {
    title: { vi: `return result = ${answer}`, en: `return result = ${answer}` },
    wordSet: new Set(visited),
    codeLines: [24],
    codeBlock: 2,
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Kết quả zigzag cuối cùng: ${answer}.`,
      en: `Final zigzag result: ${answer}.`,
    },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer, steps };
}

// ─── 314: Binary Tree Vertical Order Traversal ───
function buildSteps314(input) {
  const root = parseTree(input); const steps = []; const colMap = new Map();
  steps.push(snapshot(root, {
    title: { vi: "Duyệt theo cột dọc", en: "Vertical order traversal" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "col: root=0, left=-1, right=+1" }],
    note: { vi: `Gán mỗi nút 1 CỘT: gốc = 0, đi trái → cột-1, đi phải → cột+1. BFS để giữ thứ tự trên→dưới, trái→phải. Gom theo cột tăng dần.`, en: `Assign each node a COLUMN: root = 0, go left → col-1, go right → col+1. BFS to keep top→bottom, left→right order. Group by ascending column.` },
  }));
  if (root) {
    let queue = [{ node: root, col: 0 }]; const visited = new Set();
    while (queue.length) {
      const { node, col } = queue.shift();
      if (!colMap.has(col)) colMap.set(col, []);
      colMap.get(col).push(node.val); visited.add(node.id);
      const cols = [...colMap.keys()].sort((a, b) => a - b);
      steps.push(snapshot(root, { title: { vi: `Nút ${node.val} → cột ${col}`, en: `Node ${node.val} → column ${col}` }, hlSet: new Set([node.id]), wordSet: new Set(visited), codeLines: [4, 5, 6], vars: [{ name: "node", value: node.val }, { name: "column", value: col }, { name: "columns", value: JSON.stringify(cols.map((c) => colMap.get(c))) }], note: { vi: `Thêm ${node.val} vào cột ${col}. Con trái → cột ${col - 1}, con phải → cột ${col + 1}.`, en: `Add ${node.val} to column ${col}. Left child → col ${col - 1}, right child → col ${col + 1}.` } }));
      if (node.left) queue.push({ node: node.left, col: col - 1 });
      if (node.right) queue.push({ node: node.right, col: col + 1 });
    }
  }
  const sortedCols = [...colMap.keys()].sort((a, b) => a - b);
  const result = sortedCols.map((c) => colMap.get(c));
  const fs = snapshot(root, { title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` }, vars: [{ name: "answer", value: JSON.stringify(result) }], note: { vi: `Đọc các cột từ trái sang phải.`, en: `Read columns left to right.` } }); fs.final = true; steps.push(fs);
  return { input, answer: JSON.stringify(result), steps };
}

// ─── 297: Serialize and Deserialize Binary Tree ───
function buildSteps297(input) {
  const root = parseTree(input); const steps = []; const tokens = [];
  steps.push(snapshot(root, {
    title: { vi: "Serialize (preorder + null)", en: "Serialize (preorder + null)" },
    codeLines: [2, 3], vars: [{ name: "result", value: "" }],
    note: { vi: `SERIALIZE: duyệt preorder, ghi giá trị nút, ghi '#' cho null. Chuỗi này đủ để khôi phục cây.`, en: `SERIALIZE: preorder traversal, write node value, write '#' for null. This string is enough to rebuild the tree.` },
  }));
  function ser(node) {
    if (!node) {
      tokens.push("#");
      steps.push(snapshot(root, { title: { vi: `null → '#'`, en: `null → '#'` }, codeLines: [4, 5], vars: [{ name: "serialized", value: tokens.join(",") }], note: { vi: `Gặp null → ghi '#'.`, en: `Reached null → write '#'.` } }));
      return;
    }
    tokens.push(String(node.val));
    steps.push(snapshot(root, { title: { vi: `Ghi ${node.val}`, en: `Write ${node.val}` }, hlSet: new Set([node.id]), codeLines: [6, 7], vars: [{ name: "node", value: node.val }, { name: "serialized", value: tokens.join(",") }], note: { vi: `Ghi giá trị ${node.val}, rồi đệ quy con trái → con phải.`, en: `Write value ${node.val}, then recurse left → right.` } }));
    ser(node.left); ser(node.right);
  }
  ser(root);
  const serialized = tokens.join(",");
  const fs = snapshot(root, { title: { vi: `Chuỗi: ${serialized}`, en: `String: ${serialized}` }, vars: [{ name: "answer", value: serialized }], note: { vi: `DESERIALIZE: đọc token theo thứ tự; '#' → null, số → tạo nút rồi đệ quy dựng con trái, con phải. Khôi phục lại đúng cây ban đầu.`, en: `DESERIALIZE: read tokens in order; '#' → null, number → create node then recursively build left, right. Rebuilds the exact original tree.` } }); fs.final = true; steps.push(fs);
  return { input, answer: serialized, steps };
}

// ─── 987: Vertical Order Traversal of a Binary Tree ───
// Difference from 314: within the same (col, row), nodes are ordered by VALUE.
function buildSteps987(input) {
  const root = parseTree(input);
  const steps = [];
  // gather (col, row, val, id)
  const entries = [];
  (function dfs(node, row, col) {
    if (!node) return;
    entries.push({ row, col, val: node.val, id: node.id });
    dfs(node.left, row + 1, col - 1);
    dfs(node.right, row + 1, col + 1);
  })(root, 0, 0);

  const colsMap = () => {
    const m = {};
    for (const e of entries) {
      if (!(e.col in m)) m[e.col] = [];
      m[e.col].push(e);
    }
    return m;
  };
  const summaryStr = () => {
    const m = colsMap();
    return Object.keys(m).map(Number).sort((a, b) => a - b)
      .map((c) => `col${c}:[${m[c].map((e) => e.val).join(",")}]`).join("  ");
  };

  steps.push(snapshot(root, {
    title: { vi: "Gán (hàng, cột) cho mỗi nút", en: "Assign (row, col) to each node" },
    codeLines: [3, 4],
    vars: [{ name: "root col", value: 0 }],
    note: {
      vi:
        "Gốc ở cột 0, con trái cột-1, con phải cột+1; hàng tăng dần khi xuống.\n" +
        "Gom theo cột (trái→phải). Trong cùng cột: sắp theo HÀNG, và nếu CÙNG hàng thì theo GIÁ TRỊ tăng dần (đây là điểm khác 314).",
      en:
        "Root at col 0, left child col-1, right child col+1; row increases going down.\n" +
        "Group by column (left→right). Within a column: sort by ROW, and if SAME row, by VALUE ascending (this is the difference from 314).",
    },
  }));

  // Show assignment per node in DFS order
  const assigned = [];
  for (const e of entries) {
    assigned.push(e);
    steps.push(snapshot(root, {
      title: { vi: `Nút ${e.val}: (hàng ${e.row}, cột ${e.col})`, en: `Node ${e.val}: (row ${e.row}, col ${e.col})` },
      hlSet: new Set([e.id]),
      codeLines: [5, 6, 7],
      vars: [
        { name: "node", value: e.val },
        { name: "row", value: e.row },
        { name: "col", value: e.col },
      ],
      note: {
        vi: `Nút ${e.val} có vị trí (hàng=${e.row}, cột=${e.col}). Lưu vào nhóm cột ${e.col}.`,
        en: `Node ${e.val} is at (row=${e.row}, col=${e.col}). Add it to column ${e.col}'s group.`,
      },
    }));
  }

  // Sort within columns and build result
  const m = colsMap();
  const sortedCols = Object.keys(m).map(Number).sort((a, b) => a - b);
  const result = [];
  for (const c of sortedCols) {
    const group = [...m[c]].sort((a, b) => (a.row - b.row) || (a.val - b.val));
    const vals = group.map((e) => e.val);
    result.push(vals);
    steps.push(snapshot(root, {
      title: { vi: `Cột ${c} → [${vals.join(", ")}]`, en: `Column ${c} → [${vals.join(", ")}]` },
      hlSet: new Set(group.map((e) => e.id)),
      codeLines: [8, 9],
      vars: [
        { name: "column", value: c },
        { name: "sorted (row, value)", value: `[${vals.join(", ")}]` },
        { name: "result so far", value: JSON.stringify(result) },
      ],
      note: {
        vi: `Sắp các nút cột ${c} theo (hàng, giá trị): [${vals.join(", ")}].`,
        en: `Sort column ${c}'s nodes by (row, value): [${vals.join(", ")}].`,
      },
    }));
  }

  const fs = snapshot(root, {
    title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` },
    codeLines: [10],
    vars: [{ name: "answer", value: JSON.stringify(result) }],
    note: {
      vi: `Duyệt theo cột dọc (tie-break bằng giá trị): ${JSON.stringify(result)}. Tổng cột: ${summaryStr()}.`,
      en: `Vertical order traversal (value tie-break): ${JSON.stringify(result)}. Columns: ${summaryStr()}.`,
    },
  });
  fs.final = true;
  steps.push(fs);

  return { input, answer: result, steps };
}

// ─── 110: Balanced Binary Tree ───
function buildSteps110(input) {
  const root = parseTree(input);
  const steps = [];
  let answer = true;
  function height(node) {
    if (!node) return 0;
    const lh = height(node.left);
    if (lh === -1) return -1;
    const rh = height(node.right);
    if (rh === -1) return -1;
    const bal = Math.abs(lh - rh) <= 1;
    if (!bal) {
      answer = false;
      steps.push(snapshot(root, { title: { vi: `Node ${node.val}: |${lh}-${rh}|>1 → mất cân bằng`, en: `Node ${node.val}: |${lh}-${rh}|>1 → unbalanced` }, hlSet: new Set([node.id]), codeLines: [8, 9], vars: [{ name: "node", value: node.val }, { name: "leftH", value: lh }, { name: "rightH", value: rh }], note: { vi: `Chênh lệch chiều cao 2 cây con > 1 → cây KHÔNG cân bằng.`, en: `Height difference of the two subtrees > 1 → tree is NOT balanced.` } }));
      return -1;
    }
    steps.push(snapshot(root, { title: { vi: `Node ${node.val}: height=${1 + Math.max(lh, rh)} (|${lh}-${rh}|≤1)`, en: `Node ${node.val}: height=${1 + Math.max(lh, rh)} (|${lh}-${rh}|≤1)` }, hlSet: new Set([node.id]), codeLines: [4, 5, 6, 7, 10], vars: [{ name: "node", value: node.val }, { name: "leftH", value: lh }, { name: "rightH", value: rh }, { name: "height", value: 1 + Math.max(lh, rh) }], note: { vi: `Cây con cân bằng. Chiều cao = 1 + max(${lh},${rh}) = ${1 + Math.max(lh, rh)}.`, en: `Subtree balanced. Height = 1 + max(${lh},${rh}) = ${1 + Math.max(lh, rh)}.` } }));
    return 1 + Math.max(lh, rh);
  }
  steps.push(snapshot(root, { title: { vi: "Kiểm tra cân bằng (post-order)", en: "Check balance (post-order)" }, codeLines: [3], vars: [], note: { vi: "Tính chiều cao mỗi cây con; trả -1 nếu mất cân bằng. |leftH - rightH| ≤ 1 tại mọi node.", en: "Compute each subtree height; return -1 if unbalanced. |leftH - rightH| ≤ 1 at every node." } }));
  height(root);
  const fs = snapshot(root, { title: { vi: `Đáp án: ${answer}`, en: `Answer: ${answer}` }, codeLines: [11], vars: [{ name: "answer", value: answer }], note: { vi: answer ? "Mọi node đều cân bằng → True." : "Có node mất cân bằng → False.", en: answer ? "Every node is balanced → True." : "A node is unbalanced → False." } });
  fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 113: Path Sum II ───
function buildSteps113(input, params) {
  const root = parseTree(input);
  const target = params && params.target !== undefined ? Number(params.target) : 22;
  const steps = [];
  const result = [];
  function dfs(node, remaining, path) {
    if (!node) return;
    path.push(node.val);
    remaining -= node.val;
    const leaf = !node.left && !node.right;
    if (leaf && remaining === 0) {
      result.push([...path]);
      steps.push(snapshot(root, { title: { vi: `Lá ${node.val}, tổng khớp → lưu [${path.join(",")}]`, en: `Leaf ${node.val}, sum matches → save [${path.join(",")}]` }, hlSet: new Set([node.id]), codeLines: [6, 7], vars: [{ name: "path", value: `[${path.join(",")}]` }, { name: "result", value: JSON.stringify(result) }], note: { vi: `Đến lá và tổng còn lại = 0 → đường đi hợp lệ.`, en: `Reached a leaf with remaining sum 0 → valid path.` } }));
    } else {
      steps.push(snapshot(root, { title: { vi: `Node ${node.val}: còn thiếu ${remaining}`, en: `Node ${node.val}: remaining ${remaining}` }, hlSet: new Set([node.id]), codeLines: [4, 5, 8, 9], vars: [{ name: "node", value: node.val }, { name: "remaining", value: remaining }, { name: "path", value: `[${path.join(",")}]` }], note: { vi: `Trừ ${node.val} khỏi target. Đệ quy con trái/phải.`, en: `Subtract ${node.val} from target. Recurse left/right.` } }));
      dfs(node.left, remaining, path);
      dfs(node.right, remaining, path);
    }
    path.pop();
  }
  steps.push(snapshot(root, { title: { vi: `Tìm đường root→lá có tổng = ${target}`, en: `Find root→leaf paths summing to ${target}` }, codeLines: [3], vars: [{ name: "target", value: target }], note: { vi: "DFS backtracking: cộng dồn giá trị, khi tới lá và tổng khớp thì lưu đường đi.", en: "Backtracking DFS: accumulate values; at a leaf whose sum matches, save the path." } }));
  dfs(root, target, []);
  const fs = snapshot(root, { title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` }, codeLines: [10], vars: [{ name: "answer", value: JSON.stringify(result) }], note: { vi: `Mọi đường root→lá có tổng = ${target}.`, en: `All root→leaf paths summing to ${target}.` } });
  fs.final = true; steps.push(fs);
  return { input, answer: result, steps };
}

// ─── 111: Minimum Depth of Binary Tree ───
function buildSteps111(input) {
  const root = parseTree(input);
  const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Độ sâu nhỏ nhất của cây", en: "Minimum depth of binary tree" },
    codeLines: [2, 3],
    vars: [{ name: "rule", value: "depth = 1 + min(left, right) if both exist" }],
    note: {
      vi: `Tìm đường NGẮN NHẤT từ gốc xuống lá. Lưu ý: nếu node CHỈ có 1 con, không được lấy min với 0 (vì phía null không phải lá).`,
      en: `Find the SHORTEST path from root to leaf. Note: if a node has ONLY one child, don't min with 0 (the null side is not a leaf).`,
    },
  }));
  let answer = 0;
  function dfs(node) {
    if (!node) return 0;
    const l = dfs(node.left);
    const r = dfs(node.right);
    let d;
    if (l === 0 && r === 0) {
      d = 1; // leaf node
    } else if (l === 0) {
      d = 1 + r; // only right child exists
    } else if (r === 0) {
      d = 1 + l; // only left child exists
    } else {
      d = 1 + Math.min(l, r); // both children exist
    }
    const reason = (l === 0 && r === 0)
      ? { vi: `Lá → depth = 1.`, en: `Leaf → depth = 1.` }
      : (l === 0)
        ? { vi: `Chỉ có con phải (depth ${r}), bỏ qua null trái → depth = 1 + ${r} = ${d}.`, en: `Only right child (depth ${r}), skip null left → depth = 1 + ${r} = ${d}.` }
        : (r === 0)
          ? { vi: `Chỉ có con trái (depth ${l}), bỏ qua null phải → depth = 1 + ${l} = ${d}.`, en: `Only left child (depth ${l}), skip null right → depth = 1 + ${l} = ${d}.` }
          : { vi: `Hai con: depth = 1 + min(${l}, ${r}) = ${d}.`, en: `Both children: depth = 1 + min(${l}, ${r}) = ${d}.` };
    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: minDepth = ${d}`, en: `Node ${node.val}: minDepth = ${d}` },
      hlSet: new Set([node.id]),
      codeLines: [4, 5, 6, 7],
      vars: [
        { name: "node", value: node.val },
        { name: "left depth", value: l },
        { name: "right depth", value: r },
        { name: "minDepth", value: d },
      ],
      note: reason,
    }));
    return d;
  }
  const ans = dfs(root);
  answer = ans;
  const fs = snapshot(root, {
    title: { vi: `Min depth = ${answer}`, en: `Min depth = ${answer}` },
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: `Độ sâu nhỏ nhất (đường ngắn nhất gốc→lá) = ${answer}.`,
      en: `Minimum depth (shortest root→leaf path) = ${answer}.`,
    },
  });
  fs.final = true;
  steps.push(fs);
  return { input, answer, steps };
}

/**
 * LeetCode 114: Flatten Binary Tree to Linked List.
 * Iteratively splice each left subtree between the current node and its
 * original right subtree. The result follows preorder through right pointers.
 */
function buildSteps114(input) {
  const root = parseTree(input);
  const steps = [];

  function chainIds() {
    const ids = new Set();
    let node = root;
    while (node) {
      ids.add(node.id);
      node = node.right;
    }
    return ids;
  }

  function snap(opts) {
    const annotations = {};
    if (opts.cur) annotations[opts.cur.id] = { label: "cur", kind: "current" };
    if (opts.predecessor) annotations[opts.predecessor.id] = { label: "pred", kind: "predecessor" };
    const step = snapshot(root, {
      title: opts.title,
      hlSet: new Set([opts.cur, opts.predecessor].filter(Boolean).map((node) => node.id)),
      wordSet: opts.wordSet || chainIds(),
      annotations,
      nullChildren: opts.nullChildren || [],
      codeLines: opts.codeLines,
      vars: opts.vars || [],
      note: opts.note,
    });
    if (opts.final) step.final = true;
    steps.push(step);
  }

  if (!root) {
    snap({
      title: { vi: "Cây rỗng → không cần thay đổi", en: "Empty tree → no changes needed" },
      codeLines: [2], final: true,
      vars: [{ name: "root", value: "None" }],
      note: { vi: "Không có node để flatten.", en: "There is no node to flatten." },
    });
    return { input, answer: [], steps };
  }

  let cur = root;
  snap({
    title: { vi: `cur = root (${cur.val})`, en: `cur = root (${cur.val})` },
    codeLines: [3], cur,
    vars: [{ name: "cur", value: cur.val }],
    note: { vi: "Bắt đầu tại root. Chuỗi kết quả cuối cùng sẽ đi qua các con trỏ right theo preorder.", en: "Start at root. The final chain follows right pointers in preorder." },
  });

  while (cur) {
    snap({
      title: { vi: `while cur: cur = ${cur.val}`, en: `while cur: cur = ${cur.val}` },
      codeLines: [4], cur,
      vars: [{ name: "cur", value: cur.val }],
      note: { vi: "cur tồn tại, xử lý node này.", en: "cur exists, so process this node." },
    });

    const hasLeft = Boolean(cur.left);
    snap({
      title: { vi: `if cur.left → ${hasLeft}`, en: `if cur.left → ${hasLeft}` },
      codeLines: [5], cur,
      vars: [{ name: "cur.left", value: hasLeft ? cur.left.val : "None" }],
      note: hasLeft
        ? { vi: `Có cây con trái bắt đầu tại ${cur.left.val}; cần chèn nó sau cur.`, en: `A left subtree starts at ${cur.left.val}; splice it after cur.` }
        : { vi: "Không có cây con trái, liên kết right hiện tại đã đúng; chỉ cần tiến cur.", en: "There is no left subtree, so the current right link is already correct; advance cur." },
    });

    if (hasLeft) {
      let predecessor = cur.left;
      snap({
        title: { vi: `predecessor = cur.left → ${predecessor.val}`, en: `predecessor = cur.left → ${predecessor.val}` },
        codeLines: [6], cur, predecessor,
        vars: [{ name: "cur", value: cur.val }, { name: "predecessor", value: predecessor.val }],
        note: { vi: "Tìm node ngoài cùng bên phải của cây con trái. Node này sẽ nối lại với cây con phải cũ.", en: "Find the rightmost node of the left subtree. It will reconnect to the old right subtree." },
      });

      while (predecessor.right) {
        snap({
          title: { vi: `while predecessor.right: ${predecessor.val}.right = ${predecessor.right.val}`, en: `while predecessor.right: ${predecessor.val}.right = ${predecessor.right.val}` },
          codeLines: [7], cur, predecessor,
          vars: [{ name: "predecessor", value: predecessor.val }, { name: "predecessor.right", value: predecessor.right.val }],
          note: { vi: "Chưa phải node phải nhất của cây con trái, tiếp tục đi sang phải.", en: "This is not yet the rightmost node of the left subtree, so continue rightward." },
        });
        predecessor = predecessor.right;
        snap({
          title: { vi: `predecessor = predecessor.right → ${predecessor.val}`, en: `predecessor = predecessor.right → ${predecessor.val}` },
          codeLines: [8], cur, predecessor,
          vars: [{ name: "predecessor", value: predecessor.val }],
          note: { vi: "Cập nhật predecessor sang node kế tiếp bên phải.", en: "Advance predecessor to the next right node." },
        });
      }

      const oldRight = cur.right;
      // Detach the old right edge in the visual model before showing its new
      // owner. This avoids a temporary two-parent DAG in the tree renderer.
      cur.right = null;
      predecessor.right = oldRight;
      snap({
        title: { vi: `${predecessor.val}.right = cur.right (${oldRight ? oldRight.val : "None"})`, en: `${predecessor.val}.right = cur.right (${oldRight ? oldRight.val : "None"})` },
        codeLines: [9], cur, predecessor,
        vars: [{ name: "predecessor", value: predecessor.val }, { name: "old right subtree", value: oldRight ? oldRight.val : "None" }],
        note: { vi: "Nối đuôi của cây trái với cây phải cũ để không mất bất kỳ node nào.", en: "Connect the left subtree's tail to the old right subtree so no node is lost." },
      });

      const leftRoot = cur.left;
      // Likewise, detach the old left edge before it becomes cur.right so
      // each snapshot remains a renderable tree rather than a shared subtree.
      cur.left = null;
      cur.right = leftRoot;
      snap({
        title: { vi: `cur.right = cur.left → ${cur.val}.right = ${leftRoot.val}`, en: `cur.right = cur.left → ${cur.val}.right = ${leftRoot.val}` },
        codeLines: [10], cur, predecessor,
        vars: [{ name: "cur.right", value: leftRoot.val }],
        note: { vi: "Đưa cả cây trái sang right, đúng thứ tự preorder: cur → left subtree → right subtree cũ.", en: "Move the full left subtree to right, yielding preorder: cur → left subtree → old right subtree." },
      });

      cur.left = null;
      snap({
        title: { vi: `${cur.val}.left = None`, en: `${cur.val}.left = None` },
        codeLines: [11], cur, predecessor,
        nullChildren: [{ id: `null-left-${cur.id}`, parentId: cur.id, side: "left" }],
        vars: [{ name: "cur.left", value: "None" }],
        note: { vi: "Xóa con trỏ left. Mỗi node của linked list kết quả chỉ còn right (next).", en: "Clear left. Each node in the final linked list has only right (next)." },
      });
    }

    cur = cur.right;
    snap({
      title: { vi: `cur = cur.right → ${cur ? cur.val : "None"}`, en: `cur = cur.right → ${cur ? cur.val : "None"}` },
      codeLines: [12], cur,
      vars: [{ name: "cur", value: cur ? cur.val : "None" }],
      note: { vi: cur ? "Tiến theo liên kết right vừa được xác lập để xử lý node kế tiếp." : "Đã đi qua cuối chuỗi right." , en: cur ? "Advance through the newly established right link to process the next node." : "Reached the end of the right chain." },
    });
  }

  const order = [];
  let node = root;
  while (node) {
    order.push(node.val);
    node = node.right;
  }
  snap({
    title: { vi: `return → ${order.join(" → ")}`, en: `return → ${order.join(" → ")}` },
    codeLines: [13], final: true,
    vars: [{ name: "right-only chain", value: order.join(" → ") }],
    note: { vi: `Cây đã được flatten thành linked list theo preorder: ${order.join(" → ")}. Tất cả left đều là None.`, en: `The tree is flattened into a preorder linked list: ${order.join(" → ")}. Every left pointer is None.` },
  });
  return { input, answer: order, steps };
}

function parsePalindromePathInput(input) {
  const raw = String(input || "").trim();
  const parts = raw.split("|").map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Input format: parent array | s. Example: -1,0,0,1,1,2|acaabc");
  }
  const parent = parts[0].split(",").map((token) => {
    const value = Number(token.trim());
    if (!Number.isInteger(value)) throw new Error("parent must contain integers.");
    return value;
  });
  const s = parts[1];
  if (parent.length !== s.length) {
    throw new Error("parent.length must equal s.length.");
  }
  if (parent[0] !== -1) {
    throw new Error("parent[0] must be -1.");
  }
  for (let i = 1; i < parent.length; i++) {
    if (parent[i] < 0 || parent[i] >= parent.length) {
      throw new Error(`parent[${i}] is outside the node range.`);
    }
  }
  if (!/^[a-z]+$/.test(s)) {
    throw new Error("s must contain lowercase English letters only.");
  }
  return { parent, s };
}

function buildSteps2791(input) {
  const { parent, s } = parsePalindromePathInput(input);
  const n = parent.length;
  const children = Array.from({ length: n }, () => []);
  for (let node = 1; node < n; node++) children[parent[node]].push(node);

  const bitName = (bit) => String.fromCharCode(97 + bit);
  const letterBit = (ch) => ch.charCodeAt(0) - 97;
  // Only letters that actually label an edge can ever appear in a mask, so the
  // visualization shows a compact parity row over those letters instead of 26 bits.
  const alphabet = [...new Set(s.slice(1).split(""))].sort();
  const oddLetters = (mask) => {
    const letters = [];
    for (let bit = 0; bit < 26; bit++) if (mask & (1 << bit)) letters.push(bitName(bit));
    return letters;
  };
  const oddText = (mask) => oddLetters(mask).join("") || "∅";
  const parityRow = (mask) => alphabet.map((ch) => ({ letter: ch, odd: Boolean(mask & (1 << letterBit(ch))) }));
  const popcount = (mask) => oddLetters(mask).length;

  // depth + masks in index order so the walkthrough matches `for mask in masks`.
  const masks = Array(n).fill(0);
  const depth = Array(n).fill(0);
  const dfsOrder = [];
  (function dfsMask(node) {
    dfsOrder.push(node);
    for (const child of children[node]) {
      masks[child] = masks[node] ^ (1 << letterBit(s[child]));
      depth[child] = depth[node] + 1;
      dfsMask(child);
    }
  })(0);

  const xPos = Array(n).fill(0);
  let nextX = 0;
  (function assignX(node) {
    if (children[node].length === 0) {
      xPos[node] = nextX++;
      return;
    }
    children[node].forEach(assignX);
    xPos[node] = children[node].reduce((sum, child) => sum + xPos[child], 0) / children[node].length;
  })(0);

  // Real letters along u ↔ v, used to prove the pair really is a palindrome.
  function pathLetters(u, v) {
    const fromU = [];
    const fromV = [];
    let a = u;
    let b = v;
    while (depth[a] > depth[b]) { fromU.push(s[a]); a = parent[a]; }
    while (depth[b] > depth[a]) { fromV.push(s[b]); b = parent[b]; }
    while (a !== b) { fromU.push(s[a]); a = parent[a]; fromV.push(s[b]); b = parent[b]; }
    return { letters: [...fromU, ...fromV.reverse()], lca: a };
  }

  function palindromeArrangement(letters) {
    const counts = new Map();
    for (const ch of letters) counts.set(ch, (counts.get(ch) || 0) + 1);
    let middle = "";
    let half = "";
    for (const ch of [...counts.keys()].sort()) {
      if (counts.get(ch) % 2) middle = ch;
      half += ch.repeat(Math.floor(counts.get(ch) / 2));
    }
    return half + middle + [...half].reverse().join("");
  }

  const counterText = (counter) => {
    const entries = Object.keys(counter).map(Number).filter((mask) => counter[mask] > 0)
      .sort((a, b) => a - b).slice(0, 8).map((mask) => `${oddText(mask)}:${counter[mask]}`);
    return `{${entries.join(", ")}}`;
  };
  const counterItems = (counter, nodesByMask, highlightMasks) => Object.keys(counter)
    .map(Number).filter((mask) => counter[mask] > 0).sort((a, b) => a - b)
    .map((mask) => ({
      mask,
      odd: oddText(mask),
      parity: parityRow(mask),
      count: counter[mask],
      nodes: [...(nodesByMask[mask] || [])],
      matched: Boolean(highlightMasks && highlightMasks.has(mask)),
    }));

  const makeTree = (active, processed, partners, pathNodes) => ({
    nodes: Array.from({ length: n }, (_, node) => ({
      id: node,
      // Keep each node on one measured line so the shared tree renderer can
      // size a readable pill instead of squeezing variable text into a circle.
      label: node === 0
        ? `#0 · ROOT · odd:{${oddText(masks[node])}}`
        : `#${node} · +${s[node]} · odd:{${oddText(masks[node])}}`,
      x: xPos[node],
      y: depth[node],
      parentId: parent[node] === -1 ? null : parent[node],
      hl: node === active,
      isWord: processed.has(node) || node === active,
    })),
    annotations: Object.fromEntries(
      (pathNodes || []).map((node) => [node, { label: "PATH", kind: "md-next" }])
        .concat((partners || []).map((node) => [node, { label: "PAIR ✓", kind: "md-next" }]))
        .concat(active === null ? [] : [[active, { label: "CURRENT", kind: "md-current" }]]),
    ),
    showLevels: true,
  });

  const steps = [];
  const processed = new Set();
  const seenByMask = {};
  const nodesByMask = {};
  const allPairs = [];
  let answer = 0;

  const baseView = (extra) => ({
    alphabet,
    answerBefore: answer,
    add: 0,
    answerAfter: answer,
    lookups: [],
    matches: [],
    pairsFound: [],
    totalPairs: allPairs.length,
    recentPairs: allPairs.slice(-6),
    counter: counterItems(seenByMask, nodesByMask, null),
    ...extra,
  });

  steps.push({
    title: { vi: "Ý tưởng: parity mask thay vì liệt kê mọi đường", en: "Idea: parity masks instead of listing every path" },
    arr: [],
    tree: makeTree(0, processed, [], []),
    highlight: [],
    mark: [],
    codeLines: [9, 10],
    vars: [
      { name: "parent", value: `[${parent.join(",")}]` },
      { name: "s", value: `"${s}"` },
      { name: "letters in tree", value: alphabet.join("") || "∅" },
    ],
    palPathView: baseView({
      phase: "idea",
      current: { node: 0, mask: 0, odd: oddText(0), parity: parityRow(0), edge: "root", popcount: 0 },
    }),
    note: {
      vi: `Một dãy chữ hoán vị được thành palindrome khi có tối đa 1 chữ xuất hiện lẻ lần. Vì vậy chỉ cần lưu tính chẵn/lẻ (parity) của mỗi chữ, không cần lưu số lượng. mask[node] = tập chữ xuất hiện LẺ lần trên đường root → node. Cây này dùng ${alphabet.length} chữ: ${alphabet.join(", ")}.`,
      en: `Letters can be rearranged into a palindrome when at most one letter occurs an odd number of times. So we only need each letter's parity, not its count. mask[node] = the set of letters appearing an ODD number of times on root → node. This tree uses ${alphabet.length} letters: ${alphabet.join(", ")}.`,
    },
  });

  for (const node of dfsOrder) {
    if (node === 0) continue;
    const bit = letterBit(s[node]);
    steps.push({
      title: { vi: `mask[${node}] = mask[${parent[node]}] XOR '${s[node]}'`, en: `mask[${node}] = mask[${parent[node]}] XOR '${s[node]}'` },
      arr: [],
      tree: makeTree(node, new Set(dfsOrder.slice(0, dfsOrder.indexOf(node))), [], []),
      highlight: [],
      mark: [],
      codeLines: [14, 15],
      vars: [
        { name: `mask[${parent[node]}]`, value: oddText(masks[parent[node]]) },
        { name: "edge letter", value: `'${s[node]}'` },
        { name: `mask[${node}]`, value: oddText(masks[node]) },
      ],
      palPathView: baseView({
        phase: "build",
        current: { node, mask: masks[node], odd: oddText(masks[node]), parity: parityRow(masks[node]), edge: `${parent[node]} → ${node}: '${s[node]}'`, popcount: popcount(masks[node]) },
        xorStep: {
          parentNode: parent[node],
          parentOdd: oddText(masks[parent[node]]),
          parentParity: parityRow(masks[parent[node]]),
          letter: s[node],
          flipped: Boolean(masks[node] & (1 << bit)),
        },
      }),
      note: {
        vi: `Thêm cạnh '${s[node]}' chỉ đảo parity của đúng chữ đó: '${s[node]}' chuyển từ ${(masks[parent[node]] & (1 << bit)) ? "lẻ sang chẵn" : "chẵn sang lẻ"}. mask[${node}] = {${oddText(masks[node])}}.`,
        en: `Adding edge '${s[node]}' flips only that letter's parity: '${s[node]}' goes from ${(masks[parent[node]] & (1 << bit)) ? "odd to even" : "even to odd"}. mask[${node}] = {${oddText(masks[node])}}.`,
      },
    });
  }

  steps.push({
    title: { vi: "Vì sao XOR hai mask cho đúng parity của đường u ↔ v", en: "Why XOR of two masks gives the path parity" },
    arr: [],
    tree: makeTree(null, new Set(dfsOrder), [], []),
    highlight: [],
    mark: [],
    codeLines: [18, 19],
    vars: [{ name: "rule", value: "path(u,v) = mask[u] XOR mask[v]" }],
    palPathView: baseView({ phase: "rule", current: null }),
    note: {
      vi: "Đường root → u và root → v cùng đi qua đoạn root → LCA. Khi XOR, đoạn chung đó xuất hiện 2 lần nên tự triệt tiêu, chỉ còn đúng các cạnh trên đường u ↔ v. Do đó chỉ cần tìm cặp mask có XOR chứa 0 hoặc 1 bit lẻ.",
      en: "Both root → u and root → v share the root → LCA prefix. XOR makes that shared prefix appear twice and cancel, leaving exactly the edges on u ↔ v. So we just need mask pairs whose XOR has 0 or 1 odd bit.",
    },
  });

  for (let node = 0; node < n; node++) {
    const mask = masks[node];
    const currentEdge = node === 0 ? "root" : `${parent[node]} → ${node}: '${s[node]}'`;
    const currentInfo = { node, mask, odd: oddText(mask), parity: parityRow(mask), edge: currentEdge, popcount: popcount(mask) };

    // Probe 1: identical mask (XOR = 0 bits). Probes 2..k: flip one used letter.
    const lookups = [{
      kind: "exact",
      mask,
      label: oddText(mask),
      count: seenByMask[mask] || 0,
      nodes: [...(nodesByMask[mask] || [])],
    }];
    for (const ch of alphabet) {
      const probe = mask ^ (1 << letterBit(ch));
      lookups.push({
        kind: "flip",
        flipLetter: ch,
        mask: probe,
        label: oddText(probe),
        count: seenByMask[probe] || 0,
        nodes: [...(nodesByMask[probe] || [])],
      });
    }
    const add = lookups.reduce((sum, item) => sum + item.count, 0);
    const matchedMasks = new Set(lookups.filter((item) => item.count > 0).map((item) => item.mask));
    const partners = lookups.flatMap((item) => item.nodes);

    const pairsFound = lookups.flatMap((item) => item.nodes.map((other) => {
      const { letters, lca } = pathLetters(other, node);
      const xor = masks[other] ^ mask;
      return {
        u: Math.min(other, node),
        v: Math.max(other, node),
        lca,
        letters: letters.join(""),
        xorOdd: oddText(xor),
        xorPopcount: popcount(xor),
        palindrome: palindromeArrangement(letters),
        kind: item.kind === "exact" ? "even" : "one-odd",
      };
    }));

    steps.push({
      title: { vi: `Node ${node}: thử 1 mask giống + ${alphabet.length} mask lệch 1 chữ`, en: `Node ${node}: probe 1 equal mask + ${alphabet.length} one-letter flips` },
      arr: [],
      tree: makeTree(node, new Set(processed), partners, []),
      highlight: [],
      mark: [],
      codeLines: [21, 22, 23],
      vars: [
        { name: "mask", value: oddText(mask) },
        { name: "seen[mask]", value: seenByMask[mask] || 0 },
        { name: "flip hits", value: lookups.filter((item) => item.kind === "flip" && item.count > 0).map((item) => `${item.flipLetter}:${item.count}`).join(", ") || "none" },
        { name: "add", value: add },
        { name: "ans", value: `${answer} + ${add} = ${answer + add}` },
      ],
      palPathView: baseView({
        phase: "count",
        current: currentInfo,
        add,
        answerAfter: answer + add,
        lookups,
        skippedFlips: 26 - alphabet.length,
        pairsFound,
        matches: lookups.filter((item) => item.count > 0).map((item) => ({
          mask: item.mask,
          odd: oddText(item.mask),
          parity: parityRow(item.mask),
          count: item.count,
          nodes: item.nodes,
          kind: item.kind === "exact" ? "same" : "one-bit",
          flipLetter: item.flipLetter || null,
        })),
        counter: counterItems(seenByMask, nodesByMask, matchedMasks),
      }),
      note: {
        vi: add
          ? `Tìm được ${add} node đã lưu ghép được với node ${node}: ${pairsFound.map((pair) => `(${pair.u},${pair.v}) "${pair.letters}" → "${pair.palindrome}"`).join("; ")}.`
          : `Chưa có mask nào trong counter khớp, nên node ${node} chưa tạo được cặp. ${26 - alphabet.length} phép lật còn lại dùng chữ không có trong cây nên chắc chắn trượt.`,
        en: add
          ? `Found ${add} stored node(s) pairing with node ${node}: ${pairsFound.map((pair) => `(${pair.u},${pair.v}) "${pair.letters}" → "${pair.palindrome}"`).join("; ")}.`
          : `No counter mask matches yet, so node ${node} forms no pair. The other ${26 - alphabet.length} flips use letters absent from the tree and always miss.`,
      },
    });

    answer += add;
    allPairs.push(...pairsFound);
    seenByMask[mask] = (seenByMask[mask] || 0) + 1;
    if (!nodesByMask[mask]) nodesByMask[mask] = [];
    nodesByMask[mask].push(node);
    processed.add(node);

    steps.push({
      title: { vi: `Lưu mask của node ${node} vào counter`, en: `Store node ${node}'s mask in the counter` },
      arr: [],
      tree: makeTree(node, new Set(processed), [], []),
      highlight: [],
      mark: [],
      codeLines: [24],
      vars: [
        { name: "seen[mask]", value: seenByMask[mask] },
        { name: "seen", value: counterText(seenByMask) },
        { name: "ans", value: answer },
      ],
      palPathView: baseView({
        phase: "store",
        current: currentInfo,
        counter: counterItems(seenByMask, nodesByMask, new Set([mask])),
      }),
      note: {
        vi: `Đếm trước rồi lưu sau, nhờ vậy mỗi cặp (u, v) chỉ được tính đúng một lần và node không tự ghép với chính nó. Counter giờ có ${oddText(mask)} với số lượng ${seenByMask[mask]}.`,
        en: `Counting before storing ensures each pair (u, v) is counted exactly once and no node pairs with itself. The counter now holds ${oddText(mask)} with count ${seenByMask[mask]}.`,
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${answer} đường`, en: `Result: ${answer} paths` },
    arr: [],
    tree: makeTree(null, processed, [], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [25],
    vars: [
      { name: "answer", value: answer },
      { name: "seen", value: counterText(seenByMask) },
    ],
    palPathView: baseView({
      phase: "done",
      current: null,
      totalPairs: allPairs.length,
      recentPairs: allPairs.slice(-6),
      allPairsList: allPairs.map((pair) => ({ ...pair })),
    }),
    note: {
      vi: `Có ${answer} cặp (u, v) mà các chữ trên đường u ↔ v hoán vị được thành palindrome. Cách này chỉ mất O(26n) thay vì O(n²) khi thử mọi cặp.`,
      en: `There are ${answer} pairs (u, v) whose path letters can be rearranged into a palindrome. This costs O(26n) instead of O(n²) for testing every pair.`,
    },
  });

  // Expand the compact teaching walkthrough into source-faithful debugger
  // frames. Every executable frame highlights exactly one Python line and
  // snapshots the state immediately after (or while entering) that line.
  const debugSteps = [];
  const allEdges = new Set(Array.from({ length: Math.max(0, n - 1) }, (_, index) => index + 1));
  const allReady = new Set(Array.from({ length: n }, (_, node) => node));
  const edgeText = (node) => node === 0 ? "root" : `${parent[node]} → ${node}: '${s[node]}'`;
  const childrenText = (lists) => `[${lists.map((list) => `[${list.join(",")}]`).join(", ")}]`;
  const stackText = (stack) => `[${stack.join(", ")}]`;

  const debugCurrent = (node, maskValues, ready) => {
    const known = ready.has(node);
    const mask = known ? maskValues[node] : null;
    return {
      node,
      mask,
      odd: known ? oddText(mask) : "?",
      parity: known ? parityRow(mask) : [],
      edge: edgeText(node),
      popcount: known ? popcount(mask) : "?",
      pending: !known,
    };
  };

  const debugTree = ({
    active = null,
    processedSet = new Set(),
    partners = [],
    ready = allReady,
    visibleEdges = allEdges,
    maskValues = masks,
  } = {}) => {
    const tree = makeTree(active, processedSet, partners, []);
    tree.nodes = tree.nodes.map((node) => {
      const known = ready.has(node.id);
      const mask = known ? maskValues[node.id] : null;
      return {
        ...node,
        label: node.id === 0
          ? `#0 · ROOT · odd:{${known ? oddText(mask) : "?"}}`
          : `#${node.id} · +${s[node.id]} · odd:{${known ? oddText(mask) : "?"}}`,
        parentId: node.id === 0 || visibleEdges.has(node.id) ? node.parentId : null,
        hl: node.id === active,
        isWord: processedSet.has(node.id),
        isNull: !known,
      };
    });
    tree.annotations = Object.fromEntries(
      partners.map((node) => [node, { label: "PAIR ✓", kind: "md-next" }])
        .concat(active === null ? [] : [[active, { label: "CURRENT", kind: "md-current" }]]),
    );
    return tree;
  };

  const emptyView = (phase, current, extra = {}) => ({
    alphabet,
    phase,
    current,
    answerBefore: 0,
    add: 0,
    answerAfter: 0,
    lookups: [],
    matches: [],
    pairsFound: [],
    totalPairs: 0,
    recentPairs: [],
    counter: [],
    ...extra,
  });

  const pushDebug = ({ title, line = null, tree, vars = [], view, note, final = false }) => {
    debugSteps.push({
      title,
      arr: [],
      tree,
      highlight: [],
      mark: [],
      codeLines: Number.isInteger(line) ? [line] : [],
      vars,
      palPathView: view,
      note,
      final,
    });
  };

  const runtimeChildren = Array.from({ length: n }, () => []);
  const visibleEdges = new Set();
  const runtimeMasks = Array(n).fill(0);
  const ready = new Set([0]);
  const noProcessed = new Set();

  pushDebug({
    title: { vi: "Tạo danh sách con rỗng cho mỗi node", en: "Create an empty child list for every node" },
    line: 5,
    tree: debugTree({ ready, visibleEdges, maskValues: runtimeMasks }),
    vars: [{ name: "children", value: childrenText(runtimeChildren) }, { name: "n", value: n }],
    view: emptyView("idea", debugCurrent(0, runtimeMasks, ready)),
    note: {
      vi: "Dòng 5 tạo adjacency list. Chưa có cạnh nào được thêm nên các node con vẫn ở trạng thái chờ.",
      en: "Line 5 creates the adjacency list. No edge has been added yet, so child nodes remain pending.",
    },
  });

  for (let node = 1; node < n; node++) {
    pushDebug({
      title: { vi: `Vòng for chọn node ${node}`, en: `The for loop selects node ${node}` },
      line: 6,
      tree: debugTree({ active: node, ready, visibleEdges, maskValues: runtimeMasks }),
      vars: [{ name: "node", value: node }, { name: `parent[${node}]`, value: parent[node] }, { name: "children", value: childrenText(runtimeChildren) }],
      view: emptyView("idea", debugCurrent(node, runtimeMasks, ready)),
      note: {
        vi: `Dòng 6 chọn node ${node}; cạnh ${parent[node]} → ${node} chưa được ghi vào children.`,
        en: `Line 6 selects node ${node}; edge ${parent[node]} → ${node} has not been stored yet.`,
      },
    });

    runtimeChildren[parent[node]].push(node);
    visibleEdges.add(node);
    pushDebug({
      title: { vi: `Thêm ${node} vào children[${parent[node]}]`, en: `Append ${node} to children[${parent[node]}]` },
      line: 7,
      tree: debugTree({ active: node, ready, visibleEdges, maskValues: runtimeMasks }),
      vars: [{ name: "node", value: node }, { name: `children[${parent[node]}]`, value: `[${runtimeChildren[parent[node]].join(", ")}]` }, { name: "children", value: childrenText(runtimeChildren) }],
      view: emptyView("idea", debugCurrent(node, runtimeMasks, ready)),
      note: {
        vi: `Dòng 7 lưu cạnh ${parent[node]} → ${node}; đường nối vừa xuất hiện trên cây.`,
        en: `Line 7 stores edge ${parent[node]} → ${node}; the connection now appears in the tree.`,
      },
    });
  }

  pushDebug({
    title: { vi: "Khởi tạo mọi mask bằng 0", en: "Initialize every mask to zero" },
    line: 9,
    tree: debugTree({ ready, visibleEdges, maskValues: runtimeMasks }),
    vars: [{ name: "masks", value: `[${runtimeMasks.join(", ")}]` }],
    view: emptyView("build", debugCurrent(0, runtimeMasks, ready)),
    note: {
      vi: "Dòng 9 cấp mảng masks. Chỉ mask của root đã có ý nghĩa; các node khác sẽ được tính khi duyệt cạnh.",
      en: "Line 9 allocates masks. Only the root mask is meaningful yet; every other node is computed while traversing an edge.",
    },
  });

  const runtimeStack = [0];
  pushDebug({
    title: { vi: "Đưa root 0 vào stack", en: "Push root 0 onto the stack" },
    line: 10,
    tree: debugTree({ active: 0, ready, visibleEdges, maskValues: runtimeMasks }),
    vars: [{ name: "stack", value: stackText(runtimeStack) }, { name: "masks", value: `[${runtimeMasks.join(", ")}]` }],
    view: emptyView("build", debugCurrent(0, runtimeMasks, ready)),
    note: { vi: "Dòng 10 bắt đầu DFS lặp từ root.", en: "Line 10 starts iterative DFS from the root." },
  });

  while (runtimeStack.length) {
    pushDebug({
      title: { vi: `Kiểm tra while: stack còn ${runtimeStack.length} node`, en: `Check while: ${runtimeStack.length} node(s) remain` },
      line: 11,
      tree: debugTree({ active: runtimeStack[runtimeStack.length - 1], ready, visibleEdges, maskValues: runtimeMasks }),
      vars: [{ name: "stack", value: stackText(runtimeStack) }, { name: "condition", value: "True" }],
      view: emptyView("build", debugCurrent(runtimeStack[runtimeStack.length - 1], runtimeMasks, ready)),
      note: { vi: "Stack chưa rỗng nên đi vào một vòng lặp DFS.", en: "The stack is not empty, so DFS enters another iteration." },
    });

    const node = runtimeStack.pop();
    pushDebug({
      title: { vi: `Pop node ${node} khỏi stack`, en: `Pop node ${node} from the stack` },
      line: 12,
      tree: debugTree({ active: node, ready, visibleEdges, maskValues: runtimeMasks }),
      vars: [{ name: "node", value: node }, { name: "stack", value: stackText(runtimeStack) }],
      view: emptyView("build", debugCurrent(node, runtimeMasks, ready)),
      note: { vi: `Dòng 12 chọn node ${node} để duyệt các con.`, en: `Line 12 selects node ${node} so its children can be traversed.` },
    });

    for (const child of runtimeChildren[node]) {
      pushDebug({
        title: { vi: `Chọn child ${child} của node ${node}`, en: `Select child ${child} of node ${node}` },
        line: 13,
        tree: debugTree({ active: child, ready, visibleEdges, maskValues: runtimeMasks }),
        vars: [{ name: "node", value: node }, { name: "child", value: child }, { name: `children[${node}]`, value: `[${runtimeChildren[node].join(", ")}]` }],
        view: emptyView("build", debugCurrent(child, runtimeMasks, ready)),
        note: { vi: `Dòng 13 bắt đầu xử lý cạnh ${node} → ${child}.`, en: `Line 13 begins processing edge ${node} → ${child}.` },
      });

      const bitIndex = letterBit(s[child]);
      const bitValue = 1 << bitIndex;
      pushDebug({
        title: { vi: `Đổi '${s[child]}' thành bit ${bitIndex}`, en: `Convert '${s[child]}' to bit ${bitIndex}` },
        line: 14,
        tree: debugTree({ active: child, ready, visibleEdges, maskValues: runtimeMasks }),
        vars: [{ name: "child", value: child }, { name: `s[${child}]`, value: `'${s[child]}'` }, { name: "bit", value: `${bitValue} (1 << ${bitIndex})` }],
        view: emptyView("build", debugCurrent(child, runtimeMasks, ready), {
          xorStep: {
            stage: "bit",
            parentNode: node,
            parentParity: parityRow(runtimeMasks[node]),
            letter: s[child],
            bitIndex,
            bitValue,
          },
        }),
        note: { vi: `Dòng 14 tạo bit riêng cho chữ '${s[child]}': 1 << ${bitIndex} = ${bitValue}.`, en: `Line 14 creates the bit for '${s[child]}': 1 << ${bitIndex} = ${bitValue}.` },
      });

      runtimeMasks[child] = runtimeMasks[node] ^ bitValue;
      ready.add(child);
      pushDebug({
        title: { vi: `Gán mask[${child}] = {${oddText(runtimeMasks[child])}}`, en: `Assign mask[${child}] = {${oddText(runtimeMasks[child])}}` },
        line: 15,
        tree: debugTree({ active: child, ready, visibleEdges, maskValues: runtimeMasks }),
        vars: [{ name: `mask[${node}]`, value: oddText(runtimeMasks[node]) }, { name: "bit", value: bitValue }, { name: `mask[${child}]`, value: oddText(runtimeMasks[child]) }],
        view: emptyView("build", debugCurrent(child, runtimeMasks, ready), {
          xorStep: {
            stage: "assign",
            parentNode: node,
            parentParity: parityRow(runtimeMasks[node]),
            letter: s[child],
            bitIndex,
            bitValue,
          },
        }),
        note: {
          vi: `Dòng 15 XOR mask của cha với bit '${s[child]}', nên parity '${s[child]}' bị đảo và mask[${child}] = {${oddText(runtimeMasks[child])}}.`,
          en: `Line 15 XORs the parent mask with '${s[child]}', flipping that parity and producing mask[${child}] = {${oddText(runtimeMasks[child])}}.`,
        },
      });

      runtimeStack.push(child);
      pushDebug({
        title: { vi: `Push child ${child} vào stack`, en: `Push child ${child} onto the stack` },
        line: 16,
        tree: debugTree({ active: child, ready, visibleEdges, maskValues: runtimeMasks }),
        vars: [{ name: "child", value: child }, { name: "stack", value: stackText(runtimeStack) }],
        view: emptyView("build", debugCurrent(child, runtimeMasks, ready)),
        note: { vi: `Dòng 16 lên lịch duyệt các con của node ${child}.`, en: `Line 16 schedules node ${child}'s children for traversal.` },
      });
    }
  }

  pushDebug({
    title: { vi: "Stack rỗng — kết thúc DFS", en: "The stack is empty — DFS ends" },
    line: 11,
    tree: debugTree({ ready, visibleEdges, maskValues: runtimeMasks }),
    vars: [{ name: "stack", value: "[]" }, { name: "condition", value: "False" }, { name: "masks", value: `[${runtimeMasks.join(", ")}]` }],
    view: emptyView("build", null),
    note: { vi: "Điều kiện dòng 11 là False; mask của mọi node đã hoàn tất.", en: "The condition on line 11 is false; every node mask is complete." },
  });

  pushDebug({
    title: { vi: "Quy tắc nối hai root-mask", en: "How two root masks form one path mask" },
    tree: debugTree({ ready: allReady, visibleEdges: allEdges, maskValues: masks }),
    vars: [{ name: "rule", value: "path(u,v) = mask[u] XOR mask[v]" }],
    view: emptyView("rule", null),
    note: {
      vi: "Khung giải thích: đoạn root → LCA xuất hiện hai lần trong XOR nên triệt tiêu. Đây là ý tưởng, không phải một dòng Python riêng.",
      en: "Concept frame: root → LCA appears twice in the XOR and cancels. This is an explanation, not a separate Python statement.",
    },
  });

  pushDebug({
    title: { vi: "Khởi tạo ans = 0", en: "Initialize ans = 0" },
    line: 18,
    tree: debugTree({ ready: allReady, visibleEdges: allEdges, maskValues: masks }),
    vars: [{ name: "ans", value: 0 }],
    view: emptyView("count", null),
    note: { vi: "Dòng 18 đặt bộ đếm số cặp về 0.", en: "Line 18 initializes the pair count to zero." },
  });

  pushDebug({
    title: { vi: "Khởi tạo Counter seen rỗng", en: "Initialize an empty seen Counter" },
    line: 19,
    tree: debugTree({ ready: allReady, visibleEdges: allEdges, maskValues: masks }),
    vars: [{ name: "ans", value: 0 }, { name: "seen", value: "{}" }],
    view: emptyView("count", null),
    note: { vi: "Dòng 19 tạo Counter chứa mask của các node đã xử lý.", en: "Line 19 creates the Counter of masks from already processed nodes." },
  });

  const countFrames = steps.filter((step) => step.palPathView && step.palPathView.phase === "count");
  const storeFrames = steps.filter((step) => step.palPathView && step.palPathView.phase === "store");
  const debugProcessed = new Set();

  for (let node = 0; node < n; node++) {
    const countFrame = countFrames[node];
    const storeFrame = storeFrames[node];
    const sourceView = countFrame.palPathView;
    const mask = masks[node];
    let runningAnswer = sourceView.answerBefore;
    const counterSnapshot = sourceView.counter.map((item) => ({ ...item, nodes: [...item.nodes], matched: false }));
    const counterByMask = new Map(counterSnapshot.map((item) => [item.mask, item]));
    const current = sourceView.current;
    const pairsFor = (probeMask) => sourceView.pairsFound.filter((pair) => (masks[pair.u] ^ masks[pair.v]) === probeMask);
    const viewForLookup = (lookup, add, pairsFound, caption, before = runningAnswer) => ({
      ...sourceView,
      answerBefore: before,
      add,
      answerAfter: before + add,
      lookups: lookup ? [lookup] : [],
      lookupCaption: caption,
      skippedFlips: 0,
      pairsFound,
      matches: [],
      counter: counterSnapshot.map((item) => ({
        ...item,
        nodes: [...item.nodes],
        matched: Boolean(lookup && !lookup.pending && lookup.count > 0 && item.mask === lookup.mask),
      })),
    });

    pushDebug({
      title: { vi: `Vòng for chọn mask của node ${node}`, en: `The for loop selects node ${node}'s mask` },
      line: 20,
      tree: debugTree({ active: node, processedSet: debugProcessed, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
      vars: [{ name: "node index", value: node }, { name: "mask", value: `${mask} → {${oddText(mask)}}` }, { name: "ans", value: runningAnswer }],
      view: viewForLookup(null, 0, [], ""),
      note: { vi: `Dòng 20 lấy mask[${node}] = {${oddText(mask)}}. Chỉ các node trước ${node} đã có trong seen.`, en: `Line 20 reads mask[${node}] = {${oddText(mask)}}. Only nodes before ${node} are in seen.` },
    });

    const exactItem = counterByMask.get(mask);
    const exactLookup = {
      kind: "exact",
      mask,
      label: oddText(mask),
      count: exactItem ? exactItem.count : 0,
      nodes: exactItem ? [...exactItem.nodes] : [],
    };
    const exactPairs = pairsFor(0);
    pushDebug({
      title: { vi: `Cộng seen[mask] = ${exactLookup.count}`, en: `Add seen[mask] = ${exactLookup.count}` },
      line: 21,
      tree: debugTree({ active: node, processedSet: debugProcessed, partners: exactLookup.nodes, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
      vars: [{ name: "mask", value: oddText(mask) }, { name: "seen[mask]", value: exactLookup.count }, { name: "ans", value: `${runningAnswer} + ${exactLookup.count} = ${runningAnswer + exactLookup.count}` }],
      view: viewForLookup(exactLookup, exactLookup.count, exactPairs, "same mask → XOR has 0 odd bits"),
      note: exactLookup.count
        ? { vi: `Dòng 21 tìm thấy ${exactLookup.count} mask giống hệt; XOR = 0 nên tạo palindrome chẵn.`, en: `Line 21 finds ${exactLookup.count} identical mask(s); XOR = 0, so they form even palindromes.` }
        : { vi: "Dòng 21 không có mask giống hệt trong seen.", en: "Line 21 finds no identical mask in seen." },
    });
    runningAnswer += exactLookup.count;

    for (let bit = 0; bit < 26; bit++) {
      const ch = bitName(bit);
      const probeMask = mask ^ (1 << bit);
      const counterItem = counterByMask.get(probeMask);
      const lookup = {
        kind: "flip",
        flipLetter: ch,
        mask: probeMask,
        label: oddText(probeMask),
        count: counterItem ? counterItem.count : 0,
        nodes: counterItem ? [...counterItem.nodes] : [],
      };
      const caption = `bit ${bit} ('${ch}') · probe {${oddText(probeMask)}}`;
      pushDebug({
        title: { vi: `Vòng bit chọn ${bit} ('${ch}')`, en: `The bit loop selects ${bit} ('${ch}')` },
        line: 22,
        tree: debugTree({ active: node, processedSet: debugProcessed, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
        vars: [{ name: "bit", value: `${bit} ('${ch}')` }, { name: "probe", value: `${probeMask} → {${oddText(probeMask)}}` }, { name: "ans", value: runningAnswer }],
        view: viewForLookup({ ...lookup, pending: true }, 0, [], caption),
        note: { vi: `Dòng 22 chọn bit ${bit}. Chưa đọc Counter; dòng 23 mới tra seen[mask XOR (1 << ${bit})].`, en: `Line 22 selects bit ${bit}. The Counter is not read until line 23 probes seen[mask XOR (1 << ${bit})].` },
      });

      const flipPairs = pairsFor(1 << bit);
      pushDebug({
        title: { vi: `Tra flip '${ch}': cộng ${lookup.count}`, en: `Probe flip '${ch}': add ${lookup.count}` },
        line: 23,
        tree: debugTree({ active: node, processedSet: debugProcessed, partners: lookup.nodes, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
        vars: [{ name: "bit", value: `${bit} ('${ch}')` }, { name: "seen[probe]", value: lookup.count }, { name: "ans", value: `${runningAnswer} + ${lookup.count} = ${runningAnswer + lookup.count}` }],
        view: viewForLookup(lookup, lookup.count, flipPairs, caption),
        note: lookup.count
          ? { vi: `Dòng 23 tìm thấy ${lookup.count} mask lệch đúng chữ '${ch}', nên đường có đúng 1 chữ lẻ và vẫn tạo được palindrome.`, en: `Line 23 finds ${lookup.count} mask(s) differing only at '${ch}', so the path has exactly one odd letter and can form a palindrome.` }
          : { vi: `Dòng 23 không tìm thấy probe {${oddText(probeMask)}} trong seen.`, en: `Line 23 does not find probe {${oddText(probeMask)}} in seen.` },
      });
      runningAnswer += lookup.count;
    }

    if (runningAnswer !== sourceView.answerAfter) {
      throw new Error(`2791 debug answer drift at node ${node}: ${runningAnswer} != ${sourceView.answerAfter}`);
    }

    debugProcessed.add(node);
    const storedView = {
      ...storeFrame.palPathView,
      answerBefore: runningAnswer,
      add: 0,
      answerAfter: runningAnswer,
    };
    pushDebug({
      title: { vi: `Lưu mask của node ${node} vào seen`, en: `Store node ${node}'s mask in seen` },
      line: 24,
      tree: debugTree({ active: node, processedSet: debugProcessed, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
      vars: storeFrame.vars,
      view: storedView,
      note: storeFrame.note,
    });
  }

  const finalFrame = steps[steps.length - 1];
  pushDebug({
    title: finalFrame.title,
    line: 25,
    tree: debugTree({ processedSet: debugProcessed, ready: allReady, visibleEdges: allEdges, maskValues: masks }),
    vars: finalFrame.vars,
    view: finalFrame.palPathView,
    note: finalFrame.note,
    final: true,
  });

  return { input, answer, steps: debugSteps };
}

module.exports = {
  __meta: {
    order: [114, 144, 94, 145, 104, 102, 107, 103, 199, 637, 515, 513, 662, 116, 117, 1609, 2415, 2471, 2583, 2641, 429, 543, 110, 111, 124, 226, 100, 101, 257, 404, 617, 572, 965, 872, 951, 113, 236, 1644, 1650, 1676, 366, 863, 156, 337, 314, 987, 297, 1120, 1973, 2265, 2791],
    label: {
      vi: "Tag Binary Tree",
      en: "Binary Tree tag",
    },
  },
  114: {
    id: 114,
    difficulty: "medium",
    slug: "flatten-binary-tree-to-linked-list",
    category: TREE_CAT,
    tags: [{ key: "linked-list", vi: "Danh sách liên kết", en: "Linked List" }],
    title: { vi: "Flatten Binary Tree to Linked List", en: "Flatten Binary Tree to Linked List" },
    titleVi: { vi: "Làm phẳng cây nhị phân thành linked list", en: "Flatten binary tree into a linked list" },
    statement: {
      vi: "Biến đổi cây tại chỗ thành linked list theo thứ tự preorder. Mỗi node chỉ dùng con trỏ right làm next và mọi con trỏ left phải là null.",
      en: "Transform the tree in-place into a preorder linked list. Each node uses only right as next and every left pointer must be null.",
    },
    defaultInput: "1,2,5,3,4,null,6",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order; null cho node rỗng)", en: "Tree (level-order; null for empty)" },
    extraParams: [],
    approach: [
      { vi: "Duyệt cur theo right. Nếu cur không có left, liên kết right đã đúng và chỉ cần đi tiếp.", en: "Walk cur through right. If cur has no left, its right link is already correct, so continue." },
      { vi: "Nếu có left, tìm predecessor: node ngoài cùng bên phải của cây trái.", en: "If left exists, find the predecessor: the rightmost node in the left subtree." },
      { vi: "Nối predecessor.right với cur.right cũ, chuyển cur.left sang cur.right, rồi đặt cur.left = None.", en: "Link predecessor.right to old cur.right, move cur.left to cur.right, then set cur.left = None." },
    ],
    complexity: { time: "O(n)", space: "O(1)", note: { vi: "Mỗi liên kết được đi qua hoặc đổi hướng số lần hằng số; không cần stack/đệ quy phụ.", en: "Each link is traversed or redirected a constant number of times; no auxiliary stack or recursion is needed." } },
    code: [
      "class Solution:",
      "    def flatten(self, root):",
      "        cur = root",
      "        while cur:",
      "            if cur.left:",
      "                predecessor = cur.left",
      "                while predecessor.right:",
      "                    predecessor = predecessor.right",
      "                predecessor.right = cur.right",
      "                cur.right = cur.left",
      "                cur.left = None",
      "            cur = cur.right",
      "        return",
    ],
    builder: buildSteps114,
  },
  144: {
    id: 144, difficulty: "easy", slug: "binary-tree-preorder-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Preorder Traversal", en: "Binary Tree Preorder Traversal" },
    titleVi: { vi: "Duyệt cây tiền thứ tự (Preorder)", en: "Preorder traversal" },
    statement: { vi: "Cho root của cây nhị phân, trả về duyệt PREORDER (Gốc → Trái → Phải). Nhập level-order, null cho nút rỗng.", en: "Given the root of a binary tree, return its PREORDER traversal (Root → Left → Right). Enter as level-order, null for empty." },
    defaultInput: "1,2,3,4,5,6,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Thăm gốc trước → thêm node.val, rồi đệ quy con trái, rồi con phải.", en: "Visit root first → add node.val, then recurse left, then right." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi nút thăm 1 lần. Stack O(h).", en: "Each node visited once. Stack O(h)." } },
    code: ["class Solution:", "    def preorderTraversal(self, root):", "        res = []", "        def dfs(node):", "            if not node: return", "            res.append(node.val)   # visit root", "            dfs(node.left)", "            dfs(node.right)", "        dfs(root)", "        return res"],
    builder: buildSteps144,
  },
  112: {
    id: 112, difficulty: "easy", slug: "path-sum",
    category: TREE_CAT,
    title: { vi: "Path Sum", en: "Path Sum" },
    titleVi: { vi: "Tổng đường đi root → leaf", en: "Root-to-leaf path sum" },
    statement: { vi: "Cho root và targetSum, kiểm tra có đường từ GỐC đến LÁ với tổng giá trị = targetSum không. Nhập level-order.", en: "Given root and targetSum, check if there is a ROOT-to-LEAF path whose values sum to targetSum. Enter as level-order." },
    defaultInput: "5,4,8,11,null,13,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "target", label: { vi: "targetSum", en: "targetSum" }, allowNegative: true, default: 20 }],
    approach: [
      { vi: "DFS, trừ dần node.val khỏi target. Khi tới lá: nếu remaining = 0 → tìm thấy.", en: "DFS, subtract node.val from target. At a leaf: if remaining = 0 → found." },
      { vi: "Chỉ tính đường đến LÁ (cả 2 con đều null), không dừng giữa chừng.", en: "Only count paths ending at a LEAF (both children null), not partial paths." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút tối đa 1 lần. Stack O(h).", en: "Visit each node at most once. Stack O(h)." } },
    code: ["class Solution:", "    def hasPathSum(self, root, targetSum):", "        if not root: return False", "        remaining = targetSum - root.val", "        if not root.left and not root.right:", "            return remaining == 0", "        return (self.hasPathSum(root.left, remaining) or", "                self.hasPathSum(root.right, remaining))"],
    builder: buildSteps112,
  },
  94: {
    id: 94, difficulty: "easy", slug: "binary-tree-inorder-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Inorder Traversal", en: "Binary Tree Inorder Traversal" },
    titleVi: { vi: "Duyệt cây trung thứ tự (Inorder)", en: "Inorder traversal" },
    statement: { vi: "Cho root của cây nhị phân, trả về duyệt INORDER (Trái → Gốc → Phải). Với BST, inorder cho thứ tự tăng dần. Nhập level-order.", en: "Given the root of a binary tree, return its INORDER traversal (Left → Root → Right). For a BST, inorder gives ascending order. Enter as level-order." },
    defaultInput: "1,2,3,4,5,6,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy con trái trước, rồi thăm gốc (thêm node.val), rồi con phải.", en: "Recurse left first, then visit root (add node.val), then right." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi nút thăm 1 lần. Stack O(h).", en: "Each node visited once. Stack O(h)." } },
    code: ["class Solution:", "    def inorderTraversal(self, root):", "        res = []", "        def dfs(node):", "            if not node: return", "            dfs(node.left)", "            res.append(node.val)   # visit root", "            dfs(node.right)", "        dfs(root)", "        return res"],
    builder: buildSteps94,
  },
  145: {
    id: 145, difficulty: "easy", slug: "binary-tree-postorder-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Postorder Traversal", en: "Binary Tree Postorder Traversal" },
    titleVi: { vi: "Duyệt cây hậu thứ tự (Postorder)", en: "Postorder traversal" },
    statement: { vi: "Cho root của cây nhị phân, trả về duyệt POSTORDER (Trái → Phải → Gốc). Nhập level-order.", en: "Given the root of a binary tree, return its POSTORDER traversal (Left → Right → Root). Enter as level-order." },
    defaultInput: "1,2,3,4,5,6,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy con trái, rồi con phải, CUỐI CÙNG mới thăm gốc (thêm node.val).", en: "Recurse left, then right, FINALLY visit root (add node.val)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi nút thăm 1 lần. Stack O(h).", en: "Each node visited once. Stack O(h)." } },
    code: ["class Solution:", "    def postorderTraversal(self, root):", "        res = []", "        def dfs(node):", "            if not node: return", "            dfs(node.left)", "            dfs(node.right)", "            res.append(node.val)   # visit root last", "        dfs(root)", "        return res"],
    builder: buildSteps145,
  },
  104: {
    id: 104, difficulty: "easy", slug: "maximum-depth-of-binary-tree",
    category: TREE_CAT,
    title: { vi: "Maximum Depth of Binary Tree", en: "Maximum Depth of Binary Tree" },
    titleVi: { vi: "Độ sâu lớn nhất của cây", en: "Max depth of tree" },
    statement: { vi: "Cho root của cây nhị phân, trả về độ sâu lớn nhất (số nút trên đường dài nhất từ gốc xuống lá). Nhập level-order.", en: "Given the root of a binary tree, return its maximum depth (number of nodes along the longest root-to-leaf path). Enter as level-order." },
    defaultInput: "3,9,20,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy: depth(node) = 1 + max(depth(trái), depth(phải)). null → 0.", en: "Recursion: depth(node) = 1 + max(depth(left), depth(right)). null → 0." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần. Stack O(h).", en: "Visit each node once. Stack O(h)." } },
    code: ["class Solution:", "    def maxDepth(self, root):", "        if not root:", "            return 0", "        left = self.maxDepth(root.left)", "        right = self.maxDepth(root.right)", "        return 1 + max(left, right)"],
    builder: buildSteps104,
  },
  102: {
    id: 102, difficulty: "medium", slug: "binary-tree-level-order-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Level Order Traversal", en: "Binary Tree Level Order Traversal" },
    titleVi: { vi: "Duyệt cây theo tầng (Level order)", en: "Level order traversal" },
    statement: { vi: "Cho root của cây nhị phân, trả về duyệt theo TẦNG (từ trái sang phải, mỗi tầng 1 mảng). Nhập level-order.", en: "Given the root of a binary tree, return its LEVEL ORDER traversal (left to right, one list per level). Enter as level-order." },
    defaultInput: "3,9,20,15,7,1,2",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "BFS với queue. Mỗi vòng lặp xử lý hết số nút hiện có trong queue = 1 tầng.", en: "BFS with a queue. Each loop processes the current queue size = one level." },
      { vi: "Thu giá trị tầng vào 1 mảng con, rồi đưa con của chúng vào queue.", en: "Collect the level's values into a sublist, then enqueue their children." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng → O(n).", en: "Queue holds at most one level → O(n)." } },
    code: ["class Solution:", "    def levelOrder(self, root):", "        if not root: return []", "        res, queue = [], [root]", "        while queue:", "            level = [n.val for n in queue]", "            res.append(level)", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    builder: buildSteps102,
  },
  429: {
    id: 429, difficulty: "medium", slug: "n-ary-tree-level-order-traversal",
    category: TREE_CAT,
    title: { vi: "N-ary Tree Level Order Traversal", en: "N-ary Tree Level Order Traversal" },
    titleVi: { vi: "Duyệt cây N-ary theo tầng", en: "N-ary tree level-order traversal" },
    statement: { vi: "Cho gốc của cây N-ary, trả về các giá trị theo từng tầng từ trái sang phải. Nhập theo level-order của LeetCode: null ngăn cách nhóm con của mỗi node, ví dụ 1,null,3,2,4,null,5,6.", en: "Given the root of an N-ary tree, return its values level by level from left to right. Use LeetCode N-ary level order: null separates each node's child group, for example 1,null,3,2,4,null,5,6." },
    defaultInput: "1,null,3,2,4,null,5,6",
    inputKind: "string",
    inputLabel: { vi: "N-ary level-order (null ngăn nhóm con)", en: "N-ary level-order (null separates child groups)" },
    extraParams: [],
    approach: [
      { vi: "Dùng queue BFS. Lưu level_size trước khi xử lý để biết chính xác bao nhiêu node thuộc tầng hiện tại.", en: "Use a BFS queue. Save level_size before processing so the current level has an exact node count." },
      { vi: "Mỗi node rời queue sẽ thêm giá trị vào level và đưa tất cả children vào cuối queue cho tầng sau.", en: "Each dequeued node appends its value to level and enqueues all children for the next level." },
      { vi: "Xử lý xong level_size node thì append level vào result.", en: "After processing level_size nodes, append level to result." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Mỗi node vào và ra queue đúng một lần; queue có thể chứa một tầng rộng nhất.", en: "Each node enters and leaves the queue once; the queue can hold the widest level." } },
    code: [
      "from collections import deque",
      "class Solution:",
      "    def levelOrder(self, root):",
      "        if not root:",
      "            return []",
      "        result = []",
      "        queue = deque([root])",
      "        while queue:",
      "            level_size = len(queue)",
      "            level = []",
      "            for _ in range(level_size):",
      "                node = queue.popleft()",
      "                level.append(node.val)",
      "                queue.extend(node.children)",
      "            result.append(level)",
      "        return result",
    ],
    builder: buildSteps429,
  },
  543: {
    id: 543, difficulty: "easy", slug: "diameter-of-binary-tree",
    category: TREE_CAT,
    title: { vi: "Diameter of Binary Tree", en: "Diameter of Binary Tree" },
    titleVi: { vi: "Đường kính của cây nhị phân", en: "Diameter of binary tree" },
    statement: { vi: "Cho root, trả về ĐƯỜNG KÍNH = độ dài (số cạnh) của đường dài nhất giữa 2 nút bất kỳ. Nhập level-order.", en: "Given root, return the DIAMETER = length (in edges) of the longest path between any two nodes. Enter as level-order." },
    defaultInput: "1,2,3,4,5",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Tại mỗi nút, đường dài nhất ĐI QUA nó = leftDepth + rightDepth (số cạnh).", en: "At each node, the longest path THROUGH it = leftDepth + rightDepth (edges)." },
      { vi: "Dùng postorder tính depth, đồng thời cập nhật best = max(best, leftDepth + rightDepth).", en: "Use postorder to compute depth while updating best = max(best, leftDepth + rightDepth)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần duyệt postorder. Stack O(h).", en: "One postorder pass. Stack O(h)." } },
    code: ["class Solution:", "    def diameterOfBinaryTree(self, root):", "        self.best = 0", "        def depth(node):", "            if not node: return 0", "            l = depth(node.left)", "            r = depth(node.right)", "            self.best = max(self.best, l + r)", "            return 1 + max(l, r)", "        depth(root)", "        return self.best"],
    builder: buildSteps543,
  },
  110: {
    id: 110, difficulty: "easy", slug: "balanced-binary-tree",
    category: TREE_CAT,
    title: { vi: "Balanced Binary Tree", en: "Balanced Binary Tree" },
    titleVi: { vi: "Cây nhị phân cân bằng (post-order)", en: "Height-balanced binary tree (post-order)" },
    statement: { vi: "Cây có cân bằng chiều cao không (|leftH-rightH|≤1 tại mọi node)? Nhập level-order.", en: "Is the tree height-balanced (|leftH-rightH|≤1 at every node)? Enter level-order." },
    defaultInput: "3,9,20,null,null,15,7", inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" }, extraParams: [],
    approach: [{ vi: "Đệ quy post-order tính chiều cao.", en: "Post-order recursion computing height." }, { vi: "Trả -1 nếu cây con mất cân bằng (lan lên trên).", en: "Return -1 if a subtree is unbalanced (propagate up)." }, { vi: "Cân bằng ⟺ height(root) ≠ -1.", en: "Balanced ⟺ height(root) ≠ -1." }],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi node thăm 1 lần.", en: "Each node visited once." } },
    code: ["class Solution:", "    def isBalanced(self, root):", "        def height(node):", "            if not node: return 0", "            lh = height(node.left)", "            if lh == -1: return -1", "            rh = height(node.right)", "            if rh == -1: return -1", "            if abs(lh - rh) > 1: return -1", "            return 1 + max(lh, rh)", "        return height(root) != -1"],
    builder: buildSteps110,
  },
  111: {
    id: 111, difficulty: "easy", slug: "minimum-depth-of-binary-tree",
    category: TREE_CAT,
    title: { vi: "Minimum Depth of Binary Tree", en: "Minimum Depth of Binary Tree" },
    titleVi: { vi: "Độ sâu nhỏ nhất của cây", en: "Minimum depth of tree" },
    statement: { vi: "Cho root của cây nhị phân, trả về độ sâu nhỏ nhất (số nút trên đường ngắn nhất từ gốc xuống lá). Lưu ý: node chỉ có 1 con KHÔNG phải lá. Nhập level-order.", en: "Given the root of a binary tree, return its minimum depth (number of nodes along the shortest root-to-leaf path). Note: a node with only one child is NOT a leaf. Enter as level-order." },
    defaultInput: "3,9,20,null,null,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy: nếu node null → 0. Nếu lá → 1.", en: "Recursion: if null → 0. If leaf → 1." },
      { vi: "Nếu chỉ có 1 con → đi theo con đó (KHÔNG lấy min với 0).", en: "If only one child → follow that child (do NOT min with 0)." },
      { vi: "Cả 2 con → 1 + min(left, right).", en: "Both children → 1 + min(left, right)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần. Stack O(h).", en: "Visit each node once. Stack O(h)." } },
    code: ["class Solution:", "    def minDepth(self, root):", "        if not root:", "            return 0", "        left = self.minDepth(root.left)", "        right = self.minDepth(root.right)", "        if not root.left: return 1 + right", "        if not root.right: return 1 + left", "        return 1 + min(left, right)"],
    builder: buildSteps111,
  },
  113: {
    id: 113, difficulty: "medium", slug: "path-sum-ii",
    category: TREE_CAT,
    title: { vi: "Path Sum II", en: "Path Sum II" },
    titleVi: { vi: "Mọi đường root→lá có tổng = target", en: "All root→leaf paths summing to target" },
    statement: { vi: "Tìm mọi đường từ gốc đến lá có tổng giá trị = target. Nhập level-order; target trong tham số.", en: "Find all root-to-leaf paths whose values sum to target. Enter level-order; target as a parameter." },
    defaultInput: "5,4,8,11,null,13,4,7,2,null,null,5,1", inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, default: 22 }],
    approach: [{ vi: "DFS backtracking, giữ đường đi hiện tại.", en: "Backtracking DFS keeping the current path." }, { vi: "Trừ giá trị node khỏi remaining.", en: "Subtract the node value from remaining." }, { vi: "Tại lá và remaining==0 → lưu bản sao đường đi.", en: "At a leaf with remaining==0 → save a copy of the path." }, { vi: "Quay lui: pop node khỏi đường đi.", en: "Backtrack: pop the node from the path." }],
    complexity: { time: "O(n²)", space: "O(h)", note: { vi: "Sao chép đường đi khi tìm thấy.", en: "Copy the path when found." } },
    code: ["class Solution:", "    def pathSum(self, root, targetSum):", "        res = []", "        def dfs(node, rem, path):", "            if not node: return", "            path.append(node.val); rem -= node.val", "            if not node.left and not node.right and rem == 0: res.append(list(path))", "            else:", "                dfs(node.left, rem, path); dfs(node.right, rem, path)", "            path.pop()", "        dfs(root, targetSum, []); return res"],
    builder: buildSteps113,
  },
  124: {
    id: 124, difficulty: "hard", slug: "binary-tree-maximum-path-sum",
    category: TREE_CAT,
    title: { vi: "Binary Tree Maximum Path Sum", en: "Binary Tree Maximum Path Sum" },
    titleVi: { vi: "Tong duong di lon nhat trong cay", en: "Maximum path sum in a binary tree" },
    statement: { vi: "Cho root cua cay nhi phan, tim tong lon nhat cua mot duong di bat ky. Duong di phai noi cac node ke nhau theo canh cha-con, va moi node xuat hien toi da 1 lan. Nhap level-order.", en: "Given the root of a binary tree, return the maximum path sum of any non-empty path. A path follows parent-child edges and each node appears at most once. Enter level-order." },
    defaultInput: "-10,9,20,null,null,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Postorder tu duoi len. Tai moi node, lay left_gain = max(gain(left), 0), right_gain = max(gain(right), 0).", en: "Postorder bottom-up. At each node, use left_gain = max(gain(left), 0), right_gain = max(gain(right), 0)." },
      { vi: "Duong di tot nhat DI QUA node = node.val + left_gain + right_gain; dung gia tri nay de cap nhat max_sum.", en: "Best path THROUGH a node = node.val + left_gain + right_gain; use it to update max_sum." },
      { vi: "Gia tri tra ve cho cha chi duoc chon 1 nhanh: node.val + max(left_gain, right_gain).", en: "The value returned to the parent can choose only one branch: node.val + max(left_gain, right_gain)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyet moi node 1 lan. Stack de quy O(h).", en: "Visit each node once. Recursion stack O(h)." } },
    code: [
      "class Solution:",
      "    def maxPathSum(self, root):",
      "        self.max_sum = float('-inf')",
      "        def gain(node):",
      "            if not node: return 0",
      "            left_gain = max(gain(node.left), 0)",
      "            right_gain = max(gain(node.right), 0)",
      "            self.max_sum = max(self.max_sum, node.val + left_gain + right_gain)",
      "            return node.val + max(left_gain, right_gain)",
      "        gain(root)",
      "        return self.max_sum",
    ],
    builder: buildSteps124,
  },
  1080: {
    id: 1080, difficulty: "medium", slug: "insufficient-nodes-in-root-to-leaf-paths",
    category: TREE_CAT,
    title: { vi: "Insufficient Nodes in Root to Leaf Paths", en: "Insufficient Nodes in Root to Leaf Paths" },
    titleVi: { vi: "Cắt các node không đủ tổng root-to-leaf", en: "Prune nodes without a sufficient root-to-leaf sum" },
    statement: {
      vi: "Cho root và limit. Một node là không đủ nếu mọi đường root-to-leaf đi qua node đó đều có tổng nhỏ hơn limit. Xóa mọi node không đủ và trả về cây còn lại. Nhập cây theo level-order.",
      en: "Given root and limit, a node is insufficient when every root-to-leaf path through it has sum less than limit. Delete all insufficient nodes and return the remaining tree. Enter the tree in level order.",
    },
    defaultInput: "1,2,-3,-5,null,4,null",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "limit", label: { vi: "limit", en: "limit" }, default: -1, allowNegative: true }],
    approach: [
      { vi: "DFS hậu tự mang theo path_sum từ root. Tại lá: giữ khi path_sum ≥ limit, ngược lại trả None.", en: "Use postorder DFS carrying the root-to-node path_sum. At a leaf, keep it when path_sum ≥ limit; otherwise return None." },
      { vi: "Gán lại left và right bằng kết quả đệ quy. Nếu cả hai đều None, node hiện tại không thuộc đường hợp lệ nào nên cũng trả None.", en: "Assign left and right to their recursive results. If both are None, the current node belongs to no sufficient path and also returns None." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi node được duyệt một lần; h là chiều cao cây do stack đệ quy.", en: "Each node is visited once; h is the tree height used by the recursion stack." } },
    code: [
      "class Solution:",
      "    def sufficientSubset(self, root, limit):",
      "        def dfs(node, path_sum):",
      "            if not node:",
      "                return None",
      "            path_sum += node.val",
      "            if not node.left and not node.right:",
      "                return node if path_sum >= limit else None",
      "            node.left = dfs(node.left, path_sum)",
      "            node.right = dfs(node.right, path_sum)",
      "            return node if node.left or node.right else None",
      "        return dfs(root, 0)",
    ],
    builder: buildSteps1080,
  },
  1022: {
    id: 1022, difficulty: "easy", slug: "sum-of-root-to-leaf-binary-numbers",
    category: TREE_CAT,
    title: { vi: "Sum of Root To Leaf Binary Numbers", en: "Sum of Root To Leaf Binary Numbers" },
    titleVi: { vi: "Tổng các số nhị phân root→leaf", en: "Sum root-to-leaf binary numbers" },
    statement: { vi: "Mỗi nút mang bit 0/1. Mỗi đường root→leaf tạo 1 số nhị phân (bit cao ở gốc). Trả về tổng tất cả. Nhập level-order (chỉ 0/1).", en: "Each node holds bit 0/1. Each root→leaf path forms a binary number (MSB at root). Return the sum of all. Enter level-order (0/1 only)." },
    defaultInput: "1,0,1,0,1,0,1",
    inputKind: "string", inputLabel: { vi: "Tree (level-order, 0/1)", en: "Tree (level-order, 0/1)" },
    extraParams: [],
    approach: [
      { vi: "DFS mang theo curr. Mỗi nút: curr = curr*2 + node.val (dịch trái 1 bit rồi thêm bit mới).", en: "DFS carrying curr. At each node: curr = curr*2 + node.val (shift left 1 bit, add new bit)." },
      { vi: "Tới lá → cộng curr vào tổng.", en: "At a leaf → add curr to the total." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần. Stack O(h).", en: "Visit each node once. Stack O(h)." } },
    code: ["class Solution:", "    def sumRootToLeaf(self, root):", "        def dfs(node, curr):", "            if not node: return 0", "            curr = curr * 2 + node.val", "            if not node.left and not node.right:", "                return curr", "            return dfs(node.left, curr) + dfs(node.right, curr)", "        return dfs(root, 0)"],
    builder: buildSteps1022,
  },
  226: {
    id: 226, difficulty: "easy", slug: "invert-binary-tree",
    category: TREE_CAT,
    title: { vi: "Invert Binary Tree", en: "Invert Binary Tree" },
    titleVi: { vi: "Lật cây nhị phân", en: "Invert (mirror) the tree" },
    statement: { vi: "Cho root, lật cây (hoán đổi con trái ↔ phải ở mọi nút) và trả về root. Nhập level-order.", en: "Given root, invert the tree (swap left ↔ right child at every node) and return root. Enter as level-order." },
    defaultInput: "4,2,7,1,3,6,9",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy: tại mỗi nút hoán đổi con trái ↔ phải, rồi đệ quy 2 con.", en: "Recursion: at each node swap left ↔ right child, then recurse on both children." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần. Stack O(h).", en: "Visit each node once. Stack O(h)." } },
    code: ["class Solution:", "    def invertTree(self, root):", "        if not root:", "            return None", "        root.left, root.right = root.right, root.left", "        self.invertTree(root.left)", "        self.invertTree(root.right)", "        return root"],
    builder: buildSteps226,
  },
  100: {
    id: 100, difficulty: "easy", slug: "same-tree",
    category: TREE_CAT,
    title: { vi: "Same Tree", en: "Same Tree" },
    titleVi: { vi: "Hai cây có giống nhau không", en: "Are the two trees identical" },
    statement: { vi: "Cho hai cây nhị phân p và q. Trả về True khi chúng có cùng cấu trúc và các node tương ứng có cùng giá trị. Nhập mỗi cây theo level-order, dùng null cho vị trí rỗng.", en: "Given two binary trees p and q, return True when they have the same structure and every corresponding node has the same value. Enter each tree in level order, using null for empty positions." },
    defaultInput: "1,2,3,null,4",
    inputKind: "string", inputLabel: { vi: "Cây p (level-order)", en: "Tree p (level-order)" },
    extraParams: [{ key: "q", label: { vi: "Cây q (level-order)", en: "Tree q (level-order)" }, type: "string", default: "1,2,3,null,4" }],
    approach: [
      { vi: "So sánh đúng cùng một vị trí của p và q: cả hai None thì True; chỉ một bên None thì False.", en: "Compare the same position in p and q: both None is True; exactly one None is False." },
      { vi: "Nếu cả hai node tồn tại, giá trị phải bằng nhau; sau đó so sánh cặp con trái và cặp con phải.", en: "If both nodes exist, their values must match; then compare the left-child pair and the right-child pair." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi cặp node tương ứng được kiểm tra tối đa một lần; stack đệ quy cao h.", en: "Each corresponding node pair is checked at most once; the recursion stack has height h." } },
    code: [
      "class Solution:",
      "    def isSameTree(self, p, q):",
      "        if not p and not q:",
      "            return True",
      "        if not p or not q:",
      "            return False",
      "        if p.val != q.val:",
      "            return False",
      "        return (self.isSameTree(p.left, q.left) and",
      "                self.isSameTree(p.right, q.right))",
    ],
    builder: buildSteps100,
  },
  101: {
    id: 101, difficulty: "easy", slug: "symmetric-tree",
    category: TREE_CAT,
    title: { vi: "Symmetric Tree", en: "Symmetric Tree" },
    titleVi: { vi: "Cây đối xứng", en: "Is the tree symmetric" },
    statement: { vi: "Cho root, kiểm tra cây có đối xứng qua trục giữa (là ảnh gương của chính nó) không. Nhập level-order.", en: "Given root, check whether the tree is symmetric about its center (a mirror of itself). Enter as level-order." },
    defaultInput: "1,2,2,3,4,4,3",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "So sánh 2 cây con: con trái và con phải phải là ảnh gương.", en: "Compare two subtrees: left and right must be mirror images." },
      { vi: "mirror(L, R): L.val == R.val và mirror(L.left, R.right) và mirror(L.right, R.left).", en: "mirror(L, R): L.val == R.val and mirror(L.left, R.right) and mirror(L.right, R.left)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi cặp nút 1 lần.", en: "Visit each node pair once." } },
    code: ["class Solution:", "    def isSymmetric(self, root):", "        def mirror(a, b):", "            if not a and not b:", "                return True", "            if not a or not b or a.val != b.val:", "                return False", "            return (mirror(a.left, b.right) and", "                    mirror(a.right, b.left))", "        return mirror(root.left, root.right) if root else True"],
    builder: buildSteps101,
  },
  637: {
    id: 637, difficulty: "easy", slug: "average-of-levels-in-binary-tree",
    category: TREE_CAT,
    title: { vi: "Average of Levels in Binary Tree", en: "Average of Levels in Binary Tree" },
    titleVi: { vi: "Trung bình mỗi tầng", en: "Average of each level" },
    statement: { vi: "Cho root, trả về mảng trung bình giá trị các nút trên MỖI tầng (từ gốc xuống). Nhập level-order.", en: "Given root, return an array of the average value of the nodes on EACH level (top to bottom). Enter as level-order." },
    defaultInput: "3,9,20,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "BFS theo tầng. Mỗi tầng: cộng tổng giá trị rồi chia số nút.", en: "BFS by level. For each level: sum the values then divide by the count." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng.", en: "Queue holds at most one level." } },
    code: ["class Solution:", "    def averageOfLevels(self, root):", "        res, queue = [], [root]", "        while queue:", "            vals = [n.val for n in queue]", "            res.append(sum(vals) / len(vals))", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    builder: buildSteps637,
  },
  199: {
    id: 199, difficulty: "medium", slug: "binary-tree-right-side-view",
    category: TREE_CAT,
    title: { vi: "Binary Tree Right Side View", en: "Binary Tree Right Side View" },
    titleVi: { vi: "Góc nhìn bên phải của cây", en: "Right side view of tree" },
    statement: { vi: "Cho root, tưởng tượng đứng bên PHẢI cây, trả về các nút nhìn thấy từ trên xuống dưới (nút phải nhất mỗi tầng). Nhập level-order.", en: "Given root, imagine standing on the RIGHT side, return the nodes you can see top to bottom (rightmost node of each level). Enter as level-order." },
    defaultInput: "1,2,3,null,5,null,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: BFS queue theo tầng", en: "Approach 1: BFS queue by level" } },
          { value: "2", label: { vi: "Cách 2: BFS deque + size", en: "Approach 2: BFS deque + size" } },
          { value: "3", label: { vi: "Cách 3: DFS ưu tiên nhánh phải", en: "Approach 3: right-first DFS" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: BFS theo tầng, lấy node cuối của queue hiện tại trước khi tạo queue tầng kế tiếp.", en: "Approach 1: BFS by level, taking the current queue's last node before building the next level." },
      { vi: "Cách 2: Dùng deque, chốt size của tầng rồi popleft đúng size node; node có i == size - 1 là node nhìn thấy bên phải.", en: "Approach 2: Use a deque, lock in the level size, then popleft exactly that many nodes; the node with i == size - 1 is visible from the right." },
      { vi: "Cách 3: DFS đi nhánh phải trước; node đầu tiên gặp tại mỗi depth được thêm vào res vì đó là node ngoài cùng bên phải.", en: "Approach 3: DFS explores right first; the first node reached at each depth enters res because it is the rightmost node." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "BFS dùng queue tối đa O(n); DFS dùng call stack O(h).", en: "BFS uses up to O(n) queue space; DFS uses O(h) call-stack space." } },
    codeLabel: { vi: "Cách 1: BFS queue theo tầng", en: "Approach 1: BFS queue by level" },
    code2Label: { vi: "Cách 2: BFS deque + size", en: "Approach 2: BFS deque + size" },
    code3Label: { vi: "Cách 3: DFS ưu tiên nhánh phải", en: "Approach 3: right-first DFS" },
    code: ["class Solution:", "    def rightSideView(self, root):", "        if not root: return []", "        res, queue = [], [root]", "        while queue:", "            res.append(queue[-1].val)   # rightmost", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    code2: [
      "class Solution:",
      "    def rightSideView(self, root):",
      "        res = []",
      "        if root is None:",
      "            return res",
      "        queue = collections.deque()",
      "        queue.append(root)",
      "        while queue:",
      "            size = len(queue)",
      "            for i in range(size):",
      "                curr = queue.popleft()",
      "                if curr.left:",
      "                    queue.append(curr.left)",
      "                if curr.right:",
      "                    queue.append(curr.right)",
      "                if i == size - 1:",
      "                    res.append(curr.val)",
      "        return res",
    ],
    code3: [
      "class Solution:",
      "    def rightSideView(self, root):",
      "        res = []",
      "        def dfs(node, depth):",
      "            if not node:",
      "                return",
      "            if depth == len(res):",
      "                res.append(node.val)",
      "            dfs(node.right, depth + 1)",
      "            dfs(node.left, depth + 1)",
      "        dfs(root, 0)",
      "        return res",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      if (approach === 3) return buildSteps199v3(input);
      return approach === 2 ? buildSteps199v2(input) : buildSteps199(input);
    },
  },
  236: {
    id: 236, difficulty: "medium", slug: "lowest-common-ancestor-of-a-binary-tree",
    category: TREE_CAT,
    title: { vi: "Lowest Common Ancestor of a Binary Tree", en: "Lowest Common Ancestor of a Binary Tree" },
    titleVi: { vi: "Tổ tiên chung thấp nhất", en: "LCA of a binary tree" },
    statement: { vi: "Cho root và 2 giá trị p, q (đảm bảo tồn tại), tìm tổ tiên chung THẤP NHẤT. Nhập level-order.", en: "Given root and two values p, q (guaranteed to exist), find their LOWEST common ancestor. Enter as level-order." },
    defaultInput: "3,5,1,6,2,0,8",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "p", label: { vi: "p", en: "p" }, allowNegative: true, default: 5 }, { key: "q", label: { vi: "q", en: "q" }, allowNegative: true, default: 1 }],
    approach: [
      { vi: "Đệ quy: nếu nút là p/q → trả nút. Nếu 2 nhánh con đều khác null → nút hiện tại là LCA.", en: "Recursion: if node is p/q → return it. If both child branches non-null → current node is LCA." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần.", en: "Visit each node once." } },
    code: ["class Solution:", "    def lowestCommonAncestor(self, root, p, q):", "        if not root:", "            return None", "        if root == p or root == q:", "            return root", "        left = self.lowestCommonAncestor(root.left, p, q)", "        right = self.lowestCommonAncestor(root.right, p, q)", "        if left and right:", "            return root", "        return left or right"],
    builder: buildSteps236,
  },
  1644: {
    id: 1644, difficulty: "medium", slug: "lowest-common-ancestor-of-a-binary-tree-ii",
    category: TREE_CAT,
    title: { vi: "LCA of a Binary Tree II", en: "Lowest Common Ancestor of a Binary Tree II" },
    titleVi: { vi: "LCA II (p/q có thể vắng)", en: "LCA II (p/q may be absent)" },
    statement: { vi: "Như bài 236 nhưng p hoặc q CÓ THỂ không tồn tại trong cây. Nếu thiếu một trong hai → trả null. Nhập level-order.", en: "Like 236 but p or q MAY not exist in the tree. If either is missing → return null. Enter as level-order." },
    defaultInput: "3,5,1,6,2,0,8",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      { key: "p", label: { vi: "p", en: "p" }, allowNegative: true, default: 5 },
      { key: "q", label: { vi: "q (thử 9 = vắng)", en: "q (try 9 = absent)" }, allowNegative: true, default: 1 },
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: đếm mid+l+r", en: "Approach 1: count mid+l+r" } },
          { value: "2", label: { vi: "Cách 2: post-order + findP/findQ", en: "Approach 2: post-order + findP/findQ" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: Phải duyệt HẾT cây để xác nhận cả p và q tồn tại. Đếm số phía khớp (con trái, con phải, chính nút). Nút đầu tiên có ≥2 phía khớp là ứng viên LCA; chỉ hợp lệ nếu cả p và q đều được tìm thấy.", en: "Approach 1: Must traverse the WHOLE tree to confirm both p and q exist. Count matched sides (left, right, self). First node with ≥2 matched sides is the LCA candidate; valid only if both p and q were found." },
      { vi: "Cách 2: Duyệt post-order (giống bài 236) nhưng dùng self.findP/self.findQ để tự xác nhận p, q có thực sự tồn tại trong cây hay không, thay vì đếm số lần khớp.", en: "Approach 2: Post-order traversal (like problem 236) but uses self.findP/self.findQ to confirm p, q actually exist in the tree, instead of counting matches." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt toàn bộ cây 1 lần.", en: "Full traversal once." } },
    codeLabel: { vi: "Cách 1: đếm mid+l+r", en: "Approach 1: count mid+l+r" },
    code2Label: { vi: "Cách 2: post-order + findP/findQ", en: "Approach 2: post-order + findP/findQ" },
    code: ["class Solution:", "    def lowestCommonAncestor(self, root, p, q):", "        self.ans = None", "        self.count = 0", "        def dfs(node):", "            if not node: return False", "            l = dfs(node.left)", "            r = dfs(node.right)", "            mid = node == p or node == q", "            if mid + l + r >= 2 and not self.ans:", "                self.ans = node", "            if mid: self.count += 1", "            return l or r or mid", "        dfs(root)", "        return self.ans if self.count == 2 else None"],
    code2: [
      "class Solution:",
      "    def lowestCommonAncestor(self, root, p, q):",
      "        self.findP = False",
      "        self.findQ = False",
      "        def post_order(node):",
      "            if not node:",
      "                return node",
      "            left = post_order(node.left)",
      "            right = post_order(node.right)",
      "            if node == p:",
      "                self.findP = True",
      "                return node",
      "            if node == q:",
      "                self.findQ = True",
      "                return node",
      "            if not left:",
      "                return right",
      "            elif not right:",
      "                return left",
      "            else:",
      "                return node",
      "        res = post_order(root)",
      "        if self.findP and self.findQ:",
      "            return res",
      "        else:",
      "            return None",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps1644v2(input, params) : buildSteps1644(input, params);
    },
  },
  1650: {
    id: 1650, difficulty: "medium", slug: "lowest-common-ancestor-of-a-binary-tree-iii",
    category: TREE_CAT,
    title: { vi: "LCA of a Binary Tree III", en: "Lowest Common Ancestor of a Binary Tree III" },
    titleVi: { vi: "LCA III (có con trỏ cha)", en: "LCA III (with parent pointers)" },
    statement: { vi: "Mỗi nút có con trỏ tới CHA. Cho 2 nút p, q, tìm LCA mà không cần root. Nhập level-order (mô phỏng parent qua cấu trúc).", en: "Each node has a pointer to its PARENT. Given two nodes p, q, find LCA without the root. Enter as level-order (parents simulated from structure)." },
    defaultInput: "3,5,1,6,2,0,8",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "p", label: { vi: "p", en: "p" }, allowNegative: true, default: 6 }, { key: "q", label: { vi: "q", en: "q" }, allowNegative: true, default: 0 }],
    approach: [
      { vi: "Thu tập tổ tiên của p (đi lên qua parent). Đi lên từ q, nút đầu tiên có trong tập đó là LCA.", en: "Collect p's ancestors (walk up via parent). Walk up from q; the first node in that set is the LCA." },
      { vi: "Hoặc dùng 2 con trỏ kiểu giao 2 danh sách liên kết: a=a.parent or q, b=b.parent or p.", en: "Or use two pointers like linked-list intersection: a=a.parent or q, b=b.parent or p." },
    ],
    complexity: { time: "O(h)", space: "O(h)", note: { vi: "Đi lên 2 đường tới gốc.", en: "Two upward walks to the root." } },
    code: ["class Solution:", "    def lowestCommonAncestor(self, p, q):", "        ancestors = set()", "        node = p", "        while node:", "            ancestors.add(node)", "            node = node.parent", "        node = q", "        while node:", "            if node in ancestors:", "                return node", "            node = node.parent", "        return None"],
    builder: buildSteps1650,
  },
  1676: {
    id: 1676, difficulty: "medium", slug: "lowest-common-ancestor-of-a-binary-tree-iv",
    category: TREE_CAT,
    title: { vi: "LCA of a Binary Tree IV", en: "Lowest Common Ancestor of a Binary Tree IV" },
    titleVi: { vi: "LCA IV (mảng nút)", en: "LCA IV (array of nodes)" },
    statement: { vi: "Cho root và một MẢNG các nút, tìm LCA của tất cả chúng. Nhập level-order; nhập danh sách giá trị nút cần tìm LCA.", en: "Given root and an ARRAY of nodes, find their LCA. Enter as level-order; provide the list of node values." },
    defaultInput: "3,5,1,6,2,0,8",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "nodes", label: { vi: "nodes (vd: 6,2,0)", en: "nodes (e.g. 6,2,0)" }, type: "string", default: "6,2,0" }],
    approach: [
      { vi: "Tổng quát hóa 236: đệ quy, nếu nút thuộc tập đích → trả nút; nếu 2 nhánh đều khác null → LCA.", en: "Generalize 236: recursion, if node is in target set → return it; if both branches non-null → LCA." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần.", en: "Visit each node once." } },
    code: ["class Solution:", "    def lowestCommonAncestor(self, root, nodes):", "        targets = set(nodes)", "        def dfs(node):", "            if not node:", "                return None", "            if node in targets:", "                return node", "            left = dfs(node.left)", "            right = dfs(node.right)", "            if left and right:", "                return node", "            return left or right", "        return dfs(root)"],
    builder: buildSteps1676,
  },
  1123: {
    id: 1123, difficulty: "medium", slug: "lowest-common-ancestor-of-deepest-leaves",
    category: TREE_CAT,
    title: { vi: "LCA of Deepest Leaves", en: "Lowest Common Ancestor of Deepest Leaves" },
    titleVi: { vi: "LCA của các lá sâu nhất", en: "LCA of the deepest leaves" },
    statement: { vi: "Cho root, tìm tổ tiên chung thấp nhất của TẤT CẢ các lá sâu nhất. Nhập level-order.", en: "Given root, find the lowest common ancestor of ALL the deepest leaves. Enter as level-order." },
    defaultInput: "3,5,1,6,2,0,8,null,null,7,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Mỗi dfs trả về (chiều cao cây con, LCA của các lá sâu nhất trong cây con đó). None có chiều cao 0; lá có chiều cao 1.", en: "Each dfs returns (subtree height, LCA of that subtree's deepest leaves). None has height 0; a leaf has height 1." },
      { vi: "Nếu hai phía cao bằng nhau, lá sâu nhất nằm ở cả hai phía nên node hiện tại là điểm gặp thấp nhất. Nếu lệch, chỉ giữ kết quả của phía cao hơn.", en: "If both sides have equal height, deepest leaves occur on both sides, so the current node is their lowest meeting point. Otherwise keep the taller side's result." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi node được xử lý đúng một lần bằng postorder; h là chiều cao cây.", en: "Each node is processed once in postorder; h is the tree height." } },
    code: ["class Solution:", "    def lcaDeepestLeaves(self, root):", "        def dfs(node):", "            if not node:", "                return (0, None)", "            ld, ln = dfs(node.left)", "            rd, rn = dfs(node.right)", "            if ld == rd:", "                return (ld + 1, node)", "            return (ld + 1, ln) if ld > rd else (rd + 1, rn)", "        return dfs(root)[1]"],
    builder: buildSteps1123,
  },
  366: {
    id: 366, difficulty: "medium", slug: "find-leaves-of-binary-tree",
    category: TREE_CAT,
    title: { vi: "Find Leaves of Binary Tree", en: "Find Leaves of Binary Tree" },
    titleVi: { vi: "Gỡ lá theo vòng", en: "Collect leaves round by round" },
    statement: { vi: "Lần lượt thu các lá rồi gỡ chúng, lặp lại cho tới khi cây rỗng. Trả về danh sách các vòng. Nhập level-order.", en: "Repeatedly collect leaves and remove them until the tree is empty. Return the list of rounds. Enter as level-order." },
    defaultInput: "1,2,3,4,5",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Nhóm của mỗi nút = chiều cao từ dưới lên (lá = 0). height(node) = 1 + max(con).", en: "Each node's group = its height from the bottom (leaf = 0). height(node) = 1 + max(children)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần duyệt postorder.", en: "One postorder pass." } },
    code: ["class Solution:", "    def findLeaves(self, root):", "        res = []", "        def dfs(node):", "            if not node:", "                return -1", "            h = 1 + max(dfs(node.left), dfs(node.right))", "            if h == len(res):", "                res.append([])", "            res[h].append(node.val)", "            return h", "        dfs(root)", "        return res"],
    builder: buildSteps366,
  },
  863: {
    id: 863, difficulty: "medium", slug: "all-nodes-distance-k-in-binary-tree",
    category: TREE_CAT,
    title: { vi: "All Nodes Distance K in Binary Tree", en: "All Nodes Distance K in Binary Tree" },
    titleVi: { vi: "Các nút cách target K bước", en: "Nodes at distance K from target" },
    statement: { vi: "Cho root, một nút target và số k, trả về giá trị tất cả nút cách target đúng k cạnh. Nhập level-order.", en: "Given root, a target node, and k, return values of all nodes exactly k edges from target. Enter as level-order." },
    defaultInput: "3,5,1,6,2,0,8,null,null,7,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: queue lưu (node, distance)", en: "Approach 1: queue stores (node, distance)" } },
          { value: "2", label: { vi: "Cách 2: BFS theo từng layer", en: "Approach 2: layer-by-layer BFS" } },
        ],
      },
      { key: "target", label: { vi: "target", en: "target" }, allowNegative: true, default: 5 },
      { key: "k", label: { vi: "k", en: "k" }, default: 2 },
    ],
    approach: [
      { vi: "Cách 1: queue lưu cả node và distance; node có distance == k được thêm vào result.", en: "Approach 1: store both node and distance in the queue; append nodes whose distance equals k." },
      { vi: "Cách 2: queue chỉ lưu node của các layer; khi distance == k, toàn bộ queue chính là đáp án.", en: "Approach 2: the queue stores layer nodes only; when distance == k, the entire queue is the answer." },
      { vi: "Cả hai cách đều xây map con→cha để có thể đi trái, phải hoặc ngược lên cha.", en: "Both approaches build a child→parent map so traversal can move left, right, or upward to the parent." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Map cha + BFS đều O(n).", en: "Parent map + BFS both O(n)." } },
    codeLabel: { vi: "Cách 1: queue lưu (node, distance)", en: "Approach 1: queue stores (node, distance)" },
    code2Label: { vi: "Cách 2: BFS theo từng layer", en: "Approach 2: layer-by-layer BFS" },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def distanceK(self, root, target, k):",
      "        parent = {}",
      "        def build_parent(node, par):",
      "            if not node:",
      "                return",
      "            parent[node] = par",
      "            build_parent(node.left, node)",
      "            build_parent(node.right, node)",
      "        build_parent(root, None)",
      "",
      "        queue = deque([(target, 0)])",
      "        visited = {target}",
      "        result = []",
      "        while queue:",
      "            node, distance = queue.popleft()",
      "            if distance == k:",
      "                result.append(node.val)",
      "                continue",
      "            for neighbor in (node.left, node.right, parent[node]):",
      "                if neighbor and neighbor not in visited:",
      "                    visited.add(neighbor)",
      "                    queue.append((neighbor, distance + 1))",
      "        return result",
    ],
    code2: [
      "from collections import deque",
      "",
      "",
      "class Solution:",
      "    def distanceK(self, root, target, k):",
      "        parent = {}",
      "",
      "        # Bước 1: lưu parent của mỗi node",
      "        def build_parent(node, par):",
      "            if node is None:",
      "                return",
      "",
      "            parent[node] = par",
      "",
      "            build_parent(node.left, node)",
      "            build_parent(node.right, node)",
      "",
      "        build_parent(root, None)",
      "",
      "        # Bước 2: BFS bắt đầu từ target",
      "        queue = deque([target])",
      "        visited = {target}",
      "        distance = 0",
      "",
      "        while queue:",
      "            # Khi đã đi đúng k cạnh",
      "            if distance == k:",
      "                return [node.val for node in queue]",
      "",
      "            size = len(queue)",
      "",
      "            for _ in range(size):",
      "                node = queue.popleft()",
      "",
      "                # Có thể đi trái, phải hoặc lên cha",
      "                for neighbor in (node.left, node.right, parent[node]):",
      "                    if neighbor is not None and neighbor not in visited:",
      "                        visited.add(neighbor)",
      "                        queue.append(neighbor)",
      "",
      "            distance += 1",
      "",
      "        return []",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps863v2(input, params) : buildSteps863(input, params);
    },
  },
  156: {
    id: 156, difficulty: "medium", slug: "binary-tree-upside-down",
    category: TREE_CAT,
    title: { vi: "Binary Tree Upside Down", en: "Binary Tree Upside Down" },
    titleVi: { vi: "Lật ngược cây", en: "Turn the tree upside down" },
    statement: { vi: "Cây mà mọi nút phải là lá có anh em trái và không con. Lật ngược: con trái cũ thành gốc mới. Nhập level-order (cây lệch trái).", en: "A tree where every right node is a leaf with a left sibling and no children. Turn it upside down: old left child becomes the new root. Enter as level-order (left-leaning)." },
    defaultInput: "1,2,3,4,5",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đi theo nhánh trái nhất. Tại mỗi nút: left.left = right; left.right = node; xóa con của node.", en: "Follow the leftmost path. At each node: left.left = right; left.right = node; clear node's children." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Đi theo 1 nhánh trái.", en: "Follow one left spine." } },
    code: ["class Solution:", "    def upsideDownBinaryTree(self, root):", "        if not root or not root.left:", "            return root", "        new_root = self.upsideDownBinaryTree(root.left)", "        root.left.left = root.right", "        root.left.right = root", "        root.left = None", "        root.right = None", "        return new_root"],
    builder: buildSteps156,
  },
  337: {
    id: 337, difficulty: "medium", slug: "house-robber-iii",
    category: TREE_CAT,
    title: { vi: "House Robber III", en: "House Robber III" },
    titleVi: { vi: "Trộm nhà III (trên cây)", en: "Rob houses arranged in a tree" },
    statement: { vi: "Nhà xếp thành cây. Không được trộm 2 nhà nối trực tiếp (cha-con). Tìm số tiền tối đa. Nhập level-order.", en: "Houses form a tree. Cannot rob two directly-linked houses (parent-child). Find the maximum money. Enter as level-order." },
    defaultInput: "3,2,3,null,3,null,1",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "DP trên cây: mỗi nút trả [rob, skip]. rob = val + skip(trái) + skip(phải). skip = max(trái) + max(phải).", en: "Tree DP: each node returns [rob, skip]. rob = val + skip(left) + skip(right). skip = max(left) + max(right)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần duyệt postorder.", en: "One postorder pass." } },
    code: ["class Solution:", "    def rob(self, root):", "        def dfs(node):", "            if not node:", "                return (0, 0)", "            l = dfs(node.left)", "            r = dfs(node.right)", "            rob = node.val + l[1] + r[1]", "            skip = max(l) + max(r)", "            return (rob, skip)", "        return max(dfs(root))"],
    builder: buildSteps337,
  },
  116: {
    id: 116, difficulty: "medium", slug: "populating-next-right-pointers-in-each-node",
    category: TREE_CAT,
    title: { vi: "Populating Next Right Pointers in Each Node", en: "Populating Next Right Pointers in Each Node" },
    titleVi: { vi: "Nối con trỏ next mỗi tầng", en: "Populate next right pointers" },
    statement: { vi: "Cho cây nhị phân HOÀN HẢO, nối mỗi nút tới nút bên phải cùng tầng (next); nút phải nhất → null. Nhập level-order.", en: "Given a PERFECT binary tree, connect each node to its right neighbor on the same level (next); rightmost → null. Enter as level-order." },
    defaultInput: "1,2,3,4,5,6,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "BFS theo tầng, nối lần lượt các nút. Hoặc O(1) bộ nhớ: dùng next của tầng trên để đi ngang tầng dưới.", en: "BFS by level, link nodes in order. Or O(1) memory: use the parent level's next to traverse the next level." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "BFS O(n) (O(1) nếu dùng next có sẵn).", en: "BFS O(n) (O(1) if reusing next pointers)." } },
    code: ["class Solution:", "    def connect(self, root):", "        if not root: return root", "        leftmost = root", "        while leftmost.left:", "            node = leftmost", "            while node:", "                node.left.next = node.right", "                if node.next:", "                    node.right.next = node.next.left", "                node = node.next", "            leftmost = leftmost.left", "        return root"],
    builder: buildSteps116,
  },
  103: {
    id: 103, difficulty: "medium", slug: "binary-tree-zigzag-level-order-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Zigzag Level Order Traversal", en: "Binary Tree Zigzag Level Order Traversal" },
    titleVi: { vi: "Duyệt tầng kiểu zigzag", en: "Zigzag level order" },
    statement: { vi: "Cho root, duyệt theo tầng nhưng đảo chiều xen kẽ (trái→phải, rồi phải→trái...). Nhập level-order.", en: "Given root, traverse by level but alternate direction (left→right, then right→left...). Enter as level-order." },
    defaultInput: "1,2,3,4,5,6,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      {
        key: "approach", label: { vi: "Cách giải", en: "Approach" }, type: "select", default: "1",
        options: [
          { value: "1", label: { vi: "Cách 1: queue + cờ ltr", en: "Approach 1: queue + ltr flag" } },
          { value: "2", label: { vi: "Cách 2: deque + level%2 (chi tiết)", en: "Approach 2: deque + level%2 (detailed)" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: BFS theo tầng, đảo ngược tầng nếu cờ ltr là False.", en: "Approach 1: BFS by level, reverse the level if the ltr flag is False." },
      { vi: "Cách 2: deque + popleft, xác định chiều bằng level % 2, debug từng dòng chi tiết bao gồm mỗi lần append/pop.", en: "Approach 2: deque + popleft, direction decided by level % 2, fully detailed line-by-line debug including every append/pop." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng.", en: "Queue holds at most one level." } },
    codeLabel: { vi: "Cách 1: queue + cờ ltr", en: "Approach 1: queue + ltr flag" },
    code2Label: { vi: "Cách 2: deque + level%2", en: "Approach 2: deque + level%2" },
    code: ["class Solution:", "    def zigzagLevelOrder(self, root):", "        if not root: return []", "        res, queue, ltr = [], [root], True", "        while queue:", "            vals = [n.val for n in queue]", "            res.append(vals if ltr else vals[::-1])", "            ltr = not ltr", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    code2: [
      "class Solution:",
      "    def zigzagLevelOrder(self, root):",
      "        if not root:",
      "            return []",
      "        queue = collections.deque()",
      "        queue.append(root)",
      "        level = 0",
      "        result = []",
      "        while queue:",
      "            size = len(queue)",
      "            lst = []",
      "            for _ in range(size):",
      "                node = queue.popleft()",
      "                lst.append(node.val)",
      "                if node.left:",
      "                    queue.append(node.left)",
      "                if node.right:",
      "                    queue.append(node.right)",
      "            if level % 2 == 0:",
      "                result.append(lst)",
      "            else:",
      "                result.append(lst[::-1])",
      "            level += 1",
      "        return result",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
      return approach === 2 ? buildSteps103v2(input) : buildSteps103(input);
    },
  },
  314: {
    id: 314, difficulty: "medium", slug: "binary-tree-vertical-order-traversal",
    category: TREE_CAT,
    title: { vi: "Binary Tree Vertical Order Traversal", en: "Binary Tree Vertical Order Traversal" },
    titleVi: { vi: "Duyệt theo cột dọc", en: "Vertical order traversal" },
    statement: { vi: "Cho root, trả về duyệt theo CỘT từ trái sang phải; trong cùng cột, theo thứ tự trên→dưới (cùng hàng thì trái→phải). Nhập level-order.", en: "Given root, return the VERTICAL order (columns left to right); within a column, top→bottom (same row → left→right). Enter as level-order." },
    defaultInput: "3,9,20,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Gán cột: gốc 0, trái -1, phải +1. BFS để giữ đúng thứ tự, gom theo cột rồi sắp xếp cột.", en: "Assign columns: root 0, left -1, right +1. BFS to keep correct order, group by column then sort columns." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "BFS + gom theo cột.", en: "BFS + group by column." } },
    code: ["class Solution:", "    def verticalOrder(self, root):", "        if not root: return []", "        from collections import defaultdict, deque", "        cols = defaultdict(list)", "        q = deque([(root, 0)])", "        while q:", "            node, c = q.popleft()", "            cols[c].append(node.val)", "            if node.left: q.append((node.left, c - 1))", "            if node.right: q.append((node.right, c + 1))", "        return [cols[c] for c in sorted(cols)]"],
    builder: buildSteps314,
  },
  987: {
    id: 987, difficulty: "hard", slug: "vertical-order-traversal-of-a-binary-tree",
    category: TREE_CAT,
    title: { vi: "Vertical Order Traversal of a Binary Tree", en: "Vertical Order Traversal of a Binary Tree" },
    titleVi: { vi: "Duyệt theo cột dọc (tie-break bằng giá trị)", en: "Vertical order traversal (value tie-break)" },
    statement: {
      vi: "Cho root, trả về duyệt theo CỘT (trái→phải). Trong cùng cột: theo HÀNG (trên→dưới); nếu CÙNG hàng thì theo GIÁ TRỊ tăng dần. Đây là điểm khác bài 314. Nhập level-order.",
      en: "Given root, return the VERTICAL order (columns left→right). Within a column: by ROW (top→bottom); if SAME row, by VALUE ascending. This is the difference from 314. Enter as level-order.",
    },
    defaultInput: "3,9,20,null,null,15,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "DFS gán (hàng, cột): gốc (0,0), trái (row+1, col-1), phải (row+1, col+1).", en: "DFS assign (row, col): root (0,0), left (row+1, col-1), right (row+1, col+1)." },
      { vi: "Gom các nút theo cột.", en: "Group nodes by column." },
      { vi: "Sắp mỗi cột theo (hàng, GIÁ TRỊ) — khác 314 ở việc tie-break bằng giá trị.", en: "Sort each column by (row, VALUE) — differs from 314 by breaking ties with value." },
      { vi: "Ghép các cột từ trái sang phải.", en: "Concatenate columns left to right." },
    ],
    complexity: { time: "O(n log n)", space: "O(n)", note: { vi: "Sắp xếp trong từng cột tốn n log n.", en: "Sorting within columns costs n log n." } },
    code: [
      "class Solution:",
      "    def verticalTraversal(self, root):",
      "        cols = defaultdict(list)",
      "        def dfs(node, row, col):",
      "            if not node: return",
      "            cols[col].append((row, node.val))",
      "            dfs(node.left, row+1, col-1)",
      "            dfs(node.right, row+1, col+1)",
      "        dfs(root, 0, 0)",
      "        return [[v for _, v in sorted(cols[c])] for c in sorted(cols)]",
    ],
    builder: buildSteps987,
  },
  297: {
    id: 297, difficulty: "hard", slug: "serialize-and-deserialize-binary-tree",
    category: TREE_CAT,
    title: { vi: "Serialize and Deserialize Binary Tree", en: "Serialize and Deserialize Binary Tree" },
    titleVi: { vi: "Mã hóa & giải mã cây", en: "Serialize / deserialize a tree" },
    statement: { vi: "Thiết kế thuật toán mã hóa cây thành chuỗi và giải mã chuỗi về lại cây. Dùng preorder + ký hiệu null. Nhập level-order.", en: "Design an algorithm to encode a tree to a string and decode it back. Use preorder + null markers. Enter as level-order." },
    defaultInput: "1,2,3,null,null,4,5",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "SERIALIZE: preorder, ghi giá trị, ghi '#' cho null → chuỗi duy nhất.", en: "SERIALIZE: preorder, write value, write '#' for null → a unique string." },
      { vi: "DESERIALIZE: đọc token theo thứ tự; '#' → null, số → tạo nút rồi dựng con trái, con phải.", en: "DESERIALIZE: read tokens in order; '#' → null, number → create node then build left, right." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Mỗi nút ghi/đọc 1 lần.", en: "Each node written/read once." } },
    code: ["class Codec:", "    def serialize(self, root):", "        res = []", "        def dfs(node):", "            if not node:", "                res.append('#'); return", "            res.append(str(node.val))", "            dfs(node.left); dfs(node.right)", "        dfs(root)", "        return ','.join(res)", "    def deserialize(self, data):", "        vals = iter(data.split(','))", "        def build():", "            v = next(vals)", "            if v == '#': return None", "            node = TreeNode(int(v))", "            node.left = build(); node.right = build()", "            return node", "        return build()"],
    builder: buildSteps297,
  },
  2791: {
    id: 2791,
    difficulty: "hard",
    slug: "count-paths-that-can-form-a-palindrome-in-a-tree",
    category: TREE_CAT,
    tags: [{ key: "bitmask", vi: "Bitmask", en: "Bitmask" }, { key: "hashmap", vi: "Hash Map", en: "Hash Map" }],
    title: { vi: "Count Paths That Can Form a Palindrome in a Tree", en: "Count Paths That Can Form a Palindrome in a Tree" },
    titleVi: { vi: "Đếm đường đi có thể tạo palindrome trong cây", en: "Count tree paths that can form a palindrome" },
    statement: {
      vi: "Cho cây gốc 0 bằng mảng parent và chuỗi s, trong đó s[i] là ký tự trên cạnh parent[i] → i. Đếm số cặp node (u, v), u < v, sao cho các ký tự trên đường u ↔ v có thể hoán vị thành palindrome. Nhập dạng parent|s.",
      en: "Given a rooted tree at 0 as parent and string s, where s[i] labels edge parent[i] → i. Count pairs (u, v), u < v, whose path letters can be rearranged into a palindrome. Input as parent|s.",
    },
    defaultInput: "-1,0,0,1,1,2|acaabc",
    inputKind: "string",
    inputLabel: { vi: "parent|s", en: "parent|s" },
    extraParams: [],
    approach: [
      {
        vi: "Gán mask 26-bit cho mỗi node: bit bật nghĩa là chữ đó xuất hiện lẻ lần trên đường root → node.",
        en: "Assign each node a 26-bit mask: an enabled bit means that letter appears an odd number of times on root → node.",
      },
      {
        vi: "Đường u ↔ v có parity mask = mask[u] XOR mask[v]. Có thể thành palindrome khi XOR này có 0 hoặc 1 bit bật.",
        en: "Path u ↔ v has parity mask = mask[u] XOR mask[v]. It can form a palindrome when this XOR has 0 or 1 enabled bit.",
      },
      {
        vi: "Duyệt các mask, dùng Counter đếm các mask đã gặp: cộng seen[mask] và seen[mask XOR (1<<bit)] cho 26 bit.",
        en: "Scan masks with a Counter of earlier masks: add seen[mask] and seen[mask XOR (1<<bit)] for all 26 bits.",
      },
    ],
    complexity: { time: "O(26n)", space: "O(n)", note: { vi: "Mỗi node kiểm tra 27 mask.", en: "Each node checks 27 masks." } },
    code: [
      "from collections import Counter",
      "",
      "class Solution:",
      "    def countPalindromePaths(self, parent, s):",
      "        children = [[] for _ in parent]",
      "        for node in range(1, len(parent)):",
      "            children[parent[node]].append(node)",
      "",
      "        masks = [0] * len(parent)",
      "        stack = [0]",
      "        while stack:",
      "            node = stack.pop()",
      "            for child in children[node]:",
      "                bit = 1 << (ord(s[child]) - ord('a'))",
      "                masks[child] = masks[node] ^ bit",
      "                stack.append(child)",
      "",
      "        ans = 0",
      "        seen = Counter()",
      "        for mask in masks:",
      "            ans += seen[mask]",
      "            for bit in range(26):",
      "                ans += seen[mask ^ (1 << bit)]",
      "            seen[mask] += 1",
      "        return ans",
    ],
    liveArgs: (input) => {
      const { parent, s } = parsePalindromePathInput(input);
      return [parent, s];
    },
    builder: buildSteps2791,
  },
};

// ─── 968: Binary Tree Cameras ───
// Faithful LINE-BY-LINE trace of the greedy post-order DFS shown in the UI.
// States follow problem.code: 0 = needs a camera, 1 = has a camera, 2 = covered.
function buildSteps968(input) {
  const root = parseTree(input);
  const nodes = [];
  const collect = (node, parentId = null, depth = 0) => {
    if (!node) return;
    nodes.push({ id: node.id, val: node.val, parentId, depth,
      leftId: node.left ? node.left.id : null, rightId: node.right ? node.right.id : null });
    collect(node.left, node.id, depth + 1);
    collect(node.right, node.id, depth + 1);
  };
  collect(root);
  if (!nodes.length) throw new Error("Enter a tree with at least one node.");
  if (nodes.length > 15) throw new Error("Use a tree with at most 15 nodes for this visualization.");

  const steps = [];
  let cameras = 0;
  const camSet = new Set();
  const stateMap = new Map(); // id -> 0 | 1 | 2

  function coveredList() {
    const covered = new Set();
    for (const id of camSet) {
      covered.add(id);
      const me = nodes.find((nd) => nd.id === id);
      if (me.parentId != null) covered.add(me.parentId);
      if (me.leftId != null) covered.add(me.leftId);
      if (me.rightId != null) covered.add(me.rightId);
    }
    return [...covered];
  }

  function snapshot(line, phase, currentNode, retState, extraVars, title, note, final = false) {
    steps.push({
      title,
      note,
      final,
      arr: [],
      sub: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        ...(currentNode ? [{ name: "node", value: currentNode.val }] : []),
        ...(extraVars || []),
        ...(retState !== null ? [{ name: "return", value: retState }] : []),
        { name: "cameras", value: cameras },
        ...(final ? [{ name: "result", value: cameras }] : []),
      ],
      camera968View: {
        nodes: nodes.map(({ id, val, parentId, leftId, rightId }) => ({ id, val, parentId, leftId, rightId })),
        cameraIds: [...camSet],
        coveredIds: coveredList(),
        states: Object.fromEntries(stateMap),
        currentId: currentNode ? currentNode.id : null,
        phase,
        answer: cameras,
      },
    });
  }

  snapshot(3, "init", null, null, null, {
    vi: "cameras = 0",
    en: "cameras = 0",
  }, {
    vi: "Chiến lược tham lam: xử lý TỪ DƯỚI LÊN (hậu tự). Trạng thái mỗi node: 0=cần camera, 1=có camera, 2=được cover.",
    en: "Greedy strategy: process BOTTOM-UP (post-order). Each node returns 0=needs camera, 1=has camera, 2=covered.",
  });

  function dfs(node) {
    if (!node) {
      snapshot(6, "base", null, 2, null, {
        vi: "node rỗng → return 2",
        en: "null node → return 2",
      }, {
        vi: "Node null coi như ĐÃ được cover nên không bao giờ ép cha đặt camera.",
        en: "A null child counts as COVERED so it never forces the parent to host a camera.",
      });
      return 2;
    }

    snapshot(4, "call", node, null, null, {
      vi: `dfs(${node.val})`,
      en: `dfs(${node.val})`,
    }, {
      vi: "Giải quyết hai cây con TRƯỚC rồi mới quyết định tại node này.",
      en: "Resolve both subtrees FIRST, only then decide at this node.",
    });

    const leftState = dfs(node.left);
    const rightState = dfs(node.right);
    snapshot(7, "states", node, null, [
      { name: "left", value: leftState },
      { name: "right", value: rightState },
    ], {
      vi: `left=${leftState}, right=${rightState}`,
      en: `left=${leftState}, right=${rightState}`,
    }, {
      vi: "Trạng thái nghĩa: 0 cần camera · 1 có camera · 2 được cover. Dựa vào đó chọn một trong ba nhánh bên dưới.",
      en: "Meaning: 0 needs a camera · 1 has one · 2 covered. These decide which branch runs next.",
    });

    if (leftState === 0 || rightState === 0) {
      cameras += 1;
      camSet.add(node.id);
      stateMap.set(node.id, 1);
      snapshot(9, "place", node, 1, null, {
        vi: `${leftState === 0 ? "left" : "right"}=0 → đặt camera tại ${node.val}, return 1`,
        en: `${leftState === 0 ? "left" : "right"}=0 → place camera at ${node.val}, return 1`,
      }, {
        vi: "Có con CHƯA được ai cover nên buộc phải đặt camera ngay đây (tối ưu nhất vì camera ở cha không thể cứu con sâu hơn).",
        en: "One child is UNCOVERED by anybody, so a camera must go here (a grandparent camera could never reach it).",
      });
      return 1;
    }
    if (leftState === 1 || rightState === 1) {
      stateMap.set(node.id, 2);
      snapshot(12, "covered", node, 2, null, {
        vi: `Con có camera → ${node.val} được cover, return 2`,
        en: `A child owns a camera → ${node.val} is covered, return 2`,
      }, {
        vi: "Tiết kiệm nhất: dùng lại camera của con, KHÔNG đặt thêm.",
        en: "Cheapest option: reuse the child's camera, place nothing.",
      });
      return 2;
    }
    stateMap.set(node.id, 0);
    snapshot(13, "needs", node, 0, null, {
      vi: `Hai con đều được cover → ${node.val} return 0`,
      en: `Both children covered → ${node.val} returns 0`,
    }, {
      vi: "Chưa ai phủ node này: đẩy quyết định lên CHO CHA xử lý (tham lam để camera càng cao càng ít).",
      en: "Nobody covers this node yet: defer the choice to ITS PARENT (greedy keeps cameras higher and fewer).",
    });
    return 0;
  }

  const rootState = dfs(root);
  snapshot(14, "root-check", root, rootState, null, {
    vi: `dfs(root) = ${rootState}`,
    en: `dfs(root) = ${rootState}`,
  }, {
    vi: rootState === 0
      ? "Gốc trả về 0 tức chưa được ai phủ."
      : "Gốc đã được phủ hoặc tự có camera nên kết thúc.",
    en: rootState === 0
      ? "The root returned 0, meaning nobody covers it yet."
      : "The root is already covered or hosts a camera, so we are done.",
  });

  if (rootState === 0) {
    cameras += 1;
    camSet.add(root.id);
    stateMap.set(root.id, 1);
    snapshot(15, "place-root", root, null, null, {
      vi: `Gốc cần camera → đặt tại ${root.val}`,
      en: `Root needs one → place a camera at ${root.val}`,
    }, {
      vi: "Trường hợp duy nhất camera bị đếm sau vòng DFS.",
      en: "The only case where a camera is added after the DFS finishes.",
    });
  }

  snapshot(16, "done", null, null, null, {
    vi: `Kết quả: ${cameras} camera`,
    en: `Result: ${cameras} camera${cameras === 1 ? "" : "s"}`,
  }, {
    vi: `Toàn bộ ${nodes.length} node đều được quan sát bởi chính nó, cha hoặc con — tối thiểu ${cameras} camera.`,
    en: `All ${nodes.length} nodes are watched by themselves, a parent, or a child — ${cameras} is minimal.`,
  }, true);

  return { steps, answer: cameras };
}

Object.assign(module.exports, {
  968: {
    id: 968, difficulty: "hard", slug: "binary-tree-cameras", category: TREE_CAT,
    title: { vi: "Binary Tree Cameras", en: "Binary Tree Cameras" },
    titleVi: { vi: "Camera cho cây nhị phân", en: "Binary Tree Cameras" },
    statement: { vi: "Đặt số camera ít nhất để mọi node được camera ở chính nó, node cha hoặc node con quan sát.", en: "Place the fewest cameras so every node is monitored by itself, its parent, or a child." },
    defaultInput: "0,0,null,0,0", inputKind: "string", inputLabel: { vi: "cây level-order (null cho node rỗng)", en: "level-order tree (null for an empty node)" },
    approach: [{ vi: "DFS hậu tự trả về ba trạng thái: cần camera, có camera, hoặc đã được cover. Node chỉ đặt camera khi một con cần nó.", en: "Postorder DFS returns needs-camera, has-camera, or covered. A node gets a camera only when a child needs one." }],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "h là chiều cao cây do stack đệ quy.", en: "h is the tree height used by recursion." } },
    code: ["class Solution:", "    def minCameraCover(self, root):", "        cameras = 0", "        def dfs(node):", "            nonlocal cameras", "            if not node: return 2  # covered", "            left, right = dfs(node.left), dfs(node.right)", "            if left == 0 or right == 0:", "                cameras += 1", "                return 1  # camera here", "            if left == 1 or right == 1:", "                return 2  # covered by child", "            return 0  # parent must cover me", "        if dfs(root) == 0:", "            cameras += 1", "        return cameras"],
    builder: buildSteps968,
  },
});

Object.assign(module.exports, require("./tree-bfs"));

function parseAverageSubtreeInput(input, { maxValue = 1000, maxNodes = 31 } = {}) {
  const raw = Array.isArray(input)
    ? input
    : String(input ?? "").trim().replace(/^\[|\]$/g, "").split(",").map((item) => item.trim());
  if (!raw.length || raw.every((item) => item === "")) throw new Error("Enter a non-empty binary tree");
  const values = raw.map((item) => {
    if (item === null || String(item).toLowerCase() === "null" || String(item) === "") return null;
    const value = Number(item);
    if (!Number.isInteger(value) || value < 0 || value > maxValue) throw new Error(`Tree values must be integers from 0 to ${maxValue}, or null`);
    return value;
  });
  if (values[0] === null) throw new Error("The root cannot be null");

  let nextId = 0;
  const root = { id: nextId++, val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const parent = queue.shift();
    if (values[index] !== null) {
      parent.left = { id: nextId++, val: values[index], left: null, right: null };
      queue.push(parent.left);
    }
    index++;
    if (index < values.length && values[index] !== null) {
      parent.right = { id: nextId++, val: values[index], left: null, right: null };
      queue.push(parent.right);
    }
    index++;
  }
  if (index < values.length && values.slice(index).some((value) => value !== null)) throw new Error("Invalid level-order tree: values remain after all parents are null");
  if (nextId > maxNodes) throw new Error(`Visualization supports at most ${maxNodes} tree nodes`);
  return root;
}

function buildSteps1120(input) {
  const root = parseAverageSubtreeInput(input, { maxValue: 100000, maxNodes: 31 });
  const layout = treeToVizNodes(root, null, null);
  const nodeById = new Map();
  (function indexNodes(node) {
    if (!node) return;
    nodeById.set(node.id, node);
    indexNodes(node.left);
    indexNodes(node.right);
  })(root);

  const steps = [];
  const stack = [];
  const stats = new Map();
  let best = 0;
  let bestNode = null;

  const subtreeIds = (node) => {
    const ids = [];
    (function collect(current) {
      if (!current) return;
      ids.push(current.id);
      collect(current.left);
      collect(current.right);
    })(node);
    return ids;
  };

  const makeView = ({ phase = "postorder", phaseIndex = 0, event = "start", current = null, formula = null } = {}) => ({
    phase,
    phaseIndex,
    event,
    nodes: layout.map((item) => {
      const node = nodeById.get(item.id);
      const stat = stats.get(item.id) || {};
      return {
        id: item.id,
        parentId: item.parentId,
        x: item.x,
        y: item.y,
        value: node.val,
        sum: stat.sum ?? null,
        count: stat.count ?? null,
        average: stat.average ?? null,
        state: stat.state || (stack.includes(item.id) ? "waiting" : "unvisited"),
      };
    }),
    stack: [...stack],
    current: current === null ? null : current.id,
    formula,
    best,
    bestNode: bestNode === null ? null : bestNode.id,
    bestSubtreeIds: bestNode === null ? [] : subtreeIds(bestNode),
    processed: [...stats.values()].filter((stat) => stat.average !== null).length,
    totalNodes: layout.length,
    ranking: [...stats.entries()]
      .filter(([, stat]) => stat.average !== null)
      .map(([id, stat]) => ({ id, value: nodeById.get(id).val, sum: stat.sum, count: stat.count, average: stat.average }))
      .sort((a, b) => b.average - a.average || a.id - b.id),
  });

  const push = ({ title, note, codeLines, final = false, ...viewOptions }) => {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines,
      vars: [
        { name: "stack", value: `[${stack.map((id) => nodeById.get(id).val).join(", ")}]` },
        { name: "best", value: Number(best.toFixed(5)) },
      ],
      note,
      maximumAverage1120View: makeView(viewOptions),
      final,
    });
  };

  push({
    title: { vi: "Tìm average của mọi subtree từ dưới lên", en: "Compute every subtree average from the bottom up" },
    note: { vi: "DFS hậu thứ tự trả về (sum, count). Mỗi node tạo ra đúng một ứng viên average để so với best.", en: "Postorder DFS returns (sum, count). Every node produces one average candidate to compare with best." },
    codeLines: [3, 5],
    event: "start",
  });

  function dfs(node) {
    if (!node) return { sum: 0, count: 0 };
    stack.push(node.id);
    stats.set(node.id, { state: "waiting", sum: null, count: null, average: null });
    push({
      title: { vi: `Vào node ${node.val}: chờ hai subtree con`, en: `Enter node ${node.val}: wait for both child subtrees` },
      note: { vi: `Chưa thể tính average tại ${node.val} cho đến khi cây trái và cây phải trả về sum, count.`, en: `The average at ${node.val} cannot be computed until both children return their sum and count.` },
      codeLines: [5, 7, 10],
      event: "enter",
      current: node,
    });

    const left = dfs(node.left);
    const right = dfs(node.right);
    const sum = left.sum + node.val + right.sum;
    const count = left.count + 1 + right.count;
    const average = sum / count;
    const bestBefore = best;
    const formula = {
      nodeValue: node.val,
      leftSum: left.sum,
      leftCount: left.count,
      rightSum: right.sum,
      rightCount: right.count,
      sum,
      count,
      average,
      bestBefore,
      bestAfter: best,
      firstCandidate: bestNode === null,
      updated: null,
    };
    stats.set(node.id, { state: "combine", sum, count, average });
    push({
      title: { vi: `Subtree ${node.val}: average = ${sum} / ${count}`, en: `Subtree ${node.val}: average = ${sum} / ${count}` },
      note: { vi: `Gộp hai con với node ${node.val}: sum = ${sum}, count = ${count}, average = ${average.toFixed(5)}.`, en: `Combine both children with node ${node.val}: sum = ${sum}, count = ${count}, average = ${average.toFixed(5)}.` },
      codeLines: [10, 11, 12, 13, 14],
      phase: "combine",
      phaseIndex: 1,
      event: "combine",
      current: node,
      formula,
    });

    const firstCandidate = bestNode === null;
    const updated = firstCandidate || average > best;
    if (updated) {
      if (bestNode !== null) {
        const oldBest = stats.get(bestNode.id);
        stats.set(bestNode.id, { ...oldBest, state: "checked" });
      }
      best = average;
      bestNode = node;
    }
    stats.set(node.id, { state: updated ? "best" : "checked", sum, count, average });
    push({
      title: updated
        ? firstCandidate
          ? { vi: `Ứng viên đầu tiên ${average.toFixed(5)} → khởi tạo best`, en: `First candidate ${average.toFixed(5)} → initialize best` }
          : { vi: `${average.toFixed(5)} > best ${bestBefore.toFixed(5)} → cập nhật`, en: `${average.toFixed(5)} > best ${bestBefore.toFixed(5)} → update` }
        : { vi: `${average.toFixed(5)} ≤ best ${bestBefore.toFixed(5)} → giữ nguyên`, en: `${average.toFixed(5)} ≤ best ${bestBefore.toFixed(5)} → keep it` },
      note: updated
        ? { vi: `Subtree gốc ${node.val} đang có average lớn nhất: ${best.toFixed(5)}.`, en: `The subtree rooted at ${node.val} now has the largest average: ${best.toFixed(5)}.` }
        : { vi: `Ứng viên ${average.toFixed(5)} không vượt qua best ${best.toFixed(5)}.`, en: `Candidate ${average.toFixed(5)} does not beat best ${best.toFixed(5)}.` },
      codeLines: [14, 15],
      phase: "compare",
      phaseIndex: 2,
      event: updated ? "new-best" : "keep-best",
      current: node,
      formula: { ...formula, bestAfter: best, firstCandidate, updated },
    });
    stack.pop();
    return { sum, count };
  }

  dfs(root);
  push({
    title: { vi: `Maximum average = ${best.toFixed(5)}`, en: `Maximum average = ${best.toFixed(5)}` },
    note: { vi: `Subtree màu vàng có gốc ${bestNode.val} và average lớn nhất ${best.toFixed(5)}.`, en: `The gold subtree rooted at ${bestNode.val} has the maximum average ${best.toFixed(5)}.` },
    codeLines: [19, 20],
    phase: "done",
    phaseIndex: 3,
    event: "done",
    final: true,
  });
  return { input, answer: best, steps };
}

function buildSteps1973(input) {
  const root = parseAverageSubtreeInput(input, { maxValue: 100000, maxNodes: 31 });
  const layout = treeToVizNodes(root, null, null);
  const nodeById = new Map();
  (function indexNodes(node) {
    if (!node) return;
    nodeById.set(node.id, node);
    indexNodes(node.left);
    indexNodes(node.right);
  })(root);

  const steps = [];
  const stack = [];
  const stats = new Map();
  let answer = 0;

  const makeView = ({ phase = "postorder", phaseIndex = 0, event = "start", current = null, formula = null } = {}) => ({
    phase,
    phaseIndex,
    event,
    nodes: layout.map((item) => {
      const node = nodeById.get(item.id);
      const stat = stats.get(item.id) || {};
      return {
        id: item.id,
        parentId: item.parentId,
        x: item.x,
        y: item.y,
        value: node.val,
        leftSum: stat.leftSum ?? null,
        rightSum: stat.rightSum ?? null,
        descendantSum: stat.descendantSum ?? null,
        subtreeSum: stat.subtreeSum ?? null,
        match: stat.match ?? null,
        state: stat.state || (stack.includes(item.id) ? "waiting" : "unvisited"),
      };
    }),
    stack: [...stack],
    current: current === null ? null : current.id,
    formula,
    answer,
    processed: [...stats.values()].filter((stat) => stat.match !== null).length,
    totalNodes: layout.length,
    results: [...stats.entries()]
      .filter(([, stat]) => stat.match !== null)
      .map(([id, stat]) => ({
        id,
        value: nodeById.get(id).val,
        descendantSum: stat.descendantSum,
        subtreeSum: stat.subtreeSum,
        match: stat.match,
      })),
  });

  const push = ({ title, note, codeLines, final = false, ...viewOptions }) => {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines,
      vars: [
        { name: "stack", value: `[${stack.map((id) => nodeById.get(id).val).join(", ")}]` },
        { name: "answer", value: answer },
      ],
      note,
      descendantSum1973View: makeView(viewOptions),
      final,
    });
  };

  push({
    title: { vi: "Tính tổng subtree từ lá lên gốc", en: "Compute subtree sums from leaves to root" },
    note: {
      vi: "DFS hậu thứ tự để mỗi node nhận tổng của cây trái và cây phải. Tổng hậu duệ không bao gồm chính node hiện tại.",
      en: "Postorder DFS lets each node receive its left and right subtree sums. The descendant sum excludes the current node itself.",
    },
    codeLines: [4, 7],
    event: "start",
  });

  function dfs(node) {
    if (!node) return 0;
    stack.push(node.id);
    stats.set(node.id, { state: "waiting", leftSum: null, rightSum: null, descendantSum: null, subtreeSum: null, match: null });
    push({
      title: { vi: `Node ${node.val} chờ tổng từ hai cây con`, en: `Node ${node.val} waits for both child sums` },
      note: {
        vi: `Chưa thể kiểm tra ${node.val}; cần chạy DFS bên trái và bên phải trước.`,
        en: `${node.val} cannot be checked yet; run DFS on the left and right children first.`,
      },
      codeLines: [4, 7, 8],
      event: "enter",
      current: node,
    });

    const leftSum = dfs(node.left);
    const rightSum = dfs(node.right);
    const descendantSum = leftSum + rightSum;
    const subtreeSum = node.val + descendantSum;
    const formula = { nodeValue: node.val, leftSum, rightSum, descendantSum, subtreeSum, match: null };
    stats.set(node.id, { state: "combine", leftSum, rightSum, descendantSum, subtreeSum, match: null });
    push({
      title: { vi: `Hậu duệ của ${node.val}: ${leftSum} + ${rightSum} = ${descendantSum}`, en: `Descendants of ${node.val}: ${leftSum} + ${rightSum} = ${descendantSum}` },
      note: {
        vi: `Cây trái trả ${leftSum}, cây phải trả ${rightSum}. Vì không tính chính node ${node.val}, descendant_sum = ${descendantSum}.`,
        en: `The left subtree returns ${leftSum} and the right returns ${rightSum}. Excluding node ${node.val}, descendant_sum = ${descendantSum}.`,
      },
      codeLines: [8, 9, 10],
      phase: "combine",
      phaseIndex: 1,
      event: "combine",
      current: node,
      formula,
    });

    const match = node.val === descendantSum;
    if (match) answer++;
    stats.set(node.id, { state: match ? "match" : "miss", leftSum, rightSum, descendantSum, subtreeSum, match });
    push({
      title: match
        ? { vi: `${node.val} = ${descendantSum} → MATCH, cộng 1`, en: `${node.val} = ${descendantSum} → MATCH, add 1` }
        : { vi: `${node.val} ≠ ${descendantSum} → không cộng`, en: `${node.val} ≠ ${descendantSum} → do not add` },
      note: match
        ? { vi: `Giá trị node bằng đúng tổng tất cả hậu duệ; answer = ${answer}.`, en: `The node value equals the sum of every descendant; answer = ${answer}.` }
        : { vi: `Giá trị node ${node.val} khác descendant_sum ${descendantSum}.`, en: `Node value ${node.val} differs from descendant_sum ${descendantSum}.` },
      codeLines: match ? [10, 11, 12] : [10, 11],
      phase: "compare",
      phaseIndex: 2,
      event: match ? "match" : "miss",
      current: node,
      formula: { ...formula, match },
    });
    stack.pop();
    return subtreeSum;
  }

  dfs(root);
  push({
    title: { vi: `Hoàn tất: ${answer} node thỏa điều kiện`, en: `Complete: ${answer} matching nodes` },
    note: {
      vi: "Các node màu xanh có node.val bằng tổng của toàn bộ hậu duệ bên dưới.",
      en: "Green nodes have node.val equal to the sum of every descendant below them.",
    },
    codeLines: [15, 16],
    phase: "done",
    phaseIndex: 3,
    event: "done",
    final: true,
  });
  return { input, answer, steps };
}

function buildSteps2265(input) {
  const root = parseAverageSubtreeInput(input, { maxValue: 1000, maxNodes: 31 });
  const layout = treeToVizNodes(root, null, null);
  const nodeById = new Map();
  (function indexNodes(node) {
    if (!node) return;
    nodeById.set(node.id, node);
    indexNodes(node.left);
    indexNodes(node.right);
  })(root);

  const steps = [];
  const stack = [];
  const stats = new Map();
  let answer = 0;

  const makeView = ({ phase = "postorder", phaseIndex = 0, event = "start", current = null, formula = null } = {}) => ({
    phase,
    phaseIndex,
    event,
    nodes: layout.map((item) => {
      const node = nodeById.get(item.id);
      const stat = stats.get(item.id) || {};
      return {
        id: item.id,
        parentId: item.parentId,
        x: item.x,
        y: item.y,
        value: node.val,
        sum: stat.sum ?? null,
        count: stat.count ?? null,
        average: stat.average ?? null,
        match: stat.match ?? null,
        state: stat.state || (stack.includes(item.id) ? "waiting" : "unvisited"),
      };
    }),
    stack: [...stack],
    current: current === null ? null : current.id,
    formula,
    answer,
    processed: [...stats.values()].filter((stat) => stat.match !== null).length,
    totalNodes: layout.length,
  });

  const push = ({ title, note, codeLines, final = false, ...viewOptions }) => {
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines,
      vars: [
        { name: "stack", value: `[${stack.map((id) => nodeById.get(id).val).join(", ")}]` },
        { name: "answer", value: answer },
      ],
      note,
      averageSubtree2265View: makeView(viewOptions),
      final,
    });
  };

  push({
    title: { vi: "Mục tiêu: tính từ lá lên gốc", en: "Goal: compute from leaves up to the root" },
    note: { vi: "Mỗi node cần tổng và số node của cả hai cây con, vì vậy ta dùng DFS hậu thứ tự: trái → phải → node.", en: "Each node needs the sum and size of both child subtrees, so use postorder DFS: left → right → node." },
    codeLines: [3, 5],
    event: "start",
  });

  function dfs(node) {
    if (!node) return { sum: 0, count: 0 };
    stack.push(node.id);
    stats.set(node.id, { state: "waiting", sum: null, count: null, average: null, match: null });
    push({
      title: { vi: `Vào node ${node.val}: tính hai cây con trước`, en: `Enter node ${node.val}: compute both children first` },
      note: { vi: `Node ${node.val} đang chờ kết quả từ bên trái và bên phải.`, en: `Node ${node.val} waits for results from its left and right children.` },
      codeLines: [5, 7, 10],
      event: "enter",
      current: node,
    });

    const left = dfs(node.left);
    const right = dfs(node.right);
    const sum = left.sum + right.sum + node.val;
    const count = left.count + right.count + 1;
    const average = Math.floor(sum / count);
    const formula = {
      nodeValue: node.val,
      leftSum: left.sum,
      leftCount: left.count,
      rightSum: right.sum,
      rightCount: right.count,
      sum,
      count,
      average,
      match: null,
    };
    stats.set(node.id, { state: "combine", sum, count, average, match: null });
    push({
      title: { vi: `Gộp subtree của node ${node.val}`, en: `Combine node ${node.val}'s subtree` },
      note: { vi: `Tổng = ${left.sum} + ${node.val} + ${right.sum} = ${sum}; số node = ${left.count} + 1 + ${right.count} = ${count}.`, en: `Sum = ${left.sum} + ${node.val} + ${right.sum} = ${sum}; count = ${left.count} + 1 + ${right.count} = ${count}.` },
      codeLines: [10, 11, 12, 13, 14],
      phase: "combine",
      phaseIndex: 1,
      event: "combine",
      current: node,
      formula,
    });

    const match = node.val === average;
    if (match) answer++;
    stats.set(node.id, { state: match ? "match" : "miss", sum, count, average, match });
    push({
      title: match
        ? { vi: `${node.val} = floor(${sum}/${count}) = ${average} → cộng 1`, en: `${node.val} = floor(${sum}/${count}) = ${average} → add 1` }
        : { vi: `${node.val} ≠ floor(${sum}/${count}) = ${average} → không cộng`, en: `${node.val} ≠ floor(${sum}/${count}) = ${average} → do not add` },
      note: match
        ? { vi: `Node ${node.val} thỏa điều kiện; answer tăng thành ${answer}.`, en: `Node ${node.val} matches; answer increases to ${answer}.` }
        : { vi: `Trung bình làm tròn xuống là ${average}, khác giá trị node ${node.val}.`, en: `The floor average is ${average}, different from node value ${node.val}.` },
      codeLines: match ? [14, 16, 17] : [14, 16],
      phase: "compare",
      phaseIndex: 2,
      event: match ? "match" : "miss",
      current: node,
      formula: { ...formula, match },
    });
    stack.pop();
    return { sum, count };
  }

  dfs(root);
  push({
    title: { vi: `Hoàn tất: ${answer} node thỏa điều kiện`, en: `Done: ${answer} matching nodes` },
    note: { vi: "Mỗi node được tính đúng một lần; các node màu xanh là những node có giá trị bằng trung bình subtree của chính nó.", en: "Each node is computed once; green nodes have a value equal to their own subtree average." },
    codeLines: [21, 22],
    phase: "done",
    phaseIndex: 3,
    event: "done",
    final: true,
  });
  return { input, answer, steps };
}

Object.assign(module.exports, {
  1973: {
    id: 1973,
    difficulty: "medium",
    premium: true,
    slug: "count-nodes-equal-to-sum-of-descendants",
    category: TREE_CAT,
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS hậu thứ tự", en: "Postorder DFS" },
    ],
    title: { vi: "Count Nodes Equal to Sum of Descendants", en: "Count Nodes Equal to Sum of Descendants" },
    titleVi: { vi: "Đếm node bằng tổng các hậu duệ", en: "Count nodes equal to descendant sum" },
    statement: {
      vi: "Cho gốc của cây nhị phân, đếm số node có giá trị bằng tổng giá trị của tất cả hậu duệ. Tổng hậu duệ không bao gồm chính node đó.",
      en: "Given the root of a binary tree, count nodes whose value equals the sum of all descendant values. The descendant sum excludes the node itself.",
    },
    defaultInput: "10,3,4,2,1",
    inputKind: "string",
    inputLabel: { vi: "Cây level-order (null cho node rỗng)", en: "Level-order tree (null for an empty node)" },
    extraParams: [],
    approach: [
      { vi: "DFS hậu thứ tự: tính tổng subtree trái và phải trước.", en: "Use postorder DFS: compute the left and right subtree sums first." },
      { vi: "descendant_sum = left_sum + right_sum; không cộng node hiện tại vào phép so sánh.", en: "descendant_sum = left_sum + right_sum; do not include the current node in the comparison." },
      { vi: "Nếu node.val == descendant_sum thì tăng answer, sau đó trả node.val + descendant_sum cho cha.", en: "If node.val == descendant_sum, increment answer, then return node.val + descendant_sum to the parent." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(h)",
      note: { vi: "Mỗi node được xử lý một lần; h là chiều cao stack đệ quy.", en: "Each node is processed once; h is the recursive stack height." },
    },
    code: [
      "class Solution:",
      "    def equalToDescendants(self, root):",
      "        answer = 0",
      "        def dfs(node):",
      "            nonlocal answer",
      "            if not node:",
      "                return 0",
      "            left_sum = dfs(node.left)",
      "            right_sum = dfs(node.right)",
      "            descendant_sum = left_sum + right_sum",
      "            if node.val == descendant_sum:",
      "                answer += 1",
      "            return node.val + descendant_sum",
      "",
      "        dfs(root)",
      "        return answer",
    ],
    builder: buildSteps1973,
  },
  1120: {
    id: 1120,
    difficulty: "medium",
    premium: true,
    slug: "maximum-average-subtree",
    category: TREE_CAT,
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS hậu thứ tự", en: "Postorder DFS" },
    ],
    title: { vi: "Maximum Average Subtree", en: "Maximum Average Subtree" },
    titleVi: { vi: "Subtree có trung bình lớn nhất", en: "Maximum average subtree" },
    statement: {
      vi: "Cho gốc của cây nhị phân, trả về giá trị trung bình lớn nhất trong tất cả các subtree. Trung bình của subtree bằng tổng giá trị chia cho số node của subtree đó.",
      en: "Given the root of a binary tree, return the maximum average value among all of its subtrees. A subtree average is its value sum divided by its node count.",
    },
    defaultInput: "5,6,1",
    inputKind: "string",
    inputLabel: { vi: "Cây level-order (null cho node rỗng)", en: "Level-order tree (null for an empty node)" },
    extraParams: [],
    approach: [
      { vi: "Dùng DFS hậu thứ tự để lấy (sum, count) của cây trái và cây phải trước.", en: "Use postorder DFS to obtain the left and right (sum, count) pairs first." },
      { vi: "Tại mỗi node, gộp subtree_sum và subtree_count rồi tính average = subtree_sum / subtree_count.", en: "At each node, combine subtree_sum and subtree_count, then compute average = subtree_sum / subtree_count." },
      { vi: "So sánh average của mỗi subtree với best toàn cục và giữ giá trị lớn nhất.", en: "Compare each subtree average with the global best and keep the maximum." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(h)",
      note: { vi: "Mỗi node được xử lý một lần; h là chiều cao stack đệ quy.", en: "Each node is processed once; h is the recursive stack height." },
    },
    code: [
      "class Solution:",
      "    def maximumAverageSubtree(self, root):",
      "        best = 0.0",
      "",
      "        def dfs(node):",
      "            nonlocal best",
      "            if not node:",
      "                return (0, 0)",
      "",
      "            left_sum, left_count = dfs(node.left)",
      "            right_sum, right_count = dfs(node.right)",
      "            subtree_sum = left_sum + node.val + right_sum",
      "            subtree_count = left_count + 1 + right_count",
      "            average = subtree_sum / subtree_count",
      "            best = max(best, average)",
      "",
      "            return (subtree_sum, subtree_count)",
      "",
      "        dfs(root)",
      "        return best",
    ],
    builder: buildSteps1120,
  },
  2265: {
    id: 2265,
    difficulty: "medium",
    slug: "count-nodes-equal-to-average-of-subtree",
    category: TREE_CAT,
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS hậu thứ tự", en: "Postorder DFS" },
    ],
    title: { vi: "Count Nodes Equal to Average of Subtree", en: "Count Nodes Equal to Average of Subtree" },
    titleVi: { vi: "Đếm node bằng trung bình subtree", en: "Count nodes equal to subtree average" },
    statement: {
      vi: "Đếm số node có giá trị bằng trung bình làm tròn xuống của mọi giá trị trong subtree gốc tại node đó.",
      en: "Count nodes whose value equals the floor average of every value in the subtree rooted at that node.",
    },
    defaultInput: "4,8,5,0,1,null,6",
    inputKind: "string",
    inputLabel: { vi: "Cây level-order (null cho node rỗng)", en: "Level-order tree (null for an empty node)" },
    extraParams: [],
    approach: [
      { vi: "DFS hậu thứ tự để nhận (sum, count) từ cây trái và cây phải trước khi xử lý node hiện tại.", en: "Run postorder DFS to receive (sum, count) from the left and right subtrees before processing the current node." },
      { vi: "Gộp: subtree_sum = left_sum + node.val + right_sum; subtree_count = left_count + 1 + right_count.", en: "Combine: subtree_sum = left_sum + node.val + right_sum; subtree_count = left_count + 1 + right_count." },
      { vi: "So sánh node.val với subtree_sum // subtree_count; nếu bằng nhau thì tăng answer.", en: "Compare node.val with subtree_sum // subtree_count; increment answer when they are equal." },
    ],
    complexity: {
      time: "O(n)",
      space: "O(h)",
      note: { vi: "Mỗi node được thăm một lần; h là chiều cao stack đệ quy.", en: "Each node is visited once; h is the recursive stack height." },
    },
    code: [
      "class Solution:",
      "    def averageOfSubtree(self, root):",
      "        answer = 0",
      "",
      "        def dfs(node):",
      "            nonlocal answer",
      "            if not node:",
      "                return (0, 0)",
      "",
      "            left_sum, left_count = dfs(node.left)",
      "            right_sum, right_count = dfs(node.right)",
      "            subtree_sum = left_sum + node.val + right_sum",
      "            subtree_count = left_count + 1 + right_count",
      "            average = subtree_sum // subtree_count",
      "",
      "            if node.val == average:",
      "                answer += 1",
      "",
      "            return (subtree_sum, subtree_count)",
      "",
      "        dfs(root)",
      "        return answer",
    ],
    builder: buildSteps2265,
  },
});

function parseThrone1600Operations(input) {
  const parts = String(input ?? "").split(/\s*[|;\n]\s*/).map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Enter at least one birth, death, or get operation");
  if (parts.length > 30) throw new Error("Visualization supports up to 30 operations");

  return parts.map((raw) => {
    const tokens = raw.replace(/[(),]/g, " ").trim().split(/\s+/).filter(Boolean);
    const command = String(tokens[0] || "").toLowerCase();
    if (command === "birth" && tokens.length === 3) return { type: "birth", parent: tokens[1], child: tokens[2], raw };
    if (command === "death" && tokens.length === 2) return { type: "death", name: tokens[1], raw };
    if ((command === "get" || command === "getinheritanceorder") && tokens.length === 1) return { type: "get", raw };
    throw new Error(`Invalid operation: ${raw}`);
  });
}

function buildSteps1600(input, params) {
  const kingName = String(params?.kingName ?? "").trim();
  if (!/^[a-z]{1,15}$/.test(kingName)) throw new Error("kingName must contain 1 to 15 lowercase letters");
  const operations = parseThrone1600Operations(input);
  const people = new Map();
  const dead = new Set();
  const results = new Array(operations.length).fill(null);
  const queryOutputs = [];
  const steps = [];
  let nextBirthOrder = 0;

  const createPerson = (name, parent = null) => {
    const parentNode = parent === null ? null : people.get(parent);
    const person = {
      name,
      parent,
      children: [],
      depth: parentNode ? parentNode.depth + 1 : 0,
      birthOrder: nextBirthOrder++,
    };
    people.set(name, person);
    if (parentNode) parentNode.children.push(name);
    return person;
  };
  createPerson(kingName);

  const currentOrder = () => {
    const order = [];
    const dfs = (name) => {
      if (!dead.has(name)) order.push(name);
      const person = people.get(name);
      for (const child of person.children) dfs(child);
    };
    dfs(kingName);
    return order;
  };
  const peopleSnapshot = () => [...people.values()].map((person) => ({
    name: person.name,
    parent: person.parent,
    children: [...person.children],
    depth: person.depth,
    birthOrder: person.birthOrder,
    dead: dead.has(person.name),
  }));
  const operationLabels = operations.map((operation) => operation.type === "birth"
    ? `birth(${operation.parent}, ${operation.child})`
    : operation.type === "death"
      ? `death(${operation.name})`
      : "getInheritanceOrder()");

  const push = ({ title, line, note, phase, opIndex = -1, activeName = null, newbornName = null, visited = [], stack = [], order = null, final = false, vars = [] }) => {
    const shownOrder = order === null ? currentOrder() : [...order];
    steps.push({
      title,
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [line],
      vars: [
        { name: "dead", value: `{${[...dead].join(", ")}}` },
        { name: "order", value: JSON.stringify(shownOrder) },
        ...vars,
      ],
      note,
      final,
      throne1600View: {
        kingName,
        nodes: peopleSnapshot(),
        operations: operationLabels,
        activeOpIndex: opIndex,
        completedOps: Math.max(0, opIndex),
        phase,
        activeName,
        newbornName,
        visited: [...visited],
        stack: [...stack],
        order: shownOrder,
        orderIsPartial: order !== null && ["query-start", "visit", "alive-check", "append", "skip", "child", "recurse"].includes(phase),
        queryOutputs: queryOutputs.map((output) => [...output]),
      },
    });
  };

  push({
    title: { vi: `Lưu king = '${kingName}'`, en: `Store king = '${kingName}'` },
    line: 5,
    phase: "constructor",
    activeName: kingName,
    note: { vi: "Nhà vua là gốc của cây gia phả và luôn đứng đầu phép duyệt preorder.", en: "The king is the family-tree root and always starts the preorder traversal." },
    vars: [{ name: "king", value: kingName }],
  });
  push({
    title: { vi: "Tạo children = defaultdict(list)", en: "Create children = defaultdict(list)" },
    line: 6,
    phase: "constructor",
    activeName: kingName,
    note: { vi: "Danh sách con giữ đúng thứ tự sinh: con lớn tuổi đứng trước.", en: "Each child list preserves birth order: older children come first." },
  });
  push({
    title: { vi: "Tạo dead = set()", en: "Create dead = set()" },
    line: 7,
    phase: "constructor",
    activeName: kingName,
    note: { vi: "Người mất chỉ bị đánh dấu; họ và hậu duệ vẫn nằm trong cây.", en: "A death only marks the person; they and their descendants stay in the tree." },
  });

  for (let opIndex = 0; opIndex < operations.length; opIndex++) {
    const operation = operations[opIndex];
    if (operation.type === "birth") {
      const parent = people.get(operation.parent);
      if (!parent) throw new Error(`Unknown parent: ${operation.parent}`);
      if (dead.has(operation.parent)) throw new Error(`Parent is not alive: ${operation.parent}`);
      if (!/^[a-z]{1,15}$/.test(operation.child)) throw new Error(`Invalid child name: ${operation.child}`);
      if (people.has(operation.child)) throw new Error(`Duplicate person: ${operation.child}`);

      push({
        title: { vi: `birth('${operation.parent}', '${operation.child}')`, en: `birth('${operation.parent}', '${operation.child}')` },
        line: 9,
        phase: "birth-call",
        opIndex,
        activeName: operation.parent,
        note: { vi: `Tìm ${operation.parent} trong cây; con mới sẽ được thêm cuối danh sách children để giữ thứ tự tuổi.`, en: `Find ${operation.parent}; the new child is appended to preserve sibling age order.` },
      });
      createPerson(operation.child, operation.parent);
      push({
        title: { vi: `Thêm '${operation.child}' sau các con hiện có`, en: `Append '${operation.child}' after existing children` },
        line: 10,
        phase: "birth-add",
        opIndex,
        activeName: operation.parent,
        newbornName: operation.child,
        note: { vi: `${operation.child} trở thành con thứ ${parent.children.length} của ${operation.parent}.`, en: `${operation.child} becomes child ${parent.children.length} of ${operation.parent}.` },
        vars: [{ name: `children[${operation.parent}]`, value: JSON.stringify(parent.children) }],
      });
      continue;
    }

    if (operation.type === "death") {
      if (!people.has(operation.name)) throw new Error(`Unknown person: ${operation.name}`);
      push({
        title: { vi: `death('${operation.name}')`, en: `death('${operation.name}')` },
        line: 12,
        phase: "death-call",
        opIndex,
        activeName: operation.name,
        note: { vi: "Không xóa node khỏi cây vì hậu duệ vẫn giữ vị trí kế vị của nhánh này.", en: "Do not remove the node because descendants keep this branch's place in succession." },
      });
      dead.add(operation.name);
      push({
        title: { vi: `Đánh dấu '${operation.name}' đã mất`, en: `Mark '${operation.name}' as dead` },
        line: 13,
        phase: "death-mark",
        opIndex,
        activeName: operation.name,
        note: { vi: `${operation.name} sẽ bị bỏ qua trong output, nhưng DFS vẫn đi qua các con của họ.`, en: `${operation.name} is skipped in the output, but DFS still visits their children.` },
      });
      continue;
    }

    const order = [];
    const visited = [];
    const stack = [];
    push({
      title: { vi: "getInheritanceOrder()", en: "getInheritanceOrder()" },
      line: 15,
      phase: "query-call",
      opIndex,
      note: { vi: "Tạo lại thứ tự hiện tại bằng preorder trên cây gia phả.", en: "Rebuild the current order with a preorder traversal of the family tree." },
    });
    push({
      title: { vi: "order = []", en: "order = []" },
      line: 16,
      phase: "query-start",
      opIndex,
      order,
      note: { vi: "Order sẽ nhận người còn sống ngay khi DFS thăm node của họ.", en: "Order receives each living person as soon as DFS visits their node." },
    });
    push({
      title: { vi: `dfs('${kingName}')`, en: `dfs('${kingName}')` },
      line: 24,
      phase: "recurse",
      opIndex,
      activeName: kingName,
      stack: [kingName],
      order,
      note: { vi: "Preorder luôn bắt đầu từ nhà vua.", en: "Preorder always begins at the king." },
    });

    const dfs = (name) => {
      stack.push(name);
      visited.push(name);
      push({
        title: { vi: `Vào dfs('${name}')`, en: `Enter dfs('${name}')` },
        line: 18,
        phase: "visit",
        opIndex,
        activeName: name,
        visited,
        stack,
        order,
        note: { vi: `Thăm ${name} trước rồi mới đi qua các con từ lớn đến nhỏ tuổi.`, en: `Visit ${name} before traversing children from oldest to youngest.` },
      });
      const alive = !dead.has(name);
      push({
        title: { vi: `'${name}' còn sống: ${alive}`, en: `'${name}' is alive: ${alive}` },
        line: 19,
        phase: alive ? "alive-check" : "skip",
        opIndex,
        activeName: name,
        visited,
        stack,
        order,
        note: alive
          ? { vi: "Người này được thêm vào thứ tự kế vị.", en: "This person belongs in the inheritance order." }
          : { vi: "Bỏ qua tên này trong output, nhưng vẫn phải duyệt các con.", en: "Skip this name in output, but still traverse the children." },
      });
      if (alive) {
        order.push(name);
        push({
          title: { vi: `order.append('${name}')`, en: `order.append('${name}')` },
          line: 20,
          phase: "append",
          opIndex,
          activeName: name,
          visited,
          stack,
          order,
          note: { vi: `${name} nhận hạng kế vị #${order.length}.`, en: `${name} receives succession rank #${order.length}.` },
        });
      }
      const person = people.get(name);
      for (const child of person.children) {
        push({
          title: { vi: `Con tiếp theo của ${name}: '${child}'`, en: `Next child of ${name}: '${child}'` },
          line: 21,
          phase: "child",
          opIndex,
          activeName: name,
          newbornName: child,
          visited,
          stack,
          order,
          note: { vi: "Danh sách children giữ thứ tự sinh nên DFS tự tạo đúng thứ tự kế vị.", en: "The child list preserves birth order, so DFS naturally produces the correct succession order." },
        });
        push({
          title: { vi: `dfs('${child}')`, en: `dfs('${child}')` },
          line: 22,
          phase: "recurse",
          opIndex,
          activeName: child,
          visited,
          stack: [...stack, child],
          order,
          note: { vi: `Đi hết nhánh của ${child} trước khi quay lại anh/chị/em kế tiếp.`, en: `Finish ${child}'s entire branch before returning to the next sibling.` },
        });
        dfs(child);
      }
      stack.pop();
    };
    dfs(kingName);
    results[opIndex] = [...order];
    queryOutputs.push([...order]);
    push({
      title: { vi: `return [${order.join(", ")}]`, en: `return [${order.join(", ")}]` },
      line: 25,
      phase: "query-done",
      opIndex,
      visited,
      order,
      note: { vi: "Preorder hoàn tất; người đã mất không xuất hiện nhưng nhánh con của họ vẫn giữ nguyên.", en: "Preorder is complete; dead people are absent while their descendant branches remain in place." },
      vars: [{ name: "return", value: JSON.stringify(order) }],
    });
  }

  push({
    title: { vi: "Hoàn tất toàn bộ operations", en: "All operations complete" },
    line: 25,
    phase: "done",
    opIndex: operations.length,
    note: { vi: "Cây gia phả, tập dead và các kết quả query đã được cập nhật đầy đủ.", en: "The family tree, dead set, and query results are fully updated." },
    final: true,
    vars: [{ name: "results", value: JSON.stringify(results) }],
  });
  return { original: input, operations, answer: results, steps };
}

Object.assign(module.exports, {
  1600: {
    id: 1600,
    difficulty: "medium",
    slug: "throne-inheritance",
    category: { key: "binary-tree", vi: "Cây / Thiết kế", en: "Tree / Design" },
    tags: [
      { key: "tree", vi: "Cây", en: "Tree" },
      { key: "dfs", vi: "DFS", en: "DFS" },
      { key: "design", vi: "Thiết kế", en: "Design" },
    ],
    title: { vi: "Throne Inheritance", en: "Throne Inheritance" },
    titleVi: { vi: "Thứ tự kế vị ngai vàng", en: "Throne inheritance order" },
    statement: {
      vi: "Thiết kế hệ thống gia phả hỗ trợ birth, death và trả về thứ tự kế vị hiện tại. Người đã mất bị loại khỏi kết quả nhưng hậu duệ vẫn giữ vị trí trong cây.",
      en: "Design a family tree supporting birth, death, and the current inheritance order. Dead people are excluded from the result while descendants keep their place in the tree.",
    },
    defaultInput: "birth king andy | birth king bob | birth king catherine | birth andy matthew | birth bob alex | birth bob asha | get | death bob | get",
    inputKind: "string",
    inputLabel: { vi: "Operations, ngăn cách bằng |", en: "Operations separated by |" },
    extraParams: [{ key: "kingName", type: "string", label: { vi: "Tên nhà vua", en: "King name" }, default: "king" }],
    approach: [
      { vi: "children[parent] lưu các con theo đúng thứ tự sinh. birth chỉ append vào cuối danh sách nên O(1).", en: "children[parent] stores children in birth order. birth appends to the list in O(1)." },
      { vi: "death chỉ thêm tên vào set dead; không xóa node vì hậu duệ vẫn phải được duyệt.", en: "death only adds a name to the dead set; the node stays because descendants must still be traversed." },
      { vi: "getInheritanceOrder chạy preorder DFS từ king, thêm người còn sống rồi duyệt từng nhánh con theo thứ tự sinh.", en: "getInheritanceOrder runs preorder DFS from the king, adding living people before traversing child branches in birth order." },
    ],
    complexity: {
      time: "birth O(1), death O(1), get O(n)",
      space: "O(n)",
      note: { vi: "Cây và dead set lưu tối đa n người; DFS dùng O(h) stack và output O(n).", en: "The tree and dead set store up to n people; DFS uses O(h) stack and O(n) output." },
    },
    code: [
      "from collections import defaultdict",
      "",
      "class ThroneInheritance:",
      "    def __init__(self, kingName: str):",
      "        self.king = kingName",
      "        self.children = defaultdict(list)",
      "        self.dead = set()",
      "",
      "    def birth(self, parentName: str, childName: str) -> None:",
      "        self.children[parentName].append(childName)",
      "",
      "    def death(self, name: str) -> None:",
      "        self.dead.add(name)",
      "",
      "    def getInheritanceOrder(self):",
      "        order = []",
      "",
      "        def dfs(name):",
      "            if name not in self.dead:",
      "                order.append(name)",
      "            for child in self.children[name]:",
      "                dfs(child)",
      "",
      "        dfs(self.king)",
      "        return order",
    ],
    builder: buildSteps1600,
  },
});

// ─── Tree essentials: shared, readable traces for #257/#404/#617/#572/#965/#872/#951 ───
function parseTreeEssentialsInput(input, { allowEmpty = false, minValue = -10000, maxValue = 10000, maxNodes = 31 } = {}) {
  const rawText = Array.isArray(input) ? null : String(input ?? "").trim();
  if (!Array.isArray(input) && (rawText === "" || rawText === "[]" || rawText.toLowerCase() === "null")) {
    if (allowEmpty) return null;
    throw new Error("Enter a non-empty binary tree");
  }
  const raw = Array.isArray(input)
    ? [...input]
    : rawText.replace(/^\[|\]$/g, "").split(",").map((item) => item.trim());
  const values = raw.map((item) => {
    if (item === null || String(item).trim().toLowerCase() === "null" || String(item).trim() === "") return null;
    const value = Number(item);
    if (!Number.isInteger(value) || value < minValue || value > maxValue) {
      throw new Error(`Tree values must be integers from ${minValue} to ${maxValue}, or null`);
    }
    return value;
  });
  if (!values.length || values[0] === null) {
    if (allowEmpty && values.slice(1).every((value) => value === null)) return null;
    throw new Error("The root must be an integer");
  }
  if (values.filter((value) => value !== null).length > maxNodes) {
    throw new Error(`Visualization supports up to ${maxNodes} nodes per tree`);
  }

  let nextId = 0;
  const root = { id: nextId++, val: values[0], left: null, right: null };
  const queue = [root];
  let index = 1;
  while (queue.length && index < values.length) {
    const parent = queue.shift();
    const leftValue = values[index++];
    if (leftValue !== undefined && leftValue !== null) {
      parent.left = { id: nextId++, val: leftValue, left: null, right: null };
      queue.push(parent.left);
    }
    if (index >= values.length) break;
    const rightValue = values[index++];
    if (rightValue !== null) {
      parent.right = { id: nextId++, val: rightValue, left: null, right: null };
      queue.push(parent.right);
    }
  }
  if (values.slice(index).some((value) => value !== null)) {
    throw new Error("Invalid level-order tree: a value has no parent");
  }
  return root;
}

function serializeTreeEssentials(root) {
  if (!root) return [];
  const values = [];
  const queue = [root];
  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      values.push(null);
      continue;
    }
    values.push(node.val);
    queue.push(node.left, node.right);
  }
  while (values.length && values[values.length - 1] === null) values.pop();
  return values;
}

function treeEssentialsState(root, { active = [], done = [], bad = [], annotations = {} } = {}) {
  const toIds = (items) => new Set([...items].map((item) => (item && typeof item === "object" ? item.id : item)));
  const activeIds = toIds(active);
  const doneIds = toIds(done);
  const badIds = toIds(bad);
  const nodes = treeToVizNodes(root, activeIds, doneIds);
  nodes.forEach((node) => {
    if (badIds.has(node.id)) node.isPruned = true;
  });
  return { nodes, annotations: { ...annotations }, showLevels: false };
}

function treeEssentialsStep({
  problemId, mode, stages, stage, event, title, note, codeLines, panels, cards = [], sequences = [], status = "checking", statusText, final = false,
}) {
  return {
    title,
    arr: [],
    treeEssentialsView: {
      problemId, mode, stages, stage, event, panels, cards, sequences, status, statusText,
    },
    highlight: [],
    mark: [],
    codeLines: codeLines || [],
    vars: cards.map((card) => ({ name: card.label && card.label.en ? card.label.en : card.label, value: card.value })),
    note,
    final,
  };
}

function buildSteps257(input) {
  const root = parseTreeEssentialsInput(input, { minValue: -100, maxValue: 100 });
  const steps = [];
  const path = [];
  const pathNodes = [];
  const completed = [];
  const visited = new Set();
  const stages = [
    { vi: "Mở path", en: "Start path" }, { vi: "Đi DFS", en: "Walk DFS" },
    { vi: "Gặp leaf: lưu", en: "Leaf: save" }, { vi: "Backtrack", en: "Backtrack" },
  ];
  const panels = (active = null) => [{
    label: { vi: "CÂY VÀ ĐƯỜNG ĐANG ĐI", en: "TREE AND ACTIVE PATH" },
    caption: { vi: "xanh = path hiện tại · cam = node hiện tại", en: "green = active path · amber = current node" },
    tree: treeEssentialsState(root, { active: active ? [active] : [], done: pathNodes }),
  }];
  const sequences = () => [
    { label: { vi: "path hiện tại", en: "current path" }, values: [...path], tone: "active" },
    { label: { vi: "paths đã lưu", en: "saved paths" }, values: completed.map((item) => item.join(" → ")), tone: "done" },
  ];
  steps.push(treeEssentialsStep({
    problemId: 257, mode: "paths", stages, stage: 0, event: "intro", panels: panels(), sequences: sequences(),
    title: { vi: "Mỗi lần DFS giữ một path từ root", en: "DFS carries one path from the root" }, codeLines: [3, 4],
    cards: [{ label: { vi: "QUY TẮC LƯU", en: "SAVE RULE" }, value: "node is leaf", detail: { vi: "chỉ node không có cả hai con", en: "only a node with no children" } }],
    note: { vi: "Thêm node khi đi xuống; chỉ lưu path khi chạm lá; sau đó pop để thử nhánh khác.", en: "Append while descending; save only at a leaf; then pop to explore another branch." },
  }));
  function dfs(node) {
    if (!node) return;
    path.push(node.val);
    pathNodes.push(node);
    steps.push(treeEssentialsStep({
      problemId: 257, mode: "paths", stages, stage: 1, event: "visit", panels: panels(node), sequences: sequences(),
      title: { vi: `Thêm ${node.val} vào path`, en: `Append ${node.val} to path` }, codeLines: [5],
      cards: [{ label: { vi: "NODE", en: "NODE" }, value: node.val }, { label: { vi: "ĐỘ DÀI PATH", en: "PATH LENGTH" }, value: path.length }],
      note: { vi: `Path hiện tại là ${path.join(" → ")}.`, en: `The current path is ${path.join(" → ")}.` },
    }));
    if (!node.left && !node.right) {
      completed.push([...path]);
      visited.add(node.id);
      steps.push(treeEssentialsStep({
        problemId: 257, mode: "paths", stages, stage: 2, event: "save", panels: panels(node), sequences: sequences(), status: "match",
        statusText: { vi: "Đã lưu một root-to-leaf path", en: "Saved one root-to-leaf path" },
        title: { vi: `Leaf ${node.val} → lưu path`, en: `Leaf ${node.val} → save path` }, codeLines: [6, 7],
        cards: [{ label: { vi: "PATH MỚI", en: "NEW PATH" }, value: path.join(" → "), tone: "success" }, { label: { vi: "TỔNG PATHS", en: "PATH COUNT" }, value: completed.length }],
        note: { vi: "Đây là leaf nên path từ root tới node này là một đáp án hoàn chỉnh.", en: "This is a leaf, so the path from root to this node is a complete answer." },
      }));
    } else {
      dfs(node.left);
      dfs(node.right);
    }
    path.pop();
    pathNodes.pop();
    visited.add(node.id);
    steps.push(treeEssentialsStep({
      problemId: 257, mode: "paths", stages, stage: 3, event: "backtrack", panels: panels(path.length ? null : node), sequences: sequences(),
      title: { vi: `Rời ${node.val} → pop khỏi path`, en: `Leave ${node.val} → pop from path` }, codeLines: [11],
      cards: [{ label: { vi: "ĐÃ POP", en: "POPPED" }, value: node.val }, { label: { vi: "QUAY LẠI PATH", en: "RESTORED PATH" }, value: path.length ? path.join(" → ") : "∅" }],
      note: { vi: "Backtrack khôi phục path đúng cho nhánh kế tiếp.", en: "Backtracking restores the correct path for the next branch." },
    }));
  }
  dfs(root);
  steps.push(treeEssentialsStep({
    problemId: 257, mode: "paths", stages, stage: 3, event: "done",
    panels: [{ label: { vi: "MỌI ROOT-TO-LEAF PATH", en: "ALL ROOT-TO-LEAF PATHS" }, caption: { vi: "tất cả node đã được duyệt", en: "every node has been visited" }, tree: treeEssentialsState(root, { done: visited }) }],
    sequences: sequences(), status: "match", statusText: { vi: "Hoàn tất", en: "Complete" }, final: true,
    title: { vi: `Tìm được ${completed.length} path`, en: `Found ${completed.length} path(s)` }, codeLines: [13],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: JSON.stringify(completed.map((item) => item.join("->"))), tone: "success" }],
    note: { vi: "Mỗi path kết thúc đúng tại một leaf.", en: "Every saved path ends at exactly one leaf." },
  }));
  return { input, answer: completed.map((item) => item.join("->")), steps };
}

function buildSteps404(input) {
  const root = parseTreeEssentialsInput(input, { minValue: -1000, maxValue: 1000 });
  const steps = [];
  const checked = new Set();
  const leftLeaves = new Set();
  let total = 0;
  const stages = [
    { vi: "Duyệt DFS", en: "Walk DFS" }, { vi: "Kiểm tra leaf", en: "Check leaf" },
    { vi: "Cộng left leaf", en: "Add left leaf" }, { vi: "Kết quả", en: "Result" },
  ];
  const makePanels = (active = null, bad = []) => [{
    label: { vi: "LEFT LEAF NẰM Ở ĐÂU?", en: "WHERE ARE THE LEFT LEAVES?" },
    caption: { vi: "phải vừa là con trái, vừa không có con", en: "must be a left child and have no children" },
    tree: treeEssentialsState(root, { active: active ? [active] : [], done: leftLeaves, bad }),
  }];
  const makeSequences = () => [{ label: { vi: "left leaves đã tìm", en: "left leaves found" }, values: [...leftLeaves].map((id) => {
    let found = null;
    (function find(node) { if (!node || found) return; if (node.id === id) found = node.val; else { find(node.left); find(node.right); } })(root);
    return found;
  }), tone: "done" }];
  steps.push(treeEssentialsStep({
    problemId: 404, mode: "left-leaves", stages, stage: 0, event: "intro", panels: makePanels(), sequences: makeSequences(),
    title: { vi: "Mang theo hướng đi vào node", en: "Carry the incoming side" }, codeLines: [3],
    cards: [{ label: { vi: "ĐIỀU KIỆN", en: "CONDITION" }, value: "is_left AND is_leaf" }, { label: { vi: "SUM", en: "SUM" }, value: total }],
    note: { vi: "Một leaf ở bên phải không được cộng; node bên trái nhưng còn con cũng không được cộng.", en: "A right leaf does not count; a left child with children does not count either." },
  }));
  function dfs(node, isLeft) {
    if (!node) return;
    const isLeaf = !node.left && !node.right;
    const qualifies = isLeft && isLeaf;
    steps.push(treeEssentialsStep({
      problemId: 404, mode: "left-leaves", stages, stage: isLeaf ? 1 : 0, event: "check", panels: makePanels(node, isLeaf && !qualifies ? [node] : []), sequences: makeSequences(),
      title: { vi: `Node ${node.val}: ${isLeft ? "con trái" : "không phải con trái"}${isLeaf ? " + leaf" : " + còn con"}`, en: `Node ${node.val}: ${isLeft ? "left child" : "not a left child"}${isLeaf ? " + leaf" : " + has children"}` },
      codeLines: [6], status: qualifies ? "match" : isLeaf ? "mismatch" : "checking",
      statusText: qualifies ? { vi: "Đây là left leaf", en: "This is a left leaf" } : isLeaf ? { vi: "Leaf nhưng không nằm bên trái", en: "A leaf, but not on the left" } : { vi: "Tiếp tục xuống các con", en: "Continue to its children" },
      cards: [
        { label: { vi: "is_left", en: "is_left" }, value: isLeft }, { label: { vi: "is_leaf", en: "is_leaf" }, value: isLeaf },
        { label: { vi: "ĐÓNG GÓP", en: "CONTRIBUTION" }, value: qualifies ? `+${node.val}` : "+0", tone: qualifies ? "success" : "neutral" },
      ],
      note: qualifies
        ? { vi: `Node ${node.val} thỏa cả hai điều kiện nên được cộng.`, en: `Node ${node.val} satisfies both conditions, so add it.` }
        : { vi: "Thiếu ít nhất một điều kiện nên đóng góp 0.", en: "At least one condition is missing, so the contribution is 0." },
    }));
    if (qualifies) {
      total += node.val;
      leftLeaves.add(node.id);
      checked.add(node.id);
      steps.push(treeEssentialsStep({
        problemId: 404, mode: "left-leaves", stages, stage: 2, event: "add", panels: makePanels(node), sequences: makeSequences(), status: "match",
        title: { vi: `Cộng ${node.val} vào tổng`, en: `Add ${node.val} to the sum` }, codeLines: [7],
        cards: [{ label: { vi: "PHÉP CỘNG", en: "ADDITION" }, value: `${total - node.val} + ${node.val} = ${total}`, tone: "success" }],
        note: { vi: `Tổng left leaves hiện tại là ${total}.`, en: `The running left-leaf sum is now ${total}.` },
      }));
    }
    checked.add(node.id);
    dfs(node.left, true);
    dfs(node.right, false);
  }
  dfs(root, false);
  steps.push(treeEssentialsStep({
    problemId: 404, mode: "left-leaves", stages, stage: 3, event: "done", panels: makePanels(), sequences: makeSequences(), status: "match", statusText: { vi: "Hoàn tất", en: "Complete" }, final: true,
    title: { vi: `Tổng các left leaves = ${total}`, en: `Sum of left leaves = ${total}` }, codeLines: [10],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: total, tone: "success" }],
    note: { vi: "Chỉ các leaf là con trái trực tiếp của cha mới xuất hiện trong tổng.", en: "Only leaves that are a parent's direct left child appear in the sum." },
  }));
  return { input, answer: total, steps };
}

function buildSteps617(input, params) {
  const root1 = parseTreeEssentialsInput(input, { allowEmpty: true });
  const root2 = parseTreeEssentialsInput(params?.root2 ?? "", { allowEmpty: true });
  const steps = [];
  const done1 = new Set(), done2 = new Set(), doneResult = new Set();
  let resultRoot = null;
  let nextId = 0;
  const stages = [
    { vi: "Ghép cặp node", en: "Pair nodes" }, { vi: "Cộng / lấy node", en: "Add / take node" },
    { vi: "Ghép hai nhánh", en: "Merge children" }, { vi: "Cây kết quả", en: "Result tree" },
  ];
  const panels = (a = null, b = null, result = null) => [
    { label: "root1", caption: { vi: "cây thứ nhất", en: "first tree" }, tree: treeEssentialsState(root1, { active: a ? [a] : [], done: done1 }) },
    { label: "root2", caption: { vi: "cây thứ hai", en: "second tree" }, tree: treeEssentialsState(root2, { active: b ? [b] : [], done: done2 }) },
    { label: { vi: "MERGED", en: "MERGED" }, caption: { vi: "được tạo dần", en: "built step by step" }, tree: treeEssentialsState(resultRoot, { active: result ? [result] : [], done: doneResult }) },
  ];
  steps.push(treeEssentialsStep({
    problemId: 617, mode: "merge", stages, stage: 0, event: "intro", panels: panels(),
    title: { vi: "Đặt hai cây chồng lên nhau", en: "Overlay the two trees" }, codeLines: [3, 5],
    cards: [{ label: { vi: "QUY TẮC", en: "RULE" }, value: "a + b" }, { label: { vi: "NẾU MỘT BÊN NULL", en: "IF ONE SIDE IS NULL" }, value: "0 + value" }],
    note: { vi: "Hai node cùng vị trí được cộng; nếu chỉ một node tồn tại thì giữ giá trị node đó.", en: "Add overlapping nodes; if only one node exists, keep that node's value." },
  }));
  function merge(a, b, path, parent = null, side = null) {
    if (!a && !b) return null;
    const leftValue = a ? a.val : 0;
    const rightValue = b ? b.val : 0;
    const node = { id: nextId++, val: leftValue + rightValue, left: null, right: null };
    if (parent && side) parent[side] = node;
    else resultRoot = node;
    if (a) done1.add(a.id);
    if (b) done2.add(b.id);
    steps.push(treeEssentialsStep({
      problemId: 617, mode: "merge", stages, stage: 1, event: "combine", panels: panels(a, b, node), status: "match",
      title: { vi: `Vị trí ${path}: ${leftValue} + ${rightValue} = ${node.val}`, en: `At ${path}: ${leftValue} + ${rightValue} = ${node.val}` }, codeLines: [6],
      cards: [{ label: { vi: "VỊ TRÍ", en: "PATH" }, value: path }, { label: { vi: "PHÉP GHÉP", en: "MERGE" }, value: `${leftValue} + ${rightValue} = ${node.val}`, tone: "success" }],
      note: { vi: "Tạo node kết quả trước, rồi đệ quy ghép con trái và con phải.", en: "Create the result node first, then recursively merge its left and right children." },
    }));
    node.left = merge(a && a.left, b && b.left, `${path}.left`, node, "left");
    node.right = merge(a && a.right, b && b.right, `${path}.right`, node, "right");
    doneResult.add(node.id);
    steps.push(treeEssentialsStep({
      problemId: 617, mode: "merge", stages, stage: 2, event: "return", panels: panels(null, null, node), status: "match",
      title: { vi: `Subtree ${path} đã ghép xong`, en: `Merged subtree ${path}` }, codeLines: [7, 8, 9],
      cards: [{ label: { vi: "NODE TRẢ VỀ", en: "RETURN NODE" }, value: node.val }, { label: { vi: "SUBTREE", en: "SUBTREE" }, value: JSON.stringify(serializeTreeEssentials(node)) }],
      note: { vi: "Cả hai nhánh con đã sẵn sàng; trả node này lên lời gọi cha.", en: "Both child branches are ready; return this node to its parent call." },
    }));
    return node;
  }
  resultRoot = merge(root1, root2, "root");
  const answer = serializeTreeEssentials(resultRoot);
  steps.push(treeEssentialsStep({
    problemId: 617, mode: "merge", stages, stage: 3, event: "done", panels: panels(), status: "match", statusText: { vi: "Cây mới hoàn tất", en: "New tree complete" }, final: true,
    title: { vi: "Hoàn tất cây merged", en: "Merged tree complete" }, codeLines: [10],
    cards: [{ label: { vi: "ĐÁP ÁN LEVEL-ORDER", en: "LEVEL-ORDER ANSWER" }, value: JSON.stringify(answer), tone: "success" }],
    note: { vi: "Mỗi vị trí trong cây kết quả là tổng của hai node chồng lên nhau, coi null là 0.", en: "Every result position is the sum of the overlapping nodes, treating null as 0." },
  }));
  return { input, root2: params?.root2, answer, steps };
}

function buildSteps572(input, params) {
  const root = parseTreeEssentialsInput(input);
  const subRoot = parseTreeEssentialsInput(params?.subRoot ?? "");
  const candidates = [];
  (function preorder(node) { if (!node) return; candidates.push(node); preorder(node.left); preorder(node.right); })(root);
  const steps = [];
  const rejected = new Set();
  let attemptRoot = null;
  let matchedA = new Set(), matchedB = new Set(), badA = new Set(), badB = new Set();
  let found = false;
  const stages = [
    { vi: "Chọn candidate", en: "Choose candidate" }, { vi: "So cấu trúc", en: "Compare shape" },
    { vi: "So giá trị", en: "Compare values" }, { vi: "Kết luận", en: "Conclusion" },
  ];
  const panels = (a = null, b = null) => [
    { label: { vi: "ROOT · thử từng node", en: "ROOT · TRY EACH NODE" }, caption: { vi: "đỏ = candidate đã loại", en: "red = rejected candidate" }, tree: treeEssentialsState(root, { active: a ? [a] : attemptRoot ? [attemptRoot] : [], done: matchedA, bad: new Set([...rejected, ...badA]) }) },
    { label: "subRoot", caption: { vi: "phải khớp toàn bộ", en: "must match completely" }, tree: treeEssentialsState(subRoot, { active: b ? [b] : [], done: matchedB, bad: badB }) },
  ];
  steps.push(treeEssentialsStep({
    problemId: 572, mode: "subtree", stages, stage: 0, event: "intro", panels: panels(),
    title: { vi: "Mỗi node của root là một candidate", en: "Every root node is a candidate" }, codeLines: [3, 4],
    cards: [{ label: { vi: "BƯỚC 1", en: "STEP 1" }, value: "scan root" }, { label: { vi: "BƯỚC 2", en: "STEP 2" }, value: "sameTree(candidate, subRoot)" }],
    note: { vi: "Chỉ candidate có cùng giá trị gốc mới có cơ hội; sau đó toàn bộ cấu trúc và giá trị phải khớp.", en: "Only a candidate with the same root value can work; then every shape and value must match." },
  }));
  function sameTree(a, b, path) {
    if (!a && !b) return true;
    if (!a || !b) {
      if (a) badA.add(a.id);
      if (b) badB.add(b.id);
      steps.push(treeEssentialsStep({
        problemId: 572, mode: "subtree", stages, stage: 1, event: "shape-mismatch", panels: panels(a, b), status: "mismatch",
        title: { vi: `Khác cấu trúc tại ${path}`, en: `Shape mismatch at ${path}` }, codeLines: [9, 10],
        cards: [{ label: "root", value: a ? a.val : "None" }, { label: "subRoot", value: b ? b.val : "None" }, { label: { vi: "KẾT QUẢ CẶP", en: "PAIR RESULT" }, value: false, tone: "danger" }],
        note: { vi: "Một bên có node còn bên kia là None nên hai subtree không thể giống nhau.", en: "One side has a node while the other is None, so the subtrees cannot match." },
      }));
      return false;
    }
    if (a.val !== b.val) {
      badA.add(a.id); badB.add(b.id);
      steps.push(treeEssentialsStep({
        problemId: 572, mode: "subtree", stages, stage: 2, event: "value-mismatch", panels: panels(a, b), status: "mismatch",
        title: { vi: `${a.val} ≠ ${b.val} tại ${path}`, en: `${a.val} ≠ ${b.val} at ${path}` }, codeLines: [11, 12],
        cards: [{ label: "root", value: a.val }, { label: "subRoot", value: b.val }, { label: { vi: "SO SÁNH", en: "COMPARE" }, value: `${a.val} ≠ ${b.val}`, tone: "danger" }],
        note: { vi: "Giá trị khác nhau nên loại candidate hiện tại.", en: "Different values reject the current candidate." },
      }));
      return false;
    }
    matchedA.add(a.id); matchedB.add(b.id);
    steps.push(treeEssentialsStep({
      problemId: 572, mode: "subtree", stages, stage: 2, event: "match", panels: panels(a, b), status: "match",
      title: { vi: `${a.val} = ${b.val} tại ${path}`, en: `${a.val} = ${b.val} at ${path}` }, codeLines: [11, 13],
      cards: [{ label: { vi: "VỊ TRÍ TƯƠNG ĐỐI", en: "RELATIVE PATH" }, value: path }, { label: { vi: "SO SÁNH", en: "COMPARE" }, value: `${a.val} = ${b.val}`, tone: "success" }],
      note: { vi: "Cặp này khớp; tiếp tục so cả nhánh trái và nhánh phải.", en: "This pair matches; continue with both left and right branches." },
    }));
    return sameTree(a.left, b.left, `${path}.left`) && sameTree(a.right, b.right, `${path}.right`);
  }
  for (const candidate of candidates) {
    attemptRoot = candidate;
    matchedA = new Set(); matchedB = new Set(); badA = new Set(); badB = new Set();
    steps.push(treeEssentialsStep({
      problemId: 572, mode: "subtree", stages, stage: 0, event: "candidate", panels: panels(candidate, subRoot),
      title: { vi: `Thử candidate ${candidate.val}`, en: `Try candidate ${candidate.val}` }, codeLines: [4, 5],
      cards: [{ label: { vi: "CANDIDATE", en: "CANDIDATE" }, value: candidate.val }, { label: { vi: "GỐC CẦN KHỚP", en: "TARGET ROOT" }, value: subRoot.val }],
      note: { vi: "Gọi sameTree từ candidate này với toàn bộ subRoot.", en: "Call sameTree from this candidate against the entire subRoot." },
    }));
    if (sameTree(candidate, subRoot, "root")) { found = true; break; }
    rejected.add(candidate.id);
  }
  steps.push(treeEssentialsStep({
    problemId: 572, mode: "subtree", stages, stage: 3, event: "done", panels: panels(found ? attemptRoot : null, found ? subRoot : null), status: found ? "match" : "mismatch",
    statusText: found ? { vi: "Tìm thấy subtree", en: "Subtree found" } : { vi: "Không có candidate nào khớp", en: "No candidate matched" }, final: true,
    title: { vi: `Kết quả: ${found}`, en: `Result: ${found}` }, codeLines: [6],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: found, tone: found ? "success" : "danger" }, { label: { vi: "CANDIDATES ĐÃ THỬ", en: "CANDIDATES TRIED" }, value: found ? rejected.size + 1 : rejected.size }],
    note: found
      ? { vi: "Một candidate khớp toàn bộ cấu trúc và giá trị của subRoot.", en: "One candidate matches the complete structure and values of subRoot." }
      : { vi: "Mọi candidate đều sai cấu trúc hoặc sai ít nhất một giá trị.", en: "Every candidate has a shape mismatch or at least one different value." },
  }));
  return { input, subRoot: params?.subRoot, answer: found, steps };
}

function buildSteps965(input) {
  const root = parseTreeEssentialsInput(input, { minValue: 0, maxValue: 99 });
  const steps = [];
  const checked = new Set();
  const bad = new Set();
  const target = root.val;
  let answer = true;
  const stages = [
    { vi: "Chọn giá trị gốc", en: "Choose root value" }, { vi: "Duyệt từng node", en: "Check each node" },
    { vi: "Dừng khi khác", en: "Stop on mismatch" }, { vi: "Kết luận", en: "Conclusion" },
  ];
  const panels = (active = null) => [{
    label: { vi: `MỌI NODE PHẢI BẰNG ${target}`, en: `EVERY NODE MUST EQUAL ${target}` },
    caption: { vi: "xanh = đã khớp · đỏ = khác", en: "green = matched · red = different" },
    tree: treeEssentialsState(root, { active: active ? [active] : [], done: checked, bad }),
  }];
  steps.push(treeEssentialsStep({
    problemId: 965, mode: "unival", stages, stage: 0, event: "intro", panels: panels(),
    title: { vi: `Dùng giá trị root ${target} làm chuẩn`, en: `Use root value ${target} as the target` }, codeLines: [3],
    cards: [{ label: { vi: "TARGET", en: "TARGET" }, value: target }, { label: { vi: "QUY TẮC", en: "RULE" }, value: "node.val == target" }],
    note: { vi: "Chỉ cần gặp một node khác target là có thể trả False ngay.", en: "The first node different from target lets us return False immediately." },
  }));
  function dfs(node) {
    if (!node || !answer) return;
    const match = node.val === target;
    if (match) checked.add(node.id); else { bad.add(node.id); answer = false; }
    steps.push(treeEssentialsStep({
      problemId: 965, mode: "unival", stages, stage: match ? 1 : 2, event: match ? "match" : "mismatch", panels: panels(node), status: match ? "match" : "mismatch",
      title: { vi: `${node.val} ${match ? "=" : "≠"} ${target}`, en: `${node.val} ${match ? "=" : "≠"} ${target}` }, codeLines: match ? [7, 9] : [7, 8],
      cards: [{ label: { vi: "NODE", en: "NODE" }, value: node.val }, { label: { vi: "TARGET", en: "TARGET" }, value: target }, { label: { vi: "KẾT QUẢ", en: "RESULT" }, value: match, tone: match ? "success" : "danger" }],
      note: match
        ? { vi: "Node này khớp; tiếp tục DFS.", en: "This node matches; keep walking." }
        : { vi: "Node khác giá trị gốc nên cây không phải uni-valued; dừng sớm.", en: "This node differs from the root value, so the tree is not uni-valued; stop early." },
    }));
    dfs(node.left);
    dfs(node.right);
  }
  dfs(root);
  steps.push(treeEssentialsStep({
    problemId: 965, mode: "unival", stages, stage: 3, event: "done", panels: panels(), status: answer ? "match" : "mismatch", final: true,
    statusText: answer ? { vi: "Mọi node đều giống nhau", en: "Every node has the same value" } : { vi: "Có node khác target", en: "A node differs from target" },
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` }, codeLines: [8],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: answer, tone: answer ? "success" : "danger" }, { label: { vi: "NODE ĐÃ KIỂM TRA", en: "NODES CHECKED" }, value: checked.size + bad.size }],
    note: answer
      ? { vi: `Tất cả node đều có giá trị ${target}.`, en: `Every node has value ${target}.` }
      : { vi: "DFS dừng ngay tại mismatch đầu tiên.", en: "DFS stopped at the first mismatch." },
  }));
  return { input, answer, steps };
}

function buildSteps872(input, params) {
  const root1 = parseTreeEssentialsInput(input, { minValue: 0, maxValue: 200 });
  const root2 = parseTreeEssentialsInput(params?.root2 ?? "", { minValue: 0, maxValue: 200 });
  const steps = [];
  const leaves1 = [], leaves2 = [];
  const visited1 = new Set(), visited2 = new Set();
  let current1 = null, current2 = null;
  const stages = [
    { vi: "Lấy leaves cây 1", en: "Collect tree 1" }, { vi: "Lấy leaves cây 2", en: "Collect tree 2" },
    { vi: "So sequence", en: "Compare sequences" }, { vi: "Kết luận", en: "Conclusion" },
  ];
  const panels = () => [
    { label: "root1", caption: { vi: "đọc leaf từ trái sang phải", en: "read leaves left to right" }, tree: treeEssentialsState(root1, { active: current1 ? [current1] : [], done: visited1 }) },
    { label: "root2", caption: { vi: "đọc leaf từ trái sang phải", en: "read leaves left to right" }, tree: treeEssentialsState(root2, { active: current2 ? [current2] : [], done: visited2 }) },
  ];
  const sequences = (activeIndex = null) => [
    { label: { vi: "leaf sequence 1", en: "leaf sequence 1" }, values: [...leaves1], activeIndex, tone: "first" },
    { label: { vi: "leaf sequence 2", en: "leaf sequence 2" }, values: [...leaves2], activeIndex, tone: "second" },
  ];
  steps.push(treeEssentialsStep({
    problemId: 872, mode: "leaf-sequence", stages, stage: 0, event: "intro", panels: panels(), sequences: sequences(),
    title: { vi: "Chỉ ghi lại leaf, theo thứ tự trái → phải", en: "Record only leaves, from left → right" }, codeLines: [3, 4],
    cards: [{ label: { vi: "BỎ QUA", en: "IGNORE" }, value: "internal nodes" }, { label: { vi: "SO SÁNH", en: "COMPARE" }, value: "leaf sequence 1 == 2" }],
    note: { vi: "Hình dạng hai cây có thể khác; chỉ dãy giá trị tại lá cần giống hệt nhau.", en: "The tree shapes may differ; only their leaf-value sequences must be identical." },
  }));
  function collect(node, which) {
    if (!node) return;
    if (which === 1) current1 = node; else current2 = node;
    const leaves = which === 1 ? leaves1 : leaves2;
    const visited = which === 1 ? visited1 : visited2;
    const isLeaf = !node.left && !node.right;
    if (isLeaf) leaves.push(node.val);
    steps.push(treeEssentialsStep({
      problemId: 872, mode: "leaf-sequence", stages, stage: which - 1, event: isLeaf ? "leaf" : "walk", panels: panels(), sequences: sequences(), status: isLeaf ? "match" : "checking",
      title: isLeaf ? { vi: `Cây ${which}: gặp leaf ${node.val}`, en: `Tree ${which}: found leaf ${node.val}` } : { vi: `Cây ${which}: đi qua node ${node.val}`, en: `Tree ${which}: walk through node ${node.val}` },
      codeLines: isLeaf ? [5, 6] : [7, 8],
      cards: [{ label: { vi: "CÂY", en: "TREE" }, value: `root${which}` }, { label: { vi: "NODE", en: "NODE" }, value: node.val }, { label: { vi: "LÀ LEAF?", en: "IS LEAF?" }, value: isLeaf, tone: isLeaf ? "success" : "neutral" }],
      note: isLeaf
        ? { vi: `Append ${node.val} vào cuối sequence ${which}.`, en: `Append ${node.val} to sequence ${which}.` }
        : { vi: "Node còn con nên không thuộc leaf sequence; tiếp tục đi trái trước.", en: "This node has children, so it is not in the leaf sequence; continue left first." },
    }));
    visited.add(node.id);
    collect(node.left, which);
    collect(node.right, which);
  }
  collect(root1, 1); current1 = null;
  collect(root2, 2); current2 = null;
  const length = Math.max(leaves1.length, leaves2.length);
  let answer = leaves1.length === leaves2.length;
  for (let index = 0; index < length; index++) {
    const a = leaves1[index];
    const b = leaves2[index];
    const match = a === b;
    if (!match) answer = false;
    steps.push(treeEssentialsStep({
      problemId: 872, mode: "leaf-sequence", stages, stage: 2, event: "compare", panels: panels(), sequences: sequences(index), status: match ? "match" : "mismatch",
      title: { vi: `Vị trí ${index}: ${a ?? "∅"} ${match ? "=" : "≠"} ${b ?? "∅"}`, en: `Index ${index}: ${a ?? "∅"} ${match ? "=" : "≠"} ${b ?? "∅"}` }, codeLines: [13],
      cards: [{ label: { vi: "INDEX", en: "INDEX" }, value: index }, { label: "root1", value: a ?? "∅" }, { label: "root2", value: b ?? "∅" }, { label: { vi: "KHỚP?", en: "MATCH?" }, value: match, tone: match ? "success" : "danger" }],
      note: match
        ? { vi: "Hai leaf ở cùng vị trí khớp nhau.", en: "The leaves at this position match." }
        : { vi: "Một vị trí khác nhau là đủ để kết luận hai cây không leaf-similar.", en: "One different position is enough to prove the trees are not leaf-similar." },
    }));
  }
  steps.push(treeEssentialsStep({
    problemId: 872, mode: "leaf-sequence", stages, stage: 3, event: "done", panels: panels(), sequences: sequences(), status: answer ? "match" : "mismatch", final: true,
    title: { vi: `Hai leaf sequence ${answer ? "giống nhau" : "khác nhau"}`, en: `The leaf sequences are ${answer ? "identical" : "different"}` }, codeLines: [13],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: answer, tone: answer ? "success" : "danger" }, { label: { vi: "SỐ LEAVES", en: "LEAF COUNTS" }, value: `${leaves1.length} / ${leaves2.length}` }],
    note: answer
      ? { vi: "Cùng số leaf và mọi giá trị cùng vị trí đều bằng nhau.", en: "The counts match and every value at the same position is equal." }
      : { vi: "Hai dãy khác độ dài hoặc khác ít nhất một giá trị.", en: "The sequences differ in length or at least one value." },
  }));
  return { input, root2: params?.root2, answer, steps };
}

function buildSteps951(input, params) {
  const root1 = parseTreeEssentialsInput(input, { allowEmpty: true, minValue: 0, maxValue: 99 });
  const root2 = parseTreeEssentialsInput(params?.root2 ?? "", { allowEmpty: true, minValue: 0, maxValue: 99 });
  const steps = [];
  const matched1 = new Set(), matched2 = new Set(), bad1 = new Set(), bad2 = new Set();
  const stages = [
    { vi: "So node hiện tại", en: "Compare nodes" }, { vi: "Xem hướng con", en: "Inspect children" },
    { vi: "Giữ / flip", en: "Keep / flip" }, { vi: "Kết luận", en: "Conclusion" },
  ];
  const panels = (a = null, b = null) => [
    { label: "root1", caption: { vi: "cây cần biến đổi", en: "tree that may be flipped" }, tree: treeEssentialsState(root1, { active: a ? [a] : [], done: matched1, bad: bad1 }) },
    { label: "root2", caption: { vi: "cây mục tiêu", en: "target tree" }, tree: treeEssentialsState(root2, { active: b ? [b] : [], done: matched2, bad: bad2 }) },
  ];
  const nodeValue = (node) => node ? node.val : "∅";
  steps.push(treeEssentialsStep({
    problemId: 951, mode: "flip-equiv", stages, stage: 0, event: "intro", panels: panels(),
    title: { vi: "Tại mỗi node: giữ hướng hoặc flip hai con", en: "At each node: keep or flip its children" }, codeLines: [3, 4],
    cards: [{ label: { vi: "KHÔNG FLIP", en: "NO FLIP" }, value: "L↔L, R↔R" }, { label: "FLIP", value: "L↔R, R↔L" }],
    note: { vi: "Giá trị node hiện tại phải bằng nhau trước; sau đó chọn cách ghép hai nhánh con.", en: "Current node values must match first; then choose how to pair their child branches." },
  }));
  function compare(a, b, path) {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) {
      if (a) bad1.add(a.id);
      if (b) bad2.add(b.id);
      steps.push(treeEssentialsStep({
        problemId: 951, mode: "flip-equiv", stages, stage: 0, event: "mismatch", panels: panels(a, b), status: "mismatch",
        title: { vi: `Cặp ${path} không khớp`, en: `Pair ${path} does not match` }, codeLines: [3, 4],
        cards: [{ label: "root1", value: nodeValue(a) }, { label: "root2", value: nodeValue(b) }, { label: { vi: "KẾT QUẢ CẶP", en: "PAIR RESULT" }, value: false, tone: "danger" }],
        note: { vi: "Một bên thiếu node hoặc hai giá trị khác nhau; flip không thể sửa giá trị gốc của subtree này.", en: "One node is missing or the values differ; a flip cannot repair this subtree root." },
      }));
      return false;
    }
    matched1.add(a.id); matched2.add(b.id);
    steps.push(treeEssentialsStep({
      problemId: 951, mode: "flip-equiv", stages, stage: 0, event: "match", panels: panels(a, b), status: "match",
      title: { vi: `${a.val} = ${b.val}: so hướng hai con`, en: `${a.val} = ${b.val}: inspect child orientation` }, codeLines: [5],
      cards: [{ label: { vi: "VỊ TRÍ", en: "PATH" }, value: path }, { label: { vi: "NODE KHỚP", en: "MATCHED NODE" }, value: a.val, tone: "success" }],
      note: { vi: "Giá trị gốc khớp; giờ xác định con trái của root1 nằm bên trái hay bên phải root2.", en: "The roots match; now determine whether root1's left child appears on root2's left or right." },
    }));
    const straight = nodeValue(a.left) === nodeValue(b.left);
    const orientation = straight ? "NO FLIP · L↔L, R↔R" : "FLIP · L↔R, R↔L";
    steps.push(treeEssentialsStep({
      problemId: 951, mode: "flip-equiv", stages, stage: straight ? 1 : 2, event: straight ? "straight" : "flip", panels: panels(a, b), status: "checking",
      title: straight ? { vi: `Node ${a.val}: giữ nguyên hướng`, en: `Node ${a.val}: keep orientation` } : { vi: `Node ${a.val}: flip hai nhánh`, en: `Node ${a.val}: flip child branches` },
      codeLines: straight ? [7, 8, 9, 10] : [7, 8, 9, 11],
      cards: [
        { label: { vi: "CON TRÁI root1", en: "root1 LEFT" }, value: nodeValue(a.left) },
        { label: { vi: "CON TRÁI root2", en: "root2 LEFT" }, value: nodeValue(b.left) },
        { label: { vi: "CÁCH GHÉP", en: "PAIRING" }, value: orientation, tone: straight ? "neutral" : "warning" },
      ],
      note: straight
        ? { vi: "Hai con trái có cùng gốc nên ghép thẳng các nhánh tương ứng.", en: "The left-child roots match, so pair corresponding branches directly." }
        : { vi: "Con trái không cùng gốc; đổi chéo trái ↔ phải tại node này.", en: "The left-child roots differ; cross left ↔ right at this node." },
    }));
    if (straight) return compare(a.left, b.left, `${path}.left`) && compare(a.right, b.right, `${path}.right`);
    return compare(a.left, b.right, `${path}.left↔right`) && compare(a.right, b.left, `${path}.right↔left`);
  }
  const answer = compare(root1, root2, "root");
  steps.push(treeEssentialsStep({
    problemId: 951, mode: "flip-equiv", stages, stage: 3, event: "done", panels: panels(), status: answer ? "match" : "mismatch", final: true,
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` }, codeLines: [10],
    cards: [{ label: { vi: "ĐÁP ÁN", en: "ANSWER" }, value: answer, tone: answer ? "success" : "danger" }, { label: { vi: "CẶP NODE ĐÃ KHỚP", en: "MATCHED NODE PAIRS" }, value: Math.min(matched1.size, matched2.size) }],
    note: answer
      ? { vi: "Mọi cặp subtree đều khớp sau khi giữ hoặc flip hướng phù hợp.", en: "Every subtree pair matches after keeping or flipping the appropriate orientation." }
      : { vi: "Có ít nhất một cặp subtree không thể khớp bằng phép flip.", en: "At least one subtree pair cannot be matched by flipping." },
  }));
  return { input, root2: params?.root2, answer, steps };
}

Object.assign(module.exports, {
  257: {
    id: 257, difficulty: "easy", slug: "binary-tree-paths", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS + Backtracking", en: "DFS + Backtracking" }],
    title: { vi: "Binary Tree Paths", en: "Binary Tree Paths" }, titleVi: { vi: "Mọi đường đi từ root đến leaf", en: "All root-to-leaf paths" },
    statement: { vi: "Trả về mọi đường đi từ root đến leaf. Một leaf là node không có con.", en: "Return every root-to-leaf path. A leaf is a node with no children." },
    defaultInput: "1,2,3,null,5", inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" }, extraParams: [],
    approach: [
      { vi: "DFS mang theo path hiện tại; append node khi đi xuống.", en: "DFS carries the current path and appends each node while descending." },
      { vi: "Khi gặp leaf, chuyển path thành chuỗi và lưu vào kết quả.", en: "At a leaf, convert the path to a string and save it." },
      { vi: "Pop khi quay lui để path không lẫn node của nhánh trước.", en: "Pop while backtracking so the next branch does not inherit the previous branch's nodes." },
    ], complexity: { time: "O(n²) worst case", space: "O(h)", note: { vi: "Có thể cần O(n) để tạo mỗi chuỗi path; stack/path cao h.", en: "Creating each path string may cost O(n); stack/path height is h." } },
    code: ["class Solution:", "    def binaryTreePaths(self, root):", "        paths = []", "        def dfs(node, path):", "            path.append(str(node.val))", "            if not node.left and not node.right:", "                paths.append('->'.join(path))", "            else:", "                if node.left: dfs(node.left, path)", "                if node.right: dfs(node.right, path)", "            path.pop()", "        dfs(root, [])", "        return paths"],
    builder: buildSteps257,
  },
  404: {
    id: 404, difficulty: "easy", slug: "sum-of-left-leaves", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS", en: "DFS" }], title: { vi: "Sum of Left Leaves", en: "Sum of Left Leaves" }, titleVi: { vi: "Tổng các leaf bên trái", en: "Sum all left leaves" },
    statement: { vi: "Trả về tổng của mọi left leaf: node vừa là con trái của cha, vừa không có con.", en: "Return the sum of every left leaf: a node that is both a left child and has no children." },
    defaultInput: "3,9,20,null,null,15,7", inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" }, extraParams: [],
    approach: [{ vi: "DFS truyền cờ is_left cho từng node.", en: "DFS passes an is_left flag to each node." }, { vi: "Chỉ cộng node.val khi is_left và node là leaf.", en: "Add node.val only when is_left and the node is a leaf." }],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi node được kiểm tra một lần; stack đệ quy cao h.", en: "Each node is checked once; the recursion stack has height h." } },
    code: ["class Solution:", "    def sumOfLeftLeaves(self, root):", "        def dfs(node, is_left):", "            if not node:", "                return 0", "            if is_left and not node.left and not node.right:", "                return node.val", "            return dfs(node.left, True) + dfs(node.right, False)", "", "        return dfs(root, False)"],
    builder: buildSteps404,
  },
  617: {
    id: 617, difficulty: "easy", slug: "merge-two-binary-trees", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS hai cây", en: "Two-tree DFS" }], title: { vi: "Merge Two Binary Trees", en: "Merge Two Binary Trees" }, titleVi: { vi: "Ghép hai cây nhị phân", en: "Merge two binary trees" },
    statement: { vi: "Chồng hai cây từ root. Node trùng vị trí được cộng; nếu một bên null thì dùng node còn lại.", en: "Overlay two trees from their roots. Add overlapping nodes; if one side is null, use the other node." },
    defaultInput: "1,3,2,5", inputKind: "string", inputLabel: { vi: "root1 (level-order)", en: "root1 (level-order)" },
    extraParams: [{ key: "root2", type: "string", label: { vi: "root2 (level-order)", en: "root2 (level-order)" }, default: "2,1,3,null,4,null,7" }],
    approach: [{ vi: "Tại mỗi vị trí, coi null là 0 và tạo node có tổng hai giá trị.", en: "At every position, treat null as 0 and create a node with the two-value sum." }, { vi: "Đệ quy ghép cặp con trái, rồi cặp con phải.", en: "Recursively merge the left-child pair, then the right-child pair." }],
    complexity: { time: "O(n + m)", space: "O(h)", note: { vi: "Mỗi node của hai cây được chạm tối đa một lần; h là độ cao lớn hơn.", en: "Each node across both trees is touched at most once; h is the larger height." } },
    code: ["class Solution:", "    def mergeTrees(self, root1, root2):", "        if not root1 and not root2:", "            return None", "        a = root1.val if root1 else 0", "        b = root2.val if root2 else 0", "        node = TreeNode(a + b)", "        node.left = self.mergeTrees(root1.left if root1 else None, root2.left if root2 else None)", "        node.right = self.mergeTrees(root1.right if root1 else None, root2.right if root2 else None)", "        return node"],
    builder: buildSteps617,
  },
  572: {
    id: 572, difficulty: "easy", slug: "subtree-of-another-tree", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS hai cây", en: "Two-tree DFS" }], title: { vi: "Subtree of Another Tree", en: "Subtree of Another Tree" }, titleVi: { vi: "Một cây có nằm trọn trong cây kia", en: "Is one tree a complete subtree of another" },
    statement: { vi: "Trả về True nếu tồn tại một node trong root mà toàn bộ subtree tại đó có cùng cấu trúc và giá trị với subRoot.", en: "Return True if some node in root begins a subtree with exactly the same structure and values as subRoot." },
    defaultInput: "3,4,5,1,2", inputKind: "string", inputLabel: { vi: "root (level-order)", en: "root (level-order)" },
    extraParams: [{ key: "subRoot", type: "string", label: { vi: "subRoot (level-order)", en: "subRoot (level-order)" }, default: "4,1,2" }],
    approach: [{ vi: "Duyệt từng node của root như một candidate.", en: "Visit every root node as a candidate." }, { vi: "Với mỗi candidate, sameTree kiểm tra toàn bộ cấu trúc và giá trị với subRoot.", en: "For each candidate, sameTree checks the complete shape and values against subRoot." }],
    complexity: { time: "O(mn) worst case", space: "O(h)", note: { vi: "Có thể so tối đa n node của subRoot tại mỗi trong m candidates.", en: "Up to n subRoot nodes may be compared at each of m candidates." } },
    code: ["class Solution:", "    def isSubtree(self, root, subRoot):", "        if not root:", "            return False", "        if self.same(root, subRoot):", "            return True", "        return self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)", "", "    def same(self, a, b):", "        if not a and not b:", "            return True", "        if not a or not b or a.val != b.val:", "            return False", "        return self.same(a.left, b.left) and self.same(a.right, b.right)"],
    builder: buildSteps572,
  },
  965: {
    id: 965, difficulty: "easy", slug: "univalued-binary-tree", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS", en: "DFS" }], title: { vi: "Univalued Binary Tree", en: "Univalued Binary Tree" }, titleVi: { vi: "Mọi node có cùng giá trị", en: "Does every node have one value" },
    statement: { vi: "Cây là uni-valued khi mọi node có cùng giá trị. Trả về True nếu cây đã cho là uni-valued.", en: "A tree is uni-valued when every node has the same value. Return True if the given tree is uni-valued." },
    defaultInput: "1,1,1,1,1,null,1", inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" }, extraParams: [],
    approach: [{ vi: "Lấy root.val làm target rồi DFS toàn cây.", en: "Use root.val as the target, then DFS the tree." }, { vi: "Nếu một node khác target, trả False ngay; nếu duyệt hết thì True.", en: "Return False at the first node different from target; reaching the end means True." }],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt tối đa mỗi node một lần, có thể dừng sớm.", en: "Visit each node at most once, with possible early exit." } },
    code: ["class Solution:", "    def isUnivalTree(self, root):", "        target = root.val", "        def dfs(node):", "            if not node:", "                return True", "            if node.val != target:", "                return False", "            return dfs(node.left) and dfs(node.right)", "        return dfs(root)"],
    builder: buildSteps965,
  },
  872: {
    id: 872, difficulty: "easy", slug: "leaf-similar-trees", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS hai cây", en: "Two-tree DFS" }], title: { vi: "Leaf-Similar Trees", en: "Leaf-Similar Trees" }, titleVi: { vi: "Hai cây có cùng dãy leaf", en: "Do two trees share a leaf sequence" },
    statement: { vi: "Đọc giá trị các leaf từ trái sang phải ở mỗi cây. Trả về True khi hai dãy giống hệt nhau.", en: "Read each tree's leaf values from left to right. Return True when the two sequences are identical." },
    defaultInput: "3,5,1,6,2,9,8,null,null,7,4", inputKind: "string", inputLabel: { vi: "root1 (level-order)", en: "root1 (level-order)" },
    extraParams: [{ key: "root2", type: "string", label: { vi: "root2 (level-order)", en: "root2 (level-order)" }, default: "3,5,1,6,7,4,2,null,null,null,null,null,null,9,8" }],
    approach: [{ vi: "DFS trái trước để thu leaf sequence của từng cây.", en: "Use left-first DFS to collect each tree's leaf sequence." }, { vi: "So sánh hai mảng về cả độ dài lẫn từng giá trị.", en: "Compare the arrays by both length and every value." }],
    complexity: { time: "O(n + m)", space: "O(h1 + h2)", note: { vi: "Mỗi node được duyệt một lần; lưu tối đa số leaf của hai cây.", en: "Each node is visited once; store at most all leaves from both trees." } },
    code: ["class Solution:", "    def leafSimilar(self, root1, root2):", "        def leaves(root):", "            result = []", "            def dfs(node):", "                if not node.left and not node.right:", "                    result.append(node.val)", "                    return", "                if node.left: dfs(node.left)", "                if node.right: dfs(node.right)", "            dfs(root)", "            return result", "        return leaves(root1) == leaves(root2)"],
    builder: buildSteps872,
  },
  951: {
    id: 951, difficulty: "medium", slug: "flip-equivalent-binary-trees", category: TREE_CAT,
    tags: [{ key: "dfs", vi: "DFS hai cây", en: "Two-tree DFS" }], title: { vi: "Flip Equivalent Binary Trees", en: "Flip Equivalent Binary Trees" }, titleVi: { vi: "Hai cây tương đương sau các phép flip", en: "Are two trees equivalent after flips" },
    statement: { vi: "Một phép flip đổi chỗ subtree trái và phải tại một node. Trả về True nếu một số phép flip có thể làm hai cây giống nhau.", en: "A flip swaps a node's left and right subtrees. Return True if some flips can make the two trees equal." },
    defaultInput: "1,2,3,4,5,6,null,null,null,7,8", inputKind: "string", inputLabel: { vi: "root1 (level-order; [] nếu rỗng)", en: "root1 (level-order; [] for empty)" },
    extraParams: [{ key: "root2", type: "string", label: { vi: "root2 (level-order; [] nếu rỗng)", en: "root2 (level-order; [] for empty)" }, default: "1,3,2,null,6,4,5,null,null,null,null,8,7" }],
    approach: [{ vi: "Hai node hiện tại phải cùng rỗng hoặc có cùng giá trị.", en: "Current nodes must both be empty or have the same value." }, { vi: "Vì giá trị trong mỗi cây là duy nhất, nhìn gốc con trái để chọn ghép thẳng (L-L, R-R) hay flip (L-R, R-L).", en: "Because each tree has unique values, inspect the left-child root to choose straight pairing (L-L, R-R) or flipped pairing (L-R, R-L)." }],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Mỗi cặp node được xét một lần; stack đệ quy cao h.", en: "Each node pair is checked once; the recursion stack has height h." } },
    code: ["class Solution:", "    def flipEquiv(self, root1, root2):", "        if not root1 or not root2:", "            return root1 is root2", "        if root1.val != root2.val:", "            return False", "        left1 = root1.left.val if root1.left else -1", "        left2 = root2.left.val if root2.left else -1", "        if left1 == left2:", "            return self.flipEquiv(root1.left, root2.left) and self.flipEquiv(root1.right, root2.right)", "        return self.flipEquiv(root1.left, root2.right) and self.flipEquiv(root1.right, root2.left)"],
    builder: buildSteps951,
  },
});
