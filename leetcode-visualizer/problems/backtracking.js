// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

// Add a persistent decision tree to a backtracking trace without replacing its
// existing board/array/grid visualization. Each choice creates a child, a
// backtrack moves the active pointer to the parent, valid answers stay green,
// and rejected/pruned branches stay red. Problem 77 already builds its own
// decision tree, so the decorator is used by the other ten problems.
function addWordSearchDecisionTree(result) {
  if (!result || !Array.isArray(result.steps)) return result;

  const NODE_LIMIT = 180;
  let nextId = 1;
  let truncated = false;
  const root = {
    id: 0,
    label: "DFS",
    labelLines: ["DFS", "starts"],
    parentId: null,
    depth: 0,
    children: [],
    complete: false,
    pruned: false,
  };
  const nodesByKey = new Map([["root", root]]);

  const framePart = (frame) => `${frame.r},${frame.c},${frame.i}`;
  const stackKey = (stack, length = stack.length) => (
    length > 0 ? stack.slice(0, length).map(framePart).join("|") : "root"
  );

  function ensureNode(stack, length) {
    if (length <= 0) return root;
    const key = stackKey(stack, length);
    if (nodesByKey.has(key)) return nodesByKey.get(key);
    const parent = ensureNode(stack, length - 1);
    if (nextId >= NODE_LIMIT) {
      truncated = true;
      return parent;
    }
    const frame = stack[length - 1];
    const node = {
      id: nextId++,
      label: `(${frame.r},${frame.c})`,
      labelLines: [`(${frame.r},${frame.c})`, `i=${frame.i}`],
      parentId: parent.id,
      depth: parent.depth + 1,
      children: [],
      complete: false,
      pruned: false,
    };
    parent.children.push(node);
    nodesByKey.set(key, node);
    return node;
  }

  function snapshotNodes(highlightId) {
    const nodes = [];
    let xCursor = 0;
    function layout(node) {
      let x;
      if (node.children.length === 0) {
        x = xCursor++;
      } else {
        const childXs = node.children.map(layout);
        x = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        labelLines: [...node.labelLines],
        x,
        y: node.depth,
        parentId: node.parentId,
        hl: node.id === highlightId,
        isWord: node.complete,
        isPruned: node.pruned,
      });
      return x;
    }
    layout(root);
    return nodes;
  }

  for (const step of result.steps) {
    const view = step.wordSearchView || {};
    const stack = Array.isArray(view.stack) ? view.stack.map((frame) => ({ ...frame })) : [];
    let activeNode = stack.length ? ensureNode(stack, stack.length) : root;

    if ((view.action === "start" || view.action === "explore") && view.target) {
      const previewStack = [...stack, { r: view.target.r, c: view.target.c, i: view.index }];
      activeNode = ensureNode(previewStack, previewStack.length);
    }

    if (["reject-check", "reject"].includes(view.action)) {
      activeNode.pruned = true;
    }
    if (["found-value", "restore", "return-found"].includes(view.action) && view.result === false) {
      activeNode.pruned = true;
    }
    if (view.action === "found" || (["found-value", "restore", "return-found"].includes(view.action) && view.result === true)) {
      activeNode.complete = true;
      activeNode.pruned = false;
    }

    step.decisionTree = {
      nodes: snapshotNodes(activeNode.id),
      showLevels: true,
      levelLabelGutter: 58,
      truncated,
    };
  }

  return result;
}

function addBacktrackingDecisionTree(result, problemId) {
  if (!result || !Array.isArray(result.steps) || problemId === 77) return result;
  if (problemId === 79) return addWordSearchDecisionTree(result);

  const NODE_LIMIT = 140;
  let nextId = 1;
  let truncated = false;
  const root = {
    id: 0, label: "∅", parentId: null, parent: null, depth: 0,
    children: [], childMap: new Map(), complete: false, pruned: false,
  };
  let active = root;
  const depthNodes = [root];

  const titleEn = (step) => String((step.title && (step.title.en || step.title.vi)) || "");
  const varMap = (step) => new Map((step.vars || []).map((item) => [String(item.name).toLowerCase(), item.value]));
  const getVar = (vars, ...names) => {
    for (const name of names) {
      const exact = vars.get(name.toLowerCase());
      if (exact !== undefined) return exact;
    }
    return undefined;
  };
  const compact = (value) => {
    let text = String(value === undefined || value === null ? "?" : value).trim();
    text = text.replace(/^['"]|['"]$/g, "");
    const quoted = text.match(/['"]([^'"]+)['"]/);
    if (quoted && /lowercase|uppercase|letter/i.test(text)) text = quoted[1];
    return text.length > 14 ? `${text.slice(0, 12)}…` : text;
  };
  const choiceFrom = (step, vars) => {
    if (problemId === 51 || problemId === 52) {
      const row = getVar(vars, "row");
      const col = getVar(vars, "col");
      if (row !== undefined && col !== undefined) return `(${row},${col})`;
    }
    if (problemId === 980) return compact(getVar(vars, "at", "backtrack"));
    if (problemId === 79) return compact(getVar(vars, "at", "cell", "next cell"));
    if (problemId === 17) return compact(getVar(vars, "letter", "removed"));
    if (problemId === 784) return compact(getVar(vars, "branch", "char"));
    return compact(getVar(vars, "nums[i]", "candidate", "sorted[i]", "i (pick)", "popped"));
  };
  const childKey = (choice, vars) => {
    const index = getVar(vars, "i", "idx", "row", "col");
    return `${choice}|${index === undefined ? "" : index}`;
  };
  const makeChild = (parent, choice, vars) => {
    const label = compact(choice);
    const key = childKey(label, vars);
    if (parent.childMap.has(key)) return parent.childMap.get(key);
    if (nextId >= NODE_LIMIT) {
      truncated = true;
      return parent;
    }
    const node = {
      id: nextId++, label, parentId: parent.id, parent, depth: parent.depth + 1,
      children: [], childMap: new Map(), complete: false, pruned: false,
    };
    parent.children.push(node);
    parent.childMap.set(key, node);
    return node;
  };
  const ancestorAtDepth = (depth) => {
    const wanted = Math.max(0, Number(depth) || 0);
    if (depthNodes[wanted]) return depthNodes[wanted];
    let node = active;
    while (node.parent && node.depth > wanted) node = node.parent;
    return node.depth === wanted ? node : root;
  };
  const snapshotNodes = (highlightId) => {
    const nodes = [];
    let xCursor = 0;
    function layout(node) {
      let x;
      if (node.children.length === 0) {
        x = xCursor++;
      } else {
        const childXs = node.children.map(layout);
        x = (childXs[0] + childXs[childXs.length - 1]) / 2;
      }
      nodes.push({
        id: node.id,
        label: node.label,
        x,
        y: node.depth,
        parentId: node.parentId,
        hl: node.id === highlightId,
        isWord: node.complete,
        isPruned: node.pruned,
      });
      return x;
    }
    layout(root);
    return nodes;
  };

  for (const step of result.steps) {
    const title = titleEn(step);
    const vars = varMap(step);
    const isFinal = Boolean(step.final) || /^Result\b/i.test(title);
    const isBacktrack = /^(Backtrack:|Backtrack from)|current\.pop\(\)/i.test(title);
    const isComplete = /^✓|^Save\b|^Permutation\b|^Solution #|Found valid path/i.test(title);
    const isPruned = /not safe|blocked|^Skip\b|too early|Overshoot|invalid/i.test(title);
    const isChoice = /place queen|✓ place|^Pick\b|^Add\b|current\.append|try '.+'|is digit → keep|Enter cell/i.test(title);

    let highlight = active;
    let activeAfter = active;

    if (isBacktrack) {
      if (active.parent) active = active.parent;
      highlight = active;
      activeAfter = active;
    } else if (isPruned) {
      if (/Overshoot/i.test(title)) {
        active.pruned = true;
        highlight = active;
      } else {
        let parent = active;
        if (problemId === 51 || problemId === 52) parent = ancestorAtDepth(getVar(vars, "row"));
        const rejected = makeChild(parent, choiceFrom(step, vars), vars);
        rejected.pruned = true;
        highlight = rejected;
        activeAfter = parent;
      }
    } else if (isComplete) {
      if (problemId === 980) {
        const endpoint = makeChild(active, choiceFrom(step, vars), vars);
        endpoint.complete = /Found valid path/i.test(title);
        endpoint.pruned = !endpoint.complete;
        highlight = endpoint;
        activeAfter = active;
      } else {
        active.complete = true;
        highlight = active;
      }
    } else if (isChoice) {
      let parent = active;
      if (problemId === 784) parent = ancestorAtDepth(getVar(vars, "idx"));
      if (problemId === 980) {
        const pathLength = Number(getVar(vars, "path length"));
        if (Number.isFinite(pathLength)) parent = ancestorAtDepth(pathLength - 1);
      }
      active = makeChild(parent, choiceFrom(step, vars), vars);
      highlight = active;
      activeAfter = active;
      depthNodes[active.depth] = active;
      depthNodes.length = active.depth + 1;
    } else if (isFinal) {
      highlight = null;
    }

    step.decisionTree = {
      nodes: snapshotNodes(highlight ? highlight.id : -1),
      showLevels: true,
      truncated,
    };
    active = activeAfter;
  }

  return result;
}

/**
 * Generate steps for LeetCode 51: N-Queens.
 * Backtracking: place queens row by row, checking safety at each position.
 * Uses grid view to display the board state.
 */
function buildSteps51(input) {
  const n = input[0];
  const steps = [];
  const board = Array.from({ length: n }, () => new Array(n).fill("."));
  const solutions = [];

  // Grid visualization helper
  function makeGrid(hlCell) {
    const dp = board.map((row) => [...row]);
    return {
      dp: dp.map((row) => row.map((c) => (c === "Q" ? "♛" : "·"))),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: hlCell || null,
      pathCells: [],
    };
  }

  // Find all queen positions for marking
  function queenCells() {
    const cells = [];
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (board[r][c] === "Q") cells.push([r, c]);
    return cells;
  }

  function isSafe(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === "Q") return false;
      if (col - (row - i) >= 0 && board[i][col - (row - i)] === "Q") return false;
      if (col + (row - i) < n && board[i][col + (row - i)] === "Q") return false;
    }
    return true;
  }

  steps.push({
    title: { vi: "Khởi tạo bàn cờ", en: "Initialize board" },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    codeLines: [2, 3],
    vars: [
      { name: "n", value: n },
      { name: "solutions found", value: 0 },
    ],
    note: {
      vi: `Bàn cờ ${n}×${n} trống. Backtracking: thử đặt hậu từng hàng từ trên xuống.`,
      en: `Empty ${n}×${n} board. Backtracking: try placing a queen in each row from top to bottom.`,
    },
  });

  function backtrack(row) {
    if (row === n) {
      solutions.push(board.map((r) => r.join("")));
      const grid = makeGrid();
      grid.pathCells = queenCells();
      steps.push({
        title: { vi: `✓ Tìm thấy lời giải #${solutions.length}`, en: `✓ Found solution #${solutions.length}` },
        arr: [],
        grid,
        highlight: [],
        mark: [],
        codeLines: [16, 17],
        vars: [
          { name: "solutions", value: solutions.length },
          { name: "board", value: solutions[solutions.length - 1].join(" | ") },
        ],
        note: {
          vi: `Đã đặt ${n} hậu hợp lệ! Đây là lời giải thứ ${solutions.length}.`,
          en: `All ${n} queens placed successfully! This is solution #${solutions.length}.`,
        },
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      const safe = isSafe(row, col);

      if (!safe) {
        // Only show a few "not safe" steps to avoid too many steps
        if (steps.length < 80) {
          steps.push({
            title: { vi: `Row ${row}, Col ${col}: ✗ không an toàn`, en: `Row ${row}, Col ${col}: ✗ not safe` },
            arr: [],
            grid: makeGrid([row, col]),
            highlight: [],
            mark: [],
            codeLines: [19, 20],
            vars: [
              { name: "row", value: row },
              { name: "col", value: col },
              { name: "is_safe", value: false },
            ],
            note: {
              vi: `Thử (${row},${col}): bị tấn công bởi hậu ở hàng trước → bỏ qua.`,
              en: `Try (${row},${col}): attacked by a queen in a previous row → skip.`,
            },
          });
        }
        continue;
      }

      // Place queen
      board[row][col] = "Q";
      const gridPlace = makeGrid([row, col]);
      gridPlace.pathCells = queenCells();
      steps.push({
        title: { vi: `Row ${row}, Col ${col}: ✓ đặt hậu`, en: `Row ${row}, Col ${col}: ✓ place queen` },
        arr: [],
        grid: gridPlace,
        highlight: [],
        mark: [],
        codeLines: [19, 20, 21],
        vars: [
          { name: "row", value: row },
          { name: "col", value: col },
          { name: "is_safe", value: true },
          { name: "queens", value: queenCells().map(([r, c]) => `(${r},${c})`).join(", ") },
        ],
        note: {
          vi: `(${row},${col}) an toàn → đặt hậu. Tiếp tục hàng ${row + 1}.`,
          en: `(${row},${col}) is safe → place queen. Continue to row ${row + 1}.`,
        },
      });

      backtrack(row + 1);

      // Remove queen (backtrack)
      board[row][col] = ".";
      if (steps.length < 80) {
        steps.push({
          title: { vi: `Backtrack: bỏ hậu (${row},${col})`, en: `Backtrack: remove queen (${row},${col})` },
          arr: [],
          grid: makeGrid([row, col]),
          highlight: [],
          mark: [],
          codeLines: [23],
          vars: [
            { name: "row", value: row },
            { name: "col", value: col },
            { name: "action", value: "backtrack" },
          ],
          note: {
            vi: `Quay lui: bỏ hậu tại (${row},${col}), thử cột tiếp theo.`,
            en: `Backtrack: remove queen at (${row},${col}), try next column.`,
          },
        });
      }
    }
  }

  backtrack(0);

  steps.push({
    title: { vi: `Kết quả: ${solutions.length} lời giải`, en: `Result: ${solutions.length} solutions` },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [25, 26],
    vars: [
      { name: "total solutions", value: solutions.length },
    ],
    note: {
      vi: `Tổng cộng ${solutions.length} cách đặt ${n} hậu trên bàn ${n}×${n}.`,
      en: `Total ${solutions.length} ways to place ${n} queens on a ${n}×${n} board.`,
    },
  });

  return { n, answer: solutions.length, steps };
}

/**
 * Generate steps for LeetCode 52: N-Queens II.
 * Same backtracking as 51, but uses sets for O(1) conflict checking and only counts solutions.
 */
function buildSteps52(input) {
  const n = input[0];
  const steps = [];
  const board = Array.from({ length: n }, () => new Array(n).fill("."));
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col
  let count = 0;

  function makeGrid(hlCell) {
    const dp = board.map((row) => [...row]);
    return {
      dp: dp.map((row) => row.map((c) => (c === "Q" ? "♛" : "·"))),
      text1: Array.from({ length: n }, (_, i) => String(i)),
      text2: Array.from({ length: n }, (_, i) => String(i)),
      hlCell: hlCell || null,
      pathCells: [],
    };
  }

  function queenCells() {
    const cells = [];
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (board[r][c] === "Q") cells.push([r, c]);
    return cells;
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5],
    vars: [
      { name: "n", value: n },
      { name: "cols", value: "∅" },
      { name: "diag1 (row-col)", value: "∅" },
      { name: "diag2 (row+col)", value: "∅" },
      { name: "count", value: 0 },
    ],
    note: {
      vi: `Dùng 3 set để kiểm tra O(1): cols (cột), diag1 (row-col), diag2 (row+col).\nChỉ đếm số lời giải, không cần lưu board.`,
      en: `Use 3 sets for O(1) checking: cols (columns), diag1 (row-col), diag2 (row+col).\nOnly count solutions, no need to store boards.`,
    },
  });

  function backtrack(row) {
    if (row === n) {
      count++;
      const grid = makeGrid();
      grid.pathCells = queenCells();
      steps.push({
        title: { vi: `✓ Lời giải #${count}`, en: `✓ Solution #${count}` },
        arr: [],
        grid,
        highlight: [],
        mark: [],
        codeLines: [9, 10],
        vars: [
          { name: "count", value: count },
          { name: "queens", value: queenCells().map(([r, c]) => `(${r},${c})`).join(", ") },
        ],
        note: {
          vi: `Tìm thấy lời giải thứ ${count}!`,
          en: `Found solution #${count}!`,
        },
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      const blocked = cols.has(col) || diag1.has(row - col) || diag2.has(row + col);

      if (blocked) {
        if (steps.length < 80) {
          steps.push({
            title: { vi: `(${row},${col}): bị chặn`, en: `(${row},${col}): blocked` },
            arr: [],
            grid: makeGrid([row, col]),
            highlight: [],
            mark: [],
            codeLines: [12, 13],
            vars: [
              { name: "row", value: row },
              { name: "col", value: col },
              { name: "col in cols", value: cols.has(col) },
              { name: "row-col in diag1", value: diag1.has(row - col) },
              { name: "row+col in diag2", value: diag2.has(row + col) },
            ],
            note: {
              vi: `(${row},${col}) bị chặn: ${cols.has(col) ? "cùng cột" : diag1.has(row - col) ? "đường chéo ↘" : "đường chéo ↗"} → skip.`,
              en: `(${row},${col}) blocked: ${cols.has(col) ? "same column" : diag1.has(row - col) ? "diagonal ↘" : "diagonal ↗"} → skip.`,
            },
          });
        }
        continue;
      }

      // Place
      board[row][col] = "Q";
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      const gridPlace = makeGrid([row, col]);
      gridPlace.pathCells = queenCells();
      steps.push({
        title: { vi: `(${row},${col}): ✓ đặt hậu`, en: `(${row},${col}): ✓ place` },
        arr: [],
        grid: gridPlace,
        highlight: [],
        mark: [],
        codeLines: [14, 15, 16, 17],
        vars: [
          { name: "row", value: row },
          { name: "col", value: col },
          { name: "cols", value: `{${[...cols].join(", ")}}` },
          { name: "diag1", value: `{${[...diag1].join(", ")}}` },
          { name: "diag2", value: `{${[...diag2].join(", ")}}` },
        ],
        note: {
          vi: `(${row},${col}) an toàn → đặt hậu. cols={${[...cols].join(",")}}.`,
          en: `(${row},${col}) safe → place queen. cols={${[...cols].join(",")}}.`,
        },
      });

      backtrack(row + 1);

      // Remove
      board[row][col] = ".";
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);

      if (steps.length < 80) {
        steps.push({
          title: { vi: `Backtrack (${row},${col})`, en: `Backtrack (${row},${col})` },
          arr: [],
          grid: makeGrid([row, col]),
          highlight: [],
          mark: [],
          codeLines: [19, 20, 21],
          vars: [
            { name: "row", value: row },
            { name: "col", value: col },
            { name: "action", value: "remove & try next col" },
          ],
          note: {
            vi: `Quay lui: bỏ hậu (${row},${col}), thử cột tiếp.`,
            en: `Backtrack: remove queen (${row},${col}), try next col.`,
          },
        });
      }
    }
  }

  backtrack(0);

  steps.push({
    title: { vi: `Kết quả: ${count}`, en: `Result: ${count}` },
    arr: [],
    grid: makeGrid(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [23, 24],
    vars: [{ name: "count", value: count }],
    note: {
      vi: `Tổng cộng ${count} cách đặt ${n} hậu trên bàn ${n}×${n}.`,
      en: `Total ${count} ways to place ${n} queens on a ${n}×${n} board.`,
    },
  });

  return { n, answer: count, steps };
}

/**
 * Generate steps for LeetCode 77: Combinations.
 * Backtracking: build current array incrementally, only pick numbers >= start.
 * Visualization: decision tree — each edge is a pick, each node is a partial
 * combination (∅ at the root); leaves at depth k that get saved are marked
 * as a full "word" (green ring), matching how other tree/trie problems mark
 * completed paths. The tree only grows (nodes are never removed on
 * backtrack), so by the end you see the entire explored search space.
 */
function buildSteps77(input, params) {
  const n = input[0];
  const k = params.k || 2;
  const steps = [];

  const current = [];
  const results = [];

  // ─── Persistent decision-tree structure ───
  // root = empty combination (∅). Each child edge = "pick this number next".
  // Nodes are added the first time a path is explored and are NEVER removed,
  // so backtracking (pop) just moves the "active" pointer back to the parent
  // while the node itself stays in the tree (dimmed once no longer active).
  let idCounter = 0;
  const rootNode = { id: idCounter++, val: null, parentId: null, children: {}, complete: false };
  let currentNode = rootNode;

  function snapshotTree(hlId) {
    const vizNodes = [];
    let nextX = 0;
    function dfs(node, depth) {
      const keys = Object.keys(node.children).sort((a, b) => Number(a) - Number(b));
      let x;
      if (keys.length === 0) {
        x = nextX++;
      } else {
        const xs = keys.map((key) => dfs(node.children[key], depth + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      vizNodes.push({
        id: node.id,
        label: node.val === null ? "\u2205" : String(node.val),
        x,
        y: depth,
        parentId: node.parentId,
        isWord: node.complete,
        hl: node.id === hlId,
      });
      return x;
    }
    dfs(rootNode, 0);
    return vizNodes;
  }

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      tree: { nodes: snapshotTree(opts.hlId !== undefined ? opts.hlId : currentNode.id), decisionTree: true },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
      final: opts.final || false,
    });
  }

  snap({
    title: { vi: "Khởi tạo", en: "Initialize" },
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "current", value: "[]" },
      { name: "result", value: "[]" },
    ],
    note: {
      vi: `Tìm tất cả tổ hợp ${k} số chọn từ [1..${n}].\nCây quyết định: gốc (∅) là chưa chọn số nào. Mỗi cạnh xuống là 1 lần chọn số → thêm vào current → đệ quy.\nĐể tránh trùng: chỉ chọn số > số cuối trong current (mỗi nhánh chỉ đi 1 chiều tăng dần).`,
      en: `Find all combinations of ${k} numbers from [1..${n}].\nDecision tree: the root (∅) has nothing picked yet. Each edge going down is one pick → add to current → recurse.\nTo avoid duplicates: only pick numbers > last in current (each branch only moves forward).`,
    },
  });

  function backtrack(start, depth) {
    if (current.length === k) {
      results.push([...current]);
      currentNode.complete = true;
      snap({
        title: { vi: `✓ Tìm thấy: [${current.join(", ")}]`, en: `✓ Found: [${current.join(", ")}]` },
        codeLines: [7, 8, 9],
        vars: [
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "len == k", value: true },
          { name: "results count", value: results.length },
          { name: "all results", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
        ],
        note: {
          vi: `len(current) == k → lưu [${current.join(", ")}] vào result. Nút lá này được khoanh viền xanh (đã hoàn tất). Tổng cộng: ${results.length} tổ hợp.`,
          en: `len(current) == k → save [${current.join(", ")}] to result. This leaf gets a green ring (completed). Total so far: ${results.length} combinations.`,
        },
      });
      return;
    }

    for (let i = start; i <= n; i++) {
      // Pruning check (optional, but shown if obvious)
      const needed = k - current.length;
      const remaining = n - i + 1;
      if (remaining < needed) break;

      current.push(i);
      const parentNode = currentNode;
      let childNode = parentNode.children[i];
      if (!childNode) {
        childNode = { id: idCounter++, val: i, parentId: parentNode.id, children: {}, complete: false };
        parentNode.children[i] = childNode;
      }
      currentNode = childNode;

      snap({
        title: { vi: `Thêm ${i}: current = [${current.join(", ")}]`, en: `Add ${i}: current = [${current.join(", ")}]` },
        codeLines: [10, 11, 12],
        vars: [
          { name: "i (pick)", value: i },
          { name: "start", value: start },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "depth", value: depth + 1 },
        ],
        note: {
          vi: `Chọn ${i} ∈ [${start}..${n}], thêm vào current → tạo/đi tới nhánh con "${i}" trong cây, đệ quy với start = ${i + 1}.`,
          en: `Pick ${i} from [${start}..${n}], add to current → move into the "${i}" child branch of the tree, recurse with start = ${i + 1}.`,
        },
      });

      backtrack(i + 1, depth + 1);

      const popped = current.pop();
      currentNode = parentNode;
      snap({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        codeLines: [13],
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Quay lui: bỏ ${popped} khỏi current, quay lại nút cha trong cây. Thử số tiếp theo trong vòng for.`,
          en: `Backtrack: remove ${popped} from current, move back up to the parent node in the tree. Try the next number in the for-loop.`,
        },
      });
    }
  }

  backtrack(1, 0);

  // Final summary — highlight nothing in particular, show the whole explored tree.
  snap({
    title: { vi: `Kết quả: ${results.length} tổ hợp`, en: `Result: ${results.length} combinations` },
    hlId: -1,
    final: true,
    codeLines: [15, 16],
    vars: [
      { name: "C(n, k)", value: `C(${n},${k}) = ${results.length}` },
      { name: "all results", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng cộng ${results.length} tổ hợp = C(${n},${k}). Toàn bộ cây quyết định đã được duyệt; các lá viền xanh là tổ hợp hợp lệ.\nDanh sách: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
      en: `Total ${results.length} combinations = C(${n},${k}). The whole decision tree has been explored; green-ringed leaves are the valid combinations.\nList: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
    },
  });

  return { n, k, answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 78: Subsets.
 * Backtracking: every recursion node is a valid subset → save current at each call.
 */
function buildSteps78(nums) {
  const steps = [];
  const current = [];
  const results = [];

  // current uses values; convert to indices for marking
  const indicesOf = (subset) => subset.map((v) => nums.indexOf(v));

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: nums.map(() => 0),
    sub: nums.map(String),
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "current", value: "[]" },
      { name: "result", value: "[]" },
    ],
    note: {
      vi: `Tìm tất cả tập con của [${nums.join(", ")}].\nMỗi node trong backtracking đều là một tập con hợp lệ → lưu ngay khi vào.`,
      en: `Find all subsets of [${nums.join(", ")}].\nEvery node in backtracking is a valid subset → save it on entry.`,
    },
  });

  function backtrack(start, depth) {
    // Save current immediately (every node is a subset)
    results.push([...current]);
    const curIdx = indicesOf(current);
    steps.push({
      title: { vi: `Lưu: [${current.join(", ")}]`, en: `Save: [${current.join(", ")}]` },
      arr: nums.map((_, i) => (curIdx.includes(i) ? 1 : 0)),
      sub: nums.map(String),
      highlight: [],
      mark: curIdx,
      codeLines: [6],
      vars: [
        { name: "current", value: `[${current.join(", ")}]` },
        { name: "start", value: start },
        { name: "depth", value: depth },
        { name: "results count", value: results.length },
      ],
      note: {
        vi: `Lưu [${current.join(", ")}] vào result. Tổng cộng: ${results.length} tập con.`,
        en: `Save [${current.join(", ")}] to result. Total so far: ${results.length} subsets.`,
      },
    });

    for (let i = start; i < nums.length; i++) {
      const val = nums[i];
      current.push(val);
      steps.push({
        title: { vi: `Thêm nums[${i}] = ${val}`, en: `Add nums[${i}] = ${val}` },
        arr: nums.map((_, idx) => (indicesOf(current).includes(idx) ? 1 : 0)),
        sub: nums.map(String),
        highlight: [i],
        mark: indicesOf(current).slice(0, -1),
        codeLines: [7, 8, 9],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: val },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Thêm ${val} (index ${i}) vào current → đệ quy với start = ${i + 1}.`,
          en: `Add ${val} (index ${i}) to current → recurse with start = ${i + 1}.`,
        },
      });

      backtrack(i + 1, depth + 1);

      const popped = current.pop();
      steps.push({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        arr: nums.map((_, idx) => (indicesOf(current).includes(idx) ? 1 : 0)),
        sub: nums.map(String),
        highlight: [],
        mark: indicesOf(current),
        codeLines: [10],
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Bỏ ${popped} khỏi current để thử nhánh khác.`,
          en: `Remove ${popped} from current to try another branch.`,
        },
      });
    }
  }

  backtrack(0, 0);

  steps.push({
    title: { vi: `Kết quả: ${results.length} tập con`, en: `Result: ${results.length} subsets` },
    arr: nums.map(() => 0),
    sub: nums.map(String),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12, 13],
    vars: [
      { name: "total", value: `2^${nums.length} = ${results.length}` },
      { name: "all subsets", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} = 2^${nums.length} tập con.\nDanh sách: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
      en: `Total ${results.length} = 2^${nums.length} subsets.\nList: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
    },
  });

  return { original: [...nums], answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 90: Subsets II.
 * Same as 78 but skip duplicates at each level (after sorting).
 */
function buildSteps90(nums) {
  const steps = [];
  const sorted = [...nums].sort((a, b) => a - b);
  const current = [];
  const results = [];

  steps.push({
    title: { vi: "Sắp xếp + Khởi tạo", en: "Sort + Initialize" },
    arr: sorted.map(() => 0),
    sub: sorted.map(String),
    highlight: sorted.map((_, i) => i),
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "nums (sorted)", value: `[${sorted.join(", ")}]` },
      { name: "current", value: "[]" },
      { name: "result", value: "[]" },
    ],
    note: {
      vi: `Sắp xếp nums = [${sorted.join(", ")}] để các phần tử trùng nằm cạnh nhau.\nỞ mỗi level: skip nếu nums[i] == nums[i-1] và i > start.`,
      en: `Sort nums = [${sorted.join(", ")}] so duplicates are adjacent.\nAt each level: skip if nums[i] == nums[i-1] and i > start.`,
    },
  });

  function backtrack(start, depth) {
    results.push([...current]);
    // Find indices of current values in sorted (taking first matches without re-using)
    const usedIdx = new Set();
    const curIdx = [];
    for (const v of current) {
      for (let i = 0; i < sorted.length; i++) {
        if (!usedIdx.has(i) && sorted[i] === v) {
          usedIdx.add(i);
          curIdx.push(i);
          break;
        }
      }
    }

    steps.push({
      title: { vi: `Lưu: [${current.join(", ")}]`, en: `Save: [${current.join(", ")}]` },
      arr: sorted.map((_, i) => (curIdx.includes(i) ? 1 : 0)),
      sub: sorted.map(String),
      highlight: [],
      mark: curIdx,
      codeLines: [7],
      vars: [
        { name: "current", value: `[${current.join(", ")}]` },
        { name: "start", value: start },
        { name: "depth", value: depth },
        { name: "results count", value: results.length },
      ],
      note: {
        vi: `Lưu [${current.join(", ")}] vào result. Tổng cộng: ${results.length}.`,
        en: `Save [${current.join(", ")}] to result. Total so far: ${results.length}.`,
      },
    });

    for (let i = start; i < sorted.length; i++) {
      if (i > start && sorted[i] === sorted[i - 1]) {
        // Skip duplicate at same level
        steps.push({
          title: { vi: `Skip i=${i}: nums[${i}]=${sorted[i]} trùng nums[${i - 1}]`, en: `Skip i=${i}: nums[${i}]=${sorted[i]} == nums[${i - 1}]` },
          arr: sorted.map((_, idx) => (curIdx.includes(idx) ? 1 : 0)),
          sub: sorted.map(String),
          highlight: [i, i - 1],
          mark: curIdx,
          codeLines: [9, 10],
          vars: [
            { name: "i", value: i },
            { name: "start", value: start },
            { name: "nums[i]", value: sorted[i] },
            { name: "nums[i-1]", value: sorted[i - 1] },
            { name: "skip", value: "duplicate at same level" },
          ],
          note: {
            vi: `i=${i} > start=${start} và nums[${i}]=${sorted[i]} == nums[${i - 1}] → skip để tránh trùng tập con.`,
            en: `i=${i} > start=${start} and nums[${i}]=${sorted[i]} == nums[${i - 1}] → skip to avoid duplicate subset.`,
          },
        });
        continue;
      }

      const val = sorted[i];
      current.push(val);
      const newCurIdx = [...curIdx, i];

      steps.push({
        title: { vi: `Thêm nums[${i}] = ${val}`, en: `Add nums[${i}] = ${val}` },
        arr: sorted.map((_, idx) => (newCurIdx.includes(idx) ? 1 : 0)),
        sub: sorted.map(String),
        highlight: [i],
        mark: curIdx,
        codeLines: [11, 12, 13],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: val },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Thêm ${val} (index ${i}) vào current → đệ quy với start = ${i + 1}.`,
          en: `Add ${val} (index ${i}) to current → recurse with start = ${i + 1}.`,
        },
      });

      backtrack(i + 1, depth + 1);

      const popped = current.pop();
      steps.push({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        arr: sorted.map((_, idx) => (curIdx.includes(idx) ? 1 : 0)),
        sub: sorted.map(String),
        highlight: [],
        mark: curIdx,
        codeLines: [14],
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Bỏ ${popped} khỏi current để thử nhánh khác.`,
          en: `Remove ${popped} from current to try another branch.`,
        },
      });
    }
  }

  backtrack(0, 0);

  steps.push({
    title: { vi: `Kết quả: ${results.length} tập con`, en: `Result: ${results.length} subsets` },
    arr: sorted.map(() => 0),
    sub: sorted.map(String),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16, 17],
    vars: [
      { name: "total", value: results.length },
      { name: "all subsets", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} tập con (đã loại trùng).\nDanh sách: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
      en: `Total ${results.length} subsets (no duplicates).\nList: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
    },
  });

  return { original: [...nums], answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 46: Permutations.
 * Backtracking with used[] array — order matters, use all elements.
 */
function buildSteps46(nums) {
  const steps = [];
  const current = [];
  const results = [];
  const used = new Array(nums.length).fill(false);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: nums.map(() => 0),
    sub: nums.map(String),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "nums", value: `[${nums.join(", ")}]` },
      { name: "current", value: "[]" },
      { name: "used", value: used.map((u) => (u ? "T" : "F")).join("") },
    ],
    note: {
      vi:
        `Tìm TẤT CẢ hoán vị của [${nums.join(", ")}].\n` +
        `Khác Subsets: ở đây THỨ TỰ quan trọng, mỗi hoán vị có ĐỦ n phần tử.\n` +
        `Dùng used[] để đánh dấu phần tử đã chọn (tránh dùng lại).`,
      en:
        `Find ALL permutations of [${nums.join(", ")}].\n` +
        `Unlike Subsets: ORDER matters here, each permutation uses ALL n elements.\n` +
        `Use used[] to mark chosen elements (prevent reuse).`,
    },
  });

  function backtrack() {
    if (current.length === nums.length) {
      results.push([...current]);
      steps.push({
        title: { vi: `✓ Hoán vị: [${current.join(", ")}]`, en: `✓ Permutation: [${current.join(", ")}]` },
        arr: nums.map((_, i) => (used[i] ? 1 : 0)),
        sub: nums.map(String),
        highlight: [],
        mark: nums.map((_, i) => i),
        codeLines: [8, 9, 10],
        vars: [
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "count", value: results.length },
        ],
        note: {
          vi: `len(current) == ${nums.length} → lưu [${current.join(", ")}]. Tổng: ${results.length} hoán vị.`,
          en: `len(current) == ${nums.length} → save [${current.join(", ")}]. Total: ${results.length} permutations.`,
        },
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;

      used[i] = true;
      current.push(nums[i]);

      steps.push({
        title: { vi: `Chọn nums[${i}] = ${nums[i]}`, en: `Pick nums[${i}] = ${nums[i]}` },
        arr: nums.map((_, j) => (used[j] ? 1 : 0)),
        sub: nums.map(String),
        highlight: [i],
        mark: [],
        codeLines: [11, 12, 13, 14, 15, 16],
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "used", value: used.map((u) => (u ? "T" : "F")).join("") },
        ],
        note: {
          vi: `nums[${i}]=${nums[i]} chưa dùng → chọn. current = [${current.join(", ")}].`,
          en: `nums[${i}]=${nums[i]} not used → pick. current = [${current.join(", ")}].`,
        },
      });

      backtrack();

      current.pop();
      used[i] = false;

      steps.push({
        title: { vi: `Quay lui: bỏ ${nums[i]}`, en: `Backtrack: pop ${nums[i]}` },
        arr: nums.map((_, j) => (used[j] ? 1 : 0)),
        sub: nums.map(String),
        highlight: [],
        mark: [],
        codeLines: [17, 18],
        vars: [
          { name: "popped", value: nums[i] },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "used", value: used.map((u) => (u ? "T" : "F")).join("") },
        ],
        note: {
          vi: `Bỏ ${nums[i]}, used[${i}]=F. Thử phần tử tiếp theo.`,
          en: `Pop ${nums[i]}, used[${i}]=F. Try next element.`,
        },
      });
    }
  }

  backtrack();

  steps.push({
    title: { vi: `Kết quả: ${results.length} hoán vị`, en: `Result: ${results.length} permutations` },
    arr: nums.map(() => 0),
    sub: nums.map(String),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [20, 21],
    vars: [
      { name: "total", value: `${nums.length}! = ${results.length}` },
      { name: "all", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} = ${nums.length}! hoán vị.\n${results.map((r) => `[${r.join(",")}]`).join(", ")}`,
      en: `Total ${results.length} = ${nums.length}! permutations.\n${results.map((r) => `[${r.join(",")}]`).join(", ")}`,
    },
  });

  return { original: [...nums], answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 39: Combination Sum.
 * Backtracking with reusable candidates: recurse with start = i (not i+1).
 */
function buildSteps39(nums, params) {
  const target = params.target;
  const candidates = [...nums];
  const steps = [];
  const current = [];
  const results = [];

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: candidates.map(() => 0),
    sub: candidates.map(String),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 16],
    vars: [
      { name: "candidates", value: `[${candidates.join(", ")}]` },
      { name: "target", value: target },
      { name: "current", value: "[]" },
      { name: "remain", value: target },
    ],
    note: {
      vi: `Tìm tất cả tổ hợp candidates có tổng = ${target}. Mỗi candidate có thể dùng nhiều lần.\nremain = target - sum(current). Đệ quy với start = i (cho phép dùng lại).`,
      en: `Find all combinations of candidates summing to ${target}. Each candidate can be reused.\nremain = target - sum(current). Recurse with start = i (allow reuse).`,
    },
  });

  function backtrack(start, remain, depth) {
    if (remain === 0) {
      results.push([...current]);
      steps.push({
        title: { vi: `✓ Tổng = ${target}: [${current.join(", ")}]`, en: `✓ Sum = ${target}: [${current.join(", ")}]` },
        arr: candidates.map(() => 0),
        sub: candidates.map(String),
        highlight: [],
        mark: [],
        codeLines: [6, 7, 8],
        vars: [
          { name: "remain", value: 0 },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "sum", value: current.reduce((a, b) => a + b, 0) },
          { name: "results count", value: results.length },
        ],
        note: {
          vi: `remain = 0 → lưu [${current.join(", ")}] vào result. Tổng cộng: ${results.length}.`,
          en: `remain = 0 → save [${current.join(", ")}] to result. Total so far: ${results.length}.`,
        },
      });
      return;
    }

    if (remain < 0) {
      steps.push({
        title: { vi: `✗ Vượt quá: remain = ${remain}`, en: `✗ Overshoot: remain = ${remain}` },
        arr: candidates.map(() => 0),
        sub: candidates.map(String),
        highlight: [],
        mark: [],
        codeLines: [9, 10],
        vars: [
          { name: "remain", value: remain },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "sum", value: current.reduce((a, b) => a + b, 0) },
        ],
        note: {
          vi: `remain = ${remain} < 0 → tổng vượt quá target. Quay lui.`,
          en: `remain = ${remain} < 0 → sum overshoots target. Backtrack.`,
        },
      });
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      const val = candidates[i];
      current.push(val);
      const newRemain = remain - val;
      const curSum = current.reduce((a, b) => a + b, 0);

      steps.push({
        title: { vi: `Thêm ${val}: current = [${current.join(", ")}], remain = ${newRemain}`, en: `Add ${val}: current = [${current.join(", ")}], remain = ${newRemain}` },
        arr: candidates.map((_, idx) => (idx === i ? 1 : 0)),
        sub: candidates.map(String),
        highlight: [i],
        mark: [],
        codeLines: [11, 12, 13],
        vars: [
          { name: "i", value: i },
          { name: "candidate", value: val },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "sum", value: curSum },
          { name: "remain", value: newRemain },
        ],
        note: {
          vi: `Chọn candidates[${i}] = ${val} → current = [${current.join(", ")}]. Đệ quy với start = ${i} (dùng lại được).`,
          en: `Pick candidates[${i}] = ${val} → current = [${current.join(", ")}]. Recurse with start = ${i} (reuse allowed).`,
        },
      });

      backtrack(i, newRemain, depth + 1);

      const popped = current.pop();
      const remainAfterPop = remain;
      steps.push({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        arr: candidates.map(() => 0),
        sub: candidates.map(String),
        highlight: [],
        mark: [],
        codeLines: [14],
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "remain", value: remainAfterPop },
        ],
        note: {
          vi: `Bỏ ${popped} khỏi current. Thử candidate tiếp theo (i + 1).`,
          en: `Remove ${popped} from current. Try next candidate (i + 1).`,
        },
      });
    }
  }

  backtrack(0, target, 0);

  steps.push({
    title: { vi: `Kết quả: ${results.length} tổ hợp`, en: `Result: ${results.length} combinations` },
    arr: candidates.map(() => 0),
    sub: candidates.map(String),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16, 17],
    vars: [
      { name: "total", value: results.length },
      { name: "all combinations", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} tổ hợp có tổng = ${target}.\nDanh sách: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
      en: `Total ${results.length} combinations summing to ${target}.\nList: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
    },
  });

  return { original: [...nums], target, answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 40: Combination Sum II.
 * Sort + backtracking; skip duplicate at same level; each element used once (start = i+1).
 */
function buildSteps40(nums, params) {
  const target = params.target;
  const sorted = [...nums].sort((a, b) => a - b);
  const steps = [];
  const current = [];
  const results = [];

  steps.push({
    title: { vi: "Sắp xếp + Khởi tạo", en: "Sort + Initialize" },
    arr: sorted.map(() => 0),
    sub: sorted.map(String),
    highlight: sorted.map((_, i) => i),
    mark: [],
    codeLines: [3, 4, 5],
    vars: [
      { name: "sorted", value: `[${sorted.join(", ")}]` },
      { name: "target", value: target },
      { name: "current", value: "[]" },
      { name: "remain", value: target },
    ],
    note: {
      vi:
        `Sắp xếp candidates = [${sorted.join(", ")}].\n` +
        `Giống bài 39 nhưng: mỗi phần tử dùng 1 LẦN (start=i+1) + skip duplicate ở cùng level.`,
      en:
        `Sort candidates = [${sorted.join(", ")}].\n` +
        `Like 39 but: each element used ONCE (start=i+1) + skip duplicates at same level.`,
    },
  });

  function backtrack(start, remain) {
    if (remain === 0) {
      results.push([...current]);
      steps.push({
        title: { vi: `✓ Tổng = ${target}: [${current.join(", ")}]`, en: `✓ Sum = ${target}: [${current.join(", ")}]` },
        arr: sorted.map(() => 0),
        sub: sorted.map(String),
        highlight: [],
        mark: [],
        codeLines: [8, 9],
        vars: [
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "count", value: results.length },
        ],
        note: {
          vi: `remain = 0 → lưu [${current.join(", ")}]. Tổng: ${results.length}.`,
          en: `remain = 0 → save [${current.join(", ")}]. Total: ${results.length}.`,
        },
      });
      return;
    }

    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remain) break; // pruning

      if (i > start && sorted[i] === sorted[i - 1]) {
        // Skip duplicate at same level
        if (steps.length < 60) {
          steps.push({
            title: { vi: `Skip: sorted[${i}]=${sorted[i]} trùng`, en: `Skip: sorted[${i}]=${sorted[i]} duplicate` },
            arr: sorted.map(() => 0),
            sub: sorted.map(String),
            highlight: [i, i - 1],
            mark: [],
            codeLines: [12, 13],
            vars: [
              { name: "i", value: i },
              { name: "start", value: start },
              { name: "sorted[i]", value: sorted[i] },
              { name: "skip reason", value: `i > start AND sorted[${i}] == sorted[${i - 1}]` },
            ],
            note: {
              vi: `sorted[${i}]=${sorted[i]} == sorted[${i - 1}] và i > start → skip tránh trùng.`,
              en: `sorted[${i}]=${sorted[i]} == sorted[${i - 1}] and i > start → skip to avoid duplicate.`,
            },
          });
        }
        continue;
      }

      current.push(sorted[i]);
      const newRemain = remain - sorted[i];

      if (steps.length < 60) {
        steps.push({
          title: { vi: `Chọn sorted[${i}]=${sorted[i]}, remain=${newRemain}`, en: `Pick sorted[${i}]=${sorted[i]}, remain=${newRemain}` },
          arr: sorted.map((_, j) => (j === i ? 1 : 0)),
          sub: sorted.map(String),
          highlight: [i],
          mark: [],
          codeLines: [14, 16, 17],
          vars: [
            { name: "i", value: i },
            { name: "sorted[i]", value: sorted[i] },
            { name: "current", value: `[${current.join(", ")}]` },
            { name: "remain", value: newRemain },
          ],
          note: {
            vi: `Chọn ${sorted[i]} → current=[${current.join(", ")}], remain=${newRemain}. Đệ quy start=${i + 1} (dùng 1 lần).`,
            en: `Pick ${sorted[i]} → current=[${current.join(", ")}], remain=${newRemain}. Recurse start=${i + 1} (use once).`,
          },
        });
      }

      backtrack(i + 1, newRemain);

      current.pop();
      if (steps.length < 60) {
        steps.push({
          title: { vi: `Quay lui: bỏ ${sorted[i]}`, en: `Backtrack: pop ${sorted[i]}` },
          arr: sorted.map(() => 0),
          sub: sorted.map(String),
          highlight: [],
          mark: [],
          codeLines: [18],
          vars: [
            { name: "popped", value: sorted[i] },
            { name: "current", value: `[${current.join(", ")}]` },
            { name: "remain", value: remain },
          ],
          note: {
            vi: `Bỏ ${sorted[i]}, quay lui. Thử phần tử tiếp theo.`,
            en: `Pop ${sorted[i]}, backtrack. Try next element.`,
          },
        });
      }
    }
  }

  backtrack(0, target);

  steps.push({
    title: { vi: `Kết quả: ${results.length} tổ hợp`, en: `Result: ${results.length} combinations` },
    arr: sorted.map(() => 0),
    sub: sorted.map(String),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [20, 21],
    vars: [
      { name: "total", value: results.length },
      { name: "all", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} tổ hợp có tổng = ${target}.\n${results.map((r) => `[${r.join(",")}]`).join(", ")}`,
      en: `Total ${results.length} combinations summing to ${target}.\n${results.map((r) => `[${r.join(",")}]`).join(", ")}`,
    },
  });

  return { original: [...nums], target, answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 17: Letter Combinations of a Phone Number.
 * Backtracking on phone keypad mapping. Each digit position is a recursion level.
 */
function buildSteps17(input) {
  const digits = String(input);
  const steps = [];
  const mapping = { "2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz" };

  if (digits.length === 0) {
    steps.push({
      title: { vi: "if not digits → True", en: "if not digits -> True" },
      arr: [],
      highlight: [],
      mark: [],
      codeLines: [3],
      vars: [{ name: "digits", value: '""' }, { name: "condition", value: true }],
      note: { vi: "digits rỗng nên điều kiện đúng.", en: "digits is empty, so the condition is true." },
    });
    steps.push({
      title: { vi: "return []", en: "return []" },
      arr: [],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [4],
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "Trả về danh sách rỗng ngay.", en: "Return an empty list immediately." },
    });
    return { digits, answer: 0, steps };
  }

  const results = [];
  const current = [];
  const callStack = [];
  const digitList = digits.split("");
  const mapStr = digitList.map((digit) => `${digit}→"${mapping[digit] || "?"}"`).join(", ");
  const phoneCells = (focusIdx = -1, complete = false) => [digitList.map((digit, index) => {
    const selected = current[index];
    let cls = selected ? "phone-selected" : "empty";
    if (index === focusIdx) cls = "current";
    if (complete && selected) cls = "path";
    return {
      label: selected || mapping[digit] || "?",
      meta: `idx=${index} · ${digit}`,
      cls,
    };
  })];
  const pushStep = ({ title, idx = -1, focusIdx = idx, codeLines, vars = [], note, final = false, complete = false }) => {
    const persistentNames = new Set(["idx", "current", "call stack", "result count", "results so far"]);
    const extraVars = vars.filter(({ name }) => !persistentNames.has(name));
    steps.push({
      title,
      bfsGrid: {
        rows: 1,
        cols: digitList.length,
        cells: phoneCells(focusIdx, complete),
        variant: "phone-path",
      },
      highlight: [],
      mark: [],
      final,
      codeLines,
      vars: [
        { name: "idx", value: idx >= 0 ? idx : "-" },
        { name: "current", value: `"${current.join("")}"` },
        { name: "call stack", value: callStack.join(" → ") || "empty" },
        { name: "result count", value: results.length },
        { name: "results so far", value: results.join(", ") || "none" },
        ...extraVars,
      ],
      note,
    });
  };

  pushStep({
    title: { vi: "if not digits → False", en: "if not digits -> False" },
    codeLines: [3],
    vars: [{ name: "digits", value: `"${digits}"` }, { name: "condition", value: false }],
    note: { vi: `digits="${digits}" không rỗng nên tiếp tục.`, en: `digits="${digits}" is not empty, so continue.` },
  });
  pushStep({
    title: { vi: "Tạo mapping", en: "Create mapping" },
    codeLines: [5, 6],
    vars: [{ name: "digits", value: `"${digits}"` }, { name: "mapping", value: mapStr }],
    note: { vi: `Ánh xạ cần dùng: ${mapStr}.`, en: `Required mapping: ${mapStr}.` },
  });
  pushStep({
    title: { vi: "result = []", en: "result = []" },
    codeLines: [7],
    vars: [{ name: "result", value: "[]" }],
    note: { vi: "Khởi tạo danh sách chứa các tổ hợp hoàn chỉnh.", en: "Initialize the list of complete combinations." },
  });
  pushStep({
    title: { vi: "current = []", en: "current = []" },
    codeLines: [8],
    vars: [{ name: "current", value: "[]" }],
    note: { vi: "current giữ đường đi đang xây dựng.", en: "current stores the path currently being built." },
  });
  pushStep({
    title: { vi: "Gọi backtrack(0)", en: "Call backtrack(0)" },
    idx: 0,
    codeLines: [19],
    vars: [
      { name: "digits", value: digits },
      { name: "next call", value: "backtrack(0)" },
    ],
    note: {
      vi: "Bắt đầu cây đệ quy tại digit index 0.",
      en: "Start the recursion tree at digit index 0.",
    },
  });

  function backtrack(idx) {
    callStack.push(`backtrack(${idx})`);
    pushStep({
      title: { vi: `Vào backtrack(${idx})`, en: `Enter backtrack(${idx})` },
      idx,
      focusIdx: Math.min(idx, digitList.length - 1),
      codeLines: [10],
      vars: [{ name: "depth", value: callStack.length - 1 }],
      note: {
        vi: `Đẩy backtrack(${idx}) vào call stack.`,
        en: `Push backtrack(${idx}) onto the call stack.`,
      },
    });

    const atEnd = idx === digits.length;
    pushStep({
      title: { vi: `idx == len(digits) → ${atEnd}`, en: `idx == len(digits) -> ${atEnd}` },
      idx,
      focusIdx: Math.min(idx, digitList.length - 1),
      codeLines: [11],
      vars: [
        { name: "len(digits)", value: digits.length },
        { name: "condition", value: atEnd },
      ],
      note: atEnd
        ? { vi: "Đã chọn đủ ký tự, current là một kết quả hoàn chỉnh.", en: "All positions are selected; current is a complete result." }
        : { vi: `Còn digit tại idx=${idx}, tiếp tục tạo nhánh.`, en: `A digit remains at idx=${idx}; continue branching.` },
    });

    if (atEnd) {
      const combo = current.join("");
      results.push(combo);
      pushStep({
        title: { vi: `Lưu "${combo}"`, en: `Save "${combo}"` },
        idx,
        focusIdx: digitList.length - 1,
        complete: true,
        codeLines: [12],
        vars: [{ name: "new result", value: `"${combo}"` }],
        note: {
          vi: `Thêm "${combo}" vào result. Hiện có ${results.length} kết quả.`,
          en: `Append "${combo}" to result. There are now ${results.length} results.`,
        },
      });

      pushStep({
        title: { vi: `return từ backtrack(${idx})`, en: `Return from backtrack(${idx})` },
        idx,
        focusIdx: digitList.length - 1,
        complete: true,
        codeLines: [13],
        vars: [{ name: "return to", value: callStack.at(-2) || "letterCombinations" }],
        note: {
          vi: "Kết thúc nhánh hoàn chỉnh và quay lại lời gọi trước.",
          en: "Finish this complete branch and return to the previous call.",
        },
      });
      callStack.pop();
      return;
    }

    const letters = mapping[digits[idx]] || "";
    for (const letter of letters) {
      pushStep({
        title: { vi: `for letter = '${letter}'`, en: `for letter = '${letter}'` },
        idx,
        codeLines: [14],
        vars: [
          { name: "digit", value: digits[idx] },
          { name: "letters", value: `"${letters}"` },
          { name: "letter", value: `'${letter}'` },
        ],
        note: {
          vi: `Tại idx=${idx}, thử '${letter}' trong mapping['${digits[idx]}']="${letters}".`,
          en: `At idx=${idx}, try '${letter}' from mapping['${digits[idx]}']="${letters}".`,
        },
      });

      current.push(letter);
      pushStep({
        title: { vi: `current.append('${letter}')`, en: `current.append('${letter}')` },
        idx,
        codeLines: [15],
        vars: [{ name: "letter", value: `'${letter}'` }],
        note: {
          vi: `Thêm '${letter}': current trở thành "${current.join("")}".`,
          en: `Append '${letter}': current becomes "${current.join("")}".`,
        },
      });

      pushStep({
        title: { vi: `Gọi backtrack(${idx + 1})`, en: `Call backtrack(${idx + 1})` },
        idx,
        codeLines: [16],
        vars: [{ name: "next call", value: `backtrack(${idx + 1})` }],
        note: {
          vi: `Giữ current="${current.join("")}" và đi tới digit kế tiếp.`,
          en: `Keep current="${current.join("")}" and move to the next digit.`,
        },
      });
      backtrack(idx + 1);

      const removed = current.pop();
      pushStep({
        title: { vi: `current.pop() → '${removed}'`, en: `current.pop() -> '${removed}'` },
        idx,
        codeLines: [17],
        vars: [{ name: "removed", value: `'${removed}'` }, { name: "try next", value: "letter" }],
        note: {
          vi: `Quay lui: bỏ '${removed}', current trở lại "${current.join("")}" để thử letter tiếp theo.`,
          en: `Backtrack: remove '${removed}', restoring current="${current.join("")}" before trying the next letter.`,
        },
      });
    }
    callStack.pop();
  }

  backtrack(0);

  pushStep({
    title: { vi: `Kết quả: ${results.length} tổ hợp`, en: `Result: ${results.length} combinations` },
    final: true,
    codeLines: [20],
    vars: [
      { name: "total", value: results.length },
      { name: "all", value: results.join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} tổ hợp:\n${results.join(", ")}`,
      en: `Total ${results.length} combinations:\n${results.join(", ")}`,
    },
  });

  return { digits, answer: results.length, steps };
}

/**
 * Generate steps for LeetCode 784: Letter Case Permutation.
 * At each letter position: branch into lowercase and uppercase.
 * Digits are kept unchanged (no branching).
 */
function buildSteps784(input) {
  const s = String(input);
  const steps = [];
  const results = [];
  const current = s.split("");

  const letterCount = s.split("").filter((c) => /[a-zA-Z]/.test(c)).length;

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: current.map(() => 0),
    sub: [...current],
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "s", value: s },
      { name: "letters", value: letterCount },
      { name: "total combos", value: Math.pow(2, letterCount) },
    ],
    note: {
      vi:
        `s = "${s}". Có ${letterCount} chữ cái → 2^${letterCount} = ${Math.pow(2, letterCount)} kết quả.\n` +
        `Tại mỗi chữ cái: 2 nhánh (hoa/thường). Chữ số: giữ nguyên.`,
      en:
        `s = "${s}". Has ${letterCount} letters → 2^${letterCount} = ${Math.pow(2, letterCount)} results.\n` +
        `At each letter: 2 branches (upper/lower). Digits: keep unchanged.`,
    },
  });

  function backtrack(idx) {
    if (idx === s.length) {
      results.push(current.join(""));
      steps.push({
        title: { vi: `✓ "${current.join("")}"`, en: `✓ "${current.join("")}"` },
        arr: current.map(() => 1),
        sub: [...current],
        highlight: [],
        mark: current.map((_, i) => i),
        codeLines: [7, 8],
        vars: [
          { name: "result", value: current.join("") },
          { name: "count", value: results.length },
        ],
        note: {
          vi: `Hết chuỗi → lưu "${current.join("")}". Tổng: ${results.length}.`,
          en: `End of string → save "${current.join("")}". Total: ${results.length}.`,
        },
      });
      return;
    }

    if (/\d/.test(current[idx])) {
      // Digit: no branching, just move on
      steps.push({
        title: { vi: `idx=${idx}: '${current[idx]}' là số → giữ nguyên`, en: `idx=${idx}: '${current[idx]}' is digit → keep` },
        arr: current.map((_, i) => (i <= idx ? 1 : 0)),
        sub: [...current],
        highlight: [idx],
        mark: [],
        codeLines: [10, 11],
        vars: [
          { name: "idx", value: idx },
          { name: "char", value: current[idx] },
          { name: "type", value: "digit → skip (no branch)" },
        ],
        note: {
          vi: `'${current[idx]}' là chữ số → không phân nhánh, tiến sang idx=${idx + 1}.`,
          en: `'${current[idx]}' is a digit → no branching, move to idx=${idx + 1}.`,
        },
      });
      backtrack(idx + 1);
    } else {
      // Letter: branch lower then upper
      current[idx] = current[idx].toLowerCase();
      steps.push({
        title: { vi: `idx=${idx}: thử '${current[idx]}' (thường)`, en: `idx=${idx}: try '${current[idx]}' (lower)` },
        arr: current.map((_, i) => (i <= idx ? 1 : 0)),
        sub: [...current],
        highlight: [idx],
        mark: [],
        codeLines: [13, 14],
        vars: [
          { name: "idx", value: idx },
          { name: "branch", value: `lowercase '${current[idx]}'` },
          { name: "current", value: `"${current.join("")}"` },
        ],
        note: {
          vi: `Nhánh 1: '${current[idx]}' (thường). Đệ quy idx=${idx + 1}.`,
          en: `Branch 1: '${current[idx]}' (lower). Recurse idx=${idx + 1}.`,
        },
      });
      backtrack(idx + 1);

      current[idx] = current[idx].toUpperCase();
      steps.push({
        title: { vi: `idx=${idx}: thử '${current[idx]}' (hoa)`, en: `idx=${idx}: try '${current[idx]}' (upper)` },
        arr: current.map((_, i) => (i <= idx ? 1 : 0)),
        sub: [...current],
        highlight: [idx],
        mark: [],
        codeLines: [15, 16],
        vars: [
          { name: "idx", value: idx },
          { name: "branch", value: `uppercase '${current[idx]}'` },
          { name: "current", value: `"${current.join("")}"` },
        ],
        note: {
          vi: `Nhánh 2: '${current[idx]}' (hoa). Đệ quy idx=${idx + 1}.`,
          en: `Branch 2: '${current[idx]}' (upper). Recurse idx=${idx + 1}.`,
        },
      });
      backtrack(idx + 1);
    }
  }

  backtrack(0);

  steps.push({
    title: { vi: `Kết quả: ${results.length}`, en: `Result: ${results.length}` },
    arr: current.map(() => 0),
    sub: s.split(""),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [18, 19],
    vars: [
      { name: "total", value: results.length },
      { name: "all", value: results.join(", ") },
    ],
    note: {
      vi: `Tổng ${results.length} = 2^${letterCount} kết quả:\n${results.join(", ")}`,
      en: `Total ${results.length} = 2^${letterCount} results:\n${results.join(", ")}`,
    },
  });

  return { s, answer: results.length, steps };
}

/**
 * LeetCode 980: Unique Paths III.
 *
 * DFS + backtracking on a grid:
 *   1  = start   (exactly one)
 *   2  = end     (exactly one)
 *   0  = walkable empty cell
 *   -1 = obstacle
 *
 * Count all paths from the start to the end that walk over EVERY non-obstacle
 * cell exactly once (start and end included). A path is a sequence of 4-way
 * neighbor moves that never revisits a cell.
 *
 * The visualization steps through the DFS:
 *   - Highlight the current cell being tried.
 *   - Mark visited cells so you can see the frontier growing.
 *   - When a valid path is completed, flash the whole path green.
 *   - On backtrack, un-mark the last cell.
 */
function buildSteps980(input) {
  // Parse grid: rows separated by |, cells by comma. Accept 1/2/0/-1.
  const rawRows = String(input || "").split("|").map((r) => r.trim()).filter(Boolean);
  const grid = rawRows.map((row) =>
    row.split(",").map((s) => {
      const n = Number(s.trim());
      return Number.isFinite(n) ? n : 0;
    })
  );
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  const steps = [];

  // Basic validation
  if (
    rows === 0 ||
    cols === 0 ||
    grid.some((row) => row.length !== cols) ||
    grid.flat().filter((v) => v === 1).length !== 1 ||
    grid.flat().filter((v) => v === 2).length !== 1
  ) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, cells: [[{ label: "!", cls: "current" }]] },
      final: true,
      codeLines: [3, 4, 5],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: "Grid phải là chữ nhật, có đúng 1 ô '1' (start) và 1 ô '2' (end). Ví dụ: 1,0,0,0|0,0,0,0|0,0,2,-1",
        en: "Grid must be rectangular with exactly one '1' (start) and one '2' (end). Example: 1,0,0,0|0,0,0,0|0,0,2,-1",
      },
    });
    return { original: grid, answer: 0, steps };
  }

  // Locate start/end and count walkable cells (0/1/2)
  let startR = 0, startC = 0, endR = 0, endC = 0;
  let remaining = 0; // cells we still need to step on
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r][c];
      if (v === 1) { startR = r; startC = c; }
      if (v === 2) { endR = r; endC = c; }
      if (v !== -1) remaining += 1;
    }
  }

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  function cellLabel(r, c) {
    const v = grid[r][c];
    if (r === startR && c === startC) return "S";
    if (r === endR && c === endC) return "E";
    if (v === -1) return "■";
    return "";
  }

  function makeCells(currentR, currentC, pathCells) {
    const pathSet = new Set((pathCells || []).map(([r, c]) => `${r},${c}`));
    return grid.map((row, r) =>
      row.map((v, c) => {
        let cls;
        if (v === -1) cls = "wall";
        else if (pathSet.has(`${r},${c}`)) cls = "path";
        else if (r === currentR && c === currentC) cls = "current";
        else if (visited[r][c]) cls = "visited";
        else if (r === startR && c === startC) cls = "start";
        else if (r === endR && c === endC) cls = "end";
        else cls = "empty";
        return { label: cellLabel(r, c), cls };
      })
    );
  }

  const STEP_LIMIT = 80;
  let pathCount = 0;
  let truncated = false;

  function pushStep(opts) {
    if (steps.length >= STEP_LIMIT) {
      truncated = true;
      return false;
    }
    steps.push({
      title: opts.title,
      arr: [],
      bfsGrid: { rows, cols, cells: opts.cells },
      highlight: [],
      mark: [],
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
    return true;
  }

  pushStep({
    title: { vi: "Khởi tạo", en: "Initialize" },
    cells: makeCells(startR, startC, null),
    codeLines: [3, 4, 5, 6],
    vars: [
      { name: "start", value: `(${startR},${startC})` },
      { name: "end", value: `(${endR},${endC})` },
      { name: "cells to walk", value: remaining },
      { name: "paths found", value: 0 },
    ],
    note: {
      vi:
        `Cần đi từ S (start=(${startR},${startC})) đến E (end=(${endR},${endC})) đi qua ĐÚNG một lần ` +
        `mỗi ô không phải chướng ngại. Có ${remaining} ô phải bước lên (kể cả S và E). ` +
        `Thuật toán: DFS + backtrack.`,
      en:
        `We must walk from S (start=(${startR},${startC})) to E (end=(${endR},${endC})) crossing EVERY ` +
        `non-obstacle cell exactly once. There are ${remaining} cells to walk on (including S and E). ` +
        `Algorithm: DFS + backtracking.`,
    },
  });

  const path = []; // stack of [r, c]

  function dfs(r, c, remain) {
    // Enter cell
    visited[r][c] = true;
    path.push([r, c]);
    const remainAfter = remain - 1;

    // If we're on the end cell:
    if (r === endR && c === endC) {
      if (remainAfter === 0) {
        pathCount += 1;
        pushStep({
          title: { vi: `✓ Tìm thấy đường đi (path #${pathCount})`, en: `✓ Found valid path (#${pathCount})` },
          cells: makeCells(r, c, [...path]),
          codeLines: [10, 11, 12],
          vars: [
            { name: "at", value: `(${r},${c})` },
            { name: "remain", value: remainAfter },
            { name: "paths found", value: pathCount },
          ],
          note: {
            vi: `Đến E với remain=0 → đây là một đường đi hợp lệ. Tổng số đường tìm được: ${pathCount}.`,
            en: `Reached E with remain=0 → this is a valid path. Total paths so far: ${pathCount}.`,
          },
        });
      } else {
        pushStep({
          title: { vi: `Đến E sớm (còn ${remainAfter} ô chưa đi)`, en: `Reached E too early (${remainAfter} cells left)` },
          cells: makeCells(r, c, null),
          codeLines: [10, 13],
          vars: [
            { name: "at", value: `(${r},${c})` },
            { name: "remain", value: remainAfter },
          ],
          note: {
            vi: `Đến E nhưng vẫn còn ${remainAfter} ô chưa bước qua → không hợp lệ, backtrack.`,
            en: `Reached E but ${remainAfter} cells are still un-walked → invalid, backtrack.`,
          },
        });
      }
      // Undo and return either way
      visited[r][c] = false;
      path.pop();
      return;
    }

    // Otherwise: recurse in 4 directions
    pushStep({
      title: { vi: `Vào ô (${r},${c})`, en: `Enter cell (${r},${c})` },
      cells: makeCells(r, c, null),
      codeLines: [14, 15, 16],
      vars: [
        { name: "at", value: `(${r},${c})` },
        { name: "remain", value: remainAfter },
        { name: "path length", value: path.length },
      ],
      note: {
        vi: `Bước lên (${r},${c}). Còn ${remainAfter} ô chưa đi. Thử 4 hướng.`,
        en: `Step onto (${r},${c}). ${remainAfter} cells still un-walked. Try 4 directions.`,
      },
    });

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] === -1) continue;
      if (visited[nr][nc]) continue;
      dfs(nr, nc, remainAfter);
    }

    // Backtrack
    visited[r][c] = false;
    path.pop();

    pushStep({
      title: { vi: `Backtrack khỏi (${r},${c})`, en: `Backtrack from (${r},${c})` },
      cells: makeCells(-1, -1, null),
      codeLines: [17, 18],
      vars: [
        { name: "backtrack", value: `(${r},${c})` },
        { name: "path length", value: path.length },
        { name: "paths found", value: pathCount },
      ],
      note: {
        vi: `Bỏ đánh dấu (${r},${c}), quay về ô trước để thử hướng khác.`,
        en: `Un-mark (${r},${c}) and return to the previous cell to try another direction.`,
      },
    });
  }

  dfs(startR, startC, remaining);

  // Result step
  steps.push({
    title: { vi: "Kết quả", en: "Result" },
    arr: [],
    bfsGrid: { rows, cols, cells: makeCells(-1, -1, null) },
    highlight: [],
    mark: [],
    final: true,
    codeLines: [19],
    vars: [
      { name: "unique paths", value: pathCount },
      ...(truncated ? [{ name: "note", value: "steps truncated to keep demo short" }] : []),
    ],
    note: {
      vi: truncated
        ? `Đã dừng render sau ${STEP_LIMIT} bước để trực quan hoá gọn gàng. Tổng số đường đi tìm thấy trong phần render: ${pathCount}.`
        : `Số đường đi duy nhất từ S đến E đi qua đúng mỗi ô một lần = ${pathCount}.`,
      en: truncated
        ? `Rendering stopped after ${STEP_LIMIT} steps to keep the demo short. Paths found within the rendered portion: ${pathCount}.`
        : `Unique paths from S to E that walk each cell exactly once = ${pathCount}.`,
    },
  });

  return { original: grid, answer: pathCount, steps };
}

/**
 * LeetCode 301: Remove Invalid Parentheses — BFS by removal count.
 * Process the string set level by level. The FIRST level containing any valid
 * string is the answer (fewest removals). Generate the next level by removing
 * one parenthesis at each position.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def removeInvalidParentheses(self, s):
 *  3          def is_valid(string):
 *  4              count = 0
 *  5              for ch in string:
 *  6                  if ch == '(': count += 1
 *  7                  elif ch == ')':
 *  8                      count -= 1
 *  9                      if count < 0: return False
 * 10              return count == 0
 * 11          level = {s}
 * 12          while level:
 * 13              valid = [x for x in level if is_valid(x)]
 * 14              if valid: return valid
 * 15              next_level = set()
 * 16              for string in level:
 * 17                  for i in range(len(string)):
 * 18                      if string[i] in '()':
 * 19                          next_level.add(string[:i] + string[i+1:])
 * 20              level = next_level
 * 21          return [""]
 */
function buildSteps301(input) {
  const s = String(input);
  const steps = [];

  // Encode string as char array for bar display
  function strToArr(str) {
    return str.split("").map((ch) => ch === "(" ? 1 : ch === ")" ? 2 : 3);
  }
  function strToSub(str) {
    return str.split("");
  }

  function isValid(str) {
    let count = 0;
    for (const ch of str) {
      if (ch === "(") count += 1;
      else if (ch === ")") {
        count -= 1;
        if (count < 0) return false;
      }
    }
    return count === 0;
  }

  // Compute min removals needed (count unmatched '(' and ')')
  function minRemovals(str) {
    let open = 0, close = 0;
    for (const ch of str) {
      if (ch === "(") {
        open += 1;
      } else if (ch === ")") {
        if (open > 0) open -= 1;
        else close += 1;
      }
    }
    return open + close;
  }

  const totalMin = minRemovals(s);
  const chars = s.split("");

  // ── Init step ─────────────────────────────────────────────────────
  steps.push({
    title: { vi: `Chuỗi gốc: "${s}"`, en: `Input string: "${s}"` },
    arr: strToArr(s),
    sub: strToSub(s),
    highlight: [], mark: [], final: false,
    codeLines: [3, 4, 5, 6, 7],
    vars: [
      { name: "s", value: `"${s}"` },
      { name: "length", value: s.length },
      { name: "min removals needed", value: totalMin },
    ],
    note: {
      vi:
        `Đếm nhanh: ${totalMin} ký tự dư thừa cần xóa. ` +
        `BFS mức 0 = chuỗi gốc; mức k = tập các chuỗi nhận được sau đúng k lần xóa. ` +
        `Mức đầu tiên có chuỗi HỢP LỆ chính là đáp án (dấu ( = cột thấp, ) = cột cao).`,
      en:
        `Quick count: ${totalMin} excess char(s) to remove. ` +
        `BFS level 0 = original; level k = all strings obtainable by exactly k removals. ` +
        `The first level with a VALID string is the answer. (( = low bar, ) = tall bar.)`,
    },
  });

  let level = new Set([s]);
  let removals = 0;

  while (level.size > 0) {
    const levelArr = [...level].sort();
    const valid = levelArr.filter(isValid);

    // ── Level overview ────────────────────────────────────────────────
    steps.push({
      title: { vi: `Level ${removals}: ${level.size} chuỗi (xóa ${removals} ký tự)`, en: `Level ${removals}: ${level.size} string(s) (${removals} removed)` },
      arr: strToArr(levelArr[0] || ""),
      sub: strToSub(levelArr[0] || ""),
      highlight: [], mark: [], final: false,
      codeLines: [8, 9, 10],
      vars: [
        { name: "removals", value: removals },
        { name: "# candidates", value: level.size },
        { name: "candidates (first 6)", value: levelArr.slice(0, 6).map((x) => `"${x}"`).join(", ") + (levelArr.length > 6 ? "…" : "") },
        { name: "# valid", value: valid.length },
      ],
      note: {
        vi: `Level ${removals}: kiểm tra is_valid cho ${level.size} chuỗi ứng viên. Tìm thấy ${valid.length} chuỗi hợp lệ.`,
        en: `Level ${removals}: check is_valid for ${level.size} candidate string(s). Found ${valid.length} valid string(s).`,
      },
    });

    // ── Per-candidate validity steps (show first 6 only to avoid explosion) ──
    const SHOW_LIMIT = 6;
    for (let ci = 0; ci < Math.min(levelArr.length, SHOW_LIMIT); ci++) {
      const cand = levelArr[ci];
      const ok = isValid(cand);
      // Highlight first invalid char if any
      let badIdx = -1;
      let cnt = 0;
      for (let i = 0; i < cand.length; i++) {
        if (cand[i] === "(") cnt++;
        else if (cand[i] === ")") {
          cnt--;
          if (cnt < 0) { badIdx = i; break; }
        }
      }
      if (!ok && badIdx < 0 && cnt !== 0) {
        // find last unmatched open
        badIdx = cand.lastIndexOf("(");
      }
      steps.push({
        title: ok
          ? { vi: `"${cand}" ✓ HỢP LỆ`, en: `"${cand}" ✓ VALID` }
          : { vi: `"${cand}" ✗ không hợp lệ`, en: `"${cand}" ✗ invalid` },
        arr: strToArr(cand),
        sub: strToSub(cand),
        highlight: badIdx >= 0 ? [badIdx] : [],
        mark: ok ? cand.split("").map((_, i) => i) : [],
        final: false,
        codeLines: [11, 12, 13, 14, 15],
        vars: [
          { name: "candidate", value: `"${cand}"` },
          { name: "is_valid", value: ok },
          { name: "balance at end", value: cnt >= 0 ? cnt : `went negative at [${badIdx}]` },
        ],
        note: ok
          ? { vi: `"${cand}" hợp lệ: tất cả dấu ngoặc đều khớp đôi và không bị âm.`, en: `"${cand}" is valid: all brackets are balanced and balance never goes negative.` }
          : badIdx >= 0
            ? { vi: `"${cand}" không hợp lệ: balance < 0 tại vị trí [${badIdx}] = '${cand[badIdx]}' (đánh dấu đỏ).`, en: `"${cand}" invalid: balance < 0 at index [${badIdx}] = '${cand[badIdx]}' (highlighted red).` }
            : { vi: `"${cand}" không hợp lệ: còn ${cnt} dấu '(' chưa khớp.`, en: `"${cand}" invalid: ${cnt} unmatched '(' remaining.` },
      });
    }
    if (levelArr.length > SHOW_LIMIT) {
      steps.push({
        title: { vi: `… và ${levelArr.length - SHOW_LIMIT} chuỗi khác`, en: `… and ${levelArr.length - SHOW_LIMIT} more` },
        arr: [], highlight: [], mark: [], final: false,
        codeLines: [11],
        vars: [{ name: "skipped", value: levelArr.length - SHOW_LIMIT }],
        note: {
          vi: `(Bỏ qua ${levelArr.length - SHOW_LIMIT} chuỗi còn lại để tránh quá nhiều bước.)`,
          en: `(Skipping ${levelArr.length - SHOW_LIMIT} remaining candidates to keep the step count manageable.)`,
        },
      });
    }

    if (valid.length > 0) {
      const answer = [...new Set(valid)].sort();
      steps.push({
        title: { vi: `Kết quả: ${answer.map((x) => `"${x}"`).join(", ")}`, en: `Result: ${answer.map((x) => `"${x}"`).join(", ")}` },
        arr: strToArr(answer[0]),
        sub: strToSub(answer[0]),
        highlight: [],
        mark: answer[0].split("").map((_, i) => i),
        final: true,
        codeLines: [16, 17],
        vars: [
          { name: "min removals", value: removals },
          { name: "answer", value: answer.map((x) => `"${x}"`).join(", ") },
        ],
        note: {
          vi: `Level ${removals} là mức ĐẦU TIÊN có chuỗi hợp lệ → xóa ít nhất ${removals} ký tự. Đáp án: [${answer.map((x) => `"${x}"`).join(", ")}].`,
          en: `Level ${removals} is the FIRST level with valid strings → minimum ${removals} removal(s). Answer: [${answer.map((x) => `"${x}"`).join(", ")}].`,
        },
      });
      return { original: s, answer, steps };
    }

    // Build next level
    const nextLevel = new Set();
    for (const str of levelArr) {
      for (let i = 0; i < str.length; i++) {
        if (str[i] === "(" || str[i] === ")") {
          nextLevel.add(str.slice(0, i) + str.slice(i + 1));
        }
      }
    }

    steps.push({
      title: { vi: `Không có hợp lệ → sinh level ${removals + 1}`, en: `None valid → build level ${removals + 1}` },
      arr: strToArr(s),
      sub: strToSub(s),
      highlight: [], mark: [], final: false,
      codeLines: [18, 19, 20, 21],
      vars: [
        { name: "current level", value: removals },
        { name: "next level size", value: nextLevel.size },
      ],
      note: {
        vi: `Chưa có chuỗi hợp lệ ở level ${removals}. Sinh level ${removals + 1}: mỗi chuỗi → xóa 1 '(' hoặc ')' tại từng vị trí. Set loại trùng → ${nextLevel.size} chuỗi ứng viên.`,
        en: `No valid string at level ${removals}. Build level ${removals + 1}: each string → remove one '(' or ')' at every index. Set deduplicates → ${nextLevel.size} candidates.`,
      },
    });

    level = nextLevel;
    removals += 1;
    if (removals > 6) break; // safety cap
  }

  const answer = [""];
  steps.push({
    title: { vi: `return [""]`, en: `return [""]` },
    arr: [], highlight: [], mark: [], final: true,
    codeLines: [22],
    vars: [{ name: "answer", value: '[""]' }],
    note: {
      vi: `Đã xóa hết ký tự mà không tìm được chuỗi hợp lệ → trả về [""].`,
      en: `Removed all characters without finding a valid string → return [""].`,
    },
  });
  return { original: s, answer, steps };
}

/**
 * LeetCode 282: Expression Add Operators — backtracking with +, -, *.
 * Track cur_val (running value) and last (last operand, signed) so that '*'
 * can undo the previous term and reapply: cur - last + last*operand.
 *
 * Code lines (1-indexed):
 *  1  class Solution:
 *  2      def addOperators(self, num, target):
 *  3          def bt(i, expr, cur, last):
 *  4              if i == len(num):
 *  5                  if cur == target: result.append(expr)
 *  6                  return
 *  7              for j in range(i, len(num)):
 *  8                  if j > i and num[i] == '0': break   # no leading zero
 *  9                  operand = int(num[i:j+1])
 * 10                  if i == 0: bt(j+1, operand_str, operand, operand)
 * 11                  else:
 * 12                      bt(j+1, expr+'+'+s, cur+operand, operand)
 * 13                      bt(j+1, expr+'-'+s, cur-operand, -operand)
 * 14                      bt(j+1, expr+'*'+s, cur-last+last*operand, last*operand)
 * 15          return result
 */
function buildSteps282(input, params) {
  const num = String(input);
  const target = params && params.target !== undefined ? Number(params.target) : 6;
  const n = num.length;
  const steps = [];
  const result = [];
  let guard = 0;

  function snap(opts) {
    steps.push({
      title: opts.title,
      arr: [],
      highlight: [], mark: [],
      final: opts.final || false,
      codeLines: opts.codeLines || [],
      vars: opts.vars || [],
      note: opts.note,
    });
  }

  snap({
    title: { vi: `Tìm biểu thức từ "${num}" = ${target}`, en: `Find expressions from "${num}" = ${target}` },
    codeLines: [2, 3],
    vars: [
      { name: "num", value: `"${num}"` },
      { name: "target", value: target },
    ],
    note: {
      vi:
        `Chèn +, -, * giữa các chữ số của "${num}" để biểu thức bằng ${target}.\n` +
        `Theo dõi cur (giá trị hiện tại) và last (số hạng cuối, có dấu).\n` +
        `Mẹo cho '*': cur - last + last*operand (hoàn tác số hạng cuối rồi nhân).\n` +
        `Không cho số nhiều chữ số bắt đầu bằng '0'.`,
      en:
        `Insert +, -, * between digits of "${num}" so the expression equals ${target}.\n` +
        `Track cur (running value) and last (last operand, signed).\n` +
        `Trick for '*': cur - last + last*operand (undo the last term, then multiply).\n` +
        `No multi-digit operand may start with '0'.`,
    },
  });

  function bt(i, expr, cur, last, depth) {
    if (guard > 300) return;
    guard += 1;

    if (i === n) {
      const hit = cur === target;
      if (hit) result.push(expr);
      if (guard <= 80) {
        snap({
          title: { vi: `"${expr}" = ${cur} ${hit ? `== ${target} ✓` : `≠ ${target}`}`, en: `"${expr}" = ${cur} ${hit ? `== ${target} ✓` : `≠ ${target}`}` },
          codeLines: [4, 5, 6],
          vars: [
            { name: "expr", value: `"${expr}"` },
            { name: "cur", value: cur },
            { name: "target", value: target },
            { name: "match?", value: hit },
            { name: "result", value: `[${result.map((x) => `"${x}"`).join(", ")}]` },
          ],
          note: {
            vi: hit
              ? `Hết chữ số và cur=${cur} == target → thêm "${expr}" vào kết quả.`
              : `Hết chữ số nhưng cur=${cur} ≠ target=${target} → bỏ nhánh này.`,
            en: hit
              ? `All digits used and cur=${cur} == target → add "${expr}" to result.`
              : `All digits used but cur=${cur} ≠ target=${target} → discard this branch.`,
          },
        });
      }
      return;
    }

    for (let j = i; j < n; j++) {
      if (j > i && num[i] === "0") break;
      const operandStr = num.slice(i, j + 1);
      const operand = Number(operandStr);

      if (i === 0) {
        if (guard <= 80) {
          snap({
            title: { vi: `Số hạng đầu: ${operandStr}`, en: `First operand: ${operandStr}` },
            codeLines: [7, 8, 9, 10],
            vars: [
              { name: "operand", value: operandStr },
              { name: "cur", value: operand },
              { name: "last", value: operand },
            ],
            note: {
              vi: `Số hạng đầu tiên không có toán tử phía trước. expr="${operandStr}", cur=${operand}, last=${operand}.`,
              en: `The first operand has no leading operator. expr="${operandStr}", cur=${operand}, last=${operand}.`,
            },
          });
        }
        bt(j + 1, operandStr, operand, operand, depth + 1);
      } else {
        if (guard <= 80) {
          snap({
            title: { vi: `Thử toán tử trước "${operandStr}" (cur=${cur}, last=${last})`, en: `Try operators before "${operandStr}" (cur=${cur}, last=${last})` },
            codeLines: [11, 12, 13, 14],
            vars: [
              { name: "expr so far", value: `"${expr}"` },
              { name: "operand", value: operandStr },
              { name: "cur", value: cur },
              { name: "last", value: last },
              { name: "+", value: cur + operand },
              { name: "-", value: cur - operand },
              { name: "*", value: cur - last + last * operand },
            ],
            note: {
              vi: `Với số hạng "${operandStr}": thử 3 toán tử.\n+ → cur+${operand}=${cur + operand}\n- → cur-${operand}=${cur - operand}\n* → cur - last + last*${operand} = ${cur} - ${last} + ${last * operand} = ${cur - last + last * operand}.`,
              en: `For operand "${operandStr}": try 3 operators.\n+ → cur+${operand}=${cur + operand}\n- → cur-${operand}=${cur - operand}\n* → cur - last + last*${operand} = ${cur} - ${last} + ${last * operand} = ${cur - last + last * operand}.`,
            },
          });
        }
        bt(j + 1, expr + "+" + operandStr, cur + operand, operand, depth + 1);
        bt(j + 1, expr + "-" + operandStr, cur - operand, -operand, depth + 1);
        bt(j + 1, expr + "*" + operandStr, cur - last + last * operand, last * operand, depth + 1);
      }
    }
  }

  bt(0, "", 0, 0, 0);

  snap({
    title: { vi: `Kết quả: [${result.map((x) => `"${x}"`).join(", ")}]`, en: `Result: [${result.map((x) => `"${x}"`).join(", ")}]` },
    final: true,
    codeLines: [15],
    vars: [{ name: "answer", value: `[${result.map((x) => `"${x}"`).join(", ")}]` }],
    note: {
      vi: `Các biểu thức bằng ${target}: [${result.map((x) => `"${x}"`).join(", ")}].`,
      en: `Expressions equal to ${target}: [${result.map((x) => `"${x}"`).join(", ")}].`,
    },
  });

  return { original: num, answer: result, steps };
}

/** LeetCode 79: Word Search — DFS backtracking on a grid. */
function buildSteps79(input, params) {
  const board = String(input).split(/[;|]/).map((rawRow) => rawRow.trim()).filter(Boolean).map((rawRow) => (
    rawRow.includes(",")
      ? rawRow.split(",").map((cell) => cell.trim())
      : [...rawRow.replace(/\s+/g, "")]
  ));
  const word = String(params && params.word !== undefined ? params.word : "ABCCED");
  const R = board.length;
  const C = R ? board[0].length : 0;
  const work = board.map((r) => [...r]);
  const steps = [];
  const path = [];
  const callStack = [];
  const triedStarts = new Set();
  const directions = [
    { dr: 1, dc: 0, key: "down", vi: "xuống", en: "down", symbol: "↓" },
    { dr: -1, dc: 0, key: "up", vi: "lên", en: "up", symbol: "↑" },
    { dr: 0, dc: 1, key: "right", vi: "phải", en: "right", symbol: "→" },
    { dr: 0, dc: -1, key: "left", vi: "trái", en: "left", symbol: "←" },
  ];
  const STEP_LIMIT = 280;
  const CALL_LIMIT = 6000;
  let calls = 0;
  let found = false;
  let foundPath = [];

  const coord = (r, c) => `(${r},${c})`;
  const inBounds = (r, c) => r >= 0 && r < R && c >= 0 && c < C;
  const pathSnapshot = () => path.map((item) => ({ ...item }));
  const stackSnapshot = () => callStack.map((item) => ({ ...item }));
  const boardCells = () => work.map((row) => [...row]);
  const currentChar = (r, c) => inBounds(r, c) ? board[r][c] : null;

  function snap(options) {
    if (steps.length >= STEP_LIMIT) {
      if (!options.final) return;
      steps.pop();
    }
    const current = options.current || null;
    const target = options.target || null;
    const rejected = options.rejected || null;
    const restored = options.restored || null;
    const activePath = options.foundPath || pathSnapshot();
    steps.push({
      title: options.title,
      arr: [],
      highlight: [],
      mark: [],
      final: !!options.final,
      codeLines: options.codeLines || [],
      vars: options.vars || [],
      note: options.note,
      wordSearchView: {
        board: boardCells(),
        rows: R,
        cols: C,
        word,
        path: activePath,
        current,
        target,
        rejected,
        restored,
        triedStarts: [...triedStarts].map((key) => key.split(",").map(Number)),
        stack: stackSnapshot(),
        index: Number.isInteger(options.index) ? options.index : activePath.length,
        action: options.action || "init",
        reason: options.reason || "",
        direction: options.direction || null,
        directionIndex: Number.isInteger(options.directionIndex) ? options.directionIndex : -1,
        result: options.result,
      },
    });
  }

  snap({
    title: { vi: `Tìm "${word}" trên bảng`, en: `Search "${word}" on the board` },
    codeLines: [3], index: 0, action: "init",
    vars: [{ name: "rows × cols", value: `${R} × ${C}` }, { name: "word", value: `"${word}"` }, { name: "word length", value: word.length }],
    note: {
      vi: "Thử mỗi ô làm điểm bắt đầu. Trong DFS: khớp ký tự hiện tại, đánh dấu ô đã dùng, thử lần lượt ↓ ↑ → ←; nếu bế tắc thì khôi phục ô và quay lui.",
      en: "Try every cell as a start. In DFS: match the current letter, mark the cell used, try ↓ ↑ → ← in order; restore and backtrack on a dead end.",
    },
  });

  function dfs(r, c, i) {
    if (calls >= CALL_LIMIT) return false;
    calls += 1;
    callStack.push({ r, c, i });

    snap({
      title: { vi: `Gọi dfs${coord(r, c)}, i=${i}`, en: `Call dfs${coord(r, c)}, i=${i}` },
      current: inBounds(r, c) ? { r, c } : null,
      target: { r, c }, index: i, action: "call", codeLines: [5],
      vars: [{ name: "at", value: coord(r, c) }, { name: "i", value: i }, { name: "need", value: i < word.length ? `word[${i}]='${word[i]}'` : "all matched" }, { name: "stack depth", value: callStack.length }],
      note: { vi: `Frame mới cần khớp word[${i}]${i < word.length ? `='${word[i]}'` : " (đã hết từ)"}.`, en: `The new frame must match word[${i}]${i < word.length ? `='${word[i]}'` : " (the word is complete)"}.` },
    });

    const wordComplete = i === word.length;
    snap({
      title: wordComplete
        ? { vi: `i == len(word) → True`, en: `i == len(word) → True` }
        : { vi: `i=${i} < len(word)=${word.length}`, en: `i=${i} < len(word)=${word.length}` },
      current: inBounds(r, c) ? { r, c } : null,
      target: { r, c }, index: i, action: "base-check", codeLines: [6],
      vars: [{ name: "i", value: i }, { name: "len(word)", value: word.length }, { name: "i == len(word)", value: wordComplete }],
      note: wordComplete
        ? { vi: "Đã ghép đủ mọi ký tự; dòng kế tiếp sẽ return True.", en: "Every character is matched; the next line returns True." }
        : { vi: `Vẫn cần khớp word[${i}]='${word[i]}', nên tiếp tục kiểm tra tọa độ và ký tự.`, en: `word[${i}]='${word[i]}' still needs to be matched, so continue with bounds and character validation.` },
    });

    if (wordComplete) {
      found = true;
      foundPath = pathSnapshot();
      snap({
        title: { vi: `✓ Đã khớp đủ "${word}"`, en: `✓ Matched all of "${word}"` },
        index: i, action: "found", result: true, foundPath, codeLines: [7],
        vars: [{ name: "return", value: true }, { name: "path", value: foundPath.map((item) => coord(item.r, item.c)).join(" → ") }],
        note: { vi: "Dòng 7 trả True cho lời gọi DFS trước đó trong biểu thức OR.", en: "Line 7 returns True to the previous DFS call in the OR expression." },
      });
      callStack.pop();
      return true;
    }

    const inside = inBounds(r, c);
    const actual = inside ? work[r][c] : null;
    const expected = word[i];
    const invalid = !inside || actual !== expected;
    const reused = inside && actual === "#";
    snap({
      title: !inside
        ? { vi: `Kiểm tra ${coord(r, c)} → ngoài bảng`, en: `Check ${coord(r, c)} → outside board` }
        : invalid
          ? { vi: `Kiểm tra '${actual}' != '${expected}'`, en: `Check '${actual}' != '${expected}'` }
          : { vi: `Kiểm tra '${actual}' == '${expected}'`, en: `Check '${actual}' == '${expected}'` },
      current: inside ? { r, c } : null,
      target: { r, c }, rejected: invalid ? { r, c } : null, index: i,
      action: invalid ? "reject-check" : "validate", reason: !inside ? "outside" : reused ? "reused" : invalid ? "mismatch" : "match",
      codeLines: [8],
      vars: [
        { name: "at", value: coord(r, c) },
        { name: "inside board", value: inside },
        { name: "board[r][c]", value: inside ? (reused ? "# (visited)" : `'${actual}'`) : "not accessed" },
        { name: `word[${i}]`, value: `'${expected}'` },
        { name: "condition", value: invalid },
      ],
      note: !inside
        ? { vi: `${coord(r, c)} vượt biên, nên điều kiện dòng 8 là True mà không truy cập board[r][c].`, en: `${coord(r, c)} is outside the board, so line 8 is True without reading board[r][c].` }
        : invalid
          ? { vi: `Ô chứa '${actual}' nhưng cần '${expected}', nên điều kiện dòng 8 là True.`, en: `The cell contains '${actual}' but '${expected}' is needed, so line 8 is True.` }
          : { vi: `Tọa độ hợp lệ và '${actual}' khớp word[${i}], nên không return False.`, en: `The coordinate is valid and '${actual}' matches word[${i}], so do not return False.` },
    });

    if (invalid) {
      snap({
        title: { vi: `return False từ dfs${coord(r, c)}`, en: `return False from dfs${coord(r, c)}` },
        current: inside ? { r, c } : null, target: { r, c }, rejected: { r, c }, index: i,
        action: "reject", reason: !inside ? "outside" : reused ? "reused" : "mismatch", result: false, codeLines: [9],
        vars: [{ name: "at", value: coord(r, c) }, { name: "return", value: false }],
        note: { vi: "Dòng 9 trả False cho lời gọi DFS trong biểu thức OR; OR sẽ thử hướng tiếp theo nếu còn.", en: "Line 9 returns False to the DFS call in the OR expression; OR tries the next direction if one remains." },
      });
      callStack.pop();
      return false;
    }

    const tmp = actual;
    snap({
      title: { vi: `tmp = board[${r}][${c}] = '${tmp}'`, en: `tmp = board[${r}][${c}] = '${tmp}'` },
      current: { r, c }, index: i, action: "save-char", codeLines: [11],
      vars: [{ name: "tmp", value: `'${tmp}'` }, { name: "board[r][c]", value: `'${actual}'` }],
      note: { vi: `Lưu '${tmp}' vào tmp để có thể khôi phục chính xác ô này sau khi biểu thức OR kết thúc.`, en: `Save '${tmp}' in tmp so this cell can be restored exactly after the OR expression finishes.` },
    });

    path.push({ r, c, char: tmp, index: i });
    work[r][c] = "#";
    snap({
      title: { vi: `board[${r}][${c}] = '#'`, en: `board[${r}][${c}] = '#'` },
      current: { r, c }, index: i, action: "match", codeLines: [12],
      vars: [{ name: "at", value: coord(r, c) }, { name: "board[r][c]", value: "# (visited)" }, { name: "matched prefix", value: `"${word.slice(0, i + 1)}"` }, { name: "path length", value: path.length }],
      note: { vi: `Dòng 12 đánh dấu ô là '#'. Ô này thuộc path hiện tại và mọi DFS con sẽ không thể dùng lại nó.`, en: `Line 12 marks the cell '#'. It belongs to the current path and cannot be reused by any child DFS call.` },
    });

    snap({
      title: { vi: "Bắt đầu tính found bằng OR", en: "Begin evaluating found with OR" },
      current: { r, c }, index: i, action: "found-start", codeLines: [13],
      vars: [{ name: "found", value: "not assigned" }, { name: "OR order", value: "down → up → right → left" }],
      note: { vi: "Dòng 13 bắt đầu biểu thức OR. Python đánh giá từ trái sang phải và dừng ngay khi một lời gọi trả True.", en: "Line 13 starts the OR expression. Python evaluates left to right and stops as soon as one call returns True." },
    });

    let neighborFound = false;
    let successfulDirection = null;
    let evaluatedDirectionIndex = -1;
    for (let directionIndex = 0; directionIndex < directions.length; directionIndex += 1) {
      const direction = directions[directionIndex];
      const nr = r + direction.dr;
      const nc = c + direction.dc;
      evaluatedDirectionIndex = directionIndex;
      snap({
        title: { vi: `Thử ${direction.symbol} ${direction.vi}: ${coord(r, c)} → ${coord(nr, nc)}`, en: `Try ${direction.symbol} ${direction.en}: ${coord(r, c)} → ${coord(nr, nc)}` },
        current: { r, c }, target: { r: nr, c: nc }, index: i + 1, action: "explore", direction, directionIndex, codeLines: [directionIndex < 2 ? 14 : 15],
        vars: [{ name: "at", value: coord(r, c) }, { name: "direction", value: `${direction.symbol} ${direction.en}` }, { name: "next cell", value: coord(nr, nc) }, { name: "next i", value: i + 1 }, { name: "next char", value: i + 1 < word.length ? `'${word[i + 1]}'` : "complete" }],
        note: { vi: `Gọi dfs${coord(nr, nc)}, i=${i + 1}. Nếu kết quả True, OR short-circuit; nếu False, chuyển sang lời gọi kế tiếp.`, en: `Call dfs${coord(nr, nc)}, i=${i + 1}. True short-circuits the OR; False advances to the next call.` },
      });
      if (dfs(nr, nc, i + 1)) {
        neighborFound = true;
        successfulDirection = direction;
        break;
      }
    }

    snap({
      title: neighborFound
        ? { vi: "found = True (OR short-circuit)", en: "found = True (OR short-circuit)" }
        : { vi: "found = False (cả 4 nhánh False)", en: "found = False (all 4 branches are False)" },
      current: { r, c }, index: i, action: "found-value", result: neighborFound,
      direction: successfulDirection, directionIndex: evaluatedDirectionIndex, foundPath: neighborFound ? foundPath : undefined, codeLines: [16],
      vars: [
        { name: "found", value: neighborFound },
        { name: "evaluated calls", value: evaluatedDirectionIndex + 1 },
        { name: "successful direction", value: successfulDirection ? `${successfulDirection.symbol} ${successfulDirection.en}` : "none" },
      ],
      note: neighborFound
        ? { vi: `Nhánh ${successfulDirection.symbol} trả True, nên các lời gọi OR phía sau bị bỏ qua và found=True.`, en: `The ${successfulDirection.symbol} branch returned True, so later OR calls are skipped and found=True.` }
        : { vi: "Đã thử đủ ↓ ↑ → ← và tất cả đều False, nên found=False.", en: "All ↓ ↑ → ← calls were evaluated and returned False, so found=False." },
    });

    work[r][c] = tmp;
    path.pop();
    snap({
      title: neighborFound
        ? { vi: `Khôi phục ${coord(r, c)}='${tmp}' sau khi tìm thấy`, en: `Restore ${coord(r, c)}='${tmp}' after success` }
        : { vi: `Backtrack from ${coord(r, c)}: khôi phục '${tmp}'`, en: `Backtrack from ${coord(r, c)}: restore '${tmp}'` },
      current: { r, c }, restored: { r, c }, index: i, action: "restore", result: neighborFound,
      direction: successfulDirection, directionIndex: evaluatedDirectionIndex, foundPath: neighborFound ? foundPath : undefined, codeLines: [17],
      vars: [{ name: "board[r][c]", value: `'${tmp}'` }, { name: "found", value: neighborFound }, { name: "remaining path", value: path.length ? path.map((item) => coord(item.r, item.c)).join(" → ") : "∅" }],
      note: { vi: `Dòng 17 luôn chạy: khôi phục board[${r}][${c}] từ '#' về '${tmp}' trước khi rời frame, dù found là ${neighborFound}.`, en: `Line 17 always runs: restore board[${r}][${c}] from '#' to '${tmp}' before leaving the frame, whether found is ${neighborFound}.` },
    });
    snap({
      title: { vi: `return found → ${neighborFound}`, en: `return found → ${neighborFound}` },
      current: { r, c }, restored: { r, c }, index: i, action: "return-found", result: neighborFound,
      direction: successfulDirection, directionIndex: evaluatedDirectionIndex, foundPath: neighborFound ? foundPath : undefined, codeLines: [18],
      vars: [{ name: "found", value: neighborFound }, { name: "return", value: neighborFound }, { name: "board[r][c]", value: `'${tmp}'` }],
      note: neighborFound
        ? { vi: "Dòng 18 trả True cho frame cha; giá trị này tiếp tục short-circuit biểu thức OR phía trên.", en: "Line 18 returns True to the parent frame; that value continues short-circuiting the OR above." }
        : { vi: "Dòng 18 trả False cho frame cha; frame cha sẽ thử lời gọi OR kế tiếp nếu còn.", en: "Line 18 returns False to the parent frame; the parent tries the next OR call if one remains." },
    });
    callStack.pop();
    return neighborFound;
  }

  outer: for (let r = 0; r < R; r += 1) {
    snap({
      title: { vi: `Vòng row: r=${r}`, en: `Row loop: r=${r}` },
      current: C ? { r, c: 0 } : null, index: 0, action: "row-loop", codeLines: [20],
      vars: [{ name: "r", value: r }, { name: "rows", value: R }],
      note: { vi: `Dòng 20 bắt đầu hàng ${r}; vòng trong sẽ thử từng cột làm điểm xuất phát.`, en: `Line 20 begins row ${r}; the inner loop tries each column as a starting cell.` },
    });
    for (let c = 0; c < C; c += 1) {
      snap({
        title: { vi: `Vòng col: c=${c}`, en: `Column loop: c=${c}` },
        current: { r, c }, target: { r, c }, index: 0, action: "col-loop", codeLines: [21],
        vars: [{ name: "r", value: r }, { name: "c", value: c }, { name: "cell", value: `'${currentChar(r, c)}'` }],
        note: { vi: `Dòng 21 chọn ô ${coord(r, c)} cho lần kiểm tra tiếp theo.`, en: `Line 21 selects cell ${coord(r, c)} for the next check.` },
      });
      triedStarts.add(`${r},${c}`);
      snap({
        title: { vi: `Thử điểm bắt đầu ${coord(r, c)}`, en: `Try start ${coord(r, c)}` },
        current: { r, c }, target: { r, c }, index: 0, action: "start", codeLines: [22],
        vars: [{ name: "start", value: coord(r, c) }, { name: "cell char", value: `'${currentChar(r, c)}'` }, { name: "need", value: word.length ? `'${word[0]}'` : "empty word" }, { name: "starts tried", value: triedStarts.size }],
        note: { vi: `Dòng 22 gọi dfs${coord(r, c)}, i=0 và kiểm tra kết quả.`, en: `Line 22 calls dfs${coord(r, c)}, i=0 and checks its result.` },
      });
      if (dfs(r, c, 0)) break outer;
    }
  }

  snap({
    title: found ? { vi: `Tìm thấy "${word}" → True`, en: `Found "${word}" → True` } : { vi: `Không tìm thấy "${word}" → False`, en: `Did not find "${word}" → False` },
    final: true, index: found ? word.length : 0, action: found ? "result-true" : "result-false", result: found,
    foundPath: found ? foundPath : [], codeLines: found ? [23] : [24],
    vars: [
      { name: "answer", value: found },
      { name: "DFS calls", value: calls },
      { name: "starts tried", value: triedStarts.size },
      { name: "path", value: found ? foundPath.map((item) => `${coord(item.r, item.c)}='${item.char}'`).join(" → ") : "∅" },
    ],
    note: found
      ? { vi: `Đường màu xanh ghép đúng "${word}". Mỗi ô xuất hiện đúng một lần và các bước liên tiếp kề nhau theo 4 hướng.`, en: `The green path spells "${word}". Every cell is used once, and consecutive cells are 4-directionally adjacent.` }
      : { vi: `Đã thử mọi ô làm điểm đầu nhưng mọi nhánh đều mismatch, vượt biên, dùng lại ô hoặc bế tắc.`, en: `Every cell was tried as a start, but every branch mismatched, left the board, reused a cell, or reached a dead end.` },
  });
  return { original: board, answer: found, steps };
}

/** LeetCode 491: Non-decreasing Subsequences. */
function buildSteps491(input) {
  const nums = (Array.isArray(input) ? input : String(input).split(","))
    .map((value) => Number(value));
  const steps = [];
  const result = [];
  const current = [];
  const chosenIndices = [];
  const callStack = [];
  const MAX_STEPS = 600;
  let traceTruncated = false;

  const valid = nums.length > 0 && nums.every(Number.isInteger);

  function pushStep(options) {
    if (steps.length >= MAX_STEPS && !options.final) {
      traceTruncated = true;
      return;
    }
    const used = options.used instanceof Set ? [...options.used] : [];
    const visibleResults = result.slice(-12).map((sequence) => [...sequence]);
    steps.push({
      title: options.title,
      arr: [],
      highlight: Number.isInteger(options.i) ? [options.i] : [],
      mark: [...chosenIndices],
      final: Boolean(options.final),
      codeLines: options.codeLines || [],
      vars: options.vars || [],
      note: options.note,
      nonDecreasingView: {
        nums: [...nums],
        current: [...current],
        chosenIndices: [...chosenIndices],
        start: Number.isInteger(options.start) ? options.start : null,
        i: Number.isInteger(options.i) ? options.i : null,
        candidate: Number.isInteger(options.i) ? nums[options.i] : null,
        used,
        action: options.action || "step",
        duplicate: options.duplicate ?? null,
        orderOk: options.orderOk ?? null,
        last: options.last !== undefined
          ? options.last
          : current.length
            ? current[current.length - 1]
            : null,
        depth: current.length,
        callStack: callStack.map((frame) => ({ ...frame })),
        results: visibleResults,
        resultCount: result.length,
        traceTruncated,
      },
    });
  }

  if (!valid) {
    pushStep({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      codeLines: [2],
      action: "invalid",
      final: true,
      vars: [{ name: "answer", value: "[]" }],
      note: { vi: "nums phải là một mảng số nguyên không rỗng.", en: "nums must be a non-empty integer array." },
    });
    return { original: nums, answer: [], steps };
  }

  pushStep({
    title: { vi: "Bắt đầu findSubsequences", en: "Enter findSubsequences" },
    codeLines: [2],
    action: "enter",
    vars: [{ name: "nums", value: `[${nums.join(", ")}]` }],
    note: { vi: "Giữ nguyên thứ tự ban đầu của nums; bài này không được sort.", en: "Keep nums in its original order; this problem must not sort the array." },
  });

  pushStep({
    title: { vi: "result = []", en: "result = []" },
    codeLines: [3],
    action: "result-init",
    vars: [{ name: "result", value: "[]" }],
    note: { vi: "result sẽ chứa các subsequence khác nhau có độ dài ít nhất 2.", en: "result will hold distinct subsequences of length at least 2." },
  });

  pushStep({
    title: { vi: "current = []", en: "current = []" },
    codeLines: [4],
    action: "current-init",
    vars: [{ name: "current", value: "[]" }],
    note: { vi: "current là subsequence đang được xây dựng.", en: "current is the subsequence currently being built." },
  });

  pushStep({
    title: { vi: "Gọi backtrack(0)", en: "Call backtrack(0)" },
    codeLines: [22],
    action: "root-call",
    start: 0,
    vars: [{ name: "next call", value: "backtrack(0)" }],
    note: { vi: "Bắt đầu thử từ index 0.", en: "Start trying candidates from index 0." },
  });

  function backtrack(start) {
    callStack.push({ start, depth: current.length });
    pushStep({
      title: { vi: `Vào backtrack(${start})`, en: `Enter backtrack(${start})` },
      codeLines: [6],
      action: "call",
      start,
      vars: [
        { name: "start", value: start },
        { name: "current", value: `[${current.join(", ")}]` },
      ],
      note: { vi: `Frame này chỉ được chọn các index từ ${start} trở đi.`, en: `This frame may only choose indices from ${start} onward.` },
    });

    const canSave = current.length >= 2;
    pushStep({
      title: { vi: `len(current) >= 2 → ${canSave}`, en: `len(current) >= 2 → ${canSave}` },
      codeLines: [7],
      action: "save-check",
      start,
      vars: [
        { name: "len(current)", value: current.length },
        { name: "can save?", value: canSave },
      ],
      note: canSave
        ? { vi: "current đã đủ 2 phần tử nên đây là một đáp án hợp lệ.", en: "current has at least 2 elements, so it is a valid answer." }
        : { vi: "Chưa đủ 2 phần tử; tiếp tục mở rộng current.", en: "Fewer than 2 elements; keep extending current." },
    });

    if (canSave) {
      result.push([...current]);
      pushStep({
        title: { vi: `Lưu [${current.join(", ")}]`, en: `Save [${current.join(", ")}]` },
        codeLines: [8],
        action: "save",
        start,
        vars: [
          { name: "saved", value: `[${current.join(", ")}]` },
          { name: "result count", value: result.length },
        ],
        note: { vi: `Thêm một bản sao của current vào result. Hiện có ${result.length} đáp án.`, en: `Append a copy of current to result. There are now ${result.length} answers.` },
      });
    }

    const used = new Set();
    pushStep({
      title: { vi: `used = set() ở depth ${current.length}`, en: `used = set() at depth ${current.length}` },
      codeLines: [10],
      action: "used-init",
      start,
      used,
      vars: [
        { name: "used", value: "{}" },
        { name: "scope", value: `depth ${current.length}` },
      ],
      note: { vi: "used là set cục bộ của frame này, dùng để bỏ giá trị trùng ở cùng một level.", en: "used is local to this frame and removes duplicate values at the same level." },
    });

    for (let i = start; i < nums.length; i += 1) {
      pushStep({
        title: { vi: `Xét nums[${i}] = ${nums[i]}`, en: `Inspect nums[${i}] = ${nums[i]}` },
        codeLines: [11],
        action: "loop",
        start,
        i,
        used,
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "used", value: `{${[...used].join(", ")}}` },
        ],
        note: { vi: `Ứng viên hiện tại là ${nums[i]} tại index ${i}.`, en: `The current candidate is ${nums[i]} at index ${i}.` },
      });

      const duplicate = used.has(nums[i]);
      pushStep({
        title: { vi: `${nums[i]} in used → ${duplicate}`, en: `${nums[i]} in used → ${duplicate}` },
        codeLines: [12],
        action: "duplicate-check",
        start,
        i,
        used,
        duplicate,
        vars: [
          { name: "nums[i]", value: nums[i] },
          { name: "used", value: `{${[...used].join(", ")}}` },
          { name: "duplicate?", value: duplicate },
        ],
        note: duplicate
          ? { vi: `${nums[i]} đã được thử ở level này; chọn lại sẽ tạo subsequence trùng.`, en: `${nums[i]} was already tried at this level; choosing it again would duplicate subsequences.` }
          : { vi: `${nums[i]} chưa xuất hiện trong used của level này.`, en: `${nums[i]} has not appeared in this level's used set.` },
      });

      if (duplicate) {
        pushStep({
          title: { vi: `Skip ${nums[i]}: trùng cùng level`, en: `Skip ${nums[i]}: duplicate at this level` },
          codeLines: [13],
          action: "skip-duplicate",
          start,
          i,
          used,
          duplicate: true,
          vars: [
            { name: "i", value: i },
            { name: "nums[i]", value: nums[i] },
            { name: "continue", value: `i = ${i + 1}` },
          ],
          note: { vi: "continue bỏ qua ứng viên này nhưng không ảnh hưởng used của frame cha/con khác.", en: "continue skips this candidate without affecting used sets in other frames." },
        });
        continue;
      }

      const last = current.length ? current[current.length - 1] : null;
      const orderOk = last === null || nums[i] >= last;
      pushStep({
        title: last === null
          ? { vi: "current rỗng → thứ tự hợp lệ", en: "current is empty → order is valid" }
          : { vi: `${nums[i]} >= ${last} → ${orderOk}`, en: `${nums[i]} >= ${last} → ${orderOk}` },
        codeLines: [14],
        action: "order-check",
        start,
        i,
        used,
        duplicate: false,
        orderOk,
        last,
        vars: [
          { name: "candidate", value: nums[i] },
          { name: "last", value: last === null ? "none" : last },
          { name: "non-decreasing?", value: orderOk },
        ],
        note: orderOk
          ? { vi: "Ứng viên không nhỏ hơn phần tử cuối nên có thể nối vào current.", en: "The candidate is not smaller than the last value, so it may extend current." }
          : { vi: `${nums[i]} < ${last} sẽ làm dãy giảm, nên phải bỏ qua.`, en: `${nums[i]} < ${last} would decrease the sequence, so it must be skipped.` },
      });

      if (!orderOk) {
        pushStep({
          title: { vi: `Skip ${nums[i]}: làm dãy giảm`, en: `Skip ${nums[i]}: would decrease` },
          codeLines: [15],
          action: "skip-order",
          start,
          i,
          used,
          duplicate: false,
          orderOk: false,
          vars: [
            { name: "i", value: i },
            { name: "nums[i]", value: nums[i] },
            { name: "continue", value: `i = ${i + 1}` },
          ],
          note: { vi: "Không thêm ứng viên này vào used vì nó chưa được thử như một nhánh hợp lệ ở level hiện tại.", en: "Do not add this candidate to used because it was not tried as a valid branch at this level." },
        });
        continue;
      }

      used.add(nums[i]);
      pushStep({
        title: { vi: `used.add(${nums[i]})`, en: `used.add(${nums[i]})` },
        codeLines: [17],
        action: "used-add",
        start,
        i,
        used,
        duplicate: false,
        orderOk: true,
        last,
        vars: [{ name: "used", value: `{${[...used].join(", ")}}` }],
        note: { vi: `Đánh dấu ${nums[i]} đã được mở thành một nhánh tại depth ${current.length}.`, en: `Mark ${nums[i]} as already branched from depth ${current.length}.` },
      });

      current.push(nums[i]);
      chosenIndices.push(i);
      pushStep({
        title: { vi: `Thêm nums[${i}] = ${nums[i]}`, en: `Add nums[${i}] = ${nums[i]}` },
        codeLines: [18],
        action: "choose",
        start,
        i,
        used,
        duplicate: false,
        orderOk: true,
        last,
        vars: [
          { name: "i", value: i },
          { name: "nums[i]", value: nums[i] },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "chosen indices", value: `[${chosenIndices.join(", ")}]` },
        ],
        note: { vi: `current trở thành [${current.join(", ")}].`, en: `current becomes [${current.join(", ")}].` },
      });

      pushStep({
        title: { vi: `Gọi backtrack(${i + 1})`, en: `Call backtrack(${i + 1})` },
        codeLines: [19],
        action: "recurse",
        start,
        i,
        used,
        duplicate: false,
        orderOk: true,
        last,
        vars: [{ name: "next call", value: `backtrack(${i + 1})` }],
        note: { vi: `Chỉ xét các index sau ${i} để giữ đúng thứ tự subsequence.`, en: `Only inspect indices after ${i} to preserve subsequence order.` },
      });

      backtrack(i + 1);

      const popped = current.pop();
      chosenIndices.pop();
      pushStep({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        codeLines: [20],
        action: "backtrack",
        start,
        i,
        used,
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: { vi: `Trở về [${current.join(", ")}] để thử ứng viên tiếp theo ở cùng level. used vẫn là set của level này.`, en: `Return to [${current.join(", ")}] to try the next candidate at this level. used remains local to this level.` },
      });
    }

    callStack.pop();
  }

  backtrack(0);

  pushStep({
    title: { vi: `Trả về ${result.length} subsequence`, en: `Return ${result.length} subsequences` },
    codeLines: [23],
    action: "result",
    final: true,
    vars: [
      { name: "answer count", value: result.length },
      { name: "answer", value: result.map((sequence) => `[${sequence.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tìm được ${result.length} subsequence tăng không giảm khác nhau.${traceTruncated ? " Trace đã giới hạn số bước hiển thị." : ""}`,
      en: `Found ${result.length} distinct non-decreasing subsequences.${traceTruncated ? " The displayed trace was capped." : ""}`,
    },
  });

  return { original: [...nums], answer: result, steps };
}

/** LeetCode 131: Palindrome Partitioning. */
function buildSteps131(input) {
  const s = String(input);
  const n = s.length;
  const steps = [];
  const result = [];
  const isPal = (sub) => sub === sub.split("").reverse().join("");
  function snap(o) { steps.push({ title: o.title, arr: [], highlight: [], mark: [], final: o.final || false, codeLines: o.codeLines || [], vars: o.vars || [], note: o.note }); }
  snap({ title: { vi: `Chia "${s}" thành các palindrome`, en: `Partition "${s}" into palindromes` }, codeLines: [3], vars: [{ name: "s", value: `"${s}"` }], note: { vi: "Backtracking: thử mọi đoạn s[start:end]; nếu là palindrome thì chọn và đệ quy tiếp.", en: "Backtracking: try each piece s[start:end]; if palindrome, choose it and recurse." } });
  let guard = 0;
  function bt(start, pathArr) {
    if (guard > 200) return;
    guard++;
    if (start === n) { result.push([...pathArr]); snap({ title: { vi: `Hết chuỗi → lưu [${pathArr.map((x) => `"${x}"`).join(",")}]`, en: `End of string → save [${pathArr.map((x) => `"${x}"`).join(",")}]` }, codeLines: [4, 5], vars: [{ name: "partition", value: `[${pathArr.map((x) => `"${x}"`).join(",")}]` }, { name: "result", value: JSON.stringify(result) }], note: { vi: `Chia hết chuỗi thành palindrome → một cách phân hoạch hợp lệ.`, en: `Split the whole string into palindromes → a valid partition.` } }); return; }
    for (let end = start + 1; end <= n; end++) {
      const piece = s.slice(start, end);
      if (isPal(piece)) {
        pathArr.push(piece);
        if (guard <= 60) snap({ title: { vi: `"${piece}" là palindrome → chọn`, en: `"${piece}" is a palindrome → choose` }, codeLines: [6, 7, 8], vars: [{ name: "piece", value: `"${piece}"` }, { name: "path", value: `[${pathArr.map((x) => `"${x}"`).join(",")}]` }], note: { vi: `s[${start}:${end}]="${piece}" đối xứng → thêm vào phân hoạch, đệ quy từ ${end}.`, en: `s[${start}:${end}]="${piece}" is a palindrome → add to partition, recurse from ${end}.` } });
        bt(end, pathArr);
        pathArr.pop();
      }
    }
  }
  bt(0, []);
  snap({ title: { vi: `Kết quả: ${JSON.stringify(result)}`, en: `Result: ${JSON.stringify(result)}` }, final: true, codeLines: [9], vars: [{ name: "answer", value: JSON.stringify(result) }], note: { vi: `Mọi cách chia "${s}" thành các palindrome.`, en: `All ways to split "${s}" into palindromes.` } });
  return { original: s, answer: result, steps };
}

module.exports = {
  79: {
    id: 79, difficulty: "medium", slug: "word-search",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    title: { vi: "Word Search", en: "Word Search" },
    titleVi: { vi: "Tìm từ trên bảng (DFS backtracking)", en: "Search a word on a grid (DFS backtracking)" },
    statement: { vi: "Cho bảng ký tự và word. Word có thể ghép từ các ô kề nhau (4 hướng), mỗi ô dùng 1 lần? Nhập bảng: hàng cách ';', ký tự cách ','; word trong tham số.", en: "Given a board and a word, can the word be formed from adjacent cells (4 directions), each used once? Enter board: rows separated by ';', chars by ','; word as a parameter." },
    defaultInput: "A,B,C,E;S,F,C,S;A,D,E,E", inputKind: "string", inputLabel: { vi: "Bảng (hàng cách ;)", en: "Board (rows separated by ;)" },
    extraParams: [{ key: "word", type: "string", label: { vi: "word", en: "word" }, default: "ABCCED" }],
    approach: [{ vi: "DFS từ mỗi ô; khớp word[i] mới đi tiếp.", en: "DFS from each cell; continue only if word[i] matches." }, { vi: "Đánh dấu '#' ô đang dùng để không dùng lại.", en: "Mark the current cell '#' so it isn't reused." }, { vi: "Khôi phục ô khi quay lui.", en: "Restore the cell on backtrack." }, { vi: "Tìm thấy khi i == len(word).", en: "Found when i == len(word)." }],
    complexity: { time: "O(R·C·4^L)", space: "O(L)", note: { vi: "L = độ dài word.", en: "L = word length." } },
    code: [
      "class Solution:",
      "    def exist(self, board: List[List[str]], word: str) -> bool:",
      "        rows, cols = len(board), len(board[0])",
      "",
      "        def dfs(r: int, c: int, i: int) -> bool:",
      "            if i == len(word):",
      "                return True",
      "            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:",
      "                return False",
      "",
      "            tmp = board[r][c]",
      "            board[r][c] = '#'  # mark visited",
      "            found = (",
      "                dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or",
      "                dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1)",
      "            )",
      "            board[r][c] = tmp  # restore",
      "            return found",
      "",
      "        for r in range(rows):",
      "            for c in range(cols):",
      "                if dfs(r, c, 0):",
      "                    return True",
      "        return False",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps79(input, params), 79),
  },
  131: {
    id: 131, difficulty: "medium", slug: "palindrome-partitioning",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    title: { vi: "Palindrome Partitioning", en: "Palindrome Partitioning" },
    titleVi: { vi: "Chia chuỗi thành các palindrome", en: "Partition a string into palindromes" },
    statement: { vi: "Trả về MỌI cách chia chuỗi s sao cho mỗi đoạn là palindrome. Nhập chuỗi s.", en: "Return ALL ways to partition s so each piece is a palindrome. Enter the string s." },
    defaultInput: "aab", inputKind: "string", inputLabel: { vi: "s", en: "s" }, extraParams: [],
    approach: [{ vi: "Backtracking: tại start, thử mọi đoạn s[start:end].", en: "Backtracking: at start, try each piece s[start:end]." }, { vi: "Nếu đoạn là palindrome → chọn và đệ quy từ end.", en: "If the piece is a palindrome → choose it and recurse from end." }, { vi: "start == len(s) → lưu phân hoạch.", en: "start == len(s) → save the partition." }],
    complexity: { time: "O(n·2^n)", space: "O(n)", note: { vi: "2^n cách chia, kiểm tra palindrome O(n).", en: "2^n partitions, O(n) palindrome checks." } },
    code: ["class Solution:", "    def partition(self, s):", "        res = []", "        def bt(start, path):", "            if start == len(s): res.append(list(path)); return", "            for end in range(start+1, len(s)+1):", "                piece = s[start:end]", "                if piece == piece[::-1]:", "                    path.append(piece); bt(end, path); path.pop()", "        bt(0, []); return res"],
    builder: buildSteps131,
  },
  491: {
    id: 491,
    difficulty: "medium",
    slug: "non-decreasing-subsequences",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    title: { vi: "Non-decreasing Subsequences", en: "Non-decreasing Subsequences" },
    titleVi: { vi: "Các dãy con tăng không giảm", en: "Distinct non-decreasing subsequences" },
    statement: {
      vi: "Cho mảng số nguyên nums. Trả về tất cả subsequence khác nhau có ít nhất 2 phần tử và tăng không giảm. Các phần tử phải giữ nguyên thứ tự index ban đầu.",
      en: "Given an integer array nums, return all distinct non-decreasing subsequences with at least two elements. Elements must preserve their original index order.",
    },
    defaultInput: [4, 6, 7, 7],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Backtracking với start: sau khi chọn index i, lời gọi sau chỉ xét từ i + 1 để giữ thứ tự subsequence.", en: "Backtrack with start: after choosing index i, the next call only considers i + 1 onward to preserve subsequence order." },
      { vi: "Chỉ nối nums[i] khi current rỗng hoặc nums[i] >= current[-1].", en: "Append nums[i] only when current is empty or nums[i] >= current[-1]." },
      { vi: "Mỗi frame có một used riêng; nếu một giá trị đã được thử ở cùng depth thì skip để loại đáp án trùng.", en: "Each frame owns a local used set; skip values already tried at the same depth to remove duplicate answers." },
      { vi: "Mỗi khi len(current) >= 2, lưu một bản sao vì mọi phần mở rộng hiện tại đều là đáp án hợp lệ.", en: "Whenever len(current) >= 2, save a copy because the current sequence is already a valid answer." },
    ],
    complexity: {
      time: "O(2ⁿ · n)",
      space: "O(n)",
      note: {
        vi: "Có tối đa 2ⁿ subsequence; copy mỗi đáp án tốn O(n). Stack, current và các set trên một đường đệ quy dùng O(n).",
        en: "There are up to 2ⁿ subsequences and copying each answer costs O(n). The recursion stack, current path, and per-path sets use O(n).",
      },
    },
    code: [
      "class Solution:",
      "    def findSubsequences(self, nums):",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start):",
      "            if len(current) >= 2:",
      "                result.append(current[:])",
      "",
      "            used = set()",
      "            for i in range(start, len(nums)):",
      "                if nums[i] in used:",
      "                    continue",
      "                if current and nums[i] < current[-1]:",
      "                    continue",
      "",
      "                used.add(nums[i])",
      "                current.append(nums[i])",
      "                backtrack(i + 1)",
      "                current.pop()",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps491(input, params), 491),
  },
  282: {
    id: 282,
    difficulty: "hard",
    slug: "expression-add-operators",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    title: { vi: "Expression Add Operators", en: "Expression Add Operators" },
    titleVi: { vi: "Chèn toán tử để đạt target (backtracking)", en: "Insert operators to reach target (backtracking)" },
    statement: {
      vi:
        "Cho chuỗi số num và target. Chèn +, -, * giữa các chữ số để biểu thức bằng target. " +
        "Trả về TẤT CẢ biểu thức hợp lệ (không cho số nhiều chữ số bắt đầu bằng 0). Nhập num; target trong tham số.",
      en:
        "Given a digit string num and a target, insert +, -, * between digits so the expression equals target. " +
        "Return ALL valid expressions (no multi-digit operand starting with 0). Enter num; target as a parameter.",
    },
    defaultInput: "123",
    inputKind: "string",
    inputLabel: { vi: "num", en: "num" },
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 6 },
    ],
    approach: [
      { vi: "Backtracking: tại mỗi vị trí, chọn số hạng (1..nhiều chữ số) rồi thử +, -, *.", en: "Backtracking: at each position, choose an operand (1..many digits), then try +, -, *." },
      { vi: "Theo dõi cur (giá trị hiện tại) và last (số hạng cuối, có dấu).", en: "Track cur (running value) and last (last operand, signed)." },
      { vi: "Mẹo cho '*': cur - last + last*operand (hoàn tác số hạng cuối rồi nhân).", en: "Trick for '*': cur - last + last*operand (undo the last term, then multiply)." },
      { vi: "Không cho số nhiều chữ số bắt đầu bằng '0'. Cuối cùng nếu cur == target → lưu biểu thức.", en: "No multi-digit operand starting with '0'. At the end, if cur == target → save the expression." },
    ],
    complexity: {
      time: "O(4^n)",
      space: "O(n)",
      note: {
        vi: "Mỗi khe giữa chữ số có ~4 lựa chọn (nối/+/-/*).",
        en: "Each gap between digits has ~4 choices (concat/+/-/*).",
      },
    },
    code: [
      "class Solution:",
      "    def addOperators(self, num, target):",
      "        def bt(i, expr, cur, last):",
      "            if i == len(num):",
      "                if cur == target: result.append(expr)",
      "                return",
      "            for j in range(i, len(num)):",
      "                if j > i and num[i] == '0': break",
      "                operand = int(num[i:j+1])",
      "                if i == 0: bt(j+1, num[i:j+1], operand, operand)",
      "                else:",
      "                    bt(j+1, expr+'+'+num[i:j+1], cur+operand, operand)",
      "                    bt(j+1, expr+'-'+num[i:j+1], cur-operand, -operand)",
      "                    bt(j+1, expr+'*'+num[i:j+1], cur-last+last*operand, last*operand)",
      "        return result",
    ],
    builder: buildSteps282,
  },
  301: {
    id: 301,
    difficulty: "hard",
    slug: "remove-invalid-parentheses",
    category: { key: "backtracking", vi: "Quay lui", en: "Backtracking" },
    title: { vi: "Remove Invalid Parentheses", en: "Remove Invalid Parentheses" },
    titleVi: { vi: "Xóa dấu ngoặc không hợp lệ (BFS theo số lần xóa)", en: "Remove invalid parentheses (BFS by removal count)" },
    statement: {
      vi:
        "Cho chuỗi s gồm chữ cái và '(' ')'. Xóa SỐ ÍT NHẤT dấu ngoặc để s hợp lệ. " +
        "Trả về TẤT CẢ kết quả khác nhau. Nhập chuỗi s.",
      en:
        "Given a string s of letters and '(' ')'. Remove the MINIMUM number of parentheses to make s valid. " +
        "Return ALL distinct results. Enter the string s.",
    },
    defaultInput: "()())()",
    inputKind: "string",
    inputLabel: { vi: "s", en: "s" },
    extraParams: [],
    approach: [
      { vi: "BFS theo SỐ LẦN XÓA: level 0 là chuỗi gốc, mỗi level xóa thêm 1 dấu ngoặc.", en: "BFS by REMOVAL COUNT: level 0 is the original, each level removes one more parenthesis." },
      { vi: "Kiểm tra is_valid mọi chuỗi trong level. Level đầu tiên có chuỗi hợp lệ = đáp án (xóa ít nhất).", en: "Check is_valid for every string in the level. The first level with a valid string = answer (fewest removals)." },
      { vi: "Sinh level tiếp theo bằng cách xóa 1 dấu '(' hoặc ')' tại từng vị trí; dùng set để loại trùng.", en: "Generate the next level by removing one '(' or ')' at every position; use a set to dedupe." },
    ],
    complexity: {
      time: "O(2^n · n)",
      space: "O(2^n)",
      note: {
        vi: "Worst-case mỗi ký tự có thể bị xóa hoặc giữ. BFS dừng ngay ở level hợp lệ đầu tiên.",
        en: "Worst-case each char may be removed or kept. BFS stops at the first valid level.",
      },
    },
    code: [
      "class Solution:",
      "    def removeInvalidParentheses(self, s):",
      "        def is_valid(string):",
      "            count = 0",
      "            for ch in string:",
      "                if ch == '(': count += 1",
      "                elif ch == ')':",
      "                    count -= 1",
      "                    if count < 0: return False",
      "            return count == 0",
      "        level = {s}",
      "        while level:",
      "            valid = [x for x in level if is_valid(x)]",
      "            if valid: return valid",
      "            next_level = set()",
      "            for string in level:",
      "                for i in range(len(string)):",
      "                    if string[i] in '()':",
      "                        next_level.add(string[:i] + string[i+1:])",
      "            level = next_level",
      "        return ['']",
    ],
    builder: buildSteps301,
  },
  980: {
    id: 980,
    difficulty: "hard",
    slug: "unique-paths-iii",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Unique Paths III", en: "Unique Paths III" },
    titleVi: { vi: "Đếm số đường đi duy nhất III", en: "Count unique full-coverage paths" },
    statement: {
      vi:
        "Cho lưới m×n với 1=start, 2=end, 0=ô trống, -1=chướng ngại. " +
        "Đếm số đường đi từ start đến end đi qua ĐÚNG MỘT LẦN mỗi ô không phải chướng ngại " +
        "(kể cả start và end). Mỗi bước đi sang ô kề (trên/dưới/trái/phải), không được lặp.",
      en:
        "Given an m×n grid with 1=start, 2=end, 0=empty, -1=obstacle. " +
        "Count paths from start to end that walk over EVERY non-obstacle cell exactly once " +
        "(including start and end). Each step moves to a 4-neighbor cell; no revisits allowed.",
    },
    defaultInput: "1,0,0,0|0,0,0,0|0,0,2,-1",
    inputKind: "string",
    inputLabel: { vi: "grid (hàng cách bởi |, ô cách bởi ,)", en: "grid (rows split by |, cells by ,)" },
    extraParams: [],
    complexity: {
      time: "O(4^k)",
      space: "O(k)",
      note: {
        vi: "k = số ô có thể bước lên. Mỗi ô có tối đa 4 lựa chọn kế tiếp, độ sâu đệ quy tối đa k.",
        en: "k = walkable cells. Each cell tries up to 4 neighbours; recursion depth is at most k.",
      },
    },
    code: [
      "class Solution:",
      "    def uniquePathsIII(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        # locate start/end and count cells to walk",
      "        empty = 0; start = end = (0, 0)",
      "        for r in range(m):",
      "            for c in range(n):",
      "                v = grid[r][c]",
      "                if v != -1: empty += 1",
      "                if v == 1: start = (r, c)",
      "                if v == 2: end = (r, c)",
      "",
      "        self.ans = 0",
      "        def dfs(r, c, remain):",
      "            if not (0 <= r < m and 0 <= c < n): return",
      "            if grid[r][c] == -1: return",
      "            if (r, c) == end:",
      "                if remain == 1: self.ans += 1",
      "                return",
      "            grid[r][c] = -1                    # visit",
      "            for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):",
      "                dfs(r+dr, c+dc, remain - 1)",
      "            grid[r][c] = 0                     # backtrack",
      "",
      "        dfs(start[0], start[1], empty)",
      "        return self.ans",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps980(input, params), 980),
  },
  51: {
    id: 51,
    difficulty: "hard",
    slug: "n-queens",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "N-Queens", en: "N-Queens" },
    titleVi: { vi: "N quân hậu", en: "N-Queens" },
    statement: {
      vi:
        "Đặt n quân hậu trên bàn cờ n×n sao cho không có hai quân hậu nào tấn công nhau " +
        "(cùng hàng, cùng cột, hoặc cùng đường chéo). Trả về tất cả các cách đặt hợp lệ.",
      en:
        "Place n queens on an n×n chessboard so that no two queens attack each other " +
        "(same row, column, or diagonal). Return all distinct valid placements.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (kích thước bàn cờ)", en: "n (board size)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [],
    complexity: {
      time: "O(n!)",
      space: "O(n²)",
      note: {
        vi: "Backtracking thử từng hàng, mỗi hàng tối đa n cột → xấu nhất O(n!). Bàn cờ n×n → O(n²) bộ nhớ.",
        en: "Backtracking tries each row, at most n columns per row → worst case O(n!). Board is n×n → O(n²) memory.",
      },
    },
    code: [
      "class Solution:",
      "    def solveNQueens(self, n):",
      "        result = []",
      "        board = [['.' ] * n for _ in range(n)]",
      "",
      "        def is_safe(row, col):",
      "            for i in range(row):",
      "                if board[i][col] == 'Q':",
      "                    return False",
      "                if col-(row-i) >= 0 and board[i][col-(row-i)] == 'Q':",
      "                    return False",
      "                if col+(row-i) < n and board[i][col+(row-i)] == 'Q':",
      "                    return False",
      "            return True",
      "",
      "        def backtrack(row):",
      "            if row == n:",
      "                result.append([''.join(r) for r in board])",
      "                return",
      "            for col in range(n):",
      "                if is_safe(row, col):",
      "                    board[row][col] = 'Q'",
      "                    backtrack(row + 1)",
      "                    board[row][col] = '.'",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps51(input, params), 51),
  },
  52: {
    id: 52,
    difficulty: "hard",
    slug: "n-queens-ii",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "N-Queens II", en: "N-Queens II" },
    titleVi: { vi: "N quân hậu II (đếm số lời giải)", en: "N-Queens II (count solutions)" },
    statement: {
      vi:
        "Cho số nguyên n, trả về SỐ LƯỢNG cách đặt n quân hậu trên bàn cờ n×n sao cho không có hai quân hậu nào tấn công nhau.",
      en:
        "Given an integer n, return the NUMBER of distinct solutions to the n-queens puzzle.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (kích thước bàn cờ)", en: "n (board size)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [],
    complexity: {
      time: "O(n!)",
      space: "O(n)",
      note: {
        vi: "Backtracking O(n!). Dùng 3 set (cột, chéo trái, chéo phải) → O(n) bộ nhớ thay vì O(n²).",
        en: "Backtracking O(n!). Uses 3 sets (cols, left-diag, right-diag) → O(n) memory instead of O(n²).",
      },
    },
    code: [
      "class Solution:",
      "    def totalNQueens(self, n: int) -> int:",
      "        cols = set()",
      "        diag1 = set()  # row - col",
      "        diag2 = set()  # row + col",
      "        count = 0",
      "",
      "        def backtrack(row):",
      "            nonlocal count",
      "            if row == n:",
      "                count += 1",
      "                return",
      "            for col in range(n):",
      "                if col in cols or row-col in diag1 or row+col in diag2:",
      "                    continue",
      "                cols.add(col)",
      "                diag1.add(row - col)",
      "                diag2.add(row + col)",
      "                backtrack(row + 1)",
      "                cols.remove(col)",
      "                diag1.remove(row - col)",
      "                diag2.remove(row + col)",
      "",
      "        backtrack(0)",
      "        return count",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps52(input, params), 52),
  },
  46: {
    id: 46,
    difficulty: "medium",
    slug: "permutations",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Permutations", en: "Permutations" },
    titleVi: { vi: "Tất cả hoán vị", en: "All permutations" },
    statement: {
      vi: "Cho mảng nums (các phần tử khác nhau), trả về TẤT CẢ hoán vị. Khác Subsets: THỨ TỰ quan trọng, mỗi hoán vị có đủ n phần tử.",
      en: "Given an array nums of distinct integers, return ALL possible permutations. Unlike Subsets: ORDER matters, each permutation uses all n elements.",
    },
    defaultInput: [1, 2, 3],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Backtracking với mảng used[] để đánh dấu phần tử đã dùng.", en: "Backtracking with a used[] array marking elements already chosen." },
      { vi: "Khi len(current) == n → lưu một hoán vị hoàn chỉnh.", en: "When len(current) == n → save a complete permutation." },
      { vi: "Vòng for duyệt qua MỌI phần tử (không dùng start), chỉ chọn phần tử chưa used.", en: "The for-loop iterates over ALL elements (no start), only picks unused ones." },
      { vi: "Có n! hoán vị → độ phức tạp O(n · n!).", en: "There are n! permutations → complexity O(n · n!)." },
    ],
    complexity: {
      time: "O(n · n!)",
      space: "O(n)",
      note: { vi: "n! hoán vị × O(n) copy. Stack + used → O(n).", en: "n! permutations × O(n) copy. Stack + used → O(n)." },
    },
    code: [
      "class Solution:",
      "    def permute(self, nums):",
      "        result = []",
      "        current = []",
      "        used = [False] * len(nums)",
      "",
      "        def backtrack():",
      "            if len(current) == len(nums):",
      "                result.append(current[:])",
      "                return",
      "            for i in range(len(nums)):",
      "                if used[i]:",
      "                    continue",
      "                used[i] = True",
      "                current.append(nums[i])",
      "                backtrack()",
      "                current.pop()",
      "                used[i] = False",
      "",
      "        backtrack()",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps46(input, params), 46),
  },
  77: {
    id: 77,
    difficulty: "medium",
    slug: "combinations",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Combinations", en: "Combinations" },
    titleVi: { vi: "Tổ hợp C(n, k)", en: "All k-combinations of 1..n" },
    statement: {
      vi:
        "Cho hai số nguyên dương n và k, trả về TẤT CẢ các tổ hợp gồm k số chọn từ tập [1, 2, ..., n]. " +
        "Mỗi tổ hợp là một mảng các số khác nhau, thứ tự không quan trọng.",
      en:
        "Given two integers n and k, return ALL combinations of k numbers chosen from the range [1, 2, ..., n]. " +
        "Each combination is an array of distinct numbers; order does not matter.",
    },
    defaultInput: [4],
    inputKind: "positive",
    inputLabel: { vi: "n (chọn từ 1..n)", en: "n (choose from 1..n)" },
    singleInput: true,
    maxInput: 8,
    extraParams: [
      { key: "k", label: { vi: "k (số phần tử mỗi tổ hợp)", en: "k (size per combination)" }, default: 2 },
    ],
    approach: [
      { vi: "Backtracking: xây dựng dần một mảng 'current'. Mỗi bước thêm 1 số rồi đệ quy.", en: "Backtracking: build the 'current' array incrementally. At each step, add one number and recurse." },
      { vi: "Để tránh trùng (vd [1,2] và [2,1]), chỉ chọn số lớn hơn số cuối trong current.", en: "To avoid duplicates (e.g. [1,2] vs [2,1]), only pick numbers larger than the last in current." },
      { vi: "Khi len(current) == k → lưu một bản sao vào result rồi quay lui.", en: "When len(current) == k → save a copy to result and backtrack." },
      { vi: "Pruning: nếu số phần tử còn lại không đủ k - len(current), bỏ qua.", en: "Pruning: skip if remaining numbers are insufficient to reach size k." },
    ],
    complexity: {
      time: "O(C(n,k) · k)",
      space: "O(k)",
      note: {
        vi: "Có C(n,k) tổ hợp, mỗi tổ hợp tốn O(k) để copy. Đệ quy sâu nhất k tầng → O(k) stack.",
        en: "There are C(n,k) combinations, each costs O(k) to copy. Recursion depth at most k → O(k) stack.",
      },
    },
    code: [
      "class Solution:",
      "    def combine(self, n: int, k: int):",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start):",
      "            if len(current) == k:",
      "                result.append(current[:])",
      "                return",
      "            for i in range(start, n + 1):",
      "                current.append(i)",
      "                backtrack(i + 1)",
      "                current.pop()",
      "",
      "        backtrack(1)",
      "        return result",
    ],
    // The positive-number input control is serialized as [n]. The live
    // Python method expects two scalar arguments: combine(n, k).
    liveArgs: (input, params) => [
      Number(Array.isArray(input) ? input[0] : input),
      Number(params.k),
    ],
    builder: buildSteps77,
  },
  78: {
    id: 78,
    difficulty: "medium",
    slug: "subsets",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Subsets", en: "Subsets" },
    titleVi: { vi: "Tất cả tập con (Power Set)", en: "All subsets (power set)" },
    statement: {
      vi:
        "Cho mảng số nguyên nums (các phần tử khác nhau), trả về TẤT CẢ các tập con (power set). " +
        "Không được chứa tập con trùng nhau. Thứ tự không quan trọng.",
      en:
        "Given an integer array nums of distinct elements, return ALL possible subsets (power set). " +
        "Must not contain duplicate subsets. Order does not matter.",
    },
    defaultInput: [1, 2, 3],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Mỗi tập con là một dãy 'chọn / không chọn' cho từng phần tử → có 2ⁿ tập.", en: "Each subset is a 'pick / skip' choice per element → 2ⁿ subsets total." },
      { vi: "Backtracking: tại mỗi bước, lưu current ngay (mọi node đều là kết quả), rồi thử thêm từng phần tử kế tiếp.", en: "Backtracking: at each step, save current immediately (every node is a valid subset), then try adding each next element." },
      { vi: "Dùng tham số start để chỉ chọn phần tử sau index hiện tại, tránh trùng.", en: "Use a start index parameter to only pick elements after the current index, avoiding duplicates." },
      { vi: "Sau khi đệ quy → pop để quay lui và thử nhánh khác.", en: "After recursing → pop to backtrack and try the next branch." },
    ],
    complexity: {
      time: "O(n · 2ⁿ)",
      space: "O(n)",
      note: {
        vi: "Có 2ⁿ tập con, mỗi tập mất O(n) để copy. Đệ quy sâu nhất n tầng → O(n) stack.",
        en: "There are 2ⁿ subsets, each costs O(n) to copy. Recursion depth at most n → O(n) stack.",
      },
    },
    code: [
      "class Solution:",
      "    def subsets(self, nums):",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start):",
      "            result.append(current[:])",
      "            for i in range(start, len(nums)):",
      "                current.append(nums[i])",
      "                backtrack(i + 1)",
      "                current.pop()",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps78(input, params), 78),
  },
  90: {
    id: 90,
    difficulty: "medium",
    slug: "subsets-ii",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Subsets II", en: "Subsets II" },
    titleVi: { vi: "Tất cả tập con (có phần tử trùng)", en: "All subsets with duplicates" },
    statement: {
      vi:
        "Cho mảng số nguyên nums (CÓ THỂ chứa phần tử trùng), trả về TẤT CẢ các tập con (power set). " +
        "Không được chứa tập con trùng nhau.",
      en:
        "Given an integer array nums that MAY contain duplicates, return all possible subsets (power set). " +
        "Must not contain duplicate subsets.",
    },
    defaultInput: [1, 2, 2],
    inputKind: "integer",
    extraParams: [],
    approach: [
      { vi: "Giống bài 78 nhưng nums có phần tử trùng → các tập con dễ bị trùng.", en: "Same as 78 but nums may have duplicates → subsets can repeat." },
      { vi: "Bước 1: SẮP XẾP nums để các phần tử trùng nằm cạnh nhau.", en: "Step 1: SORT nums so duplicates are adjacent." },
      { vi: "Bước 2: Khi duyệt for ở mỗi level, BỎ QUA i > start nếu nums[i] == nums[i-1] (chỉ dùng bản đầu tiên).", en: "Step 2: In the for-loop at each level, SKIP if i > start and nums[i] == nums[i-1] (only use the first copy)." },
      { vi: "Cách này đảm bảo: ở cùng một level, mỗi giá trị chỉ được thử đúng 1 lần.", en: "This ensures: at the same level, each value is tried exactly once." },
    ],
    complexity: {
      time: "O(n · 2ⁿ)",
      space: "O(n)",
      note: {
        vi: "Sắp xếp O(n log n). Tối đa 2ⁿ tập con, mỗi tập O(n) để copy.",
        en: "Sort O(n log n). At most 2ⁿ subsets, each O(n) to copy.",
      },
    },
    code: [
      "class Solution:",
      "    def subsetsWithDup(self, nums):",
      "        nums.sort()",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start):",
      "            result.append(current[:])",
      "            for i in range(start, len(nums)):",
      "                if i > start and nums[i] == nums[i-1]:",
      "                    continue",
      "                current.append(nums[i])",
      "                backtrack(i + 1)",
      "                current.pop()",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps90(input, params), 90),
  },
  39: {
    id: 39,
    difficulty: "medium",
    slug: "combination-sum",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Combination Sum", en: "Combination Sum" },
    titleVi: { vi: "Tổ hợp có tổng bằng target", en: "All combinations summing to target" },
    statement: {
      vi:
        "Cho mảng candidates (các số khác nhau, dương) và target. " +
        "Tìm TẤT CẢ tổ hợp các candidate có tổng = target. Mỗi candidate có thể dùng KHÔNG GIỚI HẠN số lần. " +
        "Hai tổ hợp khác nhau nếu số lượng phần tử khác nhau.",
      en:
        "Given an array candidates of distinct positive integers and a target. " +
        "Find ALL combinations of candidates that sum to target. Each candidate may be chosen UNLIMITED times. " +
        "Two combinations are different if their multisets of numbers differ.",
    },
    defaultInput: [2, 3, 6, 7],
    inputKind: "positive",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 7 },
    ],
    approach: [
      { vi: "Backtracking: xây dựng dần một mảng current; theo dõi remain = target - sum(current).", en: "Backtracking: build current incrementally; track remain = target - sum(current)." },
      { vi: "Nếu remain == 0 → lưu current vào result.", en: "If remain == 0 → save current to result." },
      { vi: "Nếu remain < 0 → vượt quá, quay lui.", en: "If remain < 0 → overshoot, backtrack." },
      { vi: "Vì được dùng lại nên đệ quy gọi với start = i (KHÔNG phải i+1) khi thử lại cùng candidate.", en: "Because reuse is allowed, recurse with start = i (NOT i+1) when retrying the same candidate." },
      { vi: "Dùng start để tránh trùng (tránh [2,3] và [3,2] cùng xuất hiện).", en: "Use start to avoid duplicates (prevent both [2,3] and [3,2])." },
    ],
    complexity: {
      time: "O(2^t)",
      space: "O(t)",
      note: {
        vi: "Trong xấu nhất t = target, t/min phép gọi đệ quy lồng nhau. Bộ nhớ O(target).",
        en: "Worst case t = target, recursion depth up to t/min. Memory O(target).",
      },
    },
    code: [
      "class Solution:",
      "    def combinationSum(self, candidates, target):",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start, remain):",
      "            if remain == 0:",
      "                result.append(current[:])",
      "                return",
      "            if remain < 0:",
      "                return",
      "            for i in range(start, len(candidates)):",
      "                current.append(candidates[i])",
      "                backtrack(i, remain - candidates[i])",
      "                current.pop()",
      "",
      "        backtrack(0, target)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps39(input, params), 39),
  },
  40: {
    id: 40,
    difficulty: "medium",
    slug: "combination-sum-ii",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Combination Sum II", en: "Combination Sum II" },
    titleVi: { vi: "Tổ hợp tổng II (mỗi phần tử dùng 1 lần)", en: "Combination sum, each element once" },
    statement: {
      vi: "Cho candidates (CÓ THỂ trùng) và target. Tìm tất cả tổ hợp có tổng = target, mỗi phần tử dùng MỘT lần. Không chứa tổ hợp trùng.",
      en: "Given candidates (may have duplicates) and target. Find all combinations summing to target, each element used at most ONCE. No duplicate combinations.",
    },
    defaultInput: [10, 1, 2, 7, 6, 1, 5],
    inputKind: "positive",
    extraParams: [
      { key: "target", label: { vi: "target", en: "target" }, default: 8 },
    ],
    approach: [
      { vi: "Sắp xếp trước để skip duplicate + pruning sớm khi vượt target.", en: "Sort first to skip duplicates + prune early when overshooting." },
      { vi: "Đệ quy start = i+1 (dùng 1 lần). Trong for: if i>start && sorted[i]==sorted[i-1] → skip.", en: "Recurse start = i+1 (use once). In for: if i>start && sorted[i]==sorted[i-1] → skip." },
      { vi: "sorted[i] > remain → break (phần tử sau đều lớn hơn).", en: "sorted[i] > remain → break (all later are larger)." },
    ],
    complexity: {
      time: "O(2^n)",
      space: "O(n)",
      note: { vi: "Tối đa 2^n nhánh, mỗi O(n) copy.", en: "At most 2^n branches, each O(n) copy." },
    },
    code: [
      "class Solution:",
      "    def combinationSum2(self, candidates, target):",
      "        candidates.sort()",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(start, remain):",
      "            if remain == 0:",
      "                result.append(current[:])",
      "                return",
      "            for i in range(start, len(candidates)):",
      "                if i > start and candidates[i] == candidates[i-1]:",
      "                    continue",
      "                if candidates[i] > remain:",
      "                    break",
      "                current.append(candidates[i])",
      "                backtrack(i + 1, remain - candidates[i])",
      "                current.pop()",
      "",
      "        backtrack(0, target)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps40(input, params), 40),
  },
  17: {
    id: 17,
    difficulty: "medium",
    slug: "letter-combinations-of-a-phone-number",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Letter Combinations of a Phone Number", en: "Letter Combinations of a Phone Number" },
    titleVi: { vi: "Tổ hợp chữ cái bàn phím điện thoại", en: "Phone keypad letter combinations" },
    statement: {
      vi: "Cho chuỗi digits (2-9), trả về tất cả tổ hợp chữ cái theo bàn phím điện thoại: 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz.",
      en: "Given a string digits (2-9), return all letter combinations per phone keypad: 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz.",
    },
    defaultInput: "23",
    inputKind: "string",
    inputLabel: { vi: "digits (2-9)", en: "digits (2-9)" },
    extraParams: [],
    approach: [
      { vi: "Mỗi digit map tới 3-4 chữ cái. Mỗi vị trí = 1 level đệ quy.", en: "Each digit maps to 3-4 letters. Each position = 1 recursion level." },
      { vi: "Ở level i: thử mọi chữ cái thuộc digits[i], thêm vào current rồi đệ quy level i+1.", en: "At level i: try every letter for digits[i], append to current then recurse to level i+1." },
      { vi: "Khi len(current) == len(digits) → lưu.", en: "When len(current) == len(digits) → save." },
    ],
    complexity: {
      time: "O(4^n · n)",
      space: "O(n)",
      note: { vi: "Tối đa 4 chữ/digit → 4^n combo × O(n) copy.", en: "Up to 4 letters/digit → 4^n combos × O(n) copy." },
    },
    code: [
      "class Solution:",
      "    def letterCombinations(self, digits):",
      "        if not digits:",
      "            return []",
      "        mapping = {'2':'abc','3':'def','4':'ghi','5':'jkl',",
      "                   '6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}",
      "        result = []",
      "        current = []",
      "",
      "        def backtrack(idx):",
      "            if idx == len(digits):",
      "                result.append(''.join(current))",
      "                return",
      "            for letter in mapping[digits[idx]]:",
      "                current.append(letter)",
      "                backtrack(idx + 1)",
      "                current.pop()",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps17(input, params), 17),
  },
  784: {
    id: 784,
    difficulty: "medium",
    slug: "letter-case-permutation",
    category: { key: "backtracking", vi: "Quay lui (Backtracking)", en: "Backtracking" },
    title: { vi: "Letter Case Permutation", en: "Letter Case Permutation" },
    titleVi: { vi: "Hoán vị hoa/thường", en: "All upper/lower permutations" },
    statement: {
      vi: "Cho chuỗi s gồm chữ cái và số. Với mỗi chữ cái, có thể chọn HOA hoặc thường. Trả về TẤT CẢ chuỗi có thể. Chữ số giữ nguyên.",
      en: "Given a string s of letters and digits. For each letter, you can choose UPPER or lower case. Return ALL possible strings. Digits stay unchanged.",
    },
    defaultInput: "a1b2",
    inputKind: "string",
    inputLabel: { vi: "s (chữ cái + số)", en: "s (letters + digits)" },
    extraParams: [],
    approach: [
      { vi: "Tại mỗi vị trí: nếu là số → giữ nguyên, tiến sang vị trí tiếp.", en: "At each position: if digit → keep as is, move to next." },
      { vi: "Nếu là chữ cái → 2 nhánh: (1) lowercase, (2) uppercase. Đệ quy sang vị trí tiếp.", en: "If letter → 2 branches: (1) lowercase, (2) uppercase. Recurse to next position." },
      { vi: "Khi hết chuỗi → lưu kết quả. Có 2^(số chữ cái) kết quả.", en: "When end of string → save result. There are 2^(letter count) results." },
    ],
    complexity: {
      time: "O(2^L · n)",
      space: "O(n)",
      note: { vi: "L = số chữ cái. 2^L nhánh × O(n) copy. Stack O(n).", en: "L = letter count. 2^L branches × O(n) copy. Stack O(n)." },
    },
    code: [
      "class Solution:",
      "    def letterCasePermutation(self, s: str):",
      "        result = []",
      "        current = list(s)",
      "",
      "        def backtrack(idx):",
      "            if idx == len(s):",
      "                result.append(''.join(current))",
      "                return",
      "            if current[idx].isdigit():",
      "                backtrack(idx + 1)",
      "            else:",
      "                current[idx] = current[idx].lower()",
      "                backtrack(idx + 1)",
      "                current[idx] = current[idx].upper()",
      "                backtrack(idx + 1)",
      "",
      "        backtrack(0)",
      "        return result",
    ],
    builder: (input, params) => addBacktrackingDecisionTree(buildSteps784(input, params), 784),
  },
};
