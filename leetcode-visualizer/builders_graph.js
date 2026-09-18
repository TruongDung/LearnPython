/**
 * Graph / BFS builder functions for LeetCode Visualizer.
 * Problems: 1293, 1368, 2290, 2577, 3341, 3342, 1377, 126, 815
 */

// ─── 1293: Shortest Path in Grid with Obstacles Elimination ───
// BFS over a 3D state space: (row, col, eliminations_remaining).
//
// This renders through the dedicated `gridElim1293View` renderer rather than the
// generic `bfsGrid` one. The generic grid could only show ONE number per cell,
// which hides the single thing that makes this problem hard: a cell is not one
// node, it is k+1 nodes. Marking a cell "visited" by (row, col) alone is the
// classic wrong answer here, and you cannot see why unless the per-cell states
// are drawn separately. So each cell now lists every remaining-k state created
// on it, and rejected moves say which rule rejected them.
function buildSteps1293(input, params) {
  const grid = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const k = Number(params?.k ?? 1);
  const valid = rows > 0 && cols > 0 && rows <= 8 && cols <= 8
    && Number.isInteger(k) && k >= 0
    && grid.every((row) => row.length === cols
      && row.every((value) => value === 0 || value === 1))
    && grid[0][0] === 0 && grid[rows - 1][cols - 1] === 0;

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [], highlight: [], mark: [], final: true,
      codeLines: [5],
      vars: [{ name: "answer", value: -1 }],
      gridElim1293View: {
        error: {
          vi: "Grid phải là ma trận chữ nhật chỉ gồm 0/1, ô start (0,0) và ô đích đều phải là 0, k là số nguyên ≥ 0. Vì mỗi ô mang nhiều state k khác nhau, visualization giới hạn 8×8.",
          en: "The grid must be rectangular with only 0/1, both the start (0,0) and the target must be 0, and k must be an integer ≥ 0. Because each cell carries several k states, the visualization is limited to 8×8.",
        },
      },
      note: {
        vi: "Grid phải là ma trận chữ nhật 0/1, start và target bằng 0, k là số nguyên không âm. Visualization hỗ trợ tối đa 8×8.",
        en: "The grid must be rectangular and contain 0/1, start and target must be 0, and k must be a non-negative integer. The visualization supports at most 8×8.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const best = Array.from({ length: rows }, () => Array(cols).fill(-1));
  // Every remaining-k value that produced a real state at this cell. The length
  // of this list IS the number of times the cell entered the queue, which is the
  // visual proof that (row, col) alone is not a state.
  const statesAt = Array.from({ length: rows }, () => Array.from({ length: cols }, () => []));
  const firstDist = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue = [];
  const parent = new Map();
  const processedCells = new Set();
  const layerCounts = new Map();
  const stateKey = (r, c, rem) => `${r},${c},${rem}`;
  const cellKey = (r, c) => `${r},${c}`;
  let popped = 0;
  let enqueued = 0;
  let prunedDominated = 0;
  let prunedNoK = 0;
  let prunedOob = 0;

  function record(r, c, rem, dist) {
    best[r][c] = rem;
    if (!statesAt[r][c].includes(rem)) statesAt[r][c].push(rem);
    statesAt[r][c].sort((a, b) => b - a);
    if (firstDist[r][c] === null) firstDist[r][c] = dist;
    layerCounts.set(dist, (layerCounts.get(dist) || 0) + 1);
    enqueued += 1;
  }

  function makeCells(cur, probe, pathCells) {
    const queuedCells = new Set(queue.map(([r, c]) => cellKey(r, c)));
    return grid.map((row, r) => row.map((value, c) => ({
      wall: value === 1,
      role: r === 0 && c === 0 ? "start" : r === rows - 1 && c === cols - 1 ? "target" : "",
      rems: [...statesAt[r][c]],
      dist: firstDist[r][c],
      inQueue: queuedCells.has(cellKey(r, c)),
      processed: processedCells.has(cellKey(r, c)),
      cur: Boolean(cur && cur.r === r && cur.c === c),
      probe: Boolean(probe && probe.r === r && probe.c === c),
      verdict: probe && probe.r === r && probe.c === c ? probe.verdict : null,
      path: pathCells ? pathCells.has(cellKey(r, c)) : false,
    })));
  }

  function snap(o) {
    const pathCells = o.pathCells || null;
    steps.push({
      title: o.title,
      note: o.note,
      arr: [], highlight: [], mark: [],
      final: o.final || false,
      codeLines: o.codeLines || [],
      vars: o.vars || [],
      gridElim1293View: {
        rows, cols, k,
        phase: o.phase,
        cells: makeCells(o.cur || null, o.probe || null, pathCells),
        cur: o.cur || null,
        probe: o.probe || null,
        queue: queue.map(([r, c, rem, dist], i) => ({ r, c, rem, dist, head: i === 0 })),
        layers: [...layerCounts.entries()].sort((a, b) => a[0] - b[0]).map(([d, count]) => ({ d, count })),
        counters: { popped, enqueued, prunedDominated, prunedNoK, prunedOob },
        multiState: statesAt.flatMap((row, r) => row
          .map((rems, c) => ({ r, c, rems: [...rems] }))
          .filter((e) => e.rems.length > 1)),
        shortcut: o.shortcut || null,
        path: o.path || null,
        eliminated: o.eliminated || null,
        answer: o.answer === undefined ? null : o.answer,
        decision: o.decision || null,
      },
    });
  }

  snap({
    phase: "intro",
    title: { vi: `Lưới ${rows} × ${cols}, k = ${k}`, en: `Grid ${rows} × ${cols}, k = ${k}` },
    note: {
      vi: `Ô · trống, ô ■ là vật cản. Điểm mấu chốt: một ô KHÔNG phải một node. Đứng ở cùng ô nhưng còn 2 quyền phá khác hẳn còn 0 quyền — nên state là (hàng, cột, k_còn_lại). Vì vậy mỗi ô có thể vào queue tới ${k + 1} lần với ${k + 1} giá trị k khác nhau.`,
      en: `A · cell is empty, a ■ cell is an obstacle. The crux: a cell is NOT a node. Standing on the same cell with 2 eliminations left is a different situation from having 0 left — so a state is (row, col, k_remaining). That is why one cell can enter the queue up to ${k + 1} times, once per remaining-k value.`,
    },
    codeLines: [5],
    decision: {
      vi: `State = (hàng, cột, k còn lại). Không gian state có ${rows}×${cols}×${k + 1} = ${rows * cols * (k + 1)} khả năng.`,
      en: `State = (row, col, k remaining). The state space holds ${rows}×${cols}×${k + 1} = ${rows * cols * (k + 1)} possibilities.`,
    },
    vars: [{ name: "m, n", value: `${rows}, ${cols}` }, { name: "k", value: k }],
  });

  const shortcutLimit = rows + cols - 3;
  const shortcut = k >= shortcutLimit;
  const manhattan = rows + cols - 2;
  snap({
    phase: "shortcutCheck",
    title: shortcut
      ? { vi: `k = ${k} ≥ m+n-3 = ${shortcutLimit} → đi thẳng được`, en: `k = ${k} ≥ m+n-3 = ${shortcutLimit} → a straight route works` }
      : { vi: `k = ${k} ≥ m+n-3 = ${shortcutLimit}? Sai → phải BFS`, en: `k = ${k} ≥ m+n-3 = ${shortcutLimit}? False → BFS needed` },
    note: shortcut
      ? {
        vi: `Một đường Manhattan đi ${manhattan} bước và chỉ đi qua ${shortcutLimit} ô TRUNG GIAN (trừ start và đích, hai ô này luôn là 0). Xấu nhất cả ${shortcutLimit} ô đó là vật cản, mà k = ${k} đủ phá hết → không cần BFS, đáp án chính là khoảng cách Manhattan.`,
        en: `A Manhattan route takes ${manhattan} moves and passes only ${shortcutLimit} INTERMEDIATE cells (start and target are always 0). Worst case all ${shortcutLimit} are obstacles, and k = ${k} can clear them all → no BFS needed, the answer is just the Manhattan distance.`,
      }
      : {
        vi: `k = ${k} không đủ để bảo đảm phá hết ${shortcutLimit} ô trung gian của một đường thẳng, nên có thể phải đi đường vòng. Bắt buộc BFS.`,
        en: `k = ${k} cannot guarantee clearing all ${shortcutLimit} intermediate cells of a straight route, so a detour may be required. BFS is mandatory.`,
      },
    codeLines: [6],
    shortcut: { limit: shortcutLimit, applies: shortcut, manhattan },
    decision: shortcut
      ? { vi: `Trả ngay m+n-2 = ${manhattan}.`, en: `Return m+n-2 = ${manhattan} immediately.` }
      : { vi: "Chạy BFS trên không gian state 3 chiều.", en: "Run BFS over the 3D state space." },
    vars: [{ name: "k", value: k }, { name: "m + n - 3", value: shortcutLimit }, { name: "condition", value: shortcut }],
  });

  if (shortcut) {
    const path = [];
    for (let c = 0; c < cols; c += 1) path.push([0, c]);
    for (let r = 1; r < rows; r += 1) path.push([r, cols - 1]);
    const pathCells = new Set(path.map(([r, c]) => cellKey(r, c)));
    const walls = path.filter(([r, c]) => grid[r][c] === 1);
    snap({
      phase: "shortcut",
      title: { vi: `Đáp án = ${manhattan}`, en: `Answer = ${manhattan}` },
      note: {
        vi: `Đường xanh là một lộ trình Manhattan dài ${manhattan} bước (sang phải hết hàng 0 rồi đi xuống). Nó đi qua ${walls.length} vật cản, và k = ${k} phá được hết. Không đường nào ngắn hơn khoảng cách Manhattan.`,
        en: `The green cells are one Manhattan route of ${manhattan} moves (right along row 0, then down). It crosses ${walls.length} obstacle(s), and k = ${k} clears them all. No route can be shorter than the Manhattan distance.`,
      },
      codeLines: [7],
      final: true,
      pathCells,
      path: path.map(([r, c]) => [r, c, k]),
      eliminated: walls,
      answer: manhattan,
      decision: { vi: `Không cần BFS — đáp án ${manhattan}.`, en: `No BFS needed — the answer is ${manhattan}.` },
      vars: [{ name: "answer", value: manhattan }],
    });
    return { original: grid, answer: manhattan, steps };
  }

  snap({
    phase: "init",
    title: { vi: "Bốn hướng đi", en: "The four moves" },
    note: { vi: "Mỗi bước đi phải, trái, xuống hoặc lên — không đi chéo. Mọi cạnh có trọng số 1, nên BFS (không cần Dijkstra) là đủ.", en: "Each move goes right, left, down, or up — no diagonals. Every edge costs 1, so plain BFS suffices (no Dijkstra needed)." },
    codeLines: [8],
    decision: { vi: "Mọi bước cùng giá 1 → BFS cho đường ngắn nhất.", en: "All moves cost 1 → BFS gives the shortest path." },
    vars: [{ name: "directions", value: "[(0,1), (0,-1), (1,0), (-1,0)]" }],
  });

  snap({
    phase: "init",
    title: { vi: "best[r][c] = -1 cho mọi ô", en: "best[r][c] = -1 for every cell" },
    note: {
      vi: `best[r][c] là số quyền phá còn lại LỚN NHẤT từng đạt được ở ô đó. Đây là mẹo nén ${rows * cols * (k + 1)} state xuống còn một bảng ${rows}×${cols}: vì BFS tới các ô theo distance tăng dần, nếu ta đã từng tới ô này (không muộn hơn) mà còn NHIỀU quyền phá hơn, thì state mới hoàn toàn vô dụng.`,
      en: `best[r][c] is the LARGEST remaining elimination count ever achieved at that cell. This is the trick that compresses ${rows * cols * (k + 1)} states into one ${rows}×${cols} table: because BFS reaches cells in nondecreasing distance, if we already got here no later with MORE eliminations left, the new state is strictly useless.`,
    },
    codeLines: [9],
    decision: { vi: "-1 = chưa từng tới ô này.", en: "-1 = never reached." },
    vars: [{ name: "best", value: `${rows}×${cols} matrix of -1` }],
  });

  record(0, 0, k, 0);
  firstDist[0][0] = 0;
  snap({
    phase: "init",
    title: { vi: `best[0][0] = ${k}`, en: `best[0][0] = ${k}` },
    note: { vi: "Ở ô start chưa phá vật cản nào nên còn nguyên k quyền.", en: "No obstacle has been eliminated at the start, so all k eliminations remain." },
    codeLines: [10],
    cur: { r: 0, c: 0, rem: k, dist: 0 },
    decision: { vi: `Ô (0,0) có state k=${k}.`, en: `Cell (0,0) holds state k=${k}.` },
    vars: [{ name: "best[0][0]", value: k }],
  });

  queue.push([0, 0, k, 0]);
  parent.set(stateKey(0, 0, k), null);
  snap({
    phase: "init",
    title: { vi: `queue = [(0, 0, k=${k}, d=0)]`, en: `queue = [(0, 0, k=${k}, d=0)]` },
    note: { vi: "Queue là FIFO, nên state được xử lý theo distance không giảm. Đó là lý do state đích ĐẦU TIÊN được pop chắc chắn là ngắn nhất.", en: "The queue is FIFO, so states come out in nondecreasing distance. That is why the FIRST target state popped is guaranteed shortest." },
    codeLines: [11],
    cur: { r: 0, c: 0, rem: k, dist: 0 },
    decision: { vi: "Bắt đầu BFS.", en: "Start BFS." },
    vars: [{ name: "queue", value: `[(0, 0, ${k}, 0)]` }],
  });

  let answer = -1;
  while (queue.length) {
    const [r, c, rem, dist] = queue.shift();
    const currentState = stateKey(r, c, rem);
    processedCells.add(cellKey(r, c));
    popped += 1;
    const cur = { r, c, rem, dist };
    const reachedTarget = r === rows - 1 && c === cols - 1;

    if (reachedTarget) {
      answer = dist;
      const states = [];
      let cursor = currentState;
      while (cursor) {
        states.unshift(cursor);
        cursor = parent.get(cursor);
      }
      const path = states.map((state) => state.split(",").map(Number));
      const pathCells = new Set(path.map(([pr, pc]) => cellKey(pr, pc)));
      const removed = path.filter(([pr, pc]) => grid[pr][pc] === 1).map(([pr, pc]) => [pr, pc]);
      snap({
        phase: "target",
        title: { vi: `Pop ra đích (${r},${c}) với d = ${dist} → đáp án ${dist}`, en: `Popped the target (${r},${c}) with d = ${dist} → answer ${dist}` },
        note: {
          vi: `Đây là state đích đầu tiên rời queue. Queue FIFO nên mọi state còn lại có distance ≥ ${dist}, không thể có đường ngắn hơn. Đường xanh dài ${dist} bước và phá ${removed.length} vật cản${removed.length ? ` tại ${removed.map(([pr, pc]) => `(${pr},${pc})`).join(", ")}` : ""}, khi tới đích còn ${path.at(-1)[2]} quyền phá.`,
          en: `This is the first target state to leave the queue. The queue is FIFO, so every remaining state has distance ≥ ${dist} and nothing shorter exists. The green route is ${dist} moves and eliminates ${removed.length} obstacle(s)${removed.length ? ` at ${removed.map(([pr, pc]) => `(${pr},${pc})`).join(", ")}` : ""}, arriving with ${path.at(-1)[2]} eliminations left.`,
        },
        codeLines: [15, 16],
        cur,
        pathCells,
        path,
        eliminated: removed,
        answer: dist,
        final: true,
        decision: { vi: `Đường ngắn nhất = ${dist} bước.`, en: `Shortest path = ${dist} moves.` },
        vars: [
          { name: "d", value: dist },
          { name: "obstacles eliminated", value: removed.length ? removed.map(([pr, pc]) => `(${pr},${pc})`).join(", ") : "none" },
          { name: "answer", value: dist },
        ],
      });
      break;
    }

    snap({
      phase: "pop",
      title: { vi: `popleft → (${r},${c}) k=${rem} d=${dist}`, en: `popleft → (${r},${c}) k=${rem} d=${dist}` },
      note: {
        vi: `Đã đi ${dist} bước tới (${r},${c}) và còn ${rem} quyền phá. Chưa phải đích (${rows - 1},${cols - 1}) nên thử cả 4 hướng.`,
        en: `After ${dist} moves we are at (${r},${c}) with ${rem} eliminations left. Not the target (${rows - 1},${cols - 1}) yet, so try all four moves.`,
      },
      codeLines: [13, 14, 15],
      cur,
      decision: { vi: `Mở rộng từ (${r},${c}), k=${rem}.`, en: `Expanding from (${r},${c}) with k=${rem}.` },
      vars: [
        { name: "r, c", value: `${r}, ${c}` },
        { name: "rem", value: rem },
        { name: "d", value: dist },
        { name: "queue size", value: queue.length },
      ],
    });

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;

      if (!inBounds) {
        prunedOob += 1;
        snap({
          phase: "neighbor",
          title: { vi: `(${dr},${dc}) → (${nr},${nc}) ra ngoài lưới`, en: `(${dr},${dc}) → (${nr},${nc}) is outside the grid` },
          note: { vi: `Toạ độ (${nr},${nc}) không nằm trong ${rows}×${cols}, bỏ hướng này.`, en: `Coordinate (${nr},${nc}) is not inside ${rows}×${cols}, so skip this move.` },
          codeLines: [19, 20],
          cur,
          probe: { r: nr, c: nc, verdict: "oob" },
          decision: { vi: "Ra ngoài lưới → bỏ.", en: "Out of bounds → skip." },
          vars: [{ name: "nr, nc", value: `${nr}, ${nc}` }, { name: "in bounds", value: false }],
        });
        continue;
      }

      const isWall = grid[nr][nc] === 1;
      const newRem = rem - grid[nr][nc];
      const useful = newRem > best[nr][nc];

      if (newRem < 0) {
        prunedNoK += 1;
        snap({
          phase: "neighbor",
          title: { vi: `(${nr},${nc}) là ■ nhưng đã hết quyền phá`, en: `(${nr},${nc}) is ■ but no eliminations remain` },
          note: {
            vi: `Bước vào vật cản cần 1 quyền phá, mà k còn lại đang là ${rem}. new_rem = ${rem} - 1 = ${newRem} < 0 nên state không tồn tại. Đây chính là chỗ k giới hạn đường đi.`,
            en: `Entering an obstacle costs one elimination, but only ${rem} remain. new_rem = ${rem} - 1 = ${newRem} < 0, so the state does not exist. This is exactly where k constrains the route.`,
          },
          codeLines: [21, 22],
          cur,
          probe: { r: nr, c: nc, verdict: "noK" },
          decision: { vi: `new_rem = ${newRem} < 0 → không đi được.`, en: `new_rem = ${newRem} < 0 → move impossible.` },
          vars: [{ name: "rem", value: rem }, { name: `grid[${nr}][${nc}]`, value: 1 }, { name: "new_rem", value: newRem }],
        });
        continue;
      }

      if (!useful) {
        prunedDominated += 1;
        snap({
          phase: "neighbor",
          title: { vi: `(${nr},${nc}) bị dominate: ${newRem} ≤ best = ${best[nr][nc]}`, en: `(${nr},${nc}) is dominated: ${newRem} ≤ best = ${best[nr][nc]}` },
          note: {
            vi: `Tới (${nr},${nc}) với k=${newRem}, nhưng ô này đã từng được tới (ở distance không lớn hơn) với k=${best[nr][nc]} ≥ ${newRem}. State cũ vừa ngắn hơn hoặc bằng, vừa còn nhiều quyền phá hơn — nó làm được mọi thứ state mới làm được. Bỏ state mới.`,
            en: `Reaching (${nr},${nc}) with k=${newRem}, but this cell was already reached (no later) with k=${best[nr][nc]} ≥ ${newRem}. The older state is at least as short AND has at least as many eliminations — it can do everything the new one could. Discard the new state.`,
          },
          codeLines: [21, 22],
          cur,
          probe: { r: nr, c: nc, verdict: "dominated" },
          decision: { vi: `${newRem} ≤ ${best[nr][nc]} → cắt tỉa.`, en: `${newRem} ≤ ${best[nr][nc]} → pruned.` },
          vars: [
            { name: "new_rem", value: newRem },
            { name: `best[${nr}][${nc}]`, value: best[nr][nc] },
            { name: "condition", value: false },
          ],
        });
        continue;
      }

      const prevBest = best[nr][nc];
      const revisit = prevBest >= 0;
      record(nr, nc, newRem, dist + 1);
      parent.set(stateKey(nr, nc, newRem), currentState);
      queue.push([nr, nc, newRem, dist + 1]);
      snap({
        phase: "neighbor",
        title: {
          vi: `Vào queue: (${nr},${nc}) k=${newRem} d=${dist + 1}${revisit ? " (ô cũ, state mới)" : ""}`,
          en: `Enqueue: (${nr},${nc}) k=${newRem} d=${dist + 1}${revisit ? " (old cell, new state)" : ""}`,
        },
        note: {
          vi: `${isWall ? `Ô (${nr},${nc}) là vật cản ■: phá nó, k giảm ${rem} → ${newRem}.` : `Ô (${nr},${nc}) trống ·: k giữ nguyên ${newRem}.`} ${newRem} > best = ${prevBest} nên state này hữu ích.${revisit ? ` Chú ý: ô này ĐÃ được thăm trước đó với k=${prevBest}, nhưng lần này còn nhiều quyền phá hơn nên nó mở ra những đường mà state cũ không đi được — đúng lý do không được đánh dấu visited chỉ theo (hàng,cột).` : ""}`,
          en: `${isWall ? `Cell (${nr},${nc}) is an obstacle ■: eliminate it, k drops ${rem} → ${newRem}.` : `Cell (${nr},${nc}) is empty ·: k stays ${newRem}.`} ${newRem} > best = ${prevBest}, so this state is useful.${revisit ? ` Note: this cell WAS visited before with k=${prevBest}, but this time more eliminations remain, so it unlocks routes the old state could not take — precisely why you must not mark visited by (row,col) alone.` : ""}`,
        },
        codeLines: [22, 23, 24],
        cur,
        probe: { r: nr, c: nc, verdict: "enqueued" },
        decision: revisit
          ? { vi: `Ô (${nr},${nc}) vào queue lần nữa với k tốt hơn: ${prevBest} → ${newRem}.`, en: `Cell (${nr},${nc}) is queued again with better k: ${prevBest} → ${newRem}.` }
          : { vi: `Ô (${nr},${nc}) lần đầu được tới, d=${dist + 1}, k=${newRem}.`, en: `Cell (${nr},${nc}) reached for the first time, d=${dist + 1}, k=${newRem}.` },
        vars: [
          { name: "new_rem", value: newRem },
          { name: `best[${nr}][${nc}]`, value: `${prevBest} → ${newRem}` },
          { name: "queue size", value: queue.length },
        ],
      });
    }
  }

  if (!steps.at(-1).final) {
    snap({
      phase: "fail",
      title: { vi: "Queue rỗng → không tới được đích", en: "Queue empty → the target is unreachable" },
      note: {
        vi: `Đã duyệt hết mọi state đạt được mà không pop ra đích. Với k = ${k} quyền phá thì không tồn tại đường nào, nên trả -1.`,
        en: `Every reachable state has been explored without popping the target. With k = ${k} eliminations no route exists, so return -1.`,
      },
      codeLines: [25],
      final: true,
      answer: -1,
      decision: { vi: "Đáp án = -1.", en: "Answer = -1." },
      vars: [{ name: "queue", value: "[]" }, { name: "answer", value: -1 }],
    });
  }

  return { original: grid, answer, steps };
}

// ─── 1368: Minimum Cost Valid Path in Grid (0-1 BFS) ───
function buildSteps1368(input) {
  const raw1368 = String(input).trim();
  const grid = raw1368.includes("[")
    ? (raw1368.match(/\[([^\[\]]*)\]/g) || [])
        .map((g) => g.replace(/[\[\]]/g, "").trim())
        .filter((x) => x.length)
        .map((row) => row.split(",").map((value) => Number(value.trim())))
    : raw1368
        .split(/[|;]/)
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const valid = rows > 0 && cols > 0 && rows <= 20 && cols <= 20
    && grid.every((row) => row.length === cols
      && row.every((value) => Number.isInteger(value) && value >= 1 && value <= 4));

  const arrow = { 1: "→", 2: "←", 3: "↓", 4: "↑" };
  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải là ma trận chữ nhật chỉ gồm 1,2,3,4; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ tối đa 20×20.",
        en: "The grid must be rectangular and contain only 1,2,3,4; separate rows with '|' or ';'. The visualization supports at most 20×20.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const deque = [];
  const finalized = new Set();
  const key = (r, c) => `${r},${c}`;
  const formatCost = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map((row) => `[${row.map(formatCost).join(", ")}]`).join(", ")}]`;
  const dequeStr = () => `[${deque.map(([cost, r, c]) => `(${cost}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set(), pathMoves = null) {
    const queued = new Set(deque.map(([, r, c]) => key(r, c)));
    return grid.map((row, r) => row.map((direction, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (pathCells.has(cellKey)) cls = "route";
      if (current && current[0] === r && current[1] === c) cls = "current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === rows - 1 && c === cols - 1
          ? " · T"
          : "";
      // On the final path, show the move taken and mark changed arrows (cost 1).
      let move = "";
      let label = arrow[direction];
      if (pathMoves && pathMoves.has(cellKey)) {
        const mv = pathMoves.get(cellKey);
        if (mv.changed) {
          move = ` · ✎${arrow[mv.code]}`;
          label = `${arrow[direction]}→${arrow[mv.code]}`;
          cls = "route changed";
        } else {
          move = ` · ${arrow[mv.code]}`;
        }
      }
      return { label, meta: `c:${formatCost(dist[r][c])}${endpoint}${move}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, pathMoves = null, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", cells: makeCells(current, pathCells, pathMoves) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước grid: ${rows} × ${cols}`, en: `Grid size: ${rows} × ${cols}` },
    codeLine: 5,
    vars: [{ name: "m", value: rows }, { name: "n", value: cols }],
    note: {
      vi: `Bắt đầu ở (0,0), cần tới (${rows - 1},${cols - 1}). Mỗi ô cho biết hướng miễn phí hiện tại.`,
      en: `Start at (0,0) and reach (${rows - 1},${cols - 1}). Each cell gives its current free direction.`,
    },
  });

  pushStep({
    title: { vi: "Ánh xạ bốn mã hướng", en: "Map the four direction codes" },
    codeLine: 6,
    vars: [{ name: "directions", value: "[(0,1), (0,-1), (1,0), (-1,0)]" }],
    note: {
      vi: "enumerate bắt đầu từ 1 nên direction 1=→, 2=←, 3=↓, 4=↑, đúng với giá trị trong grid.",
      en: "enumerate starts at 1, so direction 1=→, 2=←, 3=↓, 4=↑, matching the grid values.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 7,
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "dist[r][c] là số mũi tên ít nhất phải đổi để tới ô (r,c). ∞ nghĩa là chưa tìm thấy đường.",
      en: "dist[r][c] is the fewest arrows that must change to reach (r,c). ∞ means no route is known.",
    },
  });

  dist[0][0] = 0;
  pushStep({
    title: { vi: "Ô bắt đầu có cost 0", en: "The start cell has cost 0" },
    codeLine: 8,
    current: [0, 0],
    vars: [{ name: "dist[0][0]", value: 0 }],
    note: {
      vi: "Đứng tại ô đầu chưa cần đổi mũi tên nào, nên chi phí bằng 0.",
      en: "Standing at the start requires no arrow changes, so its cost is 0.",
    },
  });

  deque.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa start vào deque", en: "Push start into the deque" },
    codeLine: 9,
    current: [0, 0],
    vars: [{ name: "deque", value: dequeStr() }],
    note: {
      vi: "Deque lưu (cost,row,col). Đầu deque luôn chứa trạng thái cần ưu tiên xử lý trước.",
      en: "The deque stores (cost,row,col). Its front contains the state to process first.",
    },
  });

  while (deque.length) {
    pushStep({
      title: { vi: "Deque chưa rỗng", en: "The deque is not empty" },
      codeLine: 11,
      vars: [{ name: "deque", value: dequeStr() }],
      note: {
        vi: "Tiếp tục 0-1 BFS bằng cách lấy trạng thái ở đầu deque.",
        en: "Continue 0-1 BFS by taking the state at the front.",
      },
    });

    const [currentCost, r, c] = deque.shift();
    pushStep({
      title: { vi: `popleft → (${currentCost}, ${r}, ${c})`, en: `popleft → (${currentCost}, ${r}, ${c})` },
      codeLine: 12,
      current: [r, c],
      vars: [
        { name: "current_cost", value: currentCost },
        { name: "r, c", value: `${r}, ${c}` },
        { name: "deque còn lại", value: dequeStr() },
      ],
      note: {
        vi: `Lấy ô (${r},${c}) với cost ${currentCost} ra khỏi đầu deque.`,
        en: `Pop cell (${r},${c}) with cost ${currentCost} from the front.`,
      },
    });

    const stale = currentCost > dist[r][c];
    pushStep({
      title: stale
        ? { vi: `${currentCost} > dist[${r}][${c}]=${dist[r][c]}: stale`, en: `${currentCost} > dist[${r}][${c}]=${dist[r][c]}: stale` }
        : { vi: `${currentCost} > dist[${r}][${c}]? False`, en: `${currentCost} > dist[${r}][${c}]? False` },
      codeLine: 13,
      current: [r, c],
      vars: [
        { name: "current_cost", value: currentCost },
        { name: `dist[${r}][${c}]`, value: dist[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: "Ô này đã có đường rẻ hơn; bản ghi vừa pop đã cũ và không được relax hàng xóm.",
            en: "This cell already has a cheaper route; the popped entry is stale and must not relax neighbors.",
          }
        : {
            vi: "Cost vừa pop vẫn bằng dist đang lưu, nên trạng thái hợp lệ.",
            en: "The popped cost still matches the stored dist, so the state is valid.",
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 14,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Quay lại đầu vòng while, tránh xử lý một đường đắt hơn.",
          en: "Return to the while loop and avoid processing a more expensive route.",
        },
      });
      continue;
    }

    finalized.add(key(r, c));
    for (let direction = 1; direction <= 4; direction++) {
      const [dr, dc] = directions[direction - 1];
      pushStep({
        title: { vi: `Thử hướng ${direction} = ${arrow[direction]}`, en: `Try direction ${direction} = ${arrow[direction]}` },
        codeLine: 16,
        current: [r, c],
        vars: [
          { name: "direction", value: direction },
          { name: "dr, dc", value: `${dr}, ${dc}` },
          { name: "mũi tên ô hiện tại", value: arrow[grid[r][c]] },
        ],
        note: {
          vi: `Từ (${r},${c}), thử đi ${arrow[direction]}. Mũi tên đang có tại ô là ${arrow[grid[r][c]]}.`,
          en: `From (${r},${c}), try moving ${arrow[direction]}. The cell currently points ${arrow[grid[r][c]]}.`,
        },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Neighbor = (${nr},${nc})`, en: `Neighbor = (${nr},${nc})` },
        codeLine: 17,
        current: [r, c],
        vars: [
          { name: "nr", value: `${r} + (${dr}) = ${nr}` },
          { name: "nc", value: `${c} + (${dc}) = ${nc}` },
        ],
        note: {
          vi: "Tính tọa độ hàng xóm bằng r+dr và c+dc.",
          en: "Compute the neighbor coordinates with r+dr and c+dc.",
        },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong grid`, en: `(${nr},${nc}) is inside the grid` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 18,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [
          { name: "neighbor", value: `(${nr}, ${nc})` },
          { name: "in bounds", value: inBounds },
        ],
        note: inBounds
          ? {
              vi: "Tọa độ hợp lệ, tiếp tục tính giá của cạnh.",
              en: "The coordinates are valid, so compute the edge cost.",
            }
          : {
              vi: "Tọa độ ngoài grid; thân if không chạy và chuyển sang hướng tiếp theo.",
              en: "The coordinates are outside the grid; skip the if body and try the next direction.",
            },
      });
      if (!inBounds) continue;

      const edgeCost = grid[r][c] === direction ? 0 : 1;
      pushStep({
        title: edgeCost === 0
          ? { vi: `${arrow[grid[r][c]]} == ${arrow[direction]}: edge_cost = 0`, en: `${arrow[grid[r][c]]} == ${arrow[direction]}: edge_cost = 0` }
          : { vi: `${arrow[grid[r][c]]} != ${arrow[direction]}: edge_cost = 1`, en: `${arrow[grid[r][c]]} != ${arrow[direction]}: edge_cost = 1` },
        codeLine: 19,
        current: [nr, nc],
        vars: [
          { name: `grid[${r}][${c}]`, value: `${grid[r][c]} (${arrow[grid[r][c]]})` },
          { name: "direction", value: `${direction} (${arrow[direction]})` },
          { name: "edge_cost", value: edgeCost },
        ],
        note: edgeCost === 0
          ? {
              vi: "Đi đúng mũi tên có sẵn nên không cần sửa ô hiện tại: cost +0.",
              en: "Following the existing arrow requires no change to the current cell: cost +0.",
            }
          : {
              vi: `Muốn đi ${arrow[direction]} phải đổi mũi tên ${arrow[grid[r][c]]} của ô hiện tại: cost +1.`,
              en: `Moving ${arrow[direction]} requires changing the current ${arrow[grid[r][c]]} arrow: cost +1.`,
            },
      });

      const newCost = currentCost + edgeCost;
      pushStep({
        title: { vi: `new_cost = ${currentCost} + ${edgeCost} = ${newCost}`, en: `new_cost = ${currentCost} + ${edgeCost} = ${newCost}` },
        codeLine: 20,
        current: [nr, nc],
        vars: [
          { name: "current_cost", value: currentCost },
          { name: "edge_cost", value: edgeCost },
          { name: "new_cost", value: newCost },
        ],
        note: {
          vi: `Tổng số lần đổi mũi tên nếu đi tới (${nr},${nc}) là ${newCost}.`,
          en: `The total arrow changes required to reach (${nr},${nc}) would be ${newCost}.`,
        },
      });

      const oldDist = dist[nr][nc];
      const improves = newCost < oldDist;
      pushStep({
        title: improves
          ? { vi: `${newCost} < ${formatCost(oldDist)}: cải thiện`, en: `${newCost} < ${formatCost(oldDist)}: improvement` }
          : { vi: `${newCost} < ${formatCost(oldDist)}? False`, en: `${newCost} < ${formatCost(oldDist)}? False` },
        codeLine: 21,
        current: [nr, nc],
        vars: [
          { name: "new_cost", value: newCost },
          { name: `dist[${nr}][${nc}]`, value: formatCost(oldDist) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `Tìm thấy đường cần ít lần đổi hơn tới (${nr},${nc}); phải cập nhật dist và deque.`,
              en: `A route with fewer changes reaches (${nr},${nc}); update dist and the deque.`,
            }
          : {
              vi: `Đường này không rẻ hơn dist hiện có ${formatCost(oldDist)}, nên bỏ qua.`,
              en: `This route is not cheaper than the stored dist ${formatCost(oldDist)}, so skip it.`,
            },
      });
      if (!improves) continue;

      dist[nr][nc] = newCost;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `dist[${nr}][${nc}] = ${newCost}`, en: `dist[${nr}][${nc}] = ${newCost}` },
        codeLine: 22,
        current: [nr, nc],
        vars: [{ name: "dist", value: distStr() }],
        note: {
          vi: `Lưu cost tốt hơn. Visualization đồng thời nhớ parent=(${r},${c}) để dựng đường tối ưu cuối.`,
          en: `Store the better cost. The visualization also records parent=(${r},${c}) for the final optimal path.`,
        },
      });

      const freeEdge = edgeCost === 0;
      pushStep({
        title: freeEdge
          ? { vi: "edge_cost == 0: True", en: "edge_cost == 0: True" }
          : { vi: "edge_cost == 0: False", en: "edge_cost == 0: False" },
        codeLine: 23,
        current: [nr, nc],
        vars: [
          { name: "edge_cost", value: edgeCost },
          { name: "condition", value: freeEdge },
        ],
        note: freeEdge
          ? {
              vi: "Cạnh miễn phí phải được ưu tiên xử lý ngay, nên sẽ thêm neighbor vào ĐẦU deque.",
              en: "A free edge must be processed next, so add the neighbor to the FRONT.",
            }
          : {
              vi: "Cạnh tốn 1 không được vượt trước các trạng thái cùng cost hiện tại, nên đi vào nhánh else.",
              en: "A cost-1 edge must not jump ahead of current-cost states, so take the else branch.",
            },
      });

      if (freeEdge) {
        deque.unshift([newCost, nr, nc]);
        pushStep({
          title: { vi: `appendleft((${newCost}, ${nr}, ${nc}))`, en: `appendleft((${newCost}, ${nr}, ${nc}))` },
          codeLine: 24,
          current: [nr, nc],
          vars: [{ name: "deque", value: dequeStr() }],
          note: {
            vi: "Cost +0 được thêm vào đầu deque, vì đường này không đắt hơn trạng thái vừa xử lý.",
            en: "A +0 edge goes to the front because it is no more expensive than the current state.",
          },
        });
      } else {
        pushStep({
          title: { vi: "Đi vào nhánh else", en: "Enter the else branch" },
          codeLine: 25,
          current: [nr, nc],
          vars: [{ name: "edge_cost", value: edgeCost }],
          note: {
            vi: "edge_cost = 1, nên neighbor phải chờ ở cuối deque.",
            en: "edge_cost = 1, so the neighbor must wait at the back.",
          },
        });

        deque.push([newCost, nr, nc]);
        pushStep({
          title: { vi: `append((${newCost}, ${nr}, ${nc}))`, en: `append((${newCost}, ${nr}, ${nc}))` },
          codeLine: 26,
          current: [nr, nc],
          vars: [{ name: "deque", value: dequeStr() }],
          note: {
            vi: "Cost +1 được thêm vào cuối deque; các trạng thái rẻ hơn ở phía trước sẽ chạy trước.",
            en: "A +1 edge goes to the back; cheaper states already in front run first.",
          },
        });
      }
    }
  }

  pushStep({
    title: { vi: "Deque đã rỗng", en: "The deque is empty" },
    codeLine: 11,
    vars: [
      { name: "deque", value: "[]" },
      { name: "dist", value: distStr() },
    ],
    note: {
      vi: "Không còn trạng thái cần relax; bảng chi phí nhỏ nhất đã hoàn tất.",
      en: "No states remain to relax; the minimum-cost table is complete.",
    },
  });

  const answer = dist[rows - 1][cols - 1];
  const path = [];
  let current = [rows - 1, cols - 1];
  while (current) {
    path.unshift(current);
    current = parent[current[0]][current[1]];
  }
  const pathCells = new Set(path.map(([r, c]) => key(r, c)));
  const pathText = path.map(([r, c]) => `(${r},${c})`).join(" → ");

  // For each cell on the path, record the direction moved to the next cell and
  // whether that required changing the cell's arrow (an edge of cost 1).
  const codeOf = (dr, dc) => (dr === 0 && dc === 1) ? 1 : (dr === 0 && dc === -1) ? 2 : (dr === 1 && dc === 0) ? 3 : 4;
  const pathMoves = new Map();
  const changedCells = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [r, c] = path[i];
    const [nr, nc] = path[i + 1];
    const moveCode = codeOf(nr - r, nc - c);
    const changed = grid[r][c] !== moveCode;
    pathMoves.set(key(r, c), { code: moveCode, changed });
    if (changed) changedCells.push(`(${r},${c})→${arrow[moveCode]}`);
  }

  pushStep({
    title: { vi: `Chi phí nhỏ nhất = ${answer}`, en: `Minimum cost = ${answer}` },
    codeLine: 27,
    pathCells,
    pathMoves,
    final: true,
    vars: [
      { name: "path", value: pathText },
      { name: "arrows changed", value: answer > 0 ? changedCells.join(", ") : "0 (đi thẳng theo mũi tên có sẵn)" },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Đường tối ưu (tô xanh ngọc): ${pathText}. Ô có ✎ là nơi PHẢI ĐỔI mũi tên (mỗi lần đổi tốn 1): ${answer > 0 ? changedCells.join(", ") : "không có — đi thẳng theo mũi tên sẵn có"}. Tổng số lần đổi = ${answer} = đáp án; không đường nào ít hơn.`,
      en: `Optimal path (emerald): ${pathText}. Cells marked ✎ are where the arrow MUST change (each change costs 1): ${answer > 0 ? changedCells.join(", ") : "none — follow the existing arrows"}. Total changes = ${answer} = the answer; no route uses fewer.`,
    },
  });

  return { original: grid, answer, steps };
}
// ─── 2290: Minimum Obstacle Removal to Reach Corner (0-1 BFS) ───
function buildSteps2290(input) {
  const grid = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const valid = rows > 0 && cols > 0 && rows <= 20 && cols <= 20
    && grid.every((row) => row.length === cols
      && row.every((value) => value === 0 || value === 1))
    && grid[0][0] === 0 && grid[rows - 1][cols - 1] === 0;

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải là ma trận chữ nhật 0/1, start và target phải là 0; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ tối đa 20×20.",
        en: "The grid must be rectangular and contain 0/1, with start and target equal to 0; separate rows with '|' or ';'. The visualization supports at most 20×20.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const deque = [];
  const finalized = new Set();
  const key = (r, c) => `${r},${c}`;
  const formatCost = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map((row) => `[${row.map(formatCost).join(", ")}]`).join(", ")}]`;
  const dequeStr = () => `[${deque.map(([cost, r, c]) => `(${cost}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(deque.map(([, r, c]) => key(r, c)));
    return grid.map((row, r) => row.map((cell, c) => {
      const cellKey = key(r, c);
      let cls = cell === 1 ? "wall" : "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (pathCells.has(cellKey)) cls = "path";
      if (current && current[0] === r && current[1] === c) cls = "current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === rows - 1 && c === cols - 1
          ? " · T"
          : "";
      return { label: cell === 1 ? "■" : "·", meta: `d:${formatCost(dist[r][c])}${endpoint}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước grid: ${rows} × ${cols}`, en: `Grid size: ${rows} × ${cols}` },
    codeLine: 6,
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: `Ô · là trống, ô ■ là obstacle. Đi từ (0,0) tới (${rows - 1},${cols - 1}) và được phép xóa obstacle.`,
      en: `A · cell is empty and ■ is an obstacle. Travel from (0,0) to (${rows - 1},${cols - 1}), removing obstacles when needed.`,
    },
  });

  pushStep({
    title: { vi: "Chuẩn bị bốn hướng", en: "Prepare four directions" },
    codeLine: 7,
    vars: [{ name: "directions", value: "[(0,1), (0,-1), (1,0), (-1,0)]" }],
    note: {
      vi: "Có thể đi phải, trái, xuống hoặc lên; không đi chéo.",
      en: "Movement may go right, left, down, or up, but not diagonally.",
    },
  });

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 8,
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "dist[r][c] là số obstacle ít nhất phải xóa để tới (r,c). ∞ nghĩa là chưa tìm thấy đường.",
      en: "dist[r][c] is the fewest obstacles that must be removed to reach (r,c). ∞ means no route is known.",
    },
  });

  dist[0][0] = 0;
  pushStep({
    title: { vi: "Start có dist 0", en: "The start has dist 0" },
    codeLine: 9,
    current: [0, 0],
    vars: [{ name: "dist[0][0]", value: 0 }],
    note: {
      vi: "Ô bắt đầu là ô trống, nên chưa cần xóa obstacle nào.",
      en: "The start is empty, so no obstacle has been removed yet.",
    },
  });

  deque.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa start vào deque", en: "Push start into the deque" },
    codeLine: 10,
    current: [0, 0],
    vars: [{ name: "deque", value: dequeStr() }],
    note: {
      vi: "Deque lưu (cost,row,col). Trạng thái rẻ hơn được giữ gần đầu deque.",
      en: "The deque stores (cost,row,col). Cheaper states stay near the front.",
    },
  });

  while (deque.length) {
    pushStep({
      title: { vi: "Deque chưa rỗng", en: "The deque is not empty" },
      codeLine: 12,
      vars: [{ name: "deque", value: dequeStr() }],
      note: {
        vi: "Tiếp tục 0-1 BFS bằng trạng thái ở đầu deque.",
        en: "Continue 0-1 BFS with the state at the front.",
      },
    });

    const [currentCost, r, c] = deque.shift();
    pushStep({
      title: { vi: `popleft → (${currentCost}, ${r}, ${c})`, en: `popleft → (${currentCost}, ${r}, ${c})` },
      codeLine: 13,
      current: [r, c],
      vars: [
        { name: "current_cost", value: currentCost },
        { name: "r, c", value: `${r}, ${c}` },
        { name: "deque còn lại", value: dequeStr() },
      ],
      note: {
        vi: `Lấy ô (${r},${c}) với ${currentCost} obstacle đã xóa ra khỏi đầu deque.`,
        en: `Pop (${r},${c}) with ${currentCost} removed obstacles from the front.`,
      },
    });

    const stale = currentCost > dist[r][c];
    pushStep({
      title: stale
        ? { vi: `${currentCost} > dist[${r}][${c}]=${dist[r][c]}: stale`, en: `${currentCost} > dist[${r}][${c}]=${dist[r][c]}: stale` }
        : { vi: `${currentCost} > dist[${r}][${c}]? False`, en: `${currentCost} > dist[${r}][${c}]? False` },
      codeLine: 14,
      current: [r, c],
      vars: [
        { name: "current_cost", value: currentCost },
        { name: `dist[${r}][${c}]`, value: dist[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? {
            vi: "Ô này đã có đường xóa ít obstacle hơn; bản ghi vừa pop đã cũ.",
            en: "This cell already has a route removing fewer obstacles; the popped entry is stale.",
          }
        : {
            vi: "Cost vừa pop vẫn bằng dist tốt nhất, nên được phép relax hàng xóm.",
            en: "The popped cost still matches the best dist, so neighbors may be relaxed.",
          },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 15,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: {
          vi: "Quay lại đầu while, không mở rộng một đường đắt hơn.",
          en: "Return to the while loop without expanding a more expensive route.",
        },
      });
      continue;
    }

    finalized.add(key(r, c));
    for (const [dr, dc] of directions) {
      pushStep({
        title: { vi: `Lấy hướng (${dr},${dc})`, en: `Take direction (${dr},${dc})` },
        codeLine: 17,
        current: [r, c],
        vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }],
        note: {
          vi: `Từ (${r},${c}), thử độ lệch hàng ${dr} và cột ${dc}.`,
          en: `From (${r},${c}), try row offset ${dr} and column offset ${dc}.`,
        },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Neighbor = (${nr},${nc})`, en: `Neighbor = (${nr},${nc})` },
        codeLine: 18,
        current: [r, c],
        vars: [
          { name: "nr", value: `${r} + (${dr}) = ${nr}` },
          { name: "nc", value: `${c} + (${dc}) = ${nc}` },
        ],
        note: {
          vi: "Tính tọa độ ô sắp đi vào.",
          en: "Compute the coordinates of the cell being entered.",
        },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong grid`, en: `(${nr},${nc}) is inside the grid` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 19,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [
          { name: "neighbor", value: `(${nr}, ${nc})` },
          { name: "in bounds", value: inBounds },
        ],
        note: inBounds
          ? {
              vi: "Tọa độ hợp lệ, tiếp tục xem ô hàng xóm là trống hay obstacle.",
              en: "The coordinates are valid; inspect whether the neighbor is empty or an obstacle.",
            }
          : {
              vi: "Tọa độ ngoài grid; bỏ qua và thử hướng tiếp theo.",
              en: "The coordinates are outside the grid; skip them and try the next direction.",
            },
      });
      if (!inBounds) continue;

      const edgeCost = grid[nr][nc];
      pushStep({
        title: edgeCost === 0
          ? { vi: `grid[${nr}][${nc}] = 0: edge_cost = 0`, en: `grid[${nr}][${nc}] = 0: edge_cost = 0` }
          : { vi: `grid[${nr}][${nc}] = 1: edge_cost = 1`, en: `grid[${nr}][${nc}] = 1: edge_cost = 1` },
        codeLine: 20,
        current: [nr, nc],
        vars: [
          { name: `grid[${nr}][${nc}]`, value: edgeCost },
          { name: "cell type", value: edgeCost === 0 ? "empty" : "obstacle" },
          { name: "edge_cost", value: edgeCost },
        ],
        note: edgeCost === 0
          ? {
              vi: "Đang ĐI VÀO ô trống, không cần xóa gì: cost +0.",
              en: "The move ENTERS an empty cell, so nothing is removed: cost +0.",
            }
          : {
              vi: "Đang ĐI VÀO obstacle ■, phải xóa chính ô hàng xóm này: cost +1.",
              en: "The move ENTERS obstacle ■, so this neighbor must be removed: cost +1.",
            },
      });

      const newCost = currentCost + edgeCost;
      pushStep({
        title: { vi: `new_cost = ${currentCost} + ${edgeCost} = ${newCost}`, en: `new_cost = ${currentCost} + ${edgeCost} = ${newCost}` },
        codeLine: 21,
        current: [nr, nc],
        vars: [
          { name: "current_cost", value: currentCost },
          { name: "edge_cost", value: edgeCost },
          { name: "new_cost", value: newCost },
        ],
        note: {
          vi: `Tổng obstacle phải xóa để tới (${nr},${nc}) qua đường này là ${newCost}.`,
          en: `This route removes ${newCost} total obstacles to reach (${nr},${nc}).`,
        },
      });

      const oldDist = dist[nr][nc];
      const improves = newCost < oldDist;
      pushStep({
        title: improves
          ? { vi: `${newCost} < ${formatCost(oldDist)}: cải thiện`, en: `${newCost} < ${formatCost(oldDist)}: improvement` }
          : { vi: `${newCost} < ${formatCost(oldDist)}? False`, en: `${newCost} < ${formatCost(oldDist)}? False` },
        codeLine: 22,
        current: [nr, nc],
        vars: [
          { name: "new_cost", value: newCost },
          { name: `dist[${nr}][${nc}]`, value: formatCost(oldDist) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? {
              vi: `Đường mới xóa ít obstacle hơn để tới (${nr},${nc}); cập nhật dist và deque.`,
              en: `The new route removes fewer obstacles to reach (${nr},${nc}); update dist and deque.`,
            }
          : {
              vi: `Đường này không rẻ hơn dist hiện có ${formatCost(oldDist)}, nên bỏ qua.`,
              en: `This route is not cheaper than the stored dist ${formatCost(oldDist)}, so skip it.`,
            },
      });
      if (!improves) continue;

      dist[nr][nc] = newCost;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `dist[${nr}][${nc}] = ${newCost}`, en: `dist[${nr}][${nc}] = ${newCost}` },
        codeLine: 23,
        current: [nr, nc],
        vars: [{ name: "dist", value: distStr() }],
        note: {
          vi: `Lưu cost tốt hơn và parent=(${r},${c}) để dựng đường cuối.`,
          en: `Store the better cost and parent=(${r},${c}) for the final path.`,
        },
      });

      const freeEdge = edgeCost === 0;
      pushStep({
        title: freeEdge
          ? { vi: "edge_cost == 0: True", en: "edge_cost == 0: True" }
          : { vi: "edge_cost == 0: False", en: "edge_cost == 0: False" },
        codeLine: 24,
        current: [nr, nc],
        vars: [
          { name: "edge_cost", value: edgeCost },
          { name: "condition", value: freeEdge },
        ],
        note: freeEdge
          ? {
              vi: "Ô trống cost 0 phải được ưu tiên ở ĐẦU deque.",
              en: "An empty cost-0 cell is prioritized at the FRONT of the deque.",
            }
          : {
              vi: "Obstacle cost 1 phải chờ ở CUỐI deque.",
              en: "A cost-1 obstacle must wait at the BACK of the deque.",
            },
      });

      if (freeEdge) {
        deque.unshift([newCost, nr, nc]);
        pushStep({
          title: { vi: `appendleft((${newCost}, ${nr}, ${nc}))`, en: `appendleft((${newCost}, ${nr}, ${nc}))` },
          codeLine: 25,
          current: [nr, nc],
          vars: [{ name: "deque", value: dequeStr() }],
          note: {
            vi: "Đi vào ô trống không tăng cost, nên xử lý trạng thái này sớm nhất.",
            en: "Entering an empty cell does not increase cost, so process this state earliest.",
          },
        });
      } else {
        pushStep({
          title: { vi: "Đi vào nhánh else", en: "Enter the else branch" },
          codeLine: 26,
          current: [nr, nc],
          vars: [{ name: "edge_cost", value: edgeCost }],
          note: {
            vi: "Đây là obstacle cost 1, nên không được vượt trước các trạng thái cost 0.",
            en: "This is a cost-1 obstacle, so it must not jump ahead of cost-0 states.",
          },
        });

        deque.push([newCost, nr, nc]);
        pushStep({
          title: { vi: `append((${newCost}, ${nr}, ${nc}))`, en: `append((${newCost}, ${nr}, ${nc}))` },
          codeLine: 27,
          current: [nr, nc],
          vars: [{ name: "deque", value: dequeStr() }],
          note: {
            vi: "Thêm obstacle vào cuối deque; các đường chưa phải xóa thêm obstacle chạy trước.",
            en: "Add the obstacle to the back; routes requiring no extra removal run first.",
          },
        });
      }
    }
  }

  pushStep({
    title: { vi: "Deque đã rỗng", en: "The deque is empty" },
    codeLine: 12,
    vars: [
      { name: "deque", value: "[]" },
      { name: "dist", value: distStr() },
    ],
    note: {
      vi: "Mọi đường có thể cải thiện đã được relax; bảng dist hoàn tất.",
      en: "Every improving route has been relaxed; the dist table is complete.",
    },
  });

  const answer = dist[rows - 1][cols - 1];
  const path = [];
  let current = [rows - 1, cols - 1];
  while (current) {
    path.unshift(current);
    current = parent[current[0]][current[1]];
  }
  const pathCells = new Set(path.map(([r, c]) => key(r, c)));
  const removed = path.filter(([r, c]) => grid[r][c] === 1);
  const pathText = path.map(([r, c]) => `(${r},${c})`).join(" → ");
  const removedText = removed.length
    ? removed.map(([r, c]) => `(${r},${c})`).join(", ")
    : "none";
  pushStep({
    title: { vi: `Cần xóa ít nhất ${answer} obstacle`, en: `Remove at least ${answer} obstacle(s)` },
    codeLine: 28,
    pathCells,
    final: true,
    vars: [
      { name: "path", value: pathText },
      { name: "removed obstacles", value: removedText },
      { name: "answer", value: answer },
    ],
    note: {
      vi: `Đường xanh lá: ${pathText}. Các ô obstacle bị xóa: ${removedText}; tổng cộng ${answer}, và không có đường nào xóa ít hơn.`,
      en: `Green path: ${pathText}. Removed obstacle cells: ${removedText}; ${answer} total, and no route removes fewer.`,
    },
  });

  return { original: grid, answer, steps };
}

// ─── 2577: Minimum Time to Visit a Cell In a Grid (Dijkstra + parity) ───
function buildSteps2577(input) {
  const grid = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const valid = rows >= 2 && cols >= 2 && rows <= 20 && cols <= 20
    && grid.every((row) => row.length === cols
      && row.every((value) => Number.isInteger(value) && value >= 0))
    && grid[0][0] === 0;

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Grid phải là ma trận chữ nhật ít nhất 2×2, chứa số nguyên không âm, grid[0][0] = 0; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ tối đa 20×20.",
        en: "The grid must be a rectangular matrix of at least 2×2 non-negative integers with grid[0][0] = 0; separate rows with '|' or ';'. The visualization supports at most 20×20.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const heap = [];
  const finalized = new Set();
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const formatTime = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map((row) => `[${row.map(formatTime).join(", ")}]`).join(", ")}]`;
  const heapStr = () => `[${heap.map(([time, r, c]) => `(${time}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return grid.map((row, r) => row.map((unlockTime, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (pathCells.has(cellKey)) cls = "path";
      if (current && current[0] === r && current[1] === c) cls = "current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === rows - 1 && c === cols - 1
          ? " · T"
          : "";
      return { label: String(unlockTime), meta: `arr ${formatTime(dist[r][c])}${endpoint}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước grid: ${rows} × ${cols}`, en: `Grid size: ${rows} × ${cols}` },
    codeLine: 6,
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: `Số trong ô là thời điểm sớm nhất ô đó mở. meta t:… bên dưới là thời gian Dijkstra tìm được để tới ô; đi từ (0,0) tới (${rows - 1},${cols - 1}).`,
      en: `A cell's number is its unlock time. The t:… metadata below it is Dijkstra's earliest known arrival; travel from (0,0) to (${rows - 1},${cols - 1}).`,
    },
  });

  const blockedAtStart = grid[0][1] > 1 && grid[1][0] > 1;
  pushStep({
    title: blockedAtStart
      ? { vi: `${grid[0][1]} > 1 và ${grid[1][0]} > 1: bị kẹt`, en: `${grid[0][1]} > 1 and ${grid[1][0]} > 1: trapped` }
      : { vi: "Có ít nhất một ô đi được tại t=1", en: "At least one cell is available at t=1" },
    codeLine: 7,
    current: [0, 0],
    vars: [
      { name: "grid[0][1]", value: grid[0][1] },
      { name: "grid[1][0]", value: grid[1][0] },
      { name: "both > 1", value: blockedAtStart },
    ],
    note: blockedAtStart
      ? {
          vi: "Ở t=0 đang tại start và t=1 bắt buộc phải rời đi. Cả hai hàng xóm đều chưa mở, trong khi không được đứng yên, nên không thể bắt đầu.",
          en: "At t=0 we are at the start and must leave at t=1. Both neighbors are still locked and waiting in place is forbidden, so movement cannot begin.",
        }
      : {
          vi: "Ít nhất một hàng xóm mở không muộn hơn t=1, nên có thể rời start và về sau dùng việc đi qua lại để chờ.",
          en: "At least one neighbor unlocks by t=1, so we can leave the start and later wait by moving back and forth.",
        },
  });

  if (blockedAtStart) {
    pushStep({
      title: { vi: "Không thể rời ô bắt đầu", en: "Cannot leave the start" },
      codeLine: 8,
      current: [0, 0],
      final: true,
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "Trả -1 ngay. Đây là trường hợp đặc biệt cần kiểm tra trước Dijkstra vì chưa có cạnh nào để đi qua lại trong lúc chờ.",
        en: "Return -1 immediately. This special case precedes Dijkstra because no edge is available for back-and-forth waiting.",
      },
    });
    return { original: grid, answer: -1, steps };
  }

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 10,
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "dist[r][c] là thời điểm sớm nhất đã biết có thể bước vào (r,c). ∞ nghĩa là chưa tìm thấy đường.",
      en: "dist[r][c] is the earliest known time at which (r,c) can be entered. ∞ means no route is known.",
    },
  });

  dist[0][0] = 0;
  pushStep({
    title: { vi: "Start có thời gian 0", en: "The start time is 0" },
    codeLine: 11,
    current: [0, 0],
    vars: [{ name: "dist[0][0]", value: 0 }],
    note: { vi: "Ta bắt đầu tại (0,0) đúng thời điểm t=0.", en: "We begin at (0,0) exactly at t=0." },
  });

  heap.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa start vào min-heap", en: "Push the start into the min-heap" },
    codeLine: 12,
    current: [0, 0],
    vars: [{ name: "heap", value: heapStr() }],
    note: { vi: "Heap lưu (time,row,col) và luôn ưu tiên thời gian nhỏ nhất.", en: "The heap stores (time,row,col) and always prioritizes the smallest time." },
  });

  pushStep({
    title: { vi: "Chuẩn bị bốn hướng", en: "Prepare four directions" },
    codeLine: 13,
    vars: [{ name: "directions", value: "[(1,0), (-1,0), (0,1), (0,-1)]" }],
    note: { vi: "Mỗi giây phải di chuyển đúng một ô theo bốn hướng; không được đứng yên.", en: "Every second must move exactly one cell in four directions; staying still is forbidden." },
  });

  let answer = -1;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 15,
      vars: [{ name: "heap", value: heapStr() }],
      note: { vi: "Tiếp tục Dijkstra với trạng thái có thời gian tới nhỏ nhất.", en: "Continue Dijkstra with the state having the earliest arrival time." },
    });

    const [time, r, c] = heap.shift();
    pushStep({
      title: { vi: `Pop (${time}, ${r}, ${c})`, en: `Pop (${time}, ${r}, ${c})` },
      codeLine: 16,
      current: [r, c],
      vars: [
        { name: "time", value: time },
        { name: "r, c", value: `${r}, ${c}` },
        { name: "heap còn lại", value: heapStr() },
      ],
      note: { vi: `Chọn ô (${r},${c}) vì t=${time} là thời gian nhỏ nhất trong heap.`, en: `Choose (${r},${c}) because t=${time} is the smallest time in the heap.` },
    });

    const stale = time > dist[r][c];
    pushStep({
      title: stale
        ? { vi: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale`, en: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale` }
        : { vi: `${time} > dist[${r}][${c}]? False`, en: `${time} > dist[${r}][${c}]? False` },
      codeLine: 17,
      current: [r, c],
      vars: [
        { name: "time", value: time },
        { name: `dist[${r}][${c}]`, value: dist[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? { vi: "Một đường nhanh hơn đã cập nhật ô này; entry vừa pop đã cũ.", en: "A faster route already updated this cell; the popped entry is stale." }
        : { vi: "Entry vẫn khớp thời gian tốt nhất, nên có thể tiếp tục.", en: "The entry still matches the best time, so processing may continue." },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 18,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: { vi: "Không mở rộng hàng xóm từ một đường tới chậm hơn.", en: "Do not expand neighbors from a slower route." },
      });
      continue;
    }

    finalized.add(key(r, c));
    const reachedTarget = r === rows - 1 && c === cols - 1;
    pushStep({
      title: reachedTarget
        ? { vi: `(${r},${c}) là đích`, en: `(${r},${c}) is the target` }
        : { vi: `(${r},${c}) chưa phải đích`, en: `(${r},${c}) is not the target` },
      codeLine: 19,
      current: [r, c],
      vars: [
        { name: "current", value: `(${r}, ${c})` },
        { name: "target", value: `(${rows - 1}, ${cols - 1})` },
        { name: "condition", value: reachedTarget },
      ],
      note: reachedTarget
        ? { vi: "Đích được pop với time nhỏ nhất toàn heap, nên kết quả đã tối ưu.", en: "The target was popped with the heap's smallest time, so the result is optimal." }
        : { vi: "Chưa tới đích; tiếp tục relax bốn hàng xóm.", en: "The target has not been reached; relax the four neighbors." },
    });

    if (reachedTarget) {
      answer = time;
      const path = [];
      let current = [r, c];
      while (current) {
        path.unshift(current);
        current = parent[current[0]][current[1]];
      }
      const pathCells = new Set(path.map(([pr, pc]) => key(pr, pc)));
      const pathText = path.map(([pr, pc]) => `(${pr},${pc})@t${dist[pr][pc]}`).join(" → ");
      const waits = [];
      for (let i = 1; i < path.length; i += 1) {
        const [pr, pc] = path[i - 1];
        const [cr, cc] = path[i];
        const delay = dist[cr][cc] - dist[pr][pc] - 1;
        if (delay > 0) waits.push(`trước (${cr},${cc}): ${delay}s`);
      }
      const waitsText = waits.length ? waits.join(", ") : "không cần chờ";
      pushStep({
        title: { vi: `Thời gian nhỏ nhất = ${answer}`, en: `Minimum time = ${answer}` },
        codeLine: 20,
        pathCells,
        final: true,
        vars: [
          { name: "path + arrival time", value: pathText },
          { name: "waiting", value: waitsText },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đường xanh lá ghi kèm thời điểm tới: ${pathText}. ${waits.length ? `Thời gian đi qua lại để chờ: ${waitsText}.` : "Mỗi bước đi ngay 1 giây, không cần đi qua lại để chờ."}`,
          en: `The green path includes arrival times: ${pathText}. ${waits.length ? `Back-and-forth waiting: ${waitsText}.` : "Every move takes one immediate second; no back-and-forth waiting is needed."}`,
        },
      });
      break;
    }

    for (const [dr, dc] of directions) {
      pushStep({
        title: { vi: `Lấy hướng (${dr},${dc})`, en: `Take direction (${dr},${dc})` },
        codeLine: 22,
        current: [r, c],
        vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }],
        note: { vi: `Từ (${r},${c}), thử đi theo độ lệch (${dr},${dc}).`, en: `From (${r},${c}), try offset (${dr},${dc}).` },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Neighbor = (${nr},${nc})`, en: `Neighbor = (${nr},${nc})` },
        codeLine: 23,
        current: [r, c],
        vars: [{ name: "nr", value: nr }, { name: "nc", value: nc }],
        note: { vi: "Tính tọa độ ô sẽ thử bước vào.", en: "Compute the coordinates of the cell to enter." },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong grid`, en: `(${nr},${nc}) is inside the grid` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 24,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [{ name: "neighbor", value: `(${nr}, ${nc})` }, { name: "in bounds", value: inBounds }],
        note: inBounds
          ? { vi: "Tọa độ hợp lệ; bắt đầu tính thời điểm tới sớm nhất.", en: "The coordinates are valid; compute the earliest arrival." }
          : { vi: "Tọa độ ngoài grid nên bỏ qua hướng này.", en: "The coordinates are outside the grid, so skip this direction." },
      });
      if (!inBounds) continue;

      let nextTime = time + 1;
      pushStep({
        title: { vi: `next_time = ${time} + 1 = ${nextTime}`, en: `next_time = ${time} + 1 = ${nextTime}` },
        codeLine: 25,
        current: [nr, nc],
        vars: [{ name: "time", value: time }, { name: "next_time", value: nextTime }],
        note: { vi: `Nếu đi ngay từ (${r},${c}), sớm nhất sẽ tới (${nr},${nc}) ở t=${nextTime}.`, en: `Leaving (${r},${c}) immediately reaches (${nr},${nc}) no earlier than t=${nextTime}.` },
      });

      const locked = nextTime < grid[nr][nc];
      pushStep({
        title: locked
          ? { vi: `${nextTime} < grid[${nr}][${nc}]=${grid[nr][nc]}: chưa mở`, en: `${nextTime} < grid[${nr}][${nc}]=${grid[nr][nc]}: locked` }
          : { vi: `${nextTime} < grid[${nr}][${nc}]=${grid[nr][nc]}? False`, en: `${nextTime} < grid[${nr}][${nc}]=${grid[nr][nc]}? False` },
        codeLine: 26,
        current: [nr, nc],
        vars: [
          { name: "next_time", value: nextTime },
          { name: `grid[${nr}][${nc}]`, value: grid[nr][nc] },
          { name: "locked", value: locked },
        ],
        note: locked
          ? { vi: "Ô chưa mở ở lần tới đầu tiên. Không được đứng yên, nên phải đi qua lại theo chu kỳ 2 giây.", en: "The cell is locked at the first attempted arrival. Standing still is forbidden, so wait by moving back and forth in two-second cycles." }
          : { vi: `Ô đã mở tại t=${nextTime}; có thể bước vào ngay, không cần chờ.`, en: `The cell is open at t=${nextTime}; enter immediately without waiting.` },
      });

      if (locked) {
        const gap = grid[nr][nc] - nextTime;
        pushStep({
          title: { vi: `wait = ${grid[nr][nc]} - ${nextTime} = ${gap}`, en: `wait = ${grid[nr][nc]} - ${nextTime} = ${gap}` },
          codeLine: 27,
          current: [nr, nc],
          vars: [
            { name: "unlock time", value: grid[nr][nc] },
            { name: "first attempt", value: nextTime },
            { name: "wait", value: gap },
          ],
          note: {
            vi: `Còn thiếu ${gap} giây so với lúc ô mở. Ta chỉ có thể cộng thời gian theo bội số 2 bằng cách đi sang ô kề rồi quay lại.`,
            en: `The cell opens ${gap} seconds after the first attempt. Time can only be added in multiples of two by moving to an adjacent cell and back.`,
          },
        });

        const adjustedTime = grid[nr][nc] + (gap % 2);
        pushStep({
          title: { vi: `next_time = ${grid[nr][nc]} + (${gap} % 2) = ${adjustedTime}`, en: `next_time = ${grid[nr][nc]} + (${gap} % 2) = ${adjustedTime}` },
          codeLine: 28,
          current: [nr, nc],
          vars: [
            { name: "grid[nr][nc]", value: grid[nr][nc] },
            { name: "wait % 2", value: gap % 2 },
            { name: "next_time", value: adjustedTime },
          ],
          note: gap % 2 === 0
            ? { vi: `Khoảng thiếu ${gap} là chẵn, nên có thể đến đúng lúc ô mở: t=${adjustedTime}.`, en: `The gap ${gap} is even, so arrival can match the unlock time exactly: t=${adjustedTime}.` }
            : { vi: `Khoảng thiếu ${gap} là lẻ nhưng mỗi vòng chờ tốn 2 giây, nên phải tới muộn hơn giờ mở 1 giây: t=${adjustedTime}.`, en: `The gap ${gap} is odd but each waiting cycle takes two seconds, so arrival must be one second after unlock: t=${adjustedTime}.` },
        });
        nextTime = adjustedTime;
      }

      const oldDist = dist[nr][nc];
      const improves = nextTime < oldDist;
      pushStep({
        title: improves
          ? { vi: `${nextTime} < ${formatTime(oldDist)}: tới sớm hơn`, en: `${nextTime} < ${formatTime(oldDist)}: earlier arrival` }
          : { vi: `${nextTime} < ${formatTime(oldDist)}? False`, en: `${nextTime} < ${formatTime(oldDist)}? False` },
        codeLine: 29,
        current: [nr, nc],
        vars: [
          { name: "next_time", value: nextTime },
          { name: `dist[${nr}][${nc}]`, value: formatTime(oldDist) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? { vi: `Đường mới tới (${nr},${nc}) sớm hơn, nên cập nhật dist và parent.`, en: `The new route reaches (${nr},${nc}) earlier, so update dist and parent.` }
          : { vi: `Ô (${nr},${nc}) đã có thời gian không lớn hơn ${nextTime}; giữ nguyên.`, en: `Cell (${nr},${nc}) already has an arrival time no greater than ${nextTime}; keep it.` },
      });
      if (!improves) continue;

      dist[nr][nc] = nextTime;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `dist[${nr}][${nc}] = ${nextTime}`, en: `dist[${nr}][${nc}] = ${nextTime}` },
        codeLine: 30,
        current: [nr, nc],
        vars: [{ name: "dist", value: distStr() }, { name: "parent", value: `(${r}, ${c})` }],
        note: { vi: "Lưu thời gian tốt hơn; parent chỉ phục vụ dựng đường xanh ở bước cuối.", en: "Store the better time; parent is used only to reconstruct the final green path." },
      });

      heap.push([nextTime, nr, nc]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: `Push (${nextTime}, ${nr}, ${nc})`, en: `Push (${nextTime}, ${nr}, ${nc})` },
        codeLine: 31,
        current: [nr, nc],
        vars: [{ name: "heap", value: heapStr() }],
        note: { vi: "Đưa trạng thái mới vào min-heap để tiếp tục ưu tiên thời gian nhỏ nhất.", en: "Push the new state into the min-heap to keep prioritizing the smallest time." },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Không thể tới đích", en: "The target is unreachable" },
      codeLine: 32,
      final: true,
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Heap đã rỗng mà đích chưa được pop, nên trả -1.", en: "The heap is empty without popping the target, so return -1." },
    });
  }

  return { original: grid, answer, steps };
}

// ─── 3341: Find Minimum Time to Reach Last Room I (Dijkstra) ───
function buildSteps3341(input) {
  const moveTime = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = moveTime.length;
  const cols = rows > 0 ? moveTime[0].length : 0;
  const valid = rows >= 2 && cols >= 2 && rows <= 20 && cols <= 20
    && moveTime.every((row) => row.length === cols
      && row.every((value) => Number.isInteger(value) && value >= 0));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "moveTime phải là ma trận chữ nhật ít nhất 2×2, chứa số nguyên không âm; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ tối đa 20×20.",
        en: "moveTime must be a rectangular matrix of at least 2×2 non-negative integers; separate rows with '|' or ';'. The visualization supports at most 20×20.",
      },
    });
    return { original: moveTime, answer: -1, steps };
  }

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const heap = [];
  const finalized = new Set();
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const formatTime = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map((row) => `[${row.map(formatTime).join(", ")}]`).join(", ")}]`;
  const heapStr = () => `[${heap.map(([time, r, c]) => `(${time}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return moveTime.map((row, r) => row.map((readyAt, c) => {
      const cellKey = key(r, c);
      let cls = "empty";
      if (finalized.has(cellKey)) cls = "visited";
      if (queued.has(cellKey)) cls = "queued";
      if (pathCells.has(cellKey)) cls = "path";
      if (current && current[0] === r && current[1] === c) cls = "current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === rows - 1 && c === cols - 1
          ? " · T"
          : "";
      return { label: formatTime(dist[r][c]), meta: `⏱${readyAt}${endpoint}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước moveTime: ${rows} × ${cols}`, en: `moveTime size: ${rows} × ${cols}` },
    codeLine: 6,
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: `Số lớn trong ô là thời điểm ĐẾN sớm nhất mà Dijkstra tìm được (cập nhật dần); ⏱ nhỏ là thời điểm phòng SẴN SÀNG cho phép bắt đầu đi vào (cố định, lấy từ input). Đích là (${rows - 1},${cols - 1}).`,
      en: `The big number is the earliest ARRIVAL time Dijkstra has found so far (it updates as we go); the small ⏱ value is when the room is READY to be entered (fixed, from the input). The target is (${rows - 1},${cols - 1}).`,
    },
  });

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 7,
    vars: [{ name: "dist", value: distStr() }],
    note: {
      vi: "dist[r][c] là thời điểm sớm nhất đã biết ta ĐẾN phòng (r,c). ∞ nghĩa là chưa tìm thấy đường.",
      en: "dist[r][c] is the earliest known time we ARRIVE at room (r,c). ∞ means no route is known.",
    },
  });

  dist[0][0] = 0;
  pushStep({
    title: { vi: "Bắt đầu tại t=0", en: "Start at t=0" },
    codeLine: 8,
    current: [0, 0],
    vars: [{ name: "dist[0][0]", value: 0 }],
    note: { vi: "Ta đã ở phòng (0,0) tại thời điểm 0, nên không cộng thời gian của moveTime[0][0].", en: "We are already in room (0,0) at time 0, so moveTime[0][0] is not added." },
  });

  heap.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa start vào min-heap", en: "Push the start into the min-heap" },
    codeLine: 9,
    current: [0, 0],
    vars: [{ name: "heap", value: heapStr() }],
    note: { vi: "Heap lưu (time,row,col) và ưu tiên phòng có thời điểm đến nhỏ nhất.", en: "The heap stores (time,row,col) and prioritizes the room with the earliest arrival." },
  });

  pushStep({
    title: { vi: "Chuẩn bị bốn hướng", en: "Prepare four directions" },
    codeLine: 10,
    vars: [{ name: "directions", value: "[(1,0), (-1,0), (0,1), (0,-1)]" }],
    note: { vi: "Mỗi lần di chuyển sang một phòng chung tường mất đúng 1 giây.", en: "Each move to a room sharing a wall takes exactly one second." },
  });

  let answer = -1;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 12,
      vars: [{ name: "heap", value: heapStr() }],
      note: { vi: "Tiếp tục Dijkstra bằng phòng có thời điểm đến nhỏ nhất.", en: "Continue Dijkstra with the room having the earliest arrival time." },
    });

    const [time, r, c] = heap.shift();
    pushStep({
      title: { vi: `Pop (${time}, ${r}, ${c})`, en: `Pop (${time}, ${r}, ${c})` },
      codeLine: 13,
      current: [r, c],
      vars: [
        { name: "time", value: time },
        { name: "r, c", value: `${r}, ${c}` },
        { name: "heap còn lại", value: heapStr() },
      ],
      note: { vi: `Chọn phòng (${r},${c}) vì t=${time} là thời điểm đến nhỏ nhất trong heap.`, en: `Choose room (${r},${c}) because t=${time} is the smallest arrival time in the heap.` },
    });

    const stale = time > dist[r][c];
    pushStep({
      title: stale
        ? { vi: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale`, en: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale` }
        : { vi: `${time} > dist[${r}][${c}]? False`, en: `${time} > dist[${r}][${c}]? False` },
      codeLine: 14,
      current: [r, c],
      vars: [
        { name: "time", value: time },
        { name: `dist[${r}][${c}]`, value: dist[r][c] },
        { name: "condition", value: stale },
      ],
      note: stale
        ? { vi: "Một đường nhanh hơn đã cập nhật phòng này; entry vừa pop đã cũ.", en: "A faster route already updated this room; the popped entry is stale." }
        : { vi: "Entry vẫn khớp dist tốt nhất, nên được phép mở rộng hàng xóm.", en: "The entry still matches the best dist, so its neighbors may be expanded." },
    });

    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 15,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: { vi: "Không xét hàng xóm từ một đường tới chậm hơn.", en: "Do not inspect neighbors from a slower route." },
      });
      continue;
    }

    finalized.add(key(r, c));
    const reachedTarget = r === rows - 1 && c === cols - 1;
    pushStep({
      title: reachedTarget
        ? { vi: `(${r},${c}) là phòng cuối`, en: `(${r},${c}) is the last room` }
        : { vi: `(${r},${c}) chưa phải phòng cuối`, en: `(${r},${c}) is not the last room` },
      codeLine: 16,
      current: [r, c],
      vars: [
        { name: "current", value: `(${r}, ${c})` },
        { name: "target", value: `(${rows - 1}, ${cols - 1})` },
        { name: "condition", value: reachedTarget },
      ],
      note: reachedTarget
        ? { vi: "Phòng cuối được pop với time nhỏ nhất toàn heap, nên kết quả đã tối ưu.", en: "The last room was popped with the heap's smallest time, so the result is optimal." }
        : { vi: "Chưa tới phòng cuối; tiếp tục thử bốn phòng chung tường.", en: "The last room has not been reached; try the four rooms sharing a wall." },
    });

    if (reachedTarget) {
      answer = time;
      const path = [];
      let current = [r, c];
      while (current) {
        path.unshift(current);
        current = parent[current[0]][current[1]];
      }
      const pathCells = new Set(path.map(([pr, pc]) => key(pr, pc)));
      const pathText = path.map(([pr, pc]) => `(${pr},${pc})@t${dist[pr][pc]}`).join(" → ");
      const waits = [];
      for (let i = 1; i < path.length; i += 1) {
        const [pr, pc] = path[i - 1];
        const [cr, cc] = path[i];
        const wait = dist[cr][cc] - dist[pr][pc] - 1;
        if (wait > 0) waits.push(`tại (${pr},${pc}): ${wait}s`);
      }
      const waitsText = waits.length ? waits.join(", ") : "không cần chờ";
      pushStep({
        title: { vi: `Thời gian nhỏ nhất = ${answer}`, en: `Minimum time = ${answer}` },
        codeLine: 17,
        pathCells,
        final: true,
        vars: [
          { name: "path + arrival time", value: pathText },
          { name: "waiting", value: waitsText },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đường xanh lá ghi thời điểm ĐẾN từng phòng: ${pathText}. ${waits.length ? `Thời gian đứng chờ: ${waitsText}.` : "Không phải đứng chờ trên đường này."}`,
          en: `The green path labels ARRIVAL time at each room: ${pathText}. ${waits.length ? `Standing wait time: ${waitsText}.` : "No standing wait is needed on this route."}`,
        },
      });
      break;
    }

    for (const [dr, dc] of directions) {
      pushStep({
        title: { vi: `Lấy hướng (${dr},${dc})`, en: `Take direction (${dr},${dc})` },
        codeLine: 19,
        current: [r, c],
        vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }],
        note: { vi: `Từ (${r},${c}), thử phòng theo độ lệch (${dr},${dc}).`, en: `From (${r},${c}), try the room at offset (${dr},${dc}).` },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Neighbor = (${nr},${nc})`, en: `Neighbor = (${nr},${nc})` },
        codeLine: 20,
        current: [r, c],
        vars: [{ name: "nr", value: nr }, { name: "nc", value: nc }],
        note: { vi: "Tính tọa độ phòng sẽ thử đi vào.", en: "Compute the coordinates of the room to enter." },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong dungeon`, en: `(${nr},${nc}) is inside the dungeon` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 21,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [{ name: "neighbor", value: `(${nr}, ${nc})` }, { name: "in bounds", value: inBounds }],
        note: inBounds
          ? { vi: "Tọa độ hợp lệ; tính lúc được phép xuất phát và lúc đến.", en: "The coordinates are valid; compute the allowed departure and arrival times." }
          : { vi: "Tọa độ ngoài dungeon nên bỏ qua hướng này.", en: "The coordinates are outside the dungeon, so skip this direction." },
      });
      if (!inBounds) continue;

      const readyAt = moveTime[nr][nc];
      const departAt = Math.max(time, readyAt);
      const nextTime = departAt + 1;
      pushStep({
        title: { vi: `depart = max(${time}, ${readyAt}) = ${departAt}`, en: `depart = max(${time}, ${readyAt}) = ${departAt}` },
        codeLine: 22,
        current: [nr, nc],
        vars: [
          { name: "current time", value: time },
          { name: `moveTime[${nr}][${nc}]`, value: readyAt },
          { name: "depart time", value: departAt },
          { name: "standing wait", value: departAt - time },
        ],
        note: departAt > time
          ? { vi: `Đang ở (${r},${c}) lúc t=${time}, nhưng chỉ được bắt đầu đi vào (${nr},${nc}) từ t=${readyAt}. Đứng chờ ${departAt - time} giây rồi xuất phát.`, en: `We are at (${r},${c}) at t=${time}, but movement into (${nr},${nc}) may start only at t=${readyAt}. Stand and wait ${departAt - time} second(s), then depart.` }
          : { vi: `Phòng (${nr},${nc}) đã sẵn sàng, nên xuất phát ngay tại t=${time}.`, en: `Room (${nr},${nc}) is already available, so depart immediately at t=${time}.` },
      });

      pushStep({
        title: { vi: `next_time = ${departAt} + 1 = ${nextTime}`, en: `next_time = ${departAt} + 1 = ${nextTime}` },
        codeLine: 22,
        current: [nr, nc],
        vars: [
          { name: "depart time", value: departAt },
          { name: "move duration", value: 1 },
          { name: "next_time (arrival)", value: nextTime },
        ],
        note: {
          vi: `Sau khi được phép xuất phát tại t=${departAt}, di chuyển mất đúng 1 giây nên ĐẾN (${nr},${nc}) tại t=${nextTime}. Đây là lý do +1 nằm ngoài max().`,
          en: `After departure is allowed at t=${departAt}, movement takes exactly one second, so ARRIVAL at (${nr},${nc}) is t=${nextTime}. This is why +1 sits outside max().`,
        },
      });

      const oldDist = dist[nr][nc];
      const improves = nextTime < oldDist;
      pushStep({
        title: improves
          ? { vi: `${nextTime} < ${formatTime(oldDist)}: tới sớm hơn`, en: `${nextTime} < ${formatTime(oldDist)}: earlier arrival` }
          : { vi: `${nextTime} < ${formatTime(oldDist)}? False`, en: `${nextTime} < ${formatTime(oldDist)}? False` },
        codeLine: 23,
        current: [nr, nc],
        vars: [
          { name: "next_time", value: nextTime },
          { name: `dist[${nr}][${nc}]`, value: formatTime(oldDist) },
          { name: "condition", value: improves },
        ],
        note: improves
          ? { vi: `Đường mới đến (${nr},${nc}) sớm hơn; cập nhật dist và parent.`, en: `The new route reaches (${nr},${nc}) earlier; update dist and parent.` }
          : { vi: `Phòng (${nr},${nc}) đã có đường đến không chậm hơn ${nextTime}; giữ nguyên.`, en: `Room (${nr},${nc}) already has a route arriving no later than ${nextTime}; keep it.` },
      });
      if (!improves) continue;

      dist[nr][nc] = nextTime;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `dist[${nr}][${nc}] = ${nextTime}`, en: `dist[${nr}][${nc}] = ${nextTime}` },
        codeLine: 24,
        current: [nr, nc],
        vars: [{ name: "dist", value: distStr() }, { name: "parent", value: `(${r}, ${c})` }],
        note: { vi: "Lưu thời điểm đến tốt hơn; parent dùng để dựng đường xanh ở bước cuối.", en: "Store the better arrival time; parent reconstructs the final green path." },
      });

      heap.push([nextTime, nr, nc]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: `Push (${nextTime}, ${nr}, ${nc})`, en: `Push (${nextTime}, ${nr}, ${nc})` },
        codeLine: 25,
        current: [nr, nc],
        vars: [{ name: "heap", value: heapStr() }],
        note: { vi: "Đưa trạng thái mới vào min-heap để Dijkstra tiếp tục chọn thời gian nhỏ nhất.", en: "Push the new state into the min-heap so Dijkstra keeps choosing the smallest time." },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Không thể tới phòng cuối", en: "Cannot reach the last room" },
      codeLine: 26,
      final: true,
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Heap đã rỗng mà phòng cuối chưa được pop, nên trả -1.", en: "The heap is empty without popping the last room, so return -1." },
    });
  }

  return { original: moveTime, answer, steps };
}

// ─── 3342: Find Minimum Time to Reach Last Room II (alternating Dijkstra) ───
function buildSteps3342(input) {
  const moveTime = String(input)
    .split(/[|;]/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split(",").map((value) => Number(value.trim())));
  const steps = [];
  const rows = moveTime.length;
  const cols = rows > 0 ? moveTime[0].length : 0;
  const valid = rows >= 2 && cols >= 2 && rows <= 20 && cols <= 20
    && moveTime.every((row) => row.length === cols
      && row.every((value) => Number.isInteger(value) && value >= 0));

  if (!valid) {
    steps.push({
      title: { vi: "Đầu vào không hợp lệ", en: "Invalid input" },
      arr: [],
      bfsGrid: { rows: 1, cols: 1, variant: "effort-grid", cells: [[{ label: "!", meta: "invalid", cls: "current" }]] },
      highlight: [],
      mark: [],
      final: true,
      codeLines: [6],
      vars: [{ name: "answer", value: -1 }],
      note: {
        vi: "moveTime phải là ma trận chữ nhật ít nhất 2×2, chứa số nguyên không âm; hàng cách bởi '|' hoặc ';'. Visualization hỗ trợ tối đa 20×20.",
        en: "moveTime must be a rectangular matrix of at least 2×2 non-negative integers; separate rows with '|' or ';'. The visualization supports at most 20×20.",
      },
    });
    return { original: moveTime, answer: -1, steps };
  }

  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const heap = [];
  const finalized = new Set();
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const key = (r, c) => `${r},${c}`;
  const formatTime = (value) => Number.isFinite(value) ? String(value) : "∞";
  const distStr = () => `[${dist.map((row) => `[${row.map(formatTime).join(", ")}]`).join(", ")}]`;
  const heapStr = () => `[${heap.map(([time, r, c]) => `(${time}, ${r}, ${c})`).join(", ")}]`;

  function makeCells(current = null, pathCells = new Set()) {
    const queued = new Set(heap.map(([, r, c]) => key(r, c)));
    return moveTime.map((row, r) => row.map((readyAt, c) => {
      const cellKey = key(r, c);
      let cls = (r + c) % 2 === 0 ? "parity-even" : "parity-odd";
      if (finalized.has(cellKey)) cls += " visited";
      if (queued.has(cellKey)) cls += " queued";
      if (pathCells.has(cellKey)) cls += " path";
      if (current && current[0] === r && current[1] === c) cls += " current";
      const endpoint = r === 0 && c === 0
        ? " · S"
        : r === rows - 1 && c === cols - 1
          ? " · T"
          : "";
      return { label: formatTime(dist[r][c]), meta: `⏱${readyAt}${endpoint}`, cls };
    }));
  }

  function pushStep({ title, codeLine, vars, note, current = null, pathCells, final = false }) {
    steps.push({
      title,
      arr: [],
      bfsGrid: { rows, cols, variant: "effort-grid", parity: true, cells: makeCells(current, pathCells) },
      highlight: [],
      mark: [],
      final,
      codeLines: [codeLine],
      vars,
      note,
    });
  }

  pushStep({
    title: { vi: `Kích thước moveTime: ${rows} × ${cols}`, en: `moveTime size: ${rows} × ${cols}` },
    codeLine: 6,
    vars: [{ name: "rows", value: rows }, { name: "cols", value: cols }],
    note: {
      vi: `Số lớn trong ô là thời điểm ĐẾN sớm nhất Dijkstra tìm được (cập nhật dần); ⏱ nhỏ là thời điểm phòng sẵn sàng (cố định). Màu ô caro theo (r+c)%2: ô sáng hơn tốn 1s để bước tới, ô tối hơn tốn 2s.`,
      en: `The big number is the earliest ARRIVAL time found so far (updates over time); the small ⏱ is the fixed ready time. The checkerboard tint follows (r+c)%2: lighter cells cost 1s to step into, darker cells cost 2s.`,
    },
  });

  pushStep({
    title: { vi: "Khởi tạo dist bằng ∞", en: "Initialize dist to ∞" },
    codeLine: 7,
    vars: [{ name: "dist", value: distStr() }],
    note: { vi: "dist[r][c] là thời điểm sớm nhất đã biết ta đến phòng (r,c).", en: "dist[r][c] is the earliest known arrival time at room (r,c)." },
  });

  dist[0][0] = 0;
  pushStep({
    title: { vi: "Bắt đầu tại t=0", en: "Start at t=0" },
    codeLine: 8,
    current: [0, 0],
    vars: [{ name: "dist[0][0]", value: 0 }, { name: "next move", value: "1 second" }],
    note: { vi: "Ta ở (0,0) lúc t=0. Đây là trước lượt đi thứ nhất, nên lần di chuyển tiếp theo mất 1 giây.", en: "We are at (0,0) at t=0. This precedes move 1, so the next movement takes one second." },
  });

  heap.push([0, 0, 0]);
  pushStep({
    title: { vi: "Đưa start vào min-heap", en: "Push the start into the min-heap" },
    codeLine: 9,
    current: [0, 0],
    vars: [{ name: "heap", value: heapStr() }],
    note: { vi: "Heap lưu (time,row,col) và ưu tiên thời điểm đến nhỏ nhất.", en: "The heap stores (time,row,col) and prioritizes the earliest arrival." },
  });

  pushStep({
    title: { vi: "Chuẩn bị bốn hướng", en: "Prepare four directions" },
    codeLine: 10,
    vars: [{ name: "directions", value: "[(1,0), (-1,0), (0,1), (0,-1)]" }],
    note: { vi: "Mỗi bước sang phòng chung tường làm đổi parity của r+c.", en: "Every move to a room sharing a wall flips the parity of r+c." },
  });

  let answer = -1;
  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    pushStep({
      title: { vi: "Heap chưa rỗng", en: "The heap is not empty" },
      codeLine: 12,
      vars: [{ name: "heap", value: heapStr() }],
      note: { vi: "Tiếp tục Dijkstra với phòng có thời điểm đến nhỏ nhất.", en: "Continue Dijkstra with the room having the earliest arrival." },
    });

    const [time, r, c] = heap.shift();
    pushStep({
      title: { vi: `Pop (${time}, ${r}, ${c})`, en: `Pop (${time}, ${r}, ${c})` },
      codeLine: 13,
      current: [r, c],
      vars: [{ name: "time", value: time }, { name: "r, c", value: `${r}, ${c}` }, { name: "heap còn lại", value: heapStr() }],
      note: { vi: `Chọn (${r},${c}) vì t=${time} nhỏ nhất trong heap.`, en: `Choose (${r},${c}) because t=${time} is smallest in the heap.` },
    });

    const stale = time > dist[r][c];
    pushStep({
      title: stale
        ? { vi: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale`, en: `${time} > dist[${r}][${c}]=${dist[r][c]}: stale` }
        : { vi: `${time} > dist[${r}][${c}]? False`, en: `${time} > dist[${r}][${c}]? False` },
      codeLine: 14,
      current: [r, c],
      vars: [{ name: "time", value: time }, { name: `dist[${r}][${c}]`, value: dist[r][c] }, { name: "condition", value: stale }],
      note: stale
        ? { vi: "Một đường nhanh hơn đã cập nhật phòng này; entry vừa pop đã cũ.", en: "A faster route already updated this room; the popped entry is stale." }
        : { vi: "Entry còn hợp lệ, nên có thể tiếp tục.", en: "The entry is still valid, so processing may continue." },
    });
    if (stale) {
      pushStep({
        title: { vi: "Bỏ qua stale entry", en: "Skip the stale entry" },
        codeLine: 15,
        current: [r, c],
        vars: [{ name: "continue", value: true }],
        note: { vi: "Không mở rộng một đường đến chậm hơn.", en: "Do not expand a slower route." },
      });
      continue;
    }

    finalized.add(key(r, c));
    const reachedTarget = r === rows - 1 && c === cols - 1;
    pushStep({
      title: reachedTarget
        ? { vi: `(${r},${c}) là phòng cuối`, en: `(${r},${c}) is the last room` }
        : { vi: `(${r},${c}) chưa phải phòng cuối`, en: `(${r},${c}) is not the last room` },
      codeLine: 16,
      current: [r, c],
      vars: [{ name: "current", value: `(${r}, ${c})` }, { name: "target", value: `(${rows - 1}, ${cols - 1})` }, { name: "condition", value: reachedTarget }],
      note: reachedTarget
        ? { vi: "Phòng cuối được pop với time nhỏ nhất, nên kết quả đã tối ưu.", en: "The last room was popped with the smallest time, so the result is optimal." }
        : { vi: "Chưa tới đích; tiếp tục thử bốn hàng xóm.", en: "The target has not been reached; try the four neighbors." },
    });

    if (reachedTarget) {
      answer = time;
      const path = [];
      let current = [r, c];
      while (current) {
        path.unshift(current);
        current = parent[current[0]][current[1]];
      }
      const pathCells = new Set(path.map(([pr, pc]) => key(pr, pc)));
      let pathText = `(${path[0][0]},${path[0][1]})@t${dist[path[0][0]][path[0][1]]}`;
      const waits = [];
      const durations = [];
      for (let i = 1; i < path.length; i += 1) {
        const [pr, pc] = path[i - 1];
        const [cr, cc] = path[i];
        const duration = (pr + pc) % 2 === 0 ? 1 : 2;
        const wait = dist[cr][cc] - dist[pr][pc] - duration;
        durations.push(`${duration}s`);
        if (wait > 0) waits.push(`tại (${pr},${pc}): ${wait}s`);
        pathText += ` --${duration}s--> (${cr},${cc})@t${dist[cr][cc]}`;
      }
      const waitsText = waits.length ? waits.join(", ") : "không cần chờ";
      pushStep({
        title: { vi: `Thời gian nhỏ nhất = ${answer}`, en: `Minimum time = ${answer}` },
        codeLine: 17,
        pathCells,
        final: true,
        vars: [
          { name: "path + move duration", value: pathText },
          { name: "durations", value: durations.join(" → ") },
          { name: "waiting", value: waitsText },
          { name: "answer", value: answer },
        ],
        note: {
          vi: `Đường xanh lá: ${pathText}. Thời lượng các lượt đúng chuỗi ${durations.join(", ")}. ${waits.length ? `Đứng chờ: ${waitsText}.` : "Không cần đứng chờ."}`,
          en: `Green path: ${pathText}. Move durations follow ${durations.join(", ")}. ${waits.length ? `Standing wait: ${waitsText}.` : "No standing wait is needed."}`,
        },
      });
      break;
    }

    for (const [dr, dc] of directions) {
      pushStep({
        title: { vi: `Lấy hướng (${dr},${dc})`, en: `Take direction (${dr},${dc})` },
        codeLine: 19,
        current: [r, c],
        vars: [{ name: "dr, dc", value: `${dr}, ${dc}` }],
        note: { vi: `Từ (${r},${c}), thử độ lệch (${dr},${dc}).`, en: `From (${r},${c}), try offset (${dr},${dc}).` },
      });

      const nr = r + dr;
      const nc = c + dc;
      pushStep({
        title: { vi: `Neighbor = (${nr},${nc})`, en: `Neighbor = (${nr},${nc})` },
        codeLine: 20,
        current: [r, c],
        vars: [{ name: "nr", value: nr }, { name: "nc", value: nc }],
        note: { vi: "Tính tọa độ phòng sẽ thử đi vào.", en: "Compute the room coordinates to enter." },
      });

      const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      pushStep({
        title: inBounds
          ? { vi: `(${nr},${nc}) nằm trong dungeon`, en: `(${nr},${nc}) is inside the dungeon` }
          : { vi: `(${nr},${nc}) vượt biên`, en: `(${nr},${nc}) is out of bounds` },
        codeLine: 21,
        current: inBounds ? [nr, nc] : [r, c],
        vars: [{ name: "neighbor", value: `(${nr}, ${nc})` }, { name: "in bounds", value: inBounds }],
        note: inBounds
          ? { vi: "Tọa độ hợp lệ; xác định lượt tiếp theo mất 1 hay 2 giây.", en: "The coordinates are valid; determine whether the next move takes one or two seconds." }
          : { vi: "Ngoài dungeon nên bỏ qua hướng này.", en: "Outside the dungeon, so skip this direction." },
      });
      if (!inBounds) continue;

      const parity = (r + c) % 2;
      const moveCost = parity === 0 ? 1 : 2;
      pushStep({
        title: { vi: `(${r}+${c}) % 2 = ${parity} → move_cost = ${moveCost}`, en: `(${r}+${c}) % 2 = ${parity} → move_cost = ${moveCost}` },
        codeLine: 22,
        current: [r, c],
        vars: [
          { name: "r + c", value: r + c },
          { name: "parity", value: parity },
          { name: "next move number", value: parity === 0 ? "odd" : "even" },
          { name: "move_cost", value: moveCost },
        ],
        note: parity === 0
          ? { vi: `Ô (${r},${c}) có r+c chẵn, nên số bước đã đi là chẵn; lượt tiếp theo là lượt lẻ và mất 1 giây.`, en: `Room (${r},${c}) has even r+c, so an even number of moves has been made; the next odd move takes one second.` }
          : { vi: `Ô (${r},${c}) có r+c lẻ, nên số bước đã đi là lẻ; lượt tiếp theo là lượt chẵn và mất 2 giây.`, en: `Room (${r},${c}) has odd r+c, so an odd number of moves has been made; the next even move takes two seconds.` },
      });

      const readyAt = moveTime[nr][nc];
      const departTime = Math.max(time, readyAt);
      pushStep({
        title: { vi: `depart_time = max(${time}, ${readyAt}) = ${departTime}`, en: `depart_time = max(${time}, ${readyAt}) = ${departTime}` },
        codeLine: 23,
        current: [nr, nc],
        vars: [
          { name: "current time", value: time },
          { name: `moveTime[${nr}][${nc}]`, value: readyAt },
          { name: "depart_time", value: departTime },
          { name: "standing wait", value: departTime - time },
        ],
        note: departTime > time
          ? { vi: `Phải đứng tại (${r},${c}) chờ ${departTime - time} giây, rồi mới được bắt đầu đi vào (${nr},${nc}) ở t=${departTime}.`, en: `Stand in (${r},${c}) for ${departTime - time} second(s), then movement into (${nr},${nc}) may begin at t=${departTime}.` }
          : { vi: `Phòng (${nr},${nc}) đã sẵn sàng, xuất phát ngay tại t=${time}.`, en: `Room (${nr},${nc}) is ready, so depart immediately at t=${time}.` },
      });

      const nextTime = departTime + moveCost;
      pushStep({
        title: { vi: `next_time = ${departTime} + ${moveCost} = ${nextTime}`, en: `next_time = ${departTime} + ${moveCost} = ${nextTime}` },
        codeLine: 24,
        current: [nr, nc],
        vars: [{ name: "depart_time", value: departTime }, { name: "move_cost", value: moveCost }, { name: "next_time (arrival)", value: nextTime }],
        note: { vi: `Xuất phát ở t=${departTime}, lượt này mất ${moveCost} giây, nên ĐẾN (${nr},${nc}) ở t=${nextTime}.`, en: `Depart at t=${departTime}; this move takes ${moveCost} second(s), so ARRIVAL at (${nr},${nc}) is t=${nextTime}.` },
      });

      const oldDist = dist[nr][nc];
      const improves = nextTime < oldDist;
      pushStep({
        title: improves
          ? { vi: `${nextTime} < ${formatTime(oldDist)}: tới sớm hơn`, en: `${nextTime} < ${formatTime(oldDist)}: earlier arrival` }
          : { vi: `${nextTime} < ${formatTime(oldDist)}? False`, en: `${nextTime} < ${formatTime(oldDist)}? False` },
        codeLine: 25,
        current: [nr, nc],
        vars: [{ name: "next_time", value: nextTime }, { name: `dist[${nr}][${nc}]`, value: formatTime(oldDist) }, { name: "condition", value: improves }],
        note: improves
          ? { vi: `Đường mới đến (${nr},${nc}) sớm hơn; cập nhật dist và parent.`, en: `The new route reaches (${nr},${nc}) earlier; update dist and parent.` }
          : { vi: `Đã có đường đến (${nr},${nc}) không chậm hơn; giữ nguyên.`, en: `A route already reaches (${nr},${nc}) no later; keep it.` },
      });
      if (!improves) continue;

      dist[nr][nc] = nextTime;
      parent[nr][nc] = [r, c];
      pushStep({
        title: { vi: `dist[${nr}][${nc}] = ${nextTime}`, en: `dist[${nr}][${nc}] = ${nextTime}` },
        codeLine: 26,
        current: [nr, nc],
        vars: [{ name: "dist", value: distStr() }, { name: "parent", value: `(${r}, ${c})` }],
        note: { vi: "Lưu thời điểm đến tốt hơn và parent để dựng đường cuối.", en: "Store the better arrival time and parent for final path reconstruction." },
      });

      heap.push([nextTime, nr, nc]);
      heap.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
      pushStep({
        title: { vi: `Push (${nextTime}, ${nr}, ${nc})`, en: `Push (${nextTime}, ${nr}, ${nc})` },
        codeLine: 27,
        current: [nr, nc],
        vars: [{ name: "heap", value: heapStr() }],
        note: { vi: "Push trạng thái mới để Dijkstra tiếp tục ưu tiên thời gian nhỏ nhất.", en: "Push the new state so Dijkstra keeps prioritizing the smallest time." },
      });
    }
  }

  if (!steps.at(-1).final) {
    pushStep({
      title: { vi: "Không thể tới phòng cuối", en: "Cannot reach the last room" },
      codeLine: 28,
      final: true,
      vars: [{ name: "answer", value: -1 }],
      note: { vi: "Heap đã rỗng mà đích chưa được pop, nên trả -1.", en: "The heap is empty without popping the target, so return -1." },
    });
  }

  return { original: moveTime, answer, steps };
}

// ─── 1377: Frog Position After T Seconds ───
function buildSteps1377(input, params) {
  const n = params.n || 5;
  const t = params.t || 2;
  const target = params.target || 3;
  // Parse edges from "u,v" pairs string
  const edgePairs = input ? input.split(";").map(s => s.split(",").map(Number)) : [[1,2],[1,3],[1,7],[2,4],[2,6],[3,5]];
  const original = edgePairs.map(e => e.join(",")).join(";");

  // Build adjacency list (undirected tree rooted at 1)
  const adj = Array.from({length: n + 1}, () => []);
  for (const [u, v] of edgePairs) { adj[u].push(v); adj[v].push(u); }

  const steps = [];
  const parent = new Array(n + 1).fill(0);
  const depth = new Array(n + 1).fill(0);
  const vis = new Array(n + 1).fill(false);
  const children = Array.from({length: n + 1}, () => []);
  // BFS to build tree from node 1
  const bfsQ = [1]; vis[1] = true;
  while (bfsQ.length > 0) {
    const u = bfsQ.shift();
    for (const v of adj[u]) {
      if (!vis[v]) { vis[v] = true; parent[v] = u; depth[v] = depth[u] + 1; children[u].push(v); bfsQ.push(v); }
    }
  }
  // Layered layout positions
  const nodePos = {}, levelNodes = {};
  for (let i = 1; i <= n; i++) { const d = depth[i]; if (!levelNodes[d]) levelNodes[d] = []; levelNodes[d].push(i); }
  for (const d of Object.keys(levelNodes)) {
    const nds = levelNodes[d], w = nds.length;
    nds.forEach((nd, idx) => { nodePos[nd] = {x: (idx + 1) / (w + 1), y: Number(d) * 0.2 + 0.1}; });
  }

  function buildTreeNodes(hlSet, probMap) {
    return Array.from({length: n}, (_, idx) => {
      const i = idx + 1, p = probMap[i] || 0;
      return {id: i, label: p > 0 ? `${i}(${p.toFixed(3)})` : `${i}`,
        x: nodePos[i].x, y: nodePos[i].y, parentId: parent[i] || null,
        isWord: false, hl: hlSet ? hlSet.has(i) : false};
    });
  }

  // Simulate BFS level by level, tracking probabilities
  const probArr = new Array(n + 1).fill(0);
  probArr[1] = 1;
  let frontier = [1];

  steps.push({
    title: {vi: "Khởi tạo: Ếch ở đỉnh 1", en: "Init: Frog at node 1"},
    arr: [], highlight: [], mark: [], codeLines: [],
    tree: {nodes: buildTreeNodes(new Set([1]), {1: 1})},
    vars: [{name: "t", value: t}, {name: "target", value: target}, {name: "prob[1]", value: 1}],
    note: {vi: `Ếch bắt đầu tại đỉnh 1 với xác suất = 1. Cần tìm P(đỉnh ${target}) sau ${t} giây.`,
           en: `Frog starts at node 1 with probability = 1. Find P(node ${target}) after ${t} seconds.`}
  });

  let answer = 0;
  for (let sec = 1; sec <= t; sec++) {
    const nextFrontier = [];
    const newProb = new Array(n + 1).fill(0);
    // Copy probs for nodes NOT in frontier (they stay if they have no children)
    for (let i = 1; i <= n; i++) newProb[i] = probArr[i];

    for (const u of frontier) {
      const ch = children[u];
      if (ch.length === 0) {
        // Frog stays, prob unchanged
      } else {
        newProb[u] = 0; // frog leaves
        for (const v of ch) {
          newProb[v] = probArr[u] / ch.length;
          nextFrontier.push(v);
        }
      }
    }
    for (let i = 1; i <= n; i++) probArr[i] = newProb[i];
    frontier = nextFrontier.length > 0 ? nextFrontier : frontier.filter(u => children[u].length === 0);

    const hlSet = new Set(frontier);
    const pm = {};
    for (let i = 1; i <= n; i++) if (probArr[i] > 0) pm[i] = probArr[i];

    steps.push({
      title: {vi: `Giây ${sec}`, en: `Second ${sec}`},
      arr: [], highlight: [], mark: [], codeLines: [],
      tree: {nodes: buildTreeNodes(hlSet, pm)},
      vars: [{name: "second", value: sec}, {name: `prob[${target}]`, value: probArr[target].toFixed(6)}],
      note: {vi: `Sau ${sec} giây, P(đỉnh ${target}) = ${probArr[target].toFixed(4)}.`,
             en: `After ${sec} seconds, P(node ${target}) = ${probArr[target].toFixed(4)}.`}
    });

    if (sec === t) answer = probArr[target];
  }

  // Format answer as fraction approximation
  const ansStr = answer > 0 ? answer.toFixed(6) : "0";
  steps.push({
    title: {vi: "Kết quả", en: "Result"},
    arr: [], highlight: [], mark: [], codeLines: [],
    tree: {nodes: buildTreeNodes(new Set([target]), {[target]: answer})},
    vars: [{name: "answer", value: ansStr}],
    note: {vi: `Xác suất ếch ở đỉnh ${target} sau ${t} giây = ${ansStr}.`,
           en: `Probability frog is at node ${target} after ${t} seconds = ${ansStr}.`}
  });

  return {original, answer: ansStr, steps};
}

// ─── 126: Word Ladder II ───
function parseWordLadder126(input, params = {}) {
  const beginWord = String(params.beginWord || "hit").trim();
  const endWord = String(params.endWord || "cog").trim();
  const rawWords = String(input || "hot,dot,dog,lot,log,cog")
    .split(",")
    .map(word => word.trim())
    .filter(Boolean);
  const wordList = [...new Set(rawWords)];
  const lowercaseWord = /^[a-z]+$/;

  if (!lowercaseWord.test(beginWord) || !lowercaseWord.test(endWord)) {
    throw new Error("beginWord and endWord must contain lowercase English letters only.");
  }
  if (beginWord === endWord) {
    throw new Error("beginWord and endWord must be different.");
  }
  if (wordList.length === 0 || wordList.length > 12) {
    throw new Error("Use 1 to 12 dictionary words so the ladder stays readable.");
  }
  if (beginWord.length > 8 || beginWord.length < 1) {
    throw new Error("Use words with 1 to 8 letters for the visualization.");
  }
  if (!wordList.every(word => lowercaseWord.test(word) && word.length === beginWord.length)
      || endWord.length !== beginWord.length) {
    throw new Error("Every word must use lowercase letters and have the same length.");
  }
  return { beginWord, endWord, wordList };
}

function buildSteps126(input, params = {}) {
  const { beginWord, endWord, wordList } = parseWordLadder126(input, params);
  const original = wordList.join(",");
  const allWords = [beginWord, ...wordList.filter(word => word !== beginWord)];
  const wordOrder = new Map(allWords.map((word, index) => [word, index]));
  const wordSet = new Set(wordList);
  const levels = { [beginWord]: 0 };
  const parents = {};
  const edges = [];
  const answers = [];
  const steps = [];
  let frontier = [beginWord];
  let nextFrontier = [];
  let layer = 0;
  let found = false;

  const differsByOne = (first, second) => {
    let changes = 0;
    let changedIndex = -1;
    for (let index = 0; index < first.length; index += 1) {
      if (first[index] !== second[index]) {
        changes += 1;
        changedIndex = index;
        if (changes > 1) return { matches: false, changedIndex: -1 };
      }
    }
    return { matches: changes === 1, changedIndex };
  };

  const availableNeighbors = word => [...wordSet]
    .map(candidate => ({ candidate, ...differsByOne(word, candidate) }))
    .filter(item => item.matches)
    .sort((first, second) => (wordOrder.get(first.candidate) ?? 999) - (wordOrder.get(second.candidate) ?? 999));

  const cloneParents = () => Object.fromEntries(
    Object.entries(parents).map(([word, list]) => [word, [...list]]),
  );

  const makeView = ({
    operation,
    phaseIndex,
    currentWord = null,
    candidateWord = null,
    changedIndex = -1,
    decision = null,
    backtrackPath = [],
    activeEdge = null,
  }) => ({
    operation,
    phaseIndex,
    beginWord,
    endWord,
    words: [...allWords],
    dictionary: [...wordList],
    levels: { ...levels },
    parents: cloneParents(),
    edges: edges.map(edge => ({ ...edge })),
    frontier: [...frontier],
    nextFrontier: [...nextFrontier],
    layer,
    currentWord,
    candidateWord,
    changedIndex,
    decision,
    found,
    backtrackPath: [...backtrackPath],
    activeEdge: activeEdge ? { ...activeEdge } : null,
    answers: answers.map(path => [...path]),
  });

  const snapshot = ({ title, note, codeLine, vars = [], final = false, ...view }) => {
    const currentIndex = view.currentWord ? allWords.indexOf(view.currentWord) : -1;
    const candidateIndex = view.candidateWord ? allWords.indexOf(view.candidateWord) : -1;
    steps.push({
      title,
      note,
      codeLines: [codeLine],
      final,
      arr: allWords.map(word => levels[word] ?? 0),
      sub: [...allWords],
      highlight: candidateIndex >= 0 ? [candidateIndex] : currentIndex >= 0 ? [currentIndex] : [],
      mark: currentIndex >= 0 && candidateIndex >= 0 ? [currentIndex] : [],
      vars: [
        { name: "layer", value: layer },
        { name: "frontier", value: `[${frontier.join(", ")}]` },
        { name: "found", value: found },
        ...vars,
      ],
      wordLadder126View: makeView(view),
    });
  };

  if (!wordSet.has(endWord)) {
    snapshot({
      operation: "missing-end",
      phaseIndex: 0,
      codeLine: 6,
      title: { vi: `Không có "${endWord}" trong từ điển`, en: `"${endWord}" is missing from the dictionary` },
      note: {
        vi: "Mọi từ sau beginWord phải nằm trong wordList, nên thiếu endWord đồng nghĩa không thể tạo đường đi.",
        en: "Every word after beginWord must be in wordList, so a missing endWord makes every path impossible.",
      },
      vars: [{ name: "return", value: "[]" }],
      final: true,
    });
    return { original, answer: [], steps };
  }

  snapshot({
    operation: "init",
    phaseIndex: 0,
    codeLine: 9,
    title: { vi: `Bắt đầu tại "${beginWord}"`, en: `Start at "${beginWord}"` },
    note: {
      vi: "BFS chỉ lưu frontier hiện tại và các cạnh parent. Không lưu cả path trong queue.",
      en: "BFS stores only the current frontier and parent edges—not complete paths in the queue.",
    },
    vars: [{ name: "beginWord", value: beginWord }, { name: "endWord", value: endWord }],
  });

  while (frontier.length > 0 && !found) {
    snapshot({
      operation: "layer-check",
      phaseIndex: 1,
      codeLine: 11,
      title: { vi: `Mở BFS layer ${layer}`, en: `Open BFS layer ${layer}` },
      note: {
        vi: `Tất cả từ trong frontier đều cách beginWord đúng ${layer} bước. Ta phải xử lý hết layer trước khi dừng.`,
        en: `Every frontier word is exactly ${layer} steps from beginWord. We must finish the whole layer before stopping.`,
      },
    });

    for (const word of frontier) wordSet.delete(word);
    snapshot({
      operation: "remove-layer",
      phaseIndex: 1,
      codeLine: 12,
      title: { vi: "Khóa các layer cũ", en: "Lock the older layers" },
      note: {
        vi: "Xóa frontier khỏi word_set để không đi ngược về layer cũ; các từ của next_layer vẫn còn để nhận nhiều parent.",
        en: "Remove the frontier from word_set to prevent backward edges; next-layer words remain available to collect multiple parents.",
      },
    });

    const nextLayer = new Set();
    nextFrontier = [];
    snapshot({
      operation: "next-layer",
      phaseIndex: 1,
      codeLine: 13,
      title: { vi: `Tạo layer ${layer + 1} rỗng`, en: `Create empty layer ${layer + 1}` },
      note: { vi: "Từ mới sẽ được gom vào đây.", en: "Newly reached words will be collected here." },
    });

    for (const word of frontier) {
      snapshot({
        operation: "scan-word",
        phaseIndex: 1,
        currentWord: word,
        codeLine: 14,
        title: { vi: `Mở rộng "${word}"`, en: `Expand "${word}"` },
        note: {
          vi: "Thử thay từng vị trí bằng a..z; visualization chỉ hiện các kết quả thật sự có trong word_set.",
          en: "Try a..z at each position; the visualization shows only candidates that actually exist in word_set.",
        },
        vars: [{ name: "word", value: word }],
      });

      for (const { candidate, changedIndex } of availableNeighbors(word)) {
        const alreadyInNextLayer = nextLayer.has(candidate);
        snapshot({
          operation: "candidate",
          phaseIndex: 1,
          currentWord: word,
          candidateWord: candidate,
          changedIndex,
          decision: alreadyInNextLayer ? "same-layer-parent" : "discover",
          activeEdge: { from: word, to: candidate },
          codeLine: 18,
          title: { vi: `"${word}" → "${candidate}" hợp lệ`, en: `"${word}" → "${candidate}" is valid` },
          note: {
            vi: `Chỉ ký tự thứ ${changedIndex + 1} thay đổi và "${candidate}" vẫn còn trong word_set.`,
            en: `Only character ${changedIndex + 1} changes, and "${candidate}" is still in word_set.`,
          },
          vars: [{ name: "new_word", value: candidate }, { name: "changed index", value: changedIndex }],
        });

        nextLayer.add(candidate);
        if (!alreadyInNextLayer) {
          nextFrontier.push(candidate);
          levels[candidate] = layer + 1;
        }
        if (!parents[candidate]) parents[candidate] = [];
        if (!parents[candidate].includes(word)) {
          parents[candidate].push(word);
          parents[candidate].sort((first, second) => (wordOrder.get(first) ?? 999) - (wordOrder.get(second) ?? 999));
          edges.push({ from: word, to: candidate });
        }
        snapshot({
          operation: alreadyInNextLayer ? "add-parent" : "discover",
          phaseIndex: 2,
          currentWord: word,
          candidateWord: candidate,
          changedIndex,
          decision: alreadyInNextLayer ? "same-layer-parent" : "discover",
          activeEdge: { from: word, to: candidate },
          codeLine: 20,
          title: alreadyInNextLayer
            ? { vi: `Thêm parent thứ ${parents[candidate].length} cho "${candidate}"`, en: `Add parent ${parents[candidate].length} for "${candidate}"` }
            : { vi: `Đưa "${candidate}" vào layer ${layer + 1}`, en: `Place "${candidate}" in layer ${layer + 1}` },
          note: alreadyInNextLayer
            ? {
                vi: `Không enqueue lần nữa, nhưng phải giữ cạnh ${word} → ${candidate}; cạnh này có thể tạo thêm một đáp án ngắn nhất.`,
                en: `Do not enqueue it again, but keep ${word} → ${candidate}; this edge may produce another shortest answer.`,
              }
            : {
                vi: `Đây là lần đầu "${candidate}" xuất hiện ở khoảng cách ${layer + 1}.`,
                en: `This is the first time "${candidate}" is reached at distance ${layer + 1}.`,
              },
          vars: [{ name: `parents[${candidate}]`, value: `[${parents[candidate].join(", ")}]` }],
        });

        if (candidate === endWord) {
          found = true;
          snapshot({
            operation: "found-end",
            phaseIndex: 2,
            currentWord: word,
            candidateWord: candidate,
            changedIndex,
            decision: "found",
            activeEdge: { from: word, to: candidate },
            codeLine: 22,
            title: { vi: `Đã chạm endWord "${endWord}"`, en: `Reached endWord "${endWord}"` },
            note: {
              vi: "Đánh dấu found nhưng vẫn xử lý hết frontier hiện tại để giữ mọi parent ngắn nhất khác của endWord.",
              en: "Set found, but finish the current frontier so every other shortest parent of endWord is preserved.",
            },
          });
        }
      }
    }

    frontier = [...nextFrontier];
    layer += 1;
    snapshot({
      operation: "finish-layer",
      phaseIndex: 2,
      codeLine: 23,
      title: { vi: `Chốt BFS layer ${layer}`, en: `Finish BFS layer ${layer}` },
      note: found
        ? {
            vi: `Layer chứa "${endWord}" đã hoàn tất. Mọi cạnh trong DAG bây giờ đều thuộc một đường đi ngắn nhất tiềm năng.`,
            en: `The layer containing "${endWord}" is complete. Every DAG edge now belongs to a potential shortest path.`,
          }
        : {
            vi: `Frontier tiếp theo: [${frontier.join(", ")}].`,
            en: `Next frontier: [${frontier.join(", ")}].`,
          },
    });
  }

  if (!found) {
    snapshot({
      operation: "no-path",
      phaseIndex: 4,
      codeLine: 25,
      title: { vi: "BFS kết thúc mà không thấy endWord", en: "BFS ended without reaching endWord" },
      note: { vi: "Không tồn tại chuỗi biến đổi hợp lệ.", en: "No valid transformation sequence exists." },
      vars: [{ name: "return", value: "[]" }],
      final: true,
    });
    return { original, answer: [], steps };
  }

  snapshot({
    operation: "dfs-start",
    phaseIndex: 3,
    backtrackPath: [endWord],
    codeLine: 26,
    title: { vi: "BFS xong: bắt đầu đi ngược DAG", en: "BFS complete: walk backward through the DAG" },
    note: {
      vi: `BFS đảm bảo DAG chỉ giữ cạnh giữa hai layer liên tiếp. DFS đi từ "${endWord}" về "${beginWord}" để dựng từng đáp án.`,
      en: `BFS guarantees that the DAG keeps only edges between consecutive layers. DFS walks from "${endWord}" back to "${beginWord}" to build each answer.`,
    },
  });

  function reconstruct(word, backwardPath) {
    snapshot({
      operation: "dfs-enter",
      phaseIndex: 3,
      currentWord: word,
      backtrackPath: backwardPath,
      codeLine: 27,
      title: { vi: `DFS đang ở "${word}"`, en: `DFS is at "${word}"` },
      note: {
        vi: `Path tạm đang đi ngược: ${backwardPath.join(" ← ")}.`,
        en: `The temporary path runs backward: ${backwardPath.join(" ← ")}.`,
      },
    });

    if (word === beginWord) {
      const completePath = [...backwardPath].reverse();
      answers.push(completePath);
      snapshot({
        operation: "emit-path",
        phaseIndex: 4,
        currentWord: word,
        backtrackPath: backwardPath,
        codeLine: 29,
        title: { vi: `Lưu đáp án #${answers.length}`, en: `Save answer #${answers.length}` },
        note: {
          vi: completePath.join(" → "),
          en: completePath.join(" → "),
        },
        vars: [{ name: "path", value: `[${completePath.join(", ")}]` }],
      });
      return;
    }

    for (const parent of parents[word] || []) {
      const nextPath = [...backwardPath, parent];
      snapshot({
        operation: "choose-parent",
        phaseIndex: 3,
        currentWord: word,
        candidateWord: parent,
        decision: "backtrack",
        backtrackPath: nextPath,
        activeEdge: { from: parent, to: word },
        codeLine: 32,
        title: { vi: `Chọn parent "${parent}" của "${word}"`, en: `Choose parent "${parent}" of "${word}"` },
        note: {
          vi: `Đi ngược cạnh ${parent} → ${word}.`,
          en: `Follow the edge ${parent} → ${word} backward.`,
        },
      });
      reconstruct(parent, nextPath);
      snapshot({
        operation: "backtrack",
        phaseIndex: 3,
        currentWord: word,
        candidateWord: parent,
        decision: "backtrack",
        backtrackPath: backwardPath,
        activeEdge: { from: parent, to: word },
        codeLine: 34,
        title: { vi: `Quay lại "${word}"`, en: `Backtrack to "${word}"` },
        note: {
          vi: `Bỏ "${parent}" khỏi path tạm để thử parent tiếp theo.`,
          en: `Remove "${parent}" from the temporary path and try the next parent.`,
        },
      });
    }
  }

  reconstruct(endWord, [endWord]);
  snapshot({
    operation: "done",
    phaseIndex: 4,
    codeLine: 36,
    title: { vi: `Hoàn tất: ${answers.length} đường ngắn nhất`, en: `Complete: ${answers.length} shortest paths` },
    note: {
      vi: `Mỗi đường có ${answers[0]?.length || 0} từ; BFS quyết định độ ngắn nhất, DFS chỉ liệt kê các đường trong parent DAG.`,
      en: `Every path has ${answers[0]?.length || 0} words; BFS guarantees shortestness, while DFS only enumerates paths in the parent DAG.`,
    },
    vars: [{ name: "path_count", value: answers.length }, { name: "path_length", value: answers[0]?.length || 0 }],
    final: true,
  });

  return { original, answer: answers.map(path => [...path]), steps };
}

// ─── 815: Bus Routes ───
function buildSteps815(input, params) {
  const source = params.source != null ? params.source : 1;
  const target = params.target != null ? params.target : 6;
  // Parse routes: "1,2,7|3,6,7" or "1,2,7;3,6,7" → [[1,2,7],[3,6,7]]
  const sep = input && input.includes("|") ? "|" : ";";
  const routes = input ? input.split(sep).map(s => s.split(",").map(Number)) : [[1,2,7],[3,6,7]];
  const original = routes.map(r => r.join(",")).join(";");
  const steps = [];

  if (source === target) {
    steps.push({
      title: {vi: "source = target", en: "source = target"},
      arr: routes.map((_, i) => i), sub: routes.map(r => r.join(",")),
      highlight: [], mark: [], codeLines: [],
      vars: [{name: "answer", value: 0}],
      note: {vi: "Nguồn và đích trùng nhau, đáp án = 0.", en: "Source equals target, answer = 0."}
    });
    return {original, answer: 0, steps};
  }

  // Build stop → routes map
  const stopToRoutes = {};
  for (let i = 0; i < routes.length; i++) {
    for (const stop of routes[i]) {
      if (!stopToRoutes[stop]) stopToRoutes[stop] = [];
      stopToRoutes[stop].push(i);
    }
  }

  const routeLabels = routes.map((r, i) => `R${i}:[${r.join(",")}]`);
  steps.push({
    title: {vi: "Khởi tạo BFS trên tuyến xe", en: "Initialize BFS on bus routes"},
    arr: routes.map((_, i) => i), sub: routeLabels,
    highlight: [], mark: [], codeLines: [],
    vars: [{name: "source", value: source}, {name: "target", value: target}, {name: "routes", value: routes.length}],
    note: {vi: `Tìm số xe buýt ít nhất từ trạm ${source} đến trạm ${target}. Có ${routes.length} tuyến.`,
           en: `Find minimum buses from stop ${source} to stop ${target}. ${routes.length} routes available.`}
  });

  // BFS on stops
  const visitedStops = new Set([source]);
  const visitedRoutes = new Set();
  let queue = [source];
  let answer = -1;
  let buses = 0;

  while (queue.length > 0 && steps.length < 18) {
    buses++;
    const nextStops = new Set();
    const exploredRoutes = [];
    for (const stop of queue) {
      for (const ri of (stopToRoutes[stop] || [])) {
        if (visitedRoutes.has(ri)) continue;
        visitedRoutes.add(ri);
        exploredRoutes.push(ri);
        for (const s of routes[ri]) {
          if (!visitedStops.has(s)) {
            visitedStops.add(s);
            nextStops.add(s);
            if (s === target) { answer = buses; break; }
          }
        }
        if (answer >= 0) break;
      }
      if (answer >= 0) break;
    }

    const hl = exploredRoutes;
    steps.push({
      title: {vi: `Đổi ${buses} xe`, en: `${buses} bus(es) taken`},
      arr: routes.map((_, i) => i), sub: routeLabels,
      highlight: hl, mark: [], codeLines: [],
      vars: [{name: "buses", value: buses}, {name: "new_stops", value: [...nextStops].join(",")},
             {name: "explored_routes", value: exploredRoutes.map(i => `R${i}`).join(",")}],
      note: {vi: `Sau ${buses} xe: khám phá tuyến [${exploredRoutes.map(i=>"R"+i).join(",")}], trạm mới: [${[...nextStops].join(",")}].`,
             en: `After ${buses} bus(es): explored routes [${exploredRoutes.map(i=>"R"+i).join(",")}], new stops: [${[...nextStops].join(",")}].`}
    });

    if (answer >= 0) break;
    queue = [...nextStops];
    if (queue.length === 0) break;
  }

  steps.push({
    title: {vi: "Kết quả", en: "Result"},
    arr: routes.map((_, i) => i), sub: routeLabels,
    highlight: [], mark: [...visitedRoutes], codeLines: [],
    vars: [{name: "answer", value: answer}],
    note: {vi: answer >= 0 ? `Cần ít nhất ${answer} xe buýt.` : `Không thể đến trạm ${target}.`,
           en: answer >= 0 ? `Minimum ${answer} bus(es) needed.` : `Cannot reach stop ${target}.`}
  });

  return {original, answer, steps};
}

module.exports = { buildSteps1293, buildSteps1368, buildSteps2290, buildSteps2577, buildSteps3341, buildSteps3342, buildSteps1377, parseWordLadder126, buildSteps126, buildSteps815 };
