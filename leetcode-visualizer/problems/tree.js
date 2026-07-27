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
  return {
    title: opts.title,
    arr: [],
    tree: { nodes: treeToVizNodes(root, opts.hlSet, opts.wordSet), annotations: opts.annotations },
    highlight: [],
    mark: [],
    codeLines: opts.codeLines || [],
    codeBlock: opts.codeBlock,
    queueView: opts.queueView,
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
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "Độ sâu lớn nhất của cây", en: "Maximum depth of binary tree" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "depth = 1 + max(left, right)" }],
    note: { vi: `depth(node) = 1 + max(depth(trái), depth(phải)). null → 0, lá → 1. Tính từ dưới lên (postorder).`, en: `depth(node) = 1 + max(depth(left), depth(right)). null → 0, leaf → 1. Computed bottom-up (postorder).` },
  }));
  let answer = 0;
  function dfs(node) {
    if (!node) return 0;
    const l = dfs(node.left), r = dfs(node.right);
    const d = 1 + Math.max(l, r); answer = Math.max(answer, d);
    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: depth = ${d}`, en: `Node ${node.val}: depth = ${d}` },
      hlSet: new Set([node.id]), codeLines: [4, 5],
      vars: [{ name: "node", value: node.val }, { name: "left depth", value: l }, { name: "right depth", value: r }, { name: "depth", value: d }],
      note: { vi: `depth = 1 + max(${l}, ${r}) = ${d}.`, en: `depth = 1 + max(${l}, ${r}) = ${d}.` },
    }));
    return d;
  }
  const ans = dfs(root);
  const fs = snapshot(root, {
    title: { vi: `Max depth = ${ans}`, en: `Max depth = ${ans}` },
    vars: [{ name: "answer", value: ans }],
    note: { vi: `Độ sâu lớn nhất của cây = ${ans}.`, en: `Maximum depth of the tree = ${ans}.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: ans, steps };
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

// ─── 112: Path Sum (root-to-leaf) ───
function buildSteps112(input, params) {
  const root = parseTree(input); const target = params.target !== undefined ? Number(params.target) : 20; const steps = [];
  steps.push(snapshot(root, {
    title: { vi: `Có đường root→leaf tổng = ${target}?`, en: `Path root→leaf summing to ${target}?` },
    codeLines: [2, 3], vars: [{ name: "targetSum", value: target }],
    note: { vi: `Đi từ GỐC xuống LÁ, trừ dần giá trị nút khỏi target. Tới lá mà remaining = 0 → tìm thấy.`, en: `Go from ROOT to LEAF, subtracting each node value from target. Reach a leaf with remaining = 0 → found.` },
  }));
  let answer = false; const foundPath = [];
  function dfs(node, remaining, path) {
    if (!node) return false;
    const rem = remaining - node.val;
    const np = [...path, node.id];
    const isLeaf = !node.left && !node.right;
    steps.push(snapshot(root, {
      title: { vi: `Tại ${node.val}, còn lại ${rem}`, en: `At ${node.val}, remaining ${rem}` },
      hlSet: new Set([node.id]), wordSet: new Set(np), codeLines: [4, 5],
      vars: [{ name: "node", value: node.val }, { name: "remaining", value: rem }, { name: "leaf?", value: isLeaf }],
      note: {
        vi: `remaining = ${remaining} - ${node.val} = ${rem}.` + (isLeaf ? (rem === 0 ? ` Lá & remaining = 0 → TÌM THẤY!` : ` Lá nhưng remaining ≠ 0 → quay lui.`) : ``),
        en: `remaining = ${remaining} - ${node.val} = ${rem}.` + (isLeaf ? (rem === 0 ? ` Leaf & remaining = 0 → FOUND!` : ` Leaf but remaining ≠ 0 → backtrack.`) : ``),
      },
    }));
    if (isLeaf && rem === 0) { answer = true; foundPath.push(...np); return true; }
    if (dfs(node.left, rem, np)) return true;
    if (dfs(node.right, rem, np)) return true;
    return false;
  }
  if (root) dfs(root, target, []);
  const fs = snapshot(root, {
    title: { vi: answer ? `✓ Có đường tổng = ${target}` : `✗ Không có đường nào`, en: answer ? `✓ Path summing to ${target} exists` : `✗ No such path` },
    wordSet: answer ? new Set(foundPath) : undefined, vars: [{ name: "answer", value: answer }],
    note: { vi: answer ? `Tồn tại đường root→leaf có tổng = ${target}.` : `Không có đường root→leaf nào tổng = ${target}.`, en: answer ? `A root→leaf path sums to ${target}.` : `No root→leaf path sums to ${target}.` },
  }); fs.final = true; steps.push(fs);
  return { input, answer, steps };
}

// ─── 543: Diameter of Binary Tree ───
function buildSteps543(input) {
  const root = parseTree(input); const steps = [];
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
  function depth(node) {
    if (!node) {
      steps.push(snapshot(root, {
        title: { vi: "depth(None) trả về 0", en: "depth(None) returns 0" },
        codeLines: [5],
        vars: [{ name: "node", value: "None" }, { name: "l", value: "—" }, { name: "r", value: "—" }, { name: "return", value: 0 }, { name: "self.best", value: best }],
        note: { vi: "Đây là điều kiện dừng của đệ quy; cây rỗng có chiều cao 0.", en: "This is the recursion base case; an empty tree has height 0." },
      }));
      return 0;
    }
    steps.push(snapshot(root, {
      title: { vi: `Kiểm tra nút ${node.val}`, en: `Check node ${node.val}` },
      hlSet: new Set([node.id]), codeLines: [5],
      vars: [{ name: "node", value: node.val }, { name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "self.best", value: best }],
      note: { vi: `Nút ${node.val} khác None nên tiếp tục tính độ sâu hai nhánh.`, en: `Node ${node.val} is not None, so compute both subtree depths.` },
    }));
    steps.push(snapshot(root, {
      title: { vi: `Gọi depth bên trái của ${node.val}`, en: `Call the left depth of ${node.val}` },
      hlSet: new Set([node.id]), codeLines: [6],
      vars: [{ name: "node", value: node.val }, { name: "l", value: "pending" }, { name: "r", value: "pending" }, { name: "left child", value: node.left ? node.left.val : "None" }, { name: "self.best", value: best }],
      note: { vi: `Dòng 6 gọi đệ quy cho node.left của ${node.val}.`, en: `Line 6 recursively evaluates node.left of ${node.val}.` },
    }));
    const l = depth(node.left);
    steps.push(snapshot(root, {
      title: { vi: `Nhánh trái của ${node.val} có depth = ${l}`, en: `Left depth of ${node.val} is ${l}` },
      hlSet: new Set([node.id]), codeLines: [7],
      vars: [{ name: "node", value: node.val }, { name: "l", value: l }, { name: "r", value: "pending" }, { name: "right child", value: node.right ? node.right.val : "None" }, { name: "self.best", value: best }],
      note: { vi: `Đã nhận l = ${l}; dòng 7 tiếp tục gọi đệ quy cho node.right.`, en: `Received l = ${l}; line 7 now recursively evaluates node.right.` },
    }));
    const r = depth(node.right);
    if (node === root) { rootL = l; rootR = r; }
    const through = l + r;
    if (through > best) { best = through; bestId = node.id; }
    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: qua đây = ${through}`, en: `Node ${node.val}: through = ${through}` },
      hlSet: new Set([node.id]), codeLines: [8],
      vars: [{ name: "node", value: node.val }, { name: "l", value: l }, { name: "r", value: r }, { name: "path through", value: through }, { name: "self.best", value: best }],
      note: { vi: `Đường đi qua ${node.val} = ${l} + ${r} = ${through} cạnh. best = ${best}.`, en: `Path through ${node.val} = ${l} + ${r} = ${through} edges. best = ${best}.` },
    }));
    const height = 1 + Math.max(l, r);
    steps.push(snapshot(root, {
      title: { vi: `depth(${node.val}) trả về ${height}`, en: `depth(${node.val}) returns ${height}` },
      hlSet: new Set([node.id]), codeLines: [9],
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
  depth(root);
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

  function snap(opts) {
    const vars = [...(opts.vars || [])];
    if (!vars.some((item) => item.name === "res")) vars.push({ name: "res", value: `[${res.join(",")}]` });
    if (!vars.some((item) => item.name === "queue")) vars.push({ name: "queue", value: formatNodes(queue) });
    steps.push(snapshot(root, Object.assign({}, opts, {
      vars,
      codeBlock: 2,
      wordSet: opts.wordSet || new Set(visible),
      queueView: makeQueueView(opts),
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

  let level = 0;
  while (queue.length) {
    snap({
      title: { vi: `Tầng ${level}: queue không rỗng`, en: `Level ${level}: queue is not empty` },
      hlSet: new Set(queue.map((node) => node.id)), codeLines: [8],
      queueOperation: "while queue", queueActive: 0,
      vars: [{ name: "level", value: level }],
      note: { vi: `Bắt đầu xử lý tầng ${level}.`, en: `Begin processing level ${level}.` },
    });

    const size = queue.length;
    snap({
      title: { vi: `size = len(queue) = ${size}`, en: `size = len(queue) = ${size}` },
      hlSet: new Set(queue.slice(0, size).map((node) => node.id)), codeLines: [9],
      queueOperation: "read level size", levelSize: size,
      vars: [{ name: "level", value: level }, { name: "size", value: size }],
      note: { vi: `Chốt ${size} node thuộc tầng hiện tại trước khi thêm node con.`, en: `Lock in the ${size} nodes belonging to this level before appending children.` },
    });

    const currentLevelList = [];
    snap({
      title: { vi: "current_level_list = []", en: "current_level_list = []" },
      codeLines: [10],
      queueOperation: "initialize level list", levelSize: size,
      vars: [{ name: "level", value: level }, { name: "size", value: size }, { name: "current_level_list", value: "[]" }],
      note: { vi: "Danh sách này ghi lại toàn bộ giá trị của tầng hiện tại.", en: "This list records every value in the current level." },
    });

    for (let i = 0; i < size; i++) {
      snap({
        title: { vi: `for i=${i} trong range(${size})`, en: `for i=${i} in range(${size})` },
        codeLines: [11],
        queueOperation: "next popleft", queueActive: 0, levelSize: size,
        vars: [{ name: "level", value: level }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: { vi: `Xử lý node thứ ${i + 1}/${size} của tầng ${level}.`, en: `Process node ${i + 1}/${size} from level ${level}.` },
      });

      const curr = queue.shift();
      snap({
        title: { vi: `curr = queue.popleft() → ${curr.val}`, en: `curr = queue.popleft() → ${curr.val}` },
        hlSet: new Set([curr.id]), codeLines: [12],
        queueOperation: `popleft ${curr.val}`, popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "queue", value: formatNodes(queue) }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: { vi: `Lấy ${curr.val} ở đầu deque; queue còn ${formatNodes(queue)}.`, en: `Pop ${curr.val} from the deque front; remaining queue is ${formatNodes(queue)}.` },
      });

      currentLevelList.push(curr.val);
      snap({
        title: { vi: `Thêm ${curr.val} vào current_level_list`, en: `Append ${curr.val} to current_level_list` },
        hlSet: new Set([curr.id]), codeLines: [13],
        queueOperation: "record current value", popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: { vi: `current_level_list = [${currentLevelList.join(",")}].`, en: `current_level_list = [${currentLevelList.join(",")}].` },
      });

      snap({
        title: { vi: curr.left ? `curr.left = ${curr.left.val}` : "curr.left = None", en: curr.left ? `curr.left = ${curr.left.val}` : "curr.left = None" },
        hlSet: new Set([curr.id]), codeLines: [14],
        queueOperation: "check left child", popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "curr.left", value: curr.left ? curr.left.val : "None" }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: curr.left
          ? { vi: "Điều kiện True nên sẽ append con trái.", en: "The condition is true, so append the left child." }
          : { vi: "Điều kiện False; queue không đổi.", en: "The condition is false; queue is unchanged." },
      });
      if (curr.left) {
        queue.push(curr.left);
        snap({
          title: { vi: `queue.append(${curr.left.val})`, en: `queue.append(${curr.left.val})` },
          hlSet: new Set([curr.left.id]), codeLines: [15],
          queueOperation: `append ${curr.left.val}`, queueActive: queue.length - 1, popped: curr.val, appended: curr.left.val, levelSize: size,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
          note: { vi: `Thêm con trái; queue = ${formatNodes(queue)}.`, en: `Append the left child; queue = ${formatNodes(queue)}.` },
        });
      }

      snap({
        title: { vi: curr.right ? `curr.right = ${curr.right.val}` : "curr.right = None", en: curr.right ? `curr.right = ${curr.right.val}` : "curr.right = None" },
        hlSet: new Set([curr.id]), codeLines: [16],
        queueOperation: "check right child", popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "curr.right", value: curr.right ? curr.right.val : "None" }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: curr.right
          ? { vi: "Điều kiện True nên sẽ append con phải.", en: "The condition is true, so append the right child." }
          : { vi: "Điều kiện False; queue không đổi.", en: "The condition is false; queue is unchanged." },
      });
      if (curr.right) {
        queue.push(curr.right);
        snap({
          title: { vi: `queue.append(${curr.right.val})`, en: `queue.append(${curr.right.val})` },
          hlSet: new Set([curr.right.id]), codeLines: [17],
          queueOperation: `append ${curr.right.val}`, queueActive: queue.length - 1, popped: curr.val, appended: curr.right.val, levelSize: size,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
          note: { vi: `Thêm con phải; queue = ${formatNodes(queue)}.`, en: `Append the right child; queue = ${formatNodes(queue)}.` },
        });
      }

      const isRightmost = i === size - 1;
      snap({
        title: { vi: `i == size - 1 → ${isRightmost}`, en: `i == size - 1 → ${isRightmost}` },
        hlSet: new Set([curr.id]), codeLines: [18],
        queueOperation: "check rightmost", popped: curr.val, levelSize: size,
        vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "is rightmost", value: isRightmost }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
        note: isRightmost
          ? { vi: `${curr.val} là node cuối của tầng nên nhìn thấy từ bên phải.`, en: `${curr.val} is the level's last node, so it is visible from the right.` }
          : { vi: `${curr.val} chưa phải node cuối của tầng.`, en: `${curr.val} is not the level's last node.` },
      });
      if (isRightmost) {
        res.push(curr.val);
        visible.add(curr.id);
        snap({
          title: { vi: `res.append(${curr.val})`, en: `res.append(${curr.val})` },
          hlSet: new Set([curr.id]), codeLines: [19],
          queueOperation: `save rightmost ${curr.val}`, popped: curr.val, levelSize: size,
          vars: [{ name: "curr", value: curr.val }, { name: "i", value: i }, { name: "size", value: size }, { name: "current_level_list", value: `[${currentLevelList.join(",")}]` }],
          note: { vi: `res = [${res.join(",")}].`, en: `res = [${res.join(",")}].` },
        });
      }
    }
    level++;
  }

  snap({
    title: { vi: "queue rỗng → thoát while", en: "queue is empty → exit while" },
    codeLines: [8],
    queueOperation: "queue empty",
    vars: [{ name: "level", value: level }, { name: "queue", value: "[]" }],
    note: { vi: "Đã xử lý hết các tầng.", en: "All levels have been processed." },
  });

  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: [${res.join(",")}]`, en: `Result: [${res.join(",")}]` },
    wordSet: new Set(visible), codeLines: [20], codeBlock: 2,
    queueView: makeQueueView({ queueOperation: "done" }),
    vars: [{ name: "res", value: `[${res.join(",")}]` }, { name: "queue", value: "[]" }, { name: "answer", value: `[${res.join(",")}]` }],
    note: { vi: `Trả về right side view = [${res.join(",")}].`, en: `Return the right side view = [${res.join(",")}].` },
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
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "LCA của các lá sâu nhất", en: "LCA of deepest leaves" },
    codeLines: [2, 3], vars: [{ name: "rule", value: "return (depth, lca)" }],
    note: { vi: `Đệ quy trả về (độ sâu, lca). Nếu trái và phải sâu BẰNG nhau → nút hiện tại là LCA của các lá sâu nhất bên dưới. Ngược lại theo nhánh sâu hơn.`, en: `Recursion returns (depth, lca). If left and right are EQUALLY deep → current node is the LCA of the deepest leaves below. Otherwise follow the deeper branch.` },
  }));
  function dfs(node) {
    if (!node) return [0, null];
    const [ld, ln] = dfs(node.left); const [rd, rn] = dfs(node.right);
    let res;
    if (ld === rd) res = [ld + 1, node];
    else res = ld > rd ? [ld + 1, ln] : [rd + 1, rn];
    steps.push(snapshot(root, { title: { vi: `Nút ${node.val}: depth=${res[0]}, lca=${res[1] ? res[1].val : "null"}`, en: `Node ${node.val}: depth=${res[0]}, lca=${res[1] ? res[1].val : "null"}` }, hlSet: new Set([node.id]), wordSet: res[1] ? new Set([res[1].id]) : undefined, codeLines: [4, 5, 6], vars: [{ name: "node", value: node.val }, { name: "leftDepth", value: ld }, { name: "rightDepth", value: rd }, { name: "lca", value: res[1] ? res[1].val : "null" }], note: { vi: ld === rd ? `Trái = phải (${ld}) → ${node.val} là LCA cục bộ.` : `Nhánh ${ld > rd ? "trái" : "phải"} sâu hơn → giữ lca = ${res[1] ? res[1].val : "null"}.`, en: ld === rd ? `Left = right (${ld}) → ${node.val} is the local LCA.` : `${ld > rd ? "Left" : "Right"} branch deeper → keep lca = ${res[1] ? res[1].val : "null"}.` } }));
    return res;
  }
  const [, lcaNode] = dfs(root);
  const fs = snapshot(root, { title: { vi: `LCA = ${lcaNode ? lcaNode.val : "null"}`, en: `LCA = ${lcaNode ? lcaNode.val : "null"}` }, wordSet: lcaNode ? new Set([lcaNode.id]) : undefined, vars: [{ name: "answer", value: lcaNode ? lcaNode.val : "null" }], note: { vi: `LCA của các lá sâu nhất = ${lcaNode ? lcaNode.val : "null"}.`, en: `LCA of the deepest leaves = ${lcaNode ? lcaNode.val : "null"}.` } }); fs.final = true; steps.push(fs);
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
  const root = parseTree(input); const tv = Number(params.target); const k = Number(params.k); const steps = [];
  const parent = buildParents(root); const target = findNode(root, tv);
  steps.push(snapshot(root, {
    title: { vi: `Các nút cách ${tv} đúng ${k} bước`, en: `Nodes at distance ${k} from ${tv}` },
    codeLines: [2, 3], vars: [{ name: "target", value: tv }, { name: "k", value: k }],
    note: { vi: `Coi cây như ĐỒ THỊ (thêm cạnh con→cha qua parent map). BFS từ target, lấy tất cả nút ở lớp thứ k.`, en: `Treat the tree as a GRAPH (add child→parent edges via a parent map). BFS from target, take all nodes at layer k.` },
  }));
  const result = [];
  if (target) {
    let queue = [target]; const visited = new Set([target.id]); let dist = 0;
    while (queue.length) {
      if (dist === k) { result.push(...queue.map((n) => n.val)); steps.push(snapshot(root, { title: { vi: `Khoảng cách ${dist}: [${queue.map((n) => n.val).join(",")}]`, en: `Distance ${dist}: [${queue.map((n) => n.val).join(",")}]` }, hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [6, 7], vars: [{ name: "dist", value: dist }, { name: "answer", value: `[${result.join(",")}]` }], note: { vi: `Đạt khoảng cách ${k} → đây là kết quả.`, en: `Reached distance ${k} → these are the answer.` } })); break; }
      steps.push(snapshot(root, { title: { vi: `Khoảng cách ${dist}: [${queue.map((n) => n.val).join(",")}]`, en: `Distance ${dist}: [${queue.map((n) => n.val).join(",")}]` }, hlSet: new Set(queue.map((n) => n.id)), wordSet: new Set(visited), codeLines: [4, 5], vars: [{ name: "dist", value: dist }, { name: "frontier", value: `[${queue.map((n) => n.val).join(",")}]` }], note: { vi: `Mở rộng sang hàng xóm (trái, phải, cha) chưa thăm.`, en: `Expand to unvisited neighbors (left, right, parent).` } }));
      const next = [];
      for (const n of queue) {
        for (const nb of [n.left, n.right, parent.get(n.id)]) {
          if (nb && !visited.has(nb.id)) { visited.add(nb.id); next.push(nb); }
        }
      }
      queue = next; dist++;
    }
  }
  const fs = snapshot(root, { title: { vi: `Kết quả: [${result.join(",")}]`, en: `Result: [${result.join(",")}]` }, vars: [{ name: "answer", value: `[${result.join(",")}]` }], note: { vi: `Các nút cách ${tv} đúng ${k} bước = [${result.join(",")}].`, en: `Nodes exactly ${k} away from ${tv} = [${result.join(",")}].` } }); fs.final = true; steps.push(fs);
  return { input, answer: `[${result.join(",")}]`, steps };
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
  const root = parseTree(input); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: "House Robber III (DP trên cây)", en: "House Robber III (tree DP)" },
    codeLines: [2, 3], vars: [{ name: "state", value: "(rob, skip) per node" }],
    note: { vi: `Mỗi nút trả về [rob, skip]. rob = node.val + skip(trái) + skip(phải). skip = max(con trái) + max(con phải). Không cướp 2 nhà nối trực tiếp.`, en: `Each node returns [rob, skip]. rob = node.val + skip(left) + skip(right). skip = max(left) + max(right). Cannot rob two directly-linked houses.` },
  }));
  function dfs(node) {
    if (!node) return [0, 0];
    const [lr, ls] = dfs(node.left); const [rr, rs] = dfs(node.right);
    const rob = node.val + ls + rs;
    const skip = Math.max(lr, ls) + Math.max(rr, rs);
    steps.push(snapshot(root, { title: { vi: `Nút ${node.val}: rob=${rob}, skip=${skip}`, en: `Node ${node.val}: rob=${rob}, skip=${skip}` }, hlSet: new Set([node.id]), codeLines: [4, 5, 6], vars: [{ name: "node", value: node.val }, { name: "rob (cướp)", value: `${node.val}+${ls}+${rs} = ${rob}` }, { name: "skip (bỏ)", value: `${Math.max(lr, ls)}+${Math.max(rr, rs)} = ${skip}` }], note: { vi: `Cướp ${node.val} → phải bỏ 2 con. Bỏ ${node.val} → lấy max mỗi con.`, en: `Rob ${node.val} → must skip both children. Skip ${node.val} → take max of each child.` } }));
    return [rob, skip];
  }
  const [r, s] = dfs(root); const answer = Math.max(r, s);
  const fs = snapshot(root, { title: { vi: `Tối đa = ${answer}`, en: `Max = ${answer}` }, vars: [{ name: "answer", value: answer }], note: { vi: `Số tiền lớn nhất cướp được = max(${r}, ${s}) = ${answer}.`, en: `Maximum money robbed = max(${r}, ${s}) = ${answer}.` } }); fs.final = true; steps.push(fs);
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

module.exports = {
  __meta: {
    order: [144, 94, 145, 104, 102, 543, 124, 226, 101, 637, 199, 236, 1644, 1650, 1676, 366, 863, 156, 337, 116, 103, 314, 297],
    label: {
      vi: "Tag Binary Tree",
      en: "Binary Tree tag",
    },
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
          { value: "1", label: { vi: "Cách 1: queue theo từng tầng", en: "Approach 1: queue by level" } },
          { value: "2", label: { vi: "Cách 2: deque + size", en: "Approach 2: deque + size" } },
        ],
      },
    ],
    approach: [
      { vi: "Cách 1: BFS theo tầng, lấy node cuối của queue hiện tại trước khi tạo queue tầng kế tiếp.", en: "Approach 1: BFS by level, taking the current queue's last node before building the next level." },
      { vi: "Cách 2: Dùng deque, chốt size của tầng rồi popleft đúng size node; node có i == size - 1 là node nhìn thấy bên phải.", en: "Approach 2: Use a deque, lock in the level size, then popleft exactly that many nodes; the node with i == size - 1 is visible from the right." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng.", en: "Queue holds at most one level." } },
    codeLabel: { vi: "Cách 1: queue theo từng tầng", en: "Approach 1: queue by level" },
    code2Label: { vi: "Cách 2: deque + size", en: "Approach 2: deque + size" },
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
      "            current_level_list = []",
      "            for i in range(size):",
      "                curr = queue.popleft()",
      "                current_level_list.append(curr.val)",
      "                if curr.left:",
      "                    queue.append(curr.left)",
      "                if curr.right:",
      "                    queue.append(curr.right)",
      "                if i == size - 1:",
      "                    res.append(curr.val)",
      "        return res",
    ],
    builder: (input, params) => {
      const approach = Number(params && params.approach) || 1;
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
    defaultInput: "3,5,1,6,2,0,8,7,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Đệ quy trả (độ sâu, lca). Nếu trái và phải sâu bằng nhau → nút hiện tại là lca. Ngược lại theo nhánh sâu hơn.", en: "Recursion returns (depth, lca). If left and right equally deep → current node is lca. Else follow the deeper side." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần duyệt postorder.", en: "One postorder pass." } },
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
    defaultInput: "3,5,1,6,2,0,8,7,4",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "target", label: { vi: "target", en: "target" }, allowNegative: true, default: 5 }, { key: "k", label: { vi: "k", en: "k" }, default: 2 }],
    approach: [
      { vi: "Xây map con→cha để biến cây thành đồ thị vô hướng. BFS từ target, lấy lớp thứ k.", en: "Build a child→parent map to turn the tree into an undirected graph. BFS from target, take layer k." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Map cha + BFS đều O(n).", en: "Parent map + BFS both O(n)." } },
    code: ["class Solution:", "    def distanceK(self, root, target, k):", "        parent = {}", "        def dfs(node, par):", "            if not node: return", "            parent[node] = par", "            dfs(node.left, node); dfs(node.right, node)", "        dfs(root, None)", "        from collections import deque", "        q = deque([(target, 0)])", "        seen = {target}", "        res = []", "        while q:", "            node, d = q.popleft()", "            if d == k:", "                res.append(node.val); continue", "            for nb in (node.left, node.right, parent[node]):", "                if nb and nb not in seen:", "                    seen.add(nb); q.append((nb, d + 1))", "        return res"],
    builder: buildSteps863,
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
};
