// Auto-generated: do not edit headers manually.
// Module of LeetCode Visualizer — category-specific builders and problem entries.

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
 * Visualization: bar chart shows numbers 1..n, bars marked when in current.
 */
function buildSteps77(input, params) {
  const n = input[0];
  const k = params.k || 2;
  const steps = [];

  const numbers = Array.from({ length: n }, (_, i) => i + 1);
  const current = [];
  const results = [];

  // Helper: bar array — 1 if number is in current, 0 otherwise
  const barState = () => numbers.map((num) => (current.includes(num) ? 1 : 0));
  const numberLabels = () => numbers.map(String);
  const currentIdx = () => current.map((num) => num - 1);

  steps.push({
    title: { vi: "Khởi tạo", en: "Initialize" },
    arr: barState(),
    sub: numberLabels(),
    highlight: [],
    mark: [],
    codeLines: [3, 4],
    vars: [
      { name: "n", value: n },
      { name: "k", value: k },
      { name: "current", value: "[]" },
      { name: "result", value: "[]" },
    ],
    note: {
      vi: `Tìm tất cả tổ hợp ${k} số chọn từ [1..${n}].\nBacktracking: thêm 1 số → đệ quy → quay lui (pop).\nĐể tránh trùng: chỉ chọn số > số cuối trong current.`,
      en: `Find all combinations of ${k} numbers from [1..${n}].\nBacktracking: add one → recurse → backtrack (pop).\nTo avoid duplicates: only pick numbers > last in current.`,
    },
  });

  function backtrack(start, depth) {
    if (current.length === k) {
      results.push([...current]);
      steps.push({
        title: { vi: `✓ Tìm thấy: [${current.join(", ")}]`, en: `✓ Found: [${current.join(", ")}]` },
        arr: barState(),
        sub: numberLabels(),
        highlight: [],
        mark: currentIdx(),
        codeLines: [7, 8, 9],
        vars: [
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "len == k", value: true },
          { name: "results count", value: results.length },
          { name: "all results", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
        ],
        note: {
          vi: `len(current) == k → lưu [${current.join(", ")}] vào result. Tổng cộng: ${results.length} tổ hợp.`,
          en: `len(current) == k → save [${current.join(", ")}] to result. Total so far: ${results.length} combinations.`,
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
      steps.push({
        title: { vi: `Thêm ${i}: current = [${current.join(", ")}]`, en: `Add ${i}: current = [${current.join(", ")}]` },
        arr: barState(),
        sub: numberLabels(),
        highlight: [i - 1],
        mark: currentIdx().slice(0, -1),
        codeLines: [10, 11, 12],
        vars: [
          { name: "i (pick)", value: i },
          { name: "start", value: start },
          { name: "current", value: `[${current.join(", ")}]` },
          { name: "depth", value: depth + 1 },
        ],
        note: {
          vi: `Chọn ${i} ∈ [${start}..${n}], thêm vào current → đệ quy với start = ${i + 1}.`,
          en: `Pick ${i} from [${start}..${n}], add to current → recurse with start = ${i + 1}.`,
        },
      });

      backtrack(i + 1, depth + 1);

      const popped = current.pop();
      steps.push({
        title: { vi: `Quay lui: bỏ ${popped}`, en: `Backtrack: pop ${popped}` },
        arr: barState(),
        sub: numberLabels(),
        highlight: [],
        mark: currentIdx(),
        codeLines: [13],
        vars: [
          { name: "popped", value: popped },
          { name: "current", value: `[${current.join(", ")}]` },
        ],
        note: {
          vi: `Quay lui: bỏ ${popped} khỏi current. Thử số tiếp theo trong vòng for.`,
          en: `Backtrack: remove ${popped} from current. Try next number in the for-loop.`,
        },
      });
    }
  }

  backtrack(1, 0);

  // Final summary
  steps.push({
    title: { vi: `Kết quả: ${results.length} tổ hợp`, en: `Result: ${results.length} combinations` },
    arr: numbers.map(() => 0),
    sub: numberLabels(),
    highlight: [],
    mark: [],
    final: true,
    codeLines: [15, 16],
    vars: [
      { name: "C(n, k)", value: `C(${n},${k}) = ${results.length}` },
      { name: "all results", value: results.map((r) => `[${r.join(",")}]`).join(", ") },
    ],
    note: {
      vi: `Tổng cộng ${results.length} tổ hợp = C(${n},${k}).\nDanh sách: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
      en: `Total ${results.length} combinations = C(${n},${k}).\nList: ${results.map((r) => `[${r.join(",")}]`).join(", ")}.`,
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

module.exports = {
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
    builder: buildSteps51,
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
    builder: buildSteps52,
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
    builder: buildSteps46,
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
    builder: buildSteps78,
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
    builder: buildSteps90,
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
    builder: buildSteps39,
  },
};
