// Module of LeetCode Visualizer — category-specific builders and problem entries.

// External graph builders (kept separate due to size)
const {
  buildSteps1293,
  buildSteps1368,
  buildSteps1377,
  buildSteps126,
  buildSteps815,
} = require("../builders_graph");

/**
 * LeetCode 127: Word Ladder I.
 * Standard BFS: return the LENGTH of the shortest transformation sequence
 * (number of words including beginWord and endWord), or 0 if impossible.
 */
function buildSteps127(input, params) {
  const wordList = String(input).split(",").map((w) => w.trim()).filter((w) => w.length > 0);
  const beginWord = (params.beginWord || "").trim();
  const endWord = (params.endWord || "").trim();
  const steps = [];

  const wordSet = new Set(wordList);
  const displayWords = [beginWord, ...wordList.filter((w) => w !== beginWord)];

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    arr: displayWords.map((w) => (w === beginWord ? 1 : 0)),
    sub: displayWords,
    highlight: [0],
    mark: displayWords.indexOf(endWord) >= 0 ? [displayWords.indexOf(endWord)] : [],
    codeLines: [5, 6, 7, 8, 9],
    vars: [
      { name: "beginWord", value: beginWord },
      { name: "endWord", value: endWord },
      { name: "endWord in list", value: wordSet.has(endWord) },
      { name: "queue", value: `[(${beginWord}, 1)]` },
    ],
    note: {
      vi: `BFS từ "${beginWord}" đến "${endWord}".\nMỗi bước thay 1 ký tự, từ mới phải có trong wordList. Đếm số từ trong chuỗi.`,
      en: `BFS from "${beginWord}" to "${endWord}".\nChange 1 letter per step, new word must be in wordList. Count words in sequence.`,
    },
  });

  if (!wordSet.has(endWord)) {
    steps.push({
      title: { vi: `"${endWord}" không có trong wordList → 0`, en: `"${endWord}" not in wordList → 0` },
      arr: displayWords.map(() => 0),
      sub: displayWords,
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6, 7],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `"${endWord}" không có trong wordList → không thể biến đổi → 0.`,
        en: `"${endWord}" not in wordList → impossible → 0.`,
      },
    });
    return { beginWord, endWord, answer: 0, steps };
  }

  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const visited = new Set([beginWord]);
  const queue = [[beginWord, 1]];
  let head = 0;
  let answer = 0;

  while (head < queue.length) {
    const [word, stepCount] = queue[head++];

    if (word === endWord) {
      answer = stepCount;
      steps.push({
        title: { vi: `✓ Tới "${endWord}" — độ dài ${stepCount}`, en: `✓ Reached "${endWord}" — length ${stepCount}` },
        arr: displayWords.map((w) => (w === endWord ? 1 : visited.has(w) ? 1 : 0)),
        sub: displayWords,
        highlight: [displayWords.indexOf(endWord)],
        mark: [displayWords.indexOf(endWord)],
        final: true,
        codeLines: [11, 12],
        vars: [
          { name: "word", value: word },
          { name: "steps", value: stepCount },
          { name: "answer", value: stepCount },
        ],
        note: {
          vi: `Đến "${endWord}"! Độ dài chuỗi biến đổi ngắn nhất = ${stepCount} từ.`,
          en: `Reached "${endWord}"! Shortest transformation length = ${stepCount} words.`,
        },
      });
      break;
    }

    const neighbors = [];
    for (let i = 0; i < word.length; i++) {
      for (const c of alphabet) {
        if (c === word[i]) continue;
        const newWord = word.slice(0, i) + c + word.slice(i + 1);
        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, stepCount + 1]);
          neighbors.push(newWord);
        }
      }
    }

    if (neighbors.length > 0) {
      steps.push({
        title: { vi: `Xử lý "${word}" (bước ${stepCount})`, en: `Process "${word}" (step ${stepCount})` },
        arr: displayWords.map((w) => visited.has(w) ? 1 : 0),
        sub: displayWords,
        highlight: neighbors.map((nw) => displayWords.indexOf(nw)).filter((x) => x >= 0),
        mark: [displayWords.indexOf(word)].filter((x) => x >= 0),
        codeLines: [13, 14, 15, 16, 17, 18],
        vars: [
          { name: "word", value: word },
          { name: "steps", value: stepCount },
          { name: "neighbors", value: `[${neighbors.join(", ")}]` },
          { name: "queue size", value: queue.length - head },
        ],
        note: {
          vi: `Từ "${word}" (bước ${stepCount}): tìm thấy hàng xóm [${neighbors.join(", ")}] (khác 1 ký tự). Thêm vào queue với bước ${stepCount + 1}.`,
          en: `From "${word}" (step ${stepCount}): found neighbors [${neighbors.join(", ")}] (differ by 1 letter). Add to queue at step ${stepCount + 1}.`,
        },
      });
    }
  }

  if (answer === 0) {
    steps.push({
      title: { vi: "Không có đường biến đổi → 0", en: "No transformation path → 0" },
      arr: displayWords.map((w) => visited.has(w) ? 1 : 0),
      sub: displayWords,
      highlight: [],
      mark: [],
      final: true,
      codeLines: [19],
      vars: [{ name: "answer", value: 0 }],
      note: {
        vi: `Không tìm thấy đường biến đổi từ "${beginWord}" đến "${endWord}" → 0.`,
        en: `No transformation path from "${beginWord}" to "${endWord}" → 0.`,
      },
    });
  }

  return { beginWord, endWord, answer, steps };
}

/**
 * Generate steps for LeetCode 1197: Minimum Knight Moves.
 * BFS from (0,0) to (|x|,|y|), tracking visited cells on a grid.
 */
function buildSteps1197(input, params) {
  const tx = Math.abs(parseInt(String(input), 10) || 0);
  const ty = Math.abs(params.y || 0);
  const steps = [];

  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

  // BFS with bounded grid for visualization
  const minR = -2, minC = -2;
  const maxR = tx + 2, maxC = ty + 2;
  const rows = maxR - minR + 1;
  const colsN = maxC - minC + 1;

  // Grid to track distances
  const dist = {};
  const key = (r, c) => `${r},${c}`;
  dist[key(0, 0)] = 0;

  const queue = [[0, 0, 0]];
  let answer = -1;
  let bfsSteps = 0;

  // Build grid view
  function makeGrid(hlCell, pathCells) {
    const dp = [];
    for (let r = minR; r <= maxR; r++) {
      const row = [];
      for (let c = minC; c <= maxC; c++) {
        const d = dist[key(r, c)];
        row.push(d !== undefined ? String(d) : "·");
      }
      dp.push(row);
    }
    return {
      dp,
      text1: Array.from({ length: rows }, (_, i) => String(minR + i)),
      text2: Array.from({ length: colsN }, (_, i) => String(minC + i)),
      hlCell: hlCell ? [hlCell[0] - minR, hlCell[1] - minC] : null,
      pathCells: (pathCells || []).map(([r, c]) => [r - minR, c - minC]),
    };
  }

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    arr: [],
    grid: makeGrid([0, 0], []),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6, 7, 8],
    vars: [
      { name: "start", value: "(0, 0)" },
      { name: "target", value: `(${tx}, ${ty})` },
      { name: "queue", value: "[(0,0,0)]" },
    ],
    note: {
      vi: `BFS từ (0,0) đến (${tx},${ty}). Mã di chuyển L-shape: 8 hướng.\nGrid hiển thị số bước tới mỗi ô đã thăm.`,
      en: `BFS from (0,0) to (${tx},${ty}). Knight moves in L-shape: 8 directions.\nGrid shows steps to reach each visited cell.`,
    },
  });

  // Run BFS
  let head = 0;
  while (head < queue.length) {
    const [cx, cy, curSteps] = queue[head++];

    if (cx === tx && cy === ty) {
      answer = curSteps;
      // Reconstruct path (BFS guarantees shortest)
      steps.push({
        title: { vi: `✓ Đã tới (${tx},${ty}) trong ${answer} bước`, en: `✓ Reached (${tx},${ty}) in ${answer} moves` },
        arr: [],
        grid: makeGrid([tx, ty], [[0, 0], [tx, ty]]),
        highlight: [],
        mark: [],
        codeLines: [11, 12],
        vars: [
          { name: "position", value: `(${cx}, ${cy})` },
          { name: "steps", value: curSteps },
          { name: "visited", value: Object.keys(dist).length },
        ],
        note: {
          vi: `Đến đích (${tx},${ty})! Số bước tối thiểu = ${answer}.`,
          en: `Reached target (${tx},${ty})! Minimum moves = ${answer}.`,
        },
      });
      break;
    }

    bfsSteps++;
    // Only show some BFS expansion steps to keep it manageable
    const showThisStep = bfsSteps <= 15 || curSteps <= 2;

    let expanded = 0;
    for (const [dx, dy] of knightMoves) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < minR || nx > maxR || ny < minC || ny > maxC) continue;
      if (dist[key(nx, ny)] !== undefined) continue;

      dist[key(nx, ny)] = curSteps + 1;
      queue.push([nx, ny, curSteps + 1]);
      expanded++;
    }

    if (showThisStep && expanded > 0) {
      steps.push({
        title: { vi: `BFS: (${cx},${cy}) step=${curSteps}`, en: `BFS: (${cx},${cy}) step=${curSteps}` },
        arr: [],
        grid: makeGrid([cx, cy], []),
        highlight: [],
        mark: [],
        codeLines: [9, 10, 13, 14, 15, 16, 17],
        vars: [
          { name: "position", value: `(${cx}, ${cy})` },
          { name: "steps", value: curSteps },
          { name: "expanded", value: expanded },
          { name: "queue size", value: queue.length - head },
          { name: "visited", value: Object.keys(dist).length },
        ],
        note: {
          vi: `Xử lý (${cx},${cy}) ở bước ${curSteps}. Thêm ${expanded} ô mới vào queue.`,
          en: `Process (${cx},${cy}) at step ${curSteps}. Added ${expanded} new cells to queue.`,
        },
      });
    }

    if (steps.length > 60) break; // Safety limit
  }

  if (answer === -1) answer = 0;

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    grid: makeGrid([tx, ty], [[0, 0], [tx, ty]]),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [12],
    vars: [
      { name: "answer", value: answer },
      { name: "cells visited", value: Object.keys(dist).length },
    ],
    note: {
      vi: `Số bước mã tối thiểu từ (0,0) đến (${tx},${ty}) = ${answer}.`,
      en: `Minimum knight moves from (0,0) to (${tx},${ty}) = ${answer}.`,
    },
  });

  return { x: tx, y: ty, answer, steps };
}

/**
 * Generate steps for LeetCode 743: Network Delay Time.
 * Dijkstra's algorithm: process closest unvisited node, relax neighbors.
 */
function buildSteps743(input, params) {
  const edgesRaw = String(input).split(",").map((e) => e.trim()).filter((e) => e.length > 0);
  const n = params.n || 4;
  const k = params.k || 1;
  const steps = [];

  // Parse edges
  const edgeList = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return { u: parts[0], v: parts[1], w: parts[2] };
  });

  // Build adjacency list
  const adjList = {};
  for (let i = 1; i <= n; i++) adjList[i] = [];
  for (const { u, v, w } of edgeList) {
    adjList[u].push({ v, w });
  }

  // Initialize distances
  const dist = {};
  for (let i = 1; i <= n; i++) dist[i] = Infinity;
  dist[k] = 0;

  const visited = new Set();
  const nodes = Array.from({ length: n }, (_, i) => i + 1);

  // Helper: build graph data for a step
  function makeGraph(hlNodes, hlEdges) {
    return {
      nodes: nodes.map((id) => ({ id, dist: dist[id] })),
      edges: edgeList,
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: [...visited],
    };
  }

  const distStr = () => nodes.map((id) => `${id}:${dist[id] === Infinity ? "∞" : dist[id]}`).join(", ");

  steps.push({
    title: { vi: "Khởi tạo Dijkstra", en: "Initialize Dijkstra" },
    arr: [],
    graph: makeGraph([k], []),
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6, 7, 8, 9],
    vars: [
      { name: "source", value: k },
      { name: "n", value: n },
      { name: "edges", value: edgeList.length },
      { name: "dist", value: `{${distStr()}}` },
    ],
    note: {
      vi: `Dijkstra từ nút ${k}. dist[${k}]=0, còn lại = ∞. Đồ thị có ${n} nút, ${edgeList.length} cạnh.`,
      en: `Dijkstra from node ${k}. dist[${k}]=0, others = ∞. Graph has ${n} nodes, ${edgeList.length} edges.`,
    },
  });

  // Dijkstra main loop
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    let minDist = Infinity;
    for (let i = 1; i <= n; i++) {
      if (!visited.has(i) && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }

    if (u === -1) break;

    visited.add(u);

    steps.push({
      title: { vi: `Pop nút ${u} (dist=${minDist})`, en: `Pop node ${u} (dist=${minDist})` },
      arr: [],
      graph: makeGraph([u], []),
      highlight: [],
      mark: [],
      codeLines: [10, 11, 12],
      vars: [
        { name: "u", value: u },
        { name: "dist[u]", value: minDist },
        { name: "visited", value: `{${[...visited].join(", ")}}` },
        { name: "dist", value: `{${distStr()}}` },
      ],
      note: {
        vi: `Chọn nút chưa thăm có dist nhỏ nhất: nút ${u} (dist=${minDist}). Đánh dấu đã thăm.`,
        en: `Pick unvisited node with smallest dist: node ${u} (dist=${minDist}). Mark as visited.`,
      },
    });

    // Relax neighbors
    for (const { v, w } of adjList[u]) {
      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        const oldDist = dist[v];
        dist[v] = newDist;

        steps.push({
          title: { vi: `Relax ${u}→${v}: ${oldDist === Infinity ? "∞" : oldDist} → ${newDist}`, en: `Relax ${u}→${v}: ${oldDist === Infinity ? "∞" : oldDist} → ${newDist}` },
          arr: [],
          graph: makeGraph([u, v], [[u, v]]),
          highlight: [],
          mark: [],
          codeLines: [13, 14, 15, 16, 17],
          vars: [
            { name: "u", value: u },
            { name: "v", value: v },
            { name: "w", value: w },
            { name: "dist[u]+w", value: newDist },
            { name: "dist[v] (old)", value: oldDist === Infinity ? "∞" : oldDist },
            { name: "dist[v] (new)", value: newDist },
            { name: "dist", value: `{${distStr()}}` },
          ],
          note: {
            vi: `Cạnh ${u}→${v} (w=${w}): dist[${u}]+${w}=${newDist} < ${oldDist === Infinity ? "∞" : oldDist} → cập nhật dist[${v}]=${newDist}.`,
            en: `Edge ${u}→${v} (w=${w}): dist[${u}]+${w}=${newDist} < ${oldDist === Infinity ? "∞" : oldDist} → update dist[${v}]=${newDist}.`,
          },
        });
      } else {
        steps.push({
          title: { vi: `Cạnh ${u}→${v}: không cải thiện`, en: `Edge ${u}→${v}: no improvement` },
          arr: [],
          graph: makeGraph([u, v], [[u, v]]),
          highlight: [],
          mark: [],
          codeLines: [13, 14, 15],
          vars: [
            { name: "u", value: u },
            { name: "v", value: v },
            { name: "w", value: w },
            { name: "dist[u]+w", value: newDist },
            { name: "dist[v]", value: dist[v] === Infinity ? "∞" : dist[v] },
          ],
          note: {
            vi: `Cạnh ${u}→${v} (w=${w}): dist[${u}]+${w}=${newDist} ≥ dist[${v}]=${dist[v] === Infinity ? "∞" : dist[v]} → bỏ qua.`,
            en: `Edge ${u}→${v} (w=${w}): dist[${u}]+${w}=${newDist} ≥ dist[${v}]=${dist[v] === Infinity ? "∞" : dist[v]} → skip.`,
          },
        });
      }
    }
  }

  // Final result
  const maxDist = Math.max(...nodes.map((node) => dist[node]));
  const answer = maxDist === Infinity ? -1 : maxDist;

  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: [],
    graph: makeGraph(maxDist !== Infinity ? nodes.filter((id) => dist[id] === maxDist) : [], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [18, 19],
    vars: [
      { name: "dist", value: `{${distStr()}}` },
      { name: "max(dist)", value: maxDist === Infinity ? "∞" : maxDist },
      { name: "answer", value: answer },
    ],
    note: {
      vi: answer === -1
        ? `Có nút không thể đạt tới từ nút ${k} → trả về -1.`
        : `Thời gian tối đa = max(dist) = ${answer}. Tất cả ${n} nút đều nhận tín hiệu trong ${answer} đơn vị thời gian.`,
      en: answer === -1
        ? `Some nodes are unreachable from node ${k} → return -1.`
        : `Maximum time = max(dist) = ${answer}. All ${n} nodes receive the signal within ${answer} time units.`,
    },
  });

  return { edges: edgesRaw, n, k, answer, steps };
}

/**
 * Generate steps for LeetCode 851: Loud and Rich.
 * DFS on reversed richer graph: for each node, find the quietest person among all richer people.
 */
function buildSteps851(input, params) {
  const richerRaw = String(input).split(",").map((e) => e.trim()).filter((e) => e.length > 0);
  const quietArr = String(params.quiet || "").split(",").map((s) => parseInt(s.trim(), 10));
  const n = quietArr.length;
  const steps = [];

  // Parse richer edges: a-b means a is richer than b
  const richerEdges = richerRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return { a: parts[0], b: parts[1] };
  });

  // Build graph: b -> [a] (people richer than b)
  const graph = {};
  for (let i = 0; i < n; i++) graph[i] = [];
  for (const { a, b } of richerEdges) {
    graph[b].push(a);
  }

  const answer = new Array(n).fill(-1);
  const nodes = Array.from({ length: n }, (_, i) => i);

  // Graph visualization helper
  function makeGraph(hlNodes, hlEdges) {
    return {
      nodes: nodes.map((id) => ({ id, dist: answer[id] === -1 ? undefined : quietArr[answer[id]] })),
      edges: richerEdges.map(({ a, b }) => ({ u: a, v: b, w: "" })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: nodes.filter((i) => answer[i] !== -1),
    };
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    codeLines: [2, 3, 4, 5, 6],
    vars: [
      { name: "n", value: n },
      { name: "quiet", value: `[${quietArr.join(", ")}]` },
      { name: "richer edges", value: richerEdges.length },
    ],
    note: {
      vi: `${n} người, quiet = [${quietArr.join(", ")}]. Đồ thị: cạnh a→b nghĩa là a giàu hơn b. DFS từ mỗi nút tìm người ít ồn nhất trong tất cả người giàu hơn.`,
      en: `${n} people, quiet = [${quietArr.join(", ")}]. Graph: edge a→b means a is richer than b. DFS from each node to find quietest among all richer people.`,
    },
  });

  // DFS with memoization
  function dfs(node, depth) {
    if (answer[node] !== -1) return;

    answer[node] = node; // initially, the quietest richer person is itself

    steps.push({
      title: { vi: `DFS(${node}): answer[${node}] = ${node}`, en: `DFS(${node}): answer[${node}] = ${node}` },
      arr: [],
      graph: makeGraph([node], []),
      highlight: [],
      mark: [],
      codeLines: [8, 9, 10, 11],
      vars: [
        { name: "node", value: node },
        { name: "quiet[node]", value: quietArr[node] },
        { name: "answer[node]", value: node },
        { name: "answer", value: `[${answer.join(", ")}]` },
      ],
      note: {
        vi: `Bắt đầu DFS tại nút ${node} (quiet=${quietArr[node]}). Khởi tạo answer[${node}] = ${node}.`,
        en: `Start DFS at node ${node} (quiet=${quietArr[node]}). Initialize answer[${node}] = ${node}.`,
      },
    });

    for (const neighbor of graph[node]) {
      dfs(neighbor, depth + 1);

      const hlEdge = [[neighbor, node]]; // neighbor is richer than node
      if (quietArr[answer[neighbor]] < quietArr[answer[node]]) {
        const oldAns = answer[node];
        answer[node] = answer[neighbor];

        steps.push({
          title: { vi: `${node}←${neighbor}: quiet[${answer[neighbor]}]=${quietArr[answer[neighbor]]} < quiet[${oldAns}]=${quietArr[oldAns]} → cập nhật`, en: `${node}←${neighbor}: quiet[${answer[neighbor]}]=${quietArr[answer[neighbor]]} < quiet[${oldAns}]=${quietArr[oldAns]} → update` },
          arr: [],
          graph: makeGraph([node, neighbor], hlEdge),
          highlight: [],
          mark: [],
          codeLines: [12, 13, 14, 15],
          vars: [
            { name: "node", value: node },
            { name: "neighbor", value: neighbor },
            { name: "answer[neighbor]", value: answer[neighbor] },
            { name: "quiet comparison", value: `${quietArr[answer[neighbor]]} < ${quietArr[oldAns]}` },
            { name: "answer[node]", value: answer[node] },
          ],
          note: {
            vi: `Người ${answer[neighbor]} (quiet=${quietArr[answer[neighbor]]}) ít ồn hơn ${oldAns} (quiet=${quietArr[oldAns]}) → answer[${node}] = ${answer[node]}.`,
            en: `Person ${answer[neighbor]} (quiet=${quietArr[answer[neighbor]]}) is quieter than ${oldAns} (quiet=${quietArr[oldAns]}) → answer[${node}] = ${answer[node]}.`,
          },
        });
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (answer[i] === -1) {
      dfs(i, 0);
    }
  }

  steps.push({
    title: { vi: `Kết quả: [${answer.join(", ")}]`, en: `Result: [${answer.join(", ")}]` },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [17, 18, 19],
    vars: [
      { name: "answer", value: `[${answer.join(", ")}]` },
    ],
    note: {
      vi: `Với mỗi người i, answer[i] là người ít ồn nhất trong tất cả những người giàu hơn hoặc bằng i. Kết quả: [${answer.join(", ")}].`,
      en: `For each person i, answer[i] is the quietest person among all people richer than or equal to i. Result: [${answer.join(", ")}].`,
    },
  });

  return { richer: richerRaw, quiet: quietArr, answer: `[${answer.join(", ")}]`, steps };
}

/**
 * Generate steps for LeetCode 752: Open the Lock.
 * BFS in state space — each state is a 4-digit string; 8 neighbors per state.
 */
function buildSteps752(input, params) {
  const deadendsRaw = String(input).split(",").map((s) => s.trim()).filter((s) => s.length === 4);
  const target = String(params.target || "0202").padStart(4, "0").slice(0, 4);
  const steps = [];
  const start = "0000";

  const deadSet = new Set(deadendsRaw);

  // Helper: format state as bars (digits 0-9)
  function makeBars(state, label) {
    return {
      arr: state.split("").map(Number),
      sub: ["w0", "w1", "w2", "w3"],
      label,
    };
  }

  // Initial step
  if (deadSet.has(start)) {
    steps.push({
      title: { vi: "0000 là deadend → -1", en: "0000 is a deadend → -1" },
      arr: [0, 0, 0, 0],
      sub: ["w0", "w1", "w2", "w3"],
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6, 7],
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Trạng thái bắt đầu 0000 nằm trong deadends → không mở được.", en: "Start state 0000 is in deadends → cannot open." },
    });
    return { target, deadends: deadendsRaw, answer: -1, steps };
  }

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    arr: [0, 0, 0, 0],
    sub: ["w0", "w1", "w2", "w3"],
    highlight: [],
    mark: [],
    codeLines: [4, 5, 6, 7, 8, 9],
    vars: [
      { name: "start", value: start },
      { name: "target", value: target },
      { name: "deadends", value: deadendsRaw.length ? deadendsRaw.join(", ") : "none" },
      { name: "queue", value: `[(${start}, 0)]` },
    ],
    note: {
      vi:
        `Ổ khóa 4 chữ số, bắt đầu "${start}". Mỗi bước xoay 1 vành 1 nấc (lên/xuống).\n` +
        `Tìm số bước ít nhất để đạt "${target}". Tránh deadends [${deadendsRaw.join(", ") || "—"}].\n` +
        `Dùng BFS — mỗi level = 1 bước xoay.`,
      en:
        `4-digit lock, start at "${start}". Each move turns one wheel up/down by 1.\n` +
        `Find min moves to reach "${target}". Avoid deadends [${deadendsRaw.join(", ") || "—"}].\n` +
        `Use BFS — each level = 1 turn.`,
    },
  });

  // BFS
  const visited = new Set([start]);
  let frontier = [start];
  let answer = -1;
  let level = 0;
  const MAX_STEPS_SHOW = 20;
  let stepShown = 1;

  if (start === target) {
    answer = 0;
  }

  while (frontier.length > 0 && answer === -1) {
    level++;
    const nextFrontier = [];
    const expandedFrom = frontier[0]; // for display

    for (const state of frontier) {
      // Generate 8 neighbors
      for (let i = 0; i < 4; i++) {
        for (const delta of [-1, 1]) {
          const d = (Number(state[i]) + delta + 10) % 10;
          const next = state.slice(0, i) + d + state.slice(i + 1);
          if (visited.has(next) || deadSet.has(next)) continue;
          visited.add(next);
          if (next === target) {
            answer = level;
          }
          nextFrontier.push(next);
        }
      }
      if (answer !== -1) break;
    }

    if (stepShown < MAX_STEPS_SHOW) {
      stepShown++;
      const sampleState = nextFrontier[0] || expandedFrom;
      steps.push({
        title: { vi: `Bước ${level}: ${nextFrontier.length} trạng thái mới`, en: `Step ${level}: ${nextFrontier.length} new states` },
        arr: sampleState.split("").map(Number),
        sub: ["w0", "w1", "w2", "w3"],
        highlight: [],
        mark: answer !== -1 && nextFrontier.includes(target) ? [0, 1, 2, 3] : [],
        codeLines: [11, 12, 13, 14, 15, 16, 17, 18],
        vars: [
          { name: "level (turns)", value: level },
          { name: "frontier size", value: frontier.length },
          { name: "next frontier", value: nextFrontier.length },
          { name: "sample new state", value: nextFrontier[0] || "(none)" },
          { name: "visited", value: visited.size },
          { name: "found target", value: answer !== -1 },
        ],
        note: {
          vi:
            `Bước ${level}: từ ${frontier.length} trạng thái, sinh ${nextFrontier.length} trạng thái mới (bỏ visited & deadends).\n` +
            (answer !== -1
              ? `✓ Đã tới "${target}" sau ${level} bước!`
              : `Tiếp tục BFS với frontier mới.`),
          en:
            `Step ${level}: from ${frontier.length} states, generated ${nextFrontier.length} new (skip visited & deadends).\n` +
            (answer !== -1
              ? `✓ Reached "${target}" in ${level} turns!`
              : `Continue BFS with new frontier.`),
        },
      });
    }

    if (answer !== -1 || nextFrontier.length === 0) break;
    frontier = nextFrontier;
  }

  // Final
  steps.push({
    title: { vi: `Kết quả: ${answer}`, en: `Result: ${answer}` },
    arr: target.split("").map(Number),
    sub: ["w0", "w1", "w2", "w3"],
    highlight: [],
    mark: answer !== -1 ? [0, 1, 2, 3] : [],
    final: true,
    codeLines: [19],
    vars: [
      { name: "answer", value: answer },
      { name: "states explored", value: visited.size },
    ],
    note: {
      vi: answer >= 0
        ? `Mở được khóa "${target}" sau ${answer} bước xoay (đã khám phá ${visited.size} trạng thái).`
        : `Không thể mở khóa "${target}" do bị chặn bởi deadends.`,
      en: answer >= 0
        ? `Opened lock "${target}" in ${answer} turns (explored ${visited.size} states).`
        : `Cannot open lock "${target}" — blocked by deadends.`,
    },
  });

  return { target, deadends: deadendsRaw, answer, steps };
}

/**
 * Generate steps for LeetCode 1236: Web Crawler.
 * BFS from startUrl, follow only links with the SAME hostname.
 * Hostname = substring before the first '/' (or whole string if no slash).
 */
function buildSteps1236(input, params) {
  const urls = String(input).split(";").map((u) => u.trim()).filter((u) => u.length > 0);
  const edgesRaw = String(params.edges || "")
    .split(";")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
  const startUrl = String(params.startUrl || "").trim();
  const steps = [];

  // Build adjacency map
  const adj = {};
  for (const u of urls) adj[u] = [];
  for (const e of edgesRaw) {
    const arrow = e.split("->");
    if (arrow.length !== 2) continue;
    const [from, to] = arrow.map((s) => s.trim());
    if (adj[from]) adj[from].push(to);
  }

  // Extract hostname (everything up to the first '/')
  const hostOf = (u) => {
    const i = u.indexOf("/");
    return i < 0 ? u : u.slice(0, i);
  };

  const startHost = hostOf(startUrl);

  steps.push({
    title: { vi: "Khởi tạo BFS", en: "Initialize BFS" },
    arr: urls.map((u) => (u === startUrl ? 1 : 0)),
    sub: urls,
    highlight: urls.indexOf(startUrl) >= 0 ? [urls.indexOf(startUrl)] : [],
    mark: [],
    codeLines: [4, 5, 6, 7],
    vars: [
      { name: "startUrl", value: startUrl },
      { name: "hostname", value: startHost },
      { name: "queue", value: `[${startUrl}]` },
      { name: "visited", value: 1 },
    ],
    note: {
      vi:
        `Crawl từ "${startUrl}". Hostname = "${startHost}".\n` +
        `BFS: chỉ follow link nếu URL đích cùng hostname.\n` +
        `Bỏ qua URL đã thăm để tránh lặp vô hạn.`,
      en:
        `Crawl from "${startUrl}". Hostname = "${startHost}".\n` +
        `BFS: only follow links whose target URL has the same hostname.\n` +
        `Skip already-visited URLs to avoid infinite loops.`,
    },
  });

  // BFS
  const visited = new Set([startUrl]);
  const queue = [startUrl];
  let head = 0;
  const result = [];

  while (head < queue.length) {
    const cur = queue[head++];
    result.push(cur);

    const links = adj[cur] || [];
    const followed = [];
    const skippedHost = [];
    const skippedVisited = [];

    for (const link of links) {
      if (hostOf(link) !== startHost) {
        skippedHost.push(link);
        continue;
      }
      if (visited.has(link)) {
        skippedVisited.push(link);
        continue;
      }
      visited.add(link);
      queue.push(link);
      followed.push(link);
    }

    const noteLines = [];
    if (followed.length) noteLines.push(`✓ Follow (cùng host): ${followed.join(", ")}`);
    if (skippedHost.length) noteLines.push(`✗ Skip (khác host): ${skippedHost.join(", ")}`);
    if (skippedVisited.length) noteLines.push(`↩ Skip (đã thăm): ${skippedVisited.join(", ")}`);
    if (noteLines.length === 0) noteLines.push("(không có link nào)");

    const noteLinesEn = [];
    if (followed.length) noteLinesEn.push(`✓ Follow (same host): ${followed.join(", ")}`);
    if (skippedHost.length) noteLinesEn.push(`✗ Skip (different host): ${skippedHost.join(", ")}`);
    if (skippedVisited.length) noteLinesEn.push(`↩ Skip (already visited): ${skippedVisited.join(", ")}`);
    if (noteLinesEn.length === 0) noteLinesEn.push("(no links)");

    steps.push({
      title: { vi: `Crawl: ${cur}`, en: `Crawl: ${cur}` },
      arr: urls.map((u) => (visited.has(u) ? 1 : 0)),
      sub: urls,
      highlight: followed.map((u) => urls.indexOf(u)).filter((i) => i >= 0),
      mark: [urls.indexOf(cur)].filter((i) => i >= 0),
      codeLines: [9, 10, 11, 12, 13, 14, 15, 16],
      vars: [
        { name: "current", value: cur },
        { name: "links found", value: links.length },
        { name: "followed", value: followed.length },
        { name: "skipped (host)", value: skippedHost.length },
        { name: "skipped (seen)", value: skippedVisited.length },
        { name: "queue size", value: queue.length - head },
        { name: "visited", value: visited.size },
      ],
      note: {
        vi: `Lấy "${cur}" ra khỏi queue. Có ${links.length} link.\n` + noteLines.join("\n"),
        en: `Pop "${cur}" from queue. Has ${links.length} link(s).\n` + noteLinesEn.join("\n"),
      },
    });
  }

  steps.push({
    title: { vi: `Kết quả: ${result.length} URL`, en: `Result: ${result.length} URLs` },
    arr: urls.map((u) => (visited.has(u) ? 1 : 0)),
    sub: urls,
    highlight: [],
    mark: urls.map((u, i) => (visited.has(u) ? i : -1)).filter((i) => i >= 0),
    final: true,
    codeLines: [17],
    vars: [
      { name: "total crawled", value: result.length },
      { name: "URLs", value: result.join(", ") },
    ],
    note: {
      vi: `Đã crawl ${result.length} URL cùng hostname "${startHost}":\n${result.join("\n")}`,
      en: `Crawled ${result.length} URLs on hostname "${startHost}":\n${result.join("\n")}`,
    },
  });

  return { startUrl, hostname: startHost, answer: result.length, steps };
}

/**
 * Generate steps for LeetCode 1136: Parallel Courses.
 * Topological sort (Kahn's algorithm / BFS):
 *  - Find all courses with in-degree 0 → take them this semester.
 *  - Decrement in-degree of their dependents.
 *  - Repeat until all courses taken (return semester count) or stuck (cycle → -1).
 */
function buildSteps1136(input, params) {
  const n = params.n || 3;
  const edgesRaw = String(input).split(",").map((e) => e.trim()).filter((e) => e.length > 0);
  const edges = edgesRaw.map((e) => {
    const parts = e.split("-").map(Number);
    return [parts[0], parts[1]]; // [prereq, course]
  });
  const steps = [];

  // Build adjacency + in-degree
  const adj = {};
  const inDeg = {};
  const courses = Array.from({ length: n }, (_, i) => i + 1);
  for (const c of courses) { adj[c] = []; inDeg[c] = 0; }
  for (const [u, v] of edges) {
    adj[u].push(v);
    inDeg[v] = (inDeg[v] || 0) + 1;
  }

  const taken = new Set();

  // Graph snapshot helper
  function makeGraph(hlNodes, hlEdges) {
    return {
      nodes: courses.map((id) => ({ id, dist: inDeg[id] })),
      edges: edges.map(([u, v]) => ({ u, v, w: "" })),
      hlNodes: hlNodes || [],
      hlEdges: hlEdges || [],
      visitedNodes: [...taken],
    };
  }

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    codeLines: [3, 4, 5, 6, 7],
    vars: [
      { name: "n", value: n },
      { name: "prerequisites", value: edges.map(([u, v]) => `${u}→${v}`).join(", ") || "none" },
      { name: "in-degree", value: courses.map((c) => `${c}:${inDeg[c]}`).join(", ") },
    ],
    note: {
      vi:
        `Có ${n} môn (1..${n}), ${edges.length} điều kiện tiên quyết.\n` +
        `Số bên dưới mỗi nút = in-degree (số môn phải học trước môn đó).\n` +
        `Mỗi học kỳ học MỌI môn có in-degree = 0. Sau đó giảm in-degree các môn phụ thuộc.\n` +
        `Lặp đến khi hết hoặc còn nút mà mọi cái đều có in-degree > 0 (có chu trình → -1).`,
      en:
        `${n} courses (1..${n}), ${edges.length} prerequisites.\n` +
        `Number below each node = in-degree (number of prerequisites).\n` +
        `Each semester, take EVERY course with in-degree = 0. Then decrement in-degree of dependents.\n` +
        `Repeat until done, or stuck (cycle → -1).`,
    },
  });

  let semester = 0;
  let answer = -1;

  while (taken.size < n) {
    // Find courses with in-degree 0 and not yet taken
    const available = courses.filter((c) => !taken.has(c) && inDeg[c] === 0);

    if (available.length === 0) {
      // Stuck → cycle detected
      steps.push({
        title: { vi: "Bế tắc → có chu trình", en: "Stuck → cycle detected" },
        arr: [],
        graph: makeGraph(courses.filter((c) => !taken.has(c)), []),
        highlight: [],
        mark: [],
        final: true,
        codeLines: [14, 15],
        vars: [
          { name: "semester", value: semester },
          { name: "taken", value: `${taken.size}/${n}` },
          { name: "remaining in-degrees", value: courses.filter((c) => !taken.has(c)).map((c) => `${c}:${inDeg[c]}`).join(", ") },
          { name: "answer", value: -1 },
        ],
        note: {
          vi:
            `Không còn môn nào có in-degree = 0, nhưng vẫn còn ${n - taken.size} môn chưa học.\n` +
            `Đồ thị có chu trình → không thể hoàn thành → trả về -1.`,
          en:
            `No course has in-degree = 0, but ${n - taken.size} courses remain.\n` +
            `Graph has a cycle → impossible → return -1.`,
        },
      });
      return { n, edges: edgesRaw, answer: -1, steps };
    }

    semester++;
    // Take all available courses this semester
    for (const c of available) taken.add(c);

    // Decrement in-degree of their dependents
    const hlEdges = [];
    for (const c of available) {
      for (const next of adj[c]) {
        inDeg[next]--;
        hlEdges.push([c, next]);
      }
    }

    steps.push({
      title: { vi: `Học kỳ ${semester}: học ${available.length} môn`, en: `Semester ${semester}: take ${available.length} course(s)` },
      arr: [],
      graph: makeGraph(available, hlEdges),
      highlight: [],
      mark: [],
      codeLines: [9, 10, 11, 12, 13],
      vars: [
        { name: "semester", value: semester },
        { name: "take this term", value: `[${available.join(", ")}]` },
        { name: "after decrement", value: courses.filter((c) => !taken.has(c)).map((c) => `${c}:${inDeg[c]}`).join(", ") || "(all taken)" },
        { name: "total taken", value: `${taken.size}/${n}` },
      ],
      note: {
        vi:
          `Học kỳ ${semester}: lấy mọi môn có in-degree = 0 → [${available.join(", ")}].\n` +
          `Giảm in-degree các môn phụ thuộc qua ${hlEdges.length} cạnh.\n` +
          `Đã học ${taken.size}/${n} môn.`,
        en:
          `Semester ${semester}: take all courses with in-degree = 0 → [${available.join(", ")}].\n` +
          `Decrement in-degree of dependents through ${hlEdges.length} edges.\n` +
          `Total taken: ${taken.size}/${n}.`,
      },
    });
  }

  answer = semester;
  steps.push({
    title: { vi: `Kết quả: ${answer} học kỳ`, en: `Result: ${answer} semesters` },
    arr: [],
    graph: makeGraph([], []),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [16],
    vars: [
      { name: "semesters", value: answer },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Hoàn thành tất cả ${n} môn trong ${answer} học kỳ.`,
      en: `Completed all ${n} courses in ${answer} semesters.`,
    },
  });

  return { n, edges: edgesRaw, answer, steps };
}

module.exports = {
  1293: {
    id: 1293,
    difficulty: "hard",
    slug: "shortest-path-in-a-grid-with-obstacles-elimination",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Shortest Path in a Grid with Obstacles Elimination", en: "Shortest Path in a Grid with Obstacles Elimination" },
    titleVi: { vi: "Đường ngắn nhất phá vật cản (BFS 3D)", en: "BFS shortest path eliminating obstacles" },
    statement: { vi: "Cho lưới m×n (0=trống, 1=vật cản). Tìm đường ngắn nhất từ (0,0) đến (m-1,n-1) nếu được phá tối đa k vật cản.", en: "Given an m×n grid (0=empty, 1=obstacle). Find the shortest path from (0,0) to (m-1,n-1) eliminating at most k obstacles." },
    defaultInput: [0,0,0,0,1,1,1,0,0,0,0,0],
    inputKind: "nonneg",
    inputLabel: { vi: "Grid (row-major, 0/1)", en: "Grid (row-major, 0/1)" },
    extraParams: [
      { key: "rows", label: { vi: "rows", en: "rows" }, default: 3 },
      { key: "cols", label: { vi: "cols", en: "cols" }, default: 4 },
      { key: "k", label: { vi: "k (phá tối đa)", en: "k (max eliminations)" }, default: 1 },
    ],
    complexity: { time: "O(m·n·k)", space: "O(m·n·k)", note: { vi: "BFS 3D trạng thái.", en: "3D state BFS." } },
    code: ["class Solution:", "    def shortestPath(self, grid, k):", "        from collections import deque", "        m, n = len(grid), len(grid[0])", "        q = deque([(0,0,k,0)])", "        vis = {(0,0,k)}", "        while q:", "            r,c,rem,d = q.popleft()", "            if r==m-1 and c==n-1: return d", "            for dr,dc in [(0,1),(0,-1),(1,0),(-1,0)]:", "                nr,nc = r+dr,c+dc", "                if 0<=nr<m and 0<=nc<n:", "                    nk = rem - grid[nr][nc]", "                    if nk>=0 and (nr,nc,nk) not in vis:", "                        vis.add((nr,nc,nk))", "                        q.append((nr,nc,nk,d+1))", "        return -1"],
    builder: buildSteps1293,
  },
  1377: {
    id: 1377,
    difficulty: "medium",
    slug: "frog-position-after-t-seconds",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Frog Position After T Seconds", en: "Frog Position After T Seconds" },
    titleVi: { vi: "Xác suất vị trí ếch", en: "Frog probability via BFS" },
    statement: { vi: "Cây n đỉnh, ếch bắt đầu ở 1. Mỗi giây nhảy sang con ngẫu nhiên. Tìm P(ếch ở target sau t giây).", en: "Tree of n nodes, frog at 1. Each second jumps to random unvisited child. Find P(at target after t seconds)." },
    defaultInput: "1,2;1,3;1,7;2,4;2,6;3,5",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u,v;ngăn cặp)", en: "Edges (u,v;semicolons)" },
    extraParams: [
      { key: "n", label: { vi: "n", en: "n" }, default: 7 },
      { key: "t", label: { vi: "t (giây)", en: "t (seconds)" }, default: 2 },
      { key: "target", label: { vi: "target", en: "target" }, default: 4 },
    ],
    complexity: { time: "O(n)", space: "O(n)", note: { vi: "BFS cây t mức.", en: "BFS tree for t levels." } },
    code: ["class Solution:", "    def frogPosition(self, n, edges, t, target):", "        adj = [[] for _ in range(n+1)]", "        for u,v in edges:", "            adj[u].append(v); adj[v].append(u)", "        prob = [0]*(n+1); prob[1] = 1", "        vis = [False]*(n+1); vis[1] = True", "        q = [1]", "        for _ in range(t):", "            nq = []", "            for u in q:", "                ch = [v for v in adj[u] if not vis[v]]", "                if not ch: nq.append(u); continue", "                for v in ch: vis[v]=True; prob[v]=prob[u]/len(ch)", "                prob[u] = 0; nq.extend(ch)", "            q = nq", "        return prob[target]"],
    builder: buildSteps1377,
  },
  1197: {
    id: 1197,
    difficulty: "medium",
    slug: "minimum-knight-moves",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Knight Moves", en: "Minimum Knight Moves" },
    titleVi: { vi: "Số bước mã tối thiểu", en: "Minimum knight moves" },
    statement: {
      vi:
        "Trên bàn cờ vô hạn, quân mã bắt đầu tại (0,0). Tìm số bước di chuyển tối thiểu để đến ô (x,y). " +
        "Mã di chuyển theo hình chữ L: (±1,±2) hoặc (±2,±1). Dùng BFS.",
      en:
        "On an infinite chessboard, a knight starts at (0,0). Find the minimum number of moves to reach (x,y). " +
        "A knight moves in an L-shape: (±1,±2) or (±2,±1). Uses BFS.",
    },
    defaultInput: "2",
    inputKind: "string",
    inputLabel: { vi: "x (tọa độ đích)", en: "x (target x)" },
    extraParams: [
      {
        key: "y",
        label: { vi: "y (tọa độ đích)", en: "y (target y)" },
        default: 1,
      },
    ],
    complexity: {
      time: "O(|x|·|y|)",
      space: "O(|x|·|y|)",
      note: {
        vi: "BFS khám phá tối đa O(|x|·|y|) ô. Queue + visited set → O(|x|·|y|) bộ nhớ.",
        en: "BFS explores at most O(|x|·|y|) cells. Queue + visited set → O(|x|·|y|) memory.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def minKnightMoves(self, x: int, y: int) -> int:",
      "        x, y = abs(x), abs(y)",
      "        queue = deque([(0, 0, 0)])",
      "        visited = {(0, 0)}",
      "        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),",
      "                 (1,-2),(1,2),(2,-1),(2,1)]",
      "        while queue:",
      "            cx, cy, steps = queue.popleft()",
      "            if cx == x and cy == y:",
      "                return steps",
      "            for dx, dy in moves:",
      "                nx, ny = cx+dx, cy+dy",
      "                if (nx,ny) not in visited and -2<=nx<=x+2 and -2<=ny<=y+2:",
      "                    visited.add((nx, ny))",
      "                    queue.append((nx, ny, steps+1))",
    ],
    builder: buildSteps1197,
  },
  126: {
    id: 126,
    difficulty: "hard",
    slug: "word-ladder-ii",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Word Ladder II", en: "Word Ladder II" },
    titleVi: { vi: "Chuỗi biến đổi từ II", en: "All shortest word transformation paths" },
    statement: {
      vi:
        "Cho beginWord, endWord và wordList. Tìm TẤT CẢ chuỗi biến đổi ngắn nhất từ beginWord → endWord, " +
        "mỗi bước thay đúng 1 ký tự và từ kết quả phải có trong wordList. " +
        "Nhập wordList dưới dạng các từ cách nhau bởi dấu phẩy.",
      en:
        "Given beginWord, endWord and wordList. Find ALL shortest transformation sequences from beginWord to endWord, " +
        "changing exactly one letter at a time where each intermediate word must be in wordList. " +
        "Enter wordList as comma-separated words.",
    },
    defaultInput: "hot,dot,dog,lot,log,cog",
    inputKind: "string",
    inputLabel: { vi: "wordList (cách bởi dấu phẩy)", en: "wordList (comma separated)" },
    extraParams: [
      {
        key: "beginWord",
        type: "string",
        label: { vi: "beginWord", en: "beginWord" },
        default: "hit",
      },
      {
        key: "endWord",
        type: "string",
        label: { vi: "endWord", en: "endWord" },
        default: "cog",
      },
    ],
    complexity: {
      time: "O(N · L² + P · L)",
      space: "O(N · L)",
      note: {
        vi: "N = số từ, L = độ dài từ. BFS: O(N·L²). Reconstruct paths: O(P·L) với P là số path. Bộ nhớ: O(N·L).",
        en: "N = word count, L = word length. BFS: O(N·L²). Path reconstruction: O(P·L) where P = path count. Memory: O(N·L).",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "",
      "class Solution:",
      "    def findLadders(self, beginWord, endWord, wordList):",
      "        word_set = set(wordList)",
      "        if endWord not in word_set:",
      "            return []",
      "        parents = defaultdict(set)",
      "        layer = {beginWord}",
      "        found = False",
      "        while layer and not found:",
      "            word_set -= layer",
      "            next_layer = set()",
      "            for word in layer:",
      "                for i in range(len(word)):",
      "                    for c in 'abcdefghijklmnopqrstuvwxyz':",
      "                        new_word = word[:i] + c + word[i+1:]",
      "                        if new_word in word_set:",
      "                            next_layer.add(new_word)",
      "                            parents[new_word].add(word)",
      "                            if new_word == endWord:",
      "                                found = True",
      "            layer = next_layer",
      "        if not found:",
      "            return []",
      "        result = []",
      "        def dfs(word, path):",
      "            if word == beginWord:",
      "                result.append(list(reversed(path)))",
      "                return",
      "            for parent in parents[word]:",
      "                path.append(parent)",
      "                dfs(parent, path)",
      "                path.pop()",
      "        dfs(endWord, [endWord])",
      "        return result",
    ],
    builder: buildSteps126,
  },
  815: {
    id: 815,
    difficulty: "hard",
    slug: "bus-routes",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Bus Routes", en: "Bus Routes" },
    titleVi: { vi: "Tuyến xe buýt", en: "Minimum bus routes" },
    statement: {
      vi:
        "Có nhiều tuyến xe buýt, mỗi tuyến là một mảng các trạm. " +
        "Bạn có thể lên/xuống xe ở bất kỳ trạm nào và đổi tuyến miễn phí tại trạm chung. " +
        "Cho source và target, tìm số tuyến xe buýt tối thiểu phải đi qua. Trả về -1 nếu không thể. " +
        "Nhập các tuyến dưới dạng: trạm1,trạm2|trạm3,trạm4 (| phân cách các tuyến).",
      en:
        "You have multiple bus routes, each route is an array of stops. " +
        "You can ride any stop on a route and transfer at shared stops for free. " +
        "Given source and target, find the minimum number of bus routes to take. Return -1 if impossible. " +
        "Enter routes as: stop1,stop2|stop3,stop4 (| separates routes).",
    },
    defaultInput: "1,2,7|3,6,7",
    inputKind: "string",
    inputLabel: { vi: "Routes (dùng | để phân tách tuyến)", en: "Routes (use | to separate routes)" },
    extraParams: [
      { key: "source", label: { vi: "source (trạm xuất phát)", en: "source (start stop)" }, default: 1 },
      { key: "target", label: { vi: "target (trạm đích)", en: "target (destination stop)" }, default: 6 },
    ],
    complexity: {
      time: "O(N²)",
      space: "O(N²)",
      note: {
        vi: "N = tổng số trạm. Xây stop→routes map: O(N). BFS trên routes: O(R²) với R = số tuyến. Bộ nhớ: O(N²).",
        en: "N = total stops. Build stop→routes map: O(N). BFS over routes: O(R²) with R = number of routes. Memory: O(N²).",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "",
      "class Solution:",
      "    def numBusesToDestination(self, routes, source, target):",
      "        if source == target:",
      "            return 0",
      "        stop_to_routes = defaultdict(set)",
      "        for i, route in enumerate(routes):",
      "            for stop in route:",
      "                stop_to_routes[stop].add(i)",
      "        queue = deque(stop_to_routes[source])",
      "        visited_routes = set(stop_to_routes[source])",
      "        buses = 1",
      "        while queue:",
      "            for _ in range(len(queue)):",
      "                route_idx = queue.popleft()",
      "                for stop in routes[route_idx]:",
      "                    if stop == target:",
      "                        return buses",
      "                    for next_route in stop_to_routes[stop]:",
      "                        if next_route not in visited_routes:",
      "                            visited_routes.add(next_route)",
      "                            queue.append(next_route)",
      "            buses += 1",
      "        return -1",
    ],
    builder: buildSteps815,
  },
  1368: {
    id: 1368,
    difficulty: "hard",
    slug: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Minimum Cost to Make at Least One Valid Path in a Grid", en: "Minimum Cost to Make at Least One Valid Path in a Grid" },
    titleVi: { vi: "Chi phí nhỏ nhất tạo đường đi hợp lệ", en: "Min cost for a valid grid path" },
    statement: {
      vi:
        "Lưới m×n, mỗi ô có mũi tên: 1=phải, 2=trái, 3=xuống, 4=lên. " +
        "Đi từ (0,0) đến (m-1,n-1). Đi theo mũi tên = chi phí 0, đổi hướng mũi tên = chi phí 1. " +
        "Tìm chi phí nhỏ nhất (0-1 BFS). Nhập lưới: hàng cách bởi |, giá trị cách bởi dấu phẩy.",
      en:
        "Grid m×n, each cell has an arrow: 1=right, 2=left, 3=down, 4=up. " +
        "Travel from (0,0) to (m-1,n-1). Following the arrow costs 0, changing it costs 1. " +
        "Find minimum cost (0-1 BFS). Enter grid: rows separated by |, values comma-separated.",
    },
    defaultInput: "1,1,3|3,2,2|1,1,4",
    inputKind: "string",
    inputLabel: { vi: "Lưới (hàng cách bởi |)", en: "Grid (rows separated by |)" },
    extraParams: [],
    approach: [
      { vi: "Mỗi ô là một nút. Đi theo mũi tên có sẵn = chi phí 0, đổi hướng = chi phí 1.", en: "Each cell is a node. Following the existing arrow = cost 0, changing direction = cost 1." },
      { vi: "Đây là bài toán đường đi ngắn nhất với trọng số 0 hoặc 1 → dùng 0-1 BFS.", en: "This is a shortest-path problem with weights 0 or 1 → use 0-1 BFS." },
      { vi: "Cạnh cost 0 → thêm vào ĐẦU deque; cạnh cost 1 → thêm vào CUỐI deque.", en: "Cost-0 edge → add to FRONT of deque; cost-1 edge → add to BACK." },
      { vi: "Đáp án là chi phí nhỏ nhất tới ô (m-1, n-1).", en: "The answer is the minimum cost to reach cell (m-1, n-1)." },
    ],
    complexity: {
      time: "O(m·n)",
      space: "O(m·n)",
      note: {
        vi: "0-1 BFS với deque: mỗi ô xử lý 1 lần → O(m·n). Bộ nhớ O(m·n) cho dist grid + deque.",
        en: "0-1 BFS with deque: each cell processed once → O(m·n). Memory O(m·n) for dist grid + deque.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def minCost(self, grid):",
      "        m, n = len(grid), len(grid[0])",
      "        dirs = {1:(0,1), 2:(0,-1), 3:(1,0), 4:(-1,0)}",
      "        cost = [[float('inf')]*n for _ in range(m)]",
      "        cost[0][0] = 0",
      "        dq = deque([(0, 0)])",
      "        while dq:",
      "            r, c = dq.popleft()",
      "            for d, (dr, dc) in dirs.items():",
      "                nr, nc = r + dr, c + dc",
      "                wt = 0 if grid[r][c] == d else 1",
      "                if 0<=nr<m and 0<=nc<n and cost[r][c]+wt < cost[nr][nc]:",
      "                    cost[nr][nc] = cost[r][c] + wt",
      "                    if wt == 0:",
      "                        dq.appendleft((nr, nc))",
      "                    else:",
      "                        dq.append((nr, nc))",
      "        return cost[m-1][n-1]",
    ],
    builder: buildSteps1368,
  },
  127: {
    id: 127,
    difficulty: "hard",
    slug: "word-ladder",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Word Ladder", en: "Word Ladder" },
    titleVi: { vi: "Chuỗi biến đổi từ", en: "Shortest word transformation length" },
    statement: {
      vi:
        "Cho beginWord, endWord và wordList. Tìm ĐỘ DÀI chuỗi biến đổi ngắn nhất từ beginWord → endWord, " +
        "mỗi bước thay đúng 1 ký tự và từ kết quả phải có trong wordList. Trả về số từ trong chuỗi (gồm cả begin và end), hoặc 0 nếu không thể. " +
        "Nhập wordList dưới dạng các từ cách nhau bởi dấu phẩy.",
      en:
        "Given beginWord, endWord and wordList. Find the LENGTH of the shortest transformation sequence from beginWord to endWord, " +
        "changing exactly one letter at a time where each intermediate word must be in wordList. Return the number of words in the sequence (including begin and end), or 0 if impossible. " +
        "Enter wordList as comma-separated words.",
    },
    defaultInput: "hot,dot,dog,lot,log,cog",
    inputKind: "string",
    inputLabel: { vi: "wordList (cách bởi dấu phẩy)", en: "wordList (comma separated)" },
    extraParams: [
      {
        key: "beginWord",
        type: "string",
        label: { vi: "beginWord", en: "beginWord" },
        default: "hit",
      },
      {
        key: "endWord",
        type: "string",
        label: { vi: "endWord", en: "endWord" },
        default: "cog",
      },
    ],
    approach: [
      { vi: "Coi mỗi từ là một nút; hai từ kề nhau nếu khác đúng 1 ký tự.", en: "Treat each word as a node; two words are adjacent if they differ by exactly 1 letter." },
      { vi: "Dùng BFS từ beginWord — BFS đảm bảo tìm được đường ngắn nhất.", en: "Use BFS from beginWord — BFS guarantees the shortest path." },
      { vi: "Với mỗi từ, thử thay từng vị trí bằng 'a'..'z', giữ lại từ có trong wordList và chưa thăm.", en: "For each word, try replacing each position with 'a'..'z', keep words in wordList not yet visited." },
      { vi: "Trả về số bước khi gặp endWord, hoặc 0 nếu không thể.", en: "Return the step count when endWord is reached, or 0 if impossible." },
    ],
    complexity: {
      time: "O(N · L²)",
      space: "O(N · L)",
      note: {
        vi: "N = số từ, L = độ dài từ. Mỗi từ thử L vị trí × 26 ký tự, mỗi lần tạo từ O(L) → O(N·L²). Bộ nhớ O(N·L).",
        en: "N = word count, L = word length. Each word tries L positions × 26 letters, each O(L) to build → O(N·L²). Memory O(N·L).",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def ladderLength(self, beginWord, endWord, wordList):",
      "        word_set = set(wordList)",
      "        if endWord not in word_set:",
      "            return 0",
      "        queue = deque([(beginWord, 1)])",
      "        visited = {beginWord}",
      "        while queue:",
      "            word, steps = queue.popleft()",
      "            if word == endWord:",
      "                return steps",
      "            for i in range(len(word)):",
      "                for c in 'abcdefghijklmnopqrstuvwxyz':",
      "                    new_word = word[:i] + c + word[i+1:]",
      "                    if new_word in word_set and new_word not in visited:",
      "                        visited.add(new_word)",
      "                        queue.append((new_word, steps + 1))",
      "        return 0",
    ],
    builder: buildSteps127,
  },
  743: {
    id: 743,
    difficulty: "medium",
    slug: "network-delay-time",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Network Delay Time", en: "Network Delay Time" },
    titleVi: { vi: "Thời gian trễ mạng", en: "Network delay time" },
    statement: {
      vi:
        "Cho n nút mạng (đánh số 1..n), danh sách cạnh có hướng [u, v, w] (từ u đến v, trọng số w), và nút nguồn k. " +
        "Tìm thời gian ngắn nhất để tín hiệu từ k đến được TẤT CẢ các nút. Nếu không thể, trả về -1. " +
        "Dùng thuật toán Dijkstra.",
      en:
        "Given n network nodes (labeled 1..n), a list of directed edges [u, v, w] (from u to v with weight w), and a source node k. " +
        "Find the minimum time for a signal from k to reach ALL nodes. If impossible, return -1. " +
        "Uses Dijkstra's algorithm.",
    },
    defaultInput: "2-1-1,2-3-1,3-4-1",
    inputKind: "string",
    inputLabel: { vi: "Cạnh (u-v-w, cách bởi dấu phẩy)", en: "Edges (u-v-w, comma separated)" },
    extraParams: [
      {
        key: "n",
        label: { vi: "n (số nút)", en: "n (number of nodes)" },
        default: 4,
      },
      {
        key: "k",
        label: { vi: "k (nút nguồn)", en: "k (source node)" },
        default: 2,
      },
    ],
    complexity: {
      time: "O((V+E) log V)",
      space: "O(V + E)",
      note: {
        vi: "Dijkstra với min-heap: mỗi nút pop 1 lần O(V log V), mỗi cạnh relax O(E log V). Bộ nhớ O(V+E) cho adjacency list + dist array.",
        en: "Dijkstra with min-heap: each node popped once O(V log V), each edge relaxed O(E log V). Memory O(V+E) for adjacency list + dist array.",
      },
    },
    code: [
      "import heapq",
      "",
      "class Solution:",
      "    def networkDelayTime(self, times, n, k):",
      "        graph = defaultdict(list)",
      "        for u, v, w in times:",
      "            graph[u].append((v, w))",
      "        dist = {node: float('inf') for node in range(1, n+1)}",
      "        dist[k] = 0",
      "        heap = [(0, k)]",
      "        while heap:",
      "            d, u = heapq.heappop(heap)",
      "            if d > dist[u]:",
      "                continue",
      "            for v, w in graph[u]:",
      "                if dist[u] + w < dist[v]:",
      "                    dist[v] = dist[u] + w",
      "                    heapq.heappush(heap, (dist[v], v))",
      "        ans = max(dist.values())",
      "        return ans if ans < float('inf') else -1",
    ],
    builder: buildSteps743,
  },
  851: {
    id: 851,
    difficulty: "medium",
    slug: "loud-and-rich",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Loud and Rich", en: "Loud and Rich" },
    titleVi: { vi: "Ồn ào và Giàu có", en: "Loud and rich" },
    statement: {
      vi:
        "Có n người (0..n-1). richer[i] = [a, b] nghĩa là a giàu hơn b. quiet[i] là độ ồn của người i. " +
        "Với mỗi người x, tìm người y ít ồn nhất sao cho y giàu hơn hoặc bằng x (y có thể là x). " +
        "Trả về mảng answer[x] = y.",
      en:
        "There are n people (0..n-1). richer[i] = [a, b] means a is richer than b. quiet[i] is the quietness of person i. " +
        "For each person x, find the least quiet person y such that y is richer than or equal to x (y can be x itself). " +
        "Return array answer[x] = y.",
    },
    defaultInput: "1-0,2-1,3-1,3-7,4-3,5-3,6-3",
    inputKind: "string",
    inputLabel: { vi: "richer (a-b, cách bởi dấu phẩy)", en: "richer edges (a-b, comma separated)" },
    extraParams: [
      {
        key: "quiet",
        type: "string",
        label: { vi: "quiet[] (cách bởi dấu phẩy)", en: "quiet[] (comma separated)" },
        default: "3,2,5,4,6,1,7,0",
      },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      note: {
        vi: "DFS/BFS trên đồ thị: mỗi nút thăm 1 lần O(V+E). Bộ nhớ O(V+E) cho adjacency list + answer array.",
        en: "DFS on the graph: each node visited once O(V+E). Memory O(V+E) for adjacency list + answer array.",
      },
    },
    code: [
      "class Solution:",
      "    def loudAndRich(self, richer, quiet):",
      "        n = len(quiet)",
      "        graph = defaultdict(list)  # b -> [a] (a richer than b)",
      "        for a, b in richer:",
      "            graph[b].append(a)",
      "        answer = [-1] * n",
      "",
      "        def dfs(node):",
      "            if answer[node] != -1:",
      "                return",
      "            answer[node] = node",
      "            for neighbor in graph[node]:",
      "                dfs(neighbor)",
      "                if quiet[answer[neighbor]] < quiet[answer[node]]:",
      "                    answer[node] = answer[neighbor]",
      "",
      "        for i in range(n):",
      "            dfs(i)",
      "        return answer",
    ],
    builder: buildSteps851,
  },
  1136: {
    id: 1136,
    difficulty: "medium",
    slug: "parallel-courses",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Parallel Courses", en: "Parallel Courses" },
    titleVi: { vi: "Học môn song song", en: "Parallel courses (min semesters)" },
    statement: {
      vi:
        "Có n môn học (đánh số 1..n) và danh sách điều kiện tiên quyết: cặp (u, v) nghĩa là phải học u trước v. " +
        "Trong một học kỳ, bạn có thể học BAO NHIÊU MÔN cũng được, miễn là mọi tiên quyết đã được thỏa mãn. " +
        "Trả về số học kỳ tối thiểu để học hết tất cả, hoặc -1 nếu không thể (có chu trình). " +
        "Nhập tiên quyết: u-v cách bởi dấu phẩy (vd: 1-3,2-3).",
      en:
        "There are n courses (1..n) and a list of prerequisites: pair (u, v) means u must be taken before v. " +
        "In one semester you may take ANY NUMBER of courses as long as all their prerequisites are satisfied. " +
        "Return the minimum number of semesters to finish all courses, or -1 if impossible (cycle). " +
        "Enter prerequisites as: u-v comma separated (e.g. 1-3,2-3).",
    },
    defaultInput: "1-3,2-3",
    inputKind: "string",
    inputLabel: { vi: "Tiên quyết (u-v, cách bởi dấu phẩy)", en: "Prerequisites (u-v, comma separated)" },
    extraParams: [
      { key: "n", label: { vi: "n (số môn học)", en: "n (number of courses)" }, default: 3 },
    ],
    approach: [
      { vi: "Bài toán topological sort: tìm thứ tự học mà mỗi môn được học sau tất cả tiên quyết của nó.", en: "Topological sort: find an order where each course comes after its prerequisites." },
      { vi: "Dùng Kahn's algorithm (BFS): lặp đi lặp lại lấy mọi nút có in-degree = 0.", en: "Use Kahn's algorithm (BFS): repeatedly take all nodes with in-degree = 0." },
      { vi: "Mỗi lần lấy = 1 học kỳ. Học xong → giảm in-degree các môn phụ thuộc.", en: "Each batch = 1 semester. After taking → decrement in-degree of dependents." },
      { vi: "Nếu kẹt lại (còn môn nhưng không nút nào có in-degree 0) → có chu trình → trả -1.", en: "If stuck (courses remain but no node has in-degree 0) → cycle exists → return -1." },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V + E)",
      note: {
        vi: "Mỗi nút duyệt 1 lần, mỗi cạnh giảm in-degree 1 lần. Bộ nhớ cho adjacency list + in-degree array.",
        en: "Each node visited once, each edge decremented once. Memory for adjacency list + in-degree array.",
      },
    },
    code: [
      "from collections import defaultdict, deque",
      "",
      "class Solution:",
      "    def minimumSemesters(self, n, relations):",
      "        adj = defaultdict(list)",
      "        in_deg = [0] * (n + 1)",
      "        for u, v in relations:",
      "            adj[u].append(v)",
      "            in_deg[v] += 1",
      "        queue = deque([i for i in range(1, n+1) if in_deg[i] == 0])",
      "        taken = 0",
      "        semesters = 0",
      "        while queue:",
      "            semesters += 1",
      "            size = len(queue)",
      "            for _ in range(size):",
      "                u = queue.popleft()",
      "                taken += 1",
      "                for v in adj[u]:",
      "                    in_deg[v] -= 1",
      "                    if in_deg[v] == 0:",
      "                        queue.append(v)",
      "        return semesters if taken == n else -1",
    ],
    builder: buildSteps1136,
  },
  752: {
    id: 752,
    difficulty: "medium",
    slug: "open-the-lock",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Open the Lock", en: "Open the Lock" },
    titleVi: { vi: "Mở khóa số 4 vành", en: "Open the 4-digit lock" },
    statement: {
      vi:
        "Ổ khóa có 4 vành số, mỗi vành 0..9 (xoay vòng). Khóa bắt đầu ở '0000'. " +
        "Mỗi lần bạn xoay 1 vành lên hoặc xuống 1 nấc. " +
        "Cho danh sách deadends (khóa sẽ kẹt nếu rơi vào), và target. Trả về số nước xoay tối thiểu để đạt target, hoặc -1. " +
        "Nhập deadends: các chuỗi 4 ký tự cách bởi dấu phẩy (vd: 0201,0101,0102,1212,2002).",
      en:
        "Lock has 4 wheels (0..9, wraps). Starts at '0000'. " +
        "Each move turns one wheel up or down by 1. " +
        "Given a list of deadends (lock jams if landed on) and a target, return the min number of moves, or -1. " +
        "Enter deadends as 4-char strings comma separated (e.g. 0201,0101,0102,1212,2002).",
    },
    defaultInput: "0201,0101,0102,1212,2002",
    inputKind: "string",
    inputLabel: { vi: "Deadends (cách bởi dấu phẩy)", en: "Deadends (comma separated)" },
    extraParams: [
      { key: "target", type: "string", label: { vi: "target (4 chữ số)", en: "target (4 digits)" }, default: "0202" },
    ],
    approach: [
      { vi: "Coi mỗi trạng thái 4 chữ số là một nút (có 10^4 = 10000 trạng thái).", en: "Treat each 4-digit state as a node (10^4 = 10000 states)." },
      { vi: "Từ mỗi nút có 8 nút kề: 4 vành × 2 hướng (lên/xuống), modulo 10.", en: "Each node has 8 neighbors: 4 wheels × 2 directions (up/down), modulo 10." },
      { vi: "BFS từ '0000' — vì cạnh không trọng số, BFS đảm bảo tìm đường ngắn nhất.", en: "BFS from '0000' — unweighted edges, so BFS finds the shortest path." },
      { vi: "Bỏ qua deadends và trạng thái đã visited. Khi gặp target → trả số level.", en: "Skip deadends and visited states. When target is reached → return the level count." },
    ],
    complexity: {
      time: "O(10^4 · 8)",
      space: "O(10^4)",
      note: {
        vi: "Tối đa 10000 trạng thái, mỗi cái có 8 hàng xóm → O(8·10^4). Set visited + queue → O(10^4) bộ nhớ.",
        en: "At most 10000 states, each with 8 neighbors → O(8·10^4). Visited set + queue → O(10^4) memory.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def openLock(self, deadends, target):",
      "        dead = set(deadends)",
      "        if '0000' in dead:",
      "            return -1",
      "        visited = {'0000'}",
      "        queue = deque([('0000', 0)])",
      "        while queue:",
      "            state, turns = queue.popleft()",
      "            if state == target:",
      "                return turns",
      "            for i in range(4):",
      "                for d in (-1, 1):",
      "                    nd = (int(state[i]) + d) % 10",
      "                    nxt = state[:i] + str(nd) + state[i+1:]",
      "                    if nxt in visited or nxt in dead:",
      "                        continue",
      "                    visited.add(nxt)",
      "                    queue.append((nxt, turns + 1))",
      "        return -1",
    ],
    builder: buildSteps752,
  },
  1236: {
    id: 1236,
    difficulty: "medium",
    slug: "web-crawler",
    category: { key: "graph", vi: "Đồ thị", en: "Graph" },
    title: { vi: "Web Crawler", en: "Web Crawler" },
    titleVi: { vi: "Web Crawler đơn giản", en: "Same-hostname web crawler" },
    statement: {
      vi:
        "Cho startUrl và mạng các trang web (URL → các URL liên kết). " +
        "Crawl bằng BFS và CHỈ follow link nếu URL đích cùng hostname với startUrl. " +
        "Trả về danh sách URL đã thăm. " +
        "Định dạng input: urls cách bởi ';', links bằng 'url1->url2' cách bởi ';'. " +
        "Hostname = phần trước dấu '/' đầu tiên.",
      en:
        "Given a startUrl and a web of pages (URL → linked URLs). " +
        "Crawl via BFS and ONLY follow links whose target URL has the same hostname as startUrl. " +
        "Return all visited URLs. " +
        "Input format: urls semicolon-separated, edges as 'url1->url2' semicolon-separated. " +
        "Hostname = substring before first '/'.",
    },
    defaultInput: "news.yahoo.com;news.yahoo.com/news;news.yahoo.com/topics;news.google.com;news.yahoo.com/us",
    inputKind: "string",
    inputLabel: { vi: "URLs (cách bởi ';')", en: "URLs (semicolon separated)" },
    extraParams: [
      {
        key: "edges",
        type: "string",
        label: { vi: "Links (url1->url2 ; ...)", en: "Links (url1->url2 ; ...)" },
        default: "news.yahoo.com->news.yahoo.com/news;news.yahoo.com->news.google.com;news.yahoo.com->news.yahoo.com/us;news.yahoo.com/news->news.yahoo.com/topics",
      },
      {
        key: "startUrl",
        type: "string",
        label: { vi: "startUrl", en: "startUrl" },
        default: "news.yahoo.com",
      },
    ],
    approach: [
      { vi: "BFS từ startUrl, mỗi URL là một nút, mỗi link là cạnh có hướng.", en: "BFS from startUrl, each URL is a node, each link is a directed edge." },
      { vi: "Lấy hostname từ startUrl (phần trước dấu '/' đầu tiên).", en: "Extract hostname from startUrl (substring before first '/')." },
      { vi: "Khi pop một URL: thử mọi link của nó. Chỉ follow nếu cùng hostname và chưa visited.", en: "When popping a URL: try each of its links. Only follow if same hostname and not visited." },
      { vi: "Dùng set 'visited' để tránh lặp và bỏ qua URL đã crawl.", en: "Use a 'visited' set to avoid loops and skip already-crawled URLs." },
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      note: {
        vi: "BFS chuẩn: mỗi URL ghé 1 lần, mỗi link xét 1 lần. Bộ nhớ O(V) cho visited + queue.",
        en: "Standard BFS: each URL visited once, each link processed once. Memory O(V) for visited + queue.",
      },
    },
    code: [
      "from collections import deque",
      "",
      "class Solution:",
      "    def crawl(self, startUrl, htmlParser):",
      "        host = startUrl.split('/')[2] if '://' in startUrl else startUrl.split('/')[0]",
      "        visited = {startUrl}",
      "        queue = deque([startUrl])",
      "        while queue:",
      "            url = queue.popleft()",
      "            for link in htmlParser.getUrls(url):",
      "                link_host = link.split('/')[2] if '://' in link else link.split('/')[0]",
      "                if link_host != host:",
      "                    continue",
      "                if link in visited:",
      "                    continue",
      "                visited.add(link)",
      "                queue.append(link)",
      "        return list(visited)",
    ],
    builder: buildSteps1236,
  },
};
