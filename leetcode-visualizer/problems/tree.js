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
    tree: { nodes: treeToVizNodes(root, opts.hlSet, opts.wordSet) },
    highlight: [],
    mark: [],
    codeLines: opts.codeLines || [],
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
    codeLines: [2, 3], vars: [{ name: "rule", value: "diameter = max(leftDepth + rightDepth)" }],
    note: { vi: `Đường kính = số CẠNH trên đường dài nhất giữa 2 nút bất kỳ. Tại mỗi nút: leftDepth + rightDepth. Lấy max toàn cây.`, en: `Diameter = number of EDGES on the longest path between any two nodes. At each node: leftDepth + rightDepth. Take the max over the whole tree.` },
  }));
  let best = 0, bestId = null;
  function depth(node) {
    if (!node) return 0;
    const l = depth(node.left), r = depth(node.right);
    const through = l + r;
    if (through > best) { best = through; bestId = node.id; }
    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: qua đây = ${through}`, en: `Node ${node.val}: through = ${through}` },
      hlSet: new Set([node.id]), codeLines: [4, 5, 6],
      vars: [{ name: "node", value: node.val }, { name: "leftDepth", value: l }, { name: "rightDepth", value: r }, { name: "path through", value: through }, { name: "best", value: best }],
      note: { vi: `Đường đi qua ${node.val} = ${l} + ${r} = ${through} cạnh. best = ${best}.`, en: `Path through ${node.val} = ${l} + ${r} = ${through} edges. best = ${best}.` },
    }));
    return 1 + Math.max(l, r);
  }
  depth(root);
  const fs = snapshot(root, {
    title: { vi: `Đường kính = ${best}`, en: `Diameter = ${best}` },
    wordSet: bestId !== null ? new Set([bestId]) : undefined, vars: [{ name: "answer", value: best }],
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
  const root = parseTree(input); const steps = []; const view = [];
  steps.push(snapshot(root, {
    title: { vi: "Góc nhìn bên phải", en: "Right side view" },
    codeLines: [2, 3], vars: [{ name: "view", value: "[]" }],
    note: { vi: `BFS theo tầng. Nút CUỐI CÙNG (phải nhất) của mỗi tầng chính là nút nhìn thấy từ bên phải.`, en: `BFS by level. The LAST (rightmost) node of each level is what you see from the right side.` },
  }));
  if (root) {
    let queue = [root]; const visited = new Set(); let lvl = 0;
    while (queue.length) {
      const rightmost = queue[queue.length - 1]; view.push(rightmost.val);
      queue.forEach((n) => visited.add(n.id));
      steps.push(snapshot(root, {
        title: { vi: `Tầng ${lvl}: thấy ${rightmost.val}`, en: `Level ${lvl}: see ${rightmost.val}` },
        hlSet: new Set([rightmost.id]), wordSet: new Set(visited), codeLines: [4, 5, 6],
        vars: [{ name: "level", value: lvl }, { name: "nodes", value: `[${queue.map((n) => n.val).join(",")}]` }, { name: "rightmost", value: rightmost.val }, { name: "view", value: `[${view.join(",")}]` }],
        note: { vi: `Nút phải nhất tầng ${lvl} = ${rightmost.val} → thêm vào view.`, en: `Rightmost node of level ${lvl} = ${rightmost.val} → add to view.` },
      }));
      const next = []; for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); } queue = next; lvl++;
    }
  }
  const fs = snapshot(root, {
    title: { vi: `Kết quả: [${view.join(",")}]`, en: `Result: [${view.join(",")}]` },
    vars: [{ name: "answer", value: `[${view.join(",")}]` }],
    note: { vi: `Right side view = [${view.join(",")}].`, en: `Right side view = [${view.join(",")}].` },
  }); fs.final = true; steps.push(fs);
  return { input, answer: `[${view.join(",")}]`, steps };
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

// ─── 1644: LCA of a Binary Tree II (p or q may be absent) ───
function buildSteps1644(input, params) {
  const root = parseTree(input); const pv = Number(params.p); const qv = Number(params.q); const steps = [];
  steps.push(snapshot(root, {
    title: { vi: `LCA II của ${pv} và ${qv}`, en: `LCA II of ${pv} and ${qv}` },
    codeLines: [2, 3], vars: [{ name: "p", value: pv }, { name: "q", value: qv }],
    note: { vi: `Giống bài 236 nhưng p hoặc q CÓ THỂ KHÔNG tồn tại. Phải duyệt HẾT cây để đếm, chỉ trả LCA nếu tìm thấy CẢ p và q.`, en: `Like 236 but p or q MAY be absent. Must traverse the WHOLE tree to count; only return LCA if BOTH p and q exist.` },
  }));
  let pFound = false, qFound = false, ans = null;
  function dfs(node) {
    if (!node) return null;
    const L = dfs(node.left), R = dfs(node.right);
    let mid = null;
    if (node.val === pv) { pFound = true; mid = node; }
    if (node.val === qv) { qFound = true; mid = node; }
    const cnt = [L, R, mid].filter(Boolean).length;
    if (cnt >= 2 && !ans) {
      ans = node;
      steps.push(snapshot(root, { title: { vi: `Ứng viên LCA: ${node.val}`, en: `LCA candidate: ${node.val}` }, hlSet: new Set([node.id]), codeLines: [6, 7], vars: [{ name: "node", value: node.val }], note: { vi: `Tại ${node.val} gặp đủ 2 phía → ứng viên LCA (vẫn duyệt tiếp để xác nhận tồn tại).`, en: `At ${node.val} two sides matched → LCA candidate (keep traversing to confirm existence).` } }));
    }
    return L || R || mid;
  }
  dfs(root);
  const valid = pFound && qFound;
  const fs = snapshot(root, { title: { vi: valid ? `LCA = ${ans.val}` : `null (thiếu p hoặc q)`, en: valid ? `LCA = ${ans.val}` : `null (p or q missing)` }, wordSet: valid ? new Set([ans.id]) : undefined, vars: [{ name: "pFound", value: pFound }, { name: "qFound", value: qFound }, { name: "answer", value: valid ? ans.val : "null" }], note: { vi: valid ? `Cả p và q đều tồn tại → LCA = ${ans.val}.` : `Thiếu ${!pFound ? pv : qv} → trả về null.`, en: valid ? `Both p and q exist → LCA = ${ans.val}.` : `Missing ${!pFound ? pv : qv} → return null.` } }); fs.final = true; steps.push(fs);
  return { input, answer: valid ? ans.val : "null", steps };
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
    extraParams: [],
    approach: [
      { vi: "BFS theo tầng. Lấy nút CUỐI CÙNG (phải nhất) của mỗi tầng.", en: "BFS by level. Take the LAST (rightmost) node of each level." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng.", en: "Queue holds at most one level." } },
    code: ["class Solution:", "    def rightSideView(self, root):", "        if not root: return []", "        res, queue = [], [root]", "        while queue:", "            res.append(queue[-1].val)   # rightmost", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    builder: buildSteps199,
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
    extraParams: [{ key: "p", label: { vi: "p", en: "p" }, allowNegative: true, default: 5 }, { key: "q", label: { vi: "q (thử 9 = vắng)", en: "q (try 9 = absent)" }, allowNegative: true, default: 1 }],
    approach: [
      { vi: "Phải duyệt HẾT cây để xác nhận cả p và q tồn tại. Đếm số phía khớp (con trái, con phải, chính nút).", en: "Must traverse the WHOLE tree to confirm both p and q exist. Count matched sides (left, right, self)." },
      { vi: "Nút đầu tiên có ≥2 phía khớp là ứng viên LCA; chỉ hợp lệ nếu cả p và q đều được tìm thấy.", en: "First node with ≥2 matched sides is the LCA candidate; valid only if both p and q were found." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt toàn bộ cây 1 lần.", en: "Full traversal once." } },
    code: ["class Solution:", "    def lowestCommonAncestor(self, root, p, q):", "        self.ans = None", "        self.count = 0", "        def dfs(node):", "            if not node: return False", "            l = dfs(node.left)", "            r = dfs(node.right)", "            mid = node == p or node == q", "            if mid + l + r >= 2 and not self.ans:", "                self.ans = node", "            if mid: self.count += 1", "            return l or r or mid", "        dfs(root)", "        return self.ans if self.count == 2 else None"],
    builder: buildSteps1644,
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
    extraParams: [],
    approach: [
      { vi: "BFS theo tầng. Tầng chẵn giữ nguyên, tầng lẻ đảo ngược mảng giá trị.", en: "BFS by level. Even levels keep order, odd levels reverse the values." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Queue chứa tối đa 1 tầng.", en: "Queue holds at most one level." } },
    code: ["class Solution:", "    def zigzagLevelOrder(self, root):", "        if not root: return []", "        res, queue, ltr = [], [root], True", "        while queue:", "            vals = [n.val for n in queue]", "            res.append(vals if ltr else vals[::-1])", "            ltr = not ltr", "            nxt = []", "            for n in queue:", "                if n.left: nxt.append(n.left)", "                if n.right: nxt.append(n.right)", "            queue = nxt", "        return res"],
    builder: buildSteps103,
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
