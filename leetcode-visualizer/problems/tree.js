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

module.exports = {
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
};
