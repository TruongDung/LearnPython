// LeetCode Visualizer — Binary Search Tree problems.
// Uses tree view for visualization.

// ─── Helpers: parse level-order array into tree structure ───
function parseBST(input) {
  // Input: "5,3,6,2,4,null,7" or [5,3,6,2,4,null,7]
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
    const li = 2 * i + 1;
    const ri = 2 * i + 2;
    if (li < nodes.length && nodes[li]) nodes[i].left = nodes[li];
    if (ri < nodes.length && nodes[ri]) nodes[i].right = nodes[ri];
  }
  return nodes[0];
}

// Convert tree to visualization nodes for the tree view renderer
function treeToVizNodes(root, hlSet, wordSet) {
  const vizNodes = [];
  let nextX = 0;

  function dfs(node, depth, parentId) {
    if (!node) return -1;
    const leftX = dfs(node.left, depth + 1, node.id);
    const x = nextX++;
    const rightX = dfs(node.right, depth + 1, node.id);

    vizNodes.push({
      id: node.id,
      label: String(node.val),
      x,
      y: depth,
      parentId: parentId,
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

// ─── 98: Validate Binary Search Tree ───
function buildSteps98(input) {
  const root = parseBST(input);
  const steps = [];

  if (!root) {
    steps.push(snapshot(null, {
      title: { vi: "Cây rỗng → true", en: "Empty tree → true" },
      vars: [{ name: "answer", value: true }],
      note: { vi: "Cây rỗng luôn hợp lệ.", en: "Empty tree is always valid." },
    }));
    steps[0].final = true;
    return { input, answer: true, steps };
  }

  steps.push(snapshot(root, {
    title: { vi: "Kiểm tra BST hợp lệ", en: "Validate BST" },
    hlSet: new Set([root.id]),
    codeLines: [2, 3],
    vars: [
      { name: "root", value: root.val },
      { name: "rule", value: "left < node < right (mọi subtree)" },
    ],
    note: {
      vi:
        `BST hợp lệ: MỌI nút trái < nút hiện tại < MỌI nút phải (không chỉ con trực tiếp).\n` +
        `Dùng DFS với (min, max) bound. Nút phải nằm trong (min, max).\n` +
        `Root: (-∞, +∞). Đi trái: max = node.val. Đi phải: min = node.val.`,
      en:
        `Valid BST: ALL left nodes < current < ALL right nodes (not just direct children).\n` +
        `Use DFS with (min, max) bounds. Each node must be within (min, max).\n` +
        `Root: (-∞, +∞). Go left: max = node.val. Go right: min = node.val.`,
    },
  }));

  let answer = true;
  let violationNode = null;

  function validate(node, lo, hi) {
    if (!node) return true;
    if (node.val <= lo || node.val >= hi) {
      answer = false;
      violationNode = node;
      steps.push(snapshot(root, {
        title: { vi: `✗ Nút ${node.val} vi phạm (${lo}, ${hi})`, en: `✗ Node ${node.val} violates (${lo}, ${hi})` },
        hlSet: new Set([node.id]),
        codeLines: [5, 6],
        vars: [
          { name: "node.val", value: node.val },
          { name: "valid range", value: `(${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi})` },
          { name: "result", value: false },
        ],
        note: {
          vi: `Nút ${node.val} KHÔNG nằm trong (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi}) → BST KHÔNG hợp lệ!`,
          en: `Node ${node.val} is NOT in (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi}) → BST is INVALID!`,
        },
      }));
      return false;
    }

    steps.push(snapshot(root, {
      title: { vi: `✓ Nút ${node.val} ∈ (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi})`, en: `✓ Node ${node.val} ∈ (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi})` },
      hlSet: new Set([node.id]),
      wordSet: new Set([node.id]),
      codeLines: [4, 5, 7, 8],
      vars: [
        { name: "node.val", value: node.val },
        { name: "range", value: `(${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi})` },
        { name: "valid", value: true },
      ],
      note: {
        vi: `${node.val} ∈ (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi}) ✓. Kiểm tra subtrees.`,
        en: `${node.val} ∈ (${lo === -Infinity ? "-∞" : lo}, ${hi === Infinity ? "+∞" : hi}) ✓. Check subtrees.`,
      },
    }));

    return validate(node.left, lo, node.val) && validate(node.right, node.val, hi);
  }

  validate(root, -Infinity, Infinity);

  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    hlSet: violationNode ? new Set([violationNode.id]) : new Set(),
    wordSet: answer ? new Set() : new Set(),
    codeLines: [9],
    vars: [{ name: "answer", value: answer }],
    note: {
      vi: answer ? "Tất cả nút đều thỏa mãn → BST hợp lệ." : `Nút ${violationNode.val} vi phạm → BST KHÔNG hợp lệ.`,
      en: answer ? "All nodes satisfy constraints → valid BST." : `Node ${violationNode.val} violates → INVALID BST.`,
    },
  });
  finalStep.final = true;
  steps.push(finalStep);

  return { input, answer, steps };
}

// ─── 938: Range Sum of BST ───
function buildSteps938(input, params) {
  const root = parseBST(input);
  const low = params.low || 7;
  const high = params.high || 15;
  const steps = [];

  if (!root) {
    steps.push(snapshot(null, {
      title: { vi: "Cây rỗng → 0", en: "Empty tree → 0" },
      vars: [{ name: "answer", value: 0 }],
      note: { vi: "Cây rỗng → tổng = 0.", en: "Empty tree → sum = 0." },
    }));
    steps[0].final = true;
    return { input, answer: 0, steps };
  }

  steps.push(snapshot(root, {
    title: { vi: "Range Sum BST", en: "Range Sum BST" },
    hlSet: new Set([root.id]),
    codeLines: [2, 3],
    vars: [
      { name: "low", value: low },
      { name: "high", value: high },
      { name: "sum", value: 0 },
    ],
    note: {
      vi:
        `Tính tổng tất cả nút có giá trị trong [${low}, ${high}].\n` +
        `Tận dụng BST: nếu node.val < low → bỏ qua subtree trái.\n` +
        `Nếu node.val > high → bỏ qua subtree phải. (Pruning)`,
      en:
        `Sum all nodes with values in [${low}, ${high}].\n` +
        `Exploit BST: if node.val < low → skip left subtree.\n` +
        `If node.val > high → skip right subtree. (Pruning)`,
    },
  }));

  let sum = 0;
  const includedNodes = new Set();

  function dfs(node) {
    if (!node) return;

    const inRange = node.val >= low && node.val <= high;
    if (inRange) {
      sum += node.val;
      includedNodes.add(node.id);
    }

    const action = inRange ? `✓ +${node.val} (sum=${sum})`
      : node.val < low ? `< ${low} → skip left`
      : `> ${high} → skip right`;

    steps.push(snapshot(root, {
      title: { vi: `Nút ${node.val}: ${inRange ? "trong range" : "ngoài range"}`, en: `Node ${node.val}: ${inRange ? "in range" : "out of range"}` },
      hlSet: new Set([node.id]),
      wordSet: new Set(includedNodes),
      codeLines: inRange ? [5, 6] : node.val < low ? [7, 8] : [9, 10],
      vars: [
        { name: "node.val", value: node.val },
        { name: `in [${low},${high}]?`, value: inRange },
        { name: "action", value: action },
        { name: "sum", value: sum },
      ],
      note: {
        vi: inRange
          ? `${node.val} ∈ [${low}, ${high}] → sum += ${node.val} = ${sum}. Duyệt cả 2 subtree.`
          : node.val < low
            ? `${node.val} < ${low} → bỏ subtree trái (mọi nút trái < ${node.val} < ${low}). Chỉ duyệt phải.`
            : `${node.val} > ${high} → bỏ subtree phải (mọi nút phải > ${node.val} > ${high}). Chỉ duyệt trái.`,
        en: inRange
          ? `${node.val} ∈ [${low}, ${high}] → sum += ${node.val} = ${sum}. Visit both subtrees.`
          : node.val < low
            ? `${node.val} < ${low} → skip left subtree (all left < ${node.val} < ${low}). Only visit right.`
            : `${node.val} > ${high} → skip right subtree (all right > ${node.val} > ${high}). Only visit left.`,
      },
    }));

    if (node.val >= low) dfs(node.left);
    if (node.val <= high) dfs(node.right);
  }

  dfs(root);

  const finalStep = snapshot(root, {
    title: { vi: `Kết quả: ${sum}`, en: `Result: ${sum}` },
    wordSet: new Set(includedNodes),
    codeLines: [11],
    vars: [
      { name: "answer", value: sum },
      { name: "nodes included", value: includedNodes.size },
    ],
    note: {
      vi: `Tổng các nút trong [${low}, ${high}] = ${sum} (${includedNodes.size} nút).`,
      en: `Sum of nodes in [${low}, ${high}] = ${sum} (${includedNodes.size} nodes).`,
    },
  });
  finalStep.final = true;
  steps.push(finalStep);

  return { input, answer: sum, steps };
}

// ─── 285: Inorder Successor in BST ───
function buildSteps285(input, params) {
  const root = parseBST(input);
  const p = params.p || 1;
  const steps = [];
  if (!root) { steps.push(snapshot(null, { title: { vi: "Cây rỗng", en: "Empty tree" }, vars: [{ name: "answer", value: "null" }], note: { vi: "null", en: "null" } })); steps[0].final = true; return { input, answer: "null", steps }; }

  steps.push(snapshot(root, { title: { vi: `Tìm successor của ${p}`, en: `Find successor of ${p}` }, hlSet: new Set(), codeLines: [2, 3], vars: [{ name: "p", value: p }, { name: "rule", value: "smallest node > p (inorder next)" }], note: { vi: `Inorder successor = nút nhỏ nhất LỚN HƠN p.\nCách: đi từ root, khi node.val > p → candidate + đi trái. Khi ≤ p → đi phải.`, en: `Inorder successor = smallest node GREATER than p.\nApproach: from root, when node.val > p → candidate + go left. When ≤ p → go right.` } }));

  let successor = null;
  let node = root;
  while (node) {
    if (node.val > p) {
      successor = node;
      steps.push(snapshot(root, { title: { vi: `${node.val} > ${p} → candidate`, en: `${node.val} > ${p} → candidate` }, hlSet: new Set([node.id]), wordSet: new Set([node.id]), codeLines: [5, 6, 7], vars: [{ name: "node", value: node.val }, { name: "successor", value: node.val }, { name: "go", value: "left" }], note: { vi: `${node.val} > ${p} → cập nhật successor = ${node.val}. Đi trái tìm nhỏ hơn.`, en: `${node.val} > ${p} → update successor = ${node.val}. Go left for smaller.` } }));
      node = node.left;
    } else {
      steps.push(snapshot(root, { title: { vi: `${node.val} ≤ ${p} → đi phải`, en: `${node.val} ≤ ${p} → go right` }, hlSet: new Set([node.id]), codeLines: [8, 9], vars: [{ name: "node", value: node.val }, { name: "go", value: "right" }], note: { vi: `${node.val} ≤ ${p} → cần nút lớn hơn → đi phải.`, en: `${node.val} ≤ ${p} → need larger → go right.` } }));
      node = node.right;
    }
  }

  const ans = successor ? successor.val : "null";
  const fs = snapshot(root, { title: { vi: `Kết quả: ${ans}`, en: `Result: ${ans}` }, hlSet: successor ? new Set([successor.id]) : new Set(), wordSet: successor ? new Set([successor.id]) : new Set(), codeLines: [10], vars: [{ name: "answer", value: ans }], note: { vi: `Inorder successor của ${p} = ${ans}.`, en: `Inorder successor of ${p} = ${ans}.` } });
  fs.final = true; steps.push(fs);
  return { input, answer: ans, steps };
}

// ─── 235: Lowest Common Ancestor of BST ───
function buildSteps235(input, params) {
  const root = parseBST(input);
  const p = params.p || 2;
  const q = params.q || 8;
  const steps = [];
  if (!root) { steps.push(snapshot(null, { title: { vi: "Cây rỗng", en: "Empty" }, vars: [], note: { vi: "null", en: "null" } })); steps[0].final = true; return { input, answer: "null", steps }; }

  steps.push(snapshot(root, { title: { vi: `LCA của ${p} và ${q}`, en: `LCA of ${p} and ${q}` }, hlSet: new Set([root.id]), codeLines: [2, 3], vars: [{ name: "p", value: p }, { name: "q", value: q }], note: { vi: `Tìm tổ tiên chung thấp nhất (LCA) của ${p} và ${q} trong BST.\nNếu cả 2 < node → đi trái. Cả 2 > node → đi phải. Ngược lại → node chính là LCA.`, en: `Find lowest common ancestor (LCA) of ${p} and ${q} in BST.\nIf both < node → go left. Both > node → go right. Otherwise → node IS the LCA.` } }));

  let node = root;
  let answer = root.val;
  while (node) {
    if (p < node.val && q < node.val) {
      steps.push(snapshot(root, { title: { vi: `${p},${q} < ${node.val} → trái`, en: `${p},${q} < ${node.val} → left` }, hlSet: new Set([node.id]), codeLines: [5, 6], vars: [{ name: "node", value: node.val }, { name: "both < node", value: true }], note: { vi: `Cả ${p} và ${q} < ${node.val} → LCA phải ở subtree trái.`, en: `Both ${p} and ${q} < ${node.val} → LCA must be in left subtree.` } }));
      node = node.left;
    } else if (p > node.val && q > node.val) {
      steps.push(snapshot(root, { title: { vi: `${p},${q} > ${node.val} → phải`, en: `${p},${q} > ${node.val} → right` }, hlSet: new Set([node.id]), codeLines: [7, 8], vars: [{ name: "node", value: node.val }, { name: "both > node", value: true }], note: { vi: `Cả ${p} và ${q} > ${node.val} → LCA phải ở subtree phải.`, en: `Both ${p} and ${q} > ${node.val} → LCA must be in right subtree.` } }));
      node = node.right;
    } else {
      answer = node.val;
      const fs = snapshot(root, { title: { vi: `✓ LCA = ${node.val}`, en: `✓ LCA = ${node.val}` }, hlSet: new Set([node.id]), wordSet: new Set([node.id]), codeLines: [9, 10], vars: [{ name: "node", value: node.val }, { name: "split point", value: `${p} ≤ ${node.val} ≤ ${q} or vice versa` }, { name: "answer", value: node.val }], note: { vi: `${p} và ${q} ở hai bên (hoặc một trong hai = node) → ${node.val} là LCA!`, en: `${p} and ${q} are on different sides (or one equals node) → ${node.val} is the LCA!` } });
      fs.final = true; steps.push(fs);
      break;
    }
  }
  return { input, answer, steps };
}

// ─── 1382: Balance a Binary Search Tree ───
function buildSteps1382(input) {
  const root = parseBST(input);
  const steps = [];

  // Step 1: Inorder traversal to get sorted values
  const sorted = [];
  function inorder(node) { if (!node) return; inorder(node.left); sorted.push(node.val); inorder(node.right); }
  inorder(root);

  steps.push(snapshot(root, { title: { vi: "Bước 1: Inorder → sorted array", en: "Step 1: Inorder → sorted array" }, codeLines: [3, 4, 5], vars: [{ name: "sorted", value: `[${sorted.join(", ")}]` }, { name: "n", value: sorted.length }], note: { vi: `Inorder traversal BST → mảng đã sắp xếp: [${sorted.join(", ")}].\nBước 2: xây BST cân bằng từ mảng sorted (chia đôi).`, en: `Inorder traversal of BST → sorted array: [${sorted.join(", ")}].\nStep 2: build balanced BST from sorted array (divide and conquer).` } }));

  // Step 2: Build balanced BST
  let idCounter = 0;
  function buildBalanced(arr, lo, hi) {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    const node = { id: idCounter++, val: arr[mid], left: null, right: null };
    node.left = buildBalanced(arr, lo, mid - 1);
    node.right = buildBalanced(arr, mid + 1, hi);
    return node;
  }
  const balanced = buildBalanced(sorted, 0, sorted.length - 1);

  steps.push(snapshot(balanced, { title: { vi: "Bước 2: BST cân bằng", en: "Step 2: Balanced BST" }, wordSet: new Set(Array.from({ length: sorted.length }, (_, i) => i)), codeLines: [7, 8, 9, 10, 11], vars: [{ name: "root", value: balanced ? balanced.val : "null" }, { name: "height", value: Math.ceil(Math.log2(sorted.length + 1)) }], note: { vi: `Chọn mid = arr[n/2] làm root, đệ quy 2 nửa → cây cân bằng chiều cao ≈ log₂(${sorted.length}).`, en: `Pick mid = arr[n/2] as root, recurse on halves → balanced tree height ≈ log₂(${sorted.length}).` } }));
  steps[steps.length - 1].final = true;

  return { input, answer: balanced ? balanced.val : "null", steps };
}

// ─── 426: Convert BST to Sorted Doubly Linked List ───
function buildSteps426(input) {
  const root = parseBST(input);
  const steps = [];
  const sorted = [];
  function inorder(node) { if (!node) return; inorder(node.left); sorted.push(node.val); inorder(node.right); }
  inorder(root);

  steps.push(snapshot(root, { title: { vi: "BST → Doubly Linked List", en: "BST → Doubly Linked List" }, codeLines: [2, 3], vars: [{ name: "approach", value: "inorder traversal" }], note: { vi: `Inorder traversal BST cho ta các nút theo thứ tự tăng dần.\nNối chúng lại thành circular doubly linked list:\n  prev.right = curr, curr.left = prev.\nCuối cùng nối head ↔ tail.`, en: `Inorder traversal gives nodes in ascending order.\nLink them into circular doubly linked list:\n  prev.right = curr, curr.left = prev.\nFinally connect head ↔ tail.` } }));

  // Show inorder
  const allIds = [];
  function collectIds(node) { if (!node) return; collectIds(node.left); allIds.push(node.id); collectIds(node.right); }
  collectIds(root);

  steps.push(snapshot(root, { title: { vi: `Inorder: [${sorted.join(", ")}]`, en: `Inorder: [${sorted.join(", ")}]` }, wordSet: new Set(allIds), codeLines: [5, 6, 7, 8, 9], vars: [{ name: "inorder", value: `[${sorted.join(", ")}]` }, { name: "link", value: `${sorted[0]} ↔ ${sorted[1]} ↔ ... ↔ ${sorted[sorted.length - 1]} ↔ (circular)` }], note: { vi: `Kết quả: circular DLL: ${sorted.join(" ↔ ")} ↔ (quay lại ${sorted[0]}).\nMỗi node.left = prev, node.right = next.`, en: `Result: circular DLL: ${sorted.join(" ↔ ")} ↔ (back to ${sorted[0]}).\nEach node.left = prev, node.right = next.` } }));
  steps[steps.length - 1].final = true;

  return { input, answer: `DLL: ${sorted.join(" ↔ ")}`, steps };
}

// ─── 700: Search in BST ───
function buildSteps700(input, params) {
  const root = parseBST(input);
  const val = params.val || 2;
  const steps = [];
  if (!root) { steps.push(snapshot(null, { title: { vi: "Cây rỗng → null", en: "Empty → null" }, vars: [{ name: "answer", value: "null" }], note: { vi: "null", en: "null" } })); steps[0].final = true; return { input, answer: "null", steps }; }

  steps.push(snapshot(root, { title: { vi: `Tìm ${val} trong BST`, en: `Search ${val} in BST` }, hlSet: new Set([root.id]), codeLines: [2, 3], vars: [{ name: "target", value: val }], note: { vi: `Tìm nút có giá trị ${val}. BST: nếu val < node → đi trái, val > node → đi phải, bằng → tìm thấy.`, en: `Find node with value ${val}. BST: if val < node → go left, val > node → go right, equal → found.` } }));

  let node = root;
  let found = false;
  while (node) {
    if (val === node.val) {
      found = true;
      const fs = snapshot(root, { title: { vi: `✓ Tìm thấy ${val}`, en: `✓ Found ${val}` }, hlSet: new Set([node.id]), wordSet: new Set([node.id]), codeLines: [4, 5], vars: [{ name: "node.val", value: node.val }, { name: "found", value: true }], note: { vi: `${val} == ${node.val} → tìm thấy! Trả subtree gốc tại nút này.`, en: `${val} == ${node.val} → found! Return subtree rooted at this node.` } });
      fs.final = true; steps.push(fs); break;
    } else if (val < node.val) {
      steps.push(snapshot(root, { title: { vi: `${val} < ${node.val} → trái`, en: `${val} < ${node.val} → left` }, hlSet: new Set([node.id]), codeLines: [6, 7], vars: [{ name: "node.val", value: node.val }, { name: "go", value: "left" }], note: { vi: `${val} < ${node.val} → đi trái.`, en: `${val} < ${node.val} → go left.` } }));
      node = node.left;
    } else {
      steps.push(snapshot(root, { title: { vi: `${val} > ${node.val} → phải`, en: `${val} > ${node.val} → right` }, hlSet: new Set([node.id]), codeLines: [8, 9], vars: [{ name: "node.val", value: node.val }, { name: "go", value: "right" }], note: { vi: `${val} > ${node.val} → đi phải.`, en: `${val} > ${node.val} → go right.` } }));
      node = node.right;
    }
  }
  if (!found) {
    const fs = snapshot(root, { title: { vi: `✗ Không tìm thấy ${val}`, en: `✗ ${val} not found` }, codeLines: [10], vars: [{ name: "answer", value: "null" }], note: { vi: `Đã đi tới null → ${val} không tồn tại trong BST.`, en: `Reached null → ${val} does not exist in BST.` } });
    fs.final = true; steps.push(fs);
  }
  return { input, answer: found ? val : "null", steps };
}

// ─── 230: Kth Smallest in BST ───
function buildSteps230(input, params) {
  const root = parseBST(input); const k = params.k || 1; const steps = []; const sorted = [];
  function io(n) { if (!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  steps.push(snapshot(root, { title: { vi: `Tìm phần tử nhỏ thứ ${k}`, en: `Find ${k}th smallest` }, vars: [{ name: "k", value: k }, { name: "inorder", value: `[${sorted.map(n=>n.val).join(",")}]` }], note: { vi: `Inorder BST → sorted. Trả phần tử thứ ${k}.`, en: `Inorder BST → sorted. Return ${k}th element.` } }));
  const answer = k <= sorted.length ? sorted[k-1].val : "null";
  if (sorted[k-1]) { const fs = snapshot(root, { title: { vi: `Answer: ${answer}`, en: `Answer: ${answer}` }, hlSet: new Set([sorted[k-1].id]), wordSet: new Set([sorted[k-1].id]), vars: [{ name: "answer", value: answer }], note: { vi: `Phần tử nhỏ thứ ${k} = ${answer}.`, en: `${k}th smallest = ${answer}.` } }); fs.final = true; steps.push(fs); }
  return { input, answer, steps };
}

// ─── 108: Convert Sorted Array to BST ───
function buildSteps108(input) {
  const nums = String(input).split(",").map(Number); const steps = []; let idc = 0;
  function build(lo, hi) { if (lo > hi) return null; const mid = Math.floor((lo+hi)/2); const n = { id: idc++, val: nums[mid], left: null, right: null }; n.left = build(lo, mid-1); n.right = build(mid+1, hi); return n; }
  const bal = build(0, nums.length-1);
  steps.push(snapshot(bal, { title: { vi: `Sorted → BST cân bằng`, en: `Sorted → Balanced BST` }, wordSet: new Set(Array.from({length:nums.length},(_,i)=>i)), vars: [{ name: "nums", value: `[${nums.join(",")}]` }, { name: "root", value: bal?bal.val:"null" }], note: { vi: `Chọn mid làm root, đệ quy 2 nửa → cây cân bằng.`, en: `Pick mid as root, recurse halves → balanced tree.` } }));
  steps[steps.length-1].final = true;
  return { input, answer: bal?bal.val:"null", steps };
}

// ─── 450: Delete Node in BST ───
function buildSteps450(input, params) {
  const root = parseBST(input); const key = params.key || 3; const steps = [];
  steps.push(snapshot(root, { title: { vi: `Xóa nút ${key}`, en: `Delete ${key}` }, vars: [{ name: "key", value: key }], note: { vi: `Tìm ${key} rồi xóa. 3 case: lá/1 con/2 con (successor).`, en: `Find ${key} then delete. 3 cases: leaf/1 child/2 children (successor).` } }));
  let node = root;
  while (node && node.val !== key) { node = key < node.val ? node.left : node.right; }
  if (node) { steps.push(snapshot(root, { title: { vi: `Tìm thấy ${key}`, en: `Found ${key}` }, hlSet: new Set([node.id]), vars: [{ name: "node", value: key }, { name: "left", value: !!node.left }, { name: "right", value: !!node.right }], note: { vi: `Nút ${key} tìm thấy. Xóa theo case phù hợp.`, en: `Node ${key} found. Delete by appropriate case.` } })); }
  const fs = snapshot(root, { title: { vi: `Đã xóa ${key}`, en: `Deleted ${key}` }, vars: [{ name: "answer", value: "done" }], note: { vi: `BST sau xóa vẫn hợp lệ.`, en: `BST remains valid after deletion.` } }); fs.final = true; steps.push(fs);
  return { input, answer: `deleted ${key}`, steps };
}

// ─── 653: Two Sum IV (BST) ───
function buildSteps653(input, params) {
  const root = parseBST(input); const target = params.k || 9; const steps = []; const sorted = [];
  function io(n) { if (!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  const vals = sorted.map(n=>n.val);
  steps.push(snapshot(root, { title: { vi: `Two Sum = ${target}`, en: `Two Sum = ${target}` }, vars: [{ name: "target", value: target }, { name: "inorder", value: `[${vals.join(",")}]` }], note: { vi: `Inorder → sorted. 2 pointers tìm pair.`, en: `Inorder → sorted. 2 pointers find pair.` } }));
  let l = 0, r = vals.length-1, answer = false;
  while (l < r) {
    const s = vals[l]+vals[r];
    if (s === target) { answer = true; const fs = snapshot(root, { title: { vi: `✓ ${vals[l]}+${vals[r]}=${target}`, en: `✓ ${vals[l]}+${vals[r]}=${target}` }, hlSet: new Set([sorted[l].id,sorted[r].id]), wordSet: new Set([sorted[l].id,sorted[r].id]), vars: [{ name: "pair", value: `(${vals[l]},${vals[r]})` }], note: { vi: `Found!`, en: `Found!` } }); fs.final = true; steps.push(fs); break; }
    else if (s < target) l++; else r--;
  }
  if (!answer) { const fs = snapshot(root, { title: { vi: "✗ Not found", en: "✗ Not found" }, vars: [{ name: "answer", value: false }], note: { vi: "Không tìm thấy.", en: "Not found." } }); fs.final = true; steps.push(fs); }
  return { input, answer, steps };
}

// ─── 530: Min Abs Diff in BST ───
function buildSteps530(input) {
  const root = parseBST(input); const steps = []; const sorted = [];
  function io(n) { if (!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  const vals = sorted.map(n=>n.val);
  let minD = Infinity, bp = [0,1];
  for (let i=1;i<vals.length;i++) { const d=vals[i]-vals[i-1]; if(d<minD){minD=d;bp=[i-1,i];} }
  steps.push(snapshot(root, { title: { vi: `Min Abs Diff`, en: `Min Abs Diff` }, vars: [{ name: "inorder", value: `[${vals.join(",")}]` }], note: { vi: `Inorder → sorted. Min diff giữa liền kề.`, en: `Inorder → sorted. Min diff between adjacent.` } }));
  const fs = snapshot(root, { title: { vi: `Kết quả: ${minD}`, en: `Result: ${minD}` }, wordSet: new Set([sorted[bp[0]].id,sorted[bp[1]].id]), vars: [{ name: "answer", value: minD }, { name: "pair", value: `(${vals[bp[0]]},${vals[bp[1]]})` }], note: { vi: `Min = |${vals[bp[1]]}-${vals[bp[0]]}| = ${minD}.`, en: `Min = |${vals[bp[1]]}-${vals[bp[0]]}| = ${minD}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: minD, steps };
}

// ─── 99: Recover Binary Search Tree ───
function buildSteps99(input) {
  const root = parseBST(input); const steps = [];
  const sorted = []; function io(n){ if(!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  const vals = sorted.map(n=>n.val);
  let first = null, second = null;
  for (let i=0;i<sorted.length-1;i++){
    if (sorted[i].val > sorted[i+1].val){
      if (!first){ first = sorted[i]; second = sorted[i+1]; }
      else { second = sorted[i+1]; }
    }
  }
  steps.push(snapshot(root, { title: { vi: "Recover BST", en: "Recover BST" }, vars: [{ name: "inorder", value: `[${vals.join(",")}]` }], note: { vi: `Inorder của BST hợp lệ phải TĂNG DẦN. Đúng 2 nút bị hoán đổi → tìm chúng rồi swap lại.`, en: `Inorder of a valid BST must be ASCENDING. Exactly 2 nodes were swapped → find them then swap back.` } }));
  if (first && second){
    steps.push(snapshot(root, { title: { vi: `Tìm thấy 2 nút sai: ${first.val}, ${second.val}`, en: `Found 2 wrong nodes: ${first.val}, ${second.val}` }, hlSet: new Set([first.id, second.id]), vars: [{ name: "first", value: first.val }, { name: "second", value: second.val }], note: { vi: `Inorder bị vi phạm. Hoán đổi giá trị của 2 nút này.`, en: `Inorder violated. Swap the values of these two nodes.` } }));
    const a = first.val, b = second.val; first.val = b; second.val = a;
    const fs = snapshot(root, { title: { vi: `Đã swap → BST hợp lệ`, en: `Swapped → valid BST` }, wordSet: new Set([first.id, second.id]), vars: [{ name: "answer", value: "recovered" }], note: { vi: `Sau khi swap, inorder lại tăng dần → BST đã được khôi phục.`, en: `After swap, inorder is ascending again → BST recovered.` } }); fs.final = true; steps.push(fs);
  } else {
    const fs = snapshot(root, { title: { vi: "Đã là BST hợp lệ", en: "Already valid" }, vars: [{ name: "answer", value: "no swap" }], note: { vi: "Không có vi phạm.", en: "No violation found." } }); fs.final = true; steps.push(fs);
  }
  return { input, answer: "recovered", steps };
}

// ─── 109: Convert Sorted List to BST ───
function buildSteps109(input) {
  const nums = String(input).split(",").map(Number); const steps = []; let idc = 0;
  function build(lo, hi) { if (lo > hi) return null; const mid = Math.floor((lo+hi)/2); const n = { id: idc++, val: nums[mid], left: null, right: null }; n.left = build(lo, mid-1); n.right = build(mid+1, hi); return n; }
  const bal = build(0, nums.length-1);
  steps.push(snapshot(bal, { title: { vi: `Sorted List → BST cân bằng`, en: `Sorted List → Balanced BST` }, wordSet: new Set(Array.from({length:nums.length},(_,i)=>i)), vars: [{ name: "list", value: `[${nums.join("→")}]` }, { name: "root", value: bal?bal.val:"null" }], note: { vi: `Danh sách liên kết đã sắp xếp tăng dần. Phần tử giữa = root, đệ quy 2 nửa → BST cân bằng (giống bài 108 nhưng input là linked list).`, en: `Linked list is sorted ascending. Middle element = root, recurse on halves → balanced BST (like 108 but the input is a linked list).` } }));
  steps[steps.length-1].final = true;
  return { input, answer: bal?bal.val:"null", steps };
}

// ─── 270: Closest BST Value ───
function buildSteps270(input, params) {
  const root = parseBST(input); const target = params.target !== undefined ? Number(params.target) : 3.714286; const steps = [];
  steps.push(snapshot(root, { title: { vi: `Tìm giá trị gần ${target} nhất`, en: `Find value closest to ${target}` }, vars: [{ name: "target", value: target }], note: { vi: `Đi từ root: cập nhật closest nếu gần hơn, rồi đi TRÁI nếu target < node, PHẢI nếu target > node.`, en: `From root: update closest if nearer, then go LEFT if target < node, RIGHT if target > node.` } }));
  let node = root, closest = root ? root.val : null;
  while (node){
    if (Math.abs(node.val - target) < Math.abs(closest - target)) closest = node.val;
    steps.push(snapshot(root, { title: { vi: `Tại ${node.val}, closest = ${closest}`, en: `At ${node.val}, closest = ${closest}` }, hlSet: new Set([node.id]), vars: [{ name: "node", value: node.val }, { name: "|node-target|", value: Math.abs(node.val-target).toFixed(3) }, { name: "closest", value: closest }], note: { vi: `So sánh khoảng cách. ${target < node.val ? "target < node → đi trái" : "target ≥ node → đi phải"}.`, en: `Compare distance. ${target < node.val ? "target < node → go left" : "target ≥ node → go right"}.` } }));
    node = target < node.val ? node.left : node.right;
  }
  let closeId = null; (function find(n){ if(!n) return; if(n.val === closest) closeId = n.id; find(n.left); find(n.right); })(root);
  const fs = snapshot(root, { title: { vi: `Answer: ${closest}`, en: `Answer: ${closest}` }, wordSet: closeId !== null ? new Set([closeId]) : undefined, vars: [{ name: "answer", value: closest }], note: { vi: `Giá trị gần ${target} nhất là ${closest}.`, en: `Closest value to ${target} is ${closest}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: closest, steps };
}

// ─── 783: Min Distance Between BST Nodes ───
function buildSteps783(input) {
  const root = parseBST(input); const steps = []; const sorted = [];
  function io(n) { if (!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  const vals = sorted.map(n=>n.val);
  let minD = Infinity, bp = [0,1];
  for (let i=1;i<vals.length;i++) { const d=vals[i]-vals[i-1]; if(d<minD){minD=d;bp=[i-1,i];} }
  steps.push(snapshot(root, { title: { vi: `Min Distance giữa 2 nút`, en: `Min Distance between nodes` }, vars: [{ name: "inorder", value: `[${vals.join(",")}]` }], note: { vi: `Inorder → sorted. Khoảng cách nhỏ nhất luôn nằm giữa 2 phần tử LIỀN KỀ trong sorted order (giống bài 530).`, en: `Inorder → sorted. Min distance is always between ADJACENT elements in sorted order (same as 530).` } }));
  const fs = snapshot(root, { title: { vi: `Kết quả: ${minD}`, en: `Result: ${minD}` }, wordSet: new Set([sorted[bp[0]].id,sorted[bp[1]].id]), vars: [{ name: "answer", value: minD }, { name: "pair", value: `(${vals[bp[0]]},${vals[bp[1]]})` }], note: { vi: `Min = |${vals[bp[1]]}-${vals[bp[0]]}| = ${minD}.`, en: `Min = |${vals[bp[1]]}-${vals[bp[0]]}| = ${minD}.` } }); fs.final = true; steps.push(fs);
  return { input, answer: minD, steps };
}

// ─── 501: Find Mode in BST ───
function buildSteps501(input) {
  const root = parseBST(input); const steps = []; const sorted = [];
  function io(n) { if (!n) return; io(n.left); sorted.push(n); io(n.right); } io(root);
  const vals = sorted.map(n=>n.val);
  const freq = new Map(); for (const v of vals) freq.set(v, (freq.get(v)||0)+1);
  let maxF = 0; for (const f of freq.values()) maxF = Math.max(maxF, f);
  const modes = [...freq.entries()].filter(([,f]) => f === maxF).map(([v]) => v);
  steps.push(snapshot(root, { title: { vi: "Tìm Mode (giá trị xuất hiện nhiều nhất)", en: "Find Mode (most frequent value)" }, vars: [{ name: "inorder", value: `[${vals.join(",")}]` }], note: { vi: `Inorder BST → các giá trị bằng nhau nằm LIỀN KỀ. Đếm tần suất, lấy (các) giá trị có tần suất cao nhất.`, en: `Inorder of BST → equal values are ADJACENT. Count frequencies, take the value(s) with the highest frequency.` } }));
  const freqStr = [...freq.entries()].map(([v,f]) => `${v}:${f}`).join(", ");
  const modeIds = new Set(); sorted.forEach(n => { if (modes.includes(n.val)) modeIds.add(n.id); });
  const fs = snapshot(root, { title: { vi: `Mode: [${modes.join(",")}]`, en: `Mode: [${modes.join(",")}]` }, wordSet: modeIds, vars: [{ name: "freq", value: freqStr }, { name: "maxFreq", value: maxF }, { name: "answer", value: `[${modes.join(",")}]` }], note: { vi: `Tần suất cao nhất = ${maxF}. Mode = [${modes.join(",")}].`, en: `Highest frequency = ${maxF}. Mode = [${modes.join(",")}].` } }); fs.final = true; steps.push(fs);
  return { input, answer: `[${modes.join(",")}]`, steps };
}

module.exports = {
  98: {
    id: 98,
    difficulty: "medium",
    slug: "validate-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Validate Binary Search Tree", en: "Validate Binary Search Tree" },
    titleVi: { vi: "Kiểm tra BST hợp lệ", en: "Check if tree is a valid BST" },
    statement: {
      vi: "Cho root của cây nhị phân, kiểm tra xem nó có phải BST hợp lệ không. BST hợp lệ: nút trái < nút hiện tại < nút phải (cho MỌI subtree). Nhập dạng level-order: 5,1,4,null,null,3,6",
      en: "Given the root of a binary tree, check if it is a valid BST. Valid BST: left < current < right (for ALL subtrees). Enter as level-order: 5,1,4,null,null,3,6",
    },
    defaultInput: "5,1,4,null,null,3,6",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order, null cho nút rỗng)", en: "Tree (level-order, null for empty)" },
    extraParams: [],
    approach: [
      { vi: "DFS với 2 bound (min, max). Root: (-∞, +∞). Đi trái: max = node.val. Đi phải: min = node.val.", en: "DFS with 2 bounds (min, max). Root: (-∞, +∞). Go left: max = node.val. Go right: min = node.val." },
      { vi: "Nếu node.val ≤ min hoặc node.val ≥ max → false.", en: "If node.val ≤ min or node.val ≥ max → false." },
      { vi: "Nếu cả 2 subtree đều valid → true.", en: "If both subtrees are valid → true." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt mỗi nút 1 lần. Stack đệ quy O(h) với h = chiều cao.", en: "Visit each node once. Recursion stack O(h) where h = height." } },
    code: [
      "class Solution:",
      "    def isValidBST(self, root) -> bool:",
      "        def validate(node, lo, hi):",
      "            if not node:",
      "                return True",
      "            if node.val <= lo or node.val >= hi:",
      "                return False",
      "            return (validate(node.left, lo, node.val) and",
      "                    validate(node.right, node.val, hi))",
      "        return validate(root, float('-inf'), float('inf'))",
    ],
    builder: buildSteps98,
  },
  938: {
    id: 938,
    difficulty: "easy",
    slug: "range-sum-of-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Range Sum of BST", en: "Range Sum of BST" },
    titleVi: { vi: "Tổng nút trong khoảng", en: "Sum nodes in range" },
    statement: {
      vi: "Cho root BST và 2 số low, high. Trả về tổng giá trị tất cả nút có giá trị nằm trong [low, high]. Nhập dạng level-order.",
      en: "Given a BST root and two integers low, high. Return the sum of values of all nodes with values in [low, high]. Enter as level-order.",
    },
    defaultInput: "10,5,15,3,7,null,18",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      { key: "low", label: { vi: "low", en: "low" }, default: 7 },
      { key: "high", label: { vi: "high", en: "high" }, default: 15 },
    ],
    approach: [
      { vi: "DFS/BFS duyệt BST. Nếu node.val ∈ [low, high] → cộng vào sum.", en: "DFS/BFS traversal. If node.val ∈ [low, high] → add to sum." },
      { vi: "Pruning BST: nếu node.val < low → không duyệt subtree trái (toàn < node.val < low).", en: "BST pruning: if node.val < low → skip left subtree (all < node.val < low)." },
      { vi: "Nếu node.val > high → không duyệt subtree phải.", en: "If node.val > high → skip right subtree." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Duyệt tối đa n nút. Stack O(h).", en: "Visit at most n nodes. Stack O(h)." } },
    code: [
      "class Solution:",
      "    def rangeSumBST(self, root, low, high) -> int:",
      "        if not root:",
      "            return 0",
      "        total = 0",
      "        if low <= root.val <= high:",
      "            total += root.val",
      "        if root.val > low:",
      "            total += self.rangeSumBST(root.left, low, high)",
      "        if root.val < high:",
      "            total += self.rangeSumBST(root.right, low, high)",
      "        return total",
    ],
    builder: buildSteps938,
  },
  285: {
    id: 285,
    difficulty: "medium",
    slug: "inorder-successor-in-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Inorder Successor in BST", en: "Inorder Successor in BST" },
    titleVi: { vi: "Nút kế tiếp Inorder trong BST", en: "Next node in inorder traversal" },
    statement: { vi: "Cho BST và giá trị p, tìm nút có giá trị nhỏ nhất LỚN HƠN p (inorder successor). Nhập level-order.", en: "Given a BST and value p, find the node with smallest value GREATER than p (inorder successor). Enter as level-order." },
    defaultInput: "5,3,6,2,4,null,null,1",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "p", label: { vi: "p (giá trị cần tìm successor)", en: "p (find successor of)" }, default: 3 }],
    approach: [
      { vi: "Từ root: nếu node.val > p → candidate, đi trái (tìm nhỏ hơn). Nếu ≤ p → đi phải.", en: "From root: if node.val > p → candidate, go left. If ≤ p → go right." },
      { vi: "Khi tới null → candidate cuối cùng chính là successor.", en: "When reaching null → last candidate is the successor." },
    ],
    complexity: { time: "O(h)", space: "O(1)", note: { vi: "Đi theo 1 nhánh BST → O(h).", en: "Follow one BST path → O(h)." } },
    code: ["class Solution:", "    def inorderSuccessor(self, root, p):", "        successor = None", "        node = root", "        while node:", "            if node.val > p.val:", "                successor = node", "                node = node.left", "            else:", "                node = node.right", "        return successor"],
    builder: buildSteps285,
  },
  235: {
    id: 235,
    difficulty: "medium",
    slug: "lowest-common-ancestor-of-a-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Lowest Common Ancestor of a BST", en: "Lowest Common Ancestor of a BST" },
    titleVi: { vi: "Tổ tiên chung thấp nhất BST", en: "LCA in BST" },
    statement: { vi: "Cho BST và 2 giá trị p, q (đảm bảo tồn tại). Tìm nút tổ tiên chung thấp nhất (LCA). Nhập level-order.", en: "Given a BST and values p, q (guaranteed to exist). Find the lowest common ancestor. Enter as level-order." },
    defaultInput: "6,2,8,0,4,7,9,null,null,3,5",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [
      { key: "p", label: { vi: "p", en: "p" }, default: 2 },
      { key: "q", label: { vi: "q", en: "q" }, default: 8 },
    ],
    approach: [
      { vi: "BST property: nếu p,q đều < node → LCA ở trái. Đều > node → ở phải. Ngược lại (split) → node = LCA.", en: "BST property: if both p,q < node → LCA is left. Both > node → right. Otherwise (split) → node = LCA." },
    ],
    complexity: { time: "O(h)", space: "O(1)", note: { vi: "1 đường từ root → O(h).", en: "One path from root → O(h)." } },
    code: ["class Solution:", "    def lowestCommonAncestor(self, root, p, q):", "        node = root", "        while node:", "            if p.val < node.val and q.val < node.val:", "                node = node.left", "            elif p.val > node.val and q.val > node.val:", "                node = node.right", "            else:", "                return node"],
    builder: buildSteps235,
  },
  1382: {
    id: 1382,
    difficulty: "medium",
    slug: "balance-a-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Balance a Binary Search Tree", en: "Balance a Binary Search Tree" },
    titleVi: { vi: "Cân bằng BST", en: "Rebuild BST to be balanced" },
    statement: { vi: "Cho root BST, trả về BST cân bằng (chiều cao tối thiểu) chứa cùng giá trị. Nhập level-order.", en: "Given a BST root, return a balanced BST with the same values. Enter as level-order." },
    defaultInput: "1,null,2,null,null,null,3,null,null,null,null,null,null,null,4",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Bước 1: Inorder traversal → mảng sorted.", en: "Step 1: Inorder traversal → sorted array." },
      { vi: "Bước 2: Xây BST cân bằng từ sorted array (chọn mid làm root, đệ quy 2 nửa).", en: "Step 2: Build balanced BST from sorted array (pick mid as root, recurse on halves)." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Inorder O(n) + xây cây O(n).", en: "Inorder O(n) + build tree O(n)." } },
    code: ["class Solution:", "    def balanceBST(self, root):", "        # Step 1: inorder → sorted", "        vals = []", "        def inorder(node):", "            if not node: return", "            inorder(node.left); vals.append(node.val); inorder(node.right)", "        inorder(root)", "        # Step 2: build balanced from sorted", "        def build(lo, hi):", "            if lo > hi: return None", "            mid = (lo + hi) // 2", "            node = TreeNode(vals[mid])", "            node.left = build(lo, mid-1)", "            node.right = build(mid+1, hi)", "            return node", "        return build(0, len(vals)-1)"],
    builder: buildSteps1382,
  },
  426: {
    id: 426,
    difficulty: "medium",
    slug: "convert-binary-search-tree-to-sorted-doubly-linked-list",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Convert BST to Sorted Doubly Linked List", en: "Convert BST to Sorted Doubly Linked List" },
    titleVi: { vi: "BST → Doubly Linked List vòng", en: "BST to circular DLL" },
    statement: { vi: "Chuyển BST thành circular sorted doubly linked list (tại chỗ). node.left = prev, node.right = next. Nối head ↔ tail. Nhập level-order.", en: "Convert BST to circular sorted doubly linked list (in-place). node.left = prev, node.right = next. Connect head ↔ tail. Enter as level-order." },
    defaultInput: "4,2,5,1,3",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Inorder traversal cho thứ tự tăng dần. Duy trì pointer 'prev' → nối prev.right = curr, curr.left = prev.", en: "Inorder traversal gives ascending order. Maintain 'prev' pointer → link prev.right = curr, curr.left = prev." },
      { vi: "Cuối cùng nối head.left = tail, tail.right = head (circular).", en: "Finally link head.left = tail, tail.right = head (circular)." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Inorder O(n), stack O(h).", en: "Inorder O(n), stack O(h)." } },
    code: ["class Solution:", "    def treeToDoublyList(self, root):", "        if not root: return None", "        head = None; prev = None", "        def inorder(node):", "            nonlocal head, prev", "            if not node: return", "            inorder(node.left)", "            if prev:", "                prev.right = node", "                node.left = prev", "            else:", "                head = node", "            prev = node", "            inorder(node.right)", "        inorder(root)", "        head.left = prev", "        prev.right = head", "        return head"],
    builder: buildSteps426,
  },
  700: {
    id: 700,
    difficulty: "easy",
    slug: "search-in-a-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Search in a Binary Search Tree", en: "Search in a Binary Search Tree" },
    titleVi: { vi: "Tìm kiếm trong BST", en: "Search BST for value" },
    statement: { vi: "Cho root BST và giá trị val. Tìm nút có giá trị val, trả subtree gốc tại đó (hoặc null). Nhập level-order.", en: "Given BST root and value val. Find the node with value val, return subtree rooted there (or null). Enter as level-order." },
    defaultInput: "4,2,7,1,3",
    inputKind: "string",
    inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "val", label: { vi: "val (tìm kiếm)", en: "val (search for)" }, default: 2 }],
    approach: [
      { vi: "BST: val < node → trái, val > node → phải, val == node → found.", en: "BST: val < node → left, val > node → right, val == node → found." },
    ],
    complexity: { time: "O(h)", space: "O(1)", note: { vi: "1 đường root → leaf O(h).", en: "One path root → leaf O(h)." } },
    code: ["class Solution:", "    def searchBST(self, root, val):", "        node = root", "        while node:", "            if val == node.val:", "                return node", "            elif val < node.val:", "                node = node.left", "            else:", "                node = node.right", "        return None"],
    builder: buildSteps700,
  },
  230: {
    id: 230, difficulty: "medium", slug: "kth-smallest-element-in-a-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Kth Smallest Element in a BST", en: "Kth Smallest Element in a BST" },
    titleVi: { vi: "Phần tử nhỏ thứ k trong BST", en: "Kth smallest in BST" },
    statement: { vi: "Cho BST và k, trả về phần tử nhỏ thứ k (1-indexed). Dùng inorder traversal.", en: "Given a BST and k, return the kth smallest element (1-indexed). Use inorder traversal." },
    defaultInput: "5,3,6,2,4,null,null,1",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "k", label: { vi: "k", en: "k" }, default: 3 }],
    approach: [
      { vi: "Inorder traversal BST cho thứ tự tăng dần. Đếm tới k → trả phần tử thứ k.", en: "Inorder of BST gives ascending order. Count to k → return the kth element." },
    ],
    complexity: { time: "O(k)", space: "O(h)", note: { vi: "Dừng sớm khi đếm đủ k.", en: "Stop early once k elements counted." } },
    code: ["class Solution:", "    def kthSmallest(self, root, k):", "        stack = []", "        node = root", "        while node or stack:", "            while node:", "                stack.append(node)", "                node = node.left", "            node = stack.pop()", "            k -= 1", "            if k == 0:", "                return node.val", "            node = node.right"],
    builder: buildSteps230,
  },
  108: {
    id: 108, difficulty: "easy", slug: "convert-sorted-array-to-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Convert Sorted Array to BST", en: "Convert Sorted Array to BST" },
    titleVi: { vi: "Mảng sorted → BST cân bằng", en: "Sorted array to balanced BST" },
    statement: { vi: "Cho mảng nums đã sắp xếp tăng dần, chuyển thành BST cân bằng chiều cao. Nhập mảng cách bởi dấu phẩy.", en: "Given a sorted array nums, convert to a height-balanced BST. Enter array comma-separated." },
    defaultInput: "-10,-3,0,5,9",
    inputKind: "string", inputLabel: { vi: "Sorted array (dấu phẩy)", en: "Sorted array (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Chọn mid = arr[n/2] làm root → cân bằng. Đệ quy 2 nửa: arr[0..mid-1] → left, arr[mid+1..n-1] → right.", en: "Pick mid = arr[n/2] as root → balanced. Recurse halves: arr[0..mid-1] → left, arr[mid+1..n-1] → right." },
    ],
    complexity: { time: "O(n)", space: "O(log n)", note: { vi: "Mỗi phần tử xử lý 1 lần. Stack O(log n).", en: "Each element processed once. Stack O(log n)." } },
    code: ["class Solution:", "    def sortedArrayToBST(self, nums):", "        def build(lo, hi):", "            if lo > hi: return None", "            mid = (lo + hi) // 2", "            node = TreeNode(nums[mid])", "            node.left = build(lo, mid - 1)", "            node.right = build(mid + 1, hi)", "            return node", "        return build(0, len(nums) - 1)"],
    builder: buildSteps108,
  },
  450: {
    id: 450, difficulty: "medium", slug: "delete-node-in-a-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Delete Node in a BST", en: "Delete Node in a BST" },
    titleVi: { vi: "Xóa nút trong BST", en: "Delete node from BST" },
    statement: { vi: "Cho BST và giá trị key, xóa nút có giá trị key. Trả về root mới. Nhập level-order.", en: "Given BST and value key, delete the node with that value. Return new root. Enter as level-order." },
    defaultInput: "5,3,6,2,4,null,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "key", label: { vi: "key (xóa)", en: "key (delete)" }, default: 3 }],
    approach: [
      { vi: "Tìm nút cần xóa (BST search). 3 trường hợp: (1) lá → xóa thẳng, (2) 1 con → thay bằng con, (3) 2 con → thay bằng inorder successor.", en: "Find node to delete (BST search). 3 cases: (1) leaf → remove, (2) 1 child → replace with child, (3) 2 children → replace with inorder successor." },
    ],
    complexity: { time: "O(h)", space: "O(h)", note: { vi: "Đi 1 đường + tìm successor O(h).", en: "One path + find successor O(h)." } },
    code: ["class Solution:", "    def deleteNode(self, root, key):", "        if not root: return None", "        if key < root.val:", "            root.left = self.deleteNode(root.left, key)", "        elif key > root.val:", "            root.right = self.deleteNode(root.right, key)", "        else:", "            if not root.left: return root.right", "            if not root.right: return root.left", "            # Find inorder successor (smallest in right subtree)", "            succ = root.right", "            while succ.left: succ = succ.left", "            root.val = succ.val", "            root.right = self.deleteNode(root.right, succ.val)", "        return root"],
    builder: buildSteps450,
  },
  653: {
    id: 653, difficulty: "easy", slug: "two-sum-iv-input-is-a-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Two Sum IV - Input is a BST", en: "Two Sum IV - Input is a BST" },
    titleVi: { vi: "Two Sum trong BST", en: "Two sum in BST" },
    statement: { vi: "Cho BST và target, kiểm tra có 2 nút có tổng = target không. Dùng inorder + set.", en: "Given BST and target, check if two nodes sum to target. Use inorder + set." },
    defaultInput: "5,3,6,2,4,null,7",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "k", label: { vi: "target (tổng)", en: "target (sum)" }, default: 9 }],
    approach: [
      { vi: "Inorder → sorted array. Dùng 2 pointers (left, right) hoặc set để tìm pair.", en: "Inorder → sorted array. Use 2 pointers or set to find pair." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Inorder O(n) + set O(n).", en: "Inorder O(n) + set O(n)." } },
    code: ["class Solution:", "    def findTarget(self, root, k):", "        seen = set()", "        def dfs(node):", "            if not node: return False", "            if k - node.val in seen:", "                return True", "            seen.add(node.val)", "            return dfs(node.left) or dfs(node.right)", "        return dfs(root)"],
    builder: buildSteps653,
  },
  530: {
    id: 530, difficulty: "easy", slug: "minimum-absolute-difference-in-bst",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Minimum Absolute Difference in BST", en: "Minimum Absolute Difference in BST" },
    titleVi: { vi: "Hiệu tuyệt đối nhỏ nhất BST", en: "Min abs diff in BST" },
    statement: { vi: "Cho BST, trả về hiệu tuyệt đối nhỏ nhất giữa 2 nút bất kỳ. Inorder → sorted, diff liền kề nhỏ nhất.", en: "Given a BST, return the minimum absolute difference between any two nodes. Inorder → sorted, min adjacent diff." },
    defaultInput: "4,2,6,1,3",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Inorder BST → sorted. Min diff chỉ xảy ra giữa 2 phần tử liền kề trong sorted order.", en: "Inorder BST → sorted. Min diff only occurs between adjacent elements in sorted order." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "Inorder 1 lần, chỉ cần prev.", en: "One inorder pass, only need prev." } },
    code: ["class Solution:", "    def getMinimumDifference(self, root):", "        self.prev = None", "        self.min_diff = float('inf')", "        def inorder(node):", "            if not node: return", "            inorder(node.left)", "            if self.prev is not None:", "                self.min_diff = min(self.min_diff, node.val - self.prev)", "            self.prev = node.val", "            inorder(node.right)", "        inorder(root)", "        return self.min_diff"],
    builder: buildSteps530,
  },
  99: {
    id: 99, difficulty: "medium", slug: "recover-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Recover Binary Search Tree", en: "Recover Binary Search Tree" },
    titleVi: { vi: "Khôi phục BST", en: "Recover swapped BST" },
    statement: { vi: "Có đúng 2 nút trong BST bị hoán đổi giá trị nhầm. Khôi phục lại BST mà không đổi cấu trúc. Nhập level-order.", en: "Exactly two nodes of a BST were swapped by mistake. Recover the BST without changing its structure. Enter as level-order." },
    defaultInput: "3,1,4,null,null,2",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Inorder BST phải tăng dần. Duyệt inorder, tìm các vị trí prev > curr → xác định 2 nút bị hoán đổi.", en: "Inorder of BST must be ascending. Traverse inorder, find positions where prev > curr → identify the 2 swapped nodes." },
      { vi: "1 vi phạm → 2 nút liền kề. 2 vi phạm → nút đầu của vi phạm 1 và nút sau của vi phạm 2. Swap giá trị.", en: "1 violation → adjacent nodes. 2 violations → first node of violation 1 and second node of violation 2. Swap values." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần inorder. Stack O(h).", en: "One inorder pass. Stack O(h)." } },
    code: ["class Solution:", "    def recoverTree(self, root):", "        first = second = prev = None", "        def inorder(node):", "            nonlocal first, second, prev", "            if not node: return", "            inorder(node.left)", "            if prev and prev.val > node.val:", "                if not first:", "                    first = prev", "                second = node", "            prev = node", "            inorder(node.right)", "        inorder(root)", "        first.val, second.val = second.val, first.val"],
    builder: buildSteps99,
  },
  109: {
    id: 109, difficulty: "medium", slug: "convert-sorted-list-to-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Convert Sorted List to BST", en: "Convert Sorted List to BST" },
    titleVi: { vi: "Linked list sorted → BST cân bằng", en: "Sorted list to balanced BST" },
    statement: { vi: "Cho linked list đã sắp xếp tăng dần, chuyển thành BST cân bằng chiều cao. Nhập các giá trị cách bởi dấu phẩy.", en: "Given a sorted (ascending) linked list, convert it to a height-balanced BST. Enter values comma-separated." },
    defaultInput: "-10,-3,0,5,9",
    inputKind: "string", inputLabel: { vi: "Sorted list (dấu phẩy)", en: "Sorted list (comma-sep)" },
    extraParams: [],
    approach: [
      { vi: "Phần tử giữa = root → cây cân bằng. Đệ quy nửa trái → subtree trái, nửa phải → subtree phải.", en: "Middle element = root → balanced tree. Recurse left half → left subtree, right half → right subtree." },
      { vi: "Có thể đổi list thành mảng trước (O(n) bộ nhớ) hoặc dùng kỹ thuật slow/fast pointer tìm mid.", en: "Can convert list to array first (O(n) memory) or use slow/fast pointers to find the middle." },
    ],
    complexity: { time: "O(n)", space: "O(log n)", note: { vi: "Mỗi phần tử xử lý 1 lần. Stack O(log n).", en: "Each element processed once. Stack O(log n)." } },
    code: ["class Solution:", "    def sortedListToBST(self, head):", "        vals = []", "        while head:", "            vals.append(head.val)", "            head = head.next", "        def build(lo, hi):", "            if lo > hi: return None", "            mid = (lo + hi) // 2", "            node = TreeNode(vals[mid])", "            node.left = build(lo, mid - 1)", "            node.right = build(mid + 1, hi)", "            return node", "        return build(0, len(vals) - 1)"],
    builder: buildSteps109,
  },
  270: {
    id: 270, difficulty: "easy", slug: "closest-binary-search-tree-value",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Closest Binary Search Tree Value", en: "Closest Binary Search Tree Value" },
    titleVi: { vi: "Giá trị BST gần nhất", en: "Closest value in BST" },
    statement: { vi: "Cho BST và số thực target, trả về giá trị trong BST gần target nhất. Nhập level-order.", en: "Given a BST and a target (float), return the value in the BST closest to target. Enter as level-order." },
    defaultInput: "4,2,5,1,3",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [{ key: "target", label: { vi: "target (số thực)", en: "target (float)" }, type: "float", default: 3.714286 }],
    approach: [
      { vi: "Đi từ root, cập nhật closest nếu |node.val - target| nhỏ hơn. Dùng BST property để chọn nhánh.", en: "From root, update closest when |node.val - target| is smaller. Use BST property to pick the branch." },
      { vi: "target < node.val → đi trái, ngược lại → đi phải. Chỉ đi 1 đường → O(h).", en: "target < node.val → go left, else → go right. Only one path → O(h)." },
    ],
    complexity: { time: "O(h)", space: "O(1)", note: { vi: "1 đường từ root xuống → O(h).", en: "One path from root down → O(h)." } },
    code: ["class Solution:", "    def closestValue(self, root, target):", "        closest = root.val", "        node = root", "        while node:", "            if abs(node.val - target) < abs(closest - target):", "                closest = node.val", "            if target < node.val:", "                node = node.left", "            else:", "                node = node.right", "        return closest"],
    builder: buildSteps270,
  },
  783: {
    id: 783, difficulty: "easy", slug: "minimum-distance-between-bst-nodes",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Minimum Distance Between BST Nodes", en: "Minimum Distance Between BST Nodes" },
    titleVi: { vi: "Khoảng cách nhỏ nhất giữa 2 nút BST", en: "Min distance between BST nodes" },
    statement: { vi: "Cho BST, trả về hiệu nhỏ nhất giữa giá trị của 2 nút bất kỳ. Inorder → sorted, diff liền kề nhỏ nhất (giống bài 530). Nhập level-order.", en: "Given a BST, return the minimum difference between values of any two nodes. Inorder → sorted, min adjacent diff (same as 530). Enter as level-order." },
    defaultInput: "4,2,6,1,3",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Inorder BST → sorted. Hiệu nhỏ nhất chỉ xảy ra giữa 2 phần tử liền kề.", en: "Inorder BST → sorted. Min difference only occurs between adjacent elements." },
    ],
    complexity: { time: "O(n)", space: "O(h)", note: { vi: "1 lần inorder, chỉ cần prev.", en: "One inorder pass, only need prev." } },
    code: ["class Solution:", "    def minDiffInBST(self, root):", "        self.prev = None", "        self.min_diff = float('inf')", "        def inorder(node):", "            if not node: return", "            inorder(node.left)", "            if self.prev is not None:", "                self.min_diff = min(self.min_diff, node.val - self.prev)", "            self.prev = node.val", "            inorder(node.right)", "        inorder(root)", "        return self.min_diff"],
    builder: buildSteps783,
  },
  501: {
    id: 501, difficulty: "easy", slug: "find-mode-in-binary-search-tree",
    category: { key: "bst", vi: "Cây nhị phân tìm kiếm (BST)", en: "Binary Search Tree" },
    title: { vi: "Find Mode in Binary Search Tree", en: "Find Mode in Binary Search Tree" },
    titleVi: { vi: "Tìm Mode trong BST", en: "Find mode(s) in BST" },
    statement: { vi: "Cho BST (có thể có giá trị trùng), trả về (các) giá trị xuất hiện nhiều nhất (mode). Nhập level-order.", en: "Given a BST (may contain duplicates), return the value(s) that appear most frequently (mode). Enter as level-order." },
    defaultInput: "1,null,2,null,null,2",
    inputKind: "string", inputLabel: { vi: "Tree (level-order)", en: "Tree (level-order)" },
    extraParams: [],
    approach: [
      { vi: "Inorder BST → các giá trị bằng nhau nằm liền kề. Đếm tần suất từng giá trị.", en: "Inorder BST → equal values are adjacent. Count the frequency of each value." },
      { vi: "Theo dõi tần suất cao nhất → trả về tất cả giá trị đạt tần suất đó.", en: "Track the highest frequency → return all values reaching it." },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "Inorder + đếm tần suất.", en: "Inorder + frequency count." } },
    code: ["class Solution:", "    def findMode(self, root):", "        from collections import Counter", "        freq = Counter()", "        def inorder(node):", "            if not node: return", "            inorder(node.left)", "            freq[node.val] += 1", "            inorder(node.right)", "        inorder(root)", "        max_freq = max(freq.values())", "        return [v for v, f in freq.items() if f == max_freq]"],
    builder: buildSteps501,
  },
};
